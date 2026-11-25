import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GAMEPLAY_SLIDER_META,
  GAMEPLAY_SLIDER_PRESETS,
  UltimateHybridStore,
  createDefaultCustomHudLayout,
  createPresetCustomHudLayout,
} from './hoops-2k26/hybrid/store';
import {
  classifyShotZone,
  computeShotChartZoneStats,
  filterShotEntries,
  normalizeShotFeet,
} from './hoops-2k26/part7/ShotChartCanvas';
import { HUD_EDITOR_NODES } from './hoops-2k26/part7/CustomHudEditor';
import {
  InstantReplayBuffer,
  createDefaultReplayOrbit,
} from './hoops-2k26/engine/SimTacticsAndReplay';
import { computeDefenseAI } from './hoops-2k26/engine/AISystem';
import { RosterStore } from './hoops-2k26/hybrid/rosterStore';
import { BasketballSimulation } from './hoops-2k26/engine/BasketballSimulation';
import type { GameplaySliderKey, ShotChartEntry } from './hoops-2k26/hybrid/types';

describe('Hoops 2K26 Part 7 — Complete 7-Tab Settings, Sliders, HUD Editor, Shot Chart, Replay & MVP', () => {
  it('defaults to Hybrid Pro Balanced (50/50) across all 15 User & CPU sliders and supports all presets', () => {
    UltimateHybridStore.resetSave();
    const s = UltimateHybridStore.getState();
    assert.equal(GAMEPLAY_SLIDER_META.length, 15);
    assert.equal(s.settings.coach.sliders.activePreset, 'HYBRID_PRO_BALANCED');

    for (const meta of GAMEPLAY_SLIDER_META) {
      const k = meta.key as GameplaySliderKey;
      assert.equal(s.settings.coach.sliders.user[k], 50, `User ${k} should default to 50`);
      assert.equal(s.settings.coach.sliders.cpu[k], 50, `CPU ${k} should default to 50`);
    }

    // Switch to Arcade High-Scoring
    UltimateHybridStore.applySliderPreset('ARCADE_HIGH_SCORING');
    const arc = UltimateHybridStore.getState().settings.coach.sliders;
    assert.equal(arc.activePreset, 'ARCADE_HIGH_SCORING');
    assert.ok(arc.user.threePt > 65);
    assert.ok(arc.user.gameSpeed > 60);

    // Switch to 2K14 Classic Sim & 2K26 Comp
    UltimateHybridStore.applySliderPreset('2K14_CLASSIC_SIM');
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.activePreset, '2K14_CLASSIC_SIM');
    UltimateHybridStore.applySliderPreset('2K26_COMP');
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.activePreset, '2K26_COMP');

    // Tune single slider & save as Custom preset
    UltimateHybridStore.updateSlider('user', 'threePt', 82);
    UltimateHybridStore.updateSlider('cpu', 'stealSuccess', 28);
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.activePreset, 'CUSTOM');
    UltimateHybridStore.saveCustomSliderPreset();

    // Switch away and restore Custom
    UltimateHybridStore.applySliderPreset('HYBRID_PRO_BALANCED');
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.user.threePt, 50);
    UltimateHybridStore.applySliderPreset('CUSTOM');
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.user.threePt, 82);
    assert.equal(UltimateHybridStore.getState().settings.coach.sliders.cpu.stealSuccess, 28);
  });

  it('wires CPU sliders dynamically into computeDefenseAI hands-up, contest & reach logic', () => {
    const away = RosterStore.getTeamById('2k26_okc');
    const home = RosterStore.getTeamById('2k14_mia');
    const sim = new BasketballSimulation({
      awayTeam: away,
      homeTeam: home,
      config: UltimateHybridStore.getState().activeMatchConfig,
      settings: UltimateHybridStore.getState().settings,
    });

    const defList = sim.renderState.players.filter((p) => p.teamSide === 'AWAY');
    const offList = sim.renderState.players.filter((p) => p.teamSide === 'HOME');
    const def = defList[0];
    const off = offList[0];
    def.x = 6.5;
    def.z = 0;
    off.x = 8.4;
    off.z = 0;
    off.hasBall = true;

    const toAgent = (p: (typeof defList)[number], idx: number) => ({
      id: p.id,
      slotIndex: idx,
      teamSide: p.teamSide,
      profile: (p.teamSide === 'AWAY' ? away : home).roster[idx % 5],
      x: p.x,
      z: p.z,
      hasBall: p.hasBall,
      isUserControlled: false,
      stamina: 95,
      adrenalinePips: 3,
      guardTargetId: off.id,
    });

    const defAgents = defList.map(toAgent);
    const offAgents = offList.map(toAgent);

    const lowCpu = { ...GAMEPLAY_SLIDER_PRESETS.HYBRID_PRO_BALANCED.cpu, shotContestImpact: 0, blockFrequency: 0, stealSuccess: 0, helpDefense: 0 };
    const highCpu = { ...GAMEPLAY_SLIDER_PRESETS.HYBRID_PRO_BALANCED.cpu, shotContestImpact: 100, blockFrequency: 100, stealSuccess: 100, helpDefense: 100 };

    const lowRes = computeDefenseAI({
      defender: defAgents[0],
      teammates: defAgents,
      offense: offAgents,
      ballX: off.x,
      ballZ: off.z,
      ballHandler: offAgents[0],
      ballInFlight: false,
      shooterIsRising: true,
      defendHoopX: 13.5,
      scheme: 'MAN_TO_MAN',
      markedStarId: null,
      markedStarTag: 'OVER',
      difficulty: 'Pro',
      cpuDefenseSlider: 50,
      cpuSliders: lowCpu,
      canAttemptEvent: true,
    });
    const highRes = computeDefenseAI({
      defender: defAgents[0],
      teammates: defAgents,
      offense: offAgents,
      ballX: off.x,
      ballZ: off.z,
      ballHandler: offAgents[0],
      ballInFlight: false,
      shooterIsRising: true,
      defendHoopX: 13.5,
      scheme: 'MAN_TO_MAN',
      markedStarId: null,
      markedStarTag: 'OVER',
      difficulty: 'Pro',
      cpuDefenseSlider: 50,
      cpuSliders: highCpu,
      canAttemptEvent: true,
    });

    assert.equal(highRes.handsUp, true, 'High contest CPU slider should force hands-up on rising shooter');
    assert.equal(typeof lowRes.attemptBlock, 'boolean');
    assert.equal(typeof highRes.attemptBlock, 'boolean');
  });

  it('supports all 14 movable Custom Touch HUD controls, 3 presets, and persistence', () => {
    assert.equal(HUD_EDITOR_NODES.length, 14);
    const defLayout = createDefaultCustomHudLayout();
    for (const node of HUD_EDITOR_NODES) {
      assert.ok(defLayout[node.key], `Default layout missing node ${node.key}`);
    }

    const claw = createPresetCustomHudLayout('CLAW_PRO');
    const compact = createPresetCustomHudLayout('COMPACT_ONE_HAND');
    assert.notDeepEqual(claw.shoot_pad, compact.shoot_pad);

    const custom = { ...defLayout, shoot_pad: { x: -42, y: -18, scale: 1.25, opacity: 0.85 } };
    UltimateHybridStore.updateCustomHudLayout(custom);
    const saved = UltimateHybridStore.getState().settings.controller.customHudLayout;
    assert.equal(saved.shoot_pad.x, -42);
    assert.equal(saved.shoot_pad.scale, 1.25);
    assert.equal(saved.shoot_pad.opacity, 0.85);
  });

  it('classifies half-court Shot Chart zones, filters shots, and aggregates FG% across 9 zones', () => {
    const sampleShots: ShotChartEntry[] = [
      { id: '1', x: 1.5, y: 3.0, made: true, isThree: false, isGreen: true, era: 'HYBRID_PRO', timestamp: 1 },
      { id: '2', x: -22.5, y: 6.0, made: true, isThree: true, isGreen: true, era: '2K26_NEXTGEN', timestamp: 2 },
      { id: '3', x: 22.0, y: 7.0, made: false, isThree: true, isGreen: false, era: '2K26_NEXTGEN', timestamp: 3 },
      { id: '4', x: 0.0, y: 26.0, made: true, isThree: true, isGreen: false, era: '2K14_CLASSIC', timestamp: 4 },
      { id: '5', x: -12.0, y: 15.0, made: false, isThree: false, isGreen: false, era: 'HYBRID_PRO', timestamp: 5 },
    ];

    assert.equal(classifyShotZone(sampleShots[0]), 'RESTRICTED_PAINT');
    assert.equal(classifyShotZone(sampleShots[1]), 'LEFT_CORNER_3');
    assert.equal(classifyShotZone(sampleShots[2]), 'RIGHT_CORNER_3');
    assert.equal(classifyShotZone(sampleShots[3]), 'TOP_KEY_3');
    assert.equal(classifyShotZone(sampleShots[4]), 'LEFT_MID');

    // Normalized fallback works seamlessly too
    const norm = normalizeShotFeet({ x: 0.5, y: 0.5 });
    assert.equal(norm.xFt, 12);
    assert.equal(norm.yFt, 20);

    assert.equal(filterShotEntries(sampleShots, 'ALL').length, 5);
    assert.equal(filterShotEntries(sampleShots, 'MAKES').length, 3);
    assert.equal(filterShotEntries(sampleShots, 'THREE_PT').length, 3);
    assert.equal(filterShotEntries(sampleShots, 'GREENS').length, 2);

    const zones = computeShotChartZoneStats(sampleShots);
    assert.equal(zones.length, 9);
    const lCorner = zones.find((z) => z.id === 'LEFT_CORNER_3')!;
    assert.equal(lCorner.made, 1);
    assert.equal(lCorner.att, 1);
    assert.equal(lCorner.pct, 100);
  });

  it('records 600 full frames (10s @ 60Hz) in InstantReplayBuffer with orbit state defaults', () => {
    const away = RosterStore.getTeamById('2k26_okc');
    const home = RosterStore.getTeamById('2k14_mia');
    const sim = new BasketballSimulation({
      awayTeam: away,
      homeTeam: home,
      config: UltimateHybridStore.getState().activeMatchConfig,
      settings: UltimateHybridStore.getState().settings,
    });

    const buf = new InstantReplayBuffer(600);
    for (let i = 0; i < 625; i++) {
      sim.renderState.ball.x = i * 0.01;
      buf.record(sim.renderState, i / 60, 1 / 60);
    }
    assert.equal(buf.getFrameCount(), 600);
    const oldest = buf.getFrame(0);
    const newest = buf.getFrame(599);
    assert.ok(oldest && newest);
    assert.ok(Math.abs(oldest.ballX - 0.25) < 0.001);
    assert.ok(Math.abs(newest.ballX - 6.24) < 0.001);

    const orbit = createDefaultReplayOrbit();
    assert.equal(orbit.active, false);
    assert.equal(orbit.focusMode, 'BALL');
    assert.ok(orbit.distance >= 6);
  });

  it('commits completed matches with VC/MTP/XP payouts, VIP stats, Career Shot Chart, Achievements, Keybinds & JSON backup', () => {
    UltimateHybridStore.resetSave();
    const before = UltimateHybridStore.getState();

    const payout = UltimateHybridStore.commitCompletedMatch({
      userWon: true,
      userTeamPts: 64,
      userTeamReb: 28,
      userTeamAst: 19,
      userTeamStl: 8,
      userTeamBlk: 5,
      userTeamFgm: 26,
      userTeamFga: 44,
      userTeamTpm: 9,
      userTeamTpa: 16,
      greensMade: 11,
      greenThreesMade: 5,
      topPlayerPts: 42,
      teammateGradeScore: 88,
      isBlacktopOrPark: true,
      matchShots: [
        { x: -22.5, y: 5.5, made: true, isThree: true, isGreen: true },
        { x: 0.5, y: 2.5, made: true, isThree: false, isGreen: false },
      ],
    });

    assert.ok(payout.totalVc >= 900);
    assert.ok(payout.mtpEarned > 0);
    assert.ok(payout.seasonXpEarned > 0);
    assert.ok(payout.repXpEarned > 0);
    assert.ok(payout.newlyUnlockedAchievements.includes('DROP_40_PTS'));
    assert.ok(payout.newlyUnlockedAchievements.includes('FIVE_GREEN_THREES'));
    assert.ok(payout.newlyUnlockedAchievements.includes('BREAK_PARK_STREAK'));

    const after = UltimateHybridStore.getState();
    assert.equal(after.profile.gamesPlayed, before.profile.gamesPlayed + 1);
    assert.equal(after.profile.wins, before.profile.wins + 1);
    assert.equal(after.profile.careerPoints, before.profile.careerPoints + 64);
    assert.equal(after.profile.shotChartHistory.length, before.profile.shotChartHistory.length + 2);
    assert.equal(after.currencies.vc, before.currencies.vc + payout.totalVc);

    // Keybinds & Crew Tag + JSON Export/Import round-trip
    UltimateHybridStore.updateKeybind('shoot', 'KeyF');
    UltimateHybridStore.updateCrewTag('goat');
    assert.equal(UltimateHybridStore.getState().settings.controller.keybinds.shoot, 'KeyF');
    assert.equal(UltimateHybridStore.getState().currencies.crewTag, 'GOAT');

    const json = UltimateHybridStore.exportSaveJson();
    UltimateHybridStore.resetSave();
    assert.equal(UltimateHybridStore.getState().settings.controller.keybinds.shoot, 'Space');

    const imp = UltimateHybridStore.importSaveJson(json);
    assert.equal(imp.ok, true);
    assert.equal(UltimateHybridStore.getState().settings.controller.keybinds.shoot, 'KeyF');
    assert.equal(UltimateHybridStore.getState().currencies.crewTag, 'GOAT');

    UltimateHybridStore.resetKeybinds();
    assert.equal(UltimateHybridStore.getState().settings.controller.keybinds.shoot, 'Space');
  });
});
