import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { UIEraMode } from './types';

export interface MenuBackground3DProps {
  eraMode: UIEraMode;
  starJerseyNumber?: number;
  starPrimaryHex?: string;
  starTrimHex?: string;
  onFpsSample?: (fps: number) => void;
}

// Reusable module-scope math helpers (zero GC inside animation loop)
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _tmpColor = new THREE.Color();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createHardwoodTexture(maxAniso: number, is2K14: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  // Base wood planks
  ctx.fillStyle = is2K14 ? '#6d4423' : '#334155';
  ctx.fillRect(0, 0, 1024, 1024);

  if (is2K14) {
    for (let row = 0; row < 32; row++) {
      const y = row * 32;
      for (let col = 0; col < 8; col++) {
        const x = col * 128 + (row % 2) * 44 - 44;
        const shade = ((row * 17 + col * 31) % 24) - 12;
        ctx.fillStyle = `rgb(${128 + shade}, ${82 + Math.round(shade * 0.7)}, ${42 + Math.round(shade * 0.4)})`;
        ctx.fillRect(x, y, 126, 30);
        ctx.strokeStyle = 'rgba(28, 14, 5, 0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 126, 30);
      }
    }
    // Glossy 2K14 arena center circle & crimson/gold paint lines
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(48, 48, 928, 928);

    ctx.beginPath();
    ctx.arc(512, 512, 165, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(152, 0, 46, 0.72)';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 108px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2K14', 512, 515);

    // 3PT arcs
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 110, 310, 0.14 * Math.PI, 0.86 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(512, 914, 310, 1.14 * Math.PI, 1.86 * Math.PI);
    ctx.stroke();
  } else {
    // 2K26 Skyline Park painted outdoor concrete court
    const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Painted teal/amber park court apron & key
    ctx.fillStyle = '#0f3d56';
    ctx.fillRect(70, 70, 884, 884);
    ctx.fillStyle = '#9f1239';
    ctx.fillRect(360, 70, 304, 290);
    ctx.fillRect(360, 664, 304, 290);

    // Subtle concrete speckle
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    for (let i = 0; i < 900; i++) {
      const px = (i * 197) % 1024;
      const py = (i * 353) % 1024;
      ctx.fillRect(px, py, 3, 3);
    }

    // Crisp painted court lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 8;
    ctx.strokeRect(70, 70, 884, 884);
    ctx.beginPath();
    ctx.moveTo(70, 512);
    ctx.lineTo(954, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(512, 512, 150, 0, Math.PI * 2);
    ctx.fillStyle = '#e11d48';
    ctx.fill();
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 92px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('2K26', 512, 496);
    ctx.font = '800 32px system-ui, sans-serif';
    ctx.fillStyle = '#fde68a';
    ctx.fillText('SKYLINE PARK', 512, 558);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 120, 300, 0.16 * Math.PI, 0.84 * Math.PI);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createJerseyTexture(
  jerseyNumber: number,
  primaryHex: string,
  trimHex: string,
  maxAniso: number
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = primaryHex;
  ctx.fillRect(0, 0, 512, 512);

  // Side jersey trim stripes
  ctx.fillStyle = trimHex;
  ctx.fillRect(0, 0, 34, 512);
  ctx.fillRect(478, 0, 34, 512);
  ctx.fillRect(0, 0, 512, 24);

  // Chest numeral
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = trimHex;
  ctx.lineWidth = 10;
  ctx.font = '900 215px Impact, Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = String(jerseyNumber);
  ctx.strokeText(label, 256, 275);
  ctx.fillText(label, 256, 275);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0,0,0,0.68)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface ArticulatedStarRig {
  root: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  ball: THREE.Mesh;
}

/**
 * Composite 12-part articulated 3D basketball superstar pivoted at bottom-center (y = 0).
 */
function buildArticulatedStar(
  jerseyNum: number,
  primaryHex: string,
  trimHex: string,
  skinHex: string,
  hasHeadband: boolean,
  maxAniso: number
): ArticulatedStarRig {
  const root = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinHex,
    roughness: 0.62,
    metalness: 0.04,
  });
  const jerseyTex = createJerseyTexture(jerseyNum, primaryHex, trimHex, maxAniso);
  const jerseyMat = new THREE.MeshStandardMaterial({
    map: jerseyTex,
    roughness: 0.72,
    metalness: 0.08,
  });
  const shortsMat = new THREE.MeshStandardMaterial({
    color: primaryHex,
    roughness: 0.76,
    metalness: 0.05,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: trimHex,
    roughness: 0.35,
    metalness: 0.35,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.35,
    metalness: 0.25,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: trimHex,
    roughness: 0.5,
    metalness: 0.15,
  });

  // Legs (pivoted at hip y = 1.02)
  const makeLeg = (xOff: number) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOff, 1.02, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.44, 14), shortsMat);
    thigh.position.y = -0.22;
    thigh.castShadow = true;
    legGroup.add(thigh);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.062, 0.46, 14), skinMat);
    calf.position.y = -0.66;
    calf.castShadow = true;
    legGroup.add(calf);

    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.18, 12), trimMat);
    sock.position.y = -0.84;
    legGroup.add(sock);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.32), shoeMat);
    shoe.position.set(0, -0.96, 0.06);
    shoe.castShadow = true;
    legGroup.add(shoe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.33), soleMat);
    sole.position.set(0, -1.0, 0.06);
    legGroup.add(sole);

    return legGroup;
  };

  const leftLeg = makeLeg(-0.14);
  const rightLeg = makeLeg(0.14);
  root.add(leftLeg, rightLeg);

  // Pelvis / Shorts waist
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.26), shortsMat);
  pelvis.position.y = 1.06;
  pelvis.castShadow = true;
  root.add(pelvis);

  // Torso group
  const torso = new THREE.Group();
  torso.position.y = 1.18;
  root.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.27), jerseyMat);
  chest.position.y = 0.29;
  chest.castShadow = true;
  torso.add(chest);

  const shoulderTrim = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.28), trimMat);
  shoulderTrim.position.y = 0.56;
  torso.add(shoulderTrim);

  // Head + Hair + Optional Headband
  const head = new THREE.Group();
  head.position.y = 0.68;
  torso.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 12), skinMat);
  neck.position.y = 0.02;
  head.add(neck);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 18, 16), skinMat);
  skull.position.y = 0.18;
  skull.castShadow = true;
  head.add(skull);

  const hairMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.88, metalness: 0.02 });
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.158, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
  hair.position.y = 0.195;
  head.add(hair);

  if (hasHeadband) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.055, 20, 1, true), trimMat);
    band.position.y = 0.22;
    head.add(band);
  }

  // Arms
  const makeArm = (xOff: number, hasSleeve: boolean) => {
    const arm = new THREE.Group();
    arm.position.set(xOff, 0.52, 0);

    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.062, 0.34, 12), skinMat);
    upper.position.y = -0.17;
    upper.castShadow = true;
    arm.add(upper);

    const forearmMat = hasSleeve ? trimMat : skinMat;
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 12), forearmMat);
    forearm.position.y = -0.49;
    forearm.castShadow = true;
    arm.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 12, 10), skinMat);
    hand.position.y = -0.68;
    arm.add(hand);

    return arm;
  };

  const leftArm = makeArm(-0.31, false);
  const rightArm = makeArm(0.31, true);
  torso.add(leftArm, rightArm);

  // Basketball with dark seam rings
  const ballMat = new THREE.MeshStandardMaterial({
    color: '#d95b16',
    roughness: 0.58,
    metalness: 0.06,
  });
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.145, 20, 16), ballMat);
  ball.castShadow = true;
  const seamMat = new THREE.MeshBasicMaterial({ color: '#1a120c' });
  const seam1 = new THREE.Mesh(new THREE.TorusGeometry(0.146, 0.006, 6, 28), seamMat);
  const seam2 = new THREE.Mesh(new THREE.TorusGeometry(0.146, 0.006, 6, 28), seamMat);
  seam2.rotation.y = Math.PI / 2;
  ball.add(seam1, seam2);
  ball.position.set(0.44, 0.82, 0.32);
  root.add(ball);

  // Soft contact shadow under player
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.025;
  root.add(shadowPlane);

  return { root, torso, head, leftArm, rightArm, leftLeg, rightLeg, ball };
}

function buildHoopStanchion(is2K14: boolean, isSoftwareGl: boolean): THREE.Group {
  const hoop = new THREE.Group();

  const postMat = new THREE.MeshStandardMaterial({
    color: is2K14 ? '#1e293b' : '#0f172a',
    roughness: 0.35,
    metalness: 0.72,
  });
  const padMat = new THREE.MeshStandardMaterial({
    color: is2K14 ? '#98002e' : '#e11d48',
    roughness: 0.65,
    metalness: 0.1,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.35, 1.1), padMat);
  base.position.set(0, 0.675, -0.8);
  base.castShadow = true;
  hoop.add(base);

  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.6, 0.28), postMat);
  mast.position.set(0, 2.0, -0.55);
  hoop.add(mast);

  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.45), postMat);
  boom.position.set(0, 3.55, 0.05);
  hoop.add(boom);

  // Glass Backboard
  const boardMat = new THREE.MeshPhysicalMaterial({
    color: '#e2e8f0',
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: isSoftwareGl ? 0.42 : 0.36,
    clearcoat: 1.0,
    depthWrite: false,
  });
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.12, 0.06), boardMat);
  board.position.set(0, 3.45, 0.75);
  board.renderOrder = 3;
  hoop.add(board);

  // Backboard neon frame
  const frameMat = new THREE.MeshStandardMaterial({
    color: is2K14 ? '#f59e0b' : '#e11d48',
    emissive: is2K14 ? '#b45309' : '#be123c',
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.6,
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.06, 0.08), frameMat);
  topBar.position.set(0, 4.02, 0.75);
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.06, 0.08), frameMat);
  botBar.position.set(0, 2.88, 0.75);
  hoop.add(topBar, botBar);

  // Rim
  const rimMat = new THREE.MeshStandardMaterial({
    color: '#f97316',
    roughness: 0.3,
    metalness: 0.7,
  });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 10, 28), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.05, 1.06);
  hoop.add(rim);

  // Net cylinder (open ended wireframe-like translucent mesh)
  const netMat = new THREE.MeshStandardMaterial({
    color: is2K14 ? '#f8fafc' : '#cbd5e1',
    roughness: 0.55,
    metalness: is2K14 ? 0.05 : 0.75,
    wireframe: true,
  });
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.15, 0.45, 12, 4, true), netMat);
  net.position.set(0, 2.82, 1.06);
  hoop.add(net);

  return hoop;
}

function buildPalmTree(x: number, z: number, scale: number): THREE.Group {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.scale.setScalar(scale);

  const trunkMat = new THREE.MeshStandardMaterial({ color: '#6b4f35', roughness: 0.9, metalness: 0.02 });
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.18 - i * 0.015, 0.21 - i * 0.015, 0.92, 8), trunkMat);
    seg.position.set(Math.sin(i * 0.16) * 0.25, 0.45 + i * 0.85, 0);
    seg.rotation.z = -0.06 * i;
    g.add(seg);
  }

  const frondMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.75, metalness: 0.04 });
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.5, 5), frondMat);
    frond.position.set(0.32 + Math.cos(angle) * 0.95, 5.45, Math.sin(angle) * 0.95);
    frond.rotation.z = -Math.PI * 0.36;
    frond.rotation.y = -angle;
    g.add(frond);
  }
  return g;
}

export const MenuBackground3D: React.FC<MenuBackground3DProps> = ({
  eraMode,
  starJerseyNumber,
  starPrimaryHex,
  starTrimHex,
  onFpsSample,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const eraRef = useRef<UIEraMode>(eraMode);
  const fpsCbRef = useRef(onFpsSample);
  const [webglFallback, setWebglFallback] = useState(false);

  eraRef.current = eraMode;
  fpsCbRef.current = onFpsSample;

  const is2K14Stage = eraMode === '2K14_CLASSIC';

  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    setWebglFallback(false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = is2K14Stage ? 1.12 : 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);

    host.innerHTML = '';
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Scene + Studio PBR Environment
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      44,
      (host.clientWidth || window.innerWidth) / Math.max(1, host.clientHeight || window.innerHeight),
      0.1,
      220
    );

    // Stage background + horizon fog
    if (is2K14Stage) {
      scene.background = new THREE.Color('#07090f');
      scene.fog = new THREE.FogExp2('#07090f', 0.022);
    } else {
      scene.background = new THREE.Color('#1a1423');
      scene.fog = new THREE.FogExp2('#291c28', 0.015);
    }

    // 3-Point Warm/Cool Lighting Rig
    const hemi = new THREE.HemisphereLight(
      is2K14Stage ? 0x94a3b8 : 0xfde68a,
      is2K14Stage ? 0x1e1b24 : 0x1e293b,
      is2K14Stage ? 0.65 : 0.95
    );
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(
      is2K14Stage ? 0xfff1d6 : 0xffb86c,
      is2K14Stage ? 2.1 : 2.35
    );
    keyLight.position.set(is2K14Stage ? 5 : 14, is2K14Stage ? 13 : 16, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      is2K14Stage ? 0xe11d48 : 0x38bdf8,
      is2K14Stage ? 1.45 : 1.1
    );
    rimLight.position.set(-9, 7, -8);
    scene.add(rimLight);

    // Court Floor (Hardwood 2K14 vs Painted Skyline Park 2K26)
    const courtTex = createHardwoodTexture(maxAniso, is2K14Stage);
    const floorMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: is2K14Stage ? 0.22 : 0.68,
      metalness: is2K14Stage ? 0.14 : 0.05,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Extended surrounding ground so outdoor scene never floats in an empty void
    const apronMat = new THREE.MeshStandardMaterial({
      color: is2K14Stage ? '#0a0d14' : '#182230',
      roughness: 0.85,
      metalness: 0.08,
    });
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), apronMat);
    apron.rotation.x = -Math.PI / 2;
    apron.position.y = -0.04;
    scene.add(apron);

    // Backlit Hoop
    const hoop = buildHoopStanchion(is2K14Stage, isSoftwareGl);
    hoop.position.set(0, 0, -7.8);
    scene.add(hoop);

    // Articulated Star Player (#6 Heat Crimson/Gold for 2K14, #2 / MyPLAYER Obsidian/Crimson for 2K26)
    const resolvedJersey = starJerseyNumber ?? (is2K14Stage ? 6 : 2);
    const resolvedPrimary = starPrimaryHex ?? (is2K14Stage ? '#98002e' : '#0f172a');
    const resolvedTrim = starTrimHex ?? (is2K14Stage ? '#f9a01b' : '#e11d48');
    const starRig = buildArticulatedStar(
      resolvedJersey,
      resolvedPrimary,
      resolvedTrim,
      is2K14Stage ? '#6c4128' : '#8a583b',
      is2K14Stage,
      maxAniso
    );
    starRig.root.position.set(is2K14Stage ? 0.2 : 0.6, 0, 0.2);
    scene.add(starRig.root);

    // Scene-specific architectural props
    const beamMeshes: THREE.Mesh[] = [];
    let diamondParticles: THREE.InstancedMesh | null = null;
    const particleSeeds: Array<{ x: number; y: number; z: number; speed: number; phase: number }> = [];
    let heliGroup: THREE.Group | null = null;
    let heliRotor: THREE.Mesh | null = null;
    let heliBeaconMat: THREE.MeshBasicMaterial | null = null;

    if (is2K14Stage) {
      // 2K14 Stadium Bowl Silhouettes (3 concentric stepped tiers)
      const tierMat = new THREE.MeshStandardMaterial({
        color: '#111622',
        roughness: 0.82,
        metalness: 0.12,
      });
      for (let t = 0; t < 3; t++) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(16 + t * 4.5, 14.5 + t * 4.5, 2.4, 32, 1, true),
          tierMat
        );
        ring.position.y = 1.6 + t * 2.5;
        ring.material.side = THREE.BackSide;
        scene.add(ring);
      }

      // Animated radial crimson/gold overhead spotlight beams
      const beamColors = [0xe11d48, 0xf59e0b, 0xbe123c, 0xfbbf24];
      for (let i = 0; i < 4; i++) {
        const coneMat = new THREE.MeshBasicMaterial({
          color: beamColors[i],
          transparent: true,
          opacity: 0.09,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.6, 13, 18, 1, true), coneMat);
        cone.position.set((i - 1.5) * 3.8, 6.6, -2.5 + (i % 2) * 2.2);
        cone.rotation.z = (i - 1.5) * 0.14;
        scene.add(cone);
        beamMeshes.push(cone);
      }

      // Floating translucent diamond particles (InstancedMesh)
      const count = 48;
      const dGeo = new THREE.OctahedronGeometry(0.14, 0);
      const dMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        emissive: '#e11d48',
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
        metalness: 0.8,
      });
      diamondParticles = new THREE.InstancedMesh(dGeo, dMat, count);
      diamondParticles.frustumCulled = false;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const rad = 3.2 + (i % 7) * 1.4;
        const seed = {
          x: Math.cos(angle) * rad,
          y: 0.8 + (i % 6) * 1.15,
          z: Math.sin(angle) * rad - 1.5,
          speed: 0.35 + (i % 5) * 0.14,
          phase: i * 0.7,
        };
        particleSeeds.push(seed);
        _dummyObj.position.set(seed.x, seed.y, seed.z);
        _dummyObj.scale.setScalar(0.75 + (i % 4) * 0.22);
        _dummyObj.updateMatrix();
        diamondParticles.setMatrixAt(i, _dummyObj.matrix);
        _tmpColor.set(i % 2 === 0 ? '#f59e0b' : '#f43f5e');
        diamondParticles.setColorAt(i, _tmpColor);
      }
      diamondParticles.instanceMatrix.needsUpdate = true;
      if (diamondParticles.instanceColor) diamondParticles.instanceColor.needsUpdate = true;
      diamondParticles.computeBoundingSphere();
      scene.add(diamondParticles);
    } else {
      // 2K26 Golden-Hour Sun Disc + Skyline Park Towers + Palm Trees + Neon Sign
      const sunMat = new THREE.MeshBasicMaterial({ color: '#fb923c' });
      const sun = new THREE.Mesh(new THREE.SphereGeometry(4.2, 20, 16), sunMat);
      sun.position.set(18, 17, -58);
      scene.add(sun);

      // Stylized City Skyline Buildings (InstancedMesh)
      const bCount = 28;
      const bGeo = new THREE.BoxGeometry(1, 1, 1);
      const bMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.55,
        metalness: 0.35,
      });
      const buildings = new THREE.InstancedMesh(bGeo, bMat, bCount);
      for (let i = 0; i < bCount; i++) {
        const angle = (i / bCount) * Math.PI * 1.65 - Math.PI * 0.82;
        const dist = 24 + (i % 4) * 5.5;
        const h = 8 + ((i * 7) % 18);
        const w = 3.2 + (i % 3) * 1.3;
        _dummyObj.position.set(Math.sin(angle) * dist, h / 2, -Math.cos(angle) * dist - 4);
        _dummyObj.scale.set(w, h, w);
        _dummyObj.rotation.set(0, angle * 0.2, 0);
        _dummyObj.updateMatrix();
        buildings.setMatrixAt(i, _dummyObj.matrix);
        _tmpColor.set(i % 3 === 0 ? '#1e293b' : i % 3 === 1 ? '#28203c' : '#17253a');
        buildings.setColorAt(i, _tmpColor);
      }
      buildings.instanceMatrix.needsUpdate = true;
      if (buildings.instanceColor) buildings.instanceColor.needsUpdate = true;
      buildings.computeBoundingSphere();
      scene.add(buildings);

      // Neon Rooftop Park Signboard
      const signPostMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4, metalness: 0.8 });
      const signGlowMat = new THREE.MeshStandardMaterial({
        color: '#e11d48',
        emissive: '#e11d48',
        emissiveIntensity: 1.1,
        roughness: 0.2,
      });
      const signFrame = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.35, 0.25), signPostMat);
      signFrame.position.set(0, 5.8, -11.5);
      const signBar = new THREE.Mesh(new THREE.BoxGeometry(7.7, 0.22, 0.32), signGlowMat);
      signBar.position.set(0, 6.38, -11.45);
      scene.add(signFrame, signBar);

      // Chain-link park fence posts along court perimeter
      const fenceMat = new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.45,
        metalness: 0.7,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const backFence = new THREE.Mesh(new THREE.PlaneGeometry(24, 3.6, 20, 6), fenceMat);
      backFence.position.set(0, 1.8, -11.8);
      scene.add(backFence);

      // Palm Trees framing Skyline Park
      scene.add(
        buildPalmTree(-10.5, -8.5, 1.15),
        buildPalmTree(10.8, -8.2, 1.05),
        buildPalmTree(-12.2, 2.5, 0.95),
        buildPalmTree(12.5, 3.0, 1.1)
      );

      // Slowly gliding distant City Helicopter / Skyline Aircraft
      heliGroup = new THREE.Group();
      const heliBodyMat = new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.32,
        metalness: 0.65,
      });
      const heliGlassMat = new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.15,
        metalness: 0.85,
      });
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.72, 0.82), heliBodyMat);
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.76), heliGlassMat);
      canopy.position.set(0.65, 0.06, 0);
      const tailBoom = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.22, 0.22), heliBodyMat);
      tailBoom.position.set(-1.6, 0.14, 0);
      const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.68, 0.12), heliBodyMat);
      tailFin.position.set(-2.45, 0.32, 0);
      heliRotor = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.06, 0.22),
        new THREE.MeshBasicMaterial({ color: '#cbd5e1' })
      );
      heliRotor.position.set(0, 0.54, 0);
      heliBeaconMat = new THREE.MeshBasicMaterial({ color: '#f43f5e' });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), heliBeaconMat);
      beacon.position.set(0, -0.42, 0);
      heliGroup.add(cabin, canopy, tailBoom, tailFin, heliRotor, beacon);
      heliGroup.position.set(-22, 16.5, -34);
      heliGroup.scale.setScalar(0.95);
      scene.add(heliGroup);
    }

    camera.position.set(is2K14Stage ? 4.8 : 7.5, is2K14Stage ? 2.5 : 4.2, is2K14Stage ? 6.8 : 9.4);
    camera.lookAt(0, 1.5, -1);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Handle context loss safely
    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    const onResize = () => {
      if (!host) return;
      const w = host.clientWidth || window.innerWidth;
      const h = Math.max(1, host.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop (rAF on GPU, afterDraw pacing on software WebGL)
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let fpsFrames = 0;
    let fpsAccum = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl && typeof gl.fenceSync === 'function' ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) {
          gl.deleteSync(sync);
          return;
        }
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.08, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      elapsed += dt;

      fpsFrames++;
      fpsAccum += dt;
      if (fpsAccum >= 0.65) {
        const sampled = Math.round(fpsFrames / fpsAccum);
        fpsCbRef.current?.(Math.min(120, Math.max(12, sampled)));
        fpsFrames = 0;
        fpsAccum = 0;
      }

      // Animate Articulated Star warm-up dribble & rhythmic bounce
      const dribbleCycle = Math.abs(Math.sin(elapsed * 4.4));
      starRig.ball.position.y = 0.15 + dribbleCycle * 0.88;
      starRig.ball.position.x = 0.38 + Math.sin(elapsed * 2.2) * 0.14;
      starRig.ball.rotation.x += dt * 4.8;
      starRig.ball.rotation.z += dt * 2.1;

      starRig.torso.position.y = 1.18 + Math.sin(elapsed * 4.4) * 0.045;
      starRig.torso.rotation.y = Math.sin(elapsed * 1.1) * 0.18;
      starRig.rightArm.rotation.x = -0.35 - dribbleCycle * 0.42;
      starRig.leftArm.rotation.x = -0.2 + Math.sin(elapsed * 2.2) * 0.16;
      starRig.leftLeg.rotation.x = Math.sin(elapsed * 2.2) * 0.09;
      starRig.rightLeg.rotation.x = -Math.sin(elapsed * 2.2) * 0.09;
      starRig.root.rotation.y = Math.sin(elapsed * 0.45) * 0.35;

      // Animate 2K14 beams & diamond particles
      if (is2K14Stage) {
        beamMeshes.forEach((cone, idx) => {
          cone.rotation.z = Math.sin(elapsed * 0.55 + idx * 1.3) * 0.24;
        });
        if (diamondParticles) {
          for (let i = 0; i < particleSeeds.length; i++) {
            const p = particleSeeds[i];
            const yBob = p.y + Math.sin(elapsed * p.speed + p.phase) * 0.55;
            _dummyObj.position.set(p.x, yBob, p.z);
            _dummyObj.rotation.set(elapsed * p.speed, elapsed * 0.7, 0);
            _dummyObj.scale.setScalar(0.85);
            _dummyObj.updateMatrix();
            diamondParticles.setMatrixAt(i, _dummyObj.matrix);
          }
          diamondParticles.instanceMatrix.needsUpdate = true;
        }

        // Slow broadcast orbit around center court
        const orbit = elapsed * 0.18;
        _camDesired.set(Math.sin(orbit) * 6.2, 2.35 + Math.sin(elapsed * 0.35) * 0.35, Math.cos(orbit) * 6.8 + 1.2);
        _camTarget.set(0.1, 1.45, -1.2);
      } else {
        // Gentle sweeping aerial drone pan over The City Skyline Park
        const pan = Math.sin(elapsed * 0.14);
        _camDesired.set(pan * 7.8, 3.8 + Math.cos(elapsed * 0.22) * 0.75, 8.6 + Math.cos(elapsed * 0.14) * 1.8);
        _camTarget.set(0.4, 1.55, -2.2);

        if (heliGroup) {
          const cycle = ((elapsed * 2.1) % 68) - 34;
          heliGroup.position.set(cycle, 16.2 + Math.sin(elapsed * 0.7) * 0.65, -33 + Math.cos(elapsed * 0.25) * 3.5);
          heliGroup.rotation.z = -0.08 + Math.sin(elapsed * 0.6) * 0.03;
        }
        if (heliRotor) {
          heliRotor.rotation.y += dt * 26;
        }
        if (heliBeaconMat) {
          heliBeaconMat.color.setHex(Math.sin(elapsed * 6.5) > 0 ? 0xf43f5e : 0xfbbf24);
        }
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _camDesired.x, 3.2, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _camDesired.y, 3.2, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _camDesired.z, 3.2, dt);
      camera.lookAt(_camTarget);

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
      courtTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [is2K14Stage, starJerseyNumber, starPrimaryHex, starTrimHex]);

  return (
    <div
      className={`h2k-stage3d-backdrop ${is2K14Stage ? 'era-2k14' : 'era-2k26'} ${webglFallback ? 'is-fallback' : ''}`}
      aria-hidden="true"
    >
      <div ref={mountRef} className="h2k-stage3d-mount" />
      <div className="h2k-stage3d-vignette" />
    </div>
  );
};
