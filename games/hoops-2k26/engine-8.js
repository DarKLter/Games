(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/nba2k14/engine/playerRig ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/engine/playerRig", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Articulated 3D Player Rig, Jersey Canvas Texture & 3D Floor Ring
// ============================================================================
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
    get animatePlayerRig () {
        return animatePlayerRig;
    },
    get createArticulatedPlayerRig () {
        return createArticulatedPlayerRig;
    },
    get updatePlayerFloorRing () {
        return updatePlayerFloorRing;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
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
function createJerseyTexture(jerseyNum, jerseyColor, trimColor, teamCode) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = jerseyColor;
    ctx.fillRect(0, 0, 256, 256);
    // Side athletic stripes
    ctx.fillStyle = trimColor;
    ctx.fillRect(0, 0, 20, 256);
    ctx.fillRect(236, 0, 20, 256);
    ctx.fillRect(0, 0, 256, 18);
    // Determine contrasting numeral ink
    var isLight = jerseyColor.toLowerCase() === '#f8fafc' || jerseyColor.toLowerCase() === '#ffffff';
    var ink = isLight ? trimColor : '#ffffff';
    var strokeInk = isLight ? '#111827' : trimColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Team code across upper chest
    ctx.font = 'bold 28px "Oswald", Impact, sans-serif';
    ctx.fillStyle = ink;
    ctx.fillText(teamCode, 128, 62);
    // Large jersey number
    ctx.font = '900 104px "Oswald", Impact, sans-serif';
    ctx.lineWidth = 6;
    ctx.strokeStyle = strokeInk;
    ctx.strokeText(String(jerseyNum), 128, 152);
    ctx.fillStyle = ink;
    ctx.fillText(String(jerseyNum), 128, 152);
    var tex = new _three.CanvasTexture(canvas);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}
function createArticulatedPlayerRig(player, jerseyColor, trimColor, teamCode, isUserTeam) {
    var root = new _three.Group();
    var scaleH = Math.min(1.16, Math.max(0.88, player.heightCm / 200));
    var bodyGroup = new _three.Group();
    bodyGroup.scale.set(scaleH * 0.96, scaleH, scaleH * 0.96);
    root.add(bodyGroup);
    var disposables = [];
    var track = function track(obj) {
        disposables.push(obj);
        return obj;
    };
    var skinMat = track(new _three.MeshStandardMaterial({
        color: player.skinTone,
        roughness: 0.62,
        metalness: 0.04
    }));
    var jerseyTex = track(createJerseyTexture(player.jersey, jerseyColor, trimColor, teamCode));
    var jerseyMat = track(new _three.MeshStandardMaterial({
        map: jerseyTex,
        roughness: 0.52,
        metalness: 0.08
    }));
    var shortsMat = track(new _three.MeshStandardMaterial({
        color: jerseyColor,
        roughness: 0.56,
        metalness: 0.05
    }));
    var trimMat = track(new _three.MeshStandardMaterial({
        color: trimColor,
        roughness: 0.42,
        metalness: 0.15
    }));
    var shoeMat = track(new _three.MeshStandardMaterial({
        color: player.shoeColor || '#f1f5f9',
        roughness: 0.35,
        metalness: 0.15
    }));
    var sleeveMat = track(new _three.MeshStandardMaterial({
        color: isUserTeam ? '#111318' : '#e2e8f0',
        roughness: 0.6,
        metalness: 0.05
    }));
    var hairMat = track(new _three.MeshStandardMaterial({
        color: player.hairColor || '#151210',
        roughness: 0.85,
        metalness: 0.02
    }));
    // Torso (jersey front/back textured)
    var torsoGeo = track(new _three.BoxGeometry(0.46, 0.62, 0.28));
    var torso = new _three.Mesh(torsoGeo, jerseyMat);
    torso.position.y = 1.24;
    torso.castShadow = true;
    bodyGroup.add(torso);
    // Shoulders bevel
    var shoulderGeo = track(new _three.CapsuleGeometry(0.11, 0.38, 4, 8));
    shoulderGeo.rotateZ(Math.PI / 2);
    var shoulders = new _three.Mesh(shoulderGeo, jerseyMat);
    shoulders.position.y = 1.49;
    bodyGroup.add(shoulders);
    // Shorts
    var shortsGeo = track(new _three.BoxGeometry(0.44, 0.32, 0.27));
    var shorts = new _three.Mesh(shortsGeo, shortsMat);
    shorts.position.y = 0.82;
    shorts.castShadow = true;
    bodyGroup.add(shorts);
    // Waist trim band
    var bandGeo = track(new _three.BoxGeometry(0.455, 0.05, 0.285));
    var band = new _three.Mesh(bandGeo, trimMat);
    band.position.y = 0.96;
    bodyGroup.add(band);
    // Head + Hair + Optional Headband
    var headGroup = new _three.Group();
    headGroup.position.y = 1.68;
    bodyGroup.add(headGroup);
    var neckGeo = track(new _three.CylinderGeometry(0.075, 0.085, 0.12, 10));
    var neck = new _three.Mesh(neckGeo, skinMat);
    neck.position.y = -0.08;
    headGroup.add(neck);
    var headGeo = track(new _three.SphereGeometry(0.145, 14, 12));
    var head = new _three.Mesh(headGeo, skinMat);
    head.position.y = 0.07;
    head.castShadow = true;
    headGroup.add(head);
    if (player.hairStyle !== 'bald') {
        var hairRadius = player.hairStyle === 'afro' ? 0.175 : 0.15;
        var hairGeo = track(new _three.SphereGeometry(hairRadius, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58));
        var hair = new _three.Mesh(hairGeo, hairMat);
        hair.position.y = 0.085;
        headGroup.add(hair);
    }
    if (player.headband) {
        var hbGeo = track(new _three.TorusGeometry(0.142, 0.02, 8, 20));
        hbGeo.rotateX(Math.PI / 2);
        var hb = new _three.Mesh(hbGeo, trimMat);
        hb.position.y = 0.12;
        headGroup.add(hb);
    }
    // Arms (pivoting at shoulder)
    var buildArm = function buildArm(side) {
        var g = new _three.Group();
        g.position.set(side * 0.3, 1.48, 0);
        var upperGeo = track(new _three.CylinderGeometry(0.062, 0.054, 0.34, 10));
        var upper = new _three.Mesh(upperGeo, side === 1 && player.armSleeve ? sleeveMat : skinMat);
        upper.position.y = -0.17;
        upper.castShadow = true;
        g.add(upper);
        var lowerGeo = track(new _three.CylinderGeometry(0.052, 0.044, 0.33, 10));
        var lower = new _three.Mesh(lowerGeo, side === 1 && player.armSleeve ? sleeveMat : skinMat);
        lower.position.y = -0.49;
        g.add(lower);
        var handGeo = track(new _three.SphereGeometry(0.05, 8, 8));
        var hand = new _three.Mesh(handGeo, skinMat);
        hand.position.y = -0.68;
        g.add(hand);
        var handTip = new _three.Object3D();
        handTip.position.set(0, -0.76, 0.08);
        g.add(handTip);
        bodyGroup.add(g);
        return {
            group: g,
            handTip: handTip
        };
    };
    var leftArmBuilt = buildArm(-1);
    var rightArmBuilt = buildArm(1);
    // Legs (pivoting at hip)
    var buildLeg = function buildLeg(side) {
        var g = new _three.Group();
        g.position.set(side * 0.13, 0.72, 0);
        var thighGeo = track(new _three.CylinderGeometry(0.09, 0.075, 0.34, 10));
        var thigh = new _three.Mesh(thighGeo, shortsMat);
        thigh.position.y = -0.15;
        g.add(thigh);
        var calfGeo = track(new _three.CylinderGeometry(0.068, 0.054, 0.38, 10));
        var calf = new _three.Mesh(calfGeo, player.legSleeve && side === -1 ? sleeveMat : skinMat);
        calf.position.y = -0.49;
        calf.castShadow = true;
        g.add(calf);
        var shoeGeo = track(new _three.BoxGeometry(0.13, 0.1, 0.25));
        var shoe = new _three.Mesh(shoeGeo, shoeMat);
        shoe.position.set(0, -0.67, 0.05);
        g.add(shoe);
        bodyGroup.add(g);
        return g;
    };
    var leftLeg = buildLeg(-1);
    var rightLeg = buildLeg(1);
    // ==========================================================================
    // 2K14 3D FLOOR RING & TELEMETRY DIRECTLY UNDER PLAYER FEET
    // ==========================================================================
    var floorRingGroup = new _three.Group();
    floorRingGroup.position.y = 0.022;
    root.add(floorRingGroup);
    var outerRingGeo = track(new _three.RingGeometry(0.56, 0.67, 36));
    outerRingGeo.rotateX(-Math.PI / 2);
    var outerRingMat = track(new _three.MeshBasicMaterial({
        color: isUserTeam ? 0xce1141 : 0x38bdf8,
        transparent: true,
        opacity: 0.9,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    var outerRingMesh = new _three.Mesh(outerRingGeo, outerRingMat);
    floorRingGroup.add(outerRingMesh);
    // Inner Stamina Arc
    var staminaGeo = track(new _three.RingGeometry(0.42, 0.51, 28, 1, 0, Math.PI));
    staminaGeo.rotateX(-Math.PI / 2);
    var staminaMat = track(new _three.MeshBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.92,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    var staminaArcMesh = new _three.Mesh(staminaGeo, staminaMat);
    floorRingGroup.add(staminaArcMesh);
    // Optional 3D Floor Shot Timing Meter Arc
    var shotBgGeo = track(new _three.RingGeometry(0.73, 0.85, 28, 1, -Math.PI * 0.45, Math.PI * 0.9));
    shotBgGeo.rotateX(-Math.PI / 2);
    var shotBgMat = track(new _three.MeshBasicMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.82,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    var shotArcBg = new _three.Mesh(shotBgGeo, shotBgMat);
    shotArcBg.visible = false;
    floorRingGroup.add(shotArcBg);
    var shotFillGeo = track(new _three.RingGeometry(0.74, 0.84, 24, 1, -Math.PI * 0.45, Math.PI * 0.45));
    shotFillGeo.rotateX(-Math.PI / 2);
    var shotFillMat = track(new _three.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.96,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    var shotArcFill = new _three.Mesh(shotFillGeo, shotFillMat);
    shotArcFill.visible = false;
    floorRingGroup.add(shotArcFill);
    // Defensive Matchup Arrow
    var arrowShape = new _three.Shape();
    arrowShape.moveTo(0, 0.25);
    arrowShape.lineTo(-0.14, -0.08);
    arrowShape.lineTo(0.14, -0.08);
    arrowShape.closePath();
    var arrowGeo = track(new _three.ShapeGeometry(arrowShape));
    arrowGeo.rotateX(-Math.PI / 2);
    var arrowMat = track(new _three.MeshBasicMaterial({
        color: 0xf9a01b,
        transparent: true,
        opacity: 0.92,
        side: _three.DoubleSide,
        depthWrite: false
    }));
    var matchupArrow = new _three.Mesh(arrowGeo, arrowMat);
    matchupArrow.position.z = 0.86;
    matchupArrow.visible = false;
    floorRingGroup.add(matchupArrow);
    // Hot / Cold Streak Floor Emblem
    var hotGeo = track(new _three.CircleGeometry(0.16, 16));
    hotGeo.rotateX(-Math.PI / 2);
    var hotMat = track(new _three.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
    }));
    var hotBadgeMesh = new _three.Mesh(hotGeo, hotMat);
    hotBadgeMesh.position.set(0.74, 0.005, -0.45);
    hotBadgeMesh.visible = false;
    floorRingGroup.add(hotBadgeMesh);
    return {
        root: root,
        bodyGroup: bodyGroup,
        headGroup: headGroup,
        leftArm: leftArmBuilt.group,
        rightArm: rightArmBuilt.group,
        leftLeg: leftLeg,
        rightLeg: rightLeg,
        floorRingGroup: floorRingGroup,
        outerRingMesh: outerRingMesh,
        staminaArcMesh: staminaArcMesh,
        shotArcBg: shotArcBg,
        shotArcFill: shotArcFill,
        matchupArrow: matchupArrow,
        hotBadgeMesh: hotBadgeMesh,
        rightHandTip: rightArmBuilt.handTip,
        dispose: function dispose() {
            disposables.forEach(function(d) {
                return d.dispose();
            });
        }
    };
}
function animatePlayerRig(rig, pose, time, speedRatio, airHeight) {
    if (airHeight === void 0) airHeight = 0;
    var stride = Math.sin(time * (8 + speedRatio * 5)) * Math.min(1, speedRatio) * 0.65;
    rig.bodyGroup.position.y = airHeight;
    rig.bodyGroup.rotation.x = 0;
    rig.bodyGroup.rotation.z = 0;
    if (pose === 'jumpshot') {
        rig.leftLeg.rotation.x = -0.18;
        rig.rightLeg.rotation.x = -0.12;
        rig.rightArm.rotation.x = -2.65;
        rig.leftArm.rotation.x = -2.2;
        rig.rightArm.rotation.z = -0.15;
        rig.leftArm.rotation.z = 0.25;
    } else if (pose === 'dunk') {
        rig.bodyGroup.rotation.x = 0.22;
        rig.rightArm.rotation.x = -3.05;
        rig.leftArm.rotation.x = -0.6;
        rig.leftLeg.rotation.x = 0.45;
        rig.rightLeg.rotation.x = -0.5;
    } else if (pose === 'layup') {
        rig.rightArm.rotation.x = -2.85;
        rig.leftArm.rotation.x = -0.9;
        rig.leftLeg.rotation.x = 0.45;
        rig.rightLeg.rotation.x = -0.35;
    } else if (pose === 'block') {
        rig.rightArm.rotation.x = -2.95;
        rig.leftArm.rotation.x = -2.85;
        rig.leftLeg.rotation.x = -0.15;
        rig.rightLeg.rotation.x = -0.15;
    } else if (pose === 'hands_up') {
        rig.rightArm.rotation.x = -2.5;
        rig.leftArm.rotation.x = -2.5;
        rig.rightArm.rotation.z = -0.3;
        rig.leftArm.rotation.z = 0.3;
        rig.leftLeg.rotation.x = stride * 0.4;
        rig.rightLeg.rotation.x = -stride * 0.4;
    } else if (pose === 'intense_d') {
        rig.bodyGroup.position.y = Math.max(0, airHeight) - 0.12;
        rig.bodyGroup.rotation.x = 0.16;
        rig.leftArm.rotation.z = 0.72;
        rig.rightArm.rotation.z = -0.72;
        rig.leftArm.rotation.x = -0.45;
        rig.rightArm.rotation.x = -0.45;
        rig.leftLeg.rotation.x = stride * 0.65;
        rig.rightLeg.rotation.x = -stride * 0.65;
    } else if (pose === 'stumble') {
        rig.bodyGroup.position.y = -0.22;
        rig.bodyGroup.rotation.z = Math.sin(time * 18) * 0.35;
        rig.bodyGroup.rotation.x = -0.28;
        rig.leftArm.rotation.z = 1.1;
        rig.rightArm.rotation.z = -1.1;
    } else if (pose === 'crossover') {
        rig.bodyGroup.position.y = -0.09;
        rig.bodyGroup.rotation.z = Math.sin(time * 20) * 0.18;
        rig.rightArm.rotation.x = -0.8 + Math.sin(time * 20) * 0.4;
        rig.leftArm.rotation.x = -0.8 - Math.sin(time * 20) * 0.4;
        rig.leftLeg.rotation.x = stride;
        rig.rightLeg.rotation.x = -stride;
    } else if (pose === 'post') {
        rig.bodyGroup.position.y = -0.1;
        rig.bodyGroup.rotation.x = 0.2;
        rig.leftArm.rotation.z = 0.65;
        rig.rightArm.rotation.x = -0.9;
        rig.leftLeg.rotation.x = stride * 0.45;
        rig.rightLeg.rotation.x = -stride * 0.45;
    } else if (pose === 'dribble') {
        var bounce = Math.sin(time * 12) * 0.38;
        rig.rightArm.rotation.x = -0.85 + bounce;
        rig.rightArm.rotation.z = -0.18;
        rig.leftArm.rotation.x = -0.45 + stride * 0.4;
        rig.leftArm.rotation.z = 0.28;
        rig.leftLeg.rotation.x = stride;
        rig.rightLeg.rotation.x = -stride;
    } else if (pose === 'celebrate') {
        rig.rightArm.rotation.x = -2.7 + Math.sin(time * 10) * 0.25;
        rig.leftArm.rotation.x = -2.7 - Math.sin(time * 10) * 0.25;
        rig.leftLeg.rotation.x = 0;
        rig.rightLeg.rotation.x = 0;
    } else {
        rig.leftLeg.rotation.x = stride;
        rig.rightLeg.rotation.x = -stride;
        rig.leftArm.rotation.x = -stride * 0.85;
        rig.rightArm.rotation.x = stride * 0.85;
        rig.leftArm.rotation.z = 0.1;
        rig.rightArm.rotation.z = -0.1;
    }
}
function updatePlayerFloorRing(rig, opts) {
    rig.floorRingGroup.visible = opts.visible;
    if (!opts.visible) return;
    var outerMat = rig.outerRingMesh.material;
    outerMat.color.set(opts.isControlled ? opts.teamColor : opts.isPrimaryDefender ? '#38bdf8' : '#94a3b8');
    outerMat.opacity = opts.isControlled ? 0.96 : opts.isPrimaryDefender ? 0.7 : 0.25;
    // Stamina arc color transitions yellow -> orange -> flashing red
    rig.staminaArcMesh.visible = opts.isControlled;
    if (opts.isControlled) {
        var s = Math.max(0.05, Math.min(1, opts.stamina / 100));
        rig.staminaArcMesh.scale.set(1, 1, 1);
        var sMat = rig.staminaArcMesh.material;
        if (s > 0.55) sMat.color.set('#facc15');
        else if (s > 0.25) sMat.color.set('#f97316');
        else sMat.color.set('#ef4444');
        sMat.opacity = s < 0.25 ? 0.55 + Math.abs(Math.sin(performance.now() * 0.014)) * 0.45 : 0.92;
        rig.staminaArcMesh.rotation.y = (1 - s) * Math.PI * 0.5;
    }
    // Optional 3D Floor Shot Timing Meter
    rig.shotArcBg.visible = opts.isControlled && opts.showShotMeter;
    rig.shotArcFill.visible = opts.isControlled && opts.showShotMeter;
    if (opts.isControlled && opts.showShotMeter) {
        var fillMat = rig.shotArcFill.material;
        var distGreen = Math.abs(opts.shotFill - 0.82);
        fillMat.color.set(distGreen < 0.065 ? '#22c55e' : distGreen < 0.16 ? '#facc15' : '#ef4444');
        rig.shotArcFill.rotation.y = -Math.PI * 0.45 + Math.min(1.1, opts.shotFill) * Math.PI * 0.45;
    }
    // Matchup Arrow
    if (opts.matchupAngle !== null && opts.matchupAngle !== undefined && opts.isControlled) {
        rig.matchupArrow.visible = true;
        var r = 0.88;
        rig.matchupArrow.position.set(Math.sin(opts.matchupAngle) * r, 0.008, Math.cos(opts.matchupAngle) * r);
        rig.matchupArrow.rotation.y = opts.matchupAngle;
    } else {
        rig.matchupArrow.visible = false;
    }
    // Hot / Cold Badge
    if (opts.streak >= 2) {
        rig.hotBadgeMesh.visible = true;
        rig.hotBadgeMesh.material.color.set('#ef4444');
    } else if (opts.streak <= -3) {
        rig.hotBadgeMesh.visible = true;
        rig.hotBadgeMesh.material.color.set('#38bdf8');
    } else {
        rig.hotBadgeMesh.visible = false;
    }
}

});
// === MODULE: src/games/hoops-2k26/nba2k14/storage ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/storage", function(require, module, exports) {
// ============================================================================
// NBA 2K14 — Persistent Save Manager, Defaults, Locker Codes & Payout Logic
// ============================================================================
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
    get NBA2K14_STORAGE_KEY () {
        return NBA2K14_STORAGE_KEY;
    },
    get applyMatchResultToSave () {
        return applyMatchResultToSave;
    },
    get buildMyPlayerFromSpec () {
        return buildMyPlayerFromSpec;
    },
    get createDefaultAssociation () {
        return createDefaultAssociation;
    },
    get createDefaultMyCareer () {
        return createDefaultMyCareer;
    },
    get createDefaultMyTeam () {
        return createDefaultMyTeam;
    },
    get createDefaultPlayoffs () {
        return createDefaultPlayoffs;
    },
    get createDefaultSaveData () {
        return createDefaultSaveData;
    },
    get createDefaultSettings () {
        return createDefaultSettings;
    },
    get createDefaultSliders () {
        return createDefaultSliders;
    },
    get createDefaultVip () {
        return createDefaultVip;
    },
    get createEmptyHotZones () {
        return createEmptyHotZones;
    },
    get createMyTeamCardFromPlayer () {
        return createMyTeamCardFromPlayer;
    },
    get getResolvedTeams () {
        return getResolvedTeams;
    },
    get gradeToNumeric () {
        return gradeToNumeric;
    },
    get loadNba2k14Save () {
        return loadNba2k14Save;
    },
    get persistNba2k14Save () {
        return persistNba2k14Save;
    },
    get redeemLockerCode () {
        return redeemLockerCode;
    }
});
var _modesData = require("./data/modesData");
var _rosters = require("./data/rosters");
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
var NBA2K14_STORAGE_KEY = 'nba2k14_save_v1';
function createDefaultSliders(preset) {
    if (preset === void 0) preset = 'Default';
    var base = preset === 'Arcade' ? 62 : preset === 'Simulation' ? 47 : 50;
    return {
        insideShot: base,
        closeShot: base,
        midRange: base,
        threePt: preset === 'Arcade' ? 64 : base,
        layup: base + 2,
        dunkInTraffic: preset === 'Arcade' ? 68 : base,
        passAccuracy: base + 4,
        alleyOop: preset === 'Arcade' ? 66 : base,
        contactShot: base,
        drivingContactFreq: preset === 'Simulation' ? 56 : 50,
        insideContactFreq: preset === 'Simulation' ? 56 : 50,
        stealSuccess: base,
        blockSuccess: base + 2,
        defAwareness: preset === 'Simulation' ? 56 : base,
        onBallDefense: preset === 'Simulation' ? 55 : base,
        acceleration: preset === 'Arcade' ? 60 : 50,
        vertical: preset === 'Arcade' ? 62 : 50,
        strength: 50,
        stamina: preset === 'Arcade' ? 65 : 50,
        speed: preset === 'Arcade' ? 60 : 50,
        hustle: 52,
        ballHandling: preset === 'Arcade' ? 62 : 50,
        hands: 54,
        offRebounding: 50,
        defRebounding: 52
    };
}
function createDefaultSettings() {
    return {
        game: {
            difficulty: 'All-Star',
            quarterLengthMin: 5,
            gameStyle: 'Default',
            gameSpeed: 50,
            shotTiming: 'User Timing',
            freeThrowTiming: 'User Timing',
            fatigue: true,
            injuries: false,
            clutchFactor: true
        },
        rules: {
            outOfBounds: true,
            backcourtViolation: true,
            eightSecondViolation: true,
            shotClock24: true,
            threeSecondKey: false,
            goaltending: true,
            shootingFouls: true,
            reachInFouls: true,
            chargingFouls: true
        },
        controller: {
            proStickFunction: 'Default',
            proStickOrientation: 'Camera Relative',
            shotMeterDisplay: 'On (Floor Ring)',
            shotFeedback: true,
            defensiveAssist: 50,
            boxoutAssist: 50,
            virtualGamepad: 'Auto'
        },
        keybinds: {
            moveUp: 'KeyW',
            moveDown: 'KeyS',
            moveLeft: 'KeyA',
            moveRight: 'KeyD',
            sprint: 'ShiftLeft',
            shoot: 'Space',
            pass: 'KeyE',
            postUp: 'KeyF',
            pickAndRoll: 'KeyV',
            intenseD: 'KeyC',
            handsUp: 'KeyU',
            iconPass: 'KeyR',
            playCall: 'KeyQ',
            flashyPass: 'KeyZ',
            timeout: 'KeyT',
            proStickUp: 'KeyI',
            proStickDown: 'KeyK',
            proStickLeft: 'KeyJ',
            proStickRight: 'KeyL'
        },
        camera: {
            angle: '2K',
            zoom: 5,
            height: 5,
            keyZoom: true,
            autoFlip: true,
            dunkShake: true
        },
        presentation: {
            scoreboardDisplay: true,
            playerIndicatorStyle: 'Full 2K14 Ring',
            actionReplays: 'Occasionally'
        },
        audio: {
            master: 80,
            beats: 62,
            crowd: 75,
            sfx: 85,
            commentary: 75,
            muted: false
        },
        coach: {
            adaptiveEngine: true,
            substitutions: 'Auto (Fatigue)',
            timeouts: 'Manual',
            offensivePlaycalling: 'Auto',
            playVision: 'Full',
            playArtMessages: true
        },
        slidersUser: createDefaultSliders('Default'),
        slidersCpu: createDefaultSliders('Default'),
        graphics: {
            renderQuality: 'High',
            courtReflections: true,
            crowdDetail: 'High',
            fpsCounter: false
        },
        jukeboxDisabledTrackIds: []
    };
}
function createEmptyHotZones() {
    var out = {};
    for(var _iterator = _create_for_of_iterator_helper_loose(_modesData.ALL_HOT_ZONE_IDS), _step; !(_step = _iterator()).done;){
        var id = _step.value;
        out[id] = {
            made: 0,
            att: 0
        };
    }
    return out;
}
function createDefaultVip() {
    return {
        name: 'KING_2K14',
        avatarCrest: 'MIA',
        favTeamId: 'mia',
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        bestWinStreak: 0,
        totalPoints: 0,
        totalReb: 0,
        totalAst: 0,
        totalStl: 0,
        totalBlk: 0,
        totalTo: 0,
        insideMade: 0,
        insideAtt: 0,
        midMade: 0,
        midAtt: 0,
        threeMade: 0,
        threeAtt: 0,
        fastbreakPts: 0,
        paintPts: 0,
        excellentReleases: 0,
        totalShots: 0,
        gradeSum: 0,
        vc: 5000,
        sp: 2500,
        mt: 2000,
        parkRep: 150,
        parkWins: 0,
        parkLosses: 0,
        parkStreak: 0,
        hotZones: createEmptyHotZones(),
        unlockedAchievements: [],
        redeemedCodes: []
    };
}
function buildMyPlayerFromSpec(name, jersey, pos, playStyle, heightCm, weightLbs, skinTone, hairStyle, headband, armSleeve, legSleeve, shoeColor, teamId) {
    if (teamId === void 0) teamId = 'mia';
    var styleSkillsMap = {
        Athletic: [
            {
                id: 'posterizer',
                level: 1
            },
            {
                id: 'one_man_fastbreak',
                level: 1
            }
        ],
        Scoring: [
            {
                id: 'shot_creator',
                level: 1
            },
            {
                id: 'microwave',
                level: 1
            }
        ],
        '3PT Specialist': [
            {
                id: 'catch_and_shoot',
                level: 1
            },
            {
                id: 'corner_specialist',
                level: 1
            }
        ],
        'All-Around': [
            {
                id: 'finisher',
                level: 1
            },
            {
                id: 'dimer',
                level: 1
            }
        ],
        'Pass First': [
            {
                id: 'dimer',
                level: 1
            },
            {
                id: 'floor_general',
                level: 1
            }
        ],
        Defensive: [
            {
                id: 'lockdown_defender',
                level: 1
            },
            {
                id: 'pick_pocket',
                level: 1
            }
        ],
        Post: [
            {
                id: 'post_proficiency',
                level: 1
            },
            {
                id: 'brick_wall',
                level: 1
            }
        ],
        Rebounding: [
            {
                id: 'tenacious_rebounder',
                level: 1
            },
            {
                id: 'hustle_points',
                level: 1
            }
        ]
    };
    var sigSkills = styleSkillsMap[playStyle];
    var attrs = (0, _rosters.buildAttributesForPlayer)(name, pos, 68, sigSkills.map(function(s) {
        return s.id;
    }));
    if (playStyle === '3PT Specialist') attrs.threePt = 82;
    if (playStyle === 'Athletic') {
        attrs.dunk = 84;
        attrs.vertical = 86;
        attrs.speed = 84;
    }
    if (playStyle === 'Defensive') {
        attrs.onBallDefense = 84;
        attrs.steal = 80;
    }
    if (playStyle === 'Pass First') {
        attrs.passAccuracy = 84;
        attrs.ballHandle = 82;
    }
    return {
        id: 'myplayer_user',
        name: name.trim() || 'MP Prodigy',
        pos: pos,
        jersey: jersey,
        ovr: 68,
        heightCm: heightCm,
        weightLbs: weightLbs,
        skinTone: skinTone,
        hairStyle: hairStyle,
        hairColor: '#14110f',
        headband: headband,
        armSleeve: armSleeve,
        legSleeve: legSleeve,
        shoeColor: shoeColor,
        attrs: attrs,
        signatureSkills: sigSkills,
        hotZones: {},
        releaseSpeed: 0.64,
        isStarter: true,
        teamId: teamId,
        jumpShotForm: 'LeBron James',
        dunkPackage: 'Athletic One-Handers',
        dribbleStyle: 'Kyrie Irving Iso'
    };
}
function createDefaultMyCareer() {
    return {
        created: false,
        drafted: false,
        draftPick: 0,
        teamId: 'mia',
        playStyle: 'All-Around',
        player: buildMyPlayerFromSpec('Freq 2K14', 6, 'SF', 'All-Around', 201, 222, '#7b4d31', 'fade', true, true, false, '#CE1141'),
        seasonGameIndex: 0,
        wins: 0,
        losses: 0,
        fans: 12500,
        chemistry: 72,
        drillsCompleted: [],
        gameLogs: [],
        socialFeed: [
            {
                id: 'sf1',
                handle: '@NBA2KInsider',
                text: 'Scouts are buzzing ahead of the 2014 Rookie Showcase tonight.',
                time: '1h ago'
            },
            {
                id: 'sf2',
                handle: '@KingJames',
                text: 'Stay locked in. Earn your minutes on both ends of the floor. #StriveForGreatness',
                time: '3h ago'
            }
        ]
    };
}
function createDefaultAssociation(userTeamId, seasonLength) {
    if (userTeamId === void 0) userTeamId = 'mia';
    if (seasonLength === void 0) seasonLength = 29;
    var standings = {};
    for(var _iterator = _create_for_of_iterator_helper_loose(_rosters.NBA_TEAMS), _step; !(_step = _iterator()).done;){
        var t = _step.value;
        standings[t.id] = {
            teamId: t.id,
            wins: 0,
            losses: 0,
            chemistry: 78
        };
    }
    var team = (0, _rosters.getTeamById)(userTeamId);
    var rotationMinutes = {};
    team.players.forEach(function(p, idx) {
        rotationMinutes[p.id] = idx < 5 ? 34 : idx < 8 ? 18 : 8;
    });
    var freeAgents = [
        buildMyPlayerFromSpec('Allen Iverson (FA)', 3, 'PG', 'Scoring', 183, 165, '#7b4d31', 'dreads', true, true, false, '#ffffff', 'fa'),
        buildMyPlayerFromSpec('Tracy McGrady (FA)', 1, 'SG', 'Scoring', 203, 210, '#6d4329', 'bald', false, true, true, '#CE1141', 'fa'),
        buildMyPlayerFromSpec('Lamar Odom (FA)', 7, 'PF', 'All-Around', 208, 230, '#6d4329', 'short', false, false, false, '#FDB927', 'fa'),
        buildMyPlayerFromSpec('Kenyon Martin (FA)', 4, 'PF', 'Defensive', 206, 234, '#6d4329', 'bald', true, true, false, '#006BB6', 'fa')
    ].map(function(p, idx) {
        return _extends({}, p, {
            id: "fa_2k14_" + idx,
            ovr: 79 - idx * 2
        });
    });
    return {
        active: false,
        userTeamId: userTeamId,
        seasonLength: seasonLength,
        currentDay: 1,
        standings: standings,
        rotationMinutes: rotationMinutes,
        ownerGoal: 'Win 60%+ of regular season games and reach the Conference Finals.',
        ownerTrust: 75,
        freeAgents: freeAgents,
        tradeHistory: []
    };
}
function createDefaultPlayoffs(userTeamId, bestOf) {
    if (userTeamId === void 0) userTeamId = 'mia';
    if (bestOf === void 0) bestOf = 3;
    var east = _rosters.NBA_TEAMS.filter(function(t) {
        return t.conference === 'EAST';
    }).sort(function(a, b) {
        return b.ovr - a.ovr;
    }).slice(0, 8);
    var west = _rosters.NBA_TEAMS.filter(function(t) {
        return t.conference === 'WEST';
    }).sort(function(a, b) {
        return b.ovr - a.ovr;
    }).slice(0, 8);
    var pairs = [
        [
            0,
            7
        ],
        [
            3,
            4
        ],
        [
            2,
            5
        ],
        [
            1,
            6
        ]
    ];
    var series = [];
    pairs.forEach(function(param, idx) {
        var hi = param[0], lo = param[1];
        series.push({
            id: "e_r1_" + idx,
            round: 1,
            conference: 'EAST',
            higherSeedId: east[hi].id,
            lowerSeedId: east[lo].id,
            higherWins: 0,
            lowerWins: 0,
            winnerId: null
        });
        series.push({
            id: "w_r1_" + idx,
            round: 1,
            conference: 'WEST',
            higherSeedId: west[hi].id,
            lowerSeedId: west[lo].id,
            higherWins: 0,
            lowerWins: 0,
            winnerId: null
        });
    });
    return {
        active: false,
        bestOf: bestOf,
        userTeamId: userTeamId,
        series: series
    };
}
function createMyTeamCardFromPlayer(player, tier) {
    var team = (0, _rosters.getTeamById)(player.teamId);
    return {
        id: "mtc_" + tier.toLowerCase() + "_" + player.id + "_" + Math.floor(Math.random() * 10000),
        player: _extends({}, player),
        tier: tier,
        teamCode: team.code
    };
}
function createDefaultMyTeam() {
    return {
        starterOpened: false,
        collection: [],
        lineupCardIds: [],
        rttpSeed: 8,
        rttpWins: 0,
        dominationStars: {}
    };
}
function createDefaultSaveData() {
    return {
        version: 1,
        lastMode: 'quick',
        vip: createDefaultVip(),
        settings: createDefaultSettings(),
        myCareer: createDefaultMyCareer(),
        pathToGreatness: {
            selectedPath: 'heat_dynasty',
            completedStars: {}
        },
        association: createDefaultAssociation(),
        playoffs: createDefaultPlayoffs(),
        myTeam: createDefaultMyTeam(),
        customPlayers: [],
        rosterOverrides: {},
        teamTransfers: {}
    };
}
function loadNba2k14Save() {
    var fallback = createDefaultSaveData();
    try {
        var _parsed_vip, _ref, _parsed_settings, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _parsed_myCareer, _parsed_pathToGreatness, _parsed_association, _parsed_playoffs, _parsed_myTeam;
        var _parsed_vip1, _parsed_settings1, _parsed_settings2, _parsed_settings3, _parsed_settings4, _parsed_settings5, _parsed_settings6, _parsed_settings7, _parsed_settings8, _parsed_settings9, _parsed_settings10, _parsed_settings11;
        if (typeof localStorage === 'undefined') return fallback;
        var raw = localStorage.getItem(NBA2K14_STORAGE_KEY);
        if (!raw) return fallback;
        var parsed = JSON.parse(raw);
        return _extends({}, fallback, parsed, {
            vip: _extends({}, fallback.vip, (_parsed_vip = parsed.vip) != null ? _parsed_vip : {}, {
                hotZones: _extends({}, fallback.vip.hotZones, (_ref = (_parsed_vip1 = parsed.vip) == null ? void 0 : _parsed_vip1.hotZones) != null ? _ref : {})
            }),
            settings: _extends({}, fallback.settings, (_parsed_settings = parsed.settings) != null ? _parsed_settings : {}, {
                game: _extends({}, fallback.settings.game, (_ref1 = (_parsed_settings1 = parsed.settings) == null ? void 0 : _parsed_settings1.game) != null ? _ref1 : {}),
                rules: _extends({}, fallback.settings.rules, (_ref2 = (_parsed_settings2 = parsed.settings) == null ? void 0 : _parsed_settings2.rules) != null ? _ref2 : {}),
                controller: _extends({}, fallback.settings.controller, (_ref3 = (_parsed_settings3 = parsed.settings) == null ? void 0 : _parsed_settings3.controller) != null ? _ref3 : {}),
                keybinds: _extends({}, fallback.settings.keybinds, (_ref4 = (_parsed_settings4 = parsed.settings) == null ? void 0 : _parsed_settings4.keybinds) != null ? _ref4 : {}),
                camera: _extends({}, fallback.settings.camera, (_ref5 = (_parsed_settings5 = parsed.settings) == null ? void 0 : _parsed_settings5.camera) != null ? _ref5 : {}),
                presentation: _extends({}, fallback.settings.presentation, (_ref6 = (_parsed_settings6 = parsed.settings) == null ? void 0 : _parsed_settings6.presentation) != null ? _ref6 : {}),
                audio: _extends({}, fallback.settings.audio, (_ref7 = (_parsed_settings7 = parsed.settings) == null ? void 0 : _parsed_settings7.audio) != null ? _ref7 : {}),
                coach: _extends({}, fallback.settings.coach, (_ref8 = (_parsed_settings8 = parsed.settings) == null ? void 0 : _parsed_settings8.coach) != null ? _ref8 : {}),
                slidersUser: _extends({}, fallback.settings.slidersUser, (_ref9 = (_parsed_settings9 = parsed.settings) == null ? void 0 : _parsed_settings9.slidersUser) != null ? _ref9 : {}),
                slidersCpu: _extends({}, fallback.settings.slidersCpu, (_ref10 = (_parsed_settings10 = parsed.settings) == null ? void 0 : _parsed_settings10.slidersCpu) != null ? _ref10 : {}),
                graphics: _extends({}, fallback.settings.graphics, (_ref11 = (_parsed_settings11 = parsed.settings) == null ? void 0 : _parsed_settings11.graphics) != null ? _ref11 : {})
            }),
            myCareer: _extends({}, fallback.myCareer, (_parsed_myCareer = parsed.myCareer) != null ? _parsed_myCareer : {}),
            pathToGreatness: _extends({}, fallback.pathToGreatness, (_parsed_pathToGreatness = parsed.pathToGreatness) != null ? _parsed_pathToGreatness : {}),
            association: _extends({}, fallback.association, (_parsed_association = parsed.association) != null ? _parsed_association : {}),
            playoffs: _extends({}, fallback.playoffs, (_parsed_playoffs = parsed.playoffs) != null ? _parsed_playoffs : {}),
            myTeam: _extends({}, fallback.myTeam, (_parsed_myTeam = parsed.myTeam) != null ? _parsed_myTeam : {})
        });
    } catch (unused) {
        return fallback;
    }
}
function persistNba2k14Save(save) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(NBA2K14_STORAGE_KEY, JSON.stringify(save));
        }
    } catch (unused) {
    // ignore storage quota failures
    }
}
function getResolvedTeams(save) {
    var customByTeam = new Map();
    for(var _iterator = _create_for_of_iterator_helper_loose(save.customPlayers), _step; !(_step = _iterator()).done;){
        var cp = _step.value;
        var _customByTeam_get;
        var arr = (_customByTeam_get = customByTeam.get(cp.teamId)) != null ? _customByTeam_get : [];
        arr.push(cp);
        customByTeam.set(cp.teamId, arr);
    }
    var allBasePlayers = (0, _rosters.getAllPlayers)();
    return _rosters.ALL_TEAMS.map(function(team) {
        var _customByTeam_get;
        var players = allBasePlayers.filter(function(p) {
            var _save_teamTransfers_p_id;
            return ((_save_teamTransfers_p_id = save.teamTransfers[p.id]) != null ? _save_teamTransfers_p_id : p.teamId) === team.id;
        }).map(function(p) {
            var _ov_attrs;
            var ov = save.rosterOverrides[p.id];
            return ov ? _extends({}, p, ov, {
                attrs: _extends({}, p.attrs, (_ov_attrs = ov.attrs) != null ? _ov_attrs : {})
            }) : p;
        });
        var added = (_customByTeam_get = customByTeam.get(team.id)) != null ? _customByTeam_get : [];
        return _extends({}, team, {
            players: [].concat(players, added)
        });
    });
}
function redeemLockerCode(save, inputCode) {
    var code = inputCode.trim().toUpperCase();
    var def = _modesData.LOCKER_CODES.find(function(c) {
        return c.code === code;
    });
    if (!def) {
        return {
            ok: false,
            message: 'Invalid Locker Code. Try KINGJAMES, 2K14LEGEND, or BLACKTOP21.',
            nextSave: save
        };
    }
    if (save.vip.redeemedCodes.includes(code)) {
        return {
            ok: false,
            message: "Locker Code " + code + " has already been redeemed on this VIP Profile.",
            nextSave: save
        };
    }
    var nextCollection = [].concat(save.myTeam.collection);
    if (def.bonusCardPlayerName && def.bonusTier) {
        var found = (0, _rosters.getAllPlayers)().find(function(p) {
            return p.name === def.bonusCardPlayerName;
        });
        if (found) {
            nextCollection.push(createMyTeamCardFromPlayer(found, def.bonusTier));
        }
    }
    var unlocked = new Set(save.vip.unlockedAchievements);
    unlocked.add('locker_hunter');
    var nextSave = _extends({}, save, {
        vip: _extends({}, save.vip, {
            vc: save.vip.vc + def.vc,
            sp: save.vip.sp + def.sp,
            mt: save.vip.mt + def.mt,
            parkRep: save.vip.parkRep + (code === 'BLACKTOP21' ? 500 : 0),
            redeemedCodes: [].concat(save.vip.redeemedCodes, [
                code
            ]),
            unlockedAchievements: Array.from(unlocked)
        }),
        myTeam: _extends({}, save.myTeam, {
            collection: nextCollection
        })
    });
    return {
        ok: true,
        message: "Redeemed " + code + ": " + def.label,
        nextSave: nextSave
    };
}
function gradeToNumeric(grade) {
    var _map_grade;
    var map = {
        F: 0,
        'D-': 1,
        D: 1.5,
        'D+': 2,
        'C-': 2.5,
        C: 3,
        'C+': 3.5,
        'B-': 4,
        B: 4.5,
        'B+': 5,
        'A-': 5.5,
        A: 6,
        'A+': 6.5
    };
    return (_map_grade = map[grade]) != null ? _map_grade : 3;
}
function applyMatchResultToSave(save, summary) {
    var _summary_shootoutScore, _summary_dunkContestScore;
    var nextVip = _extends({}, save.vip, {
        hotZones: _extends({}, save.vip.hotZones),
        unlockedAchievements: [].concat(save.vip.unlockedAchievements)
    });
    var userTeamPlayers = summary.boxScore.filter(function(s) {
        return s.teamSide === summary.config.userSide;
    });
    var userPts = summary.config.userSide === 'home' ? summary.homeScore : summary.awayScore;
    var oppPts = summary.config.userSide === 'home' ? summary.awayScore : summary.homeScore;
    var teamReb = userTeamPlayers.reduce(function(a, b) {
        return a + b.reb;
    }, 0);
    var teamAst = userTeamPlayers.reduce(function(a, b) {
        return a + b.ast;
    }, 0);
    var teamStl = userTeamPlayers.reduce(function(a, b) {
        return a + b.stl;
    }, 0);
    var teamBlk = userTeamPlayers.reduce(function(a, b) {
        return a + b.blk;
    }, 0);
    var teamTo = userTeamPlayers.reduce(function(a, b) {
        return a + b.to;
    }, 0);
    var team3pm = userTeamPlayers.reduce(function(a, b) {
        return a + b.tpm;
    }, 0);
    nextVip.gamesPlayed += 1;
    if (summary.userWon) {
        nextVip.wins += 1;
        nextVip.winStreak += 1;
        nextVip.bestWinStreak = Math.max(nextVip.bestWinStreak, nextVip.winStreak);
    } else {
        nextVip.losses += 1;
        nextVip.winStreak = 0;
    }
    nextVip.totalPoints += userPts;
    nextVip.totalReb += teamReb;
    nextVip.totalAst += teamAst;
    nextVip.totalStl += teamStl;
    nextVip.totalBlk += teamBlk;
    nextVip.totalTo += teamTo;
    nextVip.gradeSum += gradeToNumeric(summary.teammateGrade);
    nextVip.vc += summary.vcEarned;
    nextVip.sp += summary.spEarned;
    nextVip.mt += summary.mtEarned;
    if (summary.config.mode === 'park') {
        nextVip.parkRep += summary.repEarned;
        if (summary.userWon) {
            nextVip.parkWins += 1;
            nextVip.parkStreak += 1;
        } else {
            nextVip.parkLosses += 1;
            nextVip.parkStreak = 0;
        }
    }
    var excCount = 0;
    for(var _iterator = _create_for_of_iterator_helper_loose(summary.userShotLog), _step; !(_step = _iterator()).done;){
        var shot = _step.value;
        var _nextVip_hotZones_shot_zone;
        var cur = (_nextVip_hotZones_shot_zone = nextVip.hotZones[shot.zone]) != null ? _nextVip_hotZones_shot_zone : {
            made: 0,
            att: 0
        };
        nextVip.hotZones[shot.zone] = {
            made: cur.made + (shot.made ? 1 : 0),
            att: cur.att + 1
        };
        nextVip.totalShots += 1;
        if (shot.excellent) {
            nextVip.excellentReleases += 1;
            excCount += 1;
        }
        if (shot.pts === 3) {
            nextVip.threeAtt += 1;
            if (shot.made) nextVip.threeMade += 1;
        } else if (shot.paint) {
            nextVip.insideAtt += 1;
            if (shot.made) {
                nextVip.insideMade += 1;
                nextVip.paintPts += shot.pts;
            }
        } else {
            nextVip.midAtt += 1;
            if (shot.made) nextVip.midMade += 1;
        }
        if (shot.fastbreak && shot.made) {
            nextVip.fastbreakPts += shot.pts;
        }
    }
    // Evaluate Achievements
    var unlocked = new Set(nextVip.unlockedAchievements);
    var newlyUnlocked = [];
    var grant = function grant(id) {
        if (!unlocked.has(id)) {
            unlocked.add(id);
            newlyUnlocked.push(id);
        }
    };
    if (summary.userWon) grant('first_win');
    if (summary.userWon && Math.abs(userPts - oppPts) <= 3) grant('buzzer_beater');
    if (userPts >= 40) grant('ten_zero_run');
    if (team3pm >= 5 || ((_summary_shootoutScore = summary.shootoutScore) != null ? _summary_shootoutScore : 0) >= 18) grant('downtown_king');
    if (teamStl >= 5) grant('lockdown_5_steals');
    if (teamBlk >= 4) grant('rim_protector');
    if (excCount >= 5) grant('green_machine');
    if (((_summary_dunkContestScore = summary.dunkContestScore) != null ? _summary_dunkContestScore : 0) >= 45 || nextVip.paintPts >= 20) grant('posterizer_dunk');
    if (userTeamPlayers.some(function(p) {
        return p.pts >= 20;
    })) grant('twenty_pts');
    if (userTeamPlayers.some(function(p) {
        var cats = [
            p.pts,
            p.reb,
            p.ast,
            p.stl,
            p.blk
        ].filter(function(v) {
            return v >= 10;
        }).length;
        return cats >= 3;
    })) {
        grant('triple_double');
    }
    if (userTeamPlayers.some(function(p) {
        var cats = [
            p.pts,
            p.reb,
            p.ast,
            p.stl,
            p.blk
        ].filter(function(v) {
            return v >= 10;
        }).length;
        return cats >= 2;
    })) {
        grant('double_double');
    }
    if (summary.config.mode === 'park' && summary.config.playersPerSide === 5 && summary.userWon) grant('king_of_court');
    if (nextVip.parkStreak >= 3) grant('park_streak_3');
    if (nextVip.winStreak >= 5) grant('win_streak_5');
    if (summary.config.mode === 'training') grant('training_grad');
    if (summary.pathStarsEarned === 3) grant('ptg_gold');
    if (summary.config.mode === 'mycareer' && (summary.teammateGrade === 'A' || summary.teammateGrade === 'A+')) {
        grant('mycareer_a_plus');
    }
    var homeTeam = (0, _rosters.getTeamById)(summary.config.homeTeamId);
    var awayTeam = (0, _rosters.getTeamById)(summary.config.awayTeamId);
    if (summary.userWon && (homeTeam.league === 'EUROLEAGUE' || awayTeam.league === 'EUROLEAGUE')) grant('euro_champ');
    if (summary.userWon && (homeTeam.league === 'CLASSIC' || awayTeam.league === 'CLASSIC')) grant('classic_legend');
    nextVip.unlockedAchievements = Array.from(unlocked);
    // Path to Greatness progression
    var nextPath = _extends({}, save.pathToGreatness, {
        completedStars: _extends({}, save.pathToGreatness.completedStars)
    });
    if (summary.config.mode === 'path' && summary.config.pathChapterId && summary.userWon) {
        var _nextPath_completedStars_summary_config_pathChapterId;
        var ch = _modesData.PATH_TO_GREATNESS_CHAPTERS.find(function(c) {
            return c.id === summary.config.pathChapterId;
        });
        var lbj = userTeamPlayers.find(function(p) {
            return p.name.includes('LeBron');
        });
        var margin = userPts - oppPts;
        var stars = 1;
        if (ch) {
            var _ref, _ref1;
            if (((_ref = lbj == null ? void 0 : lbj.pts) != null ? _ref : 0) >= ch.objectives.lebronPtsTarget && margin >= ch.objectives.winMarginTarget) {
                stars = 3;
            } else if (((_ref1 = lbj == null ? void 0 : lbj.pts) != null ? _ref1 : 0) >= Math.max(8, ch.objectives.lebronPtsTarget - 4)) {
                stars = 2;
            }
        }
        var prev = (_nextPath_completedStars_summary_config_pathChapterId = nextPath.completedStars[summary.config.pathChapterId]) != null ? _nextPath_completedStars_summary_config_pathChapterId : 0;
        nextPath.completedStars[summary.config.pathChapterId] = Math.max(prev, stars);
    }
    // MyCAREER progression
    var nextMyCareer = save.myCareer;
    if (summary.config.mode === 'rookie_showcase') {
        var gradeScore = gradeToNumeric(summary.teammateGrade);
        var pick = Math.max(1, Math.min(30, Math.round(24 - gradeScore * 3.2 - (summary.userWon ? 4 : 0))));
        var draftedTeam = _rosters.NBA_TEAMS[(pick - 1) % _rosters.NBA_TEAMS.length];
        unlocked.add('mycareer_draft');
        nextVip.unlockedAchievements = Array.from(unlocked);
        nextMyCareer = _extends({}, save.myCareer, {
            drafted: true,
            draftPick: pick,
            teamId: draftedTeam.id,
            player: _extends({}, save.myCareer.player, {
                teamId: draftedTeam.id
            }),
            socialFeed: [].concat([
                {
                    id: "draft_" + Date.now(),
                    handle: '@NBADraft2014',
                    text: "With the #" + pick + " pick, the " + draftedTeam.fullName + " select " + save.myCareer.player.name + "!",
                    time: 'Just now'
                }
            ], save.myCareer.socialFeed)
        });
    } else if (summary.config.mode === 'mycareer') {
        var _userTeamPlayers_find, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
        var mp = (_userTeamPlayers_find = userTeamPlayers.find(function(p) {
            return p.playerId === save.myCareer.player.id;
        })) != null ? _userTeamPlayers_find : userTeamPlayers[0];
        var oppTeam = (0, _rosters.getTeamById)(summary.config.userSide === 'home' ? summary.config.awayTeamId : summary.config.homeTeamId);
        nextMyCareer = _extends({}, save.myCareer, {
            seasonGameIndex: save.myCareer.seasonGameIndex + 1,
            wins: save.myCareer.wins + (summary.userWon ? 1 : 0),
            losses: save.myCareer.losses + (summary.userWon ? 0 : 1),
            fans: save.myCareer.fans + (summary.userWon ? 4500 : 1500) + ((_ref2 = mp == null ? void 0 : mp.pts) != null ? _ref2 : 0) * 180,
            chemistry: Math.min(100, Math.max(20, save.myCareer.chemistry + (summary.userWon ? 4 : -2))),
            gameLogs: [].concat([
                {
                    gameNum: save.myCareer.seasonGameIndex + 1,
                    opponentCode: oppTeam.code,
                    won: summary.userWon,
                    teamScore: userPts,
                    oppScore: oppPts,
                    pts: (_ref3 = mp == null ? void 0 : mp.pts) != null ? _ref3 : 0,
                    reb: (_ref4 = mp == null ? void 0 : mp.reb) != null ? _ref4 : 0,
                    ast: (_ref5 = mp == null ? void 0 : mp.ast) != null ? _ref5 : 0,
                    stl: (_ref6 = mp == null ? void 0 : mp.stl) != null ? _ref6 : 0,
                    blk: (_ref7 = mp == null ? void 0 : mp.blk) != null ? _ref7 : 0,
                    grade: summary.teammateGrade
                }
            ], save.myCareer.gameLogs).slice(0, 30),
            socialFeed: [].concat([
                {
                    id: "g_" + Date.now(),
                    handle: "@" + oppTeam.code + "Beat",
                    text: save.myCareer.player.name + " dropped " + ((_ref8 = mp == null ? void 0 : mp.pts) != null ? _ref8 : 0) + " PTS / " + ((_ref9 = mp == null ? void 0 : mp.ast) != null ? _ref9 : 0) + " AST (" + summary.teammateGrade + ") " + (summary.userWon ? 'in a huge win' : 'in a hard-fought battle') + " vs " + oppTeam.name + "!",
                    time: 'Just now'
                }
            ], save.myCareer.socialFeed).slice(0, 12)
        });
    }
    // MyTEAM Domination & RTTP updates
    var nextMyTeam = save.myTeam;
    if (summary.config.mode === 'myteam' && summary.userWon) {
        if (summary.config.myTeamDominationTeamId) {
            var _save_myTeam_dominationStars_summary_config_myTeamDominationTeamId;
            var stars1 = userPts - oppPts >= 10 ? 3 : userPts - oppPts >= 5 ? 2 : 1;
            var prev1 = (_save_myTeam_dominationStars_summary_config_myTeamDominationTeamId = save.myTeam.dominationStars[summary.config.myTeamDominationTeamId]) != null ? _save_myTeam_dominationStars_summary_config_myTeamDominationTeamId : 0;
            if (stars1 === 3) {
                unlocked.add('myteam_dom');
                nextVip.unlockedAchievements = Array.from(unlocked);
            }
            var _obj;
            nextMyTeam = _extends({}, save.myTeam, {
                dominationStars: _extends({}, save.myTeam.dominationStars, (_obj = {}, _obj[summary.config.myTeamDominationTeamId] = Math.max(prev1, stars1), _obj))
            });
        } else {
            var wins = save.myTeam.rttpWins + 1;
            nextMyTeam = _extends({}, save.myTeam, {
                rttpWins: wins,
                rttpSeed: Math.max(1, 8 - Math.floor(wins / 2))
            });
        }
    }
    var nextSave = _extends({}, save, {
        lastMode: summary.config.mode === 'mycareer' ? 'mycareer' : summary.config.mode === 'path' ? 'path' : summary.config.mode === 'association' ? 'association' : save.lastMode,
        vip: nextVip,
        pathToGreatness: nextPath,
        myCareer: nextMyCareer,
        myTeam: nextMyTeam
    });
    return {
        nextSave: nextSave,
        newlyUnlocked: newlyUnlocked
    };
}

});
// === MODULE: src/games/hoops-2k26/nba2k14/types ===
ArcadeMod.define("src/games/hoops-2k26/nba2k14/types", function(require, module, exports) {
// ============================================================================
// NBA 2K14 (2013-14 Era) — Core TypeScript Domain Models
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});

});

})(window.ArcadeMod);
