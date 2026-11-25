import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMERA_ANGLE_OPTIONS,
  CAMERA_ORDER,
  COURT_DIMS,
  computePlayerProportions,
  getVenueDisplayLabel,
  isOutdoorVenue,
  isStreetAsphaltVenue,
  solveCameraTarget,
  type CourtCameraConfig,
} from './hoops-2k26/engine/courtTypes';
import {
  UltimateHybridStore,
  createDefaultUltimateHybridSave,
} from './hoops-2k26/hybrid/store';
import { VENUE_OPTIONS } from './hoops-2k26/hybrid/teamCatalog';

test('Part 3 Cameras: all 7 authentic 2K camera angles solve cleanly and honor Auto-Flip, Reverse & Key Zoom', () => {
  assert.equal(CAMERA_ANGLE_OPTIONS.length, 7);
  assert.deepEqual(CAMERA_ORDER, [
    '2K',
    '2K_LOW',
    'BROADCAST',
    'DRIVE',
    'PLAYER_LOCK',
    'HIGH',
    'NOSEBLEEDS',
  ]);

  const baseCfg: CourtCameraConfig = {
    angle: '2K',
    zoom: 5,
    height: 6,
    autoFlip: true,
    keyZoom: false,
    reverseAngle: false,
    dunkCameraShake: true,
  };

  // Every camera returns finite coordinates and sensible positive height & FOV
  for (const angle of CAMERA_ORDER) {
    const pose = solveCameraTarget({ ...baseCfg, angle }, 4.0, 1.0, 1.5, 4.0, 1.5, 1);
    assert.ok(Number.isFinite(pose.posX), `${angle} posX finite`);
    assert.ok(Number.isFinite(pose.posY) && pose.posY > 1.5, `${angle} posY elevated`);
    assert.ok(Number.isFinite(pose.posZ), `${angle} posZ finite`);
    assert.ok(pose.fov >= 35 && pose.fov <= 60, `${angle} fov in bounds`);
  }

  // Auto-Flip 180 degrees flips 2K camera behind left vs right attack direction
  const camRight = solveCameraTarget({ ...baseCfg, angle: '2K', autoFlip: true }, 0, 1, 0, 0, 0, 1);
  const camLeft = solveCameraTarget({ ...baseCfg, angle: '2K', autoFlip: true }, 0, 1, 0, 0, 0, -1);
  assert.ok(camRight.posX < 0, 'Attacking +X places 2K camera on -X side');
  assert.ok(camLeft.posX > 0, 'Attacking -X flips 2K camera to +X side');

  // Reverse Angle flips side on BROADCAST & 2K
  const bcNormal = solveCameraTarget({ ...baseCfg, angle: 'BROADCAST', reverseAngle: false }, 0, 1, 0, 0, 0, 1);
  const bcRev = solveCameraTarget({ ...baseCfg, angle: 'BROADCAST', reverseAngle: true }, 0, 1, 0, 0, 0, 1);
  assert.ok(bcNormal.posZ > 0 && bcRev.posZ < 0, 'Reverse Angle flips Broadcast sideline Z');

  // Key Zoom tightens FOV when ball enters painted lane near hoop
  const keyOff = solveCameraTarget({ ...baseCfg, angle: '2K', keyZoom: false }, 11.2, 1.2, 0.5, 11.2, 0.5, 1);
  const keyOn = solveCameraTarget({ ...baseCfg, angle: '2K', keyZoom: true }, 11.2, 1.2, 0.5, 11.2, 0.5, 1);
  assert.ok(keyOn.fov < keyOff.fov, 'Key Zoom tightens camera FOV inside the lane');
  assert.ok(keyOn.posY < keyOff.posY, 'Key Zoom pulls camera closer inside the lane');
});

test('Part 3 Player Proportions: 7-foot-4 Wembanyama visibly dwarfs 6-foot-0 Chris Paul', () => {
  const wemby = computePlayerProportions(88, 210, 96); // 7'4", 8'0" wingspan
  const cp3 = computePlayerProportions(72, 175, 76);   // 6'0", 6'4" wingspan
  const shaq = computePlayerProportions(85, 325, 91);  // 7'1", 325 lbs

  assert.ok(wemby.totalHeightM > 2.2, 'Wembanyama > 2.20m');
  assert.ok(cp3.totalHeightM < 1.85, 'CP3 < 1.85m');
  assert.ok(wemby.heightScale > cp3.heightScale * 1.2, 'Wemby visibly taller than CP3');
  assert.ok(wemby.armScale > cp3.armScale * 1.15, 'Wemby visibly longer wingspan than CP3');
  assert.ok(shaq.widthScale > wemby.widthScale * 1.15, 'Shaq visibly broader frame than Wemby');
  assert.equal(COURT_DIMS.LENGTH, 28.6);
  assert.equal(COURT_DIMS.WIDTH, 15.2);
  assert.equal(COURT_DIMS.RIM_Y, 3.05);
});

test('Part 3 Venues: all 10 indoor arenas & remastered 2K16/2K26 outdoor parks are classified cleanly', () => {
  assert.equal(VENUE_OPTIONS.length, 10);
  for (const v of VENUE_OPTIONS) {
    assert.ok(getVenueDisplayLabel(v.id).length > 3, `Display label exists for ${v.id}`);
  }
  assert.equal(isOutdoorVenue('ARENA_2K26'), false);
  assert.equal(isOutdoorVenue('ARENA_2K14'), false);
  assert.equal(isOutdoorVenue('EUROLEAGUE_PALACE'), false);
  assert.equal(isOutdoorVenue('WNBA_ARENA'), false);

  assert.equal(isOutdoorVenue('SKYLINE_PARK'), true);
  assert.equal(isOutdoorVenue('RIVET_CITY'), true);
  assert.equal(isOutdoorVenue('SUNSET_BEACH'), true);
  assert.equal(isOutdoorVenue('OLD_TOWN'), true);
  assert.equal(isOutdoorVenue('BLACKTOP_CAGE'), true);
  assert.equal(isOutdoorVenue('STREET_KINGS'), true);

  assert.equal(isStreetAsphaltVenue('BLACKTOP_CAGE'), true);
  assert.equal(isStreetAsphaltVenue('SKYLINE_PARK'), true);
  assert.equal(isStreetAsphaltVenue('STREET_KINGS'), false); // Coliseum marble stone
});

test('Part 3 Settings Upgrade: persists all 7 cameras & visual toggles and migrates legacy Part 1 camera saves', () => {
  UltimateHybridStore.resetSave();
  const def = createDefaultUltimateHybridSave();
  assert.equal(def.settings.camera.angle, '2K');
  assert.equal(def.settings.camera.keyZoom, true);
  assert.equal(def.settings.camera.reverseAngle, false);
  assert.equal(def.settings.camera.dunkCameraShake, true);
  assert.equal(def.settings.visual.hardwoodReflections, true);
  assert.equal(def.settings.visual.hotColdZones, 'BALL_HANDLER');
  assert.equal(def.settings.visual.playVision, 'PICK_AND_ROLL');

  UltimateHybridStore.updateSettings('camera', {
    angle: 'PLAYER_LOCK',
    keyZoom: false,
    reverseAngle: true,
    dunkCameraShake: false,
  });
  UltimateHybridStore.updateSettings('visual', {
    hardwoodReflections: false,
    hotColdZones: 'ALL',
    playVision: 'HORNS',
  });

  const saved = UltimateHybridStore.getState();
  assert.equal(saved.settings.camera.angle, 'PLAYER_LOCK');
  assert.equal(saved.settings.camera.reverseAngle, true);
  assert.equal(saved.settings.visual.hardwoodReflections, false);
  assert.equal(saved.settings.visual.hotColdZones, 'ALL');
  assert.equal(saved.settings.visual.playVision, 'HORNS');

  // Legacy save migration: '2K_CAM' -> '2K', 'BROADCAST_2K14' -> 'BROADCAST', 'DYNAMIC_2K26' -> '2K_LOW'
  const legacyPayload1 = JSON.stringify({
    version: 1,
    settings: { camera: { angle: 'BROADCAST_2K14', zoom: 7, height: 4, autoFlip: false } },
  });
  assert.equal(UltimateHybridStore.importSaveJson(legacyPayload1).ok, true);
  assert.equal(UltimateHybridStore.getState().settings.camera.angle, 'BROADCAST');

  const legacyPayload2 = JSON.stringify({
    version: 1,
    settings: { camera: { angle: 'DYNAMIC_2K26' } },
  });
  assert.equal(UltimateHybridStore.importSaveJson(legacyPayload2).ok, true);
  assert.equal(UltimateHybridStore.getState().settings.camera.angle, '2K_LOW');

  const legacyPayload3 = JSON.stringify({
    version: 1,
    settings: { camera: { angle: '2K_CAM' } },
  });
  assert.equal(UltimateHybridStore.importSaveJson(legacyPayload3).ok, true);
  assert.equal(UltimateHybridStore.getState().settings.camera.angle, '2K');
});
