import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { detectSoftwareWebGL } from '../../../../core/threeShared';
import { getViewportSize, subscribeViewport } from '../../../../core/viewport';
import { getMlbbHeroById, MLBB_ALL_HEROES } from '../data/heroes';
import { buildMlbbHeroRig3D, HeroRig3D, hexToInt } from '../engine/ThreeHeroModels';
import { HeroPortraitSvg, LobbySanctuaryCanvas } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

const HERO_VOICE_LINES: Record<string, string[]> = {
  Tank: ['"I will shield the Land of Dawn with my life!"', '"Stand behind me — none shall pass!"'],
  Fighter: ['"Every battle sharpens my blade!"', '"Victory favors the relentless!"'],
  Assassin: ['"Strike from the shadows, vanish before dawn!"', '"One blade, one elimination!"'],
  Mage: ['"Arcane wisdom bends the battlefield to my will!"', '"Witness the brilliance of true magic!"'],
  Marksman: ['"My aim never wavers across the Land of Dawn!"', '"Keep your distance — or fall!"'],
  Support: ['"Together, our light will never fade!"', '"Stay close, I have your back!"']
};

interface LobbySanctuary3DProps {
  heroId: string;
  skinId?: string;
  ownedHeroIds: string[];
  onSwitchHero: (heroId: string) => void;
}

function disposeGroup(group: THREE.Object3D): void {
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
 * Dark Royal Navy Celestial MLBB 3D Sanctuary Lobby Turntable:
 * - Deep Royal Navy (#0B132B) & Celestial Blue (#1B3B6F) celestial sky dome with golden horizon haze
 * - Drifting volumetric golden-azure sunbeams, floating dark-obsidian carved monoliths & glowing rune pedestal
 * - Animated nebula clouds & rising luminous golden/cyan embers
 * - Close-up sculpted 16+ part 3D champion rig with smooth damped 360° orbit + pitch tilt
 * - Tap champion for dramatic 3D combat pose + expanding golden shockwave ring + voice caption & SFX
 */
export const LobbySanctuary3D: React.FC<LobbySanctuary3DProps> = ({
  heroId,
  skinId,
  ownedHeroIds,
  onSwitchHero
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const [voiceLine, setVoiceLine] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const targetRotYRef = useRef(0.32);
  const currentRotYRef = useRef(0.32);
  const targetPitchRef = useRef(0.16);
  const currentPitchRef = useRef(0.16);
  const poseTimerRef = useRef(0);
  const dragRef = useRef<{ startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);

  // Persistent Three.js scene slots so switching heroes never destroys the WebGL context
  const sceneSlotRef = useRef<{
    heroAnchor: THREE.Group;
    heroRig: HeroRig3D | null;
    accentLight: THREE.PointLight;
    runeMat: THREE.MeshBasicMaterial;
    innerRuneMat: THREE.MeshBasicMaterial;
    shockMat: THREE.MeshBasicMaterial;
  } | null>(null);

  const hero = getMlbbHeroById(heroId);
  const skin = hero.skins.find((s) => s.id === skinId) ?? hero.skins[0];

  // Mount persistent Dark Royal Navy Celestial 3D Sanctuary once
  useEffect(() => {
    const host = hostRef.current;
    if (!host || webglFailed) return;

    let renderer: THREE.WebGLRenderer;
    const isSoft = detectSoftwareWebGL();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !isSoft, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      renderer.setPixelRatio(isSoft ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = !isSoft;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    } catch {
      setWebglFailed(true);
      return;
    }

    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d1f);
    scene.fog = new THREE.FogExp2(0x0b132b, 0.017);

    // Safe isolated PMREM studio reflection setup (never falls back to 2D if float FBO unavailable)
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

    const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.2, 220);
    camera.position.set(0, 3.4, 8.2);
    camera.lookAt(0, 1.9, 0);

    // Dark Royal Navy Celestial Sky Dome (#050A18 -> #0B132B -> #1B3B6F with subtle golden horizon glow)
    const skyGeo = new THREE.SphereGeometry(140, 24, 16);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color(0x050a18) },
        uMid: { value: new THREE.Color(0x0b132b) },
        uHorizon: { value: new THREE.Color(0x1b3b6f) },
        uGlow: { value: new THREE.Color(0x524022) }
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
        uniform vec3 uGlow;
        varying vec3 vPos;
        void main() {
          vec3 n = normalize(vPos);
          float h = clamp(n.y, -0.25, 1.0);
          vec3 col = h < 0.14
            ? mix(uHorizon, uMid, smoothstep(-0.12, 0.14, h))
            : mix(uMid, uTop, smoothstep(0.14, 0.72, h));
          float horizonBand = exp(-abs(h - 0.02) * 9.0) * smoothstep(-0.4, 0.6, -n.z);
          col += uGlow * horizonBand * 0.55;
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // Dramatic 3-Point Celestial Studio Lighting (Warm Gold Key + Celestial Azure Fill + Hero Accent Rim)
    const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x0b132b, 0.95);
    const key = new THREE.DirectionalLight(0xffe7aa, 2.35);
    key.position.set(7.5, 13.5, 8.5);
    if (!isSoft) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const d = 10;
      key.shadow.camera.left = -d;
      key.shadow.camera.right = d;
      key.shadow.camera.top = d;
      key.shadow.camera.bottom = -d;
      key.shadow.bias = -0.0005;
      key.shadow.normalBias = 0.02;
    }
    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 0.95);
    cyanFill.position.set(-9, 6, 4);

    const accentLight = new THREE.PointLight(0xe6b84c, 4.2, 20);
    accentLight.position.set(-3.6, 4.2, -3.4);
    scene.add(hemi, key, cyanFill, accentLight);

    // Multi-Tiered Obsidian-Navy & Luminous Metallic Gold Runic Pedestal
    const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x0f1b38, roughness: 0.36, metalness: 0.45 });
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x16264b, roughness: 0.55, metalness: 0.32 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe6b84c,
      emissive: 0x9a6412,
      emissiveIntensity: 0.38,
      roughness: 0.22,
      metalness: 0.9
    });

    const terrace = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 9.8, 1.2, 24), obsidianMat);
    terrace.position.y = -1.2;
    terrace.receiveShadow = true;

    const plinthLow = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.85, 0.42, 24), darkStoneMat);
    plinthLow.position.y = -0.42;
    plinthLow.receiveShadow = true;

    const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.78, 0.26, 24), obsidianMat);
    plinthTop.position.y = -0.11;
    plinthTop.receiveShadow = true;

    const goldRim = new THREE.Mesh(new THREE.TorusGeometry(2.52, 0.085, 10, 44), goldMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = 0.02;

    const lowerGoldRim = new THREE.Mesh(new THREE.TorusGeometry(3.42, 0.055, 8, 44), goldMat);
    lowerGoldRim.rotation.x = Math.PI / 2;
    lowerGoldRim.position.y = -0.22;

    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    });
    const outerRuneRing = new THREE.Mesh(new THREE.RingGeometry(2.96, 3.24, 48), runeMat);
    outerRuneRing.rotation.x = -Math.PI / 2;
    outerRuneRing.position.y = -0.17;

    const innerRuneMat = new THREE.MeshBasicMaterial({
      color: 0xffe28a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });
    const innerRuneRing = new THREE.Mesh(new THREE.RingGeometry(1.72, 1.88, 36), innerRuneMat);
    innerRuneRing.rotation.x = -Math.PI / 2;
    innerRuneRing.position.y = 0.035;

    // 3D Tap-to-Pose Expanding Golden-Cyan Shockwave Ring
    const shockMat = new THREE.MeshBasicMaterial({
      color: 0xffe28a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const shockRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.48, 36), shockMat);
    shockRing.rotation.x = -Math.PI / 2;
    shockRing.position.y = 0.14;
    shockRing.visible = false;

    scene.add(terrace, plinthLow, plinthTop, goldRim, lowerGoldRim, outerRuneRing, innerRuneRing, shockRing);

    // Drifting Volumetric Golden-Azure Sunbeams / Celestial Light Shafts
    const beamGroup = new THREE.Group();
    const beamConfigs = [
      { x: -4.2, z: -8.5, rotZ: -0.24, color: 0xffe28a, op: 0.085, w: 3.4 },
      { x: 0.6, z: -9.5, rotZ: -0.14, color: 0x38bdf8, op: 0.075, w: 4.2 },
      { x: 5.1, z: -8.2, rotZ: -0.2, color: 0xe6b84c, op: 0.08, w: 3.1 }
    ];
    for (const b of beamConfigs) {
      const mat = new THREE.MeshBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: b.op,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(b.w, 22), mat);
      beam.position.set(b.x, 7.2, b.z);
      beam.rotation.z = b.rotZ;
      beamGroup.add(beam);
    }
    scene.add(beamGroup);

    // Floating Carved Dark-Obsidian & Gold Monoliths + Hovering Celestial Crystals
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.15,
      roughness: 0.15,
      metalness: 0.65
    });
    const floatingMonoliths: { group: THREE.Group; baseY: number; phase: number }[] = [];
    const crystalCaps: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = -Math.PI * 0.86 + (i / 5) * Math.PI * 0.72;
      const distR = 9.4 + (i % 2) * 2.1;
      const px = Math.cos(ang) * distR;
      const pz = Math.sin(ang) * distR - 2.4;
      const h = 4.4 + (i % 3) * 1.15;

      const mGroup = new THREE.Group();
      const baseY = 0.6 + (i % 2) * 0.55;
      mGroup.position.set(px, baseY, pz);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.62, h, 6), darkStoneMat);
      shaft.position.y = h * 0.5;
      shaft.castShadow = true;

      const capGold = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.54, 0.28, 6), goldMat);
      capGold.position.y = h + 0.1;

      const runeBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.04, 8, 24),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x38bdf8 : 0xffe28a })
      );
      runeBand.rotation.x = Math.PI / 2;
      runeBand.position.y = h * 0.62;

      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.44, 0), crystalMat);
      gem.position.y = h + 1.15;
      crystalCaps.push(gem);

      mGroup.add(shaft, capGold, runeBand, gem);
      scene.add(mGroup);
      floatingMonoliths.push({ group: mGroup, baseY, phase: i * 1.05 });
    }

    // Distant Celestial Sanctuary Peaks & Animated Dark-Azure Nebula Clouds
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x0f1d3d, roughness: 0.9, metalness: 0.12 });
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const r = 44 + (i % 3) * 12;
      const h = 15 + (i % 4) * 5;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(9 + (i % 3) * 3, h, 6), peakMat);
      peak.position.set(Math.cos(ang) * r, h * 0.25 - 6, Math.sin(ang) * r - 12);
      scene.add(peak);
    }

    const cloudMat = new THREE.MeshBasicMaterial({ color: 0x1b3b6f, transparent: true, opacity: 0.34 });
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const c = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8 + (i % 3) * 1.15, 1), cloudMat);
      c.scale.set(2.6, 0.52, 1.2);
      c.position.set((i - 7) * 7.8, 8.8 + (i % 4) * 2.1, -26 - (i % 5) * 7);
      cloudGroup.add(c);
    }
    scene.add(cloudGroup);

    // Rising Luminous Golden Embers + Starfield Dust
    const emberCount = 96;
    const pos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 9 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    const emberGeo = new THREE.BufferGeometry();
    emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xffe28a,
      size: 0.16,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    const starCount = 120;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.45;
      const rad = 75 + Math.random() * 25;
      starPos[i * 3] = Math.sin(phi) * Math.cos(theta) * rad;
      starPos[i * 3 + 1] = Math.cos(phi) * rad * 0.65 + 4;
      starPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.42,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
    scene.add(new THREE.Points(starGeo, starMat));

    const heroAnchor = new THREE.Group();
    scene.add(heroAnchor);

    sceneSlotRef.current = {
      heroAnchor,
      heroRig: null,
      accentLight,
      runeMat,
      innerRuneMat,
      shockMat
    };

    let disposed = false;
    let rafId = 0;
    let t0 = performance.now();

    const resize = () => {
      if (disposed) return;
      const vp = getViewportSize();
      const w = Math.max(300, Math.floor(host.clientWidth || vp.width || window.innerWidth));
      const h = Math.max(200, Math.floor(host.clientHeight || vp.height || window.innerHeight));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(host);
    }
    const unsubViewport = subscribeViewport(resize);
    window.addEventListener('resize', resize);

    const onLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', onLost);

    const animate = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - t0) / 1000));
      t0 = now;
      const sec = now * 0.001;

      if (!dragRef.current) {
        targetRotYRef.current += dt * 0.24;
      }
      currentRotYRef.current = THREE.MathUtils.damp(currentRotYRef.current, targetRotYRef.current, 10, dt);
      currentPitchRef.current = THREE.MathUtils.damp(currentPitchRef.current, targetPitchRef.current, 10, dt);

      const camDist = 8.1;
      const camY = 2.0 + Math.sin(currentPitchRef.current) * 4.6 + 1.05;
      const camZ = Math.cos(currentPitchRef.current) * camDist;
      camera.position.set(0, camY, camZ);
      camera.lookAt(0, 1.9, 0);

      const rig = sceneSlotRef.current?.heroRig;
      if (rig) {
        let liftY = 0;
        if (poseTimerRef.current > 0) {
          poseTimerRef.current = Math.max(0, poseTimerRef.current - dt);
          const p = 1 - poseTimerRef.current / 0.9;
          const arc = Math.sin(p * Math.PI);
          liftY = arc * 0.72;
          rig.weaponPivot.rotation.x = -arc * 1.55;
          rig.leftArm.rotation.x = arc * 0.55;
          rig.capePivot.rotation.x = 0.2 + arc * 0.5;
          shockRing.visible = true;
          shockRing.scale.setScalar(0.85 + p * 2.5);
          shockMat.opacity = (1 - p) * 0.94;
        } else {
          rig.weaponPivot.rotation.x = Math.sin(sec * 2.1) * 0.1;
          rig.leftArm.rotation.x = -Math.sin(sec * 2.1) * 0.08;
          rig.capePivot.rotation.x = 0.14 + Math.sin(sec * 3.1) * 0.07;
          shockRing.visible = false;
        }
        rig.group.position.y = liftY + Math.sin(sec * 2.2) * 0.04;
        rig.bodyGroup.rotation.y = currentRotYRef.current;
        rig.headGroup.rotation.y = Math.sin(sec * 1.1) * 0.12;
      }

      outerRuneRing.rotation.z = sec * 0.42;
      innerRuneRing.rotation.z = -sec * 0.65;
      beamGroup.position.x = Math.sin(sec * 0.28) * 1.15;

      for (let i = 0; i < floatingMonoliths.length; i++) {
        const m = floatingMonoliths[i];
        m.group.position.y = m.baseY + Math.sin(sec * 0.9 + m.phase) * 0.34;
        crystalCaps[i].rotation.y = sec * 1.35 + i;
      }
      cloudGroup.position.x = Math.sin(sec * 0.07) * 5.2;

      const arr = emberGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < emberCount; i++) {
        arr[i * 3 + 1] += dt * 0.58;
        arr[i * 3] += Math.sin(sec + i) * dt * 0.12;
        if (arr[i * 3 + 1] > 8.5) arr[i * 3 + 1] = -0.4;
      }
      emberGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      unsubViewport();
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      sceneSlotRef.current = null;
      disposeGroup(scene);
      envTex?.dispose();
      renderer.dispose();
      host.innerHTML = '';
    };
  }, [webglFailed]);

  // Swap only the 3D champion rig when hero or skin changes (zero WebGL context tear-down)
  useEffect(() => {
    const slot = sceneSlotRef.current;
    if (!slot || webglFailed) return;

    if (slot.heroRig) {
      slot.heroAnchor.remove(slot.heroRig.group);
      disposeGroup(slot.heroRig.group);
      slot.heroRig = null;
    }

    const nextRig = buildMlbbHeroRig3D(hero.role, skin.color, skin.accent, 'blue', true, 1.68);
    nextRig.baseRing.visible = false;
    slot.heroAnchor.add(nextRig.group);
    slot.heroRig = nextRig;

    const accentInt = hexToInt(skin.accent, 0xe6b84c);
    slot.accentLight.color.setHex(accentInt);
    slot.runeMat.color.setHex(accentInt);
    slot.shockMat.color.setHex(accentInt);
  }, [hero.id, hero.role, skin.color, skin.accent, webglFailed]);

  const triggerHeroPose = () => {
    poseTimerRef.current = 0.9;
    mlbbAudio.playSkill(2, 'magic');
    const pool = HERO_VOICE_LINES[hero.role] ?? HERO_VOICE_LINES.Fighter;
    const quote = pool[Math.floor(Math.random() * pool.length)];
    setVoiceLine(`${hero.name}: ${quote}`);
    window.setTimeout(() => setVoiceLine(null), 2800);
  };

  const candidateHeroes = MLBB_ALL_HEROES.filter((h) => {
    const q = search.trim().toLowerCase();
    if (!q) return ownedHeroIds.includes(h.id) || h.starter;
    return h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
  }).slice(0, 36);

  return (
    <div className="relative w-full h-full">
      {webglFailed ? (
        <LobbySanctuaryCanvas heroId={heroId} skinId={skinId} />
      ) : (
        <div
          ref={hostRef}
          onPointerDown={(e) => {
            mlbbAudio.startLobbyBgm();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragRef.current = { startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY, moved: false };
          }}
          onPointerMove={(e) => {
            const d = dragRef.current;
            if (!d) return;
            const dx = e.clientX - d.lastX;
            const dy = e.clientY - d.lastY;
            if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > 6) d.moved = true;
            d.lastX = e.clientX;
            d.lastY = e.clientY;
            targetRotYRef.current += dx * 0.015;
            targetPitchRef.current = Math.max(-0.08, Math.min(0.46, targetPitchRef.current + dy * 0.004));
          }}
          onPointerUp={() => {
            const d = dragRef.current;
            dragRef.current = null;
            if (d && !d.moved) triggerHeroPose();
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          title="Drag 360° to rotate 3D Hero · Tap for combat pose & voice line"
        />
      )}

      {/* Center Hero Voice-Line Caption & Sleek Non-Overlapping Switch Showcase Hero Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[136px] sm:bottom-[144px] lg:bottom-24 z-10 flex flex-col items-center gap-1.5 px-4">
        {voiceLine && (
          <div className="px-4 py-1.5 rounded-xl bg-[#0B132B]/94 border border-[#FFE28A] text-xs font-bold text-amber-100 shadow-2xl max-w-md text-center">
            💬 {voiceLine}
          </div>
        )}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl mlbb-panel-gold shadow-lg">
          <div className="text-left">
            <div className="text-xs font-black tracking-wide text-white uppercase whitespace-nowrap">
              {hero.name} <span className="text-[#FFE28A]">· {skin.name}</span>
            </div>
            <div className="text-[10px] font-semibold text-sky-200/85 whitespace-nowrap">
              {hero.role} · {hero.lane} Lane · Drag 360° or Tap Hero
            </div>
          </div>
          <button
            onClick={() => {
              mlbbAudio.playClick();
              setPickerOpen((v) => !v);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] to-[#E6B84C] hover:brightness-110 text-slate-950 text-[10px] font-black cursor-pointer whitespace-nowrap"
            title="Switch Lobby Showcase Hero"
          >
            🔄 Switch Hero
          </button>
        </div>
      </div>

      {/* Quick Lobby Showcase Hero Switcher Popover */}
      {pickerOpen && (
        <div className="absolute inset-x-0 bottom-[196px] lg:bottom-40 z-30 flex justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B132B]/96 border-2 border-[#E6B84C]/75 p-3 shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black text-[#FFE28A] uppercase">Switch Showcase Hero</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search all ${MLBB_ALL_HEROES.length} heroes...`}
                className="flex-1 max-w-[200px] px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
              />
              <button
                onClick={() => setPickerOpen(false)}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-rose-600 text-xs font-black text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {candidateHeroes.map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    mlbbAudio.playClick();
                    onSwitchHero(h.id);
                    setPickerOpen(false);
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer ${
                    h.id === heroId ? 'bg-amber-500/25 border-[#FFE28A]' : 'bg-slate-900/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <HeroPortraitSvg heroId={h.id} size={32} />
                  <span className="text-[10px] font-black text-white truncate max-w-full">{h.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
