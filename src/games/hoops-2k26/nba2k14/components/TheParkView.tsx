import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, MapPin, Play, Trophy, Users } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { PARK_COURTS, PARK_REP_TIERS, getParkRepTier } from '../data/modesData';
import { getAllPlayers } from '../data/rosters';
import type { MatchConfig, Nba2k14SaveData, PlayerData } from '../types';

interface TheParkViewProps {
  save: Nba2k14SaveData;
  onStartMatch: (cfg: MatchConfig) => void;
}

export const TheParkView: React.FC<TheParkViewProps> = ({ save, onStartMatch }) => {
  const [avatarPos, setAvatarPos] = useState({ x: 50, y: 52 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number; courtId?: string } | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>(PARK_COURTS[5].id);
  const keysRef = useRef<Set<string>>(new Set());

  const selectedCourt = useMemo(
    () => PARK_COURTS.find((c) => c.id === selectedCourtId) ?? PARK_COURTS[0],
    [selectedCourtId]
  );

  const repTier = getParkRepTier(save.vip.parkRep);
  const nextTier = PARK_REP_TIERS.find((t) => t.minRep > save.vip.parkRep);
  const prevMin = PARK_REP_TIERS.filter((t) => t.minRep <= save.vip.parkRep).slice(-1)[0]?.minRep ?? 0;
  const repPct = nextTier
    ? Math.min(100, Math.round(((save.vip.parkRep - prevMin) / Math.max(1, nextTier.minRep - prevMin)) * 100))
    : 100;

  const parkLeaderboard = useMemo(
    () =>
      [
        { name: 'Venice_King6', rep: 18420, wins: 142, streak: 9 },
        { name: 'RuckerGod_2K', rep: 14950, wins: 118, streak: 6 },
        { name: 'DadeCountyFlash', rep: 11200, wins: 94, streak: 5 },
        { name: `${save.vip.name} (YOU)`, rep: save.vip.parkRep, wins: save.vip.parkWins, streak: save.vip.parkStreak },
      ].sort((a, b) => b.rep - a.rep),
    [save.vip.name, save.vip.parkRep, save.vip.parkWins, save.vip.parkStreak]
  );

  const launchParkCourt = (courtId: string) => {
    const court = PARK_COURTS.find((c) => c.id === courtId) ?? selectedCourt;
    Nba2k14Audio.playUiClick('select');
    const pool = getAllPlayers().filter((p) => p.ovr >= 78 && p.ovr <= 92);
    const pickSquad = (count: number, offset: number, includeMyPlayer: boolean): PlayerData[] => {
      const list: PlayerData[] = [];
      if (includeMyPlayer) list.push(save.myCareer.player);
      for (let i = 0; list.length < count && i < pool.length; i++) {
        const cand = pool[(offset + i * 7) % pool.length];
        if (!list.some((p) => p.id === cand.id)) list.push(cand);
      }
      return list;
    };
    const seed = court.playersPerSide * 13 + court.streak * 5;
    onStartMatch({
      mode: 'park',
      title: `THE PARK · ${court.name}`,
      subtitle: `${court.format} Streetball · Game to ${court.targetScore} (Win by 2) · vs ${court.squadName}`,
      homeTeamId: save.myCareer.teamId || 'mia',
      awayTeamId: 'lac',
      homeCustomPlayers: pickSquad(court.playersPerSide, seed, true),
      awayCustomPlayers: pickSquad(court.playersPerSide, seed + 19, false),
      userSide: 'home',
      courtEnv: 'park',
      quarterLengthMin: 12,
      targetScore: court.targetScore,
      halfCourt: court.halfCourt,
      playersPerSide: court.playersPerSide,
      parkCourtId: court.id,
    });
  };

  // Walkable avatar loop (WASD / Arrow keys + click-to-walk onto GOT NEXT pad)
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const keys = keysRef.current;
      let vx = 0;
      let vy = 0;
      if (keys.has('KeyW') || keys.has('ArrowUp')) vy -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) vy += 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) vx -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) vx += 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy);
        setTargetPos(null);
        setAvatarPos((prev) => {
          const nx = Math.max(6, Math.min(94, prev.x + (vx / len) * 28 * dt));
          const ny = Math.max(8, Math.min(92, prev.y + (vy / len) * 28 * dt));
          const near = PARK_COURTS.find((c) => Math.hypot(c.gotNextX - nx, c.gotNextY - ny) < 8);
          if (near) setSelectedCourtId(near.id);
          return { x: nx, y: ny };
        });
      } else if (targetPos) {
        setAvatarPos((prev) => {
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 1.2) {
            const arriveCourtId = targetPos.courtId;
            setTargetPos(null);
            if (arriveCourtId) {
              setSelectedCourtId(arriveCourtId);
            }
            return { x: targetPos.x, y: targetPos.y };
          }
          const step = Math.min(dist, 42 * dt);
          return {
            x: prev.x + (dx / dist) * step,
            y: prev.y + (dy / dist) * step,
          };
        });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [targetPos]);

  const walkToCourt = (courtId: string) => {
    const court = PARK_COURTS.find((c) => c.id === courtId);
    if (!court) return;
    Nba2k14Audio.playUiClick('hover');
    setSelectedCourtId(court.id);
    setTargetPos({ x: court.gotNextX, y: court.gotNextY, courtId: court.id });
  };

  return (
    <div className="h-full flex flex-col px-5 py-3 overflow-hidden">
      {/* Park Header */}
      <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-5 py-3 mb-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F9A01B]">
            NBA 2K14 · OPEN-AIR BLACKTOP PLAZA
          </div>
          <h2 className="text-xl font-black text-white uppercase">THE PARK · GOT NEXT STREETBALL</h2>
        </div>
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-black text-[#F9A01B] uppercase">{repTier}</span>
              <span className="text-zinc-400 font-bold">{save.vip.parkRep.toLocaleString()} REP</span>
            </div>
            <div className="w-44 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-[#CE1141] to-[#F9A01B]" style={{ width: `${repPct}%` }} />
            </div>
          </div>
          <div className="text-xs text-right">
            <div className="text-white font-black">
              {save.vip.parkWins}W - {save.vip.parkLosses}L
            </div>
            <div className="text-[#F9A01B] font-bold flex items-center justify-end gap-1">
              <Flame className="w-3.5 h-3.5" /> Streak: {save.vip.parkStreak}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Interactive Walkable Playground Plaza Map */}
        <div className="lg:col-span-2 relative bg-[#11161d] border border-white/15 rounded-xl overflow-hidden select-none min-h-[340px]">
          {/* Sunset Asphalt Grid & Palm Courtyard Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, #27222b 0%, #171a22 55%, #0d1016 100%)',
            }}
          />
          {/* Plaza Walkways */}
          <div className="absolute left-0 right-0 top-[49%] h-10 bg-zinc-900/70 border-y border-white/10" />
          <div className="absolute top-0 bottom-0 left-[34%] w-6 bg-zinc-900/60" />
          <div className="absolute top-0 bottom-0 left-[64%] w-6 bg-zinc-900/60" />

          <div className="absolute top-2.5 left-3 z-10 px-2.5 py-1 rounded bg-black/70 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase">
            Move Avatar: WASD / Arrows or Click any Court / GOT NEXT Circle
          </div>

          {/* 6 Park Courts */}
          {PARK_COURTS.map((court) => {
            const active = selectedCourtId === court.id;
            const isKing = court.format === '5v5';
            return (
              <React.Fragment key={court.id}>
                <button
                  onClick={() => walkToCourt(court.id)}
                  style={{
                    left: `${court.xPct}%`,
                    top: `${court.yPct}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute rounded-lg border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                    isKing ? 'w-44 h-24' : 'w-36 h-20'
                  } ${
                    active
                      ? 'bg-[#2a171c] border-[#F9A01B] shadow-[0_0_24px_rgba(249,160,27,0.35)]'
                      : 'bg-[#1a222d] border-white/20 hover:border-white/50'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-[#F9A01B]">
                    {court.format} · TO {court.targetScore}
                  </div>
                  <div className="text-xs font-black text-white leading-tight px-1 text-center">{court.name}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-zinc-300">
                    <span className="text-amber-300">{court.streak}W STREAK</span>
                    <span>OVR {court.oppOvr}</span>
                  </div>
                </button>

                {/* Glowing GOT NEXT Circle */}
                <button
                  onClick={() => walkToCourt(court.id)}
                  style={{
                    left: `${court.gotNextX}%`,
                    top: `${court.gotNextY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border cursor-pointer transition ${
                    active
                      ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                      : 'bg-black/80 border-emerald-400/70 text-emerald-300 hover:bg-emerald-900/60'
                  }`}
                >
                  GOT NEXT
                </button>
              </React.Fragment>
            );
          })}

          {/* Walkable MyPLAYER Avatar */}
          <div
            style={{
              left: `${avatarPos.x}%`,
              top: `${avatarPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-20 pointer-events-none flex flex-col items-center"
          >
            <div className="px-2 py-0.5 rounded bg-black/85 border border-[#F9A01B] text-[9px] font-black text-[#F9A01B] whitespace-nowrap mb-0.5">
              {save.myCareer.player.name} ({save.myCareer.player.ovr})
            </div>
            <div className="w-7 h-7 rounded-full bg-[#CE1141] border-2 border-[#F9A01B] flex items-center justify-center text-white font-black text-[10px] shadow-lg">
              #{save.myCareer.player.jersey}
            </div>
          </div>
        </div>

        {/* Selected Court Details & Park Leaderboard */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#F9A01B] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Selected Court
              </span>
              <span className="px-2 py-0.5 rounded bg-[#CE1141]/25 border border-[#CE1141] text-white text-[10px] font-black">
                {selectedCourt.format}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">{selectedCourt.name}</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Defending Squad: <strong className="text-white">{selectedCourt.squadName}</strong> ({selectedCourt.streak}-Game Win Streak · Avg {selectedCourt.oppOvr} OVR)
            </p>
            <div className="grid grid-cols-2 gap-2 my-3 text-xs">
              <div className="bg-[#151820] border border-white/10 rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Rules</div>
                <div className="font-bold text-white">Game to {selectedCourt.targetScore} · 1s & 2s</div>
              </div>
              <div className="bg-[#151820] border border-white/10 rounded-lg p-2.5">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Court Format</div>
                <div className="font-bold text-white">{selectedCourt.halfCourt ? 'Half-Court' : 'Full-Court 5v5'}</div>
              </div>
            </div>
            <button
              onClick={() => launchParkCourt(selectedCourt.id)}
              className="w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Step On GOT NEXT & Tip Off
            </button>
          </div>

          <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex-1">
            <div className="text-xs font-black uppercase tracking-wider text-[#F9A01B] mb-2.5 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Park REP Leaderboard
            </div>
            <div className="space-y-2">
              {parkLeaderboard.map((row, idx) => (
                <div
                  key={row.name}
                  className={`rounded-lg px-3 py-2 border flex items-center justify-between text-xs ${
                    row.name.includes('(YOU)')
                      ? 'bg-[#1d1714] border-[#F9A01B]/60'
                      : 'bg-[#151820] border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-zinc-400">#{idx + 1}</span>
                    <span className="font-bold text-white">{row.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#F9A01B]">{row.rep.toLocaleString()} REP</span>
                    <span className="ml-2 text-zinc-400">{row.wins}W</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              All 6 courts live: 2x 2v2 · 3x 3v3 · 1x 5v5 King of the Court
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
