// ============================================================================
// PART 6 — NBA 2K26 ENHANCED MyTEAM
// Features:
// - Dual-Gender + Dual-Era Card Collection (2K14, 2K26, Legends & WNBA)
// - 8 Card Rarity Tiers (Emerald 82 -> Dark Matter 99)
// - Animated Holographic Pack Market (VC & MTP) with dramatic reveal & SFX
// - Lineup Manager (Starting 5 + 3 Bench)
// - NBA 2K26 Game Changer Cards (5 consumable power-ups equipped pre-tip-off)
// - Playable Domination 5v5 (30 NBA Teams) & Triple Threat 3v3 (First to 21)
// ============================================================================

import React, { useMemo, useState } from 'react';
import { RosterStore } from '../hybrid/rosterStore';
import { useUltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { MatchDifficulty, UIEraMode } from '../hybrid/types';
import {
  ModesStore,
  myTeamCardsToProfiles,
  useModesStore,
} from './modesStore';
import {
  GAME_CHANGER_CATALOG,
  MYTEAM_PACKS,
  MYTEAM_TIERS,
  type MyTeamCard,
  type MyTeamPackId,
} from './modesTypes';
import './modesHud.css';

export interface MyTeamHubProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

type MyTeamTab = 'LINEUP' | 'PACKS' | 'GAME_CHANGERS' | 'DOMINATION' | 'TRIPLE_THREAT';

function reduceDifficultyOneTier(d: MatchDifficulty): MatchDifficulty {
  if (d === 'Hall of Fame') return 'Superstar';
  if (d === 'Superstar') return 'All-Star';
  if (d === 'All-Star') return 'Pro';
  return 'Rookie';
}

export const MyTeamHub: React.FC<MyTeamHubProps> = ({
  eraMode,
  onBack,
  onNotify,
}) => {
  const hybridSave = useUltimateHybridStore();
  const modes = useModesStore();
  const mt = modes.myTeam;

  const [tab, setTab] = useState<MyTeamTab>('LINEUP');
  const [eraFilter, setEraFilter] = useState<'ALL' | '2K14' | '2K26' | 'LEGEND' | 'WNBA'>('ALL');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [lastPulledCards, setLastPulledCards] = useState<MyTeamCard[]>([]);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [domEra, setDomEra] = useState<'2K26' | '2K14'>('2K26');

  const cardById = useMemo(() => {
    const map: Record<string, MyTeamCard> = {};
    mt.ownedCards.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [mt.ownedCards]);

  const starters = useMemo(
    () => mt.startingFiveIds.map((id) => cardById[id]).filter(Boolean),
    [mt.startingFiveIds, cardById]
  );
  const bench = useMemo(
    () => mt.benchIds.map((id) => cardById[id]).filter(Boolean),
    [mt.benchIds, cardById]
  );

  const filteredCollection = useMemo(() => {
    const base =
      eraFilter === 'ALL'
        ? mt.ownedCards
        : mt.ownedCards.filter((c) => c.eraLabel === eraFilter);
    return [...base].sort((a, b) => b.ovr - a.ovr);
  }, [mt.ownedCards, eraFilter]);

  const dominationTeams = useMemo(
    () => RosterStore.getAllTeams().filter((t) => t.era === domEra),
    [domEra]
  );

  const squadOvr = useMemo(() => {
    if (starters.length === 0) return 85;
    return Math.round(starters.reduce((s, c) => s + c.ovr, 0) / starters.length);
  }, [starters]);

  const equippedGc = GAME_CHANGER_CATALOG.find((g) => g.id === mt.equippedGameChangerId) ?? null;

  const handleRipPack = (packId: MyTeamPackId, currency: 'VC' | 'MTP') => {
    const res = ModesStore.openMyTeamPack(packId, currency);
    if (!res.ok) {
      onNotify(res.message);
      return;
    }
    HybridAudioEngine.playGreenRelease();
    HybridAudioEngine.playCrowdRoar(0.8);
    setLastPulledCards(res.cards);
    const rev: Record<string, boolean> = {};
    res.cards.forEach((c) => {
      rev[c.id] = false;
    });
    setRevealedIds(rev);
    onNotify(res.message);
  };

  const revealAllPulled = () => {
    const rev: Record<string, boolean> = {};
    lastPulledCards.forEach((c) => {
      rev[c.id] = true;
    });
    setRevealedIds(rev);
    HybridAudioEngine.playUi('confirm', eraMode);
  };

  const launchDomination = (oppTeamId: string, oppName: string) => {
    const activeGc =
      mt.equippedGameChangerId && (mt.gameChangerCounts[mt.equippedGameChangerId] ?? 0) > 0
        ? mt.equippedGameChangerId
        : null;
    const baseDiff: MatchDifficulty = 'All-Star';
    const diff = activeGc === 'GC_DIFFICULTY_REDUCER' ? reduceDifficultyOneTier(baseDiff) : baseDiff;
    const fullLineup = myTeamCardsToProfiles([...starters, ...bench]);
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'MYTEAM_DOMINATION',
      title: `MyTEAM Domination vs ${oppName}`,
      subtitle: activeGc ? `Game Changer Active: ${equippedGc?.name}` : '5v5 Domination · Win by 12+ for 3★',
      returnScreen: 'MYTEAM_HUB',
      matchPatch: {
        homeTeamId: '2k26_okc',
        awayTeamId: oppTeamId,
        venue: 'ARENA_2K26',
        playersPerSide: 5,
        targetScore: null,
        quarterLengthMin: 5,
        difficulty: diff,
        sideControl: 'HOME',
        modeLabel: `MyTEAM Domination vs ${oppName}`,
      },
      customHomeRoster: fullLineup.length >= 5 ? fullLineup : undefined,
      instantTakeover: activeGc === 'GC_HOT_START_TAKEOVER',
      myTeamDominationTeamId: oppTeamId,
      myTeamGameChangerId: activeGc,
      objectiveBanner: `Domination 5v5 vs ${oppName} · Win (+1★), Win by 6+ (+2★), Win by 12+ (+3★)`,
      baseVcReward: 1000,
      baseMtpReward: 1600,
      baseRepReward: 420,
    });
  };

  const launchTripleThreat = () => {
    const activeGc =
      mt.equippedGameChangerId && (mt.gameChangerCounts[mt.equippedGameChangerId] ?? 0) > 0
        ? mt.equippedGameChangerId
        : null;
    const baseDiff: MatchDifficulty = 'All-Star';
    const diff = activeGc === 'GC_DIFFICULTY_REDUCER' ? reduceDifficultyOneTier(baseDiff) : baseDiff;
    const trio = myTeamCardsToProfiles(starters.slice(0, 3));
    const randomTeams = RosterStore.getAllTeams().filter((t) => t.era === 'LEGENDS' || t.era === 'WNBA');
    const opp = randomTeams[mt.tripleThreatWins % Math.max(1, randomTeams.length)];
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'MYTEAM_TRIPLE_THREAT',
      title: `MyTEAM Triple Threat 3v3 · Win #${mt.tripleThreatWins + 1}`,
      subtitle: `Your Top 3 Cards vs ${opp.city} ${opp.name}`,
      returnScreen: 'MYTEAM_HUB',
      matchPatch: {
        homeTeamId: '2k26_okc',
        awayTeamId: opp.id,
        venue: 'SKYLINE_PARK',
        playersPerSide: 3,
        targetScore: 21,
        quarterLengthMin: 5,
        difficulty: diff,
        sideControl: 'HOME',
        modeLabel: 'MyTEAM Triple Threat 3v3',
      },
      customHomeRoster: trio.length >= 3 ? trio : undefined,
      instantTakeover: activeGc === 'GC_HOT_START_TAKEOVER',
      myTeamGameChangerId: activeGc,
      objectiveBanner: `Triple Threat 3v3 · First to 21 · Dual-Era & WNBA Squad Live!`,
      baseVcReward: 850,
      baseMtpReward: 1250,
      baseRepReward: 350,
    });
  };

  return (
    <div className="h2k-mode-root">
      <header className="h2k-mode-topbar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title">NBA 2K26 MyTEAM · DUAL-ERA &amp; WNBA</h2>
            <div className="h2k-mode-submeta">
              Squad OVR {squadOvr} · {mt.ownedCards.length} Cards · TT Wins {mt.tripleThreatWins} ·{' '}
              {equippedGc ? `Game Changer: ${equippedGc.name}` : 'No Game Changer Equipped'}
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <div className="h2k-wallet-strip">
            <span className="h2k-wallet-vc">VC {hybridSave.currencies.vc.toLocaleString()}</span>
            <span className="h2k-wallet-mtp">MTP {hybridSave.currencies.mtp.toLocaleString()}</span>
          </div>
        </div>
      </header>

      <div className="h2k-mode-tabs">
        {(
          [
            { id: 'LINEUP', label: 'Lineup & Collection' },
            { id: 'PACKS', label: 'Holographic Pack Market' },
            { id: 'GAME_CHANGERS', label: '2K26 Game Changer Cards' },
            { id: 'DOMINATION', label: 'Domination 5v5 (30 Teams)' },
            { id: 'TRIPLE_THREAT', label: 'Triple Threat 3v3' },
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
        {/* TAB 1: LINEUP MANAGER + COLLECTION */}
        {tab === 'LINEUP' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="h2k-card">
              <div className="h2k-section-head">
                <h3>Starting 5 &amp; 3-Man Bench</h3>
                <span className="h2k-muted">
                  {selectedCardId
                    ? 'Tap any Starting 5 or Bench slot below to assign your selected card'
                    : 'Click any card in your Collection below, then tap a slot to swap'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {['PG', 'SG', 'SF', 'PF', 'C'].map((pos, idx) => {
                  const card = starters[idx];
                  const tier = card ? MYTEAM_TIERS[card.tier] : MYTEAM_TIERS.EMERALD;
                  return (
                    <div
                      key={`st_${idx}`}
                      className="h2k-mt-card"
                      style={{ '--tier-color': tier.color, cursor: 'pointer' } as React.CSSProperties}
                      onClick={() => {
                        if (selectedCardId) {
                          ModesStore.setMyTeamLineupSlot('STARTER', idx, selectedCardId);
                          setSelectedCardId(null);
                          onNotify(`Assigned card to Starting ${pos}!`);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>
                          START {pos} · {tier.label}
                        </span>
                        <span className="h2k-mt-ovr" style={{ color: tier.glow }}>
                          {card?.ovr ?? '--'}
                        </span>
                      </div>
                      <strong style={{ fontSize: 13 }}>{card?.name ?? 'Empty'}</strong>
                      <div className="h2k-muted h2k-tabular">
                        {card ? `${card.eraLabel} · ${card.teamAbbr} · 3PT ${card.threePt} · DNK ${card.drivingDunk}` : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h2k-grid-3">
                {[0, 1, 2].map((bIdx) => {
                  const card = bench[bIdx];
                  const tier = card ? MYTEAM_TIERS[card.tier] : MYTEAM_TIERS.EMERALD;
                  return (
                    <div
                      key={`bn_${bIdx}`}
                      className="h2k-mt-card"
                      style={{ '--tier-color': tier.color, cursor: 'pointer' } as React.CSSProperties}
                      onClick={() => {
                        if (selectedCardId) {
                          ModesStore.setMyTeamLineupSlot('BENCH', bIdx, selectedCardId);
                          setSelectedCardId(null);
                          onNotify(`Assigned card to Bench Slot #${bIdx + 1}!`);
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>
                          BENCH #{bIdx + 1} · {tier.label}
                        </span>
                        <strong className="h2k-tabular" style={{ fontSize: 18, color: tier.glow }}>
                          {card?.ovr ?? '--'}
                        </strong>
                      </div>
                      <strong style={{ fontSize: 13 }}>{card?.name ?? 'Empty'}</strong>
                      <div className="h2k-muted">{card ? `${card.eraLabel} · ${card.position} · ${card.teamAbbr}` : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h2k-card">
              <div className="h2k-section-head">
                <h3>Card Collection ({filteredCollection.length})</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['ALL', '2K14', '2K26', 'LEGEND', 'WNBA'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={`h2k-mode-btn ${eraFilter === f ? 'primary' : ''}`}
                      style={{ minHeight: 30, padding: '0 10px' }}
                      onClick={() => setEraFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h2k-grid-4">
                {filteredCollection.map((card) => {
                  const tier = MYTEAM_TIERS[card.tier];
                  const isSel = selectedCardId === card.id;
                  return (
                    <div
                      key={card.id}
                      className="h2k-mt-card"
                      style={{
                        '--tier-color': isSel ? '#fbbf24' : tier.color,
                        cursor: 'pointer',
                        boxShadow: isSel ? '0 0 0 2px #fbbf24' : undefined,
                      } as React.CSSProperties}
                      onClick={() => setSelectedCardId(isSel ? null : card.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: tier.color }}>
                          {tier.label} · {card.eraLabel}
                        </span>
                        <span className="h2k-mt-ovr" style={{ color: tier.glow }}>
                          {card.ovr}
                        </span>
                      </div>
                      <strong style={{ fontSize: 13 }}>{card.name}</strong>
                      <div className="h2k-muted h2k-tabular">
                        {card.position} · {card.teamAbbr} · 3PT {card.threePt} · DEF {card.defense}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANIMATED HOLOGRAPHIC PACK MARKET */}
        {tab === 'PACKS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="h2k-grid-3">
              {MYTEAM_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="h2k-card"
                  style={{ borderColor: pack.accent, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: pack.accent }}>
                      HOLOGRAPHIC 3-CARD PACK
                    </div>
                    <h3 style={{ margin: '4px 0', fontFamily: 'Oswald, sans-serif', fontSize: 21 }}>
                      {pack.name}
                    </h3>
                    <p className="h2k-muted" style={{ margin: 0 }}>{pack.subtitle}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="h2k-mode-btn primary"
                      style={{ flex: 1 }}
                      onClick={() => handleRipPack(pack.id, 'VC')}
                    >
                      Rip · {pack.priceVc.toLocaleString()} VC
                    </button>
                    <button
                      type="button"
                      className="h2k-mode-btn cyan"
                      style={{ flex: 1 }}
                      onClick={() => handleRipPack(pack.id, 'MTP')}
                    >
                      Rip · {pack.priceMtp.toLocaleString()} MTP
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {lastPulledCards.length > 0 && (
              <div className="h2k-card">
                <div className="h2k-section-head">
                  <h3>Pack Opening Stage — Click Cards to Flip!</h3>
                  <button type="button" className="h2k-mode-btn primary" onClick={revealAllPulled}>
                    Flip All Cards
                  </button>
                </div>
                <div className="h2k-grid-3">
                  {lastPulledCards.map((card) => {
                    const flipped = revealedIds[card.id];
                    const tier = MYTEAM_TIERS[card.tier];
                    return (
                      <div
                        key={card.id}
                        className={`h2k-mt-card ${flipped ? 'holo-reveal' : ''}`}
                        style={{
                          '--tier-color': flipped ? tier.color : '#f59e0b',
                          minHeight: 150,
                          justifyContent: 'center',
                          cursor: 'pointer',
                        } as React.CSSProperties}
                        onClick={() => {
                          setRevealedIds((prev) => ({ ...prev, [card.id]: true }));
                          HybridAudioEngine.playGreenRelease();
                        }}
                      >
                        {!flipped ? (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 26 }}>✨</div>
                            <strong style={{ color: '#fcd34d' }}>TAP TO FLIP CARD</strong>
                            <div className="h2k-muted">Tier Glow: {tier.label}</div>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12, fontWeight: 800, color: tier.color }}>
                                {tier.label.toUpperCase()} · {card.eraLabel}
                              </span>
                              <span className="h2k-mt-ovr" style={{ color: tier.glow }}>
                                {card.ovr}
                              </span>
                            </div>
                            <strong style={{ fontSize: 16 }}>{card.name}</strong>
                            <div className="h2k-muted h2k-tabular">
                              {card.position} · #{card.jerseyNumber} {card.teamAbbr} · 3PT {card.threePt} · DNK {card.drivingDunk}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NBA 2K26 GAME CHANGER CARDS */}
        {tab === 'GAME_CHANGERS' && (
          <div className="h2k-grid-3">
            {GAME_CHANGER_CATALOG.map((gc) => {
              const count = mt.gameChangerCounts[gc.id] ?? 0;
              const isEquipped = mt.equippedGameChangerId === gc.id;
              return (
                <div
                  key={gc.id}
                  className="h2k-card"
                  style={{
                    borderColor: isEquipped ? gc.accent : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: gc.accent, fontSize: 14 }}>{gc.name}</strong>
                      <span className="h2k-tabular" style={{ fontSize: 12, fontWeight: 700 }}>
                        Owned: x{count}
                      </span>
                    </div>
                    <p className="h2k-muted" style={{ marginTop: 6 }}>{gc.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${isEquipped ? 'emerald' : 'primary'}`}
                      style={{ flex: 1 }}
                      disabled={count <= 0}
                      onClick={() => {
                        ModesStore.equipGameChanger(isEquipped ? null : gc.id);
                        onNotify(isEquipped ? 'Unequipped Game Changer.' : `Equipped ${gc.name}!`);
                      }}
                    >
                      {isEquipped ? '✓ Equipped' : 'Equip'}
                    </button>
                    <button
                      type="button"
                      className="h2k-mode-btn cyan"
                      onClick={() => {
                        const res = ModesStore.buyGameChanger(gc.id);
                        onNotify(res.message);
                      }}
                    >
                      Buy ({gc.costMtp} MTP)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: DOMINATION 5V5 (ALL 30 NBA TEAMS) */}
        {tab === 'DOMINATION' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`h2k-mode-btn ${domEra === '2K26' ? 'primary' : ''}`}
                  onClick={() => setDomEra('2K26')}
                >
                  2025-26 NBA Domination (30 Teams)
                </button>
                <button
                  type="button"
                  className={`h2k-mode-btn ${domEra === '2K14' ? 'crimson' : ''}`}
                  onClick={() => setDomEra('2K14')}
                >
                  2013-14 Throwback Domination (30 Teams)
                </button>
              </div>
              <span className="h2k-muted h2k-tabular">
                Total Domination Stars:{' '}
                {Object.values(mt.dominationStars).reduce((s, n) => s + n, 0)} ★
              </span>
            </div>

            <div className="h2k-grid-4">
              {dominationTeams.map((team) => {
                const stars = mt.dominationStars[team.id] ?? 0;
                return (
                  <div key={team.id} className="h2k-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>
                        {team.abbr} · {team.ovr} OVR
                      </strong>
                      <span style={{ color: '#fbbf24' }}>
                        {'★'.repeat(stars)}
                        {'☆'.repeat(3 - stars)}
                      </span>
                    </div>
                    <div className="h2k-muted" style={{ margin: '4px 0 10px' }}>
                      {team.city} {team.name}
                    </div>
                    <button
                      type="button"
                      className="h2k-mode-btn primary"
                      style={{ width: '100%' }}
                      onClick={() => launchDomination(team.id, `${team.city} ${team.name}`)}
                    >
                      Play 5v5 Domination
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: TRIPLE THREAT 3V3 */}
        {tab === 'TRIPLE_THREAT' && (
          <div className="h2k-card" style={{ maxWidth: 680 }}>
            <div className="h2k-section-head">
              <h3>Triple Threat 3v3 · First to 21</h3>
              <span className="h2k-wallet-vc h2k-tabular">Wins: {mt.tripleThreatWins}</span>
            </div>
            <p className="h2k-muted">
              Your Top 3 Starting Cards ({starters.slice(0, 3).map((c) => c.name).join(', ')}) hit the rooftop courts in a fast-paced 3v3 first-to-21 showdown against Legends &amp; WNBA Superstars.
            </p>
            <button
              type="button"
              className="h2k-mode-btn primary"
              style={{ width: '100%', marginTop: 10 }}
              onClick={launchTripleThreat}
            >
              Tip Off Triple Threat 3v3
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
