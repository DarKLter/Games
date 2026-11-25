import * as THREE from 'three';
import {
  HOOPS_CITY_LOCATIONS,
  HoopsCityLocationDef,
  getActiveMyPlayer,
  getHoops2K26TeamById
} from '../../core/arenaRoster';
import { playerState } from '../../core/storage';
import {
  BasketballPlayerRig,
  StudioThreeContext,
  addInkOutline,
  buildBasketballPlayerMesh,
  createToonMaterial
} from '../../core/threeShared';

export interface HoopsCityCallbacks {
  onNearbyLocationChange?: (loc: HoopsCityLocationDef | null) => void;
  onPlayerMove?: (x: number, z: number, vehicleOn: boolean) => void;
}

const _camGoal = new THREE.Vector3();
const _lookGoal = new THREE.Vector3();
const _lookCur = new THREE.Vector3();
const _proj = new THREE.Vector3();

function hexStrToNum(hex: string, fallback: number): number {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Walkable 3D Open-Air "The City" Plaza for Hoops 2K26 3D.
 * Features the Central Spawn Plaza, all 4 Perimeters (North Arenas/Park, West Pro-AM/NBA/MyCOURT,
 * East Street Kings/Ante-Up/Open-Court/Track, South Stores/Gatorade/Art of Shooting),
 * 3D Vehicle Riding (V), Glowing GPS Ground Trail, and 1-Tap Fast-Travel Teleport.
 */
export class HoopsCity3D {
  container: HTMLElement;
  callbacks: HoopsCityCallbacks;
  three: StudioThreeContext;

  playerRig!: BasketballPlayerRig;
  vehicleGroup!: THREE.Group;
  playerX = 0;
  playerZ = 8;
  playerYaw = Math.PI;
  animPhase = 0;

  vehicleMounted = false;
  waypointId: string | null = 'the_rec';
  nearbyLocId: string | null = null;

  keys: Record<string, boolean> = {};
  joyDx = 0;
  joyDz = 0;
  isRunning = false;
  lastTime = 0;

  portalRings: Map<string, { ring: THREE.Mesh; loc: HoopsCityLocationDef }> = new Map();
  gpsDots: THREE.Mesh[] = [];
  ambientNpcs: Array<{ rig: BasketballPlayerRig; baseX: number; baseZ: number; phase: number }> = [];

  constructor(container: HTMLElement, callbacks: HoopsCityCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    this.three = new StudioThreeContext(container, {
      skyColor: 0x38bdf8,
      fogColor: 0xbae6fd,
      fogNear: 52,
      fogFar: 165,
      keyColor: 0xfff8e7,
      keyIntensity: 2.15,
      hemiSky: 0x7dd3fc,
      hemiGround: 0x78716c,
      hemiIntensity: 1.05,
      shadowExtent: 46,
      fov: 50,
      far: 240,
      useContainerSize: true
    });
    this.three.renderer.toneMapping = THREE.NoToneMapping;

    this.buildPlazaWorld();
    this.buildGpsTrail();
    this.spawnPlayerAndVehicle();
    this.spawnAmbientHoopers();

    _lookCur.set(this.playerX, 2.0, this.playerZ - 2);
    this.three.camera.position.set(this.playerX, 9.5, this.playerZ + 12.5);
    this.three.camera.lookAt(_lookCur);
    this.three.prewarm();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);

    this.isRunning = true;
    this.lastTime = performance.now();
    this.checkNearbyLocation(true);
    this.tick();
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    this.keys[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  private onResize = (): void => {
    this.three?.resize();
  };

  setJoystick(dx: number, dz: number): void {
    this.joyDx = Math.max(-1, Math.min(1, dx));
    this.joyDz = Math.max(-1, Math.min(1, dz));
  }

  setWaypoint(locId: string | null): void {
    this.waypointId = locId;
  }

  toggleVehicle(): boolean {
    const mp = getActiveMyPlayer(playerState.hoops2k26);
    if (mp.equippedVehicle === 'none') {
      mp.equippedVehicle = 'skateboard';
    }
    this.vehicleMounted = !this.vehicleMounted;
    this.syncVehicleMesh();
    this.callbacks.onPlayerMove?.(this.playerX, this.playerZ, this.vehicleMounted);
    return this.vehicleMounted;
  }

  setVehicleMounted(on: boolean): void {
    this.vehicleMounted = on;
    this.syncVehicleMesh();
  }

  teleportTo(locId: string): HoopsCityLocationDef | null {
    const loc = HOOPS_CITY_LOCATIONS.find((l) => l.id === locId);
    if (!loc) return null;
    // Land cleanly in front of the entrance portal ring
    const distFromOrigin = Math.hypot(loc.x, loc.z);
    if (distFromOrigin > 3) {
      const pull = Math.max(0, distFromOrigin - 4.2) / distFromOrigin;
      this.playerX = loc.x * pull;
      this.playerZ = loc.z * pull;
      this.playerYaw = Math.atan2(loc.x - this.playerX, loc.z - this.playerZ);
    } else {
      this.playerX = loc.x;
      this.playerZ = loc.z + 3.2;
      this.playerYaw = Math.PI;
    }
    this.waypointId = loc.id;
    this.checkNearbyLocation(true);
    this.callbacks.onPlayerMove?.(this.playerX, this.playerZ, this.vehicleMounted);
    return loc;
  }

  getNearbyLocation(): HoopsCityLocationDef | null {
    return HOOPS_CITY_LOCATIONS.find((l) => l.id === this.nearbyLocId) ?? null;
  }

  private buildPlazaWorld(): void {
    // Open-air sunlit plaza deck with radial promenades & center medallion
    const plazaTex = this.three.createCanvasTexture(
      1024,
      (ctx, s) => {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 0, s, s);

        // Subtle sunlit paving grid
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.16)';
        ctx.lineWidth = 2;
        for (let i = 0; i <= s; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, s);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(s, i);
          ctx.stroke();
        }

        // Cross-city dark slate avenues (North-South & East-West)
        ctx.fillStyle = '#475569';
        ctx.fillRect(s * 0.44, 0, s * 0.12, s);
        ctx.fillRect(0, s * 0.44, s, s * 0.12);

        // Perimeter walkway loop
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 44;
        ctx.strokeRect(s * 0.16, s * 0.16, s * 0.68, s * 0.68);

        // Golden boulevard lane markings
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
        ctx.lineWidth = 4;
        ctx.setLineDash([18, 14]);
        ctx.strokeRect(s * 0.16, s * 0.16, s * 0.68, s * 0.68);
        ctx.setLineDash([]);

        // Central Plaza Medallion
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(s * 0.5, s * 0.5, 118, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = '900 42px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('THE CITY', s * 0.5, s * 0.5 - 16);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 22px system-ui, sans-serif';
        ctx.fillText('HOOPS 2K26 PLAZA', s * 0.5, s * 0.5 + 24);
      },
      1,
      1
    );
    plazaTex.wrapS = THREE.ClampToEdgeWrapping;
    plazaTex.wrapT = THREE.ClampToEdgeWrapping;

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(148, 148),
      new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.78, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.three.scene.add(ground);

    // Outer coastal grass / boulevard apron so there are no sharp edges
    const outerApron = new THREE.Mesh(
      new THREE.PlaneGeometry(340, 340),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    outerApron.rotation.x = -Math.PI / 2;
    outerApron.position.y = -0.08;
    this.three.scene.add(outerApron);

    // Open-air Metropolis Skyline Silhouettes around far horizon (radius 74..92)
    const skylinePalette = [0x334155, 0x475569, 0x1e293b, 0x3b82f6, 0x0f172a];
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2;
      const dist = 74 + (i % 3) * 9;
      const w = 7 + (i % 4) * 3;
      const h = 16 + ((i * 7) % 24);
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, w),
        new THREE.MeshStandardMaterial({
          color: skylinePalette[i % skylinePalette.length],
          roughness: 0.7,
          metalness: 0.15
        })
      );
      bldg.position.set(Math.cos(ang) * dist, h * 0.5 - 0.1, Math.sin(ang) * dist);
      this.three.scene.add(bldg);
    }

    // Palm / Street Trees along plaza corners
    const trunkMat = createToonMaterial(0x78350f);
    const leafMat = createToonMaterial(0x16a34a);
    const treeSpots: [number, number][] = [
      [-16, -16],
      [16, -16],
      [-16, 16],
      [16, 16],
      [-34, -22],
      [34, -22],
      [-34, 24],
      [34, 24]
    ];
    for (const [tx, tz] of treeSpots) {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 4.4, 7), trunkMat);
      trunk.position.set(tx, 2.2, tz);
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 0), leafMat);
      canopy.position.set(tx, 4.8, tz);
      this.three.scene.add(trunk, canopy);
    }

    // Build all 18 City Landmarks + Glowing Portal Rings
    for (const loc of HOOPS_CITY_LOCATIONS) {
      this.buildLandmark(loc);
    }
  }

  private buildLandmark(loc: HoopsCityLocationDef): void {
    const group = new THREE.Group();
    group.position.set(loc.x, 0, loc.z);

    const accentMat = createToonMaterial(loc.color, { emissive: loc.color, emissiveIntensity: 0.28 });
    const bodyMat = createToonMaterial(0x1e293b);
    const roofMat = createToonMaterial(0x0f172a);

    if (loc.id === 'central_plaza') {
      // Glowing City Directory & Leaderboard Spire
      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.1, 0.7, 16), bodyMat);
      plinth.position.y = 0.35;
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.9, 5.4, 10), accentMat);
      spire.position.y = 3.2;
      addInkOutline(spire, 1.05);
      const crown = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 10, 24), createToonMaterial(0xfacc15));
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 5.4;
      group.add(plinth, spire, crown);
    } else if (loc.id === 'park_courts' || loc.id === 'street_kings') {
      // Outdoor concrete half-court with painted key, white Got Next circle, and hoop stanchion!
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(11.5, 0.14, 9.2),
        createToonMaterial(loc.id === 'park_courts' ? 0x1d4ed8 : 0x7c2d12)
      );
      slab.position.y = 0.07;
      const key = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 3.8), accentMat);
      key.position.set(0, 0.08, -2.5);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.4, 0.32), roofMat);
      post.position.set(0, 1.7, -4.1);
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.12), createToonMaterial(0xe0f2fe));
      board.position.set(0, 3.1, -3.7);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 18), createToonMaterial(0xf97316));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 2.75, -3.2);
      // White Got Next Spot
      const gotNext = new THREE.Mesh(
        new THREE.RingGeometry(0.8, 1.15, 22),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      gotNext.rotation.x = -Math.PI / 2;
      gotNext.position.set(0, 0.18, 2.8);
      group.add(slab, key, post, board, rim, gotNext);
    } else if (loc.kind === 'farming') {
      // Sleek Illuminated Kiosk Booth (Daily Reward / Pick'Em / Track)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 2.5, 8), bodyMat);
      base.position.y = 1.25;
      addInkOutline(base, 1.04);
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.1, 8), accentMat);
      canopy.position.y = 3.1;
      group.add(base, canopy);
    } else {
      // Modern Arena / Gym / Store Facade Building
      const isMajorArena = loc.kind === 'court' && loc.courtTheme !== 'park' && loc.courtTheme !== 'street_kings';
      const w = isMajorArena ? 11.5 : 8.5;
      const h = isMajorArena ? 7.2 : 5.2;
      const d = isMajorArena ? 7.5 : 6.2;
      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
      building.position.y = h * 0.5;
      building.castShadow = true;
      addInkOutline(building, 1.03);

      const marquee = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, 1.25, d + 0.4), accentMat);
      marquee.position.y = h - 0.8;

      const doorway = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 2.8, d + 0.25),
        new THREE.MeshBasicMaterial({ color: loc.color })
      );
      doorway.position.y = 1.4;
      group.add(building, marquee, doorway);
    }

    // Floating Portal Entry Ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.3, 2.85, 28),
      new THREE.MeshBasicMaterial({
        color: loc.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        depthWrite: false
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    this.portalRings.set(loc.id, { ring, loc });
    this.three.scene.add(group);
  }

  private buildGpsTrail(): void {
    const geo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 12; i++) {
      const dot = new THREE.Mesh(geo, mat);
      dot.position.y = 0.09;
      dot.visible = false;
      this.three.scene.add(dot);
      this.gpsDots.push(dot);
    }
  }

  private spawnPlayerAndVehicle(): void {
    const mp = getActiveMyPlayer(playerState.hoops2k26);
    const team = getHoops2K26TeamById(mp.nbaTeamId);
    const shoe =
      playerState.hoops2k26.customShoes.find((s) => s.id === mp.equippedShoeId) ??
      playerState.hoops2k26.customShoes[0];

    this.playerRig = buildBasketballPlayerMesh(
      team.jerseyColor,
      team.trimColor,
      0xc68642,
      true,
      1.05,
      true,
      shoe
        ? {
            upper: hexStrToNum(shoe.upperHex, 0x111827),
            sole: hexStrToNum(shoe.soleHex, 0xf8fafc),
            accent: hexStrToNum(shoe.accentHex, 0xf59e0b)
          }
        : undefined
    );
    this.playerRig.activeRing.visible = true;
    this.three.scene.add(this.playerRig.group);

    // Sleek 3D Vehicle Deck (Skateboard / Hoverboard / Go-Kart visual mounted under player on V)
    this.vehicleGroup = new THREE.Group();
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.12, 1.65),
      createToonMaterial(0xf59e0b, { emissive: 0xd97706, emissiveIntensity: 0.3 })
    );
    deck.position.y = 0.16;
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 1.45),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    glow.position.y = 0.08;
    this.vehicleGroup.add(deck, glow);
    this.vehicleGroup.visible = false;
    this.three.scene.add(this.vehicleGroup);
  }

  private syncVehicleMesh(): void {
    if (this.vehicleGroup) {
      this.vehicleGroup.visible = this.vehicleMounted;
    }
  }

  private spawnAmbientHoopers(): void {
    const spots: Array<[number, number, number, number]> = [
      [-10, -28, 0x007a33, 0xfacc15],
      [6, -30, 0x552583, 0xfdb927],
      [28, -6, 0x1d428a, 0xffc72c],
      [-26, 6, 0x006bb6, 0xf58426],
      [-8, 30, 0x98002e, 0xf9a01b],
      [14, 28, 0x14b8a6, 0x111827]
    ];
    spots.forEach(([x, z, jc, tc], idx) => {
      const rig = buildBasketballPlayerMesh(jc, tc, idx % 2 === 0 ? 0x8d5524 : 0xd99b66, false, 1.0, true);
      rig.group.position.set(x, 0, z);
      this.three.scene.add(rig.group);
      this.ambientNpcs.push({ rig, baseX: x, baseZ: z, phase: idx * 1.4 });
    });
  }

  private checkNearbyLocation(forceNotify = false): void {
    let bestId: string | null = null;
    let bestDist = 7.4;
    for (const loc of HOOPS_CITY_LOCATIONS) {
      const d = Math.hypot(this.playerX - loc.x, this.playerZ - loc.z);
      if (d < bestDist) {
        bestDist = d;
        bestId = loc.id;
      }
    }
    if (bestId !== this.nearbyLocId || forceNotify) {
      this.nearbyLocId = bestId;
      const found = HOOPS_CITY_LOCATIONS.find((l) => l.id === bestId) ?? null;
      this.callbacks.onNearbyLocationChange?.(found);
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0.001), 0.05);
    this.lastTime = now;

    this.stepPlayer(dt);
    this.updateVisuals(dt, now * 0.001);
    this.three.render();
    this.drawLandmarkLabels();

    if (this.isRunning) {
      this.three.scheduleNextFrame(this.tick);
    }
  };

  private stepPlayer(dt: number): void {
    let dx = this.joyDx;
    let dz = this.joyDz;
    if (this.keys.KeyA || this.keys.ArrowLeft) dx -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) dx += 1;
    if (this.keys.KeyW || this.keys.ArrowUp) dz -= 1;
    if (this.keys.KeyS || this.keys.ArrowDown) dz += 1;

    const mag = Math.hypot(dx, dz);
    const sprinting = Boolean(this.keys.ShiftLeft || this.keys.ShiftRight);
    const speed = (this.vehicleMounted ? 17.5 : sprinting ? 12.2 : 8.5);

    if (mag > 0.08) {
      const nx = dx / Math.max(1, mag);
      const nz = dz / Math.max(1, mag);
      this.playerX = THREE.MathUtils.clamp(this.playerX + nx * speed * dt, -52, 52);
      this.playerZ = THREE.MathUtils.clamp(this.playerZ + nz * speed * dt, -52, 52);
      this.playerYaw = Math.atan2(nx, nz);
      this.animPhase += dt * (this.vehicleMounted ? 4 : sprinting ? 13 : 9);
      this.checkNearbyLocation(false);
      this.callbacks.onPlayerMove?.(this.playerX, this.playerZ, this.vehicleMounted);
    }
  }

  private updateVisuals(dt: number, timeSec: number): void {
    const rideLift = this.vehicleMounted ? 0.24 : 0;
    this.playerRig.group.position.set(this.playerX, rideLift, this.playerZ);
    this.playerRig.group.rotation.y = this.playerYaw;

    const moving =
      Math.hypot(this.joyDx, this.joyDz) > 0.1 ||
      this.keys.KeyW ||
      this.keys.KeyA ||
      this.keys.KeyS ||
      this.keys.KeyD ||
      this.keys.ArrowUp ||
      this.keys.ArrowDown ||
      this.keys.ArrowLeft ||
      this.keys.ArrowRight;

    const stride = moving && !this.vehicleMounted ? Math.sin(this.animPhase) * 0.52 : 0;
    this.playerRig.legL.rotation.x = stride;
    this.playerRig.legR.rotation.x = -stride;
    this.playerRig.armL.rotation.x = -stride * 0.6;
    this.playerRig.armR.rotation.x = stride * 0.6;

    if (this.vehicleMounted) {
      this.vehicleGroup.position.set(this.playerX, 0, this.playerZ);
      this.vehicleGroup.rotation.y = this.playerYaw;
    }

    // Pulse active / nearby portal rings
    this.portalRings.forEach(({ ring, loc }) => {
      const isNear = loc.id === this.nearbyLocId || loc.id === this.waypointId;
      const pulse = isNear ? 1.08 + Math.sin(timeSec * 5) * 0.12 : 1.0;
      ring.scale.set(pulse, pulse, 1);
    });

    // Update glowing GPS breadcrumb trail toward waypoint
    const wp = HOOPS_CITY_LOCATIONS.find((l) => l.id === this.waypointId);
    if (wp && Math.hypot(wp.x - this.playerX, wp.z - this.playerZ) > 5.5) {
      for (let i = 0; i < this.gpsDots.length; i++) {
        const frac = ((i + 0.5 + ((timeSec * 1.4) % 1)) / (this.gpsDots.length + 1));
        const dot = this.gpsDots[i];
        dot.visible = true;
        dot.position.set(
          THREE.MathUtils.lerp(this.playerX, wp.x, frac),
          0.11,
          THREE.MathUtils.lerp(this.playerZ, wp.z, frac)
        );
      }
    } else {
      for (const dot of this.gpsDots) dot.visible = false;
    }

    // Ambient NPCs idle patrol
    for (const npc of this.ambientNpcs) {
      const nx = npc.baseX + Math.sin(timeSec * 0.6 + npc.phase) * 2.2;
      const nz = npc.baseZ + Math.cos(timeSec * 0.5 + npc.phase) * 2.2;
      npc.rig.group.position.set(nx, 0, nz);
      npc.rig.group.rotation.y = timeSec * 0.5 + npc.phase;
      const s = Math.sin(timeSec * 4.5 + npc.phase) * 0.35;
      npc.rig.legL.rotation.x = s;
      npc.rig.legR.rotation.x = -s;
    }

    // Smooth third-person open-air City camera
    _camGoal.set(this.playerX, 9.6, this.playerZ + 12.8);
    _lookGoal.set(this.playerX, 2.2, this.playerZ - 2.6);
    const alpha = 1 - Math.exp(-6.5 * dt);
    this.three.camera.position.lerp(_camGoal, alpha);
    _lookCur.lerp(_lookGoal, alpha);
    this.three.camera.lookAt(_lookCur);
  }

  private drawLandmarkLabels(): void {
    const ctx = this.three.overlayCtx;
    if (!ctx) return;
    this.three.clearOverlay();
    const w = this.three.width;
    const h = this.three.height;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const loc of HOOPS_CITY_LOCATIONS) {
      const dist = Math.hypot(loc.x - this.playerX, loc.z - this.playerZ);
      if (dist > 46 && loc.id !== this.waypointId) continue;
      const isIndoorArena = loc.kind === 'court' && loc.courtTheme !== 'park' && loc.courtTheme !== 'street_kings';
      _proj.set(loc.x, isIndoorArena ? 8.3 : 5.4, loc.z).project(this.three.camera);
      if (_proj.z < -1 || _proj.z > 1) continue;
      const sx = (_proj.x * 0.5 + 0.5) * w;
      const sy = (-_proj.y * 0.5 + 0.5) * h;
      if (sx < 30 || sx > w - 30 || sy < 56 || sy > h - 30) continue;

      const isNear = loc.id === this.nearbyLocId;
      const isWp = loc.id === this.waypointId;
      const label = `${loc.icon} ${loc.shortName}`;
      ctx.font = isNear ? '900 12px system-ui, sans-serif' : '800 11px system-ui, sans-serif';
      const tw = ctx.measureText(label).width + 18;
      const bh = 22;
      ctx.fillStyle = isNear ? 'rgba(245, 158, 11, 0.94)' : isWp ? 'rgba(14, 165, 233, 0.92)' : 'rgba(11, 16, 27, 0.86)';
      ctx.strokeStyle = isNear ? '#fef08a' : loc.accentHex;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(sx - tw * 0.5, sy - bh * 0.5, tw, bh, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isNear ? '#0b101b' : '#f8fafc';
      ctx.fillText(label, sx, sy + 0.5);
    }

    ctx.restore();
  }

  dispose(): void {
    this.isRunning = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    this.three?.dispose();
  }
}
