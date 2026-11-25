import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { detectSoftwareWebGL } from '../../../../core/threeShared';
import { MlbbMapThemeId, MlbbMapVariantId } from '../types';
import { computeTurretRingState } from './BattlefieldSystems';
import { computeRetributionThreshold, dist } from './CombatMath';
import { RenderSceneState } from './Renderer';
import {
  buildBrawlShrineRig3D,
  buildJungleMobRig3D,
  buildMinionRig3D,
  buildMlbbHeroRig3D,
  buildMlbbTurretRig3D,
  buildWalkieGrassRig3D,
  HeroRig3D,
  hexToInt,
  toThreeX,
  toThreeZ,
  TurretRig3D,
  WORLD_SCALE
} from './ThreeHeroModels';
import { buildLandOfDawn3D, ThreeMapHandle } from './ThreeMapBuilder';
import { getHeroCcBadge, getHeroStackBadge, resolveHeroSilhouetteState } from './VfxSystem';

const THEME_SUNLIT_ATMOSPHERE: Record<
  MlbbMapThemeId,
  { sky: number; fog: number; key: number; keyInt: number; hemiSky: number; hemiGround: number }
> = {
  imperial_sanctuary: { sky: 0x7cc4fa, fog: 0xcbe8ff, key: 0xfff5d6, keyInt: 2.25, hemiSky: 0xbae6fd, hemiGround: 0x22663a },
  western_expanse: { sky: 0x7dd3fc, fog: 0xfdecc8, key: 0xffe4a8, keyInt: 2.35, hemiSky: 0xfef3c7, hemiGround: 0x856436 },
  celestial_palace: { sky: 0x60a5fa, fog: 0xdbeafe, key: 0xfffbeb, keyInt: 2.3, hemiSky: 0xe0f2fe, hemiGround: 0x336b75 },
  sanctum_island: { sky: 0x38bdf8, fog: 0xccfbf1, key: 0xfefce8, keyInt: 2.2, hemiSky: 0xdcfce7, hemiGround: 0x1e6b52 },
  harmonic_sanctuary: { sky: 0x272359, fog: 0x3f3775, key: 0xfde68a, keyInt: 1.85, hemiSky: 0xc4b5fd, hemiGround: 0x1e3a42 }
};

/**
 * Bright Sunlit MLBB Three.js 3D WebGL Battlefield Renderer with authentic angled diagonal
 * 3D MOBA camera, sculpted 16-part articulated hero rigs, real-time 3D Fog of War shroud,
 * dedicated 3D Brawl Bridge & Healing Shrines, volumetric 3D combat VFX, and crisp projected 2D overlays.
 */
export class ThreeBattlefieldRenderer {
  private container: HTMLElement;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private keyLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rimLight: THREE.DirectionalLight;
  private envTexture: THREE.Texture | null = null;
  private overlayCanvas: HTMLCanvasElement;
  private overlayCtx: CanvasRenderingContext2D | null;
  private resizeObserver: ResizeObserver | null = null;

  private mapHandle: ThreeMapHandle | null = null;
  private builtTheme: MlbbMapThemeId | null = null;
  private builtVariant: MlbbMapVariantId | null = null;
  private builtBrawl = false;
  private builtExpLane: 'top' | 'bot' = 'top';

  private heroRigs = new Map<string, HeroRig3D>();
  private turretRigs = new Map<string, TurretRig3D>();
  private jungleRigs = new Map<string, THREE.Group>();
  private minionRigs = new Map<string, THREE.Group>();
  private brawlShrineRigs = new Map<string, { group: THREE.Group; crystal: THREE.Mesh; ring: THREE.Mesh }>();
  private walkieRigs = new Map<string, THREE.Group>();
  private dynamicGroup = new THREE.Group();

  // Shared geometries for volumetric 3D VFX
  private projGeo = new THREE.SphereGeometry(0.48, 10, 8);
  private haloGeo = new THREE.SphereGeometry(0.78, 10, 8);
  private ringGeo = new THREE.RingGeometry(0.8, 1.0, 28);
  private domeGeo = new THREE.SphereGeometry(1.0, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  private slashGeo = new THREE.TorusGeometry(1.0, 0.16, 6, 18, Math.PI * 0.85);
  private coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 10);
  private aimGroup = new THREE.Group();
  private aimRangeRing: THREE.Mesh;
  private aimShapeMesh: THREE.Mesh;

  private width = 0;
  private height = 0;
  private disposed = false;
  private contextLost = false;
  private smoothCamX: number | null = null;
  private smoothCamZ: number | null = null;
  private lastRenderMs = 0;
  private tmpVec = new THREE.Vector3();
  private bushDummy = new THREE.Object3D();

  constructor(container: HTMLElement) {
    this.container = container;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';

    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:2;';
    this.overlayCtx = this.overlayCanvas.getContext('2d');

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(this.overlayCanvas);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7cc4fa);
    this.scene.fog = new THREE.Fog(0xcbe8ff, 78, 265);

    // Safe isolated PMREM studio reflection setup (never fails WebGL boot on older mobile GPUs)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const roomEnv = new RoomEnvironment();
      this.envTexture = pmrem.fromScene(roomEnv, 0.04).texture;
      roomEnv.dispose();
      pmrem.dispose();
      this.scene.environment = this.envTexture;
    } catch {
      this.envTexture = null;
    }

    this.camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.5, 420);

    // Vibrant Bright Sunlit 3-Point MLBB Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x22663a, 1.15);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff5d6, 2.25);
    this.keyLight.position.set(34, 58, 28);
    if (!this.isSoftwareGl) {
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.set(1024, 1024);
      const d = 44;
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.camera.near = 6;
      this.keyLight.shadow.camera.far = 165;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    this.rimLight = new THREE.DirectionalLight(0x93c5fd, 0.62);
    this.rimLight.position.set(-30, 26, -34);
    this.scene.add(this.rimLight);

    this.scene.add(this.dynamicGroup);

    // Skill Aiming 3D Ground Telegraph Group
    this.aimRangeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.0, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        depthWrite: false
      })
    );
    this.aimRangeRing.rotation.x = -Math.PI / 2;
    this.aimRangeRing.position.y = 0.22;

    this.aimShapeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      })
    );
    this.aimShapeMesh.rotation.x = -Math.PI / 2;
    this.aimShapeMesh.position.y = 0.24;

    this.aimGroup.add(this.aimRangeRing, this.aimShapeMesh);
    this.aimGroup.visible = false;
    this.scene.add(this.aimGroup);

    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    }
    this.resize();
    this.lastRenderMs = performance.now();
  }

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.contextLost = true;
  };

  private onContextRestored = (): void => {
    this.contextLost = false;
  };

  public isAvailable(): boolean {
    return !this.disposed && !this.contextLost;
  }

  public isSoftware(): boolean {
    return this.isSoftwareGl;
  }

  public resize(): void {
    if (this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || window.innerWidth || 960));
    const h = Math.max(180, Math.floor(rect.height || window.innerHeight || 540));
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);

    if (this.overlayCtx) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.overlayCanvas.width = Math.floor(w * dpr);
      this.overlayCanvas.height = Math.floor(h * dpr);
      this.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  private ensureMapBuilt(state: RenderSceneState): void {
    if (
      this.mapHandle &&
      this.builtTheme === state.mapTheme &&
      this.builtVariant === state.mapVariant &&
      this.builtBrawl === state.isBrawl &&
      this.builtExpLane === state.expLane
    ) {
      return;
    }
    if (this.mapHandle) {
      this.scene.remove(this.mapHandle.root);
      this.mapHandle.dispose();
    }
    this.mapHandle = buildLandOfDawn3D(
      state.mapTheme,
      state.mapVariant,
      state.isBrawl,
      state.expLane,
      state.goldLane
    );
    this.scene.add(this.mapHandle.root);
    this.builtTheme = state.mapTheme;
    this.builtVariant = state.mapVariant;
    this.builtBrawl = state.isBrawl;
    this.builtExpLane = state.expLane;

    const atmo = THEME_SUNLIT_ATMOSPHERE[state.mapTheme] ?? THEME_SUNLIT_ATMOSPHERE.imperial_sanctuary;
    this.scene.background = new THREE.Color(atmo.sky);
    this.scene.fog = new THREE.Fog(atmo.fog, 78, 265);
    this.keyLight.color.setHex(atmo.key);
    this.keyLight.intensity = atmo.keyInt;
    this.hemiLight.color.setHex(atmo.hemiSky);
    this.hemiLight.groundColor.setHex(atmo.hemiGround);
  }

  private clearDynamicGroup(): void {
    while (this.dynamicGroup.children.length > 0) {
      const child = this.dynamicGroup.children.pop()!;
      const mesh = child as THREE.Mesh;
      if (
        mesh.geometry &&
        mesh.geometry !== this.projGeo &&
        mesh.geometry !== this.haloGeo &&
        mesh.geometry !== this.ringGeo &&
        mesh.geometry !== this.domeGeo &&
        mesh.geometry !== this.slashGeo &&
        mesh.geometry !== this.coinGeo
      ) {
        mesh.geometry.dispose();
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats) m.dispose();
    }
  }

  private projectToScreen(wx3: number, wy3: number, wz3: number): { x: number; y: number; visible: boolean } {
    this.tmpVec.set(wx3, wy3, wz3).project(this.camera);
    const visible = this.tmpVec.z >= -1 && this.tmpVec.z <= 1;
    return {
      x: (this.tmpVec.x * 0.5 + 0.5) * this.width,
      y: (-this.tmpVec.y * 0.5 + 0.5) * this.height,
      visible
    };
  }

  public render(state: RenderSceneState): void {
    if (!this.isAvailable()) return;
    this.resize();
    this.ensureMapBuilt(state);

    const nowMs = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (nowMs - this.lastRenderMs) / 1000));
    this.lastRenderMs = nowMs;

    const wantShadows = !this.isSoftwareGl && state.settings.basics.shadows;
    if (this.renderer.shadowMap.enabled !== wantShadows) {
      this.renderer.shadowMap.enabled = wantShadows;
      this.keyLight.castShadow = wantShadows;
    }

    const player = state.heroes.find((h) => h.isPlayer);

    // 1. Authentic MLBB Angled 3D Diagonal Camera (Blue->Red diagonal yaw, dramatic 3D pitch & smooth damping)
    const targetX = toThreeX(state.camX);
    const targetZ = toThreeZ(state.camY);
    if (this.smoothCamX === null || this.smoothCamZ === null || Math.hypot(targetX - this.smoothCamX, targetZ - this.smoothCamZ) > 30) {
      this.smoothCamX = targetX;
      this.smoothCamZ = targetZ;
    } else {
      this.smoothCamX = THREE.MathUtils.damp(this.smoothCamX, targetX, 11, dt);
      this.smoothCamZ = THREE.MathUtils.damp(this.smoothCamZ, targetZ, 11, dt);
    }

    const highCam = state.settings.basics.cameraHeight === 'high';
    // High camera height grants true +20% wider battlefield FOV (52.8 deg vs 44 deg)
    const desiredFov = highCam ? 52.8 : 44.0;
    if (Math.abs(this.camera.fov - desiredFov) > 0.05) {
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
    }
    const camOffX = highCam ? -9.8 : -8.2;
    const camY = highCam ? 22.4 : 18.5;
    const camOffZ = highCam ? 24.2 : 20.2;

    let shakeX = 0;
    let shakeZ = 0;
    if (state.settings.basics.screenShake && state.shakeTimer > 0) {
      const mag = Math.min(0.65, state.shakeTimer * 2.2);
      shakeX = (Math.random() - 0.5) * mag;
      shakeZ = (Math.random() - 0.5) * mag;
    }

    this.camera.position.set(
      this.smoothCamX + camOffX + shakeX,
      camY,
      this.smoothCamZ + camOffZ + shakeZ
    );
    this.camera.lookAt(this.smoothCamX + 0.9, 1.0, this.smoothCamZ - 2.2);

    // Keep directional sunlight shadows centered tightly around the active 3D viewport
    this.keyLight.position.set(this.smoothCamX + 28, 54, this.smoothCamZ + 24);
    this.keyLight.target.position.set(this.smoothCamX, 0, this.smoothCamZ);
    this.keyLight.target.updateMatrixWorld();

    // 2. Animate River Flow, Swaying Bushes, Cyclone Eyes, Flying Cloud, Shortcut Walls, Theme Landmarks & 3D Fog of War
    if (this.mapHandle) {
      this.mapHandle.updateFogOfWar(state.blueVisionCircles, Boolean(state.isSpectator));
      if (this.mapHandle.riverTex) {
        const flowSpeed = state.mapVariant === 'expanding_rivers' ? 0.65 : 0.38;
        this.mapHandle.riverTex.offset.y = -(state.matchTimeSec * flowSpeed) % 1;
      }
      if (this.mapHandle.expDecalMesh && this.mapHandle.goldDecalMesh) {
        const decalPulse = 0.78 + Math.sin(state.matchTimeSec * 3.2) * 0.18;
        (this.mapHandle.expDecalMesh.material as THREE.MeshBasicMaterial).opacity = decalPulse;
        (this.mapHandle.goldDecalMesh.material as THREE.MeshBasicMaterial).opacity = decalPulse;
      }
      if (this.mapHandle.themeAmbientGroup) {
        this.mapHandle.themeAmbientGroup.position.y = Math.sin(state.matchTimeSec * 1.4) * 0.16;
      }
      if (this.mapHandle.bushMesh) {
        const bases = this.mapHandle.bushBaseMatrices;
        for (let i = 0; i < bases.length; i++) {
          const b = bases[i];
          const sway = Math.sin(state.matchTimeSec * 2.3 + b.x * 0.25) * 0.14;
          this.bushDummy.position.set(b.x + sway, 1.15, b.z);
          this.bushDummy.rotation.set(0, b.rot, sway * 0.22);
          this.bushDummy.scale.set(b.sx, 1.55, b.sz);
          this.bushDummy.updateMatrix();
          this.mapHandle.bushMesh.setMatrixAt(i, this.bushDummy.matrix);
        }
        this.mapHandle.bushMesh.instanceMatrix.needsUpdate = true;
      }
      for (const [campId, mesh] of this.mapHandle.shortcutWallMeshes.entries()) {
        const open = (state.campSlainShortcut[campId] ?? 0) > 0;
        mesh.visible = !open;
      }
      for (const [ceId, mesh] of this.mapHandle.cycloneMeshes.entries()) {
        const cd = state.cycloneCds[ceId] ?? 0;
        mesh.rotation.z = state.matchTimeSec * (cd <= 0 ? 3.8 : 0.45);
        (mesh.material as THREE.MeshBasicMaterial).color.setHex(cd <= 0 ? 0x38bdf8 : 0x64748b);
      }
      if (this.mapHandle.flyingCloudGroup) {
        this.mapHandle.flyingCloudGroup.rotation.y = state.matchTimeSec * (state.flyingCloudCd <= 0 ? 2.4 : 0.35);
      }
    }

    // 2B. Sync 3D Brawl Healing Shrines
    for (const sh of state.brawlShrines) {
      let rig = this.brawlShrineRigs.get(sh.id);
      if (!rig) {
        rig = buildBrawlShrineRig3D();
        rig.group.position.set(toThreeX(sh.x), 0, toThreeZ(sh.y));
        this.scene.add(rig.group);
        this.brawlShrineRigs.set(sh.id, rig);
      }
      rig.group.visible = state.isBrawl;
      if (!state.isBrawl) continue;
      rig.crystal.visible = sh.active;
      rig.ring.visible = sh.active;
      if (sh.active) {
        rig.crystal.rotation.y = state.matchTimeSec * 2.4;
        rig.crystal.position.y = 2.35 + Math.sin(state.matchTimeSec * 3.5) * 0.32;
        rig.ring.rotation.z = state.matchTimeSec * 1.8;
      }
    }

    // 2C. Sync 3D Walkie Grass Patrolling River Wards
    const aliveWalkies = new Set<string>();
    for (const wg of state.walkieGrasses) {
      aliveWalkies.add(wg.id);
      let rig = this.walkieRigs.get(wg.id);
      if (!rig) {
        rig = buildWalkieGrassRig3D(wg.team);
        this.scene.add(rig);
        this.walkieRigs.set(wg.id, rig);
      }
      rig.position.set(toThreeX(wg.x), Math.sin(state.matchTimeSec * 4.2 + wg.phase) * 0.25, toThreeZ(wg.y));
      rig.rotation.y = state.matchTimeSec * 2.1;
    }
    for (const [id, rig] of this.walkieRigs.entries()) {
      if (!aliveWalkies.has(id)) {
        this.scene.remove(rig);
        this.walkieRigs.delete(id);
      }
    }

    // 3. Sync Monumental 3D Turrets & Base Crystals + 3-State Range Rings + Laser Tether
    for (const t of state.turrets) {
      let rig = this.turretRigs.get(t.id);
      if (!rig) {
        rig = buildMlbbTurretRig3D(t.team, t.tier, t.golden, t.range);
        this.scene.add(rig.group);
        this.turretRigs.set(t.id, rig);
      }
      rig.group.visible = t.alive;
      if (!t.alive) continue;

      const tx = toThreeX(t.x);
      const tz = toThreeZ(t.y);
      rig.group.position.set(tx, 0, tz);
      rig.crystal.rotation.y = state.matchTimeSec * 1.8;
      rig.crystal.position.y = (t.tier === 4 ? 6.15 : 6.45) + Math.sin(state.matchTimeSec * 3.1) * 0.2;
      rig.orbitRing.position.y = rig.crystal.position.y;
      rig.orbitRing.rotation.z = state.matchTimeSec * 2.2;
      rig.shieldDome.visible = t.shieldHp > 0;
      rig.shieldDome.rotation.y = -state.matchTimeSec * 0.7;

      const showRing =
        t.team === 'red' && player && player.alive && dist(player.x, player.y, t.x, t.y) < t.range + 300;
      rig.rangeRing.visible = Boolean(showRing);
      rig.rangeFill.visible = Boolean(showRing);
      rig.laserBeam.visible = false;

      if (showRing && player) {
        const ringState = computeTurretRingState(t, player.id, player.team, state.minions);
        const locked = ringState === 'locked';
        const col = locked ? 0xef4444 : ringState === 'safe' ? 0x2ce58b : 0xfacc15;
        const pulse = locked ? 0.58 + Math.sin(state.matchTimeSec * 16) * 0.38 : 0.86;
        rig.rangeRingMat.color.setHex(col);
        rig.rangeRingMat.opacity = pulse;
        rig.rangeFillMat.color.setHex(col);
        rig.rangeFillMat.opacity = locked ? 0.18 : 0.08;

        if (locked) {
          const px3 = toThreeX(player.x);
          const pz3 = toThreeZ(player.y);
          const dx = px3 - tx;
          const dy = 1.6 - rig.laserBeam.position.y;
          const dz = pz3 - tz;
          const beamLen = Math.hypot(dx, dy, dz);
          rig.laserBeam.visible = true;
          rig.laserBeam.scale.set(1, 1, beamLen);
          rig.laserBeam.lookAt(px3, 1.6, pz3);
        }
      }
    }

    // 4. Sync Detailed Articulated 3D Heroes (Layer 2 Silhouette Shaders, Dynamic Scale, Parabolic Leap Z-Arc, 0.55 Bush Stealth)
    for (const h of state.heroes) {
      let rig = this.heroRigs.get(h.id);
      if (!rig) {
        rig = buildMlbbHeroRig3D(h.role, h.skinColor, h.skinAccent, h.team, h.isPlayer, 1.58);
        this.scene.add(rig.group);
        this.heroRigs.set(h.id, rig);
      }
      const isEgg = !h.alive && (h.eggFormTimer ?? 0) > 0;
      const visible = (h.alive || isEgg) && (h.team === 'blue' || state.visibleEnemyIds.has(h.id));
      rig.group.visible = visible;
      if (!visible) continue;

      const sil = resolveHeroSilhouetteState(h);
      const hx = toThreeX(h.x);
      const hz = toThreeZ(h.y);
      const fallbackLeap = h.dashTimer > 0 && h.dashWallCross ? Math.sin(Math.min(1, h.dashTimer * 2.5) * Math.PI) * 3.2 : 0;
      const leapY = sil.leapZ > 0 ? sil.leapZ : fallbackLeap;
      const speedMag = Math.hypot(h.vx, h.vy);
      const bobY = speedMag > 15 ? Math.abs(Math.sin(state.matchTimeSec * 12)) * 0.12 : Math.sin(state.matchTimeSec * 2.6 + hx) * 0.04;
      rig.group.position.set(hx, leapY + bobY, hz);
      // Dynamic Model Scaling (Barats Big Guy up to 1.45x, Diggie Egg 0.72x!)
      const scaleFactor = sil.eggForm ? 0.72 : sil.modelScale;
      rig.group.scale.setScalar(scaleFactor);

      rig.bodyGroup.rotation.y = Math.PI / 2 - h.facing;

      const walkPhase = speedMag > 15 ? Math.sin(state.matchTimeSec * 12) * 0.58 : 0;
      rig.leftLeg.rotation.x = walkPhase;
      rig.rightLeg.rotation.x = -walkPhase;
      rig.leftArm.rotation.x = -walkPhase * 0.72;
      rig.capePivot.rotation.x = (speedMag > 15 ? 0.42 : 0.12) + Math.sin(state.matchTimeSec * 5.2 + hx) * 0.1;

      const isSwinging = h.atkCd > 0.32 || h.castWindup > 0;
      rig.weaponPivot.rotation.x = isSwinging
        ? -1.25
        : walkPhase * 0.65 + Math.sin(state.matchTimeSec * 2.8) * 0.08;

      // Layer 2 PBR Silhouette Shaders: Translucent Camo/Untargetable, Red Hit-Flash, Gold CC-Immune, Cyan Shield
      for (const m of rig.materials) {
        if (m.transparent !== sil.translucent) {
          m.transparent = sil.translucent;
          m.needsUpdate = true;
        }
        m.opacity = sil.opacity;
        if (sil.redHitFlash) {
          m.emissive.setHex(0xff3b4e);
          m.emissiveIntensity = 1.55;
        } else if (sil.goldCcImmune) {
          m.emissive.setHex(sil.deathImmune ? 0x4ade80 : 0xfacc15);
          m.emissiveIntensity = 0.52;
        } else if (sil.cyanShielded) {
          m.emissive.setHex(0x38bdf8);
          m.emissiveIntensity = 0.28;
        } else {
          m.emissive.setHex(0x000000);
          m.emissiveIntensity = m === rig.materials[4] ? 0.85 : 0;
        }
      }

      rig.lockRing.visible = state.lockedTargetId === h.id;
      rig.lockRing.rotation.z = state.matchTimeSec * 2.5;
      rig.ccHalo.visible = sil.goldCcImmune || sil.carForm;
      rig.ccHalo.rotation.z = state.matchTimeSec * 3.6;
      rig.iceCage.visible = sil.frostFrozen;
      rig.recallRing.visible = h.recalling;
      if (h.recalling) {
        const prog = Math.max(0, Math.min(1, 1 - h.recallTimer / 4.0));
        const rScale = 0.85 + prog * 0.7 + Math.sin(state.matchTimeSec * 9) * 0.06;
        rig.recallRing.rotation.y = state.matchTimeSec * 4.5;
        rig.recallRing.scale.set(rScale, 1, rScale);
      } else {
        rig.recallRing.scale.set(1, 1, 1);
      }

      const hasOrbit = h.orbitBlades > 0 && h.orbitTimer > 0;
      rig.orbitGroup.visible = hasOrbit;
      if (hasOrbit) {
        for (let i = 0; i < rig.orbitBlades.length; i++) {
          const b = rig.orbitBlades[i];
          b.visible = i < h.orbitBlades;
          if (b.visible) {
            const ba = state.matchTimeSec * 4.4 + (i * Math.PI * 2) / h.orbitBlades;
            b.position.set(Math.cos(ba) * 3.2, 0, Math.sin(ba) * 3.2);
            b.rotation.y = -ba;
          }
        }
      }
    }

    // 5. Sync Sculpted 3D Jungle Monsters
    for (const mob of state.jungleMobs) {
      let rig = this.jungleRigs.get(mob.id);
      if (!rig) {
        rig = buildJungleMobRig3D(mob.kind, mob.color);
        this.scene.add(rig);
        this.jungleRigs.set(mob.id, rig);
      }
      rig.visible = mob.alive;
      if (!mob.alive) continue;
      rig.position.set(toThreeX(mob.x), Math.sin(state.matchTimeSec * 2.5 + mob.homeX) * 0.08, toThreeZ(mob.y));
      rig.rotation.y = Math.sin(state.matchTimeSec * 0.9 + mob.homeX) * 0.4;
    }

    // 6. Sync 3D Lane Minions (including armored Super Minions & 3-Stage Evolved Lord scaling!)
    const aliveMinions = new Set<string>();
    for (const m of state.minions) {
      if (!m.alive) continue;
      aliveMinions.add(m.id);
      let rig = this.minionRigs.get(m.id);
      if (!rig) {
        rig = buildMinionRig3D(m.team, m.kind);
        this.scene.add(rig);
        this.minionRigs.set(m.id, rig);
      }
      rig.position.set(toThreeX(m.x), 0, toThreeZ(m.y));
      if (m.kind === 'lord_ally') {
        const sc = m.lordStage === 3 ? 1.24 : m.lordStage === 2 ? 1.12 : 1.0;
        rig.scale.setScalar(sc);
      }
    }
    for (const [id, rig] of this.minionRigs.entries()) {
      if (!aliveMinions.has(id)) {
        this.scene.remove(rig);
        this.minionRigs.delete(id);
      }
    }

    // 7. Skill Aiming 3D Ground Telegraph
    if (state.aimPreview.active && player && player.alive) {
      const ap = state.aimPreview;
      const px = toThreeX(player.x);
      const pz = toThreeZ(player.y);
      const r3 = Math.max(1.5, ap.range * WORLD_SCALE);
      const rad3 = Math.max(1.0, ap.radius * WORLD_SCALE);
      const col = ap.cancelHover ? 0xef4444 : 0x38bdf8;
      this.aimGroup.visible = true;
      this.aimGroup.position.set(px, 0, pz);
      this.aimRangeRing.scale.set(r3, r3, 1);
      (this.aimRangeRing.material as THREE.MeshBasicMaterial).color.setHex(col);
      (this.aimShapeMesh.material as THREE.MeshBasicMaterial).color.setHex(col);

      if (ap.shape === 'line' || ap.shape === 'cone') {
        const ang = ap.angle;
        const cx = Math.cos(ang) * (r3 * 0.5);
        const cz = Math.sin(ang) * (r3 * 0.5);
        this.aimShapeMesh.position.set(cx, 0.24, cz);
        this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, -ang);
        this.aimShapeMesh.scale.set(r3, rad3 * 1.15, 1);
      } else if (ap.shape === 'circle') {
        const d3 = Math.min(r3, ap.dist * WORLD_SCALE);
        this.aimShapeMesh.position.set(Math.cos(ap.angle) * d3, 0.24, Math.sin(ap.angle) * d3);
        this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, 0);
        this.aimShapeMesh.scale.set(rad3 * 1.9, rad3 * 1.9, 1);
      } else {
        this.aimShapeMesh.position.set(0, 0.24, 0);
        this.aimShapeMesh.rotation.set(-Math.PI / 2, 0, 0);
        this.aimShapeMesh.scale.set(rad3 * 1.8, rad3 * 1.8, 1);
      }
    } else {
      this.aimGroup.visible = false;
    }

    // 8. Volumetric 3D Projectiles, Shockwave Domes, Slash Arcs, Beams, Spinning Coins & Tactical Ping Beacons
    this.clearDynamicGroup();
    for (const p of state.projectiles) {
      const col = hexToInt(p.color, 0x38bdf8);
      const sc = Math.max(0.65, p.radius * WORLD_SCALE * 0.65);
      const px = toThreeX(p.x);
      const pz = toThreeZ(p.y);

      const core = new THREE.Mesh(this.projGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      core.scale.setScalar(sc * 0.72);
      core.position.set(px, 1.75, pz);

      const halo = new THREE.Mesh(
        this.haloGeo,
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.62, depthWrite: false })
      );
      halo.scale.setScalar(sc * 1.15);
      halo.position.set(px, 1.75, pz);
      this.dynamicGroup.add(core, halo);
    }

    for (const wisp of state.wisps) {
      const orb = new THREE.Mesh(
        this.haloGeo,
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.78 })
      );
      orb.scale.setScalar(1.1);
      orb.position.set(toThreeX(wisp.x), 2.5 + Math.sin(state.matchTimeSec * 4.5) * 0.4, toThreeZ(wisp.y));
      this.dynamicGroup.add(orb);
    }

    for (const v of state.vfxs) {
      const alpha = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
      const col = hexToInt(v.color, 0xfacc15);
      const vx = toThreeX(v.x);
      const vz = toThreeZ(v.y);

      if (v.kind === 'burst') {
        const expand = 1.35 - alpha * 0.55;
        const r3 = Math.max(1.4, v.radius * WORLD_SCALE * expand);
        const dome = new THREE.Mesh(
          this.domeGeo,
          new THREE.MeshBasicMaterial({
            color: col,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: alpha * 0.42,
            depthWrite: false
          })
        );
        dome.position.set(vx, 0.15, vz);
        dome.scale.set(r3, r3 * 0.72, r3);
        const ring = new THREE.Mesh(
          this.ringGeo,
          new THREE.MeshBasicMaterial({
            color: col,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: alpha * 0.9,
            depthWrite: false
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(vx, 0.25, vz);
        ring.scale.set(r3 * 1.05, r3 * 1.05, 1);
        this.dynamicGroup.add(dome, ring);
      } else if (v.kind === 'slash') {
        const r3 = Math.max(1.5, v.radius * WORLD_SCALE);
        const arc = new THREE.Mesh(
          this.slashGeo,
          new THREE.MeshBasicMaterial({
            color: col,
            transparent: true,
            opacity: alpha * 0.92,
            depthWrite: false
          })
        );
        arc.rotation.set(Math.PI / 2 - 0.22, 0, state.matchTimeSec * 8);
        arc.position.set(vx, 1.55, vz);
        arc.scale.setScalar(r3 * 0.82);
        this.dynamicGroup.add(arc);
      } else if (v.kind === 'ring' || v.kind === 'crater') {
        const r3 = Math.max(1.3, v.radius * WORLD_SCALE);
        const ring = new THREE.Mesh(
          this.ringGeo,
          new THREE.MeshBasicMaterial({
            color: col,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: alpha * 0.88,
            depthWrite: false
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(vx, 0.25, vz);
        ring.scale.set(r3, r3, 1);
        this.dynamicGroup.add(ring);
      } else if ((v.kind === 'beam' || v.kind === 'tether') && v.tx !== undefined && v.ty !== undefined) {
        const x2 = toThreeX(v.tx);
        const z2 = toThreeZ(v.ty);
        const len = Math.max(0.2, Math.hypot(x2 - vx, z2 - vz));
        const beamGeo = new THREE.CylinderGeometry(0.24, 0.24, len, 6);
        beamGeo.rotateX(Math.PI / 2);
        const beam = new THREE.Mesh(
          beamGeo,
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: alpha * 0.92 })
        );
        beam.position.set((vx + x2) * 0.5, 1.7, (vz + z2) * 0.5);
        beam.lookAt(x2, 1.7, z2);
        this.dynamicGroup.add(beam);
      } else if (v.kind === 'coin') {
        const coin = new THREE.Mesh(
          this.coinGeo,
          new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: alpha })
        );
        coin.rotation.x = Math.PI / 2;
        coin.rotation.z = state.matchTimeSec * 10;
        coin.position.set(vx, 1.8 + (1 - alpha) * 2.8, vz);
        this.dynamicGroup.add(coin);
      } else if (v.kind === 'leaf') {
        const leaf = new THREE.Mesh(
          this.coinGeo,
          new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: alpha * 0.9 })
        );
        leaf.scale.set(1.1, 0.3, 0.55);
        leaf.rotation.set(state.matchTimeSec * 6, v.angle ?? 0, state.matchTimeSec * 5);
        leaf.position.set(vx + Math.sin(state.matchTimeSec * 8 + vx) * 0.4, 0.8 + (1 - alpha) * 1.9, vz);
        this.dynamicGroup.add(leaf);
      } else if (v.kind === 'shard') {
        const shard = new THREE.Mesh(
          this.projGeo,
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: alpha })
        );
        const spread = (1 - alpha) * (v.radius * WORLD_SCALE);
        const ang = v.angle ?? 0;
        shard.scale.set(0.6, 1.45, 0.6);
        shard.rotation.set(state.matchTimeSec * 7, ang, state.matchTimeSec * 9);
        shard.position.set(vx + Math.cos(ang) * spread, 2.2 + Math.sin(alpha * Math.PI) * 5.8, vz + Math.sin(ang) * spread);
        this.dynamicGroup.add(shard);
      } else if (v.kind === 'elemental' || v.kind === 'prism') {
        const orb = new THREE.Mesh(
          this.haloGeo,
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: alpha * 0.85, depthWrite: false })
        );
        orb.scale.setScalar(v.kind === 'prism' ? 1.35 : 0.72 * alpha + 0.25);
        orb.position.set(vx, 1.4 + (1 - alpha) * 2.2, vz);
        this.dynamicGroup.add(orb);
      } else if (v.kind === 'cable' && v.tx !== undefined && v.ty !== undefined) {
        const x2 = toThreeX(v.tx);
        const z2 = toThreeZ(v.ty);
        const len = Math.max(0.2, Math.hypot(x2 - vx, z2 - vz));
        const cableGeo = new THREE.CylinderGeometry(0.11, 0.11, len, 6);
        cableGeo.rotateX(Math.PI / 2);
        const cable = new THREE.Mesh(
          cableGeo,
          new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: alpha })
        );
        cable.position.set((vx + x2) * 0.5, 1.65, (vz + z2) * 0.5);
        cable.lookAt(x2, 1.65, z2);
        this.dynamicGroup.add(cable);
      }
    }

    // 8B. 3D Temporary Rock Walls (Badang S2, Grock S2), Hirara Astral Prisms & Cyan Shield Domes
    if (state.tempWalls && state.tempWalls.length > 0) {
      for (const tw of state.tempWalls) {
        const w3 = Math.max(1.2, tw.w * WORLD_SCALE);
        const d3 = Math.max(1.2, tw.h * WORLD_SCALE);
        const wallMesh = new THREE.Mesh(
          new THREE.BoxGeometry(w3, 3.2, d3),
          new THREE.MeshStandardMaterial({
            color: hexToInt(tw.color, 0xd97706),
            roughness: 0.75,
            transparent: true,
            opacity: Math.min(0.95, (tw.ttl / Math.max(0.1, tw.maxTtl)) * 1.5)
          })
        );
        wallMesh.position.set(toThreeX(tw.x + tw.w * 0.5), 1.6, toThreeZ(tw.y + tw.h * 0.5));
        this.dynamicGroup.add(wallMesh);
      }
    }
    for (const h of state.heroes) {
      if (h.alive && h.shield > 0 && (h.team === 'blue' || state.visibleEnemyIds.has(h.id))) {
        const dome = new THREE.Mesh(
          this.domeGeo,
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false })
        );
        const sc = 2.0 * (h.modelScale || 1);
        dome.scale.set(sc, sc * 1.1, sc);
        dome.position.set(toThreeX(h.x), 0.15 + (h.leapZ || 0), toThreeZ(h.y));
        this.dynamicGroup.add(dome);
      }
      if (h.hiraraPrisms && h.hiraraPrisms.length > 0) {
        for (const pr of h.hiraraPrisms) {
          const pMesh = new THREE.Mesh(
            this.haloGeo,
            new THREE.MeshBasicMaterial({ color: 0xe879f9, transparent: true, opacity: 0.82 })
          );
          pMesh.scale.set(0.75, 1.55, 0.75);
          pMesh.position.set(toThreeX(pr.x), 1.9 + Math.sin(state.matchTimeSec * 4) * 0.3, toThreeZ(pr.y));
          this.dynamicGroup.add(pMesh);
        }
      }
    }

    // Tall 3D Vertical Light Pillars & Ground Ripples for Active Tactical Pings
    for (const ping of state.tacticalPings) {
      const pAlpha = Math.max(0.18, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
      const col = hexToInt(ping.color, 0xff3b4e);
      const px = toThreeX(ping.x);
      const pz = toThreeZ(ping.y);
      const pulse = (state.matchTimeSec * 2.2) % 1;

      const ripple = new THREE.Mesh(
        this.ringGeo,
        new THREE.MeshBasicMaterial({
          color: col,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: pAlpha * (1 - pulse * 0.65),
          depthWrite: false
        })
      );
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.set(px, 0.3, pz);
      const rr = 1.8 + pulse * 4.8;
      ripple.scale.set(rr, rr, 1);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.65, 9.5, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: col,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: pAlpha * 0.62,
          depthWrite: false
        })
      );
      pillar.position.set(px, 4.75, pz);
      this.dynamicGroup.add(ripple, pillar);
    }

    // Render 3D WebGL scene
    this.renderer.render(this.scene, this.camera);

    // 9. Draw Crisp Screen-Space Projected 2D Overlays (HP Bars, Eye Icons, Damage Popups, Route Trails, Ping Badges)
    this.render2DOverlay(state);
  }

  private render2DOverlay(state: RenderSceneState): void {
    const ctx = this.overlayCtx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    const player = state.heroes.find((h) => h.isPlayer);

    // 0. Glowing Red Hero Lock-On Tether Line from Player to Locked Enemy
    if (player && player.alive && state.lockedTargetId) {
      const lockedEnemy = state.heroes.find(
        (x) => x.id === state.lockedTargetId && x.alive && state.visibleEnemyIds.has(x.id)
      );
      if (lockedEnemy) {
        const spA = this.projectToScreen(toThreeX(player.x), 1.4, toThreeZ(player.y));
        const spB = this.projectToScreen(toThreeX(lockedEnemy.x), 1.4, toThreeZ(lockedEnemy.y));
        if (spA.visible && spB.visible) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(spA.x, spA.y);
          ctx.lineTo(spB.x, spB.y);
          ctx.strokeStyle = 'rgba(255,59,78,0.38)';
          ctx.lineWidth = 7;
          ctx.stroke();
          ctx.strokeStyle = '#FF3B4E';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.lineDashOffset = -(state.matchTimeSec * 38);
          ctx.stroke();
          ctx.setLineDash([]);
          // Crisp underfoot target crosshair around locked enemy
          ctx.beginPath();
          ctx.arc(spB.x, spB.y + 8, 18, 0, Math.PI * 2);
          ctx.strokeStyle = '#FF3B4E';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // A. Glowing Cyan "On My Way" Route Lines & Tactical Ping Banners
    for (const ping of state.tacticalPings) {
      const pAlpha = Math.max(0, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
      ctx.save();
      ctx.globalAlpha = Math.min(1, pAlpha * 1.35);

      if (ping.routePoints && ping.routePoints.length >= 2) {
        ctx.beginPath();
        let started = false;
        for (const pt of ping.routePoints) {
          const sp = this.projectToScreen(toThreeX(pt.x), 0.45, toThreeZ(pt.y));
          if (!sp.visible) continue;
          if (!started) {
            ctx.moveTo(sp.x, sp.y);
            started = true;
          } else {
            ctx.lineTo(sp.x, sp.y);
          }
        }
        if (started) {
          ctx.strokeStyle = 'rgba(34,211,238,0.42)';
          ctx.lineWidth = 10;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 4;
          ctx.setLineDash([12, 8]);
          ctx.lineDashOffset = -(state.matchTimeSec * 42);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      const sp = this.projectToScreen(toThreeX(ping.x), 5.2, toThreeZ(ping.y));
      if (sp.visible && sp.x > -120 && sp.x < this.width + 120 && sp.y > -60 && sp.y < this.height + 60) {
        ctx.font = 'bold 11px sans-serif';
        const txt = `${ping.icon} ${ping.label}`;
        const tw = Math.min(240, ctx.measureText(txt).width + 18);
        ctx.fillStyle = 'rgba(11,19,43,0.92)';
        ctx.beginPath();
        ctx.roundRect(sp.x - tw / 2, sp.y - 14, tw, 22, 8);
        ctx.fill();
        ctx.strokeStyle = ping.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, sp.x, sp.y - 3);
      }
      ctx.restore();
    }

    // B. Fog Ghosts (2s fading last-known silhouettes)
    for (const ghost of state.fogGhosts) {
      const sp = this.projectToScreen(toThreeX(ghost.x), 2.1, toThreeZ(ghost.y));
      if (!sp.visible) continue;
      const alpha = Math.max(0, (ghost.ttl / Math.max(0.01, ghost.maxTtl)) * 0.78);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15,23,42,0.84)';
      ctx.fill();
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', sp.x, sp.y);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#FCA5A5';
      ctx.fillText(ghost.name, sp.x, sp.y - 24);
      ctx.restore();
    }

    // C. Turret HP Bars
    for (const t of state.turrets) {
      if (!t.alive) continue;
      const sp = this.projectToScreen(toThreeX(t.x), t.tier === 4 ? 9.1 : 8.5, toThreeZ(t.y));
      if (!sp.visible || sp.x < -80 || sp.x > this.width + 80 || sp.y < -40 || sp.y > this.height + 40) continue;
      const bw = t.tier === 4 ? 106 : 76;
      const bx = sp.x - bw / 2;
      const by = sp.y;
      ctx.fillStyle = 'rgba(8,12,24,0.88)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, 9);
      ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#EF4444';
      ctx.fillRect(bx, by, bw * Math.max(0, t.hp / t.maxHp), 7);
      if (t.shieldHp > 0) {
        ctx.strokeStyle = '#22D3EE';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(bx - 2, by - 2, bw + 4, 11);
      }
    }

    // C2. Brawl Healing Shrine Ground Countdown Rings
    if (state.isBrawl) {
      for (const sh of state.brawlShrines) {
        if (sh.active) continue;
        if (sh.respawnTimer <= 0) continue;
        const sp = this.projectToScreen(toThreeX(sh.x), 0.7, toThreeZ(sh.y));
        if (!sp.visible || sp.x < 0 || sp.x > this.width || sp.y < 0 || sp.y > this.height) continue;
        const frac = Math.max(0, Math.min(1, 1 - sh.respawnTimer / Math.max(1, sh.maxRespawn)));
        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7,12,26,0.82)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.strokeStyle = '#2CE58B';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#A7F3D0';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(sh.respawnTimer)}s`, sp.x, sp.y);
        ctx.restore();
      }
    }

    // D. Jungle Mob HP Bars + Exact Numeric HP on Turtle/Lord + Retribution Line + Circular Radial Respawn Timers
    for (const mob of state.jungleMobs) {
      const isMajor = mob.kind === 'lord' || mob.kind === 'turtle';
      const isBuff = mob.kind === 'orange_buff' || mob.kind === 'purple_buff';
      if (!mob.alive) {
        if ((isMajor || isBuff) && mob.respawnTimer > 0 && mob.respawnTimer < 240) {
          const sp = this.projectToScreen(toThreeX(mob.homeX), 0.9, toThreeZ(mob.homeY));
          if (sp.visible && sp.x > -30 && sp.x < this.width + 30 && sp.y > -30 && sp.y < this.height + 30) {
            const maxSec = mob.spawnedOnce ? mob.respawnSec : mob.firstSpawnSec;
            const frac = Math.max(0, Math.min(1, 1 - mob.respawnTimer / Math.max(1, maxSec)));
            const rad = isMajor ? 22 : 17;
            ctx.save();
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(11,19,43,0.88)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(148,163,184,0.32)';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
            ctx.strokeStyle = isMajor ? '#FACC15' : mob.color;
            ctx.lineWidth = 3.2;
            ctx.stroke();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.ceil(mob.respawnTimer)}s`, sp.x, sp.y + 1);
            ctx.restore();
          }
        }
        continue;
      }
      const sp = this.projectToScreen(toThreeX(mob.x), mob.kind === 'lord' ? 6.1 : 3.8, toThreeZ(mob.y));
      if (!sp.visible || sp.x < -80 || sp.x > this.width + 80 || sp.y < -40 || sp.y > this.height + 40) continue;
      const bw = mob.kind === 'lord' ? 114 : mob.kind === 'turtle' ? 96 : 64;
      const bx = sp.x - bw / 2;
      const by = sp.y;
      ctx.fillStyle = 'rgba(8,12,24,0.9)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, 11);
      ctx.fillStyle = mob.color;
      ctx.fillRect(bx, by, bw * Math.max(0, mob.hp / mob.maxHp), 9);

      if (player && player.spellId === 'retribution') {
        const thresh = computeRetributionThreshold(player.level, player.junglerStacks >= 5);
        const frac = Math.min(1, thresh / mob.maxHp);
        ctx.fillStyle = mob.hp <= thresh ? '#FFFFFF' : '#EF4444';
        ctx.fillRect(bx + bw * frac - 1.5, by - 2, 3, 13);
      }
      if (isMajor || state.settings.basics.creepHpNumbers) {
        ctx.fillStyle = isMajor ? '#FEF08A' : '#FFFFFF';
        ctx.font = `bold ${isMajor ? 11 : 10}px monospace`;
        ctx.textAlign = 'center';
        const label = isMajor
          ? `${mob.kind === 'lord' ? `LORD S${mob.lordStage}` : 'TURTLE'} ${Math.ceil(mob.hp)} / ${mob.maxHp}`
          : `${Math.ceil(mob.hp)}`;
        ctx.fillText(label, sp.x, by - 5);
      }
    }

    // E. Minion HP Bars (Super Minions & Allied Lord show thicker gold-trimmed bars!)
    for (const m of state.minions) {
      if (!m.alive) continue;
      const sp = this.projectToScreen(toThreeX(m.x), m.kind === 'lord_ally' ? 5.6 : m.kind === 'super' ? 3.2 : 2.35, toThreeZ(m.y));
      if (!sp.visible || sp.x < -40 || sp.x > this.width + 40 || sp.y < -20 || sp.y > this.height + 20) continue;
      const bw = m.kind === 'lord_ally' ? 94 : m.kind === 'super' ? 42 : 28;
      const bh = m.kind === 'lord_ally' ? 7 : m.kind === 'super' ? 5 : 4;
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(sp.x - bw / 2 - 1, sp.y - 1, bw + 2, bh + 2);
      ctx.fillStyle = m.kind === 'lord_ally' ? '#F59E0B' : m.team === 'blue' ? '#38BDF8' : '#FB7185';
      ctx.fillRect(sp.x - bw / 2, sp.y, bw * Math.max(0, m.hp / m.maxHp), bh);
      if (m.kind === 'lord_ally') {
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`LORD ${Math.ceil(m.hp)}`, sp.x, sp.y - 4);
      }
    }

    // F. Hero Overhead MLBB Bars (Delayed Catch-Up Trail, Shield, 1000-HP Segments, Mana, Level, Bush Eye, Emote)
    for (const h of state.heroes) {
      if (!h.alive) continue;
      if (h.team === 'red' && !state.visibleEnemyIds.has(h.id)) continue;
      const sp = this.projectToScreen(toThreeX(h.x), 4.4, toThreeZ(h.y));
      if (!sp.visible || sp.x < -100 || sp.x > this.width + 100 || sp.y < -60 || sp.y > this.height + 60) continue;

      const bw = 84;
      const bh = 9;
      const bx = sp.x - bw / 2;
      const by = sp.y;

      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(8,12,24,0.75)';
      ctx.fillText(h.heroDef.name, sp.x + 1, by - 6);
      ctx.fillStyle = h.isPlayer ? '#FDE047' : '#FFFFFF';
      ctx.fillText(h.heroDef.name, sp.x, by - 7);

      ctx.fillStyle = 'rgba(8,12,24,0.92)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 5);

      const trailW = bw * Math.max(0, Math.min(1, h.hpTrail / h.maxHp));
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(bx, by, trailW, bh);

      const hpW = bw * Math.max(0, Math.min(1, h.hp / h.maxHp));
      ctx.fillStyle = h.isPlayer ? '#2CE58B' : h.team === 'blue' ? '#38BDF8' : '#EF4444';
      ctx.fillRect(bx, by, hpW, bh);

      if (h.shield > 0) {
        const shW = bw * Math.min(1, h.shield / h.maxHp);
        ctx.fillStyle = 'rgba(224,242,254,0.88)';
        ctx.fillRect(bx + Math.max(0, hpW - shW), by, shW, 4);
      }

      const segs = Math.floor(h.maxHp / 1000);
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      for (let s = 1; s <= segs; s++) {
        ctx.fillRect(bx + (s * 1000 * bw) / h.maxHp, by, 1.4, bh);
      }

      if (h.heroDef.resource !== 'none') {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(bx, by + bh + 1, bw * Math.max(0, h.mana / Math.max(1, h.maxMana)), 3);
      }

      // Level Badge
      ctx.beginPath();
      ctx.arc(bx - 10, by + 5, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      ctx.strokeStyle = '#F5C451';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${h.level}`, bx - 10, by + 5.5);
      ctx.textBaseline = 'alphabetic';

      if (h.ccType) {
        ctx.fillStyle = h.ccType === 'suppression' ? '#EF4444' : '#FACC15';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(h.ccType.toUpperCase(), sp.x, by - 20);
      }

      // Bright Pulsing Overhead Vision Eye (👁️) when spotted inside a bush or revealed by enemies!
      if (h.team === 'blue' && h.spottedByEnemy && (h.inBush || h.isPlayer)) {
        const eyeY = by - (h.ccType ? 36 : 24);
        const pulse = 0.72 + Math.sin(state.matchTimeSec * 12) * 0.28;
        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, eyeY, 13 + pulse * 5, 0, Math.PI * 2);
        ctx.strokeStyle = h.inBush ? `rgba(239,68,68,${(0.75 * pulse).toFixed(2)})` : `rgba(250,204,21,${(0.7 * pulse).toFixed(2)})`;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sp.x, eyeY, 12, 0, Math.PI * 2);
        ctx.fillStyle = h.inBush ? 'rgba(239,68,68,0.95)' : 'rgba(250,204,21,0.92)';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = '13px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText('👁️', sp.x, eyeY + 1);
        ctx.textBaseline = 'alphabetic';
        ctx.restore();
      }

      // Emote Bubble
      if (h.activeEmote && h.activeEmote.ttl > 0) {
        const ey = by - 46;
        ctx.fillStyle = 'rgba(11,19,43,0.94)';
        ctx.strokeStyle = h.activeEmote.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sp.x - 40, ey - 16, 80, 30, 12);
        ctx.fill();
        ctx.stroke();
        ctx.font = '14px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(h.activeEmote.icon, sp.x - 20, ey);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(h.activeEmote.callout, sp.x + 12, ey);
        ctx.textBaseline = 'alphabetic';
      }
    }

    // G. Floating Damage Text (Layer 5 — Enlarged Gold Crits with !, Orange Physical, Purple Magic, White True, Green Heal, Cyan Shield)
    for (const v of state.vfxs) {
      const alpha = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
      if (v.kind === 'text' && v.text && state.settings.basics.damageText) {
        const sp = this.projectToScreen(toThreeX(v.x), 3.1 + (1 - alpha) * 2.4, toThreeZ(v.y));
        if (!sp.visible) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${v.isCrit ? 21 : 15}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(v.text, sp.x + 1.5, sp.y + 1.5);
        ctx.fillStyle = v.color;
        ctx.fillText(v.text, sp.x, sp.y);
        ctx.restore();
      }
    }

    // H. Overhead Part 4 Stack Rings & CC Badges on 3D Projected Heroes
    for (const h of state.heroes) {
      if (!h.alive && (h.eggFormTimer ?? 0) <= 0) continue;
      if (h.team === 'red' && !state.visibleEnemyIds.has(h.id)) continue;
      const ccBadge = getHeroCcBadge(h);
      const stackBadge = getHeroStackBadge(h);
      if (!ccBadge && !stackBadge) continue;
      const sp = this.projectToScreen(toThreeX(h.x), 5.9 * (h.modelScale || 1) + (h.leapZ || 0), toThreeZ(h.y));
      if (!sp.visible) continue;
      if (ccBadge) {
        ctx.save();
        ctx.fillStyle = ccBadge.bg;
        ctx.fillRect(sp.x - 36, sp.y - 34, 72, 15);
        ctx.fillStyle = ccBadge.color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ccBadge.text, sp.x, sp.y - 23);
        ctx.restore();
      }
      if (stackBadge) {
        ctx.save();
        ctx.fillStyle = 'rgba(11,19,43,0.88)';
        ctx.fillRect(sp.x - 34, sp.y + 18, 68, 13);
        ctx.fillStyle = stackBadge.color;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(stackBadge.label, sp.x, sp.y + 27);
        ctx.restore();
      }
    }

    // I. Helcurt Dark Night Falls 3.5s Global Blind Vignette Overlay
    if (state.playerBlinded) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.14,
        this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.56
      );
      grad.addColorStop(0, 'rgba(15,6,32,0.16)');
      grad.addColorStop(1, 'rgba(5,2,18,0.88)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.clearDynamicGroup();
    if (this.mapHandle) {
      this.mapHandle.dispose();
      this.mapHandle = null;
    }
    this.projGeo.dispose();
    this.haloGeo.dispose();
    this.ringGeo.dispose();
    this.domeGeo.dispose();
    this.slashGeo.dispose();
    this.coinGeo.dispose();

    this.scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (m.geometry && !m.geometry.userData?.noDispose) m.geometry.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        if (!mat || mat.userData?.noDispose) continue;
        mat.dispose();
      }
    });

    this.envTexture?.dispose();
    this.envTexture = null;
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
