import React, { useEffect, useRef, useState } from 'react';
import { MmAvatarConfig, MmMapDef, MmRankDef, MmTeam } from '../types';
import {
  drawDoodleSoldier,
  drawMapMiniSilhouette,
  drawParallaxBackground,
  drawWeaponVector
} from '../engine/DoodleRenderer';
import { mmAudio } from '../engine/AudioEngine';

const SARGE_QUIPS = [
  'LOCK AND LOAD!',
  'DROP AND GIVE ME 20!',
  'KEEP YOUR JETS HOT!',
  'WATCH THAT PROXY MINE!',
  'DUAL UZIS! MOVE OUT!',
  'NO MERCY IN OUTPOST!'
];

interface LobbyShowcaseProps {
  avatar: MmAvatarConfig;
  weaponId: string;
  offhandWeaponId?: string | null;
  team: MmTeam;
  callsign: string;
  clanTag: string;
}

/**
 * Interactive Outpost Lobby Soldier Showcase (Section 2).
 * Tap soldier to cycle salute, jetpack hover burst, muzzle fire burst & Sarge quips!
 */
export const LobbySoldierShowcase: React.FC<LobbyShowcaseProps> = ({
  avatar,
  weaponId,
  offhandWeaponId,
  team,
  callsign,
  clanTag
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const actionRef = useRef<{ kind: 'idle' | 'jet' | 'fire' | 'crouch'; timer: number; quip: string | null }>({
    kind: 'idle',
    timer: 0,
    quip: null
  });
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      const act = actionRef.current;
      if (act.timer > 0) {
        act.timer = Math.max(0, act.timer - dt);
        if (act.timer === 0) {
          act.kind = 'idle';
          act.quip = null;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      drawParallaxBackground(ctx, w, h, 'jungle', t * 18, 0, t, true);

      // Outpost rocky ledge foreground
      ctx.fillStyle = '#3B4230';
      ctx.fillRect(0, h - 52, w, 52);
      ctx.fillStyle = '#53623E';
      ctx.fillRect(0, h - 56, w, 9);
      ctx.strokeStyle = '#181E14';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, h - 56);
      ctx.lineTo(w, h - 56);
      ctx.stroke();

      // Sandbags & Ammo Crate prop on ledge
      ctx.fillStyle = '#8A795D';
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.roundRect(26 + i * 24, h - 68, 28, 13, 6);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.roundRect(38, h - 79, 28, 13, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#3E4A2E';
      ctx.fillRect(w - 86, h - 82, 46, 26);
      ctx.strokeRect(w - 86, h - 82, 46, 26);
      ctx.fillStyle = '#F5A623';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('AMMO', w - 76, h - 66);

      // Soldier animated pose
      const hoverY = act.kind === 'jet' ? -36 - Math.sin(t * 14) * 7 : Math.sin(t * 2.2) * 1.5;
      const aimAngle =
        act.kind === 'fire'
          ? -0.08 + Math.sin(t * 24) * 0.06
          : act.kind === 'jet'
            ? -0.25
            : Math.sin(t * 1.3) * 0.14 - 0.05;

      drawDoodleSoldier(ctx, {
        x: w * 0.5,
        y: h - 80 + hoverY,
        aimAngle,
        avatar,
        team,
        weaponId,
        offhandWeaponId,
        crouching: act.kind === 'crouch',
        jetpacking: act.kind === 'jet',
        walkPhase: act.kind === 'idle' ? 0 : t * 8,
        scale: 1.95,
        muzzleFlash: act.kind === 'fire' && Math.floor(t * 18) % 2 === 0 ? 1 : 0,
        speechText: act.quip,
        timeSec: t
      });

      // Subtle callsign stencil plate at bottom
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(w * 0.5 - 88, h - 36, 176, 24);
      ctx.strokeStyle = '#C2B280';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w * 0.5 - 88, h - 36, 176, 24);
      ctx.fillStyle = '#F4F4EC';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      const label = clanTag ? `[${clanTag}] ${callsign}` : callsign;
      ctx.fillText(label.slice(0, 20), w * 0.5, h - 20);
      ctx.textAlign = 'left';

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [avatar, weaponId, offhandWeaponId, team, callsign, clanTag]);

  const handleTap = () => {
    const modes: Array<'jet' | 'fire' | 'crouch'> = ['fire', 'jet', 'crouch'];
    const next = modes[tapCount % modes.length];
    const quip = SARGE_QUIPS[tapCount % SARGE_QUIPS.length];
    actionRef.current = { kind: next, timer: 1.85, quip };
    setTapCount((c) => c + 1);
    if (next === 'fire') mmAudio.playWeaponFire(weaponId);
    else if (next === 'jet') mmAudio.playJetpackPulse();
    else mmAudio.playClick();
  };

  return (
    <div
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleTap();
      }}
      title="Click soldier to fire burst, test jetpack & hear Sarge!"
      className="relative w-full h-full min-h-[210px] rounded border-2 border-[#4F5D3B] bg-[#1D2418] overflow-hidden cursor-pointer select-none shadow-[inset_0_0_24px_rgba(0,0,0,0.65)] group"
    >
      <canvas ref={canvasRef} width={380} height={240} className="w-full h-full object-cover block" />
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1C2124]/85 border border-[#C2B280]/50 text-[10px] font-mono uppercase tracking-wider text-[#C2B280]">
        OUTPOST BASE · TAP SOLDIER
      </div>
    </div>
  );
};

/**
 * Interactive Avatar Studio Live Preview with pose buttons (Idle / Crouch / Fly / Fire).
 */
export const AvatarStudioCanvas: React.FC<{
  avatar: MmAvatarConfig;
  weaponId?: string;
  pose: 'idle' | 'crouch' | 'fly' | 'fire';
  team?: MmTeam;
}> = ({ avatar, weaponId = 'm4', pose, team = 'blue' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const w = canvas.width;
      const h = canvas.height;
      drawParallaxBackground(ctx, w, h, 'industrial', t * 10, 0, t, false);

      // Spotlight floor plate
      ctx.fillStyle = '#1E2429';
      ctx.fillRect(0, h - 38, w, 38);
      ctx.fillStyle = '#F5A623';
      ctx.fillRect(0, h - 41, w, 3);

      drawDoodleSoldier(ctx, {
        x: w * 0.5,
        y: h - 72 - (pose === 'fly' ? 28 + Math.sin(t * 10) * 6 : 0),
        aimAngle: pose === 'fire' ? -0.05 + Math.sin(t * 20) * 0.04 : -0.08,
        avatar,
        team,
        weaponId,
        crouching: pose === 'crouch',
        jetpacking: pose === 'fly',
        muzzleFlash: pose === 'fire' && Math.floor(t * 16) % 2 === 0 ? 1 : 0,
        scale: 2.25,
        timeSec: t
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [avatar, weaponId, pose, team]);

  return (
    <canvas
      ref={canvasRef}
      width={260}
      height={240}
      className="w-full h-full rounded border-2 border-[#4F5D3B] bg-[#181C1F] block"
    />
  );
};

/**
 * Compact circular headshot portrait for Lobby Header & Profile Badge.
 */
export const AvatarPortraitBadge: React.FC<{ avatar: MmAvatarConfig; size?: number }> = ({
  avatar,
  size = 46
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    const grad = ctx.createRadialGradient(32, 28, 6, 32, 32, 34);
    grad.addColorStop(0, '#4E5D3B');
    grad.addColorStop(1, '#1E2419');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    drawDoodleSoldier(ctx, {
      x: 30,
      y: 62,
      aimAngle: -0.1,
      avatar,
      team: 'blue',
      weaponId: 'pistol',
      scale: 1.38,
      timeSec: 0
    });
  }, [avatar]);

  return (
    <canvas
      ref={ref}
      width={64}
      height={64}
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-[#F5A623] bg-[#22281D] shrink-0 shadow-md"
    />
  );
};

/**
 * Crisp 2D Canvas Vector Weapon Preview Icon (used in Armory, Loadout Bar & Battle HUD).
 */
export const WeaponVectorIcon: React.FC<{ weaponId: string; width?: number; height?: number }> = ({
  weaponId,
  width = 88,
  height = 34
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(c.width * 0.34, c.height * 0.54);
    ctx.scale(1.15, 1.15);
    drawWeaponVector(ctx, weaponId, 0, 0);
    ctx.restore();
  }, [weaponId]);

  return <canvas ref={ref} width={110} height={42} style={{ width, height }} className="block shrink-0" />;
};

/**
 * Crisp Vector Silhouette Minimap of any of the 20 Maps.
 */
export const MapPreviewCanvas: React.FC<{ map: MmMapDef; width?: number; height?: number; className?: string }> = ({
  map,
  width = 240,
  height = 128,
  className = ''
}) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    drawMapMiniSilhouette(ctx, map, c.width, c.height);
  }, [map]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={`rounded border border-[#4F5D3B] bg-[#181C1F] block ${className}`}
    />
  );
};

/**
 * Military Rank Insignia Vector Badge (Chevrons, Bars, Oak Leaves, Eagles, Stars, Commander-in-Chief).
 */
export const RankInsigniaBadge: React.FC<{ rank: MmRankDef; size?: number }> = ({ rank, size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className="shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
      aria-label={rank.title}
    >
      <rect x="2" y="2" width="24" height="24" rx="4" fill="#1C2124" stroke={rank.color} strokeWidth="1.8" />
      {rank.insigniaType === 'chevron' &&
        Array.from({ length: Math.min(rank.tierCount, 4) }).map((_, i) => (
          <path
            key={i}
            d={`M7 ${18 - i * 3.5} L14 ${13 - i * 3.5} L21 ${18 - i * 3.5}`}
            fill="none"
            stroke={rank.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      {rank.insigniaType === 'bar' &&
        Array.from({ length: rank.tierCount }).map((_, i) => (
          <rect
            key={i}
            x={rank.tierCount === 1 ? 11 : 7 + i * 9}
            y="6"
            width="6"
            height="16"
            rx="1"
            fill={rank.color}
          />
        ))}
      {rank.insigniaType === 'leaf' && (
        <path
          d="M14 5 L17 11 L22 11 L18 16 L19 22 L14 19 L9 22 L10 16 L6 11 L11 11 Z"
          fill={rank.color}
        />
      )}
      {rank.insigniaType === 'eagle' && (
        <path
          d="M5 12 Q14 7 23 12 L20 17 L14 14 L8 17 Z M14 7 L16 11 L12 11 Z"
          fill={rank.color}
        />
      )}
      {(rank.insigniaType === 'star' || rank.insigniaType === 'commander') && (
        <>
          <polygon
            points="14,5 16.5,11 23,11.5 18,15.8 19.6,22 14,18.5 8.4,22 10,15.8 5,11.5 11.5,11"
            fill={rank.color}
          />
          {rank.tierCount > 1 && (
            <text x="14" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#181C1F">
              {rank.tierCount}
            </text>
          )}
        </>
      )}
    </svg>
  );
};
