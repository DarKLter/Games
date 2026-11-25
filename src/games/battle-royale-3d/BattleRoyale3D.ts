import * as THREE from 'three';
import { BR_WEAPONS, BrWeaponDef } from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, setActionButtonLabel, triggerGameOver, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { persistBrStats, playerState } from '../../core/storage';
import { Difficulty, DifficultyScaler, difficultyScalers, GameInstance } from '../../core/types';
import { getViewportSize, mapClientDeltaToStage, mapClientToStage } from '../../core/viewport';
import { StudioThreeContext, buildBuggyMesh, buildSoldierMesh } from '../../core/threeShared';

interface BotUnit {
  id: number;
  mesh: THREE.Group;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  shootCd: number;
  isBoss: boolean;
  isAlly: boolean;
  alive: boolean;
}

interface BulletProj {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fromAlly: boolean;
  dmg: number;
  life: number;
}

interface GrenadeProj {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  fuse: number;
}

interface CoverBox {
  x: number;
  z: number;
  hw: number;
  hd: number;
  h: number;
}

interface LootDrop {
  mesh: THREE.Group;
  smoke?: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  kind: 'med' | 'ammo' | 'armor' | 'airdrop';
  taken: boolean;
}

const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();

export class BattleRoyale3D implements GameInstance {
  container: HTMLElement;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  scaler: DifficultyScaler;
  score = 0;
  lives = 100;
  maxLives = 100;
  isPaused = false;
  gameOver = false;
  isRunning = false;

  three!: StudioThreeContext;
  playerGroup!: THREE.Group;
  muzzleObj!: THREE.Object3D;
  chuteGroup!: THREE.Group;
  planeGroup!: THREE.Group;
  buggyGroup!: THREE.Group;
  buggyWheels: THREE.Mesh[] = [];
  stormMesh!: THREE.Mesh;

  // Match Phases: C-130 Cargo Plane -> Parachute Glide -> Ground Combat
  phase: 'plane' | 'parachute' | 'ground' = 'plane';
  planeT = 0;
  planeStart = new THREE.Vector3(-56, 44, -52);
  planeEnd = new THREE.Vector3(56, 44, 52);

  px = -56;
  py = 44;
  pz = -52;
  pvy = 0;
  yaw = Math.PI * 0.75;
  pitch = 0.08;
  moveX = 0;
  moveZ = 0;
  firing = false;
  scoped = false;
  reloadTimer = 0;
  fireCd = 0;

  // 4-Weapon Loadout
  activeSlot = 0;
  weaponMag = [30, 35, 8, 5];
  weaponReserve = [120, 140, 32, 10];
  grenades = 3;
  flares = 1;
  armor = 40;
  medkits = 2;

  // Drivable Buggy
  buggyX = 9;
  buggyZ = 14;
  buggyYaw = 0.4;
  buggySpeed = 0;
  inVehicle = false;
  roadkillCd = 0;

  kills = 0;
  totalBots = 14;
  aliveCount = 15;
  stormRadius = 76;
  stormShrinkRate = 0.62;
  stormDmgTick = 0;
  airdropTimer = 20;
  elapsed = 0;
  hitMarkerTimer = 0;
  toastText = '';
  toastTimer = 0;

  bots: BotUnit[] = [];
  bullets: BulletProj[] = [];
  nades: GrenadeProj[] = [];
  fxRings: { mesh: THREE.Mesh; life: number }[] = [];
  covers: CoverBox[] = [];
  loot: LootDrop[] = [];
  bulletGeo!: THREE.SphereGeometry;
  playerBulletMat!: THREE.MeshBasicMaterial;
  enemyBulletMat!: THREE.MeshBasicMaterial;

  lastTime = 0;
  private dragLookId: number | null = null;
  private dragLastX = 0;
  private dragLastY = 0;

  constructor(container: HTMLElement, diff: Difficulty, lvl: number, gameIdx = 24) {
    this.container = container;
    this.diff = diff;
    this.level = lvl;
    this.gameIdx = gameIdx;
    this.scaler = difficultyScalers[diff] || difficultyScalers.easy;
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
  }

  private get curWeapon(): BrWeaponDef {
    return BR_WEAPONS[this.activeSlot] ?? BR_WEAPONS[0];
  }

  private showToast(msg: string): void {
    this.toastText = msg;
    this.toastTimer = 2.6;
  }

  start(): void {
    const isSanhok = playerState.selectedBrMap === 'sanhok';
    this.three = new StudioThreeContext(this.container, {
      skyColor: isSanhok ? 0x5eead4 : 0x6ec3f4,
      fogColor: isSanhok ? 0x99f6e4 : 0x8ad2f2,
      fogNear: isSanhok ? 40 : 54,
      fogFar: isSanhok ? 165 : 185,
      fov: 62,
      far: 280
    });

    if (playerState.brSupplyCrateReady) {
      this.armor = 95;
      this.flares = 2;
      this.medkits = 3;
      this.weaponReserve[3] += 10;
      playerState.brSupplyCrateReady = false;
      persistBrStats();
      this.showToast('🎁 Supply Crate Equipped: Lv.3 Vest + Flare!');
    } else {
      this.showToast('✈️ C-130 Cargo Plane: Tap Screen or SPACE to Parachute!');
    }

    this.buildWorld(isSanhok);
    this.buildPlaneAndChute();
    this.spawnPlayer();
    this.spawnBuggy();
    this.spawnBots();
    this.spawnLoot();
    this.snapCamera();

    const dom = this.three.renderer.domElement;
    dom.addEventListener('pointerdown', this.onDomDown);
    window.addEventListener('pointermove', this.onDomMove);
    window.addEventListener('pointerup', this.onDomUp);
    window.addEventListener('pointercancel', this.onDomUp);

    this.three.prewarm();
    this.isRunning = true;
    this.lastTime = performance.now();
    setActionButtonLabel('JUMP!');
    updateHealthDisplay(this.lives, this.maxLives);
    updateInGameHud(this.score, this.level, this.gameIdx);
    this.tick();
  }

  private snapCamera(): void {
    this.three.camera.position.set(this.px - 10, this.py + 6, this.pz - 10);
    this.three.camera.lookAt(0, 6, 0);
  }

  stop(): void {
    this.isRunning = false;
    this.releaseInputs();
    const dom = this.three?.renderer?.domElement;
    if (dom) dom.removeEventListener('pointerdown', this.onDomDown);
    window.removeEventListener('pointermove', this.onDomMove);
    window.removeEventListener('pointerup', this.onDomUp);
    window.removeEventListener('pointercancel', this.onDomUp);
    this.three?.dispose();
  }

  releaseInputs(): void {
    this.moveX = 0;
    this.moveZ = 0;
    this.firing = false;
    this.dragLookId = null;
  }

  pause(): void {
    this.isPaused = true;
    this.releaseInputs();
    this.three?.cancelPendingFrame();
  }

  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
    if (this.isRunning && !this.gameOver) {
      this.three?.scheduleNextFrame(this.tick);
    }
  }

  resize(): void {
    this.three?.resize();
  }

  private buildWorld(isSanhok: boolean): void {
    const tex = this.three.createCanvasTexture(
      256,
      (ctx, s) => {
        ctx.fillStyle = isSanhok ? '#265c32' : '#3b6f38';
        ctx.fillRect(0, 0, s, s);
        for (let i = 0; i < 420; i++) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(10,30,12,0.14)';
          ctx.fillRect((i * 37) % s, (i * 53) % s, 6, 6);
        }
      },
      28,
      28
    );

    const island = new THREE.Mesh(
      new THREE.CylinderGeometry(88, 96, 4, 48),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.02 })
    );
    island.position.y = -2;
    island.receiveShadow = true;
    this.three.scene.add(island);

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(440, 440),
      new THREE.MeshStandardMaterial({
        color: isSanhok ? 0x0f766e : 0x0284c7,
        roughness: 0.2,
        metalness: 0.65
      })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -1.2;
    this.three.scene.add(ocean);

    const wallMat = new THREE.MeshStandardMaterial({ color: isSanhok ? 0x4d5d4e : 0x64748b, roughness: 0.78 });
    const crateMat = new THREE.MeshStandardMaterial({ color: isSanhok ? 0x854d0e : 0xb45309, roughness: 0.65 });
    const layouts: [number, number, number, number, number, boolean][] = [
      [0, 0, 5.5, 5.5, 3.2, false],
      [-22, -16, 4.8, 3.5, 3.0, false],
      [24, -18, 4.5, 4.5, 3.4, false],
      [-28, 22, 6, 3.5, 3.2, false],
      [26, 20, 5, 4, 3.0, false],
      [-10, 8, 2.2, 2.2, 1.8, true],
      [12, 6, 2.2, 2.2, 1.8, true],
      [-12, -28, 2.4, 2.4, 2.0, true],
      [15, -30, 2.4, 2.4, 2.0, true],
      [0, 32, 6.2, 2.4, 2.5, false],
      [-40, 0, 4.2, 4.2, 3.6, false],
      [40, -2, 4.2, 4.2, 3.6, false]
    ];
    for (const [x, z, w, d, h, isCrate] of layouts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), isCrate ? crateMat : wallMat);
      m.position.set(x, h / 2, z);
      m.castShadow = true;
      m.receiveShadow = true;
      this.three.scene.add(m);
      this.covers.push({ x, z, hw: w / 2, hd: d / 2, h });
    }

    const treeCount = 58;
    const trunkMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.28, 0.4, 2.8, 7),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 }),
      treeCount
    );
    const crownMesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(isSanhok ? 2.1 : 1.75, 4.4, 7),
      new THREE.MeshStandardMaterial({ color: isSanhok ? 0x166534 : 0x15803d, roughness: 0.8 }),
      treeCount
    );
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    for (let i = 0; i < treeCount; i++) {
      const ang = (i / treeCount) * Math.PI * 2 + (i % 3) * 0.2;
      const rad = i < 32 ? 58 + (i % 4) * 5.5 : 18 + ((i * 11) % 34);
      const tx = Math.cos(ang) * rad;
      const tz = Math.sin(ang) * rad;
      const sc = 0.85 + (i % 5) * 0.1;
      dummy.position.set(tx, 1.4 * sc, tz);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      trunkMesh.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tx, 4.2 * sc, tz);
      dummy.updateMatrix();
      crownMesh.setMatrixAt(i, dummy.matrix);
      col.setHSL(isSanhok ? 0.34 : 0.36, 0.6, 0.25 + (i % 3) * 0.04);
      crownMesh.setColorAt(i, col);
    }
    trunkMesh.instanceMatrix.needsUpdate = true;
    crownMesh.instanceMatrix.needsUpdate = true;
    if (crownMesh.instanceColor) crownMesh.instanceColor.needsUpdate = true;
    this.three.scene.add(trunkMesh, crownMesh);

    this.stormMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 28, 48, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    this.stormMesh.position.y = 14;
    this.three.scene.add(this.stormMesh);

    this.bulletGeo = new THREE.SphereGeometry(0.16, 6, 6);
    this.playerBulletMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    this.enemyBulletMat = new THREE.MeshBasicMaterial({ color: 0xff4757 });
  }

  private buildPlaneAndChute(): void {
    // Procedural C-130 Cargo Airplane
    this.planeGroup = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.65 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const fuse = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 12.5), metal);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.35, 3.1), metal);
    wing.position.set(0, 0.9, 0.6);
    const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.0, 2.4), dark);
    tailFin.position.set(0, 2.2, -5.2);
    const tailWing = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.25, 1.5), dark);
    tailWing.position.set(0, 0.8, -5.3);
    this.planeGroup.add(fuse, wing, tailFin, tailWing);
    this.planeGroup.position.copy(this.planeStart);
    this.planeGroup.lookAt(this.planeEnd);
    this.three.scene.add(this.planeGroup);

    // Parachute canopy attached over player during descent
    this.chuteGroup = new THREE.Group();
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, roughness: 0.6 })
    );
    canopy.position.y = 3.6;
    const cordGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.5, 4);
    const cordMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    for (const sx of [-1, 1]) {
      const cord = new THREE.Mesh(cordGeo, cordMat);
      cord.position.set(sx * 0.7, 2.6, 0);
      cord.rotation.z = sx * -0.42;
      this.chuteGroup.add(cord);
    }
    this.chuteGroup.add(canopy);
    this.chuteGroup.visible = false;
  }

  private spawnPlayer(): void {
    const built = buildSoldierMesh(0x2563eb, 0x1e3a8a, 0x38bdf8, 1.0);
    this.playerGroup = built.group;
    this.muzzleObj = built.muzzle;
    this.playerGroup.add(this.chuteGroup);
    this.playerGroup.visible = false;
    this.three.scene.add(this.playerGroup);
  }

  private spawnBuggy(): void {
    const built = buildBuggyMesh(playerState.selectedBrMap === 'sanhok' ? 0x365314 : 0x78716c);
    this.buggyGroup = built.group;
    this.buggyWheels = built.wheels;
    this.buggyGroup.position.set(this.buggyX, 0, this.buggyZ);
    this.buggyGroup.rotation.y = this.buggyYaw;
    this.three.scene.add(this.buggyGroup);
  }

  private spawnBots(): void {
    const isSquad = playerState.selectedBrMode === 'squad';
    if (isSquad) {
      const wingman = buildSoldierMesh(0x0284c7, 0x38bdf8, 0x84fab0, 1.0);
      wingman.group.position.set(-4, 0, 18);
      this.three.scene.add(wingman.group);
      this.bots.push({
        id: 99,
        mesh: wingman.group,
        x: -4,
        z: 18,
        hp: 160,
        maxHp: 160,
        shootCd: 0.8,
        isBoss: false,
        isAlly: true,
        alive: true
      });
    }

    this.totalBots = 11 + Math.min(8, this.level * 2);
    this.aliveCount = this.totalBots + (isSquad ? 2 : 1);
    for (let i = 0; i < this.totalBots; i++) {
      const ang = (i / this.totalBots) * Math.PI * 2 + 0.3;
      const dist = 24 + (i % 4) * 9;
      const bx = Math.cos(ang) * dist;
      const bz = Math.sin(ang) * dist;
      const isBoss = i === this.totalBots - 1;
      const built = buildSoldierMesh(
        isBoss ? 0x7f1d1d : 0xdc2626,
        isBoss ? 0xfacc15 : 0x450a0a,
        isBoss ? 0xfacc15 : 0xff6b6b,
        isBoss ? 1.45 : 1.0
      );
      built.group.position.set(bx, 0, bz);
      this.three.scene.add(built.group);
      const hp = isBoss ? 210 + this.level * 25 : 52 + this.level * 8;
      this.bots.push({
        id: i,
        mesh: built.group,
        x: bx,
        z: bz,
        hp,
        maxHp: hp,
        shootCd: 1.0 + Math.random() * 1.4,
        isBoss,
        isAlly: false,
        alive: true
      });
    }
  }

  private spawnLoot(): void {
    const spots: [number, number, LootDrop['kind']][] = [
      [-6, 14, 'ammo'],
      [10, -8, 'med'],
      [-18, -8, 'armor'],
      [18, 12, 'ammo'],
      [-24, 16, 'med'],
      [4, -22, 'armor'],
      [30, -6, 'med'],
      [-32, -16, 'ammo']
    ];
    for (const [lx, lz, kind] of spots) {
      this.createLootCrate(lx, 0, lz, kind);
    }
  }

  private createLootCrate(lx: number, ly: number, lz: number, kind: LootDrop['kind']): void {
    const g = new THREE.Group();
    const isDrop = kind === 'airdrop';
    const col = isDrop ? 0xdc2626 : kind === 'med' ? 0x22c55e : kind === 'armor' ? 0x38bdf8 : 0xfacc15;
    const sz = isDrop ? 1.5 : 0.95;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(sz, isDrop ? 1.2 : 0.65, sz),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.35 })
    );
    box.position.y = isDrop ? 0.6 : 0.42;
    g.add(box);
    let smoke: THREE.Mesh | undefined;
    if (isDrop) {
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(sz + 0.1, 0.25, sz + 0.1),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8 })
      );
      cap.position.y = 1.25;
      smoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.48, 22, 8),
        new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.35, depthWrite: false })
      );
      smoke.position.y = 12;
      g.add(cap, smoke);
    }
    g.position.set(lx, ly, lz);
    this.three.scene.add(g);
    this.loot.push({ mesh: g, smoke, x: lx, y: ly, z: lz, kind, taken: false });
  }

  private ejectFromPlane(): void {
    if (this.phase !== 'plane') return;
    this.phase = 'parachute';
    this.playerGroup.visible = true;
    this.chuteGroup.visible = true;
    this.px = this.planeGroup.position.x;
    this.pz = this.planeGroup.position.z;
    this.py = 38;
    setActionButtonLabel('GLIDE');
    ArcadeAudio.play('dash');
    this.showToast('🪂 Parachute Open! Steer WASD/Arrows to landing zone');
  }

  switchWeapon(slotIdx: number): void {
    const next = Math.max(0, Math.min(BR_WEAPONS.length - 1, slotIdx));
    if (next === this.activeSlot) return;
    this.activeSlot = next;
    this.reloadTimer = 0;
    this.scoped = false;
    ArcadeAudio.play('click');
    this.showToast(`🔫 Equipped ${this.curWeapon.name}`);
  }

  toggleVehicle(): void {
    if (this.phase !== 'ground' || this.gameOver || this.isPaused) return;
    if (this.inVehicle) {
      this.inVehicle = false;
      this.buggySpeed = 0;
      this.px = this.buggyX + Math.cos(this.buggyYaw) * 2.2;
      this.pz = this.buggyZ - Math.sin(this.buggyYaw) * 2.2;
      this.playerGroup.visible = true;
      setActionButtonLabel('FIRE');
      ArcadeAudio.play('click');
      this.showToast('🏃 Exited Military Buggy');
      return;
    }
    if (Math.hypot(this.px - this.buggyX, this.pz - this.buggyZ) < 6.2) {
      this.inVehicle = true;
      this.scoped = false;
      this.firing = false;
      this.playerGroup.visible = false;
      setActionButtonLabel('BOOST');
      ArcadeAudio.play('gas');
      this.showToast('🚗 Driving Buggy! W/S Gas · A/D Steer · [F] Exit');
    } else {
      this.showToast('🚗 Move closer to Buggy to drive!');
    }
  }

  throwGrenade(): void {
    if (this.phase !== 'ground' || this.gameOver || this.isPaused || this.grenades <= 0) return;
    this.grenades--;
    ArcadeAudio.play('dash');
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x365314, emissive: 0xef4444, emissiveIntensity: 0.4 })
    );
    mesh.position.set(this.px, this.py + 1.5, this.pz);
    this.three.scene.add(mesh);
    this.nades.push({
      mesh,
      x: this.px,
      y: this.py + 1.5,
      z: this.pz,
      vx: Math.sin(this.yaw) * 19,
      vy: 6.5,
      vz: Math.cos(this.yaw) * 19,
      fuse: 1.05
    });
    this.showToast(`💣 Frag Out! (${this.grenades} left)`);
  }

  launchFlareAirdrop(): void {
    if (this.phase !== 'ground' || this.gameOver || this.isPaused || this.flares <= 0) return;
    this.flares--;
    ArcadeAudio.play('jetpack');
    const dx = Math.max(-58, Math.min(58, this.px + Math.sin(this.yaw) * 12));
    const dz = Math.max(-58, Math.min(58, this.pz + Math.cos(this.yaw) * 12));
    this.createLootCrate(dx, 28, dz, 'airdrop');
    this.showToast('🚨 Flare Fired! Air-Drop Crate incoming!');
  }

  private onDomDown = (e: PointerEvent): void => {
    if (this.gameOver || this.isPaused) return;
    if (this.phase === 'plane') {
      this.ejectFromPlane();
      return;
    }
    const stagePt = mapClientToStage(e.clientX, e.clientY);
    const vp = getViewportSize();

    // Tap bottom weapon bar slots directly
    if (stagePt.y > vp.height - 68 && vp.width >= 520) {
      const slotW = 76;
      const startX = vp.width / 2 - slotW * 2;
      if (stagePt.x >= startX && stagePt.x <= startX + slotW * 4) {
        const idx = Math.floor((stagePt.x - startX) / slotW);
        this.switchWeapon(idx);
        return;
      }
    }

    if (e.button === 2) {
      this.scoped = !this.scoped;
      ArcadeAudio.play('click');
      return;
    }
    this.dragLookId = e.pointerId;
    this.dragLastX = e.clientX;
    this.dragLastY = e.clientY;
    if (stagePt.x > vp.width * 0.62 && stagePt.y > 140 && this.phase === 'ground' && !this.inVehicle) {
      this.firing = true;
    }
  };

  private onDomMove = (e: PointerEvent): void => {
    if (this.dragLookId !== e.pointerId || this.isPaused || this.gameOver) return;
    const { dx, dy } = mapClientDeltaToStage(e.clientX - this.dragLastX, e.clientY - this.dragLastY);
    this.dragLastX = e.clientX;
    this.dragLastY = e.clientY;
    const sens = this.scoped ? 0.0024 : 0.0052;
    this.yaw -= dx * sens;
    this.pitch = Math.max(-0.35, Math.min(0.42, this.pitch + dy * sens * 0.7));
  };

  private onDomUp = (e: PointerEvent): void => {
    if (this.dragLookId === e.pointerId) {
      this.dragLookId = null;
    }
    this.firing = false;
  };

  setMoveDir(dx: number, dy: number): void {
    if (this.gameOver || this.isPaused) {
      this.moveX = 0;
      this.moveZ = 0;
      return;
    }
    this.moveX = dx;
    this.moveZ = dy;
  }

  setSteerLeft(down: boolean): void {
    this.moveX = down && !this.gameOver && !this.isPaused ? -1 : 0;
  }

  setSteerRight(down: boolean): void {
    this.moveX = down && !this.gameOver && !this.isPaused ? 1 : 0;
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.phase === 'plane') {
      this.ejectFromPlane();
      return;
    }
    if (this.phase === 'ground' && !this.inVehicle && this.py <= 0.02) {
      this.pvy = 9.2;
      ArcadeAudio.play('jump');
    }
  }

  toggleScope(): void {
    if (this.gameOver || this.isPaused || this.phase !== 'ground' || this.inVehicle) return;
    this.scoped = !this.scoped;
    ArcadeAudio.play('click');
  }

  reload(): void {
    if (this.gameOver || this.isPaused || this.phase !== 'ground') return;
    const cur = this.weaponMag[this.activeSlot];
    const res = this.weaponReserve[this.activeSlot];
    const w = this.curWeapon;
    if (this.reloadTimer <= 0 && cur < w.magSize && res > 0) {
      this.reloadTimer = w.reloadSec;
      ArcadeAudio.play('reload');
    }
  }

  useMedkit(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.medkits > 0 && this.lives < this.maxLives) {
      this.medkits--;
      this.lives = Math.min(this.maxLives, this.lives + 48);
      ArcadeAudio.play('match');
      updateHealthDisplay(Math.round(this.lives), this.maxLives);
      this.showToast(`🩹 Used Medkit (+48 HP · ${this.medkits} left)`);
    }
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (!pressed) {
      if (actionKey === 'fire' || actionKey === 'action') this.firing = false;
      else if (actionKey === 'moveUp' || actionKey === 'moveDown') this.moveZ = 0;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    if (this.phase === 'plane' && (actionKey === 'fire' || actionKey === 'action' || actionKey === 'jump')) {
      this.ejectFromPlane();
      return;
    }
    if (actionKey === 'fire' || actionKey === 'action') this.firing = true;
    else if (actionKey === 'moveUp') this.moveZ = -1;
    else if (actionKey === 'moveDown') this.moveZ = 1;
    else if (actionKey === 'jump') this.jump();
    else if (actionKey === 'scope') this.toggleScope();
    else if (actionKey === 'reload') this.reload();
    else if (actionKey === 'heal') this.useMedkit();
    else if (actionKey === 'vehicle') this.toggleVehicle();
    else if (actionKey === 'swapWeapon') this.switchWeapon((this.activeSlot + 1) % BR_WEAPONS.length);
    else if (actionKey === 'grenade') this.throwGrenade();
    else if (actionKey === 'flare') this.launchFlareAirdrop();
  }

  private firePlayerShot(): void {
    if (this.phase !== 'ground' || this.inVehicle || this.reloadTimer > 0) return;
    const w = this.curWeapon;
    if (this.weaponMag[this.activeSlot] <= 0) {
      this.reload();
      return;
    }
    this.weaponMag[this.activeSlot]--;
    this.fireCd = w.fireCd;
    ArcadeAudio.play('shoot');

    this.muzzleObj.getWorldPosition(_rayOrigin);
    const baseDirX = Math.sin(this.yaw);
    const baseDirZ = Math.cos(this.yaw);
    const baseDirY = -this.pitch * 0.65;

    for (let p = 0; p < w.pellets; p++) {
      const spX = (Math.random() - 0.5) * w.spread;
      const spY = (Math.random() - 0.5) * w.spread;
      const dx = baseDirX + spX;
      const dy = baseDirY + spY * 0.5;
      const dz = baseDirZ - spX * 0.4;
      const len = Math.hypot(dx, dy, dz) || 1;
      const mesh = new THREE.Mesh(this.bulletGeo, this.playerBulletMat);
      mesh.position.copy(_rayOrigin);
      this.three.scene.add(mesh);
      this.bullets.push({
        mesh,
        x: _rayOrigin.x,
        y: _rayOrigin.y,
        z: _rayOrigin.z,
        vx: (dx / len) * w.bulletSpeed,
        vy: (dy / len) * w.bulletSpeed,
        vz: (dz / len) * w.bulletSpeed,
        fromAlly: true,
        dmg: w.dmg,
        life: w.rangeLife
      });
    }
    if (this.weaponMag[this.activeSlot] === 0) this.reload();
  }

  private resolveCoverCollision(x: number, z: number, radius: number): { x: number; z: number } {
    let nx = x;
    let nz = z;
    for (const c of this.covers) {
      const dx = nx - c.x;
      const dz = nz - c.z;
      const ox = c.hw + radius - Math.abs(dx);
      const oz = c.hd + radius - Math.abs(dz);
      if (ox > 0 && oz > 0) {
        if (ox < oz) nx += dx >= 0 ? ox : -ox;
        else nz += dz >= 0 ? oz : -oz;
      }
    }
    const maxR = 82;
    const d = Math.hypot(nx, nz);
    if (d > maxR) {
      nx = (nx / d) * maxR;
      nz = (nz / d) * maxR;
    }
    return { x: nx, z: nz };
  }

  private killEnemyBot(b: BotUnit, scorePts: number, coinAmt: number): void {
    b.alive = false;
    b.mesh.visible = false;
    this.kills++;
    playerState.brKills++;
    this.aliveCount = Math.max(1, this.aliveCount - 1);
    this.score += scorePts;
    addCoins(coinAmt);
    addXp(b.isBoss ? 40 : 15);
    ArcadeAudio.play('explosion');
    updateInGameHud(this.score, this.level, this.gameIdx);

    const enemiesLeft = this.bots.filter((u) => u.alive && !u.isAlly).length;
    if (enemiesLeft <= 0) {
      this.score += 550;
      addCoins(55);
      playerState.brWins++;
      persistBrStats();
      ArcadeAudio.play('levelup');
      this.endMatch(true);
    } else {
      persistBrStats();
    }
  }

  private updateSimulation(dt: number): void {
    this.elapsed += dt;
    if (this.toastTimer > 0) this.toastTimer = Math.max(0, this.toastTimer - dt);
    if (this.hitMarkerTimer > 0) this.hitMarkerTimer = Math.max(0, this.hitMarkerTimer - dt);
    if (this.fireCd > 0) this.fireCd -= dt;
    if (this.roadkillCd > 0) this.roadkillCd -= dt;

    // 1. C-130 Cargo Plane flight
    if (this.phase === 'plane') {
      this.planeT += dt * 0.14;
      this.planeGroup.position.lerpVectors(this.planeStart, this.planeEnd, Math.min(1, this.planeT));
      this.px = this.planeGroup.position.x;
      this.py = this.planeGroup.position.y;
      this.pz = this.planeGroup.position.z;
      _camDesired.set(this.px - 12, this.py + 5.5, this.pz - 12);
      this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-8 * dt));
      _camTarget.set(this.px + 6, this.py - 2, this.pz + 6);
      this.three.camera.lookAt(_camTarget);
      if (this.planeT >= 0.62) {
        this.ejectFromPlane();
      }
      return;
    }

    // Plane fades off once past map
    if (this.planeT < 1.15) {
      this.planeT += dt * 0.12;
      this.planeGroup.position.lerpVectors(this.planeStart, this.planeEnd, Math.min(1.15, this.planeT));
    } else {
      this.planeGroup.visible = false;
    }

    // 2. Parachute drop steering
    if (this.phase === 'parachute') {
      const fwdX = Math.sin(this.yaw);
      const fwdZ = Math.cos(this.yaw);
      const rightX = -Math.cos(this.yaw);
      const rightZ = Math.sin(this.yaw);
      const glideSpd = 17.5 * dt;
      this.px = Math.max(-68, Math.min(68, this.px + (fwdX * -this.moveZ + rightX * this.moveX) * glideSpd));
      this.pz = Math.max(-68, Math.min(68, this.pz + (fwdZ * -this.moveZ + rightZ * this.moveX) * glideSpd));
      this.py -= 7.8 * dt;
      this.playerGroup.position.set(this.px, Math.max(0, this.py), this.pz);
      this.playerGroup.rotation.y = this.yaw;

      if (this.py <= 0.05) {
        this.py = 0;
        this.chuteGroup.visible = false;
        this.phase = 'ground';
        setActionButtonLabel('FIRE');
        ArcadeAudio.play('click');
        this.showToast('⚔️ Touchdown! Loot weapons, find Buggy [F], survive!');
      }

      _camDesired.set(this.px - Math.sin(this.yaw) * 8.5, this.py + 4.8, this.pz - Math.cos(this.yaw) * 8.5);
      this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-10 * dt));
      _camTarget.set(this.px, this.py + 1.5, this.pz);
      this.three.camera.lookAt(_camTarget);
      return;
    }

    // Reloading
    if (this.reloadTimer > 0) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const w = this.curWeapon;
        const needed = Math.min(w.magSize - this.weaponMag[this.activeSlot], this.weaponReserve[this.activeSlot]);
        this.weaponMag[this.activeSlot] += needed;
        this.weaponReserve[this.activeSlot] -= needed;
      }
    }

    // 3. Player or Buggy locomotion
    if (this.inVehicle) {
      const throttle = -this.moveZ;
      const steer = -this.moveX;
      if (throttle > 0.1) this.buggySpeed = Math.min(24, this.buggySpeed + 20 * dt);
      else if (throttle < -0.1) this.buggySpeed = Math.max(-10, this.buggySpeed - 18 * dt);
      else this.buggySpeed *= Math.pow(0.25, dt);

      if (Math.abs(this.buggySpeed) > 0.5) {
        this.buggyYaw += steer * 2.1 * Math.sign(this.buggySpeed) * dt;
      }
      const nPos = this.resolveCoverCollision(
        this.buggyX + Math.sin(this.buggyYaw) * this.buggySpeed * dt,
        this.buggyZ + Math.cos(this.buggyYaw) * this.buggySpeed * dt,
        1.5
      );
      this.buggyX = nPos.x;
      this.buggyZ = nPos.z;
      this.px = this.buggyX;
      this.pz = this.buggyZ;
      this.yaw = this.buggyYaw;
      this.buggyGroup.position.set(this.buggyX, 0, this.buggyZ);
      this.buggyGroup.rotation.y = this.buggyYaw;
      for (const wMesh of this.buggyWheels) wMesh.rotation.x += this.buggySpeed * dt * 1.4;

      if (Math.abs(this.buggySpeed) > 9 && this.roadkillCd <= 0) {
        for (const b of this.bots) {
          if (!b.alive || b.isAlly) continue;
          if (Math.hypot(b.x - this.buggyX, b.z - this.buggyZ) < 2.5) {
            this.roadkillCd = 0.35;
            b.hp -= 75;
            this.showToast('🚗 ROADKILL HIT!');
            if (b.hp <= 0) {
              this.killEnemyBot(b, b.isBoss ? 320 : 120, b.isBoss ? 25 : 10);
              if (this.gameOver) return;
            }
          }
        }
      }
    } else {
      const fwdX = Math.sin(this.yaw);
      const fwdZ = Math.cos(this.yaw);
      const rightX = -Math.cos(this.yaw);
      const rightZ = Math.sin(this.yaw);
      const spd = (this.scoped ? 6.2 : 11.8) * dt;
      const vx = (fwdX * -this.moveZ + rightX * this.moveX) * spd;
      const vz = (fwdZ * -this.moveZ + rightZ * this.moveX) * spd;
      const next = this.resolveCoverCollision(this.px + vx, this.pz + vz, 0.7);
      this.px = next.x;
      this.pz = next.z;

      if (this.py > 0 || this.pvy !== 0) {
        this.py += this.pvy * dt;
        this.pvy -= 24 * dt;
        if (this.py <= 0) {
          this.py = 0;
          this.pvy = 0;
        }
      }

      this.playerGroup.position.set(this.px, this.py, this.pz);
      this.playerGroup.rotation.y = this.yaw;

      if (this.firing && this.fireCd <= 0) {
        this.firePlayerShot();
      }
    }

    // Periodic Airdrops
    this.airdropTimer -= dt;
    if (this.airdropTimer <= 0) {
      this.airdropTimer = 26;
      const dropR = Math.min(this.stormRadius * 0.55, 28);
      const ang = Math.random() * Math.PI * 2;
      this.createLootCrate(Math.cos(ang) * dropR, 30, Math.sin(ang) * dropR, 'airdrop');
      this.showToast('🪂 Supply Airdrop Incoming! Follow Red Smoke');
    }

    // Loot + falling Airdrop crates
    for (const l of this.loot) {
      if (l.taken) continue;
      if (l.y > 0) {
        l.y = Math.max(0, l.y - 6.5 * dt);
        l.mesh.position.y = l.y;
      }
      l.mesh.rotation.y += dt * 1.8;
      if (l.y <= 0.2 && Math.hypot(l.x - this.px, l.z - this.pz) < 2.2) {
        l.taken = true;
        l.mesh.visible = false;
        ArcadeAudio.play('coin');
        if (l.kind === 'airdrop') {
          this.armor = Math.min(100, this.armor + 55);
          this.medkits += 2;
          this.weaponReserve[3] += 10;
          this.weaponReserve[0] += 60;
          this.score += 150;
          addCoins(12);
          this.showToast('🎁 Airdrop Looted: Lv.3 Armor + AWM Ammo!');
        } else if (l.kind === 'med') {
          this.medkits++;
        } else if (l.kind === 'armor') {
          this.armor = Math.min(100, this.armor + 40);
        } else {
          this.weaponReserve[0] += 60;
          this.weaponReserve[1] += 60;
          this.weaponReserve[2] += 12;
        }
        this.score += 20;
        updateInGameHud(this.score, this.level, this.gameIdx);
      }
    }

    // Shrinking Storm Zone
    this.stormRadius = Math.max(12, this.stormRadius - this.stormShrinkRate * dt);
    this.stormMesh.scale.set(this.stormRadius, 1, this.stormRadius);
    if (Math.hypot(this.px, this.pz) > this.stormRadius) {
      this.stormDmgTick += dt;
      if (this.stormDmgTick >= 0.65) {
        this.stormDmgTick = 0;
        this.damagePlayer(6);
        if (this.gameOver) return;
      }
    }

    // Grenades
    for (let i = this.nades.length - 1; i >= 0; i--) {
      const g = this.nades[i];
      g.fuse -= dt;
      g.vy -= 18 * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.z += g.vz * dt;
      if (g.y < 0.2) {
        g.y = 0.2;
        g.vy *= -0.35;
        g.vx *= 0.6;
        g.vz *= 0.6;
      }
      g.mesh.position.set(g.x, g.y, g.z);
      if (g.fuse <= 0) {
        ArcadeAudio.play('explosion');
        const boom = new THREE.Mesh(
          new THREE.RingGeometry(1.5, 8.5, 24),
          new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        boom.rotation.x = -Math.PI / 2;
        boom.position.set(g.x, 0.25, g.z);
        this.three.scene.add(boom);
        this.fxRings.push({ mesh: boom, life: 0.35 });

        for (const b of this.bots) {
          if (!b.alive || b.isAlly) continue;
          const d = Math.hypot(b.x - g.x, b.z - g.z);
          if (d < 9.0) {
            b.hp -= Math.round(135 * (1 - d / 11));
            if (b.hp <= 0) {
              this.killEnemyBot(b, b.isBoss ? 300 : 110, b.isBoss ? 25 : 8);
              if (this.gameOver) return;
            }
          }
        }
        this.three.scene.remove(g.mesh);
        g.mesh.geometry.dispose();
        (g.mesh.material as THREE.Material).dispose();
        this.nades.splice(i, 1);
      }
    }

    // FX Rings
    for (let i = this.fxRings.length - 1; i >= 0; i--) {
      const fx = this.fxRings[i];
      fx.life -= dt;
      fx.mesh.scale.addScalar(dt * 2.5);
      if (fx.life <= 0) {
        this.three.scene.remove(fx.mesh);
        fx.mesh.geometry.dispose();
        (fx.mesh.material as THREE.Material).dispose();
        this.fxRings.splice(i, 1);
      }
    }

    // Bots + Wingman AI
    for (const b of this.bots) {
      if (!b.alive) continue;
      if (b.isAlly) {
        // Follow player & target nearest enemy bot
        let nearEnemy: BotUnit | null = null;
        let nearDist = 34;
        for (const e of this.bots) {
          if (!e.alive || e.isAlly) continue;
          const d = Math.hypot(e.x - b.x, e.z - b.z);
          if (d < nearDist) {
            nearDist = d;
            nearEnemy = e;
          }
        }
        const tx = Math.hypot(this.px - b.x, this.pz - b.z) > 10 ? this.px - 2.5 : b.x;
        const tz = Math.hypot(this.px - b.x, this.pz - b.z) > 10 ? this.pz - 2.5 : b.z;
        const mdx = tx - b.x;
        const mdz = tz - b.z;
        const md = Math.hypot(mdx, mdz) || 1;
        if (md > 1.5) {
          const next = this.resolveCoverCollision(b.x + (mdx / md) * 8.5 * dt, b.z + (mdz / md) * 8.5 * dt, 0.75);
          b.x = next.x;
          b.z = next.z;
          b.mesh.position.set(b.x, 0, b.z);
        }
        b.shootCd -= dt;
        if (nearEnemy) {
          b.mesh.rotation.y = Math.atan2(nearEnemy.x - b.x, nearEnemy.z - b.z);
          if (b.shootCd <= 0) {
            b.shootCd = 0.45;
            const ang = Math.atan2(nearEnemy.x - b.x, nearEnemy.z - b.z);
            const m = new THREE.Mesh(this.bulletGeo, this.playerBulletMat);
            m.position.set(b.x, 1.35, b.z);
            this.three.scene.add(m);
            this.bullets.push({
              mesh: m,
              x: b.x,
              y: 1.35,
              z: b.z,
              vx: Math.sin(ang) * 52,
              vy: 0,
              vz: Math.cos(ang) * 52,
              fromAlly: true,
              dmg: 22,
              life: 1.1
            });
          }
        }
        continue;
      }

      const dx = this.px - b.x;
      const dz = this.pz - b.z;
      const dist = Math.hypot(dx, dz) || 1;
      const toStormCenter = Math.hypot(b.x, b.z);
      let mx = 0;
      let mz = 0;
      if (toStormCenter > this.stormRadius - 4) {
        mx = -b.x / (toStormCenter || 1);
        mz = -b.z / (toStormCenter || 1);
      } else if (dist > 14 && dist < 46) {
        mx = dx / dist;
        mz = dz / dist;
      } else {
        mx = Math.sin(this.elapsed + b.id) * 0.6;
        mz = Math.cos(this.elapsed + b.id) * 0.6;
      }
      const bSpeed = (b.isBoss ? 5.6 : 4.2) * this.scaler.speedMult * dt;
      const bn = this.resolveCoverCollision(b.x + mx * bSpeed, b.z + mz * bSpeed, 0.75);
      b.x = bn.x;
      b.z = bn.z;
      b.mesh.position.set(b.x, 0, b.z);
      b.mesh.rotation.y = Math.atan2(dx, dz);

      b.shootCd -= dt;
      if (b.shootCd <= 0 && dist < 38) {
        b.shootCd = (b.isBoss ? 0.68 : 1.25) / this.scaler.speedMult;
        const m = new THREE.Mesh(this.bulletGeo, this.enemyBulletMat);
        m.position.set(b.x, 1.35, b.z);
        this.three.scene.add(m);
        const spread = (Math.random() - 0.5) * 0.14;
        const ang = Math.atan2(dx, dz) + spread;
        this.bullets.push({
          mesh: m,
          x: b.x,
          y: 1.35,
          z: b.z,
          vx: Math.sin(ang) * 38,
          vy: 0,
          vz: Math.cos(ang) * 38,
          fromAlly: false,
          dmg: b.isBoss ? 14 : 8,
          life: 1.6
        });
      }
    }

    // Bullets update
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const p = this.bullets[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.y, p.z);

      let dead = p.life <= 0 || p.y < 0.05;
      if (!dead) {
        for (const c of this.covers) {
          if (Math.abs(p.x - c.x) < c.hw && Math.abs(p.z - c.z) < c.hd && p.y <= c.h) {
            dead = true;
            break;
          }
        }
      }

      if (!dead && p.fromAlly) {
        for (const b of this.bots) {
          if (!b.alive || b.isAlly) continue;
          const hitRad = b.isBoss ? 1.35 : 0.98;
          if (Math.hypot(p.x - b.x, p.z - b.z) < hitRad && p.y >= 0 && p.y <= 2.4) {
            dead = true;
            this.hitMarkerTimer = 0.14;
            b.hp -= p.dmg;
            if (b.hp <= 0) {
              this.killEnemyBot(b, b.isBoss ? 300 : 100, b.isBoss ? 25 : 8);
              if (this.gameOver) return;
            } else {
              ArcadeAudio.play('hit');
            }
            break;
          }
        }
      } else if (!dead && !p.fromAlly) {
        if (Math.hypot(p.x - this.px, p.z - this.pz) < (this.inVehicle ? 1.3 : 0.85) && Math.abs(p.y - (this.py + 1.1)) < 1.1) {
          dead = true;
          this.damagePlayer(this.inVehicle ? Math.round(p.dmg * 0.5) : p.dmg);
          if (this.gameOver) return;
        }
      }

      if (dead) {
        this.three.scene.remove(p.mesh);
        this.bullets.splice(i, 1);
      }
    }

    // Camera follow (Normal / Scope / Vehicle)
    const targetFov = this.inVehicle ? 68 : this.scoped ? this.curWeapon.scopeFov : 62;
    const nextFov = THREE.MathUtils.damp(this.three.camera.fov, targetFov, 12, dt);
    if (Math.abs(nextFov - this.three.camera.fov) > 0.02) {
      this.three.camera.fov = nextFov;
      this.three.camera.updateProjectionMatrix();
    }

    const camBack = this.inVehicle ? 8.2 : this.scoped ? 1.55 : 4.8;
    const camRight = this.inVehicle ? 0 : this.scoped ? 0.52 : 0.85;
    _camDesired.set(
      this.px - Math.sin(this.yaw) * camBack - Math.cos(this.yaw) * camRight,
      this.py + (this.inVehicle ? 4.2 : this.scoped ? 1.92 : 2.65) + this.pitch * 1.4,
      this.pz - Math.cos(this.yaw) * camBack + Math.sin(this.yaw) * camRight
    );
    this.three.camera.position.lerp(_camDesired, 1 - Math.exp(-14 * dt));
    _camTarget.set(
      this.px + Math.sin(this.yaw) * 18,
      this.py + 1.45 - this.pitch * 6,
      this.pz + Math.cos(this.yaw) * 18
    );
    this.three.camera.lookAt(_camTarget);
  }

  private damagePlayer(dmg: number): void {
    let rem = dmg;
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, Math.round(dmg * 0.55));
      this.armor -= absorbed;
      rem -= absorbed;
    }
    this.lives = Math.max(0, Math.round(this.lives - rem));
    ArcadeAudio.play('hurt');
    updateHealthDisplay(this.lives, this.maxLives);
    if (this.lives <= 0) {
      this.endMatch(false);
    }
  }

  private endMatch(victory: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isRunning = false;
    triggerGameOver(this.score, playerState.sessionCoins, this.level, this.gameIdx, victory);
  }

  private drawOverlayHud(): void {
    const ctx = this.three.overlayCtx;
    if (!ctx) return;
    const w = this.three.width;
    const h = this.three.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;

    if (this.phase === 'ground' && !this.inVehicle) {
      if (this.scoped && this.curWeapon.id === 'awm') {
        // 4x Sniper Scope Reticle
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.lineWidth = Math.max(24, w * 0.08);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 120, cy); ctx.lineTo(cx + 120, cy);
        ctx.moveTo(cx, cy - 120); ctx.lineTo(cx, cy + 120);
        ctx.stroke();
      } else {
        ctx.strokeStyle = this.scoped ? '#38bdf8' : 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2;
        const gap = this.scoped ? 4 : 8;
        const arm = this.scoped ? 14 : 9;
        ctx.beginPath();
        ctx.moveTo(cx - gap - arm, cy); ctx.lineTo(cx - gap, cy);
        ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + gap + arm, cy);
        ctx.moveTo(cx, cy - gap - arm); ctx.lineTo(cx, cy - gap);
        ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + gap + arm);
        ctx.stroke();
      }
      if (this.hitMarkerTimer > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx - 4, cy - 4);
        ctx.moveTo(cx + 10, cy - 10); ctx.lineTo(cx + 4, cy - 4);
        ctx.moveTo(cx - 10, cy + 10); ctx.lineTo(cx - 4, cy + 4);
        ctx.moveTo(cx + 10, cy + 10); ctx.lineTo(cx + 4, cy + 4);
        ctx.stroke();
      }
    }

    // Radar Minimap with Buggy & Airdrop pings
    const compactLandscape = w > h * 1.3 && h < 480;
    const mapSize = w < 460 || compactLandscape ? 72 : 94;
    const mx = w - mapSize - 12;
    const my = compactLandscape ? 48 : 58;
    ctx.fillStyle = 'rgba(10, 18, 28, 0.8)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(mx + mapSize / 2, my + mapSize / 2, mapSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const scale = (mapSize * 0.45) / 84;
    const midX = mx + mapSize / 2;
    const midY = my + mapSize / 2;
    ctx.strokeStyle = 'rgba(56,189,248,0.85)';
    ctx.beginPath();
    ctx.arc(midX, midY, this.stormRadius * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Buggy green dot on minimap
    ctx.fillStyle = '#facc15';
    ctx.fillRect(midX + this.buggyX * scale - 2.5, midY + this.buggyZ * scale - 2.5, 5, 5);

    for (const l of this.loot) {
      if (!l.taken && l.kind === 'airdrop') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(midX + l.x * scale - 3, midY + l.z * scale - 3, 6, 6);
      }
    }
    for (const b of this.bots) {
      if (!b.alive) continue;
      ctx.fillStyle = b.isAlly ? '#38bdf8' : b.isBoss ? '#facc15' : '#ef4444';
      ctx.fillRect(midX + b.x * scale - 2, midY + b.z * scale - 2, b.isBoss ? 5 : 3.5, b.isBoss ? 5 : 3.5);
    }
    ctx.fillStyle = '#84fab0';
    ctx.beginPath();
    ctx.arc(midX + this.px * scale, midY + this.pz * scale, 4, 0, Math.PI * 2);
    ctx.fill();

    // Top-center Status Badge
    const pillW = Math.min(w - (compactLandscape ? 160 : 20), 290);
    const pillX = cx - pillW / 2;
    const pillY = w < 560 ? 52 : compactLandscape ? 42 : 12;
    ctx.fillStyle = 'rgba(10,16,26,0.82)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, 30, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const mag = this.weaponMag[this.activeSlot];
    const res = this.weaponReserve[this.activeSlot];
    const ammoTxt = this.reloadTimer > 0 ? 'RELOADING...' : `${mag}/${res}`;
    const buggyDist = Math.hypot(this.px - this.buggyX, this.pz - this.buggyZ);
    const hintTag = this.inVehicle ? '🚗[F]Exit' : buggyDist < 6.2 ? '🚗[F]Drive' : `🚨${this.flares} 💣${this.grenades}`;
    ctx.fillText(
      `👥${this.aliveCount} · 💀${this.kills} · ${this.curWeapon.shortName} ${ammoTxt} · 🛡️${this.armor} · ${hintTag}`,
      cx,
      pillY + 19
    );

    // Toast Notification (Drop prompt / Roadkill / Airdrop)
    if (this.toastTimer > 0 && this.toastText) {
      const toastY = pillY + 36;
      ctx.fillStyle = 'rgba(12, 17, 28, 0.88)';
      const tw = Math.min(w - 28, 360);
      ctx.beginPath();
      ctx.roundRect(cx - tw / 2, toastY, tw, 28, 10);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.toastText, cx, toastY + 18);
    }

    // 4-Weapon Bottom Strip (clickable on desktop/tablet)
    if (this.phase === 'ground' && w >= 520) {
      const slotW = 76;
      const startX = cx - slotW * 2;
      const barY = h - 54;
      for (let i = 0; i < BR_WEAPONS.length; i++) {
        const wd = BR_WEAPONS[i];
        const active = i === this.activeSlot;
        ctx.fillStyle = active ? 'rgba(245, 158, 11, 0.92)' : 'rgba(15, 23, 42, 0.8)';
        ctx.beginPath();
        ctx.roundRect(startX + i * slotW + 2, barY, slotW - 4, 38, 8);
        ctx.fill();
        ctx.strokeStyle = active ? '#fef08a' : 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = active ? '#0f172a' : '#f8fafc';
        ctx.font = '900 10px system-ui, sans-serif';
        ctx.fillText(`[${wd.slot}] ${wd.shortName}`, startX + i * slotW + slotW / 2, barY + 16);
        ctx.font = '700 9px system-ui, sans-serif';
        ctx.fillText(`${this.weaponMag[i]}/${this.weaponReserve[i]}`, startX + i * slotW + slotW / 2, barY + 30);
      }
    }
    ctx.textAlign = 'left';
  }

  private tick = (): void => {
    if (!this.isRunning || this.gameOver || this.isPaused) return;
    const now = performance.now();
    const dt = Math.min(Math.max((now - this.lastTime) / 1000, 0.001), 0.05);
    this.lastTime = now;

    this.updateSimulation(dt);
    this.drawOverlayHud();
    this.three.render();
    if (this.isRunning && !this.gameOver && !this.isPaused) {
      this.three.scheduleNextFrame(this.tick);
    }
  };
}
