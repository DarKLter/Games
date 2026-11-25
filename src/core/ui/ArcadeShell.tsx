import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArcadeAudio, SFX_PACKS, SfxPackId } from '../audio';
import {
  ALL_MOBA_SHOP_ITEMS,
  ASPHALT_CARS,
  BASKETBALL_TEAMS,
  computeEffectiveItemCost,
  computeSellRefund,
  detectCooldownReadySlots,
  formatMatchClock,
  getItemRecipe,
  getMobaBlessingById,
  getMobaEquipmentById,
  getQuickBuyPair,
  MOBA_BASIC_ITEMS,
  MOBA_BOOT_BLESSINGS,
  MOBA_EQUIPMENT_ITEMS,
  MOBA_HEROES,
  MOBA_INTERMEDIATE_ITEMS,
  MobaEquipmentCategory,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS
} from '../arenaRoster';
import { AvatarCategory, characterCatalog } from '../catalog';
import { claimDailyReward, getOrCreatePendingDailyReward } from '../dailyReward';
import { GAME_LIST } from '../instructions';
import {
  addPresetButtonToLayout,
  clampControlPos,
  ControlMode,
  ControlPosition,
  GameControlLayout,
  GLOBAL_PRESET_BUTTONS,
  loadGameLayout,
  removeExtraButtonFromLayout,
  resetGameLayout,
  saveGameLayout
} from '../controlLayouts';
import {
  addXp,
  awardBonusCoins,
  HoopsHudSnapshot,
  MobaHudSnapshot,
  NarutoHudSnapshot,
  registerHudBridge,
  spendCoins,
  updateCoinsDisplay
} from '../runtimeBridge';
import { loadUiPrefs, persistArenaSelections, persistChessTime, persistMobaMeta, playerState, saveUiPrefs, tryStorage } from '../storage';
import { Difficulty, GameCategory, GameInstance } from '../types';
import {
  getViewportSnapshot,
  getViewportSize,
  mapClientDeltaToStage,
  mapClientToStage,
  requestNativeLandscape,
  setOrientationMode,
  subscribeViewport,
  toggleAppFullscreen,
  tryAutoFullscreenOnGesture,
  ViewportSnapshot
} from '../viewport';
import { createGameByIndex } from '../registry';
import { Lobby3DOverlay } from './Lobby3DOverlay';
import { MlbbExperienceShell } from '../../games/legends-arena/mlbb/components/MlbbExperienceShell';
import { MiniMilitiaShell } from '../../games/mini-militia/MiniMilitiaShell';
import { ArcadeSettingsAndModals } from "./ArcadeSettingsAndModals";
import { ArcadeLegacyGameHuds } from "./ArcadeLegacyGameHuds";
import { THEME_PRESETS } from "./arcadeUiConstants";

const AUTOSTART_MAP: Record<string, number> = {
  runner: 0,
  flappy: 1,
  fruit: 2,
  butterflies: 3,
  codehero: 4,
  highway: 5,
  chess: 6,
  fps: 7,
  candy: 8,
  blockblast: 9,
  subway: 10,
  hillclimb: 11,
  pvz: 12,
  slingshot: 13,
  cooking: 14,
  shark: 15,
  worm: 16,
  stickman: 17,
  pool: 18,
  vector: 19,
  crossword: 20,
  sudoku: 21,
  minimilitia: 22,
  stickwar: 23,
  battleroyale: 24,
  moba: 25,
  asphalt: 26,
  hoops: 27,
  nba: 27,
  basketball: 27,
  '2k26': 27,
  '2k14': 27,
  naruto: 28,
  senki: 28,
  storm: 28
};


const RANKS = ['Garden Novice', 'Sprout Keeper', 'Bloom Master', 'Arcade Champion', 'Grand Botanist', 'Mythic Legend'];

const CURSOR_AIM_GAMES = new Set([2, 3, 7, 8, 9, 12, 13, 14, 18]);


interface GardenParticleSpec {
  id: number;
  kind: 'pollen' | 'sparkle';
  x: string;
  y: string;
  size: string;
  dur: string;
  delay: string;
  drift: string;
}

const GARDEN_PARTICLES: GardenParticleSpec[] = Array.from({ length: 24 }, (_, i) => {
  const isSparkle = i % 3 === 2;
  const xPct = ((i * 37 + 11) % 92) + 4;
  const yPct = isSparkle ? ((i * 23 + 12) % 58) + 10 : ((i * 29 + 18) % 62) + 28;
  return {
    id: i,
    kind: isSparkle ? 'sparkle' : 'pollen',
    x: `${xPct}%`,
    y: `${yPct}%`,
    size: isSparkle ? `${8 + (i % 3) * 3}px` : `${5 + (i % 4) * 2}px`,
    dur: isSparkle ? `${5.5 + (i % 4) * 1.4}s` : `${9 + (i % 5) * 2.2}s`,
    delay: `${-((i * 1.35) % 10).toFixed(2)}s`,
    drift: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 10)}px`
  };
});

export function ArcadeShell() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const groundRef = useRef<HTMLDivElement | null>(null);
  const mountainsRef = useRef<HTMLDivElement | null>(null);
  const sunMoonRef = useRef<HTMLDivElement | null>(null);
  const gardenerRef = useRef<HTMLDivElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsHeaderRef = useRef<HTMLDivElement | null>(null);
  const pausePanelRef = useRef<HTMLDivElement | null>(null);
  const pauseHeaderRef = useRef<HTMLDivElement | null>(null);

  const activeGameRef = useRef<GameInstance | null>(null);
  const selectedGameRef = useRef<number>(0);
  const difficultyRef = useRef<Difficulty>('easy');
  const dynamicElementsRef = useRef<HTMLElement[]>([]);

  const initialPrefs = useMemo(() => loadUiPrefs(), []);

  // Garden & UI State
  const [greetingTitle, setGreetingTitle] = useState(
    initialPrefs.greetingTitle || '🌿 Welcome to Tsepang Garden 🌸'
  );
  const [isNight, setIsNight] = useState(Boolean(initialPrefs.isNight));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [cloudCount, setCloudCount] = useState(initialPrefs.cloudCount ?? 5);
  const [mountainCount, setMountainCount] = useState(initialPrefs.mountainCount ?? 4);
  const cloudCountRef = useRef(initialPrefs.cloudCount ?? 5);
  const mountainCountRef = useRef(initialPrefs.mountainCount ?? 4);
  const [sunPos, setSunPos] = useState(initialPrefs.sunPos ?? 50);
  const [isFlyMode, setIsFlyMode] = useState(false);

  // Modals State
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const devTapCountRef = useRef(0);
  const [cheatInput, setCheatInput] = useState('');

  // Profile & Store State
  const [username, setUsername] = useState(playerState.username);
  const [coins, setCoins] = useState(playerState.totalCoins);
  const [xp, setXp] = useState(playerState.playerXp);
  const [pLevel, setPLevel] = useState(playerState.playerLevel);
  const [currentAvatar, setCurrentAvatar] = useState(playerState.currentAvatar);
  const [unlockCount, setUnlockCount] = useState(playerState.unlockedAvatars.size);
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('boy');
  const [storeTick, setStoreTick] = useState(0);
  const [dailyRewardPopup, setDailyRewardPopup] = useState<{
    open: boolean;
    amount: number;
    claimed: boolean;
  }>({ open: false, amount: 0, claimed: false });
  const dailyRewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootCheckedRef = useRef(false);
  const wasViewingGardenRef = useRef(false);

  // Audio & Theme & Layout Controls
  const [masterVol, setMasterVol] = useState(() => Math.round(ArcadeAudio.masterVolume * 100));
  const [bgmOn, setBgmOn] = useState(ArcadeAudio.bgmEnabled);
  const [sfxOn, setSfxOn] = useState(ArcadeAudio.sfxEnabled);
  const [sfxPack, setSfxPackState] = useState<SfxPackId>(ArcadeAudio.sfxPack);
  const [activeThemeIdx, setActiveThemeIdx] = useState(initialPrefs.activeThemeIdx ?? 0);

  const [dpadScale, setDpadScale] = useState(initialPrefs.dpadScale ?? 1.0);
  const [dpadY, setDpadY] = useState(initialPrefs.dpadY ?? 120);
  const [dpadX, setDpadX] = useState(initialPrefs.dpadX ?? 20);
  const [gameLayout, setGameLayout] = useState<GameControlLayout>(() => loadGameLayout(0));
  const [dragEditMode, setDragEditMode] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState(GLOBAL_PRESET_BUTTONS[0].actionKey);
  const [addedPresetNotice, setAddedPresetNotice] = useState('');
  const dragCtrlRef = useRef<{ key: string; startX: number; startY: number; origXPct: number; origYPx: number } | null>(null);
  const addedNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Virtual Analog Stick Refs & Reticle
  const analogPadRef = useRef<HTMLDivElement | null>(null);
  const analogThumbRef = useRef<HTMLDivElement | null>(null);
  const analogVecRef = useRef<{ x: number; y: number; active: boolean; pointerId: number | null }>({
    x: 0,
    y: 0,
    active: false,
    pointerId: null
  });
  const analogEdgeRef = useRef<{ h: -1 | 0 | 1; v: -1 | 0 | 1; lastTime: number }>({ h: 0, v: 0, lastTime: 0 });
  const analogRafRef = useRef<number | null>(null);
  const aimCursorRef = useRef<{ x: number; y: number }>(
    (() => {
      const vp = typeof window !== 'undefined' ? getViewportSize() : { width: 800, height: 600 };
      return { x: vp.width * 0.5, y: vp.height * 0.48 };
    })()
  );
  const [aimCursorPos, setAimCursorPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 400,
    y: 300,
    visible: false
  });

  // Game Selection & Runtime HUD State
  const [selectedGameIdx, setSelectedGameIdx] = useState(0);
  const [activeLobbyGame, setActiveLobbyGame] = useState<22 | 24 | 25 | 26 | 27 | 28 | null>(null);
  const [menuDimensionFilter, setMenuDimensionFilter] = useState<'all' | '3d' | '2d'>('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'all' | GameCategory>('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [chessTimeSec, setChessTimeSec] = useState(playerState.selectedChessTimeSec || 600);
  const [selectedMobaHero, setSelectedMobaHero] = useState(playerState.selectedMobaHero);
  const [selectedAsphaltCar, setSelectedAsphaltCar] = useState(playerState.selectedAsphaltCar);
  const [selectedBasketballTeam, setSelectedBasketballTeam] = useState(playerState.selectedBasketballTeam);
  const [viewportSnap, setViewportSnap] = useState<ViewportSnapshot>(() => getViewportSnapshot());
  const isRotatedFallback = viewportSnap.isRotatedFallback;
  const isPortraitViewport =
    !isRotatedFallback && viewportSnap.logicalHeight > viewportSnap.logicalWidth && viewportSnap.logicalWidth < 860;
  const [rotateHintDismissed, setRotateHintDismissed] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCanvasGame, setIsCanvasGame] = useState(false);
  const [is3DGame, setIs3DGame] = useState(false);
  const [hudScore, setHudScore] = useState(0);
  const [hudLevel, setHudLevel] = useState(1);
  const [hudHigh, setHudHigh] = useState(0);
  const [healthCur, setHealthCur] = useState(3);
  const [healthMax, setHealthMax] = useState(1);
  const [healthTrailPct, setHealthTrailPct] = useState(100);
  const [healthDmgFlash, setHealthDmgFlash] = useState(false);
  const prevHealthRef = useRef<{ cur: number; max: number }>({ cur: 3, max: 1 });
  const healthTrailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const healthFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [actionBtnLabel, setActionBtnLabel] = useState('JUMP');
  const [mobaHud, setMobaHud] = useState<MobaHudSnapshot | null>(null);
  const [mobaReadyPopSlots, setMobaReadyPopSlots] = useState<
    Partial<Record<'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell' | 'regen' | 'itemActive', number>>
  >({});
  const prevMobaCdsRef = useRef<
    Partial<Record<'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell' | 'regen' | 'itemActive', number>>
  >({});
  const mobaReadyTimersRef = useRef<
    Partial<Record<'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell' | 'regen' | 'itemActive', ReturnType<typeof setTimeout>>>
  >({});
  const prevMobaHeroRef = useRef<string>('');
  const [mobaSkillAimUi, setMobaSkillAimUi] = useState<{
    active: boolean;
    mode: 'drag' | 'cursor';
    actionKey: string;
    label: string;
    icon: string;
    color: string;
    cx: number;
    cy: number;
    cancelled: boolean;
  } | null>(null);
  const mobaAimThumbRef = useRef<HTMLDivElement | null>(null);
  const mobaCancelZoneRef = useRef<HTMLDivElement | null>(null);
  const mobaDragAimRef = useRef<{
    active: boolean;
    pointerId: number | null;
    actionKey: string;
    label: string;
    icon: string;
    color: string;
    cx: number;
    cy: number;
    startX: number;
    startY: number;
    didDrag: boolean;
    cancelled: boolean;
    wheelRadius: number;
  }>({
    active: false,
    pointerId: null,
    actionKey: '',
    label: '',
    icon: '',
    color: '#38bdf8',
    cx: 0,
    cy: 0,
    startX: 0,
    startY: 0,
    didDrag: false,
    cancelled: false,
    wheelRadius: 54
  });
  const mobaKeyAimRef = useRef<{
    active: boolean;
    actionKey: string;
    key: string;
    downAt: number;
    movedMouse: boolean;
  } | null>(null);
  const lastPointerClientRef = useRef<{ x: number; y: number }>({ x: 640, y: 360 });
  const [narutoHud, setNarutoHud] = useState<NarutoHudSnapshot | null>(null);
  const [hoopsHud, setHoopsHud] = useState<HoopsHudSnapshot | null>(null);
  const [hoopsPostTab, setHoopsPostTab] = useState<'box' | 'vc' | 'badges' | 'rep'>('box');
  const [showMobaShop, setShowMobaShop] = useState(false);
  const [showExpandedMinimap, setShowExpandedMinimap] = useState(false);
  const [mobaEmoteWheelOpen, setMobaEmoteWheelOpen] = useState(false);
  const [mobaEmoteHoverSlot, setMobaEmoteHoverSlot] = useState<0 | 1 | 2 | 3 | null>(null);
  const mobaEmoteOpenRef = useRef(false);
  const mobaEmoteDragRef = useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startY: number;
    didDrag: boolean;
    hoverSlot: 0 | 1 | 2 | 3 | null;
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    didDrag: false,
    hoverSlot: null
  });
  const [mobaShopCat, setMobaShopCat] = useState<'recommended' | MobaEquipmentCategory | 'jungling' | 'roaming'>('recommended');
  const [selectedMobaShopItemId, setSelectedMobaShopItemId] = useState<string>(MOBA_EQUIPMENT_ITEMS[0].id);
  const [selectedMobaBlessingId, setSelectedMobaBlessingId] = useState<string>(MOBA_BOOT_BLESSINGS[0].id);
  const [mobaShopOpacity, setMobaShopOpacity] = useState<number>(() => playerState.mobaSettings.shopOpacity ?? 90);
  const [mobaShopSide, setMobaShopSide] = useState<'left' | 'right'>(() => playerState.mobaSettings.shopSide ?? 'left');
  const [gameOverInfo, setGameOverInfo] = useState<{
    show: boolean;
    score: number;
    coins: number;
    level: number;
    high: number;
    isVictory: boolean;
  }>({ show: false, score: 0, coins: 0, level: 1, high: 0, isVictory: false });

  // Gardener continuous movement state
  const keysHeldRef = useRef({ up: false, down: false, left: false, right: false });
  const gameKeysHeldRef = useRef({ left: false, right: false, up: false, down: false, boost: false });
  const charStateRef = useRef({ x: 50, y: 70, facing: 1, vy: 0, jumping: false, fly: false });
  const moveAnimRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef(0);

  const selectedMeta = GAME_LIST[selectedGameIdx] || GAME_LIST[0];

  const syncAvatar = useCallback((nextAvatar: string) => {
    playerState.currentAvatar = nextAvatar;
    tryStorage.setItem('tsepang_avatar', nextAvatar);
    setCurrentAvatar(nextAvatar);
  }, []);

  const maybeOpenDailyRewardPopup = useCallback(() => {
    const pending = getOrCreatePendingDailyReward();
    if (pending.available && pending.amount !== null) {
      if (dailyRewardTimerRef.current) {
        clearTimeout(dailyRewardTimerRef.current);
        dailyRewardTimerRef.current = null;
      }
      setDailyRewardPopup({ open: true, amount: pending.amount, claimed: false });
    }
  }, []);

  const handleClaimDailyReward = useCallback(() => {
    setDailyRewardPopup((prev) => {
      if (!prev.open || prev.claimed) return prev;
      const result = claimDailyReward();
      if (!result.claimed) {
        return { open: false, amount: 0, claimed: false };
      }
      awardBonusCoins(result.amount);
      ArcadeAudio.play('coin');
      ArcadeAudio.play('levelup');
      if (dailyRewardTimerRef.current) clearTimeout(dailyRewardTimerRef.current);
      dailyRewardTimerRef.current = setTimeout(() => {
        dailyRewardTimerRef.current = null;
        setDailyRewardPopup({ open: false, amount: 0, claimed: false });
      }, 950);
      return { open: true, amount: result.amount, claimed: true };
    });
  }, []);

  const handleDismissDailyReward = useCallback(() => {
    if (dailyRewardTimerRef.current) {
      clearTimeout(dailyRewardTimerRef.current);
      dailyRewardTimerRef.current = null;
    }
    ArcadeAudio.play('click');
    setDailyRewardPopup({ open: false, amount: 0, claimed: false });
  }, []);

  // Garden visual helpers
  const clearDynamicGarden = useCallback(() => {
    while (dynamicElementsRef.current.length) {
      const el = dynamicElementsRef.current.pop();
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    if (mountainsRef.current) mountainsRef.current.innerHTML = '';
  }, []);

  const createGrassBlades = useCallback(() => {
    const g = groundRef.current;
    if (!g) return;
    g.innerHTML = '';
    const count = Math.min(80, Math.floor(getViewportSize().width / 12));
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'blade';
      b.style.left = `${(i / count) * 100 + Math.random() * 1.5}%`;
      b.style.height = `${14 + Math.random() * 22}px`;
      b.style.background = Math.random() > 0.5 ? '#2ecc71' : '#27ae60';
      b.style.animationDelay = `${Math.random() * 2}s`;
      g.appendChild(b);
    }
  }, []);

  const createClouds = useCallback((count: number) => {
    const host = stageRef.current || document.body;
    host.querySelectorAll('.cloud').forEach((c) => c.remove());
    for (let i = 0; i < count; i++) {
      const c = document.createElement('div');
      c.className = 'cloud garden-layer';
      const w = 65 + Math.random() * 75;
      c.style.width = `${w}px`;
      c.style.height = `${w * 0.42}px`;
      c.style.top = `${8 + Math.random() * 28}%`;
      c.style.left = `${Math.random() * 100}%`;
      c.style.animationDuration = `${28 + Math.random() * 35}s`;
      c.style.animationDelay = `${-Math.random() * 30}s`;
      host.appendChild(c);
      dynamicElementsRef.current.push(c);
    }
  }, []);

  const createMountains = useCallback((count: number) => {
    const mc = mountainsRef.current;
    if (!mc) return;
    mc.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const m = document.createElement('div');
      m.className = 'mountain';
      const halfBase = 90 + Math.random() * 110;
      const h = 100 + Math.random() * 110;
      m.style.borderLeftWidth = `${halfBase}px`;
      m.style.borderRightWidth = `${halfBase}px`;
      m.style.borderBottomWidth = `${h}px`;
      m.style.left = `${(i / Math.max(1, count)) * 88 - 8 + Math.random() * 8}%`;
      m.style.opacity = `${0.65 + (i % 3) * 0.12}`;
      mc.appendChild(m);
    }
  }, []);

  const createFlowers = useCallback((n = 1) => {
    const host = stageRef.current || document.body;
    const colors = ['#ff6b6b', '#ffd93d', '#ff9ff3', '#54a0ff', '#ff9f43', '#a29bfe'];
    for (let i = 0; i < n; i++) {
      const wrap = document.createElement('div');
      wrap.className = 'flower-stem garden-layer';
      wrap.style.left = `${4 + Math.random() * 90}%`;
      wrap.style.bottom = `${25 + Math.random() * 130}px`;
      wrap.style.animationDelay = `${Math.random() * 2}s`;
      const head = document.createElement('div');
      head.className = 'flower-head';
      const petalColor = colors[Math.floor(Math.random() * colors.length)];
      [0, 72, 144, 216, 288].forEach((deg) => {
        const p = document.createElement('div');
        p.className = 'petal';
        p.style.background = petalColor;
        p.style.transform = `rotate(${deg}deg) translateY(-7px)`;
        head.appendChild(p);
      });
      const center = document.createElement('div');
      center.className = 'center';
      center.style.background = '#ffd700';
      head.appendChild(center);
      const stem = document.createElement('div');
      stem.className = 'stem';
      stem.style.height = `${22 + Math.random() * 22}px`;
      wrap.appendChild(head);
      wrap.appendChild(stem);
      host.appendChild(wrap);
      dynamicElementsRef.current.push(wrap);
    }
  }, []);

  const addFarmAnimal = useCallback(() => {
    const host = stageRef.current || document.body;
    const animals = ['🐄', '🐑', '🐖', '🐓', '🐎', '🐕', '🐇', '🦆', '🐐'];
    const a = document.createElement('div');
    a.className = 'farm-animal garden-layer';
    a.textContent = animals[Math.floor(Math.random() * animals.length)];
    a.style.left = `${8 + Math.random() * 82}%`;
    a.style.bottom = `${35 + Math.random() * 115}px`;
    if (Math.random() > 0.5) a.style.transform = 'scaleX(-1)';
    host.appendChild(a);
    dynamicElementsRef.current.push(a);
  }, []);

  const createButterflies = useCallback((n = 1) => {
    const host = stageRef.current || document.body;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('div');
      b.className = 'butterfly garden-layer';
      b.textContent = '🦋';
      b.style.left = `${10 + Math.random() * 78}%`;
      b.style.top = `${28 + Math.random() * 42}%`;
      b.style.setProperty('--fly-dur', `${6 + Math.random() * 6}s`);
      b.style.animationDelay = `${-Math.random() * 5}s`;
      host.appendChild(b);
      dynamicElementsRef.current.push(b);
    }
  }, []);

  const updateCharacterPosition = useCallback(() => {
    const el = gardenerRef.current;
    if (!el) return;
    const c = charStateRef.current;
    el.style.transform = `translate3d(calc(${c.x.toFixed(2)} * var(--app-vw, 1vw)), calc(${c.y.toFixed(2)} * var(--app-vh, 1vh)), 0) translate(-50%, -50%) scaleX(${c.facing})`;
  }, []);

  const rebuildGarden = useCallback(() => {
    clearDynamicGarden();
    createGrassBlades();
    createClouds(cloudCountRef.current);
    createMountains(mountainCountRef.current);
    createFlowers(8);
    addFarmAnimal();
    addFarmAnimal();
    createButterflies(3);
    charStateRef.current = { x: 50, y: 70, facing: 1, vy: 0, jumping: false, fly: false };
    setIsFlyMode(false);
    updateCharacterPosition();
  }, [clearDynamicGarden, createGrassBlades, createClouds, createMountains, createFlowers, addFarmAnimal, createButterflies, updateCharacterPosition]);

  // Gardener Physics Loop
  const ensureGardenerLoop = useCallback(() => {
    if (moveAnimRef.current !== null) return;
    lastMoveTimeRef.current = performance.now();
    const step = (time: number) => {
      const held = keysHeldRef.current;
      const c = charStateRef.current;
      const hasH = held.left || held.right;
      const hasFlyV = c.fly && (held.up || held.down);
      if (!hasH && !hasFlyV && !c.jumping) {
        moveAnimRef.current = null;
        return;
      }
      const dt = Math.min((time - lastMoveTimeRef.current) / 1000, 0.05);
      lastMoveTimeRef.current = time;
      const speed = 34 * dt;

      if (held.left) { c.x = Math.max(3, c.x - speed); c.facing = -1; }
      if (held.right) { c.x = Math.min(97, c.x + speed); c.facing = 1; }
      if (c.fly) {
        if (held.up) c.y = Math.max(10, c.y - speed);
        if (held.down) c.y = Math.min(85, c.y + speed);
      } else if (c.jumping) {
        c.y += (c.vy + 0.5 * 38 * dt) * dt;
        c.vy += 38 * dt;
        if (c.y >= 70) {
          c.y = 70;
          c.jumping = false;
          c.vy = 0;
        }
      } else if (held.down) {
        c.y = 70;
      }
      updateCharacterPosition();
      moveAnimRef.current = requestAnimationFrame(step);
    };
    moveAnimRef.current = requestAnimationFrame(step);
  }, [updateCharacterPosition]);

  const startMovingGarden = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    keysHeldRef.current[dir] = true;
    if (dir === 'up' && !charStateRef.current.fly) {
      if (!charStateRef.current.jumping) {
        charStateRef.current.jumping = true;
        charStateRef.current.vy = -26;
        ArcadeAudio.play('jump');
        ensureGardenerLoop();
      }
      return;
    }
    ensureGardenerLoop();
  }, [ensureGardenerLoop]);

  const stopMovingGarden = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    keysHeldRef.current[dir] = false;
  }, []);

  const resetAnalogStick = useCallback(() => {
    analogVecRef.current = { x: 0, y: 0, active: false, pointerId: null };
    analogEdgeRef.current = { h: 0, v: 0, lastTime: 0 };
    if (analogRafRef.current !== null) {
      cancelAnimationFrame(analogRafRef.current);
      analogRafRef.current = null;
    }
    if (analogThumbRef.current) {
      analogThumbRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    analogPadRef.current?.classList.remove('active');
    setAimCursorPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }, []);

  const releaseAllGameInputs = useCallback(
    (g?: GameInstance | null) => {
      resetAnalogStick();
      Object.keys(keysHeldRef.current).forEach((k) => {
        keysHeldRef.current[k as keyof typeof keysHeldRef.current] = false;
      });
      Object.keys(gameKeysHeldRef.current).forEach((k) => {
        gameKeysHeldRef.current[k as keyof typeof gameKeysHeldRef.current] = false;
      });
      const target = g ?? activeGameRef.current;
      if (!target) return;
      target.releaseInputs?.();
      target.setBoost?.(false);
      target.setSlide?.(false);
      target.setJetpack?.(false);
      target.setSteerLeft?.(false);
      target.setSteerRight?.(false);
      target.setSteer?.(0);
      target.setMove?.(0);
      target.setMoveDir?.(0, 0);
      target.triggerAction?.('fire', false);
      target.triggerAction?.('drift', false);
      target.triggerAction?.('action', false);
      target.triggerAction?.('jump', false);
      target.triggerAction?.('shoot', false);
      target.triggerAction?.('sprint', false);
    },
    [resetAnalogStick]
  );

  // Stop Active Game
  const stopGame = useCallback(() => {
    ArcadeAudio.stopBgm();
    releaseAllGameInputs(activeGameRef.current);
    if (activeGameRef.current) {
      activeGameRef.current.stop?.();
      activeGameRef.current = null;
    }
    document.body.classList.remove('game-active');
    document.body.dataset.state = 'garden';
    Object.keys(gameKeysHeldRef.current).forEach((k) => {
      gameKeysHeldRef.current[k as keyof typeof gameKeysHeldRef.current] = false;
    });
    setIsGameActive(false);
    setIsCanvasGame(false);
    setIs3DGame(false);
    setDragEditMode(false);
    setShowPauseModal(false);
    setShowMobaShop(false);
    setMobaEmoteWheelOpen(false);
    setMobaEmoteHoverSlot(null);
    mobaEmoteOpenRef.current = false;
    mobaEmoteDragRef.current.active = false;
    setMobaHud(null);
    setMobaSkillAimUi(null);
    mobaDragAimRef.current.active = false;
    mobaKeyAimRef.current = null;
    prevMobaCdsRef.current = {};
    prevMobaHeroRef.current = '';
    setMobaReadyPopSlots({});
    Object.values(mobaReadyTimersRef.current).forEach((t) => {
      if (t) clearTimeout(t);
    });
    mobaReadyTimersRef.current = {};
    if (healthTrailTimerRef.current) {
      clearTimeout(healthTrailTimerRef.current);
      healthTrailTimerRef.current = null;
    }
    if (healthFlashTimerRef.current) {
      clearTimeout(healthFlashTimerRef.current);
      healthFlashTimerRef.current = null;
    }
    setHealthDmgFlash(false);
    setHealthTrailPct(100);
    setNarutoHud(null);
    setHoopsHud(null);
    setHoopsPostTab('box');
    setGameOverInfo((prev) => ({ ...prev, show: false }));
    document.getElementById('codeHeroUI')?.classList.remove('show');
    document.getElementById('crosswordUI')?.classList.remove('show');
    document.getElementById('sudokuUI')?.classList.remove('show');
    document.getElementById('chessGameUI')?.classList.remove('show');
    document.getElementById('chessAnalysisOverlay')?.classList.remove('show');
  }, [releaseAllGameInputs]);

  // Start Game by Index
  const startGame = useCallback((index: number, diff: Difficulty, lvl = 1) => {
    setActiveLobbyGame(null);
    stopGame();
    selectedGameRef.current = index;
    difficultyRef.current = diff;
    setSelectedGameIdx(index);
    setDifficulty(diff);
    setSelectedMobaHero(playerState.selectedMobaHero);
    setSelectedAsphaltCar(playerState.selectedAsphaltCar);
    setSelectedBasketballTeam(playerState.selectedBasketballTeam);
    setCoins(playerState.totalCoins);
    const loadedLayout = loadGameLayout(index);
    setGameLayout(loadedLayout);
    setRotateHintDismissed(false);
    const vp = getViewportSize();
    const cx = Math.round(vp.width * 0.5);
    const cy = Math.round(vp.height * 0.48);
    aimCursorRef.current = { x: cx, y: cy };
    setAimCursorPos({ x: cx, y: cy, visible: loadedLayout.controlMode === 'analog' && CURSOR_AIM_GAMES.has(index) });

    const meta = GAME_LIST[index] || GAME_LIST[0];
    document.body.classList.add('game-active');
    document.body.dataset.state = 'playing';
    if (moveAnimRef.current !== null) {
      cancelAnimationFrame(moveAnimRef.current);
      moveAnimRef.current = null;
    }

    ArcadeAudio.startBgm(meta.bgmTheme || 'arcade');
    tryAutoFullscreenOnGesture({ forceOnLaunch: true });
    setIsGameActive(true);
    setActionBtnLabel(meta.actionBtn || 'JUMP');
    setHudScore(0);
    setHudLevel(lvl);
    setHudHigh(playerState.highScores[index] || 0);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { alpha: false }) || canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const instance = createGameByIndex(index, canvas, ctx, diff, lvl, threeMountRef.current);
    activeGameRef.current = instance;
    setIs3DGame(Boolean(instance.uses3DViewport ?? meta.is3DGame));
    setIsCanvasGame(!meta.isDomGame);
    setHealthCur(instance.lives);
    setHealthMax(instance.maxLives);
    instance.start();
  }, [stopGame]);

  const launchFromLobby = useCallback((gid: 24 | 25 | 26 | 27 | 28) => {
    // Invoke Auto Full Screen synchronously inside the tap handler BEFORE setTimeout expires user activation
    tryAutoFullscreenOnGesture({ forceOnLaunch: true });
    setShowGameMenu(false);
    setShowInstructions(false);
    // Delay slightly so Lobby3DOverlay unmounts & disposes its showcase WebGL context before match WebGL starts
    window.setTimeout(() => {
      setActiveLobbyGame(null);
      window.setTimeout(() => {
        startGame(gid, difficultyRef.current, 1);
      }, 20);
    }, 0);
  }, [startGame]);

  // Register Bridge + Global Audio Sync + Autostart
  useEffect(() => {
    document.body.dataset.state = 'garden';
    registerHudBridge({
      onCoinsChange: () => {
        setCoins(playerState.totalCoins);
        setUnlockCount(playerState.unlockedAvatars.size);
      },
      onXpChange: () => {
        setXp(playerState.playerXp);
        setPLevel(playerState.playerLevel);
      },
      onHudUpdate: (score, lvl, gameIdx) => {
        setHudScore(score);
        setHudLevel(lvl);
        setHudHigh(playerState.highScores[gameIdx] || score);
      },
      onHealthUpdate: (cur, max) => {
        const safeCur = Math.max(0, cur);
        const safeMax = Math.max(1, max);
        const nextPct = Math.max(0, Math.min(100, (safeCur / safeMax) * 100));
        const prev = prevHealthRef.current;
        const prevPct = Math.max(0, Math.min(100, (prev.cur / Math.max(1, prev.max)) * 100));

        setHealthCur(safeCur);
        setHealthMax(safeMax);

        if (prev.max === safeMax && safeCur < prev.cur) {
          // Damage taken: hold delayed catch-up trail briefly before smoothly catching up
          setHealthTrailPct((currTrail) => Math.max(currTrail, prevPct));
          if (healthTrailTimerRef.current) clearTimeout(healthTrailTimerRef.current);
          healthTrailTimerRef.current = setTimeout(() => {
            healthTrailTimerRef.current = null;
            setHealthTrailPct(nextPct);
          }, 220);

          setHealthDmgFlash(true);
          if (healthFlashTimerRef.current) clearTimeout(healthFlashTimerRef.current);
          healthFlashTimerRef.current = setTimeout(() => {
            healthFlashTimerRef.current = null;
            setHealthDmgFlash(false);
          }, 260);
        } else {
          // Heal, respawn, or max-HP initialization: sync immediately with zero phantom trail
          if (healthTrailTimerRef.current) {
            clearTimeout(healthTrailTimerRef.current);
            healthTrailTimerRef.current = null;
          }
          setHealthTrailPct(nextPct);
        }
        prevHealthRef.current = { cur: safeCur, max: safeMax };
      },
      onGameOver: (score, coinsEarned, reachedLevel, gameIdx, isVictory) => {
        releaseAllGameInputs(activeGameRef.current);
        setShowPauseModal(false);
        document.body.dataset.state = 'gameover';
        setGameOverInfo({
          show: true,
          score,
          coins: coinsEarned,
          level: reachedLevel,
          high: playerState.highScores[gameIdx] || score,
          isVictory
        });
      },
      onActionLabelChange: (label) => {
        setActionBtnLabel(label);
      },
      onMobaHudUpdate: (snap) => {
        setMobaHud(snap);
        if (!snap) {
          prevMobaCdsRef.current = {};
          prevMobaHeroRef.current = '';
          return;
        }
        const nextCds = {
          skill1: snap.skill1.cd,
          skill2: snap.skill2.cd,
          skill3: snap.skill3.cd,
          skill4: snap.skill4.cd,
          spell: snap.spell.cd,
          regen: snap.regen.cd,
          itemActive: snap.itemActive.cd
        };
        if (prevMobaHeroRef.current !== snap.heroName) {
          prevMobaHeroRef.current = snap.heroName;
          prevMobaCdsRef.current = nextCds;
          return;
        }
        const newlyReady = detectCooldownReadySlots(prevMobaCdsRef.current, nextCds);
        prevMobaCdsRef.current = nextCds;
        if (newlyReady.length > 0) {
          setMobaReadyPopSlots((prev) => {
            const updated = { ...prev };
            for (const k of newlyReady) updated[k] = (updated[k] ?? 0) + 1;
            return updated;
          });
          for (const k of newlyReady) {
            const oldTimer = mobaReadyTimersRef.current[k];
            if (oldTimer) clearTimeout(oldTimer);
            mobaReadyTimersRef.current[k] = setTimeout(() => {
              delete mobaReadyTimersRef.current[k];
              setMobaReadyPopSlots((prev) => {
                if (!prev[k]) return prev;
                const copy = { ...prev };
                delete copy[k];
                return copy;
              });
            }, 580);
          }
        }
      },
      onNarutoHudUpdate: (snap) => {
        setNarutoHud(snap);
      },
      onHoopsHudUpdate: (snap) => {
        setHoopsHud(snap);
      }
    });

    ArcadeAudio.setToggleSync(() => {
      setBgmOn(ArcadeAudio.bgmEnabled);
      setSfxOn(ArcadeAudio.sfxEnabled);
      setSfxPackState(ArcadeAudio.sfxPack);
    });

    const unlockGesture = () => {
      ArcadeAudio.ensureCtx();
    };
    const onSmartphoneAutoFullscreenGesture = (ev: Event) => {
      const target = ev.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'LABEL') return;
        const skipBtn = target.closest
          ? target.closest(
              '#btnFloatingFullscreen, #btnBannerFullscreen, #settingsBtnToggleFullscreen, #pauseBtnToggleFullscreen, #settingsBtnAutoFullscreen, #pauseBtnAutoFullscreen'
            )
          : null;
        if (skipBtn) return;
      }
      tryAutoFullscreenOnGesture();
    };
    window.addEventListener('pointerdown', unlockGesture, { once: true, passive: true });
    window.addEventListener('touchstart', unlockGesture, { once: true, passive: true });
    window.addEventListener('touchend', unlockGesture, { once: true, passive: true });
    window.addEventListener('keydown', unlockGesture, { once: true });
    // Use touchend + click (never touchstart) so Chrome/Android/Samsung Internet accept trusted user activation for requestFullscreen()
    window.addEventListener('touchend', onSmartphoneAutoFullscreenGesture, { passive: true });
    window.addEventListener('click', onSmartphoneAutoFullscreenGesture, { passive: true });

    const savedTheme = THEME_PRESETS[initialPrefs.activeThemeIdx ?? 0];
    if (savedTheme) {
      document.documentElement.style.setProperty('--ui-accent', savedTheme.accent);
      document.documentElement.style.setProperty('--panel-bg', savedTheme.bg);
      document.documentElement.style.setProperty('--ui-text', savedTheme.text);
    }
    document.documentElement.style.setProperty('--dpad-scale', String(initialPrefs.dpadScale ?? 1.0));
    document.documentElement.style.setProperty('--dpad-y', `${initialPrefs.dpadY ?? 120}px`);
    document.documentElement.style.setProperty('--dpad-x', `${initialPrefs.dpadX ?? 20}px`);

    rebuildGarden();

    let autoLaunched = false;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const auto = params.get('autostart');
      if (auto) {
        const lower = auto.toLowerCase();
        if (lower === '1' || lower === 'menu') {
          setShowGameMenu(true);
          autoLaunched = true;
        } else if (lower in AUTOSTART_MAP) {
          const idx = AUTOSTART_MAP[lower];
          if (idx === 22 || idx === 25 || idx === 27) {
            setActiveLobbyGame(idx);
          } else {
            startGame(idx, difficultyRef.current, 1);
          }
          autoLaunched = true;
        } else {
          const parsed = parseInt(auto, 10);
          if (!Number.isNaN(parsed) && parsed >= 0 && parsed < GAME_LIST.length) {
            if (parsed === 22 || parsed === 25 || parsed === 27) {
              setActiveLobbyGame(parsed);
            } else {
              startGame(parsed, difficultyRef.current, 1);
            }
            autoLaunched = true;
          }
        }
      }
    } catch {
      // ignore invalid URL params
    }

    bootCheckedRef.current = true;
    wasViewingGardenRef.current = !autoLaunched;
    if (!autoLaunched) {
      maybeOpenDailyRewardPopup();
    }

    return () => {
      window.removeEventListener('pointerdown', unlockGesture);
      window.removeEventListener('touchstart', unlockGesture);
      window.removeEventListener('touchend', unlockGesture);
      window.removeEventListener('keydown', unlockGesture);
      window.removeEventListener('touchend', onSmartphoneAutoFullscreenGesture);
      window.removeEventListener('click', onSmartphoneAutoFullscreenGesture);
      if (dailyRewardTimerRef.current) {
        clearTimeout(dailyRewardTimerRef.current);
        dailyRewardTimerRef.current = null;
      }
      if (addedNoticeTimerRef.current) {
        clearTimeout(addedNoticeTimerRef.current);
        addedNoticeTimerRef.current = null;
      }
      stopGame();
      clearDynamicGarden();
    };
  }, [rebuildGarden, startGame, stopGame, clearDynamicGarden, maybeOpenDailyRewardPopup, releaseAllGameInputs]);

  const isViewingGarden = !isGameActive && !showGameMenu && !showInstructions && !gameOverInfo.show && activeLobbyGame === null;

  useEffect(() => {
    if (!bootCheckedRef.current) return;
    const prev = wasViewingGardenRef.current;
    wasViewingGardenRef.current = isViewingGarden;
    if (!prev && isViewingGarden) {
      maybeOpenDailyRewardPopup();
    }
  }, [isViewingGarden, maybeOpenDailyRewardPopup]);

  // Keep mobaEmoteOpenRef synced for keyboard shortcuts without rebinding listeners
  useEffect(() => {
    mobaEmoteOpenRef.current = mobaEmoteWheelOpen;
  }, [mobaEmoteWheelOpen]);

  // Night mode body class
  useEffect(() => {
    document.body.classList.toggle('night-mode', isNight);
  }, [isNight]);

  // Resize & Auto-Orientation subscription
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsub = subscribeViewport((snap) => {
      setViewportSnap(snap);
      if (activeGameRef.current?.resize) {
        requestAnimationFrame(() => activeGameRef.current?.resize?.());
      }
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          if (document.body.dataset.state === 'garden') createGrassBlades();
        }, 160);
      }
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [createGrassBlades]);

  // Movable modal headers (stage-coordinate accurate across normal & rotated landscape)
  useEffect(() => {
    const bindMovable = (header: HTMLDivElement | null, panel: HTMLDivElement | null) => {
      if (!header || !panel) return () => {};
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let initX = 0;
      let initY = 0;
      header.style.touchAction = 'none';

      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.classList.contains('close-btn')) return;
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initX = panel.offsetLeft;
        initY = panel.offsetTop;
        panel.style.position = 'fixed';
        panel.style.margin = '0';
        panel.style.left = `${initX}px`;
        panel.style.top = `${initY}px`;
        header.setPointerCapture?.(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const { dx, dy } = mapClientDeltaToStage(e.clientX - startX, e.clientY - startY);
        panel.style.left = `${initX + dx}px`;
        panel.style.top = `${initY + dy}px`;
      };
      const onUp = () => { dragging = false; };
      header.addEventListener('pointerdown', onDown);
      header.addEventListener('pointermove', onMove);
      header.addEventListener('pointerup', onUp);
      header.addEventListener('pointercancel', onUp);
      return () => {
        header.removeEventListener('pointerdown', onDown);
        header.removeEventListener('pointermove', onMove);
        header.removeEventListener('pointerup', onUp);
        header.removeEventListener('pointercancel', onUp);
      };
    };

    const clean1 = bindMovable(settingsHeaderRef.current, settingsPanelRef.current);
    const clean2 = bindMovable(pauseHeaderRef.current, pausePanelRef.current);
    return () => {
      clean1();
      clean2();
    };
  }, []);

  // Unified Keyboard + Virtual Analog Stick Input Merger
  const syncHeldGameControls = useCallback(() => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    const held = gameKeysHeldRef.current;
    const avec = analogVecRef.current;

    const keyDx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    const keyDy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    const dx = Math.abs(avec.x) > 0.08 ? avec.x : keyDx;
    const dy = Math.abs(avec.y) > 0.08 ? avec.y : keyDy;

    if (idx === 11) {
      g.setSteerLeft?.(held.left || avec.x < -0.2);
      g.setSteerRight?.(held.right || avec.x > 0.2);
    } else if (idx === 15) {
      g.setMoveDir?.(dx, dy);
      g.setBoost?.(held.boost);
    } else if (idx === 16) {
      g.setSteer?.(dx);
      g.setBoost?.(held.boost || avec.y < -0.78);
    } else if (idx === 17) {
      g.setMove?.(Math.abs(dx) < 0.15 ? 0 : dx);
    } else if (idx === 22) {
      g.setMove?.(Math.abs(dx) < 0.15 ? 0 : dx);
      g.setJetpack?.(held.up || avec.y < -0.45);
    } else if (idx === 24 || idx === 25) {
      g.setMoveDir?.(dx, dy);
    } else if (idx === 26) {
      if (Math.abs(avec.x) > 0.1) {
        g.setMoveDir?.(avec.x, avec.y);
      } else {
        g.setSteerLeft?.(held.left);
        g.setSteerRight?.(held.right);
      }
      g.setBoost?.(held.boost || held.up || avec.y < -0.68);
    } else if (idx === 27 || idx === 28) {
      g.setMoveDir?.(dx, dy);
    }
  }, []);

  useEffect(() => {
    const onBlur = () => {
      releaseAllGameInputs(activeGameRef.current);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) return;
      const g = activeGameRef.current;
      releaseAllGameInputs(g);
      if (g && !g.gameOver && !g.isPaused) {
        g.pause?.();
        g.isPaused = true;
        ArcadeAudio.syncPause(true);
        setShowPauseModal(true);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName || '';
      const g = activeGameRef.current;
      const idx = selectedGameRef.current;

      if (
        (e.key === 'm' || e.key === 'M') &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA' &&
        !(g && idx === 20) &&
        !document.querySelector('.hoops-city-screen') &&
        !document.querySelector('.nba2k14-shell')
      ) {
        ArcadeAudio.toggleBgm();
        return;
      }

      if (g && !g.gameOver && !g.isPaused) {
        if (idx === 20 && g.handleKey) {
          if (e.key === 'Backspace' || /^[a-zA-Z]$/.test(e.key)) {
            e.preventDefault();
            g.handleKey(e.key);
            return;
          }
        }
        if (idx === 21 && g.handleKey) {
          if (/^[0-9]$/.test(e.key) || e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow')) {
            e.preventDefault();
            g.handleKey(e.key);
            return;
          }
        }
        if (e.repeat) return;

        if (idx === 6 && g.stepHistory) {
          if (e.key === 'ArrowLeft') { g.stepHistory(-1); return; }
          if (e.key === 'ArrowRight') { g.stepHistory(1); return; }
        }

        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') gameKeysHeldRef.current.left = true;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') gameKeysHeldRef.current.right = true;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') gameKeysHeldRef.current.up = true;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') gameKeysHeldRef.current.down = true;
        if (e.key === ' ') gameKeysHeldRef.current.boost = true;

        if (idx === 7) {
          if (e.key === ' ' || e.key === 'Shift' || e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            g.toggleScope?.();
            return;
          }
          if (e.key === 'r' || e.key === 'R') {
            g.reload?.();
            return;
          }
        }

        if (idx === 23) {
          if (/^[1-8]$/.test(e.key)) {
            g.trainUnit?.(parseInt(e.key, 10) - 1);
            return;
          }
          if (e.key === 'q' || e.key === 'Q') { g.setStance?.('garrison'); return; }
          if (e.key === 'e' || e.key === 'E') { g.setStance?.('attack'); return; }
          if (e.key === 'f' || e.key === 'F') { g.setStance?.('defend'); return; }
        }

        if (idx === 24) {
          if (e.key === ' ') { e.preventDefault(); g.jump?.(); }
          else if (e.key === 'r' || e.key === 'R') g.reload?.();
          else if (e.key === 'e' || e.key === 'E' || e.key === 'Shift') g.toggleScope?.();
          else if (e.key === 'f' || e.key === 'F') g.triggerAction?.('vehicle', true);
          else if (e.key === 'g' || e.key === 'G') g.triggerAction?.('grenade', true);
          else if (e.key === 'c' || e.key === 'C') g.triggerAction?.('flare', true);
          else if (e.key === 'q' || e.key === 'Q') g.triggerAction?.('swapWeapon', true);
          else if (e.key === 'h' || e.key === 'H') g.triggerAction?.('heal', true);
          else if (e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') g.triggerAction?.('fire', true);
          else if (/^[1-4]$/.test(e.key)) {
            (g as unknown as { switchWeapon?: (slot: number) => void }).switchWeapon?.(parseInt(e.key, 10) - 1);
          }
        }

        if (idx === 25) {
          if (e.key === 'Escape' && mobaEmoteOpenRef.current) {
            e.preventDefault();
            setMobaEmoteWheelOpen(false);
            setMobaEmoteHoverSlot(null);
            return;
          }
          if (e.key === 'Escape' && mobaKeyAimRef.current?.active) {
            e.preventDefault();
            mobaKeyAimRef.current = null;
            setMobaSkillAimUi(null);
            g.cancelSkillAim?.();
            return;
          }
          if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            ArcadeAudio.play('click');
            setMobaEmoteWheelOpen((v) => !v);
            setMobaEmoteHoverSlot(null);
            return;
          }
          if (mobaEmoteOpenRef.current && /^[1-4]$/.test(e.key)) {
            e.preventDefault();
            g.triggerEmote?.(parseInt(e.key, 10) - 1);
            setMobaEmoteWheelOpen(false);
            setMobaEmoteHoverSlot(null);
            return;
          }
          if (e.key === 'p' || e.key === 'P' || e.key === 'o' || e.key === 'O') {
            e.preventDefault();
            ArcadeAudio.play('click');
            setShowMobaShop((v) => !v);
            return;
          }
          const lower = e.key.toLowerCase();
          const aimKeyMap: Record<string, 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell'> = {
            '1': 'skill1',
            k: 'skill1',
            '2': 'skill2',
            l: 'skill2',
            '3': 'skill3',
            u: 'skill3',
            '4': 'skill4',
            r: 'skill4',
            f: 'spell',
            e: 'spell'
          };
          const aimAction = aimKeyMap[lower];
          if (aimAction && g.beginSkillAim) {
            if (mobaKeyAimRef.current?.active) {
              g.cancelSkillAim?.();
            }
            const started = g.beginSkillAim(aimAction, 'cursor');
            if (started) {
              mobaKeyAimRef.current = {
                active: true,
                actionKey: aimAction,
                key: lower,
                downAt: performance.now(),
                movedMouse: false
              };
              const lastPt = lastPointerClientRef.current;
              g.updateSkillAimScreen?.(lastPt.x, lastPt.y, false);
              setMobaSkillAimUi({
                active: true,
                mode: 'cursor',
                actionKey: aimAction,
                label: aimAction.toUpperCase(),
                icon: '🎯',
                color: '#38bdf8',
                cx: 0,
                cy: 0,
                cancelled: false
              });
            }
            return;
          }
          if (e.key === ' ' || e.key === 'j' || e.key === 'J') { e.preventDefault(); g.attack?.(); }
          else if (e.key === '5' || e.key === 'x' || e.key === 'X') g.triggerAction?.('itemActive', true);
          else if (e.key === 'q' || e.key === 'Q') g.quickBuy?.();
          else if (e.key === 'h' || e.key === 'H') g.triggerAction?.('regen', true);
          else if (e.key === 'b' || e.key === 'B') g.triggerAction?.('recall', true);
        }

        if (idx === 26) {
          if (e.key === 'Shift') g.triggerAction?.('drift', true);
          else if (e.key === 'j' || e.key === 'J') g.jump?.();
        }

        if (idx === 27) {
          if (e.key === ' ') {
            e.preventDefault();
            g.triggerAction?.('shoot', true);
          } else if (e.key === 'Tab') {
            e.preventDefault();
            g.toggleIconPassing?.();
          } else if (e.key === 'q' || e.key === 'Q') {
            g.callHoopsPlay?.();
          } else if (e.key === 't' || e.key === 'T') {
            g.activateHoopsTakeover?.();
          } else if (e.key === 'c' || e.key === 'C') {
            g.toggleHoopsCamera?.();
          } else if (/^[1-4]$/.test(e.key)) {
            g.handleKey?.(e.key);
          } else if (e.key === 'e' || e.key === 'E' || e.key === 'j' || e.key === 'J') {
            g.triggerAction?.('pass', true);
          } else if (e.key === 'f' || e.key === 'F' || e.key === 'k' || e.key === 'K') {
            g.triggerAction?.('steal', true);
          } else if (e.key === 'Shift') {
            g.triggerAction?.('sprint', true);
          }
        }

        if (idx === 28) {
          if (e.key === ' ' || e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            g.attack?.();
          } else if (e.key === '1' || e.key === 'u' || e.key === 'U') {
            g.triggerAction?.('skill1', true);
          } else if (e.key === '2' || e.key === 'i' || e.key === 'I') {
            g.triggerAction?.('skill2', true);
          } else if (e.key === '3' || e.key === 'o' || e.key === 'O') {
            g.triggerAction?.('skill3', true);
          } else if (e.key === '4' || e.key === 'k' || e.key === 'K') {
            g.triggerAction?.('skill4', true);
          } else if (e.key === '5' || e.key === 'l' || e.key === 'L') {
            g.triggerAction?.('skill5', true);
          } else if (e.key === 'e' || e.key === 'E' || e.key === 'Shift') {
            g.triggerAction?.('sub', true);
          } else if (e.key === 'c' || e.key === 'C') {
            g.triggerAction?.('chakra', true);
          } else if (e.key === 'q' || e.key === 'Q') {
            g.triggerAction?.('guard', true);
          } else if (e.key === 'r' || e.key === 'R' || e.key === 't' || e.key === 'T') {
            g.triggerAction?.('support', true);
          } else if (e.key === 'Tab') {
            e.preventDefault();
            g.switchStormLeader?.();
          } else if (e.key === 'z' || e.key === 'Z' || e.key === '7') {
            if (g.uses3DViewport) g.useStormNinjaTool?.(0);
            else g.buySenkiItem?.('ramen');
          } else if (e.key === 'x' || e.key === 'X' || e.key === '8') {
            if (g.uses3DViewport) g.useStormNinjaTool?.(1);
            else g.buySenkiItem?.('pill');
          } else if (e.key === 'v' || e.key === 'V' || e.key === '9') {
            if (g.uses3DViewport) g.useStormNinjaTool?.(2);
            else g.buySenkiItem?.('speed_tag');
          } else if (e.key === 'b' || e.key === 'B' || e.key === '0') {
            if (g.uses3DViewport) g.useStormNinjaTool?.(3);
          }
        }

        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          if (idx === 0) g.jump?.();
          else if (idx === 1) g.flap?.();
          else if (idx === 10) { e.preventDefault(); g.jump?.(); }
          else if (idx === 17 && (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')) g.jump?.();
          else if (idx === 19) { e.preventDefault(); g.jump?.(); }
        }

        if (idx === 17 && (e.key === ' ' || e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          g.attack?.();
        }
        if (idx === 22 && (e.key === ' ' || e.key === 'g' || e.key === 'G')) {
          e.preventDefault();
          g.throwGrenade?.();
        }

        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          if (idx === 10) g.slide?.();
          else if (idx === 17) (g as unknown as { dropDown?: () => void }).dropDown?.();
          else if (idx === 19) g.setSlide?.(true);
        }

        if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && (idx === 5 || idx === 10)) {
          g.moveLeft?.();
        }
        if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && (idx === 5 || idx === 10)) {
          g.moveRight?.();
        }
        if (idx === 16 && (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')) {
          gameKeysHeldRef.current.boost = true;
        }

        syncHeldGameControls();
        return;
      }

      if (e.repeat) return;
      if (document.querySelector('.overlay-modal.show') || document.getElementById('gameOverlay')?.classList.contains('show')) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') startMovingGarden('up');
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') startMovingGarden('left');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') startMovingGarden('right');
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') startMovingGarden('down');
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const g = activeGameRef.current;
      const idx = selectedGameRef.current;
      if (g) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') gameKeysHeldRef.current.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') gameKeysHeldRef.current.right = false;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          gameKeysHeldRef.current.up = false;
          if (idx === 16) gameKeysHeldRef.current.boost = false;
        }
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          gameKeysHeldRef.current.down = false;
          if (idx === 19) g.setSlide?.(false);
        }
        if (e.key === ' ') {
          gameKeysHeldRef.current.boost = false;
        }
        if (idx === 25 && mobaKeyAimRef.current?.active && e.key.toLowerCase() === mobaKeyAimRef.current.key) {
          const heldMs = performance.now() - mobaKeyAimRef.current.downAt;
          const quickTap = heldMs < 160 && !mobaKeyAimRef.current.movedMouse;
          mobaKeyAimRef.current = null;
          setMobaSkillAimUi(null);
          g.commitSkillAim?.(quickTap);
        }
        if (idx === 24 && (e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K')) g.triggerAction?.('fire', false);
        if (idx === 26 && e.key === 'Shift') g.triggerAction?.('drift', false);
        if (idx === 27) {
          if (e.key === ' ') g.triggerAction?.('shoot', false);
          else if (e.key === 'Shift') g.triggerAction?.('sprint', false);
        }
        if (idx === 28) {
          if (e.key === 'c' || e.key === 'C') g.triggerAction?.('chakra', false);
          if (e.key === 'q' || e.key === 'Q') g.triggerAction?.('guard', false);
        }
        syncHeldGameControls();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') stopMovingGarden('up');
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stopMovingGarden('left');
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stopMovingGarden('right');
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') stopMovingGarden('down');
    };

    const onGlobalPointerMove = (e: PointerEvent) => {
      lastPointerClientRef.current = { x: e.clientX, y: e.clientY };
      const keyAim = mobaKeyAimRef.current;
      const g = activeGameRef.current;
      if (keyAim?.active && selectedGameRef.current === 25 && g && !g.gameOver && !g.isPaused) {
        keyAim.movedMouse = true;
        const rect = mobaCancelZoneRef.current?.getBoundingClientRect();
        const inCancel = Boolean(
          rect &&
            e.clientX >= rect.left - 12 &&
            e.clientX <= rect.right + 12 &&
            e.clientY >= rect.top - 12 &&
            e.clientY <= rect.bottom + 12
        );
        g.updateSkillAimScreen?.(e.clientX, e.clientY, inCancel);
        setMobaSkillAimUi((prev) => (prev && prev.cancelled !== inCancel ? { ...prev, cancelled: inCancel } : prev));
      }
    };

    const onGlobalPointerDown = (e: PointerEvent) => {
      const keyAim = mobaKeyAimRef.current;
      const g = activeGameRef.current;
      if (!keyAim?.active || selectedGameRef.current !== 25 || !g) return;
      if (e.button === 2) {
        e.preventDefault();
        mobaKeyAimRef.current = null;
        setMobaSkillAimUi(null);
        g.cancelSkillAim?.();
        return;
      }
      if (e.button === 0) {
        const rect = mobaCancelZoneRef.current?.getBoundingClientRect();
        const inCancel = Boolean(
          rect &&
            e.clientX >= rect.left - 12 &&
            e.clientX <= rect.right + 12 &&
            e.clientY >= rect.top - 12 &&
            e.clientY <= rect.bottom + 12
        );
        mobaKeyAimRef.current = null;
        setMobaSkillAimUi(null);
        if (inCancel) {
          g.cancelSkillAim?.();
        } else {
          g.updateSkillAimScreen?.(e.clientX, e.clientY, false);
          g.commitSkillAim?.(false);
        }
      }
    };

    const onGlobalContextMenu = (e: MouseEvent) => {
      if (mobaKeyAimRef.current?.active && selectedGameRef.current === 25) {
        e.preventDefault();
        mobaKeyAimRef.current = null;
        setMobaSkillAimUi(null);
        activeGameRef.current?.cancelSkillAim?.();
      }
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointermove', onGlobalPointerMove, { passive: true });
    window.addEventListener('pointerdown', onGlobalPointerDown);
    window.addEventListener('contextmenu', onGlobalContextMenu);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointermove', onGlobalPointerMove);
      window.removeEventListener('pointerdown', onGlobalPointerDown);
      window.removeEventListener('contextmenu', onGlobalContextMenu);
    };
  }, [startMovingGarden, stopMovingGarden, syncHeldGameControls, releaseAllGameInputs]);

  // CSS Variable updaters
  const applyTheme = (idx: number) => {
    const t = THEME_PRESETS[idx];
    if (!t) return;
    setActiveThemeIdx(idx);
    saveUiPrefs({ activeThemeIdx: idx });
    document.documentElement.style.setProperty('--ui-accent', t.accent);
    document.documentElement.style.setProperty('--panel-bg', t.bg);
    document.documentElement.style.setProperty('--ui-text', t.text);
  };

  const resetDpadLayout = () => {
    setDpadScale(1.0);
    setDpadY(120);
    setDpadX(20);
    saveUiPrefs({ dpadScale: 1.0, dpadY: 120, dpadX: 20 });
    document.documentElement.style.setProperty('--dpad-scale', '1');
    document.documentElement.style.setProperty('--dpad-y', '120px');
    document.documentElement.style.setProperty('--dpad-x', '20px');
  };

  // Pause & Resume handlers
  const openPauseMenu = () => {
    const g = activeGameRef.current;
    if (!g) return;
    ArcadeAudio.play('click');
    releaseAllGameInputs(g);
    g.pause?.();
    g.isPaused = true;
    ArcadeAudio.syncPause(true);
    setShowPauseModal(true);
  };

  const resumeGame = () => {
    ArcadeAudio.play('click');
    setShowPauseModal(false);
    const g = activeGameRef.current;
    if (g) {
      if (g.resume) {
        g.resume();
      } else {
        g.isPaused = false;
        g.lastTime = performance.now();
        g.lastClockTick = performance.now();
        if (g.loop && g.isRunning && !g.gameOver && !g.animId) {
          g.animId = requestAnimationFrame((t) => g.loop?.(t));
        }
      }
      ArcadeAudio.syncPause(false);
    }
  };

  // Canvas Unified Pointer / Slice Handlers
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const snap = getViewportSnapshot();
    if (snap.isRotatedFallback) {
      return mapClientToStage(clientX, clientY, snap);
    }
    const canvas = canvasRef.current;
    if (!canvas) return { x: clientX, y: clientY };
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (idx === 2) {
      e.preventDefault();
      canvasRef.current?.setPointerCapture?.(e.pointerId);
      g.handleSlice?.(x, y);
    } else if (idx === 3) {
      g.handleClick?.(x, y);
    } else if (idx === 7) {
      if (e.button === 2) {
        e.preventDefault();
        g.toggleScope?.();
        return;
      }
      g.handleFire?.(x, y, e.pointerType || 'mouse');
    } else if (idx >= 8) {
      e.preventDefault();
      canvasRef.current?.setPointerCapture?.(e.pointerId);
      g.onPointerDown?.(x, y, e.pointerType || 'mouse');
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (idx === 2) {
      g.handleSlice?.(x, y);
    } else if (idx === 7) {
      g.handlePointerMove?.(x, y);
    } else if (idx >= 8) {
      g.onPointerMove?.(x, y, e.pointerType || 'mouse');
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    try {
      canvasRef.current?.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore if not captured
    }
    if (!g || g.gameOver || g.isPaused) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    if (idx >= 8) {
      g.onPointerUp?.(x, y, e.pointerType || 'mouse');
    }
  };

  const updateGameLayoutState = useCallback((updater: (prev: GameControlLayout) => GameControlLayout) => {
    setGameLayout((prev) => {
      const next = updater(prev);
      saveGameLayout(selectedGameRef.current, next);
      return next;
    });
  }, []);

  const setControlMode = useCallback((mode: ControlMode) => {
    resetAnalogStick();
    updateGameLayoutState((prev) => ({ ...prev, controlMode: mode }));
    const idx = selectedGameRef.current;
    setAimCursorPos((prev) => ({
      x: aimCursorRef.current.x || prev.x,
      y: aimCursorRef.current.y || prev.y,
      visible: mode === 'analog' && CURSOR_AIM_GAMES.has(idx)
    }));
  }, [resetAnalogStick, updateGameLayoutState]);

  const toggleControlMode = useCallback(() => {
    ArcadeAudio.play('click');
    setControlMode(gameLayout.controlMode === 'analog' ? 'buttons' : 'analog');
  }, [gameLayout.controlMode, setControlMode]);

  const patchBuiltInControl = (
    key: 'action' | 'jump' | 'steerLeft' | 'steerRight' | 'analog',
    patch: Partial<ControlPosition>
  ) => {
    updateGameLayoutState((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch }
    }));
  };

  const patchExtraControl = (id: string, patch: Partial<ControlPosition>) => {
    updateGameLayoutState((prev) => ({
      ...prev,
      extras: prev.extras.map((b) => (b.id === id ? { ...b, ...patch } : b))
    }));
  };

  const beginDragControl = (key: string, origXPct: number, origYPx: number, e: React.PointerEvent) => {
    if (!dragEditMode) return false;
    e.preventDefault();
    e.stopPropagation();
    dragCtrlRef.current = { key, startX: e.clientX, startY: e.clientY, origXPct, origYPx };
    const onMove = (mv: PointerEvent) => {
      const d = dragCtrlRef.current;
      if (!d) return;
      const { dx, dy } = mapClientDeltaToStage(mv.clientX - d.startX, mv.clientY - d.startY);
      const vp = getViewportSize();
      const dxPct = (dx / Math.max(1, vp.width)) * 100;
      const dyPx = -dy;
      const clamped = clampControlPos(d.origXPct + dxPct, d.origYPx + dyPx, 1);
      if (d.key === 'action' || d.key === 'jump' || d.key === 'steerLeft' || d.key === 'steerRight' || d.key === 'analog') {
        patchBuiltInControl(d.key, { xPct: clamped.xPct, yPx: clamped.yPx });
      } else {
        patchExtraControl(d.key, { xPct: clamped.xPct, yPx: clamped.yPx });
      }
    };
    const onUp = () => {
      dragCtrlRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return true;
  };

  // Universal Action Dispatcher for All 27 Games (supports Pause Presets + Analog Actions)
  const dispatchPresetAction = (actionKey: string, pressed: boolean) => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;

    // 1. Directional & Movement presets work globally via keyboard/analog pipeline + game fallbacks
    if (actionKey === 'left') {
      gameKeysHeldRef.current.left = pressed;
      syncHeldGameControls();
      if (pressed) {
        if (idx === 5 || idx === 10) g.moveLeft?.();
        else if (idx === 6) g.stepHistory?.(-1);
        else if (idx === 20 || idx === 21) g.handleKey?.('ArrowLeft');
        else if (idx === 23) g.setStance?.('garrison');
      }
      g.triggerAction?.(actionKey, pressed);
      return;
    }
    if (actionKey === 'right') {
      gameKeysHeldRef.current.right = pressed;
      syncHeldGameControls();
      if (pressed) {
        if (idx === 5 || idx === 10) g.moveRight?.();
        else if (idx === 6) g.stepHistory?.(1);
        else if (idx === 20 || idx === 21) g.handleKey?.('ArrowRight');
        else if (idx === 23) g.setStance?.('attack');
      }
      g.triggerAction?.(actionKey, pressed);
      return;
    }
    if (actionKey === 'moveUp') {
      gameKeysHeldRef.current.up = pressed;
      syncHeldGameControls();
      if (idx === 22) g.setJetpack?.(pressed);
      else if (pressed) {
        if (idx === 1) g.flap?.();
        else if (idx === 20 || idx === 21) g.handleKey?.('ArrowUp');
        else if (idx === 23) g.setStance?.('defend');
        else if (idx !== 24 && idx !== 25 && idx !== 26 && idx !== 27) g.jump?.();
      }
      g.triggerAction?.(actionKey, pressed);
      return;
    }
    if (actionKey === 'down') {
      gameKeysHeldRef.current.down = pressed;
      syncHeldGameControls();
      if (idx === 19) g.setSlide?.(pressed);
      else if (pressed) {
        if (idx === 10) g.slide?.();
        else if (idx === 17) (g as unknown as { dropDown?: () => void }).dropDown?.();
        else if (idx === 20 || idx === 21) g.handleKey?.('ArrowDown');
      }
      g.triggerAction?.(actionKey, pressed);
      return;
    }

    // 2. Hint preset for puzzle & DOM games
    if (actionKey === 'hint') {
      if (pressed) {
        if (g.useHint) g.useHint();
        else if (idx === 4) {
          const btn = document.querySelector('#codeOptions button') as HTMLButtonElement | null;
          btn?.click();
        } else if (idx === 6) {
          g.stepHistory?.(-1);
        } else {
          g.triggerAction?.('hint', true);
        }
      }
      return;
    }

    // 3. Fire / Aimed Action / Slice / Tap at current reticle or canvas center
    if (actionKey === 'fire') {
      g.triggerAction?.('fire', pressed);
      const ax = aimCursorRef.current.x;
      const ay = aimCursorRef.current.y;
      if (pressed) {
        if (idx === 7) g.handleFire?.(ax, ay, 'touch');
        else if (idx === 2) g.handleSlice?.(ax, ay);
        else if (idx === 3) g.handleClick?.(ax, ay);
        else if (idx === 8 || idx === 9 || idx === 12 || idx === 13 || idx === 14 || idx === 18) {
          g.onPointerDown?.(ax, ay, 'touch');
        } else if (idx !== 22 && idx !== 24) {
          g.attack?.();
        }
      } else if (idx === 8 || idx === 9 || idx === 12 || idx === 13 || idx === 14 || idx === 18) {
        g.onPointerUp?.(ax, ay, 'touch');
      }
      return;
    }

    // 4. Delegate to game's explicit triggerAction if present
    if (g.triggerAction) {
      g.triggerAction(actionKey, pressed);
      return;
    }

    // 5. Fallback dispatchers for 2D & DOM games without explicit triggerAction
    if (actionKey === 'jump') {
      if (idx === 22) g.setJetpack?.(pressed);
      else if (pressed) {
        g.jump?.();
        g.flap?.();
      }
    } else if (actionKey === 'attack') {
      if (pressed) {
        if (g.attack) g.attack();
        else if (idx === 7) g.handleFire?.(aimCursorRef.current.x, aimCursorRef.current.y, 'touch');
        else g.jump?.();
      }
    } else if (actionKey === 'reload' && pressed) {
      g.reload?.();
    } else if (actionKey === 'scope' && pressed) {
      g.toggleScope?.();
    } else if (actionKey === 'grenade' && pressed) {
      g.throwGrenade?.();
    } else if (actionKey === 'boost') {
      gameKeysHeldRef.current.boost = pressed;
      g.setBoost?.(pressed);
      if (idx === 19) g.setSlide?.(pressed);
    } else if (actionKey === 'action') {
      if (idx === 19) g.setSlide?.(pressed);
      else if (idx === 22) g.setJetpack?.(pressed);
      else if (idx === 15 || idx === 16 || idx === 26) g.setBoost?.(pressed);
      else if (pressed) {
        if (idx === 4) {
          const btn = document.querySelector('#codeOptions button') as HTMLButtonElement | null;
          btn?.click();
        } else if (g.useHint) {
          g.useHint();
        } else {
          g.jump?.();
          g.flap?.();
          g.attack?.();
        }
      }
    }
  };

  // Analog Stick 60fps Driver Loop
  const driveAnalogLoop = useCallback(() => {
    const vec = analogVecRef.current;
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;

    if (!vec.active || !g || g.gameOver || g.isPaused) {
      analogRafRef.current = null;
      return;
    }

    const now = performance.now();
    const dt = Math.min((now - (analogEdgeRef.current.lastTime || now)) / 1000, 0.05);
    analogEdgeRef.current.lastTime = now;

    syncHeldGameControls();

    // Edge-triggered directional hysteresis for lane / card / DOM puzzle games
    const nextH: -1 | 0 | 1 = vec.x < -0.55 ? -1 : vec.x > 0.55 ? 1 : 0;
    const nextV: -1 | 0 | 1 = vec.y < -0.55 ? -1 : vec.y > 0.55 ? 1 : 0;
    const prevEdge = analogEdgeRef.current;

    if (nextH !== prevEdge.h && nextH !== 0) {
      if (idx === 5 || idx === 10) {
        if (nextH < 0) g.moveLeft?.();
        else g.moveRight?.();
      } else if (idx === 6) {
        g.stepHistory?.(nextH);
      } else if (idx === 20 || idx === 21) {
        g.handleKey?.(nextH < 0 ? 'ArrowLeft' : 'ArrowRight');
      } else if (idx === 23) {
        g.setStance?.(nextH < 0 ? 'garrison' : 'attack');
      }
    }
    if (nextV !== prevEdge.v && nextV !== 0) {
      if (idx === 0 || idx === 10 || idx === 19) {
        if (nextV < 0) g.jump?.();
        else if (idx === 10) g.slide?.();
      } else if (idx === 1 && nextV < 0) {
        g.flap?.();
      } else if (idx === 17) {
        if (nextV < 0) g.jump?.();
        else (g as unknown as { dropDown?: () => void }).dropDown?.();
      } else if (idx === 20 || idx === 21) {
        g.handleKey?.(nextV < 0 ? 'ArrowUp' : 'ArrowDown');
      } else if (idx === 23 && nextV < 0) {
        g.setStance?.('defend');
      }
    }
    if (idx === 19) {
      g.setSlide?.(vec.y > 0.5);
    }
    prevEdge.h = nextH;
    prevEdge.v = nextV;

    // Virtual reticle movement for aim/board/cursor canvas games
    if (CURSOR_AIM_GAMES.has(idx) && (Math.abs(vec.x) > 0.05 || Math.abs(vec.y) > 0.05)) {
      const vp = getViewportSize();
      const w = Math.max(240, vp.width);
      const h = Math.max(240, vp.height);
      const spd = 440;
      const nx = Math.max(16, Math.min(w - 16, aimCursorRef.current.x + vec.x * spd * dt));
      const ny = Math.max(48, Math.min(h - 24, aimCursorRef.current.y + vec.y * spd * dt));
      aimCursorRef.current = { x: nx, y: ny };
      setAimCursorPos({ x: Math.round(nx), y: Math.round(ny), visible: true });

      if (idx === 2) g.handleSlice?.(nx, ny);
      else if (idx === 7) g.handlePointerMove?.(nx, ny);
      else if (idx >= 8) g.onPointerMove?.(nx, ny, 'touch');
    }

    analogRafRef.current = requestAnimationFrame(driveAnalogLoop);
  }, [syncHeldGameControls]);

  const updateAnalogFromClient = (clientX: number, clientY: number) => {
    const pad = analogPadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const maxR = Math.max(26, Math.min(rect.width, rect.height) * 0.36);
    const mapped = mapClientDeltaToStage(clientX - cx, clientY - cy);
    let dx = mapped.dx;
    let dy = mapped.dy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    if (analogThumbRef.current) {
      analogThumbRef.current.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
    }
    let nx = dx / maxR;
    let ny = dy / maxR;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.14) {
      nx = 0;
      ny = 0;
    }
    analogVecRef.current.x = nx;
    analogVecRef.current.y = ny;
    syncHeldGameControls();
  };

  const handleAnalogDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (beginDragControl('analog', gameLayout.analog.xPct, gameLayout.analog.yPx, e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    analogPadRef.current?.classList.add('active');
    analogVecRef.current.active = true;
    analogVecRef.current.pointerId = e.pointerId;
    analogEdgeRef.current.lastTime = performance.now();
    updateAnalogFromClient(e.clientX, e.clientY);
    if (analogRafRef.current === null) {
      analogRafRef.current = requestAnimationFrame(driveAnalogLoop);
    }
  };

  const handleAnalogMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!analogVecRef.current.active || analogVecRef.current.pointerId !== e.pointerId) return;
    e.preventDefault();
    updateAnalogFromClient(e.clientX, e.clientY);
  };

  const handleAnalogUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (analogVecRef.current.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore if already released
    }
    analogPadRef.current?.classList.remove('active');
    analogVecRef.current = { x: 0, y: 0, active: false, pointerId: null };
    analogEdgeRef.current = { h: 0, v: 0, lastTime: 0 };
    if (analogRafRef.current !== null) {
      cancelAnimationFrame(analogRafRef.current);
      analogRafRef.current = null;
    }
    if (analogThumbRef.current) {
      analogThumbRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    syncHeldGameControls();
    if (activeGameRef.current && selectedGameRef.current === 19) {
      activeGameRef.current.setSlide?.(false);
    }
  };

  // On-Screen Steer & Action & Jump Handlers
  const handleActionDown = (e: React.PointerEvent) => {
    if (beginDragControl('action', gameLayout.action.xPct, gameLayout.action.yPx, e)) return;
    e.preventDefault();
    ArcadeAudio.play('click');
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    if (idx === 0) g.jump?.();
    else if (idx === 1) g.flap?.();
    else if (idx === 7) {
      if (g.mode === 'sniper') g.toggleScope?.();
      else g.reload?.();
    } else if (idx === 10) g.jump?.();
    else if (idx === 15 || idx === 16 || idx === 26) g.setBoost?.(true);
    else if (idx === 17 || idx === 25 || idx === 28) g.attack?.();
    else if (idx === 19) g.setSlide?.(true);
    else if (idx === 22) g.setJetpack?.(true);
    else if (idx === 24) g.triggerAction?.('fire', true);
    else if (idx === 27) g.triggerAction?.('shoot', true);
    else g.triggerAction?.('action', true);
  };

  const handleActionUp = () => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g) return;
    if (idx === 15 || idx === 16 || idx === 26) g.setBoost?.(false);
    else if (idx === 19) g.setSlide?.(false);
    else if (idx === 22) g.setJetpack?.(false);
    else if (idx === 24) g.triggerAction?.('fire', false);
    else if (idx === 27) g.triggerAction?.('shoot', false);
    else g.triggerAction?.('action', false);
  };

  const isClientInMobaCancelZone = (clientX: number, clientY: number): boolean => {
    const rect = mobaCancelZoneRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pad = 16;
    return (
      clientX >= rect.left - pad &&
      clientX <= rect.right + pad &&
      clientY >= rect.top - pad &&
      clientY <= rect.bottom + pad
    );
  };

  const beginMobaDragAim = (
    actionKey: 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell',
    label: string,
    icon: string,
    color: string,
    e: React.PointerEvent<HTMLButtonElement>
  ): boolean => {
    const g = activeGameRef.current;
    if (!g || g.gameOver || g.isPaused || !g.beginSkillAim) return false;
    const started = g.beginSkillAim(actionKey, 'drag');
    if (!started) return false;

    const rect = e.currentTarget.getBoundingClientRect();
    const center = mapClientToStage(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
    mobaDragAimRef.current = {
      active: true,
      pointerId: e.pointerId,
      actionKey,
      label,
      icon,
      color,
      cx: center.x,
      cy: center.y,
      startX: e.clientX,
      startY: e.clientY,
      didDrag: false,
      cancelled: false,
      wheelRadius: 54
    };
    return true;
  };

  const moveMobaDragAim = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = mobaDragAimRef.current;
    if (!drag.active || drag.pointerId !== e.pointerId) return;
    e.preventDefault();
    const { dx, dy } = mapClientDeltaToStage(e.clientX - drag.startX, e.clientY - drag.startY);
    const dist = Math.hypot(dx, dy);

    if (!drag.didDrag && dist >= 12) {
      drag.didDrag = true;
      setMobaSkillAimUi({
        active: true,
        mode: 'drag',
        actionKey: drag.actionKey,
        label: drag.label,
        icon: drag.icon,
        color: drag.color,
        cx: drag.cx,
        cy: drag.cy,
        cancelled: false
      });
    }

    if (drag.didDrag) {
      const r = drag.wheelRadius;
      let tx = dx;
      let ty = dy;
      if (dist > r && dist > 1e-4) {
        tx = (dx / dist) * r;
        ty = (dy / dist) * r;
      }
      if (mobaAimThumbRef.current) {
        mobaAimThumbRef.current.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      }
      const inCancel = isClientInMobaCancelZone(e.clientX, e.clientY);
      if (inCancel !== drag.cancelled) {
        drag.cancelled = inCancel;
        setMobaSkillAimUi((prev) => (prev ? { ...prev, cancelled: inCancel } : null));
      }
      activeGameRef.current?.updateSkillAimDrag?.(tx / r, ty / r, inCancel);
    }
  };

  const endMobaDragAim = (e: React.PointerEvent<HTMLButtonElement>, forceCancel = false) => {
    const drag = mobaDragAimRef.current;
    if (!drag.active || (e.pointerId !== undefined && drag.pointerId !== e.pointerId)) return;
    const didDrag = drag.didDrag;
    const cancelled = forceCancel || drag.cancelled;
    drag.active = false;
    drag.pointerId = null;
    drag.didDrag = false;
    drag.cancelled = false;
    setMobaSkillAimUi(null);
    if (mobaAimThumbRef.current) {
      mobaAimThumbRef.current.style.transform = 'translate3d(0px, 0px, 0)';
    }
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    if (cancelled) {
      activeGameRef.current?.cancelSkillAim?.();
    } else {
      activeGameRef.current?.commitSkillAim?.(!didDrag);
    }
  };

  const handleJumpBtnDown = (e: React.PointerEvent) => {
    if (beginDragControl('jump', gameLayout.jump.xPct, gameLayout.jump.yPx, e)) return;
    e.preventDefault();
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    if (idx === 17 || idx === 24 || idx === 26) g.jump?.();
    else if (idx === 22) g.throwGrenade?.();
    else if (idx === 27) g.triggerAction?.('pass', true);
    else if (idx === 28) g.triggerAction?.('skill1', true);
    else g.triggerAction?.('jump', true);
  };

  const handleSteerLeftDown = (e: React.PointerEvent) => {
    if (beginDragControl('steerLeft', gameLayout.steerLeft.xPct, gameLayout.steerLeft.yPx, e)) return;
    e.preventDefault();
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    if (idx === 5 || idx === 10) g.moveLeft?.();
    else if (idx === 11 || idx === 24 || idx === 25 || idx === 26 || idx === 27 || idx === 28) g.setSteerLeft?.(true);
    else if (idx === 17 || idx === 22) g.setMove?.(-1);
  };

  const handleSteerLeftUp = () => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g) return;
    if (idx === 11 || idx === 24 || idx === 25 || idx === 26 || idx === 27 || idx === 28) g.setSteerLeft?.(false);
    else if (idx === 17 || idx === 22) g.setMove?.(0);
  };

  const handleSteerRightDown = (e: React.PointerEvent) => {
    if (beginDragControl('steerRight', gameLayout.steerRight.xPct, gameLayout.steerRight.yPx, e)) return;
    e.preventDefault();
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g || g.gameOver || g.isPaused) return;
    if (idx === 5 || idx === 10) g.moveRight?.();
    else if (idx === 11 || idx === 24 || idx === 25 || idx === 26 || idx === 27 || idx === 28) g.setSteerRight?.(true);
    else if (idx === 17 || idx === 22) g.setMove?.(1);
  };

  const handleSteerRightUp = () => {
    const g = activeGameRef.current;
    const idx = selectedGameRef.current;
    if (!g) return;
    if (idx === 11 || idx === 24 || idx === 25 || idx === 26 || idx === 27 || idx === 28) g.setSteerRight?.(false);
    else if (idx === 17 || idx === 22) g.setMove?.(0);
  };

  const filteredGames = useMemo(() => {
    const q = menuSearchQuery.trim().toLowerCase();
    return GAME_LIST.filter((g) => {
      if (menuDimensionFilter === '3d' && !g.is3DGame) return false;
      if (menuDimensionFilter === '2d' && g.is3DGame) return false;
      if (menuCategoryFilter !== 'all' && g.category !== menuCategoryFilter) return false;
      if (q && !g.title.toLowerCase().includes(q) && !g.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [menuDimensionFilter, menuCategoryFilter, menuSearchQuery]);

  const avatarItems = useMemo(() => {
    const list = characterCatalog[activeCategory] || characterCatalog.boy;
    return list.map((icon, idx) => {
      const unlocked = idx === 0 || playerState.unlockedAvatars.has(icon);
      const cost = idx === 0 ? 0 : Math.min(500, 10 + Math.floor(idx / 3) * 5);
      return { icon, unlocked, cost };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, storeTick, currentAvatar, coins]);

  const xpPercent = Math.min(100, Math.round((xp / (pLevel * 100)) * 100));
  const rankTitle = RANKS[Math.min(RANKS.length - 1, Math.floor((pLevel - 1) / 3))];
  const healthPct = Math.round((healthCur / Math.max(1, healthMax)) * 100);

  return (
    <div
      id="appStage"
      ref={stageRef}
      className={`app-stage ${isRotatedFallback ? 'rotated-landscape-stage' : ''}`}
    >
      <div
        className="sun-moon garden-layer"
        id="sunMoon"
        ref={sunMoonRef}
        style={{ left: `${8 + (sunPos / 100) * 80}%` }}
      />

      <h1
        className="greeting garden-layer"
        id="greeting"
        onClick={() => setShowSettings(true)}
      >
        {greetingTitle}
      </h1>

      <div className="total-coins-badge" id="totalCoinsBadge">
        <span>🪙 Total Coins:</span>
        <span id="totalCoinsVal" style={{ color: '#ffd700' }}>{coins}</span>
      </div>

      {/* DAILY GARDEN REWARD POPUP */}
      {dailyRewardPopup.open && isViewingGarden && (
        <div
          id="dailyRewardPopup"
          className={`daily-reward-popup garden-layer ${dailyRewardPopup.claimed ? 'claimed' : ''}`}
          role="dialog"
          aria-labelledby="dailyRewardTitle"
          aria-describedby="dailyRewardSub"
        >
          <button
            type="button"
            id="btnDismissDailyReward"
            className="daily-reward-close"
            aria-label="Close daily reward popup"
            onClick={handleDismissDailyReward}
          >
            ✖
          </button>
          <div className="daily-reward-title" id="dailyRewardTitle">
            🎁 Daily Garden Gift
          </div>
          <div className="daily-reward-amount" id="dailyRewardAmount">
            +{dailyRewardPopup.amount} Coins
          </div>
          <div className="daily-reward-sub" id="dailyRewardSub">
            {dailyRewardPopup.claimed
              ? `Added +${dailyRewardPopup.amount} coins to your balance!`
              : 'Collect your daily garden bonus once every 24 hours.'}
          </div>
          <button
            type="button"
            id="btnClaimDailyReward"
            className="daily-reward-claim-btn"
            disabled={dailyRewardPopup.claimed}
            onClick={handleClaimDailyReward}
          >
            {dailyRewardPopup.claimed ? '✅ Claimed!' : '🪙 Claim Reward'}
          </button>
        </div>
      )}

      {/* IN-GAME HUD */}
      <div className={`in-game-hud ${isGameActive ? 'show' : ''}`} id="inGameHud">
        <div>⭐ Score: <span id="hudScoreVal" style={{ color: '#ffd700' }}>{hudScore}</span></div>
        <div>📈 Game Level: <span id="hudLevelVal" style={{ color: '#58a6ff' }}>{hudLevel}</span></div>
        <div>🏆 Best: <span id="hudHighScoreVal" style={{ color: '#ff9a9e' }}>{hudHigh}</span></div>
        <button
          type="button"
          className="hud-ctrl-mode-btn"
          id="btnHudControlMode"
          title="Switch between Analog Stick and Buttons"
          onClick={toggleControlMode}
        >
          {gameLayout.controlMode === 'analog' ? '🕹️ Analog ON' : '🎛️ Buttons ON'}
        </button>
      </div>

      {/* GARDEN FLOATING POLLEN & SPARKLE PARTICLES (fade out in night-mode) */}
      <div className="garden-particles garden-layer" id="gardenParticles" aria-hidden="true">
        {GARDEN_PARTICLES.map((p) => (
          <span
            key={p.id}
            className={p.kind === 'sparkle' ? 'garden-sparkle' : 'garden-pollen'}
            style={
              {
                '--gx': p.x,
                '--gy': p.y,
                '--gsize': p.size,
                '--gdur': p.dur,
                '--gdelay': p.delay,
                '--gdrift': p.drift
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="mountains-container garden-layer" id="mountainsContainer" ref={mountainsRef} />

      <div className="farm-scenery garden-layer">
        <span className="farm-fence">🪵</span>
        <span className="farm-hut">🏚️</span>
        <span className="farm-fence">🪵</span>
      </div>

      <div className="ground garden-layer" id="ground" ref={groundRef} />
      <div className="gardener garden-layer" id="gardener" ref={gardenerRef}>{currentAvatar}</div>

      {/* GARDEN D-PAD */}
      <div className="dpad-container garden-layer" id="dpad">
        <button
          type="button"
          className="dpad-btn dpad-up"
          id="dpadUp"
          aria-label="Move Up"
          onPointerDown={(e) => {
            e.preventDefault();
            startMovingGarden('up');
          }}
          onPointerUp={() => stopMovingGarden('up')}
          onPointerCancel={() => stopMovingGarden('up')}
          onPointerLeave={() => stopMovingGarden('up')}
        >
          ▲
        </button>
        <button
          type="button"
          className="dpad-btn dpad-left"
          id="dpadLeft"
          aria-label="Move Left"
          onPointerDown={(e) => {
            e.preventDefault();
            if (activeGameRef.current && !activeGameRef.current.gameOver && !activeGameRef.current.isPaused && (selectedGameRef.current === 5 || selectedGameRef.current === 10)) {
              activeGameRef.current.moveLeft?.();
              return;
            }
            startMovingGarden('left');
          }}
          onPointerUp={() => stopMovingGarden('left')}
          onPointerCancel={() => stopMovingGarden('left')}
          onPointerLeave={() => stopMovingGarden('left')}
        >
          ◀
        </button>
        <button
          type="button"
          className={`dpad-btn dpad-center ${isFlyMode ? 'flying' : ''}`}
          id="dpadCenter"
          title="Click to Toggle Fly Mode"
          aria-label="Toggle Fly Mode"
          onClick={() => {
            const next = !charStateRef.current.fly;
            charStateRef.current.fly = next;
            charStateRef.current.vy = 0;
            charStateRef.current.jumping = false;
            if (!next) {
              charStateRef.current.y = 70;
              updateCharacterPosition();
            }
            setIsFlyMode(next);
          }}
        >
          {currentAvatar}
        </button>
        <button
          type="button"
          className="dpad-btn dpad-right"
          id="dpadRight"
          aria-label="Move Right"
          onPointerDown={(e) => {
            e.preventDefault();
            if (activeGameRef.current && !activeGameRef.current.gameOver && !activeGameRef.current.isPaused && (selectedGameRef.current === 5 || selectedGameRef.current === 10)) {
              activeGameRef.current.moveRight?.();
              return;
            }
            startMovingGarden('right');
          }}
          onPointerUp={() => stopMovingGarden('right')}
          onPointerCancel={() => stopMovingGarden('right')}
          onPointerLeave={() => stopMovingGarden('right')}
        >
          ▶
        </button>
        <button
          type="button"
          className="dpad-btn dpad-down"
          id="dpadDown"
          aria-label="Move Down"
          onPointerDown={(e) => {
            e.preventDefault();
            startMovingGarden('down');
          }}
          onPointerUp={() => stopMovingGarden('down')}
          onPointerCancel={() => stopMovingGarden('down')}
          onPointerLeave={() => stopMovingGarden('down')}
        >
          ▼
        </button>
      </div>

      {/* ON-SCREEN STEER BUTTONS (hidden in Analog Stick mode to keep bottom-left clean) */}
      <button
        type="button"
        className={`highway-steer-btn steer-left ${dragEditMode ? 'drag-edit-target' : ''}`}
        id="btnSteerLeft"
        aria-label="Steer Left"
        style={
          {
            display:
              isGameActive &&
              isCanvasGame &&
              selectedMeta.showSteer &&
              gameLayout.controlMode !== 'analog' &&
              gameLayout.steerLeft.visible
                ? 'flex'
                : 'none',
            fontSize: (selectedMeta.steerLeftLabel || '').length > 2 ? '11.5px' : undefined,
            lineHeight: 1.15,
            textAlign: 'center',
            '--ctrl-x': `${gameLayout.steerLeft.xPct}%`,
            '--ctrl-y': `${gameLayout.steerLeft.yPx}px`,
            '--ctrl-scale': String(gameLayout.steerLeft.scale)
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if (!dragEditMode) {
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
          }
          handleSteerLeftDown(e);
        }}
        onPointerUp={handleSteerLeftUp}
        onPointerCancel={handleSteerLeftUp}
        onPointerLeave={handleSteerLeftUp}
        onLostPointerCapture={handleSteerLeftUp}
      >
        {selectedMeta.steerLeftLabel || '◀'}
      </button>
      <button
        type="button"
        className={`highway-steer-btn steer-right ${dragEditMode ? 'drag-edit-target' : ''}`}
        id="btnSteerRight"
        aria-label="Steer Right"
        style={
          {
            display:
              isGameActive &&
              isCanvasGame &&
              selectedMeta.showSteer &&
              gameLayout.controlMode !== 'analog' &&
              gameLayout.steerRight.visible
                ? 'flex'
                : 'none',
            fontSize: (selectedMeta.steerRightLabel || '').length > 2 ? '11.5px' : undefined,
            lineHeight: 1.15,
            textAlign: 'center',
            '--ctrl-x': `${gameLayout.steerRight.xPct}%`,
            '--ctrl-y': `${gameLayout.steerRight.yPx}px`,
            '--ctrl-scale': String(gameLayout.steerRight.scale)
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if (!dragEditMode) {
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
          }
          handleSteerRightDown(e);
        }}
        onPointerUp={handleSteerRightUp}
        onPointerCancel={handleSteerRightUp}
        onPointerLeave={handleSteerRightUp}
        onLostPointerCapture={handleSteerRightUp}
      >
        {selectedMeta.steerRightLabel || '▶'}
      </button>

      <button
        type="button"
        className="panel-toggle"
        id="panelToggle"
        title="Toggle panel"
        aria-label="Toggle control panel"
        onClick={() => setPanelCollapsed((prev) => !prev)}
      >
        {panelCollapsed ? '▼' : '▲'}
      </button>

      {/* GARDEN CONTROL PANEL */}
      <div className={`control-panel ${panelCollapsed ? 'collapsed' : ''}`} id="controlPanel">
        <div className="button-row">
          <button
            type="button"
            className="btn btn-games-main"
            id="openGameMenu"
            onClick={() => {
              ArcadeAudio.play('click');
              setShowGameMenu(true);
            }}
          >
            <span className="btn-icon">🎮</span> Games
          </button>
          <button
            type="button"
            className="btn btn-profile-main"
            id="btnProfile"
            onClick={() => {
              ArcadeAudio.play('click');
              updateCoinsDisplay();
              setShowProfile(true);
            }}
          >
            <span className="btn-icon">👤</span> Profile
          </button>
          <button
            type="button"
            className="btn"
            id="btnSettings"
            onClick={() => {
              ArcadeAudio.play('click');
              setShowSettings(true);
            }}
          >
            <span className="btn-icon">⚙️</span> Settings
          </button>
        </div>

        <div className="slider-row">
          <div className="slider-group">
            <span>☁️</span>
            <input
              type="range"
              id="cloudSlider"
              min={0}
              max={15}
              value={cloudCount}
              aria-label="Clouds"
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                cloudCountRef.current = v;
                setCloudCount(v);
                saveUiPrefs({ cloudCount: v });
                createClouds(v);
              }}
            />
            <span className="slider-value" id="cloudValue">{cloudCount}</span>
          </div>
          <div className="slider-group">
            <span>⛰️</span>
            <input
              type="range"
              id="mountainSlider"
              min={0}
              max={12}
              value={mountainCount}
              aria-label="Mountains"
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                mountainCountRef.current = v;
                setMountainCount(v);
                saveUiPrefs({ mountainCount: v });
                createMountains(v);
              }}
            />
            <span className="slider-value" id="mountainValue">{mountainCount}</span>
          </div>
          <div className="slider-group">
            <span>☀️</span>
            <input
              type="range"
              id="sunSlider"
              min={0}
              max={100}
              value={sunPos}
              aria-label="Sun Position"
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                setSunPos(v);
                saveUiPrefs({ sunPos: v });
              }}
            />
            <span className="slider-value" id="sunValue">{sunPos}%</span>
          </div>
        </div>
      </div>

      <ArcadeSettingsAndModals ctx={{ activeCategory, activeGameRef, activeThemeIdx, addFarmAnimal, addedNoticeTimerRef, addedPresetNotice, applyTheme, avatarItems, bgmOn, cheatInput, chessTimeSec, coins, createButterflies, createFlowers, currentAvatar, devTapCountRef, difficulty, difficultyRef, dpadScale, dpadX, dpadY, filteredGames, gameLayout, greetingTitle, isNight, masterVol, menuCategoryFilter, menuDimensionFilter, menuSearchQuery, pLevel, patchBuiltInControl, patchExtraControl, pauseHeaderRef, pausePanelRef, rankTitle, rebuildGarden, resetDpadLayout, resumeGame, selectedAsphaltCar, selectedBasketballTeam, selectedGameIdx, selectedGameRef, selectedMeta, selectedMobaHero, selectedPresetKey, setActiveCategory, setActiveLobbyGame, setAddedPresetNotice, setCheatInput, setChessTimeSec, setControlMode, setDifficulty, setDpadScale, setDpadX, setDpadY, setDragEditMode, setGameLayout, setGreetingTitle, setIsNight, setMasterVol, setMenuCategoryFilter, setMenuDimensionFilter, setMenuSearchQuery, setRotateHintDismissed, setSelectedAsphaltCar, setSelectedBasketballTeam, setSelectedGameIdx, setSelectedMobaHero, setSelectedPresetKey, setSfxPackState, setShowDevPanel, setShowGameMenu, setShowInstructions, setShowPauseModal, setShowProfile, setShowSettings, setStoreTick, setUsername, settingsHeaderRef, settingsPanelRef, sfxOn, sfxPack, showDevPanel, showGameMenu, showInstructions, showPauseModal, showProfile, showSettings, startGame, stopGame, syncAvatar, unlockCount, updateGameLayoutState, username, viewportSnap, xp, xpPercent }} />

      {/* DOM GAME CONTAINERS */}
      <div id="codeHeroUI">
        <div className="code-box">
          <div className="code-title">
            <span>👨‍💻 Code Hero</span>
            <span className="code-timer" id="codeTimer">⏱️ 30s</span>
            <span id="codeCoins">🪙 Session: 0</span>
          </div>
          <div className="code-lesson" id="codeLesson" />
          <div className="code-question" id="codeQuestion" />
          <div className="code-options" id="codeOptions" />
          <div className="code-feedback" id="codeFeedback" style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '12px', textAlign: 'center' }} />
        </div>
      </div>

      <div id="crosswordUI">
        <div className="cw-box">
          <div className="cw-header">
            <span id="cwPackTitle">📝 Daily Crossword</span>
            <span id="cwProgress">0 / 0 Letters</span>
            <button type="button" className="btn" id="cwHintBtn" style={{ padding: '4px 9px', fontSize: '11px', background: '#f1c40f', color: '#000' }}>
              💡 Hint (5🪙)
            </button>
          </div>
          <div className="cw-grid" id="cwGrid" />
          <div className="cw-clue-bar">
            <span id="cwActiveClue">Tap a square to begin!</span>
            <button type="button" className="btn" id="cwDirBtn" style={{ padding: '4px 8px', fontSize: '10px', whiteSpace: 'nowrap' }}>
              ↔ ACROSS
            </button>
          </div>
          <div className="cw-kbd" id="cwKeyboard" />
        </div>
      </div>

      <div id="sudokuUI">
        <div className="sdk-box">
          <div className="sdk-header">
            <span id="sdkTitle">🔢 Sudoku</span>
            <span id="sdkMistakes" style={{ color: '#ff9a9e' }}>Mistakes: 0/3</span>
          </div>
          <div className="sdk-grid" id="sdkGrid" />
          <div className="sdk-tools">
            <button type="button" className="sdk-tool-btn" id="sdkNotesBtn">✏️ Notes</button>
            <button type="button" className="sdk-tool-btn" id="sdkEraseBtn">⌫ Erase</button>
            <button type="button" className="sdk-tool-btn" id="sdkHintBtn">💡 Hint (5🪙)</button>
            <button type="button" className="sdk-tool-btn" id="sdkNewBtn">🔄 New</button>
          </div>
          <div className="sdk-numpad" id="sdkNumpad" />
        </div>
      </div>

      {/* STOCKFISH CHESS UI */}
      <div id="chessGameUI">
        <div className="chess-box">
          <div className="chess-status-row">
            <span id="chessStatus">♟️ Loading Stockfish Chess...</span>
            <span id="chessEloTag" className="chess-elo-tag">Stockfish</span>
            <span id="chessEval" style={{ fontFamily: 'monospace', color: 'var(--ui-accent)', fontVariantNumeric: 'tabular-nums' }}>0.00</span>
          </div>
          <div className="chess-clocks-row">
            <div className="chess-clock-card" id="chessBotClockCard">
              <span id="chessBotClockLabel">🤖 Bot</span>
              <span className="chess-clock-time" id="chessBotClock">10:00</span>
            </div>
            <div className="chess-clock-card active-turn" id="chessPlayerClockCard">
              <span id="chessPlayerClockLabel">👤 You</span>
              <span className="chess-clock-time" id="chessPlayerClock">10:00</span>
            </div>
          </div>
          <div className="chess-history-bar">
            <button type="button" id="chessPrevMoveBtn" className="chess-nav-btn" title="Previous Move" aria-label="Previous Move">◀</button>
            <div className="chess-moves-strip" id="chessMovesStrip"><span style={{ opacity: 0.6 }}>No moves yet</span></div>
            <button type="button" id="chessNextMoveBtn" className="chess-nav-btn" title="Next Move" aria-label="Next Move">▶</button>
            <button type="button" id="chessLiveMoveBtn" className="chess-nav-btn" title="Jump to Latest Position" aria-label="Latest Position">⏭</button>
          </div>
          <div className="chess-board-wrap">
            <div className="chess-eval-bar" title="Evaluation (White vs Black)">
              <div className="chess-eval-fill" id="chessEvalFill" />
            </div>
            <div className="chess-board" id="chessBoard" />
          </div>
          <div className="chess-controls">
            <select
              id="chessTimeSelect"
              className="chess-ctrl-select"
              title="Match Clock"
              aria-label="Match Clock"
              value={String(chessTimeSec)}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10) || 600;
                setChessTimeSec(v);
                persistChessTime(v);
              }}
            >
              <option value="60">⏱️ 1 Min</option>
              <option value="300">⏱️ 5 Min</option>
              <option value="600">⏱️ 10 Min</option>
            </select>
            <button type="button" id="chessNewMatchBtn" className="chess-ctrl-btn" title="Start a new match (random White/Black)">🔄 New Match</button>
            <button type="button" id="chessResignBtn" className="chess-ctrl-btn" style={{ borderColor: '#e74c3c', color: '#ff9a9e' }}>🏳️ Resign</button>
          </div>
          <button type="button" id="chessOpenAnalysisBtn" className="chess-ctrl-btn" style={{ display: 'none', width: '100%', borderColor: 'var(--ui-accent)', color: 'var(--ui-accent)' }}>
            📊 View Game Analysis &amp; Rewards
          </button>
        </div>
      </div>

      {/* CHESS ANALYSIS OVERLAY */}
      <div id="chessAnalysisOverlay">
        <div className="chess-analysis-card">
          <div style={{ textAlign: 'center' }}>
            <div id="chessAnalysisHeadline" style={{ fontSize: '17px', fontWeight: 900, color: 'var(--ui-accent)' }}>📊 Match Review</div>
            <div id="chessAnalysisSub" style={{ fontSize: '11px', color: '#ccc', marginTop: '2px' }}>Move-by-Move Evaluation</div>
          </div>
          <div className="chess-acc-row">
            <div className="chess-acc-box">
              <div style={{ fontSize: '10px', color: '#aaa' }}>YOUR ACCURACY</div>
              <div id="chessPlayerAcc" style={{ fontSize: '16px', fontWeight: 900, color: 'var(--ui-accent)' }}>100%</div>
            </div>
            <div className="chess-acc-box">
              <div id="chessBotAccLabel" style={{ fontSize: '10px', color: '#aaa' }}>STOCKFISH ACCURACY</div>
              <div id="chessBotAcc" style={{ fontSize: '16px', fontWeight: 900, color: '#ffd700' }}>100%</div>
            </div>
          </div>
          <div id="chessClassBreakdown" className="chess-class-grid" />
          <div id="chessReviewMoveList" className="chess-review-list" />
          <div className="chess-review-actions">
            <button type="button" id="chessInspectBoardBtn" className="chess-ctrl-btn">🔍 Inspect Board</button>
            <button type="button" id="chessClaimFinishBtn" className="chess-ctrl-btn" style={{ background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: '#fff', borderColor: '#fff' }}>
              🏆 Claim &amp; Finish
            </button>
          </div>
        </div>
      </div>

      {/* MAIN 2D GAME CANVAS */}
      <canvas
        id="gameCanvas"
        ref={canvasRef}
        style={{ display: isGameActive && isCanvasGame && !is3DGame ? 'block' : 'none' }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* THREE.JS 3D GAME VIEWPORT */}
      <div
        id="threeGameMount"
        ref={threeMountRef}
        style={{ display: isGameActive && is3DGame ? 'block' : 'none' }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* FULLSCREEN DOODLE ARMY 2: MINI MILITIA SHELL (gameId === 22) */}
      {activeLobbyGame === 22 && (
        <MiniMilitiaShell
          onExitToArcade={() => {
            ArcadeAudio.play('click');
            setActiveLobbyGame(null);
            setShowGameMenu(true);
          }}
        />
      )}

      {/* FULLSCREEN 2.5D MLBB LEGENDS ARENA SHELL (gameId === 25) */}
      {activeLobbyGame === 25 && (
        <MlbbExperienceShell
          onExitToArcade={() => {
            ArcadeAudio.play('click');
            setActiveLobbyGame(null);
            setShowGameMenu(true);
          }}
        />
      )}

      {/* FULLSCREEN 3D LOBBY OVERLAYS (PUBG / ASPHALT / HOOPS 2K26 ULTIMATE HYBRID / STORM) */}
      {activeLobbyGame !== null && activeLobbyGame !== 22 && activeLobbyGame !== 25 && (
        <Lobby3DOverlay
          gameId={activeLobbyGame}
          totalCoins={coins}
          onSpendCoins={(amt) => {
            const ok = spendCoins(amt);
            setCoins(playerState.totalCoins);
            return ok;
          }}
          onAwardCoins={(amt) => {
            awardBonusCoins(amt);
            setCoins(playerState.totalCoins);
          }}
          onBack={() => {
            ArcadeAudio.play('click');
            setSelectedMobaHero(playerState.selectedMobaHero);
            setActiveLobbyGame(null);
            setShowGameMenu(true);
          }}
          onLaunch={() => {
            ArcadeAudio.play('click');
            setSelectedMobaHero(playerState.selectedMobaHero);
            launchFromLobby(activeLobbyGame);
          }}
        />
      )}

      {isGameActive && dragEditMode && (
        <div className="drag-edit-banner" id="dragEditBanner">
          <span>✋ Drag any button to reposition</span>
          <button
            type="button"
            className="btn"
            id="btnDoneDragEdit"
            style={{ background: '#22c55e', color: '#052e16', fontSize: '11px', padding: '4px 10px', fontWeight: 900 }}
            onClick={() => {
              setDragEditMode(false);
              setShowPauseModal(true);
            }}
          >
            ✅ Save Layout
          </button>
        </div>
      )}

      {!dragEditMode &&
        !showPauseModal &&
        !rotateHintDismissed &&
        ((viewportSnap.isSmartphone && (isRotatedFallback || isPortraitViewport)) ||
          (isGameActive && selectedMeta.preferredOrientation === 'landscape' && isPortraitViewport)) && (
          <div className={`rotate-hint-banner ${isGameActive ? 'in-game' : 'in-garden'}`} id="rotateHintBanner">
            {isRotatedFallback ? (
              <>
                <span>📱 Landscape Active</span>
                <button
                  type="button"
                  className="btn"
                  id="btnBannerFullscreen"
                  style={{
                    background: viewportSnap.isFullscreen ? '#22c55e' : '#38bdf8',
                    color: '#082f49',
                    fontSize: '10px',
                    padding: '4px 8px',
                    fontWeight: 900
                  }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    void toggleAppFullscreen();
                  }}
                >
                  {viewportSnap.isFullscreen ? '⛶ Exit Full' : '⛶ Fullscreen'}
                </button>
                <button
                  type="button"
                  className="btn"
                  id="btnTogglePortraitMode"
                  style={{ background: 'rgba(255,255,255,0.16)', color: '#f8fafc', fontSize: '10px', padding: '4px 8px', fontWeight: 800 }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    setOrientationMode('free');
                  }}
                >
                  🔓 Portrait
                </button>
              </>
            ) : (
              <>
                <span>{viewportSnap.orientationMode === 'free' ? '📱 Portrait Mode' : '🔄 Best in Landscape'}</span>
                <button
                  type="button"
                  className="btn"
                  id="btnBannerFullscreen"
                  style={{
                    background: viewportSnap.isFullscreen ? '#22c55e' : '#38bdf8',
                    color: '#082f49',
                    fontSize: '10px',
                    padding: '4px 8px',
                    fontWeight: 900
                  }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    void toggleAppFullscreen();
                  }}
                >
                  {viewportSnap.isFullscreen ? '⛶ Exit Full' : '⛶ Fullscreen'}
                </button>
                <button
                  type="button"
                  className="btn"
                  id="btnRotateLandscape"
                  style={{ background: 'rgba(255,255,255,0.16)', color: '#f8fafc', fontSize: '10px', padding: '4px 8px', fontWeight: 800 }}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    void requestNativeLandscape();
                  }}
                >
                  🔄 Landscape
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Dismiss rotate hint"
              id="btnDismissRotateHint"
              style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', padding: '2px 4px' }}
              onClick={() => setRotateHintDismissed(true)}
            >
              ✖
            </button>
          </div>
        )}

      {/* COMPACT FLOATING FULLSCREEN TOGGLE FOR SMARTPHONES (ALWAYS AVAILABLE IN LANDSCAPE & iOS FALLBACK) */}
      {viewportSnap.isSmartphone &&
        !dragEditMode &&
        !showPauseModal &&
        !showSettings &&
        (!viewportSnap.nativeFullscreen || viewportSnap.immersiveFallback) &&
        (rotateHintDismissed || (!isRotatedFallback && !isPortraitViewport)) && (
          <button
            type="button"
            className={`floating-fullscreen-btn ${isGameActive ? 'in-game' : 'in-garden'} ${viewportSnap.isFullscreen ? 'active' : ''}`}
            id="btnFloatingFullscreen"
            title={viewportSnap.isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            aria-label={viewportSnap.isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            onClick={() => {
              ArcadeAudio.play('click');
              void toggleAppFullscreen();
            }}
          >
            {viewportSnap.isFullscreen ? '⛶ Exit Full' : '⛶ Fullscreen'}
          </button>
        )}

      <button
        type="button"
        className="game-settings-btn"
        id="gameSettingsBtn"
        title="In-Game Pause & Settings"
        aria-label="Pause and Settings"
        style={{ display: isGameActive ? 'flex' : 'none' }}
        onClick={openPauseMenu}
      >
        ⚙️
      </button>

      <button
        type="button"
        className={`game-action-btn ${isGameActive && isCanvasGame && selectedMeta.actionBtn && gameLayout.action.visible ? 'show' : ''} ${dragEditMode ? 'drag-edit-target' : ''}`}
        id="gameActionBtn"
        style={
          {
            '--ctrl-x': `${gameLayout.action.xPct}%`,
            '--ctrl-y': `${gameLayout.action.yPx}px`,
            '--ctrl-scale': String(gameLayout.action.scale)
          } as React.CSSProperties
        }
        onPointerDown={(e) => {
          if (!dragEditMode) {
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
          }
          handleActionDown(e);
        }}
        onPointerUp={handleActionUp}
        onPointerCancel={handleActionUp}
        onPointerLeave={handleActionUp}
        onLostPointerCapture={handleActionUp}
      >
        {actionBtnLabel}
      </button>

      <button
        type="button"
        className={`game-jump-btn ${isGameActive && isCanvasGame && selectedMeta.jumpBtn && gameLayout.jump.visible ? 'show' : ''} ${(selectedGameIdx === 25 && mobaHud && mobaHud.skill1.cd > 0) || (selectedGameIdx === 28 && narutoHud && narutoHud.jumpSkill1.cd > 0) ? 'on-cd' : ''} ${selectedGameIdx === 25 && mobaReadyPopSlots.skill1 ? 'moba-cd-ready-pop' : ''} ${selectedGameIdx === 25 && mobaSkillAimUi?.active && mobaSkillAimUi.actionKey === 'skill1' ? 'moba-skill-aiming' : ''} ${dragEditMode ? 'drag-edit-target' : ''}`}
        id="gameJumpBtn"
        style={
          {
            '--ctrl-x': `${gameLayout.jump.xPct}%`,
            '--ctrl-y': `${gameLayout.jump.yPx}px`,
            '--ctrl-scale': String(gameLayout.jump.scale),
            '--ready-glow': selectedGameIdx === 25 && mobaHud?.skill1.elementColor ? mobaHud.skill1.elementColor : '#38bdf8'
          } as React.CSSProperties
        }
        onPointerEnter={() => {
          if (selectedGameRef.current === 25 && !mobaDragAimRef.current.active) {
            (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(0);
          }
        }}
        onPointerDown={(e) => {
          if (selectedGameRef.current === 25 && !dragEditMode) {
            if (beginDragControl('jump', gameLayout.jump.xPct, gameLayout.jump.yPx, e)) return;
            e.preventDefault();
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
            ArcadeAudio.play('click');
            const started = beginMobaDragAim(
              'skill1',
              mobaHud?.skill1.label || 'SKILL 1',
              mobaHud?.skill1.icon || '🗡️',
              mobaHud?.skill1.elementColor || '#38bdf8',
              e
            );
            if (!started) {
              (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(0);
            }
            return;
          }
          if (!dragEditMode) {
            try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
          }
          handleJumpBtnDown(e);
        }}
        onPointerMove={(e) => {
          if (selectedGameRef.current === 25 && mobaDragAimRef.current.active) {
            moveMobaDragAim(e);
          }
        }}
        onPointerUp={(e) => {
          if (selectedGameRef.current === 25) {
            if (mobaDragAimRef.current.active) {
              endMobaDragAim(e, false);
            } else {
              (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
            }
            return;
          }
          if (selectedGameRef.current === 27) activeGameRef.current?.triggerAction?.('pass', false);
          else if (selectedGameRef.current === 28) activeGameRef.current?.triggerAction?.('skill1', false);
          else activeGameRef.current?.triggerAction?.('jump', false);
        }}
        onPointerCancel={(e) => {
          if (selectedGameRef.current === 25) {
            if (mobaDragAimRef.current.active) {
              endMobaDragAim(e, true);
            } else {
              (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
            }
            return;
          }
          if (selectedGameRef.current === 27) activeGameRef.current?.triggerAction?.('pass', false);
          else if (selectedGameRef.current === 28) activeGameRef.current?.triggerAction?.('skill1', false);
          else activeGameRef.current?.triggerAction?.('jump', false);
        }}
        onPointerLeave={() => {
          if (selectedGameRef.current === 25) {
            if (!mobaDragAimRef.current.active) {
              (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
            }
            return;
          }
          if (selectedGameRef.current === 27) activeGameRef.current?.triggerAction?.('pass', false);
          else if (selectedGameRef.current === 28) activeGameRef.current?.triggerAction?.('skill1', false);
          else activeGameRef.current?.triggerAction?.('jump', false);
        }}
        onLostPointerCapture={(e) => {
          if (selectedGameRef.current === 25) {
            if (mobaDragAimRef.current.active) {
              endMobaDragAim(e, true);
            } else {
              (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
            }
            return;
          }
          if (selectedGameRef.current === 27) activeGameRef.current?.triggerAction?.('pass', false);
          else if (selectedGameRef.current === 28) activeGameRef.current?.triggerAction?.('skill1', false);
          else activeGameRef.current?.triggerAction?.('jump', false);
        }}
      >
        {selectedGameIdx === 25 && mobaHud ? (
          <>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{mobaHud.skill1.icon}</span>
            <span style={{ fontSize: '9px', lineHeight: 1.05 }}>{mobaHud.skill1.label}</span>
            {mobaHud.skill1.cd > 0 && (
              <span className="moba-btn-cd">{mobaHud.skill1.cd.toFixed(1)}s</span>
            )}
          </>
        ) : selectedGameIdx === 28 && narutoHud ? (
          <>
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{narutoHud.jumpSkill1.icon}</span>
            <span style={{ fontSize: '9px', lineHeight: 1.05 }}>{narutoHud.jumpSkill1.label}</span>
            {narutoHud.jumpSkill1.cd > 0 && (
              <span className="moba-btn-cd">{narutoHud.jumpSkill1.cd.toFixed(1)}s</span>
            )}
          </>
        ) : (
          selectedMeta.jumpBtn || 'JUMP'
        )}
      </button>

      {/* VIRTUAL CURSOR RETICLE FOR AIM / BOARD GAMES IN ANALOG MODE */}
      {isGameActive && gameLayout.controlMode === 'analog' && aimCursorPos.visible && (
        <div
          id="analogCursorReticle"
          className="analog-cursor-reticle"
          style={{ left: `${aimCursorPos.x}px`, top: `${aimCursorPos.y}px` }}
          aria-hidden="true"
        />
      )}

      {/* FIXED BOTTOM-LEFT VIRTUAL ANALOG JOYSTICK PAD */}
      {isGameActive && gameLayout.controlMode === 'analog' && gameLayout.analog.visible && (
        <div
          ref={analogPadRef}
          id="gameAnalogPad"
          className={`analog-pad ${dragEditMode ? 'drag-edit-target' : ''}`}
          role="slider"
          aria-label="Virtual Analog Joystick"
          aria-valuenow={0}
          style={
            {
              '--ctrl-x': `${gameLayout.analog.xPct}%`,
              '--ctrl-y': `${gameLayout.analog.yPx}px`,
              '--ctrl-scale': String(gameLayout.analog.scale)
            } as React.CSSProperties
          }
          onPointerDown={handleAnalogDown}
          onPointerMove={handleAnalogMove}
          onPointerUp={handleAnalogUp}
          onPointerCancel={handleAnalogUp}
          onLostPointerCapture={handleAnalogUp}
        >
          <div className="analog-ring-cross" aria-hidden="true" />
          <div ref={analogThumbRef} className="analog-thumb" aria-hidden="true" />
        </div>
      )}

      {/* USER-ADDED / PER-GAME PRESET EXTRA BUTTONS */}
      {isGameActive &&
        gameLayout.extras
          .filter((b) => {
            if (!b.visible) return false;
            if (gameLayout.controlMode === 'analog' && (b.id === 'bk_up' || b.id === 'bk_dn')) return false;
            if (selectedGameIdx === 25 && b.actionKey === 'skill4' && mobaHud && !mobaHud.hasSkill4 && !dragEditMode) {
              return false;
            }
            if (selectedGameIdx === 25 && b.actionKey === 'itemActive' && mobaHud && !mobaHud.hasActiveItem && !dragEditMode) {
              return false;
            }
            if (selectedGameIdx === 25 && b.actionKey === 'recall' && mobaHud && !mobaHud.recall.visible && !dragEditMode) {
              return false;
            }
            if (
              selectedGameIdx === 28 &&
              narutoHud &&
              narutoHud.engine === 'senki_2d' &&
              (b.actionKey === 'chakra' || b.actionKey === 'guard') &&
              !dragEditMode
            ) {
              return false;
            }
            return true;
          })
          .map((btn) => {
            const mobaSlot =
              selectedGameIdx === 25 && mobaHud
                ? btn.actionKey === 'skill1'
                  ? mobaHud.skill1
                  : btn.actionKey === 'skill2'
                    ? mobaHud.skill2
                    : btn.actionKey === 'skill3'
                      ? mobaHud.skill3
                      : btn.actionKey === 'skill4'
                        ? mobaHud.skill4
                        : btn.actionKey === 'spell'
                          ? mobaHud.spell
                          : btn.actionKey === 'regen'
                            ? mobaHud.regen
                            : btn.actionKey === 'recall'
                              ? mobaHud.recall
                              : btn.actionKey === 'itemActive'
                                ? mobaHud.itemActive
                                : null
                : selectedGameIdx === 28 && narutoHud
                  ? btn.actionKey === 'skill2'
                    ? narutoHud.skill2
                    : btn.actionKey === 'skill3'
                      ? narutoHud.skill3
                      : btn.actionKey === 'skill4'
                        ? narutoHud.skill4
                        : btn.actionKey === 'skill5'
                          ? narutoHud.skill5
                          : btn.actionKey === 'sub'
                            ? narutoHud.subBtn
                            : btn.actionKey === 'support'
                              ? narutoHud.supportBtn
                              : btn.actionKey === 'chakra'
                                ? narutoHud.chakraBtn
                                : btn.actionKey === 'guard'
                                  ? narutoHud.guardBtn
                                  : null
                  : null;
            const onCd = Boolean(mobaSlot && mobaSlot.cd > 0);
            const activeBuff = Boolean(mobaSlot?.activeBuff);
            const isMobaAimable =
              selectedGameIdx === 25 &&
              (btn.actionKey === 'skill1' ||
                btn.actionKey === 'skill2' ||
                btn.actionKey === 'skill3' ||
                btn.actionKey === 'skill4' ||
                btn.actionKey === 'spell');
            const mobaReadySlotKey =
              selectedGameIdx === 25 &&
              (btn.actionKey === 'skill1' ||
                btn.actionKey === 'skill2' ||
                btn.actionKey === 'skill3' ||
                btn.actionKey === 'skill4' ||
                btn.actionKey === 'spell' ||
                btn.actionKey === 'regen' ||
                btn.actionKey === 'itemActive')
                ? btn.actionKey
                : null;
            const readyPop = Boolean(mobaReadySlotKey && mobaReadyPopSlots[mobaReadySlotKey]);
            const isAimingThis = Boolean(
              selectedGameIdx === 25 && mobaSkillAimUi?.active && mobaSkillAimUi.actionKey === btn.actionKey
            );
            const readyGlow =
              selectedGameIdx === 25 && mobaSlot && 'elementColor' in mobaSlot && mobaSlot.elementColor
                ? mobaSlot.elementColor
                : '#38bdf8';
            return (
              <button
                key={btn.id}
                type="button"
                className={`custom-extra-btn ${onCd ? 'on-cd' : ''} ${activeBuff ? 'active-buff' : ''} ${readyPop ? 'moba-cd-ready-pop' : ''} ${isAimingThis ? 'moba-skill-aiming' : ''} ${dragEditMode ? 'drag-edit-target' : ''}`}
                data-action-key={btn.actionKey}
                style={
                  {
                    '--ctrl-x': `${btn.xPct}%`,
                    '--ctrl-y': `${btn.yPx}px`,
                    '--ctrl-scale': String(btn.scale),
                    '--ready-glow': readyGlow
                  } as React.CSSProperties
                }
                onPointerEnter={() => {
                  if (selectedGameRef.current === 25 && !mobaDragAimRef.current.active) {
                    const slotMap: Record<string, number> = { skill1: 0, skill2: 1, skill3: 2, skill4: 3 };
                    if (btn.actionKey in slotMap) {
                      (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(slotMap[btn.actionKey]);
                    }
                  }
                }}
                onPointerDown={(e) => {
                  if (beginDragControl(btn.id, btn.xPct, btn.yPx, e)) return;
                  e.preventDefault();
                  try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
                  ArcadeAudio.play('click');
                  if (isMobaAimable) {
                    const started = beginMobaDragAim(
                      btn.actionKey as 'skill1' | 'skill2' | 'skill3' | 'skill4' | 'spell',
                      mobaSlot ? mobaSlot.label : btn.label,
                      mobaSlot ? mobaSlot.icon : btn.icon,
                      readyGlow,
                      e
                    );
                    if (!started) {
                      const slotMap: Record<string, number> = { skill1: 0, skill2: 1, skill3: 2, skill4: 3 };
                      if (btn.actionKey in slotMap) {
                        (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(slotMap[btn.actionKey]);
                      }
                    }
                    return;
                  }
                  dispatchPresetAction(btn.actionKey, true);
                }}
                onPointerMove={(e) => {
                  if (isMobaAimable && mobaDragAimRef.current.active) {
                    moveMobaDragAim(e);
                  }
                }}
                onPointerUp={(e) => {
                  if (isMobaAimable) {
                    if (mobaDragAimRef.current.active) {
                      endMobaDragAim(e, false);
                    } else {
                      (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
                    }
                    return;
                  }
                  dispatchPresetAction(btn.actionKey, false);
                }}
                onPointerCancel={(e) => {
                  if (isMobaAimable) {
                    if (mobaDragAimRef.current.active) {
                      endMobaDragAim(e, true);
                    } else {
                      (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
                    }
                    return;
                  }
                  dispatchPresetAction(btn.actionKey, false);
                }}
                onPointerLeave={() => {
                  if (selectedGameRef.current === 25 && !mobaDragAimRef.current.active) {
                    (activeGameRef.current as unknown as { previewSkillTelegraph?: (s: number | null) => void })?.previewSkillTelegraph?.(null);
                  }
                  if (btn.holdable) dispatchPresetAction(btn.actionKey, false);
                }}
                onLostPointerCapture={(e) => {
                  if (isMobaAimable && mobaDragAimRef.current.active) {
                    endMobaDragAim(e, true);
                    return;
                  }
                  if (btn.holdable) dispatchPresetAction(btn.actionKey, false);
                }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{mobaSlot ? mobaSlot.icon : btn.icon}</span>
                <span>{mobaSlot ? mobaSlot.label : btn.label}</span>
                {onCd && mobaSlot && (
                  <span className="moba-btn-cd">{mobaSlot.cd.toFixed(1)}s</span>
                )}
              </button>
            );
          })}

      <ArcadeLegacyGameHuds ctx={{ activeGameRef, difficultyRef, dragEditMode, healthCur, healthDmgFlash, healthMax, healthPct, healthTrailPct, hoopsHud, hoopsPostTab, isGameActive, mobaAimThumbRef, mobaCancelZoneRef, mobaEmoteDragRef, mobaEmoteHoverSlot, mobaEmoteWheelOpen, mobaHud, mobaShopCat, mobaShopOpacity, mobaShopSide, mobaSkillAimUi, narutoHud, selectedGameIdx, selectedMeta, selectedMobaBlessingId, selectedMobaShopItemId, setActiveLobbyGame, setHoopsPostTab, setMobaEmoteHoverSlot, setMobaEmoteWheelOpen, setMobaShopCat, setMobaShopOpacity, setMobaShopSide, setSelectedMobaBlessingId, setSelectedMobaShopItemId, setShowExpandedMinimap, setShowMobaShop, showExpandedMinimap, showMobaShop, startGame, stopGame }} />
      {/* GAME OVER MODAL */}
      <div className={`game-over-overlay ${gameOverInfo.show ? 'show' : ''}`} id="gameOverOverlay">
        <div className="game-over-card">
          <div
            className="game-over-title"
            id="goTitle"
            style={{ color: gameOverInfo.isVictory ? '#84fab0' : '#e74c3c' }}
          >
            {gameOverInfo.isVictory ? '🏆 VICTORY!' : 'GAME OVER'}
          </div>
          <div className="game-over-stats">
            <div>Final Score: <strong id="goScoreVal" style={{ color: '#ffd700' }}>{gameOverInfo.score}</strong></div>
            <div>Session Earned: <strong id="goCoinsVal" style={{ color: '#84fab0' }}>🪙 +{gameOverInfo.coins}</strong></div>
            <div>Highest Level Reached: <strong id="goLevelVal" style={{ color: '#58a6ff' }}>Lvl {gameOverInfo.level}</strong></div>
            <div>Personal Best: <strong id="goHighVal" style={{ color: '#ff9a9e' }}>{gameOverInfo.high}</strong></div>
          </div>
          <div className="game-over-buttons">
            <button
              type="button"
              className="game-over-btn"
              id="btnRestart"
              onClick={() => {
                setGameOverInfo((prev) => ({ ...prev, show: false }));
                startGame(selectedGameRef.current, difficultyRef.current, 1);
              }}
            >
              🔄 Restart Match
            </button>
            {(selectedGameIdx === 24 || selectedGameIdx === 25 || selectedGameIdx === 26 || selectedGameIdx === 27 || selectedGameIdx === 28) && (
              <button
                type="button"
                className="game-over-btn"
                id="btnGoLobby"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#111827' }}
                onClick={() => {
                  const gid = selectedGameRef.current as 24 | 25 | 26 | 27 | 28;
                  setGameOverInfo((prev) => ({ ...prev, show: false }));
                  stopGame();
                  setActiveLobbyGame(gid);
                }}
              >
                🏟️ 3D Lobby
              </button>
            )}
            <button
              type="button"
              className="game-over-btn menu-btn"
              id="btnGameMenu"
              onClick={() => {
                stopGame();
                setShowGameMenu(true);
              }}
            >
              📋 Arcade Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
