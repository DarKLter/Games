import React, { useEffect, useMemo, useState } from 'react';
import {
  MiniMilitiaSave,
  MmBotDifficulty,
  MmMatchConfig,
  MmMatchSummary,
  MmModeId,
  MmRoomBotSlot
} from '../types';
import {
  getMmRankForXp,
  makeRandomAvatar,
  MM_ACHIEVEMENTS,
  MM_BOT_NAMES,
  MM_QUICK_CHATS,
  MM_RANKS,
  MM_SIMULATED_ONLINE_ROOMS,
  MmOnlineRoomListing
} from '../data/progression';
import { getMmMapById, MM_MAPS } from '../data/maps';
import { getMmWeaponById } from '../data/weapons';
import { mmAudio } from '../engine/AudioEngine';
import { AvatarPortraitBadge, MapPreviewCanvas, RankInsigniaBadge } from './AvatarPreviewCanvas';

/* ============================================================================
 * 1. PROFILE, 21 RANKS, STATS, WEAPON MASTERY, HISTORY & 22 ACHIEVEMENTS
 * ============================================================================ */
export const ProfileAndMedalsModal: React.FC<{
  save: MiniMilitiaSave;
  initialTab?: 'identity' | 'stats' | 'mastery' | 'achievements';
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onClose: () => void;
}> = ({ save, initialTab = 'identity', onUpdateSave, onClose }) => {
  const [tab, setTab] = useState<'identity' | 'stats' | 'mastery' | 'achievements'>(initialTab);
  const [callsign, setCallsign] = useState(save.callsign);
  const [clanTag, setClanTag] = useState(save.clanTag);
  const [copied, setCopied] = useState(false);

  const rankInfo = getMmRankForXp(save.xp);
  const avatar = save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0];
  const kd = save.stats.deaths > 0 ? (save.stats.kills / save.stats.deaths).toFixed(2) : save.stats.kills.toFixed(2);
  const winRate = save.stats.matches > 0 ? Math.round((save.stats.wins / save.stats.matches) * 100) : 0;

  const claimAchievement = (achId: string, rewardCash: number, rewardXp: number) => {
    mmAudio.playKillstreak();
    onUpdateSave((prev) => {
      if (prev.claimedAchievements.includes(achId)) return prev;
      return {
        ...prev,
        cash: prev.cash + rewardCash,
        xp: prev.xp + rewardXp,
        claimedAchievements: [...prev.claimedAchievements, achId]
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <div className="flex items-center gap-2">
            <RankInsigniaBadge rank={rankInfo.current} size={26} />
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-[#F5A623]">
                📊 SOLDIER DOSSIER & MEDALS
              </h2>
              <p className="text-[11px] font-mono text-[#C2B280]">
                {rankInfo.current.title} · {save.xp.toLocaleString()} XP · Loadout Discount -{rankInfo.current.discountPct}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'identity' as const, label: 'Ranks (21)' },
              { id: 'stats' as const, label: 'Career & History' },
              { id: 'mastery' as const, label: 'Weapons' },
              { id: 'achievements' as const, label: 'Medals (22)' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  setTab(t.id);
                }}
                className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${
                  tab === t.id
                    ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                    : 'bg-[#2A3320] text-[#C2B280] border-[#4F5D3B]'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase ml-1"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          {tab === 'identity' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3">
                <div className="flex items-center gap-3">
                  <AvatarPortraitBadge avatar={avatar} size={62} />
                  <div>
                    <div className="text-xs font-mono text-[#C2B280]">SERVICE ID</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm">{save.playerId}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) void navigator.clipboard.writeText(save.playerId).catch(() => {});
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="px-1.5 py-0.5 rounded bg-[#2A3320] border border-[#5D7045] text-[10px] font-mono text-[#F5A623]"
                      >
                        {copied ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Callsign</label>
                  <input
                    value={callsign}
                    maxLength={16}
                    onChange={(e) => setCallsign(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Clan Tag (4 chars)</label>
                  <input
                    value={clanTag}
                    maxLength={4}
                    onChange={(e) => setClanTag(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm font-mono uppercase text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    mmAudio.playPickup();
                    onUpdateSave((prev) => ({
                      ...prev,
                      callsign: callsign.trim() || 'Soldier',
                      clanTag: clanTag.trim().slice(0, 4).toUpperCase()
                    }));
                  }}
                  className="w-full py-2 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
                >
                  Save Callsign & Clan Tag
                </button>
              </div>

              {/* 21 Official Military Ranks Ladder */}
              <div className="lg:col-span-7 p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
                <div className="text-xs font-black uppercase text-[#C2B280] mb-2">
                  21 OFFICIAL MILITARY RANKS LADDER
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {MM_RANKS.map((r) => {
                    const reached = save.xp >= r.xpRequired;
                    const isCur = rankInfo.current.index === r.index;
                    return (
                      <div
                        key={r.index}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded border ${
                          isCur
                            ? 'border-[#F5A623] bg-[#364428]'
                            : reached
                              ? 'border-[#4F5D3B] bg-[#1E251A]'
                              : 'border-[#2E3438] bg-[#181C1F] opacity-65'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <RankInsigniaBadge rank={r} size={22} />
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">
                              {r.index + 1}. {r.title}
                            </div>
                            <div className="text-[10px] font-mono text-[#C2B280] tabular-nums">
                              {r.xpRequired.toLocaleString()} XP · -{r.discountPct}% Kits
                            </div>
                          </div>
                        </div>
                        {isCur && <span className="text-[10px] font-mono text-[#F5A623] font-bold">NOW</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { label: 'Matches', val: save.stats.matches },
                  { label: 'Win Rate', val: `${winRate}%` },
                  { label: 'Kills', val: save.stats.kills },
                  { label: 'Deaths', val: save.stats.deaths },
                  { label: 'K/D Ratio', val: kd },
                  { label: 'Headshots', val: save.stats.headshots },
                  { label: 'Melee Kills', val: save.stats.meleeKills },
                  { label: 'Dual Wield', val: save.stats.dualWieldKills },
                  { label: 'Grenade Kills', val: save.stats.grenadeKills },
                  { label: 'Best Streak', val: save.stats.bestKillstreak },
                  { label: 'Best Survival', val: `W${save.stats.survivalBestWave}` },
                  { label: 'Flag Caps', val: save.stats.flagCaptures }
                ].map((s) => (
                  <div key={s.label} className="p-2.5 rounded bg-[#23272A] border border-[#4F5D3B] text-center">
                    <div className="text-[10px] font-mono uppercase text-[#C2B280]">{s.label}</div>
                    <div className="text-lg font-black font-mono tabular-nums text-[#F5A623] mt-0.5">{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
                <div className="text-xs font-black uppercase text-[#C2B280] mb-2">
                  RECENT MATCH HISTORY (LAST 20)
                </div>
                {save.matchHistory.length === 0 ? (
                  <p className="text-xs font-mono text-[#9CA3AF]">
                    No completed matches yet. Jump into Quick Play, Survival, or Boot Camp!
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[220px] overflow-y-auto">
                    {save.matchHistory.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-[#181C1F] border border-[#323A30] text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span className={m.victory ? 'text-[#22C55E] font-bold' : 'text-[#EF4444] font-bold'}>
                            {m.victory ? 'WIN' : 'LOSS'}
                          </span>
                          <span className="text-white font-bold">{m.mapName}</span>
                          <span className="uppercase text-[#C2B280]">{m.mode}</span>
                          {m.isMvp && <span className="text-[#F5A623]">👑 MVP</span>}
                        </div>
                        <div className="tabular-nums text-[#D6D3C4]">
                          {m.kills}K / {m.deaths}D / {m.assists}A · +{m.xpEarned} XP
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'mastery' && (
            <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
              <div className="text-xs font-black uppercase text-[#C2B280] mb-2">WEAPON MASTERY LOG</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(save.weaponMastery).length === 0 ? (
                  <p className="text-xs font-mono text-[#9CA3AF] col-span-full">
                    Fire weapons in battle to track kills, headshots, and hit accuracy here.
                  </p>
                ) : (
                  Object.entries(save.weaponMastery)
                    .sort((a, b) => b[1].kills - a[1].kills)
                    .map(([wid, st]) => {
                      const w = getMmWeaponById(wid);
                      const acc = st.shotsFired > 0 ? Math.round((st.shotsHit / st.shotsFired) * 100) : 0;
                      return (
                        <div key={wid} className="p-2.5 rounded bg-[#181C1F] border border-[#3E4A2E]">
                          <div className="text-xs font-black text-[#F5A623]">{w.name}</div>
                          <div className="text-[11px] font-mono text-[#C2B280] tabular-nums mt-1">
                            Kills: {st.kills} · HS: {st.headshots} · Acc: {acc}%
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {tab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MM_ACHIEVEMENTS.map((ach) => {
                const prog = ach.getProgress(save);
                const pct = Math.min(100, Math.round((prog / ach.target) * 100));
                const claimed = save.claimedAchievements.includes(ach.id);
                const ready = prog >= ach.target && !claimed;
                return (
                  <div
                    key={ach.id}
                    className={`p-2.5 rounded border flex items-center justify-between gap-2 ${
                      ready
                        ? 'border-[#F5A623] bg-[#344023]'
                        : claimed
                          ? 'border-[#22C55E]/50 bg-[#1B261B]'
                          : 'border-[#3E4A2E] bg-[#23272A]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span>{ach.icon}</span>
                        <span className="text-xs font-black truncate">{ach.title}</span>
                      </div>
                      <div className="text-[11px] text-[#C2B280]">{ach.desc}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-[#141719] rounded-sm overflow-hidden">
                          <div className="h-full bg-[#F5A623]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono tabular-nums text-[#C2B280]">
                          {Math.min(prog, ach.target)}/{ach.target}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[10px] font-mono text-[#22C55E]">+💵{ach.rewardCash}</div>
                      <div className="text-[10px] font-mono text-[#F5A623]">+{ach.rewardXp}XP</div>
                      {claimed ? (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold">
                          CLAIMED
                        </span>
                      ) : ready ? (
                        <button
                          type="button"
                          onClick={() => claimAchievement(ach.id, ach.rewardCash, ach.rewardXp)}
                          className="mt-1 px-2.5 py-1 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="inline-block mt-1 text-[10px] font-mono text-[#6B7280]">LOCKED</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. FRIENDS & SQUAD / LEADERBOARDS / CONTROLS HELP MODALS
 * ============================================================================ */
export const FriendsModal: React.FC<{
  save: MiniMilitiaSave;
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onClose: () => void;
}> = ({ save, onUpdateSave, onClose }) => {
  const [newName, setNewName] = useState('');

  const addFriend = () => {
    const clean = newName.trim();
    if (!clean) return;
    mmAudio.playPickup();
    onUpdateSave((prev) => ({
      ...prev,
      friends: [
        {
          id: `fr_${Date.now()}`,
          callsign: clean.slice(0, 14),
          clanTag: prev.clanTag || 'DA2',
          rankIndex: Math.floor(Math.random() * 14) + 2,
          online: true,
          inSquad: true
        },
        ...prev.friends
      ]
    }));
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
      <div className="w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <h2 className="text-base font-black uppercase text-[#F5A623]">👥 SQUAD & FRIENDS</h2>
          <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase">
            Close
          </button>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add friend callsign (e.g. Ghost99)..."
              className="flex-1 px-3 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white"
            />
            <button
              type="button"
              onClick={addFriend}
              className="px-4 py-1.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {save.friends.map((f) => {
              const rk = MM_RANKS[Math.min(MM_RANKS.length - 1, f.rankIndex)] ?? MM_RANKS[0];
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#23272A] border border-[#3E4A2E]"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${f.online ? 'bg-[#22C55E]' : 'bg-[#6B7280]'}`} />
                    <RankInsigniaBadge rank={rk} size={20} />
                    <div>
                      <div className="text-xs font-bold">
                        [{f.clanTag}] {f.callsign}
                      </div>
                      <div className="text-[10px] font-mono text-[#C2B280]">{rk.title}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      mmAudio.playClick();
                      onUpdateSave((prev) => ({
                        ...prev,
                        friends: prev.friends.map((item) =>
                          item.id === f.id ? { ...item, inSquad: !item.inSquad } : item
                        )
                      }));
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-black uppercase ${
                      f.inSquad
                        ? 'bg-[#22C55E] text-[#0F172A]'
                        : 'bg-[#2A3320] border border-[#F5A623] text-[#F5A623]'
                    }`}
                  >
                    {f.inSquad ? '✓ In Squad' : 'Invite'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const LeaderboardsModal: React.FC<{ save: MiniMilitiaSave; onClose: () => void }> = ({ save, onClose }) => {
  const rows = useMemo(() => {
    const base = [
      { name: '[DA2] Sarge', rank: 20, kills: 4820, kd: 3.42, wave: 34, isYou: false },
      { name: '[PRO] SniperWolf', rank: 16, kills: 3190, kd: 2.88, wave: 26, isYou: false },
      { name: '[CAT] SawBlade', rank: 14, kills: 2450, kd: 2.31, wave: 22, isYou: false },
      { name: '[AIR] JetAce', rank: 12, kills: 1790, kd: 1.95, wave: 19, isYou: false },
      { name: '[OUT] CommandoX', rank: 9, kills: 920, kd: 1.54, wave: 14, isYou: false },
      {
        name: `${save.clanTag ? `[${save.clanTag}] ` : ''}${save.callsign}`,
        rank: getMmRankForXp(save.xp).current.index,
        kills: save.stats.kills,
        kd: save.stats.deaths > 0 ? Number((save.stats.kills / save.stats.deaths).toFixed(2)) : save.stats.kills,
        wave: save.stats.survivalBestWave,
        isYou: true
      }
    ];
    return base.sort((a, b) => b.kills - a.kills);
  }, [save]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
      <div className="w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <h2 className="text-base font-black uppercase text-[#F5A623]">🏆 GLOBAL DOODLE LEADERBOARD</h2>
          <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase">
            Close
          </button>
        </div>
        <div className="p-3 space-y-1.5">
          {rows.map((r, i) => (
            <div
              key={r.name}
              className={`flex items-center justify-between px-3 py-2 rounded border font-mono text-xs ${
                r.isYou ? 'border-[#F5A623] bg-[#364428]' : 'border-[#3E4A2E] bg-[#23272A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 text-[#F5A623] font-black">#{i + 1}</span>
                <RankInsigniaBadge rank={MM_RANKS[r.rank] ?? MM_RANKS[0]} size={20} />
                <span className="font-bold text-white">{r.name}</span>
              </div>
              <div className="flex items-center gap-4 tabular-nums text-[#C2B280]">
                <span>{r.kills} K</span>
                <span>{r.kd} K/D</span>
                <span>Wave {r.wave}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HelpControlsModal: React.FC<{ onClose: () => void; onStartBootCamp: () => void }> = ({
  onClose,
  onStartBootCamp
}) => (
  <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
    <div className="w-full max-w-2xl rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
        <h2 className="text-base font-black uppercase text-[#F5A623]">❓ TACTICAL FIELD MANUAL</h2>
        <button type="button" onClick={onClose} className="px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase">
          Close
        </button>
      </div>
      <div className="p-4 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
            <div className="font-black uppercase text-[#F5A623] mb-1.5">⌨️ DESKTOP CONTROLS</div>
            <ul className="space-y-1 font-mono text-[#D6D3C4]">
              <li>• A / D: Move Left & Right</li>
              <li>• W / Space: Rocket Boots Jetpack Flight</li>
              <li>• S: Crouch (Hides from Radar!) · Double-Tap S: Combat Roll</li>
              <li>• Mouse + Left Click: 360° Aim & Fire</li>
              <li>• Right Click / Z: Cycle Sniper & Weapon Zoom</li>
              <li>• Q / Wheel: Swap Weapon · R: Reload</li>
              <li>• F / V: Melee / Machete · G: Throw Grenade · C: Cycle Grenade</li>
              <li>• E: Swap Ground Loot · X: Dual Wield Pick-Up</li>
              <li>• Tab: Live Scoreboard · Esc: Pause</li>
            </ul>
          </div>
          <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
            <div className="font-black uppercase text-[#F5A623] mb-1.5">📱 DUAL-STICK TOUCH CONTROLS</div>
            <ul className="space-y-1 font-mono text-[#D6D3C4]">
              <li>• Left Stick: Move + Push Up to Ignite Rocket Boots</li>
              <li>• Right Stick: 360° Aim (Push past Fire Ring to Auto-Fire!)</li>
              <li>• Top-Center Weapon Box: Tap to Swap / View Dual-Wield</li>
              <li>• Contextual Loot Popup: Tap [SWAP] or [+ DUAL WIELD]</li>
              <li>• Switch to Separate Fire Button or move every button in Settings → Custom HUD Editor!</li>
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            onStartBootCamp();
          }}
          className="w-full py-2.5 rounded bg-[#F5A623] text-[#181C1F] font-black uppercase tracking-wider"
        >
          🎖️ Launch Sarge’s 7-Step Boot Camp Training
        </button>
      </div>
    </div>
  </div>
);

/* ============================================================================
 * 3. ONLINE ROOM BROWSER (Regional Filter + 8 Active Rooms + Quick Ranked)
 * ============================================================================ */
export const OnlineRoomBrowser: React.FC<{
  save: MiniMilitiaSave;
  onBack: () => void;
  onJoinRoom: (room: MmOnlineRoomListing) => void;
  onCreateCustom: () => void;
}> = ({ save, onBack, onJoinRoom, onCreateCustom }) => {
  const [region, setRegion] = useState<'All' | 'Asia' | 'Europe' | 'North America' | 'South America'>('All');
  const rooms =
    region === 'All'
      ? MM_SIMULATED_ONLINE_ROOMS
      : MM_SIMULATED_ONLINE_ROOMS.filter((r) => r.region === region);

  return (
    <div className="w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b-2 border-[#4F5D3B]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onBack();
            }}
            className="px-3 py-1 rounded bg-[#181C1F] border border-[#525D64] text-xs font-mono text-[#C2B280]"
          >
            ← Lobby
          </button>
          <div>
            <h2 className="text-base font-black uppercase text-[#F5A623]">🌐 PLAY ONLINE — SERVER BROWSER</h2>
            <p className="text-[11px] font-mono text-[#C2B280]">
              Playing as {save.clanTag ? `[${save.clanTag}] ` : ''}
              {save.callsign} · Select a regional tactical match
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onJoinRoom(rooms[0] ?? MM_SIMULATED_ONLINE_ROOMS[0]);
            }}
            className="px-3 py-1.5 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
          >
            ⚡ Quick Ranked
          </button>
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onCreateCustom();
            }}
            className="px-3 py-1.5 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-black uppercase"
          >
            + Host Custom Room
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-[#171C14] border-b border-[#3E4A2E]">
        {(['All', 'Asia', 'Europe', 'North America', 'South America'] as const).map((reg) => (
          <button
            key={reg}
            type="button"
            onClick={() => {
              mmAudio.playClick();
              setRegion(reg);
            }}
            className={`px-3 py-1 rounded text-xs font-mono border ${
              region === reg
                ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold'
                : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {rooms.map((rm) => {
          const map = getMmMapById(rm.mapId);
          return (
            <div
              key={rm.id}
              className="p-3 rounded bg-[#23272A] border-2 border-[#4F5D3B] hover:border-[#F5A623] flex items-center gap-3 transition"
            >
              <MapPreviewCanvas map={map} width={120} height={74} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-sm truncate">{rm.name}</div>
                  <span className="text-[11px] font-mono text-[#22C55E] tabular-nums">{rm.pingMs}ms</span>
                </div>
                <div className="text-[11px] font-mono text-[#C2B280] mt-0.5">
                  {map.name} · {rm.mode.toUpperCase()} · {rm.region}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F4F4EC] tabular-nums">
                    {rm.players}/{rm.maxPlayers} Players
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F5A623] uppercase">
                    {rm.classicV4 ? 'Classic V4' : 'Loadouts'}
                  </span>
                  {rm.ranked && (
                    <span className="px-1.5 py-0.5 rounded bg-[#2A3320] text-[#22C55E]">RANKED</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  onJoinRoom(rm);
                }}
                className="px-3 py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase shrink-0"
              >
                JOIN
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. CUSTOM / LAN ROOM CONFIGURATOR (20 Maps + 12-Slot Roster + Physics + Chat)
 * ============================================================================ */
export const CustomRoomLobby: React.FC<{
  save: MiniMilitiaSave;
  initialConfig?: Partial<MmMatchConfig>;
  onBack: () => void;
  onStartMatch: (config: MmMatchConfig) => void;
}> = ({ save, initialConfig, onBack, onStartMatch }) => {
  const playerAvatar = save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0];

  const [mapId, setMapId] = useState(initialConfig?.mapId ?? 'outpost');
  const [mode, setMode] = useState<MmModeId>(initialConfig?.mode ?? 'tdm');
  const [timeLimitSec, setTimeLimitSec] = useState(initialConfig?.timeLimitSec ?? 300);
  const [scoreLimit, setScoreLimit] = useState(initialConfig?.scoreLimit ?? 25);
  const [botDifficulty, setBotDifficulty] = useState<MmBotDifficulty>(initialConfig?.botDifficulty ?? 'normal');
  const [classicV4, setClassicV4] = useState(initialConfig?.classicV4 ?? save.settings.gameplay.classicV4Default);
  const [mapDrops, setMapDrops] = useState(initialConfig?.mapDrops ?? true);
  const [friendlyFire, setFriendlyFire] = useState(initialConfig?.friendlyFire ?? false);
  const [gravityMode, setGravityMode] = useState<'normal' | 'low' | 'heavy'>(initialConfig?.gravityMode ?? 'normal');
  const [nitroMode, setNitroMode] = useState<'1x' | '2x' | 'unlimited'>(initialConfig?.nitroMode ?? '1x');
  const [password, setPassword] = useState('');
  const [slots, setSlots] = useState<MmRoomBotSlot[]>(() => {
    if (initialConfig?.slots && initialConfig.slots.length > 0) return initialConfig.slots;
    const base: MmRoomBotSlot[] = [
      {
        id: 'player',
        name: save.callsign,
        team: save.preferredTeam === 'red' ? 'red' : 'blue',
        isPlayer: true,
        ready: true,
        avatar: playerAvatar
      }
    ];
    for (let i = 0; i < 5; i++) {
      const botName = MM_BOT_NAMES[(i + 1) % MM_BOT_NAMES.length];
      base.push({
        id: `bot_${i + 1}`,
        name: botName,
        team: i % 2 === 0 ? 'red' : 'blue',
        isPlayer: false,
        ready: true,
        avatar: makeRandomAvatar(botName)
      });
    }
    return base;
  });
  const [chatLog, setChatLog] = useState<{ sender: string; text: string }[]>([
    { sender: 'Sarge', text: 'Pick any of the 20 arenas, customize bots & hit START BATTLE!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const selectedMap = getMmMapById(mapId);

  const addBot = (team: 'blue' | 'red') => {
    if (slots.length >= 12) return;
    mmAudio.playClick();
    const used = new Set(slots.map((s) => s.name));
    const name = MM_BOT_NAMES.find((n) => !used.has(n)) ?? `Trooper_${slots.length + 1}`;
    setSlots((prev) => [
      ...prev,
      { id: `bot_${Date.now()}_${prev.length}`, name, team, isPlayer: false, ready: true, avatar: makeRandomAvatar(name) }
    ]);
  };

  const removeSlot = (id: string) => {
    mmAudio.playClick();
    setSlots((prev) => prev.filter((s) => s.isPlayer || s.id !== id));
  };

  const swapTeam = (id: string) => {
    mmAudio.playClick();
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, team: s.team === 'blue' ? 'red' : 'blue' } : s)));
  };

  const autoBalance = () => {
    mmAudio.playClick();
    setSlots((prev) =>
      prev.map((s, idx) => ({
        ...s,
        team: idx % 2 === 0 ? 'blue' : 'red'
      }))
    );
  };

  const sendChat = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    mmAudio.playClick();
    setChatLog((prev) => [...prev.slice(-14), { sender: save.callsign, text: clean }]);
    setChatInput('');
  };

  const handleLaunch = () => {
    mmAudio.playKillstreak();
    onStartMatch({
      mode,
      mapId,
      timeLimitSec,
      scoreLimit,
      botDifficulty,
      classicV4,
      mapDrops,
      friendlyFire,
      gravityMode,
      nitroMode,
      password,
      slots
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#23272A] border-b-2 border-[#4F5D3B]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onBack();
            }}
            className="px-3 py-1 rounded bg-[#181C1F] border border-[#525D64] text-xs font-mono text-[#C2B280]"
          >
            ← Lobby
          </button>
          <div>
            <h2 className="text-base font-black uppercase text-[#F5A623]">🛠️ CUSTOM / LAN TACTICAL ROOM</h2>
            <p className="text-[11px] font-mono text-[#C2B280]">
              20 Maps · {slots.length}/12 Combatants · {classicV4 ? 'Classic V4 Scavenge' : 'Loadout Rules'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLaunch}
          className="px-5 py-2 rounded bg-gradient-to-b from-[#F5A623] to-[#C97B10] text-[#141911] text-sm font-black uppercase tracking-wider shadow-lg"
        >
          ▶ START BATTLE
        </button>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto">
        {/* LEFT COLUMN: 20-Map Selector + Match Rules */}
        <section className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2">
            <div className="flex items-start gap-3">
              <MapPreviewCanvas map={selectedMap} width={190} height={104} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-[#F5A623] uppercase">{selectedMap.name}</div>
                <div className="text-[11px] font-mono text-[#C2B280]">{selectedMap.tagline}</div>
                <p className="text-[11px] text-[#D6D3C4] mt-1">{selectedMap.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5 text-[10px] font-mono uppercase">
                  <span className="px-1.5 py-0.5 rounded bg-[#181C1F] text-[#C2B280]">{selectedMap.biome}</span>
                  {selectedMap.gravityScale < 0.7 && (
                    <span className="px-1.5 py-0.5 rounded bg-[#1E3A8A] text-[#93C5FD]">LOW-G</span>
                  )}
                  {selectedMap.unlimitedJetpack && (
                    <span className="px-1.5 py-0.5 rounded bg-[#065F46] text-[#6EE7B7]">∞ JETPACK</span>
                  )}
                  {selectedMap.friction < 0.5 && (
                    <span className="px-1.5 py-0.5 rounded bg-[#155E75] text-[#67E8F9]">SLIPPERY ICE</span>
                  )}
                  {selectedMap.lethalAbyss && (
                    <span className="px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FCA5A5]">LETHAL ABYSS</span>
                  )}
                </div>
              </div>
            </div>

            {/* 20-Map Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 max-h-[146px] overflow-y-auto pt-1">
              {MM_MAPS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    setMapId(m.id);
                  }}
                  className={`px-1.5 py-1.5 rounded text-[10px] font-bold truncate border ${
                    mapId === m.id
                      ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                      : 'bg-[#181C1F] text-[#D6D3C4] border-[#3E4A2E] hover:border-[#C2B280]'
                  }`}
                  title={m.name}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Match Config Controls */}
          <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Game Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as MmModeId)}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value="tdm">Team Deathmatch</option>
                <option value="ffa">Free-For-All</option>
                <option value="ctf">Capture The Flag</option>
                <option value="ptb">Plant The Bomb</option>
                <option value="survival">Survival Waves</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Match Timer</label>
              <select
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value={180}>3:00</option>
                <option value={300}>5:00</option>
                <option value={480}>8:00</option>
                <option value={600}>10:00</option>
                <option value={900}>15:00</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Score Limit</label>
              <select
                value={scoreLimit}
                onChange={(e) => setScoreLimit(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value={15}>15 Kills / 3 Flags</option>
                <option value={25}>25 Kills / 5 Flags</option>
                <option value={40}>40 Kills</option>
                <option value={60}>60 Kills</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Bot AI Skill</label>
              <select
                value={botDifficulty}
                onChange={(e) => setBotDifficulty(e.target.value as MmBotDifficulty)}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="pro">Pro</option>
                <option value="insane">Insane</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Gravity</label>
              <select
                value={gravityMode}
                onChange={(e) => setGravityMode(e.target.value as 'normal' | 'low' | 'heavy')}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value="normal">Normal (Map Default)</option>
                <option value="low">Low-G (0.5x)</option>
                <option value="heavy">Heavy (1.35x)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-0.5">Jetpack Nitro</label>
              <select
                value={nitroMode}
                onChange={(e) => setNitroMode(e.target.value as '1x' | '2x' | 'unlimited')}
                className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
              >
                <option value="1x">1x Standard</option>
                <option value="2x">2x Turbo</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            <label className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer">
              <input
                type="checkbox"
                checked={classicV4}
                onChange={(e) => setClassicV4(e.target.checked)}
                className="accent-[#F5A623]"
              />
              <span className="text-[11px] font-bold">Classic V4 Mode</span>
            </label>
            <label className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer">
              <input
                type="checkbox"
                checked={mapDrops}
                onChange={(e) => setMapDrops(e.target.checked)}
                className="accent-[#F5A623]"
              />
              <span className="text-[11px] font-bold">Map Drops</span>
            </label>
            <label className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#181C1F] border border-[#3E4A2E] cursor-pointer">
              <input
                type="checkbox"
                checked={friendlyFire}
                onChange={(e) => setFriendlyFire(e.target.checked)}
                className="accent-[#F5A623]"
              />
              <span className="text-[11px] font-bold">Friendly Fire</span>
            </label>
            <div className="col-span-2 sm:col-span-3">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional LAN Room Password..."
                className="w-full px-2.5 py-1 rounded bg-[#181C1F] border border-[#3E4A2E] text-xs font-mono"
              />
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: 12-Slot Roster + Lobby Chat */}
        <section className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] flex-1 flex flex-col min-h-[210px]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="text-xs font-black uppercase text-[#C2B280]">
                SQUAD ROSTER ({slots.length}/12)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addBot('blue')}
                  className="px-2 py-1 rounded bg-[#1D4ED8] text-white text-[11px] font-bold"
                >
                  + Blue Bot
                </button>
                <button
                  type="button"
                  onClick={() => addBot('red')}
                  className="px-2 py-1 rounded bg-[#B91C1C] text-white text-[11px] font-bold"
                >
                  + Red Bot
                </button>
                <button
                  type="button"
                  onClick={autoBalance}
                  className="px-2 py-1 rounded bg-[#2A3320] border border-[#5D7045] text-[11px] font-mono text-[#F5A623]"
                >
                  Auto-Balance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 flex-1 overflow-y-auto">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded border ${
                    slot.team === 'blue'
                      ? 'border-[#2B82D9]/60 bg-[#172536]'
                      : 'border-[#D93829]/60 bg-[#321919]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AvatarPortraitBadge avatar={slot.avatar} size={28} />
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">
                        {slot.name} {slot.isPlayer ? '(YOU)' : ''}
                      </div>
                      <div className="text-[10px] font-mono uppercase opacity-80">
                        {mode === 'ffa' ? 'FREE-FOR-ALL' : `${slot.team} TEAM`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => swapTeam(slot.id)}
                      className="px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono hover:bg-black/70"
                      title="Swap Team"
                    >
                      ⇄
                    </button>
                    {!slot.isPlayer && (
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[10px] font-mono hover:bg-[#DC2626]"
                        title="Kick Bot"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lobby Chat + Quick Phrases */}
          <div className="p-2.5 rounded bg-[#23272A] border border-[#4F5D3B] space-y-1.5">
            <div className="h-[74px] overflow-y-auto bg-[#15181A] rounded p-2 space-y-0.5 text-[11px] font-mono">
              {chatLog.map((c, idx) => (
                <div key={idx}>
                  <span className="text-[#F5A623] font-bold">{c.sender}: </span>
                  <span className="text-[#E5E7EB]">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {MM_QUICK_CHATS.slice(0, 5).map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => sendChat(q.text)}
                  className="px-2 py-0.5 rounded bg-[#2A3320] hover:bg-[#3A492C] border border-[#4F5D3B] text-[10px] font-mono text-[#C2B280]"
                >
                  {q.text}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendChat(chatInput);
              }}
              className="flex gap-1.5"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Squad chat..."
                className="flex-1 px-2.5 py-1 rounded bg-[#181C1F] border border-[#4F5D3B] text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ============================================================================
 * 5. POST-MATCH SUMMARY & 15s 3-MAP VOTE SCREEN
 * ============================================================================ */
export const PostMatchSummaryView: React.FC<{
  summary: MmMatchSummary;
  save: MiniMilitiaSave;
  onPlayNextMap: (nextMapId: string) => void;
  onRematch: () => void;
  onReturnLobby: () => void;
}> = ({ summary, save, onPlayNextMap, onRematch, onReturnLobby }) => {
  const rankInfo = getMmRankForXp(save.xp);

  const voteChoices = useMemo(() => {
    const others = MM_MAPS.filter((m) => m.id !== summary.mapId);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [summary.mapId]);

  const [votedMapId, setVotedMapId] = useState<string>(voteChoices[0]?.id ?? 'outpost');
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#181E15] text-[#F4F4EC] overflow-y-auto p-3 sm:p-5">
      <div className="max-w-5xl w-full mx-auto space-y-3">
        {/* Victory / Defeat Header */}
        <div
          className={`p-4 rounded border-2 flex flex-wrap items-center justify-between gap-3 ${
            summary.victory
              ? 'border-[#F5A623] bg-gradient-to-r from-[#2D3B1E] to-[#1E251A]'
              : 'border-[#D93829] bg-gradient-to-r from-[#3B1D1D] to-[#1E1A1A]'
          }`}
        >
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#C2B280]">
              {summary.mapName} · {summary.mode.toUpperCase()}
            </div>
            <h2
              className={`text-2xl sm:text-3xl font-black uppercase tracking-wider ${
                summary.victory ? 'text-[#F5A623]' : 'text-[#F87171]'
              }`}
            >
              {summary.victory ? '🏆 VICTORY!' : '💀 DEFEAT'}
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono tabular-nums text-sm">
            {summary.mode !== 'survival' && summary.mode !== 'bootcamp' && (
              <div className="px-3 py-1.5 rounded bg-black/40 border border-[#4F5D3B]">
                <span className="text-[#38BDF8] font-black">BLUE {summary.scoreBlue}</span>
                <span className="mx-2 text-[#6B7280]">:</span>
                <span className="text-[#F87171] font-black">RED {summary.scoreRed}</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-[#F5A623] font-black">+{summary.xpEarned} XP</div>
              <div className="text-xs text-[#22C55E]">
                +🪙 {summary.coinsEarned} · +💵 {summary.cashEarned}
              </div>
            </div>
          </div>
        </div>

        {/* Rank Progress Strip */}
        <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] flex items-center gap-3">
          <RankInsigniaBadge rank={rankInfo.current} size={30} />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="font-bold text-white">{rankInfo.current.title}</span>
              <span className="text-[#C2B280] tabular-nums">
                {save.xp.toLocaleString()} XP {rankInfo.next ? `/ ${rankInfo.next.xpRequired.toLocaleString()}` : '(MAX)'}
              </span>
            </div>
            <div className="w-full h-2 bg-[#141719] rounded-sm overflow-hidden mt-1">
              <div className="h-full bg-[#F5A623]" style={{ width: `${rankInfo.progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
          <div className="text-xs font-black uppercase text-[#C2B280] mb-2">MATCH SCOREBOARD</div>
          <div className="overflow-x-auto">
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
                {summary.scoreboard.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-[#2D3338] ${row.isPlayer ? 'bg-[#364428]/70 font-bold' : ''}`}
                  >
                    <td className="py-1.5">
                      {row.isMvp ? '👑 ' : ''}
                      {row.name} {row.isPlayer ? '(YOU)' : ''}
                    </td>
                    <td className="py-1.5 uppercase">
                      <span
                        className={
                          row.team === 'blue'
                            ? 'text-[#38BDF8]'
                            : row.team === 'red'
                              ? 'text-[#F87171]'
                              : 'text-[#F5A623]'
                        }
                      >
                        {row.team}
                      </span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-[#22C55E]">{row.kills}</td>
                    <td className="py-1.5 text-right tabular-nums text-[#F87171]">{row.deaths}</td>
                    <td className="py-1.5 text-right tabular-nums">{row.assists}</td>
                    <td className="py-1.5 text-right tabular-nums text-[#9CA3AF]">{row.pingMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3-Map Next-Match Vote */}
        <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-[#F5A623]">
              🗺️ VOTE FOR NEXT ARENA ({countdown}s)
            </span>
            <span className="text-[11px] font-mono text-[#C2B280]">Click any map to cast vote</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {voteChoices.map((m) => {
              const selected = votedMapId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    setVotedMapId(m.id);
                  }}
                  className={`p-2 rounded border-2 text-left transition ${
                    selected ? 'border-[#F5A623] bg-[#334025]' : 'border-[#3E4A2E] bg-[#181C1F]'
                  }`}
                >
                  <MapPreviewCanvas map={m} width={220} height={92} className="w-full" />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-black">{m.name}</span>
                    {selected && <span className="text-[10px] font-mono text-[#F5A623]">✓ VOTED</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onReturnLobby();
            }}
            className="px-4 py-2 rounded bg-[#23272A] hover:bg-[#31383D] border border-[#525D64] text-xs font-black uppercase"
          >
            Return to Lobby
          </button>
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              onRematch();
            }}
            className="px-4 py-2 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#5D7045] text-xs font-black uppercase"
          >
            ↻ Rematch ({summary.mapName})
          </button>
          <button
            type="button"
            onClick={() => {
              mmAudio.playKillstreak();
              onPlayNextMap(votedMapId);
            }}
            className="px-5 py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase"
          >
            ▶ Deploy Next Map ({getMmMapById(votedMapId).name})
          </button>
        </div>
      </div>
    </div>
  );
};
