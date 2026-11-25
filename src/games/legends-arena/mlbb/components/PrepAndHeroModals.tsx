import React, { useMemo, useState } from 'react';
import { MlbbEmblemId, MlbbLane, MlbbProfileSave, MlbbRole } from '../types';
import { MLBB_ALL_HEROES, getMlbbHeroById } from '../data/heroes';
import { MLBB_ITEMS, getMlbbItemById, getProBuildTemplatesForHero } from '../data/items';
import {
  MLBB_BATTLE_EFFECTS,
  MLBB_BATTLE_SPELLS,
  MLBB_EMBLEMS,
  MLBB_EMOTES,
  MLBB_QUICK_CHAT_OPTIONS,
  MLBB_TALENTS,
  aggregateEmblemAndTalentPreviewStats
} from '../data/emblems';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

interface Props {
  mode: 'prep' | 'heroes';
  profile: MlbbProfileSave;
  onClose: () => void;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
}

export const PrepAndHeroModals: React.FC<Props> = ({ mode, profile, onClose, onUpdateProfile }) => {
  const [prepTab, setPrepTab] = useState<'emblems' | 'builds' | 'spells' | 'emotes' | 'quickchat' | 'effects'>('emblems');
  const [roleFilter, setRoleFilter] = useState<MlbbRole | 'All'>('All');
  const [laneFilter, setLaneFilter] = useState<MlbbLane | 'All'>('All');
  const [heroSearch, setHeroSearch] = useState('');
  const [buildHeroSearch, setBuildHeroSearch] = useState('');
  const [inspectHeroId, setInspectHeroId] = useState<string>(profile.selectedHeroId);
  const [buildHeroId, setBuildHeroId] = useState<string>(profile.selectedHeroId);
  const [buildSlotIdx, setBuildSlotIdx] = useState<0 | 1 | 2>(profile.activeBuildSlot[profile.selectedHeroId] ?? 0);
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [selectedEmoteSlot, setSelectedEmoteSlot] = useState<0 | 1 | 2 | 3>(0);

  const filteredGalleryHeroes = useMemo(() => {
    const q = heroSearch.trim().toLowerCase();
    return MLBB_ALL_HEROES.filter((h) => {
      if (roleFilter !== 'All' && h.role !== roleFilter) return false;
      if (laneFilter !== 'All' && h.lane !== laneFilter) return false;
      if (q && !h.name.toLowerCase().includes(q) && !h.title.toLowerCase().includes(q) && !h.specialty.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [heroSearch, roleFilter, laneFilter]);

  const filteredBuildHeroes = useMemo(() => {
    const q = buildHeroSearch.trim().toLowerCase();
    if (!q) return MLBB_ALL_HEROES;
    return MLBB_ALL_HEROES.filter((h) => h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q));
  }, [buildHeroSearch]);

  const inspectHero = getMlbbHeroById(inspectHeroId);
  const activeEmblemId = profile.selectedEmblemId;
  const activeTalents = profile.emblemTalents[activeEmblemId];
  const [buildItemFilter, setBuildItemFilter] = useState<'all' | 'movement' | 'attack' | 'magic' | 'defense'>('all');
  const buildHero = getMlbbHeroById(buildHeroId);
  const proTemplates = useMemo(() => getProBuildTemplatesForHero(buildHero), [buildHero]);
  const emblemPreviewStats = useMemo(
    () => aggregateEmblemAndTalentPreviewStats(activeEmblemId, activeTalents),
    [activeEmblemId, activeTalents]
  );

  const heroBuilds = profile.savedBuilds[buildHeroId] ?? [
    proTemplates[0].items,
    proTemplates[1].items,
    proTemplates[2].items
  ];
  const currentBuild = heroBuilds[buildSlotIdx] ?? buildHero.recommendedBuild;

  const selectableBuildItems = useMemo(
    () =>
      MLBB_ITEMS.filter((i) => {
        if (i.blessingKind || i.category === 'consumable' || i.category === 'unique') return false;
        const isBootOrT3 = i.tier === 3 || (i.category === 'movement' && i.tier === 2);
        if (!isBootOrT3) return false;
        if (buildItemFilter !== 'all' && i.category !== buildItemFilter) return false;
        return true;
      }),
    [buildItemFilter]
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/82 flex items-center justify-center p-3">
      <div className="w-full max-w-5xl max-h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#F5C451]/60 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#F5C451]/30">
          <div className="text-base font-black text-[#F5C451] uppercase tracking-wide">
            {mode === 'prep' ? 'Battle Preparation — Emblems, Builds, Spells & Emotes' : `Hero Gallery — All ${MLBB_ALL_HEROES.length} Champions (2026)`}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'prep' ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'emblems', label: 'Emblems & Talents' },
                    { id: 'builds', label: 'Equipment Builds' },
                    { id: 'spells', label: 'Battle Spells (12)' },
                    { id: 'emotes', label: 'Emote Wheel (4-Slot)' },
                    { id: 'quickchat', label: 'Quick Chat' },
                    { id: 'effects', label: 'Battle Effects' }
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      mlbbAudio.playClick();
                      setPrepTab(t.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer ${
                      prepTab === t.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* 1. EMBLEMS & 3-TIER TALENTS */}
              {prepTab === 'emblems' && (
                <div className="space-y-3">
                  {/* Live Combined Lv.60 Emblem + 3-Talent Stat Preview Strip */}
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-black text-[#F5C451] uppercase tracking-wide">
                        Active Lv. 60 Max Emblem Loadout — {MLBB_EMBLEMS.find((e) => e.id === activeEmblemId)?.name}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-bold text-emerald-300 mlbb-num">
                        {emblemPreviewStats.map((s) => (
                          <span key={s.label}>
                            {s.value} <span className="text-slate-300 font-semibold">{s.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-cyan-300 mlbb-num">
                      ALL 7 EMBLEMS UNLOCKED · LV. 60 MAX · {MLBB_TALENTS.length} TALENTS
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-black text-[#F5C451]">7 EMBLEM SETS (LV. 60 MAX)</div>
                      {MLBB_EMBLEMS.map((emb) => (
                        <button
                          key={emb.id}
                          onClick={() => {
                            mlbbAudio.playClick();
                            onUpdateProfile((p) => ({ ...p, selectedEmblemId: emb.id as MlbbEmblemId }));
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer ${
                            activeEmblemId === emb.id
                              ? 'bg-amber-500/20 border-[#F5C451]'
                              : 'bg-[#101C3D] border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <span className="text-xl">{emb.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-white">{emb.name}</span>
                              <span className="text-[9px] font-black text-amber-300 mlbb-num">LV.60</span>
                            </div>
                            <div className="text-[10px] text-slate-300">{emb.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      {([1, 2, 3] as const).map((tier) => {
                        const tierKey = tier === 1 ? 't1' : tier === 2 ? 't2' : 't3';
                        const tierTalents = MLBB_TALENTS.filter((t) => t.tier === tier);
                        return (
                          <div key={tier} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                            <div className="text-xs font-black text-[#F5C451] mb-2">
                              TIER {tier} {tier === 1 ? 'ATTRIBUTE' : tier === 2 ? 'UTILITY' : 'CORE KEYSTONE'} TALENT ({tierTalents.length})
                            </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {tierTalents.map((tal) => {
                              const selected = activeTalents[tierKey] === tal.id;
                              return (
                                <button
                                  key={tal.id}
                                  onClick={() => {
                                    mlbbAudio.playClick();
                                    onUpdateProfile((p) => ({
                                      ...p,
                                      emblemTalents: {
                                        ...p.emblemTalents,
                                        [activeEmblemId]: { ...p.emblemTalents[activeEmblemId], [tierKey]: tal.id }
                                      }
                                    }));
                                  }}
                                  className={`p-2 rounded-lg border text-left cursor-pointer ${
                                    selected ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-900/80 border-slate-700'
                                  }`}
                                >
                                  <div className="text-xs font-black text-white">
                                    {tal.icon} {tal.name}
                                  </div>
                                  <div className="text-[10px] text-slate-300 mt-0.5 leading-snug">{tal.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
              )}

              {/* 2. EQUIPMENT BUILDS (3 CUSTOM PRESETS PER HERO) */}
              {prepTab === 'builds' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={buildHeroSearch}
                      onChange={(e) => setBuildHeroSearch(e.target.value)}
                      placeholder={`Search all ${MLBB_ALL_HEROES.length} heroes for build...`}
                      className="flex-1 max-w-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <span className="text-[11px] font-bold text-amber-300">
                      Editing: {getMlbbHeroById(buildHeroId).name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {filteredBuildHeroes.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => {
                          setBuildHeroId(h.id);
                          setBuildSlotIdx(profile.activeBuildSlot[h.id] ?? 0);
                          setEditingItemIdx(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                          buildHeroId === h.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {h.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {([0, 1, 2] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setBuildSlotIdx(s);
                            onUpdateProfile((p) => ({ ...p, activeBuildSlot: { ...p.activeBuildSlot, [buildHeroId]: s } }));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                            buildSlotIdx === s ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Build Preset {s + 1}
                        </button>
                      ))}
                    </div>

                    {/* 1-Click Pro Build Templates */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-black text-amber-300 uppercase">1-Click Pro Builds:</span>
                      {proTemplates.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => {
                            mlbbAudio.playClick();
                            onUpdateProfile((p) => {
                              const prevSet = p.savedBuilds[buildHeroId] ?? [
                                [...proTemplates[0].items],
                                [...proTemplates[1].items],
                                [...proTemplates[2].items]
                              ];
                              const nextSet: [string[], string[], string[]] = [
                                [...prevSet[0]],
                                [...prevSet[1]],
                                [...prevSet[2]]
                              ];
                              nextSet[buildSlotIdx] = [...tpl.items];
                              return { ...p, savedBuilds: { ...p.savedBuilds, [buildHeroId]: nextSet } };
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-[#F5C451]/55 text-[10px] font-black text-amber-200 cursor-pointer"
                          title={`Load ${tpl.label} (${tpl.tag}) into Preset ${buildSlotIdx + 1}`}
                        >
                          ⭐ {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                      <span>Click any of the 6 slots below to swap Boots or Tier-3 equipment:</span>
                      <span className="text-[11px] text-amber-300 mlbb-num">
                        Total: {currentBuild.reduce((acc, id) => acc + (getMlbbItemById(id)?.cost ?? 0), 0).toLocaleString()}g
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {currentBuild.map((itemId, idx) => {
                        const it = getMlbbItemById(itemId);
                        return (
                          <button
                            key={idx}
                            onClick={() => setEditingItemIdx(idx)}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer ${
                              editingItemIdx === idx ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-slate-900 border-slate-700'
                            }`}
                          >
                            <div className="text-2xl">{it?.icon ?? '📦'}</div>
                            <div className="text-[11px] font-black text-white mt-1 truncate">{it?.shortName ?? itemId}</div>
                            <div className="text-[10px] text-amber-300 mlbb-num">{it?.cost ?? 0}g</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {editingItemIdx !== null && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-black text-[#F5C451]">
                          Pick Replacement Item for Slot #{editingItemIdx + 1}:
                        </div>
                        <div className="flex gap-1">
                          {(['all', 'movement', 'attack', 'magic', 'defense'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setBuildItemFilter(f)}
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase cursor-pointer ${
                                buildItemFilter === f ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {f === 'movement' ? 'Boots' : f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                        {selectableBuildItems.map((it) => (
                          <button
                            key={it.id}
                            onClick={() => {
                              onUpdateProfile((p) => {
                                const prevSet = p.savedBuilds[buildHeroId] ?? [
                                  [...currentBuild],
                                  [...currentBuild],
                                  [...currentBuild]
                                ];
                                const nextSet: [string[], string[], string[]] = [
                                  [...prevSet[0]],
                                  [...prevSet[1]],
                                  [...prevSet[2]]
                                ];
                                nextSet[buildSlotIdx][editingItemIdx] = it.id;
                                return { ...p, savedBuilds: { ...p.savedBuilds, [buildHeroId]: nextSet } };
                              });
                              setEditingItemIdx(null);
                              mlbbAudio.playClick();
                            }}
                            className="p-2 rounded-lg bg-[#101C3D] hover:border-[#F5C451] border border-slate-700 text-left cursor-pointer"
                          >
                            <div className="text-xs font-black text-white">{it.icon} {it.name}</div>
                            <div className="text-[10px] text-amber-300 mlbb-num">{it.cost}g · {it.category}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. BATTLE SPELLS */}
              {prepTab === 'spells' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MLBB_BATTLE_SPELLS.map((sp) => {
                    const selected = profile.selectedSpellId === sp.id;
                    return (
                      <button
                        key={sp.id}
                        onClick={() => {
                          mlbbAudio.playClick();
                          onUpdateProfile((p) => ({ ...p, selectedSpellId: sp.id }));
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer ${
                          selected ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-[#101C3D] border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-white">{sp.icon} {sp.name}</span>
                          <span className="text-[11px] font-bold text-cyan-300 mlbb-num">{sp.cooldown}s CD</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">{sp.desc}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. CUSTOMIZABLE 4-SLOT HERO EMOTE WHEEL */}
              {prepTab === 'emotes' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40">
                    <div className="text-xs font-black text-[#F5C451] mb-2">EQUIPPED 4-SLOT RADIAL EMOTE WHEEL (TAP SLOT TO ASSIGN)</div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {profile.equippedEmotes.map((emId, idx) => {
                        const em = MLBB_EMOTES.find((e) => e.id === emId) ?? MLBB_EMOTES[0];
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedEmoteSlot(idx as 0 | 1 | 2 | 3)}
                            className={`p-3 rounded-xl border text-center cursor-pointer ${
                              selectedEmoteSlot === idx ? 'bg-amber-500/25 border-[#F5C451]' : 'bg-slate-900 border-slate-700'
                            }`}
                          >
                            <div className="text-[10px] text-slate-400 font-bold">SLOT {idx + 1}</div>
                            <div className="text-2xl my-1">{em.icon}</div>
                            <div className="text-xs font-black text-white">{em.name}</div>
                            <div className="text-[10px] text-amber-300">"{em.callout}"</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {MLBB_EMOTES.map((em) => {
                      const owned = profile.ownedEmotes.includes(em.id);
                      const isEquipped = profile.equippedEmotes.includes(em.id);
                      return (
                        <div key={em.id} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex flex-col justify-between gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{em.icon}</span>
                            <span className="text-[10px] font-bold" style={{ color: em.color }}>{em.rarity}</span>
                          </div>
                          <div>
                            <div className="text-xs font-black text-white">{em.name}</div>
                            <div className="text-[10px] text-slate-300">Callout: "{em.callout}"</div>
                          </div>
                          {owned ? (
                            <button
                              onClick={() => {
                                mlbbAudio.playEmote(em.sfx);
                                onUpdateProfile((p) => {
                                  const next: [string, string, string, string] = [...p.equippedEmotes];
                                  next[selectedEmoteSlot] = em.id;
                                  return { ...p, equippedEmotes: next };
                                });
                              }}
                              className={`py-1.5 rounded-lg text-[11px] font-black cursor-pointer ${
                                isEquipped ? 'bg-emerald-600 text-white' : 'bg-[#F5C451] text-slate-950'
                              }`}
                            >
                              {isEquipped ? 'Equipped ✓' : `Equip to Slot ${selectedEmoteSlot + 1}`}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (profile.tickets >= em.costTickets && em.costTickets > 0) {
                                  onUpdateProfile((p) => ({
                                    ...p,
                                    tickets: p.tickets - em.costTickets,
                                    ownedEmotes: [...p.ownedEmotes, em.id]
                                  }));
                                  mlbbAudio.playEmote(em.sfx);
                                } else if (profile.bp >= em.costBp && em.costBp > 0) {
                                  onUpdateProfile((p) => ({
                                    ...p,
                                    bp: p.bp - em.costBp,
                                    ownedEmotes: [...p.ownedEmotes, em.id]
                                  }));
                                  mlbbAudio.playEmote(em.sfx);
                                }
                              }}
                              className="py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-black cursor-pointer mlbb-num"
                            >
                              Unlock 🎟️ {em.costTickets}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. QUICK CHAT */}
              {prepTab === 'quickchat' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MLBB_QUICK_CHAT_OPTIONS.map((qc) => {
                    const active = profile.quickChatIds.includes(qc.id);
                    return (
                      <button
                        key={qc.id}
                        onClick={() => {
                          onUpdateProfile((p) => {
                            const has = p.quickChatIds.includes(qc.id);
                            if (has && p.quickChatIds.length > 2) {
                              return { ...p, quickChatIds: p.quickChatIds.filter((x) => x !== qc.id) };
                            }
                            if (!has && p.quickChatIds.length < 6) {
                              return { ...p, quickChatIds: [...p.quickChatIds, qc.id] };
                            }
                            return p;
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold cursor-pointer ${
                          active ? 'bg-amber-500/20 border-[#F5C451] text-white' : 'bg-[#101C3D] border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="text-[10px] text-amber-300 uppercase">{qc.category}</div>
                        <div>{qc.text}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 6. BATTLE EFFECTS */}
              {prepTab === 'effects' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {(['recall', 'spawn', 'elim', 'killNotif'] as const).map((cat) => (
                    <div key={cat} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 space-y-2">
                      <div className="font-black text-[#F5C451] uppercase">{cat} Effect</div>
                      <div className="flex flex-wrap gap-1.5">
                        {MLBB_BATTLE_EFFECTS[cat].map((ef) => (
                          <button
                            key={ef.id}
                            onClick={() =>
                              onUpdateProfile((p) => ({
                                ...p,
                                equippedEffects: { ...p.equippedEffects, [cat]: ef.id }
                              }))
                            }
                            className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${
                              profile.equippedEffects[cat] === ef.id
                                ? 'bg-[#F5C451] text-slate-950'
                                : 'bg-slate-800 text-slate-200'
                            }`}
                          >
                            {ef.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ==================== HERO GALLERY ==================== */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder={`Search ${MLBB_ALL_HEROES.length} heroes (e.g. Kalea, Zetian, Obsidia)...`}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                  <span className="text-[10px] font-black text-[#F5C451] mlbb-num whitespace-nowrap">
                    {filteredGalleryHeroes.length}/{MLBB_ALL_HEROES.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer ${
                        roleFilter === r ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(['All', 'EXP', 'Jungle', 'Mid', 'Gold', 'Roam'] as const).map((ln) => (
                    <button
                      key={ln}
                      onClick={() => setLaneFilter(ln)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        laneFilter === ln ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {ln === 'All' ? 'All Lanes' : ln}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[52vh] overflow-y-auto pr-1">
                  {filteredGalleryHeroes.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setInspectHeroId(h.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer ${
                        inspectHeroId === h.id ? 'bg-amber-500/20 border-[#F5C451]' : 'bg-[#101C3D] border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <HeroPortraitSvg heroId={h.id} size={36} />
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">{h.name}</div>
                        <div className="text-[10px] text-amber-300 truncate">{h.role} · {h.lane}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-7 p-4 rounded-xl bg-[#101C3D] border border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <HeroPortraitSvg
                      heroId={inspectHero.id}
                      size={66}
                      skinColor={inspectHero.skins.find((s) => s.id === profile.equippedSkins[inspectHero.id])?.color}
                      skinAccent={inspectHero.skins.find((s) => s.id === profile.equippedSkins[inspectHero.id])?.accent}
                    />
                    <div>
                      <div className="text-lg font-black text-white">{inspectHero.name}</div>
                      <div className="text-xs text-[#F5C451] font-bold">{inspectHero.title} · {inspectHero.specialty}</div>
                      <div className="text-[11px] text-slate-300">{inspectHero.role} · Recommended {inspectHero.lane} Lane</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        onUpdateProfile((p) => ({
                          ...p,
                          selectedHeroId: inspectHero.id,
                          showcaseHeroId: inspectHero.id,
                          selectedLane: inspectHero.lane
                        }));
                        mlbbAudio.playClick();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F5C451] text-slate-950 text-xs font-black cursor-pointer"
                    >
                      Display in Lobby
                    </button>
                  </div>
                </div>

                {/* Attribute Bars */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {(
                    [
                      ['Durability', inspectHero.ratings.durability, 'bg-emerald-400'],
                      ['Offense', inspectHero.ratings.offense, 'bg-rose-400'],
                      ['Control', inspectHero.ratings.control, 'bg-sky-400'],
                      ['Difficulty', inspectHero.ratings.difficulty, 'bg-amber-400']
                    ] as const
                  ).map(([label, val, col]) => (
                    <div key={label}>
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{label}</span>
                        <span className="mlbb-num">{val}/10</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden mt-0.5">
                        <div className={`h-full ${col}`} style={{ width: `${val * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Passive & Skills */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-amber-500/30">
                    <div className="font-black text-[#F5C451]">Passive · {inspectHero.passiveName}</div>
                    <div className="text-slate-300 text-[11px] mt-0.5">{inspectHero.passiveDesc}</div>
                  </div>
                  {inspectHero.skills.map((sk) => (
                    <div key={sk.slot} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white">
                          {sk.icon} Skill {sk.slot}: {sk.name}
                        </span>
                        <span className="text-[10px] text-cyan-300 mlbb-num">
                          CD {sk.cooldown[0]}s · {sk.damageType.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{sk.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
