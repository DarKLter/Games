import { useEffect, useState } from 'react';
import type {
  AchievementId,
  ActiveMatchConfig,
  ActiveScreen,
  ChallengeItem,
  CustomHudLayoutMap,
  GameplaySliderKey,
  GameplaySliderSet,
  HudPresetId,
  KeybindActionId,
  KeybindMap,
  SettingsState,
  ShotChartEntry,
  ShotMeterStyleId,
  SliderPresetId,
  UIEraMode,
  UltimateHybridSave,
} from './types';

export const ACHIEVEMENT_CATALOG: Array<{
  id: AchievementId;
  title: string;
  description: string;
  eraTag: '2K14' | '2K26' | 'HYBRID';
}> = [
  {
    id: 'DROP_40_PTS',
    title: '40-Point Masterpiece',
    description: 'Drop 40+ points with a single player in any 3D game.',
    eraTag: 'HYBRID',
  },
  {
    id: 'FIVE_GREEN_THREES',
    title: '5 Green 3s in a Game',
    description: 'Splash 5 or more Excellent-Release three-pointers in one matchup.',
    eraTag: '2K26',
  },
  {
    id: 'WIN_PATH_TO_GREATNESS',
    title: 'King of Miami',
    description: 'Complete a LeBron Path to Greatness scenario victory.',
    eraTag: '2K14',
  },
  {
    id: 'BEAT_STREET_KING',
    title: 'Street Kings Slayer',
    description: 'Defeat a Street Kings Court Boss in The City.',
    eraTag: '2K26',
  },
  {
    id: 'BREAK_PARK_STREAK',
    title: 'Streak Breaker',
    description: 'Win a Blacktop or Park showdown to extend or break a hot streak.',
    eraTag: '2K26',
  },
  {
    id: 'DUAL_ERA_CHAMPION',
    title: 'Dual-Era Legend',
    description: 'Win matches across both 2K14 Classic and 2K26 Next-Gen presentations.',
    eraTag: 'HYBRID',
  },
  {
    id: 'MYTEAM_COLLECTOR',
    title: 'Holographic Dynasty',
    description: 'Collect 10+ MyTEAM cards across NBA & WNBA eras.',
    eraTag: '2K26',
  },
  {
    id: 'TRAINING_GOLD',
    title: 'Gym Rat Gold',
    description: 'Earn a Gold Medal in a Training Camp skill drill.',
    eraTag: '2K14',
  },
];

export const DEFAULT_KEYBINDS: KeybindMap = {
  shoot: 'Space',
  pass: 'KeyJ',
  bouncePass: 'KeyK',
  dribble: 'KeyE',
  screen: 'KeyL',
  alleyOop: 'KeyO',
  iconPass: 'KeyI',
  takeover: 'KeyT',
  sprint: 'ShiftLeft',
  steal: 'KeyJ',
  block: 'Space',
  switchDef: 'KeyK',
  handsUp: 'KeyU',
  camera: 'KeyC',
  pause: 'Escape',
};

export const GAMEPLAY_SLIDER_META: Array<{
  key: GameplaySliderKey;
  label: string;
  group: 'OFFENSE' | 'DEFENSE' | 'ATHLETICISM & RULES';
}> = [
  { key: 'insideShot', label: 'Inside Shot Success', group: 'OFFENSE' },
  { key: 'closeShot', label: 'Close Shot Success', group: 'OFFENSE' },
  { key: 'midRange', label: 'Mid-Range Success', group: 'OFFENSE' },
  { key: 'threePt', label: '3PT Success', group: 'OFFENSE' },
  { key: 'layup', label: 'Layup Success', group: 'OFFENSE' },
  { key: 'dunkInTraffic', label: 'Dunk in Traffic', group: 'OFFENSE' },
  { key: 'shotContestImpact', label: 'Shot Contest Impact', group: 'DEFENSE' },
  { key: 'blockFrequency', label: 'Block Frequency', group: 'DEFENSE' },
  { key: 'stealSuccess', label: 'Steal Success', group: 'DEFENSE' },
  { key: 'offReb', label: 'Offensive Rebound', group: 'DEFENSE' },
  { key: 'defReb', label: 'Defensive Rebound', group: 'DEFENSE' },
  { key: 'helpDefense', label: 'Help Defense Strength', group: 'DEFENSE' },
  { key: 'ballSecurity', label: 'Ball Security', group: 'ATHLETICISM & RULES' },
  { key: 'gameSpeed', label: 'Game Speed', group: 'ATHLETICISM & RULES' },
  { key: 'foulFrequency', label: 'Foul Frequency', group: 'ATHLETICISM & RULES' },
];

export function createBalancedSliders(): GameplaySliderSet {
  return {
    insideShot: 50,
    closeShot: 50,
    midRange: 50,
    threePt: 50,
    layup: 50,
    dunkInTraffic: 50,
    shotContestImpact: 50,
    blockFrequency: 50,
    stealSuccess: 50,
    offReb: 50,
    defReb: 50,
    ballSecurity: 50,
    helpDefense: 50,
    gameSpeed: 50,
    foulFrequency: 50,
  };
}

export const GAMEPLAY_SLIDER_PRESETS: Record<
  Exclude<SliderPresetId, 'CUSTOM'>,
  { label: string; desc: string; user: GameplaySliderSet; cpu: GameplaySliderSet }
> = {
  HYBRID_PRO_BALANCED: {
    label: 'Hybrid Pro Balanced (50/50)',
    desc: 'Authentic 50/50 balanced simulation tuning combining 2K14 flow with 2K26 skill windows.',
    user: createBalancedSliders(),
    cpu: createBalancedSliders(),
  },
  '2K26_COMP': {
    label: '2K26 Comp',
    desc: 'Competitive timing discipline with sharp shot contests, clean steals, and high-IQ help defense.',
    user: {
      insideShot: 49,
      closeShot: 50,
      midRange: 51,
      threePt: 50,
      layup: 49,
      dunkInTraffic: 48,
      shotContestImpact: 58,
      blockFrequency: 52,
      stealSuccess: 54,
      offReb: 50,
      defReb: 54,
      ballSecurity: 52,
      helpDefense: 56,
      gameSpeed: 52,
      foulFrequency: 50,
    },
    cpu: {
      insideShot: 49,
      closeShot: 50,
      midRange: 51,
      threePt: 50,
      layup: 49,
      dunkInTraffic: 48,
      shotContestImpact: 58,
      blockFrequency: 52,
      stealSuccess: 54,
      offReb: 50,
      defReb: 54,
      ballSecurity: 52,
      helpDefense: 56,
      gameSpeed: 52,
      foulFrequency: 50,
    },
  },
  '2K14_CLASSIC_SIM': {
    label: '2K14 Classic Sim',
    desc: 'Gritty simulation percentages, stronger interior defense, and realistic fouls.',
    user: {
      insideShot: 46,
      closeShot: 47,
      midRange: 48,
      threePt: 45,
      layup: 48,
      dunkInTraffic: 42,
      shotContestImpact: 64,
      blockFrequency: 56,
      stealSuccess: 44,
      offReb: 46,
      defReb: 58,
      ballSecurity: 52,
      helpDefense: 62,
      gameSpeed: 47,
      foulFrequency: 60,
    },
    cpu: {
      insideShot: 46,
      closeShot: 47,
      midRange: 48,
      threePt: 45,
      layup: 48,
      dunkInTraffic: 44,
      shotContestImpact: 64,
      blockFrequency: 56,
      stealSuccess: 46,
      offReb: 48,
      defReb: 58,
      ballSecurity: 54,
      helpDefense: 64,
      gameSpeed: 47,
      foulFrequency: 60,
    },
  },
  ARCADE_HIGH_SCORING: {
    label: 'Arcade High-Scoring',
    desc: 'Explosive dunks, deep-range splashes, faster pace, and fewer whistle stoppages.',
    user: {
      insideShot: 68,
      closeShot: 66,
      midRange: 65,
      threePt: 66,
      layup: 68,
      dunkInTraffic: 78,
      shotContestImpact: 36,
      blockFrequency: 64,
      stealSuccess: 60,
      offReb: 58,
      defReb: 52,
      ballSecurity: 64,
      helpDefense: 40,
      gameSpeed: 64,
      foulFrequency: 32,
    },
    cpu: {
      insideShot: 58,
      closeShot: 56,
      midRange: 56,
      threePt: 58,
      layup: 58,
      dunkInTraffic: 66,
      shotContestImpact: 38,
      blockFrequency: 52,
      stealSuccess: 46,
      offReb: 52,
      defReb: 50,
      ballSecurity: 56,
      helpDefense: 42,
      gameSpeed: 64,
      foulFrequency: 32,
    },
  },
};

export function createDefaultCustomHudLayout(): CustomHudLayoutMap {
  return {
    left_stick: { x: 0, y: 0, scale: 1, opacity: 0.92 },
    shoot_pad: { x: 0, y: 0, scale: 1, opacity: 0.95 },
    pass_btn: { x: 0, y: 0, scale: 1, opacity: 0.92 },
    dribble_btn: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    screen_btn: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    icon_btn: { x: 0, y: 0, scale: 1, opacity: 0.88 },
    oop_btn: { x: 0, y: 0, scale: 1, opacity: 0.92 },
    takeover_btn: { x: 0, y: 0, scale: 1, opacity: 0.96 },
    block_btn: { x: 0, y: 0, scale: 1, opacity: 0.95 },
    steal_btn: { x: 0, y: 0, scale: 1, opacity: 0.92 },
    switch_btn: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    intense_btn: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    handsup_btn: { x: 0, y: 0, scale: 1, opacity: 0.9 },
    tactics_btn: { x: 0, y: 0, scale: 1, opacity: 0.94 },
    radar_panel: { x: 0, y: 0, scale: 1, opacity: 0.94 },
  };
}

export function createPresetCustomHudLayout(preset: HudPresetId): CustomHudLayoutMap {
  const base = createDefaultCustomHudLayout();
  if (preset === 'CLASSIC_2K') {
    return base;
  }
  if (preset === 'CLAW_PRO') {
    return {
      ...base,
      left_stick: { x: 12, y: -16, scale: 1.08, opacity: 0.94 },
      shoot_pad: { x: -16, y: -22, scale: 1.15, opacity: 0.96 },
      pass_btn: { x: -26, y: -12, scale: 1.05, opacity: 0.94 },
      dribble_btn: { x: -10, y: -38, scale: 1.04, opacity: 0.92 },
      screen_btn: { x: -34, y: -62, scale: 0.95, opacity: 0.88 },
      icon_btn: { x: -24, y: -74, scale: 0.95, opacity: 0.9 },
      oop_btn: { x: -6, y: -74, scale: 0.98, opacity: 0.94 },
      takeover_btn: { x: -14, y: -96, scale: 1.08, opacity: 0.98 },
      block_btn: { x: -16, y: -22, scale: 1.15, opacity: 0.96 },
      steal_btn: { x: -26, y: -12, scale: 1.05, opacity: 0.94 },
      switch_btn: { x: -10, y: -38, scale: 1.04, opacity: 0.92 },
      intense_btn: { x: -28, y: -56, scale: 0.96, opacity: 0.9 },
      tactics_btn: { x: 18, y: 4, scale: 0.95, opacity: 0.92 },
      radar_panel: { x: 0, y: -10, scale: 0.96, opacity: 0.92 },
    };
  }
  // COMPACT_ONE_HAND
  return {
    ...base,
    left_stick: { x: 8, y: 8, scale: 0.88, opacity: 0.86 },
    shoot_pad: { x: 10, y: 8, scale: 0.88, opacity: 0.9 },
    pass_btn: { x: 18, y: 10, scale: 0.84, opacity: 0.86 },
    dribble_btn: { x: 14, y: 12, scale: 0.82, opacity: 0.84 },
    screen_btn: { x: 16, y: 14, scale: 0.78, opacity: 0.82 },
    icon_btn: { x: 16, y: 16, scale: 0.78, opacity: 0.82 },
    oop_btn: { x: 12, y: 16, scale: 0.8, opacity: 0.86 },
    takeover_btn: { x: 12, y: 12, scale: 0.86, opacity: 0.92 },
    block_btn: { x: 10, y: 8, scale: 0.88, opacity: 0.9 },
    steal_btn: { x: 18, y: 10, scale: 0.84, opacity: 0.86 },
    switch_btn: { x: 14, y: 12, scale: 0.82, opacity: 0.84 },
    intense_btn: { x: 16, y: 14, scale: 0.8, opacity: 0.84 },
    tactics_btn: { x: 0, y: 0, scale: 0.85, opacity: 0.88 },
    radar_panel: { x: 0, y: 6, scale: 0.85, opacity: 0.86 },
  };
}

export const HYBRID_SAVE_KEY = 'nba2k14_2k26_ultimate_save_v1';

export const DEFAULT_TRACK_IDS = [
  'crown_2014',
  'kings_hardwood',
  'skyline_2k26',
  'neon_crossover',
  'chinatown_bounce',
  'clutch_symphony',
];

function createDefaultChallenges(): ChallengeItem[] {
  return [
    {
      id: 'daily_green_3',
      category: 'DAILY',
      title: 'Green Machine Warmup',
      description: 'Drain 3 Excellent-Release jumpers in any 3D matchup.',
      progress: 3,
      target: 3,
      vcReward: 750,
      mtpReward: 350,
      xpReward: 180,
      claimed: false,
    },
    {
      id: 'daily_era_switch',
      category: 'DAILY',
      title: 'Dual-Era Architect',
      description: 'Preview both 2K14 Classic & 2K26 Next-Gen Arena stages.',
      progress: 2,
      target: 2,
      vcReward: 500,
      mtpReward: 250,
      xpReward: 120,
      claimed: false,
    },
    {
      id: 'seasonal_streak',
      category: 'SEASONAL',
      title: 'Season 1: Cross-Era Domination',
      description: 'Win 5 Tip-Off games across 2013-14 & 2025-26 rosters.',
      progress: 5,
      target: 5,
      vcReward: 2500,
      mtpReward: 1500,
      xpReward: 600,
      claimed: false,
    },
    {
      id: 'lifetime_legend',
      category: 'LIFETIME',
      title: 'Path to Greatness Pioneer',
      description: 'Score 500 career points across all Hoops 2K modes.',
      progress: 340,
      target: 500,
      vcReward: 5000,
      mtpReward: 3000,
      xpReward: 1200,
      claimed: false,
    },
  ];
}

function createInitialShotChart(): ShotChartEntry[] {
  const now = Date.now();
  return [
    { id: 'sc_1', x: -22, y: 6, made: true, isThree: true, isGreen: true, era: '2K26_NEXTGEN', timestamp: now - 900000 },
    { id: 'sc_2', x: 22, y: 7, made: true, isThree: true, isGreen: true, era: '2K26_NEXTGEN', timestamp: now - 820000 },
    { id: 'sc_3', x: 0, y: 26, made: true, isThree: true, isGreen: true, era: 'HYBRID_PRO', timestamp: now - 740000 },
    { id: 'sc_4', x: -13, y: 15, made: true, isThree: false, isGreen: false, era: '2K14_CLASSIC', timestamp: now - 680000 },
    { id: 'sc_5', x: 14, y: 14, made: false, isThree: false, isGreen: false, era: '2K14_CLASSIC', timestamp: now - 610000 },
    { id: 'sc_6', x: 2, y: 5, made: true, isThree: false, isGreen: true, era: '2K14_CLASSIC', timestamp: now - 540000 },
    { id: 'sc_7', x: -16, y: 21, made: false, isThree: true, isGreen: false, era: '2K26_NEXTGEN', timestamp: now - 410000 },
    { id: 'sc_8', x: 15, y: 22, made: true, isThree: true, isGreen: true, era: 'HYBRID_PRO', timestamp: now - 250000 },
  ];
}

export function createDefaultUltimateHybridSave(): UltimateHybridSave {
  return {
    version: 1,
    uiEraMode: 'HYBRID_PRO', // User-confirmed default
    activeScreen: 'MAIN_MENU',
    currencies: {
      vc: 25000,
      mtp: 15000,
      seasonXP: 1450,
      seasonLevel: 12,
      repXP: 4200,
      repTier: 'Starter II',
      crewLevel: 8,
      crewName: 'Skyline Dynasty',
      crewTag: '2KHYB',
    },
    profile: {
      username: 'VIP Baller',
      gamertag: 'KING_2K26',
      favoriteTeamId: '2k14_mia',
      geoRank: '#14 Local · Top 2%',
      winStreak: 5,
      bestWinStreak: 11,
      wins: 18,
      losses: 4,
      gamesPlayed: 22,
      careerPoints: 340,
      careerRebounds: 96,
      careerAssists: 112,
      careerSteals: 34,
      careerBlocks: 22,
      careerGreens: 64,
      careerThreesMade: 52,
      careerFgm: 136,
      careerFga: 242,
      careerTpa: 118,
      eraMastery2K14: 68,
      eraMastery2K26: 74,
      unlockedAchievements: ['DUAL_ERA_CHAMPION'],
      shotChartHistory: createInitialShotChart(),
    },
    challenges: createDefaultChallenges(),
    settings: {
      gameplay: {
        difficulty: 'All-Star',
        quarterLengthMin: 5,
        gameSpeed: 50,
        fatigue: true,
        injuries: false,
        shootingModel: 'HYBRID_RHYTHM',
        shotTimingProfile: 'NORMAL',
        visualCue: 'SET_POINT',
        layupTiming: true,
        freeThrowTiming: 'USER_TIMING',
        outOfBounds: true,
        eightSecBackcourt: true,
        shotClock24: true,
        reachInFouls: true,
        paintThreeSecViolation: true,
        blacktopWinByTwo: true,
        blacktopMakeItTakeIt: false,
        blacktopScoring: '1S_2S',
      },
      controller: {
        proStickMode: 'RHYTHM_2K26',
        shotMeterEnabled: true,
        shotMeterStyle: '2K26_ARROW',
        shotMeterColor: 'GREEN',
        rhythmShootingEnabled: true,
        shotFeedbackMode: 'ALL',
        vibrationFeedback: true,
        defensiveAssist: 35,
        boxoutAssist: 50,
        whoToGuardArrow: true,
        iconPassingEnabled: true,
        showVirtualTouchControls: 'AUTO',
        keybinds: { ...DEFAULT_KEYBINDS },
        customHudLayout: createDefaultCustomHudLayout(),
      },
      camera: {
        angle: '2K',
        zoom: 5,
        height: 6,
        autoFlip: true,
        keyZoom: true,
        reverseAngle: false,
        dunkCameraShake: true,
      },
      audio: {
        masterVolume: 82,
        musicVolume: 65,
        sfxVolume: 88,
        crowdVolume: 76,
        commentaryVolume: 80,
        paAnnouncerEnabled: true,
        beatsShuffle: false,
        enabledTrackIds: [...DEFAULT_TRACK_IDS],
      },
      visual: {
        scoreboardEra: 'AUTO',
        scorebugPosition2K26: 'BOTTOM_LEFT',
        showFpsTelemetry: true,
        showShotFeedback: true,
        showPlayerIcons: true,
        cinema3DQuality: 'HIGH',
        graphicsQuality: 'HIGH',
        crowdDensity: 'HIGH',
        hardwoodReflections: true,
        hotColdZones: 'BALL_HANDLER',
        playVision: 'PICK_AND_ROLL',
        playVisionDensity: 'FULL',
      },
      coach: {
        aceAdaptiveCoaching: true,
        autoTimeouts: false,
        autoSubstitutions: true,
        userShotSlider: 50,
        cpuDefenseSlider: 50,
        dunkFrequencySlider: 50,
        sliders: {
          activePreset: 'HYBRID_PRO_BALANCED',
          user: createBalancedSliders(),
          cpu: createBalancedSliders(),
          customPreset: null,
        },
      },
    },
    activeMatchConfig: {
      awayTeamId: '2k14_mia',
      homeTeamId: '2k26_okc',
      awayEraPool: 'NBA_2K14',
      homeEraPool: 'NBA_2K26',
      awayJersey: 'AWAY',
      homeJersey: 'HOME',
      venue: 'ARENA_2K26',
      quarterLengthMin: 5,
      difficulty: 'All-Star',
      sideControl: 'HOME',
      modeLabel: 'Play Now · Cross-Era Tip-Off',
      playersPerSide: 5,
      targetScore: null,
    },
    lastUpdatedMs: Date.now(),
  };
}

function safeReadStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota/sandbox errors
  }
}

const LEGACY_VENUE_MAP: Record<string, ActiveMatchConfig['venue']> = {
  HOME_ARENA: 'ARENA_2K26',
  FINALS_2K14: 'ARENA_2K14',
  SUNSET_PARK: 'SUNSET_BEACH',
  SKYLINE_ROOFTOP: 'SKYLINE_PARK',
  THE_REC: 'RIVET_CITY',
};

const VALID_VENUES = new Set<string>([
  'ARENA_2K26',
  'ARENA_2K14',
  'SKYLINE_PARK',
  'RIVET_CITY',
  'SUNSET_BEACH',
  'OLD_TOWN',
  'BLACKTOP_CAGE',
  'STREET_KINGS',
  'EUROLEAGUE_PALACE',
  'WNBA_ARENA',
]);

function normalizeVenue(v: unknown, fallback: ActiveMatchConfig['venue']): ActiveMatchConfig['venue'] {
  if (typeof v !== 'string') return fallback;
  if (VALID_VENUES.has(v)) return v as ActiveMatchConfig['venue'];
  return LEGACY_VENUE_MAP[v] ?? fallback;
}

const VALID_CAMERA_ANGLES = new Set<string>([
  '2K',
  '2K_LOW',
  'BROADCAST',
  'DRIVE',
  'PLAYER_LOCK',
  'HIGH',
  'NOSEBLEEDS',
]);

const LEGACY_CAMERA_ANGLE_MAP: Record<string, SettingsState['camera']['angle']> = {
  '2K_CAM': '2K',
  BROADCAST_2K14: 'BROADCAST',
  DYNAMIC_2K26: '2K_LOW',
};

function normalizeCameraAngle(
  angle: unknown,
  fallback: SettingsState['camera']['angle']
): SettingsState['camera']['angle'] {
  if (typeof angle !== 'string') return fallback;
  if (VALID_CAMERA_ANGLES.has(angle)) return angle as SettingsState['camera']['angle'];
  return LEGACY_CAMERA_ANGLE_MAP[angle] ?? fallback;
}

const VALID_SHOT_METER_STYLES = new Set<string>([
  '2K26_ARROW',
  '2K14_FLOOR_RING',
  'COMET',
  'VERTICAL_BAR',
  'MINIMAL',
]);

const LEGACY_SHOT_METER_MAP: Record<string, ShotMeterStyleId> = {
  '2K26_CURVED': '2K26_ARROW',
  '2K14_CLASSIC_ARC': '2K14_FLOOR_RING',
  MINIMAL_RING: 'MINIMAL',
};

export function normalizeShotMeterStyle(
  style: unknown,
  fallback: ShotMeterStyleId
): ShotMeterStyleId {
  if (typeof style !== 'string') return fallback;
  if (VALID_SHOT_METER_STYLES.has(style)) return style as ShotMeterStyleId;
  return LEGACY_SHOT_METER_MAP[style] ?? fallback;
}

function normalizeTeamId(id: unknown, fallback: string): string {
  if (typeof id !== 'string' || !id) return fallback;
  if (id === '2k26_okc_4') return '2k26_okc';
  if (id === '2k26_bos_0') return '2k26_bos';
  if (id === '2k26_lal_1') return '2k26_lal';
  if (id === '2k26_gsw_2') return '2k26_gsw';
  if (id === '2k26_den_3') return '2k26_den';
  if (id === '2k26_mil_5') return '2k26_mil';
  if (id === '2k26_nyk_6') return '2k26_nyk';
  if (id === '2k26_sas_7') return '2k26_sas';
  if (id === '2k26_min_8') return '2k26_min';
  if (id === '2k26_mia_9') return '2k26_mia';
  return id;
}

function clampSliderVal(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hydrateSliderSet(raw: unknown, fallback: GameplaySliderSet): GameplaySliderSet {
  if (!raw || typeof raw !== 'object') return { ...fallback };
  const obj = raw as Partial<GameplaySliderSet>;
  return {
    insideShot: clampSliderVal(obj.insideShot, fallback.insideShot),
    closeShot: clampSliderVal(obj.closeShot, fallback.closeShot),
    midRange: clampSliderVal(obj.midRange, fallback.midRange),
    threePt: clampSliderVal(obj.threePt, fallback.threePt),
    layup: clampSliderVal(obj.layup, fallback.layup),
    dunkInTraffic: clampSliderVal(obj.dunkInTraffic, fallback.dunkInTraffic),
    shotContestImpact: clampSliderVal(obj.shotContestImpact, fallback.shotContestImpact),
    blockFrequency: clampSliderVal(obj.blockFrequency, fallback.blockFrequency),
    stealSuccess: clampSliderVal(obj.stealSuccess, fallback.stealSuccess),
    offReb: clampSliderVal(obj.offReb, fallback.offReb),
    defReb: clampSliderVal(obj.defReb, fallback.defReb),
    ballSecurity: clampSliderVal(obj.ballSecurity, fallback.ballSecurity),
    helpDefense: clampSliderVal(obj.helpDefense, fallback.helpDefense),
    gameSpeed: clampSliderVal(obj.gameSpeed, fallback.gameSpeed),
    foulFrequency: clampSliderVal(obj.foulFrequency, fallback.foulFrequency),
  };
}

function deepHydrateSave(raw: unknown): UltimateHybridSave {
  const def = createDefaultUltimateHybridSave();
  if (!raw || typeof raw !== 'object') return def;
  const obj = raw as Partial<UltimateHybridSave>;
  const validEra =
    obj.uiEraMode === '2K14_CLASSIC' ||
    obj.uiEraMode === '2K26_NEXTGEN' ||
    obj.uiEraMode === 'HYBRID_PRO'
      ? obj.uiEraMode
      : def.uiEraMode;

  const mergedMatch = {
    ...def.activeMatchConfig,
    ...(obj.activeMatchConfig ?? {}),
  };

  const rawSliders = obj.settings?.coach?.sliders;
  const hydratedSliders = {
    activePreset: (rawSliders?.activePreset ?? def.settings.coach.sliders.activePreset) as SliderPresetId,
    user: hydrateSliderSet(rawSliders?.user, def.settings.coach.sliders.user),
    cpu: hydrateSliderSet(rawSliders?.cpu, def.settings.coach.sliders.cpu),
    customPreset: rawSliders?.customPreset
      ? {
          user: hydrateSliderSet(rawSliders.customPreset.user, def.settings.coach.sliders.user),
          cpu: hydrateSliderSet(rawSliders.customPreset.cpu, def.settings.coach.sliders.cpu),
        }
      : null,
  };

  const rawProfile: Partial<UltimateHybridSave['profile']> = obj.profile ?? {};
  const wins = typeof rawProfile.wins === 'number' ? rawProfile.wins : def.profile.wins;
  const losses = typeof rawProfile.losses === 'number' ? rawProfile.losses : def.profile.losses;

  return {
    version: 1,
    uiEraMode: validEra,
    activeScreen: 'MAIN_MENU', // Always boot cleanly onto Main Menu
    currencies: { ...def.currencies, ...(obj.currencies ?? {}) },
    profile: {
      ...def.profile,
      ...rawProfile,
      gamesPlayed:
        typeof rawProfile.gamesPlayed === 'number'
          ? Math.max(wins + losses, rawProfile.gamesPlayed)
          : wins + losses,
      unlockedAchievements: Array.isArray(rawProfile.unlockedAchievements)
        ? rawProfile.unlockedAchievements
        : def.profile.unlockedAchievements,
      shotChartHistory: Array.isArray(rawProfile.shotChartHistory)
        ? rawProfile.shotChartHistory.slice(-240)
        : def.profile.shotChartHistory,
    },
    challenges:
      Array.isArray(obj.challenges) && obj.challenges.length > 0
        ? obj.challenges
        : def.challenges,
    settings: {
      gameplay: { ...def.settings.gameplay, ...(obj.settings?.gameplay ?? {}) },
      controller: {
        ...def.settings.controller,
        ...(obj.settings?.controller ?? {}),
        shotMeterStyle: normalizeShotMeterStyle(
          obj.settings?.controller?.shotMeterStyle,
          def.settings.controller.shotMeterStyle
        ),
        keybinds: {
          ...def.settings.controller.keybinds,
          ...(obj.settings?.controller?.keybinds ?? {}),
        },
        customHudLayout: {
          ...def.settings.controller.customHudLayout,
          ...(obj.settings?.controller?.customHudLayout ?? {}),
        },
      },
      camera: {
        ...def.settings.camera,
        ...(obj.settings?.camera ?? {}),
        angle: normalizeCameraAngle(obj.settings?.camera?.angle, def.settings.camera.angle),
      },
      audio: {
        ...def.settings.audio,
        ...(obj.settings?.audio ?? {}),
        enabledTrackIds:
          Array.isArray(obj.settings?.audio?.enabledTrackIds) &&
          obj.settings.audio.enabledTrackIds.length > 0
            ? obj.settings.audio.enabledTrackIds
            : def.settings.audio.enabledTrackIds,
      },
      visual: { ...def.settings.visual, ...(obj.settings?.visual ?? {}) },
      coach: {
        ...def.settings.coach,
        ...(obj.settings?.coach ?? {}),
        sliders: hydratedSliders,
      },
    },
    activeMatchConfig: {
      ...mergedMatch,
      awayTeamId: normalizeTeamId(mergedMatch.awayTeamId, def.activeMatchConfig.awayTeamId),
      homeTeamId: normalizeTeamId(mergedMatch.homeTeamId, def.activeMatchConfig.homeTeamId),
      venue: normalizeVenue(mergedMatch.venue, def.activeMatchConfig.venue),
    },
    lastUpdatedMs: typeof obj.lastUpdatedMs === 'number' ? obj.lastUpdatedMs : Date.now(),
  };
}

let _state: UltimateHybridSave = (() => {
  const rawStr = safeReadStorage(HYBRID_SAVE_KEY);
  if (!rawStr) return createDefaultUltimateHybridSave();
  try {
    return deepHydrateSave(JSON.parse(rawStr));
  } catch {
    return createDefaultUltimateHybridSave();
  }
})();

const _listeners = new Set<(next: UltimateHybridSave) => void>();

function commitState(next: UltimateHybridSave): UltimateHybridSave {
  _state = { ...next, lastUpdatedMs: Date.now() };
  safeWriteStorage(HYBRID_SAVE_KEY, JSON.stringify(_state));
  _listeners.forEach((fn) => fn(_state));
  return _state;
}

export interface CompletedMatchSummaryInput {
  userWon: boolean;
  userTeamPts: number;
  userTeamReb: number;
  userTeamAst: number;
  userTeamStl: number;
  userTeamBlk: number;
  userTeamFgm: number;
  userTeamFga: number;
  userTeamTpm: number;
  userTeamTpa: number;
  greensMade: number;
  greenThreesMade: number;
  topPlayerPts: number;
  teammateGradeScore: number; // 0..100
  isBlacktopOrPark: boolean;
  matchShots: Array<{ x: number; y: number; made: boolean; isThree: boolean; isGreen: boolean }>;
  extraAchievements?: AchievementId[];
}

export interface MatchPayoutBreakdown {
  baseVc: number;
  winBonusVc: number;
  gradeBonusVc: number;
  greenBonusVc: number;
  streakBonusVc: number;
  totalVc: number;
  mtpEarned: number;
  seasonXpEarned: number;
  repXpEarned: number;
  newlyUnlockedAchievements: AchievementId[];
}

export const UltimateHybridStore = {
  getState(): UltimateHybridSave {
    return _state;
  },

  subscribe(listener: (next: UltimateHybridSave) => void): () => void {
    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
    };
  },

  setEraMode(mode: UIEraMode): UltimateHybridSave {
    return commitState({ ..._state, uiEraMode: mode });
  },

  cycleEraMode(): UIEraMode {
    const order: UIEraMode[] = ['HYBRID_PRO', '2K14_CLASSIC', '2K26_NEXTGEN'];
    const idx = order.indexOf(_state.uiEraMode);
    const nextMode = order[(idx + 1) % order.length];
    commitState({ ..._state, uiEraMode: nextMode });
    return nextMode;
  },

  setActiveScreen(screen: ActiveScreen): UltimateHybridSave {
    return commitState({ ..._state, activeScreen: screen });
  },

  updateSettings<K extends keyof SettingsState>(
    section: K,
    patch: Partial<SettingsState[K]>
  ): UltimateHybridSave {
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        [section]: {
          ..._state.settings[section],
          ...patch,
        },
      },
    });
  },

  updateSlider(
    side: 'user' | 'cpu',
    key: GameplaySliderKey,
    value: number
  ): UltimateHybridSave {
    const clamped = clampSliderVal(value, 50);
    const prevSliders = _state.settings.coach.sliders;
    const nextSide = { ...prevSliders[side], [key]: clamped };
    const nextSliders = {
      ...prevSliders,
      activePreset: 'CUSTOM' as SliderPresetId,
      [side]: nextSide,
    };
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        coach: {
          ..._state.settings.coach,
          userShotSlider: nextSliders.user.threePt,
          cpuDefenseSlider: nextSliders.cpu.helpDefense,
          dunkFrequencySlider: nextSliders.user.dunkInTraffic,
          sliders: nextSliders,
        },
      },
    });
  },

  applySliderPreset(presetId: SliderPresetId): UltimateHybridSave {
    const prevSliders = _state.settings.coach.sliders;
    let nextUser: GameplaySliderSet;
    let nextCpu: GameplaySliderSet;
    if (presetId === 'CUSTOM' && prevSliders.customPreset) {
      nextUser = { ...prevSliders.customPreset.user };
      nextCpu = { ...prevSliders.customPreset.cpu };
    } else {
      const defKey = presetId === 'CUSTOM' ? '2K26_COMP' : presetId;
      const preset = GAMEPLAY_SLIDER_PRESETS[defKey];
      nextUser = { ...preset.user };
      nextCpu = { ...preset.cpu };
    }
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        coach: {
          ..._state.settings.coach,
          userShotSlider: nextUser.threePt,
          cpuDefenseSlider: nextCpu.helpDefense,
          dunkFrequencySlider: nextUser.dunkInTraffic,
          sliders: {
            ...prevSliders,
            activePreset: presetId,
            user: nextUser,
            cpu: nextCpu,
          },
        },
      },
    });
  },

  saveCustomSliderPreset(): UltimateHybridSave {
    const prevSliders = _state.settings.coach.sliders;
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        coach: {
          ..._state.settings.coach,
          sliders: {
            ...prevSliders,
            activePreset: 'CUSTOM',
            customPreset: {
              user: { ...prevSliders.user },
              cpu: { ...prevSliders.cpu },
            },
          },
        },
      },
    });
  },

  updateKeybind(action: KeybindActionId, code: string): UltimateHybridSave {
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        controller: {
          ..._state.settings.controller,
          keybinds: {
            ..._state.settings.controller.keybinds,
            [action]: code,
          },
        },
      },
    });
  },

  resetKeybinds(): UltimateHybridSave {
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        controller: {
          ..._state.settings.controller,
          keybinds: { ...DEFAULT_KEYBINDS },
        },
      },
    });
  },

  applyCustomHudPreset(preset: HudPresetId): UltimateHybridSave {
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        controller: {
          ..._state.settings.controller,
          customHudLayout: createPresetCustomHudLayout(preset),
        },
      },
    });
  },

  updateCustomHudLayout(layout: CustomHudLayoutMap): UltimateHybridSave {
    return commitState({
      ..._state,
      settings: {
        ..._state.settings,
        controller: {
          ..._state.settings.controller,
          customHudLayout: { ...layout },
        },
      },
    });
  },

  updateCrewTag(crewTag: string): UltimateHybridSave {
    const clean = crewTag.trim().toUpperCase().slice(0, 6) || '2KHYB';
    return commitState({
      ..._state,
      currencies: {
        ..._state.currencies,
        crewTag: clean,
      },
    });
  },

  updateProfile(patch: Partial<UltimateHybridSave['profile']>): UltimateHybridSave {
    return commitState({
      ..._state,
      profile: {
        ..._state.profile,
        ...patch,
      },
    });
  },

  updateCurrencies(patch: Partial<UltimateHybridSave['currencies']>): UltimateHybridSave {
    return commitState({
      ..._state,
      currencies: {
        ..._state.currencies,
        ...patch,
      },
    });
  },

  updateMatchConfig(patch: Partial<ActiveMatchConfig>): UltimateHybridSave {
    return commitState({
      ..._state,
      activeMatchConfig: {
        ..._state.activeMatchConfig,
        ...patch,
      },
    });
  },

  addCurrency(delta: { vc?: number; mtp?: number; seasonXP?: number; repXP?: number }): UltimateHybridSave {
    const nextSeasonXP = Math.max(0, _state.currencies.seasonXP + (delta.seasonXP ?? 0));
    const nextSeasonLevel = Math.min(40, 1 + Math.floor(nextSeasonXP / 120));
    const nextRepXP = Math.max(0, _state.currencies.repXP + (delta.repXP ?? 0));
    const repTier =
      nextRepXP >= 15000
        ? 'Legend I'
        : nextRepXP >= 9000
          ? 'Veteran II'
          : nextRepXP >= 5000
            ? 'Starter III'
            : nextRepXP >= 3000
              ? 'Starter II'
              : 'Rookie V';

    return commitState({
      ..._state,
      currencies: {
        ..._state.currencies,
        vc: Math.max(0, _state.currencies.vc + (delta.vc ?? 0)),
        mtp: Math.max(0, _state.currencies.mtp + (delta.mtp ?? 0)),
        seasonXP: nextSeasonXP,
        seasonLevel: nextSeasonLevel,
        repXP: nextRepXP,
        repTier,
      },
    });
  },

  unlockAchievement(id: AchievementId): boolean {
    if (_state.profile.unlockedAchievements.includes(id)) return false;
    commitState({
      ..._state,
      profile: {
        ..._state.profile,
        unlockedAchievements: [..._state.profile.unlockedAchievements, id],
      },
    });
    return true;
  },

  commitCompletedMatch(input: CompletedMatchSummaryInput): MatchPayoutBreakdown {
    const baseVc = input.isBlacktopOrPark ? 350 : 650;
    const winBonusVc = input.userWon ? (input.isBlacktopOrPark ? 250 : 450) : 0;
    const gradeBonusVc = Math.round(Math.max(0, input.teammateGradeScore) * 4.5);
    const greenBonusVc = Math.min(450, input.greensMade * 45);
    const nextWinStreak = input.userWon ? _state.profile.winStreak + 1 : 0;
    const streakBonusVc =
      input.userWon && (nextWinStreak >= 3 || input.isBlacktopOrPark)
        ? 150 + Math.min(250, nextWinStreak * 25)
        : 0;
    const totalVc = baseVc + winBonusVc + gradeBonusVc + greenBonusVc + streakBonusVc;
    const mtpEarned = Math.round(totalVc * 0.55);
    const seasonXpEarned = (input.userWon ? 240 : 120) + input.greensMade * 12;
    const repXpEarned = (input.userWon ? 320 : 140) + Math.round(input.teammateGradeScore * 1.6);

    const existingAch = new Set<AchievementId>(_state.profile.unlockedAchievements);
    const newlyUnlocked: AchievementId[] = [];
    const tryUnlock = (id: AchievementId) => {
      if (!existingAch.has(id)) {
        existingAch.add(id);
        newlyUnlocked.push(id);
      }
    };
    if (input.topPlayerPts >= 40) tryUnlock('DROP_40_PTS');
    if (input.greenThreesMade >= 5) tryUnlock('FIVE_GREEN_THREES');
    if (input.userWon && input.isBlacktopOrPark) tryUnlock('BREAK_PARK_STREAK');
    if (input.extraAchievements) {
      input.extraAchievements.forEach(tryUnlock);
    }

    const now = Date.now();
    const addedShots: ShotChartEntry[] = input.matchShots.map((s, idx) => ({
      id: `sc_${now}_${idx}`,
      x: s.x,
      y: s.y,
      made: s.made,
      isThree: s.isThree,
      isGreen: s.isGreen,
      era: _state.uiEraMode,
      timestamp: now,
    }));
    const nextShotHistory = [..._state.profile.shotChartHistory, ...addedShots].slice(-240);

    const nextSeasonXP = _state.currencies.seasonXP + seasonXpEarned;
    const nextRepXP = _state.currencies.repXP + repXpEarned;
    const repTier =
      nextRepXP >= 15000
        ? 'Legend I'
        : nextRepXP >= 9000
          ? 'Veteran II'
          : nextRepXP >= 5000
            ? 'Starter III'
            : nextRepXP >= 3000
              ? 'Starter II'
              : 'Rookie V';

    const nextEra14 =
      _state.uiEraMode === '2K14_CLASSIC'
        ? Math.min(100, _state.profile.eraMastery2K14 + (input.userWon ? 4 : 1))
        : _state.profile.eraMastery2K14;
    const nextEra26 =
      _state.uiEraMode !== '2K14_CLASSIC'
        ? Math.min(100, _state.profile.eraMastery2K26 + (input.userWon ? 4 : 1))
        : _state.profile.eraMastery2K26;

    commitState({
      ..._state,
      currencies: {
        ..._state.currencies,
        vc: _state.currencies.vc + totalVc,
        mtp: _state.currencies.mtp + mtpEarned,
        seasonXP: nextSeasonXP,
        seasonLevel: Math.min(40, 1 + Math.floor(nextSeasonXP / 120)),
        repXP: nextRepXP,
        repTier,
      },
      profile: {
        ..._state.profile,
        gamesPlayed: _state.profile.gamesPlayed + 1,
        wins: _state.profile.wins + (input.userWon ? 1 : 0),
        losses: _state.profile.losses + (input.userWon ? 0 : 1),
        winStreak: nextWinStreak,
        bestWinStreak: Math.max(_state.profile.bestWinStreak, nextWinStreak),
        careerPoints: _state.profile.careerPoints + input.userTeamPts,
        careerRebounds: _state.profile.careerRebounds + input.userTeamReb,
        careerAssists: _state.profile.careerAssists + input.userTeamAst,
        careerSteals: _state.profile.careerSteals + input.userTeamStl,
        careerBlocks: _state.profile.careerBlocks + input.userTeamBlk,
        careerGreens: _state.profile.careerGreens + input.greensMade,
        careerThreesMade: _state.profile.careerThreesMade + input.userTeamTpm,
        careerFgm: _state.profile.careerFgm + input.userTeamFgm,
        careerFga: _state.profile.careerFga + input.userTeamFga,
        careerTpa: _state.profile.careerTpa + input.userTeamTpa,
        eraMastery2K14: nextEra14,
        eraMastery2K26: nextEra26,
        unlockedAchievements: Array.from(existingAch),
        shotChartHistory: nextShotHistory,
      },
    });

    return {
      baseVc,
      winBonusVc,
      gradeBonusVc,
      greenBonusVc,
      streakBonusVc,
      totalVc,
      mtpEarned,
      seasonXpEarned,
      repXpEarned,
      newlyUnlockedAchievements: newlyUnlocked,
    };
  },

  claimChallenge(challengeId: string): { ok: boolean; rewardVc: number; rewardMtp: number } {
    const target = _state.challenges.find((c) => c.id === challengeId);
    if (!target || target.claimed || target.progress < target.target) {
      return { ok: false, rewardVc: 0, rewardMtp: 0 };
    }
    const nextChallenges = _state.challenges.map((c) =>
      c.id === challengeId ? { ...c, claimed: true } : c
    );
    const nextSeasonXP = _state.currencies.seasonXP + target.xpReward;
    commitState({
      ..._state,
      challenges: nextChallenges,
      currencies: {
        ..._state.currencies,
        vc: _state.currencies.vc + target.vcReward,
        mtp: _state.currencies.mtp + target.mtpReward,
        seasonXP: nextSeasonXP,
        seasonLevel: Math.min(40, 1 + Math.floor(nextSeasonXP / 120)),
      },
    });
    return { ok: true, rewardVc: target.vcReward, rewardMtp: target.mtpReward };
  },

  recordShotChart(entry: Omit<ShotChartEntry, 'id' | 'timestamp'>): UltimateHybridSave {
    const item: ShotChartEntry = {
      ...entry,
      id: `sc_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
      timestamp: Date.now(),
    };
    const nextHistory = [..._state.profile.shotChartHistory, item].slice(-240);
    return commitState({
      ..._state,
      profile: {
        ..._state.profile,
        careerPoints: _state.profile.careerPoints + (entry.made ? (entry.isThree ? 3 : 2) : 0),
        careerThreesMade:
          _state.profile.careerThreesMade + (entry.made && entry.isThree ? 1 : 0),
        careerGreens: _state.profile.careerGreens + (entry.made ? 1 : 0),
        careerFgm: _state.profile.careerFgm + (entry.made ? 1 : 0),
        careerFga: _state.profile.careerFga + 1,
        careerTpa: _state.profile.careerTpa + (entry.isThree ? 1 : 0),
        shotChartHistory: nextHistory,
      },
    });
  },

  exportSaveJson(): string {
    return JSON.stringify(_state, null, 2);
  },

  importSaveJson(rawJson: string): { ok: boolean; error?: string } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'Invalid JSON payload.' };
      }
      commitState(deepHydrateSave(parsed));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Malformed JSON string.' };
    }
  },

  resetSave(): UltimateHybridSave {
    return commitState(createDefaultUltimateHybridSave());
  },
};

export function useUltimateHybridStore(): UltimateHybridSave {
  const [snap, setSnap] = useState<UltimateHybridSave>(() => UltimateHybridStore.getState());
  useEffect(() => UltimateHybridStore.subscribe(setSnap), []);
  return snap;
}
