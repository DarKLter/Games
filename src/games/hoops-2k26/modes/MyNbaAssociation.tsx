// ============================================================================
// PART 6 — THE ASSOCIATION / MyNBA ERAS
// Features:
// - Choose Era (2014 LeBron Era or 2026 Modern Era) & pick Franchise
// - Interactive 16-Team NBA Playoff Bracket + Conference Standings
// - OVR-Weighted Simulate Game / Simulate Round engine + [PLAY GAME] 3D Launch
// - Trade Machine with live AI Trade Approval Meter (0-100%)
// - Era League Leaders Table
// ============================================================================

import React, { useMemo, useState } from 'react';
import { RosterStore, useRosterStore } from '../hybrid/rosterStore';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { UIEraMode } from '../hybrid/types';
import {
  evaluateAiTradeApproval,
  ModesStore,
  useModesStore,
} from './modesStore';
import type { MyNbaEraId, PlayoffSeries } from './modesTypes';
import './modesHud.css';

export interface MyNbaAssociationProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

type MyNbaTab = 'BRACKET' | 'STANDINGS' | 'TRADE_MACHINE' | 'LEADERS';

export const MyNbaAssociation: React.FC<MyNbaAssociationProps> = ({
  eraMode,
  onBack,
  onNotify,
}) => {
  const modes = useModesStore();
  const rosterSnap = useRosterStore();
  const nba = modes.myNba;

  const [tab, setTab] = useState<MyNbaTab>('BRACKET');
  const [partnerTeamId, setPartnerTeamId] = useState<string>('');
  const [userTradePlayerId, setUserTradePlayerId] = useState<string>('');
  const [partnerTradePlayerId, setPartnerTradePlayerId] = useState<string>('');

  const eraTeams = useMemo(() => {
    const key = nba.era === 'ERA_2014' ? '2K14' : '2K26';
    return rosterSnap.teams.filter((t) => t.era === key);
  }, [nba.era, rosterSnap.teams]);

  const userTeam = useMemo(
    () => RosterStore.getTeamById(nba.userTeamId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nba.userTeamId, rosterSnap.revision]
  );

  const effectivePartnerTeam = useMemo(() => {
    const found = eraTeams.find((t) => t.id === partnerTeamId && t.id !== userTeam.id);
    return found ?? eraTeams.find((t) => t.id !== userTeam.id) ?? eraTeams[0];
  }, [eraTeams, partnerTeamId, userTeam.id]);

  const selectedOutPlayer =
    userTeam.roster.find((p) => p.id === userTradePlayerId) ?? userTeam.roster[0];
  const selectedInPlayer =
    effectivePartnerTeam?.roster.find((p) => p.id === partnerTradePlayerId) ??
    effectivePartnerTeam?.roster[0];

  const tradePreview = useMemo(() => {
    if (!selectedOutPlayer || !selectedInPlayer) return null;
    return evaluateAiTradeApproval(selectedOutPlayer, selectedInPlayer);
  }, [selectedOutPlayer, selectedInPlayer]);

  const leagueLeaders = useMemo(() => {
    const rows = eraTeams.flatMap((t) =>
      t.roster.slice(0, 3).map((p) => ({
        id: p.id,
        name: p.name,
        teamAbbr: t.abbr,
        pos: p.position,
        ovr: p.ovr,
        ppg: Number((12 + (p.ovr - 74) * 0.88 + p.attributes.threePt * 0.04).toFixed(1)),
        rpg: Number((3.2 + (p.attributes.defReb + p.attributes.offReb) * 0.055).toFixed(1)),
        apg: Number((2.1 + p.attributes.passAccuracy * 0.088).toFixed(1)),
      }))
    );
    return rows.sort((a, b) => b.ppg - a.ppg).slice(0, 12);
  }, [eraTeams]);

  const switchEra = (nextEra: MyNbaEraId) => {
    HybridAudioEngine.playUi('switch', eraMode);
    ModesStore.startNewMyNbaEra(nextEra);
    onNotify(`Switched MyNBA to ${nextEra === 'ERA_2014' ? '2014 LeBron Era' : '2026 Modern Era'}!`);
  };

  const launchPlayoffGame = (series: PlayoffSeries) => {
    const hi = RosterStore.getTeamById(series.highSeedTeamId);
    const lo = RosterStore.getTeamById(series.lowSeedTeamId);
    const userIsLow = series.lowSeedTeamId === nba.userTeamId;
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'MYNBA_GAME',
      title: `MyNBA Playoffs · ${hi.abbr} vs ${lo.abbr}`,
      subtitle: `Series ${series.highWins}-${series.lowWins} · Round ${series.round}`,
      returnScreen: 'MYNBA_HUB',
      matchPatch: {
        homeTeamId: hi.id,
        awayTeamId: lo.id,
        venue: nba.era === 'ERA_2014' ? 'ARENA_2K14' : 'ARENA_2K26',
        quarterLengthMin: 5,
        difficulty: 'All-Star',
        sideControl: userIsLow ? 'AWAY' : 'HOME',
        playersPerSide: 5,
        targetScore: null,
        modeLabel: `MyNBA Playoffs R${series.round}`,
      },
      myNbaSeriesId: series.id,
      objectiveBanner: `Playoff Round ${series.round} · ${hi.abbr} (${series.highWins}) vs ${lo.abbr} (${series.lowWins}) · Win to advance!`,
      baseVcReward: 1200,
      baseRepReward: 380,
    });
  };

  const eastStandings = nba.standings
    .filter((s) => s.conference === 'EAST')
    .sort((a, b) => b.wins - a.wins);
  const westStandings = nba.standings
    .filter((s) => s.conference === 'WEST')
    .sort((a, b) => b.wins - a.wins);

  const championTeam = nba.championTeamId ? RosterStore.getTeamById(nba.championTeamId) : null;

  return (
    <div className="h2k-mode-root">
      <header className="h2k-mode-topbar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title">THE ASSOCIATION / MyNBA ERAS</h2>
            <div className="h2k-mode-submeta">
              {nba.seasonYearLabel} · Franchise: {userTeam.city} {userTeam.name} ({userTeam.ovr} OVR)
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <button
            type="button"
            className={`h2k-mode-btn ${nba.era === 'ERA_2014' ? 'crimson' : ''}`}
            onClick={() => switchEra('ERA_2014')}
          >
            2014 LeBron Era
          </button>
          <button
            type="button"
            className={`h2k-mode-btn ${nba.era === 'ERA_2026' ? 'primary' : ''}`}
            onClick={() => switchEra('ERA_2026')}
          >
            2026 Modern Era
          </button>
          <select
            className="h2k-select"
            value={nba.userTeamId}
            onChange={(e) => ModesStore.setMyNbaUserTeam(e.target.value)}
            style={{ minHeight: 38 }}
          >
            {eraTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.abbr} · {t.city} {t.name} ({t.ovr})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="h2k-mode-tabs">
        {(
          [
            { id: 'BRACKET', label: '16-Team Playoff Bracket' },
            { id: 'STANDINGS', label: 'Conference Standings' },
            { id: 'TRADE_MACHINE', label: 'Trade Machine (AI GM)' },
            { id: 'LEADERS', label: 'League Leaders' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`h2k-mode-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="h2k-mode-scroll">
        {/* TAB 1: 16-TEAM PLAYOFF BRACKET */}
        {tab === 'BRACKET' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="h2k-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 18 }}>
                  {championTeam
                    ? `🏆 NBA CHAMPION: ${championTeam.city.toUpperCase()} ${championTeam.name.toUpperCase()}!`
                    : `Interactive 16-Team Playoff Bracket · ${nba.seasonYearLabel}`}
                </h3>
                <div className="h2k-muted">
                  Simulate individual games, sim entire rounds with our OVR-weighted engine, or click [PLAY GAME] to tip off in 3D!
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="h2k-mode-btn cyan"
                  disabled={Boolean(championTeam)}
                  onClick={() => {
                    const res = ModesStore.simulateMyNbaCurrentRound();
                    if (res.ok) onNotify(`Simulated ${res.gamesSimulated} playoff games and advanced the bracket!`);
                  }}
                >
                  ⚡ Sim Current Round
                </button>
                <button
                  type="button"
                  className="h2k-mode-btn"
                  onClick={() => {
                    ModesStore.startNewMyNbaEra(nba.era, nba.userTeamId);
                    onNotify('Reset Playoff Bracket for a fresh postseason!');
                  }}
                >
                  New Postseason
                </button>
              </div>
            </div>

            {([1, 2, 3, 4] as const).map((roundNum) => {
              const roundSeries = nba.playoffBracket.filter((s) => s.round === roundNum);
              if (roundSeries.length === 0) return null;
              const roundTitle =
                roundNum === 1
                  ? 'First Round (16 Teams)'
                  : roundNum === 2
                    ? 'Conference Semifinals'
                    : roundNum === 3
                      ? 'Conference Finals'
                      : '🏆 NBA FINALS';
              return (
                <div key={roundNum}>
                  <h4 style={{ margin: '0 0 10px', fontFamily: 'Oswald, sans-serif', color: '#fcd34d', letterSpacing: '0.04em' }}>
                    {roundTitle}
                  </h4>
                  <div className="h2k-grid-4">
                    {roundSeries.map((s) => {
                      const hi = RosterStore.getTeamById(s.highSeedTeamId);
                      const lo = RosterStore.getTeamById(s.lowSeedTeamId);
                      const involvesUser = hi.id === nba.userTeamId || lo.id === nba.userTeamId;
                      return (
                        <div
                          key={s.id}
                          className="h2k-card"
                          style={{
                            borderColor: involvesUser ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                            {s.conference} · {s.winnerTeamId ? 'FINAL' : 'BEST OF 7'}
                          </div>
                          <div className="h2k-tabular" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span style={{ color: s.winnerTeamId === hi.id ? '#4ade80' : '#f8fafc' }}>
                              {hi.abbr} ({hi.ovr})
                            </span>
                            <span>{s.highWins}</span>
                          </div>
                          <div className="h2k-tabular" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span style={{ color: s.winnerTeamId === lo.id ? '#4ade80' : '#f8fafc' }}>
                              {lo.abbr} ({lo.ovr})
                            </span>
                            <span>{s.lowWins}</span>
                          </div>
                          {!s.winnerTeamId && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                              <button
                                type="button"
                                className="h2k-mode-btn primary"
                                style={{ flex: 1, minHeight: 32, padding: '0 8px' }}
                                onClick={() => launchPlayoffGame(s)}
                              >
                                PLAY GAME
                              </button>
                              <button
                                type="button"
                                className="h2k-mode-btn"
                                style={{ minHeight: 32, padding: '0 10px' }}
                                onClick={() => {
                                  const res = ModesStore.simulateMyNbaSeriesGame(s.id);
                                  onNotify(res.summary);
                                }}
                              >
                                Sim 1
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: STANDINGS */}
        {tab === 'STANDINGS' && (
          <div className="h2k-grid-2">
            {[
              { title: 'Eastern Conference', rows: eastStandings },
              { title: 'Western Conference', rows: westStandings },
            ].map((conf) => (
              <div key={conf.title} className="h2k-card">
                <div className="h2k-section-head">
                  <h3>{conf.title}</h3>
                </div>
                {conf.rows.map((r, idx) => (
                  <div
                    key={r.teamId}
                    className="h2k-tabular"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr 54px 54px 54px',
                      padding: '7px 6px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 12,
                      background: r.teamId === nba.userTeamId ? 'rgba(245,158,11,0.14)' : undefined,
                    }}
                  >
                    <span className="h2k-muted">#{idx + 1}</span>
                    <strong>{r.name}</strong>
                    <span>{r.wins}-{r.losses}</span>
                    <span>{r.ovr} OVR</span>
                    <span className="h2k-muted">{r.ppg} PPG</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TRADE MACHINE WITH AI APPROVAL METER */}
        {tab === 'TRADE_MACHINE' && effectivePartnerTeam && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="h2k-grid-2">
              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>Send From {userTeam.city} {userTeam.name}</h3>
                </div>
                <select
                  className="h2k-select"
                  style={{ width: '100%' }}
                  value={selectedOutPlayer?.id ?? ''}
                  onChange={(e) => setUserTradePlayerId(e.target.value)}
                >
                  {userTeam.roster.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.position} · {p.ovr} OVR ({p.archetype})
                    </option>
                  ))}
                </select>
              </div>

              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>Receive From Partner</h3>
                  <select
                    className="h2k-select"
                    value={effectivePartnerTeam.id}
                    onChange={(e) => {
                      setPartnerTeamId(e.target.value);
                      setPartnerTradePlayerId('');
                    }}
                  >
                    {eraTeams
                      .filter((t) => t.id !== userTeam.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.abbr} · {t.city} {t.name}
                        </option>
                      ))}
                  </select>
                </div>
                <select
                  className="h2k-select"
                  style={{ width: '100%' }}
                  value={selectedInPlayer?.id ?? ''}
                  onChange={(e) => setPartnerTradePlayerId(e.target.value)}
                >
                  {effectivePartnerTeam.roster.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.position} · {p.ovr} OVR ({p.archetype})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {tradePreview && selectedOutPlayer && selectedInPlayer && (
              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>AI GM Trade Approval Meter</h3>
                  <strong
                    className="h2k-tabular"
                    style={{
                      fontSize: 18,
                      color: tradePreview.accepted ? '#4ade80' : '#f87171',
                    }}
                  >
                    {tradePreview.approvalPct}% · {tradePreview.accepted ? 'LIKELY ACCEPTED' : 'REJECTED'}
                  </strong>
                </div>
                <div className="h2k-bar-track" style={{ marginBottom: 10 }}>
                  <div
                    className="h2k-bar-fill"
                    style={{
                      width: `${tradePreview.approvalPct}%`,
                      background: tradePreview.accepted ? '#22c55e' : '#ef4444',
                    }}
                  />
                </div>
                <p className="h2k-muted" style={{ margin: '0 0 12px' }}>
                  {tradePreview.reason}
                </p>
                <button
                  type="button"
                  className={`h2k-mode-btn ${tradePreview.accepted ? 'emerald' : ''}`}
                  onClick={() => {
                    const res = ModesStore.executeMyNbaTrade(
                      userTeam.id,
                      effectivePartnerTeam.id,
                      selectedOutPlayer.id,
                      selectedInPlayer.id
                    );
                    onNotify(res.message);
                  }}
                >
                  Propose Official Trade
                </button>
              </div>
            )}

            {nba.tradeHistory.length > 0 && (
              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>Completed League Trades</h3>
                </div>
                {nba.tradeHistory.map((tr) => (
                  <div key={tr.id} className="h2k-muted" style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {tr.summary} ({tr.approvalScore}% GM approval)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LEAGUE LEADERS */}
        {tab === 'LEADERS' && (
          <div className="h2k-card">
            <div className="h2k-section-head">
              <h3>{nba.seasonYearLabel} · League Scoring Leaders</h3>
            </div>
            {leagueLeaders.map((row, idx) => (
              <div
                key={row.id}
                className="h2k-tabular"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr 64px 56px 68px 68px 68px',
                  padding: '8px 6px',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 12,
                }}
              >
                <span className="h2k-muted">#{idx + 1}</span>
                <strong>{row.name}</strong>
                <span>{row.teamAbbr} · {row.pos}</span>
                <span style={{ color: '#fbbf24' }}>{row.ovr}</span>
                <strong>{row.ppg} PPG</strong>
                <span>{row.rpg} RPG</span>
                <span>{row.apg} APG</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
