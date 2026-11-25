import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MobaWeaponKind, NarutoShinobiDef, SupercarBodyStyle } from './arenaRoster';
import { getViewportSize } from './viewport';

export function detectSoftwareWebGL(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const probe = document.createElement('canvas');
    const gl =
      (probe.getContext('webgl2') as WebGLRenderingContext | WebGL2RenderingContext | null) ||
      (probe.getContext('webgl') as WebGLRenderingContext | null) ||
      (probe.getContext('experimental-webgl') as WebGLRenderingContext | null);
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

export interface StudioThreeOptions {
  skyColor: number;
  fogColor: number;
  fogNear?: number;
  fogFar?: number;
  keyColor?: number;
  keyIntensity?: number;
  hemiSky?: number;
  hemiGround?: number;
  hemiIntensity?: number;
  shadowExtent?: number;
  fov?: number;
  far?: number;
  withOverlayCanvas?: boolean;
  useContainerSize?: boolean;
}

export class StudioThreeContext {
  container: HTMLElement;
  isSoftwareGl: boolean;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  keyLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  envTexture: THREE.Texture | null = null;
  overlayCanvas: HTMLCanvasElement | null = null;
  overlayCtx: CanvasRenderingContext2D | null = null;
  width = 800;
  height = 600;
  disposed = false;
  contextLost = false;
  private frameHandle: number | null = null;
  private timeoutHandle: number | null = null;
  private extraTextures: THREE.Texture[] = [];
  private useContainerSize = false;

  constructor(container: HTMLElement, opts: StudioThreeOptions) {
    this.container = container;
    this.container.innerHTML = '';
    this.useContainerSize = Boolean(opts.useContainerSize);
    this.isSoftwareGl = detectSoftwareWebGL();
    const vp = getViewportSize();
    this.width = Math.max(240, this.useContainerSize && container.clientWidth ? container.clientWidth : vp.width);
    this.height = Math.max(240, this.useContainerSize && container.clientHeight ? container.clientHeight : vp.height);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance'
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;';
    this.container.appendChild(this.renderer.domElement);

    if (opts.withOverlayCanvas !== false) {
      this.overlayCanvas = document.createElement('canvas');
      this.overlayCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;';
      this.overlayCtx = this.overlayCanvas.getContext('2d');
      this.container.appendChild(this.overlayCanvas);
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(opts.skyColor);
    this.scene.fog = new THREE.Fog(opts.fogColor, opts.fogNear ?? 45, opts.fogFar ?? 190);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    this.envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();
    this.scene.environment = this.envTexture;
    pmremGenerator.dispose();

    this.camera = new THREE.PerspectiveCamera(
      opts.fov ?? 60,
      this.width / Math.max(1, this.height),
      0.2,
      opts.far ?? 320
    );

    this.hemiLight = new THREE.HemisphereLight(
      opts.hemiSky ?? 0x93c5fd,
      opts.hemiGround ?? 0x2a3324,
      opts.hemiIntensity ?? 0.72
    );
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(opts.keyColor ?? 0xfff3d6, opts.keyIntensity ?? 1.85);
    this.keyLight.position.set(28, 46, 22);
    if (!this.isSoftwareGl) {
      const d = opts.shadowExtent ?? 42;
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.set(1024, 1024);
      this.keyLight.shadow.camera.left = -d;
      this.keyLight.shadow.camera.right = d;
      this.keyLight.shadow.camera.top = d;
      this.keyLight.shadow.camera.bottom = -d;
      this.keyLight.shadow.camera.near = 2;
      this.keyLight.shadow.camera.far = 140;
      this.keyLight.shadow.bias = -0.0005;
      this.keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.keyLight);

    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
    this.resize();
  }

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.contextLost = true;
  };

  private onContextRestored = (): void => {
    this.contextLost = false;
  };

  prewarm(): void {
    if (!this.isSoftwareGl && !this.disposed) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  resize(): void {
    if (this.disposed) return;
    const vp = getViewportSize();
    const cw = this.useContainerSize ? this.container.clientWidth : 0;
    const ch = this.useContainerSize ? this.container.clientHeight : 0;
    this.width = Math.max(240, cw || vp.width);
    this.height = Math.max(240, ch || vp.height);
    this.camera.aspect = this.width / Math.max(1, this.height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
    if (this.overlayCanvas && this.overlayCtx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.overlayCanvas.width = Math.floor(this.width * dpr);
      this.overlayCanvas.height = Math.floor(this.height * dpr);
      this.overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  trackTexture<T extends THREE.Texture>(tex: T): T {
    this.extraTextures.push(tex);
    return tex;
  }

  createCanvasTexture(
    size: number,
    drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
    repeatX = 1,
    repeatY = 1
  ): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (ctx) drawFn(ctx, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = Math.min(8, Math.max(1, this.renderer.capabilities.getMaxAnisotropy?.() || 1));
    return this.trackTexture(tex);
  }

  clearOverlay(): void {
    if (this.overlayCtx) {
      this.overlayCtx.clearRect(0, 0, this.width, this.height);
    }
  }

  render(): void {
    if (this.disposed || this.contextLost) return;
    this.renderer.render(this.scene, this.camera);
  }

  cancelPendingFrame(): void {
    if (this.frameHandle !== null) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  scheduleNextFrame(cb: () => void): void {
    if (this.disposed) return;
    this.cancelPendingFrame();
    if (this.isSoftwareGl) {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = typeof gl.fenceSync === 'function' ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (this.disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          this.timeoutHandle = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.timeoutHandle = window.setTimeout(() => {
            if (!this.disposed) cb();
          }, 80);
        }
      };
      this.timeoutHandle = window.setTimeout(poll, 5);
    } else {
      this.frameHandle = requestAnimationFrame(() => {
        if (!this.disposed) cb();
      });
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelPendingFrame();
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);

    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry && !mesh.geometry.userData?.noDispose) mesh.geometry.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats) {
        if (!m || m.userData?.noDispose) continue;
        const std = m as THREE.MeshStandardMaterial;
        std.map?.dispose();
        std.normalMap?.dispose();
        std.roughnessMap?.dispose();
        std.metalnessMap?.dispose();
        std.emissiveMap?.dispose();
        m.dispose();
      }
    });

    for (const tex of this.extraTextures) tex.dispose();
    this.extraTextures = [];
    this.envTexture?.dispose();
    this.envTexture = null;
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}

let cachedContactShadowGeo: THREE.PlaneGeometry | null = null;
const cachedContactShadowMats = new Map<number, THREE.MeshBasicMaterial>();

export function createContactShadowMesh(radius = 1.15, opacity = 0.42): THREE.Mesh {
  if (!cachedContactShadowGeo) {
    cachedContactShadowGeo = new THREE.PlaneGeometry(2, 2);
    cachedContactShadowGeo.userData.noDispose = true;
  }
  const key = Math.round(opacity * 100);
  let mat = cachedContactShadowMats.get(key);
  if (!mat) {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    if (ctx) {
      const g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
      g.addColorStop(0, `rgba(0,0,0,${key / 100})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    mat.userData.noDispose = true;
    cachedContactShadowMats.set(key, mat);
  }
  const mesh = new THREE.Mesh(cachedContactShadowGeo, mat);
  mesh.scale.set(radius, radius, 1);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.03;
  return mesh;
}

let cachedToonGradient: THREE.DataTexture | null = null;

/** Cached 4-band step ramp for crisp 2D-style cel shading in WebGL scenes. */
export function getToonGradientMap(): THREE.DataTexture {
  if (cachedToonGradient) return cachedToonGradient;
  const bands = new Uint8Array([76, 148, 212, 255]);
  const tex = new THREE.DataTexture(bands, 4, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cachedToonGradient = tex;
  return tex;
}

export function createToonMaterial(
  color: number,
  opts?: { emissive?: number; emissiveIntensity?: number; side?: THREE.Side; transparent?: boolean; opacity?: number }
): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({
    color,
    gradientMap: getToonGradientMap(),
    emissive: opts?.emissive ?? 0x000000,
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
    side: opts?.side ?? THREE.FrontSide,
    transparent: opts?.transparent ?? false,
    opacity: opts?.opacity ?? 1
  });
}

/** Attaches a crisp 2D cartoon inverted-hull ink outline as a child of the target mesh. */
export function addInkOutline(mesh: THREE.Mesh, scale = 1.08, color = 0x090d16): THREE.Mesh {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color, side: THREE.BackSide })
  );
  outline.scale.setScalar(scale);
  outline.castShadow = false;
  outline.receiveShadow = false;
  mesh.add(outline);
  return outline;
}

/** Composite 9-part tactical soldier grounded at bottom-center (y=0). */
export function buildSoldierMesh(
  armorColor: number,
  helmetColor: number,
  visorColor: number,
  scale = 1,
  celShaded = false
): { group: THREE.Group; muzzle: THREE.Object3D } {
  const group = new THREE.Group();
  const darkMat = celShaded
    ? createToonMaterial(0x1e293b)
    : new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.15 });
  const armorMat = celShaded
    ? createToonMaterial(armorColor)
    : new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.45, metalness: 0.3 });
  const helmetMat = celShaded
    ? createToonMaterial(helmetColor)
    : new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.35, metalness: 0.45 });
  const steelMat = celShaded
    ? createToonMaterial(0x475569)
    : new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.25, metalness: 0.85 });
  const visorMat = celShaded
    ? createToonMaterial(visorColor, { emissive: visorColor, emissiveIntensity: 0.5 })
    : new THREE.MeshStandardMaterial({
        color: visorColor,
        emissive: visorColor,
        emissiveIntensity: 0.7,
        roughness: 0.15,
        metalness: 0.9
      });

  // Boots + Legs
  const legGeo = new THREE.BoxGeometry(0.24, 0.72, 0.26);
  const legL = new THREE.Mesh(legGeo, darkMat);
  legL.position.set(-0.18, 0.36, 0);
  const legR = new THREE.Mesh(legGeo, darkMat);
  legR.position.set(0.18, 0.36, 0);
  group.add(legL, legR);

  // Armored Torso + Tactical Vest
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.78, 0.42), armorMat);
  torso.position.set(0, 1.11, 0);
  torso.castShadow = true;
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.22), darkMat);
  pack.position.set(0, 1.12, -0.3);
  group.add(torso, pack);

  // Helmet + Visor
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.46), helmetMat);
  head.position.set(0, 1.74, 0);
  head.castShadow = true;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.1), visorMat);
  visor.position.set(0, 1.75, 0.22);
  group.add(head, visor);

  // Arms + Assault Rifle + Barrel + Optic
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.54, 0.22), armorMat);
  armR.position.set(0.44, 1.15, 0.12);
  armR.rotation.x = -0.7;
  const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.9), steelMat);
  rifleBody.position.set(0.32, 1.15, 0.52);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.48, 8), steelMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.32, 1.17, 1.05);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0.32, 1.17, 1.32);

  if (celShaded) {
    addInkOutline(torso, 1.08);
    addInkOutline(head, 1.09);
    addInkOutline(legL, 1.1);
    addInkOutline(legR, 1.1);
    addInkOutline(rifleBody, 1.12);
  }

  group.add(armR, rifleBody, barrel, muzzle, createContactShadowMesh(0.7, 0.38));
  group.scale.setScalar(scale);
  return { group, muzzle };
}

/** Composite stylized MOBA champion grounded at y=0 with class-specific 3D weapon & armor. */
export function buildMobaHeroMesh(
  bodyColor: number,
  cloakColor: number,
  bladeColor: number,
  scale = 1,
  weapon: MobaWeaponKind = 'sword',
  celShaded = false
): THREE.Group {
  const group = new THREE.Group();
  const baseMat = celShaded
    ? createToonMaterial(bodyColor)
    : new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.42, metalness: 0.35 });
  const cloakMat = celShaded
    ? createToonMaterial(cloakColor)
    : new THREE.MeshStandardMaterial({ color: cloakColor, roughness: 0.78, metalness: 0.08 });
  const goldMat = celShaded
    ? createToonMaterial(0xfacc15)
    : new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.28, metalness: 0.82 });
  const bladeMat = celShaded
    ? createToonMaterial(bladeColor, { emissive: bladeColor, emissiveIntensity: 0.42 })
    : new THREE.MeshStandardMaterial({
        color: bladeColor,
        emissive: bladeColor,
        emissiveIntensity: 0.72,
        roughness: 0.25,
        metalness: 0.86
      });
  const woodMat = celShaded
    ? createToonMaterial(0x78350f)
    : new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8, metalness: 0.12 });

  const legs = new THREE.Mesh(
    new THREE.CylinderGeometry(weapon === 'shield' ? 0.36 : 0.28, weapon === 'shield' ? 0.42 : 0.34, 0.72, 8),
    baseMat
  );
  legs.position.set(0, 0.36, 0);
  const chestW = weapon === 'shield' ? 0.94 : weapon === 'daggers' ? 0.68 : 0.76;
  const chest = new THREE.Mesh(new THREE.BoxGeometry(chestW, 0.82, 0.46), baseMat);
  chest.position.set(0, 1.12, 0);
  chest.castShadow = true;

  const pauldronSize = weapon === 'shield' ? 0.32 : weapon === 'daggers' ? 0.2 : 0.26;
  const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(pauldronSize, 8, 8), goldMat);
  pauldronL.position.set(-chestW * 0.66, 1.44, 0);
  const pauldronR = new THREE.Mesh(new THREE.SphereGeometry(pauldronSize, 8, 8), goldMat);
  pauldronR.position.set(chestW * 0.66, 1.44, 0);

  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.05, 0.1), cloakMat);
  cape.position.set(0, 1.0, -0.28);
  cape.rotation.x = 0.18;

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), goldMat);
  head.position.set(0, 1.78, 0);

  if (celShaded) {
    addInkOutline(legs, 1.08);
    addInkOutline(chest, 1.08);
    addInkOutline(pauldronL, 1.1);
    addInkOutline(pauldronR, 1.1);
    addInkOutline(cape, 1.09);
    addInkOutline(head, 1.09);
  }

  // Class-specific headgear accent
  if (weapon === 'staff') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.62, 7), cloakMat);
    hat.position.set(0, 2.25, 0);
    if (celShaded) addInkOutline(hat, 1.09);
    group.add(hat);
  } else if (weapon === 'bow') {
    const hood = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.3, 0.52), cloakMat);
    hood.position.set(0, 1.98, -0.02);
    if (celShaded) addInkOutline(hood, 1.09);
    group.add(hood);
  } else if (weapon === 'daggers') {
    const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.52), cloakMat);
    scarf.position.set(0, 1.62, 0.04);
    if (celShaded) addInkOutline(scarf, 1.09);
    group.add(scarf);
  } else if (weapon === 'halberd') {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 6, 16), bladeMat);
    halo.position.set(0, 2.1, -0.18);
    group.add(halo);
  } else {
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 4), bladeMat);
    crest.position.set(0, 2.15, 0);
    if (celShaded) addInkOutline(crest, 1.12);
    group.add(crest);
  }

  // Class-specific 3D weapon
  if (weapon === 'staff') {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.75, 8), woodMat);
    shaft.position.set(0.64, 1.15, 0.32);
    shaft.rotation.x = 0.32;
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), bladeMat);
    orb.position.set(0.64, 2.02, 0.6);
    if (celShaded) addInkOutline(orb, 1.1);
    group.add(shaft, orb);
  } else if (weapon === 'bow') {
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 14, Math.PI * 1.1), woodMat);
    bowArc.position.set(0.62, 1.28, 0.42);
    bowArc.rotation.y = Math.PI / 2;
    bowArc.rotation.z = -Math.PI * 0.55;
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 6), bladeMat);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0.62, 1.28, 0.72);
    group.add(bowArc, arrow);
  } else if (weapon === 'shield') {
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.78), bladeMat);
    shield.position.set(-0.68, 1.12, 0.24);
    shield.rotation.y = 0.25;
    const mace = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.24), goldMat);
    mace.position.set(0.68, 1.2, 0.32);
    mace.rotation.x = 0.45;
    if (celShaded) {
      addInkOutline(shield, 1.09);
      addInkOutline(mace, 1.1);
    }
    group.add(shield, mace);
  } else if (weapon === 'daggers') {
    const dagL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.14), bladeMat);
    dagL.position.set(-0.6, 1.08, 0.38);
    dagL.rotation.x = 0.85;
    const dagR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.14), bladeMat);
    dagR.position.set(0.6, 1.08, 0.38);
    dagR.rotation.x = 0.85;
    if (celShaded) {
      addInkOutline(dagL, 1.12);
      addInkOutline(dagR, 1.12);
    }
    group.add(dagL, dagR);
  } else if (weapon === 'halberd') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.85, 8), goldMat);
    pole.position.set(0.65, 1.18, 0.32);
    pole.rotation.x = 0.35;
    const axe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.44), bladeMat);
    axe.position.set(0.65, 1.92, 0.6);
    axe.rotation.x = 0.35;
    if (celShaded) addInkOutline(axe, 1.1);
    group.add(pole, axe);
  } else {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.42, 0.1), bladeMat);
    sword.position.set(0.66, 1.25, 0.35);
    sword.rotation.x = 0.55;
    if (celShaded) addInkOutline(sword, 1.1);
    group.add(sword);
  }

  group.add(legs, chest, pauldronL, pauldronR, cape, head, createContactShadowMesh(0.95, 0.42));
  group.scale.setScalar(scale);
  return group;
}

/** Composite multi-part sculpted supercar with 4 distinct body styles, tires grounded at y=0. */
export function buildSupercarMesh(
  paintColor: number,
  stripeColor: number,
  isSoftwareGl: boolean,
  style: SupercarBodyStyle = 'gt',
  celShaded = false
): { group: THREE.Group; wheels: THREE.Mesh[]; flameL: THREE.Mesh; flameR: THREE.Mesh } {
  const group = new THREE.Group();
  const bodyMat = celShaded
    ? createToonMaterial(paintColor)
    : new THREE.MeshStandardMaterial({ color: paintColor, roughness: 0.26, metalness: 0.78 });
  const stripeMat = celShaded
    ? createToonMaterial(stripeColor)
    : new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.28, metalness: 0.65 });
  const glassMat = celShaded
    ? createToonMaterial(0x1e293b, { emissive: 0x38bdf8, emissiveIntensity: 0.16 })
    : new THREE.MeshPhysicalMaterial({
        color: 0x0f172a,
        roughness: 0.12,
        metalness: 0.2,
        clearcoat: 1.0,
        transparent: true,
        opacity: isSoftwareGl ? 0.72 : 0.85
      });
  const tireMat = celShaded
    ? createToonMaterial(0x111827)
    : new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.88, metalness: 0.1 });
  const rimMat = celShaded
    ? createToonMaterial(0xf8fafc)
    : new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.25, metalness: 0.9 });
  const tailMat = celShaded
    ? createToonMaterial(0xff2244, { emissive: 0xff2244, emissiveIntensity: 1.0 })
    : new THREE.MeshStandardMaterial({
        color: 0xff2244,
        emissive: 0xff2244,
        emissiveIntensity: 1.6,
        roughness: 0.25
      });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });

  const chassisW = style === 'heavy' ? 2.18 : style === 'hyper' ? 2.08 : 1.96;
  const chassisH = style === 'heavy' ? 0.56 : style === 'hyper' ? 0.38 : 0.44;
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(chassisW, chassisH, 4.35), bodyMat);
  chassis.position.set(0, 0.48, 0);
  chassis.castShadow = true;

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(style === 'heavy' ? 1.62 : 1.48, style === 'hyper' ? 0.36 : 0.42, 1.95),
    glassMat
  );
  cabin.position.set(0, style === 'heavy' ? 0.96 : 0.86, -0.15);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.09, 1.35), bodyMat);
  roof.position.set(0, style === 'heavy' ? 1.18 : 1.09, -0.2);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 4.25), stripeMat);
  stripe.position.set(0, style === 'heavy' ? 0.77 : 0.71, 0);

  if (celShaded) {
    addInkOutline(chassis, 1.055);
    addInkOutline(cabin, 1.07);
    addInkOutline(roof, 1.08);
  }

  if (style === 'hyper') {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.44, 1.45), stripeMat);
    fin.position.set(0, 1.18, -1.25);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.2, 0.7), stripeMat);
    nose.position.set(0, 0.36, 2.2);
    if (celShaded) {
      addInkOutline(fin, 1.1);
      addInkOutline(nose, 1.07);
    }
    group.add(fin, nose);
  } else if (style === 'heavy') {
    const ram = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.44, 0.36), stripeMat);
    ram.position.set(0, 0.46, 2.22);
    const blower = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, 0.75), rimMat);
    blower.position.set(0, 0.88, 1.05);
    if (celShaded) {
      addInkOutline(ram, 1.07);
      addInkOutline(blower, 1.08);
    }
    group.add(ram, blower);
  } else if (style === 'drift') {
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.1, 0.52), stripeMat);
    splitter.position.set(0, 0.26, 2.15);
    const skirtL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 2.8), stripeMat);
    skirtL.position.set(-1.02, 0.28, 0);
    const skirtR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 2.8), stripeMat);
    skirtR.position.set(1.02, 0.28, 0);
    if (celShaded) addInkOutline(splitter, 1.07);
    group.add(splitter, skirtL, skirtR);
  }

  // Rear Wing Spoiler + Struts (scaled higher for drift)
  const wingY = style === 'drift' ? 1.24 : style === 'heavy' ? 1.08 : 1.04;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(chassisW + 0.08, 0.08, 0.4), stripeMat);
  wing.position.set(0, wingY, -1.96);
  const strutH = style === 'drift' ? 0.52 : 0.34;
  const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.08, strutH, 0.14), tireMat);
  strutL.position.set(-0.62, wingY - strutH * 0.5, -1.95);
  const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.08, strutH, 0.14), tireMat);
  strutR.position.set(0.62, wingY - strutH * 0.5, -1.95);
  if (celShaded) addInkOutline(wing, 1.09);

  // Tail lights + Nitro exhaust flames
  const tail = new THREE.Mesh(new THREE.BoxGeometry(chassisW - 0.18, 0.1, 0.06), tailMat);
  tail.position.set(0, 0.56, -2.18);
  const flameGeo = new THREE.ConeGeometry(0.14, 0.85, 8);
  flameGeo.rotateX(-Math.PI / 2);
  const flameL = new THREE.Mesh(flameGeo, flameMat);
  flameL.position.set(-0.46, 0.36, -2.55);
  flameL.visible = false;
  const flameR = new THREE.Mesh(flameGeo, flameMat);
  flameR.position.set(0.46, 0.36, -2.55);
  flameR.visible = false;

  // 4 Wheels touching ground at y=0 (radius 0.36)
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.3, 10);
  rimGeo.rotateZ(Math.PI / 2);
  const wxOff = chassisW * 0.5;
  const wheelCoords: [number, number, number][] = [
    [-wxOff, 0.36, 1.32],
    [wxOff, 0.36, 1.32],
    [-wxOff, 0.36, -1.32],
    [wxOff, 0.36, -1.32]
  ];
  for (const [wx, wy, wz] of wheelCoords) {
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.position.set(wx, wy, wz);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    tire.add(rim);
    if (celShaded) addInkOutline(tire, 1.08);
    group.add(tire);
    wheels.push(tire);
  }

  group.add(
    chassis,
    cabin,
    roof,
    stripe,
    wing,
    strutL,
    strutR,
    tail,
    flameL,
    flameR,
    createContactShadowMesh(2.4, 0.48)
  );
  return { group, wheels, flameL, flameR };
}

export interface BasketballPlayerRig {
  group: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  activeRing: THREE.Mesh;
}

/** Composite cel-shaded NBA-style hoopster grounded at y=0 with articulated limbs, jersey trim & optional custom shoe colors. */
export function buildBasketballPlayerMesh(
  jerseyColor: number,
  trimColor: number,
  skinColor: number,
  isHome: boolean,
  scale = 1,
  celShaded = true,
  shoeColors?: { upper: number; sole: number; accent: number }
): BasketballPlayerRig {
  const group = new THREE.Group();
  const jerseyMat = celShaded
    ? createToonMaterial(jerseyColor)
    : new THREE.MeshStandardMaterial({ color: jerseyColor, roughness: 0.55, metalness: 0.1 });
  const trimMat = celShaded
    ? createToonMaterial(trimColor)
    : new THREE.MeshStandardMaterial({ color: trimColor, roughness: 0.4, metalness: 0.25 });
  const skinMat = celShaded
    ? createToonMaterial(skinColor)
    : new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65, metalness: 0.05 });
  const upperCol = shoeColors?.upper ?? (isHome ? 0xf8fafc : 0x111827);
  const soleCol = shoeColors?.sole ?? 0xf8fafc;
  const accentCol = shoeColors?.accent ?? trimColor;
  const sneakerMat = celShaded
    ? createToonMaterial(upperCol)
    : new THREE.MeshStandardMaterial({ color: upperCol, roughness: 0.45 });
  const soleMat = celShaded
    ? createToonMaterial(soleCol)
    : new THREE.MeshStandardMaterial({ color: soleCol, roughness: 0.5 });
  const shoeAccentMat = celShaded
    ? createToonMaterial(accentCol)
    : new THREE.MeshStandardMaterial({ color: accentCol, roughness: 0.35 });
  const hairMat = celShaded
    ? createToonMaterial(0x111827)
    : new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });

  // Sneakers (Upper + Sole + Accent Stripe) + Legs
  const shoeGeo = new THREE.BoxGeometry(0.22, 0.13, 0.34);
  const soleGeo = new THREE.BoxGeometry(0.23, 0.05, 0.36);
  const stripeGeo = new THREE.BoxGeometry(0.24, 0.04, 0.16);
  const legGeo = new THREE.BoxGeometry(0.18, 0.62, 0.2);

  const legL = new THREE.Mesh(legGeo, skinMat);
  legL.position.set(-0.16, 0.44, 0);
  const shoeL = new THREE.Mesh(shoeGeo, sneakerMat);
  shoeL.position.set(0, -0.35, 0.06);
  const soleL = new THREE.Mesh(soleGeo, soleMat);
  soleL.position.set(0, -0.07, 0);
  const accentL = new THREE.Mesh(stripeGeo, shoeAccentMat);
  accentL.position.set(0, 0.01, 0.02);
  shoeL.add(soleL, accentL);
  legL.add(shoeL);

  const legR = new THREE.Mesh(legGeo, skinMat);
  legR.position.set(0.16, 0.44, 0);
  const shoeR = new THREE.Mesh(shoeGeo, sneakerMat);
  shoeR.position.set(0, -0.35, 0.06);
  const soleR = new THREE.Mesh(soleGeo, soleMat);
  soleR.position.set(0, -0.07, 0);
  const accentR = new THREE.Mesh(stripeGeo, shoeAccentMat);
  accentR.position.set(0, 0.01, 0.02);
  shoeR.add(soleR, accentR);
  legR.add(shoeR);

  // Shorts
  const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.36), jerseyMat);
  shorts.position.set(0, 0.8, 0);
  const waistband = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.07, 0.38), trimMat);
  waistband.position.set(0, 0.96, 0);

  // Jersey Torso + Collar Trim
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.34), jerseyMat);
  torso.position.set(0, 1.32, 0);
  torso.castShadow = true;
  const stripeFront = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.36), trimMat);
  stripeFront.position.set(0, 1.36, 0);

  // Head + Headband
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.38), skinMat);
  head.position.set(0, 1.88, 0);
  head.castShadow = true;
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), hairMat);
  hair.position.set(0, 2.06, -0.01);
  const headband = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.08, 0.41), trimMat);
  headband.position.set(0, 1.98, 0);

  // Articulated Arms pivoted at shoulder y=1.58
  const armGeo = new THREE.BoxGeometry(0.16, 0.58, 0.18);
  const armL = new THREE.Group();
  armL.position.set(-0.4, 1.58, 0);
  const armLMesh = new THREE.Mesh(armGeo, skinMat);
  armLMesh.position.set(0, -0.26, 0);
  armL.add(armLMesh);

  const armR = new THREE.Group();
  armR.position.set(0.4, 1.58, 0);
  const armRMesh = new THREE.Mesh(armGeo, skinMat);
  armRMesh.position.set(0, -0.26, 0);
  armR.add(armRMesh);

  // Active selection ring on hardwood (visible only on controlled player)
  const activeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.82, 24),
    new THREE.MeshBasicMaterial({
      color: isHome ? 0x4ade80 : 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    })
  );
  activeRing.rotation.x = -Math.PI / 2;
  activeRing.position.y = 0.045;
  activeRing.visible = false;

  if (celShaded) {
    addInkOutline(torso, 1.07);
    addInkOutline(shorts, 1.07);
    addInkOutline(head, 1.08);
    addInkOutline(legL, 1.09);
    addInkOutline(legR, 1.09);
    addInkOutline(armLMesh, 1.09);
    addInkOutline(armRMesh, 1.09);
  }

  group.add(
    legL,
    legR,
    shorts,
    waistband,
    torso,
    stripeFront,
    head,
    hair,
    headband,
    armL,
    armR,
    activeRing,
    createContactShadowMesh(0.75, 0.42)
  );
  group.scale.setScalar(scale);
  return { group, armL, armR, legL, legR, activeRing };
}

/** Composite 3D military dune buggy for Battle Royale 3D island and lobby showcase, grounded at y=0. */
export function buildBuggyMesh(paintColor = 0x57534e): { group: THREE.Group; wheels: THREE.Mesh[] } {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: paintColor, roughness: 0.62, metalness: 0.32 });
  const cageMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.75 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.08 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.35,
    roughness: 0.3
  });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.42, 3.65), bodyMat);
  chassis.position.set(0, 0.56, 0);
  chassis.castShadow = true;
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.24, 1.25), bodyMat);
  hood.position.set(0, 0.8, 1.15);
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.28, 0.28), cageMat);
  bumper.position.set(0, 0.54, 1.9);

  // Open roll cage bars
  const barPositions: [number, number, number, number, number, number][] = [
    [-0.74, 1.25, -0.25, 0.09, 0.98, 0.09],
    [0.74, 1.25, -0.25, 0.09, 0.98, 0.09],
    [-0.74, 1.18, 0.62, 0.09, 0.85, 0.09],
    [0.74, 1.18, 0.62, 0.09, 0.85, 0.09],
    [0, 1.72, -0.25, 1.56, 0.09, 1.25]
  ];
  for (const [x, y, z, w, h, d] of barPositions) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cageMat);
    bar.position.set(x, y, z);
    group.add(bar);
  }

  const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.14, 0.16), accentMat);
  lightBar.position.set(0, 1.82, 0.32);

  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.34, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const coords: [number, number, number][] = [
    [-1.02, 0.46, 1.22],
    [1.02, 0.46, 1.22],
    [-1.05, 0.46, -1.25],
    [1.05, 0.46, -1.25]
  ];
  for (const [wx, wy, wz] of coords) {
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.position.set(wx, wy, wz);
    group.add(tire);
    wheels.push(tire);
  }

  group.add(chassis, hood, bumper, lightBar, createContactShadowMesh(2.2, 0.45));
  return { group, wheels };
}

export interface ShinobiMeshRig {
  group: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  chakraRing: THREE.Mesh;
  guardShield: THREE.Mesh;
  awakeningAura: THREE.Group;
}

/**
 * Composite cel-shaded anime Shinobi rig grounded at y=0 with village headband,
 * flak vest / Akatsuki cloak, hair spikes, signature ninja weapon, guard shield, and Awakening aura.
 */
export function buildShinobiMesh(
  hero: NarutoShinobiDef,
  scale = 1,
  isAwakened = false
): ShinobiMeshRig {
  const group = new THREE.Group();
  const primaryMat = createToonMaterial(hero.primaryColor);
  const accentMat = createToonMaterial(hero.accentColor);
  const hairMat = createToonMaterial(hero.hairColor);
  const skinMat = createToonMaterial(hero.faction === 'Boruto & Otsutsuki' ? 0xf1f5f9 : 0xfde68a);
  const darkMat = createToonMaterial(0x111827);
  const steelMat = createToonMaterial(0x94a3b8);
  const chakraMat = createToonMaterial(hero.chakraColor, {
    emissive: hero.chakraColor,
    emissiveIntensity: 0.72
  });

  // Ninja sandals & legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.66, 0.22);
  const legL = new THREE.Mesh(legGeo, darkMat);
  legL.position.set(-0.17, 0.36, 0);
  const legR = new THREE.Mesh(legGeo, darkMat);
  legR.position.set(0.17, 0.36, 0);
  addInkOutline(legL, 1.09);
  addInkOutline(legR, 1.09);

  // Torso + Flak Jacket / Cloak
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.76, 0.38), primaryMat);
  torso.position.set(0, 1.08, 0);
  torso.castShadow = true;
  addInkOutline(torso, 1.07);

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.48, 0.42), accentMat);
  vest.position.set(0, 1.15, 0);
  addInkOutline(vest, 1.07);

  // Flowing cloak or sash at back
  const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.96, 0.1), accentMat);
  cloak.position.set(0, 0.96, -0.24);
  cloak.rotation.x = 0.16;
  addInkOutline(cloak, 1.08);

  // Head + Headband Protector + Spiky Anime Hair
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.42), skinMat);
  head.position.set(0, 1.72, 0);
  head.castShadow = true;
  addInkOutline(head, 1.08);

  const headband = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.45), darkMat);
  headband.position.set(0, 1.82, 0);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.04), steelMat);
  plate.position.set(0, 1.82, 0.24);

  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 1.94, 0);
  const hairCrown = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.46), hairMat);
  hairGroup.add(hairCrown);
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5 + 0.3;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 5), hairMat);
    spike.position.set(Math.cos(ang) * 0.16, 0.14, Math.sin(ang) * 0.14);
    spike.rotation.z = -Math.cos(ang) * 0.42;
    spike.rotation.x = Math.sin(ang) * 0.35;
    hairGroup.add(spike);
  }

  // Otsutsuki horns if Otsutsuki faction
  if (hero.faction === 'Boruto & Otsutsuki' && hero.teamTags.includes('otsutsuki')) {
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 6), skinMat);
    hornL.position.set(-0.18, 2.1, 0.12);
    hornL.rotation.z = 0.25;
    const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.36, 6), skinMat);
    hornR.position.set(0.18, 2.1, 0.12);
    hornR.rotation.z = -0.25;
    group.add(hornL, hornR);
  }

  // Articulated Arms
  const armGeo = new THREE.BoxGeometry(0.18, 0.56, 0.18);
  const armL = new THREE.Group();
  armL.position.set(-0.42, 1.38, 0);
  const armLMesh = new THREE.Mesh(armGeo, primaryMat);
  armLMesh.position.set(0, -0.24, 0);
  addInkOutline(armLMesh, 1.09);
  armL.add(armLMesh);

  const armR = new THREE.Group();
  armR.position.set(0.42, 1.38, 0);
  const armRMesh = new THREE.Mesh(armGeo, primaryMat);
  armRMesh.position.set(0, -0.24, 0);
  addInkOutline(armRMesh, 1.09);
  armR.add(armRMesh);

  // Weapon attachment on right hand / back
  const wKind = hero.weapon;
  if (wKind === 'sword' || wKind === 'samehada') {
    const bladeW = wKind === 'samehada' ? 0.28 : 0.11;
    const bladeH = wKind === 'samehada' ? 1.48 : 1.25;
    const sword = new THREE.Mesh(
      new THREE.BoxGeometry(bladeW, bladeH, 0.08),
      wKind === 'samehada' ? createToonMaterial(0x1d4ed8) : steelMat
    );
    sword.position.set(0, -0.45, 0.45);
    sword.rotation.x = 0.85;
    addInkOutline(sword, 1.09);
    armR.add(sword);
  } else if (wKind === 'scythe') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.65, 8), darkMat);
    pole.position.set(0, -0.35, 0.38);
    pole.rotation.x = 0.65;
    const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.55), createToonMaterial(0xdc2626));
    blade1.position.set(0, 0.38, 0.68);
    const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.46), createToonMaterial(0xdc2626));
    blade2.position.set(0, 0.18, 0.62);
    armR.add(pole, blade1, blade2);
  } else if (wKind === 'fan') {
    const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.12, 0.08, 12), createToonMaterial(0xfafafa));
    fan.rotation.z = Math.PI / 2;
    fan.position.set(0.14, -0.32, 0.36);
    addInkOutline(fan, 1.08);
    armR.add(fan);
  } else if (wKind === 'gourd') {
    const gourd = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), createToonMaterial(0xd97706));
    gourd.scale.set(0.85, 1.35, 0.85);
    gourd.position.set(0, 1.25, -0.46);
    addInkOutline(gourd, 1.08);
    group.add(gourd);
  } else if (wKind === 'staff' || wKind === 'rods') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.72, 8), darkMat);
    staff.position.set(0, -0.25, 0.38);
    staff.rotation.x = 0.55;
    armR.add(staff);
  } else if (wKind === 'bones') {
    const boneL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.72, 6), createToonMaterial(0xf8fafc));
    boneL.position.set(0, -0.52, 0.25);
    boneL.rotation.x = Math.PI / 2;
    const boneR = boneL.clone();
    armL.add(boneL);
    armR.add(boneR);
  } else if (wKind === 'puppet') {
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.92, 10), createToonMaterial(0x991b1b));
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0, 1.48, -0.38);
    group.add(scroll);
  } else {
    // Kunai or Chakra Orb in right hand
    const kunai = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.44, 4), steelMat);
    kunai.rotation.x = Math.PI / 2;
    kunai.position.set(0, -0.45, 0.26);
    armR.add(kunai);
  }

  // Ground Chakra Ring
  const chakraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.68, 0.92, 28),
    new THREE.MeshBasicMaterial({
      color: hero.chakraColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    })
  );
  chakraRing.rotation.x = -Math.PI / 2;
  chakraRing.position.y = 0.04;

  // Guard Shield Sphere (visible when blocking in 3D Storm Mode)
  const guardShield = new THREE.Mesh(
    new THREE.SphereGeometry(1.25, 16, 14),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.34,
      wireframe: false,
      depthWrite: false
    })
  );
  guardShield.position.set(0, 1.1, 0);
  guardShield.visible = false;

  // True Awakening Aura (giant Susanoo ribs / Kurama tails / Six Paths Truth-Seeking Orbs)
  const awakeningAura = new THREE.Group();
  awakeningAura.position.set(0, 1.15, 0);
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI * 2) / 6;
    const rib = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.07, 6, 18, Math.PI * 0.8),
      chakraMat
    );
    rib.position.y = (i % 3) * 0.34 - 0.25;
    rib.rotation.x = Math.PI / 2;
    rib.rotation.z = ang;
    awakeningAura.add(rib);
  }
  awakeningAura.visible = isAwakened;

  group.add(
    legL,
    legR,
    torso,
    vest,
    cloak,
    head,
    headband,
    plate,
    hairGroup,
    armL,
    armR,
    chakraRing,
    guardShield,
    awakeningAura,
    createContactShadowMesh(0.86, 0.44)
  );
  group.scale.setScalar(scale * (isAwakened ? 1.45 : 1));
  return { group, armL, armR, legL, legR, chakraRing, guardShield, awakeningAura };
}



