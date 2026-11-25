import React from "react";
import { ArcadeAudio, SFX_PACKS, SfxPackId } from "../audio";
import { ASPHALT_CARS, BASKETBALL_TEAMS, MOBA_HEROES } from "../arenaRoster";
import { AvatarCategory, characterCatalog } from "../catalog";
import { GAME_LIST } from "../instructions";
import {
  addPresetButtonToLayout,
  ControlMode,
  GameControlLayout,
  GLOBAL_PRESET_BUTTONS,
  removeExtraButtonFromLayout,
  resetGameLayout
} from "../controlLayouts";
import { addXp, awardBonusCoins, spendCoins, updateCoinsDisplay } from "../runtimeBridge";
import { persistArenaSelections, persistChessTime, playerState, saveUiPrefs, tryStorage } from "../storage";
import { Difficulty, GameMeta } from "../types";
import {
  requestAppFullscreen,
  requestNativeLandscape,
  setAutoFullscreenEnabled,
  setOrientationMode,
  toggleAppFullscreen,
  tryAutoFullscreenOnGesture
} from "../viewport";
import { ARCADE_CATEGORIES, THEME_PRESETS, TOTAL_2D_GAMES, TOTAL_3D_GAMES } from "./arcadeUiConstants";

export interface ArcadeSettingsAndModalsCtx {
  avatarItems: Array<{ icon: string; unlocked: boolean; cost: number }>;
  filteredGames: GameMeta[];
  gameLayout: GameControlLayout;
  setStoreTick: React.Dispatch<React.SetStateAction<number>>;
  setIsNight: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDevPanel: React.Dispatch<React.SetStateAction<boolean>>;
  updateGameLayoutState: (updater: (prev: GameControlLayout) => GameControlLayout) => void;
  [key: string]: any;
}

export function ArcadeSettingsAndModals({ ctx }: { ctx: ArcadeSettingsAndModalsCtx }) {
  const {
    activeCategory,
    activeGameRef,
    activeThemeIdx,
    addFarmAnimal,
    addedNoticeTimerRef,
    addedPresetNotice,
    applyGlobalDefaultControlMode,
    applyTheme,
    avatarItems,
    bgmOn,
    cheatInput,
    chessTimeSec,
    coins,
    createButterflies,
    createFlowers,
    currentAvatar,
    devTapCountRef,
    difficulty,
    difficultyRef,
    dpadScale,
    dpadX,
    dpadY,
    filteredGames,
    gameLayout,
    globalControlMode,
    greetingTitle,
    isNight,
    masterVol,
    menuCategoryFilter,
    menuDimensionFilter,
    menuSearchQuery,
    pLevel,
    patchBuiltInControl,
    patchExtraControl,
    pauseHeaderRef,
    pausePanelRef,
    rankTitle,
    rebuildGarden,
    resetDpadLayout,
    resumeGame,
    selectedAsphaltCar,
    selectedBasketballTeam,
    selectedGameIdx,
    selectedGameRef,
    selectedMeta,
    selectedMobaHero,
    selectedPresetKey,
    setActiveCategory,
    setActiveLobbyGame,
    setAddedPresetNotice,
    setCheatInput,
    setChessTimeSec,
    setControlMode,
    setDifficulty,
    setDpadScale,
    setDpadX,
    setDpadY,
    setDragEditMode,
    setGameLayout,
    setGreetingTitle,
    setIsNight,
    setMasterVol,
    setMenuCategoryFilter,
    setMenuDimensionFilter,
    setMenuSearchQuery,
    setRotateHintDismissed,
    setSelectedAsphaltCar,
    setSelectedBasketballTeam,
    setSelectedGameIdx,
    setSelectedMobaHero,
    setSelectedPresetKey,
    setSfxPackState,
    setShowDevPanel,
    setShowGameMenu,
    setShowInstructions,
    setShowPauseModal,
    setShowProfile,
    setShowSettings,
    setStoreTick,
    setUsername,
    settingsHeaderRef,
    settingsPanelRef,
    sfxOn,
    sfxPack,
    showDevPanel,
    showGameMenu,
    showInstructions,
    showPauseModal,
    showProfile,
    showSettings,
    startGame,
    stopGame,
    syncAvatar,
    unlockCount,
    updateGameLayoutState,
    username,
    viewportSnap,
    xp,
    xpPercent
  } = ctx;

  return (
    <>
      {/* PROFILE & CHARACTER STORE MODAL */}
      <div
        className={`overlay-modal ${showProfile ? 'show' : ''}`}
        id="profileOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowProfile(false);
        }}
      >
        <div className="modal-panel">
          <div className="modal-header">
            👤 Player Profile
            <button type="button" className="close-btn" id="closeProfile" aria-label="Close Profile" onClick={() => setShowProfile(false)}>
              ✖
            </button>
          </div>
          <div className="profile-header">
            <div className="profile-avatar-large" id="profileAvatarLarge">{currentAvatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#aaa' }}>USERNAME</div>
              <input
                type="text"
                className="profile-input"
                id="profileUsername"
                value={username}
                maxLength={15}
                aria-label="Username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  playerState.username = e.target.value;
                  tryStorage.setItem('tsepang_username', e.target.value);
                }}
              />
              <div style={{ fontSize: '10px', color: 'var(--ui-accent)', marginTop: '3px' }} id="profileRankTitle">
                {rankTitle}
              </div>
              <div className="xp-bar-container" title="Player XP Level Progress">
                <div className="xp-bar-fill" id="xpBarFill" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ fontSize: '9px', color: '#aaa' }}>PLAYER LEVEL</div>
              <div className="stat-val" id="profileLevelVal">Lvl {pLevel}</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '9px', color: '#aaa' }}>COINS</div>
              <div className="stat-val" id="profileCoinsVal">🪙 {coins}</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '9px', color: '#aaa' }}>UNLOCKED</div>
              <div className="stat-val" id="profileScoreVal">{unlockCount}</div>
            </div>
          </div>

          <div className="char-section">
            <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '12px' }}>
              🛍️ Character Store (1000+ Unique Icons)
            </div>
            <div className="gender-selector">
              {(
                [
                  ['boy', '👦 Boy'],
                  ['girl', '👧 Girl'],
                  ['animals', '🦁 Animals'],
                  ['foods', '🍎 Foods'],
                  ['vehicles', '🏎️ Cars'],
                  ['hearts', '💖 Hearts']
                ] as [AvatarCategory, string][]
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  type="button"
                  className={`gender-btn ${activeCategory === cat ? 'selected' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="char-grid" id="charGrid">
              {avatarItems.map(({ icon, unlocked, cost }) => (
                <button
                  key={icon}
                  type="button"
                  className={`char-card ${currentAvatar === icon ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (unlocked) {
                      syncAvatar(icon);
                    } else if (playerState.totalCoins >= cost) {
                      playerState.totalCoins -= cost;
                      playerState.unlockedAvatars.add(icon);
                      syncAvatar(icon);
                      updateCoinsDisplay();
                      setStoreTick((t) => t + 1);
                    }
                  }}
                >
                  <span>{icon}</span>
                  <span className="char-cost-tag">
                    {unlocked ? (currentAvatar === icon ? 'EQUIPPED' : 'OWNED') : `🪙${cost}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GARDEN SETTINGS MODAL */}
      <div
        className={`overlay-modal ${showSettings ? 'show' : ''}`}
        id="settingsOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowSettings(false);
        }}
      >
        <div className="modal-panel" id="settingsModalPanel" ref={settingsPanelRef}>
          <div
            className="modal-header"
            id="settingsHeader"
            ref={settingsHeaderRef}
            onClick={() => {
              devTapCountRef.current += 1;
              if (devTapCountRef.current >= 5) {
                devTapCountRef.current = 0;
                setShowDevPanel((p) => !p);
              }
            }}
          >
            ⚙️ Garden Settings
            <button type="button" className="close-btn" id="closeSettings" aria-label="Close Settings" onClick={() => setShowSettings(false)}>
              ✖
            </button>
          </div>

          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>✍️ Title Text</div>
          <input
            type="text"
            className="profile-input"
            id="titleInput"
            value={greetingTitle}
            style={{ marginBottom: '8px' }}
            aria-label="Garden Title"
            onChange={(e) => {
              const title = e.target.value || '🌿 Tsepang Garden 🌸';
              setGreetingTitle(title);
              saveUiPrefs({ greetingTitle: title });
            }}
          />

          <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#58a6ff' }}>🌸 Garden &amp; Environment Tools</div>
          <div className="setting-grid-buttons">
            <button
              type="button"
              className="btn"
              id="btnDayNight"
              onClick={() =>
                setIsNight((n) => {
                  const next = !n;
                  saveUiPrefs({ isNight: next });
                  return next;
                })
              }
            >
              <span className="btn-icon">{isNight ? '☀️' : '🌙'}</span> {isNight ? 'Day Mode' : 'Night/Day'}
            </button>
            <button type="button" className="btn" id="btnAddFlower" onClick={() => createFlowers(1)}>
              <span className="btn-icon">🌸</span> Plant Flower
            </button>
            <button type="button" className="btn" id="btnAddAnimal" onClick={() => addFarmAnimal()}>
              <span className="btn-icon">🐾</span> Add Animal
            </button>
            <button type="button" className="btn" id="btnAddButterfly" onClick={() => createButterflies(1)}>
              <span className="btn-icon">🦋</span> Butterfly
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button type="button" className="btn" id="btnReset" onClick={rebuildGarden}>
              <span className="btn-icon">🔄</span> Reset Garden
            </button>
            <button
              type="button"
              className="btn"
              id="btnDownloadOffline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              onClick={() => {
                ArcadeAudio.play('click');
                const ver =
                  (window as Window & { ARCADE_BUILD_VERSION?: string }).ARCADE_BUILD_VERSION ||
                  'Live Modular v1.0 (rev ?v=1)';
                const info =
                  'Tsepang Garden & Game Arcade (' +
                  ver +
                  ') runs 100% offline directly from root index.html + ./core/ + ./games/ + ./vendor/ folders.';
                const blob = new Blob([info], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'TSEPANG_OFFLINE_INFO.txt';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1500);
              }}
            >
              <span className="btn-icon">💾</span> Offline Info
            </button>
          </div>

          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px', color: '#ffd700' }}>🎵 Audio &amp; Music</div>
          <div className="setting-control-row">
            <label><span>🔊 Master Volume</span><span id="bgmVolumeVal">{masterVol}%</span></label>
            <input
              type="range"
              id="bgmVolume"
              min={0}
              max={100}
              value={masterVol}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setMasterVol(v);
                ArcadeAudio.setVolume(v / 100);
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button type="button" className="btn" id="btnToggleBgm" style={{ fontSize: '11px', padding: '6px' }} onClick={() => ArcadeAudio.toggleBgm()}>
              {bgmOn ? '🎵 Music: ON' : '🔇 Music: OFF'}
            </button>
            <button type="button" className="btn" id="btnToggleSfx" style={{ fontSize: '11px', padding: '6px' }} onClick={() => ArcadeAudio.toggleSfx()}>
              {sfxOn ? '🔊 SFX: ON' : '🔈 SFX: OFF'}
            </button>
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '10.5px', color: '#e2e8f0', marginBottom: '4px' }}>
            🎚️ Sound Effect Pack
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '8px' }} id="sfxPackSelector">
            {SFX_PACKS.map((pack) => {
              const active = sfxPack === pack.id;
              return (
                <button
                  key={pack.id}
                  type="button"
                  className="btn"
                  id={`sfxPackBtn_${pack.id}`}
                  title={pack.desc}
                  style={{
                    fontSize: '10px',
                    padding: '6px 4px',
                    lineHeight: 1.2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    background: active ? 'var(--ui-accent)' : 'var(--button-bg)',
                    color: active ? '#0b1220' : 'var(--ui-text)',
                    borderColor: active ? '#fff' : undefined
                  }}
                  onClick={() => {
                    ArcadeAudio.setSfxPack(pack.id);
                    setSfxPackState(ArcadeAudio.getSfxPack());
                  }}
                >
                  <span style={{ fontSize: '13px', lineHeight: 1 }}>{pack.icon}</span>
                  <span>{pack.name}</span>
                </button>
              );
            })}
          </div>

          <div className="layout-editor-section" style={{ marginTop: 0, marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#38bdf8', marginBottom: '6px' }}>
              📱 Screen Orientation ({viewportSnap.orientationMode === 'auto' ? 'Auto Landscape' : 'Free Rotate'})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              <button
                type="button"
                className="btn"
                id="settingsBtnAutoLandscape"
                style={{
                  fontSize: '11px',
                  padding: '6px',
                  background: viewportSnap.orientationMode === 'auto' ? 'var(--ui-accent)' : 'var(--button-bg)',
                  color: viewportSnap.orientationMode === 'auto' ? '#0b1220' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setRotateHintDismissed(false);
                  void requestNativeLandscape();
                }}
              >
                🔄 Auto Landscape
              </button>
              <button
                type="button"
                className="btn"
                id="settingsBtnFreeRotate"
                style={{
                  fontSize: '11px',
                  padding: '6px',
                  background: viewportSnap.orientationMode === 'free' ? 'var(--ui-accent)' : 'var(--button-bg)',
                  color: viewportSnap.orientationMode === 'free' ? '#0b1220' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setRotateHintDismissed(false);
                  setOrientationMode('free');
                }}
              >
                🔓 Free / Portrait
              </button>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#84fab0', marginBottom: '5px' }}>
              ⛶ Smartphone Full Screen ({viewportSnap.isFullscreen ? (viewportSnap.nativeFullscreen ? 'Active' : 'Fit Mode') : 'Off'})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                className="btn"
                id="settingsBtnAutoFullscreen"
                style={{
                  fontSize: '10.5px',
                  padding: '6px',
                  background: viewportSnap.autoFullscreenEnabled ? 'var(--ui-accent)' : 'var(--button-bg)',
                  color: viewportSnap.autoFullscreenEnabled ? '#0b1220' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  const next = !viewportSnap.autoFullscreenEnabled;
                  setAutoFullscreenEnabled(next);
                  if (next) {
                    void requestAppFullscreen({ allowFallback: true });
                  }
                }}
              >
                {viewportSnap.autoFullscreenEnabled ? '⚡ Auto Full: ON' : '⚡ Auto Full: OFF'}
              </button>
              <button
                type="button"
                className="btn"
                id="settingsBtnToggleFullscreen"
                style={{
                  fontSize: '10.5px',
                  padding: '6px',
                  background: viewportSnap.isFullscreen ? '#22c55e' : 'var(--button-bg)',
                  color: viewportSnap.isFullscreen ? '#052e16' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  void toggleAppFullscreen();
                }}
              >
                {viewportSnap.isFullscreen ? '⛶ Exit Full Screen' : '⛶ Enter Full Screen'}
              </button>
            </div>
          </div>

          <div className="layout-editor-section" style={{ marginTop: 0, marginBottom: '8px' }} id="globalControlsSection">
            <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#84fab0', marginBottom: '6px' }}>
              🕹️ Default Controls — All 29 Games ({globalControlMode === 'analog' ? 'Analog Stick' : 'Buttons'})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '4px' }}>
              <button
                type="button"
                className="btn"
                id="settingsBtnDefaultAnalog"
                style={{
                  fontSize: '11px',
                  padding: '6px',
                  fontWeight: 800,
                  background: globalControlMode === 'analog' ? 'var(--ui-accent)' : 'var(--button-bg)',
                  color: globalControlMode === 'analog' ? '#0b1220' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  applyGlobalDefaultControlMode('analog', true);
                }}
              >
                🕹️ Analog Stick
              </button>
              <button
                type="button"
                className="btn"
                id="settingsBtnDefaultButtons"
                style={{
                  fontSize: '11px',
                  padding: '6px',
                  fontWeight: 800,
                  background: globalControlMode === 'buttons' ? 'var(--ui-accent)' : 'var(--button-bg)',
                  color: globalControlMode === 'buttons' ? '#0b1220' : 'var(--ui-text)'
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  applyGlobalDefaultControlMode('buttons', true);
                }}
              >
                🎛️ Buttons
              </button>
            </div>
            <div style={{ fontSize: '9.5px', color: '#cbd5e1', lineHeight: 1.3 }}>
              Applies to all 29 games by default. You can still override any game individually inside Pause Settings or the in-game HUD.
            </div>
          </div>

          <div className="layout-editor-section">
            <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#ffd700', marginBottom: '6px' }}>🎮 Main D-Pad Customizer</div>
            <div className="setting-control-row">
              <label><span>🕹️ D-Pad Size</span><span id="dpadScaleVal">{dpadScale.toFixed(1)}x</span></label>
              <input
                type="range"
                id="dpadScale"
                min={0.5}
                max={1.8}
                step={0.1}
                value={dpadScale}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setDpadScale(v);
                  saveUiPrefs({ dpadScale: v });
                  document.documentElement.style.setProperty('--dpad-scale', String(v));
                }}
              />
            </div>
            <div className="setting-control-row">
              <label><span>↕️ D-Pad Y Position</span><span id="dpadYVal">{dpadY}px</span></label>
              <input
                type="range"
                id="dpadY"
                min={10}
                max={300}
                step={5}
                value={dpadY}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setDpadY(v);
                  saveUiPrefs({ dpadY: v });
                  document.documentElement.style.setProperty('--dpad-y', `${v}px`);
                }}
              />
            </div>
            <div className="setting-control-row">
              <label><span>↔️ D-Pad X Position</span><span id="dpadXVal">{dpadX}px</span></label>
              <input
                type="range"
                id="dpadX"
                min={5}
                max={250}
                step={5}
                value={dpadX}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setDpadX(v);
                  saveUiPrefs({ dpadX: v });
                  document.documentElement.style.setProperty('--dpad-x', `${v}px`);
                }}
              />
            </div>
            <button type="button" className="btn" id="resetLayoutBtn" style={{ width: '100%', marginTop: '5px', fontSize: '10px', padding: '4px' }} onClick={resetDpadLayout}>
              🔄 Reset Layout Defaults
            </button>
          </div>

          <div className={`dev-secret-panel ${showDevPanel ? 'show' : ''}`} id="devSecretPanel">
            <div style={{ color: '#ffd700', fontWeight: 'bold', marginBottom: '6px' }}>🕵️‍♂️ Developer Custom Audio &amp; Cheats</div>
            <div className="audio-input-group">
              <label>🔑 Enter Cheat Code (GOLD999 / VIP1000 / UNLOCKALL)</label>
              <input
                type="text"
                className="profile-input"
                id="devCheatInput"
                placeholder="ENTER CODE..."
                style={{ fontSize: '10px', marginBottom: '4px' }}
                value={cheatInput}
                onChange={(e) => setCheatInput(e.target.value)}
              />
              <button
                type="button"
                className="btn"
                id="btnApplyCheat"
                style={{ width: '100%', fontSize: '10px', padding: '4px', background: '#f1c40f', color: '#000' }}
                onClick={() => {
                  const code = cheatInput.trim().toUpperCase();
                  if (code === 'GOLD999' || code === 'VIP1000') {
                    playerState.totalCoins += 1000;
                    updateCoinsDisplay();
                  } else if (code === 'UNLOCKALL') {
                    Object.values(characterCatalog).forEach((list) =>
                      list.slice(0, 30).forEach((ic) => playerState.unlockedAvatars.add(ic))
                    );
                    updateCoinsDisplay();
                    setStoreTick((t) => t + 1);
                  } else if (code === 'LVLUP') {
                    addXp(playerState.playerLevel * 100);
                  }
                  setCheatInput('');
                }}
              >
                ⚡ Apply Code
              </button>
            </div>
          </div>

          <div style={{ fontWeight: 'bold', margin: '8px 0 4px 0', fontSize: '11px', color: 'var(--ui-accent)' }}>🎨 UI Theme Preset</div>
          <div className="theme-grid">
            {THEME_PRESETS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                className={`theme-btn ${activeThemeIdx === i ? 'active' : ''}`}
                style={{ background: t.gradient }}
                aria-label={t.label}
                onClick={() => applyTheme(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* IN-GAME PAUSE MENU */}
      <div className={`overlay-modal ${showPauseModal ? 'show' : ''}`} id="gamePauseOverlay">
        <div className="modal-panel" id="gamePauseModalPanel" ref={pausePanelRef}>
          <div className="modal-header" id="gamePauseHeader" ref={pauseHeaderRef}>
            ⏸️ Game Paused
            <button type="button" className="close-btn" id="closeGamePause" aria-label="Resume Game" onClick={resumeGame}>
              ✖
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            <button type="button" className="btn" id="pauseBtnResume" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)', fontWeight: 800, fontSize: '13px', padding: '8px' }} onClick={resumeGame}>
              ▶ Resume Game
            </button>
            <button
              type="button"
              className="btn"
              id="pauseBtnRestart"
              style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)', fontWeight: 800, fontSize: '13px', padding: '8px' }}
              onClick={() => {
                setShowPauseModal(false);
                startGame(selectedGameRef.current, difficultyRef.current, 1);
              }}
            >
              🔄 Restart Match
            </button>
            {selectedGameIdx === 27 && (
              <button
                type="button"
                className="btn"
                id="pauseBtnHoopsSimEnd"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', color: '#fff', fontWeight: 900, fontSize: '13px', padding: '8px' }}
                onClick={() => {
                  resumeGame();
                  activeGameRef.current?.simHoopsToEnd?.();
                }}
              >
                ⏭ Sim to End (Earn VC &amp; Progression)
              </button>
            )}
            {(selectedGameIdx === 24 || selectedGameIdx === 25 || selectedGameIdx === 26 || selectedGameIdx === 27 || selectedGameIdx === 28) && (
              <button
                type="button"
                className="btn"
                id="pauseBtnLobby"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#111827', fontWeight: 900, fontSize: '13px', padding: '8px' }}
                onClick={() => {
                  const gid = selectedGameRef.current as 24 | 25 | 26 | 27 | 28;
                  stopGame();
                  setActiveLobbyGame(gid);
                }}
              >
                🏟️ Open 3D Lobby &amp; Shop
              </button>
            )}
            <button
              type="button"
              className="btn"
              id="pauseBtnMenu"
              style={{ background: 'linear-gradient(135deg, #3498db, #2980b9)', fontWeight: 800, fontSize: '13px', padding: '8px' }}
              onClick={() => {
                stopGame();
                setShowGameMenu(true);
              }}
            >
              📋 Exit to Main Menu
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button type="button" className="btn" id="pauseBtnToggleBgm" style={{ fontSize: '11px', padding: '6px' }} onClick={() => ArcadeAudio.toggleBgm()}>
              {bgmOn ? '🎵 Music: ON' : '🔇 Music: OFF'}
            </button>
            <button type="button" className="btn" id="pauseBtnToggleSfx" style={{ fontSize: '11px', padding: '6px' }} onClick={() => ArcadeAudio.toggleSfx()}>
              {sfxOn ? '🔊 SFX: ON' : '🔈 SFX: OFF'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
            <button
              type="button"
              className="btn"
              id="pauseBtnAutoLandscape"
              style={{
                fontSize: '10.5px',
                padding: '6px',
                background: viewportSnap.orientationMode === 'auto' ? '#38bdf8' : 'var(--button-bg)',
                color: viewportSnap.orientationMode === 'auto' ? '#082f49' : 'var(--ui-text)'
              }}
              onClick={() => {
                ArcadeAudio.play('click');
                setRotateHintDismissed(false);
                void requestNativeLandscape();
              }}
            >
              🔄 Auto Landscape
            </button>
            <button
              type="button"
              className="btn"
              id="pauseBtnFreeRotate"
              style={{
                fontSize: '10.5px',
                padding: '6px',
                background: viewportSnap.orientationMode === 'free' ? 'var(--ui-accent)' : 'var(--button-bg)',
                color: viewportSnap.orientationMode === 'free' ? '#0b1220' : 'var(--ui-text)'
              }}
              onClick={() => {
                ArcadeAudio.play('click');
                setRotateHintDismissed(false);
                setOrientationMode('free');
              }}
            >
              🔓 Free / Portrait
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button
              type="button"
              className="btn"
              id="pauseBtnAutoFullscreen"
              style={{
                fontSize: '10.5px',
                padding: '6px',
                background: viewportSnap.autoFullscreenEnabled ? 'var(--ui-accent)' : 'var(--button-bg)',
                color: viewportSnap.autoFullscreenEnabled ? '#0b1220' : 'var(--ui-text)'
              }}
              onClick={() => {
                ArcadeAudio.play('click');
                const next = !viewportSnap.autoFullscreenEnabled;
                setAutoFullscreenEnabled(next);
                if (next) {
                  void requestAppFullscreen({ allowFallback: true });
                }
              }}
            >
              {viewportSnap.autoFullscreenEnabled ? '⚡ Auto Full: ON' : '⚡ Auto Full: OFF'}
            </button>
            <button
              type="button"
              className="btn"
              id="pauseBtnToggleFullscreen"
              style={{
                fontSize: '10.5px',
                padding: '6px',
                background: viewportSnap.isFullscreen ? '#22c55e' : 'var(--button-bg)',
                color: viewportSnap.isFullscreen ? '#052e16' : 'var(--ui-text)'
              }}
              onClick={() => {
                ArcadeAudio.play('click');
                void toggleAppFullscreen();
              }}
            >
              {viewportSnap.isFullscreen ? '⛶ Exit Full' : '⛶ Full Screen'}
            </button>
          </div>

          <div className="layout-editor-section" id="virtualButtonStudio">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--ui-accent)' }}>
                🎛️ Virtual Button Studio ({selectedMeta.title})
              </span>
              <button
                type="button"
                className="btn"
                id="btnDragOnScreen"
                style={{ fontSize: '10px', padding: '4px 8px', background: '#facc15', color: '#111', fontWeight: 900 }}
                onClick={() => {
                  setShowPauseModal(false);
                  setDragEditMode(true);
                }}
              >
                ✋ Move On-Screen
              </button>
            </div>

            {/* Per-Game + Global Control Mode Switch: Analog Stick (Default) vs Directional Buttons */}
            <div className="setting-control-row" style={{ background: 'rgba(0,0,0,0.28)', padding: '6px', borderRadius: '8px', marginBottom: '6px' }}>
              <label style={{ marginBottom: '4px' }}>
                <span>🕹️ Movement Control Mode</span>
                <span style={{ color: '#84fab0', fontWeight: 900 }}>
                  {gameLayout.controlMode === 'analog' ? 'Analog Stick' : 'Buttons'}
                </span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <button
                  type="button"
                  id="pauseModeAnalog"
                  className="btn"
                  style={{
                    fontSize: '10px',
                    padding: '5px',
                    fontWeight: 800,
                    background: gameLayout.controlMode === 'analog' ? 'var(--ui-accent)' : 'rgba(255,255,255,0.1)',
                    color: gameLayout.controlMode === 'analog' ? '#0b1220' : '#fff'
                  }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    setControlMode('analog');
                  }}
                >
                  🕹️ Analog Stick
                </button>
                <button
                  type="button"
                  id="pauseModeButtons"
                  className="btn"
                  style={{
                    fontSize: '10px',
                    padding: '5px',
                    fontWeight: 800,
                    background: gameLayout.controlMode === 'buttons' ? 'var(--ui-accent)' : 'rgba(255,255,255,0.1)',
                    color: gameLayout.controlMode === 'buttons' ? '#0b1220' : '#fff'
                  }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    setControlMode('buttons');
                  }}
                >
                  🎛️ Buttons
                </button>
              </div>
              <button
                type="button"
                id="pauseApplyControlModeAll"
                className="btn"
                style={{
                  width: '100%',
                  fontSize: '9.5px',
                  padding: '4px 6px',
                  marginBottom: gameLayout.controlMode === 'analog' ? '6px' : '0',
                  background: 'rgba(56,189,248,0.18)',
                  color: '#e0f2fe',
                  border: '1px solid rgba(56,189,248,0.45)',
                  fontWeight: 700
                }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  applyGlobalDefaultControlMode(gameLayout.controlMode, true);
                }}
              >
                🌐 Set "{gameLayout.controlMode === 'analog' ? 'Analog Stick' : 'Buttons'}" as Default for All 29 Games
              </button>
              {gameLayout.controlMode === 'analog' && (
                <div>
                  <label style={{ fontSize: '10px', color: '#cbd5e1' }}>
                    <span>🕹️ Analog Pad Size</span>
                    <span>{gameLayout.analog.scale.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min={0.6}
                    max={1.6}
                    step={0.1}
                    value={gameLayout.analog.scale}
                    onChange={(e) => patchBuiltInControl('analog', { scale: parseFloat(e.target.value) })}
                  />
                </div>
              )}
            </div>

            {selectedMeta.actionBtn && (
              <div className="setting-control-row" style={{ background: 'rgba(0,0,0,0.22)', padding: '6px', borderRadius: '8px' }}>
                <label>
                  <span>🎯 {selectedMeta.actionBtn} ({gameLayout.action.scale.toFixed(1)}x)</span>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '9px', padding: '2px 6px' }}
                    onClick={() => patchBuiltInControl('action', { visible: !gameLayout.action.visible })}
                  >
                    {gameLayout.action.visible ? '👁️ Shown' : '🚫 Hidden'}
                  </button>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.1}
                  value={gameLayout.action.scale}
                  onChange={(e) => patchBuiltInControl('action', { scale: parseFloat(e.target.value) })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '9px', color: '#cbd5e1' }}>↔️ X: {gameLayout.action.xPct}%</span>
                    <input
                      type="range"
                      aria-label="Action X"
                      min={8}
                      max={92}
                      value={gameLayout.action.xPct}
                      onChange={(e) => patchBuiltInControl('action', { xPct: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '9px', color: '#cbd5e1' }}>↕️ Y: {gameLayout.action.yPx}px</span>
                    <input
                      type="range"
                      aria-label="Action Y"
                      min={16}
                      max={300}
                      value={gameLayout.action.yPx}
                      onChange={(e) => patchBuiltInControl('action', { yPx: parseInt(e.target.value, 10) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMeta.jumpBtn && (
              <div className="setting-control-row" style={{ background: 'rgba(0,0,0,0.22)', padding: '6px', borderRadius: '8px' }}>
                <label>
                  <span>⬆️ {selectedMeta.jumpBtn} ({gameLayout.jump.scale.toFixed(1)}x)</span>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '9px', padding: '2px 6px' }}
                    onClick={() => patchBuiltInControl('jump', { visible: !gameLayout.jump.visible })}
                  >
                    {gameLayout.jump.visible ? '👁️ Shown' : '🚫 Hidden'}
                  </button>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.1}
                  value={gameLayout.jump.scale}
                  onChange={(e) => patchBuiltInControl('jump', { scale: parseFloat(e.target.value) })}
                />
              </div>
            )}

            {selectedMeta.showSteer && (
              <div className="setting-control-row" style={{ background: 'rgba(0,0,0,0.22)', padding: '6px', borderRadius: '8px' }}>
                <label>
                  <span>🏎️ Steer Left / Right ({gameLayout.steerLeft.scale.toFixed(1)}x)</span>
                  <button
                    type="button"
                    className="btn"
                    style={{ fontSize: '9px', padding: '2px 6px' }}
                    onClick={() => {
                      const nextVis = !gameLayout.steerLeft.visible;
                      patchBuiltInControl('steerLeft', { visible: nextVis });
                      patchBuiltInControl('steerRight', { visible: nextVis });
                    }}
                  >
                    {gameLayout.steerLeft.visible ? '👁️ Shown' : '🚫 Hidden'}
                  </button>
                </label>
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.1}
                  value={gameLayout.steerLeft.scale}
                  onChange={(e) => {
                    const sc = parseFloat(e.target.value);
                    patchBuiltInControl('steerLeft', { scale: sc });
                    patchBuiltInControl('steerRight', { scale: sc });
                  }}
                />
              </div>
            )}

            {/* Add Preset Button Row */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginTop: '6px' }}>
              <select
                id="presetButtonSelect"
                aria-label="Choose Preset Button"
                value={selectedPresetKey}
                onChange={(e) => setSelectedPresetKey(e.target.value)}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: '8px',
                  padding: '5px 6px',
                  fontSize: '11px'
                }}
              >
                {GLOBAL_PRESET_BUTTONS.map((p) => (
                  <option key={p.actionKey} value={p.actionKey}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn"
                id="btnAddPresetControl"
                style={{ fontSize: '10px', padding: '6px 10px', background: '#22c55e', color: '#052e16', fontWeight: 900 }}
                onClick={() => {
                  ArcadeAudio.play('click');
                  const preset = GLOBAL_PRESET_BUTTONS.find((p) => p.actionKey === selectedPresetKey);
                  if (preset) {
                    updateGameLayoutState((prev) => addPresetButtonToLayout(prev, preset));
                    setAddedPresetNotice(`✅ Added ${preset.icon} ${preset.label} on screen!`);
                    if (addedNoticeTimerRef.current) clearTimeout(addedNoticeTimerRef.current);
                    addedNoticeTimerRef.current = setTimeout(() => setAddedPresetNotice(''), 2400);
                  }
                }}
              >
                ➕ Add Button
              </button>
            </div>
            {addedPresetNotice && (
              <div id="addedPresetNotice" style={{ fontSize: '10.5px', fontWeight: 800, color: '#84fab0', marginTop: '4px' }}>
                {addedPresetNotice}
              </div>
            )}

            {gameLayout.extras.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {gameLayout.extras.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 6px',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                  >
                    <span style={{ minWidth: '64px', fontWeight: 800 }}>{ex.icon} {ex.label}</span>
                    <input
                      type="range"
                      min={0.6}
                      max={1.6}
                      step={0.1}
                      value={ex.scale}
                      style={{ flex: 1 }}
                      onChange={(e) => patchExtraControl(ex.id, { scale: parseFloat(e.target.value) })}
                    />
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '9px', padding: '2px 5px' }}
                      onClick={() => patchExtraControl(ex.id, { visible: !ex.visible })}
                    >
                      {ex.visible ? '👁️' : '🚫'}
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '9px', padding: '2px 5px', background: '#ef4444' }}
                      onClick={() => updateGameLayoutState((prev) => removeExtraButtonFromLayout(prev, ex.id))}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="btn"
              id="btnResetGameLayout"
              style={{ width: '100%', marginTop: '6px', fontSize: '10px', padding: '5px' }}
              onClick={() => setGameLayout(resetGameLayout(selectedGameRef.current))}
            >
              🔄 Reset Game Button Layout
            </button>
          </div>
          <div
            id="arcadeVersionStamp"
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(148,163,184,0.25)',
              textAlign: 'center',
              fontSize: '10px',
              color: '#94a3b8',
              letterSpacing: '0.3px'
            }}
          >
            {(typeof window !== 'undefined' &&
              (window as Window & { ARCADE_BUILD_VERSION?: string }).ARCADE_BUILD_VERSION) ||
              'Tsepang Arcade · Live Modular v1.0 (rev ?v=1 · Offline Ready)'}
          </div>
        </div>
      </div>

      {/* ARCADE GAME SELECT MENU */}
      <div
        id="gameOverlay"
        className={showGameMenu ? 'show' : ''}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowGameMenu(false);
        }}
      >
        <div className="game-menu" id="gameMenu">
          <h2>🌿 Garden Arcade ({GAME_LIST.length} Games)</h2>
          <div className="game-menu-meta" id="gameMenuCount">
            Showing {filteredGames.length} of {GAME_LIST.length} · {TOTAL_3D_GAMES} 3D · {TOTAL_2D_GAMES} 2D
          </div>

          <div className="game-search-row">
            <input
              type="search"
              id="gameSearchInput"
              className="game-search-input"
              placeholder={`Search ${GAME_LIST.length} 3D & 2D games...`}
              aria-label="Search games"
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
            />
            {menuSearchQuery && (
              <button
                type="button"
                className="game-search-clear"
                aria-label="Clear search"
                onClick={() => setMenuSearchQuery('')}
              >
                ✖
              </button>
            )}
          </div>

          <div className="game-filter-bar" role="tablist" aria-label="Filter games by dimension and genre">
            {(
              [
                ['all', `All (${GAME_LIST.length})`],
                ['3d', `3D (${TOTAL_3D_GAMES})`],
                ['2d', `2D (${TOTAL_2D_GAMES})`]
              ] as ['all' | '3d' | '2d', string][]
            ).map(([dim, label]) => (
              <button
                key={dim}
                type="button"
                data-dim-filter={dim}
                className={`game-filter-btn dim ${menuDimensionFilter === dim ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setMenuDimensionFilter(dim);
                }}
              >
                {label}
              </button>
            ))}
            <span className="game-filter-sep" aria-hidden="true">|</span>
            {ARCADE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                data-cat-filter={cat.key}
                className={`game-filter-btn ${menuCategoryFilter === cat.key ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setMenuCategoryFilter(cat.key);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="game-grid">
            {filteredGames.length === 0 ? (
              <div className="game-grid-empty">
                <div>No games match your filter.</div>
                <button
                  type="button"
                  className="game-filter-btn active"
                  onClick={() => {
                    setMenuDimensionFilter('all');
                    setMenuCategoryFilter('all');
                    setMenuSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredGames.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`game-item ${selectedGameIdx === g.id ? 'selected' : ''}`}
                  data-game={g.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    ArcadeAudio.play('click');
                    setSelectedGameIdx(g.id);
                    selectedGameRef.current = g.id;
                  }}
                >
                  <span>{g.icon}</span>
                  <div className="game-title">{g.title}</div>
                  <div className={`game-dim-label ${g.is3DGame ? 'is-3d' : ''}`}>
                    {g.is3DGame ? '3D' : '2D'}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="diff-selector">
            {(
              [
                ['easy', '🌱 Easy'],
                ['medium', '🌿 Medium'],
                ['hard', '🔥 Hard'],
                ['extreme', '⚡ Extreme']
              ] as [Difficulty, string][]
            ).map(([d, label]) => (
              <button
                key={d}
                type="button"
                className={`diff-btn ${difficulty === d ? 'selected' : ''}`}
                data-diff={d}
                onClick={(e) => {
                  e.stopPropagation();
                  ArcadeAudio.play('click');
                  setDifficulty(d);
                  difficultyRef.current = d;
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="start-game-btn"
            id="showInstructBtn"
            onClick={() => {
              ArcadeAudio.play('click');
              tryAutoFullscreenOnGesture({ forceOnLaunch: true });
              setShowGameMenu(false);
              const idx = selectedGameRef.current;
              if (idx === 22 || idx === 24 || idx === 25 || idx === 26 || idx === 27 || idx === 28) {
                setActiveLobbyGame(idx);
              } else {
                setShowInstructions(true);
              }
            }}
          >
            ▶ Play
          </button>
        </div>
      </div>

      {/* PRE-GAME INSTRUCTIONS & CHESS TIME CHOICE */}
      <div className={`overlay-modal ${showInstructions ? 'show' : ''}`} id="instructionsOverlay">
        <div className="modal-panel">
          <div className="modal-header">
            <span id="instructGameTitle">{selectedMeta.instructTitle}</span>
            <button
              type="button"
              className="close-btn"
              id="closeInstructions"
              aria-label="Back to Arcade"
              onClick={() => {
                setShowInstructions(false);
                setShowGameMenu(true);
              }}
            >
              ✖
            </button>
          </div>
          {selectedGameIdx === 6 && (
            <div id="chessTimeChoiceBox" style={{ margin: '4px 0 10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ui-accent)', marginBottom: '8px', textAlign: 'center' }}>
                ⏱️ Choose Match Time Control First
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  [60, '⚡ 1 Minute'],
                  [300, '🔥 5 Minutes'],
                  [600, '🧠 10 Minutes']
                ].map(([sec, lbl]) => (
                  <button
                    key={sec}
                    type="button"
                    className={`chess-time-choice-btn ${chessTimeSec === sec ? 'selected' : ''}`}
                    onClick={() => {
                      const val = Number(sec);
                      setChessTimeSec(val);
                      persistChessTime(val);
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '11px', color: '#d0e6d5', marginTop: '7px', textAlign: 'center' }}>
                🎲 White ♔ or Black ♚ is assigned automatically at random every match!
              </div>
            </div>
          )}

          {selectedGameIdx === 25 && (() => {
            const unlockedMobaList = MOBA_HEROES.filter((h) => playerState.unlockedMobaHeroes.includes(h.id));
            const activeHero = MOBA_HEROES[selectedMobaHero] || unlockedMobaList[0] || MOBA_HEROES[0];
            return (
              <div className="arena-picker-wrap" id="mobaHeroPickerBox">
                <div className="arena-picker-title">
                  ⚔️ Unlocked Champions ({unlockedMobaList.length}/{MOBA_HEROES.length} — More in Hero Store)
                </div>
                <div className="arena-picker-grid">
                  {unlockedMobaList.map((hero) => (
                    <button
                      key={hero.id}
                      type="button"
                      className={`arena-pick-card ${selectedMobaHero === hero.id ? 'selected' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        setSelectedMobaHero(hero.id);
                        playerState.selectedMobaHero = hero.id;
                        persistArenaSelections();
                      }}
                    >
                      <span style={{ fontSize: '20px', lineHeight: 1.1 }}>{hero.icon}</span>
                      <span className="arena-pick-name">{hero.name}</span>
                      <span className="arena-pick-sub" style={{ color: hero.accentHex }}>{hero.role}</span>
                      <span className="arena-pick-sub">HP {hero.maxHp} · ATK {hero.atkDmg}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '10.5px', color: '#cbd5e1', marginTop: '5px', textAlign: 'center' }}>
                  {activeHero.summary} · Skills: {activeHero.skillNames.join(' / ')}
                </div>
              </div>
            );
          })()}

          {selectedGameIdx === 26 && (
            <div className="arena-picker-wrap" id="asphaltCarPickerBox">
              <div className="arena-picker-title">🏁 Choose Your Supercar (4 Garage Cars)</div>
              <div className="arena-picker-grid cars">
                {ASPHALT_CARS.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    className={`arena-pick-card ${selectedAsphaltCar === car.id ? 'selected' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setSelectedAsphaltCar(car.id);
                      playerState.selectedAsphaltCar = car.id;
                      persistArenaSelections();
                    }}
                  >
                    <span style={{ fontSize: '20px', lineHeight: 1.1 }}>{car.icon}</span>
                    <span className="arena-pick-name">{car.name}</span>
                    <span className="arena-pick-sub" style={{ color: car.accentHex }}>{car.tagline}</span>
                    <div className="arena-pick-stats">
                      <div className="arena-stat-row">
                        <span>SPD</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${car.statSpeed * 20}%`, background: '#38bdf8' }} />
                        </div>
                      </div>
                      <div className="arena-stat-row">
                        <span>N2O</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${car.statNitro * 20}%`, background: '#facc15' }} />
                        </div>
                      </div>
                      <div className="arena-stat-row">
                        <span>RAM</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${car.statImpact * 20}%`, background: '#f97316' }} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedGameIdx === 27 && (
            <div className="arena-picker-wrap" id="hoopsTeamPickerBox">
              <div className="arena-picker-title">🏀 Choose Your Pro Squad (4 Teams)</div>
              <div className="arena-picker-grid cars">
                {BASKETBALL_TEAMS.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    className={`arena-pick-card ${selectedBasketballTeam === team.id ? 'selected' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setSelectedBasketballTeam(team.id);
                      playerState.selectedBasketballTeam = team.id;
                      persistArenaSelections();
                    }}
                  >
                    <span style={{ fontSize: '20px', lineHeight: 1.1 }}>{team.icon}</span>
                    <span className="arena-pick-name">{team.name}</span>
                    <span className="arena-pick-sub" style={{ color: team.accentHex }}>{team.abbr} · {team.tagline}</span>
                    <div className="arena-pick-stats">
                      <div className="arena-stat-row">
                        <span>SHT</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${team.shootRating * 20}%`, background: '#4ade80' }} />
                        </div>
                      </div>
                      <div className="arena-stat-row">
                        <span>DNK</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${team.dunkRating * 20}%`, background: '#facc15' }} />
                        </div>
                      </div>
                      <div className="arena-stat-row">
                        <span>DEF</span>
                        <div className="arena-stat-track">
                          <div className="arena-stat-fill" style={{ width: `${team.defRating * 20}%`, background: '#38bdf8' }} />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              background: 'rgba(255,255,255,0.08)',
              padding: '10px',
              borderRadius: '10px',
              margin: '8px 0',
              fontSize: '11px',
              lineHeight: 1.45,
              whiteSpace: 'pre-line'
            }}
            id="instructText"
          >
            {selectedMeta.text}
          </div>
          <button
            type="button"
            className="start-game-btn"
            id="confirmStartGameBtn"
            onClick={() => {
              tryAutoFullscreenOnGesture({ forceOnLaunch: true });
              setShowInstructions(false);
              startGame(selectedGameRef.current, difficultyRef.current, 1);
            }}
          >
            {selectedGameIdx === 6 ? '▶ Start Chess Match' : '▶ Launch Match'}
          </button>
        </div>
      </div>
    </>
  );
}
