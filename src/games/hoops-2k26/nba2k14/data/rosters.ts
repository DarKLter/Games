// ============================================================================
// NBA 2K14 (2013-14 Era) — Complete Authentic Team & Roster Database
// 30 NBA Teams + 14 Official Euroleague Teams + 4 Classic + 2 All-Star Teams
// ============================================================================

import type {
  Conference,
  EquippedSignatureSkill,
  HotZoneId,
  PlayerAttributes,
  PlayerData,
  Position,
  SignatureSkillId,
  TeamData,
  TeamLeague,
} from '../types';

type PlayerSeed = [
  name: string,
  pos: Position,
  ovr: number,
  jersey: number,
  skills?: SignatureSkillId[],
  extra?: Partial<{ heightCm: number; skinTone: string; hairStyle: PlayerData['hairStyle']; headband: boolean; armSleeve: boolean; legSleeve: boolean }>
];

const POS_HEIGHT_CM: Record<Position, number> = {
  PG: 190,
  SG: 198,
  SF: 203,
  PF: 208,
  C: 213,
};

const POS_WEIGHT_LBS: Record<Position, number> = {
  PG: 192,
  SG: 210,
  SF: 228,
  PF: 244,
  C: 258,
};

const SKIN_TONES = ['#6d4329', '#8c5a3c', '#53311d', '#b8825b', '#d9a985', '#7b4d31'];
const HAIR_STYLES: PlayerData['hairStyle'][] = ['short', 'fade', 'bald', 'fade', 'short', 'afro'];

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function clampAttr(v: number): number {
  return Math.min(99, Math.max(35, Math.round(v)));
}

export function buildAttributesForPlayer(
  name: string,
  pos: Position,
  ovr: number,
  skills: SignatureSkillId[]
): PlayerAttributes {
  const has = (id: SignatureSkillId) => skills.includes(id);
  const isGuard = pos === 'PG' || pos === 'SG';
  const isWing = pos === 'SG' || pos === 'SF';
  const isBig = pos === 'PF' || pos === 'C';

  const base = ovr;
  const attrs: PlayerAttributes = {
    closeShot: clampAttr(base + (isBig ? 5 : 0)),
    midRange: clampAttr(base + (isWing ? 3 : isBig ? -4 : 1) + (has('shot_creator') ? 5 : 0)),
    threePt: clampAttr(
      base +
        (isGuard ? 3 : isBig ? -18 : 0) +
        (has('corner_specialist') || has('catch_and_shoot') || has('deadeye') ? 8 : 0)
    ),
    freeThrow: clampAttr(base + (isGuard ? 5 : isBig ? -9 : 1)),
    layup: clampAttr(base + (isGuard || isWing ? 4 : -1) + (has('finisher') || has('acrobat') ? 5 : 0)),
    dunk: clampAttr(base + (isWing || isBig ? 4 : -10) + (has('posterizer') || has('highlight_film') ? 9 : 0)),
    standingDunk: clampAttr(base + (isBig ? 9 : -12)),
    postHook: clampAttr(base + (isBig ? 7 : -18) + (has('post_proficiency') ? 10 : 0)),
    postFade: clampAttr(base + (isBig || pos === 'SF' ? 3 : -14) + (has('post_proficiency') ? 10 : 0)),
    shotInTraffic: clampAttr(base + (has('finisher') || has('deadeye') ? 6 : 0)),
    ballHandle: clampAttr(base + (pos === 'PG' ? 9 : isWing ? 2 : -18) + (has('ankle_breaker') ? 6 : 0)),
    passAccuracy: clampAttr(base + (pos === 'PG' ? 9 : isBig ? -12 : -2) + (has('dimer') || has('floor_general') ? 7 : 0)),
    offAwareness: clampAttr(base + (has('floor_general') ? 6 : 1)),
    speed: clampAttr(base + (pos === 'PG' ? 7 : isWing ? 3 : -12) + (has('lebron_coast_to_coast') || has('one_man_fastbreak') ? 6 : 0)),
    quickness: clampAttr(base + (pos === 'PG' ? 8 : isWing ? 3 : -12)),
    vertical: clampAttr(base + (has('posterizer') || has('highlight_film') ? 9 : isBig ? -2 : 2)),
    strength: clampAttr(base + (isBig ? 10 : pos === 'SF' ? 2 : -12) + (has('bruiser') || has('brick_wall') ? 7 : 0)),
    stamina: clampAttr(Math.max(82, base + 4)),
    hustle: clampAttr(base + (has('scrapper') || has('hustle_points') ? 9 : 2)),
    onBallDefense: clampAttr(base + (has('lockdown_defender') ? 10 : 0)),
    steal: clampAttr(base + (isGuard ? 4 : -8) + (has('pick_pocket') || has('interceptor') ? 9 : 0)),
    block: clampAttr(base + (isBig ? 11 : -16) + (has('eraser') || has('chasedown_artist') ? 10 : 0)),
    defAwareness: clampAttr(base + (has('defensive_anchor') || has('lockdown_defender') ? 9 : 0)),
    offRebound: clampAttr(base + (isBig ? 10 : -16) + (has('tenacious_rebounder') ? 8 : 0)),
    defRebound: clampAttr(base + (isBig ? 12 : -12) + (has('tenacious_rebounder') ? 8 : 0)),
  };

  // Authentic superstar attribute tuning
  const low = name.toLowerCase();
  if (low.includes('lebron james')) {
    Object.assign(attrs, { closeShot: 97, midRange: 89, threePt: 84, layup: 99, dunk: 98, ballHandle: 90, passAccuracy: 91, speed: 94, quickness: 92, vertical: 95, strength: 92, onBallDefense: 94, block: 84, defRebound: 85 });
  } else if (low.includes('stephen curry') || low.includes('ray allen') || low.includes('kyle korver')) {
    attrs.threePt = 98;
    attrs.midRange = Math.max(attrs.midRange, 92);
    attrs.freeThrow = 94;
  } else if (low.includes('kevin durant')) {
    Object.assign(attrs, { midRange: 97, threePt: 92, freeThrow: 92, layup: 94, dunk: 89, speed: 88 });
  } else if (low.includes('michael jordan')) {
    Object.assign(attrs, { closeShot: 99, midRange: 99, threePt: 82, layup: 99, dunk: 98, onBallDefense: 98, steal: 96, vertical: 98 });
  } else if (low.includes("shaquille o'neal")) {
    Object.assign(attrs, { standingDunk: 99, dunk: 98, postHook: 97, strength: 99, freeThrow: 53, threePt: 35, block: 92, defRebound: 96 });
  } else if (low.includes('kobe bryant')) {
    Object.assign(attrs, { midRange: 96, postFade: 96, threePt: 85, layup: 94, dunk: 88, onBallDefense: 90 });
  } else if (low.includes('chris paul')) {
    Object.assign(attrs, { passAccuracy: 98, ballHandle: 98, steal: 95, midRange: 92, threePt: 86, offAwareness: 98 });
  } else if (low.includes('derrick rose') || low.includes('russell westbrook')) {
    Object.assign(attrs, { speed: 97, quickness: 97, layup: 95, dunk: 92, vertical: 95 });
  } else if (low.includes('dwight howard') || low.includes('deandre jordan') || low.includes('blake griffin')) {
    Object.assign(attrs, { dunk: 96, standingDunk: 96, vertical: 94, defRebound: 93, block: 90 });
  } else if (low.includes('larry bird')) {
    Object.assign(attrs, { threePt: 97, midRange: 98, freeThrow: 94, passAccuracy: 92, defRebound: 89 });
  } else if (low.includes('magic johnson')) {
    Object.assign(attrs, { passAccuracy: 99, ballHandle: 96, offAwareness: 99, closeShot: 93, defRebound: 86 });
  }

  return attrs;
}

function buildHotZones(attrs: PlayerAttributes): Partial<Record<HotZoneId, -1 | 0 | 1>> {
  const zones: Partial<Record<HotZoneId, -1 | 0 | 1>> = {};
  if (attrs.dunk >= 82 || attrs.layup >= 84) zones.restricted = 1;
  if (attrs.closeShot >= 82) zones.paint = 1;
  if (attrs.midRange >= 84) {
    zones.mid_l_wing = 1;
    zones.mid_r_wing = 1;
    zones.mid_top = 1;
  }
  if (attrs.threePt >= 84) {
    zones.three_l_corner = 1;
    zones.three_r_corner = 1;
    zones.three_top = 1;
  } else if (attrs.threePt < 65) {
    zones.three_top = -1;
    zones.three_l_wing = -1;
  }
  return zones;
}

function createTeam(
  id: string,
  code: string,
  city: string,
  name: string,
  league: TeamLeague,
  conference: Conference,
  ovr: number,
  arenaName: string,
  primaryColor: string,
  secondaryColor: string,
  altColor: string,
  seeds: PlayerSeed[]
): TeamData {
  const players: PlayerData[] = seeds.map((seed, idx) => {
    const [pName, pos, pOvr, jersey, rawSkills = [], extra = {}] = seed;
    const h = hashSeed(`${id}_${pName}`);
    const defaultSkills: SignatureSkillId[] = [...rawSkills];
    if (defaultSkills.length === 0) {
      if (pos === 'PG') defaultSkills.push('dimer', 'pick_and_roll_maestro');
      else if (pos === 'SG') defaultSkills.push('catch_and_shoot', 'corner_specialist');
      else if (pos === 'SF') defaultSkills.push('finisher', 'active_hands');
      else if (pos === 'PF') defaultSkills.push('brick_wall', 'hustle_points');
      else defaultSkills.push('tenacious_rebounder', 'eraser');
    }
    const sigSkills: EquippedSignatureSkill[] = defaultSkills.slice(0, 5).map((sid) => ({
      id: sid,
      level: pOvr >= 90 ? 3 : pOvr >= 81 ? 2 : 1,
    }));
    const attrs = buildAttributesForPlayer(pName, pos, pOvr, defaultSkills);
    return {
      id: `${id}_p${idx}_${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name: pName,
      pos,
      jersey,
      ovr: pOvr,
      heightCm: extra.heightCm ?? POS_HEIGHT_CM[pos] + ((h % 7) - 3),
      weightLbs: POS_WEIGHT_LBS[pos] + ((h % 16) - 8),
      skinTone: extra.skinTone ?? SKIN_TONES[h % SKIN_TONES.length],
      hairStyle: extra.hairStyle ?? HAIR_STYLES[h % HAIR_STYLES.length],
      hairColor: '#151210',
      headband: extra.headband ?? (pName.includes('LeBron') || pName.includes('Carmelo') || pName.includes('Rondo') || pName.includes('Pierce')),
      armSleeve: extra.armSleeve ?? (pName.includes('LeBron') || pName.includes('Kobe') || pName.includes('Carmelo') || pName.includes('Paul George') || pName.includes('Wade')),
      legSleeve: extra.legSleeve ?? (pName.includes('Wade') || pName.includes('Rose') || pName.includes('Howard')),
      shoeColor: idx === 0 || pOvr >= 90 ? secondaryColor : '#f1f5f9',
      attrs,
      signatureSkills: sigSkills,
      hotZones: buildHotZones(attrs),
      releaseSpeed: pos === 'PG' || pos === 'SG' ? 0.62 : pos === 'C' ? 0.74 : 0.67,
      isStarter: idx < 5,
      teamId: id,
    };
  });

  return {
    id,
    code,
    city,
    name,
    fullName: `${city} ${name}`,
    league,
    conference,
    ovr,
    arenaName,
    primaryColor,
    secondaryColor,
    altColor,
    homeJerseyColor: '#f8fafc',
    awayJerseyColor: primaryColor,
    players,
  };
}

// ============================================================================
// ALL 30 AUTHENTIC 2013-14 NBA TEAMS
// ============================================================================
const EASTERN_NBA_TEAMS: TeamData[] = [
  createTeam('mia', 'MIA', 'Miami', 'Heat', 'NBA', 'EAST', 94, 'AmericanAirlines Arena', '#98002E', '#F9A01B', '#111111', [
    ['Mario Chalmers', 'PG', 75, 15, ['corner_specialist', 'pick_pocket']],
    ['Dwyane Wade', 'SG', 91, 3, ['finisher', 'acrobat', 'posterizer', 'closer', 'chasedown_artist']],
    ['LeBron James', 'SF', 99, 6, ['lebron_coast_to_coast', 'posterizer', 'finisher', 'dimer', 'lockdown_defender'], { heightCm: 203, headband: true, armSleeve: true }],
    ['Shane Battier', 'PF', 73, 31, ['corner_specialist', 'charge_card', 'lockdown_defender']],
    ['Chris Bosh', 'C', 82, 1, ['catch_and_shoot', 'screen_outlet', 'post_proficiency']],
    ['Ray Allen', 'SG', 79, 34, ['deadeye', 'catch_and_shoot', 'corner_specialist', 'closer']],
    ['Udonis Haslem', 'PF', 71, 40, ['brick_wall', 'bruiser', 'charge_card']],
    ['Chris Andersen', 'C', 73, 11, ['eraser', 'hustle_points', 'scrapper']],
    ['Norris Cole', 'PG', 72, 30, ['one_man_fastbreak', 'pick_dodger']],
    ['Rashard Lewis', 'SF', 71, 9, ['catch_and_shoot', 'corner_specialist']],
  ]),
  createTeam('ind', 'IND', 'Indiana', 'Pacers', 'NBA', 'EAST', 87, 'Bankers Life Fieldhouse', '#002D62', '#FDBB30', '#1E3A8A', [
    ['George Hill', 'PG', 78, 3, ['pick_dodger', 'catch_and_shoot']],
    ['Lance Stephenson', 'SG', 78, 1, ['ankle_breaker', 'flashy_passer', 'active_hands']],
    ['Paul George', 'SF', 88, 24, ['lockdown_defender', 'posterizer', 'deadeye', 'highlight_film']],
    ['David West', 'PF', 81, 21, ['post_proficiency', 'bruiser', 'brick_wall']],
    ['Roy Hibbert', 'C', 81, 55, ['eraser', 'defensive_anchor', 'brick_wall']],
    ['Danny Granger', 'SF', 78, 33, ['catch_and_shoot', 'shot_creator']],
    ['Luis Scola', 'PF', 76, 4, ['post_proficiency', 'hustle_points']],
    ['C.J. Watson', 'PG', 73, 32, ['catch_and_shoot', 'dimer']],
    ['Ian Mahinmi', 'C', 71, 28, ['bruiser', 'tenacious_rebounder']],
  ]),
  createTeam('chi', 'CHI', 'Chicago', 'Bulls', 'NBA', 'EAST', 86, 'United Center', '#CE1141', '#000000', '#FFFFFF', [
    ['Derrick Rose', 'PG', 92, 1, ['acrobat', 'finisher', 'ankle_breaker', 'one_man_fastbreak', 'closer']],
    ['Jimmy Butler', 'SG', 76, 21, ['lockdown_defender', 'active_hands', 'scrapper']],
    ['Luol Deng', 'SF', 79, 9, ['lockdown_defender', 'corner_specialist', 'hustle_points']],
    ['Carlos Boozer', 'PF', 77, 5, ['post_proficiency', 'tenacious_rebounder']],
    ['Joakim Noah', 'C', 82, 13, ['defensive_anchor', 'tenacious_rebounder', 'scrapper', 'post_playmaker']],
    ['Taj Gibson', 'PF', 75, 22, ['eraser', 'hustle_points']],
    ['Kirk Hinrich', 'PG', 74, 12, ['pick_dodger', 'charge_card']],
    ['Mike Dunleavy', 'SF', 73, 34, ['catch_and_shoot', 'corner_specialist']],
    ['Nazr Mohammed', 'C', 69, 48, ['brick_wall', 'bruiser']],
  ]),
  createTeam('bkn', 'BKN', 'Brooklyn', 'Nets', 'NBA', 'EAST', 85, 'Barclays Center', '#0A0A0A', '#E2E8F0', '#334155', [
    ['Deron Williams', 'PG', 86, 8, ['ankle_breaker', 'dimer', 'floor_general', 'pick_and_roll_maestro']],
    ['Joe Johnson', 'SG', 81, 7, ['closer', 'shot_creator', 'deadeye']],
    ['Paul Pierce', 'SF', 82, 34, ['closer', 'shot_creator', 'post_proficiency', 'deadeye']],
    ['Kevin Garnett', 'PF', 81, 2, ['defensive_anchor', 'brick_wall', 'screen_outlet', 'bruiser']],
    ['Brook Lopez', 'C', 82, 11, ['post_proficiency', 'eraser', 'finisher']],
    ['Andrei Kirilenko', 'SF', 77, 47, ['active_hands', 'interceptor', 'eraser']],
    ['Jason Terry', 'SG', 75, 31, ['microwave', 'catch_and_shoot']],
    ['Andray Blatche', 'PF', 75, 0, ['post_proficiency', 'hustle_points']],
    ['Shaun Livingston', 'PG', 72, 14, ['dimer', 'post_playmaker']],
  ]),
  createTeam('nyk', 'NYK', 'New York', 'Knicks', 'NBA', 'EAST', 84, 'Madison Square Garden', '#006BB6', '#F58426', '#1D428A', [
    ['Raymond Felton', 'PG', 76, 2, ['pick_and_roll_maestro', 'dimer']],
    ['Iman Shumpert', 'SG', 77, 21, ['lockdown_defender', 'pick_dodger', 'highlight_film']],
    ['Carmelo Anthony', 'SF', 92, 7, ['deadeye', 'shot_creator', 'closer', 'post_proficiency', 'microwave']],
    ['Andrea Bargnani', 'PF', 75, 77, ['catch_and_shoot', 'screen_outlet']],
    ['Tyson Chandler', 'C', 77, 6, ['defensive_anchor', 'alley_ooper', 'tenacious_rebounder', 'brick_wall']],
    ['J.R. Smith', 'SG', 81, 8, ['microwave', 'shot_creator', 'highlight_film', 'deadeye']],
    ["Amar'e Stoudemire", 'PF', 78, 1, ['finisher', 'posterizer', 'screen_outlet']],
    ['Metta World Peace', 'SF', 74, 51, ['bruiser', 'lockdown_defender']],
    ['Pablo Prigioni', 'PG', 72, 9, ['pick_pocket', 'dimer']],
  ]),
  createTeam('bos', 'BOS', 'Boston', 'Celtics', 'NBA', 'EAST', 79, 'TD Garden', '#007A33', '#FFFFFF', '#BA9653', [
    ['Rajon Rondo', 'PG', 90, 9, ['dimer', 'floor_general', 'flashy_passer', 'ankle_breaker', 'interceptor']],
    ['Avery Bradley', 'SG', 78, 0, ['lockdown_defender', 'pick_dodger', 'pick_pocket']],
    ['Jeff Green', 'SF', 79, 8, ['posterizer', 'highlight_film', 'one_man_fastbreak']],
    ['Brandon Bass', 'PF', 74, 30, ['catch_and_shoot', 'bruiser']],
    ['Jared Sullinger', 'C', 74, 7, ['tenacious_rebounder', 'hustle_points']],
    ['Gerald Wallace', 'SF', 74, 45, ['scrapper', 'active_hands']],
    ['Courtney Lee', 'SG', 74, 11, ['corner_specialist', 'pick_dodger']],
    ['Kelly Olynyk', 'C', 72, 41, ['screen_outlet', 'catch_and_shoot']],
    ['Kris Humphries', 'PF', 73, 43, ['tenacious_rebounder', 'brick_wall']],
  ]),
  createTeam('atl', 'ATL', 'Atlanta', 'Hawks', 'NBA', 'EAST', 81, 'Philips Arena', '#E03A3E', '#002B5C', '#C1D32F', [
    ['Jeff Teague', 'PG', 79, 0, ['one_man_fastbreak', 'pick_and_roll_maestro']],
    ['Kyle Korver', 'SG', 75, 26, ['deadeye', 'catch_and_shoot', 'corner_specialist', 'heat_retention']],
    ['DeMarre Carroll', 'SF', 73, 5, ['scrapper', 'corner_specialist']],
    ['Paul Millsap', 'PF', 81, 4, ['hustle_points', 'post_proficiency', 'active_hands']],
    ['Al Horford', 'C', 84, 15, ['screen_outlet', 'defensive_anchor', 'post_proficiency']],
    ['Lou Williams', 'SG', 78, 3, ['microwave', 'shot_creator']],
    ['Elton Brand', 'PF', 73, 42, ['brick_wall', 'eraser']],
    ['Dennis Schroder', 'PG', 71, 17, ['one_man_fastbreak', 'ankle_breaker']],
  ]),
  createTeam('cle', 'CLE', 'Cleveland', 'Cavaliers', 'NBA', 'EAST', 81, 'Quicken Loans Arena', '#6F263D', '#FFB81C', '#041E42', [
    ['Kyrie Irving', 'PG', 88, 2, ['ankle_breaker', 'acrobat', 'shot_creator', 'closer', 'deadeye']],
    ['Dion Waiters', 'SG', 77, 3, ['microwave', 'shot_creator']],
    ['Earl Clark', 'SF', 73, 6, ['active_hands', 'hustle_points']],
    ['Tristan Thompson', 'PF', 75, 13, ['tenacious_rebounder', 'hustle_points', 'scrapper']],
    ['Anderson Varejao', 'C', 77, 17, ['charge_card', 'tenacious_rebounder', 'scrapper']],
    ['Andrew Bynum', 'C', 80, 21, ['post_proficiency', 'eraser', 'bruiser']],
    ['Jarrett Jack', 'PG', 78, 1, ['pick_and_roll_maestro', 'closer']],
    ['Anthony Bennett', 'PF', 75, 15, ['posterizer', 'screen_outlet']],
    ['C.J. Miles', 'SG', 72, 0, ['catch_and_shoot', 'corner_specialist']],
  ]),
  createTeam('det', 'DET', 'Detroit', 'Pistons', 'NBA', 'EAST', 80, 'The Palace of Auburn Hills', '#C8102E', '#1D42BA', '#BEC0C2', [
    ['Brandon Jennings', 'PG', 81, 7, ['ankle_breaker', 'flashy_passer', 'microwave']],
    ['Rodney Stuckey', 'SG', 75, 3, ['finisher', 'bruiser']],
    ['Josh Smith', 'SF', 84, 6, ['highlight_film', 'chasedown_artist', 'eraser', 'posterizer']],
    ['Greg Monroe', 'PF', 80, 10, ['post_proficiency', 'post_playmaker', 'tenacious_rebounder']],
    ['Andre Drummond', 'C', 77, 0, ['alley_ooper', 'tenacious_rebounder', 'eraser', 'hustle_points']],
    ['Chauncey Billups', 'PG', 76, 1, ['floor_general', 'closer', 'catch_and_shoot']],
    ['Kentavious Caldwell-Pope', 'SG', 73, 5, ['pick_dodger', 'catch_and_shoot']],
    ['Will Bynum', 'PG', 72, 12, ['one_man_fastbreak', 'acrobat']],
  ]),
  createTeam('tor', 'TOR', 'Toronto', 'Raptors', 'NBA', 'EAST', 80, 'Air Canada Centre', '#CE1141', '#111111', '#A1A1AA', [
    ['Kyle Lowry', 'PG', 81, 7, ['charge_card', 'pick_pocket', 'floor_general', 'scrapper']],
    ['DeMar DeRozan', 'SG', 79, 10, ['posterizer', 'shot_creator', 'acrobat', 'highlight_film']],
    ['Rudy Gay', 'SF', 85, 22, ['posterizer', 'closer', 'shot_creator', 'finisher']],
    ['Amir Johnson', 'PF', 75, 15, ['brick_wall', 'hustle_points', 'scrapper']],
    ['Jonas Valanciunas', 'C', 75, 17, ['post_proficiency', 'tenacious_rebounder']],
    ['Terrence Ross', 'SG', 74, 31, ['highlight_film', 'posterizer', 'corner_specialist']],
    ['Tyler Hansbrough', 'PF', 72, 50, ['bruiser', 'scrapper', 'hustle_points']],
    ['Landry Fields', 'SF', 71, 2, ['active_hands', 'scrapper']],
  ]),
  createTeam('was', 'WAS', 'Washington', 'Wizards', 'NBA', 'EAST', 80, 'Verizon Center', '#002B5C', '#E31837', '#C4CED4', [
    ['John Wall', 'PG', 85, 2, ['one_man_fastbreak', 'dimer', 'chasedown_artist', 'ankle_breaker']],
    ['Bradley Beal', 'SG', 78, 3, ['catch_and_shoot', 'deadeye', 'shot_creator']],
    ['Trevor Ariza', 'SF', 74, 1, ['corner_specialist', 'interceptor', 'lockdown_defender']],
    ['Nene', 'PF', 78, 42, ['bruiser', 'post_proficiency', 'brick_wall']],
    ['Emeka Okafor', 'C', 76, 50, ['eraser', 'tenacious_rebounder']],
    ['Otto Porter', 'SF', 74, 22, ['active_hands', 'catch_and_shoot']],
    ['Martell Webster', 'SG', 73, 9, ['corner_specialist', 'catch_and_shoot']],
    ['Trevor Booker', 'PF', 72, 35, ['hustle_points', 'scrapper']],
  ]),
  createTeam('mil', 'MIL', 'Milwaukee', 'Bucks', 'NBA', 'EAST', 77, 'BMO Harris Bradley Center', '#00471B', '#CE1141', '#EEE1C6', [
    ['Brandon Knight', 'PG', 76, 11, ['shot_creator', 'one_man_fastbreak']],
    ['O.J. Mayo', 'SG', 78, 0, ['deadeye', 'microwave', 'shot_creator']],
    ['Caron Butler', 'SF', 75, 3, ['closer', 'bruiser']],
    ['Ersan Ilyasova', 'PF', 77, 7, ['charge_card', 'catch_and_shoot', 'hustle_points']],
    ['Larry Sanders', 'C', 79, 8, ['eraser', 'defensive_anchor', 'tenacious_rebounder']],
    ['Giannis Antetokounmpo', 'SF', 68, 34, ['highlight_film', 'chasedown_artist', 'one_man_fastbreak'], { heightCm: 211 }],
    ['John Henson', 'PF', 74, 31, ['eraser', 'hustle_points']],
    ['Luke Ridnour', 'PG', 73, 13, ['dimer', 'pick_and_roll_maestro']],
  ]),
  createTeam('cha', 'CHA', 'Charlotte', 'Bobcats', 'NBA', 'EAST', 76, 'Time Warner Cable Arena', '#002B5C', '#F26522', '#7BAFD4', [
    ['Kemba Walker', 'PG', 79, 15, ['ankle_breaker', 'closer', 'one_man_fastbreak']],
    ['Gerald Henderson', 'SG', 76, 9, ['posterizer', 'shot_creator']],
    ['Michael Kidd-Gilchrist', 'SF', 75, 14, ['lockdown_defender', 'scrapper', 'chasedown_artist']],
    ['Cody Zeller', 'PF', 72, 40, ['screen_outlet', 'hustle_points']],
    ['Al Jefferson', 'C', 84, 25, ['post_proficiency', 'finisher', 'tenacious_rebounder']],
    ['Ben Gordon', 'SG', 74, 8, ['microwave', 'deadeye']],
    ['Ramon Sessions', 'PG', 74, 7, ['finisher', 'pick_and_roll_maestro']],
    ['Bismack Biyombo', 'C', 71, 0, ['eraser', 'tenacious_rebounder']],
  ]),
  createTeam('orl', 'ORL', 'Orlando', 'Magic', 'NBA', 'EAST', 75, 'Amway Center', '#0077C0', '#C4CED4', '#000000', [
    ['Jameer Nelson', 'PG', 75, 14, ['floor_general', 'pick_and_roll_maestro']],
    ['Arron Afflalo', 'SG', 78, 4, ['catch_and_shoot', 'lockdown_defender']],
    ['Tobias Harris', 'SF', 76, 12, ['finisher', 'hustle_points']],
    ['Glen Davis', 'PF', 75, 11, ['bruiser', 'charge_card', 'brick_wall']],
    ['Nikola Vucevic', 'C', 79, 9, ['tenacious_rebounder', 'post_proficiency', 'break_starter']],
    ['Victor Oladipo', 'SG', 76, 5, ['pick_pocket', 'highlight_film', 'one_man_fastbreak']],
    ['Maurice Harkless', 'SF', 73, 21, ['active_hands', 'chasedown_artist']],
    ['Andrew Nicholson', 'PF', 71, 44, ['post_proficiency', 'catch_and_shoot']],
  ]),
  createTeam('phi', 'PHI', 'Philadelphia', '76ers', 'NBA', 'EAST', 73, 'Wells Fargo Center', '#006BB6', '#ED174C', '#FFFFFF', [
    ['Michael Carter-Williams', 'PG', 74, 1, ['interceptor', 'dimer', 'one_man_fastbreak']],
    ['Evan Turner', 'SG', 76, 12, ['shot_creator', 'acrobat']],
    ['Thaddeus Young', 'SF', 78, 21, ['hustle_points', 'pick_pocket', 'scrapper']],
    ['Lavoy Allen', 'PF', 70, 50, ['brick_wall', 'hustle_points']],
    ['Spencer Hawes', 'C', 75, 0, ['post_playmaker', 'screen_outlet']],
    ['Nerlens Noel', 'C', 73, 4, ['eraser', 'chasedown_artist', 'active_hands']],
    ['Tony Wroten', 'PG', 72, 8, ['acrobat', 'flashy_passer']],
    ['Jason Richardson', 'SG', 74, 23, ['highlight_film', 'corner_specialist']],
  ]),
];

const WESTERN_NBA_TEAMS: TeamData[] = [
  createTeam('sas', 'SAS', 'San Antonio', 'Spurs', 'NBA', 'WEST', 92, 'AT&T Center', '#111111', '#C4CED4', '#475569', [
    ['Tony Parker', 'PG', 88, 9, ['acrobat', 'finisher', 'pick_and_roll_maestro', 'floor_general']],
    ['Danny Green', 'SG', 76, 4, ['corner_specialist', 'catch_and_shoot', 'chasedown_artist']],
    ['Kawhi Leonard', 'SF', 81, 2, ['lockdown_defender', 'pick_pocket', 'active_hands', 'corner_specialist']],
    ['Tim Duncan', 'PF', 87, 21, ['post_proficiency', 'defensive_anchor', 'eraser', 'brick_wall', 'anti_freeze']],
    ['Tiago Splitter', 'C', 75, 22, ['brick_wall', 'screen_outlet']],
    ['Manu Ginobili', 'SG', 81, 20, ['acrobat', 'flashy_passer', 'closer', 'charge_card']],
    ['Boris Diaw', 'PF', 74, 33, ['post_playmaker', 'dimer']],
    ['Marco Belinelli', 'SG', 74, 3, ['catch_and_shoot', 'corner_specialist']],
    ['Patty Mills', 'PG', 73, 8, ['microwave', 'catch_and_shoot']],
  ]),
  createTeam('okc', 'OKC', 'Oklahoma City', 'Thunder', 'NBA', 'WEST', 91, 'Chesapeake Energy Arena', '#007AC1', '#EF3B24', '#FDBB30', [
    ['Russell Westbrook', 'PG', 91, 0, ['one_man_fastbreak', 'posterizer', 'finisher', 'highlight_film', 'scrapper']],
    ['Thabo Sefolosha', 'SG', 74, 25, ['lockdown_defender', 'pick_dodger', 'corner_specialist']],
    ['Kevin Durant', 'SF', 94, 35, ['deadeye', 'shot_creator', 'closer', 'finisher', 'heat_retention'], { heightCm: 208 }],
    ['Serge Ibaka', 'PF', 80, 9, ['eraser', 'defensive_anchor', 'screen_outlet']],
    ['Kendrick Perkins', 'C', 72, 5, ['brick_wall', 'bruiser']],
    ['Reggie Jackson', 'PG', 75, 15, ['finisher', 'one_man_fastbreak']],
    ['Jeremy Lamb', 'SG', 73, 11, ['shot_creator', 'catch_and_shoot']],
    ['Nick Collison', 'PF', 72, 4, ['charge_card', 'brick_wall', 'scrapper']],
    ['Steven Adams', 'C', 71, 12, ['bruiser', 'brick_wall', 'tenacious_rebounder']],
  ]),
  createTeam('lac', 'LAC', 'Los Angeles', 'Clippers', 'NBA', 'WEST', 90, 'Staples Center', '#C8102E', '#1D428A', '#0F172A', [
    ['Chris Paul', 'PG', 94, 3, ['floor_general', 'dimer', 'ankle_breaker', 'pick_pocket', 'pick_and_roll_maestro']],
    ['J.J. Redick', 'SG', 75, 4, ['deadeye', 'catch_and_shoot', 'corner_specialist']],
    ['Jared Dudley', 'SF', 75, 9, ['corner_specialist', 'catch_and_shoot']],
    ['Blake Griffin', 'PF', 87, 32, ['posterizer', 'highlight_film', 'alley_ooper', 'finisher']],
    ['DeAndre Jordan', 'C', 78, 6, ['alley_ooper', 'eraser', 'tenacious_rebounder', 'highlight_film']],
    ['Jamal Crawford', 'SG', 80, 11, ['ankle_breaker', 'microwave', 'shot_creator', 'deadeye']],
    ['Matt Barnes', 'SF', 75, 22, ['bruiser', 'scrapper', 'corner_specialist']],
    ['Darren Collison', 'PG', 75, 2, ['one_man_fastbreak', 'dimer']],
    ['Antawn Jamison', 'PF', 74, 33, ['hustle_points', 'catch_and_shoot']],
  ]),
  createTeam('hou', 'HOU', 'Houston', 'Rockets', 'NBA', 'WEST', 88, 'Toyota Center', '#CE1141', '#C4CED4', '#000000', [
    ['Jeremy Lin', 'PG', 77, 7, ['pick_and_roll_maestro', 'finisher']],
    ['James Harden', 'SG', 89, 13, ['acrobat', 'finisher', 'shot_creator', 'ankle_breaker', 'closer']],
    ['Chandler Parsons', 'SF', 78, 25, ['catch_and_shoot', 'one_man_fastbreak', 'corner_specialist']],
    ['Omer Asik', 'PF', 76, 3, ['tenacious_rebounder', 'brick_wall', 'eraser']],
    ['Dwight Howard', 'C', 91, 12, ['defensive_anchor', 'eraser', 'tenacious_rebounder', 'posterizer', 'bruiser']],
    ['Patrick Beverley', 'PG', 74, 2, ['lockdown_defender', 'scrapper', 'pick_dodger']],
    ['Francisco Garcia', 'SF', 72, 32, ['corner_specialist', 'catch_and_shoot']],
    ['Terrence Jones', 'PF', 73, 6, ['hustle_points', 'chasedown_artist']],
    ['Donatas Motiejunas', 'PF', 71, 20, ['post_proficiency', 'screen_outlet']],
  ]),
  createTeam('gsw', 'GSW', 'Golden State', 'Warriors', 'NBA', 'WEST', 87, 'Oracle Arena', '#1D428A', '#FFC72C', '#0F172A', [
    ['Stephen Curry', 'PG', 88, 30, ['deadeye', 'shot_creator', 'microwave', 'heat_retention', 'dimer']],
    ['Klay Thompson', 'SG', 79, 11, ['catch_and_shoot', 'deadeye', 'corner_specialist']],
    ['Andre Iguodala', 'SF', 84, 9, ['lockdown_defender', 'highlight_film', 'active_hands', 'one_man_fastbreak']],
    ['David Lee', 'PF', 81, 10, ['hustle_points', 'screen_outlet', 'tenacious_rebounder']],
    ['Andrew Bogut', 'C', 78, 12, ['defensive_anchor', 'brick_wall', 'eraser']],
    ['Harrison Barnes', 'SF', 77, 40, ['posterizer', 'corner_specialist']],
    ['Draymond Green', 'PF', 72, 23, ['scrapper', 'defensive_anchor', 'bruiser']],
    ['Marreese Speights', 'C', 73, 5, ['screen_outlet', 'charge_card']],
    ['Toney Douglas', 'PG', 71, 0, ['pick_dodger', 'pick_pocket']],
  ]),
  createTeam('mem', 'MEM', 'Memphis', 'Grizzlies', 'NBA', 'WEST', 85, 'FedExForum', '#5D76A9', '#12173F', '#F5B112', [
    ['Mike Conley', 'PG', 83, 11, ['floor_general', 'pick_pocket', 'pick_and_roll_maestro', 'anti_freeze']],
    ['Tony Allen', 'SG', 76, 9, ['lockdown_defender', 'pick_dodger', 'active_hands', 'scrapper']],
    ['Tayshaun Prince', 'SF', 74, 21, ['lockdown_defender', 'active_hands']],
    ['Zach Randolph', 'PF', 83, 50, ['post_proficiency', 'bruiser', 'tenacious_rebounder', 'hustle_points']],
    ['Marc Gasol', 'C', 85, 33, ['defensive_anchor', 'post_playmaker', 'eraser', 'brick_wall']],
    ['Jerryd Bayless', 'PG', 75, 7, ['microwave', 'shot_creator']],
    ['Mike Miller', 'SF', 74, 13, ['catch_and_shoot', 'corner_specialist']],
    ['Quincy Pondexter', 'SF', 73, 20, ['corner_specialist', 'pick_dodger']],
    ['Ed Davis', 'PF', 73, 32, ['hustle_points', 'eraser']],
  ]),
  createTeam('lal', 'LAL', 'Los Angeles', 'Lakers', 'NBA', 'WEST', 84, 'Staples Center', '#552583', '#FDB927', '#111111', [
    ['Steve Nash', 'PG', 80, 10, ['dimer', 'floor_general', 'flashy_passer', 'pick_and_roll_maestro']],
    ['Kobe Bryant', 'SG', 93, 24, ['closer', 'deadeye', 'shot_creator', 'post_proficiency', 'acrobat']],
    ['Nick Young', 'SF', 76, 0, ['microwave', 'shot_creator']],
    ['Pau Gasol', 'PF', 81, 16, ['post_proficiency', 'post_playmaker', 'break_starter']],
    ['Chris Kaman', 'C', 75, 9, ['post_proficiency', 'brick_wall']],
    ['Jordan Farmar', 'PG', 74, 1, ['one_man_fastbreak', 'catch_and_shoot']],
    ['Jodie Meeks', 'SG', 72, 20, ['corner_specialist', 'catch_and_shoot']],
    ['Wesley Johnson', 'SF', 72, 11, ['highlight_film', 'corner_specialist']],
    ['Jordan Hill', 'PF', 73, 27, ['hustle_points', 'tenacious_rebounder']],
  ]),
  createTeam('den', 'DEN', 'Denver', 'Nuggets', 'NBA', 'WEST', 83, 'Pepsi Center', '#0E2240', '#FEC524', '#418FDE', [
    ['Ty Lawson', 'PG', 83, 3, ['one_man_fastbreak', 'dimer', 'ankle_breaker']],
    ['Randy Foye', 'SG', 75, 4, ['catch_and_shoot', 'corner_specialist']],
    ['Danilo Gallinari', 'SF', 78, 8, ['deadeye', 'shot_creator']],
    ['Kenneth Faried', 'PF', 80, 35, ['scrapper', 'hustle_points', 'tenacious_rebounder', 'highlight_film']],
    ['JaVale McGee', 'C', 76, 34, ['eraser', 'alley_ooper', 'highlight_film']],
    ['Nate Robinson', 'PG', 79, 10, ['microwave', 'highlight_film', 'ankle_breaker']],
    ['Wilson Chandler', 'SF', 77, 21, ['finisher', 'corner_specialist']],
    ['Andre Miller', 'PG', 76, 24, ['alley_ooper', 'post_playmaker', 'dimer']],
    ['J.J. Hickson', 'PF', 76, 7, ['hustle_points', 'tenacious_rebounder']],
  ]),
  createTeam('por', 'POR', 'Portland', 'Trail Blazers', 'NBA', 'WEST', 83, 'Moda Center', '#E03A3E', '#111111', '#CBD5E1', [
    ['Damian Lillard', 'PG', 82, 0, ['closer', 'shot_creator', 'deadeye', 'pick_and_roll_maestro']],
    ['Wesley Matthews', 'SG', 77, 2, ['catch_and_shoot', 'corner_specialist', 'bruiser']],
    ['Nicolas Batum', 'SF', 79, 88, ['active_hands', 'dimer', 'catch_and_shoot']],
    ['LaMarcus Aldridge', 'PF', 86, 12, ['post_proficiency', 'screen_outlet', 'deadeye', 'anti_freeze']],
    ['Robin Lopez', 'C', 74, 42, ['brick_wall', 'hustle_points', 'eraser']],
    ['Mo Williams', 'PG', 76, 25, ['microwave', 'catch_and_shoot']],
    ['C.J. McCollum', 'SG', 73, 3, ['shot_creator', 'ankle_breaker']],
    ['Thomas Robinson', 'PF', 73, 41, ['scrapper', 'hustle_points']],
    ['Dorell Wright', 'SF', 72, 1, ['corner_specialist', 'catch_and_shoot']],
  ]),
  createTeam('min', 'MIN', 'Minnesota', 'Timberwolves', 'NBA', 'WEST', 82, 'Target Center', '#0C2340', '#236192', '#78BE20', [
    ['Ricky Rubio', 'PG', 81, 9, ['dimer', 'flashy_passer', 'interceptor', 'pick_pocket']],
    ['Kevin Martin', 'SG', 78, 23, ['deadeye', 'catch_and_shoot', 'microwave']],
    ['Corey Brewer', 'SF', 74, 13, ['one_man_fastbreak', 'interceptor', 'scrapper']],
    ['Kevin Love', 'PF', 89, 42, ['tenacious_rebounder', 'break_starter', 'catch_and_shoot', 'screen_outlet', 'deadeye']],
    ['Nikola Pekovic', 'C', 79, 14, ['bruiser', 'brick_wall', 'post_proficiency']],
    ['Chase Budinger', 'SF', 75, 10, ['catch_and_shoot', 'highlight_film']],
    ['Derrick Williams', 'PF', 74, 7, ['posterizer', 'highlight_film']],
    ['J.J. Barea', 'PG', 74, 11, ['acrobat', 'pick_and_roll_maestro']],
    ['Alexey Shved', 'SG', 72, 1, ['flashy_passer', 'catch_and_shoot']],
  ]),
  createTeam('dal', 'DAL', 'Dallas', 'Mavericks', 'NBA', 'WEST', 82, 'American Airlines Center', '#00538C', '#B8C4CA', '#002B5E', [
    ['Jose Calderon', 'PG', 77, 8, ['floor_general', 'catch_and_shoot', 'dimer']],
    ['Monta Ellis', 'SG', 82, 11, ['acrobat', 'one_man_fastbreak', 'shot_creator', 'ankle_breaker']],
    ['Shawn Marion', 'SF', 77, 0, ['lockdown_defender', 'active_hands', 'hustle_points']],
    ['Dirk Nowitzki', 'PF', 84, 41, ['deadeye', 'post_proficiency', 'closer', 'screen_outlet', 'anti_freeze']],
    ['Samuel Dalembert', 'C', 73, 1, ['eraser', 'tenacious_rebounder']],
    ['Vince Carter', 'SG', 76, 25, ['highlight_film', 'closer', 'catch_and_shoot']],
    ['Devin Harris', 'PG', 75, 20, ['one_man_fastbreak', 'charge_card']],
    ['Brandan Wright', 'PF', 74, 34, ['alley_ooper', 'finisher']],
    ['Shane Larkin', 'PG', 71, 3, ['one_man_fastbreak', 'pick_pocket']],
  ]),
  createTeam('nop', 'NOP', 'New Orleans', 'Pelicans', 'NBA', 'WEST', 81, 'New Orleans Arena', '#0C2340', '#C8102E', '#85714D', [
    ['Jrue Holiday', 'PG', 82, 11, ['lockdown_defender', 'dimer', 'pick_pocket']],
    ['Eric Gordon', 'SG', 79, 10, ['deadeye', 'shot_creator', 'finisher']],
    ['Tyreke Evans', 'SF', 80, 1, ['acrobat', 'finisher', 'ankle_breaker']],
    ['Anthony Davis', 'PF', 83, 23, ['eraser', 'alley_ooper', 'defensive_anchor', 'tenacious_rebounder', 'hustle_points']],
    ['Jason Smith', 'C', 72, 14, ['screen_outlet', 'brick_wall']],
    ['Ryan Anderson', 'PF', 78, 33, ['catch_and_shoot', 'deadeye', 'screen_outlet']],
    ['Al-Farouq Aminu', 'SF', 73, 0, ['active_hands', 'scrapper']],
    ['Austin Rivers', 'PG', 71, 25, ['ankle_breaker', 'shot_creator']],
    ['Anthony Morrow', 'SG', 72, 3, ['corner_specialist', 'catch_and_shoot']],
  ]),
  createTeam('sac', 'SAC', 'Sacramento', 'Kings', 'NBA', 'WEST', 78, 'Sleep Train Arena', '#5A2D81', '#63727A', '#111111', [
    ['Greivis Vasquez', 'PG', 75, 21, ['dimer', 'floor_general']],
    ['Ben McLemore', 'SG', 74, 16, ['highlight_film', 'catch_and_shoot']],
    ['John Salmons', 'SF', 73, 5, ['shot_creator', 'active_hands']],
    ['Patrick Patterson', 'PF', 74, 9, ['screen_outlet', 'catch_and_shoot']],
    ['DeMarcus Cousins', 'C', 83, 15, ['post_proficiency', 'bruiser', 'tenacious_rebounder', 'hustle_points']],
    ['Isaiah Thomas', 'PG', 77, 22, ['microwave', 'acrobat', 'ankle_breaker']],
    ['Marcus Thornton', 'SG', 75, 23, ['microwave', 'catch_and_shoot']],
    ['Carl Landry', 'PF', 76, 24, ['bruiser', 'hustle_points']],
    ['Jimmer Fredette', 'PG', 71, 7, ['deadeye', 'catch_and_shoot']],
  ]),
  createTeam('uta', 'UTA', 'Utah', 'Jazz', 'NBA', 'WEST', 76, 'EnergySolutions Arena', '#002B5C', '#00471B', '#F9A01B', [
    ['Trey Burke', 'PG', 74, 3, ['pick_and_roll_maestro', 'closer']],
    ['Gordon Hayward', 'SG', 77, 20, ['shot_creator', 'chasedown_artist', 'dimer']],
    ['Richard Jefferson', 'SF', 73, 24, ['corner_specialist', 'catch_and_shoot']],
    ['Derrick Favors', 'PF', 78, 15, ['eraser', 'bruiser', 'tenacious_rebounder']],
    ['Enes Kanter', 'C', 75, 0, ['post_proficiency', 'hustle_points']],
    ['Alec Burks', 'SG', 73, 10, ['acrobat', 'finisher']],
    ['Marvin Williams', 'PF', 72, 2, ['corner_specialist', 'screen_outlet']],
    ['Rudy Gobert', 'C', 68, 27, ['eraser', 'defensive_anchor', 'alley_ooper'], { heightCm: 216 }],
  ]),
  createTeam('phx', 'PHX', 'Phoenix', 'Suns', 'NBA', 'WEST', 76, 'US Airways Center', '#1D1160', '#E56020', '#63727A', [
    ['Eric Bledsoe', 'PG', 79, 2, ['one_man_fastbreak', 'chasedown_artist', 'pick_pocket']],
    ['Goran Dragic', 'SG', 79, 1, ['acrobat', 'one_man_fastbreak', 'pick_and_roll_maestro']],
    ['P.J. Tucker', 'SF', 72, 17, ['lockdown_defender', 'bruiser', 'corner_specialist', 'scrapper']],
    ['Markieff Morris', 'PF', 74, 11, ['post_proficiency', 'bruiser']],
    ['Marcin Gortat', 'C', 77, 4, ['brick_wall', 'screen_outlet', 'tenacious_rebounder']],
    ['Gerald Green', 'SG', 74, 14, ['posterizer', 'highlight_film', 'microwave']],
    ['Channing Frye', 'PF', 73, 8, ['catch_and_shoot', 'screen_outlet']],
    ['Alex Len', 'C', 72, 21, ['eraser', 'brick_wall']],
    ['Marcus Morris', 'SF', 72, 15, ['catch_and_shoot', 'bruiser']],
  ]),
];

// ============================================================================
// ALL 14 OFFICIAL NBA 2K14 EUROLEAGUE TEAMS
// ============================================================================
const EUROLEAGUE_TEAMS: TeamData[] = [
  createTeam('euro_fcb', 'FCB', 'FC', 'Barcelona', 'EUROLEAGUE', 'EURO', 79, 'Palau Blaugrana', '#004D98', '#A50044', '#EDBB00', [
    ['Marcelinho Huertas', 'PG', 77, 9, ['dimer', 'floor_general']],
    ['Juan Carlos Navarro', 'SG', 80, 11, ['deadeye', 'acrobat', 'closer']],
    ['Kostas Papanikolaou', 'SF', 76, 16, ['active_hands', 'corner_specialist']],
    ['Erazem Lorbek', 'PF', 76, 25, ['post_proficiency', 'screen_outlet']],
    ['Ante Tomic', 'C', 78, 44, ['post_proficiency', 'post_playmaker']],
    ['Brad Oleson', 'SG', 74, 24, ['catch_and_shoot']],
    ['Joey Dorsey', 'C', 74, 6, ['tenacious_rebounder', 'bruiser']],
    ['Victor Sada', 'PG', 73, 8, ['pick_dodger', 'dimer']],
  ]),
  createTeam('euro_rma', 'RMA', 'Real', 'Madrid', 'EUROLEAGUE', 'EURO', 80, 'Palacio de Deportes', '#F8FAFC', '#1D428A', '#F9A01B', [
    ['Sergio Rodriguez', 'PG', 78, 13, ['flashy_passer', 'dimer', 'ankle_breaker']],
    ['Sergio Llull', 'SG', 78, 23, ['closer', 'one_man_fastbreak']],
    ['Rudy Fernandez', 'SF', 81, 5, ['highlight_film', 'deadeye', 'interceptor']],
    ['Nikola Mirotic', 'PF', 79, 12, ['catch_and_shoot', 'screen_outlet', 'post_proficiency']],
    ['Ioannis Bourousis', 'C', 76, 30, ['brick_wall', 'tenacious_rebounder']],
    ['Jaycee Carroll', 'SG', 76, 20, ['catch_and_shoot', 'microwave']],
    ['Felipe Reyes', 'PF', 76, 9, ['hustle_points', 'scrapper']],
    ['Salah Mejri', 'C', 73, 50, ['eraser', 'alley_ooper']],
  ]),
  createTeam('euro_csk', 'CSK', 'CSKA', 'Moscow', 'EUROLEAGUE', 'EURO', 80, 'Universal Sports Hall', '#C8102E', '#002F6C', '#FFFFFF', [
    ['Milos Teodosic', 'PG', 80, 4, ['dimer', 'flashy_passer', 'deadeye']],
    ['Sonny Weems', 'SG', 79, 13, ['highlight_film', 'shot_creator']],
    ['Viktor Khryapa', 'SF', 77, 31, ['defensive_anchor', 'post_playmaker']],
    ['Kyle Hines', 'PF', 76, 42, ['bruiser', 'scrapper', 'brick_wall']],
    ['Nenad Krstic', 'C', 79, 12, ['post_proficiency', 'finisher']],
    ['Vitaly Fridzon', 'SG', 74, 7, ['corner_specialist', 'catch_and_shoot']],
    ['Aaron Jackson', 'PG', 74, 9, ['one_man_fastbreak', 'pick_pocket']],
    ['Sasha Kaun', 'C', 75, 24, ['brick_wall', 'eraser']],
  ]),
  createTeam('euro_oly', 'OLY', 'Olympiacos', 'Piraeus', 'EUROLEAGUE', 'EURO', 78, 'Peace and Friendship Stadium', '#D71920', '#FFFFFF', '#111111', [
    ['Vassilis Spanoulis', 'PG', 81, 7, ['closer', 'pick_and_roll_maestro', 'deadeye']],
    ['Kostas Sloukas', 'SG', 75, 10, ['dimer', 'catch_and_shoot']],
    ['Stratos Perperoglou', 'SF', 74, 16, ['corner_specialist', 'active_hands']],
    ['Georgios Printezis', 'PF', 77, 15, ['post_proficiency', 'closer', 'hustle_points']],
    ['Bryant Dunston', 'C', 76, 6, ['eraser', 'tenacious_rebounder']],
    ['Matt Lojeski', 'SG', 74, 24, ['catch_and_shoot']],
    ['Vangelis Mantzaris', 'PG', 73, 17, ['lockdown_defender', 'pick_dodger']],
    ['Cedric Simmons', 'C', 72, 12, ['brick_wall', 'eraser']],
  ]),
  createTeam('euro_pao', 'PAO', 'Panathinaikos', 'Athens', 'EUROLEAGUE', 'EURO', 78, 'OAKA Indoor Hall', '#006B3F', '#FFFFFF', '#D4AF37', [
    ['Dimitris Diamantidis', 'PG', 80, 13, ['floor_general', 'lockdown_defender', 'dimer', 'closer']],
    ['Roko Ukic', 'SG', 74, 6, ['one_man_fastbreak', 'acrobat']],
    ['Jonas Maciulis', 'SF', 76, 8, ['bruiser', 'corner_specialist']],
    ['James Gist', 'PF', 75, 14, ['alley_ooper', 'highlight_film']],
    ['Mike Batiste', 'C', 75, 15, ['brick_wall', 'post_proficiency']],
    ['Stephane Lasme', 'C', 76, 7, ['eraser', 'defensive_anchor']],
    ['Antonis Fotsis', 'PF', 74, 9, ['catch_and_shoot', 'screen_outlet']],
    ['Nikos Pappas', 'SG', 73, 11, ['shot_creator']],
  ]),
  createTeam('euro_mac', 'MAC', 'Maccabi Electra', 'Tel Aviv', 'EUROLEAGUE', 'EURO', 77, 'Nokia Arena', '#FDBB30', '#0038A8', '#111111', [
    ['Ricky Hickman', 'PG', 76, 7, ['one_man_fastbreak', 'closer']],
    ['Devin Smith', 'SG', 77, 6, ['catch_and_shoot', 'active_hands']],
    ['David Blu', 'SF', 75, 10, ['deadeye', 'corner_specialist']],
    ['Shawn James', 'PF', 75, 5, ['eraser', 'tenacious_rebounder']],
    ['Sofoklis Schortsanitis', 'C', 76, 21, ['bruiser', 'brick_wall', 'post_proficiency']],
    ['Tyrese Rice', 'PG', 75, 4, ['closer', 'ankle_breaker']],
    ['Alex Tyus', 'C', 74, 9, ['alley_ooper', 'eraser']],
    ['Yogev Ohayon', 'PG', 72, 12, ['pick_dodger', 'dimer']],
  ]),
  createTeam('euro_fen', 'FEN', 'Fenerbahce Ulker', 'Istanbul', 'EUROLEAGUE', 'EURO', 78, 'Ulker Sports Arena', '#002D72', '#FFED00', '#111111', [
    ['Bo McCalebb', 'PG', 79, 4, ['one_man_fastbreak', 'acrobat', 'finisher']],
    ['Bojan Bogdanovic', 'SG', 78, 44, ['deadeye', 'catch_and_shoot', 'shot_creator']],
    ['Emir Preldzic', 'SF', 76, 55, ['dimer', 'post_playmaker']],
    ['Linas Kleiza', 'PF', 77, 11, ['post_proficiency', 'catch_and_shoot']],
    ['Luka Zoric', 'C', 75, 22, ['screen_outlet', 'hustle_points']],
    ['Nemanja Bjelica', 'PF', 76, 8, ['break_starter', 'catch_and_shoot']],
    ['Omer Onan', 'SG', 73, 7, ['lockdown_defender', 'pick_dodger']],
    ['Gasper Vidmar', 'C', 73, 24, ['brick_wall', 'bruiser']],
  ]),
  createTeam('euro_efs', 'EFS', 'Anadolu Efes', 'Istanbul', 'EUROLEAGUE', 'EURO', 76, 'Abdi Ipekci Arena', '#003876', '#E31837', '#FFFFFF', [
    ['Zoran Planinic', 'PG', 76, 34, ['floor_general', 'dimer']],
    ['Jamon Gordon', 'SG', 76, 22, ['pick_pocket', 'active_hands', 'finisher']],
    ['Scotty Hopson', 'SF', 75, 32, ['highlight_film', 'shot_creator']],
    ['Dusko Savanovic', 'PF', 75, 20, ['post_proficiency', 'catch_and_shoot']],
    ['Kerem Gonlum', 'C', 75, 12, ['tenacious_rebounder', 'scrapper']],
    ['Semih Erden', 'C', 74, 9, ['brick_wall', 'eraser']],
    ['Kostas Vasileiadis', 'SG', 74, 7, ['corner_specialist', 'catch_and_shoot']],
    ['Dogus Balbay', 'PG', 71, 4, ['lockdown_defender']],
  ]),
  createTeam('euro_mil', 'MIL', 'EA7 Emporio Armani', 'Milano', 'EUROLEAGUE', 'EURO', 76, 'Mediolanum Forum', '#CE1141', '#FFFFFF', '#111111', [
    ['Curtis Jerrells', 'PG', 75, 0, ['ankle_breaker', 'closer']],
    ['Keith Langford', 'SG', 78, 5, ['shot_creator', 'acrobat', 'deadeye']],
    ['Alessandro Gentile', 'SF', 75, 5, ['finisher', 'bruiser']],
    ['David Moss', 'PF', 74, 34, ['lockdown_defender', 'corner_specialist']],
    ['Samardo Samuels', 'C', 74, 24, ['bruiser', 'hustle_points']],
    ['Nicolo Melli', 'PF', 73, 9, ['screen_outlet', 'active_hands']],
    ['Daniel Hackett', 'PG', 75, 23, ['bruiser', 'dimer']],
    ['Gani Lawal', 'C', 73, 31, ['alley_ooper', 'tenacious_rebounder']],
  ]),
  createTeam('euro_sie', 'SIE', 'Montepaschi', 'Siena', 'EUROLEAGUE', 'EURO', 74, 'PalaEstra', '#006B3F', '#FFFFFF', '#1E293B', [
    ['Daniel Hackett', 'PG', 76, 23, ['dimer', 'bruiser', 'floor_general']],
    ['Josh Carter', 'SG', 74, 11, ['catch_and_shoot', 'corner_specialist']],
    ['Jeff Viggiano', 'SF', 72, 16, ['corner_specialist']],
    ['Tomas Ress', 'PF', 73, 14, ['brick_wall', 'screen_outlet']],
    ['Othello Hunter', 'C', 74, 15, ['hustle_points', 'tenacious_rebounder']],
    ['Erick Green', 'SG', 73, 10, ['microwave', 'shot_creator']],
    ['Spencer Nelson', 'PF', 72, 22, ['scrapper', 'charge_card']],
    ['Taylor Rochestie', 'PG', 73, 12, ['catch_and_shoot', 'dimer']],
  ]),
  createTeam('euro_alb', 'ALB', 'Alba', 'Berlin', 'EUROLEAGUE', 'EURO', 74, 'O2 World Berlin', '#FFCC00', '#003399', '#111111', [
    ['Cliff Hammonds', 'PG', 73, 25, ['lockdown_defender', 'dimer']],
    ['Reggie Redding', 'SG', 74, 15, ['active_hands', 'finisher']],
    ['David Logan', 'SF', 74, 10, ['microwave', 'catch_and_shoot']],
    ['Jan-Hendrik Jagla', 'PF', 72, 20, ['screen_outlet', 'catch_and_shoot']],
    ['Leon Radosevic', 'C', 73, 43, ['brick_wall', 'hustle_points']],
    ['Heiko Schaffartzik', 'PG', 73, 8, ['deadeye', 'closer']],
    ['Vojdan Stojanovski', 'SG', 72, 19, ['corner_specialist']],
    ['Kendall Brooks', 'PF', 72, 33, ['scrapper']],
  ]),
  createTeam('euro_zal', 'ZAL', 'Zalgiris', 'Kaunas', 'EUROLEAGUE', 'EURO', 75, 'Zalgirio Arena', '#006B3F', '#FFFFFF', '#0F172A', [
    ['Justin Dentmon', 'PG', 75, 2, ['microwave', 'deadeye', 'shot_creator']],
    ['Martynas Pocius', 'SG', 74, 7, ['one_man_fastbreak', 'finisher']],
    ['Vytenis Lipkevicius', 'SF', 72, 19, ['scrapper', 'corner_specialist']],
    ['Paulius Jankunas', 'PF', 75, 13, ['tenacious_rebounder', 'hustle_points', 'brick_wall']],
    ['Robertas Javtokas', 'C', 74, 15, ['eraser', 'bruiser']],
    ['Sarunas Jasikevicius', 'PG', 75, 3, ['floor_general', 'dimer', 'closer']],
    ['Ksistof Lavrinovic', 'PF', 74, 12, ['screen_outlet', 'catch_and_shoot']],
    ['Arturas Milaknis', 'SG', 73, 21, ['catch_and_shoot', 'corner_specialist']],
  ]),
  createTeam('euro_uni', 'UNI', 'Unicaja', 'Malaga', 'EUROLEAGUE', 'EURO', 75, 'Palacio Martin Carpena', '#00843D', '#662D91', '#FFFFFF', [
    ['Earl Calloway', 'PG', 74, 4, ['one_man_fastbreak', 'dimer']],
    ['Zoran Dragic', 'SG', 75, 12, ['scrapper', 'finisher', 'active_hands']],
    ['Carlos Suarez', 'SF', 75, 9, ['tenacious_rebounder', 'corner_specialist']],
    ['Nik Caner-Medley', 'PF', 75, 22, ['hustle_points', 'bruiser']],
    ['Fran Vazquez', 'C', 75, 17, ['eraser', 'alley_ooper', 'defensive_anchor']],
    ['Jayson Granger', 'PG', 74, 15, ['pick_and_roll_maestro']],
    ['Ryan Toolson', 'SG', 74, 11, ['deadeye', 'catch_and_shoot']],
    ['Vladimir Stimac', 'C', 73, 51, ['brick_wall', 'hustle_points']],
  ]),
  createTeam('euro_lab', 'LAB', 'Laboral Kutxa', 'Vitoria', 'EUROLEAGUE', 'EURO', 76, 'Fernando Buesa Arena', '#0038A8', '#D71920', '#FFFFFF', [
    ['Thomas Heurtel', 'PG', 75, 22, ['dimer', 'pick_and_roll_maestro']],
    ['Fabien Causeur', 'SG', 74, 10, ['acrobat', 'pick_pocket']],
    ['Fernando San Emeterio', 'SF', 76, 19, ['finisher', 'closer', 'bruiser']],
    ['Andres Nocioni', 'PF', 78, 5, ['bruiser', 'scrapper', 'catch_and_shoot', 'charge_card']],
    ['Tibor Pleiss', 'C', 75, 21, ['eraser', 'post_proficiency'], { heightCm: 218 }],
    ['Walter Hodge', 'PG', 74, 15, ['ankle_breaker']],
    ['Lamont Hamilton', 'PF', 74, 24, ['screen_outlet', 'hustle_points']],
    ['David Jelinek', 'SG', 72, 11, ['corner_specialist']],
  ]),
];

// ============================================================================
// CLASSIC & 2014 ALL-STAR TEAMS
// ============================================================================
const CLASSIC_AND_ALLSTAR_TEAMS: TeamData[] = [
  createTeam('cls_96chi', '96B', "'95-96 Chicago", 'Bulls', 'CLASSIC', 'CLASSIC', 98, 'United Center (1996)', '#CE1141', '#111111', '#FFFFFF', [
    ['Ron Harper', 'PG', 78, 9, ['lockdown_defender', 'pick_dodger']],
    ['Michael Jordan', 'SG', 99, 23, ['closer', 'posterizer', 'shot_creator', 'deadeye', 'lockdown_defender'], { heightCm: 198, hairStyle: 'bald' }],
    ['Scottie Pippen', 'SF', 94, 33, ['lockdown_defender', 'one_man_fastbreak', 'dimer', 'chasedown_artist', 'interceptor']],
    ['Dennis Rodman', 'PF', 85, 91, ['tenacious_rebounder', 'scrapper', 'bruiser', 'hustle_points', 'defensive_anchor']],
    ['Luc Longley', 'C', 74, 13, ['brick_wall', 'post_playmaker']],
    ['Toni Kukoc', 'SF', 82, 7, ['dimer', 'catch_and_shoot', 'closer']],
    ['Steve Kerr', 'PG', 75, 25, ['deadeye', 'catch_and_shoot', 'corner_specialist']],
    ['Bill Wennington', 'C', 71, 34, ['screen_outlet', 'brick_wall']],
  ]),
  createTeam('cls_01lal', '01L', "'00-01 Los Angeles", 'Lakers', 'CLASSIC', 'CLASSIC', 97, 'Staples Center (2001)', '#552583', '#FDB927', '#111111', [
    ['Derek Fisher', 'PG', 77, 2, ['closer', 'catch_and_shoot', 'charge_card']],
    ['Kobe Bryant', 'SG', 95, 8, ['posterizer', 'acrobat', 'closer', 'deadeye', 'lockdown_defender']],
    ['Rick Fox', 'SF', 76, 17, ['corner_specialist', 'bruiser']],
    ['Horace Grant', 'PF', 77, 54, ['tenacious_rebounder', 'screen_outlet', 'brick_wall']],
    ["Shaquille O'Neal", 'C', 98, 34, ['posterizer', 'bruiser', 'post_proficiency', 'brick_wall', 'eraser'], { heightCm: 216, hairStyle: 'bald' }],
    ['Robert Horry', 'PF', 76, 5, ['closer', 'corner_specialist', 'catch_and_shoot']],
    ['Brian Shaw', 'PG', 74, 20, ['alley_ooper', 'dimer']],
    ['Tyronn Lue', 'PG', 72, 10, ['pick_dodger', 'one_man_fastbreak']],
  ]),
  createTeam('cls_86bos', '86C', "'85-86 Boston", 'Celtics', 'CLASSIC', 'CLASSIC', 96, 'Boston Garden (1986)', '#007A33', '#FFFFFF', '#D4AF37', [
    ['Dennis Johnson', 'PG', 83, 3, ['lockdown_defender', 'closer', 'floor_general']],
    ['Danny Ainge', 'SG', 80, 44, ['catch_and_shoot', 'deadeye', 'scrapper']],
    ['Larry Bird', 'SF', 97, 33, ['deadeye', 'closer', 'post_proficiency', 'dimer', 'anti_freeze'], { heightCm: 206, skinTone: '#d9a985' }],
    ['Kevin McHale', 'PF', 91, 32, ['post_proficiency', 'finisher', 'eraser', 'hustle_points']],
    ['Robert Parish', 'C', 87, 0, ['tenacious_rebounder', 'eraser', 'brick_wall']],
    ['Bill Walton', 'C', 82, 5, ['break_starter', 'post_playmaker', 'defensive_anchor']],
    ['Scott Wedman', 'SF', 75, 8, ['catch_and_shoot']],
    ['Jerry Sichting', 'PG', 72, 12, ['floor_general']],
  ]),
  createTeam('cls_87lal', '87L', "'86-87 Los Angeles", 'Lakers', 'CLASSIC', 'CLASSIC', 97, 'The Forum (1987)', '#552583', '#FDB927', '#FFFFFF', [
    ['Magic Johnson', 'PG', 98, 32, ['floor_general', 'dimer', 'flashy_passer', 'one_man_fastbreak', 'closer'], { heightCm: 206 }],
    ['Byron Scott', 'SG', 82, 4, ['catch_and_shoot', 'one_man_fastbreak', 'highlight_film']],
    ['James Worthy', 'SF', 89, 42, ['finisher', 'one_man_fastbreak', 'closer', 'post_proficiency']],
    ['A.C. Green', 'PF', 78, 45, ['tenacious_rebounder', 'hustle_points', 'scrapper']],
    ['Kareem Abdul-Jabbar', 'C', 91, 33, ['post_proficiency', 'eraser', 'anti_freeze', 'closer'], { heightCm: 218, hairStyle: 'bald' }],
    ['Michael Cooper', 'SG', 80, 21, ['lockdown_defender', 'corner_specialist', 'pick_dodger']],
    ['Mychal Thompson', 'C', 77, 43, ['brick_wall', 'post_proficiency']],
    ['Kurt Rambis', 'PF', 74, 31, ['scrapper', 'bruiser']],
  ]),
  createTeam('as_east', 'EAS', '2014 East', 'All-Stars', 'ALLSTAR', 'EAST', 96, 'Smoothie King Center (ASG)', '#006BB6', '#F9A01B', '#FFFFFF', [
    ['Kyrie Irving', 'PG', 88, 2, ['ankle_breaker', 'acrobat', 'closer']],
    ['Dwyane Wade', 'SG', 91, 3, ['finisher', 'acrobat', 'highlight_film']],
    ['LeBron James', 'SF', 99, 6, ['lebron_coast_to_coast', 'posterizer', 'dimer', 'lockdown_defender'], { headband: true, armSleeve: true }],
    ['Paul George', 'PF', 88, 24, ['posterizer', 'deadeye', 'lockdown_defender']],
    ['Carmelo Anthony', 'C', 92, 7, ['deadeye', 'shot_creator', 'microwave']],
    ['Derrick Rose', 'PG', 92, 1, ['acrobat', 'one_man_fastbreak', 'ankle_breaker']],
    ['John Wall', 'PG', 85, 2, ['one_man_fastbreak', 'dimer']],
    ['Chris Bosh', 'C', 82, 1, ['catch_and_shoot', 'screen_outlet']],
    ['Joakim Noah', 'C', 82, 13, ['defensive_anchor', 'tenacious_rebounder']],
  ]),
  createTeam('as_west', 'WST', '2014 West', 'All-Stars', 'ALLSTAR', 'WEST', 97, 'Smoothie King Center (ASG)', '#CE1141', '#F9A01B', '#111111', [
    ['Chris Paul', 'PG', 94, 3, ['floor_general', 'dimer', 'ankle_breaker', 'pick_pocket']],
    ['Stephen Curry', 'SG', 88, 30, ['deadeye', 'shot_creator', 'microwave']],
    ['Kevin Durant', 'SF', 94, 35, ['deadeye', 'closer', 'shot_creator']],
    ['Blake Griffin', 'PF', 87, 32, ['posterizer', 'highlight_film', 'alley_ooper']],
    ['Kevin Love', 'C', 89, 42, ['tenacious_rebounder', 'break_starter', 'catch_and_shoot']],
    ['Kobe Bryant', 'SG', 93, 24, ['closer', 'deadeye', 'post_proficiency']],
    ['Russell Westbrook', 'PG', 91, 0, ['one_man_fastbreak', 'posterizer']],
    ['James Harden', 'SG', 89, 13, ['acrobat', 'shot_creator']],
    ['Dwight Howard', 'C', 91, 12, ['defensive_anchor', 'eraser', 'posterizer']],
  ]),
];

export const ALL_TEAMS: TeamData[] = [
  ...EASTERN_NBA_TEAMS,
  ...WESTERN_NBA_TEAMS,
  ...EUROLEAGUE_TEAMS,
  ...CLASSIC_AND_ALLSTAR_TEAMS,
];

export const NBA_TEAMS = ALL_TEAMS.filter((t) => t.league === 'NBA');
export const EUROLEAGUE_ONLY_TEAMS = ALL_TEAMS.filter((t) => t.league === 'EUROLEAGUE');
export const CLASSIC_ONLY_TEAMS = ALL_TEAMS.filter((t) => t.league === 'CLASSIC');
export const ALLSTAR_ONLY_TEAMS = ALL_TEAMS.filter((t) => t.league === 'ALLSTAR');

export function getTeamById(teamId: string): TeamData {
  return ALL_TEAMS.find((t) => t.id === teamId) ?? ALL_TEAMS[0];
}

export function getAllPlayers(): PlayerData[] {
  return ALL_TEAMS.flatMap((t) => t.players);
}

export function getPlayerById(playerId: string): PlayerData | undefined {
  for (const t of ALL_TEAMS) {
    const p = t.players.find((pl) => pl.id === playerId);
    if (p) return p;
  }
  return undefined;
}
