import React, { useEffect, useMemo, useState } from 'react';
import { MenuBackground3D } from './MenuBackground3D';
import { PlayNowSetup } from './PlayNowSetup';
import { RosterManager } from './RosterManager';
import { CreateAPlayer } from './CreateAPlayer';
import { LiveCourtStage } from '../engine/LiveCourtStage';
import { HybridModals, type QuickDrawerKind } from './HybridModals';
import { TheCityHub } from '../modes/TheCityHub';
import { MyPlayerBuilder } from '../modes/MyPlayerBuilder';
import { PathToGreatness } from '../modes/PathToGreatness';
import { MyTeamHub } from '../modes/MyTeamHub';
import { MyNbaAssociation } from '../modes/MyNbaAssociation';
import { BlacktopSetup } from '../modes/BlacktopSetup';
import { TrainingCamp } from '../modes/TrainingCamp';
import { ModesStore } from '../modes/modesStore';
import { SettingsModal } from '../part7/SettingsModal';
import { CustomHudEditor } from '../part7/CustomHudEditor';
import { HybridAudioEngine, type HybridBeatsSnapshot } from './audioEngine';
import { UltimateHybridStore, useUltimateHybridStore } from './store';
import {
  RosterStore,
  toHoops2K26TeamOverride,
  useRosterStore,
} from './rosterStore';
import {
  VENUE_OPTIONS,
  getHybridTeamById,
  TeamEmblemSVG,
} from './teamCatalog';
import type {
  ActiveMatchConfig,
  ActiveScreen,
  ChallengeCategory,
  HybridTeamSummary,
  SettingsTabId,
  UIEraMode,
} from './types';
import type { HoopsMatchContext } from '../hoops2k26Catalog';
import { persistArenaSelections, persistHoops2K26, playerState } from '../../../core/storage';
import './hybridShell.css';

export interface UltimateHybridShellProps {
  onBackToArcade: () => void;
  onLaunchCourt: () => void;
  onOpenCity3D: () => void;
  onOpenClassicStudio: () => void;
}

const NEXTGEN_TABS: Array<{ id: ActiveScreen; label: string }> = [
  { id: 'MAIN_MENU', label: 'HOME' },
  { id: 'PLAY_NOW_SETUP', label: 'PLAY NOW' },
  { id: 'MYCAREER_HUB', label: 'MyCAREER / THE CITY' },
  { id: 'MYTEAM_HUB', label: 'MyTEAM' },
  { id: 'MYNBA_HUB', label: 'MyNBA ERAS' },
  { id: 'THE_W_HUB', label: 'THE W' },
  { id: 'ROSTER_MANAGER', label: 'ROSTERS' },
  { id: 'SETTINGS', label: 'FEATURES' },
];

const NEXTGEN_SIDE_CARDS: Array<{
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
  target: ActiveScreen;
  venuePreset?: ActiveMatchConfig['venue'];
}> = [
  {
    id: 'quick_play',
    title: 'QUICK PLAY NOW',
    subtitle: '72 Teams · 2K14 vs 2K26 Cross-Era Matchup',
    tag: 'EXHIBITION',
    accent: '#e11d48',
    target: 'PLAY_NOW_SETUP',
  },
  {
    id: 'street_kings',
    title: 'STREET KINGS BOSSES',
    subtitle: 'Skyline Park & Street Kings 3v3 to 21',
    tag: '2K26 CITY',
    accent: '#f59e0b',
    target: 'BLACKTOP_SETUP',
    venuePreset: 'STREET_KINGS',
  },
  {
    id: 'myteam_gc',
    title: 'MyTEAM GAME CHANGER',
    subtitle: 'MTP Rewards, Challenges & Cross-Era Cards',
    tag: 'MyTEAM',
    accent: '#a855f7',
    target: 'MYTEAM_HUB',
  },
  {
    id: 'ptg_legacy',
    title: '2K14 PATH TO GREATNESS',
    subtitle: "LeBron #6 Heat '14 Finals Legacy Showcase",
    tag: '2K14 LEGACY',
    accent: '#38bdf8',
    target: 'PATH_TO_GREATNESS',
  },
];

const METRO_2K14_TILES: Array<{
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: string;
  target: ActiveScreen;
  poolPreset?: 'EUROLEAGUE_14' | 'LEGENDS';
}> = [
  {
    id: 'ptg',
    title: 'LeBron: Path to Greatness',
    subtitle: '2013-14 Heat Dynasty & Fantastic Journey',
    tag: '2K14 SIGNATURE',
    accent: '#e11d48',
    target: 'PATH_TO_GREATNESS',
  },
  {
    id: 'mycareer',
    title: 'MyCAREER & The City',
    subtitle: 'Rookie Showcase + Walkable 3D City',
    tag: 'CAREER',
    accent: '#f59e0b',
    target: 'MYCAREER_HUB',
  },
  {
    id: 'assoc',
    title: 'The Association / MyGM',
    subtitle: 'All 30 2K14 & 30 2K26 NBA Franchises',
    tag: 'FRANCHISE',
    accent: '#38bdf8',
    target: 'MYNBA_HUB',
  },
  {
    id: 'myteam',
    title: 'MyTEAM',
    subtitle: 'Cross-Era Card Collector & MTP',
    tag: 'COLLECTOR',
    accent: '#a855f7',
    target: 'MYTEAM_HUB',
  },
  {
    id: 'blacktop',
    title: 'Blacktop / Training Camp',
    subtitle: 'Skyline Park, Rivet City & Blacktop Cage',
    tag: 'STREET',
    accent: '#fb923c',
    target: 'BLACKTOP_SETUP',
  },
  {
    id: 'euro',
    title: 'EuroLeague / Classic Legends',
    subtitle: 'Real Madrid, Barcelona, CSKA, Olympiacos & 4 Legends',
    tag: 'WORLD',
    accent: '#22c55e',
    target: 'PLAY_NOW_SETUP',
    poolPreset: 'EUROLEAGUE_14',
  },
];

const TICKER_HEADLINES = [
  "LeBron James (#6, 99 OVR) leads Miami Heat '14 in NBA 2K14 Finals Spotlight",
  "Shai Gilgeous-Alexander (98 OVR) & OKC Thunder '26 headline NBA 2K26 Skyline Park",
  '72 Complete Teams · 576+ Authentic Players now live in Manage Roster & Create-A-Player',
  "Classic Legends ('96 Bulls, '01 Lakers, '86 Celtics, '17 Warriors) + EuroLeague & The W",
  '2K Beats Procedural Synth Engine: 6 Era Tracks ready in Jukebox',
];

function eraLabel(mode: UIEraMode): string {
  if (mode === '2K14_CLASSIC') return '2K14 CLASSIC';
  if (mode === '2K26_NEXTGEN') return '2K26 NEXT-GEN';
  return 'HYBRID PRO';
}

export const UltimateHybridShell: React.FC<UltimateHybridShellProps> = ({
  onBackToArcade,
  onLaunchCourt,
  onOpenCity3D,
  onOpenClassicStudio,
}) => {
  const save = useUltimateHybridStore();
  const rosterSnap = useRosterStore();
  const [beats, setBeats] = useState<HybridBeatsSnapshot>(() => HybridAudioEngine.getBeatsSnapshot());
  const [drawer, setDrawer] = useState<QuickDrawerKind>(null);
  const [settingsInitTab, setSettingsInitTab] = useState<SettingsTabId>('GAMEPLAY');
  const [studioTeamId, setStudioTeamId] = useState<string>('2k14_mia');
  const [challengeCat, setChallengeCat] = useState<ChallengeCategory>('DAILY');
  const [hudHidden, setHudHidden] = useState(false);
  const [hudEditorOpen, setHudEditorOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [toast, setToast] = useState<string | null>(null);

  const era = save.uiEraMode;
  const screen = save.activeScreen;

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2800);
  };

  const openSettingsAt = (tab: SettingsTabId) => {
    HybridAudioEngine.playUi('click', era);
    setSettingsInitTab(tab);
    setDrawer('SETTINGS');
  };

  // Sync audio settings on mount & listen to 2K Beats updates
  useEffect(() => {
    HybridAudioEngine.applySettings(save.settings.audio);
    return HybridAudioEngine.subscribe(setBeats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredAway = useMemo(
    () => getHybridTeamById(save.activeMatchConfig.awayTeamId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [save.activeMatchConfig.awayTeamId, rosterSnap.revision]
  );
  const featuredHome = useMemo(
    () => getHybridTeamById(save.activeMatchConfig.homeTeamId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [save.activeMatchConfig.homeTeamId, rosterSnap.revision]
  );

  const activeChallenges = useMemo(
    () => save.challenges.filter((c) => c.category === challengeCat),
    [save.challenges, challengeCat]
  );

  const handleToggleEra = () => {
    const next = UltimateHybridStore.cycleEraMode();
    HybridAudioEngine.playUi('switch', next);
    notify(`UI Era switched to ${eraLabel(next)}`);
  };

  const handleNavigate = (
    target: ActiveScreen,
    poolPreset?: 'EUROLEAGUE_14' | 'LEGENDS',
    venuePreset?: ActiveMatchConfig['venue']
  ) => {
    HybridAudioEngine.playUi('confirm', era);
    if (target === 'SETTINGS') {
      openSettingsAt('GAMEPLAY');
      return;
    }
    if (target === 'PROFILE_VIP') {
      setDrawer('PROFILE_VIP');
      return;
    }
    if (poolPreset === 'EUROLEAGUE_14') {
      UltimateHybridStore.updateMatchConfig({
        awayEraPool: 'EUROLEAGUE_14',
        homeEraPool: 'EUROLEAGUE_14',
        awayTeamId: 'euro_rm',
        homeTeamId: 'euro_fcb',
        venue: 'EUROLEAGUE_PALACE',
      });
    } else if (target === 'THE_W_HUB') {
      UltimateHybridStore.updateMatchConfig({
        awayEraPool: 'THE_W',
        homeEraPool: 'THE_W',
        awayTeamId: 'wnba_lva',
        homeTeamId: 'wnba_ind',
        venue: 'WNBA_ARENA',
      });
    } else if (target === 'PATH_TO_GREATNESS') {
      UltimateHybridStore.updateMatchConfig({
        awayEraPool: 'NBA_2K14',
        homeEraPool: 'NBA_2K14',
        awayTeamId: '2k14_sas',
        homeTeamId: '2k14_mia',
        venue: 'ARENA_2K14',
      });
    } else if (target === 'BLACKTOP_SETUP') {
      UltimateHybridStore.updateMatchConfig({
        venue: venuePreset ?? 'SKYLINE_PARK',
        playersPerSide: 3,
        targetScore: 21,
      });
    }
    UltimateHybridStore.setActiveScreen(target);
  };

  const handleTipOff = (
    cfg: ActiveMatchConfig,
    away: HybridTeamSummary,
    home: HybridTeamSummary
  ) => {
    const venueDef = VENUE_OPTIONS.find((v) => v.id === cfg.venue) ?? VENUE_OPTIONS[0];
    const isHomeUser = cfg.sideControl !== 'AWAY';
    const userTeamSummary = isHomeUser ? home : away;
    const cpuTeamSummary = isHomeUser ? away : home;

    // Build live 3D overrides directly from the Part 2 72-team RosterStore
    const userFullData = RosterStore.getTeamById(userTeamSummary.id);
    const cpuFullData = RosterStore.getTeamById(cpuTeamSummary.id);
    const homeTeamOverride = toHoops2K26TeamOverride(
      userFullData,
      userTeamSummary.mappedCourtTeamId
    );
    const awayTeamOverride = toHoops2K26TeamOverride(
      cpuFullData,
      cpuTeamSummary.mappedCourtTeamId
    );

    const matchCtx: HoopsMatchContext = {
      sourceLabel: `${away.abbr} @ ${home.abbr} · ${venueDef.label}`,
      courtTheme: venueDef.courtTheme,
      playersPerSide: cfg.playersPerSide,
      homeTeamId: userTeamSummary.mappedCourtTeamId,
      awayTeamId: cpuTeamSummary.mappedCourtTeamId,
      homeTeamOverride,
      awayTeamOverride,
      homeJerseyVariant:
        cfg.homeJersey === 'CITY'
          ? 'city'
          : cfg.homeJersey === 'AWAY'
            ? 'away'
            : 'home',
      useMyPlayer: false,
      targetScore: cfg.targetScore,
      quarterSec: Math.max(45, Math.round(cfg.quarterLengthMin * 60)),
      difficultyLabel: cfg.difficulty,
      repMult: 1.15,
      badgeMult: 1.25,
      vcBonus: 420,
    };

    playerState.hoops2k26.activeMatchContext = matchCtx;
    playerState.selectedBasketballTeam = userTeamSummary.mappedCourtTeamId % 4;
    persistArenaSelections();
    persistHoops2K26();
    ModesStore.setActiveLaunchPayload(null);
    UltimateHybridStore.updateMatchConfig(cfg);
    HybridAudioEngine.pause();
    UltimateHybridStore.setActiveScreen('LIVE_GAME');
  };

  const handleInstantTipOff = () => {
    HybridAudioEngine.playWhistle();
    HybridAudioEngine.announce(
      `Instant tip-off! ${featuredAway.fullName} at ${featuredHome.fullName}!`
    );
    handleTipOff(save.activeMatchConfig, featuredAway, featuredHome);
  };

  // Global keyboard shortcuts matching Part 1 legend ([H], [F], [M], [Q/E], [Esc])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Escape') {
        if (hudEditorOpen) {
          setHudEditorOpen(false);
        } else if (drawer) {
          setDrawer(null);
        } else if (screen !== 'MAIN_MENU') {
          UltimateHybridStore.setActiveScreen('MAIN_MENU');
        }
        return;
      }
      if (drawer || hudEditorOpen) return;
      if (e.code === 'KeyH' && screen === 'MAIN_MENU') {
        setHudHidden((h) => !h);
      } else if (e.code === 'KeyF' && screen === 'MAIN_MENU' && !hudHidden) {
        handleInstantTipOff();
      } else if (e.code === 'KeyM' && screen === 'MAIN_MENU' && !hudHidden) {
        HybridAudioEngine.playUi('confirm', era);
        UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
      } else if ((e.code === 'KeyQ' || e.code === 'KeyE') && screen === 'MAIN_MENU' && !hudHidden) {
        handleToggleEra();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, drawer, hudHidden, hudEditorOpen, era, featuredAway, featuredHome]);

  const openRosterManager = (teamId?: string) => {
    if (teamId) setStudioTeamId(teamId);
    HybridAudioEngine.playUi('confirm', era);
    UltimateHybridStore.setActiveScreen('ROSTER_MANAGER');
  };

  const openCreateAPlayer = (teamId?: string) => {
    if (teamId) setStudioTeamId(teamId);
    HybridAudioEngine.playUi('confirm', era);
    UltimateHybridStore.setActiveScreen('CREATE_A_PLAYER');
  };

  const launchPlayNowForTeam = (teamId: string) => {
    const team = getHybridTeamById(teamId);
    UltimateHybridStore.updateMatchConfig({
      homeEraPool: team.eraPool,
      homeTeamId: team.id,
      venue:
        team.eraPool === 'THE_W'
          ? 'WNBA_ARENA'
          : team.eraPool === 'EUROLEAGUE_14'
            ? 'EUROLEAGUE_PALACE'
            : save.activeMatchConfig.venue,
    });
    UltimateHybridStore.setActiveScreen('PLAY_NOW_SETUP');
  };

  const renderChallengeCard = () => (
    <aside className="h2k-challenge-card">
      <div className="h2k-challenge-head">
        <span className="h2k-kicker">REWARDS TRACKER</span>
        <div className="h2k-challenge-tabs">
          {(['DAILY', 'SEASONAL', 'LIFETIME'] as ChallengeCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`h2k-mini-pill ${challengeCat === cat ? 'active' : ''}`}
              onClick={() => {
                HybridAudioEngine.playUi('click', era);
                setChallengeCat(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="h2k-challenge-list">
        {activeChallenges.map((ch) => {
          const pct = Math.min(100, Math.round((ch.progress / Math.max(1, ch.target)) * 100));
          const ready = ch.progress >= ch.target && !ch.claimed;
          return (
            <div key={ch.id} className="h2k-challenge-item">
              <div className="h2k-challenge-row">
                <strong>{ch.title}</strong>
                <span>
                  {ch.progress}/{ch.target}
                </span>
              </div>
              <p>{ch.description}</p>
              <div className="h2k-rating-track">
                <div
                  className="h2k-rating-fill"
                  style={{ width: `${pct}%`, backgroundColor: ready ? '#22c55e' : '#f59e0b' }}
                />
              </div>
              <div className="h2k-challenge-foot">
                <span className="h2k-reward-txt">
                  +{ch.vcReward} VC · +{ch.mtpReward} MTP
                </span>
                <button
                  type="button"
                  className={`h2k-claim-btn ${ready ? 'ready' : ''}`}
                  disabled={!ready}
                  onClick={() => {
                    const res = UltimateHybridStore.claimChallenge(ch.id);
                    if (res.ok) {
                      HybridAudioEngine.playGreenRelease();
                      notify(`Claimed +${res.rewardVc} VC & +${res.rewardMtp} MTP!`);
                    }
                  }}
                >
                  {ch.claimed ? 'CLAIMED ✓' : ready ? 'CLAIM REWARD' : 'IN PROGRESS'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );

  // Star jersey details reflect current era
  const stageJerseyNum = era === '2K14_CLASSIC' ? 6 : 2;
  const stagePrimary = era === '2K14_CLASSIC' ? '#98002e' : '#0f172a';
  const stageTrim = era === '2K14_CLASSIC' ? '#f9a01b' : '#e11d48';

  return (
    <div className={`h2k-root era-${era.toLowerCase()}`}>
      {/* LIVE 60 FPS THREE.JS 3D ANIMATED MENU BACKGROUND (unmounted during LIVE_GAME) */}
      {screen !== 'LIVE_GAME' && (
        <MenuBackground3D
          eraMode={era}
          starJerseyNumber={stageJerseyNum}
          starPrimaryHex={stagePrimary}
          starTrimHex={stageTrim}
          onFpsSample={setFps}
        />
      )}

      {toast && <div className="h2k-toast">{toast}</div>}

      {/* CINEMA MODE RESTORE BUTTON WHEN HUD IS COLLAPSED */}
      {hudHidden && screen === 'MAIN_MENU' && (
        <div className="h2k-cinema-restore">
          <button
            type="button"
            className="h2k-btn-accent"
            onClick={() => setHudHidden(false)}
          >
            ▴ SHOW MENU HUD [H]
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* SCREEN 1: MAIN MENU (2K14 CLASSIC / 2K26 NEXT-GEN / HYBRID PRO)    */}
      {/* ================================================================== */}
      {screen === 'MAIN_MENU' && !hudHidden && !hudEditorOpen && (
        <div className="h2k-shell-layer">
          {/* ---------------- LAYOUT A: NBA 2K14 CLASSIC ---------------- */}
          {era === '2K14_CLASSIC' && (
            <>
              <header className="h2k-2k14-topbar">
                <div className="h2k-brand-cluster">
                  <button
                    type="button"
                    className="h2k-back-arcade-btn"
                    onClick={() => {
                      HybridAudioEngine.pause();
                      onBackToArcade();
                    }}
                  >
                    ◀ ARCADE
                  </button>
                  <div className="h2k-2k14-logo">
                    <span className="nba">NBA</span>
                    <strong>2K14</strong>
                  </div>
                  <button
                    type="button"
                    className="h2k-era-toggle-pill"
                    onClick={handleToggleEra}
                    title="Cycle UI Era: Hybrid Pro / 2K14 Classic / 2K26 Next-Gen"
                  >
                    ERA: 2K14 ⇄ 2K26 / HYBRID
                  </button>
                </div>

                <div className="h2k-2k14-ticker" aria-label="2K Sports Live Ticker">
                  <span className="h2k-ticker-badge">2K SPORTS</span>
                  <div className="h2k-ticker-track">
                    <span>{TICKER_HEADLINES.join('   •   ')}</span>
                  </div>
                </div>

                <div className="h2k-utility-cluster">
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => {
                      HybridAudioEngine.playUi('click', era);
                      setDrawer('PROFILE_VIP');
                    }}
                  >
                    VIP
                  </button>
                  <span className="h2k-currency-chip vc">VC {save.currencies.vc.toLocaleString()}</span>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => {
                      HybridAudioEngine.playUi('click', era);
                      setDrawer('BEATS_JUKEBOX');
                    }}
                  >
                    🎵 2K BEATS
                  </button>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => openSettingsAt('GAMEPLAY')}
                  >
                    OPTIONS
                  </button>
                </div>
              </header>

              <main className="h2k-2k14-grid">
                {/* Left Spotlight PLAY NOW Hero Card */}
                <section className="h2k-2k14-hero-card">
                  <div className="h2k-hero-eyebrow">FEATURED 2K14 BROADCAST SPOTLIGHT</div>
                  <h1>PLAY NOW</h1>
                  <p className="h2k-hero-copy">
                    Instant 5v5 exhibition across 72 authentic teams: all 30 2013-14 NBA squads, all 30 2025-26 NBA squads, Legends, EuroLeague & The W.
                  </p>
                  <div className="h2k-hero-matchup-preview">
                    <TeamEmblemSVG team={featuredAway} size={54} />
                    <div className="h2k-hero-vs">
                      <strong>
                        {featuredAway.abbr} @ {featuredHome.abbr}
                      </strong>
                      <span>
                        {featuredAway.starPlayer.name} ({featuredAway.starPlayer.ovr}) vs{' '}
                        {featuredHome.starPlayer.name} ({featuredHome.starPlayer.ovr})
                      </span>
                    </div>
                    <TeamEmblemSVG team={featuredHome} size={54} />
                  </div>
                  <div className="h2k-hero-actions h2k-hero-dual-btns">
                    <button
                      type="button"
                      className="h2k-tipoff-cta"
                      onClick={handleInstantTipOff}
                    >
                      <span className="h2k-tipoff-title">TIP-OFF NOW</span>
                      <span className="h2k-tipoff-sub">Instant 3D Match [F]</span>
                    </button>
                    <button
                      type="button"
                      className="h2k-btn-ghost h2k-choose-teams-btn"
                      onClick={() => handleNavigate('PLAY_NOW_SETUP')}
                    >
                      CHOOSE TEAMS (72)
                    </button>
                  </div>
                </section>

                {/* Right 2x3 Metro-Style Tile Grid */}
                <section className="h2k-2k14-metro-grid" aria-label="NBA 2K14 Game Modes">
                  {METRO_2K14_TILES.map((tile) => (
                    <button
                      key={tile.id}
                      type="button"
                      className="h2k-metro-tile"
                      style={{ borderTopColor: tile.accent }}
                      onClick={() => handleNavigate(tile.target, tile.poolPreset)}
                    >
                      <span className="h2k-metro-tag" style={{ color: tile.accent }}>
                        {tile.tag}
                      </span>
                      <h3>{tile.title}</h3>
                      <p>{tile.subtitle}</p>
                    </button>
                  ))}
                </section>
              </main>

              {/* Part 1 Authentic 2K14 Bottom Metallic Action Bar */}
              <nav className="h2k-2k14-metallic-bar" aria-label="2K14 Features Action Bar">
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => openRosterManager(featuredHome.id)}
                >
                  MANAGE ROSTER
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => openCreateAPlayer(featuredHome.id)}
                >
                  CREATE-A-PLAYER
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => {
                    HybridAudioEngine.playUi('click', era);
                    setDrawer('PROFILE_VIP');
                  }}
                >
                  VIP PROFILE
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => openSettingsAt('COACH')}
                >
                  GAME SLIDERS
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => openSettingsAt('CONTROLLER')}
                >
                  CONTROLLER
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item"
                  onClick={() => {
                    HybridAudioEngine.playUi('click', era);
                    setDrawer('BEATS_JUKEBOX');
                  }}
                >
                  2K BEATS
                </button>
                <button
                  type="button"
                  className="h2k-metallic-item accent"
                  onClick={() => {
                    HybridAudioEngine.playUi('confirm', era);
                    onOpenCity3D();
                  }}
                >
                  THE CITY MAP (2K26)
                </button>
              </nav>
            </>
          )}

          {/* ---------------- LAYOUT B: NBA 2K26 NEXT-GEN ---------------- */}
          {era === '2K26_NEXTGEN' && (
            <>
              <header className="h2k-2k26-topbar">
                <div className="h2k-brand-cluster">
                  <button
                    type="button"
                    className="h2k-back-arcade-btn"
                    onClick={() => {
                      HybridAudioEngine.pause();
                      onBackToArcade();
                    }}
                  >
                    ◀ ARCADE
                  </button>
                  <div className="h2k-2k26-wordmark">
                    <span>NBA</span>
                    <strong>2K26</strong>
                  </div>
                  <button
                    type="button"
                    className="h2k-era-toggle-pill nextgen"
                    onClick={handleToggleEra}
                  >
                    ERA: 2K26 ⇄ HYBRID / 2K14
                  </button>
                </div>

                <nav className="h2k-nextgen-tabs" aria-label="NBA 2K26 Main Navigation">
                  {NEXTGEN_TABS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      className={`h2k-nextgen-tab ${t.id === 'MAIN_MENU' ? 'active' : ''}`}
                      onClick={() => handleNavigate(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>

                <div className="h2k-utility-cluster">
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('SWAP_BUILD')}
                  >
                    Swap Build
                  </button>
                  <span className="h2k-currency-chip vc">VC {save.currencies.vc.toLocaleString()}</span>
                  <span className="h2k-currency-chip mtp">MTP {save.currencies.mtp.toLocaleString()}</span>
                  <span className="h2k-currency-chip">S1 LV.{save.currencies.seasonLevel}</span>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('CREW')}
                  >
                    Crew
                  </button>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('PROFILE_VIP')}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => openSettingsAt('GAMEPLAY')}
                  >
                    ⚙
                  </button>
                </div>
              </header>

              {/* Dynamic Open Center Stage + 4 Side Action Cards + Challenges */}
              <main className="h2k-2k26-stage">
                <div className="h2k-hybrid-left-col">
                  <section className="h2k-2k26-hero-dock">
                    <div className="h2k-kicker">THE CITY · SKYLINE PARK LIVE STAGE</div>
                    <h1>PROPLAY NEXT-GEN ARENA</h1>
                    <p>
                      All 72 dual-era rosters live! Tip off cross-era matchups, edit 576+ players, or build a custom star.
                    </p>
                    <div className="h2k-2k26-cta-row">
                      <button
                        type="button"
                        className="h2k-tipoff-cta compact"
                        onClick={() => handleNavigate('PLAY_NOW_SETUP')}
                      >
                        <span className="h2k-tipoff-title">PLAY NOW · 72 TEAMS</span>
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-accent"
                        onClick={() => openRosterManager(featuredHome.id)}
                      >
                        📋 MANAGE ROSTER
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-ghost"
                        onClick={() => openCreateAPlayer(featuredHome.id)}
                      >
                        + CREATE-A-PLAYER
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-ghost"
                        onClick={() => {
                          HybridAudioEngine.playUi('confirm', era);
                          onOpenCity3D();
                        }}
                      >
                        🏙️ ENTER THE CITY 3D
                      </button>
                    </div>
                  </section>

                  <section className="h2k-2k26-side-cards" aria-label="2K26 Featured Quick Cards">
                    {NEXTGEN_SIDE_CARDS.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        className="h2k-metro-tile compact"
                        style={{ borderLeftColor: card.accent }}
                        onClick={() => handleNavigate(card.target, undefined, card.venuePreset)}
                      >
                        <span className="h2k-metro-tag" style={{ color: card.accent }}>
                          {card.tag}
                        </span>
                        <strong>{card.title}</strong>
                        <p>{card.subtitle}</p>
                      </button>
                    ))}
                  </section>
                </div>

                {renderChallengeCard()}
              </main>
            </>
          )}

          {/* ---------------- DEFAULT: HYBRID PRO (2K14 + 2K26 BLEND) ---------------- */}
          {era === 'HYBRID_PRO' && (
            <>
              <header className="h2k-2k26-topbar hybrid-pro">
                <div className="h2k-brand-cluster">
                  <button
                    type="button"
                    className="h2k-back-arcade-btn"
                    onClick={() => {
                      HybridAudioEngine.pause();
                      onBackToArcade();
                    }}
                  >
                    ◀ ARCADE
                  </button>
                  <div className="h2k-hybrid-wordmark">
                    <span className="era14">2K14</span>
                    <span className="plus">+</span>
                    <span className="era26">2K26</span>
                  </div>
                  <button
                    type="button"
                    className="h2k-era-toggle-pill hybrid"
                    onClick={handleToggleEra}
                  >
                    ERA: HYBRID PRO ⇄ 2K14 / 2K26
                  </button>
                </div>

                <nav className="h2k-nextgen-tabs" aria-label="Ultimate Hybrid Navigation">
                  {NEXTGEN_TABS.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      className={`h2k-nextgen-tab ${t.id === 'MAIN_MENU' ? 'active' : ''}`}
                      onClick={() => handleNavigate(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>

                <div className="h2k-utility-cluster">
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('SWAP_BUILD')}
                  >
                    Swap Build
                  </button>
                  <span className="h2k-currency-chip vc">VC {save.currencies.vc.toLocaleString()}</span>
                  <span className="h2k-currency-chip mtp">MTP {save.currencies.mtp.toLocaleString()}</span>
                  <span className="h2k-currency-chip">S1 LV.{save.currencies.seasonLevel}</span>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('CREW')}
                  >
                    Crew
                  </button>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => setDrawer('PROFILE_VIP')}
                  >
                    VIP
                  </button>
                  <button
                    type="button"
                    className="h2k-util-btn"
                    onClick={() => openSettingsAt('GAMEPLAY')}
                  >
                    ⚙
                  </button>
                </div>
              </header>

              {/* 2K14 Broadcast Ticker Strip integrated into Hybrid Pro */}
              <div className="h2k-hybrid-ticker-bar">
                <span className="h2k-ticker-badge">2K SPORTS HYBRID LIVE</span>
                <div className="h2k-ticker-track">
                  <span>{TICKER_HEADLINES.join('   •   ')}</span>
                </div>
              </div>

              {/* Hybrid Pro Lower Deck — Leaves Upper-Center 3D Skyline Park Unobstructed */}
              <main className="h2k-hybrid-stage">
                <div className="h2k-hybrid-left-col">
                  <section className="h2k-hybrid-hero">
                    <div className="h2k-kicker">ULTIMATE CROSS-ERA EDITION · 72 TEAMS LIVE</div>
                    <div className="h2k-hero-matchup-preview compact">
                      <TeamEmblemSVG team={featuredAway} size={46} />
                      <div className="h2k-hero-vs">
                        <strong>
                          {featuredAway.abbr} ({featuredAway.eraBadge}) vs {featuredHome.abbr} ({featuredHome.eraBadge})
                        </strong>
                        <span>
                          {featuredAway.starPlayer.name} ({featuredAway.starPlayer.ovr}) vs{' '}
                          {featuredHome.starPlayer.name} ({featuredHome.starPlayer.ovr})
                        </span>
                      </div>
                      <TeamEmblemSVG team={featuredHome} size={46} />
                    </div>
                    <div className="h2k-2k26-cta-row">
                      <button
                        type="button"
                        className="h2k-tipoff-cta compact"
                        onClick={() => handleNavigate('PLAY_NOW_SETUP')}
                      >
                        <span className="h2k-tipoff-title">PLAY NOW · 72 TEAMS</span>
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-accent"
                        onClick={() => openRosterManager(featuredHome.id)}
                      >
                        📋 MANAGE ROSTER
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-ghost"
                        onClick={() => openCreateAPlayer(featuredHome.id)}
                      >
                        + CREATE-A-PLAYER
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-ghost"
                        onClick={() => {
                          HybridAudioEngine.playUi('confirm', era);
                          UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                        }}
                      >
                        🏙️ THE CITY 3D
                      </button>
                      <button
                        type="button"
                        className="h2k-btn-ghost"
                        onClick={() => {
                          HybridAudioEngine.playUi('click', era);
                          onOpenClassicStudio();
                        }}
                      >
                        🛠️ STUDIO
                      </button>
                    </div>
                  </section>

                  <section className="h2k-hybrid-quick-grid">
                    {METRO_2K14_TILES.map((tile) => (
                      <button
                        key={tile.id}
                        type="button"
                        className="h2k-metro-tile compact"
                        style={{ borderLeftColor: tile.accent }}
                        onClick={() => handleNavigate(tile.target, tile.poolPreset)}
                      >
                        <span className="h2k-metro-tag" style={{ color: tile.accent }}>
                          {tile.tag}
                        </span>
                        <strong>{tile.title}</strong>
                      </button>
                    ))}
                  </section>
                </div>

                {renderChallengeCard()}
              </main>
            </>
          )}

          {/* ---------------- SHARED BOTTOM ACTION, SHORTCUTS & TELEMETRY BAR ---------------- */}
          <footer className="h2k-bottom-bar">
            <div className="h2k-bottom-left">
              <button
                type="button"
                className="h2k-beats-pill"
                onClick={() => setDrawer('BEATS_JUKEBOX')}
              >
                🎵 <strong>{beats.currentTrack.title}</strong> ·{' '}
                {beats.isPlaying ? 'PLAYING' : 'PAUSED'}
              </button>
              <button
                type="button"
                className="h2k-mini-pill"
                onClick={() => HybridAudioEngine.togglePlay()}
              >
                {beats.isPlaying ? '⏸' : '▶'}
              </button>
              <button
                type="button"
                className="h2k-mini-pill"
                onClick={() => HybridAudioEngine.nextTrack()}
              >
                ⏭
              </button>
            </div>

            <div className="h2k-shortcut-legend" aria-label="Keyboard and controller shortcuts">
              <span>[F] Quick Match</span>
              <span>[M] City Map</span>
              <span>[Q/E] Era</span>
              <span>[H] Hide HUD</span>
              <span>[Esc] Back</span>
            </div>

            <div className="h2k-bottom-right">
              <button
                type="button"
                className="h2k-mini-pill"
                onClick={() => setHudHidden(true)}
                title="Hide Menu HUD to view unobstructed 3D stage"
              >
                ▾ HIDE HUD [H]
              </button>
              {save.settings.visual.showFpsTelemetry && (
                <span className="h2k-telemetry-badge">
                  {eraLabel(era)} · {fps} FPS · 12ms
                </span>
              )}
            </div>
          </footer>
        </div>
      )}

      {/* ================================================================== */}
      {/* SCREEN 2: PRE-GAME MATCHUP & 5-ERA 72-TEAM SELECT                  */}
      {/* ================================================================== */}
      {screen === 'PLAY_NOW_SETUP' && (
        <div className="h2k-shell-layer">
          <PlayNowSetup
            eraMode={era}
            config={save.activeMatchConfig}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onOpenRosterManager={openRosterManager}
            onOpenCreateAPlayer={openCreateAPlayer}
            onTipOff={handleTipOff}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* SCREEN 3: PART 2 MANAGE ROSTER (72 TEAMS, 576+ PLAYERS)            */}
      {/* ================================================================== */}
      {screen === 'ROSTER_MANAGER' && (
        <div className="h2k-shell-layer">
          <RosterManager
            eraMode={era}
            initialTeamId={studioTeamId}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onOpenCreateAPlayer={(tid) => openCreateAPlayer(tid)}
            onLaunchPlayNowWithTeam={launchPlayNowForTeam}
            onNotify={notify}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* SCREEN 4: PART 2 CREATE-A-PLAYER STUDIO                            */}
      {/* ================================================================== */}
      {screen === 'CREATE_A_PLAYER' && (
        <div className="h2k-shell-layer">
          <CreateAPlayer
            eraMode={era}
            initialTeamId={studioTeamId}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onSavedOpenRoster={(tid) => openRosterManager(tid)}
            onSavedLaunchPlayNow={launchPlayNowForTeam}
            onNotify={notify}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* SCREEN 5: PART 3 LIVE 60 FPS THREE.JS 3D BASKETBALL ARENA & PARKS  */}
      {/* ================================================================== */}
      {screen === 'LIVE_GAME' && (
        <LiveCourtStage
          onExitToMenu={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
          onReturnToCity={() => UltimateHybridStore.setActiveScreen('CITY_EXPLORE')}
          onOpenSettings={(tab) => openSettingsAt(tab ?? 'CAMERA')}
          onLaunchLegacyCourt={() => {
            HybridAudioEngine.pause();
            onLaunchCourt();
          }}
          onNotify={notify}
        />
      )}

      {/* ================================================================== */}
      {/* SCREEN 2B: THE W / WNBA QUICK LAUNCH (NO STUB SCREEN)              */}
      {/* ================================================================== */}
      {screen === 'THE_W_HUB' && (
        <div className="h2k-shell-layer">
          <PlayNowSetup
            eraMode={era}
            config={save.activeMatchConfig}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onOpenRosterManager={openRosterManager}
            onOpenCreateAPlayer={openCreateAPlayer}
            onTipOff={handleTipOff}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* PART 6 SIGNATURE GAME MODES (ZERO STUB SCREENS)                    */}
      {/* ================================================================== */}
      {(screen === 'CITY_EXPLORE' || screen === 'MYCAREER_HUB') && (
        <div className="h2k-shell-layer">
          <TheCityHub
            eraMode={era}
            initialViewMode="MAP"
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onOpenBuilder={() => UltimateHybridStore.setActiveScreen('MYPLAYER_BUILDER')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'MYPLAYER_BUILDER' && (
        <div className="h2k-shell-layer">
          <MyPlayerBuilder
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onEnterCity={() => UltimateHybridStore.setActiveScreen('CITY_EXPLORE')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'PATH_TO_GREATNESS' && (
        <div className="h2k-shell-layer">
          <PathToGreatness
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'MYTEAM_HUB' && (
        <div className="h2k-shell-layer">
          <MyTeamHub
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'MYNBA_HUB' && (
        <div className="h2k-shell-layer">
          <MyNbaAssociation
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'BLACKTOP_SETUP' && (
        <div className="h2k-shell-layer">
          <BlacktopSetup
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onNotify={notify}
          />
        </div>
      )}

      {screen === 'LEARN_2K' && (
        <div className="h2k-shell-layer">
          <TrainingCamp
            eraMode={era}
            onBack={() => UltimateHybridStore.setActiveScreen('MAIN_MENU')}
            onNotify={notify}
          />
        </div>
      )}

      {/* ================================================================== */}
      {/* PART 7 UNIFIED 7-TAB SETTINGS, SLIDERS & DUAL-FORMAT PROFILE SUITE */}
      {/* ================================================================== */}
      {(drawer === 'SETTINGS' || drawer === 'PROFILE_VIP') && (
        <SettingsModal
          save={save}
          beats={beats}
          initialTab={drawer === 'PROFILE_VIP' ? 'DATA' : settingsInitTab}
          inMatch={false}
          onClose={() => setDrawer(null)}
          onOpenCustomHudEditor={() => {
            setDrawer(null);
            setHudEditorOpen(true);
          }}
          onNotify={notify}
        />
      )}

      {/* ================================================================== */}
      {/* PART 7 LIVE DRAG-AND-DROP CUSTOM TOUCH HUD EDITOR OVER 3D ARENA    */}
      {/* ================================================================== */}
      {hudEditorOpen && (
        <CustomHudEditor
          uiEraMode={era}
          initialLayout={save.settings.controller.customHudLayout}
          liveCourtBackdrop={true}
          onSaveAndExit={(layout) => {
            UltimateHybridStore.updateCustomHudLayout(layout);
            setHudEditorOpen(false);
            notify('Custom Touch HUD layout saved!');
          }}
          onCancel={() => setHudEditorOpen(false)}
        />
      )}

      {/* ================================================================== */}
      {/* QUICK-MODALS (2K BEATS JUKEBOX / SWAP BUILD / CREW DRAWERS)        */}
      {/* ================================================================== */}
      <HybridModals
        save={save}
        drawer={drawer === 'SETTINGS' || drawer === 'PROFILE_VIP' ? null : drawer}
        beats={beats}
        initialSettingsTab={settingsInitTab}
        onClose={() => setDrawer(null)}
        onNotify={notify}
        onOpenCity3D={onOpenCity3D}
        onOpenClassicStudio={onOpenClassicStudio}
      />
    </div>
  );
};
