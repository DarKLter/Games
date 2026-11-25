// ============================================================================
// NBA 2K14 — Persistent 3D Arena Spotlight Stage (Title Screen & Main Menu)
// Renders #6 LeBron James (or active MyPLAYER) under dramatic arena god-rays,
// crimson/gold ember particles, and glossy hardwood with tab-reactive camera.
// ============================================================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { PlayerData, TeamData } from '../types';
import { animatePlayerRig, createArticulatedPlayerRig, type ArticulatedPlayerRig } from './playerRig';

export type SpotlightCameraPreset =
  | 'title'
  | 'main'
  | 'quick'
  | 'path'
  | 'mycareer'
  | 'park'
  | 'modes'
  | 'features'
  | 'options';

const CAMERA_PRESETS: Record<SpotlightCameraPreset, { pos: [number, number, number]; look: [number, number, number] }> = {
  title: { pos: [0.3, 1.75, 4.6], look: [0, 1.32, 0] },
  main: { pos: [2.3, 2.05, 5.2], look: [-0.2, 1.25, 0] },
  quick: { pos: [-2.8, 2.1, 4.9], look: [0.2, 1.2, 0] },
  path: { pos: [0.9, 1.45, 3.65], look: [0, 1.42, 0] },
  mycareer: { pos: [-1.7, 1.65, 3.9], look: [0, 1.32, 0] },
  park: { pos: [3.6, 2.8, 5.8], look: [0, 1.1, 0] },
  modes: { pos: [2.8, 2.2, 4.6], look: [0, 1.2, 0] },
  features: { pos: [-2.4, 1.9, 4.4], look: [0, 1.3, 0] },
  options: { pos: [0.1, 2.6, 5.6], look: [0, 1.1, 0] },
};

export class SpotlightStageController {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private rig: ArticulatedPlayerRig | null = null;
  private ballMesh: THREE.Mesh;
  private embers: THREE.Points;
  private rafId = 0;
  private disposed = false;
  private isSoftwareGl = false;
  private targetPreset: SpotlightCameraPreset = 'title';
  private curCamPos = new THREE.Vector3(0.3, 1.75, 4.6);
  private curLookAt = new THREE.Vector3(0, 1.32, 0);
  private startTime = performance.now();
  private envTex: THREE.Texture | null = null;
  private disposables: { dispose: () => void }[] = [];
  private container: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, player: PlayerData, team: TeamData) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const gl = this.renderer.getContext();
    const rendererStr = String(gl.getParameter(gl.RENDERER) || '');
    this.isSoftwareGl = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(rendererStr);

    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#090a0d');
    this.scene.fog = new THREE.FogExp2('#090a0d', 0.055);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTex;
    pmrem.dispose();

    const w = Math.max(320, container.clientWidth);
    const h = Math.max(240, container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(44, w / h, 0.1, 100);
    this.renderer.setSize(w, h, false);

    // Dramatic NBA 2K14 Crimson/Gold Arena Spotlight Lighting
    const hemi = new THREE.HemisphereLight('#ffd5b0', '#16090e', 0.55);
    this.scene.add(hemi);

    const overheadSpot = new THREE.SpotLight('#fff1e0', 110, 26, Math.PI / 4.2, 0.65, 1.7);
    overheadSpot.position.set(0.4, 9.2, 1.2);
    overheadSpot.castShadow = !this.isSoftwareGl;
    this.scene.add(overheadSpot);

    const crimsonRim = new THREE.PointLight('#ce1141', 38, 16);
    crimsonRim.position.set(-3.4, 2.8, -2.5);
    this.scene.add(crimsonRim);

    const goldRim = new THREE.PointLight('#f9a01b', 28, 15);
    goldRim.position.set(3.2, 2.4, -2.2);
    this.scene.add(goldRim);

    // Volumetric-style Overhead God-Ray Cones (additive transparent geometry)
    const coneMat = this.track(
      new THREE.MeshBasicMaterial({
        color: '#f9a01b',
        transparent: true,
        opacity: 0.055,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    [-1.4, 0, 1.4].forEach((cx, i) => {
      const cone = new THREE.Mesh(this.track(new THREE.ConeGeometry(2.6, 9.5, 20, 1, true)), coneMat);
      cone.position.set(cx, 4.7, -0.8 + i * 0.25);
      cone.rotation.z = cx * 0.08;
      this.scene.add(cone);
    });

    // Reflective Arena Hardwood Floor
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext('2d')!;
    fctx.fillStyle = '#5c3c20';
    fctx.fillRect(0, 0, 512, 512);
    for (let r = 0; r < 32; r++) {
      fctx.fillStyle = r % 2 === 0 ? 'rgba(220,168,105,0.22)' : 'rgba(90,52,22,0.22)';
      fctx.fillRect(0, r * 16, 512, 15);
    }
    fctx.strokeStyle = 'rgba(206,17,65,0.75)';
    fctx.lineWidth = 6;
    fctx.beginPath();
    fctx.arc(256, 256, 175, 0, Math.PI * 2);
    fctx.stroke();

    const floorTex = this.track(new THREE.CanvasTexture(floorCanvas));
    floorTex.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(
      this.track(new THREE.CircleGeometry(18, 48)),
      this.track(new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.2, metalness: 0.16 }))
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Subtle Arena Tunnel Arch Backdrop
    const archMat = this.track(new THREE.MeshStandardMaterial({ color: '#14161c', roughness: 0.7, metalness: 0.4 }));
    for (let i = 0; i < 4; i++) {
      const arch = new THREE.Mesh(this.track(new THREE.TorusGeometry(4.6 + i * 0.9, 0.16, 8, 32, Math.PI)), archMat);
      arch.position.set(0, 0, -4.5 - i * 2.2);
      this.scene.add(arch);
    }

    // Basketball
    const ballMat = this.track(new THREE.MeshStandardMaterial({ color: '#d95b16', roughness: 0.46, metalness: 0.08 }));
    this.ballMesh = new THREE.Mesh(this.track(new THREE.SphereGeometry(0.125, 16, 14)), ballMat);
    this.ballMesh.castShadow = true;
    this.scene.add(this.ballMesh);

    // Floating Crimson & Gold Embers
    const emberCount = this.isSoftwareGl ? 60 : 180;
    const positions = new Float32Array(emberCount * 3);
    const colors = new Float32Array(emberCount * 3);
    const cRed = new THREE.Color('#ce1141');
    const cGold = new THREE.Color('#f9a01b');
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 1] = Math.random() * 5.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9;
      const c = i % 2 === 0 ? cRed : cGold;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const emberGeo = this.track(new THREE.BufferGeometry());
    emberGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    emberGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const emberMat = this.track(
      new THREE.PointsMaterial({
        size: 0.065,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.embers = new THREE.Points(emberGeo, emberMat);
    this.scene.add(this.embers);

    this.setFeaturedPlayer(player, team);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    this.loop();
  }

  private track<T extends { dispose: () => void }>(d: T): T {
    this.disposables.push(d);
    return d;
  }

  public setFeaturedPlayer(player: PlayerData, team: TeamData): void {
    if (this.rig) {
      this.scene.remove(this.rig.root);
      this.rig.dispose();
    }
    this.rig = createArticulatedPlayerRig(player, team.primaryColor, team.secondaryColor, team.code, true);
    this.rig.floorRingGroup.visible = false;
    this.scene.add(this.rig.root);
  }

  public setCameraPreset(preset: SpotlightCameraPreset): void {
    this.targetPreset = preset;
  }

  private handleResize(): void {
    if (this.disposed) return;
    const w = Math.max(320, this.container.clientWidth);
    const h = Math.max(240, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private loop = (): void => {
    if (this.disposed) return;
    const elapsed = (performance.now() - this.startTime) * 0.001;

    // Smooth camera transition + gentle breathing orbit
    const preset = CAMERA_PRESETS[this.targetPreset];
    const desiredPos = new THREE.Vector3(
      preset.pos[0] + Math.sin(elapsed * 0.35) * 0.25,
      preset.pos[1] + Math.cos(elapsed * 0.4) * 0.08,
      preset.pos[2]
    );
    const desiredLook = new THREE.Vector3(...preset.look);
    this.curCamPos.lerp(desiredPos, 0.05);
    this.curLookAt.lerp(desiredLook, 0.06);
    this.camera.position.copy(this.curCamPos);
    this.camera.lookAt(this.curLookAt);

    // Animate featured star warm-up dribble -> crossover -> jumper cycle
    if (this.rig) {
      const cycle = elapsed % 9;
      if (cycle < 5.5) {
        animatePlayerRig(this.rig, 'dribble', elapsed, 0.15, 0);
        this.rig.root.rotation.y = Math.sin(elapsed * 0.5) * 0.22;
        const bounceY = Math.abs(Math.sin(elapsed * 6.0)) * 0.88 + 0.125;
        this.ballMesh.position.set(0.36, bounceY, 0.28);
      } else if (cycle < 7.2) {
        animatePlayerRig(this.rig, 'crossover', elapsed, 0.4, 0);
        this.rig.root.rotation.y = Math.sin(elapsed * 3) * 0.35;
        this.ballMesh.position.set(Math.sin(elapsed * 8) * 0.35, 0.45 + Math.abs(Math.cos(elapsed * 8)) * 0.35, 0.34);
      } else {
        const jumpT = (cycle - 7.2) / 1.8;
        const air = Math.sin(jumpT * Math.PI) * 0.52;
        animatePlayerRig(this.rig, 'jumpshot', elapsed, 0, air);
        this.ballMesh.position.set(0.08, 2.08 + air + jumpT * 0.7, 0.24 + jumpT * 0.6);
      }
      this.ballMesh.rotation.x += 0.08;
    }

    // Float embers gently upward
    const posAttr = this.embers.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      let y = posAttr.getY(i) + 0.008;
      if (y > 5.2) y = 0.05;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      setTimeout(() => {
        if (!this.disposed) this.rafId = requestAnimationFrame(this.loop);
      }, 34);
    } else {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.rig?.dispose();
    this.envTex?.dispose();
    this.disposables.forEach((d) => d.dispose());
    this.renderer.dispose();
  }
}
