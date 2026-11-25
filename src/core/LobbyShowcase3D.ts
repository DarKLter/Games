import * as THREE from 'three';
import {
  ASPHALT_CARS,
  BASKETBALL_TEAMS,
  MOBA_HEROES,
  NARUTO_SHINOBI_ROSTER,
  getSkinVariantById
} from './arenaRoster';
import {
  StudioThreeContext,
  buildBasketballPlayerMesh,
  buildBuggyMesh,
  buildMobaHeroMesh,
  buildShinobiMesh,
  buildSoldierMesh,
  buildSupercarMesh
} from './threeShared';

export type LobbyGameKind = 'br' | 'moba' | 'asphalt' | 'hoops' | 'naruto';

export interface LobbyShowcaseConfig {
  kind: LobbyGameKind;
  brMap?: 'erangel' | 'sanhok';
  brCrateReady?: boolean;
  mobaHeroId?: number;
  mobaSkinId?: string;
  asphaltCarId?: number;
  asphaltUpgradeSum?: number;
  hoopsTeamId?: number;
  narutoHeroId?: number;
  narutoSupport1Id?: number;
  narutoSupport2Id?: number;
}

export class LobbyShowcase3D {
  private ctx: StudioThreeContext | null = null;
  private stageRoot = new THREE.Group();
  private subjectGroup: THREE.Group | null = null;
  private auxGroup: THREE.Group | null = null;
  private ringMesh: THREE.Mesh | null = null;
  private currentConfig: LobbyShowcaseConfig | null = null;
  private spinAngle = 0.4;
  private lastTick = 0;

  mount(container: HTMLElement, config: LobbyShowcaseConfig): void {
    this.dispose();
    const skyByKind: Record<LobbyGameKind, { sky: number; fog: number; key: number; hemi: number }> = {
      br: { sky: 0x161c17, fog: 0x1f2820, key: 0xffe4b5, hemi: 0x78716c },
      moba: { sky: 0x091128, fog: 0x101c3f, key: 0xfff5d6, hemi: 0x38bdf8 },
      asphalt: { sky: 0x0b0e17, fog: 0x111827, key: 0xe0f2fe, hemi: 0x22d3ee },
      hoops: { sky: 0x13131b, fog: 0x181826, key: 0xfff7ed, hemi: 0xfacc15 },
      naruto: { sky: 0x12091c, fog: 0x1e112a, key: 0xfff3d6, hemi: 0xf97316 }
    };
    const palette = skyByKind[config.kind];
    this.ctx = new StudioThreeContext(container, {
      skyColor: palette.sky,
      fogColor: palette.fog,
      fogNear: 12,
      fogFar: 48,
      keyColor: palette.key,
      keyIntensity: 2.1,
      hemiSky: palette.hemi,
      hemiGround: 0x111827,
      hemiIntensity: 0.9,
      fov: 40,
      far: 90,
      withOverlayCanvas: false,
      useContainerSize: true
    });
    this.ctx.camera.position.set(0, 2.3, 7.2);
    this.ctx.camera.lookAt(0, 1.0, 0);

    // Base showroom floor + rim pedestal
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 36),
      new THREE.MeshStandardMaterial({
        color: config.kind === 'br' ? 0x292f26 : config.kind === 'naruto' ? 0x1c1426 : 0x111827,
        roughness: 0.55,
        metalness: 0.25
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.6, 0.26, 36),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.72
      })
    );
    pedestal.position.y = 0.13;
    pedestal.receiveShadow = true;

    const accent =
      config.kind === 'br'
        ? 0xf59e0b
        : config.kind === 'moba'
          ? 0xfacc15
          : config.kind === 'asphalt'
            ? 0x06b6d4
            : config.kind === 'naruto'
              ? 0xf97316
              : 0xfacc15;
    this.ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(2.34, 0.045, 8, 48),
      new THREE.MeshBasicMaterial({ color: accent })
    );
    this.ringMesh.rotation.x = Math.PI / 2;
    this.ringMesh.position.y = 0.27;

    this.stageRoot = new THREE.Group();
    this.ctx.scene.add(floor, pedestal, this.ringMesh, this.stageRoot);

    this.update(config);
    this.ctx.prewarm();
    this.lastTick = performance.now();
    this.loop();
  }

  update(config: LobbyShowcaseConfig): void {
    if (!this.ctx || this.ctx.disposed) return;
    this.currentConfig = { ...config };

    // Remove and dispose previous subject & aux meshes cleanly
    while (this.stageRoot.children.length > 0) {
      const child = this.stageRoot.children[0];
      this.stageRoot.remove(child);
      child.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry && !mesh.geometry.userData?.noDispose) mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        for (const m of mats) {
          if (m && !m.userData?.noDispose) m.dispose();
        }
      });
    }
    this.subjectGroup = new THREE.Group();
    this.subjectGroup.rotation.y = this.spinAngle;
    this.auxGroup = new THREE.Group();
    this.auxGroup.rotation.y = -this.spinAngle * 0.7;
    this.stageRoot.add(this.subjectGroup, this.auxGroup);

    if (config.kind === 'br') {
      const soldier = buildSoldierMesh(
        config.brMap === 'sanhok' ? 0x365314 : 0x57534e,
        config.brCrateReady ? 0xf59e0b : 0x3f6212,
        0x38bdf8,
        1.15,
        false
      );
      soldier.group.position.set(-0.65, 0.26, 0.35);
      soldier.group.rotation.y = 0.35;
      this.subjectGroup.add(soldier.group);

      const buggy = buildBuggyMesh(config.brMap === 'sanhok' ? 0x365314 : 0x78716c);
      buggy.group.scale.setScalar(0.68);
      buggy.group.position.set(1.2, 0.26, -0.5);
      buggy.group.rotation.y = -0.6;
      this.subjectGroup.add(buggy.group);

      // Circling miniature C-130 plane silhouette overhead
      const plane = new THREE.Group();
      const fuse = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.28, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.45, metalness: 0.5 })
      );
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.06, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.45, metalness: 0.5 })
      );
      plane.add(fuse, wing);
      plane.position.set(0, 2.75, -2.5);
      this.auxGroup.add(plane);

      this.ctx.camera.position.set(0, 2.25, 6.8);
      this.ctx.camera.lookAt(0, 1.15, 0);
    } else if (config.kind === 'moba') {
      const hero = MOBA_HEROES[config.mobaHeroId ?? 0] ?? MOBA_HEROES[0];
      const skin = getSkinVariantById(config.mobaSkinId);
      const bodyCol = skin.bodyShift ?? hero.bodyColor;
      const cloakCol = skin.cloakShift ?? hero.cloakColor;
      const bladeCol = skin.bladeShift ?? hero.bladeColor;
      const mesh = buildMobaHeroMesh(bodyCol, cloakCol, bladeCol, 1.28, hero.weapon, false);
      mesh.position.set(0, 0.26, 0);
      this.subjectGroup.add(mesh);

      if (this.ringMesh) {
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(bladeCol);
      }

      // Floating arena crystals
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + 0.4;
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.24, 0),
          new THREE.MeshStandardMaterial({
            color: bladeCol,
            emissive: bladeCol,
            emissiveIntensity: 0.7,
            roughness: 0.2
          })
        );
        crystal.position.set(Math.cos(ang) * 2.8, 1.2 + (i % 2) * 0.4, Math.sin(ang) * 2.2 - 1.2);
        this.auxGroup.add(crystal);
      }

      this.ctx.camera.position.set(0, 2.15, 6.0);
      this.ctx.camera.lookAt(0, 1.3, 0);
    } else if (config.kind === 'asphalt') {
      const car = ASPHALT_CARS[config.asphaltCarId ?? 0] ?? ASPHALT_CARS[0];
      const { group, flameL, flameR } = buildSupercarMesh(
        car.paintColor,
        car.stripeColor,
        this.ctx.isSoftwareGl,
        car.style,
        false
      );
      group.scale.setScalar(1.02);
      group.position.set(0, 0.26, 0);
      flameL.visible = (config.asphaltUpgradeSum ?? 4) >= 8;
      flameR.visible = (config.asphaltUpgradeSum ?? 4) >= 8;
      this.subjectGroup.add(group);

      if (this.ringMesh) {
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(car.paintColor);
      }
      this.ctx.camera.position.set(0.3, 2.05, 6.6);
      this.ctx.camera.lookAt(0, 0.72, 0);
    } else if (config.kind === 'hoops') {
      const team = BASKETBALL_TEAMS[config.hoopsTeamId ?? 0] ?? BASKETBALL_TEAMS[0];
      const player = buildBasketballPlayerMesh(team.jerseyColor, team.trimColor, 0x8d5524, true, 1.25, true);
      player.group.position.set(-0.25, 0.26, 0);
      player.armR.rotation.x = -0.6;
      this.subjectGroup.add(player.group);

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 16, 16),
        new THREE.MeshToonMaterial({ color: 0xf97316 })
      );
      ball.position.set(0.75, 1.45, 0.35);
      this.auxGroup.add(ball);

      if (this.ringMesh) {
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(team.trimColor);
      }
      this.ctx.camera.position.set(0, 2.15, 5.9);
      this.ctx.camera.lookAt(0, 1.25, 0);
    } else if (config.kind === 'naruto') {
      const hero = NARUTO_SHINOBI_ROSTER[config.narutoHeroId ?? 0] ?? NARUTO_SHINOBI_ROSTER[0];
      const mainShinobi = buildShinobiMesh(hero, 1.26, false);
      mainShinobi.group.position.set(0, 0.26, 0.28);
      this.subjectGroup.add(mainShinobi.group);

      if (config.narutoSupport1Id !== undefined) {
        const sup1 = NARUTO_SHINOBI_ROSTER[config.narutoSupport1Id] ?? NARUTO_SHINOBI_ROSTER[1];
        if (sup1.id !== hero.id) {
          const s1Mesh = buildShinobiMesh(sup1, 0.94, false);
          s1Mesh.group.position.set(-1.35, 0.26, -0.65);
          s1Mesh.group.rotation.y = 0.28;
          this.subjectGroup.add(s1Mesh.group);
        }
      }
      if (config.narutoSupport2Id !== undefined) {
        const sup2 = NARUTO_SHINOBI_ROSTER[config.narutoSupport2Id] ?? NARUTO_SHINOBI_ROSTER[2];
        if (sup2.id !== hero.id && sup2.id !== config.narutoSupport1Id) {
          const s2Mesh = buildShinobiMesh(sup2, 0.94, false);
          s2Mesh.group.position.set(1.35, 0.26, -0.65);
          s2Mesh.group.rotation.y = -0.28;
          this.subjectGroup.add(s2Mesh.group);
        }
      }

      if (this.ringMesh) {
        (this.ringMesh.material as THREE.MeshBasicMaterial).color.setHex(hero.chakraColor);
      }

      // Orbiting elemental chakra orbs & kunai
      for (let i = 0; i < 5; i++) {
        const ang = (i * Math.PI * 2) / 5;
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 12, 12),
          new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? hero.chakraColor : hero.accentColor,
            transparent: true,
            opacity: 0.88
          })
        );
        orb.position.set(Math.cos(ang) * 2.55, 1.15 + (i % 2) * 0.45, Math.sin(ang) * 2.2 - 0.5);
        this.auxGroup.add(orb);
      }

      this.ctx.camera.position.set(0, 2.2, 6.2);
      this.ctx.camera.lookAt(0, 1.25, 0);
    }
    this.ctx.render();
  }

  resize(): void {
    this.ctx?.resize();
  }

  private loop = (): void => {
    if (!this.ctx || this.ctx.disposed) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTick) / 1000);
    this.lastTick = now;

    this.spinAngle += dt * (this.currentConfig?.kind === 'asphalt' ? 0.55 : 0.42);
    if (this.subjectGroup) {
      this.subjectGroup.rotation.y = this.spinAngle;
    }
    if (this.auxGroup) {
      this.auxGroup.rotation.y = -this.spinAngle * 0.7;
      for (const child of this.auxGroup.children) {
        child.rotation.y += dt * 1.4;
      }
    }

    this.ctx.render();
    this.ctx.scheduleNextFrame(this.loop);
  };

  dispose(): void {
    if (this.ctx) {
      this.ctx.dispose();
      this.ctx = null;
    }
    this.subjectGroup = null;
    this.auxGroup = null;
    this.ringMesh = null;
  }
}
