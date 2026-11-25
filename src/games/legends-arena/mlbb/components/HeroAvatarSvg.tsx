import React, { useEffect, useRef } from 'react';
import { getMlbbHeroById } from '../data/heroes';
import { MLBB_RANK_TIERS } from '../data/emblems';

export const HeroPortraitSvg: React.FC<{
  heroId: string;
  size?: number;
  skinColor?: string;
  skinAccent?: string;
  className?: string;
}> = ({ heroId, size = 48, skinColor, skinAccent, className = '' }) => {
  const hero = getMlbbHeroById(heroId);
  const c1 = skinColor ?? hero.primaryColor;
  const c2 = skinAccent ?? hero.accentColor;
  const gradId = `hg_${hero.id}_${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={className}
      aria-label={hero.name}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor="#0B132B" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" fill={`url(#${gradId})`} stroke="#F5C451" strokeWidth="3" />
      <circle cx="40" cy="40" r="32" fill="none" stroke={c2} strokeOpacity="0.45" strokeWidth="1.5" />
      {/* Stylized hero armor silhouette */}
      <path d="M18 68 C20 50 30 46 40 46 C50 46 60 50 62 68 Z" fill={c1} stroke={c2} strokeWidth="2" />
      <circle cx="40" cy="31" r="13" fill="#1E293B" stroke={c2} strokeWidth="2" />
      <path d="M28 28 L40 16 L52 28" fill="none" stroke="#F5C451" strokeWidth="2.5" strokeLinecap="round" />
      <text
        x="40"
        y="36"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#FFFFFF"
      >
        {hero.weaponIcon}
      </text>
      <text
        x="40"
        y="65"
        textAnchor="middle"
        fontSize="9"
        fontWeight="800"
        fill="#F8FAFC"
        letterSpacing="0.5"
      >
        {hero.name.toUpperCase()}
      </text>
    </svg>
  );
};

export const RankCrestSvg: React.FC<{ tierIdx: number; size?: number }> = ({ tierIdx, size = 34 }) => {
  const tier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, tierIdx))];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label={tier.name}>
      <polygon
        points="32,4 58,18 52,50 32,60 12,50 6,18"
        fill="#0F172A"
        stroke={tier.color}
        strokeWidth="4"
      />
      <polygon
        points="32,12 49,22 45,45 32,52 19,45 15,22"
        fill={tier.color}
        fillOpacity="0.24"
        stroke="#F5C451"
        strokeWidth="1.5"
      />
      <text x="32" y="39" textAnchor="middle" fontSize="22">
        {tier.icon}
      </text>
    </svg>
  );
};

export const LobbySanctuaryCanvas: React.FC<{
  heroId: string;
  skinId?: string;
}> = ({ heroId, skinId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotRef = useRef(0);
  const dragRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hero = getMlbbHeroById(heroId);
    const skin = hero.skins.find((s) => s.id === skinId) ?? hero.skins[0];
    const primary = skin?.color ?? hero.primaryColor;
    const accent = skin?.accent ?? hero.accentColor;

    const embers = Array.from({ length: 44 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 2.5,
      vy: 0.015 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2
    }));

    let raf = 0;
    let t = 0;

    const draw = () => {
      t += 0.016;
      if (!dragRef.current.active) {
        rotRef.current += 0.005;
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cssW = canvas.clientWidth || canvas.parentElement?.clientWidth || canvas.getBoundingClientRect().width;
      const cssH = canvas.clientHeight || canvas.parentElement?.clientHeight || canvas.getBoundingClientRect().height;
      const w = Math.max(320, Math.floor(cssW * dpr));
      const h = Math.max(200, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      // Midnight Sapphire Sanctuary Backdrop
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 30, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
      bgGrad.addColorStop(0, '#1B2D5C');
      bgGrad.addColorStop(0.5, '#0D1733');
      bgGrad.addColorStop(1, '#060B18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural arcane rays
      ctx.save();
      ctx.translate(w * 0.5, h * 0.34);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t * 0.05;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * w * 0.65, Math.sin(a) * h * 0.65);
        ctx.strokeStyle = 'rgba(245,196,81,0.05)';
        ctx.lineWidth = 24 * dpr;
        ctx.stroke();
      }
      ctx.restore();

      const cx = w * 0.5;
      const pedY = h * 0.69;
      const pedRx = Math.min(w, h) * 0.27;
      const pedRy = pedRx * 0.28;

      // Pedestal Ambient Aura
      const glow = ctx.createRadialGradient(cx, pedY - 30 * dpr, 10, cx, pedY, pedRx * 1.45);
      glow.addColorStop(0, primary + '55');
      glow.addColorStop(0.55, accent + '22');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Rotating Arcane Rune Pedestal
      ctx.save();
      ctx.translate(cx, pedY);
      ctx.scale(1, pedRy / pedRx);
      ctx.rotate(rotRef.current);
      ctx.beginPath();
      ctx.arc(0, 0, pedRx, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(12,22,48,0.85)';
      ctx.fill();
      ctx.lineWidth = 4 * dpr;
      ctx.strokeStyle = '#F5C451';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, pedRx * 0.78, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5 * dpr;
      ctx.setLineDash([14 * dpr, 10 * dpr]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * pedRx * 0.78, Math.sin(a) * pedRx * 0.78);
        ctx.lineTo(Math.cos(a) * pedRx * 0.98, Math.sin(a) * pedRx * 0.98);
        ctx.strokeStyle = '#F5C451';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
      }
      ctx.restore();

      // Stylized 2.5D Hero Showcase Figure on Pedestal (breathes & rotates with drag)
      const bob = Math.sin(t * 2.1) * 7 * dpr;
      const turnX = Math.sin(rotRef.current) * 18 * dpr;
      const heroY = pedY - 125 * dpr + bob;

      // Floating Cloak / Wings
      ctx.save();
      ctx.translate(cx + turnX * 0.4, heroY + 25 * dpr);
      ctx.beginPath();
      ctx.moveTo(-66 * dpr, 85 * dpr);
      ctx.quadraticCurveTo(-82 * dpr, -10 * dpr, 0, -56 * dpr);
      ctx.quadraticCurveTo(82 * dpr, -10 * dpr, 66 * dpr, 85 * dpr);
      ctx.closePath();
      ctx.fillStyle = primary + 'BB';
      ctx.fill();
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = '#F5C451';
      ctx.stroke();

      // Armored Core & Pauldrons
      ctx.beginPath();
      ctx.roundRect(-42 * dpr, -28 * dpr, 84 * dpr, 92 * dpr, 24 * dpr);
      ctx.fillStyle = '#0F1B3B';
      ctx.fill();
      ctx.lineWidth = 3 * dpr;
      ctx.strokeStyle = accent;
      ctx.stroke();

      // Crest Emblem
      ctx.beginPath();
      ctx.arc(turnX * 0.35, -56 * dpr, 30 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = primary;
      ctx.fill();
      ctx.lineWidth = 3.5 * dpr;
      ctx.strokeStyle = '#F5C451';
      ctx.stroke();

      // Hero Weapon Emblem
      ctx.font = `bold ${Math.round(42 * dpr)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(hero.weaponIcon, turnX * 0.55, 16 * dpr);
      ctx.restore();

      // Floating Golden Embers
      for (const e of embers) {
        e.y -= e.vy * 0.016;
        if (e.y < 0) {
          e.y = 1;
          e.x = Math.random();
        }
        const ex = e.x * w + Math.sin(t * 2 + e.phase) * 14 * dpr;
        const ey = e.y * h;
        ctx.beginPath();
        ctx.arc(ex, ey, e.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = e.phase > 3 ? '#F5C451AA' : accent + '99';
        ctx.fill();
      }

      // Hero Showcase Nameplate below pedestal
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F5C451';
      ctx.font = `800 ${Math.round(13 * dpr)}px sans-serif`;
      ctx.fillText(`${hero.role.toUpperCase()} · ${hero.lane.toUpperCase()} LANE · ${skin?.name.toUpperCase() ?? 'CLASSIC'}`, cx, pedY + pedRy + 26 * dpr);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(28 * dpr)}px sans-serif`;
      ctx.fillText(hero.name.toUpperCase(), cx, pedY + pedRy + 56 * dpr);
      ctx.fillStyle = '#94A3B8';
      ctx.font = `600 ${Math.round(11 * dpr)}px sans-serif`;
      ctx.fillText('DRAG TO ROTATE HERO PEDESTAL', cx, pedY + pedRy + 76 * dpr);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [heroId, skinId]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
      onPointerDown={(e) => {
        dragRef.current = { active: true, lastX: e.clientX };
      }}
      onPointerMove={(e) => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.lastX;
        dragRef.current.lastX = e.clientX;
        rotRef.current += dx * 0.012;
      }}
      onPointerUp={() => {
        dragRef.current.active = false;
      }}
      onPointerLeave={() => {
        dragRef.current.active = false;
      }}
    />
  );
};
