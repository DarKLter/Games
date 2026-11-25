import React, { useEffect, useMemo, useState } from 'react';
import { MlbbLane, MlbbProfileSave, MlbbRole } from '../types';
import { MLBB_ALL_HEROES, getMlbbHeroById } from '../data/heroes';
import { getMlbbItemById } from '../data/items';
import { getHeroExtraSkillPreview, getHeroMasterySummary } from '../data/heroCatalogMeta';
import { HeroPortraitSvg } from './HeroAvatarSvg';
import { HeroShowcase3D, HeroShowcasePoseSignal } from './HeroShowcase3D';
import { mlbbAudio } from '../engine/AudioEngine';

interface HeroGalleryModalProps {
  profile: MlbbProfileSave;
  onClose: () => void;
  onUpdateProfile: (fn: (prev: MlbbProfileSave) => MlbbProfileSave) => void;
  onPracticeHero: (heroId: string, skinId: string, lane: MlbbLane) => void;
}

const ROLES: (MlbbRole | 'All')[] = ['All', 'Tank', 'Fighter', 'Assassin', 'Mage', 'Marksman', 'Support'];
const LANES: (MlbbLane | 'All')[] = ['All', 'EXP', 'Jungle', 'Mid', 'Gold', 'Roam'];

function getSkinTagColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('legend')) return 'text-[#FFE28A]';
  if (t.includes('collector') || t.includes('aspirant') || t.includes('lightborn') || t.includes('champion')) {
    return 'text-amber-300';
  }
  if (t.includes('epic')) return 'text-violet-300';
  if (t.includes('special')) return 'text-emerald-300';
  if (t.includes('elite')) return 'text-sky-300';
  return 'text-slate-300';
}

const SKILL_KEYS = ['PASSIVE', 'SKILL 1', 'SKILL 2', 'ULTIMATE', 'SKILL 4'] as const;

export const HeroGalleryModal: React.FC<HeroGalleryModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
  onPracticeHero
}) => {
  const [roleFilter, setRoleFilter] = useState<MlbbRole | 'All'>('All');
  const [laneFilter, setLaneFilter] = useState<MlbbLane | 'All'>('All');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'mastered'>('all');
  const [search, setSearch] = useState('');
  const [inspectHeroId, setInspectHeroId] = useState<string>(profile.selectedHeroId);
  const [previewSkinId, setPreviewSkinId] = useState<string>(
    profile.equippedSkins[profile.selectedHeroId] ?? getMlbbHeroById(profile.selectedHeroId).skins[0].id
  );
  const [detailTab, setDetailTab] = useState<'skills' | 'stats' | 'mastery'>('skills');
  const [selectedSkillIdx, setSelectedSkillIdx] = useState<number>(1);
  const [poseSignal, setPoseSignal] = useState<HeroShowcasePoseSignal | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const inspectHero = getMlbbHeroById(inspectHeroId);

  useEffect(() => {
    const equipped = profile.equippedSkins[inspectHero.id];
    const valid = inspectHero.skins.find((s) => s.id === equipped) ?? inspectHero.skins[0];
    setPreviewSkinId(valid.id);
    setSelectedSkillIdx(1);
  }, [inspectHero, profile.equippedSkins]);

  useEffect(() => {
    if (!feedbackMsg) return;
    const t = window.setTimeout(() => setFeedbackMsg(null), 2600);
    return () => window.clearTimeout(t);
  }, [feedbackMsg]);

  const filteredHeroes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MLBB_ALL_HEROES.filter((h) => {
      if (roleFilter !== 'All' && h.role !== roleFilter) return false;
      if (laneFilter !== 'All' && h.lane !== laneFilter) return false;
      if (ownershipFilter === 'owned' && !profile.ownedHeroIds.includes(h.id)) return false;
      if (ownershipFilter === 'mastered') {
        const st = profile.heroStats[h.id];
        const claimed = profile.claimedMasteryChapters?.[h.id] ?? [];
        if ((!st || st.mastery < 100) && !claimed.includes(4)) return false;
      }
      if (
        q &&
        !h.name.toLowerCase().includes(q) &&
        !h.title.toLowerCase().includes(q) &&
        !h.specialty.toLowerCase().includes(q) &&
        !h.role.toLowerCase().includes(q) &&
        !h.lane.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [search, roleFilter, laneFilter, ownershipFilter, profile.ownedHeroIds, profile.heroStats, profile.claimedMasteryChapters]);

  const activeSkin = inspectHero.skins.find((s) => s.id === previewSkinId) ?? inspectHero.skins[0];
  const isHeroOwned = profile.ownedHeroIds.includes(inspectHero.id);
  const ownedHeroSkinList = profile.ownedSkins[inspectHero.id] ?? [];
  const isDefaultSkin = activeSkin.id === inspectHero.skins[0].id || activeSkin.costDiamonds === 0;
  const isSkinOwned = isDefaultSkin || ownedHeroSkinList.includes(activeSkin.id);
  const isSkinEquipped = (profile.equippedSkins[inspectHero.id] ?? inspectHero.skins[0].id) === activeSkin.id;
  const isLobbyHero = profile.selectedHeroId === inspectHero.id;

  const extraSkill4 = getHeroExtraSkillPreview(inspectHero.id);
  const masterySummary = useMemo(
    () =>
      getHeroMasterySummary(
        inspectHero,
        profile.heroStats[inspectHero.id],
        isHeroOwned,
        profile.claimedMasteryChapters?.[inspectHero.id] ?? []
      ),
    [inspectHero, profile.heroStats, isHeroOwned, profile.claimedMasteryChapters]
  );

  const heroStatRecord = profile.heroStats[inspectHero.id] ?? { matches: 0, wins: 0, mmr: 1200, mastery: 0 };
  const winRate =
    heroStatRecord.matches > 0 ? Math.round((heroStatRecord.wins / heroStatRecord.matches) * 100) : 0;

  const handleRecruitHero = (currency: 'bp' | 'diamonds') => {
    if (isHeroOwned) return;
    if (currency === 'bp') {
      if (profile.bp < inspectHero.costBp) {
        setFeedbackMsg(`Need ${inspectHero.costBp.toLocaleString()} BP to recruit ${inspectHero.name}.`);
        return;
      }
      mlbbAudio.playPurchase();
      onUpdateProfile((p) => {
        const prevSkins = p.ownedSkins[inspectHero.id] ?? [];
        const defId = inspectHero.skins[0].id;
        return {
          ...p,
          bp: p.bp - inspectHero.costBp,
          ownedHeroIds: p.ownedHeroIds.includes(inspectHero.id) ? p.ownedHeroIds : [...p.ownedHeroIds, inspectHero.id],
          ownedSkins: {
            ...p.ownedSkins,
            [inspectHero.id]: prevSkins.includes(defId) ? prevSkins : [...prevSkins, defId]
          },
          equippedSkins: { ...p.equippedSkins, [inspectHero.id]: defId }
        };
      });
      setFeedbackMsg(`Recruited ${inspectHero.name} with BP!`);
    } else {
      if (profile.diamonds < inspectHero.costDiamonds) {
        setFeedbackMsg(`Need ${inspectHero.costDiamonds} Diamonds to recruit ${inspectHero.name}.`);
        return;
      }
      mlbbAudio.playPurchase();
      onUpdateProfile((p) => {
        const prevSkins = p.ownedSkins[inspectHero.id] ?? [];
        const defId = inspectHero.skins[0].id;
        return {
          ...p,
          diamonds: p.diamonds - inspectHero.costDiamonds,
          ownedHeroIds: p.ownedHeroIds.includes(inspectHero.id) ? p.ownedHeroIds : [...p.ownedHeroIds, inspectHero.id],
          ownedSkins: {
            ...p.ownedSkins,
            [inspectHero.id]: prevSkins.includes(defId) ? prevSkins : [...prevSkins, defId]
          },
          equippedSkins: { ...p.equippedSkins, [inspectHero.id]: defId }
        };
      });
      setFeedbackMsg(`Recruited ${inspectHero.name} with Diamonds!`);
    }
  };

  const handleEquipOrUnlockSkin = () => {
    if (isSkinOwned) {
      mlbbAudio.playClick();
      onUpdateProfile((p) => ({
        ...p,
        equippedSkins: { ...p.equippedSkins, [inspectHero.id]: activeSkin.id }
      }));
      setPoseSignal({ nonce: Date.now(), color: activeSkin.accent, label: `${activeSkin.name} Equipped` });
      setFeedbackMsg(`Equipped ${activeSkin.name} (${activeSkin.tag})!`);
      return;
    }
    const cost = activeSkin.costDiamonds;
    if (profile.diamonds < cost) {
      setFeedbackMsg(`Need ${cost} Diamonds to unlock ${activeSkin.name}.`);
      return;
    }
    mlbbAudio.playPurchase();
    onUpdateProfile((p) => {
      const prevSkins = p.ownedSkins[inspectHero.id] ?? [];
      return {
        ...p,
        diamonds: p.diamonds - cost,
        ownedSkins: {
          ...p.ownedSkins,
          [inspectHero.id]: prevSkins.includes(activeSkin.id) ? prevSkins : [...prevSkins, activeSkin.id]
        },
        equippedSkins: { ...p.equippedSkins, [inspectHero.id]: activeSkin.id }
      };
    });
    setPoseSignal({ nonce: Date.now(), color: activeSkin.accent, label: `${activeSkin.name} Unlocked` });
    setFeedbackMsg(`Unlocked & equipped ${activeSkin.name}!`);
  };

  const handleDisplayInLobby = () => {
    mlbbAudio.playClick();
    onUpdateProfile((p) => ({
      ...p,
      showcaseHeroId: inspectHero.id,
      selectedHeroId: inspectHero.id,
      selectedLane: inspectHero.lane,
      equippedSkins: isSkinOwned ? { ...p.equippedSkins, [inspectHero.id]: activeSkin.id } : p.equippedSkins
    }));
    setFeedbackMsg(`${inspectHero.name} is now displayed in the Sanctuary Lobby.`);
  };

  const handleClaimMasteryChapter = (chapterNum: number, rewardBp: number, rewardTickets: number) => {
    mlbbAudio.playPurchase();
    onUpdateProfile((p) => {
      const prevMap = p.claimedMasteryChapters ?? {};
      const prevList = prevMap[inspectHero.id] ?? [];
      if (prevList.includes(chapterNum)) return p;
      const prevStat = p.heroStats[inspectHero.id] ?? { matches: 0, wins: 0, mmr: 1200, mastery: 0 };
      const nextMastery = Math.min(100, Math.max(prevStat.mastery, chapterNum * 25));
      return {
        ...p,
        bp: p.bp + rewardBp,
        tickets: p.tickets + rewardTickets,
        heroStats: {
          ...p.heroStats,
          [inspectHero.id]: { ...prevStat, mastery: nextMastery }
        },
        claimedMasteryChapters: {
          ...prevMap,
          [inspectHero.id]: [...prevList, chapterNum]
        }
      };
    });
    setPoseSignal({ nonce: Date.now(), color: '#FFE28A', label: `Chapter ${chapterNum} Claimed` });
    setFeedbackMsg(`Claimed Chapter ${chapterNum}: +${rewardBp} BP & +${rewardTickets} Tickets!`);
  };

  const resourceLabel =
    inspectHero.resource === 'mana' ? 'Mana' : inspectHero.resource === 'energy' ? 'Energy' : 'No Mana';

  const skillCards = useMemo(() => {
    const list: {
      idx: number;
      keyLabel: string;
      name: string;
      desc: string;
      color: string;
      damageType?: string;
      cd?: string;
      mana?: number;
      range?: number;
      cc?: string;
      scaling?: string;
      tags?: string[];
    }[] = [
      {
        idx: 0,
        keyLabel: SKILL_KEYS[0],
        name: inspectHero.passiveName,
        desc: inspectHero.passiveDesc,
        color: activeSkin.accent,
        tags: ['Signature Passive']
      },
      ...inspectHero.skills.map((sk, i) => {
        const minCd = sk.cooldown[sk.cooldown.length - 1] ?? sk.cooldown[0] ?? 8;
        const maxCd = sk.cooldown[0] ?? 8;
        const cdStr = maxCd === minCd ? `${maxCd.toFixed(1)}s` : `${maxCd.toFixed(1)}–${minCd.toFixed(1)}s`;
        const dmgMin = sk.baseDmg[0] ?? 0;
        const dmgMax = sk.baseDmg[sk.baseDmg.length - 1] ?? dmgMin;
        const dmgBand = dmgMin === dmgMax ? `${dmgMin}` : `${dmgMin}–${dmgMax}`;
        return {
          idx: i + 1,
          keyLabel: SKILL_KEYS[i + 1],
          name: sk.name,
          desc: sk.desc,
          color: sk.color,
          damageType: sk.damageType.toUpperCase(),
          cd: cdStr,
          mana: sk.manaCost,
          range: sk.range,
          cc: sk.ccType ? `${sk.ccType.toUpperCase()} (${(sk.ccDuration ?? 1.0).toFixed(1)}s)` : 'None',
          scaling: `${dmgBand} base + ${Math.round(sk.physScale * 100)}% Phys ATK / ${Math.round(sk.magicScale * 100)}% Magic POW`,
          tags: [
            sk.physics.toUpperCase(),
            sk.telegraph.toUpperCase(),
            sk.wallCross ? 'Wall-Cross' : ''
          ].filter(Boolean)
        };
      })
    ];

    if (extraSkill4) {
      list.push({
        idx: 4,
        keyLabel: SKILL_KEYS[4],
        name: extraSkill4.name,
        desc: extraSkill4.desc,
        color: extraSkill4.color,
        cd: `${extraSkill4.cd.toFixed(1)}s`,
        tags: ['4-Skill Special Slot']
      });
    }
    return list;
  }, [inspectHero, activeSkin.accent, extraSkill4]);

  const activeSkillCard = skillCards[Math.min(selectedSkillIdx, skillCards.length - 1)] ?? skillCards[0];

  const statRows = [
    { label: 'Max HP', base: `${inspectHero.baseHp}`, growth: `+${inspectHero.hpGrowth} / Lv` },
    {
      label: resourceLabel,
      base: `${inspectHero.baseMana}`,
      growth: inspectHero.manaGrowth > 0 ? `+${inspectHero.manaGrowth} / Lv` : 'Resource-Free'
    },
    { label: 'Physical ATK', base: `${inspectHero.basePhysAtk}`, growth: `+${inspectHero.physAtkGrowth} / Lv` },
    { label: 'Magic Power', base: `${inspectHero.baseMagicPow}`, growth: 'Scales w/ Items' },
    { label: 'Physical DEF', base: `${inspectHero.basePhysDef}`, growth: `+${inspectHero.physDefGrowth} / Lv` },
    { label: 'Magic DEF', base: `${inspectHero.baseMagicDef}`, growth: `+${inspectHero.magicDefGrowth} / Lv` },
    { label: 'Move Speed', base: `${inspectHero.baseMoveSpd}`, growth: 'Soft-Cap 415/490' },
    { label: 'Attack Speed', base: `${inspectHero.baseAtkSpd.toFixed(2)}/s`, growth: 'Cap 3.00/s' },
    { label: 'Attack Range', base: `${inspectHero.attackRange}`, growth: inspectHero.isRanged ? 'Ranged' : 'Melee' }
  ];

  const ratingBars = [
    { label: 'Durability', val: inspectHero.ratings.durability, color: '#22C55E' },
    { label: 'Offense', val: inspectHero.ratings.offense, color: '#F97316' },
    { label: 'Control', val: inspectHero.ratings.control, color: '#38BDF8' },
    { label: 'Difficulty', val: inspectHero.ratings.difficulty, color: '#E6B84C' }
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/88 flex items-center justify-center p-2 sm:p-3">
      <div className="w-full max-w-7xl h-[92vh] rounded-2xl bg-[#080F24] border border-[#E6B84C]/55 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* ==================== HEADER BAR ==================== */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E1938] border-b border-[#E6B84C]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm sm:text-base font-black tracking-wide uppercase text-[#FFE28A]">
                Heroes Gallery
              </div>
              <div className="text-[11px] text-slate-400">
                {MLBB_ALL_HEROES.length} Playable Champions · Owned{' '}
                <span className="text-white font-bold mlbb-num">{profile.ownedHeroIds.length}</span> / {MLBB_ALL_HEROES.length}
              </div>
            </div>
            {feedbackMsg && (
              <div className="hidden md:block px-3 py-1 rounded-lg bg-[#162754] border border-[#E6B84C]/50 text-xs font-bold text-[#FFE28A]">
                {feedbackMsg}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-bold text-slate-200 mlbb-num">
              <span>
                BP <strong className="text-amber-300">{profile.bp.toLocaleString()}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Tickets <strong className="text-cyan-300">{profile.tickets.toLocaleString()}</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span>
                Diamonds <strong className="text-sky-300">{profile.diamonds.toLocaleString()}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                mlbbAudio.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer transition"
              aria-label="Close Heroes Gallery"
            >
              ✕
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div className="md:hidden px-4 py-1.5 bg-[#162754] border-b border-[#E6B84C]/35 text-xs font-bold text-[#FFE28A]">
            {feedbackMsg}
          </div>
        )}

        {/* ==================== MAIN 2-COLUMN BODY ==================== */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT COLUMN: FILTERS + 133-HERO GRID */}
          <div className="lg:col-span-5 flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800/90 bg-[#0A1229]">
            <div className="p-3 space-y-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search 133 heroes by name, role, lane, specialty..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#070D1F] border border-slate-700 focus:border-[#E6B84C] outline-none text-xs text-white placeholder:text-slate-500"
                />
                <div className="text-[11px] font-bold text-slate-400 mlbb-num shrink-0">
                  {filteredHeroes.length} / {MLBB_ALL_HEROES.length}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      mlbbAudio.playClick();
                      setRoleFilter(r);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
                      roleFilter === r
                        ? 'bg-[#E6B84C] text-slate-950'
                        : 'bg-[#121E3D] text-slate-300 hover:bg-[#1A2B54] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex flex-wrap gap-1">
                  {LANES.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        mlbbAudio.playClick();
                        setLaneFilter(l);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                        laneFilter === l
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-[#0E1834] text-slate-400 hover:text-white'
                      }`}
                    >
                      {l === 'All' ? 'All Lanes' : l}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {(['all', 'owned', 'mastered'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        mlbbAudio.playClick();
                        setOwnershipFilter(f);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                        ownershipFilter === f
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#0E1834] text-slate-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5">
              {filteredHeroes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="text-sm font-bold text-slate-300">No champions match your filters.</div>
                  <button
                    onClick={() => {
                      setRoleFilter('All');
                      setLaneFilter('All');
                      setOwnershipFilter('all');
                      setSearch('');
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#E6B84C] text-slate-950 text-xs font-black cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-2">
                  {filteredHeroes.map((h) => {
                    const selected = h.id === inspectHero.id;
                    const owned = profile.ownedHeroIds.includes(h.id);
                    const eqSkinId = profile.equippedSkins[h.id];
                    const eqSkin = h.skins.find((s) => s.id === eqSkinId) ?? h.skins[0];
                    const mastered =
                      (profile.heroStats[h.id]?.mastery ?? 0) >= 100 ||
                      (profile.claimedMasteryChapters?.[h.id] ?? []).includes(4);

                    return (
                      <button
                        key={h.id}
                        onClick={() => {
                          mlbbAudio.playClick();
                          setInspectHeroId(h.id);
                        }}
                        className={`relative p-2 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition ${
                          selected
                            ? 'bg-[#172855] border-[#FFE28A] shadow-lg'
                            : 'bg-[#0E1835] border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="relative">
                          <HeroPortraitSvg
                            heroId={h.id}
                            skinColor={eqSkin.color}
                            skinAccent={eqSkin.accent}
                            size={50}
                          />
                          {mastered && (
                            <span
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFE28A] text-slate-950 text-[9px] font-black flex items-center justify-center"
                              title="Mastered Champion"
                            >
                              ★
                            </span>
                          )}
                          {!owned && (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 px-1 rounded bg-slate-950/90 border border-slate-700 text-[8px] font-bold text-slate-300"
                              title="Not yet recruited"
                            >
                              LOCK
                            </span>
                          )}
                        </div>
                        <div className="w-full truncate text-[11px] font-black text-white">{h.name}</div>
                        <div className="w-full truncate text-[9px] text-slate-400">
                          {h.role} · {h.lane}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: 3D SHOWCASE + 5-TIER SKIN SWITCHER + SKILLS / STATS / MASTERY */}
          <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto p-3.5 space-y-3 bg-[#080F24]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 shrink-0">
              <div className="md:col-span-7 h-56 sm:h-64">
                <HeroShowcase3D heroId={inspectHero.id} skinId={activeSkin.id} poseSignal={poseSignal} />
              </div>

              <div className="md:col-span-5 flex flex-col justify-between p-3 rounded-xl bg-[#0D1734] border border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-black text-white leading-tight">{inspectHero.name}</h2>
                      <div className="text-xs font-semibold text-[#FFE28A]">{inspectHero.title}</div>
                    </div>
                    {masterySummary.badgeUnlocked && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        ★ Master
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-300">
                    {inspectHero.role}
                    {inspectHero.secondaryRole ? ` / ${inspectHero.secondaryRole}` : ''} · {inspectHero.lane} Lane · {resourceLabel}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Specialty: <span className="text-slate-200 font-semibold">{inspectHero.specialty}</span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 mlbb-num">
                    <span>Matches: <strong className="text-white">{heroStatRecord.matches}</strong></span>
                    <span>Win Rate: <strong className="text-emerald-300">{winRate}%</strong></span>
                    <span>MMR: <strong className="text-amber-300">{heroStatRecord.mmr}</strong></span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  <button
                    onClick={() => {
                      mlbbAudio.playClick();
                      onPracticeHero(inspectHero.id, activeSkin.id, inspectHero.lane);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#E6B84C] bg-gradient-to-r from-[#FFE28A] via-[#E6B84C] to-[#C88A1E] border border-[#FFE28A] text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-lg transition"
                  >
                    Practice This Hero ({inspectHero.lane})
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={handleDisplayInLobby}
                      className={`py-2 px-2 rounded-lg text-[11px] font-black cursor-pointer transition ${
                        isLobbyHero
                          ? 'bg-emerald-900/60 border border-emerald-500/60 text-emerald-200'
                          : 'bg-[#15244A] hover:bg-[#1D3164] border border-slate-700 text-slate-100'
                      }`}
                    >
                      {isLobbyHero ? 'In Sanctuary ✓' : 'Display in Lobby'}
                    </button>

                    {!isHeroOwned ? (
                      <button
                        onClick={() => handleRecruitHero('bp')}
                        className="py-2 px-2 rounded-lg bg-[#1A2952] hover:bg-[#243870] border border-[#E6B84C]/55 text-[11px] font-black text-[#FFE28A] cursor-pointer mlbb-num"
                      >
                        Buy {inspectHero.costBp.toLocaleString()} BP
                      </button>
                    ) : (
                      <button
                        onClick={handleEquipOrUnlockSkin}
                        className={`py-2 px-2 rounded-lg text-[11px] font-black cursor-pointer transition mlbb-num ${
                          isSkinOwned && isSkinEquipped
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : isSkinOwned
                              ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                              : 'bg-violet-600 hover:bg-violet-500 text-white'
                        }`}
                      >
                        {isSkinOwned
                          ? isSkinEquipped
                            ? 'Skin Active ✓'
                            : 'Equip Skin'
                          : `Unlock ${activeSkin.costDiamonds} 💎`}
                      </button>
                    )}
                  </div>

                  {!isHeroOwned && (
                    <button
                      onClick={() => handleRecruitHero('diamonds')}
                      className="w-full py-1.5 rounded-lg bg-[#101C3D] hover:bg-[#192B5B] border border-sky-500/40 text-[10px] font-bold text-sky-300 cursor-pointer mlbb-num"
                    >
                      Or Instant Unlock with {inspectHero.costDiamonds} Diamonds 💎
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 5-TIER SKIN SWITCHER */}
            <div className="p-3 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#FFE28A]">
                  Skin Collection ({inspectHero.skins.length} Tiers)
                </div>
                <div className="text-[11px] text-slate-400">
                  Previewing:{' '}
                  <span className={`font-bold ${getSkinTagColor(activeSkin.tag)}`}>{activeSkin.name}</span>
                  {isSkinOwned ? (isSkinEquipped ? ' · Equipped' : ' · Owned') : ` · ${activeSkin.costDiamonds} Diamonds`}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {inspectHero.skins.map((sk) => {
                  const selected = sk.id === activeSkin.id;
                  const owned = sk.id === inspectHero.skins[0].id || sk.costDiamonds === 0 || ownedHeroSkinList.includes(sk.id);
                  const equipped = (profile.equippedSkins[inspectHero.id] ?? inspectHero.skins[0].id) === sk.id;
                  return (
                    <button
                      key={sk.id}
                      onClick={() => {
                        mlbbAudio.playClick();
                        setPreviewSkinId(sk.id);
                      }}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition ${
                        selected
                          ? 'bg-[#172856] border-[#FFE28A]'
                          : 'bg-[#081026] border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={{ background: `linear-gradient(135deg, ${sk.color}, ${sk.accent})` }}
                        />
                        <span className={`text-[9px] font-black uppercase ${getSkinTagColor(sk.tag)}`}>
                          {sk.tag}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-white truncate">{sk.name}</div>
                      <div className="text-[9px] text-slate-400 mlbb-num mt-0.5">
                        {equipped ? 'Equipped ✓' : owned ? 'Owned' : `${sk.costDiamonds} 💎`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DETAIL TABS */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0">
              {(
                [
                  { id: 'skills', label: `Skills (${skillCards.length})` },
                  { id: 'stats', label: 'Base Stats & Build' },
                  { id: 'mastery', label: `Mastery Ch. 1–4 (${masterySummary.masteryPct}%)` }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    mlbbAudio.playClick();
                    setDetailTab(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide cursor-pointer transition ${
                    detailTab === tab.id
                      ? 'bg-[#E6B84C] text-slate-950'
                      : 'bg-[#0F1B3B] text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: INTERACTIVE SKILL PREVIEW CARDS */}
            {detailTab === 'skills' && (
              <div className="space-y-3">
                <div className={`grid gap-2 ${skillCards.length >= 5 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {skillCards.map((sc) => {
                    const active = sc.idx === activeSkillCard.idx;
                    return (
                      <button
                        key={sc.keyLabel}
                        onClick={() => {
                          mlbbAudio.playClick();
                          setSelectedSkillIdx(sc.idx);
                          setPoseSignal({ nonce: Date.now(), color: sc.color, label: sc.name });
                        }}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                          active
                            ? 'bg-[#172856] border-[#FFE28A]'
                            : 'bg-[#0D1734] border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">
                            {sc.keyLabel}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: sc.color }}
                          />
                        </div>
                        <div className="text-xs font-black text-white truncate mt-1">{sc.name}</div>
                        {sc.cd && (
                          <div className="text-[10px] text-slate-400 mlbb-num mt-0.5">
                            CD {sc.cd}
                            {sc.mana ? ` · ${sc.mana} ${resourceLabel}` : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#FFE28A]">
                        {activeSkillCard.keyLabel}
                      </div>
                      <div className="text-base font-black text-white">{activeSkillCard.name}</div>
                    </div>
                    {activeSkillCard.tags && activeSkillCard.tags.length > 0 && (
                      <div className="text-[11px] font-semibold text-sky-300">
                        {activeSkillCard.tags.join(' · ')}
                      </div>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-slate-200">{activeSkillCard.desc}</p>

                  {activeSkillCard.scaling && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] mlbb-num">
                      <div>
                        <div className="text-slate-400 text-[10px]">Damage Type</div>
                        <div className="font-bold text-white">{activeSkillCard.damageType}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Cooldown / Cost</div>
                        <div className="font-bold text-white">
                          {activeSkillCard.cd} · {activeSkillCard.mana ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Cast Range</div>
                        <div className="font-bold text-white">{activeSkillCard.range} units</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Crowd Control</div>
                        <div className="font-bold text-amber-300">{activeSkillCard.cc}</div>
                      </div>
                      <div className="col-span-2 sm:col-span-4">
                        <div className="text-slate-400 text-[10px]">Scaling Formula</div>
                        <div className="font-bold text-sky-200">{activeSkillCard.scaling}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: BASE STATS & RECOMMENDED CORE BUILD */}
            {detailTab === 'stats' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#0D1734] border border-slate-800">
                  {ratingBars.map((bar) => (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300">{bar.label}</span>
                        <span className="font-black text-white mlbb-num">{bar.val}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, bar.val)}%`, backgroundColor: bar.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {statRows.map((row) => (
                    <div
                      key={row.label}
                      className="p-2.5 rounded-lg bg-[#0D1734] border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-[10px] text-slate-400">{row.label}</div>
                        <div className="text-sm font-black text-white mlbb-num">{row.base}</div>
                      </div>
                      <div className="text-[10px] font-bold text-emerald-300 mlbb-num text-right">{row.growth}</div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#0D1734] border border-slate-800 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#FFE28A]">
                    Recommended 6-Item Core Build
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {inspectHero.recommendedBuild.map((itemId, idx) => {
                      const item = getMlbbItemById(itemId);
                      return (
                        <div
                          key={`${itemId}_${idx}`}
                          className="p-2 rounded-lg bg-[#081026] border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-white truncate">
                              {idx + 1}. {item?.name ?? itemId}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate">{item?.category ?? 'Equipment'}</div>
                          </div>
                          <div className="text-[10px] font-bold text-amber-300 mlbb-num shrink-0">
                            {item?.cost ?? 0}g
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HERO MASTERY CHAPTERS 1-4 */}
            {detailTab === 'mastery' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#0D1734] border border-[#E6B84C]/35 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-[#FFE28A] uppercase tracking-wide">
                        {inspectHero.name} Mastery Code
                      </span>
                      <span className="font-black text-white mlbb-num">
                        {masterySummary.completedChapters} / 4 Chapters · {masterySummary.masteryPct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E6B84C] to-[#FFE28A]"
                        style={{ width: `${masterySummary.masteryPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Mastery Badge</div>
                    <div className={`text-xs font-black ${masterySummary.badgeUnlocked ? 'text-[#FFE28A]' : 'text-slate-400'}`}>
                      {masterySummary.badgeUnlocked ? `★ ${masterySummary.badgeTitle}` : 'Complete Ch. 4 to Unlock'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {masterySummary.chapters.map((ch) => {
                    const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));
                    return (
                      <div
                        key={ch.chapter}
                        className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 ${
                          ch.claimed
                            ? 'bg-[#0C1D2E] border-emerald-500/40'
                            : ch.completed
                              ? 'bg-[#17264D] border-[#FFE28A]/70'
                              : 'bg-[#0D1734] border-slate-800'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                            <span className="text-[#FFE28A]">Chapter {ch.chapter}</span>
                            <span className="text-slate-300 mlbb-num">
                              {ch.current} / {ch.target}
                            </span>
                          </div>
                          <div className="text-sm font-black text-white">{ch.title}</div>
                          <p className="text-[11px] text-slate-300 leading-snug">{ch.objective}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: ch.claimed ? '#22C55E' : '#E6B84C'
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-[10px] font-bold text-amber-300 mlbb-num">
                              {ch.rewardLabel}
                            </div>
                            {ch.claimed ? (
                              <span className="text-[10px] font-black text-emerald-400">Claimed ✓</span>
                            ) : ch.completed ? (
                              <button
                                onClick={() =>
                                  handleClaimMasteryChapter(ch.chapter, ch.rewardBp, ch.rewardTickets)
                                }
                                className="px-3 py-1 rounded-lg bg-[#E6B84C] hover:brightness-110 text-slate-950 text-[10px] font-black uppercase cursor-pointer"
                              >
                                Claim
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">In Progress</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
