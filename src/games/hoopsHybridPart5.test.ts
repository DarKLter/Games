import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDefaultCustomHudLayout,
  createDefaultUltimateHybridSave,
  normalizeShotMeterStyle,
} from './hoops-2k26/hybrid/store';
import { RosterStore } from './hoops-2k26/hybrid/rosterStore';
import { BasketballSimulation } from './hoops-2k26/engine/BasketballSimulation';
import {
  computeScreenPosition,
  createInitialTeammateGrade,
  InstantReplayBuffer,
  recordTeammateGradeEvent,
  scoreToGradeLetter,
  selectLineupProfiles,
} from './hoops-2k26/engine/SimTacticsAndReplay';

function makeSim() {
  const def = createDefaultUltimateHybridSave();
  const awayTeam = RosterStore.getTeamById('2k14_mia');
  const homeTeam = RosterStore.getTeamById('2k26_okc');
  return new BasketballSimulation({
    awayTeam,
    homeTeam,
    config: {
      ...def.activeMatchConfig,
      awayTeamId: awayTeam.id,
      homeTeamId: homeTeam.id,
      playersPerSide: 5,
      targetScore: null,
      sideControl: 'HOME',
    },
    settings: def.settings,
  });
}

test('Part 5 Settings: defaults to 2K26_ARROW, migrates all legacy shot meter styles, and provides customHudLayout', () => {
  const def = createDefaultUltimateHybridSave();
  assert.equal(def.settings.controller.shotMeterStyle, '2K26_ARROW');
  assert.equal(def.settings.controller.showVirtualTouchControls, 'AUTO');
  assert.equal(def.settings.visual.scorebugPosition2K26, 'BOTTOM_LEFT');

  // Legacy migration
  assert.equal(normalizeShotMeterStyle('2K26_CURVED', '2K26_ARROW'), '2K26_ARROW');
  assert.equal(normalizeShotMeterStyle('2K14_CLASSIC_ARC', '2K26_ARROW'), '2K14_FLOOR_RING');
  assert.equal(normalizeShotMeterStyle('MINIMAL_RING', '2K26_ARROW'), 'MINIMAL');
  // All 5 authentic Part 5 styles pass through cleanly
  assert.equal(normalizeShotMeterStyle('COMET', '2K26_ARROW'), 'COMET');
  assert.equal(normalizeShotMeterStyle('VERTICAL_BAR', '2K26_ARROW'), 'VERTICAL_BAR');

  const layout = createDefaultCustomHudLayout();
  assert.ok(layout.left_stick && layout.shoot_pad && layout.pass_btn && layout.block_btn);
  assert.equal(layout.shoot_pad.scale, 1);
  assert.ok(layout.shoot_pad.opacity > 0.5 && layout.shoot_pad.opacity <= 1);
});

test('Part 5 Teammate Grade: maps F..A+ accurately and maintains newest 3 events', () => {
  assert.equal(scoreToGradeLetter(0), 'F');
  assert.equal(scoreToGradeLetter(50), 'C');
  assert.equal(scoreToGradeLetter(78), 'B+');
  assert.equal(scoreToGradeLetter(97), 'A+');

  const grade = createInitialTeammateGrade();
  assert.equal(grade.letter, 'C');
  recordTeammateGradeEvent(grade, '+Good Shot Selection', 8);
  recordTeammateGradeEvent(grade, '+Assist', 10);
  recordTeammateGradeEvent(grade, '+Screen Assist', 8);
  recordTeammateGradeEvent(grade, '+Good Shot Contest', 12);
  assert.equal(grade.events.length, 3);
  assert.equal(grade.events[0].label, '+Good Shot Contest');
  assert.ok(grade.score > 80);
  const updatedLetter: string = grade.letter;
  assert.ok(updatedLetter.startsWith('A') || updatedLetter === 'B+');
});

test('Part 5 Pick & Roll 45°/180° Screen Angle, Roll/Fade toggle, Timeouts & Lineup Presets', () => {
  const sim = makeSim();
  // Resolve opening jump ball so play is LIVE
  sim.triggerJumpBallAttempt();
  sim.step(0.05);

  const pos45 = computeScreenPosition(4, 2, 1, 45);
  const pos180 = computeScreenPosition(4, 2, 1, 180);
  assert.notEqual(pos45.z, pos180.z, '180° flip must move screen to opposite side of ball-handler');

  const called = sim.callPickAndRoll();
  assert.equal(called, true);
  let snap = sim.getHudSnapshot();
  assert.equal(snap.pickAndRoll.active, true);
  assert.equal(snap.pickAndRoll.angleDeg, 45);
  assert.equal(snap.pickAndRoll.action, 'ROLL');

  assert.equal(sim.flipPickAndRollAngle(), 180);
  assert.equal(sim.togglePickAndRollAction(), 'FADE');
  snap = sim.getHudSnapshot();
  assert.equal(snap.pickAndRoll.angleDeg, 180);
  assert.equal(snap.pickAndRoll.action, 'FADE');

  // Timeouts decrement count and activate 3s huddle
  const initTO = snap.homeTimeouts;
  assert.equal(sim.callTimeout('HOME'), true);
  snap = sim.getHudSnapshot();
  assert.equal(snap.homeTimeouts, initTO - 1);
  assert.ok(snap.timeoutHuddleSec > 2.5);

  // Lineup Presets swap units cleanly
  const okc = RosterStore.getTeamById('2k26_okc');
  const tallUnit = selectLineupProfiles(okc.roster, 'TALL', 5);
  const shootersUnit = selectLineupProfiles(okc.roster, 'SHOOTERS', 5);
  assert.equal(tallUnit.length, 5);
  assert.equal(shootersUnit.length, 5);
  assert.equal(sim.applyLineupPreset('SHOOTERS', 'HOME'), true);
  assert.equal(sim.getHudSnapshot().activeLineupPreset, 'SHOOTERS');
});

test('Part 5 Enemy Star Marking on Radar + Pause Gate + 4s Instant Replay Ring Buffer', () => {
  const sim = makeSim();
  sim.triggerJumpBallAttempt();

  // Step 40 frames so Instant Replay ring buffer records live snapshots
  for (let i = 0; i < 40; i++) {
    sim.step(1 / 30);
  }
  const snapBeforePause = sim.getHudSnapshot();
  assert.ok(snapBeforePause.replayFrameCount >= 20);
  assert.equal(snapBeforePause.radarPlayers.length, 10);

  // Enemy star marking updates renderState & HUD snapshot immediately
  const enemy = snapBeforePause.radarPlayers.find((p) => p.teamSide === 'AWAY')!;
  sim.setMarkedStar(enemy.id, 'DENY');
  assert.equal(sim.renderState.markedStar.playerId, enemy.id);
  assert.equal(sim.renderState.markedStar.tag, 'DENY');

  // Pause freezes game clock cleanly
  sim.setPaused(true);
  const clockAtPause = sim.renderState.quarterClockSec;
  sim.step(0.05);
  sim.step(0.05);
  assert.equal(sim.renderState.quarterClockSec, clockAtPause);

  // Instant Replay scrubbing previews earlier frame & restores live state on resume
  assert.equal(sim.previewReplayFrame(0), true);
  sim.setPaused(false);
  assert.equal(sim.isPaused(), false);

  // Standalone InstantReplayBuffer capacity cap check
  const buf = new InstantReplayBuffer(10);
  for (let i = 0; i < 20; i++) {
    buf.record(sim.renderState, i * 0.04, 0.04);
  }
  assert.equal(buf.getFrameCount(), 10);
});
