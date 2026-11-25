import React, { useState } from 'react';
import { MiniMilitiaSave } from '../types';
import { getMmRankForXp, MM_ACHIEVEMENTS } from '../data/progression';
import { getMmWeaponById, MM_PREBUILT_LOADOUTS } from '../data/weapons';
import { mmAudio } from '../engine/AudioEngine';
import {
  AvatarPortraitBadge,
  LobbySoldierShowcase,
  RankInsigniaBadge,
  WeaponVectorIcon
} from './AvatarPreviewCanvas';

export type LobbyModalId =
  | null
  | 'avatar'
  | 'armory'
  | 'store'
  | 'friends'
  | 'profile'
  | 'achievements'
  | 'leaderboards'
  | 'help'
  | 'settings';

interface MainLobbyProps {
  save: MiniMilitiaSave;
  onExitToArcade: () => void;
  onQuickPlay: () => void;
  onOpenOnlineBrowser: () => void;
  onOpenCustomRoom: () => void;
  onStartBootCamp: () => void;
  onStartSurvival: (coopAllies: number) => void;
  onOpenModal: (modal: LobbyModalId) => void;
  onToggleMute: () => void;
  onCycleTeamPref: () => void;
  onToggleClassicV4: () => void;
}

export const MainLobby: React.FC<MainLobbyProps> = ({
  save,
  onExitToArcade,
  onQuickPlay,
  onOpenOnlineBrowser,
  onOpenCustomRoom,
  onStartBootCamp,
  onStartSurvival,
  onOpenModal,
  onToggleMute,
  onCycleTeamPref,
  onToggleClassicV4
}) => {
  const [soloExpanded, setSoloExpanded] = useState(false);

  const rankInfo = getMmRankForXp(save.xp);
  const avatar = save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0];
  const allLoadouts = [...MM_PREBUILT_LOADOUTS, ...save.customLoadouts];
  const activeLoadout = allLoadouts.find((l) => l.id === save.activeLoadoutId) ?? allLoadouts[0];
  const primaryWeapon = getMmWeaponById(activeLoadout.primaryId);
  const secondaryWeapon = getMmWeaponById(activeLoadout.secondaryId);

  const claimableAchievements = MM_ACHIEVEMENTS.filter(
    (a) => !save.claimedAchievements.includes(a.id) && a.getProgress(save) >= a.target
  ).length;

  const click = (fn: () => void) => {
    mmAudio.playClick();
    fn();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#1B2216] text-[#F4F4EC] overflow-hidden select-none">
      {/* Subtle tactical blueprint grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'linear-gradient(to right, #6B7B54 1px, transparent 1px), linear-gradient(to bottom, #6B7B54 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* ==================== TOP BAR ==================== */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#23272A]/95 border-b-2 border-[#4F5D3B] shadow-lg">
        {/* Top-Left: Profile Card + Rank Insignia + XP Bar */}
        <button
          type="button"
          onClick={() => click(() => onOpenModal('profile'))}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded bg-[#2A3320] hover:bg-[#354028] border border-[#5C6E45] transition text-left"
        >
          <AvatarPortraitBadge avatar={avatar} size={42} />
          <div className="min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <RankInsigniaBadge rank={rankInfo.current} size={20} />
              <span className="font-bold text-sm tracking-wide text-[#F4F4EC] truncate max-w-[130px]">
                {save.clanTag ? `[${save.clanTag}] ` : ''}
                {save.callsign}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-[#C2B280] mt-0.5">
              <span>{rankInfo.current.title}</span>
              <span className="tabular-nums">{save.xp.toLocaleString()} XP</span>
            </div>
            <div className="w-full h-1.5 bg-[#15181A] rounded-sm overflow-hidden mt-0.5 border border-[#3E4A2E]">
              <div
                className="h-full bg-[#F5A623] transition-all"
                style={{ width: `${rankInfo.progressPct}%` }}
              />
            </div>
          </div>
        </button>

        {/* Top-Center: Stencil Military Crest + Arcade Return */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => click(onExitToArcade)}
            className="px-2.5 py-1.5 rounded bg-[#1A1E21] hover:bg-[#31383D] border border-[#525D64] text-xs font-mono uppercase tracking-wider text-[#C2B280] hover:text-white transition"
          >
            ← Arcade
          </button>
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.26em] text-[#C2B280] leading-none">
              DOODLE ARMY 2
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-wider uppercase text-[#F5A623] drop-shadow-[0_2px_0_#141911] leading-tight">
              MINI MILITIA
            </h1>
          </div>
          {save.proPackUnlocked && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded bg-[#F5A623] text-[#181C1F] text-[10px] font-black uppercase tracking-wider">
              PRO PACK
            </span>
          )}
        </div>

        {/* Top-Right: Coins, Cash & Utility Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => click(() => onOpenModal('store'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181C1F] border border-[#F5A623]/60 text-xs font-mono font-bold tabular-nums hover:border-[#F5A623]"
            title="Battle Coins (Loadouts & Respawn Kits)"
          >
            <span className="text-[#F5A623]">🪙</span>
            <span>{save.coins.toLocaleString()}</span>
          </button>
          <button
            type="button"
            onClick={() => click(() => onOpenModal('store'))}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#181C1F] border border-[#22C55E]/60 text-xs font-mono font-bold tabular-nums hover:border-[#22C55E]"
            title="Military Cash (Cosmetics, Weapons & Pro Pack)"
          >
            <span className="text-[#22C55E]">💵</span>
            <span>{save.cash.toLocaleString()}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm"
            title={save.settings.audio.muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {save.settings.audio.muted ? '🔇' : '🔊'}
          </button>
          <button
            type="button"
            onClick={() => click(() => onOpenModal('leaderboards'))}
            className="w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm"
            title="Leaderboards"
          >
            🏆
          </button>
          <button
            type="button"
            onClick={() => click(() => onOpenModal('help'))}
            className="w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#525D64] flex items-center justify-center text-sm"
            title="Controls & Boot Camp Guide"
          >
            ❓
          </button>
          <button
            type="button"
            onClick={() => click(() => onOpenModal('settings'))}
            className="w-8 h-8 rounded bg-[#2B3236] hover:bg-[#3A4348] border border-[#F5A623]/70 flex items-center justify-center text-sm"
            title="Settings & Custom HUD Editor"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ==================== CENTER WORKSPACE ==================== */}
      <main className="relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-y-auto">
        {/* Center-Left (7 cols): Live Interactive Outpost Soldier Showcase + Active Loadout Bar */}
        <section className="lg:col-span-7 flex flex-col gap-2.5 min-h-[260px]">
          <div className="flex-1 min-h-[220px]">
            <LobbySoldierShowcase
              avatar={avatar}
              weaponId={activeLoadout.primaryId}
              offhandWeaponId={activeLoadout.dualWieldStart ? activeLoadout.secondaryId : null}
              team={save.preferredTeam === 'red' ? 'red' : 'blue'}
              callsign={save.callsign}
              clanTag={save.clanTag}
            />
          </div>

          {/* Active Kit & Ruleset Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => click(() => onOpenModal('armory'))}
              className="sm:col-span-2 flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#23272A] hover:bg-[#2C3236] border-2 border-[#4F5D3B] text-left transition"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#C2B280]">
                  ACTIVE LOADOUT · TAP TO EDIT
                </div>
                <div className="font-bold text-sm text-[#F4F4EC]">{activeLoadout.name}</div>
                <div className="text-[11px] text-[#A8B498] font-mono">
                  {primaryWeapon.shortName} + {secondaryWeapon.shortName}
                  {activeLoadout.dualWieldStart ? ' (Dual Wield)' : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#181C1F] px-2 py-1 rounded border border-[#3E4A2E]">
                <WeaponVectorIcon weaponId={activeLoadout.primaryId} width={72} height={28} />
              </div>
            </button>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => click(onCycleTeamPref)}
                className="flex-1 px-2.5 py-1.5 rounded bg-[#23272A] hover:bg-[#2F353A] border border-[#4F5D3B] text-xs font-mono flex items-center justify-between"
              >
                <span className="text-[#C2B280]">TEAM:</span>
                <span
                  className={
                    save.preferredTeam === 'blue'
                      ? 'text-[#38BDF8] font-bold uppercase'
                      : save.preferredTeam === 'red'
                        ? 'text-[#F87171] font-bold uppercase'
                        : 'text-[#F5A623] font-bold uppercase'
                  }
                >
                  {save.preferredTeam}
                </span>
              </button>
              <button
                type="button"
                onClick={() => click(onToggleClassicV4)}
                className="flex-1 px-2.5 py-1.5 rounded bg-[#23272A] hover:bg-[#2F353A] border border-[#4F5D3B] text-xs font-mono flex items-center justify-between"
                title="Toggle Classic V4 (Pistol/Machete map-scavenge spawns) vs Modern Loadouts"
              >
                <span className="text-[#C2B280]">RULES:</span>
                <span className={save.settings.gameplay.classicV4Default ? 'text-[#22C55E] font-bold' : 'text-[#F5A623] font-bold'}>
                  {save.settings.gameplay.classicV4Default ? 'CLASSIC V4' : 'LOADOUTS'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Center-Right (5 cols): 4 Riveted Military Play Buttons */}
        <section className="lg:col-span-5 flex flex-col justify-center gap-2.5">
          {/* 1. QUICK PLAY / BATTLE */}
          <button
            type="button"
            onClick={() => click(onQuickPlay)}
            className="relative group w-full px-4 py-3.5 rounded bg-[#F5A623] bg-gradient-to-b from-[#F5A623] to-[#C97B10] hover:from-[#FBB940] hover:to-[#DC8814] border-2 border-[#FEF08A]/70 text-[#141911] shadow-lg transition active:translate-y-0.5 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black uppercase tracking-wider leading-tight">
                  ⚡ QUICK PLAY / BATTLE
                </div>
                <div className="text-xs font-bold opacity-85">
                  Instant 3v3 TDM on Outpost · Zero Wait
                </div>
              </div>
              <span className="text-2xl font-black group-hover:translate-x-1 transition">▶</span>
            </div>
          </button>

          {/* 2. PLAY ONLINE */}
          <button
            type="button"
            onClick={() => click(onOpenOnlineBrowser)}
            className="w-full px-4 py-3 rounded bg-[#2A3320] hover:bg-[#364329] border-2 border-[#5D7045] hover:border-[#F5A623] transition text-left shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-black uppercase tracking-wider text-[#F4F4EC]">
                  🌐 PLAY ONLINE
                </div>
                <div className="text-xs text-[#C2B280] font-mono">
                  Regional Servers · Ranked TDM, FFA, CTF & PTB
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#22C55E]/60 text-[#22C55E]">
                8 ROOMS
              </span>
            </div>
          </button>

          {/* 3. CUSTOM / LAN ROOM */}
          <button
            type="button"
            onClick={() => click(onOpenCustomRoom)}
            className="w-full px-4 py-3 rounded bg-[#23272A] hover:bg-[#2E3438] border-2 border-[#4F5D3B] hover:border-[#F5A623] transition text-left shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-black uppercase tracking-wider text-[#F4F4EC]">
                  🛠️ CUSTOM / LAN ROOM
                </div>
                <div className="text-xs text-[#C2B280] font-mono">
                  All 20 Maps · Up to 12 Bots · Gravity, Nitro & V4 Rules
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#C2B280]/40 text-[#C2B280]">
                20 MAPS
              </span>
            </div>
          </button>

          {/* 4. SOLO PLAY (Expands into Training Boot Camp, Survival, Co-Op Survival) */}
          <div className="rounded border-2 border-[#4F5D3B] bg-[#23272A] overflow-hidden shadow">
            <button
              type="button"
              onClick={() => click(() => setSoloExpanded((v) => !v))}
              className="w-full px-4 py-3 hover:bg-[#2E3438] transition text-left flex items-center justify-between"
            >
              <div>
                <div className="text-base font-black uppercase tracking-wider text-[#F4F4EC]">
                  🪖 SOLO PLAY & SARGE
                </div>
                <div className="text-xs text-[#C2B280] font-mono">
                  7-Step Boot Camp · Endless Survival · Co-Op Waves
                </div>
              </div>
              <span className="text-sm font-mono text-[#F5A623]">{soloExpanded ? '▲' : '▼'}</span>
            </button>

            {soloExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-2 bg-[#1A1F18] border-t border-[#3E4A2E]">
                <button
                  type="button"
                  onClick={() => click(onStartBootCamp)}
                  className="px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left"
                >
                  <div className="text-xs font-black text-[#F5A623] uppercase">🎖️ Boot Camp</div>
                  <div className="text-[10px] text-[#C2B280]">Sarge 7-Step Drill</div>
                </button>
                <button
                  type="button"
                  onClick={() => click(() => onStartSurvival(0))}
                  className="px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left"
                >
                  <div className="text-xs font-black text-[#F4F4EC] uppercase">🛡️ Survival</div>
                  <div className="text-[10px] text-[#C2B280]">You + Sarge vs Waves</div>
                </button>
                <button
                  type="button"
                  onClick={() => click(() => onStartSurvival(2))}
                  className="px-2.5 py-2 rounded bg-[#2A3320] hover:bg-[#3B4A2D] border border-[#5D7045] text-left"
                >
                  <div className="text-xs font-black text-[#38BDF8] uppercase">🤝 Co-Op</div>
                  <div className="text-[10px] text-[#C2B280]">3-Man Squad + Sarge</div>
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ==================== BOTTOM DOCK (6 Riveted Buttons) ==================== */}
      <footer className="relative z-10 grid grid-cols-3 sm:grid-cols-6 gap-1.5 px-3 py-2 bg-[#1B2023]/95 border-t-2 border-[#4F5D3B]">
        {[
          { id: 'avatar' as const, icon: '🪖', label: 'Avatar' },
          { id: 'armory' as const, icon: '🔫', label: 'Armory' },
          { id: 'store' as const, icon: '🛒', label: 'Store' },
          { id: 'friends' as const, icon: '👥', label: 'Friends' },
          { id: 'profile' as const, icon: '📊', label: 'Stats' },
          { id: 'achievements' as const, icon: '🏅', label: 'Medals', badge: claimableAchievements }
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => click(() => onOpenModal(item.id))}
            className="relative flex items-center justify-center gap-1.5 py-2 px-2 rounded bg-[#2A3320] hover:bg-[#3B492D] border border-[#556640] hover:border-[#F5A623] text-xs font-black uppercase tracking-wider text-[#F4F4EC] transition"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded bg-[#D93829] text-white text-[10px] font-mono font-bold tabular-nums shadow">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </footer>
    </div>
  );
};
