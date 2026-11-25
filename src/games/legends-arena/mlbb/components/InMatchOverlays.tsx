import React, { useState } from 'react';
import {
  MlbbHudSnapshot,
  MlbbMatchRecord,
  MlbbProfileSave
} from '../types';
import { getMlbbItemById } from '../data/items';
import { getMlbbBattleSpellById, getMlbbEmblemById, MLBB_RANK_TIERS } from '../data/emblems';
import { formatClock } from '../data/mapData';
import { HeroPortraitSvg, RankCrestSvg } from './HeroAvatarSvg';
import { mlbbAudio } from '../engine/AudioEngine';

export { InMatchShopModal } from './InMatchShopModal';

/* ==================== 2. 3-TAB 10-PLAYER SCOREBOARD MODAL ==================== */
export const InMatchScoreboardModal: React.FC<{
  snap: MlbbHudSnapshot;
  uiOpacity?: number;
  onSignalTarget?: (heroId: string, kind: 'focus' | 'no_spell') => void;
  onClose: () => void;
}> = ({ snap, uiOpacity = 0.92, onSignalTarget, onClose }) => {
  const [tab, setTab] = useState<'equipment' | 'data' | 'attributes'>('equipment');
  const [mutedIds, setMutedIds] = useState<string[]>([]);

  const blue = snap.scoreboard.filter((p) => p.team === 'blue');
  const red = snap.scoreboard.filter((p) => p.team === 'red');
  const cardOpacity = Math.max(0.55, Math.min(0.98, uiOpacity));

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/45 flex items-center justify-center p-3" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ opacity: cardOpacity }}
        className="w-full max-w-5xl max-h-[86vh] rounded-2xl bg-[#0B132B]/95 backdrop-blur-sm border-2 border-[#F5C451]/60 flex flex-col overflow-hidden text-slate-100 shadow-2xl transition-opacity"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#101C3D] border-b border-[#F5C451]/30">
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-sky-400 mlbb-num">{snap.blueKills}</span>
            <span className="text-xs font-black text-[#F5C451] mlbb-num">{formatClock(snap.matchTimeSec)}</span>
            <span className="text-base font-black text-rose-400 mlbb-num">{snap.redKills}</span>
            <div className="flex gap-1 ml-3">
              {(['equipment', 'data', 'attributes'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase cursor-pointer ${
                    tab === t ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 font-black cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {tab === 'attributes' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                ['Health (HP)', `${snap.player.hp} / ${snap.player.maxHp}`],
                [
                  snap.player.resource === 'energy' ? 'Energy' : 'Mana',
                  snap.player.resource === 'none' ? 'No Cost' : `${snap.player.mana} / ${snap.player.maxMana}`
                ],
                ['Physical Attack', snap.player.stats.physAtk],
                ['Magic Power', snap.player.stats.magicPow],
                ['Physical Defense', snap.player.stats.physDef],
                ['Magic Defense', snap.player.stats.magicDef],
                ['Flat / % Phys PEN', `${snap.player.stats.flatPhysPen} / ${Math.round(snap.player.stats.pctPhysPen * 100)}%`],
                ['Flat / % Magic PEN', `${snap.player.stats.flatMagicPen} / ${Math.round(snap.player.stats.pctMagicPen * 100)}%`],
                ['Attack Speed', snap.player.stats.atkSpd.toFixed(2)],
                ['Crit Chance', `${Math.round(snap.player.stats.critChance * 100)}%`],
                ['Cooldown Reduction', `${Math.round(snap.player.stats.cdrPct * 100)}%`],
                ['Movement Speed', snap.player.stats.moveSpd],
                ['Lifesteal / Spell Vamp', `${Math.round(snap.player.stats.lifestealPct * 100)}% / ${Math.round(snap.player.stats.spellVampPct * 100)}%`],
                ['Level / Total Gold', `Lv.${snap.player.level} · ${snap.player.totalGold}g`]
              ].map(([label, val]) => (
                <div key={String(label)} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex justify-between">
                  <span className="text-slate-400 font-bold">{label}</span>
                  <span className="font-black text-[#F5C451] mlbb-num">{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(
                [
                  ['ALLIES (BLUE)', blue, 'border-sky-500/40'],
                  ['ENEMIES (RED)', red, 'border-rose-500/40']
                ] as const
              ).map(([title, teamList, borderCol]) => (
                <div key={title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>{title}</span>
                    {title.startsWith('ENEMIES') && (
                      <span className="text-[10px] font-bold text-amber-300">
                        Click spell icon to announce &amp; track CD
                      </span>
                    )}
                  </div>
                  {teamList.map((pl) => {
                    const tracked = snap.trackedEnemySpells?.find((t) => t.heroId === pl.id);
                    return (
                    <div
                      key={pl.id}
                      className={`p-2 rounded-xl bg-[#101C3D] border ${pl.isPlayer ? 'border-[#F5C451]' : borderCol} flex items-center justify-between gap-2 text-xs`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (pl.team === 'red' && onSignalTarget) onSignalTarget(pl.id, 'focus');
                          }}
                          title={pl.team === 'red' ? `Ping team: Focus ${pl.heroName}!` : pl.heroName}
                          className={pl.team === 'red' ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-default'}
                        >
                          <HeroPortraitSvg heroId={pl.heroId} size={34} />
                        </button>
                        <div className="min-w-0">
                          <div className="font-black text-white truncate">
                            {pl.heroName} <span className="text-[10px] text-amber-300 mlbb-num">Lv.{pl.level}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            <span>{pl.name} ·</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (pl.team === 'red' && onSignalTarget) onSignalTarget(pl.id, 'no_spell');
                              }}
                              title={pl.team === 'red' ? `Announce & track ${pl.heroName}'s ${getMlbbBattleSpellById(pl.spellId).name} CD` : getMlbbBattleSpellById(pl.spellId).name}
                              className={
                                pl.team === 'red'
                                  ? `px-1.5 py-0.5 rounded border text-[10px] font-black mlbb-num flex items-center gap-0.5 cursor-pointer ${
                                      tracked
                                        ? 'bg-amber-500/25 border-amber-300 text-amber-200'
                                        : 'bg-rose-950/70 border-rose-500/40 text-rose-200 hover:bg-rose-800'
                                    }`
                                  : ''
                              }
                            >
                              <span>{getMlbbBattleSpellById(pl.spellId).icon}</span>
                              {tracked && <span>{tracked.remainingSec}s</span>}
                            </button>
                            <span>{getMlbbEmblemById(pl.emblemId).icon}</span>
                          </div>
                        </div>
                      </div>

                      {tab === 'equipment' ? (
                        <div className="flex items-center gap-2">
                          <div className="text-right mlbb-num">
                            <div className="font-black text-white">{pl.kills}/{pl.deaths}/{pl.assists}</div>
                            <div className="text-[10px] text-amber-300">{pl.gold}g</div>
                          </div>
                          <div className="flex gap-0.5">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <span key={i} className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-[11px]">
                                {pl.items[i] ? getMlbbItemById(pl.items[i])?.icon : ''}
                              </span>
                            ))}
                          </div>
                          {!pl.isPlayer && (
                            <button
                              onClick={() =>
                                setMutedIds((m) => (m.includes(pl.id) ? m.filter((x) => x !== pl.id) : [...m, pl.id]))
                              }
                              className="text-xs cursor-pointer"
                              title="Mute Player"
                            >
                              {mutedIds.includes(pl.id) ? '🔇' : '🔊'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-right text-[10px] mlbb-num">
                          <div className="text-orange-300 font-bold">DMG {pl.damageDealt.toLocaleString()}</div>
                          <div className="text-sky-300">TANK {pl.damageTaken.toLocaleString()} · TUR {pl.turretDamage.toLocaleString()}</div>
                          <div className="text-emerald-300">TF {pl.teamfightPct}%</div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==================== 3. POST-MATCH MVP & RANK PROGRESSION SCREEN ==================== */
export const PostMatchScreen: React.FC<{
  record: MlbbMatchRecord;
  profile: MlbbProfileSave;
  starDelta: number;
  starProtected?: boolean;
  starProtectionSource?: 'points' | 'card' | null;
  starRaisedBonus?: boolean;
  bpGain: number;
  expGain: number;
  doubleBpUsed?: boolean;
  doubleExpUsed?: boolean;
  mmrDelta?: number;
  masteryGain?: number;
  onReturnLobby: () => void;
  onPlayAgain: () => void;
}> = ({
  record,
  profile,
  starDelta,
  starProtected = false,
  starProtectionSource = null,
  starRaisedBonus = false,
  bpGain,
  expGain,
  doubleBpUsed = false,
  doubleExpUsed = false,
  mmrDelta = 0,
  masteryGain = 0,
  onReturnLobby,
  onPlayAgain
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'data'>('overview');
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [copiedToast, setCopiedToast] = useState(false);

  const rankTier = MLBB_RANK_TIERS[Math.max(0, Math.min(MLBB_RANK_TIERS.length - 1, profile.rankTierIdx))];
  const blue = record.players.filter((p) => p.team === 'blue');
  const red = record.players.filter((p) => p.team === 'red');
  const maxDmg = Math.max(1, ...record.players.map((p) => p.damageDealt));
  const maxTank = Math.max(1, ...record.players.map((p) => p.damageTaken));
  const maxTur = Math.max(1, ...record.players.map((p) => p.turretDamage));

  const likeAllAllies = () => {
    mlbbAudio.playClick();
    const allyIds = blue.filter((p) => !p.isPlayer).map((p) => p.id);
    setLikedIds((prev) => Array.from(new Set([...prev, ...allyIds])));
  };

  const copyMatchSummary = () => {
    mlbbAudio.playClick();
    const summary = `[Legends Arena] ${record.victory ? 'VICTORY' : 'DEFEAT'} (${record.mode.toUpperCase()}) · ${record.playerHeroName} ${record.kda.join('/')} · Rating ${record.rating.toFixed(1)} (${record.medal}) · ${formatClock(record.durationSec)}`;
    try {
      navigator.clipboard?.writeText(summary);
    } catch {
      // Clipboard optional in sandbox
    }
    setCopiedToast(true);
    window.setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#070E21] via-[#0E1A3B] to-[#050A18] text-slate-100 flex flex-col p-4 overflow-y-auto">
      {/* Victory / Defeat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F5C451]/35 pb-3">
        <div>
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-black tracking-wider ${record.victory ? 'text-[#F5C451]' : 'text-rose-400'}`}>
              {record.victory ? 'VICTORY' : 'DEFEAT'}
            </div>
            <span className="text-xs font-black text-amber-200 mlbb-num">
              Rating {record.rating.toFixed(1)} · {record.medal}
            </span>
          </div>
          <div className="text-xs text-slate-300 mlbb-num">
            {record.mode.toUpperCase()} · {formatClock(record.durationSec)} · Score {record.blueKills} - {record.redKills}
            {mmrDelta !== 0 ? ` · Hero MMR ${mmrDelta > 0 ? `+${mmrDelta}` : mmrDelta}` : ''}
            {masteryGain > 0 ? ` · Mastery +${masteryGain}` : ''}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 flex items-center gap-2.5 text-xs">
            <RankCrestSvg tierIdx={profile.rankTierIdx} size={34} />
            <div>
              <div className="font-black text-[#F5C451] flex items-center gap-1.5">
                <span>
                  {rankTier.name} ★{profile.rankStars}
                </span>
                {starDelta !== 0 && (
                  <span className={starDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    ({starDelta > 0 ? `+${starDelta}` : starDelta})
                  </span>
                )}
                {starProtected && (
                  <span className="text-sky-300 font-black">
                    · 🛡️ Star Protected ({starProtectionSource === 'card' ? 'Card' : '1000 Pts'})
                  </span>
                )}
                {starRaisedBonus && <span className="text-amber-300 font-black">· ⭐ Star Raising +1</span>}
              </div>
              <div className="text-[11px] text-amber-200 mlbb-num">
                +{bpGain} BP{doubleBpUsed ? ' (2x Card)' : ''} · +{expGain} EXP{doubleExpUsed ? ' (2x Card)' : ''} · Protection {profile.starProtectionPts}/1000
              </div>
              <div className="mt-1 h-1.5 w-48 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-[#F5C451]"
                  style={{ width: `${Math.min(100, Math.round((profile.starProtectionPts / 1000) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                viewMode === 'overview' ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('data')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer ${
                viewMode === 'data' ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Damage Data
            </button>
          </div>
        </div>
      </div>

      {/* 10-Player MVP Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4 flex-1">
        {(
          [
            ['BLUE TEAM (ALLIES)', blue, record.victory],
            ['RED TEAM (ENEMIES)', red, !record.victory]
          ] as const
        ).map(([title, list, isWinningSide]) => (
          <div key={title} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-slate-300">
              <span>{title}</span>
              <span className={isWinningSide ? 'text-[#F5C451]' : 'text-rose-300'}>
                {isWinningSide ? 'WINNING SIDE' : 'DEFEATED SIDE'}
              </span>
            </div>
            {list.map((pl) => {
              const isSideMvp = pl.isMvp || pl.medal === 'MVP';
              return (
                <div
                  key={pl.id}
                  className={`p-2.5 rounded-xl bg-[#0F1B3B] border flex items-center justify-between gap-2 text-xs ${
                    isSideMvp ? 'border-[#F5C451]' : pl.isPlayer ? 'border-sky-400' : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HeroPortraitSvg heroId={pl.heroId} size={38} />
                    <div className="min-w-0">
                      <div className="font-black text-white flex items-center gap-1.5">
                        <span className="truncate">{pl.heroName}</span>
                        {isSideMvp && (
                          <span className={isWinningSide ? 'text-[#F5C451]' : 'text-purple-300'}>
                            {isWinningSide ? '👑 MVP' : '🏅 Defeat MVP'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mlbb-num">
                        {pl.name} · {pl.kills}/{pl.deaths}/{pl.assists} · {pl.gold.toLocaleString()}g
                      </div>
                      {viewMode === 'overview' && (
                        <div className="flex gap-0.5 mt-1">
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className="w-4.5 h-4.5 rounded bg-slate-900 border border-slate-700/70 flex items-center justify-center text-[10px]"
                              title={pl.items[i] ? getMlbbItemById(pl.items[i])?.name : 'Empty Slot'}
                            >
                              {pl.items[i] ? getMlbbItemById(pl.items[i])?.icon : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {viewMode === 'overview' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mlbb-num">
                        <div className="font-black text-[#F5C451] text-sm">{pl.rating.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-300">{pl.medal}</div>
                      </div>
                      {!pl.isPlayer && (
                        <button
                          onClick={() => {
                            mlbbAudio.playClick();
                            setLikedIds((prev) => (prev.includes(pl.id) ? prev : [...prev, pl.id]));
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                            likedIds.includes(pl.id) ? 'bg-pink-600 text-white' : 'bg-slate-800 text-pink-300 hover:bg-slate-700'
                          }`}
                          title="Send Post-Match Like"
                        >
                          {likedIds.includes(pl.id) ? '👍 Liked' : '👍'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-44 space-y-1 text-[10px] mlbb-num shrink-0">
                      <div>
                        <div className="flex justify-between text-orange-300 font-bold">
                          <span>Hero DMG</span>
                          <span>{pl.damageDealt.toLocaleString()}</span>
                        </div>
                        <div className="h-1 rounded bg-slate-900 overflow-hidden">
                          <div className="h-full bg-orange-400" style={{ width: `${Math.round((pl.damageDealt / maxDmg) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sky-300">
                          <span>Taken</span>
                          <span>{pl.damageTaken.toLocaleString()}</span>
                        </div>
                        <div className="h-1 rounded bg-slate-900 overflow-hidden">
                          <div className="h-full bg-sky-400" style={{ width: `${Math.round((pl.damageTaken / maxTank) * 100)}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-amber-300">
                          <span>Turret · TF {pl.teamfightPct}%</span>
                          <span>{pl.turretDamage.toLocaleString()}</span>
                        </div>
                        <div className="h-1 rounded bg-slate-900 overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${Math.round((pl.turretDamage / maxTur) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={likeAllAllies}
          className="h-11 px-5 rounded-xl bg-pink-700/85 hover:bg-pink-600 text-white font-black text-xs cursor-pointer"
        >
          👍 Like All Allies
        </button>
        <button
          onClick={copyMatchSummary}
          className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sky-200 font-black text-xs cursor-pointer"
        >
          {copiedToast ? 'Copied Summary ✓' : 'Share Summary'}
        </button>
        <button
          onClick={() => {
            mlbbAudio.playClick();
            onReturnLobby();
          }}
          className="h-11 px-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm cursor-pointer"
        >
          Return to Lobby
        </button>
        <button
          onClick={() => {
            mlbbAudio.playClick();
            onPlayAgain();
          }}
          className="h-11 px-10 rounded-xl bg-gradient-to-r from-[#F5C451] to-[#D97706] text-slate-950 font-black text-sm cursor-pointer shadow-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
