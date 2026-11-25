// ============================================================================
// PART 6 — NBA 2K14 SIGNATURE MODE: LeBRON: PATH TO GREATNESS
// Crimson-and-gold 2K14 presentation with Branch 1 (Heat Dynasty) & Branch 2
// (Fantastic Journey), launching live 3D mid-game scenarios with real-time
// HUD objective tracking, Star Ratings (1-3★), Trophies, and massive VC!
// ============================================================================

import React, { useMemo, useState } from 'react';
import { RosterStore } from '../hybrid/rosterStore';
import { useUltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { UIEraMode } from '../hybrid/types';
import { ModesStore, useModesStore } from './modesStore';
import {
  PTG_SCENARIOS,
  type PtgBranchId,
  type PtgScenarioDef,
} from './modesTypes';
import './modesHud.css';

export interface PathToGreatnessProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const PathToGreatness: React.FC<PathToGreatnessProps> = ({
  eraMode,
  onBack,
  onNotify,
}) => {
  const hybridSave = useUltimateHybridStore();
  const modes = useModesStore();
  const [branch, setBranch] = useState<PtgBranchId>('HEAT_DYNASTY');

  const scenarios = useMemo(
    () => PTG_SCENARIOS.filter((s) => s.branch === branch),
    [branch]
  );

  const totalStars = useMemo(
    () =>
      PTG_SCENARIOS.reduce(
        (sum, sc) => sum + (modes.ptgProgress[sc.id]?.stars ?? 0),
        0
      ),
    [modes.ptgProgress]
  );
  const trophiesCount = useMemo(
    () =>
      PTG_SCENARIOS.filter((sc) => modes.ptgProgress[sc.id]?.trophyUnlocked).length,
    [modes.ptgProgress]
  );

  const launchScenario = (sc: PtgScenarioDef) => {
    HybridAudioEngine.playUi('confirm', '2K14_CLASSIC');
    // For Fantastic Journey (Cleveland/NY), ensure 2014 LeBron James leads the home lineup!
    const mia14 = RosterStore.getTeamById('2k14_mia');
    const lebron14 =
      mia14.roster.find((p) => p.name.toLowerCase().includes('lebron')) ?? mia14.roster[0];
    const homeTeam = RosterStore.getTeamById(sc.homeTeamId);
    const hasLeBron = homeTeam.roster.some((p) => p.name.toLowerCase().includes('lebron'));
    const customHomeRoster = hasLeBron
      ? undefined
      : [
          { ...lebron14, id: `ptg_lbj_${sc.id}` },
          ...homeTeam.roster.slice(0, 7),
        ];

    onNotify(`Launching ${sc.title} — ${sc.objectiveSummary}`);
    ModesStore.launchModeMatch({
      kind: 'PATH_TO_GREATNESS',
      title: `Path to Greatness · ${sc.title}`,
      subtitle: sc.subtitle,
      returnScreen: 'PATH_TO_GREATNESS',
      matchPatch: {
        awayTeamId: sc.awayTeamId,
        homeTeamId: sc.homeTeamId,
        venue: sc.venue,
        quarterLengthMin: 5,
        difficulty: sc.difficulty,
        sideControl: sc.userSide,
        playersPerSide: 5,
        targetScore: null,
        modeLabel: `2K14 Path to Greatness: ${sc.title}`,
      },
      startQuarter: sc.startQuarter,
      startClockSec: sc.startClockSec,
      startHomeScore: sc.startHomeScore,
      startAwayScore: sc.startAwayScore,
      customHomeRoster,
      objectiveBanner: sc.objectiveSummary,
      starPlayerTargetName: sc.starPlayerName,
      targetStarPts: sc.targetStarPts,
      targetStarAst: sc.targetStarAst,
      ptgScenarioId: sc.id,
      baseVcReward: sc.vcReward,
      baseRepReward: 550,
    });
  };

  return (
    <div className="h2k-mode-root ptg-theme">
      <header className="h2k-mode-topbar ptg-bar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title" style={{ color: '#fcd34d' }}>
              NBA 2K14 · LeBRON: PATH TO GREATNESS
            </h2>
            <div className="h2k-mode-submeta">
              Crimson &amp; Gold Dynasty Campaign · Stars {totalStars}/18 ★ · Trophies {trophiesCount}/6 🏆
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <span className="h2k-wallet-vc h2k-tabular" style={{ fontWeight: 700, fontSize: 13 }}>
            VC {hybridSave.currencies.vc.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="h2k-mode-tabs" style={{ background: 'rgba(22, 6, 12, 0.96)' }}>
        <button
          type="button"
          className={`h2k-mode-tab ${branch === 'HEAT_DYNASTY' ? 'active' : ''}`}
          onClick={() => {
            HybridAudioEngine.playUi('switch', eraMode);
            setBranch('HEAT_DYNASTY');
          }}
        >
          🔥 Branch 1: HEAT DYNASTY (3 Scenarios)
        </button>
        <button
          type="button"
          className={`h2k-mode-tab ${branch === 'FANTASTIC_JOURNEY' ? 'active' : ''}`}
          onClick={() => {
            HybridAudioEngine.playUi('switch', eraMode);
            setBranch('FANTASTIC_JOURNEY');
          }}
        >
          👑 Branch 2: FANTASTIC JOURNEY (3 Scenarios)
        </button>
      </div>

      <div className="h2k-mode-scroll">
        <div className="h2k-card ptg-card" style={{ marginBottom: 18 }}>
          <div className="h2k-section-head">
            <h3 style={{ color: '#fcd34d' }}>
              {branch === 'HEAT_DYNASTY'
                ? 'Branch 1: Heat Dynasty — Cement Miami as the Greatest Trio Ever'
                : 'Branch 2: Fantastic Journey — Rewrite History Across Cleveland, New York & 2026'}
            </h3>
            <span className="h2k-tabular" style={{ fontSize: 12, color: '#fb7185' }}>
              Mid-Game 3D Scenarios · Live HUD Objectives
            </span>
          </div>
          <p className="h2k-muted" style={{ margin: 0 }}>
            Every chapter drops you directly into the 4th quarter crunch-time situation on the 3D court with real-time LeBron stat tracking.
            Win for 1★, hit LeBron's Points Target + Win for 2★ &amp; the Trophy, and add the Assist Target for 3★ Max VC!
          </p>
        </div>

        <div className="h2k-grid-3">
          {scenarios.map((sc) => {
            const prog = modes.ptgProgress[sc.id] ?? {
              completed: false,
              stars: 0,
              bestMargin: 0,
              trophyUnlocked: false,
            };
            const home = RosterStore.getTeamById(sc.homeTeamId);
            const away = RosterStore.getTeamById(sc.awayTeamId);
            return (
              <article
                key={sc.id}
                className="h2k-card ptg-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fb7185' }}>
                      CHAPTER {sc.order} · {sc.difficulty.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 14, color: '#fbbf24' }}>
                      {'★'.repeat(prog.stars)}
                      {'☆'.repeat(3 - prog.stars)}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: '0 0 4px',
                      fontFamily: 'Oswald, sans-serif',
                      fontSize: 22,
                      color: '#fef3c7',
                    }}
                  >
                    {sc.title}
                  </h3>
                  <div className="h2k-muted" style={{ marginBottom: 10 }}>
                    {sc.subtitle}
                  </div>

                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: 'rgba(12, 5, 9, 0.78)',
                      border: '1px solid rgba(245, 158, 11, 0.22)',
                      marginBottom: 10,
                      fontSize: 12,
                    }}
                    className="h2k-tabular"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong>
                        {away.abbr} {sc.startAwayScore} – {home.abbr} {sc.startHomeScore}
                      </strong>
                      <span style={{ color: '#fbbf24' }}>
                        Q{sc.startQuarter} · {formatClock(sc.startClockSec)}
                      </span>
                    </div>
                    <div className="h2k-muted">{sc.objectiveSummary}</div>
                  </div>

                  <div style={{ fontSize: 12, color: '#cbd5e1' }} className="h2k-tabular">
                    <div>
                      Reward: <strong style={{ color: '#fbbf24' }}>+{sc.vcReward.toLocaleString()} VC</strong>
                    </div>
                    <div style={{ color: prog.trophyUnlocked ? '#4ade80' : '#94a3b8' }}>
                      Trophy: {prog.trophyUnlocked ? `🏆 ${sc.trophyName} (Unlocked)` : sc.trophyName}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="h2k-mode-btn crimson"
                  style={{ width: '100%' }}
                  onClick={() => launchScenario(sc)}
                >
                  {prog.completed ? 'Replay Scenario in 3D' : 'Launch Crunch-Time 3D Scenario'}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
