import React from 'react';
import { MlbbActiveBuffHud, MlbbHudSnapshot } from '../types';

/**
 * Circular/Badge Active Buff or Debuff icon with SVG radial countdown clock sweep.
 */
export const BuffRadialBadge: React.FC<{ buff: MlbbActiveBuffHud }> = ({ buff }) => {
  const ratio = Math.max(0, Math.min(1, buff.remaining / Math.max(0.1, buff.max)));
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div
      title={`${buff.label} (${Math.ceil(buff.remaining)}s remaining)`}
      className="relative w-10 h-10 rounded-full bg-[#0B132B]/92 flex flex-col items-center justify-center shadow-lg select-none"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="rgba(15,23,42,0.85)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={buff.color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-sm leading-none relative z-10">{buff.icon}</span>
      <span className="text-[8px] font-black text-white leading-none mt-0.5 mlbb-num relative z-10">
        {Math.ceil(buff.remaining)}s
      </span>
    </div>
  );
};

/**
 * Non-blocking Animated 5-Slot Surrender Vote HUD Bar (Unlocks at 06:00).
 */
export const SurrenderVoteBar: React.FC<{
  vote: NonNullable<MlbbHudSnapshot['surrenderVote']>;
}> = ({ vote }) => {
  const statusText =
    vote.status === 'passed'
      ? 'SURRENDER PASSED'
      : vote.status === 'failed'
        ? 'SURRENDER FAILED'
        : `SURRENDER VOTE (${vote.yes}/5)`;

  const borderCls =
    vote.status === 'passed'
      ? 'border-rose-400'
      : vote.status === 'failed'
        ? 'border-amber-400'
        : 'border-[#F5C451]/80';

  return (
    <div
      className={`pointer-events-auto px-3.5 py-2 rounded-2xl bg-[#0B132B]/95 border-2 ${borderCls} shadow-2xl flex items-center gap-3`}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-black tracking-wider text-[#F5C451] uppercase">{statusText}</span>
        <span className="text-[10px] font-bold text-slate-300 mlbb-num">
          {vote.status === 'voting' ? `${Math.ceil(vote.remainingSec)}s remaining` : `${vote.yes} Agree · ${vote.no} Refuse`}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {vote.slots.map((slot, idx) => (
          <div
            key={idx}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${
              slot === 'yes'
                ? 'bg-emerald-500/90 border-emerald-200 text-slate-950 scale-105'
                : slot === 'no'
                  ? 'bg-rose-600/90 border-rose-200 text-white scale-105'
                  : 'bg-slate-900 border-slate-600 text-slate-400 animate-pulse'
            }`}
            title={
              idx === 0
                ? 'Your Vote: Agree'
                : slot === 'yes'
                  ? `Ally ${idx}: Agreed`
                  : slot === 'no'
                    ? `Ally ${idx}: Refused`
                    : `Ally ${idx}: Deciding...`
            }
          >
            {slot === 'yes' ? '✓' : slot === 'no' ? '✕' : '·'}
          </div>
        ))}
      </div>
    </div>
  );
};
