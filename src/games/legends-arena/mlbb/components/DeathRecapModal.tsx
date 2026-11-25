import React from 'react';
import { MlbbDeathRecap } from '../types';
import { HeroPortraitSvg } from './HeroAvatarSvg';

interface DeathRecapModalProps {
  recap: MlbbDeathRecap;
  respawnSec: number;
  onOpenShop: () => void;
  onClose: () => void;
}

export const DeathRecapModal: React.FC<DeathRecapModalProps> = ({
  recap,
  respawnSec,
  onOpenShop,
  onClose
}) => {
  const physPct = Math.round(recap.physicalPct);
  const magicPct = Math.round(recap.magicPct);
  const truePct = Math.round(recap.truePct);

  const counterTip =
    physPct >= 55
      ? 'Counter-build tip: Consider Antique Cuirass, Dominance Ice, or Blade Armor.'
      : magicPct >= 55
        ? 'Counter-build tip: Consider Athena\'s Shield or Radiant Armor.'
        : 'Counter-build tip: True/Mixed burst — stack Max HP (Guardian Helmet / Immortality).';

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/70 flex items-center justify-center p-3" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#0B132B] border-2 border-rose-500/75 p-4 text-slate-100 shadow-2xl space-y-3"
      >
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
          <div className="flex items-center gap-2.5">
            {recap.killerHeroId !== 'environment' ? (
              <HeroPortraitSvg heroId={recap.killerHeroId} size={40} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-400 flex items-center justify-center text-lg">
                🏰
              </div>
            )}
            <div>
              <div className="text-xs font-black tracking-wider text-rose-400 uppercase">
                Death Damage Recap
              </div>
              <div className="text-sm font-black text-white">
                Eliminated by {recap.killerName} ·{' '}
                <span className="text-amber-300 mlbb-num">{recap.totalDamage.toLocaleString()} DMG</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Physical / Magic / True Stacked Bar + Explicit Non-Hue Labels */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-full rounded-full bg-slate-900 overflow-hidden flex border border-slate-700">
            {physPct > 0 && <div className="h-full bg-orange-400" style={{ width: `${physPct}%` }} />}
            {magicPct > 0 && <div className="h-full bg-purple-400" style={{ width: `${magicPct}%` }} />}
            {truePct > 0 && <div className="h-full bg-slate-100" style={{ width: `${truePct}%` }} />}
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-black mlbb-num">
            <div className="px-2 py-1 rounded-lg bg-orange-950/60 border border-orange-400/40 text-orange-300 text-center">
              PHYS {physPct}%
            </div>
            <div className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-400/40 text-purple-300 text-center">
              MAGIC {magicPct}%
            </div>
            <div className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-500/50 text-slate-100 text-center">
              TRUE {truePct}%
            </div>
          </div>
        </div>

        {/* Total Crowd Control (CC) Duration Suffered */}
        <div className="px-2.5 py-2 rounded-xl bg-amber-950/35 border border-amber-400/45 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          <div className="font-black text-amber-200 flex items-center gap-1.5">
            <span>⛓️</span>
            <span>TOTAL CC SUFFERED:</span>
            <span className="text-amber-300 mlbb-num text-xs">
              {(recap.totalCcSec ?? 0).toFixed(1)}s
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recap.ccBreakdown && recap.ccBreakdown.length > 0 ? (
              recap.ccBreakdown.slice(0, 4).map((cc) => (
                <span
                  key={cc.ccType}
                  className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-amber-400/40 text-[10px] font-black text-amber-100 uppercase mlbb-num"
                >
                  {cc.ccType} {cc.durationSec.toFixed(1)}s
                </span>
              ))
            ) : (
              <span className="text-[10px] font-bold text-slate-400">None</span>
            )}
          </div>
        </div>

        {/* Top 3 Damage Sources */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
            Top Damage Contributors
          </div>
          {recap.contributors.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-slate-900/80 text-xs text-slate-400 text-center">
              No damage events logged before elimination.
            </div>
          ) : (
            recap.contributors.map((src, idx) => {
              const domType =
                src.trueDmg >= src.physical && src.trueDmg >= src.magic && src.trueDmg > 0
                  ? 'true'
                  : src.magic > src.physical
                    ? 'magic'
                    : 'physical';
              const skillSummary =
                src.topSkills.length > 0
                  ? src.topSkills.map((s) => `${s.name} (${s.damage})`).join(' · ')
                  : 'Combat Damage';
              return (
                <div
                  key={`${src.attackerId}_${idx}`}
                  className="p-2 rounded-xl bg-[#101C3D] border border-slate-700/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {src.heroId !== 'environment' ? (
                      <HeroPortraitSvg heroId={src.heroId} size={28} />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-sm">
                        🏰
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="font-black text-white truncate">{src.attackerName}</div>
                      <div className="text-[10px] text-slate-300 truncate">{skillSummary}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 mlbb-num">
                    <div className="font-black text-amber-300">{Math.round(src.totalDamage).toLocaleString()}</div>
                    <div
                      className={`text-[10px] font-black uppercase ${
                        domType === 'physical'
                          ? 'text-orange-300'
                          : domType === 'magic'
                            ? 'text-purple-300'
                            : 'text-slate-100'
                      }`}
                    >
                      {domType} ({Math.round(src.sharePct)}%)
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Counter-build recommendation + Quick Shop button */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-[#F5C451]/35 text-[11px] text-slate-200">
          {counterTip}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="text-xs font-black text-rose-300 mlbb-num">
            {respawnSec > 0 ? `Respawn in ${respawnSec}s` : 'Respawned'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenShop();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#F5C451] text-slate-950 font-black text-xs cursor-pointer"
            >
              🛒 Counter-Build Shop
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
