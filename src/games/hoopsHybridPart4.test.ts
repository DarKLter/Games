import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BADGE_TIER_BONUS,
  addTakeoverProgress,
  createTakeoverState,
  evaluateAnkleBreaker,
  evaluateFinishingBadges,
  evaluateFirstStepLaunch,
  evaluateReboundBadges,
  evaluateShootingBadges,
  evaluateStealAttempt,
  getEffectiveAttribute,
  igniteTakeover,
  tickTakeover,
} from './hoops-2k26/engine/BadgeEngine';
import {
  computeDefenseAI,
  computeOffenseAI,
  DIFFICULTY_PROFILES,
  getPlayVisionOffenseSpots,
  type AIPlayerSnap,
} from './hoops-2k26/engine/AISystem';
import {
  BasketballSimulation,
  computeShotOutcome,
  computeSkillDunkGreenWindow,
  getHotZoneKeyForPosition,
  VISUAL_CUE_TARGETS,
} from './hoops-2k26/engine/BasketballSimulation';
import { RosterStore } from './hoops-2k26/hybrid/rosterStore';
import { createDefaultUltimateHybridSave } from './hoops-2k26/hybrid/store';
import { BADGE_CATALOG, makePlayer } from './hoops-2k26/hybrid/rosterTypes';

function buildStarShooter() {
  return makePlayer({
    id: 'test_curry',
    name: 'Stephen Curry',
    jerseyNumber: 30,
    position: 'PG',
    ovr: 97,
    era: '2K26',
    style: 'SHARPSHOOTER',
    heightInches: 74,
    attrs: { threePt: 99, midRange: 95, ballHandle: 96, speed: 88, freeThrow: 96 },
    hotZones: {
      leftCorner3: 1,
      leftWing3: 1,
      topKey3: 1,
      rightWing3: 1,
      rightCorner3: 1,
      leftMid: 1,
      topMid: 1,
      rightMid: 1,
      paint: 0,
    },
    badges: {
      DEADEYE: 'LEGEND',
      LIMITLESS_RANGE: 'LEGEND',
      SET_SHOT_SPECIALIST: 'HOF',
      SHIFTY_SHOOTER: 'GOLD',
      MINI_MARKSMAN: 'GOLD',
      ANKLE_ASSASSIN: 'HOF',
      LIGHTNING_LAUNCH: 'GOLD',
      HANDLES_FOR_DAYS: 'HOF',
      UNPLUCKABLE: 'GOLD',
    },
  });
}

function buildRimProtector() {
  return makePlayer({
    id: 'test_wemby',
    name: 'Victor Wembanyama',
    jerseyNumber: 1,
    position: 'C',
    ovr: 96,
    era: '2K26',
    style: 'RIM_PROTECTOR',
    heightInches: 88,
    attrs: { interiorDef: 97, block: 99, perimeterDef: 84, defReb: 94, steal: 80 },
    badges: {
      PAINT_PATROLLER: 'LEGEND',
      HIGH_FLYING_DENIER: 'HOF',
      PERIMETER_CHALLENGER: 'GOLD',
      REBOUND_CHASER: 'HOF',
      BOXOUT_BEAST: 'GOLD',
      POGO_STICK: 'GOLD',
      GLOVE: 'SILVER',
      INTERCEPTOR: 'GOLD',
    },
  });
}

test('Part 4 BadgeEngine: 5-tier bonuses (+4/+8/+12/+16/+22%) & all 25 catalog badges wired', () => {
  assert.equal(BADGE_CATALOG.length, 25);
  assert.equal(BADGE_TIER_BONUS.BRONZE, 0.04);
  assert.equal(BADGE_TIER_BONUS.SILVER, 0.08);
  assert.equal(BADGE_TIER_BONUS.GOLD, 0.12);
  assert.equal(BADGE_TIER_BONUS.HOF, 0.16);
  assert.equal(BADGE_TIER_BONUS.LEGEND, 0.22);

  const shooter = buildStarShooter();
  const defender = buildRimProtector();
  const passer = makePlayer({
    id: 'test_passer',
    name: 'Magic Johnson',
    jerseyNumber: 32,
    position: 'PG',
    ovr: 99,
    era: 'LEGENDS',
    badges: { DIMER: 'LEGEND' },
  });

  const emitted: string[] = [];
  const res = evaluateShootingBadges(
    {
      shooter,
      shooterSide: 'HOME',
      defender,
      defenderSide: 'AWAY',
      passer,
      distMeters: 8.4,
      isCatchAndShoot: true,
      isOffDribble: false,
      contestPct: 35,
    },
    (_pl, _side, id) => emitted.push(id)
  );

  assert.ok(res.triggeredBadges.includes('DEADEYE'));
  assert.ok(res.triggeredBadges.includes('LIMITLESS_RANGE'));
  assert.ok(res.triggeredBadges.includes('SET_SHOT_SPECIALIST'));
  assert.ok(res.triggeredBadges.includes('MINI_MARKSMAN'));
  assert.ok(res.triggeredBadges.includes('DIMER'));
  assert.ok(res.triggeredBadges.includes('PERIMETER_CHALLENGER'));
  assert.ok(emitted.length >= 6);
  assert.ok(res.offenseBonus > 0.25);
  assert.ok(res.contestReduction > 0.25);
});

test('Part 4 BadgeEngine: Quick Protect hip-shield crushes steal chance & raises foul risk', () => {
  const handler = buildStarShooter();
  const defender = buildRimProtector();
  const lockdown = makePlayer({
    id: 'test_kawhi',
    name: 'Kawhi Leonard',
    jerseyNumber: 2,
    position: 'SF',
    ovr: 96,
    era: '2K26',
    attrs: { steal: 97, perimeterDef: 97 },
    badges: { GLOVE: 'LEGEND', INTERCEPTOR: 'HOF' },
  });

  const normalSteal = evaluateStealAttempt(lockdown, 'AWAY', handler, 'HOME', false, false);
  const protectedSteal = evaluateStealAttempt(lockdown, 'AWAY', handler, 'HOME', false, true);

  assert.ok(protectedSteal.stealChance < normalSteal.stealChance * 0.4);
  assert.ok(protectedSteal.foulChance > normalSteal.foulChance + 0.25);

  const launch = evaluateFirstStepLaunch(handler, 'HOME');
  assert.ok(launch.speedMultiplier > 1.05);
  assert.ok(launch.adrenalineDrainMul < 0.85);

  const ankle = evaluateAnkleBreaker(handler, 'HOME', defender);
  assert.ok(ankle.triggered && ankle.stunChance > 0.2);

  const reb = evaluateReboundBadges(defender, 'AWAY', true, true);
  assert.ok(reb.reachBonusM > 0.3 && reb.recoveryMul < 0.85);
});

test('Part 4 Takeover Progression: Levels 1-4 progressive +2/+4/+6/+8 & Level 5 Ignition 45s +10', () => {
  const shooter = buildStarShooter();
  const tk = createTakeoverState(shooter);
  assert.equal(tk.level, 0);
  assert.equal(tk.readyToIgnite, false);

  addTakeoverProgress(tk, 25); // Level 1 (+2)
  assert.equal(tk.level, 1);
  assert.equal(getEffectiveAttribute(shooter, tk, 'midRange'), Math.min(99, shooter.attributes.midRange + 2));

  addTakeoverProgress(tk, 40); // 65% -> Level 3 (+6)
  assert.equal(tk.level, 3);
  assert.equal(igniteTakeover(tk), false);

  addTakeoverProgress(tk, 40); // 100% -> Level 5 Ready
  assert.equal(tk.level, 5);
  assert.equal(tk.readyToIgnite, true);

  assert.equal(igniteTakeover(tk), true);
  assert.equal(tk.ignited, true);
  assert.equal(tk.igniteRemainingSec, 45);
  assert.equal(getEffectiveAttribute(shooter, tk, 'midRange'), 99);

  tickTakeover(tk, 46); // Burns out cleanly after 45s
  assert.equal(tk.ignited, false);
  assert.equal(tk.level, 0);
});

test('Part 4 Shooting Math: Rhythm +12%, No-Meter +15%, Hot/Cold Zones & Timing Profiles', () => {
  const shooter = buildStarShooter();
  const tk = createTakeoverState(shooter);
  const baseParams = {
    shooter,
    shooterSide: 'HOME' as const,
    shooterTakeover: tk,
    defender: null,
    defenderSide: 'AWAY' as const,
    passer: null,
    distMeters: 7.4,
    isThree: true,
    hotZoneState: 0 as const,
    releaseValue: VISUAL_CUE_TARGETS.SET_POINT,
    targetCenter: VISUAL_CUE_TARGETS.SET_POINT,
    timingProfile: 'NORMAL' as const,
    shotMeterEnabled: true,
    isRhythmShot: false,
    rhythmTempoError: 0.02,
    isCatchAndShoot: true,
    isOffDribble: false,
    contestPct: 0,
    stamina: 1,
    adrenalinePips: 3,
    difficulty: 'All-Star' as const,
    userShotSlider: 50,
    randomRoll: 0.5,
  };

  const std = computeShotOutcome(baseParams);
  const noMeter = computeShotOutcome({ ...baseParams, shotMeterEnabled: false });
  const rhythm = computeShotOutcome({ ...baseParams, isRhythmShot: true, rhythmTempoError: 0.03 });
  const hot = computeShotOutcome({ ...baseParams, hotZoneState: 1 });
  const cold = computeShotOutcome({ ...baseParams, hotZoneState: -1 });

  assert.equal(std.isGreen, true);
  assert.equal(std.made, true);
  assert.ok(noMeter.greenHalfWidth > std.greenHalfWidth * 1.12);
  assert.ok(rhythm.greenHalfWidth > std.greenHalfWidth * 1.1);
  assert.equal(rhythm.rhythmLabel, 'RHYTHM: PERFECT');
  assert.ok(hot.greenHalfWidth > cold.greenHalfWidth);

  // GREEN_OR_MISS misses non-green release cleanly
  const missedGreenOrMiss = computeShotOutcome({
    ...baseParams,
    timingProfile: 'GREEN_OR_MISS',
    releaseValue: 0.96,
  });
  assert.equal(missedGreenOrMiss.isGreen, false);
  assert.equal(missedGreenOrMiss.made, false);

  // HotZone court mapping covers paint, mid, corner3, wing3, topKey3
  assert.equal(getHotZoneKeyForPosition(11.5, 0, 12.7), 'paint');
  assert.equal(getHotZoneKeyForPosition(10.5, -6.8, 12.7), 'leftCorner3');
  assert.equal(getHotZoneKeyForPosition(4.8, 0.2, 12.7), 'topKey3');
});

test('Part 4 Skill Dunk Meter & Difficulty Prompt Gating (Rookie vs Pro+)', () => {
  const dunker = makePlayer({
    id: 'test_mj',
    name: 'Michael Jordan',
    jerseyNumber: 23,
    position: 'SG',
    ovr: 99,
    era: 'LEGENDS',
    attrs: { drivingDunk: 99 },
    badges: { POSTERIZER: 'LEGEND' },
  });
  const wemby = buildRimProtector();
  const weakDef = makePlayer({
    id: 'test_small',
    name: 'Small Guard',
    jerseyNumber: 4,
    position: 'PG',
    ovr: 74,
    era: '2K26',
    attrs: { interiorDef: 45 },
  });

  const finVsWemby = evaluateFinishingBadges({
    finisher: dunker,
    finisherSide: 'HOME',
    defender: wemby,
    defenderSide: 'AWAY',
    moveKind: 'DUNK',
    hasContact: true,
    isChaseDown: false,
  });
  const winVsWemby = computeSkillDunkGreenWindow(
    dunker,
    wemby,
    finVsWemby.dunkMeterBonus,
    finVsWemby.defenderDeterBonus
  );
  const winVsWeak = computeSkillDunkGreenWindow(dunker, weakDef, finVsWemby.dunkMeterBonus, 0);

  assert.ok(winVsWemby < winVsWeak, 'Paint Patroller + high Interior Def must shrink Skill Dunk window');
  assert.equal(DIFFICULTY_PROFILES.Rookie.requiresInteractiveFinishPrompts, false);
  assert.equal(DIFFICULTY_PROFILES.Pro.requiresInteractiveFinishPrompts, true);
  assert.equal(DIFFICULTY_PROFILES['Hall of Fame'].requiresInteractiveFinishPrompts, true);
});

test('Part 4 Smart 5v5 AI: PlayVision spacing, double-team kick-out & Defensive Schemes', () => {
  const spotsFiveOut = getPlayVisionOffenseSpots('FIVE_OUT', 1, 2, 5);
  const spotsMotion = getPlayVisionOffenseSpots('MOTION_CUT', 1, 2, 5);
  assert.equal(spotsFiveOut.length, 5);
  assert.equal(spotsMotion.length, 5);
  // Ensure teammates are genuinely spaced apart (not bunched on one point)
  assert.ok(Math.hypot(spotsFiveOut[1].x - spotsFiveOut[2].x, spotsFiveOut[1].z - spotsFiveOut[2].z) > 6);

  const shooter = buildStarShooter();
  const wing = buildStarShooter();
  const def1 = buildRimProtector();

  const handlerSnap: AIPlayerSnap = {
    id: 'h0',
    slotIndex: 0,
    teamSide: 'HOME',
    profile: shooter,
    x: 6.5,
    z: 0,
    hasBall: true,
    isUserControlled: false,
    stamina: 0.9,
    adrenalinePips: 3,
    guardTargetId: null,
  };
  const openCornerSnap: AIPlayerSnap = {
    id: 'h1',
    slotIndex: 1,
    teamSide: 'HOME',
    profile: wing,
    x: 11.4,
    z: -6.7,
    hasBall: false,
    isUserControlled: false,
    stamina: 1,
    adrenalinePips: 3,
    guardTargetId: null,
  };
  const trappedDefs: AIPlayerSnap[] = [
    { id: 'a0', slotIndex: 0, teamSide: 'AWAY', profile: def1, x: 7.4, z: 0.4, hasBall: false, isUserControlled: false, stamina: 1, adrenalinePips: 3, guardTargetId: 'h0' },
    { id: 'a1', slotIndex: 1, teamSide: 'AWAY', profile: def1, x: 7.6, z: -0.5, hasBall: false, isUserControlled: false, stamina: 1, adrenalinePips: 3, guardTargetId: 'h1' },
  ];

  const offCmd = computeOffenseAI({
    player: handlerSnap,
    teammates: [handlerSnap, openCornerSnap],
    defenders: trappedDefs,
    attackDirX: 1,
    playVision: 'FIVE_OUT',
    shotClockSec: 18,
    playClockSec: 4,
    difficulty: 'All-Star',
    playersPerSide: 5,
    canDecideAction: true,
    isBlacktopHalfCourt: false,
  });
  assert.equal(offCmd.action, 'PASS');
  assert.equal(offCmd.passTargetId, 'h1');

  const zoneDef = computeDefenseAI({
    defender: trappedDefs[0],
    teammates: trappedDefs,
    offense: [handlerSnap, openCornerSnap],
    ballX: 6.5,
    ballZ: 0,
    ballHandler: handlerSnap,
    ballInFlight: false,
    shooterIsRising: false,
    defendHoopX: 12.7,
    scheme: 'ZONE_2_3',
    markedStarId: 'h0',
    markedStarTag: 'DOUBLE',
    difficulty: 'All-Star',
    cpuDefenseSlider: 50,
    canAttemptEvent: true,
  });
  assert.ok(Number.isFinite(zoneDef.targetX) && Number.isFinite(zoneDef.targetZ));
});

test('Part 4 BasketballSimulation: Jump Ball Tip-Off, 60 FPS Live Play, Adrenaline & Blacktop Rules', () => {
  const defSave = createDefaultUltimateHybridSave();
  const homeTeam = RosterStore.getTeamById('2k26_okc');
  const awayTeam = RosterStore.getTeamById('2k14_mia');

  // 1. Regulation 5v5 opens in JUMP_BALL and transitions cleanly to LIVE
  const sim5 = new BasketballSimulation({
    awayTeam,
    homeTeam,
    config: defSave.activeMatchConfig,
    settings: defSave.settings,
  });
  assert.equal(sim5.getHudSnapshot().phase, 'JUMP_BALL');
  for (let i = 0; i < 45; i++) sim5.step(1 / 60);
  sim5.triggerJumpBallAttempt();
  const afterTip = sim5.getHudSnapshot();
  assert.equal(afterTip.phase, 'LIVE');
  assert.equal(afterTip.controlledAdrenaline, 3);
  assert.equal(afterTip.boxScore.length, 10);

  // Defensive scheme & PlayVision switch live
  sim5.setDefensiveScheme('ZONE_3_2');
  sim5.setActivePlay('MOTION_CUT');
  assert.equal(sim5.getHudSnapshot().defensiveScheme, 'ZONE_3_2');
  assert.equal(sim5.getHudSnapshot().activePlay, 'MOTION_CUT');

  // Step 90 frames of live 60 FPS play without NaN or crashes
  for (let i = 0; i < 90; i++) sim5.step(1 / 60);
  const liveSnap = sim5.getHudSnapshot();
  assert.ok(liveSnap.quarterClockSec < defSave.activeMatchConfig.quarterLengthMin * 60);
  assert.ok(Number.isFinite(sim5.renderState.ball.x) && Number.isFinite(sim5.renderState.ball.y));

  // 2. Blacktop 3v3 to 21 starts in CHECK_BALL half-court streetball mode
  const sim3 = new BasketballSimulation({
    awayTeam,
    homeTeam,
    config: {
      ...defSave.activeMatchConfig,
      playersPerSide: 3,
      targetScore: 21,
      venue: 'BLACKTOP_CAGE',
    },
    settings: defSave.settings,
  });
  assert.equal(sim3.isBlacktopMode(), true);
  assert.equal(sim3.getHudSnapshot().phase, 'CHECK_BALL');
  assert.equal(sim3.getHudSnapshot().quarterLabel, 'TO 21');
  for (let i = 0; i < 60; i++) sim3.step(1 / 60);
  assert.equal(sim3.getHudSnapshot().phase, 'LIVE');
});
