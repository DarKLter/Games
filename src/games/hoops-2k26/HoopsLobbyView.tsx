import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CustomJumpShot,
  CustomShoeDesign,
  HOOPS_2K26_TEAMS,
  HOOPS_2K_BEATS,
  HOOPS_40_BADGES,
  HOOPS_ANIMATION_GLOSSARY,
  HOOPS_BUILDER_TEMPLATES,
  HOOPS_CITY_LOCATIONS,
  HOOPS_ERAS,
  HOOPS_LOCKER_CODES,
  HOOPS_TAKEOVERS,
  HoopsAttrCategory,
  HoopsBodyType,
  HoopsCityLocationDef,
  HoopsDifficulty2K,
  HoopsMainTab,
  HoopsMatchContext,
  HoopsPosition,
  MYTEAM_CARDS,
  MYTEAM_GAME_CHANGERS,
  MyPlayerSaveSlot,
  PNO_TIER_LEAGUES,
  SHOE_BRANDS,
  ShoeBrand,
  computeBuilderAttributeCaps,
  computeOverallFromAttributes,
  computeUnlockedBadges,
  createDefaultMyPlayerSave,
  evaluateCustomJumpShot,
  evaluateMyPlayerScoutingReport,
  formatHeightInches,
  getActiveMyPlayer,
  getCrewBonusesForLevel,
  getHoops2K26TeamById,
  getLocalDateKey,
  getPlateTierForScore,
  getRepTierForXp,
  redeemHoopsLockerCode,
  solveBuildByBadges
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import { HoopsBeats } from './hoopsBeatsAudio';
import { persistArenaSelections, persistHoops2K26, playerState } from '../../core/storage';
import { HoopsCity3D } from './HoopsCity3D';
import { UltimateHybridShell } from './hybrid/MainMenuShell';

export interface HoopsLobbyViewProps {
  onBack: () => void;
  onLaunch: () => void;
  onSyncShowcase: () => void;
  bump: () => void;
}

type FeaturesSubTab = 'shoes' | 'jumpshot' | 'mycourt' | 'beats' | 'locker' | 'settings';
type MyCareerSubView = 'hub' | 'builder' | 'city';
type CityModalKind =
  | null
  | 'map'
  | 'nav'
  | 'daily_reward'
  | 'pickem'
  | 'stores'
  | 'boosts'
  | 'gatorade'
  | 'art_shooting'
  | 'track'
  | 'locker_room'
  | 'park_got_next';

const MAIN_TABS: Array<{ id: HoopsMainTab; label: string }> = [
  { id: 'play_now', label: '🏀 PLAY NOW' },
  { id: 'mycareer', label: '🏙️ MyCAREER' },
  { id: 'myteam', label: '🃏 MyTEAM' },
  { id: 'mynba', label: '📅 MyNBA' },
  { id: 'the_w', label: '⚡ THE W' },
  { id: 'learn_2k', label: '🎓 LEARN 2K' },
  { id: 'season', label: '🏆 SEASON' },
  { id: 'features', label: '🎨 FEATURES' }
];

export const HoopsLobbyView: React.FC<HoopsLobbyViewProps> = ({
  onBack,
  onLaunch,
  onSyncShowcase,
  bump
}) => {
  const prof = playerState.hoops2k26;
  const activeMp = getActiveMyPlayer(prof);

  const [shellMode, setShellMode] = useState<'hybrid' | 'classic_studio'>('hybrid');
  const [mainTab, setMainTab] = useState<HoopsMainTab>('play_now');
  const [myCareerView, setMyCareerView] = useState<MyCareerSubView>('hub');
  const [featuresTab, setFeaturesTab] = useState<FeaturesSubTab>('shoes');
  const [toast, setToast] = useState<string | null>(null);

  // Play Now state
  const [leagueFilter, setLeagueFilter] = useState<'all' | 'nba' | 'wnba' | 'classic'>('all');
  const [homeTeamId, setHomeTeamId] = useState<number>(playerState.selectedBasketballTeam % HOOPS_2K26_TEAMS.length);
  const [awayTeamId, setAwayTeamId] = useState<number>(1);
  const [jerseyVariant, setJerseyVariant] = useState<'home' | 'away' | 'city'>('home');
  const [playNowSub, setPlayNowSub] = useState<'quick' | 'blacktop' | 'pno'>('quick');
  const [blacktopSize, setBlacktopSize] = useState<1 | 2 | 3 | 5>(3);
  const [blacktopTarget, setBlacktopTarget] = useState<number>(21);

  // MyPLAYER Builder state
  const [builderPos, setBuilderPos] = useState<HoopsPosition>(activeMp.position);
  const [builderHeight, setBuilderHeight] = useState<number>(activeMp.heightIn);
  const [builderWeight, setBuilderWeight] = useState<number>(activeMp.weightLb);
  const [builderWingspan, setBuilderWingspan] = useState<number>(activeMp.wingspanIn);
  const [builderBody, setBuilderBody] = useState<HoopsBodyType>(activeMp.bodyType);
  const [builderName, setBuilderName] = useState<string>(activeMp.name);
  const [builderAttrs, setBuilderAttrs] = useState({ ...activeMp.attributes });
  const [builderGlossaryQ, setBuilderGlossaryQ] = useState('');
  const [badgeTargets, setBadgeTargets] = useState<Record<string, 'Bronze' | 'Silver' | 'Gold' | 'HOF' | 'Legend'>>({
    limitless_range: 'Gold',
    posterizer: 'Silver',
    challenger: 'Gold'
  });

  // Creator Studios state
  const [shoeName, setShoeName] = useState('Custom Dawn 26');
  const [shoeBrand, setShoeBrand] = useState<ShoeBrand>('Jordan');
  const [shoeCut, setShoeCut] = useState<'Low' | 'Mid' | 'High'>('Mid');
  const [shoeUpper, setShoeUpper] = useState('#0f172a');
  const [shoeSole, setShoeSole] = useState('#f8fafc');
  const [shoeAccent, setShoeAccent] = useState('#f59e0b');
  const [shoeLaces, setShoeLaces] = useState('#38bdf8');
  const [jsDraft, setJsDraft] = useState<CustomJumpShot>({ ...activeMp.jumpShot });
  const [lockerInput, setLockerInput] = useState('');

  // 2K Beats state
  const [beatState, setBeatState] = useState(() => HoopsBeats.getState());

  // Walkable 3D City state
  const cityMountRef = useRef<HTMLDivElement | null>(null);
  const cityEngineRef = useRef<HoopsCity3D | null>(null);
  const [nearbyLoc, setNearbyLoc] = useState<HoopsCityLocationDef | null>(null);
  const [cityModal, setCityModal] = useState<CityModalKind>(null);
  const [cityNavTab, setCityNavTab] = useState<'myplayer' | 'progression' | 'quests' | 'crew' | 'card' | 'builds'>('myplayer');
  const [vehicleOn, setVehicleOn] = useState(false);
  const [stagingLoc, setStagingLoc] = useState<HoopsCityLocationDef | null>(null);
  const [cityWaypoint, setCityWaypoint] = useState<string>('the_rec');

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 2600);
  };

  useEffect(() => {
    const unsub = HoopsBeats.subscribe((st) => setBeatState(st));
    return unsub;
  }, []);

  // Mount Walkable 3D City Engine when in MyCAREER -> City view
  useEffect(() => {
    if (!(mainTab === 'mycareer' && myCareerView === 'city')) {
      if (cityEngineRef.current) {
        cityEngineRef.current.dispose();
        cityEngineRef.current = null;
      }
      return;
    }
    if (!cityMountRef.current) return;
    const city = new HoopsCity3D(cityMountRef.current, {
      onNearbyLocationChange: (loc) => setNearbyLoc(loc),
      onPlayerMove: (_x, _z, vOn) => setVehicleOn(vOn)
    });
    cityEngineRef.current = city;
    city.setWaypoint(cityWaypoint);

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'KeyM') {
        e.preventDefault();
        setCityModal((m) => (m === 'map' ? null : 'map'));
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        const mounted = city.toggleVehicle();
        setVehicleOn(mounted);
        notify(mounted ? '🛹 City Vehicle Mounted (1.8x Speed)!' : '👟 On Foot');
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setCityModal((m) => (m === 'nav' ? null : 'nav'));
      } else if (e.code === 'KeyE' || e.code === 'Enter') {
        const near = city.getNearbyLocation();
        if (near) openCityLocation(near);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      city.dispose();
      cityEngineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, myCareerView]);

  const launchMatchWithContext = (ctx: HoopsMatchContext) => {
    playerState.hoops2k26.activeMatchContext = ctx;
    playerState.selectedBasketballTeam = ctx.homeTeamId % 4;
    persistArenaSelections();
    persistHoops2K26();
    ArcadeAudio.play('whistle');
    onLaunch();
  };

  const openCityLocation = (loc: HoopsCityLocationDef) => {
    ArcadeAudio.play('click');
    setStagingLoc(loc);
    if (loc.id === 'daily_reward') {
      setCityModal('daily_reward');
    } else if (loc.id === 'daily_pickem') {
      setCityModal('pickem');
    } else if (loc.id === 'clothing_promenade') {
      setCityModal('stores');
    } else if (loc.id === 'skill_boosts') {
      setCityModal('boosts');
    } else if (loc.id === 'gatorade_facility') {
      setCityModal('gatorade');
    } else if (loc.id === 'art_of_shooting') {
      setCityModal('art_shooting');
    } else if (loc.id === 'the_track') {
      setCityModal('track');
    } else if (loc.id === 'park_courts') {
      setCityModal('park_got_next');
    } else if (loc.id === 'the_rec' || loc.id === 'the_theater' || loc.id === 'proving_grounds' || loc.id === 'pro_am' || loc.id === 'ante_up') {
      setCityModal('locker_room');
    } else if (loc.id === 'mycourt') {
      launchMatchWithContext({
        sourceLabel: 'MyCOURT Personal Gym',
        courtTheme: 'mycourt',
        playersPerSide: 1,
        homeTeamId: activeMp.nbaTeamId,
        awayTeamId: (activeMp.nbaTeamId + 1) % HOOPS_2K26_TEAMS.length,
        homeJerseyVariant: 'home',
        useMyPlayer: true,
        targetScore: 21,
        quarterSec: 300,
        difficultyLabel: prof.settings.difficulty,
        repMult: 0.75,
        badgeMult: 1.5,
        vcBonus: 180,
        isPractice: true
      });
    } else if (loc.id === 'nba_arena' || loc.id === 'starting_5') {
      launchMatchWithContext({
        sourceLabel: loc.id === 'starting_5' ? 'Starting 5 Online' : 'MyCAREER NBA Arena',
        courtTheme: 'nba_arena',
        playersPerSide: 5,
        homeTeamId: activeMp.nbaTeamId,
        awayTeamId: (activeMp.nbaTeamId + 2) % HOOPS_2K26_TEAMS.length,
        homeJerseyVariant: 'home',
        useMyPlayer: true,
        targetScore: null,
        quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
        difficultyLabel: prof.settings.difficulty,
        repMult: loc.id === 'starting_5' ? 1.3 : 1.0,
        badgeMult: 1.35,
        vcBonus: 450
      });
    } else if (loc.id === 'street_kings') {
      launchMatchWithContext({
        sourceLabel: `Street Kings Boss Lv.${prof.streetKingsLevel}`,
        courtTheme: 'street_kings',
        playersPerSide: 3,
        homeTeamId: activeMp.nbaTeamId,
        awayTeamId: 14,
        homeJerseyVariant: 'city',
        useMyPlayer: true,
        targetScore: 21,
        quarterSec: 180,
        difficultyLabel: 'All-Star',
        repMult: 1.25,
        badgeMult: 2.0,
        vcBonus: 500
      });
    } else if (loc.id === 'open_court') {
      launchMatchWithContext({
        sourceLabel: 'Open-Court Athletics (3x Badges!)',
        courtTheme: 'open_court',
        playersPerSide: 3,
        homeTeamId: activeMp.nbaTeamId,
        awayTeamId: 4,
        homeJerseyVariant: 'home',
        useMyPlayer: true,
        targetScore: 21,
        quarterSec: 180,
        difficultyLabel: 'Pro',
        repMult: 1.1,
        badgeMult: 3.0,
        vcBonus: 320
      });
    } else {
      setCityModal('map');
    }
  };

  const repInfo = getRepTierForXp(prof.repXp);
  const plateInfo = getPlateTierForScore(prof.plateScore);
  const crewBonuses = getCrewBonusesForLevel(prof.crewLevel);
  const seasonLevel = Math.min(40, 1 + Math.floor(prof.seasonXp / 300));
  const activeOvr = computeOverallFromAttributes(activeMp.attributes, activeMp.capBreakersApplied);

  const filteredTeams = useMemo(
    () => HOOPS_2K26_TEAMS.filter((t) => leagueFilter === 'all' || t.league === leagueFilter),
    [leagueFilter]
  );

  // =========================================================================
  // PART 1: NBA 2K14 + NBA 2K26 ULTIMATE HYBRID SHELL (DEFAULT ENTRY)
  // =========================================================================
  if (shellMode === 'hybrid') {
    return (
      <UltimateHybridShell
        onBackToArcade={onBack}
        onLaunchCourt={onLaunch}
        onOpenCity3D={() => {
          setShellMode('classic_studio');
          setMainTab('mycareer');
          setMyCareerView('city');
        }}
        onOpenClassicStudio={() => {
          setShellMode('classic_studio');
          setMainTab('mycareer');
          setMyCareerView('hub');
        }}
      />
    );
  }

  // =========================================================================
  // FULL-SCREEN WALKABLE 3D CITY MODE
  // =========================================================================
  if (mainTab === 'mycareer' && myCareerView === 'city') {
    const nowMs = Date.now();
    const dailyRewardReady = nowMs - prof.timers.dailyRewardLastMs >= 8 * 3600 * 1000;
    const todayKey = getLocalDateKey();
    const pickemReady = prof.timers.dailyPickemLastDate !== todayKey;

    const launchStagingArena = () => {
      const loc = stagingLoc;
      if (!loc) return;
      const is5v5 = loc.id === 'the_rec' || loc.id === 'proving_grounds' || loc.id === 'pro_am';
      const theme =
        loc.id === 'the_rec'
          ? 'the_rec'
          : loc.id === 'proving_grounds'
            ? 'proving_grounds'
            : loc.id === 'the_theater'
              ? 'theater'
              : 'park';
      setCityModal(null);
      launchMatchWithContext({
        sourceLabel: `${loc.name}`,
        courtTheme: theme,
        playersPerSide: is5v5 ? 5 : 3,
        homeTeamId: activeMp.nbaTeamId,
        awayTeamId: (activeMp.nbaTeamId + 3) % HOOPS_2K26_TEAMS.length,
        homeJerseyVariant: 'home',
        useMyPlayer: true,
        targetScore: is5v5 ? null : 21,
        quarterSec: is5v5 ? Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)) : 180,
        difficultyLabel: loc.id === 'proving_grounds' || loc.id === 'pro_am' ? 'Hall of Fame' : 'Superstar',
        repMult: loc.id === 'proving_grounds' ? 1.75 : loc.id === 'the_rec' ? 1.45 : 1.25,
        badgeMult: 1.5,
        vcBonus: loc.id === 'ante_up' ? 1200 : 600
      });
    };

    return (
      <div className="hoops-city-screen">
        <div ref={cityMountRef} className="hoops-city-canvas-host" />

        {/* Streamlined Top City Bar */}
        <header className="hoops-city-topbar">
          <div className="hoops-city-top-left">
            <button
              type="button"
              className="lobby3d-back-btn"
              onClick={() => {
                ArcadeAudio.play('click');
                setMyCareerView('hub');
                setShellMode('hybrid');
              }}
            >
              ◀ HYBRID MENU
            </button>
            <div className="hoops-city-id">
              <strong>{activeMp.name}</strong>
              <span>
                {activeMp.position} · {activeOvr} OVR ·{' '}
                <em style={{ color: plateInfo.hex }}>{plateInfo.label}</em> · {repInfo.tier.label}
              </span>
            </div>
          </div>
          <div className="hoops-city-top-right">
            <span className="hoops-currency-pill vc">VC {prof.vc.toLocaleString()}</span>
            <span className="hoops-currency-pill crew">[{prof.crewTag}] Lv.{prof.crewLevel}</span>
            <button
              type="button"
              className="hoops-city-pill-btn"
              onClick={() => {
                const m = cityEngineRef.current?.toggleVehicle() ?? false;
                setVehicleOn(m);
                notify(m ? '🛹 Vehicle Mounted!' : '👟 On Foot');
              }}
            >
              {vehicleOn ? '🛹 RIDE ON [V]' : '🛹 VEHICLE [V]'}
            </button>
            <button
              type="button"
              className="hoops-city-pill-btn accent"
              onClick={() => setCityModal((m) => (m === 'map' ? null : 'map'))}
            >
              🗺️ CITY MAP [M]
            </button>
            <button
              type="button"
              className="hoops-city-pill-btn"
              onClick={() => setCityModal((m) => (m === 'nav' ? null : 'nav'))}
            >
              ☰ MyCAREER [Esc]
            </button>
          </div>
        </header>

        {/* Bottom Walkable Touch D-Pad (Mobile/Mouse Friendly) + Proximity Interact Prompt */}
        <div className="hoops-city-bottombar">
          <div className="hoops-city-pad" aria-label="Walk in The City">
            <button
              type="button"
              onPointerDown={() => cityEngineRef.current?.setJoystick(0, -1)}
              onPointerUp={() => cityEngineRef.current?.setJoystick(0, 0)}
              onPointerLeave={() => cityEngineRef.current?.setJoystick(0, 0)}
            >
              ▲
            </button>
            <div className="hoops-city-pad-mid">
              <button
                type="button"
                onPointerDown={() => cityEngineRef.current?.setJoystick(-1, 0)}
                onPointerUp={() => cityEngineRef.current?.setJoystick(0, 0)}
                onPointerLeave={() => cityEngineRef.current?.setJoystick(0, 0)}
              >
                ◀
              </button>
              <button
                type="button"
                onPointerDown={() => cityEngineRef.current?.setJoystick(1, 0)}
                onPointerUp={() => cityEngineRef.current?.setJoystick(0, 0)}
                onPointerLeave={() => cityEngineRef.current?.setJoystick(0, 0)}
              >
                ▶
              </button>
            </div>
            <button
              type="button"
              onPointerDown={() => cityEngineRef.current?.setJoystick(0, 1)}
              onPointerUp={() => cityEngineRef.current?.setJoystick(0, 0)}
              onPointerLeave={() => cityEngineRef.current?.setJoystick(0, 0)}
            >
              ▼
            </button>
          </div>

          <div className="hoops-city-prompt-wrap">
            {nearbyLoc ? (
              <button
                type="button"
                className="hoops-city-interact-btn"
                onClick={() => openCityLocation(nearbyLoc)}
              >
                <span>
                  {nearbyLoc.icon} <strong>ENTER {nearbyLoc.name.toUpperCase()}</strong> [E]
                </span>
                <small>{nearbyLoc.formatLabel} · {nearbyLoc.resetTimerLabel}</small>
              </button>
            ) : (
              <div className="hoops-city-hint">
                WASD / Pad to Walk · [V] Skateboard · [M] Fast-Travel Map · Walk to any glowing arena ring!
              </div>
            )}
          </div>

          <div className="hoops-city-quick-warps">
            {(['the_rec', 'park_courts', 'daily_reward', 'mycourt'] as const).map((lid) => {
              const loc = HOOPS_CITY_LOCATIONS.find((l) => l.id === lid)!;
              return (
                <button
                  key={lid}
                  type="button"
                  className="hoops-city-warp-chip"
                  onClick={() => {
                    cityEngineRef.current?.teleportTo(lid);
                    setCityWaypoint(lid);
                    notify(`Teleported to ${loc.shortName}!`);
                  }}
                >
                  {loc.icon} {loc.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {toast && <div className="hoops-toast">{toast}</div>}

        {/* CITY MAP & FAST-TRAVEL MODAL [M] */}
        {cityModal === 'map' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card wide" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>🗺️ THE CITY INTERACTIVE MAP & FAST-TRAVEL</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <div className="hoops-city-map-grid">
                {(['central', 'north', 'west', 'east', 'south'] as const).map((perim) => (
                  <div key={perim} className="hoops-map-zone">
                    <div className="hoops-map-zone-title">{perim.toUpperCase()} PERIMETER</div>
                    {HOOPS_CITY_LOCATIONS.filter((l) => l.perimeter === perim).map((loc) => (
                      <div key={loc.id} className="hoops-map-row">
                        <div className="hoops-map-row-info">
                          <strong>{loc.icon} {loc.name}</strong>
                          <small>{loc.formatLabel} · {loc.resetTimerLabel}</small>
                        </div>
                        <div className="hoops-map-row-actions">
                          <button
                            type="button"
                            className="lobby3d-mini-btn"
                            onClick={() => {
                              setCityWaypoint(loc.id);
                              cityEngineRef.current?.setWaypoint(loc.id);
                              notify(`GPS Trail set to ${loc.shortName}`);
                            }}
                          >
                            GPS
                          </button>
                          <button
                            type="button"
                            className="lobby3d-mini-btn accent"
                            onClick={() => {
                              cityEngineRef.current?.teleportTo(loc.id);
                              setCityWaypoint(loc.id);
                              setCityModal(null);
                              notify(`⚡ Fast-Traveled to ${loc.name}!`);
                            }}
                          >
                            TELEPORT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DAILY REWARD KIOSK MODAL */}
        {cityModal === 'daily_reward' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>🎁 DAILY REWARD KIOSK (8h Reset)</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <p className="hoops-modal-desc">
                Spin the City Prize Pedestal for VC, Skill Boosts, Gatorade Boosts, or 2XP Coins!
              </p>
              <button
                type="button"
                className="lobby3d-cta-btn"
                disabled={!dailyRewardReady}
                onClick={() => {
                  const roll = Math.random();
                  const vcWon = roll > 0.7 ? 2500 : roll > 0.35 ? 1250 : 750;
                  prof.vc += vcWon;
                  prof.skillBoosts += 5;
                  prof.timers.dailyRewardLastMs = Date.now();
                  persistHoops2K26();
                  ArcadeAudio.play('win');
                  notify(`🎁 Daily Reward Claimed: +${vcWon} VC & +5 Skill Boosts!`);
                  bump();
                }}
              >
                {dailyRewardReady ? '🎰 CLAIM DAILY REWARD (+VC & BOOSTS)' : '✓ CLAIMED (RESETS IN 8 HOURS)'}
              </button>
            </div>
          </div>
        )}

        {/* DAILY PICK'EM KIOSK MODAL */}
        {cityModal === 'pickem' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>📊 DAILY NBA PICK'EM KIOSK</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <p className="hoops-modal-desc">Predict tonight's featured NBA matchups for instant VC payouts.</p>
              <div className="hoops-stack-list">
                {[
                  ['Boston Celtics', 'Los Angeles Lakers'],
                  ['OKC Thunder', 'Denver Nuggets'],
                  ['Las Vegas Aces', 'New York Liberty']
                ].map(([a, b], idx) => (
                  <div key={idx} className="hoops-pickem-row">
                    <span>{a} vs {b}</span>
                    <button
                      type="button"
                      className="lobby3d-mini-btn"
                      disabled={!pickemReady}
                      onClick={() => {
                        prof.vc += 400;
                        prof.timers.dailyPickemLastDate = todayKey;
                        persistHoops2K26();
                        ArcadeAudio.play('coin');
                        notify(`📊 Pick locked! Instant +400 VC Bonus!`);
                        bump();
                      }}
                    >
                      {pickemReady ? `PICK ${a.split(' ').pop()}` : 'LOCKED ✓'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SWAG'S, NBA STORE & VEHICLES */}
        {cityModal === 'stores' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>👟 CLOTHING, VEHICLES & SHOE PROMENADE</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <div className="hoops-stack-list">
                {(['skateboard', 'hoverboard', 'bmx', 'gokart'] as const).map((veh) => (
                  <div key={veh} className="hoops-pickem-row">
                    <span>🛹 City Vehicle: <strong>{veh.toUpperCase()}</strong></span>
                    <button
                      type="button"
                      className="lobby3d-mini-btn"
                      onClick={() => {
                        activeMp.equippedVehicle = veh;
                        persistHoops2K26();
                        notify(`Equipped ${veh.toUpperCase()}! Press [V] in The City.`);
                        bump();
                      }}
                    >
                      {activeMp.equippedVehicle === veh ? 'EQUIPPED ✓' : 'EQUIP'}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  setCityModal(null);
                  setMainTab('features');
                  setFeaturesTab('shoes');
                }}
              >
                🎨 OPEN 3D SHOE CREATOR STUDIO
              </button>
            </div>
          </div>
        )}

        {/* SKILL BOOSTS KIOSK */}
        {cityModal === 'boosts' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>⚡ SKILL BOOSTS KIOSK</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <p className="hoops-modal-desc">
                Active Skill Boost Games Remaining: <strong>{prof.skillBoosts}</strong> (+5% Shooting/Defense boost on court)
              </p>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  if (prof.vc < 1500) {
                    notify('Need 1,500 VC for 10-Pack Skill Boosts!');
                    return;
                  }
                  prof.vc -= 1500;
                  prof.skillBoosts += 10;
                  persistHoops2K26();
                  ArcadeAudio.play('coin');
                  notify('⚡ Purchased +10 Skill Boosts!');
                  bump();
                }}
              >
                BUY 10-GAME SKILL BOOST PACK (1,500 VC)
              </button>
            </div>
          </div>
        )}

        {/* GATORADE / ART OF SHOOTING / TRACK WEEKLY FACILITIES */}
        {(cityModal === 'gatorade' || cityModal === 'art_shooting' || cityModal === 'track') && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>
                  {cityModal === 'gatorade'
                    ? '🏋️ GATORADE TRAINING FACILITY'
                    : cityModal === 'art_shooting'
                      ? '🔥 ART OF SHOOTING — LETHAL ZONES'
                      : '🏎️ THE TRACK — WEEKLY GHOST CHALLENGE'}
                </h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <p className="hoops-modal-desc">
                {cityModal === 'gatorade'
                  ? 'Complete your weekly turbo workout to earn +15 Gatorade Stamina Boosts & +25% stamina conservation.'
                  : cityModal === 'art_shooting'
                    ? 'Upgrade any Hot Zone directly to a Purple LETHAL ZONE for maximum Green Window expansion!'
                    : 'Beat the weekly ghost lap on The Track to earn a +2,500 VC jackpot!'}
              </p>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  if (cityModal === 'gatorade') {
                    prof.gatoradeBoosts += 15;
                    notify('🏋️ Gatorade Workout Cleared! +15 Stamina Boosts!');
                  } else if (cityModal === 'art_shooting') {
                    activeMp.hotZones.top_key = 'lethal';
                    activeMp.hotZones.left_corner = 'lethal';
                    notify('🔥 Top Key & Left Corner upgraded to PURPLE LETHAL ZONES!');
                  } else {
                    prof.vc += 2500;
                    notify('🏎️ Track Ghost Defeated! +2,500 VC Awarded!');
                  }
                  persistHoops2K26();
                  ArcadeAudio.play('win');
                  setCityModal(null);
                  bump();
                }}
              >
                {cityModal === 'gatorade'
                  ? 'COMPLETE WEEKLY WORKOUT (+15 BOOSTS)'
                  : cityModal === 'art_shooting'
                    ? 'COMPLETE LETHAL ZONE DRILL'
                    : 'BEAT WEEKLY GHOST (+2,500 VC)'}
              </button>
            </div>
          </div>
        )}

        {/* PRE-GAME LOCKER ROOM STAGING (THE REC / THEATER / PROVING GROUNDS / PRO-AM) */}
        {cityModal === 'locker_room' && stagingLoc && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card wide" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>{stagingLoc.icon} {stagingLoc.name.toUpperCase()} — LOCKER ROOM</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <div className="hoops-locker-grid">
                <div className="hoops-player-card-tile you">
                  <div className="hoops-plate-bar" style={{ background: plateInfo.hex }}>{plateInfo.label}</div>
                  <strong>{activeMp.name}</strong>
                  <span>{activeMp.position} · {activeOvr} OVR · {repInfo.tier.label}</span>
                  <small>Takeover: {HOOPS_TAKEOVERS.find((t) => t.id === activeMp.equippedTakeoverId)?.name}</small>
                </div>
                {['D. Mitchell (92 PG)', 'K. Kawhi (94 SF)', 'B. Adebayo (90 PF)', 'V. Wembanyama (95 C)'].map((mate, i) => (
                  <div key={i} className="hoops-player-card-tile">
                    <div className="hoops-plate-bar" style={{ background: '#38bdf8' }}>READY ✓</div>
                    <strong>{mate.split(' (')[0]}</strong>
                    <span>{mate.split(' (')[1]?.replace(')', '')}</span>
                    <small>Squad Teammate</small>
                  </div>
                ))}
              </div>
              <div className="hoops-takeover-swap-row">
                <span>Quick-Swap Takeover Preset:</span>
                {activeMp.takeoverPresets.map((tkId) => {
                  const tk = HOOPS_TAKEOVERS.find((t) => t.id === tkId);
                  if (!tk) return null;
                  return (
                    <button
                      key={tkId}
                      type="button"
                      className={`lobby3d-seg-btn ${activeMp.equippedTakeoverId === tkId ? 'active' : ''}`}
                      onClick={() => {
                        activeMp.equippedTakeoverId = tkId;
                        persistHoops2K26();
                        bump();
                      }}
                    >
                      🔥 {tk.name}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="lobby3d-cta-btn" onClick={launchStagingArena}>
                🏀 WALK OUT TUNNEL & TIP OFF ({stagingLoc.formatLabel})
              </button>
            </div>
          </div>
        )}

        {/* PARK GOT NEXT STAGING */}
        {cityModal === 'park_got_next' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>🏀 PARK COURTS — GOT NEXT SPOT</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <p className="hoops-modal-desc">
                👑 Park MVP Bounty Active · Streak Breaker Bonus: +500 VC · First to 21!
              </p>
              <div className="lobby3d-seg-row">
                {([2, 3] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className="lobby3d-cta-btn"
                    onClick={() => {
                      setCityModal(null);
                      launchMatchWithContext({
                        sourceLabel: `The City Park ${sz}v${sz}`,
                        courtTheme: 'park',
                        playersPerSide: sz,
                        homeTeamId: activeMp.nbaTeamId,
                        awayTeamId: (activeMp.nbaTeamId + 4) % HOOPS_2K26_TEAMS.length,
                        homeJerseyVariant: 'city',
                        useMyPlayer: true,
                        targetScore: 21,
                        quarterSec: 180,
                        difficultyLabel: 'Superstar',
                        repMult: 1.35,
                        badgeMult: 1.4,
                        vcBonus: 450
                      });
                    }}
                  >
                    STEP ON {sz}v{sz} GOT NEXT (TO 21)
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MyCAREER 8-TAB NAV & 2K CARD MODAL [Esc] */}
        {cityModal === 'nav' && (
          <div className="hoops-modal-backdrop" onClick={() => setCityModal(null)}>
            <div className="hoops-modal-card wide" onClick={(e) => e.stopPropagation()}>
              <div className="hoops-modal-head">
                <h3>☰ MyCAREER HUB & 2K CARD</h3>
                <button type="button" className="hoops-modal-close" onClick={() => setCityModal(null)}>✕</button>
              </div>
              <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                {([
                  ['myplayer', '👤 MyPLAYER'],
                  ['progression', '📈 6 Ladders'],
                  ['quests', '📋 Daily Tasks'],
                  ['crew', '🛡️ Crew Lv.' + prof.crewLevel],
                  ['card', '🪪 2K Card'],
                  ['builds', '🔄 Swap Build']
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    className={`lobby3d-seg-btn ${cityNavTab === id ? 'active' : ''}`}
                    onClick={() => setCityNavTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {cityNavTab === 'myplayer' && (
                <div className="hoops-nav-body">
                  <div><strong>{activeMp.name}</strong> ({activeMp.position} · {formatHeightInches(activeMp.heightIn)} · {activeOvr} OVR)</div>
                  <div>Takeover: <strong>{HOOPS_TAKEOVERS.find((t) => t.id === activeMp.equippedTakeoverId)?.name}</strong> · Jump Shot: <strong>{activeMp.jumpShot.name}</strong></div>
                  <div>Hot/Lethal Zones: Top Key ({activeMp.hotZones.top_key.toUpperCase()}), Left Corner ({activeMp.hotZones.left_corner.toUpperCase()}), Paint ({activeMp.hotZones.paint.toUpperCase()})</div>
                </div>
              )}
              {cityNavTab === 'progression' && (
                <div className="hoops-nav-body">
                  <div>1. Overall Rating: <strong>{activeOvr} OVR</strong> (MyPOINTS: {activeMp.myPoints})</div>
                  <div>2. REP Tier: <strong>{repInfo.tier.label}</strong> ({prof.repXp} XP · {repInfo.pct}% to next)</div>
                  <div>3. Crew Level: <strong>Lv.{prof.crewLevel}/30</strong> (+{crewBonuses.vcBonusPct}% VC, +{crewBonuses.repBonusPct}% REP)</div>
                  <div>4. Skill Plate: <strong style={{ color: plateInfo.hex }}>{plateInfo.label}</strong> ({prof.plateScore}/1000)</div>
                  <div>5. Build Specialization: <strong>{activeMp.buildSpecPath.toUpperCase()}</strong> ({activeMp.buildSpecGoalsDone}/9 Goals)</div>
                  <div>6. Season Pass: <strong>Lv.{seasonLevel}/40</strong> ({prof.seasonPassTier} Tier)</div>
                </div>
              )}
              {cityNavTab === 'quests' && (
                <div className="hoops-stack-list">
                  {prof.dailyChallenges.tasks.map((task) => {
                    const done = task.progress >= task.target;
                    return (
                      <div key={task.id} className="hoops-pickem-row">
                        <span>{task.label} ({task.progress}/{task.target})</span>
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          disabled={!done || task.claimed}
                          onClick={() => {
                            task.claimed = true;
                            prof.vc += task.vcReward;
                            persistHoops2K26();
                            ArcadeAudio.play('coin');
                            notify(`+${task.vcReward} VC Claimed!`);
                            bump();
                          }}
                        >
                          {task.claimed ? 'CLAIMED ✓' : done ? `CLAIM ${task.vcReward} VC` : `${task.vcReward} VC`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {cityNavTab === 'crew' && (
                <div className="hoops-nav-body">
                  <div>Crew: <strong>[{prof.crewTag}] {prof.crewName}</strong> · Level {prof.crewLevel}/30</div>
                  <div>Active Perks: +{crewBonuses.vcBonusPct}% VC · +{crewBonuses.repBonusPct}% REP · +{crewBonuses.capBreakers} Cap Breakers · {crewBonuses.maxPlusOnes} Max+1 Badges</div>
                </div>
              )}
              {cityNavTab === 'card' && (
                <div className="hoops-nav-body">
                  <div>Games: <strong>{prof.careerStats.gamesPlayed}</strong> · Wins: <strong>{prof.careerStats.wins}</strong></div>
                  <div>Career Totals: <strong>{prof.careerStats.points} PTS · {prof.careerStats.rebounds} REB · {prof.careerStats.assists} AST · {prof.careerStats.greens} Greens</strong></div>
                  <div>Lifetime Challenges Cleared: <strong>{prof.lifetimeCleared}/300</strong></div>
                </div>
              )}
              {cityNavTab === 'builds' && (
                <div className="hoops-stack-list">
                  {prof.saves.map((sv) => (
                    <div key={sv.id} className="hoops-pickem-row">
                      <span><strong>{sv.name}</strong> · {sv.position} · {computeOverallFromAttributes(sv.attributes, sv.capBreakersApplied)} OVR</span>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        onClick={() => {
                          prof.activeSaveId = sv.id;
                          persistHoops2K26();
                          notify(`Swapped active MyPLAYER to ${sv.name}!`);
                          bump();
                        }}
                      >
                        {prof.activeSaveId === sv.id ? 'ACTIVE ✓' : 'SWAP'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 8-TAB STREAMLINED 3D-FIRST MAIN LOBBY
  // =========================================================================
  const homeTeam = getHoops2K26TeamById(homeTeamId);
  const awayTeam = getHoops2K26TeamById(awayTeamId);
  const builderCaps = computeBuilderAttributeCaps(builderPos, builderHeight, builderWeight, builderWingspan);
  const builderOvr = computeOverallFromAttributes(builderAttrs, activeMp.capBreakersApplied);
  const scouting = evaluateMyPlayerScoutingReport(builderPos, builderAttrs);
  const unlockedBadges = computeUnlockedBadges(builderAttrs).filter((b) => b.tier !== 'None');
  const jsEval = evaluateCustomJumpShot(jsDraft);

  return (
    <div className="hoops-shell-wrap">
      {/* Upper-Right Currency & 2K Beats Ribbon + 8-Tab Bar */}
      <div className="hoops-top-ribbon">
        <nav className="hoops-8tab-nav" aria-label="Hoops 2K26 Main Tabs">
          <button
            type="button"
            className="hoops-tab-btn"
            onClick={() => {
              ArcadeAudio.play('click');
              setShellMode('hybrid');
            }}
          >
            ◀ 2K14+2K26 MENU
          </button>
          {MAIN_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`hoops-tab-btn ${mainTab === t.id ? 'active' : ''}`}
              onClick={() => {
                ArcadeAudio.play('click');
                setMainTab(t.id);
                if (t.id === 'mycareer') setMyCareerView('hub');
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="hoops-wallet-strip">
          <span className="hoops-currency-pill vc">VC {prof.vc.toLocaleString()}</span>
          <span className="hoops-currency-pill mtp">MTP {prof.mtp.toLocaleString()}</span>
          <span className="hoops-currency-pill" style={{ borderColor: plateInfo.hex, color: plateInfo.hex }}>
            {plateInfo.label}
          </span>
          <button
            type="button"
            className="hoops-beats-mini"
            onClick={() => {
              if (!beatState.isPlaying) HoopsBeats.play();
              else HoopsBeats.nextTrack();
            }}
            title="Play / Skip 2K Beats Track"
          >
            🎵 {beatState.isPlaying ? beatState.currentTrack.title : '2K Beats'}
          </button>
        </div>
      </div>

      {toast && <div className="hoops-toast">{toast}</div>}

      {/* MAIN 3-COLUMN BODY (Left Panel | Live 3D Showcase Center | Right Panel) */}
      <div className="hoops-3col-body">
        {/* ================= TAB 1: PLAY NOW ================= */}
        {mainTab === 'play_now' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>PLAY NOW MODES</span>
                <span>{prof.settings.quarterLengthMin === 0.75 ? '45s Fast' : `${prof.settings.quarterLengthMin}m QTR`}</span>
              </div>
              <div className="lobby3d-seg-row">
                {([
                  ['quick', '🏟️ Quick Play'],
                  ['blacktop', '🌇 Blacktop'],
                  ['pno', '🌐 Online Tiers']
                ] as const).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    className={`lobby3d-seg-btn ${playNowSub === id ? 'active' : ''}`}
                    onClick={() => setPlayNowSub(id)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="lobby3d-sec-title">
                <span>16 REAL NBA · WNBA · CLASSIC TEAMS</span>
                <span>HOME</span>
              </div>
              <div className="lobby3d-seg-row">
                {(['all', 'nba', 'wnba', 'classic'] as const).map((lg) => (
                  <button
                    key={lg}
                    type="button"
                    className={`lobby3d-seg-btn ${leagueFilter === lg ? 'active' : ''}`}
                    onClick={() => setLeagueFilter(lg)}
                  >
                    {lg.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="lobby3d-scroll-list">
                {filteredTeams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`lobby3d-item-card ${homeTeamId === t.id ? 'selected' : ''}`}
                    onClick={() => {
                      setHomeTeamId(t.id);
                      playerState.selectedBasketballTeam = t.id % 4;
                      persistArenaSelections();
                      onSyncShowcase();
                      bump();
                    }}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{t.icon} {t.name}</div>
                      <div className="lobby3d-item-sub">
                        {t.starters[0].name.split(' ').pop()}, {t.starters[2].name.split(' ').pop()}, {t.starters[4].name.split(' ').pop()} · T{t.tier}
                      </div>
                    </div>
                    <span className="lobby3d-badge">{t.league.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">
                {homeTeam.icon} {homeTeam.name} ({jerseyVariant.toUpperCase()}) vs {awayTeam.icon} {awayTeam.name}
              </div>
            </div>

            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>MATCHUP & RULES</span>
                <span>{playNowSub === 'blacktop' ? `TO ${blacktopTarget}` : `${prof.settings.quarterLengthMin === 0.75 ? '45s' : prof.settings.quarterLengthMin + ' MIN'} QTR`}</span>
              </div>

              <div className="hoops-matchup-box">
                <div><strong>HOME:</strong> {homeTeam.icon} {homeTeam.name}</div>
                <div className="lobby3d-seg-row">
                  {(['home', 'away', 'city'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`lobby3d-seg-btn ${jerseyVariant === v ? 'active' : ''}`}
                      onClick={() => setJerseyVariant(v)}
                    >
                      👕 {v.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div>
                  <strong>OPPONENT:</strong>{' '}
                  <select
                    className="hoops-select"
                    value={awayTeamId}
                    onChange={(e) => setAwayTeamId(Number(e.target.value))}
                  >
                    {HOOPS_2K26_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.league.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {playNowSub === 'blacktop' ? (
                <div className="hoops-matchup-box">
                  <div className="lobby3d-seg-row">
                    {([1, 2, 3, 5] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`lobby3d-seg-btn ${blacktopSize === sz ? 'active' : ''}`}
                        onClick={() => setBlacktopSize(sz)}
                      >
                        {sz}v{sz}
                      </button>
                    ))}
                  </div>
                  <div className="lobby3d-seg-row">
                    {[11, 15, 21].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        className={`lobby3d-seg-btn ${blacktopTarget === pt ? 'active' : ''}`}
                        onClick={() => setBlacktopTarget(pt)}
                      >
                        TO {pt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : playNowSub === 'pno' ? (
                <div className="hoops-matchup-box">
                  <div><strong>League:</strong> {PNO_TIER_LEAGUES[prof.pnoTierIdx]} · Wins: {prof.pnoWins}</div>
                  <small>Tier 1–3 matchmaking with 2K North-South Camera & Real NBA rosters.</small>
                </div>
              ) : (
                <div className="hoops-matchup-box">
                  <div className="lobby3d-sec-title"><span>Quarter Length</span></div>
                  <div className="lobby3d-seg-row">
                    {([
                      [5, '5 MIN (Default)'],
                      [12, '12 MIN (Real NBA)'],
                      [0.75, '45s Fast']
                    ] as const).map(([val, lbl]) => (
                      <button
                        key={String(val)}
                        type="button"
                        className={`lobby3d-seg-btn ${prof.settings.quarterLengthMin === val ? 'active' : ''}`}
                        onClick={() => {
                          prof.settings.quarterLengthMin = val;
                          persistHoops2K26();
                          bump();
                        }}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel:
                      playNowSub === 'blacktop'
                        ? `Blacktop ${blacktopSize}v${blacktopSize}`
                        : playNowSub === 'pno'
                          ? `Play Now Online (${PNO_TIER_LEAGUES[prof.pnoTierIdx]})`
                          : homeTeam.league === 'wnba'
                            ? 'WNBA Quick Play'
                            : 'NBA Quick Play',
                    courtTheme:
                      playNowSub === 'blacktop'
                        ? 'blacktop'
                        : homeTeam.league === 'wnba'
                          ? 'wnba_arena'
                          : 'nba_arena',
                    playersPerSide: playNowSub === 'blacktop' ? blacktopSize : 5,
                    homeTeamId,
                    awayTeamId,
                    homeJerseyVariant: jerseyVariant,
                    useMyPlayer: false,
                    targetScore: playNowSub === 'blacktop' ? blacktopTarget : null,
                    quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                    difficultyLabel: prof.settings.difficulty,
                    repMult: playNowSub === 'pno' ? 1.2 : 1.0,
                    badgeMult: 1.0,
                    vcBonus: 300
                  })
                }
              >
                🏀 TIP OFF {playNowSub === 'blacktop' ? `BLACKTOP TO ${blacktopTarget}` : `${homeTeam.abbr} VS ${awayTeam.abbr}`}
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: MyCAREER (HUB & BUILDER) ================= */}
        {mainTab === 'mycareer' && myCareerView === 'hub' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>MyPLAYER SAVE SLOTS</span>
                <span>{prof.saves.length} Builds</span>
              </div>
              <div className="lobby3d-card-list">
                {prof.saves.map((sv) => {
                  const ovr = computeOverallFromAttributes(sv.attributes, sv.capBreakersApplied);
                  const team = getHoops2K26TeamById(sv.nbaTeamId);
                  return (
                    <button
                      key={sv.id}
                      type="button"
                      className={`lobby3d-item-card ${prof.activeSaveId === sv.id ? 'selected' : ''}`}
                      onClick={() => {
                        prof.activeSaveId = sv.id;
                        persistHoops2K26();
                        bump();
                      }}
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{sv.name} · {sv.position} #{sv.jerseyNum}</div>
                        <div className="lobby3d-item-sub">
                          {team.name} · {formatHeightInches(sv.heightIn)} · {sv.bodyType} · {sv.nbaSeasonGamesWon}W-{sv.nbaSeasonGamesPlayed - sv.nbaSeasonGamesWon}L
                        </div>
                      </div>
                      <span className="lobby3d-badge">{ovr} OVR</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="lobby3d-seg-btn active"
                onClick={() => {
                  setBuilderName(activeMp.name);
                  setBuilderPos(activeMp.position);
                  setBuilderHeight(activeMp.heightIn);
                  setBuilderWeight(activeMp.weightLb);
                  setBuilderWingspan(activeMp.wingspanIn);
                  setBuilderBody(activeMp.bodyType);
                  setBuilderAttrs({ ...activeMp.attributes });
                  setMyCareerView('builder');
                }}
              >
                🧬 OPEN MyPLAYER BUILDER (40 BADGES)
              </button>
            </div>

            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">
                {activeMp.name} · {activeOvr} OVR · {repInfo.tier.label} · Crew [{prof.crewTag}] Lv.{prof.crewLevel}
              </div>
            </div>

            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>MyCAREER DESTINATIONS</span>
                <span>REP {repInfo.tier.label}</span>
              </div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  ArcadeAudio.play('click');
                  setMyCareerView('city');
                }}
              >
                🏙️ ENTER THE CITY (WALKABLE 3D PLAZA)
              </button>
              <button
                type="button"
                className="lobby3d-item-card selected"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'MyCAREER NBA Key Game',
                    courtTheme: 'nba_arena',
                    playersPerSide: 5,
                    homeTeamId: activeMp.nbaTeamId,
                    awayTeamId: (activeMp.nbaTeamId + 1) % HOOPS_2K26_TEAMS.length,
                    homeJerseyVariant: 'home',
                    useMyPlayer: true,
                    targetScore: null,
                    quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                    difficultyLabel: prof.settings.difficulty,
                    repMult: 1.0,
                    badgeMult: 1.4,
                    vcBonus: 550
                  })
                }
              >
                <div className="lobby3d-item-main">
                  <div className="lobby3d-item-title">🏟️ Play Next NBA Season Key Game</div>
                  <div className="lobby3d-item-sub">Out of Bounds Story · {prof.settings.quarterLengthMin === 0.75 ? '45s' : `${prof.settings.quarterLengthMin}m`} Quarters · +550 VC</div>
                </div>
                <span className="lobby3d-badge">PLAY</span>
              </button>
              <button
                type="button"
                className="lobby3d-item-card"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'MyCOURT Custom Gym',
                    courtTheme: 'mycourt',
                    playersPerSide: 1,
                    homeTeamId: activeMp.nbaTeamId,
                    awayTeamId: 2,
                    homeJerseyVariant: 'home',
                    useMyPlayer: true,
                    targetScore: 21,
                    quarterSec: 300,
                    difficultyLabel: 'Pro',
                    repMult: 0.7,
                    badgeMult: 1.5,
                    vcBonus: 200,
                    isPractice: true
                  })
                }
              >
                <div className="lobby3d-item-main">
                  <div className="lobby3d-item-title">🏠 Enter MyCOURT Shootaround</div>
                  <div className="lobby3d-item-sub">Your custom floor, paint, mural & Jump Shot test court</div>
                </div>
                <span className="lobby3d-badge">1v1</span>
              </button>
            </div>
          </>
        )}

        {mainTab === 'mycareer' && myCareerView === 'builder' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>MyPLAYER BUILDER</span>
                <button type="button" className="lobby3d-mini-btn" onClick={() => setMyCareerView('hub')}>
                  ◀ BACK
                </button>
              </div>
              <input
                type="text"
                className="lobby3d-search"
                value={builderName}
                onChange={(e) => setBuilderName(e.target.value)}
                placeholder="MyPLAYER Name"
              />
              <div className="lobby3d-seg-row">
                {(['PG', 'SG', 'SF', 'PF', 'C'] as HoopsPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    className={`lobby3d-seg-btn ${builderPos === pos ? 'active' : ''}`}
                    onClick={() => setBuilderPos(pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>
              <div className="hoops-slider-group">
                <label>Height: {formatHeightInches(builderHeight)} <input type="range" min={70} max={88} value={builderHeight} onChange={(e) => setBuilderHeight(Number(e.target.value))} /></label>
                <label>Weight: {builderWeight} lbs <input type="range" min={175} max={280} value={builderWeight} onChange={(e) => setBuilderWeight(Number(e.target.value))} /></label>
                <label>Wingspan: {formatHeightInches(builderWingspan)} <input type="range" min={72} max={94} value={builderWingspan} onChange={(e) => setBuilderWingspan(Number(e.target.value))} /></label>
              </div>
              <div className="lobby3d-sec-title"><span>6 ATTRIBUTES (CAP-GATED)</span><span>{builderOvr} OVR</span></div>
              <div className="hoops-slider-group">
                {(['finishing', 'shooting', 'playmaking', 'defense', 'rebounding', 'physicals'] as HoopsAttrCategory[]).map((cat) => (
                  <label key={cat}>
                    <span>{cat.toUpperCase()}: {builderAttrs[cat]}/{builderCaps[cat]}</span>
                    <input
                      type="range"
                      min={45}
                      max={builderCaps[cat]}
                      value={Math.min(builderCaps[cat], builderAttrs[cat])}
                      onChange={(e) => setBuilderAttrs((prev) => ({ ...prev, [cat]: Number(e.target.value) }))}
                    />
                  </label>
                ))}
              </div>
              <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                {HOOPS_BUILDER_TEMPLATES.slice(0, 4).map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className="lobby3d-mini-btn"
                    onClick={() => {
                      setBuilderName(tpl.name);
                      setBuilderPos(tpl.position);
                      setBuilderHeight(tpl.heightIn);
                      setBuilderWeight(tpl.weightLb);
                      setBuilderWingspan(tpl.wingspanIn);
                      setBuilderBody(tpl.bodyType);
                      setBuilderAttrs({ ...tpl.attrs });
                      notify(`Loaded template: ${tpl.name}`);
                    }}
                  >
                    {tpl.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">
                {scouting.archetypeName} · {builderOvr} OVR · Comps: {scouting.nbaComps.join(', ')}
              </div>
            </div>

            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>BUILD BY BADGES (40 BADGES)</span>
                <span>{unlockedBadges.length}/40 Active</span>
              </div>
              <button
                type="button"
                className="lobby3d-seg-btn active"
                onClick={() => {
                  const res = solveBuildByBadges(badgeTargets, builderAttrs, builderCaps);
                  setBuilderAttrs(res.nextAttrs);
                  notify(`Solved Build By Badges: ${res.fulfilledCount}/${res.totalRequested} target badges met!`);
                }}
              >
                ⚡ AUTO-SOLVE BUILD BY TARGET BADGES
              </button>
              <div className="hoops-badge-chips">
                {HOOPS_40_BADGES.slice(0, 12).map((b) => {
                  const unlocked = unlockedBadges.find((u) => u.badge.id === b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`hoops-badge-chip ${unlocked ? 'active' : ''}`}
                      onClick={() =>
                        setBadgeTargets((prev) => ({
                          ...prev,
                          [b.id]: prev[b.id] === 'Gold' ? 'HOF' : 'Gold'
                        }))
                      }
                      title={b.desc}
                    >
                      {b.name} <b>{unlocked?.tier ?? '—'}</b>
                    </button>
                  );
                })}
              </div>

              <div className="lobby3d-sec-title"><span>ANIMATION GLOSSARY</span></div>
              <input
                type="text"
                className="lobby3d-search"
                placeholder="Search Curry, Contact Dunks, Kyrie..."
                value={builderGlossaryQ}
                onChange={(e) => setBuilderGlossaryQ(e.target.value)}
              />
              <div className="hoops-mini-scroll">
                {HOOPS_ANIMATION_GLOSSARY.filter((a) =>
                  a.name.toLowerCase().includes(builderGlossaryQ.toLowerCase())
                ).map((a) => {
                  const met = builderAttrs[a.reqCategory] >= a.reqValue;
                  return (
                    <div key={a.id} className="hoops-glossary-row">
                      <span>{a.name} ({a.kind})</span>
                      <b style={{ color: met ? '#4ade80' : '#f87171' }}>
                        {a.reqCategory.slice(0, 4).toUpperCase()} {a.reqValue} {met ? '✓' : '✕'}
                      </b>
                    </div>
                  );
                })}
              </div>

              <div className="lobby3d-btn-row">
                <button
                  type="button"
                  className="lobby3d-cta-btn"
                  onClick={() => {
                    const nextSave: MyPlayerSaveSlot = {
                      ...createDefaultMyPlayerSave(`mp_${Date.now().toString(36)}`),
                      name: builderName.trim() || 'MP Custom',
                      position: builderPos,
                      heightIn: builderHeight,
                      weightLb: builderWeight,
                      wingspanIn: builderWingspan,
                      bodyType: builderBody,
                      attributes: { ...builderAttrs }
                    };
                    prof.saves = [nextSave, ...prof.saves].slice(0, 6);
                    prof.activeSaveId = nextSave.id;
                    persistHoops2K26();
                    notify(`Saved "${nextSave.name}" (${builderOvr} OVR)!`);
                    setMyCareerView('hub');
                    bump();
                  }}
                >
                  💾 SAVE BUILD
                </button>
                <button
                  type="button"
                  className="lobby3d-seg-btn active"
                  onClick={() => {
                    activeMp.attributes = { ...builderAttrs };
                    activeMp.position = builderPos;
                    persistHoops2K26();
                    launchMatchWithContext({
                      sourceLabel: 'Test Build Scrimmage',
                      courtTheme: 'mycourt',
                      playersPerSide: 3,
                      homeTeamId: activeMp.nbaTeamId,
                      awayTeamId: 0,
                      homeJerseyVariant: 'home',
                      useMyPlayer: true,
                      targetScore: 21,
                      quarterSec: 180,
                      difficultyLabel: 'Pro',
                      repMult: 0.5,
                      badgeMult: 1.0,
                      vcBonus: 150,
                      isPractice: true
                    });
                  }}
                >
                  🧪 TEST BUILD
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 3: MyTEAM (NBA + WNBA CO-OP) ================= */}
        {mainTab === 'myteam' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>MyTEAM NBA + WNBA LINEUP</span>
                <span>{prof.ownedCards.length}/{MYTEAM_CARDS.length} Cards</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MYTEAM_CARDS.map((card) => {
                  const owned = prof.ownedCards.includes(card.id);
                  const inLineup = prof.activeMyTeamLineup.includes(card.id);
                  return (
                    <div key={card.id} className={`lobby3d-item-card ${inLineup ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">
                          <span style={{ color: card.gemHex }}>◆</span> {card.name} ({card.ovr})
                        </div>
                        <div className="lobby3d-item-sub">
                          {card.league} · {card.teamAbbr} · {card.pos} · {card.gem}
                        </div>
                      </div>
                      {owned ? (
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          onClick={() => {
                            if (inLineup) return;
                            prof.activeMyTeamLineup = [card.id, ...prof.activeMyTeamLineup.slice(0, 4)];
                            persistHoops2K26();
                            notify(`Added ${card.name} to Starting 5!`);
                            bump();
                          }}
                        >
                          {inLineup ? 'STARTER ✓' : 'START'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          onClick={() => {
                            if (prof.mtp < card.mtpPrice) {
                              notify(`Need ${card.mtpPrice} MTP for ${card.name}!`);
                              return;
                            }
                            prof.mtp -= card.mtpPrice;
                            prof.ownedCards = [...prof.ownedCards, card.id];
                            persistHoops2K26();
                            ArcadeAudio.play('win');
                            notify(`Signed ${card.gem} ${card.name}!`);
                            bump();
                          }}
                        >
                          {card.mtpPrice} MTP
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">
                MyTEAM Co-Op Lineup: NBA & WNBA Superstars Side-by-Side · MTP {prof.mtp.toLocaleString()}
              </div>
            </div>

            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>GAME CHANGERS & MODES</span></div>
              <div className="hoops-badge-chips">
                {MYTEAM_GAME_CHANGERS.map((gc) => (
                  <button
                    key={gc.id}
                    type="button"
                    className={`hoops-badge-chip ${prof.activeGameChangerId === gc.id ? 'active' : ''}`}
                    onClick={() => {
                      prof.activeGameChangerId = prof.activeGameChangerId === gc.id ? null : gc.id;
                      persistHoops2K26();
                      bump();
                    }}
                  >
                    {gc.icon} {gc.name} ({prof.gameChangers[gc.id] ?? 0})
                  </button>
                ))}
              </div>
              <div className="lobby3d-card-list">
                {[
                  { label: 'Triple Threat Park (3v3 to 21)', sz: 3 as const, theme: 'park' as const, target: 21 },
                  { label: 'Domination (5v5 NBA + WNBA)', sz: 5 as const, theme: 'nba_arena' as const, target: null },
                  { label: 'Showdown Tier Ladder (5v5)', sz: 5 as const, theme: 'proving_grounds' as const, target: null }
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    className="lobby3d-item-card selected"
                    onClick={() =>
                      launchMatchWithContext({
                        sourceLabel: `MyTEAM ${m.label}`,
                        courtTheme: m.theme,
                        playersPerSide: m.sz,
                        homeTeamId: 0,
                        awayTeamId: 10,
                        homeJerseyVariant: 'city',
                        useMyPlayer: false,
                        targetScore: m.target,
                        quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                        difficultyLabel: 'All-Star',
                        repMult: 1.2,
                        badgeMult: 1.2,
                        vcBonus: 350,
                        isMyTeam: true
                      })
                    }
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">🃏 {m.label}</div>
                      <div className="lobby3d-item-sub">Earn MTP & Season XP with your custom card squad</div>
                    </div>
                    <span className="lobby3d-badge">PLAY</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 4: MyNBA (6 ERAS) ================= */}
        {mainTab === 'mynba' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>6 PLAYABLE MyNBA ERAS</span><span>FRANCHISE</span></div>
              <div className="lobby3d-scroll-list">
                {HOOPS_ERAS.map((era) => {
                  const ft = getHoops2K26TeamById(era.featuredTeamId);
                  const rv = getHoops2K26TeamById(era.rivalTeamId);
                  return (
                    <button
                      key={era.id}
                      type="button"
                      className="lobby3d-item-card selected"
                      onClick={() =>
                        launchMatchWithContext({
                          sourceLabel: `MyNBA ${era.name}`,
                          courtTheme: 'nba_arena',
                          playersPerSide: 5,
                          homeTeamId: ft.id,
                          awayTeamId: rv.id,
                          homeJerseyVariant: 'home',
                          useMyPlayer: false,
                          targetScore: null,
                          quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                          difficultyLabel: prof.settings.difficulty,
                          repMult: 1.0,
                          badgeMult: 1.0,
                          vcBonus: 400
                        })
                      }
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{ft.icon} {era.name} ({era.years})</div>
                        <div className="lobby3d-item-sub">{ft.name} vs {rv.name} · {era.ruleNote}</div>
                      </div>
                      <span className="lobby3d-badge">TIP OFF</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">MyNBA Eras · Play Authentic Classic & Modern Dynasties</div>
            </div>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>FRANCHISE SNAPSHOT</span><span>12m / 5m SIM</span></div>
              <div className="hoops-matchup-box">
                <div><strong>Featured Dynasty:</strong> '96 Chicago Bulls (Michael Jordan 99 OVR) vs '01 LA Lakers (Kobe & Shaq)</div>
                <small>All 6 Eras launch directly into 5v5 Hardwood Arena with authentic star rosters and full 2K Camera.</small>
              </div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'Eras Clash: 96 Bulls vs 01 Lakers',
                    courtTheme: 'nba_arena',
                    playersPerSide: 5,
                    homeTeamId: 14,
                    awayTeamId: 15,
                    homeJerseyVariant: 'home',
                    useMyPlayer: false,
                    targetScore: null,
                    quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                    difficultyLabel: prof.settings.difficulty,
                    repMult: 1.15,
                    badgeMult: 1.1,
                    vcBonus: 500
                  })
                }
              >
                🏆 PLAY '96 BULLS VS '01 LAKERS
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 5: THE W ================= */}
        {mainTab === 'the_w' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>THE W — WNBA FRANCHISES</span><span>4 SQUADS</span></div>
              <div className="lobby3d-card-list">
                {HOOPS_2K26_TEAMS.filter((t) => t.league === 'wnba').map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`lobby3d-item-card ${homeTeamId === t.id ? 'selected' : ''}`}
                    onClick={() => setHomeTeamId(t.id)}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{t.icon} {t.name}</div>
                      <div className="lobby3d-item-sub">{t.starters.map((s) => s.name.split(' ').pop()).join(', ')}</div>
                    </div>
                    <span className="lobby3d-badge">WNBA</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">THE W · A'ja Wilson, Breanna Stewart, Caitlin Clark & Napheesa Collier</div>
            </div>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>THE W ONLINE & PLAY NOW</span></div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'THE W — WNBA Showcase',
                    courtTheme: 'wnba_arena',
                    playersPerSide: 5,
                    homeTeamId: homeTeam.league === 'wnba' ? homeTeamId : 10,
                    awayTeamId: homeTeamId === 11 ? 12 : 11,
                    homeJerseyVariant: 'home',
                    useMyPlayer: false,
                    targetScore: null,
                    quarterSec: Math.max(45, Math.round(prof.settings.quarterLengthMin * 60)),
                    difficultyLabel: prof.settings.difficulty,
                    repMult: 1.15,
                    badgeMult: 1.25,
                    vcBonus: 450
                  })
                }
              >
                ⚡ TIP OFF WNBA ARENA (5v5)
              </button>
              <button
                type="button"
                className="lobby3d-seg-btn active"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'The W Online 3v3',
                    courtTheme: 'park',
                    playersPerSide: 3,
                    homeTeamId: 12,
                    awayTeamId: 10,
                    homeJerseyVariant: 'home',
                    useMyPlayer: false,
                    targetScore: 21,
                    quarterSec: 180,
                    difficultyLabel: 'All-Star',
                    repMult: 1.2,
                    badgeMult: 1.3,
                    vcBonus: 350
                  })
                }
              >
                🏀 THE W ONLINE 3v3 (TO 21)
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 6: LEARN 2K ================= */}
        {mainTab === 'learn_2k' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>LEARN 2K — TRAINING LAB</span><span>PRO TIPS</span></div>
              <div className="lobby3d-kit-box">
                <div className="lobby3d-kit-item"><strong>1. Shot Meter Off Boost:</strong> Turn Jump Shot Meter OFF in Features → Settings for an automatic wider Green Window!</div>
                <div className="lobby3d-kit-item"><strong>2. 3 Adrenaline Bars (■■■):</strong> Explosive turbo launches & steal lunges spend 1 bar. Recharges faster with Starter II REP!</div>
                <div className="lobby3d-kit-item"><strong>3. Icon Passing [Tab/E] & Playcalling [Q]:</strong> Tap Icon Pass to beam passes to teammates 1–4, or press Q for 3D Pick & Roll hardwood diagrams.</div>
                <div className="lobby3d-kit-item"><strong>4. Takeover Lv.1–5 [T]:</strong> Fill all 5 levels through Greens, Assists & Stops, then Ignite for massive shooting & clamp boosts.</div>
              </div>
            </div>
            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">Master Green Timing, 2K Camera & On-the-Fly Coaching</div>
            </div>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>INTERACTIVE PRACTICE</span></div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() =>
                  launchMatchWithContext({
                    sourceLabel: 'Learn 2K Shooting & Playcalling Lab',
                    courtTheme: 'mycourt',
                    playersPerSide: 2,
                    homeTeamId: activeMp.nbaTeamId,
                    awayTeamId: 2,
                    homeJerseyVariant: 'home',
                    useMyPlayer: true,
                    targetScore: 21,
                    quarterSec: 300,
                    difficultyLabel: 'Rookie',
                    repMult: 0.6,
                    badgeMult: 1.5,
                    vcBonus: 250,
                    isPractice: true
                  })
                }
              >
                🎓 LAUNCH PRACTICE COURT
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 7: SEASON PASS & CHALLENGES ================= */}
        {mainTab === 'season' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title">
                <span>SEASON PASS TRACK</span>
                <span>LEVEL {seasonLevel}/40</span>
              </div>
              <div className="hoops-matchup-box">
                <div><strong>Active Track:</strong> {prof.seasonPassTier} Pass · Season XP: {prof.seasonXp}</div>
                <div><strong>2XP Coins Owned:</strong> {prof.doubleXpCoins}</div>
                <button
                  type="button"
                  className="lobby3d-seg-btn active"
                  disabled={prof.doubleXpCoins <= 0}
                  onClick={() => {
                    prof.doubleXpCoins -= 1;
                    prof.doubleXpUntilMs = Date.now() + 3600 * 1000;
                    persistHoops2K26();
                    notify('⚡ Activated 1-Hour 2XP Coin (2x REP & Season XP)!');
                    bump();
                  }}
                >
                  ⚡ POP 1-HOUR 2XP COIN ({prof.doubleXpCoins})
                </button>
              </div>
              <div className="lobby3d-sec-title"><span>DAILY CHALLENGES</span><span>RESET 24H</span></div>
              <div className="hoops-stack-list">
                {prof.dailyChallenges.tasks.map((task) => {
                  const done = task.progress >= task.target;
                  return (
                    <div key={task.id} className="hoops-pickem-row">
                      <span>{task.label} ({task.progress}/{task.target})</span>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={!done || task.claimed}
                        onClick={() => {
                          task.claimed = true;
                          prof.vc += task.vcReward;
                          persistHoops2K26();
                          notify(`Claimed +${task.vcReward} VC!`);
                          bump();
                        }}
                      >
                        {task.claimed ? 'DONE ✓' : `+${task.vcReward} VC`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">Season 1 · Lv.{seasonLevel}/40 · Lifetime Challenges {prof.lifetimeCleared}/300</div>
            </div>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>6 PROGRESSION LADDERS</span></div>
              <div className="hoops-nav-body">
                <div><strong>REP:</strong> {repInfo.tier.label} ({repInfo.pct}%)</div>
                <div><strong>Crew:</strong> [{prof.crewTag}] Lv.{prof.crewLevel}/30 (+{crewBonuses.vcBonusPct}% VC)</div>
                <div><strong>Plate:</strong> <span style={{ color: plateInfo.hex }}>{plateInfo.label}</span></div>
                <div><strong>Street Kings:</strong> Boss Lv.{prof.streetKingsLevel}/40</div>
                <div><strong>MyPLAYER OVR:</strong> {activeOvr} OVR</div>
              </div>
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  setMainTab('mycareer');
                  setMyCareerView('city');
                }}
              >
                🏙️ GRIND REP IN THE CITY
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 8: FEATURES (CREATORS, BEATS, LOCKER CODES, SETTINGS) ================= */}
        {mainTab === 'features' && (
          <>
            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>CREATOR STUDIOS & SETTINGS</span></div>
              <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                {([
                  ['shoes', '👟 Shoe Creator'],
                  ['jumpshot', '🎯 Jump Shot'],
                  ['mycourt', '🏠 MyCOURT'],
                  ['beats', '🎵 2K Beats'],
                  ['locker', '🎟️ Locker Codes'],
                  ['settings', '⚙️ Settings']
                ] as Array<[FeaturesSubTab, string]>).map(([id, lbl]) => (
                  <button
                    key={id}
                    type="button"
                    className={`lobby3d-seg-btn ${featuresTab === id ? 'active' : ''}`}
                    onClick={() => setFeaturesTab(id)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {featuresTab === 'shoes' && (
                <div className="hoops-creator-box">
                  <input className="lobby3d-search" value={shoeName} onChange={(e) => setShoeName(e.target.value)} placeholder="Shoe Name" />
                  <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                    {SHOE_BRANDS.map((br) => (
                      <button key={br} type="button" className={`lobby3d-mini-btn ${shoeBrand === br ? 'accent' : ''}`} onClick={() => setShoeBrand(br)}>
                        {br}
                      </button>
                    ))}
                  </div>
                  <div className="lobby3d-seg-row">
                    {(['Low', 'Mid', 'High'] as const).map((c) => (
                      <button key={c} type="button" className={`lobby3d-seg-btn ${shoeCut === c ? 'active' : ''}`} onClick={() => setShoeCut(c)}>{c}</button>
                    ))}
                  </div>
                  <div className="hoops-color-grid">
                    <label>Upper <input type="color" value={shoeUpper} onChange={(e) => setShoeUpper(e.target.value)} /></label>
                    <label>Sole <input type="color" value={shoeSole} onChange={(e) => setShoeSole(e.target.value)} /></label>
                    <label>Accent <input type="color" value={shoeAccent} onChange={(e) => setShoeAccent(e.target.value)} /></label>
                    <label>Laces <input type="color" value={shoeLaces} onChange={(e) => setShoeLaces(e.target.value)} /></label>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-cta-btn"
                    onClick={() => {
                      const created: CustomShoeDesign = {
                        id: `shoe_${Date.now().toString(36)}`,
                        name: shoeName.trim() || 'Custom 2K26',
                        brand: shoeBrand,
                        cut: shoeCut,
                        upperHex: shoeUpper,
                        soleHex: shoeSole,
                        accentHex: shoeAccent,
                        lacesHex: shoeLaces
                      };
                      prof.customShoes = [created, ...prof.customShoes].slice(0, 12);
                      activeMp.equippedShoeId = created.id;
                      persistHoops2K26();
                      ArcadeAudio.play('win');
                      notify(`👟 Saved & Equipped ${created.brand} "${created.name}" on your 3D MyPLAYER!`);
                      bump();
                    }}
                  >
                    👟 SAVE & EQUIP ON 3D MyPLAYER
                  </button>
                </div>
              )}

              {featuresTab === 'jumpshot' && (
                <div className="hoops-creator-box">
                  <input className="lobby3d-search" value={jsDraft.name} onChange={(e) => setJsDraft({ ...jsDraft, name: e.target.value })} placeholder="Jump Shot Name" />
                  <label className="hoops-field-row">Base
                    <select className="hoops-select" value={jsDraft.base} onChange={(e) => setJsDraft({ ...jsDraft, base: e.target.value })}>
                      {['Stephen Curry', 'Tracy McGrady', 'Caitlin Clark', 'Kobe Bryant', 'Jayson Tatum', 'Nikola Jokic'].map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </label>
                  <label className="hoops-field-row">Upper 1
                    <select className="hoops-select" value={jsDraft.upper1} onChange={(e) => setJsDraft({ ...jsDraft, upper1: e.target.value })}>
                      {['Oscar Robertson', 'Saddiq Bey', 'Troy Brown Jr.', 'Sabrina Ionescu', 'Kyle Korver', 'Michael Jordan'].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </label>
                  <label className="hoops-field-row">Upper 2
                    <select className="hoops-select" value={jsDraft.upper2} onChange={(e) => setJsDraft({ ...jsDraft, upper2: e.target.value })}>
                      {['Saddiq Bey', 'Oscar Robertson', 'Troy Brown Jr.', 'Sabrina Ionescu', 'Kyle Korver', 'Michael Jordan'].map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </label>
                  <label className="hoops-field-row">Blend: {jsDraft.blendPct}/{100 - jsDraft.blendPct}
                    <input type="range" min={0} max={100} value={jsDraft.blendPct} onChange={(e) => setJsDraft({ ...jsDraft, blendPct: Number(e.target.value) })} />
                  </label>
                  <div className="lobby3d-seg-row">
                    {(['Slow', 'Normal', 'Quick', 'Very Quick'] as const).map((sp) => (
                      <button key={sp} type="button" className={`lobby3d-seg-btn ${jsDraft.speedTier === sp ? 'active' : ''}`} onClick={() => setJsDraft({ ...jsDraft, speedTier: sp })}>{sp}</button>
                    ))}
                  </div>
                  <div className="lobby3d-seg-row">
                    {(['Jump', 'Set Point', 'Push', 'Release'] as const).map((vc) => (
                      <button key={vc} type="button" className={`lobby3d-seg-btn ${jsDraft.visualCue === vc ? 'active' : ''}`} onClick={() => setJsDraft({ ...jsDraft, visualCue: vc })}>{vc}</button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="lobby3d-cta-btn"
                    onClick={() => {
                      activeMp.jumpShot = { ...jsDraft };
                      prof.settings.visualCue = jsDraft.visualCue;
                      persistHoops2K26();
                      ArcadeAudio.play('win');
                      notify(`🎯 Equipped "${jsDraft.name}" (Speed ${jsEval.releaseSpeed} · Stability ${jsEval.timingStability})!`);
                      bump();
                    }}
                  >
                    🎯 EQUIP CUSTOM JUMP SHOT
                  </button>
                </div>
              )}

              {featuresTab === 'mycourt' && (
                <div className="hoops-creator-box">
                  <input
                    className="lobby3d-search"
                    value={prof.myCourt.centerLogoText}
                    onChange={(e) => {
                      prof.myCourt.centerLogoText = e.target.value.slice(0, 10);
                      persistHoops2K26();
                      bump();
                    }}
                    placeholder="Center Court Logo Text"
                  />
                  <div className="hoops-color-grid">
                    <label>Hardwood <input type="color" value={prof.myCourt.woodHex} onChange={(e) => { prof.myCourt.woodHex = e.target.value; persistHoops2K26(); bump(); }} /></label>
                    <label>Paint <input type="color" value={prof.myCourt.paintHex} onChange={(e) => { prof.myCourt.paintHex = e.target.value; persistHoops2K26(); bump(); }} /></label>
                    <label>Lines <input type="color" value={prof.myCourt.lineHex} onChange={(e) => { prof.myCourt.lineHex = e.target.value; persistHoops2K26(); bump(); }} /></label>
                    <label>Stanchion <input type="color" value={prof.myCourt.stanchionHex} onChange={(e) => { prof.myCourt.stanchionHex = e.target.value; persistHoops2K26(); bump(); }} /></label>
                  </div>
                  <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                    {(['classic_oak', 'northern_lights', 'sunset_city', 'championship_gold'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`lobby3d-seg-btn ${prof.myCourt.muralTheme === m ? 'active' : ''}`}
                        onClick={() => {
                          prof.myCourt.muralTheme = m;
                          persistHoops2K26();
                          bump();
                        }}
                      >
                        {m.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="lobby3d-cta-btn"
                    onClick={() =>
                      launchMatchWithContext({
                        sourceLabel: 'MyCOURT 3D Preview',
                        courtTheme: 'mycourt',
                        playersPerSide: 1,
                        homeTeamId: activeMp.nbaTeamId,
                        awayTeamId: 1,
                        homeJerseyVariant: 'home',
                        useMyPlayer: true,
                        targetScore: 21,
                        quarterSec: 300,
                        difficultyLabel: 'Pro',
                        repMult: 0.7,
                        badgeMult: 1.5,
                        vcBonus: 200,
                        isPractice: true
                      })
                    }
                  >
                    🏠 STEP ON YOUR CUSTOM 3D MyCOURT
                  </button>
                </div>
              )}

              {featuresTab === 'beats' && (
                <div className="hoops-creator-box">
                  <div className="lobby3d-btn-row">
                    <button type="button" className="lobby3d-cta-btn" onClick={() => HoopsBeats.toggle()}>
                      {beatState.isPlaying ? '⏸ PAUSE 2K BEATS' : '▶ PLAY 2K BEATS'}
                    </button>
                    <button type="button" className="lobby3d-seg-btn" onClick={() => HoopsBeats.nextTrack()}>
                      ⏭ NEXT
                    </button>
                  </div>
                  <div className="hoops-mini-scroll">
                    {HOOPS_2K_BEATS.map((tr, idx) => (
                      <div key={tr.id} className="hoops-pickem-row">
                        <span>{beatState.trackIndex === idx && beatState.isPlaying ? '🔊 ' : '🎵 '}{tr.title} <small>({tr.vibe})</small></span>
                        <button type="button" className="lobby3d-mini-btn" onClick={() => HoopsBeats.selectTrack(idx)}>
                          PLAY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {featuresTab === 'locker' && (
                <div className="hoops-creator-box">
                  <input
                    className="lobby3d-search"
                    value={lockerInput}
                    onChange={(e) => setLockerInput(e.target.value)}
                    placeholder="Enter Code (e.g. 2K26-HOOPS-VC)"
                  />
                  <button
                    type="button"
                    className="lobby3d-cta-btn"
                    onClick={() => {
                      const res = redeemHoopsLockerCode(lockerInput, prof.redeemedLockerCodes);
                      notify(res.message);
                      if (res.ok && res.reward) {
                        prof.redeemedLockerCodes = [...prof.redeemedLockerCodes, res.reward.code];
                        if (res.reward.vc) prof.vc += res.reward.vc;
                        if (res.reward.mtp) prof.mtp += res.reward.mtp;
                        if (res.reward.doubleXpCoins) prof.doubleXpCoins += res.reward.doubleXpCoins;
                        if (res.reward.skillBoosts) prof.skillBoosts += res.reward.skillBoosts;
                        if (res.reward.cardId && !prof.ownedCards.includes(res.reward.cardId)) {
                          prof.ownedCards = [...prof.ownedCards, res.reward.cardId];
                        }
                        persistHoops2K26();
                        ArcadeAudio.play('win');
                        setLockerInput('');
                        bump();
                      }
                    }}
                  >
                    🎟️ REDEEM LOCKER CODE
                  </button>
                  <div className="hoops-mini-scroll">
                    {HOOPS_LOCKER_CODES.map((c) => (
                      <div key={c.code} className="hoops-pickem-row">
                        <span><code>{c.code}</code> · {c.label}</span>
                        <button type="button" className="lobby3d-mini-btn" onClick={() => setLockerInput(c.code)}>
                          {prof.redeemedLockerCodes.includes(c.code) ? 'USED ✓' : 'FILL'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {featuresTab === 'settings' && (
                <div className="hoops-creator-box">
                  <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
                    {(['Rookie', 'Pro', 'All-Star', 'Superstar', 'Hall of Fame'] as HoopsDifficulty2K[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`lobby3d-seg-btn ${prof.settings.difficulty === d ? 'active' : ''}`}
                        onClick={() => { prof.settings.difficulty = d; persistHoops2K26(); bump(); }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="hoops-pickem-row">
                    <span>🎯 Jump Shot Meter (OFF = +Green Boost!)</span>
                    <button
                      type="button"
                      className={`lobby3d-mini-btn ${prof.settings.jumpShotMeterOff ? 'accent' : ''}`}
                      onClick={() => {
                        prof.settings.jumpShotMeterOff = !prof.settings.jumpShotMeterOff;
                        persistHoops2K26();
                        bump();
                      }}
                    >
                      {prof.settings.jumpShotMeterOff ? 'OFF (+BOOST)' : 'ON'}
                    </button>
                  </div>
                  <div className="hoops-pickem-row">
                    <span>📹 Camera Angle</span>
                    <button
                      type="button"
                      className="lobby3d-mini-btn accent"
                      onClick={() => {
                        prof.settings.cameraAngle = prof.settings.cameraAngle === '2k' ? 'broadcast' : '2k';
                        persistHoops2K26();
                        bump();
                      }}
                    >
                      {prof.settings.cameraAngle === '2k' ? '2K NORTH-SOUTH' : 'BROADCAST'}
                    </button>
                  </div>
                  <div className="hoops-pickem-row">
                    <span>🎨 Meter Style</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(['comet', 'fang', 'horn'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`lobby3d-mini-btn ${prof.settings.layupMeterStyle === st ? 'accent' : ''}`}
                          onClick={() => { prof.settings.layupMeterStyle = st; persistHoops2K26(); bump(); }}
                        >
                          {st.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="hoops-slider-group">
                    <label>Camera Zoom: {prof.settings.cameraZoom} <input type="range" min={1} max={10} value={prof.settings.cameraZoom} onChange={(e) => { prof.settings.cameraZoom = Number(e.target.value); persistHoops2K26(); bump(); }} /></label>
                    <label>Camera Height: {prof.settings.cameraHeight} <input type="range" min={1} max={10} value={prof.settings.cameraHeight} onChange={(e) => { prof.settings.cameraHeight = Number(e.target.value); persistHoops2K26(); bump(); }} /></label>
                  </div>
                </div>
              )}
            </div>

            <div className="lobby3d-center-spacer">
              <div className="lobby3d-center-caption">
                {featuresTab === 'shoes'
                  ? `Shoe Creator · ${shoeBrand} "${shoeName}" (${shoeCut})`
                  : featuresTab === 'jumpshot'
                    ? `Jump Shot Grades · Height ${jsEval.releaseHeight} · Speed ${jsEval.releaseSpeed} · Stability ${jsEval.timingStability}`
                    : featuresTab === 'mycourt'
                      ? `MyCOURT Designer · Logo "${prof.myCourt.centerLogoText}" · Mural ${prof.myCourt.muralTheme}`
                      : featuresTab === 'beats'
                        ? `2K Beats · Now Playing: ${beatState.currentTrack.title}`
                        : `Hoops 2K26 Features & Competitive Settings`}
              </div>
            </div>

            <div className="lobby3d-panel">
              <div className="lobby3d-sec-title"><span>LIVE PREVIEW SUMMARY</span></div>
              {featuresTab === 'shoes' && (
                <div className="hoops-shoe-preview-card">
                  <div className="hoops-shoe-swatch-row">
                    <span style={{ background: shoeUpper }} title="Upper" />
                    <span style={{ background: shoeSole }} title="Sole" />
                    <span style={{ background: shoeAccent }} title="Accent" />
                    <span style={{ background: shoeLaces }} title="Laces" />
                  </div>
                  <div><strong>{shoeBrand} — {shoeName}</strong> ({shoeCut} Cut)</div>
                  <small>Your saved shoes render directly on your 3D MyPLAYER in The City and every on-court game!</small>
                  <div className="hoops-mini-scroll">
                    {prof.customShoes.map((sh) => (
                      <div key={sh.id} className="hoops-pickem-row">
                        <span>👟 {sh.brand} {sh.name}</span>
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          onClick={() => {
                            activeMp.equippedShoeId = sh.id;
                            persistHoops2K26();
                            notify(`Equipped ${sh.name}!`);
                            bump();
                          }}
                        >
                          {activeMp.equippedShoeId === sh.id ? 'WORN ✓' : 'WEAR'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {featuresTab === 'jumpshot' && (
                <div className="hoops-nav-body">
                  <div>Release Height: <strong>{jsEval.releaseHeight}</strong></div>
                  <div>Release Speed: <strong>{jsEval.releaseSpeed}</strong> ({jsEval.meterSpeedMult}x)</div>
                  <div>Defensive Immunity: <strong>{jsEval.defensiveImmunity}</strong></div>
                  <div>Timing Stability: <strong>{jsEval.timingStability}</strong> (+{(jsEval.greenWindowBonus * 100).toFixed(1)}% Green)</div>
                  <div>Visual Cue: <strong>{jsDraft.visualCue}</strong></div>
                </div>
              )}
              {featuresTab !== 'shoes' && featuresTab !== 'jumpshot' && (
                <div className="hoops-nav-body">
                  <div>Difficulty: <strong>{prof.settings.difficulty}</strong></div>
                  <div>Quarters: <strong>{prof.settings.quarterLengthMin === 0.75 ? '45s Fast' : `${prof.settings.quarterLengthMin} Min`}</strong></div>
                  <div>Shot Meter: <strong>{prof.settings.jumpShotMeterOff ? 'OFF (+Green Boost)' : `${prof.settings.layupMeterStyle.toUpperCase()}`}</strong></div>
                  <div>Camera: <strong>{prof.settings.cameraAngle === '2k' ? '2K North-South' : 'Broadcast'}</strong></div>
                  <div>PlayVision: <strong>{prof.settings.playVision.toUpperCase()}</strong></div>
                </div>
              )}
              <button
                type="button"
                className="lobby3d-back-btn"
                style={{ marginTop: 'auto' }}
                onClick={onBack}
              >
                ◀ RETURN TO ARCADE HUB
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
