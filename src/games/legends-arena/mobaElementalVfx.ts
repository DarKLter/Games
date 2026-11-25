import * as THREE from 'three';
import {
  MOBA_ELEMENT_PALETTES,
  MobaElementStatusKind,
  MobaElementTheme,
  MobaVfxKind
} from '../../core/arenaRoster';

export type ElementalFxAnimKind =
  | 'fire_burst'
  | 'ice_burst'
  | 'lightning_strike'
  | 'wind_vortex'
  | 'water_surge'
  | 'shadow_burst'
  | 'nature_bloom'
  | 'celestial_burst'
  | 'earth_quake'
  | 'blood_slash'
  | 'steel_burst'
  | 'beam'
  | 'slash'
  | 'dome';

function makeBasicMat(color: number, opacity = 0.85, doubleSide = false): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 0.99,
    opacity,
    side: doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: opacity >= 0.95
  });
}

function makeGroundMat(color: number, opacity: number, polyFactor = -2): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: polyFactor
  });
}

/**
 * Builds a stylized 3D elemental projectile oriented along +Z (forward).
 */
export function createElementalProjectileMesh(theme: MobaElementTheme, scale = 1.0): THREE.Group {
  const pal = MOBA_ELEMENT_PALETTES[theme];
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  switch (theme) {
    case 'fire': {
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.44, 10, 8), makeBasicMat(pal.core, 0.96));
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 10, 8), makeBasicMat(pal.primary, 0.78));
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.54, 1.85, 8), makeBasicMat(pal.secondary, 0.72));
      tail.rotation.x = -Math.PI / 2;
      tail.position.z = -1.0;
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.08, 6, 14), makeBasicMat(pal.primary, 0.7));
      g.add(core, shell, tail, halo);
      break;
    }
    case 'ice': {
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.42, 2.2, 6), makeBasicMat(pal.primary, 0.82));
      shard.rotation.x = Math.PI / 2;
      shard.position.z = 0.25;
      const back = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.05, 6), makeBasicMat(pal.secondary, 0.78));
      back.rotation.x = -Math.PI / 2;
      back.position.z = -0.8;
      const crystalCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), makeBasicMat(pal.core, 0.95));
      g.add(shard, back, crystalCore);
      break;
    }
    case 'lightning': {
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), makeBasicMat(pal.core, 0.98));
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.07, 6, 14), makeBasicMat(pal.primary, 0.85));
      ringA.rotation.x = Math.PI / 3;
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.07, 6, 14), makeBasicMat(pal.secondary, 0.85));
      ringB.rotation.y = Math.PI / 3;
      const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.24, 1.6, 6), makeBasicMat(pal.secondary, 0.78));
      tail.rotation.x = Math.PI / 2;
      tail.position.z = -0.9;
      g.add(core, ringA, ringB, tail);
      break;
    }
    case 'wind': {
      const crescent = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.14, 6, 14, Math.PI * 1.15),
        makeBasicMat(pal.primary, 0.86)
      );
      crescent.rotation.x = Math.PI / 2;
      crescent.rotation.z = -Math.PI * 0.08;
      const inner = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.08, 6, 12, Math.PI),
        makeBasicMat(pal.core, 0.92)
      );
      inner.rotation.x = Math.PI / 2;
      g.add(crescent, inner);
      break;
    }
    case 'water': {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.52, 10, 8), makeBasicMat(pal.primary, 0.82));
      const crest = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.12, 6, 14, Math.PI * 1.25),
        makeBasicMat(pal.secondary, 0.84)
      );
      crest.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), makeBasicMat(pal.core, 0.95));
      g.add(orb, crest, core);
      break;
    }
    case 'shadow': {
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.38, 2.0, 4), makeBasicMat(pal.primary, 0.9));
      blade.rotation.x = Math.PI / 2;
      blade.position.z = 0.2;
      const aura = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 6, 12), makeBasicMat(pal.secondary, 0.8));
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), makeBasicMat(pal.core, 0.9));
      g.add(blade, aura, core);
      break;
    }
    case 'nature': {
      const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.34, 1.9, 6), makeBasicMat(pal.primary, 0.92));
      thorn.rotation.x = Math.PI / 2;
      const leafL = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.35), makeBasicMat(pal.secondary, 0.85));
      leafL.position.set(-0.35, 0, -0.35);
      leafL.rotation.y = 0.45;
      const leafR = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.35), makeBasicMat(pal.secondary, 0.85));
      leafR.position.set(0.35, 0, -0.35);
      leafR.rotation.y = -0.45;
      g.add(thorn, leafL, leafR);
      break;
    }
    case 'celestial': {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), makeBasicMat(pal.core, 0.98));
      const lance = new THREE.Mesh(new THREE.ConeGeometry(0.26, 2.1, 6), makeBasicMat(pal.primary, 0.88));
      lance.rotation.x = Math.PI / 2;
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.07, 6, 16), makeBasicMat(pal.secondary, 0.82));
      g.add(star, lance, halo);
      break;
    }
    case 'earth': {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.56, 0), makeBasicMat(pal.primary, 0.96));
      const crack = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.08, 5, 10), makeBasicMat(pal.secondary, 0.82));
      g.add(rock, crack);
      break;
    }
    case 'blood': {
      const scythe = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.14, 6, 14, Math.PI * 1.15),
        makeBasicMat(pal.primary, 0.92)
      );
      scythe.rotation.x = Math.PI / 2;
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), makeBasicMat(pal.core, 0.9));
      g.add(scythe, core);
      break;
    }
    default: {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.75, 8), makeBasicMat(pal.primary, 0.94));
      bolt.rotation.x = Math.PI / 2;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 8), makeBasicMat(pal.secondary, 0.96));
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 1.05;
      g.add(bolt, tip);
      break;
    }
  }
  return g;
}

/**
 * Builds composite multi-part 3D elemental VFX for skill casts and impacts.
 */
export function createElementalImpactVfx(
  theme: MobaElementTheme,
  kind: MobaVfxKind | 'dome',
  size: number,
  yaw: number
): { group: THREE.Group; duration: number; animKind: ElementalFxAnimKind } {
  const pal = MOBA_ELEMENT_PALETTES[theme];
  const g = new THREE.Group();
  const safeSize = Math.max(2.2, Math.min(26, size));

  // Directional Beam or Hook Chain
  if (kind === 'beam' || kind === 'hook_chain') {
    const len = Math.max(6, safeSize);
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.82, len, 10, 1, true),
      makeBasicMat(pal.primary, 0.62, true)
    );
    outer.position.set(0, 1.5, len * 0.5);
    outer.rotation.x = Math.PI / 2;

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.34, len, 8),
      makeBasicMat(pal.core, 0.95)
    );
    core.position.set(0, 1.5, len * 0.5);
    core.rotation.x = Math.PI / 2;

    const muzzle = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 1.65, 16),
      makeBasicMat(pal.secondary, 0.82, true)
    );
    muzzle.position.set(0, 1.5, 0.7);
    g.add(outer, core, muzzle);

    // Add elemental accents along the beam (rings or jagged segments)
    const accentCount = 3;
    for (let i = 1; i <= accentCount; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.08, 6, 14),
        makeBasicMat(pal.secondary, 0.78)
      );
      ring.position.set(0, 1.5, (len / (accentCount + 1)) * i);
      g.add(ring);
    }

    g.rotation.y = yaw;
    return { group: g, duration: 0.42, animKind: 'beam' };
  }

  // Sweeping Elemental Slash Arc
  if (kind === 'slash_arc') {
    const rad = Math.max(3.4, safeSize * 0.72);
    const arcOuter = new THREE.Mesh(
      new THREE.RingGeometry(rad * 0.58, rad, 22, 1, -Math.PI * 0.58, Math.PI * 1.16),
      makeGroundMat(pal.primary, 0.86, -3)
    );
    arcOuter.rotation.x = -Math.PI / 2;
    arcOuter.rotation.z = Math.PI / 2;
    arcOuter.position.y = 1.35;

    const arcInner = new THREE.Mesh(
      new THREE.RingGeometry(rad * 0.78, rad * 0.94, 20, 1, -Math.PI * 0.5, Math.PI),
      makeGroundMat(pal.core, 0.92, -4)
    );
    arcInner.rotation.x = -Math.PI / 2;
    arcInner.rotation.z = Math.PI / 2;
    arcInner.position.y = 1.42;

    const groundWave = new THREE.Mesh(
      new THREE.RingGeometry(rad * 0.35, rad * 0.92, 24),
      makeGroundMat(pal.secondary, 0.45, -2)
    );
    groundWave.rotation.x = -Math.PI / 2;
    groundWave.position.y = 0.16;

    g.add(arcOuter, arcInner, groundWave);
    g.rotation.y = yaw;
    return { group: g, duration: 0.36, animKind: 'slash' };
  }

  // Protective / Buff Elemental Dome
  if (kind === 'dome' || kind === 'shield_dome' || kind === 'transform_giant' || kind === 'stealth_mist') {
    const r = Math.max(2.4, safeSize * 0.45);
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(r, 14, 12),
      new THREE.MeshBasicMaterial({
        color: pal.primary,
        transparent: true,
        opacity: 0.28,
        wireframe: true
      })
    );
    shell.position.y = 1.7;
    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(r * 0.72, r * 1.15, 28),
      makeGroundMat(pal.secondary, 0.76, -2)
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.18;
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.95, 0.12, 8, 24),
      makeBasicMat(pal.core, 0.75)
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 1.8;
    g.add(shell, baseRing, halo);
    return { group: g, duration: 0.55, animKind: 'dome' };
  }

  // Element-specific signature composite 3D bursts & eruptions
  const r = Math.max(3.2, safeSize * 0.76);
  const groundRing = new THREE.Mesh(
    new THREE.RingGeometry(r * 0.55, r, 28),
    makeGroundMat(pal.primary, 0.76, -2)
  );
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.y = 0.16;
  const groundFill = new THREE.Mesh(
    new THREE.CircleGeometry(r * 0.88, 24),
    makeGroundMat(pal.secondary, 0.24, -1)
  );
  groundFill.rotation.x = -Math.PI / 2;
  groundFill.position.y = 0.14;
  g.add(groundRing, groundFill);

  switch (theme) {
    case 'fire': {
      // Valir / X.Borg / Thamuz: Blazing central inferno cone + 6 roaring flame pillars + floating ember orbs
      const centerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(r * 0.34, 5.4, 8),
        makeBasicMat(pal.core, 0.85)
      );
      centerFlame.position.y = 2.7;
      g.add(centerFlame);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const dist = r * 0.56;
        const h = 3.2 + (i % 2) * 1.4;
        const tongue = new THREE.Mesh(
          new THREE.ConeGeometry(r * 0.18, h, 7),
          makeBasicMat(i % 2 === 0 ? pal.primary : pal.secondary, 0.82)
        );
        tongue.position.set(Math.cos(ang) * dist, h * 0.5, Math.sin(ang) * dist);
        tongue.rotation.z = -Math.cos(ang) * 0.18;
        tongue.rotation.x = Math.sin(ang) * 0.18;
        g.add(tongue);
      }
      const scorchRing = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.68, 0.22, 6, 20),
        makeBasicMat(pal.primary, 0.78)
      );
      scorchRing.rotation.x = Math.PI / 2;
      scorchRing.position.y = 0.85;
      g.add(scorchRing);
      return { group: g, duration: 0.62, animKind: 'fire_burst' };
    }

    case 'ice': {
      // Aurora / Atlas / Freya: Jagged translucent glacier crystal cluster + frost star rays
      const centralSpire = new THREE.Mesh(
        new THREE.ConeGeometry(r * 0.28, 6.2, 5),
        makeBasicMat(pal.core, 0.82)
      );
      centralSpire.position.y = 3.1;
      g.add(centralSpire);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const dist = r * 0.52;
        const shard = new THREE.Mesh(
          new THREE.ConeGeometry(r * 0.19, 3.8 + (i % 2) * 1.1, 5),
          makeBasicMat(i % 2 === 0 ? pal.primary : pal.secondary, 0.78)
        );
        shard.position.set(Math.cos(ang) * dist, 1.85, Math.sin(ang) * dist);
        shard.rotation.z = -Math.cos(ang) * 0.36;
        shard.rotation.x = Math.sin(ang) * 0.36;
        g.add(shard);
      }
      // 6-point snowflake star on ground
      for (let i = 0; i < 3; i++) {
        const bar = new THREE.Mesh(
          new THREE.PlaneGeometry(r * 1.85, 0.32),
          makeGroundMat(pal.core, 0.78, -3)
        );
        bar.rotation.x = -Math.PI / 2;
        bar.rotation.z = (i * Math.PI) / 3;
        bar.position.y = 0.2;
        g.add(bar);
      }
      return { group: g, duration: 0.68, animKind: 'ice_burst' };
    }

    case 'lightning': {
      // Eudora / Kaja / Joy / Johnson: Jagged multi-segment sky thunderbolt + ionized spark rings
      const segs = [
        { x: 0.55, y: 12.5, z: -0.35, h: 5.5, rx: 0.16, rz: -0.22 },
        { x: -0.45, y: 7.5, z: 0.4, h: 5.2, rx: -0.2, rz: 0.24 },
        { x: 0.15, y: 2.6, z: -0.1, h: 5.2, rx: 0.12, rz: -0.14 }
      ];
      for (const s of segs) {
        const outer = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.44, s.h, 6),
          makeBasicMat(pal.primary, 0.82)
        );
        outer.position.set(s.x, s.y, s.z);
        outer.rotation.set(s.rx, 0, s.rz);
        const core = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.18, s.h, 6),
          makeBasicMat(pal.secondary, 0.98)
        );
        core.position.set(s.x, s.y, s.z);
        core.rotation.set(s.rx, 0, s.rz);
        g.add(outer, core);
      }
      const arcRing = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.62, 0.14, 6, 18),
        makeBasicMat(pal.secondary, 0.9)
      );
      arcRing.rotation.x = Math.PI / 2;
      arcRing.position.y = 1.4;
      g.add(arcRing);
      return { group: g, duration: 0.5, animKind: 'lightning_strike' };
    }

    case 'wind': {
      // Vale / Ling / Zilong: Ascending helical cyclone rings + spinning wind blades
      for (let i = 0; i < 4; i++) {
        const t = i / 3;
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(r * (0.36 + t * 0.45), 0.14, 6, 20),
          makeBasicMat(i % 2 === 0 ? pal.primary : pal.secondary, 0.8)
        );
        ring.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.16 : -0.16);
        ring.position.y = 0.75 + i * 1.45;
        g.add(ring);
      }
      return { group: g, duration: 0.6, animKind: 'wind_vortex' };
    }

    case 'water': {
      // Kadita / Bane / Odette: Tidal surge crest rings + rising aqua splash columns
      const waveWall = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.82, r * 0.95, 2.4, 20, 1, true),
        makeBasicMat(pal.primary, 0.52, true)
      );
      waveWall.position.y = 1.2;
      const foam = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.84, 0.2, 6, 22),
        makeBasicMat(pal.core, 0.85)
      );
      foam.rotation.x = Math.PI / 2;
      foam.position.y = 2.35;
      g.add(waveWall, foam);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const drop = new THREE.Mesh(
          new THREE.SphereGeometry(0.42, 8, 6),
          makeBasicMat(pal.secondary, 0.85)
        );
        drop.position.set(Math.cos(ang) * r * 0.55, 2.6 + (i % 2) * 0.9, Math.sin(ang) * r * 0.55);
        g.add(drop);
      }
      return { group: g, duration: 0.62, animKind: 'water_surge' };
    }

    case 'shadow': {
      // Hayabusa / Kagura / Selena / Vexana: Dark-violet abyssal vortex + crimson-edged shadow blades
      const voidPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.25, r * 0.68, 5.2, 12, 1, true),
        makeBasicMat(pal.primary, 0.56, true)
      );
      voidPillar.position.y = 2.6;
      g.add(voidPillar);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const slash = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 3.8, r * 0.9),
          makeBasicMat(i % 2 === 0 ? pal.secondary : pal.primary, 0.84)
        );
        slash.position.set(Math.cos(ang) * r * 0.32, 2.0, Math.sin(ang) * r * 0.32);
        slash.rotation.y = ang + 0.6;
        slash.rotation.z = 0.28;
        g.add(slash);
      }
      return { group: g, duration: 0.58, animKind: 'shadow_burst' };
    }

    case 'nature': {
      // Belerick / Estes / Floryn: Erupting emerald thorn spires + glowing blossom canopy
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const vine = new THREE.Mesh(
          new THREE.ConeGeometry(0.36, 4.2, 5),
          makeBasicMat(i % 2 === 0 ? pal.primary : pal.secondary, 0.88)
        );
        vine.position.set(Math.cos(ang) * r * 0.58, 1.9, Math.sin(ang) * r * 0.58);
        vine.rotation.z = Math.cos(ang) * 0.32;
        vine.rotation.x = -Math.sin(ang) * 0.32;
        g.add(vine);
      }
      const bloom = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.5, 0.16, 6, 16),
        makeBasicMat(pal.core, 0.82)
      );
      bloom.rotation.x = Math.PI / 2;
      bloom.position.y = 1.6;
      g.add(bloom);
      return { group: g, duration: 0.64, animKind: 'nature_bloom' };
    }

    case 'celestial': {
      // Rafaela / Miya / Lunox / Yve / Xavier: Radiant sky pillar + golden starlight halo
      const skyBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.36, r * 0.56, 13, 14, 1, true),
        makeBasicMat(pal.primary, 0.48, true)
      );
      skyBeam.position.y = 6.5;
      const innerBeam = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.14, r * 0.24, 13, 10),
        makeBasicMat(pal.core, 0.85)
      );
      innerBeam.position.y = 6.5;
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.72, 0.15, 6, 22),
        makeBasicMat(pal.secondary, 0.85)
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 2.2;
      g.add(skyBeam, innerBeam, halo);
      return { group: g, duration: 0.6, animKind: 'celestial_burst' };
    }

    case 'earth': {
      // Grock / Khufra / Minotaur / Gatotkaca: Jutting seismic stone monoliths + shockwave ring
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const spike = new THREE.Mesh(
          new THREE.DodecahedronGeometry(r * 0.24, 0),
          makeBasicMat(i % 2 === 0 ? pal.primary : pal.secondary, 0.94)
        );
        spike.scale.set(0.85, 2.2, 0.85);
        spike.position.set(Math.cos(ang) * r * 0.55, 1.45, Math.sin(ang) * r * 0.55);
        spike.rotation.set(Math.sin(ang) * 0.35, ang, -Math.cos(ang) * 0.35);
        g.add(spike);
      }
      return { group: g, duration: 0.64, animKind: 'earth_quake' };
    }

    case 'blood': {
      // Alice / Ruby / Alucard / Balmond / Yu Zhong: Spinning crimson scythe halo + siphon tendrils
      const scythe = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.74, 0.22, 6, 20, Math.PI * 1.45),
        makeBasicMat(pal.primary, 0.9)
      );
      scythe.rotation.x = Math.PI / 2;
      scythe.position.y = 1.5;
      const inner = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.45, 0.12, 6, 16),
        makeBasicMat(pal.core, 0.82)
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.y = 1.65;
      g.add(scythe, inner);
      return { group: g, duration: 0.56, animKind: 'blood_slash' };
    }

    default: {
      // Steel / Ballistic: Kinetic shockwave rings + metallic sparks
      const shock = new THREE.Mesh(
        new THREE.TorusGeometry(r * 0.65, 0.16, 6, 20),
        makeBasicMat(pal.secondary, 0.88)
      );
      shock.rotation.x = Math.PI / 2;
      shock.position.y = 1.2;
      g.add(shock);
      return { group: g, duration: 0.45, animKind: 'steel_burst' };
    }
  }
}

/**
 * Animates composite elemental 3D VFX with zero heap allocations.
 */
export function animateElementalVfx(
  group: THREE.Group,
  animKind: ElementalFxAnimKind,
  progress: number,
  dt: number
): void {
  const p = Math.max(0, Math.min(1, progress));
  const fade = Math.max(0.02, 1 - p * p);

  if (animKind === 'fire_burst') {
    const s = 0.75 + p * 0.75;
    group.scale.set(s, 0.85 + Math.sin(p * Math.PI) * 0.75, s);
    group.rotation.y += dt * 3.8;
  } else if (animKind === 'ice_burst') {
    const pop = Math.min(1, p * 4.5);
    group.scale.set(0.8 + pop * 0.35, 0.25 + pop * 0.95, 0.8 + pop * 0.35);
    group.rotation.y += dt * 0.8;
  } else if (animKind === 'lightning_strike') {
    group.rotation.y += dt * 16;
    const s = 0.9 + p * 0.45;
    group.scale.set(s, 1, s);
  } else if (animKind === 'wind_vortex') {
    group.rotation.y += dt * 11;
    const s = 0.8 + p * 0.55;
    group.scale.set(s, 0.9 + p * 0.5, s);
  } else if (animKind === 'water_surge') {
    const s = 0.72 + p * 0.78;
    group.scale.set(s, 1.15 - p * 0.4, s);
    group.rotation.y -= dt * 3.2;
  } else if (animKind === 'shadow_burst' || animKind === 'blood_slash') {
    group.rotation.y += dt * 8.5;
    const s = 0.82 + p * 0.55;
    group.scale.set(s, 1, s);
  } else if (animKind === 'nature_bloom' || animKind === 'earth_quake') {
    const pop = Math.min(1, p * 4.2);
    group.scale.set(0.85 + pop * 0.3, 0.2 + pop * 0.95, 0.85 + pop * 0.3);
  } else if (animKind === 'celestial_burst') {
    group.rotation.y += dt * 4.2;
    const s = 0.85 + p * 0.45;
    group.scale.set(s, 1.0, s);
  } else if (animKind === 'slash') {
    group.rotation.y += dt * 4.5;
    group.scale.setScalar(0.9 + p * 0.32);
  } else if (animKind === 'beam') {
    const widthScale = Math.max(0.25, 1.15 - p * 0.85);
    group.scale.set(widthScale, widthScale, 1);
  } else if (animKind === 'dome') {
    group.rotation.y += dt * 3.0;
    group.scale.setScalar(0.92 + p * 0.35);
  } else {
    group.scale.setScalar(0.82 + p * 0.65);
  }

  group.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshBasicMaterial;
    if (mat && mat.transparent) {
      if (mat.userData.baseOpacity === undefined) {
        mat.userData.baseOpacity = mat.opacity;
      }
      mat.opacity = (mat.userData.baseOpacity as number) * fade;
    }
  });
}

/**
 * Builds persistent 3D visual status effect overlays attached to hit enemies.
 */
export function createElementalStatusMesh(statusKind: MobaElementStatusKind): THREE.Group {
  const g = new THREE.Group();
  g.userData.statusKind = statusKind;

  switch (statusKind) {
    case 'burn': {
      // Flickering flame tongues + molten ground ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.9, 1.38, 18),
        makeGroundMat(0xff5a1f, 0.78, -3)
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.16;
      g.add(ring);
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.32, 1.45, 6),
          makeBasicMat(i === 0 ? 0xfacc15 : 0xff5a1f, 0.86)
        );
        flame.position.set(Math.cos(ang) * 0.68, 1.1 + (i % 2) * 0.45, Math.sin(ang) * 0.68);
        g.add(flame);
      }
      break;
    }
    case 'freeze': {
      // Translucent ice crystal block encasing target + frost shards
      const iceBlock = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.48, 0),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.44,
          depthWrite: false
        })
      );
      iceBlock.scale.set(0.95, 1.55, 0.95);
      iceBlock.position.y = 1.65;
      const wire = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.52, 0),
        new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0.72,
          wireframe: true
        })
      );
      wire.scale.set(0.95, 1.55, 0.95);
      wire.position.y = 1.65;
      const frostRing = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 1.68, 6),
        makeGroundMat(0xa5f3fc, 0.84, -3)
      );
      frostRing.rotation.x = -Math.PI / 2;
      frostRing.position.y = 0.16;
      g.add(iceBlock, wire, frostRing);
      break;
    }
    case 'shock': {
      const arcA = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.08, 6, 14),
        makeBasicMat(0xfde047, 0.92)
      );
      arcA.position.y = 1.5;
      arcA.rotation.x = 0.9;
      const arcB = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.08, 6, 14),
        makeBasicMat(0x60a5fa, 0.92)
      );
      arcB.position.y = 1.85;
      arcB.rotation.z = 1.1;
      g.add(arcA, arcB);
      break;
    }
    case 'vine': {
      for (let i = 0; i < 2; i++) {
        const coil = new THREE.Mesh(
          new THREE.TorusGeometry(1.02, 0.12, 6, 14),
          makeBasicMat(i === 0 ? 0x22c55e : 0xa3e635, 0.9)
        );
        coil.rotation.x = Math.PI / 2 + (i === 0 ? 0.25 : -0.25);
        coil.position.y = 0.65 + i * 0.65;
        g.add(coil);
      }
      break;
    }
    case 'curse': {
      const hex = new THREE.Mesh(
        new THREE.RingGeometry(1.05, 1.55, 6),
        makeGroundMat(0x9333ea, 0.88, -3)
      );
      hex.rotation.x = -Math.PI / 2;
      hex.position.y = 0.18;
      const crown = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.09, 6, 12),
        makeBasicMat(0xf43f5e, 0.88)
      );
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 2.65;
      g.add(hex, crown);
      break;
    }
    case 'bleed': {
      const pool = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 1.4, 16),
        makeGroundMat(0xe11d48, 0.84, -3)
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.y = 0.16;
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), makeBasicMat(0xf43f5e, 0.92));
      orb.position.set(0.85, 1.9, 0);
      g.add(pool, orb);
      break;
    }
    case 'soak': {
      const ripple = new THREE.Mesh(
        new THREE.RingGeometry(1.0, 1.52, 20),
        makeGroundMat(0x0ea5e9, 0.8, -3)
      );
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.y = 0.16;
      const crest = new THREE.Mesh(
        new THREE.TorusGeometry(0.98, 0.08, 6, 16),
        makeBasicMat(0x67e8f9, 0.82)
      );
      crest.rotation.x = Math.PI / 2;
      crest.position.y = 1.25;
      g.add(ripple, crest);
      break;
    }
    case 'gust': {
      const windA = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.08, 6, 16),
        makeBasicMat(0x2dd4bf, 0.84)
      );
      windA.rotation.x = Math.PI / 2 + 0.2;
      windA.position.y = 1.2;
      g.add(windA);
      break;
    }
    case 'radiant': {
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.09, 6, 16),
        makeBasicMat(0xfacc15, 0.92)
      );
      halo.rotation.x = Math.PI / 2;
      halo.position.y = 2.95;
      g.add(halo);
      break;
    }
    case 'crush': {
      const crack = new THREE.Mesh(
        new THREE.RingGeometry(0.95, 1.5, 8),
        makeGroundMat(0xd97706, 0.84, -3)
      );
      crack.rotation.x = -Math.PI / 2;
      crack.position.y = 0.16;
      g.add(crack);
      break;
    }
    default:
      break;
  }

  return g;
}

export function animateElementalStatusMesh(
  group: THREE.Group,
  statusKind: MobaElementStatusKind,
  timeSec: number,
  dt: number
): void {
  if (statusKind === 'burn') {
    group.rotation.y += dt * 4.5;
    const pulse = 0.92 + Math.sin(timeSec * 16) * 0.16;
    group.scale.set(1, pulse, 1);
  } else if (statusKind === 'freeze') {
    group.rotation.y += dt * 0.7;
  } else if (statusKind === 'shock') {
    group.rotation.y += dt * 12;
    group.scale.setScalar(0.95 + Math.sin(timeSec * 24) * 0.08);
  } else if (statusKind === 'gust' || statusKind === 'soak' || statusKind === 'curse' || statusKind === 'bleed') {
    group.rotation.y += dt * 4.0;
  } else if (statusKind === 'radiant') {
    group.rotation.y += dt * 3.0;
    group.position.y = Math.sin(timeSec * 5) * 0.12;
  }
}
