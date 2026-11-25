import * as THREE from 'three';
import { MlbbMapThemeId, MlbbMapVariantId } from '../types';
import {
  BLUE_FOUNTAIN,
  BRAWL_BRIDGE_HALF_WIDTH,
  BRAWL_HEALING_SHRINES,
  BROKEN_WALL_IDS,
  CYCLONE_EYES,
  FLYING_CLOUD_BLUE,
  getActiveMapBushes,
  getActiveMapWalls,
  getLaneDecalPosition,
  MAP_THEMES,
  MAP_WALLS,
  RED_FOUNTAIN,
  WORLD_SIZE
} from '../data/mapData';
import { hexToInt, toThreeX, toThreeZ, WORLD_SCALE } from './ThreeHeroModels';
import { VisionCircle } from './VisionSystem';

export interface ThreeMapHandle {
  root: THREE.Group;
  riverMat: THREE.MeshStandardMaterial | null;
  riverTex: THREE.CanvasTexture | null;
  bushMesh: THREE.InstancedMesh | null;
  bushBaseMatrices: { x: number; z: number; sx: number; sz: number; rot: number }[];
  shortcutWallMeshes: Map<string, THREE.Mesh>;
  cycloneMeshes: Map<string, THREE.Mesh>;
  flyingCloudGroup: THREE.Group | null;
  themeAmbientGroup: THREE.Group | null;
  expDecalMesh: THREE.Mesh | null;
  goldDecalMesh: THREE.Mesh | null;
  updateFogOfWar: (visionCircles: readonly VisionCircle[], revealAll: boolean) => void;
  dispose: () => void;
}

const BRIGHT_SKY_PALETTES: Record<
  MlbbMapThemeId,
  { zenith: number; horizon: number; grassMain: string; grassAlt: string; lane: number; trim: number; rock: number }
> = {
  imperial_sanctuary: {
    zenith: 0x3b82f6,
    horizon: 0xd9f0ff,
    grassMain: '#3e8446',
    grassAlt: '#4c9752',
    lane: 0xd9caa8,
    trim: 0xf0c65b,
    rock: 0x6b7280
  },
  western_expanse: {
    zenith: 0x38bdf8,
    horizon: 0xfef3c7,
    grassMain: '#a68b55',
    grassAlt: '#b89a61',
    lane: 0xe3cfa6,
    trim: 0xf59e0b,
    rock: 0x8d5b34
  },
  celestial_palace: {
    zenith: 0x2563eb,
    horizon: 0xe0f2fe,
    grassMain: '#36757f',
    grassAlt: '#428994',
    lane: 0xedf2f7,
    trim: 0xf7d060,
    rock: 0x5c6f89
  },
  sanctum_island: {
    zenith: 0x0ea5e9,
    horizon: 0xccfbf1,
    grassMain: '#2f8564',
    grassAlt: '#3b9a74',
    lane: 0xd6cab0,
    trim: 0xe8c468,
    rock: 0x45696d
  },
  harmonic_sanctuary: {
    zenith: 0x1e1b4b,
    horizon: 0x5b4b8a,
    grassMain: '#284a45',
    grassAlt: '#335d56',
    lane: 0xbcb0c4,
    trim: 0xf5c451,
    rock: 0x3c3756
  }
};

function createGroundTexture(themeId: MlbbMapThemeId): THREE.CanvasTexture {
  const pal = BRIGHT_SKY_PALETTES[themeId] ?? BRIGHT_SKY_PALETTES.imperial_sanctuary;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = pal.grassMain;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 65; i++) {
      const rx = (i * 137) % 512;
      const ry = (i * 211) % 512;
      const rad = 26 + (i % 4) * 16;
      const g = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
      g.addColorStop(0, pal.grassAlt);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 750; i++) {
      const rx = (i * 97 + (i % 7) * 19) % 512;
      const ry = (i * 151 + (i % 5) * 23) % 512;
      ctx.fillStyle = i % 9 === 0 ? 'rgba(254,249,195,0.22)' : 'rgba(20,55,28,0.14)';
      ctx.fillRect(rx, ry, 2, 5);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

function createRiverTexture(themeId: MlbbMapThemeId): THREE.CanvasTexture {
  const theme = MAP_THEMES[themeId] ?? MAP_THEMES.imperial_sanctuary;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, theme.riverA);
    grad.addColorStop(0.5, themeId === 'sanctum_island' ? '#2dd4bf' : themeId === 'celestial_palace' ? '#67e8f9' : '#38bdf8');
    grad.addColorStop(1, theme.riverA);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Animated water ripples
    ctx.strokeStyle = 'rgba(240,249,255,0.44)';
    ctx.lineWidth = 3.5;
    for (let y = 14; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.quadraticCurveTo(128, y + 12, 238, y);
      ctx.stroke();
    }

    // Crisp directional flowing current chevrons (signals +15% river move speed!)
    ctx.strokeStyle = 'rgba(224,242,254,0.72)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let y = 36; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(96, y - 14);
      ctx.lineTo(128, y + 12);
      ctx.lineTo(160, y - 14);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    for (let i = 0; i < 36; i++) {
      ctx.fillRect((i * 53) % 240, (i * 89) % 240, 10, 3);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 16);
  return tex;
}

function createLaneDecalTexture(kind: 'exp' | 'gold'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    const isExp = kind === 'exp';
    const col = isExp ? '#22D3EE' : '#FACC15';
    const glow = isExp ? 'rgba(34,211,238,0.34)' : 'rgba(250,204,21,0.34)';

    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 118);
    grad.addColorStop(0, glow);
    grad.addColorStop(0.75, isExp ? 'rgba(14,165,233,0.12)' : 'rgba(245,158,11,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 118, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = col;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(128, 128, 96, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([14, 10]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 68px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(isExp ? '⚔' : '🪙', 128, 112);

    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = col;
    ctx.fillText(isExp ? 'EXP LANE' : 'GOLD LANE', 128, 178);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSkyDome(zenithHex: number, horizonHex: number): THREE.Mesh {
  const skyGeo = new THREE.SphereGeometry(265, 24, 14);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTop: { value: new THREE.Color(zenithHex) },
      uBottom: { value: new THREE.Color(horizonHex) }
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uBottom;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        float t = pow(max(h, 0.0), 0.55);
        gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
      }
    `
  });
  return new THREE.Mesh(skyGeo, skyMat);
}

/**
 * Builds the 3D Land of Dawn battlefield (all 5 visual themes, all 4 2026 variants,
 * EXP/Gold 00:00 floor decals, semicircular Objective Pits, dynamic 3D Fog-of-War shroud)
 * OR the dedicated elevated 3D Brawl Single-Lane Bridge with side Healing Shrine alcoves!
 */
export function buildLandOfDawn3D(
  themeId: MlbbMapThemeId,
  variant: MlbbMapVariantId,
  isBrawl: boolean,
  expLane: 'top' | 'bot' = 'top',
  goldLane: 'top' | 'bot' = 'bot'
): ThreeMapHandle {
  const theme = MAP_THEMES[themeId] ?? MAP_THEMES.imperial_sanctuary;
  const pal = BRIGHT_SKY_PALETTES[themeId] ?? BRIGHT_SKY_PALETTES.imperial_sanctuary;
  const root = new THREE.Group();
  const textures: THREE.Texture[] = [];
  const shortcutWallMeshes = new Map<string, THREE.Mesh>();
  const cycloneMeshes = new Map<string, THREE.Mesh>();

  // 0. Theme-Matched Sky Dome
  root.add(createSkyDome(pal.zenith, pal.horizon));

  const mapSpan = WORLD_SIZE * WORLD_SCALE; // 200 units
  const laneStoneMat = new THREE.MeshStandardMaterial({
    color: pal.lane,
    roughness: 0.72,
    metalness: 0.1
  });
  const laneTrimMat = new THREE.MeshStandardMaterial({
    color: pal.trim,
    roughness: 0.3,
    metalness: 0.68
  });
  const rockMat = new THREE.MeshStandardMaterial({
    color: pal.rock,
    roughness: 0.82,
    metalness: 0.1
  });

  let riverMat: THREE.MeshStandardMaterial | null = null;
  let riverTex: THREE.CanvasTexture | null = null;
  let bushMesh: THREE.InstancedMesh | null = null;
  const bushBaseMatrices: { x: number; z: number; sx: number; sz: number; rot: number }[] = [];
  let flyingCloudGroup: THREE.Group | null = null;
  let themeAmbientGroup: THREE.Group | null = null;
  let expDecalMesh: THREE.Mesh | null = null;
  let goldDecalMesh: THREE.Mesh | null = null;

  if (isBrawl) {
    // ================= DEDICATED 3D BRAWL SINGLE-LANE ELEVATED BRIDGE =================
    riverTex = createRiverTexture(themeId);
    textures.push(riverTex);
    riverMat = new THREE.MeshStandardMaterial({
      map: riverTex,
      roughness: 0.18,
      metalness: 0.35,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.45
    });

    // Deep luminous abyssal river chasm below the bridge
    const chasmWater = new THREE.Mesh(new THREE.PlaneGeometry(mapSpan + 160, mapSpan + 160), riverMat);
    chasmWater.rotation.x = -Math.PI / 2;
    chasmWater.position.y = -7.2;
    root.add(chasmWater);

    // Wide elevated Stone & Gold Bridge Deck spanning Blue Base to Red Base
    const ax = toThreeX(BLUE_FOUNTAIN.x);
    const az = toThreeZ(BLUE_FOUNTAIN.y);
    const bx = toThreeX(RED_FOUNTAIN.x);
    const bz = toThreeZ(RED_FOUNTAIN.y);
    const bridgeLen = Math.hypot(bx - ax, bz - az) + 12;
    const bridgeW = BRAWL_BRIDGE_HALF_WIDTH * 2 * WORLD_SCALE;
    const ang = Math.atan2(bx - ax, bz - az);

    const bridgeGroup = new THREE.Group();
    bridgeGroup.rotation.y = ang;

    const deck = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 1.4, bridgeLen), laneStoneMat);
    deck.position.y = -0.68;
    deck.receiveShadow = true;

    const underArch = new THREE.Mesh(new THREE.BoxGeometry(bridgeW - 1.6, 5.8, bridgeLen - 8), rockMat);
    underArch.position.y = -4.2;

    const trimL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, bridgeLen), laneTrimMat);
    trimL.position.set(-bridgeW * 0.5 - 0.35, 0.28, 0);
    trimL.castShadow = true;
    const trimR = trimL.clone();
    trimR.position.x = bridgeW * 0.5 + 0.35;

    // Glowing arcane bridge guard rails & side lanterns
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.24, bridgeLen - 16), railMat);
    railL.position.set(-bridgeW * 0.5 - 0.35, 1.42, 0);
    const railR = railL.clone();
    railR.position.x = bridgeW * 0.5 + 0.35;

    for (let z = -bridgeLen * 0.42; z <= bridgeLen * 0.42; z += 18) {
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 3.2, 8), laneStoneMat);
        post.position.set(side * (bridgeW * 0.5 + 0.45), 1.4, z);
        post.castShadow = true;
        const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), laneTrimMat);
        orb.position.set(side * (bridgeW * 0.5 + 0.45), 3.3, z);
        bridgeGroup.add(post, orb);
      }
    }

    bridgeGroup.add(deck, underArch, trimL, trimR, railL, railR);
    root.add(bridgeGroup);

    // Side Alcove Platforms for the 2 Brawl Healing Shrines
    for (const sh of BRAWL_HEALING_SHRINES) {
      const alcove = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 1.3, 12), laneStoneMat);
      alcove.position.set(toThreeX(sh.x), -0.58, toThreeZ(sh.y));
      alcove.receiveShadow = true;
      const alcoveTrim = new THREE.Mesh(new THREE.TorusGeometry(4.25, 0.22, 8, 24), laneTrimMat);
      alcoveTrim.rotation.x = Math.PI / 2;
      alcoveTrim.position.set(toThreeX(sh.x), 0.14, toThreeZ(sh.y));
      root.add(alcove, alcoveTrim);
    }
  } else {
    // ================= 5v5 LAND OF DAWN 3-LANE ARENA =================
    // 1. Main Meadow Terrain + Extended Valley Apron
    const groundTex = createGroundTexture(themeId);
    textures.push(groundTex);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.88,
      metalness: 0.04
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(mapSpan + 140, mapSpan + 140), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    root.add(ground);

    // 2. Sculpted Marble/Sandstone & Gold-Trimmed 3D Lanes
    const addLaneSegment = (x1: number, y1: number, x2: number, y2: number, widthWorld: number) => {
      const ax = toThreeX(x1);
      const az = toThreeZ(y1);
      const bx = toThreeX(x2);
      const bz = toThreeZ(y2);
      const len = Math.hypot(bx - ax, bz - az) + widthWorld * WORLD_SCALE * 0.45;
      const ang = Math.atan2(bx - ax, bz - az);
      const w3 = widthWorld * WORLD_SCALE;

      const border = new THREE.Mesh(new THREE.BoxGeometry(w3 + 1.35, 0.14, len), laneTrimMat);
      border.position.set((ax + bx) * 0.5, 0.02, (az + bz) * 0.5);
      border.rotation.y = ang;
      border.receiveShadow = true;

      const stone = new THREE.Mesh(new THREE.BoxGeometry(w3, 0.2, len - 0.4), laneStoneMat);
      stone.position.set((ax + bx) * 0.5, 0.05, (az + bz) * 0.5);
      stone.rotation.y = ang;
      stone.receiveShadow = true;
      root.add(border, stone);
    };

    addLaneSegment(420, 3480, 420, 420, 210);
    addLaneSegment(420, 420, 3480, 420, 210);
    addLaneSegment(520, 3580, 3580, 3580, 210);
    addLaneSegment(3580, 3580, 3580, 520, 210);
    addLaneSegment(520, 3480, 3480, 520, 210);

    // 2B. Glowing 00:00 EXP Lane (Cyan Sword) & Gold Lane (Gold Coin) Floor Decals
    const expPos = getLaneDecalPosition(expLane);
    const goldPos = getLaneDecalPosition(goldLane);
    const expTex = createLaneDecalTexture('exp');
    const goldTex = createLaneDecalTexture('gold');
    textures.push(expTex, goldTex);

    expDecalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 11.5),
      new THREE.MeshBasicMaterial({ map: expTex, transparent: true, opacity: 0.92, depthWrite: false })
    );
    expDecalMesh.rotation.x = -Math.PI / 2;
    expDecalMesh.position.set(toThreeX(expPos.x), 0.19, toThreeZ(expPos.y));

    goldDecalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 11.5),
      new THREE.MeshBasicMaterial({ map: goldTex, transparent: true, opacity: 0.92, depthWrite: false })
    );
    goldDecalMesh.rotation.x = -Math.PI / 2;
    goldDecalMesh.position.set(toThreeX(goldPos.x), 0.19, toThreeZ(goldPos.y));
    root.add(expDecalMesh, goldDecalMesh);

    // 3. Flowing Diagonal River + Semicircular Objective Pits (Turtle / Lord) + Mid-Lane Bridge Pillars
    const expanding = variant === 'expanding_rivers';
    riverTex = createRiverTexture(themeId);
    textures.push(riverTex);
    riverMat = new THREE.MeshStandardMaterial({
      map: riverTex,
      roughness: 0.14,
      metalness: 0.28,
      transparent: true,
      opacity: 0.92
    });
    const riverLen = Math.hypot(3560, 3560) * WORLD_SCALE;
    const riverWidth = (expanding ? 345 : 225) * WORLD_SCALE;
    const riverPlane = new THREE.Mesh(new THREE.PlaneGeometry(riverWidth, riverLen), riverMat);
    riverPlane.rotation.x = -Math.PI / 2;
    riverPlane.rotation.z = -Math.PI / 4;
    riverPlane.position.set(0, 0.08, 0);
    root.add(riverPlane);

    // Sculpted Semicircular Objective Pits (Turtle Pit & Lord Pit)
    const pitSpecs = [
      { wx: 1280, wy: 1280, col: expLane === 'top' ? 0x2ce58b : 0xf59e0b, rot: Math.PI / 4 },
      { wx: 2720, wy: 2720, col: expLane === 'top' ? 0xf59e0b : 0x2ce58b, rot: -Math.PI * 0.75 }
    ];
    for (const pit of pitSpecs) {
      const px = toThreeX(pit.wx);
      const pz = toThreeZ(pit.wy);
      const pitFloor = new THREE.Mesh(
        new THREE.CircleGeometry(10.5, 24),
        new THREE.MeshStandardMaterial({ color: pal.lane, roughness: 0.75, metalness: 0.12 })
      );
      pitFloor.rotation.x = -Math.PI / 2;
      pitFloor.position.set(px, 0.09, pz);
      const pitArc = new THREE.Mesh(
        new THREE.TorusGeometry(10.8, 0.55, 8, 22, Math.PI * 1.15),
        rockMat
      );
      pitArc.rotation.x = Math.PI / 2;
      pitArc.rotation.z = pit.rot;
      pitArc.position.set(px, 0.55, pz);
      const pitRune = new THREE.Mesh(
        new THREE.RingGeometry(8.6, 9.2, 28),
        new THREE.MeshBasicMaterial({ color: pit.col, side: THREE.DoubleSide, transparent: true, opacity: 0.52, depthWrite: false })
      );
      pitRune.rotation.x = -Math.PI / 2;
      pitRune.position.set(px, 0.12, pz);
      root.add(pitFloor, pitArc, pitRune);
    }

    // Mid-Lane Bridge Parapets & Lantern Posts
    const bridgeOffsets = [
      [-6.5, -6.5],
      [6.5, 6.5],
      [-4.2, -8.8],
      [8.8, 4.2]
    ];
    for (const [bx, bz] of bridgeOffsets) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.58, 2.6, 8), laneStoneMat);
      post.position.set(bx, 1.3, bz);
      post.castShadow = true;
      const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), laneTrimMat);
      cap.position.set(bx, 2.95, bz);
      root.add(post, cap);
    }

    if (expanding) {
      const eddyGeo = new THREE.CircleGeometry(215 * WORLD_SCALE, 28);
      const eddyA = new THREE.Mesh(eddyGeo, riverMat);
      eddyA.rotation.x = -Math.PI / 2;
      eddyA.position.set(toThreeX(1420), 0.075, toThreeZ(1650));
      const eddyB = new THREE.Mesh(eddyGeo, riverMat);
      eddyB.rotation.x = -Math.PI / 2;
      eddyB.position.set(toThreeX(2580), 0.075, toThreeZ(2350));
      root.add(eddyA, eddyB);
    }

    // 5. Sculpted Multi-Tier 3D Jungle Cliffs & Ruined Stone Walls
    const mossCapMat = new THREE.MeshStandardMaterial({
      color: hexToInt(pal.grassAlt, 0x4c9752),
      roughness: 0.85,
      metalness: 0.05
    });
    const activeWalls = getActiveMapWalls(variant);
    for (const w of activeWalls) {
      const w3 = w.w * WORLD_SCALE;
      const d3 = w.h * WORLD_SCALE;
      const cx = toThreeX(w.x + w.w * 0.5);
      const cz = toThreeZ(w.y + w.h * 0.5);

      const wall = new THREE.Mesh(new THREE.BoxGeometry(w3, 3.6, d3), rockMat);
      wall.position.set(cx, 1.8, cz);
      wall.castShadow = true;
      wall.receiveShadow = true;

      const mossCap = new THREE.Mesh(new THREE.BoxGeometry(w3 + 0.45, 0.48, d3 + 0.45), mossCapMat);
      mossCap.position.y = 1.92;
      mossCap.receiveShadow = true;

      const ruinSpire = new THREE.Mesh(new THREE.DodecahedronGeometry(Math.min(w3, d3) * 0.42, 0), rockMat);
      ruinSpire.position.set(0, 2.55, 0);
      ruinSpire.scale.set(1.2, 0.85, 1.1);
      ruinSpire.castShadow = true;

      const trim = new THREE.Mesh(new THREE.BoxGeometry(w3 + 0.15, 0.22, d3 + 0.15), laneTrimMat);
      trim.position.y = 1.55;

      wall.add(mossCap, ruinSpire, trim);
      root.add(wall);
      if (w.shortcutCampId) {
        shortcutWallMeshes.set(w.shortcutCampId, wall);
      }
    }

    if (variant === 'broken_walls') {
      const rubbleMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.36,
        depthWrite: false
      });
      for (const w of MAP_WALLS) {
        if (!BROKEN_WALL_IDS.has(w.id)) continue;
        const pad = new THREE.Mesh(new THREE.PlaneGeometry(w.w * WORLD_SCALE, w.h * WORLD_SCALE), rubbleMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(toThreeX(w.x + w.w * 0.5), 0.12, toThreeZ(w.y + w.h * 0.5));
        root.add(pad);
      }
    }

    // 6. Lush Multi-Cluster Swaying 3D Bushes
    const bushes = getActiveMapBushes(variant);
    const bushGeo = new THREE.DodecahedronGeometry(1.0, 1);
    const bushMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
      metalness: 0.04
    });
    bushMesh = new THREE.InstancedMesh(bushGeo, bushMat, bushes.length * 4);
    bushMesh.castShadow = true;
    bushMesh.receiveShadow = true;
    bushMesh.frustumCulled = false;

    const baseCol = new THREE.Color(variant === 'dangerous_grass' ? 0x166534 : hexToInt(theme.bush, 0x22663a));
    const tmpCol = new THREE.Color();
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (const b of bushes) {
      const bx = toThreeX(b.cx);
      const bz = toThreeZ(b.cy);
      const rx3 = b.rx * WORLD_SCALE;
      const ry3 = b.ry * WORLD_SCALE;
      for (let k = 0; k < 4; k++) {
        const off = (k - 1.5) * rx3 * 0.38;
        const ox = bx + Math.cos(b.angle) * off;
        const oz = bz + Math.sin(b.angle) * off;
        const sx = rx3 * (0.52 + (k % 2) * 0.1);
        const sz = ry3 * (0.78 + ((k + 1) % 2) * 0.12);
        dummy.position.set(ox, 1.15, oz);
        dummy.rotation.set(0, -b.angle + k * 0.4, 0);
        dummy.scale.set(sx, 1.55 + (k === 1 || k === 2 ? 0.35 : 0), sz);
        dummy.updateMatrix();
        bushMesh.setMatrixAt(idx, dummy.matrix);
        tmpCol.copy(baseCol).offsetHSL(0, 0.04, (k - 1.5) * 0.045);
        bushMesh.setColorAt(idx, tmpCol);
        bushBaseMatrices.push({ x: ox, z: oz, sx, sz, rot: -b.angle + k * 0.4 });
        idx++;
      }
    }
    bushMesh.instanceMatrix.needsUpdate = true;
    if (bushMesh.instanceColor) bushMesh.instanceColor.needsUpdate = true;
    root.add(bushMesh);

    // 7. Cyclone Eyes (Rotating Turquoise Wind Rings)
    const ceGeo = new THREE.TorusGeometry(2.2, 0.2, 8, 22, Math.PI * 1.5);
    for (const ce of CYCLONE_EYES) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
      const ring = new THREE.Mesh(ceGeo, mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(toThreeX(ce.x), 0.38, toThreeZ(ce.y));
      root.add(ring);
      cycloneMeshes.set(ce.id, ring);
    }

    // 8. Flying Cloud Launch Pedestal (2026 Variant)
    if (variant === 'flying_cloud') {
      flyingCloudGroup = new THREE.Group();
      flyingCloudGroup.position.set(toThreeX(FLYING_CLOUD_BLUE.x), 0.36, toThreeZ(FLYING_CLOUD_BLUE.y));
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(3.8, 4.2, 0.36, 20),
        new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0xa855f7,
          emissiveIntensity: 0.65,
          roughness: 0.28
        })
      );
      const swirl = new THREE.Mesh(
        new THREE.TorusGeometry(3.4, 0.24, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0xf0abfc, transparent: true, opacity: 0.88 })
      );
      swirl.rotation.x = Math.PI / 2;
      swirl.position.y = 0.5;
      flyingCloudGroup.add(pad, swirl);
      root.add(flyingCloudGroup);
    }

    // 9. Theme-Specific Signature 3D Visual Landmarks & Atmospheric Particles
    themeAmbientGroup = new THREE.Group();
    if (themeId === 'harmonic_sanctuary') {
      // Glowing twilight roadside lanterns + floating lotus blossoms along the diagonal river
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
      const lotusMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.92 });
      for (let i = 0; i < 12; i++) {
        const t = -75 + i * 13.5;
        const lotus = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.6, 0.22, 7), lotusMat);
        lotus.position.set(t + (i % 2 === 0 ? 2.4 : -2.4), 0.24, t - (i % 2 === 0 ? 1.8 : -1.8));
        themeAmbientGroup.add(lotus);
      }
      const lanternCoords: [number, number][] = [
        [600, 2600],
        [600, 1400],
        [1400, 600],
        [2600, 600],
        [3400, 1400],
        [3400, 2600],
        [2600, 3400],
        [1400, 3400]
      ];
      for (const [lx, ly] of lanternCoords) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 3.6, 6), rockMat);
        post.position.set(toThreeX(lx), 1.8, toThreeZ(ly));
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), lanternMat);
        glow.position.set(toThreeX(lx), 3.8, toThreeZ(ly));
        themeAmbientGroup.add(post, glow);
      }
    } else if (themeId === 'western_expanse') {
      // Floating golden-amber desert dust motes
      const count = 220;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = ((i * 73) % 200) - 100;
        positions[i * 3 + 1] = 1.5 + ((i * 29) % 14);
        positions[i * 3 + 2] = ((i * 113) % 200) - 100;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const dust = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0xfcd34d, size: 0.75, transparent: true, opacity: 0.7 })
      );
      themeAmbientGroup.add(dust);
    } else if (themeId === 'celestial_palace') {
      // Floating golden astral halo rings framing the sky arena perimeter
      const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7, transparent: true, opacity: 0.45 });
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(7.5, 10, 8), cloudMat);
        puff.scale.set(1.8, 0.42, 1.3);
        puff.position.set(Math.cos(a) * 116, 4.5 + (i % 3) * 2.5, Math.sin(a) * 116);
        themeAmbientGroup.add(puff);
      }
    } else if (themeId === 'sanctum_island') {
      // Misty coastal teal waterfall pillars flanking outer cliff edges
      const mistMat = new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.42 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.35;
        const fall = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.8, 16, 8), mistMat);
        fall.position.set(Math.cos(a) * 118, 6.5, Math.sin(a) * 118);
        themeAmbientGroup.add(fall);
      }
    }
    root.add(themeAmbientGroup);
  }

  // 4. Stepped Blue Sanctuary & Red Citadel Base Terraces + Glowing Fountains + Banner Pillars (Both 5v5 and Brawl)
  const addBasePlaza = (wx: number, wy: number, ringCol: number, glowCol: number) => {
    const cx = toThreeX(wx);
    const cz = toThreeZ(wy);
    const lowerStep = new THREE.Mesh(
      new THREE.CylinderGeometry(465 * WORLD_SCALE, 495 * WORLD_SCALE, 0.32, 24),
      rockMat
    );
    lowerStep.position.set(cx, 0.08, cz);
    lowerStep.receiveShadow = true;

    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(440 * WORLD_SCALE, 455 * WORLD_SCALE, 0.28, 24),
      laneStoneMat
    );
    plaza.position.set(cx, 0.24, cz);
    plaza.receiveShadow = true;

    const borderRing = new THREE.Mesh(
      new THREE.RingGeometry(420 * WORLD_SCALE, 448 * WORLD_SCALE, 32),
      new THREE.MeshBasicMaterial({ color: ringCol, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
    );
    borderRing.rotation.x = -Math.PI / 2;
    borderRing.position.set(cx, 0.4, cz);

    const fountainRim = new THREE.Mesh(new THREE.TorusGeometry(185 * WORLD_SCALE, 0.35, 8, 28), laneTrimMat);
    fountainRim.rotation.x = Math.PI / 2;
    fountainRim.position.set(cx, 0.42, cz);

    const fountain = new THREE.Mesh(
      new THREE.CircleGeometry(185 * WORLD_SCALE, 28),
      new THREE.MeshBasicMaterial({ color: glowCol, transparent: true, opacity: 0.46, depthWrite: false })
    );
    fountain.rotation.x = -Math.PI / 2;
    fountain.position.set(cx, 0.41, cz);

    root.add(lowerStep, plaza, borderRing, fountainRim, fountain);

    const bannerMat = new THREE.MeshStandardMaterial({
      color: ringCol,
      emissive: ringCol,
      emissiveIntensity: 0.55,
      roughness: 0.3
    });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const px = cx + Math.cos(a) * 19.5;
      const pz = cz + Math.sin(a) * 19.5;
      const colMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.85, 5.2, 8), laneStoneMat);
      colMesh.position.set(px, 2.7, pz);
      colMesh.castShadow = true;
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), bannerMat);
      gem.position.set(px, 5.85, pz);
      root.add(colMesh, gem);
    }
  };
  addBasePlaza(BLUE_FOUNTAIN.x, BLUE_FOUNTAIN.y, 0x38bdf8, 0x22d3ee);
  addBasePlaza(RED_FOUNTAIN.x, RED_FOUNTAIN.y, 0xf43f5e, 0xfb7185);

  // 10. Horizon Perimeter Pine Groves & Canyon Cliffs (for 5v5)
  if (!isBrawl) {
    const treeCount = 72;
    const trunkMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.45, 0.72, 3.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x5c3d24, roughness: 0.9 }),
      treeCount
    );
    const canopyLow = new THREE.InstancedMesh(
      new THREE.ConeGeometry(3.1, 5.8, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
      treeCount
    );
    const canopyHigh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(2.1, 4.6, 7),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.78 }),
      treeCount
    );
    const cliffCount = 36;
    const cliffMesh = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(7.5, 0), rockMat, cliffCount);

    const pineBaseCol = new THREE.Color(hexToInt(theme.bush, 0x1f6b3b));
    const cTmp = new THREE.Color();
    const tDummy = new THREE.Object3D();

    for (let i = 0; i < treeCount; i++) {
      const side = i % 4;
      const frac = ((Math.floor(i / 4) + 0.5) / (treeCount / 4)) * 2 - 1;
      const distEdge = 107 + (i % 4) * 5.5;
      const tx = side === 0 ? -distEdge : side === 1 ? distEdge : frac * 112;
      const tz = side === 2 ? -distEdge : side === 3 ? distEdge : frac * 112;
      const sc = 0.85 + (i % 5) * 0.16;
      tDummy.position.set(tx, 1.9 * sc, tz);
      tDummy.rotation.set(0, (i * 0.9) % Math.PI, 0);
      tDummy.scale.setScalar(sc);
      tDummy.updateMatrix();
      trunkMesh.setMatrixAt(i, tDummy.matrix);

      tDummy.position.set(tx, 5.2 * sc, tz);
      tDummy.updateMatrix();
      canopyLow.setMatrixAt(i, tDummy.matrix);

      tDummy.position.set(tx, 8.2 * sc, tz);
      tDummy.updateMatrix();
      canopyHigh.setMatrixAt(i, tDummy.matrix);

      cTmp.copy(pineBaseCol).offsetHSL(0, 0.05, ((i % 5) - 2) * 0.04);
      canopyLow.setColorAt(i, cTmp);
      cTmp.offsetHSL(0, 0.03, 0.05);
      canopyHigh.setColorAt(i, cTmp);
    }
    trunkMesh.instanceMatrix.needsUpdate = true;
    canopyLow.instanceMatrix.needsUpdate = true;
    canopyHigh.instanceMatrix.needsUpdate = true;
    if (canopyLow.instanceColor) canopyLow.instanceColor.needsUpdate = true;
    if (canopyHigh.instanceColor) canopyHigh.instanceColor.needsUpdate = true;
    trunkMesh.computeBoundingSphere();
    canopyLow.computeBoundingSphere();
    canopyHigh.computeBoundingSphere();

    for (let i = 0; i < cliffCount; i++) {
      const ang = (i / cliffCount) * Math.PI * 2;
      const r = 128 + (i % 3) * 14;
      const sx = 1.2 + (i % 4) * 0.45;
      const sy = 1.6 + (i % 5) * 0.55;
      tDummy.position.set(Math.cos(ang) * r, sy * 3.2, Math.sin(ang) * r);
      tDummy.rotation.set(0, ang, 0);
      tDummy.scale.set(sx, sy, sx * 0.85);
      tDummy.updateMatrix();
      cliffMesh.setMatrixAt(i, tDummy.matrix);
    }
    cliffMesh.instanceMatrix.needsUpdate = true;
    cliffMesh.computeBoundingSphere();
    root.add(trunkMesh, canopyLow, canopyHigh, cliffMesh);
  }

  // 11. Real-Time 3D Ground Fog-of-War Illumination Overlay (dims unlit zones outside allied vision radii!)
  const fogCanvas = document.createElement('canvas');
  fogCanvas.width = 128;
  fogCanvas.height = 128;
  const fogCtx = fogCanvas.getContext('2d');
  const fogTex = new THREE.CanvasTexture(fogCanvas);
  fogTex.minFilter = THREE.LinearFilter;
  fogTex.magFilter = THREE.LinearFilter;
  textures.push(fogTex);

  const fogPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(mapSpan + 4, mapSpan + 4),
    new THREE.MeshBasicMaterial({
      map: fogTex,
      transparent: true,
      depthWrite: false,
      opacity: 1
    })
  );
  fogPlane.rotation.x = -Math.PI / 2;
  fogPlane.position.y = 0.44;
  fogPlane.renderOrder = 3;
  root.add(fogPlane);

  const updateFogOfWar = (visionCircles: readonly VisionCircle[], revealAll: boolean) => {
    if (!fogCtx) return;
    if (revealAll) {
      fogPlane.visible = false;
      return;
    }
    fogPlane.visible = true;
    fogCtx.globalCompositeOperation = 'source-over';
    fogCtx.clearRect(0, 0, 128, 128);
    fogCtx.fillStyle = 'rgba(4, 10, 24, 0.54)';
    fogCtx.fillRect(0, 0, 128, 128);

    fogCtx.globalCompositeOperation = 'destination-out';
    const scale = 128 / WORLD_SIZE;
    for (const c of visionCircles) {
      const cx = c.x * scale;
      const cy = c.y * scale;
      const r = Math.max(4, c.radius * scale);
      const grad = fogCtx.createRadialGradient(cx, cy, r * 0.55, cx, cy, r);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      fogCtx.fillStyle = grad;
      fogCtx.beginPath();
      fogCtx.arc(cx, cy, r, 0, Math.PI * 2);
      fogCtx.fill();
    }
    fogCtx.globalCompositeOperation = 'source-over';
    fogTex.needsUpdate = true;
  };

  const dispose = () => {
    root.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) mat.dispose();
    });
    for (const tex of textures) tex.dispose();
  };

  return {
    root,
    riverMat,
    riverTex,
    bushMesh,
    bushBaseMatrices,
    shortcutWallMeshes,
    cycloneMeshes,
    flyingCloudGroup,
    themeAmbientGroup,
    expDecalMesh,
    goldDecalMesh,
    updateFogOfWar,
    dispose
  };
}
