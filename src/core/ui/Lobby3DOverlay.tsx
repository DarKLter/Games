import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ASPHALT_CARS,
  ASPHALT_MAPS,
  AsphaltStatKey,
  BR_WEAPONS,
  NARUTO_MODES,
  NARUTO_SHINOBI_ROSTER,
  NARUTO_STAGES,
  NarutoFaction,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS,
  STORM_SUPPORT_TYPE_DEFS,
  computeUpgradedCarStats,
  defaultCarUpgrades,
  getCarUpgradeCost,
  resolveNarutoTeamSynergy
} from '../arenaRoster';
import { ArcadeAudio } from '../audio';
import {
  persistArenaSelections,
  persistAsphaltGarage,
  persistBrStats,
  persistNarutoProgression,
  playerState
} from '../storage';
import { subscribeViewport } from '../viewport';
import { LobbyShowcase3D, LobbyShowcaseConfig } from '../LobbyShowcase3D';
import { HoopsLobbyView } from '../../games/hoops-2k26/HoopsLobbyView';
import { MobaLobbyView, MobaSubTab } from '../../games/legends-arena/MobaLobbyView';

export interface Lobby3DOverlayProps {
  gameId: 24 | 25 | 26 | 27 | 28;
  totalCoins: number;
  onSpendCoins: (amount: number) => boolean;
  onAwardCoins: (amount: number) => void;
  onBack: () => void;
  onLaunch: () => void;
}

type NarutoSubTab = 'hub' | 'roster' | 'team' | 'modes';

export const Lobby3DOverlay: React.FC<Lobby3DOverlayProps> = ({
  gameId,
  totalCoins,
  onSpendCoins,
  onAwardCoins,
  onBack,
  onLaunch
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<LobbyShowcase3D | null>(null);

  const [, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);

  const [notice, setNotice] = useState<string | null>(null);
  const [brWeaponIdx, setBrWeaponIdx] = useState(0);

  // Legends Arena 3D Multi-Lobby State
  const [mobaTab, setMobaTab] = useState<MobaSubTab>('main');
  const [mobaStep, setMobaStep] = useState<'lobby' | 'draft'>('lobby');
  const [previewHeroId, setPreviewHeroId] = useState<number>(playerState.selectedMobaHero);
  const [previewSkinId, setPreviewSkinId] = useState<string>(
    playerState.mobaEquippedSkins[playerState.selectedMobaHero] ?? 'default'
  );

  // Naruto: Senki & Storm Multi-Lobby State
  const [narutoTab, setNarutoTab] = useState<NarutoSubTab>('hub');
  const [narutoFactionFilter, setNarutoFactionFilter] = useState<'all' | NarutoFaction>('all');
  const [narutoSearch, setNarutoSearch] = useState('');
  const [previewNarutoId, setPreviewNarutoId] = useState<number>(playerState.selectedNarutoHero);
  const [assignSlot, setAssignSlot] = useState<'lead' | 'sup1' | 'sup2'>('lead');

  const showNotice = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice((prev) => (prev === msg ? null : prev)), 2400);
  };

  const kind: LobbyShowcaseConfig['kind'] =
    gameId === 24
      ? 'br'
      : gameId === 25
        ? 'moba'
        : gameId === 26
          ? 'asphalt'
          : gameId === 27
            ? 'hoops'
            : 'naruto';

  const activeShowcaseHeroId =
    gameId === 25 && mobaStep === 'lobby' && mobaTab === 'store'
      ? previewHeroId
      : playerState.mobaTrialHeroId ?? playerState.selectedMobaHero;

  const activeShowcaseSkinId =
    gameId === 25 && mobaStep === 'lobby' && mobaTab === 'store'
      ? previewSkinId
      : playerState.mobaEquippedSkins[activeShowcaseHeroId] ?? 'default';

  const activeShowcaseNarutoId =
    gameId === 28 && narutoTab === 'roster'
      ? previewNarutoId
      : playerState.narutoTrialHeroId ?? playerState.selectedNarutoHero;

  const buildShowcaseConfig = (
    overrideHeroId?: number,
    overrideNarutoId?: number,
    overrideSkinId?: string
  ): LobbyShowcaseConfig => {
    const upg = playerState.carUpgrades[playerState.selectedAsphaltCar] ?? defaultCarUpgrades();
    const resolvedHeroId = overrideHeroId ?? activeShowcaseHeroId;
    return {
      kind,
      brMap: playerState.selectedBrMap,
      brCrateReady: playerState.brSupplyCrateReady,
      mobaHeroId: resolvedHeroId,
      mobaSkinId: overrideSkinId ?? activeShowcaseSkinId,
      asphaltCarId: playerState.selectedAsphaltCar,
      asphaltUpgradeSum: upg.speed + upg.accel + upg.nitro + upg.handling,
      hoopsTeamId: playerState.selectedBasketballTeam,
      narutoHeroId: overrideNarutoId ?? activeShowcaseNarutoId,
      narutoSupport1Id: playerState.selectedNarutoSupport1,
      narutoSupport2Id: playerState.selectedNarutoSupport2
    };
  };

  useEffect(() => {
    if (gameId === 27 || !stageRef.current) return;
    const showcase = new LobbyShowcase3D();
    showcaseRef.current = showcase;
    showcase.mount(stageRef.current, buildShowcaseConfig());
    const onResize = () => showcase.resize();
    window.addEventListener('resize', onResize);
    const unsubVp = subscribeViewport(() => showcase.resize());
    return () => {
      window.removeEventListener('resize', onResize);
      unsubVp();
      showcase.dispose();
      showcaseRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const syncShowcase = (overrideHeroId?: number, overrideNarutoId?: number, overrideSkinId?: string) => {
    showcaseRef.current?.update(buildShowcaseConfig(overrideHeroId, overrideNarutoId, overrideSkinId));
  };

  useEffect(() => {
    if (gameId === 25) {
      syncShowcase(activeShowcaseHeroId, undefined, activeShowcaseSkinId);
    } else if (gameId === 28) {
      syncShowcase(undefined, activeShowcaseNarutoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobaTab, mobaStep, previewHeroId, previewSkinId, narutoTab, previewNarutoId]);

  const filteredNarutoRoster = useMemo(() => {
    const q = narutoSearch.trim().toLowerCase();
    return NARUTO_SHINOBI_ROSTER.filter((h) => {
      if (narutoFactionFilter !== 'all' && h.faction !== narutoFactionFilter) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        h.village.toLowerCase().includes(q) ||
        h.role.toLowerCase().includes(q)
      );
    });
  }, [narutoFactionFilter, narutoSearch]);

  // ---------- RENDERERS PER GAME ----------
  const renderBrLobby = () => {
    const selectedWeapon = BR_WEAPONS[brWeaponIdx] ?? BR_WEAPONS[0];
    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Drop Mode & Island</span>
            <span>🏆 {playerState.brWins} · 💀 {playerState.brKills}</span>
          </div>
          <div className="lobby3d-seg-row">
            <button
              type="button"
              className={`lobby3d-seg-btn ${playerState.selectedBrMode === 'solo' ? 'active' : ''}`}
              onClick={() => {
                playerState.selectedBrMode = 'solo';
                persistArenaSelections();
                bump();
              }}
            >
              👤 SOLO
            </button>
            <button
              type="button"
              className={`lobby3d-seg-btn ${playerState.selectedBrMode === 'squad' ? 'active' : ''}`}
              onClick={() => {
                playerState.selectedBrMode = 'squad';
                persistArenaSelections();
                bump();
              }}
            >
              👥 SQUAD (+AI)
            </button>
          </div>
          <div className="lobby3d-seg-row">
            <button
              type="button"
              className={`lobby3d-seg-btn ${playerState.selectedBrMap === 'erangel' ? 'active' : ''}`}
              onClick={() => {
                playerState.selectedBrMap = 'erangel';
                persistArenaSelections();
                syncShowcase();
                bump();
              }}
            >
              🌾 Erangel
            </button>
            <button
              type="button"
              className={`lobby3d-seg-btn ${playerState.selectedBrMap === 'sanhok' ? 'active' : ''}`}
              onClick={() => {
                playerState.selectedBrMap = 'sanhok';
                persistArenaSelections();
                syncShowcase();
                bump();
              }}
            >
              🌴 Sanhok Mist
            </button>
          </div>

          <div className="lobby3d-sec-title">
            <span>Supply Drop Crate</span>
            <span>Lv.3 Vest + Flare</span>
          </div>
          <button
            type="button"
            className={`lobby3d-item-card ${playerState.brSupplyCrateReady ? 'selected' : ''}`}
            disabled={playerState.brSupplyCrateReady}
            onClick={() => {
              if (playerState.brSupplyCrateReady) return;
              if (!onSpendCoins(30)) {
                showNotice('Need 30🪙 Garden Coins for Supply Crate!');
                return;
              }
              playerState.brSupplyCrateReady = true;
              persistBrStats();
              syncShowcase();
              bump();
            }}
          >
            <div className="lobby3d-item-main">
              <div className="lobby3d-item-title">🪂 Air-Drop Tactical Kit</div>
              <div className="lobby3d-item-sub">Start with +60 Lv.3 Armor & Signal Flare [C]</div>
            </div>
            <span className="lobby3d-mini-btn">
              {playerState.brSupplyCrateReady ? 'EQUIPPED ✓' : 'BUY 30🪙'}
            </span>
          </button>
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            C-130 Cargo Jump · Parachute Drop · Military Buggy · Flare Airdrops
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>4-Gun Loadout Armory</span>
            <span>All 4 Carried</span>
          </div>
          <div className="lobby3d-card-list">
            {BR_WEAPONS.map((w, idx) => (
              <button
                key={w.id}
                type="button"
                className={`lobby3d-item-card ${brWeaponIdx === idx ? 'selected' : ''}`}
                onClick={() => setBrWeaponIdx(idx)}
              >
                <div className="lobby3d-item-main">
                  <div className="lobby3d-item-title">
                    [{w.slot}] {w.icon} {w.name}
                  </div>
                  <div className="lobby3d-item-sub">
                    {w.category} · DMG {w.dmg * w.pellets} · Mag {w.magSize} · {w.scopeFov === 22 ? '4x Scope' : 'Red Dot'}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="lobby3d-item-sub">
            Preview: <strong>{selectedWeapon.name}</strong> · Switch anytime with [1–4] or 🔁 GUN
          </div>
          {notice && <div className="lobby3d-notice">{notice}</div>}
          <button type="button" className="lobby3d-cta-btn" onClick={onLaunch}>
            ✈️ BOARD C-130 & DROP IN
          </button>
        </div>
      </>
    );
  };

  const renderMobaLobby = () => (
    <MobaLobbyView
      mobaTab={mobaTab}
      setMobaTab={setMobaTab}
      mobaStep={mobaStep}
      setMobaStep={setMobaStep}
      previewHeroId={previewHeroId}
      setPreviewHeroId={setPreviewHeroId}
      previewSkinId={previewSkinId}
      setPreviewSkinId={setPreviewSkinId}
      notice={notice}
      showNotice={showNotice}
      onSpendCoins={onSpendCoins}
      onAwardCoins={onAwardCoins}
      onSyncShowcase={(hid, sid) => syncShowcase(hid, undefined, sid)}
      onLaunch={onLaunch}
      bump={bump}
    />
  );

  const renderAsphaltLobby = () => {
    const car = ASPHALT_CARS[playerState.selectedAsphaltCar] ?? ASPHALT_CARS[0];
    const isOwned = playerState.ownedAsphaltCars.includes(car.id);
    const upg = playerState.carUpgrades[car.id] ?? defaultCarUpgrades();
    const computed = computeUpgradedCarStats(car, upg);
    const selectedMap = ASPHALT_MAPS[playerState.selectedAsphaltMap] ?? ASPHALT_MAPS[0];

    const upgradeStat = (key: AsphaltStatKey) => {
      if (!isOwned) return;
      const curLv = upg[key];
      const cost = getCarUpgradeCost(curLv);
      if (curLv >= 5 || cost <= 0) return;
      if (!onSpendCoins(cost)) {
        showNotice(`Need ${cost}🪙 Garden Coins to upgrade ${key}!`);
        return;
      }
      playerState.carUpgrades[car.id] = { ...upg, [key]: curLv + 1 };
      persistAsphaltGarage();
      syncShowcase();
      bump();
    };

    const buyCar = (carId: number, unlockCost: number) => {
      if (playerState.ownedAsphaltCars.includes(carId)) return;
      if (!onSpendCoins(unlockCost)) {
        showNotice(`Need ${unlockCost}🪙 to unlock ${ASPHALT_CARS[carId].name}!`);
        return;
      }
      playerState.ownedAsphaltCars = [...playerState.ownedAsphaltCars, carId];
      playerState.selectedAsphaltCar = carId;
      persistAsphaltGarage();
      syncShowcase();
      bump();
    };

    const statRows: { key: AsphaltStatKey; label: string; lv: number }[] = [
      { key: 'speed', label: 'Top Speed', lv: upg.speed },
      { key: 'accel', label: 'Accel', lv: upg.accel },
      { key: 'nitro', label: 'Nitro', lv: upg.nitro },
      { key: 'handling', label: 'Handling', lv: upg.handling }
    ];

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>8-Car Showroom</span>
            <span>{playerState.ownedAsphaltCars.length}/8 Owned</span>
          </div>
          <div className="lobby3d-card-list">
            {ASPHALT_CARS.map((c) => {
              const owned = playerState.ownedAsphaltCars.includes(c.id);
              const selected = playerState.selectedAsphaltCar === c.id;
              return (
                <div
                  key={c.id}
                  className={`lobby3d-item-card ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`}
                  onClick={() => {
                    playerState.selectedAsphaltCar = c.id;
                    if (owned) persistAsphaltGarage();
                    syncShowcase();
                    bump();
                  }}
                >
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">{c.icon} {c.name}</div>
                    <div className="lobby3d-item-sub">{c.tagline} · Top {c.topSpeed}</div>
                  </div>
                  {owned ? (
                    <span className="lobby3d-badge">{selected ? 'READY' : 'OWNED'}</span>
                  ) : (
                    <button
                      type="button"
                      className="lobby3d-mini-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        buyCar(c.id, c.unlockCost);
                      }}
                    >
                      BUY {c.unlockCost}🪙
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {car.icon} {car.name} · {Math.round(computed.topSpeed * 3.8)} KM/H · Nitro {Math.round(computed.nitroSpeed * 3.8)} KM/H
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Performance Tuning</span>
            <span>{isOwned ? 'Upgrades Active' : 'Locked Car'}</span>
          </div>
          <div>
            {statRows.map((row) => {
              const cost = getCarUpgradeCost(row.lv);
              return (
                <div key={row.key} className="lobby3d-upgrade-row">
                  <span className="lobby3d-upgrade-label">{row.label} Lv{row.lv}</span>
                  <div className="lobby3d-pips">
                    {[1, 2, 3, 4, 5].map((pip) => (
                      <span key={pip} className={`lobby3d-pip ${pip <= row.lv ? 'filled' : ''}`} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={!isOwned || row.lv >= 5}
                    onClick={() => upgradeStat(row.key)}
                  >
                    {row.lv >= 5 ? 'MAX' : `${cost}🪙`}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="lobby3d-sec-title">
            <span>4 Mission Maps</span>
            <span>+{selectedMap.rewardCoins}🪙</span>
          </div>
          <div className="lobby3d-card-list">
            {ASPHALT_MAPS.map((m) => {
              const stars = playerState.asphaltMapStars[m.id] ?? 0;
              const starStr = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`lobby3d-item-card ${playerState.selectedAsphaltMap === m.id ? 'selected' : ''}`}
                  onClick={() => {
                    playerState.selectedAsphaltMap = m.id;
                    persistAsphaltGarage();
                    bump();
                  }}
                >
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">{m.icon} {m.name}</div>
                    <div className="lobby3d-item-sub">{m.missionGoal}</div>
                  </div>
                  <span className="lobby3d-badge">{starStr}</span>
                </button>
              );
            })}
          </div>

          {notice && <div className="lobby3d-notice">{notice}</div>}
          <button
            type="button"
            className="lobby3d-cta-btn"
            disabled={!isOwned}
            onClick={() => {
              if (!isOwned) return;
              persistAsphaltGarage();
              onLaunch();
            }}
          >
            {isOwned ? `🏁 RACE ${selectedMap.name.toUpperCase()}` : `🔒 BUY ${car.name.toUpperCase()} FIRST`}
          </button>
        </div>
      </>
    );
  };

  const renderHoopsLobby = () => (
    <HoopsLobbyView
      onBack={onBack}
      onLaunch={onLaunch}
      onSyncShowcase={() => syncShowcase()}
      bump={bump}
    />
  );

  const renderNarutoLobby = () => {
    const leadHero = NARUTO_SHINOBI_ROSTER[playerState.selectedNarutoHero] ?? NARUTO_SHINOBI_ROSTER[0];
    const sup1Hero = NARUTO_SHINOBI_ROSTER[playerState.selectedNarutoSupport1] ?? NARUTO_SHINOBI_ROSTER[1];
    const sup2Hero = NARUTO_SHINOBI_ROSTER[playerState.selectedNarutoSupport2] ?? NARUTO_SHINOBI_ROSTER[2];
    const activeMode = NARUTO_MODES.find((m) => m.id === playerState.selectedNarutoMode) ?? NARUTO_MODES[0];
    const activeStage = NARUTO_STAGES.find((s) => s.id === playerState.selectedNarutoStage) ?? NARUTO_STAGES[0];
    const synergy = resolveNarutoTeamSynergy([leadHero.id, sup1Hero.id, sup2Hero.id]);

    // TAB 1: SHINOBI HUB
    if (narutoTab === 'hub') {
      return (
        <>
          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>Shinobi Battle Record</span>
              <span>🏆 {playerState.narutoWins} Wins · ⚔️ {playerState.narutoKillsTotal} KOs</span>
            </div>
            <div className="lobby3d-item-card selected">
              <div className="lobby3d-item-main">
                <div className="lobby3d-item-title">
                  {leadHero.icon} {leadHero.name} · {leadHero.title}
                </div>
                <div className="lobby3d-item-sub">
                  {leadHero.village} · {leadHero.role} · Unlocked {playerState.unlockedNarutoHeroes.length}/{NARUTO_SHINOBI_ROSTER.length} Shinobi
                </div>
              </div>
            </div>

            <div className="lobby3d-sec-title">
              <span>Select Combat Engine & Mode</span>
              <span>{activeMode.badge}</span>
            </div>
            <div className="lobby3d-card-list">
              {NARUTO_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`lobby3d-item-card ${playerState.selectedNarutoMode === m.id ? 'selected' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    playerState.selectedNarutoMode = m.id;
                    persistNarutoProgression();
                    bump();
                  }}
                >
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">{m.title}</div>
                    <div className="lobby3d-item-sub">{m.sub}</div>
                  </div>
                  <span className="lobby3d-badge">{m.badge}</span>
                </button>
              ))}
            </div>

            <div className="lobby3d-sec-title">
              <span>Select Battlefield Stage</span>
              <span>{activeStage.name}</span>
            </div>
            <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
              {NARUTO_STAGES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`lobby3d-seg-btn ${playerState.selectedNarutoStage === st.id ? 'active' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    playerState.selectedNarutoStage = st.id;
                    persistNarutoProgression();
                    bump();
                  }}
                >
                  {st.icon} {st.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="lobby3d-center-spacer">
            <div className="lobby3d-center-caption">
              {leadHero.icon} {leadHero.name} + {sup1Hero.icon} {sup1Hero.name.split(' ')[0]} + {sup2Hero.icon} {sup2Hero.name.split(' ')[0]} · {synergy.name} (+{synergy.bonusPct}% Team DMG)
            </div>
          </div>

          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>{leadHero.name} Jutsu & Ougi Kit</span>
              <span>Awakening: {leadHero.awakeningName}</span>
            </div>
            <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
              <div className="lobby3d-kit-item">
                <strong>Innate Trait — {leadHero.passiveName}:</strong> {leadHero.passiveDesc}
              </div>
              {leadHero.skills.map((sk) => (
                <div key={sk.slot} className="lobby3d-kit-item">
                  <strong>
                    [S{sk.slot} · Lv.{sk.unlockLevel} · {sk.cooldown}s] {sk.name}:
                  </strong>{' '}
                  {sk.desc}
                </div>
              ))}
            </div>
            <div className="lobby3d-btn-row">
              <button
                type="button"
                className="lobby3d-seg-btn active"
                onClick={() => {
                  ArcadeAudio.play('click');
                  setPreviewNarutoId(playerState.selectedNarutoHero);
                  setNarutoTab('roster');
                }}
              >
                🛒 {NARUTO_SHINOBI_ROSTER.length} SHINOBI ({playerState.unlockedNarutoHeroes.length}/{NARUTO_SHINOBI_ROSTER.length})
              </button>
              <button
                type="button"
                className="lobby3d-seg-btn"
                onClick={() => {
                  ArcadeAudio.play('click');
                  setNarutoTab('team');
                }}
              >
                👥 TEAM SUPPORTS
              </button>
            </div>
            <button
              type="button"
              className="lobby3d-cta-btn"
              onClick={() => {
                playerState.narutoTrialHeroId = null;
                persistNarutoProgression();
                onLaunch();
              }}
            >
              🍥 LAUNCH {activeMode.title.toUpperCase()}
            </button>
          </div>
        </>
      );
    }

    // TAB 2: SHINOBI ROSTER & STORE
    if (narutoTab === 'roster') {
      const inspected = NARUTO_SHINOBI_ROSTER[previewNarutoId] ?? NARUTO_SHINOBI_ROSTER[0];
      const isOwned = playerState.unlockedNarutoHeroes.includes(inspected.id);
      const isLead = playerState.selectedNarutoHero === inspected.id;

      const factionTabs: { id: 'all' | NarutoFaction; label: string }[] = [
        { id: 'all', label: `All (${NARUTO_SHINOBI_ROSTER.length})` },
        { id: 'Konoha', label: '🍃 Konoha' },
        { id: 'Five Kage & Legends', label: '👑 Kage & Legends' },
        { id: 'Akatsuki & Villains', label: '☁️ Akatsuki & Villains' },
        { id: 'Boruto & Otsutsuki', label: '🌙 Boruto & Otsutsuki' }
      ];

      return (
        <>
          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>{NARUTO_SHINOBI_ROSTER.length}-Shinobi Roster</span>
              <span>{playerState.unlockedNarutoHeroes.length}/{NARUTO_SHINOBI_ROSTER.length} Unlocked</span>
            </div>
            <input
              type="text"
              className="lobby3d-search"
              placeholder="Search Naruto, Sasuke, Madara, Itachi, Kaguya..."
              value={narutoSearch}
              onChange={(e) => setNarutoSearch(e.target.value)}
            />
            <div className="lobby3d-role-pills">
              {factionTabs.map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  className={`lobby3d-role-pill ${narutoFactionFilter === ft.id ? 'active' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    setNarutoFactionFilter(ft.id);
                  }}
                >
                  {ft.label}
                </button>
              ))}
            </div>
            <div className="lobby3d-scroll-list">
              {filteredNarutoRoster.map((h) => {
                const owned = playerState.unlockedNarutoHeroes.includes(h.id);
                const selected = previewNarutoId === h.id;
                const eq = playerState.selectedNarutoHero === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={`lobby3d-item-card ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setPreviewNarutoId(h.id);
                      syncShowcase(undefined, h.id);
                    }}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">
                        {h.icon} {h.name}
                      </div>
                      <div className="lobby3d-item-sub">
                        {h.village} · {h.role} · {h.title}
                      </div>
                    </div>
                    <span className="lobby3d-badge">
                      {eq ? 'LEAD' : owned ? 'OWNED' : `🪙${h.unlockCost}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lobby3d-center-spacer">
            <div className="lobby3d-center-caption">
              {inspected.icon} {inspected.name} — {inspected.title} ({inspected.village})
            </div>
          </div>

          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>{inspected.name}</span>
              <span>{isOwned ? (isLead ? 'ACTIVE LEAD' : 'OWNED') : `🪙 ${inspected.unlockCost}`}</span>
            </div>
            <div className="lobby3d-stat-mini-grid">
              <div className="lobby3d-stat-mini">HP<b>{inspected.baseHp}</b></div>
              <div className="lobby3d-stat-mini">ATK<b>{inspected.baseAtk}</b></div>
              <div className="lobby3d-stat-mini">SPD<b>{inspected.speed}</b></div>
              <div className="lobby3d-stat-mini">ROLE<b>{inspected.role.split(' ')[0]}</b></div>
            </div>
            <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
              <div className="lobby3d-kit-item">
                <strong>Passive — {inspected.passiveName}:</strong> {inspected.passiveDesc}
              </div>
              <div className="lobby3d-kit-item">
                <strong>Awakening — {inspected.awakeningName}:</strong> Unlocks at Lv.6 in Senki or ≤40% HP in Storm 3D.
              </div>
              {inspected.skills.map((sk) => (
                <div key={sk.slot} className="lobby3d-kit-item">
                  <strong>
                    [S{sk.slot} · Lv.{sk.unlockLevel}] {sk.name}:
                  </strong>{' '}
                  {sk.desc}
                </div>
              ))}
            </div>
            {notice && <div className="lobby3d-notice">{notice}</div>}
            <div className="lobby3d-btn-row">
              <button
                type="button"
                className="lobby3d-seg-btn"
                onClick={() => {
                  ArcadeAudio.play('click');
                  playerState.narutoTrialHeroId = inspected.id;
                  persistNarutoProgression();
                  onLaunch();
                }}
              >
                🧪 FREE TRIAL MATCH
              </button>
              {isOwned ? (
                <button
                  type="button"
                  className="lobby3d-cta-btn"
                  disabled={isLead}
                  onClick={() => {
                    ArcadeAudio.play('coin');
                    playerState.narutoTrialHeroId = null;
                    playerState.selectedNarutoHero = inspected.id;
                    persistNarutoProgression();
                    syncShowcase(undefined, inspected.id);
                    bump();
                  }}
                >
                  {isLead ? '✓ EQUIPPED LEAD' : '⭐ SET AS LEAD'}
                </button>
              ) : (
                <button
                  type="button"
                  className="lobby3d-cta-btn"
                  onClick={() => {
                    if (!onSpendCoins(inspected.unlockCost)) {
                      showNotice(`Need ${inspected.unlockCost}🪙 Coins to unlock ${inspected.name}!`);
                      return;
                    }
                    playerState.unlockedNarutoHeroes = [
                      ...playerState.unlockedNarutoHeroes,
                      inspected.id
                    ].sort((a, b) => a - b);
                    playerState.selectedNarutoHero = inspected.id;
                    playerState.narutoTrialHeroId = null;
                    persistNarutoProgression();
                    ArcadeAudio.play('levelup');
                    showNotice(`Unlocked ${inspected.name}!`);
                    syncShowcase(undefined, inspected.id);
                    bump();
                  }}
                >
                  🪙 UNLOCK ({inspected.unlockCost}🪙)
                </button>
              )}
            </div>
          </div>
        </>
      );
    }

    // TAB 3: TEAM FORMATION & SUPPORT DRIVE ROLES
    if (narutoTab === 'team') {
      const ownedShinobi = NARUTO_SHINOBI_ROSTER.filter((h) =>
        playerState.unlockedNarutoHeroes.includes(h.id)
      );
      return (
        <>
          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>3-Man Cell Squad Formation</span>
              <span>Synergy: +{synergy.bonusPct}%</span>
            </div>
            <div className="lobby3d-seg-row">
              <button
                type="button"
                className={`lobby3d-seg-btn ${assignSlot === 'lead' ? 'active' : ''}`}
                onClick={() => setAssignSlot('lead')}
              >
                ⭐ Lead: {leadHero.name.split(' ')[0]}
              </button>
              <button
                type="button"
                className={`lobby3d-seg-btn ${assignSlot === 'sup1' ? 'active' : ''}`}
                onClick={() => setAssignSlot('sup1')}
              >
                🤝 Sup 1: {sup1Hero.name.split(' ')[0]}
              </button>
              <button
                type="button"
                className={`lobby3d-seg-btn ${assignSlot === 'sup2' ? 'active' : ''}`}
                onClick={() => setAssignSlot('sup2')}
              >
                🤝 Sup 2: {sup2Hero.name.split(' ')[0]}
              </button>
            </div>
            <div className="lobby3d-scroll-list">
              {ownedShinobi.map((h) => {
                const isAssigned =
                  (assignSlot === 'lead' && playerState.selectedNarutoHero === h.id) ||
                  (assignSlot === 'sup1' && playerState.selectedNarutoSupport1 === h.id) ||
                  (assignSlot === 'sup2' && playerState.selectedNarutoSupport2 === h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={`lobby3d-item-card ${isAssigned ? 'selected' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      if (assignSlot === 'lead') playerState.selectedNarutoHero = h.id;
                      else if (assignSlot === 'sup1') playerState.selectedNarutoSupport1 = h.id;
                      else playerState.selectedNarutoSupport2 = h.id;
                      persistNarutoProgression();
                      syncShowcase();
                      bump();
                    }}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{h.icon} {h.name}</div>
                      <div className="lobby3d-item-sub">{h.village} · {h.role}</div>
                    </div>
                    <span className="lobby3d-badge">{isAssigned ? 'ACTIVE' : 'ASSIGN'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lobby3d-center-spacer">
            <div className="lobby3d-center-caption">
              Team Bond: {synergy.name} (+{synergy.bonusPct}% Team Jutsu & Linked Secret Technique Power)
            </div>
          </div>

          <div className="lobby3d-panel">
            <div className="lobby3d-sec-title">
              <span>Support 1 Role ({sup1Hero.name.split(' ')[0]})</span>
              <span>[R] Assist</span>
            </div>
            <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
              {STORM_SUPPORT_TYPE_DEFS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`lobby3d-seg-btn ${playerState.narutoSupport1Type === st.id ? 'active' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    playerState.narutoSupport1Type = st.id;
                    persistNarutoProgression();
                    bump();
                  }}
                >
                  {st.icon} {st.name}
                </button>
              ))}
            </div>

            <div className="lobby3d-sec-title">
              <span>Support 2 Role ({sup2Hero.name.split(' ')[0]})</span>
              <span>[T] Assist</span>
            </div>
            <div className="lobby3d-seg-row" style={{ flexWrap: 'wrap' }}>
              {STORM_SUPPORT_TYPE_DEFS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`lobby3d-seg-btn ${playerState.narutoSupport2Type === st.id ? 'active' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    playerState.narutoSupport2Type = st.id;
                    persistNarutoProgression();
                    bump();
                  }}
                >
                  {st.icon} {st.name}
                </button>
              ))}
            </div>

            <div className="lobby3d-kit-box">
              {STORM_SUPPORT_TYPE_DEFS.map((st) => (
                <div key={st.id} className="lobby3d-kit-item">
                  <strong>{st.icon} {st.name}:</strong> {st.desc}
                </div>
              ))}
            </div>
            <button type="button" className="lobby3d-cta-btn" onClick={onLaunch}>
              🍥 DEPLOY 3-MAN CELL SQUAD
            </button>
          </div>
        </>
      );
    }

    // TAB 4: MECHANICS, RAMEN SHOP & NINJA TOOLS GUIDE
    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Part 1: Naruto Senki (2D MOBA)</span>
            <span>3v3 & 4v4</span>
          </div>
          <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
            <div className="lobby3d-kit-item">
              <strong>3-Tower Single Lane:</strong> Outer (3,000 HP), Inner (4,500 HP), and Main Base Crystal (6,000 HP). Towers prioritize Minions/Clones first, but immediately switch aggro onto any Hero who attacks an enemy Hero inside tower range!
            </div>
            <div className="lobby3d-kit-item">
              <strong>Level 1–6 & Ougi:</strong> Skills 1–3 available at Lv.1–3. Unlock <strong>Ougi 1</strong> at <strong>Lv.4</strong> and <strong>Ougi 2 / Form Awakening</strong> at <strong>Lv.6</strong>. Pure cooldowns (no mana bar).
            </div>
            {SENKI_RAMEN_ITEMS.map((item) => (
              <div key={item.id} className="lobby3d-kit-item">
                <strong>
                  {item.icon} {item.name} ({item.cost}G · [{item.shortcut}]):
                </strong>{' '}
                {item.effectDesc}
              </div>
            ))}
          </div>
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            Both On-Screen Touch Buttons & Full Keyboard Shortcuts Active
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Part 2: Ultimate Ninja Storm (3D)</span>
            <span>3v3 & 1v1</span>
          </div>
          <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
            <div className="lobby3d-kit-item">
              <strong>4-Log Substitution (Kawarimi) [E]:</strong> 4 wood logs max. Takes <strong>14.0s</strong> of zero log usage to recharge—spending any log resets the 14.0s timer to 0.0s!
            </div>
            <div className="lobby3d-kit-item">
              <strong>Counterattack Parry [Q + I]:</strong> Parries melee dashes & Chakra Dashes, but locks <strong>35% of max Chakra grey for 16s</strong>.
            </div>
            <div className="lobby3d-kit-item">
              <strong>True Awakening [L / 5]:</strong> Available at ≤40% HP with full Chakra. Followed by 10s Chakra Fatigue.
            </div>
            {STORM_NINJA_TOOLS.map((tl) => (
              <div key={tl.id} className="lobby3d-kit-item">
                <strong>
                  {tl.icon} {tl.name} ([{tl.shortcut}]):
                </strong>{' '}
                {tl.desc}
              </div>
            ))}
          </div>
          <button type="button" className="lobby3d-cta-btn" onClick={onLaunch}>
            🍥 ENTER BATTLEFIELD
          </button>
        </div>
      </>
    );
  };

  const titleByGame: Record<Lobby3DOverlayProps['gameId'], { title: string; badge: string }> = {
    24: { title: 'Battle Royale 3D Lobby', badge: 'PUBG EDITION' },
    25: {
      title: 'Legends Arena 3D',
      badge:
        mobaStep === 'draft'
          ? 'DRAFT & BANS'
          : mobaTab === 'store'
            ? 'SHOP & SKINS (129)'
            : mobaTab === 'mode'
              ? '6 GAME MODES'
              : mobaTab === 'events'
                ? 'EVENTS & STARLIGHT'
                : mobaTab === 'prep'
                  ? 'EMBLEMS & BUILDS'
                  : mobaTab === 'profile'
                    ? 'PROFILE & SQUAD'
                    : mobaTab === 'settings'
                      ? 'SETTINGS'
                      : 'LAND OF DAWN'
    },
    26: { title: 'Asphalt Nitro 3D', badge: '3D GARAGE & MAPS' },
    27: { title: 'Hoops 2K26 3D', badge: '2K ARENA HUB' },
    28: {
      title: 'Naruto: Senki & Storm',
      badge:
        narutoTab === 'roster'
          ? `${NARUTO_SHINOBI_ROSTER.length} SHINOBI ROSTER`
          : narutoTab === 'team'
            ? '3-MAN CELL & SUPPORTS'
            : narutoTab === 'modes'
              ? 'SENKI & STORM GUIDE'
              : 'SHINOBI HUB'
    }
  };

  return (
    <div className={`lobby3d-overlay lobby3d-theme-${kind}`} role="dialog" aria-label={titleByGame[gameId].title}>
      <div ref={stageRef} className="lobby3d-canvas-stage" />
      <header className="lobby3d-topbar">
        <div className="lobby3d-title-wrap">
          <button type="button" className="lobby3d-back-btn" onClick={onBack}>
            ◀ ARCADE
          </button>
          <span className="lobby3d-title">{titleByGame[gameId].title}</span>
          <span className="lobby3d-badge">{titleByGame[gameId].badge}</span>
        </div>
        <span className="lobby3d-coins-pill">🪙 {totalCoins}</span>
      </header>

      {gameId === 25 && mobaStep === 'lobby' && (
        <nav className="lobby3d-subnav moba-subnav-7" aria-label="Legends Arena Lobbies">
          {([
            { id: 'main', label: '🏠 Home' },
            { id: 'mode', label: '⚔️ Modes' },
            { id: 'store', label: '🛒 Store' },
            { id: 'events', label: '🎉 Events' },
            { id: 'prep', label: '🛡️ Prep' },
            { id: 'profile', label: '👤 Profile' },
            { id: 'settings', label: '⚙️ Settings' }
          ] as { id: MobaSubTab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`lobby3d-subnav-btn ${mobaTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                ArcadeAudio.play('click');
                setMobaTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {gameId === 28 && (
        <nav className="lobby3d-subnav" aria-label="Naruto Senki and Storm Lobbies">
          {([
            { id: 'hub', label: '🏠 SHINOBI HUB' },
            { id: 'roster', label: `🛒 SHINOBI ROSTER (${NARUTO_SHINOBI_ROSTER.length})` },
            { id: 'team', label: '👥 TEAM & SUPPORTS' },
            { id: 'modes', label: '📜 MODES & GUIDE' }
          ] as { id: NarutoSubTab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`lobby3d-subnav-btn ${narutoTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                ArcadeAudio.play('click');
                setNarutoTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <div className={`lobby3d-body ${gameId === 27 ? 'lobby3d-body-hoops' : ''}`}>
        {gameId === 24 && renderBrLobby()}
        {gameId === 25 && renderMobaLobby()}
        {gameId === 26 && renderAsphaltLobby()}
        {gameId === 27 && renderHoopsLobby()}
        {gameId === 28 && renderNarutoLobby()}
      </div>
    </div>
  );
};
