import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  Dumbbell,
  Play,
  Shield,
  Sliders,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { SIGNATURE_ANIMATION_SETS, TRAINING_DRILLS } from '../data/modesData';
import { NBA_TEAMS, getTeamById } from '../data/rosters';
import { SIGNATURE_SKILLS, SIGNATURE_SKILL_MAP } from '../data/signatureSkills';
import { buildMyPlayerFromSpec } from '../storage';
import type {
  MatchConfig,
  MyPlayerPlayStyle,
  Nba2k14SaveData,
  PlayerAttributes,
  Position,
  SignatureSkillId,
} from '../types';

interface MyCareerViewProps {
  save: Nba2k14SaveData;
  onUpdateSave: (updater: (prev: Nba2k14SaveData) => Nba2k14SaveData) => void;
  onStartMatch: (cfg: MatchConfig) => void;
  onOpenOptions: () => void;
}

const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const PLAY_STYLES: MyPlayerPlayStyle[] = [
  'Athletic',
  'Scoring',
  '3PT Specialist',
  'All-Around',
  'Pass First',
  'Defensive',
  'Post',
  'Rebounding',
];
const HAIR_STYLES: ('short' | 'fade' | 'afro' | 'bald' | 'mohawk' | 'dreads')[] = [
  'fade',
  'short',
  'afro',
  'bald',
  'mohawk',
  'dreads',
];
const SKIN_TONES = ['#f2c9a8', '#dfb18d', '#c58f65', '#9c6844', '#7b4d31', '#5a351e', '#3e2313'];
const SHOE_COLORS = ['#CE1141', '#F9A01B', '#FFFFFF', '#111827', '#2563EB', '#10B981', '#9333EA'];

const ATTR_GROUPS: { title: string; keys: { key: keyof PlayerAttributes; label: string }[] }[] = [
  {
    title: 'Shooting & Scoring',
    keys: [
      { key: 'closeShot', label: 'Close Shot' },
      { key: 'midRange', label: 'Mid-Range' },
      { key: 'threePt', label: '3PT Shooting' },
      { key: 'freeThrow', label: 'Free Throw' },
      { key: 'layup', label: 'Driving Layup' },
      { key: 'dunk', label: 'Driving Dunk' },
      { key: 'standingDunk', label: 'Standing Dunk' },
      { key: 'postHook', label: 'Post Hook' },
      { key: 'postFade', label: 'Post Fadeaway' },
      { key: 'shotInTraffic', label: 'Shot in Traffic' },
    ],
  },
  {
    title: 'Playmaking & Athleticism',
    keys: [
      { key: 'ballHandle', label: 'Ball Handling' },
      { key: 'passAccuracy', label: 'Pass Accuracy' },
      { key: 'offAwareness', label: 'Off. Awareness' },
      { key: 'speed', label: 'Speed' },
      { key: 'quickness', label: 'Quickness' },
      { key: 'vertical', label: 'Vertical' },
      { key: 'strength', label: 'Strength' },
      { key: 'stamina', label: 'Stamina' },
      { key: 'hustle', label: 'Hustle' },
    ],
  },
  {
    title: 'Defense & Rebounding',
    keys: [
      { key: 'onBallDefense', label: 'On-Ball Defense' },
      { key: 'steal', label: 'Steal' },
      { key: 'block', label: 'Block' },
      { key: 'defAwareness', label: 'Def. Awareness' },
      { key: 'offRebound', label: 'Off. Rebound' },
      { key: 'defRebound', label: 'Def. Rebound' },
    ],
  },
];

function computePlayerOvrFromAttrs(attrs: PlayerAttributes): number {
  const vals = Object.values(attrs);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.max(60, Math.min(99, Math.round(avg + 4)));
}

export const MyCareerView: React.FC<MyCareerViewProps> = ({
  save,
  onUpdateSave,
  onStartMatch,
  onOpenOptions,
}) => {
  const { myCareer, vip } = save;
  const [hubTab, setHubTab] = useState<'play' | 'player' | 'skills' | 'league' | 'drills'>('play');

  // Creation form state
  const [name, setName] = useState(myCareer.player.name);
  const [jersey, setJersey] = useState(myCareer.player.jersey);
  const [pos, setPos] = useState<Position>(myCareer.player.pos);
  const [playStyle, setPlayStyle] = useState<MyPlayerPlayStyle>(myCareer.playStyle);
  const [heightCm, setHeightCm] = useState(myCareer.player.heightCm);
  const [weightLbs, setWeightLbs] = useState(myCareer.player.weightLbs);
  const [skinTone, setSkinTone] = useState(myCareer.player.skinTone);
  const [hairStyle, setHairStyle] = useState(myCareer.player.hairStyle);
  const [headband, setHeadband] = useState(myCareer.player.headband);
  const [armSleeve, setArmSleeve] = useState(myCareer.player.armSleeve);
  const [legSleeve, setLegSleeve] = useState(myCareer.player.legSleeve);
  const [shoeColor, setShoeColor] = useState(myCareer.player.shoeColor);
  const [skillFilter, setSkillFilter] = useState<'ALL' | 'Scoring' | 'Playmaking' | 'Defense' | 'Athleticism' | 'Hustle'>('ALL');

  const myTeam = useMemo(() => getTeamById(myCareer.teamId), [myCareer.teamId]);
  const nextOpponent = useMemo(() => {
    const others = NBA_TEAMS.filter((t) => t.id !== myCareer.teamId);
    return others[myCareer.seasonGameIndex % others.length];
  }, [myCareer.teamId, myCareer.seasonGameIndex]);

  const isKeyGame = (myCareer.seasonGameIndex + 1) % 3 === 0 || nextOpponent.ovr >= 86;

  const leagueLeaders = useMemo(() => {
    const mpPpg =
      myCareer.gameLogs.length > 0
        ? myCareer.gameLogs.reduce((a, g) => a + g.pts, 0) / myCareer.gameLogs.length
        : 0;
    return [
      { name: 'Kevin Durant', team: 'OKC', ppg: 31.4, apg: 5.5, rpg: 7.4 },
      { name: 'LeBron James', team: 'MIA', ppg: 27.9, apg: 6.8, rpg: 7.1 },
      { name: 'Carmelo Anthony', team: 'NYK', ppg: 27.4, apg: 3.1, rpg: 8.1 },
      { name: 'James Harden', team: 'HOU', ppg: 25.4, apg: 6.1, rpg: 4.7 },
      { name: 'Stephen Curry', team: 'GSW', ppg: 24.0, apg: 8.5, rpg: 4.3 },
      ...(myCareer.gameLogs.length > 0
        ? [
            {
              name: `${myCareer.player.name} (YOU)`,
              team: myTeam.code,
              ppg: Number(mpPpg.toFixed(1)),
              apg: Number((myCareer.gameLogs.reduce((a, g) => a + g.ast, 0) / myCareer.gameLogs.length).toFixed(1)),
              rpg: Number((myCareer.gameLogs.reduce((a, g) => a + g.reb, 0) / myCareer.gameLogs.length).toFixed(1)),
            },
          ]
        : []),
    ].sort((a, b) => b.ppg - a.ppg);
  }, [myCareer.gameLogs, myCareer.player.name, myTeam.code]);

  const handleCreateMyPlayer = () => {
    Nba2k14Audio.playUiClick('select');
    const built = buildMyPlayerFromSpec(
      name,
      jersey,
      pos,
      playStyle,
      heightCm,
      weightLbs,
      skinTone,
      hairStyle,
      headband,
      armSleeve,
      legSleeve,
      shoeColor,
      'mia'
    );
    onUpdateSave((prev) => ({
      ...prev,
      lastMode: 'mycareer',
      myCareer: {
        ...prev.myCareer,
        created: true,
        playStyle,
        player: built,
      },
    }));
  };

  const launchRookieShowcase = () => {
    Nba2k14Audio.playUiClick('select');
    const homeTeam = getTeamById('allstar_east');
    const awayTeam = getTeamById('allstar_west');
    const showcaseHome = [myCareer.player, ...homeTeam.players.slice(1, 5)];
    onStartMatch({
      mode: 'rookie_showcase',
      title: '2014 ROOKIE SHOWCASE',
      subtitle: 'Player Lock · Impress NBA Scouts for a Lottery Pick',
      homeTeamId: 'mia',
      awayTeamId: 'okc',
      homeCustomPlayers: showcaseHome,
      awayCustomPlayers: awayTeam.players.slice(0, 5),
      userSide: 'home',
      courtEnv: 'nba',
      quarterLengthMin: Math.min(save.settings.game.quarterLengthMin, 3),
      playersPerSide: 5,
      playerLockId: myCareer.player.id,
    });
  };

  const quickDraftNow = () => {
    Nba2k14Audio.playUiClick('select');
    const pick = 11;
    const draftedTeam = NBA_TEAMS[pick - 1];
    onUpdateSave((prev) => ({
      ...prev,
      lastMode: 'mycareer',
      vip: {
        ...prev.vip,
        unlockedAchievements: Array.from(new Set([...prev.vip.unlockedAchievements, 'mycareer_draft'])),
      },
      myCareer: {
        ...prev.myCareer,
        drafted: true,
        draftPick: pick,
        teamId: draftedTeam.id,
        player: { ...prev.myCareer.player, teamId: draftedTeam.id },
        socialFeed: [
          {
            id: `qd_${Date.now()}`,
            handle: '@NBADraft2014',
            text: `Lottery Selection! With pick #${pick}, the ${draftedTeam.fullName} draft ${prev.myCareer.player.name}.`,
            time: 'Just now',
          },
          ...prev.myCareer.socialFeed,
        ],
      },
    }));
  };

  const launchNextCareerGame = () => {
    Nba2k14Audio.playUiClick('select');
    const teammates = myTeam.players.filter((p) => p.pos !== myCareer.player.pos).slice(0, 4);
    const homeLineup = [myCareer.player, ...teammates];
    onStartMatch({
      mode: 'mycareer',
      title: isKeyGame ? `KEY GAME: ${myTeam.code} vs ${nextOpponent.code}` : `GAME #${myCareer.seasonGameIndex + 1}: ${myTeam.code} vs ${nextOpponent.code}`,
      subtitle: `MyCAREER Player Lock · ${myCareer.player.name} (#${myCareer.player.jersey})`,
      homeTeamId: myTeam.id,
      awayTeamId: nextOpponent.id,
      homeCustomPlayers: homeLineup,
      userSide: 'home',
      courtEnv: 'nba',
      quarterLengthMin: save.settings.game.quarterLengthMin,
      playersPerSide: 5,
      playerLockId: myCareer.player.id,
    });
  };

  const upgradeAttribute = (key: keyof PlayerAttributes) => {
    const cur = myCareer.player.attrs[key];
    if (cur >= 99) return;
    const cost = Math.round(75 + Math.max(0, cur - 60) * 14);
    const useSp = vip.sp >= cost;
    const useVc = !useSp && vip.vc >= cost;
    if (!useSp && !useVc) return;
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => {
      const nextAttrs: PlayerAttributes = {
        ...prev.myCareer.player.attrs,
        [key]: Math.min(99, prev.myCareer.player.attrs[key] + 1),
      };
      return {
        ...prev,
        vip: {
          ...prev.vip,
          sp: useSp ? prev.vip.sp - cost : prev.vip.sp,
          vc: useVc ? prev.vip.vc - cost : prev.vip.vc,
        },
        myCareer: {
          ...prev.myCareer,
          player: {
            ...prev.myCareer.player,
            attrs: nextAttrs,
            ovr: computePlayerOvrFromAttrs(nextAttrs),
          },
        },
      };
    });
  };

  const buyOrUpgradeSkill = (skillId: SignatureSkillId) => {
    const def = SIGNATURE_SKILL_MAP[skillId];
    const existing = myCareer.player.signatureSkills.find((s) => s.id === skillId);
    if (!existing && myCareer.player.signatureSkills.length >= 5) return;
    const nextLevel = existing ? (existing.level + 1) : 1;
    if (nextLevel > 3) return;
    const cost = def.costSp[nextLevel - 1];
    const useSp = vip.sp >= cost;
    const useVc = !useSp && vip.vc >= cost;
    if (!useSp && !useVc) return;
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => {
      const nextSkills = existing
        ? prev.myCareer.player.signatureSkills.map((s) =>
            s.id === skillId ? { ...s, level: nextLevel as 1 | 2 | 3 } : s
          )
        : [...prev.myCareer.player.signatureSkills, { id: skillId, level: 1 as const }];
      return {
        ...prev,
        vip: {
          ...prev.vip,
          sp: useSp ? prev.vip.sp - cost : prev.vip.sp,
          vc: useVc ? prev.vip.vc - cost : prev.vip.vc,
        },
        myCareer: {
          ...prev.myCareer,
          player: {
            ...prev.myCareer.player,
            signatureSkills: nextSkills,
          },
        },
      };
    });
  };

  const removeSkill = (skillId: SignatureSkillId) => {
    Nba2k14Audio.playUiClick('hover');
    onUpdateSave((prev) => ({
      ...prev,
      myCareer: {
        ...prev.myCareer,
        player: {
          ...prev.myCareer.player,
          signatureSkills: prev.myCareer.player.signatureSkills.filter((s) => s.id !== skillId),
        },
      },
    }));
  };

  const updateSignatureAnim = (field: 'jumpShotForm' | 'dunkPackage' | 'dribbleStyle', value: string) => {
    Nba2k14Audio.playUiClick('hover');
    onUpdateSave((prev) => ({
      ...prev,
      myCareer: {
        ...prev.myCareer,
        player: {
          ...prev.myCareer.player,
          [field]: value,
        },
      },
    }));
  };

  // STEP 1: MyPLAYER CREATION
  if (!myCareer.created) {
    return (
      <div className="h-full overflow-y-auto px-5 py-4">
        <div className="max-w-5xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] text-[#F9A01B] uppercase">NBA 2K14 · MyCAREER</div>
              <h2 className="text-2xl font-black tracking-tight text-white uppercase">CREATE YOUR MyPLAYER</h2>
            </div>
            <button
              onClick={handleCreateMyPlayer}
              className="px-6 py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-sm tracking-wider uppercase flex items-center gap-2 transition cursor-pointer"
            >
              <Check className="w-4 h-4" /> Finalize & Enter Rookie Showcase
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Player Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={22}
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#CE1141]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Jersey #</label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={jersey}
                    onChange={(e) => setJersey(Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#CE1141]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Position</label>
                <div className="mt-1.5 grid grid-cols-5 gap-2">
                  {POSITIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        Nba2k14Audio.playUiClick('hover');
                        setPos(p);
                      }}
                      className={`py-2 rounded-lg font-black text-xs border transition cursor-pointer ${
                        pos === p
                          ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                          : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Play Style Archetype</label>
                <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PLAY_STYLES.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        Nba2k14Audio.playUiClick('hover');
                        setPlayStyle(st);
                      }}
                      className={`py-2 px-2 rounded-lg font-bold text-[11px] border transition cursor-pointer ${
                        playStyle === st
                          ? 'bg-[#F9A01B]/20 border-[#F9A01B] text-[#F9A01B]'
                          : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                    <span>HEIGHT</span>
                    <span className="text-white">{heightCm} cm ({Math.floor(heightCm / 30.48)}&apos;{Math.round((heightCm % 30.48) / 2.54)}&quot;)</span>
                  </div>
                  <input
                    type="range"
                    min={175}
                    max={221}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full accent-[#CE1141] mt-1"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                    <span>WEIGHT</span>
                    <span className="text-white">{weightLbs} lbs</span>
                  </div>
                  <input
                    type="range"
                    min={170}
                    max={285}
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full accent-[#CE1141] mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Skin Tone</label>
                <div className="mt-1.5 flex gap-2">
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSkinTone(tone)}
                      style={{ backgroundColor: tone }}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                        skinTone === tone ? 'border-[#F9A01B] scale-110' : 'border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Hair Style</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {HAIR_STYLES.map((hs) => (
                    <button
                      key={hs}
                      onClick={() => setHairStyle(hs)}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase border cursor-pointer ${
                        hairStyle === hs
                          ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                          : 'bg-[#171a22] border-white/10 text-zinc-300'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Accessories & Gear</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Headband', val: headband, set: setHeadband },
                    { label: 'Arm Sleeve', val: armSleeve, set: setArmSleeve },
                    { label: 'Leg Sleeve', val: legSleeve, set: setLegSleeve },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => item.set(!item.val)}
                      className={`py-2 rounded-lg text-xs font-bold border cursor-pointer ${
                        item.val
                          ? 'bg-emerald-600/25 border-emerald-400 text-emerald-200'
                          : 'bg-[#171a22] border-white/10 text-zinc-400'
                      }`}
                    >
                      {item.label}: {item.val ? 'ON' : 'OFF'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Signature Sneaker Colorway</label>
                <div className="mt-1.5 flex gap-2">
                  {SHOE_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => setShoeColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-8 h-8 rounded-lg border-2 cursor-pointer ${
                        shoeColor === col ? 'border-[#F9A01B] scale-110' : 'border-white/25'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: ROOKIE SHOWCASE & DRAFT
  if (!myCareer.drafted) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#0f1116]/95 border border-white/15 rounded-xl p-7 shadow-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#F9A01B]">2014 NBA DRAFT COMBINE</div>
          <h2 className="text-3xl font-black text-white uppercase mt-1">ROOKIE SHOWCASE</h2>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Step onto the hardwood in Player Lock as <span className="text-white font-bold">{myCareer.player.name}</span>{' '}
            (#{myCareer.player.jersey} {myCareer.player.pos} · {myCareer.playStyle} · {myCareer.player.ovr} OVR). Your Teammate Grade (F to A+) and box score directly determine your NBA Draft position and starting franchise.
          </p>
          <div className="grid grid-cols-3 gap-3 my-5">
            <div className="bg-[#171a22] border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Lottery Target</div>
              <div className="text-lg font-black text-[#F9A01B]">A- / A+ Grade</div>
            </div>
            <div className="bg-[#171a22] border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Control Mode</div>
              <div className="text-lg font-black text-white">Player Lock</div>
            </div>
            <div className="bg-[#171a22] border border-white/10 rounded-lg p-3">
              <div className="text-[10px] text-zinc-400 uppercase font-bold">Starting Skills</div>
              <div className="text-sm font-bold text-zinc-200">
                {myCareer.player.signatureSkills.map((s) => SIGNATURE_SKILL_MAP[s.id].code).join(' · ')}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={launchRookieShowcase}
              className="flex-1 py-3 px-5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Play Rookie Showcase
            </button>
            <button
              onClick={quickDraftNow}
              className="py-3 px-4 rounded-lg bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-zinc-200 font-bold uppercase text-xs tracking-wider cursor-pointer"
            >
              Sim Draft Lottery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: FULL MYCAREER HUB
  const filteredSkills = SIGNATURE_SKILLS.filter((s) => skillFilter === 'ALL' || s.category === skillFilter);

  return (
    <div className="h-full flex flex-col px-5 py-3 overflow-hidden">
      {/* Top Career Banner */}
      <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-5 py-3 mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            style={{ backgroundColor: myTeam.primaryColor, borderColor: myTeam.secondaryColor }}
            className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-white font-black leading-none"
          >
            <span className="text-[10px]">{myTeam.code}</span>
            <span className="text-lg">#{myCareer.player.jersey}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white uppercase">{myCareer.player.name}</span>
              <span className="px-2 py-0.5 rounded bg-[#F9A01B]/20 border border-[#F9A01B]/50 text-[#F9A01B] text-[11px] font-black">
                {myCareer.player.ovr} OVR
              </span>
              <span className="text-xs font-bold text-zinc-400">
                {myCareer.player.pos} · Pick #{myCareer.draftPick} · {myTeam.fullName}
              </span>
            </div>
            <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap gap-4">
              <span>Record: <strong className="text-white">{myCareer.wins}-{myCareer.losses}</strong></span>
              <span>Team Chemistry: <strong className="text-emerald-400">{myCareer.chemistry}%</strong></span>
              <span>Fans: <strong className="text-[#F9A01B]">{myCareer.fans.toLocaleString()}</strong></span>
              <span>Skill Points: <strong className="text-cyan-300">{vip.sp.toLocaleString()} SP</strong></span>
              <span>VC: <strong className="text-[#F9A01B]">{vip.vc.toLocaleString()} VC</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'play', label: 'Play Next Game', icon: Play },
            { id: 'player', label: 'MyPLAYER', icon: User },
            { id: 'skills', label: 'Sig Skills', icon: Sparkles },
            { id: 'league', label: 'League & Social', icon: Users },
            { id: 'drills', label: 'Practice', icon: Dumbbell },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  Nba2k14Audio.playUiClick('hover');
                  setHubTab(t.id as typeof hubTab);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border transition cursor-pointer ${
                  hubTab === t.id
                    ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                    : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
          <button
            onClick={onOpenOptions}
            className="px-2.5 py-2 rounded-lg text-xs font-bold uppercase bg-[#171a22] border border-white/10 text-zinc-300 hover:border-white/30 cursor-pointer"
            title="Options"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {hubTab === 'play' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F9A01B]">
                    {isKeyGame ? '2X SP KEY GAME · NATIONALLY TELEVISED' : `REGULAR SEASON · GAME #${myCareer.seasonGameIndex + 1}`}
                  </span>
                  <span className="text-xs text-zinc-400">{myTeam.arenaName}</span>
                </div>
                <div className="mt-4 flex items-center justify-between bg-[#151820] border border-white/10 rounded-xl p-5">
                  <div className="text-center flex-1">
                    <div
                      style={{ backgroundColor: myTeam.primaryColor }}
                      className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white font-black text-xl border border-white/20"
                    >
                      {myTeam.code}
                    </div>
                    <div className="mt-2 font-black text-white">{myTeam.fullName}</div>
                    <div className="text-xs text-zinc-400">OVR {myTeam.ovr} · HOME</div>
                  </div>
                  <div className="px-4 text-center">
                    <div className="text-2xl font-black text-[#CE1141] italic">VS</div>
                    <div className="text-[10px] uppercase text-zinc-400 mt-1">Player Lock</div>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      style={{ backgroundColor: nextOpponent.primaryColor }}
                      className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white font-black text-xl border border-white/20"
                    >
                      {nextOpponent.code}
                    </div>
                    <div className="mt-2 font-black text-white">{nextOpponent.fullName}</div>
                    <div className="text-xs text-zinc-400">OVR {nextOpponent.ovr} · AWAY</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-[#151820] border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-zinc-400 font-bold">Coach Goal</div>
                    <div className="text-xs font-bold text-white mt-0.5">Finish with B+ Grade or better</div>
                  </div>
                  <div className="bg-[#151820] border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-zinc-400 font-bold">Key Matchup</div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {nextOpponent.players.find((p) => p.pos === myCareer.player.pos)?.name ?? nextOpponent.players[0].name}
                    </div>
                  </div>
                  <div className="bg-[#151820] border border-white/10 rounded-lg p-3">
                    <div className="text-[10px] uppercase text-zinc-400 font-bold">Payout Multiplier</div>
                    <div className="text-xs font-bold text-[#F9A01B] mt-0.5">{isKeyGame ? '2.0x SP & VC' : '1.0x SP & VC'}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={launchNextCareerGame}
                className="mt-5 w-full py-3.5 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-[0.15em] text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Tip Off Game #{myCareer.seasonGameIndex + 1}
              </button>
            </div>

            {/* Recent Game Logs */}
            <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col">
              <div className="text-xs font-black uppercase tracking-wider text-[#F9A01B] mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Recent Game Logs
              </div>
              {myCareer.gameLogs.length === 0 ? (
                <div className="text-xs text-zinc-400 py-8 text-center">
                  No regular season games logged yet. Play Game #1 to build your Rookie of the Year resume!
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-72 pr-1">
                  {myCareer.gameLogs.map((log) => (
                    <div key={log.gameNum} className="bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-black mr-2 ${log.won ? 'text-emerald-400' : 'text-red-400'}`}>
                          {log.won ? 'W' : 'L'}
                        </span>
                        <span className="text-white font-bold">vs {log.opponentCode}</span>
                        <span className="text-zinc-400 ml-2">{log.teamScore}-{log.oppScore}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{log.pts}P/{log.reb}R/{log.ast}A</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-[#F9A01B]/20 text-[#F9A01B] font-black">{log.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {hubTab === 'player' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              {ATTR_GROUPS.map((grp) => (
                <div key={grp.title} className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3">{grp.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {grp.keys.map(({ key, label }) => {
                      const val = myCareer.player.attrs[key];
                      const cost = Math.round(75 + Math.max(0, val - 60) * 14);
                      const canAfford = val < 99 && (vip.sp >= cost || vip.vc >= cost);
                      return (
                        <div key={key} className="bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-300 font-semibold truncate">{label}</span>
                              <span className="text-white font-black">{val}</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]"
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </div>
                          <button
                            disabled={!canAfford}
                            onClick={() => upgradeAttribute(key)}
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase shrink-0 cursor-pointer ${
                              val >= 99
                                ? 'bg-emerald-900/40 text-emerald-300 cursor-default'
                                : canAfford
                                  ? 'bg-[#CE1141] hover:bg-[#e1194d] text-white'
                                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }`}
                          >
                            {val >= 99 ? 'MAX' : `+1 (${cost})`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Signature Animations & Bio */}
            <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 space-y-4 h-fit">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Signature Animations</h3>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Jump Shot Form</label>
                <select
                  value={myCareer.player.jumpShotForm ?? 'LeBron James'}
                  onChange={(e) => updateSignatureAnim('jumpShotForm', e.target.value)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white"
                >
                  {SIGNATURE_ANIMATION_SETS.jumpShotForms.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Dunk Package</label>
                <select
                  value={myCareer.player.dunkPackage ?? 'Athletic One-Handers'}
                  onChange={(e) => updateSignatureAnim('dunkPackage', e.target.value)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white"
                >
                  {SIGNATURE_ANIMATION_SETS.dunkPackages.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">IsoMotion Dribble Style</label>
                <select
                  value={myCareer.player.dribbleStyle ?? 'Kyrie Irving Iso'}
                  onChange={(e) => updateSignatureAnim('dribbleStyle', e.target.value)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white"
                >
                  {SIGNATURE_ANIMATION_SETS.dribbleStyles.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="border-t border-white/10 pt-3">
                <div className="text-[11px] font-bold text-zinc-400 uppercase mb-2">
                  Equipped Signature Skills ({myCareer.player.signatureSkills.length}/5)
                </div>
                <div className="space-y-1.5">
                  {myCareer.player.signatureSkills.map((sk) => {
                    const def = SIGNATURE_SKILL_MAP[sk.id];
                    return (
                      <div key={sk.id} className="bg-[#151820] border border-[#F9A01B]/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-black text-[#F9A01B] mr-1.5">[{def.code}]</span>
                          <span className="text-white font-bold">{def.name}</span>
                          <span className="ml-1.5 text-[10px] text-zinc-400">Lv.{sk.level}</span>
                        </div>
                        <button
                          onClick={() => removeSkill(sk.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {hubTab === 'skills' && (
          <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F9A01B]" /> NBA 2K14 Signature Skills Store (Equip Up To 5)
                </h3>
                <div className="text-xs text-zinc-400">
                  Equipped: <strong className="text-[#F9A01B]">{myCareer.player.signatureSkills.length}/5</strong> · SP: <strong className="text-cyan-300">{vip.sp}</strong> · VC: <strong className="text-[#F9A01B]">{vip.vc}</strong>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['ALL', 'Scoring', 'Playmaking', 'Defense', 'Athleticism', 'Hustle'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSkillFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase cursor-pointer ${
                      skillFilter === cat
                        ? 'bg-[#CE1141] text-white'
                        : 'bg-[#171a22] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSkills.map((sk) => {
                const eq = myCareer.player.signatureSkills.find((e) => e.id === sk.id);
                const lvl = eq?.level ?? 0;
                const nextCost = lvl < 3 ? sk.costSp[lvl as 0 | 1 | 2] : 0;
                const slotsFull = !eq && myCareer.player.signatureSkills.length >= 5;
                const affordable = lvl < 3 && !slotsFull && (vip.sp >= nextCost || vip.vc >= nextCost);
                return (
                  <div
                    key={sk.id}
                    className={`rounded-lg p-3 border flex flex-col justify-between ${
                      eq
                        ? 'bg-[#1b1714] border-[#F9A01B]/60'
                        : 'bg-[#151820] border-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{sk.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-black/50 text-[#F9A01B] text-[10px] font-black">{sk.code}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold mt-0.5">{sk.category}</div>
                      <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">{sk.shortDesc}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((dot) => (
                          <span
                            key={dot}
                            className={`w-4 h-1.5 rounded-sm ${lvl >= dot ? 'bg-[#F9A01B]' : 'bg-zinc-700'}`}
                          />
                        ))}
                      </div>
                      <button
                        disabled={!affordable}
                        onClick={() => buyOrUpgradeSkill(sk.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase cursor-pointer ${
                          lvl === 3
                            ? 'bg-emerald-900/50 text-emerald-300 cursor-default'
                            : affordable
                              ? 'bg-[#CE1141] hover:bg-[#e1194d] text-white'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        {lvl === 3 ? 'MAX LV.3' : slotsFull ? '5/5 FULL' : lvl === 0 ? `EQUIP (${nextCost})` : `LV.${lvl + 1} (${nextCost})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hubTab === 'league' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> 2013-14 Scoring Leaders & MVP Race
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-white/10 text-left">
                    <th className="py-1.5">Player</th>
                    <th className="py-1.5">TM</th>
                    <th className="py-1.5 text-right">PPG</th>
                    <th className="py-1.5 text-right">RPG</th>
                    <th className="py-1.5 text-right">APG</th>
                  </tr>
                </thead>
                <tbody>
                  {leagueLeaders.map((p, idx) => (
                    <tr key={p.name} className="border-b border-white/5 text-zinc-200">
                      <td className="py-2 font-bold">
                        <span className="text-zinc-500 mr-2">{idx + 1}.</span>
                        <span className={p.name.includes('(YOU)') ? 'text-[#F9A01B]' : 'text-white'}>{p.name}</span>
                      </td>
                      <td className="py-2 text-zinc-400 font-bold">{p.team}</td>
                      <td className="py-2 text-right font-black text-white">{p.ppg}</td>
                      <td className="py-2 text-right">{p.rpg}</td>
                      <td className="py-2 text-right">{p.apg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3">2K14 Social Media Feed</h3>
              <div className="space-y-2.5">
                {myCareer.socialFeed.map((post) => (
                  <div key={post.id} className="bg-[#151820] border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-black text-[#F9A01B]">{post.handle}</span>
                      <span className="text-zinc-500">{post.time}</span>
                    </div>
                    <p className="text-xs text-zinc-200 mt-1">{post.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hubTab === 'drills' && (
          <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#F9A01B] mb-3">
              MyCAREER Practice Gym & Skill Drills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TRAINING_DRILLS.map((drill) => (
                <div key={drill.id} className="bg-[#151820] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-[#F9A01B]">{drill.category}</span>
                      <span className="text-[10px] font-bold text-cyan-300">+{drill.spReward} SP</span>
                    </div>
                    <div className="text-sm font-black text-white mt-1">{drill.title}</div>
                    <p className="text-xs text-zinc-400 mt-1.5">{drill.instruction}</p>
                  </div>
                  <button
                    onClick={() => {
                      Nba2k14Audio.playUiClick('select');
                      onStartMatch({
                        mode: 'training',
                        title: drill.title,
                        subtitle: 'MyCAREER Practice Facility',
                        homeTeamId: myTeam.id,
                        awayTeamId: nextOpponent.id,
                        homeCustomPlayers: [myCareer.player],
                        userSide: 'home',
                        courtEnv: 'practice',
                        quarterLengthMin: 3,
                        playersPerSide: 1,
                        halfCourt: true,
                        trainingDrillId: drill.id,
                      });
                    }}
                    className="mt-4 w-full py-2 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer"
                  >
                    Start Drill ({drill.targetReps} Reps)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
