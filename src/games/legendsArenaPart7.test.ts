import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultCustomUi, createDefaultMlbbSave } from './legends-arena/mlbb/storage';
import { MLBB_ALL_HEROES, getMlbbHeroById } from './legends-arena/mlbb/data/heroes';
import { MLBB_ITEMS } from './legends-arena/mlbb/data/items';
import { MLBB_BATTLE_SPELLS, MLBB_EMBLEMS, MLBB_TALENTS } from './legends-arena/mlbb/data/emblems';
import { MAP_THEMES } from './legends-arena/mlbb/data/mapData';
import {
  AI_DIFFICULTY_PROFILES,
  computeCounterBuildPlan,
  computePostMatchProgression,
  findGankOpportunity,
  findPeelTarget,
  getAiDifficultyProfile,
  selectAutoDirectorHero,
  shouldTriggerBotActiveOrPurify
} from './legends-arena/mlbb/engine/SmartAiBrain';
import { SimHero, SimJungleMob, SimTurret } from './legends-arena/mlbb/engine/SkillPhysics';
import { MlbbMatchRecord } from './legends-arena/mlbb/types';

function makeSimHero(overrides: Partial<SimHero> & { id: string; heroId?: string; team: 'blue' | 'red' }): SimHero {
  const def = getMlbbHeroById(overrides.heroId ?? 'miya');
  return {
    id: overrides.id,
    name: overrides.name ?? def.name,
    team: overrides.team,
    heroDef: def,
    skinColor: def.primaryColor,
    skinAccent: def.accentColor,
    role: overrides.role ?? def.role,
    lane: overrides.lane ?? def.lane,
    isPlayer: Boolean(overrides.isPlayer),
    x: overrides.x ?? 1000,
    y: overrides.y ?? 1000,
    vx: 0,
    vy: 0,
    facing: 0,
    radius: 24,
    level: overrides.level ?? 10,
    xp: 0,
    xpToNext: 500,
    skillPoints: 0,
    skillLevels: [3, 3, 2],
    skillCds: [0, 0, 0],
    hp: overrides.hp ?? 3500,
    maxHp: overrides.maxHp ?? 3500,
    hpTrail: overrides.hp ?? 3500,
    shield: 0,
    mana: 1000,
    maxMana: 1000,
    gold: 6000,
    totalGold: 6000,
    kills: overrides.kills ?? 0,
    deaths: 0,
    assists: 0,
    streak: 0,
    multiKill: 0,
    multiKillTimer: 0,
    alive: overrides.alive ?? true,
    respawnTimer: 0,
    atkCd: 0,
    hitFlashTimer: 0,
    physAtk: overrides.physAtk ?? 240,
    magicPow: overrides.magicPow ?? 0,
    physDef: overrides.physDef ?? 60,
    magicDef: overrides.magicDef ?? 45,
    flatPhysPen: 0,
    pctPhysPen: 0,
    flatMagicPen: 0,
    pctMagicPen: 0,
    atkSpd: 1.4,
    critChance: 0.25,
    critDmgPct: 2.0,
    cdrPct: 0.1,
    moveSpd: 300,
    lifestealPct: overrides.lifestealPct ?? 0,
    spellVampPct: overrides.spellVampPct ?? 0,
    ccResPct: 0,
    castForeswing: 0,
    castBackswing: 0,
    ccType: overrides.ccType ?? null,
    ccTimer: overrides.ccTimer ?? 0,
    ccPriority: 0,
    ccImmuneTimer: 0,
    untargetableTimer: 0,
    physImmuneTimer: 0,
    winterCrownTimer: 0,
    stealthTimer: 0,
    revealedTimer: 0,
    spottedByEnemy: false,
    recentlyAttackedTimer: 0,
    inBush: false,
    recalling: false,
    recallTimer: 0,
    recallCd: 0,
    regenTimer: 0,
    regenCd: 0,
    speedBoostPct: 0,
    speedBoostTimer: 0,
    dashVx: 0,
    dashVy: 0,
    dashTimer: 0,
    dashWallCross: false,
    items: overrides.items ?? ['swift_boots', 'windtalker', 'berserkers_fury'],
    blessingId: overrides.blessingId ?? null,
    prioritizedItemId: null,
    activeBuildIdx: 0,
    buildPlan: overrides.buildPlan ?? [...def.recommendedBuild],
    spellId: overrides.spellId ?? 'flicker',
    spellCd: overrides.spellCd ?? 0,
    emblemId: 'marksman',
    talents: { t1: 'swift', t2: 'weapon_master', t3: 'quantum_charge' },
    activeItemCd: overrides.activeItemCd ?? 0,
    immortalityCd: 0,
    revivingTimer: 0,
    antiHealTimer: 0,
    antiHealPct: 0,
    blueBuffTimer: 0,
    orangeBuffTimer: 0,
    lordBuffTimer: 0,
    turtleShieldTimer: 0,
    junglerStacks: 0,
    roamGold: 0,
    isJungler: Boolean(overrides.isJungler),
    isRoamer: Boolean(overrides.isRoamer),
    passiveStacks: 0,
    passiveCd: 0,
    damageDealt: 0,
    damageTaken: 0,
    turretDamage: 0,
    recentDamagers: {},
    damageLog: [],
    ccLog: [],
    lastDeathRecap: null,
    activeEmote: null,
    emoteCd: 0,
    aiState: 'lane',
    aiTimer: 0,
    angelaHostId: null,
    isTrainingDummy: Boolean(overrides.isTrainingDummy),
    carmillaLinkTimer: 0,
    carmillaLinkIds: []
  } as unknown as SimHero;
}

test('MLBB Part 7: 7-Tab Settings Defaults, 3/4-Skill Custom UI Bounds, Smart 3-Tier AI, Auto-Director, Star Protection & Final QA Integrity', () => {
  // 1. 7-Tab Settings & Custom UI Editor Presets
  const save = createDefaultMlbbSave();
  assert.equal(save.settings.basics.refreshRate, 60);
  assert.equal(save.settings.basics.graphicsQuality, 'high');
  assert.equal(save.settings.controls.joystickPosition, 'fixed');
  assert.equal(save.settings.controls.aiDifficulty, 'epic');
  assert.equal(save.settings.interface.editorSnapToGrid, true);
  assert.equal(save.settings.sound.language, 'English');

  const ui3 = createDefaultCustomUi('3skill');
  const ui4 = createDefaultCustomUi('4skill');
  assert.equal(ui3.skill4, undefined);
  assert.ok(ui4.skill4, '4-Skill layout preset must include skill4 control');
  for (const ctrl of [...Object.values(ui3), ...Object.values(ui4)]) {
    assert.ok(ctrl.xPct >= 0 && ctrl.xPct <= 100);
    assert.ok(ctrl.yPct >= 0 && ctrl.yPct <= 100);
    assert.ok(ctrl.scale >= 0.5 && ctrl.scale <= 1.5);
    assert.ok(ctrl.opacity >= 0.2 && ctrl.opacity <= 1.0);
  }

  // 2. Smart AI 3-Tier Difficulty Profiles
  assert.equal(Object.keys(AI_DIFFICULTY_PROFILES).length, 3);
  const warrior = getAiDifficultyProfile('warrior');
  const mythic = getAiDifficultyProfile('mythic');
  assert.equal(warrior.enableCounterBuild, false);
  assert.equal(mythic.enableCounterBuild, true);
  assert.ok(mythic.retriMargin < warrior.retriMargin, 'Mythic Retribution precision must be tighter than Warrior');

  // 3. Dynamic Counter-Building (Anti-Heal vs Estes + Magic Defense vs Double Mage)
  const mmBot = makeSimHero({ id: 'b0', heroId: 'miya', team: 'blue', role: 'Marksman' });
  const enemies = [
    makeSimHero({ id: 'r0', heroId: 'estes', team: 'red', role: 'Support' }),
    makeSimHero({ id: 'r1', heroId: 'eudora', team: 'red', role: 'Mage', magicPow: 420 }),
    makeSimHero({ id: 'r2', heroId: 'kagura', team: 'red', role: 'Mage', magicPow: 380 })
  ];
  const adapted = computeCounterBuildPlan(mmBot, [mmBot, ...enemies]);
  assert.equal(adapted[4], 'sea_halberd', 'Marksman bot must counter-build Sea Halberd vs Estes');
  assert.equal(adapted[5], 'rose_gold_meteor', 'Marksman bot must counter-build Rose Gold Meteor vs double Mage');

  // 4. Jungler Gank Opportunity & Tank Peel & Clutch Active/Purify Reflexes
  const jungler = makeSimHero({ id: 'b1', heroId: 'lancelot', team: 'blue', role: 'Assassin', lane: 'Jungle', isJungler: true, x: 1000, y: 1000, hp: 3200, maxHp: 3500 });
  const overextendedEnemy = makeSimHero({ id: 'r3', heroId: 'layla', team: 'red', role: 'Marksman', x: 1450, y: 1100, hp: 1100, maxHp: 3200 });
  const turrets: SimTurret[] = [];
  const gank = findGankOpportunity(jungler, [jungler, overextendedEnemy], turrets);
  assert.equal(gank?.id, 'r3', 'Jungler should detect overextended low-HP Marksman gank opportunity');

  const tank = makeSimHero({ id: 'b2', heroId: 'tigreal', team: 'blue', role: 'Tank', isRoamer: true, x: 1000, y: 1000 });
  const allyMm = makeSimHero({ id: 'b3', heroId: 'miya', team: 'blue', role: 'Marksman', x: 1180, y: 1020, hp: 1800, maxHp: 3200 });
  const diver = makeSimHero({ id: 'r4', heroId: 'saber', team: 'red', role: 'Assassin', x: 1240, y: 1030 });
  const peel = findPeelTarget(tank, [tank, allyMm, diver]);
  assert.equal(peel?.id, 'r4', 'Tank must prioritize peeling Assassin diving allied Marksman');

  const stunnedBot = makeSimHero({ id: 'b4', heroId: 'claude', team: 'blue', spellId: 'purify', ccType: 'stun', ccTimer: 1.5 });
  assert.equal(shouldTriggerBotActiveOrPurify(stunnedBot, [diver], mythic), 'purify');
  const wonBot = makeSimHero({ id: 'b5', heroId: 'miya', team: 'blue', items: ['wind_of_nature'], hp: 1200, maxHp: 3500, x: 1100, y: 1030 });
  assert.equal(shouldTriggerBotActiveOrPurify(wonBot, [diver], mythic), 'active_item');

  // 5. Auto-Director Camera selects active teamfight / Turtle contest hero
  const quietHero = makeSimHero({ id: 'b6', heroId: 'zilong', team: 'blue', x: 200, y: 200 });
  const turtleMob: SimJungleMob = {
    id: 'turtle_1',
    name: 'Turtle',
    kind: 'turtle',
    teamSide: 'river',
    x: 1200,
    y: 1020,
    homeX: 1200,
    homeY: 1020,
    hp: 6000,
    maxHp: 6000,
    atk: 90,
    gold: 200,
    alive: true,
    respawnTimer: 0,
    atkCd: 0,
    spawnedOnce: true
  } as unknown as SimJungleMob;
  const directorPick = selectAutoDirectorHero([quietHero, allyMm, diver], [turtleMob], 150);
  assert.ok(directorPick === 'b3' || directorPick === 'r4', 'Auto-Director should focus active Turtle contest');

  // 6. Post-Match Star Protection (Points & Card) + Star Raising MVP Bonus
  const dummyRecord = (victory: boolean, medal: 'MVP' | 'Gold'): MlbbMatchRecord => ({
    id: 'test_match',
    timestamp: Date.now(),
    mode: 'ranked',
    victory,
    durationSec: 720,
    blueKills: victory ? 25 : 10,
    redKills: victory ? 12 : 24,
    playerHeroId: 'miya',
    playerHeroName: 'Miya',
    kda: victory ? [12, 1, 8] : [3, 6, 4],
    rating: victory ? 11.5 : 6.2,
    medal,
    items: ['swift_boots', 'windtalker'],
    players: []
  });

  // 6a. Ranked MVP Win with Star Raising Card -> +2 Stars & 2x BP/EXP
  const winSave = { ...save, rankStars: 10, backpack: { ...save.backpack, starRaisingCards: 1, doubleBpCards: 1, doubleExpCards: 1 } };
  const winRes = computePostMatchProgression(winSave, dummyRecord(true, 'MVP'));
  assert.equal(winRes.starDelta, 2);
  assert.equal(winRes.starRaisedBonus, true);
  assert.equal(winRes.doubleBpUsed, true);
  assert.equal(winRes.doubleExpUsed, true);
  assert.equal(winRes.nextProfile.rankStars, 12);

  // 6b. Ranked Defeat with 1000 Star Protection Points -> Star saved!
  const protPtsSave = { ...save, rankStars: 10, starProtectionPts: 1000, backpack: { ...save.backpack, starProtectionCards: 0 } };
  const protPtsRes = computePostMatchProgression(protPtsSave, dummyRecord(false, 'Gold'));
  assert.equal(protPtsRes.starDelta, 0);
  assert.equal(protPtsRes.starProtected, true);
  assert.equal(protPtsRes.starProtectionSource, 'points');
  assert.equal(protPtsRes.nextProfile.rankStars, 10);

  // 6c. Ranked Defeat with Backpack Star Protection Card -> Star saved!
  const protCardSave = { ...save, rankStars: 10, starProtectionPts: 200, backpack: { ...save.backpack, starProtectionCards: 1 } };
  const protCardRes = computePostMatchProgression(protCardSave, dummyRecord(false, 'Gold'));
  assert.equal(protCardRes.starDelta, 0);
  assert.equal(protCardRes.starProtected, true);
  assert.equal(protCardRes.starProtectionSource, 'card');
  assert.equal(protCardRes.nextProfile.backpack.starProtectionCards, 0);

  // 7. Final QA Asset Integrity across all 7 Parts
  assert.equal(MLBB_ALL_HEROES.length, 133);
  assert.equal(MLBB_ITEMS.length, 103);
  assert.equal(MLBB_EMBLEMS.length, 7);
  assert.equal(MLBB_TALENTS.length, 27);
  assert.equal(MLBB_BATTLE_SPELLS.length, 12);
  assert.equal(Object.keys(MAP_THEMES).length, 5);
});
