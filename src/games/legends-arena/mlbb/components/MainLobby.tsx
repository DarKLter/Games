import React, { useEffect, useState } from 'react';
import { MlbbModeId, MlbbProfileSave } from '../types';
import { MLBB_RANK_TIERS } from '../data/emblems';
import { HeroPortraitSvg, RankCrestSvg } from './HeroAvatarSvg';
import { LobbySanctuary3D } from './LobbySanctuary3D';
import { mlbbAudio } from '../engine/AudioEngine';

export type LobbyModalType =
  | null
  | 'profile'
  | 'shop'
  | 'starlight'
  | 'events'
  | 'daily'
  | 'mail'
  | 'help'
  | 'recharge'
  | 'prep'
  | 'heroes'
  | 'collection'
  | 'backpack'
  | 'esports'
  | 'leaderboards'
  | 'settings';

interface MainLobbyProps {
  profile: MlbbProfileSave;
  onOpenModal: (modal: LobbyModalType) => void;
  onLaunchMode: (mode: MlbbModeId) => void;
  onOpenLiveStream: () => void;
  onExitToArcade: () => void;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
}

const DEMO_FRIENDS = [
  { id: 'f1', name: 'KaguraMain', rank: 'Mythic ★24', status: 'In Lobby', online: true, heroId: 'eudora', affinity: 'Partner Lv.6' },
  { id: 'f2', name: 'TigrealSet', rank: 'Legend II', status: 'Online', online: true, heroId: 'tigreal', affinity: 'Bro Lv.4' },
  { id: 'f3', name: 'LanceDash', rank: 'Mythical Honor', status: 'In Match (08:14)', online: true, heroId: 'lancelot', affinity: 'Confidant Lv.3' },
  { id: 'f4', name: 'EstesHeal', rank: 'Epic I', status: 'Online', online: true, heroId: 'estes', affinity: 'Bestie Lv.5' },
  { id: 'f5', name: 'FrancoHook', rank: 'Grandmaster', status: 'Offline 2h ago', online: false, heroId: 'franco', affinity: '' }
];

type ChatChannel = 'Global' | 'Local' | 'Recruitment' | 'Squad' | 'Mentor' | 'Private';

export const MainLobby: React.FC<MainLobbyProps> = ({
  profile,
  onOpenModal,
  onLaunchMode,
  onOpenLiveStream,
  onExitToArcade,
  onUpdateProfile
}) => {
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialTab, setSocialTab] = useState<'friends' | 'squad' | 'recruit' | 'ranking'>('friends');
  const [chatTab, setChatTab] = useState<ChatChannel>('Global');
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [arcadePickerOpen, setArcadePickerOpen] = useState(false);
  const [promoIdx, setPromoIdx] = useState(0);
  const [promoSwipeStartX, setPromoSwipeStartX] = useState<number | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [livePing, setLivePing] = useState(() => (profile.settings.network.speedMode ? 18 : 28));
  const [batteryPct, setBatteryPct] = useState(96);
  const [recruitRooms, setRecruitRooms] = useState([
    { id: 'rc1', host: 'MythicCore', mode: 'Ranked' as const, need: 'Roam / Tank', filled: '4/5' },
    { id: 'rc2', host: 'AuroraMid', mode: 'Classic' as const, need: 'Jungler', filled: '3/5' },
    { id: 'rc3', host: 'DawnSquad', mode: 'Ranked' as const, need: 'Gold Laner', filled: '4/5' }
  ]);
  const [chatLines, setChatLines] = useState<{ ch: ChatChannel; sender: string; text: string }[]>([
    { ch: 'Global', sender: 'MythicSlayer', text: 'LF Tank/Roam for 5-man Ranked push!' },
    { ch: 'Global', sender: 'ValirSpark', text: '2026 Expanding Rivers & Broken Walls maps are live!' },
    { ch: 'Local', sender: 'MiyaCarry', text: 'Anyone up for Brawl or Mayhem warm-up?' },
    { ch: 'Recruitment', sender: 'MythicCore', text: '[Ranked 4/5] Need Roam/Tank Mythic+!' },
    { ch: 'Squad', sender: 'Captain', text: 'Weekly squad activity chest almost maxed!' },
    { ch: 'Mentor', sender: 'SenseiTig', text: 'Secure first Turtle at 02:00 for team shield & EXP.' },
    { ch: 'Private', sender: 'KaguraMain', text: 'Ready for duo push whenever you are!' }
  ]);

  const rankTier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
  const unreadMailCount = Math.max(0, 4 - profile.claimedMailIds.length);
  const dailyChestReady = [200, 400, 600, 800].some(
    (m) => profile.dailyActivity >= m && !profile.claimedDailyMilestones.includes(m)
  );

  const promos = [
    {
      title: 'SEASON 36 MYTHIC',
      sub: 'Lv.1–60 Starlight Pass · Exclusive Skins & Rewards',
      badge: 'STARLIGHT',
      modal: 'starlight' as LobbyModalType
    },
    {
      title: 'PROMO DIAMOND CARNIVAL',
      sub: 'Earn Promo Diamonds & Free Epic Skin Chests',
      badge: 'EVENT',
      modal: 'events' as LobbyModalType
    },
    {
      title: 'MAGIC WHEEL & LUCKY SPIN',
      sub: 'Spin with Tickets for Fragments, BP & Legend Rewards',
      badge: 'DRAW',
      modal: 'shop' as LobbyModalType
    }
  ];

  // Auto-rotate Mid-Left Promo Carousel every 5.5s
  useEffect(() => {
    const id = window.setInterval(() => {
      setPromoIdx((i) => (i + 1) % promos.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [promos.length]);

  // Live Chat Bar scrolling preview ticker & subtle realistic Wi-Fi ping fluctuation
  useEffect(() => {
    const id = window.setInterval(() => {
      setTickerIdx((i) => i + 1);
      const base = profile.settings.network.speedMode ? 17 : 27;
      setLivePing(base + Math.floor(Math.random() * 5));
    }, 3400);
    return () => window.clearInterval(id);
  }, [profile.settings.network.speedMode]);

  // Read native Battery API when available (graceful 96% fallback)
  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number }>;
    };
    if (!nav.getBattery) return;
    let alive = true;
    nav
      .getBattery()
      .then((bat) => {
        if (alive && typeof bat?.level === 'number') {
          setBatteryPct(Math.max(10, Math.round(bat.level * 100)));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = chatInput.trim();
    if (!txt) return;
    setChatLines((prev) => [...prev.slice(-24), { ch: chatTab, sender: profile.name, text: txt }]);
    setChatInput('');
    mlbbAudio.playClick();
  };

  const openModal = (m: LobbyModalType) => {
    mlbbAudio.startLobbyBgm();
    mlbbAudio.playModalOpen();
    onOpenModal(m);
  };

  const openSocialTab = (tab: 'friends' | 'squad' | 'recruit' | 'ranking') => {
    mlbbAudio.startLobbyBgm();
    mlbbAudio.playSwoosh();
    if (socialOpen && socialTab === tab) {
      setSocialOpen(false);
    } else {
      setSocialTab(tab);
      setSocialOpen(true);
    }
  };

  const channelLines = chatLines.filter((l) => l.ch === chatTab);
  const latestChat =
    channelLines.length > 0 ? channelLines[tickerIdx % channelLines.length] : chatLines[chatLines.length - 1];

  return (
    <div
      onPointerDown={() => mlbbAudio.startLobbyBgm()}
      className="relative w-full h-full overflow-hidden bg-[#060B18] text-slate-100 select-none"
    >
      {/* Center Interactive Sunlit Three.js 3D Hero Sanctuary Turntable */}
      <LobbySanctuary3D
        heroId={profile.showcaseHeroId}
        skinId={profile.equippedSkins[profile.showcaseHeroId]}
        ownedHeroIds={profile.ownedHeroIds}
        onSwitchHero={(id) =>
          onUpdateProfile((prev) => ({
            ...prev,
            showcaseHeroId: id,
            selectedHeroId: id
          }))
        }
      />

      {/* ==================== TOP-LEFT ANCHOR: Profile Avatar Block + [Event][Starlight] / [Shop][Daily] ==================== */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[54vw]">
        <div className="flex items-start gap-2 flex-wrap">
          {/* Arcade Return Button */}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onExitToArcade();
            }}
            className="h-14 px-2.5 rounded-xl bg-[#0B132B]/92 border border-[#E6B84C]/45 hover:border-[#FFE28A] text-[11px] font-black text-[#FFE28A] flex flex-col items-center justify-center cursor-pointer transition"
            title="Return to Tsepang Arcade"
          >
            <span>←</span>
            <span>Arcade</span>
          </button>

          {/* Profile Avatar Block (Extreme Top-Left) */}
          <button
            onClick={() => openModal('profile')}
            className="flex items-center gap-2.5 pr-3.5 pl-1.5 py-1.5 rounded-xl mlbb-panel-gold hover:border-[#FFE28A] transition cursor-pointer"
            title="Open 6-Tab Player Profile & Namecard"
          >
            <div
              className="relative rounded-full p-[2px] mlbb-rank-shimmer"
              style={{
                backgroundImage: `linear-gradient(135deg, ${rankTier.color}, #FFE28A, ${rankTier.borderGlow})`
              }}
            >
              <div className="rounded-full bg-[#0B132B] p-[1px]">
                <HeroPortraitSvg heroId={profile.showcaseHeroId} size={42} />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 rounded bg-[#0B132B] border border-[#E6B84C] text-[10px] font-black text-[#FFE28A] mlbb-num">
                Lv.{profile.level}
              </span>
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-black text-white flex items-center gap-1.5 whitespace-nowrap">
                <span>{profile.name}</span>
                <span className="text-xs opacity-90">{profile.countryFlag}</span>
              </div>
              <div className="text-[11px] font-bold text-[#FFE28A] flex items-center gap-1 whitespace-nowrap">
                <RankCrestSvg tierIdx={profile.rankTierIdx} size={16} />
                <span>{rankTier.name}</span>
                <span className="text-amber-300 mlbb-num">{profile.rankStars}★</span>
              </div>
            </div>
          </button>

          {/* Upper-Left 2x2 Action Strip: [Event][Starlight] / [Shop][Daily] */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => openModal('events')}
              className="h-7 px-2.5 rounded-lg bg-[#0E1E42]/92 border border-cyan-400/50 hover:border-cyan-200 flex items-center gap-1.5 text-[11px] font-black text-cyan-100 whitespace-nowrap cursor-pointer transition"
            >
              <span>🎁</span>
              <span>Event</span>
            </button>
            <button
              onClick={() => openModal('starlight')}
              className="h-7 px-2.5 rounded-lg bg-[#1A1444]/92 border border-purple-400/55 hover:border-purple-200 flex items-center gap-1.5 text-[11px] font-black text-purple-100 whitespace-nowrap cursor-pointer transition"
            >
              <span>⭐</span>
              <span>Starlight</span>
              <span className="text-[10px] text-purple-300 mlbb-num">Lv.{profile.starlightLevel}</span>
            </button>
            <button
              onClick={() => openModal('shop')}
              className="h-7 px-2.5 rounded-lg bg-[#1E1A32]/92 border border-[#E6B84C]/60 hover:border-[#FFE28A] flex items-center gap-1.5 text-[11px] font-black text-[#FFE28A] whitespace-nowrap cursor-pointer transition"
            >
              <span>🛍️</span>
              <span>Shop</span>
            </button>
            <button
              onClick={() => openModal('daily')}
              className="relative h-7 px-2.5 rounded-lg bg-[#10263A]/92 border border-emerald-400/55 hover:border-emerald-200 flex items-center gap-1.5 text-[11px] font-black text-emerald-200 whitespace-nowrap cursor-pointer transition"
            >
              <span>📋</span>
              <span>Daily</span>
              <span className="text-[10px] text-amber-300 mlbb-num">{Math.min(800, profile.dailyActivity)}/800</span>
              {dailyChestReady && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mid-Left Auto-Rotating & Swipeable Recharge / Promo Event Carousel */}
        <div
          onPointerDown={(e) => setPromoSwipeStartX(e.clientX)}
          onPointerUp={(e) => {
            if (promoSwipeStartX === null) return;
            const dx = e.clientX - promoSwipeStartX;
            setPromoSwipeStartX(null);
            if (Math.abs(dx) > 34) {
              mlbbAudio.playSwoosh();
              setPromoIdx((i) => (dx < 0 ? (i + 1) % promos.length : (i - 1 + promos.length) % promos.length));
            }
          }}
          className="mt-1 w-56 rounded-xl mlbb-panel-gold p-2.5 touch-pan-y"
        >
          <div className="flex items-center justify-between text-[10px] font-black text-[#FFE28A] mb-1">
            <span>{promos[promoIdx].badge}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  mlbbAudio.playSwoosh();
                  setPromoIdx((i) => (i - 1 + promos.length) % promos.length);
                }}
                className="px-1 text-slate-300 hover:text-white cursor-pointer"
                aria-label="Previous promo"
              >
                ◂
              </button>
              <span className="text-slate-300 mlbb-num">{promoIdx + 1}/{promos.length}</span>
              <button
                onClick={() => {
                  mlbbAudio.playSwoosh();
                  setPromoIdx((i) => (i + 1) % promos.length);
                }}
                className="px-1 text-slate-300 hover:text-white cursor-pointer"
                aria-label="Next promo"
              >
                ▸
              </button>
            </div>
          </div>
          <button
            onClick={() => openModal(promos[promoIdx].modal)}
            className="text-left w-full cursor-pointer group"
          >
            <div className="text-xs font-black text-white group-hover:text-[#FFE28A] transition">
              {promos[promoIdx].title}
            </div>
            <div className="text-[11px] text-slate-300 leading-snug mt-0.5">{promos[promoIdx].sub}</div>
          </button>
          <div className="flex gap-1 mt-2">
            {promos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPromoIdx(i)}
                className={`h-1 flex-1 rounded-full cursor-pointer transition ${
                  i === promoIdx ? 'bg-[#E6B84C]' : 'bg-slate-700'
                }`}
                aria-label={`Promo slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ==================== LOWER-LEFT: Live / Stream Launcher (above Chat Bar) ==================== */}
      <div className="absolute bottom-[106px] left-3 z-20">
        <button
          onClick={() => {
            mlbbAudio.playModalOpen();
            onOpenLiveStream();
          }}
          className="h-9 px-3.5 rounded-xl bg-rose-950 bg-gradient-to-r from-rose-950/95 to-[#1B2246]/95 border border-rose-400/60 hover:border-rose-300 flex items-center gap-2 text-xs font-black text-rose-100 shadow-lg cursor-pointer transition"
          title="Watch Live AI-vs-AI Spectate Match"
        >
          <span>📺</span>
          <span>Live / Stream</span>
          <span className="text-[10px] font-bold text-rose-300 mlbb-num">LIVE</span>
        </button>
      </div>

      {/* ==================== TOP-RIGHT ANCHOR: Currencies + [🎧][✉️][⚙️] + [Wi-Fi / Battery] ==================== */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Currency Bar: Tickets -> BP -> Diamonds [+] */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl mlbb-panel-gold text-xs font-black mlbb-num">
            <span title="Tickets" className="text-cyan-300 whitespace-nowrap">
              🎟️ {profile.tickets.toLocaleString()}
            </span>
            <span title="Battle Points (BP)" className="text-[#FFE28A] whitespace-nowrap">
              🪙 {profile.bp.toLocaleString()}
            </span>
            <button
              onClick={() => openModal('recharge')}
              className="flex items-center gap-1 text-sky-300 hover:text-white cursor-pointer whitespace-nowrap"
              title="Open Diamond Recharge Simulator"
            >
              <span>💎 {profile.diamonds.toLocaleString()}</span>
              <span className="px-1.5 py-0.2 rounded bg-sky-500/35 border border-sky-300/70 text-[10px] font-black text-white">
                +
              </span>
            </button>
          </div>

          {/* System Utility Icons: [🎧] Customer Service, [✉️] Mail, [⚙️] Settings */}
          <button
            onClick={() => openModal('help')}
            className="w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-slate-600/70 hover:border-[#E6B84C] flex items-center justify-center text-base cursor-pointer transition"
            title="Customer Service (FAQ, Bug Report, Account Appeal)"
          >
            🎧
          </button>

          <button
            onClick={() => openModal('mail')}
            className="relative w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-slate-600/70 hover:border-[#E6B84C] flex items-center justify-center text-base cursor-pointer transition"
            title="Mail Inbox"
          >
            ✉️
            {unreadMailCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center mlbb-num">
                {unreadMailCount}
              </span>
            )}
          </button>

          <button
            onClick={() => openModal('settings')}
            className="w-10 h-10 rounded-xl bg-[#0B132B]/92 border border-[#E6B84C]/55 hover:border-[#FFE28A] flex items-center justify-center text-base cursor-pointer transition"
            title="Settings (7 Tabs + Custom UI)"
          >
            ⚙️
          </button>
        </div>

        {/* Device Telemetry: Live Wi-Fi Ping Bars + Battery right below Utility Icons */}
        <div
          className="px-2.5 py-1 rounded-lg bg-[#0B132B]/90 border border-emerald-500/40 flex items-center gap-2 text-[11px] font-bold text-emerald-300 mlbb-num"
          title="Live Network Ping & Battery Status"
        >
          <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
            <span className="w-[3px] h-1.5 rounded-sm bg-emerald-400" />
            <span className="w-[3px] h-2 rounded-sm bg-emerald-400" />
            <span className="w-[3px] h-3 rounded-sm bg-emerald-400" />
          </span>
          <span>{livePing}ms</span>
          <span className="text-slate-600">/</span>
          <span className="text-[#FFE28A]">🔋 {batteryPct}%</span>
        </div>
      </div>

      {/* ==================== RIGHT EDGE: Vertical Social Rail [Friends][Squad][Recruit][Ranking] + Drawer ==================== */}
      <div className="absolute top-[92px] right-3 z-20 flex items-start gap-2">
        {socialOpen && (
          <div className="w-76 max-w-[78vw] rounded-2xl mlbb-panel-gold p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-black text-[#FFE28A] uppercase tracking-wide">
                {socialTab === 'friends' && `Friends (${DEMO_FRIENDS.filter((f) => f.online).length} Online)`}
                {socialTab === 'squad' && `[${profile.squad.tag}] ${profile.squad.name}`}
                {socialTab === 'recruit' && '5-Man Lobby Recruitment'}
                {socialTab === 'ranking' && 'Sanctuary Rankings'}
              </div>
              <button
                onClick={() => setSocialOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {socialTab === 'friends' && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                {DEMO_FRIENDS.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/85 border border-slate-700/70 gap-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HeroPortraitSvg heroId={f.heroId} size={30} />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">
                          {f.name}{' '}
                          {f.affinity && <span className="text-[10px] text-pink-300 font-semibold">· {f.affinity}</span>}
                        </div>
                        <div className={`text-[10px] font-semibold ${f.online ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {f.status} · {f.rank}
                        </div>
                      </div>
                    </div>
                    {f.online && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            mlbbAudio.playClick();
                            setChatTab('Private');
                            setChatOpen(true);
                            setChatLines((prev) => [
                              ...prev.slice(-24),
                              { ch: 'Private', sender: f.name, text: `Hey ${profile.name}! Invite me when ready.` }
                            ]);
                          }}
                          className="px-1.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold text-white cursor-pointer"
                          title="Private Chat"
                        >
                          💬
                        </button>
                        <button
                          onClick={() => {
                            mlbbAudio.playPlayerReady();
                            onLaunchMode('ranked');
                          }}
                          className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-black text-white cursor-pointer"
                        >
                          Invite
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {socialTab === 'squad' && (
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-[#E6B84C]/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#FFE28A]">
                      [{profile.squad.tag}] {profile.squad.name}
                    </span>
                    <span className="text-[10px] font-black text-cyan-300">{profile.squad.rank ?? 'Regional #14'}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{profile.squad.slogan}</div>
                  <div className="text-[10px] text-emerald-300 font-bold mlbb-num">
                    Members: 9/9 · Weekly Activity: {(profile.squad.activity ?? 8420).toLocaleString()}
                  </div>
                </div>
                <input
                  value={profile.squad.slogan}
                  onChange={(e) =>
                    onUpdateProfile((prev) => ({
                      ...prev,
                      squad: { ...prev.squad, slogan: e.target.value.slice(0, 60) }
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  placeholder="Edit squad slogan..."
                />
                <button
                  onClick={() => {
                    mlbbAudio.playClick();
                    onLaunchMode('ranked');
                  }}
                  className="w-full py-2 rounded-lg bg-[#E6B84C] bg-gradient-to-r from-[#E6B84C] to-[#C88E20] text-slate-950 font-black text-xs cursor-pointer"
                >
                  Create 5-Man Squad Lobby
                </button>
              </div>
            )}

            {socialTab === 'recruit' && (
              <div className="space-y-2 text-xs">
                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {recruitRooms.map((r) => (
                    <div
                      key={r.id}
                      className="p-2 rounded-lg bg-slate-900/85 border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-white">
                          {r.host} ({r.mode})
                        </div>
                        <div className="text-[10px] text-amber-300 mlbb-num">
                          Need: {r.need} · {r.filled}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          mlbbAudio.playPlayerReady();
                          onLaunchMode(r.mode === 'Ranked' ? 'ranked' : 'classic');
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black text-white cursor-pointer"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    mlbbAudio.playClaimFanfare();
                    const newRoom = {
                      id: `rc_${Date.now()}`,
                      host: profile.name,
                      mode: 'Ranked' as const,
                      need: 'Any Fill (Mythic+)',
                      filled: '1/5'
                    };
                    setRecruitRooms((prev) => [newRoom, ...prev.slice(0, 4)]);
                    setChatLines((prev) => [
                      ...prev.slice(-24),
                      { ch: 'Recruitment', sender: profile.name, text: `[Ranked 1/5] Recruiting 5-man squad! Any Fill.` }
                    ]);
                  }}
                  className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black text-[11px] cursor-pointer"
                >
                  + Post 5-Man Lobby
                </button>
              </div>
            )}

            {socialTab === 'ranking' && (
              <div className="space-y-1.5 text-xs">
                {[
                  { pos: 1, name: 'ONIC.Kairi', stars: 162, heroId: 'lancelot', title: 'Global #1' },
                  { pos: 2, name: 'BREN.FlapTzy', stars: 154, heroId: 'zilong', title: 'Regional #1' },
                  { pos: 3, name: 'RRQ.Skylar', stars: 148, heroId: 'miya', title: 'Street #1' }
                ].map((r) => (
                  <div
                    key={r.pos}
                    className="p-1.5 rounded-lg bg-slate-900/85 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center font-black text-[#FFE28A] mlbb-num">#{r.pos}</span>
                      <HeroPortraitSvg heroId={r.heroId} size={26} />
                      <div>
                        <div className="font-bold text-white leading-tight">{r.name}</div>
                        <div className="text-[10px] text-cyan-300">{r.title}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-amber-300 mlbb-num">★{r.stars}</span>
                  </div>
                ))}
                <button
                  onClick={() => openModal('leaderboards')}
                  className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black text-[11px] cursor-pointer"
                >
                  🏆 Full Leaderboards (6 Categories) →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right-Edge Vertical Social Rail */}
        <div className="flex flex-col gap-1.5">
          {(
            [
              { id: 'friends', icon: '👥', label: 'Friends' },
              { id: 'squad', icon: '🛡️', label: 'Squad' },
              { id: 'recruit', icon: '📣', label: 'Recruit' },
              { id: 'ranking', icon: '🏆', label: 'Ranking' }
            ] as const
          ).map((item) => {
            const active = socialOpen && socialTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => openSocialTab(item.id)}
                className={`w-16 py-1.5 px-1.5 rounded-xl border text-[10px] font-black flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                  active
                    ? 'bg-[#E6B84C] border-[#FFE28A] text-slate-950 shadow-lg'
                    : 'bg-[#0B132B]/92 border-[#E6B84C]/40 hover:border-[#FFE28A] text-slate-100'
                }`}
              >
                <span className="text-sm leading-none">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== BOTTOM-LEFT TO BOTTOM-CENTER: Chat Bar + 5-Button Navigation Dock ==================== */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-1.5 max-w-[60vw]">
        {/* Chat Bar (above Dock) */}
        <div className="w-[360px] max-w-[54vw]">
          {chatOpen && (
            <div className="mb-1.5 rounded-xl mlbb-panel-gold p-2.5 shadow-2xl">
              <div className="flex items-center justify-between mb-1.5 gap-1">
                <div className="flex flex-wrap gap-1">
                  {(['Global', 'Local', 'Recruitment', 'Squad', 'Mentor', 'Private'] as ChatChannel[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        mlbbAudio.playSwoosh();
                        setChatTab(c);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                        chatTab === c ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-xs text-slate-400 hover:text-white px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto text-[11px] mb-2">
                {chatLines
                  .filter((l) => l.ch === chatTab)
                  .map((l, idx) => (
                    <div key={idx} className="text-slate-200">
                      <span className="font-bold text-[#FFE28A]">{l.sender}: </span>
                      {l.text}
                    </div>
                  ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-1">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Message ${chatTab}...`}
                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-[#E6B84C] text-slate-950 font-black text-xs cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              setChatOpen((v) => !v);
            }}
            className="w-full h-9 px-3 rounded-xl bg-[#0B132B]/90 border border-slate-600/70 hover:border-[#E6B84C] flex items-center gap-2 text-left text-xs text-slate-200 truncate cursor-pointer transition"
          >
            <span className="text-[#FFE28A] font-black shrink-0">💬 [{chatTab}]</span>
            <span className="truncate">
              {latestChat?.sender}: {latestChat?.text}
            </span>
          </button>
        </div>

        {/* 5-Button Bottom Navigation Dock */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-2xl mlbb-panel-gold w-fit">
          {(
            [
              { id: 'prep', icon: '⚔️', label: 'Prep' },
              { id: 'heroes', icon: '🛡️', label: 'Heroes' },
              { id: 'collection', icon: '✨', label: 'Collection' },
              { id: 'backpack', icon: '🎒', label: 'Backpack' },
              { id: 'esports', icon: '🏅', label: 'Esports' }
            ] as { id: LobbyModalType; icon: string; label: string }[]
          ).map((tab) => (
            <button
              key={tab.label}
              onClick={() => openModal(tab.id)}
              className="h-11 px-3 rounded-xl hover:bg-[#1B3B6F]/70 flex flex-col items-center justify-center text-[11px] font-extrabold text-slate-100 hover:text-[#FFE28A] transition cursor-pointer whitespace-nowrap"
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== BOTTOM-RIGHT QUADRANT: 6 Mode Entry Cards (3x2 Exact Grid) ==================== */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-1.5">
        {/* Arcade Sub-Mode Popover (Mayhem / Overdrive) */}
        {arcadePickerOpen && (
          <div className="p-2 rounded-xl bg-[#0B132B]/96 border border-purple-400/70 flex items-center gap-1.5 shadow-2xl text-[11px] font-black">
            <span className="text-purple-300 px-1">ARCADE:</span>
            <button
              onClick={() => {
                setArcadePickerOpen(false);
                onUpdateProfile((p) => ({ ...p, arcadeSubMode: 'mayhem' }));
                onLaunchMode('arcade');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
            >
              ⚡ Mayhem
            </button>
            <button
              onClick={() => {
                setArcadePickerOpen(false);
                onUpdateProfile((p) => ({ ...p, arcadeSubMode: 'overdrive' }));
                onLaunchMode('arcade');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              🚀 Overdrive (80% CDR)
            </button>
          </div>
        )}

        {/* Custom Sub-Mode Popover (5v5 / 1v1 Mid / Practice) */}
        {customPickerOpen && (
          <div className="p-2 rounded-xl bg-[#0B132B]/96 border border-emerald-400/70 flex items-center gap-1.5 shadow-2xl text-[11px] font-black">
            <span className="text-emerald-300 px-1">CUSTOM:</span>
            <button
              onClick={() => {
                setCustomPickerOpen(false);
                onUpdateProfile((p) => ({ ...p, customSubMode: '5v5' }));
                onLaunchMode('classic');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-200 cursor-pointer"
            >
              ⚔️ 5v5 Custom
            </button>
            <button
              onClick={() => {
                setCustomPickerOpen(false);
                onUpdateProfile((p) => ({ ...p, customSubMode: '1v1_mid' }));
                onLaunchMode('brawl');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 cursor-pointer"
            >
              🔥 1v1 Mid
            </button>
            <button
              onClick={() => {
                setCustomPickerOpen(false);
                onUpdateProfile((p) => ({ ...p, customSubMode: 'practice' }));
                onLaunchMode('practice');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              🎯 Practice Mode
            </button>
          </div>
        )}

        {/* 3x2 Mode Card Grid matching exact Part 1 coordinate map */}
        <div className="grid grid-cols-2 gap-1.5 w-[294px]">
          {/* Row 1: [RANKED] [CLASSIC] */}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onLaunchMode('ranked');
            }}
            className="h-14 px-3.5 rounded-xl mlbb-chamfer bg-[#E6B84C] bg-gradient-to-br from-[#FFE28A] via-[#E6B84C] to-[#B87414] border-2 border-[#FFE28A] hover:brightness-110 active:scale-[0.98] text-left shadow-xl cursor-pointer transition"
          >
            <div className="text-sm font-black text-slate-950 tracking-wide">RANKED</div>
            <div className="text-[10px] font-extrabold text-slate-900 truncate">
              {rankTier.name} ★{profile.rankStars} · 5-Ban
            </div>
          </button>

          <button
            onClick={() => {
              mlbbAudio.playClick();
              onLaunchMode('classic');
            }}
            className="h-14 px-3.5 rounded-xl mlbb-chamfer bg-[#1B3B6F] bg-gradient-to-br from-[#1B3B6F] to-[#0D2149] border-2 border-sky-400/75 hover:border-sky-200 active:scale-[0.98] text-left shadow-lg cursor-pointer transition"
          >
            <div className="text-sm font-black text-white tracking-wide">CLASSIC</div>
            <div className="text-[10px] font-bold text-sky-300 truncate">5v5 Blind Pick</div>
          </button>

          {/* Row 2: [BRAWL] [ARCADE] */}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onLaunchMode('brawl');
            }}
            className="h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-orange-400/60 hover:border-orange-300 text-left flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <div className="text-[11px] font-black text-orange-200 leading-tight">🔥 BRAWL</div>
              <div className="text-[9px] text-slate-400">Single Lane</div>
            </div>
          </button>

          <button
            onClick={() => {
              mlbbAudio.playClick();
              setCustomPickerOpen(false);
              setArcadePickerOpen((v) => !v);
            }}
            className="h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-purple-400/60 hover:border-purple-300 text-left flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <div className="text-[11px] font-black text-purple-200 leading-tight">⚡ ARCADE</div>
              <div className="text-[9px] text-slate-400">Mayhem / Overdrive</div>
            </div>
          </button>

          {/* Row 3: [VS AI] [CUSTOM] */}
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onLaunchMode('vs_ai');
            }}
            className="h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-cyan-400/60 hover:border-cyan-300 text-left flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <div className="text-[11px] font-black text-cyan-200 leading-tight">🤖 VS AI</div>
              <div className="text-[9px] text-slate-400">5v5 Bot Match</div>
            </div>
          </button>

          <button
            onClick={() => {
              mlbbAudio.playClick();
              setArcadePickerOpen(false);
              setCustomPickerOpen((v) => !v);
            }}
            className="h-10 px-3 rounded-xl bg-[#0B132B]/94 border border-emerald-400/60 hover:border-emerald-300 text-left flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <div className="text-[11px] font-black text-emerald-200 leading-tight">🎯 CUSTOM</div>
              <div className="text-[9px] text-slate-400">5v5 / 1v1 / Practice</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
