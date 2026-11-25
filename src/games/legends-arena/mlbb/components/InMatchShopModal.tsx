import React, { useMemo, useState } from 'react';
import { MlbbHudSnapshot, MlbbItemCategory, MlbbItemDef } from '../types';
import {
  MLBB_ITEMS,
  MlbbCraftingTreeNode,
  computeMlbbEffectiveCost,
  computeMlbbSellRefund,
  getItemCraftingTree,
  getMlbbItemById
} from '../data/items';
import { mlbbAudio } from '../engine/AudioEngine';

type ShopTab = 'recommended' | MlbbItemCategory;

const STAT_LABELS: Record<string, [string, boolean]> = {
  physAtk: ['Physical ATK', false],
  magicPow: ['Magic Power', false],
  adaptiveAtk: ['Adaptive ATK', false],
  maxHp: ['Max HP', false],
  maxMana: ['Max Mana', false],
  manaRegen: ['Mana Regen', false],
  physDef: ['Physical DEF', false],
  magicDef: ['Magic DEF', false],
  moveSpd: ['Move Speed', false],
  moveSpdPct: ['Move Speed', true],
  atkSpdPct: ['Attack Speed', true],
  critChance: ['Crit Chance', true],
  critDmgPct: ['Crit Damage', true],
  cdrPct: ['CD Reduction', true],
  lifestealPct: ['Lifesteal', true],
  spellVampPct: ['Spell Vamp', true],
  flatPhysPen: ['Physical PEN', false],
  pctPhysPen: ['Physical PEN', true],
  flatMagicPen: ['Magic PEN', false],
  pctMagicPen: ['Magic PEN', true],
  ccResPct: ['CC Resilience', true],
  hpRegen: ['HP Regen', false],
  healEffectPct: ['Healing Effect', true]
};

function formatStatLine(key: string, val: number): string {
  const meta = STAT_LABELS[key];
  if (!meta) return `+${val} ${key}`;
  const [label, isPct] = meta;
  if (isPct) {
    const shown = val > 0 && val < 1 ? Math.round(val * 100) : val;
    return `+${shown}% ${label}`;
  }
  return `+${val} ${label}`;
}

const SHOP_CATEGORIES: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'recommended', label: 'Recommended', icon: '★' },
  { id: 'attack', label: 'Attack', icon: '⚔️' },
  { id: 'magic', label: 'Magic', icon: '🔮' },
  { id: 'defense', label: 'Defense', icon: '🛡️' },
  { id: 'movement', label: 'Movement', icon: '👢' },
  { id: 'jungling', label: 'Jungling', icon: '🐺' },
  { id: 'roaming', label: 'Roaming', icon: '🧭' },
  { id: 'consumable', label: 'Potions', icon: '🧪' },
  { id: 'unique', label: 'Unique', icon: '🪷' }
];

const CraftingNodeCard: React.FC<{
  node: MlbbCraftingTreeNode;
  selectedId: string;
  gold: number;
  onSelect: (id: string) => void;
}> = ({ node, selectedId, gold, onSelect }) => {
  const isSel = selectedId === node.item.id;
  const canAfford = gold >= node.effectiveCost;
  return (
    <button
      type="button"
      onClick={() => {
        mlbbAudio.playClick();
        onSelect(node.item.id);
      }}
      className={`px-2 py-1 rounded-lg border text-left transition-colors cursor-pointer min-w-[92px] ${
        node.owned
          ? 'bg-emerald-950/70 border-emerald-400/70 text-emerald-100'
          : isSel
            ? 'bg-amber-500/25 border-[#F5C451] text-white'
            : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-1">
        <span className="text-sm leading-none">{node.item.icon}</span>
        <span className="text-[10px] font-black truncate max-w-[68px]">{node.item.shortName}</span>
      </div>
      <div className="flex items-center justify-between mt-0.5 text-[9px] font-bold mlbb-num">
        <span className="text-slate-400">T{node.item.tier}</span>
        {node.owned ? (
          <span className="text-emerald-300">OWNED ✓</span>
        ) : (
          <span className={canAfford ? 'text-amber-300' : 'text-slate-400'}>{node.effectiveCost}g</span>
        )}
      </div>
    </button>
  );
};

export const InMatchShopModal: React.FC<{
  snap: MlbbHudSnapshot;
  builds: [string[], string[], string[]];
  uiOpacity?: number;
  hasBargainHunter?: boolean;
  onBuy: (itemId: string) => void;
  onSell: (slotIndex: number) => void;
  onPrioritize: (itemId: string | null) => void;
  onSwitchBuild: (idx: 0 | 1 | 2) => void;
  onPingNeedGold?: (itemId: string) => void;
  onClose: () => void;
}> = ({
  snap,
  builds,
  uiOpacity = 0.94,
  hasBargainHunter = false,
  onBuy,
  onSell,
  onPrioritize,
  onSwitchBuild,
  onPingNeedGold,
  onClose
}) => {
  const activePlanIds = builds[snap.player.activeBuildIdx] ?? builds[0] ?? [];
  const [cat, setCat] = useState<ShopTab>('recommended');
  const [selectedId, setSelectedId] = useState<string>(activePlanIds[0] ?? 'blade_of_despair');
  const [peekMode, setPeekMode] = useState(false);

  const discountRate = hasBargainHunter ? 0.05 : 0;

  const itemsInView: MlbbItemDef[] = useMemo(() => {
    if (cat === 'recommended') {
      const planDefs = activePlanIds
        .map((id) => getMlbbItemById(id))
        .filter((x): x is MlbbItemDef => Boolean(x));
      if (planDefs.length > 0) return planDefs;
      return MLBB_ITEMS.filter((i) => i.tier === 3).slice(0, 6);
    }
    return MLBB_ITEMS.filter((i) => i.category === cat).sort((a, b) => b.tier - a.tier || a.cost - b.cost);
  }, [cat, activePlanIds]);

  const selected = getMlbbItemById(selectedId) ?? itemsInView[0];
  const costCalc = selected
    ? computeMlbbEffectiveCost(selected.id, snap.player.items, discountRate)
    : { effectiveCost: 0, consumedIndices: [] };
  const effCost = costCalc.effectiveCost;
  const savedGold = selected ? Math.max(0, selected.cost - effCost) : 0;
  const missingGold = Math.max(0, effCost - snap.player.gold);

  const craftingTree = useMemo(
    () => (selected ? getItemCraftingTree(selected.id, snap.player.items, discountRate) : null),
    [selected, snap.player.items, discountRate]
  );

  // Sync panel opacity with Settings -> Interface -> Battlefield UI Opacity
  const effectiveOpacity = peekMode ? 0.52 : Math.max(0.55, Math.min(0.98, uiOpacity));
  const activeBlessing = snap.player.blessingId ? getMlbbItemById(snap.player.blessingId) : null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-2.5 sm:p-4 pointer-events-auto bg-slate-950/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: effectiveOpacity }}
        className="w-full max-w-5xl max-h-[88vh] rounded-2xl bg-[#071022]/96 backdrop-blur-md border-2 border-[#F5C451]/70 flex flex-col overflow-hidden text-slate-100 shadow-2xl transition-opacity"
      >
        {/* Top Bar: Title, Live Gold, Build Plan Switcher, Bargain Hunter Tag, Opacity Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#0E1B3B] border-b border-[#F5C451]/35">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-black tracking-wide text-[#F5C451]">SHOP ANYWHERE</span>
            <span className="text-sm font-black text-amber-300 mlbb-num">
              🪙 {snap.player.gold.toLocaleString()}
            </span>
            {hasBargainHunter && (
              <span className="text-[10px] font-black text-emerald-300 tracking-wide">
                BARGAIN HUNTER -5%
              </span>
            )}
            <div className="flex items-center gap-1">
              {([0, 1, 2] as const).map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    mlbbAudio.playClick();
                    onSwitchBuild(idx);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${
                    snap.player.activeBuildIdx === idx
                      ? 'bg-[#F5C451] text-slate-950'
                      : 'bg-slate-800/90 text-slate-300 hover:text-white'
                  }`}
                >
                  Plan {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] font-bold text-slate-400 mlbb-num">
              UI Opacity {Math.round(effectiveOpacity * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setPeekMode((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                peekMode
                  ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Toggle Transparent Map Peek"
            >
              👁️ {peekMode ? 'Restore' : 'Peek Map'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 font-black cursor-pointer"
              title="Close Shop (P)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main 3-Column Body */}
        <div className="flex flex-1 min-h-0">
          {/* Column 1: Left Category Rail */}
          <div className="w-28 sm:w-32 bg-[#060C1D] border-r border-slate-800 p-2 space-y-1 overflow-y-auto shrink-0">
            {SHOP_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  mlbbAudio.playClick();
                  setCat(c.id);
                }}
                className={`w-full px-2.5 py-2 rounded-lg text-left text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-colors ${
                  cat === c.id
                    ? 'bg-[#F5C451] text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <span className="text-xs">{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>

          {/* Column 2: Item Grid + Interactive 3-Tier Visual Crafting Tree */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 p-3 overflow-y-auto">
              {cat === 'recommended' && (
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-black text-[#F5C451] uppercase">
                    Active Build Plan #{snap.player.activeBuildIdx + 1} (6 Core Slots)
                  </span>
                  <span className="text-slate-400">Tap any item to view its 3-Tier Crafting Tree</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemsInView.map((it, idx) => {
                  const eff = computeMlbbEffectiveCost(it.id, snap.player.items, discountRate).effectiveCost;
                  const owned = snap.player.items.includes(it.id) || snap.player.blessingId === it.id;
                  const isPrio = snap.player.prioritizedItemId === it.id;
                  const canAfford = snap.player.gold >= eff;
                  return (
                    <button
                      key={`${it.id}_${idx}`}
                      type="button"
                      onClick={() => {
                        mlbbAudio.playClick();
                        setSelectedId(it.id);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                        selected?.id === it.id
                          ? 'bg-amber-500/20 border-[#F5C451]'
                          : owned
                            ? 'bg-emerald-950/35 border-emerald-500/45'
                            : 'bg-[#0F1B3B] border-slate-700/90 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{it.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1">
                          <span className="truncate">{it.name}</span>
                          {isPrio && <span className="text-sky-300 shrink-0">★</span>}
                        </div>
                        <div className="flex items-center justify-between mt-0.5 text-[10px] font-bold mlbb-num">
                          <span className={owned ? 'text-emerald-300' : canAfford ? 'text-amber-300' : 'text-slate-400'}>
                            {owned ? 'EQUIPPED ✓' : eff === 0 ? 'FREE' : `${eff}g`}
                          </span>
                          <span className="text-slate-400">T{it.tier}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive 3-Tier Visual Crafting Tree Drawer */}
            {craftingTree && craftingTree.children.length > 0 && (
              <div className="px-3 py-2.5 bg-[#081229] border-t border-[#F5C451]/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-[#F5C451] uppercase tracking-wider">
                    3-Tier Interactive Crafting Tree — Auto Component Gold Credit
                  </span>
                  {savedGold > 0 && (
                    <span className="text-[10px] font-black text-emerald-300 mlbb-num">
                      Saved {savedGold}g from Components{hasBargainHunter ? ' + BH' : ''}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1.5 overflow-x-auto pb-1">
                  {/* Tier 3 / Root Node */}
                  <CraftingNodeCard
                    node={craftingTree}
                    selectedId={selected?.id ?? ''}
                    gold={snap.player.gold}
                    onSelect={setSelectedId}
                  />

                  <div className="w-px h-2.5 bg-[#F5C451]/50" />

                  {/* Tier 2 Children + Their Tier 1 Sub-Components */}
                  <div className="flex items-start justify-center gap-3 flex-wrap">
                    {craftingTree.children.map((t2Node, i) => (
                      <div key={`${t2Node.item.id}_${i}`} className="flex flex-col items-center gap-1">
                        <CraftingNodeCard
                          node={t2Node}
                          selectedId={selected?.id ?? ''}
                          gold={snap.player.gold}
                          onSelect={setSelectedId}
                        />
                        {t2Node.children.length > 0 && (
                          <>
                            <div className="w-px h-2 bg-slate-600" />
                            <div className="flex items-center gap-1">
                              {t2Node.children.map((t1Node, j) => (
                                <CraftingNodeCard
                                  key={`${t1Node.item.id}_${j}`}
                                  node={t1Node}
                                  selectedId={selected?.id ?? ''}
                                  gold={snap.player.gold}
                                  onSelect={setSelectedId}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Right Tactical Inspector (Stats, Unique Passives, Buy, Prioritize, Gold Ping) */}
          {selected && (
            <div className="w-64 sm:w-72 bg-[#0B1633] border-l border-slate-800 p-3 flex flex-col justify-between text-xs shrink-0">
              <div className="space-y-2.5 overflow-y-auto pr-0.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-[#F5C451]/50 flex items-center justify-center text-3xl shrink-0">
                    {selected.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-white text-sm leading-tight truncate">{selected.name}</div>
                    <div className="text-amber-300 font-black mlbb-num mt-0.5">
                      {effCost === 0 ? 'FREE BLESSING' : `${effCost.toLocaleString()} Gold`}
                      {savedGold > 0 && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">{selected.cost}g</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabular Attribute Breakdown */}
                {Object.keys(selected.stats).length > 0 && (
                  <div className="space-y-0.5 text-[11px] font-bold text-emerald-300 mlbb-num">
                    {Object.entries(selected.stats).map(([k, v]) =>
                      typeof v === 'number' && v !== 0 ? (
                        <div key={k}>{formatStatLine(k, v)}</div>
                      ) : null
                    )}
                  </div>
                )}

                {selected.activeName && (
                  <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-400/45 text-[11px]">
                    <div className="font-black text-cyan-300">
                      ACTIVE: {selected.activeName} ({selected.activeCd ?? 70}s CD)
                    </div>
                  </div>
                )}

                {selected.consumableDurationSec && (
                  <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-400/50 text-[10px] font-bold text-purple-200">
                    🧪 Instant {selected.consumableDurationSec}s Potion Surge — Does not occupy an equipment slot.
                  </div>
                )}

                {selected.passiveDesc && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-200 leading-relaxed">
                    <div className="font-black text-[#F5C451] mb-0.5">
                      Unique Passive — {selected.passiveName ?? 'Effect'}
                    </div>
                    <div>{selected.passiveDesc}</div>
                    {selected.uniquePassives && selected.uniquePassives.length > 0 && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Non-Stacking Key: {selected.uniquePassives.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Prioritize, Ping Gold Needed, Buy */}
              <div className="space-y-1.5 pt-2.5 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      mlbbAudio.playClick();
                      onPrioritize(snap.player.prioritizedItemId === selected.id ? null : selected.id);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-black cursor-pointer ${
                      snap.player.prioritizedItemId === selected.id
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
                    }`}
                  >
                    {snap.player.prioritizedItemId === selected.id ? '★ Prioritized' : '☆ Prioritize'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onPingNeedGold?.(selected.id)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-amber-500/25 border border-amber-400/40 text-[10px] font-black text-amber-200 cursor-pointer mlbb-num truncate"
                    title={
                      missingGold > 0
                        ? `Broadcast: Need ${missingGold} more Gold for ${selected.name}!`
                        : `Broadcast: Ready to buy ${selected.name}!`
                    }
                  >
                    📣 {missingGold > 0 ? `Need ${missingGold}g` : 'Ping Ready'}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={snap.player.gold < effCost}
                  onClick={() => onBuy(selected.id)}
                  className={`w-full py-2.5 rounded-xl font-black text-xs tracking-wide cursor-pointer mlbb-num ${
                    snap.player.gold >= effCost
                      ? 'bg-gradient-to-r from-[#F5C451] to-[#EAB308] text-slate-950 hover:brightness-110'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {effCost === 0
                    ? `EQUIP ${selected.shortName.toUpperCase()}`
                    : snap.player.gold >= effCost
                      ? `BUY ${selected.shortName.toUpperCase()} (${effCost}g)`
                      : `NEED ${missingGold} MORE GOLD`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom 6-Slot Equipped Inventory Bar (1-Click Sell 60% Refund) + Blessing Status */}
        <div className="px-4 py-2.5 bg-[#060C1D] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
              Equipped (Tap to Sell 60%):
            </span>
            {[0, 1, 2, 3, 4, 5].map((slot) => {
              const id = snap.player.items[slot];
              const it = id ? getMlbbItemById(id) : null;
              const refund = it ? computeMlbbSellRefund(it.id) : 0;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!it}
                  onClick={() => it && onSell(slot)}
                  title={it ? `Sell ${it.name} for +${refund}g (60% refund)` : 'Empty Equipment Slot'}
                  className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center ${
                    it
                      ? 'bg-[#0F1B3B] border-slate-600 hover:border-rose-400 cursor-pointer'
                      : 'bg-slate-950/70 border-slate-800 cursor-default'
                  }`}
                >
                  <span className="text-lg leading-none">{it?.icon ?? '·'}</span>
                  {it && <span className="text-[8px] font-black text-amber-300 mlbb-num">+{refund}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {activeBlessing && (
              <span className="font-black text-cyan-300">
                {activeBlessing.icon} {activeBlessing.shortName}
              </span>
            )}
            <span className="text-slate-400 hidden sm:inline">
              Plan #{snap.player.activeBuildIdx + 1}:{' '}
              {activePlanIds.map((id) => getMlbbItemById(id)?.icon ?? '').join(' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
