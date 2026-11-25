(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/HeroKitsPart1 ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/HeroKitsPart1", function(require, module, exports) {
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
    get PART4_HERO_IDS_A_TO_K () {
        return PART4_HERO_IDS_A_TO_K;
    },
    get executePart4HeroSkill () {
        return executePart4HeroSkill;
    },
    get findNearestWallPointAlongRay () {
        return findNearestWallPointAlongRay;
    },
    get isHeroNearWall () {
        return isHeroNearWall;
    },
    get stepPart4HeroPassives () {
        return stepPart4HeroPassives;
    }
});
var _mapData = require("../data/mapData");
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
var PART4_HERO_IDS_A_TO_K = [
    'aamon',
    'akai',
    'aldous',
    'alice',
    'alpha',
    'alucard',
    'angela',
    'argus',
    'arlott',
    'atlas',
    'aulus',
    'aurora',
    'badang',
    'balmond',
    'bane',
    'barats',
    'baxia',
    'beatrix',
    'belerick',
    'benedetta',
    'brody',
    'bruno',
    'carmilla',
    'cecilion',
    'chang_e',
    'chip',
    'chou',
    'cici',
    'claude',
    'clint',
    'cyclops',
    'diggie',
    'dyrroth',
    'edith',
    'esmeralda',
    'estes',
    'eudora',
    'fanny',
    'faramis',
    'floryn',
    'franco',
    'fredrinn',
    'freya',
    'gatotkaca',
    'gloo',
    'gord',
    'granger',
    'grock',
    'guinevere',
    'gusion',
    'hanabi',
    'hanzo',
    'harith',
    'harley',
    'hayabusa',
    'helcurt',
    'hilda',
    'hirara',
    'hylos',
    'irithel',
    'ixia',
    'jawhead',
    'johnson',
    'joy',
    'julian',
    'kadita'
];
function findNearestWallPointAlongRay(startX, startY, angle, maxRange, tempWalls) {
    if (tempWalls === void 0) tempWalls = [];
    var walls = (0, _mapData.getActiveMapWalls)();
    var steps = 16;
    for(var i = 2; i <= steps; i++){
        var d = maxRange / steps * i;
        var px = startX + Math.cos(angle) * d;
        var py = startY + Math.sin(angle) * d;
        if (px <= 65 || px >= _mapData.WORLD_SIZE - 65 || py <= 65 || py >= _mapData.WORLD_SIZE - 65) {
            return {
                x: (0, _CombatMath.clamp)(px, 65, _mapData.WORLD_SIZE - 65),
                y: (0, _CombatMath.clamp)(py, 65, _mapData.WORLD_SIZE - 65)
            };
        }
        for(var _iterator = _create_for_of_iterator_helper_loose(walls), _step; !(_step = _iterator()).done;){
            var w = _step.value;
            if (px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h) {
                return {
                    x: px,
                    y: py
                };
            }
        }
        for(var _iterator1 = _create_for_of_iterator_helper_loose(tempWalls), _step1; !(_step1 = _iterator1()).done;){
            var tw = _step1.value;
            if (px >= tw.x && px <= tw.x + tw.w && py >= tw.y && py <= tw.y + tw.h) {
                return {
                    x: px,
                    y: py
                };
            }
        }
    }
    return null;
}
function isHeroNearWall(x, y, threshold, tempWalls) {
    if (threshold === void 0) threshold = 110;
    if (tempWalls === void 0) tempWalls = [];
    if (x < threshold || x > _mapData.WORLD_SIZE - threshold || y < threshold || y > _mapData.WORLD_SIZE - threshold) return true;
    for(var _iterator = _create_for_of_iterator_helper_loose((0, _mapData.getActiveMapWalls)()), _step; !(_step = _iterator()).done;){
        var w = _step.value;
        var cx = (0, _CombatMath.clamp)(x, w.x, w.x + w.w);
        var cy = (0, _CombatMath.clamp)(y, w.y, w.y + w.h);
        if ((0, _CombatMath.dist)(x, y, cx, cy) <= threshold) return true;
    }
    for(var _iterator1 = _create_for_of_iterator_helper_loose(tempWalls), _step1; !(_step1 = _iterator1()).done;){
        var tw = _step1.value;
        var cx1 = (0, _CombatMath.clamp)(x, tw.x, tw.x + tw.w);
        var cy1 = (0, _CombatMath.clamp)(y, tw.y, tw.y + tw.h);
        if ((0, _CombatMath.dist)(x, y, cx1, cy1) <= threshold) return true;
    }
    return false;
}
function executePart4HeroSkill(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, helpers) {
    var hid = caster.heroDef.id;
    var callbacks = ctx.callbacks, heroes = ctx.heroes, jungleMobs = ctx.jungleMobs;
    var clampedDist = (0, _CombatMath.clamp)(aimDist || skill.range * 0.68, 65, Math.max(95, skill.range));
    var tx = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * clampedDist, 70, _mapData.WORLD_SIZE - 70);
    var ty = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * clampedDist, 70, _mapData.WORLD_SIZE - 70);
    var elem = (0, _VfxSystem.getHeroElement)(hid, caster.role);
    var emitTrail = function emitTrail(fx, fy, ex, ey, count) {
        if (count === void 0) count = 4;
        (0, _VfxSystem.spawnElementalTrailVfx)(callbacks, elem, fx, fy, ex, ey, count);
    };
    // 1. AAMON — Camo + Homing Shards + Converging Execute Storm
    if (hid === 'aamon') {
        if (slot === 1) {
            caster.passiveStacks = Math.min(5, caster.passiveStacks + 2);
            var tgt = helpers.findNearestEnemy(skill.range);
            if (tgt) {
                for(var i = 0; i < 3; i++){
                    callbacks.spawnProjectile({
                        ownerId: caster.id,
                        team: caster.team,
                        x: caster.x + (i - 1) * 18,
                        y: caster.y,
                        vx: 0,
                        vy: 0,
                        radius: 18,
                        rangeLeft: skill.range + 120,
                        damage: dmg * 0.42,
                        damageType: 'magic',
                        color: '#38BDF8',
                        kind: 'orb_stun',
                        homingTargetId: tgt.id,
                        life: 1.2,
                        maxLife: 1.2
                    });
                }
            } else {
                helpers.hitCircle(tx, ty, 130, dmg, 'magic');
            }
            caster.stealthTimer = Math.max(caster.stealthTimer, 2.2);
            callbacks.healHero(caster, 120 + caster.magicPow * 0.25, caster);
        } else if (slot === 2) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 980,
                vy: Math.sin(aimAngle) * 980,
                radius: 26,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#818CF8',
                kind: 'boomerang',
                pierce: true,
                returning: false,
                life: 1.5,
                maxLife: 1.5
            });
            caster.stealthTimer = Math.max(caster.stealthTimer, 3.0);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = 2.5;
        } else {
            var tgt1 = helpers.findNearestEnemy(skill.range);
            var bx = tgt1 ? tgt1.x : tx;
            var by = tgt1 ? tgt1.y : ty;
            var shards = 6 + caster.passiveStacks * 2;
            caster.passiveStacks = 0;
            var missingMult = tgt1 ? 1 + (1 - tgt1.hp / tgt1.maxHp) * 0.55 : 1;
            for(var i1 = 0; i1 < Math.min(10, shards); i1++){
                var a = i1 * Math.PI * 2 / Math.min(10, shards);
                callbacks.spawnVfx({
                    kind: 'shard',
                    x: bx + Math.cos(a) * 110,
                    y: by + Math.sin(a) * 110,
                    radius: 110,
                    color: '#38BDF8',
                    ttl: 0.55,
                    maxTtl: 0.55,
                    angle: a + Math.PI
                });
            }
            callbacks.spawnVfx({
                kind: 'burst',
                x: bx,
                y: by,
                radius: 175,
                color: '#6366F1',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(bx, by, 170, dmg * missingMult, 'magic');
        }
        emitTrail(caster.x, caster.y, tx, ty);
        return true;
    }
    // 2. AKAI — Tai Chi Shield + Headbutt + Spinning Knockback Wall-Pin
    if (hid === 'akai') {
        callbacks.grantShield(caster, 180 + caster.maxHp * 0.05);
        if (slot === 1) {
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.3;
            caster.dashWallCross = true;
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'airborne', 0.65);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#34D399',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(caster.x, caster.y, 185, dmg + caster.maxHp * 0.04, 'physical', 'slow', 1.8, function(h) {
                h.markedTimer = 4.0;
                h.markedBy = caster.id;
            });
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 3.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 3.2;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 175,
                color: '#FACC15',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(caster.x, caster.y, 175, dmg, 'physical', 'knockback', 0.9, function(h) {
                var pushAng = Math.atan2(h.y - caster.y, h.x - caster.x);
                helpers.displaceWithWallPin(h, pushAng, 165, caster, 180 + caster.physAtk * 0.5, 1.35);
            });
        }
        return true;
    }
    // 3. ALDOUS — Infinite Stacking Soul Steal Punch + Stun Shield + Global Reveal Chase Fate
    if (hid === 'aldous') {
        if (slot === 1) {
            caster.passiveStacks = Math.min(500, caster.passiveStacks + 6);
            var stackBonus = caster.passiveStacks * 6;
            callbacks.grantShield(caster, 140 + caster.level * 22);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 130,
                color: '#F59E0B',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 115, caster.y + Math.sin(aimAngle) * 115, 135, dmg + stackBonus, 'physical');
            return true;
        }
        if (slot === 2) {
            callbacks.grantShield(caster, 280 + caster.maxHp * 0.08);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.3);
            caster.speedBoostTimer = 2.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 190,
                color: '#FACC15',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(caster.x, caster.y, 190, dmg, 'physical', 'stun', 1.0);
            return true;
        }
        return false; // Ult handled by Global Reveal block in SkillPhysics
    }
    // 4. ALICE — Flowing Blood Orb Snapback Blink + Root + Toggle Blood Ode
    if (hid === 'alice') {
        if (slot === 1) {
            if (isRecast && caster.snapbackAnchor) {
                var ax = caster.snapbackAnchor.x;
                var ay = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 75,
                    color: '#E11D48',
                    ttl: 0.35,
                    maxTtl: 0.35
                });
                caster.x = ax;
                caster.y = ay;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: ax,
                    y: ay,
                    radius: 105,
                    color: '#FB7185',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
            } else {
                caster.snapbackAnchor = {
                    x: tx,
                    y: ty,
                    ttl: 3.0,
                    slot: 1
                };
                caster.recastSlot = 1;
                caster.recastTimer = 3.0;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 840,
                    vy: Math.sin(aimAngle) * 840,
                    radius: 34,
                    rangeLeft: skill.range,
                    damage: dmg,
                    damageType: 'magic',
                    color: '#E11D48',
                    kind: 'skill_line',
                    pierce: true,
                    life: 1.2,
                    maxLife: 1.2
                });
            }
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#F43F5E',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(caster.x, caster.y, 185, dmg + caster.maxHp * 0.04, 'magic', 'root', 1.2);
        } else {
            caster.toggleAuraTimer = caster.toggleAuraTimer > 0 ? 0 : 6.0;
            caster.toggleAuraKind = caster.toggleAuraTimer > 0 ? 'alice' : null;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#BE123C',
                ttl: 0.7,
                maxTtl: 0.7
            });
            var hits = helpers.hitCircle(caster.x, caster.y, 220, dmg * 0.45, 'magic');
            if (hits > 0) callbacks.healHero(caster, 180 + hits * 95 + caster.magicPow * 0.35, caster);
        }
        return true;
    }
    // 5. ALPHA — Beta 2-Mark True Damage Laser + Heal Fan + Spear Drag Slam
    if (hid === 'alpha') {
        var markAndBeta = function markAndBeta(h) {
            if (h.markedTimer > 0 && h.markedBy === caster.id) {
                h.markedTimer = 0;
                callbacks.dealDamageToHero(caster, h, 140 + caster.physAtk * 0.65, 'true', false, false, 'Beta, Advance!');
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: h.x,
                    ty: h.y,
                    radius: 18,
                    color: '#38BDF8',
                    ttl: 0.3,
                    maxTtl: 0.3
                });
            } else {
                h.markedTimer = 4.0;
                h.markedBy = caster.id;
            }
        };
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 55,
                color: '#38BDF8',
                ttl: 0.35,
                maxTtl: 0.35,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 130, dmg, 'physical', 'slow', 1.2, markAndBeta);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 190,
                color: '#0EA5E9',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            var hits1 = helpers.hitCircle(caster.x + Math.cos(aimAngle) * 115, caster.y + Math.sin(aimAngle) * 115, 160, dmg, 'physical', undefined, undefined, markAndBeta);
            if (hits1 > 0) callbacks.healHero(caster, 190 + hits1 * 110 + caster.physAtk * 0.4, caster);
        } else {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.34, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 175,
                color: '#38BDF8',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(tx, ty, 175, dmg, 'physical', 'airborne', 1.1, markAndBeta);
        }
        return true;
    }
    // 8. ARGUS — Demonic Grip Pull+Blink + Bleed Trail + 4s Eternal Evil Death Immunity
    if (hid === 'argus') {
        if (slot === 1) {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.28, true);
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'stun', 0.8);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 56,
                color: '#4ADE80',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', 'slow', 1.6);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 2.4;
        } else {
            if (caster.ccType && caster.ccType !== 'suppression') {
                caster.ccType = null;
                caster.ccTimer = 0;
            }
            caster.deathImmuneTimer = 4.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.0);
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 145,
                color: '#4ADE80',
                ttl: 0.75,
                maxTtl: 0.75
            });
        }
        return true;
    }
    // 9. ARLOTT — Demon Gaze Mark + Dash Reset on Marked + Sweeping Knockback
    if (hid === 'arlott') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 210,
                color: '#E11D48',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 145, dmg, 'physical', 'stun', 1.0, function(h) {
                h.markedTimer = 5.0;
                h.markedBy = caster.id;
            });
        } else if (slot === 2) {
            var tgt2 = helpers.findNearestEnemy(skill.range);
            var ang = tgt2 ? Math.atan2(tgt2.y - caster.y, tgt2.x - caster.x) : aimAngle;
            caster.dashVx = Math.cos(ang) * 1180;
            caster.dashVy = Math.sin(ang) * 1180;
            caster.dashTimer = 0.24;
            caster.dashWallCross = true;
            var reset = false;
            helpers.hitCircle(tgt2 ? tgt2.x : tx, tgt2 ? tgt2.y : ty, 125, dmg, 'physical', undefined, undefined, function(h) {
                if (h.markedTimer > 0) {
                    h.markedTimer = 0;
                    reset = true;
                    callbacks.dealDamageToHero(caster, h, dmg * 0.55, 'physical', false, true, 'Vengeance Crit');
                    callbacks.healHero(caster, 170 + caster.physAtk * 0.45, caster);
                }
            });
            if (reset) caster.skillCds[1] = 0.2;
        } else {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 260,
                color: '#F43F5E',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 200, dmg, 'physical', 'knockback', 0.9, function(h) {
                h.markedTimer = 5.0;
                h.markedBy = caster.id;
                helpers.displaceWithWallPin(h, aimAngle + Math.PI / 2, 130, caster, 120, 0.8);
            });
        }
        return true;
    }
    // 10. ATLAS — Frigid Freeze + Eject Merge Stun + Fatal Links Chain Slam
    if (hid === 'atlas') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(caster.x, caster.y, 185, dmg, 'magic', 'slow', 1.6);
        } else if (slot === 2) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
            caster.speedBoostTimer = 2.5;
            caster.dashVx = Math.cos(aimAngle) * 980;
            caster.dashVy = Math.sin(aimAngle) * 980;
            caster.dashTimer = 0.3;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 145,
                color: '#60A5FA',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(tx, ty, 145, dmg, 'magic', 'stun', 1.1);
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.4);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 265,
                color: '#38BDF8',
                ttl: 0.75,
                maxTtl: 0.75
            });
            var slamX = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 180, 80, _mapData.WORLD_SIZE - 80);
            var slamY = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 180, 80, _mapData.WORLD_SIZE - 80);
            helpers.hitCircle(caster.x, caster.y, 265, dmg, 'magic', 'airborne', 1.4, function(h) {
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: caster.x,
                    y: caster.y,
                    tx: h.x,
                    ty: h.y,
                    radius: 6,
                    color: '#38BDF8',
                    ttl: 0.65,
                    maxTtl: 0.65
                });
                h.x = (0, _CombatMath.clamp)(slamX + (Math.random() - 0.5) * 48, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(slamY + (Math.random() - 0.5) * 48, 80, _mapData.WORLD_SIZE - 80);
            });
        }
        return true;
    }
    // 11. AULUS — Fighting Spirit Stacks + Charge + Axe Cleave + Undying Fury Fire Fissure
    if (hid === 'aulus') {
        caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
        caster.passiveTimer = 5.0;
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = 3.0;
            callbacks.grantShield(caster, 240 + caster.level * 24);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 120,
                color: '#F97316',
                ttl: 0.4,
                maxTtl: 0.4
            });
        } else if (slot === 2) {
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 205,
                color: '#FB923C',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            var hits2 = helpers.hitCircle(tx, ty, 155, dmg, 'physical');
            if (hits2 > 0) callbacks.healHero(caster, 140 + hits2 * 80, caster);
        } else {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 95,
                color: '#F97316',
                ttl: 0.75,
                maxTtl: 0.75,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 195, dmg, 'physical', 'slow', 2.0);
        }
        return true;
    }
    // 12. AURORA — Hailstone + Frosty Breeze Freeze + Frigid Glacier Shatter
    if (hid === 'aurora') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'magic', 'slow', 1.4);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 230,
                color: '#7DD3FC',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'magic', 'freeze', 1.25);
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 245,
                color: '#38BDF8',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(tx, ty, 245, dmg, 'magic', 'freeze', 1.6);
        }
        emitTrail(caster.x, caster.y, tx, ty, 5);
        return true;
    }
    // 13. BADANG — Fist Wind + Rock Wall Barrier + Fist Crack CC-Immune Barrage with Wall-Pin Stun
    if (hid === 'badang') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: 34,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#F59E0B',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.2,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1060;
            caster.dashVy = Math.sin(aimAngle) * 1060;
            caster.dashTimer = 0.28;
            caster.dashWallCross = true;
            callbacks.grantShield(caster, 320 + caster.physAtk * 0.9);
            var wx = (0, _CombatMath.clamp)(tx + Math.cos(aimAngle) * 80, 90, _mapData.WORLD_SIZE - 90);
            var wy = (0, _CombatMath.clamp)(ty + Math.sin(aimAngle) * 80, 90, _mapData.WORLD_SIZE - 90);
            callbacks.spawnTempWall == null ? void 0 : callbacks.spawnTempWall.call(callbacks, {
                id: "wall_badang_" + Math.round(ctx.matchTimeSec * 100) + "_" + Math.random().toString(36).slice(2, 6),
                x: wx - 70,
                y: wy - 28,
                w: 140,
                h: 56,
                color: '#D97706',
                ttl: 4.0,
                maxTtl: 4.0,
                ownerId: caster.id
            });
            helpers.hitCircle(tx, ty, 130, dmg, 'physical', 'knockback', 0.5, function(h) {
                helpers.displaceWithWallPin(h, aimAngle, 95, caster, 140, 1.1);
            });
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.2);
            callbacks.grantShield(caster, 420 + caster.physAtk * 1.1);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 195,
                color: '#FACC15',
                ttl: 0.7,
                maxTtl: 0.7
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 140, caster.y + Math.sin(aimAngle) * 140, 185, dmg, 'physical', 'stun', 0.9, function(h) {
                helpers.displaceWithWallPin(h, aimAngle, 90, caster, 220, 1.2);
            });
        }
        return true;
    }
    // 14. BALMOND — Soul Lock + Cyclone Sweep + True Damage Execute Fan
    if (hid === 'balmond') {
        if (slot === 1) {
            caster.dashVx = Math.cos(aimAngle) * 980;
            caster.dashVy = Math.sin(aimAngle) * 980;
            caster.dashTimer = 0.28;
            caster.dashWallCross = true;
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'slow', 1.6);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#EF4444',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 195, dmg, 'physical');
        } else {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 260,
                color: '#EF4444',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 155, caster.y + Math.sin(aimAngle) * 155, 190, dmg, 'true', 'slow', 1.5, function(h) {
                var missingTrue = Math.round((h.maxHp - h.hp) * 0.2);
                callbacks.dealDamageToHero(caster, h, missingTrue, 'true', false, false, 'Lethal Counter');
            });
        }
        return true;
    }
    // 15. BANE — Bouncing Crab Claw + Ale Self-Heal Cone + Giant Shark Wave Knockup
    if (hid === 'bane') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: 28,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#38BDF8',
                kind: 'skill_line',
                pierce: true,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.healHero(caster, 240 + caster.maxHp * 0.08 + caster.magicPow * 0.8, caster);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.4);
            caster.speedBoostTimer = 2.5;
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 200,
                color: '#22D3EE',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'magic');
        } else {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 135,
                color: '#0284C7',
                ttl: 0.65,
                maxTtl: 0.65,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 200, dmg, 'magic', 'airborne', 1.0);
        }
        return true;
    }
    // 16. BARATS — Big Guy Dynamic Scaling (up to 1.45x!) + Oil/Fire + Pull Missiles + Suppress Swallow & Spit Wall Stun
    if (hid === 'barats') {
        caster.passiveStacks = Math.min(10, caster.passiveStacks + 2);
        caster.passiveTimer = 10.0;
        caster.modelScale = 1 + caster.passiveStacks * 0.045; // up to 1.45x giant dinosaur!
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 215,
                color: '#F97316',
                ttl: 0.5,
                maxTtl: 0.5,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 165, dmg + caster.maxHp * 0.06, 'physical', 'slow', 1.4);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 170,
                color: '#FB923C',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 170, dmg, 'physical', 'pull', 0.7, function(h) {
                var pullAng = Math.atan2(caster.y - h.y, caster.x - h.x);
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(pullAng) * 125, 70, _mapData.WORLD_SIZE - 70);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(pullAng) * 125, 70, _mapData.WORLD_SIZE - 70);
            });
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.0);
            var tgt3 = helpers.findNearestEnemy(skill.range);
            if (tgt3) {
                callbacks.applyCc(tgt3, 'suppression', 1.2, caster);
                callbacks.dealDamageToHero(caster, tgt3, dmg, 'physical', false, false, "Detona's Welcome");
                helpers.displaceWithWallPin(tgt3, aimAngle, 210, caster, 240 + caster.maxHp * 0.05, 1.2);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt3.x,
                    y: tgt3.y,
                    radius: 150,
                    color: '#F97316',
                    ttl: 0.65,
                    maxTtl: 0.65
                });
            } else {
                helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'suppression', 1.0);
            }
        }
        return true;
    }
    // 17. BAXIA — Anti-Heal Wheel Leap Stun + Resetting Shield Throw + Lava Trail
    if (hid === 'baxia') {
        if (slot === 1) {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.36, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#F97316',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'magic', 'stun', 1.0, function(h) {
                h.antiHealTimer = 4.0;
            });
        } else if (slot === 2) {
            var hitHero = false;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 42,
                color: '#FB923C',
                ttl: 0.3,
                maxTtl: 0.3,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 125, dmg + caster.maxHp * 0.04, 'magic', 'slow', 1.2, function(h) {
                hitHero = true;
                h.antiHealTimer = 4.0;
            });
            if (hitHero) caster.skillCds[1] = Math.min(caster.skillCds[1], 1.2);
        } else {
            caster.toggleAuraTimer = 6.0;
            caster.toggleAuraKind = 'baxia';
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 6.0;
            callbacks.grantShield(caster, 380 + caster.maxHp * 0.08);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 215,
                color: '#EF4444',
                ttl: 0.7,
                maxTtl: 0.7
            });
            helpers.hitCircle(caster.x, caster.y, 215, dmg * 0.55, 'magic', 'slow', 1.5, function(h) {
                h.antiHealTimer = 4.0;
            });
        }
        return true;
    }
    // 18. BEATRIX — 4 Swappable Weapons (0 Renner Sniper, 1 Bennett Grenade, 2 Wesker Shotgun, 3 Nibiru Dual-SMG) + 4 Ults!
    if (hid === 'beatrix') {
        if (slot === 1) {
            var _caster_beatrixGunIdx;
            caster.beatrixGunIdx = (((_caster_beatrixGunIdx = caster.beatrixGunIdx) != null ? _caster_beatrixGunIdx : 0) + 1) % 4;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = 1.6;
            var gunColors = [
                '#38BDF8',
                '#F97316',
                '#EF4444',
                '#FACC15'
            ];
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 85,
                color: gunColors[caster.beatrixGunIdx],
                ttl: 0.4,
                maxTtl: 0.4
            });
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1080;
            caster.dashVy = Math.sin(aimAngle) * 1080;
            caster.dashTimer = 0.24;
            caster.dashWallCross = false;
            caster.atkCd = 0; // instant reload!
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 95,
                color: '#FACC15',
                ttl: 0.3,
                maxTtl: 0.3,
                angle: aimAngle
            });
        } else {
            var _caster_beatrixGunIdx1;
            var gun = (_caster_beatrixGunIdx1 = caster.beatrixGunIdx) != null ? _caster_beatrixGunIdx1 : 0;
            if (gun === 0) {
                // Renner's Apathy — Ultra-long Piercing Sniper Beam
                var ex = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 980, 60, _mapData.WORLD_SIZE - 60);
                var ey = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 980, 60, _mapData.WORLD_SIZE - 60);
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: ex,
                    ty: ey,
                    radius: 64,
                    color: '#38BDF8',
                    ttl: 0.55,
                    maxTtl: 0.55,
                    angle: aimAngle
                });
                helpers.hitCircle(caster.x + Math.cos(aimAngle) * 460, caster.y + Math.sin(aimAngle) * 460, 210, dmg * 1.3, 'physical');
            } else if (gun === 1) {
                // Bennett's Rage — 5-Shell Artillery Carpet Bombardment
                for(var i2 = 0; i2 < 4; i2++){
                    var bx1 = (0, _CombatMath.clamp)(tx + (Math.random() - 0.5) * 180, 80, _mapData.WORLD_SIZE - 80);
                    var by1 = (0, _CombatMath.clamp)(ty + (Math.random() - 0.5) * 180, 80, _mapData.WORLD_SIZE - 80);
                    callbacks.spawnVfx({
                        kind: 'crater',
                        x: bx1,
                        y: by1,
                        radius: 135,
                        color: '#F97316',
                        ttl: 0.55,
                        maxTtl: 0.55
                    });
                    helpers.hitCircle(bx1, by1, 135, dmg * 0.45, 'physical', 'slow', 1.4);
                }
            } else if (gun === 2) {
                // Wesker's Elation — Point-blank Mega Shotgun Blast
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x + Math.cos(aimAngle) * 120,
                    y: caster.y + Math.sin(aimAngle) * 120,
                    radius: 195,
                    color: '#EF4444',
                    ttl: 0.5,
                    maxTtl: 0.5
                });
                helpers.hitCircle(caster.x + Math.cos(aimAngle) * 120, caster.y + Math.sin(aimAngle) * 120, 195, dmg * 1.4, 'physical');
            } else {
                // Nibiru's Passion — Wide 6-Bullet Fan SMG Volley
                for(var i3 = -2; i3 <= 2; i3++){
                    var a1 = aimAngle + i3 * 0.14;
                    callbacks.spawnProjectile({
                        ownerId: caster.id,
                        team: caster.team,
                        x: caster.x,
                        y: caster.y,
                        vx: Math.cos(a1) * 1040,
                        vy: Math.sin(a1) * 1040,
                        radius: 24,
                        rangeLeft: 620,
                        damage: dmg * 0.42,
                        damageType: 'physical',
                        color: '#FACC15',
                        kind: 'skill_line',
                        pierce: true,
                        life: 0.9,
                        maxLife: 0.9
                    });
                }
            }
        }
        return true;
    }
    // 19. BELERICK — Ancient Seed Taunt + Nature Strike Heal + Wrath of Dryad Huge AoE Taunt
    if (hid === 'belerick') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 75,
                color: '#22C55E',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 150, dmg, 'magic', 'taunt', 1.3, function(h) {
                h.tauntTargetId = caster.id;
            });
        } else if (slot === 2) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.55);
            caster.speedBoostTimer = 2.4;
            callbacks.healHero(caster, 240 + caster.maxHp * 0.08, caster);
            helpers.hitCircle(tx, ty, 130, dmg, 'magic', 'slow', 1.5);
        } else {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 290,
                color: '#10B981',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(caster.x, caster.y, 290, dmg, 'magic', 'taunt', 1.7, function(h) {
                h.tauntTargetId = caster.id;
            });
        }
        return true;
    }
    // 20. BENEDETTA — Phantom Slash + Eye for an Eye Parry Counter-Stun + Alecto Untargetable Slash Trail
    if (hid === 'benedetta') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#A855F7',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'slow', 1.0);
        } else if (slot === 2) {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.9);
            caster.physImmuneTimer = Math.max(caster.physImmuneTimer, 0.9);
            caster.dashVx = Math.cos(aimAngle) * 1120;
            caster.dashVy = Math.sin(aimAngle) * 1120;
            caster.dashTimer = 0.24;
            caster.dashWallCross = true;
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', 'stun', 1.35);
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.95);
            caster.dashVx = Math.cos(aimAngle) * 1240;
            caster.dashVy = Math.sin(aimAngle) * 1240;
            caster.dashTimer = 0.34;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 130,
                color: '#C084FC',
                ttl: 0.75,
                maxTtl: 0.75,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 195, dmg, 'physical', 'slow', 1.6);
        }
        return true;
    }
    // 21. BRODY — 4-Mark Abyss Stack + Corrosive Stun Flip + Torn-Apart Memory Execute
    if (hid === 'brody') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 960,
                vy: Math.sin(aimAngle) * 960,
                radius: 34,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#7C3AED',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.2,
                life: 1.0,
                maxLife: 1.0
            });
            caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
        } else if (slot === 2) {
            var tgt4 = helpers.findNearestEnemy(skill.range);
            if (tgt4) {
                callbacks.dealDamageToHero(caster, tgt4, dmg, 'physical', false, false, 'Corrosive Strike');
                callbacks.applyCc(tgt4, 'stun', 0.85, caster);
                tgt4.markedTimer = 6.0;
                tgt4.markedBy = caster.id;
                caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
                // Flip backward slightly
                caster.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 95, 70, _mapData.WORLD_SIZE - 70);
                caster.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 95, 70, _mapData.WORLD_SIZE - 70);
            }
        } else {
            var stacks = Math.max(1, caster.passiveStacks);
            caster.passiveStacks = 0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 520,
                color: '#8B5CF6',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 520, dmg + stacks * 110, 'physical', undefined, undefined, function(h) {
                var missing = Math.round((h.maxHp - h.hp) * (0.04 * stacks));
                callbacks.dealDamageToHero(caster, h, missing, 'physical', false, false, 'Torn-Apart Memory');
            });
        }
        return true;
    }
    // 22. BRUNO — Volley Shot Powerball + Slide Stun + 10-Bounce Armor-Shred Ball
    if (hid === 'bruno') {
        caster.passiveStacks = Math.min(10, caster.passiveStacks + 2);
        caster.passiveTimer = 5.0;
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: 28,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#38BDF8',
                kind: 'boomerang',
                returning: false,
                life: 1.5,
                maxLife: 1.5
            });
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1120;
            caster.dashVy = Math.sin(aimAngle) * 1120;
            caster.dashTimer = 0.25;
            caster.dashWallCross = true;
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'stun', 0.65);
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 195,
                color: '#FACC15',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(tx, ty, 200, dmg, 'physical', 'knockback', 0.6, function(h) {
                h.defShredFlat = Math.min(50, h.defShredFlat + 24);
                h.defShredTimer = 5.0;
            });
        }
        return true;
    }
    // 23. CARMILLA — Orbiting Healing Flowers + Speed Stun + Curse of Blood Linking up to 5 Enemies!
    if (hid === 'carmilla') {
        if (slot === 1) {
            caster.orbitBlades = 2;
            caster.orbitTimer = 5.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 160,
                color: '#E11D48',
                ttl: 0.55,
                maxTtl: 0.55
            });
            var hits3 = helpers.hitCircle(caster.x, caster.y, 160, dmg, 'magic', 'slow', 1.2);
            if (hits3 > 0) callbacks.healHero(caster, 150 + hits3 * 90 + caster.magicPow * 0.35, caster);
        } else if (slot === 2) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.6);
            caster.speedBoostTimer = 3.0;
            var tgt5 = helpers.findNearestEnemy(skill.range);
            if (tgt5) {
                callbacks.dealDamageToHero(caster, tgt5, dmg, 'magic', false, false, 'Bloodbath');
                callbacks.applyCc(tgt5, 'stun', 1.35, caster);
            }
        } else {
            var _loop = function() {
                var h = _step.value;
                h.carmillaLinkIds = linkIds.filter(function(id) {
                    return id !== h.id;
                });
                h.carmillaLinkTimer = 5.0;
            };
            var linked = [];
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 245,
                color: '#BE123C',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(tx, ty, 245, dmg, 'magic', 'slow', 2.0, function(h) {
                if (linked.length < 5) linked.push(h);
            });
            var linkIds = linked.map(function(h) {
                return h.id;
            });
            for(var _iterator = _create_for_of_iterator_helper_loose(linked), _step; !(_step = _iterator()).done;)_loop();
            for(var i4 = 0; i4 < linked.length - 1; i4++){
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: linked[i4].x,
                    y: linked[i4].y,
                    tx: linked[i4 + 1].x,
                    ty: linked[i4 + 1].y,
                    radius: 6,
                    color: '#FB7185',
                    ttl: 1.4,
                    maxTtl: 1.4
                });
            }
        }
        return true;
    }
    // 24. CECILION — Infinite Overflowing Stack + Escalating Bat Impact + Sanguine Pull/Root + Bats Feast
    if (hid === 'cecilion') {
        caster.passiveStacks = Math.min(999, caster.passiveStacks + 2);
        var manaBonus = caster.passiveStacks * 8 + caster.maxMana * 0.08;
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#BE123C',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg + manaBonus, 'magic');
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 165,
                color: '#E11D48',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'magic', 'vortex', 1.1, function(h) {
                var pullAng = Math.atan2(ty - h.y, tx - h.x);
                h.x += Math.cos(pullAng) * Math.min(110, (0, _CombatMath.dist)(tx, ty, h.x, h.y) * 0.65);
                h.y += Math.sin(pullAng) * Math.min(110, (0, _CombatMath.dist)(tx, ty, h.x, h.y) * 0.65);
            });
        } else {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
            caster.speedBoostTimer = 4.5;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 340,
                color: '#9F1239',
                ttl: 0.9,
                maxTtl: 0.9
            });
            var hits4 = helpers.hitCircle(caster.x, caster.y, 340, dmg + manaBonus * 0.5, 'magic', 'slow', 1.5);
            if (hits4 > 0) callbacks.healHero(caster, 260 + hits4 * 120 + caster.magicPow * 0.45, caster);
        }
        return true;
    }
    // 25. CHANG'E — Starmoon Spheres + Crescent Moon Shield/Speed + 30-Meteor Shower Barrage
    if (hid === 'chang_e') {
        if (slot === 1) {
            for(var i5 = -1; i5 <= 1; i5++){
                var a2 = aimAngle + i5 * 0.14;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a2) * 880,
                    vy: Math.sin(a2) * 880,
                    radius: 26,
                    rangeLeft: skill.range,
                    damage: dmg * 0.55,
                    damageType: 'magic',
                    color: '#FDE047',
                    kind: 'skill_line',
                    pierce: true,
                    ccType: 'slow',
                    ccDuration: 1.2,
                    life: 1.0,
                    maxLife: 1.0
                });
            }
        } else if (slot === 2) {
            callbacks.grantShield(caster, 420 + caster.magicPow * 1.1);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 5.0;
            caster.inspireTimer = Math.max(caster.inspireTimer, 5.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 105,
                color: '#FDE047',
                ttl: 0.5,
                maxTtl: 0.5
            });
        } else {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = 3.5;
            for(var i6 = 0; i6 < 6; i6++){
                var spread = (Math.random() - 0.5) * 0.16;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x + (Math.random() - 0.5) * 28,
                    y: caster.y + (Math.random() - 0.5) * 28,
                    vx: Math.cos(aimAngle + spread) * 1040,
                    vy: Math.sin(aimAngle + spread) * 1040,
                    radius: 22,
                    rangeLeft: 760,
                    damage: dmg * 0.32,
                    damageType: 'magic',
                    color: '#FACC15',
                    kind: 'skill_line',
                    life: 1.0,
                    maxLife: 1.0
                });
            }
        }
        return true;
    }
    // 26. CHIP — Crash Course Shield Slam + Overtime Hovercraft + Shortcut Global Portal
    if (hid === 'chip') {
        if (slot === 1) {
            callbacks.grantShield(caster, 300 + caster.maxHp * 0.08);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 175,
                color: '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(caster.x, caster.y, 175, dmg, 'magic', 'stun', 0.85);
        } else if (slot === 2) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.65);
            caster.speedBoostTimer = 2.6;
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.28;
            helpers.hitCircle(tx, ty, 130, dmg, 'magic', 'knockback', 0.7);
        } else {
            // Global Shortcut Portal — summons closest ally & blasts portal zone
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 205,
                color: '#38BDF8',
                ttl: 1.0,
                maxTtl: 1.0
            });
            var ally = heroes.find(function(h) {
                return h.alive && h.team === caster.team && h.id !== caster.id;
            });
            if (ally) {
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: ally.x,
                    y: ally.y,
                    radius: 95,
                    color: '#38BDF8',
                    ttl: 0.7,
                    maxTtl: 0.7
                });
                ally.x = (0, _CombatMath.clamp)(tx - 45, 80, _mapData.WORLD_SIZE - 80);
                ally.y = (0, _CombatMath.clamp)(ty - 45, 80, _mapData.WORLD_SIZE - 80);
                callbacks.grantShield(ally, 360 + caster.level * 30);
            }
            helpers.hitCircle(tx, ty, 195, dmg, 'magic', 'slow', 1.8);
        }
        return true;
    }
    // 27. CHOU — 3-Stage Jeet Kune Do + CC-Immune Shunpo + Way of Dragon Kick & Flying Combo
    if (hid === 'chou') {
        if (slot === 1) {
            caster.passiveStacks = (caster.passiveStacks + 1) % 3;
            caster.dashVx = Math.cos(aimAngle) * 960;
            caster.dashVy = Math.sin(aimAngle) * 960;
            caster.dashTimer = 0.22;
            var isThird = caster.passiveStacks === 0;
            if (isThird) caster.skillCds[1] = 0; // resets Shunpo!
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', isThird ? 'airborne' : 'slow', isThird ? 0.9 : 0.7);
            callbacks.spawnVfx({
                kind: isThird ? 'burst' : 'slash',
                x: tx,
                y: ty,
                radius: 130,
                color: '#FACC15',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
        } else if (slot === 2) {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.85);
            callbacks.grantShield(caster, 260 + caster.physAtk * 1.1);
            caster.dashVx = Math.cos(aimAngle) * 1120;
            caster.dashVy = Math.sin(aimAngle) * 1120;
            caster.dashTimer = 0.24;
            caster.dashWallCross = true;
        } else {
            var tgt6 = helpers.findNearestEnemy(skill.range);
            if (tgt6) {
                callbacks.dealDamageToHero(caster, tgt6, dmg, 'physical', false, false, 'Way of Dragon');
                callbacks.applyCc(tgt6, 'knockback', 1.1, caster);
                helpers.displaceWithWallPin(tgt6, aimAngle, 230, caster, 180, 1.0);
                caster.x = (0, _CombatMath.clamp)(tgt6.x - Math.cos(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                caster.y = (0, _CombatMath.clamp)(tgt6.y - Math.sin(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                callbacks.applyCc(tgt6, 'airborne', 1.0, caster);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt6.x,
                    y: tgt6.y,
                    radius: 145,
                    color: '#F59E0B',
                    ttl: 0.65,
                    maxTtl: 0.65
                });
            }
        }
        return true;
    }
    // 28. CICI — Free-Moving Yo-Yo Blitz + Parabolic Double Bounce + 2-Target Curtain Call Tether
    if (hid === 'cici') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = 2.6;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#FB7185',
                ttl: 0.55,
                maxTtl: 0.55
            });
            var hits5 = helpers.hitCircle(caster.x, caster.y, 230, dmg + caster.physAtk * 0.4, 'physical');
            if (hits5 > 0) callbacks.healHero(caster, 130 + hits5 * 65, caster);
        } else if (slot === 2) {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.34, true);
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'slow', 1.0);
        } else {
            var near = heroes.filter(function(h) {
                return h.alive && h.team !== caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h.x, h.y) <= 360;
            }).slice(0, 2);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(near), _step1; !(_step1 = _iterator1()).done;){
                var h = _step1.value;
                callbacks.dealDamageToHero(caster, h, dmg, 'physical', false, false, 'Curtain Call');
                callbacks.applyCc(h, 'slow', 2.5, caster);
            }
            if (near.length === 2) {
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: near[0].x,
                    y: near[0].y,
                    tx: near[1].x,
                    ty: near[1].y,
                    radius: 6,
                    color: '#F43F5E',
                    ttl: 2.0,
                    maxTtl: 2.0
                });
            }
        }
        return true;
    }
    // 29. CLAUDE — Art of Thievery Speed Steal + Mirror Image Snapback + Blazing Duet Free-Moving Barrage
    if (hid === 'claude') {
        if (slot === 1) {
            caster.passiveStacks = Math.min(5, caster.passiveStacks + 1);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 3.5;
            caster.inspireTimer = Math.max(caster.inspireTimer, 3.5);
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 225,
                color: '#FACC15',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'physical', 'slow', 1.4);
        } else if (slot === 2) {
            if (isRecast && caster.snapbackAnchor) {
                var ax1 = caster.snapbackAnchor.x;
                var ay1 = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
                caster.x = ax1;
                caster.y = ay1;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: ax1,
                    y: ay1,
                    radius: 95,
                    color: '#38BDF8',
                    ttl: 0.4,
                    maxTtl: 0.4
                });
            } else {
                caster.snapbackAnchor = {
                    x: caster.x,
                    y: caster.y,
                    ttl: 4.5,
                    slot: 2
                };
                caster.recastSlot = 2;
                caster.recastTimer = 4.5;
                caster.x = tx;
                caster.y = ty;
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: tx,
                    y: ty,
                    radius: 95,
                    color: '#38BDF8',
                    ttl: 0.6,
                    maxTtl: 0.6
                });
            }
        } else {
            callbacks.grantShield(caster, 420 + caster.physAtk * 0.9);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = 3.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 270,
                color: '#FACC15',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(caster.x, caster.y, 270, dmg, 'physical');
        }
        return true;
    }
    // 30. CLINT — 5-Bullet Fan + Trapping Recoil Backstep Root + Grenade Bombardment
    if (hid === 'clint') {
        if (slot === 1) {
            for(var i7 = -2; i7 <= 2; i7++){
                var a3 = aimAngle + i7 * 0.12;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a3) * 1000,
                    vy: Math.sin(a3) * 1000,
                    radius: 20,
                    rangeLeft: skill.range,
                    damage: dmg * 0.35,
                    damageType: 'physical',
                    color: '#F97316',
                    kind: 'skill_line',
                    life: 0.8,
                    maxLife: 0.8
                });
            }
        } else if (slot === 2) {
            caster.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 130, 70, _mapData.WORLD_SIZE - 70);
            caster.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 130, 70, _mapData.WORLD_SIZE - 70);
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 960,
                vy: Math.sin(aimAngle) * 960,
                radius: 30,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#FACC15',
                kind: 'skill_line',
                ccType: 'root',
                ccDuration: 1.2,
                life: 0.9,
                maxLife: 0.9
            });
        } else {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#EF4444',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'slow', 1.2);
        }
        return true;
    }
    // 31. CYCLOPS — CD-Cut Passive + Dual Waves + 5 Homing Planets + Tracking Root Orb
    if (hid === 'cyclops') {
        var cutCds = function cutCds() {
            for(var i = 0; i < 3; i++)caster.skillCds[i] = Math.max(0, caster.skillCds[i] - 0.5);
        };
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 900,
                vy: Math.sin(aimAngle) * 900,
                radius: 36,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                pierce: true,
                life: 1.0,
                maxLife: 1.0
            });
            cutCds();
        } else if (slot === 2) {
            caster.orbitBlades = 5;
            caster.orbitTimer = 4.0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 2.4;
            var hits6 = helpers.hitCircle(caster.x, caster.y, 220, dmg, 'magic');
            if (hits6 > 0) cutCds();
        } else {
            var tgt7 = helpers.findNearestEnemy(skill.range);
            if (tgt7) {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: 0,
                    vy: 0,
                    radius: 34,
                    rangeLeft: skill.range + 220,
                    damage: dmg,
                    damageType: 'magic',
                    color: '#A855F7',
                    kind: 'orb_stun',
                    homingTargetId: tgt7.id,
                    ccType: 'root',
                    ccDuration: 1.6,
                    life: 2.0,
                    maxLife: 2.0
                });
            }
        }
        return true;
    }
    // 32. DIGGIE — Chasing Owl Bomb + Reverse Time Pullback + Time Journey Team Cleanse & 3s CC Immunity!
    if (hid === 'diggie') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 145,
                color: '#FACC15',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(tx, ty, 145, dmg, 'magic', 'slow', 1.4);
        } else if (slot === 2) {
            var tgt8 = helpers.findNearestEnemy(skill.range);
            if (tgt8) {
                callbacks.dealDamageToHero(caster, tgt8, dmg, 'magic', false, false, 'Reverse Time');
                callbacks.applyCc(tgt8, 'pull', 0.75, caster);
                tgt8.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 165, 80, _mapData.WORLD_SIZE - 80);
                tgt8.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 165, 80, _mapData.WORLD_SIZE - 80);
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt8.x,
                    ty: tgt8.y,
                    radius: 5,
                    color: '#FDE047',
                    ttl: 0.8,
                    maxTtl: 0.8
                });
            }
        } else {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 340,
                color: '#FDE047',
                ttl: 0.95,
                maxTtl: 0.95
            });
            for(var _iterator2 = _create_for_of_iterator_helper_loose(heroes), _step2; !(_step2 = _iterator2()).done;){
                var h1 = _step2.value;
                if (!h1.alive || h1.team !== caster.team) continue;
                if ((0, _CombatMath.dist)(caster.x, caster.y, h1.x, h1.y) <= 340) {
                    // Cleanses everything EXCEPT Suppression (Tier 5)!
                    if (h1.ccType && h1.ccType !== 'suppression') {
                        h1.ccType = null;
                        h1.ccTimer = 0;
                        h1.ccPriority = 0;
                    }
                    h1.slowTimer = 0;
                    h1.ccImmuneTimer = Math.max(h1.ccImmuneTimer, 3.0);
                    callbacks.grantShield(h1, 540 + lvl * 140 + caster.magicPow * 1.1);
                }
            }
        }
        return true;
    }
    // 33. DYRROTH — Burst Wave + 75% Phys Def Shatter Dash + Missing-HP Execute Cone
    if (hid === 'dyrroth') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 920,
                vy: Math.sin(aimAngle) * 920,
                radius: 34,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#E11D48',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.5,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1120;
            caster.dashVy = Math.sin(aimAngle) * 1120;
            caster.dashTimer = 0.25;
            helpers.hitCircle(tx, ty, 130, dmg, 'physical', 'slow', 1.2, function(h) {
                h.defShredFlat = Math.max(h.defShredFlat, Math.round(h.physDef * 0.75));
                h.defShredTimer = 4.0;
            });
        } else {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 265,
                color: '#BE123C',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 150, caster.y + Math.sin(aimAngle) * 150, 190, dmg, 'physical', 'slow', 1.2, function(h) {
                var missing = Math.round((h.maxHp - h.hp) * 0.22);
                callbacks.dealDamageToHero(caster, h, missing, 'physical', false, false, 'Abysm Strike');
            });
        }
        return true;
    }
    // 34. EDITH — Earth Shatter Knockup + Dash Backward Throw + Primal Wrath Mech Eject
    if (hid === 'edith') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'airborne', 1.0);
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.25;
            helpers.hitCircle(tx, ty, 125, dmg, 'physical', 'airborne', 0.85, function(h) {
                h.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 90, 70, _mapData.WORLD_SIZE - 70);
                h.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 90, 70, _mapData.WORLD_SIZE - 70);
            });
        } else {
            callbacks.grantShield(caster, 520 + (caster.physDef + caster.magicDef) * 2.4);
            caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#38BDF8',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 195, dmg + (caster.physDef + caster.magicDef) * 1.8, 'magic', 'knockback', 0.7);
        }
        return true;
    }
    // 35. ESMERALDA — Shield Bypass & Steal + Stardust Dance CD Cut + Falling Starmoon Leap Root
    if (hid === 'esmeralda') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.4);
            caster.speedBoostTimer = 3.5;
            callbacks.grantShield(caster, 420 + caster.magicPow * 1.25);
            // Steals nearby enemy shields!
            for(var _iterator3 = _create_for_of_iterator_helper_loose(heroes), _step3; !(_step3 = _iterator3()).done;){
                var h2 = _step3.value;
                if (h2.alive && h2.team !== caster.team && h2.shield > 0 && (0, _CombatMath.dist)(caster.x, caster.y, h2.x, h2.y) <= 280) {
                    var stolen = Math.min(h2.shield, 350 + caster.magicPow * 0.5);
                    h2.shield -= stolen;
                    callbacks.grantShield(caster, stolen);
                }
            }
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 135,
                color: '#A855F7',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45
            });
            var hits7 = helpers.hitCircle(caster.x, caster.y, 185, dmg, 'magic', undefined, undefined, undefined, true); // bypassShield = true!
            if (hits7 > 0) caster.skillCds[0] = Math.max(0, caster.skillCds[0] - hits7 * 1.2);
        } else {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.4, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 205,
                color: '#C084FC',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(tx, ty, 205, dmg, 'magic', 'root', 1.35, undefined, true);
        }
        return true;
    }
    // 38. FANNY — Tornado Strike + Wall-Grapple Steel Cable Zip + Cut Throat Execute!
    if (hid === 'fanny') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 165,
                color: '#34D399',
                ttl: 0.35,
                maxTtl: 0.35
            });
            helpers.hitCircle(caster.x, caster.y, 165, dmg, 'physical');
        } else if (slot === 2) {
            var anchor = findNearestWallPointAlongRay(caster.x, caster.y, aimAngle, 780, ctx.tempWalls);
            var destX = anchor ? anchor.x : tx;
            var destY = anchor ? anchor.y : ty;
            var cableAng = Math.atan2(destY - caster.y, destX - caster.x);
            callbacks.spawnVfx({
                kind: 'cable',
                x: caster.x,
                y: caster.y,
                tx: destX,
                ty: destY,
                radius: 8,
                color: '#E2E8F0',
                ttl: 0.45,
                maxTtl: 0.45
            });
            caster.dashVx = Math.cos(cableAng) * 1420;
            caster.dashVy = Math.sin(cableAng) * 1420;
            caster.dashTimer = (0, _CombatMath.clamp)((0, _CombatMath.dist)(caster.x, caster.y, destX, destY) / 1420, 0.18, 0.42);
            caster.dashWallCross = true;
            helpers.hitCircle((caster.x + destX) * 0.5, (caster.y + destY) * 0.5, 165, dmg * 0.9, 'physical');
        } else {
            var tgt9 = helpers.findNearestEnemy(skill.range);
            if (tgt9) {
                caster.x = (0, _CombatMath.clamp)(tgt9.x - Math.cos(aimAngle) * 42, 70, _mapData.WORLD_SIZE - 70);
                caster.y = (0, _CombatMath.clamp)(tgt9.y - Math.sin(aimAngle) * 42, 70, _mapData.WORLD_SIZE - 70);
                var bonus = tgt9.markedTimer > 0 ? 1.35 : 1.0;
                callbacks.dealDamageToHero(caster, tgt9, dmg * bonus, 'physical', false, false, 'Cut Throat');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt9.x,
                    y: tgt9.y,
                    radius: 120,
                    color: '#38BDF8',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
            }
        }
        return true;
    }
    // 39. FARAMIS — Shadow Stampede Wall Phase + Ghost Bursters + Cult Altar Team Second HP Bar!
    if (hid === 'faramis') {
        if (slot === 1) {
            caster.wallPhaseTimer = 3.0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.55);
            caster.speedBoostTimer = 3.0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 165,
                color: '#10B981',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(caster.x, caster.y, 165, dmg, 'magic', 'pull', 0.6);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 180,
                color: '#34D399',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 180, dmg, 'magic');
        } else {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 340,
                color: '#2DD4BF',
                ttl: 1.0,
                maxTtl: 1.0
            });
            for(var _iterator4 = _create_for_of_iterator_helper_loose(heroes), _step4; !(_step4 = _iterator4()).done;){
                var h3 = _step4.value;
                if (h3.alive && h3.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h3.x, h3.y) <= 340) {
                    callbacks.grantShield(h3, 680 + lvl * 180 + caster.magicPow * 1.25);
                    h3.speedBoostPct = Math.max(h3.speedBoostPct, 0.25);
                    h3.speedBoostTimer = 3.0;
                }
            }
        }
        return true;
    }
    // 40. FLORYN — Sow + Sprout Stun + Bloom GLOBAL Heal Bypassing Anti-Heal!
    if (hid === 'floryn') {
        if (slot === 1) {
            helpers.hitCircle(tx, ty, 145, dmg, 'magic');
            for(var _iterator5 = _create_for_of_iterator_helper_loose(heroes), _step5; !(_step5 = _iterator5()).done;){
                var h4 = _step5.value;
                if (h4.alive && h4.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h4.x, h4.y) <= 380) {
                    callbacks.healHero(h4, 210 + caster.magicPow * 0.55, caster);
                }
            }
        } else if (slot === 2) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 880,
                vy: Math.sin(aimAngle) * 880,
                radius: 32,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#4ADE80',
                kind: 'skill_line',
                ccType: 'stun',
                ccDuration: 1.0,
                life: 1.1,
                maxLife: 1.1
            });
        } else {
            var healAmt = 520 + lvl * 160 + caster.magicPow * 0.95;
            callbacks.announce('FLORYN — BLOOM!', 'Global heal ignoring Anti-Heal!', '#2CE58B');
            for(var _iterator6 = _create_for_of_iterator_helper_loose(heroes), _step6; !(_step6 = _iterator6()).done;){
                var h5 = _step6.value;
                if (h5.alive && h5.team === caster.team) {
                    callbacks.healHero(h5, healAmt, caster, true); // bypassAntiHeal = true!
                    callbacks.spawnVfx({
                        kind: 'ring',
                        x: h5.x,
                        y: h5.y,
                        radius: 110,
                        color: '#2CE58B',
                        ttl: 0.85,
                        maxTtl: 0.85
                    });
                }
            }
        }
        return true;
    }
    // 42. FREDRINN — Crystal Energy Grey HP + Airborne Dash + Appraiser's Wrath Execute
    if (hid === 'fredrinn') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 70,
                color: '#FACC15',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 140, dmg, 'physical', 'slow', 1.2);
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.28;
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', 'airborne', 0.65);
        } else {
            var _caster_fredrinnGreyHp;
            var bonusGrey = Math.round(((_caster_fredrinnGreyHp = caster.fredrinnGreyHp) != null ? _caster_fredrinnGreyHp : 0) * 0.45);
            caster.fredrinnGreyHp = 0;
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 270,
                color: '#F59E0B',
                ttl: 0.65,
                maxTtl: 0.65,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 195, dmg + bonusGrey, 'physical', 'taunt', 1.0, function(h) {
                h.tauntTargetId = caster.id;
            });
        }
        return true;
    }
    // 43. FREYA — Leap Pull + Spirit Shield Dash + Valkyrie Descent
    if (hid === 'freya') {
        if (slot === 1) {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.34, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#FDE047',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'pull', 0.65);
        } else if (slot === 2) {
            callbacks.grantShield(caster, 220 + caster.physAtk * 0.65);
            caster.dashVx = Math.cos(aimAngle) * 960;
            caster.dashVy = Math.sin(aimAngle) * 960;
            caster.dashTimer = 0.22;
            helpers.hitCircle(tx, ty, 130, dmg, 'physical', 'airborne', 0.6);
        } else {
            callbacks.grantShield(caster, 640 + caster.physAtk * 1.4);
            caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 190,
                color: '#FACC15',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 190, dmg, 'physical');
        }
        return true;
    }
    // 44. GATOTKACA — Molten Line + Taunt Charge + Avatar of Guardian Sky Leap!
    if (hid === 'gatotkaca') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 75,
                color: '#F97316',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 150, dmg, 'magic', 'slow', 1.4);
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.3;
            helpers.hitCircle(tx, ty, 155, dmg, 'magic', 'taunt', 1.4, function(h) {
                h.tauntTargetId = caster.id;
            });
        } else {
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.52, true);
            callbacks.spawnVfx({
                kind: 'warning',
                x: tx,
                y: ty,
                radius: 240,
                color: '#F97316',
                ttl: 0.5,
                maxTtl: 0.5
            });
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 240,
                color: '#EF4444',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(tx, ty, 240, dmg, 'magic', 'airborne', 1.25);
        }
        return true;
    }
    // 45. GLOO — Goo Root + Stretch Drag + Split, Split Head-Attach 80% Damage Transfer!
    if (hid === 'gloo') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 145,
                color: '#A855F7',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(tx, ty, 145, dmg, 'magic', 'root', 1.0);
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 980;
            caster.dashVy = Math.sin(aimAngle) * 980;
            caster.dashTimer = 0.28;
            helpers.hitCircle(tx, ty, 140, dmg, 'magic', 'pull', 0.6);
        } else {
            var tgt10 = helpers.findNearestEnemy(skill.range);
            if (tgt10) {
                caster.glooAttachTargetId = tgt10.id;
                caster.glooAttachTimer = 5.5;
                callbacks.healHero(caster, caster.maxHp * 0.22, caster);
                callbacks.dealDamageToHero(caster, tgt10, dmg * 0.65, 'magic', false, false, 'Split, Split');
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: tgt10.x,
                    y: tgt10.y,
                    radius: 135,
                    color: '#A855F7',
                    ttl: 0.75,
                    maxTtl: 0.75
                });
            }
        }
        return true;
    }
    // 46. GORD — Bouncing Stun Orb + Ground Zone + Mystic Gush Long Piercing Laser
    if (hid === 'gord') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 860,
                vy: Math.sin(aimAngle) * 860,
                radius: 34,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                ccType: 'stun',
                ccDuration: 1.0,
                life: 1.1,
                maxLife: 1.1
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#60A5FA',
                ttl: 0.9,
                maxTtl: 0.9
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'magic');
        } else {
            var ex1 = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 860, 60, _mapData.WORLD_SIZE - 60);
            var ey1 = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 860, 60, _mapData.WORLD_SIZE - 60);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex1,
                ty: ey1,
                radius: 86,
                color: '#38BDF8',
                ttl: 0.85,
                maxTtl: 0.85,
                angle: aimAngle
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 340, caster.y + Math.sin(aimAngle) * 340, 210, dmg, 'magic', 'slow', 1.4, function(h) {
                callbacks.dealDamageToHero(caster, h, 140 + caster.magicPow * 0.4, 'true', false, false, 'Mystic Favor');
            });
        }
        return true;
    }
    // 47. GRANGER — 6 Moving Rhapsody Shots + Rondo Dash + Death Sonata Super-Bullets
    if (hid === 'granger') {
        if (slot === 1) {
            for(var i8 = 0; i8 < 4; i8++){
                var off = (i8 - 1.5) * 0.05;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle + off) * 1080,
                    vy: Math.sin(aimAngle + off) * 1080,
                    radius: 22,
                    rangeLeft: skill.range,
                    damage: dmg * 0.34,
                    damageType: 'physical',
                    color: '#E11D48',
                    kind: 'skill_line',
                    life: 0.9,
                    maxLife: 0.9
                });
            }
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1160;
            caster.dashVy = Math.sin(aimAngle) * 1160;
            caster.dashTimer = 0.22;
            caster.dashWallCross = true;
            caster.skillCds[0] = Math.max(0, caster.skillCds[0] - 1.5);
        } else {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1180,
                vy: Math.sin(aimAngle) * 1180,
                radius: 38,
                rangeLeft: 920,
                damage: dmg,
                damageType: 'physical',
                color: '#F43F5E',
                kind: 'skill_line',
                ccType: 'slow',
                ccDuration: 1.5,
                life: 1.1,
                maxLife: 1.1
            });
        }
        return true;
    }
    // 48. GROCK — CC-Immune Spin near Walls + Guardian's Barrier Stone Wall + Wild Charge Wall Shockwave!
    if (hid === 'grock') {
        var nearWall = isHeroNearWall(caster.x, caster.y, 130, ctx.tempWalls);
        if (slot === 1) {
            if (nearWall) caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.5);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#34D399',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(caster.x, caster.y, 195, dmg * (nearWall ? 1.25 : 1.0), 'physical', 'slow', 1.4);
        } else if (slot === 2) {
            callbacks.spawnTempWall == null ? void 0 : callbacks.spawnTempWall.call(callbacks, {
                id: "wall_grock_" + Math.round(ctx.matchTimeSec * 100) + "_" + Math.random().toString(36).slice(2, 6),
                x: tx - 90,
                y: ty - 30,
                w: 180,
                h: 60,
                color: '#10B981',
                ttl: 5.0,
                maxTtl: 5.0,
                ownerId: caster.id
            });
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', 'knockback', 0.5);
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.4);
            caster.dashVx = Math.cos(aimAngle) * 1180;
            caster.dashVy = Math.sin(aimAngle) * 1180;
            caster.dashTimer = 0.36;
            var hitWall = findNearestWallPointAlongRay(caster.x, caster.y, aimAngle, 420, ctx.tempWalls);
            var shockRad = hitWall ? 250 : 170;
            callbacks.spawnVfx({
                kind: 'burst',
                x: hitWall ? hitWall.x : tx,
                y: hitWall ? hitWall.y : ty,
                radius: shockRad,
                color: '#10B981',
                ttl: 0.7,
                maxTtl: 0.7
            });
            helpers.hitCircle(hitWall ? hitWall.x : tx, hitWall ? hitWall.y : ty, shockRad, dmg * (hitWall ? 1.35 : 1.0), 'physical', 'airborne', hitWall ? 1.4 : 0.9);
        }
        return true;
    }
    // 49. GUINEVERE — Energy Wave CD Cut + Parabolic Leap Knockup & Shadow Blink + CC-Immune Violet Requiem
    if (hid === 'guinevere') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 920,
                vy: Math.sin(aimAngle) * 920,
                radius: 28,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#C084FC',
                kind: 'skill_line',
                ccType: 'slow',
                ccDuration: 1.2,
                life: 1.0,
                maxLife: 1.0
            });
            caster.skillCds[1] = Math.max(0, caster.skillCds[1] - 1.0);
        } else if (slot === 2) {
            if (isRecast) {
                caster.x = tx;
                caster.y = ty;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tx,
                    y: ty,
                    radius: 105,
                    color: '#E879F9',
                    ttl: 0.4,
                    maxTtl: 0.4
                });
            } else {
                helpers.startParabolicLeap(aimAngle, clampedDist, 0.36, true);
                caster.recastSlot = 2;
                caster.recastTimer = 4.0;
                callbacks.spawnVfx({
                    kind: 'crater',
                    x: tx,
                    y: ty,
                    radius: 155,
                    color: '#A855F7',
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                helpers.hitCircle(tx, ty, 155, dmg, 'magic', 'airborne', 1.1);
            }
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 235,
                color: '#E879F9',
                ttl: 0.85,
                maxTtl: 0.85
            });
            helpers.hitCircle(caster.x, caster.y, 235, dmg, 'magic', 'airborne', 1.3);
        }
        return true;
    }
    // 50. GUSION — Sword Spike Blink Behind + 5-Dagger Recall + Incandescence Resets S1 & S2!
    if (hid === 'gusion') {
        if (slot === 1) {
            if (isRecast) {
                var marked = heroes.find(function(h) {
                    return h.alive && h.team !== caster.team && h.markedBy === caster.id && h.markedTimer > 0;
                });
                if (marked) {
                    caster.x = (0, _CombatMath.clamp)(marked.x - Math.cos(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                    caster.y = (0, _CombatMath.clamp)(marked.y - Math.sin(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                    callbacks.dealDamageToHero(caster, marked, dmg * 1.15, 'magic', false, false, 'Sword Spike');
                }
            } else {
                caster.recastSlot = 1;
                caster.recastTimer = 3.5;
                helpers.hitCircle(tx, ty, 125, dmg * 0.7, 'magic', undefined, undefined, function(h) {
                    h.markedTimer = 4.0;
                    h.markedBy = caster.id;
                });
            }
        } else if (slot === 2) {
            for(var i9 = -2; i9 <= 2; i9++){
                var a4 = aimAngle + i9 * 0.14;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a4) * 960,
                    vy: Math.sin(a4) * 960,
                    radius: 20,
                    rangeLeft: 480,
                    damage: dmg * 0.32,
                    damageType: 'magic',
                    color: '#38BDF8',
                    kind: 'boomerang',
                    pierce: true,
                    returning: false,
                    life: 1.4,
                    maxLife: 1.4
                });
            }
        } else {
            caster.dashVx = Math.cos(aimAngle) * 1140;
            caster.dashVy = Math.sin(aimAngle) * 1140;
            caster.dashTimer = 0.24;
            caster.dashWallCross = true;
            caster.skillCds[0] = 0;
            caster.skillCds[1] = 0; // Instant S1 & S2 reset!
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 110,
                color: '#60A5FA',
                ttl: 0.45,
                maxTtl: 0.45
            });
        }
        return true;
    }
    // 51. HANABI — Equinox Shield (CC-Immune while shielded!) + Soul Scroll + Higanbana Spreading Root
    if (hid === 'hanabi') {
        if (slot === 1) {
            callbacks.grantShield(caster, 420 + caster.physAtk * 0.85);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = 4.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 3.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 100,
                color: '#F43F5E',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (slot === 2) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 960,
                vy: Math.sin(aimAngle) * 960,
                radius: 30,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'physical',
                color: '#FB7185',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.5,
                life: 1.0,
                maxLife: 1.0
            });
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 215,
                color: '#E11D48',
                ttl: 0.7,
                maxTtl: 0.7
            });
            helpers.hitCircle(tx, ty, 215, dmg, 'physical', 'root', 1.6);
        }
        return true;
    }
    // 52. HANZO — Demon Feast Instant Jungle Devour + Soul Reap + Pinnacle Ninja Wall-Phasing Demon Ghost
    if (hid === 'hanzo') {
        if (slot === 1) {
            var mob = jungleMobs.find(function(j) {
                return j.alive && j.kind !== 'lord' && j.kind !== 'turtle' && (0, _CombatMath.dist)(caster.x, caster.y, j.x, j.y) <= 340;
            });
            if (mob) {
                callbacks.dealDamageToJungle(caster, mob, mob.hp + 999, 'true');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: mob.x,
                    y: mob.y,
                    radius: 110,
                    color: '#991B1B',
                    ttl: 0.5,
                    maxTtl: 0.5
                });
            } else {
                helpers.hitCircle(tx, ty, 130, dmg, 'physical');
            }
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#DC2626',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'physical', 'slow', 1.2);
        } else {
            caster.wallPhaseTimer = 5.5;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
            caster.speedBoostTimer = 5.5;
            caster.inspireTimer = Math.max(caster.inspireTimer, 5.5);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 160,
                color: '#7F1D1D',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 175, dmg * 0.7, 'physical');
        }
        return true;
    }
    // 53. HARITH — Synchro Fission + Chrono Dash Shield/CD Cut + Zaman Force Rift
    if (hid === 'harith') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 160,
                color: '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            helpers.hitCircle(tx, ty, 160, dmg, 'magic');
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1100;
            caster.dashVy = Math.sin(aimAngle) * 1100;
            caster.dashTimer = 0.22;
            caster.dashWallCross = true;
            callbacks.grantShield(caster, 320 + caster.magicPow * 1.15);
            var hits8 = helpers.hitCircle(tx, ty, 150, dmg, 'magic', 'slow', 1.0);
            if (hits8 > 0 || caster.passiveTimer > 0) caster.skillCds[1] = Math.min(caster.skillCds[1], 1.1);
        } else {
            caster.passiveTimer = 6.0;
            caster.skillCds[1] = 0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 245,
                color: '#818CF8',
                ttl: 0.9,
                maxTtl: 0.9
            });
            helpers.hitCircle(tx, ty, 245, dmg * 0.6, 'magic', 'slow', 1.8);
        }
        return true;
    }
    // 54. HARLEY — Poker Trick Cards + Space Escape Hat Snapback + 4s Deadly Magic Fire Ring Detonation!
    if (hid === 'harley') {
        if (slot === 1) {
            for(var i10 = -1; i10 <= 1; i10++){
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle + i10 * 0.1) * 980,
                    vy: Math.sin(aimAngle + i10 * 0.1) * 980,
                    radius: 22,
                    rangeLeft: skill.range,
                    damage: dmg * 0.45,
                    damageType: 'magic',
                    color: '#F97316',
                    kind: 'skill_line',
                    life: 0.9,
                    maxLife: 0.9
                });
            }
        } else if (slot === 2) {
            if (isRecast && caster.snapbackAnchor) {
                var ax2 = caster.snapbackAnchor.x;
                var ay2 = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
                caster.x = ax2;
                caster.y = ay2;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: ax2,
                    y: ay2,
                    radius: 90,
                    color: '#FACC15',
                    ttl: 0.4,
                    maxTtl: 0.4
                });
            } else {
                caster.snapbackAnchor = {
                    x: caster.x,
                    y: caster.y,
                    ttl: 4.0,
                    slot: 2
                };
                caster.recastSlot = 2;
                caster.recastTimer = 4.0;
                caster.x = tx;
                caster.y = ty;
                caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
                caster.speedBoostTimer = 2.0;
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.snapbackAnchor.x,
                    y: caster.snapbackAnchor.y,
                    radius: 75,
                    color: '#FACC15',
                    ttl: 1.2,
                    maxTtl: 1.2
                });
            }
        } else {
            var tgt11 = helpers.findNearestEnemy(skill.range);
            if (tgt11) {
                tgt11.harleyRingTimer = 4.0;
                tgt11.harleyRingDamage = 0;
                tgt11.harleyRingCasterId = caster.id;
                callbacks.dealDamageToHero(caster, tgt11, dmg * 0.55, 'magic', false, false, 'Deadly Magic');
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: tgt11.x,
                    y: tgt11.y,
                    radius: 115,
                    color: '#F97316',
                    ttl: 1.0,
                    maxTtl: 1.0
                });
            }
        }
        return true;
    }
    // 55. HAYABUSA — 3 Returning Shurikens + Quad Shadow Snapback + Untargetable Ougi Shadow Kill
    if (hid === 'hayabusa') {
        if (slot === 1) {
            for(var i11 = -1; i11 <= 1; i11++){
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle + i11 * 0.24) * 940,
                    vy: Math.sin(aimAngle + i11 * 0.24) * 940,
                    radius: 24,
                    rangeLeft: 460,
                    damage: dmg * 0.45,
                    damageType: 'physical',
                    color: '#818CF8',
                    kind: 'boomerang',
                    pierce: true,
                    returning: false,
                    life: 1.4,
                    maxLife: 1.4
                });
            }
        } else if (slot === 2) {
            if (isRecast && caster.snapbackAnchor) {
                var ax3 = caster.snapbackAnchor.x;
                var ay3 = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
                caster.x = ax3;
                caster.y = ay3;
            } else {
                caster.snapbackAnchor = {
                    x: caster.x,
                    y: caster.y,
                    ttl: 5.0,
                    slot: 2
                };
                caster.recastSlot = 2;
                caster.recastTimer = 5.0;
                for(var i12 = 0; i12 < 4; i12++){
                    var a5 = aimAngle + i12 * Math.PI / 2;
                    callbacks.spawnVfx({
                        kind: 'ring',
                        x: caster.x + Math.cos(a5) * 190,
                        y: caster.y + Math.sin(a5) * 190,
                        radius: 58,
                        color: '#6366F1',
                        ttl: 1.2,
                        maxTtl: 1.2
                    });
                }
                caster.x = tx;
                caster.y = ty;
            }
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 1.4);
            var tgt12 = helpers.findNearestEnemy(skill.range);
            var bx2 = tgt12 ? tgt12.x : tx;
            var by2 = tgt12 ? tgt12.y : ty;
            caster.x = bx2;
            caster.y = by2;
            callbacks.spawnVfx({
                kind: 'burst',
                x: bx2,
                y: by2,
                radius: 175,
                color: '#6366F1',
                ttl: 0.75,
                maxTtl: 0.75
            });
            helpers.hitCircle(bx2, by2, 175, dmg * 1.15, 'physical');
        }
        return true;
    }
    // 56. HELCURT — Blink Terrify + 5 Stingers + Dark Night Falls 3.5s GLOBAL BLIND!
    if (hid === 'helcurt') {
        if (slot === 1) {
            caster.x = tx;
            caster.y = ty;
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 135,
                color: '#7E22CE',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(tx, ty, 135, dmg, 'physical', 'silence', 1.2);
        } else if (slot === 2) {
            var bonus1 = 1 + Math.min(5, caster.passiveStacks) * 0.14;
            caster.passiveStacks = 0;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 65,
                color: '#A855F7',
                ttl: 0.35,
                maxTtl: 0.35,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 145, dmg * bonus1, 'physical', 'slow', 1.2);
        } else {
            var enemyTeam = caster.team === 'blue' ? 'red' : 'blue';
            callbacks.triggerGlobalBlind == null ? void 0 : callbacks.triggerGlobalBlind.call(callbacks, enemyTeam, 3.5);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.6);
            caster.speedBoostTimer = 5.0;
            caster.inspireTimer = Math.max(caster.inspireTimer, 5.0);
            callbacks.announce('HELCURT — DARK NIGHT FALLS!', 'All enemies blinded globally for 3.5s!', '#A855F7');
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#581C87',
                ttl: 0.85,
                maxTtl: 0.85
            });
        }
        return true;
    }
    // 57. HILDA — Speed Cleave + 3-Hit Lock + Stacking Leap Slam
    if (hid === 'hilda') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.55);
            caster.speedBoostTimer = 3.0;
            helpers.hitCircle(tx, ty, 145, dmg, 'physical', 'slow', 1.4);
        } else if (slot === 2) {
            caster.dashVx = Math.cos(aimAngle) * 1020;
            caster.dashVy = Math.sin(aimAngle) * 1020;
            caster.dashTimer = 0.22;
            helpers.hitCircle(tx, ty, 130, dmg, 'physical');
        } else {
            caster.passiveStacks = Math.min(8, caster.passiveStacks + 1);
            helpers.startParabolicLeap(aimAngle, clampedDist, 0.32, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#22C55E',
                ttl: 0.55,
                maxTtl: 0.55
            });
            helpers.hitCircle(tx, ty, 165, dmg + caster.passiveStacks * 45, 'physical', 'stun', 0.85);
        }
        return true;
    }
    // 58. HIRARA (2026) — Astral Prism Shards + Radiant Lance 3-Way Refraction + Mirror Veil + Supernova Convergence!
    if (hid === 'hirara') {
        if (!caster.hiraraPrisms) caster.hiraraPrisms = [];
        if (slot === 1) {
            // Radiant Lance: piercing astral beam — splits into 3 rays if passing near an Astral Prism!
            var ex2 = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * skill.range, 60, _mapData.WORLD_SIZE - 60);
            var ey2 = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * skill.range, 60, _mapData.WORLD_SIZE - 60);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex2,
                ty: ey2,
                radius: 52,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle((caster.x + ex2) * 0.5, (caster.y + ey2) * 0.5, 175, dmg, 'magic');
            // Refract through any active Astral Prisms!
            for(var _iterator7 = _create_for_of_iterator_helper_loose(caster.hiraraPrisms), _step7; !(_step7 = _iterator7()).done;){
                var p = _step7.value;
                if ((0, _CombatMath.dist)(p.x, p.y, (caster.x + ex2) * 0.5, (caster.y + ey2) * 0.5) <= 340) {
                    for(var r = -1; r <= 1; r++){
                        var ra = aimAngle + r * 0.42;
                        var rx = (0, _CombatMath.clamp)(p.x + Math.cos(ra) * 320, 60, _mapData.WORLD_SIZE - 60);
                        var ry = (0, _CombatMath.clamp)(p.y + Math.sin(ra) * 320, 60, _mapData.WORLD_SIZE - 60);
                        callbacks.spawnVfx({
                            kind: 'beam',
                            x: p.x,
                            y: p.y,
                            tx: rx,
                            ty: ry,
                            radius: 34,
                            color: '#E879F9',
                            ttl: 0.45,
                            maxTtl: 0.45,
                            angle: ra
                        });
                        helpers.hitCircle(rx, ry, 125, dmg * 0.55, 'magic');
                    }
                }
            }
            // Drop a fresh prism at endpoint (max 3 active)
            caster.hiraraPrisms.push({
                x: tx,
                y: ty,
                ttl: 10.0
            });
            if (caster.hiraraPrisms.length > 3) caster.hiraraPrisms.shift();
            callbacks.spawnVfx({
                kind: 'prism',
                x: tx,
                y: ty,
                radius: 42,
                color: '#38BDF8',
                ttl: 1.2,
                maxTtl: 1.2
            });
        } else if (slot === 2) {
            // Mirror Veil: crystal shield wall granting allies shield + clearing slows + placing prism
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 175,
                color: '#C084FC',
                ttl: 0.65,
                maxTtl: 0.65
            });
            for(var _iterator8 = _create_for_of_iterator_helper_loose(heroes), _step8; !(_step8 = _iterator8()).done;){
                var h6 = _step8.value;
                if (h6.alive && h6.team === caster.team && (0, _CombatMath.dist)(tx, ty, h6.x, h6.y) <= 230) {
                    callbacks.grantShield(h6, 360 + caster.magicPow * 0.85);
                    h6.slowTimer = 0;
                    h6.slowPct = 0;
                }
            }
            helpers.hitCircle(tx, ty, 165, dmg, 'magic', 'slow', 1.4);
            caster.hiraraPrisms.push({
                x: tx,
                y: ty,
                ttl: 10.0
            });
            if (caster.hiraraPrisms.length > 3) caster.hiraraPrisms.shift();
            callbacks.spawnVfx({
                kind: 'prism',
                x: tx,
                y: ty,
                radius: 48,
                color: '#C084FC',
                ttl: 1.2,
                maxTtl: 1.2
            });
        } else {
            // Supernova Convergence: detonates target zone + ALL active Astral Prisms in starfield stun!
            var detonatePoints = [].concat([
                {
                    x: tx,
                    y: ty
                }
            ], caster.hiraraPrisms.map(function(p) {
                return {
                    x: p.x,
                    y: p.y
                };
            }));
            caster.hiraraPrisms = [];
            for(var _iterator9 = _create_for_of_iterator_helper_loose(detonatePoints), _step9; !(_step9 = _iterator9()).done;){
                var pt = _step9.value;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: pt.x,
                    y: pt.y,
                    radius: 220,
                    color: '#E879F9',
                    ttl: 0.8,
                    maxTtl: 0.8
                });
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: pt.x,
                    y: pt.y,
                    radius: 235,
                    color: '#38BDF8',
                    ttl: 0.75,
                    maxTtl: 0.75
                });
                helpers.hitCircle(pt.x, pt.y, 220, dmg, 'magic', 'stun', 1.5);
            }
        }
        emitTrail(caster.x, caster.y, tx, ty, 5);
        return true;
    }
    // 59. HYLOS — Law & Order Stun + Toggleable Ring of Punishment + Glorious Pathway Highway
    if (hid === 'hylos') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
            caster.speedBoostTimer = 2.5;
            var tgt13 = helpers.findNearestEnemy(skill.range);
            if (tgt13) {
                callbacks.dealDamageToHero(caster, tgt13, dmg, 'magic', false, false, 'Law and Order');
                callbacks.applyCc(tgt13, 'stun', 1.1, caster);
            }
        } else if (slot === 2) {
            caster.toggleAuraTimer = caster.toggleAuraTimer > 0 ? 0 : 7.0;
            caster.toggleAuraKind = caster.toggleAuraTimer > 0 ? 'hylos' : null;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 215,
                color: '#38BDF8',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(caster.x, caster.y, 215, dmg * 0.5, 'magic', 'slow', 1.5);
        } else {
            var ex3 = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 620, 70, _mapData.WORLD_SIZE - 70);
            var ey3 = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 620, 70, _mapData.WORLD_SIZE - 70);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex3,
                ty: ey3,
                radius: 135,
                color: '#FACC15',
                ttl: 1.4,
                maxTtl: 1.4,
                angle: aimAngle
            });
            for(var _iterator10 = _create_for_of_iterator_helper_loose(heroes), _step10; !(_step10 = _iterator10()).done;){
                var h7 = _step10.value;
                if (h7.alive && h7.team === caster.team && (0, _CombatMath.dist)((caster.x + ex3) * 0.5, (caster.y + ey3) * 0.5, h7.x, h7.y) <= 340) {
                    h7.speedBoostPct = Math.max(h7.speedBoostPct, 0.55);
                    h7.speedBoostTimer = 4.0;
                    callbacks.healHero(h7, 240 + caster.maxHp * 0.06, caster);
                }
            }
            helpers.hitCircle((caster.x + ex3) * 0.5, (caster.y + ey3) * 0.5, 220, dmg * 0.6, 'magic', 'slow', 2.0);
        }
        return true;
    }
    // 60. IRITHEL — Strafe Armor Shred + Roar Slow + Heavy Crossbow Leap Explosive Bolts
    if (hid === 'irithel') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#22C55E',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', undefined, undefined, function(h) {
                h.defShredFlat = Math.max(h.defShredFlat, 28);
                h.defShredTimer = 3.5;
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#4ADE80',
                ttl: 0.45,
                maxTtl: 0.45
            });
            helpers.hitCircle(caster.x, caster.y, 195, dmg, 'physical', 'slow', 2.0);
        } else {
            helpers.startParabolicLeap(aimAngle, 260, 0.3, true);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 8.0;
            caster.inspireTimer = Math.max(caster.inspireTimer, 8.0);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 175,
                color: '#FACC15',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(tx, ty, 175, dmg, 'physical');
        }
        return true;
    }
    // 61. IXIA — Dual Beam + Star Helix Pull + Full Barrage Giant 180-Deg 6-Target Fan Zone!
    if (hid === 'ixia') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = 2.4;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 60,
                color: '#38BDF8',
                ttl: 0.35,
                maxTtl: 0.35,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 135, dmg, 'physical');
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 72,
                color: '#818CF8',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'physical', 'vortex', 0.8);
        } else {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 460,
                color: '#38BDF8',
                ttl: 0.9,
                maxTtl: 0.9,
                angle: aimAngle
            });
            helpers.hitCircle(caster.x + Math.cos(aimAngle) * 260, caster.y + Math.sin(aimAngle) * 260, 290, dmg * 1.15, 'physical', 'slow', 1.2);
            callbacks.healHero(caster, 200 + caster.physAtk * 0.45, caster);
        }
        return true;
    }
    // 62. JAWHEAD — 12 Smart Missiles + Ejector Throw + Unstoppable Force Lock-On Ramming Stun
    if (hid === 'jawhead') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 225,
                color: '#F97316',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(caster.x, caster.y, 225, dmg, 'physical');
        } else if (slot === 2) {
            callbacks.grantShield(caster, 380 + caster.physAtk * 1.1);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.4);
            caster.speedBoostTimer = 3.0;
            var tgt14 = helpers.findNearestEnemy(240);
            if (tgt14) {
                tgt14.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 240, 75, _mapData.WORLD_SIZE - 75);
                tgt14.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 240, 75, _mapData.WORLD_SIZE - 75);
                callbacks.applyCc(tgt14, 'airborne', 0.9, caster);
                callbacks.dealDamageToHero(caster, tgt14, dmg, 'physical', false, false, 'Ejector');
            }
        } else {
            var tgt15 = helpers.findNearestEnemy(skill.range);
            if (tgt15) {
                caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.0);
                caster.x = (0, _CombatMath.clamp)(tgt15.x - Math.cos(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                caster.y = (0, _CombatMath.clamp)(tgt15.y - Math.sin(aimAngle) * 45, 70, _mapData.WORLD_SIZE - 70);
                callbacks.dealDamageToHero(caster, tgt15, dmg, 'physical', false, false, 'Unstoppable Force');
                callbacks.applyCc(tgt15, 'stun', 1.1, caster);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt15.x,
                    y: tgt15.y,
                    radius: 155,
                    color: '#F59E0B',
                    ttl: 0.55,
                    maxTtl: 0.55
                });
            }
        }
        return true;
    }
    // 63. JOHNSON — Wrench Stun + Electromagnetic Cone + Full Throttle Drivable Sports Car!
    if (hid === 'johnson') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 920,
                vy: Math.sin(aimAngle) * 920,
                radius: 30,
                rangeLeft: skill.range,
                damage: dmg,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                ccType: 'stun',
                ccDuration: 0.9,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 225,
                color: '#60A5FA',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 165, dmg, 'magic', 'slow', 1.6);
        } else {
            var _caster_carDriveTimer;
            if (((_caster_carDriveTimer = caster.carDriveTimer) != null ? _caster_carDriveTimer : 0) > 0) {
                // Recast Nitro Detonation!
                caster.carDriveTimer = 0;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 245,
                    color: '#38BDF8',
                    ttl: 0.85,
                    maxTtl: 0.85
                });
                helpers.hitCircle(caster.x, caster.y, 245, dmg + caster.physDef * 2.0, 'magic', 'stun', 1.5);
            } else {
                caster.carDriveTimer = 6.5;
                caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 6.5);
                caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.95);
                caster.speedBoostTimer = 6.5;
                caster.recastSlot = 3;
                caster.recastTimer = 6.5;
                callbacks.announce('JOHNSON — FULL THROTTLE!', 'Sports Car armed! Ram an enemy for AoE Stun!', '#38BDF8');
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.x,
                    y: caster.y,
                    radius: 135,
                    color: '#38BDF8',
                    ttl: 0.7,
                    maxTtl: 0.7
                });
            }
        }
        return true;
    }
    // 64. JOY — Leonin Crystal + 4-Beat Rhythm Dash + Electrifying Beats 8-Pulse Burst
    if (hid === 'joy') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 120,
                color: '#FACC15',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(tx, ty, 120, dmg, 'magic');
        } else if (slot === 2) {
            caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
            caster.dashVx = Math.cos(aimAngle) * 1160;
            caster.dashVy = Math.sin(aimAngle) * 1160;
            caster.dashTimer = 0.22;
            caster.dashWallCross = true;
            callbacks.grantShield(caster, 160 + caster.magicPow * 0.4);
            var hits9 = helpers.hitCircle(tx, ty, 125, dmg * (1 + caster.passiveStacks * 0.15), 'magic');
            if (hits9 > 0 && caster.passiveStacks < 4) caster.skillCds[1] = 0.35;
        } else {
            var mult = 1 + caster.passiveStacks * 0.2;
            caster.passiveStacks = 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = 3.5;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 235,
                color: '#FACC15',
                ttl: 0.85,
                maxTtl: 0.85
            });
            var hits10 = helpers.hitCircle(caster.x, caster.y, 235, dmg * mult, 'magic');
            if (hits10 > 0) callbacks.healHero(caster, 220 + hits10 * 95 + caster.magicPow * 0.45, caster);
        }
        return true;
    }
    // 65. JULIAN — Smith's Legacy: Every 3rd Skill Cast is an Enhanced Mega-Skill!
    if (hid === 'julian') {
        var _caster_julianCastCount, _caster_julianCastCount1;
        var enhanced = ((_caster_julianCastCount = caster.julianCastCount) != null ? _caster_julianCastCount : 0) >= 2;
        caster.julianCastCount = enhanced ? 0 : ((_caster_julianCastCount1 = caster.julianCastCount) != null ? _caster_julianCastCount1 : 0) + 1;
        var mult1 = enhanced ? 1.55 : 1.0;
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: enhanced ? 48 : 30,
                rangeLeft: skill.range,
                damage: dmg * mult1,
                damageType: 'magic',
                color: enhanced ? '#EF4444' : '#E11D48',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: enhanced ? 1.8 : 1.0,
                life: 1.1,
                maxLife: 1.1
            });
        } else if (slot === 2) {
            if (enhanced) caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.85);
            caster.dashVx = Math.cos(aimAngle) * 1140;
            caster.dashVy = Math.sin(aimAngle) * 1140;
            caster.dashTimer = 0.28;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: enhanced ? 110 : 65,
                color: '#EF4444',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, enhanced ? 165 : 120, dmg * mult1, 'magic');
        } else {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: enhanced ? 210 : 155,
                color: '#F43F5E',
                ttl: 0.65,
                maxTtl: 0.65
            });
            helpers.hitCircle(tx, ty, enhanced ? 210 : 155, dmg * mult1, 'magic', enhanced ? 'airborne' : 'root', enhanced ? 1.2 : 1.0);
        }
        if (enhanced) {
            callbacks.healHero(caster, 190 + caster.magicPow * 0.4, caster);
        }
        return true;
    }
    // 66. KADITA — CC-Immune Ocean Wave + Water Geyser Knockup + Untargetable 6-Wave Rough Waves!
    if (hid === 'kadita') {
        if (slot === 1) {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.0);
            caster.dashVx = Math.cos(aimAngle) * 1080;
            caster.dashVy = Math.sin(aimAngle) * 1080;
            caster.dashTimer = 0.34;
            caster.dashWallCross = true;
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 90,
                color: '#06B6D4',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            helpers.hitCircle(tx, ty, 145, dmg, 'magic', 'slow', 1.2);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#22D3EE',
                ttl: 0.6,
                maxTtl: 0.6
            });
            helpers.hitCircle(tx, ty, 155, dmg, 'magic', 'airborne', 1.35);
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 1.3);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 245,
                color: '#06B6D4',
                ttl: 0.85,
                maxTtl: 0.85
            });
            for(var i13 = 0; i13 < 6; i13++){
                var a6 = i13 * Math.PI * 2 / 6;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a6) * 860,
                    vy: Math.sin(a6) * 860,
                    radius: 28,
                    rangeLeft: 380,
                    damage: dmg * 0.36,
                    damageType: 'magic',
                    color: '#22D3EE',
                    kind: 'boomerang',
                    pierce: true,
                    returning: false,
                    life: 1.5,
                    maxLife: 1.5
                });
            }
            helpers.hitCircle(caster.x, caster.y, 195, dmg * 0.55, 'magic', 'slow', 1.5);
        }
        return true;
    }
    return false;
}
function stepPart4HeroPassives(h, dt, allHeroes, callbacks, tempWalls) {
    var _h_castBackswing, _h_deathImmuneTimer, _h_blindedTimer, _h_wallPhaseTimer;
    // 1. Parabolic Leap Z-axis arc stepping
    if (h.leapTimer > 0 && h.leapDuration > 0) {
        h.leapTimer = Math.max(0, h.leapTimer - dt);
        var prog = 1 - h.leapTimer / h.leapDuration;
        h.leapZ = Math.sin((0, _CombatMath.clamp)(prog, 0, 1) * Math.PI) * 4.4;
    } else {
        h.leapZ = 0;
    }
    // 2. Timers decay
    h.castBackswing = Math.max(0, ((_h_castBackswing = h.castBackswing) != null ? _h_castBackswing : 0) - dt);
    h.deathImmuneTimer = Math.max(0, ((_h_deathImmuneTimer = h.deathImmuneTimer) != null ? _h_deathImmuneTimer : 0) - dt);
    h.blindedTimer = Math.max(0, ((_h_blindedTimer = h.blindedTimer) != null ? _h_blindedTimer : 0) - dt);
    h.wallPhaseTimer = Math.max(0, ((_h_wallPhaseTimer = h.wallPhaseTimer) != null ? _h_wallPhaseTimer : 0) - dt);
    if (h.carmillaLinkTimer > 0) {
        h.carmillaLinkTimer = Math.max(0, h.carmillaLinkTimer - dt);
        if (h.carmillaLinkTimer <= 0) h.carmillaLinkIds = [];
    }
    if (h.snapbackAnchor) {
        h.snapbackAnchor.ttl -= dt;
        if (h.snapbackAnchor.ttl <= 0) h.snapbackAnchor = null;
    }
    if (h.hiraraPrisms && h.hiraraPrisms.length > 0) {
        for(var i = h.hiraraPrisms.length - 1; i >= 0; i--){
            h.hiraraPrisms[i].ttl -= dt;
            if (h.hiraraPrisms[i].ttl <= 0) h.hiraraPrisms.splice(i, 1);
        }
    }
    // 3. Barats Big Guy dynamic model scale decay
    if (h.heroDef.id === 'barats') {
        if (h.passiveTimer <= 0 && h.passiveStacks > 0) {
            h.passiveStacks = Math.max(0, h.passiveStacks - 1);
            h.passiveTimer = 1.5;
        }
        h.modelScale = 1 + h.passiveStacks * 0.045;
    } else if (h.heroDef.id === 'yu_zhong' || h.heroDef.id === 'lukas') {
        h.modelScale = h.passiveTimer > 0 ? 1.32 : 1.0;
    } else {
        h.modelScale = 1.0;
    }
    // 4. Hanabi Passive: CC-Immune while Shielded!
    if (h.heroDef.id === 'hanabi' && h.shield > 0) {
        h.ccImmuneTimer = Math.max(h.ccImmuneTimer, 0.25);
    }
    // 5. Hilda Passive: Entering Bush grants Shield & Rapid HP Regen!
    if (h.heroDef.id === 'hilda' && h.inBush && h.alive) {
        h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.03 * dt);
        if (h.passiveCd <= 0) {
            h.passiveCd = 8.0;
            callbacks.grantShield(h, Math.round(h.maxHp * 0.14));
        }
    }
    // 6. Grock Earthen Force: Near Walls grants bonus MS & Regen
    if (h.heroDef.id === 'grock' && h.alive && isHeroNearWall(h.x, h.y, 120, tempWalls)) {
        h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.018 * dt);
        h.speedBoostPct = Math.max(h.speedBoostPct, 0.16);
        h.speedBoostTimer = Math.max(h.speedBoostTimer, 0.35);
    }
    // 7. Gloo Head-Attach Ride
    if (h.glooAttachTargetId && h.glooAttachTimer > 0) {
        h.glooAttachTimer -= dt;
        var host = allHeroes.find(function(x) {
            return x.id === h.glooAttachTargetId && x.alive;
        });
        if (host) {
            h.x = host.x;
            h.y = host.y;
        } else {
            h.glooAttachTargetId = null;
            h.glooAttachTimer = 0;
        }
        if (h.glooAttachTimer <= 0) h.glooAttachTargetId = null;
    }
    // 8. Johnson Full Throttle Drivable Sports Car — crash explodes on enemy contact!
    if (h.carDriveTimer > 0 && h.alive) {
        h.carDriveTimer = Math.max(0, h.carDriveTimer - dt);
        var hitEnemy = allHeroes.find(function(e) {
            return e.alive && e.team !== h.team && e.untargetableTimer <= 0 && (0, _CombatMath.dist)(h.x, h.y, e.x, e.y) <= 78;
        });
        if (hitEnemy) {
            h.carDriveTimer = 0;
            callbacks.spawnVfx({
                kind: 'burst',
                x: h.x,
                y: h.y,
                radius: 245,
                color: '#38BDF8',
                ttl: 0.85,
                maxTtl: 0.85
            });
            for(var _iterator = _create_for_of_iterator_helper_loose(allHeroes), _step; !(_step = _iterator()).done;){
                var e = _step.value;
                if (e.alive && e.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, e.x, e.y) <= 245) {
                    callbacks.dealDamageToHero(h, e, 480 + h.physDef * 2.2 + h.magicPow * 0.8, 'magic', false, false, 'Full Throttle Crash');
                    callbacks.applyCc(e, 'stun', 1.6, h);
                }
            }
        }
    }
    // 9. Harley Deadly Magic 4s Fire Ring Detonation!
    if (h.harleyRingTimer > 0 && h.alive) {
        h.harleyRingTimer -= dt;
        if (h.harleyRingTimer <= 0) {
            var _allHeroes_find;
            var caster = (_allHeroes_find = allHeroes.find(function(x) {
                return x.id === h.harleyRingCasterId;
            })) != null ? _allHeroes_find : null;
            var blast = 220 + Math.round(h.harleyRingDamage * 0.45);
            h.harleyRingDamage = 0;
            h.harleyRingCasterId = null;
            callbacks.dealDamageToHero(caster, h, blast, 'magic', false, false, 'Deadly Magic Detonate');
            callbacks.spawnVfx({
                kind: 'burst',
                x: h.x,
                y: h.y,
                radius: 135,
                color: '#F97316',
                ttl: 0.55,
                maxTtl: 0.55
            });
        }
    }
    // 10. Kadita Thalassophobia 65% Damage Taken Heal-Back after 4s
    if (h.kaditaHealTimer > 0 && h.alive) {
        h.kaditaHealTimer -= dt;
        if (h.kaditaHealTimer <= 0 && h.kaditaHealBank > 0) {
            var healAmt = Math.round(h.kaditaHealBank * 0.65);
            h.kaditaHealBank = 0;
            callbacks.healHero(h, healAmt, h);
            callbacks.spawnVfx({
                kind: 'ring',
                x: h.x,
                y: h.y,
                radius: 105,
                color: '#22D3EE',
                ttl: 0.55,
                maxTtl: 0.55
            });
        }
    }
    // 11. Toggle Auras (Alice Blood Ode / Hylos Ring of Punishment / Baxia Tortoise Lava)
    if (h.toggleAuraTimer > 0 && h.toggleAuraKind && h.alive) {
        h.toggleAuraTimer -= dt;
        if (Math.random() < dt * 2.4) {
            var auraCol = h.toggleAuraKind === 'alice' ? '#E11D48' : h.toggleAuraKind === 'hylos' ? '#38BDF8' : '#F97316';
            for(var _iterator1 = _create_for_of_iterator_helper_loose(allHeroes), _step1; !(_step1 = _iterator1()).done;){
                var e1 = _step1.value;
                if (e1.alive && e1.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, e1.x, e1.y) <= 215) {
                    var tickD = h.toggleAuraKind === 'alice' ? 95 + h.magicPow * 0.25 : 80 + h.maxHp * 0.015;
                    callbacks.dealDamageToHero(h, e1, tickD, 'magic', false, false, 'Aura Burn');
                    if (h.toggleAuraKind === 'alice') callbacks.healHero(h, 65 + h.magicPow * 0.15, h);
                    if (h.toggleAuraKind === 'baxia') e1.antiHealTimer = Math.max(e1.antiHealTimer, 3.0);
                }
            }
            callbacks.spawnVfx({
                kind: 'ring',
                x: h.x,
                y: h.y,
                radius: 215,
                color: auraCol,
                ttl: 0.35,
                maxTtl: 0.35
            });
        }
        if (h.toggleAuraTimer <= 0) h.toggleAuraKind = null;
    }
}

});

})(window.ArcadeMod);
