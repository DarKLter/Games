// ============================================================================
// NBA 2K14 + NBA 2K26 ULTIMATE HYBRID — PART 1 CORE TYPES
// ============================================================================

export type UIEraMode = '2K14_CLASSIC' | '2K26_NEXTGEN' | 'HYBRID_PRO';

export type ActiveScreen =
  | 'MAIN_MENU'
  | 'PLAY_NOW_SETUP'
  | 'LIVE_GAME'
  | 'ROSTER_MANAGER'
  | 'CREATE_A_PLAYER'
  | 'MYCAREER_HUB'
  | 'MYPLAYER_BUILDER'
  | 'CITY_EXPLORE'
  | 'PATH_TO_GREATNESS'
  | 'MYTEAM_HUB'
  | 'MYNBA_HUB'
  | 'BLACKTOP_SETUP'
  | 'THE_W_HUB'
  | 'LEARN_2K'
  | 'SETTINGS'
  | 'PROFILE_VIP';

export type EraPoolId =
  | 'NBA_2K14'
  | 'NBA_2K26'
  | 'LEGENDS'
  | 'EUROLEAGUE_14'
  | 'THE_W';

export type JerseyVariant = 'HOME' | 'AWAY' | 'CLASSIC' | 'CITY';

export type MatchVenueId =
  | 'ARENA_2K26'
  | 'ARENA_2K14'
  | 'SKYLINE_PARK'
  | 'RIVET_CITY'
  | 'SUNSET_BEACH'
  | 'OLD_TOWN'
  | 'BLACKTOP_CAGE'
  | 'STREET_KINGS'
  | 'EUROLEAGUE_PALACE'
  | 'WNBA_ARENA';

export type MatchDifficulty =
  | 'Rookie'
  | 'Pro'
  | 'All-Star'
  | 'Superstar'
  | 'Hall of Fame';

export type SideControlMode = 'HOME' | 'AWAY' | 'CPU_VS_CPU';

export interface CurrencyState {
  vc: number;
  mtp: number;
  seasonXP: number;
  seasonLevel: number;
  repXP: number;
  repTier: string;
  crewLevel: number;
  crewName: string;
  crewTag: string;
}

export interface ShotChartEntry {
  id: string;
  x: number; // -25..25 feet from center
  y: number; // 0..42 feet from baseline
  made: boolean;
  isThree: boolean;
  isGreen?: boolean;
  era: UIEraMode;
  timestamp: number;
}

export type AchievementId =
  | 'DROP_40_PTS'
  | 'FIVE_GREEN_THREES'
  | 'WIN_PATH_TO_GREATNESS'
  | 'BEAT_STREET_KING'
  | 'BREAK_PARK_STREAK'
  | 'DUAL_ERA_CHAMPION'
  | 'MYTEAM_COLLECTOR'
  | 'TRAINING_GOLD';

export interface UserProfileState {
  username: string;
  gamertag: string;
  favoriteTeamId: string;
  geoRank: string;
  winStreak: number;
  bestWinStreak: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  careerPoints: number;
  careerRebounds: number;
  careerAssists: number;
  careerSteals: number;
  careerBlocks: number;
  careerGreens: number;
  careerThreesMade: number;
  careerFgm: number;
  careerFga: number;
  careerTpa: number;
  eraMastery2K14: number; // 0..100
  eraMastery2K26: number; // 0..100
  unlockedAchievements: AchievementId[];
  shotChartHistory: ShotChartEntry[];
}

export type ChallengeCategory = 'DAILY' | 'SEASONAL' | 'LIFETIME';

export interface ChallengeItem {
  id: string;
  category: ChallengeCategory;
  title: string;
  description: string;
  progress: number;
  target: number;
  vcReward: number;
  mtpReward: number;
  xpReward: number;
  claimed: boolean;
}

export type SettingsTabId =
  | 'GAMEPLAY'
  | 'CONTROLLER'
  | 'CAMERA'
  | 'AUDIO'
  | 'VISUAL'
  | 'COACH'
  | 'DATA';

export type ShotMeterStyleId =
  | '2K26_ARROW'
  | '2K14_FLOOR_RING'
  | 'COMET'
  | 'VERTICAL_BAR'
  | 'MINIMAL';

export type ShotMeterColorId = 'GREEN' | 'GOLD' | 'CYAN' | 'CRIMSON' | 'TEAM_COLOR';

export type ShotFeedbackModeId = 'ALL' | 'USER_ONLY' | 'OFF';

export type TouchControlsVisibility = 'AUTO' | 'ALWAYS' | 'OFF';

export type HudPresetId = 'CLASSIC_2K' | 'CLAW_PRO' | 'COMPACT_ONE_HAND';

export interface HudControlLayoutRect {
  x: number; // offset px delta
  y: number;
  scale: number; // 0.5..1.5
  opacity: number; // 0.2..1.0
}

export type CustomHudLayoutMap = Record<string, HudControlLayoutRect>;

export type KeybindActionId =
  | 'shoot'
  | 'pass'
  | 'bouncePass'
  | 'dribble'
  | 'screen'
  | 'alleyOop'
  | 'iconPass'
  | 'takeover'
  | 'sprint'
  | 'steal'
  | 'block'
  | 'switchDef'
  | 'handsUp'
  | 'camera'
  | 'pause';

export type KeybindMap = Record<KeybindActionId, string>;

export interface GameplaySliderSet {
  insideShot: number; // 0..100
  closeShot: number;
  midRange: number;
  threePt: number;
  layup: number;
  dunkInTraffic: number;
  shotContestImpact: number;
  blockFrequency: number;
  stealSuccess: number;
  offReb: number;
  defReb: number;
  ballSecurity: number;
  helpDefense: number;
  gameSpeed: number;
  foulFrequency: number;
}

export type GameplaySliderKey = keyof GameplaySliderSet;

export type SliderPresetId =
  | 'HYBRID_PRO_BALANCED'
  | '2K26_COMP'
  | '2K14_CLASSIC_SIM'
  | 'ARCADE_HIGH_SCORING'
  | 'CUSTOM';

export interface GameplaySlidersState {
  activePreset: SliderPresetId;
  user: GameplaySliderSet;
  cpu: GameplaySliderSet;
  customPreset: {
    user: GameplaySliderSet;
    cpu: GameplaySliderSet;
  } | null;
}

export type QuarterLengthOption = 2 | 3 | 5 | 6 | 8 | 10 | 12;

export interface SettingsState {
  gameplay: {
    difficulty: MatchDifficulty;
    quarterLengthMin: QuarterLengthOption;
    gameSpeed: number; // 30..100
    fatigue: boolean;
    injuries: boolean;
    shootingModel: 'TIMING_2K26' | 'REAL_FG_2K14' | 'HYBRID_RHYTHM';
    shotTimingProfile:
      | 'GREEN_OR_MISS'
      | 'HIGH_RISK'
      | 'NORMAL'
      | 'LOW_RISK'
      | 'REAL_PLAYER_PCT';
    visualCue: 'JUMP' | 'SET_POINT' | 'PUSH' | 'RELEASE';
    layupTiming: boolean;
    freeThrowTiming: 'USER_TIMING' | 'REAL_PLAYER_PCT';
    outOfBounds: boolean;
    eightSecBackcourt: boolean;
    shotClock24: boolean;
    reachInFouls: boolean;
    paintThreeSecViolation: boolean;
    blacktopWinByTwo: boolean;
    blacktopMakeItTakeIt: boolean;
    blacktopScoring: '1S_2S' | '2S_3S';
  };
  controller: {
    proStickMode: 'DEFAULT' | 'ISOMOTION_2K14' | 'RHYTHM_2K26';
    shotMeterEnabled: boolean;
    shotMeterStyle: ShotMeterStyleId;
    shotMeterColor: ShotMeterColorId;
    rhythmShootingEnabled: boolean;
    shotFeedbackMode: ShotFeedbackModeId;
    vibrationFeedback: boolean;
    defensiveAssist: number; // 0..100
    boxoutAssist: number; // 0..100
    whoToGuardArrow: boolean;
    iconPassingEnabled: boolean;
    showVirtualTouchControls: TouchControlsVisibility;
    keybinds: KeybindMap;
    customHudLayout: CustomHudLayoutMap;
  };
  camera: {
    angle:
      | '2K'
      | '2K_LOW'
      | 'BROADCAST'
      | 'DRIVE'
      | 'PLAYER_LOCK'
      | 'HIGH'
      | 'NOSEBLEEDS';
    zoom: number; // 1..10
    height: number; // 1..10
    autoFlip: boolean;
    keyZoom: boolean;
    reverseAngle: boolean;
    dunkCameraShake: boolean;
  };
  audio: {
    masterVolume: number; // 0..100
    musicVolume: number; // 0..100
    sfxVolume: number; // 0..100
    crowdVolume: number; // 0..100
    commentaryVolume: number; // 0..100
    paAnnouncerEnabled: boolean;
    beatsShuffle: boolean;
    enabledTrackIds: string[];
  };
  visual: {
    scoreboardEra: 'AUTO' | '2K14_METALLIC' | '2K26_OBSIDIAN';
    scorebugPosition2K26: 'BOTTOM_LEFT' | 'TOP_CENTER' | 'BOTTOM_RIGHT';
    showFpsTelemetry: boolean;
    showShotFeedback: boolean;
    showPlayerIcons: boolean;
    cinema3DQuality: 'HIGH' | 'BALANCED';
    graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
    crowdDensity: 'LOW' | 'MEDIUM' | 'HIGH';
    hardwoodReflections: boolean;
    hotColdZones: 'OFF' | 'BALL_HANDLER' | 'ALL';
    playVision: 'OFF' | 'FIVE_OUT' | 'MOTION_CUT' | 'HORNS' | 'PICK_AND_ROLL' | 'FLOPPY';
    playVisionDensity: 'FULL' | 'LITE' | 'OFF';
  };
  coach: {
    aceAdaptiveCoaching: boolean;
    autoTimeouts: boolean;
    autoSubstitutions: boolean;
    userShotSlider: number; // 0..100 (legacy alias synced with sliders.user.threePt)
    cpuDefenseSlider: number; // 0..100 (legacy alias synced with sliders.cpu.helpDefense)
    dunkFrequencySlider: number; // 0..100 (legacy alias synced with sliders.user.dunkInTraffic)
    sliders: GameplaySlidersState;
  };
}

export interface ActiveMatchConfig {
  awayTeamId: string;
  homeTeamId: string;
  awayEraPool: EraPoolId;
  homeEraPool: EraPoolId;
  awayJersey: JerseyVariant;
  homeJersey: JerseyVariant;
  venue: MatchVenueId;
  quarterLengthMin: QuarterLengthOption;
  difficulty: MatchDifficulty;
  sideControl: SideControlMode;
  modeLabel: string;
  playersPerSide: 1 | 2 | 3 | 5;
  targetScore: number | null;
}

export interface HybridRosterStarter {
  name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  ovr: number;
  jersey: number;
  signatureTag: string;
}

export interface HybridTeamSummary {
  id: string;
  abbr: string;
  city: string;
  name: string;
  fullName: string;
  eraPool: EraPoolId;
  eraBadge: string;
  arena: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ovr: number;
  off: number;
  def: number;
  tagline: string;
  emblemStyle: 'SHIELD' | 'CREST' | 'CROWN' | 'STAR' | 'DIAMOND';
  starPlayer: HybridRosterStarter;
  starters: HybridRosterStarter[];
  mappedCourtTeamId: number; // Maps into HOOPS_2K26_TEAMS for live 3D match launch
}

export interface BeatsTrackDef {
  id: string;
  title: string;
  artist: string;
  eraTag: '2K14' | '2K26' | 'HYBRID';
  bpm: number;
  keyNote: number; // Base MIDI note
  style: 'boombap' | 'anthem' | 'trap' | 'electrofunk' | 'streetball' | 'clutch';
  durationLabel: string;
}

export interface UltimateHybridSave {
  version: 1;
  uiEraMode: UIEraMode;
  activeScreen: ActiveScreen;
  currencies: CurrencyState;
  profile: UserProfileState;
  challenges: ChallengeItem[];
  settings: SettingsState;
  activeMatchConfig: ActiveMatchConfig;
  lastUpdatedMs: number;
}
