import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Disc3,
  LogOut,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { NBA_TODAY_MATCHUPS } from '../data/modesData';
import { getTeamById } from '../data/rosters';
import { SpotlightStageController, type SpotlightCameraPreset } from '../engine/SpotlightStage';
import {
  applyMatchResultToSave,
  getResolvedTeams,
  loadNba2k14Save,
  persistNba2k14Save,
} from '../storage';
import type { MatchConfig, MatchResultSummary, Nba2k14SaveData } from '../types';
import { FeaturesView } from './FeaturesView';
import { GameModesHubView } from './GameModesHubView';
import { MatchPlayView } from './MatchPlayView';
import { MyCareerView } from './MyCareerView';
import { OptionsSuiteView } from './OptionsSuiteView';
import { PathToGreatnessView } from './PathToGreatnessView';
import { QuickGameView } from './QuickGameView';
import { TheParkView } from './TheParkView';
import { VipNavDrawer } from './VipNavDrawer';

interface Nba2k14ExperienceShellProps {
  onExitToArcade: () => void;
}

type LobbyTab = 'main' | 'quick' | 'path' | 'mycareer' | 'park' | 'modes' | 'features' | 'options';

const DOCK_TABS: { id: LobbyTab | 'nav'; label: string }[] = [
  { id: 'quick', label: 'QUICK GAME' },
  { id: 'path', label: 'PATH TO GREATNESS' },
  { id: 'mycareer', label: 'MyCAREER' },
  { id: 'park', label: 'THE PARK' },
  { id: 'modes', label: 'GAME MODES' },
  { id: 'nav', label: '2K NAV' },
  { id: 'features', label: 'FEATURES' },
  { id: 'options', label: 'OPTIONS' },
];

const TAB_LABELS: Record<LobbyTab, string> = {
  main: 'MAIN MENU',
  quick: 'QUICK GAME',
  path: 'LEBRON: PATH TO GREATNESS',
  mycareer: 'MyCAREER',
  park: 'THE PARK',
  modes: 'GAME MODES',
  features: 'FEATURES',
  options: 'OPTIONS & SLIDERS',
};

export const Nba2k14ExperienceShell: React.FC<Nba2k14ExperienceShellProps> = ({ onExitToArcade }) => {
  const [save, setSave] = useState<Nba2k14SaveData>(() => loadNba2k14Save());
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState<LobbyTab>('main');
  const [vipDrawerOpen, setVipDrawerOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState<MatchConfig | null>(null);
  const [nbaTodayIdx, setNbaTodayIdx] = useState(0);
  const [audioTick, setAudioTick] = useState(0);
  const [eqBars, setEqBars] = useState<number[]>(() => Array(12).fill(0.18));

  const stageHostRef = useRef<HTMLDivElement | null>(null);
  const stageCtrlRef = useRef<SpotlightStageController | null>(null);

  const resolvedTeams = useMemo(() => getResolvedTeams(save), [save]);
  const currentMatchup = NBA_TODAY_MATCHUPS[nbaTodayIdx % NBA_TODAY_MATCHUPS.length];
  const todayAway = getTeamById(currentMatchup.awayId);
  const todayHome = getTeamById(currentMatchup.homeId);

  const updateSave = useCallback((updater: (prev: Nba2k14SaveData) => Nba2k14SaveData) => {
    setSave((prev) => {
      const next = updater(prev);
      persistNba2k14Save(next);
      return next;
    });
  }, []);

  // Sync Web Audio settings & subscribe to track updates
  useEffect(() => {
    Nba2k14Audio.syncSettings(save.settings.audio, save.settings.jukeboxDisabledTrackIds);
  }, [save.settings.audio, save.settings.jukeboxDisabledTrackIds]);

  useEffect(() => {
    const unsub = Nba2k14Audio.subscribe(() => setAudioTick((t) => t + 1));
    const eqInterval = setInterval(() => {
      setEqBars([...Nba2k14Audio.getEqBars()]);
    }, 110);
    return () => {
      unsub();
      clearInterval(eqInterval);
    };
  }, []);

  // Stop 2K Beats on unmount back to arcade
  useEffect(() => {
    return () => {
      Nba2k14Audio.stopBeats();
    };
  }, []);

  // Persistent 3D Arena Spotlight Stage behind Title Screen & Main Menu
  useEffect(() => {
    if (activeMatch) {
      stageCtrlRef.current?.dispose();
      stageCtrlRef.current = null;
      return;
    }
    const host = stageHostRef.current;
    if (!host) return;
    const heat = getTeamById('mia');
    const lebron = heat.players.find((p) => p.name.includes('LeBron')) ?? heat.players[0];
    const ctrl = new SpotlightStageController(host, lebron, heat);
    stageCtrlRef.current = ctrl;
    return () => {
      ctrl.dispose();
      stageCtrlRef.current = null;
    };
  }, [activeMatch]);

  // React camera preset & featured star to active tab
  useEffect(() => {
    const ctrl = stageCtrlRef.current;
    if (!ctrl) return;
    const preset: SpotlightCameraPreset = !entered ? 'title' : activeTab;
    ctrl.setCameraPreset(preset);
    if (entered && (activeTab === 'mycareer' || activeTab === 'park') && save.myCareer.created) {
      ctrl.setFeaturedPlayer(save.myCareer.player, getTeamById(save.myCareer.teamId));
    } else {
      const heat = getTeamById('mia');
      const lebron = heat.players.find((p) => p.name.includes('LeBron')) ?? heat.players[0];
      ctrl.setFeaturedPlayer(lebron, heat);
    }
  }, [entered, activeTab, save.myCareer.created, save.myCareer.player, save.myCareer.teamId]);

  const enterFromTitle = useCallback(() => {
    if (entered) return;
    Nba2k14Audio.unlock();
    Nba2k14Audio.playUiClick('select');
    Nba2k14Audio.startBeats();
    setEntered(true);
  }, [entered]);

  // Global keyboard shortcuts (Enter to enter from title, Tab/Y for 2K Nav, M to skip 2K Beats, Esc to go back)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeMatch) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (!entered) {
        if (e.code === 'Escape') return;
        enterFromTitle();
        return;
      }

      if (e.code === 'Tab' || e.code === 'KeyY') {
        e.preventDefault();
        Nba2k14Audio.playUiClick('select');
        setVipDrawerOpen((v) => !v);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        Nba2k14Audio.nextTrack();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        setActiveTab('options');
      } else if (e.code === 'Escape') {
        if (vipDrawerOpen) {
          setVipDrawerOpen(false);
        } else if (activeTab !== 'main') {
          Nba2k14Audio.playUiClick('back');
          setActiveTab('main');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeMatch, entered, enterFromTitle, vipDrawerOpen, activeTab]);

  const handleStartMatch = useCallback((cfg: MatchConfig) => {
    Nba2k14Audio.stopBeats();
    setVipDrawerOpen(false);
    setActiveMatch(cfg);
  }, []);

  const handleFinishMatch = useCallback(
    (summary: MatchResultSummary) => {
      updateSave((prev) => {
        const { nextSave } = applyMatchResultToSave(prev, summary);
        // Update Playoff Series if applicable
        if (summary.config.mode === 'playoffs' && summary.config.playoffSeriesId) {
          const needed = Math.ceil(nextSave.playoffs.bestOf / 2);
          const updatedSeries = nextSave.playoffs.series.map((s) => {
            if (s.id !== summary.config.playoffSeriesId || s.winnerId) return s;
            const homeWon = summary.homeScore >= summary.awayScore;
            const hw = s.higherWins + (homeWon ? 1 : 0);
            const lw = s.lowerWins + (homeWon ? 0 : 1);
            const winnerId = hw >= needed ? s.higherSeedId : lw >= needed ? s.lowerSeedId : null;
            return { ...s, higherWins: hw, lowerWins: lw, winnerId };
          });
          return {
            ...nextSave,
            playoffs: {
              ...nextSave.playoffs,
              series: updatedSeries,
            },
          };
        }
        return nextSave;
      });
    },
    [updateSave]
  );

  const handleQuitMatch = useCallback(() => {
    setActiveMatch(null);
    Nba2k14Audio.startBeats();
  }, []);

  const currentTrack = useMemo(() => {
    void audioTick;
    return Nba2k14Audio.getCurrentTrack();
  }, [audioTick]);
  const beatsPlaying = useMemo(() => {
    void audioTick;
    return Nba2k14Audio.isBeatsPlaying();
  }, [audioTick]);

  // Live 3D Match Viewport
  if (activeMatch) {
    return (
      <div className="nba2k14-shell fixed inset-0 z-50 bg-[#090a0d] text-white overflow-hidden">
        <MatchPlayView
          config={activeMatch}
          settings={save.settings}
          onUpdateSettings={(nextSettings) =>
            updateSave((prev) => ({ ...prev, settings: nextSettings }))
          }
          onFinishMatch={handleFinishMatch}
          onQuitToMenu={handleQuitMatch}
        />
      </div>
    );
  }

  return (
    <div className="nba2k14-shell fixed inset-0 z-50 bg-[#090a0d] text-white overflow-hidden select-none font-sans">
      {/* Persistent Live 3D Arena Spotlight Stage */}
      <div ref={stageHostRef} className="absolute inset-0 z-0" />

      {/* Subtle Vignette Readability Layer (No backdrop-blur over WebGL) */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,10,13,0.78) 0%, rgba(9,10,13,0.18) 28%, rgba(9,10,13,0.22) 68%, rgba(9,10,13,0.92) 100%)',
        }}
      />

      {/* ==================== SCREEN 1: TITLE / PRESS START ==================== */}
      {!entered ? (
        <div
          onClick={enterFromTitle}
          className="relative z-20 h-full w-full flex flex-col justify-between p-6 sm:p-10 cursor-pointer"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black tracking-[0.26em] text-[#F9A01B] uppercase">
              <Crown className="w-4 h-4" /> KING JAMES ERA · 2013–14 EDITION
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                Nba2k14Audio.stopBeats();
                onExitToArcade();
              }}
              className="px-3.5 py-2 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#CE1141] text-xs font-bold uppercase text-zinc-200 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit to Arcade
            </button>
          </div>

          {/* Center-Left Iconic NBA 2K14 Metallic Emblem */}
          <div className="max-w-xl">
            <div className="inline-block px-3 py-1 rounded bg-[#CE1141] text-white text-[11px] font-black tracking-[0.28em] uppercase mb-3">
              2K SPORTS · OFFICIAL 3D SIMULATION
            </div>
            <h1 className="text-6xl sm:text-7xl font-black italic tracking-tighter leading-none text-white drop-shadow-[0_6px_28px_rgba(206,17,65,0.45)]">
              NBA <span className="text-[#CE1141]">2K</span>
              <span className="text-[#F9A01B]">14</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-zinc-300 font-semibold max-w-md">
              50 Authentic Teams · 38 Signature Skills · Pro Stick IsoMotion · Path to Greatness · MyCAREER · The Park
            </p>

            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[#0f1116]/92 border-2 border-[#F9A01B] shadow-[0_0_30px_rgba(249,160,27,0.25)]">
              <Play className="w-5 h-5 text-[#F9A01B] fill-[#F9A01B]" />
              <span className="text-sm sm:text-base font-black tracking-[0.22em] text-white uppercase">
                PRESS START · CLICK OR PRESS ANY KEY
              </span>
            </div>
          </div>

          {/* Bottom-Left 2K Beats Preview */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="bg-[#0f1116]/92 border border-white/15 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <Disc3 className="w-5 h-5 text-[#F9A01B]" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F9A01B]">
                  2K BEATS · CURATED BY LEBRON JAMES
                </div>
                <div className="text-xs font-bold text-white">{currentTrack.title}</div>
              </div>
            </div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
              WebGL 3D Hardwood · Keyboard + Gamepad + Touch Ready
            </div>
          </div>
        </div>
      ) : (
        /* ==================== SCREEN 2: EXACT MAIN MENU LOBBY ==================== */
        <div className="relative z-20 h-full w-full flex flex-col justify-between">
          {/* TOP ANCHOR BAR */}
          <header className="px-5 pt-3.5 pb-2 flex items-center justify-between gap-3">
            {/* Top-Left: Metallic NBA 2K14 Logo + Breadcrumb + Exit */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  Nba2k14Audio.playUiClick('back');
                  setActiveTab('main');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#F9A01B] transition cursor-pointer"
              >
                <span className="text-xl font-black italic tracking-tighter text-white leading-none">
                  NBA <span className="text-[#CE1141]">2K</span>
                  <span className="text-[#F9A01B]">14</span>
                </span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-300 bg-[#0f1116]/88 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="text-[#F9A01B]">HOME</span>
                {activeTab !== 'main' && (
                  <>
                    <span className="text-zinc-600">/</span>
                    <span className="text-white">{TAB_LABELS[activeTab]}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  Nba2k14Audio.stopBeats();
                  onExitToArcade();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#0f1116]/92 border border-white/15 hover:border-[#CE1141] text-[11px] font-black uppercase text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Arcade
              </button>
            </div>

            {/* Top-Right: VIP Profile & Currency Pill */}
            <button
              onClick={() => {
                Nba2k14Audio.playUiClick('select');
                setVipDrawerOpen(true);
              }}
              className="bg-[#0f1116]/94 border border-white/20 hover:border-[#F9A01B] rounded-xl px-3.5 py-2 flex items-center gap-3 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#CE1141] border border-[#F9A01B] flex items-center justify-center text-[11px] font-black text-white">
                {save.vip.avatarCrest}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-black text-white uppercase">{save.vip.name}</div>
                <div className="text-[10px] font-bold text-zinc-400">
                  {save.vip.wins}W-{save.vip.losses}L · {save.vip.unlockedAchievements.length}/25 Trophies
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-white/15 text-xs font-black">
                <span className="text-[#F9A01B]">{save.vip.vc.toLocaleString()} VC</span>
                <span className="text-cyan-300">{save.vip.sp.toLocaleString()} SP</span>
              </div>
            </button>
          </header>

          {/* CENTER STAGE CONTENT */}
          <main className="flex-1 min-h-0 overflow-hidden">
            {activeTab === 'main' && (
              <div className="h-full px-6 py-4 flex flex-col justify-between">
                <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-6">
                  {/* Mid-Left: NBA TODAY Marquee Card */}
                  <div className="w-full max-w-sm bg-[#0f1116]/92 border border-white/15 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]">
                        NBA TODAY · {currentMatchup.label}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setNbaTodayIdx((i) => (i - 1 + NBA_TODAY_MATCHUPS.length) % NBA_TODAY_MATCHUPS.length)
                          }
                          className="p-1 rounded bg-[#1a1e28] hover:bg-[#272d3c] text-zinc-300 cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setNbaTodayIdx((i) => (i + 1) % NBA_TODAY_MATCHUPS.length)}
                          className="p-1 rounded bg-[#1a1e28] hover:bg-[#272d3c] text-zinc-300 cursor-pointer"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#151820] border border-white/10 rounded-lg p-3.5 flex items-center justify-between">
                      <div className="text-center">
                        <div
                          style={{ backgroundColor: todayAway.primaryColor }}
                          className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center font-black text-sm text-white border border-white/20"
                        >
                          {todayAway.code}
                        </div>
                        <div className="text-xs font-black text-white mt-1.5">{todayAway.name}</div>
                        <div className="text-[10px] text-zinc-400">OVR {todayAway.ovr}</div>
                      </div>

                      <div className="text-center px-2">
                        <div className="text-xs font-black text-[#CE1141]">AT</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{currentMatchup.tipTime}</div>
                      </div>

                      <div className="text-center">
                        <div
                          style={{ backgroundColor: todayHome.primaryColor }}
                          className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center font-black text-sm text-white border border-white/20"
                        >
                          {todayHome.code}
                        </div>
                        <div className="text-xs font-black text-white mt-1.5">{todayHome.name}</div>
                        <div className="text-[10px] text-zinc-400">OVR {todayHome.ovr}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-2 text-center">{currentMatchup.arena}</div>

                    <button
                      onClick={() => {
                        Nba2k14Audio.playUiClick('select');
                        handleStartMatch({
                          mode: 'quick',
                          title: `NBA TODAY · ${todayAway.code} @ ${todayHome.code}`,
                          subtitle: currentMatchup.arena,
                          homeTeamId: todayHome.id,
                          awayTeamId: todayAway.id,
                          userSide: 'home',
                          courtEnv: 'nba',
                          quarterLengthMin: save.settings.game.quarterLengthMin,
                          playersPerSide: 5,
                        });
                      }}
                      className="mt-3 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Play NBA Today Matchup
                    </button>
                  </div>

                  {/* Center Transparent Space for Live 3D LeBron James Spotlight */}
                  <div className="hidden lg:block flex-1" />

                  {/* Mid-Right: QUICK CONTINUE Tile */}
                  <div className="w-full max-w-sm bg-[#0f1116]/92 border border-white/15 rounded-xl p-4 shadow-2xl space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]">
                      QUICK CONTINUE
                    </div>
                    <div className="bg-[#151820] border border-white/10 rounded-lg p-3.5">
                      <div className="text-xs font-black text-white uppercase">
                        {save.lastMode === 'mycareer'
                          ? `MyCAREER · ${save.myCareer.player.name} (${save.myCareer.player.ovr} OVR)`
                          : save.lastMode === 'path'
                            ? 'LeBron: Path to Greatness'
                            : save.lastMode === 'association'
                              ? `The Association · Day ${save.association.currentDay}`
                              : 'NBA 2K14 Quick Game (50 Teams)'}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        {save.lastMode === 'mycareer'
                          ? `Record ${save.myCareer.wins}-${save.myCareer.losses} · Continue your Rookie Season.`
                          : save.lastMode === 'path'
                            ? `Earned ${Object.values(save.pathToGreatness.completedStars).reduce((a, b) => a + b, 0)} / 39 Championship Stars.`
                            : save.lastMode === 'association'
                              ? 'Jump straight back into Front Office GM decisions & games.'
                              : 'Pick any NBA, Euroleague, Classic, or All-Star squad.'}
                      </p>
                      <button
                        onClick={() => {
                          Nba2k14Audio.playUiClick('select');
                          setActiveTab(
                            save.lastMode === 'association' ? 'modes' : save.lastMode
                          );
                        }}
                        className="mt-3 w-full py-2 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Resume Mode
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          Nba2k14Audio.playUiClick('select');
                          setActiveTab('path');
                        }}
                        className="p-2.5 rounded-lg bg-[#151820] hover:bg-[#1e222e] border border-white/10 text-left cursor-pointer"
                      >
                        <div className="text-[10px] font-black text-[#F9A01B] uppercase">Path to Greatness</div>
                        <div className="text-xs font-bold text-white mt-0.5">13 LeBron Chapters</div>
                      </button>
                      <button
                        onClick={() => {
                          Nba2k14Audio.playUiClick('select');
                          setActiveTab('park');
                        }}
                        className="p-2.5 rounded-lg bg-[#151820] hover:bg-[#1e222e] border border-white/10 text-left cursor-pointer"
                      >
                        <div className="text-[10px] font-black text-[#CE1141] uppercase">The Park</div>
                        <div className="text-xs font-bold text-white mt-0.5">6 Streetball Courts</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lower-Left Persistent 2K Beats Music Ticker */}
                <div className="flex items-end justify-between mt-3">
                  <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-xl">
                    <div className="flex items-end gap-[2px] h-5 w-10">
                      {eqBars.slice(0, 8).map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${Math.max(15, Math.round(h * 100))}%` }}
                          className="flex-1 bg-gradient-to-t from-[#CE1141] to-[#F9A01B] rounded-t-sm transition-all duration-100"
                        />
                      ))}
                    </div>
                    <div className="min-w-0 max-w-[220px]">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F9A01B]">
                        2K BEATS · NOW PLAYING
                      </div>
                      <div className="text-xs font-bold text-white truncate">{currentTrack.title}</div>
                    </div>
                    <div className="flex items-center gap-1 pl-2 border-l border-white/10">
                      <button
                        onClick={() => Nba2k14Audio.toggleBeats()}
                        className="p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer"
                        title="Play / Pause 2K Beats"
                      >
                        {beatsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => Nba2k14Audio.nextTrack()}
                        className="p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer"
                        title="Next Track (M)"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          updateSave((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              audio: { ...prev.settings.audio, muted: !prev.settings.audio.muted },
                            },
                          }))
                        }
                        className="p-1.5 rounded bg-[#181c26] hover:bg-[#252b3a] text-white cursor-pointer"
                        title="Mute Audio"
                      >
                        {save.settings.audio.muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'quick' && (
              <QuickGameView
                teams={resolvedTeams}
                settings={save.settings}
                onUpdateSettings={(nextSettings) =>
                  updateSave((prev) => ({ ...prev, settings: nextSettings }))
                }
                onStartMatch={handleStartMatch}
                onBack={() => setActiveTab('main')}
              />
            )}

            {activeTab === 'path' && (
              <PathToGreatnessView
                state={save.pathToGreatness}
                onSelectPath={(selectedPath) =>
                  updateSave((prev) => ({
                    ...prev,
                    pathToGreatness: { ...prev.pathToGreatness, selectedPath },
                  }))
                }
                onLaunchChapter={handleStartMatch}
                onBack={() => setActiveTab('main')}
              />
            )}

            {activeTab === 'mycareer' && (
              <MyCareerView
                save={save}
                onUpdateSave={updateSave}
                onStartMatch={handleStartMatch}
                onOpenOptions={() => setActiveTab('options')}
              />
            )}

            {activeTab === 'park' && (
              <TheParkView save={save} onStartMatch={handleStartMatch} />
            )}

            {activeTab === 'modes' && (
              <GameModesHubView
                save={save}
                onUpdateSave={updateSave}
                onStartMatch={handleStartMatch}
              />
            )}

            {activeTab === 'features' && (
              <FeaturesView save={save} onUpdateSave={updateSave} />
            )}

            {activeTab === 'options' && (
              <OptionsSuiteView
                settings={save.settings}
                onChange={(nextSettings) =>
                  updateSave((prev) => ({ ...prev, settings: nextSettings }))
                }
                onBack={() => setActiveTab('main')}
              />
            )}
          </main>

          {/* BOTTOM HORIZONTAL 8-TAB DOCK + ADAPTIVE CONTROL LEGEND */}
          <footer className="bg-[#0b0d12]/96 border-t border-white/15">
            <nav className="px-4 py-2 flex items-center justify-center gap-1.5 overflow-x-auto">
              {DOCK_TABS.map((item) => {
                const isActive = item.id === activeTab || (item.id === 'nav' && vipDrawerOpen);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      Nba2k14Audio.playUiClick('select');
                      if (item.id === 'nav') {
                        setVipDrawerOpen(true);
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-lg text-[11px] font-black tracking-wider uppercase whitespace-nowrap border transition cursor-pointer ${
                      isActive
                        ? 'bg-[#CE1141] border-[#F9A01B] text-white shadow-[0_0_16px_rgba(206,17,65,0.45)]'
                        : 'bg-[#151820] border-white/10 text-zinc-300 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="px-5 py-1.5 bg-[#07080b] border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Enter: Select · Esc: Back · Tab / Y: 2K Nav VIP · M: Skip 2K Beats · P: Options</span>
              <span className="text-[#F9A01B]">NBA 2K14 · 3D HARDWOOD ENGINE</span>
            </div>
          </footer>
        </div>
      )}

      {/* Slide-Over 2K Nav / VIP Drawer */}
      <VipNavDrawer
        open={vipDrawerOpen}
        save={save}
        onClose={() => setVipDrawerOpen(false)}
        onUpdateSave={updateSave}
      />
    </div>
  );
};
