import React, { useMemo, useState } from 'react';
import { MlbbMatchRecord, MlbbProfileSave } from '../types';
import { getMlbbHeroById } from '../data/heroes';
import { MLBB_RANK_TIERS } from '../data/emblems';
import { getMlbbItemById } from '../data/items';
import { formatClock } from '../data/mapData';
import { resetMlbbSave } from '../storage';
import { HeroPortraitSvg, RankCrestSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

interface PlayerProfileModalProps {
  profile: MlbbProfileSave;
  onClose: () => void;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
  onReplaceProfile: (next: MlbbProfileSave) => void;
}

const AVATAR_CHOICES = ['⚔️', '👑', '🐉', '🏹', '🔮', '🛡️', '⚡', '🌟'];
const FRAME_CHOICES = ['Imperial Gold', 'Mythic Immortal', 'Celestial Azure', 'Starlight Prism', 'Sanctuary Flame'];
const FLAG_CHOICES = ['🇵🇭', '🇮🇩', '🇲🇾', '🇸🇬', '🇺🇸', '🇯🇵', '🇰🇷', '🇧🇷', '🇬🇧', '🇹🇭'];
const TITLE_CHOICES = [
  'Supreme Mid Laner',
  'Global #1 Marksman',
  'Immortal Tank Setter',
  'Savage Collector',
  'Lord Steal Specialist',
  'Dawn Vanguard Captain'
];
const SERVER_REGIONS = [
  'SEA-3024 (Original)',
  'SEA-3118 (Singapore)',
  'NA-5012 (West)',
  'EU-4108 (Frankfurt)',
  'ADV-9901 (Advance Server)'
];

type ProfileTabId = 'profile' | 'affinity' | 'battlefield' | 'history' | 'credit' | 'account';

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onReplaceProfile
}) => {
  const [tab, setTab] = useState<ProfileTabId>('profile');
  const [editOpen, setEditOpen] = useState(false);
  const [heroAngle, setHeroAngle] = useState(0);
  const [draggingHero, setDraggingHero] = useState(false);
  const [dragLastX, setDragLastX] = useState(0);
  const [bfFilter, setBfFilter] = useState<'all_seasons' | 'current_season' | 'ranked' | 'classic'>('all_seasons');
  const [inspectMatch, setInspectMatch] = useState<MlbbMatchRecord | null>(null);
  const [importText, setImportText] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const rankTier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
  const showcaseHero = getMlbbHeroById(profile.showcaseHeroId);
  const showcaseSkin =
    showcaseHero.skins.find((s) => s.id === profile.equippedSkins[profile.showcaseHeroId]) ?? showcaseHero.skins[0];

  const notify = (msg: string) => {
    setToast(msg);
    mlbbAudio.playClick();
    window.setTimeout(() => setToast(null), 2600);
  };

  const totalMatches = profile.matchHistory.length + 142;
  const totalWins = profile.matchHistory.filter((m) => m.victory).length + 96;
  const totalMvps = profile.matchHistory.filter((m) => m.medal === 'MVP').length + 34;
  const totalSavages = profile.matchHistory.filter((m) => m.kda[0] >= 5).length + 3;
  const totalManiacs = profile.matchHistory.filter((m) => m.kda[0] >= 4).length + 11;
  const totalTriples = profile.matchHistory.filter((m) => m.kda[0] >= 3).length + 28;
  const totalLegendaries = profile.matchHistory.filter((m) => m.kda[0] >= 8).length + 19;

  const radarData = useMemo(() => {
    const filtered =
      bfFilter === 'ranked'
        ? profile.matchHistory.filter((m) => m.mode === 'ranked')
        : bfFilter === 'classic'
          ? profile.matchHistory.filter((m) => m.mode === 'classic')
          : profile.matchHistory;

    if (filtered.length === 0) {
      if (bfFilter === 'ranked') return { vals: [0.87, 0.81, 0.89, 0.77, 0.84, 0.86], wr: 69, matches: 86, mvp: 24 };
      if (bfFilter === 'classic') return { vals: [0.81, 0.75, 0.79, 0.72, 0.88, 0.84], wr: 64, matches: 56, mvp: 10 };
      if (bfFilter === 'current_season') return { vals: [0.9, 0.83, 0.88, 0.79, 0.86, 0.89], wr: 72, matches: 48, mvp: 16 };
      return { vals: [0.85, 0.79, 0.86, 0.76, 0.85, 0.83], wr: Math.round((totalWins / Math.max(1, totalMatches)) * 100), matches: totalMatches, mvp: totalMvps };
    }
    const n = filtered.length;
    const avgKda = filtered.reduce((s, m) => s + (m.kda[0] + m.kda[2]) / Math.max(1, m.kda[1]), 0) / n;
    const avgRating = filtered.reduce((s, m) => s + m.rating, 0) / n;
    const wr = Math.round((filtered.filter((m) => m.victory).length / n) * 100);
    return {
      vals: [
        Math.min(0.98, Math.max(0.38, avgKda / 7.5)),
        Math.min(0.96, Math.max(0.42, 0.54 + (wr / 100) * 0.36)),
        Math.min(0.97, Math.max(0.44, 0.52 + avgRating / 20)),
        Math.min(0.95, Math.max(0.38, 0.86 - filtered.reduce((s, m) => s + m.kda[1], 0) / (n * 14))),
        Math.min(0.96, Math.max(0.42, avgRating / 10.5)),
        Math.min(0.98, Math.max(0.45, 0.5 + avgKda / 11))
      ],
      wr,
      matches: n,
      mvp: filtered.filter((m) => m.medal === 'MVP').length
    };
  }, [bfFilter, profile.matchHistory, totalMatches, totalMvps, totalWins]);

  const TABS: { id: ProfileTabId; icon: string; label: string }[] = [
    { id: 'profile', icon: '🪪', label: 'Namecard / Profile' },
    { id: 'affinity', icon: '💞', label: 'Social / Affinity' },
    { id: 'battlefield', icon: '📊', label: 'Battlefield' },
    { id: 'history', icon: '📜', label: 'History' },
    { id: 'credit', icon: '⚖️', label: 'Credit Score' },
    { id: 'account', icon: '🔐', label: 'Account' }
  ];

  const creditPct = Math.max(0, Math.min(1, profile.creditScore / 110));
  const arcCircumference = Math.PI * 64;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/82 flex items-center justify-center p-3">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#E6B84C]/65 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#E6B84C]/35">
          <div className="flex items-center gap-2.5">
            <RankCrestSvg tierIdx={profile.rankTierIdx} size={26} />
            <div>
              <div className="text-sm font-black tracking-wide text-[#FFE28A] uppercase">
                Player Profile &amp; Namecard
              </div>
              <div className="text-[11px] text-slate-300">
                [{profile.squad.tag}] {profile.name}
                {!profile.settings.privacy.hideRegion ? ` ${profile.countryFlag}` : ''} · {rankTier.name} ★{profile.rankStars} · Lv.{profile.level}
                {profile.settings.privacy.hideOnlineStatus ? ' · Stealth Offline' : ' · Online'}
                {profile.settings.privacy.hideMatchHistory ? ' · History Private' : ''}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold mlbb-num">
            <span className="text-pink-300">❤️ {profile.charisma.toLocaleString()} Charisma</span>
            <button
              onClick={() => {
                mlbbAudio.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {toast && (
          <div className="px-4 py-1.5 bg-emerald-600/95 text-xs font-black text-white text-center">{toast}</div>
        )}

        {/* Main Split Body: Left Vertical 6-Tab Rail + Right Content */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Left Vertical 6 Tabs */}
          <aside className="w-44 shrink-0 bg-[#080F24] border-r border-[#E6B84C]/25 p-2.5 flex flex-col gap-1.5 overflow-y-auto">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    mlbbAudio.playSwoosh();
                    setTab(t.id);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-black flex items-center gap-2 cursor-pointer transition ${
                    active
                      ? 'bg-gradient-to-r from-[#E6B84C] to-[#C88E20] text-slate-950 shadow-md'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Panel Body */}
          <main className="flex-1 overflow-y-auto p-4">
            {/* ==================== TAB 1: NAMECARD / PROFILE ==================== */}
            {tab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: Drag-Rotatable 360° Showcase & ID Card */}
                <div className="lg:col-span-5 space-y-3">
                  <div
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setDraggingHero(true);
                      setDragLastX(e.clientX);
                    }}
                    onPointerMove={(e) => {
                      if (!draggingHero) return;
                      const dx = e.clientX - dragLastX;
                      setDragLastX(e.clientX);
                      setHeroAngle((a) => (a + dx * 0.9 + 360) % 360);
                    }}
                    onPointerUp={() => setDraggingHero(false)}
                    onPointerCancel={() => setDraggingHero(false)}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#162854] via-[#0F1E46] to-[#0B132B] border border-[#E6B84C]/55 flex flex-col items-center text-center relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
                    title="Drag horizontally to rotate showcase hero 360°"
                  >
                    <div className="text-[10px] font-black text-[#FFE28A] tracking-wider uppercase mb-2">
                      Showcase Hero · Drag 360° ({Math.round(heroAngle)}°)
                    </div>
                    <div className="relative my-1 flex flex-col items-center">
                      <div
                        className="transition-transform duration-75"
                        style={{ transform: `perspective(460px) rotateY(${heroAngle}deg)` }}
                      >
                        <HeroPortraitSvg
                          heroId={profile.showcaseHeroId}
                          size={112}
                          skinColor={showcaseSkin.color}
                          skinAccent={showcaseSkin.accent}
                        />
                      </div>
                      <div className="w-28 h-3 -mt-1 rounded-full bg-gradient-to-r from-transparent via-[#38BDF8]/55 to-transparent border border-[#FFE28A]/50 blur-[0.5px]" />
                    </div>
                    <div className="text-base font-black text-white mt-1">{showcaseHero.name}</div>
                    <div className="text-[11px] text-amber-300 font-bold">
                      {showcaseSkin.name} · {profile.border} Frame
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          mlbbAudio.playSwoosh();
                          setHeroAngle((a) => (a + 45) % 360);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                      >
                        ↺ Rotate
                      </button>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          mlbbAudio.playClick();
                          setEditOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#E6B84C] text-slate-950 text-xs font-black cursor-pointer"
                      >
                        ✏️ Edit Profile
                      </button>
                    </div>
                  </div>

                  {/* Customizable ID Cards */}
                  <div className="p-3.5 rounded-2xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="text-xs font-black text-[#FFE28A]">CUSTOMIZABLE ID CARD</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(
                        [
                          { id: 'mythic_medal', label: '👑 Mythic Medal' },
                          { id: 'collector', label: '✨ Collector Tier' },
                          { id: 'achievement_hall', label: '🏆 Achievement Hall' },
                          { id: 'season_info', label: '📅 Season 36 Info' }
                        ] as const
                      ).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            onUpdateProfile((p) => ({ ...p, activeIdCard: c.id }));
                            notify(`Equipped ${c.label} ID Card!`);
                          }}
                          className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-left cursor-pointer ${
                            profile.activeIdCard === c.id
                              ? 'bg-[#E6B84C] text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-300 hover:text-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-[#E6B84C]/30 text-xs">
                      {profile.activeIdCard === 'mythic_medal' && (
                        <div className="flex items-center gap-2.5">
                          <RankCrestSvg tierIdx={profile.rankTierIdx} size={38} />
                          <div>
                            <div className="font-black text-[#FFE28A]">
                              {rankTier.name} ★{profile.rankStars}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              Peak Honor · Protection {profile.starProtectionPts}/1000
                            </div>
                          </div>
                        </div>
                      )}
                      {profile.activeIdCard === 'collector' && (
                        <div className="space-y-0.5">
                          <div className="font-black text-purple-300">Exalted Collector III</div>
                          <div className="text-[11px] text-slate-300">
                            {profile.ownedHeroIds.length} Heroes ·{' '}
                            {Object.values(profile.ownedSkins).reduce((s, arr) => s + arr.length, 0)} Skins Owned
                          </div>
                        </div>
                      )}
                      {profile.activeIdCard === 'achievement_hall' && (
                        <div className="space-y-0.5">
                          <div className="font-black text-amber-300">Achievement Score: 4,280 pts</div>
                          <div className="text-[11px] text-slate-300">
                            {profile.claimedAchievementIds.length} Badges Claimed · Dawn Defender
                          </div>
                        </div>
                      )}
                      {profile.activeIdCard === 'season_info' && (
                        <div className="space-y-0.5">
                          <div className="font-black text-cyan-300">Season 36 · Land of Dawn</div>
                          <div className="text-[11px] text-slate-300">
                            Current WR {radarData.wr}% · {totalMvps} MVPs · {totalSavages} Savages
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Identity, Highlights, Like/Super Like, Hero Switcher */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="p-4 rounded-2xl bg-[#101C3D] border border-slate-700 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-black text-white flex items-center gap-2">
                          <span>{profile.avatar}</span>
                          <span>{profile.name}</span>
                          <span>{profile.countryFlag}</span>
                        </div>
                        <div className="text-xs font-bold text-[#FFE28A]">
                          {profile.battleTitle} · Squad [{profile.squad.tag}] {profile.squad.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 mlbb-num mt-1">
                          <span>
                            ID: {profile.accountId} ({profile.serverId})
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(`${profile.accountId} (${profile.serverId})`);
                              notify(`Copied Account ID ${profile.accountId} (${profile.serverId})!`);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black text-[#FFE28A] cursor-pointer"
                          >
                            📋 Copy
                          </button>
                          <span>· Charisma {profile.charisma.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            mlbbAudio.playGold();
                            onUpdateProfile((p) => ({
                              ...p,
                              namecardLikes: p.namecardLikes + 1,
                              charisma: p.charisma + 10
                            }));
                            notify('Sent Namecard Like (+10 Charisma)!');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-black text-white cursor-pointer mlbb-num"
                        >
                          👍 {profile.namecardLikes}
                        </button>
                        <button
                          onClick={() => {
                            mlbbAudio.playClaimFanfare();
                            onUpdateProfile((p) => ({
                              ...p,
                              namecardSuperLikes: p.namecardSuperLikes + 1,
                              charisma: p.charisma + 50
                            }));
                            notify('Sent Super Like (+50 Charisma)!');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-xs font-black text-white cursor-pointer mlbb-num"
                        >
                          💖 {profile.namecardSuperLikes}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/85 border border-slate-800 text-xs text-slate-200 italic">
                      &ldquo;{profile.bio}&rdquo;
                    </div>

                    {/* Namecard Career Highlights */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Matches', val: totalMatches, col: 'text-sky-300' },
                        { label: 'MVPs', val: totalMvps, col: 'text-[#FFE28A]' },
                        { label: 'Maniacs', val: totalManiacs, col: 'text-purple-300' },
                        { label: 'Savages', val: totalSavages, col: 'text-rose-300' }
                      ].map((hi) => (
                        <div key={hi.label} className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80">
                          <div className={`text-base font-black mlbb-num ${hi.col}`}>{hi.val}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{hi.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Showcase Hero Picker */}
                  <div className="p-4 rounded-2xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="text-xs font-black text-[#FFE28A]">SWITCH SHOWCASE HERO</div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {profile.ownedHeroIds.map((hid) => {
                        const h = getMlbbHeroById(hid);
                        return (
                          <button
                            key={hid}
                            onClick={() => {
                              onUpdateProfile((p) => ({ ...p, showcaseHeroId: hid }));
                              notify(`${h.name} set as Showcase Hero!`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              profile.showcaseHeroId === hid
                                ? 'bg-[#E6B84C] text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                          >
                            {h.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: SOCIAL / AFFINITY ==================== */}
            {tab === 'affinity' && (
              <div className="space-y-4">
                {/* Affinity Cards: Partners / Bros / Besties / Confidants */}
                <div>
                  <div className="text-xs font-black text-[#FFE28A] mb-2 uppercase">
                    Affinity Bonds (Partners · Bros · Besties · Confidants)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profile.affinityLinks.map((af) => (
                      <div
                        key={af.id}
                        className="p-3 rounded-xl bg-[#101C3D] border border-pink-400/35 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <HeroPortraitSvg heroId={af.heroId} size={42} />
                          <div>
                            <div className="text-xs font-black text-white">
                              {af.name}{' '}
                              <span className="text-[10px] text-pink-300 font-bold">· {af.role}</span>
                            </div>
                            <div className="text-[11px] text-amber-300 mlbb-num">
                              Affinity Lv.{af.level} · {af.pts.toLocaleString()} pts
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            mlbbAudio.playClaimFanfare();
                            onUpdateProfile((p) => ({
                              ...p,
                              charisma: p.charisma + 25,
                              affinityLinks: p.affinityLinks.map((x) =>
                                x.id === af.id
                                  ? { ...x, pts: x.pts + 120, level: x.level + (x.pts + 120 >= (x.level + 1) * 800 ? 1 : 0) }
                                  : x
                              )
                            }));
                            notify(`Sent Affinity Gift to ${af.name} (+120 Affinity)!`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-[11px] font-black text-white cursor-pointer"
                        >
                          🎁 Gift
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mentorship */}
                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-cyan-400/35 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black text-cyan-300 uppercase">🎓 Mentorship Program</div>
                    <div className="text-xs text-slate-200 mt-0.5">
                      Mentor: <span className="font-black text-white">SenseiTig (Mythical Glory)</span> · Mentorship Lv.5 · 2 Apprentices Graduated
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateProfile((p) => ({ ...p, bp: p.bp + 150 }));
                      notify('Claimed Mentorship Check-In (+150 BP)!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    Mentorship Check-In
                  </button>
                </div>

                {/* Photo Album */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs font-black text-[#FFE28A] uppercase">📸 Photo Album</div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPhotoCaption.trim()) return;
                        onUpdateProfile((p) => ({
                          ...p,
                          photoAlbum: [
                            {
                              id: `ph_${Date.now()}`,
                              caption: newPhotoCaption.trim(),
                              heroId: p.showcaseHeroId,
                              date: 'Season 36',
                              likes: 1
                            },
                            ...p.photoAlbum
                          ]
                        }));
                        setNewPhotoCaption('');
                        notify('Added highlight snapshot to Photo Album!');
                      }}
                      className="flex gap-1.5"
                    >
                      <input
                        value={newPhotoCaption}
                        onChange={(e) => setNewPhotoCaption(e.target.value)}
                        placeholder="Add match highlight caption..."
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded-lg bg-[#E6B84C] text-slate-950 text-xs font-black cursor-pointer"
                      >
                        + Post
                      </button>
                    </form>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {profile.photoAlbum.map((ph) => (
                      <div key={ph.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                        <div className="flex items-center gap-2">
                          <HeroPortraitSvg heroId={ph.heroId} size={40} />
                          <div className="text-[11px] font-bold text-slate-300">{ph.date}</div>
                        </div>
                        <div className="text-xs font-bold text-white">{ph.caption}</div>
                        <button
                          onClick={() => {
                            mlbbAudio.playGold();
                            onUpdateProfile((p) => ({
                              ...p,
                              photoAlbum: p.photoAlbum.map((x) => (x.id === ph.id ? { ...x, likes: x.likes + 1 } : x))
                            }));
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-pink-600/80 text-[11px] font-black text-pink-200 cursor-pointer mlbb-num"
                        >
                          ❤️ {ph.likes} Likes
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Like Records */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-[#FFE28A] uppercase">
                    Like Records ({profile.charisma.toLocaleString()} Total Charisma)
                  </div>
                  {profile.likesReceived.map((lk) => (
                    <div
                      key={lk.id}
                      className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between"
                    >
                      <div className="text-xs">
                        <span className="font-black text-white">{lk.from}</span> liked your{' '}
                        <span className="text-amber-300 font-bold">{lk.hero}</span> performance!
                      </div>
                      <button
                        disabled={lk.likedBack}
                        onClick={() => {
                          mlbbAudio.playGold();
                          onUpdateProfile((p) => ({
                            ...p,
                            charisma: p.charisma + 20,
                            likesReceived: p.likesReceived.map((x) =>
                              x.id === lk.id ? { ...x, likedBack: true } : x
                            )
                          }));
                          notify(`Liked ${lk.from} back (+20 Charisma)!`);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer ${
                          lk.likedBack ? 'bg-slate-700 text-slate-400' : 'bg-pink-600 hover:bg-pink-500 text-white'
                        }`}
                      >
                        {lk.likedBack ? 'Liked Back ✓' : '❤️ Like Back (+20)'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 3: BATTLEFIELD STATS & 6-AXIS RADAR ==================== */}
            {tab === 'battlefield' && (
              <div className="space-y-4">
                {/* Filter Bar: All Seasons / Current Season / Ranked / Classic */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: 'all_seasons', label: 'All Seasons' },
                        { id: 'current_season', label: 'Current Season' },
                        { id: 'ranked', label: 'Ranked' },
                        { id: 'classic', label: 'Classic' }
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          mlbbAudio.playSwoosh();
                          setBfFilter(f.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                          bfFilter === f.id ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs font-black text-emerald-300 mlbb-num">
                    {radarData.matches} Matches · {radarData.wr}% Win Rate · {radarData.mvp} MVPs
                  </div>
                </div>

                {/* Career Badges Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  {[
                    { lbl: 'Win Rate', val: `${radarData.wr}%`, col: 'text-emerald-400' },
                    { lbl: 'MVP', val: totalMvps, col: 'text-[#FFE28A]' },
                    { lbl: 'Savage', val: totalSavages, col: 'text-rose-400' },
                    { lbl: 'Maniac', val: totalManiacs, col: 'text-purple-300' },
                    { lbl: 'Triple Kill', val: totalTriples, col: 'text-sky-300' },
                    { lbl: 'Legendary', val: totalLegendaries, col: 'text-amber-300' }
                  ].map((b) => (
                    <div key={b.lbl} className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700">
                      <div className={`text-base font-black mlbb-num ${b.col}`}>{b.val}</div>
                      <div className="text-[10px] font-bold text-slate-400">{b.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* 6-Axis SVG Radar Chart */}
                  <div className="p-4 rounded-2xl bg-[#101C3D] border border-slate-700 flex flex-col items-center">
                    <div className="text-xs font-black text-[#FFE28A] mb-2">6-AXIS COMBAT RADAR</div>
                    <svg width="230" height="230" viewBox="0 0 220 220">
                      {[82, 56, 30].map((r) => (
                        <polygon
                          key={r}
                          points={[0, 1, 2, 3, 4, 5]
                            .map((i) => {
                              const a = (i * Math.PI) / 3 - Math.PI / 2;
                              return `${110 + Math.cos(a) * r},${110 + Math.sin(a) * r}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                      ))}
                      {[0, 1, 2, 3, 4, 5].map((i) => {
                        const a = (i * Math.PI) / 3 - Math.PI / 2;
                        return (
                          <line
                            key={i}
                            x1="110"
                            y1="110"
                            x2={110 + Math.cos(a) * 82}
                            y2={110 + Math.sin(a) * 82}
                            stroke="#334155"
                            strokeWidth="1"
                          />
                        );
                      })}
                      <polygon
                        points={radarData.vals
                          .map((v, i) => {
                            const a = (i * Math.PI) / 3 - Math.PI / 2;
                            return `${110 + Math.cos(a) * 82 * v},${110 + Math.sin(a) * 82 * v}`;
                          })
                          .join(' ')}
                        fill="#38BDF844"
                        stroke="#38BDF8"
                        strokeWidth="2.5"
                      />
                      {['KDA', 'Push', 'Teamfight', 'Survival', 'Farm', 'Damage'].map((lbl, i) => {
                        const a = (i * Math.PI) / 3 - Math.PI / 2;
                        return (
                          <text
                            key={lbl}
                            x={110 + Math.cos(a) * 98}
                            y={110 + Math.sin(a) * 98}
                            textAnchor="middle"
                            fontSize="9.5"
                            fontWeight="bold"
                            fill="#FFE28A"
                          >
                            {lbl}
                          </text>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Favorite Heroes MMR List */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-[#FFE28A] uppercase">Favorite Heroes &amp; MMR Power</div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {Object.entries(profile.heroStats)
                        .sort((a, b) => b[1].mmr - a[1].mmr)
                        .slice(0, 10)
                        .map(([hid, st]) => {
                          const h = getMlbbHeroById(hid);
                          const wr = st.matches > 0 ? Math.round((st.wins / st.matches) * 100) : 0;
                          return (
                            <div
                              key={hid}
                              className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <HeroPortraitSvg heroId={hid} size={34} />
                                <div>
                                  <div className="font-black text-white">{h.name}</div>
                                  <div className="text-[11px] text-slate-400 mlbb-num">
                                    MMR {st.mmr} · Mastery {st.mastery}%
                                  </div>
                                </div>
                              </div>
                              <div className="text-right mlbb-num">
                                <div className="font-black text-emerald-400">{wr}% WR</div>
                                <div className="text-[11px] text-slate-400">{st.matches} Matches</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 4: MATCH HISTORY + 10-PLAYER SCOREBOARD ==================== */}
            {tab === 'history' && (
              <div className="space-y-2.5">
                {profile.matchHistory.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#101C3D] border border-slate-700 text-center text-xs text-slate-300">
                    No recorded matches yet. Play a Ranked, Classic, Brawl, Arcade, or VS AI match to log full 10-player scoreboards &amp; 6-item builds!
                  </div>
                ) : (
                  profile.matchHistory.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        mlbbAudio.playModalOpen();
                        setInspectMatch(m);
                      }}
                      className="w-full p-3 rounded-xl bg-[#101C3D] border border-slate-700 hover:border-[#E6B84C] flex flex-wrap items-center justify-between gap-3 text-left cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <HeroPortraitSvg heroId={m.playerHeroId} size={44} />
                        <div>
                          <div className="text-xs font-black">
                            <span className={m.victory ? 'text-emerald-400' : 'text-rose-400'}>
                              {m.victory ? 'VICTORY' : 'DEFEAT'}
                            </span>{' '}
                            · {m.mode.toUpperCase()} · {m.playerHeroName}
                          </div>
                          <div className="text-[11px] text-slate-300 mlbb-num">
                            KDA {m.kda.join('/')} · Rating {m.rating.toFixed(1)} ·{' '}
                            <span className="text-[#FFE28A] font-black">{m.medal}</span> · {formatClock(m.durationSec)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {m.items.slice(0, 6).map((itemId, idx) => (
                            <span
                              key={idx}
                              title={getMlbbItemById(itemId)?.name ?? itemId}
                              className="w-6 h-6 rounded bg-slate-900 border border-slate-700 flex items-center justify-center text-xs"
                            >
                              {getMlbbItemById(itemId)?.icon ?? '⚔️'}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-black text-[#FFE28A] mlbb-num">
                          {m.blueKills} - {m.redKills}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ==================== TAB 5: CREDIT SCORE (0-110 GAUGE + SILVANNA LOG) ==================== */}
            {tab === 'credit' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#101C3D] border border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Visual 0-110 Arc Gauge */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <svg width="180" height="110" viewBox="0 0 180 110">
                      <path
                        d="M 26 92 A 64 64 0 0 1 154 92"
                        fill="none"
                        stroke="#1E293B"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 26 92 A 64 64 0 0 1 154 92"
                        fill="none"
                        stroke={profile.creditScore >= 90 ? '#22C55E' : '#F59E0B'}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={`${arcCircumference * creditPct} ${arcCircumference}`}
                      />
                      <text x="90" y="74" textAnchor="middle" fontSize="28" fontWeight="900" fill="#FFE28A">
                        {profile.creditScore}
                      </text>
                      <text x="90" y="94" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94A3B8">
                        OF 110 MAX SCORE
                      </text>
                    </svg>
                  </div>

                  <div className="md:col-span-7 space-y-2 text-xs">
                    <div className="text-base font-black text-emerald-400">
                      {profile.creditScore >= 100 ? 'EXCELLENT FAIR PLAY' : profile.creditScore >= 90 ? 'GOOD STANDING' : 'RESTRICTED'}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">WEEKLY BP CAP</div>
                        <div className="text-sm font-black text-[#FFE28A] mlbb-num">
                          {profile.creditScore >= 110 ? '10,000 BP (+15%)' : '8,500 BP'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">RANKED ELIGIBILITY (90+)</div>
                        <div className={`text-sm font-black ${profile.creditScore >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {profile.creditScore >= 90 ? 'UNLOCKED ✓' : 'LOCKED (Need 90+)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Judge Silvanna Report Log */}
                <div className="p-4 rounded-2xl bg-[#101C3D] border border-slate-700 space-y-2 text-xs">
                  <div className="font-black text-[#FFE28A] uppercase">⚖️ Judge Silvanna Fair-Play Log</div>
                  {[
                    { date: 'Today', msg: 'Completed match with 0 AFK / Feeding infractions.', delta: '+1 Credit' },
                    { date: 'Season 36', msg: 'Received 3 teammate commendations in Ranked Draft.', delta: '+2 Credit' },
                    { date: 'System Audit', msg: 'Verified clean record — 100% Star Protection & Ranked enabled.', delta: 'CLEAN' }
                  ].map((log, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-black text-cyan-300 mr-2">{log.date}</span>
                        <span className="text-slate-200">{log.msg}</span>
                      </div>
                      <span className="font-black text-emerald-400 mlbb-num">{log.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 6: ACCOUNT ==================== */}
            {tab === 'account' && (
              <div className="space-y-3 text-xs">
                {/* Bound Account Badges */}
                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                  <div className="font-black text-[#FFE28A] uppercase">Bound Account Platforms</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      [
                        { key: 'moonton', label: 'Moonton ID', icon: '🛡️' },
                        { key: 'google', label: 'Google Play', icon: '🎮' },
                        { key: 'apple', label: 'Apple ID', icon: '🍎' },
                        { key: 'facebook', label: 'Facebook', icon: '📘' }
                      ] as const
                    ).map((acc) => {
                      const bound = profile.boundAccounts[acc.key];
                      return (
                        <button
                          key={acc.key}
                          onClick={() => {
                            onUpdateProfile((p) => ({
                              ...p,
                              boundAccounts: { ...p.boundAccounts, [acc.key]: !p.boundAccounts[acc.key] }
                            }));
                            notify(`${acc.label} ${bound ? 'unlinked' : 'bound'} successfully!`);
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                            bound
                              ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-black">
                            {acc.icon} {acc.label}
                          </div>
                          <div className="text-[10px] mt-0.5">{bound ? 'Bound ✓' : 'Tap to Bind'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Switch Server & Secondary Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="font-black text-white">Switch Server</div>
                    <select
                      value={profile.selectedServerRegion}
                      onChange={(e) => {
                        const val = e.target.value;
                        const sid = val.match(/\d{4}/)?.[0] ?? '3024';
                        onUpdateProfile((p) => ({ ...p, selectedServerRegion: val, serverId: sid }));
                        notify(`Switched active server to ${val}!`);
                      }}
                      className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {SERVER_REGIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-black text-white">Secondary Password</div>
                      <div className="text-[11px] text-slate-400">Protects diamond gifting &amp; account reset.</div>
                    </div>
                    <button
                      onClick={() => {
                        onUpdateProfile((p) => ({ ...p, secondaryPasswordEnabled: !p.secondaryPasswordEnabled }));
                        notify(`Secondary Password ${profile.secondaryPasswordEnabled ? 'disabled' : 'enabled'}!`);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                        profile.secondaryPasswordEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {profile.secondaryPasswordEnabled ? 'ENABLED' : 'OFF'}
                    </button>
                  </div>
                </div>

                {/* Export / Import / Factory Reset */}
                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2.5">
                  <div className="font-black text-[#FFE28A]">Export / Import JSON Save &amp; Factory Reset</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(JSON.stringify(profile));
                        notify('Profile Save JSON copied to clipboard!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-black cursor-pointer"
                    >
                      📤 Export JSON Save
                    </button>
                    <button
                      onClick={() => {
                        if (profile.secondaryPasswordEnabled) {
                          return notify('Disable Secondary Password before Factory Reset.');
                        }
                        const fresh = resetMlbbSave();
                        onReplaceProfile(fresh);
                        notify('Factory Reset completed.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-black cursor-pointer"
                    >
                      ⚠️ Factory Reset
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Paste exported JSON save here..."
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    />
                    <button
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(importText) as MlbbProfileSave;
                          if (parsed && parsed.accountId) {
                            onReplaceProfile(parsed);
                            setImportText('');
                            notify('Profile save imported successfully!');
                          } else {
                            notify('Missing accountId in JSON payload.');
                          }
                        } catch {
                          notify('Invalid JSON payload.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                    >
                      📥 Import
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ==================== EDIT PROFILE SUB-MODAL ==================== */}
        {editOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-[#0E1938] border-2 border-[#E6B84C] p-4 space-y-3 shadow-2xl text-xs">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="text-sm font-black text-[#FFE28A]">✏️ EDIT PROFILE &amp; NAMECARD</div>
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-2 py-1 rounded bg-slate-800 text-white font-black cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="font-bold text-slate-300">Nickname</span>
                  <input
                    value={profile.name}
                    onChange={(e) => onUpdateProfile((p) => ({ ...p, name: e.target.value.slice(0, 18) }))}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-300">Battle Title</span>
                  <select
                    value={profile.battleTitle}
                    onChange={(e) => onUpdateProfile((p) => ({ ...p, battleTitle: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  >
                    {TITLE_CHOICES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1">
                <span className="font-bold text-slate-300">Bio / Signature</span>
                <input
                  value={profile.bio}
                  onChange={(e) => onUpdateProfile((p) => ({ ...p, bio: e.target.value.slice(0, 80) }))}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                />
              </label>
              <div>
                <div className="font-bold text-slate-300 mb-1">Avatar Emblem</div>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_CHOICES.map((av) => (
                    <button
                      key={av}
                      onClick={() => onUpdateProfile((p) => ({ ...p, avatar: av }))}
                      className={`w-9 h-9 rounded-lg text-base cursor-pointer ${
                        profile.avatar === av ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-300 mb-1">Avatar Frame</div>
                <div className="flex flex-wrap gap-1.5">
                  {FRAME_CHOICES.map((fr) => (
                    <button
                      key={fr}
                      onClick={() => onUpdateProfile((p) => ({ ...p, border: fr }))}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                        profile.border === fr ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {fr}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-300 mb-1">Country Flag</div>
                <div className="flex flex-wrap gap-1.5">
                  {FLAG_CHOICES.map((fl) => (
                    <button
                      key={fl}
                      onClick={() => onUpdateProfile((p) => ({ ...p, countryFlag: fl }))}
                      className={`px-2.5 py-1 rounded-lg text-base cursor-pointer ${
                        profile.countryFlag === fl ? 'bg-[#E6B84C]' : 'bg-slate-800'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setEditOpen(false);
                  notify('Profile updated!');
                }}
                className="w-full py-2 rounded-xl bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ==================== FULL 10-PLAYER SCOREBOARD MODAL ==================== */}
        {inspectMatch && (
          <div className="absolute inset-0 z-50 bg-slate-950/88 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl max-h-[82vh] rounded-2xl bg-[#0D1836] border-2 border-[#E6B84C] p-4 flex flex-col gap-3 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div>
                  <div className="text-sm font-black text-[#FFE28A]">
                    {inspectMatch.victory ? 'VICTORY' : 'DEFEAT'} · {inspectMatch.mode.toUpperCase()} ·{' '}
                    {inspectMatch.blueKills} - {inspectMatch.redKills}
                  </div>
                  <div className="text-[11px] text-slate-400 mlbb-num">
                    Duration {formatClock(inspectMatch.durationSec)} · Full 10-Player Scoreboard
                  </div>
                </div>
                <button
                  onClick={() => setInspectMatch(null)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-xs font-black text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs">
                {inspectMatch.players.map((pl) => (
                  <div
                    key={pl.id}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                      pl.team === 'blue'
                        ? 'bg-sky-950/40 border-sky-500/35'
                        : 'bg-rose-950/40 border-rose-500/35'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <HeroPortraitSvg heroId={pl.heroId} size={32} />
                      <div className="truncate">
                        <div className="font-black text-white truncate">
                          {pl.name} {pl.isPlayer ? '(You)' : ''}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {pl.heroName} · Lv.{pl.level} · {pl.lane}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mlbb-num shrink-0">
                      <span className="font-black text-white">
                        {pl.kills}/{pl.deaths}/{pl.assists}
                      </span>
                      <span className="text-amber-300">{pl.gold.toLocaleString()}g</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-[#E6B84C]/50 text-[#FFE28A] font-black">
                        {pl.rating.toFixed(1)} {pl.medal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
