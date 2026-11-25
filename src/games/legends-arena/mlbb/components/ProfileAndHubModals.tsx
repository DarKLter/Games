import React, { useMemo, useState } from 'react';
import { MlbbProfileSave, MlbbRole } from '../types';
import { MLBB_ALL_HEROES, MLBB_ICONIC_HEROES, getMlbbHeroById } from '../data/heroes';
import { MLBB_BATTLE_EFFECTS, MLBB_EMOTES, MLBB_RANK_TIERS } from '../data/emblems';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { LobbyModalType } from './MainLobby';
import { PlayerProfileModal } from './PlayerProfileModal';
import { mlbbAudio } from '../engine/AudioEngine';

interface Props {
  modal: LobbyModalType;
  profile: MlbbProfileSave;
  onClose: () => void;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
  onReplaceProfile: (next: MlbbProfileSave) => void;
}

const MAILS = [
  {
    id: 'mail_s36',
    tag: 'System Notice',
    title: 'Season 36 Welcome Gift',
    body: 'Thank you for defending the Land of Dawn! Claim your seasonal Battle Points, Tickets, and Diamonds.',
    bp: 1500,
    tickets: 200,
    diamonds: 50
  },
  {
    id: 'mail_credit',
    tag: 'Claimable Reward',
    title: 'Fair Play Credit Bonus',
    body: 'Your 110 Credit Score qualifies you for weekly bonus BP & Star Protection.',
    bp: 1000,
    tickets: 100,
    diamonds: 0
  },
  {
    id: 'mail_gift',
    tag: 'Friend Gift',
    title: 'Gift from KaguraMain',
    body: 'Your Affinity Partner sent you Battle Points & Magic Dust for Ranked push!',
    bp: 600,
    tickets: 120,
    diamonds: 20
  },
  {
    id: 'mail_report',
    tag: 'Match Report',
    title: '2026 Map Variants Unlocked',
    body: 'Experience Dangerous Grass, Broken Walls, Flying Cloud, and Expanding Rivers in 3D!',
    bp: 800,
    tickets: 150,
    diamonds: 30
  }
];

const DAILY_TASKS = [
  { id: 'task_login', title: 'Daily Sanctuary Check-In', pts: 120, rewardBp: 300 },
  { id: 'task_warmup', title: 'Inspect 3D Hero Showcase', pts: 140, rewardBp: 350 },
  { id: 'task_social', title: 'Send a Like or Squad Greeting', pts: 160, rewardBp: 400 },
  { id: 'task_battle', title: 'Complete 1 Match (Any Mode)', pts: 200, rewardBp: 600 },
  { id: 'task_objective', title: 'Assist Turtle or Lord Objective', pts: 180, rewardBp: 500 }
];

const ACHIEVEMENTS = [
  { id: 'ach_first', title: 'Dawn Defender', desc: 'Complete your first match in Land of Dawn.', rewardBp: 800, pts: 400, check: (p: MlbbProfileSave) => p.matchHistory.length >= 1 },
  { id: 'ach_heroes', title: 'Hero Collector', desc: 'Own at least 6 iconic heroes.', rewardBp: 1500, pts: 600, check: (p: MlbbProfileSave) => p.ownedHeroIds.length >= 6 },
  { id: 'ach_credit', title: 'Model Citizen', desc: 'Maintain 100+ Credit Score.', rewardBp: 600, pts: 350, check: (p: MlbbProfileSave) => p.creditScore >= 100 },
  { id: 'ach_rank', title: 'Rising Legend', desc: 'Reach Epic rank or higher.', rewardBp: 2500, pts: 900, check: (p: MlbbProfileSave) => p.rankTierIdx >= 4 },
  { id: 'ach_charisma', title: 'Sanctuary Star', desc: 'Reach 4,000+ Charisma points.', rewardBp: 1200, pts: 550, check: (p: MlbbProfileSave) => p.charisma >= 4000 }
];

const COLLECTOR_TIERS = [
  { name: 'Novice Collector', minScore: 0, icon: '🥉', color: '#94A3B8' },
  { name: 'Renowned Collector', minScore: 600, icon: '🥈', color: '#38BDF8' },
  { name: 'Exalted Collector', minScore: 1400, icon: '🥇', color: '#A855F7' },
  { name: 'Mega Collector', minScore: 2600, icon: '💎', color: '#F59E0B' },
  { name: 'World Collector', minScore: 4000, icon: '👑', color: '#FFE28A' }
];

const STARLIGHT_LEVELS = Array.from({ length: 60 }, (_, idx) => idx + 1);

export const ProfileAndHubModals: React.FC<Props> = ({
  modal,
  profile,
  onClose,
  onUpdateProfile,
  onReplaceProfile
}) => {
  const [shopTab, setShopTab] = useState<'recommended' | 'heroes' | 'skins' | 'draw' | 'preparation' | 'fragments'>('recommended');
  const [drawMode, setDrawMode] = useState<'magic_wheel' | 'lucky_spin'>('magic_wheel');
  const [skinTagFilter, setSkinTagFilter] = useState<string>('All');
  const [shopSearch, setShopSearch] = useState('');
  const [shopRoleFilter, setShopRoleFilter] = useState<MlbbRole | 'All'>('All');
  const [lbCategory, setLbCategory] = useState<'ranked' | 'street_mmr' | 'global_power' | 'squad' | 'charisma' | 'collection'>('ranked');
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [deletedMailIds, setDeletedMailIds] = useState<string[]>([]);
  const [helpTab, setHelpTab] = useState<'faq' | 'bug' | 'appeal'>('faq');
  const [supportText, setSupportText] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState<string | null>(null);
  const [bracketSemi1, setBracketSemi1] = useState<'ONIC Sanctuary' | 'Echo Dawn'>('ONIC Sanctuary');
  const [bracketSemi2, setBracketSemi2] = useState<'RRQ Mythic' | 'Falcons EXP'>('RRQ Mythic');
  const [bracketChamp, setBracketChamp] = useState<string | null>(null);

  const filteredShopHeroes = useMemo(() => {
    const q = shopSearch.trim().toLowerCase();
    return MLBB_ALL_HEROES.filter((h) => {
      if (shopRoleFilter !== 'All' && h.role !== shopRoleFilter) return false;
      if (q && !h.name.toLowerCase().includes(q) && !h.lane.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [shopSearch, shopRoleFilter]);

  if (!modal || modal === 'prep' || modal === 'heroes' || modal === 'settings') return null;

  if (modal === 'profile') {
    return (
      <PlayerProfileModal
        profile={profile}
        onClose={onClose}
        onUpdateProfile={onUpdateProfile}
        onReplaceProfile={onReplaceProfile}
      />
    );
  }

  const rankTier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
  const ownedSkinsCount = Object.values(profile.ownedSkins).reduce((s, arr) => s + arr.length, 0);
  const collectionScore = profile.ownedHeroIds.length * 140 + ownedSkinsCount * 95 + profile.claimedAchievementIds.length * 180;
  const currentCollectorTier =
    [...COLLECTOR_TIERS].reverse().find((t) => collectionScore >= t.minScore) ?? COLLECTOR_TIERS[0];

  const notify = (msg: string, kind: 'click' | 'purchase' | 'claim' = 'click') => {
    setStatusMsg(msg);
    if (kind === 'purchase') mlbbAudio.playPurchase();
    else if (kind === 'claim') mlbbAudio.playClaimFanfare();
    else mlbbAudio.playClick();
    window.setTimeout(() => setStatusMsg(null), 2600);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/82 flex items-center justify-center p-3">
      <div className="relative w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#E6B84C]/65 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#E6B84C]/35">
          <div className="text-base font-black tracking-wide text-[#FFE28A] uppercase">
            {modal === 'shop' && 'Imperial Sanctuary Shop'}
            {modal === 'starlight' && 'Monthly Starlight Pass (Lv. 1–60)'}
            {modal === 'events' && 'Seasonal & Promo Diamond Event Hall'}
            {modal === 'daily' && 'Daily Tasks & Activity Chest (0–800)'}
            {modal === 'mail' && 'Sanctuary Mail Inbox'}
            {modal === 'help' && 'Customer Service Center'}
            {modal === 'recharge' && 'Diamond Recharge Simulator'}
            {modal === 'collection' && 'Collection Ladder & Achievements'}
            {modal === 'backpack' && 'Inventory Backpack'}
            {modal === 'esports' && 'MPL / M-Series Esports & Rising Open'}
            {modal === 'leaderboards' && 'Global & Street Leaderboards'}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold mlbb-num">
            <span className="text-cyan-300">🎟️ {profile.tickets.toLocaleString()}</span>
            <span className="text-[#FFE28A]">🪙 {profile.bp.toLocaleString()}</span>
            <span className="text-sky-300">💎 {profile.diamonds.toLocaleString()}</span>
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

        {statusMsg && (
          <div className="px-4 py-1.5 bg-emerald-600/95 text-xs font-black text-white text-center">{statusMsg}</div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {/* ==================== 6-TAB SHOP MODAL ==================== */}
          {modal === 'shop' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'recommended', label: 'Recommended' },
                    { id: 'heroes', label: 'Heroes' },
                    { id: 'skins', label: 'Skins' },
                    { id: 'draw', label: 'Draw (Wheel & Spin)' },
                    { id: 'preparation', label: 'Preparation' },
                    { id: 'fragments', label: 'Fragment Exchange' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      mlbbAudio.playSwoosh();
                      setShopTab(t.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                      shopTab === t.id ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {shopTab === 'recommended' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B3B6F] to-[#101C3D] border border-[#E6B84C]/50 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-black text-[#FFE28A] uppercase">Season 36 Featured Bundle</div>
                      <div className="text-base font-black text-white">Dawn Starter Vault — 3,000 BP + 120 Tickets + Chest</div>
                    </div>
                    <button
                      onClick={() => {
                        if (profile.diamonds < 120) return notify('Need 120 Diamonds! Open Recharge [+].');
                        onUpdateProfile((p) => ({
                          ...p,
                          diamonds: p.diamonds - 120,
                          bp: p.bp + 3000,
                          tickets: p.tickets + 120,
                          backpack: { ...p.backpack, chests: p.backpack.chests + 1 }
                        }));
                        notify('Purchased Dawn Starter Vault!', 'purchase');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#E6B84C] text-slate-950 font-black text-xs cursor-pointer mlbb-num"
                    >
                      Buy 💎 120
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {MLBB_ICONIC_HEROES.slice(0, 6).map((h) => {
                      const owned = profile.ownedHeroIds.includes(h.id);
                      return (
                        <div key={h.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                          <div className="flex items-center gap-2">
                            <HeroPortraitSvg heroId={h.id} size={42} />
                            <div className="min-w-0">
                              <div className="text-xs font-black text-white truncate">{h.name}</div>
                              <div className="text-[10px] text-amber-300">{h.role} · {h.lane}</div>
                            </div>
                          </div>
                          {owned ? (
                            <div className="py-1 rounded bg-emerald-900/50 text-center text-[11px] font-black text-emerald-300">
                              OWNED ✓
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (profile.bp < h.costBp) return notify('Not enough Battle Points!');
                                onUpdateProfile((p) => ({
                                  ...p,
                                  bp: p.bp - h.costBp,
                                  ownedHeroIds: [...p.ownedHeroIds, h.id]
                                }));
                                notify(`Unlocked ${h.name}!`, 'purchase');
                              }}
                              className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 text-[11px] font-black cursor-pointer mlbb-num"
                            >
                              Unlock 🪙 {h.costBp.toLocaleString()}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {shopTab === 'heroes' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                      placeholder={`Search all ${MLBB_ALL_HEROES.length} heroes...`}
                      className="flex-1 min-w-[160px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    {(['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setShopRoleFilter(r)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                          shopRoleFilter === r ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <span className="text-[10px] font-black text-amber-300 mlbb-num">
                      {filteredShopHeroes.length}/{MLBB_ALL_HEROES.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {filteredShopHeroes.map((h) => {
                      const owned = profile.ownedHeroIds.includes(h.id);
                      return (
                        <div key={h.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex flex-col justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <HeroPortraitSvg heroId={h.id} size={44} />
                            <div className="min-w-0">
                              <div className="text-sm font-black text-white truncate">{h.name}</div>
                              <div className="text-[11px] text-amber-300 truncate">{h.role} · {h.lane}</div>
                            </div>
                          </div>
                          {owned ? (
                            <div className="py-1.5 rounded-lg bg-emerald-900/50 text-center text-xs font-black text-emerald-300">
                              OWNED ✓
                            </div>
                          ) : (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  if (profile.bp < h.costBp) return notify('Not enough Battle Points!');
                                  onUpdateProfile((p) => ({
                                    ...p,
                                    bp: p.bp - h.costBp,
                                    ownedHeroIds: [...p.ownedHeroIds, h.id]
                                  }));
                                  notify(`Unlocked ${h.name}!`, 'purchase');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-[#E6B84C] hover:brightness-110 text-slate-950 text-[11px] font-black cursor-pointer mlbb-num"
                              >
                                🪙 {h.costBp.toLocaleString()}
                              </button>
                              <button
                                onClick={() => {
                                  if (profile.diamonds < h.costDiamonds) return notify('Not enough Diamonds!');
                                  onUpdateProfile((p) => ({
                                    ...p,
                                    diamonds: p.diamonds - h.costDiamonds,
                                    ownedHeroIds: [...p.ownedHeroIds, h.id]
                                  }));
                                  notify(`Unlocked ${h.name}!`, 'purchase');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-black cursor-pointer mlbb-num"
                              >
                                💎 {h.costDiamonds}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {shopTab === 'skins' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Elite', 'Special', 'Epic', 'Collector', 'Legend'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSkinTagFilter(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                          skinTagFilter === tag ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {MLBB_ICONIC_HEROES.flatMap((h) =>
                      h.skins
                        .filter((s) => s.costDiamonds > 0)
                        .filter((s) => skinTagFilter === 'All' || s.tag.toLowerCase().includes(skinTagFilter.toLowerCase()))
                        .map((s) => {
                          const owned = (profile.ownedSkins[h.id] ?? []).includes(s.id);
                          return (
                            <div key={s.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                              <div className="flex items-center gap-2.5">
                                <HeroPortraitSvg heroId={h.id} size={46} skinColor={s.color} skinAccent={s.accent} />
                                <div className="min-w-0">
                                  <div className="text-xs font-black text-white truncate">{s.name}</div>
                                  <div className="text-[10px] text-purple-300 font-bold">
                                    {h.name} · {s.tag}
                                  </div>
                                </div>
                              </div>
                              {owned ? (
                                <button
                                  onClick={() => {
                                    onUpdateProfile((p) => ({
                                      ...p,
                                      equippedSkins: { ...p.equippedSkins, [h.id]: s.id },
                                      showcaseHeroId: h.id
                                    }));
                                    notify(`Equipped ${s.name}!`);
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-black cursor-pointer"
                                >
                                  {profile.equippedSkins[h.id] === s.id ? 'EQUIPPED ✓' : 'EQUIP SKIN'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (profile.diamonds < s.costDiamonds) return notify('Not enough Diamonds! Visit Recharge.');
                                    onUpdateProfile((p) => ({
                                      ...p,
                                      diamonds: p.diamonds - s.costDiamonds,
                                      ownedSkins: { ...p.ownedSkins, [h.id]: [...(p.ownedSkins[h.id] ?? []), s.id] },
                                      equippedSkins: { ...p.equippedSkins, [h.id]: s.id }
                                    }));
                                    notify(`Purchased ${s.name}!`, 'purchase');
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black cursor-pointer mlbb-num"
                                >
                                  Buy 💎 {s.costDiamonds}
                                </button>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {shopTab === 'draw' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDrawMode('magic_wheel')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        drawMode === 'magic_wheel' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      ✨ Magic Wheel
                    </button>
                    <button
                      onClick={() => setDrawMode('lucky_spin')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        drawMode === 'lucky_spin' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      🎡 Lucky Spin
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#162452] to-[#0E1733] border border-[#E6B84C]/50 text-center space-y-3">
                    <div className="text-lg font-black text-[#FFE28A]">
                      {drawMode === 'magic_wheel' ? '✨ MAGIC WHEEL — LEGEND VAULT' : '🎡 LUCKY SPIN — SANCTUARY JACKPOT'}
                    </div>
                    <div className="text-xs text-slate-300">
                      {drawMode === 'magic_wheel'
                        ? 'Spend 60 Tickets per roll to win Bonus Diamonds, Hero Fragments, Battle Points, or Star Protection Cards!'
                        : 'Spend 20 Tickets per spin to win Tickets, Supply Chests, Double BP Cards, or Rare Hero Fragments!'}
                    </div>
                    {wheelResult && (
                      <div className="inline-block px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-sm font-black text-emerald-300">
                        {wheelResult}
                      </div>
                    )}
                    <div className="flex justify-center gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          const cost = drawMode === 'magic_wheel' ? 60 : 20;
                          if (profile.tickets < cost) return notify(`Need ${cost} Tickets!`);
                          const prizes =
                            drawMode === 'magic_wheel'
                              ? [
                                  { label: '+1,400 Battle Points!', apply: (p: MlbbProfileSave) => ({ ...p, bp: p.bp + 1400 }) },
                                  { label: '+45 Hero Fragments!', apply: (p: MlbbProfileSave) => ({ ...p, fragments: p.fragments + 45 }) },
                                  { label: '+150 Bonus Diamonds!', apply: (p: MlbbProfileSave) => ({ ...p, diamonds: p.diamonds + 150 }) },
                                  { label: '+1 Star Protection Card!', apply: (p: MlbbProfileSave) => ({ ...p, backpack: { ...p.backpack, starProtectionCards: p.backpack.starProtectionCards + 1 } }) }
                                ]
                              : [
                                  { label: '+550 Battle Points!', apply: (p: MlbbProfileSave) => ({ ...p, bp: p.bp + 550 }) },
                                  { label: '+1 Sanctuary Supply Chest!', apply: (p: MlbbProfileSave) => ({ ...p, backpack: { ...p.backpack, chests: p.backpack.chests + 1 } }) },
                                  { label: '+1 Double BP Card!', apply: (p: MlbbProfileSave) => ({ ...p, backpack: { ...p.backpack, doubleBpCards: p.backpack.doubleBpCards + 1 } }) },
                                  { label: '+25 Hero Fragments!', apply: (p: MlbbProfileSave) => ({ ...p, fragments: p.fragments + 25 }) }
                                ];
                          const pick = prizes[Math.floor(Math.random() * prizes.length)];
                          onUpdateProfile((p) => pick.apply({ ...p, tickets: p.tickets - cost }));
                          setWheelResult(`Won: ${pick.label}`);
                          mlbbAudio.playClaimFanfare();
                        }}
                        className="px-6 py-2.5 rounded-xl bg-[#E6B84C] hover:brightness-110 text-slate-950 font-black text-sm cursor-pointer mlbb-num"
                      >
                        DRAW 1x (🎟️ {drawMode === 'magic_wheel' ? 60 : 20})
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {shopTab === 'preparation' && (
                <div className="space-y-4">
                  {(
                    [
                      { key: 'recall', label: 'Recall Effects', items: MLBB_BATTLE_EFFECTS.recall },
                      { key: 'spawn', label: 'Spawn Effects', items: MLBB_BATTLE_EFFECTS.spawn },
                      { key: 'elim', label: 'Elimination Effects', items: MLBB_BATTLE_EFFECTS.elim },
                      { key: 'killNotif', label: 'Kill Notifications', items: MLBB_BATTLE_EFFECTS.killNotif }
                    ] as const
                  ).map((cat) => (
                    <div key={cat.key} className="space-y-2">
                      <div className="text-xs font-black text-[#FFE28A] uppercase">{cat.label}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {cat.items.map((ef) => {
                          const owned = profile.ownedEffects[cat.key].includes(ef.id);
                          const equipped = profile.equippedEffects[cat.key] === ef.id;
                          return (
                            <div key={ef.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{ef.icon}</span>
                                <div>
                                  <div className="text-xs font-black text-white">{ef.name}</div>
                                  <div className="text-[10px] text-cyan-300 mlbb-num">
                                    {ef.costTickets === 0 ? 'Starter' : `🎟️ ${ef.costTickets} Tickets`}
                                  </div>
                                </div>
                              </div>
                              {owned ? (
                                <button
                                  onClick={() => {
                                    onUpdateProfile((p) => ({
                                      ...p,
                                      equippedEffects: { ...p.equippedEffects, [cat.key]: ef.id }
                                    }));
                                    notify(`Equipped ${ef.name}!`);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                                    equipped ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                                  }`}
                                >
                                  {equipped ? 'Equipped' : 'Equip'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (profile.tickets < ef.costTickets) return notify('Not enough Tickets!');
                                    onUpdateProfile((p) => ({
                                      ...p,
                                      tickets: p.tickets - ef.costTickets,
                                      ownedEffects: { ...p.ownedEffects, [cat.key]: [...p.ownedEffects[cat.key], ef.id] },
                                      equippedEffects: { ...p.equippedEffects, [cat.key]: ef.id }
                                    }));
                                    notify(`Unlocked & Equipped ${ef.name}!`, 'purchase');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#E6B84C] text-slate-950 text-[11px] font-black cursor-pointer mlbb-num"
                                >
                                  🎟️ {ef.costTickets}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {shopTab === 'fragments' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-3 p-3 rounded-xl bg-[#101C3D] border border-[#E6B84C]/40 font-black text-[#FFE28A] mlbb-num">
                    Available Hero &amp; Skin Fragments: 🧩 {profile.fragments}
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="font-black text-white">🪙 5,000 Battle Points</div>
                    <div className="text-slate-400">Exchange 80 Fragments for instant BP.</div>
                    <button
                      onClick={() => {
                        if (profile.fragments < 80) return notify('Need 80 Fragments!');
                        onUpdateProfile((p) => ({ ...p, fragments: p.fragments - 80, bp: p.bp + 5000 }));
                        notify('Exchanged 80 Fragments → +5,000 BP!', 'purchase');
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                    >
                      Redeem (80 🧩)
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="font-black text-white">🛡️ Star Protection Card</div>
                    <div className="text-slate-400">Protect your Ranked stars on defeat.</div>
                    <button
                      onClick={() => {
                        if (profile.fragments < 60) return notify('Need 60 Fragments!');
                        onUpdateProfile((p) => ({
                          ...p,
                          fragments: p.fragments - 60,
                          backpack: { ...p.backpack, starProtectionCards: p.backpack.starProtectionCards + 1 }
                        }));
                        notify('Redeemed Star Protection Card!', 'purchase');
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                    >
                      Redeem (60 🧩)
                    </button>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                    <div className="font-black text-white">🎁 Sanctuary Supply Chest</div>
                    <div className="text-slate-400">Openable in Backpack for BP &amp; Tickets.</div>
                    <button
                      onClick={() => {
                        if (profile.fragments < 40) return notify('Need 40 Fragments!');
                        onUpdateProfile((p) => ({
                          ...p,
                          fragments: p.fragments - 40,
                          backpack: { ...p.backpack, chests: p.backpack.chests + 1 }
                        }));
                        notify('Redeemed Sanctuary Supply Chest!', 'purchase');
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                    >
                      Redeem (40 🧩)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== STARLIGHT PASS (LV 1–60) ==================== */}
          {modal === 'starlight' && (() => {
            const claimable = STARLIGHT_LEVELS.filter(
              (lv) => lv <= profile.starlightLevel && !profile.claimedStarlightLevels.includes(lv)
            );
            return (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/90 to-[#101C3D] border border-purple-400/45 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-black text-purple-200">
                      MONTHLY STARLIGHT PASS · LEVEL {profile.starlightLevel} / 60
                    </div>
                    <div className="text-xs text-slate-300">
                      Earn Starlight XP from matches &amp; daily tasks to unlock all 60 reward tiers.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300 mlbb-num">{profile.starlightXp} / 1000 XP</span>
                    <button
                      disabled={claimable.length === 0}
                      onClick={() => {
                        let addBp = 0;
                        let addTix = 0;
                        let addFrag = 0;
                        claimable.forEach((lv) => {
                          if (lv % 5 === 0) addFrag += 20;
                          else if (lv % 2 === 0) addBp += 800;
                          else addTix += 80;
                        });
                        onUpdateProfile((p) => ({
                          ...p,
                          bp: p.bp + addBp,
                          tickets: p.tickets + addTix,
                          fragments: p.fragments + addFrag,
                          claimedStarlightLevels: Array.from(new Set([...p.claimedStarlightLevels, ...claimable]))
                        }));
                        notify(`Claimed ${claimable.length} Starlight tier(s)!`, 'claim');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        claimable.length > 0 ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Claim All ({claimable.length})
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[54vh] overflow-y-auto pr-1">
                  {STARLIGHT_LEVELS.map((lv) => {
                    const claimed = profile.claimedStarlightLevels.includes(lv);
                    const unlocked = profile.starlightLevel >= lv;
                    const rewardLabel =
                      lv === 60
                        ? '👑 300 💎'
                        : lv % 5 === 0
                          ? '🧩 20 Frag'
                          : lv % 2 === 0
                            ? '🪙 800 BP'
                            : '🎟️ 80 Tix';
                    return (
                      <div
                        key={lv}
                        className={`p-2.5 rounded-xl border text-center space-y-1.5 ${
                          unlocked ? 'bg-[#101C3D] border-purple-400/50' : 'bg-slate-900/70 border-slate-800'
                        }`}
                      >
                        <div className="text-[11px] font-black text-purple-300 mlbb-num">Lv.{lv}</div>
                        <div className="text-[11px] text-white font-bold">{rewardLabel}</div>
                        <button
                          disabled={!unlocked || claimed}
                          onClick={() => {
                            onUpdateProfile((p) => ({
                              ...p,
                              diamonds: p.diamonds + (lv === 60 ? 300 : 0),
                              fragments: p.fragments + (lv % 5 === 0 && lv !== 60 ? 20 : 0),
                              bp: p.bp + (lv % 2 === 0 && lv % 5 !== 0 ? 800 : 0),
                              tickets: p.tickets + (lv % 2 !== 0 && lv % 5 !== 0 ? 80 : 0),
                              claimedStarlightLevels: [...p.claimedStarlightLevels, lv]
                            }));
                            notify(`Claimed Starlight Lv.${lv}!`, 'claim');
                          }}
                          className={`w-full py-1 rounded text-[10px] font-black cursor-pointer ${
                            claimed
                              ? 'bg-slate-700 text-slate-400'
                              : unlocked
                                ? 'bg-[#E6B84C] text-slate-950'
                                : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {claimed ? 'Claimed' : unlocked ? 'Claim' : 'Locked'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ==================== SEASONAL & PROMO DIAMOND EVENT HALL ==================== */}
          {modal === 'events' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B3B6F] via-[#122652] to-[#0E1A3B] border border-cyan-400/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-cyan-300 uppercase">PROMO DIAMOND CARNIVAL</div>
                  <div className="text-base font-black text-white">Season 36 Sanctuary Celebration</div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Claim free Promo Diamonds, Supply Chests, and Weekly Activity milestones.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onUpdateProfile((p) => ({
                      ...p,
                      diamonds: p.diamonds + 80,
                      weeklyActivity: Math.min(1000, p.weeklyActivity + 120)
                    }));
                    notify('Claimed +80 Promo Diamonds & +120 Activity!', 'claim');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs cursor-pointer"
                >
                  Claim Event Check-In (+80 💎)
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#101C3D] border border-[#E6B84C]/40 space-y-3">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-[#FFE28A]">WEEKLY ACTIVITY PROGRESS</span>
                  <span className="mlbb-num">{profile.weeklyActivity} / 1000</span>
                </div>
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-[#E6B84C]"
                    style={{ width: `${Math.min(100, (profile.weeklyActivity / 1000) * 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[200, 400, 600, 800, 1000].map((m) => {
                    const claimed = profile.claimedActivityMilestones.includes(m);
                    const ready = profile.weeklyActivity >= m;
                    return (
                      <button
                        key={m}
                        disabled={!ready || claimed}
                        onClick={() => {
                          onUpdateProfile((p) => ({
                            ...p,
                            bp: p.bp + m * 2,
                            tickets: p.tickets + 80,
                            claimedActivityMilestones: [...p.claimedActivityMilestones, m]
                          }));
                          notify(`Opened ${m}-Pt Weekly Chest (+${m * 2} BP, +80 Tickets)!`, 'claim');
                        }}
                        className={`p-2 rounded-xl border text-center text-[11px] font-black cursor-pointer ${
                          claimed
                            ? 'bg-slate-800 border-slate-700 text-slate-500'
                            : ready
                              ? 'bg-amber-500/20 border-[#E6B84C] text-[#FFE28A]'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div>🎁 {m}</div>
                        <div className="text-[10px]">{claimed ? 'Opened' : ready ? 'Claim' : 'Locked'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== DAILY TASKS & ACTIVITY CHEST (0–800) ==================== */}
          {modal === 'daily' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#101C3D] border border-emerald-400/45 space-y-3">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-emerald-300">DAILY ACTIVITY CHEST METER</span>
                  <span className="text-[#FFE28A] mlbb-num">{Math.min(800, profile.dailyActivity)} / 800</span>
                </div>
                <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#E6B84C] transition-all"
                    style={{ width: `${Math.min(100, (profile.dailyActivity / 800) * 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {[200, 400, 600, 800].map((m) => {
                    const claimed = profile.claimedDailyMilestones.includes(m);
                    const ready = profile.dailyActivity >= m;
                    return (
                      <button
                        key={m}
                        disabled={!ready || claimed}
                        onClick={() => {
                          onUpdateProfile((p) => ({
                            ...p,
                            bp: p.bp + m,
                            tickets: p.tickets + 60,
                            claimedDailyMilestones: [...p.claimedDailyMilestones, m]
                          }));
                          notify(`Opened ${m}-Pt Daily Chest (+${m} BP, +60 Tickets)!`, 'claim');
                        }}
                        className={`p-2.5 rounded-xl border text-center text-xs font-black cursor-pointer ${
                          claimed
                            ? 'bg-slate-800 border-slate-700 text-slate-500'
                            : ready
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div>🎁 {m} Pts</div>
                        <div className="text-[10px] mt-0.5 mlbb-num">🪙 {m} + 🎟️ 60</div>
                        <div className="text-[10px] text-[#FFE28A] mt-0.5">
                          {claimed ? 'Claimed ✓' : ready ? 'Tap to Open' : 'Locked'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-[#FFE28A] uppercase">Today&apos;s Quests</div>
                {DAILY_TASKS.map((t) => {
                  const done = profile.dailyTasksDone.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="font-black text-white">{t.title}</div>
                        <div className="text-[11px] text-amber-300 mlbb-num">
                          +{t.pts} Activity · 🪙 {t.rewardBp} BP
                        </div>
                      </div>
                      <button
                        disabled={done}
                        onClick={() => {
                          onUpdateProfile((p) => ({
                            ...p,
                            bp: p.bp + t.rewardBp,
                            dailyActivity: Math.min(800, p.dailyActivity + t.pts),
                            weeklyActivity: Math.min(1000, p.weeklyActivity + t.pts),
                            dailyTasksDone: [...p.dailyTasksDone, t.id]
                          }));
                          notify(`Completed "${t.title}" (+${t.pts} Activity, +${t.rewardBp} BP)!`, 'claim');
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-black cursor-pointer ${
                          done ? 'bg-slate-700 text-slate-400' : 'bg-[#E6B84C] text-slate-950'
                        }`}
                      >
                        {done ? 'Claimed ✓' : 'Claim'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== MAIL ==================== */}
          {modal === 'mail' && (() => {
            const visibleMails = MAILS.filter((m) => !deletedMailIds.includes(m.id));
            const unclaimed = visibleMails.filter((m) => !profile.claimedMailIds.includes(m.id));
            return (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 pb-1">
                  <div className="text-xs text-slate-300 font-bold">
                    {visibleMails.length} Message(s) · {unclaimed.length} Unclaimed
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={unclaimed.length === 0}
                      onClick={() => {
                        const addBp = unclaimed.reduce((s, m) => s + m.bp, 0);
                        const addTix = unclaimed.reduce((s, m) => s + m.tickets, 0);
                        const addDia = unclaimed.reduce((s, m) => s + m.diamonds, 0);
                        onUpdateProfile((p) => ({
                          ...p,
                          bp: p.bp + addBp,
                          tickets: p.tickets + addTix,
                          diamonds: p.diamonds + addDia,
                          claimedMailIds: Array.from(new Set([...p.claimedMailIds, ...unclaimed.map((m) => m.id)]))
                        }));
                        notify(`Claimed all ${unclaimed.length} mails (+${addBp} BP, +${addTix} Tickets, +${addDia} Diamonds)!`, 'claim');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                        unclaimed.length > 0 ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Claim All
                    </button>
                    <button
                      onClick={() => {
                        const readIds = visibleMails.filter((m) => profile.claimedMailIds.includes(m.id)).map((m) => m.id);
                        if (readIds.length === 0) return notify('No claimed mail to delete.');
                        setDeletedMailIds((prev) => Array.from(new Set([...prev, ...readIds])));
                        notify(`Deleted ${readIds.length} claimed mail(s).`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-700 text-xs font-black text-slate-200 cursor-pointer"
                    >
                      Delete Read
                    </button>
                  </div>
                </div>
                {visibleMails.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#101C3D] text-center text-xs text-slate-400">
                    Inbox cleared! All Sanctuary rewards have been claimed.
                  </div>
                ) : (
                  visibleMails.map((m) => {
                    const claimed = profile.claimedMailIds.includes(m.id);
                    return (
                      <div key={m.id} className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-black text-cyan-300 uppercase">{m.tag}</div>
                          <div className="text-sm font-black text-white">{m.title}</div>
                          <div className="text-xs text-slate-300 mt-0.5">{m.body}</div>
                          <div className="text-[11px] text-amber-300 font-bold mt-1 mlbb-num">
                            Rewards: 🪙 {m.bp} · 🎟️ {m.tickets} {m.diamonds > 0 ? `· 💎 ${m.diamonds}` : ''}
                          </div>
                        </div>
                        <button
                          disabled={claimed}
                          onClick={() => {
                            onUpdateProfile((p) => ({
                              ...p,
                              bp: p.bp + m.bp,
                              tickets: p.tickets + m.tickets,
                              diamonds: p.diamonds + m.diamonds,
                              claimedMailIds: [...p.claimedMailIds, m.id]
                            }));
                            notify(`Claimed "${m.title}"!`, 'claim');
                          }}
                          className={`px-3.5 py-2 rounded-lg text-xs font-black cursor-pointer shrink-0 ${
                            claimed ? 'bg-slate-700 text-slate-400' : 'bg-[#E6B84C] text-slate-950'
                          }`}
                        >
                          {claimed ? 'Claimed ✓' : 'Claim'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}

          {/* ==================== RECHARGE SIMULATOR ==================== */}
          {modal === 'recharge' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { diamonds: 250, bonus: 25, label: 'Starter Pack' },
                { diamonds: 500, bonus: 65, label: 'Weekly Diamond Pass' },
                { diamonds: 1000, bonus: 150, label: 'Starlight Bundle' },
                { diamonds: 2500, bonus: 420, label: 'Collector Vault' },
                { diamonds: 5000, bonus: 1000, label: 'Mythic Treasury' }
              ].map((pack) => (
                <button
                  key={pack.diamonds}
                  onClick={() => {
                    onUpdateProfile((p) => ({ ...p, diamonds: p.diamonds + pack.diamonds + pack.bonus }));
                    notify(`Simulated Recharge: +${pack.diamonds + pack.bonus} Diamonds!`, 'purchase');
                  }}
                  className="p-4 rounded-xl bg-[#101C3D] border border-sky-400/45 hover:border-sky-200 text-center space-y-1 cursor-pointer transition"
                >
                  <div className="text-xl">💎</div>
                  <div className="text-base font-black text-sky-300 mlbb-num">
                    {pack.diamonds} + {pack.bonus}
                  </div>
                  <div className="text-xs text-slate-300">{pack.label} (Free Demo)</div>
                </button>
              ))}
            </div>
          )}

          {/* ==================== COLLECTION LADDER & ACHIEVEMENTS ==================== */}
          {modal === 'collection' && (() => {
            const claimableAch = ACHIEVEMENTS.filter(
              (a) => a.check(profile) && !profile.claimedAchievementIds.includes(a.id)
            );
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B2B5C] to-[#101C3D] border border-[#E6B84C]/50 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-[#FFE28A] uppercase">Collection Tier Ladder</div>
                      <div className="text-lg font-black text-white">
                        {currentCollectorTier.icon} {currentCollectorTier.name}
                      </div>
                      <div className="text-xs text-slate-300 mlbb-num">
                        Score: {collectionScore.toLocaleString()} pts · {profile.ownedHeroIds.length} Heroes · {ownedSkinsCount} Skins
                      </div>
                    </div>
                    <button
                      disabled={claimableAch.length === 0}
                      onClick={() => {
                        const addBp = claimableAch.reduce((s, a) => s + a.rewardBp, 0);
                        onUpdateProfile((p) => ({
                          ...p,
                          bp: p.bp + addBp,
                          claimedAchievementIds: Array.from(new Set([...p.claimedAchievementIds, ...claimableAch.map((a) => a.id)]))
                        }));
                        notify(`Claimed all ${claimableAch.length} achievement(s) (+${addBp} BP)!`, 'claim');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer ${
                        claimableAch.length > 0 ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Claim All ({claimableAch.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                    {COLLECTOR_TIERS.map((t) => {
                      const reached = collectionScore >= t.minScore;
                      return (
                        <div
                          key={t.name}
                          className={`p-2 rounded-xl border ${
                            reached ? 'bg-amber-500/15 border-[#E6B84C]' : 'bg-slate-900/80 border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="text-base">{t.icon}</div>
                          <div className="font-black text-white leading-tight mt-0.5">{t.name.replace(' Collector', '')}</div>
                          <div className="text-slate-400 mlbb-num">{t.minScore}+</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  {ACHIEVEMENTS.map((a) => {
                    const claimed = profile.claimedAchievementIds.includes(a.id);
                    const done = a.check(profile);
                    return (
                      <div key={a.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-black text-white">{a.title}</div>
                          <div className="text-xs text-slate-300">{a.desc}</div>
                        </div>
                        <button
                          disabled={!done || claimed}
                          onClick={() => {
                            onUpdateProfile((p) => ({
                              ...p,
                              bp: p.bp + a.rewardBp,
                              claimedAchievementIds: [...p.claimedAchievementIds, a.id]
                            }));
                            notify(`Claimed +${a.rewardBp} BP!`, 'claim');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                            claimed ? 'bg-slate-700 text-slate-400' : done ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {claimed ? 'Claimed ✓' : done ? `Claim 🪙 ${a.rewardBp}` : 'In Progress'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ==================== BACKPACK ==================== */}
          {modal === 'backpack' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    key: 'chests',
                    label: 'Sanctuary Supply Chest',
                    icon: '🎁',
                    count: profile.backpack.chests,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        bp: p.bp + 650,
                        tickets: p.tickets + 60,
                        backpack: { ...p.backpack, chests: Math.max(0, p.backpack.chests - 1) }
                      }));
                      notify('Opened Chest: +650 BP & +60 Tickets!', 'claim');
                    }
                  },
                  {
                    key: 'doubleBpCards',
                    label: 'Double BP Card',
                    icon: '🪙',
                    count: profile.backpack.doubleBpCards,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        bp: p.bp + 500,
                        backpack: { ...p.backpack, doubleBpCards: Math.max(0, p.backpack.doubleBpCards - 1) }
                      }));
                      notify('Activated Double BP Card (+500 BP)!', 'claim');
                    }
                  },
                  {
                    key: 'doubleExpCards',
                    label: 'Double EXP Card',
                    icon: '⚡',
                    count: profile.backpack.doubleExpCards,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        exp: (p.exp + 350) % 1000,
                        level: p.level + (p.exp + 350 >= 1000 ? 1 : 0),
                        backpack: { ...p.backpack, doubleExpCards: Math.max(0, p.backpack.doubleExpCards - 1) }
                      }));
                      notify('Activated Double EXP Card (+350 Account EXP)!', 'claim');
                    }
                  },
                  {
                    key: 'starProtectionCards',
                    label: 'Star Protection Card',
                    icon: '🛡️',
                    count: profile.backpack.starProtectionCards,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        starProtectionPts: Math.min(1000, p.starProtectionPts + 500),
                        backpack: { ...p.backpack, starProtectionCards: Math.max(0, p.backpack.starProtectionCards - 1) }
                      }));
                      notify('+500 Star Protection Points!', 'claim');
                    }
                  },
                  {
                    key: 'starRaisingCards',
                    label: 'Star Raising Card',
                    icon: '🌟',
                    count: profile.backpack.starRaisingCards,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        rankStars: p.rankStars + 1,
                        backpack: { ...p.backpack, starRaisingCards: Math.max(0, p.backpack.starRaisingCards - 1) }
                      }));
                      notify('Used Star Raising Card (+1 Ranked Star)!', 'claim');
                    }
                  },
                  {
                    key: 'trialCards',
                    label: 'Hero Trial Card',
                    icon: '🃏',
                    count: profile.backpack.trialCards,
                    use: () => {
                      onUpdateProfile((p) => ({
                        ...p,
                        bp: p.bp + 200,
                        backpack: { ...p.backpack, trialCards: Math.max(0, p.backpack.trialCards - 1) }
                      }));
                      notify(`Activated Trial Card (+200 BP · All ${MLBB_ALL_HEROES.length} heroes ready)!`, 'claim');
                    }
                  }
                ].map((item) => (
                  <div key={item.key} className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-black text-amber-300 mlbb-num">x{item.count}</span>
                    </div>
                    <div className="font-bold text-white">{item.label}</div>
                    <button
                      disabled={item.count <= 0}
                      onClick={item.use}
                      className={`py-1.5 rounded-lg font-black cursor-pointer ${
                        item.count > 0 ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      Use / Open
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-black text-[#FFE28A]">Fragments &amp; Battle Emotes</div>
                  <div className="text-slate-300 mt-0.5 mlbb-num">
                    🧩 {profile.fragments} Fragments · {profile.ownedEmotes.length}/{MLBB_EMOTES.length} Battle Emotes Owned
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {profile.equippedEmotes.map((eid) => {
                    const em = MLBB_EMOTES.find((e) => e.id === eid);
                    return (
                      <button
                        key={eid}
                        onClick={() => {
                          if (em) mlbbAudio.playEmote(em.sfx);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-sm cursor-pointer"
                        title={`Preview ${em?.name}`}
                      >
                        {em?.icon ?? '👍'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== ESPORTS (MPL / M-SERIES BRACKET SIMULATOR) ==================== */}
          {modal === 'esports' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#1B3B6F] to-[#101C3D] border border-[#E6B84C]/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base font-black text-[#FFE28A]">M-SERIES WORLD CHAMPIONSHIP &amp; RISING OPEN</div>
                  <div className="text-slate-300 mt-0.5">
                    Click teams to simulate the MPL / M-Series Knockout Bracket and claim Guess Coin BP rewards.
                  </div>
                </div>
                <button
                  onClick={() => {
                    const champ = Math.random() > 0.5 ? bracketSemi1 : bracketSemi2;
                    setBracketChamp(champ);
                    onUpdateProfile((p) => ({ ...p, bp: p.bp + 300 }));
                    notify(`Simulated Finals: ${champ} lifts the M-Series Trophy! (+300 BP)`, 'claim');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                >
                  🏆 Simulate Finals
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="space-y-2">
                  <div className="font-black text-cyan-300 uppercase">Semifinal A</div>
                  {(['ONIC Sanctuary', 'Echo Dawn'] as const).map((tm) => (
                    <button
                      key={tm}
                      onClick={() => {
                        setBracketSemi1(tm);
                        mlbbAudio.playClick();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left font-black cursor-pointer ${
                        bracketSemi1 === tm ? 'bg-amber-500/20 border-[#E6B84C] text-[#FFE28A]' : 'bg-[#101C3D] border-slate-700 text-slate-300'
                      }`}
                    >
                      {tm} {bracketSemi1 === tm ? '→ Finals' : ''}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="font-black text-cyan-300 uppercase">Semifinal B</div>
                  {(['RRQ Mythic', 'Falcons EXP'] as const).map((tm) => (
                    <button
                      key={tm}
                      onClick={() => {
                        setBracketSemi2(tm);
                        mlbbAudio.playClick();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left font-black cursor-pointer ${
                        bracketSemi2 === tm ? 'bg-amber-500/20 border-[#E6B84C] text-[#FFE28A]' : 'bg-[#101C3D] border-slate-700 text-slate-300'
                      }`}
                    >
                      {tm} {bracketSemi2 === tm ? '→ Finals' : ''}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-2xl bg-[#101C3D] border border-[#E6B84C]/50 text-center space-y-2">
                  <div className="text-[11px] font-black text-[#FFE28A]">GRAND FINALS (BO7)</div>
                  <div className="text-sm font-black text-white">
                    {bracketSemi1} <span className="text-amber-300">vs</span> {bracketSemi2}
                  </div>
                  {bracketChamp ? (
                    <div className="py-1.5 px-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black">
                      👑 Champion: {bracketChamp}
                    </div>
                  ) : (
                    <div className="text-slate-400">Pick finalists or click Simulate Finals</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== CUSTOMER SERVICE (FAQ, BUG REPORT, ACCOUNT APPEAL) ==================== */}
          {modal === 'help' && (
            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex gap-1.5">
                {(
                  [
                    { id: 'faq', label: '📖 FAQ & Combat Guide' },
                    { id: 'bug', label: '🐛 Bug Report' },
                    { id: 'appeal', label: '⚖️ Account Appeal' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      mlbbAudio.playSwoosh();
                      setHelpTab(t.id);
                      setSupportSubmitted(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                      helpTab === t.id ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {helpTab === 'faq' && (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-black text-[#FFE28A]">Exact Combat &amp; Objective Timers</div>
                    <div className="mt-1">• Damage Formula: Raw × 120 / (120 + Effective Defense), negative pen floor -60.</div>
                    <div>• Movement Speed Soft-Caps: 100% up to 415 MS, 80% (415–490), 50% (&gt;490).</div>
                    <div>• Timers: Minions 0:10 · Orange 0:20 · Purple 0:25 · Turtle 2:00 · Shields Expire 5:00 · Lord 8:00 / 12:00 / 18:00.</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-black text-[#FFE28A]">Desktop &amp; Touch Controls</div>
                    <div className="mt-1">• Move: WASD / Arrow Keys or Bottom-Left Virtual Joystick.</div>
                    <div>• Skills: Q / W / E (or drag skill buttons to aim, drag to Cancel X to abort).</div>
                    <div>• Basic Attack: Space · Spell: F · Recall: B · Regen: R · Shop: P · Scoreboard: Tab · Emote Wheel: T.</div>
                  </div>
                </div>
              )}

              {(helpTab === 'bug' || helpTab === 'appeal') && (
                <div className="p-4 rounded-xl bg-[#101C3D] border border-slate-700 space-y-3">
                  <div className="font-black text-[#FFE28A]">
                    {helpTab === 'bug' ? 'Submit a Bug Report' : 'Submit Account / Credit Score Appeal'}
                  </div>
                  <div className="text-slate-300">
                    Account ID: <span className="font-black text-white mlbb-num">{profile.accountId} ({profile.serverId})</span>
                  </div>
                  <textarea
                    rows={4}
                    value={supportText}
                    onChange={(e) => setSupportText(e.target.value)}
                    placeholder={
                      helpTab === 'bug'
                        ? 'Describe the issue, hero, or map variant...'
                        : 'Explain your credit score or matchmaking appeal...'
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  {supportSubmitted && (
                    <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold">
                      {supportSubmitted}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (!supportText.trim()) return notify('Please enter details before submitting.');
                      const ticketId = `CS-${Math.floor(100000 + Math.random() * 900000)}`;
                      setSupportSubmitted(`Ticket ${ticketId} received by Sanctuary Support! Thank you.`);
                      setSupportText('');
                      notify(`Submitted ${ticketId}!`, 'claim');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#E6B84C] text-slate-950 font-black cursor-pointer"
                  >
                    Submit Ticket
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== 6-CATEGORY LEADERBOARDS ==================== */}
          {modal === 'leaderboards' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'ranked', label: 'Ranked Tier' },
                    { id: 'street_mmr', label: 'Street / Regional MMR' },
                    { id: 'global_power', label: 'Global Hero Power' },
                    { id: 'squad', label: 'Squads' },
                    { id: 'charisma', label: 'Charisma' },
                    { id: 'collection', label: 'Collection' }
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      mlbbAudio.playSwoosh();
                      setLbCategory(c.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                      lbCategory === c.id ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  {
                    rank: 1,
                    name: 'ONIC.Kairi',
                    hero: 'lancelot',
                    val:
                      lbCategory === 'ranked'
                        ? 'Mythical Immortal ★162'
                        : lbCategory === 'street_mmr'
                          ? 'Manila #1 · 5,640 MMR'
                          : lbCategory === 'global_power'
                            ? 'Global #1 · 9,420 Power'
                            : lbCategory === 'squad'
                              ? '[SAN] Sanctuary Elite · 18,400'
                              : lbCategory === 'charisma'
                                ? '94,200 ❤️'
                                : 'World Collector · 6,420'
                  },
                  {
                    rank: 2,
                    name: 'RRQ.Skylar',
                    hero: 'miya',
                    val:
                      lbCategory === 'ranked'
                        ? 'Mythical Immortal ★148'
                        : lbCategory === 'street_mmr'
                          ? 'Jakarta #1 · 5,320 MMR'
                          : lbCategory === 'global_power'
                            ? 'Global #2 · 9,110 Power'
                            : lbCategory === 'squad'
                              ? '[MYT] Mythic Kings · 16,950'
                              : lbCategory === 'charisma'
                                ? '81,500 ❤️'
                                : 'World Collector · 5,890'
                  },
                  {
                    rank: 3,
                    name: 'KiboySet',
                    hero: 'tigreal',
                    val:
                      lbCategory === 'ranked'
                        ? 'Mythical Glory ★96'
                        : lbCategory === 'street_mmr'
                          ? 'Cebu #1 · 4,980 MMR'
                          : lbCategory === 'global_power'
                            ? 'Global #3 · 8,740 Power'
                            : lbCategory === 'squad'
                              ? '[EXP] Dawn Guardians · 15,200'
                              : lbCategory === 'charisma'
                                ? '74,100 ❤️'
                                : 'Mega Collector · 3,740'
                  },
                  {
                    rank: 4,
                    name: profile.name,
                    hero: profile.showcaseHeroId,
                    val:
                      lbCategory === 'ranked'
                        ? `${rankTier.name} ★${profile.rankStars}`
                        : lbCategory === 'street_mmr'
                          ? `${getMlbbHeroById(profile.showcaseHeroId).name} · ${profile.heroStats[profile.showcaseHeroId]?.mmr ?? 1440} MMR`
                          : lbCategory === 'global_power'
                            ? `${getMlbbHeroById(profile.showcaseHeroId).name} · 3,420 Power`
                            : lbCategory === 'squad'
                              ? `[${profile.squad.tag}] ${profile.squad.name} · ${(profile.squad.activity ?? 8420).toLocaleString()}`
                              : lbCategory === 'charisma'
                                ? `${profile.charisma.toLocaleString()} ❤️`
                                : `${currentCollectorTier.name} · ${collectionScore.toLocaleString()}`
                  }
                ].map((row) => (
                  <div
                    key={row.rank}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      row.name === profile.name ? 'bg-amber-500/15 border-[#E6B84C]' : 'bg-[#101C3D] border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center font-black text-[#FFE28A] mlbb-num">#{row.rank}</span>
                      <HeroPortraitSvg heroId={row.hero} size={32} />
                      <span className="font-black text-white">{row.name}</span>
                    </div>
                    <span className="font-bold text-amber-300 mlbb-num">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
