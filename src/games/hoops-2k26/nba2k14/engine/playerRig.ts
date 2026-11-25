// ============================================================================
// NBA 2K14 — Articulated 3D Player Rig, Jersey Canvas Texture & 3D Floor Ring
// ============================================================================

import * as THREE from 'three';
import type { PlayerData } from '../types';

export type PlayerPose =
  | 'idle'
  | 'run'
  | 'dribble'
  | 'crossover'
  | 'spin'
  | 'post'
  | 'jumpshot'
  | 'layup'
  | 'dunk'
  | 'intense_d'
  | 'hands_up'
  | 'block'
  | 'stumble'
  | 'celebrate';

export interface ArticulatedPlayerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  floorRingGroup: THREE.Group;
  outerRingMesh: THREE.Mesh;
  staminaArcMesh: THREE.Mesh;
  shotArcBg: THREE.Mesh;
  shotArcFill: THREE.Mesh;
  matchupArrow: THREE.Mesh;
  hotBadgeMesh: THREE.Mesh;
  rightHandTip: THREE.Object3D;
  dispose: () => void;
}

function createJerseyTexture(
  jerseyNum: number,
  jerseyColor: string,
  trimColor: string,
  teamCode: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = jerseyColor;
  ctx.fillRect(0, 0, 256, 256);

  // Side athletic stripes
  ctx.fillStyle = trimColor;
  ctx.fillRect(0, 0, 20, 256);
  ctx.fillRect(236, 0, 20, 256);
  ctx.fillRect(0, 0, 256, 18);

  // Determine contrasting numeral ink
  const isLight = jerseyColor.toLowerCase() === '#f8fafc' || jerseyColor.toLowerCase() === '#ffffff';
  const ink = isLight ? trimColor : '#ffffff';
  const strokeInk = isLight ? '#111827' : trimColor;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Team code across upper chest
  ctx.font = 'bold 28px "Oswald", Impact, sans-serif';
  ctx.fillStyle = ink;
  ctx.fillText(teamCode, 128, 62);

  // Large jersey number
  ctx.font = '900 104px "Oswald", Impact, sans-serif';
  ctx.lineWidth = 6;
  ctx.strokeStyle = strokeInk;
  ctx.strokeText(String(jerseyNum), 128, 152);
  ctx.fillStyle = ink;
  ctx.fillText(String(jerseyNum), 128, 152);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createArticulatedPlayerRig(
  player: PlayerData,
  jerseyColor: string,
  trimColor: string,
  teamCode: string,
  isUserTeam: boolean
): ArticulatedPlayerRig {
  const root = new THREE.Group();
  const scaleH = Math.min(1.16, Math.max(0.88, player.heightCm / 200));
  const bodyGroup = new THREE.Group();
  bodyGroup.scale.set(scaleH * 0.96, scaleH, scaleH * 0.96);
  root.add(bodyGroup);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj);
    return obj;
  };

  const skinMat = track(
    new THREE.MeshStandardMaterial({
      color: player.skinTone,
      roughness: 0.62,
      metalness: 0.04,
    })
  );
  const jerseyTex = track(createJerseyTexture(player.jersey, jerseyColor, trimColor, teamCode));
  const jerseyMat = track(
    new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.52,
      metalness: 0.08,
    })
  );
  const shortsMat = track(
    new THREE.MeshStandardMaterial({
      color: jerseyColor,
      roughness: 0.56,
      metalness: 0.05,
    })
  );
  const trimMat = track(
    new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: 0.42,
      metalness: 0.15,
    })
  );
  const shoeMat = track(
    new THREE.MeshStandardMaterial({
      color: player.shoeColor || '#f1f5f9',
      roughness: 0.35,
      metalness: 0.15,
    })
  );
  const sleeveMat = track(
    new THREE.MeshStandardMaterial({
      color: isUserTeam ? '#111318' : '#e2e8f0',
      roughness: 0.6,
      metalness: 0.05,
    })
  );
  const hairMat = track(
    new THREE.MeshStandardMaterial({
      color: player.hairColor || '#151210',
      roughness: 0.85,
      metalness: 0.02,
    })
  );

  // Torso (jersey front/back textured)
  const torsoGeo = track(new THREE.BoxGeometry(0.46, 0.62, 0.28));
  const torso = new THREE.Mesh(torsoGeo, jerseyMat);
  torso.position.y = 1.24;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Shoulders bevel
  const shoulderGeo = track(new THREE.CapsuleGeometry(0.11, 0.38, 4, 8));
  shoulderGeo.rotateZ(Math.PI / 2);
  const shoulders = new THREE.Mesh(shoulderGeo, jerseyMat);
  shoulders.position.y = 1.49;
  bodyGroup.add(shoulders);

  // Shorts
  const shortsGeo = track(new THREE.BoxGeometry(0.44, 0.32, 0.27));
  const shorts = new THREE.Mesh(shortsGeo, shortsMat);
  shorts.position.y = 0.82;
  shorts.castShadow = true;
  bodyGroup.add(shorts);

  // Waist trim band
  const bandGeo = track(new THREE.BoxGeometry(0.455, 0.05, 0.285));
  const band = new THREE.Mesh(bandGeo, trimMat);
  band.position.y = 0.96;
  bodyGroup.add(band);

  // Head + Hair + Optional Headband
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.68;
  bodyGroup.add(headGroup);

  const neckGeo = track(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 10));
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = -0.08;
  headGroup.add(neck);

  const headGeo = track(new THREE.SphereGeometry(0.145, 14, 12));
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.07;
  head.castShadow = true;
  headGroup.add(head);

  if (player.hairStyle !== 'bald') {
    const hairRadius = player.hairStyle === 'afro' ? 0.175 : 0.15;
    const hairGeo = track(new THREE.SphereGeometry(hairRadius, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58));
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.085;
    headGroup.add(hair);
  }

  if (player.headband) {
    const hbGeo = track(new THREE.TorusGeometry(0.142, 0.02, 8, 20));
    hbGeo.rotateX(Math.PI / 2);
    const hb = new THREE.Mesh(hbGeo, trimMat);
    hb.position.y = 0.12;
    headGroup.add(hb);
  }

  // Arms (pivoting at shoulder)
  const buildArm = (side: -1 | 1): { group: THREE.Group; handTip: THREE.Object3D } => {
    const g = new THREE.Group();
    g.position.set(side * 0.3, 1.48, 0);
    const upperGeo = track(new THREE.CylinderGeometry(0.062, 0.054, 0.34, 10));
    const upper = new THREE.Mesh(upperGeo, side === 1 && player.armSleeve ? sleeveMat : skinMat);
    upper.position.y = -0.17;
    upper.castShadow = true;
    g.add(upper);

    const lowerGeo = track(new THREE.CylinderGeometry(0.052, 0.044, 0.33, 10));
    const lower = new THREE.Mesh(lowerGeo, side === 1 && player.armSleeve ? sleeveMat : skinMat);
    lower.position.y = -0.49;
    g.add(lower);

    const handGeo = track(new THREE.SphereGeometry(0.05, 8, 8));
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.y = -0.68;
    g.add(hand);

    const handTip = new THREE.Object3D();
    handTip.position.set(0, -0.76, 0.08);
    g.add(handTip);

    bodyGroup.add(g);
    return { group: g, handTip };
  };

  const leftArmBuilt = buildArm(-1);
  const rightArmBuilt = buildArm(1);

  // Legs (pivoting at hip)
  const buildLeg = (side: -1 | 1): THREE.Group => {
    const g = new THREE.Group();
    g.position.set(side * 0.13, 0.72, 0);

    const thighGeo = track(new THREE.CylinderGeometry(0.09, 0.075, 0.34, 10));
    const thigh = new THREE.Mesh(thighGeo, shortsMat);
    thigh.position.y = -0.15;
    g.add(thigh);

    const calfGeo = track(new THREE.CylinderGeometry(0.068, 0.054, 0.38, 10));
    const calf = new THREE.Mesh(calfGeo, player.legSleeve && side === -1 ? sleeveMat : skinMat);
    calf.position.y = -0.49;
    calf.castShadow = true;
    g.add(calf);

    const shoeGeo = track(new THREE.BoxGeometry(0.13, 0.1, 0.25));
    const shoe = new THREE.Mesh(shoeGeo, shoeMat);
    shoe.position.set(0, -0.67, 0.05);
    g.add(shoe);

    bodyGroup.add(g);
    return g;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // ==========================================================================
  // 2K14 3D FLOOR RING & TELEMETRY DIRECTLY UNDER PLAYER FEET
  // ==========================================================================
  const floorRingGroup = new THREE.Group();
  floorRingGroup.position.y = 0.022;
  root.add(floorRingGroup);

  const outerRingGeo = track(new THREE.RingGeometry(0.56, 0.67, 36));
  outerRingGeo.rotateX(-Math.PI / 2);
  const outerRingMat = track(
    new THREE.MeshBasicMaterial({
      color: isUserTeam ? 0xce1141 : 0x38bdf8,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
  floorRingGroup.add(outerRingMesh);

  // Inner Stamina Arc
  const staminaGeo = track(new THREE.RingGeometry(0.42, 0.51, 28, 1, 0, Math.PI));
  staminaGeo.rotateX(-Math.PI / 2);
  const staminaMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const staminaArcMesh = new THREE.Mesh(staminaGeo, staminaMat);
  floorRingGroup.add(staminaArcMesh);

  // Optional 3D Floor Shot Timing Meter Arc
  const shotBgGeo = track(new THREE.RingGeometry(0.73, 0.85, 28, 1, -Math.PI * 0.45, Math.PI * 0.9));
  shotBgGeo.rotateX(-Math.PI / 2);
  const shotBgMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const shotArcBg = new THREE.Mesh(shotBgGeo, shotBgMat);
  shotArcBg.visible = false;
  floorRingGroup.add(shotArcBg);

  const shotFillGeo = track(new THREE.RingGeometry(0.74, 0.84, 24, 1, -Math.PI * 0.45, Math.PI * 0.45));
  shotFillGeo.rotateX(-Math.PI / 2);
  const shotFillMat = track(
    new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const shotArcFill = new THREE.Mesh(shotFillGeo, shotFillMat);
  shotArcFill.visible = false;
  floorRingGroup.add(shotArcFill);

  // Defensive Matchup Arrow
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.25);
  arrowShape.lineTo(-0.14, -0.08);
  arrowShape.lineTo(0.14, -0.08);
  arrowShape.closePath();
  const arrowGeo = track(new THREE.ShapeGeometry(arrowShape));
  arrowGeo.rotateX(-Math.PI / 2);
  const arrowMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xf9a01b,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  const matchupArrow = new THREE.Mesh(arrowGeo, arrowMat);
  matchupArrow.position.z = 0.86;
  matchupArrow.visible = false;
  floorRingGroup.add(matchupArrow);

  // Hot / Cold Streak Floor Emblem
  const hotGeo = track(new THREE.CircleGeometry(0.16, 16));
  hotGeo.rotateX(-Math.PI / 2);
  const hotMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  const hotBadgeMesh = new THREE.Mesh(hotGeo, hotMat);
  hotBadgeMesh.position.set(0.74, 0.005, -0.45);
  hotBadgeMesh.visible = false;
  floorRingGroup.add(hotBadgeMesh);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArm: leftArmBuilt.group,
    rightArm: rightArmBuilt.group,
    leftLeg,
    rightLeg,
    floorRingGroup,
    outerRingMesh,
    staminaArcMesh,
    shotArcBg,
    shotArcFill,
    matchupArrow,
    hotBadgeMesh,
    rightHandTip: rightArmBuilt.handTip,
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}

export function animatePlayerRig(
  rig: ArticulatedPlayerRig,
  pose: PlayerPose,
  time: number,
  speedRatio: number,
  airHeight = 0
): void {
  const stride = Math.sin(time * (8 + speedRatio * 5)) * Math.min(1, speedRatio) * 0.65;
  rig.bodyGroup.position.y = airHeight;
  rig.bodyGroup.rotation.x = 0;
  rig.bodyGroup.rotation.z = 0;

  if (pose === 'jumpshot') {
    rig.leftLeg.rotation.x = -0.18;
    rig.rightLeg.rotation.x = -0.12;
    rig.rightArm.rotation.x = -2.65;
    rig.leftArm.rotation.x = -2.2;
    rig.rightArm.rotation.z = -0.15;
    rig.leftArm.rotation.z = 0.25;
  } else if (pose === 'dunk') {
    rig.bodyGroup.rotation.x = 0.22;
    rig.rightArm.rotation.x = -3.05;
    rig.leftArm.rotation.x = -0.6;
    rig.leftLeg.rotation.x = 0.45;
    rig.rightLeg.rotation.x = -0.5;
  } else if (pose === 'layup') {
    rig.rightArm.rotation.x = -2.85;
    rig.leftArm.rotation.x = -0.9;
    rig.leftLeg.rotation.x = 0.45;
    rig.rightLeg.rotation.x = -0.35;
  } else if (pose === 'block') {
    rig.rightArm.rotation.x = -2.95;
    rig.leftArm.rotation.x = -2.85;
    rig.leftLeg.rotation.x = -0.15;
    rig.rightLeg.rotation.x = -0.15;
  } else if (pose === 'hands_up') {
    rig.rightArm.rotation.x = -2.5;
    rig.leftArm.rotation.x = -2.5;
    rig.rightArm.rotation.z = -0.3;
    rig.leftArm.rotation.z = 0.3;
    rig.leftLeg.rotation.x = stride * 0.4;
    rig.rightLeg.rotation.x = -stride * 0.4;
  } else if (pose === 'intense_d') {
    rig.bodyGroup.position.y = Math.max(0, airHeight) - 0.12;
    rig.bodyGroup.rotation.x = 0.16;
    rig.leftArm.rotation.z = 0.72;
    rig.rightArm.rotation.z = -0.72;
    rig.leftArm.rotation.x = -0.45;
    rig.rightArm.rotation.x = -0.45;
    rig.leftLeg.rotation.x = stride * 0.65;
    rig.rightLeg.rotation.x = -stride * 0.65;
  } else if (pose === 'stumble') {
    rig.bodyGroup.position.y = -0.22;
    rig.bodyGroup.rotation.z = Math.sin(time * 18) * 0.35;
    rig.bodyGroup.rotation.x = -0.28;
    rig.leftArm.rotation.z = 1.1;
    rig.rightArm.rotation.z = -1.1;
  } else if (pose === 'crossover') {
    rig.bodyGroup.position.y = -0.09;
    rig.bodyGroup.rotation.z = Math.sin(time * 20) * 0.18;
    rig.rightArm.rotation.x = -0.8 + Math.sin(time * 20) * 0.4;
    rig.leftArm.rotation.x = -0.8 - Math.sin(time * 20) * 0.4;
    rig.leftLeg.rotation.x = stride;
    rig.rightLeg.rotation.x = -stride;
  } else if (pose === 'post') {
    rig.bodyGroup.position.y = -0.1;
    rig.bodyGroup.rotation.x = 0.2;
    rig.leftArm.rotation.z = 0.65;
    rig.rightArm.rotation.x = -0.9;
    rig.leftLeg.rotation.x = stride * 0.45;
    rig.rightLeg.rotation.x = -stride * 0.45;
  } else if (pose === 'dribble') {
    const bounce = Math.sin(time * 12) * 0.38;
    rig.rightArm.rotation.x = -0.85 + bounce;
    rig.rightArm.rotation.z = -0.18;
    rig.leftArm.rotation.x = -0.45 + stride * 0.4;
    rig.leftArm.rotation.z = 0.28;
    rig.leftLeg.rotation.x = stride;
    rig.rightLeg.rotation.x = -stride;
  } else if (pose === 'celebrate') {
    rig.rightArm.rotation.x = -2.7 + Math.sin(time * 10) * 0.25;
    rig.leftArm.rotation.x = -2.7 - Math.sin(time * 10) * 0.25;
    rig.leftLeg.rotation.x = 0;
    rig.rightLeg.rotation.x = 0;
  } else {
    rig.leftLeg.rotation.x = stride;
    rig.rightLeg.rotation.x = -stride;
    rig.leftArm.rotation.x = -stride * 0.85;
    rig.rightArm.rotation.x = stride * 0.85;
    rig.leftArm.rotation.z = 0.1;
    rig.rightArm.rotation.z = -0.1;
  }
}

export function updatePlayerFloorRing(
  rig: ArticulatedPlayerRig,
  opts: {
    visible: boolean;
    isControlled: boolean;
    isPrimaryDefender: boolean;
    stamina: number; // 0..100
    streak: number;
    showShotMeter: boolean;
    shotFill: number;
    matchupAngle?: number | null;
    teamColor: string;
  }
): void {
  rig.floorRingGroup.visible = opts.visible;
  if (!opts.visible) return;

  const outerMat = rig.outerRingMesh.material as THREE.MeshBasicMaterial;
  outerMat.color.set(opts.isControlled ? opts.teamColor : opts.isPrimaryDefender ? '#38bdf8' : '#94a3b8');
  outerMat.opacity = opts.isControlled ? 0.96 : opts.isPrimaryDefender ? 0.7 : 0.25;

  // Stamina arc color transitions yellow -> orange -> flashing red
  rig.staminaArcMesh.visible = opts.isControlled;
  if (opts.isControlled) {
    const s = Math.max(0.05, Math.min(1, opts.stamina / 100));
    rig.staminaArcMesh.scale.set(1, 1, 1);
    const sMat = rig.staminaArcMesh.material as THREE.MeshBasicMaterial;
    if (s > 0.55) sMat.color.set('#facc15');
    else if (s > 0.25) sMat.color.set('#f97316');
    else sMat.color.set('#ef4444');
    sMat.opacity = s < 0.25 ? 0.55 + Math.abs(Math.sin(performance.now() * 0.014)) * 0.45 : 0.92;
    rig.staminaArcMesh.rotation.y = (1 - s) * Math.PI * 0.5;
  }

  // Optional 3D Floor Shot Timing Meter
  rig.shotArcBg.visible = opts.isControlled && opts.showShotMeter;
  rig.shotArcFill.visible = opts.isControlled && opts.showShotMeter;
  if (opts.isControlled && opts.showShotMeter) {
    const fillMat = rig.shotArcFill.material as THREE.MeshBasicMaterial;
    const distGreen = Math.abs(opts.shotFill - 0.82);
    fillMat.color.set(distGreen < 0.065 ? '#22c55e' : distGreen < 0.16 ? '#facc15' : '#ef4444');
    rig.shotArcFill.rotation.y = -Math.PI * 0.45 + Math.min(1.1, opts.shotFill) * Math.PI * 0.45;
  }

  // Matchup Arrow
  if (opts.matchupAngle !== null && opts.matchupAngle !== undefined && opts.isControlled) {
    rig.matchupArrow.visible = true;
    const r = 0.88;
    rig.matchupArrow.position.set(Math.sin(opts.matchupAngle) * r, 0.008, Math.cos(opts.matchupAngle) * r);
    rig.matchupArrow.rotation.y = opts.matchupAngle;
  } else {
    rig.matchupArrow.visible = false;
  }

  // Hot / Cold Badge
  if (opts.streak >= 2) {
    rig.hotBadgeMesh.visible = true;
    (rig.hotBadgeMesh.material as THREE.MeshBasicMaterial).color.set('#ef4444');
  } else if (opts.streak <= -3) {
    rig.hotBadgeMesh.visible = true;
    (rig.hotBadgeMesh.material as THREE.MeshBasicMaterial).color.set('#38bdf8');
  } else {
    rig.hotBadgeMesh.visible = false;
  }
}
