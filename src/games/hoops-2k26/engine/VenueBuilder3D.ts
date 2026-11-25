// ============================================================================
// PART 3 — 10-VENUE 3D ENVIRONMENT, PHYSICS HOOPS & CROWD BUILDER
// Builds all 5 main venues + 4 remastered 2K16 MyPARKs + Euro/W Arenas,
// 2 detailed regulation hoops with flexing rims, translucent glass backboards,
// Red LED buzzer strips, vertex-animated rippling nets (nylon & chain),
// InstancedMesh cheering crowds, 4-sided Jumbotron, and ambient outdoor props.
// ============================================================================

import * as THREE from 'three';
import type { MatchVenueId } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';
import {
  COURT_DIMS,
  isOutdoorVenue,
  isStreetAsphaltVenue,
  type HoopRenderState,
} from './courtTypes';
import {
  createCourtTextures,
  createJumbotronTexture,
  createScorerRibbonTexture,
} from './CourtTextures';

export interface BuiltVenue3D {
  root: THREE.Group;
  setHardwoodReflections: (enabled: boolean) => void;
  updateHoops: (hoops: HoopRenderState) => void;
  updateEnvironment: (elapsedSec: number, excitement: number) => void;
  updateJumbotron: (
    awayAbbr: string,
    awayPts: number,
    homeAbbr: string,
    homePts: number,
    clockText: string,
    banner: string
  ) => void;
  dispose: () => void;
}

interface HoopRig {
  side: -1 | 1;
  rimPivot: THREE.Group;
  netGeo: THREE.BufferGeometry;
  netBasePos: Float32Array;
  ledMat: THREE.MeshStandardMaterial;
}

function createHoopRig(
  side: -1 | 1,
  isChainNet: boolean,
  isOutdoor: boolean,
  primaryHex: string,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
  trackMat: <T extends THREE.Material>(m: T) => T
): { group: THREE.Group; rig: HoopRig } {
  const group = new THREE.Group();
  const baseX = side * (COURT_DIMS.HALF_LENGTH + 0.95);
  const boardX = side * COURT_DIMS.BACKBOARD_X;
  const rimX = side * COURT_DIMS.RIM_X;

  const poleMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: isOutdoor ? 0x334155 : 0x111827,
      roughness: 0.45,
      metalness: 0.55,
    })
  );
  const padMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryHex || '#e11d48'),
      roughness: 0.65,
    })
  );

  // Stanchion base & angled neck
  const baseBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.15, 1.35, 1.05)), padMat);
  baseBox.position.set(baseX + side * 0.45, 0.675, 0);
  baseBox.castShadow = true;
  group.add(baseBox);

  const post = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 3.5, 0.32)), poleMat);
  post.position.set(baseX + side * 0.35, 1.95, 0);
  post.castShadow = true;
  group.add(post);

  const armLen = Math.abs(baseX + side * 0.35 - boardX);
  const boom = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(armLen, 0.24, 0.24)), poleMat);
  boom.position.set((baseX + side * 0.35 + boardX) * 0.5, COURT_DIMS.BACKBOARD_Y, 0);
  group.add(boom);

  // Translucent Tempered Glass Backboard + White Shooter's Square
  const boardMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xe2f1ff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
      metalness: 0.1,
      reflectivity: 0.9,
    })
  );
  const boardMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.06, COURT_DIMS.BACKBOARD_H, COURT_DIMS.BACKBOARD_W)),
    boardMat
  );
  boardMesh.position.set(boardX, COURT_DIMS.BACKBOARD_Y, 0);
  group.add(boardMesh);

  // Red LED Buzzer Perimeter Strip around Backboard
  const ledMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3f1d24,
      emissive: 0xff1122,
      emissiveIntensity: 0.0,
      roughness: 0.3,
    })
  );
  const frameThick = 0.055;
  const topBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.075, frameThick, COURT_DIMS.BACKBOARD_W + 0.06)),
    ledMat
  );
  topBar.position.set(boardX, COURT_DIMS.BACKBOARD_Y + COURT_DIMS.BACKBOARD_H * 0.5, 0);
  group.add(topBar);

  const botBar = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.075, frameThick, COURT_DIMS.BACKBOARD_W + 0.06)),
    ledMat
  );
  botBar.position.set(boardX, COURT_DIMS.BACKBOARD_Y - COURT_DIMS.BACKBOARD_H * 0.5, 0);
  group.add(botBar);

  for (const zSign of [-1, 1] as const) {
    const sideBar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.075, COURT_DIMS.BACKBOARD_H + 0.06, frameThick)),
      ledMat
    );
    sideBar.position.set(
      boardX,
      COURT_DIMS.BACKBOARD_Y,
      zSign * (COURT_DIMS.BACKBOARD_W * 0.5)
    );
    group.add(sideBar);
  }

  // White Inner Shooter's Square
  const sqMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const sqW = 0.61;
  const sqH = 0.46;
  const sqY = COURT_DIMS.RIM_Y + 0.24;
  const sqX = boardX - side * 0.036;
  const sqTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.012, 0.03, sqW)), sqMat);
  sqTop.position.set(sqX, sqY + sqH * 0.5, 0);
  group.add(sqTop);
  const sqBot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.012, 0.03, sqW)), sqMat);
  sqBot.position.set(sqX, sqY - sqH * 0.5, 0);
  group.add(sqBot);
  for (const zs of [-1, 1] as const) {
    const sqSide = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.012, sqH, 0.03)), sqMat);
    sqSide.position.set(sqX, sqY, zs * sqW * 0.5);
    group.add(sqSide);
  }

  // Overhead Shot Clock Box
  const scBox = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.34, 0.65)), poleMat);
  scBox.position.set(boardX + side * 0.12, COURT_DIMS.BACKBOARD_Y + 0.78, 0);
  group.add(scBox);

  // Breakaway Flexing Rim Pivot anchored at backboard mount
  const rimPivot = new THREE.Group();
  rimPivot.position.set(boardX - side * 0.14, COURT_DIMS.RIM_Y, 0);
  group.add(rimPivot);

  const rimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.3,
      metalness: 0.65,
    })
  );
  const rimOffset = rimX - (boardX - side * 0.14);
  const rimMesh = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(COURT_DIMS.RIM_RADIUS, 0.018, 10, 24)),
    rimMat
  );
  rimMesh.rotation.x = Math.PI / 2;
  rimMesh.position.set(rimOffset, 0, 0);
  rimPivot.add(rimMesh);

  // Vertex-Animated Multi-Ring Net (White Nylon or Silver Chain on Blacktop)
  const netGeo = trackGeo(
    new THREE.CylinderGeometry(
      COURT_DIMS.RIM_RADIUS * 0.96,
      COURT_DIMS.RIM_RADIUS * 0.56,
      0.46,
      14,
      6,
      true
    )
  );
  const netMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: isChainNet ? 0xd4d4d8 : 0xf8fafc,
      roughness: isChainNet ? 0.35 : 0.85,
      metalness: isChainNet ? 0.82 : 0.05,
      wireframe: true,
      side: THREE.DoubleSide,
    })
  );
  const netMesh = new THREE.Mesh(netGeo, netMat);
  netMesh.position.set(rimOffset, -0.23, 0);
  rimPivot.add(netMesh);

  const posAttr = netGeo.attributes.position as THREE.BufferAttribute;
  const netBasePos = new Float32Array(posAttr.array.length);
  netBasePos.set(posAttr.array as Float32Array);

  return {
    group,
    rig: { side, rimPivot, netGeo, netBasePos, ledMat },
  };
}

export function buildVenue3D(
  venue: MatchVenueId,
  homeTeam: TeamData,
  hardwoodReflections: boolean,
  streakStamp?: string
): BuiltVenue3D {
  const root = new THREE.Group();
  const ownedGeos: THREE.BufferGeometry[] = [];
  const ownedMats: THREE.Material[] = [];
  const ownedTextures: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    ownedGeos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    ownedMats.push(m);
    return m;
  };

  const outdoor = isOutdoorVenue(venue);
  const asphalt = isStreetAsphaltVenue(venue);
  const isChainNet = venue === 'BLACKTOP_CAGE';

  // 1. Court Playing Floor (28.6m x 15.2m) + Outer Apron
  const courtTex = createCourtTextures(homeTeam, venue, streakStamp);
  const courtMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: courtTex.colorMap,
      roughnessMap: courtTex.roughnessMap,
      roughness: asphalt || venue === 'STREET_KINGS' ? 0.88 : hardwoodReflections ? 0.24 : 0.62,
      metalness: asphalt || venue === 'STREET_KINGS' ? 0.04 : hardwoodReflections ? 0.16 : 0.04,
      envMapIntensity: hardwoodReflections && !asphalt ? 1.35 : 0.55,
    })
  );
  const courtMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(COURT_DIMS.LENGTH, COURT_DIMS.WIDTH)),
    courtMat
  );
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.receiveShadow = true;
  root.add(courtMesh);

  // Outer Apron Surround
  const apronColor =
    venue === 'SUNSET_BEACH'
      ? 0xd6b888
      : venue === 'SKYLINE_PARK'
        ? 0x1e293b
        : venue === 'STREET_KINGS'
          ? 0x574c3f
          : venue === 'ARENA_2K14'
            ? 0x161218
            : 0x0f172a;
  const apronMat = trackMat(
    new THREE.MeshStandardMaterial({ color: apronColor, roughness: 0.85 })
  );
  const apronMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(88, 66)), apronMat);
  apronMesh.rotation.x = -Math.PI / 2;
  apronMesh.position.y = -0.025;
  apronMesh.receiveShadow = true;
  root.add(apronMesh);

  // 2. Both Regulation Hoops (Left -X and Right +X)
  const leftHoop = createHoopRig(
    -1,
    isChainNet,
    outdoor,
    homeTeam.colors.primary,
    trackGeo,
    trackMat
  );
  const rightHoop = createHoopRig(
    1,
    isChainNet,
    outdoor,
    homeTeam.colors.primary,
    trackGeo,
    trackMat
  );
  root.add(leftHoop.group);
  root.add(rightHoop.group);

  // 3. Venue-Specific Architecture, Crowd, Jumbotron & Outdoor Scenery
  let jumbotronCtrl: ReturnType<typeof createJumbotronTexture> | null = null;
  let crowdInstanced: THREE.InstancedMesh | null = null;
  const crowdBaseY: number[] = [];
  const crowdCoords: Array<[number, number, number]> = [];
  const crowdDummy = new THREE.Object3D();
  let rotorMesh: THREE.Object3D | null = null;
  let oceanMesh: THREE.Mesh | null = null;
  const torchLights: THREE.PointLight[] = [];

  if (!outdoor) {
    // INDOOR ARENA (2K26 Next-Gen, 2K14 Classic, EuroLeague Palace, The W)
    const ribbonTex = createScorerRibbonTexture(homeTeam, venue);
    ownedTextures.push(ribbonTex);
    const ribbonMat = trackMat(
      new THREE.MeshStandardMaterial({
        map: ribbonTex,
        emissive: 0xffffff,
        emissiveMap: ribbonTex,
        emissiveIntensity: 0.42,
        roughness: 0.4,
      })
    );
    const scorerTable = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(11.5, 0.86, 0.72)), ribbonMat);
    scorerTable.position.set(0, 0.43, -COURT_DIMS.HALF_WIDTH - 1.75);
    root.add(scorerTable);

    // Tiered Stadium Bleachers on all 4 sides
    const tierMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: venue === 'ARENA_2K14' ? 0x1c1722 : 0x111827,
        roughness: 0.85,
      })
    );
    for (let t = 0; t < 5; t++) {
      const distZ = COURT_DIMS.HALF_WIDTH + 3.4 + t * 1.85;
      const h = 0.75 + t * 0.95;
      for (const zSign of [-1, 1] as const) {
        const tier = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(36, 0.85, 1.7)), tierMat);
        tier.position.set(0, h, zSign * distZ);
        root.add(tier);

        // Populate spectators in this tier
        for (let sx = -15; sx <= 15; sx += 1.45) {
          crowdCoords.push([sx + (t % 2) * 0.4, h + 0.75, zSign * distZ]);
          crowdBaseY.push(h + 0.75);
        }
      }

      // Endzone baseline bleachers
      const distX = COURT_DIMS.HALF_LENGTH + 3.8 + t * 1.75;
      for (const xSign of [-1, 1] as const) {
        const endTier = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.6, 0.85, 18)), tierMat);
        endTier.position.set(xSign * distX, h, 0);
        root.add(endTier);
      }
    }

    // 4-Sided Hanging 3D Jumbotron Centerpiece
    jumbotronCtrl = createJumbotronTexture();
    const jumboGroup = new THREE.Group();
    jumboGroup.position.set(0, 12.6, 0);
    const jumboBody = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(5.6, 2.8, 5.6)),
      trackMat(new THREE.MeshStandardMaterial({ color: 0x0b0f19, metalness: 0.7, roughness: 0.35 }))
    );
    jumboGroup.add(jumboBody);

    const screenMat = trackMat(
      new THREE.MeshBasicMaterial({ map: jumbotronCtrl.texture })
    );
    const screenGeo = trackGeo(new THREE.PlaneGeometry(5.1, 2.35));
    const faces: Array<[number, number, number, number]> = [
      [0, 0, 2.83, 0],
      [0, 0, -2.83, Math.PI],
      [2.83, 0, 0, Math.PI / 2],
      [-2.83, 0, 0, -Math.PI / 2],
    ];
    for (const [fx, fy, fz, rotY] of faces) {
      const scr = new THREE.Mesh(screenGeo, screenMat);
      scr.position.set(fx, fy, fz);
      scr.rotation.y = rotY;
      jumboGroup.add(scr);
    }
    root.add(jumboGroup);

    // Arena Ceiling Rafter Beams & Spotlights
    const rafterMat = trackMat(
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.5 })
    );
    for (let rx = -14; rx <= 14; rx += 7) {
      const beam = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.45, 0.45, 32)), rafterMat);
      beam.position.set(rx, 16.5, 0);
      root.add(beam);
    }
  } else {
    // OUTDOOR PARKS & STREETBALL VENUES
    if (venue === 'BLACKTOP_CAGE') {
      // Chain-link metal cage walls around court
      const fenceMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          wireframe: true,
          metalness: 0.7,
          roughness: 0.4,
        })
      );
      for (const zs of [-1, 1] as const) {
        const wall = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(33, 4.2, 28, 6)), fenceMat);
        wall.position.set(0, 2.1, zs * (COURT_DIMS.HALF_WIDTH + 2.2));
        root.add(wall);
      }
      for (const xs of [-1, 1] as const) {
        const wall = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(19.6, 4.2, 16, 6)), fenceMat);
        wall.rotation.y = Math.PI / 2;
        wall.position.set(xs * (COURT_DIMS.HALF_LENGTH + 2.4), 2.1, 0);
        root.add(wall);
      }
      // Corner floodlight poles
      const poleM = trackMat(new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 }));
      const bulbM = trackMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      for (const xs of [-1, 1] as const) {
        for (const zs of [-1, 1] as const) {
          const p = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.14, 0.18, 9.5, 8)), poleM);
          p.position.set(xs * 16.8, 4.75, zs * 9.8);
          root.add(p);
          const b = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.1, 0.45, 0.5)), bulbM);
          b.position.set(xs * 16.4, 9.4, zs * 9.4);
          root.add(b);
        }
      }
    } else if (venue === 'STREET_KINGS') {
      // Roman Coliseum Stone Pillars & Flickering Torches
      const stoneMat = trackMat(
        new THREE.MeshStandardMaterial({ color: 0xd6c7a9, roughness: 0.85 })
      );
      const flameMat = trackMat(
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      const colGeo = trackGeo(new THREE.CylinderGeometry(0.55, 0.65, 8.2, 12));
      const flameGeo = trackGeo(new THREE.ConeGeometry(0.32, 0.9, 8));
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const px = Math.cos(ang) * 20.5;
        const pz = Math.sin(ang) * 14.5;
        const col = new THREE.Mesh(colGeo, stoneMat);
        col.position.set(px, 4.1, pz);
        root.add(col);
        if (i % 2 === 0) {
          const fl = new THREE.Mesh(flameGeo, flameMat);
          fl.position.set(px, 8.6, pz);
          root.add(fl);
          if (torchLights.length < 4) {
            const tl = new THREE.PointLight(0xff7a1a, 18, 22);
            tl.position.set(px, 8.9, pz);
            root.add(tl);
            torchLights.push(tl);
          }
        }
      }
    } else {
      // SKYLINE PARK / RIVET CITY / SUNSET BEACH / OLD TOWN
      // City Skyline Silhouette Towers & Rooftop Props
      const bldgMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: venue === 'RIVET_CITY' ? 0x3f2e2b : venue === 'OLD_TOWN' ? 0x2f3e46 : 0x1e293b,
          roughness: 0.72,
          metalness: 0.25,
        })
      );
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 29 + (i % 3) * 4;
        const bw = 4.2 + (i % 4) * 1.4;
        const bh = 9 + ((i * 7) % 16);
        const tower = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(bw, bh, bw)), bldgMat);
        tower.position.set(Math.cos(ang) * dist, bh * 0.5 - 0.5, Math.sin(ang) * (dist * 0.72));
        root.add(tower);
      }

      // Sunset Beach Palm Trees + Shimmering Ocean Strip
      if (venue === 'SUNSET_BEACH' || venue === 'OLD_TOWN') {
        const trunkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x785032, roughness: 0.9 }));
        const leafMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 }));
        for (let p = 0; p < 8; p++) {
          const px = -16 + p * 4.6;
          const pz = p % 2 === 0 ? -12.5 : 12.5;
          const trunk = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.18, 0.28, 6.2, 7)), trunkMat);
          trunk.position.set(px, 3.1, pz);
          trunk.rotation.z = (p % 2 === 0 ? 1 : -1) * 0.14;
          root.add(trunk);
          const crown = new THREE.Mesh(trackGeo(new THREE.ConeGeometry(2.1, 1.5, 7)), leafMat);
          crown.position.set(px, 6.4, pz);
          root.add(crown);
        }
        if (venue === 'SUNSET_BEACH') {
          const oceanMat = trackMat(
            new THREE.MeshStandardMaterial({
              color: 0x0284c7,
              roughness: 0.2,
              metalness: 0.45,
            })
          );
          oceanMesh = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(110, 34)), oceanMat);
          oceanMesh.rotation.x = -Math.PI / 2;
          oceanMesh.position.set(0, -0.08, -32);
          root.add(oceanMesh);
        }
      }

      // Animated Flying City Helicopter / Blimp overhead on Skyline Park & Rivet City
      if (venue === 'SKYLINE_PARK' || venue === 'RIVET_CITY') {
        const heli = new THREE.Group();
        const hull = new THREE.Mesh(
          trackGeo(new THREE.CapsuleGeometry(0.55, 1.8, 6, 10)),
          trackMat(new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.5, roughness: 0.35 }))
        );
        hull.rotation.z = Math.PI / 2;
        heli.add(hull);
        const blade = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(3.4, 0.06, 0.18)),
          trackMat(new THREE.MeshBasicMaterial({ color: 0xf8fafc }))
        );
        blade.position.y = 0.72;
        heli.add(blade);
        heli.position.set(0, 15.5, -18);
        root.add(heli);
        rotorMesh = heli;
      }
    }

    // Outdoor Courtside Spectators (Street Crowd)
    for (let sx = -12; sx <= 12; sx += 2.2) {
      crowdCoords.push([sx, 0.78, -COURT_DIMS.HALF_WIDTH - 2.6]);
      crowdBaseY.push(0.78);
      crowdCoords.push([sx, 0.78, COURT_DIMS.HALF_WIDTH + 2.6]);
      crowdBaseY.push(0.78);
    }
  }

  // 4. InstancedMesh Cheering Crowd (Single Draw Call!)
  if (crowdCoords.length > 0) {
    const specGeo = trackGeo(new THREE.CapsuleGeometry(0.24, 0.55, 4, 8));
    const specMat = trackMat(new THREE.MeshStandardMaterial({ roughness: 0.78 }));
    crowdInstanced = new THREE.InstancedMesh(specGeo, specMat, crowdCoords.length);
    const palette = [
      new THREE.Color(homeTeam.colors.primary || '#e11d48'),
      new THREE.Color(homeTeam.colors.secondary || '#f59e0b'),
      new THREE.Color(0x334155),
      new THREE.Color(0x64748b),
      new THREE.Color(0xf8fafc),
    ];
    for (let i = 0; i < crowdCoords.length; i++) {
      const [cx, cy, cz] = crowdCoords[i];
      crowdDummy.position.set(cx, cy, cz);
      crowdDummy.updateMatrix();
      crowdInstanced.setMatrixAt(i, crowdDummy.matrix);
      crowdInstanced.setColorAt(i, palette[i % palette.length]);
    }
    crowdInstanced.instanceMatrix.needsUpdate = true;
    if (crowdInstanced.instanceColor) crowdInstanced.instanceColor.needsUpdate = true;
    root.add(crowdInstanced);
  }

  // Helper to deform multi-ring net vertices cleanly on swish / dunk ripple
  const updateSingleHoop = (
    rig: HoopRig,
    rimFlex: number,
    netRipple: number,
    netTime: number,
    buzzerLit: boolean
  ) => {
    // Breakaway downward rim flex on contact dunks
    rig.rimPivot.rotation.z = rig.side * rimFlex * 0.22;

    // Red LED Backboard perimeter ignition
    rig.ledMat.emissiveIntensity = buzzerLit ? 2.4 : 0.0;
    rig.ledMat.color.setHex(buzzerLit ? 0xff2233 : 0x3f1d24);

    // Vertex-animated rippling net
    if (netRipple > 0.005) {
      const posAttr = rig.netGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const base = rig.netBasePos;
      for (let i = 0; i < arr.length; i += 3) {
        const bx = base[i];
        const by = base[i + 1];
        const bz = base[i + 2];
        // Top vertices (by > 0.18) remain pinned to rim; lower rings flare & ripple
        const depth = Math.max(0, (0.23 - by) / 0.46);
        const wave = Math.sin(netTime * 19.0 - depth * 6.0) * netRipple * depth;
        const flare = 1 + wave * 0.42;
        arr[i] = bx * flare;
        arr[i + 1] = by + Math.abs(wave) * 0.09;
        arr[i + 2] = bz * flare;
      }
      posAttr.needsUpdate = true;
    }
  };

  return {
    root,
    setHardwoodReflections: (enabled: boolean) => {
      if (asphalt || venue === 'STREET_KINGS') return;
      courtMat.roughness = enabled ? 0.24 : 0.64;
      courtMat.metalness = enabled ? 0.16 : 0.04;
      courtMat.envMapIntensity = enabled ? 1.35 : 0.55;
      courtMat.needsUpdate = true;
    },
    updateHoops: (hoops: HoopRenderState) => {
      updateSingleHoop(
        leftHoop.rig,
        hoops.leftRimFlex,
        hoops.leftNetRipple,
        hoops.leftNetTime,
        hoops.buzzerLit
      );
      updateSingleHoop(
        rightHoop.rig,
        hoops.rightRimFlex,
        hoops.rightNetRipple,
        hoops.rightNetTime,
        hoops.buzzerLit
      );
    },
    updateEnvironment: (elapsedSec: number, excitement: number) => {
      if (crowdInstanced) {
        const jumpAmp = 0.05 + excitement * 0.24;
        const freq = 3.2 + excitement * 6.5;
        for (let i = 0; i < crowdCoords.length; i++) {
          const [cx, , cz] = crowdCoords[i];
          const bounce = Math.abs(Math.sin(elapsedSec * freq + i * 0.73)) * jumpAmp;
          crowdDummy.position.set(cx, crowdBaseY[i] + bounce, cz);
          crowdDummy.updateMatrix();
          crowdInstanced.setMatrixAt(i, crowdDummy.matrix);
        }
        crowdInstanced.instanceMatrix.needsUpdate = true;
      }
      if (rotorMesh) {
        rotorMesh.position.x = Math.sin(elapsedSec * 0.22) * 22;
        rotorMesh.position.z = -17 + Math.cos(elapsedSec * 0.22) * 5;
        rotorMesh.rotation.y = Math.cos(elapsedSec * 0.22) > 0 ? 0 : Math.PI;
      }
      if (oceanMesh) {
        oceanMesh.position.y = -0.08 + Math.sin(elapsedSec * 1.6) * 0.06;
      }
      for (let i = 0; i < torchLights.length; i++) {
        torchLights[i].intensity = 16 + Math.sin(elapsedSec * 11 + i * 2.1) * 4;
      }
    },
    updateJumbotron: (awayAbbr, awayPts, homeAbbr, homePts, clockText, banner) => {
      if (jumbotronCtrl) {
        jumbotronCtrl.update(awayAbbr, awayPts, homeAbbr, homePts, clockText, banner);
      }
    },
    dispose: () => {
      courtTex.dispose();
      if (jumbotronCtrl) jumbotronCtrl.dispose();
      ownedTextures.forEach((t) => t.dispose());
      ownedGeos.forEach((g) => g.dispose());
      ownedMats.forEach((m) => m.dispose());
    },
  };
}
