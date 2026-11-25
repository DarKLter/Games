import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildToPlayerProfile,
  computeBuildOvr,
  computeDynamicAttributeCaps,
  computeUnlockedBadges5Tier,
  deriveBuildArchetypeName,
  evaluateAiTradeApproval,
  ModesStore,
  rollMyTeamPack,
} from './hoops-2k26/modes/modesStore';
import {
  CITY_LANDMARKS,
  GAME_CHANGER_CATALOG,
  MYTEAM_PACKS,
  PTG_SCENARIOS,
  STREET_KINGS_BOSSES,
  SWAG_STORE_CATALOG,
  TRAINING_DRILLS,
} from './hoops-2k26/modes/modesTypes';
import { RosterStore } from './hoops-2k26/hybrid/rosterStore';
import { UltimateHybridStore } from './hoops-2k26/hybrid/store';
import { BasketballSimulation } from './hoops-2k26/engine/BasketballSimulation';

function resetAllStores() {
  UltimateHybridStore.resetSave();
  ModesStore.resetModesSave();
  ModesStore.setActiveLaunchPayload(null);
}

test('Part 6 Catalogs: defines all 11 City landmarks, 5 Street Kings bosses, 6 PTG scenarios, 5 Game Changers & 6 Training Drills', () => {
  resetAllStores();
  assert.equal(CITY_LANDMARKS.length, 11);
  assert.equal(STREET_KINGS_BOSSES.length, 5);
  assert.equal(STREET_KINGS_BOSSES[0].ovr, 92);
  assert.equal(STREET_KINGS_BOSSES[4].ovr, 99);
  assert.equal(PTG_SCENARIOS.length, 6);
  assert.equal(PTG_SCENARIOS.filter((s) => s.branch === 'HEAT_DYNASTY').length, 3);
  assert.equal(PTG_SCENARIOS.filter((s) => s.branch === 'FANTASTIC_JOURNEY').length, 3);
  assert.equal(GAME_CHANGER_CATALOG.length, 5);
  assert.equal(MYTEAM_PACKS.length, 3);
  assert.equal(TRAINING_DRILLS.length, 6);
  assert.ok(SWAG_STORE_CATALOG.length >= 15);
});

test('Part 6 MyPLAYER Builder: 5 persistent slots, wingspan shifts 3PT vs Block/Steal/Reb caps, Cap Breakers & 5-Tier Badges work', () => {
  resetAllStores();
  const state = ModesStore.getState();
  assert.equal(state.buildSlots.length, 5);

  const shortArms = computeDynamicAttributeCaps('SG', 78, 205, 76);
  const longArms = computeDynamicAttributeCaps('SG', 78, 205, 85);
  assert.ok(shortArms.threePt > longArms.threePt);
  assert.ok(longArms.block > shortArms.block);
  assert.ok(longArms.steal > shortArms.steal);
  assert.ok(longArms.defReb > shortArms.defReb);

  const baseSlot = state.buildSlots[0];
  const badges = computeUnlockedBadges5Tier(
    { ...baseSlot.attributes, threePt: 94 },
    { threePt: 5 }
  );
  assert.equal(badges.LIMITLESS_RANGE, 'LEGEND');
  assert.equal(badges.DEADEYE, 'LEGEND');

  const archName = deriveBuildArchetypeName(baseSlot.attributes, 'PG');
  assert.ok(archName.length > 5);
  assert.ok(computeBuildOvr(baseSlot.attributes, { threePt: 4 }) >= 80);

  const profile = buildToPlayerProfile(baseSlot);
  assert.equal(profile.isCreated, true);
  assert.equal(profile.name, baseSlot.name);

  // VC Upgrade spends VC and increases attribute
  const vcBefore = UltimateHybridStore.getState().currencies.vc;
  const upg = ModesStore.upgradeBuildAttributeWithVc(0, 'closeShot');
  assert.equal(upg.ok, true);
  assert.ok(UltimateHybridStore.getState().currencies.vc < vcBefore);
});

test('Part 6 The City: pins, park switcher, Gatorade +4 stamina boost, Crews HQ & Swag store equip persist', () => {
  resetAllStores();
  ModesStore.setActivePark('RIVET_CITY');
  assert.equal(ModesStore.getState().activePark, 'RIVET_CITY');

  ModesStore.addCityPin('Squad Rally Point', 'SQUAD_RALLY', 420, 260);
  assert.equal(ModesStore.getState().cityPins[0].label, 'Squad Rally Point');
  ModesStore.clearCityPins();
  assert.equal(ModesStore.getState().cityPins.length, 0);

  const gat = ModesStore.completeGatoradeDrill('treadmill', 85);
  assert.equal(gat.grantedBoost, true);
  assert.equal(ModesStore.getState().gatoradeBoostGamesLeft, 5);

  const swag = ModesStore.buyOrEquipSwag('vfx_crown');
  assert.equal(swag.ok, true);
  assert.equal(ModesStore.getActiveBuild().cosmetics.greenReleaseVfx, 'GOLDEN_CROWN');

  const crewClaim = ModesStore.claimCrewWeeklyGoal('cg_1');
  assert.equal(crewClaim.ok, true);
  assert.equal(crewClaim.vc, 2000);
});

test('Part 6 MyTEAM: dual-gender starter lineup, holographic pack opening, Game Changer 2x MTP & Domination settlement', () => {
  resetAllStores();
  const mt = ModesStore.getState().myTeam;
  assert.equal(mt.startingFiveIds.length, 5);
  assert.equal(mt.benchIds.length, 3);
  assert.equal(mt.ownedCards.some((c) => c.gender === 'WNBA'), true);
  assert.equal(mt.ownedCards.some((c) => c.eraLabel === '2K14'), true);
  assert.equal(mt.ownedCards.some((c) => c.eraLabel === '2K26'), true);

  const pulled = rollMyTeamPack('PACK_LEGENDS_WNBA');
  assert.equal(pulled.length, 3);

  const openRes = ModesStore.openMyTeamPack('PACK_2K14_THROWBACK', 'VC');
  assert.equal(openRes.ok, true);
  assert.equal(ModesStore.getState().myTeam.ownedCards.length, mt.ownedCards.length + 3);

  ModesStore.setActiveLaunchPayload({
    kind: 'MYTEAM_DOMINATION',
    title: 'MyTEAM Domination',
    subtitle: 'vs OKC',
    returnScreen: 'MYTEAM_HUB',
    matchPatch: {},
    myTeamDominationTeamId: '2k26_okc',
    myTeamGameChangerId: 'GC_2X_MTP_REP',
    baseVcReward: 1000,
    baseMtpReward: 1500,
    baseRepReward: 400,
  });
  const settled = ModesStore.settleCompletedModeMatch({
    userWon: true,
    margin: 14,
    starPts: 24,
    starAst: 5,
    drillMetricCount: 0,
  });
  assert.equal(settled.mtpEarned, 3000);
  assert.equal(ModesStore.getState().myTeam.dominationStars['2k26_okc'], 3);
});

test('Part 6 MyNBA Eras: 16-Team Playoff Bracket simulates cleanly through NBA Champion & AI Trade Approval works', () => {
  resetAllStores();
  ModesStore.startNewMyNbaEra('ERA_2014', '2k14_mia');
  assert.equal(ModesStore.getState().myNba.playoffBracket.length, 8);

  // Sim all 4 playoff rounds
  for (let r = 0; r < 4; r++) {
    const res = ModesStore.simulateMyNbaCurrentRound();
    assert.equal(res.ok, true);
  }
  assert.ok(ModesStore.getState().myNba.championTeamId);

  const mia = RosterStore.getTeamById('2k14_mia');
  const sas = RosterStore.getTeamById('2k14_sas');
  const miaStar = [...mia.roster].sort((a, b) => b.ovr - a.ovr)[0];
  const miaBench = [...mia.roster].sort((a, b) => a.ovr - b.ovr)[0];
  const sasStar = [...sas.roster].sort((a, b) => b.ovr - a.ovr)[0];
  const sasBench = [...sas.roster].sort((a, b) => a.ovr - b.ovr)[0];
  const fair = evaluateAiTradeApproval(miaStar, sasBench);
  assert.equal(fair.accepted, true);
  assert.ok(fair.approvalPct >= 55);
  const lopsided = evaluateAiTradeApproval(miaBench, sasStar);
  assert.equal(lopsided.accepted, false);
});

test('Part 6 Path to Greatness & Training Camp: mid-game 3D scenario start + Star/Medal settlement work', () => {
  resetAllStores();
  const sc = PTG_SCENARIOS[0];
  const sim = new BasketballSimulation({
    awayTeam: RosterStore.getTeamById(sc.awayTeamId),
    homeTeam: RosterStore.getTeamById(sc.homeTeamId),
    config: UltimateHybridStore.getState().activeMatchConfig,
    settings: UltimateHybridStore.getState().settings,
    scenarioOverride: {
      startQuarter: sc.startQuarter,
      startClockSec: sc.startClockSec,
      startHomeScore: sc.startHomeScore,
      startAwayScore: sc.startAwayScore,
      instantTakeover: true,
      forceGreenOrMiss: true,
    },
  });
  const hud = sim.getHudSnapshot();
  assert.equal(hud.phase, 'LIVE');
  assert.equal(hud.quarter, 4);
  assert.equal(hud.homeScore, sc.startHomeScore);
  assert.equal(hud.awayScore, sc.startAwayScore);
  assert.equal(hud.controlledTakeover?.ignited, true);

  // Settle Path to Greatness 3-star win
  ModesStore.setActiveLaunchPayload({
    kind: 'PATH_TO_GREATNESS',
    title: sc.title,
    subtitle: sc.subtitle,
    returnScreen: 'PATH_TO_GREATNESS',
    matchPatch: {},
    ptgScenarioId: sc.id,
    baseVcReward: sc.vcReward,
  });
  ModesStore.settleCompletedModeMatch({
    userWon: true,
    margin: 5,
    starPts: 14,
    starAst: 4,
    drillMetricCount: 0,
  });
  assert.equal(ModesStore.getState().ptgProgress[sc.id].stars, 3);
  assert.equal(ModesStore.getState().ptgProgress[sc.id].trophyUnlocked, true);

  // Settle Training Camp Gold Medal
  ModesStore.setActiveLaunchPayload({
    kind: 'TRAINING_DRILL',
    title: '1. Rhythm Shooting Mastery',
    subtitle: 'Drill',
    returnScreen: 'LEARN_2K',
    matchPatch: {},
    trainingDrillId: 'DRILL_RHYTHM_SHOOTING',
  });
  ModesStore.settleCompletedModeMatch({
    userWon: true,
    margin: 8,
    starPts: 18,
    starAst: 0,
    drillMetricCount: 6,
  });
  assert.equal(ModesStore.getState().drillMedals.DRILL_RHYTHM_SHOOTING, 'GOLD');
});
