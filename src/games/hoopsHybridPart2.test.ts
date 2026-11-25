import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTRIBUTE_META,
  BADGE_CATALOG,
  makePlayer,
} from './hoops-2k26/hybrid/rosterTypes';
import { ROSTERS_2K14 } from './hoops-2k26/hybrid/rosters2K14';
import { ROSTERS_2K26 } from './hoops-2k26/hybrid/rosters2K26';
import { ROSTERS_BONUS } from './hoops-2k26/hybrid/rostersBonus';
import {
  DEFAULT_ALL_TEAMS,
  RosterStore,
  toHoops2K26TeamOverride,
} from './hoops-2k26/hybrid/rosterStore';

test('Part 2 Schema: exact 18 attributes, 25 tiered badges, and 9 hot zones', () => {
  assert.equal(ATTRIBUTE_META.length, 18);
  assert.equal(BADGE_CATALOG.length, 25);

  const sample = ROSTERS_2K14[0].roster[2]; // LeBron James #6
  assert.equal(sample.name, 'LeBron James');
  assert.equal(sample.jerseyNumber, 6);
  assert.equal(sample.ovr, 99);
  assert.equal(Object.keys(sample.attributes).length, 18);
  assert.equal(Object.keys(sample.hotZones).length, 9);
  assert.ok(Object.keys(sample.badges).length >= 5);
});

test('Part 2 Database: exact 72 teams (30 2K14 + 30 2K26 + 4 Legends + 4 Euro + 4 WNBA) and 576 players', () => {
  assert.equal(ROSTERS_2K14.length, 30);
  assert.equal(ROSTERS_2K26.length, 30);
  assert.equal(ROSTERS_BONUS.length, 12);
  assert.equal(DEFAULT_ALL_TEAMS.length, 72);

  const ids = new Set<string>();
  let totalPlayers = 0;

  for (const team of DEFAULT_ALL_TEAMS) {
    assert.ok(!ids.has(team.id), `Duplicate team id: ${team.id}`);
    ids.add(team.id);
    assert.equal(team.roster.length, 8, `${team.city} ${team.name} should have 8 playable players`);
    totalPlayers += team.roster.length;

    // Verify Starting 5 positions are strictly ordered PG, SG, SF, PF, C
    assert.deepEqual(
      team.roster.slice(0, 5).map((p) => p.position),
      ['PG', 'SG', 'SF', 'PF', 'C'],
      `${team.id} starters must be ordered PG, SG, SF, PF, C`
    );

    for (const p of team.roster) {
      assert.ok(p.ovr >= 65 && p.ovr <= 99, `${p.name} OVR out of bounds: ${p.ovr}`);
      assert.ok(p.heightInches >= 68 && p.heightInches <= 88, `${p.name} height out of bounds`);
      assert.equal(Object.keys(p.attributes).length, 18);
      assert.equal(Object.keys(p.hotZones).length, 9);
    }
  }

  assert.equal(totalPlayers, 576);

  // Spot-check marquee stars across all 5 eras
  assert.ok(RosterStore.getTeamById('2k26_okc').roster.some((p) => p.name === 'Shai Gilgeous-Alexander' && p.ovr === 98));
  assert.ok(RosterStore.getTeamById('2k26_den').roster.some((p) => p.name === 'Nikola Jokić' && p.ovr === 98));
  assert.ok(RosterStore.getTeamById('2k26_lal').roster.some((p) => p.name === 'Luka Dončić' && p.ovr === 97));
  assert.ok(RosterStore.getTeamById('leg_chi96').roster.some((p) => p.name === 'Michael Jordan' && p.ovr === 99));
  assert.ok(RosterStore.getTeamById('euro_rm').roster.some((p) => p.name === 'Sergio Llull'));
  assert.ok(RosterStore.getTeamById('wnba_ind').roster.some((p) => p.name === 'Caitlin Clark' && p.ovr === 95));
});

test('Part 2 RosterStore: edit player, swap starter/bench, trade players, CAP & reset defaults', () => {
  RosterStore.resetDefaultRosters();
  assert.equal(RosterStore.getSnapshot().isCustomized, false);

  // 1. Edit player rating & jersey
  const heat = RosterStore.getTeamById('2k14_mia');
  const chalmers = heat.roster[0];
  RosterStore.updatePlayer({
    ...chalmers,
    jerseyNumber: 99,
    attributes: { ...chalmers.attributes, threePt: 98, midRange: 95 },
  });
  const heatAfterEdit = RosterStore.getTeamById('2k14_mia');
  assert.equal(heatAfterEdit.roster[0].jerseyNumber, 99);
  assert.equal(heatAfterEdit.roster[0].attributes.threePt, 98);
  assert.equal(RosterStore.getSnapshot().isCustomized, true);

  // 2. Swap Starter vs Bench (swap Ray Allen #5 into SG slot #1)
  const wadeId = heatAfterEdit.roster[1].id;
  const allenId = heatAfterEdit.roster[5].id;
  RosterStore.swapStarterBench('2k14_mia', 1, 5);
  const heatSwapped = RosterStore.getTeamById('2k14_mia');
  assert.equal(heatSwapped.roster[1].id, allenId);
  assert.equal(heatSwapped.roster[5].id, wadeId);

  // 3. Cross-Era Trade (LeBron '14 <-> Shai '26)
  const lebronId = heatSwapped.roster[2].id;
  const okc = RosterStore.getTeamById('2k26_okc');
  const sgaId = okc.roster[0].id;
  const tradeRes = RosterStore.tradePlayers('2k14_mia', lebronId, '2k26_okc', sgaId);
  assert.equal(tradeRes.ok, true);
  assert.ok(RosterStore.getTeamById('2k14_mia').roster.some((p) => p.id === sgaId));
  assert.ok(RosterStore.getTeamById('2k26_okc').roster.some((p) => p.id === lebronId));

  // 4. Create-A-Player assigned as Starter + verify 3D Tip-Off override carries CAP player live
  const cap = makePlayer({
    id: 'cap_test_mvp',
    name: 'Tsepang Legend',
    jerseyNumber: 26,
    position: 'SG',
    ovr: 96,
    era: '2K26',
    style: 'SUPERSTAR_WING',
  });
  RosterStore.addCreatedPlayer(cap, '2k26_okc', true);
  const okcWithCap = RosterStore.getTeamById('2k26_okc');
  assert.equal(okcWithCap.roster[1].name, 'Tsepang Legend');

  const override3D = toHoops2K26TeamOverride(okcWithCap, 4);
  assert.equal(override3D.abbr, 'OKC');
  assert.equal(override3D.starters[1].name, 'Tsepang Legend');
  assert.equal(override3D.starters[1].jersey, 26);

  // 5. Release bench player to Free Agents & Sign back
  const benchPlayer = okcWithCap.roster[okcWithCap.roster.length - 1];
  const relRes = RosterStore.releaseToFreeAgents('2k26_okc', benchPlayer.id);
  assert.equal(relRes.ok, true);
  assert.ok(RosterStore.getSnapshot().freeAgents.some((p) => p.id === benchPlayer.id));

  const signRes = RosterStore.signFreeAgent(benchPlayer.id, '2k14_bos');
  assert.equal(signRes.ok, true);
  assert.ok(RosterStore.getTeamById('2k14_bos').roster.some((p) => p.id === benchPlayer.id));

  // 6. Reset restores all 72 teams cleanly
  RosterStore.resetDefaultRosters();
  assert.equal(RosterStore.getSnapshot().isCustomized, false);
  assert.equal(RosterStore.getTeamById('2k14_mia').roster[0].jerseyNumber, 15);
  assert.equal(RosterStore.getTeamById('2k26_okc').roster[0].name, 'Shai Gilgeous-Alexander');
});
