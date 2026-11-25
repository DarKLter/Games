// ============================================================================
// PART 3 — ON-COURT 3D FLOOR OVERLAYS (CourtOverlays3D.ts)
// Active Player Ring (Cyan 2K26 / Crimson 2K14), Stamina Arc, 3 Adrenaline
// Pips, Takeover Flame Ring, Who-To-Guard dotted arrow, 2K14 Shot Quality
// dots, Animated PlayVision 3D Floor Art, 9-Wedge Hot/Cold Heatmap, and
// Marked Enemy Star tactical reticle (DOUBLE / DENY / OVER / PACK).
// ============================================================================

import * as THREE from 'three';
import type { UIEraMode } from '../hybrid/types';
import {
  COURT_DIMS,
  getActiveRingColorHex,
  hotZoneColorHex,
  type CourtVisualConfig,
  type MatchRenderState,
  type PlayVisionPlayId,
} from './courtTypes';

const Y_FLOOR = 0.022;

function createTextBadgeTexture(text: string, bgHex: string, fgHex = '#ffffff'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(4, 4, 248, 56);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);
  ctx.fillStyle = fgHex;
  ctx.font = '900 30px Impact, Arial Black, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export class CourtOverlays3D {
  public readonly root = new THREE.Group();

  // Active User Player Ring Cluster
  private readonly userCluster = new THREE.Group();
  private readonly activeRingMat: THREE.MeshBasicMaterial;
  private readonly staminaMesh: THREE.Mesh;
  private readonly staminaMat: THREE.MeshBasicMaterial;
  private readonly pipMeshes: THREE.Mesh[] = [];
  private readonly takeoverRing: THREE.Mesh;
  private readonly takeoverMat: THREE.MeshBasicMaterial;
  private readonly shotQualityDot: THREE.Mesh;
  private readonly shotQualityMat: THREE.MeshBasicMaterial;

  // Who-To-Guard Arrow
  private readonly guardArrow: THREE.Mesh;

  // Marked Enemy Star Reticle
  private readonly markCluster = new THREE.Group();
  private readonly markRing: THREE.Mesh;
  private readonly markLabelMat: THREE.SpriteMaterial;
  private readonly markTextures: Record<string, THREE.CanvasTexture> = {};
  private lastMarkTag = '';

  // PlayVision 3D Floor Art
  private readonly playVisionGroup = new THREE.Group();
  private readonly playVisionLines: THREE.Line[] = [];
  private readonly playVisionMarkers: THREE.Mesh[] = [];
  private currentPlayId: PlayVisionPlayId = 'OFF';
  private currentPlayDir: 1 | -1 = 1;

  // 9-Wedge Hot / Cold Floor Heatmap
  private readonly hotZoneGroup = new THREE.Group();
  private readonly hotZoneMeshes: Array<{ key: keyof MatchRenderState['players'][0]['hotZones']; mat: THREE.MeshBasicMaterial }> = [];

  private readonly ownedGeos: THREE.BufferGeometry[] = [];
  private readonly ownedMats: THREE.Material[] = [];

  constructor() {
    // 1. Active Player Ring + Stamina Arc + 3 Adrenaline Pips + Takeover Flame Ring
    const ringGeo = this.trackGeo(new THREE.RingGeometry(0.56, 0.72, 32));
    this.activeRingMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      })
    );
    const activeRing = new THREE.Mesh(ringGeo, this.activeRingMat);
    activeRing.rotation.x = -Math.PI / 2;
    this.userCluster.add(activeRing);

    // Stamina Arc (outer thin ring scaled dynamically)
    const stamGeo = this.trackGeo(new THREE.RingGeometry(0.75, 0.83, 28, 1, 0, Math.PI * 1.4));
    this.staminaMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.86,
        depthWrite: false,
      })
    );
    this.staminaMesh = new THREE.Mesh(stamGeo, this.staminaMat);
    this.staminaMesh.rotation.x = -Math.PI / 2;
    this.userCluster.add(this.staminaMesh);

    // 3 Adrenaline Pips
    const pipGeo = this.trackGeo(new THREE.CircleGeometry(0.085, 12));
    for (let i = 0; i < 3; i++) {
      const pipMat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0xfacc15,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        })
      );
      const pip = new THREE.Mesh(pipGeo, pipMat);
      pip.rotation.x = -Math.PI / 2;
      const ang = -0.35 + i * 0.35;
      pip.position.set(Math.cos(ang) * 0.96, 0.004, Math.sin(ang) * 0.96);
      this.pipMeshes.push(pip);
      this.userCluster.add(pip);
    }

    // Takeover Flame Ring
    const tkGeo = this.trackGeo(new THREE.RingGeometry(0.84, 1.04, 32));
    this.takeoverMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xf97316,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      })
    );
    this.takeoverRing = new THREE.Mesh(tkGeo, this.takeoverMat);
    this.takeoverRing.rotation.x = -Math.PI / 2;
    this.userCluster.add(this.takeoverRing);

    // 2K14 Shot Quality Dot (Green/Yellow/Red)
    const sqGeo = this.trackGeo(new THREE.CircleGeometry(0.13, 14));
    this.shotQualityMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    this.shotQualityDot = new THREE.Mesh(sqGeo, this.shotQualityMat);
    this.shotQualityDot.rotation.x = -Math.PI / 2;
    this.shotQualityDot.position.set(0.92, 0.005, 0);
    this.userCluster.add(this.shotQualityDot);

    this.userCluster.position.y = Y_FLOOR + 0.004;
    this.root.add(this.userCluster);

    // 2. Who-To-Guard Arrow
    const arrowGeo = this.trackGeo(new THREE.PlaneGeometry(0.22, 1.1));
    const arrowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
      })
    );
    this.guardArrow = new THREE.Mesh(arrowGeo, arrowMat);
    this.guardArrow.rotation.x = -Math.PI / 2;
    this.guardArrow.position.y = Y_FLOOR + 0.003;
    this.root.add(this.guardArrow);

    // 3. Marked Enemy Star Reticle (DOUBLE / DENY / OVER / PACK)
    const markGeo = this.trackGeo(new THREE.RingGeometry(0.66, 0.84, 24));
    const markMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    this.markRing = new THREE.Mesh(markGeo, markMat);
    this.markRing.rotation.x = -Math.PI / 2;
    this.markCluster.add(this.markRing);

    this.markTextures.DOUBLE = createTextBadgeTexture('DOUBLE TEAM', '#dc2626');
    this.markTextures.DENY = createTextBadgeTexture('DENY BALL', '#ea580c');
    this.markTextures.OVER = createTextBadgeTexture('GO OVER', '#2563eb');
    this.markTextures.PACK = createTextBadgeTexture('PACK PAINT', '#7c3aed');

    this.markLabelMat = this.trackMat(
      new THREE.SpriteMaterial({
        map: this.markTextures.OVER,
        transparent: true,
        depthTest: false,
      })
    );
    const labelSprite = new THREE.Sprite(this.markLabelMat);
    labelSprite.position.set(0, 2.55, 0);
    labelSprite.scale.set(1.45, 0.36, 1);
    this.markCluster.add(labelSprite);
    this.markCluster.position.y = Y_FLOOR + 0.005;
    this.root.add(this.markCluster);

    // 4. PlayVision 3D Floor Art Group
    this.playVisionGroup.position.y = Y_FLOOR + 0.006;
    this.root.add(this.playVisionGroup);

    // 5. 9-Wedge Hot / Cold Floor Heatmap
    this.buildHotZonePads();
    this.hotZoneGroup.position.y = Y_FLOOR;
    this.root.add(this.hotZoneGroup);
  }

  private trackGeo<T extends THREE.BufferGeometry>(g: T): T {
    this.ownedGeos.push(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.ownedMats.push(m);
    return m;
  }

  private buildHotZonePads(): void {
    // 9 court zones positioned relative to +X halfcourt (flipped by scale.x = attackDirX)
    const specs: Array<{
      key: keyof MatchRenderState['players'][0]['hotZones'];
      x: number;
      z: number;
      rx: number;
      rz: number;
    }> = [
      { key: 'paint', x: 11.4, z: 0, rx: 1.85, rz: 1.95 },
      { key: 'leftMid', x: 9.2, z: -3.8, rx: 1.7, rz: 1.6 },
      { key: 'topMid', x: 7.4, z: 0, rx: 1.75, rz: 1.9 },
      { key: 'rightMid', x: 9.2, z: 3.8, rx: 1.7, rz: 1.6 },
      { key: 'leftCorner3', x: 12.2, z: -6.8, rx: 1.75, rz: 0.85 },
      { key: 'rightCorner3', x: 12.2, z: 6.8, rx: 1.75, rz: 0.85 },
      { key: 'leftWing3', x: 6.6, z: -5.8, rx: 2.1, rz: 1.45 },
      { key: 'topKey3', x: 4.7, z: 0, rx: 1.8, rz: 2.4 },
      { key: 'rightWing3', x: 6.6, z: 5.8, rx: 2.1, rz: 1.45 },
    ];

    for (const sp of specs) {
      const geo = this.trackGeo(new THREE.CircleGeometry(1, 20));
      const mat = this.trackMat(
        new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.24,
          depthWrite: false,
        })
      );
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.scale.set(sp.rx, sp.rz, 1);
      mesh.position.set(sp.x, 0, sp.z);
      this.hotZoneGroup.add(mesh);
      this.hotZoneMeshes.push({ key: sp.key, mat });
    }
  }

  private rebuildPlayVision(play: PlayVisionPlayId, dir: 1 | -1): void {
    // Dispose previous play geometries/materials cleanly
    while (this.playVisionGroup.children.length > 0) {
      const ch = this.playVisionGroup.children.pop()!;
      if (ch instanceof THREE.Line || ch instanceof THREE.Mesh) {
        ch.geometry.dispose();
        if (Array.isArray(ch.material)) ch.material.forEach((m) => m.dispose());
        else ch.material.dispose();
      }
    }
    this.playVisionLines.length = 0;
    this.playVisionMarkers.length = 0;
    this.currentPlayId = play;
    this.currentPlayDir = dir;

    if (play === 'OFF') return;

    const routes: Array<{ pts: Array<[number, number]>; color: number; screenEnd?: boolean }> = [];
    if (play === 'PICK_AND_ROLL') {
      routes.push({ pts: [[3.8, 0.2], [6.6, 1.4], [9.8, 2.2]], color: 0x22d3ee });
      routes.push({ pts: [[10.4, 2.1], [6.8, 1.1], [11.2, 0.3]], color: 0xfacc15, screenEnd: true });
      routes.push({ pts: [[7.8, -5.6], [11.6, -6.5]], color: 0x38bdf8 });
    } else if (play === 'FIVE_OUT') {
      routes.push({ pts: [[3.8, 0.2], [5.8, -3.5], [8.5, -5.6]], color: 0x22d3ee });
      routes.push({ pts: [[7.6, 5.6], [11.8, 6.6]], color: 0x38bdf8 });
      routes.push({ pts: [[9.6, -2.8], [5.6, -5.4]], color: 0xfacc15 });
    } else if (play === 'MOTION_CUT') {
      routes.push({ pts: [[7.8, -5.6], [9.8, -1.8], [11.2, 0.4]], color: 0x22d3ee });
      routes.push({ pts: [[7.6, 5.6], [5.6, 2.2], [7.2, -4.8]], color: 0x38bdf8 });
      routes.push({ pts: [[9.6, -2.4], [8.2, -1.4]], color: 0xfacc15, screenEnd: true });
    } else if (play === 'HORNS') {
      routes.push({ pts: [[9.6, -2.8], [6.5, -2.0]], color: 0xfacc15, screenEnd: true });
      routes.push({ pts: [[10.8, 1.9], [6.5, 2.0]], color: 0xfacc15, screenEnd: true });
      routes.push({ pts: [[3.8, 0.2], [7.2, -1.6], [10.6, -0.8]], color: 0x22d3ee });
    } else if (play === 'FLOPPY') {
      routes.push({ pts: [[10.8, 0.2], [9.2, -2.5], [6.8, -5.4]], color: 0x22d3ee });
      routes.push({ pts: [[10.6, 1.8], [9.1, 2.6], [6.8, 5.4]], color: 0x38bdf8 });
      routes.push({ pts: [[8.8, -2.2], [8.8, -2.8]], color: 0xfacc15, screenEnd: true });
    }

    for (const r of routes) {
      const vecs = r.pts.map(([x, z]) => new THREE.Vector3(x * dir, 0, z));
      const curve = new THREE.CatmullRomCurve3(vecs);
      const sampled = curve.getPoints(24);
      const geo = new THREE.BufferGeometry().setFromPoints(sampled);
      const mat = new THREE.LineBasicMaterial({
        color: r.color,
        transparent: true,
        opacity: 0.88,
      });
      const line = new THREE.Line(geo, mat);
      this.playVisionGroup.add(line);
      this.playVisionLines.push(line);

      const endPt = vecs[vecs.length - 1];
      const markerGeo = r.screenEnd
        ? new THREE.RingGeometry(0.32, 0.48, 18)
        : new THREE.CircleGeometry(0.28, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: r.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(endPt.x, 0.002, endPt.z);
      this.playVisionGroup.add(marker);
      this.playVisionMarkers.push(marker);
    }
  }

  public update(
    state: MatchRenderState,
    visual: CourtVisualConfig,
    era: UIEraMode,
    elapsedSec: number
  ): void {
    const showIcons = visual.showPlayerIcons;
    const userPl = state.players.find((p) => p.isUserControlled && p.visible) || state.players[0];

    // 1. Active Player Floor Ring + Stamina + Adrenaline Pips + Takeover Flame
    this.userCluster.visible = showIcons && Boolean(userPl);
    if (userPl && showIcons) {
      this.userCluster.position.set(userPl.x, Y_FLOOR + 0.004, userPl.z);
      this.activeRingMat.color.setHex(getActiveRingColorHex(era));

      const stam = Math.max(0.08, Math.min(1, userPl.stamina));
      this.staminaMesh.scale.set(0.82 + stam * 0.22, 0.82 + stam * 0.22, 1);
      this.staminaMat.color.setHex(
        stam > 0.5 ? 0x22c55e : stam > 0.25 ? 0xf59e0b : 0xef4444
      );

      for (let i = 0; i < this.pipMeshes.length; i++) {
        this.pipMeshes[i].visible = i < userPl.adrenalinePips;
      }

      if (userPl.takeoverLevel >= 0.75) {
        this.takeoverRing.visible = true;
        const pulse = 1 + Math.sin(elapsedSec * 7.5) * 0.1;
        this.takeoverRing.scale.set(pulse, pulse, 1);
        this.takeoverMat.opacity = 0.45 + Math.sin(elapsedSec * 7.5) * 0.25;
      } else {
        this.takeoverRing.visible = false;
      }

      if (userPl.shotQuality2K14 === 'NONE') {
        this.shotQualityDot.visible = false;
      } else {
        this.shotQualityDot.visible = true;
        this.shotQualityMat.color.setHex(
          userPl.shotQuality2K14 === 'GREEN'
            ? 0x22c55e
            : userPl.shotQuality2K14 === 'YELLOW'
              ? 0xfacc15
              : 0xef4444
        );
      }

      // Who-To-Guard Dotted Indicator Arrow
      const guardTarget = state.players.find(
        (p) => p.id === userPl.guardTargetId && p.visible
      );
      if (guardTarget && userPl.teamSide !== state.possession) {
        this.guardArrow.visible = true;
        const dx = guardTarget.x - userPl.x;
        const dz = guardTarget.z - userPl.z;
        const ang = Math.atan2(dx, dz);
        this.guardArrow.position.set(
          userPl.x + Math.sin(ang) * 1.15,
          Y_FLOOR + 0.003,
          userPl.z + Math.cos(ang) * 1.15
        );
        this.guardArrow.rotation.z = -ang;
      } else {
        this.guardArrow.visible = false;
      }
    } else {
      this.guardArrow.visible = false;
    }

    // 2. Marked Enemy Star Tactical Reticle
    const markedPl = state.markedStar.playerId
      ? state.players.find((p) => p.id === state.markedStar.playerId && p.visible)
      : null;
    if (markedPl && showIcons) {
      this.markCluster.visible = true;
      this.markCluster.position.set(markedPl.x, Y_FLOOR + 0.005, markedPl.z);
      const pulse = 1 + Math.sin(elapsedSec * 5.2) * 0.08;
      this.markRing.scale.set(pulse, pulse, 1);
      if (this.lastMarkTag !== state.markedStar.tag) {
        this.lastMarkTag = state.markedStar.tag;
        const tex = this.markTextures[state.markedStar.tag] || this.markTextures.OVER;
        this.markLabelMat.map = tex;
        this.markLabelMat.needsUpdate = true;
      }
    } else {
      this.markCluster.visible = false;
    }

    // 3. PlayVision 3D Floor Art
    const desiredPlay = visual.playVision !== 'OFF' ? visual.playVision : state.activePlay;
    if (desiredPlay !== this.currentPlayId || state.attackDirX !== this.currentPlayDir) {
      this.rebuildPlayVision(desiredPlay, state.attackDirX);
    }
    if (this.playVisionMarkers.length > 0) {
      const mPulse = 0.92 + Math.sin(elapsedSec * 4.5) * 0.14;
      for (let i = 0; i < this.playVisionMarkers.length; i++) {
        this.playVisionMarkers[i].scale.set(mPulse, mPulse, 1);
      }
    }

    // 4. 9-Wedge Hot / Cold Floor Heatmap
    if (visual.hotColdZones === 'OFF') {
      this.hotZoneGroup.visible = false;
    } else {
      this.hotZoneGroup.visible = true;
      this.hotZoneGroup.scale.x = state.attackDirX;
      const handler =
        state.players.find((p) => p.hasBall && p.visible) || userPl || state.players[0];
      if (handler) {
        const hz = handler.hotZones;
        const baseAlpha = visual.hotColdZones === 'ALL' ? 0.34 : 0.24;
        for (let i = 0; i < this.hotZoneMeshes.length; i++) {
          const item = this.hotZoneMeshes[i];
          const zoneState = hz[item.key];
          item.mat.color.setHex(hotZoneColorHex(zoneState));
          item.mat.opacity =
            zoneState === 0 ? 0.07 : baseAlpha + Math.sin(elapsedSec * 2.5 + i) * 0.04;
        }
      }
    }
  }

  public dispose(): void {
    this.rebuildPlayVision('OFF', 1);
    this.ownedGeos.forEach((g) => g.dispose());
    this.ownedMats.forEach((m) => m.dispose());
    Object.values(this.markTextures).forEach((t) => t.dispose());
  }
}
