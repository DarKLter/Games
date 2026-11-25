// ============================================================================
// NBA 2K14 — LeBron: Path to Greatness (Heat Dynasty + Fantastic Journey)
// ============================================================================

import React from 'react';
import { Crown, Play, Star } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { PATH_TO_GREATNESS_CHAPTERS } from '../data/modesData';
import { getTeamById } from '../data/rosters';
import type { MatchConfig, PathChapterDef, PathToGreatnessState } from '../types';

interface PathToGreatnessViewProps {
  state: PathToGreatnessState;
  onSelectPath: (p: 'heat_dynasty' | 'fantastic_journey') => void;
  onLaunchChapter: (cfg: MatchConfig) => void;
  onBack: () => void;
}

export const PathToGreatnessView: React.FC<PathToGreatnessViewProps> = ({
  state,
  onSelectPath,
  onLaunchChapter,
  onBack,
}) => {
  const chapters = PATH_TO_GREATNESS_CHAPTERS.filter((c) => c.path === state.selectedPath);
  const totalStars = Object.values(state.completedStars).reduce((a, b) => a + b, 0);
  const maxStars = PATH_TO_GREATNESS_CHAPTERS.length * 3;

  const startChapter = (ch: PathChapterDef) => {
    Nba2k14Audio.playUiClick('select');
    const heat = getTeamById('mia');
    const lebron = heat.players.find((p) => p.name.includes('LeBron'))!;
    const userTeam = getTeamById(ch.userTeamId);
    const customLineup =
      ch.userTeamId !== 'mia'
        ? [
            { ...lebron, teamId: ch.userTeamId },
            ...userTeam.players.filter((p) => p.pos !== 'SF').slice(0, 8),
          ]
        : undefined;

    onLaunchChapter({
      mode: 'path',
      title: `Path to Greatness · ${ch.title}`,
      subtitle: ch.subtitle,
      homeTeamId: ch.userTeamId,
      awayTeamId: ch.oppTeamId,
      homeCustomPlayers: customLineup,
      userSide: 'home',
      courtEnv: ch.courtEnv,
      quarterLengthMin: 4,
      playersPerSide: 5,
      fibaRules: ch.courtEnv === 'euroleague',
      startQuarter: ch.startQuarter,
      startClockSec: ch.startClockSec,
      startHomeScore: ch.startUserScore,
      startAwayScore: ch.startOppScore,
      pathChapterId: ch.id,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
      <div className="bg-[#0f1116]/94 border border-[#CE1141]/70 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F9A01B]">
            <Crown className="w-4 h-4" /> NBA 2K14 Exclusive Story Mode
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">LeBron: Path to Greatness</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums text-amber-300 mr-2">
            STARS: {totalStars} / {maxStars}
          </span>
          <button
            type="button"
            onClick={() => {
              Nba2k14Audio.playUiClick('select');
              onSelectPath('heat_dynasty');
            }}
            className={`px-3.5 py-2 text-xs font-black uppercase border cursor-pointer ${
              state.selectedPath === 'heat_dynasty'
                ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                : 'bg-[#171a23] border-white/15 text-slate-300'
            }`}
          >
            Path A: Heat Dynasty
          </button>
          <button
            type="button"
            onClick={() => {
              Nba2k14Audio.playUiClick('select');
              onSelectPath('fantastic_journey');
            }}
            className={`px-3.5 py-2 text-xs font-black uppercase border cursor-pointer ${
              state.selectedPath === 'fantastic_journey'
                ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                : 'bg-[#171a23] border-white/15 text-slate-300'
            }`}
          >
            Path B: Fantastic Journey
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-2 bg-[#171a23] hover:bg-[#232836] border border-white/15 text-xs font-bold uppercase cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {chapters.map((ch) => {
          const stars = state.completedStars[ch.id] ?? 0;
          const opp = getTeamById(ch.oppTeamId);
          return (
            <div key={ch.id} className="bg-[#0f1116]/94 border border-white/15 p-4 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#F9A01B]">
                  <span>Chapter 0{ch.index}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${stars >= n ? 'fill-[#F9A01B] text-[#F9A01B]' : 'text-slate-600'}`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-base font-black uppercase mt-1">{ch.title}</h3>
                <div className="text-xs text-rose-300 font-semibold">{ch.subtitle}</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{ch.story}</p>

                <div className="mt-3 p-2.5 bg-[#151822] border border-white/10 text-[11px] space-y-1">
                  <div className="font-mono tabular-nums text-slate-200">
                    Start: Q{ch.startQuarter} · {Math.floor(ch.startClockSec / 60)}:00 · {ch.startUserScore}-{ch.startOppScore} vs {opp.code}
                  </div>
                  <div className="text-amber-300">Gold: {ch.objectives.gold}</div>
                  <div className="text-slate-300">Silver: {ch.objectives.silver}</div>
                  <div className="text-slate-400">Bronze: {ch.objectives.bronze}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startChapter(ch)}
                className="w-full py-2 bg-[#CE1141] hover:bg-rose-600 border border-[#F9A01B]/70 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play Scenario
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
