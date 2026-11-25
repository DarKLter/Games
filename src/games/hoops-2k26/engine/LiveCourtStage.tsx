// ============================================================================
// PART 5 — LIVE 3D COURT STAGE (LiveCourtStage.tsx)
// Unifies:
// - 60 FPS BasketballSimulation (ProPLAY Gameplay + Tactics + Replay Engine)
// - Three.js Court3D with Zero-GC 3D-to-2D Projected Anchors
// - MatchHUD (Exact Dual-Era 2K14 Classic / 2K26 Next-Gen / Blacktop Scorebugs,
//   Circular Teammate Grade, Shot Feedback, 5-Tier Badges, Splash Banners,
//   3D-Projected Alley-Oop & Icon Passing Overlays)
// - ShotMeterOverlay (All 5 Authentic 3D-Projected Shot Meter Styles + Skill Dunk)
// - TacticalRadarAndMarking (Compact/Expandable Mini-Court Radar, Enemy Star
//   Marking, Pick & Roll 45°/180° Angle & Roll/Fade, Sets, Schemes, Subs, Timeouts)
// - TouchControlsOverlay (Auto-Touch + Desktop-Toggleable Dual-Stick Virtual Pads)
// - PauseMenuModal (Resume, 4s Instant Replay Scrubber, Box Score, Gameplan, Cams)
// - Simultaneous Desktop (Keyboard + Right-Click/Arrow Rhythm + Gamepad) + Touch
// ============================================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Court3D } from './Court3D';
import {
  CAMERA_ANGLE_OPTIONS,
  CAMERA_ORDER,
  type CourtCameraConfig,
  type CourtVisualConfig,
  type DefensiveSchemeId,
  type MarkCoverageTag,
  type MatchRenderState,
  type PlayVisionPlayId,
} from './courtTypes';
import {
  BasketballSimulation,
  type AlleyOopPromptKey,
  type SimHudSnapshot,
} from './BasketballSimulation';
import {
  createDefaultReplayOrbit,
  createEmptyProjectedAnchors,
  type LineupPresetId,
  type ProjectedCourtAnchors,
} from './SimTacticsAndReplay';
import { MatchHUD } from '../hud/MatchHUD';
import { ShotMeterOverlay } from '../hud/ShotMeterOverlay';
import { TacticalRadarAndMarking } from '../hud/TacticalRadarAndMarking';
import { TouchControlsOverlay } from '../hud/TouchControlsOverlay';
import { PauseMenuModal } from '../hud/PauseMenuModal';
import '../hud/matchHud.css';
import { RosterStore, useRosterStore } from '../hybrid/rosterStore';
import {
  UltimateHybridStore,
  useUltimateHybridStore,
  type MatchPayoutBreakdown,
} from '../hybrid/store';
import { HybridAudioEngine, type HybridBeatsSnapshot } from '../hybrid/audioEngine';
import type { SettingsTabId } from '../hybrid/types';
import { ModesStore } from '../modes/modesStore';
import { ModeObjectiveOverlay } from '../modes/ModeObjectiveOverlay';
import { InstantReplayModal } from '../part7/InstantReplayModal';
import { PostMatchScreen } from '../part7/PostMatchScreen';
import { CustomHudEditor } from '../part7/CustomHudEditor';
import { SettingsModal } from '../part7/SettingsModal';
import '../part7/part7Hud.css';

export interface LiveCourtStageProps {
  onExitToMenu: () => void;
  onReturnToCity?: () => void;
  onOpenSettings: (tab?: SettingsTabId) => void;
  onLaunchLegacyCourt: () => void;
  onNotify: (msg: string) => void;
}

function detectTouchCapableDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    'ontouchstart' in window ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
}

export const LiveCourtStage: React.FC<LiveCourtStageProps> = ({
  onExitToMenu,
  onReturnToCity,
  onOpenSettings: _onOpenSettings,
  onLaunchLegacyCourt,
  onNotify,
}) => {
  const save = useUltimateHybridStore();
  const rosterSnap = useRosterStore();
  const config = save.activeMatchConfig;
  const era = save.uiEraMode;

  const homeTeam = useMemo(
    () => RosterStore.getTeamById(config.homeTeamId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.homeTeamId, rosterSnap.revision]
  );
  const awayTeam = useMemo(
    () => RosterStore.getTeamById(config.awayTeamId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.awayTeamId, rosterSnap.revision]
  );

  const [rematchNonce, setRematchNonce] = useState(0);
  const [fps, setFps] = useState(60);
  const [frameMs, setFrameMs] = useState(16);
  const [tacticsExpanded, setTacticsExpanded] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [inMatchSettingsTab, setInMatchSettingsTab] = useState<SettingsTabId | null>(null);
  const [hudEditorOpen, setHudEditorOpen] = useState(false);
  const [matchPayout, setMatchPayout] = useState<MatchPayoutBreakdown | null>(null);
  const [modeOutcomeSummary, setModeOutcomeSummary] = useState<string | null>(null);
  const [beats, setBeats] = useState<HybridBeatsSnapshot>(() => HybridAudioEngine.getBeatsSnapshot());
  const [isTouchDevice] = useState<boolean>(() => detectTouchCapableDevice());
  const [desktopTouchOverride, setDesktopTouchOverride] = useState<boolean | null>(null);

  const activeLaunchPayload = ModesStore.getActiveLaunchPayload();
  const replayOrbitRef = useRef(createDefaultReplayOrbit());
  const capturePngRef = useRef<(() => string | null) | null>(null);
  const matchSettledRef = useRef(false);

  useEffect(() => HybridAudioEngine.subscribe(setBeats), []);

  const createSim = useCallback(() => {
    const payload = ModesStore.getActiveLaunchPayload();
    const resolvedHomeTeam =
      payload?.customHomeRoster && payload.customHomeRoster.length > 0
        ? { ...homeTeam, roster: payload.customHomeRoster }
        : homeTeam;
    const resolvedAwayTeam =
      payload?.customAwayRoster && payload.customAwayRoster.length > 0
        ? { ...awayTeam, roster: payload.customAwayRoster }
        : awayTeam;

    return new BasketballSimulation({
      awayTeam: resolvedAwayTeam,
      homeTeam: resolvedHomeTeam,
      config,
      settings: UltimateHybridStore.getState().settings,
      scenarioOverride: payload
        ? {
            startQuarter: payload.startQuarter,
            startClockSec: payload.startClockSec,
            startHomeScore: payload.startHomeScore,
            startAwayScore: payload.startAwayScore,
            threePointValue: payload.threePointValue,
            twoPointValue: payload.twoPointValue,
            speedMultiplier: payload.speedMultiplier,
            forceGreenOrMiss: payload.forceGreenOrMiss,
            staminaBonus: payload.staminaBonus,
            instantTakeover: payload.instantTakeover,
          }
        : null,
      hooks: {
        onDribble: () => HybridAudioEngine.playDribble(),
        onSwish: (isChain) => HybridAudioEngine.playSwish(isChain),
        onGreenRelease: () => HybridAudioEngine.playGreenRelease(),
        onRimClank: () => HybridAudioEngine.playRimClank(),
        onDunkSlam: () => HybridAudioEngine.playDunkSlam(),
        onWhistle: () => HybridAudioEngine.playWhistle(),
        onBuzzer: () => HybridAudioEngine.playBuzzer(),
        onCrowdRoar: (intensity) => HybridAudioEngine.playCrowdRoar(intensity),
        onAnnounce: (line) => HybridAudioEngine.announce(line),
      },
    });
  }, [awayTeam, homeTeam, config]);

  const simRef = useRef<BasketballSimulation | null>(null);
  if (!simRef.current) {
    simRef.current = createSim();
  }
  const matchStateRef = useRef<MatchRenderState>(simRef.current.renderState);
  const projectedAnchorsRef = useRef<ProjectedCourtAnchors>(createEmptyProjectedAnchors());
  const [hud, setHud] = useState<SimHudSnapshot>(() => simRef.current!.getHudSnapshot());

  // Live input refs (zero React re-renders per frame)
  const keysRef = useRef<Record<string, boolean>>({});
  const touchStickRef = useRef<{ rawRight: number; rawForward: number; sprintLocked: boolean }>({
    rawRight: 0,
    rawForward: 0,
    sprintLocked: false,
  });
  const touchHoldRef = useRef<{
    shoot: boolean;
    protect: boolean;
    sprint: boolean;
    handsUp: boolean;
  }>({
    shoot: false,
    protect: false,
    sprint: false,
    handsUp: false,
  });
  const proStickDragRef = useRef<{
    active: boolean;
    startY: number;
    pulledDown: boolean;
    lastY: number;
    lastTs: number;
  }>({ active: false, startY: 0, pulledDown: false, lastY: 0, lastTs: 0 });
  const arrowRhythmArmedRef = useRef<boolean>(false);
  const rightStickArmedRef = useRef<boolean>(false);
  const hudSyncAccumRef = useRef(0);
  const prevGamepadBtnsRef = useRef<boolean[]>([]);

  // Rebuild simulation cleanly when teams, playersPerSide, sideControl, or rematch changes
  useEffect(() => {
    const nextSim = createSim();
    simRef.current = nextSim;
    matchStateRef.current = nextSim.renderState;
    matchSettledRef.current = false;
    replayOrbitRef.current.active = false;
    setPauseOpen(false);
    setReplayOpen(false);
    setInMatchSettingsTab(null);
    setHudEditorOpen(false);
    setMatchPayout(null);
    setModeOutcomeSummary(null);
    setHud(nextSim.getHudSnapshot());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    homeTeam.id,
    awayTeam.id,
    config.playersPerSide,
    config.sideControl,
    config.targetScore,
    rematchNonce,
    rosterSnap.revision,
  ]);

  // Live settings sync (zero WebGL remount)
  useEffect(() => {
    simRef.current?.syncSettings(save.settings);
  }, [save.settings]);

  const anyModalPaused = pauseOpen || replayOpen || Boolean(inMatchSettingsTab) || hudEditorOpen;

  // Sync Pause Gate directly into BasketballSimulation
  useEffect(() => {
    simRef.current?.setPaused(anyModalPaused);
    if (simRef.current) {
      setHud(simRef.current.getHudSnapshot());
    }
  }, [anyModalPaused]);

  // Settle Career Profile, Shot Chart & VC/MTP/XP payout once per completed match
  useEffect(() => {
    if (hud.phase !== 'GAME_OVER' || matchSettledRef.current) return;
    matchSettledRef.current = true;
    const userSide = hud.userTeamSide ?? 'HOME';
    const userScore = userSide === 'HOME' ? hud.homeScore : hud.awayScore;
    const oppScore = userSide === 'HOME' ? hud.awayScore : hud.homeScore;
    const userRows = hud.boxScore.filter((r) => r.teamSide === userSide);
    const sum = (fn: (r: (typeof userRows)[number]) => number) =>
      userRows.reduce((acc, r) => acc + fn(r), 0);
    const topPlayerPts = userRows.reduce((mx, r) => Math.max(mx, r.pts), 0);
    const userShots = hud.matchShots.filter((s) => s.teamSide === userSide);
    const greenThreesMade = userShots.filter((s) => s.made && s.isThree && s.isGreen).length;
    const isPark =
      config.playersPerSide <= 3 ||
      config.venue === 'SKYLINE_PARK' ||
      config.venue === 'STREET_KINGS' ||
      config.venue === 'BLACKTOP_CAGE' ||
      config.venue === 'RIVET_CITY';

    const payout = UltimateHybridStore.commitCompletedMatch({
      userWon: userScore >= oppScore,
      userTeamPts: userScore,
      userTeamReb: sum((r) => r.reb),
      userTeamAst: sum((r) => r.ast),
      userTeamStl: sum((r) => r.stl),
      userTeamBlk: sum((r) => r.blk),
      userTeamFgm: sum((r) => r.fgm),
      userTeamFga: sum((r) => r.fga),
      userTeamTpm: sum((r) => r.tpm),
      userTeamTpa: sum((r) => r.tpa),
      greensMade: sum((r) => r.greens),
      greenThreesMade,
      topPlayerPts,
      teammateGradeScore: hud.teammateGrade.score,
      isBlacktopOrPark: isPark,
      matchShots: userShots.map((s) => ({
        x: s.x,
        y: s.y,
        made: s.made,
        isThree: s.isThree,
        isGreen: s.isGreen,
      })),
    });
    setMatchPayout(payout);
  }, [hud, config.playersPerSide, config.venue]);

  const cameraConfig: CourtCameraConfig = useMemo(
    () => ({
      angle: save.settings.camera.angle,
      zoom: save.settings.camera.zoom,
      height: save.settings.camera.height,
      autoFlip: save.settings.camera.autoFlip,
      keyZoom: save.settings.camera.keyZoom,
      reverseAngle: save.settings.camera.reverseAngle,
      dunkCameraShake: save.settings.camera.dunkCameraShake,
    }),
    [save.settings.camera]
  );

  const visualConfig: CourtVisualConfig = useMemo(
    () => ({
      hardwoodReflections: save.settings.visual.hardwoodReflections,
      hotColdZones: save.settings.visual.hotColdZones,
      playVision: save.settings.visual.playVision,
      showPlayerIcons: save.settings.visual.showPlayerIcons,
      cinema3DQuality: save.settings.visual.cinema3DQuality,
    }),
    [save.settings.visual]
  );

  const cycleCamera = useCallback(() => {
    const cur = UltimateHybridStore.getState().settings.camera.angle;
    const idx = CAMERA_ORDER.indexOf(cur);
    const next = CAMERA_ORDER[(idx + 1) % CAMERA_ORDER.length];
    UltimateHybridStore.updateSettings('camera', { angle: next });
    HybridAudioEngine.playUi('switch', era);
    const meta = CAMERA_ANGLE_OPTIONS.find((c) => c.id === next);
    onNotify(`Camera: ${meta ? meta.label : next}`);
  }, [era, onNotify]);

  const toggleLiveHudEra = useCallback(() => {
    const curSb = UltimateHybridStore.getState().settings.visual.scoreboardEra;
    const curUiEra = UltimateHybridStore.getState().uiEraMode;
    const isCurrently2K14 =
      curSb === '2K14_METALLIC' || (curSb === 'AUTO' && curUiEra === '2K14_CLASSIC');
    const nextSb = isCurrently2K14 ? '2K26_OBSIDIAN' : '2K14_METALLIC';
    UltimateHybridStore.updateSettings('visual', { scoreboardEra: nextSb });
    HybridAudioEngine.playUi('switch', era);
    onNotify(nextSb === '2K14_METALLIC' ? 'HUD Era: NBA 2K14 Classic' : 'HUD Era: NBA 2K26 Next-Gen');
  }, [era, onNotify]);

  const touchControlsVisible = useMemo(() => {
    if (desktopTouchOverride !== null) return desktopTouchOverride;
    const pref = save.settings.controller.showVirtualTouchControls;
    if (pref === 'ALWAYS') return true;
    if (pref === 'OFF') return false;
    return isTouchDevice;
  }, [desktopTouchOverride, save.settings.controller.showVirtualTouchControls, isTouchDevice]);

  const toggleTouchControls = useCallback(() => {
    setDesktopTouchOverride((prev) => {
      const next = prev === null ? !touchControlsVisible : !prev;
      onNotify(next ? 'Virtual Dual-Stick Pad: ON' : 'Virtual Dual-Stick Pad: OFF');
      return next;
    });
  }, [touchControlsVisible, onNotify]);

  // ==========================================================================
  // FULL PART 5 + PART 7 CUSTOMIZABLE KEYBOARD BINDINGS
  // Honors save.settings.controller.keybinds while keeping WASD + Arrows Rhythm
  // ==========================================================================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const sim = simRef.current;
      if (!sim) return;

      const kb = UltimateHybridStore.getState().settings.controller.keybinds;

      if (e.code === kb.pause || e.code === 'Escape') {
        e.preventDefault();
        if (hudEditorOpen) {
          setHudEditorOpen(false);
        } else if (inMatchSettingsTab) {
          setInMatchSettingsTab(null);
        } else if (replayOpen) {
          sim.restoreLiveFromReplay();
          replayOrbitRef.current.active = false;
          setReplayOpen(false);
        } else {
          setPauseOpen((prev) => !prev);
        }
        return;
      }

      if (sim.isPaused()) return;

      const wasDown = Boolean(keysRef.current[e.code]);
      keysRef.current[e.code] = true;

      if (e.code === kb.shoot || e.code === 'Space') {
        e.preventDefault();
        if (!wasDown) {
          const curHud = sim.getHudSnapshot();
          if (curHud.phase === 'JUMP_BALL') {
            sim.triggerJumpBallAttempt();
          } else if (curHud.phase === 'FREE_THROW') {
            sim.releaseUserFreeThrow();
          } else if (curHud.userTeamSide && curHud.possession !== curHud.userTeamSide) {
            sim.triggerLobOrBlock();
          }
        }
        return;
      }

      if (e.code === kb.iconPass || e.code === 'Tab') {
        e.preventDefault();
        if (!wasDown) sim.toggleIconPassing();
        return;
      }

      if (wasDown) return;

      // Arrow Keys Down -> Up 2K26 Rhythm Shooting
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        arrowRhythmArmedRef.current = true;
        sim.startRhythmShotDown();
        return;
      }
      if (e.code === 'ArrowUp' && arrowRhythmArmedRef.current) {
        e.preventDefault();
        arrowRhythmArmedRef.current = false;
        sim.flickRhythmShotUp(1.0);
        return;
      }

      const curHud = sim.getHudSnapshot();

      // Mid-Air Alley-Oop Finish Prompt Keys (A / B / X / Y)
      if (curHud.alleyOopPrompt.active) {
        const keyMap: Record<string, AlleyOopPromptKey> = {
          KeyA: 'A',
          KeyB: 'B',
          KeyX: 'X',
          KeyY: 'Y',
        };
        if (keyMap[e.code]) {
          e.preventDefault();
          sim.submitAlleyOopFinishKey(keyMap[e.code]);
          return;
        }
      }

      // Icon Passing Slot 1-5
      if (curHud.iconPassingActive && e.code >= 'Digit1' && e.code <= 'Digit5') {
        e.preventDefault();
        sim.triggerIconPass(Number(e.code.replace('Digit', '')));
        return;
      }

      // Quick Coach Tactics / Radar Expand hotkeys (1-4 when Icon Passing is off)
      if (!curHud.iconPassingActive && e.code >= 'Digit1' && e.code <= 'Digit4') {
        e.preventDefault();
        setTacticsExpanded((prev) => !prev);
        return;
      }

      const onDefense = Boolean(curHud.userTeamSide && curHud.possession !== curHud.userTeamSide);

      if (e.code === kb.camera) {
        e.preventDefault();
        cycleCamera();
      } else if (e.code === kb.screen) {
        e.preventDefault();
        sim.callPickAndRoll();
      } else if (e.code === kb.pass) {
        e.preventDefault();
        sim.triggerPass('CHEST');
      } else if (e.code === kb.bouncePass) {
        e.preventDefault();
        sim.triggerPass('BOUNCE');
      } else if (e.code === kb.alleyOop || e.code === kb.block) {
        e.preventDefault();
        sim.triggerLobOrBlock();
      } else if (e.code === kb.steal && onDefense) {
        e.preventDefault();
        sim.triggerStealAttempt();
      } else if (e.code === kb.switchDef && onDefense) {
        e.preventDefault();
        sim.switchToNearestDefender();
      } else if (e.code === kb.dribble) {
        e.preventDefault();
        if (curHud.pickAndRoll.active) {
          sim.flipPickAndRollAngle();
        } else {
          sim.triggerDribbleMove('CROSSOVER');
        }
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        if (curHud.pickAndRoll.active) {
          sim.togglePickAndRollAction();
        } else if (onDefense) {
          sim.switchToNearestDefender();
        } else {
          sim.triggerDribbleMove('SPIN');
        }
      } else if (e.code === 'KeyZ') {
        e.preventDefault();
        sim.triggerDribbleMove('STEPBACK');
      } else if (e.code === kb.takeover) {
        e.preventDefault();
        sim.triggerTakeoverIgnition();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [cycleCamera, hudEditorOpen, inMatchSettingsTab, replayOpen]);

  // Mouse Right-Click (or Left-Click) Drag Down -> Up 2K26 Rhythm Shooting on 3D Court
  const handleCourtPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (anyModalPaused) return;
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest(
        'button, input, select, .p5-top-left-cluster, .p5-radar-shell, .p5-touch-overlay, .p5-pause-backdrop, .p5-replay-bar, .p7-modal-overlay, .p7-post-backdrop, .p7-replay-shell, .p7-hud-editor'
      )
    ) {
      return;
    }
    proStickDragRef.current = {
      active: true,
      startY: e.clientY,
      pulledDown: false,
      lastY: e.clientY,
      lastTs: performance.now(),
    };
  };

  const handleCourtPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = proStickDragRef.current;
    if (!d.active) return;
    const sim = simRef.current;
    if (!sim || sim.isPaused()) return;

    const dy = e.clientY - d.startY;
    if (!d.pulledDown && dy > 24) {
      d.pulledDown = true;
      sim.startRhythmShotDown();
    } else if (d.pulledDown && e.clientY < d.lastY - 16) {
      const dtMs = Math.max(12, performance.now() - d.lastTs);
      const flickVel = Math.min(2.0, (Math.abs(d.lastY - e.clientY) / dtMs) * 1.1);
      d.active = false;
      d.pulledDown = false;
      sim.flickRhythmShotUp(flickVel);
      return;
    }
    d.lastY = e.clientY;
    d.lastTs = performance.now();
  };

  const handleCourtPointerUp = () => {
    const d = proStickDragRef.current;
    if (d.active && d.pulledDown) {
      simRef.current?.flickRhythmShotUp(0.98);
    }
    d.active = false;
    d.pulledDown = false;
  };

  // ==========================================================================
  // 60 FPS SIMULATION TICK + HTML5 GAMEPAD API POLLING (ZERO REACT THRASH)
  // ==========================================================================
  const onTickFrame = useCallback((dt: number) => {
    const sim = simRef.current;
    if (!sim) return;

    if (!sim.isPaused()) {
      const keys = keysRef.current;
      const st = sim.renderState;
      const camCfg = UltimateHybridStore.getState().settings.camera;

      let rawForward = touchStickRef.current.rawForward;
      let rawRight = touchStickRef.current.rawRight;
      if (keys.KeyW) rawForward += 1;
      if (keys.KeyS) rawForward -= 1;
      if (keys.KeyD) rawRight += 1;
      if (keys.KeyA) rawRight -= 1;
      rawForward = Math.max(-1, Math.min(1, rawForward));
      rawRight = Math.max(-1, Math.min(1, rawRight));

      // HTML5 Gamepad API polling (Xbox / PlayStation plug-and-play)
      let gpShoot = false;
      let gpSprint = false;
      let gpProtect = false;
      let gpHandsUp = false;
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const pads = navigator.getGamepads();
        const pad = pads && pads[0];
        if (pad) {
          const lx = Math.abs(pad.axes[0] || 0) > 0.18 ? pad.axes[0] : 0;
          const ly = Math.abs(pad.axes[1] || 0) > 0.18 ? pad.axes[1] : 0;
          if (Math.hypot(lx, ly) > 0.18) {
            rawRight = lx;
            rawForward = -ly;
          }

          // Right Stick Down -> Up Rhythm Shooting
          const ry = pad.axes[3] || 0;
          if (!rightStickArmedRef.current && ry > 0.65) {
            rightStickArmedRef.current = true;
            sim.startRhythmShotDown();
          } else if (rightStickArmedRef.current && ry < -0.45) {
            rightStickArmedRef.current = false;
            sim.flickRhythmShotUp(1.0);
          } else if (rightStickArmedRef.current && Math.abs(ry) < 0.15) {
            rightStickArmedRef.current = false;
            sim.flickRhythmShotUp(0.95);
          }

          const btns = pad.buttons.map((b) => b.pressed);
          const prev = prevGamepadBtnsRef.current;
          const justPressed = (idx: number) => Boolean(btns[idx] && !prev[idx]);

          gpShoot = Boolean(btns[2]); // X / Square
          gpSprint = Boolean(btns[7]); // RT / R2
          gpProtect = Boolean(btns[6]); // LT / L2
          gpHandsUp = Boolean(btns[5]); // RB / R1

          if (justPressed(0)) sim.triggerPass('CHEST'); // A / Cross
          if (justPressed(1)) sim.triggerPass('BOUNCE'); // B / Circle
          if (justPressed(3)) sim.triggerLobOrBlock(); // Y / Triangle
          if (justPressed(4)) sim.callPickAndRoll(); // LB / L1 -> Pick & Roll!
          if (justPressed(9)) setPauseOpen((p) => !p); // Start / Options -> Pause
          if (justPressed(10) || justPressed(11)) sim.triggerTakeoverIgnition(); // Stick Click

          prevGamepadBtnsRef.current = btns;
        }
      }

      let moveX = 0;
      let moveZ = 0;
      const isSidelineCam = camCfg.angle === 'BROADCAST' || camCfg.angle === 'NOSEBLEEDS';
      if (isSidelineCam) {
        const rev = camCfg.reverseAngle ? -1 : 1;
        moveX = rawRight * rev;
        moveZ = -rawForward * rev;
      } else {
        let dir: 1 | -1 = camCfg.autoFlip ? st.attackDirX : 1;
        if (camCfg.reverseAngle) dir = dir === 1 ? -1 : 1;
        moveX = rawForward * dir;
        moveZ = rawRight * dir;
      }

      const isOffenseNow =
        sim.getHudSnapshot().userTeamSide !== null &&
        st.possession === sim.getHudSnapshot().userTeamSide;

      const kb = UltimateHybridStore.getState().settings.controller.keybinds;
      const shiftDown = Boolean(keys.ShiftLeft || keys.ShiftRight || keys[kb.sprint]);
      const sprint = Boolean(
        (shiftDown && isOffenseNow) ||
          keys.ControlLeft ||
          keys.ControlRight ||
          keys.KeyR ||
          touchStickRef.current.sprintLocked ||
          touchHoldRef.current.sprint ||
          gpSprint
      );
      const quickProtectOrIntenseD = Boolean(
        (shiftDown && !isOffenseNow) ||
          touchHoldRef.current.protect ||
          gpProtect
      );
      const shootHeld = Boolean(keys[kb.shoot] || keys.Space || touchHoldRef.current.shoot || gpShoot);
      const handsUp = Boolean(keys[kb.handsUp] || keys.KeyU || touchHoldRef.current.handsUp || gpHandsUp);

      sim.setInput({
        moveX,
        moveZ,
        sprint,
        shootHeld,
        quickProtectOrIntenseD,
        handsUp,
      });

      sim.step(dt);
    }

    // Throttled ~18 Hz HUD refresh (silky shot meters + zero React frame thrash)
    hudSyncAccumRef.current += dt;
    if (hudSyncAccumRef.current >= 0.055) {
      hudSyncAccumRef.current = 0;
      setFrameMs(Math.max(4, Math.round(dt * 1000)));
      setHud(sim.getHudSnapshot());
    }
  }, []);

  const activeCameraMeta = useMemo(
    () =>
      CAMERA_ANGLE_OPTIONS.find((c) => c.id === save.settings.camera.angle) ??
      CAMERA_ANGLE_OPTIONS[0],
    [save.settings.camera.angle]
  );

  const isOffenseControlled =
    hud.userTeamSide !== null && hud.possession === hud.userTeamSide;

  const handleMarkEnemy = useCallback(
    (playerId: string | null, tag: MarkCoverageTag) => {
      simRef.current?.setMarkedStar(playerId, tag);
      HybridAudioEngine.playUi('confirm', era);
      if (simRef.current) setHud(simRef.current.getHudSnapshot());
    },
    [era]
  );

  const handleSetOffensivePlay = useCallback(
    (play: PlayVisionPlayId) => {
      simRef.current?.setActivePlay(play);
      UltimateHybridStore.updateSettings('visual', { playVision: play });
      HybridAudioEngine.playUi('switch', era);
      if (simRef.current) setHud(simRef.current.getHudSnapshot());
    },
    [era]
  );

  const handleSetDefensiveScheme = useCallback(
    (scheme: DefensiveSchemeId) => {
      simRef.current?.setDefensiveScheme(scheme);
      HybridAudioEngine.playUi('switch', era);
      if (simRef.current) setHud(simRef.current.getHudSnapshot());
    },
    [era]
  );

  const handleApplyLineupPreset = useCallback(
    (preset: LineupPresetId) => {
      simRef.current?.applyLineupPreset(preset);
      HybridAudioEngine.playUi('confirm', era);
      onNotify(`Lineup Unit: ${preset}`);
      if (simRef.current) setHud(simRef.current.getHudSnapshot());
    },
    [era, onNotify]
  );

  const handleCallTimeout = useCallback(() => {
    const ok = simRef.current?.callTimeout();
    if (ok) {
      HybridAudioEngine.playUi('confirm', era);
      if (simRef.current) setHud(simRef.current.getHudSnapshot());
    } else {
      onNotify('No Timeouts Remaining!');
    }
  }, [era, onNotify]);

  return (
    <div
      className="h2k-live-stage"
      data-screen="LIVE_GAME"
      onPointerDown={handleCourtPointerDown}
      onPointerMove={handleCourtPointerMove}
      onPointerUp={handleCourtPointerUp}
      onPointerCancel={handleCourtPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* FULL-VIEWPORT 60 FPS THREE.JS 3D BASKETBALL ENGINE */}
      <Court3D
        matchStateRef={matchStateRef}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        venue={config.venue}
        homeJersey={config.homeJersey}
        awayJersey={config.awayJersey}
        uiEraMode={era}
        cameraConfig={cameraConfig}
        visualConfig={visualConfig}
        streakStamp={
          save.profile.winStreak >= 3
            ? `STREAK SETTER · ${save.profile.winStreak}W`
            : 'SKYLINE PARK · 2K26'
        }
        projectedAnchorsRef={projectedAnchorsRef}
        replayOrbitRef={replayOrbitRef}
        capturePngRef={capturePngRef}
        onTickFrame={onTickFrame}
        onFpsSample={setFps}
      />

      {/* PART 5 DUAL-ERA BROADCAST HUD (2K14 / 2K26 / BLACKTOP + GRADE + BADGES) */}
      {!replayOpen && !hudEditorOpen && (
        <MatchHUD
          hud={hud}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          venue={config.venue}
          uiEraMode={era}
          scoreboardEra={save.settings.visual.scoreboardEra}
          scorebugPosition2K26={save.settings.visual.scorebugPosition2K26}
          activeCameraShortLabel={activeCameraMeta.shortLabel}
          showFpsTelemetry={save.settings.visual.showFpsTelemetry}
          showShotFeedback={save.settings.visual.showShotFeedback}
          fps={fps}
          frameMs={frameMs}
          winStreak={save.profile.winStreak}
          tacticsOpen={tacticsExpanded}
          touchControlsVisible={touchControlsVisible}
          projectedAnchorsRef={projectedAnchorsRef}
          tacticsLayout={save.settings.controller.customHudLayout.tactics_btn}
          suppressDefaultGameOver={true}
          onOpenPause={() => setPauseOpen(true)}
          onCycleCamera={cycleCamera}
          onToggleTactics={() => setTacticsExpanded((v) => !v)}
          onToggleEra={toggleLiveHudEra}
          onToggleTouchControls={toggleTouchControls}
          onIgniteTakeover={() => simRef.current?.triggerTakeoverIgnition()}
          onTriggerIconPass={(slot) => simRef.current?.triggerIconPass(slot)}
          onAlleyOopPress={(key) => simRef.current?.submitAlleyOopFinishKey(key)}
          onRematch={() => setRematchNonce((n) => n + 1)}
          onExitToMenu={onExitToMenu}
        />
      )}

      {/* PART 5 ALL 5 AUTHENTIC 3D-PROJECTED SHOT METER STYLES + SKILL DUNK */}
      {!replayOpen && !hudEditorOpen && (
        <ShotMeterOverlay
          meter={hud.meter}
          shotMeterStyle={save.settings.controller.shotMeterStyle}
          shotMeterEnabled={save.settings.controller.shotMeterEnabled}
          activeShooterId={hud.activeShooterId}
          projectedAnchorsRef={projectedAnchorsRef}
          isUserFreeThrow={hud.userTeamSide === hud.possession}
          onJumpBallTap={() => simRef.current?.triggerJumpBallAttempt()}
          onFreeThrowRelease={() => simRef.current?.releaseUserFreeThrow()}
        />
      )}

      {/* PART 5 COMPACT/EXPANDABLE MINI-COURT RADAR, ENEMY STAR MARKING & COACH HUB */}
      {!replayOpen && !hudEditorOpen && (
        <TacticalRadarAndMarking
          hud={hud}
          homePrimaryColor={homeTeam.colors.primary}
          awayPrimaryColor={awayTeam.colors.primary}
          expanded={tacticsExpanded}
          radarLayout={save.settings.controller.customHudLayout.radar_panel}
          onToggleExpanded={() => setTacticsExpanded((v) => !v)}
          onMarkEnemy={handleMarkEnemy}
          onSetOffensivePlay={handleSetOffensivePlay}
          onSetDefensiveScheme={handleSetDefensiveScheme}
          onCallPickAndRoll={() => {
            simRef.current?.callPickAndRoll();
            if (simRef.current) setHud(simRef.current.getHudSnapshot());
          }}
          onFlipScreenAngle={() => {
            simRef.current?.flipPickAndRollAngle();
            if (simRef.current) setHud(simRef.current.getHudSnapshot());
          }}
          onToggleScreenAction={() => {
            simRef.current?.togglePickAndRollAction();
            if (simRef.current) setHud(simRef.current.getHudSnapshot());
          }}
          onApplyLineupPreset={handleApplyLineupPreset}
          onCallTimeout={handleCallTimeout}
        />
      )}

      {/* PART 5 DUAL-STICK VIRTUAL TOUCH CONTROLS (AUTO ON TOUCH + DESKTOP TOGGLE) */}
      <TouchControlsOverlay
        visible={touchControlsVisible && !anyModalPaused && hud.phase !== 'GAME_OVER'}
        isOffense={isOffenseControlled}
        takeoverReady={Boolean(hud.controlledTakeover?.readyToIgnite)}
        pickAndRoll={hud.pickAndRoll}
        customHudLayout={save.settings.controller.customHudLayout}
        onStickChange={(rawRight, rawForward, sprintLocked) => {
          touchStickRef.current.rawRight = rawRight;
          touchStickRef.current.rawForward = rawForward;
          touchStickRef.current.sprintLocked = sprintLocked;
        }}
        onHoldStateChange={(patch) => {
          Object.assign(touchHoldRef.current, patch);
        }}
        onRhythmDown={() => simRef.current?.startRhythmShotDown()}
        onRhythmFlickUp={(vel) => simRef.current?.flickRhythmShotUp(vel)}
        onPass={(kind) => simRef.current?.triggerPass(kind)}
        onDribble={(move) => simRef.current?.triggerDribbleMove(move)}
        onCallScreen={() => simRef.current?.callPickAndRoll()}
        onFlipScreenAngle={() => simRef.current?.flipPickAndRollAngle()}
        onToggleScreenAction={() => simRef.current?.togglePickAndRollAction()}
        onToggleIconPass={() => simRef.current?.toggleIconPassing()}
        onAlleyOop={() => simRef.current?.triggerAlleyOop()}
        onIgniteTakeover={() => simRef.current?.triggerTakeoverIgnition()}
        onBlockOrRebound={() => simRef.current?.triggerLobOrBlock()}
        onSteal={() => simRef.current?.triggerStealAttempt()}
        onSwitchDefender={() => simRef.current?.switchToNearestDefender()}
      />

      {/* PART 5 PAUSE MENU MODAL + PART 7 10S INSTANT REPLAY & 7-TAB SETTINGS HOOKS */}
      <PauseMenuModal
        open={pauseOpen}
        hud={hud}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        cameraSettings={save.settings.camera}
        onResume={() => setPauseOpen(false)}
        onPreviewReplayFrame={(idx) => {
          simRef.current?.previewReplayFrame(idx);
        }}
        onRestoreLiveFrame={() => {
          simRef.current?.restoreLiveFromReplay();
        }}
        onSetOffensivePlay={handleSetOffensivePlay}
        onSetDefensiveScheme={handleSetDefensiveScheme}
        onApplyLineupPreset={handleApplyLineupPreset}
        onCallTimeout={handleCallTimeout}
        onUpdateCamera={(patch) => {
          UltimateHybridStore.updateSettings('camera', patch);
        }}
        onOpenFullSettings={(tab) => {
          setPauseOpen(false);
          setInMatchSettingsTab(tab ?? 'GAMEPLAY');
        }}
        onOpenInstantReplay={() => {
          setPauseOpen(false);
          setReplayOpen(true);
        }}
        onRematch={() => {
          setPauseOpen(false);
          setRematchNonce((n) => n + 1);
        }}
        onLaunchLegacyCourt={() => {
          setPauseOpen(false);
          onLaunchLegacyCourt();
        }}
        onQuitToMenu={() => {
          setPauseOpen(false);
          ModesStore.setActiveLaunchPayload(null);
          onExitToMenu();
        }}
      />

      {/* PART 6 LIVE SCENARIO / DRILL OBJECTIVE TRACKER (POST-MATCH DELEGATED TO PART 7) */}
      <ModeObjectiveOverlay
        payload={activeLaunchPayload}
        hud={hud}
        suppressPostMatchModal={true}
        onModeSettled={(summary) => setModeOutcomeSummary(summary)}
        onFinishAndReturn={(retScreen) => {
          ModesStore.setActiveLaunchPayload(null);
          UltimateHybridStore.setActiveScreen(retScreen);
        }}
        onRematch={() => setRematchNonce((n) => n + 1)}
      />

      {/* PART 7 POST-MATCH JORDAN/GATORADE MVP CELEBRATION & 3-TAB PROGRESSION */}
      {hud.phase === 'GAME_OVER' && !replayOpen && !inMatchSettingsTab && !hudEditorOpen && (
        <PostMatchScreen
          hud={hud}
          awayTeam={awayTeam}
          homeTeam={homeTeam}
          save={save}
          payout={matchPayout}
          modePayload={activeLaunchPayload}
          modeOutcomeSummary={modeOutcomeSummary}
          onRematch={() => setRematchNonce((n) => n + 1)}
          onOpenReplay={() => setReplayOpen(true)}
          onReturnToCity={() => {
            ModesStore.setActiveLaunchPayload(null);
            if (onReturnToCity) {
              onReturnToCity();
            } else {
              UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
            }
          }}
          onMainMenu={() => {
            ModesStore.setActiveLaunchPayload(null);
            onExitToMenu();
          }}
        />
      )}

      {/* PART 7 10-SECOND (600-FRAME) 360° 3D INSTANT REPLAY FREEZE CAM + PNG CAPTURE */}
      {replayOpen && (
        <InstantReplayModal
          uiEraMode={era}
          frameCount={hud.replayFrameCount}
          replayOrbitRef={replayOrbitRef}
          activeCameraPreset={save.settings.camera.angle}
          onSeekFrame={(idx) => {
            simRef.current?.previewReplayFrame(idx);
          }}
          onSelectCameraPreset={(preset) => {
            UltimateHybridStore.updateSettings('camera', { angle: preset });
          }}
          onCapturePng={() => (capturePngRef.current ? capturePngRef.current() : null)}
          onExit={() => {
            simRef.current?.restoreLiveFromReplay();
            replayOrbitRef.current.active = false;
            setReplayOpen(false);
          }}
        />
      )}

      {/* PART 7 IN-MATCH 7-TAB SETTINGS, SLIDERS & PROFILE MODAL */}
      {inMatchSettingsTab && (
        <SettingsModal
          save={save}
          beats={beats}
          initialTab={inMatchSettingsTab}
          inMatch={true}
          onClose={() => setInMatchSettingsTab(null)}
          onOpenCustomHudEditor={() => {
            setInMatchSettingsTab(null);
            setHudEditorOpen(true);
          }}
          onNotify={onNotify}
        />
      )}

      {/* PART 7 LIVE DRAG-AND-DROP CUSTOM TOUCH HUD EDITOR OVER LIVE 3D COURT */}
      {hudEditorOpen && (
        <CustomHudEditor
          uiEraMode={era}
          initialLayout={save.settings.controller.customHudLayout}
          liveCourtBackdrop={true}
          onSaveAndExit={(layout) => {
            UltimateHybridStore.updateCustomHudLayout(layout);
            setHudEditorOpen(false);
            onNotify('Custom Touch HUD layout saved!');
          }}
          onCancel={() => setHudEditorOpen(false)}
        />
      )}
    </div>
  );
};
