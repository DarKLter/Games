import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HYBRID_SAVE_KEY,
  UltimateHybridStore,
  createDefaultUltimateHybridSave,
} from './hoops-2k26/hybrid/store';
import {
  ERA_POOL_META,
  HYBRID_ALL_TEAMS,
  VENUE_OPTIONS,
  getHybridTeamById,
  getTeamsByEraPool,
} from './hoops-2k26/hybrid/teamCatalog';
import {
  HYBRID_2K_BEATS_TRACKS,
  HybridAudioEngine,
} from './hoops-2k26/hybrid/audioEngine';

test('Part 1 Store: defaults to HYBRID_PRO era, versioned save key, and 7-tab settings', () => {
  assert.equal(HYBRID_SAVE_KEY, 'nba2k14_2k26_ultimate_save_v1');
  const def = createDefaultUltimateHybridSave();
  assert.equal(def.uiEraMode, 'HYBRID_PRO');
  assert.equal(def.activeScreen, 'MAIN_MENU');
  assert.ok(def.currencies.vc >= 10000);
  assert.ok(def.currencies.mtp >= 5000);
  assert.ok(def.profile.shotChartHistory.length >= 6);
  assert.equal(def.settings.audio.enabledTrackIds.length, 6);
});

test('Part 1 Store: era toggle cycles HYBRID_PRO -> 2K14_CLASSIC -> 2K26_NEXTGEN -> HYBRID_PRO', () => {
  UltimateHybridStore.resetSave();
  assert.equal(UltimateHybridStore.getState().uiEraMode, 'HYBRID_PRO');
  assert.equal(UltimateHybridStore.cycleEraMode(), '2K14_CLASSIC');
  assert.equal(UltimateHybridStore.cycleEraMode(), '2K26_NEXTGEN');
  assert.equal(UltimateHybridStore.cycleEraMode(), 'HYBRID_PRO');
});

test('Part 1 Store: challenge claiming awards VC + MTP once and blocks duplicate claims', () => {
  UltimateHybridStore.resetSave();
  const before = UltimateHybridStore.getState();
  const firstClaim = UltimateHybridStore.claimChallenge('daily_green_3');
  assert.equal(firstClaim.ok, true);
  assert.ok(firstClaim.rewardVc > 0);
  assert.ok(firstClaim.rewardMtp > 0);

  const after = UltimateHybridStore.getState();
  assert.equal(after.currencies.vc, before.currencies.vc + firstClaim.rewardVc);
  assert.equal(after.currencies.mtp, before.currencies.mtp + firstClaim.rewardMtp);

  const secondClaim = UltimateHybridStore.claimChallenge('daily_green_3');
  assert.equal(secondClaim.ok, false);
});

test('Part 1 Store: shot chart tracking and JSON save export/import round-trip', () => {
  UltimateHybridStore.resetSave();
  UltimateHybridStore.updateProfile({ gamertag: 'DUAL_ERA_MVP' });
  const prevShots = UltimateHybridStore.getState().profile.shotChartHistory.length;
  UltimateHybridStore.recordShotChart({
    x: 12,
    y: 23,
    made: true,
    isThree: true,
    era: '2K14_CLASSIC',
  });
  assert.equal(UltimateHybridStore.getState().profile.shotChartHistory.length, prevShots + 1);

  const exported = UltimateHybridStore.exportSaveJson();
  UltimateHybridStore.resetSave();
  assert.notEqual(UltimateHybridStore.getState().profile.gamertag, 'DUAL_ERA_MVP');

  const okImport = UltimateHybridStore.importSaveJson(exported);
  assert.equal(okImport.ok, true);
  assert.equal(UltimateHybridStore.getState().profile.gamertag, 'DUAL_ERA_MVP');

  const badImport = UltimateHybridStore.importSaveJson('{not valid json');
  assert.equal(badImport.ok, false);
});

test('Part 1 Team Catalog: all 5 Era Pools populated with Starting 5 & valid 3D court mappings', () => {
  assert.equal(ERA_POOL_META.length, 5);
  const nba2k14 = getTeamsByEraPool('NBA_2K14');
  const nba2k26 = getTeamsByEraPool('NBA_2K26');
  const legends = getTeamsByEraPool('LEGENDS');
  const euro14 = getTeamsByEraPool('EUROLEAGUE_14');
  const theW = getTeamsByEraPool('THE_W');

  assert.equal(nba2k14.length, 30);
  assert.equal(nba2k26.length, 30);
  assert.equal(legends.length, 4);
  assert.equal(euro14.length, 4);
  assert.equal(theW.length, 4);
  assert.equal(HYBRID_ALL_TEAMS.length, 72);

  for (const team of HYBRID_ALL_TEAMS) {
    assert.equal(team.starters.length, 5, `${team.fullName} should have 5 starters`);
    assert.ok(team.ovr >= 65 && team.ovr <= 99);
    assert.ok(team.mappedCourtTeamId >= 0);
  }

  assert.equal(getHybridTeamById('2k14_mia').abbr, 'MIA');
  assert.equal(getHybridTeamById('2k26_okc').abbr, 'OKC');
  assert.equal(getHybridTeamById('2k26_okc_4').abbr, 'OKC'); // legacy alias
  assert.ok(VENUE_OPTIONS.length >= 10);
});

test('Part 1 Audio Engine: 6 procedural 2K Beats tracks, cycling, shuffle & playlist guard', () => {
  assert.equal(HYBRID_2K_BEATS_TRACKS.length, 6);
  const first = HybridAudioEngine.selectTrack('crown_2014', false);
  assert.equal(first.id, 'crown_2014');

  const next = HybridAudioEngine.nextTrack();
  assert.equal(next.id, 'kings_hardwood');

  const prev = HybridAudioEngine.prevTrack();
  assert.equal(prev.id, 'crown_2014');

  const shOn = HybridAudioEngine.toggleShuffle();
  assert.equal(typeof shOn, 'boolean');

  // Guard: disabling all but 1 track preserves at least 1 active track
  let activeIds: string[] = [];
  for (const tr of HYBRID_2K_BEATS_TRACKS) {
    activeIds = HybridAudioEngine.toggleTrackEnabled(tr.id);
  }
  assert.ok(activeIds.length >= 1);
});
