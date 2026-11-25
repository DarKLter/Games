(function(ArcadeMod){
// === MODULE: src/games/hoops-2k26/engine/CourtTextures ===
ArcadeMod.define("src/games/hoops-2k26/engine/CourtTextures", function(require, module, exports) {
// ============================================================================
// PART 3 — PROCEDURAL HIGH-RES CANVAS TEXTURES (ZERO EXTERNAL ASSETS)
// Generates 2048x1024 Hardwood/Asphalt/Stone court maps, 1024x512 roughness
// maps, dynamic jersey textures (front/back numbers + surname), basketball
// dimpled leather seams, 4-sided Jumbotron canvas, and LED scorer ribbon.
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
    get JerseyTextureCache () {
        return JerseyTextureCache;
    },
    get createBasketballTexture () {
        return createBasketballTexture;
    },
    get createCourtTextures () {
        return createCourtTextures;
    },
    get createJumbotronTexture () {
        return createJumbotronTexture;
    },
    get createScorerRibbonTexture () {
        return createScorerRibbonTexture;
    },
    get resolveJerseyPalette () {
        return resolveJerseyPalette;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _courtTypes = require("./courtTypes");
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
function worldXToU(x, w) {
    return (x + _courtTypes.COURT_DIMS.HALF_LENGTH) / _courtTypes.COURT_DIMS.LENGTH * w;
}
function worldZToV(z, h) {
    return (z + _courtTypes.COURT_DIMS.HALF_WIDTH) / _courtTypes.COURT_DIMS.WIDTH * h;
}
function hexLuminance(hex) {
    var clean = hex.replace('#', '');
    if (clean.length < 6) return 0.35;
    var r = parseInt(clean.slice(0, 2), 16) / 255;
    var g = parseInt(clean.slice(2, 4), 16) / 255;
    var b = parseInt(clean.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function resolveJerseyPalette(team, variant) {
    var p = team.colors.primary || '#1d4ed8';
    var s = team.colors.secondary || '#f59e0b';
    var a = team.colors.accent || '#ffffff';
    if (variant === 'HOME') {
        return {
            body: '#f8fafc',
            trim: p,
            text: p,
            shorts: '#f1f5f9'
        };
    }
    if (variant === 'CITY') {
        return {
            body: '#111827',
            trim: s,
            text: s,
            shorts: '#0f172a'
        };
    }
    if (variant === 'CLASSIC') {
        var isLight = hexLuminance(s) > 0.62;
        return {
            body: s,
            trim: p,
            text: isLight ? '#111827' : '#ffffff',
            shorts: s
        };
    }
    // AWAY
    var darkBody = hexLuminance(p) < 0.58;
    return {
        body: p,
        trim: s,
        text: darkBody ? '#ffffff' : a === p ? '#0f172a' : '#111827',
        shorts: p
    };
}
function createCourtTextures(homeTeam, venue, streakStamp) {
    var W = 2048;
    var H = 1024;
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    var primary = homeTeam.colors.primary || '#1d4ed8';
    var secondary = homeTeam.colors.secondary || '#f59e0b';
    var isAsphalt = (0, _courtTypes.isStreetAsphaltVenue)(venue);
    var isColiseum = venue === 'STREET_KINGS';
    // 1. Base court surface
    if (isAsphalt) {
        var baseHex = venue === 'SKYLINE_PARK' ? '#2a3346' : venue === 'SUNSET_BEACH' ? '#1e4e68' : venue === 'RIVET_CITY' ? '#3b2f2f' : venue === 'OLD_TOWN' ? '#2e3b38' : '#1f232b';
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, W, H);
        // Subtle concrete/asphalt grain speckles
        for(var i = 0; i < 4800; i++){
            var gx = i * 1973 % W;
            var gy = (i * 911 + Math.floor(i / 7) * 31) % H;
            ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)';
            ctx.fillRect(gx, gy, 3, 2);
        }
        // Subtle outdoor paint border
        ctx.fillStyle = venue === 'SUNSET_BEACH' ? 'rgba(249, 115, 22, 0.28)' : venue === 'SKYLINE_PARK' ? 'rgba(14, 165, 233, 0.22)' : 'rgba(225, 29, 72, 0.2)';
        ctx.fillRect(0, 0, W, 56);
        ctx.fillRect(0, H - 56, W, 56);
    } else if (isColiseum) {
        ctx.fillStyle = '#d6c7a9';
        ctx.fillRect(0, 0, W, H);
        // Stone slab grid
        ctx.strokeStyle = 'rgba(87, 73, 52, 0.26)';
        ctx.lineWidth = 3;
        for(var x = 0; x < W; x += 128){
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for(var y = 0; y < H; y += 128){
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }
    } else {
        // Authentic light-oak / maple hardwood planks
        var plankH = 16;
        var isClassic2K14 = venue === 'ARENA_2K14';
        var isWnba = venue === 'WNBA_ARENA';
        var baseHue = isClassic2K14 ? 33 : isWnba ? 35 : 34;
        for(var row = 0; row < H / plankH; row++){
            var x1 = -(row * 73 % 140);
            while(x1 < W){
                var len = 130 + (row * 37 + Math.abs(x1) * 13) % 160;
                var shade = (row * 19 + Math.abs(x1) * 7) % 11 - 5;
                var light = (isClassic2K14 ? 61 : 65) + shade * 0.9;
                var sat = isClassic2K14 ? 54 : 46;
                ctx.fillStyle = "hsl(" + baseHue + ", " + sat + "%, " + light + "%)";
                ctx.fillRect(x1, row * plankH, len, plankH);
                // Subtle plank seam
                ctx.strokeStyle = 'rgba(92, 58, 28, 0.22)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x1 + 0.5, row * plankH + 0.5, len - 1, plankH - 1);
                x1 += len;
            }
        }
    }
    // 2. Painted Keys (Left & Right)
    var keyPxW = _courtTypes.COURT_DIMS.KEY_LENGTH / _courtTypes.COURT_DIMS.LENGTH * W;
    var keyPxH = _courtTypes.COURT_DIMS.KEY_HALF_WIDTH * 2 / _courtTypes.COURT_DIMS.WIDTH * H;
    var keyTopY = worldZToV(-_courtTypes.COURT_DIMS.KEY_HALF_WIDTH, H);
    var keyColor = venue === 'WNBA_ARENA' ? '#ea580c' : venue === 'EUROLEAGUE_PALACE' ? '#1e3a8a' : isColiseum ? '#7c2d12' : primary;
    ctx.save();
    ctx.globalAlpha = isAsphalt ? 0.78 : 0.88;
    ctx.fillStyle = keyColor;
    ctx.fillRect(0, keyTopY, keyPxW, keyPxH);
    ctx.fillRect(W - keyPxW, keyTopY, keyPxW, keyPxH);
    ctx.restore();
    // Baseline team wordmarks
    ctx.save();
    ctx.fillStyle = isAsphalt ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.28)';
    ctx.font = '900 44px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var baselineText = (venue === 'SKYLINE_PARK' ? 'SKYLINE PARK' : venue === 'STREET_KINGS' ? 'STREET KINGS' : homeTeam.city + " " + homeTeam.name).toUpperCase();
    ctx.save();
    ctx.translate(42, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(baselineText, 0, 0);
    ctx.restore();
    ctx.save();
    ctx.translate(W - 42, H / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(baselineText, 0, 0);
    ctx.restore();
    ctx.restore();
    // 3. Regulation Crisp White Court Lines
    var lineCol = venue === 'ARENA_2K14' ? '#fef3c7' : '#ffffff';
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 6;
    // Outer perimeter
    ctx.strokeRect(4, 4, W - 8, H - 8);
    // Half-court line
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    // Center Circle & Home Team Logo / Streak Setter Stamp
    var centerR = _courtTypes.COURT_DIMS.CENTER_CIRCLE_R / _courtTypes.COURT_DIMS.WIDTH * H;
    ctx.save();
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, centerR * 1.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = secondary;
    ctx.stroke();
    // Inner circle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, centerR * 0.84, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 5;
    ctx.stroke();
    // Team Abbr / Streak Stamp
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (venue === 'SKYLINE_PARK' && streakStamp) {
        ctx.font = '900 42px Impact, Arial Black, sans-serif';
        ctx.fillText('2K26', W / 2, H / 2 - 22);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '800 22px Arial Black, sans-serif';
        ctx.fillText(streakStamp.slice(0, 20), W / 2, H / 2 + 24);
    } else {
        ctx.font = '900 76px Impact, Arial Black, sans-serif';
        ctx.fillText(homeTeam.abbr.slice(0, 5), W / 2, H / 2 - 6);
        ctx.fillStyle = secondary;
        ctx.font = '800 20px Arial, sans-serif';
        ctx.fillText(homeTeam.name.toUpperCase().slice(0, 14), W / 2, H / 2 + 44);
    }
    ctx.restore();
    // Key rectangles, free-throw circles, restricted arcs, and 3-point arcs (Left & Right)
    var ftRadius = _courtTypes.COURT_DIMS.CENTER_CIRCLE_R / _courtTypes.COURT_DIMS.WIDTH * H;
    var threePtRx = _courtTypes.COURT_DIMS.THREE_PT_RADIUS / _courtTypes.COURT_DIMS.LENGTH * W;
    var threePtRz = _courtTypes.COURT_DIMS.THREE_PT_RADIUS / _courtTypes.COURT_DIMS.WIDTH * H;
    var cornerZTop = worldZToV(-_courtTypes.COURT_DIMS.CORNER_THREE_Z, H);
    var cornerZBot = worldZToV(_courtTypes.COURT_DIMS.CORNER_THREE_Z, H);
    for(var _i = 0, _iter = [
        -1,
        1
    ]; _i < _iter.length; _i++){
        var side = _iter[_i];
        var rimU = worldXToU(side * _courtTypes.COURT_DIMS.RIM_X, W);
        var ftU = worldXToU(side * _courtTypes.COURT_DIMS.FREE_THROW_X, W);
        // Key box outline
        ctx.strokeStyle = lineCol;
        ctx.lineWidth = 5;
        if (side === -1) {
            ctx.strokeRect(4, keyTopY, keyPxW - 4, keyPxH);
        } else {
            ctx.strokeRect(W - keyPxW, keyTopY, keyPxW - 4, keyPxH);
        }
        // Free-throw circle
        ctx.beginPath();
        ctx.arc(ftU, H / 2, ftRadius, 0, Math.PI * 2);
        ctx.stroke();
        // Restricted area arc
        var raR = 1.22 / _courtTypes.COURT_DIMS.WIDTH * H;
        ctx.beginPath();
        ctx.arc(rimU, H / 2, raR, side === -1 ? -Math.PI / 2 : Math.PI / 2, side === -1 ? Math.PI / 2 : Math.PI * 3 / 2);
        ctx.stroke();
        // 3-Point Arc + Corner Straight Lines
        var cornerIntersectX = Math.sqrt(Math.max(0.1, _courtTypes.COURT_DIMS.THREE_PT_RADIUS * _courtTypes.COURT_DIMS.THREE_PT_RADIUS - _courtTypes.COURT_DIMS.CORNER_THREE_Z * _courtTypes.COURT_DIMS.CORNER_THREE_Z));
        var cornerEndU = worldXToU(side === -1 ? -_courtTypes.COURT_DIMS.RIM_X + cornerIntersectX : _courtTypes.COURT_DIMS.RIM_X - cornerIntersectX, W);
        var baseU = side === -1 ? 4 : W - 4;
        ctx.beginPath();
        ctx.moveTo(baseU, cornerZTop);
        ctx.lineTo(cornerEndU, cornerZTop);
        ctx.moveTo(baseU, cornerZBot);
        ctx.lineTo(cornerEndU, cornerZBot);
        ctx.stroke();
        var maxAng = Math.asin(_courtTypes.COURT_DIMS.CORNER_THREE_Z / _courtTypes.COURT_DIMS.THREE_PT_RADIUS);
        ctx.beginPath();
        if (side === -1) {
            ctx.ellipse(rimU, H / 2, threePtRx, threePtRz, 0, -maxAng, maxAng);
        } else {
            ctx.ellipse(rimU, H / 2, threePtRx, threePtRz, 0, Math.PI - maxAng, Math.PI + maxAng);
        }
        ctx.stroke();
        // Lane hash ticks
        ctx.lineWidth = 4;
        for(var hIdx = 0; hIdx < 4; hIdx++){
            var dist = 2.1 + hIdx * 0.92;
            var hu = worldXToU(side * (_courtTypes.COURT_DIMS.HALF_LENGTH - dist), W);
            ctx.beginPath();
            ctx.moveTo(hu, keyTopY - 12);
            ctx.lineTo(hu, keyTopY);
            ctx.moveTo(hu, keyTopY + keyPxH);
            ctx.lineTo(hu, keyTopY + keyPxH + 12);
            ctx.stroke();
        }
    }
    var colorMap = new _three.CanvasTexture(canvas);
    colorMap.colorSpace = _three.SRGBColorSpace;
    colorMap.anisotropy = 8;
    colorMap.needsUpdate = true;
    // 4. Procedural 1024x512 Roughness Map (varnished hardwood vs gritty asphalt)
    var rCanvas = document.createElement('canvas');
    rCanvas.width = 1024;
    rCanvas.height = 512;
    var rCtx = rCanvas.getContext('2d');
    if (isAsphalt || isColiseum) {
        rCtx.fillStyle = '#cfcfcf';
        rCtx.fillRect(0, 0, 1024, 512);
        for(var i1 = 0; i1 < 2400; i1++){
            var rx = i1 * 613 % 1024;
            var ry = i1 * 331 % 512;
            rCtx.fillStyle = i1 % 2 === 0 ? '#bdbdbd' : '#e2e2e2';
            rCtx.fillRect(rx, ry, 4, 4);
        }
    } else {
        // Varnished planks with glossy center & subtle scuff wear in the paint
        rCtx.fillStyle = '#4c4c4c';
        rCtx.fillRect(0, 0, 1024, 512);
        for(var row1 = 0; row1 < 64; row1++){
            var g = 60 + row1 * 17 % 34;
            rCtx.fillStyle = "rgb(" + g + "," + g + "," + g + ")";
            rCtx.fillRect(0, row1 * 8, 1024, 7);
        }
    }
    var roughnessMap = new _three.CanvasTexture(rCanvas);
    roughnessMap.needsUpdate = true;
    return {
        colorMap: colorMap,
        roughnessMap: roughnessMap,
        dispose: function dispose() {
            colorMap.dispose();
            roughnessMap.dispose();
        }
    };
}
var JerseyTextureCache = /*#__PURE__*/ function() {
    "use strict";
    function JerseyTextureCache() {
        this.map = new Map();
    }
    var _proto = JerseyTextureCache.prototype;
    _proto.getJerseyTexture = function getJerseyTexture(team, variant, jerseyNumber, lastName) {
        var key = team.id + "_" + variant + "_" + jerseyNumber + "_" + lastName;
        var existing = this.map.get(key);
        if (existing) return existing;
        var pal = resolveJerseyPalette(team, variant);
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        // Left half = Front (0..128), Right half = Back (128..256)
        ctx.fillStyle = pal.body;
        ctx.fillRect(0, 0, 256, 256);
        // Collar & armhole trim accents
        ctx.fillStyle = pal.trim;
        ctx.fillRect(0, 0, 256, 18);
        ctx.fillRect(0, 236, 256, 20);
        ctx.fillRect(124, 0, 8, 256);
        // Front team wordmark + jersey number
        ctx.fillStyle = pal.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 24px Impact, Arial Black, sans-serif';
        ctx.fillText(team.abbr.slice(0, 5), 62, 66);
        ctx.font = '900 68px Impact, Arial Black, sans-serif';
        ctx.strokeStyle = pal.trim;
        ctx.lineWidth = 4;
        var numStr = String(jerseyNumber);
        ctx.strokeText(numStr, 62, 138);
        ctx.fillText(numStr, 62, 138);
        // Back surname + big jersey number
        ctx.font = '900 18px Arial Black, sans-serif';
        ctx.fillText(lastName.toUpperCase().slice(0, 11), 192, 60);
        ctx.font = '900 76px Impact, Arial Black, sans-serif';
        ctx.strokeText(numStr, 192, 144);
        ctx.fillText(numStr, 192, 144);
        var tex = new _three.CanvasTexture(canvas);
        tex.colorSpace = _three.SRGBColorSpace;
        tex.needsUpdate = true;
        this.map.set(key, tex);
        return tex;
    };
    _proto.dispose = function dispose() {
        this.map.forEach(function(tex) {
            return tex.dispose();
        });
        this.map.clear();
    };
    return JerseyTextureCache;
}();
function createBasketballTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#d95b16');
    grad.addColorStop(0.5, '#c2410c');
    grad.addColorStop(1, '#9a3412');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    // Pebbled leather dimples
    for(var i = 0; i < 1600; i++){
        var x = i * 197 % 512;
        var y = i * 89 % 256;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,215,175,0.12)' : 'rgba(55,20,5,0.18)';
        ctx.fillRect(x, y, 2, 2);
    }
    // Classic black seams
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, 128);
    ctx.lineTo(512, 128);
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(128, 128, 76, 118, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(384, 128, 76, 118, 0, 0, Math.PI * 2);
    ctx.stroke();
    var tex = new _three.CanvasTexture(canvas);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}
function createJumbotronTexture() {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var texture = new _three.CanvasTexture(canvas);
    texture.colorSpace = _three.SRGBColorSpace;
    var update = function update(awayAbbr, awayPts, homeAbbr, homePts, clockText, banner) {
        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(0, 0, 512, 42);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px Impact, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('HOOPS 2K26 · LIVE ARENA FEED', 256, 22);
        ctx.font = '900 48px Impact, Arial Black, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(awayAbbr + "  " + awayPts, 132, 118);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(homeAbbr + "  " + homePts, 380, 118);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 32px monospace';
        ctx.fillText(clockText, 256, 174);
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 206, 512, 50);
        ctx.fillStyle = '#fde68a';
        ctx.font = '800 18px Arial, sans-serif';
        ctx.fillText(banner.slice(0, 42), 256, 232);
        texture.needsUpdate = true;
    };
    update('MIA', 0, 'OKC', 0, 'Q1 5:00', 'TIP-OFF LIVE');
    return {
        texture: texture,
        update: update,
        dispose: function dispose() {
            return texture.dispose();
        }
    };
}
function createScorerRibbonTexture(homeTeam, venue) {
    var canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 96;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, 1024, 96);
    ctx.fillStyle = homeTeam.colors.primary || '#e11d48';
    ctx.fillRect(0, 0, 1024, 14);
    ctx.fillStyle = homeTeam.colors.secondary || '#f59e0b';
    ctx.fillRect(0, 82, 1024, 14);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 38px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var label = venue === 'ARENA_2K14' ? "NBA 2K14 FINALS  •  " + homeTeam.city.toUpperCase() + " " + homeTeam.name.toUpperCase() + "  •  PROPLAY" : "NBA 2K26 PROPLAY  •  " + homeTeam.city.toUpperCase() + " " + homeTeam.name.toUpperCase() + "  •  2K SPORTS";
    ctx.fillText(label, 512, 49);
    var tex = new _three.CanvasTexture(canvas);
    tex.colorSpace = _three.SRGBColorSpace;
    tex.wrapS = _three.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
}

});
// === MODULE: src/games/hoops-2k26/engine/PlayerMesh3D ===
ArcadeMod.define("src/games/hoops-2k26/engine/PlayerMesh3D", function(require, module, exports) {
// ============================================================================
// PART 3 — ARTICULATED 3D PLAYER MESH (PlayerMesh3D.ts)
// Scaled by exact heightInches, weightLbs & wingspanInches from Part 2 DB.
// Features all 7 hairstyles, headband, sleeves, tights, sneakers, contact
// shadow, dynamic jersey textures, and all 20 ProPLAY animation states.
// ============================================================================
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PlayerMesh3D", {
    enumerable: true,
    get: function() {
        return PlayerMesh3D;
    }
});
var _three = /*#__PURE__*/ _interop_require_wildcard(require("three"));
var _courtTypes = require("./courtTypes");
var _CourtTextures = require("./CourtTextures");
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
var _tmpVec = new _three.Vector3();
function safeColor(hex, fallback) {
    try {
        return new _three.Color(hex || fallback);
    } catch (unused) {
        return new _three.Color(fallback);
    }
}
var PlayerMesh3D = /*#__PURE__*/ function() {
    "use strict";
    function PlayerMesh3D(player, team, jerseyVariant, jerseyCache) {
        var _this = this;
        this.root = new _three.Group();
        this.bodyGroup = new _three.Group();
        this.headGroup = new _three.Group();
        this.leftArmPivot = new _three.Group();
        this.rightArmPivot = new _three.Group();
        this.leftForearmPivot = new _three.Group();
        this.rightForearmPivot = new _three.Group();
        this.leftHandTip = new _three.Object3D();
        this.rightHandTip = new _three.Object3D();
        this.leftLegPivot = new _three.Group();
        this.rightLegPivot = new _three.Group();
        this.leftShinPivot = new _three.Group();
        this.rightShinPivot = new _three.Group();
        this.ownedGeos = [];
        this.ownedMats = [];
        this.props = (0, _courtTypes.computePlayerProportions)(player.heightInches, player.weightLbs, player.wingspanInches);
        var _this_props = this.props, heightScale = _this_props.heightScale, widthScale = _this_props.widthScale, armScale = _this_props.armScale, legLength = _this_props.legLength, torsoHeight = _this_props.torsoHeight, shoulderWidth = _this_props.shoulderWidth;
        var pal = (0, _CourtTextures.resolveJerseyPalette)(team, jerseyVariant);
        var app = player.appearance;
        var skinMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(app.skinTone, 0x8d5524),
            roughness: 0.62,
            metalness: 0.04
        }));
        var hairMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(app.hairColor, 0x18181b),
            roughness: 0.85
        }));
        var jerseyTex = jerseyCache.getJerseyTexture(team, jerseyVariant, player.jerseyNumber, player.lastName);
        var jerseyMat = this.trackMat(new _three.MeshStandardMaterial({
            map: jerseyTex,
            roughness: 0.72,
            metalness: 0.05
        }));
        var shortsMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(pal.shorts, 0x1d4ed8),
            roughness: 0.76
        }));
        var trimMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(pal.trim, 0xf59e0b),
            roughness: 0.55
        }));
        var shoeMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(app.shoeColor, 0xf8fafc),
            roughness: 0.42,
            metalness: 0.12
        }));
        var accMat = this.trackMat(new _three.MeshStandardMaterial({
            color: safeColor(pal.trim, 0x111827),
            roughness: 0.65
        }));
        // Contact shadow disc grounded at y = 0.015
        var shadowGeo = this.trackGeo(new _three.CircleGeometry(0.42 * widthScale, 20));
        var shadowMat = this.trackMat(new _three.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.34,
            depthWrite: false
        }));
        this.shadowMesh = new _three.Mesh(shadowGeo, shadowMat);
        this.shadowMesh.rotation.x = -Math.PI / 2;
        this.shadowMesh.position.y = 0.016;
        this.root.add(this.shadowMesh);
        this.root.add(this.bodyGroup);
        // Pelvis / Shorts
        var hipY = legLength;
        var shortsH = 0.25 * heightScale;
        var shortsGeo = this.trackGeo(new _three.CylinderGeometry(0.18 * widthScale, 0.21 * widthScale, shortsH, 12));
        var shortsMesh = new _three.Mesh(shortsGeo, shortsMat);
        shortsMesh.position.y = hipY;
        shortsMesh.castShadow = true;
        this.bodyGroup.add(shortsMesh);
        // Torso (Jersey Cylinder — rotated so front faces +X)
        var torsoGeo = this.trackGeo(new _three.CylinderGeometry(0.21 * widthScale, 0.175 * widthScale, torsoHeight, 14));
        this.torsoMesh = new _three.Mesh(torsoGeo, jerseyMat);
        this.torsoMesh.position.y = hipY + shortsH * 0.42 + torsoHeight * 0.5;
        this.torsoMesh.rotation.y = Math.PI / 2;
        this.torsoMesh.castShadow = true;
        this.bodyGroup.add(this.torsoMesh);
        // Neck & Head
        var shoulderY = hipY + shortsH * 0.42 + torsoHeight;
        var neckGeo = this.trackGeo(new _three.CylinderGeometry(0.065, 0.075, 0.1 * heightScale, 8));
        var neckMesh = new _three.Mesh(neckGeo, skinMat);
        neckMesh.position.y = shoulderY + 0.04 * heightScale;
        this.bodyGroup.add(neckMesh);
        this.headGroup.position.set(0, shoulderY + 0.19 * heightScale, 0);
        var headGeo = this.trackGeo(new _three.SphereGeometry(0.125 * Math.pow(heightScale, 0.5), 14, 12));
        var headMesh = new _three.Mesh(headGeo, skinMat);
        headMesh.castShadow = true;
        this.headGroup.add(headMesh);
        // Headband if enabled
        if (app.headband) {
            var bandGeo = this.trackGeo(new _three.TorusGeometry(0.122, 0.018, 6, 18));
            var bandMesh = new _three.Mesh(bandGeo, trimMat);
            bandMesh.rotation.x = Math.PI / 2;
            bandMesh.position.y = 0.038;
            this.headGroup.add(bandMesh);
        }
        // All Hairstyles (BALD, BUZZ, SHORT, FADE, AFRO, DREADS, BRAIDS, PONYTAIL)
        this.attachHairstyle(app.hairStyle, hairMat);
        this.bodyGroup.add(this.headGroup);
        // Arms (Left = -Z side, Right = +Z side when facing +X)
        var upperArmL = 0.31 * armScale;
        var foreArmL = 0.29 * armScale;
        var armRadius = 0.052 * widthScale;
        this.leftArmPivot.position.set(0, shoulderY - 0.04, -shoulderWidth * 0.54);
        this.rightArmPivot.position.set(0, shoulderY - 0.04, shoulderWidth * 0.54);
        var buildArm = function buildArm(shoulderPivot, forePivot, handTip, hasSleeve) {
            var uGeo = _this.trackGeo(new _three.CylinderGeometry(armRadius * 1.05, armRadius * 0.9, upperArmL, 8));
            var uMesh = new _three.Mesh(uGeo, hasSleeve ? accMat : skinMat);
            uMesh.position.y = -upperArmL * 0.5;
            uMesh.castShadow = true;
            shoulderPivot.add(uMesh);
            forePivot.position.set(0, -upperArmL, 0);
            var fGeo = _this.trackGeo(new _three.CylinderGeometry(armRadius * 0.88, armRadius * 0.72, foreArmL, 8));
            var fMesh = new _three.Mesh(fGeo, hasSleeve ? accMat : skinMat);
            fMesh.position.y = -foreArmL * 0.5;
            fMesh.castShadow = true;
            forePivot.add(fMesh);
            var hGeo = _this.trackGeo(new _three.SphereGeometry(armRadius * 0.85, 8, 8));
            var hMesh = new _three.Mesh(hGeo, skinMat);
            hMesh.position.y = -foreArmL;
            forePivot.add(hMesh);
            handTip.position.set(0, -foreArmL - 0.04, 0);
            forePivot.add(handTip);
            shoulderPivot.add(forePivot);
            _this.bodyGroup.add(shoulderPivot);
        };
        buildArm(this.leftArmPivot, this.leftForearmPivot, this.leftHandTip, app.armSleeve === 'LEFT' || app.armSleeve === 'BOTH');
        buildArm(this.rightArmPivot, this.rightForearmPivot, this.rightHandTip, app.armSleeve === 'RIGHT' || app.armSleeve === 'BOTH');
        // Legs & Sneakers
        var thighL = legLength * 0.5;
        var shinL = legLength * 0.45;
        var legR = 0.072 * widthScale;
        this.leftLegPivot.position.set(0, hipY - 0.04, -0.11 * widthScale);
        this.rightLegPivot.position.set(0, hipY - 0.04, 0.11 * widthScale);
        var buildLeg = function buildLeg(hipPivot, shinPivot) {
            var tGeo = _this.trackGeo(new _three.CylinderGeometry(legR, legR * 0.85, thighL, 8));
            var tMesh = new _three.Mesh(tGeo, app.legCompression ? accMat : skinMat);
            tMesh.position.y = -thighL * 0.5;
            tMesh.castShadow = true;
            hipPivot.add(tMesh);
            shinPivot.position.set(0, -thighL, 0);
            var sGeo = _this.trackGeo(new _three.CylinderGeometry(legR * 0.8, legR * 0.65, shinL, 8));
            var sMesh = new _three.Mesh(sGeo, app.legCompression ? accMat : skinMat);
            sMesh.position.y = -shinL * 0.5;
            sMesh.castShadow = true;
            shinPivot.add(sMesh);
            var shoeGeo = _this.trackGeo(new _three.BoxGeometry(0.26 * heightScale, 0.09, 0.12 * widthScale));
            var shoeMesh = new _three.Mesh(shoeGeo, shoeMat);
            shoeMesh.position.set(0.05, -shinL - 0.03, 0);
            shoeMesh.castShadow = true;
            shinPivot.add(shoeMesh);
            hipPivot.add(shinPivot);
            _this.bodyGroup.add(hipPivot);
        };
        buildLeg(this.leftLegPivot, this.leftShinPivot);
        buildLeg(this.rightLegPivot, this.rightShinPivot);
    }
    var _proto = PlayerMesh3D.prototype;
    _proto.trackGeo = function trackGeo(g) {
        this.ownedGeos.push(g);
        return g;
    };
    _proto.trackMat = function trackMat(m) {
        this.ownedMats.push(m);
        return m;
    };
    _proto.attachHairstyle = function attachHairstyle(style, mat) {
        if (style === 'BALD') return;
        if (style === 'BUZZ' || style === 'SHORT') {
            var g = this.trackGeo(new _three.SphereGeometry(0.128, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52));
            var m = new _three.Mesh(g, mat);
            m.position.y = 0.006;
            this.headGroup.add(m);
            return;
        }
        if (style === 'FADE') {
            var g1 = this.trackGeo(new _three.CylinderGeometry(0.105, 0.118, 0.068, 12));
            var m1 = new _three.Mesh(g1, mat);
            m1.position.y = 0.115;
            this.headGroup.add(m1);
            return;
        }
        if (style === 'AFRO') {
            var g2 = this.trackGeo(new _three.SphereGeometry(0.175, 14, 12));
            var m2 = new _three.Mesh(g2, mat);
            m2.position.set(-0.015, 0.068, 0);
            this.headGroup.add(m2);
            return;
        }
        if (style === 'DREADS' || style === 'BRAIDS') {
            var count = style === 'DREADS' ? 8 : 6;
            var len = style === 'DREADS' ? 0.19 : 0.15;
            var capGeo = this.trackGeo(new _three.SphereGeometry(0.126, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5));
            this.headGroup.add(new _three.Mesh(capGeo, mat));
            var strandGeo = this.trackGeo(new _three.CylinderGeometry(0.018, 0.014, len, 6));
            for(var i = 0; i < count; i++){
                var ang = Math.PI * 0.55 + i / Math.max(1, count - 1) * Math.PI * 0.9;
                var s = new _three.Mesh(strandGeo, mat);
                s.position.set(Math.cos(ang) * 0.11, -0.02, Math.sin(ang) * 0.11);
                s.rotation.z = 0.25;
                this.headGroup.add(s);
            }
            return;
        }
        if (style === 'PONYTAIL') {
            var capGeo1 = this.trackGeo(new _three.SphereGeometry(0.128, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55));
            this.headGroup.add(new _three.Mesh(capGeo1, mat));
            var tailGeo = this.trackGeo(new _three.ConeGeometry(0.048, 0.22, 8));
            var tail = new _three.Mesh(tailGeo, mat);
            tail.position.set(-0.145, 0.02, 0);
            tail.rotation.z = -2.35;
            this.headGroup.add(tail);
        }
    };
    _proto.update = function update(state) {
        this.root.visible = state.visible;
        if (!state.visible) return;
        this.root.position.set(state.x, 0, state.z);
        this.bodyGroup.position.y = Math.max(0, state.y);
        this.bodyGroup.rotation.y = state.facingRad;
        // Ground contact shadow shrinks subtly as player jumps
        var jumpScale = Math.max(0.42, 1 - state.y * 0.34);
        this.shadowMesh.scale.set(jumpScale, jumpScale, 1);
        var p = state.animPhase;
        var sp = state.shotProgress;
        // Reset default neutral pose before applying active ProPLAY animation
        this.bodyGroup.rotation.z = 0;
        this.bodyGroup.rotation.x = 0;
        this.leftArmPivot.rotation.set(0, 0, 0.15);
        this.rightArmPivot.rotation.set(0, 0, 0.15);
        this.leftForearmPivot.rotation.set(0, 0, 0.35);
        this.rightForearmPivot.rotation.set(0, 0, 0.35);
        this.leftLegPivot.rotation.set(0, 0, 0);
        this.rightLegPivot.rotation.set(0, 0, 0);
        this.leftShinPivot.rotation.set(0, 0, 0);
        this.rightShinPivot.rotation.set(0, 0, 0);
        switch(state.animState){
            case 'RUN':
            case 'SPRINT':
                {
                    var amp = state.animState === 'SPRINT' ? 0.85 : 0.58;
                    var stride = Math.sin(p);
                    this.bodyGroup.rotation.z = state.animState === 'SPRINT' ? -0.18 : -0.09;
                    this.leftLegPivot.rotation.z = stride * amp;
                    this.rightLegPivot.rotation.z = -stride * amp;
                    this.leftShinPivot.rotation.z = Math.max(0, -stride * 0.75);
                    this.rightShinPivot.rotation.z = Math.max(0, stride * 0.75);
                    this.leftArmPivot.rotation.z = -stride * amp * 0.8;
                    this.rightArmPivot.rotation.z = stride * amp * 0.8;
                    this.leftForearmPivot.rotation.z = 0.8;
                    this.rightForearmPivot.rotation.z = 0.8;
                    break;
                }
            case 'DRIBBLE_RIGHT':
            case 'DRIBBLE_LEFT':
            case 'CROSSOVER':
                {
                    var stride1 = Math.sin(p) * 0.42;
                    var bounce = Math.abs(Math.sin(p * 1.4));
                    var rightActive = state.animState === 'DRIBBLE_RIGHT' || state.animState === 'CROSSOVER' && Math.sin(p * 0.9) > 0;
                    this.bodyGroup.rotation.z = -0.14;
                    this.leftLegPivot.rotation.z = stride1;
                    this.rightLegPivot.rotation.z = -stride1;
                    if (rightActive) {
                        this.rightArmPivot.rotation.z = 0.55 + bounce * 0.35;
                        this.rightForearmPivot.rotation.z = 0.65 - bounce * 0.45;
                        this.leftArmPivot.rotation.z = 0.35;
                        this.leftArmPivot.rotation.x = 0.35; // protect arm
                    } else {
                        this.leftArmPivot.rotation.z = 0.55 + bounce * 0.35;
                        this.leftForearmPivot.rotation.z = 0.65 - bounce * 0.45;
                        this.rightArmPivot.rotation.z = 0.35;
                        this.rightArmPivot.rotation.x = -0.35;
                    }
                    break;
                }
            case 'QUICK_PROTECT':
                {
                    this.bodyGroup.rotation.z = -0.22;
                    this.leftLegPivot.rotation.z = 0.35;
                    this.rightLegPivot.rotation.z = -0.35;
                    this.leftArmPivot.rotation.set(0.55, 0, 0.85);
                    this.rightArmPivot.rotation.set(-0.25, 0, 0.65);
                    this.rightForearmPivot.rotation.z = 1.0;
                    break;
                }
            case 'STEPBACK':
                {
                    this.bodyGroup.rotation.z = 0.18;
                    this.leftLegPivot.rotation.z = -0.5;
                    this.rightLegPivot.rotation.z = 0.45;
                    this.rightArmPivot.rotation.z = 1.65;
                    this.leftArmPivot.rotation.z = 1.2;
                    break;
                }
            case 'JUMPSHOT':
            case 'FLOATER':
                {
                    var raise = Math.min(1, sp * 1.35);
                    var flick = sp > 0.72 ? (sp - 0.72) / 0.28 : 0;
                    this.bodyGroup.rotation.z = 0.08 * raise;
                    this.rightArmPivot.rotation.z = 0.4 + raise * 2.15;
                    this.rightForearmPivot.rotation.z = 0.9 - flick * 0.65;
                    this.leftArmPivot.rotation.z = 0.3 + raise * 1.75;
                    this.leftForearmPivot.rotation.z = 0.85;
                    this.leftLegPivot.rotation.z = -0.18 * raise;
                    this.rightLegPivot.rotation.z = 0.14 * raise;
                    break;
                }
            case 'LAYUP':
            case 'EURO_STEP':
                {
                    var sideTilt = state.animState === 'EURO_STEP' ? Math.sin(p * 1.6) * 0.28 : 0.1;
                    this.bodyGroup.rotation.x = sideTilt;
                    this.rightArmPivot.rotation.z = 2.55;
                    this.rightForearmPivot.rotation.z = 0.25;
                    this.leftArmPivot.rotation.z = 0.65;
                    this.rightLegPivot.rotation.z = 0.65;
                    this.rightShinPivot.rotation.z = -0.8;
                    break;
                }
            case 'DUNK':
                {
                    this.bodyGroup.rotation.z = -0.24;
                    this.rightArmPivot.rotation.z = 2.85;
                    this.leftArmPivot.rotation.z = 2.45;
                    this.rightForearmPivot.rotation.z = 0.2;
                    this.leftForearmPivot.rotation.z = 0.3;
                    this.leftLegPivot.rotation.z = -0.55;
                    this.rightLegPivot.rotation.z = 0.48;
                    this.leftShinPivot.rotation.z = -0.75;
                    break;
                }
            case 'RIM_HANG':
                {
                    this.bodyGroup.rotation.z = 0.15;
                    this.rightArmPivot.rotation.z = 3.05;
                    this.leftArmPivot.rotation.z = 3.05;
                    this.leftLegPivot.rotation.z = 0.52;
                    this.rightLegPivot.rotation.z = 0.42;
                    this.leftShinPivot.rotation.z = -0.9;
                    this.rightShinPivot.rotation.z = -0.85;
                    break;
                }
            case 'DEFENSIVE_SLIDE':
                {
                    var sw = Math.sin(p) * 0.25;
                    this.bodyGroup.rotation.z = -0.24;
                    this.leftLegPivot.rotation.x = 0.32 + sw;
                    this.rightLegPivot.rotation.x = -0.32 - sw;
                    this.leftArmPivot.rotation.set(0.95, 0, 0.55);
                    this.rightArmPivot.rotation.set(-0.95, 0, 0.55);
                    break;
                }
            case 'HANDS_UP_CONTEST':
            case 'JUMP_BLOCK':
            case 'REBOUND_SNAG':
                {
                    this.rightArmPivot.rotation.z = 2.85;
                    this.leftArmPivot.rotation.z = state.animState === 'HANDS_UP_CONTEST' ? 2.55 : 2.85;
                    this.leftLegPivot.rotation.z = -0.2;
                    this.rightLegPivot.rotation.z = 0.2;
                    break;
                }
            case 'ANKLE_BROKEN_STUMBLE':
                {
                    var wob = Math.sin(p * 2.4);
                    this.bodyGroup.rotation.z = 0.42 + wob * 0.16;
                    this.bodyGroup.rotation.x = wob * 0.32;
                    this.leftArmPivot.rotation.set(0.8, 0, 1.4);
                    this.rightArmPivot.rotation.set(-0.8, 0, 1.4);
                    this.leftLegPivot.rotation.z = -0.5;
                    this.rightLegPivot.rotation.z = 0.55;
                    break;
                }
            case 'CELEBRATE':
                {
                    var pump = Math.abs(Math.sin(p * 2.2));
                    this.rightArmPivot.rotation.z = 2.1 + pump * 0.7;
                    this.leftArmPivot.rotation.z = 2.1 + pump * 0.7;
                    this.rightArmPivot.rotation.x = -0.45;
                    this.leftArmPivot.rotation.x = 0.45;
                    break;
                }
            case 'IDLE':
            default:
                {
                    var breathe = Math.sin(p * 0.8) * 0.04;
                    this.leftArmPivot.rotation.z = 0.2 + breathe;
                    this.rightArmPivot.rotation.z = 0.2 + breathe;
                    break;
                }
        }
    };
    _proto.getHandWorldPos = function getHandWorldPos(hand, out) {
        this.root.updateMatrixWorld(true);
        var tip = hand === 'left' ? this.leftHandTip : this.rightHandTip;
        tip.getWorldPosition(_tmpVec);
        return out.copy(_tmpVec);
    };
    _proto.dispose = function dispose() {
        this.ownedGeos.forEach(function(g) {
            return g.dispose();
        });
        this.ownedMats.forEach(function(m) {
            return m.dispose();
        });
    };
    return PlayerMesh3D;
}();

});
// === MODULE: src/games/hoops-2k26/engine/SimTacticsAndReplay ===
ArcadeMod.define("src/games/hoops-2k26/engine/SimTacticsAndReplay", function(require, module, exports) {
// ============================================================================
// PART 5 — TEAMMATE GRADE, PICK & ROLL, LINEUP PRESETS, SPLASHES & REPLAY BUFFER
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
    get InstantReplayBuffer () {
        return InstantReplayBuffer;
    },
    get computeScreenPosition () {
        return computeScreenPosition;
    },
    get createDefaultReplayOrbit () {
        return createDefaultReplayOrbit;
    },
    get createEmptyProjectedAnchors () {
        return createEmptyProjectedAnchors;
    },
    get createIdlePickAndRoll () {
        return createIdlePickAndRoll;
    },
    get createInitialTeammateGrade () {
        return createInitialTeammateGrade;
    },
    get getGradeColor () {
        return getGradeColor;
    },
    get recordTeammateGradeEvent () {
        return recordTeammateGradeEvent;
    },
    get scoreToGradeLetter () {
        return scoreToGradeLetter;
    },
    get selectLineupProfiles () {
        return selectLineupProfiles;
    },
    get tickTeammateGradeEvents () {
        return tickTeammateGradeEvents;
    }
});
function createEmptyProjectedAnchors() {
    return {
        width: 960,
        height: 540,
        players: {},
        ball: {
            x: 480,
            y: 270,
            visible: false
        }
    };
}
// ============================================================================
// TEAMMATE GRADE ENGINE (F -> A+)
// ============================================================================
var GRADE_THRESHOLDS = [
    {
        min: 95,
        letter: 'A+'
    },
    {
        min: 89,
        letter: 'A'
    },
    {
        min: 83,
        letter: 'A-'
    },
    {
        min: 76,
        letter: 'B+'
    },
    {
        min: 69,
        letter: 'B'
    },
    {
        min: 62,
        letter: 'B-'
    },
    {
        min: 55,
        letter: 'C+'
    },
    {
        min: 48,
        letter: 'C'
    },
    {
        min: 41,
        letter: 'C-'
    },
    {
        min: 34,
        letter: 'D+'
    },
    {
        min: 26,
        letter: 'D'
    },
    {
        min: 16,
        letter: 'D-'
    },
    {
        min: 0,
        letter: 'F'
    }
];
function scoreToGradeLetter(score) {
    var clamped = Math.max(0, Math.min(100, score));
    for(var i = 0; i < GRADE_THRESHOLDS.length; i++){
        if (clamped >= GRADE_THRESHOLDS[i].min) {
            return GRADE_THRESHOLDS[i].letter;
        }
    }
    return 'F';
}
function getGradeColor(letter) {
    if (letter.startsWith('A')) return '#fbbf24';
    if (letter.startsWith('B')) return '#22c55e';
    if (letter.startsWith('C')) return '#38bdf8';
    if (letter.startsWith('D')) return '#f97316';
    return '#ef4444';
}
function createInitialTeammateGrade() {
    return {
        score: 50,
        letter: 'C',
        events: [],
        seq: 0
    };
}
function recordTeammateGradeEvent(grade, label, delta) {
    grade.score = Math.max(0, Math.min(100, grade.score + delta));
    grade.letter = scoreToGradeLetter(grade.score);
    grade.seq += 1;
    var ev = {
        id: grade.seq,
        label: label,
        delta: delta,
        positive: delta >= 0,
        ttlSec: 3.8
    };
    grade.events = [].concat([
        ev
    ], grade.events).slice(0, 3);
}
function tickTeammateGradeEvents(grade, dt) {
    for(var i = grade.events.length - 1; i >= 0; i--){
        grade.events[i].ttlSec -= dt;
        if (grade.events[i].ttlSec <= 0) {
            grade.events.splice(i, 1);
        }
    }
}
function createIdlePickAndRoll() {
    return {
        active: false,
        screenerId: null,
        screenerName: '',
        handlerId: null,
        angleDeg: 45,
        action: 'ROLL',
        screenX: 0,
        screenZ: 0,
        elapsedSec: 0,
        screenSet: false,
        screenAssistWindowSec: 0
    };
}
function computeScreenPosition(handlerX, handlerZ, attackDirX, angleDeg) {
    // 45° sets a wing-side angled hip screen; 180° flips to the opposite shoulder!
    var sideSign = handlerZ >= 0 ? -1 : 1;
    var flippedSide = angleDeg === 180 ? -sideSign : sideSign;
    var xOffset = attackDirX * 1.15;
    var zOffset = flippedSide * 1.18;
    return {
        x: Math.max(-12.2, Math.min(12.2, handlerX + xOffset)),
        z: Math.max(-6.2, Math.min(6.2, handlerZ + zOffset))
    };
}
function selectLineupProfiles(roster, preset, count) {
    var safeCount = Math.max(1, Math.min(5, count));
    if (roster.length <= safeCount || preset === 'STARTERS') {
        return roster.slice(0, safeCount);
    }
    var scored = roster.map(function(p, idx) {
        var score = p.ovr;
        if (preset === 'SHOOTERS') {
            score = p.attributes.threePt * 1.45 + p.attributes.midRange * 0.55 + p.ovr * 0.2;
        } else if (preset === 'TALL') {
            score = p.heightInches * 2.1 + p.attributes.defReb * 0.55 + p.attributes.block * 0.45;
        } else if (preset === 'DEFENSIVE') {
            score = p.attributes.perimeterDef * 0.7 + p.attributes.interiorDef * 0.7 + p.attributes.steal * 0.45 + p.attributes.block * 0.45;
        }
        return {
            p: p,
            score: score,
            idx: idx
        };
    });
    scored.sort(function(a, b) {
        return b.score - a.score || a.idx - b.idx;
    });
    return scored.slice(0, safeCount).map(function(item) {
        return item.p;
    });
}
function createDefaultReplayOrbit() {
    return {
        active: false,
        azimuth: 0.72,
        polar: 0.92,
        distance: 9.5,
        focusMode: 'BALL'
    };
}
var InstantReplayBuffer = /*#__PURE__*/ function() {
    "use strict";
    function InstantReplayBuffer(maxFrames) {
        if (maxFrames === void 0) maxFrames = 600;
        this.frames = [];
        this.sampleAccum = 0;
        this.maxFrames = maxFrames;
    }
    var _proto = InstantReplayBuffer.prototype;
    _proto.clear = function clear() {
        this.frames = [];
        this.sampleAccum = 0;
    };
    _proto.record = function record(state, simTimeSec, dt) {
        this.sampleAccum += dt;
        if (this.sampleAccum < 1 / 60 && this.frames.length > 0) return;
        this.sampleAccum = 0;
        var frame = {
            simTimeSec: simTimeSec,
            ballX: state.ball.x,
            ballY: state.ball.y,
            ballZ: state.ball.z,
            ballInFlight: state.ball.inFlight,
            holderPlayerId: state.ball.holderPlayerId,
            players: state.players.map(function(pl) {
                return {
                    id: pl.id,
                    x: pl.x,
                    y: pl.y,
                    z: pl.z,
                    facingRad: pl.facingRad,
                    animState: pl.animState,
                    animPhase: pl.animPhase,
                    shotProgress: pl.shotProgress,
                    hasBall: pl.hasBall
                };
            })
        };
        this.frames.push(frame);
        if (this.frames.length > this.maxFrames) {
            this.frames.shift();
        }
    };
    _proto.getFrameCount = function getFrameCount() {
        return this.frames.length;
    };
    _proto.getFrame = function getFrame(index) {
        if (this.frames.length === 0) return null;
        var clamped = Math.max(0, Math.min(this.frames.length - 1, Math.floor(index)));
        return this.frames[clamped];
    };
    _proto.applyFrame = function applyFrame(index, target) {
        var _loop = function(i) {
            var snap = frame.players[i];
            var pl = target.players.find(function(p) {
                return p.id === snap.id;
            });
            if (pl) {
                pl.x = snap.x;
                pl.y = snap.y;
                pl.z = snap.z;
                pl.facingRad = snap.facingRad;
                pl.animState = snap.animState;
                pl.animPhase = snap.animPhase;
                pl.shotProgress = snap.shotProgress;
                pl.hasBall = snap.hasBall;
            }
        };
        var frame = this.getFrame(index);
        if (!frame) return false;
        target.ball.x = frame.ballX;
        target.ball.y = frame.ballY;
        target.ball.z = frame.ballZ;
        target.ball.inFlight = frame.ballInFlight;
        target.ball.holderPlayerId = frame.holderPlayerId;
        for(var i = 0; i < frame.players.length; i++)_loop(i);
        return true;
    };
    return InstantReplayBuffer;
}();

});
// === MODULE: src/games/hoops-2k26/engine/courtTypes ===
ArcadeMod.define("src/games/hoops-2k26/engine/courtTypes", function(require, module, exports) {
// ============================================================================
// PART 3 — 60 FPS THREE.JS 3D BASKETBALL ENGINE TYPES, PROPORTIONS & 7 CAMERAS
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
    get CAMERA_ANGLE_OPTIONS () {
        return CAMERA_ANGLE_OPTIONS;
    },
    get CAMERA_ORDER () {
        return CAMERA_ORDER;
    },
    get COURT_DIMS () {
        return COURT_DIMS;
    },
    get computePlayerProportions () {
        return computePlayerProportions;
    },
    get getActiveRingColorHex () {
        return getActiveRingColorHex;
    },
    get getVenueDisplayLabel () {
        return getVenueDisplayLabel;
    },
    get hotZoneColorHex () {
        return hotZoneColorHex;
    },
    get isOutdoorVenue () {
        return isOutdoorVenue;
    },
    get isStreetAsphaltVenue () {
        return isStreetAsphaltVenue;
    },
    get solveCameraTarget () {
        return solveCameraTarget;
    }
});
var COURT_DIMS = {
    LENGTH: 28.6,
    HALF_LENGTH: 14.3,
    WIDTH: 15.2,
    HALF_WIDTH: 7.6,
    RIM_Y: 3.05,
    RIM_X: 12.7,
    RIM_RADIUS: 0.23,
    BACKBOARD_X: 13.08,
    BACKBOARD_Y: 3.35,
    BACKBOARD_W: 1.83,
    BACKBOARD_H: 1.07,
    THREE_PT_RADIUS: 7.24,
    CORNER_THREE_Z: 6.71,
    KEY_LENGTH: 5.79,
    KEY_HALF_WIDTH: 2.44,
    FREE_THROW_X: 8.51,
    CENTER_CIRCLE_R: 1.83,
    BALL_RADIUS: 0.121
};
var CAMERA_ANGLE_OPTIONS = [
    {
        id: '2K',
        label: '2K Camera',
        shortLabel: '2K',
        description: 'Behind-offense vertical broadcast angle with smooth Auto-Flip'
    },
    {
        id: '2K_LOW',
        label: '2K Low',
        shortLabel: '2K LOW',
        description: 'Lower court-level behind-the-back vertical perspective'
    },
    {
        id: 'BROADCAST',
        label: 'Broadcast TV',
        shortLabel: 'BROADCAST',
        description: 'Authentic TV sideline camera panning smoothly with the ball'
    },
    {
        id: 'DRIVE',
        label: 'Drive Cam',
        shortLabel: 'DRIVE',
        description: 'Tight action-cam close behind the active ball-handler'
    },
    {
        id: 'PLAYER_LOCK',
        label: 'Player Lock',
        shortLabel: 'LOCK',
        description: 'Follows your controlled MyPLAYER smoothly across the floor'
    },
    {
        id: 'HIGH',
        label: 'High Tactical',
        shortLabel: 'HIGH',
        description: 'Elevated wide coach view showing all 10 players & PlayVision'
    },
    {
        id: 'NOSEBLEEDS',
        label: 'Nosebleeds',
        shortLabel: 'NOSEBLEED',
        description: 'Full-court upper-bowl arena overview with Jumbotron & crowd'
    }
];
var CAMERA_ORDER = CAMERA_ANGLE_OPTIONS.map(function(c) {
    return c.id;
});
function computePlayerProportions(heightInches, weightLbs, wingspanInches) {
    var safeH = Math.max(66, Math.min(92, Number(heightInches) || 78));
    var safeW = Math.max(140, Math.min(340, Number(weightLbs) || 215));
    var safeWing = Math.max(safeH - 2, Math.min(safeH + 12, Number(wingspanInches) || safeH + 3));
    var totalHeightM = safeH * 0.0254;
    var heightScale = totalHeightM / 1.9812; // 78" baseline
    var bmiRatio = safeW / Math.max(150, safeH * 2.75);
    var widthScale = Math.max(0.8, Math.min(1.36, 0.72 + bmiRatio * 0.3));
    var armScale = Math.max(0.86, Math.min(1.24, safeWing / 81));
    return {
        totalHeightM: totalHeightM,
        heightScale: heightScale,
        widthScale: widthScale,
        armScale: armScale,
        shoulderWidth: 0.44 * widthScale,
        torsoHeight: 0.56 * heightScale,
        legLength: 0.92 * heightScale
    };
}
function solveCameraTarget(cfg, ballX, ballY, ballZ, focusPlayerX, focusPlayerZ, attackDirX) {
    var zoomNorm = Math.max(1, Math.min(10, cfg.zoom || 5));
    var heightNorm = Math.max(1, Math.min(10, cfg.height || 6));
    // Zoom 1 (widest) -> 1.24x distance, Zoom 10 (tightest) -> 0.72x distance
    var distFactor = 1.28 - zoomNorm * 0.056;
    // Height 1 (low) -> -1.8m, Height 10 (tall) -> +2.8m
    var heightOffset = (heightNorm - 5) * 0.48;
    // Direction the behind-offense camera looks toward (+1 = right hoop, -1 = left hoop)
    var dir = cfg.autoFlip ? attackDirX : 1;
    if (cfg.reverseAngle) {
        dir = dir === 1 ? -1 : 1;
    }
    // Key Zoom subtly tightens FOV & pulls in when ball enters painted lane
    var distToHoop = Math.min(Math.hypot(ballX - COURT_DIMS.RIM_X, ballZ), Math.hypot(ballX + COURT_DIMS.RIM_X, ballZ));
    var inKeyZone = cfg.keyZoom && distToHoop < 6.4;
    var keyZoomMul = inKeyZone ? 0.87 : 1.0;
    var clampedBallX = Math.max(-13.2, Math.min(13.2, ballX));
    var clampedBallZ = Math.max(-6.8, Math.min(6.8, ballZ));
    switch(cfg.angle){
        case '2K':
            {
                var behind = 11.4 * distFactor * keyZoomMul;
                var camX = Math.max(-19.5, Math.min(19.5, clampedBallX - dir * behind));
                var camY = Math.max(3.8, (8.4 + heightOffset) * keyZoomMul);
                var camZ = clampedBallZ * 0.48;
                var lookX = clampedBallX + dir * 5.2;
                return {
                    posX: camX,
                    posY: camY,
                    posZ: camZ,
                    lookX: Math.max(-13.5, Math.min(13.5, lookX)),
                    lookY: 1.35 + Math.min(1.1, ballY * 0.22),
                    lookZ: clampedBallZ * 0.36,
                    fov: inKeyZone ? 44 : 48
                };
            }
        case '2K_LOW':
            {
                var behind1 = 9.4 * distFactor * keyZoomMul;
                var camX1 = Math.max(-18.5, Math.min(18.5, clampedBallX - dir * behind1));
                var camY1 = Math.max(2.6, (5.2 + heightOffset * 0.72) * keyZoomMul);
                var camZ1 = clampedBallZ * 0.56;
                var lookX1 = clampedBallX + dir * 6.0;
                return {
                    posX: camX1,
                    posY: camY1,
                    posZ: camZ1,
                    lookX: Math.max(-13.5, Math.min(13.5, lookX1)),
                    lookY: 1.65 + Math.min(1.0, ballY * 0.22),
                    lookZ: clampedBallZ * 0.42,
                    fov: inKeyZone ? 46 : 51
                };
            }
        case 'BROADCAST':
            {
                var sideSign = cfg.reverseAngle ? -1 : 1;
                var zDist = 17.8 * distFactor * keyZoomMul;
                var camX2 = clampedBallX * 0.74;
                var camY2 = Math.max(4.6, 8.8 + heightOffset);
                return {
                    posX: camX2,
                    posY: camY2,
                    posZ: sideSign * zDist,
                    lookX: clampedBallX * 0.88,
                    lookY: 1.5 + Math.min(0.9, ballY * 0.18),
                    lookZ: clampedBallZ * 0.28,
                    fov: inKeyZone ? 39 : 43
                };
            }
        case 'DRIVE':
            {
                var behind2 = 6.2 * distFactor * keyZoomMul;
                var camX3 = Math.max(-17.2, Math.min(17.2, clampedBallX - dir * behind2));
                var camY3 = Math.max(2.2, 3.6 + heightOffset * 0.55);
                var camZ2 = clampedBallZ * 0.76;
                return {
                    posX: camX3,
                    posY: camY3,
                    posZ: camZ2,
                    lookX: Math.max(-13.4, Math.min(13.4, clampedBallX + dir * 7.2)),
                    lookY: 1.9 + Math.min(0.9, ballY * 0.2),
                    lookZ: clampedBallZ * 0.5,
                    fov: 54
                };
            }
        case 'PLAYER_LOCK':
            {
                var behind3 = 7.6 * distFactor;
                var camX4 = Math.max(-18.2, Math.min(18.2, focusPlayerX - dir * behind3));
                var camY4 = Math.max(2.6, 4.4 + heightOffset * 0.6);
                var camZ3 = focusPlayerZ * 0.84;
                return {
                    posX: camX4,
                    posY: camY4,
                    posZ: camZ3,
                    lookX: focusPlayerX * 0.5 + clampedBallX * 0.5 + dir * 2.8,
                    lookY: 1.65,
                    lookZ: focusPlayerZ * 0.55 + clampedBallZ * 0.45,
                    fov: 50
                };
            }
        case 'HIGH':
            {
                var behind4 = 15.8 * distFactor;
                var camX5 = Math.max(-22.0, Math.min(22.0, clampedBallX * 0.65 - dir * behind4));
                var camY5 = Math.max(9.5, 14.2 + heightOffset * 1.15);
                var camZ4 = clampedBallZ * 0.25;
                return {
                    posX: camX5,
                    posY: camY5,
                    posZ: camZ4,
                    lookX: clampedBallX * 0.55 + dir * 3.5,
                    lookY: 0.9,
                    lookZ: 0,
                    fov: 46
                };
            }
        case 'NOSEBLEEDS':
        default:
            {
                var sideSign1 = cfg.reverseAngle ? -1 : 1;
                var zDist1 = 25.5 * distFactor;
                return {
                    posX: clampedBallX * 0.32,
                    posY: Math.max(13.0, 18.8 + heightOffset * 1.25),
                    posZ: sideSign1 * zDist1,
                    lookX: clampedBallX * 0.35,
                    lookY: 1.2,
                    lookZ: 0,
                    fov: 44
                };
            }
    }
}
function isOutdoorVenue(venue) {
    return venue === 'SKYLINE_PARK' || venue === 'RIVET_CITY' || venue === 'SUNSET_BEACH' || venue === 'OLD_TOWN' || venue === 'BLACKTOP_CAGE' || venue === 'STREET_KINGS';
}
function isStreetAsphaltVenue(venue) {
    return venue === 'SKYLINE_PARK' || venue === 'RIVET_CITY' || venue === 'SUNSET_BEACH' || venue === 'OLD_TOWN' || venue === 'BLACKTOP_CAGE';
}
function getVenueDisplayLabel(venue) {
    switch(venue){
        case 'ARENA_2K26':
            return '2K26 Next-Gen Arena';
        case 'ARENA_2K14':
            return '2K14 Classic Arena';
        case 'SKYLINE_PARK':
            return 'Skyline Park (City)';
        case 'RIVET_CITY':
            return 'Rivet City (2K16)';
        case 'SUNSET_BEACH':
            return 'Sunset Beach (2K16)';
        case 'OLD_TOWN':
            return 'Old Town (2K16)';
        case 'BLACKTOP_CAGE':
            return 'Blacktop Cage (2K14)';
        case 'STREET_KINGS':
            return 'Street Kings Coliseum';
        case 'EUROLEAGUE_PALACE':
            return 'EuroLeague Palace';
        case 'WNBA_ARENA':
            return 'The W Arena';
        default:
            return '2K26 Next-Gen Arena';
    }
}
function hotZoneColorHex(state) {
    if (state === 1) return 0xef4444;
    if (state === -1) return 0x38bdf8;
    return 0x94a3b8;
}
function getActiveRingColorHex(era) {
    return era === '2K14_CLASSIC' ? 0xe11d48 : 0x22d3ee;
}

});
// === MODULE: src/games/hoops-2k26/hoopsBeatsAudio ===
ArcadeMod.define("src/games/hoops-2k26/hoopsBeatsAudio", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HoopsBeats", {
    enumerable: true,
    get: function() {
        return HoopsBeats;
    }
});
var _hoops2k26Catalog = require("./hoops2k26Catalog");
var HoopsBeatsPlayer = /*#__PURE__*/ function() {
    "use strict";
    function HoopsBeatsPlayer() {
        this.ctx = null;
        this.timerId = null;
        this.step = 0;
        this.playing = false;
        this.trackIdx = 0;
        this.mutedTrackIds = new Set();
        this.volume = 0.22;
        this.listeners = new Set();
    }
    var _proto = HoopsBeatsPlayer.prototype;
    _proto.getCurrentTrack = function getCurrentTrack() {
        var _HOOPS_2K_BEATS_this_trackIdx;
        return (_HOOPS_2K_BEATS_this_trackIdx = _hoops2k26Catalog.HOOPS_2K_BEATS[this.trackIdx]) != null ? _HOOPS_2K_BEATS_this_trackIdx : _hoops2k26Catalog.HOOPS_2K_BEATS[0];
    };
    _proto.getState = function getState() {
        return {
            isPlaying: this.playing,
            trackIndex: this.trackIdx,
            currentTrack: this.getCurrentTrack(),
            volume: this.volume
        };
    };
    _proto.isPlaying = function isPlaying() {
        return this.playing;
    };
    _proto.getVolume = function getVolume() {
        return this.volume;
    };
    _proto.setVolume = function setVolume(v) {
        this.volume = Math.max(0, Math.min(0.5, v));
    };
    _proto.isTrackMuted = function isTrackMuted(id) {
        return this.mutedTrackIds.has(id);
    };
    _proto.toggleTrackEnabled = function toggleTrackEnabled(id) {
        if (this.mutedTrackIds.has(id)) {
            this.mutedTrackIds.delete(id);
        } else if (this.mutedTrackIds.size < _hoops2k26Catalog.HOOPS_2K_BEATS.length - 1) {
            this.mutedTrackIds.add(id);
            if (this.getCurrentTrack().id === id) {
                this.nextTrack();
            }
        }
        this.emit();
    };
    _proto.subscribe = function subscribe(fn) {
        var _this = this;
        this.listeners.add(fn);
        return function() {
            return _this.listeners.delete(fn);
        };
    };
    _proto.emit = function emit() {
        var st = this.getState();
        this.listeners.forEach(function(fn) {
            return fn(st);
        });
    };
    _proto.ensureContext = function ensureContext() {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            var Ctor = window.AudioContext || window.webkitAudioContext;
            if (Ctor) {
                try {
                    this.ctx = new Ctor();
                } catch (unused) {
                    return null;
                }
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(function() {});
        }
        return this.ctx;
    };
    _proto.play = function play() {
        if (this.playing) return;
        this.ensureContext();
        this.playing = true;
        this.startLoop();
        this.emit();
    };
    _proto.stop = function stop() {
        this.playing = false;
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
        this.emit();
    };
    _proto.toggle = function toggle() {
        if (this.playing) this.stop();
        else this.play();
    };
    _proto.selectTrack = function selectTrack(index) {
        var len = _hoops2k26Catalog.HOOPS_2K_BEATS.length;
        this.trackIdx = (index % len + len) % len;
        this.step = 0;
        if (this.playing) {
            this.startLoop();
        }
        this.emit();
    };
    _proto.nextTrack = function nextTrack() {
        var len = _hoops2k26Catalog.HOOPS_2K_BEATS.length;
        for(var i = 1; i <= len; i++){
            var cand = (this.trackIdx + i) % len;
            if (!this.mutedTrackIds.has(_hoops2k26Catalog.HOOPS_2K_BEATS[cand].id)) {
                this.selectTrack(cand);
                return;
            }
        }
    };
    _proto.startLoop = function startLoop() {
        var _this = this;
        if (this.timerId !== null) {
            window.clearInterval(this.timerId);
            this.timerId = null;
        }
        if (typeof window === 'undefined') return;
        var track = this.getCurrentTrack();
        var stepMs = Math.max(90, Math.round(60 / track.bpm / 2 * 1000));
        this.timerId = window.setInterval(function() {
            return _this.triggerStep(track);
        }, stepMs);
    };
    _proto.midiToHz = function midiToHz(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    };
    _proto.triggerStep = function triggerStep(track) {
        if (!this.playing || this.volume <= 0.005) return;
        var ctx = this.ctx;
        if (!ctx || ctx.state !== 'running') return;
        var now = ctx.currentTime;
        var s = this.step % 16;
        this.step++;
        // Kick on 0, 6, 8, 14
        if (s === 0 || s === 6 || s === 8 || s === 14) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(118, now);
            osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
            gain.gain.setValueAtTime(this.volume * 0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        }
        // Crisp rim/snare on 4 and 12
        if (s === 4 || s === 12) {
            var osc1 = ctx.createOscillator();
            var gain1 = ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(280, now);
            osc1.frequency.exponentialRampToValueAtTime(110, now + 0.07);
            gain1.gain.setValueAtTime(this.volume * 0.45, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.1);
        }
        // Melodic bass/chord stab
        var scale = [
            0,
            3,
            5,
            7,
            10,
            12
        ];
        if (s % 2 === 0) {
            var noteOffset = scale[(s / 2 + track.rootMidi % 3) % scale.length];
            var osc2 = ctx.createOscillator();
            var gain2 = ctx.createGain();
            osc2.type = s % 4 === 0 ? 'sawtooth' : 'triangle';
            osc2.frequency.setValueAtTime(this.midiToHz(track.rootMidi + noteOffset), now);
            gain2.gain.setValueAtTime(this.volume * 0.24, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now);
            osc2.stop(now + 0.24);
        }
    };
    return HoopsBeatsPlayer;
}();
var HoopsBeats = new HoopsBeatsPlayer();

});
// === MODULE: src/games/hoops-2k26/hybrid/audioEngine ===
ArcadeMod.define("src/games/hoops-2k26/hybrid/audioEngine", function(require, module, exports) {
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
    get HYBRID_2K_BEATS_TRACKS () {
        return HYBRID_2K_BEATS_TRACKS;
    },
    get HybridAudioEngine () {
        return HybridAudioEngine;
    }
});
var HYBRID_2K_BEATS_TRACKS = [
    {
        id: 'crown_2014',
        title: 'Crown of 2014',
        artist: '2K14 Hardwood Collective',
        eraTag: '2K14',
        bpm: 92,
        keyNote: 45,
        style: 'boombap',
        durationLabel: '3:14'
    },
    {
        id: 'kings_hardwood',
        title: "King's Hardwood",
        artist: 'Miami Spotlight Brass',
        eraTag: '2K14',
        bpm: 96,
        keyNote: 48,
        style: 'anthem',
        durationLabel: '3:28'
    },
    {
        id: 'skyline_2k26',
        title: 'Skyline 2K26',
        artist: 'The City Synth Lab',
        eraTag: '2K26',
        bpm: 128,
        keyNote: 50,
        style: 'trap',
        durationLabel: '2:56'
    },
    {
        id: 'neon_crossover',
        title: 'Neon Crossover',
        artist: 'Sunset Park Electro',
        eraTag: '2K26',
        bpm: 118,
        keyNote: 52,
        style: 'electrofunk',
        durationLabel: '3:08'
    },
    {
        id: 'chinatown_bounce',
        title: 'Chinatown Bounce',
        artist: 'Blacktop Percussion',
        eraTag: 'HYBRID',
        bpm: 104,
        keyNote: 47,
        style: 'streetball',
        durationLabel: '2:49'
    },
    {
        id: 'clutch_symphony',
        title: 'Clutch Time Symphony',
        artist: '4th Quarter Orchestra',
        eraTag: 'HYBRID',
        bpm: 112,
        keyNote: 43,
        style: 'clutch',
        durationLabel: '3:36'
    }
];
function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}
var HybridAudioEngineImpl = /*#__PURE__*/ function() {
    "use strict";
    function HybridAudioEngineImpl() {
        this.ctx = null;
        this.noiseBuffer = null;
        this.masterVol = 0.82;
        this.musicVol = 0.65;
        this.sfxVol = 0.88;
        this.crowdVol = 0.76;
        this.commentaryVol = 0.8;
        this.paEnabled = true;
        this.isPlaying = false;
        this.trackIndex = 0;
        this.shuffle = false;
        this.step = 0;
        this.timerId = null;
        this.enabledTrackIds = HYBRID_2K_BEATS_TRACKS.map(function(t) {
            return t.id;
        });
        this.listeners = new Set();
    }
    var _proto = HybridAudioEngineImpl.prototype;
    _proto.ensureContext = function ensureContext() {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            var Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) return null;
            try {
                this.ctx = new Ctor();
            } catch (unused) {
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(function() {});
        }
        if (!this.noiseBuffer && this.ctx) {
            var len = Math.floor(this.ctx.sampleRate * 1.2);
            var buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            var data = buf.getChannelData(0);
            for(var i = 0; i < len; i++){
                data[i] = Math.random() * 2 - 1;
            }
            this.noiseBuffer = buf;
        }
        return this.ctx;
    };
    _proto.applySettings = function applySettings(audio) {
        this.masterVol = Math.max(0, Math.min(1, audio.masterVolume / 100));
        this.musicVol = Math.max(0, Math.min(1, audio.musicVolume / 100));
        this.sfxVol = Math.max(0, Math.min(1, audio.sfxVolume / 100));
        this.crowdVol = Math.max(0, Math.min(1, audio.crowdVolume / 100));
        this.commentaryVol = Math.max(0, Math.min(1, audio.commentaryVolume / 100));
        this.paEnabled = audio.paAnnouncerEnabled;
        this.shuffle = audio.beatsShuffle;
        if (audio.enabledTrackIds.length > 0) {
            this.enabledTrackIds = [].concat(audio.enabledTrackIds);
        }
        this.emit();
    };
    _proto.sfxGain = function sfxGain(scale) {
        if (scale === void 0) scale = 1;
        return this.masterVol * this.sfxVol * scale;
    };
    _proto.musicGain = function musicGain(scale) {
        if (scale === void 0) scale = 1;
        return this.masterVol * this.musicVol * scale;
    };
    // ---------------- UI SFX (2K14 Metallic vs 2K26 Glass) ----------------
    _proto.playUi = function playUi(action, era) {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.18);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var is2K14 = era === '2K14_CLASSIC';
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (is2K14) {
            // Bold metallic clack / click
            osc.type = action === 'confirm' ? 'sawtooth' : 'triangle';
            var baseFreq = action === 'hover' ? 240 : action === 'click' ? 380 : action === 'confirm' ? 520 : action === 'back' ? 210 : 440;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(action === 'back' ? 120 : baseFreq * 1.45, now + (action === 'confirm' ? 0.11 : 0.055));
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + (action === 'confirm' ? 0.13 : 0.065));
            osc.start(now);
            osc.stop(now + 0.14);
        } else {
            // Crisp 2K26 glass chime / whoosh
            osc.type = action === 'switch' ? 'sine' : 'triangle';
            var f1 = action === 'hover' ? 640 : action === 'click' ? 860 : action === 'confirm' ? 980 : action === 'back' ? 460 : 720;
            osc.frequency.setValueAtTime(f1, now);
            osc.frequency.exponentialRampToValueAtTime(action === 'back' ? 310 : f1 * 1.25, now + (action === 'confirm' ? 0.14 : 0.07));
            gain.gain.setValueAtTime(vol * 0.85, now);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + (action === 'confirm' ? 0.16 : 0.08));
            osc.start(now);
            osc.stop(now + 0.17);
        }
    };
    // ---------------- ON-COURT BASKETBALL SFX ----------------
    _proto.playDribble = function playDribble() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.32);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, now);
        osc.frequency.exponentialRampToValueAtTime(52, now + 0.09);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    };
    _proto.playSneakerSqueak = function playSneakerSqueak() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.14);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2450, now);
        osc.frequency.exponentialRampToValueAtTime(3400, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(2100, now + 0.09);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    };
    _proto.playSwish = function playSwish(chainNet) {
        if (chainNet === void 0) chainNet = false;
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.28);
        if (!ctx || !this.noiseBuffer || vol <= 0.001) return;
        var now = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        var filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(chainNet ? 3800 : 2100, now);
        filter.frequency.exponentialRampToValueAtTime(chainNet ? 1600 : 850, now + 0.24);
        filter.Q.value = chainNet ? 4.2 : 1.8;
        var g = ctx.createGain();
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        src.connect(filter);
        filter.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.28);
    };
    _proto.playRimClank = function playRimClank() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.28);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        [
            310,
            485,
            790
        ].forEach(function(freq, idx) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + 0.18);
            g.gain.setValueAtTime(vol / (idx + 1.5), now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        });
    };
    _proto.playBackboardThud = function playBackboardThud() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.3);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
    };
    _proto.playGreenRelease = function playGreenRelease() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.26);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        [
            587.33,
            880,
            1174.66
        ].forEach(function(freq, i) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.045);
            g.gain.setValueAtTime(vol, now + i * 0.045);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.24);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now + i * 0.045);
            osc.stop(now + i * 0.045 + 0.26);
        });
    };
    _proto.playDunkSlam = function playDunkSlam() {
        this.playRimClank();
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.42);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(128, now);
        osc.frequency.exponentialRampToValueAtTime(34, now + 0.25);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    };
    _proto.playWhistle = function playWhistle() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.2);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var lfo = ctx.createOscillator();
        var lfoGain = ctx.createGain();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2850, now);
        lfo.frequency.setValueAtTime(32, now);
        lfoGain.gain.setValueAtTime(95, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(g);
        g.connect(ctx.destination);
        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.38);
        osc.stop(now + 0.38);
    };
    _proto.playBuzzer = function playBuzzer() {
        var ctx = this.ensureContext();
        var vol = this.sfxGain(0.28);
        if (!ctx || vol <= 0.001) return;
        var now = ctx.currentTime;
        [
            138,
            184
        ].forEach(function(freq) {
            var osc = ctx.createOscillator();
            var g = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            g.gain.setValueAtTime(vol * 0.65, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.75);
        });
    };
    _proto.playCrowdRoar = function playCrowdRoar(intensity) {
        if (intensity === void 0) intensity = 0.8;
        var ctx = this.ensureContext();
        var vol = this.masterVol * this.crowdVol * 0.22 * Math.max(0.2, Math.min(1, intensity));
        if (!ctx || !this.noiseBuffer || vol <= 0.001) return;
        var now = ctx.currentTime;
        var src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        var lp = ctx.createBiquadFilter();
        lp.type = 'bandpass';
        lp.frequency.setValueAtTime(740, now);
        lp.Q.value = 0.9;
        var g = ctx.createGain();
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(vol, now + 0.16);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
        src.connect(lp);
        lp.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 1.1);
    };
    _proto.announce = function announce(line) {
        if (!this.paEnabled || this.masterVol * this.commentaryVol <= 0.02) return;
        try {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            var synth = window.speechSynthesis;
            if (!synth) return;
            synth.cancel();
            var utter = new SpeechSynthesisUtterance(line);
            utter.rate = 1.08;
            utter.pitch = 0.92;
            utter.volume = Math.min(1, this.masterVol * this.commentaryVol);
            synth.speak(utter);
        } catch (unused) {
        // Safe fallback when speech synthesis is unavailable
        }
    };
    // ---------------- 2K BEATS 6-TRACK PROCEDURAL JUKEBOX ----------------
    _proto.getBeatsSnapshot = function getBeatsSnapshot() {
        var _HYBRID_2K_BEATS_TRACKS_this_trackIndex;
        return {
            isPlaying: this.isPlaying,
            currentTrack: (_HYBRID_2K_BEATS_TRACKS_this_trackIndex = HYBRID_2K_BEATS_TRACKS[this.trackIndex]) != null ? _HYBRID_2K_BEATS_TRACKS_this_trackIndex : HYBRID_2K_BEATS_TRACKS[0],
            trackIndex: this.trackIndex,
            shuffle: this.shuffle,
            stepPulse: this.step % 16,
            enabledTrackIds: [].concat(this.enabledTrackIds)
        };
    };
    _proto.subscribe = function subscribe(fn) {
        var _this = this;
        this.listeners.add(fn);
        return function() {
            _this.listeners.delete(fn);
        };
    };
    _proto.emit = function emit() {
        var snap = this.getBeatsSnapshot();
        this.listeners.forEach(function(fn) {
            return fn(snap);
        });
    };
    _proto.scheduleBeatStep = function scheduleBeatStep() {
        var _this = this;
        var _HYBRID_2K_BEATS_TRACKS_this_trackIndex;
        if (!this.isPlaying) return;
        var track = (_HYBRID_2K_BEATS_TRACKS_this_trackIndex = HYBRID_2K_BEATS_TRACKS[this.trackIndex]) != null ? _HYBRID_2K_BEATS_TRACKS_this_trackIndex : HYBRID_2K_BEATS_TRACKS[0];
        var ctx = this.ensureContext();
        var vol = this.musicGain(0.16);
        var s = this.step % 16;
        if (ctx && vol > 0.002) {
            var now = ctx.currentTime;
            var root = track.keyNote;
            // Kick drum pattern
            var kickPattern = track.style === 'trap' ? [
                0,
                3,
                6,
                10,
                14
            ] : track.style === 'boombap' || track.style === 'anthem' ? [
                0,
                7,
                8,
                14
            ] : [
                0,
                4,
                8,
                12
            ];
            if (kickPattern.includes(s)) {
                var osc = ctx.createOscillator();
                var g = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(track.style === 'trap' ? 115 : 135, now);
                osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
                g.gain.setValueAtTime(vol * 1.45, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
                osc.connect(g);
                g.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.18);
            }
            // Snare / Clap on 4 & 12
            if ((s === 4 || s === 12) && this.noiseBuffer) {
                var src = ctx.createBufferSource();
                src.buffer = this.noiseBuffer;
                var hp = ctx.createBiquadFilter();
                hp.type = 'highpass';
                hp.frequency.setValueAtTime(1100, now);
                var g1 = ctx.createGain();
                g1.gain.setValueAtTime(vol * 0.72, now);
                g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                src.connect(hp);
                hp.connect(g1);
                g1.connect(ctx.destination);
                src.start(now);
                src.stop(now + 0.13);
            }
            // Hi-hat groove
            if (s % 2 === 0 && this.noiseBuffer) {
                var src1 = ctx.createBufferSource();
                src1.buffer = this.noiseBuffer;
                var hp1 = ctx.createBiquadFilter();
                hp1.type = 'highpass';
                hp1.frequency.setValueAtTime(6500, now);
                var g2 = ctx.createGain();
                g2.gain.setValueAtTime(vol * 0.22, now);
                g2.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
                src1.connect(hp1);
                hp1.connect(g2);
                g2.connect(ctx.destination);
                src1.start(now);
                src1.stop(now + 0.05);
            }
            // Melodic synth / brass motif
            var scaleOffsets = track.style === 'anthem' || track.style === 'clutch' ? [
                0,
                3,
                7,
                10,
                12,
                7,
                5,
                3
            ] : track.style === 'electrofunk' ? [
                0,
                5,
                7,
                10,
                12,
                10,
                7,
                5
            ] : [
                0,
                0,
                3,
                5,
                7,
                5,
                3,
                -2
            ];
            if (s % 2 === 0) {
                var note = root + 12 + scaleOffsets[s / 2 % scaleOffsets.length];
                var osc1 = ctx.createOscillator();
                var lp = ctx.createBiquadFilter();
                var g3 = ctx.createGain();
                osc1.type = track.style === 'anthem' || track.style === 'boombap' ? 'sawtooth' : track.style === 'clutch' ? 'triangle' : 'square';
                osc1.frequency.setValueAtTime(midiToFreq(note), now);
                lp.type = 'lowpass';
                lp.frequency.setValueAtTime(track.style === 'trap' ? 1600 : 1250, now);
                g3.gain.setValueAtTime(vol * 0.42, now);
                g3.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc1.connect(lp);
                lp.connect(g3);
                g3.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.24);
            }
        }
        this.step = (this.step + 1) % 64;
        this.emit();
        var stepMs = Math.max(95, Math.round(60 / track.bpm / 4 * 1000));
        this.timerId = window.setTimeout(function() {
            return _this.scheduleBeatStep();
        }, stepMs);
    };
    _proto.play = function play() {
        if (this.isPlaying) return;
        this.ensureContext();
        this.isPlaying = true;
        this.emit();
        this.scheduleBeatStep();
    };
    _proto.pause = function pause() {
        this.isPlaying = false;
        if (this.timerId !== null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.emit();
    };
    _proto.togglePlay = function togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
        return this.isPlaying;
    };
    _proto.selectTrack = function selectTrack(trackId, autoPlay) {
        if (autoPlay === void 0) autoPlay = true;
        var idx = HYBRID_2K_BEATS_TRACKS.findIndex(function(t) {
            return t.id === trackId;
        });
        if (idx >= 0) {
            this.trackIndex = idx;
            this.step = 0;
        }
        if (autoPlay && !this.isPlaying) {
            this.play();
        } else {
            this.emit();
        }
        return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
    };
    _proto.nextTrack = function nextTrack() {
        var _this = this;
        var enabled = HYBRID_2K_BEATS_TRACKS.map(function(t, i) {
            return {
                t: t,
                i: i
            };
        }).filter(function(param) {
            var t = param.t;
            return _this.enabledTrackIds.includes(t.id);
        });
        if (enabled.length === 0) return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
        if (this.shuffle && enabled.length > 1) {
            var _choices_Math_floor;
            var choices = enabled.filter(function(e) {
                return e.i !== _this.trackIndex;
            });
            var pick = (_choices_Math_floor = choices[Math.floor(Math.random() * choices.length)]) != null ? _choices_Math_floor : enabled[0];
            this.trackIndex = pick.i;
        } else {
            var curPos = enabled.findIndex(function(e) {
                return e.i === _this.trackIndex;
            });
            this.trackIndex = enabled[(curPos + 1) % enabled.length].i;
        }
        this.step = 0;
        this.emit();
        return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
    };
    _proto.prevTrack = function prevTrack() {
        var _this = this;
        var enabled = HYBRID_2K_BEATS_TRACKS.map(function(t, i) {
            return {
                t: t,
                i: i
            };
        }).filter(function(param) {
            var t = param.t;
            return _this.enabledTrackIds.includes(t.id);
        });
        if (enabled.length === 0) return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
        var curPos = enabled.findIndex(function(e) {
            return e.i === _this.trackIndex;
        });
        var nextPos = (curPos - 1 + enabled.length) % enabled.length;
        this.trackIndex = enabled[nextPos].i;
        this.step = 0;
        this.emit();
        return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
    };
    _proto.toggleShuffle = function toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.emit();
        return this.shuffle;
    };
    _proto.toggleTrackEnabled = function toggleTrackEnabled(trackId) {
        var exists = this.enabledTrackIds.includes(trackId);
        if (exists && this.enabledTrackIds.length <= 1) {
            return [].concat(this.enabledTrackIds); // Keep at least 1 track active
        }
        this.enabledTrackIds = exists ? this.enabledTrackIds.filter(function(id) {
            return id !== trackId;
        }) : [].concat(this.enabledTrackIds, [
            trackId
        ]);
        this.emit();
        return [].concat(this.enabledTrackIds);
    };
    return HybridAudioEngineImpl;
}();
var HybridAudioEngine = new HybridAudioEngineImpl();

});

})(window.ArcadeMod);
