// ============================================================================
// NBA 2K14 (2013-14 Era) — Core TypeScript Domain Models
// ============================================================================

export type TeamLeague = 'NBA' | 'EUROLEAGUE' | 'CLASSIC' | 'ALLSTAR';
export type Conference = 'EAST' | 'WEST' | 'EURO' | 'CLASSIC';
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type CourtEnvId = 'nba' | 'euroleague' | 'blacktop' | 'park' | 'practice';

export type HotZoneId =
  | 'restricted'
  | 'paint'
  | 'mid_l_base'
  | 'mid_r_base'
  | 'mid_l_wing'
  | 'mid_r_wing'
  | 'mid_top'
  | 'three_l_corner'
  | 'three_r_corner'
  | 'three_l_wing'
  | 'three_r_wing'
  | 'three_top'
  | 'paint_l'
  | 'paint_r';

export type SignatureSkillId =
  | 'lebron_coast_to_coast'
  | 'one_man_fastbreak'
  | 'posterizer'
  | 'highlight_film'
  | 'finisher'
  | 'acrobat'
  | 'shot_creator'
  | 'deadeye'
  | 'catch_and_shoot'
  | 'corner_specialist'
  | 'post_proficiency'
  | 'microwave'
  | 'heat_retention'
  | 'closer'
  | 'anti_freeze'
  | 'floor_general'
  | 'dimer'
  | 'alley_ooper'
  | 'break_starter'
  | 'flashy_passer'
  | 'pick_and_roll_maestro'
  | 'ankle_breaker'
  | 'screen_outlet'
  | 'post_playmaker'
  | 'lockdown_defender'
  | 'pick_pocket'
  | 'interceptor'
  | 'active_hands'
  | 'eraser'
  | 'chasedown_artist'
  | 'charge_card'
  | 'pick_dodger'
  | 'brick_wall'
  | 'bruiser'
  | 'defensive_anchor'
  | 'scrapper'
  | 'hustle_points'
  | 'tenacious_rebounder';

export interface SignatureSkillDef {
  id: SignatureSkillId;
  name: string;
  category: 'Scoring' | 'Playmaking' | 'Defense' | 'Athleticism' | 'Hustle';
  shortDesc: string;
  code: string;
  costSp: [number, number, number];
}

export interface EquippedSignatureSkill {
  id: SignatureSkillId;
  level: 1 | 2 | 3;
}

export interface PlayerAttributes {
  closeShot: number;
  midRange: number;
  threePt: number;
  freeThrow: number;
  layup: number;
  dunk: number;
  standingDunk: number;
  postHook: number;
  postFade: number;
  shotInTraffic: number;
  ballHandle: number;
  passAccuracy: number;
  offAwareness: number;
  speed: number;
  quickness: number;
  vertical: number;
  strength: number;
  stamina: number;
  hustle: number;
  onBallDefense: number;
  steal: number;
  block: number;
  defAwareness: number;
  offRebound: number;
  defRebound: number;
}

export interface PlayerData {
  id: string;
  name: string;
  pos: Position;
  jersey: number;
  ovr: number;
  heightCm: number;
  weightLbs: number;
  skinTone: string;
  hairStyle: 'short' | 'fade' | 'afro' | 'bald' | 'mohawk' | 'dreads';
  hairColor: string;
  headband: boolean;
  armSleeve: boolean;
  legSleeve: boolean;
  shoeColor: string;
  attrs: PlayerAttributes;
  signatureSkills: EquippedSignatureSkill[];
  hotZones: Partial<Record<HotZoneId, -1 | 0 | 1>>;
  releaseSpeed: number; // 0.55 (fast) to 0.85 (slow) seconds
  isStarter: boolean;
  teamId: string;
  jumpShotForm?: string;
  dunkPackage?: string;
  dribbleStyle?: string;
}

export interface TeamData {
  id: string;
  code: string;
  city: string;
  name: string;
  fullName: string;
  league: TeamLeague;
  conference: Conference;
  ovr: number;
  arenaName: string;
  primaryColor: string;
  secondaryColor: string;
  altColor: string;
  homeJerseyColor: string;
  awayJerseyColor: string;
  players: PlayerData[];
}

export type DifficultyTier = 'Rookie' | 'Pro' | 'All-Star' | 'Superstar' | 'Hall of Fame';
export type GameStyleMode = 'Default' | 'Simulation' | 'Casual';
export type CameraAngleMode = '2K' | 'Broadcast' | 'Turbo' | 'Drive' | 'Nosebleeds' | 'Player Lock';

export interface GameplaySliders {
  insideShot: number;
  closeShot: number;
  midRange: number;
  threePt: number;
  layup: number;
  dunkInTraffic: number;
  passAccuracy: number;
  alleyOop: number;
  contactShot: number;
  drivingContactFreq: number;
  insideContactFreq: number;
  stealSuccess: number;
  blockSuccess: number;
  defAwareness: number;
  onBallDefense: number;
  acceleration: number;
  vertical: number;
  strength: number;
  stamina: number;
  speed: number;
  hustle: number;
  ballHandling: number;
  hands: number;
  offRebounding: number;
  defRebounding: number;
}

export interface KeybindConfig {
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  sprint: string;
  shoot: string;
  pass: string;
  postUp: string;
  pickAndRoll: string;
  intenseD: string;
  handsUp: string;
  iconPass: string;
  playCall: string;
  flashyPass: string;
  timeout: string;
  proStickUp: string;
  proStickDown: string;
  proStickLeft: string;
  proStickRight: string;
}

export interface Nba2k14Settings {
  game: {
    difficulty: DifficultyTier;
    quarterLengthMin: 1 | 2 | 3 | 5 | 6 | 8 | 10 | 12;
    gameStyle: GameStyleMode;
    gameSpeed: number;
    shotTiming: 'User Timing' | 'Real Player FG%';
    freeThrowTiming: 'User Timing' | 'Real Player FT%';
    fatigue: boolean;
    injuries: boolean;
    clutchFactor: boolean;
  };
  rules: {
    outOfBounds: boolean;
    backcourtViolation: boolean;
    eightSecondViolation: boolean;
    shotClock24: boolean;
    threeSecondKey: boolean;
    goaltending: boolean;
    shootingFouls: boolean;
    reachInFouls: boolean;
    chargingFouls: boolean;
  };
  controller: {
    proStickFunction: 'Default' | 'Dribble Moves' | 'Shots';
    proStickOrientation: 'Camera Relative' | 'Absolute';
    shotMeterDisplay: 'On (Floor Ring)' | 'On (Hands)' | 'Off (No-Meter Green Boost)';
    shotFeedback: boolean;
    defensiveAssist: number;
    boxoutAssist: number;
    virtualGamepad: 'Auto' | 'Always On' | 'Off';
  };
  keybinds: KeybindConfig;
  camera: {
    angle: CameraAngleMode;
    zoom: number;
    height: number;
    keyZoom: boolean;
    autoFlip: boolean;
    dunkShake: boolean;
  };
  presentation: {
    scoreboardDisplay: boolean;
    playerIndicatorStyle: 'Full 2K14 Ring' | 'Minimal' | 'Name + Number';
    actionReplays: 'Often' | 'Occasionally' | 'Never';
  };
  audio: {
    master: number;
    beats: number;
    crowd: number;
    sfx: number;
    commentary: number;
    muted: boolean;
  };
  coach: {
    adaptiveEngine: boolean;
    substitutions: 'Auto (Rotation)' | 'Auto (Fatigue)' | 'Manual';
    timeouts: 'Auto' | 'Manual';
    offensivePlaycalling: 'Auto' | 'Manual';
    playVision: 'Off' | 'Lite' | 'Full';
    playArtMessages: boolean;
  };
  slidersUser: GameplaySliders;
  slidersCpu: GameplaySliders;
  graphics: {
    renderQuality: 'Low' | 'Medium' | 'High' | 'Ultra';
    courtReflections: boolean;
    crowdDetail: 'Low' | 'High';
    fpsCounter: boolean;
  };
  jukeboxDisabledTrackIds: string[];
}

export interface HotZoneRecord {
  made: number;
  att: number;
}

export interface VipProfileData {
  name: string;
  avatarCrest: string;
  favTeamId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  totalPoints: number;
  totalReb: number;
  totalAst: number;
  totalStl: number;
  totalBlk: number;
  totalTo: number;
  insideMade: number;
  insideAtt: number;
  midMade: number;
  midAtt: number;
  threeMade: number;
  threeAtt: number;
  fastbreakPts: number;
  paintPts: number;
  excellentReleases: number;
  totalShots: number;
  gradeSum: number;
  vc: number;
  sp: number;
  mt: number;
  parkRep: number;
  parkWins: number;
  parkLosses: number;
  parkStreak: number;
  hotZones: Record<HotZoneId, HotZoneRecord>;
  unlockedAchievements: string[];
  redeemedCodes: string[];
}

export type MyPlayerPlayStyle =
  | 'Athletic'
  | 'Scoring'
  | '3PT Specialist'
  | 'All-Around'
  | 'Pass First'
  | 'Defensive'
  | 'Post'
  | 'Rebounding';

export interface MyCareerGameLog {
  gameNum: number;
  opponentCode: string;
  won: boolean;
  teamScore: number;
  oppScore: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  grade: string;
}

export interface MyCareerState {
  created: boolean;
  drafted: boolean;
  draftPick: number;
  teamId: string;
  playStyle: MyPlayerPlayStyle;
  player: PlayerData;
  seasonGameIndex: number;
  wins: number;
  losses: number;
  fans: number;
  chemistry: number;
  drillsCompleted: string[];
  gameLogs: MyCareerGameLog[];
  socialFeed: { id: string; handle: string; text: string; time: string }[];
}

export interface PathChapterDef {
  id: string;
  path: 'heat_dynasty' | 'fantastic_journey';
  index: number;
  title: string;
  subtitle: string;
  story: string;
  userTeamId: string;
  oppTeamId: string;
  courtEnv: CourtEnvId;
  startQuarter: number;
  startClockSec: number;
  startUserScore: number;
  startOppScore: number;
  objectives: {
    bronze: string;
    silver: string;
    gold: string;
    lebronPtsTarget: number;
    winMarginTarget: number;
  };
}

export interface PathToGreatnessState {
  selectedPath: 'heat_dynasty' | 'fantastic_journey';
  completedStars: Record<string, 1 | 2 | 3>;
}

export interface AssociationTeamStanding {
  teamId: string;
  wins: number;
  losses: number;
  chemistry: number;
}

export interface AssociationState {
  active: boolean;
  userTeamId: string;
  seasonLength: 14 | 29 | 82;
  currentDay: number;
  standings: Record<string, AssociationTeamStanding>;
  rotationMinutes: Record<string, number>;
  ownerGoal: string;
  ownerTrust: number;
  freeAgents: PlayerData[];
  tradeHistory: string[];
}

export interface PlayoffSeries {
  id: string;
  round: 1 | 2 | 3 | 4;
  conference: 'EAST' | 'WEST' | 'FINALS';
  higherSeedId: string;
  lowerSeedId: string;
  higherWins: number;
  lowerWins: number;
  winnerId: string | null;
}

export interface PlayoffsState {
  active: boolean;
  bestOf: 1 | 3 | 5 | 7;
  userTeamId: string;
  series: PlayoffSeries[];
}

export interface MyTeamCard {
  id: string;
  player: PlayerData;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Historic';
  teamCode: string;
}

export interface MyTeamState {
  starterOpened: boolean;
  collection: MyTeamCard[];
  lineupCardIds: string[]; // 5 starters + up to 5 bench
  rttpSeed: number; // 8 down to 1
  rttpWins: number;
  dominationStars: Record<string, 1 | 2 | 3>;
}

export interface Nba2k14SaveData {
  version: number;
  lastMode: 'mycareer' | 'path' | 'association' | 'quick';
  vip: VipProfileData;
  settings: Nba2k14Settings;
  myCareer: MyCareerState;
  pathToGreatness: PathToGreatnessState;
  association: AssociationState;
  playoffs: PlayoffsState;
  myTeam: MyTeamState;
  customPlayers: PlayerData[];
  rosterOverrides: Record<string, Partial<PlayerData>>;
  teamTransfers: Record<string, string>; // playerId -> teamId
}

export type MatchMode =
  | 'quick'
  | 'path'
  | 'mycareer'
  | 'rookie_showcase'
  | 'park'
  | 'association'
  | 'playoffs'
  | 'blacktop'
  | 'shootout3pt'
  | 'dunkcontest'
  | 'myteam'
  | 'training';

export interface MatchConfig {
  mode: MatchMode;
  title: string;
  subtitle?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeCustomPlayers?: PlayerData[];
  awayCustomPlayers?: PlayerData[];
  userSide: 'home' | 'away';
  courtEnv: CourtEnvId;
  quarterLengthMin: number;
  targetScore?: number; // e.g., 21 for Park/Blacktop
  halfCourt?: boolean;
  playersPerSide: 1 | 2 | 3 | 4 | 5;
  fibaRules?: boolean;
  jerseyMode?: 'standard' | 'alternate';
  playerLockId?: string;
  startQuarter?: number;
  startClockSec?: number;
  startHomeScore?: number;
  startAwayScore?: number;
  pathChapterId?: string;
  trainingDrillId?: string;
  parkCourtId?: string;
  playoffSeriesId?: string;
  myTeamDominationTeamId?: string;
}

export interface PlayerMatchStats {
  playerId: string;
  name: string;
  pos: Position;
  jersey: number;
  teamSide: 'home' | 'away';
  pts: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  to: number;
  pf: number;
  stamina: number;
  streak: number; // >=3 hot, <=-3 cold
}

export interface ShotFeedbackEvent {
  id: number;
  release: 'EXCELLENT' | 'SLIGHTLY EARLY' | 'SLIGHTLY LATE' | 'EARLY' | 'LATE';
  quality: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  contestLabel: string;
  made: boolean;
  points: number;
  zone: HotZoneId;
  shooterName: string;
}

export interface SigSkillPopup {
  id: number;
  skillId: SignatureSkillId;
  skillName: string;
  code: string;
  playerName: string;
  level: 1 | 2 | 3;
}

export interface OtfcState {
  openTab: null | 'strategy' | 'plays' | 'subs' | 'skills';
  offensePoe:
    | 'Get Shooters Open'
    | 'Feed the Post'
    | 'Crash Offensive Glass'
    | 'Play Through Star'
    | 'Limit Transition'
    | 'Protect the Paint';
  activePlay: 'None' | 'Quick Iso' | 'Pick & Roll' | 'Motion Cuts' | '3PT Play';
  defenseSet: 'Man-to-Man' | '2-3 Zone' | '3-2 Zone' | 'Half-Court Trap' | 'Full-Court Press';
  showSigSkillsOverhead: boolean;
}

export interface ReplayPlayerFrame {
  id: string;
  x: number;
  y: number;
  z: number;
  rotY: number;
  pose: string;
}

export interface ReplayFrame {
  t: number;
  ballX: number;
  ballY: number;
  ballZ: number;
  players: ReplayPlayerFrame[];
}

export interface MatchHudSnapshot {
  homeCode: string;
  awayCode: string;
  homeColor: string;
  awayColor: string;
  homeScore: number;
  awayScore: number;
  homeTimeouts: number;
  awayTimeouts: number;
  homeFoulsQ: number;
  awayFoulsQ: number;
  quarter: number;
  quarterScoresHome: number[];
  quarterScoresAway: number[];
  gameClockSec: number;
  shotClockSec: number;
  possession: 'home' | 'away';
  controlledPlayerName: string;
  controlledPlayerPos: Position;
  controlledPlayerJersey: number;
  controlledPlayerStamina: number;
  controlledPlayerStreak: number;
  controlledPlayerSkills: EquippedSignatureSkill[];
  shotMeterActive: boolean;
  shotMeterFill: number; // 0..1
  shotMeterSweetSpot: number; // 0..1
  freeThrowActive: boolean;
  freeThrowShooterName: string;
  freeThrowRemaining: number;
  freeThrowPos: number;
  iconPassActive: boolean;
  iconTargets: { key: string; name: string; pos: Position; screenX: number; screenY: number }[];
  shotFeedback: ShotFeedbackEvent | null;
  sigPopup: SigSkillPopup | null;
  commentary: string;
  paBanner: string | null;
  teammateGrade: string;
  teammateGradeFill: number;
  gradeEvents: { id: number; text: string; positive: boolean }[];
  playerLockStats: PlayerMatchStats | null;
  otfc: OtfcState;
  fps: number;
  paused: boolean;
  replayMode: boolean;
  replayIndex: number;
  replayLength: number;
  replayPlaying: boolean;
  replaySpeed: 0.25 | 0.5 | 1;
  // Special modes
  shootoutState?: {
    rackIndex: number;
    ballInRack: number;
    score: number;
    timeLeft: number;
    isMoneyBall: boolean;
    ballsRemaining: number;
  };
  dunkContestState?: {
    round: number;
    attempt: number;
    selectedDunk: string;
    totalScore: number;
    lastJudgeScores: number[];
    phase: 'select' | 'runup' | 'meter' | 'scored';
  };
  trainingState?: {
    drillTitle: string;
    instruction: string;
    completedReps: number;
    targetReps: number;
  };
  finished: boolean;
  boxScore: PlayerMatchStats[];
  userShotLog: { zone: HotZoneId; made: boolean; pts: number; excellent: boolean; fastbreak: boolean; paint: boolean }[];
}

export interface MatchResultSummary {
  config: MatchConfig;
  homeScore: number;
  awayScore: number;
  userWon: boolean;
  quarterScoresHome: number[];
  quarterScoresAway: number[];
  boxScore: PlayerMatchStats[];
  playerOfGame: PlayerMatchStats;
  teammateGrade: string;
  vcEarned: number;
  spEarned: number;
  mtEarned: number;
  repEarned: number;
  userShotLog: { zone: HotZoneId; made: boolean; pts: number; excellent: boolean; fastbreak: boolean; paint: boolean }[];
  newAchievements: string[];
  pathStarsEarned?: 1 | 2 | 3;
  shootoutScore?: number;
  dunkContestScore?: number;
}
