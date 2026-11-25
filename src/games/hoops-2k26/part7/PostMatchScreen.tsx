// ============================================================================
// PART 7 — POST-MATCH JORDAN / GATORADE MVP CELEBRATION & 3-TAB PROGRESSION
// - Animated confetti burst + Jordan / Gatorade Player of the Game Spotlight
// - Tab 1: Full 12-Column Box Score (Away & Home switcher)
// - Tab 2: Team Comparison Bars + Match Half-Court Shot Chart
// - Tab 3: Animated VC Payout Breakdown + Season / Rep / Badge / Crew XP Bars
//          + Settled Part 6 Mode Unlock Summary
// - Actions: [Rematch] [Instant Replay / Freeze Cam] [Return to The City] [Main Menu]
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import type {
  PlayerBoxScore,
  SimHudSnapshot,
} from '../engine/BasketballSimulation';
import { ACHIEVEMENT_CATALOG, type MatchPayoutBreakdown } from '../hybrid/store';
import type { ShotChartEntry, UIEraMode, UltimateHybridSave } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';
import type { ModeLaunchPayload } from '../modes/modesTypes';
import { ShotChartCanvas } from './ShotChartCanvas';

export interface PostMatchScreenProps {
  hud: SimHudSnapshot;
  awayTeam: TeamData;
  homeTeam: TeamData;
  save: UltimateHybridSave;
  payout: MatchPayoutBreakdown | null;
  modePayload: ModeLaunchPayload | null;
  modeOutcomeSummary: string | null;
  onRematch: () => void;
  onOpenReplay: () => void;
  onReturnToCity: () => void;
  onMainMenu: () => void;
}

type PostTabId = 'BOX_SCORE' | 'COMPARISON' | 'REWARDS';

const CONFETTI_PIECES = Array.from({ length: 24 }, (_, idx) => ({
  id: idx,
  leftPct: (idx * 4.2 + 2) % 98,
  delaySec: ((idx * 17) % 10) * 0.14,
  durationSec: 2.2 + ((idx * 7) % 5) * 0.28,
  color: ['#fbbf24', '#38bdf8', '#22c55e', '#ef4444', '#f8fafc'][idx % 5],
}));

function computeMvpScore(p: PlayerBoxScore): number {
  return (
    p.pts * 1.45 +
    p.reb * 1.15 +
    p.ast * 1.55 +
    p.stl * 2.3 +
    p.blk * 2.3 -
    p.turnovers * 0.9
  );
}

function formatMin(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function computeRowGrade(p: PlayerBoxScore): string {
  const score = computeMvpScore(p);
  if (score >= 34) return 'A+';
  if (score >= 26) return 'A';
  if (score >= 20) return 'A-';
  if (score >= 14) return 'B+';
  if (score >= 9) return 'B';
  if (score >= 5) return 'B-';
  return 'C+';
}

export const PostMatchScreen: React.FC<PostMatchScreenProps> = ({
  hud,
  awayTeam,
  homeTeam,
  save,
  payout,
  modePayload,
  modeOutcomeSummary,
  onRematch,
  onOpenReplay,
  onReturnToCity,
  onMainMenu,
}) => {
  const [tab, setTab] = useState<PostTabId>('BOX_SCORE');
  const [boxSide, setBoxSide] = useState<'HOME' | 'AWAY'>('HOME');
  const [animatedVc, setAnimatedVc] = useState<number>(0);

  const era: UIEraMode = save.uiEraMode;
  const homeRows = useMemo(
    () => hud.boxScore.filter((r) => r.teamSide === 'HOME'),
    [hud.boxScore]
  );
  const awayRows = useMemo(
    () => hud.boxScore.filter((r) => r.teamSide === 'AWAY'),
    [hud.boxScore]
  );

  const userWon =
    hud.winnerSide !== null &&
    (hud.userTeamSide === null ? hud.winnerSide === 'HOME' : hud.winnerSide === hud.userTeamSide);

  const mvpPlayer = useMemo(() => {
    const winningSide = hud.winnerSide ?? (hud.homeScore >= hud.awayScore ? 'HOME' : 'AWAY');
    const pool = winningSide === 'HOME' ? homeRows : awayRows;
    const all = pool.length > 0 ? pool : hud.boxScore;
    let best = all[0] ?? null;
    let bestScore = -999;
    for (let i = 0; i < all.length; i++) {
      const sc = computeMvpScore(all[i]);
      if (sc > bestScore) {
        bestScore = sc;
        best = all[i];
      }
    }
    return best;
  }, [homeRows, awayRows, hud.boxScore, hud.winnerSide, hud.homeScore, hud.awayScore]);

  useEffect(() => {
    const target = payout?.totalVc ?? 450;
    let step = 0;
    const totalSteps = 24;
    const timer = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / totalSteps);
      setAnimatedVc(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (step >= totalSteps) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [payout?.totalVc]);

  const matchShots: ShotChartEntry[] = useMemo(
    () =>
      (hud.matchShots ?? []).map((s, idx) => ({
        id: s.id || `mshot_${idx}`,
        x: s.x,
        y: s.y,
        made: s.made,
        isThree: s.isThree,
        isGreen: s.isGreen,
        era,
        timestamp: Date.now() - idx * 1000,
      })),
    [hud.matchShots, era]
  );

  const sumTeamShooting = (rows: PlayerBoxScore[]) => {
    let fgm = 0;
    let fga = 0;
    let tpm = 0;
    let tpa = 0;
    let ftm = 0;
    let fta = 0;
    let reb = 0;
    let tov = 0;
    for (let i = 0; i < rows.length; i++) {
      fgm += rows[i].fgm;
      fga += rows[i].fga;
      tpm += rows[i].tpm;
      tpa += rows[i].tpa;
      ftm += rows[i].ftm;
      fta += rows[i].fta;
      reb += rows[i].reb;
      tov += rows[i].turnovers;
    }
    return {
      fgPct: fga > 0 ? Math.round((fgm / fga) * 100) : 0,
      tpPct: tpa > 0 ? Math.round((tpm / tpa) * 100) : 0,
      ftPct: fta > 0 ? Math.round((ftm / fta) * 100) : 0,
      fgLabel: `${fgm}/${fga}`,
      tpLabel: `${tpm}/${tpa}`,
      ftLabel: `${ftm}/${fta}`,
      reb,
      tov,
    };
  };

  const awaySum = useMemo(() => sumTeamShooting(awayRows), [awayRows]);
  const homeSum = useMemo(() => sumTeamShooting(homeRows), [homeRows]);
  const comp = hud.teamComparison;

  const comparisonRows = [
    { label: 'FG%', awayVal: awaySum.fgPct, homeVal: homeSum.fgPct, awayTxt: `${awaySum.fgPct}% (${awaySum.fgLabel})`, homeTxt: `${homeSum.fgPct}% (${homeSum.fgLabel})` },
    { label: '3PT%', awayVal: awaySum.tpPct, homeVal: homeSum.tpPct, awayTxt: `${awaySum.tpPct}% (${awaySum.tpLabel})`, homeTxt: `${homeSum.tpPct}% (${homeSum.tpLabel})` },
    { label: 'FT%', awayVal: awaySum.ftPct, homeVal: homeSum.ftPct, awayTxt: `${awaySum.ftPct}% (${awaySum.ftLabel})`, homeTxt: `${homeSum.ftPct}% (${homeSum.ftLabel})` },
    { label: 'Points in Paint', awayVal: comp.awayPaintPts, homeVal: comp.homePaintPts, awayTxt: String(comp.awayPaintPts), homeTxt: String(comp.homePaintPts) },
    { label: 'Fast Break Pts', awayVal: comp.awayFastBreakPts, homeVal: comp.homeFastBreakPts, awayTxt: String(comp.awayFastBreakPts), homeTxt: String(comp.homeFastBreakPts) },
    { label: '2nd Chance Pts', awayVal: comp.awaySecondChancePts, homeVal: comp.homeSecondChancePts, awayTxt: String(comp.awaySecondChancePts), homeTxt: String(comp.homeSecondChancePts) },
    { label: 'Bench Points', awayVal: comp.awayBenchPts, homeVal: comp.homeBenchPts, awayTxt: String(comp.awayBenchPts), homeTxt: String(comp.homeBenchPts) },
    { label: 'Rebounds', awayVal: Math.max(awaySum.reb, comp.awayReb), homeVal: Math.max(homeSum.reb, comp.homeReb), awayTxt: String(Math.max(awaySum.reb, comp.awayReb)), homeTxt: String(Math.max(homeSum.reb, comp.homeReb)) },
    { label: 'Turnovers', awayVal: Math.max(awaySum.tov, comp.awayTurnovers), homeVal: Math.max(homeSum.tov, comp.homeTurnovers), awayTxt: String(Math.max(awaySum.tov, comp.awayTurnovers)), homeTxt: String(Math.max(homeSum.tov, comp.homeTurnovers)) },
  ];

  const activeBoxRows = boxSide === 'HOME' ? homeRows : awayRows;
  const eraClass = era === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';
  const mvpFgPct =
    mvpPlayer && mvpPlayer.fga > 0 ? Math.round((mvpPlayer.fgm / mvpPlayer.fga) * 100) : 0;

  return (
    <div className={`p7-post-overlay ${eraClass}`}>
      {/* Celebratory Buzzer Confetti Layer */}
      <div className="p7-confetti-stage" aria-hidden="true">
        {CONFETTI_PIECES.map((c) => (
          <span
            key={c.id}
            className="p7-confetti-piece"
            style={{
              left: `${c.leftPct}%`,
              backgroundColor: c.color,
              animationDelay: `${c.delaySec}s`,
              animationDuration: `${c.durationSec}s`,
            }}
          />
        ))}
      </div>

      <div className="p7-post-shell">
        {/* Final Score + Jordan / Gatorade MVP Spotlight */}
        <header className="p7-post-hero">
          <div className="p7-post-scoreboard">
            <div className="p7-post-kicker">
              {userWon ? 'Final Buzzer · Victory' : 'Final Buzzer · Complete'}
              {modePayload ? ` · ${modePayload.title}` : ''}
            </div>
            <div className="p7-post-scoreline p7-num">
              <span style={{ color: awayTeam.colors.accent || '#e2e8f0' }}>
                {awayTeam.abbr} {hud.awayScore}
              </span>
              <span className="p7-muted">—</span>
              <span style={{ color: homeTeam.colors.accent || '#38bdf8' }}>
                {hud.homeScore} {homeTeam.abbr}
              </span>
            </div>
          </div>

          {mvpPlayer && (
            <div className="p7-mvp-card">
              <div className="p7-mvp-label">
                {era === '2K14_CLASSIC'
                  ? 'Jordan Brand Player of the Game'
                  : 'Gatorade Player of the Game (MVP)'}
              </div>
              <div className="p7-mvp-name">
                <strong>
                  #{mvpPlayer.jersey} {mvpPlayer.name}
                </strong>
                <span className="p7-muted">
                  {mvpPlayer.position} · {mvpPlayer.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr}
                </span>
              </div>
              <div className="p7-mvp-stats p7-num">
                <span><strong>{mvpPlayer.pts}</strong> PTS</span>
                <span><strong>{mvpPlayer.reb}</strong> REB</span>
                <span><strong>{mvpPlayer.ast}</strong> AST</span>
                <span><strong>{mvpPlayer.stl}</strong> STL</span>
                <span><strong>{mvpPlayer.blk}</strong> BLK</span>
                <span><strong>{mvpFgPct}%</strong> FG</span>
              </div>
            </div>
          )}
        </header>

        {/* 3-Tab Navigation */}
        <nav className="p7-post-tabs" role="tablist">
          {(
            [
              ['BOX_SCORE', '1. Box Score'],
              ['COMPARISON', '2. Team Comparison & Shot Chart'],
              ['REWARDS', '3. Rewards & Progression'],
            ] as Array<[PostTabId, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`p7-tab-btn ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Tab Body */}
        <section className="p7-post-body">
          {/* TAB 1: FULL 12-COLUMN BOX SCORE */}
          {tab === 'BOX_SCORE' && (
            <div className="p7-box-wrap">
              <div className="p7-seg" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className={`p7-seg-btn ${boxSide === 'HOME' ? 'active' : ''}`}
                  onClick={() => setBoxSide('HOME')}
                >
                  {homeTeam.city} {homeTeam.name} ({hud.homeScore})
                </button>
                <button
                  type="button"
                  className={`p7-seg-btn ${boxSide === 'AWAY' ? 'active' : ''}`}
                  onClick={() => setBoxSide('AWAY')}
                >
                  {awayTeam.city} {awayTeam.name} ({hud.awayScore})
                </button>
              </div>
              <div className="p7-table-scroll">
                <table className="p7-box-table p7-num">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>MIN</th>
                      <th>PTS</th>
                      <th>REB</th>
                      <th>AST</th>
                      <th>STL</th>
                      <th>BLK</th>
                      <th>TO</th>
                      <th>FGM-A</th>
                      <th>3PM-A</th>
                      <th>FTM-A</th>
                      <th>+/-</th>
                      <th>GRD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBoxRows.map((row) => (
                      <tr key={row.playerId}>
                        <td className="p7-box-name">
                          #{row.jersey} {row.name}{' '}
                          <span className="p7-muted">{row.position}</span>
                        </td>
                        <td>{formatMin(row.minutesSec)}</td>
                        <td><strong>{row.pts}</strong></td>
                        <td>{row.reb}</td>
                        <td>{row.ast}</td>
                        <td>{row.stl}</td>
                        <td>{row.blk}</td>
                        <td>{row.turnovers}</td>
                        <td>{row.fgm}-{row.fga}</td>
                        <td>{row.tpm}-{row.tpa}</td>
                        <td>{row.ftm}-{row.fta}</td>
                        <td>{row.plusMinus >= 0 ? `+${row.plusMinus}` : row.plusMinus}</td>
                        <td><strong>{computeRowGrade(row)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM COMPARISON + MATCH SHOT CHART */}
          {tab === 'COMPARISON' && (
            <div className="p7-comp-grid">
              <div className="p7-comp-card">
                <div className="p7-comp-head">
                  <strong>{awayTeam.abbr}</strong>
                  <span className="p7-muted">Team Comparison</span>
                  <strong>{homeTeam.abbr}</strong>
                </div>
                {comparisonRows.map((row) => {
                  const total = Math.max(1, row.awayVal + row.homeVal);
                  const awayPct = Math.round((row.awayVal / total) * 100);
                  return (
                    <div key={row.label} className="p7-comp-row">
                      <div className="p7-comp-labels p7-num">
                        <span>{row.awayTxt}</span>
                        <span className="p7-muted">{row.label}</span>
                        <span>{row.homeTxt}</span>
                      </div>
                      <div className="p7-comp-bar">
                        <div
                          className="p7-comp-fill-away"
                          style={{ width: `${awayPct}%` }}
                        />
                        <div
                          className="p7-comp-fill-home"
                          style={{ width: `${100 - awayPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p7-comp-card">
                <ShotChartCanvas
                  shots={matchShots}
                  title="Match Half-Court Shot Chart"
                  compact
                />
              </div>
            </div>
          )}

          {/* TAB 3: REWARDS & PROGRESSION */}
          {tab === 'REWARDS' && (
            <div className="p7-rewards-grid">
              <div className="p7-reward-card">
                <h4>VC Payout Breakdown</h4>
                <div className="p7-vc-total p7-num">+{animatedVc.toLocaleString()} VC</div>
                <div className="p7-vc-rows p7-num">
                  <div><span>Base Game Salary</span><strong>+{payout?.baseVc ?? 350} VC</strong></div>
                  <div><span>Win Bonus</span><strong>+{payout?.winBonusVc ?? 0} VC</strong></div>
                  <div><span>Teammate Grade ({hud.teammateGrade.letter})</span><strong>+{payout?.gradeBonusVc ?? 100} VC</strong></div>
                  <div><span>Green Release Bonus</span><strong>+{payout?.greenBonusVc ?? 0} VC</strong></div>
                  <div><span>Streak Breaker / Win Streak</span><strong>+{payout?.streakBonusVc ?? 0} VC</strong></div>
                  <div><span>MyTEAM Points Earned</span><strong>+{payout?.mtpEarned ?? 250} MTP</strong></div>
                </div>
              </div>

              <div className="p7-reward-card">
                <h4>Season, Rep, Badge &amp; Crew Progression</h4>
                <div className="p7-xp-block">
                  <div className="p7-xp-head p7-num">
                    <span>Season Level {save.currencies.seasonLevel} / 40</span>
                    <strong>+{payout?.seasonXpEarned ?? 320} XP</strong>
                  </div>
                  <div className="p7-xp-bar">
                    <div
                      className="p7-xp-fill cyan"
                      style={{ width: `${Math.min(100, (save.currencies.seasonXP % 500) / 5)}%` }}
                    />
                  </div>
                </div>

                <div className="p7-xp-block">
                  <div className="p7-xp-head p7-num">
                    <span>Rep Tier · {save.currencies.repTier}</span>
                    <strong>+{payout?.repXpEarned ?? 260} REP</strong>
                  </div>
                  <div className="p7-xp-bar">
                    <div
                      className="p7-xp-fill gold"
                      style={{ width: `${Math.min(100, (save.currencies.repXP % 1000) / 10)}%` }}
                    />
                  </div>
                </div>

                <div className="p7-xp-block">
                  <div className="p7-xp-head p7-num">
                    <span>Crew · {save.currencies.crewName} (Lv. {save.currencies.crewLevel})</span>
                    <strong>+120 Crew XP</strong>
                  </div>
                  <div className="p7-xp-bar">
                    <div className="p7-xp-fill green" style={{ width: '74%' }} />
                  </div>
                </div>

                {modeOutcomeSummary && (
                  <div className="p7-mode-unlock-box">
                    <strong>Mode Progress Settled</strong>
                    <p>{modeOutcomeSummary}</p>
                  </div>
                )}

                {payout && payout.newlyUnlockedAchievements.length > 0 && (
                  <div className="p7-mode-unlock-box">
                    <strong>Trophies Unlocked</strong>
                    <p>
                      {payout.newlyUnlockedAchievements
                        .map((id) => ACHIEVEMENT_CATALOG.find((a) => a.id === id)?.title ?? id)
                        .join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <footer className="p7-post-footer">
          <button type="button" className="p7-btn primary" onClick={onRematch}>
            Rematch
          </button>
          <button type="button" className="p7-btn accent" onClick={onOpenReplay}>
            Instant Replay / Freeze Cam
          </button>
          <button type="button" className="p7-btn" onClick={onReturnToCity}>
            Return to The City
          </button>
          <button type="button" className="p7-btn" onClick={onMainMenu}>
            Main Menu
          </button>
        </footer>
      </div>
    </div>
  );
};
