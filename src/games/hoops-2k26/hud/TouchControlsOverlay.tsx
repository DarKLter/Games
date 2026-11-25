// ============================================================================
// PART 5 — DUAL-STICK MOBILE & DESKTOP-TOGGLEABLE VIRTUAL TOUCH CONTROLS
// - Bottom-Left Floating Virtual Analog Stick with outer Sprint Ring auto-lock
// - Bottom-Right Context-Aware Offense <-> Defense Action Pads:
//   * Offense: Giant dual-mode SHOOT / PRO-STICK pad (Hold to shoot OR drag
//     Down->Up right on the pad for 2K26 Rhythm Shooting!), PASS (Tap=Chest,
//     Swipe-Down=Bounce, Double-Tap=Wrap), DRIBBLE/PROTECT, SCREEN (PnR + Flip),
//     ICON PASS, ALLEY-OOP, glowing TAKEOVER button when full.
//   * Defense: BLOCK/REB, STEAL, SWITCH, INTENSE-D, HANDS-UP.
// - Every control binds { x, y, scale, opacity } from settings.controller.customHudLayout
// ============================================================================

import React, { useRef, useState } from 'react';
import type { CustomHudLayoutMap, HudControlLayoutRect } from '../hybrid/types';
import type { PickAndRollState } from '../engine/SimTacticsAndReplay';

export interface TouchControlsOverlayProps {
  visible: boolean;
  isOffense: boolean;
  takeoverReady: boolean;
  pickAndRoll: PickAndRollState;
  customHudLayout: CustomHudLayoutMap;
  onStickChange: (rawRight: number, rawForward: number, sprintLocked: boolean) => void;
  onHoldStateChange: (
    patch: Partial<{ shoot: boolean; protect: boolean; sprint: boolean; handsUp: boolean }>
  ) => void;
  onRhythmDown: () => void;
  onRhythmFlickUp: (velocityNorm: number) => void;
  onPass: (kind: 'CHEST' | 'BOUNCE' | 'WRAP') => void;
  onDribble: (move: 'CROSSOVER' | 'STEPBACK') => void;
  onCallScreen: () => void;
  onFlipScreenAngle: () => void;
  onToggleScreenAction: () => void;
  onToggleIconPass: () => void;
  onAlleyOop: () => void;
  onIgniteTakeover: () => void;
  onBlockOrRebound: () => void;
  onSteal: () => void;
  onSwitchDefender: () => void;
}

function getLayoutStyle(
  layout: CustomHudLayoutMap,
  key: string
): React.CSSProperties {
  const rect: HudControlLayoutRect | undefined = layout[key];
  if (!rect) return {};
  const x = Number.isFinite(rect.x) ? rect.x : 0;
  const y = Number.isFinite(rect.y) ? rect.y : 0;
  const scale = Number.isFinite(rect.scale) ? Math.max(0.5, Math.min(1.5, rect.scale)) : 1;
  const opacity = Number.isFinite(rect.opacity) ? Math.max(0.2, Math.min(1, rect.opacity)) : 0.92;
  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    opacity,
  };
}

export const TouchControlsOverlay: React.FC<TouchControlsOverlayProps> = ({
  visible,
  isOffense,
  takeoverReady,
  pickAndRoll,
  customHudLayout,
  onStickChange,
  onHoldStateChange,
  onRhythmDown,
  onRhythmFlickUp,
  onPass,
  onDribble,
  onCallScreen,
  onFlipScreenAngle,
  onToggleScreenAction,
  onToggleIconPass,
  onAlleyOop,
  onIgniteTakeover,
  onBlockOrRebound,
  onSteal,
  onSwitchDefender,
}) => {
  // Bottom-Left Virtual Analog Stick state
  const stickZoneRef = useRef<HTMLDivElement | null>(null);
  const stickPointerIdRef = useRef<number | null>(null);
  const stickCenterRef = useRef({ x: 0, y: 0 });
  const [knobOffset, setKnobOffset] = useState({ x: 0, y: 0, sprinting: false });

  // Dual-mode SHOOT / PRO-STICK gesture state
  const shootDragRef = useRef<{
    pointerId: number | null;
    startY: number;
    lastY: number;
    lastTs: number;
    rhythmArmed: boolean;
  }>({ pointerId: null, startY: 0, lastY: 0, lastTs: 0, rhythmArmed: false });
  const [rhythmVisual, setRhythmVisual] = useState<'IDLE' | 'HOLD' | 'PULL_DOWN' | 'FLICK_UP'>('IDLE');

  // Pass gesture (Tap = Chest, Swipe-Down = Bounce, Double-Tap = Wrap)
  const passGestureRef = useRef<{ startY: number; lastTapTs: number }>({
    startY: 0,
    lastTapTs: 0,
  });

  // Dribble / Quick Protect hold vs tap
  const dribbleHoldTimerRef = useRef<number | null>(null);
  const dribbleHeldProtectRef = useRef(false);

  if (!visible) return null;

  const STICK_MAX_R = 46;

  const handleStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = stickZoneRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    stickPointerIdRef.current = e.pointerId;
    const rect = el.getBoundingClientRect();
    stickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    updateStickFromPoint(e.clientX, e.clientY);
  };

  const updateStickFromPoint = (clientX: number, clientY: number) => {
    const dx = clientX - stickCenterRef.current.x;
    const dy = clientY - stickCenterRef.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(STICK_MAX_R, dist);
    const ang = Math.atan2(dy, dx);
    const nx = dist > 6 ? (Math.cos(ang) * clamped) / STICK_MAX_R : 0;
    const ny = dist > 6 ? (Math.sin(ang) * clamped) / STICK_MAX_R : 0;
    const sprintLocked = dist >= STICK_MAX_R * 0.78;

    setKnobOffset({
      x: Math.cos(ang) * clamped,
      y: Math.sin(ang) * clamped,
      sprinting: sprintLocked,
    });
    // Forward is -ny (dragging up on screen)
    onStickChange(nx, -ny, sprintLocked);
  };

  const handleStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    updateStickFromPoint(e.clientX, e.clientY);
  };

  const handleStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    e.stopPropagation();
    stickPointerIdRef.current = null;
    setKnobOffset({ x: 0, y: 0, sprinting: false });
    onStickChange(0, 0, false);
  };

  // Giant Dual-Mode SHOOT / PRO-STICK Pad Handlers
  const handleShootDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    shootDragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      lastY: e.clientY,
      lastTs: performance.now(),
      rhythmArmed: false,
    };
    setRhythmVisual('HOLD');
    onHoldStateChange({ shoot: true });
  };

  const handleShootMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = shootDragRef.current;
    if (st.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const dy = e.clientY - st.startY;

    if (!st.rhythmArmed && dy > 20) {
      // Transition cleanly from button hold into 2K26 Rhythm Shooting!
      st.rhythmArmed = true;
      setRhythmVisual('PULL_DOWN');
      onHoldStateChange({ shoot: false });
      onRhythmDown();
    } else if (st.rhythmArmed && e.clientY < st.lastY - 14) {
      const dtMs = Math.max(12, performance.now() - st.lastTs);
      const vel = Math.min(2.0, (Math.abs(st.lastY - e.clientY) / dtMs) * 1.15);
      st.rhythmArmed = false;
      st.pointerId = null;
      setRhythmVisual('FLICK_UP');
      onRhythmFlickUp(vel);
      window.setTimeout(() => setRhythmVisual('IDLE'), 220);
      return;
    }
    st.lastY = e.clientY;
    st.lastTs = performance.now();
  };

  const handleShootUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const st = shootDragRef.current;
    if (st.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (st.rhythmArmed) {
      onRhythmFlickUp(1.0);
    } else {
      onHoldStateChange({ shoot: false });
    }
    st.pointerId = null;
    st.rhythmArmed = false;
    setRhythmVisual('IDLE');
  };

  // PASS button: Tap = Chest, Swipe-Down = Bounce, Double-Tap = Wrap
  const handlePassDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    passGestureRef.current.startY = e.clientY;
  };

  const handlePassUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const dy = e.clientY - passGestureRef.current.startY;
    if (dy > 20) {
      onPass('BOUNCE');
      return;
    }
    const now = performance.now();
    if (now - passGestureRef.current.lastTapTs < 320) {
      passGestureRef.current.lastTapTs = 0;
      onPass('WRAP');
    } else {
      passGestureRef.current.lastTapTs = now;
      onPass('CHEST');
    }
  };

  // DRIBBLE / PROTECT button: Tap = Crossover, Hold > 180ms = Quick Protect
  const handleDribbleDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dribbleHeldProtectRef.current = false;
    if (dribbleHoldTimerRef.current) window.clearTimeout(dribbleHoldTimerRef.current);
    dribbleHoldTimerRef.current = window.setTimeout(() => {
      dribbleHeldProtectRef.current = true;
      onHoldStateChange({ protect: true });
    }, 180);
  };

  const handleDribbleUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (dribbleHoldTimerRef.current) {
      window.clearTimeout(dribbleHoldTimerRef.current);
      dribbleHoldTimerRef.current = null;
    }
    if (dribbleHeldProtectRef.current) {
      onHoldStateChange({ protect: false });
    } else {
      onDribble('CROSSOVER');
    }
    dribbleHeldProtectRef.current = false;
  };

  return (
    <div className="p5-touch-overlay" aria-label="Virtual Dual-Stick Touch Controls">
      {/* BOTTOM-LEFT: FLOATING VIRTUAL ANALOG LEFT STICK + OUTER SPRINT RING */}
      <div
        ref={stickZoneRef}
        className={`p5-stick-ring ${knobOffset.sprinting ? 'sprinting' : ''}`}
        style={getLayoutStyle(customHudLayout, 'left_stick')}
        onPointerDown={handleStickDown}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickUp}
        onPointerCancel={handleStickUp}
      >
        <span className="p5-stick-sprint-lbl">
          {knobOffset.sprinting ? '⚡ SPRINT LOCK' : 'MOVE · EDGE SPRINT'}
        </span>
        <div
          className="p5-stick-knob"
          style={{
            transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
          }}
        />
      </div>

      {/* BOTTOM-RIGHT: CONTEXT-AWARE OFFENSE <-> DEFENSE PADS */}
      <div className="p5-touch-right-cluster">
        {isOffense ? (
          <>
            {takeoverReady && (
              <button
                type="button"
                className="p5-touch-btn takeover"
                style={getLayoutStyle(customHudLayout, 'takeover_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onIgniteTakeover();
                }}
              >
                🔥 TAKEOVER
              </button>
            )}

            <div className="p5-touch-top-row">
              <button
                type="button"
                className="p5-touch-btn sm"
                style={getLayoutStyle(customHudLayout, 'icon_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onToggleIconPass();
                }}
              >
                ICONS
              </button>
              <button
                type="button"
                className="p5-touch-btn sm accent"
                style={getLayoutStyle(customHudLayout, 'oop_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onAlleyOop();
                }}
              >
                ALLEY-OOP
              </button>
              <button
                type="button"
                className={`p5-touch-btn sm ${pickAndRoll.active ? 'active' : ''}`}
                style={getLayoutStyle(customHudLayout, 'screen_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (pickAndRoll.active) {
                    onFlipScreenAngle();
                  } else {
                    onCallScreen();
                  }
                }}
              >
                {pickAndRoll.active ? `FLIP ${pickAndRoll.angleDeg}°` : 'SCREEN'}
              </button>
              {pickAndRoll.active && (
                <button
                  type="button"
                  className="p5-touch-btn sm"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onToggleScreenAction();
                  }}
                >
                  {pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL'}
                </button>
              )}
            </div>

            <div className="p5-touch-main-row">
              <button
                type="button"
                className="p5-touch-btn med"
                style={getLayoutStyle(customHudLayout, 'dribble_btn')}
                onPointerDown={handleDribbleDown}
                onPointerUp={handleDribbleUp}
                onPointerCancel={handleDribbleUp}
              >
                <strong>DRIBBLE</strong>
                <small>HOLD PROTECT</small>
              </button>

              <button
                type="button"
                className="p5-touch-btn med pass"
                style={getLayoutStyle(customHudLayout, 'pass_btn')}
                onPointerDown={handlePassDown}
                onPointerUp={handlePassUp}
              >
                <strong>PASS</strong>
                <small>↓BNC · 2xWRAP</small>
              </button>

              {/* GIANT DUAL-MODE SHOOT / PRO-STICK RHYTHM PAD */}
              <button
                type="button"
                className={`p5-touch-btn shoot-pad state-${rhythmVisual.toLowerCase()}`}
                style={getLayoutStyle(customHudLayout, 'shoot_pad')}
                onPointerDown={handleShootDown}
                onPointerMove={handleShootMove}
                onPointerUp={handleShootUp}
                onPointerCancel={handleShootUp}
              >
                <span className="p5-rhythm-arrow">
                  {rhythmVisual === 'PULL_DOWN'
                    ? '⬆ FLICK UP!'
                    : rhythmVisual === 'FLICK_UP'
                      ? '✨ TEMPO!'
                      : '↕ PRO-STICK'}
                </span>
                <strong>SHOOT</strong>
                <small>HOLD OR ↓→↑</small>
              </button>
            </div>
          </>
        ) : (
          /* DEFENSE CONTEXT-AWARE PADS */
          <>
            <div className="p5-touch-top-row">
              <button
                type="button"
                className="p5-touch-btn sm"
                style={getLayoutStyle(customHudLayout, 'switch_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSwitchDefender();
                }}
              >
                SWITCH
              </button>
              <button
                type="button"
                className="p5-touch-btn sm"
                style={getLayoutStyle(customHudLayout, 'handsup_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onHoldStateChange({ handsUp: true });
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  onHoldStateChange({ handsUp: false });
                }}
                onPointerLeave={() => onHoldStateChange({ handsUp: false })}
              >
                HANDS-UP
              </button>
              <button
                type="button"
                className="p5-touch-btn sm"
                style={getLayoutStyle(customHudLayout, 'intense_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onHoldStateChange({ protect: true });
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  onHoldStateChange({ protect: false });
                }}
                onPointerLeave={() => onHoldStateChange({ protect: false })}
              >
                INTENSE-D
              </button>
            </div>

            <div className="p5-touch-main-row">
              <button
                type="button"
                className="p5-touch-btn med"
                style={getLayoutStyle(customHudLayout, 'steal_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSteal();
                }}
              >
                <strong>STEAL</strong>
                <small>GLOVE / LANE</small>
              </button>

              <button
                type="button"
                className="p5-touch-btn shoot-pad def-block"
                style={getLayoutStyle(customHudLayout, 'block_btn')}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onBlockOrRebound();
                }}
              >
                <span className="p5-rhythm-arrow">🛡 RIM</span>
                <strong>BLK / REB</strong>
                <small>TAP JUMP</small>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
