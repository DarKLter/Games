// ============================================================================
// PART 3 — PROCEDURAL HIGH-RES CANVAS TEXTURES (ZERO EXTERNAL ASSETS)
// Generates 2048x1024 Hardwood/Asphalt/Stone court maps, 1024x512 roughness
// maps, dynamic jersey textures (front/back numbers + surname), basketball
// dimpled leather seams, 4-sided Jumbotron canvas, and LED scorer ribbon.
// ============================================================================

import * as THREE from 'three';
import type { JerseyVariant, MatchVenueId } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';
import { COURT_DIMS, isStreetAsphaltVenue } from './courtTypes';

export interface CourtTextureBundle {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  dispose: () => void;
}

function worldXToU(x: number, w: number): number {
  return ((x + COURT_DIMS.HALF_LENGTH) / COURT_DIMS.LENGTH) * w;
}

function worldZToV(z: number, h: number): number {
  return ((z + COURT_DIMS.HALF_WIDTH) / COURT_DIMS.WIDTH) * h;
}

function hexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return 0.35;
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function resolveJerseyPalette(
  team: TeamData,
  variant: JerseyVariant
): { body: string; trim: string; text: string; shorts: string } {
  const p = team.colors.primary || '#1d4ed8';
  const s = team.colors.secondary || '#f59e0b';
  const a = team.colors.accent || '#ffffff';

  if (variant === 'HOME') {
    return { body: '#f8fafc', trim: p, text: p, shorts: '#f1f5f9' };
  }
  if (variant === 'CITY') {
    return { body: '#111827', trim: s, text: s, shorts: '#0f172a' };
  }
  if (variant === 'CLASSIC') {
    const isLight = hexLuminance(s) > 0.62;
    return { body: s, trim: p, text: isLight ? '#111827' : '#ffffff', shorts: s };
  }
  // AWAY
  const darkBody = hexLuminance(p) < 0.58;
  return {
    body: p,
    trim: s,
    text: darkBody ? '#ffffff' : a === p ? '#0f172a' : '#111827',
    shorts: p,
  };
}

/**
 * Generates crisp 2048x1024 procedural court color texture + 1024x512 roughness map.
 * Supports maple hardwood planks (NBA/Euro/WNBA), street asphalt (Skyline/2K16 Parks/Blacktop),
 * and Roman stone coliseum tiles (Street Kings).
 */
export function createCourtTextures(
  homeTeam: TeamData,
  venue: MatchVenueId,
  streakStamp?: string
): CourtTextureBundle {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const primary = homeTeam.colors.primary || '#1d4ed8';
  const secondary = homeTeam.colors.secondary || '#f59e0b';
  const isAsphalt = isStreetAsphaltVenue(venue);
  const isColiseum = venue === 'STREET_KINGS';

  // 1. Base court surface
  if (isAsphalt) {
    const baseHex =
      venue === 'SKYLINE_PARK'
        ? '#2a3346'
        : venue === 'SUNSET_BEACH'
          ? '#1e4e68'
          : venue === 'RIVET_CITY'
            ? '#3b2f2f'
            : venue === 'OLD_TOWN'
              ? '#2e3b38'
              : '#1f232b';
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, W, H);

    // Subtle concrete/asphalt grain speckles
    for (let i = 0; i < 4800; i++) {
      const gx = (i * 1973) % W;
      const gy = (i * 911 + Math.floor(i / 7) * 31) % H;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(gx, gy, 3, 2);
    }

    // Subtle outdoor paint border
    ctx.fillStyle =
      venue === 'SUNSET_BEACH'
        ? 'rgba(249, 115, 22, 0.28)'
        : venue === 'SKYLINE_PARK'
          ? 'rgba(14, 165, 233, 0.22)'
          : 'rgba(225, 29, 72, 0.2)';
    ctx.fillRect(0, 0, W, 56);
    ctx.fillRect(0, H - 56, W, 56);
  } else if (isColiseum) {
    ctx.fillStyle = '#d6c7a9';
    ctx.fillRect(0, 0, W, H);
    // Stone slab grid
    ctx.strokeStyle = 'rgba(87, 73, 52, 0.26)';
    ctx.lineWidth = 3;
    for (let x = 0; x < W; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else {
    // Authentic light-oak / maple hardwood planks
    const plankH = 16;
    const isClassic2K14 = venue === 'ARENA_2K14';
    const isWnba = venue === 'WNBA_ARENA';
    const baseHue = isClassic2K14 ? 33 : isWnba ? 35 : 34;

    for (let row = 0; row < H / plankH; row++) {
      let x = -((row * 73) % 140);
      while (x < W) {
        const len = 130 + ((row * 37 + Math.abs(x) * 13) % 160);
        const shade = ((row * 19 + Math.abs(x) * 7) % 11) - 5;
        const light = (isClassic2K14 ? 61 : 65) + shade * 0.9;
        const sat = isClassic2K14 ? 54 : 46;
        ctx.fillStyle = `hsl(${baseHue}, ${sat}%, ${light}%)`;
        ctx.fillRect(x, row * plankH, len, plankH);

        // Subtle plank seam
        ctx.strokeStyle = 'rgba(92, 58, 28, 0.22)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, row * plankH + 0.5, len - 1, plankH - 1);
        x += len;
      }
    }
  }

  // 2. Painted Keys (Left & Right)
  const keyPxW = (COURT_DIMS.KEY_LENGTH / COURT_DIMS.LENGTH) * W;
  const keyPxH = ((COURT_DIMS.KEY_HALF_WIDTH * 2) / COURT_DIMS.WIDTH) * H;
  const keyTopY = worldZToV(-COURT_DIMS.KEY_HALF_WIDTH, H);

  const keyColor =
    venue === 'WNBA_ARENA'
      ? '#ea580c'
      : venue === 'EUROLEAGUE_PALACE'
        ? '#1e3a8a'
        : isColiseum
          ? '#7c2d12'
          : primary;

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
  const baselineText = (
    venue === 'SKYLINE_PARK'
      ? 'SKYLINE PARK'
      : venue === 'STREET_KINGS'
        ? 'STREET KINGS'
        : `${homeTeam.city} ${homeTeam.name}`
  ).toUpperCase();

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
  const lineCol = venue === 'ARENA_2K14' ? '#fef3c7' : '#ffffff';
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
  const centerR = (COURT_DIMS.CENTER_CIRCLE_R / COURT_DIMS.WIDTH) * H;
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
  const ftRadius = (COURT_DIMS.CENTER_CIRCLE_R / COURT_DIMS.WIDTH) * H;
  const threePtRx = (COURT_DIMS.THREE_PT_RADIUS / COURT_DIMS.LENGTH) * W;
  const threePtRz = (COURT_DIMS.THREE_PT_RADIUS / COURT_DIMS.WIDTH) * H;
  const cornerZTop = worldZToV(-COURT_DIMS.CORNER_THREE_Z, H);
  const cornerZBot = worldZToV(COURT_DIMS.CORNER_THREE_Z, H);

  for (const side of [-1, 1] as const) {
    const rimU = worldXToU(side * COURT_DIMS.RIM_X, W);
    const ftU = worldXToU(side * COURT_DIMS.FREE_THROW_X, W);

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
    const raR = (1.22 / COURT_DIMS.WIDTH) * H;
    ctx.beginPath();
    ctx.arc(
      rimU,
      H / 2,
      raR,
      side === -1 ? -Math.PI / 2 : Math.PI / 2,
      side === -1 ? Math.PI / 2 : (Math.PI * 3) / 2
    );
    ctx.stroke();

    // 3-Point Arc + Corner Straight Lines
    const cornerIntersectX = Math.sqrt(
      Math.max(0.1, COURT_DIMS.THREE_PT_RADIUS * COURT_DIMS.THREE_PT_RADIUS - COURT_DIMS.CORNER_THREE_Z * COURT_DIMS.CORNER_THREE_Z)
    );
    const cornerEndU = worldXToU(
      side === -1 ? -COURT_DIMS.RIM_X + cornerIntersectX : COURT_DIMS.RIM_X - cornerIntersectX,
      W
    );
    const baseU = side === -1 ? 4 : W - 4;

    ctx.beginPath();
    ctx.moveTo(baseU, cornerZTop);
    ctx.lineTo(cornerEndU, cornerZTop);
    ctx.moveTo(baseU, cornerZBot);
    ctx.lineTo(cornerEndU, cornerZBot);
    ctx.stroke();

    const maxAng = Math.asin(COURT_DIMS.CORNER_THREE_Z / COURT_DIMS.THREE_PT_RADIUS);
    ctx.beginPath();
    if (side === -1) {
      ctx.ellipse(rimU, H / 2, threePtRx, threePtRz, 0, -maxAng, maxAng);
    } else {
      ctx.ellipse(rimU, H / 2, threePtRx, threePtRz, 0, Math.PI - maxAng, Math.PI + maxAng);
    }
    ctx.stroke();

    // Lane hash ticks
    ctx.lineWidth = 4;
    for (let hIdx = 0; hIdx < 4; hIdx++) {
      const dist = 2.1 + hIdx * 0.92;
      const hu = worldXToU(side * (COURT_DIMS.HALF_LENGTH - dist), W);
      ctx.beginPath();
      ctx.moveTo(hu, keyTopY - 12);
      ctx.lineTo(hu, keyTopY);
      ctx.moveTo(hu, keyTopY + keyPxH);
      ctx.lineTo(hu, keyTopY + keyPxH + 12);
      ctx.stroke();
    }
  }

  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 8;
  colorMap.needsUpdate = true;

  // 4. Procedural 1024x512 Roughness Map (varnished hardwood vs gritty asphalt)
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 1024;
  rCanvas.height = 512;
  const rCtx = rCanvas.getContext('2d')!;
  if (isAsphalt || isColiseum) {
    rCtx.fillStyle = '#cfcfcf';
    rCtx.fillRect(0, 0, 1024, 512);
    for (let i = 0; i < 2400; i++) {
      const rx = (i * 613) % 1024;
      const ry = (i * 331) % 512;
      rCtx.fillStyle = i % 2 === 0 ? '#bdbdbd' : '#e2e2e2';
      rCtx.fillRect(rx, ry, 4, 4);
    }
  } else {
    // Varnished planks with glossy center & subtle scuff wear in the paint
    rCtx.fillStyle = '#4c4c4c';
    rCtx.fillRect(0, 0, 1024, 512);
    for (let row = 0; row < 64; row++) {
      const g = 60 + ((row * 17) % 34);
      rCtx.fillStyle = `rgb(${g},${g},${g})`;
      rCtx.fillRect(0, row * 8, 1024, 7);
    }
  }
  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.needsUpdate = true;

  return {
    colorMap,
    roughnessMap,
    dispose: () => {
      colorMap.dispose();
      roughnessMap.dispose();
    },
  };
}

/**
 * Caches dynamic 256x256 Jersey CanvasTextures (front team abbr + number,
 * back surname + big jersey number) with proper disposal.
 */
export class JerseyTextureCache {
  private map = new Map<string, THREE.CanvasTexture>();

  public getJerseyTexture(
    team: TeamData,
    variant: JerseyVariant,
    jerseyNumber: number,
    lastName: string
  ): THREE.CanvasTexture {
    const key = `${team.id}_${variant}_${jerseyNumber}_${lastName}`;
    const existing = this.map.get(key);
    if (existing) return existing;

    const pal = resolveJerseyPalette(team, variant);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

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
    const numStr = String(jerseyNumber);
    ctx.strokeText(numStr, 62, 138);
    ctx.fillText(numStr, 62, 138);

    // Back surname + big jersey number
    ctx.font = '900 18px Arial Black, sans-serif';
    ctx.fillText(lastName.toUpperCase().slice(0, 11), 192, 60);

    ctx.font = '900 76px Impact, Arial Black, sans-serif';
    ctx.strokeText(numStr, 192, 144);
    ctx.fillText(numStr, 192, 144);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    this.map.set(key, tex);
    return tex;
  }

  public dispose(): void {
    this.map.forEach((tex) => tex.dispose());
    this.map.clear();
  }
}

/** Procedural basketball leather + black ribbed channel seams */
export function createBasketballTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#d95b16');
  grad.addColorStop(0.5, '#c2410c');
  grad.addColorStop(1, '#9a3412');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Pebbled leather dimples
  for (let i = 0; i < 1600; i++) {
    const x = (i * 197) % 512;
    const y = (i * 89) % 256;
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

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Dynamic 512x256 Jumbotron live scoreboard screen */
export function createJumbotronTexture(): {
  texture: THREE.CanvasTexture;
  update: (awayAbbr: string, awayPts: number, homeAbbr: string, homePts: number, clockText: string, banner: string) => void;
  dispose: () => void;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const update = (
    awayAbbr: string,
    awayPts: number,
    homeAbbr: string,
    homePts: number,
    clockText: string,
    banner: string
  ) => {
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
    ctx.fillText(`${awayAbbr}  ${awayPts}`, 132, 118);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${homeAbbr}  ${homePts}`, 380, 118);

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
    texture,
    update,
    dispose: () => texture.dispose(),
  };
}

/** LED Courtside Scorer's Table Ribbon */
export function createScorerRibbonTexture(homeTeam: TeamData, venue: MatchVenueId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

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
  const label =
    venue === 'ARENA_2K14'
      ? `NBA 2K14 FINALS  •  ${homeTeam.city.toUpperCase()} ${homeTeam.name.toUpperCase()}  •  PROPLAY`
      : `NBA 2K26 PROPLAY  •  ${homeTeam.city.toUpperCase()} ${homeTeam.name.toUpperCase()}  •  2K SPORTS`;
  ctx.fillText(label, 512, 49);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}
