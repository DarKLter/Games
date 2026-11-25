import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MlbbHudSnapshot, MlbbMatchLaunchConfig, MlbbProfileSave } from '../types';
import { formatClock, PRIMARY_2026_VARIANTS, WORLD_SIZE } from '../data/mapData';
import { MlbbGameEngine } from '../engine/GameEngine';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

interface LiveStreamOverlayProps {
  profile: MlbbProfileSave;
  onExit: () => void;
}

const FEATURED_MATCHUPS: {
  title: string;
  blueTag: string;
  redTag: string;
  blue: MlbbMatchLaunchConfig['blueTeam'];
  red: MlbbMatchLaunchConfig['redTeam'];
}[] = [
  {
    title: 'MPL GRAND FINALS · ONIC vs AP BREN',
    blueTag: 'ONIC',
    redTag: 'BREN',
    blue: [
      { heroId: 'tigreal', lane: 'Roam', name: 'ONIC.Kiboy', isPlayer: true, spellId: 'flicker', emblemId: 'tank' },
      { heroId: 'lancelot', lane: 'Jungle', name: 'ONIC.Kairi', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'kagura', lane: 'Mid', name: 'ONIC.Sanz', isPlayer: false, spellId: 'flicker', emblemId: 'mage' },
      { heroId: 'beatrix', lane: 'Gold', name: 'ONIC.CW', isPlayer: false, spellId: 'flicker', emblemId: 'marksman' },
      { heroId: 'yu_zhong', lane: 'EXP', name: 'ONIC.Lutpiii', isPlayer: false, spellId: 'petrify', emblemId: 'fighter' }
    ],
    red: [
      { heroId: 'franco', lane: 'Roam', name: 'BREN.Owgwen', isPlayer: false, spellId: 'flicker', emblemId: 'tank' },
      { heroId: 'fanny', lane: 'Jungle', name: 'BREN.KyleTzy', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'valentina', lane: 'Mid', name: 'BREN.Pheww', isPlayer: false, spellId: 'flicker', emblemId: 'mage' },
      { heroId: 'wanwan', lane: 'Gold', name: 'BREN.SuperMarco', isPlayer: false, spellId: 'inspire', emblemId: 'marksman' },
      { heroId: 'lapu_lapu', lane: 'EXP', name: 'BREN.FlapTzy', isPlayer: false, spellId: 'vengeance', emblemId: 'fighter' }
    ]
  },
  {
    title: 'M-SERIES SHOWDOWN · ECHO vs RRQ',
    blueTag: 'ECHO',
    redTag: 'RRQ',
    blue: [
      { heroId: 'chou', lane: 'Roam', name: 'ECHO.Yawi', isPlayer: true, spellId: 'flicker', emblemId: 'tank' },
      { heroId: 'ling', lane: 'Jungle', name: 'ECHO.KarlTzy', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'pharsa', lane: 'Mid', name: 'ECHO.Sanji', isPlayer: false, spellId: 'purify', emblemId: 'mage' },
      { heroId: 'claude', lane: 'Gold', name: 'ECHO.Bennyqt', isPlayer: false, spellId: 'purify', emblemId: 'marksman' },
      { heroId: 'arlott', lane: 'EXP', name: 'ECHO.Sanford', isPlayer: false, spellId: 'petrify', emblemId: 'fighter' }
    ],
    red: [
      { heroId: 'khufra', lane: 'Roam', name: 'RRQ.Vyn', isPlayer: false, spellId: 'flicker', emblemId: 'tank' },
      { heroId: 'hayabusa', lane: 'Jungle', name: 'RRQ.Alberttt', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'lunox', lane: 'Mid', name: 'RRQ.Clayyy', isPlayer: false, spellId: 'flicker', emblemId: 'mage' },
      { heroId: 'brody', lane: 'Gold', name: 'RRQ.Skylar', isPlayer: false, spellId: 'flicker', emblemId: 'marksman' },
      { heroId: 'paquito', lane: 'EXP', name: 'RRQ.R7', isPlayer: false, spellId: 'flicker', emblemId: 'fighter' }
    ]
  },
  {
    title: 'MYTHICAL IMMORTAL 2026 · ALL-STAR CLASH',
    blueTag: 'DAWN',
    redTag: 'ABYSS',
    blue: [
      { heroId: 'mathilda', lane: 'Roam', name: 'DAWN.V33nus', isPlayer: true, spellId: 'flicker', emblemId: 'support' },
      { heroId: 'suyou', lane: 'Jungle', name: 'DAWN.Wise', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'zhuxin', lane: 'Mid', name: 'DAWN.Hadji', isPlayer: false, spellId: 'flameshot', emblemId: 'mage' },
      { heroId: 'hirara', lane: 'Gold', name: 'DAWN.Oheb', isPlayer: false, spellId: 'flicker', emblemId: 'marksman' },
      { heroId: 'lukas', lane: 'EXP', name: 'DAWN.Edward', isPlayer: false, spellId: 'vengeance', emblemId: 'fighter' }
    ],
    red: [
      { heroId: 'kalea', lane: 'Roam', name: 'ABYSS.Baloyskie', isPlayer: false, spellId: 'flicker', emblemId: 'support' },
      { heroId: 'joy', lane: 'Jungle', name: 'ABYSS.Sutsujin', isPlayer: false, spellId: 'retribution', emblemId: 'assassin' },
      { heroId: 'zetian', lane: 'Mid', name: 'ABYSS.Rinz', isPlayer: false, spellId: 'flicker', emblemId: 'mage' },
      { heroId: 'miya', lane: 'Gold', name: 'ABYSS.Kelra', isPlayer: false, spellId: 'inspire', emblemId: 'marksman' },
      { heroId: 'argus', lane: 'EXP', name: 'ABYSS.Dyrennn', isPlayer: false, spellId: 'inspire', emblemId: 'fighter' }
    ]
  }
];

function buildSpectatorConfig(profile: MlbbProfileSave, matchupIdx: number): MlbbMatchLaunchConfig {
  const matchup = FEATURED_MATCHUPS[matchupIdx % FEATURED_MATCHUPS.length];
  const variant = PRIMARY_2026_VARIANTS[matchupIdx % PRIMARY_2026_VARIANTS.length];
  return {
    mode: 'ranked',
    isSpectator: true,
    playerHeroId: matchup.blue[0].heroId,
    playerSkinId: 'default',
    playerLane: matchup.blue[0].lane,
    playerSpellId: matchup.blue[0].spellId,
    playerEmblemId: matchup.blue[0].emblemId,
    playerTalents: profile.emblemTalents[matchup.blue[0].emblemId],
    playerBuild: ['tough_boots', 'dominance_ice', 'athenas_shield', 'antique_cuirass', 'immortality'],
    mapTheme: profile.settings.basics.mapTheme,
    mapVariant: variant,
    blueTeam: matchup.blue,
    redTeam: matchup.red
  };
}

export const LiveStreamOverlay: React.FC<LiveStreamOverlayProps> = ({ profile, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeHostRef = useRef<HTMLDivElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MlbbGameEngine | null>(null);

  const [matchupIdx, setMatchupIdx] = useState(0);
  const matchup = FEATURED_MATCHUPS[matchupIdx % FEATURED_MATCHUPS.length];
  const config = useMemo(() => buildSpectatorConfig(profile, matchupIdx), [profile, matchupIdx]);

  const [snap, setSnap] = useState<MlbbHudSnapshot | null>(null);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [paused, setPaused] = useState(false);
  const [autoDirector, setAutoDirector] = useState(true);
  const [cheers, setCheers] = useState(1420);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [viewers, setViewers] = useState(18420);
  const draggingMini = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSpeed(1);
    setPaused(false);
    setAutoDirector(true);

    const engine = new MlbbGameEngine(
      canvas,
      config,
      profile.settings,
      (nextSnap) => setSnap(nextSnap),
      () => {
        // Match finished — remain in broadcast view so viewer can switch match or exit
      }
    );
    engineRef.current = engine;
    if (threeHostRef.current) engine.attachThreeContainer(threeHostRef.current);
    if (minimapRef.current) engine.attachMinimapCanvas(minimapRef.current);
    engine.setAutoDirector(true);
    engine.start();

    const viewerTick = setInterval(() => {
      setViewers((v) => Math.max(9000, v + Math.floor((Math.random() - 0.45) * 90)));
    }, 2500);

    return () => {
      clearInterval(viewerTick);
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    engineRef.current?.attachMinimapCanvas(minimapRef.current);
  }, [snap !== null]);

  const bluePlayers = snap?.scoreboard.filter((p) => p.team === 'blue') ?? [];
  const redPlayers = snap?.scoreboard.filter((p) => p.team === 'red') ?? [];
  const blueGold = bluePlayers.reduce((s, p) => s + p.gold, 0);
  const redGold = redPlayers.reduce((s, p) => s + p.gold, 0);
  const totalGold = Math.max(1, blueGold + redGold);
  const blueGoldSharePct = Math.max(20, Math.min(80, Math.round((blueGold / totalGold) * 100)));
  const goldDiff = blueGold - redGold;
  const is3D = snap?.rendererMode === '3d';

  const sendHeart = () => {
    mlbbAudio.playClick();
    setCheers((c) => c + 1);
    const id = Date.now() + Math.random();
    const x = 15 + Math.random() * 70;
    setHearts((h) => [...h.slice(-8), { id, x }]);
    setTimeout(() => {
      setHearts((h) => h.filter((item) => item.id !== id));
    }, 1100);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060B18] text-slate-100 select-none">
      {/* Live 3D Three.js WebGL Stage + 2D Fallback Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block ${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
      <div ref={threeHostRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Top Esports Broadcast Scoreboard */}
      <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onExit();
            }}
            className="h-9 px-3 rounded-xl bg-[#0B132B]/92 border border-[#F5C451]/60 hover:border-[#F5C451] text-xs font-black text-[#F5C451] whitespace-nowrap cursor-pointer"
          >
            ← Exit Stream
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/92 border border-rose-500/70 flex items-center gap-2 text-[11px] font-black whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{matchup.title}</span>
            <span className="text-rose-200 mlbb-num">· {viewers.toLocaleString()} watching</span>
          </div>
        </div>

        {snap && (
          <div className="pointer-events-auto px-4 py-1.5 rounded-2xl bg-[#0B132B]/94 border-2 border-[#F5C451]/60 flex flex-col gap-1 shadow-2xl">
            <div className="flex items-center gap-4 text-xs font-black">
              <div className="text-right">
                <div className="text-[10px] text-sky-300">{matchup.blueTag}</div>
                <div className="text-sm text-sky-400 mlbb-num">{(blueGold / 1000).toFixed(1)}k</div>
              </div>
              <div className="text-xl text-sky-400 mlbb-num">{snap.blueKills}</div>
              <div className="text-center px-3 py-0.5 rounded-lg bg-slate-900 border border-slate-700">
                <div className="text-sm text-[#F5C451] mlbb-num">{formatClock(snap.matchTimeSec)}</div>
                <div className={`text-[10px] mlbb-num ${goldDiff >= 0 ? 'text-sky-300' : 'text-rose-300'}`}>
                  {goldDiff >= 0 ? `+${(goldDiff / 1000).toFixed(1)}k` : `-${(Math.abs(goldDiff) / 1000).toFixed(1)}k`}
                </div>
              </div>
              <div className="text-xl text-rose-400 mlbb-num">{snap.redKills}</div>
              <div className="text-left">
                <div className="text-[10px] text-rose-300">{matchup.redTag}</div>
                <div className="text-sm text-rose-400 mlbb-num">{(redGold / 1000).toFixed(1)}k</div>
              </div>
            </div>
            {/* Live Gold Advantage Bar */}
            <div className="h-1.5 w-full rounded-full bg-rose-500/80 overflow-hidden">
              <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${blueGoldSharePct}%` }} />
            </div>
          </div>
        )}

        <div className="pointer-events-auto flex items-center gap-1">
          <button
            onClick={() => {
              const next = !autoDirector;
              setAutoDirector(next);
              engineRef.current?.setAutoDirector(next);
              mlbbAudio.playClick();
            }}
            className={`h-9 px-2.5 rounded-xl border text-[11px] font-black whitespace-nowrap cursor-pointer ${
              autoDirector
                ? 'bg-emerald-600/90 border-emerald-300 text-white'
                : 'bg-[#0B132B]/90 border-slate-600 text-slate-300'
            }`}
            title="Auto-Director tracks active teamfights & Turtle/Lord contests automatically"
          >
            Auto-Director: {autoDirector ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              const next = !paused;
              setPaused(next);
              engineRef.current?.setPaused(next);
              mlbbAudio.playClick();
            }}
            className="h-9 px-2.5 rounded-xl bg-[#0B132B]/90 border border-slate-600 hover:border-[#F5C451] text-[11px] font-black text-white whitespace-nowrap cursor-pointer"
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          {([1, 2, 4] as const).map((sp) => (
            <button
              key={sp}
              onClick={() => {
                setSpeed(sp);
                engineRef.current?.setTimeScale(sp);
                mlbbAudio.playClick();
              }}
              className={`h-9 px-2.5 rounded-xl border text-[11px] font-black mlbb-num cursor-pointer ${
                speed === sp
                  ? 'bg-[#F5C451] border-amber-200 text-slate-950'
                  : 'bg-[#0B132B]/90 border-slate-600 text-slate-200'
              }`}
            >
              {sp}x
            </button>
          ))}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              setMatchupIdx((i) => (i + 1) % FEATURED_MATCHUPS.length);
            }}
            className="h-9 px-2.5 rounded-xl bg-sky-700 hover:bg-sky-600 border border-sky-400 text-[11px] font-black text-white whitespace-nowrap cursor-pointer"
            title="Switch to next featured MPL / M-Series AI showdown"
          >
            Next Match ↻
          </button>
        </div>
      </div>

      {/* Left Team Spectator Camera Selector */}
      {snap && (
        <div className="absolute left-2 top-16 z-20 flex flex-col gap-1.5 w-44">
          {bluePlayers.map((p) => {
            const focused = snap.spectateTargetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setAutoDirector(false);
                  engineRef.current?.setAutoDirector(false);
                  engineRef.current?.setSpectateTarget(p.id);
                  mlbbAudio.playClick();
                }}
                className={`p-1.5 rounded-xl bg-[#0B132B]/92 border text-left flex items-center gap-2 cursor-pointer transition ${
                  focused ? 'border-[#F5C451] scale-[1.02]' : 'border-sky-500/40 hover:border-sky-300'
                }`}
              >
                <HeroPortraitSvg heroId={p.heroId} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-sky-300 mlbb-num">
                    Lv.{p.level} · {p.kills}/{p.deaths}/{p.assists} · {(p.gold / 1000).toFixed(1)}k
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Right Team Spectator Camera Selector */}
      {snap && (
        <div className="absolute right-2 top-16 z-20 flex flex-col gap-1.5 w-44">
          {redPlayers.map((p) => {
            const focused = snap.spectateTargetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setAutoDirector(false);
                  engineRef.current?.setAutoDirector(false);
                  engineRef.current?.setSpectateTarget(p.id);
                  mlbbAudio.playClick();
                }}
                className={`p-1.5 rounded-xl bg-[#0B132B]/92 border text-left flex items-center gap-2 cursor-pointer transition ${
                  focused ? 'border-[#F5C451] scale-[1.02]' : 'border-rose-500/40 hover:border-rose-300'
                }`}
              >
                <HeroPortraitSvg heroId={p.heroId} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-rose-300 mlbb-num">
                    Lv.{p.level} · {p.kills}/{p.deaths}/{p.assists} · {(p.gold / 1000).toFixed(1)}k
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Announcer Ribbon */}
      {snap?.announcer && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div
            style={{ borderColor: snap.announcer.color }}
            className="px-6 py-2 rounded-2xl bg-[#0B132B]/95 border-2 text-center shadow-2xl"
          >
            <div className="text-sm font-black tracking-wider" style={{ color: snap.announcer.color }}>
              {snap.announcer.text}
            </div>
            <div className="text-[11px] text-slate-200 font-bold">{snap.announcer.sub}</div>
          </div>
        </div>
      )}

      {/* Bottom-Left Interactive Broadcast Minimap */}
      <div className="absolute bottom-3 left-3 z-20 rounded-xl overflow-hidden border-2 border-[#F5C451]/60 bg-[#0B132B]">
        <canvas
          ref={minimapRef}
          width={156}
          height={156}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            draggingMini.current = true;
            const r = e.currentTarget.getBoundingClientRect();
            engineRef.current?.setMinimapCameraFocus(
              ((e.clientX - r.left) / r.width) * WORLD_SIZE,
              ((e.clientY - r.top) / r.height) * WORLD_SIZE
            );
          }}
          onPointerMove={(e) => {
            if (!draggingMini.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            engineRef.current?.setMinimapCameraFocus(
              Math.max(0, Math.min(WORLD_SIZE, ((e.clientX - r.left) / r.width) * WORLD_SIZE)),
              Math.max(0, Math.min(WORLD_SIZE, ((e.clientY - r.top) / r.height) * WORLD_SIZE))
            );
          }}
          onPointerUp={() => {
            draggingMini.current = false;
            engineRef.current?.clearMinimapCameraFocus();
          }}
          className="block cursor-crosshair touch-none"
          title="Drag minimap to pan 3D broadcast camera"
        />
        <div className="px-2 py-0.5 bg-[#080F24] text-[10px] font-black text-amber-300 text-center">
          Drag Map to Free-Cam · Click Hero to Lock
        </div>
      </div>

      {/* Bottom-Right Live Stream Commentary & Cheer Button */}
      <div className="absolute bottom-3 right-3 z-20 w-72 flex flex-col items-end gap-2">
        <div className="relative w-full p-2.5 rounded-xl bg-[#0B132B]/92 border border-slate-700/80 space-y-1 text-[11px]">
          <div className="text-[10px] font-black text-[#F5C451] uppercase">Live Broadcast Feed</div>
          {(snap?.chatFeed ?? []).slice(-3).map((c) => (
            <div key={c.id} className="text-slate-200 truncate">
              <span className="font-bold text-amber-300">{c.sender}: </span>
              {c.text}
            </div>
          ))}
          {hearts.map((h) => (
            <span
              key={h.id}
              style={{ left: `${h.x}%` }}
              className="absolute -top-6 text-lg animate-bounce pointer-events-none"
            >
              ❤️
            </span>
          ))}
        </div>
        <button
          onClick={sendHeart}
          className="px-4 py-2 rounded-xl bg-rose-600 bg-gradient-to-r from-rose-600 to-pink-500 border border-pink-300 text-xs font-black text-white shadow-lg cursor-pointer mlbb-num"
        >
          ❤️ Cheer Stream ({cheers.toLocaleString()})
        </button>
      </div>
    </div>
  );
};
