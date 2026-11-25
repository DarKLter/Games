import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { detectSoftwareWebGL } from '../../../../core/threeShared';
import { getMlbbHeroById } from '../data/heroes';
import { buildMlbbHeroRig3D, HeroRig3D, hexToInt } from '../engine/ThreeHeroModels';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

export interface HeroShowcasePoseSignal {
  nonce: number;
  color?: string;
  label?: string;
}

interface HeroShowcase3DProps {
  heroId: string;
  skinId: string;
  poseSignal?: HeroShowcasePoseSignal | null;
  onTapHero?: () => void;
}

function disposeThreeGroup(group: THREE.Object3D): void {
  group.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (m.geometry && !m.geometry.userData?.noDispose) m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      if (!mat || mat.userData?.noDispose) continue;
      mat.dispose();
    }
  });
}

/**
 * Interactive 3D Rotatable Champion Showcase for the 133-Hero Gallery.
 * - Drag horizontally/vertically (mouse or touch) for damped 360° orbit + pitch inspection.
 * - Tap the champion or click any Skill Preview card (`poseSignal`) to trigger a combat pose + expanding shockwave ring.
 * - Swaps champion rigs and 5-tier skin palettes in-place without recreating the WebGL context.
 * - Software-WebGL guarded with clean 2D portrait fallback.
 */
export const HeroShowcase3D: React.FC<HeroShowcase3DProps> = ({
  heroId,
  skinId,
  poseSignal,
  onTapHero
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const targetRotYRef = useRef(0.35);
  const currentRotYRef = useRef(0.35);
  const targetPitchRef = useRef(0.14);
  const currentPitchRef = useRef(0.14);
  const poseTimerRef = useRef(0);
  const dragRef = useRef<{ startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);

  const sceneSlotRef = useRef<{
    heroAnchor: THREE.Group;
    heroRig: HeroRig3D | null;
    accentLight: THREE.PointLight;
    runeMat: THREE.MeshBasicMaterial;
    innerRuneMat: THREE.MeshBasicMaterial;
    shockMat: THREE.MeshBasicMaterial;
    shockRing: THREE.Mesh;
  } | null>(null);

  const hero = getMlbbHeroById(heroId);
  const skin = hero.skins.find((s) => s.id === skinId) ?? hero.skins[0];

  // Mount persistent WebGL showcase studio once
  useEffect(() => {
    const host = hostRef.current;
    if (!host || webglFailed) return;

    let renderer: THREE.WebGLRenderer;
    const isSoft = detectSoftwareWebGL();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSoft, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.setPixelRatio(isSoft ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isSoft;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    } catch {
      setWebglFailed(true);
      return;
    }

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);

    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d1f);
    scene.fog = new THREE.FogExp2(0x0b132b, 0.035);

    let envTex: THREE.Texture | null = null;
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTex = pmrem.fromScene(roomEnv, 0.04).texture;
      roomEnv.dispose();
      pmrem.dispose();
      scene.environment = envTex;
    } catch {
      envTex = null;
    }

    const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.2, 120);
    camera.position.set(0, 2.75, 6.9);
    camera.lookAt(0, 1.55, 0);

    // Subtle royal-navy radial backdrop sphere
    const skyGeo = new THREE.SphereGeometry(55, 20, 14);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x050915) },
        uMid: { value: new THREE.Color(0x0c1736) },
        uHorizon: { value: new THREE.Color(0x1b3463) }
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uHorizon;
        varying vec3 vPos;
        void main() {
          vec3 n = normalize(vPos);
          float h = clamp(n.y, -0.3, 1.0);
          vec3 col = h < 0.15
            ? mix(uHorizon, uMid, smoothstep(-0.18, 0.15, h))
            : mix(uMid, uTop, smoothstep(0.15, 0.72, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // 3-Point Studio Lighting (Warm Gold Key + Celestial Azure Fill + Dynamic Skin Accent Rim)
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0b132b, 1.0);
    const key = new THREE.DirectionalLight(0xffe8b0, 2.35);
    key.position.set(6, 10, 7);
    if (!isSoft) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const d = 6;
      key.shadow.camera.left = -d;
      key.shadow.camera.right = d;
      key.shadow.camera.top = d;
      key.shadow.camera.bottom = -d;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
    }
    const rimFill = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimFill.position.set(-7, 5, 3);
    const accentLight = new THREE.PointLight(0xe6b84c, 4.5, 16);
    accentLight.position.set(-2.6, 3.6, -2.5);
    scene.add(hemi, key, rimFill, accentLight);

    // Sculpted Obsidian & Gold Runic Pedestal
    const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0f1c3b, roughness: 0.34, metalness: 0.48 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x162952, roughness: 0.5, metalness: 0.32 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe6b84c,
      emissive: 0x8a580e,
      emissiveIntensity: 0.35,
      roughness: 0.24,
      metalness: 0.88
    });

    const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.65, 0.36, 28), obsidianMat);
    baseDisc.position.y = -0.36;
    baseDisc.receiveShadow = true;

    const topPlinth = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.55, 0.24, 28), stoneMat);
    topPlinth.position.y = -0.12;
    topPlinth.receiveShadow = true;

    const goldBevel = new THREE.Mesh(new THREE.TorusGeometry(2.36, 0.045, 10, 48), goldMat);
    goldBevel.rotation.x = Math.PI / 2;
    goldBevel.position.y = 0.01;

    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const outerRune = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.92, 48), runeMat);
    outerRune.rotation.x = -Math.PI / 2;
    outerRune.position.y = 0.02;

    const innerRuneMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const innerRune = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.2, 36), innerRuneMat);
    innerRune.rotation.x = -Math.PI / 2;
    innerRune.position.y = 0.025;

    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffe28a,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const shockRing = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.22, 40), shockMat);
    shockRing.rotation.x = -Math.PI / 2;
    shockRing.position.y = 0.05;

    scene.add(baseDisc, topPlinth, goldBevel, outerRune, innerRune, shockRing);

    // Floating golden dust motes
    const moteCount = isSoft ? 28 : 54;
    const moteGeo = new THREE.BufferGeometry();
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const ang = Math.random() * Math.PI * 2;
      const rad = 1.6 + Math.random() * 4.2;
      motePos[i * 3] = Math.cos(ang) * rad;
      motePos[i * 3 + 1] = 0.2 + Math.random() * 4.5;
      motePos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xfde68a,
      size: 0.085,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    const heroAnchor = new THREE.Group();
    heroAnchor.position.set(0, 0.02, 0);
    scene.add(heroAnchor);

    sceneSlotRef.current = {
      heroAnchor,
      heroRig: null,
      accentLight,
      runeMat,
      innerRuneMat,
      shockMat,
      shockRing
    };

    const resize = () => {
      const w = Math.max(120, host.clientWidth);
      const h = Math.max(120, host.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let rafId = 0;
    let lastTs = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      elapsed += dt;

      if (!dragRef.current) {
        targetRotYRef.current += dt * 0.22;
      }
      currentRotYRef.current += (targetRotYRef.current - currentRotYRef.current) * Math.min(1, dt * 8);
      currentPitchRef.current += (targetPitchRef.current - currentPitchRef.current) * Math.min(1, dt * 8);

      heroAnchor.rotation.y = currentRotYRef.current;

      // Subtle camera elevation from pitch drag
      camera.position.y = 2.45 + currentPitchRef.current * 2.2;
      camera.lookAt(0, 1.5, 0);

      outerRune.rotation.z = elapsed * 0.35;
      innerRune.rotation.z = -elapsed * 0.55;
      motes.rotation.y = elapsed * 0.08;

      const slot = sceneSlotRef.current;
      if (slot && slot.heroRig) {
        const rig = slot.heroRig;
        const bob = Math.sin(elapsed * 2.4) * 0.045;

        if (poseTimerRef.current > 0) {
          poseTimerRef.current = Math.max(0, poseTimerRef.current - dt);
          const p = 1 - poseTimerRef.current / 0.85;
          const arc = Math.sin(p * Math.PI);
          rig.group.position.y = bob + arc * 0.42;
          rig.weaponPivot.rotation.x = -arc * 1.48;
          rig.leftArm.rotation.x = arc * 0.58;
          rig.capePivot.rotation.x = 0.18 + arc * 0.45;
          const ringScale = 0.9 + p * 2.3;
          shockRing.scale.set(ringScale, ringScale, 1);
          shockMat.opacity = Math.max(0, (1 - p) * 0.88);
        } else {
          rig.group.position.y = bob;
          rig.weaponPivot.rotation.x = Math.sin(elapsed * 1.9) * 0.1;
          rig.leftArm.rotation.x = -Math.sin(elapsed * 1.9) * 0.08;
          rig.capePivot.rotation.x = 0.14 + Math.sin(elapsed * 2.9) * 0.06;
          shockMat.opacity = 0;
        }
        rig.headGroup.rotation.y = Math.sin(elapsed * 1.1) * 0.12;
      }

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost, false);
      if (sceneSlotRef.current?.heroRig) {
        disposeThreeGroup(sceneSlotRef.current.heroRig.group);
      }
      sceneSlotRef.current = null;
      disposeThreeGroup(scene);
      if (envTex) envTex.dispose();
      renderer.dispose();
    };
  }, [webglFailed]);

  // Swap 3D champion rig & skin colors in-place whenever hero or skin changes
  useEffect(() => {
    const slot = sceneSlotRef.current;
    if (!slot || webglFailed) return;

    if (slot.heroRig) {
      slot.heroAnchor.remove(slot.heroRig.group);
      disposeThreeGroup(slot.heroRig.group);
      slot.heroRig = null;
    }

    const rig = buildMlbbHeroRig3D(hero.role, skin.color, skin.accent, 'blue', true, 1.56);
    rig.baseRing.visible = false;
    slot.heroAnchor.add(rig.group);
    slot.heroRig = rig;

    const primaryInt = hexToInt(skin.color);
    const accentInt = hexToInt(skin.accent);
    slot.accentLight.color.setHex(accentInt);
    slot.runeMat.color.setHex(primaryInt);
    slot.innerRuneMat.color.setHex(accentInt);
    slot.shockMat.color.setHex(accentInt);
    poseTimerRef.current = 0.55;
  }, [hero, skin, webglFailed]);

  // Trigger combat pose + skill-colored shockwave when user clicks a Skill Preview card
  useEffect(() => {
    if (!poseSignal || !poseSignal.nonce) return;
    poseTimerRef.current = 0.85;
    if (sceneSlotRef.current && poseSignal.color) {
      sceneSlotRef.current.shockMat.color.setHex(hexToInt(poseSignal.color));
      sceneSlotRef.current.accentLight.color.setHex(hexToInt(poseSignal.color));
    }
  }, [poseSignal]);

  const triggerPose = () => {
    poseTimerRef.current = 0.85;
    if (sceneSlotRef.current) {
      sceneSlotRef.current.shockMat.color.setHex(hexToInt(skin.accent));
    }
    mlbbAudio.playClick();
    onTapHero?.();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    if (Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY) > 6) {
      dragRef.current.moved = true;
    }
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    targetRotYRef.current += dx * 0.012;
    targetPitchRef.current = Math.max(-0.08, Math.min(0.42, targetPitchRef.current + dy * 0.004));
  };

  const handlePointerUp = () => {
    if (dragRef.current && !dragRef.current.moved) {
      triggerPose();
    }
    dragRef.current = null;
  };

  return (
    <div
      className="relative w-full h-full select-none overflow-hidden rounded-xl border border-[#E6B84C]/35 bg-[#070D1F] cursor-grab active:cursor-grabbing touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current = null;
      }}
    >
      {webglFailed ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 42%, ${skin.color}38 0%, #0B132B 62%, #050915 100%)`
          }}
        >
          <div className="transition-transform duration-300 hover:scale-105">
            <HeroPortraitSvg heroId={hero.id} skinColor={skin.color} skinAccent={skin.accent} size={118} />
          </div>
          <div className="mt-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
            2D Champion Preview
          </div>
        </div>
      ) : (
        <div ref={hostRef} className="absolute inset-0 w-full h-full" />
      )}

      {/* Subtle Corner Hints (No backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-2.5 left-3 flex items-center gap-2">
        <span className="text-[10px] font-black tracking-widest uppercase text-[#FFE28A] drop-shadow">
          {skin.tag} · {skin.name}
        </span>
      </div>
      <div className="pointer-events-none absolute top-2.5 right-3 text-[10px] font-bold text-slate-300/80">
        Drag 360° · Tap to Pose
      </div>
      {poseSignal?.label && (
        <div className="pointer-events-none absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-[#070D1F]/90 border border-[#E6B84C]/45 text-[10px] font-black text-[#FFE28A]">
          Preview: {poseSignal.label}
        </div>
      )}
    </div>
  );
};
