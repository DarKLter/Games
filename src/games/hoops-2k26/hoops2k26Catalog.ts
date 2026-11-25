export type HoopsMainTab =
  | 'play_now'
  | 'mycareer'
  | 'myteam'
  | 'mynba'
  | 'the_w'
  | 'learn_2k'
  | 'season'
  | 'features';

export type HoopsPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';
export type HoopsLeaguePool = 'nba' | 'wnba' | 'classic';
export type HoopsBodyType = 'Lean' | 'Compact' | 'Defined' | 'Solid' | 'Burly';
export type HoopsAttrCategory =
  | 'finishing'
  | 'shooting'
  | 'playmaking'
  | 'defense'
  | 'rebounding'
  | 'physicals';

export type HoopsBadgeTier = 'None' | 'Bronze' | 'Silver' | 'Gold' | 'HOF' | 'Legend';
export type HoopsZoneHeat = 'cold' | 'neutral' | 'hot' | 'lethal';
export type HoopsCourtTheme =
  | 'nba_arena'
  | 'the_rec'
  | 'proving_grounds'
  | 'park'
  | 'blacktop'
  | 'street_kings'
  | 'open_court'
  | 'mycourt'
  | 'theater'
  | 'wnba_arena';

export interface HoopsRosterPlayer {
  role: HoopsPosition;
  name: string;
  ovr: number;
  jersey: number;
  skin: number;
  scale: number;
}

export interface Hoops2K26TeamDef {
  id: number;
  name: string;
  city: string;
  abbr: string;
  league: HoopsLeaguePool;
  eraTag?: string;
  tier: 1 | 2 | 3;
  tagline: string;
  icon: string;
  jerseyColor: number;
  awayJerseyColor: number;
  cityJerseyColor: number;
  trimColor: number;
  accentHex: string;
  shootRating: number; // 1..5
  dunkRating: number; // 1..5
  speedRating: number; // 1..5
  defRating: number; // 1..5
  starters: [
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer,
    HoopsRosterPlayer
  ];
}

export const HOOPS_2K26_TEAMS: Hoops2K26TeamDef[] = [
  {
    id: 0,
    city: 'Boston',
    name: 'Boston Celtics',
    abbr: 'BOS',
    league: 'nba',
    tier: 1,
    tagline: '5-Out 3PT Champions',
    icon: '🍀',
    jerseyColor: 0x007a33,
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: 0x111827,
    trimColor: 0xfacc15,
    accentHex: '#22c55e',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Derrick White', ovr: 88, jersey: 9, skin: 0xd99b66, scale: 0.97 },
      { role: 'SG', name: 'Jaylen Brown', ovr: 93, jersey: 7, skin: 0x7c4a26, scale: 1.01 },
      { role: 'SF', name: 'Jayson Tatum', ovr: 96, jersey: 0, skin: 0xc68642, scale: 1.05 },
      { role: 'PF', name: 'Jrue Holiday', ovr: 87, jersey: 4, skin: 0x8d5524, scale: 1.0 },
      { role: 'C', name: 'Kristaps Porzingis', ovr: 89, jersey: 8, skin: 0xf1c27d, scale: 1.15 }
    ]
  },
  {
    id: 1,
    city: 'Los Angeles',
    name: 'Los Angeles Lakers',
    abbr: 'LAL',
    league: 'nba',
    tier: 1,
    tagline: 'Showtime Star Power',
    icon: '👑',
    jerseyColor: 0x552583,
    awayJerseyColor: 0xfdb927,
    cityJerseyColor: 0x111827,
    trimColor: 0xfdb927,
    accentHex: '#facc15',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 4,
    defRating: 4,
    starters: [
      { role: 'PG', name: 'Luka Doncic', ovr: 97, jersey: 77, skin: 0xf1c27d, scale: 1.03 },
      { role: 'SG', name: 'Austin Reaves', ovr: 85, jersey: 15, skin: 0xf1c27d, scale: 0.99 },
      { role: 'SF', name: 'LeBron James', ovr: 95, jersey: 23, skin: 0x7c4a26, scale: 1.07 },
      { role: 'PF', name: 'Rui Hachimura', ovr: 83, jersey: 28, skin: 0xa66e43, scale: 1.06 },
      { role: 'C', name: 'Jaxson Hayes', ovr: 81, jersey: 11, skin: 0x8d5524, scale: 1.13 }
    ]
  },
  {
    id: 2,
    city: 'Golden State',
    name: 'Golden State Warriors',
    abbr: 'GSW',
    league: 'nba',
    tier: 1,
    tagline: 'Splash Motion Offense',
    icon: '🌉',
    jerseyColor: 0x1d428a,
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: 0x0f172a,
    trimColor: 0xffc72c,
    accentHex: '#38bdf8',
    shootRating: 5,
    dunkRating: 3,
    speedRating: 5,
    defRating: 4,
    starters: [
      { role: 'PG', name: 'Stephen Curry', ovr: 96, jersey: 30, skin: 0xd99b66, scale: 0.95 },
      { role: 'SG', name: 'Brandin Podziemski', ovr: 82, jersey: 2, skin: 0xf1c27d, scale: 0.98 },
      { role: 'SF', name: 'Jimmy Butler', ovr: 90, jersey: 10, skin: 0x8d5524, scale: 1.03 },
      { role: 'PF', name: 'Jonathan Kuminga', ovr: 84, jersey: 0, skin: 0x5c361e, scale: 1.05 },
      { role: 'C', name: 'Draymond Green', ovr: 85, jersey: 23, skin: 0x7c4a26, scale: 1.06 }
    ]
  },
  {
    id: 3,
    city: 'Denver',
    name: 'Denver Nuggets',
    abbr: 'DEN',
    league: 'nba',
    tier: 1,
    tagline: 'Mile High Playmaking',
    icon: '⛰️',
    jerseyColor: 0x0e2240,
    awayJerseyColor: 0xfec524,
    cityJerseyColor: 0x8b2131,
    trimColor: 0xfec524,
    accentHex: '#f59e0b',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 4,
    defRating: 4,
    starters: [
      { role: 'PG', name: 'Jamal Murray', ovr: 89, jersey: 27, skin: 0xc68642, scale: 0.98 },
      { role: 'SG', name: 'Christian Braun', ovr: 83, jersey: 0, skin: 0xf1c27d, scale: 1.01 },
      { role: 'SF', name: 'Michael Porter Jr.', ovr: 86, jersey: 1, skin: 0xd99b66, scale: 1.08 },
      { role: 'PF', name: 'Aaron Gordon', ovr: 86, jersey: 32, skin: 0xc68642, scale: 1.07 },
      { role: 'C', name: 'Nikola Jokic', ovr: 98, jersey: 15, skin: 0xf1c27d, scale: 1.14 }
    ]
  },
  {
    id: 4,
    city: 'Oklahoma City',
    name: 'OKC Thunder',
    abbr: 'OKC',
    league: 'nba',
    tier: 1,
    tagline: 'Young Lockdown Speed',
    icon: '⚡',
    jerseyColor: 0x007ac1,
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: 0xef3b24,
    trimColor: 0xef3b24,
    accentHex: '#38bdf8',
    shootRating: 5,
    dunkRating: 5,
    speedRating: 5,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Shai Gilgeous-Alexander', ovr: 98, jersey: 2, skin: 0x8d5524, scale: 1.01 },
      { role: 'SG', name: 'Luguentz Dort', ovr: 84, jersey: 5, skin: 0x5c361e, scale: 1.0 },
      { role: 'SF', name: 'Jalen Williams', ovr: 90, jersey: 8, skin: 0x8d5524, scale: 1.03 },
      { role: 'PF', name: 'Chet Holmgren', ovr: 89, jersey: 7, skin: 0xf1c27d, scale: 1.15 },
      { role: 'C', name: 'Isaiah Hartenstein', ovr: 84, jersey: 55, skin: 0xd99b66, scale: 1.13 }
    ]
  },
  {
    id: 5,
    city: 'Milwaukee',
    name: 'Milwaukee Bucks',
    abbr: 'MIL',
    league: 'nba',
    tier: 1,
    tagline: 'Paint Dominance',
    icon: '🦌',
    jerseyColor: 0x00471b,
    awayJerseyColor: 0xeee1c6,
    cityJerseyColor: 0x111827,
    trimColor: 0xeee1c6,
    accentHex: '#4ade80',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Damian Lillard', ovr: 91, jersey: 0, skin: 0x8d5524, scale: 0.96 },
      { role: 'SG', name: 'Gary Trent Jr.', ovr: 81, jersey: 5, skin: 0x8d5524, scale: 1.0 },
      { role: 'SF', name: 'Kyle Kuzma', ovr: 82, jersey: 18, skin: 0xc68642, scale: 1.06 },
      { role: 'PF', name: 'Giannis Antetokounmpo', ovr: 97, jersey: 34, skin: 0x5c361e, scale: 1.14 },
      { role: 'C', name: 'Brook Lopez', ovr: 83, jersey: 11, skin: 0xe5b887, scale: 1.15 }
    ]
  },
  {
    id: 6,
    city: 'New York',
    name: 'New York Knicks',
    abbr: 'NYK',
    league: 'nba',
    tier: 2,
    tagline: 'Garden Grit & Clutch',
    icon: '🗽',
    jerseyColor: 0x006bb6,
    awayJerseyColor: 0xf58426,
    cityJerseyColor: 0x111827,
    trimColor: 0xf58426,
    accentHex: '#fb923c',
    shootRating: 4,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Jalen Brunson', ovr: 94, jersey: 11, skin: 0x8d5524, scale: 0.95 },
      { role: 'SG', name: 'Mikal Bridges', ovr: 86, jersey: 25, skin: 0x7c4a26, scale: 1.02 },
      { role: 'SF', name: 'OG Anunoby', ovr: 87, jersey: 8, skin: 0x5c361e, scale: 1.05 },
      { role: 'PF', name: 'Josh Hart', ovr: 84, jersey: 3, skin: 0x8d5524, scale: 1.01 },
      { role: 'C', name: 'Karl-Anthony Towns', ovr: 92, jersey: 32, skin: 0xc68642, scale: 1.13 }
    ]
  },
  {
    id: 7,
    city: 'San Antonio',
    name: 'San Antonio Spurs',
    abbr: 'SAS',
    league: 'nba',
    tier: 2,
    tagline: 'Alien Rim Protection',
    icon: '👽',
    jerseyColor: 0x1f2937,
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: 0x0f766e,
    trimColor: 0xc4ced4,
    accentHex: '#cbd5e1',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 5,
    defRating: 5,
    starters: [
      { role: 'PG', name: "De'Aaron Fox", ovr: 90, jersey: 4, skin: 0x7c4a26, scale: 0.97 },
      { role: 'SG', name: 'Stephon Castle', ovr: 83, jersey: 5, skin: 0x8d5524, scale: 1.01 },
      { role: 'SF', name: 'Devin Vassell', ovr: 84, jersey: 24, skin: 0x8d5524, scale: 1.02 },
      { role: 'PF', name: 'Jeremy Sochan', ovr: 81, jersey: 10, skin: 0xc68642, scale: 1.06 },
      { role: 'C', name: 'Victor Wembanyama', ovr: 95, jersey: 1, skin: 0x8d5524, scale: 1.19 }
    ]
  },
  {
    id: 8,
    city: 'Minnesota',
    name: 'Minnesota Timberwolves',
    abbr: 'MIN',
    league: 'nba',
    tier: 2,
    tagline: 'Explosive Ant-Man Slashing',
    icon: '🐺',
    jerseyColor: 0x0c2340,
    awayJerseyColor: 0x236192,
    cityJerseyColor: 0x78be20,
    trimColor: 0x78be20,
    accentHex: '#84cc16',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 5,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Mike Conley', ovr: 82, jersey: 10, skin: 0x8d5524, scale: 0.94 },
      { role: 'SG', name: 'Anthony Edwards', ovr: 95, jersey: 5, skin: 0x6b3e26, scale: 1.01 },
      { role: 'SF', name: 'Jaden McDaniels', ovr: 83, jersey: 3, skin: 0x7c4a26, scale: 1.07 },
      { role: 'PF', name: 'Julius Randle', ovr: 87, jersey: 30, skin: 0x8d5524, scale: 1.07 },
      { role: 'C', name: 'Rudy Gobert', ovr: 87, jersey: 27, skin: 0xc68642, scale: 1.15 }
    ]
  },
  {
    id: 9,
    city: 'Miami',
    name: 'Miami Heat',
    abbr: 'MIA',
    league: 'nba',
    tier: 3,
    tagline: 'Heat Culture Defense',
    icon: '🔥',
    jerseyColor: 0x98002e,
    awayJerseyColor: 0x111827,
    cityJerseyColor: 0x0ea5e9,
    trimColor: 0xf9a01b,
    accentHex: '#f43f5e',
    shootRating: 4,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Tyler Herro', ovr: 88, jersey: 14, skin: 0xf1c27d, scale: 0.99 },
      { role: 'SG', name: 'Terry Rozier', ovr: 81, jersey: 2, skin: 0x7c4a26, scale: 0.96 },
      { role: 'SF', name: 'Andrew Wiggins', ovr: 83, jersey: 22, skin: 0x8d5524, scale: 1.04 },
      { role: 'PF', name: 'Bam Adebayo', ovr: 89, jersey: 13, skin: 0x5c361e, scale: 1.08 },
      { role: 'C', name: "Kel'el Ware", ovr: 80, jersey: 7, skin: 0x7c4a26, scale: 1.13 }
    ]
  },
  // WNBA Squads (Playable in Play Now, The W, Blacktop, and MyTEAM!)
  {
    id: 10,
    city: 'Las Vegas',
    name: 'Las Vegas Aces',
    abbr: 'LVA',
    league: 'wnba',
    tier: 1,
    tagline: 'WNBA Dynasty Trio',
    icon: '♠️',
    jerseyColor: 0x111827,
    awayJerseyColor: 0xc8102e,
    cityJerseyColor: 0x94a3b8,
    trimColor: 0xc8102e,
    accentHex: '#ef4444',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 5,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Chelsea Gray', ovr: 90, jersey: 12, skin: 0x8d5524, scale: 0.94 },
      { role: 'SG', name: 'Jewell Loyd', ovr: 89, jersey: 24, skin: 0x8d5524, scale: 0.95 },
      { role: 'SF', name: 'Jackie Young', ovr: 91, jersey: 0, skin: 0xc68642, scale: 0.97 },
      { role: 'PF', name: "A'ja Wilson", ovr: 98, jersey: 22, skin: 0x6b3e26, scale: 1.04 },
      { role: 'C', name: 'Kiah Stokes', ovr: 80, jersey: 41, skin: 0xc68642, scale: 1.05 }
    ]
  },
  {
    id: 11,
    city: 'New York',
    name: 'New York Liberty',
    abbr: 'NYL',
    league: 'wnba',
    tier: 1,
    tagline: 'Seafoam Shooters',
    icon: '🗽',
    jerseyColor: 0x14b8a6,
    awayJerseyColor: 0x111827,
    cityJerseyColor: 0xf8fafc,
    trimColor: 0x111827,
    accentHex: '#2dd4bf',
    shootRating: 5,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Sabrina Ionescu', ovr: 93, jersey: 20, skin: 0xf1c27d, scale: 0.95 },
      { role: 'SG', name: 'Betnijah Laney', ovr: 85, jersey: 44, skin: 0x8d5524, scale: 0.97 },
      { role: 'SF', name: 'Leonie Fiebich', ovr: 84, jersey: 13, skin: 0xf1c27d, scale: 1.01 },
      { role: 'PF', name: 'Breanna Stewart', ovr: 96, jersey: 30, skin: 0xf1c27d, scale: 1.04 },
      { role: 'C', name: 'Jonquel Jones', ovr: 93, jersey: 35, skin: 0x7c4a26, scale: 1.07 }
    ]
  },
  {
    id: 12,
    city: 'Indiana',
    name: 'Indiana Fever',
    abbr: 'IND',
    league: 'wnba',
    tier: 2,
    tagline: 'Logo 3PT Fast Break',
    icon: '🎯',
    jerseyColor: 0x002d62,
    awayJerseyColor: 0xe03a3e,
    cityJerseyColor: 0xfdb927,
    trimColor: 0xfdb927,
    accentHex: '#facc15',
    shootRating: 5,
    dunkRating: 3,
    speedRating: 5,
    defRating: 4,
    starters: [
      { role: 'PG', name: 'Caitlin Clark', ovr: 94, jersey: 22, skin: 0xf1c27d, scale: 0.96 },
      { role: 'SG', name: 'Kelsey Mitchell', ovr: 89, jersey: 0, skin: 0x7c4a26, scale: 0.93 },
      { role: 'SF', name: 'Lexie Hull', ovr: 81, jersey: 10, skin: 0xf1c27d, scale: 0.97 },
      { role: 'PF', name: 'DeWanna Bonner', ovr: 86, jersey: 24, skin: 0x8d5524, scale: 1.03 },
      { role: 'C', name: 'Aliyah Boston', ovr: 90, jersey: 7, skin: 0x6b3e26, scale: 1.05 }
    ]
  },
  {
    id: 13,
    city: 'Minnesota',
    name: 'Minnesota Lynx',
    abbr: 'MNL',
    league: 'wnba',
    tier: 2,
    tagline: 'Two-Way Defensive Clinic',
    icon: '🐾',
    jerseyColor: 0x1e3a8a,
    awayJerseyColor: 0xf8fafc,
    cityJerseyColor: 0x22c55e,
    trimColor: 0x22c55e,
    accentHex: '#60a5fa',
    shootRating: 4,
    dunkRating: 4,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Courtney Williams', ovr: 85, jersey: 10, skin: 0x8d5524, scale: 0.93 },
      { role: 'SG', name: 'Kayla McBride', ovr: 88, jersey: 21, skin: 0xf1c27d, scale: 0.96 },
      { role: 'SF', name: 'Bridget Carleton', ovr: 83, jersey: 6, skin: 0xf1c27d, scale: 0.98 },
      { role: 'PF', name: 'Napheesa Collier', ovr: 96, jersey: 24, skin: 0xa66e43, scale: 1.01 },
      { role: 'C', name: 'Alanna Smith', ovr: 84, jersey: 8, skin: 0xf1c27d, scale: 1.04 }
    ]
  },
  // Classic & All-Time Era Legends
  {
    id: 14,
    city: 'Chicago',
    name: "'96 Chicago Bulls",
    abbr: 'CHI96',
    league: 'classic',
    eraTag: 'Jordan Era',
    tier: 1,
    tagline: '72-10 Triangle Dynasty',
    icon: '🐂',
    jerseyColor: 0xce1141,
    awayJerseyColor: 0x111827,
    cityJerseyColor: 0xf8fafc,
    trimColor: 0x111827,
    accentHex: '#ef4444',
    shootRating: 5,
    dunkRating: 5,
    speedRating: 5,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Ron Harper', ovr: 85, jersey: 9, skin: 0x7c4a26, scale: 1.0 },
      { role: 'SG', name: 'Michael Jordan', ovr: 99, jersey: 23, skin: 0x7c4a26, scale: 1.03 },
      { role: 'SF', name: 'Scottie Pippen', ovr: 95, jersey: 33, skin: 0x6b3e26, scale: 1.06 },
      { role: 'PF', name: 'Dennis Rodman', ovr: 89, jersey: 91, skin: 0x5c361e, scale: 1.05 },
      { role: 'C', name: 'Luc Longley', ovr: 80, jersey: 13, skin: 0xf1c27d, scale: 1.15 }
    ]
  },
  {
    id: 15,
    city: 'Los Angeles',
    name: "'01 LA Lakers",
    abbr: 'LAL01',
    league: 'classic',
    eraTag: 'Kobe Era',
    tier: 1,
    tagline: '15-1 Playoff Juggernaut',
    icon: '🏆',
    jerseyColor: 0xfdb927,
    awayJerseyColor: 0x552583,
    cityJerseyColor: 0xf8fafc,
    trimColor: 0x552583,
    accentHex: '#fbbf24',
    shootRating: 4,
    dunkRating: 5,
    speedRating: 4,
    defRating: 5,
    starters: [
      { role: 'PG', name: 'Derek Fisher', ovr: 83, jersey: 2, skin: 0x6b3e26, scale: 0.95 },
      { role: 'SG', name: 'Kobe Bryant', ovr: 98, jersey: 8, skin: 0x8d5524, scale: 1.02 },
      { role: 'SF', name: 'Rick Fox', ovr: 81, jersey: 17, skin: 0xc68642, scale: 1.05 },
      { role: 'PF', name: 'Horace Grant', ovr: 82, jersey: 54, skin: 0x6b3e26, scale: 1.08 },
      { role: 'C', name: "Shaquille O'Neal", ovr: 99, jersey: 34, skin: 0x5c361e, scale: 1.18 }
    ]
  }
];

export function getHoops2K26TeamById(id: number): Hoops2K26TeamDef {
  return HOOPS_2K26_TEAMS.find((t) => t.id === id) ?? HOOPS_2K26_TEAMS[0];
}

// ============================================================================
// 6 MyNBA ERAS & PLAY NOW ONLINE TIER LEAGUES
// ============================================================================
export interface HoopsEraDef {
  id: string;
  name: string;
  years: string;
  featuredTeamId: number;
  rivalTeamId: number;
  ruleNote: string;
}

export const HOOPS_ERAS: HoopsEraDef[] = [
  { id: 'magic_bird', name: 'Magic vs. Bird Era', years: '1983–1990', featuredTeamId: 1, rivalTeamId: 0, ruleNote: 'Classic hand-checking & fast Showtime transition.' },
  { id: 'jordan', name: 'Jordan Era', years: '1991–1998', featuredTeamId: 14, rivalTeamId: 6, ruleNote: 'Physical paint battles & iconic Triangle offense.' },
  { id: 'kobe', name: 'Kobe Era', years: '2000–2010', featuredTeamId: 15, rivalTeamId: 7, ruleNote: 'Mid-range iso mastery & dominant twin-tower frontcourts.' },
  { id: 'lebron', name: 'LeBron Era', years: '2011–2015', featuredTeamId: 9, rivalTeamId: 7, ruleNote: 'Superteam pace & early small-ball revolution.' },
  { id: 'steph', name: 'Steph Era', years: '2016–2020', featuredTeamId: 2, rivalTeamId: 1, ruleNote: 'Deep 3PT spacing & switch-everything defenses.' },
  { id: 'modern', name: 'Modern Era', years: '2025–2026', featuredTeamId: 0, rivalTeamId: 4, ruleNote: 'Current 2026 NBA rosters, Play-In & 2nd Apron CBA.' }
];

export const PNO_TIER_LEAGUES = [
  'Freshman',
  'Junior Varsity',
  'Varsity',
  'College',
  'Development',
  'NBA',
  'Greatest of All Time'
] as const;

// ============================================================================
// 40 CANONICAL NBA 2K26 BADGES + BUILD BY BADGES SOLVER
// ============================================================================
export interface HoopsBadgeDef {
  id: string;
  name: string;
  category: HoopsAttrCategory;
  desc: string;
  thresholds: { Bronze: number; Silver: number; Gold: number; HOF: number; Legend: number };
}

export const HOOPS_40_BADGES: HoopsBadgeDef[] = [
  // Finishing (8)
  { id: 'posterizer', name: 'Posterizer', category: 'finishing', desc: 'Boosts contact dunk likelihood over rim protectors.', thresholds: { Bronze: 73, Silver: 82, Gold: 89, HOF: 93, Legend: 96 } },
  { id: 'aerial_wizard', name: 'Aerial Wizard', category: 'finishing', desc: 'Improves alley-oop & putback dunk conversion.', thresholds: { Bronze: 65, Silver: 75, Gold: 84, HOF: 90, Legend: 94 } },
  { id: 'layup_mixmaster', name: 'Layup Mixmaster', category: 'finishing', desc: 'Boosts euro-steps, hop steps, floaters & scoop layups.', thresholds: { Bronze: 70, Silver: 80, Gold: 87, HOF: 92, Legend: 96 } },
  { id: 'physical_finisher', name: 'Physical Finisher', category: 'finishing', desc: 'Absorbs contact cleanly on driving layups.', thresholds: { Bronze: 72, Silver: 81, Gold: 88, HOF: 93, Legend: 97 } },
  { id: 'paint_prodigy', name: 'Paint Prodigy', category: 'finishing', desc: 'Speeds up standing layups & close shots inside.', thresholds: { Bronze: 68, Silver: 78, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'rise_up', name: 'Rise Up', category: 'finishing', desc: 'Triggers explosive standing dunks in the paint.', thresholds: { Bronze: 72, Silver: 81, Gold: 90, HOF: 95, Legend: 98 } },
  { id: 'post_powerhouse', name: 'Post Powerhouse', category: 'finishing', desc: 'Strengthens backdowns and dropsteps near the rim.', thresholds: { Bronze: 68, Silver: 78, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'hook_specialist', name: 'Hook Specialist', category: 'finishing', desc: 'Widens green window on post hooks.', thresholds: { Bronze: 65, Silver: 75, Gold: 84, HOF: 90, Legend: 95 } },
  // Shooting (8)
  { id: 'deadeye', name: 'Deadeye', category: 'shooting', desc: 'Reduces late defensive closeout contest penalties.', thresholds: { Bronze: 75, Silver: 83, Gold: 90, HOF: 94, Legend: 97 } },
  { id: 'limitless_range', name: 'Limitless Range', category: 'shooting', desc: 'Extends green window deep beyond the 3PT arc.', thresholds: { Bronze: 78, Silver: 85, Gold: 91, HOF: 95, Legend: 99 } },
  { id: 'set_shot_specialist', name: 'Set Shot Specialist', category: 'shooting', desc: 'Major green boost on catch-and-shoot stand-still jumpers.', thresholds: { Bronze: 70, Silver: 78, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'shifty_shooter', name: 'Shifty Shooter', category: 'shooting', desc: 'Boosts off-dribble stepbacks, fades & hop jumpers.', thresholds: { Bronze: 73, Silver: 82, Gold: 89, HOF: 93, Legend: 97 } },
  { id: 'mini_marksman', name: 'Mini Marksman', category: 'shooting', desc: 'Boosts jumpers over taller defenders.', thresholds: { Bronze: 72, Silver: 80, Gold: 87, HOF: 92, Legend: 96 } },
  { id: 'post_fade_phenom', name: 'Post Fade Phenom', category: 'shooting', desc: 'Improves post fadeaways & hop shots.', thresholds: { Bronze: 68, Silver: 77, Gold: 85, HOF: 91, Legend: 95 } },
  { id: 'slippery_off_ball', name: 'Slippery Off-Ball', category: 'shooting', desc: 'Helps navigate screens to get open for catch-and-shoot.', thresholds: { Bronze: 66, Silver: 75, Gold: 83, HOF: 89, Legend: 94 } },
  { id: 'clutch_shooter', name: 'Clutch Shooter', category: 'shooting', desc: 'Huge green boost in final minutes & game-point possessions.', thresholds: { Bronze: 70, Silver: 79, Gold: 86, HOF: 92, Legend: 96 } },
  // Playmaking (8)
  { id: 'ankle_assassin', name: 'Ankle Assassin', category: 'playmaking', desc: 'Triggers defender stumbles on breakdown dribble combos.', thresholds: { Bronze: 72, Silver: 81, Gold: 88, HOF: 93, Legend: 96 } },
  { id: 'handles_for_days', name: 'Handles for Days', category: 'playmaking', desc: 'Reduces stamina & adrenaline drain during dribble chains.', thresholds: { Bronze: 75, Silver: 84, Gold: 90, HOF: 94, Legend: 97 } },
  { id: 'lightning_launch', name: 'Lightning Launch', category: 'playmaking', desc: 'Speeds up first-step blow-by launches out of triple threat.', thresholds: { Bronze: 74, Silver: 83, Gold: 89, HOF: 94, Legend: 97 } },
  { id: 'unpluckable', name: 'Unpluckable', category: 'playmaking', desc: 'Protects the ball against reach-in steal attempts.', thresholds: { Bronze: 70, Silver: 80, Gold: 88, HOF: 93, Legend: 96 } },
  { id: 'dimer', name: 'Dimer', category: 'playmaking', desc: 'Grants a shooting green boost to open teammates off your pass.', thresholds: { Bronze: 68, Silver: 78, Gold: 85, HOF: 91, Legend: 95 } },
  { id: 'versatile_visionary', name: 'Versatile Visionary', category: 'playmaking', desc: 'Threads tight-window & alley-oop passes past defenders.', thresholds: { Bronze: 71, Silver: 80, Gold: 87, HOF: 92, Legend: 96 } },
  { id: 'break_starter', name: 'Break Starter', category: 'playmaking', desc: 'Improves full-court outlet pass accuracy after rebounds.', thresholds: { Bronze: 65, Silver: 75, Gold: 83, HOF: 89, Legend: 94 } },
  { id: 'bail_out', name: 'Bail Out', category: 'playmaking', desc: 'Allows clean mid-air kickout passes out of jump shots.', thresholds: { Bronze: 75, Silver: 83, Gold: 89, HOF: 93, Legend: 97 } },
  // Defense (8)
  { id: 'challenger', name: 'Challenger', category: 'defense', desc: 'Increases perimeter shot contest impact on jump shooters.', thresholds: { Bronze: 74, Silver: 82, Gold: 89, HOF: 94, Legend: 97 } },
  { id: 'on_ball_menace', name: 'On-Ball Menace', category: 'defense', desc: 'Triggers tight hip-ride bumps & drains ball-handler adrenaline.', thresholds: { Bronze: 72, Silver: 81, Gold: 88, HOF: 93, Legend: 97 } },
  { id: 'glove', name: 'Glove', category: 'defense', desc: 'Boosts on-ball steal success without fouling.', thresholds: { Bronze: 73, Silver: 82, Gold: 89, HOF: 94, Legend: 97 } },
  { id: 'interceptor', name: 'Interceptor', category: 'defense', desc: 'Improves passing-lane tips and deflections.', thresholds: { Bronze: 70, Silver: 79, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'paint_patroller', name: 'Paint Patroller', category: 'defense', desc: 'Boosts rim-protection contests and block windows.', thresholds: { Bronze: 74, Silver: 82, Gold: 89, HOF: 94, Legend: 97 } },
  { id: 'high_flying_denier', name: 'High-Flying Denier', category: 'defense', desc: 'Speeds up chase-down block leaps in transition.', thresholds: { Bronze: 68, Silver: 78, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'pick_dodger', name: 'Pick Dodger', category: 'defense', desc: 'Slips cleanly around ball screens on the perimeter.', thresholds: { Bronze: 70, Silver: 79, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'post_lockdown', name: 'Post Lockdown', category: 'defense', desc: 'Resists post backdowns and strips post spinners.', thresholds: { Bronze: 70, Silver: 79, Gold: 86, HOF: 91, Legend: 95 } },
  // Rebounding (4)
  { id: 'rebound_chaser', name: 'Rebound Chaser', category: 'rebounding', desc: 'Expands rebound tracking range & leap timing.', thresholds: { Bronze: 72, Silver: 81, Gold: 89, HOF: 94, Legend: 97 } },
  { id: 'boxout_beast', name: 'Boxout Beast', category: 'rebounding', desc: 'Holds paint boxout position and triggers swim moves.', thresholds: { Bronze: 70, Silver: 79, Gold: 87, HOF: 92, Legend: 96 } },
  { id: 'pogo_stick', name: 'Pogo Stick', category: 'rebounding', desc: 'Recovers quickly for consecutive jumps & tip-ins.', thresholds: { Bronze: 68, Silver: 77, Gold: 85, HOF: 91, Legend: 95 } },
  { id: 'glass_cleaner', name: 'Glass Cleaner', category: 'rebounding', desc: 'Secures contested defensive rebounds in traffic.', thresholds: { Bronze: 66, Silver: 76, Gold: 84, HOF: 90, Legend: 95 } },
  // Physicals (4)
  { id: 'immovable_enforcer', name: 'Immovable Enforcer', category: 'physicals', desc: 'Uses Strength to halt driving slashers cold.', thresholds: { Bronze: 72, Silver: 82, Gold: 89, HOF: 93, Legend: 97 } },
  { id: 'brick_wall', name: 'Brick Wall', category: 'physicals', desc: 'Sets bone-rattling screens that drain defender stamina.', thresholds: { Bronze: 70, Silver: 80, Gold: 88, HOF: 93, Legend: 96 } },
  { id: 'strong_handle', name: 'Strong Handle', category: 'physicals', desc: 'Powers through perimeter bumps while dribbling.', thresholds: { Bronze: 70, Silver: 79, Gold: 86, HOF: 92, Legend: 96 } },
  { id: 'tireless_motor', name: 'Tireless Motor', category: 'physicals', desc: 'Conserves Turbo stamina across 5m/12m quarters.', thresholds: { Bronze: 68, Silver: 78, Gold: 86, HOF: 91, Legend: 95 } }
];

export interface MyPlayerAttributes {
  finishing: number; // 40..99
  shooting: number;
  playmaking: number;
  defense: number;
  rebounding: number;
  physicals: number;
}

export function computeBuilderAttributeCaps(
  position: HoopsPosition,
  heightIn: number,
  weightLb: number,
  wingspanIn: number
): MyPlayerAttributes {
  const hDelta = heightIn - 76; // 76" = 6'4"
  const wDelta = (weightLb - 205) / 25;
  const wsDelta = wingspanIn - heightIn; // positive = longer arms
  const posBias: Record<HoopsPosition, MyPlayerAttributes> = {
    PG: { finishing: 90, shooting: 99, playmaking: 99, defense: 93, rebounding: 78, physicals: 95 },
    SG: { finishing: 94, shooting: 98, playmaking: 95, defense: 95, rebounding: 82, physicals: 95 },
    SF: { finishing: 96, shooting: 94, playmaking: 91, defense: 97, rebounding: 89, physicals: 96 },
    PF: { finishing: 98, shooting: 90, playmaking: 86, defense: 97, rebounding: 96, physicals: 97 },
    C: { finishing: 99, shooting: 86, playmaking: 82, defense: 98, rebounding: 99, physicals: 96 }
  };
  const base = posBias[position];
  const clamp = (v: number) => Math.max(65, Math.min(99, Math.round(v)));
  return {
    finishing: clamp(base.finishing + hDelta * 0.6 + wsDelta * 0.8),
    shooting: clamp(base.shooting - Math.max(0, hDelta) * 0.7 - wsDelta * 0.9),
    playmaking: clamp(base.playmaking - Math.max(0, hDelta) * 1.1 - wDelta * 1.2),
    defense: clamp(base.defense + wsDelta * 0.9),
    rebounding: clamp(base.rebounding + hDelta * 1.1 + wsDelta * 0.8 + wDelta * 1.2),
    physicals: clamp(base.physicals + wDelta * 0.8 - Math.max(0, hDelta - 6) * 0.6)
  };
}

export function getBadgeTierForValue(badge: HoopsBadgeDef, value: number): HoopsBadgeTier {
  if (value >= badge.thresholds.Legend) return 'Legend';
  if (value >= badge.thresholds.HOF) return 'HOF';
  if (value >= badge.thresholds.Gold) return 'Gold';
  if (value >= badge.thresholds.Silver) return 'Silver';
  if (value >= badge.thresholds.Bronze) return 'Bronze';
  return 'None';
}

export function computeUnlockedBadges(attrs: MyPlayerAttributes): Array<{ badge: HoopsBadgeDef; tier: HoopsBadgeTier }> {
  return HOOPS_40_BADGES.map((badge) => ({
    badge,
    tier: getBadgeTierForValue(badge, attrs[badge.category])
  }));
}

/**
 * NBA 2K26 "Build By Badges" solver: raises the exact minimum attributes required
 * to unlock the user's requested badge tiers within their vitals caps and point budget.
 */
export function solveBuildByBadges(
  targets: Partial<Record<string, Exclude<HoopsBadgeTier, 'None'>>>,
  currentAttrs: MyPlayerAttributes,
  caps: MyPlayerAttributes,
  maxTotalPoints = 516
): { nextAttrs: MyPlayerAttributes; fulfilledCount: number; totalRequested: number } {
  const next: MyPlayerAttributes = { ...currentAttrs };
  let totalRequested = 0;
  let fulfilledCount = 0;

  for (const [badgeId, desiredTier] of Object.entries(targets)) {
    if (!desiredTier) continue;
    const badge = HOOPS_40_BADGES.find((b) => b.id === badgeId);
    if (!badge) continue;
    totalRequested++;
    const needed = badge.thresholds[desiredTier];
    const cap = caps[badge.category];
    const targetVal = Math.min(cap, needed);
    if (next[badge.category] < targetVal) {
      next[badge.category] = targetVal;
    }
    if (next[badge.category] >= needed) {
      fulfilledCount++;
    }
  }

  // Rebalance softly if sum exceeds budget while preserving requested categories first
  const cats: HoopsAttrCategory[] = ['finishing', 'shooting', 'playmaking', 'defense', 'rebounding', 'physicals'];
  const sum = () => cats.reduce((acc, c) => acc + next[c], 0);
  const lockedCats = new Set(
    Object.keys(targets)
      .map((id) => HOOPS_40_BADGES.find((b) => b.id === id)?.category)
      .filter((c): c is HoopsAttrCategory => Boolean(c))
  );
  let guard = 0;
  while (sum() > maxTotalPoints && guard < 200) {
    guard++;
    const reducible = cats.filter((c) => !lockedCats.has(c) && next[c] > 45);
    const pool = reducible.length > 0 ? reducible : cats.filter((c) => next[c] > 45);
    if (pool.length === 0) break;
    pool.sort((a, b) => next[b] - next[a]);
    next[pool[0]] -= 1;
  }

  return { nextAttrs: next, fulfilledCount, totalRequested };
}

export function computeOverallFromAttributes(attrs: MyPlayerAttributes, capBreakers = 0): number {
  const avg =
    (attrs.finishing + attrs.shooting + attrs.playmaking + attrs.defense + attrs.rebounding + attrs.physicals) / 6;
  return Math.max(60, Math.min(99, Math.round(avg + Math.min(5, capBreakers * 0.6))));
}

export function evaluateMyPlayerScoutingReport(
  position: HoopsPosition,
  attrs: MyPlayerAttributes
): {
  archetypeName: string;
  nbaComps: [string, string, string];
  strengths: string[];
  weaknesses: string[];
} {
  const entries: Array<[HoopsAttrCategory, number]> = [
    ['finishing', attrs.finishing],
    ['shooting', attrs.shooting],
    ['playmaking', attrs.playmaking],
    ['defense', attrs.defense],
    ['rebounding', attrs.rebounding],
    ['physicals', attrs.physicals]
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const top1 = entries[0][0];
  const top2 = entries[1][0];
  const isTwoWay = attrs.defense >= 85;

  let archetypeName = '3-Level Threat';
  let nbaComps: [string, string, string] = ['Jayson Tatum', 'Shai Gilgeous-Alexander', 'Jaylen Brown'];

  if (top1 === 'shooting' && top2 === 'playmaking') {
    archetypeName = isTwoWay ? '2-Way Shot-Creating Playmaker' : '3PT Shot Hunter';
    nbaComps = ['Stephen Curry', 'Luka Doncic', 'Caitlin Clark'];
  } else if (top1 === 'finishing' && attrs.defense >= 84) {
    archetypeName = '2-Way Inside-Out Slasher';
    nbaComps = ['Anthony Edwards', 'Giannis Antetokounmpo', 'Michael Jordan'];
  } else if (top1 === 'defense' && attrs.shooting >= 84) {
    archetypeName = '3&D Lockdown Wing';
    nbaComps = ['OG Anunoby', 'Mikal Bridges', 'Napheesa Collier'];
  } else if (position === 'C' || top1 === 'rebounding') {
    archetypeName = attrs.shooting >= 80 ? 'Diming Stretch Rim Protector' : 'Interior Paint Beast';
    nbaComps = ['Nikola Jokic', 'Victor Wembanyama', "A'ja Wilson"];
  } else if (top1 === 'playmaking') {
    archetypeName = isTwoWay ? '2-Way Floor General' : 'Playmaking Maestro';
    nbaComps = ['Jalen Brunson', 'Chelsea Gray', "De'Aaron Fox"];
  }

  const labels: Record<HoopsAttrCategory, string> = {
    finishing: 'Elite Rim Finishing',
    shooting: 'Deep 3PT Shotmaking',
    playmaking: 'Ball Handling & Passing',
    defense: 'Lockdown Perimeter/Rim D',
    rebounding: 'Glass Control',
    physicals: 'Explosive Athleticism'
  };
  return {
    archetypeName,
    nbaComps,
    strengths: [labels[entries[0][0]], labels[entries[1][0]]],
    weaknesses: [labels[entries[5][0]]]
  };
}

export interface HoopsAnimationGlossaryItem {
  id: string;
  name: string;
  kind: 'Jump Shot' | 'Dribble Style' | 'Dunk Package' | 'Layup Style' | 'Motion Style';
  reqCategory: HoopsAttrCategory;
  reqValue: number;
  maxHeightIn?: number;
  minHeightIn?: number;
}

export const HOOPS_ANIMATION_GLOSSARY: HoopsAnimationGlossaryItem[] = [
  { id: 'js_curry', name: 'Stephen Curry Base', kind: 'Jump Shot', reqCategory: 'shooting', reqValue: 92, maxHeightIn: 76 },
  { id: 'js_tmac', name: 'Tracy McGrady Base', kind: 'Jump Shot', reqCategory: 'shooting', reqValue: 87, minHeightIn: 77 },
  { id: 'js_clark', name: 'Caitlin Clark Quick', kind: 'Jump Shot', reqCategory: 'shooting', reqValue: 89, maxHeightIn: 78 },
  { id: 'js_jokic', name: 'Nikola Jokic High-Arc', kind: 'Jump Shot', reqCategory: 'shooting', reqValue: 80, minHeightIn: 81 },
  { id: 'dr_kyrie', name: 'Kyrie Irving Dribble', kind: 'Dribble Style', reqCategory: 'playmaking', reqValue: 90, maxHeightIn: 76 },
  { id: 'dr_sga', name: 'Shai Gilgeous-Alexander', kind: 'Dribble Style', reqCategory: 'playmaking', reqValue: 85, maxHeightIn: 79 },
  { id: 'dk_pro_contacts', name: 'Pro Contact Dunks', kind: 'Dunk Package', reqCategory: 'finishing', reqValue: 87 },
  { id: 'dk_elite_contacts', name: 'Elite Contact Dunks', kind: 'Dunk Package', reqCategory: 'finishing', reqValue: 93 },
  { id: 'ly_lebron', name: 'LeBron James Bully Layup', kind: 'Layup Style', reqCategory: 'finishing', reqValue: 84 },
  { id: 'mo_caruso', name: 'Alex Caruso Motion Style', kind: 'Motion Style', reqCategory: 'defense', reqValue: 82 }
];

export interface HoopsBuilderTemplate {
  id: string;
  path: 'nba_template' | 'community' | 'pro_tuned';
  name: string;
  subtitle: string;
  position: HoopsPosition;
  heightIn: number;
  weightLb: number;
  wingspanIn: number;
  bodyType: HoopsBodyType;
  attrs: MyPlayerAttributes;
}

export const HOOPS_BUILDER_TEMPLATES: HoopsBuilderTemplate[] = [
  {
    id: 'tpl_sga',
    path: 'nba_template',
    name: 'Shai 2-Way Iso Guard',
    subtitle: 'NBA Template · PG 6\'6"',
    position: 'PG',
    heightIn: 78,
    weightLb: 195,
    wingspanIn: 83,
    bodyType: 'Lean',
    attrs: { finishing: 89, shooting: 88, playmaking: 92, defense: 87, rebounding: 68, physicals: 90 }
  },
  {
    id: 'tpl_curry',
    path: 'nba_template',
    name: 'Chef Limitless Sniper',
    subtitle: 'NBA Template · PG 6\'2"',
    position: 'PG',
    heightIn: 74,
    weightLb: 185,
    wingspanIn: 76,
    bodyType: 'Compact',
    attrs: { finishing: 78, shooting: 99, playmaking: 95, defense: 78, rebounding: 62, physicals: 88 }
  },
  {
    id: 'tpl_tatum',
    path: 'pro_tuned',
    name: '3-Level Championship Wing',
    subtitle: 'Pro-Tuned · SF 6\'8"',
    position: 'SF',
    heightIn: 80,
    weightLb: 215,
    wingspanIn: 83,
    bodyType: 'Defined',
    attrs: { finishing: 90, shooting: 90, playmaking: 84, defense: 88, rebounding: 82, physicals: 86 }
  },
  {
    id: 'tpl_wemby',
    path: 'community',
    name: 'Meta Stretch Rim Alien',
    subtitle: 'Community Meta · C 7\'1"',
    position: 'C',
    heightIn: 85,
    weightLb: 235,
    wingspanIn: 91,
    bodyType: 'Lean',
    attrs: { finishing: 91, shooting: 84, playmaking: 76, defense: 95, rebounding: 93, physicals: 82 }
  },
  {
    id: 'tpl_aja',
    path: 'nba_template',
    name: "A'ja Two-Way Paint Queen",
    subtitle: 'WNBA Template · PF 6\'5"',
    position: 'PF',
    heightIn: 77,
    weightLb: 205,
    wingspanIn: 82,
    bodyType: 'Solid',
    attrs: { finishing: 94, shooting: 83, playmaking: 78, defense: 94, rebounding: 94, physicals: 88 }
  },
  {
    id: 'tpl_lock',
    path: 'community',
    name: 'REC Perimeter Lockdown',
    subtitle: 'Community Meta · SG 6\'6"',
    position: 'SG',
    heightIn: 78,
    weightLb: 210,
    wingspanIn: 84,
    bodyType: 'Defined',
    attrs: { finishing: 84, shooting: 87, playmaking: 78, defense: 96, rebounding: 78, physicals: 92 }
  }
];

// ============================================================================
// 44 TAKEOVERS + 11 TAKEOVER ABILITIES
// ============================================================================
export interface HoopsTakeoverAbilityDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const HOOPS_TAKEOVER_ABILITIES: HoopsTakeoverAbilityDef[] = [
  { id: 'deep_bomber', name: 'Deep Bomber', icon: '🎯', desc: 'Expands 3PT Green Window massively from logo range.' },
  { id: 'poster_machine', name: 'Poster Machine', icon: '💥', desc: 'Boosts contact dunk triggers & vertical explosiveness.' },
  { id: 'blur', name: 'Blur', icon: '⚡', desc: 'Adds electric speed-boost blow-bys and zero dribble stall.' },
  { id: 'lockdown_clamp', name: 'Perimeter Clamps', icon: '🔒', desc: 'Heavy shot contests + instant steal strip boost.' },
  { id: 'glass_magnet', name: 'Glass Magnet', icon: '🧲', desc: 'Shows rebound landing indicator & super boxout.' },
  { id: 'maestro_pass', name: 'Floor Maestro', icon: '🧠', desc: 'Passes grant teammates automatic Green Window surge.' },
  { id: 'rim_eraser', name: 'Rim Eraser', icon: '🖐️', desc: 'Massive paint block & snatch-block leap window.' },
  { id: 'post_bully', name: 'Post Bully', icon: '🐂', desc: 'Unstoppable post spins, fades, and dropsteps.' },
  { id: 'clutch_gene', name: 'Clutch Gene', icon: '❄️', desc: 'Maxes green stability & immune to crowd/fatigue.' },
  { id: 'two_way_spark', name: 'Two-Way Spark', icon: '🔥', desc: 'Big defensive stop grants +18% next-shot Green Boost.' },
  { id: 'custom_takeover', name: 'Custom Takeover', icon: '👑', desc: 'Final mastery: combines your top 3 stats + any ability.' }
];

export interface HoopsTakeoverDef {
  id: string;
  name: string;
  abilityId: string;
  boosts: string;
  primaryCat: HoopsAttrCategory;
}

export const HOOPS_TAKEOVERS: HoopsTakeoverDef[] = [
  { id: 'tk_sharpshooter', name: 'Sharpshooter', abilityId: 'deep_bomber', boosts: '+10 3PT · +8 Mid', primaryCat: 'shooting' },
  { id: 'tk_chef', name: 'Chef', abilityId: 'deep_bomber', boosts: '+12 Deep 3PT · +6 Speed', primaryCat: 'shooting' },
  { id: 'tk_satellite', name: 'Satellite', abilityId: 'deep_bomber', boosts: '+10 3PT · +8 Off-Dribble', primaryCat: 'shooting' },
  { id: 'tk_spot_up', name: 'Spot-Up Sniper', abilityId: 'deep_bomber', boosts: '+11 Catch & Shoot', primaryCat: 'shooting' },
  { id: 'tk_slice', name: 'Slice', abilityId: 'poster_machine', boosts: '+10 Driving Dunk · +8 Speed', primaryCat: 'finishing' },
  { id: 'tk_slashing', name: 'Slashing Take', abilityId: 'poster_machine', boosts: '+11 Dunk · +7 Layup', primaryCat: 'finishing' },
  { id: 'tk_finisher', name: 'Acrobatic Finisher', abilityId: 'poster_machine', boosts: '+10 Layup · +8 Vertical', primaryCat: 'finishing' },
  { id: 'tk_skywalker', name: 'Skywalker', abilityId: 'poster_machine', boosts: '+12 Vertical · +9 Dunk', primaryCat: 'finishing' },
  { id: 'tk_speedster', name: 'Speedster', abilityId: 'blur', boosts: '+10 Speed w/ Ball · +8 Handle', primaryCat: 'playmaking' },
  { id: 'tk_ankle_taker', name: 'Ankle Taker', abilityId: 'blur', boosts: '+12 Ball Handle · +7 Accel', primaryCat: 'playmaking' },
  { id: 'tk_iso_savant', name: 'Iso Savant', abilityId: 'blur', boosts: '+9 Handle · +9 Mid-Range', primaryCat: 'playmaking' },
  { id: 'tk_general', name: 'Floor General', abilityId: 'maestro_pass', boosts: '+12 Pass Acc · +7 Vision', primaryCat: 'playmaking' },
  { id: 'tk_dimer', name: 'Playmaker Pro', abilityId: 'maestro_pass', boosts: '+10 Pass · +8 Ball Handle', primaryCat: 'playmaking' },
  { id: 'tk_clamps', name: 'Lockdown Defender', abilityId: 'lockdown_clamp', boosts: '+12 Perim D · +9 Steal', primaryCat: 'defense' },
  { id: 'tk_3nd', name: '3&D Menace', abilityId: 'lockdown_clamp', boosts: '+9 Perim D · +8 3PT', primaryCat: 'defense' },
  { id: 'tk_hawk', name: 'Ball Hawk', abilityId: 'lockdown_clamp', boosts: '+12 Steal · +8 Speed', primaryCat: 'defense' },
  { id: 'tk_eraser', name: 'Paint Protector', abilityId: 'rim_eraser', boosts: '+12 Block · +9 Interior D', primaryCat: 'defense' },
  { id: 'tk_anchor', name: 'Defensive Anchor', abilityId: 'rim_eraser', boosts: '+10 Interior D · +9 Rebound', primaryCat: 'defense' },
  { id: 'tk_glass', name: 'Glass Cleaner', abilityId: 'glass_magnet', boosts: '+12 Def Reb · +10 Off Reb', primaryCat: 'rebounding' },
  { id: 'tk_board_beast', name: 'Board Beast', abilityId: 'glass_magnet', boosts: '+10 Reb · +10 Strength', primaryCat: 'rebounding' },
  { id: 'tk_bully', name: 'Post Scorer', abilityId: 'post_bully', boosts: '+12 Post Control · +9 Strength', primaryCat: 'finishing' },
  { id: 'tk_dream', name: 'Dream Shake', abilityId: 'post_bully', boosts: '+11 Post Fade · +8 Close Shot', primaryCat: 'shooting' },
  { id: 'tk_mamba', name: 'Mamba Mentality', abilityId: 'clutch_gene', boosts: '+9 Shooting · +9 Finishing', primaryCat: 'shooting' },
  { id: 'tk_ice', name: 'Ice in Veins', abilityId: 'clutch_gene', boosts: '+12 Clutch 3PT · +8 FT', primaryCat: 'shooting' },
  { id: 'tk_twoway', name: 'Two-Way Star', abilityId: 'two_way_spark', boosts: '+8 Defense · +8 Offense', primaryCat: 'defense' },
  { id: 'tk_custom', name: 'Custom Takeover', abilityId: 'custom_takeover', boosts: 'Custom Mixed Attributes', primaryCat: 'physicals' }
];

// ============================================================================
// 6 PROGRESSION LADDERS (REP 20, CREW 30, PLATE 5, BUILD SPEC 5x9, SEASON 40)
// ============================================================================
export interface HoopsRepTierDef {
  idx: number;
  label: string;
  xpReq: number;
  reward: string;
  capBreakers?: number;
  perk?: 'two_way_tenacity' | 'recharge' | 'heat_check' | 'unlimited_boosts';
}

export const HOOPS_REP_TIERS: HoopsRepTierDef[] = [
  { idx: 0, label: 'Rookie I', xpReq: 0, reward: 'The City Access' },
  { idx: 1, label: 'Rookie II', xpReq: 400, reward: 'City Emotes & Intro Pack' },
  { idx: 2, label: 'Rookie III', xpReq: 900, reward: '30x Gatorade + 60x Skill Boosts' },
  { idx: 3, label: 'Rookie IV', xpReq: 1500, reward: 'Shirtless City + Purple Northern Lights MyCOURT Mural' },
  { idx: 4, label: 'Rookie V', xpReq: 2300, reward: '+1 Cap Breaker + Extra Practice Drills', capBreakers: 1 },
  { idx: 5, label: 'Starter I', xpReq: 3400, reward: 'Two-Way Tenacity Booster', perk: 'two_way_tenacity' },
  { idx: 6, label: 'Starter II', xpReq: 4800, reward: 'Recharge Adrenaline Booster + 60x Gatorade', perk: 'recharge' },
  { idx: 7, label: 'Starter III', xpReq: 6500, reward: '120x Skill Boosts + City Banner' },
  { idx: 8, label: 'Starter IV', xpReq: 8500, reward: 'Signature Animation Library Unlock' },
  { idx: 9, label: 'Starter V', xpReq: 11000, reward: '+3 Cap Breakers + Badge Accelerator', capBreakers: 3 },
  { idx: 10, label: 'Veteran I', xpReq: 14000, reward: 'Heat Check Booster + Veteran Daily Rewards', perk: 'heat_check' },
  { idx: 11, label: 'Veteran II', xpReq: 18000, reward: '25% Off All MyPLAYER Apparel' },
  { idx: 12, label: 'Veteran III', xpReq: 22500, reward: 'Metallic Body Mods + Crew Flair' },
  { idx: 13, label: 'Veteran IV', xpReq: 28000, reward: '100,000 VC + Mega Boost Bundle' },
  { idx: 14, label: 'Veteran V', xpReq: 35000, reward: '150,000 VC + Prestige Aura' },
  { idx: 15, label: 'Legend I', xpReq: 44000, reward: '+3 Cap Breakers + FREE Maxed Build', capBreakers: 3 },
  { idx: 16, label: 'Legend II', xpReq: 55000, reward: 'UNLIMITED Skill Boosts + 250,000 VC', perk: 'unlimited_boosts' },
  { idx: 17, label: 'Legend III', xpReq: 68000, reward: 'UNLIMITED Gatorade + 500,000 VC', perk: 'unlimited_boosts' },
  { idx: 18, label: 'Legend IV', xpReq: 84000, reward: '1,000,000 VC + Hall of Fame Crown' },
  { idx: 19, label: 'Legend V', xpReq: 100000, reward: 'Ultimate Legend V Prestige Status' }
];

export function getRepTierForXp(repXp: number): { tier: HoopsRepTierDef; nextTier: HoopsRepTierDef | null; pct: number } {
  let cur = HOOPS_REP_TIERS[0];
  for (const t of HOOPS_REP_TIERS) {
    if (repXp >= t.xpReq) cur = t;
  }
  const next = HOOPS_REP_TIERS[cur.idx + 1] ?? null;
  const pct = next ? Math.min(100, Math.round(((repXp - cur.xpReq) / Math.max(1, next.xpReq - cur.xpReq)) * 100)) : 100;
  return { tier: cur, nextTier: next, pct };
}

export function getCrewBonusesForLevel(level: number): { repBonusPct: number; vcBonusPct: number; capBreakers: number; maxPlusOnes: number; rewardLabel: string } {
  const lv = Math.max(1, Math.min(30, Math.floor(level)));
  const repBonusPct = lv >= 28 ? 100 : lv >= 24 ? 50 : lv >= 19 ? 25 : lv >= 12 ? 10 : lv >= 6 ? 5 : 0;
  const vcBonusPct = lv >= 25 ? 50 : lv >= 20 ? 25 : lv >= 13 ? 10 : lv >= 7 ? 5 : 0;
  const capBreakers = (lv >= 8 ? 1 : 0) + (lv >= 15 ? 1 : 0) + (lv >= 22 ? 1 : 0) + (lv >= 30 ? 1 : 0);
  const maxPlusOnes = (lv >= 14 ? 1 : 0) + (lv >= 23 ? 1 : 0);
  const rewardLabel =
    lv >= 30
      ? '+1 Cap Breaker (4 Total)'
      : lv >= 28
        ? '2X REP Bonus (+100%) w/ Crew'
        : lv >= 26
          ? 'Free Unlimited Park Boosts'
          : lv >= 23
            ? 'Max +1 Tier 2 Badge Slot'
            : lv >= 19
              ? '+25% Crew REP/VC'
              : lv >= 8
                ? '+1 Cap Breaker Unlocked'
                : 'Crew Look Outfits & Teammotes';
  return { repBonusPct, vcBonusPct, capBreakers, maxPlusOnes, rewardLabel };
}

export interface HoopsPlateTierDef {
  id: 'casual' | 'hooper' | 'baller' | 'pro' | 'mvp';
  label: string;
  colorName: string;
  hex: string;
  minScore: number;
}

export const HOOPS_PLATE_TIERS: HoopsPlateTierDef[] = [
  { id: 'casual', label: 'Casual', colorName: 'Black Plate', hex: '#334155', minScore: 0 },
  { id: 'hooper', label: 'Hooper', colorName: 'Bronze Plate', hex: '#b45309', minScore: 200 },
  { id: 'baller', label: 'Baller', colorName: 'Silver Plate', hex: '#94a3b8', minScore: 420 },
  { id: 'pro', label: 'Pro', colorName: 'Gold Plate', hex: '#eab308', minScore: 660 },
  { id: 'mvp', label: 'MVP', colorName: 'Purple Plate', hex: '#a855f7', minScore: 860 }
];

export function getPlateTierForScore(score: number): HoopsPlateTierDef {
  let res = HOOPS_PLATE_TIERS[0];
  for (const p of HOOPS_PLATE_TIERS) {
    if (score >= p.minScore) res = p;
  }
  return res;
}

export const HOOPS_BUILD_SPECIALIZATIONS: Array<{
  id: HoopsAttrCategory;
  name: string;
  goalLabel: string;
  reward: string;
}> = [
  { id: 'finishing', name: 'Finishing Mastery', goalLabel: 'Score 90 dunks/layups across 9 stages', reward: '+1 Finishing Cap Breaker & Rim Badge Max' },
  { id: 'shooting', name: 'Shooting Mastery', goalLabel: 'Hit 90 Green 3PT shots across 9 stages', reward: '+1 Shooting Cap Breaker & Lethal Boost' },
  { id: 'playmaking', name: 'Playmaking Mastery', goalLabel: 'Dish 90 assists across 9 stages', reward: '+1 Playmaking Cap Breaker & Dimer Max' },
  { id: 'defense', name: 'Defense Mastery', goalLabel: 'Log 90 steals/blocks across 9 stages', reward: '+1 Defense Cap Breaker & Clamps Max' },
  { id: 'rebounding', name: 'Rebounding Mastery', goalLabel: 'Grab 90 rebounds across 9 stages', reward: '+1 Rebounding Cap Breaker & Glass Max' }
];

// ============================================================================
// THE CITY — WALKABLE 3D PLAZA BLUEPRINT & FARMING TIMERS
// ============================================================================
export type HoopsCityLocationKind = 'court' | 'store' | 'farming' | 'gym' | 'mycourt';

export interface HoopsCityLocationDef {
  id: string;
  name: string;
  shortName: string;
  perimeter: 'central' | 'north' | 'west' | 'east' | 'south';
  kind: HoopsCityLocationKind;
  x: number;
  z: number;
  color: number;
  accentHex: string;
  icon: string;
  difficultyLabel: string;
  formatLabel: string;
  resetTimerLabel: string;
  description: string;
  courtTheme?: HoopsCourtTheme;
  playersPerSide?: 1 | 2 | 3 | 5;
  targetScore?: number;
  repMult?: number;
  badgeMult?: number;
  vcBonus?: number;
}

export const HOOPS_CITY_LOCATIONS: HoopsCityLocationDef[] = [
  // Central Spawn Plaza
  {
    id: 'daily_reward',
    name: 'Daily Reward Station',
    shortName: 'Daily Reward',
    perimeter: 'central',
    kind: 'farming',
    x: -7,
    z: 6,
    color: 0xf59e0b,
    accentHex: '#f59e0b',
    icon: '🎁',
    difficultyLabel: 'Central Plaza',
    formatLabel: 'Free Spin / Drop',
    resetTimerLabel: 'Refreshes every 8h',
    description: 'Claim 1,500+ VC, Skill Boosts, Gatorade, or 2XP Coins (scales with REP).'
  },
  {
    id: 'daily_pickem',
    name: "Daily Pick'Em Kiosk",
    shortName: "Pick'Em",
    perimeter: 'central',
    kind: 'farming',
    x: 7,
    z: 6,
    color: 0x38bdf8,
    accentHex: '#38bdf8',
    icon: '📊',
    difficultyLabel: 'Central Plaza',
    formatLabel: 'NBA Predictions',
    resetTimerLabel: 'Resets Daily (24h)',
    description: 'Pick real-world NBA matchup winners for free VC & Lifetime Challenge progress.'
  },
  // North Perimeter — Competitive Online Arenas
  {
    id: 'theater',
    name: 'The Theater',
    shortName: 'Theater',
    perimeter: 'north',
    kind: 'court',
    x: -34,
    z: -42,
    color: 0xa855f7,
    accentHex: '#c084fc',
    icon: '🎬',
    difficultyLabel: 'Online Theater Tuning',
    formatLabel: '3v3 Instant Match · To 21',
    resetTimerLabel: 'Weekly Rotating Rules',
    description: 'Instant matchmaking 3v3 No-Squads with 12-second shot clock & 2X XP rotation.',
    courtTheme: 'theater',
    playersPerSide: 3,
    targetScore: 21,
    repMult: 1.15,
    badgeMult: 1.2,
    vcBonus: 350
  },
  {
    id: 'seasonal_park',
    name: 'Seasonal Park (City Heights)',
    shortName: 'The Park',
    perimeter: 'north',
    kind: 'court',
    x: -8,
    z: -44,
    color: 0x22c55e,
    accentHex: '#4ade80',
    icon: '🌴',
    difficultyLabel: 'Online Park Tuning',
    formatLabel: '3v3 Got Next · To 21 (+25% REP)',
    resetTimerLabel: 'Always Open · Streak Bounty',
    description: 'Sunlit outdoor courts with Got Next spots, Park MVP crown & +25% REP bonus.',
    courtTheme: 'park',
    playersPerSide: 3,
    targetScore: 21,
    repMult: 1.25,
    badgeMult: 1.15,
    vcBonus: 400
  },
  {
    id: 'the_rec',
    name: 'The REC',
    shortName: 'The REC',
    perimeter: 'north',
    kind: 'court',
    x: 18,
    z: -44,
    color: 0x2563eb,
    accentHex: '#60a5fa',
    icon: '🏟️',
    difficultyLabel: 'All-Star / Superstar',
    formatLabel: '5v5 Solo & Squads · 5m Qtrs',
    resetTimerLabel: 'Always Open',
    description: 'Full-court 5v5 competitive indoor play with pre-game Locker Room staging.',
    courtTheme: 'the_rec',
    playersPerSide: 5,
    repMult: 1.35,
    badgeMult: 1.4,
    vcBonus: 650
  },
  {
    id: 'proving_grounds',
    name: 'Proving Grounds',
    shortName: 'Proving Gr.',
    perimeter: 'north',
    kind: 'court',
    x: 42,
    z: -40,
    color: 0xdc2626,
    accentHex: '#f87171',
    icon: '⚔️',
    difficultyLabel: 'Closest to Hall of Fame',
    formatLabel: 'Ranked 5v5 · Strict Sliders',
    resetTimerLabel: 'Ranked Season Ladder',
    description: 'Highest-stakes skill-based matchmaking with strict HOF shooting sliders & massive REP.',
    courtTheme: 'proving_grounds',
    playersPerSide: 5,
    repMult: 1.5,
    badgeMult: 1.4,
    vcBonus: 800
  },
  // West Perimeter — Pro-AM, Starting 5, NBA Arena, MyCOURT
  {
    id: 'pro_am',
    name: 'Pro-AM Arena',
    shortName: 'Pro-AM',
    perimeter: 'west',
    kind: 'court',
    x: -44,
    z: -16,
    color: 0x0ea5e9,
    accentHex: '#38bdf8',
    icon: '🏆',
    difficultyLabel: 'Closest to Hall of Fame',
    formatLabel: '3v3 / 5v5 Team Play',
    resetTimerLabel: 'Summit Weekends',
    description: 'Organized squad play with custom jerseys & Pro-AM Summit weekend bonuses.',
    courtTheme: 'proving_grounds',
    playersPerSide: 5,
    repMult: 1.45,
    badgeMult: 1.35,
    vcBonus: 750
  },
  {
    id: 'starting_5',
    name: 'Starting 5',
    shortName: 'Starting 5',
    perimeter: 'west',
    kind: 'court',
    x: -44,
    z: 2,
    color: 0x6366f1,
    accentHex: '#818cf8',
    icon: '5️⃣',
    difficultyLabel: 'Online Head-to-Head',
    formatLabel: 'MyPLAYER + Full NBA Squad',
    resetTimerLabel: 'Always Open',
    description: 'Slot your MyPLAYER onto any real NBA roster in 5v5 head-to-head action.',
    courtTheme: 'nba_arena',
    playersPerSide: 5,
    repMult: 1.25,
    badgeMult: 1.25,
    vcBonus: 550
  },
  {
    id: 'nba_arena',
    name: 'NBA Arena (Out of Bounds)',
    shortName: 'NBA Arena',
    perimeter: 'west',
    kind: 'court',
    x: -44,
    z: 20,
    color: 0xf59e0b,
    accentHex: '#fbbf24',
    icon: '🏀',
    difficultyLabel: 'User-Selectable (Rookie–HOF)',
    formatLabel: 'MyCAREER Key Games · 5m/12m Qtrs',
    resetTimerLabel: 'NBA Calendar',
    description: 'Walk through the Arena Tunnel for MyCAREER Key Games, Dynasty Badges & Playoffs.',
    courtTheme: 'nba_arena',
    playersPerSide: 5,
    repMult: 1.0,
    badgeMult: 1.5,
    vcBonus: 900
  },
  {
    id: 'mycourt',
    name: 'MyCOURT Personal Gym',
    shortName: 'MyCOURT',
    perimeter: 'west',
    kind: 'mycourt',
    x: -36,
    z: 36,
    color: 0x14b8a6,
    accentHex: '#2dd4bf',
    icon: '🏠',
    difficultyLabel: 'Custom Practice / Online Sim',
    formatLabel: 'Customize Floor + Shootaround',
    resetTimerLabel: 'Always Open',
    description: 'Design your custom wood floor, murals & stanchions and warm up your custom Jump Shot.',
    courtTheme: 'mycourt',
    playersPerSide: 2,
    targetScore: 21,
    repMult: 0.8,
    badgeMult: 1.2,
    vcBonus: 200
  },
  // East Perimeter — Ante-Up, Street Kings, Open-Court Athletics, The Track
  {
    id: 'ante_up',
    name: 'Ante-Up (The Stage)',
    shortName: 'Ante-Up',
    perimeter: 'east',
    kind: 'court',
    x: 44,
    z: -16,
    color: 0xeab308,
    accentHex: '#facc15',
    icon: '💰',
    difficultyLabel: 'Competitive Stage Tuning',
    formatLabel: '2v2 VC Wager · To 21',
    resetTimerLabel: 'Always Open (High Stakes)',
    description: 'High-stakes 2v2 wagering courts—win the pooled VC pot on every victory.',
    courtTheme: 'theater',
    playersPerSide: 2,
    targetScore: 21,
    repMult: 1.3,
    badgeMult: 1.2,
    vcBonus: 1200
  },
  {
    id: 'street_kings',
    name: 'Street Kings',
    shortName: 'Street Kings',
    perimeter: 'east',
    kind: 'court',
    x: 44,
    z: 2,
    color: 0xf97316,
    accentHex: '#fb923c',
    icon: '👑',
    difficultyLabel: 'PvE Boss Courts (40 Tiers)',
    formatLabel: '3v3 Fast PvE Boss · To 21',
    resetTimerLabel: 'Always Open (No Cooldown)',
    description: 'Fast PvE outdoor boss clashes ideal for farming VC, MyPOINTS, and 40 Street Kings tiers.',
    courtTheme: 'street_kings',
    playersPerSide: 3,
    targetScore: 21,
    repMult: 1.15,
    badgeMult: 1.8,
    vcBonus: 600
  },
  {
    id: 'open_court',
    name: 'Open-Court Athletics',
    shortName: 'Open-Court 3x',
    perimeter: 'east',
    kind: 'court',
    x: 44,
    z: 20,
    color: 0x10b981,
    accentHex: '#34d399',
    icon: '⚡',
    difficultyLabel: 'PvE Badge Farm (3x Badges)',
    formatLabel: '3v3 NBA AI Scrimmage · To 21',
    resetTimerLabel: 'Always Open (3x Badge XP)',
    description: 'Fastest Badge Progression farm in NBA 2K26—earn 3x Badge XP against NBA AI.',
    courtTheme: 'open_court',
    playersPerSide: 3,
    targetScore: 21,
    repMult: 1.0,
    badgeMult: 3.0,
    vcBonus: 450
  },
  {
    id: 'the_track',
    name: 'The Track (Weekly Race)',
    shortName: 'The Track',
    perimeter: 'east',
    kind: 'farming',
    x: 36,
    z: 36,
    color: 0x06b6d4,
    accentHex: '#22d3ee',
    icon: '🏎️',
    difficultyLabel: 'Weekly Ghost Challenge',
    formatLabel: 'Vehicle Time Trial',
    resetTimerLabel: 'Resets Weekly (7 Days)',
    description: 'Beat the weekly ghost target time for 2,500 VC + Season XP.'
  },
  // South Perimeter — Stores, Boosts & Training Promenade
  {
    id: 'gatorade_gym',
    name: 'Gatorade Training Facility',
    shortName: 'Gatorade Gym',
    perimeter: 'south',
    kind: 'gym',
    x: -18,
    z: 42,
    color: 0x84cc16,
    accentHex: '#a3e635',
    icon: '💪',
    difficultyLabel: 'Weekly Stamina Drill',
    formatLabel: '+Turbo Boost & Fuel Bar',
    resetTimerLabel: 'Resets Weekly (7 Days)',
    description: 'Complete weekly workout for extra Turbo/Stamina bar & buy Gatorade boosts.'
  },
  {
    id: 'art_of_shooting',
    name: 'Art of Shooting (Lethal Gym)',
    shortName: 'Art of Shooting',
    perimeter: 'south',
    kind: 'gym',
    x: 0,
    z: 44,
    color: 0xef4444,
    accentHex: '#f87171',
    icon: '🔥',
    difficultyLabel: 'Lethal Shooter Drill',
    formatLabel: 'Hot Zone → Lethal Zone',
    resetTimerLabel: 'Resets Weekly (7 Days)',
    description: 'Run Lethal Shooter drill once a week to upgrade Hot Zones into Lethal Zones.'
  },
  {
    id: 'skill_boosts',
    name: 'Skill Boost Stand',
    shortName: 'Skill Boosts',
    perimeter: 'south',
    kind: 'store',
    x: 16,
    z: 44,
    color: 0x3b82f6,
    accentHex: '#60a5fa',
    icon: '🧪',
    difficultyLabel: 'South Plaza Store',
    formatLabel: 'Jump Shot · Dunk · Steal · Block',
    resetTimerLabel: 'Always Open',
    description: 'Stock up on 10-game Skill Boost packs for instant +5% on-court execution.'
  },
  {
    id: 'clothing_promenade',
    name: "Clothing & Shoe Promenade",
    shortName: "SWAG's & Shoes",
    perimeter: 'south',
    kind: 'store',
    x: 30,
    z: 42,
    color: 0xec4899,
    accentHex: '#f472b6',
    icon: '👟',
    difficultyLabel: "SWAG's · NBA Store · 7 Shoe Brands",
    formatLabel: 'Outfits · Jerseys · Vehicles · Shoes',
    resetTimerLabel: 'Always Open',
    description: 'Shop streetwear, NBA jerseys, City vehicles & launch the 3D Shoe Creator.'
  }
];

// ============================================================================
// MYTEAM CARDS (NBA + WNBA CO-OP), GAME CHANGERS & PACKS
// ============================================================================
export interface MyTeamCardDef {
  id: string;
  name: string;
  teamAbbr: string;
  league: 'NBA' | 'WNBA';
  pos: HoopsPosition;
  ovr: number;
  gem: 'Emerald' | 'Sapphire' | 'Ruby' | 'Amethyst' | 'Diamond' | 'Pink Diamond' | 'Galaxy Opal';
  gemHex: string;
  mtpPrice: number;
  shoot: number;
  dunk: number;
  def: number;
}

export const MYTEAM_CARDS: MyTeamCardDef[] = [
  { id: 'mt_tatum', name: 'Jayson Tatum', teamAbbr: 'BOS', league: 'NBA', pos: 'SF', ovr: 96, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 4200, shoot: 95, dunk: 92, def: 90 },
  { id: 'mt_aja', name: "A'ja Wilson", teamAbbr: 'LVA', league: 'WNBA', pos: 'PF', ovr: 98, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 6500, shoot: 88, dunk: 94, def: 98 },
  { id: 'mt_curry', name: 'Stephen Curry', teamAbbr: 'GSW', league: 'NBA', pos: 'PG', ovr: 96, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 4600, shoot: 99, dunk: 76, def: 82 },
  { id: 'mt_clark', name: 'Caitlin Clark', teamAbbr: 'IND', league: 'WNBA', pos: 'PG', ovr: 94, gem: 'Diamond', gemHex: '#60a5fa', mtpPrice: 2800, shoot: 98, dunk: 72, def: 80 },
  { id: 'mt_jokic', name: 'Nikola Jokic', teamAbbr: 'DEN', league: 'NBA', pos: 'C', ovr: 98, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 6800, shoot: 93, dunk: 86, def: 88 },
  { id: 'mt_lebron', name: 'LeBron James', teamAbbr: 'LAL', league: 'NBA', pos: 'SF', ovr: 95, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 4400, shoot: 90, dunk: 98, def: 91 },
  { id: 'mt_sga', name: 'Shai Gilgeous-Alexander', teamAbbr: 'OKC', league: 'NBA', pos: 'PG', ovr: 97, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 6000, shoot: 93, dunk: 92, def: 94 },
  { id: 'mt_sabrina', name: 'Sabrina Ionescu', teamAbbr: 'NYL', league: 'WNBA', pos: 'SG', ovr: 93, gem: 'Diamond', gemHex: '#60a5fa', mtpPrice: 2400, shoot: 97, dunk: 75, def: 84 },
  { id: 'mt_wemby', name: 'Victor Wembanyama', teamAbbr: 'SAS', league: 'NBA', pos: 'C', ovr: 95, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 5200, shoot: 89, dunk: 96, def: 99 },
  { id: 'mt_stewie', name: 'Breanna Stewart', teamAbbr: 'NYL', league: 'WNBA', pos: 'PF', ovr: 95, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 3900, shoot: 93, dunk: 88, def: 95 },
  { id: 'mt_mj', name: 'Michael Jordan', teamAbbr: 'CHI96', league: 'NBA', pos: 'SG', ovr: 99, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 8500, shoot: 96, dunk: 99, def: 99 },
  { id: 'mt_kobe', name: 'Kobe Bryant', teamAbbr: 'LAL01', league: 'NBA', pos: 'SG', ovr: 98, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 7800, shoot: 97, dunk: 98, def: 96 },
  { id: 'mt_ant', name: 'Anthony Edwards', teamAbbr: 'MIN', league: 'NBA', pos: 'SG', ovr: 94, gem: 'Diamond', gemHex: '#60a5fa', mtpPrice: 2900, shoot: 91, dunk: 98, def: 90 },
  { id: 'mt_phee', name: 'Napheesa Collier', teamAbbr: 'MNL', league: 'WNBA', pos: 'PF', ovr: 95, gem: 'Pink Diamond', gemHex: '#ec4899', mtpPrice: 3600, shoot: 90, dunk: 88, def: 97 },
  { id: 'mt_giannis', name: 'Giannis Antetokounmpo', teamAbbr: 'MIL', league: 'NBA', pos: 'PF', ovr: 97, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 6400, shoot: 80, dunk: 99, def: 97 },
  { id: 'mt_luka', name: 'Luka Doncic', teamAbbr: 'LAL', league: 'NBA', pos: 'PG', ovr: 97, gem: 'Galaxy Opal', gemHex: '#38bdf8', mtpPrice: 6100, shoot: 96, dunk: 85, def: 82 }
];

export interface MyTeamGameChangerDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export const MYTEAM_GAME_CHANGERS: MyTeamGameChangerDef[] = [
  { id: 'gc_2x_mtp', name: '2X MTP Surge', icon: '⚡', desc: 'Doubles MTP earned in your next MyTEAM match.' },
  { id: 'gc_streak_shield', name: 'Showdown Streak Shield', icon: '🛡️', desc: 'Protects your Showdown win streak after a loss.' },
  { id: 'gc_breakout_warp', name: 'Breakout Auto-Win', icon: '🌀', desc: 'Instantly clears the current Breakout board tile.' },
  { id: 'gc_dom_boost', name: 'Domination Diff Boost', icon: '🔥', desc: 'Lowers Domination win-margin target by 6 points.' }
];

// ============================================================================
// CREATOR STUDIOS: SHOE CREATOR, JUMP SHOT CREATOR, MYCOURT 3D EDITOR
// ============================================================================
export const SHOE_BRANDS = ['Nike', 'Jordan', 'Adidas', 'Puma', 'Under Armour', 'New Balance', 'Converse'] as const;
export type ShoeBrand = (typeof SHOE_BRANDS)[number];

export interface CustomShoeDesign {
  id: string;
  name: string;
  brand: ShoeBrand;
  cut: 'Low' | 'Mid' | 'High';
  upperHex: string;
  soleHex: string;
  accentHex: string;
  lacesHex: string;
}

export const DEFAULT_CUSTOM_SHOES: CustomShoeDesign[] = [
  {
    id: 'shoe_2k26_gold',
    name: '2K26 Dawn Edition',
    brand: 'Jordan',
    cut: 'Mid',
    upperHex: '#111827',
    soleHex: '#f8fafc',
    accentHex: '#f59e0b',
    lacesHex: '#facc15'
  },
  {
    id: 'shoe_volt_runner',
    name: 'City Volt Low',
    brand: 'Nike',
    cut: 'Low',
    upperHex: '#0f172a',
    soleHex: '#22c55e',
    accentHex: '#38bdf8',
    lacesHex: '#ffffff'
  }
];

export interface CustomJumpShot {
  name: string;
  base: string;
  upper1: string;
  upper2: string;
  blendPct: number; // 0..100
  speedTier: 'Slow' | 'Normal' | 'Quick' | 'Very Quick';
  visualCue: 'Jump' | 'Set Point' | 'Push' | 'Release';
}

export const JUMPSHOT_BASES = [
  { name: 'Stephen Curry', speed: 94, height: 82, stability: 90, immunity: 86 },
  { name: 'Tracy McGrady', speed: 88, height: 95, stability: 92, immunity: 95 },
  { name: 'Caitlin Clark', speed: 95, height: 84, stability: 89, immunity: 88 },
  { name: 'Kobe Bryant', speed: 90, height: 92, stability: 90, immunity: 93 },
  { name: 'Jayson Tatum', speed: 86, height: 94, stability: 93, immunity: 91 },
  { name: 'Nikola Jokic', speed: 78, height: 98, stability: 95, immunity: 94 }
] as const;

export const JUMPSHOT_UPPERS = [
  { name: 'Oscar Robertson', speed: 90, height: 93, stability: 94, immunity: 92 },
  { name: 'Saddiq Bey', speed: 89, height: 91, stability: 91, immunity: 90 },
  { name: 'Troy Brown Jr.', speed: 92, height: 90, stability: 88, immunity: 89 },
  { name: 'Sabrina Ionescu', speed: 94, height: 86, stability: 92, immunity: 88 },
  { name: 'Kyle Korver', speed: 87, height: 95, stability: 96, immunity: 94 },
  { name: 'Michael Jordan', speed: 91, height: 94, stability: 89, immunity: 95 }
] as const;

export function evaluateCustomJumpShot(js: CustomJumpShot): {
  releaseHeight: string;
  releaseSpeed: string;
  defensiveImmunity: string;
  timingStability: string;
  meterSpeedMult: number;
  greenWindowBonus: number;
} {
  const b = JUMPSHOT_BASES.find((x) => x.name === js.base) ?? JUMPSHOT_BASES[0];
  const u1 = JUMPSHOT_UPPERS.find((x) => x.name === js.upper1) ?? JUMPSHOT_UPPERS[0];
  const u2 = JUMPSHOT_UPPERS.find((x) => x.name === js.upper2) ?? JUMPSHOT_UPPERS[1];
  const w1 = js.blendPct / 100;
  const w2 = 1 - w1;
  const speedBonus = js.speedTier === 'Very Quick' ? 8 : js.speedTier === 'Quick' ? 4 : js.speedTier === 'Slow' ? -6 : 0;

  const scoreH = Math.round(b.height * 0.55 + (u1.height * w1 + u2.height * w2) * 0.45);
  const scoreS = Math.min(99, Math.round(b.speed * 0.55 + (u1.speed * w1 + u2.speed * w2) * 0.45 + speedBonus));
  const scoreI = Math.round(b.immunity * 0.5 + (u1.immunity * w1 + u2.immunity * w2) * 0.5);
  const scoreT = Math.round(b.stability * 0.5 + (u1.stability * w1 + u2.stability * w2) * 0.5 - Math.max(0, speedBonus * 0.35));

  const toGrade = (s: number) => (s >= 95 ? 'A+' : s >= 91 ? 'A' : s >= 87 ? 'A-' : s >= 83 ? 'B+' : s >= 78 ? 'B' : 'C+');
  const meterSpeedMult =
    js.speedTier === 'Very Quick' ? 1.18 : js.speedTier === 'Quick' ? 1.08 : js.speedTier === 'Slow' ? 0.88 : 1.0;
  const greenWindowBonus = Number((((scoreT - 80) * 0.0014) + (js.visualCue === 'Push' || js.visualCue === 'Release' ? 0.008 : 0.004)).toFixed(4));

  return {
    releaseHeight: toGrade(scoreH),
    releaseSpeed: toGrade(scoreS),
    defensiveImmunity: toGrade(scoreI),
    timingStability: toGrade(scoreT),
    meterSpeedMult,
    greenWindowBonus: Math.max(0, greenWindowBonus)
  };
}

export interface MyCourtDesign {
  woodHex: string;
  paintHex: string;
  lineHex: string;
  stanchionHex: string;
  muralTheme: 'classic_oak' | 'northern_lights' | 'sunset_city' | 'championship_gold';
  centerLogoText: string;
}

export const DEFAULT_MYCOURT_DESIGN: MyCourtDesign = {
  woodHex: '#d2995b',
  paintHex: '#1d4ed8',
  lineHex: '#f8fafc',
  stanchionHex: '#0f172a',
  muralTheme: 'classic_oak',
  centerLogoText: '2K26'
};

// ============================================================================
// LOCKER CODES & 2K BEATS
// ============================================================================
export interface HoopsLockerCodeDef {
  code: string;
  label: string;
  vc?: number;
  mtp?: number;
  doubleXpCoins?: number;
  skillBoosts?: number;
  cardId?: string;
}

export const HOOPS_LOCKER_CODES: HoopsLockerCodeDef[] = [
  { code: '2K26-HOOPS-VC', label: '+2,500 VC + 1x 2XP Coin', vc: 2500, doubleXpCoins: 1 },
  { code: 'CITY-BOOST-26', label: '+15 Skill Boosts + 1,000 VC', vc: 1000, skillBoosts: 15 },
  { code: 'MYTEAM-PACK-26', label: '+3,500 MTP + Diamond Caitlin Clark', mtp: 3500, cardId: 'mt_clark' },
  { code: 'OUT-OF-BOUNDS', label: '+2,000 VC + 2x 2XP Coins', vc: 2000, doubleXpCoins: 2 },
  { code: 'LEGEND-2K26', label: '+5,000 VC + 2,500 MTP', vc: 5000, mtp: 2500 }
];

export function redeemHoopsLockerCode(
  input: string,
  alreadyRedeemed: string[]
): { ok: boolean; message: string; reward?: HoopsLockerCodeDef } {
  const normalized = input.trim().toUpperCase();
  if (!normalized) return { ok: false, message: 'Enter a Locker Code first.' };
  const found = HOOPS_LOCKER_CODES.find((c) => c.code === normalized);
  if (!found) {
    return {
      ok: false,
      message: `Invalid code "${normalized}". Try 2K26-HOOPS-VC or MYTEAM-PACK-26.`
    };
  }
  if (alreadyRedeemed.includes(found.code)) {
    return { ok: false, message: `Code ${found.code} has already been redeemed.` };
  }
  return { ok: true, message: `Redeemed ${found.code}: ${found.label}!`, reward: found };
}

export interface HoopsBeatTrackDef {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  rootMidi: number;
  vibe: string;
}

export const HOOPS_2K_BEATS: HoopsBeatTrackDef[] = [
  { id: 'beat_tunnel', title: 'Tunnel Walk Anthem', artist: '2K26 Studio Collective', bpm: 96, rootMidi: 45, vibe: 'Arena Trap' },
  { id: 'beat_city_sun', title: 'City Heights Daylight', artist: 'Plaza Rhythm Crew', bpm: 104, rootMidi: 48, vibe: 'West Coast Bounce' },
  { id: 'beat_blacktop', title: 'Blacktop Sunset 21', artist: 'Concrete Groove', bpm: 92, rootMidi: 43, vibe: 'Boom Bap' },
  { id: 'beat_clutch', title: 'Fourth Quarter Ice', artist: 'Buzzer Beater Lab', bpm: 112, rootMidi: 50, vibe: 'Hype Bass' },
  { id: 'beat_dynasty', title: 'Championship Parade', artist: 'Hardwood Brass', bpm: 100, rootMidi: 47, vibe: 'Stadium Horns' },
  { id: 'beat_mycourt', title: 'Midnight Shootaround', artist: 'Lo-Fi Rim', bpm: 86, rootMidi: 41, vibe: 'Chill Practice' }
];

// ============================================================================
// COMPLETE SETTINGS HIERARCHY & MATCH CONTEXT
// ============================================================================
export type HoopsDifficulty2K = 'Rookie' | 'Pro' | 'All-Star' | 'Superstar' | 'Hall of Fame';

export interface Hoops2K26Settings {
  // General
  difficulty: HoopsDifficulty2K;
  quarterLengthMin: 5 | 12 | 0.75; // 5 min default, 12 min sim, 0.75 = 45s fast arcade
  gameSpeed: number; // 40..60 (default 50)
  cameraShake: boolean;
  beatsEnabled: boolean;
  // Controller
  shotTiming: 'Shots, Layups & FTs' | 'Shots Only' | 'Real Player %';
  visualCue: 'Jump' | 'Set Point' | 'Push' | 'Release';
  proStickFunction: 'Default' | 'Dribble Moves' | 'Shots';
  whoToGuard: boolean;
  defAssistStrength: number; // 0..100 (recommended 10)
  boxoutAssistStrength: number; // 0..100 (recommended 35)
  // Customize HUD
  jumpShotMeterOff: boolean; // true => automatic Green Window Boost!
  layupMeterStyle: 'comet' | 'fang' | 'horn';
  perfectReleaseAnim: 'flame' | 'crown' | 'burst';
  shotFeedback: 'all' | 'user' | 'off';
  floorStamina: boolean;
  ballHandlerText: 'name' | 'position' | 'off';
  // Camera
  cameraAngle: '2k' | 'broadcast';
  cameraZoom: number; // 1..10
  cameraHeight: number; // 1..10
  flipCamera: boolean;
  // Coach
  aceEnabled: boolean;
  playVision: 'all' | 'lite' | 'off';
  manualCoaching: boolean;
}

export const DEFAULT_HOOPS_2K26_SETTINGS: Hoops2K26Settings = {
  difficulty: 'All-Star',
  quarterLengthMin: 5,
  gameSpeed: 50,
  cameraShake: false,
  beatsEnabled: true,
  shotTiming: 'Shots, Layups & FTs',
  visualCue: 'Push',
  proStickFunction: 'Default',
  whoToGuard: true,
  defAssistStrength: 10,
  boxoutAssistStrength: 35,
  jumpShotMeterOff: false,
  layupMeterStyle: 'comet',
  perfectReleaseAnim: 'flame',
  shotFeedback: 'all',
  floorStamina: true,
  ballHandlerText: 'name',
  cameraAngle: '2k',
  cameraZoom: 5,
  cameraHeight: 5,
  flipCamera: true,
  aceEnabled: false,
  playVision: 'all',
  manualCoaching: true
};

export interface HoopsMatchContext {
  sourceLabel: string;
  courtTheme: HoopsCourtTheme;
  playersPerSide: 1 | 2 | 3 | 5;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamOverride?: Hoops2K26TeamDef;
  awayTeamOverride?: Hoops2K26TeamDef;
  homeJerseyVariant: 'home' | 'away' | 'city';
  useMyPlayer: boolean;
  targetScore: number | null; // null => 4-quarter timed game
  quarterSec: number;
  difficultyLabel: string;
  repMult: number;
  badgeMult: number;
  vcBonus: number;
  isMyTeam?: boolean;
  isPractice?: boolean;
}

export interface MyPlayerSaveSlot {
  id: string;
  name: string;
  position: HoopsPosition;
  heightIn: number;
  weightLb: number;
  wingspanIn: number;
  handedness: 'Right' | 'Left';
  jerseyNum: number;
  bodyType: HoopsBodyType;
  nbaTeamId: number;
  attributes: MyPlayerAttributes;
  capBreakersApplied: number;
  myPoints: number;
  badgeXp: number;
  buildSpecPath: HoopsAttrCategory;
  buildSpecGoalsDone: number; // 0..9
  equippedTakeoverId: string;
  takeoverPresets: [string, string, string];
  jumpShot: CustomJumpShot;
  equippedShoeId: string;
  equippedVehicle: 'none' | 'skateboard' | 'hoverboard' | 'bmx' | 'gokart';
  hotZones: Record<'left_corner' | 'left_wing' | 'top_key' | 'right_wing' | 'right_corner' | 'paint', HoopsZoneHeat>;
  nbaSeasonGamesWon: number;
  nbaSeasonGamesPlayed: number;
  keyGamesCleared: number;
}

export interface HoopsDailyChallengeState {
  dateKey: string;
  tasks: Array<{ id: string; label: string; target: number; progress: number; vcReward: number; claimed: boolean }>;
}

export interface Hoops2K26Profile {
  vc: number;
  mtp: number;
  repXp: number;
  plateScore: number; // 0..1000
  crewName: string;
  crewTag: string;
  crewLevel: number; // 1..30
  crewXp: number;
  seasonXp: number; // Lv 1..40 (300 XP per level)
  seasonPassTier: 'Free' | 'Pro' | 'HOF';
  doubleXpCoins: number;
  doubleXpUntilMs: number;
  lifetimeCleared: number; // out of 300
  streetKingsLevel: number; // 1..40
  skillBoosts: number;
  gatoradeBoosts: number;
  pnoWins: number;
  pnoTierIdx: number; // 0..6
  ownedCards: string[];
  activeMyTeamLineup: string[]; // 5 starters
  gameChangers: Record<string, number>;
  activeGameChangerId: string | null;
  redeemedLockerCodes: string[];
  customShoes: CustomShoeDesign[];
  myCourt: MyCourtDesign;
  saves: MyPlayerSaveSlot[];
  activeSaveId: string;
  settings: Hoops2K26Settings;
  timers: {
    dailyRewardLastMs: number;
    dailyPickemLastDate: string;
    trackLastWeekKey: string;
    gatoradeLastWeekKey: string;
    artOfShootingLastWeekKey: string;
  };
  dailyChallenges: HoopsDailyChallengeState;
  careerStats: {
    gamesPlayed: number;
    wins: number;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    greens: number;
  };
  activeMatchContext: HoopsMatchContext | null;
}

export function createDefaultMyPlayerSave(id = 'mp_1'): MyPlayerSaveSlot {
  return {
    id,
    name: 'MP Dawn',
    position: 'PG',
    heightIn: 77, // 6'5"
    weightLb: 200,
    wingspanIn: 81,
    handedness: 'Right',
    jerseyNum: 26,
    bodyType: 'Defined',
    nbaTeamId: 1,
    attributes: {
      finishing: 86,
      shooting: 91,
      playmaking: 90,
      defense: 85,
      rebounding: 72,
      physicals: 88
    },
    capBreakersApplied: 0,
    myPoints: 1200,
    badgeXp: 450,
    buildSpecPath: 'shooting',
    buildSpecGoalsDone: 1,
    equippedTakeoverId: 'tk_sharpshooter',
    takeoverPresets: ['tk_sharpshooter', 'tk_slice', 'tk_clamps'],
    jumpShot: {
      name: '2K26 Pure Push',
      base: 'Stephen Curry',
      upper1: 'Oscar Robertson',
      upper2: 'Saddiq Bey',
      blendPct: 60,
      speedTier: 'Quick',
      visualCue: 'Push'
    },
    equippedShoeId: 'shoe_2k26_gold',
    equippedVehicle: 'skateboard',
    hotZones: {
      left_corner: 'hot',
      left_wing: 'neutral',
      top_key: 'hot',
      right_wing: 'neutral',
      right_corner: 'hot',
      paint: 'hot'
    },
    nbaSeasonGamesWon: 0,
    nbaSeasonGamesPlayed: 0,
    keyGamesCleared: 0
  };
}

export function createDailyChallengesForDate(dateKey: string): HoopsDailyChallengeState {
  return {
    dateKey,
    tasks: [
      { id: 'dc_pts', label: 'Score 12 Points in any game', target: 12, progress: 0, vcReward: 500, claimed: false },
      { id: 'dc_green', label: 'Hit 3 Green Releases', target: 3, progress: 0, vcReward: 500, claimed: false },
      { id: 'dc_win', label: 'Win 1 Match in The City or Play Now', target: 1, progress: 0, vcReward: 500, claimed: false }
    ]
  };
}

export function createDefaultHoops2K26Profile(dateKey = '2026-11-18'): Hoops2K26Profile {
  const starterSave = createDefaultMyPlayerSave('mp_1');
  return {
    vc: 5000,
    mtp: 4500,
    repXp: 250,
    plateScore: 260, // Hooper Bronze Plate
    crewName: 'Dawn Ballers',
    crewTag: '2K26',
    crewLevel: 6,
    crewXp: 120,
    seasonXp: 640,
    seasonPassTier: 'Free',
    doubleXpCoins: 2,
    doubleXpUntilMs: 0,
    lifetimeCleared: 14,
    streetKingsLevel: 3,
    skillBoosts: 10,
    gatoradeBoosts: 10,
    pnoWins: 0,
    pnoTierIdx: 0,
    ownedCards: ['mt_curry', 'mt_sabrina', 'mt_tatum', 'mt_aja', 'mt_wemby', 'mt_ant'],
    activeMyTeamLineup: ['mt_curry', 'mt_sabrina', 'mt_tatum', 'mt_aja', 'mt_wemby'],
    gameChangers: {
      gc_2x_mtp: 2,
      gc_streak_shield: 1,
      gc_breakout_warp: 1,
      gc_dom_boost: 1
    },
    activeGameChangerId: null,
    redeemedLockerCodes: [],
    customShoes: [...DEFAULT_CUSTOM_SHOES],
    myCourt: { ...DEFAULT_MYCOURT_DESIGN },
    saves: [starterSave],
    activeSaveId: starterSave.id,
    settings: { ...DEFAULT_HOOPS_2K26_SETTINGS },
    timers: {
      dailyRewardLastMs: 0,
      dailyPickemLastDate: '',
      trackLastWeekKey: '',
      gatoradeLastWeekKey: '',
      artOfShootingLastWeekKey: ''
    },
    dailyChallenges: createDailyChallengesForDate(dateKey),
    careerStats: {
      gamesPlayed: 0,
      wins: 0,
      points: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      greens: 0
    },
    activeMatchContext: null
  };
}

export function getActiveMyPlayer(profile: Hoops2K26Profile): MyPlayerSaveSlot {
  return profile.saves.find((s) => s.id === profile.activeSaveId) ?? profile.saves[0] ?? createDefaultMyPlayerSave();
}

export function formatHeightInches(inches: number): string {
  const ft = Math.floor(inches / 12);
  const rem = Math.round(inches % 12);
  return `${ft}'${rem}"`;
}

// ============================================================================
// 4-TAB POST-GAME PROGRESSION CALCULATOR
// ============================================================================
export interface HoopsPostGameInput {
  won: boolean;
  homeScore: number;
  awayScore: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  greens: number;
  teammateGrade: string;
  teammateGradeScore: number; // 0..100
  difficulty: HoopsDifficulty2K;
  courtContext: HoopsMatchContext | null;
  crewLevel: number;
  doubleXpActive: boolean;
}

export interface HoopsPostGameRewards {
  baseVc: number;
  gradeVc: number;
  statVc: number;
  crewBonusVc: number;
  totalVc: number;
  mtpEarned: number;
  myPointsEarned: number;
  badgeXpEarned: number;
  repXpEarned: number;
  crewXpEarned: number;
  plateDelta: number;
  seasonXpEarned: number;
  hotZoneUpgraded: boolean;
}

export function computeHoopsPostGameRewards(input: HoopsPostGameInput): HoopsPostGameRewards {
  const diffMultMap: Record<HoopsDifficulty2K, number> = {
    Rookie: 0.85,
    Pro: 1.0,
    'All-Star': 1.15,
    Superstar: 1.35,
    'Hall of Fame': 1.6
  };
  const diffMult = diffMultMap[input.difficulty] ?? 1.0;
  const ctx = input.courtContext;
  const crewBonuses = getCrewBonusesForLevel(input.crewLevel);

  const baseVc = Math.round(((input.won ? 450 : 240) + (ctx?.vcBonus ?? 200)) * diffMult);
  const gradeVc = Math.round(Math.max(40, input.teammateGradeScore * 3.2));
  const statVc = Math.round(
    input.points * 12 + input.rebounds * 15 + input.assists * 18 + (input.steals + input.blocks) * 25 + input.greens * 20
  );
  const preCrewVc = baseVc + gradeVc + statVc;
  const crewBonusVc = Math.round(preCrewVc * (crewBonuses.vcBonusPct / 100));
  const totalVc = preCrewVc + crewBonusVc;

  const mtpEarned = ctx?.isMyTeam ? Math.round((input.won ? 950 : 450) + input.points * 20) : Math.round(input.points * 8);
  const myPointsEarned = Math.round((320 + input.points * 45 + input.assists * 35 + input.rebounds * 30 + input.greens * 60) * diffMult);
  const badgeXpEarned = Math.round((180 + input.points * 20 + input.greens * 45 + (input.steals + input.blocks) * 40) * (ctx?.badgeMult ?? 1.0));
  const repXpEarned = Math.round(
    (input.won ? 240 : 110) *
      (ctx?.repMult ?? 1.0) *
      (1 + crewBonuses.repBonusPct / 100) *
      (input.doubleXpActive ? 2 : 1)
  );
  const crewXpEarned = Math.round((input.won ? 140 : 65) + input.teammateGradeScore * 0.8);
  const plateDelta = input.won ? Math.round(28 + input.teammateGradeScore * 0.25) : -Math.max(8, Math.round(26 - input.teammateGradeScore * 0.18));
  const seasonXpEarned = Math.round(((input.won ? 180 : 95) + input.points * 5) * (input.doubleXpActive ? 2 : 1));
  const hotZoneUpgraded = input.greens >= 3;

  return {
    baseVc,
    gradeVc,
    statVc,
    crewBonusVc,
    totalVc,
    mtpEarned,
    myPointsEarned,
    badgeXpEarned,
    repXpEarned,
    crewXpEarned,
    plateDelta,
    seasonXpEarned,
    hotZoneUpgraded
  };
}
