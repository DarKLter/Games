import * as THREE from 'three';
import { createContactShadowMesh } from '../../../../core/threeShared';
import { MlbbRole } from '../types';

export const WORLD_SCALE = 0.05; // 4000 logical units -> 200 Three.js world units (-100..+100)

/**
 * Authentic MLBB Blue->Red diagonal 3D camera yaw (~22.1 deg).
 * Shared by ThreeBattlefieldRenderer and GameEngine so joystick, WASD, skill aiming,
 * and free-camera pan stay 100% screen-aligned with the angled 3D perspective.
 */
export const MLBB_3D_CAMERA_YAW = Math.atan2(8.2, 20.2);

export function toThreeX(wx: number): number {
  return (wx - 2000) * WORLD_SCALE;
}

export function toThreeZ(wy: number): number {
  return (wy - 2000) * WORLD_SCALE;
}

export function hexToInt(hex: string, fallback = 0x38bdf8): number {
  if (!hex || typeof hex !== 'string') return fallback;
  const cleaned = hex.replace('#', '').trim();
  const parsed = parseInt(
    cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned.slice(0, 6),
    16
  );
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface HeroRig3D {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  weaponPivot: THREE.Group;
  capePivot: THREE.Group;
  headGroup: THREE.Group;
  baseRing: THREE.Mesh;
  lockRing: THREE.Mesh;
  ccHalo: THREE.Mesh;
  iceCage: THREE.Mesh;
  recallRing: THREE.Mesh;
  orbitGroup: THREE.Group;
  orbitBlades: THREE.Mesh[];
  materials: THREE.MeshStandardMaterial[];
}

/**
 * Builds a sculpted 16+ part articulated 3D MLBB Champion rig grounded cleanly at y = 0.
 * Distinct silhouettes, armor geometry, headgear, flowing capes, and ornate weapons for
 * Tank, Fighter, Assassin, Mage, Marksman, and Support.
 */
export function buildMlbbHeroRig3D(
  role: MlbbRole,
  primaryHex: string,
  accentHex: string,
  team: 'blue' | 'red',
  isPlayer: boolean,
  scale = 1.62
): HeroRig3D {
  const group = new THREE.Group();
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  const primaryCol = hexToInt(primaryHex, 0x3b82f6);
  const accentCol = hexToInt(accentHex, 0xf5c451);
  const teamCol = isPlayer ? 0xfacc15 : team === 'blue' ? 0x38bdf8 : 0xfb7185;

  const armorMat = new THREE.MeshStandardMaterial({
    color: primaryCol,
    roughness: 0.34,
    metalness: 0.42
  });
  const cloakMat = new THREE.MeshStandardMaterial({
    color: accentCol,
    roughness: 0.68,
    metalness: 0.14,
    side: THREE.DoubleSide
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf0c65b,
    roughness: 0.22,
    metalness: 0.86
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.72,
    metalness: 0.24
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: accentCol,
    emissive: accentCol,
    emissiveIntensity: 0.85,
    roughness: 0.18,
    metalness: 0.7
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xf4cfa8,
    roughness: 0.62,
    metalness: 0.05
  });

  const materials = [armorMat, cloakMat, goldMat, darkMat, glowMat, skinMat];

  // --- Articulated Sculpted Legs (Hip Pivots) ---
  const legScale = role === 'Tank' ? 1.2 : role === 'Assassin' ? 0.88 : 1.0;
  const makeLeg = (xSign: number): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(xSign * 0.22 * legScale, 0.86, 0);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14 * legScale, 0.115 * legScale, 0.44, 8),
      darkMat
    );
    thigh.position.y = -0.22;
    thigh.castShadow = true;

    const knee = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 * legScale, 0), goldMat);
    knee.position.set(0, -0.44, 0.06);

    const greave = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * legScale, 0.14 * legScale, 0.42, 8),
      armorMat
    );
    greave.position.y = -0.65;
    greave.castShadow = true;

    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.24 * legScale, 0.14, 0.36 * legScale),
      darkMat
    );
    boot.position.set(0, -0.79, 0.06);
    boot.castShadow = true;

    pivot.add(thigh, knee, greave, boot);
    return pivot;
  };
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);

  // --- Sculpted Waist Sash, Hip Tassets & Tapered Armored Cuirass ---
  const chestW = role === 'Tank' ? 0.66 : role === 'Fighter' ? 0.56 : role === 'Assassin' ? 0.45 : 0.48;
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(chestW * 0.72, chestW * 0.84, 0.28, 10), darkMat);
  waist.position.y = 0.96;

  const belt = new THREE.Mesh(new THREE.TorusGeometry(chestW * 0.78, 0.055, 8, 18), goldMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.98;

  const buckle = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), glowMat);
  buckle.position.set(0, 0.98, chestW * 0.76);

  // Hip Armor Tassets
  const tassetL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.34), armorMat);
  tassetL.position.set(-chestW * 0.78, 0.84, 0);
  tassetL.rotation.z = 0.18;
  const tassetR = tassetL.clone();
  tassetR.position.x = chestW * 0.78;
  tassetR.rotation.z = -0.18;

  // Tapered Sculpted Torso Cuirass
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(chestW * 0.98, chestW * 0.68, 0.72, 10),
    armorMat
  );
  torso.scale.set(1.05, 1.0, 0.72);
  torso.position.y = 1.42;
  torso.castShadow = true;

  const chestCrest = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), glowMat);
  chestCrest.position.set(0, 1.48, chestW * 0.72);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.065, 8, 16), goldMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.76;

  // Sculpted Layered Pauldrons
  const paulR = role === 'Tank' ? 0.36 : role === 'Fighter' ? 0.29 : 0.23;
  const pauldronL = new THREE.Mesh(
    new THREE.SphereGeometry(paulR, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.65),
    goldMat
  );
  pauldronL.position.set(-chestW * 1.12, 1.68, 0);
  pauldronL.rotation.z = 0.35;
  pauldronL.castShadow = true;

  const pauldronR = pauldronL.clone();
  pauldronR.position.x = chestW * 1.12;
  pauldronR.rotation.z = -0.35;

  // --- Flowing Articulated Cape Pivot ---
  const capePivot = new THREE.Group();
  capePivot.position.set(0, 1.72, -chestW * 0.56);
  const capeShape = new THREE.Shape();
  const cwTop = chestW * 0.85;
  const cwBot = chestW * 1.25;
  capeShape.moveTo(-cwTop, 0);
  capeShape.lineTo(cwTop, 0);
  capeShape.lineTo(cwBot, -1.28);
  capeShape.lineTo(0, -1.42);
  capeShape.lineTo(-cwBot, -1.28);
  capeShape.closePath();
  const capeGeo = new THREE.ExtrudeGeometry(capeShape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2
  });
  const capeMesh = new THREE.Mesh(capeGeo, cloakMat);
  capeMesh.position.z = -0.04;
  capeMesh.rotation.x = 0.18;
  capeMesh.castShadow = true;
  capePivot.add(capeMesh);

  // --- Sculpted Head & Role-Specific Headgear ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.98, 0);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), skinMat);
  head.scale.set(0.96, 1.08, 0.98);
  head.castShadow = true;

  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.285, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
    role === 'Mage' || role === 'Marksman' ? cloakMat : armorMat
  );
  helm.position.y = 0.03;
  helm.castShadow = true;

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.085, 0.14), glowMat);
  visor.position.set(0, 0.02, 0.22);

  headGroup.add(head, helm, visor);

  if (role === 'Mage') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.56, 0.06, 14), cloakMat);
    brim.position.set(0, 0.22, -0.02);
    const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.78, 10), cloakMat);
    hatCone.position.set(0, 0.58, -0.08);
    hatCone.rotation.x = -0.18;
    const hatBand = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 6, 16), goldMat);
    hatBand.rotation.x = Math.PI / 2;
    hatBand.position.set(0, 0.26, -0.02);
    headGroup.add(brim, hatCone, hatBand);
  } else if (role === 'Support') {
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 22), glowMat);
    halo.position.set(0, 0.34, -0.14);
    halo.rotation.x = 0.3;
    const wingCrownL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.34, 4), goldMat);
    wingCrownL.position.set(-0.28, 0.18, 0);
    wingCrownL.rotation.z = 0.65;
    const wingCrownR = wingCrownL.clone();
    wingCrownR.position.x = 0.28;
    wingCrownR.rotation.z = -0.65;
    headGroup.add(halo, wingCrownL, wingCrownR);
  } else if (role === 'Marksman') {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.52, 8), cloakMat);
    hood.position.set(0, 0.16, -0.16);
    hood.rotation.x = -0.85;
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 6), glowMat);
    plume.position.set(0.14, 0.34, -0.12);
    plume.rotation.x = -0.4;
    headGroup.add(hood, plume);
  } else if (role === 'Tank') {
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.48, 6), goldMat);
    hornL.position.set(-0.26, 0.28, 0.04);
    hornL.rotation.z = 0.42;
    const hornR = hornL.clone();
    hornR.position.x = 0.26;
    hornR.rotation.z = -0.42;
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.44), glowMat);
    crest.position.set(0, 0.32, -0.02);
    headGroup.add(hornL, hornR, crest);
  } else if (role === 'Assassin') {
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.085, 8, 16), cloakMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = -0.16;
    const finL = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.36, 4), glowMat);
    finL.position.set(-0.24, 0.22, -0.06);
    finL.rotation.z = 0.55;
    finL.rotation.x = -0.35;
    const finR = finL.clone();
    finR.position.x = 0.24;
    finR.rotation.z = -0.55;
    headGroup.add(scarf, finL, finR);
  } else {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 5), goldMat);
    crown.position.set(0, 0.36, 0.02);
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.48), glowMat);
    plume.position.set(0, 0.26, -0.18);
    plume.rotation.x = -0.28;
    headGroup.add(crown, plume);
  }

  // --- Articulated Left Arm (+ Shield / Off-hand Dagger) ---
  const leftArm = new THREE.Group();
  leftArm.position.set(-chestW * 1.06, 1.56, 0);
  const armGeo = new THREE.CylinderGeometry(0.1, 0.085, 0.56, 8);
  const leftArmMesh = new THREE.Mesh(armGeo, armorMat);
  leftArmMesh.position.y = -0.28;
  leftArmMesh.castShadow = true;
  const leftGauntlet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldMat);
  leftGauntlet.position.y = -0.58;
  leftArm.add(leftArmMesh, leftGauntlet);

  if (role === 'Tank') {
    const shieldFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.18, 0.86), goldMat);
    shieldFrame.position.set(-0.18, -0.42, 0.24);
    shieldFrame.rotation.y = 0.26;
    shieldFrame.castShadow = true;
    const shieldCore = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.88, 0.56), glowMat);
    shieldCore.position.copy(shieldFrame.position);
    shieldCore.rotation.copy(shieldFrame.rotation);
    leftArm.add(shieldFrame, shieldCore);
  } else if (role === 'Assassin') {
    const offBlade = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.96, 4), glowMat);
    offBlade.rotation.x = Math.PI / 2 - 0.15;
    offBlade.position.set(0, -0.56, 0.45);
    leftArm.add(offBlade);
  }

  // --- Articulated Right Weapon Arm Pivot ---
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(chestW * 1.06, 1.56, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, armorMat);
  rightArmMesh.position.y = -0.28;
  rightArmMesh.castShadow = true;
  const rightGauntlet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), goldMat);
  rightGauntlet.position.y = -0.58;
  weaponPivot.add(rightArmMesh, rightGauntlet);

  if (role === 'Tank') {
    const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.48, 8), darkMat);
    hammerShaft.position.set(0.05, -0.35, 0.42);
    hammerShaft.rotation.x = 0.72;
    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.4, 0.64), goldMat);
    hammerHead.position.set(0.05, 0.15, 0.88);
    hammerHead.castShadow = true;
    const hammerGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glowMat);
    hammerGem.position.set(0.05, 0.15, 1.22);
    weaponPivot.add(hammerShaft, hammerHead, hammerGem);
  } else if (role === 'Assassin') {
    const mainBlade = new THREE.Mesh(new THREE.ConeGeometry(0.085, 1.08, 4), glowMat);
    mainBlade.rotation.x = Math.PI / 2 - 0.12;
    mainBlade.position.set(0, -0.54, 0.52);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 6), goldMat);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.set(0, -0.56, 0.08);
    weaponPivot.add(mainBlade, hilt);
  } else if (role === 'Mage' || role === 'Support') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 2.2, 8), goldMat);
    staff.position.set(0.04, -0.12, 0.36);
    staff.rotation.x = 0.32;
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 0), glowMat);
    orb.position.set(0.04, 0.96, 0.72);
    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 6, 18), goldMat);
    haloRing.position.copy(orb.position);
    haloRing.rotation.y = Math.PI / 4;
    weaponPivot.add(staff, orb, haloRing);
  } else if (role === 'Marksman') {
    const bowArc = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.06, 8, 20, Math.PI * 1.18), goldMat);
    bowArc.position.set(0.02, -0.42, 0.52);
    bowArc.rotation.y = Math.PI / 2;
    bowArc.rotation.z = -Math.PI * 0.59;
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.28, 6), glowMat);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0.02, -0.42, 0.82);
    const arrowTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 4), glowMat);
    arrowTip.rotation.x = Math.PI / 2;
    arrowTip.position.set(0.02, -0.42, 1.48);
    weaponPivot.add(bowArc, arrow, arrowTip);
  } else {
    // Fighter Ornate Greatsword
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.72, 0.07), glowMat);
    blade.position.set(0.04, -0.02, 0.62);
    blade.rotation.x = 0.66;
    blade.castShadow = true;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 4), glowMat);
    tip.position.set(0.04, 0.72, 1.18);
    tip.rotation.x = 0.66;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.16), goldMat);
    guard.position.set(0.04, -0.58, 0.2);
    guard.rotation.x = 0.66;
    weaponPivot.add(blade, tip, guard);
  }

  bodyGroup.add(
    leftLeg,
    rightLeg,
    waist,
    belt,
    buckle,
    tassetL,
    tassetR,
    torso,
    chestCrest,
    collar,
    pauldronL,
    pauldronR,
    capePivot,
    headGroup,
    leftArm,
    weaponPivot
  );

  // Ground Team Ring + Lock-On Target Ring
  const baseRing = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 1.08, 32),
    new THREE.MeshBasicMaterial({
      color: teamCol,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isPlayer ? 0.94 : 0.75,
      depthWrite: false
    })
  );
  baseRing.rotation.x = -Math.PI / 2;
  baseRing.position.y = 0.05;

  const lockRing = new THREE.Mesh(
    new THREE.RingGeometry(1.25, 1.52, 28),
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    })
  );
  lockRing.rotation.x = -Math.PI / 2;
  lockRing.position.y = 0.08;
  lockRing.visible = false;

  // Golden CC-Immune / Wind of Nature Halo
  const ccHalo = new THREE.Mesh(
    new THREE.TorusGeometry(1.06, 0.075, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9 })
  );
  ccHalo.rotation.x = Math.PI / 2;
  ccHalo.position.y = 1.2;
  ccHalo.visible = false;

  // Winter Crown Ice Cage
  const iceCage = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.42, 0),
    new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.52,
      roughness: 0.12
    })
  );
  iceCage.position.y = 1.25;
  iceCage.visible = false;

  // Recall Blue Swirling Runic Cylinder
  const recallRing = new THREE.Mesh(
    new THREE.CylinderGeometry(1.22, 1.22, 2.35, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.36,
      depthWrite: false
    })
  );
  recallRing.position.y = 1.18;
  recallRing.visible = false;

  // Saber Orbiting Cyan Blades
  const orbitGroup = new THREE.Group();
  orbitGroup.position.y = 1.15;
  const orbitBlades: THREE.Mesh[] = [];
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  const orbitGeo = new THREE.ConeGeometry(0.16, 0.78, 4);
  orbitGeo.rotateX(Math.PI / 2);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(orbitGeo, orbitMat);
    b.visible = false;
    orbitGroup.add(b);
    orbitBlades.push(b);
  }

  group.add(
    createContactShadowMesh(1.22, 0.42),
    baseRing,
    lockRing,
    ccHalo,
    iceCage,
    recallRing,
    orbitGroup
  );
  group.scale.setScalar(scale);

  return {
    group,
    bodyGroup,
    leftLeg,
    rightLeg,
    leftArm,
    weaponPivot,
    capePivot,
    headGroup,
    baseRing,
    lockRing,
    ccHalo,
    iceCage,
    recallRing,
    orbitGroup,
    orbitBlades,
    materials
  };
}

export interface TurretRig3D {
  group: THREE.Group;
  crystal: THREE.Mesh;
  orbitRing: THREE.Mesh;
  shieldDome: THREE.Mesh;
  rangeRing: THREE.Mesh;
  rangeRingMat: THREE.MeshBasicMaterial;
  rangeFill: THREE.Mesh;
  rangeFillMat: THREE.MeshBasicMaterial;
  laserBeam: THREE.Mesh;
}

/**
 * Builds a monumental multi-tier 3D Land of Dawn Marble & Gold Sanctuary Turret or Base Crystal
 * with buttresses, battlements, levitating crystal core, orbiting gold halo, energy shield dome,
 * 3-State Range Ring (Emerald/Amber/Pulsing Red), and Lock-On Laser Sight.
 */
export function buildMlbbTurretRig3D(
  team: 'blue' | 'red',
  tier: number,
  golden: boolean,
  rangeWorld: number
): TurretRig3D {
  const group = new THREE.Group();
  const isCrystal = tier === 4;
  const teamCol = team === 'blue' ? 0x38bdf8 : 0xf43f5e;
  const marbleCol = team === 'blue' ? 0xdbeafe : 0xfde2e4;
  const stoneCol = team === 'blue' ? 0x254980 : 0x7c2033;
  const trimCol = golden ? 0xfacc15 : 0xeab308;

  const marbleMat = new THREE.MeshStandardMaterial({ color: marbleCol, roughness: 0.45, metalness: 0.16 });
  const stoneMat = new THREE.MeshStandardMaterial({ color: stoneCol, roughness: 0.58, metalness: 0.25 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimCol, roughness: 0.24, metalness: 0.85 });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: teamCol,
    emissive: teamCol,
    emissiveIntensity: 1.05,
    roughness: 0.14,
    metalness: 0.45
  });

  const baseR = isCrystal ? 4.1 : 2.55;
  const baseH = isCrystal ? 1.45 : 1.15;

  // Stepped Octagonal Stone Plinth
  const plinthLower = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.94, baseR * 1.08, baseH * 0.55, 8), stoneMat);
  plinthLower.position.y = baseH * 0.28;
  plinthLower.castShadow = true;
  plinthLower.receiveShadow = true;

  const plinthUpper = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.78, baseR * 0.92, baseH * 0.55, 8), marbleMat);
  plinthUpper.position.y = baseH * 0.8;
  plinthUpper.castShadow = true;

  const trimBand = new THREE.Mesh(new THREE.CylinderGeometry(baseR * 0.88, baseR * 0.92, 0.26, 8), trimMat);
  trimBand.position.y = baseH * 1.08;

  const pillarH = isCrystal ? 2.85 : 3.9;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(baseR * 0.4, baseR * 0.62, pillarH, 8),
    marbleMat
  );
  pillar.position.y = baseH + pillarH * 0.5;
  pillar.castShadow = true;

  // 4 Sculpted Architectural Buttresses
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const buttress = new THREE.Mesh(new THREE.BoxGeometry(0.42, pillarH * 0.78, 0.82), stoneMat);
    buttress.position.set(Math.cos(a) * baseR * 0.58, baseH + pillarH * 0.36, Math.sin(a) * baseR * 0.58);
    buttress.rotation.y = -a + Math.PI / 2;
    buttress.castShadow = true;
    group.add(buttress);
  }

  const crown = new THREE.Mesh(new THREE.TorusGeometry(baseR * 0.58, 0.2, 8, 12), trimMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = baseH + pillarH;

  const crystalY = baseH + pillarH + (isCrystal ? 1.85 : 1.4);
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(isCrystal ? 2.05 : 1.18, 0),
    crystalMat
  );
  crystal.position.y = crystalY;
  crystal.castShadow = true;

  const orbitRing = new THREE.Mesh(
    new THREE.TorusGeometry(isCrystal ? 2.55 : 1.55, 0.11, 8, 28),
    trimMat
  );
  orbitRing.position.y = crystalY;
  orbitRing.rotation.x = Math.PI / 3;

  const shieldDome = new THREE.Mesh(
    new THREE.SphereGeometry(baseR * 1.28, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.64),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      depthWrite: false
    })
  );
  const shieldShell = new THREE.Mesh(
    new THREE.SphereGeometry(baseR * 1.24, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  shieldDome.add(shieldShell);
  shieldDome.position.y = 0.18;
  shieldDome.visible = false;

  // 3-State Turret Ground Range Ring
  const rr = rangeWorld * WORLD_SCALE;
  const rangeRingMat = new THREE.MeshBasicMaterial({
    color: 0x2ce58b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  });
  const rangeRing = new THREE.Mesh(new THREE.RingGeometry(rr - 0.3, rr, 48), rangeRingMat);
  rangeRing.rotation.x = -Math.PI / 2;
  rangeRing.position.y = 0.1;
  rangeRing.visible = false;

  const rangeFillMat = new THREE.MeshBasicMaterial({
    color: 0x2ce58b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.09,
    depthWrite: false
  });
  const rangeFill = new THREE.Mesh(new THREE.CircleGeometry(rr - 0.3, 40), rangeFillMat);
  rangeFill.rotation.x = -Math.PI / 2;
  rangeFill.position.y = 0.07;
  rangeFill.visible = false;

  // Lock-On Laser Sight Beam
  const laserGeo = new THREE.CylinderGeometry(0.13, 0.13, 1, 6);
  laserGeo.rotateX(Math.PI / 2);
  laserGeo.translate(0, 0, 0.5);
  const laserBeam = new THREE.Mesh(
    laserGeo,
    new THREE.MeshBasicMaterial({ color: 0xff3b4e, transparent: true, opacity: 0.9 })
  );
  laserBeam.position.y = crystalY;
  laserBeam.visible = false;

  group.add(
    createContactShadowMesh(baseR * 1.22, 0.48),
    plinthLower,
    plinthUpper,
    trimBand,
    pillar,
    crown,
    crystal,
    orbitRing,
    shieldDome,
    rangeRing,
    rangeFill,
    laserBeam
  );

  return { group, crystal, orbitRing, shieldDome, rangeRing, rangeRingMat, rangeFill, rangeFillMat, laserBeam };
}

/**
 * Builds sculpted 3D Jungle Monsters (Molten Fiend, Thunder Fenrir, Crab, Litho, Armored Turtle, and Sanctuary Lord).
 */
export function buildJungleMobRig3D(kind: string, colorHex: string): THREE.Group {
  const group = new THREE.Group();
  const col = hexToInt(colorHex, 0x2ce58b);
  const bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.42, metalness: 0.32 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x243044, roughness: 0.68, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf0c65b, roughness: 0.24, metalness: 0.85 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: col,
    emissive: col,
    emissiveIntensity: 0.9,
    roughness: 0.18
  });

  if (kind === 'lord') {
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.8, 8), darkMat);
    legL.position.set(-0.62, 0.9, 0);
    const legR = legL.clone();
    legR.position.x = 0.62;
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 0.92, 2.4, 8), bodyMat);
    torso.position.y = 2.6;
    torso.castShadow = true;
    const chestCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), glowMat);
    chestCore.position.set(0, 2.75, 1.02);
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), goldMat);
    head.position.set(0, 4.2, 0.22);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 5), glowMat);
    crown.position.set(0, 4.95, 0.22);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.5, 0.16), glowMat);
    wingL.position.set(-2.0, 3.1, -0.65);
    wingL.rotation.z = 0.48;
    const wingR = wingL.clone();
    wingR.position.x = 2.0;
    wingR.rotation.z = -0.48;
    const halberdShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.2, 8), goldMat);
    halberdShaft.position.set(1.75, 2.6, 0.58);
    halberdShaft.rotation.x = 0.32;
    const halberdBlade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.45, 0.12), glowMat);
    halberdBlade.position.set(1.75, 4.65, 1.28);
    halberdBlade.rotation.x = 0.32;
    group.add(
      createContactShadowMesh(2.9, 0.5),
      legL,
      legR,
      torso,
      chestCore,
      head,
      crown,
      wingL,
      wingR,
      halberdShaft,
      halberdBlade
    );
  } else if (kind === 'turtle') {
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62),
      bodyMat
    );
    shell.scale.set(1.16, 0.86, 1.25);
    shell.position.y = 0.65;
    shell.castShadow = true;
    const ridge = new THREE.Mesh(new THREE.OctahedronGeometry(0.82, 0), glowMat);
    ridge.position.y = 2.15;
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), darkMat);
    head.position.set(0, 0.92, 2.35);
    const eyeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.2), glowMat);
    eyeGlow.position.set(0, 1.02, 2.88);
    for (let i = 0; i < 4; i++) {
      const sx = i % 2 === 0 ? -1.45 : 1.45;
      const sz = i < 2 ? 1.15 : -1.15;
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.92), darkMat);
      fin.position.set(sx, 0.42, sz);
      fin.rotation.y = sx > 0 ? -0.35 : 0.35;
      group.add(fin);
    }
    group.add(createContactShadowMesh(2.65, 0.48), shell, ridge, head, eyeGlow);
  } else if (kind === 'orange_buff' || kind === 'purple_buff') {
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.85, 0.95, 8), darkMat);
    legs.position.y = 0.48;
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.18, 0), bodyMat);
    torso.scale.set(1.15, 1.1, 0.92);
    torso.position.y = 1.65;
    torso.castShadow = true;
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), glowMat);
    core.position.set(0, 1.72, 0.95);
    const shoulderL = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 5), glowMat);
    shoulderL.position.set(-1.18, 2.38, 0.08);
    shoulderL.rotation.z = 0.42;
    const shoulderR = shoulderL.clone();
    shoulderR.position.x = 1.18;
    shoulderR.rotation.z = -0.42;
    group.add(createContactShadowMesh(1.9, 0.45), legs, torso, core, shoulderL, shoulderR);
  } else {
    const body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), bodyMat);
    body.position.y = 1.05;
    body.castShadow = true;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), glowMat);
    eye.position.set(0, 1.22, 0.82);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.65, 5), goldMat);
    crest.position.set(0, 2.05, 0);
    group.add(createContactShadowMesh(1.3, 0.4), body, eye, crest);
  }

  return group;
}

/** Builds sculpted 3D Lane Minions (Melee Footman, Arcane Caster, Siege Cannon Wagon, Super Minion Juggernaut, Mini-Turtle, Allied Lord). */
export function buildMinionRig3D(team: 'blue' | 'red', kind: string): THREE.Group {
  if (kind === 'lord_ally') return buildJungleMobRig3D('lord', team === 'blue' ? '#38BDF8' : '#F59E0B');
  if (kind === 'mini_turtle') {
    const g = buildJungleMobRig3D('turtle', '#2CE58B');
    g.scale.setScalar(0.68);
    return g;
  }
  const group = new THREE.Group();
  const col = team === 'blue' ? 0x2563eb : 0xdc2626;
  const trim = kind === 'siege' || kind === 'super' ? 0xfacc15 : team === 'blue' ? 0x93c5fd : 0xfca5a5;
  const bodyMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.38, metalness: 0.42 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trim, roughness: 0.24, metalness: 0.82 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72 });

  if (kind === 'super') {
    // Heavily armored gold-crested Super Minion Juggernaut (unlocked when enemy Inhibitor falls!)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 1.75, 8), bodyMat);
    torso.position.y = 0.92;
    torso.castShadow = true;
    const paulL = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), trimMat);
    paulL.position.set(-0.78, 1.52, 0);
    const paulR = paulL.clone();
    paulR.position.x = 0.78;
    const helm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.46, 0), trimMat);
    helm.position.y = 2.02;
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.65, 5), trimMat);
    crest.position.set(0, 2.55, 0);
    const towerShield = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.48, 0.95), trimMat);
    towerShield.position.set(-0.92, 1.05, 0.35);
    const halberd = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.35, 6), darkMat);
    halberd.position.set(0.88, 1.35, 0.32);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.72, 0.1), trimMat);
    blade.position.set(0.88, 2.25, 0.38);
    group.add(createContactShadowMesh(1.38, 0.44), torso, paulL, paulR, helm, crest, towerShield, halberd, blade);
  } else if (kind === 'siege') {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.82, 1.65), bodyMat);
    hull.position.y = 0.64;
    hull.castShadow = true;
    const cannon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.55, 8), trimMat);
    cannon.rotation.x = Math.PI / 2 - 0.22;
    cannon.position.set(0, 1.25, 0.55);
    for (let i = 0; i < 4; i++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.16, 10), darkMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(i % 2 === 0 ? -0.74 : 0.74, 0.32, i < 2 ? 0.5 : -0.5);
      group.add(wheel);
    }
    group.add(createContactShadowMesh(1.25, 0.38), hull, cannon);
  } else {
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.54, 1.15, 8), bodyMat);
    robe.position.y = 0.58;
    robe.castShadow = true;
    const shoulder = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 6, 12), trimMat);
    shoulder.rotation.x = Math.PI / 2;
    shoulder.position.y = 1.06;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), trimMat);
    head.position.y = 1.35;
    const weapon = new THREE.Mesh(
      kind === 'ranged' ? new THREE.CylinderGeometry(0.05, 0.05, 1.35, 6) : new THREE.BoxGeometry(0.14, 0.82, 0.52),
      trimMat
    );
    weapon.position.set(0.45, 0.92, 0.22);
    group.add(createContactShadowMesh(0.78, 0.35), robe, shoulder, head, weapon);
  }
  return group;
}

/** Builds a glowing 3D Brawl Healing Shrine (stone altar + levitating emerald heal crystal + aura ring). */
export function buildBrawlShrineRig3D(): { group: THREE.Group; crystal: THREE.Mesh; ring: THREE.Mesh } {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.22 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.26, metalness: 0.82 });
  const emeraldMat = new THREE.MeshStandardMaterial({
    color: 0x2ce58b,
    emissive: 0x10b981,
    emissiveIntensity: 1.15,
    roughness: 0.16
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.45, 0.42, 12), stoneMat);
  base.position.y = 0.21;
  base.receiveShadow = true;

  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.14, 8, 24), goldMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.44;

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.15, 0), emeraldMat);
  crystal.position.y = 2.35;
  crystal.castShadow = true;

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.85, 2.35, 28),
    new THREE.MeshBasicMaterial({
      color: 0x2ce58b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.48;

  group.add(base, rim, crystal, ring);
  return { group, crystal, ring };
}

/** Builds a patrolling 3D Walkie Grass Spirit Ward summoned by slaying the Lithowanderer. */
export function buildWalkieGrassRig3D(team: 'blue' | 'red'): THREE.Group {
  const group = new THREE.Group();
  const mainCol = team === 'blue' ? 0x2dd4bf : 0xfb7185;
  const glowMat = new THREE.MeshStandardMaterial({
    color: mainCol,
    emissive: mainCol,
    emissiveIntensity: 0.95,
    roughness: 0.22
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.55 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 10), glowMat);
  body.position.y = 1.45;
  const sproutL = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.9, 6), leafMat);
  sproutL.position.set(-0.32, 2.25, 0);
  sproutL.rotation.z = 0.45;
  const sproutR = sproutL.clone();
  sproutR.position.x = 0.32;
  sproutR.rotation.z = -0.45;

  const aura = new THREE.Mesh(
    new THREE.RingGeometry(2.6, 3.05, 32),
    new THREE.MeshBasicMaterial({
      color: mainCol,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.48,
      depthWrite: false
    })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.2;

  group.add(createContactShadowMesh(1.1, 0.35), body, sproutL, sproutR, aura);
  return group;
}

