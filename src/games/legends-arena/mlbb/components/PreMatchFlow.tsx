import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MlbbLane,
  MlbbMapThemeId,
  MlbbMapVariantId,
  MlbbMatchLaunchConfig,
  MlbbModeId,
  MlbbProfileSave,
  MlbbRole
} from '../types';
import { MLBB_ALL_HEROES, MLBB_ICONIC_HEROES, getMlbbHeroById } from '../data/heroes';
import {
  MLBB_BATTLE_SPELLS,
  MLBB_EMBLEMS,
  MLBB_RANK_TIERS,
  MLBB_TALENTS,
  getMlbbBattleSpellById,
  getMlbbEmblemById
} from '../data/emblems';
import { MAP_THEMES, MAP_VARIANTS_2026, PRIMARY_2026_VARIANTS } from '../data/mapData';
import { getProBuildTemplatesForHero } from '../data/items';
import { HeroPortraitSvg, RankCrestSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

const LANES: MlbbLane[] = ['EXP', 'Jungle', 'Mid', 'Gold', 'Roam'];
const BOT_NAMES_BLUE = ['Zephyr', 'NovaWing', 'IronVanguard', 'MoonSage'];
const BOT_NAMES_RED = ['ShadowKain', 'VexanaPro', 'CrimsonFang', 'Aetheris', 'GrimBlade'];

export interface MlbbInvitedPartyMember {
  id: string;
  name: string;
  heroId: string;
  lane: MlbbLane;
  rankIdx: number;
  affinity: string;
  tag: string;
}

const INVITEABLE_ROSTER: MlbbInvitedPartyMember[] = [
  { id: 'inv1', name: 'KaguraMain', heroId: 'eudora', lane: 'Mid', rankIdx: 6, affinity: 'Partner Lv.6', tag: 'Friend' },
  { id: 'inv2', name: 'TigrealSet', heroId: 'tigreal', lane: 'Roam', rankIdx: 5, affinity: 'Bro Lv.4', tag: 'Squad' },
  { id: 'inv3', name: 'EstesHeal', heroId: 'estes', lane: 'Roam', rankIdx: 4, affinity: 'Bestie Lv.5', tag: 'Friend' },
  { id: 'inv4', name: 'LanceDash', heroId: 'lancelot', lane: 'Jungle', rankIdx: 7, affinity: 'Confidant Lv.3', tag: 'Squad' },
  { id: 'inv5', name: 'ZilongBot', heroId: 'zilong', lane: 'EXP', rankIdx: 5, affinity: 'AI Veteran', tag: 'Bot' },
  { id: 'inv6', name: 'LaylaBot', heroId: 'layla', lane: 'Gold', rankIdx: 4, affinity: 'AI Marksman', tag: 'Bot' }
];

function autoFillTeams(
  mode: MlbbModeId,
  playerName: string,
  playerHeroId: string,
  playerLane: MlbbLane,
  playerSpellId: MlbbMatchLaunchConfig['playerSpellId'],
  playerEmblemId: MlbbMatchLaunchConfig['playerEmblemId'],
  bannedIds: string[],
  invitedParty: MlbbInvitedPartyMember[] = []
): { blueTeam: MlbbMatchLaunchConfig['blueTeam']; redTeam: MlbbMatchLaunchConfig['redTeam'] } {
  const available = MLBB_ALL_HEROES.filter((h) => !bannedIds.includes(h.id));
  const used = new Set<string>([playerHeroId]);

  const pickForLane = (lane: MlbbLane, preferredHeroId?: string): string => {
    if (preferredHeroId && !used.has(preferredHeroId) && !bannedIds.includes(preferredHeroId)) {
      used.add(preferredHeroId);
      return preferredHeroId;
    }
    const laneCandidates = available.filter((h) => !used.has(h.id) && h.lane === lane);
    if (laneCandidates.length > 0) {
      const match = laneCandidates[Math.floor(Math.random() * laneCandidates.length)];
      used.add(match.id);
      return match.id;
    }
    const remaining = available.filter((h) => !used.has(h.id));
    const any = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : MLBB_ALL_HEROES[0];
    used.add(any.id);
    return any.id;
  };

  if (mode === 'practice') {
    const enemyHero = available.find((h) => h.id !== playerHeroId) ?? MLBB_ALL_HEROES[1];
    return {
      blueTeam: [
        { heroId: playerHeroId, lane: playerLane, name: playerName, isPlayer: true, spellId: playerSpellId, emblemId: playerEmblemId }
      ],
      redTeam: [
        { heroId: enemyHero.id, lane: 'Mid', name: 'Practice Bot', isPlayer: false, spellId: 'flicker', emblemId: 'common' }
      ]
    };
  }

  const remainingBlueLanes = LANES.filter((l) => l !== playerLane);
  const blueTeam: MlbbMatchLaunchConfig['blueTeam'] = [
    { heroId: playerHeroId, lane: playerLane, name: playerName, isPlayer: true, spellId: playerSpellId, emblemId: playerEmblemId },
    ...remainingBlueLanes.map((lane, i) => {
      const invited = invitedParty[i];
      const hid = pickForLane(lane, invited?.heroId);
      return {
        heroId: hid,
        lane,
        name: invited ? invited.name : BOT_NAMES_BLUE[i],
        isPlayer: false,
        spellId: lane === 'Jungle' ? ('retribution' as const) : lane === 'Gold' ? ('inspire' as const) : ('flicker' as const),
        emblemId: lane === 'Mid' ? ('mage' as const) : lane === 'Roam' ? ('tank' as const) : ('assassin' as const)
      };
    })
  ];

  if (mode !== 'ranked') used.clear();
  const redTeam: MlbbMatchLaunchConfig['redTeam'] = LANES.map((lane, i) => {
    const hid = pickForLane(lane);
    return {
      heroId: hid,
      lane,
      name: BOT_NAMES_RED[i],
      isPlayer: false,
      spellId: lane === 'Jungle' ? ('retribution' as const) : lane === 'EXP' ? ('vengeance' as const) : ('flicker' as const),
      emblemId: lane === 'Mid' ? ('mage' as const) : lane === 'Roam' ? ('tank' as const) : ('fighter' as const)
    };
  });

  return { blueTeam, redTeam };
}

/* ==================== 1. PRE-MATCH LOBBY + MATCH FOUND MODAL ==================== */

interface PreMatchRoomProps {
  mode: MlbbModeId;
  profile: MlbbProfileSave;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
  onBack: () => void;
  onProceedToDraft: (invitedParty: MlbbInvitedPartyMember[]) => void;
}

export const PreMatchRoom: React.FC<PreMatchRoomProps> = ({
  mode,
  profile,
  onUpdateProfile,
  onBack,
  onProceedToDraft
}) => {
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [partySlots, setPartySlots] = useState<(MlbbInvitedPartyMember | null)[]>(
    mode === 'practice' ? [null, null, null, null] : [INVITEABLE_ROSTER[0], INVITEABLE_ROSTER[1], null, null]
  );
  const [matchFoundOpen, setMatchFoundOpen] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState(30);
  const [readyFlags, setReadyFlags] = useState<boolean[]>(Array(10).fill(false));
  const [playerEntered, setPlayerEntered] = useState(false);

  const [partyChat, setPartyChat] = useState([
    { sender: 'System', text: `Entered ${mode.toUpperCase()} room. Invite teammates, pick lane & map variant.` }
  ]);
  const [chatText, setChatText] = useState('');

  // Match Found sequential ready ticks + 30s countdown + repeating heartbeat gong
  useEffect(() => {
    if (!matchFoundOpen) return;
    mlbbAudio.playMatchFoundGong();
    setMatchCountdown(30);
    setPlayerEntered(false);
    setReadyFlags(Array(10).fill(false));

    const readyTimers: number[] = [];
    // Slots 1..9 are AI/party players accepting sequentially
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((slotIdx, order) => {
      const delay = 420 + order * 340 + Math.floor(Math.random() * 180);
      const tid = window.setTimeout(() => {
        setReadyFlags((prev) => {
          const next = [...prev];
          next[slotIdx] = true;
          return next;
        });
        mlbbAudio.playPlayerReady();
      }, delay);
      readyTimers.push(tid);
    });

    const cdId = window.setInterval(() => {
      setMatchCountdown((sec) => {
        if (sec <= 1) {
          setMatchFoundOpen(false);
          return 0;
        }
        if (sec <= 6) mlbbAudio.playCountdownTick(true);
        return sec - 1;
      });
    }, 1000);

    return () => {
      readyTimers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(cdId);
    };
  }, [matchFoundOpen]);

  // Repeating dramatic heartbeat gong while awaiting player ENTER tap
  useEffect(() => {
    if (!matchFoundOpen || playerEntered) return;
    const hbId = window.setInterval(() => {
      mlbbAudio.playMatchFoundGong();
    }, 2200);
    return () => window.clearInterval(hbId);
  }, [matchFoundOpen, playerEntered]);

  // Proceed to Draft once all 10 players (including player slot 0) are ready!
  useEffect(() => {
    if (!matchFoundOpen || !playerEntered) return;
    if (readyFlags.every(Boolean)) {
      const activeParty = partySlots.filter((m): m is MlbbInvitedPartyMember => m !== null);
      const tid = window.setTimeout(() => {
        mlbbAudio.playHeroLockIn();
        onProceedToDraft(activeParty);
      }, 420);
      return () => window.clearTimeout(tid);
    }
  }, [matchFoundOpen, playerEntered, readyFlags, partySlots, onProceedToDraft]);

  const inviteMember = (member: typeof INVITEABLE_ROSTER[number]) => {
    if (mode === 'practice') return;
    if (partySlots.some((s) => s?.id === member.id)) return;
    const emptyIdx = partySlots.findIndex((s) => s === null);
    if (emptyIdx === -1) return;
    mlbbAudio.playPlayerReady();
    setPartySlots((prev) => {
      const next = [...prev];
      next[emptyIdx] = member;
      return next;
    });
    setPartyChat((prev) => [...prev, { sender: 'System', text: `${member.name} joined your party!` }]);
  };

  const removeSlot = (idx: number) => {
    mlbbAudio.playClick();
    setPartySlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const readyCount = readyFlags.filter(Boolean).length;

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#070E21] via-[#0F1E46] to-[#060B18] text-slate-100 flex flex-col p-3.5 overflow-hidden select-none">
      {/* Top Bar: Left (Back + Mode + Lane Pre-Selection) | Right (Mic/Speaker + Map Theme + 2026 Variant + Team Recruit) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6B84C]/35 pb-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onBack();
            }}
            className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-white cursor-pointer"
          >
            ← Lobby
          </button>
          <div>
            <div className="text-sm font-black text-[#FFE28A] uppercase tracking-wide flex items-center gap-2">
              <span>{mode.replace('_', ' ')} PRE-MATCH LOBBY</span>
              {mode === 'arcade' && profile.arcadeSubMode && (
                <span className="text-[10px] text-purple-300">· {profile.arcadeSubMode.toUpperCase()}</span>
              )}
              {mode === 'practice' && <span className="text-[10px] text-emerald-300">· PRACTICE MODE</span>}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-bold text-slate-400 mr-1">LANE:</span>
              {LANES.map((ln) => (
                <button
                  key={ln}
                  onClick={() => {
                    mlbbAudio.playClick();
                    onUpdateProfile((p) => ({
                      ...p,
                      selectedLane: ln,
                      selectedSpellId: ln === 'Jungle' ? 'retribution' : p.selectedSpellId
                    }));
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                    profile.selectedLane === ln ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {ln}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top-Right Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => {
              mlbbAudio.playClick();
              setMicOn((v) => !v);
            }}
            className={`h-8 px-2.5 rounded-lg border font-black cursor-pointer ${
              micOn ? 'bg-emerald-950/70 border-emerald-400/60 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Toggle Party Microphone"
          >
            {micOn ? '🎙️ Mic' : '🔇 Muted'}
          </button>
          <button
            onClick={() => {
              mlbbAudio.playClick();
              setSpeakerOn((v) => !v);
            }}
            className={`h-8 px-2.5 rounded-lg border font-black cursor-pointer ${
              speakerOn ? 'bg-sky-950/70 border-sky-400/60 text-sky-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Toggle Team Voice Audio"
          >
            {speakerOn ? '🔊 Voice' : '🔈 Off'}
          </button>

          <select
            value={profile.settings.controls.aiDifficulty ?? 'epic'}
            onChange={(e) => {
              mlbbAudio.playClick();
              onUpdateProfile((p) => ({
                ...p,
                settings: {
                  ...p.settings,
                  controls: {
                    ...p.settings.controls,
                    aiDifficulty: e.target.value as 'warrior' | 'epic' | 'mythic'
                  }
                }
              }));
            }}
            className="h-8 px-2 rounded-lg bg-slate-900 border border-sky-400/50 text-[11px] font-bold text-sky-200"
            title="Smart AI Bot Difficulty"
          >
            <option value="warrior">AI: Warrior</option>
            <option value="epic">AI: Epic</option>
            <option value="mythic">AI: Mythic</option>
          </select>

          <select
            value={profile.settings.basics.mapTheme}
            onChange={(e) =>
              onUpdateProfile((p) => ({
                ...p,
                settings: { ...p.settings, basics: { ...p.settings.basics, mapTheme: e.target.value as MlbbMapThemeId } }
              }))
            }
            className="h-8 px-2 rounded-lg bg-slate-900 border border-[#E6B84C]/45 text-[11px] font-bold text-white"
            title="Map Theme Selector"
          >
            {(Object.keys(MAP_THEMES) as MlbbMapThemeId[]).map((tid) => (
              <option key={tid} value={tid}>
                🗺️ {MAP_THEMES[tid].name}
              </option>
            ))}
          </select>

          <select
            value={profile.selectedMapVariant}
            onChange={(e) =>
              onUpdateProfile((p) => ({
                ...p,
                selectedMapVariant: e.target.value as MlbbMapVariantId | 'random'
              }))
            }
            className="h-8 px-2 rounded-lg bg-slate-900 border border-cyan-400/55 text-[11px] font-bold text-cyan-200"
            title="2026 Map Variant Selector"
          >
            <option value="random">🎲 Standard / Random 2026</option>
            {([...PRIMARY_2026_VARIANTS, 'revealing_wisps', 'healing_turtle', 'golden_turret'] as MlbbMapVariantId[]).map(
              (v) => (
                <option key={v} value={v}>
                  {MAP_VARIANTS_2026[v].icon} {MAP_VARIANTS_2026[v].name}
                </option>
              )
            )}
          </select>

          <button
            onClick={() => {
              mlbbAudio.playClaimFanfare();
              setPartyChat((prev) => [
                ...prev,
                {
                  sender: 'Recruit Broadcast',
                  text: `[${mode.toUpperCase()}] ${profile.name} is recruiting players! Tap + to join.`
                }
              ]);
            }}
            className="h-8 px-2.5 rounded-lg bg-amber-500/20 border border-[#E6B84C] text-[#FFE28A] text-[11px] font-black cursor-pointer"
          >
            📣 Recruit
          </button>
        </div>
      </div>

      {/* Main Middle Area: 5 Hero Pedestals (Center) + Right Sidebar Inviteable Friends/Squad/Bots */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 py-3 overflow-y-auto">
        {/* Center: 5 Hero Pedestals */}
        <div className="lg:col-span-9 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-5 gap-2.5 flex-1 items-stretch">
            {/* Slot 0: Player */}
            <div className="p-3 rounded-2xl bg-gradient-to-b from-[#1B3B6F]/85 to-[#0B132B]/95 border-2 border-[#E6B84C] flex flex-col items-center justify-between text-center shadow-xl">
              <div className="flex items-center gap-1 text-[10px] font-black text-[#FFE28A]">
                <RankCrestSvg tierIdx={profile.rankTierIdx} size={18} />
                <span>{MLBB_RANK_TIERS[profile.rankTierIdx]?.name}</span>
              </div>
              <div className="my-1">
                <HeroPortraitSvg heroId={profile.selectedHeroId} size={64} />
              </div>
              <div className="w-full">
                <div className="text-xs font-black text-white truncate">{profile.name}</div>
                <div className="text-[10px] text-amber-300 font-bold">{profile.selectedLane} Lane · Host</div>
                <div className="text-[10px] text-emerald-400 font-black mt-0.5">READY ✓</div>
              </div>
            </div>

            {/* Slots 1..4: Inviteable Party Pedestals */}
            {partySlots.map((member, idx) => (
              <div
                key={idx}
                className={`relative p-3 rounded-2xl border flex flex-col items-center justify-between text-center ${
                  member
                    ? 'bg-gradient-to-b from-[#13244D]/90 to-[#0B132B]/95 border-sky-400/50'
                    : 'bg-[#0B132B]/65 border-dashed border-slate-700'
                }`}
              >
                {member ? (
                  <>
                    <button
                      onClick={() => removeSlot(idx)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-slate-900/90 hover:bg-rose-600 text-[10px] font-black text-slate-300 hover:text-white cursor-pointer"
                      title="Remove from party"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-1 text-[10px] font-black text-cyan-300">
                      <RankCrestSvg tierIdx={member.rankIdx} size={16} />
                      <span className="truncate">{MLBB_RANK_TIERS[member.rankIdx]?.name}</span>
                    </div>
                    <HeroPortraitSvg heroId={member.heroId} size={58} />
                    <div className="w-full">
                      <div className="text-xs font-black text-white truncate">{member.name}</div>
                      <div className="text-[10px] text-pink-300 font-bold truncate">{member.affinity}</div>
                      <div className="text-[10px] text-emerald-400 font-black">{member.lane} · Ready ✓</div>
                    </div>
                  </>
                ) : (
                  <div className="my-auto space-y-1.5 text-slate-400">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                      {mode === 'practice' ? '🎯' : '+'}
                    </div>
                    <div className="text-[11px] font-bold">
                      {mode === 'practice' ? '1v1 Training' : 'Auto-Fill / Invite'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Strip: Party Chat (Left) + START GAME (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-7 p-3 rounded-2xl bg-[#0D1836] border border-slate-700">
              <div className="text-[10px] font-black text-[#FFE28A] mb-1">PARTY CHAT</div>
              <div className="space-y-1 max-h-20 overflow-y-auto text-[11px] mb-2">
                {partyChat.map((c, idx) => (
                  <div key={idx}>
                    <span className="font-bold text-amber-300">{c.sender}: </span>
                    <span className="text-slate-200">{c.text}</span>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatText.trim()) return;
                  mlbbAudio.playClick();
                  setPartyChat((prev) => [...prev, { sender: profile.name, text: chatText.trim() }]);
                  setChatText('');
                }}
                className="flex gap-1.5"
              >
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Say something to party..."
                  className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <button type="submit" className="px-3 py-1 rounded-lg bg-slate-700 text-xs font-black text-white cursor-pointer">
                  Send
                </button>
              </form>
            </div>

            <div className="md:col-span-5 flex flex-col items-end justify-end">
              <button
                onClick={() => {
                  mlbbAudio.playClick();
                  setMatchFoundOpen(true);
                }}
                className="w-full h-16 px-8 rounded-2xl bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C68618] border-2 border-[#FFE28A] text-slate-950 font-black text-lg tracking-wider shadow-2xl hover:brightness-110 cursor-pointer transition"
              >
                START GAME
              </button>
              <div className="text-[10px] text-slate-400 mt-1">
                {mode === 'ranked'
                  ? 'Strict MLBB 5-Ban Draft Pick · Match Found Ready Check'
                  : '10-Player Match Found Check → Hero Selection'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Inviteable Friends / Squad / Bot Teammates */}
        <aside className="lg:col-span-3 p-3 rounded-2xl bg-[#0D1836] border border-[#E6B84C]/35 flex flex-col min-h-0">
          <div className="text-xs font-black text-[#FFE28A] mb-2 uppercase">Invite Teammates</div>
          <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
            {INVITEABLE_ROSTER.map((m) => {
              const inParty = partySlots.some((s) => s?.id === m.id);
              return (
                <div
                  key={m.id}
                  className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <HeroPortraitSvg heroId={m.heroId} size={30} />
                    <div className="truncate">
                      <div className="text-xs font-black text-white truncate">{m.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {m.tag} · {m.lane} · {m.affinity}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={inParty || mode === 'practice' || !partySlots.includes(null)}
                    onClick={() => inviteMember(m)}
                    className={`w-7 h-7 rounded-lg font-black text-xs shrink-0 cursor-pointer ${
                      inParty
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#E6B84C] hover:brightness-110 text-slate-950 disabled:opacity-40'
                    }`}
                    title={inParty ? 'In Party' : 'Invite to Party'}
                  >
                    {inParty ? '✓' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ==================== MATCH FOUND MODAL (CIRCULAR 30s RING + 10 GLOWING CHECKMARKS) ==================== */}
      {matchFoundOpen && (() => {
        const ringCirc = 2 * Math.PI * 36;
        const ringDash = ringCirc * (matchCountdown / 30);
        return (
          <div className="fixed inset-0 z-50 bg-slate-950/88 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#162856] via-[#0F1E46] to-[#0B132B] border-2 border-[#E6B84C] p-6 text-center space-y-4 shadow-2xl mlbb-heartbeat">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="5" />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke={matchCountdown <= 6 ? '#EF4444' : '#FFE28A'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${ringDash} ${ringCirc}`}
                      style={{ transition: 'stroke-dasharray 0.9s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-[#FFE28A] mlbb-num leading-none">{matchCountdown}</span>
                    <span className="text-[9px] font-bold text-cyan-300 uppercase">SEC</span>
                  </div>
                </div>
                <div className="text-xs font-black tracking-[0.25em] text-cyan-300 uppercase">
                  {mode.toUpperCase()} · LAND OF DAWN
                </div>
                <div className="text-3xl font-black text-[#FFE28A] tracking-wider">MATCH FOUND!</div>
                <div className="text-xs text-slate-300 mlbb-num">
                  Players Ready: <span className="text-emerald-300 font-black">{readyCount} / 10</span>
                </div>
              </div>

              {/* 10 Glowing Ready Checkmarks (5 Blue + 5 Red) */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-black text-sky-300 uppercase tracking-widest">Blue Squad</div>
                <div className="flex items-center justify-center gap-2.5">
                  {readyFlags.slice(0, 5).map((r, i) => (
                    <div
                      key={i}
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-black transition ${
                        r
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(34,197,94,0.7)] scale-105'
                          : 'bg-slate-900 border-sky-500/45 text-slate-400'
                      }`}
                    >
                      {r ? '✓' : i === 0 ? 'YOU' : '•'}
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-black text-rose-300 uppercase tracking-widest pt-1">Red Squad</div>
                <div className="flex items-center justify-center gap-2.5">
                  {readyFlags.slice(5, 10).map((r, i) => (
                    <div
                      key={i + 5}
                      className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-black transition ${
                        r
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(34,197,94,0.7)] scale-105'
                          : 'bg-slate-900 border-rose-500/45 text-slate-400'
                      }`}
                    >
                      {r ? '✓' : '•'}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => {
                    mlbbAudio.playClick();
                    setMatchFoundOpen(false);
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-slate-300 cursor-pointer"
                >
                  Decline
                </button>
                <button
                  disabled={playerEntered}
                  onClick={() => {
                    mlbbAudio.playPlayerReady();
                    setPlayerEntered(true);
                    setReadyFlags((prev) => {
                      const next = [...prev];
                      next[0] = true;
                      return next;
                    });
                  }}
                  className={`px-12 py-3.5 rounded-2xl font-black text-base tracking-wider cursor-pointer transition mlbb-num ${
                    playerEntered
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88E20] text-slate-950 shadow-xl hover:brightness-110'
                  }`}
                >
                  {playerEntered ? `READY ✓ (${readyCount}/10)` : `ENTER (${matchCountdown}s)`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

/* ==================== 2. RANKED 5-BAN DRAFT PICK (STRICT TIMERS) & BLIND PICK ==================== */

interface DraftPickProps {
  mode: MlbbModeId;
  profile: MlbbProfileSave;
  invitedParty?: MlbbInvitedPartyMember[];
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
  onCancel: () => void;
  onConfirmMatch: (config: MlbbMatchLaunchConfig) => void;
}

export const DraftPickScreen: React.FC<DraftPickProps> = ({
  mode,
  profile,
  invitedParty = [],
  onUpdateProfile,
  onCancel,
  onConfirmMatch
}) => {
  const isRanked = mode === 'ranked';
  const [phase, setPhase] = useState<'ban' | 'pick' | 'adjustment'>(isRanked ? 'ban' : 'pick');
  const [timer, setTimer] = useState(isRanked ? 30 : 30);
  const [blueBans, setBlueBans] = useState<string[]>([]);
  const [redBans, setRedBans] = useState<string[]>([]);
  const [banCandidateId, setBanCandidateId] = useState<string>('fanny');
  const [playerBanDone, setPlayerBanDone] = useState(!isRanked);
  const [playerLocked, setPlayerLocked] = useState(false);

  const [selectedHeroId, setSelectedHeroId] = useState<string>(profile.selectedHeroId);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftRole, setDraftRole] = useState<MlbbRole | 'All'>('All');
  const [draftLane, setDraftLane] = useState<MlbbLane | 'All'>('All');
  const [splashFlash, setSplashFlash] = useState<{ label: string; heroId: string; tone: 'ban' | 'pick' } | null>(null);

  const [blueRoster, setBlueRoster] = useState<MlbbMatchLaunchConfig['blueTeam']>(() => {
    const remaining = LANES.filter((l) => l !== profile.selectedLane);
    return [
      {
        heroId: profile.selectedHeroId,
        lane: profile.selectedLane,
        name: profile.name,
        isPlayer: true,
        spellId: profile.selectedSpellId,
        emblemId: profile.selectedEmblemId
      },
      ...remaining.map((lane, i) => {
        const invited = invitedParty[i];
        return {
          heroId: '',
          lane,
          name: invited ? invited.name : BOT_NAMES_BLUE[i],
          isPlayer: false,
          spellId: lane === 'Jungle' ? ('retribution' as const) : lane === 'Gold' ? ('inspire' as const) : ('flicker' as const),
          emblemId: lane === 'Mid' ? ('mage' as const) : lane === 'Roam' ? ('tank' as const) : ('assassin' as const)
        };
      })
    ];
  });

  const [redRoster, setRedRoster] = useState<MlbbMatchLaunchConfig['redTeam']>(() =>
    LANES.map((lane, i) => ({
      heroId: '',
      lane,
      name: BOT_NAMES_RED[i],
      isPlayer: false,
      spellId: lane === 'Jungle' ? ('retribution' as const) : lane === 'EXP' ? ('vengeance' as const) : ('flicker' as const),
      emblemId: lane === 'Mid' ? ('mage' as const) : lane === 'Roam' ? ('tank' as const) : ('fighter' as const)
    }))
  );

  const [draftChat, setDraftChat] = useState<{ sender: string; text: string }[]>([
    {
      sender: 'Draft Room',
      text: isRanked
        ? '5-Ban Ranked Draft started. Ban priority threats first!'
        : `${mode.toUpperCase()} Selection started. Pick your champion & Quick Prep.`
    }
  ]);
  const [draftChatInput, setDraftChatInput] = useState('');
  const launchedRef = useRef(false);

  const allBanned = useMemo(() => [...blueBans, ...redBans], [blueBans, redBans]);
  const allPicked = useMemo(
    () =>
      [...blueRoster.map((b) => b.heroId), ...redRoster.map((r) => r.heroId)].filter(
        (id) => Boolean(id) && (isRanked || id !== selectedHeroId)
      ),
    [blueRoster, redRoster, isRanked, selectedHeroId]
  );

  const filteredDraftHeroes = useMemo(() => {
    const q = draftSearch.trim().toLowerCase();
    return MLBB_ALL_HEROES.filter((h) => {
      if (draftRole !== 'All' && h.role !== draftRole) return false;
      if (draftLane !== 'All' && h.lane !== draftLane) return false;
      if (q && !h.name.toLowerCase().includes(q) && !h.lane.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [draftSearch, draftRole, draftLane]);

  const triggerFlash = (label: string, heroId: string, tone: 'ban' | 'pick') => {
    setSplashFlash({ label, heroId, tone });
    window.setTimeout(() => setSplashFlash(null), 1250);
  };

  // Keep slot 0 synced with player selection/spell/emblem
  useEffect(() => {
    setBlueRoster((prev) =>
      prev.map((slot, i) =>
        i === 0
          ? {
              ...slot,
              heroId: selectedHeroId,
              spellId: profile.selectedSpellId,
              emblemId: profile.selectedEmblemId
            }
          : slot
      )
    );
  }, [selectedHeroId, profile.selectedSpellId, profile.selectedEmblemId]);

  // Progressive AI Bans in Ranked Ban Phase (fills up to 4 AI Blue Bans + 5 Red Bans)
  useEffect(() => {
    if (!isRanked || phase !== 'ban') return;
    const pool = ['fanny', 'ling', 'hayabusa', 'nolan', 'franco', 'nana', 'joy', 'zhuxin', 'tigreal', 'lancelot', 'valir', 'gusion'];
    const id = window.setInterval(() => {
      setBlueBans((prevB) => {
        if (prevB.length < 4) {
          const next = pool.find((h) => !prevB.includes(h) && !redBans.includes(h));
          if (next) {
            mlbbAudio.playBanSlam();
            return [...prevB, next];
          }
        }
        return prevB;
      });
      setRedBans((prevR) => {
        if (prevR.length < 5) {
          const next = pool.find((h) => !prevR.includes(h) && !blueBans.includes(h));
          if (next) return [...prevR, next];
        }
        return prevR;
      });
    }, 1700);
    return () => window.clearInterval(id);
  }, [isRanked, phase, blueBans, redBans]);

  // Move from Ban -> Pick automatically when all 5 Blue & 5 Red Bans are locked
  useEffect(() => {
    if (isRanked && phase === 'ban' && blueBans.length >= 5 && redBans.length >= 5) {
      const tid = window.setTimeout(() => {
        mlbbAudio.playSwoosh();
        setPhase('pick');
        setTimer(30);
        setDraftChat((c) => [...c, { sender: 'Draft Room', text: 'Ban Phase complete (5v5 Bans). Pick Phase begins!' }]);
      }, 650);
      return () => window.clearTimeout(tid);
    }
  }, [isRanked, phase, blueBans.length, redBans.length]);

  // Progressive AI Picks during Pick Phase
  useEffect(() => {
    if (phase !== 'pick') return;
    const id = window.setInterval(() => {
      const used = new Set<string>([
        ...blueBans,
        ...redBans,
        selectedHeroId,
        ...blueRoster.map((b) => b.heroId).filter(Boolean),
        ...redRoster.map((r) => r.heroId).filter(Boolean)
      ]);
      const pickAvailable = (lane: MlbbLane) => {
        const laneHit = MLBB_ALL_HEROES.find((h) => !used.has(h.id) && h.lane === lane);
        const picked = laneHit ?? MLBB_ALL_HEROES.find((h) => !used.has(h.id)) ?? MLBB_ALL_HEROES[0];
        used.add(picked.id);
        return picked.id;
      };

      setBlueRoster((prev) => {
        const emptyIdx = prev.findIndex((s, i) => i > 0 && !s.heroId);
        if (emptyIdx === -1) return prev;
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], heroId: pickAvailable(next[emptyIdx].lane) };
        return next;
      });

      setRedRoster((prev) => {
        const emptyIdx = prev.findIndex((s) => !s.heroId);
        if (emptyIdx === -1) return prev;
        const next = [...prev];
        next[emptyIdx] = { ...next[emptyIdx], heroId: pickAvailable(next[emptyIdx].lane) };
        return next;
      });
    }, 1450);
    return () => window.clearInterval(id);
  }, [phase, blueBans, redBans, selectedHeroId, blueRoster, redRoster]);

  // Advance from Pick -> Final Adjustment once Player locked & all 10 slots filled
  useEffect(() => {
    if (phase !== 'pick' || !playerLocked) return;
    const allBlueReady = blueRoster.every((b) => Boolean(b.heroId));
    const allRedReady = redRoster.every((r) => Boolean(r.heroId));
    if (allBlueReady && allRedReady) {
      const tid = window.setTimeout(() => {
        mlbbAudio.playSwoosh();
        setPhase('adjustment');
        setTimer(isRanked ? 20 : 8);
        setDraftChat((c) => [
          ...c,
          { sender: 'Draft Room', text: 'Final Adjustment! Swap heroes with allies or tune Emblem/Build.' }
        ]);
      }, 500);
      return () => window.clearTimeout(tid);
    }
  }, [phase, playerLocked, blueRoster, redRoster, isRanked]);

  const launchNow = () => {
    if (launchedRef.current) return;
    launchedRef.current = true;
    const variants: MlbbMapVariantId[] = [...PRIMARY_2026_VARIANTS];
    const mapVariant: MlbbMapVariantId =
      profile.selectedMapVariant === 'random'
        ? variants[Math.floor(Math.random() * variants.length)]
        : profile.selectedMapVariant;

    const fallbackTeams = autoFillTeams(
      mode,
      profile.name,
      selectedHeroId,
      profile.selectedLane,
      profile.selectedSpellId,
      profile.selectedEmblemId,
      allBanned,
      invitedParty
    );

    const finalBlue =
      mode === 'practice'
        ? fallbackTeams.blueTeam
        : blueRoster.map((slot, idx) => ({
            ...slot,
            heroId: slot.heroId || fallbackTeams.blueTeam[idx]?.heroId || 'miya'
          }));
    const finalRed =
      mode === 'practice'
        ? fallbackTeams.redTeam
        : redRoster.map((slot, idx) => ({
            ...slot,
            heroId: slot.heroId || fallbackTeams.redTeam[idx]?.heroId || 'zilong'
          }));

    const finalPlayerHeroId = finalBlue[0].heroId;
    const buildIdx = profile.activeBuildSlot[finalPlayerHeroId] ?? 0;
    const saved =
      profile.savedBuilds[finalPlayerHeroId]?.[buildIdx] ?? getMlbbHeroById(finalPlayerHeroId).recommendedBuild;

    onUpdateProfile((p) => ({ ...p, selectedHeroId: finalPlayerHeroId }));
    onConfirmMatch({
      mode,
      playerHeroId: finalPlayerHeroId,
      playerSkinId: profile.equippedSkins[finalPlayerHeroId] ?? getMlbbHeroById(finalPlayerHeroId).skins[0].id,
      playerLane: profile.selectedLane,
      playerSpellId: profile.selectedSpellId,
      playerEmblemId: profile.selectedEmblemId,
      playerTalents: profile.emblemTalents[profile.selectedEmblemId],
      playerBuild: saved,
      mapTheme: profile.settings.basics.mapTheme,
      mapVariant,
      customSubMode: profile.customSubMode,
      blueTeam: finalBlue,
      redTeam: finalRed
    });
  };

  // Strict MLBB Phase Countdown Timer (with Final 5s tick audio!)
  useEffect(() => {
    const id = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 6 && t > 1) {
          mlbbAudio.playCountdownTick(t <= 3);
        }
        if (t <= 1) {
          if (phase === 'ban') {
            setPhase('pick');
            return 30;
          }
          if (phase === 'pick') {
            setPlayerLocked(true);
            setPhase('adjustment');
            return isRanked ? 20 : 8;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, isRanked]);

  useEffect(() => {
    if (phase === 'adjustment' && timer === 0) {
      launchNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer]);

  const hero = getMlbbHeroById(selectedHeroId);
  const buildIdx = profile.activeBuildSlot[selectedHeroId] ?? 0;
  const activeTalents = profile.emblemTalents[profile.selectedEmblemId];
  const ownedHeroSkins = profile.ownedSkins[selectedHeroId] ?? ['default'];

  const handleBanHero = (hid: string) => {
    if (allBanned.includes(hid) || blueBans.length >= 5) return;
    mlbbAudio.playBanSlam();
    setBlueBans((prev) => [...prev, hid]);
    setPlayerBanDone(true);
    triggerFlash(`BANNED: ${getMlbbHeroById(hid).name.toUpperCase()}`, hid, 'ban');
    setDraftChat((c) => [...c, { sender: profile.name, text: `Banned ${getMlbbHeroById(hid).name}!` }]);
    if (selectedHeroId === hid) {
      const nextSafe = MLBB_ALL_HEROES.find((x) => !allBanned.includes(x.id) && x.id !== hid);
      if (nextSafe) setSelectedHeroId(nextSafe.id);
    }
  };

  const handleSwapWithAlly = (allyIndex: number) => {
    if (phase !== 'adjustment' || allyIndex === 0) return;
    const ally = blueRoster[allyIndex];
    if (!ally?.heroId) return;
    mlbbAudio.playHeroLockIn();
    const myHeroId = blueRoster[0].heroId;
    setBlueRoster((prev) => {
      const next = [...prev];
      next[0] = { ...next[0], heroId: ally.heroId };
      next[allyIndex] = { ...next[allyIndex], heroId: myHeroId };
      return next;
    });
    setSelectedHeroId(ally.heroId);
    setDraftChat((c) => [
      ...c,
      { sender: 'System', text: `Swapped heroes: ${profile.name} ↔ ${ally.name} (${getMlbbHeroById(ally.heroId).name})!` }
    ]);
  };

  return (
    <div className="relative w-full h-full mlbb-war-room-bg text-slate-100 flex flex-col p-2.5 overflow-hidden select-none">
      {/* Blue vs Red War-Room Animated Energy Pillars */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-sky-500/22 via-sky-400/8 to-transparent border-r border-sky-400/15" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-rose-500/22 via-rose-400/8 to-transparent border-l border-rose-400/15" />

      {/* Dramatic Hero Splash Reveal Flash on Ban/Pick */}
      {splashFlash && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 mlbb-splash-flash">
          <div
            className={`px-8 py-5 rounded-3xl border-2 flex items-center gap-4 shadow-2xl ${
              splashFlash.tone === 'ban'
                ? 'bg-rose-950/95 border-rose-400 text-rose-100'
                : 'bg-[#101E44]/95 border-[#FFE28A] text-[#FFE28A]'
            }`}
          >
            <HeroPortraitSvg heroId={splashFlash.heroId} size={74} />
            <div>
              <div className="text-xs font-black tracking-widest uppercase">
                {splashFlash.tone === 'ban' ? 'HERO BANNED' : 'CHAMPION LOCKED IN'}
              </div>
              <div className="text-2xl font-black text-white">{splashFlash.label}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TOP-CENTER: PHASE BANNER + TIMER + 5 BLUE BANS & 5 RED BANS ==================== */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-[#E6B84C]/35">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onCancel();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-black cursor-pointer"
          >
            ← Back
          </button>
          {/* 5 Blue Ban Slots */}
          {isRanked && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-sky-400 mr-1">BLUE BANS</span>
              {[0, 1, 2, 3, 4].map((idx) => {
                const bid = blueBans[idx];
                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden ${
                      bid ? 'bg-rose-950/80 border-rose-500/70' : 'bg-slate-900/90 border-sky-500/35'
                    }`}
                    title={bid ? `Banned: ${getMlbbHeroById(bid).name}` : 'Open Blue Ban Slot'}
                  >
                    {bid ? (
                      <div className="relative">
                        <HeroPortraitSvg heroId={bid} size={28} />
                        <span className="absolute inset-0 flex items-center justify-center text-rose-400 font-black text-sm">
                          ✕
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-500 font-black">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Center Phase Banner + Strict Countdown Timer */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs font-black text-[#FFE28A] tracking-wider uppercase">
              {phase === 'ban'
                ? 'BAN PHASE (5 PER SIDE)'
                : phase === 'pick'
                  ? 'PICK PHASE — LOCK YOUR HERO'
                  : 'FINAL ADJUSTMENT & SWAP'}
            </div>
            <div className="text-[10px] text-slate-300">
              {phase === 'ban'
                ? playerBanDone
                  ? 'Waiting for remaining bans...'
                  : 'Tap any hero tile to BAN'
                : phase === 'pick'
                  ? playerLocked
                    ? 'Allies & Enemies completing picks...'
                    : 'Choose your hero and click LOCK IN'
                  : 'Use ⇄ Swap arrows or tune Quick Prep'}
            </div>
          </div>
          <div
            className={`px-3.5 py-1 rounded-xl border-2 text-lg font-black mlbb-num ${
              timer <= 5
                ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                : 'bg-amber-500/20 border-[#E6B84C] text-[#FFE28A]'
            }`}
          >
            {timer}s
          </div>
        </div>

        {/* 5 Red Ban Slots */}
        {isRanked ? (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((idx) => {
              const bid = redBans[idx];
              return (
                <div
                  key={idx}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center overflow-hidden ${
                    bid ? 'bg-rose-950/80 border-rose-500/70' : 'bg-slate-900/90 border-rose-500/35'
                  }`}
                  title={bid ? `Banned: ${getMlbbHeroById(bid).name}` : 'Open Red Ban Slot'}
                >
                  {bid ? (
                    <div className="relative">
                      <HeroPortraitSvg heroId={bid} size={28} />
                      <span className="absolute inset-0 flex items-center justify-center text-rose-400 font-black text-sm">
                        ✕
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-500 font-black">{idx + 1}</span>
                  )}
                </div>
              );
            })}
            <span className="text-[10px] font-black text-rose-400 ml-1">RED BANS</span>
          </div>
        ) : (
          <div className="text-[11px] font-black text-sky-300 uppercase">{mode} Blind Pick</div>
        )}
      </div>

      {/* ==================== MIDDLE 3-COLUMN WAR ROOM: BLUE TEAM | CENTER GRID | RED TEAM ==================== */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-2.5 min-h-0 py-2">
        {/* LEFT COLUMN: Blue Team (5 Ally Slots + Swap Hero Arrows in Adjustment Phase) */}
        <div className="col-span-3 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-sky-300 uppercase">BLUE TEAM (ALLIES)</div>
          {blueRoster.map((slot, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl border flex items-center justify-between gap-2 ${
                i === 0
                  ? 'bg-sky-900/50 border-[#E6B84C]'
                  : 'bg-[#0E1938]/90 border-sky-500/35'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {slot.heroId ? (
                  <HeroPortraitSvg heroId={slot.heroId} size={36} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-sky-500/40 flex items-center justify-center text-xs text-slate-500">
                    ?
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate">
                    {slot.heroId ? getMlbbHeroById(slot.heroId).name : 'Picking...'}
                  </div>
                  <div className="text-[10px] text-sky-300 truncate">
                    {slot.name} · {slot.lane}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs" title={getMlbbBattleSpellById(slot.spellId).name}>
                  {getMlbbBattleSpellById(slot.spellId).icon}
                </span>
                {phase === 'adjustment' && i > 0 && slot.heroId && (
                  <button
                    onClick={() => handleSwapWithAlly(i)}
                    className="px-1.5 py-1 rounded bg-[#E6B84C] text-slate-950 text-[10px] font-black cursor-pointer"
                    title={`Swap hero with ${slot.name}`}
                  >
                    ⇄
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER COLUMN: Role/Lane Filters + Search + Hero Tiles + Lock-In Button */}
        <div className="col-span-6 flex flex-col min-h-0 gap-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder={`Search ${MLBB_ALL_HEROES.length} heroes...`}
              className="flex-1 min-w-[120px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
            />
            {(['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDraftRole(r)}
                className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                  draftRole === r ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400">LANE:</span>
            {(['All', ...LANES] as const).map((ln) => (
              <button
                key={ln}
                onClick={() => setDraftLane(ln)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  draftLane === ln ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-800/90 text-slate-300'
                }`}
              >
                {ln}
              </button>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-4 sm:grid-cols-5 gap-1.5 overflow-y-auto pr-1">
            {filteredDraftHeroes.map((h) => {
              const banned = allBanned.includes(h.id);
              const takenByOther = isRanked && allPicked.includes(h.id) && h.id !== selectedHeroId;
              const selected = phase === 'ban' ? banCandidateId === h.id : selectedHeroId === h.id;
              return (
                <button
                  key={h.id}
                  disabled={banned || takenByOther}
                  onClick={() => {
                    if (phase === 'ban') {
                      if (!playerBanDone) {
                        mlbbAudio.playClick();
                        setBanCandidateId(h.id);
                      }
                    } else if (!playerLocked) {
                      mlbbAudio.playClick();
                      setSelectedHeroId(h.id);
                    }
                  }}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer transition ${
                    banned || takenByOther
                      ? 'bg-slate-900/50 border-rose-900/50 opacity-35 cursor-not-allowed'
                      : selected
                        ? phase === 'ban'
                          ? 'bg-rose-500/25 border-rose-400 scale-[1.03]'
                          : 'bg-amber-500/20 border-[#FFE28A] scale-[1.03]'
                        : 'bg-[#0E1938] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <HeroPortraitSvg heroId={h.id} size={38} />
                  <div className="text-[10px] font-black text-white truncate max-w-full">{h.name}</div>
                  <div className="text-[9px] text-amber-300 truncate max-w-full">
                    {banned ? 'BANNED' : takenByOther ? 'PICKED' : h.lane}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Primary Draft Action Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                mlbbAudio.playClick();
                const st = profile.heroStats[selectedHeroId] ?? { matches: 14, wins: 10, mmr: 1620, mastery: 72 };
                const wr = Math.round((st.wins / Math.max(1, st.matches)) * 100);
                setDraftChat((c) => [
                  ...c,
                  {
                    sender: profile.name,
                    text: `Showing ${hero.name} (${st.matches} Matches · ${wr}% WR · ${st.mmr} MMR)!`
                  }
                ]);
              }}
              className="px-3 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-black cursor-pointer whitespace-nowrap"
            >
              📊 Show Hero / Winrate
            </button>

            {phase === 'ban' ? (
              playerBanDone ? (
                <div className="flex-1 py-2 px-3 rounded-xl bg-rose-950/75 border border-rose-400/60 text-center text-xs font-black text-rose-200">
                  Ban Locked · Waiting for remaining bans ({blueBans.length}/5 Blue · {redBans.length}/5 Red)...
                </div>
              ) : (
                <button
                  disabled={!banCandidateId || allBanned.includes(banCandidateId)}
                  onClick={() => handleBanHero(banCandidateId)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 border border-rose-300 text-white font-black text-xs tracking-wide cursor-pointer shadow-lg hover:brightness-110 disabled:opacity-45"
                >
                  🚫 BAN {getMlbbHeroById(banCandidateId).name.toUpperCase()}
                </button>
              )
            ) : phase === 'pick' ? (
              <button
                disabled={playerLocked || allBanned.includes(selectedHeroId)}
                onClick={() => {
                  mlbbAudio.playHeroLockIn();
                  setPlayerLocked(true);
                  triggerFlash(hero.name.toUpperCase(), hero.id, 'pick');
                  setDraftChat((c) => [...c, { sender: profile.name, text: `Locked in ${hero.name}!` }]);
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs tracking-wide cursor-pointer shadow-lg ${
                  playerLocked
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88E20] text-slate-950'
                }`}
              >
                {playerLocked ? `LOCKED IN: ${hero.name.toUpperCase()} ✓` : `LOCK IN ${hero.name.toUpperCase()}`}
              </button>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 border border-[#E6B84C] text-center text-xs font-black text-[#FFE28A] mlbb-num">
                  FINAL ADJUSTMENT ({timer}s)
                </div>
                <button
                  onClick={() => {
                    mlbbAudio.playHeroLockIn();
                    launchNow();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black cursor-pointer whitespace-nowrap shadow-lg"
                >
                  ⚔️ Launch Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Red Team (5 Enemy Slots) */}
        <div className="col-span-3 flex flex-col gap-1.5 overflow-y-auto">
          <div className="text-[10px] font-black text-rose-300 uppercase text-right">RED TEAM (ENEMIES)</div>
          {redRoster.map((slot, i) => (
            <div
              key={i}
              className="p-2 rounded-xl bg-[#241022]/85 border border-rose-500/40 flex items-center justify-between gap-2"
            >
              <span className="text-xs shrink-0" title={getMlbbBattleSpellById(slot.spellId).name}>
                {slot.heroId ? getMlbbBattleSpellById(slot.spellId).icon : '⏳'}
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <div className="min-w-0 text-right">
                  <div className="text-xs font-black text-white truncate">
                    {slot.heroId ? getMlbbHeroById(slot.heroId).name : 'Drafting...'}
                  </div>
                  <div className="text-[10px] text-rose-300 truncate">
                    {slot.name} · {slot.lane}
                  </div>
                </div>
                {slot.heroId ? (
                  <HeroPortraitSvg heroId={slot.heroId} size={36} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-rose-500/40 flex items-center justify-center text-xs text-slate-500">
                    ?
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== BOTTOM CONTROL STRIP: QUICK PREP BAR + DRAFT TEAM CHAT ==================== */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-2 pt-2 border-t border-[#E6B84C]/30 text-[11px]">
        {/* Quick Prep Bar: Preset 1/2/3, Emblem + 3 Talents, Battle Spell, Skin */}
        <div className="lg:col-span-8 p-2 rounded-xl bg-[#0D1836] border border-slate-700 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-black text-[#FFE28A]">BUILD:</span>
            {([0, 1, 2] as const).map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  mlbbAudio.playClick();
                  onUpdateProfile((p) => ({ ...p, activeBuildSlot: { ...p.activeBuildSlot, [selectedHeroId]: slot } }));
                }}
                className={`px-2 py-1 rounded text-[10px] font-black cursor-pointer ${
                  buildIdx === slot ? 'bg-[#E6B84C] text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                P{slot + 1}
              </button>
            ))}
            <select
              value=""
              onChange={(e) => {
                const tplId = e.target.value;
                const templates = getProBuildTemplatesForHero(hero);
                const chosen = templates.find((t) => t.id === tplId);
                if (!chosen) return;
                mlbbAudio.playClick();
                onUpdateProfile((p) => {
                  const prevSet = p.savedBuilds[selectedHeroId] ?? [
                    [...templates[0].items],
                    [...templates[1].items],
                    [...templates[2].items]
                  ];
                  const nextSet: [string[], string[], string[]] = [
                    [...prevSet[0]],
                    [...prevSet[1]],
                    [...prevSet[2]]
                  ];
                  nextSet[buildIdx] = [...chosen.items];
                  return { ...p, savedBuilds: { ...p.savedBuilds, [selectedHeroId]: nextSet } };
                });
              }}
              className="px-1.5 py-1 rounded bg-slate-900 border border-[#E6B84C]/50 text-[10px] font-bold text-amber-200 max-w-[106px]"
              title="Apply 1-Click Pro Build to active Preset"
            >
              <option value="">⭐ Pro Build...</option>
              {getProBuildTemplatesForHero(hero).map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={profile.selectedEmblemId}
            onChange={(e) =>
              onUpdateProfile((p) => ({ ...p, selectedEmblemId: e.target.value as MlbbProfileSave['selectedEmblemId'] }))
            }
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-white"
            title="Emblem Set"
          >
            {MLBB_EMBLEMS.map((em) => (
              <option key={em.id} value={em.id}>
                {em.icon} {em.name}
              </option>
            ))}
          </select>

          {/* 3 Talent Tier Quick Pickers */}
          {([1, 2, 3] as const).map((tier) => {
            const key = tier === 1 ? 't1' : tier === 2 ? 't2' : 't3';
            return (
              <select
                key={tier}
                value={activeTalents[key]}
                onChange={(e) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    emblemTalents: {
                      ...p.emblemTalents,
                      [p.selectedEmblemId]: { ...p.emblemTalents[p.selectedEmblemId], [key]: e.target.value }
                    }
                  }))
                }
                className="px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-amber-200 max-w-[106px]"
                title={`Tier ${tier} Talent`}
              >
                {MLBB_TALENTS.filter((tl) => tl.tier === tier).map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.icon} {tl.name}
                  </option>
                ))}
              </select>
            );
          })}

          <select
            value={profile.selectedSpellId}
            onChange={(e) =>
              onUpdateProfile((p) => ({ ...p, selectedSpellId: e.target.value as MlbbProfileSave['selectedSpellId'] }))
            }
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-cyan-200"
            title="Battle Spell"
          >
            {MLBB_BATTLE_SPELLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          <select
            value={profile.equippedSkins[selectedHeroId] ?? hero.skins[0].id}
            onChange={(e) =>
              onUpdateProfile((p) => ({
                ...p,
                equippedSkins: { ...p.equippedSkins, [selectedHeroId]: e.target.value }
              }))
            }
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-purple-200 max-w-[120px]"
            title="Skin Selector"
          >
            {hero.skins
              .filter((s) => s.id === 'default' || ownedHeroSkins.includes(s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  🎨 {s.name}
                </option>
              ))}
          </select>
        </div>

        {/* Draft Team Chat */}
        <div className="lg:col-span-4 p-2 rounded-xl bg-[#0D1836] border border-slate-700 flex flex-col justify-between gap-1">
          <div className="max-h-10 overflow-y-auto space-y-0.5 text-[10px]">
            {draftChat.slice(-3).map((c, idx) => (
              <div key={idx} className="truncate">
                <span className="font-black text-[#FFE28A]">{c.sender}: </span>
                <span className="text-slate-200">{c.text}</span>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draftChatInput.trim()) return;
              mlbbAudio.playClick();
              setDraftChat((prev) => [...prev, { sender: profile.name, text: draftChatInput.trim() }]);
              setDraftChatInput('');
            }}
            className="flex gap-1"
          >
            <input
              value={draftChatInput}
              onChange={(e) => setDraftChatInput(e.target.value)}
              placeholder="Draft team chat..."
              className="flex-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-white"
            />
            <button type="submit" className="px-2 py-0.5 rounded bg-slate-700 text-[10px] font-black text-white cursor-pointer">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ==================== 3. 10-PLAYER LOADING SCREEN (LIGHTNING FLARES + SHIMMERING RANK BORDERS) ==================== */

export const MatchLoadingScreen: React.FC<{
  config: MlbbMatchLaunchConfig;
  onReady: () => void;
}> = ({ config, onReady }) => {
  const [progress, setProgress] = useState(0);
  const [sparkCards, setSparkCards] = useState<Record<string, number>>({});
  const [goodLuckBurst, setGoodLuckBurst] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          window.clearInterval(id);
          window.setTimeout(onReady, 220);
          return 100;
        }
        return Math.min(100, p + 9 + Math.floor(Math.random() * 11));
      });
    }, 125);
    return () => window.clearInterval(id);
  }, [onReady]);

  const variant = MAP_VARIANTS_2026[config.mapVariant];

  const triggerSpark = (cardKey: string, playerName: string) => {
    mlbbAudio.playGold();
    setSparkCards((prev) => ({ ...prev, [cardKey]: (prev[cardKey] ?? 0) + 1 }));
    setGoodLuckBurst(`✨ Good Luck, ${playerName}!`);
    window.setTimeout(() => setGoodLuckBurst(null), 1200);
  };

  const renderCard = (
    m: MlbbMatchLaunchConfig['blueTeam'][number],
    idx: number,
    side: 'blue' | 'red'
  ) => {
    const key = `${side}_${idx}`;
    const sp = sparkCards[key] ?? 0;
    // Showcase all 10 MLBB Rank Tiers across the 10-player clash cards
    const rankIdx = (side === 'blue' ? 5 + idx : idx) % MLBB_RANK_TIERS.length;
    const tier = MLBB_RANK_TIERS[rankIdx];
    const hero = getMlbbHeroById(m.heroId);
    const equippedSkin = m.isPlayer ? hero.skins.find((s) => s.id === config.playerSkinId) ?? hero.skins[0] : hero.skins[0];
    const spell = getMlbbBattleSpellById(m.spellId);
    const emblem = getMlbbEmblemById(m.emblemId);
    const skinTag = equippedSkin?.tag ?? 'Classic';
    const pct = Math.min(100, progress + ((idx + (side === 'red' ? 2 : 0)) % 3) * 4);

    return (
      <button
        key={key}
        type="button"
        onClick={() => triggerSpark(key, m.name)}
        className="relative p-[2px] rounded-2xl mlbb-rank-shimmer cursor-pointer transition hover:scale-[1.03]"
        style={{
          backgroundImage: `linear-gradient(135deg, ${tier.color}, #FFE28A, ${tier.borderGlow})`
        }}
      >
        <div
          className={`relative h-full p-2.5 rounded-[14px] flex flex-col items-center justify-between gap-1 ${
            side === 'blue' ? 'bg-gradient-to-b from-[#0E1E44] to-[#081228]' : 'bg-gradient-to-b from-[#331126] to-[#170914]'
          }`}
        >
          {sp > 0 && (
            <span
              key={`${key}_${sp}`}
              className="pointer-events-none absolute -top-2 left-1/2 px-2 py-0.5 rounded-full bg-[#FFE28A] text-slate-950 text-[10px] font-black shadow-lg whitespace-nowrap mlbb-spark-pop"
            >
              ✨ Good Luck! x{sp}
            </span>
          )}
          <div className="w-full flex items-center justify-between text-[9px] font-black">
            <span style={{ color: tier.borderGlow }}>
              {tier.icon} {tier.name}
            </span>
            <span className="text-purple-200">{skinTag}</span>
          </div>
          <HeroPortraitSvg
            heroId={m.heroId}
            size={52}
            skinColor={equippedSkin?.color}
            skinAccent={equippedSkin?.accent}
          />
          <div className="text-xs font-black text-white truncate max-w-full">
            {hero.name}
            {m.isPlayer && equippedSkin && equippedSkin.id !== 'default' ? (
              <span className="text-[10px] text-[#FFE28A]"> · {equippedSkin.name}</span>
            ) : null}
          </div>
          <div className={`text-[10px] truncate max-w-full ${side === 'blue' ? 'text-sky-300' : 'text-rose-300'}`}>
            {m.name} · {m.lane}
          </div>
          <div className="w-full flex items-center justify-between text-[11px] px-1 pt-0.5 border-t border-slate-700/70">
            <span title={emblem.name}>{emblem.icon}</span>
            <span className="text-[10px] font-black text-emerald-400 mlbb-num">{pct}%</span>
            <span title={spell.name}>{spell.icon}</span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="relative w-full h-full bg-[#050A18] text-slate-100 flex flex-col justify-between p-4 overflow-hidden select-none">
      {/* Split 5v5 Clash Arena Backdrop & Animated Diagonal Lightning Flares */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-900/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-rose-900/28 to-transparent" />
      <svg
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-16 mlbb-lightning-flare"
        viewBox="0 0 1200 64"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="mlbbClashArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#FFE28A" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <polyline
          points="0,34 140,26 260,38 420,20 560,36 600,14 640,46 780,24 940,38 1080,26 1200,32"
          fill="none"
          stroke="url(#mlbbClashArc)"
          strokeWidth="3"
        />
      </svg>

      {/* Top Info Strip */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="text-sm font-black text-[#FFE28A]">
          {config.mode.toUpperCase()} · {MAP_THEMES[config.mapTheme].name}
        </div>
        <div className="text-xs font-bold text-cyan-300">
          {variant.icon} 2026 Variant: {variant.name}
        </div>
      </div>

      {/* Top Row: 5 Blue Cards */}
      <div className="relative z-10 grid grid-cols-5 gap-2.5">
        {config.blueTeam.map((m, i) => renderCard(m, i, 'blue'))}
      </div>

      {/* Center VS Clash Bar */}
      <div className="relative z-10 text-center py-1">
        <div className="text-2xl font-black text-[#FFE28A] tracking-[0.25em] drop-shadow">⚡ VS ⚡</div>
        <div className="text-xs text-slate-200 mt-0.5">
          {goodLuckBurst ? (
            <span className="font-black text-[#FFE28A]">{goodLuckBurst}</span>
          ) : (
            <span>Tip: {variant.desc} · Tap any card to spark &ldquo;Good Luck!&rdquo;</span>
          )}
        </div>
        <div className="max-w-md mx-auto h-2 mt-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-[#FFE28A] to-rose-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom Row: 5 Red Cards */}
      <div className="relative z-10 grid grid-cols-5 gap-2.5">
        {config.redTeam.map((m, i) => renderCard(m, i, 'red'))}
      </div>
    </div>
  );
};
