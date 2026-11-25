// ============================================================================
// PART 6 — 60 FPS WALKABLE 3D PLAZA (Three.js Open-Air City Plaza)
// Features:
// - Composite 3-12 part procedural 12-Foot Golden Statue in Central Plaza
// - All 11 Glowing Landmark Portals + Skyline Park Outdoor Hoops
// - Composite Jogging/Sprinting MyPLAYER Avatar with equipped cosmetics
// - WASD / Arrow Keys + Shift Sprint + Mobile Touch Virtual Stick
// - Press [E] or Tap Interact button when near any portal to enter directly
// - RoomEnvironment PBR lighting, software-WebGL guard & full cleanup
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CITY_LANDMARKS,
  type CityLandmarkDef,
  type CityLandmarkId,
  type MyPlayerBuildSlot,
} from './modesTypes';

export interface WalkablePlaza3DProps {
  activeBuild: MyPlayerBuildSlot;
  onEnterLandmark: (landmarkId: CityLandmarkId) => void;
  onReturnToMap: () => void;
}

const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _moveDir = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function buildPlazaGroundTexture(maxAniso: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#182235';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    // Center inlaid plaza medallion rings
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.anisotropy = Math.min(8, maxAniso);
  return tex;
}

function createGoldenStatueGroup(): THREE.Group {
  const group = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.15,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.18,
    metalness: 0.92,
  });
  const glowRingMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.55,
    roughness: 0.3,
    metalness: 0.5,
  });

  // Pedestal base tiers
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.6, 24), marbleMat);
  base1.position.y = 0.3;
  base1.receiveShadow = true;
  group.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 1.1, 20), marbleMat);
  base2.position.y = 1.15;
  base2.castShadow = true;
  group.add(base2);

  const goldRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.09, 10, 32), glowRingMat);
  goldRing.rotation.x = Math.PI / 2;
  goldRing.position.y = 1.72;
  group.add(goldRing);

  // 12-foot Golden Legend Silhouette (composite torso, limbs, head, raised trophy ball)
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.9, 12), goldMat);
  legs.position.y = 2.65;
  legs.castShadow = true;
  group.add(legs);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.45, 0.65), goldMat);
  torso.position.y = 4.25;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 12), goldMat);
  head.position.y = 5.38;
  head.castShadow = true;
  group.add(head);

  const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.55, 10), goldMat);
  rightArm.position.set(0.68, 5.15, 0.15);
  rightArm.rotation.z = -0.35;
  group.add(rightArm);

  const goldenBall = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 14), glowRingMat);
  goldenBall.position.set(1.02, 6.02, 0.22);
  group.add(goldenBall);

  return group;
}

function createMyPlayerAvatarMesh(build: MyPlayerBuildSlot): {
  root: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
} {
  const root = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(build.cosmetics.skinTone || '#8d5524'),
    roughness: 0.62,
    metalness: 0.05,
  });
  const jerseyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(build.cosmetics.headbandColor || '#06b6d4'),
    roughness: 0.55,
    metalness: 0.1,
  });
  const shortsMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.65,
    metalness: 0.08,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(build.cosmetics.shoeColor || '#f59e0b'),
    roughness: 0.32,
    metalness: 0.25,
  });

  const heightScale = THREE.MathUtils.clamp((build.heightInches - 60) / 18, 0.88, 1.22);
  root.scale.setScalar(heightScale);

  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 0.22), skinMat);
  leftLeg.position.set(-0.16, 0.42, 0);
  leftLeg.castShadow = true;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 0.22), skinMat);
  rightLeg.position.set(0.16, 0.42, 0);
  rightLeg.castShadow = true;
  root.add(rightLeg);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
  leftShoe.position.set(0, -0.35, 0.05);
  leftLeg.add(leftShoe);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.34), shoeMat);
  rightShoe.position.set(0, -0.35, 0.05);
  rightLeg.add(rightShoe);

  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.36, 0.34), shortsMat);
  shorts.position.y = 0.88;
  root.add(shorts);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.32), jerseyMat);
  torso.position.y = 1.38;
  torso.castShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), skinMat);
  head.position.y = 1.94;
  head.castShadow = true;
  root.add(head);

  if (build.cosmetics.headband) {
    const hb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.07, 16),
      new THREE.MeshStandardMaterial({ color: build.cosmetics.headbandColor || '#f59e0b', roughness: 0.5 })
    );
    hb.position.y = 2.02;
    root.add(hb);
  }

  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), skinMat);
  leftArm.position.set(-0.39, 1.35, 0);
  root.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), skinMat);
  rightArm.position.set(0.39, 1.35, 0);
  root.add(rightArm);

  return { root, leftLeg, rightLeg, leftArm, rightArm };
}

function createPortalMonument(lm: CityLandmarkDef): THREE.Group {
  const g = new THREE.Group();
  const accent = new THREE.Color(lm.accent);

  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.8, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.3 })
  );
  pad.position.y = 0.09;
  g.add(pad);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.12, 10, 32),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.6,
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.24;
  g.add(ring);

  // Twin architectural arch pillars
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.55 });
  const leftP = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.6, 0.38), pillarMat);
  leftP.position.set(-1.95, 1.8, -0.5);
  leftP.castShadow = true;
  g.add(leftP);

  const rightP = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.6, 0.38), pillarMat);
  rightP.position.set(1.95, 1.8, -0.5);
  rightP.castShadow = true;
  g.add(rightP);

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.55, 0.46),
    new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.65,
    })
  );
  lintel.position.set(0, 3.7, -0.5);
  g.add(lintel);

  g.position.set(lm.worldX, 0, lm.worldZ);
  return g;
}

export const WalkablePlaza3D: React.FC<WalkablePlaza3DProps> = ({
  activeBuild,
  onEnterLandmark,
  onReturnToMap,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [nearestLandmark, setNearestLandmark] = useState<CityLandmarkDef | null>(null);
  const [speedMode, setSpeedMode] = useState<'JOG' | 'SPRINT'>('JOG');
  const touchVecRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const nearestRef = useRef<CityLandmarkDef | null>(null);
  const onEnterRef = useRef(onEnterLandmark);
  onEnterRef.current = onEnterLandmark;
  const onMapRef = useRef(onReturnToMap);
  onMapRef.current = onReturnToMap;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || 960, container.clientHeight || 540);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1326);
    scene.fog = new THREE.FogExp2(0x0a1326, 0.0115);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      55,
      (container.clientWidth || 960) / Math.max(1, container.clientHeight || 540),
      0.1,
      260
    );
    camera.position.set(0, 7.5, 16);

    // Warm key + Cool hemisphere + Rim
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.72);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.55);
    keyLight.position.set(22, 34, 18);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -45;
    keyLight.shadow.camera.right = 45;
    keyLight.shadow.camera.top = 45;
    keyLight.shadow.camera.bottom = -45;
    scene.add(keyLight);

    // Open-air plaza floor extending naturally to horizon
    const groundTex = buildPlazaGroundTexture(renderer.capabilities.getMaxAnisotropy());
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.72, metalness: 0.14 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Central Golden Statue
    const statue = createGoldenStatueGroup();
    scene.add(statue);

    // Skyline perimeter towers (instanced for draw-call efficiency)
    const towerGeo = new THREE.BoxGeometry(6, 26, 6);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x111c33, roughness: 0.55, metalness: 0.45 });
    const towerCount = 28;
    const towers = new THREE.InstancedMesh(towerGeo, towerMat, towerCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < towerCount; i++) {
      const ang = (i / towerCount) * Math.PI * 2;
      const rad = 54 + (i % 3) * 8;
      const hScale = 0.65 + ((i * 19) % 10) * 0.14;
      dummy.position.set(Math.cos(ang) * rad, 13 * hScale, Math.sin(ang) * rad);
      dummy.scale.set(1 + (i % 2) * 0.35, hScale, 1 + ((i + 1) % 2) * 0.35);
      dummy.rotation.y = ang;
      dummy.updateMatrix();
      towers.setMatrixAt(i, dummy.matrix);
    }
    towers.instanceMatrix.needsUpdate = true;
    towers.computeBoundingSphere();
    scene.add(towers);

    // Outdoor Skyline Park Court surface near North-West landmark
    const courtFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 16),
      new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.42, metalness: 0.12 })
    );
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.set(-22, 0.03, -20);
    scene.add(courtFloor);

    // All 11 Glowing Landmark Portals (skip central statue overlap by offsetting Central Plaza kiosk slightly)
    const portalRings: THREE.Object3D[] = [];
    CITY_LANDMARKS.forEach((lm) => {
      if (lm.id === 'CENTRAL_PLAZA') return;
      const monument = createPortalMonument(lm);
      scene.add(monument);
      portalRings.push(monument.children[1]);
    });

    // Player Avatar
    const avatar = createMyPlayerAvatarMesh(activeBuild);
    avatar.root.position.set(0, 0, 8);
    scene.add(avatar.root);

    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.add(k);
      if (k === 'e' && nearestRef.current) {
        onEnterRef.current(nearestRef.current.id);
      } else if (k === 'm') {
        onMapRef.current();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 960;
      const h = Math.max(1, container.clientHeight || 540);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let disposed = false;
    let frameId = 0;
    let lastTs = performance.now();
    let walkPhase = 0;
    let yaw = Math.PI;
    let uiSyncAccum = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 6);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 75);
        }
      };
      frameId = window.setTimeout(poll, 6);
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTs) / 1000));
      lastTs = now;

      let ix = touchVecRef.current.x;
      let iz = touchVecRef.current.z;
      if (keys.has('a') || keys.has('arrowleft')) ix -= 1;
      if (keys.has('d') || keys.has('arrowright')) ix += 1;
      if (keys.has('w') || keys.has('arrowup')) iz -= 1;
      if (keys.has('s') || keys.has('arrowdown')) iz += 1;

      const sprinting = keys.has('shift');
      _moveDir.set(ix, 0, iz);
      const mag = _moveDir.length();
      if (mag > 0.08) {
        _moveDir.normalize();
        const moveSpeed = sprinting ? 14.5 : 8.5;
        avatar.root.position.x = THREE.MathUtils.clamp(
          avatar.root.position.x + _moveDir.x * moveSpeed * dt,
          -36,
          36
        );
        avatar.root.position.z = THREE.MathUtils.clamp(
          avatar.root.position.z + _moveDir.z * moveSpeed * dt,
          -36,
          36
        );
        const targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
        let diff = targetYaw - yaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        yaw += diff * Math.min(1, dt * 11);
        avatar.root.rotation.y = yaw;

        walkPhase += dt * (sprinting ? 14 : 9);
        const swing = Math.sin(walkPhase) * 0.55;
        avatar.leftLeg.rotation.x = swing;
        avatar.rightLeg.rotation.x = -swing;
        avatar.leftArm.rotation.x = -swing * 0.8;
        avatar.rightArm.rotation.x = swing * 0.8;
      } else {
        avatar.leftLeg.rotation.x *= 0.85;
        avatar.rightLeg.rotation.x *= 0.85;
        avatar.leftArm.rotation.x *= 0.85;
        avatar.rightArm.rotation.x *= 0.85;
      }

      // Smooth golden statue rotation & portal hover pulse
      statue.rotation.y += dt * 0.22;
      for (let i = 0; i < portalRings.length; i++) {
        portalRings[i].rotation.z += dt * 0.7;
      }

      // Smooth third-person follow camera
      _camDesired.set(
        avatar.root.position.x,
        avatar.root.position.y + 6.4,
        avatar.root.position.z + 11.5
      );
      camera.position.lerp(_camDesired, 1 - Math.exp(-6.5 * dt));
      _camTarget.set(avatar.root.position.x, avatar.root.position.y + 1.8, avatar.root.position.z - 2);
      camera.lookAt(_camTarget);

      // Proximity landmark detection (throttled ~10 Hz to avoid React spam)
      uiSyncAccum += dt;
      if (uiSyncAccum >= 0.1) {
        uiSyncAccum = 0;
        let closest: CityLandmarkDef | null = null;
        let bestDist = 6.2;
        for (let i = 0; i < CITY_LANDMARKS.length; i++) {
          const lm = CITY_LANDMARKS[i];
          const dx = avatar.root.position.x - lm.worldX;
          const dz = avatar.root.position.z - lm.worldZ;
          const d = Math.hypot(dx, dz);
          if (d < bestDist) {
            bestDist = d;
            closest = lm;
          }
        }
        if ((closest && closest.id) !== (nearestRef.current && nearestRef.current.id)) {
          nearestRef.current = closest;
          setNearestLandmark(closest);
        }
        setSpeedMode(sprinting ? 'SPRINT' : 'JOG');
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      envTex.dispose();
      groundTex.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [activeBuild]);

  const handleTouchMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.42;
    const dx = Math.max(-maxR, Math.min(maxR, e.clientX - cx));
    const dy = Math.max(-maxR, Math.min(maxR, e.clientY - cy));
    setKnobOffset({ x: dx, y: dy });
    touchVecRef.current = { x: dx / maxR, z: dy / maxR };
  };

  const resetTouchStick = () => {
    setKnobOffset({ x: 0, y: 0 });
    touchVecRef.current = { x: 0, z: 0 };
  };

  return (
    <div className="h2k-plaza-root">
      <div ref={mountRef} className="h2k-plaza-canvas" />

      {/* Proximity Portal Entry Prompt */}
      {nearestLandmark && (
        <div className="h2k-plaza-prompt">
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
              {nearestLandmark.district}
            </div>
            <strong style={{ fontSize: 15 }}>
              {nearestLandmark.icon} {nearestLandmark.name}
            </strong>
          </div>
          <button
            type="button"
            className="h2k-mode-btn primary"
            onClick={() => onEnterLandmark(nearestLandmark.id)}
          >
            [E] Enter Landmark
          </button>
        </div>
      )}

      {/* Touch Virtual Joystick for Mobile/Tablet Plaza Jogging */}
      <div
        className="h2k-plaza-touch-stick"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handleTouchMove(e);
        }}
        onPointerMove={handleTouchMove}
        onPointerUp={resetTouchStick}
        onPointerCancel={resetTouchStick}
        aria-label="Walkable 3D Plaza Movement Stick"
      >
        <div
          className="h2k-plaza-touch-knob"
          style={{ transform: `translate(calc(-50% + ${knobOffset.x}px), calc(-50% + ${knobOffset.y}px))` }}
        />
      </div>

      {/* Compact Unobtrusive Bottom Dock */}
      <div className="h2k-plaza-dock">
        <span className="h2k-muted" style={{ whiteSpace: 'nowrap' }}>
          <strong style={{ color: '#f8fafc' }}>{activeBuild.name}</strong> ({activeBuild.ovr} OVR) ·{' '}
          {speedMode} · WASD / Stick Move · Shift Sprint · E Enter
        </span>
        <button type="button" className="h2k-mode-btn cyan" onClick={onReturnToMap}>
          🗺️ [M] 2.5D City Map
        </button>
      </div>
    </div>
  );
};
