import React, { useMemo } from 'react';
import {
  ERA_POOL_META,
  TeamEmblemSVG,
  VENUE_OPTIONS,
  getHybridTeamById,
  getTeamsByEraPool,
} from './teamCatalog';
import { useRosterStore } from './rosterStore';
import { HybridAudioEngine } from './audioEngine';
import { UltimateHybridStore } from './store';
import type {
  ActiveMatchConfig,
  EraPoolId,
  HybridTeamSummary,
  JerseyVariant,
  MatchDifficulty,
  MatchVenueId,
  SideControlMode,
  UIEraMode,
} from './types';

export interface PlayNowSetupProps {
  eraMode: UIEraMode;
  config: ActiveMatchConfig;
  onBack: () => void;
  onOpenRosterManager?: (teamId?: string) => void;
  onOpenCreateAPlayer?: (teamId?: string) => void;
  onTipOff: (cfg: ActiveMatchConfig, away: HybridTeamSummary, home: HybridTeamSummary) => void;
}

const JERSEYS: JerseyVariant[] = ['HOME', 'AWAY', 'CLASSIC', 'CITY'];
const QUARTERS: Array<2 | 5 | 8 | 12> = [2, 5, 8, 12];
const DIFFICULTIES: MatchDifficulty[] = [
  'Rookie',
  'Pro',
  'All-Star',
  'Superstar',
  'Hall of Fame',
];

function RatingMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="h2k-rating-row">
      <span className="h2k-rating-lbl">{label}</span>
      <div className="h2k-rating-track">
        <div
          className="h2k-rating-fill"
          style={{ width: `${Math.min(100, Math.max(40, value))}%`, backgroundColor: color }}
        />
      </div>
      <strong className="h2k-rating-num">{value}</strong>
    </div>
  );
}

export const PlayNowSetup: React.FC<PlayNowSetupProps> = ({
  eraMode,
  config,
  onBack,
  onOpenRosterManager,
  onOpenCreateAPlayer,
  onTipOff,
}) => {
  const rosterSnap = useRosterStore();
  const awayPoolTeams = useMemo(
    () => getTeamsByEraPool(config.awayEraPool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.awayEraPool, rosterSnap.revision]
  );
  const homePoolTeams = useMemo(
    () => getTeamsByEraPool(config.homeEraPool),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.homeEraPool, rosterSnap.revision]
  );

  const awayTeam = useMemo(() => {
    const found = awayPoolTeams.find((t) => t.id === config.awayTeamId);
    return found ?? awayPoolTeams[0] ?? getHybridTeamById(config.awayTeamId);
  }, [awayPoolTeams, config.awayTeamId]);

  const homeTeam = useMemo(() => {
    const found = homePoolTeams.find((t) => t.id === config.homeTeamId);
    return found ?? homePoolTeams[0] ?? getHybridTeamById(config.homeTeamId);
  }, [homePoolTeams, config.homeTeamId]);

  const setPool = (side: 'away' | 'home', pool: EraPoolId) => {
    HybridAudioEngine.playUi('switch', eraMode);
    const teams = getTeamsByEraPool(pool);
    const pick = teams[side === 'home' && teams.length > 1 ? 1 : 0] ?? teams[0];
    if (side === 'away') {
      UltimateHybridStore.updateMatchConfig({
        awayEraPool: pool,
        awayTeamId: pick.id,
      });
    } else {
      UltimateHybridStore.updateMatchConfig({
        homeEraPool: pool,
        homeTeamId: pick.id,
        venue:
          pool === 'THE_W'
            ? 'WNBA_ARENA'
            : pool === 'EUROLEAGUE_14'
              ? 'EUROLEAGUE_PALACE'
              : config.venue,
      });
    }
  };

  const stepTeam = (side: 'away' | 'home', delta: number) => {
    HybridAudioEngine.playUi('click', eraMode);
    const list = side === 'away' ? awayPoolTeams : homePoolTeams;
    const curId = side === 'away' ? awayTeam.id : homeTeam.id;
    const idx = Math.max(0, list.findIndex((t) => t.id === curId));
    const next = list[(idx + delta + list.length) % list.length];
    if (!next) return;
    if (side === 'away') {
      UltimateHybridStore.updateMatchConfig({ awayTeamId: next.id });
    } else {
      UltimateHybridStore.updateMatchConfig({ homeTeamId: next.id });
    }
  };

  const renderTeamSide = (side: 'away' | 'home', team: HybridTeamSummary, pool: EraPoolId, poolTeams: HybridTeamSummary[], jersey: JerseyVariant) => {
    const isControlled =
      (side === 'away' && config.sideControl === 'AWAY') ||
      (side === 'home' && config.sideControl === 'HOME');

    return (
      <section className={`h2k-matchup-card ${side} ${isControlled ? 'is-user' : ''}`}>
        <div className="h2k-matchup-card-top">
          <span className="h2k-side-badge">
            {side === 'away' ? 'AWAY SQUAD' : 'HOME SQUAD'}
            {isControlled ? ' · P1 USER' : config.sideControl === 'CPU_VS_CPU' ? ' · CPU' : ' · CPU'}
          </span>
          <span className="h2k-era-chip" style={{ borderColor: team.accentColor }}>
            {team.eraBadge}
          </span>
        </div>

        {/* 5 Era Pool Filter Pills */}
        <div className="h2k-pool-tabs" role="tablist" aria-label={`${side} era pools`}>
          {ERA_POOL_META.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`h2k-pool-pill ${pool === p.id ? 'active' : ''}`}
              onClick={() => setPool(side, p.id)}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>

        {/* Emblem + Team Cycle Selector */}
        <div className="h2k-team-selector-row">
          <button
            type="button"
            className="h2k-arrow-btn"
            aria-label={`Previous ${side} team`}
            onClick={() => stepTeam(side, -1)}
          >
            ◀
          </button>

          <div className="h2k-team-identity">
            <TeamEmblemSVG team={team} size={74} />
            <div className="h2k-team-title-block">
              <div className="h2k-team-city">{team.city}</div>
              <h3 className="h2k-team-name">{team.name}</h3>
              <div className="h2k-team-arena">{team.arena}</div>
            </div>
          </div>

          <button
            type="button"
            className="h2k-arrow-btn"
            aria-label={`Next ${side} team`}
            onClick={() => stepTeam(side, 1)}
          >
            ▶
          </button>
        </div>

        {/* Direct Team Dropdown for instant access across 50+ teams */}
        <div className="h2k-team-select-row">
          <select
            className="h2k-select"
            aria-label={`Select ${side} team`}
            value={team.id}
            onChange={(e) => {
              HybridAudioEngine.playUi('click', eraMode);
              if (side === 'away') UltimateHybridStore.updateMatchConfig({ awayTeamId: e.target.value });
              else UltimateHybridStore.updateMatchConfig({ homeTeamId: e.target.value });
            }}
          >
            {poolTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.ovr} OVR)
              </option>
            ))}
          </select>

          <button
            type="button"
            className="h2k-mini-pill"
            onClick={() => {
              HybridAudioEngine.playUi('click', eraMode);
              const nextJ = JERSEYS[(JERSEYS.indexOf(jersey) + 1) % JERSEYS.length];
              if (side === 'away') UltimateHybridStore.updateMatchConfig({ awayJersey: nextJ });
              else UltimateHybridStore.updateMatchConfig({ homeJersey: nextJ });
            }}
          >
            JERSEY: {jersey}
          </button>
        </div>

        {/* Color-Coded OVR / OFF / DEF Bars */}
        <div className="h2k-ratings-box">
          <RatingMeter label="OVR" value={team.ovr} color="#f59e0b" />
          <RatingMeter label="OFF" value={team.off} color="#e11d48" />
          <RatingMeter label="DEF" value={team.def} color="#38bdf8" />
        </div>

        {/* Star Spotlight */}
        <div className="h2k-star-spotlight" style={{ borderLeftColor: team.accentColor }}>
          <div>
            <div className="h2k-star-kicker">STAR SPOTLIGHT · #{team.starPlayer.jersey}</div>
            <strong>{team.starPlayer.name}</strong>
            <span className="h2k-star-sig">
              {team.starPlayer.position} · {team.starPlayer.signatureTag}
            </span>
          </div>
          <div className="h2k-star-ovr">{team.starPlayer.ovr}</div>
        </div>

        {/* Starting 5 Lineup */}
        <div className="h2k-starters-grid">
          {team.starters.map((p, idx) => (
            <div key={`${p.name}_${idx}`} className="h2k-starter-chip">
              <span className="pos">{p.position}</span>
              <span className="name">{p.name}</span>
              <strong className="ovr">{p.ovr}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="h2k-playnow-screen">
      {/* Top Broadcast Header */}
      <header className="h2k-subscreen-header">
        <div className="h2k-subscreen-left">
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('back', eraMode);
              onBack();
            }}
          >
            ◀ MAIN MENU
          </button>
          <div>
            <div className="h2k-kicker">PRE-GAME BROADCAST MATCHUP</div>
            <h2>PLAY NOW · CROSS-ERA TEAM SELECT</h2>
          </div>
        </div>
        <div className="h2k-subscreen-right h2k-roster-head-actions">
          {onOpenRosterManager && (
            <button
              type="button"
              className="h2k-btn-ghost"
              onClick={() => {
                HybridAudioEngine.playUi('click', eraMode);
                onOpenRosterManager(homeTeam.id);
              }}
            >
              📋 MANAGE ROSTER
            </button>
          )}
          {onOpenCreateAPlayer && (
            <button
              type="button"
              className="h2k-btn-ghost"
              onClick={() => {
                HybridAudioEngine.playUi('click', eraMode);
                onOpenCreateAPlayer(homeTeam.id);
              }}
            >
              + CREATE-A-PLAYER
            </button>
          )}
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('switch', eraMode);
              const randAway = awayPoolTeams[Math.floor(Math.random() * awayPoolTeams.length)];
              const randHome = homePoolTeams[Math.floor(Math.random() * homePoolTeams.length)];
              UltimateHybridStore.updateMatchConfig({
                awayTeamId: randAway?.id ?? config.awayTeamId,
                homeTeamId: randHome?.id ?? config.homeTeamId,
              });
            }}
          >
            🎲 RANDOMIZE MATCHUP
          </button>
        </div>
      </header>

      {/* Side-by-Side Away vs Home Split */}
      <div className="h2k-matchup-split">
        {renderTeamSide('away', awayTeam, config.awayEraPool, awayPoolTeams, config.awayJersey)}

        <div className="h2k-vs-divider">
          <div className="h2k-vs-badge">VS</div>
          <div className="h2k-side-select-box">
            <span className="h2k-side-select-lbl">SIDE SELECT</span>
            {(['AWAY', 'HOME', 'CPU_VS_CPU'] as SideControlMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`h2k-side-opt ${config.sideControl === mode ? 'active' : ''}`}
                onClick={() => {
                  HybridAudioEngine.playUi('click', eraMode);
                  UltimateHybridStore.updateMatchConfig({ sideControl: mode });
                }}
              >
                {mode === 'CPU_VS_CPU' ? 'CPU vs CPU' : mode}
              </button>
            ))}
          </div>
        </div>

        {renderTeamSide('home', homeTeam, config.homeEraPool, homePoolTeams, config.homeJersey)}
      </div>

      {/* Bottom Pre-Game Control Strip + Glowing TIP-OFF CTA */}
      <footer className="h2k-pregame-dock">
        <div className="h2k-pregame-controls">
          <label className="h2k-control-field">
            <span>VENUE / COURT</span>
            <select
              className="h2k-select"
              value={config.venue}
              onChange={(e) => {
                HybridAudioEngine.playUi('click', eraMode);
                UltimateHybridStore.updateMatchConfig({ venue: e.target.value as MatchVenueId });
              }}
            >
              {VENUE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.eraNote})
                </option>
              ))}
            </select>
          </label>

          <div className="h2k-control-field">
            <span>QUARTER LENGTH</span>
            <div className="h2k-seg-group">
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`h2k-seg-btn ${config.quarterLengthMin === q ? 'active' : ''}`}
                  onClick={() => {
                    HybridAudioEngine.playUi('click', eraMode);
                    UltimateHybridStore.updateMatchConfig({ quarterLengthMin: q });
                  }}
                >
                  {q}M
                </button>
              ))}
            </div>
          </div>

          <label className="h2k-control-field">
            <span>DIFFICULTY</span>
            <select
              className="h2k-select"
              value={config.difficulty}
              onChange={(e) => {
                HybridAudioEngine.playUi('click', eraMode);
                UltimateHybridStore.updateMatchConfig({
                  difficulty: e.target.value as MatchDifficulty,
                });
              }}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="h2k-tipoff-cta"
          onClick={() => {
            HybridAudioEngine.playWhistle();
            HybridAudioEngine.announce(
              `Tip-off! ${awayTeam.fullName} at ${homeTeam.fullName}!`
            );
            onTipOff(
              {
                ...config,
                awayTeamId: awayTeam.id,
                homeTeamId: homeTeam.id,
              },
              awayTeam,
              homeTeam
            );
          }}
        >
          <span className="h2k-tipoff-title">TIP-OFF / START GAME</span>
          <span className="h2k-tipoff-sub">
            {awayTeam.abbr} @ {homeTeam.abbr} · {config.quarterLengthMin}m QTR · {config.difficulty}
          </span>
        </button>
      </footer>
    </div>
  );
};
