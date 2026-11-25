// ============================================================================
// NBA 2K14 — Persistent Save Manager, Defaults, Locker Codes & Payout Logic
// ============================================================================

import { ALL_HOT_ZONE_IDS, LOCKER_CODES, PATH_TO_GREATNESS_CHAPTERS } from './data/modesData';
import { ALL_TEAMS, NBA_TEAMS, buildAttributesForPlayer, getAllPlayers, getTeamById } from './data/rosters';
import type {
  AssociationState,
  GameplaySliders,
  HotZoneId,
  HotZoneRecord,
  MatchResultSummary,
  MyCareerState,
  MyPlayerPlayStyle,
  MyTeamCard,
  MyTeamState,
  Nba2k14SaveData,
  Nba2k14Settings,
  PlayoffSeries,
  PlayoffsState,
  Position,
  VipProfileData,
} from './types';

export const NBA2K14_STORAGE_KEY = 'nba2k14_save_v1';

export function createDefaultSliders(preset: 'Default' | 'Simulation' | 'Arcade' = 'Default'): GameplaySliders {
  const base = preset === 'Arcade' ? 62 : preset === 'Simulation' ? 47 : 50;
  return {
    insideShot: base,
    closeShot: base,
    midRange: base,
    threePt: preset === 'Arcade' ? 64 : base,
    layup: base + 2,
    dunkInTraffic: preset === 'Arcade' ? 68 : base,
    passAccuracy: base + 4,
    alleyOop: preset === 'Arcade' ? 66 : base,
    contactShot: base,
    drivingContactFreq: preset === 'Simulation' ? 56 : 50,
    insideContactFreq: preset === 'Simulation' ? 56 : 50,
    stealSuccess: base,
    blockSuccess: base + 2,
    defAwareness: preset === 'Simulation' ? 56 : base,
    onBallDefense: preset === 'Simulation' ? 55 : base,
    acceleration: preset === 'Arcade' ? 60 : 50,
    vertical: preset === 'Arcade' ? 62 : 50,
    strength: 50,
    stamina: preset === 'Arcade' ? 65 : 50,
    speed: preset === 'Arcade' ? 60 : 50,
    hustle: 52,
    ballHandling: preset === 'Arcade' ? 62 : 50,
    hands: 54,
    offRebounding: 50,
    defRebounding: 52,
  };
}

export function createDefaultSettings(): Nba2k14Settings {
  return {
    game: {
      difficulty: 'All-Star',
      quarterLengthMin: 5,
      gameStyle: 'Default',
      gameSpeed: 50,
      shotTiming: 'User Timing',
      freeThrowTiming: 'User Timing',
      fatigue: true,
      injuries: false,
      clutchFactor: true,
    },
    rules: {
      outOfBounds: true,
      backcourtViolation: true,
      eightSecondViolation: true,
      shotClock24: true,
      threeSecondKey: false,
      goaltending: true,
      shootingFouls: true,
      reachInFouls: true,
      chargingFouls: true,
    },
    controller: {
      proStickFunction: 'Default',
      proStickOrientation: 'Camera Relative',
      shotMeterDisplay: 'On (Floor Ring)',
      shotFeedback: true,
      defensiveAssist: 50,
      boxoutAssist: 50,
      virtualGamepad: 'Auto',
    },
    keybinds: {
      moveUp: 'KeyW',
      moveDown: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      sprint: 'ShiftLeft',
      shoot: 'Space',
      pass: 'KeyE',
      postUp: 'KeyF',
      pickAndRoll: 'KeyV',
      intenseD: 'KeyC',
      handsUp: 'KeyU',
      iconPass: 'KeyR',
      playCall: 'KeyQ',
      flashyPass: 'KeyZ',
      timeout: 'KeyT',
      proStickUp: 'KeyI',
      proStickDown: 'KeyK',
      proStickLeft: 'KeyJ',
      proStickRight: 'KeyL',
    },
    camera: {
      angle: '2K',
      zoom: 5,
      height: 5,
      keyZoom: true,
      autoFlip: true,
      dunkShake: true,
    },
    presentation: {
      scoreboardDisplay: true,
      playerIndicatorStyle: 'Full 2K14 Ring',
      actionReplays: 'Occasionally',
    },
    audio: {
      master: 80,
      beats: 62,
      crowd: 75,
      sfx: 85,
      commentary: 75,
      muted: false,
    },
    coach: {
      adaptiveEngine: true,
      substitutions: 'Auto (Fatigue)',
      timeouts: 'Manual',
      offensivePlaycalling: 'Auto',
      playVision: 'Full',
      playArtMessages: true,
    },
    slidersUser: createDefaultSliders('Default'),
    slidersCpu: createDefaultSliders('Default'),
    graphics: {
      renderQuality: 'High',
      courtReflections: true,
      crowdDetail: 'High',
      fpsCounter: false,
    },
    jukeboxDisabledTrackIds: [],
  };
}

export function createEmptyHotZones(): Record<HotZoneId, HotZoneRecord> {
  const out = {} as Record<HotZoneId, HotZoneRecord>;
  for (const id of ALL_HOT_ZONE_IDS) {
    out[id] = { made: 0, att: 0 };
  }
  return out;
}

export function createDefaultVip(): VipProfileData {
  return {
    name: 'KING_2K14',
    avatarCrest: 'MIA',
    favTeamId: 'mia',
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestWinStreak: 0,
    totalPoints: 0,
    totalReb: 0,
    totalAst: 0,
    totalStl: 0,
    totalBlk: 0,
    totalTo: 0,
    insideMade: 0,
    insideAtt: 0,
    midMade: 0,
    midAtt: 0,
    threeMade: 0,
    threeAtt: 0,
    fastbreakPts: 0,
    paintPts: 0,
    excellentReleases: 0,
    totalShots: 0,
    gradeSum: 0,
    vc: 5000,
    sp: 2500,
    mt: 2000,
    parkRep: 150,
    parkWins: 0,
    parkLosses: 0,
    parkStreak: 0,
    hotZones: createEmptyHotZones(),
    unlockedAchievements: [],
    redeemedCodes: [],
  };
}

export function buildMyPlayerFromSpec(
  name: string,
  jersey: number,
  pos: Position,
  playStyle: MyPlayerPlayStyle,
  heightCm: number,
  weightLbs: number,
  skinTone: string,
  hairStyle: 'short' | 'fade' | 'afro' | 'bald' | 'mohawk' | 'dreads',
  headband: boolean,
  armSleeve: boolean,
  legSleeve: boolean,
  shoeColor: string,
  teamId = 'mia'
): MyCareerState['player'] {
  const styleSkillsMap: Record<MyPlayerPlayStyle, MyCareerState['player']['signatureSkills']> = {
    Athletic: [{ id: 'posterizer', level: 1 }, { id: 'one_man_fastbreak', level: 1 }],
    Scoring: [{ id: 'shot_creator', level: 1 }, { id: 'microwave', level: 1 }],
    '3PT Specialist': [{ id: 'catch_and_shoot', level: 1 }, { id: 'corner_specialist', level: 1 }],
    'All-Around': [{ id: 'finisher', level: 1 }, { id: 'dimer', level: 1 }],
    'Pass First': [{ id: 'dimer', level: 1 }, { id: 'floor_general', level: 1 }],
    Defensive: [{ id: 'lockdown_defender', level: 1 }, { id: 'pick_pocket', level: 1 }],
    Post: [{ id: 'post_proficiency', level: 1 }, { id: 'brick_wall', level: 1 }],
    Rebounding: [{ id: 'tenacious_rebounder', level: 1 }, { id: 'hustle_points', level: 1 }],
  };
  const sigSkills = styleSkillsMap[playStyle];
  const attrs = buildAttributesForPlayer(name, pos, 68, sigSkills.map((s) => s.id));
  if (playStyle === '3PT Specialist') attrs.threePt = 82;
  if (playStyle === 'Athletic') {
    attrs.dunk = 84;
    attrs.vertical = 86;
    attrs.speed = 84;
  }
  if (playStyle === 'Defensive') {
    attrs.onBallDefense = 84;
    attrs.steal = 80;
  }
  if (playStyle === 'Pass First') {
    attrs.passAccuracy = 84;
    attrs.ballHandle = 82;
  }
  return {
    id: 'myplayer_user',
    name: name.trim() || 'MP Prodigy',
    pos,
    jersey,
    ovr: 68,
    heightCm,
    weightLbs,
    skinTone,
    hairStyle,
    hairColor: '#14110f',
    headband,
    armSleeve,
    legSleeve,
    shoeColor,
    attrs,
    signatureSkills: sigSkills,
    hotZones: {},
    releaseSpeed: 0.64,
    isStarter: true,
    teamId,
    jumpShotForm: 'LeBron James',
    dunkPackage: 'Athletic One-Handers',
    dribbleStyle: 'Kyrie Irving Iso',
  };
}

export function createDefaultMyCareer(): MyCareerState {
  return {
    created: false,
    drafted: false,
    draftPick: 0,
    teamId: 'mia',
    playStyle: 'All-Around',
    player: buildMyPlayerFromSpec('Freq 2K14', 6, 'SF', 'All-Around', 201, 222, '#7b4d31', 'fade', true, true, false, '#CE1141'),
    seasonGameIndex: 0,
    wins: 0,
    losses: 0,
    fans: 12500,
    chemistry: 72,
    drillsCompleted: [],
    gameLogs: [],
    socialFeed: [
      { id: 'sf1', handle: '@NBA2KInsider', text: 'Scouts are buzzing ahead of the 2014 Rookie Showcase tonight.', time: '1h ago' },
      { id: 'sf2', handle: '@KingJames', text: 'Stay locked in. Earn your minutes on both ends of the floor. #StriveForGreatness', time: '3h ago' },
    ],
  };
}

export function createDefaultAssociation(userTeamId = 'mia', seasonLength: 14 | 29 | 82 = 29): AssociationState {
  const standings: AssociationState['standings'] = {};
  for (const t of NBA_TEAMS) {
    standings[t.id] = { teamId: t.id, wins: 0, losses: 0, chemistry: 78 };
  }
  const team = getTeamById(userTeamId);
  const rotationMinutes: Record<string, number> = {};
  team.players.forEach((p, idx) => {
    rotationMinutes[p.id] = idx < 5 ? 34 : idx < 8 ? 18 : 8;
  });
  const freeAgents = [
    buildMyPlayerFromSpec('Allen Iverson (FA)', 3, 'PG', 'Scoring', 183, 165, '#7b4d31', 'dreads', true, true, false, '#ffffff', 'fa'),
    buildMyPlayerFromSpec('Tracy McGrady (FA)', 1, 'SG', 'Scoring', 203, 210, '#6d4329', 'bald', false, true, true, '#CE1141', 'fa'),
    buildMyPlayerFromSpec('Lamar Odom (FA)', 7, 'PF', 'All-Around', 208, 230, '#6d4329', 'short', false, false, false, '#FDB927', 'fa'),
    buildMyPlayerFromSpec('Kenyon Martin (FA)', 4, 'PF', 'Defensive', 206, 234, '#6d4329', 'bald', true, true, false, '#006BB6', 'fa'),
  ].map((p, idx) => ({ ...p, id: `fa_2k14_${idx}`, ovr: 79 - idx * 2 }));

  return {
    active: false,
    userTeamId,
    seasonLength,
    currentDay: 1,
    standings,
    rotationMinutes,
    ownerGoal: 'Win 60%+ of regular season games and reach the Conference Finals.',
    ownerTrust: 75,
    freeAgents,
    tradeHistory: [],
  };
}

export function createDefaultPlayoffs(userTeamId = 'mia', bestOf: 1 | 3 | 5 | 7 = 3): PlayoffsState {
  const east = NBA_TEAMS.filter((t) => t.conference === 'EAST')
    .sort((a, b) => b.ovr - a.ovr)
    .slice(0, 8);
  const west = NBA_TEAMS.filter((t) => t.conference === 'WEST')
    .sort((a, b) => b.ovr - a.ovr)
    .slice(0, 8);
  const pairs: [number, number][] = [
    [0, 7],
    [3, 4],
    [2, 5],
    [1, 6],
  ];
  const series: PlayoffSeries[] = [];
  pairs.forEach(([hi, lo], idx) => {
    series.push({
      id: `e_r1_${idx}`,
      round: 1,
      conference: 'EAST',
      higherSeedId: east[hi].id,
      lowerSeedId: east[lo].id,
      higherWins: 0,
      lowerWins: 0,
      winnerId: null,
    });
    series.push({
      id: `w_r1_${idx}`,
      round: 1,
      conference: 'WEST',
      higherSeedId: west[hi].id,
      lowerSeedId: west[lo].id,
      higherWins: 0,
      lowerWins: 0,
      winnerId: null,
    });
  });
  return {
    active: false,
    bestOf,
    userTeamId,
    series,
  };
}

export function createMyTeamCardFromPlayer(player: MyTeamCard['player'], tier: MyTeamCard['tier']): MyTeamCard {
  const team = getTeamById(player.teamId);
  return {
    id: `mtc_${tier.toLowerCase()}_${player.id}_${Math.floor(Math.random() * 10000)}`,
    player: { ...player },
    tier,
    teamCode: team.code,
  };
}

export function createDefaultMyTeam(): MyTeamState {
  return {
    starterOpened: false,
    collection: [],
    lineupCardIds: [],
    rttpSeed: 8,
    rttpWins: 0,
    dominationStars: {},
  };
}

export function createDefaultSaveData(): Nba2k14SaveData {
  return {
    version: 1,
    lastMode: 'quick',
    vip: createDefaultVip(),
    settings: createDefaultSettings(),
    myCareer: createDefaultMyCareer(),
    pathToGreatness: {
      selectedPath: 'heat_dynasty',
      completedStars: {},
    },
    association: createDefaultAssociation(),
    playoffs: createDefaultPlayoffs(),
    myTeam: createDefaultMyTeam(),
    customPlayers: [],
    rosterOverrides: {},
    teamTransfers: {},
  };
}

export function loadNba2k14Save(): Nba2k14SaveData {
  const fallback = createDefaultSaveData();
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(NBA2K14_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Nba2k14SaveData>;
    return {
      ...fallback,
      ...parsed,
      vip: {
        ...fallback.vip,
        ...(parsed.vip ?? {}),
        hotZones: { ...fallback.vip.hotZones, ...(parsed.vip?.hotZones ?? {}) },
      },
      settings: {
        ...fallback.settings,
        ...(parsed.settings ?? {}),
        game: { ...fallback.settings.game, ...(parsed.settings?.game ?? {}) },
        rules: { ...fallback.settings.rules, ...(parsed.settings?.rules ?? {}) },
        controller: { ...fallback.settings.controller, ...(parsed.settings?.controller ?? {}) },
        keybinds: { ...fallback.settings.keybinds, ...(parsed.settings?.keybinds ?? {}) },
        camera: { ...fallback.settings.camera, ...(parsed.settings?.camera ?? {}) },
        presentation: { ...fallback.settings.presentation, ...(parsed.settings?.presentation ?? {}) },
        audio: { ...fallback.settings.audio, ...(parsed.settings?.audio ?? {}) },
        coach: { ...fallback.settings.coach, ...(parsed.settings?.coach ?? {}) },
        slidersUser: { ...fallback.settings.slidersUser, ...(parsed.settings?.slidersUser ?? {}) },
        slidersCpu: { ...fallback.settings.slidersCpu, ...(parsed.settings?.slidersCpu ?? {}) },
        graphics: { ...fallback.settings.graphics, ...(parsed.settings?.graphics ?? {}) },
      },
      myCareer: { ...fallback.myCareer, ...(parsed.myCareer ?? {}) },
      pathToGreatness: { ...fallback.pathToGreatness, ...(parsed.pathToGreatness ?? {}) },
      association: { ...fallback.association, ...(parsed.association ?? {}) },
      playoffs: { ...fallback.playoffs, ...(parsed.playoffs ?? {}) },
      myTeam: { ...fallback.myTeam, ...(parsed.myTeam ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function persistNba2k14Save(save: Nba2k14SaveData): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(NBA2K14_STORAGE_KEY, JSON.stringify(save));
    }
  } catch {
    // ignore storage quota failures
  }
}

export function getResolvedTeams(save: Nba2k14SaveData) {
  const customByTeam = new Map<string, typeof save.customPlayers>();
  for (const cp of save.customPlayers) {
    const arr = customByTeam.get(cp.teamId) ?? [];
    arr.push(cp);
    customByTeam.set(cp.teamId, arr);
  }
  const allBasePlayers = getAllPlayers();
  return ALL_TEAMS.map((team) => {
    const players = allBasePlayers
      .filter((p) => (save.teamTransfers[p.id] ?? p.teamId) === team.id)
      .map((p) => {
        const ov = save.rosterOverrides[p.id];
        return ov ? { ...p, ...ov, attrs: { ...p.attrs, ...(ov.attrs ?? {}) } } : p;
      });
    const added = customByTeam.get(team.id) ?? [];
    return {
      ...team,
      players: [...players, ...added],
    };
  });
}

export function redeemLockerCode(
  save: Nba2k14SaveData,
  inputCode: string
): { ok: boolean; message: string; nextSave: Nba2k14SaveData } {
  const code = inputCode.trim().toUpperCase();
  const def = LOCKER_CODES.find((c) => c.code === code);
  if (!def) {
    return { ok: false, message: 'Invalid Locker Code. Try KINGJAMES, 2K14LEGEND, or BLACKTOP21.', nextSave: save };
  }
  if (save.vip.redeemedCodes.includes(code)) {
    return { ok: false, message: `Locker Code ${code} has already been redeemed on this VIP Profile.`, nextSave: save };
  }
  const nextCollection = [...save.myTeam.collection];
  if (def.bonusCardPlayerName && def.bonusTier) {
    const found = getAllPlayers().find((p) => p.name === def.bonusCardPlayerName);
    if (found) {
      nextCollection.push(createMyTeamCardFromPlayer(found, def.bonusTier));
    }
  }
  const unlocked = new Set(save.vip.unlockedAchievements);
  unlocked.add('locker_hunter');
  const nextSave: Nba2k14SaveData = {
    ...save,
    vip: {
      ...save.vip,
      vc: save.vip.vc + def.vc,
      sp: save.vip.sp + def.sp,
      mt: save.vip.mt + def.mt,
      parkRep: save.vip.parkRep + (code === 'BLACKTOP21' ? 500 : 0),
      redeemedCodes: [...save.vip.redeemedCodes, code],
      unlockedAchievements: Array.from(unlocked),
    },
    myTeam: {
      ...save.myTeam,
      collection: nextCollection,
    },
  };
  return { ok: true, message: `Redeemed ${code}: ${def.label}`, nextSave };
}

export function gradeToNumeric(grade: string): number {
  const map: Record<string, number> = {
    F: 0,
    'D-': 1,
    D: 1.5,
    'D+': 2,
    'C-': 2.5,
    C: 3,
    'C+': 3.5,
    'B-': 4,
    B: 4.5,
    'B+': 5,
    'A-': 5.5,
    A: 6,
    'A+': 6.5,
  };
  return map[grade] ?? 3;
}

export function applyMatchResultToSave(
  save: Nba2k14SaveData,
  summary: MatchResultSummary
): { nextSave: Nba2k14SaveData; newlyUnlocked: string[] } {
  const nextVip: VipProfileData = {
    ...save.vip,
    hotZones: { ...save.vip.hotZones },
    unlockedAchievements: [...save.vip.unlockedAchievements],
  };

  const userTeamPlayers = summary.boxScore.filter((s) => s.teamSide === summary.config.userSide);
  const userPts = summary.config.userSide === 'home' ? summary.homeScore : summary.awayScore;
  const oppPts = summary.config.userSide === 'home' ? summary.awayScore : summary.homeScore;
  const teamReb = userTeamPlayers.reduce((a, b) => a + b.reb, 0);
  const teamAst = userTeamPlayers.reduce((a, b) => a + b.ast, 0);
  const teamStl = userTeamPlayers.reduce((a, b) => a + b.stl, 0);
  const teamBlk = userTeamPlayers.reduce((a, b) => a + b.blk, 0);
  const teamTo = userTeamPlayers.reduce((a, b) => a + b.to, 0);
  const team3pm = userTeamPlayers.reduce((a, b) => a + b.tpm, 0);

  nextVip.gamesPlayed += 1;
  if (summary.userWon) {
    nextVip.wins += 1;
    nextVip.winStreak += 1;
    nextVip.bestWinStreak = Math.max(nextVip.bestWinStreak, nextVip.winStreak);
  } else {
    nextVip.losses += 1;
    nextVip.winStreak = 0;
  }
  nextVip.totalPoints += userPts;
  nextVip.totalReb += teamReb;
  nextVip.totalAst += teamAst;
  nextVip.totalStl += teamStl;
  nextVip.totalBlk += teamBlk;
  nextVip.totalTo += teamTo;
  nextVip.gradeSum += gradeToNumeric(summary.teammateGrade);
  nextVip.vc += summary.vcEarned;
  nextVip.sp += summary.spEarned;
  nextVip.mt += summary.mtEarned;

  if (summary.config.mode === 'park') {
    nextVip.parkRep += summary.repEarned;
    if (summary.userWon) {
      nextVip.parkWins += 1;
      nextVip.parkStreak += 1;
    } else {
      nextVip.parkLosses += 1;
      nextVip.parkStreak = 0;
    }
  }

  let excCount = 0;
  for (const shot of summary.userShotLog) {
    const cur = nextVip.hotZones[shot.zone] ?? { made: 0, att: 0 };
    nextVip.hotZones[shot.zone] = {
      made: cur.made + (shot.made ? 1 : 0),
      att: cur.att + 1,
    };
    nextVip.totalShots += 1;
    if (shot.excellent) {
      nextVip.excellentReleases += 1;
      excCount += 1;
    }
    if (shot.pts === 3) {
      nextVip.threeAtt += 1;
      if (shot.made) nextVip.threeMade += 1;
    } else if (shot.paint) {
      nextVip.insideAtt += 1;
      if (shot.made) {
        nextVip.insideMade += 1;
        nextVip.paintPts += shot.pts;
      }
    } else {
      nextVip.midAtt += 1;
      if (shot.made) nextVip.midMade += 1;
    }
    if (shot.fastbreak && shot.made) {
      nextVip.fastbreakPts += shot.pts;
    }
  }

  // Evaluate Achievements
  const unlocked = new Set(nextVip.unlockedAchievements);
  const newlyUnlocked: string[] = [];
  const grant = (id: string) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
    }
  };

  if (summary.userWon) grant('first_win');
  if (summary.userWon && Math.abs(userPts - oppPts) <= 3) grant('buzzer_beater');
  if (userPts >= 40) grant('ten_zero_run');
  if (team3pm >= 5 || (summary.shootoutScore ?? 0) >= 18) grant('downtown_king');
  if (teamStl >= 5) grant('lockdown_5_steals');
  if (teamBlk >= 4) grant('rim_protector');
  if (excCount >= 5) grant('green_machine');
  if ((summary.dunkContestScore ?? 0) >= 45 || nextVip.paintPts >= 20) grant('posterizer_dunk');
  if (userTeamPlayers.some((p) => p.pts >= 20)) grant('twenty_pts');
  if (
    userTeamPlayers.some((p) => {
      const cats = [p.pts, p.reb, p.ast, p.stl, p.blk].filter((v) => v >= 10).length;
      return cats >= 3;
    })
  ) {
    grant('triple_double');
  }
  if (
    userTeamPlayers.some((p) => {
      const cats = [p.pts, p.reb, p.ast, p.stl, p.blk].filter((v) => v >= 10).length;
      return cats >= 2;
    })
  ) {
    grant('double_double');
  }
  if (summary.config.mode === 'park' && summary.config.playersPerSide === 5 && summary.userWon) grant('king_of_court');
  if (nextVip.parkStreak >= 3) grant('park_streak_3');
  if (nextVip.winStreak >= 5) grant('win_streak_5');
  if (summary.config.mode === 'training') grant('training_grad');
  if (summary.pathStarsEarned === 3) grant('ptg_gold');
  if (summary.config.mode === 'mycareer' && (summary.teammateGrade === 'A' || summary.teammateGrade === 'A+')) {
    grant('mycareer_a_plus');
  }
  const homeTeam = getTeamById(summary.config.homeTeamId);
  const awayTeam = getTeamById(summary.config.awayTeamId);
  if (summary.userWon && (homeTeam.league === 'EUROLEAGUE' || awayTeam.league === 'EUROLEAGUE')) grant('euro_champ');
  if (summary.userWon && (homeTeam.league === 'CLASSIC' || awayTeam.league === 'CLASSIC')) grant('classic_legend');

  nextVip.unlockedAchievements = Array.from(unlocked);

  // Path to Greatness progression
  const nextPath = { ...save.pathToGreatness, completedStars: { ...save.pathToGreatness.completedStars } };
  if (summary.config.mode === 'path' && summary.config.pathChapterId && summary.userWon) {
    const ch = PATH_TO_GREATNESS_CHAPTERS.find((c) => c.id === summary.config.pathChapterId);
    const lbj = userTeamPlayers.find((p) => p.name.includes('LeBron'));
    const margin = userPts - oppPts;
    let stars: 1 | 2 | 3 = 1;
    if (ch) {
      if ((lbj?.pts ?? 0) >= ch.objectives.lebronPtsTarget && margin >= ch.objectives.winMarginTarget) {
        stars = 3;
      } else if ((lbj?.pts ?? 0) >= Math.max(8, ch.objectives.lebronPtsTarget - 4)) {
        stars = 2;
      }
    }
    const prev = nextPath.completedStars[summary.config.pathChapterId] ?? 0;
    nextPath.completedStars[summary.config.pathChapterId] = Math.max(prev, stars) as 1 | 2 | 3;
  }

  // MyCAREER progression
  let nextMyCareer = save.myCareer;
  if (summary.config.mode === 'rookie_showcase') {
    const gradeScore = gradeToNumeric(summary.teammateGrade);
    const pick = Math.max(1, Math.min(30, Math.round(24 - gradeScore * 3.2 - (summary.userWon ? 4 : 0))));
    const draftedTeam = NBA_TEAMS[(pick - 1) % NBA_TEAMS.length];
    unlocked.add('mycareer_draft');
    nextVip.unlockedAchievements = Array.from(unlocked);
    nextMyCareer = {
      ...save.myCareer,
      drafted: true,
      draftPick: pick,
      teamId: draftedTeam.id,
      player: { ...save.myCareer.player, teamId: draftedTeam.id },
      socialFeed: [
        {
          id: `draft_${Date.now()}`,
          handle: '@NBADraft2014',
          text: `With the #${pick} pick, the ${draftedTeam.fullName} select ${save.myCareer.player.name}!`,
          time: 'Just now',
        },
        ...save.myCareer.socialFeed,
      ],
    };
  } else if (summary.config.mode === 'mycareer') {
    const mp = userTeamPlayers.find((p) => p.playerId === save.myCareer.player.id) ?? userTeamPlayers[0];
    const oppTeam = getTeamById(
      summary.config.userSide === 'home' ? summary.config.awayTeamId : summary.config.homeTeamId
    );
    nextMyCareer = {
      ...save.myCareer,
      seasonGameIndex: save.myCareer.seasonGameIndex + 1,
      wins: save.myCareer.wins + (summary.userWon ? 1 : 0),
      losses: save.myCareer.losses + (summary.userWon ? 0 : 1),
      fans: save.myCareer.fans + (summary.userWon ? 4500 : 1500) + (mp?.pts ?? 0) * 180,
      chemistry: Math.min(100, Math.max(20, save.myCareer.chemistry + (summary.userWon ? 4 : -2))),
      gameLogs: [
        {
          gameNum: save.myCareer.seasonGameIndex + 1,
          opponentCode: oppTeam.code,
          won: summary.userWon,
          teamScore: userPts,
          oppScore: oppPts,
          pts: mp?.pts ?? 0,
          reb: mp?.reb ?? 0,
          ast: mp?.ast ?? 0,
          stl: mp?.stl ?? 0,
          blk: mp?.blk ?? 0,
          grade: summary.teammateGrade,
        },
        ...save.myCareer.gameLogs,
      ].slice(0, 30),
      socialFeed: [
        {
          id: `g_${Date.now()}`,
          handle: `@${oppTeam.code}Beat`,
          text: `${save.myCareer.player.name} dropped ${mp?.pts ?? 0} PTS / ${mp?.ast ?? 0} AST (${summary.teammateGrade}) ${summary.userWon ? 'in a huge win' : 'in a hard-fought battle'} vs ${oppTeam.name}!`,
          time: 'Just now',
        },
        ...save.myCareer.socialFeed,
      ].slice(0, 12),
    };
  }

  // MyTEAM Domination & RTTP updates
  let nextMyTeam = save.myTeam;
  if (summary.config.mode === 'myteam' && summary.userWon) {
    if (summary.config.myTeamDominationTeamId) {
      const stars: 1 | 2 | 3 = userPts - oppPts >= 10 ? 3 : userPts - oppPts >= 5 ? 2 : 1;
      const prev = save.myTeam.dominationStars[summary.config.myTeamDominationTeamId] ?? 0;
      if (stars === 3) {
        unlocked.add('myteam_dom');
        nextVip.unlockedAchievements = Array.from(unlocked);
      }
      nextMyTeam = {
        ...save.myTeam,
        dominationStars: {
          ...save.myTeam.dominationStars,
          [summary.config.myTeamDominationTeamId]: Math.max(prev, stars) as 1 | 2 | 3,
        },
      };
    } else {
      const wins = save.myTeam.rttpWins + 1;
      nextMyTeam = {
        ...save.myTeam,
        rttpWins: wins,
        rttpSeed: Math.max(1, 8 - Math.floor(wins / 2)),
      };
    }
  }

  const nextSave: Nba2k14SaveData = {
    ...save,
    lastMode:
      summary.config.mode === 'mycareer'
        ? 'mycareer'
        : summary.config.mode === 'path'
          ? 'path'
          : summary.config.mode === 'association'
            ? 'association'
            : save.lastMode,
    vip: nextVip,
    pathToGreatness: nextPath,
    myCareer: nextMyCareer,
    myTeam: nextMyTeam,
  };
  return { nextSave, newlyUnlocked };
}
