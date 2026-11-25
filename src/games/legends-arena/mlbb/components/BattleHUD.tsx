import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MlbbHudSnapshot,
  MlbbMatchLaunchConfig,
  MlbbMatchRecord,
  MlbbProfileSave,
  MlbbSettingsState
} from '../types';
import { computeMlbbQuickBuy, getMlbbItemById } from '../data/items';
import { getMlbbEmoteById, MLBB_QUICK_CHAT_OPTIONS } from '../data/emblems';
import { formatClock, WORLD_SIZE } from '../data/mapData';
import { getMlbbHeroById } from '../data/heroes';
import { classifyPingGesture } from '../engine/CombatMath';
import { MlbbGameEngine } from '../engine/GameEngine';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { InMatchScoreboardModal, InMatchShopModal } from './InMatchOverlays';
import { SettingsAndCustomUiModal } from './SettingsAndCustomUi';
import { ExpandedMinimap } from './ExpandedMinimap';
import { DeathRecapModal } from './DeathRecapModal';
import { BuffRadialBadge, SurrenderVoteBar } from './HudWidgets';
import { mlbbAudio } from '../engine/AudioEngine';

interface BattleHUDProps {
  config: MlbbMatchLaunchConfig;
  profile: MlbbProfileSave;
  onUpdateSettings: (next: MlbbSettingsState) => void;
  onMatchEnd: (record: MlbbMatchRecord) => void;
  onExitToLobby: () => void;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  config,
  profile,
  onUpdateSettings,
  onMatchEnd,
  onExitToLobby
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeHostRef = useRef<HTMLDivElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MlbbGameEngine | null>(null);

  const [snap, setSnap] = useState<MlbbHudSnapshot | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [minimapExpanded, setMinimapExpanded] = useState(false);
  const [deathRecapOpen, setDeathRecapOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [customChatText, setCustomChatText] = useState('');
  const [emoteWheelOpen, setEmoteWheelOpen] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [practiceOpen, setPracticeOpen] = useState(config.mode === 'practice');

  // Press-and-Hold Drag-to-Mark Pop-Out Tactical Mini-Map state (140ms hold OR >10px drag threshold!)
  const pingPopupCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pingHoldTimerRef = useRef<number | null>(null);
  const [dragPingState, setDragPingState] = useState<{
    kind: 'attack' | 'retreat' | 'gather';
    startX: number;
    startY: number;
    startMs: number;
    popupOpen: boolean;
    reticleNorm: { nx: number; ny: number } | null;
    previewLabel: string | null;
    previewIcon: string | null;
    previewColor: string | null;
    snapped: boolean;
  } | null>(null);

  // Direct top-left minimap camera scouting drag ref
  const minimapDragRef = useRef<{ startX: number; startY: number; dragged: boolean } | null>(null);

  // Delayed catch-up HUD HP bar & cooldown completion pop
  const [hudHpTrailPct, setHudHpTrailPct] = useState(100);
  const prevSkillCdsRef = useRef<[number, number, number]>([0, 0, 0]);
  const [readyPopSlots, setReadyPopSlots] = useState<Record<number, number>>({});

  // Multi-touch virtual joystick state (supports BOTH Fixed & Floating modes)
  const joyOriginRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const [joyKnob, setJoyKnob] = useState({ x: 0, y: 0, active: false });
  const [floatingJoyCenter, setFloatingJoyCenter] = useState<{ x: number; y: number } | null>(null);

  // Skill drag-aiming + Cancel Cast + Drag-to-Signal CD drop target state
  const signalDropRef = useRef<HTMLDivElement | null>(null);
  const cancelDropRef = useRef<HTMLDivElement | null>(null);
  const skillDragRef = useRef<{
    slot: 1 | 2 | 3 | 4 | 'spell';
    startX: number;
    startY: number;
    angle: number;
    dist: number;
    cancelHover: boolean;
    signalHover: boolean;
    moved: boolean;
  } | null>(null);
  const [activeAimSlot, setActiveAimSlot] = useState<1 | 2 | 3 | 4 | 'spell' | null>(null);
  const [cancelHover, setCancelHover] = useState(false);
  const [signalHover, setSignalHover] = useState(false);

  // Free camera pan state
  const panOriginRef = useRef<{ x: number; y: number } | null>(null);

  // Mount & start decoupled 60 FPS MlbbGameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new MlbbGameEngine(
      canvas,
      config,
      profile.settings,
      (nextSnap) => {
        setSnap(nextSnap);
      },
      (record) => {
        onMatchEnd(record);
      }
    );
    engineRef.current = engine;
    if (threeHostRef.current) engine.attachThreeContainer(threeHostRef.current);
    if (minimapRef.current) engine.attachMinimapCanvas(minimapRef.current);
    engine.start();
    return () => {
      if (pingHoldTimerRef.current !== null) window.clearTimeout(pingHoldTimerRef.current);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    engineRef.current?.attachMinimapCanvas(minimapRef.current);
  }, [snap !== null]);

  useEffect(() => {
    if (dragPingState?.popupOpen && pingPopupCanvasRef.current && !minimapExpanded) {
      engineRef.current?.attachExtraMinimapCanvas(pingPopupCanvasRef.current);
      return () => {
        engineRef.current?.attachExtraMinimapCanvas(null);
      };
    }
  }, [dragPingState?.popupOpen, minimapExpanded]);

  useEffect(() => {
    engineRef.current?.updateSettings(profile.settings);
  }, [profile.settings]);

  // Animate delayed catch-up HUD HP bar & detect skill cooldown completion pop
  useEffect(() => {
    if (!snap) return;
    const livePct = Math.max(0, Math.min(100, (snap.player.hp / Math.max(1, snap.player.maxHp)) * 100));
    setHudHpTrailPct((prev) => (livePct >= prev ? livePct : Math.max(livePct, prev - (prev - livePct) * 0.16 - 0.35)));

    const prevCds = prevSkillCdsRef.current;
    const now = Date.now();
    snap.skills.forEach((sk, i) => {
      if (prevCds[i] > 0.05 && sk.cd <= 0 && sk.level > 0) {
        setReadyPopSlots((p) => ({ ...p, [sk.slot]: now }));
      }
      prevCds[i] = sk.cd;
    });
  }, [snap]);

  // Desktop keyboard controls: WASD/Arrows Move, Q/E/R/V/X/F Skills & Spell, Space/Z/C Attacks, B/G/P/Tab/M/T/1-4
  useEffect(() => {
    const keys = new Set<string>();
    const syncMove = () => {
      let x = 0;
      let y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      engineRef.current?.setMoveVector(x, y);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keys.add(e.code);
        syncMove();
      } else if (e.code === 'Space') {
        e.preventDefault();
        engineRef.current?.setHoldingAttack(true, 'hero');
      } else if (e.code === 'KeyZ') {
        engineRef.current?.setHoldingAttack(true, 'minion');
      } else if (e.code === 'KeyC') {
        engineRef.current?.setHoldingAttack(true, 'turret');
      } else if (e.code === 'KeyM') {
        setMinimapExpanded((v) => !v);
      } else if (e.code === 'KeyQ') {
        if (e.altKey || e.shiftKey) engineRef.current?.signalSkillStatus(1);
        else engineRef.current?.castPlayerSkill(1);
      } else if (e.code === 'KeyE') {
        if (e.altKey || e.shiftKey) engineRef.current?.signalSkillStatus(2);
        else engineRef.current?.castPlayerSkill(2);
      } else if (e.code === 'KeyR') {
        if (e.altKey || e.shiftKey) engineRef.current?.signalSkillStatus(3);
        else engineRef.current?.castPlayerSkill(3);
      } else if (e.code === 'KeyV') {
        if (e.altKey || e.shiftKey) engineRef.current?.signalSkill4Status();
        else engineRef.current?.castPlayerSkill4();
      } else if (e.code === 'KeyX') {
        engineRef.current?.triggerActiveItem();
      } else if (e.code === 'KeyF') {
        if (e.altKey || e.shiftKey) engineRef.current?.signalSpellStatus();
        else engineRef.current?.castPlayerSpell();
      } else if (e.code === 'KeyB') {
        engineRef.current?.triggerRecall();
      } else if (e.code === 'KeyG') {
        engineRef.current?.triggerRegen();
      } else if (e.code === 'KeyP') {
        setShopOpen((v) => !v);
      } else if (e.code === 'Tab') {
        e.preventDefault();
        setScoreboardOpen((v) => !v);
      } else if (e.code === 'KeyT') {
        setEmoteWheelOpen((v) => !v);
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const idx = Number(e.code.replace('Digit', '')) - 1;
        const emId = profile.equippedEmotes[idx];
        if (emId) engineRef.current?.triggerEmote(emId);
      } else if (e.code === 'Escape') {
        if (minimapExpanded) setMinimapExpanded(false);
        else if (deathRecapOpen) setDeathRecapOpen(false);
        else if (chatDrawerOpen) setChatDrawerOpen(false);
        else setSettingsOpen((v) => !v);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keys.has(e.code)) {
        keys.delete(e.code);
        syncMove();
      } else if (e.code === 'Space') {
        engineRef.current?.setHoldingAttack(false, 'hero');
      } else if (e.code === 'KeyZ') {
        engineRef.current?.setHoldingAttack(false, 'minion');
      } else if (e.code === 'KeyC') {
        engineRef.current?.setHoldingAttack(false, 'turret');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [profile.equippedEmotes, minimapExpanded, deathRecapOpen, chatDrawerOpen]);

  const uiOpacity = Math.max(0.25, Math.min(1, profile.settings.interface.battlefieldUiOpacity / 100));
  const customLayout =
    profile.settings.interface.activeSkillPreset === '4skill'
      ? profile.settings.interface.customUi4Skill
      : profile.settings.interface.customUi3Skill;
  const isFloatingJoystick = profile.settings.controls.joystickPosition === 'floating';

  const playerBuilds = useMemo<[string[], string[], string[]]>(() => {
    const hero = getMlbbHeroById(config.playerHeroId);
    return (
      profile.savedBuilds[config.playerHeroId] ?? [
        hero.recommendedBuild,
        hero.recommendedBuild,
        hero.recommendedBuild
      ]
    );
  }, [config.playerHeroId, profile.savedBuilds]);

  const hasBargainHunter = config.playerTalents.t2 === 'bargain_hunter';

  const quickBuyItems = useMemo(() => {
    if (!snap) return [];
    const activePlan = playerBuilds[snap.player.activeBuildIdx] ?? playerBuilds[0];
    return computeMlbbQuickBuy(
      activePlan,
      snap.player.items,
      snap.player.gold,
      snap.player.prioritizedItemId,
      hasBargainHunter ? 0.05 : 0
    );
  }, [snap, playerBuilds, hasBargainHunter]);

  // Center-anchored HUD control helper (reads saved Custom UI layout coordinates, scale & opacity)
  const getCtrlStyle = (
    id: string,
    fallback: { xPct: number; yPct: number },
    aliasId?: string
  ): React.CSSProperties => {
    const cfg = customLayout[id] ?? (aliasId ? customLayout[aliasId] : undefined);
    const x = cfg?.xPct ?? fallback.xPct;
    const y = cfg?.yPct ?? fallback.yPct;
    const scale = cfg?.scale ?? 1;
    const op = (cfg?.opacity ?? 1) * uiOpacity;
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity: op
    };
  };

  // Top-left anchored HUD container helper (for minimap & quick-buy)
  const getTopLeftStyle = (id: string, fallback: { xPct: number; yPct: number }): React.CSSProperties => {
    const cfg = customLayout[id];
    const x = cfg?.xPct ?? fallback.xPct;
    const y = cfg?.yPct ?? fallback.yPct;
    const scale = cfg?.scale ?? 1;
    const op = (cfg?.opacity ?? 1) * uiOpacity;
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      opacity: op
    };
  };

  // Drag-aim handlers for skills (1/2/3/4) & Battle Spell with Cancel Zone + Drag-to-Signal CD drop zone
  const startSkillDrag = (
    e: React.PointerEvent,
    slot: 1 | 2 | 3 | 4 | 'spell',
    range: number,
    radius: number,
    shape: 'line' | 'circle' | 'cone' | 'ring' | 'self' | 'ally'
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    skillDragRef.current = {
      slot,
      startX: e.clientX,
      startY: e.clientY,
      angle: 0,
      dist: range * 0.65,
      cancelHover: false,
      signalHover: false,
      moved: false
    };
    setActiveAimSlot(slot);
    setCancelHover(false);
    setSignalHover(false);
    if (slot !== 4) {
      engineRef.current?.setAimPreview({ active: true, slot, range, radius, shape, cancelHover: false });
    }
  };

  const isInsideRect = (x: number, y: number, el: HTMLElement | null, pad = 12): boolean => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  };

  const moveSkillDrag = (e: React.PointerEvent, range: number) => {
    const drag = skillDragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const mag = Math.hypot(dx, dy);
    if (mag > 12) {
      drag.moved = true;
      drag.angle = Math.atan2(dy, dx);
      drag.dist = Math.min(range, (mag / 95) * range);
    }

    const inSignal = isInsideRect(e.clientX, e.clientY, signalDropRef.current, 14);
    const cancelMethod = profile.settings.controls.skillCancelMethod ?? 'drag_to_x';
    const inCancelRect = isInsideRect(e.clientX, e.clientY, cancelDropRef.current, 14);
    const inCancelDist = cancelMethod === 'drag_distance' && mag > 165 && !inSignal;
    const inCancel = !inSignal && (inCancelRect || inCancelDist);

    drag.signalHover = inSignal;
    drag.cancelHover = inCancel;
    setSignalHover(inSignal);
    setCancelHover(inCancel);
    if (drag.slot !== 4) {
      engineRef.current?.setAimPreview({ angle: drag.angle, dist: drag.dist, cancelHover: inCancel || inSignal });
    }
  };

  const endSkillDrag = () => {
    const drag = skillDragRef.current;
    skillDragRef.current = null;
    setActiveAimSlot(null);
    setCancelHover(false);
    setSignalHover(false);
    engineRef.current?.setAimPreview({ active: false, cancelHover: false });
    if (!drag) return;

    // Dropped onto 📡 Signal CD target -> broadcast Ready / remaining CD without casting!
    if (drag.signalHover) {
      if (drag.slot === 'spell') engineRef.current?.signalSpellStatus();
      else if (drag.slot === 4) engineRef.current?.signalSkill4Status();
      else engineRef.current?.signalSkillStatus(drag.slot);
      return;
    }

    if (drag.cancelHover) return;

    if (drag.slot === 'spell') {
      engineRef.current?.castPlayerSpell(drag.moved ? drag.angle : undefined);
    } else if (drag.slot === 4) {
      engineRef.current?.castPlayerSkill4();
    } else {
      engineRef.current?.castPlayerSkill(
        drag.slot,
        drag.moved ? drag.angle : undefined,
        drag.moved ? drag.dist : undefined
      );
    }
  };

  // Press-and-Hold Drag-to-Mark Tactical Ping handlers (140ms hold OR >10px drag opens Pop-Out Mini-Map!)
  const clearPingHoldTimer = () => {
    if (pingHoldTimerRef.current !== null) {
      window.clearTimeout(pingHoldTimerRef.current);
      pingHoldTimerRef.current = null;
    }
  };

  const startPingDrag = (e: React.PointerEvent, kind: 'attack' | 'retreat' | 'gather') => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    clearPingHoldTimer();
    const startMs = Date.now();
    setDragPingState({
      kind,
      startX: e.clientX,
      startY: e.clientY,
      startMs,
      popupOpen: false,
      reticleNorm: null,
      previewLabel: null,
      previewIcon: null,
      previewColor: null,
      snapped: false
    });
    pingHoldTimerRef.current = window.setTimeout(() => {
      setDragPingState((prev) => (prev ? { ...prev, popupOpen: true } : null));
    }, 140);
  };

  const movePingDrag = (e: React.PointerEvent) => {
    setDragPingState((prev) => {
      if (!prev) return null;
      const movedPx = Math.hypot(e.clientX - prev.startX, e.clientY - prev.startY);
      const elapsedMs = Date.now() - prev.startMs;
      const popupOpen = prev.popupOpen || classifyPingGesture(elapsedMs, movedPx) === 'drag';
      if (popupOpen && !prev.popupOpen) clearPingHoldTimer();

      let reticleNorm = prev.reticleNorm;
      let previewLabel: string | null = prev.previewLabel;
      let previewIcon: string | null = prev.previewIcon;
      let previewColor: string | null = prev.previewColor;
      let snapped = prev.snapped;

      const popup = pingPopupCanvasRef.current;
      if (popupOpen && popup) {
        const rect = popup.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          const rawNx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          const rawNy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
          const preview = engineRef.current?.previewDragPing(prev.kind, rawNx * WORLD_SIZE, rawNy * WORLD_SIZE);
          if (preview) {
            reticleNorm = {
              nx: Math.max(0, Math.min(1, preview.snappedX / WORLD_SIZE)),
              ny: Math.max(0, Math.min(1, preview.snappedY / WORLD_SIZE))
            };
            previewLabel = preview.label;
            previewIcon = preview.icon;
            previewColor = preview.color;
            snapped = preview.snapped;
          } else {
            reticleNorm = { nx: rawNx, ny: rawNy };
          }
        } else {
          reticleNorm = null;
          previewLabel = null;
          previewIcon = null;
          previewColor = null;
          snapped = false;
        }
      }
      return { ...prev, popupOpen, reticleNorm, previewLabel, previewIcon, previewColor, snapped };
    });
  };

  const endPingDrag = () => {
    clearPingHoldTimer();
    setDragPingState((prev) => {
      if (!prev) return null;
      if (prev.popupOpen && prev.reticleNorm) {
        engineRef.current?.dragPingToWorld(
          prev.kind,
          prev.reticleNorm.nx * WORLD_SIZE,
          prev.reticleNorm.ny * WORLD_SIZE
        );
      } else {
        engineRef.current?.sendTacticalPing(prev.kind);
      }
      return null;
    });
  };

  const cancelPingDrag = () => {
    clearPingHoldTimer();
    setDragPingState(null);
  };

  const handleSendCustomChat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customChatText.trim();
    if (!trimmed) return;
    engineRef.current?.sendQuickChat(trimmed);
    setCustomChatText('');
    setChatDrawerOpen(false);
  };

  // Virtual Joystick pointer handlers (shared by Fixed & Floating modes)
  const startJoystick = (e: React.PointerEvent, floating: boolean) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (floating) {
      joyOriginRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
      setFloatingJoyCenter({ x: e.clientX, y: e.clientY });
      setJoyKnob({ x: 0, y: 0, active: true });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      joyOriginRef.current = { x: cx, y: cy, pointerId: e.pointerId };
      setJoyKnob({ x: 0, y: 0, active: true });
    }
  };

  const moveJoystick = (e: React.PointerEvent) => {
    const orig = joyOriginRef.current;
    if (!orig || orig.pointerId !== e.pointerId) return;
    const dx = e.clientX - orig.x;
    const dy = e.clientY - orig.y;
    const maxR = 46;
    const mag = Math.hypot(dx, dy);
    const clamped = Math.min(maxR, mag);
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * clamped;
    const ky = Math.sin(ang) * clamped;
    setJoyKnob({ x: kx, y: ky, active: true });
    engineRef.current?.setMoveVector(kx / maxR, ky / maxR);
  };

  const endJoystick = (e: React.PointerEvent) => {
    if (joyOriginRef.current?.pointerId === e.pointerId) {
      joyOriginRef.current = null;
      setJoyKnob({ x: 0, y: 0, active: false });
      setFloatingJoyCenter(null);
      engineRef.current?.setMoveVector(0, 0);
    }
  };

  const is3D = snap?.rendererMode === '3d';
  const hpPct = snap ? Math.max(0, Math.min(100, (snap.player.hp / Math.max(1, snap.player.maxHp)) * 100)) : 100;
  const manaPct =
    snap && snap.player.resource !== 'none'
      ? Math.max(0, Math.min(100, (snap.player.mana / Math.max(1, snap.player.maxMana)) * 100))
      : 100;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060B18] select-none touch-none">
      {/* Live 60 FPS Three.js 3D WebGL Battlefield + Automatic 2D Canvas Fallback */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block ${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
      <div ref={threeHostRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Full-Area Invisible Upper-Right Free Camera Pan Layer (behind HUD buttons) */}
      {snap && activeAimSlot === null && !dragPingState && (
        <div
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            panOriginRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!panOriginRef.current) return;
            engineRef.current?.setFreeCameraOffset(
              e.clientX - panOriginRef.current.x,
              e.clientY - panOriginRef.current.y
            );
          }}
          onPointerUp={() => {
            panOriginRef.current = null;
            engineRef.current?.resetFreeCamera();
          }}
          onPointerCancel={() => {
            panOriginRef.current = null;
            engineRef.current?.resetFreeCamera();
          }}
          className="absolute top-14 right-14 w-[40%] h-[40%] z-10 cursor-grab active:cursor-grabbing touch-none"
          title="Drag anywhere in upper-right empty space to free-pan 3D camera"
        />
      )}

      {snap && (
        <>
          {/* ==================== TOP-LEFT: Interactive Minimap (Custom Layout Bound) + 4 Ally Ult Strips + Quick-Buy ==================== */}
          <div style={getTopLeftStyle('minimap', { xPct: 1.5, yPct: 2 })} className="absolute z-20 flex items-start gap-2">
            <div className="flex flex-col gap-1.5">
              <div className="relative rounded-xl overflow-hidden border-2 border-[#F5C451]/65 bg-[#0B132B] shadow-xl">
                <canvas
                  ref={minimapRef}
                  width={156}
                  height={156}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    const rect = e.currentTarget.getBoundingClientRect();
                    const wx = ((e.clientX - rect.left) / rect.width) * WORLD_SIZE;
                    const wy = ((e.clientY - rect.top) / rect.height) * WORLD_SIZE;
                    if (e.altKey) {
                      engineRef.current?.dragPingToWorld('attack', wx, wy);
                      return;
                    }
                    minimapDragRef.current = { startX: e.clientX, startY: e.clientY, dragged: false };
                    engineRef.current?.setMinimapCameraFocus(wx, wy);
                  }}
                  onPointerMove={(e) => {
                    const md = minimapDragRef.current;
                    if (!md) return;
                    if (Math.hypot(e.clientX - md.startX, e.clientY - md.startY) > 6) {
                      md.dragged = true;
                    }
                    const rect = e.currentTarget.getBoundingClientRect();
                    const wx = Math.max(0, Math.min(WORLD_SIZE, ((e.clientX - rect.left) / rect.width) * WORLD_SIZE));
                    const wy = Math.max(0, Math.min(WORLD_SIZE, ((e.clientY - rect.top) / rect.height) * WORLD_SIZE));
                    engineRef.current?.setMinimapCameraFocus(wx, wy);
                  }}
                  onPointerUp={(e) => {
                    const md = minimapDragRef.current;
                    minimapDragRef.current = null;
                    engineRef.current?.clearMinimapCameraFocus();
                    if (md && !md.dragged) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const wx = ((e.clientX - rect.left) / rect.width) * WORLD_SIZE;
                      const wy = ((e.clientY - rect.top) / rect.height) * WORLD_SIZE;
                      engineRef.current?.dragPingToWorld('gather', wx, wy);
                    }
                  }}
                  onPointerCancel={() => {
                    minimapDragRef.current = null;
                    engineRef.current?.clearMinimapCameraFocus();
                  }}
                  className="block cursor-crosshair touch-none"
                  title="Drag to scout camera · Tap or Alt+Click to ping"
                />
                <button
                  onClick={() => setMinimapExpanded((v) => !v)}
                  className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-[#F5C451]/65 text-[10px] font-black text-[#F5C451] cursor-pointer"
                  title="Open Expanded Tactical Map (M)"
                >
                  🔍 M
                </button>
              </div>

              {/* Live Gold + 2-Slot Quick-Buy Bar (Alt+Click signals gold needed!) */}
              <div
                style={{
                  transform: `scale(${customLayout.shopBar?.scale ?? 1})`,
                  transformOrigin: 'top left',
                  opacity: customLayout.shopBar?.opacity ?? 1
                }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={() => setShopOpen(true)}
                  className="h-11 px-2.5 rounded-xl bg-[#0B132B]/92 border border-[#F5C451]/60 text-xs font-black text-amber-300 flex items-center gap-1 cursor-pointer mlbb-num"
                  title="Open Equipment Shop (P)"
                >
                  <span>🛒</span>
                  <span>{snap.player.gold}</span>
                </button>
                {quickBuyItems.map((qb) => {
                  const itDef = getMlbbItemById(qb.id);
                  if (!itDef) return null;
                  return (
                    <button
                      key={qb.id}
                      onClick={(e) => {
                        if (e.altKey || e.shiftKey) {
                          engineRef.current?.signalItemNeed(qb.id);
                        } else {
                          engineRef.current?.buyItem(qb.id);
                        }
                      }}
                      className={`h-11 px-2 rounded-xl border text-[10px] font-black flex items-center gap-1 cursor-pointer ${
                        qb.canAfford
                          ? 'bg-amber-500/25 border-[#F5C451] text-white'
                          : 'bg-[#0B132B]/85 border-slate-700 text-slate-400'
                      }`}
                      title={`Quick-Buy ${itDef.name} (${qb.effectiveCost}g) · Alt+Click to ping gold needed`}
                    >
                      <span className="text-sm">{itDef.icon}</span>
                      <span className="mlbb-num">{qb.effectiveCost}g</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Ally Portrait Strips with Green Ult Readiness Dot & Death Spectate Click */}
            <div className="flex flex-col gap-1">
              {snap.teammates.map((ally) => {
                const isSpectating = !snap.player.alive && snap.spectateTargetId === ally.id;
                return (
                  <button
                    key={ally.id}
                    type="button"
                    onClick={() => {
                      if (!snap.player.alive && ally.alive) {
                        engineRef.current?.setSpectateTarget(ally.id);
                      }
                    }}
                    title={!snap.player.alive ? `Spectate ${ally.name}` : ally.name}
                    className={`relative flex items-center gap-1.5 px-1.5 py-1 rounded-lg bg-[#0B132B]/88 border text-left ${
                      isSpectating ? 'border-[#F5C451] ring-1 ring-[#F5C451]' : 'border-sky-400/40'
                    } ${!snap.player.alive && ally.alive ? 'cursor-pointer hover:border-amber-300' : 'cursor-default'}`}
                  >
                    <HeroPortraitSvg heroId={ally.heroId} size={24} />
                    <div className="w-12">
                      <div className="h-1.5 rounded bg-slate-900 overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${Math.round(ally.hpPct * 100)}%` }} />
                      </div>
                      <div className="text-[9px] text-slate-300 font-bold truncate">
                        {ally.alive ? ally.name : `${ally.respawnSec}s`}
                      </div>
                    </div>
                    <span
                      title={ally.ultReady ? 'Ultimate Ready' : 'Ultimate on Cooldown'}
                      className={`w-2.5 h-2.5 rounded-full border border-slate-950 ${
                        ally.ultReady ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================== TOP-CENTER: Score / Match Clock / HP+Mana Signaling / Surrender Vote / Announcer ==================== */}
          <div style={{ opacity: uiOpacity }} className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
            <button
              onClick={() => setScoreboardOpen(true)}
              className="pointer-events-auto px-4 py-1.5 rounded-2xl bg-[#0B132B]/92 backdrop-blur-sm border border-[#F5C451]/55 flex items-center gap-3 text-xs font-black cursor-pointer shadow-lg"
            >
              <span className="text-base text-sky-400 mlbb-num">{snap.blueKills}</span>
              <span className="text-slate-400">vs</span>
              <span className="text-base text-rose-400 mlbb-num">{snap.redKills}</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-[#F5C451] mlbb-num">
                {formatClock(snap.matchTimeSec)}
              </span>
              <span className="text-slate-200 mlbb-num">
                KDA {snap.player.kills}/{snap.player.deaths}/{snap.player.assists}
              </span>
              <span className="text-[10px] text-amber-300">📊</span>
            </button>

            {/* Clickable Player HP + Mana/Energy Strip (Click HP for Low HP Retreat, Click Mana for Low Mana!) */}
            <div className="pointer-events-auto w-60 px-2.5 py-1.5 rounded-xl bg-[#0B132B]/90 backdrop-blur-sm border border-slate-700/80 space-y-1 shadow-lg">
              <button
                type="button"
                onClick={() => engineRef.current?.signalLowHpStatus()}
                title="Click to broadcast Low HP Retreat signal to team"
                className="w-full text-left cursor-pointer group"
              >
                <div className="flex justify-between text-[10px] font-black mlbb-num mb-0.5">
                  <span className={hpPct < 25 ? 'text-rose-400 animate-pulse' : 'text-emerald-300 group-hover:text-white'}>
                    HP {snap.player.hp}/{snap.player.maxHp}
                    {snap.player.shield > 0 ? ` (+${snap.player.shield})` : ''}
                    {hpPct < 25 ? ' · 📡 TAP' : ''}
                  </span>
                  <span className="text-amber-300">Lv.{snap.player.level}</span>
                </div>
                <div className="relative h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-200 transition-all duration-150"
                    style={{ width: `${hudHpTrailPct}%` }}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 ${hpPct < 25 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              </button>

              {snap.player.resource !== 'none' && (
                <button
                  type="button"
                  onClick={() => engineRef.current?.signalLowManaStatus()}
                  title={`Click to broadcast Low ${snap.player.resource === 'energy' ? 'Energy' : 'Mana'} signal`}
                  className="w-full text-left cursor-pointer group"
                >
                  <div className="flex justify-between text-[9px] font-black mlbb-num mb-0.5">
                    <span
                      className={
                        manaPct < 25
                          ? 'text-sky-300 animate-pulse'
                          : snap.player.resource === 'energy'
                            ? 'text-amber-300/90 group-hover:text-white'
                            : 'text-sky-300/90 group-hover:text-white'
                      }
                    >
                      {snap.player.resource === 'energy' ? 'ENERGY' : 'MANA'} {snap.player.mana}/{snap.player.maxMana}
                      {manaPct < 25 ? ' · 📡 TAP' : ''}
                    </span>
                    <span className="text-slate-400">{Math.round(manaPct)}%</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 ${snap.player.resource === 'energy' ? 'bg-amber-400' : 'bg-sky-400'}`}
                      style={{ width: `${manaPct}%` }}
                    />
                  </div>
                </button>
              )}
            </div>

            {/* Battlefield Awareness Badges: Turret Lock-On Alert / Bush Stealth / Spotted Eye */}
            <div className="flex items-center gap-1.5">
              {snap.player.turretAlert === 'locked' && (
                <div className="px-3 py-0.5 rounded-lg bg-rose-600/95 border border-white text-[11px] font-black text-white animate-pulse">
                  ⚠ TURRET LOCKED ON YOU!
                </div>
              )}
              {snap.player.turretAlert === 'warn' && (
                <div className="px-2.5 py-0.5 rounded-lg bg-amber-500/90 border border-amber-200 text-[10px] font-black text-slate-950">
                  ⚠ NO MINIONS IN TURRET
                </div>
              )}
              {snap.player.inBush && (
                <div
                  className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black ${
                    snap.player.spottedByEnemy
                      ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                      : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  }`}
                >
                  {snap.player.spottedByEnemy ? '👁 SPOTTED IN BUSH!' : '🌿 HIDDEN IN BUSH'}
                </div>
              )}
            </div>

            {/* Animated 5-Slot Surrender Vote Bar (Non-Blocking) */}
            {snap.surrenderVote && snap.surrenderVote.active && (
              <SurrenderVoteBar vote={snap.surrenderVote} />
            )}

            {snap.announcer && (
              <div
                style={{ borderColor: snap.announcer.color }}
                className="px-6 py-2 rounded-2xl bg-[#0B132B]/95 border-2 text-center shadow-2xl"
              >
                <div className="text-sm font-black tracking-wider" style={{ color: snap.announcer.color }}>
                  {snap.announcer.text}
                </div>
                <div className="text-[11px] text-slate-200 font-bold">{snap.announcer.sub}</div>
              </div>
            )}

            {snap.objectiveBanner && (
              <div className="px-4 py-1 rounded-xl bg-amber-500/20 border border-[#F5C451] text-xs font-black text-[#F5C451]">
                🐉 {snap.objectiveBanner}
              </div>
            )}

            {/* Tactical Ping Callout Strip */}
            {snap.pingFeed.length > 0 && (
              <div className="flex flex-col items-center gap-0.5">
                {snap.pingFeed.slice(-2).map((pf) => (
                  <div
                    key={pf.id}
                    style={{ borderColor: pf.color }}
                    className="px-3 py-0.5 rounded-lg bg-[#080F24]/92 border text-[11px] font-black text-white shadow"
                  >
                    {pf.icon} {pf.text}
                  </div>
                ))}
              </div>
            )}

            {/* Live Tracked Enemy Battle Spell CD Timers (Clicked from Scoreboard) */}
            {snap.trackedEnemySpells && snap.trackedEnemySpells.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1">
                {snap.trackedEnemySpells.slice(0, 3).map((ts) => (
                  <div
                    key={ts.heroId}
                    className="px-2 py-0.5 rounded-lg bg-amber-950/88 border border-amber-400/70 text-[10px] font-black text-amber-200 mlbb-num shadow"
                  >
                    ⏱️ {ts.heroName} {ts.spellIcon} {ts.remainingSec}s
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==================== TOP-RIGHT UTILITY ROW: Ping/FPS, Scoreboard, Gear ==================== */}
          <div style={{ opacity: uiOpacity }} className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            {profile.settings.network.showPingFps && (
              <div className="px-2.5 py-1.5 rounded-lg bg-[#0B132B]/90 border border-slate-700 text-[10px] font-black text-emerald-300 mlbb-num">
                {snap.pingMs}ms · {snap.fps} FPS
              </div>
            )}
            <button
              onClick={() => setScoreboardOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#0B132B]/90 border border-slate-600 hover:border-[#F5C451] text-sm cursor-pointer"
              title="Scoreboard (Tab)"
            >
              📋
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#0B132B]/90 border border-[#F5C451]/60 hover:bg-amber-500/20 text-sm cursor-pointer"
              title="Settings (Esc)"
            >
              ⚙️
            </button>
          </div>

          {/* ==================== PART 3 STACKED RIGHT-EDGE VERTICAL SIGNAL STRIP ==================== */}
          <div
            style={{
              opacity: (customLayout.pings?.opacity ?? 1) * uiOpacity,
              transform: `scale(${customLayout.pings?.scale ?? 1})`,
              transformOrigin: 'top right'
            }}
            className="absolute top-14 right-2 z-20 flex items-start gap-2"
          >
            {/* Pop-Out Drag-to-Mark Tactical Mini-Map (Opens ONLY after 140ms hold OR >10px drag!) */}
            {dragPingState?.popupOpen && !minimapExpanded && (
              <div className="p-2 rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451] shadow-2xl flex flex-col items-center gap-1 pointer-events-none">
                <div
                  style={{ color: dragPingState.previewColor ?? '#F5C451' }}
                  className="text-[10px] font-black uppercase tracking-wider max-w-[200px] truncate text-center"
                >
                  {dragPingState.previewLabel
                    ? `${dragPingState.previewIcon ?? ''} ${dragPingState.previewLabel}`
                    : `Drag ${dragPingState.kind.toUpperCase()} Beacon to Target`}
                </div>
                <div className="relative rounded-xl overflow-hidden border border-sky-400/75 w-[200px] h-[200px]">
                  <canvas ref={pingPopupCanvasRef} width={200} height={200} className="w-full h-full block" />
                  {dragPingState.reticleNorm && (
                    <div
                      style={{
                        left: `${dragPingState.reticleNorm.nx * 100}%`,
                        top: `${dragPingState.reticleNorm.ny * 100}%`,
                        borderColor: dragPingState.snapped ? '#FACC15' : '#FFFFFF'
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm shadow-lg transition-transform ${
                        dragPingState.snapped ? 'bg-amber-500/45 scale-115' : 'bg-rose-500/35'
                      }`}
                    >
                      {dragPingState.previewIcon ??
                        (dragPingState.kind === 'attack' ? '⚔️' : dragPingState.kind === 'retreat' ? '🛡️' : '🎯')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Chat Drawer (with Quick Callouts + Live Custom Text Input!) */}
            {chatDrawerOpen && (
              <div className="w-64 p-2.5 rounded-2xl bg-[#0B132B]/96 backdrop-blur-sm border-2 border-[#F5C451]/60 shadow-2xl space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-[10px] font-black text-[#F5C451] uppercase">
                  <span>Team Tactical Chat</span>
                  <button
                    onClick={() => setChatDrawerOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-0.5">
                  {profile.quickChatIds.map((id) => {
                    const opt = MLBB_QUICK_CHAT_OPTIONS.find((q) => q.id === id);
                    if (!opt) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          engineRef.current?.sendQuickChat(opt.text);
                          setChatDrawerOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-left text-slate-100 font-bold cursor-pointer"
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                <form onSubmit={handleSendCustomChat} className="flex gap-1 pt-1 border-t border-slate-700/80">
                  <input
                    type="text"
                    value={customChatText}
                    onChange={(e) => setCustomChatText(e.target.value)}
                    placeholder="Type team message..."
                    maxLength={80}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-600 focus:border-[#F5C451] text-white text-[11px] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 font-black text-[10px] cursor-pointer"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* 4-Slot Radial Emote Wheel Menu */}
            {emoteWheelOpen && (
              <div className="p-2 rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451] grid grid-cols-2 gap-1.5 shadow-2xl">
                {profile.equippedEmotes.map((emId, idx) => {
                  const em = getMlbbEmoteById(emId);
                  return (
                    <button
                      key={idx}
                      disabled={snap.emoteCd > 0}
                      onClick={() => {
                        engineRef.current?.triggerEmote(em.id);
                        setEmoteWheelOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-amber-500/25 border border-slate-700 hover:border-[#F5C451] flex items-center gap-1.5 text-xs font-black text-white cursor-pointer"
                    >
                      <span className="text-lg">{em.icon}</span>
                      <span>{em.callout}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Drag-to-Signal Cooldown Drop Zone (Appears next to Chat Strip while dragging any Skill/Ult/Spell!) */}
            {activeAimSlot !== null && (
              <div className="flex flex-col items-end gap-2 mt-2">
                <div
                  ref={cancelDropRef}
                  className={`w-22 h-22 rounded-full border-2 flex flex-col items-center justify-center font-black text-[11px] transition-all shadow-2xl ${
                    cancelHover
                      ? 'bg-rose-600/95 border-white text-white scale-110'
                      : 'bg-rose-950/85 border-rose-400 text-rose-200'
                  }`}
                >
                  <span className="text-xl leading-none">✕</span>
                  <span>CANCEL</span>
                </div>
                <div
                  ref={signalDropRef}
                  className={`w-22 h-22 rounded-full border-2 flex flex-col items-center justify-center font-black text-[10px] text-center transition-all shadow-2xl ${
                    signalHover
                      ? 'bg-cyan-500/95 border-white text-slate-950 scale-110'
                      : 'bg-sky-950/90 border-cyan-400 text-cyan-200'
                  }`}
                >
                  <span className="text-xl leading-none">📡</span>
                  <span>SIGNAL CD</span>
                </div>
              </div>
            )}

            {/* Stacked Vertical Right-Edge Buttons: Attack, Retreat, Gather, Mic/Speaker, Chat, Emote */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onPointerDown={(e) => startPingDrag(e, 'attack')}
                onPointerMove={movePingDrag}
                onPointerUp={endPingDrag}
                onPointerCancel={cancelPingDrag}
                className="w-11 h-11 rounded-full bg-rose-900/92 border-2 border-rose-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
                title="Tap: Attack here · Hold & Drag (>140ms): Open Pop-Out Map to mark Enemy/Turret/Turtle"
              >
                ⚔️
              </button>
              <button
                onPointerDown={(e) => startPingDrag(e, 'retreat')}
                onPointerMove={movePingDrag}
                onPointerUp={endPingDrag}
                onPointerCancel={cancelPingDrag}
                className="w-11 h-11 rounded-full bg-amber-900/92 border-2 border-amber-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
                title="Tap: Retreat · Hold & Drag (>140ms): Warn Bush Ambush or Threat"
              >
                🛡️
              </button>
              <button
                onPointerDown={(e) => startPingDrag(e, 'gather')}
                onPointerMove={movePingDrag}
                onPointerUp={endPingDrag}
                onPointerCancel={cancelPingDrag}
                className="w-11 h-11 rounded-full bg-sky-900/92 border-2 border-sky-400 text-base font-black shadow-lg cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
                title="Tap: Gather · Hold & Drag (>140ms): Rally Allies to Objective/Lane"
              >
                🎯
              </button>

              <div className="flex items-center gap-1 pt-0.5">
                <button
                  onClick={() => setMicOn((v) => !v)}
                  className={`w-8 h-8 rounded-full border text-[11px] cursor-pointer flex items-center justify-center ${
                    micOn ? 'bg-emerald-700 border-emerald-400' : 'bg-[#0B132B]/90 border-slate-600'
                  }`}
                  title="Toggle Team Mic"
                >
                  {micOn ? '🎙️' : '🔇'}
                </button>
                <button
                  onClick={() => setSpeakerOn((v) => !v)}
                  className={`w-8 h-8 rounded-full border text-[11px] cursor-pointer flex items-center justify-center ${
                    speakerOn ? 'bg-sky-800 border-sky-400' : 'bg-[#0B132B]/90 border-slate-600'
                  }`}
                  title="Toggle Team Speaker"
                >
                  {speakerOn ? '🔊' : '🔈'}
                </button>
              </div>

              <button
                onClick={() => {
                  setEmoteWheelOpen(false);
                  setChatDrawerOpen((v) => !v);
                }}
                className={`w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 text-base cursor-pointer flex items-center justify-center ${
                  chatDrawerOpen ? 'border-[#F5C451] bg-amber-500/20' : 'border-slate-500'
                }`}
                title="Quick Chat & Custom Team Message"
              >
                💬
              </button>
              <button
                onClick={() => {
                  setChatDrawerOpen(false);
                  setEmoteWheelOpen((v) => !v);
                }}
                className={`w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 text-base cursor-pointer flex items-center justify-center ${
                  emoteWheelOpen ? 'border-white bg-amber-500/25' : 'border-[#F5C451]'
                }`}
                title="Hero Emote Wheel (T / 1-4)"
              >
                😄
              </button>
            </div>
          </div>

          {/* Live Compact Chat Feed */}
          {snap.chatFeed.length > 0 && (
            <div className="absolute left-3 bottom-44 z-10 pointer-events-none space-y-0.5 max-w-xs">
              {snap.chatFeed.slice(-3).map((c) => (
                <div key={c.id} className="px-2 py-0.5 rounded bg-slate-950/70 text-[11px] font-bold text-slate-100">
                  <span className={c.team === 'sys' ? 'text-amber-300' : 'text-sky-300'}>{c.sender}: </span>
                  {c.text}
                </div>
              ))}
            </div>
          )}

          {/* ==================== PRACTICE MODE CHEAT DRAWER + LIVE DPS METER ==================== */}
          {config.mode === 'practice' && (
            <div className="absolute left-2 top-54 z-30">
              <button
                onClick={() => setPracticeOpen((v) => !v)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-700 border border-emerald-400 text-[11px] font-black text-white cursor-pointer shadow-lg"
              >
                🛠️ Practice Console {practiceOpen ? '▾' : '▸'}
              </button>
              {practiceOpen && (
                <div className="mt-1 p-2 rounded-xl bg-[#0B132B]/95 border border-emerald-400/50 space-y-1.5 text-[10px] w-60 shadow-2xl">
                  {/* Live Training Dummy DPS Telemetry */}
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-400/35 grid grid-cols-2 gap-x-2 gap-y-1 mlbb-num">
                    <div>
                      <span className="text-slate-400">5s DPS: </span>
                      <span className="font-black text-[#F5C451]">{(snap.practiceCheats.dummyDps ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Peak Hit: </span>
                      <span className="font-black text-orange-300">{(snap.practiceCheats.dummyPeakBurst ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Hit: </span>
                      <span className="font-black text-sky-300">{(snap.practiceCheats.dummyLastHit ?? 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <span className="font-black text-emerald-300">{(snap.practiceCheats.dummyTotalDmg ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => engineRef.current?.practiceCheat('level')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-sky-300 cursor-pointer">+1 Level Up</button>
                    <button onClick={() => engineRef.current?.practiceCheat('max_level')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-sky-300 cursor-pointer">Max Lv.15</button>
                    <button onClick={() => engineRef.current?.practiceCheat('gold')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-300 cursor-pointer">+1,000 Gold</button>
                    <button onClick={() => engineRef.current?.practiceCheat('gold_10k')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-300 cursor-pointer">+10,000 Gold</button>
                    <button onClick={() => engineRef.current?.practiceCheat('no_cd')} className={`py-1.5 rounded font-black cursor-pointer ${snap.practiceCheats.noCooldown ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Zero CD</button>
                    <button onClick={() => engineRef.current?.practiceCheat('god_mode')} className={`py-1.5 rounded font-black cursor-pointer ${snap.practiceCheats.godMode ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'}`}>God Mode</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_dummy')} className="py-1.5 rounded bg-amber-900/70 hover:bg-amber-800 font-black text-amber-200 cursor-pointer">🎯 DPS Dummy</button>
                    <button onClick={() => engineRef.current?.practiceCheat('reset_dummy_dps')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-amber-200 cursor-pointer">↺ Reset DPS</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_normal_bot')} className="py-1.5 rounded bg-rose-900/70 hover:bg-rose-800 font-black text-rose-200 cursor-pointer">🤖 Spawn Bot</button>
                    <button onClick={() => engineRef.current?.practiceCheat('level_bot')} className="py-1.5 rounded bg-rose-950/80 hover:bg-rose-900 font-black text-rose-200 cursor-pointer">⬆ Level Bot</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_turtle')} className="py-1.5 rounded bg-emerald-900/70 hover:bg-emerald-800 font-black text-emerald-200 cursor-pointer">🐢 Spawn Turtle</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_lord')} className="py-1.5 rounded bg-orange-900/70 hover:bg-orange-800 font-black text-orange-200 cursor-pointer">🐉 Spawn Lord</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_wave')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-white cursor-pointer">Spawn Wave</button>
                    <button onClick={() => engineRef.current?.practiceCheat('clear_minions')} className="py-1.5 rounded bg-slate-800 hover:bg-slate-700 font-black text-slate-200 cursor-pointer">Clear Minions</button>
                    <button onClick={() => engineRef.current?.practiceCheat('spawn_jungle')} className="py-1.5 rounded bg-purple-900/70 hover:bg-purple-800 font-black text-purple-200 cursor-pointer">🐺 Spawn Jungle</button>
                    <button onClick={() => engineRef.current?.practiceCheat('turret_invincible')} className={`py-1.5 rounded font-black cursor-pointer ${snap.practiceCheats.turretsInvincible ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>🛡️ Inv. Turrets</button>
                    <button onClick={() => engineRef.current?.practiceCheat('reset_pos')} className="py-1.5 rounded bg-sky-900/80 hover:bg-sky-800 font-black text-sky-200 cursor-pointer">🌀 Reset Pos</button>
                    <button onClick={() => engineRef.current?.practiceCheat('end_win')} className="py-1.5 rounded bg-[#F5C451] text-slate-950 font-black cursor-pointer">🏆 End Win</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== BOTTOM-LEFT: Floating OR Fixed Multi-Touch Virtual Movement Joystick ==================== */}
          {isFloatingJoystick ? (
            <>
              <div
                onPointerDown={(e) => startJoystick(e, true)}
                onPointerMove={moveJoystick}
                onPointerUp={endJoystick}
                onPointerCancel={endJoystick}
                className="absolute left-0 bottom-0 w-[40%] h-[50%] z-20 touch-none cursor-pointer"
                title="Floating Joystick Zone (Touch & drag anywhere here, or use WASD/Arrows)"
              />
              <div
                style={
                  floatingJoyCenter
                    ? {
                        left: `${floatingJoyCenter.x}px`,
                        top: `${floatingJoyCenter.y}px`,
                        transform: `translate(-50%, -50%) scale(${customLayout.joystick?.scale ?? 1})`,
                        opacity: (customLayout.joystick?.opacity ?? 1) * uiOpacity
                      }
                    : {
                        ...getCtrlStyle('joystick', { xPct: 12, yPct: 78 }),
                        opacity: 0.38 * uiOpacity
                      }
                }
                className="fixed z-20 w-32 h-32 rounded-full bg-[#0B132B]/55 border-2 border-[#F5C451]/55 flex items-center justify-center pointer-events-none"
              >
                <div
                  style={{ transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)` }}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C451] to-[#B4781A] border-2 border-white shadow-lg"
                />
              </div>
            </>
          ) : (
            <div
              style={getCtrlStyle('joystick', { xPct: 12, yPct: 78 })}
              onPointerDown={(e) => startJoystick(e, false)}
              onPointerMove={moveJoystick}
              onPointerUp={endJoystick}
              onPointerCancel={endJoystick}
              className="absolute z-20 w-32 h-32 rounded-full bg-[#0B132B]/55 border-2 border-[#F5C451]/45 flex items-center justify-center touch-none cursor-pointer"
              title="Move Joystick (or WASD / Arrow Keys)"
            >
              <div
                style={{ transform: `translate(${joyKnob.x}px, ${joyKnob.y}px)` }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5C451] to-[#B4781A] border-2 border-white shadow-lg pointer-events-none"
              />
            </div>
          )}

          {/* ==================== BOTTOM-CENTER: SVG Radial Buff Clocks, Passive Stacks, Flying Cloud ==================== */}
          <div style={{ opacity: uiOpacity }} className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-1.5 pointer-events-none max-w-[44vw]">
            {snap.player.passiveStacks > 0 && (
              <div
                title={snap.player.passiveName}
                className="px-2 py-0.5 rounded-lg bg-[#0B132B]/92 border border-[#F5C451]/75 text-[10px] font-black text-[#F5C451] mlbb-num shadow"
              >
                ✨ {snap.player.passiveName} ×{snap.player.passiveStacks}
              </div>
            )}
            {snap.player.isJungler && (
              <div className="px-2 py-0.5 rounded-lg bg-purple-950/90 border border-purple-400 text-[10px] font-black text-purple-200 mlbb-num">
                ⚔️ Retri {snap.player.junglerStacks}/5
              </div>
            )}
            {snap.player.isRoamer && (
              <div className="px-2 py-0.5 rounded-lg bg-amber-950/90 border border-amber-400 text-[10px] font-black text-amber-200 mlbb-num">
                🛡️ Roam {snap.player.roamGold}/600g
              </div>
            )}
            {snap.activeBuffs.map((b) => (
              <BuffRadialBadge key={b.id} buff={b} />
            ))}
            {snap.player.nearFlyingCloud && (
              <button
                onClick={() => engineRef.current?.triggerFlyingCloud()}
                className="pointer-events-auto px-3 py-1 rounded-xl bg-purple-600 border-2 border-white text-xs font-black text-white cursor-pointer"
              >
                ☁️ LAUNCH CLOUD
              </button>
            )}
          </div>

          {/* ==================== BOTTOM-CENTER ACTION BUTTONS (Custom Layout Bound): Recall, Regen, Battle Spell ==================== */}
          <button
            onClick={() => engineRef.current?.triggerRecall()}
            style={getCtrlStyle('recall', { xPct: 43, yPct: 89 })}
            className={`absolute z-20 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black cursor-pointer shadow-lg ${
              snap.player.recalling ? 'bg-sky-600 border-white text-white animate-pulse' : 'bg-[#0B132B]/92 border-sky-400/70 text-sky-200'
            }`}
            title="Shielded Recall to Fountain (B) — Survives hits absorbed by Shield!"
          >
            <span className="text-base leading-none">🌀</span>
            <span className="text-[9px] mlbb-num">{snap.player.recalling ? `${Math.round(snap.player.recallProg * 100)}%` : 'B'}</span>
          </button>

          <button
            disabled={snap.regenCd > 0}
            onClick={() => engineRef.current?.triggerRegen()}
            style={getCtrlStyle('regen', { xPct: 50, yPct: 89 })}
            className={`absolute z-20 w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center text-xs font-black cursor-pointer shadow-lg ${
              snap.player.regening
                ? 'bg-emerald-600/90 border-white text-white'
                : 'bg-[#0B132B]/92 border-emerald-400/70 text-emerald-200'
            }`}
            title="Regen Heal (G) — Interrupted by incoming Hero/Turret damage"
          >
            <span className="text-base leading-none">💚</span>
            <span className="text-[9px] mlbb-num">{snap.regenCd > 0 ? `${Math.ceil(snap.regenCd)}s` : 'G'}</span>
          </button>

          <button
            onPointerDown={(e) => {
              if (e.altKey || e.shiftKey) {
                e.stopPropagation();
                engineRef.current?.signalSpellStatus();
                return;
              }
              startSkillDrag(e, 'spell', 420, 120, 'line');
            }}
            onPointerMove={(e) => moveSkillDrag(e, 420)}
            onPointerUp={endSkillDrag}
            style={{
              ...getCtrlStyle('spell', { xPct: 57, yPct: 89 }),
              borderColor: snap.spell.color
            }}
            className="absolute z-20 w-14 h-14 rounded-full bg-[#0B132B]/95 border-2 flex flex-col items-center justify-center text-xs font-black text-white cursor-pointer shadow-xl"
            title={`${snap.spell.name} (F) · Drag to 📡 Signal CD or Alt/Shift+Click`}
          >
            <span className="text-xl leading-none">{snap.spell.icon}</span>
            <span className="text-[9px] mlbb-num">{snap.spell.cd > 0 ? `${Math.ceil(snap.spell.cd)}s` : 'F'}</span>
          </button>

          {/* ==================== BOTTOM-RIGHT: Hero Lock, Curved Skill Arc (+ Arrows & Pop), Active Item, Basic/Minion/Turret ==================== */}
          {profile.settings.controls.heroLockMode && snap.nearbyEnemies.length > 0 && (
            <div className="absolute right-16 bottom-64 z-20 flex items-center gap-1.5">
              {snap.nearbyEnemies.map((en) => {
                const locked = snap.lockedTargetId === en.id;
                return (
                  <button
                    key={en.id}
                    onClick={() => {
                      mlbbAudio.playClick();
                      engineRef.current?.setLockedTarget(en.id);
                    }}
                    className={`relative p-1 rounded-full border-2 cursor-pointer transition-transform ${
                      locked ? 'border-rose-500 scale-110 bg-rose-950/85 ring-2 ring-rose-400/60' : 'border-slate-500 bg-[#0B132B]/85'
                    }`}
                    title={`Lock Target: ${en.name} (${Math.round(en.hpPct * 100)}% HP)`}
                  >
                    <HeroPortraitSvg heroId={en.heroId} size={34} />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 rounded bg-slate-950/90 text-[8px] font-black text-rose-300 mlbb-num">
                      {Math.round(en.hpPct * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Curved Skill Arc (S1, S2, Ultimate S3) with Yellow + Level-Up Arrows, Cooldown Pop & Drag-to-Signal */}
          {snap.skills.map((sk) => {
            const idKey = `skill${sk.slot}`;
            const fallback =
              sk.slot === 1
                ? { xPct: 73, yPct: 87 }
                : sk.slot === 2
                  ? { xPct: 79, yPct: 71 }
                  : { xPct: 89, yPct: 62 };
            const isPop = readyPopSlots[sk.slot] && Date.now() - readyPopSlots[sk.slot] < 900;
            return (
              <div key={sk.slot} style={getCtrlStyle(idKey, fallback)} className="absolute z-20 flex flex-col items-center">
                {sk.canUpgrade && (
                  <button
                    onClick={() => engineRef.current?.upgradePlayerSkill(sk.slot as 1 | 2 | 3)}
                    className="mb-1 w-8 h-8 rounded-full bg-[#F5C451] border-2 border-white text-slate-950 font-black text-base shadow-lg cursor-pointer animate-bounce"
                    title={`Level Up ${sk.name}`}
                  >
                    +
                  </button>
                )}
                <button
                  onPointerDown={(e) => {
                    if (e.altKey || e.shiftKey) {
                      e.stopPropagation();
                      engineRef.current?.signalSkillStatus(sk.slot as 1 | 2 | 3);
                      return;
                    }
                    if (sk.level <= 0) return;
                    startSkillDrag(e, sk.slot as 1 | 2 | 3, sk.range, sk.radius, sk.telegraph);
                  }}
                  onPointerMove={(e) => moveSkillDrag(e, sk.range)}
                  onPointerUp={endSkillDrag}
                  style={
                    {
                      borderColor: sk.recastActive ? '#FACC15' : sk.level > 0 ? sk.color : '#475569',
                      '--mlbb-pop-color': sk.color
                    } as React.CSSProperties
                  }
                  className={`relative w-16 h-16 rounded-full bg-[#0B132B]/94 border-2 flex flex-col items-center justify-center shadow-xl cursor-pointer ${
                    isPop ? 'mlbb-skill-ready-pop' : ''
                  } ${sk.level <= 0 ? 'opacity-50' : ''}`}
                  title={`${sk.name} (${sk.slot === 1 ? 'Q' : sk.slot === 2 ? 'E' : 'R'}) — Drag to Aim · Drag to 📡 Signal CD or Alt/Shift+Click`}
                >
                  <span className="text-2xl leading-none">{sk.icon}</span>
                  <span className="text-[9px] font-black text-slate-200 mt-0.5 mlbb-num">
                    {sk.level === 0 ? 'LOCK' : sk.cd > 0 ? `${sk.cd.toFixed(1)}s` : sk.recastActive ? 'RECAST' : sk.slot === 1 ? 'Q' : sk.slot === 2 ? 'E' : 'R'}
                  </span>
                  <div className="absolute -bottom-1.5 flex gap-0.5">
                    {Array.from({ length: sk.maxLevel }).map((_, pi) => (
                      <span
                        key={pi}
                        className={`w-1.5 h-1.5 rounded-full ${pi < sk.level ? 'bg-[#F5C451]' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </button>
              </div>
            );
          })}

          {/* 4th Skill Button for 4-Skill Heroes (Drag to 📡 Signal CD or Key V) */}
          {snap.extraSkill4 && (
            <button
              onPointerDown={(e) => {
                if (e.altKey || e.shiftKey) {
                  e.stopPropagation();
                  engineRef.current?.signalSkill4Status();
                  return;
                }
                startSkillDrag(e, 4, snap.extraSkill4!.range, snap.extraSkill4!.radius, 'circle');
              }}
              onPointerMove={(e) => moveSkillDrag(e, snap.extraSkill4!.range)}
              onPointerUp={endSkillDrag}
              style={{
                ...getCtrlStyle('skill4', { xPct: 72, yPct: 68 }),
                borderColor: snap.extraSkill4.color
              }}
              className="absolute z-20 w-14 h-14 rounded-full bg-[#0B132B]/95 border-2 flex flex-col items-center justify-center text-white font-black shadow-xl cursor-pointer"
              title={`${snap.extraSkill4.name} (V) · 4th Skill · Drag to 📡 Signal CD or Alt/Shift+Click`}
            >
              <span className="text-xl leading-none">{snap.extraSkill4.icon}</span>
              <span className="text-[9px] mlbb-num">
                {snap.extraSkill4.cd > 0 ? `${snap.extraSkill4.cd.toFixed(1)}s` : 'V'}
              </span>
            </button>
          )}

          {/* Active Equipment Button (Wind of Nature / Winter Crown / Conceal — Key X) */}
          {snap.activeItem && (
            <button
              onClick={() => engineRef.current?.triggerActiveItem()}
              style={getCtrlStyle('activeItem', { xPct: 64, yPct: 78 })}
              className="absolute z-20 w-13 h-13 rounded-full bg-[#0B132B]/95 border-2 border-[#F5C451] flex flex-col items-center justify-center text-white font-black cursor-pointer shadow-xl"
              title={`${snap.activeItem.name} (X)`}
            >
              <span className="text-lg leading-none">{snap.activeItem.icon}</span>
              <span className="text-[9px] mlbb-num">{snap.activeItem.cd > 0 ? `${Math.ceil(snap.activeItem.cd)}s` : 'X'}</span>
            </button>
          )}

          {/* Minion & Turret Advanced Targeting Buttons (Custom Layout Bound) */}
          {profile.settings.controls.targetingMethod === 'advanced' && (
            <>
              <button
                onPointerDown={() => engineRef.current?.setHoldingAttack(true, 'minion')}
                onPointerUp={() => engineRef.current?.setHoldingAttack(false, 'minion')}
                onPointerLeave={() => engineRef.current?.setHoldingAttack(false, 'minion')}
                style={getCtrlStyle('minionBtn', { xPct: 81, yPct: 91 })}
                className="absolute z-20 w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 border-emerald-400/80 text-sm font-black text-emerald-200 cursor-pointer shadow-lg"
                title="Attack Minions / Creeps (Z)"
              >
                👾
              </button>
              <button
                onPointerDown={() => engineRef.current?.setHoldingAttack(true, 'turret')}
                onPointerUp={() => engineRef.current?.setHoldingAttack(false, 'turret')}
                onPointerLeave={() => engineRef.current?.setHoldingAttack(false, 'turret')}
                style={getCtrlStyle('turretBtn', { xPct: 95, yPct: 73 })}
                className="absolute z-20 w-11 h-11 rounded-full bg-[#0B132B]/92 border-2 border-amber-400/80 text-sm font-black text-amber-200 cursor-pointer shadow-lg"
                title="Attack Turret (C)"
              >
                🏰
              </button>
            </>
          )}

          {/* Basic Attack Button (Custom Layout Bound to basicAtk) */}
          <button
            onPointerDown={() => engineRef.current?.setHoldingAttack(true, 'hero')}
            onPointerUp={() => engineRef.current?.setHoldingAttack(false, 'hero')}
            onPointerLeave={() => engineRef.current?.setHoldingAttack(false, 'hero')}
            style={getCtrlStyle('basicAtk', { xPct: 89, yPct: 84 }, 'basic_atk')}
            className="absolute z-20 w-20 h-20 rounded-full bg-[#F5C451] bg-gradient-to-br from-[#F5C451] to-[#B45309] border-4 border-amber-100 text-slate-950 font-black text-xs flex flex-col items-center justify-center shadow-2xl active:scale-95 cursor-pointer"
            title="Basic Attack (Space)"
          >
            <span className="text-2xl leading-none">⚔️</span>
            <span className="text-[10px]">ATTACK</span>
          </button>

          {/* Respawn Countdown Banner + Death Damage Recap + Spectate Hint */}
          {!snap.player.alive && (
            <div className="fixed inset-x-0 top-24 z-30 flex justify-center pointer-events-none">
              <div className="pointer-events-auto px-5 py-2.5 rounded-2xl bg-rose-950/92 border-2 border-rose-500 text-center flex flex-col items-center gap-1.5 shadow-2xl">
                <div className="text-sm font-black text-rose-200">YOU HAVE BEEN SLAIN</div>
                <div className="text-xs text-white font-bold mlbb-num">
                  Respawning in {snap.player.respawnSec}s · Click any ally portrait (top-left) to spectate
                </div>
                {snap.player.deathRecap && (
                  <button
                    onClick={() => setDeathRecapOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 font-black text-xs cursor-pointer"
                  >
                    📊 Death Recap ({snap.player.deathRecap.totalDamage.toLocaleString()} DMG · {(snap.player.deathRecap.totalCcSec ?? 0).toFixed(1)}s CC)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Modals: Expanded Tactical Minimap (M), Death Damage Recap, Shop, Translucent Scoreboard, 7-Tab Settings */}
          {minimapExpanded && (
            <ExpandedMinimap
              engine={engineRef.current}
              playerPos={{ x: snap.player.x, y: snap.player.y }}
              onClose={() => setMinimapExpanded(false)}
            />
          )}

          {deathRecapOpen && snap.player.deathRecap && (
            <DeathRecapModal
              recap={snap.player.deathRecap}
              respawnSec={snap.player.respawnSec}
              onOpenShop={() => setShopOpen(true)}
              onClose={() => setDeathRecapOpen(false)}
            />
          )}

          {shopOpen && (
            <InMatchShopModal
              snap={snap}
              builds={playerBuilds}
              uiOpacity={uiOpacity}
              hasBargainHunter={hasBargainHunter}
              onBuy={(id) => engineRef.current?.buyItem(id)}
              onSell={(idx) => engineRef.current?.sellItem(idx)}
              onPrioritize={(id) => engineRef.current?.prioritizeItem(id)}
              onSwitchBuild={(idx) => engineRef.current?.switchBuildPreset(idx, playerBuilds[idx])}
              onPingNeedGold={(id) => engineRef.current?.pingNeedGoldForItem(id)}
              onClose={() => setShopOpen(false)}
            />
          )}

          {scoreboardOpen && (
            <InMatchScoreboardModal
              snap={snap}
              uiOpacity={uiOpacity}
              onSignalTarget={(heroId, kind) => engineRef.current?.signalScoreboardTarget(heroId, kind)}
              onClose={() => setScoreboardOpen(false)}
            />
          )}

          {settingsOpen && (
            <SettingsAndCustomUiModal
              settings={profile.settings}
              inMatch
              surrenderAvailable={snap.surrenderAvailable}
              onUpdateSettings={onUpdateSettings}
              onSurrender={() => {
                engineRef.current?.initiateSurrender();
                setSettingsOpen(false);
              }}
              onExitMatch={onExitToLobby}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};
