import React, { useState } from 'react';
import { MiniMilitiaSave, MmAvatarConfig, MmGrenadeId, MmLoadoutDef, MmSpecialPerkId } from '../types';
import {
  MM_BOOTS,
  MM_EYE_STYLES,
  MM_EYEWEAR,
  MM_FACIAL,
  MM_HEADGEAR,
  MM_OUTFITS,
  MM_SKIN_TONES,
  makeRandomAvatar
} from '../data/progression';
import {
  canDualWieldPair,
  getMmWeaponById,
  MM_GRENADES,
  MM_PREBUILT_LOADOUTS,
  MM_SPECIAL_PERKS,
  MM_WEAPONS
} from '../data/weapons';
import { mmAudio } from '../engine/AudioEngine';
import { AvatarStudioCanvas, WeaponVectorIcon } from './AvatarPreviewCanvas';

/* ============================================================================
 * 1. AVATAR STUDIO MODAL (6 Saveable Presets + 6 Customization Layers)
 * ============================================================================ */
interface AvatarStudioProps {
  save: MiniMilitiaSave;
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onClose: () => void;
}

export const AvatarStudioModal: React.FC<AvatarStudioProps> = ({ save, onUpdateSave, onClose }) => {
  const [tab, setTab] = useState<'skin' | 'headgear' | 'eyewear' | 'facial' | 'outfit' | 'boots'>('headgear');
  const [pose, setPose] = useState<'idle' | 'crouch' | 'fly' | 'fire'>('idle');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const presetIdx = save.activeAvatarPreset;
  const avatar = save.avatarPresets[presetIdx] ?? save.avatarPresets[0];

  const isUnlocked = (id: string, costCash: number) =>
    costCash === 0 || save.proPackUnlocked || save.unlockedCosmeticIds.includes(id);

  const patchAvatar = (patch: Partial<MmAvatarConfig>) => {
    onUpdateSave((prev) => {
      const next = [...prev.avatarPresets];
      next[prev.activeAvatarPreset] = { ...next[prev.activeAvatarPreset], ...patch };
      return { ...prev, avatarPresets: next };
    });
  };

  const selectOrBuyCosmetic = (
    field: 'headgear' | 'eyewear' | 'facial' | 'outfit' | 'boots',
    id: string,
    costCash: number,
    label: string
  ) => {
    mmAudio.playClick();
    if (isUnlocked(id, costCash)) {
      patchAvatar({ [field]: id });
      setStatusMsg(`Equipped ${label}`);
      return;
    }
    if (save.cash < costCash) {
      setStatusMsg(`Need 💵 ${costCash} Cash (or unlock Pro Pack in Store)`);
      return;
    }
    onUpdateSave((prev) => {
      const next = [...prev.avatarPresets];
      next[prev.activeAvatarPreset] = { ...next[prev.activeAvatarPreset], [field]: id };
      return {
        ...prev,
        cash: prev.cash - costCash,
        unlockedCosmeticIds: [...prev.unlockedCosmeticIds, id],
        avatarPresets: next
      };
    });
    mmAudio.playPickup();
    setStatusMsg(`Unlocked & Equipped ${label}!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-[#F5A623]">
              🪖 AVATAR CUSTOMIZATION STUDIO
            </h2>
            <p className="text-[11px] font-mono text-[#C2B280]">
              6 Saveable Presets · 6 Tactical Layers · Cash: 💵 {save.cash}
              {save.proPackUnlocked ? ' · PRO PACK ALL UNLOCKED' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase"
          >
            Done
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 p-3 overflow-y-auto">
          {/* Left Preview + Presets */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <div className="h-[235px]">
              <AvatarStudioCanvas avatar={avatar} pose={pose} />
            </div>

            {/* Pose Buttons */}
            <div className="grid grid-cols-4 gap-1">
              {(['idle', 'crouch', 'fly', 'fire'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    setPose(p);
                  }}
                  className={`py-1 rounded text-[11px] font-mono uppercase border ${
                    pose === p
                      ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold'
                      : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Preset Slots 1-6 */}
            <div>
              <div className="text-[10px] font-mono uppercase text-[#C2B280] mb-1">
                SAVED PRESETS (1–6)
              </div>
              <div className="grid grid-cols-3 gap-1">
                {save.avatarPresets.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      mmAudio.playClick();
                      onUpdateSave((prev) => ({ ...prev, activeAvatarPreset: idx }));
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold truncate border ${
                      presetIdx === idx
                        ? 'bg-[#3E4A2E] border-[#F5A623] text-white'
                        : 'bg-[#23272A] border-[#3E4A2E] text-[#C2B280]'
                    }`}
                  >
                    #{idx + 1} {pr.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  const rnd = makeRandomAvatar(avatar.name);
                  patchAvatar({
                    skinTone: rnd.skinTone,
                    eyeStyle: rnd.eyeStyle,
                    headgear: isUnlocked(rnd.headgear, 99) ? rnd.headgear : 'army_helmet',
                    eyewear: isUnlocked(rnd.eyewear, 99) ? rnd.eyewear : 'aviators',
                    facial: isUnlocked(rnd.facial, 99) ? rnd.facial : 'sarge_stache',
                    outfit: isUnlocked(rnd.outfit, 99) ? rnd.outfit : 'olive_camo',
                    boots: isUnlocked(rnd.boots, 99) ? rnd.boots : 'steel'
                  });
                }}
                className="flex-1 py-1.5 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#5D7045] text-xs font-bold"
              >
                🎲 Randomize
              </button>
              <button
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  patchAvatar({
                    skinTone: '#F7CBA4',
                    eyeStyle: 'determined',
                    headgear: 'army_helmet',
                    eyewear: 'aviators',
                    facial: 'stubble',
                    outfit: 'olive_camo',
                    boots: 'steel'
                  });
                }}
                className="px-3 py-1.5 rounded bg-[#23272A] hover:bg-[#32383D] border border-[#525D64] text-xs font-mono"
              >
                Reset
              </button>
            </div>
            {statusMsg && (
              <div className="text-[11px] font-mono text-[#F5A623] bg-[#161B15] px-2 py-1 rounded border border-[#4F5D3B]">
                {statusMsg}
              </div>
            )}
          </div>

          {/* Right Customization Tabs */}
          <div className="md:col-span-8 flex flex-col gap-2 min-h-0">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
              {[
                { id: 'skin' as const, label: 'Skin/Eyes' },
                { id: 'headgear' as const, label: 'Headgear' },
                { id: 'eyewear' as const, label: 'Eyewear' },
                { id: 'facial' as const, label: 'Facial' },
                { id: 'outfit' as const, label: 'Outfit' },
                { id: 'boots' as const, label: 'Boots' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    setTab(t.id);
                  }}
                  className={`py-1.5 px-2 rounded text-xs font-black uppercase border ${
                    tab === t.id
                      ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                      : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B] hover:bg-[#2F363B]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2 rounded bg-[#161B17] border border-[#3E4A2E]">
              {tab === 'skin' && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-mono uppercase text-[#C2B280] mb-1.5">Skin Tone</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MM_SKIN_TONES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => patchAvatar({ skinTone: s.id })}
                          className={`p-2 rounded border text-center ${
                            avatar.skinTone === s.id
                              ? 'border-[#F5A623] bg-[#2A3320]'
                              : 'border-[#3E4A2E] bg-[#23272A]'
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-full mx-auto mb-1 border-2 border-[#111]"
                            style={{ backgroundColor: s.id }}
                          />
                          <div className="text-[11px] font-bold">{s.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#C2B280] mb-1.5">Eye Style</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MM_EYE_STYLES.map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => patchAvatar({ eyeStyle: e.id })}
                          className={`px-3 py-2 rounded border text-xs font-bold ${
                            avatar.eyeStyle === e.id
                              ? 'border-[#F5A623] bg-[#3E4A2E] text-white'
                              : 'border-[#3E4A2E] bg-[#23272A] text-[#C2B280]'
                          }`}
                        >
                          {e.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'headgear' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MM_HEADGEAR.map((item) => {
                    const unlocked = isUnlocked(item.id, item.costCash);
                    const equipped = avatar.headgear === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectOrBuyCosmetic('headgear', item.id, item.costCash, item.name)}
                        className={`p-2.5 rounded border text-left transition ${
                          equipped
                            ? 'border-[#F5A623] bg-[#3E4A2E]'
                            : 'border-[#3E4A2E] bg-[#23272A] hover:border-[#C2B280]'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] font-mono mt-0.5 text-[#C2B280]">
                          {equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : `🔒 💵 ${item.costCash}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'eyewear' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MM_EYEWEAR.map((item) => {
                    const unlocked = isUnlocked(item.id, item.costCash);
                    const equipped = avatar.eyewear === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectOrBuyCosmetic('eyewear', item.id, item.costCash, item.name)}
                        className={`p-2.5 rounded border text-left ${
                          equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] font-mono mt-0.5 text-[#C2B280]">
                          {equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : `🔒 💵 ${item.costCash}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'facial' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MM_FACIAL.map((item) => {
                    const unlocked = isUnlocked(item.id, item.costCash);
                    const equipped = avatar.facial === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectOrBuyCosmetic('facial', item.id, item.costCash, item.name)}
                        className={`p-2.5 rounded border text-left ${
                          equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'
                        }`}
                      >
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] font-mono mt-0.5 text-[#C2B280]">
                          {equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : `🔒 💵 ${item.costCash}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'outfit' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MM_OUTFITS.map((item) => {
                    const unlocked = isUnlocked(item.id, item.costCash);
                    const equipped = avatar.outfit === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectOrBuyCosmetic('outfit', item.id, item.costCash, item.name)}
                        className={`p-2.5 rounded border text-left flex items-center gap-2 ${
                          equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded border border-black shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.primary} 55%, ${item.secondary} 55%)`
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[10px] font-mono text-[#C2B280]">
                            {equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : `🔒 💵 ${item.costCash}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'boots' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MM_BOOTS.map((item) => {
                    const unlocked = isUnlocked(item.id, item.costCash);
                    const equipped = avatar.boots === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectOrBuyCosmetic('boots', item.id, item.costCash, item.name)}
                        className={`p-2.5 rounded border text-left flex items-center gap-2 ${
                          equipped ? 'border-[#F5A623] bg-[#3E4A2E]' : 'border-[#3E4A2E] bg-[#23272A]'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded border border-black shrink-0"
                          style={{
                            background: `linear-gradient(180deg, ${item.color} 55%, ${item.flame} 55%)`
                          }}
                        />
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[10px] font-mono text-[#C2B280]">
                            {equipped ? '✓ EQUIPPED' : unlocked ? 'OWNED' : `🔒 💵 ${item.costCash}`}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. ARMORY & LOADOUTS MODAL (All 25 Weapons + 8 Pre-Built + 3 Custom + 4 Perks)
 * ============================================================================ */
interface ArmoryProps {
  save: MiniMilitiaSave;
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onClose: () => void;
}

export const ArmoryModal: React.FC<ArmoryProps> = ({ save, onUpdateSave, onClose }) => {
  const [subTab, setSubTab] = useState<'loadouts' | 'custom' | 'weapons'>('loadouts');
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('m93ba');
  const [weaponCat, setWeaponCat] = useState<'all' | 'one_handed' | 'rifle_sniper' | 'heavy_special'>('all');
  const [customIdx, setCustomIdx] = useState(0);

  const selectedWeapon = getMmWeaponById(selectedWeaponId);
  const filteredWeapons =
    weaponCat === 'all' ? MM_WEAPONS : MM_WEAPONS.filter((w) => w.category === weaponCat);

  const activeCustom: MmLoadoutDef = save.customLoadouts[customIdx] ?? save.customLoadouts[0];

  const updateCustomLoadout = (patch: Partial<MmLoadoutDef>) => {
    onUpdateSave((prev) => {
      const next = [...prev.customLoadouts];
      const merged = { ...next[customIdx], ...patch };
      if (!canDualWieldPair(merged.primaryId, merged.secondaryId)) {
        merged.dualWieldStart = false;
      }
      next[customIdx] = merged;
      return { ...prev, customLoadouts: next };
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-[#F5A623]">
              🔫 TACTICAL ARMORY (25 WEAPONS · 11 LOADOUTS)
            </h2>
            <p className="text-[11px] font-mono text-[#C2B280]">
              Dual Wielding · Off-Hand Riot Shield · 4 Throwables · 4 Special Perks
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'loadouts' as const, label: 'Loadouts (8)' },
              { id: 'custom' as const, label: 'Custom Builder (3)' },
              { id: 'weapons' as const, label: 'Weapons (25)' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  setSubTab(t.id);
                }}
                className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${
                  subTab === t.id
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
          {/* SUBTAB 1: 8 PRE-BUILT + 3 CUSTOM LOADOUT SELECTOR */}
          {subTab === 'loadouts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[...MM_PREBUILT_LOADOUTS, ...save.customLoadouts].map((ld) => {
                const pW = getMmWeaponById(ld.primaryId);
                const sW = getMmWeaponById(ld.secondaryId);
                const perk = MM_SPECIAL_PERKS.find((pk) => pk.id === ld.perkId);
                const gren = MM_GRENADES.find((g) => g.id === ld.grenadeId);
                const equipped = save.activeLoadoutId === ld.id;
                return (
                  <div
                    key={ld.id}
                    className={`p-3 rounded border-2 flex flex-col justify-between gap-2 ${
                      equipped ? 'border-[#F5A623] bg-[#2D3822]' : 'border-[#434F37] bg-[#23272A]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-sm text-[#F4F4EC]">{ld.name}</span>
                        <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-[#181C1F] text-[#F5A623]">
                          {ld.coinCost === 0 ? 'FREE' : `🪙 ${ld.coinCost}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#C2B280] mt-0.5">{ld.desc}</p>
                      <div className="flex items-center gap-2 mt-2 bg-[#171B1E] p-1.5 rounded border border-[#36402B]">
                        <WeaponVectorIcon weaponId={ld.primaryId} width={76} height={28} />
                        <div className="text-[11px] font-mono leading-tight">
                          <div className="text-white font-bold">{pW.shortName}</div>
                          <div className="text-[#9CA3AF]">
                            + {sW.shortName}
                            {ld.dualWieldStart ? ' ⚡DW' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#A8B498] mt-1.5">
                        <span>
                          {gren?.icon} {ld.grenadeCount}x {gren?.shortName}
                        </span>
                        <span>
                          {perk?.icon} {perk?.name}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        mmAudio.playClick();
                        onUpdateSave((prev) => ({ ...prev, activeLoadoutId: ld.id }));
                      }}
                      className={`w-full py-1.5 rounded text-xs font-black uppercase ${
                        equipped
                          ? 'bg-[#22C55E] text-[#0F172A]'
                          : 'bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F]'
                      }`}
                    >
                      {equipped ? '✓ ACTIVE LOADOUT' : 'EQUIP LOADOUT'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* SUBTAB 2: 3 CUSTOM LOADOUT BUILDER */}
          {subTab === 'custom' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {save.customLoadouts.map((cl, idx) => (
                  <button
                    key={cl.id}
                    type="button"
                    onClick={() => {
                      mmAudio.playClick();
                      setCustomIdx(idx);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-black uppercase border ${
                      customIdx === idx
                        ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                        : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'
                    }`}
                  >
                    {cl.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    onUpdateSave((prev) => ({ ...prev, activeLoadoutId: activeCustom.id }));
                  }}
                  className="ml-auto px-3 py-1.5 rounded bg-[#22C55E] text-[#0F172A] text-xs font-black uppercase"
                >
                  {save.activeLoadoutId === activeCustom.id ? '✓ Equipped' : 'Set as Active'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Primary Weapon (All 25)
                  </label>
                  <select
                    value={activeCustom.primaryId}
                    onChange={(e) => updateCustomLoadout({ primaryId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white font-mono"
                  >
                    {MM_WEAPONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.oneHanded ? '1H Dual' : '2H'}) · DMG {w.damage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Secondary / Off-Hand Weapon
                  </label>
                  <select
                    value={activeCustom.secondaryId}
                    onChange={(e) => updateCustomLoadout({ secondaryId: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-[#181C1F] border border-[#5D7045] text-sm text-white font-mono"
                  >
                    {MM_WEAPONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.oneHanded ? '1H Dual' : '2H'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between px-3 py-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                  <div>
                    <div className="text-xs font-bold">Start Dual Wielding</div>
                    <div className="text-[10px] font-mono text-[#C2B280]">
                      {canDualWieldPair(activeCustom.primaryId, activeCustom.secondaryId)
                        ? 'Valid 1-Handed / Riot Shield pair!'
                        : 'Requires two 1-Handed weapons (max 1 Riot Shield).'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!canDualWieldPair(activeCustom.primaryId, activeCustom.secondaryId)}
                    checked={Boolean(activeCustom.dualWieldStart)}
                    onChange={(e) => updateCustomLoadout({ dualWieldStart: e.target.checked })}
                    className="w-5 h-5 accent-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Starting Throwable
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {MM_GRENADES.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => updateCustomLoadout({ grenadeId: g.id as MmGrenadeId })}
                        className={`py-1.5 rounded text-xs font-bold border ${
                          activeCustom.grenadeId === g.id
                            ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                            : 'bg-[#181C1F] text-[#C2B280] border-[#3E4A2E]'
                        }`}
                      >
                        {g.icon} {g.shortName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Special Tactical Perk
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {MM_SPECIAL_PERKS.map((pk) => (
                      <button
                        key={pk.id}
                        type="button"
                        onClick={() => updateCustomLoadout({ perkId: pk.id as MmSpecialPerkId })}
                        className={`p-2 rounded border text-left ${
                          activeCustom.perkId === pk.id
                            ? 'border-[#F5A623] bg-[#3E4A2E]'
                            : 'border-[#3E4A2E] bg-[#181C1F]'
                        }`}
                      >
                        <div className="text-xs font-black">
                          {pk.icon} {pk.name}
                        </div>
                        <div className="text-[10px] text-[#C2B280] mt-0.5">{pk.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: 25-WEAPON ENCYCLOPEDIA INSPECTOR */}
          {subTab === 'weapons' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-7 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all' as const, label: `All (${MM_WEAPONS.length})` },
                    { id: 'one_handed' as const, label: '1H / Dual Wield (10)' },
                    { id: 'rifle_sniper' as const, label: 'Rifles & Snipers (8)' },
                    { id: 'heavy_special' as const, label: 'Heavy & Special (7)' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setWeaponCat(c.id)}
                      className={`px-2 py-1 rounded text-[11px] font-mono border ${
                        weaponCat === c.id
                          ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A] font-bold'
                          : 'bg-[#23272A] text-[#C2B280] border-[#4F5D3B]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[370px] overflow-y-auto pr-1">
                  {filteredWeapons.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        mmAudio.playWeaponFire(w.id);
                        setSelectedWeaponId(w.id);
                      }}
                      className={`p-2 rounded border text-left transition ${
                        selectedWeaponId === w.id
                          ? 'border-[#F5A623] bg-[#334026]'
                          : 'border-[#3E4A2E] bg-[#23272A] hover:border-[#C2B280]'
                      }`}
                    >
                      <WeaponVectorIcon weaponId={w.id} width={80} height={28} />
                      <div className="text-xs font-bold truncate mt-1">{w.name}</div>
                      <div className="text-[10px] font-mono text-[#C2B280] flex justify-between">
                        <span>{w.oneHanded ? '1H DUAL' : '2H'}</span>
                        <span className="tabular-nums">DMG {w.damage}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inspector Panel */}
              <div className="lg:col-span-5 p-3 rounded bg-[#23272A] border-2 border-[#4F5D3B] flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-[#F5A623]">{selectedWeapon.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181C1F] border border-[#5D7045] text-[#C2B280] uppercase">
                      {selectedWeapon.fireMode}
                    </span>
                  </div>
                  <div className="my-2 p-3 rounded bg-[#161B18] border border-[#3E4A2E] flex items-center justify-center">
                    <WeaponVectorIcon weaponId={selectedWeapon.id} width={170} height={64} />
                  </div>
                  <p className="text-xs text-[#D6D3C4] mb-3">{selectedWeapon.desc}</p>

                  {/* Stat Bars */}
                  <div className="space-y-1.5 text-xs font-mono">
                    {[
                      { label: 'Damage', val: `${selectedWeapon.damage}${selectedWeapon.pellets > 1 ? ` ×${selectedWeapon.pellets}` : ''}`, pct: Math.min(100, (selectedWeapon.damage * selectedWeapon.pellets) / 1.5) },
                      { label: 'Fire Rate', val: `${selectedWeapon.rpm} RPM`, pct: Math.min(100, selectedWeapon.rpm / 12) },
                      { label: 'Magazine', val: `${selectedWeapon.magSize} / ${selectedWeapon.reserveMax}`, pct: Math.min(100, (selectedWeapon.magSize / 120) * 100) },
                      { label: 'Max Zoom', val: `${selectedWeapon.zoomMax.toFixed(1)}x`, pct: Math.min(100, (selectedWeapon.zoomMax / 7) * 100) },
                      { label: 'Mobility', val: `${Math.round(selectedWeapon.weightSpeedMult * 100)}%`, pct: selectedWeapon.weightSpeedMult * 100 }
                    ].map((st) => (
                      <div key={st.label}>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#C2B280]">{st.label}</span>
                          <span className="tabular-nums font-bold">{st.val}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#141719] rounded-sm overflow-hidden">
                          <div className="h-full bg-[#F5A623]" style={{ width: `${Math.max(8, st.pct)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => mmAudio.playWeaponFire(selectedWeapon.id)}
                  className="w-full py-2 rounded bg-[#2A3320] hover:bg-[#3A472D] border border-[#F5A623] text-xs font-black uppercase text-[#F5A623]"
                >
                  🔊 TEST FIRE SOUND
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. STORE MODAL (Pro Pack Free/Cash Toggle, Weapon Skins & Supply Crate)
 * ============================================================================ */
export const StoreModal: React.FC<{
  save: MiniMilitiaSave;
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onClose: () => void;
}> = ({ save, onUpdateSave, onClose }) => {
  const [crateResult, setCrateResult] = useState<string | null>(null);

  const spinCrate = () => {
    if (save.coins < 200) {
      setCrateResult('Need 🪙 200 Coins to open a Supply Crate!');
      return;
    }
    mmAudio.playPickup();
    const locked = [
      ...MM_HEADGEAR.map((x) => ({ id: x.id, name: x.name })),
      ...MM_OUTFITS.map((x) => ({ id: x.id, name: x.name })),
      ...MM_BOOTS.map((x) => ({ id: x.id, name: x.name }))
    ].filter((x) => !save.unlockedCosmeticIds.includes(x.id));

    if (locked.length > 0) {
      const reward = locked[Math.floor(Math.random() * locked.length)];
      onUpdateSave((prev) => ({
        ...prev,
        coins: prev.coins - 200,
        unlockedCosmeticIds: [...prev.unlockedCosmeticIds, reward.id]
      }));
      setCrateResult(`🎁 CRATE UNLOCKED: ${reward.name}!`);
    } else {
      onUpdateSave((prev) => ({
        ...prev,
        coins: prev.coins - 200,
        cash: prev.cash + 120
      }));
      setCrateResult('💵 JACKPOT DUPLICATE BONUS: +120 Military Cash!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-[#F5A623]">
              🛒 QUARTERMASTER STORE
            </h2>
            <p className="text-[11px] font-mono text-[#C2B280]">
              Coins: 🪙 {save.coins.toLocaleString()} · Cash: 💵 {save.cash.toLocaleString()} · Zero Real-Money Paywalls
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#D93829] hover:bg-[#EF4444] text-xs font-black uppercase"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* PRO PACK CARD */}
          <div className="p-4 rounded border-2 border-[#F5A623] bg-gradient-to-b from-[#333B25] to-[#1D2318] flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase text-[#F5A623]">SIGNATURE EDITION</div>
              <h3 className="text-lg font-black uppercase">⭐ MINI MILITIA PRO PACK</h3>
              <ul className="mt-2 space-y-1 text-xs text-[#E5E7EB]">
                <li>• Unlocks ALL 18 Headgear, 10 Eyewear, 10 Facial, 12 Outfits & 8 Rocket Boots</li>
                <li>• Dual-Wield & Heavy Weapon drops boosted in Custom Rooms</li>
                <li>• Earn with 💵 250 Cash OR activate instantly for free!</li>
              </ul>
            </div>
            <div className="flex gap-2">
              {save.proPackUnlocked ? (
                <div className="w-full py-2 rounded bg-[#22C55E] text-[#0F172A] text-center text-xs font-black uppercase">
                  ✓ PRO PACK ACTIVE
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={save.cash < 250}
                    onClick={() => {
                      mmAudio.playKillstreak();
                      onUpdateSave((prev) => ({
                        ...prev,
                        cash: Math.max(0, prev.cash - 250),
                        proPackUnlocked: true
                      }));
                    }}
                    className="flex-1 py-2 rounded bg-[#F5A623] disabled:opacity-45 text-[#181C1F] text-xs font-black uppercase"
                  >
                    Unlock (💵 250)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      mmAudio.playKillstreak();
                      onUpdateSave((prev) => ({ ...prev, proPackUnlocked: true }));
                    }}
                    className="px-3 py-2 rounded bg-[#2A3320] hover:bg-[#3A492C] border border-[#F5A623] text-xs font-black uppercase text-[#F5A623]"
                  >
                    Free Unlock
                  </button>
                </>
              )}
            </div>
          </div>

          {/* SUPPLY CRATE CARD */}
          <div className="p-4 rounded border-2 border-[#4F5D3B] bg-[#23272A] flex flex-col justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase text-[#C2B280]">DROP POD</div>
              <h3 className="text-lg font-black uppercase">🎁 TACTICAL SUPPLY CRATE</h3>
              <p className="text-xs text-[#C2B280] mt-1">
                Spend 200 Coins to roll an unowned Avatar Cosmetic or Military Cash bonus.
              </p>
              {crateResult && (
                <div className="mt-2 p-2 rounded bg-[#161B18] border border-[#F5A623] text-xs font-mono text-[#F5A623]">
                  {crateResult}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={spinCrate}
              className="w-full py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] text-xs font-black uppercase"
            >
              OPEN CRATE (🪙 200)
            </button>
          </div>

          {/* CURRENCY EXCHANGE & WEAPON SKINS */}
          <div className="md:col-span-2 p-3 rounded bg-[#23272A] border border-[#4F5D3B]">
            <div className="text-xs font-black uppercase text-[#C2B280] mb-2">
              TACTICAL BUNDLES & CAMO SKINS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'skin_gold_ak',
                  title: 'Gold-Plated AK-47',
                  cost: 120,
                  weaponId: 'ak47',
                  tint: 'gold'
                },
                {
                  id: 'skin_tiger_m93',
                  title: 'Arctic Tiger M93BA',
                  cost: 150,
                  weaponId: 'm93ba',
                  tint: 'arctic'
                },
                {
                  id: 'skin_cyber_uzi',
                  title: 'Neon Cyber Uzi',
                  cost: 110,
                  weaponId: 'uzi',
                  tint: 'cyber'
                }
              ].map((sk) => {
                const owned = Boolean(save.unlockedWeaponSkins[sk.weaponId]);
                return (
                  <div key={sk.id} className="p-2.5 rounded bg-[#181C1F] border border-[#3E4A2E]">
                    <WeaponVectorIcon weaponId={sk.weaponId} width={86} height={32} />
                    <div className="text-xs font-bold mt-1">{sk.title}</div>
                    <button
                      type="button"
                      disabled={owned || save.cash < sk.cost}
                      onClick={() => {
                        mmAudio.playPickup();
                        onUpdateSave((prev) => ({
                          ...prev,
                          cash: prev.cash - sk.cost,
                          unlockedWeaponSkins: { ...prev.unlockedWeaponSkins, [sk.weaponId]: sk.tint }
                        }));
                      }}
                      className={`mt-2 w-full py-1 rounded text-[11px] font-black uppercase ${
                        owned
                          ? 'bg-[#22C55E] text-[#0F172A]'
                          : 'bg-[#2A3320] hover:bg-[#3A4A2B] border border-[#F5A623] text-[#F5A623] disabled:opacity-45'
                      }`}
                    >
                      {owned ? '✓ OWNED' : `BUY · 💵 ${sk.cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
