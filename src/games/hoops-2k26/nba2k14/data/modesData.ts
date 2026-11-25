// ============================================================================
// NBA 2K14 — Modes Data: 2K Beats (20 Tracks), Path to Greatness, Park Courts,
// Achievements (25), Locker Codes, Training Drills, Hot Zones & NBA Today
// ============================================================================

import type { CourtEnvId, HotZoneId, PathChapterDef } from '../types';

export interface Track2kBeats {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  rootMidi: number;
  scale: number[];
  style: 'anthem' | 'trap' | 'boom_bap' | 'rock_arena' | 'synth_funk';
}

export const BEATS_2K14_TRACKLIST: Track2kBeats[] = [
  { id: 't01', title: 'Started From The Bottom (Arena Mix)', artist: 'King James Curated · 01', bpm: 86, rootMidi: 46, scale: [0, 2, 3, 7, 10], style: 'trap' },
  { id: 't02', title: 'All Of The Lights (Brass Cut)', artist: 'King James Curated · 02', bpm: 120, rootMidi: 48, scale: [0, 3, 5, 7, 10], style: 'anthem' },
  { id: 't03', title: 'In The Air Tonight (Tunnel Dub)', artist: 'King James Curated · 03', bpm: 95, rootMidi: 50, scale: [0, 2, 3, 5, 7, 8, 10], style: 'rock_arena' },
  { id: 't04', title: 'Radioactive (Arena Pulse)', artist: 'King James Curated · 04', bpm: 136, rootMidi: 47, scale: [0, 2, 3, 7, 10], style: 'rock_arena' },
  { id: 't05', title: 'Hate Me Now (Championship Flip)', artist: 'King James Curated · 05', bpm: 92, rootMidi: 45, scale: [0, 1, 4, 5, 7, 8], style: 'anthem' },
  { id: 't06', title: "Can't Hold Us (Fastbreak Groove)", artist: 'King James Curated · 06', bpm: 128, rootMidi: 52, scale: [0, 2, 4, 7, 9], style: 'anthem' },
  { id: 't07', title: 'Blurred Lines (Court Funk)', artist: 'King James Curated · 07', bpm: 120, rootMidi: 43, scale: [0, 2, 4, 7, 9, 10], style: 'synth_funk' },
  { id: 't08', title: 'Lost! (Hardwood Echo)', artist: 'King James Curated · 08', bpm: 102, rootMidi: 48, scale: [0, 3, 5, 7, 10], style: 'rock_arena' },
  { id: 't09', title: 'Get Lucky (South Beach Mix)', artist: 'King James Curated · 09', bpm: 116, rootMidi: 47, scale: [0, 2, 3, 5, 7, 9, 10], style: 'synth_funk' },
  { id: 't10', title: 'Now Or Never (4th Quarter Mix)', artist: 'King James Curated · 10', bpm: 96, rootMidi: 49, scale: [0, 3, 5, 7, 10], style: 'boom_bap' },
  { id: 't11', title: 'Who Do We Think We Are', artist: 'King James Curated · 11', bpm: 88, rootMidi: 44, scale: [0, 2, 3, 7, 8, 10], style: 'boom_bap' },
  { id: 't12', title: 'Not Afraid (Finals Anthem)', artist: 'King James Curated · 12', bpm: 86, rootMidi: 48, scale: [0, 3, 5, 7, 10], style: 'anthem' },
  { id: 't13', title: 'Long Run (Blacktop Bounce)', artist: 'King James Curated · 13', bpm: 94, rootMidi: 46, scale: [0, 3, 5, 6, 7, 10], style: 'boom_bap' },
  { id: 't14', title: 'Elevator (Miami Spotlight)', artist: 'King James Curated · 14', bpm: 110, rootMidi: 51, scale: [0, 2, 3, 7, 10], style: 'trap' },
  { id: 't15', title: 'Gorilla (Rim Shaker)', artist: 'King James Curated · 15', bpm: 126, rootMidi: 45, scale: [0, 2, 3, 5, 7, 10], style: 'rock_arena' },
  { id: 't16', title: 'The Ruler Is Back (Brass Loop)', artist: 'King James Curated · 16', bpm: 93, rootMidi: 43, scale: [0, 3, 5, 7, 10], style: 'anthem' },
  { id: 't17', title: 'Coldest Winter (Clutch Synth)', artist: 'King James Curated · 17', bpm: 108, rootMidi: 46, scale: [0, 2, 3, 5, 7, 8], style: 'synth_funk' },
  { id: 't18', title: 'Para Los Rumberos (Miami Heat)', artist: 'King James Curated · 18', bpm: 114, rootMidi: 50, scale: [0, 2, 4, 5, 7, 9], style: 'synth_funk' },
  { id: 't19', title: 'Clint Eastwood (Street Cipher)', artist: 'King James Curated · 19', bpm: 84, rootMidi: 42, scale: [0, 3, 5, 6, 7, 10], style: 'boom_bap' },
  { id: 't20', title: 'King James Crown (2K14 Theme)', artist: '2K Sports Studio · 20', bpm: 98, rootMidi: 48, scale: [0, 2, 3, 7, 10], style: 'anthem' },
];

export const NBA_TODAY_MATCHUPS = [
  { id: 'nt1', awayId: 'mia', homeId: 'sas', label: 'Finals Rematch', arena: 'AT&T Center', tipTime: '8:00 PM ET' },
  { id: 'nt2', awayId: 'okc', homeId: 'lac', label: 'West Showdown', arena: 'Staples Center', tipTime: '10:30 PM ET' },
  { id: 'nt3', awayId: 'chi', homeId: 'nyk', label: 'East Classic', arena: 'Madison Square Garden', tipTime: '7:30 PM ET' },
  { id: 'nt4', awayId: 'gsw', homeId: 'hou', label: 'Splash vs Dwight', arena: 'Toyota Center', tipTime: '8:30 PM ET' },
  { id: 'nt5', awayId: 'ind', homeId: 'mia', label: 'ECF Grudge Match', arena: 'AmericanAirlines Arena', tipTime: '8:00 PM ET' },
];

export const PATH_TO_GREATNESS_CHAPTERS: PathChapterDef[] = [
  // PATH A: HEAT DYNASTY (7 Scenarios)
  {
    id: 'hd_1',
    path: 'heat_dynasty',
    index: 1,
    title: 'Ring Night Statement',
    subtitle: 'vs Chicago Bulls · Opening Night',
    story: 'Derrick Rose returns to crash ring night in Miami. Set the tone for the Heat 3-Peat.',
    userTeamId: 'mia',
    oppTeamId: 'chi',
    courtEnv: 'nba',
    startQuarter: 3,
    startClockSec: 180,
    startUserScore: 54,
    startOppScore: 56,
    objectives: { bronze: 'Win the game', silver: 'Score 12+ pts with LeBron & win', gold: 'Win by 6+ & score 16+ pts with LeBron', lebronPtsTarget: 16, winMarginTarget: 6 },
  },
  {
    id: 'hd_2',
    path: 'heat_dynasty',
    index: 2,
    title: 'Battle for the East Crown',
    subtitle: 'vs Indiana Pacers · Bankers Life',
    story: 'Paul George and Roy Hibbert have locked down the paint. Break Indiana on the road.',
    userTeamId: 'mia',
    oppTeamId: 'ind',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 74,
    startOppScore: 79,
    objectives: { bronze: 'Erase the 5-pt deficit & win', silver: 'Score 10+ with LeBron & win', gold: 'Win by 5+ & score 14+ with LeBron', lebronPtsTarget: 14, winMarginTarget: 5 },
  },
  {
    id: 'hd_3',
    path: 'heat_dynasty',
    index: 3,
    title: 'Brooklyn Veterans Clash',
    subtitle: 'vs Brooklyn Nets · Barclays Center',
    story: 'Pierce, Garnett, and Deron Williams formed a superteam to topple Miami.',
    userTeamId: 'mia',
    oppTeamId: 'bkn',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 210,
    startUserScore: 78,
    startOppScore: 80,
    objectives: { bronze: 'Defeat Brooklyn', silver: 'Score 10+ with LeBron & win', gold: 'Win by 6+ with LeBron leading', lebronPtsTarget: 14, winMarginTarget: 6 },
  },
  {
    id: 'hd_4',
    path: 'heat_dynasty',
    index: 4,
    title: 'Garden Spotlight',
    subtitle: 'vs New York Knicks · MSG',
    story: 'Carmelo Anthony is red hot under the bright lights of Madison Square Garden.',
    userTeamId: 'mia',
    oppTeamId: 'nyk',
    courtEnv: 'nba',
    startQuarter: 3,
    startClockSec: 180,
    startUserScore: 62,
    startOppScore: 64,
    objectives: { bronze: 'Win at MSG', silver: 'Score 12+ with LeBron & win', gold: 'Win by 7+ & score 16+ with LeBron', lebronPtsTarget: 16, winMarginTarget: 7 },
  },
  {
    id: 'hd_5',
    path: 'heat_dynasty',
    index: 5,
    title: 'Space City Showdown',
    subtitle: 'vs Houston Rockets · Toyota Center',
    story: 'Dwight Howard and James Harden push the pace. Dominate the paint and transition.',
    userTeamId: 'mia',
    oppTeamId: 'hou',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 81,
    startOppScore: 85,
    objectives: { bronze: 'Beat Houston', silver: 'Score 12+ with LeBron & win', gold: 'Win by 6+ & score 15+ with LeBron', lebronPtsTarget: 15, winMarginTarget: 6 },
  },
  {
    id: 'hd_6',
    path: 'heat_dynasty',
    index: 6,
    title: 'MVP Duel in Loud City',
    subtitle: 'vs Oklahoma City Thunder · Finals Preview',
    story: 'Kevin Durant and Russell Westbrook want redemption for 2012.',
    userTeamId: 'mia',
    oppTeamId: 'okc',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 86,
    startOppScore: 91,
    objectives: { bronze: 'Come back to beat OKC', silver: 'Score 14+ with LeBron & win', gold: 'Win by 5+ & score 18+ with LeBron', lebronPtsTarget: 18, winMarginTarget: 5 },
  },
  {
    id: 'hd_7',
    path: 'heat_dynasty',
    index: 7,
    title: 'The 3-Peat Dynasty — Game 7',
    subtitle: 'vs San Antonio Spurs · NBA Finals',
    story: 'Duncan, Parker, and Kawhi stand one quarter away from denying Miami history.',
    userTeamId: 'mia',
    oppTeamId: 'sas',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 300,
    startUserScore: 84,
    startOppScore: 88,
    objectives: { bronze: 'Clinch the 3-Peat', silver: 'Score 14+ with LeBron & win', gold: 'Win by 6+ & score 18+ with LeBron', lebronPtsTarget: 18, winMarginTarget: 6 },
  },

  // PATH B: FANTASTIC JOURNEY (6 What-If Chapters)
  {
    id: 'fj_1',
    path: 'fantastic_journey',
    index: 1,
    title: 'The King of New York',
    subtitle: 'What If LeBron Joined the Knicks? vs MIA',
    story: 'In an alternate 2014, LeBron teams up with Carmelo at MSG to face Dwyane Wade and Miami.',
    userTeamId: 'nyk',
    oppTeamId: 'mia',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 80,
    startOppScore: 83,
    objectives: { bronze: 'Win at MSG with NYK', silver: 'Score 12+ with LeBron & win', gold: 'Win by 6+ & score 16+ with LeBron', lebronPtsTarget: 16, winMarginTarget: 6 },
  },
  {
    id: 'fj_2',
    path: 'fantastic_journey',
    index: 2,
    title: 'Homecoming in Cleveland',
    subtitle: 'What If LeBron Returned to CLE? vs GSW',
    story: 'Back in Wine & Gold alongside Kyrie Irving to stop Stephen Curry and the surging Warriors.',
    userTeamId: 'cle',
    oppTeamId: 'gsw',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 83,
    startOppScore: 88,
    objectives: { bronze: 'Deliver a Cleveland victory', silver: 'Score 12+ with LeBron & win', gold: 'Win by 6+ & score 16+ with LeBron', lebronPtsTarget: 16, winMarginTarget: 6 },
  },
  {
    id: 'fj_3',
    path: 'fantastic_journey',
    index: 3,
    title: 'King vs Black Mamba',
    subtitle: 'LeBron vs Kobe Bryant · Staples Center',
    story: 'The Finals duel fans always dreamed of: LeBron vs Kobe in a fourth-quarter shootout.',
    userTeamId: 'mia',
    oppTeamId: 'lal',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 88,
    startOppScore: 91,
    objectives: { bronze: 'Outduel Kobe & win', silver: 'Score 14+ with LeBron & win', gold: 'Win by 6+ & score 18+ with LeBron', lebronPtsTarget: 18, winMarginTarget: 6 },
  },
  {
    id: 'fj_4',
    path: 'fantastic_journey',
    index: 4,
    title: 'Lob City Ambush',
    subtitle: 'vs LA Clippers · High-Flying Duel',
    story: 'Chris Paul and Blake Griffin are throwing lobs all night. Shut down Lob City.',
    userTeamId: 'mia',
    oppTeamId: 'lac',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 85,
    startOppScore: 89,
    objectives: { bronze: 'Defeat the Clippers', silver: 'Score 12+ with LeBron & win', gold: 'Win by 7+ & score 16+ with LeBron', lebronPtsTarget: 16, winMarginTarget: 7 },
  },
  {
    id: 'fj_5',
    path: 'fantastic_journey',
    index: 5,
    title: 'Euroleague Exhibition Clash',
    subtitle: 'Miami Heat vs Real Madrid · FIBA Rules',
    story: 'Take the Heat overseas for an international showdown under European arena atmosphere.',
    userTeamId: 'mia',
    oppTeamId: 'euro_rma',
    courtEnv: 'euroleague',
    startQuarter: 4,
    startClockSec: 240,
    startUserScore: 76,
    startOppScore: 78,
    objectives: { bronze: 'Beat Real Madrid', silver: 'Score 12+ with LeBron & win', gold: 'Win by 8+ & score 16+ with LeBron', lebronPtsTarget: 16, winMarginTarget: 8 },
  },
  {
    id: 'fj_6',
    path: 'fantastic_journey',
    index: 6,
    title: 'Immortal Legacy: King vs GOAT',
    subtitle: "Miami Heat vs '95-96 Chicago Bulls",
    story: 'The ultimate fantasy matchup: 99 OVR LeBron James against 99 OVR Michael Jordan.',
    userTeamId: 'mia',
    oppTeamId: 'cls_96chi',
    courtEnv: 'nba',
    startQuarter: 4,
    startClockSec: 300,
    startUserScore: 88,
    startOppScore: 93,
    objectives: { bronze: "Defeat the '95-96 Bulls", silver: 'Score 15+ with LeBron & win', gold: 'Win by 5+ & score 20+ with LeBron', lebronPtsTarget: 20, winMarginTarget: 5 },
  },
];

export interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  vcReward: number;
}

export const ACHIEVEMENTS_25: AchievementDef[] = [
  { id: 'first_win', title: 'Tip-Off Victory', desc: 'Win your first game in any mode.', vcReward: 500 },
  { id: 'triple_double', title: 'Triple-Double Machine', desc: 'Record 10+ PTS, 10+ REB, and 10+ AST with one player.', vcReward: 1500 },
  { id: 'king_of_court', title: 'King of the Court', desc: 'Win a 5v5 game on The Park King of the Court.', vcReward: 1000 },
  { id: 'buzzer_beater', title: 'Buzzer Beater', desc: 'Win a game decided by 3 points or fewer.', vcReward: 1000 },
  { id: 'ten_zero_run', title: '10-0 Run', desc: 'Score 40+ points in a single regulation game.', vcReward: 800 },
  { id: 'ptg_gold', title: 'Path to Greatness Gold', desc: 'Earn a 3-Star Gold rating in any Path to Greatness chapter.', vcReward: 1200 },
  { id: 'downtown_king', title: 'Downtown 3PT King', desc: 'Make 5+ three-pointers in a single game or score 18+ in 3PT Shootout.', vcReward: 1000 },
  { id: 'lockdown_5_steals', title: 'Lockdown 5 Steals', desc: 'Record 5+ team steals in a single match.', vcReward: 900 },
  { id: 'posterizer_dunk', title: 'Posterizer Dunk', desc: 'Score 45+ points in Sprite Slam Dunk Contest or dominate the paint.', vcReward: 900 },
  { id: 'green_machine', title: 'Green Release Artist', desc: 'Hit 5+ Excellent shot releases in a single game.', vcReward: 850 },
  { id: 'double_double', title: 'Double-Double Workhorse', desc: 'Record a double-double with any player.', vcReward: 600 },
  { id: 'euro_champ', title: 'Euroleague Conqueror', desc: 'Win a game using or against an official Euroleague club.', vcReward: 750 },
  { id: 'classic_legend', title: 'Hardwood Historian', desc: 'Win a matchup featuring a Classic NBA team.', vcReward: 750 },
  { id: 'mycareer_draft', title: 'Welcome to the League', desc: 'Complete the Rookie Showcase and get drafted in MyCAREER.', vcReward: 1200 },
  { id: 'mycareer_a_plus', title: 'Coach’s Dream', desc: 'Finish a MyCAREER game with an A or A+ Teammate Grade.', vcReward: 1100 },
  { id: 'park_streak_3', title: 'Hot Streak on the Blacktop', desc: 'Reach a 3-game win streak in The Park.', vcReward: 1200 },
  { id: 'myteam_pack', title: 'Card Collector', desc: 'Open your Starter Pack and a Market Pack in MyTEAM.', vcReward: 600 },
  { id: 'myteam_dom', title: 'Domination Starter', desc: 'Earn 3 stars against an NBA team in MyTEAM Domination.', vcReward: 900 },
  { id: 'gm_trade', title: 'Blockbuster GM', desc: 'Complete a trade in The Association / MyGM.', vcReward: 700 },
  { id: 'playoff_series', title: 'Playoff Advance', desc: 'Win a Playoff series in Playoffs mode.', vcReward: 1000 },
  { id: 'locker_hunter', title: 'Locker Code VIP', desc: 'Redeem your first NBA 2K14 Locker Code.', vcReward: 500 },
  { id: 'training_grad', title: 'Gym Rat', desc: 'Complete any Training Camp Pro Stick drill.', vcReward: 650 },
  { id: 'twenty_pts', title: 'Bucket Getter', desc: 'Score 20+ points with a single player in one game.', vcReward: 750 },
  { id: 'rim_protector', title: 'No-Fly Zone', desc: 'Record 4+ team blocks in a single match.', vcReward: 800 },
  { id: 'win_streak_5', title: 'Dynasty Rising', desc: 'Achieve a 5-game overall win streak on your VIP Profile.', vcReward: 1500 },
];

export interface LockerCodeDef {
  code: string;
  label: string;
  vc: number;
  sp: number;
  mt: number;
  bonusCardPlayerName?: string;
  bonusTier?: 'Gold' | 'Historic';
}

export const LOCKER_CODES: LockerCodeDef[] = [
  { code: 'KINGJAMES', label: 'King James Bundle (+5,000 VC, +2,000 SP & Gold LeBron MyTEAM Card)', vc: 5000, sp: 2000, mt: 1500, bonusCardPlayerName: 'LeBron James', bonusTier: 'Gold' },
  { code: '2K14LEGEND', label: '2K14 Legend Vault (+7,500 VC, +2,500 MT & Historic MJ Card)', vc: 7500, sp: 1500, mt: 2500, bonusCardPlayerName: 'Michael Jordan', bonusTier: 'Historic' },
  { code: 'BLACKTOP21', label: 'Blacktop Street Pack (+3,500 VC, +1,500 SP & +500 Park REP)', vc: 3500, sp: 1500, mt: 1000 },
];

export interface ParkCourtDef {
  id: string;
  name: string;
  format: '2v2' | '3v3' | '5v5';
  playersPerSide: 2 | 3 | 5;
  targetScore: number;
  halfCourt: boolean;
  xPct: number; // 0..100 plaza map position
  yPct: number;
  gotNextX: number;
  gotNextY: number;
  squadName: string;
  streak: number;
  oppOvr: number;
  accentColor: string;
}

export const PARK_COURTS: ParkCourtDef[] = [
  { id: 'park_2v2_a', name: 'Sunset 2s · West', format: '2v2', playersPerSide: 2, targetScore: 21, halfCourt: true, xPct: 20, yPct: 26, gotNextX: 20, gotNextY: 40, squadName: 'Venice Ballers', streak: 3, oppOvr: 80, accentColor: '#F9A01B' },
  { id: 'park_2v2_b', name: 'Rucker 2s · East', format: '2v2', playersPerSide: 2, targetScore: 21, halfCourt: true, xPct: 80, yPct: 26, gotNextX: 80, gotNextY: 40, squadName: 'Harlem Flash', streak: 2, oppOvr: 82, accentColor: '#F9A01B' },
  { id: 'park_3v3_a', name: 'South Beach 3s', format: '3v3', playersPerSide: 3, targetScore: 21, halfCourt: true, xPct: 20, yPct: 74, gotNextX: 20, gotNextY: 60, squadName: 'Dade County Crew', streak: 5, oppOvr: 85, accentColor: '#CE1141' },
  { id: 'park_3v3_b', name: 'Midtown 3s', format: '3v3', playersPerSide: 3, targetScore: 21, halfCourt: true, xPct: 50, yPct: 78, gotNextX: 50, gotNextY: 64, squadName: 'Concrete Kings', streak: 4, oppOvr: 84, accentColor: '#CE1141' },
  { id: 'park_3v3_c', name: 'Pier 3s', format: '3v3', playersPerSide: 3, targetScore: 21, halfCourt: true, xPct: 80, yPct: 74, gotNextX: 80, gotNextY: 60, squadName: 'Bay Rim Rattlers', streak: 1, oppOvr: 81, accentColor: '#CE1141' },
  { id: 'park_5v5_king', name: 'KING OF THE COURT 5v5', format: '5v5', playersPerSide: 5, targetScore: 21, halfCourt: false, xPct: 50, yPct: 28, gotNextX: 50, gotNextY: 44, squadName: '2K14 Park Legends', streak: 7, oppOvr: 90, accentColor: '#F59E0B' },
];

export interface TrainingDrillDef {
  id: string;
  title: string;
  category: 'Shooting' | 'Pro Stick' | 'Playmaking' | 'Defense' | 'Freestyle';
  instruction: string;
  targetReps: number;
  spReward: number;
}

export const TRAINING_DRILLS: TrainingDrillDef[] = [
  { id: 'freestyle', title: 'Open Freestyle Shootaround', category: 'Freestyle', instruction: 'Practice jumpers, Pro Stick IsoMotion combos, Eurosteps, and dunks at your own pace.', targetReps: 10, spReward: 250 },
  { id: 'jump_shot', title: 'Jump Shot Release Timing', category: 'Shooting', instruction: 'Hold Space (or Pro Stick) and release inside the green sweet spot to sink 5 jump shots.', targetReps: 5, spReward: 400 },
  { id: 'isomotion', title: 'Pro Stick IsoMotion Crossovers', category: 'Pro Stick', instruction: 'Flick I/J/K/L (Right Stick) to chain crossovers & stepbacks, then score 4 buckets.', targetReps: 4, spReward: 450 },
  { id: 'euro_hop', title: 'Euro Step & Hop Step Finishes', category: 'Pro Stick', instruction: 'Drive into the paint and tap Left/Right Pro Stick (J/L) while finishing 4 layups.', targetReps: 4, spReward: 450 },
  { id: 'poster_dunk', title: 'Power & Flashy Poster Dunks', category: 'Pro Stick', instruction: 'Hold Sprint (Shift) driving toward the rim and press Shoot (Space) for 4 slams.', targetReps: 4, spReward: 450 },
  { id: 'pick_roll', title: 'Pick & Roll Maestro Drill', category: 'Playmaking', instruction: 'Tap V to call a screen, turn the corner, and score or assist 4 times.', targetReps: 4, spReward: 500 },
  { id: 'post_moves', title: 'Post Fadeaway & Hook Clinic', category: 'Shooting', instruction: 'Hold F to post up near the block and release a Post Fade or Hook for 4 makes.', targetReps: 4, spReward: 450 },
  { id: 'alley_oop', title: 'Alley-Oop Lob Timing', category: 'Playmaking', instruction: 'Press C + Space to throw Alley-Oop lobs to cutting teammates 3 times.', targetReps: 3, spReward: 500 },
  { id: 'intense_d', title: 'Intense D & Shot Contest', category: 'Defense', instruction: 'Hold C for Intense D and U for Hands Up to force 4 stops or steals.', targetReps: 4, spReward: 500 },
];

export const HOT_ZONE_LABELS: Record<HotZoneId, string> = {
  restricted: 'Restricted Area',
  paint: 'Center Paint',
  paint_l: 'Left Paint Block',
  paint_r: 'Right Paint Block',
  mid_l_base: 'Left Baseline Mid',
  mid_r_base: 'Right Baseline Mid',
  mid_l_wing: 'Left Wing Mid',
  mid_r_wing: 'Right Wing Mid',
  mid_top: 'Top of Key Mid',
  three_l_corner: 'Left Corner 3',
  three_r_corner: 'Right Corner 3',
  three_l_wing: 'Left Wing 3',
  three_r_wing: 'Right Wing 3',
  three_top: 'Top of Key 3',
};

export const ALL_HOT_ZONE_IDS: HotZoneId[] = Object.keys(HOT_ZONE_LABELS) as HotZoneId[];

/**
 * Classifies a 3D court position relative to the attacking hoop into one of the 14 official NBA zones.
 * Court coordinate convention: X runs along court length (-14.325m to +14.325m), Z runs across width (-7.62m to +7.62m).
 * Hoop sits at (hoopX, 0) where hoopX is +12.75 or -12.75.
 */
export function classifyShotZone(
  shooterX: number,
  shooterZ: number,
  hoopX: number,
  fibaRules = false
): { zone: HotZoneId; isThree: boolean; distMeters: number } {
  const dx = Math.abs(hoopX - shooterX); // forward distance from hoop toward midcourt
  const dz = shooterZ; // lateral distance from center line
  const dist = Math.hypot(dx, dz);
  const threeArc = fibaRules ? 6.75 : 7.24;
  const cornerDist = fibaRules ? 6.6 : 6.71;

  const isCornerDepth = dx < 2.9;
  const isThree = isCornerDepth ? Math.abs(dz) >= cornerDist : dist >= threeArc;

  if (isThree) {
    if (isCornerDepth) {
      return { zone: dz < 0 ? 'three_l_corner' : 'three_r_corner', isThree: true, distMeters: dist };
    }
    if (Math.abs(dz) < 2.6) {
      return { zone: 'three_top', isThree: true, distMeters: dist };
    }
    return { zone: dz < 0 ? 'three_l_wing' : 'three_r_wing', isThree: true, distMeters: dist };
  }

  if (dist <= 1.55) {
    return { zone: 'restricted', isThree: false, distMeters: dist };
  }
  if (dx <= 4.6 && Math.abs(dz) <= 2.45) {
    if (Math.abs(dz) < 1.0) return { zone: 'paint', isThree: false, distMeters: dist };
    return { zone: dz < 0 ? 'paint_l' : 'paint_r', isThree: false, distMeters: dist };
  }
  if (isCornerDepth) {
    return { zone: dz < 0 ? 'mid_l_base' : 'mid_r_base', isThree: false, distMeters: dist };
  }
  if (Math.abs(dz) < 2.2) {
    return { zone: 'mid_top', isThree: false, distMeters: dist };
  }
  return { zone: dz < 0 ? 'mid_l_wing' : 'mid_r_wing', isThree: false, distMeters: dist };
}

export const PARK_REP_TIERS = [
  { name: 'Rookie 1', minRep: 0 },
  { name: 'Rookie 2', minRep: 400 },
  { name: 'Rookie 3', minRep: 900 },
  { name: 'Pro 1', minRep: 1600 },
  { name: 'Pro 2', minRep: 2500 },
  { name: 'Pro 3', minRep: 3800 },
  { name: 'All-Star 1', minRep: 5500 },
  { name: 'All-Star 2', minRep: 7800 },
  { name: 'All-Star 3', minRep: 10500 },
  { name: 'Legend 1', minRep: 14000 },
  { name: 'Legend 3', minRep: 20000 },
];

export function getParkRepTier(rep: number): string {
  let tier = PARK_REP_TIERS[0].name;
  for (const t of PARK_REP_TIERS) {
    if (rep >= t.minRep) tier = t.name;
  }
  return tier;
}

export const DUNK_CONTEST_MOVES = [
  { id: 'tomahawk', name: 'King James Tomahawk', difficulty: 44, styleBonus: 5, airTime: 0.92 },
  { id: 'windmill', name: '360 Baseline Windmill', difficulty: 48, styleBonus: 8, airTime: 1.05 },
  { id: 'between_legs', name: 'Eastbay Between-The-Legs', difficulty: 50, styleBonus: 10, airTime: 1.1 },
  { id: 'free_throw', name: 'Air Jordan Free-Throw Line', difficulty: 50, styleBonus: 10, airTime: 1.18 },
  { id: 'reverse_pump', name: 'Double-Clutch Reverse', difficulty: 46, styleBonus: 6, airTime: 0.98 },
];

export const SIGNATURE_ANIMATION_SETS = {
  jumpShotForms: ['LeBron James', 'Ray Allen', 'Kobe Bryant', 'Stephen Curry', 'Michael Jordan', 'Carmelo Anthony', 'Dirk Nowitzki'],
  dunkPackages: ['Athletic One-Handers', 'LeBron Signature', 'Blake Griffin Power', 'Michael Jordan Air', 'Vince Carter 360s', 'Rim Grazers'],
  dribbleStyles: ['Kyrie Irving Iso', 'Chris Paul Crafty', 'Derrick Rose Explosive', 'LeBron Power', 'Jamal Crawford Flashy'],
};
