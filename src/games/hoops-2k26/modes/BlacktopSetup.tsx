// ============================================================================
// PART 6 — BLACKTOP SETUP (1v1 / 2v2 / 3v3 / 5v5)
// Draft ANY players from all 72 teams (2K14, 2K26, Legends, EuroLeague, WNBA)
// PLUS all 5 persistent MyPLAYER builds! Pick Venue, Target Score (11/21),
// Scoring (1s & 2s / 2s & 3s), and Make-It-Take-It rules.
// ============================================================================

import React, { useMemo, useState } from 'react';
import { RosterStore, useRosterStore } from '../hybrid/rosterStore';
import { UltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { MatchVenueId, UIEraMode } from '../hybrid/types';
import type { PlayerProfile } from '../hybrid/rosterTypes';
import {
  buildToPlayerProfile,
  ModesStore,
  useModesStore,
} from './modesStore';
import './modesHud.css';

export interface BlacktopSetupProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

const BLACKTOP_VENUES: Array<{ id: MatchVenueId; label: string }> = [
  { id: 'BLACKTOP_CAGE', label: 'Blacktop Cage' },
  { id: 'SKYLINE_PARK', label: 'Skyline Park (2K26)' },
  { id: 'RIVET_CITY', label: 'Rivet City (2K16)' },
  { id: 'SUNSET_BEACH', label: 'Sunset Beach (2K16)' },
  { id: 'OLD_TOWN', label: 'Old Town (2K16)' },
];

type PoolFilter = 'MYPLAYER' | 'ALL' | '2K26' | '2K14' | 'LEGENDS' | 'EUROLEAGUE' | 'WNBA';

interface DraftPoolItem {
  profile: PlayerProfile;
  sourceLabel: string;
  pool: PoolFilter;
}

export const BlacktopSetup: React.FC<BlacktopSetupProps> = ({
  eraMode,
  onBack,
  onNotify,
}) => {
  const rosterSnap = useRosterStore();
  const modes = useModesStore();

  const [playersPerSide, setPlayersPerSide] = useState<1 | 2 | 3 | 5>(3);
  const [venue, setVenue] = useState<MatchVenueId>('BLACKTOP_CAGE');
  const [targetScore, setTargetScore] = useState<11 | 21>(21);
  const [scoringMode, setScoringMode] = useState<'1S_2S' | '2S_3S'>('1S_2S');
  const [makeItTakeIt, setMakeItTakeIt] = useState(true);

  const [poolFilter, setPoolFilter] = useState<PoolFilter>('ALL');
  const [search, setSearch] = useState('');
  const [draftSide, setDraftSide] = useState<'HOME' | 'AWAY'>('HOME');

  const fullPool = useMemo<DraftPoolItem[]>(() => {
    const items: DraftPoolItem[] = [];
    // Include all 5 custom MyPLAYER builds at top of draft pool
    modes.buildSlots.forEach((b) => {
      items.push({
        profile: buildToPlayerProfile(b),
        sourceLabel: `MyPLAYER #${b.slotIndex + 1}`,
        pool: 'MYPLAYER',
      });
    });
    rosterSnap.teams.forEach((t) => {
      t.roster.slice(0, 6).forEach((p) => {
        items.push({
          profile: p,
          sourceLabel: `${t.abbr} (${t.era.replace('_', ' ')})`,
          pool: t.era as PoolFilter,
        });
      });
    });
    return items;
  }, [modes.buildSlots, rosterSnap.teams]);

  const [homeDraft, setHomeDraft] = useState<PlayerProfile[]>(() => {
    const mp = buildToPlayerProfile(ModesStore.getActiveBuild());
    const okc = RosterStore.getTeamById('2k26_okc').roster;
    return [mp, okc[0], okc[1], okc[2], okc[3]];
  });

  const [awayDraft, setAwayDraft] = useState<PlayerProfile[]>(() => {
    const mia = RosterStore.getTeamById('2k14_mia').roster;
    return [mia[0], mia[1], mia[2], mia[3], mia[4]];
  });

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fullPool
      .filter((item) => {
        if (poolFilter !== 'ALL' && item.pool !== poolFilter) return false;
        if (!q) return true;
        return (
          item.profile.name.toLowerCase().includes(q) ||
          item.sourceLabel.toLowerCase().includes(q) ||
          item.profile.position.toLowerCase() === q
        );
      })
      .sort((a, b) => b.profile.ovr - a.profile.ovr)
      .slice(0, 48);
  }, [fullPool, poolFilter, search]);

  const draftPlayer = (p: PlayerProfile) => {
    HybridAudioEngine.playUi('click', eraMode);
    if (draftSide === 'HOME') {
      setHomeDraft((prev) => {
        const next = [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 5);
        return next;
      });
      onNotify(`Drafted ${p.name} (${p.ovr}) to Squad A!`);
    } else {
      setAwayDraft((prev) => {
        const next = [p, ...prev.filter((x) => x.id !== p.id)].slice(0, 5);
        return next;
      });
      onNotify(`Drafted ${p.name} (${p.ovr}) to Squad B!`);
    }
  };

  const handleTipOffBlacktop = () => {
    HybridAudioEngine.playUi('confirm', eraMode);
    UltimateHybridStore.updateSettings('gameplay', {
      blacktopScoring: scoringMode,
      blacktopMakeItTakeIt: makeItTakeIt,
    });
    const activeHome = homeDraft.slice(0, playersPerSide);
    const activeAway = awayDraft.slice(0, playersPerSide);
    ModesStore.launchModeMatch({
      kind: 'BLACKTOP_CUSTOM',
      title: `Blacktop ${playersPerSide}v${playersPerSide} · First to ${targetScore}`,
      subtitle: `${BLACKTOP_VENUES.find((v) => v.id === venue)?.label ?? 'Blacktop'} · ${
        scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s'
      }${makeItTakeIt ? ' · Make-It-Take-It' : ''}`,
      returnScreen: 'BLACKTOP_SETUP',
      matchPatch: {
        homeTeamId: '2k26_okc',
        awayTeamId: '2k14_mia',
        venue,
        playersPerSide,
        targetScore,
        quarterLengthMin: 5,
        difficulty: 'All-Star',
        sideControl: 'HOME',
        modeLabel: `Blacktop ${playersPerSide}v${playersPerSide}`,
      },
      customHomeRoster: activeHome,
      customAwayRoster: activeAway,
      twoPointValue: scoringMode === '1S_2S' ? 1 : 2,
      threePointValue: scoringMode === '1S_2S' ? 2 : 3,
      makeItTakeIt,
      objectiveBanner: `Blacktop ${playersPerSide}v${playersPerSide} · First to ${targetScore} (${
        scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s'
      })`,
      baseVcReward: 750,
      baseRepReward: 280,
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
            <h2 className="h2k-mode-title">BLACKTOP CUSTOM DRAFT · 72 TEAMS + MyPLAYER</h2>
            <div className="h2k-mode-submeta">
              {playersPerSide}v{playersPerSide} · First to {targetScore} · {scoringMode === '1S_2S' ? '1s & 2s' : '2s & 3s'} ·{' '}
              {makeItTakeIt ? 'Make-It-Take-It ON' : 'Alternating Possession'}
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <button type="button" className="h2k-mode-btn primary" onClick={handleTipOffBlacktop}>
            🏀 Launch Blacktop 3D Match
          </button>
        </div>
      </header>

      <div className="h2k-mode-scroll">
        {/* Rules & Venue Bar */}
        <div className="h2k-card" style={{ marginBottom: 16 }}>
          <div className="h2k-grid-4">
            <div>
              <div className="h2k-muted" style={{ marginBottom: 6 }}>Format</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {([1, 2, 3, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`h2k-mode-btn ${playersPerSide === n ? 'primary' : ''}`}
                    style={{ flex: 1, padding: '0 6px' }}
                    onClick={() => setPlayersPerSide(n)}
                  >
                    {n}v{n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="h2k-muted" style={{ marginBottom: 6 }}>Street Venue</div>
              <select
                className="h2k-select"
                style={{ width: '100%', minHeight: 38 }}
                value={venue}
                onChange={(e) => setVenue(e.target.value as MatchVenueId)}
              >
                {BLACKTOP_VENUES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="h2k-muted" style={{ marginBottom: 6 }}>Target &amp; Scoring</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className={`h2k-mode-btn ${targetScore === 11 ? 'primary' : ''}`}
                  style={{ flex: 1, padding: '0 6px' }}
                  onClick={() => setTargetScore(11)}
                >
                  To 11
                </button>
                <button
                  type="button"
                  className={`h2k-mode-btn ${targetScore === 21 ? 'primary' : ''}`}
                  style={{ flex: 1, padding: '0 6px' }}
                  onClick={() => setTargetScore(21)}
                >
                  To 21
                </button>
                <button
                  type="button"
                  className="h2k-mode-btn cyan"
                  style={{ flex: 1, padding: '0 6px' }}
                  onClick={() => setScoringMode((m) => (m === '1S_2S' ? '2S_3S' : '1S_2S'))}
                >
                  {scoringMode === '1S_2S' ? '1s/2s' : '2s/3s'}
                </button>
              </div>
            </div>

            <div>
              <div className="h2k-muted" style={{ marginBottom: 6 }}>Possession Rule</div>
              <button
                type="button"
                className={`h2k-mode-btn ${makeItTakeIt ? 'emerald' : ''}`}
                style={{ width: '100%' }}
                onClick={() => setMakeItTakeIt((v) => !v)}
              >
                Make-It-Take-It: {makeItTakeIt ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Squad A vs Squad B Active Lineups */}
        <div className="h2k-grid-2" style={{ marginBottom: 16 }}>
          <div className="h2k-card" style={{ borderColor: draftSide === 'HOME' ? '#f59e0b' : undefined }}>
            <div className="h2k-section-head">
              <h3>Your Squad (Home · {playersPerSide} Active)</h3>
              <button
                type="button"
                className={`h2k-mode-btn ${draftSide === 'HOME' ? 'primary' : ''}`}
                style={{ minHeight: 30 }}
                onClick={() => setDraftSide('HOME')}
              >
                {draftSide === 'HOME' ? '✓ Drafting Here' : 'Draft to Home'}
              </button>
            </div>
            {homeDraft.slice(0, playersPerSide).map((p, idx) => (
              <div
                key={`hd_${p.id}_${idx}`}
                className="h2k-tabular"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 13,
                }}
              >
                <span>
                  #{idx + 1} <strong>{p.name}</strong> ({p.position})
                </span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{p.ovr} OVR</span>
              </div>
            ))}
          </div>

          <div className="h2k-card" style={{ borderColor: draftSide === 'AWAY' ? '#06b6d4' : undefined }}>
            <div className="h2k-section-head">
              <h3>Opponent Squad (Away · {playersPerSide} Active)</h3>
              <button
                type="button"
                className={`h2k-mode-btn ${draftSide === 'AWAY' ? 'cyan' : ''}`}
                style={{ minHeight: 30 }}
                onClick={() => setDraftSide('AWAY')}
              >
                {draftSide === 'AWAY' ? '✓ Drafting Here' : 'Draft to Away'}
              </button>
            </div>
            {awayDraft.slice(0, playersPerSide).map((p, idx) => (
              <div
                key={`ad_${p.id}_${idx}`}
                className="h2k-tabular"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  fontSize: 13,
                }}
              >
                <span>
                  #{idx + 1} <strong>{p.name}</strong> ({p.position})
                </span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{p.ovr} OVR</span>
              </div>
            ))}
          </div>
        </div>

        {/* Open 72-Team + MyPLAYER Draft Pool */}
        <div className="h2k-card">
          <div className="h2k-section-head" style={{ flexWrap: 'wrap' }}>
            <h3>Open Player Draft Pool (Click to Add to {draftSide === 'HOME' ? 'Your Squad' : 'Opponent Squad'})</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="h2k-input"
                placeholder="Search player or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 190, minHeight: 34 }}
              />
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'MYPLAYER', label: 'MyPLAYER (5)' },
                  { id: '2K26', label: '2K26' },
                  { id: '2K14', label: '2K14' },
                  { id: 'LEGENDS', label: 'Legends' },
                  { id: 'EUROLEAGUE', label: 'Euro' },
                  { id: 'WNBA', label: 'WNBA' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`h2k-mode-btn ${poolFilter === f.id ? 'primary' : ''}`}
                  style={{ minHeight: 34, padding: '0 10px' }}
                  onClick={() => setPoolFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h2k-grid-4">
            {filteredPool.map((item) => (
              <button
                key={`${item.pool}_${item.profile.id}`}
                type="button"
                className="h2k-card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  padding: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
                onClick={() => draftPlayer(item.profile)}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 12, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.profile.name}
                  </strong>
                  <div className="h2k-muted">
                    {item.profile.position} · {item.sourceLabel}
                  </div>
                </div>
                <strong className="h2k-tabular" style={{ color: '#fbbf24', fontSize: 15 }}>
                  {item.profile.ovr}
                </strong>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
