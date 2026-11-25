// ============================================================================
// NBA 2K14 — 5 Distinct Three.js 3D Court Environments Builder
// 1. NBA Regulation Arena (94x50 ft)
// 2. Euroleague FIBA Arena
// 3. NBA Blacktop Street Court (asphalt + chain-link + chain nets)
// 4. The Park Open-Air Plaza
// 5. Practice / Training Camp Gym
// ============================================================================

import * as THREE from 'three';
import type { CourtEnvId, TeamData } from '../types';

export const COURT_LENGTH = 28.65; // 94 ft in meters
export const COURT_WIDTH = 15.24;  // 50 ft in meters
export const HOOP_X = 12.75;       // rim centers at +12.75 and -12.75
export const RIM_Y = 3.05;         // regulation 10 ft

export interface HoopVisualRefs {
  rimMesh: THREE.Mesh;
  netMesh: THREE.Mesh;
  ledBorderMesh: THREE.Mesh;
  rimRestY: number;
  rippleEnergy: number;
  rimFlex: number;
}

export interface ArenaBuildResult {
  group: THREE.Group;
  hoops: { home: HoopVisualRefs; away: HoopVisualRefs }; // home hoop = -HOOP_X (home defends), away hoop = +HOOP_X (home attacks)
  crowdMesh: THREE.InstancedMesh | null;
  crowdBaseY: Float32Array;
  cameraFlashes: THREE.PointLight[];
  playVisionGroup: THREE.Group;
  updateArena: (dt: number, elapsed: number, crowdExcitement: number, buzzerFlash: boolean) => void;
  triggerSwish: (targetSide: 'home' | 'away', isDunk: boolean) => void;
  setPlayVision: (activePlay: string, attackDir: 1 | -1, enabled: boolean) => void;
  dispose: () => void;
}

function createCourtSurfaceTexture(env: CourtEnvId, homeTeam: TeamData, fibaRules: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const w = canvas.width;
  const h = canvas.height;
  const padX = 110;
  const padY = 82;
  const cw = w - padX * 2;
  const ch = h - padY * 2;

  // Apron background
  if (env === 'blacktop' || env === 'park') {
    ctx.fillStyle = env === 'park' ? '#334155' : '#1e242b';
    ctx.fillRect(0, 0, w, h);
    // Asphalt speckle
    for (let i = 0; i < 4500; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.14)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 3);
    }
    ctx.fillStyle = env === 'park' ? '#475569' : '#2a3038';
    ctx.fillRect(padX, padY, cw, ch);
  } else if (env === 'euroleague') {
    ctx.fillStyle = '#0f3b7a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d4a36a';
    ctx.fillRect(padX, padY, cw, ch);
  } else if (env === 'practice') {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d8ae78';
    ctx.fillRect(padX, padY, cw, ch);
  } else {
    // NBA Arena Apron with Home Team primary color
    ctx.fillStyle = homeTeam.primaryColor;
    ctx.fillRect(0, 0, w, h);
    // Maple hardwood planks
    ctx.fillStyle = '#d7ab72';
    ctx.fillRect(padX, padY, cw, ch);
  }

  // Procedural Maple Hardwood Planks for indoor courts
  if (env !== 'blacktop' && env !== 'park') {
    const plankRows = 44;
    const rowH = ch / plankRows;
    for (let r = 0; r < plankRows; r++) {
      const shade = ((r * 37) % 13) - 6;
      ctx.fillStyle = `rgba(${170 + shade * 4}, ${120 + shade * 3}, ${65 + shade * 2}, 0.22)`;
      ctx.fillRect(padX, padY + r * rowH, cw, rowH - 1);
      ctx.fillStyle = 'rgba(92, 56, 24, 0.14)';
      ctx.fillRect(padX, padY + r * rowH, cw, 1);
    }
  }

  const lineInk = env === 'blacktop' ? '#facc15' : '#ffffff';
  const paintColor =
    env === 'euroleague'
      ? '#ea580c'
      : env === 'blacktop'
        ? 'rgba(206,17,65,0.52)'
        : env === 'park'
          ? 'rgba(249,160,27,0.48)'
          : env === 'practice'
            ? '#1e293b'
            : homeTeam.primaryColor;

  // Paint Keys (left & right)
  const keyLen = cw * (5.79 / COURT_LENGTH);
  const keyW = ch * (4.88 / COURT_WIDTH);
  const keyTop = padY + (ch - keyW) / 2;

  ctx.fillStyle = paintColor;
  ctx.fillRect(padX, keyTop, keyLen, keyW);
  ctx.fillRect(padX + cw - keyLen, keyTop, keyLen, keyW);

  // Center Court Circle & Team Emblem
  const cx = w / 2;
  const cy = h / 2;
  const centerR = ch * 0.15;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
  ctx.fillStyle = env === 'blacktop' ? '#ce1141' : env === 'park' ? '#0f172a' : homeTeam.primaryColor;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = env === 'blacktop' ? '#facc15' : homeTeam.secondaryColor;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 72px "Oswald", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    env === 'blacktop' ? '2K14' : env === 'park' ? 'PARK' : env === 'practice' ? 'GYM' : homeTeam.code,
    cx,
    cy - 6
  );
  ctx.font = '700 22px "Oswald", sans-serif';
  ctx.fillStyle = homeTeam.secondaryColor;
  ctx.fillText(
    env === 'blacktop' ? 'BLACKTOP' : env === 'park' ? 'GOT NEXT' : homeTeam.name.toUpperCase(),
    cx,
    cy + 42
  );
  ctx.restore();

  // Baseline Team Wordmarks on Apron
  if (env === 'nba' || env === 'euroleague') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Oswald", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(padX * 0.5, cy);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(homeTeam.fullName.toUpperCase(), 0, 0);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 44px "Oswald", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(w - padX * 0.5, cy);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(homeTeam.fullName.toUpperCase(), 0, 0);
    ctx.restore();
  }

  // Court Markings (Sidelines, Half-Court, Keys, Free-Throw Circles, 3PT Arcs, Restricted Arcs)
  ctx.strokeStyle = lineInk;
  ctx.lineWidth = 5;
  ctx.strokeRect(padX, padY, cw, ch);

  // Half-court line
  ctx.beginPath();
  ctx.moveTo(cx, padY);
  ctx.lineTo(cx, padY + ch);
  ctx.stroke();

  // Key outlines & Free-throw circles
  ctx.strokeRect(padX, keyTop, keyLen, keyW);
  ctx.strokeRect(padX + cw - keyLen, keyTop, keyLen, keyW);

  const ftR = keyW * 0.37;
  ctx.beginPath();
  ctx.arc(padX + keyLen, cy, ftR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(padX + cw - keyLen, cy, ftR, 0, Math.PI * 2);
  ctx.stroke();

  // 3-Point Arcs (NBA 7.24m vs FIBA 6.75m)
  const pxPerMeterX = cw / COURT_LENGTH;
  const pxPerMeterY = ch / COURT_WIDTH;
  const hoopOffsetPx = ((COURT_LENGTH / 2 - HOOP_X) * pxPerMeterX);
  const arcR = (fibaRules || env === 'euroleague' ? 6.75 : 7.24) * pxPerMeterY;
  const cornerMargin = ch * 0.065;

  // Left 3PT
  ctx.beginPath();
  ctx.moveTo(padX, padY + cornerMargin);
  ctx.lineTo(padX + hoopOffsetPx + arcR * 0.35, padY + cornerMargin);
  ctx.arc(padX + hoopOffsetPx, cy, arcR, -Math.PI * 0.39, Math.PI * 0.39);
  ctx.lineTo(padX, padY + ch - cornerMargin);
  ctx.stroke();

  // Right 3PT
  ctx.beginPath();
  ctx.moveTo(padX + cw, padY + cornerMargin);
  ctx.lineTo(padX + cw - hoopOffsetPx - arcR * 0.35, padY + cornerMargin);
  ctx.arc(padX + cw - hoopOffsetPx, cy, arcR, Math.PI - Math.PI * 0.39, Math.PI + Math.PI * 0.39);
  ctx.lineTo(padX + cw, padY + ch - cornerMargin);
  ctx.stroke();

  // Restricted area arcs
  const restR = 1.25 * pxPerMeterY;
  ctx.beginPath();
  ctx.arc(padX + hoopOffsetPx, cy, restR, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(padX + cw - hoopOffsetPx, cy, restR, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function buildBasketStanchion(
  side: -1 | 1,
  env: CourtEnvId,
  homeTeam: TeamData,
  track: <T extends { dispose: () => void }>(d: T) => T
): { group: THREE.Group; refs: HoopVisualRefs } {
  const g = new THREE.Group();
  const baseSign = side; // +1 at +HOOP_X (right), -1 at -HOOP_X (left)
  const rimPosX = baseSign * HOOP_X;
  const boardX = rimPosX + baseSign * 0.38;

  // Hydraulic Padded Stanchion Base & Boom
  const padMat = track(
    new THREE.MeshStandardMaterial({
      color: env === 'blacktop' || env === 'park' ? '#334155' : homeTeam.primaryColor,
      roughness: 0.45,
      metalness: 0.15,
    })
  );
  const steelMat = track(new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.35, metalness: 0.72 }));

  const baseGeo = track(new THREE.BoxGeometry(1.1, 1.8, 0.9));
  const baseMesh = new THREE.Mesh(baseGeo, padMat);
  baseMesh.position.set(rimPosX + baseSign * 2.25, 0.9, 0);
  baseMesh.castShadow = true;
  g.add(baseMesh);

  const postGeo = track(new THREE.BoxGeometry(0.32, 3.2, 0.32));
  const postMesh = new THREE.Mesh(postGeo, steelMat);
  postMesh.position.set(rimPosX + baseSign * 1.95, 2.0, 0);
  g.add(postMesh);

  const armGeo = track(new THREE.BoxGeometry(1.65, 0.24, 0.24));
  const armMesh = new THREE.Mesh(armGeo, steelMat);
  armMesh.position.set(rimPosX + baseSign * 1.2, 3.32, 0);
  g.add(armMesh);

  // Tempered Glass Backboard
  const boardGeo = track(new THREE.BoxGeometry(0.08, 1.08, 1.83));
  const boardMat = track(
    new THREE.MeshPhysicalMaterial({
      color: env === 'blacktop' ? '#cbd5e1' : '#e2f1ff',
      transparent: true,
      opacity: env === 'blacktop' ? 0.85 : 0.42,
      roughness: 0.08,
      metalness: 0.1,
    })
  );
  const boardMesh = new THREE.Mesh(boardGeo, boardMat);
  boardMesh.position.set(boardX, RIM_Y + 0.36, 0);
  g.add(boardMesh);

  // Backboard Outer Frame + Red LED Buzzer Strip
  const ledMat = track(
    new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#ef4444',
      emissiveIntensity: 0.15,
      roughness: 0.3,
    })
  );
  const borderGroup = new THREE.Mesh(track(new THREE.BoxGeometry(0.095, 1.13, 1.89)), ledMat);
  borderGroup.position.set(boardX + baseSign * 0.015, RIM_Y + 0.36, 0);
  // Make wireframe outline feel using thin bars instead of solid block
  g.remove(borderGroup);
  const ledTop = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 0.06, 1.89)), ledMat);
  ledTop.position.set(boardX, RIM_Y + 0.91, 0);
  g.add(ledTop);
  const ledBot = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 0.06, 1.89)), ledMat);
  ledBot.position.set(boardX, RIM_Y - 0.18, 0);
  g.add(ledBot);
  const ledL = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 1.12, 0.06)), ledMat);
  ledL.position.set(boardX, RIM_Y + 0.36, -0.92);
  g.add(ledL);
  const ledR = new THREE.Mesh(track(new THREE.BoxGeometry(0.11, 1.12, 0.06)), ledMat);
  ledR.position.set(boardX, RIM_Y + 0.36, 0.92);
  g.add(ledR);

  // Shooter's inner square on glass
  const sqMat = track(new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  const sqTop = new THREE.Mesh(track(new THREE.BoxGeometry(0.09, 0.03, 0.6)), sqMat);
  sqTop.position.set(boardX - baseSign * 0.02, RIM_Y + 0.48, 0);
  g.add(sqTop);

  // 24-Second Shot Clock Tower atop Backboard
  if (env === 'nba' || env === 'euroleague') {
    const clockBox = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.32, 0.44, 0.66)),
      track(new THREE.MeshStandardMaterial({ color: '#090a0d', roughness: 0.4, metalness: 0.6 }))
    );
    clockBox.position.set(boardX + baseSign * 0.12, RIM_Y + 1.24, 0);
    g.add(clockBox);

    const clockFace = new THREE.Mesh(
      track(new THREE.PlaneGeometry(0.56, 0.32)),
      track(new THREE.MeshBasicMaterial({ color: '#ef4444' }))
    );
    clockFace.position.set(boardX + baseSign * 0.12 - baseSign * 0.17, RIM_Y + 1.24, 0);
    clockFace.rotation.y = baseSign > 0 ? -Math.PI / 2 : Math.PI / 2;
    g.add(clockFace);
  }

  // Regulation 10-ft Orange Breakaway Rim
  const rimGeo = track(new THREE.TorusGeometry(0.24, 0.022, 10, 24));
  rimGeo.rotateX(Math.PI / 2);
  const rimMat = track(new THREE.MeshStandardMaterial({ color: '#ff5a1f', roughness: 0.28, metalness: 0.78 }));
  const rimMesh = new THREE.Mesh(rimGeo, rimMat);
  rimMesh.position.set(rimPosX, RIM_Y, 0);
  g.add(rimMesh);

  // Dynamic Ripple Mesh Net (white cotton for indoor, metallic chain for Blacktop/Park)
  const netGeo = track(new THREE.CylinderGeometry(0.23, 0.145, 0.46, 14, 4, true));
  const netMat = track(
    new THREE.MeshStandardMaterial({
      color: env === 'blacktop' || env === 'park' ? '#cbd5e1' : '#f8fafc',
      wireframe: true,
      roughness: env === 'blacktop' || env === 'park' ? 0.25 : 0.75,
      metalness: env === 'blacktop' || env === 'park' ? 0.85 : 0.05,
    })
  );
  const netMesh = new THREE.Mesh(netGeo, netMat);
  netMesh.position.set(rimPosX, RIM_Y - 0.24, 0);
  g.add(netMesh);

  return {
    group: g,
    refs: {
      rimMesh,
      netMesh,
      ledBorderMesh: ledTop,
      rimRestY: RIM_Y,
      rippleEnergy: 0,
      rimFlex: 0,
    },
  };
}

export function buildArenaEnvironment(
  env: CourtEnvId,
  homeTeam: TeamData,
  fibaRules: boolean,
  highCrowdDetail: boolean,
  courtReflections: boolean
): ArenaBuildResult {
  const group = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(d: T): T => {
    disposables.push(d);
    return d;
  };

  // Court Floor Plane with Procedural Texture
  const courtTex = track(createCourtSurfaceTexture(env, homeTeam, fibaRules));
  const floorGeo = track(new THREE.PlaneGeometry(COURT_LENGTH + 4.2, COURT_WIDTH + 3.4));
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = track(
    new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: env === 'blacktop' || env === 'park' ? 0.84 : courtReflections ? 0.22 : 0.45,
      metalness: env === 'blacktop' || env === 'park' ? 0.04 : courtReflections ? 0.12 : 0.04,
    })
  );
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Outer Stadium Concrete / Floor Skirt
  const outerGeo = track(new THREE.PlaneGeometry(92, 64));
  outerGeo.rotateX(-Math.PI / 2);
  const outerMat = track(
    new THREE.MeshStandardMaterial({
      color: env === 'blacktop' ? '#141920' : env === 'park' ? '#1e293b' : '#090b10',
      roughness: 0.9,
    })
  );
  const outerFloor = new THREE.Mesh(outerGeo, outerMat);
  outerFloor.position.y = -0.02;
  group.add(outerFloor);

  // Left & Right Regulation Stanchions
  const leftBasket = buildBasketStanchion(-1, env, homeTeam, track);
  const rightBasket = buildBasketStanchion(1, env, homeTeam, track);
  group.add(leftBasket.group, rightBasket.group);

  let crowdMesh: THREE.InstancedMesh | null = null;
  let crowdBaseY = new Float32Array(0);
  const cameraFlashes: THREE.PointLight[] = [];

  if (env === 'nba' || env === 'euroleague') {
    // Multi-tier Arena Seating Bowls
    const bowlMat = track(new THREE.MeshStandardMaterial({ color: '#11141c', roughness: 0.85 }));
    const ribbonMat = track(
      new THREE.MeshStandardMaterial({
        color: homeTeam.primaryColor,
        emissive: homeTeam.primaryColor,
        emissiveIntensity: 0.65,
        roughness: 0.35,
      })
    );

    const buildStand = (px: number, pz: number, rotY: number, width: number) => {
      const stand = new THREE.Group();
      stand.position.set(px, 0, pz);
      stand.rotation.y = rotY;
      for (let tier = 0; tier < 5; tier++) {
        const step = new THREE.Mesh(track(new THREE.BoxGeometry(width, 0.72, 1.5)), bowlMat);
        step.position.set(0, 0.4 + tier * 0.72, tier * 1.45);
        stand.add(step);
      }
      // Glowing Ribbon LED Board
      const led = new THREE.Mesh(track(new THREE.BoxGeometry(width, 0.45, 0.16)), ribbonMat);
      led.position.set(0, 4.15, 6.2);
      stand.add(led);
      group.add(stand);
    };

    buildStand(0, -11.4, Math.PI, 36);
    buildStand(0, 11.4, 0, 36);
    buildStand(-19.2, 0, -Math.PI / 2, 24);
    buildStand(19.2, 0, Math.PI / 2, 24);

    // Scorer's Table & Team Benches
    const tableMesh = new THREE.Mesh(
      track(new THREE.BoxGeometry(8.5, 0.85, 0.9)),
      track(new THREE.MeshStandardMaterial({ color: '#0f172a', emissive: homeTeam.primaryColor, emissiveIntensity: 0.35 }))
    );
    tableMesh.position.set(0, 0.42, -9.2);
    group.add(tableMesh);

    [-8.5, 8.5].forEach((bx) => {
      const bench = new THREE.Mesh(
        track(new THREE.BoxGeometry(5.6, 0.5, 0.7)),
        track(new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 }))
      );
      bench.position.set(bx, 0.25, -9.3);
      group.add(bench);
    });

    // Overhead Center-Hung Jumbotron Scoreboard
    const jumbo = new THREE.Group();
    jumbo.position.set(0, 11.2, 0);
    const jumboBody = new THREE.Mesh(
      track(new THREE.BoxGeometry(5.2, 2.4, 3.8)),
      track(new THREE.MeshStandardMaterial({ color: '#0b0d12', roughness: 0.3, metalness: 0.7 }))
    );
    jumbo.add(jumboBody);
    const jumboScreenMat = track(
      new THREE.MeshStandardMaterial({
        color: homeTeam.secondaryColor,
        emissive: homeTeam.primaryColor,
        emissiveIntensity: 0.9,
      })
    );
    const jumboScreen = new THREE.Mesh(track(new THREE.BoxGeometry(5.32, 1.5, 3.92)), jumboScreenMat);
    jumbo.add(jumboScreen);
    group.add(jumbo);

    // Instanced Animated Crowd Spectators
    const count = highCrowdDetail ? 360 : 140;
    const fanGeo = track(new THREE.CapsuleGeometry(0.22, 0.42, 3, 6));
    const fanMat = track(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.75 }));
    crowdMesh = new THREE.InstancedMesh(fanGeo, fanMat, count);
    crowdBaseY = new Float32Array(count);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const palette = [homeTeam.primaryColor, homeTeam.secondaryColor, '#e2e8f0', '#334155', '#f59e0b'];

    for (let i = 0; i < count; i++) {
      const sideIdx = i % 4;
      const tier = Math.floor(i / 4) % 5;
      const spread = ((i * 73) % 100) / 100 - 0.5;
      let fx = 0;
      let fz = 0;
      if (sideIdx === 0) {
        fx = spread * 32;
        fz = -11.5 - tier * 1.45;
      } else if (sideIdx === 1) {
        fx = spread * 32;
        fz = 11.5 + tier * 1.45;
      } else if (sideIdx === 2) {
        fx = -19.2 - tier * 1.45;
        fz = spread * 20;
      } else {
        fx = 19.2 + tier * 1.45;
        fz = spread * 20;
      }
      const fy = 1.05 + tier * 0.72;
      crowdBaseY[i] = fy;
      dummy.position.set(fx, fy, fz);
      dummy.scale.set(1, 0.9 + ((i * 19) % 25) / 100, 1);
      dummy.updateMatrix();
      crowdMesh.setMatrixAt(i, dummy.matrix);
      color.set(palette[i % palette.length]);
      crowdMesh.setColorAt(i, color);
    }
    crowdMesh.instanceMatrix.needsUpdate = true;
    if (crowdMesh.instanceColor) crowdMesh.instanceColor.needsUpdate = true;
    group.add(crowdMesh);

    // Periodic Stadium Camera Flashes
    for (let f = 0; f < 3; f++) {
      const fl = new THREE.PointLight('#ffffff', 0, 18);
      fl.position.set((f - 1) * 11, 5.5, -13);
      group.add(fl);
      cameraFlashes.push(fl);
    }
  } else if (env === 'blacktop' || env === 'park') {
    // Chain-link Perimeter Fence & Urban Skyline Silhouettes
    const fenceMat = track(
      new THREE.MeshStandardMaterial({ color: '#94a3b8', wireframe: true, roughness: 0.4, metalness: 0.7 })
    );
    const fenceBack = new THREE.Mesh(track(new THREE.PlaneGeometry(36, 4.2, 24, 6)), fenceMat);
    fenceBack.position.set(0, 2.1, -10.5);
    group.add(fenceBack);

    const bldgMat = track(new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85 }));
    const winMat = track(
      new THREE.MeshStandardMaterial({ color: '#fbbf24', emissive: '#f59e0b', emissiveIntensity: 0.65 })
    );
    for (let i = 0; i < 12; i++) {
      const bw = 3 + (i % 3) * 1.4;
      const bh = 8 + ((i * 7) % 14);
      const b = new THREE.Mesh(track(new THREE.BoxGeometry(bw, bh, 3.6)), bldgMat);
      b.position.set(-24 + i * 4.5, bh / 2, -19 - (i % 3) * 3);
      group.add(b);
      if (i % 2 === 0) {
        const wStrip = new THREE.Mesh(track(new THREE.BoxGeometry(bw * 0.6, 0.35, 3.7)), winMat);
        wStrip.position.set(b.position.x, bh * 0.65, b.position.z);
        group.add(wStrip);
      }
    }

    // Floodlight Poles
    [-14, 14].forEach((px) => {
      const pole = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.14, 0.18, 9.5, 8)),
        track(new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7 }))
      );
      pole.position.set(px, 4.75, -10.6);
      group.add(pole);
      const lamp = new THREE.Mesh(
        track(new THREE.BoxGeometry(1.5, 0.42, 0.35)),
        track(new THREE.MeshBasicMaterial({ color: '#fff7ed' }))
      );
      lamp.position.set(px, 9.6, -10.4);
      group.add(lamp);
    });
  } else {
    // Practice Gym Walls, Banners & Ball Rack
    const wallMat = track(new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }));
    const backWall = new THREE.Mesh(track(new THREE.BoxGeometry(40, 10, 0.5)), wallMat);
    backWall.position.set(0, 5, -11.5);
    group.add(backWall);

    [homeTeam.primaryColor, homeTeam.secondaryColor, '#ce1141'].forEach((col, i) => {
      const banner = new THREE.Mesh(
        track(new THREE.BoxGeometry(2.2, 3.6, 0.1)),
        track(new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 }))
      );
      banner.position.set(-6 + i * 6, 6.8, -11.15);
      group.add(banner);
    });
  }

  // PlayVision 3D Floor Art Group
  const playVisionGroup = new THREE.Group();
  playVisionGroup.position.y = 0.032;
  group.add(playVisionGroup);

  const playArrowMat = track(
    new THREE.MeshBasicMaterial({ color: '#ce1141', transparent: true, opacity: 0.72, side: THREE.DoubleSide })
  );
  const playScreenMat = track(
    new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.76, side: THREE.DoubleSide })
  );

  const cutBar = new THREE.Mesh(track(new THREE.PlaneGeometry(4.8, 0.24)), playArrowMat);
  cutBar.rotation.x = -Math.PI / 2;
  cutBar.position.set(7.5, 0, -2.6);
  cutBar.rotation.z = 0.35;
  playVisionGroup.add(cutBar);

  const screenBar = new THREE.Mesh(track(new THREE.PlaneGeometry(1.6, 0.28)), playScreenMat);
  screenBar.rotation.x = -Math.PI / 2;
  screenBar.position.set(6.4, 0, 1.4);
  playVisionGroup.add(screenBar);

  const spotRing = new THREE.Mesh(track(new THREE.RingGeometry(0.65, 0.85, 24)), playArrowMat);
  spotRing.rotation.x = -Math.PI / 2;
  spotRing.position.set(9.4, 0, 4.6);
  playVisionGroup.add(spotRing);
  playVisionGroup.visible = false;

  const dummyCrowd = new THREE.Object3D();
  const matArr = new THREE.Matrix4();
  const posVec = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scaleVec = new THREE.Vector3();

  return {
    group,
    hoops: { home: leftBasket.refs, away: rightBasket.refs },
    crowdMesh,
    crowdBaseY,
    cameraFlashes,
    playVisionGroup,
    updateArena: (dt, elapsed, crowdExcitement, buzzerFlash) => {
      // Animate nets & rim breakaway springback
      [leftBasket.refs, rightBasket.refs].forEach((h) => {
        if (h.rippleEnergy > 0.001) {
          h.rippleEnergy = Math.max(0, h.rippleEnergy - dt * 2.2);
          const s = 1 + Math.sin(elapsed * 32) * h.rippleEnergy * 0.24;
          h.netMesh.scale.set(s, 1 + h.rippleEnergy * 0.16, s);
          h.netMesh.rotation.y += dt * 4 * h.rippleEnergy;
        } else {
          h.netMesh.scale.set(1, 1, 1);
        }
        if (h.rimFlex > 0.001) {
          h.rimFlex = Math.max(0, h.rimFlex - dt * 3.8);
          h.rimMesh.position.y = h.rimRestY - Math.sin(h.rimFlex * Math.PI) * 0.12;
        } else {
          h.rimMesh.position.y = h.rimRestY;
        }
        const ledM = h.ledBorderMesh.material as THREE.MeshStandardMaterial;
        ledM.emissiveIntensity = buzzerFlash ? 2.6 : 0.12;
      });

      // Animate crowd excitement bounce
      if (crowdMesh) {
        const amp = 0.04 + crowdExcitement * 0.28;
        const speed = 3.5 + crowdExcitement * 7;
        for (let i = 0; i < crowdMesh.count; i++) {
          crowdMesh.getMatrixAt(i, matArr);
          matArr.decompose(posVec, quat, scaleVec);
          posVec.y = crowdBaseY[i] + Math.max(0, Math.sin(elapsed * speed + i * 0.7)) * amp;
          dummyCrowd.position.copy(posVec);
          dummyCrowd.quaternion.copy(quat);
          dummyCrowd.scale.copy(scaleVec);
          dummyCrowd.updateMatrix();
          crowdMesh.setMatrixAt(i, dummyCrowd.matrix);
        }
        crowdMesh.instanceMatrix.needsUpdate = true;
      }

      // Periodic stadium camera flashes
      cameraFlashes.forEach((fl, idx) => {
        const pulse = Math.sin(elapsed * (3.7 + idx * 1.9) + idx * 2.1);
        fl.intensity = pulse > 0.965 ? 9.0 : 0;
      });
    },
    triggerSwish: (targetSide, isDunk) => {
      const h = targetSide === 'away' ? rightBasket.refs : leftBasket.refs;
      h.rippleEnergy = isDunk ? 1.4 : 1.0;
      if (isDunk) h.rimFlex = 1.0;
    },
    setPlayVision: (activePlay, attackDir, enabled) => {
      if (!enabled || activePlay === 'None') {
        playVisionGroup.visible = false;
        return;
      }
      playVisionGroup.visible = true;
      playVisionGroup.scale.x = attackDir;
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
