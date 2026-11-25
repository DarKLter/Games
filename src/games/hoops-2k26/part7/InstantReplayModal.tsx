// ============================================================================
// PART 7 — 10-SECOND (600-FRAME) 3D INSTANT REPLAY FREEZE CAM + PNG CAPTURE
// - Scrubs up to 600 recorded 60Hz court frames (10 full seconds)
// - Speed controls: Pause, 0.25x, 0.5x, 1.0x + Timeline Scrubber
// - Smooth 360° Free-Orbit drag/touch 3D camera + Zoom + Ball/Court Focus
// - One-tap PNG Screenshot Capture directly from WebGL canvas
// - Zero backdrop-filter over WebGL; collapsible bottom dock
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import type { ReplayOrbitState } from '../engine/SimTacticsAndReplay';
import type { CameraAngleId } from '../engine/courtTypes';
import type { UIEraMode } from '../hybrid/types';

export interface InstantReplayModalProps {
  uiEraMode: UIEraMode;
  frameCount: number;
  replayOrbitRef: React.MutableRefObject<ReplayOrbitState>;
  activeCameraPreset: CameraAngleId;
  onSeekFrame: (frameIndex: number) => void;
  onSelectCameraPreset: (preset: CameraAngleId) => void;
  onCapturePng: () => string | null;
  onExit: () => void;
}

const REPLAY_PRESETS: Array<{ id: CameraAngleId; label: string }> = [
  { id: '2K', label: '2K' },
  { id: 'BROADCAST', label: 'Broadcast' },
  { id: 'DRIVE', label: 'Drive' },
  { id: 'HIGH', label: 'High' },
  { id: 'NOSEBLEEDS', label: 'Skycam' },
];

export const InstantReplayModal: React.FC<InstantReplayModalProps> = ({
  uiEraMode,
  frameCount,
  replayOrbitRef,
  activeCameraPreset,
  onSeekFrame,
  onSelectCameraPreset,
  onCapturePng,
  onExit,
}) => {
  const safeMax = Math.max(0, frameCount - 1);
  const [frame, setFrame] = useState<number>(safeMax);
  const [playing, setPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<0.25 | 0.5 | 1>(0.5);
  const [freeOrbit, setFreeOrbit] = useState<boolean>(true);
  const [focusMode, setFocusMode] = useState<'BALL' | 'COURT'>('BALL');
  const [zoomDistance, setZoomDistance] = useState<number>(10.5);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null);
  const [snapshotThumb, setSnapshotThumb] = useState<string | null>(null);

  const frameFloatRef = useRef<number>(Math.max(0, safeMax - 180));
  const dragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
  }>({ active: false, lastX: 0, lastY: 0 });

  // Activate 360° Free-Orbit Freeze Cam on mount & clean up on exit
  useEffect(() => {
    const startIdx = Math.max(0, safeMax - Math.min(safeMax, 180));
    frameFloatRef.current = startIdx;
    setFrame(startIdx);
    onSeekFrame(startIdx);

    replayOrbitRef.current.active = true;
    replayOrbitRef.current.focusMode = 'BALL';
    replayOrbitRef.current.distance = 10.5;

    return () => {
      replayOrbitRef.current.active = false;
    };
  }, [safeMax, onSeekFrame, replayOrbitRef]);

  useEffect(() => {
    replayOrbitRef.current.active = freeOrbit;
    replayOrbitRef.current.focusMode = focusMode;
    replayOrbitRef.current.distance = zoomDistance;
  }, [freeOrbit, focusMode, zoomDistance, replayOrbitRef]);

  // 60 Hz timeline playback loop scaled by 0.25x / 0.5x / 1.0x
  useEffect(() => {
    if (!playing || safeMax <= 0) return;
    let rafId = 0;
    let lastTs = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      let next = frameFloatRef.current + dt * 60 * speed;
      if (next > safeMax) next = 0;
      frameFloatRef.current = next;
      const idx = Math.floor(next);
      setFrame(idx);
      onSeekFrame(idx);
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [playing, speed, safeMax, onSeekFrame]);

  const handleOrbitStart = (clientX: number, clientY: number) => {
    if (!freeOrbit) setFreeOrbit(true);
    dragRef.current = { active: true, lastX: clientX, lastY: clientY };
  };

  const handleOrbitMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.active) return;
    const dx = clientX - dragRef.current.lastX;
    const dy = clientY - dragRef.current.lastY;
    dragRef.current.lastX = clientX;
    dragRef.current.lastY = clientY;
    replayOrbitRef.current.azimuth -= dx * 0.0075;
    replayOrbitRef.current.polar = Math.max(
      0.26,
      Math.min(1.36, replayOrbitRef.current.polar + dy * 0.0055)
    );
  };

  const handleOrbitEnd = () => {
    dragRef.current.active = false;
  };

  const handleCaptureScreenshot = () => {
    const dataUrl = onCapturePng();
    if (!dataUrl) {
      setSnapshotStatus('Unable to capture frame on this WebGL context.');
      return;
    }
    setSnapshotThumb(dataUrl);
    setSnapshotStatus('PNG Freeze-Cam snapshot captured!');
    try {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `hoops-2k26-replay-frame-${frame}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // Fallback: preview thumbnail remains visible in HUD
    }
    window.setTimeout(() => setSnapshotStatus(null), 3200);
  };

  const secCurrent = (frame / 60).toFixed(2);
  const secTotal = (safeMax / 60).toFixed(2);
  const eraClass = uiEraMode === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';

  return (
    <div className={`p7-replay-root ${eraClass}`}>
      {/* Full-viewport transparent 360° orbit gesture canvas */}
      <div
        className="p7-replay-orbit-zone"
        onMouseDown={(e) => handleOrbitStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleOrbitMove(e.clientX, e.clientY)}
        onMouseUp={handleOrbitEnd}
        onMouseLeave={handleOrbitEnd}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handleOrbitStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 0) handleOrbitMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleOrbitEnd}
        onWheel={(e) => {
          setZoomDistance((prev) => Math.max(4, Math.min(22, prev + Math.sign(e.deltaY) * 0.9)));
        }}
      />

      {/* Minimal Top Bar */}
      <header className="p7-replay-topbar">
        <div className="p7-replay-brand">
          <strong>Instant Replay · Freeze Cam</strong>
          <span className="p7-muted p7-num">
            {secCurrent}s / {secTotal}s ({frameCount} frames) · Drag anywhere to orbit 360°
          </span>
        </div>
        <div className="p7-replay-top-actions">
          <button
            type="button"
            className="p7-btn primary"
            onClick={handleCaptureScreenshot}
          >
            Capture PNG
          </button>
          <button
            type="button"
            className="p7-btn"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? 'Show Dock' : 'Hide Dock'}
          </button>
          <button type="button" className="p7-btn danger" onClick={onExit}>
            Exit Replay
          </button>
        </div>
      </header>

      {/* PNG Capture Confirmation Toast + Mini Thumbnail */}
      {snapshotStatus && (
        <div className="p7-replay-toast">
          {snapshotThumb && (
            <img
              src={snapshotThumb}
              alt="Captured Freeze Cam snapshot"
              className="p7-replay-thumb"
            />
          )}
          <span>{snapshotStatus}</span>
        </div>
      )}

      {/* Collapsible Compact Bottom Replay Dock */}
      {!collapsed && (
        <footer className="p7-replay-dock">
          <div className="p7-replay-scrubber-row">
            <button
              type="button"
              className="p7-btn primary"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <input
              type="range"
              min={0}
              max={Math.max(1, safeMax)}
              value={frame}
              aria-label="Replay timeline scrubber"
              className="p7-replay-slider"
              onChange={(e) => {
                const idx = Number(e.target.value);
                setPlaying(false);
                frameFloatRef.current = idx;
                setFrame(idx);
                onSeekFrame(idx);
              }}
            />
            <div className="p7-seg">
              {([0.25, 0.5, 1] as Array<0.25 | 0.5 | 1>).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`p7-seg-btn ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="p7-replay-cam-row">
            <div className="p7-seg">
              <button
                type="button"
                className={`p7-seg-btn ${freeOrbit ? 'active' : ''}`}
                onClick={() => setFreeOrbit(true)}
              >
                360° Free Orbit
              </button>
              <button
                type="button"
                className={`p7-seg-btn ${!freeOrbit ? 'active' : ''}`}
                onClick={() => setFreeOrbit(false)}
              >
                Broadcast Cam
              </button>
            </div>

            {freeOrbit ? (
              <>
                <div className="p7-seg">
                  <button
                    type="button"
                    className={`p7-seg-btn ${focusMode === 'BALL' ? 'active' : ''}`}
                    onClick={() => setFocusMode('BALL')}
                  >
                    Focus: Ball
                  </button>
                  <button
                    type="button"
                    className={`p7-seg-btn ${focusMode === 'COURT' ? 'active' : ''}`}
                    onClick={() => setFocusMode('COURT')}
                  >
                    Focus: Half-Court
                  </button>
                </div>
                <label className="p7-replay-zoom">
                  <span className="p7-num">Zoom {zoomDistance.toFixed(1)}m</span>
                  <input
                    type="range"
                    min={4}
                    max={22}
                    step={0.5}
                    value={zoomDistance}
                    onChange={(e) => setZoomDistance(Number(e.target.value))}
                  />
                </label>
              </>
            ) : (
              <div className="p7-seg">
                {REPLAY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`p7-seg-btn ${activeCameraPreset === p.id ? 'active' : ''}`}
                    onClick={() => onSelectCameraPreset(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
