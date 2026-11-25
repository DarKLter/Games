import React, { useEffect, useRef, useState } from 'react';
import {
  MiniMilitiaHudSnapshot,
  MiniMilitiaSave,
  MmMatchConfig,
  MmMatchSummary
} from '../types';
import { MiniMilitiaGameEngine } from '../engine/GameEngine';
import { getMmRankForXp, MM_QUICK_CHATS } from '../data/progression';
import { getMmGrenadeById, MM_PREBUILT_LOADOUTS } from '../data/weapons';
import { mmAudio } from '../engine/AudioEngine';
import { WeaponVectorIcon } from './AvatarPreviewCanvas';

interface BattleHUDProps {
  config: MmMatchConfig;
  save: MiniMilitiaSave;
  onMatchFinish: (summary: MmMatchSummary) => void;
  onExitToLobby: () => void;
  onOpenSettings: () => void;
}

function formatClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  config,
  save,
  onMatchFinish,
  onExitToLobby,
  onOpenSettings
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MiniMilitiaGameEngine | null>(null);
  const [hud, setHud] = useState<MiniMilitiaHudSnapshot | null>(null);
  const [paused, setPaused] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showQuickChat, setShowQuickChat] = useState(false);

  // Virtual Joystick visual knob offsets
  const [leftKnob, setLeftKnob] = useState({ dx: 0, dy: 0, active: false });
  const [rightKnob, setRightKnob] = useState({ dx: 0, dy: 0, active: false, firing: false });
  const leftPointerId = useRef<number | null>(null);
  const rightPointerId = useRef<number | null>(null);
  const leftOrigin = useRef({ x: 0, y: 0 });
  const rightOrigin = useRef({ x: 0, y: 0 });

  // Mount & start 60Hz MiniMilitiaGameEngine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = Math.max(640, parent.clientWidth);
      canvas.height = Math.max(360, parent.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const rankDiscount = getMmRankForXp(save.xp).current.discountPct;
    const eng = new MiniMilitiaGameEngine(
      canvas,
      config,
      save,
      rankDiscount,
      (snap) => setHud(snap),
      (summary) => onMatchFinish(summary)
    );
    engineRef.current = eng;
    eng.start();

    return () => {
      window.removeEventListener('resize', resize);
      eng.destroy();
      engineRef.current = null;
    };
    // Intentionally mount once per match config
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  // Live-sync settings updates into running engine
  useEffect(() => {
    engineRef.current?.updateSettings(save.settings);
  }, [save.settings]);

  // Tab scoreboard & Esc pause keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      } else if (e.code === 'Escape') {
        e.preventDefault();
        setPaused((prev) => {
          const next = !prev;
          engineRef.current?.setPaused(next);
          return next;
        });
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const togglePause = (next: boolean) => {
    mmAudio.playClick();
    setPaused(next);
    engineRef.current?.setPaused(next);
  };

  // Helper to apply custom HUD positions/scale/opacity (and Left-Handed flip)
  const ctrlStyle = (id: string, fallbackX: number, fallbackY: number): React.CSSProperties => {
    const c = save.customHud[id];
    let x = c?.xPct ?? fallbackX;
    if (save.settings.controls.leftHanded) x = 100 - x;
    const y = c?.yPct ?? fallbackY;
    const scale = c?.scale ?? 1;
    const opacity = c?.opacity ?? 0.9;
    return {
      left: `${x}%`,
      top: `${y}%`,
      opacity,
      transform: `translate(-50%, -50%) scale(${scale})`
    };
  };

  // Virtual Joystick Pointer Handlers (Multi-Touch Safe)
  const STICK_RADIUS = 46;

  const onLeftStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    leftPointerId.current = e.pointerId;
    const rect = e.currentTarget.getBoundingClientRect();
    leftOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateLeftStick(e.clientX, e.clientY);
  };

  const updateLeftStick = (cx: number, cy: number) => {
    const dx = cx - leftOrigin.current.x;
    const dy = cy - leftOrigin.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(STICK_RADIUS, dist);
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * clamped;
    const ky = Math.sin(ang) * clamped;
    setLeftKnob({ dx: kx, dy: ky, active: true });
    engineRef.current?.setTouchMoveStick(kx / STICK_RADIUS, ky / STICK_RADIUS);
  };

  const onLeftStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leftPointerId.current !== e.pointerId) return;
    updateLeftStick(e.clientX, e.clientY);
  };

  const onLeftStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (leftPointerId.current !== e.pointerId) return;
    leftPointerId.current = null;
    setLeftKnob({ dx: 0, dy: 0, active: false });
    engineRef.current?.setTouchMoveStick(0, 0);
  };

  const onRightStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rightPointerId.current = e.pointerId;
    const rect = e.currentTarget.getBoundingClientRect();
    rightOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    updateRightStick(e.clientX, e.clientY);
  };

  const updateRightStick = (cx: number, cy: number) => {
    const dx = cx - rightOrigin.current.x;
    const dy = cy - rightOrigin.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(STICK_RADIUS, dist);
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * clamped;
    const ky = Math.sin(ang) * clamped;
    const mag = clamped / STICK_RADIUS;
    const firing =
      save.settings.controls.controlScheme === 'dual_stick' &&
      mag >= save.settings.controls.fireRingThreshold / 100;
    setRightKnob({ dx: kx, dy: ky, active: true, firing });
    engineRef.current?.setTouchAimStick(true, ang, mag);
  };

  const onRightStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rightPointerId.current !== e.pointerId) return;
    updateRightStick(e.clientX, e.clientY);
  };

  const onRightStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (rightPointerId.current !== e.pointerId) return;
    rightPointerId.current = null;
    setRightKnob({ dx: 0, dy: 0, active: false, firing: false });
    engineRef.current?.setTouchAimStick(false, 0, 0);
  };

  const activeGrenade = hud ? getMmGrenadeById(hud.player.grenadeType) : null;
  const allLoadouts = [...MM_PREBUILT_LOADOUTS, ...save.customLoadouts];
  const rankDiscount = getMmRankForXp(save.xp).current.discountPct;

  return (
    <div className="relative w-full h-full bg-[#111612] overflow-hidden select-none">
      {/* 60 FPS Live Battlefield Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {hud && (
        <>
          {/* ==================== TOP-LEFT: HP, JETPACK, SCORE & ZOOM ==================== */}
          <div className="pointer-events-none absolute top-2 left-2 z-20 flex flex-col gap-1.5 max-w-[235px]">
            {/* Score & Match Clock */}
            <div className="px-2.5 py-1 rounded bg-[#181C1F]/85 border border-[#4F5D3B] flex items-center gap-2 font-mono text-xs tabular-nums shadow">
              {hud.mode === 'survival' ? (
                <>
                  <span className="text-[#F5A623] font-black">WAVE {hud.survivalWave}</span>
                  <span className="text-[#D6D3C4]">· {hud.survivalEnemiesAlive} Left</span>
                </>
              ) : hud.mode === 'bootcamp' ? (
                <span className="text-[#F5A623] font-black">BOOT CAMP {hud.bootcampStep + 1}/7</span>
              ) : hud.mode === 'ffa' ? (
                <>
                  <span className="text-[#F5A623] font-black">#{hud.ffaRank}</span>
                  <span>{hud.player.kills}/{hud.scoreLimit} K</span>
                  <span className="text-[#C2B280]">{formatClock(hud.timeRemainingSec)}</span>
                </>
              ) : (
                <>
                  <span className="text-[#38BDF8] font-black">{hud.scoreBlue}</span>
                  <span className="text-[#6B7280]">-</span>
                  <span className="text-[#F87171] font-black">{hud.scoreRed}</span>
                  <span className="text-[#C2B280] ml-1">{formatClock(hud.timeRemainingSec)}</span>
                </>
              )}
              {save.settings.video.showFpsPing && (
                <span className="text-[10px] text-[#9CA3AF] ml-auto">
                  {hud.fps}FPS · {hud.pingMs}ms
                </span>
              )}
            </div>

            {/* Health Meter (Non-Hue-Only: Icon + Bar + Numeric) */}
            <div className="px-2 py-1 rounded bg-[#181C1F]/85 border border-[#4F5D3B] shadow">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#22C55E] font-bold">✚ HEALTH</span>
                <span className="tabular-nums font-bold text-white">
                  {Math.ceil(hud.player.hp)}/{hud.player.maxHp}
                </span>
              </div>
              <div className="w-full h-2 bg-[#111] rounded-sm overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all ${
                    hud.player.hp / hud.player.maxHp < 0.3 ? 'bg-[#EF4444]' : 'bg-[#22C55E]'
                  }`}
                  style={{ width: `${Math.max(0, (hud.player.hp / hud.player.maxHp) * 100)}%` }}
                />
              </div>

              {/* Jetpack Nitro Meter */}
              <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                <span className={hud.player.empDisabledSec > 0 ? 'text-[#38BDF8] font-bold' : 'text-[#F5A623] font-bold'}>
                  {hud.player.empDisabledSec > 0 ? '⚡ EMP DISABLED' : '🚀 NITRO'}
                </span>
                <span className="tabular-nums text-[#C2B280]">{Math.round(hud.player.jetFuel)}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#111] rounded-sm overflow-hidden mt-0.5">
                <div
                  className={`h-full ${hud.player.empDisabledSec > 0 ? 'bg-[#38BDF8]' : 'bg-[#F5A623]'}`}
                  style={{ width: `${Math.max(0, (hud.player.jetFuel / hud.player.maxJetFuel) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stealth / Flag / Boost Badges */}
            {(hud.player.stealthHidden || hud.player.carryingFlag || hud.player.boostTimer > 0) && (
              <div className="flex flex-wrap gap-1 text-[10px] font-mono font-bold">
                {hud.player.stealthHidden && (
                  <span className="px-1.5 py-0.5 rounded bg-[#1F2937]/90 border border-[#9CA3AF] text-[#E5E7EB]">
                    👁️ STEALTH
                  </span>
                )}
                {hud.player.carryingFlag && (
                  <span className="px-1.5 py-0.5 rounded bg-[#F5A623] text-[#181C1F]">🚩 FLAG CARRIER</span>
                )}
                {hud.player.boostTimer > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-[#DC2626] text-white">
                    ⚡ BOOST {hud.player.boostTimer.toFixed(0)}s
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ==================== TOP-CENTER: WEAPON SLOT (TAP TO SWAP) & BANNERS ==================== */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
            <button
              type="button"
              onClick={() => engineRef.current?.triggerSwapWeapon()}
              title="Tap or press Q to Swap Weapon"
              className="pointer-events-auto flex items-center gap-2 px-3 py-1 rounded bg-[#181C1F]/90 hover:bg-[#23272A] border-2 border-[#4F5D3B] hover:border-[#F5A623] shadow-lg"
            >
              <WeaponVectorIcon weaponId={hud.player.activeWeaponId} width={68} height={26} />
              {hud.player.offhandWeaponId && (
                <>
                  <span className="text-[#F5A623] font-black text-xs">+</span>
                  <WeaponVectorIcon weaponId={hud.player.offhandWeaponId} width={54} height={22} />
                </>
              )}
              <div className="text-left font-mono leading-tight">
                <div className="text-[11px] font-black text-[#F5A623] truncate max-w-[130px]">
                  {hud.player.activeWeaponName}
                  {hud.player.offhandWeaponName ? ` + ${hud.player.offhandWeaponName}` : ''}
                </div>
                <div className="text-xs font-bold tabular-nums text-white">
                  {hud.player.reloading
                    ? `RELOADING ${Math.round(hud.player.reloadProgress * 100)}%`
                    : `${hud.player.mag}/${hud.player.magMax} · ${hud.player.reserve}`}
                </div>
              </div>
            </button>

            {/* Boot Camp Sarge Objective Prompt */}
            {hud.mode === 'bootcamp' && (
              <div className="px-3 py-1 rounded bg-[#2A3320]/95 border border-[#F5A623] text-xs font-mono font-bold text-[#FEF08A] text-center max-w-md shadow">
                🎖️ SARGE: {hud.bootcampPrompt}
              </div>
            )}

            {/* PTB Bomb Timer / Action Prompt */}
            {hud.mode === 'ptb' && (
              <div className="px-3 py-1 rounded bg-[#7F1D1D]/90 border border-[#F87171] text-xs font-mono font-bold text-white">
                {hud.ptbBombState === 'planted'
                  ? `💣 BOMB AT SITE ${hud.ptbBombSite} · ${hud.ptbBombTimer.toFixed(1)}s`
                  : `ROUND ${hud.ptbRound} · BLUE ${hud.ptbBlueRounds} - ${hud.ptbRedRounds} RED`}
                {hud.ptbCanPlantOrDefuse && (
                  <span className="ml-2 text-[#FEF08A]">
                    HOLD E TO {hud.ptbCanPlantOrDefuse.toUpperCase()} ({Math.round(hud.ptbActionProgress * 100)}%)
                  </span>
                )}
              </div>
            )}

            {/* Killstreak / Wave / Flag Banner */}
            {hud.banner && (
              <div
                className="px-4 py-1.5 rounded bg-black/80 border-2 text-center shadow-xl"
                style={{ borderColor: hud.banner.color }}
              >
                <div className="text-sm font-black uppercase tracking-wider" style={{ color: hud.banner.color }}>
                  {hud.banner.text}
                </div>
                {hud.banner.sub && <div className="text-[11px] font-mono text-[#E5E7EB]">{hud.banner.sub}</div>}
              </div>
            )}
          </div>

          {/* ==================== TOP-RIGHT: KILL FEED & UTILITY BUTTONS ==================== */}
          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  setShowScoreboard((v) => !v);
                }}
                className="px-2 py-1 rounded bg-[#181C1F]/90 hover:bg-[#2A3320] border border-[#4F5D3B] text-xs font-mono text-[#C2B280]"
                title="Live Scoreboard (Tab)"
              >
                📊
              </button>
              <button
                type="button"
                onClick={() => togglePause(!paused)}
                className="px-2.5 py-1 rounded bg-[#181C1F]/90 hover:bg-[#2A3320] border border-[#F5A623]/70 text-xs font-black text-[#F5A623]"
                title="Pause Match (Esc)"
              >
                ⏸
              </button>
            </div>

            {/* Kill Feed (Last 4) */}
            <div className="pointer-events-none flex flex-col items-end gap-1">
              {hud.killFeed.slice(0, 4).map((kf) => (
                <div
                  key={kf.id}
                  className="px-2 py-0.5 rounded bg-black/70 border border-[#3E4A2E] text-[10px] font-mono flex items-center gap-1"
                >
                  <span className={kf.killerTeam === 'blue' ? 'text-[#38BDF8] font-bold' : 'text-[#F87171] font-bold'}>
                    {kf.killer}
                  </span>
                  <span className="text-[#C2B280]">
                    [{kf.weaponName}
                    {kf.headshot ? ' 🎯' : ''}]
                  </span>
                  <span className={kf.victimTeam === 'blue' ? 'text-[#38BDF8]' : 'text-[#F87171]'}>
                    {kf.victim}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ==================== CUSTOM-POSITIONED ACTION BUTTONS ==================== */}
          {/* Zoom Button */}
          <button
            type="button"
            onClick={() => engineRef.current?.cycleZoom()}
            style={ctrlStyle('zoomBtn', 10, 28)}
            className="absolute z-20 px-2.5 py-1.5 rounded bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono font-bold text-[#F5A623]"
          >
            🔍 {hud.player.zoomLevel.toFixed(1)}x
          </button>

          {/* Grenade Throw + Cycle Pill */}
          {activeGrenade && (
            <div
              style={ctrlStyle('grenadeBtn', 86, 12)}
              className="absolute z-20 flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => engineRef.current?.cycleGrenadeType(1)}
                className="px-1.5 py-2 rounded bg-[#181C1F]/90 border border-[#4F5D3B] text-[10px] font-mono text-[#C2B280]"
                title="Cycle Grenade Type (C)"
              >
                ⇄
              </button>
              <button
                type="button"
                onClick={() => engineRef.current?.triggerThrowGrenade()}
                className="px-2.5 py-1.5 rounded bg-[#23272A]/90 hover:bg-[#3A472D] border-2 border-[#F5A623] text-xs font-mono font-bold flex items-center gap-1"
                title="Throw Grenade (G)"
              >
                <span>{activeGrenade.icon}</span>
                <span className="tabular-nums">{hud.player.grenades[hud.player.grenadeType] ?? 0}</span>
              </button>
            </div>
          )}

          {/* Reload Button */}
          <button
            type="button"
            onClick={() => engineRef.current?.triggerReload()}
            style={ctrlStyle('reloadBtn', 86, 24)}
            className="absolute z-20 px-2.5 py-1.5 rounded bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono font-bold text-[#F4F4EC]"
            title="Reload (R)"
          >
            🔄 RLD
          </button>

          {/* Quick Chat Button */}
          <div style={ctrlStyle('quickChat', 93, 36)} className="absolute z-20">
            <button
              type="button"
              onClick={() => setShowQuickChat((v) => !v)}
              className="w-9 h-9 rounded-full bg-[#181C1F]/85 hover:bg-[#2A3320] border border-[#5D7045] text-sm"
              title="Quick Chat Emotes"
            >
              💬
            </button>
            {showQuickChat && (
              <div className="absolute right-10 top-0 w-44 p-1.5 rounded bg-[#181C1F]/95 border border-[#F5A623] grid grid-cols-2 gap-1 shadow-xl">
                {MM_QUICK_CHATS.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      engineRef.current?.triggerQuickChat(q.text);
                      setShowQuickChat(false);
                    }}
                    className="px-1.5 py-1 rounded bg-[#2A3320] hover:bg-[#3B4B2E] text-[10px] font-mono text-left truncate"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contextual Ground Loot Pickup Popup */}
          {hud.nearbyPickup && hud.player.alive && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded bg-[#181C1F]/95 border-2 border-[#F5A623] shadow-xl">
              <WeaponVectorIcon weaponId={hud.nearbyPickup.weaponId} width={60} height={24} />
              <div className="text-xs font-mono">
                <div className="font-bold text-white">{hud.nearbyPickup.weaponName}</div>
                <div className="flex gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => engineRef.current?.triggerPickup(false)}
                    className="px-2 py-0.5 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase"
                  >
                    [E] SWAP
                  </button>
                  {hud.nearbyPickup.canDualWield && (
                    <button
                      type="button"
                      onClick={() => engineRef.current?.triggerPickup(true)}
                      className="px-2 py-0.5 rounded bg-[#22C55E] text-[#0F172A] text-[10px] font-black uppercase"
                    >
                      [X] + DUAL WIELD
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIRTUAL DUAL-STICK TOUCH CONTROLS ==================== */}
          {/* Left Move / Jetpack Virtual Stick */}
          <div
            style={ctrlStyle('leftStick', 12, 76)}
            onPointerDown={onLeftStickDown}
            onPointerMove={onLeftStickMove}
            onPointerUp={onLeftStickUp}
            onPointerCancel={onLeftStickUp}
            className="absolute z-20 w-28 h-28 rounded-full border-2 border-[#C2B280]/55 bg-[#181C1F]/45 touch-none flex items-center justify-center"
          >
            <div className="text-[9px] font-mono text-[#C2B280]/70 absolute top-1.5">🚀 UP</div>
            <div
              style={{ transform: `translate(${leftKnob.dx}px, ${leftKnob.dy}px)` }}
              className={`w-11 h-11 rounded-full border-2 ${
                leftKnob.active
                  ? 'border-[#F5A623] bg-[#F5A623]/45'
                  : 'border-[#C2B280]/75 bg-[#2A3320]/75'
              }`}
            />
          </div>

          {/* Right 360° Aim / Auto-Fire Virtual Stick */}
          <div
            style={ctrlStyle('rightStick', 88, 76)}
            onPointerDown={onRightStickDown}
            onPointerMove={onRightStickMove}
            onPointerUp={onRightStickUp}
            onPointerCancel={onRightStickUp}
            className={`absolute z-20 w-28 h-28 rounded-full border-2 touch-none flex items-center justify-center ${
              rightKnob.firing
                ? 'border-[#EF4444] bg-[#7F1D1D]/40'
                : 'border-[#F5A623]/60 bg-[#181C1F]/45'
            }`}
          >
            {/* Outer Auto-Fire Threshold Ring */}
            {save.settings.controls.controlScheme === 'dual_stick' && (
              <div
                className="pointer-events-none absolute rounded-full border border-dashed border-[#EF4444]/65"
                style={{
                  width: `${save.settings.controls.fireRingThreshold}%`,
                  height: `${save.settings.controls.fireRingThreshold}%`
                }}
              />
            )}
            <div
              style={{ transform: `translate(${rightKnob.dx}px, ${rightKnob.dy}px)` }}
              className={`w-11 h-11 rounded-full border-2 ${
                rightKnob.firing
                  ? 'border-[#FCA5A5] bg-[#EF4444]/75'
                  : 'border-[#F5A623]/80 bg-[#23272A]/80'
              }`}
            />
          </div>

          {/* Optional Separate Fire Button */}
          {save.settings.controls.controlScheme === 'separate_fire' && (
            <button
              type="button"
              style={ctrlStyle('fireBtn', 78, 60)}
              onPointerDown={() => engineRef.current?.setTouchFireButton(true)}
              onPointerUp={() => engineRef.current?.setTouchFireButton(false)}
              onPointerLeave={() => engineRef.current?.setTouchFireButton(false)}
              className="absolute z-20 w-16 h-16 rounded-full bg-[#D93829]/85 active:bg-[#EF4444] border-2 border-[#FCA5A5] text-xs font-black uppercase shadow-lg touch-none"
            >
              FIRE
            </button>
          )}

          {/* Crouch / Combat Roll Button */}
          <button
            type="button"
            style={ctrlStyle('crouchBtn', 26, 87)}
            onPointerDown={() => engineRef.current?.setTouchCrouch(true)}
            onPointerUp={() => engineRef.current?.setTouchCrouch(false)}
            onPointerLeave={() => engineRef.current?.setTouchCrouch(false)}
            className="absolute z-20 px-3 py-2 rounded-full bg-[#181C1F]/80 border border-[#C2B280]/70 text-[10px] font-mono font-bold touch-none"
          >
            CROUCH
          </button>

          {/* Melee / Machete Button */}
          <button
            type="button"
            style={ctrlStyle('meleeBtn', 74, 86)}
            onPointerDown={() => engineRef.current?.triggerMelee()}
            className="absolute z-20 w-12 h-12 rounded-full bg-[#2A3320]/90 active:bg-[#F5A623] border-2 border-[#F5A623] text-base flex items-center justify-center shadow touch-none"
            title="Melee / Machete (F)"
          >
            🔪
          </button>

          {/* ==================== RESPAWN LOADOUT PICKER OVERLAY ==================== */}
          {!hud.player.alive && !hud.matchEnded && (
            <div className="absolute inset-0 z-30 bg-black/55 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl p-4 rounded border-2 border-[#F5A623] bg-[#1E2420]/95 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black uppercase text-[#F87171]">KIA — RESPAWNING</div>
                    <div className="text-xs font-mono text-[#C2B280]">
                      Deploying in {hud.player.respawnSec.toFixed(1)}s · Coins: 🪙 {hud.player.coins}
                    </div>
                  </div>
                  <span className="text-2xl font-mono font-black text-[#F5A623] tabular-nums">
                    {Math.ceil(hud.player.respawnSec)}s
                  </span>
                </div>

                {!hud.classicV4 && (
                  <div>
                    <div className="text-[11px] font-mono uppercase text-[#C2B280] mb-1.5">
                      QUICK SWAP RESPAWN LOADOUT
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-[190px] overflow-y-auto">
                      {allLoadouts.map((ld) => {
                        const cost = Math.round(ld.coinCost * (1 - rankDiscount / 100));
                        const selected = hud.player.activeLoadoutId === ld.id;
                        return (
                          <button
                            key={ld.id}
                            type="button"
                            disabled={cost > hud.player.coins && !selected}
                            onClick={() => engineRef.current?.selectRespawnLoadout(ld.id)}
                            className={`p-2 rounded border text-left text-[11px] ${
                              selected
                                ? 'border-[#22C55E] bg-[#243822]'
                                : 'border-[#4F5D3B] bg-[#23272A] hover:border-[#F5A623] disabled:opacity-40'
                            }`}
                          >
                            <div className="font-bold truncate">{ld.name}</div>
                            <div className="text-[10px] font-mono text-[#F5A623]">
                              {selected ? '✓ ACTIVE' : cost === 0 ? 'FREE' : `🪙 ${cost}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== LIVE SCOREBOARD MODAL (TAB) ==================== */}
          {showScoreboard && (
            <div className="absolute inset-0 z-40 bg-black/65 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl p-4 rounded border-2 border-[#5D7045] bg-[#1E2420] shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black uppercase text-[#F5A623]">
                    📊 LIVE SCOREBOARD — {hud.mapName} ({hud.mode.toUpperCase()})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowScoreboard(false)}
                    className="px-2 py-0.5 rounded bg-[#374151] text-xs font-mono"
                  >
                    Close
                  </button>
                </div>
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="text-[#C2B280] border-b border-[#3E4A2E]">
                      <th className="py-1">Soldier</th>
                      <th className="py-1">Team</th>
                      <th className="py-1 text-right">K</th>
                      <th className="py-1 text-right">D</th>
                      <th className="py-1 text-right">A</th>
                      <th className="py-1 text-right">Ping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hud.scoreboard.map((r) => (
                      <tr key={r.id} className={r.isPlayer ? 'bg-[#364428]/70 font-bold' : ''}>
                        <td className="py-1">
                          {r.isMvp ? '👑 ' : ''}
                          {r.name}
                        </td>
                        <td className="py-1 uppercase">{r.team}</td>
                        <td className="py-1 text-right tabular-nums text-[#22C55E]">{r.kills}</td>
                        <td className="py-1 text-right tabular-nums text-[#F87171]">{r.deaths}</td>
                        <td className="py-1 text-right tabular-nums">{r.assists}</td>
                        <td className="py-1 text-right tabular-nums text-[#9CA3AF]">{r.pingMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== PAUSE MENU OVERLAY (ESC) ==================== */}
          {paused && (
            <div className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-sm p-5 rounded border-2 border-[#F5A623] bg-[#1E2420] space-y-2.5 text-center shadow-2xl">
                <h3 className="text-lg font-black uppercase text-[#F5A623]">⏸ MATCH PAUSED</h3>
                <p className="text-xs font-mono text-[#C2B280]">
                  {hud.mapName} · {hud.mode.toUpperCase()}
                </p>
                <button
                  type="button"
                  onClick={() => togglePause(false)}
                  className="w-full py-2.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
                >
                  ▶ Resume Battle
                </button>
                {hud.mode !== 'ffa' && hud.mode !== 'survival' && hud.mode !== 'bootcamp' && (
                  <button
                    type="button"
                    onClick={() => {
                      engineRef.current?.swapPlayerTeam();
                      togglePause(false);
                    }}
                    className="w-full py-2 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-black uppercase"
                  >
                    ⇄ Switch Team
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="w-full py-2 rounded bg-[#23272A] border border-[#4F5D3B] text-xs font-black uppercase"
                >
                  ⚙️ Settings & HUD Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    onExitToLobby();
                  }}
                  className="w-full py-2 rounded bg-[#7F1D1D] hover:bg-[#B91C1C] text-xs font-black uppercase"
                >
                  ✕ Leave Match to Lobby
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
