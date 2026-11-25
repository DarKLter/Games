import React, { useEffect, useRef, useState } from 'react';
import { MlbbPingKind } from '../types';
import { WORLD_SIZE } from '../data/mapData';
import { buildOmwRouteFromHero } from '../engine/CombatMath';
import { MlbbGameEngine } from '../engine/GameEngine';

interface ExpandedMinimapProps {
  engine: MlbbGameEngine | null;
  playerPos?: { x: number; y: number };
  onClose: () => void;
}

export const ExpandedMinimap: React.FC<ExpandedMinimapProps> = ({ engine, playerPos, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedKind, setSelectedKind] = useState<'attack' | 'retreat' | 'gather' | 'missing' | 'omw'>('attack');
  const [routePts, setRoutePts] = useState<{ x: number; y: number }[]>([]);
  const [hoverPreview, setHoverPreview] = useState<{ icon: string; label: string; color: string } | null>(null);
  const draggingRef = useRef(false);
  const startPtRef = useRef<{ x: number; y: number } | null>(null);
  const worldPtsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!engine || !canvasRef.current) return;
    engine.attachExtraMinimapCanvas(canvasRef.current);
    return () => {
      engine.attachExtraMinimapCanvas(null);
    };
  }, [engine]);

  const toWorld = (clientX: number, clientY: number, rect: DOMRect) => ({
    x: Math.max(80, Math.min(WORLD_SIZE - 80, ((clientX - rect.left) / rect.width) * WORLD_SIZE)),
    y: Math.max(80, Math.min(WORLD_SIZE - 80, ((clientY - rect.top) / rect.height) * WORLD_SIZE))
  });

  const updateHoverPreview = (clientX: number, clientY: number, rect: DOMRect) => {
    if (!engine) return;
    const wp = toWorld(clientX, clientY, rect);
    if (selectedKind === 'omw') {
      setHoverPreview({ icon: '🧭', label: 'Tap or drag to draw cyan "On My Way" route', color: '#22D3EE' });
      return;
    }
    const previewKind = selectedKind === 'missing' ? 'retreat' : selectedKind;
    const prev = engine.previewDragPing(previewKind, wp.x, wp.y);
    if (selectedKind === 'missing' && !prev.snapped) {
      setHoverPreview({ icon: '❓', label: 'Signal Enemy Missing in zone', color: '#FACC15' });
    } else {
      setHoverPreview({ icon: prev.icon, label: prev.label, color: prev.color });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    draggingRef.current = true;
    startPtRef.current = { x: lx, y: ly };
    const wp = toWorld(e.clientX, e.clientY, rect);
    worldPtsRef.current = [wp];
    setRoutePts([{ x: lx, y: ly }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    updateHoverPreview(e.clientX, e.clientY, rect);
    if (!draggingRef.current) return;
    const lx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ly = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    const last = routePts[routePts.length - 1];
    if (!last || Math.hypot(lx - last.x, ly - last.y) >= 8) {
      setRoutePts((prev) => [...prev.slice(-36), { x: lx, y: ly }]);
      worldPtsRef.current.push(toWorld(e.clientX, e.clientY, rect));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    const start = startPtRef.current;
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const movedDist = start ? Math.hypot(endX - start.x, endY - start.y) : 0;

    if (movedDist >= 18 && worldPtsRef.current.length >= 2) {
      // Drawn glowing cyan "On My Way" route trail!
      engine?.drawOmwRoute(worldPtsRef.current);
    } else if (selectedKind === 'omw') {
      const wp = toWorld(e.clientX, e.clientY, rect);
      const originX = playerPos?.x ?? 620;
      const originY = playerPos?.y ?? WORLD_SIZE - 620;
      engine?.drawOmwRoute(buildOmwRouteFromHero(originX, originY, wp.x, wp.y));
    } else {
      const wp = toWorld(e.clientX, e.clientY, rect);
      engine?.expandedMapTap(wp.x, wp.y, selectedKind as MlbbPingKind);
    }
    setRoutePts([]);
    worldPtsRef.current = [];
    startPtRef.current = null;
  };

  const polylinePoints = routePts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-950/65 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl bg-[#0B132B]/96 border-2 border-[#F5C451]/75 p-3 shadow-2xl flex flex-col items-center gap-2.5 max-w-[94vw]"
      >
        <div className="w-full flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-wider text-[#F5C451] uppercase">
              Expanded Tactical Map (M)
            </div>
            <div className="text-[11px] text-slate-300 font-semibold">
              Tap Hero/Turret/Bush/Pit to ping · Select &quot;On My Way&quot; or drag to draw cyan route
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black text-sm cursor-pointer"
            title="Close Tactical Map (M)"
          >
            ✕
          </button>
        </div>

        {/* 5-Mode Ping & Route Selector */}
        <div className="w-full grid grid-cols-5 gap-1.5 text-[10px] sm:text-[11px]">
          {(
            [
              { id: 'attack', icon: '⚔️', label: 'Attack', activeCls: 'bg-rose-600 border-rose-300 text-white' },
              { id: 'retreat', icon: '🛡️', label: 'Retreat', activeCls: 'bg-amber-500 border-amber-200 text-slate-950' },
              { id: 'gather', icon: '🎯', label: 'Gather', activeCls: 'bg-sky-500 border-sky-200 text-slate-950' },
              { id: 'missing', icon: '❓', label: 'Missing', activeCls: 'bg-yellow-400 border-white text-slate-950' },
              { id: 'omw', icon: '🧭', label: 'On My Way', activeCls: 'bg-cyan-400 border-white text-slate-950' }
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setSelectedKind(btn.id)}
              className={`min-h-[36px] py-1.5 px-1.5 rounded-lg border font-black flex items-center justify-center gap-1 cursor-pointer ${
                selectedKind === btn.id
                  ? btn.activeCls
                  : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{btn.icon}</span>
              <span className="truncate">{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Live Magnetic Hover Target Callout Preview */}
        <div className="w-full px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-center text-[11px] font-black truncate">
          {hoverPreview ? (
            <span style={{ color: hoverPreview.color }}>
              {hoverPreview.icon} {hoverPreview.label}
            </span>
          ) : (
            <span className="text-slate-400">Move pointer over map to snap to Heroes, Turrets, Bushes, or Objectives</span>
          )}
        </div>

        {/* ~46% Screen-Height Interactive Live Tactical Canvas + Cyan Route Preview Overlay */}
        <div className="relative rounded-xl overflow-hidden border-2 border-[#38BDF8]/65 bg-[#091326] w-[min(82vw,46vh,380px)] h-[min(82vw,46vh,380px)]">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setHoverPreview(null)}
            className="w-full h-full block cursor-crosshair touch-none"
          />
          {routePts.length >= 2 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#22D3EE"
                strokeWidth="4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Instant Quick Tactical Callouts */}
        <div className="w-full flex items-center justify-between gap-2 text-[11px]">
          <button
            onClick={() => engine?.expandedMapTap(2000, 2000, 'missing')}
            className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-amber-400/50 text-amber-200 font-black cursor-pointer"
          >
            ❓ Enemy Missing!
          </button>
          <button
            onClick={() => engine?.expandedMapTap(2000, 2000, 'gather')}
            className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-sky-500/20 border border-sky-400/50 text-sky-200 font-black cursor-pointer"
          >
            🎯 Gather Mid!
          </button>
        </div>
      </div>
    </div>
  );
};
