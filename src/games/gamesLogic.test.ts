import test from 'node:test';
import assert from 'node:assert/strict';

import { MM_MAPS, getMmMapById } from './mini-militia/data/maps';
import {
  MM_GRENADES,
  MM_PREBUILT_LOADOUTS,
  MM_SPECIAL_PERKS,
  MM_WEAPONS,
  canDualWieldPair,
  getMmWeaponById
} from './mini-militia/data/weapons';
import { MM_ACHIEVEMENTS, MM_RANKS, getMmRankForXp } from './mini-militia/data/progression';
import { applyMatchSummaryToSave, createDefaultMiniMilitiaSave } from './mini-militia/storage';

import {
  applyAntiHealReduction,
  applyAttackSpeedCap,
  applyCdrCap,
  applyMoveSpeedSoftCap,
  buildOmwRouteFromHero,
  canCleanseCc,
  classifyPingGesture,
  computeCriticalMultiplier,
  computeDeathRecapBreakdown,
  computeEffectiveDefense,
  computeFinalDamage,
  computeMatchRatingAndMedal,
  computeRetributionThreshold,
  computeTurretRampMultiplier,
  getCcPriority,
  isDashBlockingCc,
  resolveUniqueItemPassives
} from './legends-arena/mlbb/engine/CombatMath';
import { MLBB_ALL_HEROES, MLBB_ICONIC_HEROES, getMlbbHeroById } from './legends-arena/mlbb/data/heroes';
import { getHeroExtraSkillPreview, getHeroMasterySummary } from './legends-arena/mlbb/data/heroCatalogMeta';
import { PART4_HERO_IDS_A_TO_K, stepPart4HeroPassives } from './legends-arena/mlbb/engine/HeroKitsPart1';
import { PART5_HERO_IDS_K_TO_Z, stepPart5HeroPassives } from './legends-arena/mlbb/engine/HeroKitsPart2';
import { castBattleSpell, castHeroSkill, resolveWallCollision, type SimCallbacks, type SimHero, type SkillCastContext } from './legends-arena/mlbb/engine/SkillPhysics';
import {
  applyDefensiveItemAndTalentMitigation,
  applyEquipmentAndTalentStatMods,
  applyPostHitOffensiveTriggers,
  checkSkyPiercerExecute,
  computeHealOrShieldAmpMultiplier,
  computeOffensiveItemAndTalentMods,
  ensureEquipState,
  getEffectiveAttackRange,
  getJungleDamageMultiplier,
  getSpellOrActiveCdMultiplier,
  onHeroKillOrAssistEquipHooks,
  onHeroSkillCastEquipHooks,
  stepEquipmentAndTalentTimers,
  triggerSupportHealOrShieldHooks
} from './legends-arena/mlbb/engine/EquipmentCombatEngine';
import {
  ELEMENT_PALETTES,
  getDamageNumberStyle,
  getHeroCcBadge,
  getHeroElement,
  getHeroStackBadge,
  resolveHeroSilhouetteState
} from './legends-arena/mlbb/engine/VfxSystem';
import {
  MLBB_ITEMS,
  aggregateMlbbItemStats,
  applyMlbbItemPurchase,
  computeMlbbEffectiveCost,
  computeMlbbQuickBuy,
  computeMlbbSellRefund,
  getItemCraftingTree,
  getMlbbItemById,
  getProBuildTemplatesForHero
} from './legends-arena/mlbb/data/items';
import {
  MLBB_BATTLE_SPELLS,
  MLBB_EMBLEMS,
  MLBB_TALENTS,
  aggregateEmblemAndTalentPreviewStats
} from './legends-arena/mlbb/data/emblems';
import {
  BRAWL_BRIDGE_HALF_WIDTH,
  BRAWL_HEALING_SHRINES,
  BRAWL_TURRETS,
  BROKEN_WALL_IDS,
  clampToBrawlBridge,
  createJungleCampSpecs,
  DANGEROUS_GRASS_EXTRA_BUSHES,
  FOUR_SKILL_HERO_META,
  getActiveMapBushes,
  getActiveMapWalls,
  getRiverCurrentSpeedBonus,
  isFourSkillHero,
  isPointInBush,
  isPointInExpandedRiver,
  MAP_BUSHES,
  MAP_WALLS,
  MLBB_TIMERS as MLBB_25D_TIMERS,
  PRIMARY_2026_VARIANTS
} from './legends-arena/mlbb/data/mapData';
import { MlbbVisionSystem } from './legends-arena/mlbb/engine/VisionSystem';
import { MlbbPingSystem } from './legends-arena/mlbb/engine/PingSystem';
import {
  computeEarlyLaneMinionRewards,
  computeOuterTurretPlateDamage,
  computeTurretRingState,
  createInitialBrawlShrines,
  createWalkieGrassWard,
  selectWeakestEnemyLane,
  stepWalkieGrassWards
} from './legends-arena/mlbb/engine/BattlefieldSystems';
import { createDefaultMlbbSave } from './legends-arena/mlbb/storage';
import { MlbbAudioEngine } from './legends-arena/mlbb/engine/AudioEngine';
import {
  ALL_TEAMS,
  ALLSTAR_ONLY_TEAMS,
  CLASSIC_ONLY_TEAMS,
  EUROLEAGUE_ONLY_TEAMS,
  NBA_TEAMS,
  getTeamById
} from './hoops-2k26/nba2k14/data/rosters';
import {
  SIGNATURE_SKILLS,
  canGoCold,
  computeAnkleBreakerChance,
  computeReboundScore,
  computeScreenKnockdownChance,
  computeShotProbability,
  getHotThreshold
} from './hoops-2k26/nba2k14/data/signatureSkills';
import { BEATS_2K14_TRACKLIST, PATH_TO_GREATNESS_CHAPTERS, classifyShotZone } from './hoops-2k26/nba2k14/data/modesData';
import {
  applyMatchResultToSave,
  createDefaultSaveData,
  createDefaultSliders,
  redeemLockerCode
} from './hoops-2k26/nba2k14/storage';

import {
  advanceTournamentBracket,
  ASPHALT_CARS,
  ASPHALT_MAPS,
  BASKETBALL_TEAMS,
  BR_WEAPONS,
  computeMobaEquippedStats,
  computeMobaLeaderboard,
  computeUpgradedCarStats,
  createTournamentBracket,
  detectCooldownReadySlots,
  formatDailyCountdown,
  getCarUpgradeCost,
  getEmblemUpgradeCost,
  getHeroBaseElementTheme,
  getHeroCombatKit,
  getLocalDateKey,
  getMillisUntilMidnight,
  getMobaBlessingById,
  getMobaDailyMissionValue,
  getMobaEmblemBonus,
  getMobaEquipmentById,
  getMobaQuestValue,
  getMobaRankTitle,
  MOBA_ELEMENT_PALETTES,
  resolveElementStatusEffect,
  resolveSkillAimPoint,
  stepHealthTrail,
  triggerHealthTrailDamage,
  getNextQuickBuyRecommendation,
  HOOPS_MODES,
  MOBA_BOOT_BLESSINGS,
  MOBA_DAILY_MISSIONS,
  MOBA_EMBLEMS,
  MOBA_EMOTES,
  DEFAULT_STARTER_EMOTE_IDS,
  equipEmoteToSlot,
  getMobaEmoteById,
  normalizeEquippedEmotes,
  pickContextualAiEmote,
  MOBA_EQUIPMENT_ITEMS,
  MOBA_HEROES,
  MOBA_MODES,
  MOBA_QUESTS,
  MOBA_SPELLS,
  MOBA_MAP_VARIANTS,
  MLBB_TIMERS,
  CYCLONE_EYE_SPECS,
  MOBA_BASIC_ITEMS,
  MOBA_INTERMEDIATE_ITEMS,
  ROLE_BUILD_PRESETS,
  evaluateBattlefieldClock,
  createDynamicLaneAssignment,
  canRespawnNextTurtle,
  shouldTurtleDissipate,
  computeTurtleRewards,
  computeEvolvedLordNeutralDr,
  computeEvolvedLordSummonedDr,
  selectLordWeakestLane,
  computeOrangeBuffPenetrationPct,
  computeRetributionDamage,
  formatMatchClock,
  resolveMatchMapVariant,
  getItemRecipe,
  computeEffectiveItemCost,
  computeSellRefund,
  applyCraftedPurchase,
  getQuickBuyPair,
  NARUTO_MODES,
  NARUTO_SHINOBI_ROSTER,
  NARUTO_STAGES,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS,
  STORM_SUPPORT_TYPE_DEFS,
  computeSenkiLevelStats,
  computeStormComboProration,
  computeStormMaxUsableChakra,
  resolveNarutoTeamSynergy,
  selectSenkiTowerTarget,
  stepSubstitutionGauge,
  HOOPS_2K26_TEAMS,
  HOOPS_ERAS,
  HOOPS_40_BADGES,
  HOOPS_CITY_LOCATIONS,
  MYTEAM_CARDS,
  HOOPS_LOCKER_CODES,
  HOOPS_2K_BEATS,
  solveBuildByBadges,
  evaluateCustomJumpShot,
  redeemHoopsLockerCode,
  getRepTierForXp,
  getCrewBonusesForLevel,
  getPlateTierForScore,
  computeHoopsPostGameRewards,
  createDefaultHoops2K26Profile
} from '../core/arenaRoster';
import { ArcadeAudio, SFX_PACKS, SfxPackId } from '../core/audio';
import {
  addPresetButtonToLayout,
  clampControlPos,
  getDefaultGameLayout,
  GLOBAL_PRESET_BUTTONS,
  loadGameLayout,
  removeExtraButtonFromLayout,
  resetGameLayout,
  saveGameLayout
} from '../core/controlLayouts';
import {
  claimDailyReward,
  DAILY_COOLDOWN_MS,
  getOrCreatePendingDailyReward,
  isDailyRewardAvailable,
  MAX_DAILY_COINS,
  MIN_DAILY_COINS,
  rollDailyRewardAmount
} from '../core/dailyReward';
import { GAME_LIST } from '../core/instructions';
import {
  ensureCurrentMobaDailyState,
  loadUiPrefs,
  persistChessTime,
  playerState,
  recordMobaDailyEvent,
  saveUiPrefs,
  TOTAL_GAMES,
  tryStorage
} from '../core/storage';
import {
  computeViewportSnapshot,
  getOrientationMode,
  isSmartphoneFingerprint,
  mapClientDeltaToStage,
  mapClientToStage,
  setOrientationMode,
  toggleOrientationMode
} from '../core/viewport';
import { createToonMaterial, getToonGradientMap } from '../core/threeShared';
import { resolveCarCollisionStep } from './asphalt-nitro-3d/AsphaltNitro3D';
import {
  canAttemptDunk,
  computeShotWindow,
  computeShotWindowEnhanced,
  evaluateShotRelease,
  getTeammateGradeLabel,
  HOOP_X,
  isThreePointLocation,
  pickBestPassTargetIndex,
  stepAdrenalineBars,
  stepTakeoverMeter,
  stepTeammateGrade,
  QUARTER_DURATION_SEC,
  SHOT_CLOCK_SEC,
  stepMatchClocks
} from './hoops-2k26/basketballLogic';
import {
  computeSwipeTarget,
  createInitialCandyGrid,
  findMatchesOnGrid,
  hasAnyValidCandyMove,
  tickCandyTurnTimer
} from './candy-clash/candyLogic';
import { createGeniusChessEngine, classifyChessMove, cpToWinPercent } from './stockfish-chess/ChessEngine';
import {
  INGREDIENTS,
  RECIPE_BOOK,
  computeIngredientButtons,
  matchRecipe
} from './cooking-frenzy/cookingLogic';
import { buildQuestionDeck, CODE_HERO_QUESTIONS, getCodeHeroConfig } from './code-hero/CodeHero';
import { CROSSWORD_PACKS } from './crossword/Crossword';
import {
  isCrashLanding,
  normalizeAngle,
  terrainSlope,
  terrainY
} from './hill-climb/hillClimbPhysics';
import { PVZ_CARDS } from './plant-vs-zombie/PlantVsZombie';
import { pickBestPoolShot, resolvePoolWinner } from './eight-ball-pool/poolRules';
import { UNIT_CATALOG, canAffordUnit, computeStatueDamage } from './stick-war-legacy/stickWarLogic';
import { generateSudokuBoard, hasSudokuConflict, isSudokuSolved } from './sudoku/sudokuLogic';
import { pickRandomNextModeIndex } from './tactical-ops-fps/TacticalOpsFPS';
import { stepWormChain, wrapAngleDelta } from './worm-io/WormIo';

test('hillClimbPhysics: flat launch pad transitions smoothly into curvy hills & crash detection works', () => {
  assert.equal(terrainY(0, 600), terrainY(380, 600), 'Starting launch pad must be flat for clean launch');
  const ys = [380, 700, 1100, 1500, 2000].map((x) => terrainY(x, 600));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  assert.ok(maxY - minY > 40, 'Hill climb terrain must have strong vertical variation beyond start pad');

  const slope = terrainSlope(900, 600);
  assert.ok(Number.isFinite(slope));

  assert.equal(isCrashLanding(0.2, 0.25), false);
  assert.equal(isCrashLanding(0.95, 0), true);
  assert.equal(isCrashLanding(1.5, 1.45), true);
  assert.ok(Math.abs(normalizeAngle(Math.PI * 3) - Math.PI) < 0.001 || Math.abs(normalizeAngle(Math.PI * 3) + Math.PI) < 0.001);
});

test('candyLogic: grid setup, swipe matching, and turn countdown timer deducting move at zero', () => {
  const grid = createInitialCandyGrid(8, 8, 6);
  assert.equal(grid.length, 8);
  assert.equal(grid[0].length, 8);
  assert.equal(findMatchesOnGrid(grid).runs.length, 0);
  assert.equal(hasAnyValidCandyMove(grid), true);

  assert.equal(computeSwipeTarget(2, 2, 5, 4, 14, 8, 8), null);
  assert.deepEqual(computeSwipeTarget(2, 2, 24, 3, 14, 8, 8), { r: 2, c: 3 });
  assert.deepEqual(computeSwipeTarget(2, 2, -2, -20, 14, 8, 8), { r: 1, c: 2 });
  assert.equal(computeSwipeTarget(0, 0, -25, 0, 14, 8, 8), null);

  const midTick = tickCandyTurnTimer(5.0, 12.0, 10, 1.0);
  assert.equal(midTick.expired, false);
  assert.equal(midTick.movesLeft, 10);
  assert.equal(midTick.turnTimer, 4.0);

  const expTick = tickCandyTurnTimer(0.5, 12.0, 10, 1.0);
  assert.equal(expTick.expired, true);
  assert.equal(expTick.movesLeft, 9);
  assert.equal(expTick.turnTimer, 12.0);
});

test('cookingLogic: expanded 20 ingredients, 20 recipes, order-independent match, non-overlapping buttons', () => {
  assert.equal(INGREDIENTS.length, 20);
  assert.equal(RECIPE_BOOK.length, 20);

  const matched = matchRecipe(['🧀', '🥩', '🍞']);
  assert.ok(matched);
  assert.equal(matched!.name, 'Classic Burger');
  assert.equal(matchRecipe(['🍞', '🥩']), null);

  for (const [w, h, startY] of [
    [390, 620, 320],
    [1200, 680, 360],
    [844, 390, 186],
    [640, 360, 186]
  ]) {
    const btns = computeIngredientButtons(w, h, startY);
    assert.equal(btns.length, 20);
    for (let i = 0; i < btns.length; i++) {
      const a = btns[i];
      assert.ok(a.x >= 0 && a.x + a.w <= w, `button ${i} inside width ${w}`);
      assert.ok(a.y >= startY && a.y + a.h <= h, `button ${i} inside height ${h}`);
      for (let j = i + 1; j < btns.length; j++) {
        const b = btns[j];
        const overlap =
          a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        assert.equal(overlap, false, `buttons ${i} and ${j} must not overlap`);
      }
    }
  }
});

test('poolRules: resolves highest-score winner and picks an aiming angle toward target ball/pocket', () => {
  assert.equal(resolvePoolWinner(50, 30), 'player');
  assert.equal(resolvePoolWinner(20, 40), 'enemy');
  assert.equal(resolvePoolWinner(30, 30), 'draw');

  const shot = pickBestPoolShot(
    { x: 100, y: 200, isCue: true },
    [{ x: 250, y: 200 }, { x: 320, y: 120, is8: true }],
    [{ x: 420, y: 200 }, { x: 420, y: 60 }]
  );
  assert.ok(Number.isFinite(shot.angle));
  assert.ok(shot.power > 0);
  assert.ok(Math.abs(shot.angle) < 0.25);
});

test('sudokuLogic: generates valid 9x9 Latin square + boxes, flags conflicts, detects solution', () => {
  const { puzzle, solution, givens } = generateSudokuBoard('medium', 2);
  assert.equal(solution.length, 9);
  for (let r = 0; r < 9; r++) {
    assert.equal(new Set(solution[r]).size, 9, `row ${r} must have 9 unique digits`);
    const colVals = solution.map((row) => row[r]);
    assert.equal(new Set(colVals).size, 9, `col ${r} must have 9 unique digits`);
  }
  for (let br = 0; br < 9; br += 3) {
    for (let bc = 0; bc < 9; bc += 3) {
      const box = [];
      for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) box.push(solution[br + dr][bc + dc]);
      assert.equal(new Set(box).size, 9);
    }
  }

  assert.equal(isSudokuSolved(solution, solution), true);
  assert.equal(isSudokuSolved(puzzle, solution), false);
  assert.equal(givens.flat().filter(Boolean).length < 81, true);

  const dupBoard = solution.map((r) => [...r]);
  dupBoard[0][1] = dupBoard[0][0];
  assert.equal(hasSudokuConflict(dupBoard, 0, 1), true);
  assert.equal(hasSudokuConflict(solution, 0, 1), false);
});

test('stickWarLogic & PVZ_CARDS: expanded 8 troops and 9 PvZ cards', () => {
  assert.equal(UNIT_CATALOG.length, 8);
  assert.equal(canAffordUnit(49, 0), false);
  assert.equal(canAffordUnit(50, 0), true);
  assert.equal(canAffordUnit(420, 7), true);
  assert.equal(computeStatueDamage(20, false), 20);
  assert.equal(computeStatueDamage(20, true), 18);
  assert.ok(PVZ_CARDS.length >= 9, 'PvZ must have at least 8 plants + shovel');
});

test('TacticalOpsFPS: pickRandomNextModeIndex auto-rotates without repeating current mode', () => {
  for (let cur = 0; cur < 3; cur++) {
    for (const r of [0, 0.49, 0.99]) {
      const next = pickRandomNextModeIndex(cur, () => r);
      assert.ok(next >= 0 && next <= 2);
      assert.notEqual(next, cur);
    }
  }
});

test('ChessEngine: finds legal opening move and classifies best vs blunder accurately', () => {
  const engine = createGeniusChessEngine();
  const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const res = engine.findBestMove(startFen, 4, 300, 20, null);
  assert.match(res.bestUci, /^[a-h][1-8][a-h][1-8][qrbn]?$/);

  assert.ok(cpToWinPercent(500) > cpToWinPercent(0));
  const bestCls = classifyChessMove(
    { bestUci: 'e2e4', bestMoverCp: 30, secondBestMoverCp: 10, playedMoverCp: 30, numLegalMoves: 20, isSacrificeOffer: false },
    'e2e4',
    false
  );
  assert.equal(bestCls.tag, 'best');

  const blunderCls = classifyChessMove(
    { bestUci: 'd1h5', bestMoverCp: 450, secondBestMoverCp: 20, playedMoverCp: -250, numLegalMoves: 20, isSacrificeOffer: false },
    'a2a3',
    false
  );
  assert.equal(blunderCls.tag, 'blunder');
});

test('GAME_LIST & controlLayouts: 29 games (5 3D + 24 2D), categories, orientation hints, and preset button CRUD', () => {
  assert.equal(TOTAL_GAMES, 29);
  assert.equal(GAME_LIST.length, 29);
  assert.equal(playerState.highScores.length, 29);

  const count3d = GAME_LIST.filter((g) => Boolean(g.is3DGame)).length;
  const count2d = GAME_LIST.filter((g) => !g.is3DGame).length;
  assert.equal(count3d, 5);
  assert.equal(count2d, 24);

  const validCats = new Set(['action', 'racing', 'shooter', 'puzzle', 'strategy', 'sports', 'arcade']);
  GAME_LIST.forEach((g, idx) => {
    assert.equal(g.id, idx, `Game at index ${idx} must have contiguous id ${idx}`);
    assert.ok(g.category && validCats.has(g.category), `Game ${g.id} must have a valid category`);
  });

  const withHp = GAME_LIST.filter((g) => g.showHealthBar).map((g) => g.id);
  assert.deepEqual(withHp, [7, 15, 17, 22, 24, 25, 28]);
  assert.equal(GAME_LIST[23].is3DGame ?? false, false);
  assert.equal(GAME_LIST[24].is3DGame, true);
  assert.equal(GAME_LIST[25].is3DGame, true);
  assert.equal(GAME_LIST[26].is3DGame, true);
  assert.equal(GAME_LIST[27].is3DGame, true);
  assert.equal(GAME_LIST[28].is3DGame, true);
  assert.equal(GAME_LIST[27].category, 'sports');
  assert.equal(GAME_LIST[28].category, 'action');
  assert.equal(GAME_LIST[25].preferredOrientation, 'landscape');
  assert.equal(GAME_LIST[26].preferredOrientation, 'landscape');
  assert.equal(GAME_LIST[27].preferredOrientation, 'landscape');
  assert.equal(GAME_LIST[28].preferredOrientation, 'landscape');

  let layout = getDefaultGameLayout(11);
  assert.equal(layout.extras.length, 0);
  assert.equal(layout.controlMode, 'buttons');
  assert.deepEqual(layout.analog, { xPct: 16, yPx: 32, scale: 1.0, visible: true });

  // Verify Hoops 2K26 default layout includes movement + steal + sprint
  const hoopsLayout = getDefaultGameLayout(27);
  assert.equal(hoopsLayout.extras.length, 4);
  assert.ok(hoopsLayout.extras.some((e) => e.actionKey === 'steal'));
  assert.ok(hoopsLayout.extras.some((e) => e.actionKey === 'sprint'));

  // Verify every game layout supports controlMode + expanded global presets (directions, hint, fire, pass, steal, sprint)
  const presetKeys = new Set(GLOBAL_PRESET_BUTTONS.map((p) => p.actionKey));
  assert.equal(presetKeys.size, GLOBAL_PRESET_BUTTONS.length, 'GLOBAL_PRESET_BUTTONS actionKeys must be unique');
  for (const reqKey of ['left', 'right', 'moveUp', 'down', 'fire', 'hint', 'jump', 'boost', 'drift', 'skill1', 'skill4', 'regen', 'pass', 'steal', 'sprint']) {
    assert.ok(presetKeys.has(reqKey), `Missing preset key: ${reqKey}`);
  }

  // Verify Legends Arena 3D (game 25) default MLBB arc includes Skill 1-4, Spell, Regen, Recall
  const mobaLayout = getDefaultGameLayout(25);
  assert.equal(mobaLayout.controlMode, 'buttons');
  const mobaExtraKeys = mobaLayout.extras.map((e) => e.actionKey);
  for (const k of ['skill2', 'skill3', 'skill4', 'spell', 'regen', 'recall']) {
    assert.ok(mobaExtraKeys.includes(k), `MOBA layout missing ${k}`);
  }

  for (const preset of [GLOBAL_PRESET_BUTTONS[0], GLOBAL_PRESET_BUTTONS.find((p) => p.actionKey === 'hint')!]) {
    layout = addPresetButtonToLayout(layout, preset);
  }
  assert.equal(layout.extras.length, 2);
  const addedId = layout.extras[0].id;
  layout = removeExtraButtonFromLayout(layout, addedId);
  assert.equal(layout.extras.length, 1);
  const clamped = clampControlPos(-20, 999, 5);
  assert.deepEqual(clamped, { xPct: 6, yPx: 280, scale: 1.8 });
  const reset = resetGameLayout(24);
  assert.ok(reset.extras.length >= 2);
  assert.equal(reset.controlMode, 'buttons');
});

test('threeShared cel-shading helpers: 4-band toon gradient map and MeshToonMaterial', () => {
  const grad = getToonGradientMap();
  assert.equal(grad.image.width, 4);
  assert.equal(grad.image.height, 1);
  const mat = createToonMaterial(0x38bdf8, { emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
  assert.equal(mat.gradientMap, grad);
  assert.equal(mat.isMeshToonMaterial, true);
});

test('arenaRoster & Asphalt car collisions: 129 renamed MOBA heroes, modes, emblems, quests, 4 BR guns, 8 Supercars, 4 maps, and collision separation', () => {
  assert.equal(MOBA_HEROES.length, 129);
  const weapons = new Set(MOBA_HEROES.map((h) => h.weapon));
  assert.equal(weapons.size, 6, 'All 6 3D weapon types must be represented across the 129 MOBA heroes');

  const heroNames = new Set(MOBA_HEROES.map((h) => h.name));
  assert.equal(heroNames.size, 129, 'All 129 renamed MOBA hero names must be unique');

  const roleCounts = new Map<string, number>();
  for (const h of MOBA_HEROES) {
    roleCounts.set(h.role, (roleCounts.get(h.role) || 0) + 1);
  }
  assert.equal(roleCounts.get('Marksman'), 20);
  assert.equal(roleCounts.get('Tank'), 21);
  assert.equal(roleCounts.get('Fighter'), 39);
  assert.equal(roleCounts.get('Assassin'), 18);
  assert.equal(roleCounts.get('Mage'), 24);
  assert.equal(roleCounts.get('Support'), 7);

  const starters = MOBA_HEROES.filter((h) => h.unlockCost === 0);
  assert.equal(starters.length, 3);
  const paidHeroes = MOBA_HEROES.filter((h) => h.unlockCost > 0);
  assert.equal(paidHeroes.length, 126);
  for (const h of paidHeroes) {
    assert.ok(h.unlockCost >= 100 && h.unlockCost <= 500, `Hero ${h.name} unlockCost ${h.unlockCost} out of 100..500 range`);
  }

  for (const canonical of ['Miya', 'Layla', 'Tigreal', 'Alucard', 'Balmond', 'Saber', 'Nana', 'Eudora', 'Rafaela', 'Zilong', 'Lancelot', 'Johnson', 'Kagura', 'Yve']) {
    assert.equal(heroNames.has(canonical), true, `Canonical MLBB hero ${canonical} must exist in MOBA_HEROES`);
  }

  assert.equal(MOBA_MODES.length, 6);
  assert.deepEqual(MOBA_MODES.map((m) => m.id), ['ranked', 'classic', 'brawl', 'ai_vs', 'overdrive', 'custom']);
  assert.equal(MOBA_EMBLEMS.length, 7);
  assert.equal(getEmblemUpgradeCost(1), 50);
  assert.equal(getEmblemUpgradeCost(5), 0);
  const emblemBonusLv1 = getMobaEmblemBonus('Assassin', 1);
  const emblemBonusLv5 = getMobaEmblemBonus('Assassin', 5);
  assert.ok(emblemBonusLv5.atkBonus > emblemBonusLv1.atkBonus);
  assert.ok(emblemBonusLv5.spdBonus > emblemBonusLv1.spdBonus);
  assert.ok(emblemBonusLv5.cdReduction > emblemBonusLv1.cdReduction);
  const emblemWithTalents = getMobaEmblemBonus('Assassin', 5, {
    t1: 'thrill',
    t2: 'weapons_master',
    t3: 'killing_spree'
  });
  assert.ok(emblemWithTalents.atkBonus > emblemBonusLv5.atkBonus, 'Talents should augment emblem bonus stats');

  assert.ok(MOBA_QUESTS.length >= 4);
  assert.equal(getMobaQuestValue(MOBA_QUESTS[0], { matches: 3, kills: 9, wins: 2, turrets: 4, unlockedCount: 5 }), 3);
  const lb = computeMobaLeaderboard('Tester', 24, 8);
  assert.ok(lb.some((e) => e.isPlayer && e.rankTitle === 'Mythical Immortal'));

  assert.equal(MOBA_SPELLS.length, 12);
  assert.equal(getMobaRankTitle(0), 'Warrior');
  assert.equal(getMobaRankTitle(24), 'Mythical Immortal');

  assert.equal(BR_WEAPONS.length, 4);
  assert.deepEqual(BR_WEAPONS.map((w) => w.slot), [1, 2, 3, 4]);
  const shotty = BR_WEAPONS.find((w) => w.id === 'shotgun');
  assert.ok(shotty && shotty.pellets === 6);

  assert.equal(ASPHALT_CARS.length, 8);
  assert.equal(ASPHALT_CARS[0].unlockCost, 0);
  for (let i = 1; i < ASPHALT_CARS.length; i++) {
    assert.ok(ASPHALT_CARS[i].unlockCost > 0, `Car ${ASPHALT_CARS[i].name} must cost coins`);
  }
  const styles = new Set(ASPHALT_CARS.map((c) => c.style));
  assert.equal(styles.size, 4, 'Supercars must span all 4 body silhouettes');

  assert.equal(getCarUpgradeCost(1), 60);
  assert.equal(getCarUpgradeCost(4), 240);
  assert.equal(getCarUpgradeCost(5), 0);

  const baseStats = computeUpgradedCarStats(ASPHALT_CARS[0], { speed: 1, accel: 1, nitro: 1, handling: 1 });
  const maxStats = computeUpgradedCarStats(ASPHALT_CARS[0], { speed: 5, accel: 5, nitro: 5, handling: 5 });
  assert.ok(maxStats.topSpeed > baseStats.topSpeed);
  assert.ok(maxStats.nitroSpeed > baseStats.nitroSpeed);
  assert.ok(maxStats.accelRate > baseStats.accelRate);
  assert.ok(maxStats.steerSpeed > baseStats.steerSpeed);
  assert.ok(maxStats.nitroDrain < baseStats.nitroDrain);

  assert.equal(ASPHALT_MAPS.length, 4);
  assert.deepEqual(
    ASPHALT_MAPS.map((m) => m.missionKind),
    ['race', 'takedown', 'gates', 'elimination']
  );

  const carA = { s: 0.1, lane: 1.0, speed: 80, yOff: 0, mass: 1.5, knockTimer: 0 };
  const carB = { s: 0.1005, lane: 1.4, speed: 50, yOff: 0, mass: 1.0, knockTimer: 0 };
  const col = resolveCarCollisionStep(carA, carB, 1300, 8.6);
  assert.equal(col.hit, true);
  assert.ok(Math.abs(carA.lane - carB.lane) >= 2.1 || Math.abs(carA.s - carB.s) * 1300 >= 4.4);

  assert.equal(BASKETBALL_TEAMS.length, 4);
  assert.equal(HOOPS_MODES.length, 4);
  assert.deepEqual(
    HOOPS_MODES.map((m) => m.id),
    ['2v2', '3v3', '5v5', 'tournament']
  );

  const bracket = createTournamentBracket(0);
  assert.equal(bracket.round, 1);
  assert.equal(bracket.opponents.length, 3);
  const r2 = advanceTournamentBracket(bracket, true);
  assert.equal(r2.nextState.round, 2);
  assert.equal(r2.wonChampionship, false);
  const r3 = advanceTournamentBracket(r2.nextState, true);
  assert.equal(r3.nextState.round, 3);
  const champ = advanceTournamentBracket(r3.nextState, true);
  assert.equal(champ.wonChampionship, true);
  assert.equal(champ.bonusCoins, 150);
  const resetAfterLoss = advanceTournamentBracket(r3.nextState, false);
  assert.equal(resetAfterLoss.nextState.round, 1);
  assert.equal(resetAfterLoss.bonusCoins, 0);
});

test('basketballLogic: 3-pointer zones, dunk check, Green Release shot meter, passing, and Q1-Q4/OT clocks', () => {
  // 2pt vs 3pt detection
  assert.equal(isThreePointLocation(HOOP_X - 4.0, 0, HOOP_X), false);
  assert.equal(isThreePointLocation(HOOP_X - 8.2, 0, HOOP_X), true);
  assert.equal(isThreePointLocation(HOOP_X - 1.5, 10.2, HOOP_X), true);

  // Dunk trigger check
  assert.equal(canAttemptDunk(HOOP_X - 2.6, 0.4, HOOP_X, true, 0.5), true);
  assert.equal(canAttemptDunk(HOOP_X - 5.2, 0, HOOP_X, true, 0.8), false);
  assert.equal(canAttemptDunk(HOOP_X - 2.8, 0, HOOP_X, false, 0.8), false);

  // Shot meter & guaranteed Green Release
  const win = computeShotWindow({
    shooterPos: { x: HOOP_X - 8.5, z: 0 },
    hoopX: HOOP_X,
    defenderDistances: [6.0, 8.5],
    shootRating: 5,
    staminaRatio: 0.9,
    sprinting: false
  });
  assert.equal(win.points, 3);
  const greenCenter = (win.greenStart + win.greenEnd) * 0.5;
  const greenEval = evaluateShotRelease(greenCenter, win.greenStart, win.greenEnd, win.baseMakeProb, win.points);
  assert.equal(greenEval.quality, 'GREEN');
  assert.equal(greenEval.isGreen, true);
  assert.equal(greenEval.makeProb, 1.0);
  assert.equal(greenEval.points, 3);

  const earlyEval = evaluateShotRelease(0.25, win.greenStart, win.greenEnd, win.baseMakeProb, win.points);
  assert.equal(earlyEval.quality, 'EARLY');
  assert.equal(earlyEval.isGreen, false);

  // Best teammate pass selection
  const chosen = pickBestPassTargetIndex(
    { x: 5, z: 0 },
    { x: 0, z: -1 },
    HOOP_X,
    0,
    [
      { index: 0, x: 5, z: 0 },
      { index: 1, x: 11, z: -8 },
      { index: 2, x: 11, z: 8 }
    ]
  );
  assert.equal(chosen, 1);

  // Match & shot clocks: shot clock violation, Q4 tie -> OT, Q4 non-tie -> matchOver
  const vio = stepMatchClocks(1, 30, 0.1, 10, 8, 0.25);
  assert.equal(vio.shotClockViolation, true);
  assert.equal(vio.shotClock, SHOT_CLOCK_SEC);

  const q1End = stepMatchClocks(1, 0.1, 12, 14, 12, 0.2);
  assert.equal(q1End.quarterEnded, true);
  assert.equal(q1End.quarter, 2);
  assert.equal(q1End.quarterClock, QUARTER_DURATION_SEC);

  const otTrigger = stepMatchClocks(4, 0.1, 10, 42, 42, 0.2);
  assert.equal(otTrigger.quarter, 5);
  assert.equal(otTrigger.matchOver, false);

  const buzzerWin = stepMatchClocks(4, 0.1, 10, 45, 42, 0.2);
  assert.equal(buzzerWin.matchOver, true);

  // 1-period streetball (2v2 / 3v3) finishes after quarter 1 unless tied
  const streetWin = stepMatchClocks(1, 0.1, 10, 21, 17, 0.2, 1, 75);
  assert.equal(streetWin.matchOver, true);
  const streetOt = stepMatchClocks(1, 0.1, 10, 20, 20, 0.2, 1, 75);
  assert.equal(streetOt.matchOver, false);
  assert.equal(streetOt.quarter, 2);
});

test('dailyReward: 50-200 inclusive range, pending lock, and 24-hour rolling cooldown', () => {
  assert.equal(rollDailyRewardAmount(() => 0), MIN_DAILY_COINS);
  assert.equal(rollDailyRewardAmount(() => 0.9999999), MAX_DAILY_COINS);
  for (let i = 0; i < 200; i++) {
    const rolled = rollDailyRewardAmount(() => i / 200);
    assert.ok(rolled >= MIN_DAILY_COINS && rolled <= MAX_DAILY_COINS);
  }

  assert.equal(isDailyRewardAvailable(null, 1_000_000), true);
  assert.equal(isDailyRewardAvailable(1_000_000, 1_000_000 + DAILY_COOLDOWN_MS - 1), false);
  assert.equal(isDailyRewardAvailable(1_000_000, 1_000_000 + DAILY_COOLDOWN_MS), true);

  const mem: Record<string, string> = {};
  const store = {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v;
    }
  };

  let rngCalls = 0;
  const rngSeq = () => {
    rngCalls += 1;
    return rngCalls === 1 ? 0.5 : 0.99;
  };

  const t0 = 1_700_000_000_000;
  const firstPending = getOrCreatePendingDailyReward(t0, store, rngSeq);
  assert.equal(firstPending.available, true);
  assert.ok(firstPending.amount !== null && firstPending.amount >= 50 && firstPending.amount <= 200);

  // Subsequent visit before claiming keeps exact locked roll instead of re-rolling
  const lockedPending = getOrCreatePendingDailyReward(t0 + 5_000, store, rngSeq);
  assert.equal(lockedPending.amount, firstPending.amount);
  assert.equal(rngCalls, 1);

  const claimRes = claimDailyReward(t0 + 10_000, store, rngSeq);
  assert.equal(claimRes.claimed, true);
  assert.equal(claimRes.amount, firstPending.amount);

  // Immediately blocked for 24 hours after claim timestamp
  const blocked = getOrCreatePendingDailyReward(t0 + 10_000 + DAILY_COOLDOWN_MS - 1, store, rngSeq);
  assert.equal(blocked.available, false);
  assert.equal(blocked.amount, null);
  assert.equal(claimDailyReward(t0 + 10_000 + DAILY_COOLDOWN_MS - 1, store, rngSeq).claimed, false);

  // Available again once 24 hours have passed
  const nextCycle = getOrCreatePendingDailyReward(t0 + 10_000 + DAILY_COOLDOWN_MS, store, rngSeq);
  assert.equal(nextCycle.available, true);
  assert.equal(nextCycle.amount, 199);
});

test('WormIo: wrapAngleDelta shortest arc across +-PI and stepWormChain 60Hz vs 120Hz parity', () => {
  const crossPos = wrapAngleDelta(Math.PI - 0.1, -Math.PI + 0.1);
  assert.ok(Math.abs(crossPos - 0.2) < 1e-9, `expected +0.2 across +PI, got ${crossPos}`);

  const crossNeg = wrapAngleDelta(-Math.PI + 0.1, Math.PI - 0.1);
  assert.ok(Math.abs(crossNeg + 0.2) < 1e-9, `expected -0.2 across -PI, got ${crossNeg}`);

  assert.ok(Math.abs(wrapAngleDelta(0.5, 0.5)) < 1e-12);

  // 60Hz vs 120Hz straight-line travel over 0.5 seconds must yield identical head advance and segment spacing
  const makeChain = (len: number) =>
    Array.from({ length: len }, (_, i) => ({ x: 500 - i * 8, y: 500 }));

  const pts60 = makeChain(6);
  const pts120 = makeChain(6);

  for (let i = 0; i < 30; i++) stepWormChain(pts60, 0.35, 180, 1 / 60, 10, 8);
  for (let i = 0; i < 60; i++) stepWormChain(pts120, 0.35, 180, 1 / 120, 10, 8);

  assert.equal(pts60.length, 10);
  assert.equal(pts120.length, 10);
  assert.ok(Math.abs(pts60[0].x - pts120[0].x) < 1e-6);
  assert.ok(Math.abs(pts60[0].y - pts120[0].y) < 1e-6);

  // Verify segment spacing invariant and shrinking targetLen
  for (let i = 1; i < pts60.length; i++) {
    const segDist = Math.hypot(pts60[i].x - pts60[i - 1].x, pts60[i].y - pts60[i - 1].y);
    assert.ok(Math.abs(segDist - 8) < 1e-6 || segDist === 0);
  }
  stepWormChain(pts60, 0, 180, 1 / 60, 4, 8);
  assert.equal(pts60.length, 4);
});

test('viewport: smartphone detection, auto-landscape rotated fallback, inverse pointer mapping, and orientation toggle', () => {
  assert.equal(
    isSmartphoneFingerprint({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) Mobile/15E148',
      maxTouchPoints: 5,
      hasCoarsePointer: true,
      hasTouchStart: true,
      screenW: 390,
      screenH: 844,
      innerW: 390,
      innerH: 844
    }),
    true
  );

  assert.equal(
    isSmartphoneFingerprint({
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36',
      maxTouchPoints: 5,
      hasCoarsePointer: true,
      hasTouchStart: true,
      screenW: 412,
      screenH: 915,
      innerW: 412,
      innerH: 915
    }),
    true
  );

  // Desktop and large tablets should not trigger phone auto-rotation
  assert.equal(
    isSmartphoneFingerprint({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
      maxTouchPoints: 0,
      hasCoarsePointer: false,
      hasTouchStart: false,
      screenW: 1440,
      screenH: 900,
      innerW: 1280,
      innerH: 800
    }),
    false
  );

  assert.equal(
    isSmartphoneFingerprint({
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
      hasCoarsePointer: true,
      hasTouchStart: true,
      screenW: 768,
      screenH: 1024,
      innerW: 768,
      innerH: 1024
    }),
    false
  );

  // Smartphone portrait + Auto mode + no native lock => CSS rotated landscape fallback
  const rotated = computeViewportSnapshot(390, 844, true, 'auto', false);
  assert.equal(rotated.isRotatedFallback, true);
  assert.equal(rotated.physicalOrientation, 'portrait');
  assert.equal(rotated.logicalWidth, 844);
  assert.equal(rotated.logicalHeight, 390);

  // Smartphone portrait + Free mode => usable native portrait
  const freePortrait = computeViewportSnapshot(390, 844, true, 'free', false);
  assert.equal(freePortrait.isRotatedFallback, false);
  assert.equal(freePortrait.logicalWidth, 390);
  assert.equal(freePortrait.logicalHeight, 844);

  // Native locked landscape => no double rotation
  const nativeLocked = computeViewportSnapshot(844, 390, true, 'auto', true);
  assert.equal(nativeLocked.isRotatedFallback, false);
  assert.equal(nativeLocked.logicalWidth, 844);
  assert.equal(nativeLocked.logicalHeight, 390);

  // Inverse coordinate mapping inside rotated 90deg stage:
  // Top-right of physical portrait screen (clientX=390, clientY=0) is top-left (0, 0) of rotated landscape stage
  assert.deepEqual(mapClientToStage(390, 0, rotated), { x: 0, y: 0 });
  // Bottom-left of physical portrait screen (clientX=0, clientY=844) is bottom-right (844, 390) of rotated landscape stage
  assert.deepEqual(mapClientToStage(0, 844, rotated), { x: 844, y: 390 });
  // Center stays at center
  assert.deepEqual(mapClientToStage(195, 422, rotated), { x: 422, y: 195 });

  // Delta mapping: dragging physically downward (+dy) moves rightward (+dx) in landscape stage
  assert.deepEqual(mapClientDeltaToStage(10, 25, rotated), { dx: 25, dy: -10 });
  assert.deepEqual(mapClientToStage(120, 240, freePortrait), { x: 120, y: 240 });

  // Orientation mode switching persists and toggles cleanly
  setOrientationMode('auto');
  assert.equal(getOrientationMode(), 'auto');
  assert.equal(toggleOrientationMode(), 'free');
  assert.equal(getOrientationMode(), 'free');
  assert.equal(toggleOrientationMode(), 'auto');
});

test('ArcadeAudio sound effect packs: 3 global packs, runtime switching, invalid guard, and persistence', () => {
  assert.equal(SFX_PACKS.length, 3);
  assert.deepEqual(SFX_PACKS.map((p) => p.id), ['classic', 'realistic', 'retro']);

  const prevPack = ArcadeAudio.getSfxPack();
  ArcadeAudio.setSfxPack('realistic', false);
  assert.equal(ArcadeAudio.getSfxPack(), 'realistic');
  assert.equal(tryStorage.getItem('tsepang_sfx_pack'), 'realistic');

  ArcadeAudio.setSfxPack('retro', false);
  assert.equal(ArcadeAudio.getSfxPack(), 'retro');
  assert.equal(tryStorage.getItem('tsepang_sfx_pack'), 'retro');

  // Invalid pack id should be ignored
  ArcadeAudio.setSfxPack('unknown_pack' as SfxPackId, false);
  assert.equal(ArcadeAudio.getSfxPack(), 'retro');

  // Restore original pack
  ArcadeAudio.setSfxPack(prevPack, false);
  assert.equal(ArcadeAudio.getSfxPack(), prevPack);
});

test('Legends Arena 3D: Daily Missions midnight rollover, 4-skill heroes, and per-hero combat kits', () => {
  assert.equal(MOBA_DAILY_MISSIONS.length, 5);
  assert.ok(MOBA_DAILY_MISSIONS.some((m) => m.stat === 'matches' && m.target === 3));
  assert.ok(MOBA_DAILY_MISSIONS.some((m) => m.stat === 'ranked_wins' && m.target === 1));

  const day1 = new Date(2026, 10, 18, 10, 30, 0);
  const day2 = new Date(2026, 10, 19, 0, 5, 0);
  assert.equal(getLocalDateKey(day1), '2026-11-18');
  assert.equal(getLocalDateKey(day2), '2026-11-19');
  assert.ok(getMillisUntilMidnight(day1) > 0);
  assert.match(formatDailyCountdown(getMillisUntilMidnight(day1)), /^\d+h \d{2}m$/);

  const prevDaily = { ...playerState.mobaDaily, claimedIds: [...playerState.mobaDaily.claimedIds] };
  ensureCurrentMobaDailyState(day1);
  recordMobaDailyEvent('match', 3, day1);
  recordMobaDailyEvent('ranked_win', 1, day1);
  recordMobaDailyEvent('kill', 5, day1);
  recordMobaDailyEvent('jungle', 6, day1);
  recordMobaDailyEvent('boss', 1, day1);
  assert.equal(getMobaDailyMissionValue(MOBA_DAILY_MISSIONS[0], playerState.mobaDaily), 3);
  assert.equal(getMobaDailyMissionValue(MOBA_DAILY_MISSIONS[1], playerState.mobaDaily), 1);

  // Midnight rollover resets daily counters automatically for day2
  const rolled = ensureCurrentMobaDailyState(day2);
  assert.equal(rolled.dateKey, '2026-11-19');
  assert.equal(rolled.matchesPlayed, 0);
  assert.equal(rolled.rankedWins, 0);
  assert.equal(rolled.claimedIds.length, 0);
  playerState.mobaDaily = prevDaily;

  // Verify 4-skill heroes and per-hero combat kits across all 129 canonical MLBB heroes
  const fourSkillNames = MOBA_HEROES.filter((h) => Boolean(h.skill4)).map((h) => h.name);
  assert.deepEqual(fourSkillNames, ['Chip', 'Fredrinn', 'Sun', 'Zhask', 'Pharsa', 'Lunox']);

  // Verify signature iconic ultimates are tagged
  const iconicChecks: Array<[string, string]> = [
    ['Tigreal', 'tigreal_implosion'],
    ['Lancelot', 'lancelot_thorned_rose'],
    ['Johnson', 'johnson_car'],
    ['Yve', 'yve_chessboard'],
    ['Kagura', 'kagura_overturn']
  ];
  for (const [heroName, expectedTag] of iconicChecks) {
    const hero = MOBA_HEROES.find((h) => h.name === heroName);
    assert.ok(hero, `Missing iconic hero ${heroName}`);
    const kit = getHeroCombatKit(hero);
    assert.ok(
      kit.skills.some((sk) => sk.iconicUlt === expectedTag),
      `${heroName} kit must tag iconicUlt=${expectedTag}`
    );
  }

  // Verify custom 6-item build overrides default Quick-Buy recommendation (alias resolves to canonical 'bod')
  const customRec = getNextQuickBuyRecommendation('Marksman', [], null, 2000, ['blade_of_despair', 'rapid_boots']);
  assert.ok(customRec && customRec.id === 'bod');

  for (const hero of MOBA_HEROES) {
    const expectedSkills = hero.skill4 ? 4 : 3;
    assert.equal(hero.skills.length, expectedSkills, `${hero.name} skill count mismatch`);
    const kit = getHeroCombatKit(hero);
    assert.equal(kit.skills.length, expectedSkills, `${hero.name} combat kit length mismatch`);
    assert.ok(kit.passiveLabel.length > 0);
    for (const sk of kit.skills) {
      assert.ok(sk.shortLabel.length > 0);
      assert.ok(sk.cdSec > 0);
      assert.ok(sk.dmgMult > 0);
    }
  }
});

test('Legends Arena 3D: 52 MLBB Tier-3 Equipment items, 7 Boot Blessings, Blue/Orange Buff Golem boosts, Active Skills, and Quick-Buy', () => {
  assert.equal(MOBA_EQUIPMENT_ITEMS.length, 52);
  assert.equal(MOBA_EQUIPMENT_ITEMS.filter((i) => i.category === 'attack').length, 17);
  assert.equal(MOBA_EQUIPMENT_ITEMS.filter((i) => i.category === 'magic').length, 15);
  assert.equal(MOBA_EQUIPMENT_ITEMS.filter((i) => i.category === 'defense').length, 13);
  assert.equal(MOBA_EQUIPMENT_ITEMS.filter((i) => i.category === 'movement').length, 7);
  assert.equal(MOBA_BOOT_BLESSINGS.length, 7);
  assert.equal(MOBA_BOOT_BLESSINGS.filter((b) => b.kind === 'jungling').length, 3);
  assert.equal(MOBA_BOOT_BLESSINGS.filter((b) => b.kind === 'roaming').length, 4);

  // Verify default layout for game 25 includes the dedicated Active Item HUD slot (ml_item)
  const mobaLayout = getDefaultGameLayout(25);
  assert.ok(mobaLayout.extras.some((b) => b.id === 'ml_item' && b.actionKey === 'itemActive'));

  const zeroEmblem = { hpBonus: 0, atkBonus: 0, spdBonus: 0, cdReduction: 0 };
  const sampleHero = MOBA_HEROES[0];
  const mmHero = MOBA_HEROES.find((h) => h.role === 'Marksman') || sampleHero;
  const mageHero = MOBA_HEROES.find((h) => h.role === 'Mage') || sampleHero;
  const tankHero = MOBA_HEROES.find((h) => h.role === 'Tank') || sampleHero;

  // Base hero stats without equipment or buffs
  const base = computeMobaEquippedStats(sampleHero, zeroEmblem, [], null, false, false);
  assert.equal(base.atkDmg, sampleHero.atkDmg);
  assert.equal(base.maxHp, sampleHero.maxHp);
  assert.equal(base.activeKind, null);

  // Blue Buff Golem (+20% CDR & HP Regen) and Orange Buff Golem (+22% Adaptive Attack)
  const withBuffs = computeMobaEquippedStats(sampleHero, zeroEmblem, [], null, true, true);
  assert.ok(withBuffs.atkDmg > base.atkDmg, 'Orange Buff Golem must boost attack damage');
  assert.equal(withBuffs.cdrPct, 20, 'Blue Buff Golem must grant +20% Cooldown Reduction');
  assert.ok(withBuffs.hpRegenPerSec > base.hpRegenPerSec, 'Blue Buff Golem must boost HP regen');

  // Attack + Crit + Malefic Gun range + Wind of Nature Active skill
  const mmBase = computeMobaEquippedStats(mmHero, zeroEmblem, [], null, false, false);
  const mmStats = computeMobaEquippedStats(
    mmHero,
    zeroEmblem,
    ['swift_boots', 'berserkers_fury', 'malefic_gun', 'wind_of_nature', 'blade_of_despair'],
    null,
    false,
    false
  );
  assert.ok(mmStats.atkDmg > mmBase.atkDmg + 20);
  assert.ok(mmStats.critChance >= 0.25);
  assert.ok(mmStats.critMult > 1.85);
  assert.ok(mmStats.atkRange > mmBase.atkRange, 'Malefic Gun must increase basic attack range by 15%');
  assert.equal(mmStats.activeKind, 'wind_chant');
  assert.equal(mmStats.hasDespair, true);

  // Golden Staff converts Critical Chance into Attack Speed and disables crits
  const gsStats = computeMobaEquippedStats(
    mmHero,
    zeroEmblem,
    ['berserkers_fury', 'golden_staff'],
    null,
    false,
    false
  );
  assert.equal(gsStats.critChance, 0);
  assert.ok(gsStats.atkSpeedMult > 1.35);

  // Enchanted Talisman raises CDR cap from 40% to 45% + Winter Crown Active skill
  const mageStats = computeMobaEquippedStats(
    mageHero,
    zeroEmblem,
    ['magic_shoes', 'enchanted_talisman', 'holy_crystal', 'winter_crown', 'fleeting_time'],
    'roam_conceal',
    true,
    false
  );
  assert.equal(mageStats.cdrPct, 45);
  assert.equal(mageStats.activeKind, 'frozen');
  assert.equal(mageStats.hasTimestream, true);

  // Conceal Roaming Blessing active when no active item overrides it
  const tankStats = computeMobaEquippedStats(
    tankHero,
    zeroEmblem,
    ['tough_boots', 'immortality', 'cursed_helmet'],
    'roam_conceal',
    false,
    false
  );
  assert.equal(tankStats.activeKind, 'conceal');
  assert.equal(tankStats.hasImmortality, true);
  assert.equal(tankStats.hasBurningSoul, true);

  // Quick-Buy progression recommends role build items and then boot blessing
  const firstRec = getNextQuickBuyRecommendation('Marksman', [], null, 1500);
  assert.ok(firstRec !== null);
  assert.equal(firstRec?.kind, 'item');
  assert.equal(firstRec?.canAfford, true);
  assert.ok(getMobaEquipmentById(firstRec!.id));
  assert.ok(getMobaBlessingById('jungle_ice'));
});

test('Naruto: Senki & Storm: 64 shinobi roster, 4 starters, Senki tower aggro priority, Lv.1-6 scaling, Storm proration, 4-log Kawarimi, and Counterattack chakra lock', () => {
  assert.equal(NARUTO_SHINOBI_ROSTER.length, 64);
  const starters = NARUTO_SHINOBI_ROSTER.filter((h) => h.unlockCost === 0);
  assert.equal(starters.length, 4);
  assert.deepEqual(
    starters.map((h) => h.name),
    ['Naruto Uzumaki', 'Sasuke Uchiha', 'Sakura Haruno', 'Kakashi Hatake']
  );

  const factions = new Set(NARUTO_SHINOBI_ROSTER.map((h) => h.faction));
  assert.equal(factions.size, 4);
  for (const h of NARUTO_SHINOBI_ROSTER) {
    assert.equal(h.senkiSkills.length, 5, `${h.name} must have 5 Senki skills (3 skills + Ougi 1 + Ougi 2)`);
    assert.equal(h.senkiSkills[3].unlockLevel, 4, `${h.name} Ougi 1 must unlock at Lv.4`);
    assert.equal(h.senkiSkills[4].unlockLevel, 6, `${h.name} Ougi 2 must unlock at Lv.6`);
    assert.ok(h.senkiSkills[3].hasSuperArmor && h.senkiSkills[4].hasSuperArmor, `${h.name} Ougis must grant Super Armor`);
    assert.ok(h.stormNinjutsu.name.length > 0 && h.stormUltimate.name.length > 0 && h.stormAwakeningName.length > 0);
  }

  assert.equal(NARUTO_MODES.length, 4);
  assert.equal(NARUTO_STAGES.length, 5);
  assert.equal(STORM_SUPPORT_TYPE_DEFS.length, 4);
  assert.equal(SENKI_RAMEN_ITEMS.length, 3);
  assert.equal(STORM_NINJA_TOOLS.length, 4);

  // Team 7 canonical synergy
  const syn = resolveNarutoTeamSynergy(0, 1, 2);
  assert.equal(syn.teamName, 'Team 7 Reunited');
  assert.ok(syn.bonusPct >= 10);

  // Senki Lv.1-6 stat scaling (+14% HP and +10% ATK per level) and Ougi unlock flags
  const lv1 = computeSenkiLevelStats(NARUTO_SHINOBI_ROSTER[0], 1);
  const lv4 = computeSenkiLevelStats(NARUTO_SHINOBI_ROSTER[0], 4);
  const lv6 = computeSenkiLevelStats(NARUTO_SHINOBI_ROSTER[0], 6);
  assert.equal(lv1.ougi1Unlocked, false);
  assert.equal(lv4.ougi1Unlocked, true);
  assert.equal(lv4.ougi2Unlocked, false);
  assert.equal(lv6.ougi2Unlocked, true);
  assert.ok(lv6.maxHp > lv4.maxHp && lv4.maxHp > lv1.maxHp);
  assert.ok(lv6.atkDmg > lv4.atkDmg && lv4.atkDmg > lv1.atkDmg);

  // Senki Tower Aggro Priority:
  // 1) Minions/Clones first -> 2) Closest Enemy Hero -> 3) Immediate Aggro Switch onto Enemy Hero who hits Allied Hero
  const towerCandidates = [
    { id: 'hero_close', team: 'enemy' as const, kind: 'hero' as const, x: 350, hp: 500 },
    { id: 'minion_far', team: 'enemy' as const, kind: 'minion' as const, x: 450, hp: 180 }
  ];
  assert.equal(
    selectSenkiTowerTarget(260, 'ally', 260, towerCandidates, null)?.id,
    'minion_far',
    'Tower must target minions/clones before heroes when no allied hero is attacked'
  );
  const aggroSwitchCandidates = [
    { id: 'hero_aggressor', team: 'enemy' as const, kind: 'hero' as const, x: 460, hp: 500 },
    { id: 'minion_close', team: 'enemy' as const, kind: 'minion' as const, x: 300, hp: 180 }
  ];
  assert.equal(
    selectSenkiTowerTarget(260, 'ally', 260, aggroSwitchCandidates, 'hero_aggressor')?.id,
    'hero_aggressor',
    'Tower must immediately switch aggro to an enemy hero who damages an allied hero in range'
  );

  // Storm Combo Damage Proration (100% on hit 0, scaling down to 20% floor)
  assert.equal(computeStormComboProration(0), 1.0);
  assert.ok(computeStormComboProration(4) < 1.0 && computeStormComboProration(4) > 0.2);
  assert.equal(computeStormComboProration(20), 0.2);

  // Storm 4-Log Substitution Gauge (14.0s recharge timer per log; resets to 0.0s whenever a log is spent)
  const midCharge = stepSubstitutionGauge(2, 10.0, 2.0, false);
  assert.equal(midCharge.logs, 2);
  assert.equal(midCharge.rechargeTimerSec, 12.0);
  const fullCharge = stepSubstitutionGauge(2, 12.0, 2.5, false);
  assert.equal(fullCharge.logs, 3);
  assert.equal(fullCharge.rechargeTimerSec, 0.5);
  const spentReset = stepSubstitutionGauge(3, 11.5, 0.016, true);
  assert.equal(spentReset.logs, 2);
  assert.equal(spentReset.rechargeTimerSec, 0, 'Spending any Substitution log must reset the 14s recharge timer to 0.0s');

  // Storm Counterattack Parry locks 35% of Maximum Chakra grey for 16s
  assert.equal(computeStormMaxUsableChakra(100, 0).usableMaxChakra, 100);
  assert.equal(computeStormMaxUsableChakra(100, 12.5).usableMaxChakra, 65);

  // Verify gameId === 28 default control layout includes skill1..skill5, sub, guard, chakra, support
  const narutoLayout = getDefaultGameLayout(28);
  const narutoKeys = new Set(narutoLayout.extras.map((e) => e.actionKey));
  for (const k of ['skill2', 'skill3', 'skill4', 'skill5', 'sub', 'guard', 'chakra', 'support']) {
    assert.ok(narutoKeys.has(k), `Naruto layout missing ${k}`);
  }
});

test('CROSSWORD_PACKS: 6 valid intersecting packs where every >=2 letter segment matches a clue', () => {
  assert.equal(CROSSWORD_PACKS.length, 6);
  for (const pack of CROSSWORD_PACKS) {
    assert.ok(pack.grid.length >= 5);
    const cols = pack.grid[0].length;
    for (const row of pack.grid) {
      assert.equal(row.length, cols, `${pack.title} must have rectangular rows`);
    }
    const acrossStarts = new Set<string>();
    const downStarts = new Set<string>();
    for (let r = 0; r < pack.grid.length; r++) {
      for (let c = 0; c < cols; c++) {
        if (pack.grid[r][c] === '.') continue;
        const leftEmpty = c === 0 || pack.grid[r][c - 1] === '.';
        const hasRight = c + 1 < cols && pack.grid[r][c + 1] !== '.';
        if (leftEmpty && hasRight) acrossStarts.add(`${r},${c}`);
        const upEmpty = r === 0 || pack.grid[r - 1][c] === '.';
        const hasDown = r + 1 < pack.grid.length && pack.grid[r + 1][c] !== '.';
        if (upEmpty && hasDown) downStarts.add(`${r},${c}`);
      }
    }
    const acrossClues = Object.keys(pack.clues.A);
    const downClues = Object.keys(pack.clues.D);
    assert.ok(acrossClues.length >= 2 && downClues.length >= 2, `${pack.title} must have across and down clues`);
    assert.deepEqual([...acrossStarts].sort(), [...acrossClues].sort(), `${pack.title} across clues must match grid`);
    assert.deepEqual([...downStarts].sort(), [...downClues].sort(), `${pack.title} down clues must match grid`);
  }
});

test('CodeHero: >= 28 tiered questions, valid options/answers, and difficulty-ordered decks', () => {
  assert.ok(CODE_HERO_QUESTIONS.length >= 28);
  const tiers = new Set(CODE_HERO_QUESTIONS.map((q) => q.tier));
  assert.deepEqual([...tiers].sort(), ['easy', 'extreme', 'hard', 'medium']);
  for (const q of CODE_HERO_QUESTIONS) {
    assert.equal(q.opts.length, 4);
    assert.ok(q.ans >= 0 && q.ans <= 3);
    assert.ok(q.lesson.length > 10);
  }
  const easyCfg = getCodeHeroConfig('easy');
  const extCfg = getCodeHeroConfig('extreme');
  assert.ok(easyCfg.startTime > extCfg.startTime);
  assert.ok(extCfg.scoreMult > easyCfg.scoreMult);

  const hardDeck = buildQuestionDeck('hard');
  assert.equal(hardDeck.length, CODE_HERO_QUESTIONS.length);
  assert.equal(hardDeck[0].tier, 'hard');
});

test('controlLayouts presets & migrations for FPS (7), Mini Militia (22), and Naruto Storm (28) plus UI prefs / chess timer storage', () => {
  const fpsLayout = getDefaultGameLayout(7);
  assert.ok(fpsLayout.extras.some((b) => b.actionKey === 'reload'));

  const mmLayout = getDefaultGameLayout(22);
  const mmFire = mmLayout.extras.find((b) => b.actionKey === 'fire');
  assert.ok(mmFire && mmFire.holdable === true);

  const nsLayout = getDefaultGameLayout(28);
  for (const b of nsLayout.extras) {
    assert.ok(b.yPx < 245, `Naruto button ${b.id} yPx=${b.yPx} must stay clear of top-right settings gear`);
  }

  // Legacy layout migration checks
  saveGameLayout(28, {
    ...nsLayout,
    extras: nsLayout.extras.map((b) => (b.id === 'ns_ougi2' ? { ...b, yPx: 256 } : b))
  });
  const migratedNs = loadGameLayout(28);
  assert.ok((migratedNs.extras.find((b) => b.id === 'ns_ougi2')?.yPx ?? 999) < 245);
  resetGameLayout(28);

  // Cooking compact landscape 10x2 row check
  const compactCookingBtns = computeIngredientButtons(844, 390, 186);
  const distinctYs = new Set(compactCookingBtns.map((b) => b.y));
  assert.equal(distinctYs.size, 2, 'Compact landscape cooking ingredients should form a 10x2 grid');

  // Chess time persistence + UI prefs roundtrip
  const prevChess = playerState.selectedChessTimeSec;
  persistChessTime(300);
  assert.equal(playerState.selectedChessTimeSec, 300);
  assert.equal(tryStorage.getItem('tsepang_chess_time'), '300');
  persistChessTime(9999);
  assert.equal(playerState.selectedChessTimeSec, 600);
  persistChessTime(prevChess);

  saveUiPrefs({ isNight: true, activeThemeIdx: 2 });
  const prefs = loadUiPrefs();
  assert.equal(prefs.isNight, true);
  assert.equal(prefs.activeThemeIdx, 2);
});

test('Legends Arena 3D: Exact MLBB Real-Time Timers (0:10-18:00), Dynamic Lanes, 3-Stage Lord, Turtle rules, and 4 Annual Map Variants', () => {
  // Exact real-time MLBB milestone constants
  assert.equal(MLBB_TIMERS.FIRST_WAVE_SEC, 10);
  assert.equal(MLBB_TIMERS.WAVE_INTERVAL_SEC, 30);
  assert.equal(MLBB_TIMERS.ORANGE_FIRST_SPAWN_SEC, 20);
  assert.equal(MLBB_TIMERS.PURPLE_FIRST_SPAWN_SEC, 25);
  assert.equal(MLBB_TIMERS.SMALL_CAMP_FIRST_SPAWN_SEC, 30);
  assert.equal(MLBB_TIMERS.LITHO_FIRST_SPAWN_SEC, 40);
  assert.equal(MLBB_TIMERS.CRAB_FIRST_SPAWN_SEC, 42);
  assert.equal(MLBB_TIMERS.FIRST_TURTLE_SEC, 120);
  assert.equal(MLBB_TIMERS.TURRET_SHIELD_END_SEC, 300);
  assert.equal(MLBB_TIMERS.TURTLE_CUTOFF_SEC, 360);
  assert.equal(MLBB_TIMERS.FIRST_LORD_SEC, 480);
  assert.equal(MLBB_TIMERS.TURTLE_MAX_COMBAT_DELAY_SEC, 540);
  assert.equal(MLBB_TIMERS.ENHANCED_LORD_SEC, 720);
  assert.equal(MLBB_TIMERS.EVOLVED_LORD_SEC, 1080);
  assert.equal(CYCLONE_EYE_SPECS.length, 4);

  // Clock progression across key timestamps
  const c0 = evaluateBattlefieldClock(0);
  assert.equal(c0.wavesStarted, false);
  assert.equal(c0.outerTurretShieldActive, true);
  assert.equal(c0.junglerJungleDrActive, true);
  assert.equal(c0.lordStage, 0);

  const c25 = evaluateBattlefieldClock(25);
  assert.equal(c25.wavesStarted, true);
  assert.equal(c25.orangeBuffReady, true);
  assert.equal(c25.purpleBuffReady, true);
  assert.equal(c25.smallCampsReady, false);

  const c42 = evaluateBattlefieldClock(42);
  assert.equal(c42.smallCampsReady, true);
  assert.equal(c42.lithoReady, true);
  assert.equal(c42.crabsReady, true);
  assert.equal(c42.largeGoldCrabsActive, false);

  const c120 = evaluateBattlefieldClock(120); // 2:00 First Turtle & Large Gold Crabs
  assert.equal(c120.largeGoldCrabsActive, true);
  assert.equal(c120.junglerJungleDrActive, false);
  assert.equal(c120.outerTurretShieldActive, true);

  const c300 = evaluateBattlefieldClock(300); // 5:00 Turret Shields & Cannon Bonus expire
  assert.equal(c300.outerTurretShieldActive, false);
  assert.equal(c300.laneCannonBonusActive, false);
  assert.equal(c300.junglerLanePenaltyActive, false);
  assert.equal(c300.roamDevotionActive, true);

  const c480 = evaluateBattlefieldClock(480); // 8:00 Stage 1 Neutral Lord
  assert.equal(c480.lordStage, 1);
  assert.equal(c480.lordStageLabel, 'Neutral Lord');
  assert.equal(c480.lordRespawnSec, 180);
  assert.equal(c480.roamDevotionActive, false);
  assert.equal(c480.innerTurretEarlyDrActive, false);

  const c720 = evaluateBattlefieldClock(720); // 12:00 Stage 2 Enhanced Lord + Minion Speed Boost
  assert.equal(c720.lordStage, 2);
  assert.equal(c720.lordStageLabel, 'Enhanced Lord');
  assert.equal(c720.minionSpeedBoostActive, true);
  assert.equal(c720.baseTurretEarlyBuffActive, false);

  const c1080 = evaluateBattlefieldClock(1080); // 18:00 Stage 3 Evolved Lord
  assert.equal(c1080.lordStage, 3);
  assert.equal(c1080.lordStageLabel, 'Evolved Lord');
  assert.equal(c1080.lordRespawnSec, 150);
  assert.equal(c1080.lateGameEscalationActive, true);

  // Dynamic EXP vs. Gold Lane assignment based on First Turtle Pit
  const upperAssign = createDynamicLaneAssignment('upper');
  assert.equal(upperAssign.expLaneIndex, 0);
  assert.equal(upperAssign.goldLaneIndex, 2);
  const lowerAssign = createDynamicLaneAssignment('lower');
  assert.equal(lowerAssign.expLaneIndex, 2);
  assert.equal(lowerAssign.goldLaneIndex, 0);

  // Turtle cutoff & dissipation rules
  assert.equal(canRespawnNextTurtle(359), true);
  assert.equal(canRespawnNextTurtle(360), false);
  assert.equal(shouldTurtleDissipate(479, 10), false);
  assert.equal(shouldTurtleDissipate(480, 4), false);
  assert.equal(shouldTurtleDissipate(480, 5), true);
  assert.equal(shouldTurtleDissipate(540, 0), true);

  // Turtle rewards scaling
  const t1 = computeTurtleRewards(1, 5);
  const t3 = computeTurtleRewards(3, 10);
  assert.ok(t3.teamGold > t1.teamGold);
  assert.ok(t3.slayerShieldHp > t1.slayerShieldHp);

  // Evolved Lord DR scaling (Neutral 40% -> 15% floor; Summoned 0% -> 25% cap)
  assert.equal(computeEvolvedLordNeutralDr(0), 0.4);
  assert.equal(computeEvolvedLordNeutralDr(3), 0.25);
  assert.equal(computeEvolvedLordNeutralDr(10), 0.15);
  assert.equal(computeEvolvedLordSummonedDr(0), 0);
  assert.equal(computeEvolvedLordSummonedDr(3), 0.15);
  assert.equal(computeEvolvedLordSummonedDr(6), 0.25);

  // Lord marches down weakest lane (Mid tie-breaker)
  assert.equal(selectLordWeakestLane({ 0: 3, 1: 3, 2: 3 }), 1);
  assert.equal(selectLordWeakestLane({ 0: 1, 1: 2, 2: 3 }), 0);
  assert.equal(selectLordWeakestLane({ 0: 2, 1: 2, 2: 1 }), 2);

  // Orange Buff Pen, Retribution Damage, Clock formatting
  assert.equal(computeOrangeBuffPenetrationPct('Assassin'), 10);
  assert.equal(computeOrangeBuffPenetrationPct('Tank'), 5);
  assert.ok(computeRetributionDamage(10, true) > computeRetributionDamage(10, false));
  assert.equal(formatMatchClock(485), '08:05');

  // 4 Annual Map Variants (random roll + deterministic override)
  assert.equal(MOBA_MAP_VARIANTS.length, 4);
  assert.equal(resolveMatchMapVariant('flying_cloud').id, 'flying_cloud');
  assert.equal(resolveMatchMapVariant('golden_turret').id, 'golden_turret');
  assert.equal(resolveMatchMapVariant('random', () => 0).id, 'revealing_wisps');
  assert.equal(resolveMatchMapVariant('random', () => 0.99).id, 'flying_cloud');
});

test('Legends Arena 3D: Tier 1-3 Crafting Tree, Owned-Component Deduction, Slot Consolidation, 60% Sell Refund, Free Blessings, 3 Presets, and 2-Slot Quick-Buy', () => {
  assert.ok(MOBA_BASIC_ITEMS.length >= 9);
  assert.ok(MOBA_INTERMEDIATE_ITEMS.length >= 12);

  // All 7 Jungling/Roaming blessings are FREE (0g)
  for (const bl of MOBA_BOOT_BLESSINGS) {
    assert.equal(bl.cost, 0, `Boot blessing ${bl.id} must be free (0g)`);
  }

  // Every role has 3 swappable build presets
  for (const role of ['Marksman', 'Assassin', 'Fighter', 'Mage', 'Tank', 'Support'] as const) {
    assert.equal(ROLE_BUILD_PRESETS[role].length, 3, `${role} must have 3 swappable build presets`);
  }

  // Blade of Despair recipe: Legion Sword + Legion Sword
  const bodRecipe = getItemRecipe('bod');
  assert.deepEqual(bodRecipe, ['legion_sword', 'legion_sword']);

  const bodItem = getMobaEquipmentById('bod')!;
  const legionItem = getMobaEquipmentById('legion_sword')!;
  const daggerItem = getMobaEquipmentById('dagger')!;

  // Owned Tier-2 Legion Sword deducts its exact cost from Blade of Despair
  const bdOneLegion = computeEffectiveItemCost('bod', ['legion_sword']);
  assert.ok(bdOneLegion);
  assert.equal(bdOneLegion!.netCost, bodItem.cost - legionItem.cost);
  assert.deepEqual(bdOneLegion!.consumedSlotIndices, [0]);

  // Owned Tier-1 Dagger deducts toward Legion Sword inside Blade of Despair
  const bdDeepDagger = computeEffectiveItemCost('bod', ['dagger']);
  assert.ok(bdDeepDagger);
  assert.equal(bdDeepDagger!.netCost, bodItem.cost - daggerItem.cost);

  // Slot consolidation at 6/6 full slots: owning basic_boots + leather_jerkin allows crafting warrior_boots cleanly
  const fullInv = ['basic_boots', 'leather_jerkin', 'dagger', 'dagger', 'vitality_crystal', 'knife'];
  const upgradeBoots = applyCraftedPurchase('warrior_boots', fullInv, 500);
  assert.equal(upgradeBoots.ok, true);
  assert.equal(upgradeBoots.consumedCount, 2);
  assert.equal(upgradeBoots.nextEquippedIds.length, 5);
  assert.ok(upgradeBoots.nextEquippedIds.includes('warrior_boots'));

  // Buying a second pair of Tier-3 boots when already owning Tier-3 boots is rejected
  const secondBoots = applyCraftedPurchase('tough_boots', ['warrior_boots'], 500);
  assert.equal(secondBoots.ok, false);

  // 60% Gold Sell Refund
  assert.equal(computeSellRefund('bod'), Math.round(bodItem.cost * 0.6));

  // 2-Slot Quick-Buy respects prioritizedItemId and surfaces missing component when unaffordable
  const pairPrioritized = getQuickBuyPair('Marksman', [], null, 60, undefined, 'bod');
  assert.equal(pairPrioritized.length, 2);
  assert.equal(pairPrioritized[0].id, 'legion_sword');
  assert.equal(pairPrioritized[1].id, 'bod');

  // When player can afford prioritized item directly, slot 1 is the prioritized item
  const pairAffordable = getQuickBuyPair('Marksman', [], null, 999, undefined, 'bod');
  assert.equal(pairAffordable[0].id, 'bod');
  assert.equal(pairAffordable[0].canAfford, true);
});

test('Hoops 2K26 3D: 16 real NBA/WNBA/Classic teams, 6 Eras, 40 Badges, Build By Badges, Creators, Locker Codes, 6 Ladders & Enhanced On-Court Logic', () => {
  // 1. Real NBA, WNBA, and Classic Teams + 6 MyNBA Eras + Co-Op NBA+WNBA MyTEAM Cards
  assert.equal(HOOPS_2K26_TEAMS.length, 16);
  const leagues = new Set(HOOPS_2K26_TEAMS.map((t) => t.league));
  assert.ok(leagues.has('nba') && leagues.has('wnba') && leagues.has('classic'));
  assert.ok(HOOPS_2K26_TEAMS.some((t) => t.name.includes('Boston Celtics')));
  assert.ok(HOOPS_2K26_TEAMS.some((t) => t.name.includes('Las Vegas Aces')));
  assert.ok(HOOPS_2K26_TEAMS.some((t) => t.name.includes('Chicago Bulls')));

  assert.equal(HOOPS_ERAS.length, 6);
  assert.ok(MYTEAM_CARDS.some((c) => c.league === 'NBA') && MYTEAM_CARDS.some((c) => c.league === 'WNBA'));
  assert.equal(HOOPS_CITY_LOCATIONS.length, 18);
  assert.ok(HOOPS_2K_BEATS.length >= 6);

  // 2. 40 Badges + Build By Badges auto-solver
  assert.equal(HOOPS_40_BADGES.length, 40);
  const profile = createDefaultHoops2K26Profile();
  const baseAttrs = profile.saves[0].attributes;
  const fullCaps = {
    finishing: 99,
    shooting: 99,
    playmaking: 99,
    defense: 99,
    rebounding: 99,
    physicals: 99
  };
  const solved = solveBuildByBadges({ deadeye: 'Gold', posterizer: 'Gold' }, baseAttrs, fullCaps);
  assert.ok(solved.nextAttrs.shooting >= 85);
  assert.ok(solved.nextAttrs.finishing >= 80);
  assert.equal(solved.fulfilledCount, 2);

  // 3. Jump Shot Creator grades
  const jsEval = evaluateCustomJumpShot({
    name: 'Steph Quick',
    base: 'Stephen Curry',
    upper1: 'Oscar Robertson',
    upper2: 'Sabrina Ionescu',
    blendPct: 60,
    speedTier: 'Very Quick',
    visualCue: 'Push'
  });
  assert.ok(jsEval.greenWindowBonus >= 0);
  assert.ok(jsEval.meterSpeedMult >= 1.0);
  assert.ok(['A+', 'A', 'A-', 'B+', 'B', 'C'].includes(jsEval.releaseSpeed));

  // 4. Locker Code Redemption (valid + duplicate rejection + invalid rejection)
  assert.equal(profile.settings.quarterLengthMin, 5, 'Full-court default quarter must be real 5-min');
  const firstCode = HOOPS_LOCKER_CODES[0].code;
  const okRedeem = redeemHoopsLockerCode(firstCode, profile.redeemedLockerCodes);
  assert.equal(okRedeem.ok, true);
  assert.ok((okRedeem.reward?.vc ?? 0) > 0 || (okRedeem.reward?.mtp ?? 0) > 0);
  const dupRedeem = redeemHoopsLockerCode(firstCode, [firstCode]);
  assert.equal(dupRedeem.ok, false);
  const badRedeem = redeemHoopsLockerCode('NOT-A-CODE', []);
  assert.equal(badRedeem.ok, false);

  // 5. 6 Progression Ladders (REP, Crew, Skill Plate, Post-Game Payout)
  assert.equal(getRepTierForXp(0).tier.label, 'Rookie I');
  assert.equal(getRepTierForXp(200000).tier.label, 'Legend V');
  assert.ok(getCrewBonusesForLevel(30).vcBonusPct > getCrewBonusesForLevel(1).vcBonusPct);
  assert.equal(getPlateTierForScore(920).label, 'MVP');
  assert.equal(getPlateTierForScore(50).label, 'Casual');

  const postGame = computeHoopsPostGameRewards({
    won: true,
    homeScore: 78,
    awayScore: 64,
    points: 28,
    rebounds: 6,
    assists: 8,
    steals: 3,
    blocks: 1,
    turnovers: 1,
    greens: 5,
    teammateGrade: 'A+',
    teammateGradeScore: 98,
    difficulty: 'Hall of Fame',
    courtContext: null,
    crewLevel: 15,
    doubleXpActive: false
  });
  assert.ok(postGame.totalVc > postGame.baseVc);
  assert.ok(postGame.crewBonusVc > 0);
  assert.equal(postGame.hotZoneUpgraded, true);
  assert.ok(postGame.plateDelta > 0);

  // 6. Enhanced Shot Window: Shot Meter OFF grants measurable Green Window Boost
  const meterOnWin = computeShotWindowEnhanced({
    shooterPos: { x: HOOP_X - 8.2, z: 0 },
    hoopX: HOOP_X,
    defenderDistances: [6.0],
    shootRating: 5,
    staminaRatio: 0.9,
    sprinting: false,
    jumpShotMeterOff: false,
    jumpShotGreenBonus: 0.01,
    hotZoneHeat: 'neutral',
    takeoverActive: false
  });
  const meterOffWin = computeShotWindowEnhanced({
    shooterPos: { x: HOOP_X - 8.2, z: 0 },
    hoopX: HOOP_X,
    defenderDistances: [6.0],
    shootRating: 5,
    staminaRatio: 0.9,
    sprinting: false,
    jumpShotMeterOff: true,
    jumpShotGreenBonus: 0.01,
    hotZoneHeat: 'lethal',
    takeoverActive: true
  });
  assert.ok(
    meterOffWin.greenEnd - meterOffWin.greenStart > meterOnWin.greenEnd - meterOnWin.greenStart,
    'Shot Meter OFF + Lethal Zone + Takeover must widen green release window'
  );
  assert.equal(meterOffWin.coverageLabel, 'WIDE OPEN');

  // 7. Teammate Grade, Adrenaline Bars, and Takeover Lv.1-5
  assert.equal(getTeammateGradeLabel(100), 'A+');
  assert.equal(getTeammateGradeLabel(0), 'F');
  const graded = stepTeammateGrade(50, 'assist');
  assert.ok(graded.score > 50);
  const adrSpent = stepAdrenalineBars(3, 0, 0.1, true, false);
  assert.equal(adrSpent.bars, 2);
  const adrRecharged = stepAdrenalineBars(2, 0, 4.0, false, false);
  assert.equal(adrRecharged.bars, 3);
  const tov = stepTakeoverMeter(420, 100);
  assert.equal(tov.meter, 500);
  assert.equal(tov.level, 5);
  assert.equal(tov.readyToIgnite, true);
});

test('Legends Arena 3D: 11-element hero VFX mapping, drag/cursor skill aiming, delayed HP trail, and cooldown-ready detection', () => {
  // 1. Canonical hero elemental themes (including Valir = fire, Aurora = ice, etc.)
  const expectedElements: Array<[string, string]> = [
    ['Valir', 'fire'],
    ['Aurora', 'ice'],
    ['Eudora', 'lightning'],
    ['Vale', 'wind'],
    ['Kadita', 'water'],
    ['Hayabusa', 'shadow'],
    ['Belerick', 'nature'],
    ['Rafaela', 'celestial'],
    ['Grock', 'earth'],
    ['Alice', 'blood'],
    ['Layla', 'steel']
  ];
  for (const [heroName, expectedTheme] of expectedElements) {
    const hero = MOBA_HEROES.find((h) => h.name === heroName);
    assert.ok(hero, `Missing hero ${heroName}`);
    assert.equal(getHeroBaseElementTheme(hero), expectedTheme, `${heroName} should map to ${expectedTheme}`);
    const kit = getHeroCombatKit(hero);
    assert.ok(
      kit.skills.every((sk) => Boolean(MOBA_ELEMENT_PALETTES[sk.elementTheme])),
      `${heroName} skills must resolve valid elemental palettes`
    );
  }

  // Every single hero in the 129-hero roster resolves a valid palette and glow color
  assert.equal(MOBA_HEROES.length, 129);
  for (const hero of MOBA_HEROES) {
    const theme = getHeroBaseElementTheme(hero);
    assert.ok(MOBA_ELEMENT_PALETTES[theme]?.glowHex.startsWith('#'));
  }

  // Elemental status effects (Fire -> Burn DoT, Ice -> Freeze/Chill, Lightning -> Shock, Blood -> Bleed)
  const fireStatus = resolveElementStatusEffect('fire', 'none');
  assert.equal(fireStatus.statusKind, 'burn');
  assert.ok(fireStatus.dotDpsRatio > 0);
  const iceHard = resolveElementStatusEffect('ice', 'stun');
  assert.equal(iceHard.statusKind, 'freeze');
  assert.equal(iceHard.label, 'FROZEN');
  const boltStatus = resolveElementStatusEffect('lightning', 'stun');
  assert.equal(boltStatus.statusKind, 'shock');
  const bloodStatus = resolveElementStatusEffect('blood', 'none');
  assert.equal(bloodStatus.statusKind, 'bleed');
  assert.ok(bloodStatus.dotDpsRatio > 0);

  // 2. Skill aim point resolution (clamping to max range, play limit, and self targeting)
  const circleAim = resolveSkillAimPoint(10, 20, 3, 4, 15, 'circle', 84);
  assert.ok(Math.abs(circleAim.dist - 15) < 1e-6, 'Normalized vector > 1 must clamp to maxRange');
  const clampedWall = resolveSkillAimPoint(80, 0, 1, 0, 20, 'line', 84);
  assert.equal(clampedWall.aimX, 84, 'Aim point must clamp to arena playLimit');
  const selfAim = resolveSkillAimPoint(12, -18, 1, 1, 10, 'self', 84);
  assert.equal(selfAim.aimX, 12);
  assert.equal(selfAim.aimZ, -18);
  assert.equal(selfAim.dist, 0);

  // 3. Delayed catch-up health bar trail (hold on damage -> smooth decay -> instant sync on heal)
  const dmgTrig = triggerHealthTrailDamage(1000, 720, 1000, 0, 0.22);
  assert.equal(dmgTrig.trailHp, 1000);
  assert.equal(dmgTrig.holdSec, 0.22);

  // During hold window, trail stays at 1000
  const holding = stepHealthTrail(720, 1000, dmgTrig.trailHp, dmgTrig.holdSec, 0.12);
  assert.equal(holding.trailHp, 1000);
  assert.ok(holding.holdSec > 0 && holding.holdSec < 0.22);

  // After hold expires, trail decays smoothly toward 720
  const postHold = stepHealthTrail(720, 1000, holding.trailHp, holding.holdSec, 0.12);
  assert.equal(postHold.holdSec, 0);
  const decaying = stepHealthTrail(720, 1000, postHold.trailHp, 0, 0.15);
  assert.ok(decaying.trailHp < 1000 && decaying.trailHp >= 720);

  // Healing above trail snaps immediately with zero phantom trail
  const healed = triggerHealthTrailDamage(720, 950, decaying.trailHp, 0);
  const syncedHeal = stepHealthTrail(950, 1000, healed.trailHp, healed.holdSec, 0.016);
  assert.equal(syncedHeal.trailHp, 950);
  assert.equal(syncedHeal.holdSec, 0);

  // 4. Cooldown-ready transition detection (fires strictly on > 0 -> <= 0)
  const newlyReady = detectCooldownReadySlots(
    { skill1: 0.2, skill2: 0, skill3: 4.5, spell: 0.1 },
    { skill1: 0, skill2: 0, skill3: 4.2, spell: 0 }
  );
  assert.deepEqual(newlyReady.sort(), ['skill1', 'spell']);
  assert.deepEqual(
    detectCooldownReadySlots({ skill1: 0, skill2: 0 }, { skill1: 3.0, skill2: 0 }),
    [],
    'Going on cooldown or staying ready must not trigger ready pop'
  );
});

test('legendsArena3D hero emotes: 12-emote catalog, 4-slot wheel normalization/swap, and contextual AI selection', () => {
  // 1. Catalog integrity: 12 total emotes (4 free starters + 8 unlockables)
  assert.equal(MOBA_EMOTES.length, 12);
  assert.equal(DEFAULT_STARTER_EMOTE_IDS.length, 4);
  const starters = MOBA_EMOTES.filter((e) => e.rarity === 'Starter');
  const unlockables = MOBA_EMOTES.filter((e) => e.rarity !== 'Starter');
  assert.equal(starters.length, 4);
  assert.equal(unlockables.length, 8);
  for (const s of starters) {
    assert.equal(s.costTickets, 0);
    assert.equal(s.costCoins, 0);
  }
  for (const u of unlockables) {
    assert.ok(u.costTickets > 0 && u.costCoins > 0, `Unlockable emote ${u.id} must have positive ticket & coin cost`);
  }

  // 2. Wheel normalization filters unowned/invalid IDs and deduplicates into 4 unique slots
  const normalized = normalizeEquippedEmotes(
    ['emote_gg', 'emote_gg', 'emote_dragon', 'invalid_id'],
    [...DEFAULT_STARTER_EMOTE_IDS]
  );
  assert.equal(normalized.length, 4);
  assert.equal(new Set(normalized).size, 4, 'Normalized wheel must contain 4 unique emotes');
  assert.ok(!normalized.includes('emote_dragon'), 'Unowned unlockable must be filtered out');

  // 3. Equipping an emote replaces the target slot and swaps cleanly if already equipped elsewhere
  const afterEquip = equipEmoteToSlot(DEFAULT_STARTER_EMOTE_IDS, 1, 'emote_dragon');
  assert.equal(afterEquip[1], 'emote_dragon');
  assert.equal(new Set(afterEquip).size, 4);

  // Swapping an already-equipped emote (slot 0 -> slot 2) preserves both emotes without duplication
  const prevSlot0 = afterEquip[0];
  const prevSlot2 = afterEquip[2];
  const afterSwap = equipEmoteToSlot(afterEquip, 2, prevSlot0);
  assert.equal(afterSwap[2], prevSlot0);
  assert.equal(afterSwap[0], prevSlot2);
  assert.equal(new Set(afterSwap).size, 4);

  // Equipping the same emote into its current slot is a no-op
  const unchanged = equipEmoteToSlot(afterSwap, 2, prevSlot0);
  assert.deepEqual(unchanged, afterSwap);

  // 4. Contextual AI emote selection returns valid catalog emotes across all 4 combat contexts
  for (const ctx of ['kill', 'low_hp', 'objective', 'rally'] as const) {
    const picked = pickContextualAiEmote(ctx, 5);
    assert.ok(picked.callout.length > 0 && picked.icon.length > 0);
    assert.equal(getMobaEmoteById(picked.id).id, picked.id);
  }
});

test('MLBB 2.5D CombatMath: 120/(120+Def) curve, -60 negative pen floor, MS soft-caps 415/490, 6-tier CC & Suppression, and Turret Ramp', () => {
  // Effective Defense: (targetDef - flatPen) * (1 - pctPen), clamped to -60
  assert.equal(computeEffectiveDefense(100, 15, 0.4), 51);
  assert.equal(computeEffectiveDefense(20, 120, 0), -60);

  // Damage curve: 120/(120+120) = 0.5x; negative def: 2 - 120/(120 - (-60)) = 4/3 (~1.333x); true damage ignores defense
  assert.equal(computeFinalDamage(1000, 120, 'physical'), 500);
  assert.equal(computeFinalDamage(500, -60, 'magic'), 667);
  assert.equal(computeFinalDamage(420, 300, 'true'), 420);

  // Movement Speed Soft-Caps: <=415 100%, 415..490 80%, >490 50%
  assert.equal(applyMoveSpeedSoftCap(380), 380);
  assert.equal(applyMoveSpeedSoftCap(465), 455); // 415 + 50 * 0.8
  assert.equal(applyMoveSpeedSoftCap(590), 525); // 415 + 60 + 100 * 0.5

  // Part 4 6-tier CC hierarchy (Tiers 1-5 disables + Tier 6 counters) & un-purifiable Suppression
  assert.equal(getCcPriority('slow'), 1);
  assert.equal(getCcPriority('grounded'), 1);
  assert.equal(getCcPriority('root'), 2);
  assert.equal(getCcPriority('silence'), 2);
  assert.equal(getCcPriority('stun'), 3);
  assert.equal(getCcPriority('airborne'), 4);
  assert.equal(getCcPriority('vortex'), 4);
  assert.equal(getCcPriority('suppression'), 5);
  assert.equal(canCleanseCc('stun'), true);
  assert.equal(canCleanseCc('suppression'), false);

  // Turret Ramp (+40% per shot up to 2.6x) & Retribution execute scaling
  assert.equal(computeTurretRampMultiplier(0), 1.0);
  assert.equal(computeTurretRampMultiplier(2), 1.8);
  assert.equal(computeTurretRampMultiplier(6), 2.6);
  assert.ok(computeRetributionThreshold(10, true) > computeRetributionThreshold(10, false));

  // Match rating 3.0..15.0 & Medal
  const good = computeMatchRatingAndMedal(12, 1, 9, 45000, 12000, 82);
  assert.ok(good.rating >= 8.2 && good.rating <= 15.0);
  assert.equal(good.medal, 'Gold');
});

test('MLBB 2.5D Roster, Recursive Item Crafting Tree, 60% Sell Refund, and Exact Map Timers/Bush Stealth', () => {
  // All 12 iconic heroes present with 3 skills each
  assert.equal(MLBB_ICONIC_HEROES.length, 12);
  for (const h of MLBB_ICONIC_HEROES) {
    assert.equal(h.skills.length, 3);
  }

  // Recursive component cost deduction for Blade of Despair (3010g; Legion Sword 910g x2 + Dagger 250g)
  assert.equal(computeMlbbEffectiveCost('blade_of_despair', []).effectiveCost, 3010);
  assert.equal(computeMlbbEffectiveCost('blade_of_despair', ['legion_sword']).effectiveCost, 2100);
  const bought = applyMlbbItemPurchase('blade_of_despair', ['legion_sword'], 2500);
  assert.equal(bought.ok, true);
  assert.equal(bought.nextGold, 400);
  assert.deepEqual(bought.nextItems, ['blade_of_despair']);
  assert.equal(computeMlbbSellRefund('blade_of_despair'), Math.round(3010 * 0.6));

  // Quick-Buy returns prioritized / next build components
  const qb = computeMlbbQuickBuy(['swift_boots', 'blade_of_despair'], [], 950, null);
  assert.ok(qb.length >= 1);

  // Exact Map Timers & Bush Stealth polygon containment
  assert.equal(MLBB_25D_TIMERS.MINION_FIRST_SPAWN, 10);
  assert.equal(MLBB_25D_TIMERS.ORANGE_FIRST_SPAWN, 20);
  assert.equal(MLBB_25D_TIMERS.PURPLE_FIRST_SPAWN, 20);
  assert.equal(MLBB_25D_TIMERS.TURTLE_FIRST_SPAWN, 120);
  assert.equal(MLBB_25D_TIMERS.OUTER_SHIELD_EXPIRE, 300);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE1_SPAWN, 480);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE2_TIME, 720);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE3_TIME, 1080);

  const b0 = MAP_BUSHES[0];
  assert.ok(isPointInBush(b0.cx, b0.cy) !== null);
  assert.equal(isPointInBush(2000, 2000), null);
});

test('NBA 2K14: 50 Authentic Teams, 20 2K Beats Tracks, 13 Path Chapters & 38 Signature Skills Math', () => {
  assert.equal(NBA_TEAMS.length, 30);
  assert.equal(EUROLEAGUE_ONLY_TEAMS.length, 14);
  assert.equal(CLASSIC_ONLY_TEAMS.length, 4);
  assert.equal(ALLSTAR_ONLY_TEAMS.length, 2);
  assert.equal(ALL_TEAMS.length, 50);
  assert.equal(BEATS_2K14_TRACKLIST.length, 20);
  assert.equal(PATH_TO_GREATNESS_CHAPTERS.length, 13);
  assert.equal(SIGNATURE_SKILLS.length, 38);

  const heat = getTeamById('mia');
  const lebron = heat.players.find((p) => p.name === 'LeBron James');
  assert.ok(lebron, 'LeBron James must be on 2013-14 Miami Heat');
  assert.equal(lebron.ovr, 99);
  assert.equal(lebron.jersey, 6);

  const bulls96 = getTeamById('cls_96chi');
  const mj = bulls96.players.find((p) => p.name === 'Michael Jordan');
  assert.ok(mj, 'Michael Jordan must be on 95-96 Bulls');
  assert.equal(mj.ovr, 99);

  // Signature Skills gameplay math: Closer in clutch, Corner Specialist, Lockdown Defender negation, Microwave & Anti-Freeze
  const sliders = createDefaultSliders('Default');
  const rayAllen = heat.players.find((p) => p.name === 'Ray Allen') ?? lebron;
  const openCorner = computeShotProbability({
    shooter: rayAllen,
    shotType: 'three',
    zone: 'three_l_corner',
    releaseError: 0.09,
    contestRatio: 0.1,
    fatigueRatio: 0,
    streak: 0,
    difficulty: 'All-Star',
    sliders,
  });
  const topKey = computeShotProbability({
    shooter: rayAllen,
    shotType: 'three',
    zone: 'three_top',
    releaseError: 0.09,
    contestRatio: 0.1,
    fatigueRatio: 0,
    streak: 0,
    difficulty: 'All-Star',
    sliders,
  });
  assert.ok(openCorner.makeProbability >= topKey.makeProbability, 'Corner Specialist should boost corner 3%');

  const wade = heat.players.find((p) => p.name === 'Dwyane Wade')!;
  const clutchShot = computeShotProbability({
    shooter: wade,
    shotType: 'mid',
    zone: 'mid_top',
    releaseError: 0.09,
    contestRatio: 0.3,
    fatigueRatio: 0,
    streak: 0,
    isClutchTime: true,
    difficulty: 'All-Star',
    sliders,
  });
  const regularShot = computeShotProbability({
    shooter: wade,
    shotType: 'mid',
    zone: 'mid_top',
    releaseError: 0.09,
    contestRatio: 0.3,
    fatigueRatio: 0,
    streak: 0,
    isClutchTime: false,
    difficulty: 'All-Star',
    sliders,
  });
  assert.ok(clutchShot.makeProbability > regularShot.makeProbability, 'Closer should boost clutch shot probability');

  // Lockdown Defender negates offensive skills when contesting
  const kawhi = getTeamById('sas').players.find((p) => p.name === 'Kawhi Leonard') ?? mj;
  const lockedDefender = { ...kawhi, signatureSkills: [{ id: 'lockdown_defender' as const, level: 3 as const }] };
  const lockedShot = computeShotProbability({
    shooter: wade,
    defender: lockedDefender,
    shotType: 'mid',
    zone: 'mid_top',
    releaseError: 0.09,
    contestRatio: 0.45,
    fatigueRatio: 0,
    streak: 0,
    isClutchTime: true,
    difficulty: 'All-Star',
    sliders,
  });
  assert.ok(lockedShot.triggeredSkills.some((t) => t.id === 'lockdown_defender'));
  assert.equal(lockedShot.triggeredSkills.some((t) => t.id === 'closer'), false);

  // Microwave & Anti-Freeze checks
  assert.equal(getHotThreshold({ ...lebron, signatureSkills: [{ id: 'microwave', level: 2 }] }), 2);
  assert.equal(getHotThreshold({ ...lebron, signatureSkills: [] }), 3);
  assert.equal(canGoCold({ ...lebron, signatureSkills: [{ id: 'anti_freeze', level: 1 }] }), false);
  assert.equal(canGoCold({ ...lebron, signatureSkills: [] }), true);

  // Ankle Breaker, Brick Wall vs Pick Dodger, Tenacious Rebounder
  const abHigh = computeAnkleBreakerChance(
    { ...lebron, signatureSkills: [{ id: 'ankle_breaker', level: 3 }] },
    { ...kawhi, signatureSkills: [] },
    2
  );
  const abLow = computeAnkleBreakerChance(
    { ...lebron, signatureSkills: [] },
    { ...kawhi, signatureSkills: [{ id: 'lockdown_defender', level: 3 }] },
    2
  );
  assert.ok(abHigh > abLow);

  const brickOnly = computeScreenKnockdownChance(
    { ...lebron, signatureSkills: [{ id: 'brick_wall', level: 3 }] },
    { ...kawhi, signatureSkills: [] }
  );
  const counteredByDodger = computeScreenKnockdownChance(
    { ...lebron, signatureSkills: [{ id: 'brick_wall', level: 3 }] },
    { ...kawhi, signatureSkills: [{ id: 'pick_dodger', level: 3 }] }
  );
  assert.ok(brickOnly > counteredByDodger);

  const rebBoost = computeReboundScore({ ...lebron, signatureSkills: [{ id: 'tenacious_rebounder', level: 3 }] }, true, 1);
  const rebBase = computeReboundScore({ ...lebron, signatureSkills: [] }, true, 1);
  assert.ok(rebBoost > rebBase);
});

test('NBA 2K14: 14-Zone Shot Classification (NBA vs FIBA), Locker Codes & VIP Progression', () => {
  // NBA vs FIBA 3PT line (6.95m from hoop is 2PT in NBA 7.24m, 3PT in FIBA 6.75m)
  const nbaMid = classifyShotZone(12.75 - 6.95, 0, 12.75, false);
  const fibaThree = classifyShotZone(12.75 - 6.95, 0, 12.75, true);
  assert.equal(nbaMid.isThree, false);
  assert.equal(nbaMid.zone, 'mid_top');
  assert.equal(fibaThree.isThree, true);
  assert.equal(fibaThree.zone, 'three_top');

  // Corner 3 & Restricted Area
  const corner3 = classifyShotZone(12.2, -7.0, 12.75, false);
  assert.equal(corner3.isThree, true);
  assert.equal(corner3.zone, 'three_l_corner');
  const restricted = classifyShotZone(12.1, 0.2, 12.75, false);
  assert.equal(restricted.zone, 'restricted');

  // Locker Code Redemption + duplicate rejection
  const freshSave = createDefaultSaveData();
  const res1 = redeemLockerCode(freshSave, 'KINGJAMES');
  assert.equal(res1.ok, true);
  assert.equal(res1.nextSave.vip.vc, freshSave.vip.vc + 5000);
  assert.equal(res1.nextSave.myTeam.collection.length, 1);
  assert.ok(res1.nextSave.vip.unlockedAchievements.includes('locker_hunter'));

  const resDup = redeemLockerCode(res1.nextSave, 'kingjames');
  assert.equal(resDup.ok, false);

  // Match result application updates VIP record, Hot Zones, Path stars, and Rookie Showcase draft
  const { nextSave: afterPath } = applyMatchResultToSave(res1.nextSave, {
    config: {
      mode: 'path',
      title: 'Ring Night Statement',
      homeTeamId: 'mia',
      awayTeamId: 'chi',
      userSide: 'home',
      courtEnv: 'nba',
      quarterLengthMin: 3,
      playersPerSide: 5,
      pathChapterId: 'hd_1',
    },
    homeScore: 76,
    awayScore: 68,
    userWon: true,
    quarterScoresHome: [20, 18, 18, 20],
    quarterScoresAway: [18, 18, 16, 16],
    boxScore: [
      {
        playerId: 'mia_lebron',
        name: 'LeBron James',
        pos: 'SF',
        jersey: 6,
        teamSide: 'home',
        pts: 22,
        fgm: 9,
        fga: 12,
        tpm: 2,
        tpa: 3,
        ftm: 2,
        fta: 2,
        reb: 10,
        ast: 10,
        stl: 2,
        blk: 1,
        to: 1,
        pf: 1,
        stamina: 85,
        streak: 4,
      },
    ],
    playerOfGame: {
      playerId: 'mia_lebron',
      name: 'LeBron James',
      pos: 'SF',
      jersey: 6,
      teamSide: 'home',
      pts: 22,
      fgm: 9,
      fga: 12,
      tpm: 2,
      tpa: 3,
      ftm: 2,
      fta: 2,
      reb: 10,
      ast: 10,
      stl: 2,
      blk: 1,
      to: 1,
      pf: 1,
      stamina: 85,
      streak: 4,
    },
    teammateGrade: 'A+',
    vcEarned: 900,
    spEarned: 600,
    mtEarned: 450,
    repEarned: 0,
    userShotLog: [
      { zone: 'three_l_corner', made: true, pts: 3, excellent: true, fastbreak: false, paint: false },
      { zone: 'restricted', made: true, pts: 2, excellent: true, fastbreak: true, paint: true },
    ],
    newAchievements: [],
    pathStarsEarned: 3,
  });

  assert.equal(afterPath.vip.wins, 1);
  assert.equal(afterPath.vip.hotZones.three_l_corner.made, 1);
  assert.equal(afterPath.pathToGreatness.completedStars.hd_1, 3);
  assert.ok(afterPath.vip.unlockedAchievements.includes('triple_double'));
  assert.ok(afterPath.vip.unlockedAchievements.includes('ptg_gold'));
});

test('MLBB 2026 Full Roster (133 Heroes), 103 Items + Unique Passive Non-Stacking, 7 Emblems, 27 Talents & 12 Spells', () => {
  // Complete 2026 Hero Roster (133 unique heroes) + 12 Iconic Heroes intact
  assert.equal(MLBB_ALL_HEROES.length, 133);
  assert.equal(MLBB_ICONIC_HEROES.length, 12);
  const uniqueIds = new Set(MLBB_ALL_HEROES.map((h) => h.id));
  assert.equal(uniqueIds.size, 133);
  for (const checkId of ['aamon', 'kalea', 'zetian', 'obsidia', 'sora', 'marcel', 'hirara', 'zilong']) {
    const hero = getMlbbHeroById(checkId);
    assert.equal(hero.id, checkId, `Expected hero ${checkId} in 133-hero roster`);
    assert.equal(hero.skills.length, 3);
  }

  // Complete 2026 Item Encyclopedia (103 items) + 7 Emblems + 27 Talents + 12 Battle Spells
  assert.equal(MLBB_ITEMS.length, 103);
  assert.equal(MLBB_EMBLEMS.length, 7);
  assert.equal(MLBB_TALENTS.length, 27);
  assert.equal(MLBB_BATTLE_SPELLS.length, 12);

  // Unique Passive Non-Stacking: Lifebane (50% anti-heal does not double-stack), Armor Buster (Malefic Roar + Malefic Gun -> 0.30, not 0.60)
  const antiHeal = resolveUniqueItemPassives(['sea_halberd', 'glowing_wand', 'dominance_ice']);
  assert.equal(antiHeal.antiHealReductionPct, 50);

  const penCheck = resolveUniqueItemPassives(['malefic_roar', 'malefic_gun']);
  assert.equal(penCheck.armorBusterPctPen, 0.3);
  const aggPen = aggregateMlbbItemStats(['malefic_roar', 'malefic_gun'], null);
  assert.ok(aggPen.pctPhysPen <= 0.301, 'Armor Buster unique passive must not double-stack % phys pen');

  // Magic Mastery lifts CDR cap from 40% to 45%
  assert.equal(resolveUniqueItemPassives(['blade_of_despair']).cdrCapPct, 40);
  assert.equal(resolveUniqueItemPassives(['enchanted_talisman']).cdrCapPct, 45);

  // Cross-passive Spellblade stacking: Endless Battle (Divine Justice) + Starlium Scythe (Crisis)
  const spellblade = resolveUniqueItemPassives(['endless_battle', 'starlium_scythe']);
  assert.equal(spellblade.hasDivineJustice, true);
  assert.equal(spellblade.hasCrisis, true);
  assert.equal(spellblade.spellbladeStacks, 2);
});

test('MLBB 2026 Battlefield VisionSystem (Bush Stealth, Eye Spot, Global Reveal & 2s Fog Ghost), PingSystem & Death Recap', () => {
  // 1. VisionSystem: bush stealth hides enemy, facecheck / global reveal exposes, 2s Fog Ghost spawns on vanish
  const vis = new MlbbVisionSystem();
  const bush = MAP_BUSHES[0];

  const blueHero = {
    id: 'h_blue',
    heroId: 'miya',
    name: 'Miya',
    team: 'blue' as const,
    x: bush.cx + 260,
    y: bush.cy,
    alive: true,
    inBush: false,
    stealthTimer: 0,
    revealedTimer: 0,
    color: '#38A3FF'
  };
  const redHero = {
    id: 'h_red',
    heroId: 'gusion',
    name: 'Gusion',
    team: 'red' as const,
    x: bush.cx,
    y: bush.cy,
    alive: true,
    inBush: true,
    stealthTimer: 0,
    revealedTimer: 0,
    color: '#FF3B4E'
  };

  // Hidden inside bush while blue hero is 260u away (> 135u facecheck)
  const step1 = vis.step(0.1, [blueHero, redHero], [], [], []);
  assert.equal(step1.visibleEnemyIds.has('h_red'), false);
  assert.equal(step1.spottedAllyIds.has('h_blue'), true, 'Blue hero outside bush is spotted by enemy within vision radius');

  // Global reveal (Aldous / YSS / Zetian Ult) exposes bush enemy
  vis.triggerGlobalReveal('blue', 3.0);
  const step2 = vis.step(0.1, [blueHero, redHero], [], [], []);
  assert.equal(step2.visibleEnemyIds.has('h_red'), true);

  // When global reveal expires and enemy vanishes back into bush, a 2.0s Fog Ghost spawns
  const step3 = vis.step(3.5, [blueHero, redHero], [], [], []);
  assert.equal(step3.visibleEnemyIds.has('h_red'), false);
  assert.equal(step3.fogGhosts.length, 1);
  assert.equal(step3.fogGhosts[0].heroId, 'gusion');

  // Fog ghost expires after 2.0s
  const step4 = vis.step(2.1, [blueHero, redHero], [], [], []);
  assert.equal(step4.fogGhosts.length, 0);

  // 2. PingSystem: Drag-to-mark Enemy, Turtle countdown, Bush ambush, OMW Route & Bot Order
  const pings = new MlbbPingSystem();
  const ctx = {
    heroes: [
      { id: 'e1', heroId: 'fanny', name: 'Fanny', team: 'red' as const, x: 2000, y: 2000, alive: true, visible: true }
    ],
    turrets: [
      { id: 't1', team: 'red' as const, lane: 'mid' as const, tier: 1, x: 2550, y: 1450, alive: true }
    ],
    objectives: [
      { id: 'turtle', kind: 'turtle', name: 'Turtle', x: 1480, y: 1480, alive: false, respawnTimer: 45 }
    ],
    matchTimeSec: 180,
    expLane: 'top' as const,
    goldLane: 'bot' as const
  };

  const pEnemy = pings.resolveAndEmitPing('attack', 2020, 1990, 'Player', 'blue', ctx);
  assert.equal(pEnemy.targetType, 'hero');
  assert.equal(pEnemy.label, 'Launch Attack on Fanny!');

  const pTurtle = pings.resolveAndEmitPing('gather', 1490, 1490, 'Player', 'blue', ctx);
  assert.equal(pTurtle.targetType, 'turtle');
  assert.ok(pTurtle.label.includes('00:45'), 'Dead Turtle ping should report countdown timer');

  const pBush = pings.resolveAndEmitPing('retreat', bush.cx, bush.cy, 'Player', 'blue', ctx);
  assert.equal(pBush.targetType, 'bush');
  assert.equal(pBush.label, 'Watch out for ambush here!');

  const pRoute = pings.resolveAndEmitPing('omw', 2500, 1500, 'Player', 'blue', ctx, [
    { x: 1000, y: 3000 },
    { x: 1800, y: 2200 },
    { x: 2500, y: 1500 }
  ]);
  assert.equal(pRoute.kind, 'omw');
  assert.equal(pRoute.routePoints?.length, 3);
  const botOrder = pings.getActiveBotPingOrder('blue', 1900, 1900);
  assert.ok(botOrder !== null && botOrder.kind === 'omw');

  // 3. Death Damage Recap Breakdown
  const recap = computeDeathRecapBreakdown(
    [
      { attackerId: 'e1', attackerName: 'Lancelot', heroId: 'lancelot', sourceName: 'Phantom Execution', damageType: 'physical', amount: 1200, timeSec: 98 },
      { attackerId: 'e2', attackerName: 'Kagura', heroId: 'kagura', sourceName: 'Yin Yang Overturn', damageType: 'magic', amount: 600, timeSec: 99 },
      { attackerId: 'e1', attackerName: 'Lancelot', heroId: 'lancelot', sourceName: 'Endless Battle', damageType: 'true', amount: 200, timeSec: 99.5 }
    ],
    100,
    'Lancelot',
    'lancelot'
  );
  assert.equal(recap.physicalPct + recap.magicPct + recap.truePct, 100);
  assert.equal(recap.physicalPct, 60);
  assert.equal(recap.magicPct, 30);
  assert.equal(recap.truePct, 10);
  assert.equal(recap.contributors[0].attackerName, 'Lancelot');
  assert.equal(recap.contributors[0].totalDamage, 1400);
});

test('MiniMilitia DA2: 20 iconic maps, 25 weapons, dual-wielding & shield rules, 21 ranks, 22 achievements & progression', () => {
  // 1. All 20 iconic maps + unique physics properties
  assert.equal(MM_MAPS.length, 20);
  const mapIds = new Set(MM_MAPS.map((m) => m.id));
  assert.equal(mapIds.size, 20, 'All 20 Mini Militia map IDs must be unique');

  const lunarcy = getMmMapById('lunarcy');
  assert.ok(lunarcy.gravityScale < 0.5, 'Lunarcy must have low lunar gravity');
  assert.equal(lunarcy.unlimitedJetpack, true, 'Lunarcy must have unlimited jetpack');

  const cliffhanger = getMmMapById('cliffhanger');
  assert.equal(cliffhanger.lethalAbyss, true, 'Cliffhanger must have lethal abyss');

  const icebox = getMmMapById('icebox');
  assert.ok(icebox.friction < 0.5, 'Icebox must have slippery low ice friction');

  // 2. All 25 weapons, 4 throwables, 8 pre-built loadouts, 4 special perks & Dual Wield rules
  assert.equal(MM_WEAPONS.length, 25);
  assert.equal(MM_GRENADES.length, 4);
  assert.equal(MM_PREBUILT_LOADOUTS.length, 8);
  assert.equal(MM_SPECIAL_PERKS.length, 4);

  const m93 = getMmWeaponById('m93ba');
  assert.equal(m93.zoomMax, 7.0);
  assert.equal(m93.hasLaserSight, true);

  assert.equal(canDualWieldPair('uzi', 'uzi'), true, 'Dual Uzis must be valid');
  assert.equal(canDualWieldPair('uzi', 'riot_shield'), true, 'Uzi + off-hand Riot Shield must be valid');
  assert.equal(canDualWieldPair('riot_shield', 'riot_shield'), false, 'Dual Riot Shields must be rejected');
  assert.equal(canDualWieldPair('ak47', 'uzi'), false, 'Two-handed AK-47 cannot dual wield');

  // 3. 21 Official Military Ranks & 22 Claimable Achievements
  assert.equal(MM_RANKS.length, 21);
  assert.equal(MM_ACHIEVEMENTS.length, 22);
  assert.equal(getMmRankForXp(0).current.title, 'Private');
  assert.equal(getMmRankForXp(500000).current.title, 'Commander-in-Chief');
  assert.equal(getMmRankForXp(500000).current.discountPct, 25);

  // 4. Match Summary Progression + Rank-Up Cash Bonus
  const baseSave = createDefaultMiniMilitiaSave();
  baseSave.xp = 4900; // 100 XP shy of Sergeant (5000)
  const updated = applyMatchSummaryToSave(baseSave, {
    victory: true,
    mode: 'tdm',
    mapId: 'outpost',
    mapName: 'Outpost',
    scoreBlue: 25,
    scoreRed: 14,
    playerKills: 12,
    playerDeaths: 4,
    playerAssists: 3,
    headshots: 4,
    meleeKills: 2,
    grenadeKills: 1,
    dualWieldKills: 5,
    sniperHeadshots: 2,
    macheteKills: 2,
    smawKills: 0,
    flameKills: 0,
    sawKills: 0,
    flagCaptures: 0,
    bombActions: 0,
    suicides: 0,
    bestStreak: 6,
    bestMultiKill: 3,
    waveReached: 0,
    durationSec: 185,
    isMvp: true,
    xpEarned: 600,
    coinsEarned: 180,
    cashEarned: 35,
    weaponDeltas: { uzi: { kills: 10, shotsFired: 120, shotsHit: 60, headshots: 2 } },
    scoreboard: []
  });

  assert.equal(updated.xp, 5500);
  assert.equal(getMmRankForXp(updated.xp).current.title, 'Sergeant');
  assert.equal(updated.cash, baseSave.cash + 35 + 75, 'Rank up must grant +75 bonus cash');
  assert.equal(updated.stats.kills, 12);
  assert.equal(updated.stats.dualWieldKills, 5);
  assert.equal(updated.weaponMastery.uzi.kills, 10);
  assert.equal(updated.matchHistory.length, 1);
});

test('Legends Arena MLBB 3D Upgrade: 4 Master Prompt 2026 Map Variants, 4-Skill Heroes, and Magnetic Drag-Ping Preview', () => {
  // 1. All 4 Master Prompt 2026 Map Variants registered
  assert.equal(PRIMARY_2026_VARIANTS.length, 4);
  assert.deepEqual([...PRIMARY_2026_VARIANTS], ['dangerous_grass', 'broken_walls', 'flying_cloud', 'expanding_rivers']);

  // 2. Dangerous Grass adds extra ambush bushes & isPointInBush respects variant
  const dgBushes = getActiveMapBushes('dangerous_grass');
  const stdBushes = getActiveMapBushes('flying_cloud');
  assert.equal(dgBushes.length, MAP_BUSHES.length + DANGEROUS_GRASS_EXTRA_BUSHES.length);
  assert.equal(stdBushes.length, MAP_BUSHES.length);
  const extraBush = DANGEROUS_GRASS_EXTRA_BUSHES[0];
  assert.equal(Boolean(isPointInBush(extraBush.cx, extraBush.cy, 'dangerous_grass')), true);
  assert.equal(Boolean(isPointInBush(extraBush.cx, extraBush.cy, 'flying_cloud')), false);

  // 3. Broken Walls removes shattered shortcut walls from active collision walls
  const brokenWalls = getActiveMapWalls('broken_walls');
  const stdWalls = getActiveMapWalls('dangerous_grass');
  assert.equal(stdWalls.length, MAP_WALLS.length);
  assert.equal(brokenWalls.length, MAP_WALLS.length - BROKEN_WALL_IDS.size);

  // 4. Expanding Rivers detects widened river & flooded jungle zones
  assert.equal(isPointInExpandedRiver(1420, 1650, 'expanding_rivers'), true);
  assert.equal(isPointInExpandedRiver(1420, 1650, 'dangerous_grass'), false);

  // 5. Authentic 4-Skill Hero registry
  assert.ok(Object.keys(FOUR_SKILL_HERO_META).length >= 15);
  assert.equal(isFourSkillHero('zhuxin'), true);
  assert.equal(isFourSkillHero('kagura'), true);
  assert.equal(isFourSkillHero('miya'), false);

  // 6. Press-and-Drag Pop-Out Map Magnetic Entity-Snapping Preview
  const pingSys = new MlbbPingSystem();
  const ctx = {
    heroes: [
      { id: 'enemy-1', heroId: 'fanny', name: 'Fanny', team: 'red' as const, x: 1850, y: 1820, alive: true, visible: true }
    ],
    turrets: [
      { id: 'red-mid-1', team: 'red' as const, lane: 'mid' as const, tier: 1, x: 2550, y: 1450, alive: true }
    ],
    objectives: [
      { id: 'turtle-1', kind: 'turtle', name: 'Turtle', x: 1320, y: 1320, alive: false, respawnTimer: 42 }
    ],
    matchTimeSec: 150,
    expLane: 'top' as const,
    goldLane: 'bot' as const,
    mapVariant: 'dangerous_grass' as const
  };

  const enemySnap = pingSys.previewPingTarget('attack', 1900, 1860, 'blue', ctx);
  assert.equal(enemySnap.snapped, true);
  assert.equal(enemySnap.targetType, 'hero');
  assert.equal(enemySnap.snappedX, 1850);
  assert.ok(enemySnap.label.includes('Attack Fanny'));

  const turtleCountdownSnap = pingSys.previewPingTarget('gather', 1350, 1340, 'blue', ctx);
  assert.equal(turtleCountdownSnap.snapped, true);
  assert.equal(turtleCountdownSnap.targetType, 'turtle');
  assert.ok(turtleCountdownSnap.label.includes('spawns in 00:42'));

  const turretSnap = pingSys.previewPingTarget('attack', 2580, 1480, 'blue', ctx);
  assert.equal(turretSnap.snapped, true);
  assert.equal(turretSnap.targetType, 'turret');

  const bushSnap = pingSys.previewPingTarget('retreat', extraBush.cx, extraBush.cy, 'blue', ctx);
  assert.equal(bushSnap.targetType, 'bush');
});

test('MLBB Part 1 profile save, starter 10-player match history scoreboard, and AudioEngine BGM/SFX safety', () => {
  const save = createDefaultMlbbSave();
  assert.equal(save.creditScore, 110);
  assert.ok(save.dailyActivity >= 0 && save.dailyActivity <= 800);
  assert.ok(save.matchHistory.length >= 1, 'Starter profile should pre-seed at least 1 inspectable match history entry');
  const firstMatch = save.matchHistory[0];
  assert.equal(firstMatch.players.length, 10, 'Seeded match history record must include all 10 players for scoreboard modal');
  assert.equal(firstMatch.players.filter((p) => p.team === 'blue').length, 5);
  assert.equal(firstMatch.players.filter((p) => p.team === 'red').length, 5);
  assert.equal(firstMatch.items.length, 6);

  const audio = new MlbbAudioEngine();
  audio.setVolumes(save.settings.sound);
  audio.startLobbyBgm();
  audio.playMatchFoundGong();
  audio.playPlayerReady();
  audio.playBanSlam();
  audio.playHeroLockIn();
  audio.playCountdownTick(true);
  audio.stopLobbyBgm();
  assert.ok(true);
});

test('MLBB Part 2 Land of Dawn: exact timers, 4 small jungle camps, Siege lane bonuses, outer plates, weakest-lane Lord, 3-state turret rings, Brawl bridge, river current, and team-scoped Walkie Grass vision', () => {
  // 1. Exact Part 2 timers
  assert.equal(MLBB_25D_TIMERS.MINION_FIRST_SPAWN, 10);
  assert.equal(MLBB_25D_TIMERS.MINION_INTERVAL, 30);
  assert.equal(MLBB_25D_TIMERS.ORANGE_FIRST_SPAWN, 20);
  assert.equal(MLBB_25D_TIMERS.PURPLE_FIRST_SPAWN, 20);
  assert.equal(MLBB_25D_TIMERS.BUFF_RESPAWN, 75);
  assert.equal(MLBB_25D_TIMERS.SMALL_CAMP_FIRST_SPAWN, 25);
  assert.equal(MLBB_25D_TIMERS.SMALL_CAMP_RESPAWN, 60);
  assert.equal(MLBB_25D_TIMERS.LITHO_FIRST_SPAWN, 43);
  assert.equal(MLBB_25D_TIMERS.LITHO_RESPAWN, 120);
  assert.equal(MLBB_25D_TIMERS.WALKIE_GRASS_DURATION, 45);
  assert.equal(MLBB_25D_TIMERS.CRAB_FIRST_SPAWN, 45);
  assert.equal(MLBB_25D_TIMERS.CRAB_SMALL_RESPAWN, 90);
  assert.equal(MLBB_25D_TIMERS.CRAB_GOLD_BUFF_DURATION, 18);
  assert.equal(MLBB_25D_TIMERS.TURTLE_FIRST_SPAWN, 120);
  assert.equal(MLBB_25D_TIMERS.TURTLE_RESPAWN, 120);
  assert.equal(MLBB_25D_TIMERS.OUTER_SHIELD_EXPIRE, 300);
  assert.equal(MLBB_25D_TIMERS.OUTER_PLATE_GOLD, 40);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE1_SPAWN, 480);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE2_TIME, 720);
  assert.equal(MLBB_25D_TIMERS.LORD_STAGE3_TIME, 1080);
  assert.equal(MLBB_25D_TIMERS.LORD_RESPAWN_EARLY, 180);

  // 2. All 4 small jungle camp types (Rockursa, Fiend, Beetle, Crammer) + Lithowanderer + Crab + Turtle + Lord present
  const camps = createJungleCampSpecs('top');
  const kinds = new Set(camps.map((c) => c.kind));
  const names = new Set(camps.map((c) => c.name));
  for (const required of ['orange_buff', 'purple_buff', 'horned_lizard', 'lava_golem', 'fire_beetle', 'crammer', 'litho', 'crab', 'turtle', 'lord'] as const) {
    assert.ok(kinds.has(required), `Missing jungle camp kind: ${required}`);
  }
  for (const campName of ['Rockursa', 'Fiend', 'Beetle', 'Crammer', 'Lithowanderer', 'Sanctum Crab', 'Turtle', 'Sanctuary Lord']) {
    assert.ok(names.has(campName), `Missing jungle camp name: ${campName}`);
  }

  // 3. Siege Minion early-game +45% Gold (Gold Lane) & +35% EXP (EXP Lane) before 05:00
  const goldSiegeEarly = computeEarlyLaneMinionRewards('siege', 'bot', 'top', 'bot', 120);
  const expSiegeEarly = computeEarlyLaneMinionRewards('siege', 'top', 'top', 'bot', 120);
  const midSiegeEarly = computeEarlyLaneMinionRewards('siege', 'mid', 'top', 'bot', 120);
  const goldSiegeLate = computeEarlyLaneMinionRewards('siege', 'bot', 'top', 'bot', 310);
  assert.equal(goldSiegeEarly.gold, Math.round(75 * 1.45));
  assert.equal(expSiegeEarly.exp, Math.round(110 * 1.35));
  assert.equal(midSiegeEarly.gold, 75);
  assert.equal(midSiegeEarly.exp, 110);
  assert.equal(goldSiegeLate.gold, 75);

  // 4. Outer Turret Energy Shield (00:00-05:00): 50% mitigation & +40g per 300 plate
  const plateHit = computeOuterTurretPlateDamage(700, true, 1500, 0, 120);
  assert.equal(plateHit.finalDamage, 350);
  assert.equal(plateHit.nextShieldHp, 1150);
  assert.equal(plateHit.platesBroken, 1);
  assert.equal(plateHit.plateGoldAward, 40);
  assert.equal(plateHit.nextPlateAccum, 50);

  const post5MinHit = computeOuterTurretPlateDamage(700, true, 1500, 0, 305);
  assert.equal(post5MinHit.finalDamage, 700);
  assert.equal(post5MinHit.plateGoldAward, 0);

  // 5. Weakest Enemy Lane selection for Allied Lord march
  const sampleTurrets = [
    { team: 'red' as const, lane: 'top' as const, alive: true, hp: 4500 },
    { team: 'red' as const, lane: 'top' as const, alive: true, hp: 5200 },
    { team: 'red' as const, lane: 'mid' as const, alive: true, hp: 5200 },
    { team: 'red' as const, lane: 'bot' as const, alive: true, hp: 2100 }
  ];
  assert.equal(selectWeakestEnemyLane(sampleTurrets, 'red'), 'bot');

  // 6. 3-State Turret Ring (Safe Green / Caution Yellow when no minions or low-HP minion <35% / Locked Red)
  const turretCand = { id: 'red_mid_1', team: 'red' as const, x: 2000, y: 2000, range: 340, targetId: null as string | null, alive: true };
  assert.equal(computeTurretRingState(turretCand, 'p1', 'blue', []), 'warn');
  assert.equal(
    computeTurretRingState(turretCand, 'p1', 'blue', [{ team: 'blue', x: 2050, y: 2050, hp: 200, maxHp: 1000, alive: true }]),
    'warn',
    'Low-HP minion (<35% HP) must trigger Caution Yellow ring'
  );
  assert.equal(
    computeTurretRingState(turretCand, 'p1', 'blue', [{ team: 'blue', x: 2050, y: 2050, hp: 800, maxHp: 1000, alive: true }]),
    'safe',
    'Healthy minion (>=35% HP) inside range must trigger Safe Green ring'
  );
  assert.equal(
    computeTurretRingState({ ...turretCand, targetId: 'p1' }, 'p1', 'blue', [{ team: 'blue', x: 2050, y: 2050, hp: 900, maxHp: 1000, alive: true }]),
    'locked'
  );

  // 7. Dedicated Brawl Single-Lane Bridge clamping, 4 turrets (2 per side), & 2 Healing Shrines
  assert.equal(BRAWL_TURRETS.length, 4);
  assert.equal(BRAWL_HEALING_SHRINES.length, 2);
  assert.equal(createInitialBrawlShrines().length, 2);
  const clamped = clampToBrawlBridge(600, 600, 30);
  const perpDistAfter = Math.abs(clamped.x + clamped.y - 4000) / Math.SQRT2;
  assert.ok(perpDistAfter <= BRAWL_BRIDGE_HALF_WIDTH - 29, 'Off-bridge point must clamp onto Brawl bridge corridor');

  // 8. River Current speed bonus (+15% standard river, +28% Expanding Rivers)
  assert.equal(getRiverCurrentSpeedBonus(2000, 2000, 'dangerous_grass'), 0.15);
  assert.equal(getRiverCurrentSpeedBonus(2000, 2000, 'expanding_rivers'), 0.28);
  assert.equal(getRiverCurrentSpeedBonus(420, 3580, 'dangerous_grass'), 0);

  // 9. Walkie Grass moving ward grants team-scoped river vision & Dangerous Grass bush conceals heroes
  const blueWard = createWalkieGrassWard('wg_1', 'blue', 1680, 1680);
  const stepped = stepWalkieGrassWards([blueWard], 1.0);
  assert.equal(stepped.length, 1);
  assert.notEqual(stepped[0].x, stepped[0].originX);

  const vision = new MlbbVisionSystem();
  const extraBush = DANGEROUS_GRASS_EXTRA_BUSHES[0];
  const res = vision.step(
    0.1,
    [
      { id: 'b1', heroId: 'miya', name: 'Miya', team: 'blue', x: 500, y: 3500, alive: true, inBush: false, stealthTimer: 0, revealedTimer: 0, color: '#38BDF8', recentlyAttackedTimer: 0 },
      { id: 'r_river', heroId: 'fanny', name: 'Fanny', team: 'red', x: stepped[0].x + 80, y: stepped[0].y + 80, alive: true, inBush: false, stealthTimer: 0, revealedTimer: 0, color: '#EF4444', recentlyAttackedTimer: 0 },
      { id: 'r_bush', heroId: 'natalia', name: 'Natalia', team: 'red', x: extraBush.cx, y: extraBush.cy, alive: true, inBush: true, stealthTimer: 0, revealedTimer: 0, color: '#A855F7', recentlyAttackedTimer: 0 }
    ],
    [],
    [],
    [{ x: stepped[0].x, y: stepped[0].y, radius: stepped[0].radius, team: 'blue' }],
    'dangerous_grass'
  );
  assert.equal(res.visibleEnemyIds.has('r_river'), true, 'Blue Walkie Grass ward must reveal red hero in river');
  assert.equal(res.visibleEnemyIds.has('r_bush'), false, 'Enemy inside Dangerous Grass extra bush must remain hidden');

  // Audio Part 2 SFX methods safety
  const audio = new MlbbAudioEngine();
  audio.playShieldShatter();
  audio.playCrystalShatter();
  audio.playShrineHeal();
});

test('MLBB Part 3: CC Duration Death Recap, 140ms Ping Gesture, OMW Route & Custom UI Defaults', () => {
  // 1. Death Recap aggregates Total CC Suffered over last 15s and excludes stale >15s CC
  const recap = computeDeathRecapBreakdown(
    [
      { attackerId: 'r1', attackerName: 'Tigreal', heroId: 'tigreal', sourceName: 'Implosion', damageType: 'physical', amount: 850, timeSec: 112 },
      { attackerId: 'r2', attackerName: 'Eudora', heroId: 'eudora', sourceName: 'Thunder Wrath', damageType: 'magic', amount: 1450, timeSec: 114 }
    ],
    115,
    'Eudora',
    'eudora',
    [
      { ccType: 'slow', durationSec: 2.0, timeSec: 90 }, // stale (>15s ago) — must be excluded
      { ccType: 'stun', durationSec: 1.8, timeSec: 112 },
      { ccType: 'airborne', durationSec: 1.0, timeSec: 113 },
      { ccType: 'stun', durationSec: 1.25, timeSec: 114 }
    ]
  );
  assert.equal(recap.totalCcSec, 4.1, 'Total CC must sum recent 15s CC events (1.8 + 1.0 + 1.25 = 4.05 -> 4.1s)');
  assert.equal(recap.ccBreakdown[0].ccType, 'stun');
  assert.equal(recap.ccBreakdown[0].durationSec, 3.1);
  assert.equal(recap.ccBreakdown[0].count, 2);
  assert.equal(recap.ccBreakdown[1].ccType, 'airborne');
  assert.equal(recap.ccBreakdown[1].durationSec, 1.0);

  // 2. Press-and-Hold Drag-to-Mark gesture threshold (140ms hold OR >10px drag)
  assert.equal(classifyPingGesture(80, 3), 'tap');
  assert.equal(classifyPingGesture(139, 10), 'tap');
  assert.equal(classifyPingGesture(140, 0), 'drag', 'Holding >=140ms must open Pop-Out Mini-Map');
  assert.equal(classifyPingGesture(40, 11), 'drag', 'Dragging >10px must open Pop-Out Mini-Map');

  // 3. Expanded Minimap "On My Way" hero-origin route generation
  const route = buildOmwRouteFromHero(600, 3400, 2000, 2000, 6);
  assert.equal(route.length, 7);
  assert.deepEqual(route[0], { x: 600, y: 3400 });
  assert.deepEqual(route[route.length - 1], { x: 2000, y: 2000 });

  // 4. PingSystem emits OMW route trail & magnetic snap previews cleanly
  const pingSys = new MlbbPingSystem();
  const ctx = {
    heroes: [
      { id: 'r1', heroId: 'miya', name: 'Miya', team: 'red' as const, x: 2400, y: 1600, alive: true, visible: true }
    ],
    turrets: [
      { id: 'red_mid_1', team: 'red' as const, lane: 'mid' as const, tier: 1, x: 2650, y: 1350, alive: true }
    ],
    objectives: [
      { id: 'turtle', kind: 'turtle', name: 'Turtle', x: 1450, y: 1450, alive: false, respawnTimer: 42 }
    ],
    matchTimeSec: 180,
    expLane: 'top' as const,
    goldLane: 'bot' as const
  };
  const snapEnemy = pingSys.previewPingTarget('attack', 2430, 1620, 'blue', ctx);
  assert.equal(snapEnemy.snapped, true);
  assert.equal(snapEnemy.targetType, 'hero');
  assert.ok(snapEnemy.label.includes('Miya'));

  const snapTurtle = pingSys.previewPingTarget('gather', 1460, 1460, 'blue', ctx);
  assert.equal(snapTurtle.snapped, true);
  assert.equal(snapTurtle.targetType, 'turtle');
  assert.ok(snapTurtle.label.includes('00:42'), 'Dead Turtle ping must announce exact respawn countdown');

  const omwPing = pingSys.resolveAndEmitPing('omw', 2000, 2000, 'Layla', 'blue', ctx, route);
  assert.equal(omwPing.kind, 'omw');
  assert.equal(omwPing.routePoints?.length, 7);

  // 5. Custom UI Layout defaults include all Part 3 HUD controls
  const save = createDefaultMlbbSave();
  for (const key of ['minimap', 'shopBar', 'joystick', 'recall', 'regen', 'spell', 'activeItem', 'skill1', 'skill2', 'skill3', 'basicAtk', 'minionBtn', 'turretBtn', 'pings']) {
    assert.ok(save.settings.interface.customUi3Skill[key], `Missing customUi3Skill key: ${key}`);
  }
  assert.ok(save.settings.interface.customUi4Skill.skill4, '4-skill layout preset must include skill4');
});

test('MLBB Part 4: Combat Math Caps, 50% Anti-Heal, 6-Tier CC, 5-Layer VFX & All 66 A-K Heroes + Hirara #58', () => {
  // 1. Stat Caps: Crit (200%/240%), Attack Speed (3.00/5.00), CDR (40%/45%), 50% Anti-Heal & Floryn Bypass
  assert.equal(computeCriticalMultiplier(false), 2.0);
  assert.equal(computeCriticalMultiplier(true), 2.4);
  assert.equal(applyAttackSpeedCap(4.5, false), 3.0);
  assert.equal(applyAttackSpeedCap(4.5, true), 4.5);
  assert.equal(applyAttackSpeedCap(6.2, true), 5.0);
  assert.equal(applyCdrCap(0.55, false), 0.4);
  assert.equal(applyCdrCap(0.55, true), 0.45);
  assert.equal(applyAntiHealReduction(600, true, false), 300);
  assert.equal(applyAntiHealReduction(600, true, true), 600);
  assert.equal(isDashBlockingCc('grounded'), true);
  assert.equal(isDashBlockingCc('root'), true);
  assert.equal(isDashBlockingCc('slow'), false);

  // 2. 9 Elemental VFX Palettes & Damage Number Styling
  assert.equal(Object.keys(ELEMENT_PALETTES).length, 9);
  assert.equal(getHeroElement('hirara', 'Mage'), 'astral');
  assert.equal(getHeroElement('kadita', 'Mage'), 'water');
  assert.equal(getHeroElement('barats', 'Tank'), 'fire');
  const critStyle = getDamageNumberStyle('physical', true, 'damage');
  const healStyle = getDamageNumberStyle('magic', false, 'heal');
  const shieldStyle = getDamageNumberStyle('magic', false, 'shield');
  assert.ok(critStyle.fontSize >= 20 && critStyle.color === '#FACC15');
  assert.equal(healStyle.color, '#2CE58B');
  assert.equal(shieldStyle.color, '#38BDF8');

  // 3. Canonical Hirara #58 Alignment (Mage/Support, Mid, Astral Prism / Radiant Lance / Mirror Veil / Supernova Convergence)
  const hiraraDef = getMlbbHeroById('hirara');
  assert.equal(hiraraDef.id, 'hirara');
  assert.equal(hiraraDef.role, 'Mage');
  assert.equal(hiraraDef.secondaryRole, 'Support');
  assert.equal(hiraraDef.lane, 'Mid');
  assert.equal(hiraraDef.passiveName, 'Astral Prism');
  assert.equal(hiraraDef.skills[0].name, 'Radiant Lance');
  assert.equal(hiraraDef.skills[1].name, 'Mirror Veil');
  assert.equal(hiraraDef.skills[2].name, 'Supernova Convergence');

  // 4. Verify ALL 66 A-K Heroes exist in MLBB_ALL_HEROES & every skill slot (1-3) executes cleanly
  assert.equal(PART4_HERO_IDS_A_TO_K.length, 66);
  const allIds = new Set(MLBB_ALL_HEROES.map((h) => h.id));
  for (const hid of PART4_HERO_IDS_A_TO_K) {
    assert.ok(allIds.has(hid), `Part 4 hero "${hid}" must exist in MLBB_ALL_HEROES`);
  }

  const makeHero = (heroId: string, id: string, team: 'blue' | 'red', x: number, y: number): SimHero => {
    const def = getMlbbHeroById(heroId);
    return {
      id,
      name: def.name,
      team,
      heroDef: def,
      skinColor: def.primaryColor,
      skinAccent: def.accentColor,
      lane: 'Mid',
      role: def.role,
      isPlayer: id === 'p1',
      x,
      y,
      vx: 0,
      vy: 0,
      facing: 0,
      radius: 26,
      level: 10,
      xp: 0,
      xpToNext: 1000,
      skillPoints: 0,
      skillLevels: [4, 4, 2],
      skillCds: [0, 0, 0],
      spellId: 'flicker',
      spellCd: 0,
      emblemId: 'mage',
      talents: { t1: 'thrill', t2: 'bargain_hunter', t3: 'lethal_ignition' },
      hp: 3600,
      maxHp: 3600,
      hpTrail: 3600,
      shield: 0,
      mana: 1400,
      maxMana: 1400,
      gold: 4000,
      totalGold: 4000,
      kills: 0,
      deaths: 0,
      assists: 0,
      streak: 0,
      multiKill: 0,
      multiKillTimer: 0,
      alive: true,
      respawnTimer: 0,
      atkCd: 0,
      hitFlashTimer: 0,
      inBush: false,
      revealedTimer: 0,
      spottedByEnemy: false,
      recentlyAttackedTimer: 0,
      recalling: false,
      recallTimer: 0,
      recallCd: 0,
      regenCd: 0,
      regenTimer: 0,
      activeItemCd: 0,
      emoteCd: 0,
      activeEmote: null,
      items: [],
      blessingId: null,
      prioritizedItemId: null,
      activeBuildIdx: 0,
      buildPlan: [],
      junglerStacks: 0,
      roamGold: 0,
      isJungler: false,
      isRoamer: false,
      ccType: null,
      ccTimer: 0,
      ccPriority: 0,
      ccImmuneTimer: 0,
      untargetableTimer: 0,
      physImmuneTimer: 0,
      stealthTimer: 0,
      speedBoostPct: 0,
      speedBoostTimer: 0,
      slowPct: 0,
      slowTimer: 0,
      antiHealTimer: 0,
      defShredFlat: 0,
      defShredTimer: 0,
      passiveStacks: 0,
      passiveTimer: 0,
      passiveCd: 0,
      immortalityCd: 0,
      markedTimer: 0,
      markedBy: null,
      recastSlot: null,
      recastTimer: 0,
      attachedAllyId: null,
      attachedTimer: 0,
      tetherTargetId: null,
      tetherTimer: 0,
      tetherKind: null,
      orbitBlades: 0,
      orbitTimer: 0,
      orangeBuffTimer: 0,
      purpleBuffTimer: 0,
      turtleBuffTimer: 0,
      turtleKillerBuffTimer: 0,
      turtleShieldRefreshAccum: 0,
      goldCrabBuffTimer: 0,
      goldCrabTickAccum: 0,
      evolvedLordAuraTimer: 0,
      bushParticleAccum: 0,
      justRespawnedCloudReady: false,
      windChantTimer: 0,
      winterCrownTimer: 0,
      vengeanceTimer: 0,
      inspireTimer: 0,
      outOfCombatTimer: 0,
      castWindup: 0,
      castBackswing: 0,
      castColor: def.primaryColor,
      dashVx: 0,
      dashVy: 0,
      dashTimer: 0,
      dashWallCross: false,
      leapZ: 0,
      leapTimer: 0,
      leapDuration: 0,
      modelScale: 1.0,
      deathImmuneTimer: 0,
      eggFormTimer: 0,
      blindedTimer: 0,
      wallPhaseTimer: 0,
      carDriveTimer: 0,
      beatrixGunIdx: 0,
      julianCastCount: 0,
      carmillaLinkIds: [],
      carmillaLinkTimer: 0,
      harleyRingTimer: 0,
      harleyRingDamage: 0,
      harleyRingCasterId: null,
      glooAttachTargetId: null,
      glooAttachTimer: 0,
      kaditaHealBank: 0,
      kaditaHealTimer: 0,
      fredrinnGreyHp: 0,
      toggleAuraTimer: 0,
      toggleAuraKind: null,
      snapbackAnchor: null,
      hiraraPrisms: [],
      tauntTargetId: null,
      physAtk: 220,
      magicPow: 320,
      physDef: 80,
      magicDef: 65,
      flatPhysPen: 15,
      pctPhysPen: 0.2,
      flatMagicPen: 15,
      pctMagicPen: 0.2,
      atkSpd: 1.4,
      critChance: 0.25,
      critDmgPct: 2.0,
      cdrPct: 0.2,
      moveSpd: 310,
      lifestealPct: 0.1,
      spellVampPct: 0.1,
      ccResPct: 0,
      hpRegen: 8,
      damageDealt: 0,
      damageTaken: 0,
      turretDamage: 0,
      recentDamagers: {},
      aiState: 'lane',
      aiTimer: 0,
      aiTargetX: x,
      aiTargetY: y,
      turretHitsOnMe: 0,
      turretHitResetTimer: 0,
      damageLog: [],
      ccLog: [],
      lastDeathRecap: null,
      potionBuffTimer: 0,
      potionBuffKind: null
    };
  };

  let blindTriggered = false;
  let florynBypassObserved = false;
  let tempWallsSpawned = 0;
  let shieldsGranted = 0;
  const tempWalls: Array<{ id: string; x: number; y: number; w: number; h: number; color: string; ttl: number; maxTtl: number; ownerId: string }> = [];

  const callbacks: SimCallbacks = {
    dealDamageToHero: (_att, tgt, raw) => {
      tgt.hp = Math.max(100, tgt.hp - Math.round(raw * 0.25));
      return Math.round(raw * 0.25);
    },
    dealDamageToMinion: () => 0,
    dealDamageToJungle: () => 0,
    dealDamageToTurret: () => 0,
    applyCc: (tgt, ccType, dur) => {
      tgt.ccType = ccType;
      tgt.ccTimer = dur;
    },
    spawnVfx: () => {},
    spawnProjectile: () => {},
    healHero: (_tgt, _amt, _src, bypassAntiHeal) => {
      if (bypassAntiHeal) florynBypassObserved = true;
    },
    grantShield: (tgt, amt) => {
      tgt.shield += Math.round(amt);
      shieldsGranted++;
    },
    announce: () => {},
    triggerGlobalReveal: () => {},
    triggerGlobalBlind: () => {
      blindTriggered = true;
    },
    spawnTempWall: (wall) => {
      tempWalls.push(wall);
      tempWallsSpawned++;
    }
  };

  // Test all 66 A-K heroes casting Skills 1, 2, and 3 without throwing
  for (const hid of PART4_HERO_IDS_A_TO_K) {
    const caster = makeHero(hid, 'p1', 'blue', 1950, 2000);
    const ally = makeHero('layla', 'a1', 'blue', 1880, 2020);
    const enemy = makeHero('miya', 'e1', 'red', 2120, 2000);
    const ctx: SkillCastContext = {
      heroes: [caster, ally, enemy],
      minions: [],
      turrets: [],
      jungleMobs: [],
      callbacks,
      matchTimeSec: 120,
      noCooldown: true,
      tempWalls
    };
    for (const slot of [1, 2, 3] as const) {
      caster.skillCds = [0, 0, 0];
      caster.mana = caster.maxMana;
      caster.ccType = null;
      const ok = castHeroSkill(caster, slot, 0, 170, ctx);
      assert.equal(ok, true, `Hero ${hid} slot ${slot} must cast cleanly`);
    }
    stepPart4HeroPassives(caster, 0.12, [caster, ally, enemy], callbacks, tempWalls);
  }

  assert.equal(blindTriggered, true, 'Helcurt Ultimate must trigger 3.5s Global Blind');
  assert.equal(florynBypassObserved, true, 'Floryn Ultimate must trigger Anti-Heal bypass heal');
  assert.ok(tempWallsSpawned >= 2, 'Grock/Badang must spawn temporary player-created walls');
  assert.ok(shieldsGranted > 0, 'Part 4 kits must route shields through grantShield callback');

  // 5. Specific Mechanic Spot-Checks: Hirara Prisms, Barats Dynamic Scale, Grounded Dash Block, Temp Wall Collision, Silhouette/Stack Badges
  const hirara = makeHero('hirara', 'p1', 'blue', 2000, 2000);
  const foe = makeHero('miya', 'e1', 'red', 2160, 2000);
  const hCtx: SkillCastContext = { heroes: [hirara, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 60, noCooldown: true, tempWalls };
  castHeroSkill(hirara, 1, 0, 160, hCtx);
  assert.ok(hirara.hiraraPrisms.length >= 1, 'Hirara S1 Radiant Lance must deploy an Astral Prism');
  assert.ok(getHeroStackBadge(hirara)?.label.includes('PRISM'));

  const barats = makeHero('barats', 'p1', 'blue', 2000, 2000);
  barats.passiveStacks = 10;
  stepPart4HeroPassives(barats, 0.1, [barats], callbacks, tempWalls);
  assert.ok(barats.modelScale >= 1.4, 'Barats at 10 Big Guy stacks must dynamically scale model up to 1.45x');

  const groundedDasher = makeHero('chou', 'p1', 'blue', 2000, 2000);
  groundedDasher.ccType = 'grounded';
  groundedDasher.ccTimer = 2.0;
  assert.equal(
    castHeroSkill(groundedDasher, 1, 0, 200, { heroes: [groundedDasher, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 60, noCooldown: true }),
    false,
    'Grounded CC must block dash/blink skills'
  );
  assert.equal(getHeroCcBadge(groundedDasher)?.text, 'GROUNDED');

  const argus = makeHero('argus', 'p1', 'blue', 2000, 2000);
  argus.deathImmuneTimer = 4.0;
  argus.shield = 500;
  const sil = resolveHeroSilhouetteState(argus);
  assert.equal(sil.goldCcImmune, true);
  assert.equal(sil.deathImmune, true);
  assert.equal(sil.cyanShielded, true);
  assert.equal(getHeroCcBadge(argus)?.text, 'IMMORTAL');

  const tempWallTest = [{ id: 'tw1', x: 2050, y: 1950, w: 80, h: 120, color: '#A8A29E', ttl: 4, maxTtl: 4, ownerId: 'p1' }];
  const col = resolveWallCollision(2090, 2000, 26, {}, 'dangerous_grass', false, tempWallTest);
  assert.equal(col.hitWall, true, 'resolveWallCollision must detect player-created temporary walls');
});

test('MLBB Part 5: Complete 133-Hero Roster (66 A-K + 67 K-Z), 5-Tier Skin Switcher, 4-Chapter Mastery, and Bespoke K-Z Kits', () => {
  // 1. Exact 133-hero partition with 0 duplicates and 0 gaps
  assert.equal(MLBB_ALL_HEROES.length, 133, 'Roster must contain all 133 playable champions');
  assert.equal(PART4_HERO_IDS_A_TO_K.length, 66, 'Part 4 must cover exactly 66 A-K heroes');
  assert.equal(PART5_HERO_IDS_K_TO_Z.length, 67, 'Part 5 must cover exactly 67 K-Z heroes');

  const combined = new Set([...PART4_HERO_IDS_A_TO_K, ...PART5_HERO_IDS_K_TO_Z]);
  assert.equal(combined.size, 133, 'Part 4 + Part 5 IDs must have 133 unique entries with zero overlap');
  for (const h of MLBB_ALL_HEROES) {
    assert.ok(combined.has(h.id), `Hero ${h.id} must be covered by Part 4 or Part 5`);
    // Every hero must expose a complete 5-tier Skin Switcher
    assert.equal(h.skins.length, 5, `${h.name} must have all 5 skin tiers`);
    assert.equal(h.skins[0].tag, 'Default', `${h.name} first skin must be Default`);
    // Every hero must resolve a valid elemental VFX palette
    const elem = getHeroElement(h.id);
    assert.ok(ELEMENT_PALETTES[elem]?.primary.startsWith('#'), `${h.id} must map to a valid elemental palette`);
    // Every hero must generate 4 Hero Mastery chapters
    const mastery = getHeroMasterySummary(h, { matches: 6, wins: 4, mmr: 1320, mastery: 85 }, true, [1]);
    assert.equal(mastery.chapters.length, 4, `${h.name} must have 4 Hero Mastery chapters`);
    assert.equal(mastery.chapters[0].claimed, true);
    assert.equal(mastery.chapters[1].completed, true);
  }

  // 4-skill hero preview check (Kagura, Zhuxin, Lukas, Lunox, etc.)
  assert.ok(getHeroExtraSkillPreview('kagura') !== null, 'Kagura must expose 4th skill preview');
  assert.ok(getHeroExtraSkillPreview('lunox') !== null, 'Lunox must expose 4th skill preview');

  // 2. Build test harness for all 67 Part 5 K-Z heroes
  const makeHero = (heroId: string, id: string, team: 'blue' | 'red', x: number, y: number): SimHero => {
    const def = getMlbbHeroById(heroId);
    return {
      id,
      name: def.name,
      team,
      heroDef: def,
      skinColor: def.primaryColor,
      skinAccent: def.accentColor,
      lane: def.lane,
      role: def.role,
      isPlayer: id === 'p1',
      x,
      y,
      vx: 0,
      vy: 0,
      facing: 0,
      radius: 26,
      level: 10,
      xp: 0,
      xpToNext: 500,
      skillPoints: 0,
      skillLevels: [4, 4, 2],
      skillCds: [0, 0, 0],
      spellId: 'flicker',
      spellCd: 0,
      emblemId: 'assassin',
      talents: { t1: 'thrill', t2: 'festival_blood', t3: 'lethal_ignition' },
      hp: 3000,
      maxHp: 3000,
      hpTrail: 3000,
      shield: 0,
      mana: 1000,
      maxMana: 1000,
      gold: 5000,
      totalGold: 5000,
      kills: 0,
      deaths: 0,
      assists: 0,
      streak: 0,
      multiKill: 0,
      multiKillTimer: 0,
      alive: true,
      respawnTimer: 0,
      atkCd: 0,
      hitFlashTimer: 0,
      inBush: false,
      revealedTimer: 0,
      spottedByEnemy: false,
      recentlyAttackedTimer: 0,
      recalling: false,
      recallTimer: 0,
      recallCd: 0,
      regenCd: 0,
      regenTimer: 0,
      activeItemCd: 0,
      emoteCd: 0,
      activeEmote: null,
      items: [],
      blessingId: null,
      prioritizedItemId: null,
      activeBuildIdx: 0,
      buildPlan: def.recommendedBuild,
      junglerStacks: 0,
      roamGold: 0,
      isJungler: false,
      isRoamer: false,
      ccType: null,
      ccTimer: 0,
      ccPriority: 0,
      ccImmuneTimer: 0,
      untargetableTimer: 0,
      physImmuneTimer: 0,
      stealthTimer: 0,
      speedBoostPct: 0,
      speedBoostTimer: 0,
      slowPct: 0,
      slowTimer: 0,
      antiHealTimer: 0,
      defShredFlat: 0,
      defShredTimer: 0,
      passiveStacks: 2,
      passiveTimer: 2,
      passiveCd: 0,
      immortalityCd: 0,
      recastSlot: null,
      recastTimer: 0,
      markedTimer: 0,
      markedBy: null,
      attachedAllyId: null,
      attachedTimer: 0,
      tetherTargetId: null,
      tetherTimer: 0,
      tetherKind: null,
      orbitBlades: 0,
      orbitTimer: 0,
      orangeBuffTimer: 0,
      purpleBuffTimer: 0,
      turtleBuffTimer: 0,
      turtleKillerBuffTimer: 0,
      turtleShieldRefreshAccum: 0,
      goldCrabBuffTimer: 0,
      goldCrabTickAccum: 0,
      evolvedLordAuraTimer: 0,
      bushParticleAccum: 0,
      justRespawnedCloudReady: false,
      windChantTimer: 0,
      winterCrownTimer: 0,
      vengeanceTimer: 0,
      inspireTimer: 0,
      outOfCombatTimer: 0,
      castWindup: 0,
      castBackswing: 0,
      castColor: def.primaryColor,
      dashVx: 0,
      dashVy: 0,
      dashTimer: 0,
      dashWallCross: false,
      leapZ: 0,
      leapTimer: 0,
      leapDuration: 0,
      modelScale: 1.0,
      deathImmuneTimer: 0,
      eggFormTimer: 0,
      blindedTimer: 0,
      wallPhaseTimer: 0,
      carDriveTimer: 0,
      beatrixGunIdx: 0,
      julianCastCount: 0,
      carmillaLinkIds: [],
      carmillaLinkTimer: 0,
      harleyRingTimer: 0,
      harleyRingDamage: 0,
      harleyRingCasterId: null,
      glooAttachTargetId: null,
      glooAttachTimer: 0,
      kaditaHealBank: 0,
      kaditaHealTimer: 0,
      fredrinnGreyHp: 0,
      toggleAuraTimer: 0,
      toggleAuraKind: null,
      snapbackAnchor: null,
      hiraraPrisms: [],
      tauntTargetId: null,
      physAtk: 240,
      magicPow: 340,
      physDef: 80,
      magicDef: 65,
      flatPhysPen: 15,
      pctPhysPen: 0.2,
      flatMagicPen: 15,
      pctMagicPen: 0.2,
      atkSpd: 1.5,
      critChance: 0.25,
      critDmgPct: 2.0,
      cdrPct: 0.2,
      moveSpd: 315,
      lifestealPct: 0.1,
      spellVampPct: 0.1,
      ccResPct: 0,
      hpRegen: 8,
      damageDealt: 0,
      damageTaken: 0,
      turretDamage: 0,
      recentDamagers: {},
      aiState: 'lane',
      aiTimer: 0,
      aiTargetX: x,
      aiTargetY: y,
      turretHitsOnMe: 0,
      turretHitResetTimer: 0,
      damageLog: [],
      ccLog: [],
      lastDeathRecap: null,
      potionBuffTimer: 0,
      potionBuffKind: null
    };
  };

  let globalRevealCalls = 0;
  let kajaSuppressionSeen = false;
  let minsittharGroundedSeen = false;
  const tempWalls: Array<{ id: string; x: number; y: number; w: number; h: number; color: string; ttl: number; maxTtl: number; ownerId: string }> = [];

  const callbacks: SimCallbacks = {
    dealDamageToHero: (_att, tgt, raw) => {
      tgt.hp = Math.max(100, tgt.hp - Math.round(raw * 0.25));
      return Math.round(raw * 0.25);
    },
    dealDamageToMinion: () => 0,
    dealDamageToJungle: () => 0,
    dealDamageToTurret: () => 0,
    applyCc: (tgt, ccType, dur) => {
      tgt.ccType = ccType;
      tgt.ccTimer = dur;
      if (ccType === 'suppression') kajaSuppressionSeen = true;
      if (ccType === 'grounded') minsittharGroundedSeen = true;
    },
    spawnVfx: () => {},
    spawnProjectile: () => {},
    healHero: (tgt, amt) => {
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + Math.round(amt));
    },
    grantShield: (tgt, amt) => {
      tgt.shield += Math.round(amt);
    },
    announce: () => {},
    triggerGlobalReveal: () => {
      globalRevealCalls++;
    },
    triggerGlobalBlind: () => {},
    spawnTempWall: (wall) => {
      tempWalls.push(wall);
    }
  };

  // Every single one of the 67 K-Z heroes must cast S1, S2, S3 and step passives cleanly
  for (const hid of PART5_HERO_IDS_K_TO_Z) {
    const caster = makeHero(hid, 'p1', 'blue', 1950, 2000);
    const ally = makeHero('layla', 'a1', 'blue', 1880, 2020);
    const enemy = makeHero('miya', 'e1', 'red', 2100, 2000);
    const ctx: SkillCastContext = {
      heroes: [caster, ally, enemy],
      minions: [],
      turrets: [],
      jungleMobs: [],
      callbacks,
      matchTimeSec: 180,
      noCooldown: true,
      tempWalls
    };
    for (const slot of [1, 2, 3] as const) {
      caster.skillCds = [0, 0, 0];
      caster.mana = caster.maxMana;
      caster.ccType = null;
      const ok = castHeroSkill(caster, slot, 0, 150, ctx);
      assert.equal(ok, true, `Part 5 Hero ${hid} slot ${slot} must cast cleanly`);
    }
    stepPart5HeroPassives(caster, 0.12, [caster, ally, enemy], callbacks, tempWalls);
  }

  assert.equal(kajaSuppressionSeen, true, 'Kaja Ultimate Divine Judgment must apply un-purifiable Suppression');
  assert.equal(minsittharGroundedSeen, true, 'Minsitthar Ultimate King\'s Calling must apply Grounded CC');
  assert.ok(globalRevealCalls >= 2, 'Yi Sun-shin, Novaria, Zetian, and Aldous/Mathilda kits must trigger global reveal');

  // 3. Signature Spot-Checks: Yu Zhong Black Dragon 1.42x, Ling Wall Perch, Lylia 4s Rewind, Masha 3-HP-Bar Cleanse, Valentina Ult Steal
  const yz = makeHero('yu_zhong', 'p1', 'blue', 2000, 2000);
  const foe = makeHero('tigreal', 'e1', 'red', 2140, 2000);
  const yzCtx: SkillCastContext = { heroes: [yz, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 200, noCooldown: true, tempWalls };
  castHeroSkill(yz, 3, 0, 140, yzCtx);
  stepPart5HeroPassives(yz, 0.1, [yz, foe], callbacks, tempWalls);
  assert.ok(yz.modelScale >= 1.4, 'Yu Zhong Black Dragon Form must scale model to 1.42x');
  assert.equal(getHeroCcBadge(yz)?.text, 'BLACK DRAGON');

  const ling = makeHero('ling', 'p1', 'blue', 2000, 2000);
  castHeroSkill(ling, 1, 0, 240, { heroes: [ling, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 200, noCooldown: true, tempWalls });
  assert.ok((ling.lingWallTimer ?? 0) > 0, 'Ling S1 Finch Poise must perch on walls');
  assert.equal(getHeroCcBadge(ling)?.text, 'WALL PERCH');

  const lylia = makeHero('lylia', 'p1', 'blue', 2000, 2000);
  lylia.lyliaTrail = [{ x: 1600, y: 1650, hp: 2800, mana: 900 }];
  lylia.hp = 600;
  castHeroSkill(lylia, 3, 0, 0, { heroes: [lylia, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 200, noCooldown: true, tempWalls });
  assert.equal(lylia.x, 1600, 'Lylia Ult Black Shoes must rewind position to 4s trail');
  assert.ok(lylia.hp >= 2800, 'Lylia Ult Black Shoes must restore HP from 4s trail');

  const masha = makeHero('masha', 'p1', 'blue', 2000, 2000);
  masha.mashaBars = 3;
  masha.hp = Math.round(masha.maxHp * 0.18);
  masha.ccType = 'stun';
  masha.ccTimer = 1.5;
  masha.skillCds[2] = 20;
  stepPart5HeroPassives(masha, 0.1, [masha, foe], callbacks, tempWalls);
  assert.equal(masha.mashaBars, 2, 'Masha losing an HP bar must decrement mashaBars');
  assert.equal(masha.ccType, null, 'Masha HP bar break must cleanse non-suppression CC');
  assert.equal(masha.skillCds[2], 0, 'Masha HP bar break must reset Thunderclap Ultimate cooldown');

  const valentina = makeHero('valentina', 'p1', 'blue', 2000, 2000);
  castHeroSkill(valentina, 3, 0, 140, { heroes: [valentina, foe], minions: [], turrets: [], jungleMobs: [], callbacks, matchTimeSec: 200, noCooldown: true, tempWalls });
  assert.equal(valentina.valentinaStolenHeroId, 'tigreal', 'Valentina I Am You must steal nearest enemy hero Ultimate');
});

test('MLBB Part 6: 3-Tier Crafting Tree, 50% Anti-Heal, 7 Lv.60 Emblems & 27 Talents, Pro Builds, EquipmentCombatEngine Passives & All 12 Battle Spells', () => {
  // 1. All 103 items present + 50% Anti-Heal wording parity on Sea Halberd, Glowing Wand, Dominance Ice
  assert.equal(MLBB_ITEMS.length, 103);
  for (const id of ['sea_halberd', 'glowing_wand', 'dominance_ice']) {
    const item = getMlbbItemById(id);
    assert.ok(item?.antiHeal, `${id} must have antiHeal flag`);
    assert.ok(item?.passiveDesc?.includes('50%'), `${id} passiveDesc must specify 50% anti-heal`);
  }

  // 2. Visual 3-Tier Crafting Tree + Automatic Component Gold Credit + Bargain Hunter 5% discount
  const bodTreeFull = getItemCraftingTree('blade_of_despair', [], 0);
  assert.ok(bodTreeFull && bodTreeFull.children.length === 3);
  assert.equal(bodTreeFull.effectiveCost, 3010);
  const bodTreePartial = getItemCraftingTree('blade_of_despair', ['legion_sword'], 0.05);
  assert.ok(bodTreePartial);
  assert.equal(bodTreePartial.children[0].owned, true, 'First Legion Sword must be marked owned');
  assert.equal(bodTreePartial.children[1].owned, false, 'Second Legion Sword must remain unowned');
  assert.equal(bodTreePartial.effectiveCost, Math.round((3010 - 910) * 0.95));

  // 3. 7 Emblems (Lv.60 Max) + 27 Distinct Talents (separate War Cry & Temporal Reign) + Stat Preview
  assert.equal(MLBB_EMBLEMS.length, 7);
  assert.equal(MLBB_TALENTS.length, 27);
  assert.ok(MLBB_TALENTS.some((t) => t.id === 'war_cry' && t.tier === 3));
  assert.ok(MLBB_TALENTS.some((t) => t.id === 'temporal_reign' && t.tier === 3));
  const previewStats = aggregateEmblemAndTalentPreviewStats('assassin', { t1: 'thrill', t2: 'bargain_hunter', t3: 'war_cry' });
  assert.ok(previewStats.some((s) => s.label === 'Adaptive ATK' && s.value === '+26'));

  // 4. Pro Build Templates for all 6 hero roles (valid 6-item sets)
  for (const heroId of ['eudora', 'layla', 'fanny', 'tigreal', 'angela', 'balmond']) {
    const templates = getProBuildTemplatesForHero(getMlbbHeroById(heroId));
    assert.equal(templates.length, 3);
    for (const tpl of templates) {
      assert.equal(tpl.items.length, 6);
      for (const iid of tpl.items) {
        assert.ok(getMlbbItemById(iid), `Pro build item ${iid} for ${heroId} must exist`);
      }
    }
  }

  // Helper SimHero builder for live Part 6 combat engine tests
  const makeHero = (heroId: string, id: string, team: 'blue' | 'red', x: number, y: number): SimHero => {
    const heroDef = getMlbbHeroById(heroId);
    return {
      id, name: heroDef.name, team, heroDef,
      skinColor: heroDef.primaryColor, skinAccent: heroDef.accentColor,
      lane: heroDef.lane, role: heroDef.role, isPlayer: id === 'p1',
      x, y, vx: 0, vy: 0, facing: 0, radius: 28,
      level: 15, xp: 0, xpToNext: 1000, skillPoints: 0,
      skillLevels: [6, 6, 3], skillCds: [10, 10, 40],
      spellId: 'flicker', spellCd: 0, emblemId: 'assassin',
      talents: { t1: 'thrill', t2: 'weapon_master', t3: 'war_cry' },
      hp: 4000, maxHp: 4000, hpTrail: 4000, shield: 0, mana: 1500, maxMana: 1500,
      gold: 10000, totalGold: 10000, kills: 0, deaths: 0, assists: 0, streak: 0, multiKill: 0, multiKillTimer: 0,
      alive: true, respawnTimer: 0, atkCd: 0, hitFlashTimer: 0, inBush: false, revealedTimer: 0,
      spottedByEnemy: false, recentlyAttackedTimer: 0, recalling: false, recallTimer: 0, recallCd: 0,
      regenCd: 0, regenTimer: 0, activeItemCd: 0, emoteCd: 0, activeEmote: null,
      items: [], blessingId: null, prioritizedItemId: null, activeBuildIdx: 0, buildPlan: [],
      junglerStacks: 5, roamGold: 0, isJungler: false, isRoamer: false,
      ccType: null, ccTimer: 0, ccPriority: 0, ccImmuneTimer: 0, untargetableTimer: 0, physImmuneTimer: 0,
      stealthTimer: 0, speedBoostPct: 0, speedBoostTimer: 0, slowPct: 0, slowTimer: 0,
      antiHealTimer: 0, defShredFlat: 0, defShredTimer: 0,
      passiveStacks: 0, passiveTimer: 0, passiveCd: 0, immortalityCd: 0,
      markedTimer: 0, markedBy: null, recastSlot: null, recastTimer: 0,
      attachedAllyId: null, attachedTimer: 0, tetherTargetId: null, tetherTimer: 0, tetherKind: null,
      orbitBlades: 0, orbitTimer: 0,
      orangeBuffTimer: 0, purpleBuffTimer: 0, turtleBuffTimer: 0, turtleKillerBuffTimer: 0,
      turtleShieldRefreshAccum: 0, goldCrabBuffTimer: 0, goldCrabTickAccum: 0, evolvedLordAuraTimer: 0,
      bushParticleAccum: 0, justRespawnedCloudReady: false,
      windChantTimer: 0, winterCrownTimer: 0, vengeanceTimer: 0, inspireTimer: 0, outOfCombatTimer: 6,
      castWindup: 0, castBackswing: 0, castColor: '#fff',
      dashVx: 0, dashVy: 0, dashTimer: 0, dashWallCross: false,
      leapZ: 0, leapTimer: 0, leapDuration: 0, modelScale: 1,
      deathImmuneTimer: 0, eggFormTimer: 0, blindedTimer: 0, wallPhaseTimer: 0, carDriveTimer: 0,
      beatrixGunIdx: 0, julianCastCount: 0, carmillaLinkIds: [], carmillaLinkTimer: 0,
      harleyRingTimer: 0, harleyRingDamage: 0, harleyRingCasterId: null,
      glooAttachTargetId: null, glooAttachTimer: 0, kaditaHealBank: 0, kaditaHealTimer: 0,
      fredrinnGreyHp: 0, toggleAuraTimer: 0, toggleAuraKind: null, snapbackAnchor: null,
      hiraraPrisms: [], tauntTargetId: null,
      physAtk: 300, magicPow: 400, physDef: 80, magicDef: 80,
      flatPhysPen: 15, pctPhysPen: 0, flatMagicPen: 10, pctMagicPen: 0,
      atkSpd: 1.5, critChance: 0.4, critDmgPct: 2.0, cdrPct: 0.2, moveSpd: 260,
      lifestealPct: 0.1, spellVampPct: 0.1, ccResPct: 0, hpRegen: 20,
      damageDealt: 0, damageTaken: 0, turretDamage: 0, recentDamagers: {},
      aiState: 'fight', aiTimer: 0, aiTargetX: x, aiTargetY: y,
      turretHitsOnMe: 0, turretHitResetTimer: 0, damageLog: [], ccLog: [], lastDeathRecap: null,
      potionBuffTimer: 0, potionBuffKind: null
    };
  };

  const cb: SimCallbacks = {
    dealDamageToHero: (_a, t, d) => { t.hp = Math.max(0, t.hp - Math.round(d)); },
    dealDamageToMinion: () => {},
    dealDamageToJungle: () => {},
    dealDamageToTurret: () => {},
    applyCc: (t, cc, dur) => { t.ccType = cc; t.ccTimer = dur; },
    spawnVfx: () => {},
    spawnProjectile: () => {},
    healHero: (t, amt) => { t.hp = Math.min(t.maxHp, t.hp + Math.round(amt)); },
    grantShield: (t, amt) => { t.shield += Math.round(amt); },
    announce: () => {},
    triggerGlobalReveal: () => {},
    triggerGlobalBlind: () => {},
    spawnTempWall: () => {}
  };

  // 5. Malefic Gun (+12% Range), Holy Crystal (+35% Lv.15 MagPow), Golden Staff (Crit -> AtkSpd), Thunder Belt (+1 Permanent DEF)
  const mm = makeHero('layla', 'p1', 'blue', 1000, 1000);
  const baseRange = getEffectiveAttackRange(mm);
  mm.items = ['malefic_gun', 'holy_crystal', 'golden_staff', 'thunder_belt'];
  assert.equal(getEffectiveAttackRange(mm), Math.round(baseRange * 1.12));

  const tank = makeHero('tigreal', 'e1', 'red', 1120, 1000);
  const offRes = computeOffensiveItemAndTalentMods(mm, tank, 300, 'physical', true, false, [mm, tank], cb);
  assert.ok(offRes.bonusTrueDmg > 0, 'Thunder Belt must deal bonus True Damage on basic attack');
  assert.equal(ensureEquipState(mm).thunderBeltStacks, 1, 'Thunder Belt must permanently gain +1 Hybrid DEF stack');

  const prevMag = mm.magicPow;
  const prevAs = mm.atkSpd;
  applyEquipmentAndTalentStatMods(mm, 100, 200, [mm, tank], true);
  assert.ok(mm.magicPow > prevMag * 1.3, 'Holy Crystal + Weapon Master must significantly boost Magic Power');
  assert.equal(mm.critChance, 0, 'Golden Staff must convert Crit Chance to Attack Speed');
  assert.ok(mm.atkSpd > prevAs, 'Golden Staff must raise Attack Speed from converted Crit Chance');

  // 6. Wishing Lantern (Butterfly every 800 Magic Dmg), Sky Piercer (4%-12% Execute), Athena's Shield (25% Magic DR), Twilight Armor Cap
  const mage = makeHero('eudora', 'p2', 'blue', 1000, 1000);
  mage.items = ['wishing_lantern', 'sky_piercer', 'fleeting_time'];
  const butterfly = applyPostHitOffensiveTriggers(mage, tank, 850, 'magic', cb);
  assert.ok(butterfly >= 60, 'Wishing Lantern must summon Butterfly dealing 8% current HP at 800 Magic Damage');

  onHeroKillOrAssistEquipHooks(mage, true, cb); // +10 Sky Piercer stacks, -30% Ult CD via Fleeting Time
  assert.equal(ensureEquipState(mage).skyPiercerStacks, 10);
  assert.equal(mage.skillCds[2], 28, 'Fleeting Time must refund 30% of current Ultimate cooldown');

  tank.hp = Math.round(tank.maxHp * 0.045); // 4.5% HP -> below 5% threshold with 10 stacks!
  assert.equal(checkSkyPiercerExecute(mage, tank, cb), true, 'Sky Piercer must execute target below scaled threshold');

  const defTank = makeHero('tigreal', 'e2', 'red', 1200, 1000);
  defTank.items = ['athenas_shield', 'twilight_armor', 'oracle'];
  const athenaMit = applyDefensiveItemAndTalentMitigation(mage, defTank, 1000, 'magic', false, false, cb);
  assert.ok(athenaMit < 750, 'Athena Shield (-25% Magic) + Twilight Armor burst cap must heavily reduce 1000 Magic burst');
  assert.ok(computeHealOrShieldAmpMultiplier(defTank, true) >= 1.3, 'Oracle must boost heals/shields by +30%');

  // 7. Flask of the Oasis clutch shield (<35% HP) + Temporal Reign (1.5x non-Ult CD) + Pull Yourself Together (-15% Spell CD) + Seasoned Hunter (+15% Jungle)
  const supp = makeHero('estes', 'a1', 'blue', 1040, 1000);
  supp.items = ['flask_of_the_oasis'];
  const lowAlly = makeHero('layla', 'a2', 'blue', 1080, 1000);
  lowAlly.hp = Math.round(lowAlly.maxHp * 0.25);
  triggerSupportHealOrShieldHooks(supp, lowAlly, [supp, lowAlly], cb);
  assert.ok(lowAlly.shield >= 680, 'Flask of the Oasis must grant massive shield when healing <35% HP ally');

  supp.talents = { t1: 'inspire_t1', t2: 'pull_yourself_together', t3: 'temporal_reign' };
  assert.equal(getSpellOrActiveCdMultiplier(supp), 0.85, 'Pull Yourself Together must reduce spell/active CD by 15%');
  onHeroSkillCastEquipHooks(supp, 3);
  assert.equal(ensureEquipState(supp).temporalReignTimer, 4.0);
  const s1Before = supp.skillCds[0];
  stepEquipmentAndTalentTimers(supp, 1.0, [supp, lowAlly], [], [], cb);
  assert.equal(supp.skillCds[0], s1Before - 0.5, 'Temporal Reign must accelerate non-Ult CDs by extra 0.5x');

  const jg = makeHero('fanny', 'j1', 'blue', 1000, 1000);
  jg.talents.t2 = 'seasoned_hunter';
  assert.equal(getJungleDamageMultiplier(jg), 1.15, 'Seasoned Hunter must grant +15% objective/creep damage');

  // 8. All 12 Battle Spells execute cleanly (including Aegis ally shield, Revitalize 4s spring, Flame/Bloody/Ice Retribution, Vengeance 35% DR)
  assert.equal(MLBB_BATTLE_SPELLS.length, 12);
  for (const sp of MLBB_BATTLE_SPELLS) {
    const caster = makeHero('eudora', 'sp1', 'blue', 1000, 1000);
    const ally = makeHero('layla', 'sp_ally', 'blue', 1080, 1000);
    ally.hp = 1200;
    const foe = makeHero('miya', 'sp_foe', 'red', 1120, 1000);
    caster.spellId = sp.id;
    caster.spellCd = 0;
    caster.blessingId = sp.id === 'retribution' ? 'flame_retribution' : null;
    caster.talents.t2 = 'pull_yourself_together';
    const ok = castBattleSpell(caster, 0, {
      heroes: [caster, ally, foe],
      minions: [{ id: 'm1', team: 'blue', lane: 'mid', kind: 'melee', x: 2400, y: 2400, hp: 500, maxHp: 500, atk: 20, range: 60, atkCd: 0, speed: 120, radius: 18, waypointIdx: 0, alive: true, gold: 40, exp: 40, hitFlashTimer: 0 }],
      turrets: [],
      jungleMobs: [],
      callbacks: cb,
      matchTimeSec: 120,
      noCooldown: false
    });
    assert.equal(ok, true, `Battle Spell ${sp.id} must execute cleanly`);
    if (sp.id === 'aegis') assert.ok(ally.shield > 0, 'Aegis must grant 50% shield to lowest-HP nearby ally');
    if (sp.id === 'revitalize') assert.equal(ensureEquipState(caster).revitalizeZoneTimer, 4.0, 'Revitalize must spawn 4s Healing Spring');
    if (sp.id === 'inspire') assert.equal(ensureEquipState(caster).inspireAttacksLeft, 8, 'Inspire must arm 8 empowered attacks');
    if (sp.id === 'flicker') assert.ok(ensureEquipState(caster).flickerDefTimer > 0, 'Flicker must grant brief Hybrid Defense');
    if (sp.id === 'retribution') assert.ok(ensureEquipState(caster).flameRetriBonusAtk > 0, 'Flame Retribution must steal Adaptive Attack');
  }
});







