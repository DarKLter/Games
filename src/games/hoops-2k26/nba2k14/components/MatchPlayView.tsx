// ============================================================================
// NBA 2K14 — Live 3D Match Viewport, Authentic On-Court Broadcast HUD,
// Pause Menu (10s 3D Instant Replay, Gameplan, Box Score, Options),
// Virtual Touch Controller & Post-Game Summary + VC/SP Payout
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { FastForward, Pause, Play, Rewind, RotateCcw, Settings, Shield, Trophy, Users, X } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { DUNK_CONTEST_MOVES } from '../data/modesData';
import { Nba2k14Engine } from '../engine/Nba2k14Engine';
import type {
  MatchConfig,
  MatchHudSnapshot,
  MatchResultSummary,
  Nba2k14Settings,
  OtfcState,
} from '../types';
import { OptionsSuiteView } from './OptionsSuiteView';

interface MatchPlayViewProps {
  config: MatchConfig;
  settings: Nba2k14Settings;
  onUpdateSettings: (next: Nba2k14Settings) => void;
  onFinishMatch: (summary: MatchResultSummary) => void;
  onQuitToMenu: () => void;
}

function formatClock(sec: number): string {
  const s = Math.max(0, sec);
  if (s < 60) {
    return s.toFixed(1).padStart(4, '0');
  }
  const m = Math.floor(s / 60);
  const rem = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const MatchPlayView: React.FC<MatchPlayViewProps> = ({
  config,
  settings,
  onUpdateSettings,
  onFinishMatch,
  onQuitToMenu,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Nba2k14Engine | null>(null);

  const [hud, setHud] = useState<MatchHudSnapshot | null>(null);
  const [summary, setSummary] = useState<MatchResultSummary | null>(null);
  const [pauseTab, setPauseTab] = useState<'main' | 'gameplan' | 'boxscore' | 'options'>('main');
  const [postTab, setPostTab] = useState<'pog' | 'home' | 'away' | 'payout'>('pog');
  const [touchMode, setTouchMode] = useState(() => {
    if (settings.controller.virtualGamepad === 'Always On') return true;
    if (settings.controller.virtualGamepad === 'Off') return false;
    return typeof window !== 'undefined' && window.innerWidth < 960;
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const engine = new Nba2k14Engine(
      mountRef.current,
      config,
      settings,
      (snap) => setHud(snap),
      (res) => {
        setSummary(res);
        onFinishMatch(res);
      }
    );
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    engineRef.current?.updateSettings(settings);
    if (settings.controller.virtualGamepad === 'Always On') setTouchMode(true);
    else if (settings.controller.virtualGamepad === 'Off') setTouchMode(false);
  }, [settings]);

  const handleRestart = () => {
    if (!mountRef.current) return;
    engineRef.current?.dispose();
    setSummary(null);
    setPauseTab('main');
    const engine = new Nba2k14Engine(
      mountRef.current,
      config,
      settings,
      (snap) => setHud(snap),
      (res) => {
        setSummary(res);
        onFinishMatch(res);
      }
    );
    engineRef.current = engine;
  };

  const quarterLabel =
    hud && config.targetScore
      ? `TO ${config.targetScore}`
      : hud && hud.quarter > 4
        ? `OT${hud.quarter - 4}`
        : `Q${hud?.quarter ?? 1}`;

  const homeBox = (hud?.boxScore ?? []).filter((b) => b.teamSide === 'home');
  const awayBox = (hud?.boxScore ?? []).filter((b) => b.teamSide === 'away');

  return (
    <div className="fixed inset-0 z-50 bg-[#090a0d] text-white select-none overflow-hidden font-sans">
      {/* LIVE 3D WEBGL COURT VIEWPORT */}
      <div ref={mountRef} className="w-full h-full" />

      {/* ====================================================================
          TOP-LEFT: ACTIVE SIGNATURE SKILL GOLD FLASH + FPS + PAUSE TRIGGER
         ==================================================================== */}
      {hud && !summary && (
        <div className="pointer-events-none fixed top-3 left-3 z-20 flex flex-col gap-2">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => engineRef.current?.setPaused(!hud.paused)}
              className="px-3 py-1.5 bg-[#0f1116]/92 border border-white/20 hover:border-[#CE1141] text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 rounded-sm cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 text-[#F9A01B]" />
              <span>Pause (Esc)</span>
            </button>
            <button
              type="button"
              onClick={() => setTouchMode((t) => !t)}
              className="px-2.5 py-1.5 bg-[#0f1116]/90 border border-white/15 hover:border-white/40 text-[11px] font-semibold uppercase tracking-wide rounded-sm cursor-pointer"
            >
              {touchMode ? 'Hide Pad' : 'Touch Pad'}
            </button>
            <button
              type="button"
              onClick={() => engineRef.current?.finishEarlyAndSummarize()}
              className="px-2.5 py-1.5 bg-[#0f1116]/90 border border-white/15 hover:border-[#F9A01B] text-[11px] font-semibold uppercase tracking-wide rounded-sm cursor-pointer text-amber-300"
            >
              Sim To End
            </button>
            {settings.graphics.fpsCounter && (
              <span className="px-2 py-1 bg-[#0f1116]/90 border border-white/15 text-[11px] font-mono tabular-nums text-emerald-400">
                {hud.fps} FPS
              </span>
            )}
          </div>

          {hud.sigPopup && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-[#14110b]/95 border border-[#F9A01B] shadow-lg rounded-sm">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F9A01B] to-[#92400e] text-[#090a0d] font-black text-xs flex items-center justify-center border border-amber-200">
                {hud.sigPopup.code}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]">
                  Signature Skill Lv.{hud.sigPopup.level}
                </div>
                <div className="text-sm font-black uppercase tracking-wide text-white leading-tight">
                  {hud.sigPopup.skillName}
                </div>
                <div className="text-[11px] text-slate-300">{hud.sigPopup.playerName}</div>
              </div>
            </div>
          )}

          {hud.trainingState && (
            <div className="max-w-xs px-3 py-2 bg-[#0f1116]/92 border border-[#F9A01B]/60 rounded-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#F9A01B]">
                Training Camp · {hud.trainingState.completedReps}/{hud.trainingState.targetReps}
              </div>
              <div className="text-xs font-black uppercase">{hud.trainingState.drillTitle}</div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{hud.trainingState.instruction}</p>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TOP-CENTER: SHOT FEEDBACK BANNER, PA CALLOUTS & BROADCAST TICKER
         ==================================================================== */}
      {hud && !summary && (
        <div className="pointer-events-none fixed top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 w-[min(560px,78vw)]">
          {hud.shotFeedback && (
            <div className="px-4 py-1.5 bg-[#0f1116]/94 border border-white/25 flex items-center gap-3 rounded-sm shadow-lg">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  hud.shotFeedback.release === 'EXCELLENT'
                    ? 'text-emerald-400'
                    : hud.shotFeedback.release.includes('SLIGHTLY')
                      ? 'text-amber-300'
                      : 'text-rose-400'
                }`}
              >
                RELEASE: {hud.shotFeedback.release}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-xs font-black uppercase text-white">
                QUALITY: {hud.shotFeedback.quality} ({hud.shotFeedback.contestLabel})
              </span>
            </div>
          )}

          {hud.paBanner && (
            <div className="px-5 py-1.5 bg-[#CE1141] border border-amber-300/70 text-xs font-black uppercase tracking-widest text-white shadow-lg">
              {hud.paBanner}
            </div>
          )}

          {/* Special Modes Top Center Readouts */}
          {hud.shootoutState && (
            <div className="px-4 py-1.5 bg-[#0f1116]/94 border border-[#F9A01B] flex items-center gap-4 text-xs font-mono tabular-nums">
              <span className="font-black text-[#F9A01B]">3PT SHOOTOUT</span>
              <span>SCORE: <strong className="text-white text-sm">{hud.shootoutState.score}</strong></span>
              <span>RACK: {hud.shootoutState.rackIndex + 1}/5</span>
              <span>TIME: {hud.shootoutState.timeLeft.toFixed(1)}s</span>
              {hud.shootoutState.isMoneyBall && <span className="text-amber-300 font-black">MONEY BALL (2 PTS)</span>}
            </div>
          )}

          {hud.dunkContestState && (
            <div className="pointer-events-auto px-4 py-2 bg-[#0f1116]/95 border border-[#F9A01B] flex flex-col items-center gap-2 rounded-sm">
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                <span className="text-[#F9A01B]">Sprite Slam Dunk Contest</span>
                <span>Round {hud.dunkContestState.round}/2</span>
                <span className="font-mono tabular-nums">Total: {hud.dunkContestState.totalScore}</span>
              </div>
              {hud.dunkContestState.phase === 'select' && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {DUNK_CONTEST_MOVES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => engineRef.current?.selectDunkContestMove(m.id)}
                      className="px-2.5 py-1 bg-[#1b1f2a] hover:bg-[#CE1141] border border-white/20 text-[11px] font-bold uppercase cursor-pointer"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
              {hud.dunkContestState.phase === 'scored' && hud.dunkContestState.lastJudgeScores.length > 0 && (
                <div className="flex items-center gap-2">
                  {hud.dunkContestState.lastJudgeScores.map((s, idx) => (
                    <span
                      key={idx}
                      className="w-8 h-8 flex items-center justify-center bg-white text-[#090a0d] font-black font-mono text-sm border-2 border-[#CE1141]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Broadcast Commentary Line */}
          <div className="px-3 py-1 bg-[#090a0d]/85 border border-white/10 text-[11px] text-slate-200 text-center max-w-full truncate">
            {hud.commentary}
          </div>
        </div>
      )}

      {/* ====================================================================
          TOP-RIGHT: MYCAREER TEAMMATE GRADE & LIVE PLAYER TELEMETRY
         ==================================================================== */}
      {hud && !summary && (
        <div className="pointer-events-none fixed top-3 right-3 z-20 flex flex-col items-end gap-1.5">
          <div className="w-60 bg-[#0f1116]/94 border border-white/20 px-3 py-2 rounded-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  #{hud.controlledPlayerJersey} {hud.controlledPlayerPos} · Teammate Grade
                </div>
                <div className="text-xs font-black uppercase truncate text-white">
                  {hud.controlledPlayerName}
                </div>
              </div>
              <div className="w-10 h-10 bg-[#1a1d26] border border-[#F9A01B] flex items-center justify-center text-lg font-black text-[#F9A01B] font-mono">
                {hud.teammateGrade}
              </div>
            </div>
            <div className="mt-1.5 h-1.5 bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]"
                style={{ width: `${Math.round(hud.teammateGradeFill * 100)}%` }}
              />
            </div>
            {hud.playerLockStats && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-200">
                <span>PTS {hud.playerLockStats.pts}</span>
                <span>REB {hud.playerLockStats.reb}</span>
                <span>AST {hud.playerLockStats.ast}</span>
                <span>STL {hud.playerLockStats.stl}</span>
                <span>BLK {hud.playerLockStats.blk}</span>
              </div>
            )}
          </div>

          {hud.gradeEvents.length > 0 && (
            <div className="flex flex-col items-end gap-0.5">
              {hud.gradeEvents.slice(0, 3).map((ev) => (
                <span
                  key={ev.id}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase bg-[#0f1116]/90 border ${
                    ev.positive ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300'
                  }`}
                >
                  {ev.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          ICON PASSING OVERLAY (HOLD/TOGGLE R -> PRESS 1-5)
         ==================================================================== */}
      {hud && hud.iconPassActive && !hud.paused && !summary && (
        <div className="pointer-events-none fixed inset-0 z-15">
          {hud.iconTargets.map((t) => (
            <div
              key={t.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${t.screenX}px`, top: `${t.screenY}px` }}
            >
              <div className="w-8 h-8 rounded-full bg-[#CE1141] border-2 border-[#F9A01B] flex items-center justify-center font-black text-xs font-mono shadow-lg">
                {t.key}
              </div>
              <span className="mt-0.5 px-1.5 py-0.5 bg-[#090a0d]/90 text-[10px] font-bold uppercase whitespace-nowrap">
                {t.pos} · {t.name.split(' ').slice(-1)[0]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================
          SHOT TIMING METER (HANDS DISPLAY OPTION) & FREE THROW METER
         ==================================================================== */}
      {hud && hud.shotMeterActive && settings.controller.shotMeterDisplay === 'On (Hands)' && !summary && (
        <div className="pointer-events-none fixed left-1/2 top-[38%] -translate-x-1/2 z-20 w-44 bg-[#0f1116]/94 border border-white/25 p-2 rounded-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-center text-slate-300 mb-1">
            Release Timing
          </div>
          <div className="relative h-3 bg-slate-800 overflow-hidden">
            <div className="absolute top-0 bottom-0 left-[76%] w-[12%] bg-emerald-500/45 border-x border-emerald-300" />
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400"
              style={{ width: `${Math.min(100, Math.round(hud.shotMeterFill * 100))}%` }}
            />
          </div>
        </div>
      )}

      {hud && hud.freeThrowActive && !summary && (
        <div className="fixed left-1/2 top-[36%] -translate-x-1/2 z-30 w-72 bg-[#0f1116]/96 border-2 border-[#F9A01B] p-3 rounded-sm text-center">
          <div className="text-xs font-black uppercase tracking-wider text-[#F9A01B]">
            Free Throw · {hud.freeThrowShooterName} ({hud.freeThrowRemaining} left)
          </div>
          <div className="relative mt-2.5 h-5 bg-slate-800 border border-white/20">
            <div className="absolute top-0 bottom-0 left-[44%] w-[12%] bg-emerald-500/45 border-x border-emerald-300" />
            <div
              className="absolute top-0 bottom-0 w-1.5 bg-white"
              style={{ left: `calc(${Math.round(hud.freeThrowPos * 100)}% - 3px)` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-300 uppercase font-semibold">
            Press Space / Shoot in the Green Zone
          </div>
        </div>
      )}

      {/* ====================================================================
          BOTTOM-LEFT: ON-THE-FLY COACHING (OTFC) D-PAD OVERLAY
         ==================================================================== */}
      {hud && !summary && !hud.paused && (
        <div className="fixed bottom-3 left-3 z-20 flex flex-col gap-1.5">
          {hud.otfc.openTab && (
            <div className="w-64 bg-[#0f1116]/96 border border-[#CE1141] p-2.5 rounded-sm shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#F9A01B] mb-2">
                <span>
                  OTFC · {hud.otfc.openTab === 'strategy' ? 'Points of Emphasis' : hud.otfc.openTab === 'plays' ? 'Plays & Defense' : hud.otfc.openTab === 'subs' ? 'Quick Substitutions' : 'On-Court Sig Skills'}
                </span>
                <button
                  type="button"
                  onClick={() => engineRef.current?.triggerOtfcAction({ tab: null })}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {hud.otfc.openTab === 'strategy' && (
                <div className="grid grid-cols-1 gap-1">
                  {(['Get Shooters Open', 'Feed the Post', 'Crash Offensive Glass', 'Play Through Star', 'Limit Transition', 'Protect the Paint'] as OtfcState['offensePoe'][]).map(
                    (poe) => (
                      <button
                        key={poe}
                        type="button"
                        onClick={() => engineRef.current?.triggerOtfcAction({ offensePoe: poe })}
                        className={`text-left px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer ${
                          hud.otfc.offensePoe === poe
                            ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                            : 'bg-[#171a22] border-white/10 text-slate-200 hover:border-white/30'
                        }`}
                      >
                        {poe}
                      </button>
                    )
                  )}
                </div>
              )}

              {hud.otfc.openTab === 'plays' && (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Offense Quick Plays</div>
                  <div className="grid grid-cols-2 gap-1">
                    {(['Quick Iso', 'Pick & Roll', 'Motion Cuts', '3PT Play'] as OtfcState['activePlay'][]).map((pl) => (
                      <button
                        key={pl}
                        type="button"
                        onClick={() => engineRef.current?.triggerOtfcAction({ activePlay: pl })}
                        className={`px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer ${
                          hud.otfc.activePlay === pl
                            ? 'bg-[#CE1141] border-[#F9A01B]'
                            : 'bg-[#171a22] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {pl}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold pt-1">Defensive Sets</div>
                  <div className="grid grid-cols-2 gap-1">
                    {(['Man-to-Man', '2-3 Zone', '3-2 Zone', 'Half-Court Trap', 'Full-Court Press'] as OtfcState['defenseSet'][]).map(
                      (df) => (
                        <button
                          key={df}
                          type="button"
                          onClick={() => engineRef.current?.triggerOtfcAction({ defenseSet: df })}
                          className={`px-2 py-1 text-[11px] font-bold uppercase border cursor-pointer ${
                            hud.otfc.defenseSet === df
                              ? 'bg-[#CE1141] border-[#F9A01B]'
                              : 'bg-[#171a22] border-white/10 hover:border-white/30'
                          }`}
                        >
                          {df}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {hud.otfc.openTab === 'subs' && (
                <div className="grid grid-cols-2 gap-1">
                  {(['Starters', 'Bench', 'Tall', '3PT', 'Defense'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => engineRef.current?.triggerOtfcAction({ subPreset: preset })}
                      className="px-2 py-1.5 text-[11px] font-bold uppercase bg-[#171a22] hover:bg-[#CE1141] border border-white/15 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}

              {hud.otfc.openTab === 'skills' && (
                <div className="space-y-1 text-[11px]">
                  <div className="font-bold text-white">{hud.controlledPlayerName}</div>
                  {hud.controlledPlayerSkills.map((sk) => (
                    <div key={sk.id} className="flex justify-between text-amber-300 border-b border-white/10 pb-0.5">
                      <span className="uppercase">{sk.id.replace(/_/g, ' ')}</span>
                      <span className="font-mono">Lv.{sk.level}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Compact D-Pad OTFC Quick Bar */}
          {!touchMode && (
            <div className="flex items-center gap-1 bg-[#0f1116]/90 border border-white/15 px-2 py-1 text-[10px] font-bold uppercase">
              <button type="button" onClick={() => engineRef.current?.triggerOtfcAction({ tab: 'strategy' })} className="px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer">
                ← POE
              </button>
              <span className="text-white/20">|</span>
              <button type="button" onClick={() => engineRef.current?.triggerOtfcAction({ tab: 'plays' })} className="px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer">
                → Plays/Def
              </button>
              <span className="text-white/20">|</span>
              <button type="button" onClick={() => engineRef.current?.triggerOtfcAction({ tab: 'subs' })} className="px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer">
                ↓ Subs
              </button>
              <span className="text-white/20">|</span>
              <button type="button" onClick={() => engineRef.current?.triggerOtfcAction({ tab: 'skills' })} className="px-1.5 py-0.5 hover:text-[#F9A01B] cursor-pointer">
                ↑ Skills
              </button>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">WASD · Space:Shoot · E:Pass · I/J/K/L:ProStick · V:PnR · C:IntenseD</span>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          BOTTOM-RIGHT: ICONIC NBA 2K14 BROADCAST SCOREBUG
         ==================================================================== */}
      {hud && settings.presentation.scoreboardDisplay && !summary && (
        <div className="fixed bottom-3 right-3 z-20 w-[328px] bg-[#0d0f14]/96 border border-white/20 shadow-2xl rounded-sm overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_92px] border-b border-white/15">
            {/* Away Team Strip */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-r border-white/10" style={{ background: `linear-gradient(90deg, ${hud.awayColor}cc, #12141b)` }}>
              <div className="flex items-center gap-1.5">
                {hud.possession === 'away' && <span className="text-[#F9A01B] text-[10px] font-black">▸</span>}
                <span className="text-sm font-black tracking-wider uppercase">{hud.awayCode}</span>
              </div>
              <span className="text-xl font-black font-mono tabular-nums">{hud.awayScore}</span>
            </div>
            {/* Home Team Strip */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-r border-white/10" style={{ background: `linear-gradient(90deg, ${hud.homeColor}cc, #12141b)` }}>
              <div className="flex items-center gap-1.5">
                {hud.possession === 'home' && <span className="text-[#F9A01B] text-[10px] font-black">▸</span>}
                <span className="text-sm font-black tracking-wider uppercase">{hud.homeCode}</span>
              </div>
              <span className="text-xl font-black font-mono tabular-nums">{hud.homeScore}</span>
            </div>
            {/* Quarter & Game Clock */}
            <div className="flex flex-col items-center justify-center bg-[#090a0d] px-2 py-1">
              <span className="text-[10px] font-black tracking-widest text-[#F9A01B] uppercase">{quarterLabel}</span>
              <span className="text-sm font-black font-mono tabular-nums text-white">{formatClock(hud.gameClockSec)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2.5 py-1 bg-[#141720] text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">TO {hud.awayTimeouts}-{hud.homeTimeouts}</span>
              {(hud.homeFoulsQ >= 5 || hud.awayFoulsQ >= 5) && (
                <span className="text-[#F9A01B] font-black">BONUS</span>
              )}
              <span className="text-slate-400">{hud.otfc.defenseSet}</span>
            </div>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-slate-400">SHOT</span>
              <span className={`font-black text-xs ${hud.shotClockSec <= 5 ? 'text-[#CE1141]' : 'text-amber-300'}`}>
                :{String(Math.ceil(hud.shotClockSec)).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          ON-SCREEN VIRTUAL CONTROLLER (TOUCH / CLICK TOGGLE)
         ==================================================================== */}
      {touchMode && hud && !hud.paused && !summary && (
        <div className="fixed inset-x-0 bottom-16 z-25 pointer-events-none flex items-end justify-between px-4">
          {/* Left Directional Pad */}
          <div className="pointer-events-auto grid grid-cols-3 gap-1 w-32 h-32 bg-[#0f1116]/85 border border-white/15 p-1.5 rounded-sm">
            <div />
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ moveY: -1 })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ moveY: 0 })}
              onPointerLeave={() => engineRef.current?.setVirtualInput({ moveY: 0 })}
              className="bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ moveX: -1 })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ moveX: 0 })}
              onPointerLeave={() => engineRef.current?.setVirtualInput({ moveX: 0 })}
              className="bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ sprint: true })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ sprint: false })}
              className="bg-[#F9A01B] text-[#090a0d] text-[9px] font-black uppercase rounded-sm cursor-pointer"
            >
              TURBO
            </button>
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ moveX: 1 })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ moveX: 0 })}
              onPointerLeave={() => engineRef.current?.setVirtualInput({ moveX: 0 })}
              className="bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer"
            >
              ▶
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ moveY: 1 })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ moveY: 0 })}
              onPointerLeave={() => engineRef.current?.setVirtualInput({ moveY: 0 })}
              className="bg-[#1c202c] active:bg-[#CE1141] text-xs font-black rounded-sm cursor-pointer"
            >
              ▼
            </button>
            <div />
          </div>

          {/* Right Action Buttons */}
          <div className="pointer-events-auto grid grid-cols-2 gap-1.5 bg-[#0f1116]/85 border border-white/15 p-2 rounded-sm">
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setVirtualInput({ shoot: true })}
              onPointerUp={() => engineRef.current?.setVirtualInput({ shoot: false })}
              className="px-3.5 py-2.5 bg-[#CE1141] active:bg-rose-500 text-xs font-black uppercase rounded-sm cursor-pointer"
            >
              Shoot / Steal
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: settings.keybinds.pass }))}
              className="px-3.5 py-2.5 bg-[#1e2432] active:bg-sky-600 text-xs font-black uppercase rounded-sm cursor-pointer"
            >
              Pass / Switch
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: settings.keybinds.proStickLeft }))}
              className="px-3 py-2 bg-[#1e2432] active:bg-[#F9A01B] text-[11px] font-black uppercase rounded-sm cursor-pointer"
            >
              Iso Cross
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: settings.keybinds.postUp }))}
              className="px-3 py-2 bg-[#1e2432] active:bg-emerald-600 text-[11px] font-black uppercase rounded-sm cursor-pointer"
            >
              Post / Block
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          10-SECOND 3D INSTANT REPLAY SCRUBBER BAR
         ==================================================================== */}
      {hud && hud.replayMode && !summary && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="w-full max-w-2xl bg-[#0d0f15]/96 border border-[#F9A01B] p-3.5 rounded-sm shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">
                2K14 3D Instant Replay · Drag Viewport to Orbit Camera
              </div>
              <button
                type="button"
                onClick={() => engineRef.current?.exitInstantReplay()}
                className="px-3 py-1 bg-[#CE1141] text-xs font-bold uppercase rounded-sm cursor-pointer"
              >
                Back to Pause
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, hud.replayLength - 1)}
              value={hud.replayIndex}
              onChange={(e) => engineRef.current?.setReplayControls({ index: Number(e.target.value), playing: false })}
              className="w-full accent-[#CE1141]"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => engineRef.current?.setReplayControls({ index: Math.max(0, hud.replayIndex - 15), playing: false })}
                  className="p-1.5 bg-[#1b1f2b] border border-white/15 hover:border-white cursor-pointer"
                >
                  <Rewind className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => engineRef.current?.setReplayControls({ playing: !hud.replayPlaying })}
                  className="px-3 py-1.5 bg-[#CE1141] font-bold uppercase flex items-center gap-1 cursor-pointer"
                >
                  {hud.replayPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {hud.replayPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => engineRef.current?.setReplayControls({ index: Math.min(hud.replayLength - 1, hud.replayIndex + 15), playing: false })}
                  className="p-1.5 bg-[#1b1f2b] border border-white/15 hover:border-white cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 font-mono tabular-nums">
                {([0.25, 0.5, 1] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => engineRef.current?.setReplayControls({ speed: sp })}
                    className={`px-2 py-1 border text-[11px] font-bold cursor-pointer ${
                      hud.replaySpeed === sp ? 'bg-[#F9A01B] text-[#090a0d] border-[#F9A01B]' : 'bg-[#171a22] border-white/15'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
                <span className="ml-2 text-slate-400">
                  Frame {hud.replayIndex}/{hud.replayLength}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          NBA 2K14 PAUSE MENU (LEFT GLOSSY VERTICAL STACK)
         ==================================================================== */}
      {hud && hud.paused && !hud.replayMode && !summary && (
        <div className="fixed inset-0 z-35 bg-[#090a0d]/82 flex">
          {/* Left Glossy Stack */}
          <div className="w-72 bg-[#0e1017] border-r border-white/15 p-5 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#F9A01B]">NBA 2K14 · Game Paused</div>
              <div className="text-2xl font-black uppercase tracking-tight mt-0.5">
                {hud.awayCode} {hud.awayScore} — {hud.homeScore} {hud.homeCode}
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums mb-5">
                {quarterLabel} · {formatClock(hud.gameClockSec)}
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'resume', label: 'Resume Game', action: () => engineRef.current?.setPaused(false) },
                  { id: 'replay', label: 'Instant Replay (3D)', action: () => engineRef.current?.enterInstantReplay() },
                  { id: 'gameplan', label: 'Gameplan & Subs', action: () => setPauseTab('gameplan') },
                  { id: 'boxscore', label: 'Box Score', action: () => setPauseTab('boxscore') },
                  { id: 'options', label: 'Options & Sliders', action: () => setPauseTab('options') },
                  { id: 'timeout', label: 'Call Timeout', action: () => { engineRef.current?.callTimeout(); engineRef.current?.setPaused(false); } },
                  { id: 'restart', label: 'Restart Game', action: handleRestart },
                  { id: 'quit', label: 'Quit to Main Menu', action: onQuitToMenu },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      Nba2k14Audio.playUiClick('select');
                      item.action();
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                      (pauseTab === item.id || item.id === 'resume')
                        ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                        : 'bg-[#161923] border-white/10 text-slate-200 hover:bg-[#232736]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 uppercase">Press Esc / Start to Resume</div>
          </div>

          {/* Right Dynamic Pause Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {pauseTab === 'main' && (
              <div className="max-w-xl bg-[#11131b] border border-white/15 p-5">
                <h3 className="text-lg font-black uppercase tracking-wider text-[#F9A01B] mb-3">
                  Pro Stick Control Reference
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>WASD / Left Stick:</strong> Move</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>Left Shift / RT:</strong> Sprint / Dunk</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>Space (Hold):</strong> Shoot / Layup / Dunk</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>Space (Tap):</strong> Pump Fake / Steal</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>I / J / K / L:</strong> Pro Stick IsoMotion</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>E / C+E / Z:</strong> Pass / Bounce / Flashy</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>C + Space:</strong> Alley-Oop Lob</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>R + 1-5:</strong> Icon Pass</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>F:</strong> Post-Up / Block & Rebound</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>V:</strong> Pick & Roll / Take Charge</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>C / U:</strong> Intense D / Hands Up</div>
                  <div className="p-2.5 bg-[#171b26] border border-white/10"><strong>Arrow Keys:</strong> OTFC Coaching</div>
                </div>
              </div>
            )}

            {pauseTab === 'gameplan' && (
              <div className="max-w-2xl bg-[#11131b] border border-white/15 p-5 space-y-4">
                <h3 className="text-lg font-black uppercase text-[#F9A01B] flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Coach Gameplan & Lineup Substitutions
                </h3>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2">Quick Rotation Preset</div>
                  <div className="flex flex-wrap gap-2">
                    {(['Starters', 'Bench', 'Tall', '3PT', 'Defense'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => engineRef.current?.triggerOtfcAction({ subPreset: preset })}
                        className="px-3 py-1.5 bg-[#1b202e] hover:bg-[#CE1141] border border-white/15 text-xs font-bold uppercase cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase text-slate-400 mb-2">Defensive Set</div>
                  <div className="flex flex-wrap gap-2">
                    {(['Man-to-Man', '2-3 Zone', '3-2 Zone', 'Half-Court Trap', 'Full-Court Press'] as OtfcState['defenseSet'][]).map(
                      (df) => (
                        <button
                          key={df}
                          type="button"
                          onClick={() => engineRef.current?.triggerOtfcAction({ defenseSet: df })}
                          className={`px-3 py-1.5 border text-xs font-bold uppercase cursor-pointer ${
                            hud.otfc.defenseSet === df ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#1b202e] border-white/15'
                          }`}
                        >
                          {df}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {pauseTab === 'boxscore' && (
              <div className="bg-[#11131b] border border-white/15 p-5 space-y-5">
                <h3 className="text-lg font-black uppercase text-[#F9A01B] flex items-center gap-2">
                  <Users className="w-5 h-5" /> Live Game Box Score
                </h3>
                {[
                  { label: hud.homeCode + ' (Home)', rows: homeBox },
                  { label: hud.awayCode + ' (Away)', rows: awayBox },
                ].map((grp) => (
                  <div key={grp.label}>
                    <div className="text-xs font-black uppercase text-slate-300 mb-1.5">{grp.label}</div>
                    <table className="w-full text-xs font-mono tabular-nums border-collapse">
                      <thead>
                        <tr className="border-b border-white/15 text-slate-400 text-left">
                          <th className="py-1.5">Player</th>
                          <th>PTS</th>
                          <th>FG</th>
                          <th>3PT</th>
                          <th>REB</th>
                          <th>AST</th>
                          <th>STL</th>
                          <th>BLK</th>
                          <th>TO</th>
                          <th>PF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grp.rows.map((r) => (
                          <tr key={r.playerId} className="border-b border-white/5">
                            <td className="py-1.5 font-sans font-semibold text-white">
                              #{r.jersey} {r.name}
                            </td>
                            <td className="font-bold text-[#F9A01B]">{r.pts}</td>
                            <td>{r.fgm}-{r.fga}</td>
                            <td>{r.tpm}-{r.tpa}</td>
                            <td>{r.reb}</td>
                            <td>{r.ast}</td>
                            <td>{r.stl}</td>
                            <td>{r.blk}</td>
                            <td>{r.to}</td>
                            <td>{r.pf}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}

            {pauseTab === 'options' && (
              <div className="bg-[#11131b] border border-white/15 p-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase text-[#F9A01B] mb-3">
                  <Settings className="w-4 h-4" /> Live Match Options & Sliders
                </div>
                <OptionsSuiteView settings={settings} onChange={onUpdateSettings} compact />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          POST-GAME SUMMARY, PLAYER OF THE GAME & VC/SP PAYOUT SCREEN
         ==================================================================== */}
      {summary && (
        <div className="fixed inset-0 z-45 bg-[#090a0d]/95 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#11131b] border border-[#CE1141] shadow-2xl overflow-hidden">
            {/* Final Score Header */}
            <div className="bg-gradient-to-r from-[#18070c] via-[#CE1141]/35 to-[#18070c] px-6 py-4 border-b border-white/15 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#F9A01B]">
                  {config.title} · Final
                </div>
                <div className="text-3xl font-black uppercase tracking-tight">
                  {summary.userWon ? 'VICTORY' : 'FINAL BUZZER'}
                </div>
              </div>
              <div className="flex items-center gap-6 font-mono tabular-nums">
                <div className="text-center">
                  <div className="text-xs text-slate-300 uppercase">{hud?.awayCode}</div>
                  <div className="text-4xl font-black">{summary.awayScore}</div>
                </div>
                <span className="text-slate-500 text-xl">—</span>
                <div className="text-center">
                  <div className="text-xs text-slate-300 uppercase">{hud?.homeCode}</div>
                  <div className="text-4xl font-black text-[#F9A01B]">{summary.homeScore}</div>
                </div>
              </div>
            </div>

            {/* Post-Game Tabs */}
            <div className="flex border-b border-white/10 bg-[#0d0f15] px-4">
              {(
                [
                  ['pog', 'Player of the Game'],
                  ['home', `${hud?.homeCode ?? 'Home'} Box`],
                  ['away', `${hud?.awayCode ?? 'Away'} Box`],
                  ['payout', 'VC / SP Payout'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPostTab(id)}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer ${
                    postTab === id ? 'border-[#CE1141] text-white' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 min-h-[260px]">
              {postTab === 'pog' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#171a24] border border-[#F9A01B]/50 p-5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#F9A01B]">
                      <Trophy className="w-4 h-4" /> Jordan Brand Player of the Game
                    </div>
                    <div className="text-2xl font-black uppercase mt-2">
                      #{summary.playerOfGame.jersey} {summary.playerOfGame.name}
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4 font-mono tabular-nums text-center">
                      {[
                        ['PTS', summary.playerOfGame.pts],
                        ['REB', summary.playerOfGame.reb],
                        ['AST', summary.playerOfGame.ast],
                        ['STL', summary.playerOfGame.stl],
                        ['BLK', summary.playerOfGame.blk],
                      ].map(([k, v]) => (
                        <div key={String(k)} className="bg-[#0e1017] border border-white/10 py-2">
                          <div className="text-[10px] text-slate-400">{k}</div>
                          <div className="text-lg font-black text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#171a24] border border-white/15 p-5">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-300 mb-3">
                      Scoring By Quarter
                    </div>
                    <table className="w-full text-xs font-mono tabular-nums">
                      <thead>
                        <tr className="text-slate-400 border-b border-white/10">
                          <th className="text-left py-1">Team</th>
                          <th>Q1</th>
                          <th>Q2</th>
                          <th>Q3</th>
                          <th>Q4</th>
                          <th>TOT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-2 font-sans font-bold">{hud?.awayCode}</td>
                          {summary.quarterScoresAway.map((q, i) => (
                            <td key={i} className="text-center">{q}</td>
                          ))}
                          <td className="text-center font-black">{summary.awayScore}</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-sans font-bold">{hud?.homeCode}</td>
                          {summary.quarterScoresHome.map((q, i) => (
                            <td key={i} className="text-center">{q}</td>
                          ))}
                          <td className="text-center font-black text-[#F9A01B]">{summary.homeScore}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(postTab === 'home' || postTab === 'away') && (
                <table className="w-full text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/15 text-left">
                      <th className="py-1.5">Player</th>
                      <th>PTS</th>
                      <th>FG</th>
                      <th>3PT</th>
                      <th>REB</th>
                      <th>AST</th>
                      <th>STL</th>
                      <th>BLK</th>
                      <th>TO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.boxScore
                      .filter((b) => b.teamSide === postTab)
                      .map((r) => (
                        <tr key={r.playerId} className="border-b border-white/5">
                          <td className="py-1.5 font-sans font-semibold text-white">#{r.jersey} {r.name}</td>
                          <td className="font-bold text-[#F9A01B]">{r.pts}</td>
                          <td>{r.fgm}-{r.fga}</td>
                          <td>{r.tpm}-{r.tpa}</td>
                          <td>{r.reb}</td>
                          <td>{r.ast}</td>
                          <td>{r.stl}</td>
                          <td>{r.blk}</td>
                          <td>{r.to}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {postTab === 'payout' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div className="p-4 bg-[#171a24] border border-[#F9A01B]/50">
                    <div className="text-[10px] uppercase text-slate-400 font-sans">VC Earned</div>
                    <div className="text-2xl font-black text-[#F9A01B] mt-1">+{summary.vcEarned}</div>
                  </div>
                  <div className="p-4 bg-[#171a24] border border-white/15">
                    <div className="text-[10px] uppercase text-slate-400 font-sans">Skill Points (SP)</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">+{summary.spEarned}</div>
                  </div>
                  <div className="p-4 bg-[#171a24] border border-white/15">
                    <div className="text-[10px] uppercase text-slate-400 font-sans">Teammate Grade</div>
                    <div className="text-2xl font-black text-white mt-1">{summary.teammateGrade}</div>
                  </div>
                  <div className="p-4 bg-[#171a24] border border-white/15">
                    <div className="text-[10px] uppercase text-slate-400 font-sans">MyTEAM MT / REP</div>
                    <div className="text-2xl font-black text-sky-400 mt-1">+{summary.mtEarned} / +{summary.repEarned}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#0d0f15] border-t border-white/15 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 bg-[#1c202c] hover:bg-[#272c3c] border border-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rematch
              </button>
              <button
                type="button"
                onClick={onQuitToMenu}
                className="px-5 py-2 bg-[#CE1141] hover:bg-rose-600 border border-[#F9A01B] text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Continue to 2K14 Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
