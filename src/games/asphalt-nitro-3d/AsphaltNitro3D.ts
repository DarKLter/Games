import * as THREE from 'three';
import {
  ASPHALT_CARS,
  ASPHALT_MAPS,
  AsphaltCarDef,
  AsphaltMapDef,
  SupercarBodyStyle,
  computeUpgradedCarStats
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, triggerGameOver, updateInGameHud } from '../../core/runtimeBridge';
import { persistAsphaltGarage, playerState } from '../../core/storage';
import { Difficulty, DifficultyScaler, difficultyScalers, GameInstance } from '../../core/types';
import { StudioThreeContext, addInkOutline, buildSupercarMesh, createToonMaterial } from '../../core/threeShared';

export interface CollidableCarState {
  s: number;
  lane: number;
  speed: number;
  yOff: number;
  mass: number;
  knockTimer: number;
}

/** Pure pairwise car-to-car collision impulse solver (exported for unit tests). */
export function resolveCarCollisionStep(
  a: CollidableCarState,
  b: CollidableCarState,
  trackLength: number,
  laneHalfLimit: number
): { hit: boolean; relSpeed: number } {
  if (Math.abs(a.yOff - b.yOff) > 1.55) return { hit: false, relSpeed: 0 };

  let ds = a.s - b.s;
  ds = ds - Math.round(ds);
  const longDist = ds * trackLength;
  const latDist = a.lane - b.lane;

  const minLong = 4.6;
  const minLat = 2.25;
  if (Math.abs(longDist) >= minLong || Math.abs(latDist) >= minLat) {
    return { hit: false, relSpeed: 0 };
  }

  const totalMass = a.mass + b.mass;
  const ratioA = b.mass / totalMass;
  const ratioB = a.mass / totalMass;
  const relSpeed = Math.abs(a.speed - b.speed);

  const penLat = minLat - Math.abs(latDist);
  const penLong = minLong - Math.abs(longDist);

  if (penLat <= penLong) {
    const signLat = latDist >= 0 ? 1 : -1;
    a.lane = Math.max(-laneHalfLimit, Math.min(laneHalfLimit, a.lane + signLat * penLat * ratioA));
    b.lane = Math.max(-laneHalfLimit, Math.min(laneHalfLimit, b.lane - signLat * penLat * ratioB));
  } else {
    const signLong = longDist >= 0 ? 1 : -1;
    const pushS = (signLong * (penLong + 0.12)) / Math.max(1, trackLength);
    a.s += pushS * ratioA;
    b.s -= pushS * ratioB;
    const avgSpd = (a.speed * a.mass + b.speed * b.mass) / totalMass;
    a.speed = a.speed * 0.45 + avgSpd * 0.55;
    b.speed = b.speed * 0.45 + avgSpd * 0.55;
  }
  return { hit: true, relSpeed };
}

interface RacerCar extends CollidableCarState {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  flameL: THREE.Mesh;
  flameR: THREE.Mesh;
  vy: number;
  airSpin: number;
  targetLane: number;
  isPlayer: boolean;
  eliminated: boolean;
}

interface TrackPickup {
  mesh: THREE.Mesh;
  s: number;
  lane: number;
  kind: 'nitro' | 'ramp' | 'gate';
  cooldown: number;
}

interface SparkParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
}

const _p0 = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _right = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _camLook = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

export class AsphaltNitro3D implements GameInstance {
  container: HTMLElement;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  carDef: AsphaltCarDef;
  mapDef: AsphaltMapDef;
  tuned: ReturnType<typeof computeUpgradedCarStats>;
  scaler: DifficultyScaler;
  score = 0;
  lives = 1;
  maxLives = 1;
  isPaused = false;
  gameOver = false;
  isRunning = false;

  three!: StudioThreeContext;
  curve!: THREE.CatmullRomCurve3;
  trackLength = 1320;
  laneHalfLimit = 8.6;
  racers: RacerCar[] = [];
  playerCar!: RacerCar;
  pickups: TrackPickup[] = [];
  sparks: SparkParticle[] = [];

  steerLeft = false;
  steerRight = false;
  analogSteer = 0;
  boosting = false;
  drifting = false;
  nitroEnergy = 100;
  totalLaps = 3;
  knockdowns = 0;
  gatesHit = 0;
  missionClock = 0;
  lap1ElimDone = false;
  playerRank = 1;
  bumpShake = 0;
  slamBanner = '';
  slamBannerTimer = 0;
  elapsed = 0;
  lastTime = 0;

  constructor(
    container: HTMLElement,
    diff: Difficulty,
    lvl: number,
    gameIdx = 26,
    carId = playerState.selectedAsphaltCar
  ) {
    this.container = container;
    this.diff = diff;
    this.level = lvl;
    this.gameIdx = gameIdx;
    this.carDef = ASPHALT_CARS[carId] || ASPHALT_CARS[0];
    this.mapDef = ASPHALT_MAPS[playerState.selectedAsphaltMap] || ASPHALT_MAPS[0];
    this.tuned = computeUpgradedCarStats(this.carDef, playerState.carUpgrades[this.carDef.id]);
    this.totalLaps = this.mapDef.laps;
    this.missionClock = this.mapDef.timeLimitSec;
    this.scaler = difficultyScalers[diff] || difficultyScalers.easy;
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
  }

  start(): void {
    this.three = new StudioThreeContext(this.container, {
      skyColor: this.mapDef.skyColor,
      fogColor: this.mapDef.fogColor,
      fogNear: 95,
      fogFar: 330,
      keyColor: 0xfff3c4,
      keyIntensity: 2.2,
      hemiSky: 0xfde68a,
      hemiGround: this.mapDef.groundColor,
      hemiIntensity: 0.95,
      fov: 62,
      far: 460
    });
    this.three.renderer.toneMapping = THREE.NoToneMapping;

    this.buildCircuit();
    this.spawnRacers();
    this.spawnTrackFeatures();
    this.initSparkPool();
    this.snapRacersAndCamera();

    this.slamBanner = `${this.mapDef.icon} ${this.mapDef.missionGoal.toUpperCase()}`;
    this.slamBannerTimer = 2.4;

    this.three.prewarm();
    this.isRunning = true;
    this.lastTime = performance.now();
    updateInGameHud(this.score, this.level, this.gameIdx);
    this.tick();
  }

  private snapRacersAndCamera(): void {
    for (const car of this.racers) {
      const t = ((car.s % 1) + 1) % 1;
      const tNext = ((car.s + 0.004) % 1 + 1) % 1;
      this.curve.getPointAt(t, _p0);
      this.curve.getPointAt(tNext, _p1);
      _tan.subVectors(_p1, _p0).normalize();
      _right.crossVectors(_tan, _up).normalize();
      car.group.position.set(_p0.x + _right.x * car.lane, _p0.y + car.yOff, _p0.z + _right.z * car.lane);
      car.group.rotation.set(0, Math.atan2(_tan.x, _tan.z), 0);
    }
    const p = this.playerCar;
    const t = ((p.s % 1) + 1) % 1;
    this.curve.getPointAt(t, _p0);
    this.curve.getTangentAt(t, _tan).normalize();
    this.three.camera.position.set(
      p.group.position.x - _tan.x * 9.2,
      p.group.position.y + 3.6,
      p.group.position.z - _tan.z * 9.2
    );
    this.three.camera.lookAt(
      p.group.position.x + _tan.x * 20,
      p.group.position.y + 1.2,
      p.group.position.z + _tan.z * 20
    );
  }

  stop(): void {
    this.isRunning = false;
    this.releaseInputs();
    this.three?.dispose();
  }

  releaseInputs(): void {
    this.steerLeft = false;
    this.steerRight = false;
    this.analogSteer = 0;
    this.boosting = false;
    this.drifting = false;
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

  private buildCircuit(): void {
    const pts: THREE.Vector3[] = [];
    const N = 48;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const rad = 205 + Math.cos(a * 3) * 44 + Math.sin(a * 2) * 32;
      const y = 2.4 + Math.sin(a * 4) * 4.2 + Math.cos(a * 2) * 1.8;
      pts.push(new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad * 1.28));
    }
    this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    this.trackLength = this.curve.getLength();

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1150, 1150),
      createToonMaterial(this.mapDef.groundColor)
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5.5;
    this.three.scene.add(ground);

    const roadTex = this.three.createCanvasTexture(
      256,
      (ctx, s) => {
        ctx.fillStyle = this.mapDef.slug === 'alpine-snow' ? '#475569' : '#334155';
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 18, s);
        ctx.fillRect(s - 18, 0, 18, s);
        ctx.fillStyle = this.mapDef.curbLeftHex;
        ctx.fillRect(3, 0, 11, s);
        ctx.fillStyle = this.mapDef.curbRightHex;
        ctx.fillRect(s - 14, 0, 11, s);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillRect(s / 3 - 2, 16, 5, s / 2 - 24);
        ctx.fillRect(s / 3 - 2, s / 2 + 16, 5, s / 2 - 24);
        ctx.fillRect((s * 2) / 3 - 2, 16, 5, s / 2 - 24);
        ctx.fillRect((s * 2) / 3 - 2, s / 2 + 16, 5, s / 2 - 24);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(s / 2 - 4, 10, 8, s - 20);
      },
      1,
      92
    );

    const segs = 320;
    const roadHalfW = 10.6;
    const posArr: number[] = [];
    const uvArr: number[] = [];
    const idxArr: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const t = (i % segs) / segs;
      this.curve.getPointAt(t, _p0);
      this.curve.getTangentAt(t, _tan).normalize();
      _right.crossVectors(_tan, _up).normalize();

      posArr.push(
        _p0.x - _right.x * roadHalfW, _p0.y, _p0.z - _right.z * roadHalfW,
        _p0.x + _right.x * roadHalfW, _p0.y, _p0.z + _right.z * roadHalfW
      );
      uvArr.push(0, i / 5, 1, i / 5);

      if (i < segs) {
        const b = i * 2;
        idxArr.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
      }
    }
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    roadGeo.setIndex(idxArr);
    roadGeo.computeVertexNormals();

    const roadMesh = new THREE.Mesh(
      roadGeo,
      new THREE.MeshToonMaterial({ map: roadTex, side: THREE.DoubleSide })
    );
    roadMesh.receiveShadow = true;
    this.three.scene.add(roadMesh);

    const pylonColor = this.mapDef.slug === 'volcanic-coast' ? 0xf97316 : this.mapDef.slug === 'alpine-snow' ? 0x0ea5e9 : 0x38bdf8;
    const pylonCount = 72;
    const pylonMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.65, 6.2, 0.65),
      createToonMaterial(pylonColor, { emissive: pylonColor, emissiveIntensity: 0.45 }),
      pylonCount
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < pylonCount; i++) {
      const t = i / pylonCount;
      this.curve.getPointAt(t, _p0);
      this.curve.getTangentAt(t, _tan).normalize();
      _right.crossVectors(_tan, _up).normalize();
      const side = i % 2 === 0 ? 1 : -1;
      dummy.position.set(_p0.x + _right.x * (roadHalfW + 1.6) * side, _p0.y + 2.8, _p0.z + _right.z * (roadHalfW + 1.6) * side);
      dummy.rotation.y = Math.atan2(_tan.x, _tan.z);
      dummy.updateMatrix();
      pylonMesh.setMatrixAt(i, dummy.matrix);
    }
    pylonMesh.instanceMatrix.needsUpdate = true;
    pylonMesh.computeBoundingSphere();
    this.three.scene.add(pylonMesh);

    this.curve.getPointAt(0, _p0);
    this.curve.getTangentAt(0, _tan).normalize();
    const arch = new THREE.Group();
    const archMat = createToonMaterial(0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 0.35 });
    const postL = new THREE.Mesh(new THREE.BoxGeometry(1.1, 9.5, 1.1), archMat);
    postL.position.set(-roadHalfW, 4.7, 0);
    addInkOutline(postL, 1.07);
    const postR = new THREE.Mesh(new THREE.BoxGeometry(1.1, 9.5, 1.1), archMat);
    postR.position.set(roadHalfW, 4.7, 0);
    addInkOutline(postR, 1.07);
    const banner = new THREE.Mesh(new THREE.BoxGeometry(roadHalfW * 2 + 1.8, 1.6, 1.1), archMat);
    banner.position.set(0, 9.1, 0);
    addInkOutline(banner, 1.05);
    arch.add(postL, postR, banner);
    arch.position.copy(_p0);
    arch.rotation.y = Math.atan2(_tan.x, _tan.z);
    this.three.scene.add(arch);

    // Biome props outside circuit (Neon Skyscrapers vs Canyon Mesas vs Alpine Peaks)
    const propCount = 44;
    const isCity = this.mapDef.slug === 'neon-city';
    const isSnow = this.mapDef.slug === 'alpine-snow';
    const propGeo = isCity
      ? new THREE.BoxGeometry(12, 26, 12)
      : isSnow
        ? new THREE.ConeGeometry(13, 24, 6)
        : new THREE.DodecahedronGeometry(9.5, 0);
    const propMesh = new THREE.InstancedMesh(propGeo, createToonMaterial(this.mapDef.mesaColor), propCount);
    for (let i = 0; i < propCount; i++) {
      const t = (i + 0.5) / propCount;
      this.curve.getPointAt(t, _p0);
      this.curve.getTangentAt(t, _tan).normalize();
      _right.crossVectors(_tan, _up).normalize();
      const side = i % 2 === 0 ? 1 : -1;
      dummy.position.set(_p0.x + _right.x * 36 * side, isCity ? 6 : 2, _p0.z + _right.z * 36 * side);
      dummy.scale.set(1.2, 1.1 + (i % 3) * 0.5, 1.2);
      dummy.rotation.y = i * 0.7;
      dummy.updateMatrix();
      propMesh.setMatrixAt(i, dummy.matrix);
    }
    propMesh.instanceMatrix.needsUpdate = true;
    propMesh.computeBoundingSphere();
    this.three.scene.add(propMesh);
  }

  private initSparkPool(): void {
    const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let i = 0; i < 24; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.three.scene.add(mesh);
      this.sparks.push({ mesh, vx: 0, vy: 0, vz: 0, life: 0 });
    }
  }

  private emitCollisionSparks(x: number, y: number, z: number): void {
    let spawned = 0;
    for (const sp of this.sparks) {
      if (sp.life <= 0) {
        sp.life = 0.35 + Math.random() * 0.2;
        sp.vx = (Math.random() - 0.5) * 18;
        sp.vy = 4 + Math.random() * 9;
        sp.vz = (Math.random() - 0.5) * 18;
        sp.mesh.position.set(x, y + 0.5, z);
        sp.mesh.visible = true;
        spawned++;
        if (spawned >= 10) break;
      }
    }
  }

  private spawnRacers(): void {
    const rivalDefs: [number, number, SupercarBodyStyle, number][] = [
      [0x38bdf8, 0xffffff, 'hyper', 0.95],
      [0x22c55e, 0xfacc15, 'gt', 1.0],
      [0xf97316, 0x111827, 'heavy', 1.35],
      [0xec4899, 0xffffff, 'drift', 1.0],
      [0x6366f1, 0xfacc15, 'gt', 1.05]
    ];

    const playerBuilt = buildSupercarMesh(
      this.carDef.paintColor,
      this.carDef.stripeColor,
      this.three.isSoftwareGl,
      this.carDef.style,
      true
    );
    this.three.scene.add(playerBuilt.group);
    const pCar: RacerCar = {
      group: playerBuilt.group,
      wheels: playerBuilt.wheels,
      flameL: playerBuilt.flameL,
      flameR: playerBuilt.flameR,
      s: 0.005,
      lane: 0,
      speed: 42,
      yOff: 0,
      vy: 0,
      airSpin: 0,
      mass: this.carDef.mass,
      knockTimer: 0,
      targetLane: 0,
      isPlayer: true,
      eliminated: false
    };
    this.racers.push(pCar);
    this.playerCar = pCar;

    for (let i = 0; i < rivalDefs.length; i++) {
      const [paint, stripe, style, mass] = rivalDefs[i];
      const built = buildSupercarMesh(paint, stripe, this.three.isSoftwareGl, style, true);
      this.three.scene.add(built.group);
      const startLane = ((i % 3) - 1) * 4.2;
      this.racers.push({
        group: built.group,
        wheels: built.wheels,
        flameL: built.flameL,
        flameR: built.flameR,
        s: 0.014 + i * 0.009,
        lane: startLane,
        speed: 45 + (i % 3) * 3.8 * this.scaler.speedMult,
        yOff: 0,
        vy: 0,
        airSpin: 0,
        mass,
        knockTimer: 0,
        targetLane: startLane,
        isPlayer: false,
        eliminated: false
      });
    }
  }

  private spawnTrackFeatures(): void {
    const isGatesMode = this.mapDef.missionKind === 'gates';
    const total = isGatesMode ? 22 : 16;
    for (let i = 0; i < total; i++) {
      const s = 0.04 + (i / total) * 0.92;
      const kind: TrackPickup['kind'] = isGatesMode
        ? i % 2 === 0
          ? 'gate'
          : i % 4 === 1
            ? 'ramp'
            : 'nitro'
        : i % 3 === 1
          ? 'ramp'
          : 'nitro';
      const lane = ((i * 2) % 5 - 2) * 3.0;
      this.curve.getPointAt(s % 1, _p0);
      this.curve.getTangentAt(s % 1, _tan).normalize();
      _right.crossVectors(_tan, _up).normalize();

      const mesh =
        kind === 'gate'
          ? new THREE.Mesh(
              new THREE.TorusGeometry(2.2, 0.22, 8, 18),
              createToonMaterial(0x22d3ee, { emissive: 0x06b6d4, emissiveIntensity: 0.8 })
            )
          : kind === 'ramp'
            ? new THREE.Mesh(
                new THREE.BoxGeometry(3.8, 0.8, 4.8),
                createToonMaterial(0xfacc15, { emissive: 0xf59e0b, emissiveIntensity: 0.4 })
              )
            : new THREE.Mesh(
                new THREE.OctahedronGeometry(1.05, 0),
                createToonMaterial(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.65 })
              );
      if (kind !== 'gate') addInkOutline(mesh, 1.07);

      mesh.position.set(
        _p0.x + _right.x * lane,
        _p0.y + (kind === 'ramp' ? 0.35 : kind === 'gate' ? 2.1 : 1.15),
        _p0.z + _right.z * lane
      );
      mesh.rotation.y = Math.atan2(_tan.x, _tan.z);
      if (kind === 'ramp') mesh.rotation.x = -0.22;
      this.three.scene.add(mesh);
      this.pickups.push({ mesh, s, lane, kind, cooldown: 0 });
    }
  }

  setSteerLeft(down: boolean): void {
    this.steerLeft = down && !this.gameOver && !this.isPaused;
  }

  setSteerRight(down: boolean): void {
    this.steerRight = down && !this.gameOver && !this.isPaused;
  }

  setMoveDir(dx: number): void {
    if (this.gameOver || this.isPaused) {
      this.analogSteer = 0;
      this.steerLeft = false;
      this.steerRight = false;
      return;
    }
    this.analogSteer = Math.max(-1, Math.min(1, dx));
    this.steerLeft = dx < -0.2;
    this.steerRight = dx > 0.2;
  }

  setBoost(on: boolean): void {
    this.boosting = on && !this.gameOver && !this.isPaused;
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.playerCar && this.playerCar.yOff <= 0.05) {
      this.playerCar.vy = 11.5;
      this.playerCar.airSpin = Math.PI * 2;
      ArcadeAudio.play('jump');
    }
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (!pressed) {
      if (actionKey === 'action' || actionKey === 'boost') this.boosting = false;
      else if (actionKey === 'drift') this.drifting = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    if (actionKey === 'action' || actionKey === 'boost') this.boosting = true;
    else if (actionKey === 'drift') this.drifting = true;
    else if (actionKey === 'jump') this.jump();
  }

  private finishMission(victory: boolean, stars: number): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.isRunning = false;
    if (victory) {
      const reward = this.mapDef.rewardCoins;
      addCoins(reward);
      addXp(55);
      const prev = playerState.asphaltMapStars[this.mapDef.id] ?? 0;
      if (stars > prev) {
        playerState.asphaltMapStars[this.mapDef.id] = stars;
      }
      persistAsphaltGarage();
      ArcadeAudio.play('combo');
    } else {
      ArcadeAudio.play('gameover');
    }
    triggerGameOver(this.score, playerState.sessionCoins, this.level, this.gameIdx, victory);
  }

  private updateSimulation(dt: number): void {
    this.elapsed += dt;
    this.bumpShake = Math.max(0, this.bumpShake - dt * 2.5);
    this.slamBannerTimer = Math.max(0, this.slamBannerTimer - dt);

    if (this.mapDef.missionKind === 'gates' && this.missionClock > 0) {
      this.missionClock -= dt;
      if (this.missionClock <= 0 && this.gatesHit < this.mapDef.targetGates) {
        this.finishMission(false, 0);
        return;
      }
    }

    const p = this.playerCar;
    const btnSteer = (this.steerRight ? 1 : 0) - (this.steerLeft ? 1 : 0);
    const steerDir = Math.abs(this.analogSteer) > 0.12 ? this.analogSteer : btnSteer;
    const laneSpeed = (this.drifting ? this.tuned.steerSpeed * 1.25 : this.tuned.steerSpeed) * dt;
    p.lane = Math.max(-this.laneHalfLimit, Math.min(this.laneHalfLimit, p.lane + steerDir * laneSpeed));

    if (this.drifting && Math.abs(steerDir) > 0) {
      this.nitroEnergy = Math.min(100, this.nitroEnergy + this.tuned.driftCharge * dt);
    }

    const useNitro = this.boosting && this.nitroEnergy > 2;
    if (useNitro) {
      this.nitroEnergy = Math.max(0, this.nitroEnergy - this.tuned.nitroDrain * dt);
      p.flameL.visible = true;
      p.flameR.visible = true;
    } else {
      this.nitroEnergy = Math.min(100, this.nitroEnergy + 7.5 * dt);
      p.flameL.visible = false;
      p.flameR.visible = false;
    }

    const targetSpd = useNitro
      ? this.tuned.nitroSpeed
      : this.drifting
        ? this.tuned.topSpeed * 0.92
        : this.tuned.topSpeed;
    p.speed = THREE.MathUtils.damp(p.speed, targetSpd, this.tuned.accelRate, dt);

    const normS = ((p.s % 1) + 1) % 1;
    for (const pk of this.pickups) {
      if (pk.kind === 'nitro') pk.mesh.rotation.y += dt * 2.5;
      if (pk.cooldown > 0) {
        pk.cooldown = Math.max(0, pk.cooldown - dt);
        pk.mesh.visible = pk.cooldown <= 0 || pk.kind === 'ramp';
        continue;
      }
      const ds = Math.abs(normS - pk.s);
      if ((ds < 0.011 || ds > 0.989) && Math.abs(p.lane - pk.lane) < 2.9 && p.yOff < 2.2) {
        pk.cooldown = 2.0;
        if (pk.kind === 'gate') {
          this.gatesHit++;
          this.nitroEnergy = Math.min(100, this.nitroEnergy + 28);
          this.score += 120;
          addCoins(3);
          ArcadeAudio.play('coin');
          pk.mesh.visible = false;
          this.slamBanner = `🌀 GATE ${this.gatesHit}/${this.mapDef.targetGates}!`;
          this.slamBannerTimer = 1.1;
          if (this.gatesHit >= this.mapDef.targetGates) {
            this.score += 500;
            this.finishMission(true, this.missionClock > 20 ? 3 : 2);
            return;
          }
        } else if (pk.kind === 'nitro') {
          this.nitroEnergy = Math.min(100, this.nitroEnergy + 45);
          this.score += 75;
          addCoins(2);
          ArcadeAudio.play('coin');
          pk.mesh.visible = false;
        } else {
          p.vy = 14.5;
          p.airSpin = Math.PI * 2;
          p.speed = Math.max(p.speed, this.tuned.nitroSpeed);
          this.score += 140;
          addCoins(4);
          ArcadeAudio.play('levelup');
        }
        updateInGameHud(this.score, this.level, this.gameIdx);
      }
    }

    for (const car of this.racers) {
      car.knockTimer = Math.max(0, car.knockTimer - dt);
      if (!car.isPlayer) {
        const aiTarget = car.eliminated
          ? 0
          : car.knockTimer > 0
            ? 24
            : 54 + (Math.sin(car.s * 14) * 4 + (car.lane > 0 ? 1 : -1) * 2.5) * this.scaler.speedMult;
        car.speed = THREE.MathUtils.damp(car.speed, aiTarget, 2.5, dt);
        car.targetLane = Math.sin(car.s * 24 + car.mass * 3) * 6.2;
        car.lane = THREE.MathUtils.damp(car.lane, car.targetLane, 1.4, dt);
        car.flameL.visible = !car.eliminated && car.speed > 60;
        car.flameR.visible = !car.eliminated && car.speed > 60;
      }

      const prevLap = Math.floor(car.s);
      car.s += (car.speed * dt) / this.trackLength;
      const newLap = Math.floor(car.s);
      if (car.isPlayer && newLap > prevLap && newLap <= this.totalLaps) {
        this.score += 350;
        this.level = Math.min(this.totalLaps, newLap + 1);
        addCoins(12);
        addXp(25);
        ArcadeAudio.play('levelup');
        updateInGameHud(this.score, this.level, this.gameIdx);

        if (this.mapDef.missionKind === 'elimination' && newLap === 1 && !this.lap1ElimDone) {
          this.lap1ElimDone = true;
          const sorted = [...this.racers].sort((a, b) => b.s - a.s);
          const pPos = sorted.indexOf(p) + 1;
          if (pPos > 4) {
            this.finishMission(false, 0);
            return;
          }
          sorted[sorted.length - 1].eliminated = true;
          sorted[sorted.length - 2].eliminated = true;
          this.slamBanner = '⚠️ 2 RIVALS ELIMINATED!';
          this.slamBannerTimer = 1.6;
        }
      }

      if (car.yOff > 0 || car.vy !== 0) {
        car.yOff += car.vy * dt;
        car.vy -= 26 * dt;
        if (car.yOff <= 0) {
          car.yOff = 0;
          car.vy = 0;
          car.airSpin = 0;
        }
      }
      if (car.airSpin > 0) {
        car.airSpin = Math.max(0, car.airSpin - dt * 6.5);
      }
    }

    for (let i = 0; i < this.racers.length; i++) {
      for (let j = i + 1; j < this.racers.length; j++) {
        const a = this.racers[i];
        const b = this.racers[j];
        const col = resolveCarCollisionStep(a, b, this.trackLength, this.laneHalfLimit);
        if (col.hit) {
          const involvesPlayer = a.isPlayer || b.isPlayer;
          const rival = a.isPlayer ? b : b.isPlayer ? a : null;
          const midX = (a.group.position.x + b.group.position.x) * 0.5;
          const midY = (a.group.position.y + b.group.position.y) * 0.5;
          const midZ = (a.group.position.z + b.group.position.z) * 0.5;
          this.emitCollisionSparks(midX, midY, midZ);

          if (involvesPlayer && rival && rival.knockTimer <= 0) {
            this.bumpShake = 0.28;
            ArcadeAudio.play('hit');
            if (useNitro || this.carDef.mass >= 1.25 || col.relSpeed > 6.5) {
              rival.knockTimer = 1.6;
              rival.vy = 5.5;
              this.knockdowns++;
              this.score += 140;
              addCoins(5);
              this.slamBanner = `💥 TAKEDOWN #${this.knockdowns}! +140`;
              this.slamBannerTimer = 1.4;
              ArcadeAudio.play('explosion');
              updateInGameHud(this.score, this.level, this.gameIdx);
            }
          }
        }
      }
    }

    for (const car of this.racers) {
      const t = ((car.s % 1) + 1) % 1;
      const tNext = ((car.s + 0.004) % 1 + 1) % 1;
      this.curve.getPointAt(t, _p0);
      this.curve.getPointAt(tNext, _p1);
      _tan.subVectors(_p1, _p0).normalize();
      _right.crossVectors(_tan, _up).normalize();

      car.group.position.set(
        _p0.x + _right.x * car.lane,
        _p0.y + car.yOff,
        _p0.z + _right.z * car.lane
      );
      const yaw = Math.atan2(_tan.x, _tan.z) + (car.isPlayer && this.drifting ? steerDir * 0.24 : 0);
      car.group.rotation.set(0, yaw, car.airSpin);
      for (const w of car.wheels) w.rotation.x += car.speed * dt * 0.65;
    }

    for (const sp of this.sparks) {
      if (sp.life > 0) {
        sp.life -= dt;
        sp.mesh.position.x += sp.vx * dt;
        sp.mesh.position.y += sp.vy * dt;
        sp.mesh.position.z += sp.vz * dt;
        sp.vy -= 18 * dt;
        if (sp.life <= 0) sp.mesh.visible = false;
      }
    }

    let rank = 1;
    for (const c of this.racers) {
      if (!c.isPlayer && c.s > p.s) rank++;
    }
    this.playerRank = rank;

    if (p.s >= this.totalLaps) {
      this.score += (7 - this.playerRank) * 250;
      const koMet = this.mapDef.missionKind !== 'takedown' || this.knockdowns >= this.mapDef.targetKOs;
      const elimMet = this.mapDef.missionKind !== 'elimination' || this.playerRank <= 2;
      const gateMet = this.mapDef.missionKind !== 'gates' || this.gatesHit >= this.mapDef.targetGates;
      const victory = this.playerRank <= 3 && koMet && elimMet && gateMet;
      const stars = !victory ? 0 : this.playerRank === 1 ? 3 : this.playerRank === 2 ? 2 : 1;
      this.finishMission(victory, stars);
      return;
    }

    const t = ((p.s % 1) + 1) % 1;
    this.curve.getPointAt(t, _p0);
    this.curve.getTangentAt(t, _tan).normalize();
    _right.crossVectors(_tan, _up).normalize();

    const targetFov = useNitro ? 78 : 62;
    const nextFov = THREE.MathUtils.damp(this.three.camera.fov, targetFov, 7, dt);
    if (Math.abs(nextFov - this.three.camera.fov) > 0.02) {
      this.three.camera.fov = nextFov;
      this.three.camera.updateProjectionMatrix();
    }

    const shakeX = this.bumpShake > 0 ? (Math.random() - 0.5) * this.bumpShake * 1.4 : 0;
    const shakeY = this.bumpShake > 0 ? (Math.random() - 0.5) * this.bumpShake * 1.1 : 0;
    _camPos.set(
      p.group.position.x - _tan.x * 9.5 + shakeX,
      p.group.position.y + 3.9 + shakeY,
      p.group.position.z - _tan.z * 9.5
    );
    this.three.camera.position.lerp(_camPos, 1 - Math.exp(-12 * dt));
    _camLook.set(
      p.group.position.x + _tan.x * 18,
      p.group.position.y + 1.3,
      p.group.position.z + _tan.z * 18
    );
    this.three.camera.lookAt(_camLook);
  }

  private drawOverlayHud(): void {
    const ctx = this.three.overlayCtx;
    if (!ctx) return;
    const w = this.three.width;
    const h = this.three.height;
    ctx.clearRect(0, 0, w, h);

    if (this.boosting && this.nitroEnergy > 2) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
      ctx.lineWidth = 3;
      const cx = w / 2;
      const cy = h * 0.45;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + this.elapsed * 2;
        const r1 = Math.min(w, h) * 0.34;
        const r2 = Math.max(w, h) * 0.65;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.stroke();
      }
    }

    const compactLandscape = w > h * 1.3 && h < 480;
    const pillY = w < 560 ? 54 : compactLandscape ? 44 : 12;
    const pillW = Math.min(w - (compactLandscape ? 160 : 24), 340);
    const pillH = compactLandscape ? 32 : 38;
    const pillX = w / 2 - pillW / 2;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(pillX + 4, pillY + 4, pillW, pillH, 12);
    ctx.fill();

    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 12);
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.stroke();

    const lapNum = Math.min(this.totalLaps, Math.floor(this.playerCar.s) + 1);
    const kmh = Math.round(this.playerCar.speed * 3.8);
    const extraTag =
      this.mapDef.missionKind === 'takedown'
        ? ` · 💥 ${this.knockdowns}/${this.mapDef.targetKOs} KO`
        : this.mapDef.missionKind === 'gates'
          ? ` · 🌀 ${this.gatesHit}/${this.mapDef.targetGates} (${Math.ceil(this.missionClock)}s)`
          : this.mapDef.missionKind === 'elimination'
            ? ` · ${this.lap1ElimDone ? 'FINAL TOP 2' : 'ELIM CUTOFF'}`
            : '';

    ctx.fillStyle = '#090d16';
    ctx.font = w < 440 || compactLandscape ? '900 10px system-ui, sans-serif' : '900 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${this.mapDef.icon} #${this.playerRank}/6 · LAP ${lapNum}/${this.totalLaps} · ${kmh} KM/H${extraTag}`,
      w / 2,
      pillY + (compactLandscape ? 20 : 24)
    );

    if (this.slamBannerTimer > 0) {
      ctx.fillStyle = '#090d16';
      ctx.font = compactLandscape ? '900 13px system-ui, sans-serif' : '900 16px system-ui, sans-serif';
      ctx.fillText(this.slamBanner, w / 2 + 2, pillY + pillH + 20);
      ctx.fillStyle = '#facc15';
      ctx.fillText(this.slamBanner, w / 2, pillY + pillH + 18);
    }

    const bw = w < 440 || compactLandscape ? Math.min(186, Math.max(114, w - 210)) : 186;
    const gx = w / 2 - bw / 2 - 12;
    const barH = compactLandscape ? 34 : 42;
    const gy = h - (compactLandscape ? 42 : 56);
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(gx + 4, gy + 4, bw + 24, barH, 10);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(gx, gy, bw + 24, barH, 10);
    ctx.fill();
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#090d16';
    ctx.fillRect(w / 2 - bw / 2, gy + 7, bw, compactLandscape ? 9 : 12);
    ctx.fillStyle = this.boosting ? '#38bdf8' : '#facc15';
    ctx.fillRect(w / 2 - bw / 2 + 2, gy + 9, ((bw - 4) * this.nitroEnergy) / 100, compactLandscape ? 5 : 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = compactLandscape ? '900 9.5px system-ui, sans-serif' : '900 10.5px system-ui, sans-serif';
    ctx.fillText(`⚡ ${this.carDef.name.toUpperCase()} NITRO ${Math.round(this.nitroEnergy)}%`, w / 2, gy + (compactLandscape ? 28 : 34));
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
