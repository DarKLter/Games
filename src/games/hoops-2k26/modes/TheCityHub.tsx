// ============================================================================
// PART 6 — INTERACTIVE DRAGGABLE "THE CITY" MAP + 11 PLAYABLE LANDMARKS +
// GATORADE 3 PLAYABLE TIMING MINI-GAMES + WALKABLE 3D PLAZA TOGGLE
// ============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RosterStore } from '../hybrid/rosterStore';
import { UltimateHybridStore, useUltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { MatchVenueId, UIEraMode } from '../hybrid/types';
import {
  buildToPlayerProfile,
  clampNum,
  ModesStore,
  useModesStore,
} from './modesStore';
import {
  CITY_LANDMARKS,
  STREET_KINGS_BOSSES,
  SWAG_STORE_CATALOG,
  type CityLandmarkId,
  type CityParkId,
  type MapPinCategory,
  type MyCourtCustomization,
  type SwagCategory,
} from './modesTypes';
import { WalkablePlaza3D } from './WalkablePlaza3D';
import './modesHud.css';

export interface TheCityHubProps {
  eraMode: UIEraMode;
  initialViewMode?: 'MAP' | 'PLAZA_3D';
  onBack: () => void;
  onOpenBuilder: () => void;
  onNotify: (msg: string) => void;
}

const PIN_CATEGORIES: Array<{ id: MapPinCategory; label: string; color: string }> = [
  { id: 'SQUAD_RALLY', label: 'Squad Rally', color: '#06b6d4' },
  { id: 'HOT_STREAK', label: 'Hot Streak Court', color: '#f59e0b' },
  { id: 'RIVAL_WATCH', label: 'Rival Watch', color: '#ef4444' },
  { id: 'FAVORITE_GRIND', label: 'Favorite Grind', color: '#22c55e' },
];

const PARK_OPTIONS: Array<{ id: CityParkId; name: string; eraTag: string; venue: MatchVenueId; accent: string }> = [
  { id: 'SKYLINE_PARK', name: 'Skyline Park (2K26)', eraTag: '2K26 Rooftop', venue: 'SKYLINE_PARK', accent: '#06b6d4' },
  { id: 'RIVET_CITY', name: 'Rivet City', eraTag: '2K16 Throwback', venue: 'RIVET_CITY', accent: '#ef4444' },
  { id: 'SUNSET_BEACH', name: 'Sunset Beach', eraTag: '2K16 Throwback', venue: 'SUNSET_BEACH', accent: '#f97316' },
  { id: 'OLD_TOWN', name: 'Old Town Flyers', eraTag: '2K16 Throwback', venue: 'OLD_TOWN', accent: '#a855f7' },
];

const LIVE_PARK_COURTS = [
  { id: 'c1', title: 'Court 1 · 3v3 Got Next', status: 'Open Spot · 5/6 Ready', playersPerSide: 3 as const, target: 21, streakVc: 400 },
  { id: 'c2', title: 'Court 2 · 18-16 — 4-Win Streak!', status: 'Streak Breaker Bounty Active', playersPerSide: 3 as const, target: 21, streakVc: 1200 },
  { id: 'c3', title: 'Court 3 · 2v2 Make-It-Take-It', status: 'Fast Streetball · 3/4 Ready', playersPerSide: 2 as const, target: 21, streakVc: 650 },
  { id: 'c4', title: 'Court 4 · 1v1 King of the Court', status: 'Iso Gauntlet · Instant Tip-Off', playersPerSide: 1 as const, target: 11, streakVc: 850 },
];

const THEATER_PLAYLISTS = [
  { id: 'th_1v1', title: '1v1 Instant', desc: 'Zero wait time, pure iso to 11.', playersPerSide: 1 as const, target: 11, speedMult: 1, threeVal: 3, vc: 950 },
  { id: 'th_3v3', title: '3v3 No Squads', desc: 'Solo queue 3v3 street shootout to 21.', playersPerSide: 3 as const, target: 21, speedMult: 1, threeVal: 3, vc: 1100 },
  { id: 'th_2x', title: '2x Speed Arcade', desc: 'Hyper-tempo 1.45x movement & turbo arcade rush!', playersPerSide: 3 as const, target: 21, speedMult: 1.45, threeVal: 3, vc: 1250 },
  { id: 'th_4pt', title: '3PT = 4 Points', desc: 'Deep bombs count for 4 points! Shooters paradise.', playersPerSide: 3 as const, target: 24, speedMult: 1.05, threeVal: 4, vc: 1300 },
];

const SWAG_TABS: Array<{ id: SwagCategory; label: string }> = [
  { id: 'HEADBAND', label: 'Headbands' },
  { id: 'SLEEVE', label: 'Sleeves' },
  { id: 'COMPRESSION', label: 'Compression' },
  { id: 'PARK_JERSEY', label: 'Park Jerseys' },
  { id: 'GREEN_VFX', label: 'Green VFX' },
  { id: 'SNEAKER', label: 'Sneakers' },
];

export const TheCityHub: React.FC<TheCityHubProps> = ({
  eraMode,
  initialViewMode = 'MAP',
  onBack,
  onOpenBuilder,
  onNotify,
}) => {
  const hybridSave = useUltimateHybridStore();
  const modes = useModesStore();
  const activeBuild = modes.buildSlots[modes.activeBuildSlotIndex] ?? modes.buildSlots[0];

  const [viewMode, setViewMode] = useState<'MAP' | 'PLAZA_3D'>(initialViewMode);
  const [selectedLandmark, setSelectedLandmark] = useState<CityLandmarkId>('CENTRAL_PLAZA');

  // Map Pan & Zoom State
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number; moved: boolean }>({
    active: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    moved: false,
  });
  const longPressTimerRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Pin Dropping State
  const [dropPinMode, setDropPinMode] = useState(false);
  const [pinCategory, setPinCategory] = useState<MapPinCategory>('SQUAD_RALLY');
  const [pinLabelDraft, setPinLabelDraft] = useState('');

  // Sub-tabs inside Landmarks
  const [recMode, setRecMode] = useState<'SQUADS' | 'NO_SQUADS'>('NO_SQUADS');
  const [proAmMode, setProAmMode] = useState<'3V3' | '5V5'>('3V3');
  const [crewShopTab, setCrewShopTab] = useState<'CREW' | 'SWAGS'>('CREW');
  const [swagCategory, setSwagCategory] = useState<SwagCategory>('GREEN_VFX');
  const [crewNameDraft, setCrewNameDraft] = useState(modes.crew.name);
  const [crewTagDraft, setCrewTagDraft] = useState(modes.crew.tag);

  // Playable Gatorade Timing Mini-Game State
  const [activeDrill, setActiveDrill] = useState<'treadmill' | 'vertical' | 'reaction'>('treadmill');
  const [drillRunning, setDrillRunning] = useState(false);
  const [drillCursor, setDrillCursor] = useState(0); // 0..100 oscillating
  const [drillHits, setDrillHits] = useState(0);
  const [drillAttempts, setDrillAttempts] = useState(0);
  const [drillResultMsg, setDrillResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!drillRunning) return;
    let rafId = 0;
    let phase = 0;
    let last = performance.now();
    const speed = activeDrill === 'reaction' ? 3.8 : activeDrill === 'vertical' ? 3.1 : 2.6;
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phase += dt * speed;
      setDrillCursor(50 + Math.sin(phase) * 48);
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [drillRunning, activeDrill]);

  const handleGatoradeHit = () => {
    if (!drillRunning) {
      setDrillRunning(true);
      setDrillHits(0);
      setDrillAttempts(0);
      setDrillResultMsg(null);
      return;
    }
    const distFromCenter = Math.abs(drillCursor - 50);
    const hitPoints = distFromCenter <= 10 ? 25 : distFromCenter <= 20 ? 15 : 5;
    const nextHits = drillHits + hitPoints;
    const nextAttempts = drillAttempts + 1;
    setDrillHits(nextHits);
    setDrillAttempts(nextAttempts);
    HybridAudioEngine.playUi(distFromCenter <= 12 ? 'confirm' : 'click', eraMode);

    if (nextAttempts >= 4) {
      setDrillRunning(false);
      const finalScore = clampNum(nextHits, 0, 100);
      const res = ModesStore.completeGatoradeDrill(activeDrill, finalScore);
      const msg = res.grantedBoost
        ? `Workout Score ${finalScore}/100! +4 Stamina & Turbo Boost active for 5 games (+${res.vcAwarded} VC)!`
        : `Workout Score ${finalScore}/100 (+${res.vcAwarded} VC). Score 60+ to unlock +4 Stamina Boost!`;
      setDrillResultMsg(msg);
      onNotify(msg);
    }
  };

  // Helper: assemble active MyPLAYER + teammates roster
  const buildCityTeamRoster = (teamId: string) => {
    const team = RosterStore.getTeamById(teamId);
    const mp = buildToPlayerProfile(activeBuild);
    const rest = team.roster.filter((p) => p.id !== mp.id).slice(0, 7);
    return [mp, ...rest];
  };

  const staminaBonus = modes.gatoradeBoostGamesLeft > 0 ? 4 : 0;

  // Launchers for each playable City landmark
  const launchParkCourt = (court: (typeof LIVE_PARK_COURTS)[number]) => {
    const parkMeta = PARK_OPTIONS.find((p) => p.id === modes.activePark) ?? PARK_OPTIONS[0];
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_PARK',
      title: `${parkMeta.name} · ${court.title}`,
      subtitle: court.status,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k14_mia',
        venue: parkMeta.venue,
        playersPerSide: court.playersPerSide,
        targetScore: court.target,
        quarterLengthMin: 5,
        difficulty: 'All-Star',
        sideControl: 'HOME',
        modeLabel: `${parkMeta.name} ${court.playersPerSide}v${court.playersPerSide}`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      staminaBonus,
      makeItTakeIt: court.playersPerSide <= 2,
      parkStreakBonusVc: court.streakVc,
      objectiveBanner: `${court.title} · First to ${court.target} · Streak Bonus +${court.streakVc} VC`,
      baseVcReward: 700,
      baseRepReward: 320,
    });
  };

  const launchRecMatch = () => {
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_REC',
      title: `The REC 5v5 (${recMode === 'SQUADS' ? 'Squads' : 'No-Squads'})`,
      subtitle: '4-Quarter Competitive Indoor Gym',
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k26_bos',
        venue: 'ARENA_2K26',
        playersPerSide: 5,
        targetScore: null,
        quarterLengthMin: 5,
        difficulty: 'All-Star',
        sideControl: 'HOME',
        modeLabel: `The REC 5v5 · ${recMode}`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      staminaBonus,
      objectiveBanner: `The REC 5v5 (${recMode}) · Win & hold an A- Teammate Grade for max Rep!`,
      baseVcReward: 1400,
      baseRepReward: 520,
    });
  };

  const launchTheaterPlaylist = (pl: (typeof THEATER_PLAYLISTS)[number]) => {
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_THEATER',
      title: `The Theater · ${pl.title}`,
      subtitle: pl.desc,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k26_lal',
        venue: 'BLACKTOP_CAGE',
        playersPerSide: pl.playersPerSide,
        targetScore: pl.target,
        difficulty: 'Pro',
        sideControl: 'HOME',
        modeLabel: `Theater: ${pl.title}`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      speedMultiplier: pl.speedMult,
      threePointValue: pl.threeVal,
      staminaBonus,
      objectiveBanner: `Theater Event: ${pl.title} · ${pl.desc}`,
      baseVcReward: pl.vc,
      baseRepReward: 340,
    });
  };

  const launchProvingGrounds = () => {
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_PROVING_GROUNDS',
      title: `Proving Grounds · ${modes.provingGrounds.tier} Tier`,
      subtitle: 'High-Risk Green-or-Miss Ranked Rules Enforced',
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k26_den',
        venue: 'ARENA_2K26',
        playersPerSide: 3,
        targetScore: 21,
        difficulty: 'Superstar',
        sideControl: 'HOME',
        modeLabel: `Proving Grounds (${modes.provingGrounds.tier})`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      forceGreenOrMiss: true,
      staminaBonus,
      objectiveBanner: `RANKED ${modes.provingGrounds.tier.toUpperCase()} · Green-or-Miss Shooting Enforced · First to 21`,
      baseVcReward: 1600,
      baseRepReward: 600,
    });
  };

  const launchProAm = () => {
    const pCount = proAmMode === '3V3' ? 3 : 5;
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_PRO_AM',
      title: `Pro-Am Summit · ${modes.crew.name} [${modes.crew.tag}]`,
      subtitle: `${proAmMode} Crew Championship Bracket`,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k26_bos',
        venue: 'ARENA_2K26',
        playersPerSide: pCount,
        targetScore: proAmMode === '3V3' ? 21 : null,
        quarterLengthMin: 5,
        difficulty: 'Superstar',
        sideControl: 'HOME',
        modeLabel: `Pro-Am ${proAmMode} · [${modes.crew.tag}]`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      staminaBonus,
      objectiveBanner: `Pro-Am Summit ${proAmMode} · Representing [${modes.crew.tag}] ${modes.crew.name}`,
      baseVcReward: 1850,
      baseRepReward: 680,
    });
  };

  const launchStreetKingsBoss = (boss: (typeof STREET_KINGS_BOSSES)[number]) => {
    HybridAudioEngine.playUi('confirm', eraMode);
    const awayBase = RosterStore.getTeamById('2k14_mia');
    const bossProfile = {
      ...awayBase.roster[0],
      id: boss.id,
      name: boss.name,
      position: boss.position,
      jerseyNumber: boss.jerseyNumber,
      heightInches: boss.heightInches,
      ovr: boss.ovr,
      archetype: boss.specialty,
      attributes: { ...awayBase.roster[0].attributes, ...boss.attributes },
    };
    ModesStore.launchModeMatch({
      kind: 'CITY_STREET_KINGS',
      title: `Street Kings Boss: ${boss.name} (${boss.ovr} OVR)`,
      subtitle: boss.title,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k14_mia',
        venue: 'STREET_KINGS',
        playersPerSide: 3,
        targetScore: 21,
        difficulty: boss.ovr >= 96 ? 'Hall of Fame' : 'Superstar',
        sideControl: 'HOME',
        modeLabel: `Street Kings: ${boss.name}`,
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      customAwayRoster: [bossProfile, ...awayBase.roster.slice(1, 5)],
      streetKingsBossId: boss.id,
      staminaBonus,
      objectiveBanner: `BOSS BOUNTY: Defeat ${boss.name} (${boss.ovr} OVR) to 21 for +${boss.vcBounty.toLocaleString()} VC!`,
      baseVcReward: boss.vcBounty,
      baseRepReward: boss.badgeXpReward,
    });
  };

  const launchMyCourt = (sparring: boolean) => {
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_MYCOURT',
      title: sparring ? 'MyCOURT · 1v1 AI Sparring' : 'MyCOURT · Private Shootaround',
      subtitle: `Floor: ${modes.myCourt.woodFloor.replace(/_/g, ' ')} · Rim: ${modes.myCourt.rimSound.replace(/_/g, ' ')}`,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: activeBuild.careerTeamId || '2k26_okc',
        awayTeamId: '2k26_lal',
        venue: 'SKYLINE_PARK',
        playersPerSide: 1,
        targetScore: sparring ? 11 : null,
        quarterLengthMin: 5,
        difficulty: sparring ? 'All-Star' : 'Rookie',
        sideControl: 'HOME',
        modeLabel: sparring ? 'MyCOURT 1v1' : 'MyCOURT Freestyle',
      },
      customHomeRoster: buildCityTeamRoster(activeBuild.careerTeamId || '2k26_okc'),
      staminaBonus,
      objectiveBanner: sparring
        ? 'MyCOURT 1v1 Sparring · First to 11 wins!'
        : 'MyCOURT Open Freestyle · Dial in your custom Jumpshot timing.',
      baseVcReward: sparring ? 650 : 250,
    });
  };

  const launchMyCareerNbaGame = () => {
    const careerTeams = RosterStore.getAllTeams().filter((t) => t.era === '2K26');
    const opp = careerTeams[(activeBuild.careerGameNumber * 3) % Math.max(1, careerTeams.length)];
    const homeId = activeBuild.careerTeamId || '2k26_okc';
    const oppId = opp && opp.id !== homeId ? opp.id : '2k26_bos';
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'CITY_MYCAREER_NBA',
      title: `MyCAREER Game #${activeBuild.careerGameNumber} · Out of Bounds`,
      subtitle: `${activeBuild.name} vs ${opp ? `${opp.city} ${opp.name}` : 'Rivals'}`,
      returnScreen: 'CITY_EXPLORE',
      matchPatch: {
        homeTeamId: homeId,
        awayTeamId: oppId,
        venue: 'ARENA_2K26',
        playersPerSide: 5,
        targetScore: null,
        quarterLengthMin: 5,
        difficulty: 'All-Star',
        sideControl: 'HOME',
        modeLabel: `MyCAREER NBA Game #${activeBuild.careerGameNumber}`,
      },
      customHomeRoster: buildCityTeamRoster(homeId),
      starPlayerTargetName: activeBuild.name,
      staminaBonus,
      objectiveBanner: `Out of Bounds Story · Game #${activeBuild.careerGameNumber} · Lead your franchise to victory!`,
      baseVcReward: 1500,
      baseRepReward: 480,
    });
  };

  // --- Map Coordinate Conversions & Pointer Pan/Zoom/Pin ---
  const clientToMapCoords = (clientX: number, clientY: number): { x: number; y: number } | null => {
    const el = stageRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const localX = (clientX - cx - pan.x) / zoom + 500;
    const localY = (clientY - cy - pan.y) / zoom + 350;
    return { x: clampNum(localX, 30, 970), y: clampNum(localY, 30, 670) };
  };

  const dropPinAtClient = (clientX: number, clientY: number) => {
    const coords = clientToMapCoords(clientX, clientY);
    if (!coords) return;
    const catMeta = PIN_CATEGORIES.find((c) => c.id === pinCategory) ?? PIN_CATEGORIES[0];
    ModesStore.addCityPin(pinLabelDraft || catMeta.label, pinCategory, coords.x, coords.y);
    setPinLabelDraft('');
    setDropPinMode(false);
    HybridAudioEngine.playUi('confirm', eraMode);
    onNotify(`Dropped ${catMeta.label} pin on The City map!`);
  };

  const handleMapPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (dropPinMode) {
      dropPinAtClient(e.clientX, e.clientY);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
      moved: false,
    };
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    const px = e.clientX;
    const py = e.clientY;
    longPressTimerRef.current = window.setTimeout(() => {
      if (dragRef.current.active && !dragRef.current.moved) {
        dragRef.current.active = false;
        dropPinAtClient(px, py);
      }
    }, 550);
  };

  const handleMapPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > 6) {
      dragRef.current.moved = true;
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
    setPan({
      x: clampNum(dragRef.current.origX + dx, -560 * zoom, 560 * zoom),
      y: clampNum(dragRef.current.origY + dy, -380 * zoom, 380 * zoom),
    });
  };

  const handleMapPointerUp = () => {
    dragRef.current.active = false;
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMapWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.14 : -0.14;
    setZoom((z) => clampNum(Number((z + delta).toFixed(2)), 0.6, 2.5));
  };

  const focusMapOn = (x: number, y: number) => {
    setPan({
      x: (500 - x) * zoom,
      y: (350 - y) * zoom,
    });
  };

  const currentLandmarkDef = useMemo(
    () => CITY_LANDMARKS.find((l) => l.id === selectedLandmark) ?? CITY_LANDMARKS[0],
    [selectedLandmark]
  );

  const filteredSwag = useMemo(
    () => SWAG_STORE_CATALOG.filter((i) => i.category === swagCategory),
    [swagCategory]
  );

  const activeParkMeta = PARK_OPTIONS.find((p) => p.id === modes.activePark) ?? PARK_OPTIONS[0];
  const primaryPin = modes.cityPins[0] ?? null;

  return (
    <div className="h2k-mode-root">
      {/* Top Bar */}
      <header className="h2k-mode-topbar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title">THE CITY · 2K26 &amp; 2K16 PARKS</h2>
            <div className="h2k-mode-submeta">
              {activeBuild.name} ({activeBuild.ovr} OVR {activeBuild.position}) · Active Park:{' '}
              {activeParkMeta.name}
            </div>
          </div>
        </div>

        <div className="h2k-mode-top-right">
          <div className="h2k-wallet-strip">
            <span className="h2k-wallet-vc">VC {hybridSave.currencies.vc.toLocaleString()}</span>
            {modes.gatoradeBoostGamesLeft > 0 && (
              <span className="h2k-wallet-boost">
                ⚡ +4 STAMINA ({modes.gatoradeBoostGamesLeft}G)
              </span>
            )}
          </div>
          <button type="button" className="h2k-mode-btn" onClick={onOpenBuilder}>
            🧬 MyPLAYER Builder
          </button>
          <button
            type="button"
            className={`h2k-mode-btn ${viewMode === 'PLAZA_3D' ? 'primary' : 'cyan'}`}
            onClick={() => {
              HybridAudioEngine.playUi('switch', eraMode);
              setViewMode((v) => (v === 'MAP' ? 'PLAZA_3D' : 'MAP'));
            }}
          >
            {viewMode === 'MAP' ? '🚶 WALK 3D PLAZA (60 FPS)' : '🗺️ 2.5D CITY MAP'}
          </button>
        </div>
      </header>

      {/* VIEW MODE B: 60 FPS WALKABLE 3D PLAZA */}
      {viewMode === 'PLAZA_3D' ? (
        <WalkablePlaza3D
          activeBuild={activeBuild}
          onEnterLandmark={(lmId) => {
            setSelectedLandmark(lmId);
            setViewMode('MAP');
            const lm = CITY_LANDMARKS.find((l) => l.id === lmId);
            if (lm) {
              ModesStore.setAvatarMapPos(lm.x, lm.y);
              focusMapOn(lm.x, lm.y);
            }
          }}
          onReturnToMap={() => setViewMode('MAP')}
        />
      ) : (
        /* VIEW MODE A: INTERACTIVE DRAGGABLE & ZOOMABLE 2.5D CITY MAP */
        <div className="h2k-city-shell">
          <div
            ref={stageRef}
            className={`h2k-city-map-stage ${dropPinMode ? 'pin-mode' : ''}`}
            onPointerDown={handleMapPointerDown}
            onPointerMove={handleMapPointerMove}
            onPointerUp={handleMapPointerUp}
            onPointerCancel={handleMapPointerUp}
            onWheel={handleMapWheel}
          >
            {/* Top Map Pinning Bar */}
            <div className="h2k-city-pin-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`h2k-mode-btn ${dropPinMode ? 'primary' : ''}`}
                  onClick={() => setDropPinMode((v) => !v)}
                >
                  {dropPinMode ? '📌 Tap Map to Place Pin' : '📌 DROP PIN'}
                </button>
                <select
                  className="h2k-select"
                  value={pinCategory}
                  onChange={(e) => setPinCategory(e.target.value as MapPinCategory)}
                  style={{ minHeight: 36, fontSize: 12 }}
                >
                  {PIN_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {dropPinMode && (
                  <input
                    type="text"
                    className="h2k-input"
                    placeholder="Custom pin label..."
                    value={pinLabelDraft}
                    onChange={(e) => setPinLabelDraft(e.target.value)}
                    style={{ width: 150, minHeight: 36, fontSize: 12 }}
                  />
                )}
              </div>

              <div className="h2k-muted h2k-tabular">
                Drag to Pan · Wheel / +/- Zoom ({zoom.toFixed(1)}x) · Long-Press to Pin
              </div>
            </div>

            {/* Draggable & Zoomable 2.5D Isometric Map Plane */}
            <div
              className="h2k-city-canvas-transform"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom}) translate(-500px, -350px)`,
              }}
            >
              {/* Architectural Isometric Roads, Boulevard Rings & Distance Vectors */}
              <svg
                width="1000"
                height="700"
                viewBox="0 0 1000 700"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                <defs>
                  <pattern id="cityIsoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="rgba(148,163,184,0.12)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="1000" height="700" fill="url(#cityIsoGrid)" />

                {/* Outer & Inner Ring Boulevards */}
                <ellipse
                  cx="500"
                  cy="350"
                  rx="360"
                  ry="245"
                  fill="rgba(15,23,42,0.42)"
                  stroke="rgba(6,182,212,0.32)"
                  strokeWidth="3"
                />
                <ellipse
                  cx="500"
                  cy="350"
                  rx="165"
                  ry="118"
                  fill="rgba(245,158,11,0.08)"
                  stroke="rgba(245,158,11,0.4)"
                  strokeWidth="2.5"
                />
                {/* Radial Avenues */}
                {CITY_LANDMARKS.filter((l) => l.id !== 'CENTRAL_PLAZA').map((lm) => (
                  <line
                    key={`ave_${lm.id}`}
                    x1="500"
                    y1="350"
                    x2={lm.x}
                    y2={lm.y}
                    stroke="rgba(148,163,184,0.18)"
                    strokeWidth="2"
                  />
                ))}

                {/* Dashed Distance Lines from MyPLAYER Avatar to Tactical Pins */}
                {modes.cityPins.map((pin) => {
                  const dist = Math.round(
                    Math.hypot(pin.x - modes.avatarMapPos.x, pin.y - modes.avatarMapPos.y) * 0.45
                  );
                  const mx = (pin.x + modes.avatarMapPos.x) / 2;
                  const my = (pin.y + modes.avatarMapPos.y) / 2;
                  return (
                    <g key={`vec_${pin.id}`}>
                      <line
                        x1={modes.avatarMapPos.x}
                        y1={modes.avatarMapPos.y}
                        x2={pin.x}
                        y2={pin.y}
                        stroke="#fbbf24"
                        strokeWidth="2.5"
                        strokeDasharray="7 5"
                      />
                      <rect x={mx - 26} y={my - 10} width="52" height="18" rx="4" fill="#0b1120" />
                      <text
                        x={mx}
                        y={my + 3}
                        fill="#fde68a"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {dist}m
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* All 11 Interactive City Landmarks */}
              {CITY_LANDMARKS.map((lm) => {
                const isSel = selectedLandmark === lm.id;
                return (
                  <button
                    key={lm.id}
                    type="button"
                    className={`h2k-city-landmark-node ${isSel ? 'selected' : ''}`}
                    style={
                      {
                        left: lm.x,
                        top: lm.y,
                        '--node-accent': lm.accent,
                      } as React.CSSProperties
                    }
                    onClick={() => {
                      HybridAudioEngine.playUi('click', eraMode);
                      setSelectedLandmark(lm.id);
                      ModesStore.setAvatarMapPos(lm.x, lm.y);
                    }}
                  >
                    <span className="h2k-city-node-disc">{lm.icon}</span>
                    <span className="h2k-city-node-label">{lm.shortName}</span>
                  </button>
                );
              })}

              {/* User MyPLAYER Live Map Avatar */}
              <div
                className="h2k-city-avatar-dot"
                style={{ left: modes.avatarMapPos.x, top: modes.avatarMapPos.y }}
                title={`${activeBuild.name} (${activeBuild.ovr} OVR)`}
              >
                MP
              </div>

              {/* Dropped Tactical Pins */}
              {modes.cityPins.map((pin) => (
                <div
                  key={pin.id}
                  className="h2k-city-pin-marker"
                  style={{ left: pin.x, top: pin.y }}
                  onClick={() => focusMapOn(pin.x, pin.y)}
                  title={`${pin.label} (${pin.category})`}
                >
                  <span style={{ fontSize: 18, lineHeight: 1 }}>📌</span>
                  <span className="h2k-city-pin-tag">{pin.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom Map Zoom & Pin Quick-Jump Controls */}
            <div className="h2k-city-map-controls">
              <button
                type="button"
                className="h2k-mode-btn"
                onClick={() => setZoom((z) => clampNum(Number((z - 0.25).toFixed(2)), 0.6, 2.5))}
              >
                −
              </button>
              <button
                type="button"
                className="h2k-mode-btn"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="h2k-mode-btn"
                onClick={() => setZoom((z) => clampNum(Number((z + 0.25).toFixed(2)), 0.6, 2.5))}
              >
                +
              </button>
              {primaryPin && (
                <button
                  type="button"
                  className="h2k-mode-btn active"
                  onClick={() => focusMapOn(primaryPin.x, primaryPin.y)}
                >
                  Jump: {primaryPin.label}
                </button>
              )}
              {modes.cityPins.length > 0 && (
                <button
                  type="button"
                  className="h2k-mode-btn"
                  onClick={() => ModesStore.clearCityPins()}
                >
                  Clear Pins ({modes.cityPins.length})
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE LANDMARK ACTION INSPECTOR */}
          <aside className="h2k-city-inspector">
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.96)',
              }}
            >
              <div className="h2k-muted" style={{ color: currentLandmarkDef.accent, fontWeight: 700 }}>
                {currentLandmarkDef.district}
              </div>
              <h3 style={{ margin: '4px 0 4px', fontFamily: 'Oswald, sans-serif', fontSize: 20 }}>
                {currentLandmarkDef.icon} {currentLandmarkDef.name}
              </h3>
              <p className="h2k-muted" style={{ margin: 0 }}>
                {currentLandmarkDef.summary}
              </p>
            </div>

            <div className="h2k-city-inspector-body">
              {/* 1. CENTRAL PLAZA & GOLDEN STATUES */}
              {selectedLandmark === 'CENTRAL_PLAZA' && (
                <>
                  <div className="h2k-card">
                    <div className="h2k-section-head">
                      <h3>12-Foot Golden Statues · Top Rep</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { rank: '#1', tag: 'KING_2K26 (You)', build: activeBuild.archetypeName, ovr: activeBuild.ovr, rep: hybridSave.currencies.repXP },
                        { rank: '#2', tag: 'SKYLINE_DEMON', build: '2-Way 3-Level Shot Creator', ovr: 99, rep: 14820 },
                        { rank: '#3', tag: 'HEAT_DYNASTY14', build: 'Inside-Out Playmaker', ovr: 98, rep: 13210 },
                      ].map((r) => (
                        <div
                          key={r.tag}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: 'rgba(245,158,11,0.09)',
                          }}
                        >
                          <div>
                            <strong style={{ color: '#fcd34d' }}>{r.rank} {r.tag}</strong>
                            <div className="h2k-muted">{r.build}</div>
                          </div>
                          <div className="h2k-tabular" style={{ textAlign: 'right', fontSize: 12 }}>
                            <strong>{r.ovr} OVR</strong>
                            <div className="h2k-muted">{r.rep.toLocaleString()} Rep</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h2k-card">
                    <div className="h2k-section-head">
                      <h3>⚡ Quick Build Swap Kiosk (5 Slots)</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {modes.buildSlots.map((slot, idx) => (
                        <button
                          key={slot.id}
                          type="button"
                          className={`h2k-mode-btn ${idx === modes.activeBuildSlotIndex ? 'primary' : ''}`}
                          style={{ justifyContent: 'space-between', width: '100%' }}
                          onClick={() => {
                            ModesStore.setActiveBuildSlot(idx);
                            onNotify(`Swapped to ${slot.name} (${slot.ovr} OVR ${slot.position})!`);
                          }}
                        >
                          <span>
                            #{idx + 1} {slot.name} · {slot.position}
                          </span>
                          <span className="h2k-tabular">{slot.ovr} OVR</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="h2k-mode-btn cyan"
                      style={{ width: '100%', marginTop: 10 }}
                      onClick={onOpenBuilder}
                    >
                      Open Full MyPLAYER Builder
                    </button>
                  </div>
                </>
              )}

              {/* 2. SKYLINE PARK + 2K16 PARK SWITCHER */}
              {selectedLandmark === 'SKYLINE_PARK' && (
                <>
                  <div className="h2k-card">
                    <div className="h2k-section-head">
                      <h3>2K26 + 2K16 Park Switcher</h3>
                    </div>
                    <div className="h2k-grid-2" style={{ gap: 8 }}>
                      {PARK_OPTIONS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className={`h2k-mode-btn ${modes.activePark === p.id ? 'primary' : ''}`}
                          onClick={() => {
                            ModesStore.setActivePark(p.id);
                            onNotify(`Traveled to ${p.name}!`);
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h2k-card">
                    <div className="h2k-section-head">
                      <h3>4 Live Courts · {activeParkMeta.name}</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {LIVE_PARK_COURTS.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: 10,
                            borderRadius: 9,
                            background: 'rgba(30,41,59,0.72)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 13 }}>{c.title}</strong>
                            <div className="h2k-muted">
                              {c.status} · +{c.streakVc} Streak VC
                            </div>
                          </div>
                          <button
                            type="button"
                            className="h2k-mode-btn primary"
                            onClick={() => launchParkCourt(c)}
                          >
                            GOT NEXT
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 3. THE REC */}
              {selectedLandmark === 'THE_REC' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>The REC · 5v5 Lobby</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${recMode === 'NO_SQUADS' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setRecMode('NO_SQUADS')}
                    >
                      No-Squads Solo
                    </button>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${recMode === 'SQUADS' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setRecMode('SQUADS')}
                    >
                      Squads 5v5
                    </button>
                  </div>
                  <p className="h2k-muted">
                    Full 4-quarter indoor 5v5 matchup featuring your active MyPLAYER ({activeBuild.name}) with full Teammate Grade &amp; Rep payouts.
                  </p>
                  <button
                    type="button"
                    className="h2k-mode-btn primary"
                    style={{ width: '100%' }}
                    onClick={launchRecMatch}
                  >
                    Enter The REC (5v5 Tip-Off)
                  </button>
                </div>
              )}

              {/* 4. THE THEATER */}
              {selectedLandmark === 'THE_THEATER' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {THEATER_PLAYLISTS.map((pl) => (
                    <div key={pl.id} className="h2k-card">
                      <div className="h2k-section-head" style={{ marginBottom: 6 }}>
                        <h3>{pl.title}</h3>
                        <span className="h2k-wallet-vc h2k-tabular">+{pl.vc} VC</span>
                      </div>
                      <p className="h2k-muted" style={{ margin: '0 0 10px' }}>
                        {pl.desc}
                      </p>
                      <button
                        type="button"
                        className="h2k-mode-btn cyan"
                        style={{ width: '100%' }}
                        onClick={() => launchTheaterPlaylist(pl)}
                      >
                        Play {pl.title}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. PROVING GROUNDS */}
              {selectedLandmark === 'PROVING_GROUNDS' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Ranked Ladder · {modes.provingGrounds.tier}</h3>
                    <span className="h2k-wallet-vc h2k-tabular">{modes.provingGrounds.rp} RP</span>
                  </div>
                  <div className="h2k-muted" style={{ marginBottom: 10 }}>
                    Record: {modes.provingGrounds.wins}W - {modes.provingGrounds.losses}L · Tiers: Bronze → Silver → Gold → Platinum → Diamond → Elite.
                  </div>
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      background: 'rgba(249,115,22,0.12)',
                      border: '1px solid rgba(249,115,22,0.35)',
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    <strong>High-Risk Enforcement:</strong> 2K26 Green-or-Miss shot timing is locked ON for all Proving Grounds ranked games.
                  </div>
                  <button
                    type="button"
                    className="h2k-mode-btn primary"
                    style={{ width: '100%' }}
                    onClick={launchProvingGrounds}
                  >
                    Queue Ranked Match
                  </button>
                </div>
              )}

              {/* 6. PRO-AM SUMMIT ARENA */}
              {selectedLandmark === 'PRO_AM_SUMMIT' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>
                      [{modes.crew.tag}] {modes.crew.name}
                    </h3>
                    <span className="h2k-wallet-vc h2k-tabular">
                      🏆 {modes.crew.proAmRecord.trophies} Trophies
                    </span>
                  </div>
                  <div className="h2k-muted" style={{ marginBottom: 12 }}>
                    Crew Record: {modes.crew.proAmRecord.wins}W - {modes.crew.proAmRecord.losses}L · Custom Crew Jerseys Equipped
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${proAmMode === '3V3' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setProAmMode('3V3')}
                    >
                      3v3 Bracket
                    </button>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${proAmMode === '5V5' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setProAmMode('5V5')}
                    >
                      5v5 Arena
                    </button>
                  </div>
                  <button
                    type="button"
                    className="h2k-mode-btn primary"
                    style={{ width: '100%' }}
                    onClick={launchProAm}
                  >
                    Launch Pro-Am {proAmMode} Tournament
                  </button>
                </div>
              )}

              {/* 7. STREET KINGS ROMAN COLISEUM */}
              {selectedLandmark === 'STREET_KINGS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {STREET_KINGS_BOSSES.map((boss) => {
                    const defeated = modes.streetKingsDefeatedIds.includes(boss.id);
                    return (
                      <div key={boss.id} className="h2k-card">
                        <div className="h2k-section-head" style={{ marginBottom: 4 }}>
                          <h3 style={{ color: boss.accentColor }}>
                            {boss.name} ({boss.ovr})
                          </h3>
                          <span className="h2k-tabular" style={{ fontSize: 12, color: defeated ? '#4ade80' : '#fbbf24' }}>
                            {defeated ? '✓ DEFEATED' : `+${boss.vcBounty.toLocaleString()} VC`}
                          </span>
                        </div>
                        <div className="h2k-muted" style={{ marginBottom: 10 }}>
                          {boss.title} · {boss.specialty} · +{boss.badgeXpReward} Badge XP
                        </div>
                        <button
                          type="button"
                          className={`h2k-mode-btn ${defeated ? '' : 'crimson'}`}
                          style={{ width: '100%' }}
                          onClick={() => launchStreetKingsBoss(boss)}
                        >
                          {defeated ? 'Rematch Coliseum Boss' : 'Challenge Boss (3v3 to 21)'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8. GATORADE TRAINING FACILITY (3 PLAYABLE TIMING MINI-GAMES) */}
              {selectedLandmark === 'GATORADE_FACILITY' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Gatorade Workout Drills</h3>
                    <span className="h2k-wallet-boost h2k-tabular">
                      Boost: {modes.gatoradeBoostGamesLeft}/5 Games
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {(
                      [
                        { id: 'treadmill', label: 'Treadmill Sprint' },
                        { id: 'vertical', label: 'Vertical Jump' },
                        { id: 'reaction', label: 'Reaction Wall' },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`h2k-mode-btn ${activeDrill === d.id ? 'emerald' : ''}`}
                        style={{ flex: 1, padding: '0 8px' }}
                        onClick={() => {
                          setDrillRunning(false);
                          setActiveDrill(d.id);
                          setDrillResultMsg(null);
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <p className="h2k-muted" style={{ margin: '0 0 10px' }}>
                    Tap <strong>HIT GREEN ZONE</strong> 4 times when the marker passes the center zone (40–60). Score 60+ to unlock <strong>+4 Stamina &amp; Turbo</strong> for your next 5 games!
                  </p>

                  {/* Timing Bar */}
                  <div
                    style={{
                      position: 'relative',
                      height: 30,
                      borderRadius: 8,
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.16)',
                      marginBottom: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '40%',
                        width: '20%',
                        top: 0,
                        bottom: 0,
                        background: 'rgba(34,197,94,0.38)',
                        borderLeft: '2px solid #22c55e',
                        borderRight: '2px solid #22c55e',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${drillCursor}%`,
                        top: 2,
                        bottom: 2,
                        width: 8,
                        marginLeft: -4,
                        borderRadius: 4,
                        background: '#fbbf24',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      marginBottom: 10,
                    }}
                    className="h2k-tabular"
                  >
                    <span>Rep: {drillAttempts}/4</span>
                    <span>Score: {drillHits}/100</span>
                    <span>Best: {modes.gatoradeBestScores[activeDrill]}/100</span>
                  </div>

                  <button
                    type="button"
                    className="h2k-mode-btn emerald"
                    style={{ width: '100%' }}
                    onClick={handleGatoradeHit}
                  >
                    {drillRunning ? '⚡ HIT GREEN ZONE NOW!' : 'Start Gatorade Workout'}
                  </button>

                  {drillResultMsg && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
                      {drillResultMsg}
                    </div>
                  )}
                </div>
              )}

              {/* 9. MYCOURT */}
              {selectedLandmark === 'MYCOURT' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Customize MyCOURT</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                    <label style={{ fontSize: 12 }}>
                      <div className="h2k-muted" style={{ marginBottom: 4 }}>Wood Floor</div>
                      <select
                        className="h2k-select"
                        style={{ width: '100%' }}
                        value={modes.myCourt.woodFloor}
                        onChange={(e) =>
                          ModesStore.updateMyCourt({
                            woodFloor: e.target.value as MyCourtCustomization['woodFloor'],
                          })
                        }
                      >
                        <option value="MAPLE_CLASSIC">Classic Blonde Maple</option>
                        <option value="DARK_WALNUT">Penthouse Dark Walnut</option>
                        <option value="SKYLINE_SLATE">2K26 Skyline Slate</option>
                        <option value="CRIMSON_PARQUET">2K14 Crimson Parquet</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <div className="h2k-muted" style={{ marginBottom: 4 }}>Wall Mural Theme</div>
                      <select
                        className="h2k-select"
                        style={{ width: '100%' }}
                        value={modes.myCourt.wallTheme}
                        onChange={(e) =>
                          ModesStore.updateMyCourt({
                            wallTheme: e.target.value as MyCourtCustomization['wallTheme'],
                          })
                        }
                      >
                        <option value="PENTHOUSE_CITY">Skyline Penthouse Glass</option>
                        <option value="HEAT_DYNASTY">2K14 Heat Dynasty Banners</option>
                        <option value="BLACKTOP_BRICK">Urban Blacktop Brick</option>
                        <option value="NEON_LOUNGE">ProPLAY Obsidian Lounge</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12 }}>
                      <div className="h2k-muted" style={{ marginBottom: 4 }}>Rim &amp; Net Acoustics</div>
                      <select
                        className="h2k-select"
                        style={{ width: '100%' }}
                        value={modes.myCourt.rimSound}
                        onChange={(e) =>
                          ModesStore.updateMyCourt({
                            rimSound: e.target.value as MyCourtCustomization['rimSound'],
                          })
                        }
                      >
                        <option value="PURE_NYLON">Crisp Arena Nylon Swish</option>
                        <option value="CHAIN_NET">Streetball Chain Net</option>
                        <option value="ARENA_CLANK">Classic 2K14 Heavy Rim</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="h2k-mode-btn primary"
                      style={{ flex: 1 }}
                      onClick={() => launchMyCourt(false)}
                    >
                      Freestyle Shootaround
                    </button>
                    <button
                      type="button"
                      className="h2k-mode-btn cyan"
                      style={{ flex: 1 }}
                      onClick={() => launchMyCourt(true)}
                    >
                      1v1 AI Sparring
                    </button>
                  </div>
                </div>
              )}

              {/* 10. NBA ARENA TUNNEL (MyCAREER) */}
              {selectedLandmark === 'NBA_ARENA_TUNNEL' && (
                <div className="h2k-card">
                  <div className="h2k-section-head">
                    <h3>Out of Bounds · NBA Career</h3>
                    <span className="h2k-wallet-vc h2k-tabular">Game #{activeBuild.careerGameNumber}</span>
                  </div>
                  <div className="h2k-muted" style={{ marginBottom: 12 }}>
                    Story Arc: Undrafted Summer League Prospect → Franchise Starter → Dynasty Superstar.
                    <br />
                    Contract: 1,500 VC / Game · Career Record: {activeBuild.careerWins}W-{activeBuild.careerLosses}L ·{' '}
                    {activeBuild.careerPpg} PPG
                  </div>
                  <button
                    type="button"
                    className="h2k-mode-btn crimson"
                    style={{ width: '100%' }}
                    onClick={launchMyCareerNbaGame}
                  >
                    Walk Out Tunnel · Play Next NBA Game
                  </button>
                </div>
              )}

              {/* 11. CREWS HQ & SWAG'S / SNEAKER STORE */}
              {selectedLandmark === 'CREWS_AND_SWAGS' && (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${crewShopTab === 'CREW' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setCrewShopTab('CREW')}
                    >
                      Crews HQ (Lv.{modes.crew.level})
                    </button>
                    <button
                      type="button"
                      className={`h2k-mode-btn ${crewShopTab === 'SWAGS' ? 'primary' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setCrewShopTab('SWAGS')}
                    >
                      Swag's &amp; Sneakers
                    </button>
                  </div>

                  {crewShopTab === 'CREW' ? (
                    <>
                      <div className="h2k-card">
                        <div className="h2k-section-head">
                          <h3>
                            [{modes.crew.tag}] {modes.crew.name} · Lv.{modes.crew.level}/30
                          </h3>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input
                            type="text"
                            className="h2k-input"
                            value={crewNameDraft}
                            onChange={(e) => setCrewNameDraft(e.target.value)}
                            placeholder="Crew Name"
                            style={{ flex: 1 }}
                          />
                          <input
                            type="text"
                            className="h2k-input"
                            value={crewTagDraft}
                            maxLength={4}
                            onChange={(e) => setCrewTagDraft(e.target.value.toUpperCase())}
                            placeholder="TAG"
                            style={{ width: 72 }}
                          />
                        </div>
                        <button
                          type="button"
                          className="h2k-mode-btn cyan"
                          style={{ width: '100%' }}
                          onClick={() => {
                            ModesStore.updateCrewIdentity({
                              name: crewNameDraft.trim() || 'Skyline Dynasty',
                              tag: crewTagDraft.trim() || '2KHY',
                            });
                            onNotify('Saved Crew identity!');
                          }}
                        >
                          Save Crew Name &amp; Tag
                        </button>
                      </div>

                      <div className="h2k-card">
                        <div className="h2k-section-head">
                          <h3>Weekly Crew Goals</h3>
                        </div>
                        {modes.crew.weeklyGoals.map((g) => (
                          <div
                            key={g.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px 0',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                              fontSize: 12,
                            }}
                          >
                            <div>
                              <strong>{g.title}</strong>
                              <div className="h2k-muted h2k-tabular">
                                {g.progress}/{g.target} · +{g.vcReward} VC · +{g.repReward} Rep
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`h2k-mode-btn ${!g.claimed && g.progress >= g.target ? 'primary' : ''}`}
                              disabled={g.claimed || g.progress < g.target}
                              onClick={() => {
                                const res = ModesStore.claimCrewWeeklyGoal(g.id);
                                if (res.ok) onNotify(`Claimed +${res.vc} VC & +${res.rep} Crew Rep!`);
                              }}
                            >
                              {g.claimed ? 'Claimed' : 'Claim'}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="h2k-card">
                        <div className="h2k-section-head">
                          <h3>50-Member Crew Roster (Top 6)</h3>
                        </div>
                        {modes.crew.members.slice(0, 6).map((m) => (
                          <div
                            key={m.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 12,
                              padding: '5px 0',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                            className="h2k-tabular"
                          >
                            <span>
                              <strong>{m.gamertag}</strong> · {m.role}
                            </span>
                            <span>
                              {m.position} {m.ovr} OVR · {m.weeklyRep} Rep
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h2k-card">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {SWAG_TABS.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={`h2k-mode-btn ${swagCategory === t.id ? 'active' : ''}`}
                            style={{ minHeight: 32, padding: '0 10px' }}
                            onClick={() => setSwagCategory(t.id)}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {filteredSwag.map((item) => {
                          const owned = modes.ownedSwagIds.includes(item.id);
                          return (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 10,
                                padding: 10,
                                borderRadius: 8,
                                background: 'rgba(30,41,59,0.72)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 6,
                                    background: item.swatch,
                                    border: '1px solid rgba(255,255,255,0.35)',
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <strong style={{ fontSize: 12 }}>{item.name}</strong>
                                  <div className="h2k-muted">{item.description}</div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`h2k-mode-btn ${owned ? 'emerald' : 'primary'}`}
                                onClick={() => {
                                  const res = ModesStore.buyOrEquipSwag(item.id);
                                  onNotify(res.message);
                                }}
                              >
                                {owned ? 'Equip' : `${item.priceVc.toLocaleString()} VC`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Active Pins Directory */}
              {modes.cityPins.length > 0 && (
                <div className="h2k-card">
                  <div className="h2k-section-head" style={{ marginBottom: 8 }}>
                    <h3>Dropped Map Pins ({modes.cityPins.length})</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {modes.cityPins.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                        }}
                      >
                        <button
                          type="button"
                          className="h2k-mode-btn"
                          style={{ flex: 1, justifyContent: 'flex-start', minHeight: 32 }}
                          onClick={() => focusMapOn(p.x, p.y)}
                        >
                          📌 {p.label}
                        </button>
                        <button
                          type="button"
                          className="h2k-mode-btn"
                          style={{ minHeight: 32, padding: '0 10px' }}
                          onClick={() => ModesStore.removeCityPin(p.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
