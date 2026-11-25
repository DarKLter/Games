(function(ArcadeMod){
// === MODULE: src/games/legends-arena/mlbb/engine/HeroKitsPart2 ===
ArcadeMod.define("src/games/legends-arena/mlbb/engine/HeroKitsPart2", function(require, module, exports) {
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
    get PART5_HERO_IDS_K_TO_Z () {
        return PART5_HERO_IDS_K_TO_Z;
    },
    get executePart5HeroSkill () {
        return executePart5HeroSkill;
    },
    get stepPart5HeroPassives () {
        return stepPart5HeroPassives;
    }
});
var _mapData = require("../data/mapData");
var _CombatMath = require("./CombatMath");
var _HeroKitsPart1 = require("./HeroKitsPart1");
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
var PART5_HERO_IDS_K_TO_Z = [
    'kagura',
    'kaja',
    'kalea',
    'karina',
    'karrie',
    'khaleed',
    'khufra',
    'kimmy',
    'lancelot',
    'lapu_lapu',
    'layla',
    'leomord',
    'lesley',
    'ling',
    'lolita',
    'lukas',
    'lunox',
    'luo_yi',
    'lylia',
    'marcel',
    'martis',
    'masha',
    'mathilda',
    'melissa',
    'minotaur',
    'minsitthar',
    'miya',
    'moskov',
    'nana',
    'natalia',
    'natan',
    'nolan',
    'novaria',
    'obsidia',
    'odette',
    'paquito',
    'pharsa',
    'phoveus',
    'popol_and_kupa',
    'rafaela',
    'roger',
    'ruby',
    'saber',
    'selena',
    'silvanna',
    'sora',
    'sun',
    'suyou',
    'terizla',
    'thamuz',
    'tigreal',
    'uranus',
    'vale',
    'valentina',
    'valir',
    'vexana',
    'wanwan',
    'x_borg',
    'xavier',
    'yi_sun_shin',
    'yin',
    'yu_zhong',
    'yve',
    'zetian',
    'zhask',
    'zhuxin',
    'zilong'
];
function executePart5HeroSkill(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, helpers) {
    var hid = caster.heroDef.id;
    var callbacks = ctx.callbacks, heroes = ctx.heroes;
    var hitCircle = helpers.hitCircle, findNearestEnemy = helpers.findNearestEnemy, startParabolicLeap = helpers.startParabolicLeap, displaceWithWallPin = helpers.displaceWithWallPin;
    var clampedDist = (0, _CombatMath.clamp)(aimDist || skill.range * 0.65, 65, Math.max(95, skill.range));
    var tx = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * clampedDist, 80, _mapData.WORLD_SIZE - 80);
    var ty = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * clampedDist, 80, _mapData.WORLD_SIZE - 80);
    var elem = (0, _VfxSystem.getHeroElement)(hid, caster.role);
    var dashForward = function dashForward(speed, duration, wallCross) {
        if (wallCross === void 0) wallCross = true;
        caster.dashVx = Math.cos(aimAngle) * speed;
        caster.dashVy = Math.sin(aimAngle) * speed;
        caster.dashTimer = duration;
        caster.dashWallCross = wallCross;
    };
    var cleanseNonSuppression = function cleanseNonSuppression() {
        if (caster.ccType && caster.ccType !== 'suppression') {
            caster.ccType = null;
            caster.ccTimer = 0;
            caster.ccPriority = 0;
        }
        caster.slowTimer = 0;
        caster.slowPct = 0;
    };
    var emitTrail = function emitTrail(fx, fy, ex, ey, count) {
        if (fx === void 0) fx = caster.x;
        if (fy === void 0) fy = caster.y;
        if (ex === void 0) ex = tx;
        if (ey === void 0) ey = ty;
        if (count === void 0) count = 4;
        (0, _VfxSystem.spawnElementalTrailVfx)(callbacks, elem, fx, fy, ex, ey, count);
    };
    // 67. KAGURA — Seimei Umbrella Open, Rasho Flee (Cleanse/Teleport), Yin Yang Overturn (Pull/Knockback)
    if (hid === 'kagura') {
        if (slot === 1) {
            caster.kaguraUmbrella = {
                x: tx,
                y: ty,
                deployed: true
            };
            emitTrail(caster.x, caster.y, tx, ty, 5);
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 135,
                color: '#38BDF8',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 135, dmg * 1.1, 'magic', 'slow', 1.2);
        } else if (slot === 2) {
            var _caster_kaguraUmbrella;
            cleanseNonSuppression();
            if ((_caster_kaguraUmbrella = caster.kaguraUmbrella) == null ? void 0 : _caster_kaguraUmbrella.deployed) {
                var ux = caster.kaguraUmbrella.x;
                var uy = caster.kaguraUmbrella.y;
                caster.x = ux;
                caster.y = uy;
                caster.kaguraUmbrella = null;
                callbacks.grantShield(caster, 300 + caster.magicPow * 0.55);
                hitCircle(ux, uy, 145, dmg, 'magic', 'stun', 0.65);
            } else {
                caster.x = tx;
                caster.y = ty;
                caster.kaguraUmbrella = {
                    x: caster.x - Math.cos(aimAngle) * 120,
                    y: caster.y - Math.sin(aimAngle) * 120,
                    deployed: true
                };
            }
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 115,
                color: '#60A5FA',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else {
            var _caster_kaguraUmbrella1, _caster_kaguraUmbrella2, _caster_kaguraUmbrella3;
            var cx = ((_caster_kaguraUmbrella1 = caster.kaguraUmbrella) == null ? void 0 : _caster_kaguraUmbrella1.deployed) ? caster.kaguraUmbrella.x : caster.x;
            var cy = ((_caster_kaguraUmbrella2 = caster.kaguraUmbrella) == null ? void 0 : _caster_kaguraUmbrella2.deployed) ? caster.kaguraUmbrella.y : caster.y;
            var isDeployed = Boolean((_caster_kaguraUmbrella3 = caster.kaguraUmbrella) == null ? void 0 : _caster_kaguraUmbrella3.deployed);
            callbacks.spawnVfx({
                kind: 'burst',
                x: cx,
                y: cy,
                radius: 220,
                color: '#7DD3FC',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(cx, cy, 220, dmg * 1.28, 'magic', isDeployed ? 'pull' : 'knockback', 1.1, function(h) {
                var ang = isDeployed ? Math.atan2(cy - h.y, cx - h.x) : Math.atan2(h.y - cy, h.x - cx);
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(ang) * 145, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(ang) * 145, 80, _mapData.WORLD_SIZE - 80);
            });
        }
        return true;
    }
    // 68. KAJA — Ring of Order + Lightning Bomb Dash + Divine Judgment (1.5s Un-Purifiable Suppression Drag!)
    if (hid === 'kaja') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#FACC15',
                ttl: 0.5,
                maxTtl: 0.5
            });
            var hits = hitCircle(caster.x, caster.y, 220, dmg, 'magic', 'slow', 1.0);
            if (hits > 0) callbacks.healHero(caster, 140 * hits + caster.magicPow * 0.4, caster);
        } else if (slot === 2) {
            dashForward(1120, 0.28, true);
            emitTrail();
            for(var i = 0; i < 3; i++){
                var bx = caster.x + Math.cos(aimAngle) * (60 + i * 75);
                var by = caster.y + Math.sin(aimAngle) * (60 + i * 75);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: bx,
                    y: by,
                    radius: 75,
                    color: '#FDE047',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
                hitCircle(bx, by, 75, dmg * 0.55, 'magic');
            }
        } else {
            var tgt = findNearestEnemy(300);
            if (tgt) {
                callbacks.dealDamageToHero(caster, tgt, dmg * 1.25, 'magic', false, false, 'Divine Judgment');
                callbacks.applyCc(tgt, 'suppression', 1.5, caster);
                // Drag enemy backward toward Kaja's retreat vector!
                var backAng = aimAngle + Math.PI;
                caster.x = (0, _CombatMath.clamp)(caster.x + Math.cos(backAng) * 140, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(caster.y + Math.sin(backAng) * 140, 80, _mapData.WORLD_SIZE - 80);
                tgt.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 58, 80, _mapData.WORLD_SIZE - 80);
                tgt.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 58, 80, _mapData.WORLD_SIZE - 80);
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt.x,
                    ty: tgt.y,
                    radius: 8,
                    color: '#FACC15',
                    ttl: 0.85,
                    maxTtl: 0.85
                });
            } else {
                hitCircle(tx, ty, 130, dmg, 'magic', 'stun', 1.0);
            }
        }
        return true;
    }
    // 69. KALEA (2025/2026) — Wavebreaker Water Zone + Tidal Strike Wall/Water Leap + Tsunami Slam Tail Grab!
    if (hid === 'kalea') {
        var healLowestAlly = function healLowestAlly(amt) {
            var ally = heroes.filter(function(h) {
                return h.alive && h.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h.x, h.y) <= 520;
            }).sort(function(a, b) {
                return a.hp / a.maxHp - b.hp / b.maxHp;
            })[0];
            if (ally) callbacks.healHero(ally, amt, caster);
        };
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: caster.x,
                y: caster.y,
                radius: 190,
                color: '#06B6D4',
                ttl: 0.65,
                maxTtl: 0.65
            });
            var hits1 = hitCircle(caster.x, caster.y, 190, dmg, 'physical', 'slow', 1.2);
            if (hits1 > 0) healLowestAlly(240 + caster.maxHp * 0.06);
        } else if (slot === 2) {
            startParabolicLeap(aimAngle, Math.min(400, clampedDist), 0.34, true);
            emitTrail();
            hitCircle(tx, ty, 145, dmg * 1.15, 'physical', 'airborne', 0.8);
            healLowestAlly(200 + caster.maxHp * 0.05);
        } else {
            var tgt1 = findNearestEnemy(280);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 185,
                color: '#22D3EE',
                ttl: 0.65,
                maxTtl: 0.65
            });
            if (tgt1) {
                tgt1.x = tx;
                tgt1.y = ty;
                callbacks.dealDamageToHero(caster, tgt1, dmg * 1.35, 'physical', false, false, 'Tsunami Slam');
                callbacks.applyCc(tgt1, 'suppression', 1.2, caster);
                hitCircle(tx, ty, 175, dmg * 0.75, 'physical', 'airborne', 0.75);
                healLowestAlly(360 + caster.maxHp * 0.08);
            } else {
                hitCircle(tx, ty, 175, dmg, 'physical', 'airborne', 0.9);
            }
        }
        return true;
    }
    // 70. KARINA — Dance of Blades (Basic Attack Reflect) + Dance of Death + Shadow Assault (Reset on Kill!)
    if (hid === 'karina') {
        if (slot === 1) {
            caster.physImmuneTimer = Math.max(caster.physImmuneTimer, 3.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.2);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 120,
                color: '#A855F7',
                ttl: 0.55,
                maxTtl: 0.55
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#C084FC',
                ttl: 0.36,
                maxTtl: 0.36,
                angle: aimAngle
            });
            hitCircle(caster.x, caster.y, 185, dmg * 1.1, 'magic');
        } else {
            var tgt2 = findNearestEnemy(460);
            if (tgt2) {
                var wasAlive = tgt2.alive;
                caster.x = (0, _CombatMath.clamp)(tgt2.x - Math.cos(aimAngle) * 42, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt2.y - Math.sin(aimAngle) * 42, 80, _mapData.WORLD_SIZE - 80);
                var missBonus = (tgt2.maxHp - tgt2.hp) * 0.14;
                callbacks.dealDamageToHero(caster, tgt2, dmg * 1.25, 'magic', false, false, 'Shadow Assault');
                callbacks.dealDamageToHero(caster, tgt2, missBonus, 'true', false, false, 'Shadow Combo');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt2.x,
                    y: tgt2.y,
                    radius: 125,
                    color: '#7E22CE',
                    ttl: 0.5,
                    maxTtl: 0.5
                });
                if (wasAlive && !tgt2.alive) caster.skillCds[2] = 0.5;
            } else {
                dashForward(1200, 0.25, true);
                hitCircle(tx, ty, 120, dmg, 'magic');
            }
        }
        return true;
    }
    // 71. KARRIE — Spinning Wheel + Phantom Step + Speedy Lightwheel (%Max HP True Dmg Tank Shredder!)
    if (hid === 'karrie') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 860,
                vy: Math.sin(aimAngle) * 860,
                radius: 42,
                rangeLeft: 560,
                damage: dmg,
                damageType: 'physical',
                color: '#FDE047',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.2,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            dashForward(1080, 0.24, true);
            var tgt3 = findNearestEnemy(440);
            if (tgt3) {
                callbacks.dealDamageToHero(caster, tgt3, dmg, 'physical', false, false, 'Phantom Step');
                callbacks.dealDamageToHero(caster, tgt3, tgt3.maxHp * 0.08, 'true', false, false, 'Lightwheel Mark');
            }
        } else {
            caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 6.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 140,
                color: '#FEF08A',
                ttl: 0.55,
                maxTtl: 0.55
            });
            var tgt4 = findNearestEnemy(460);
            if (tgt4) {
                callbacks.dealDamageToHero(caster, tgt4, dmg * 0.8, 'physical', false, false, 'Speedy Lightwheel');
                callbacks.dealDamageToHero(caster, tgt4, tgt4.maxHp * 0.1, 'true', false, false, 'Lightwheel Mark');
            }
        }
        return true;
    }
    // 72. KHALEED — Desert Tornado (3 Pulls) + Quicksand Guard (Massive Heal) + Raging Sandstorm (CC-Immune)
    if (hid === 'khaleed') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#F59E0B',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(caster.x, caster.y, 185, dmg * 1.18, 'physical', 'pull', 0.45);
            caster.recastSlot = isRecast ? null : 1;
            caster.recastTimer = isRecast ? 0 : 2.2;
        } else if (slot === 2) {
            callbacks.healHero(caster, caster.maxHp * 0.28, caster);
            callbacks.grantShield(caster, 280 + caster.level * 28);
            callbacks.spawnVfx({
                kind: 'crater',
                x: caster.x,
                y: caster.y,
                radius: 155,
                color: '#D97706',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(caster.x, caster.y, 155, dmg * 0.4, 'physical', 'slow', 1.2);
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.5);
            dashForward(1040, 0.44, true);
            emitTrail(caster.x, caster.y, tx, ty, 6);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 220,
                color: '#F59E0B',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 220, dmg * 1.3, 'physical', 'stun', 1.15);
        }
        return true;
    }
    // 73. KHUFRA — Tyrant's Revenge Leap + Bouncing Ball (Grounds/Blocks Dashes!) + Tyrant's Rage Wall-Pin!
    if (hid === 'khufra') {
        if (slot === 1) {
            startParabolicLeap(aimAngle, Math.min(580, clampedDist), 0.42, true);
            emitTrail();
            hitCircle(tx, ty, 150, dmg * 1.1, 'physical', 'airborne', 1.0);
        } else if (slot === 2) {
            callbacks.grantShield(caster, 340 + caster.maxHp * 0.08);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#A855F7',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(caster.x, caster.y, 195, dmg * 0.9, 'magic', 'grounded', 2.0);
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 235,
                color: '#9333EA',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(caster.x, caster.y, 235, dmg * 1.15, 'physical', 'pull', 0.6, function(h) {
                displaceWithWallPin(h, aimAngle, 165, caster, 320 + caster.physAtk * 0.9, 1.45);
            });
        }
        return true;
    }
    // 74. KIMMY — Plasma Splash + Jetpack Dash + Maximum Charge Cannon
    if (hid === 'kimmy') {
        if (slot === 1) {
            for(var i1 = -1; i1 <= 1; i1++){
                var a = aimAngle + i1 * 0.12;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a) * 980,
                    vy: Math.sin(a) * 980,
                    radius: 24,
                    rangeLeft: 560,
                    damage: dmg * 0.55,
                    damageType: 'magic',
                    color: '#FACC15',
                    kind: 'skill_line',
                    life: 0.85,
                    maxLife: 0.85
                });
            }
        } else if (slot === 2) {
            dashForward(1080, 0.26, true);
            callbacks.spawnVfx({
                kind: 'crater',
                x: caster.x,
                y: caster.y,
                radius: 140,
                color: '#FDE047',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(caster.x, caster.y, 140, dmg * 0.85, 'magic', 'slow', 1.4);
        } else {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1160,
                vy: Math.sin(aimAngle) * 1160,
                radius: 52,
                rangeLeft: 1050,
                damage: dmg * 1.4,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                life: 1.25,
                maxLife: 1.25
            });
        }
        return true;
    }
    // 75. LANCELOT — Puncture (Unmarked Reset!) + Thorned Rose (Untargetable Triangle) + Phantom Execution
    if (hid === 'lancelot') {
        caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
        caster.passiveTimer = 4.0;
        var soulMult = 1 + caster.passiveStacks * 0.075;
        if (slot === 1) {
            dashForward(1280, 0.22, true);
            emitTrail();
            var unmarkedHit = false;
            hitCircle(caster.x + Math.cos(aimAngle) * 180, caster.y + Math.sin(aimAngle) * 180, 120, dmg * soulMult, 'physical', undefined, undefined, function(h) {
                if (h.markedTimer <= 0) {
                    h.markedTimer = 5.0;
                    h.markedBy = caster.id;
                    unmarkedHit = true;
                }
            });
            if (unmarkedHit) caster.skillCds[0] = 0.25;
        } else if (slot === 2) {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.65);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 180,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 180, dmg * 1.22 * soulMult, 'physical', 'slow', 0.8);
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.7);
            dashForward(1360, 0.3, true);
            emitTrail(caster.x, caster.y, tx, ty, 6);
            hitCircle(tx, ty, 155, dmg * 1.45 * soulMult, 'physical');
        }
        return true;
    }
    // 76. LAPU-LAPU — Twin Boomerangs + Dash + Bravest Fighter (Heavy-Sword Stance + CC-Immune 3-Slam!)
    if (hid === 'lapu_lapu') {
        if (slot === 1) {
            if (caster.altFormActive) {
                callbacks.spawnVfx({
                    kind: 'crater',
                    x: tx,
                    y: ty,
                    radius: 175,
                    color: '#F97316',
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                hitCircle(tx, ty, 175, dmg * 1.3, 'physical', 'stun', 1.0);
            } else {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 860,
                    vy: Math.sin(aimAngle) * 860,
                    radius: 34,
                    rangeLeft: 520,
                    damage: dmg,
                    damageType: 'physical',
                    color: '#FB923C',
                    kind: 'boomerang',
                    pierce: true,
                    returning: false,
                    life: 1.5,
                    maxLife: 1.5
                });
            }
        } else if (slot === 2) {
            dashForward(1120, 0.28, true);
            if (caster.altFormActive) {
                callbacks.grantShield(caster, 380 + caster.physAtk * 0.9);
            }
            hitCircle(tx, ty, 145, dmg * 1.05, 'physical');
        } else {
            caster.altFormActive = true;
            caster.altFormTimer = 10.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.2);
            callbacks.grantShield(caster, 420 + caster.level * 40);
            startParabolicLeap(aimAngle, Math.min(340, clampedDist), 0.34, true);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 220,
                color: '#EF4444',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 220, dmg * 1.38, 'physical', 'slow', 1.2);
        }
        return true;
    }
    // 77. LAYLA — Malefic Bomb + Void Projectile Stun + Destruction Rush Beam (Distance-Scaled Malefic Gun!)
    if (hid === 'layla') {
        var distScale = 1 + (0, _CombatMath.clamp)(clampedDist / 900, 0, 0.35);
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.5);
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1080,
                vy: Math.sin(aimAngle) * 1080,
                radius: 36,
                rangeLeft: 660,
                damage: dmg * distScale,
                damageType: 'physical',
                color: '#38BDF8',
                kind: 'skill_line',
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 135,
                color: '#A855F7',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(tx, ty, 135, dmg * distScale, 'physical', 'stun', 0.45);
        } else {
            var ex = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 1050, 80, _mapData.WORLD_SIZE - 80);
            var ey = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 1050, 80, _mapData.WORLD_SIZE - 80);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex,
                ty: ey,
                radius: 75,
                color: '#FACC15',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            for(var i2 = 1; i2 <= 5; i2++){
                hitCircle(caster.x + Math.cos(aimAngle) * (i2 * 200), caster.y + Math.sin(aimAngle) * (i2 * 200), 105, dmg * 0.55 * distScale, 'physical');
            }
        }
        return true;
    }
    // 78. LEOMORD — Momentum Shield Slash + Decimation Dash + Phantom Steed (Barbiel Horse Mount!)
    if (hid === 'leomord') {
        var dealOathDmg = function dealOathDmg(h, raw) {
            var isCrit = h.hp / h.maxHp < 0.5;
            callbacks.dealDamageToHero(caster, h, isCrit ? raw * 1.85 : raw, 'physical', isCrit, false, skill.name);
        };
        if (slot === 1) {
            callbacks.grantShield(caster, 320 + caster.physAtk * 0.8);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 165,
                color: '#94A3B8',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            for(var _iterator = _create_for_of_iterator_helper_loose(heroes), _step; !(_step = _iterator()).done;){
                var h = _step.value;
                if (h.alive && h.team !== caster.team && (0, _CombatMath.dist)(tx, ty, h.x, h.y) <= 165 + h.radius) {
                    dealOathDmg(h, dmg * 1.15);
                    callbacks.applyCc(h, 'slow', 1.0, caster);
                }
            }
        } else if (slot === 2) {
            dashForward(1150, 0.28, true);
            hitCircle(tx, ty, 130, dmg, 'physical', caster.altFormActive ? 'knockback' : 'slow', 0.8);
        } else {
            caster.altFormActive = true;
            caster.altFormTimer = 12.0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.42);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 12.0);
            callbacks.grantShield(caster, 540 + caster.level * 45);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 210,
                color: '#64748B',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(caster.x, caster.y, 210, dmg * 1.15, 'physical', 'knockback', 0.7);
        }
        return true;
    }
    // 79. LESLEY — Camouflage True-Dmg Crit + Tactical Grenade Hop + Ultimate Snipe (4 Homing Bullets + Reveal!)
    if (hid === 'lesley') {
        if (slot === 1) {
            caster.stealthTimer = Math.max(caster.stealthTimer, 3.0);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.4);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 95,
                color: '#EF4444',
                ttl: 0.45,
                maxTtl: 0.45
            });
            var tgt5 = findNearestEnemy(520);
            if (tgt5) callbacks.dealDamageToHero(caster, tgt5, dmg * 0.95, 'true', true, false, 'Lethal Shoot');
        } else if (slot === 2) {
            // Hop backward while knocking enemy back
            caster.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 145, 80, _mapData.WORLD_SIZE - 80);
            caster.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 145, 80, _mapData.WORLD_SIZE - 80);
            hitCircle(tx, ty, 135, dmg, 'physical', 'knockback', 0.7);
        } else {
            callbacks.triggerGlobalReveal == null ? void 0 : callbacks.triggerGlobalReveal.call(callbacks, caster.team, 4.0);
            var tgt6 = findNearestEnemy(1100);
            if (tgt6) {
                tgt6.revealedTimer = Math.max(tgt6.revealedTimer, 4.0);
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt6.x,
                    ty: tgt6.y,
                    radius: 18,
                    color: '#EF4444',
                    ttl: 0.7,
                    maxTtl: 0.7
                });
                callbacks.dealDamageToHero(caster, tgt6, dmg * 1.45, 'physical', true, false, 'Ultimate Snipe');
            } else {
                hitCircle(tx, ty, 140, dmg, 'physical');
            }
        }
        return true;
    }
    // 80. LING — Finch Poise (Leaps ONTO WALLS!) + Defiant Sword Dash + Tempest of Blades (Untargetable 4-Sword Sky Slam!)
    if (hid === 'ling') {
        if (slot === 1) {
            var _ctx_tempWalls;
            var wallPt = (0, _HeroKitsPart1.findNearestWallPointAlongRay)(caster.x, caster.y, aimAngle, 640, (_ctx_tempWalls = ctx.tempWalls) != null ? _ctx_tempWalls : []);
            if (wallPt) {
                caster.x = wallPt.x;
                caster.y = wallPt.y;
            } else {
                caster.x = tx;
                caster.y = ty;
            }
            caster.lingWallTimer = 5.0;
            caster.wallPhaseTimer = Math.max(caster.wallPhaseTimer, 5.0);
            caster.leapZ = 1.45;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 105,
                color: '#67E8F9',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (slot === 2) {
            caster.lingWallTimer = 0;
            dashForward(1280, 0.22, true);
            emitTrail();
            hitCircle(tx, ty, 125, dmg * 1.18, 'physical', 'slow', 0.6);
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 1.5);
            caster.leapZ = 1.85;
            caster.leapTimer = 0.6;
            caster.leapDuration = 0.6;
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 225,
                color: '#38BDF8',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(tx, ty, 225, dmg * 1.35, 'physical', 'airborne', 1.0);
            // 4 Sword field instantly refreshes Defiant Sword CD!
            caster.skillCds[1] = 0;
        }
        return true;
    }
    // 81. LOLITA — Power Charge Stun + Guardian's Reflection Shield + Noumenon Blast Huge Cone Stun!
    if (hid === 'lolita') {
        if (slot === 1) {
            dashForward(1040, 0.26, true);
            hitCircle(tx, ty, 130, dmg, 'physical', 'stun', 0.9);
        } else if (slot === 2) {
            caster.physImmuneTimer = Math.max(caster.physImmuneTimer, 2.8);
            callbacks.grantShield(caster, 520 + caster.maxHp * 0.12);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 165,
                color: '#FACC15',
                ttl: 0.75,
                maxTtl: 0.75
            });
            // Reflect wave back toward aim direction
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 920,
                vy: Math.sin(aimAngle) * 920,
                radius: 44,
                rangeLeft: 560,
                damage: dmg * 1.05,
                damageType: 'physical',
                color: '#FDE047',
                kind: 'skill_line',
                life: 0.9,
                maxLife: 0.9
            });
        } else {
            callbacks.grantShield(caster, 420 + caster.maxHp * 0.1);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 265,
                color: '#FACC15',
                ttl: 0.7,
                maxTtl: 0.7
            });
            hitCircle(tx, ty, 265, dmg * 1.25, 'physical', 'stun', 1.65);
        }
        return true;
    }
    // 82. LUKAS — Flash Combo + Flash Step Blink + Unleash the Beast (Giant Sacred Beast Form + Shockwave!)
    if (hid === 'lukas') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: caster.altFormActive ? 195 : 140,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, caster.altFormActive ? 195 : 140, dmg * (caster.altFormActive ? 1.35 : 1.05), 'physical', 'stun', 0.75);
            callbacks.healHero(caster, 180 + caster.maxHp * 0.06, caster);
        } else if (slot === 2) {
            var tgt7 = findNearestEnemy(440);
            if (tgt7) {
                caster.x = (0, _CombatMath.clamp)(tgt7.x + Math.cos(aimAngle) * 48, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt7.y + Math.sin(aimAngle) * 48, 80, _mapData.WORLD_SIZE - 80);
            } else {
                caster.x = tx;
                caster.y = ty;
            }
            hitCircle(caster.x, caster.y, 130, dmg, 'physical');
        } else {
            caster.altFormActive = true;
            caster.altFormTimer = 10.0;
            caster.modelScale = 1.36;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.5);
            callbacks.grantShield(caster, 520 + caster.maxHp * 0.12);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 240,
                color: '#FDE047',
                ttl: 0.7,
                maxTtl: 0.7
            });
            hitCircle(tx, ty, 240, dmg * 1.45, 'physical', 'knockback', 0.9);
        }
        return true;
    }
    // 83. LUNOX — Starlight Pulse (Order Heal) + Chaos Assault (%HP Burst) + Dual Brilliance/Darkening Ult!
    if (hid === 'lunox') {
        if (slot === 1) {
            caster.passiveStacks = Math.max(-2, caster.passiveStacks - 1); // Order shift
            callbacks.healHero(caster, 240 + caster.magicPow * 0.55, caster);
            hitCircle(caster.x, caster.y, 210, dmg, 'magic');
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 210,
                color: '#FEF08A',
                ttl: 0.5,
                maxTtl: 0.5
            });
        } else if (slot === 2) {
            caster.passiveStacks = Math.min(2, caster.passiveStacks + 1); // Chaos shift
            var tgt8 = findNearestEnemy(520);
            if (tgt8) {
                callbacks.dealDamageToHero(caster, tgt8, dmg + tgt8.maxHp * 0.055, 'magic', false, false, 'Chaos Assault');
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt8.x,
                    ty: tgt8.y,
                    radius: 14,
                    color: '#A855F7',
                    ttl: 0.32,
                    maxTtl: 0.32
                });
            } else {
                hitCircle(tx, ty, 120, dmg, 'magic');
            }
        } else {
            if (caster.passiveStacks <= 0) {
                // Order: Brilliance (2.5s invincible light orb!)
                caster.untargetableTimer = Math.max(caster.untargetableTimer, 2.5);
                caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.5);
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: caster.x,
                    y: caster.y,
                    radius: 220,
                    color: '#FEF08A',
                    ttl: 0.85,
                    maxTtl: 0.85
                });
                hitCircle(caster.x, caster.y, 220, dmg * 1.25, 'magic');
            } else {
                // Chaos: Darkening (blink + zero-CD Chaos Assault!)
                caster.x = tx;
                caster.y = ty;
                caster.skillCds[1] = 0;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tx,
                    y: ty,
                    radius: 185,
                    color: '#7E22CE',
                    ttl: 0.6,
                    maxTtl: 0.6
                });
                hitCircle(tx, ty, 185, dmg * 1.35, 'magic', 'slow', 1.2);
            }
        }
        return true;
    }
    // 84. LUO YI — Alternating Yin/Yang Magnetic Duality Explosion + Diversion Team Teleport!
    if (hid === 'luo_yi') {
        var isYang = caster.passiveStacks % 2 === 0;
        caster.passiveStacks = (caster.passiveStacks + 1) % 2;
        var col = isYang ? '#FACC15' : '#A855F7';
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 980,
                vy: Math.sin(aimAngle) * 980,
                radius: 36,
                rangeLeft: 620,
                damage: dmg,
                damageType: 'magic',
                color: col,
                kind: 'skill_line',
                life: 0.95,
                maxLife: 0.95
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 175,
                color: col,
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(tx, ty, 175, dmg * 1.25, 'magic', 'vortex', 1.15);
            callbacks.grantShield(caster, 280 + caster.magicPow * 0.5);
        } else {
            var destX = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 760, 100, _mapData.WORLD_SIZE - 100);
            var destY = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 760, 100, _mapData.WORLD_SIZE - 100);
            for(var _iterator1 = _create_for_of_iterator_helper_loose(heroes), _step1; !(_step1 = _iterator1()).done;){
                var h1 = _step1.value;
                if (h1.alive && h1.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h1.x, h1.y) <= 230) {
                    h1.x = (0, _CombatMath.clamp)(destX + (h1.x - caster.x) * 0.35, 90, _mapData.WORLD_SIZE - 90);
                    h1.y = (0, _CombatMath.clamp)(destY + (h1.y - caster.y) * 0.35, 90, _mapData.WORLD_SIZE - 90);
                }
            }
            callbacks.spawnVfx({
                kind: 'ring',
                x: destX,
                y: destY,
                radius: 220,
                color: '#C084FC',
                ttl: 0.75,
                maxTtl: 0.75
            });
        }
        return true;
    }
    // 85. LYLIA — Magic Shockwave + Shadow Energy Traps + Black Shoes (4s Time Rewind!)
    if (hid === 'lylia') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 900,
                vy: Math.sin(aimAngle) * 900,
                radius: 34,
                rangeLeft: 580,
                damage: dmg,
                damageType: 'magic',
                color: '#C084FC',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.2,
                life: 0.95,
                maxLife: 0.95
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 145,
                color: '#7E22CE',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 145, dmg * 1.15, 'magic', 'slow', 1.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.0);
        } else {
            // Black Shoes: rewind 4 seconds back restoring HP, Mana & resetting S2!
            var snap = caster.lyliaTrail && caster.lyliaTrail.length > 0 ? caster.lyliaTrail[0] : null;
            if (snap) {
                caster.x = snap.x;
                caster.y = snap.y;
                caster.hp = Math.max(caster.hp, Math.min(caster.maxHp, snap.hp + caster.maxHp * 0.15));
                caster.mana = Math.max(caster.mana, snap.mana);
            } else {
                callbacks.healHero(caster, caster.maxHp * 0.35, caster);
            }
            caster.skillCds[1] = 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.4);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.5);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 165,
                color: '#E879F9',
                ttl: 0.65,
                maxTtl: 0.65
            });
        }
        return true;
    }
    // 86. MARCEL (2026) — Iron Vault Shield Rush + Aegis Lock Counter Stun + Fortress Reckoning Arena Ring!
    if (hid === 'marcel') {
        if (slot === 1) {
            dashForward(1020, 0.28, false);
            callbacks.grantShield(caster, 360 + caster.maxHp * 0.08);
            hitCircle(tx, ty, 155, dmg, 'physical', 'slow', 1.2);
        } else if (slot === 2) {
            callbacks.grantShield(caster, 420 + caster.maxHp * 0.1);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 180,
                color: '#FACC15',
                ttl: 0.48,
                maxTtl: 0.48,
                angle: aimAngle
            });
            hitCircle(tx, ty, 180, dmg * 1.15, 'physical', 'stun', 1.25);
        } else {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 260,
                color: '#F59E0B',
                ttl: 1.1,
                maxTtl: 1.1
            });
            hitCircle(caster.x, caster.y, 260, dmg * 1.25, 'physical', 'grounded', 2.8);
            for(var _iterator2 = _create_for_of_iterator_helper_loose(heroes), _step2; !(_step2 = _iterator2()).done;){
                var h2 = _step2.value;
                if (h2.alive && h2.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h2.x, h2.y) <= 280) {
                    callbacks.grantShield(h2, 420 + caster.maxHp * 0.08);
                }
            }
        }
        return true;
    }
    // 87. MARTIS — Ashura Aura Pinch + Mortal Coil (CC-Immune Multi-Dash) + Decimation (True Dmg Execute Reset!)
    if (hid === 'martis') {
        caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
        caster.passiveTimer = 4.0;
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: '#E11D48',
                ttl: 0.4,
                maxTtl: 0.4,
                angle: aimAngle
            });
            hitCircle(tx, ty, 175, dmg, 'physical', 'pull', 0.65);
        } else if (slot === 2) {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.4);
            dashForward(1080, 0.34, false);
            emitTrail();
            hitCircle(tx, ty, 155, dmg * 1.15, 'physical', isRecast ? 'airborne' : 'knockback', 0.85);
            caster.recastSlot = isRecast ? null : 2;
            caster.recastTimer = isRecast ? 0 : 2.5;
        } else {
            var tgt9 = findNearestEnemy(380);
            if (tgt9) {
                var wasAlive1 = tgt9.alive;
                var lowHp = tgt9.hp / tgt9.maxHp < 0.5;
                caster.x = (0, _CombatMath.clamp)(tgt9.x - Math.cos(aimAngle) * 45, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt9.y - Math.sin(aimAngle) * 45, 80, _mapData.WORLD_SIZE - 80);
                callbacks.dealDamageToHero(caster, tgt9, dmg * (lowHp ? 1.55 : 1.15), lowHp ? 'true' : 'physical', false, false, 'Decimation');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt9.x,
                    y: tgt9.y,
                    radius: 145,
                    color: '#FB7185',
                    ttl: 0.55,
                    maxTtl: 0.55
                });
                if (wasAlive1 && !tgt9.alive) {
                    caster.skillCds[2] = 0.25;
                    caster.speedBoostPct = 0.85;
                    caster.speedBoostTimer = 5.0;
                }
            } else {
                hitCircle(tx, ty, 145, dmg, 'physical');
            }
        }
        return true;
    }
    // 88. MASHA — Wild Power (%HP Claws) + Howl Shock Disarm + Thunderclap CC-Immune Burst!
    if (hid === 'masha') {
        if (caster.mashaBars === undefined) caster.mashaBars = 3;
        if (slot === 1) {
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.5);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.5);
            hitCircle(caster.x, caster.y, 150, dmg + caster.maxHp * 0.06, 'physical');
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 225,
                color: '#F97316',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(caster.x, caster.y, 225, dmg, 'physical', 'disarm', 1.8);
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.2);
            dashForward(1220, 0.3, true);
            hitCircle(tx, ty, 175, dmg * 1.4 + caster.maxHp * 0.1, 'physical', 'knockback', 0.8);
        }
        return true;
    }
    // 89. MATHILDA — Soul Bloom (6 Wisps) + Guiding Wind (Ally Shield + Dash Pull!) + Circling Eagle Orbit Slam!
    if (hid === 'mathilda') {
        if (slot === 1) {
            for(var i3 = 0; i3 < 6; i3++){
                var a1 = aimAngle + (i3 - 2.5) * 0.18;
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(a1) * 920,
                    vy: Math.sin(a1) * 920,
                    radius: 18,
                    rangeLeft: 520,
                    damage: dmg * 0.32,
                    damageType: 'magic',
                    color: '#34D399',
                    kind: 'skill_line',
                    life: 0.85,
                    maxLife: 0.85
                });
            }
        } else if (slot === 2) {
            dashForward(1150, 0.28, true);
            callbacks.grantShield(caster, 420 + caster.magicPow * 0.75);
            for(var _iterator3 = _create_for_of_iterator_helper_loose(heroes), _step3; !(_step3 = _iterator3()).done;){
                var h3 = _step3.value;
                if (h3.alive && h3.team === caster.team && h3.id !== caster.id && (0, _CombatMath.dist)(caster.x, caster.y, h3.x, h3.y) <= 380) {
                    callbacks.grantShield(h3, 420 + caster.magicPow * 0.75);
                    h3.speedBoostPct = Math.max(h3.speedBoostPct, 0.35);
                    h3.speedBoostTimer = Math.max(h3.speedBoostTimer, 3.0);
                }
            }
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#6EE7B7',
                ttl: 0.55,
                maxTtl: 0.55
            });
        } else {
            var tgt10 = findNearestEnemy(560);
            if (tgt10) {
                caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.8);
                caster.x = (0, _CombatMath.clamp)(tgt10.x - Math.cos(aimAngle) * 55, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt10.y - Math.sin(aimAngle) * 55, 80, _mapData.WORLD_SIZE - 80);
                callbacks.dealDamageToHero(caster, tgt10, dmg * 1.32, 'magic', false, false, 'Circling Eagle');
                callbacks.applyCc(tgt10, 'airborne', 0.85, caster);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt10.x,
                    y: tgt10.y,
                    radius: 180,
                    color: '#10B981',
                    ttl: 0.65,
                    maxTtl: 0.65
                });
            } else {
                hitCircle(tx, ty, 160, dmg, 'magic', 'knockback', 0.7);
            }
        }
        return true;
    }
    // 90. MELISSA — Falling! Dash + Go! Muddles! Linked Doll + Go Away! Impenetrable Knockback Barrier!
    if (hid === 'melissa') {
        if (slot === 1) {
            dashForward(1120, 0.24, true);
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
            emitTrail();
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 195,
                color: '#C084FC',
                ttl: 0.85,
                maxTtl: 0.85
            });
            hitCircle(tx, ty, 195, dmg * 1.15, 'physical', 'slow', 1.4);
        } else {
            callbacks.grantShield(caster, 460 + caster.level * 35);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 225,
                color: '#A855F7',
                ttl: 1.0,
                maxTtl: 1.0
            });
            hitCircle(caster.x, caster.y, 225, dmg * 1.1, 'magic', 'knockback', 1.1, function(h) {
                var ang = Math.atan2(h.y - caster.y, h.x - caster.x);
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(ang) * 185, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(ang) * 185, 80, _mapData.WORLD_SIZE - 80);
            });
        }
        return true;
    }
    // 91. MINOTAUR — Despair Stomp Leap + Motivation Roar AoE Heal + Minoan Fury (CC-Immune 3 Smashes!)
    if (hid === 'minotaur') {
        if (slot === 1) {
            startParabolicLeap(aimAngle, Math.min(360, clampedDist), 0.34, true);
            hitCircle(tx, ty, 165, dmg, 'physical', 'airborne', 0.85);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 260,
                color: '#2CE58B',
                ttl: 0.6,
                maxTtl: 0.6
            });
            for(var _iterator4 = _create_for_of_iterator_helper_loose(heroes), _step4; !(_step4 = _iterator4()).done;){
                var h4 = _step4.value;
                if (h4.alive && h4.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h4.x, h4.y) <= 260) {
                    callbacks.healHero(h4, 320 + caster.maxHp * 0.08, caster);
                }
            }
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.2);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 265,
                color: '#F97316',
                ttl: 0.85,
                maxTtl: 0.85
            });
            hitCircle(caster.x, caster.y, 265, dmg * 1.3, 'physical', 'airborne', 1.5);
        }
        return true;
    }
    // 92. MINSITTHAR — Spear of Glory Line Pull + Shield Assault + King's Calling (Royal Guards GROUNDING!)
    if (hid === 'minsitthar') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 24,
                color: '#FACC15',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, 125, dmg, 'physical', 'pull', 0.8, function(h) {
                h.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 72, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 72, 80, _mapData.WORLD_SIZE - 80);
            });
        } else if (slot === 2) {
            callbacks.grantShield(caster, 420 + caster.physAtk * 0.9);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 160,
                color: '#FDE047',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 160, dmg * 1.15, 'physical', 'stun', 0.8);
        } else {
            caster.x = tx;
            caster.y = ty;
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 245,
                color: '#F5C451',
                ttl: 1.2,
                maxTtl: 1.2
            });
            hitCircle(tx, ty, 245, dmg * 1.3, 'physical', 'grounded', 3.5);
        }
        return true;
    }
    // 93. MIYA — Moon Arrow Split + Arrow of Eclipse Root + Hidden Moonlight (Cleanse + Stealth + Full Stacks!)
    if (hid === 'miya') {
        if (slot === 1) {
            caster.passiveTimer = Math.max(caster.passiveTimer, 5.0);
            caster.passiveStacks = Math.min(5, caster.passiveStacks + 2);
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 110,
                color: '#60A5FA',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 145,
                color: '#93C5FD',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 145, dmg, 'physical', 'root', 1.25);
        } else {
            cleanseNonSuppression();
            caster.stealthTimer = Math.max(caster.stealthTimer, 2.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.5);
            caster.passiveStacks = 5;
            caster.passiveTimer = 6.0;
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 145,
                color: '#E0F2FE',
                ttl: 0.5,
                maxTtl: 0.5
            });
        }
        return true;
    }
    // 94. MOSKOV — Abyss Walker Blink + Spear of Misery Wall-Pin Stun + Global Spear of Destruction Teleport!
    if (hid === 'moskov') {
        if (slot === 1) {
            caster.x = tx;
            caster.y = ty;
            caster.inspireTimer = Math.max(caster.inspireTimer, 3.5);
            emitTrail();
        } else if (slot === 2) {
            var tgt11 = findNearestEnemy(440);
            if (tgt11) {
                callbacks.dealDamageToHero(caster, tgt11, dmg, 'physical', false, false, 'Spear of Misery');
                displaceWithWallPin(tgt11, aimAngle, 185, caster, 280 + caster.physAtk * 0.85, 1.6);
            } else {
                hitCircle(tx, ty, 120, dmg, 'physical', 'knockback', 0.8);
            }
        } else {
            if (isRecast && caster.snapbackAnchor) {
                caster.x = caster.snapbackAnchor.x;
                caster.y = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: caster.x,
                    y: caster.y,
                    radius: 135,
                    color: '#A855F7',
                    ttl: 0.45,
                    maxTtl: 0.45
                });
            } else {
                var tgt12 = findNearestEnemy(3800);
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 1450,
                    vy: Math.sin(aimAngle) * 1450,
                    radius: 42,
                    rangeLeft: 3200,
                    damage: dmg * 1.35,
                    damageType: 'physical',
                    color: '#C084FC',
                    kind: 'skill_line',
                    pierce: true,
                    life: 2.2,
                    maxLife: 2.2
                });
                if (tgt12) {
                    caster.snapbackAnchor = {
                        x: (0, _CombatMath.clamp)(tgt12.x - 42, 80, _mapData.WORLD_SIZE - 80),
                        y: (0, _CombatMath.clamp)(tgt12.y, 80, _mapData.WORLD_SIZE - 80),
                        ttl: 4.0,
                        slot: 3
                    };
                    caster.recastSlot = 3;
                    caster.recastTimer = 4.0;
                }
            }
        }
        return true;
    }
    // 95. NANA — Magic Boomerang + Molina Smooch Polymorph + Molina Blitz 3-Paw Stun!
    if (hid === 'nana') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 860,
                vy: Math.sin(aimAngle) * 860,
                radius: 44,
                rangeLeft: 620,
                damage: dmg,
                damageType: 'magic',
                color: '#F472B6',
                kind: 'boomerang',
                pierce: true,
                returning: false,
                life: 1.7,
                maxLife: 1.7
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 145,
                color: '#FBBF24',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(tx, ty, 145, dmg, 'magic', 'transform', 1.5);
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 195,
                color: '#F472B6',
                ttl: 0.7,
                maxTtl: 0.7
            });
            hitCircle(tx, ty, 195, dmg * 1.32, 'magic', 'stun', 1.15);
        }
        return true;
    }
    // 96. NATALIA — 2-Stage Claw Dash + Smoke Bomb (100% Basic Attack Immune!) + The Hunt (Instant Camo + Silence!)
    if (hid === 'natalia') {
        if (slot === 1) {
            dashForward(1240, 0.22, true);
            var hits2 = hitCircle(tx, ty, 120, dmg, 'physical');
            if (hits2 > 0 && !isRecast) {
                caster.recastSlot = 1;
                caster.recastTimer = 3.0;
            }
        } else if (slot === 2) {
            caster.physImmuneTimer = Math.max(caster.physImmuneTimer, 3.6);
            callbacks.spawnVfx({
                kind: 'crater',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#64748B',
                ttl: 0.9,
                maxTtl: 0.9
            });
            hitCircle(caster.x, caster.y, 185, dmg * 0.5, 'physical', 'slow', 1.5);
        } else {
            caster.stealthTimer = Math.max(caster.stealthTimer, 3.5);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.5);
            var tgt13 = findNearestEnemy(400);
            if (tgt13) {
                caster.x = (0, _CombatMath.clamp)(tgt13.x - Math.cos(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt13.y - Math.sin(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                callbacks.dealDamageToHero(caster, tgt13, dmg * 1.25, 'physical', true, false, 'The Hunt');
                callbacks.applyCc(tgt13, 'silence', 1.0, caster);
            }
        }
        return true;
    }
    // 97. NATAN — Superposition Wave + Interference! Gravity Pull/Push + Entropy? Reverse-Clone Swap!
    if (hid === 'natan') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1040,
                vy: Math.sin(aimAngle) * 1040,
                radius: 40,
                rangeLeft: 660,
                damage: dmg,
                damageType: 'magic',
                color: '#E879F9',
                kind: 'skill_line',
                pierce: true,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#A855F7',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 165, dmg, 'magic', 'knockback', 0.85);
        } else {
            if (isRecast && caster.snapbackAnchor) {
                caster.x = caster.snapbackAnchor.x;
                caster.y = caster.snapbackAnchor.y;
                caster.snapbackAnchor = null;
            } else {
                caster.snapbackAnchor = {
                    x: tx,
                    y: ty,
                    ttl: 6.0,
                    slot: 3
                };
                caster.recastSlot = 3;
                caster.recastTimer = 6.0;
                caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
                callbacks.spawnVfx({
                    kind: 'ring',
                    x: tx,
                    y: ty,
                    radius: 120,
                    color: '#F0ABFC',
                    ttl: 0.85,
                    maxTtl: 0.85
                });
                hitCircle(tx, ty, 150, dmg * 1.15, 'magic');
            }
        }
        return true;
    }
    // 98. NOLAN — Dimensional Rift Expansion + Gauge Dash + Fracture (Cleanse + 3 Rifts + Backstep!)
    if (hid === 'nolan') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 165,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 165, dmg * 1.12, 'physical', 'vortex', 0.5);
        } else if (slot === 2) {
            dashForward(1260, 0.22, true);
            emitTrail();
            hitCircle(tx, ty, 125, dmg, 'physical', 'slow', 0.7);
        } else {
            cleanseNonSuppression();
            hitCircle(tx, ty, 200, dmg * 1.4, 'physical', 'vortex', 0.85);
            caster.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 160, 80, _mapData.WORLD_SIZE - 80);
            caster.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 160, 80, _mapData.WORLD_SIZE - 80);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 200,
                color: '#A855F7',
                ttl: 0.6,
                maxTtl: 0.6
            });
        }
        return true;
    }
    // 99. NOVARIA — Astral Meteor + Astral Recall (Walks Through Walls + 2.5x Distance Sniper!) + Astral Echo Reveal!
    if (hid === 'novaria') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#818CF8',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 165, dmg, 'magic', 'slow', 1.5);
        } else if (slot === 2) {
            caster.wallPhaseTimer = Math.max(caster.wallPhaseTimer, 4.0);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.3);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1350,
                vy: Math.sin(aimAngle) * 1350,
                radius: 38,
                rangeLeft: 1250,
                damage: dmg * 1.65,
                damageType: 'magic',
                color: '#E879F9',
                kind: 'skill_line',
                life: 1.3,
                maxLife: 1.3
            });
        } else {
            callbacks.triggerGlobalReveal == null ? void 0 : callbacks.triggerGlobalReveal.call(callbacks, caster.team, 5.0);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 160,
                color: '#C084FC',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, 280, dmg * 0.9, 'magic', 'slow', 2.0, function(h) {
                h.revealedTimer = Math.max(h.revealedTimer, 5.0);
            });
        }
        return true;
    }
    // 100. OBSIDIA (2025/2026) — Bone Shards + Abyssal Needle + Phantom Shadowmeld + Hunt of Bone Tether!
    if (hid === 'obsidia') {
        caster.orbitBlades = Math.min(5, Math.max(caster.orbitBlades, 3) + 1);
        caster.orbitTimer = 6.0;
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1080,
                vy: Math.sin(aimAngle) * 1080,
                radius: 26,
                rangeLeft: 620,
                damage: dmg * 1.15,
                damageType: 'physical',
                color: '#C084FC',
                kind: 'skill_line',
                life: 0.9,
                maxLife: 0.9
            });
        } else if (slot === 2) {
            caster.stealthTimer = Math.max(caster.stealthTimer, 2.2);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.5);
        } else {
            var tgt14 = findNearestEnemy(520);
            if (tgt14) {
                caster.tetherTargetId = tgt14.id;
                caster.tetherTimer = 3.5;
                caster.tetherKind = 'root';
                caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
                callbacks.dealDamageToHero(caster, tgt14, dmg * 1.35, 'physical', false, false, 'Hunt of Bone');
                callbacks.applyCc(tgt14, 'grounded', 3.0, caster);
                callbacks.spawnVfx({
                    kind: 'tether',
                    x: caster.x,
                    y: caster.y,
                    tx: tgt14.x,
                    ty: tgt14.y,
                    radius: 7,
                    color: '#9333EA',
                    ttl: 0.9,
                    maxTtl: 0.9
                });
            } else {
                hitCircle(tx, ty, 150, dmg, 'physical', 'grounded', 2.0);
            }
        }
        return true;
    }
    // 101. ODETTE — Swan Wave + Blue Nova Splitting Root + Swan Song (Dash + Giant Channeling Shield Storm!)
    if (hid === 'odette') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 900,
                vy: Math.sin(aimAngle) * 900,
                radius: 42,
                rangeLeft: 620,
                damage: dmg,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                pierce: true,
                ccType: 'slow',
                ccDuration: 1.5,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#67E8F9',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 155, dmg, 'magic', 'root', 1.5);
        } else {
            caster.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 200, 80, _mapData.WORLD_SIZE - 80);
            caster.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 200, 80, _mapData.WORLD_SIZE - 80);
            callbacks.grantShield(caster, 900 + caster.magicPow * 1.4);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 310,
                color: '#38BDF8',
                ttl: 1.2,
                maxTtl: 1.2
            });
            hitCircle(caster.x, caster.y, 310, dmg * 1.55, 'magic', 'slow', 2.0);
        }
        return true;
    }
    // 102. PAQUITO — Champ Stance (3 Stacks Reset ALL CDs & Enhance Super-Skill!)
    if (hid === 'paquito') {
        var isChamp = caster.passiveStacks >= 3;
        var mult = isChamp ? 1.5 : 1.0;
        if (isChamp) {
            caster.passiveStacks = 0;
        } else {
            caster.passiveStacks = Math.min(3, caster.passiveStacks + 1);
            caster.passiveTimer = 8.0;
            if (caster.passiveStacks >= 3) {
                caster.skillCds = [
                    0,
                    0,
                    0
                ];
            }
        }
        if (slot === 1) {
            callbacks.grantShield(caster, (320 + caster.physAtk * 0.9) * mult);
            hitCircle(tx, ty, 145, dmg * mult, 'physical');
        } else if (slot === 2) {
            dashForward(1220, 0.24, true);
            emitTrail();
            hitCircle(tx, ty, 135, dmg * 1.2 * mult, 'physical');
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 175,
                color: '#EF4444',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 175, dmg * 1.35 * mult, 'physical', 'airborne', isChamp ? 1.25 : 0.85);
        }
        return true;
    }
    // 103. PHARSA — Curse of Crow Mark->Stun + Energy Impact Beam + Feathered Air Strike (4 Long-Range Sky Blasts!)
    if (hid === 'pharsa') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 165,
                color: '#7E22CE',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 165, dmg, 'magic', 'stun', 1.0);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 36,
                color: '#C084FC',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, 135, dmg * 1.15, 'magic');
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 260,
                color: '#A855F7',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, 260, dmg * 1.55, 'magic', 'slow', 1.2);
            caster.recastSlot = isRecast ? null : 3;
            caster.recastTimer = isRecast ? 0 : 4.5;
        }
        return true;
    }
    // 104. PHOVEUS — Demonic Impact + Dark Wave Pull + Infernal Pursuit (Chain Leap Slam!)
    if (hid === 'phoveus') {
        if (slot === 1) {
            callbacks.grantShield(caster, 280 + caster.maxHp * 0.06);
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#7E22CE',
                ttl: 0.48,
                maxTtl: 0.48
            });
            hitCircle(tx, ty, 155, dmg * 1.1, 'physical', 'slow', 1.0);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 185,
                color: '#A855F7',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 185, dmg, 'physical', 'airborne', 0.85);
        } else {
            var tgt15 = findNearestEnemy(580);
            var lx = tgt15 ? tgt15.x : tx;
            var ly = tgt15 ? tgt15.y : ty;
            startParabolicLeap(Math.atan2(ly - caster.y, lx - caster.x), (0, _CombatMath.dist)(caster.x, caster.y, lx, ly), 0.34, true);
            callbacks.grantShield(caster, 380 + caster.maxHp * 0.09);
            callbacks.spawnVfx({
                kind: 'burst',
                x: lx,
                y: ly,
                radius: 190,
                color: '#9333EA',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(lx, ly, 190, dmg * 1.35, 'physical', 'airborne', 0.6);
            if (tgt15 && !isRecast) {
                caster.recastSlot = 3;
                caster.recastTimer = 3.5;
            }
        }
        return true;
    }
    // 105. POPOL AND KUPA — Bite 'em Kupa Stun + Kupa Help Shield Knockup + Alpha Wolf Giant Mode!
    if (hid === 'popol_and_kupa') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 115,
                color: '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, 115, dmg * 1.15, 'physical', 'stun', 1.0);
        } else if (slot === 2) {
            callbacks.grantShield(caster, 420 + caster.physAtk * 1.1);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 180,
                color: '#7DD3FC',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(caster.x, caster.y, 180, dmg * 0.8, 'physical', 'airborne', 0.75);
        } else {
            caster.inspireTimer = Math.max(caster.inspireTimer, 8.0);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.25);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 8.0);
            callbacks.grantShield(caster, 450 + caster.level * 40);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 185,
                color: '#0EA5E9',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 175, dmg * 1.2, 'physical', 'stun', 1.0);
        }
        return true;
    }
    // 106. RAFAELA — Light of Retribution (Reveals Stealth!) + Holy Healing (AoE Heal + Slow Immunity!) + Holy Baptism Stun!
    if (hid === 'rafaela') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 280,
                color: '#FEF08A',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(caster.x, caster.y, 280, dmg, 'magic', 'slow', 1.5, function(h) {
                h.stealthTimer = 0;
                h.revealedTimer = Math.max(h.revealedTimer, 3.0);
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 320,
                color: '#2CE58B',
                ttl: 0.6,
                maxTtl: 0.6
            });
            for(var _iterator5 = _create_for_of_iterator_helper_loose(heroes), _step5; !(_step5 = _iterator5()).done;){
                var h5 = _step5.value;
                if (h5.alive && h5.team === caster.team && (0, _CombatMath.dist)(caster.x, caster.y, h5.x, h5.y) <= 320) {
                    h5.slowTimer = 0;
                    h5.slowPct = 0;
                    h5.speedBoostPct = Math.max(h5.speedBoostPct, 0.4);
                    h5.speedBoostTimer = Math.max(h5.speedBoostTimer, 2.5);
                    callbacks.healHero(h5, 300 + lvl * 65 + caster.magicPow * 0.65, caster);
                }
            }
        } else {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 75,
                color: '#FDE047',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(tx, ty, 195, dmg * 1.2, 'magic', 'stun', 1.5);
        }
        return true;
    }
    // 107. ROGER — Instant Human <-> Wolf Form Switch!
    if (hid === 'roger') {
        if (slot === 1) {
            if (caster.altFormActive) {
                caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.6);
                hitCircle(tx, ty, 155, dmg * 1.3, 'physical');
            } else {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 1020,
                    vy: Math.sin(aimAngle) * 1020,
                    radius: 32,
                    rangeLeft: 560,
                    damage: dmg,
                    damageType: 'physical',
                    color: '#F59E0B',
                    kind: 'skill_line',
                    ccType: 'slow',
                    ccDuration: 1.2,
                    life: 0.9,
                    maxLife: 0.9
                });
            }
        } else if (slot === 2) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, caster.altFormActive ? 0.5 : 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
            caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 130,
                color: '#EF4444',
                ttl: 0.45,
                maxTtl: 0.45
            });
        } else {
            caster.altFormActive = !caster.altFormActive;
            caster.altFormTimer = caster.altFormActive ? 14.0 : 0;
            dashForward(1120, 0.26, true);
            callbacks.grantShield(caster, 360 + caster.physAtk * 0.7);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 165,
                color: caster.altFormActive ? '#E11D48' : '#38BDF8',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(tx, ty, 165, dmg * 1.15, 'physical', 'slow', 1.0);
        }
        return true;
    }
    // 108. RUBY — Let's Dance! (Short Hop + Massive Spell Vamp on EVERY Skill!) + 360 Pull + Scythe Hook!
    if (hid === 'ruby') {
        var hopAfterSkill = function hopAfterSkill() {
            caster.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 85, 80, _mapData.WORLD_SIZE - 80);
            caster.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 85, 80, _mapData.WORLD_SIZE - 80);
        };
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: '#FB7185',
                ttl: 0.42,
                maxTtl: 0.42,
                angle: aimAngle
            });
            var hits3 = hitCircle(tx, ty, 175, dmg, 'physical', 'slow', 1.2);
            if (hits3 > 0) callbacks.healHero(caster, 150 * hits3 + caster.physAtk * 0.45, caster);
            hopAfterSkill();
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 205,
                color: '#E11D48',
                ttl: 0.45,
                maxTtl: 0.45
            });
            var hits4 = hitCircle(caster.x, caster.y, 205, dmg, 'physical', 'stun', 0.8);
            if (hits4 > 0) callbacks.healHero(caster, 180 * hits4 + caster.physAtk * 0.5, caster);
            hopAfterSkill();
        } else {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 235,
                color: '#F43F5E',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            var hits5 = hitCircle(tx, ty, 235, dmg * 1.25, 'physical', 'pull', 1.0, function(h) {
                h.x = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 62, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 62, 80, _mapData.WORLD_SIZE - 80);
                callbacks.applyCc(h, 'stun', 0.75, caster);
            });
            if (hits5 > 0) callbacks.healHero(caster, 240 * hits5 + caster.physAtk * 0.65, caster);
            hopAfterSkill();
        }
        return true;
    }
    // 109. SABER — 5 Orbiting Swords + Cyber Charge + Triple Sweep Lock-On Knockup One-Shot!
    if (hid === 'saber') {
        if (slot === 1) {
            caster.orbitBlades = 5;
            caster.orbitTimer = 5.5;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 175,
                color: '#22D3EE',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(caster.x, caster.y, 175, dmg, 'physical');
        } else if (slot === 2) {
            dashForward(1220, 0.24, true);
            emitTrail();
            hitCircle(tx, ty, 120, dmg, 'physical', 'slow', 1.0);
        } else {
            var tgt16 = findNearestEnemy(440);
            if (tgt16) {
                caster.x = (0, _CombatMath.clamp)(tgt16.x - Math.cos(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt16.y - Math.sin(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                tgt16.defShredFlat = Math.min(35, tgt16.defShredFlat + 20);
                tgt16.defShredTimer = 5.0;
                callbacks.dealDamageToHero(caster, tgt16, dmg * 1.4, 'physical', false, false, 'Triple Sweep');
                callbacks.applyCc(tgt16, 'airborne', 1.2, caster);
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt16.x,
                    y: tgt16.y,
                    radius: 135,
                    color: '#06B6D4',
                    ttl: 0.6,
                    maxTtl: 0.6
                });
            } else {
                hitCircle(tx, ty, 130, dmg, 'physical', 'airborne', 1.0);
            }
        }
        return true;
    }
    // 110. SELENA — Vision Traps + Abyssal Arrow (Up to 3s Stun!) + Primal Darkness Abyssal Form Swap!
    if (hid === 'selena') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 135,
                color: '#9333EA',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 135, dmg * (caster.altFormActive ? 1.35 : 0.9), 'magic', 'slow', 1.2);
        } else if (slot === 2) {
            if (caster.altFormActive) {
                dashForward(1280, 0.24, true);
                hitCircle(tx, ty, 135, dmg * 1.25, 'magic');
            } else {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 920,
                    vy: Math.sin(aimAngle) * 920,
                    radius: 34,
                    rangeLeft: 1100,
                    damage: dmg * 1.15,
                    damageType: 'magic',
                    color: '#A855F7',
                    kind: 'skill_line',
                    ccType: 'stun',
                    ccDuration: 2.5,
                    life: 1.45,
                    maxLife: 1.45
                });
            }
        } else {
            caster.altFormActive = !caster.altFormActive;
            caster.altFormTimer = caster.altFormActive ? 12.0 : 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.0);
            caster.skillCds[0] = 0;
            caster.skillCds[1] = 0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 135,
                color: '#7E22CE',
                ttl: 0.5,
                maxTtl: 0.5
            });
        }
        return true;
    }
    // 111. SILVANNA — Line Stun + Spiral Strangling Spin Pull + Imperial Justice (3.5s Inescapable Circle!)
    if (hid === 'silvanna') {
        if (slot === 1) {
            dashForward(1120, 0.24, true);
            hitCircle(tx, ty, 135, dmg, 'magic', 'stun', 1.0);
        } else if (slot === 2) {
            callbacks.grantShield(caster, 420 + caster.magicPow * 0.95);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 165,
                color: '#FDE047',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            hitCircle(tx, ty, 165, dmg * 1.25, 'magic', 'pull', 0.8);
        } else {
            startParabolicLeap(aimAngle, Math.min(440, clampedDist), 0.34, true);
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 205,
                color: '#FACC15',
                ttl: 1.2,
                maxTtl: 1.2
            });
            hitCircle(tx, ty, 205, dmg * 1.3, 'magic', 'grounded', 3.5);
        }
        return true;
    }
    // 112. SORA (2026) — Shifting Gale (Torrent <-> Cloud) + Skyward Slash + Zephyr Step + Tempest Ascension!
    if (hid === 'sora') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: '#34D399',
                ttl: 0.42,
                maxTtl: 0.42,
                angle: aimAngle
            });
            hitCircle(tx, ty, 175, dmg * 1.15, 'physical', 'slow', 1.0);
        } else if (slot === 2) {
            dashForward(1240, 0.24, true);
            emitTrail();
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.35);
            hitCircle(tx, ty, 130, dmg, 'physical');
        } else {
            caster.altFormActive = true;
            caster.altFormTimer = 8.0;
            startParabolicLeap(aimAngle, Math.min(460, clampedDist), 0.36, true);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 225,
                color: '#6EE7B7',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 225, dmg * 1.42, 'physical', 'airborne', 1.0);
        }
        return true;
    }
    // 113. SUN — Endless Variety Clone + Swift Exchange Swap + Untargetable Golden Doppelganger!
    if (hid === 'sun') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 960,
                vy: Math.sin(aimAngle) * 960,
                radius: 34,
                rangeLeft: 560,
                damage: dmg,
                damageType: 'physical',
                color: '#F59E0B',
                kind: 'skill_line',
                life: 0.9,
                maxLife: 0.9
            });
        } else if (slot === 2) {
            dashForward(1180, 0.26, true);
            hitCircle(tx, ty, 145, dmg * 1.1, 'physical', 'slow', 1.0);
        } else {
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.75);
            caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
            callbacks.healHero(caster, 280 + caster.physAtk * 0.7, caster);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 195,
                color: '#FACC15',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(caster.x, caster.y, 195, dmg * 1.25, 'physical');
        }
        return true;
    }
    // 114. SUYOU — Tap Mortal Form / Hold Immortal Form Dual Kit!
    if (hid === 'suyou') {
        var immortal = clampedDist > skill.range * 0.55;
        caster.altFormActive = immortal;
        caster.altFormTimer = immortal ? 5.0 : 0;
        if (slot === 1) {
            dashForward(1220, 0.26, true);
            hitCircle(tx, ty, 145, dmg * (immortal ? 1.25 : 1.0), 'physical', immortal ? 'stun' : 'slow', immortal ? 0.9 : 0.7);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: immortal ? '#A855F7' : '#38BDF8',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 175, dmg * 1.2, 'physical');
            if (immortal) callbacks.healHero(caster, 260 + caster.physAtk * 0.8, caster);
        } else {
            if (immortal) {
                callbacks.spawnProjectile({
                    ownerId: caster.id,
                    team: caster.team,
                    x: caster.x,
                    y: caster.y,
                    vx: Math.cos(aimAngle) * 1280,
                    vy: Math.sin(aimAngle) * 1280,
                    radius: 34,
                    rangeLeft: 920,
                    damage: dmg * 1.4,
                    damageType: 'physical',
                    color: '#C084FC',
                    kind: 'skill_line',
                    life: 1.0,
                    maxLife: 1.0
                });
            } else {
                caster.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 140, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 140, 80, _mapData.WORLD_SIZE - 80);
                hitCircle(tx, ty, 165, dmg * 1.2, 'physical', 'slow', 1.2);
            }
        }
        return true;
    }
    // 115. TERIZLA — Revenge Strike Fissure + Execution Strike 3 Slams + Penalty Zone Chain Pull!
    if (hid === 'terizla') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 145,
                color: '#E11D48',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 145, dmg * 1.15, 'physical', 'slow', 1.5);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 195,
                color: '#FB7185',
                ttl: 0.5,
                maxTtl: 0.5,
                angle: aimAngle
            });
            hitCircle(tx, ty, 195, dmg * 1.28, 'physical', 'slow', 1.2);
        } else {
            startParabolicLeap(aimAngle, Math.min(340, clampedDist), 0.38, true);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 245,
                color: '#9F1239',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, 245, dmg * 1.35, 'physical', 'vortex', 1.8);
        }
        return true;
    }
    // 116. THAMUZ — Molten Scythes + Chasm Trample Leap + Cauterant Inferno (Lava Ring + Huge HP/Heal!)
    if (hid === 'thamuz') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.0);
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 860,
                vy: Math.sin(aimAngle) * 860,
                radius: 38,
                rangeLeft: 560,
                damage: dmg,
                damageType: 'physical',
                color: '#F97316',
                kind: 'boomerang',
                pierce: true,
                returning: false,
                life: 1.5,
                maxLife: 1.5
            });
        } else if (slot === 2) {
            startParabolicLeap(aimAngle, Math.min(400, clampedDist), 0.34, true);
            hitCircle(tx, ty, 155, dmg, 'physical', 'slow', 1.2);
        } else {
            caster.inspireTimer = Math.max(caster.inspireTimer, 8.0);
            callbacks.healHero(caster, 420 + caster.maxHp * 0.14, caster);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 235,
                color: '#EF4444',
                ttl: 0.9,
                maxTtl: 0.9
            });
            hitCircle(caster.x, caster.y, 235, dmg * 1.2, 'true');
        }
        return true;
    }
    // 117. TIGREAL — Attack Wave + Sacred Hammer Push/Airborne + Implosion (Vortex Pull & 1.8s Stun!)
    if (hid === 'tigreal') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 155,
                color: '#60A5FA',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 155, dmg, 'physical', 'slow', 1.5);
        } else if (slot === 2) {
            dashForward(1040, 0.3, false);
            hitCircle(tx, ty, 145, dmg, 'physical', isRecast ? 'airborne' : 'knockback', 0.85, function(h) {
                if (!isRecast) {
                    h.x = (0, _CombatMath.clamp)(h.x + Math.cos(aimAngle) * 135, 80, _mapData.WORLD_SIZE - 80);
                    h.y = (0, _CombatMath.clamp)(h.y + Math.sin(aimAngle) * 135, 80, _mapData.WORLD_SIZE - 80);
                }
            });
            caster.recastSlot = isRecast ? null : 2;
            caster.recastTimer = isRecast ? 0 : 2.8;
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 255,
                color: '#FACC15',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(caster.x, caster.y, 255, dmg * 1.25, 'physical', 'stun', 1.8, function(h) {
                var pullAng = Math.atan2(caster.y - h.y, caster.x - h.x);
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(pullAng) * 120, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(pullAng) * 120, 80, _mapData.WORLD_SIZE - 80);
            });
        }
        return true;
    }
    // 118. URANUS — Radiance 20-Stack Regen + Ionic Edge + Transcendent Ward Shield + Consecration Cleanse Heal!
    if (hid === 'uranus') {
        caster.passiveStacks = Math.min(20, caster.passiveStacks + 3);
        caster.passiveTimer = 10.0;
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 205,
                color: '#FDE047',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(caster.x, caster.y, 205, dmg, 'magic', 'slow', 1.2);
        } else if (slot === 2) {
            dashForward(1040, 0.26, true);
            callbacks.grantShield(caster, 480 + caster.magicPow * 1.1);
            hitCircle(tx, ty, 155, dmg, 'magic');
        } else {
            cleanseNonSuppression();
            caster.passiveStacks = 20;
            caster.passiveTimer = 10.0;
            callbacks.healHero(caster, 460 + caster.maxHp * 0.16, caster);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 175,
                color: '#FEF08A',
                ttl: 0.65,
                maxTtl: 0.65
            });
        }
        return true;
    }
    // 119. VALE — Twin Wind Blades + Windblow Tornado Knockup + Windstorm Vortex Mega-Detonation!
    if (hid === 'vale') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: '#34D399',
                ttl: 0.42,
                maxTtl: 0.42,
                angle: aimAngle
            });
            hitCircle(tx, ty, 175, dmg * 1.1, 'magic');
        } else if (slot === 2) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 920,
                vy: Math.sin(aimAngle) * 920,
                radius: 46,
                rangeLeft: 660,
                damage: dmg,
                damageType: 'magic',
                color: '#6EE7B7',
                kind: 'skill_line',
                pierce: true,
                ccType: 'airborne',
                ccDuration: 1.0,
                life: 1.0,
                maxLife: 1.0
            });
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 245,
                color: '#10B981',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, 245, dmg * 1.48, 'magic', 'vortex', 1.35);
        }
        return true;
    }
    // 120. VALENTINA — Shadow Strike Terrify + Arcane Shade 2-Dash + I Am You (STEALS ENEMY ULTIMATE!)
    if (hid === 'valentina') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 175,
                color: '#A855F7',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 175, dmg * 1.15, 'magic', 'taunt', 1.0);
        } else if (slot === 2) {
            dashForward(1160, 0.24, true);
            caster.skillCds[0] = Math.max(0, caster.skillCds[0] - 1.5);
            hitCircle(caster.x, caster.y, 145, dmg * 0.75, 'magic');
        } else {
            var tgt17 = findNearestEnemy(560);
            if (tgt17) {
                var _tgt_heroDef_skills__ccType, _tgt_heroDef_skills__ccDuration;
                caster.valentinaStolenHeroId = tgt17.heroDef.id;
                callbacks.announce('I AM YOU!', "Valentina stole " + tgt17.heroDef.name + "'s Ultimate!", '#C084FC');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: tgt17.x,
                    y: tgt17.y,
                    radius: 220,
                    color: tgt17.heroDef.primaryColor,
                    ttl: 0.75,
                    maxTtl: 0.75
                });
                hitCircle(tgt17.x, tgt17.y, 220, dmg * 1.45, 'magic', (_tgt_heroDef_skills__ccType = tgt17.heroDef.skills[2].ccType) != null ? _tgt_heroDef_skills__ccType : 'stun', (_tgt_heroDef_skills__ccDuration = tgt17.heroDef.skills[2].ccDuration) != null ? _tgt_heroDef_skills__ccDuration : 1.2);
            } else {
                hitCircle(tx, ty, 180, dmg * 1.2, 'magic', 'stun', 1.0);
            }
        }
        return true;
    }
    // 121. VALIR — Burst Fireball (Refund on Hero Hit!) + Searing Torrent Pushback Firewall + Vengeance Flame Cleanse!
    if (hid === 'valir') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 145,
                color: '#F97316',
                ttl: 0.48,
                maxTtl: 0.48
            });
            var hits6 = hitCircle(tx, ty, 145, dmg * 1.12, 'magic', 'stun', 0.5);
            if (hits6 > 0) caster.skillCds[0] = 0.4;
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 215,
                color: '#EF4444',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            hitCircle(tx, ty, 215, dmg, 'magic', 'knockback', 0.9, function(h) {
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(aimAngle) * 165, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(aimAngle) * 165, 80, _mapData.WORLD_SIZE - 80);
            });
        } else {
            cleanseNonSuppression();
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 5.0);
            caster.skillCds[0] = 0;
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 190,
                color: '#FB923C',
                ttl: 0.65,
                maxTtl: 0.65
            });
        }
        return true;
    }
    // 122. VEXANA — Terrify Phantom + Cursed Blast + Eternal Guard (Summons Undead Knight Knockup!)
    if (hid === 'vexana') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 900,
                vy: Math.sin(aimAngle) * 900,
                radius: 36,
                rangeLeft: 620,
                damage: dmg,
                damageType: 'magic',
                color: '#34D399',
                kind: 'skill_line',
                ccType: 'taunt',
                ccDuration: 1.2,
                life: 1.0,
                maxLife: 1.0
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 165,
                color: '#10B981',
                ttl: 0.6,
                maxTtl: 0.6
            });
            hitCircle(tx, ty, 165, dmg * 1.25, 'magic');
        } else {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 235,
                color: '#2CE58B',
                ttl: 0.85,
                maxTtl: 0.85
            });
            hitCircle(tx, ty, 235, dmg * 1.4, 'magic', 'airborne', 1.15);
        }
        return true;
    }
    // 123. WANWAN — Returning Daggers Stun + Needles Cleanse + Crossbow of Tang (Invincible Flying Barrage!)
    if (hid === 'wanwan') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 940,
                vy: Math.sin(aimAngle) * 940,
                radius: 34,
                rangeLeft: 560,
                damage: dmg,
                damageType: 'physical',
                color: '#34D399',
                kind: 'boomerang',
                pierce: true,
                returning: false,
                ccType: 'stun',
                ccDuration: 0.7,
                life: 1.5,
                maxLife: 1.5
            });
        } else if (slot === 2) {
            cleanseNonSuppression();
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 155,
                color: '#FDE047',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(caster.x, caster.y, 155, dmg * 0.75, 'physical');
        } else {
            caster.wanwanFlyTimer = 2.6;
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 2.6);
            caster.leapZ = 1.65;
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 220,
                color: '#FACC15',
                ttl: 0.7,
                maxTtl: 0.7
            });
            hitCircle(tx, ty, 240, dmg * 1.45, 'physical');
        }
        return true;
    }
    // 124. X.BORG — Firaga Armor + Flamethrower (True Dmg at Max Heat!) + Stake Pull + Last Insanity %HP True Dmg!
    if (hid === 'x_borg') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 195,
                color: '#F97316',
                ttl: 0.55,
                maxTtl: 0.55,
                angle: aimAngle
            });
            hitCircle(tx, ty, 195, dmg * 1.1, 'true', 'slow', 0.8);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 175,
                color: '#FB923C',
                ttl: 0.5,
                maxTtl: 0.5
            });
            hitCircle(tx, ty, 175, dmg, 'physical', 'pull', 0.7);
            callbacks.grantShield(caster, 280 + caster.maxHp * 0.08);
        } else {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.8);
            dashForward(920, 0.35, true);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 255,
                color: '#EF4444',
                ttl: 0.8,
                maxTtl: 0.8
            });
            hitCircle(tx, ty, 255, dmg * 1.45, 'true', 'slow', 1.2);
        }
        return true;
    }
    // 125. XAVIER — Infinite Extension + Mystic Field AoE Root + Dawning Light (GLOBAL Map-Wide Laser!)
    if (hid === 'xavier') {
        if (slot === 1) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1060,
                vy: Math.sin(aimAngle) * 1060,
                radius: 38,
                rangeLeft: 820,
                damage: dmg * 1.1,
                damageType: 'magic',
                color: '#38BDF8',
                kind: 'skill_line',
                pierce: true,
                life: 1.05,
                maxLife: 1.05
            });
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 195,
                color: '#818CF8',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(tx, ty, 195, dmg, 'magic', 'root', 1.5);
        } else {
            var ex1 = (0, _CombatMath.clamp)(caster.x + Math.cos(aimAngle) * 3200, 60, _mapData.WORLD_SIZE - 60);
            var ey1 = (0, _CombatMath.clamp)(caster.y + Math.sin(aimAngle) * 3200, 60, _mapData.WORLD_SIZE - 60);
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: ex1,
                ty: ey1,
                radius: 95,
                color: '#60A5FA',
                ttl: 0.8,
                maxTtl: 0.8
            });
            for(var _iterator6 = _create_for_of_iterator_helper_loose(heroes), _step6; !(_step6 = _iterator6()).done;){
                var h6 = _step6.value;
                if (!h6.alive || h6.team === caster.team) continue;
                // Distance to global ray segment
                var vx = ex1 - caster.x;
                var vy = ey1 - caster.y;
                var len2 = Math.max(1, vx * vx + vy * vy);
                var t = (0, _CombatMath.clamp)(((h6.x - caster.x) * vx + (h6.y - caster.y) * vy) / len2, 0, 1);
                var px = caster.x + t * vx;
                var py = caster.y + t * vy;
                if ((0, _CombatMath.dist)(h6.x, h6.y, px, py) <= 135) {
                    callbacks.dealDamageToHero(caster, h6, dmg * 1.5, 'magic', false, false, 'Dawning Light');
                }
            }
        }
        return true;
    }
    // 126. YI SUN-SHIN — Traceless CC-Immune Dash + Blood Floods + Mountain Shocker (GLOBAL Reveal + 3 Cannon Waves!)
    if (hid === 'yi_sun_shin') {
        if (slot === 1) {
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.9);
            dashForward(1180, 0.24, true);
            hitCircle(tx, ty, 130, dmg, 'physical');
        } else if (slot === 2) {
            callbacks.spawnProjectile({
                ownerId: caster.id,
                team: caster.team,
                x: caster.x,
                y: caster.y,
                vx: Math.cos(aimAngle) * 1240,
                vy: Math.sin(aimAngle) * 1240,
                radius: 36,
                rangeLeft: 920,
                damage: dmg * 1.25,
                damageType: 'physical',
                color: '#38BDF8',
                kind: 'skill_line',
                pierce: true,
                life: 1.0,
                maxLife: 1.0
            });
        } else {
            callbacks.triggerGlobalReveal == null ? void 0 : callbacks.triggerGlobalReveal.call(callbacks, caster.team, 5.0);
            callbacks.announce('MOUNTAIN SHOCKER!', 'Global cannon waves strike & reveal all enemies!', '#38BDF8');
            for(var _iterator7 = _create_for_of_iterator_helper_loose(heroes), _step7; !(_step7 = _iterator7()).done;){
                var h7 = _step7.value;
                if (h7.alive && h7.team !== caster.team) {
                    h7.revealedTimer = Math.max(h7.revealedTimer, 5.0);
                    callbacks.dealDamageToHero(caster, h7, dmg * 1.15, 'physical', false, false, 'Mountain Shocker');
                    callbacks.applyCc(h7, 'slow', 1.5, caster);
                    callbacks.spawnVfx({
                        kind: 'burst',
                        x: h7.x,
                        y: h7.y,
                        radius: 120,
                        color: '#38BDF8',
                        ttl: 0.7,
                        maxTtl: 0.7
                    });
                }
            }
        }
        return true;
    }
    // 127. YIN — Charged Punch + Instant Blast Dash Stun + My Turn (1v1 Lieh Domain Arena!)
    if (hid === 'yin') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.0);
            hitCircle(tx, ty, 155, dmg * 1.25, 'physical');
        } else if (slot === 2) {
            dashForward(1220, 0.24, true);
            hitCircle(tx, ty, 135, dmg, 'physical', 'stun', 1.0);
        } else {
            var tgt18 = findNearestEnemy(380);
            caster.yinDomainTimer = 6.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.5);
            callbacks.grantShield(caster, 420 + caster.physAtk * 0.9);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 260,
                color: '#F97316',
                ttl: 1.2,
                maxTtl: 1.2
            });
            if (tgt18) {
                callbacks.announce('MY TURN!', "Yin pulled " + tgt18.heroDef.name + " into Lieh's 1v1 Domain!", '#F97316');
                callbacks.dealDamageToHero(caster, tgt18, dmg * 1.4, 'physical', false, false, 'My Turn (Lieh)');
                callbacks.applyCc(tgt18, 'stun', 1.2, caster);
            } else {
                hitCircle(tx, ty, 200, dmg * 1.2, 'physical', 'stun', 1.0);
            }
        }
        return true;
    }
    // 128. YU ZHONG — Dragon Tail (250% Outer Edge!) + Soul Grip + Furious Dive + Black Dragon Form!
    if (hid === 'yu_zhong') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 215,
                color: '#E11D48',
                ttl: 0.5,
                maxTtl: 0.5
            });
            var hits7 = hitCircle(caster.x, caster.y, 215, dmg * 1.32, 'physical');
            if (hits7 > 0) callbacks.healHero(caster, 180 * hits7 + caster.maxHp * 0.05, caster);
        } else if (slot === 2) {
            startParabolicLeap(aimAngle, Math.min(400, clampedDist), 0.36, true);
            hitCircle(tx, ty, 155, dmg * 1.1, 'physical', 'airborne', 0.9);
        } else {
            caster.yuZhongDragonTimer = 7.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 7.0);
            caster.wallPhaseTimer = Math.max(caster.wallPhaseTimer, 7.0);
            caster.modelScale = 1.42;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 7.0);
            callbacks.grantShield(caster, 620 + caster.maxHp * 0.14);
            callbacks.spawnVfx({
                kind: 'burst',
                x: caster.x,
                y: caster.y,
                radius: 245,
                color: '#9F1239',
                ttl: 0.85,
                maxTtl: 0.85
            });
            hitCircle(caster.x, caster.y, 245, dmg * 1.25, 'physical', 'knockback', 0.9);
        }
        return true;
    }
    // 129. YVE — Void Blast + Void Crystal Ray + Real World Manipulation (7×7 Starry Chessboard!)
    if (hid === 'yve') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 145,
                color: '#A855F7',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, 145, dmg * 1.15, 'magic');
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 48,
                color: '#E879F9',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 165, dmg, 'magic', 'slow', 1.8);
        } else {
            caster.yveGridTimer = 4.0;
            caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 2.5);
            callbacks.grantShield(caster, 640 + caster.magicPow * 1.1);
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 310,
                color: '#C084FC',
                ttl: 1.25,
                maxTtl: 1.25
            });
            hitCircle(tx, ty, 310, dmg * 1.48, 'magic', 'root', 1.2);
        }
        return true;
    }
    // 130. ZETIAN (2025/2026) — Celestial Armament + Phoenix Strike + Phoenix Descent + Fury of Phoenix (GLOBAL Stun!)
    if (hid === 'zetian') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 185,
                color: '#F97316',
                ttl: 0.48,
                maxTtl: 0.48,
                angle: aimAngle
            });
            hitCircle(tx, ty, 185, dmg * 1.12, 'magic', 'pull', 0.6);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'crater',
                x: tx,
                y: ty,
                radius: 175,
                color: '#EF4444',
                ttl: 0.55,
                maxTtl: 0.55
            });
            hitCircle(tx, ty, 175, dmg * 1.15, 'magic', 'slow', 1.4, function(h) {
                h.defShredFlat = Math.min(35, h.defShredFlat + 18);
                h.defShredTimer = 4.0;
            });
        } else {
            callbacks.triggerGlobalReveal == null ? void 0 : callbacks.triggerGlobalReveal.call(callbacks, caster.team, 5.0);
            callbacks.announce('FURY OF PHOENIX!', 'Global phoenix flames strike & stun all 5 enemies!', '#F97316');
            for(var _iterator8 = _create_for_of_iterator_helper_loose(heroes), _step8; !(_step8 = _iterator8()).done;){
                var h8 = _step8.value;
                if (!h8.alive) continue;
                if (h8.team !== caster.team) {
                    h8.revealedTimer = Math.max(h8.revealedTimer, 5.0);
                    callbacks.dealDamageToHero(caster, h8, dmg * 1.25, 'magic', false, false, 'Fury of Phoenix');
                    callbacks.applyCc(h8, 'stun', 1.1, caster);
                    callbacks.spawnVfx({
                        kind: 'burst',
                        x: h8.x,
                        y: h8.y,
                        radius: 135,
                        color: '#F97316',
                        ttl: 0.7,
                        maxTtl: 0.7
                    });
                } else {
                    h8.speedBoostPct = Math.max(h8.speedBoostPct, 0.35);
                    h8.speedBoostTimer = Math.max(h8.speedBoostTimer, 4.0);
                }
            }
        }
        return true;
    }
    // 131. ZHASK — Nightmaric Spawn Turret + Mind Eater Beam Stun + Dominator's Descent (Giant Super-Spawn!)
    if (hid === 'zhask') {
        if (slot === 1) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 145,
                color: '#9333EA',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(tx, ty, 145, dmg, 'magic', 'slow', 1.2);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'beam',
                x: caster.x,
                y: caster.y,
                tx: tx,
                ty: ty,
                radius: 34,
                color: '#C084FC',
                ttl: 0.45,
                maxTtl: 0.45
            });
            hitCircle(tx, ty, 145, dmg * 1.15, 'magic', 'stun', 1.0);
        } else {
            caster.altFormActive = true;
            caster.altFormTimer = 8.0;
            caster.modelScale = 1.38;
            caster.untargetableTimer = Math.max(caster.untargetableTimer, 1.0);
            callbacks.grantShield(caster, 780 + caster.magicPow * 1.2);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 220,
                color: '#7E22CE',
                ttl: 0.75,
                maxTtl: 0.75
            });
            hitCircle(tx, ty, 220, dmg * 1.4, 'magic', 'slow', 1.5);
        }
        return true;
    }
    // 132. ZHUXIN — Fan Speed Steal + Lantern Flare (Lifts Enemies Airborne & Throws!) + Crimson Beacon Blink Shield!
    if (hid === 'zhuxin') {
        if (slot === 1) {
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.3);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 2.5);
            callbacks.spawnVfx({
                kind: 'slash',
                x: tx,
                y: ty,
                radius: 185,
                color: '#FB7185',
                ttl: 0.45,
                maxTtl: 0.45,
                angle: aimAngle
            });
            hitCircle(tx, ty, 185, dmg, 'magic', 'slow', 1.5);
        } else if (slot === 2) {
            callbacks.spawnVfx({
                kind: 'ring',
                x: tx,
                y: ty,
                radius: 175,
                color: '#F43F5E',
                ttl: 0.65,
                maxTtl: 0.65
            });
            hitCircle(tx, ty, 175, dmg * 1.15, 'magic', 'airborne', 1.1, function(h) {
                h.x = (0, _CombatMath.clamp)(h.x + Math.cos(aimAngle + Math.PI * 0.5) * 115, 80, _mapData.WORLD_SIZE - 80);
                h.y = (0, _CombatMath.clamp)(h.y + Math.sin(aimAngle + Math.PI * 0.5) * 115, 80, _mapData.WORLD_SIZE - 80);
            });
        } else {
            caster.x = tx;
            caster.y = ty;
            callbacks.grantShield(caster, 560 + caster.magicPow * 1.15);
            callbacks.spawnVfx({
                kind: 'burst',
                x: tx,
                y: ty,
                radius: 240,
                color: '#E11D48',
                ttl: 0.85,
                maxTtl: 0.85
            });
            hitCircle(tx, ty, 240, dmg * 1.38, 'magic', 'slow', 1.6);
        }
        return true;
    }
    // 133. ZILONG — Spear Flip + Spear Strike (Resets on Kill!) + Supreme Warrior (Cleanse Slow + Speed/AtkSpd!)
    if (hid === 'zilong') {
        if (slot === 1) {
            var tgt19 = findNearestEnemy(260);
            if (tgt19) {
                tgt19.x = (0, _CombatMath.clamp)(caster.x - Math.cos(aimAngle) * 75, 80, _mapData.WORLD_SIZE - 80);
                tgt19.y = (0, _CombatMath.clamp)(caster.y - Math.sin(aimAngle) * 75, 80, _mapData.WORLD_SIZE - 80);
                tgt19.defShredFlat = Math.min(35, tgt19.defShredFlat + 15);
                tgt19.defShredTimer = 2.5;
                callbacks.dealDamageToHero(caster, tgt19, dmg, 'physical', false, false, 'Spear Flip');
                callbacks.applyCc(tgt19, 'airborne', 0.55, caster);
            } else {
                hitCircle(tx, ty, 115, dmg, 'physical', 'airborne', 0.5);
            }
        } else if (slot === 2) {
            var tgt20 = findNearestEnemy(480);
            if (tgt20) {
                var wasAlive2 = tgt20.alive;
                caster.x = (0, _CombatMath.clamp)(tgt20.x - Math.cos(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                caster.y = (0, _CombatMath.clamp)(tgt20.y - Math.sin(aimAngle) * 44, 80, _mapData.WORLD_SIZE - 80);
                tgt20.defShredFlat = Math.min(35, tgt20.defShredFlat + 18);
                tgt20.defShredTimer = 3.0;
                callbacks.dealDamageToHero(caster, tgt20, dmg * 1.15, 'physical', false, false, 'Spear Strike');
                if (wasAlive2 && !tgt20.alive) caster.skillCds[1] = 0.25;
            } else {
                dashForward(1240, 0.24, true);
                hitCircle(tx, ty, 115, dmg, 'physical');
            }
        } else {
            caster.slowTimer = 0;
            caster.slowPct = 0;
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 7.5);
            caster.inspireTimer = Math.max(caster.inspireTimer, 7.5);
            callbacks.spawnVfx({
                kind: 'ring',
                x: caster.x,
                y: caster.y,
                radius: 155,
                color: '#FACC15',
                ttl: 0.6,
                maxTtl: 0.6
            });
        }
        return true;
    }
    return false;
}
function stepPart5HeroPassives(h, dt, allHeroes, callbacks, _tempWalls) {
    var _h_lingWallTimer, _h_yinDomainTimer, _h_yuZhongDragonTimer, _h_wanwanFlyTimer, _h_yveGridTimer, _h_altFormTimer;
    var hid = h.heroDef.id;
    // Lylia 4-second trail buffer (sampled smoothly)
    if (hid === 'lylia' && h.alive) {
        if (!h.lyliaTrail) h.lyliaTrail = [];
        if (h.lyliaTrail.length === 0 || (0, _CombatMath.dist)(h.x, h.y, h.lyliaTrail[h.lyliaTrail.length - 1].x, h.lyliaTrail[h.lyliaTrail.length - 1].y) >= 14 || Math.random() < dt * 2.5) {
            h.lyliaTrail.push({
                x: h.x,
                y: h.y,
                hp: h.hp,
                mana: h.mana
            });
            if (h.lyliaTrail.length > 24) h.lyliaTrail.shift();
        }
    }
    // Masha 3-HP-Bar mechanic: dropping below 20% HP breaks a bar, cleanses CC, restores HP & resets Ult!
    if (hid === 'masha' && h.alive) {
        if (h.mashaBars === undefined) h.mashaBars = 3;
        if (h.mashaBars > 1 && h.hp / h.maxHp <= 0.22) {
            h.mashaBars -= 1;
            if (h.ccType && h.ccType !== 'suppression') {
                h.ccType = null;
                h.ccTimer = 0;
                h.ccPriority = 0;
            }
            h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.58);
            h.skillCds[2] = 0;
            callbacks.spawnVfx({
                kind: 'burst',
                x: h.x,
                y: h.y,
                radius: 135,
                color: '#FB923C',
                ttl: 0.55,
                maxTtl: 0.55
            });
        }
    }
    // Ling Wall Perch timer
    if (((_h_lingWallTimer = h.lingWallTimer) != null ? _h_lingWallTimer : 0) > 0) {
        var _h_lingWallTimer1, _h_lingWallTimer2;
        h.lingWallTimer = Math.max(0, ((_h_lingWallTimer1 = h.lingWallTimer) != null ? _h_lingWallTimer1 : 0) - dt);
        if (((_h_lingWallTimer2 = h.lingWallTimer) != null ? _h_lingWallTimer2 : 0) > 0) {
            h.leapZ = Math.max(h.leapZ, 1.25);
        }
    }
    // Yin 1v1 Domain timer
    if (((_h_yinDomainTimer = h.yinDomainTimer) != null ? _h_yinDomainTimer : 0) > 0) {
        var _h_yinDomainTimer1;
        h.yinDomainTimer = Math.max(0, ((_h_yinDomainTimer1 = h.yinDomainTimer) != null ? _h_yinDomainTimer1 : 0) - dt);
    }
    // Yu Zhong Black Dragon form
    if (((_h_yuZhongDragonTimer = h.yuZhongDragonTimer) != null ? _h_yuZhongDragonTimer : 0) > 0) {
        var _h_yuZhongDragonTimer1, _h_yuZhongDragonTimer2, _h_yuZhongDragonTimer3;
        h.yuZhongDragonTimer = Math.max(0, ((_h_yuZhongDragonTimer1 = h.yuZhongDragonTimer) != null ? _h_yuZhongDragonTimer1 : 0) - dt);
        h.modelScale = ((_h_yuZhongDragonTimer2 = h.yuZhongDragonTimer) != null ? _h_yuZhongDragonTimer2 : 0) > 0 ? 1.42 : 1.0;
        if (((_h_yuZhongDragonTimer3 = h.yuZhongDragonTimer) != null ? _h_yuZhongDragonTimer3 : 0) > 0) h.leapZ = Math.max(h.leapZ, 1.3);
    }
    // Wanwan Crossbow of Tang flying barrage
    if (((_h_wanwanFlyTimer = h.wanwanFlyTimer) != null ? _h_wanwanFlyTimer : 0) > 0) {
        var _h_wanwanFlyTimer1, _h_wanwanFlyTimer2, _h_wanwanFlyTimer3;
        h.wanwanFlyTimer = Math.max(0, ((_h_wanwanFlyTimer1 = h.wanwanFlyTimer) != null ? _h_wanwanFlyTimer1 : 0) - dt);
        h.leapZ = ((_h_wanwanFlyTimer2 = h.wanwanFlyTimer) != null ? _h_wanwanFlyTimer2 : 0) > 0 ? 1.6 : h.leapZ;
        if (((_h_wanwanFlyTimer3 = h.wanwanFlyTimer) != null ? _h_wanwanFlyTimer3 : 0) > 0 && Math.random() < dt * 5.0) {
            var target = allHeroes.find(function(e) {
                return e.alive && e.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, e.x, e.y) <= 440;
            });
            if (target) {
                callbacks.dealDamageToHero(h, target, 95 + h.physAtk * 0.55, 'physical', false, false, 'Crossbow of Tang');
                callbacks.spawnVfx({
                    kind: 'beam',
                    x: h.x,
                    y: h.y,
                    tx: target.x,
                    ty: target.y,
                    radius: 8,
                    color: '#FDE047',
                    ttl: 0.16,
                    maxTtl: 0.16
                });
            }
        }
    }
    // Yve 7×7 Starry Chessboard ticks
    if (((_h_yveGridTimer = h.yveGridTimer) != null ? _h_yveGridTimer : 0) > 0) {
        var _h_yveGridTimer1, _h_yveGridTimer2;
        h.yveGridTimer = Math.max(0, ((_h_yveGridTimer1 = h.yveGridTimer) != null ? _h_yveGridTimer1 : 0) - dt);
        if (((_h_yveGridTimer2 = h.yveGridTimer) != null ? _h_yveGridTimer2 : 0) > 0 && Math.random() < dt * 2.5) {
            var target1 = allHeroes.find(function(e) {
                return e.alive && e.team !== h.team && (0, _CombatMath.dist)(h.x, h.y, e.x, e.y) <= 420;
            });
            if (target1) {
                callbacks.dealDamageToHero(h, target1, 120 + h.magicPow * 0.45, 'magic', false, false, 'Real World Manipulation');
                callbacks.spawnVfx({
                    kind: 'burst',
                    x: target1.x,
                    y: target1.y,
                    radius: 85,
                    color: '#E879F9',
                    ttl: 0.25,
                    maxTtl: 0.25
                });
            }
        }
    }
    // Uranus Radiance stack continuous regen
    if (hid === 'uranus' && h.alive && h.passiveStacks > 0 && h.hp < h.maxHp) {
        h.hp = Math.min(h.maxHp, h.hp + h.passiveStacks * 8 * dt);
    }
    // Alt-form expiration (Roger, Selena, Lapu-Lapu, Leomord, Lukas, Sora, Suyou, Zhask)
    if (((_h_altFormTimer = h.altFormTimer) != null ? _h_altFormTimer : 0) > 0) {
        var _h_altFormTimer1, _h_altFormTimer2;
        h.altFormTimer = Math.max(0, ((_h_altFormTimer1 = h.altFormTimer) != null ? _h_altFormTimer1 : 0) - dt);
        if (((_h_altFormTimer2 = h.altFormTimer) != null ? _h_altFormTimer2 : 0) <= 0) {
            h.altFormActive = false;
            if (hid === 'lukas' || hid === 'zhask') {
                h.modelScale = 1.0;
            }
        }
    }
}

});

})(window.ArcadeMod);
