// ============================================================================
// NBA 2K14 — Quick Game Team Selection Screen
// Supports all 30 NBA, 14 Euroleague, 4 Classic & 2 All-Star Teams (Q/E switch)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import type {
  CourtEnvId,
  DifficultyTier,
  MatchConfig,
  Nba2k14Settings,
  TeamData,
  TeamLeague,
} from '../types';

interface QuickGameViewProps {
  teams: TeamData[];
  settings: Nba2k14Settings;
  onUpdateSettings: (next: Nba2k14Settings) => void;
  onStartMatch: (cfg: MatchConfig) => void;
  onBack: () => void;
}

const LEAGUES: { id: TeamLeague; label: string }[] = [
  { id: 'NBA', label: 'NBA (30 Teams)' },
  { id: 'EUROLEAGUE', label: 'Euroleague (14 Teams)' },
  { id: 'CLASSIC', label: 'Classic NBA' },
  { id: 'ALLSTAR', label: 'All-Star' },
];

export const QuickGameView: React.FC<QuickGameViewProps> = ({
  teams,
  settings,
  onUpdateSettings,
  onStartMatch,
  onBack,
}) => {
  const [league, setLeague] = useState<TeamLeague>('NBA');
  const leagueTeams = teams.filter((t) => t.league === league);

  const [awayIdx, setAwayIdx] = useState(0);
  const [homeIdx, setHomeIdx] = useState(1);
  const [userSide, setUserSide] = useState<'home' | 'away'>('home');
  const [jerseyMode, setJerseyMode] = useState<'standard' | 'alternate'>('standard');
  const [courtEnv, setCourtEnv] = useState<CourtEnvId>('nba');

  const safeAway = leagueTeams[awayIdx % Math.max(1, leagueTeams.length)] ?? teams[0];
  const safeHome = leagueTeams[homeIdx % Math.max(1, leagueTeams.length)] ?? teams[1];

  useEffect(() => {
    setAwayIdx(0);
    setHomeIdx(leagueTeams.length > 1 ? 1 : 0);
    if (league === 'EUROLEAGUE') setCourtEnv('euroleague');
    else setCourtEnv('nba');
  }, [league, leagueTeams.length]);

  // Q / E keyboard league switcher
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyQ') {
        setLeague((prev) => {
          const i = LEAGUES.findIndex((l) => l.id === prev);
          return LEAGUES[(i - 1 + LEAGUES.length) % LEAGUES.length].id;
        });
      } else if (e.code === 'KeyE') {
        setLeague((prev) => {
          const i = LEAGUES.findIndex((l) => l.id === prev);
          return LEAGUES[(i + 1) % LEAGUES.length].id;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const cycleAway = (delta: number) => {
    Nba2k14Audio.playUiClick('hover');
    setAwayIdx((i) => (i + delta + leagueTeams.length) % leagueTeams.length);
  };

  const cycleHome = (delta: number) => {
    Nba2k14Audio.playUiClick('hover');
    setHomeIdx((i) => (i + delta + leagueTeams.length) % leagueTeams.length);
  };

  const handleTipOff = () => {
    Nba2k14Audio.playUiClick('select');
    onStartMatch({
      mode: 'quick',
      title: `${safeAway.code} @ ${safeHome.code}`,
      subtitle: safeHome.arenaName,
      homeTeamId: safeHome.id,
      awayTeamId: safeAway.id,
      userSide,
      courtEnv,
      quarterLengthMin: settings.game.quarterLengthMin,
      playersPerSide: 5,
      fibaRules: league === 'EUROLEAGUE' || courtEnv === 'euroleague',
      jerseyMode,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
      {/* League Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0f1116]/92 border border-white/15 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">[Q/E]</span>
          {LEAGUES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                Nba2k14Audio.playUiClick('select');
                setLeague(l.id);
              }}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer ${
                league === l.id
                  ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                  : 'bg-[#171a23] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 bg-[#171a23] hover:bg-[#232836] border border-white/15 text-xs font-bold uppercase cursor-pointer"
        >
          Back
        </button>
      </div>

      {/* 3-Column Matchup Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px_1fr] gap-3">
        {/* AWAY TEAM */}
        <div className="bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Away Team</span>
            <button
              type="button"
              onClick={() => setUserSide('away')}
              className={`px-2.5 py-0.5 text-[10px] font-black uppercase border cursor-pointer ${
                userSide === 'away' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#181b25] border-white/15 text-slate-400'
              }`}
            >
              {userSide === 'away' ? 'USER CONTROL' : 'CPU'}
            </button>
          </div>

          <div
            className="p-4 border border-white/15 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${safeAway.primaryColor}cc, #11131a)` }}
          >
            <button type="button" onClick={() => cycleAway(-1)} className="p-2 bg-black/45 hover:bg-black/75 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white/80">{safeAway.city}</div>
              <div className="text-2xl font-black uppercase tracking-tight">{safeAway.name}</div>
              <div className="mt-1 text-xs font-mono tabular-nums text-[#F9A01B] font-black">
                OVR {safeAway.ovr} · {safeAway.code}
              </div>
            </div>
            <button type="button" onClick={() => cycleAway(1)} className="p-2 bg-black/45 hover:bg-black/75 cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Starting 5</div>
            {safeAway.players.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#161923] border border-white/5">
                <span className="font-semibold">
                  <span className="text-[#F9A01B] font-mono mr-2">{p.pos}</span>
                  #{p.jersey} {p.name}
                </span>
                <span className="font-mono font-black tabular-nums text-white">{p.ovr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER MATCH SETTINGS */}
        <div className="bg-[#0f1116]/94 border border-[#CE1141]/60 p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="text-center border-b border-white/10 pb-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]">Matchup Hub</div>
              <div className="text-sm font-black uppercase truncate">{safeHome.arenaName}</div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Court Environment</label>
              <select
                value={courtEnv}
                onChange={(e) => setCourtEnv(e.target.value as CourtEnvId)}
                className="w-full bg-[#171a23] border border-white/20 px-2.5 py-1.5 text-xs font-bold uppercase"
              >
                <option value="nba">NBA Regulation Arena</option>
                <option value="euroleague">Euroleague FIBA Arena</option>
                <option value="blacktop">NBA Blacktop Street Court</option>
                <option value="park">The Park Plaza</option>
                <option value="practice">Practice Gym</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Difficulty</label>
              <select
                value={settings.game.difficulty}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    game: { ...settings.game, difficulty: e.target.value as DifficultyTier },
                  })
                }
                className="w-full bg-[#171a23] border border-white/20 px-2.5 py-1.5 text-xs font-bold uppercase"
              >
                {(['Rookie', 'Pro', 'All-Star', 'Superstar', 'Hall of Fame'] as DifficultyTier[]).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quarter Min</label>
                <select
                  value={settings.game.quarterLengthMin}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      game: { ...settings.game, quarterLengthMin: Number(e.target.value) as Nba2k14Settings['game']['quarterLengthMin'] },
                    })
                  }
                  className="w-full bg-[#171a23] border border-white/20 px-2 py-1.5 text-xs font-bold font-mono"
                >
                  {[1, 2, 3, 5, 6, 8, 10, 12].map((m) => (
                    <option key={m} value={m}>{m} Min</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Jerseys</label>
                <select
                  value={jerseyMode}
                  onChange={(e) => setJerseyMode(e.target.value as 'standard' | 'alternate')}
                  className="w-full bg-[#171a23] border border-white/20 px-2 py-1.5 text-xs font-bold uppercase"
                >
                  <option value="standard">Home / Away</option>
                  <option value="alternate">Alternate</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTipOff}
            className="w-full py-3.5 bg-[#CE1141] bg-gradient-to-r from-[#CE1141] to-[#a10d33] hover:brightness-110 border border-[#F9A01B] text-white text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" /> Tip Off
          </button>
        </div>

        {/* HOME TEAM */}
        <div className="bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Home Team</span>
            <button
              type="button"
              onClick={() => setUserSide('home')}
              className={`px-2.5 py-0.5 text-[10px] font-black uppercase border cursor-pointer ${
                userSide === 'home' ? 'bg-[#CE1141] border-[#F9A01B] text-white' : 'bg-[#181b25] border-white/15 text-slate-400'
              }`}
            >
              {userSide === 'home' ? 'USER CONTROL' : 'CPU'}
            </button>
          </div>

          <div
            className="p-4 border border-white/15 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${safeHome.primaryColor}cc, #11131a)` }}
          >
            <button type="button" onClick={() => cycleHome(-1)} className="p-2 bg-black/45 hover:bg-black/75 cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white/80">{safeHome.city}</div>
              <div className="text-2xl font-black uppercase tracking-tight">{safeHome.name}</div>
              <div className="mt-1 text-xs font-mono tabular-nums text-[#F9A01B] font-black">
                OVR {safeHome.ovr} · {safeHome.code}
              </div>
            </div>
            <button type="button" onClick={() => cycleHome(1)} className="p-2 bg-black/45 hover:bg-black/75 cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Starting 5</div>
            {safeHome.players.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-[#161923] border border-white/5">
                <span className="font-semibold">
                  <span className="text-[#F9A01B] font-mono mr-2">{p.pos}</span>
                  #{p.jersey} {p.name}
                </span>
                <span className="font-mono font-black tabular-nums text-white">{p.ovr}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
