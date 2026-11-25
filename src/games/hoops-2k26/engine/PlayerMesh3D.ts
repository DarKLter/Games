// ============================================================================
// PART 3 — ARTICULATED 3D PLAYER MESH (PlayerMesh3D.ts)
// Scaled by exact heightInches, weightLbs & wingspanInches from Part 2 DB.
// Features all 7 hairstyles, headband, sleeves, tights, sneakers, contact
// shadow, dynamic jersey textures, and all 20 ProPLAY animation states.
// ============================================================================

import * as THREE from 'three';
import type { JerseyVariant } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';
import {
  computePlayerProportions,
  type PlayerProportions,
  type PlayerRenderState,
} from './courtTypes';
import { JerseyTextureCache, resolveJerseyPalette } from './CourtTextures';

const _tmpVec = new THREE.Vector3();

function safeColor(hex: string | undefined, fallback: number): THREE.Color {
  try {
    return new THREE.Color(hex || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

export class PlayerMesh3D {
  public readonly root = new THREE.Group();
  private readonly bodyGroup = new THREE.Group();
  private readonly torsoMesh: THREE.Mesh;
  private readonly headGroup = new THREE.Group();
  private readonly leftArmPivot = new THREE.Group();
  private readonly rightArmPivot = new THREE.Group();
  private readonly leftForearmPivot = new THREE.Group();
  private readonly rightForearmPivot = new THREE.Group();
  private readonly leftHandTip = new THREE.Object3D();
  private readonly rightHandTip = new THREE.Object3D();
  private readonly leftLegPivot = new THREE.Group();
  private readonly rightLegPivot = new THREE.Group();
  private readonly leftShinPivot = new THREE.Group();
  private readonly rightShinPivot = new THREE.Group();
  private readonly shadowMesh: THREE.Mesh;

  private readonly props: PlayerProportions;
  private readonly ownedGeos: THREE.BufferGeometry[] = [];
  private readonly ownedMats: THREE.Material[] = [];

  constructor(
    player: PlayerRenderState,
    team: TeamData,
    jerseyVariant: JerseyVariant,
    jerseyCache: JerseyTextureCache
  ) {
    this.props = computePlayerProportions(
      player.heightInches,
      player.weightLbs,
      player.wingspanInches
    );
    const { heightScale, widthScale, armScale, legLength, torsoHeight, shoulderWidth } =
      this.props;
    const pal = resolveJerseyPalette(team, jerseyVariant);
    const app = player.appearance;

    const skinMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(app.skinTone, 0x8d5524),
        roughness: 0.62,
        metalness: 0.04,
      })
    );
    const hairMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(app.hairColor, 0x18181b),
        roughness: 0.85,
      })
    );
    const jerseyTex = jerseyCache.getJerseyTexture(
      team,
      jerseyVariant,
      player.jerseyNumber,
      player.lastName
    );
    const jerseyMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: jerseyTex,
        roughness: 0.72,
        metalness: 0.05,
      })
    );
    const shortsMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(pal.shorts, 0x1d4ed8),
        roughness: 0.76,
      })
    );
    const trimMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(pal.trim, 0xf59e0b),
        roughness: 0.55,
      })
    );
    const shoeMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(app.shoeColor, 0xf8fafc),
        roughness: 0.42,
        metalness: 0.12,
      })
    );
    const accMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: safeColor(pal.trim, 0x111827),
        roughness: 0.65,
      })
    );

    // Contact shadow disc grounded at y = 0.015
    const shadowGeo = this.trackGeo(new THREE.CircleGeometry(0.42 * widthScale, 20));
    const shadowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      })
    );
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.016;
    this.root.add(this.shadowMesh);

    this.root.add(this.bodyGroup);

    // Pelvis / Shorts
    const hipY = legLength;
    const shortsH = 0.25 * heightScale;
    const shortsGeo = this.trackGeo(
      new THREE.CylinderGeometry(
        0.18 * widthScale,
        0.21 * widthScale,
        shortsH,
        12
      )
    );
    const shortsMesh = new THREE.Mesh(shortsGeo, shortsMat);
    shortsMesh.position.y = hipY;
    shortsMesh.castShadow = true;
    this.bodyGroup.add(shortsMesh);

    // Torso (Jersey Cylinder — rotated so front faces +X)
    const torsoGeo = this.trackGeo(
      new THREE.CylinderGeometry(
        0.21 * widthScale,
        0.175 * widthScale,
        torsoHeight,
        14
      )
    );
    this.torsoMesh = new THREE.Mesh(torsoGeo, jerseyMat);
    this.torsoMesh.position.y = hipY + shortsH * 0.42 + torsoHeight * 0.5;
    this.torsoMesh.rotation.y = Math.PI / 2;
    this.torsoMesh.castShadow = true;
    this.bodyGroup.add(this.torsoMesh);

    // Neck & Head
    const shoulderY = hipY + shortsH * 0.42 + torsoHeight;
    const neckGeo = this.trackGeo(new THREE.CylinderGeometry(0.065, 0.075, 0.1 * heightScale, 8));
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = shoulderY + 0.04 * heightScale;
    this.bodyGroup.add(neckMesh);

    this.headGroup.position.set(0, shoulderY + 0.19 * heightScale, 0);
    const headGeo = this.trackGeo(new THREE.SphereGeometry(0.125 * Math.pow(heightScale, 0.5), 14, 12));
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Headband if enabled
    if (app.headband) {
      const bandGeo = this.trackGeo(new THREE.TorusGeometry(0.122, 0.018, 6, 18));
      const bandMesh = new THREE.Mesh(bandGeo, trimMat);
      bandMesh.rotation.x = Math.PI / 2;
      bandMesh.position.y = 0.038;
      this.headGroup.add(bandMesh);
    }

    // All Hairstyles (BALD, BUZZ, SHORT, FADE, AFRO, DREADS, BRAIDS, PONYTAIL)
    this.attachHairstyle(app.hairStyle, hairMat);
    this.bodyGroup.add(this.headGroup);

    // Arms (Left = -Z side, Right = +Z side when facing +X)
    const upperArmL = 0.31 * armScale;
    const foreArmL = 0.29 * armScale;
    const armRadius = 0.052 * widthScale;

    this.leftArmPivot.position.set(0, shoulderY - 0.04, -shoulderWidth * 0.54);
    this.rightArmPivot.position.set(0, shoulderY - 0.04, shoulderWidth * 0.54);

    const buildArm = (
      shoulderPivot: THREE.Group,
      forePivot: THREE.Group,
      handTip: THREE.Object3D,
      hasSleeve: boolean
    ) => {
      const uGeo = this.trackGeo(
        new THREE.CylinderGeometry(armRadius * 1.05, armRadius * 0.9, upperArmL, 8)
      );
      const uMesh = new THREE.Mesh(uGeo, hasSleeve ? accMat : skinMat);
      uMesh.position.y = -upperArmL * 0.5;
      uMesh.castShadow = true;
      shoulderPivot.add(uMesh);

      forePivot.position.set(0, -upperArmL, 0);
      const fGeo = this.trackGeo(
        new THREE.CylinderGeometry(armRadius * 0.88, armRadius * 0.72, foreArmL, 8)
      );
      const fMesh = new THREE.Mesh(fGeo, hasSleeve ? accMat : skinMat);
      fMesh.position.y = -foreArmL * 0.5;
      fMesh.castShadow = true;
      forePivot.add(fMesh);

      const hGeo = this.trackGeo(new THREE.SphereGeometry(armRadius * 0.85, 8, 8));
      const hMesh = new THREE.Mesh(hGeo, skinMat);
      hMesh.position.y = -foreArmL;
      forePivot.add(hMesh);

      handTip.position.set(0, -foreArmL - 0.04, 0);
      forePivot.add(handTip);
      shoulderPivot.add(forePivot);
      this.bodyGroup.add(shoulderPivot);
    };

    buildArm(
      this.leftArmPivot,
      this.leftForearmPivot,
      this.leftHandTip,
      app.armSleeve === 'LEFT' || app.armSleeve === 'BOTH'
    );
    buildArm(
      this.rightArmPivot,
      this.rightForearmPivot,
      this.rightHandTip,
      app.armSleeve === 'RIGHT' || app.armSleeve === 'BOTH'
    );

    // Legs & Sneakers
    const thighL = legLength * 0.5;
    const shinL = legLength * 0.45;
    const legR = 0.072 * widthScale;

    this.leftLegPivot.position.set(0, hipY - 0.04, -0.11 * widthScale);
    this.rightLegPivot.position.set(0, hipY - 0.04, 0.11 * widthScale);

    const buildLeg = (hipPivot: THREE.Group, shinPivot: THREE.Group) => {
      const tGeo = this.trackGeo(new THREE.CylinderGeometry(legR, legR * 0.85, thighL, 8));
      const tMesh = new THREE.Mesh(tGeo, app.legCompression ? accMat : skinMat);
      tMesh.position.y = -thighL * 0.5;
      tMesh.castShadow = true;
      hipPivot.add(tMesh);

      shinPivot.position.set(0, -thighL, 0);
      const sGeo = this.trackGeo(new THREE.CylinderGeometry(legR * 0.8, legR * 0.65, shinL, 8));
      const sMesh = new THREE.Mesh(sGeo, app.legCompression ? accMat : skinMat);
      sMesh.position.y = -shinL * 0.5;
      sMesh.castShadow = true;
      shinPivot.add(sMesh);

      const shoeGeo = this.trackGeo(new THREE.BoxGeometry(0.26 * heightScale, 0.09, 0.12 * widthScale));
      const shoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      shoeMesh.position.set(0.05, -shinL - 0.03, 0);
      shoeMesh.castShadow = true;
      shinPivot.add(shoeMesh);

      hipPivot.add(shinPivot);
      this.bodyGroup.add(hipPivot);
    };

    buildLeg(this.leftLegPivot, this.leftShinPivot);
    buildLeg(this.rightLegPivot, this.rightShinPivot);
  }

  private trackGeo<T extends THREE.BufferGeometry>(g: T): T {
    this.ownedGeos.push(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMats.push(m);
    return m;
  }

  private attachHairstyle(style: PlayerRenderState['appearance']['hairStyle'], mat: THREE.Material): void {
    if (style === 'BALD') return;
    if (style === 'BUZZ' || style === 'SHORT') {
      const g = this.trackGeo(new THREE.SphereGeometry(0.128, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52));
      const m = new THREE.Mesh(g, mat);
      m.position.y = 0.006;
      this.headGroup.add(m);
      return;
    }
    if (style === 'FADE') {
      const g = this.trackGeo(new THREE.CylinderGeometry(0.105, 0.118, 0.068, 12));
      const m = new THREE.Mesh(g, mat);
      m.position.y = 0.115;
      this.headGroup.add(m);
      return;
    }
    if (style === 'AFRO') {
      const g = this.trackGeo(new THREE.SphereGeometry(0.175, 14, 12));
      const m = new THREE.Mesh(g, mat);
      m.position.set(-0.015, 0.068, 0);
      this.headGroup.add(m);
      return;
    }
    if (style === 'DREADS' || style === 'BRAIDS') {
      const count = style === 'DREADS' ? 8 : 6;
      const len = style === 'DREADS' ? 0.19 : 0.15;
      const capGeo = this.trackGeo(new THREE.SphereGeometry(0.126, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5));
      this.headGroup.add(new THREE.Mesh(capGeo, mat));
      const strandGeo = this.trackGeo(new THREE.CylinderGeometry(0.018, 0.014, len, 6));
      for (let i = 0; i < count; i++) {
        const ang = Math.PI * 0.55 + (i / Math.max(1, count - 1)) * Math.PI * 0.9;
        const s = new THREE.Mesh(strandGeo, mat);
        s.position.set(Math.cos(ang) * 0.11, -0.02, Math.sin(ang) * 0.11);
        s.rotation.z = 0.25;
        this.headGroup.add(s);
      }
      return;
    }
    if (style === 'PONYTAIL') {
      const capGeo = this.trackGeo(new THREE.SphereGeometry(0.128, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55));
      this.headGroup.add(new THREE.Mesh(capGeo, mat));
      const tailGeo = this.trackGeo(new THREE.ConeGeometry(0.048, 0.22, 8));
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.position.set(-0.145, 0.02, 0);
      tail.rotation.z = -2.35;
      this.headGroup.add(tail);
    }
  }

  public update(state: PlayerRenderState): void {
    this.root.visible = state.visible;
    if (!state.visible) return;

    this.root.position.set(state.x, 0, state.z);
    this.bodyGroup.position.y = Math.max(0, state.y);
    this.bodyGroup.rotation.y = state.facingRad;

    // Ground contact shadow shrinks subtly as player jumps
    const jumpScale = Math.max(0.42, 1 - state.y * 0.34);
    this.shadowMesh.scale.set(jumpScale, jumpScale, 1);

    const p = state.animPhase;
    const sp = state.shotProgress;

    // Reset default neutral pose before applying active ProPLAY animation
    this.bodyGroup.rotation.z = 0;
    this.bodyGroup.rotation.x = 0;
    this.leftArmPivot.rotation.set(0, 0, 0.15);
    this.rightArmPivot.rotation.set(0, 0, 0.15);
    this.leftForearmPivot.rotation.set(0, 0, 0.35);
    this.rightForearmPivot.rotation.set(0, 0, 0.35);
    this.leftLegPivot.rotation.set(0, 0, 0);
    this.rightLegPivot.rotation.set(0, 0, 0);
    this.leftShinPivot.rotation.set(0, 0, 0);
    this.rightShinPivot.rotation.set(0, 0, 0);

    switch (state.animState) {
      case 'RUN':
      case 'SPRINT': {
        const amp = state.animState === 'SPRINT' ? 0.85 : 0.58;
        const stride = Math.sin(p);
        this.bodyGroup.rotation.z = state.animState === 'SPRINT' ? -0.18 : -0.09;
        this.leftLegPivot.rotation.z = stride * amp;
        this.rightLegPivot.rotation.z = -stride * amp;
        this.leftShinPivot.rotation.z = Math.max(0, -stride * 0.75);
        this.rightShinPivot.rotation.z = Math.max(0, stride * 0.75);
        this.leftArmPivot.rotation.z = -stride * amp * 0.8;
        this.rightArmPivot.rotation.z = stride * amp * 0.8;
        this.leftForearmPivot.rotation.z = 0.8;
        this.rightForearmPivot.rotation.z = 0.8;
        break;
      }

      case 'DRIBBLE_RIGHT':
      case 'DRIBBLE_LEFT':
      case 'CROSSOVER': {
        const stride = Math.sin(p) * 0.42;
        const bounce = Math.abs(Math.sin(p * 1.4));
        const rightActive =
          state.animState === 'DRIBBLE_RIGHT' ||
          (state.animState === 'CROSSOVER' && Math.sin(p * 0.9) > 0);
        this.bodyGroup.rotation.z = -0.14;
        this.leftLegPivot.rotation.z = stride;
        this.rightLegPivot.rotation.z = -stride;
        if (rightActive) {
          this.rightArmPivot.rotation.z = 0.55 + bounce * 0.35;
          this.rightForearmPivot.rotation.z = 0.65 - bounce * 0.45;
          this.leftArmPivot.rotation.z = 0.35;
          this.leftArmPivot.rotation.x = 0.35; // protect arm
        } else {
          this.leftArmPivot.rotation.z = 0.55 + bounce * 0.35;
          this.leftForearmPivot.rotation.z = 0.65 - bounce * 0.45;
          this.rightArmPivot.rotation.z = 0.35;
          this.rightArmPivot.rotation.x = -0.35;
        }
        break;
      }

      case 'QUICK_PROTECT': {
        this.bodyGroup.rotation.z = -0.22;
        this.leftLegPivot.rotation.z = 0.35;
        this.rightLegPivot.rotation.z = -0.35;
        this.leftArmPivot.rotation.set(0.55, 0, 0.85);
        this.rightArmPivot.rotation.set(-0.25, 0, 0.65);
        this.rightForearmPivot.rotation.z = 1.0;
        break;
      }

      case 'STEPBACK': {
        this.bodyGroup.rotation.z = 0.18;
        this.leftLegPivot.rotation.z = -0.5;
        this.rightLegPivot.rotation.z = 0.45;
        this.rightArmPivot.rotation.z = 1.65;
        this.leftArmPivot.rotation.z = 1.2;
        break;
      }

      case 'JUMPSHOT':
      case 'FLOATER': {
        const raise = Math.min(1, sp * 1.35);
        const flick = sp > 0.72 ? (sp - 0.72) / 0.28 : 0;
        this.bodyGroup.rotation.z = 0.08 * raise;
        this.rightArmPivot.rotation.z = 0.4 + raise * 2.15;
        this.rightForearmPivot.rotation.z = 0.9 - flick * 0.65;
        this.leftArmPivot.rotation.z = 0.3 + raise * 1.75;
        this.leftForearmPivot.rotation.z = 0.85;
        this.leftLegPivot.rotation.z = -0.18 * raise;
        this.rightLegPivot.rotation.z = 0.14 * raise;
        break;
      }

      case 'LAYUP':
      case 'EURO_STEP': {
        const sideTilt = state.animState === 'EURO_STEP' ? Math.sin(p * 1.6) * 0.28 : 0.1;
        this.bodyGroup.rotation.x = sideTilt;
        this.rightArmPivot.rotation.z = 2.55;
        this.rightForearmPivot.rotation.z = 0.25;
        this.leftArmPivot.rotation.z = 0.65;
        this.rightLegPivot.rotation.z = 0.65;
        this.rightShinPivot.rotation.z = -0.8;
        break;
      }

      case 'DUNK': {
        this.bodyGroup.rotation.z = -0.24;
        this.rightArmPivot.rotation.z = 2.85;
        this.leftArmPivot.rotation.z = 2.45;
        this.rightForearmPivot.rotation.z = 0.2;
        this.leftForearmPivot.rotation.z = 0.3;
        this.leftLegPivot.rotation.z = -0.55;
        this.rightLegPivot.rotation.z = 0.48;
        this.leftShinPivot.rotation.z = -0.75;
        break;
      }

      case 'RIM_HANG': {
        this.bodyGroup.rotation.z = 0.15;
        this.rightArmPivot.rotation.z = 3.05;
        this.leftArmPivot.rotation.z = 3.05;
        this.leftLegPivot.rotation.z = 0.52;
        this.rightLegPivot.rotation.z = 0.42;
        this.leftShinPivot.rotation.z = -0.9;
        this.rightShinPivot.rotation.z = -0.85;
        break;
      }

      case 'DEFENSIVE_SLIDE': {
        const sw = Math.sin(p) * 0.25;
        this.bodyGroup.rotation.z = -0.24;
        this.leftLegPivot.rotation.x = 0.32 + sw;
        this.rightLegPivot.rotation.x = -0.32 - sw;
        this.leftArmPivot.rotation.set(0.95, 0, 0.55);
        this.rightArmPivot.rotation.set(-0.95, 0, 0.55);
        break;
      }

      case 'HANDS_UP_CONTEST':
      case 'JUMP_BLOCK':
      case 'REBOUND_SNAG': {
        this.rightArmPivot.rotation.z = 2.85;
        this.leftArmPivot.rotation.z = state.animState === 'HANDS_UP_CONTEST' ? 2.55 : 2.85;
        this.leftLegPivot.rotation.z = -0.2;
        this.rightLegPivot.rotation.z = 0.2;
        break;
      }

      case 'ANKLE_BROKEN_STUMBLE': {
        const wob = Math.sin(p * 2.4);
        this.bodyGroup.rotation.z = 0.42 + wob * 0.16;
        this.bodyGroup.rotation.x = wob * 0.32;
        this.leftArmPivot.rotation.set(0.8, 0, 1.4);
        this.rightArmPivot.rotation.set(-0.8, 0, 1.4);
        this.leftLegPivot.rotation.z = -0.5;
        this.rightLegPivot.rotation.z = 0.55;
        break;
      }

      case 'CELEBRATE': {
        const pump = Math.abs(Math.sin(p * 2.2));
        this.rightArmPivot.rotation.z = 2.1 + pump * 0.7;
        this.leftArmPivot.rotation.z = 2.1 + pump * 0.7;
        this.rightArmPivot.rotation.x = -0.45;
        this.leftArmPivot.rotation.x = 0.45;
        break;
      }

      case 'IDLE':
      default: {
        const breathe = Math.sin(p * 0.8) * 0.04;
        this.leftArmPivot.rotation.z = 0.2 + breathe;
        this.rightArmPivot.rotation.z = 0.2 + breathe;
        break;
      }
    }
  }

  public getHandWorldPos(hand: 'left' | 'right', out: THREE.Vector3): THREE.Vector3 {
    this.root.updateMatrixWorld(true);
    const tip = hand === 'left' ? this.leftHandTip : this.rightHandTip;
    tip.getWorldPosition(_tmpVec);
    return out.copy(_tmpVec);
  }

  public dispose(): void {
    this.ownedGeos.forEach((g) => g.dispose());
    this.ownedMats.forEach((m) => m.dispose());
  }
}
