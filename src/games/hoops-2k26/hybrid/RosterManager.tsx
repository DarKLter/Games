import React, { useMemo, useState } from 'react';
import {
  ATTRIBUTE_META,
  BADGE_CATALOG,
  BADGE_TIERS,
  computePlayerOvr,
  deriveArchetype,
  formatHeightFeetInches,
  type AttributeKey,
  type BadgeCategory,
  type BadgeId,
  type BadgeTier,
  type HairStyle,
  type HotZoneKey,
  type HotZoneValue,
  type PlayerPosition,
  type PlayerProfile,
  type TeamEra,
} from './rosterTypes';
import { RosterStore, useRosterStore } from './rosterStore';
import { HotZoneCourtSVG, TeamLogoFromData } from './TeamLogo';
import { HybridAudioEngine } from './audioEngine';
import type { UIEraMode } from './types';

// ============================================================================
// PART 2 MANAGE ROSTER — FULL 72-TEAM EDITOR, SWAP, TRADE & FREE AGENTS
// ============================================================================

export interface RosterManagerProps {
  eraMode: UIEraMode;
  initialTeamId?: string;
  onBack: () => void;
  onOpenCreateAPlayer: (targetTeamId: string) => void;
  onLaunchPlayNowWithTeam: (teamId: string) => void;
  onNotify: (msg: string) => void;
}

type EraFilter = 'ALL' | TeamEra | 'FREE_AGENTS';
type InspectorTab = 'ATTRIBUTES' | 'HOT_ZONES' | 'BADGES' | 'BIO';

const ERA_FILTERS: Array<{ id: EraFilter; label: string }> = [
  { id: 'ALL', label: 'ALL 72' },
  { id: '2K14', label: "2K14 '13-14 (30)" },
  { id: '2K26', label: "2K26 '25-26 (30)" },
  { id: 'LEGENDS', label: 'LEGENDS (4)' },
  { id: 'EUROLEAGUE', label: 'EURO (4)' },
  { id: 'WNBA', label: 'THE W (4)' },
  { id: 'FREE_AGENTS', label: 'FREE AGENTS' },
];

const POSITIONS: PlayerPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const HAIR_OPTIONS: HairStyle[] = [
  'FADE',
  'BUZZ',
  'SHORT',
  'BRAIDS',
  'DREADS',
  'AFRO',
  'PONYTAIL',
  'BALD',
];
const SKIN_SWATCHES = ['#f2cbb6', '#dfa883', '#c68657', '#9c623d', '#734529', '#522f1c'];
const BADGE_CATS: BadgeCategory[] = ['SHOOTING', 'PLAYMAKING', 'FINISHING', 'DEFENSE'];

function cycleBadgeTier(cur?: BadgeTier): BadgeTier | undefined {
  if (!cur) return 'BRONZE';
  const idx = BADGE_TIERS.indexOf(cur);
  if (idx === -1 || idx === BADGE_TIERS.length - 1) return undefined;
  return BADGE_TIERS[idx + 1];
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  eraMode,
  initialTeamId,
  onBack,
  onOpenCreateAPlayer,
  onLaunchPlayNowWithTeam,
  onNotify,
}) => {
  const snap = useRosterStore();
  const [eraFilter, setEraFilter] = useState<EraFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    initialTeamId || snap.teams[0]?.id || '2k14_mia'
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('ATTRIBUTES');
  const [badgeCat, setBadgeCat] = useState<BadgeCategory>('SHOOTING');
  const [swapSlotIndex, setSwapSlotIndex] = useState<number | null>(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradePartnerTeamId, setTradePartnerTeamId] = useState<string>('2k26_okc');
  const [tradePartnerPlayerId, setTradePartnerPlayerId] = useState<string>('');
  const [signTargetTeamId, setSignTargetTeamId] = useState<string>('2k26_okc');

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return snap.teams.filter((t) => {
      if (eraFilter !== 'ALL' && eraFilter !== 'FREE_AGENTS' && t.era !== eraFilter) {
        return false;
      }
      if (!q) return true;
      return (
        t.city.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.abbr.toLowerCase().includes(q) ||
        t.roster.some((p) => p.name.toLowerCase().includes(q))
      );
    });
  }, [snap.teams, eraFilter, search]);

  const activeTeam = useMemo(
    () => snap.teams.find((t) => t.id === selectedTeamId) ?? snap.teams[0],
    [snap.teams, selectedTeamId]
  );

  const activePlayer: PlayerProfile | null = useMemo(() => {
    if (eraFilter === 'FREE_AGENTS') {
      return (
        snap.freeAgents.find((p) => p.id === selectedPlayerId) ??
        snap.freeAgents[0] ??
        null
      );
    }
    return (
      activeTeam.roster.find((p) => p.id === selectedPlayerId) ??
      activeTeam.roster[0] ??
      null
    );
  }, [eraFilter, snap.freeAgents, activeTeam, selectedPlayerId]);

  const partnerTeam = useMemo(() => {
    const pick =
      snap.teams.find((t) => t.id === tradePartnerTeamId && t.id !== activeTeam.id) ??
      snap.teams.find((t) => t.id !== activeTeam.id) ??
      snap.teams[0];
    return pick;
  }, [snap.teams, tradePartnerTeamId, activeTeam.id]);

  const resolvedPartnerPlayerId =
    partnerTeam.roster.find((p) => p.id === tradePartnerPlayerId)?.id ??
    partnerTeam.roster[0]?.id ??
    '';

  const commitPlayerPatch = (patch: Partial<PlayerProfile>, recomputeOvr = true) => {
    if (!activePlayer) return;
    RosterStore.updatePlayer({ ...activePlayer, ...patch }, recomputeOvr);
  };

  const handleAttrChange = (key: AttributeKey, val: number) => {
    if (!activePlayer) return;
    const nextAttrs = { ...activePlayer.attributes, [key]: val };
    const nextOvr = computePlayerOvr(nextAttrs, activePlayer.position);
    RosterStore.updatePlayer(
      {
        ...activePlayer,
        attributes: nextAttrs,
        ovr: nextOvr,
        archetype: deriveArchetype(nextAttrs, activePlayer.position),
      },
      false
    );
  };

  const handleHotZoneToggle = (zoneKey: HotZoneKey, nextVal: HotZoneValue) => {
    if (!activePlayer) return;
    HybridAudioEngine.playUi('click', eraMode);
    commitPlayerPatch(
      {
        hotZones: { ...activePlayer.hotZones, [zoneKey]: nextVal },
      },
      false
    );
  };

  const handleBadgeCycle = (badgeId: BadgeId) => {
    if (!activePlayer) return;
    HybridAudioEngine.playUi('click', eraMode);
    const nextBadges = { ...activePlayer.badges };
    const nextTier = cycleBadgeTier(nextBadges[badgeId]);
    if (nextTier) nextBadges[badgeId] = nextTier;
    else delete nextBadges[badgeId];
    commitPlayerPatch({ badges: nextBadges }, false);
  };

  const totalPlayersCount = useMemo(
    () =>
      snap.teams.reduce((sum, t) => sum + t.roster.length, 0) +
      snap.freeAgents.length,
    [snap.teams, snap.freeAgents]
  );

  return (
    <div className="h2k-roster-screen">
      {/* Header Bar */}
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
            <div className="h2k-kicker">
              PART 2 DUAL-ERA DATABASE · {snap.teams.length} TEAMS · {totalPlayersCount} PLAYERS
            </div>
            <h2>MANAGE ROSTER & TRADE MACHINE</h2>
          </div>
        </div>

        <div className="h2k-subscreen-right h2k-roster-head-actions">
          <button
            type="button"
            className="h2k-btn-accent"
            onClick={() => {
              HybridAudioEngine.playUi('confirm', eraMode);
              onOpenCreateAPlayer(activeTeam.id);
            }}
          >
            + CREATE-A-PLAYER
          </button>
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('confirm', eraMode);
              onLaunchPlayNowWithTeam(activeTeam.id);
            }}
          >
            🏀 PLAY WITH {activeTeam.abbr}
          </button>
          <button
            type="button"
            className="h2k-btn-danger"
            disabled={!snap.isCustomized}
            onClick={() => {
              HybridAudioEngine.playUi('back', eraMode);
              RosterStore.resetDefaultRosters();
              setSwapSlotIndex(null);
              onNotify('All 72 teams restored to authentic default rosters!');
            }}
          >
            RESET DEFAULT ROSTERS
          </button>
        </div>
      </header>

      {/* Era Filter Strip + Search */}
      <div className="h2k-roster-filter-bar">
        <div className="h2k-pool-tabs">
          {ERA_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`h2k-pool-pill ${eraFilter === f.id ? 'active' : ''}`}
              onClick={() => {
                HybridAudioEngine.playUi('click', eraMode);
                setEraFilter(f.id);
                setSwapSlotIndex(null);
              }}
            >
              {f.label}
              {f.id === 'FREE_AGENTS' ? ` (${snap.freeAgents.length})` : ''}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="h2k-input h2k-roster-search"
          placeholder="Search team or player (e.g. LeBron, Jokic, Curry, Caitlin)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search teams or players"
        />
      </div>

      {/* Main 3-Column Studio Body */}
      <div className="h2k-roster-workspace">
        {/* LEFT COLUMN: 72-Team Directory */}
        <aside className="h2k-roster-col h2k-team-list-col" aria-label="72 Teams Directory">
          <div className="h2k-col-head">
            <span>TEAMS ({filteredTeams.length})</span>
            {snap.isCustomized && <span className="h2k-custom-dot">CUSTOM SAVED</span>}
          </div>
          <div className="h2k-team-list-scroll">
            {filteredTeams.map((team) => {
              const isSelected = eraFilter !== 'FREE_AGENTS' && team.id === activeTeam.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  className={`h2k-team-row-btn ${isSelected ? 'active' : ''}`}
                  style={{ borderLeftColor: isSelected ? team.colors.accent : team.colors.primary }}
                  onClick={() => {
                    HybridAudioEngine.playUi('click', eraMode);
                    if (eraFilter === 'FREE_AGENTS') setEraFilter('ALL');
                    setSelectedTeamId(team.id);
                    setSelectedPlayerId(team.roster[0]?.id ?? '');
                    setSwapSlotIndex(null);
                  }}
                >
                  <TeamLogoFromData team={team} size={36} />
                  <div className="h2k-team-row-meta">
                    <strong>
                      {team.city} {team.name}
                    </strong>
                    <span>
                      {team.era} · OFF {team.offRating} / DEF {team.defRating}
                    </span>
                  </div>
                  <span className="h2k-team-row-ovr">{team.ovr}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER COLUMN: Active Team Lineup (Starting 5 + Bench) OR Free Agents Pool */}
        <section className="h2k-roster-col h2k-lineup-col">
          {eraFilter === 'FREE_AGENTS' ? (
            <>
              <div className="h2k-team-banner">
                <div>
                  <div className="h2k-kicker">UNASSIGNED & CREATED PROSPECTS</div>
                  <h3>FREE AGENTS POOL ({snap.freeAgents.length})</h3>
                </div>
                <select
                  className="h2k-select"
                  value={signTargetTeamId}
                  onChange={(e) => setSignTargetTeamId(e.target.value)}
                  aria-label="Team to sign free agent"
                >
                  {snap.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      Sign to: {t.city} {t.name} ({t.era})
                    </option>
                  ))}
                </select>
              </div>

              {snap.freeAgents.length === 0 ? (
                <div className="h2k-empty-box">
                  <p>No free agents right now. Create a player or release a bench player to add them here.</p>
                  <button
                    type="button"
                    className="h2k-btn-accent"
                    onClick={() => onOpenCreateAPlayer('FREE_AGENTS')}
                  >
                    + CREATE FREE AGENT PROSPECT
                  </button>
                </div>
              ) : (
                <div className="h2k-lineup-scroll">
                  {snap.freeAgents.map((p) => (
                    <div
                      key={p.id}
                      className={`h2k-player-row ${activePlayer?.id === p.id ? 'active' : ''}`}
                      onClick={() => setSelectedPlayerId(p.id)}
                    >
                      <span className="h2k-pos-pill">{p.position}</span>
                      <div className="h2k-player-row-info">
                        <strong>
                          #{p.jerseyNumber} {p.name}
                        </strong>
                        <span>
                          {formatHeightFeetInches(p.heightInches)} · {p.archetype}
                        </span>
                      </div>
                      <strong className="h2k-player-ovr">{p.ovr}</strong>
                      <button
                        type="button"
                        className="h2k-mini-pill accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          const res = RosterStore.signFreeAgent(p.id, signTargetTeamId);
                          onNotify(res.message);
                        }}
                      >
                        SIGN
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div
                className="h2k-team-banner"
                style={{ borderBottomColor: activeTeam.colors.accent }}
              >
                <div className="h2k-team-banner-left">
                  <TeamLogoFromData team={activeTeam} size={56} />
                  <div>
                    <div className="h2k-kicker">
                      {activeTeam.era} · {activeTeam.arena}
                    </div>
                    <h3>
                      {activeTeam.city} {activeTeam.name}
                    </h3>
                    <div className="h2k-banner-ratings">
                      <span>OVR {activeTeam.ovr}</span>
                      <span>OFF {activeTeam.offRating}</span>
                      <span>DEF {activeTeam.defRating}</span>
                    </div>
                  </div>
                </div>

                <div className="h2k-team-banner-actions">
                  <button
                    type="button"
                    className={`h2k-mini-pill ${tradeOpen ? 'accent' : ''}`}
                    onClick={() => {
                      HybridAudioEngine.playUi('switch', eraMode);
                      setTradeOpen((v) => !v);
                    }}
                  >
                    ⇄ {tradeOpen ? 'CLOSE TRADE' : 'TRADE MACHINE'}
                  </button>
                </div>
              </div>

              {/* Inline Cross-Team Trade Machine */}
              {tradeOpen && activePlayer && (
                <div className="h2k-trade-panel">
                  <div className="h2k-kicker">
                    TRADE {activePlayer.name.toUpperCase()} ({activeTeam.abbr}) TO ANY OF 71 TEAMS
                  </div>
                  <div className="h2k-trade-controls">
                    <select
                      className="h2k-select"
                      value={partnerTeam.id}
                      onChange={(e) => {
                        setTradePartnerTeamId(e.target.value);
                        setTradePartnerPlayerId('');
                      }}
                      aria-label="Trade partner team"
                    >
                      {snap.teams
                        .filter((t) => t.id !== activeTeam.id)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.city} {t.name} ({t.era} · {t.ovr})
                          </option>
                        ))}
                    </select>
                    <select
                      className="h2k-select"
                      value={resolvedPartnerPlayerId}
                      onChange={(e) => setTradePartnerPlayerId(e.target.value)}
                      aria-label="Trade partner player"
                    >
                      {partnerTeam.roster.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.position} #{p.jerseyNumber} {p.name} ({p.ovr} OVR)
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="h2k-btn-accent"
                      onClick={() => {
                        const res = RosterStore.tradePlayers(
                          activeTeam.id,
                          activePlayer.id,
                          partnerTeam.id,
                          resolvedPartnerPlayerId
                        );
                        if (res.ok) {
                          HybridAudioEngine.playGreenRelease();
                          setSelectedPlayerId(resolvedPartnerPlayerId);
                          setTradeOpen(false);
                        }
                        onNotify(res.message);
                      }}
                    >
                      EXECUTE TRADE
                    </button>
                  </div>
                </div>
              )}

              {swapSlotIndex !== null && (
                <div className="h2k-swap-banner">
                  <span>
                    Select another player to swap lineup slot with{' '}
                    <strong>{activeTeam.roster[swapSlotIndex]?.name}</strong>
                  </span>
                  <button
                    type="button"
                    className="h2k-mini-pill"
                    onClick={() => setSwapSlotIndex(null)}
                  >
                    CANCEL
                  </button>
                </div>
              )}

              <div className="h2k-lineup-scroll">
                <div className="h2k-section-divider">STARTING 5 (LIVE IN 3D TIP-OFF)</div>
                {activeTeam.roster.map((player, idx) => {
                  const isBenchStart = idx === 5;
                  const isSelected = activePlayer?.id === player.id;
                  const isSwapSource = swapSlotIndex === idx;
                  const badgeCount = Object.keys(player.badges).length;
                  return (
                    <React.Fragment key={player.id}>
                      {isBenchStart && (
                        <div className="h2k-section-divider">BENCH ROTATION</div>
                      )}
                      <div
                        className={`h2k-player-row ${isSelected ? 'active' : ''} ${isSwapSource ? 'is-swapping' : ''}`}
                        onClick={() => {
                          HybridAudioEngine.playUi('click', eraMode);
                          if (swapSlotIndex !== null && swapSlotIndex !== idx) {
                            RosterStore.swapStarterBench(activeTeam.id, swapSlotIndex, idx);
                            setSwapSlotIndex(null);
                            onNotify('Lineup rotation updated & saved!');
                            return;
                          }
                          setSelectedPlayerId(player.id);
                        }}
                      >
                        <span className={`h2k-pos-pill ${idx < 5 ? 'starter' : 'bench'}`}>
                          {idx < 5 ? POSITIONS[idx] : player.position}
                        </span>
                        <div className="h2k-player-row-info">
                          <strong>
                            #{player.jerseyNumber} {player.name}
                            {player.isCreated ? ' ★' : ''}
                          </strong>
                          <span>
                            {formatHeightFeetInches(player.heightInches)} · {player.archetype} ·{' '}
                            {badgeCount} Badges
                          </span>
                        </div>
                        <strong className="h2k-player-ovr">{player.ovr}</strong>
                        <button
                          type="button"
                          className="h2k-mini-pill"
                          title="Swap Starter / Bench position"
                          onClick={(e) => {
                            e.stopPropagation();
                            HybridAudioEngine.playUi('switch', eraMode);
                            setSwapSlotIndex(isSwapSource ? null : idx);
                          }}
                        >
                          {isSwapSource ? '✓' : '⇅'}
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* RIGHT COLUMN: 4-Tab Deep Player Inspector & Live Editor */}
        <section className="h2k-roster-col h2k-inspector-col">
          {!activePlayer ? (
            <div className="h2k-empty-box">Select a player to inspect and edit.</div>
          ) : (
            <>
              <div className="h2k-inspector-head">
                <div>
                  <div className="h2k-kicker">
                    {activePlayer.position} · #{activePlayer.jerseyNumber} ·{' '}
                    {formatHeightFeetInches(activePlayer.heightInches)} · {activePlayer.weightLbs} lbs ·{' '}
                    WS {formatHeightFeetInches(activePlayer.wingspanInches)}
                  </div>
                  <h3>{activePlayer.name}</h3>
                  <div className="h2k-archetype-line">{activePlayer.archetype}</div>
                </div>
                <div className="h2k-ovr-badge-lg">
                  <span>OVR</span>
                  <strong>{activePlayer.ovr}</strong>
                </div>
              </div>

              <div className="h2k-inspector-tabs">
                {(
                  [
                    ['ATTRIBUTES', '18 ATTRIBUTES'],
                    ['HOT_ZONES', '9 HOT ZONES'],
                    ['BADGES', `BADGES (${Object.keys(activePlayer.badges).length})`],
                    ['BIO', 'BIO & GEAR'],
                  ] as Array<[InspectorTab, string]>
                ).map(([tabId, label]) => (
                  <button
                    key={tabId}
                    type="button"
                    className={`h2k-modal-tab ${inspectorTab === tabId ? 'active' : ''}`}
                    onClick={() => {
                      HybridAudioEngine.playUi('click', eraMode);
                      setInspectorTab(tabId);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="h2k-inspector-body">
                {inspectorTab === 'ATTRIBUTES' && (
                  <div className="h2k-attr-editor-list">
                    {ATTRIBUTE_META.map((meta) => {
                      const val = activePlayer.attributes[meta.key];
                      const barColor =
                        val >= 90 ? '#22c55e' : val >= 80 ? '#f59e0b' : val >= 70 ? '#38bdf8' : '#94a3b8';
                      return (
                        <label key={meta.key} className="h2k-attr-slider-row">
                          <div className="h2k-attr-slider-top">
                            <span>{meta.label}</span>
                            <strong style={{ color: barColor }}>{val}</strong>
                          </div>
                          <input
                            type="range"
                            min={25}
                            max={99}
                            value={val}
                            onChange={(e) => handleAttrChange(meta.key, Number(e.target.value))}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                {inspectorTab === 'HOT_ZONES' && (
                  <div className="h2k-hz-panel">
                    <HotZoneCourtSVG
                      zones={activePlayer.hotZones}
                      interactive
                      onToggleZone={handleHotZoneToggle}
                    />
                    <div className="h2k-hz-quick-row">
                      <button
                        type="button"
                        className="h2k-mini-pill"
                        onClick={() =>
                          commitPlayerPatch(
                            {
                              hotZones: {
                                leftCorner3: 1,
                                leftWing3: 1,
                                topKey3: 1,
                                rightWing3: 1,
                                rightCorner3: 1,
                                leftMid: 1,
                                topMid: 1,
                                rightMid: 1,
                                paint: 1,
                              },
                            },
                            false
                          )
                        }
                      >
                        ALL HOT 🔥
                      </button>
                      <button
                        type="button"
                        className="h2k-mini-pill"
                        onClick={() =>
                          commitPlayerPatch(
                            {
                              hotZones: {
                                leftCorner3: 0,
                                leftWing3: 0,
                                topKey3: 0,
                                rightWing3: 0,
                                rightCorner3: 0,
                                leftMid: 0,
                                topMid: 0,
                                rightMid: 0,
                                paint: 0,
                              },
                            },
                            false
                          )
                        }
                      >
                        RESET NEUTRAL
                      </button>
                    </div>
                  </div>
                )}

                {inspectorTab === 'BADGES' && (
                  <div className="h2k-badges-panel">
                    <div className="h2k-badge-cat-tabs">
                      {BADGE_CATS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`h2k-mini-pill ${badgeCat === cat ? 'active' : ''}`}
                          onClick={() => setBadgeCat(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <p className="h2k-hint-text">
                      Click any badge to cycle tier: None → Bronze → Silver → Gold → HOF → Legend.
                    </p>
                    <div className="h2k-badge-grid">
                      {BADGE_CATALOG.filter((b) => b.category === badgeCat).map((badge) => {
                        const tier = activePlayer.badges[badge.id];
                        return (
                          <button
                            key={badge.id}
                            type="button"
                            className={`h2k-badge-card ${tier ? `tier-${tier.toLowerCase()}` : 'tier-none'}`}
                            onClick={() => handleBadgeCycle(badge.id)}
                          >
                            <div className="h2k-badge-card-top">
                              <strong>{badge.name}</strong>
                              <span className="h2k-badge-tier-tag">{tier ?? 'OFF'}</span>
                            </div>
                            <p>{badge.shortDesc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {inspectorTab === 'BIO' && (
                  <div className="h2k-form-grid">
                    <label className="h2k-form-row">
                      <span>Player Name</span>
                      <input
                        className="h2k-input"
                        value={activePlayer.name}
                        maxLength={28}
                        onChange={(e) => commitPlayerPatch({ name: e.target.value }, false)}
                      />
                    </label>
                    <div className="h2k-two-col-mini">
                      <label className="h2k-form-row">
                        <span>Jersey # (0-99)</span>
                        <input
                          type="number"
                          className="h2k-input"
                          min={0}
                          max={99}
                          value={activePlayer.jerseyNumber}
                          onChange={(e) =>
                            commitPlayerPatch(
                              {
                                jerseyNumber: Math.max(0, Math.min(99, Number(e.target.value) || 0)),
                              },
                              false
                            )
                          }
                        />
                      </label>
                      <label className="h2k-form-row">
                        <span>Position</span>
                        <select
                          className="h2k-select"
                          value={activePlayer.position}
                          onChange={(e) =>
                            commitPlayerPatch({ position: e.target.value as PlayerPosition }, true)
                          }
                        >
                          {POSITIONS.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="h2k-form-row">
                      <span>Height ({formatHeightFeetInches(activePlayer.heightInches)})</span>
                      <input
                        type="range"
                        min={69}
                        max={88}
                        value={activePlayer.heightInches}
                        onChange={(e) =>
                          commitPlayerPatch({ heightInches: Number(e.target.value) }, false)
                        }
                      />
                    </label>
                    <label className="h2k-form-row">
                      <span>Jumpshot Speed ({activePlayer.jumpshotSpeed.toFixed(2)}s)</span>
                      <input
                        type="range"
                        min={0.75}
                        max={1.25}
                        step={0.05}
                        value={activePlayer.jumpshotSpeed}
                        onChange={(e) =>
                          commitPlayerPatch({ jumpshotSpeed: Number(e.target.value) }, false)
                        }
                      />
                    </label>
                    <label className="h2k-form-row">
                      <span>Hairstyle</span>
                      <select
                        className="h2k-select"
                        value={activePlayer.appearance.hairStyle}
                        onChange={(e) =>
                          commitPlayerPatch(
                            {
                              appearance: {
                                ...activePlayer.appearance,
                                hairStyle: e.target.value as HairStyle,
                              },
                            },
                            false
                          )
                        }
                      >
                        {HAIR_OPTIONS.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="h2k-swatch-row">
                      <span>Skin Tone</span>
                      <div className="h2k-swatches">
                        {SKIN_SWATCHES.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            className={`h2k-swatch ${activePlayer.appearance.skinTone === hex ? 'active' : ''}`}
                            style={{ backgroundColor: hex }}
                            aria-label={`Skin tone ${hex}`}
                            onClick={() =>
                              commitPlayerPatch(
                                {
                                  appearance: { ...activePlayer.appearance, skinTone: hex },
                                },
                                false
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <label className="h2k-check-row">
                      <input
                        type="checkbox"
                        checked={activePlayer.appearance.headband}
                        onChange={(e) =>
                          commitPlayerPatch(
                            {
                              appearance: {
                                ...activePlayer.appearance,
                                headband: e.target.checked,
                              },
                            },
                            false
                          )
                        }
                      />
                      <span>Equip Headband</span>
                    </label>

                    {eraFilter !== 'FREE_AGENTS' && activeTeam.roster.length > 5 && (
                      <button
                        type="button"
                        className="h2k-btn-danger"
                        onClick={() => {
                          const res = RosterStore.releaseToFreeAgents(activeTeam.id, activePlayer.id);
                          onNotify(res.message);
                        }}
                      >
                        RELEASE {activePlayer.name.toUpperCase()} TO FREE AGENTS
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
