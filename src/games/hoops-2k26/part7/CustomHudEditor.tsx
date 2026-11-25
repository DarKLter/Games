// ============================================================================
// PART 7 — LIVE DRAG-AND-DROP CUSTOM TOUCH HUD EDITOR
// - Full-screen overlay over the live 3D court (or 3D Menu arena preview)
// - All 14 movable touch controls: Left Joystick, Shoot/Pro-Stick, Pass,
//   Dribble/Protect, Screen, Icon Pass, Alley-Oop, Takeover, Block/Reb,
//   Steal, Switch, Intense-D, Tactics, Mini Radar
// - Drag with mouse or touch, tap to select, tune Scale (50%–150%) & Opacity (20%–100%)
// - 3 Layout Presets (Classic 2K, Claw Pro, Compact One-Hand) + Reset + Save & Exit
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import type { CustomHudLayoutMap, HudControlLayoutRect, HudPresetId, UIEraMode } from '../hybrid/types';
import { createDefaultCustomHudLayout, createPresetCustomHudLayout } from '../hybrid/store';

export interface HudEditorNodeMeta {
  key: string;
  label: string;
  sub: string;
  baseLeftPct: number;
  baseTopPct: number;
  width: number;
  height: number;
  shape: 'circle' | 'rect';
  accent: string;
}

export const HUD_EDITOR_NODES: HudEditorNodeMeta[] = [
  { key: 'left_stick', label: 'MOVE', sub: 'L-STICK', baseLeftPct: 12, baseTopPct: 72, width: 92, height: 92, shape: 'circle', accent: '#38bdf8' },
  { key: 'shoot_pad', label: 'SHOOT', sub: 'PRO-STICK', baseLeftPct: 86, baseTopPct: 72, width: 88, height: 88, shape: 'circle', accent: '#ef4444' },
  { key: 'pass_btn', label: 'PASS', sub: 'CHEST/BNC', baseLeftPct: 74, baseTopPct: 82, width: 64, height: 64, shape: 'circle', accent: '#22c55e' },
  { key: 'dribble_btn', label: 'DRIBBLE', sub: 'PROTECT', baseLeftPct: 73, baseTopPct: 62, width: 62, height: 62, shape: 'circle', accent: '#f59e0b' },
  { key: 'screen_btn', label: 'SCREEN', sub: 'PNR', baseLeftPct: 86, baseTopPct: 48, width: 58, height: 58, shape: 'circle', accent: '#a855f7' },
  { key: 'icon_btn', label: 'ICON', sub: 'PASS', baseLeftPct: 63, baseTopPct: 73, width: 54, height: 54, shape: 'circle', accent: '#06b6d4' },
  { key: 'oop_btn', label: 'ALLEY', sub: 'OOP', baseLeftPct: 74, baseTopPct: 44, width: 54, height: 54, shape: 'circle', accent: '#f97316' },
  { key: 'takeover_btn', label: 'TAKE', sub: 'OVER', baseLeftPct: 62, baseTopPct: 54, width: 56, height: 56, shape: 'circle', accent: '#facc15' },
  { key: 'block_btn', label: 'BLK/REB', sub: 'DEF', baseLeftPct: 88, baseTopPct: 28, width: 58, height: 58, shape: 'circle', accent: '#3b82f6' },
  { key: 'steal_btn', label: 'STEAL', sub: 'DEF', baseLeftPct: 78, baseTopPct: 28, width: 56, height: 56, shape: 'circle', accent: '#ec4899' },
  { key: 'switch_btn', label: 'SWITCH', sub: 'DEF', baseLeftPct: 68, baseTopPct: 28, width: 56, height: 56, shape: 'circle', accent: '#14b8a6' },
  { key: 'intense_btn', label: 'INTENSE', sub: 'CLAMPS', baseLeftPct: 58, baseTopPct: 28, width: 58, height: 58, shape: 'circle', accent: '#8b5cf6' },
  { key: 'tactics_btn', label: 'TACTICS', sub: 'D-PAD', baseLeftPct: 14, baseTopPct: 24, width: 88, height: 42, shape: 'rect', accent: '#f59e0b' },
  { key: 'radar_panel', label: 'MINI RADAR', sub: 'COURT MAP', baseLeftPct: 50, baseTopPct: 16, width: 112, height: 54, shape: 'rect', accent: '#38bdf8' },
];

export interface CustomHudEditorProps {
  uiEraMode: UIEraMode;
  initialLayout: CustomHudLayoutMap;
  liveCourtBackdrop?: boolean;
  onSaveAndExit: (layout: CustomHudLayoutMap) => void;
  onCancel: () => void;
}

function cloneLayout(src: CustomHudLayoutMap): CustomHudLayoutMap {
  const base = createDefaultCustomHudLayout();
  const out: CustomHudLayoutMap = { ...base };
  const keys = Object.keys(src || {});
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (src[k]) {
      out[k] = {
        x: Number.isFinite(src[k].x) ? src[k].x : 0,
        y: Number.isFinite(src[k].y) ? src[k].y : 0,
        scale: Number.isFinite(src[k].scale) ? Math.max(0.5, Math.min(1.5, src[k].scale)) : 1,
        opacity: Number.isFinite(src[k].opacity) ? Math.max(0.2, Math.min(1, src[k].opacity)) : 0.92,
      };
    }
  }
  return out;
}

export const CustomHudEditor: React.FC<CustomHudEditorProps> = ({
  uiEraMode,
  initialLayout,
  liveCourtBackdrop = true,
  onSaveAndExit,
  onCancel,
}) => {
  const [draft, setDraft] = useState<CustomHudLayoutMap>(() => cloneLayout(initialLayout));
  const [selectedKey, setSelectedKey] = useState<string>('shoot_pad');
  const [activePreset, setActivePreset] = useState<HudPresetId | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const dragRef = useRef<{
    key: string;
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = Math.round(clientX - d.startClientX);
      const dy = Math.round(clientY - d.startClientY);
      const nextX = Math.max(-260, Math.min(260, d.origX + dx));
      const nextY = Math.max(-260, Math.min(260, d.origY + dy));
      setDraft((prev) => ({
        ...prev,
        [d.key]: {
          ...(prev[d.key] ?? { x: 0, y: 0, scale: 1, opacity: 0.92 }),
          x: nextX,
          y: nextY,
        },
      }));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!dragRef.current || e.touches.length === 0) return;
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  const startDrag = (key: string, clientX: number, clientY: number) => {
    setSelectedKey(key);
    setActivePreset(null);
    const rect = draft[key] ?? { x: 0, y: 0, scale: 1, opacity: 0.92 };
    dragRef.current = {
      key,
      startClientX: clientX,
      startClientY: clientY,
      origX: rect.x,
      origY: rect.y,
    };
  };

  const selectedMeta =
    HUD_EDITOR_NODES.find((n) => n.key === selectedKey) ?? HUD_EDITOR_NODES[0];
  const selectedRect: HudControlLayoutRect = draft[selectedKey] ?? {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0.92,
  };

  const updateSelected = (patch: Partial<HudControlLayoutRect>) => {
    setActivePreset(null);
    setDraft((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] ?? { x: 0, y: 0, scale: 1, opacity: 0.92 }),
        ...patch,
      },
    }));
  };

  const applyPreset = (preset: HudPresetId) => {
    setActivePreset(preset);
    setDraft(createPresetCustomHudLayout(preset));
  };

  const eraClass = uiEraMode === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';

  return (
    <div
      className={`p7-hud-editor-root ${eraClass} ${liveCourtBackdrop ? 'p7-hud-live-bg' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Subtle 3D-compatible translucent court grid lines */}
      {showGrid && (
        <div className="p7-hud-editor-grid" aria-hidden="true">
          <div className="p7-hud-grid-midline" />
          <div className="p7-hud-grid-circle" />
        </div>
      )}

      {/* Top Action Bar */}
      <header className="p7-hud-editor-topbar">
        <div>
          <strong className="p7-hud-editor-title">Custom Touch HUD Editor</strong>
          <span className="p7-muted" style={{ marginLeft: 10 }}>
            Drag any of the 14 controls over the live 3D court · Tap to resize or adjust opacity
          </span>
        </div>
        <div className="p7-hud-editor-actions">
          <button
            type="button"
            className={`p7-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid((v) => !v)}
          >
            {showGrid ? 'Grid: On' : 'Grid: Off'}
          </button>
          <button
            type="button"
            className="p7-btn"
            onClick={() => {
              setActivePreset('CLASSIC_2K');
              setDraft(createDefaultCustomHudLayout());
            }}
          >
            Reset Default
          </button>
          <button type="button" className="p7-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="p7-btn primary"
            onClick={() => onSaveAndExit(draft)}
          >
            Save &amp; Exit
          </button>
        </div>
      </header>

      {/* Interactive 14-Node Drag Stage */}
      <div className="p7-hud-editor-stage">
        {HUD_EDITOR_NODES.map((node) => {
          const rect = draft[node.key] ?? { x: 0, y: 0, scale: 1, opacity: 0.92 };
          const isSelected = selectedKey === node.key;
          return (
            <div
              key={node.key}
              role="button"
              tabIndex={0}
              aria-label={`Move ${node.label} touch control`}
              className={`p7-hud-node ${node.shape} ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${node.baseLeftPct}%`,
                top: `${node.baseTopPct}%`,
                width: node.width,
                height: node.height,
                borderColor: isSelected ? '#ffffff' : node.accent,
                opacity: rect.opacity,
                transform: `translate(-50%, -50%) translate(${rect.x}px, ${rect.y}px) scale(${rect.scale})`,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                startDrag(node.key, e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 0) return;
                e.stopPropagation();
                startDrag(node.key, e.touches[0].clientX, e.touches[0].clientY);
              }}
              onClick={() => setSelectedKey(node.key)}
            >
              <strong>{node.label}</strong>
              <span>{node.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Compact Tuning & Preset Dock */}
      <footer className="p7-hud-editor-dock">
        <div className="p7-hud-dock-selected">
          <strong>{selectedMeta.label}</strong>
          <span className="p7-muted p7-num">
            Offset ({selectedRect.x >= 0 ? `+${selectedRect.x}` : selectedRect.x}px,{' '}
            {selectedRect.y >= 0 ? `+${selectedRect.y}` : selectedRect.y}px)
          </span>
        </div>

        <label className="p7-hud-dock-slider">
          <span className="p7-num">Scale {Math.round(selectedRect.scale * 100)}%</span>
          <input
            type="range"
            min={50}
            max={150}
            value={Math.round(selectedRect.scale * 100)}
            onChange={(e) => updateSelected({ scale: Number(e.target.value) / 100 })}
          />
        </label>

        <label className="p7-hud-dock-slider">
          <span className="p7-num">Opacity {Math.round(selectedRect.opacity * 100)}%</span>
          <input
            type="range"
            min={20}
            max={100}
            value={Math.round(selectedRect.opacity * 100)}
            onChange={(e) => updateSelected({ opacity: Number(e.target.value) / 100 })}
          />
        </label>

        <div className="p7-hud-dock-presets">
          <button
            type="button"
            className={`p7-btn ${activePreset === 'CLASSIC_2K' ? 'active' : ''}`}
            onClick={() => applyPreset('CLASSIC_2K')}
          >
            Layout 1: Classic 2K
          </button>
          <button
            type="button"
            className={`p7-btn ${activePreset === 'CLAW_PRO' ? 'active' : ''}`}
            onClick={() => applyPreset('CLAW_PRO')}
          >
            Layout 2: Claw Pro
          </button>
          <button
            type="button"
            className={`p7-btn ${activePreset === 'COMPACT_ONE_HAND' ? 'active' : ''}`}
            onClick={() => applyPreset('COMPACT_ONE_HAND')}
          >
            Layout 3: Compact One-Hand
          </button>
        </div>
      </footer>
    </div>
  );
};
