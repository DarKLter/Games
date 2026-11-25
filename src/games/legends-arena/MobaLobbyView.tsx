import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_STARTER_EMOTE_IDS,
  MOBA_ACHIEVEMENTS,
  MOBA_DAILY_MISSIONS,
  MOBA_ELIM_EFFECTS,
  MOBA_EMBLEMS,
  MOBA_EMOTES,
  MOBA_EQUIPMENT_ITEMS,
  MOBA_HEROES,
  MOBA_LUCKY_SPIN_POOL,
  MOBA_MAP_VARIANTS,
  MOBA_MODES,
  MOBA_QUESTS,
  MOBA_RECALL_EFFECTS,
  MOBA_ROLES,
  MOBA_SKIN_VARIANTS,
  MOBA_SPELLS,
  MOBA_STARLIGHT_TRACK,
  MOBA_TALENTS_T1,
  MOBA_TALENTS_T2,
  MOBA_TALENTS_T3,
  MobaEquipmentCategory,
  MobaMapVariantSetting,
  MobaRole,
  ROLE_RECOMMENDED_BUILDS,
  computeCollectorTier,
  computeMobaLeaderboard,
  equipEmoteToSlot,
  formatDailyCountdown,
  getEmblemUpgradeCost,
  getHeroMasteryTitle,
  getMapVariantDef,
  getMillisUntilMidnight,
  getMobaDailyMissionValue,
  getMobaEmblemBonus,
  getMobaEmoteById,
  getMobaEquipmentById,
  getMobaQuestValue,
  getMobaRankTitle,
  getSkinVariantById,
  normalizeEquippedEmotes
} from '../../core/arenaRoster';
import { ArcadeAudio } from '../../core/audio';
import {
  ensureCurrentMobaDailyState,
  persistArenaSelections,
  persistMobaDaily,
  persistMobaMeta,
  persistMobaProgression,
  playerState
} from '../../core/storage';

export type MobaSubTab = 'main' | 'mode' | 'store' | 'events' | 'prep' | 'profile' | 'settings';

export interface MobaLobbyViewProps {
  mobaTab: MobaSubTab;
  setMobaTab: (tab: MobaSubTab) => void;
  mobaStep: 'lobby' | 'draft';
  setMobaStep: (step: 'lobby' | 'draft') => void;
  previewHeroId: number;
  setPreviewHeroId: (id: number) => void;
  previewSkinId: string;
  setPreviewSkinId: (skinId: string) => void;
  notice: string | null;
  showNotice: (msg: string) => void;
  onSpendCoins: (amount: number) => boolean;
  onAwardCoins: (amount: number) => void;
  onSyncShowcase: (heroId?: number, skinId?: string) => void;
  onLaunch: () => void;
  bump: () => void;
}

const DRAFT_LANES = ['EXP', 'Mid', 'Gold', 'Roam', 'Jungle'];

const CHECKIN_REWARDS = [
  { day: 1, label: '600 BP', bp: 600, tickets: 0, promo: 0, trial: 0 },
  { day: 2, label: '30 Tickets', bp: 0, tickets: 30, promo: 0, trial: 0 },
  { day: 3, label: '1,000 BP', bp: 1000, tickets: 0, promo: 0, trial: 0 },
  { day: 4, label: '1 Trial Card', bp: 0, tickets: 0, promo: 0, trial: 1 },
  { day: 5, label: '50 Tickets', bp: 0, tickets: 50, promo: 0, trial: 0 },
  { day: 6, label: '100 Promo 💎', bp: 0, tickets: 0, promo: 100, trial: 0 },
  { day: 7, label: '2,000 BP + 150 Promo', bp: 2000, tickets: 0, promo: 150, trial: 0 }
];

export const MobaLobbyView: React.FC<MobaLobbyViewProps> = ({
  mobaTab,
  setMobaTab,
  mobaStep,
  setMobaStep,
  previewHeroId,
  setPreviewHeroId,
  previewSkinId,
  setPreviewSkinId,
  notice,
  showNotice,
  onSpendCoins,
  onAwardCoins,
  onSyncShowcase,
  onLaunch,
  bump
}) => {
  const [draftSec, setDraftSec] = useState(20);
  const [draftRevealCount, setDraftRevealCount] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftPhase, setDraftPhase] = useState<'ban' | 'pick'>('pick');

  const [storeSub, setStoreSub] = useState<'heroes' | 'skins' | 'effects' | 'spin'>('heroes');
  const [storeRole, setStoreRole] = useState<'All' | MobaRole>('All');
  const [storeSearch, setStoreSearch] = useState('');

  const [prepSub, setPrepSub] = useState<'emblems' | 'spells' | 'builds' | 'emotes' | 'leaderboard'>('emblems');
  const [buildCat, setBuildCat] = useState<MobaEquipmentCategory>('attack');
  const [emoteFilter, setEmoteFilter] = useState<'all' | 'owned' | 'locked'>('all');
  const [activeEmoteSlot, setActiveEmoteSlot] = useState<0 | 1 | 2 | 3>(0);
  const [previewEmoteId, setPreviewEmoteId] = useState<string | null>(null);
  const emotePreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [profileSub, setProfileSub] = useState<'overview' | 'mastery' | 'squad'>('overview');
  const [squadNameInput, setSquadNameInput] = useState(playerState.mobaSquad.name);
  const [squadTagInput, setSquadTagInput] = useState(playerState.mobaSquad.tag);

  const [missionTab, setMissionTab] = useState<'daily' | 'quests'>('daily');
  const [dailyNowTick, setDailyNowTick] = useState(() => Date.now());
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const activeModeDef = MOBA_MODES.find((m) => m.id === playerState.selectedMobaMode) ?? MOBA_MODES[1];
  const equippedHero = MOBA_HEROES[playerState.selectedMobaHero] ?? MOBA_HEROES[0];
  const rankTitle = getMobaRankTitle(playerState.mobaWins);
  const activeSpellDef = MOBA_SPELLS.find((s) => s.id === playerState.selectedMobaSpell) ?? MOBA_SPELLS[0];
  const activeEmblemId = playerState.selectedMobaEmblem;
  const activeEmblemLv = playerState.mobaEmblemLevels[activeEmblemId] ?? 1;
  const activeTalents = playerState.mobaEmblemTalents[activeEmblemId];
  const emblemBonus = getMobaEmblemBonus(activeEmblemId, activeEmblemLv, activeTalents);
  const collectorInfo = computeCollectorTier(playerState.unlockedMobaHeroes.length, playerState.mobaOwnedSkins);

  useEffect(() => {
    if (mobaStep !== 'draft') return;
    setDraftPhase(activeModeDef.hasBans ? 'ban' : 'pick');
    setDraftSec(activeModeDef.hasBans ? 25 : 18);
    setDraftRevealCount(1);
    const id = window.setInterval(() => {
      setDraftRevealCount((prev) => Math.min(5, prev + 1));
      setDraftSec((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          onLaunch();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [mobaStep, activeModeDef.hasBans, onLaunch]);

  useEffect(() => {
    if (mobaStep !== 'lobby' || mobaTab !== 'main') return;
    setDailyNowTick(Date.now());
    const id = window.setInterval(() => setDailyNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [mobaStep, mobaTab]);

  useEffect(() => {
    return () => {
      if (emotePreviewTimerRef.current) {
        clearTimeout(emotePreviewTimerRef.current);
        emotePreviewTimerRef.current = null;
      }
    };
  }, []);

  const triggerEmotePreview = (emoteId: string) => {
    const em = getMobaEmoteById(emoteId);
    ArcadeAudio.play(em.sfx);
    setPreviewEmoteId(em.id);
    if (emotePreviewTimerRef.current) clearTimeout(emotePreviewTimerRef.current);
    emotePreviewTimerRef.current = setTimeout(() => {
      emotePreviewTimerRef.current = null;
      setPreviewEmoteId(null);
    }, 2200);
  };

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: MOBA_HEROES.length };
    for (const r of MOBA_ROLES) counts[r] = 0;
    for (const h of MOBA_HEROES) counts[h.role] = (counts[h.role] || 0) + 1;
    return counts;
  }, []);

  const filteredStoreHeroes = useMemo(() => {
    const q = storeSearch.trim().toLowerCase();
    return MOBA_HEROES.filter((h) => {
      if (storeRole !== 'All' && h.role !== storeRole) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        h.title.toLowerCase().includes(q) ||
        h.role.toLowerCase().includes(q)
      );
    });
  }, [storeRole, storeSearch]);

  // ---------- DRAFT PICK ROOM (WITH RANKED BAN PHASE) ----------
  if (mobaStep === 'draft') {
    const currentPickId = playerState.mobaTrialHeroId ?? playerState.selectedMobaHero;
    const pickHero = MOBA_HEROES[currentPickId] ?? MOBA_HEROES[0];
    const allowAll = activeModeDef.allowTrialAll;
    const q = draftSearch.trim().toLowerCase();
    const bannedIds = activeModeDef.hasBans ? playerState.mobaDraftBans : [];

    const draftPool = MOBA_HEROES.filter((h) => {
      if (draftPhase === 'pick' && !allowAll && !playerState.unlockedMobaHeroes.includes(h.id)) return false;
      if (!q) return true;
      return h.name.toLowerCase().includes(q) || h.role.toLowerCase().includes(q);
    });

    const allies: number[] = [currentPickId];
    for (let step = 1; allies.length < 5; step++) {
      const cid = (currentPickId + step * 7) % MOBA_HEROES.length;
      if (!allies.includes(cid) && !bannedIds.includes(cid)) allies.push(cid);
    }
    const enemies: number[] = [];
    for (let step = 1; enemies.length < 5; step++) {
      const eid = (currentPickId + step * 13 + 5) % MOBA_HEROES.length;
      if (!enemies.includes(eid) && !bannedIds.includes(eid)) enemies.push(eid);
    }

    return (
      <>
        <div className="lobby3d-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="lobby3d-back-btn"
              onClick={() => {
                ArcadeAudio.play('click');
                playerState.mobaTrialHeroId = null;
                setMobaStep('lobby');
              }}
            >
              ◀ LOBBY
            </button>
            <div className="lobby3d-draft-timer" style={{ flex: 1, fontVariantNumeric: 'tabular-nums' }}>
              ⏱️ {draftPhase === 'ban' ? 'BAN' : 'PICK'}: {draftSec}s
            </div>
          </div>

          {activeModeDef.hasBans && (
            <div className="lobby3d-seg-row">
              <button
                type="button"
                className={`lobby3d-seg-btn ${draftPhase === 'ban' ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setDraftPhase('ban');
                }}
              >
                🚫 BANS ({bannedIds.length}/3)
              </button>
              <button
                type="button"
                className={`lobby3d-seg-btn ${draftPhase === 'pick' ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setDraftPhase('pick');
                }}
              >
                ⚔️ HERO PICK
              </button>
            </div>
          )}

          {activeModeDef.hasBans && bannedIds.length > 0 && (
            <div className="lobby3d-kit-box">
              <div className="lobby3d-kit-item">
                <strong>Banned Heroes:</strong>{' '}
                {bannedIds.map((id) => MOBA_HEROES[id]?.name ?? `#${id}`).join(' · ')}
              </div>
            </div>
          )}

          <div className="lobby3d-sec-title">
            <span>Blue Team ({activeModeDef.title})</span>
            <span>Red AI</span>
          </div>
          <div className="lobby3d-card-list">
            {allies.map((hid, idx) => {
              const allyHero = MOBA_HEROES[hid] ?? MOBA_HEROES[0];
              const enemyHero = MOBA_HEROES[enemies[idx]] ?? MOBA_HEROES[1];
              const locked = idx === 0 || idx < draftRevealCount;
              return (
                <div key={idx} className={`lobby3d-draft-slot ${idx === 0 ? 'you' : 'ally'}`}>
                  <span>
                    {idx === 0 ? '⭐ YOU: ' : `${DRAFT_LANES[idx]}: `}
                    {locked ? `${allyHero.icon} ${allyHero.name}` : 'Picking...'}
                  </span>
                  <span style={{ color: '#fda4af' }}>
                    {locked ? `${enemyHero.name} ${enemyHero.icon}` : '...'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="lobby3d-kit-box">
            <div className="lobby3d-kit-item">
              <strong>Emblem:</strong> {activeEmblemId} Lv{activeEmblemLv} (+{emblemBonus.atkBonus} ATK, +{emblemBonus.hpBonus} HP)
            </div>
            <div className="lobby3d-kit-item">
              <strong>Spell:</strong> {activeSpellDef.icon} {activeSpellDef.name} ({activeSpellDef.cooldownSec}s)
            </div>
          </div>

          <div className="lobby3d-sec-title" style={{ marginTop: '6px' }}>
            <span>🗺️ Battlefield Overview (Map Variant)</span>
            <span>{playerState.mobaSettings.mapVariantOverride === 'random' ? 'RANDOM' : 'LOCKED'}</span>
          </div>
          <div className="lobby3d-kit-box" id="mobaDraftVariantBox">
            {(() => {
              const curOverride = playerState.mobaSettings.mapVariantOverride ?? 'random';
              const activeDef =
                curOverride === 'random'
                  ? MOBA_MAP_VARIANTS[(currentPickId + draftRevealCount) % MOBA_MAP_VARIANTS.length]
                  : getMapVariantDef(curOverride);
              return (
                <>
                  <div className="lobby3d-kit-item">
                    <strong>
                      {curOverride === 'random' ? '🎲 Random Roll Preview:' : `${activeDef.icon} ${activeDef.name}:`}
                    </strong>{' '}
                    {curOverride === 'random' ? `${activeDef.icon} ${activeDef.name} — ` : ''}
                    {activeDef.summary}
                  </div>
                  <div className="moba-variant-toggle-row">
                    <button
                      type="button"
                      className={`lobby3d-seg-btn ${curOverride === 'random' ? 'active' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        playerState.mobaSettings = { ...playerState.mobaSettings, mapVariantOverride: 'random' };
                        persistMobaMeta();
                        bump();
                      }}
                    >
                      🎲 Random
                    </button>
                    {MOBA_MAP_VARIANTS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        className={`lobby3d-seg-btn ${curOverride === v.id ? 'active' : ''}`}
                        title={v.summary}
                        onClick={() => {
                          ArcadeAudio.play('click');
                          playerState.mobaSettings = { ...playerState.mobaSettings, mapVariantOverride: v.id };
                          persistMobaMeta();
                          bump();
                        }}
                      >
                        {v.icon} {v.shortName}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {pickHero.icon} {pickHero.name} · {pickHero.title} ({pickHero.role})
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>
              {draftPhase === 'ban'
                ? 'Select up to 3 Heroes to Ban'
                : allowAll
                  ? 'All 129 Heroes (Free Trial)'
                  : `Your Heroes (${playerState.unlockedMobaHeroes.length}/129)`}
            </span>
            <span>{pickHero.role}</span>
          </div>
          <input
            type="text"
            className="lobby3d-search"
            placeholder="Search MLBB hero or role..."
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
          />
          <div className="lobby3d-scroll-list">
            {draftPool.map((h) => {
              const isBanned = bannedIds.includes(h.id);
              const isSel = currentPickId === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  className={`lobby3d-item-card ${isSel && draftPhase === 'pick' ? 'selected' : ''} ${isBanned ? 'locked' : ''}`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    if (draftPhase === 'ban') {
                      if (isBanned) {
                        playerState.mobaDraftBans = playerState.mobaDraftBans.filter((id) => id !== h.id);
                      } else if (playerState.mobaDraftBans.length < 3 && h.id !== currentPickId) {
                        playerState.mobaDraftBans = [...playerState.mobaDraftBans, h.id];
                      } else {
                        showNotice('Max 3 bans reached (cannot ban your picked hero).');
                      }
                      persistMobaMeta();
                      bump();
                      return;
                    }
                    if (isBanned) {
                      showNotice(`${h.name} is banned in this Ranked Draft!`);
                      return;
                    }
                    if (playerState.unlockedMobaHeroes.includes(h.id)) {
                      playerState.mobaTrialHeroId = null;
                      playerState.selectedMobaHero = h.id;
                      persistArenaSelections();
                    } else {
                      playerState.mobaTrialHeroId = h.id;
                    }
                    onSyncShowcase(h.id, playerState.mobaEquippedSkins[h.id] ?? 'default');
                    bump();
                  }}
                >
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">{h.icon} {h.name} · {h.role}</div>
                    <div className="lobby3d-item-sub">{h.title} · {h.lane}</div>
                  </div>
                  <span className="lobby3d-badge">
                    {isBanned ? 'BANNED' : isSel ? 'PICKED' : h.unlockCost === 0 ? 'STARTER' : allowAll ? 'TRIAL' : 'OWNED'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lobby3d-sec-title"><span>Battle Spell (12) [F]</span></div>
          <div className="moba-spell-grid-compact">
            {MOBA_SPELLS.map((sp) => (
              <button
                key={sp.id}
                type="button"
                className={`lobby3d-seg-btn ${playerState.selectedMobaSpell === sp.id ? 'active' : ''}`}
                title={`${sp.name}: ${sp.summary}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  playerState.selectedMobaSpell = sp.id;
                  persistArenaSelections();
                  bump();
                }}
              >
                {sp.icon} {sp.name}
              </button>
            ))}
          </div>
          {notice && <div className="lobby3d-notice">{notice}</div>}
          <button
            type="button"
            className="lobby3d-cta-btn"
            onClick={() => {
              onLaunch();
            }}
          >
            🔒 LOCK IN & ENTER LAND OF DAWN
          </button>
        </div>
      </>
    );
  }

  // ---------- TAB 1: HOME LOBBY ----------
  if (mobaTab === 'main') {
    const dailyState = ensureCurrentMobaDailyState();
    const countdownStr = formatDailyCountdown(getMillisUntilMidnight(new Date(dailyNowTick)));
    const questStats = {
      matches: playerState.mobaMatchesPlayed,
      kills: playerState.mobaKillsTotal,
      turrets: playerState.mobaTurretsDestroyed,
      wins: playerState.mobaWins,
      unlockedCount: playerState.unlockedMobaHeroes.length
    };
    const activeSkin = getSkinVariantById(playerState.mobaEquippedSkins[equippedHero.id]);

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Land of Dawn Hub</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>Credit {playerState.mobaCreditScore}/110</span>
          </div>

          <div className="moba-currency-bar">
            <span>💰 {playerState.mobaBp.toLocaleString()} BP</span>
            <span>🎫 {playerState.mobaTickets}</span>
            <span>💎 {playerState.mobaDiamonds}</span>
            <span>✨ {playerState.mobaPromoDiamonds}</span>
          </div>

          <div className="lobby3d-item-card selected">
            <div className="lobby3d-item-main">
              <div className="lobby3d-item-title">🏅 {rankTitle} · {collectorInfo.tier.name}</div>
              <div className="lobby3d-item-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {playerState.mobaWins}W / {playerState.mobaMatchesPlayed}M · KOs {playerState.mobaKillsTotal} · Heroes {playerState.unlockedMobaHeroes.length}/129
              </div>
            </div>
          </div>

          <div className="lobby3d-seg-row">
            <button
              type="button"
              className={`lobby3d-seg-btn ${missionTab === 'daily' ? 'active' : ''}`}
              onClick={() => {
                ArcadeAudio.play('click');
                setMissionTab('daily');
              }}
            >
              📅 Daily Missions
            </button>
            <button
              type="button"
              className={`lobby3d-seg-btn ${missionTab === 'quests' ? 'active' : ''}`}
              onClick={() => {
                ArcadeAudio.play('click');
                setMissionTab('quests');
              }}
            >
              🏆 Lifetime Quests
            </button>
          </div>

          {missionTab === 'daily' ? (
            <>
              <div className="lobby3d-sec-title">
                <span>Daily Tasks</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#84fab0' }}>Resets {countdownStr}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_DAILY_MISSIONS.map((m) => {
                  const cur = getMobaDailyMissionValue(m, dailyState);
                  const claimed = dailyState.claimedIds.includes(m.id);
                  const ready = !claimed && cur >= m.target;
                  return (
                    <div key={m.id} className={`lobby3d-item-card ${ready ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {m.title} ({Math.min(cur, m.target)}/{m.target})
                        </div>
                        <div className="lobby3d-item-sub">{m.desc}</div>
                      </div>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={!ready}
                        onClick={() => {
                          if (!ready) return;
                          dailyState.claimedIds = [...dailyState.claimedIds, m.id];
                          playerState.mobaBp += m.rewardCoins * 15;
                          playerState.mobaStarlightXp += 120;
                          persistMobaDaily();
                          persistMobaMeta();
                          onAwardCoins(m.rewardCoins);
                          ArcadeAudio.play('coin');
                          showNotice(`Claimed +${m.rewardCoins}🪙 & +${m.rewardCoins * 15} BP!`);
                          bump();
                        }}
                      >
                        {claimed ? 'DONE ✓' : ready ? `CLAIM +${m.rewardCoins}🪙` : `+${m.rewardCoins}🪙`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="lobby3d-scroll-list">
              {MOBA_QUESTS.map((q) => {
                const cur = getMobaQuestValue(q, questStats);
                const claimed = playerState.claimedMobaQuests.includes(q.id);
                const ready = !claimed && cur >= q.target;
                return (
                  <div key={q.id} className={`lobby3d-item-card ${ready ? 'selected' : ''}`}>
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {q.title} ({Math.min(cur, q.target)}/{q.target})
                      </div>
                      <div className="lobby3d-item-sub">{q.desc}</div>
                    </div>
                    <button
                      type="button"
                      className="lobby3d-mini-btn"
                      disabled={!ready}
                      onClick={() => {
                        if (!ready) return;
                        playerState.claimedMobaQuests = [...playerState.claimedMobaQuests, q.id];
                        playerState.mobaBp += q.rewardCoins * 20;
                        persistMobaProgression();
                        persistMobaMeta();
                        onAwardCoins(q.rewardCoins);
                        ArcadeAudio.play('coin');
                        showNotice(`Claimed +${q.rewardCoins}🪙 & +${q.rewardCoins * 20} BP!`);
                        bump();
                      }}
                    >
                      {claimed ? 'DONE ✓' : ready ? `CLAIM +${q.rewardCoins}🪙` : `${q.rewardCoins}🪙`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {notice && <div className="lobby3d-notice">{notice}</div>}
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {equippedHero.icon} {equippedHero.name} ({activeSkin.name}) — {equippedHero.title} · {equippedHero.role}
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Selected MLBB Hero</span>
            <span style={{ color: equippedHero.accentHex }}>{equippedHero.role}</span>
          </div>
          <div className="lobby3d-item-card selected">
            <div className="lobby3d-item-main">
              <div className="lobby3d-item-title">{equippedHero.icon} {equippedHero.name} · {activeSkin.tier}</div>
              <div className="lobby3d-item-sub">
                {activeModeDef.title} · {activeSpellDef.icon} {activeSpellDef.name} · {activeEmblemId} Lv{activeEmblemLv}
              </div>
            </div>
          </div>

          <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
            <div className="lobby3d-kit-item"><strong>Passive — {equippedHero.passive.name}:</strong> {equippedHero.passive.desc}</div>
            <div className="lobby3d-kit-item"><strong>S1 — {equippedHero.skills[0].name}:</strong> {equippedHero.skills[0].desc}</div>
            <div className="lobby3d-kit-item"><strong>S2 — {equippedHero.skills[1].name}:</strong> {equippedHero.skills[1].desc}</div>
            <div className="lobby3d-kit-item"><strong>Ult — {equippedHero.skills[2].name}:</strong> {equippedHero.skills[2].desc}</div>
            {equippedHero.skill4 && (
              <div className="lobby3d-kit-item"><strong>S4 — {equippedHero.skill4.name}:</strong> {equippedHero.skill4.desc}</div>
            )}
          </div>

          <div className="lobby3d-btn-row">
            <button
              type="button"
              className="lobby3d-seg-btn active"
              onClick={() => {
                ArcadeAudio.play('click');
                setPreviewHeroId(playerState.selectedMobaHero);
                setMobaTab('store');
              }}
            >
              🛒 SHOP ({playerState.unlockedMobaHeroes.length}/129)
            </button>
            <button
              type="button"
              className="lobby3d-seg-btn"
              onClick={() => {
                ArcadeAudio.play('click');
                setMobaTab('prep');
              }}
            >
              🛡️ PREP & BUILDS
            </button>
          </div>
          <button
            type="button"
            className="lobby3d-cta-btn"
            onClick={() => {
              ArcadeAudio.play('click');
              playerState.mobaTrialHeroId = null;
              setMobaStep('draft');
            }}
          >
            START {activeModeDef.title.toUpperCase()}
          </button>
        </div>
      </>
    );
  }

  // ---------- TAB 2: MODES LOBBY (6 MLBB QUEUES) ----------
  if (mobaTab === 'mode') {
    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Select Game Mode</span>
            <span>6 Queues</span>
          </div>
          <div className="lobby3d-scroll-list">
            {MOBA_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`lobby3d-item-card ${playerState.selectedMobaMode === m.id ? 'selected' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  playerState.selectedMobaMode = m.id;
                  persistArenaSelections();
                  bump();
                }}
              >
                <div className="lobby3d-item-main">
                  <div className="lobby3d-item-title">{m.title}</div>
                  <div className="lobby3d-item-sub">{m.sub}</div>
                </div>
                <span className="lobby3d-badge">{m.badge}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {activeModeDef.title} · {equippedHero.icon} {equippedHero.name} Ready
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title"><span>Queue Rules</span><span>{activeModeDef.badge}</span></div>
          <div className="lobby3d-kit-box">
            <div className="lobby3d-kit-item"><strong>Mode:</strong> {activeModeDef.title}</div>
            <div className="lobby3d-kit-item"><strong>Details:</strong> {activeModeDef.sub}</div>
            <div className="lobby3d-kit-item"><strong>Hero:</strong> {equippedHero.icon} {equippedHero.name} ({equippedHero.role})</div>
            <div className="lobby3d-kit-item"><strong>Emblem:</strong> {activeEmblemId} Lv{activeEmblemLv}</div>
            <div className="lobby3d-kit-item"><strong>Battle Spell:</strong> {activeSpellDef.icon} {activeSpellDef.name}</div>
            {activeModeDef.hasBans && (
              <div className="lobby3d-kit-item" style={{ color: '#facc15' }}>
                <strong>Ranked Draft Bans:</strong> Ban up to 3 enemy heroes before locking your pick!
              </div>
            )}
            {activeModeDef.disableRecall && (
              <div className="lobby3d-kit-item" style={{ color: '#fda4af' }}>
                <strong>Brawl Rule:</strong> Recall is disabled; fountain healing only on respawn (+50% gold).
              </div>
            )}
            {activeModeDef.allowTrialAll && (
              <div className="lobby3d-kit-item" style={{ color: '#84fab0' }}>
                <strong>All 129 Heroes Open:</strong> Test any hero including Tigreal, Lancelot, Johnson, Yve & Kagura!
              </div>
            )}
          </div>
          <button
            type="button"
            className="lobby3d-cta-btn"
            onClick={() => {
              ArcadeAudio.play('click');
              playerState.mobaTrialHeroId = null;
              setMobaStep('draft');
            }}
          >
            ⚔️ ENTER DRAFT PICKING ROOM
          </button>
        </div>
      </>
    );
  }

  // ---------- TAB 3: STORE & DRAW (HEROES, SKINS, EFFECTS, LUCKY SPIN) ----------
  if (mobaTab === 'store') {
    const inspectedHero = MOBA_HEROES[previewHeroId] ?? MOBA_HEROES[0];
    const isOwned = playerState.unlockedMobaHeroes.includes(inspectedHero.id);
    const isEquipped = playerState.selectedMobaHero === inspectedHero.id;
    const bpCost = inspectedHero.unlockCost * 40;

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-seg-row">
            {([
              { id: 'heroes', label: 'Heroes' },
              { id: 'skins', label: 'Skins' },
              { id: 'effects', label: 'Effects' },
              { id: 'spin', label: 'Spin' }
            ] as const).map((st) => (
              <button
                key={st.id}
                type="button"
                className={`lobby3d-seg-btn ${storeSub === st.id ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setStoreSub(st.id);
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {storeSub === 'heroes' && (
            <>
              <div className="lobby3d-sec-title">
                <span>MLBB Roster (129)</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{playerState.unlockedMobaHeroes.length}/129 · 💰{playerState.mobaBp.toLocaleString()}</span>
              </div>
              <input
                type="text"
                className="lobby3d-search"
                placeholder="Search hero, title, or role..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />
              <div className="lobby3d-role-pills">
                {(['All', ...MOBA_ROLES] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`lobby3d-role-pill ${storeRole === r ? 'active' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setStoreRole(r);
                    }}
                  >
                    {r} ({roleCounts[r]})
                  </button>
                ))}
              </div>
              <div className="lobby3d-scroll-list">
                {filteredStoreHeroes.map((h) => {
                  const owned = playerState.unlockedMobaHeroes.includes(h.id);
                  const selected = previewHeroId === h.id;
                  const eq = playerState.selectedMobaHero === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className={`lobby3d-item-card ${selected ? 'selected' : ''} ${!owned ? 'locked' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        setPreviewHeroId(h.id);
                        const sk = playerState.mobaEquippedSkins[h.id] ?? 'default';
                        setPreviewSkinId(sk);
                        onSyncShowcase(h.id, sk);
                      }}
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{h.icon} {h.name}</div>
                        <div className="lobby3d-item-sub" style={{ color: h.accentHex }}>
                          {h.role} · {h.title}
                        </div>
                      </div>
                      <span className="lobby3d-badge">
                        {eq ? 'EQUIPPED' : owned ? 'OWNED' : `🪙${h.unlockCost}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {storeSub === 'skins' && (
            <>
              <div className="lobby3d-sec-title">
                <span>Skins for {inspectedHero.name}</span>
                <span>💎 {playerState.mobaDiamonds} · ✨ {playerState.mobaPromoDiamonds}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_SKIN_VARIANTS.map((sk) => {
                  const heroSkins = playerState.mobaOwnedSkins[inspectedHero.id] ?? [];
                  const owned = sk.id === 'default' || heroSkins.includes(sk.id);
                  const equipped = (playerState.mobaEquippedSkins[inspectedHero.id] ?? 'default') === sk.id;
                  const effectiveDiamondCost = Math.max(1, sk.costDiamonds - playerState.mobaPromoDiamonds);
                  return (
                    <div
                      key={sk.id}
                      className={`lobby3d-item-card ${previewSkinId === sk.id ? 'selected' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        setPreviewSkinId(sk.id);
                        onSyncShowcase(inspectedHero.id, sk.id);
                      }}
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title" style={{ color: sk.accentHex }}>{sk.name} ({sk.tier})</div>
                        <div className="lobby3d-item-sub">
                          +{sk.collectorPts} Collector Pts · Live 3D Showcase
                        </div>
                      </div>
                      {owned ? (
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          disabled={equipped}
                          onClick={(e) => {
                            e.stopPropagation();
                            playerState.mobaEquippedSkins = { ...playerState.mobaEquippedSkins, [inspectedHero.id]: sk.id };
                            persistMobaMeta();
                            ArcadeAudio.play('coin');
                            onSyncShowcase(inspectedHero.id, sk.id);
                            bump();
                          }}
                        >
                          {equipped ? 'EQUIPPED' : 'EQUIP'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (playerState.mobaDiamonds >= effectiveDiamondCost) {
                              const promoUsed = Math.min(playerState.mobaPromoDiamonds, Math.max(0, sk.costDiamonds - 1));
                              playerState.mobaPromoDiamonds -= promoUsed;
                              playerState.mobaDiamonds -= effectiveDiamondCost;
                            } else if (playerState.mobaBp >= sk.costBp) {
                              playerState.mobaBp -= sk.costBp;
                            } else {
                              showNotice(`Need 💎${effectiveDiamondCost} or 💰${sk.costBp.toLocaleString()} BP for ${sk.name}!`);
                              return;
                            }
                            const nextList = heroSkins.includes(sk.id) ? heroSkins : [...heroSkins, sk.id];
                            playerState.mobaOwnedSkins = { ...playerState.mobaOwnedSkins, [inspectedHero.id]: nextList };
                            playerState.mobaEquippedSkins = { ...playerState.mobaEquippedSkins, [inspectedHero.id]: sk.id };
                            persistMobaMeta();
                            ArcadeAudio.play('levelup');
                            showNotice(`Unlocked ${sk.name} skin for ${inspectedHero.name}!`);
                            onSyncShowcase(inspectedHero.id, sk.id);
                            bump();
                          }}
                        >
                          💎{effectiveDiamondCost} / 💰{sk.costBp}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {storeSub === 'effects' && (
            <>
              <div className="lobby3d-sec-title"><span>3D Recall Effects</span><span>Active in Match</span></div>
              <div className="lobby3d-card-list">
                {MOBA_RECALL_EFFECTS.map((ef) => {
                  const owned = playerState.mobaOwnedRecallEffects.includes(ef.id);
                  const eq = playerState.mobaRecallEffect === ef.id;
                  return (
                    <div key={ef.id} className={`lobby3d-item-card ${eq ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{ef.icon} {ef.name}</div>
                        <div className="lobby3d-item-sub">3D Recall channel aura</div>
                      </div>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={eq}
                        onClick={() => {
                          if (!owned) {
                            if (playerState.mobaTickets >= ef.costTickets) {
                              playerState.mobaTickets -= ef.costTickets;
                            } else if (!onSpendCoins(Math.ceil(ef.costTickets / 2))) {
                              showNotice(`Need ${ef.costTickets}🎫 Tickets or ${Math.ceil(ef.costTickets / 2)}🪙 Coins!`);
                              return;
                            }
                            playerState.mobaOwnedRecallEffects = [...playerState.mobaOwnedRecallEffects, ef.id];
                          }
                          playerState.mobaRecallEffect = ef.id;
                          persistMobaMeta();
                          ArcadeAudio.play('coin');
                          bump();
                        }}
                      >
                        {eq ? 'EQUIPPED' : owned ? 'EQUIP' : `🎫${ef.costTickets}`}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="lobby3d-sec-title"><span>3D Elimination Effects</span><span>On Hero KO</span></div>
              <div className="lobby3d-card-list">
                {MOBA_ELIM_EFFECTS.map((ef) => {
                  const owned = playerState.mobaOwnedElimEffects.includes(ef.id);
                  const eq = playerState.mobaElimEffect === ef.id;
                  return (
                    <div key={ef.id} className={`lobby3d-item-card ${eq ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{ef.icon} {ef.name}</div>
                        <div className="lobby3d-item-sub">3D KO burst celebration</div>
                      </div>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={eq}
                        onClick={() => {
                          if (!owned) {
                            if (playerState.mobaTickets >= ef.costTickets) {
                              playerState.mobaTickets -= ef.costTickets;
                            } else if (!onSpendCoins(Math.ceil(ef.costTickets / 2))) {
                              showNotice(`Need ${ef.costTickets}🎫 Tickets or ${Math.ceil(ef.costTickets / 2)}🪙 Coins!`);
                              return;
                            }
                            playerState.mobaOwnedElimEffects = [...playerState.mobaOwnedElimEffects, ef.id];
                          }
                          playerState.mobaElimEffect = ef.id;
                          persistMobaMeta();
                          ArcadeAudio.play('coin');
                          bump();
                        }}
                      >
                        {eq ? 'EQUIPPED' : owned ? 'EQUIP' : `🎫${ef.costTickets}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {storeSub === 'spin' && (
            <>
              <div className="lobby3d-sec-title">
                <span>🎰 Lucky Spin Draw</span>
                <span>🎫 {playerState.mobaTickets} Tickets</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_LUCKY_SPIN_POOL.map((p) => (
                  <div key={p.id} className="lobby3d-item-card">
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{p.icon} {p.label}</div>
                      <div className="lobby3d-item-sub">Draw Pool Prize</div>
                    </div>
                  </div>
                ))}
              </div>
              {spinResult && <div className="lobby3d-notice" style={{ color: '#84fab0', borderColor: '#22c55e' }}>{spinResult}</div>}
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  if (playerState.mobaTickets >= 20) {
                    playerState.mobaTickets -= 20;
                  } else if (!onSpendCoins(25)) {
                    showNotice('Need 20🎫 Tickets or 25🪙 Coins to spin!');
                    return;
                  }
                  const prize = MOBA_LUCKY_SPIN_POOL[Math.floor(Math.random() * MOBA_LUCKY_SPIN_POOL.length)];
                  if (prize.bp) playerState.mobaBp += prize.bp;
                  if (prize.diamonds) playerState.mobaDiamonds += prize.diamonds;
                  if (prize.tickets) playerState.mobaTickets += prize.tickets;
                  if (prize.trialCards) playerState.mobaBackpack.trialCards += prize.trialCards;
                  if (prize.doubleBpCards) playerState.mobaBackpack.doubleBpCards += prize.doubleBpCards;
                  if (prize.coins) onAwardCoins(prize.coins);
                  persistMobaMeta();
                  ArcadeAudio.play('levelup');
                  setSpinResult(`🎉 WON: ${prize.icon} ${prize.label}!`);
                  bump();
                }}
              >
                🎰 DRAW 1x (20🎫 or 25🪙)
              </button>
            </>
          )}
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {inspectedHero.icon} {inspectedHero.name} — {getSkinVariantById(previewSkinId).name} · {inspectedHero.lane}
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>{inspectedHero.name} Kit</span>
            <span>{isOwned ? (isEquipped ? 'EQUIPPED' : 'OWNED') : `🪙${inspectedHero.unlockCost} / 💰${bpCost}`}</span>
          </div>
          <div className="lobby3d-stat-mini-grid">
            <div className="lobby3d-stat-mini">HP<b>{inspectedHero.maxHp}</b></div>
            <div className="lobby3d-stat-mini">ATK<b>{inspectedHero.atkDmg}</b></div>
            <div className="lobby3d-stat-mini">SPD<b>{inspectedHero.moveSpeed}</b></div>
            <div className="lobby3d-stat-mini">RNG<b>{inspectedHero.atkRange}</b></div>
          </div>
          <div className="lobby3d-kit-box" style={{ overflowY: 'auto' }}>
            <div className="lobby3d-kit-item"><strong>Passive — {inspectedHero.passive.name}:</strong> {inspectedHero.passive.desc}</div>
            <div className="lobby3d-kit-item"><strong>S1 — {inspectedHero.skills[0].name}:</strong> {inspectedHero.skills[0].desc}</div>
            <div className="lobby3d-kit-item"><strong>S2 — {inspectedHero.skills[1].name}:</strong> {inspectedHero.skills[1].desc}</div>
            <div className="lobby3d-kit-item"><strong>Ult — {inspectedHero.skills[2].name}:</strong> {inspectedHero.skills[2].desc}</div>
            {inspectedHero.skill4 && (
              <div className="lobby3d-kit-item"><strong>S4 — {inspectedHero.skill4.name}:</strong> {inspectedHero.skill4.desc}</div>
            )}
          </div>
          {notice && <div className="lobby3d-notice">{notice}</div>}
          <div className="lobby3d-btn-row">
            <button
              type="button"
              className="lobby3d-seg-btn"
              onClick={() => {
                ArcadeAudio.play('click');
                playerState.mobaTrialHeroId = inspectedHero.id;
                playerState.selectedMobaMode = 'ai_vs';
                persistArenaSelections();
                onLaunch();
              }}
            >
              🧪 TRY FREE
            </button>
            {isOwned ? (
              <button
                type="button"
                className="lobby3d-cta-btn"
                disabled={isEquipped}
                onClick={() => {
                  ArcadeAudio.play('coin');
                  playerState.mobaTrialHeroId = null;
                  playerState.selectedMobaHero = inspectedHero.id;
                  persistMobaProgression();
                  onSyncShowcase(inspectedHero.id, playerState.mobaEquippedSkins[inspectedHero.id] ?? 'default');
                  bump();
                }}
              >
                {isEquipped ? '✓ EQUIPPED' : '⭐ EQUIP HERO'}
              </button>
            ) : (
              <button
                type="button"
                className="lobby3d-cta-btn"
                onClick={() => {
                  if (playerState.mobaBp >= bpCost) {
                    playerState.mobaBp -= bpCost;
                    persistMobaMeta();
                  } else if (!onSpendCoins(inspectedHero.unlockCost)) {
                    showNotice(`Need 💰${bpCost} BP or 🪙${inspectedHero.unlockCost} Coins for ${inspectedHero.name}!`);
                    return;
                  }
                  playerState.unlockedMobaHeroes = [...playerState.unlockedMobaHeroes, inspectedHero.id].sort((a, b) => a - b);
                  playerState.selectedMobaHero = inspectedHero.id;
                  playerState.mobaTrialHeroId = null;
                  persistMobaProgression();
                  ArcadeAudio.play('levelup');
                  showNotice(`Unlocked ${inspectedHero.name}!`);
                  onSyncShowcase(inspectedHero.id, 'default');
                  bump();
                }}
              >
                BUY (💰{bpCost} / 🪙{inspectedHero.unlockCost})
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ---------- TAB 4: EVENTS & STARLIGHT PASS ----------
  if (mobaTab === 'events') {
    const todayKey = new Date().toISOString().slice(0, 10);
    const canCheckIn = playerState.mobaCheckInLastDate !== todayKey;
    const nextDay = (playerState.mobaCheckInDay % 7) + 1;

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>📅 7-Day Check-In Calendar</span>
            <span>Day {playerState.mobaCheckInDay}/7</span>
          </div>
          <div className="lobby3d-scroll-list">
            {CHECKIN_REWARDS.map((r) => {
              const claimed = r.day <= playerState.mobaCheckInDay;
              const isNext = r.day === nextDay && canCheckIn;
              return (
                <div key={r.day} className={`lobby3d-item-card ${isNext ? 'selected' : ''}`}>
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">Day {r.day} · {r.label}</div>
                    <div className="lobby3d-item-sub">{claimed ? 'Claimed' : isNext ? 'Ready to claim today!' : 'Upcoming login bonus'}</div>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={!isNext}
                    onClick={() => {
                      if (!isNext) return;
                      playerState.mobaCheckInDay = r.day;
                      playerState.mobaCheckInLastDate = todayKey;
                      playerState.mobaBp += r.bp;
                      playerState.mobaTickets += r.tickets;
                      playerState.mobaPromoDiamonds += r.promo;
                      playerState.mobaBackpack.trialCards += r.trial;
                      playerState.mobaStarlightXp += 150;
                      persistMobaMeta();
                      ArcadeAudio.play('levelup');
                      showNotice(`Day ${r.day} Claimed: ${r.label} (+150 StarLight XP)!`);
                      bump();
                    }}
                  >
                    {claimed ? '✓' : isNext ? 'CLAIM' : `D${r.day}`}
                  </button>
                </div>
              );
            })}
          </div>
          {notice && <div className="lobby3d-notice">{notice}</div>}
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            ⭐ StarLight Pass · {playerState.mobaStarlightXp} XP · ✨ {playerState.mobaPromoDiamonds} Promo Diamonds
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>⭐ StarLight Pass Track</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{playerState.mobaStarlightXp} XP</span>
          </div>
          <div className="lobby3d-scroll-list">
            {MOBA_STARLIGHT_TRACK.map((tier) => {
              const unlocked = playerState.mobaStarlightXp >= tier.xpRequired;
              const claimed = playerState.mobaStarlightClaimed.includes(tier.level);
              return (
                <div key={tier.level} className={`lobby3d-item-card ${unlocked && !claimed ? 'selected' : ''}`}>
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">Lv.{tier.level} · {tier.label}</div>
                    <div className="lobby3d-item-sub">Requires {tier.xpRequired} StarLight XP · +{tier.rewardBp} BP</div>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={!unlocked || claimed}
                    onClick={() => {
                      if (!unlocked || claimed) return;
                      playerState.mobaStarlightClaimed = [...playerState.mobaStarlightClaimed, tier.level];
                      if (tier.rewardBp) playerState.mobaBp += tier.rewardBp;
                      if (tier.rewardTickets) playerState.mobaTickets += tier.rewardTickets;
                      if (tier.rewardPromoDiamonds) playerState.mobaPromoDiamonds += tier.rewardPromoDiamonds;
                      if (tier.rewardCoins) onAwardCoins(tier.rewardCoins);
                      persistMobaMeta();
                      ArcadeAudio.play('coin');
                      showNotice(`StarLight Lv.${tier.level} Claimed: ${tier.label}!`);
                      bump();
                    }}
                  >
                    {claimed ? 'DONE ✓' : unlocked ? 'CLAIM' : `${tier.xpRequired} XP`}
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="lobby3d-cta-btn"
            onClick={() => {
              ArcadeAudio.play('click');
              setMobaTab('store');
              setStoreSub('skins');
            }}
          >
            ✨ SPEND PROMO DIAMONDS IN SKIN STORE
          </button>
        </div>
      </>
    );
  }

  // ---------- TAB 5: PREPARATION (7 EMBLEMS + 3 TALENT TIERS, 12 SPELLS, CUSTOM 6-ITEM BUILDS) ----------
  if (mobaTab === 'prep') {
    const leaderboardRows = computeMobaLeaderboard(
      playerState.username,
      playerState.mobaWins,
      playerState.mobaKillsTotal
    );
    const currentBuild: string[] =
      playerState.mobaCustomBuilds[equippedHero.id] && playerState.mobaCustomBuilds[equippedHero.id].length > 0
        ? playerState.mobaCustomBuilds[equippedHero.id]
        : ROLE_RECOMMENDED_BUILDS[equippedHero.role] ?? ROLE_RECOMMENDED_BUILDS.Fighter;

    const catItems = MOBA_EQUIPMENT_ITEMS.filter((it) => it.category === buildCat);
    const ownedEmotes = playerState.mobaOwnedEmotes;
    const equippedEmotes = normalizeEquippedEmotes(playerState.mobaEquippedEmotes, ownedEmotes);
    const filteredEmotes = MOBA_EMOTES.filter((em) => {
      const isOwned = ownedEmotes.includes(em.id);
      if (emoteFilter === 'owned') return isOwned;
      if (emoteFilter === 'locked') return !isOwned;
      return true;
    });
    const slotDirLabels: readonly [string, string, string, string] = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-seg-row">
            {([
              { id: 'emblems', label: 'Emblems' },
              { id: 'spells', label: 'Spells' },
              { id: 'builds', label: 'Builds' },
              { id: 'emotes', label: 'Emotes' },
              { id: 'leaderboard', label: 'Rank' }
            ] as const).map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`lobby3d-seg-btn ${prepSub === sub.id ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setPrepSub(sub.id);
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {prepSub === 'emblems' && (
            <>
              <div className="lobby3d-sec-title">
                <span>7 Emblem Sets (Lv 1–5)</span>
                <span>{activeEmblemId} Lv{activeEmblemLv}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_EMBLEMS.map((emb) => {
                  const lv = playerState.mobaEmblemLevels[emb.role] ?? 1;
                  const cost = getEmblemUpgradeCost(lv);
                  const bonus = getMobaEmblemBonus(emb.role, lv, playerState.mobaEmblemTalents[emb.role]);
                  const active = activeEmblemId === emb.role;
                  return (
                    <div
                      key={emb.role}
                      className={`lobby3d-item-card ${active ? 'selected' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        playerState.selectedMobaEmblem = emb.role;
                        persistMobaProgression();
                        bump();
                      }}
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{emb.icon} {emb.role} Lv{lv}</div>
                        <div className="lobby3d-item-sub">
                          +{bonus.atkBonus} ATK · +{bonus.hpBonus} HP · +{bonus.spdBonus} SPD · -{Math.round(bonus.cdReduction * 100)}% CD
                        </div>
                      </div>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={lv >= 5}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (lv >= 5 || cost <= 0) return;
                          if (!onSpendCoins(cost)) {
                            showNotice(`Need ${cost}🪙 Coins to upgrade ${emb.role} Emblem!`);
                            return;
                          }
                          playerState.mobaEmblemLevels = { ...playerState.mobaEmblemLevels, [emb.role]: lv + 1 };
                          playerState.selectedMobaEmblem = emb.role;
                          persistMobaProgression();
                          ArcadeAudio.play('levelup');
                          bump();
                        }}
                      >
                        {lv >= 5 ? 'MAX' : `UP ${cost}🪙`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {prepSub === 'spells' && (
            <>
              <div className="lobby3d-sec-title">
                <span>All 12 Battle Spells [F]</span>
                <span>{activeSpellDef.name}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_SPELLS.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    className={`lobby3d-item-card ${playerState.selectedMobaSpell === sp.id ? 'selected' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      playerState.selectedMobaSpell = sp.id;
                      persistArenaSelections();
                      bump();
                    }}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{sp.icon} {sp.name} · {sp.cooldownSec}s CD</div>
                      <div className="lobby3d-item-sub">{sp.summary}</div>
                    </div>
                    <span className="lobby3d-badge">{playerState.selectedMobaSpell === sp.id ? 'EQUIPPED' : 'SELECT'}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {prepSub === 'builds' && (
            <>
              <div className="lobby3d-sec-title">
                <span>52 Tier-3 Equipment</span>
                <span>Tap to Add</span>
              </div>
              <div className="lobby3d-role-pills">
                {(['attack', 'magic', 'defense', 'movement'] as MobaEquipmentCategory[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`lobby3d-role-pill ${buildCat === cat ? 'active' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setBuildCat(cat);
                    }}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="lobby3d-scroll-list">
                {catItems.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className="lobby3d-item-card"
                    onClick={() => {
                      const next = [...currentBuild];
                      if (next.length >= 6) {
                        showNotice('Build full (6/6)! Remove an item on the right first.');
                        return;
                      }
                      next.push(it.id);
                      playerState.mobaCustomBuilds = { ...playerState.mobaCustomBuilds, [equippedHero.id]: next };
                      persistMobaMeta();
                      ArcadeAudio.play('click');
                      bump();
                    }}
                  >
                    <div className="lobby3d-item-main">
                      <div className="lobby3d-item-title">{it.icon} {it.name} · 🪙{it.cost}</div>
                      <div className="lobby3d-item-sub">{it.statsSummary}</div>
                    </div>
                    <span className="lobby3d-badge">+ ADD</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {prepSub === 'emotes' && (
            <>
              <div className="lobby3d-sec-title">
                <span>Battle Emotes ({ownedEmotes.length}/{MOBA_EMOTES.length})</span>
                <span>🎟️ {playerState.mobaTickets} · 🪙 {playerState.totalCoins}</span>
              </div>
              <div className="lobby3d-role-pills">
                {(['all', 'owned', 'locked'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`lobby3d-role-pill ${emoteFilter === f ? 'active' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setEmoteFilter(f);
                    }}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="lobby3d-scroll-list">
                {filteredEmotes.map((em) => {
                  const isOwned = ownedEmotes.includes(em.id);
                  const equippedIdx = equippedEmotes.indexOf(em.id);
                  const isEquipped = equippedIdx >= 0;
                  return (
                    <div
                      key={em.id}
                      className={`lobby3d-item-card ${isEquipped ? 'selected' : ''}`}
                      onClick={() => {
                        if (!isOwned) {
                          triggerEmotePreview(em.id);
                          return;
                        }
                        const nextWheel = equipEmoteToSlot(equippedEmotes, activeEmoteSlot, em.id);
                        playerState.mobaEquippedEmotes = nextWheel;
                        persistMobaMeta();
                        triggerEmotePreview(em.id);
                        showNotice(`Equipped ${em.icon} ${em.name} to Slot ${activeEmoteSlot + 1} (${slotDirLabels[activeEmoteSlot]}).`);
                        bump();
                      }}
                    >
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">
                          {em.icon} {em.name} — &ldquo;{em.callout}&rdquo;
                        </div>
                        <div className="lobby3d-item-sub">
                          {em.category.toUpperCase()} · {em.rarity}
                          {!isOwned ? ` · 🎟️${em.costTickets} or 🪙${em.costCoins}` : ''}
                        </div>
                      </div>
                      <div className="moba-prep-emote-actions">
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          title={`Preview ${em.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerEmotePreview(em.id);
                          }}
                        >
                          🔊
                        </button>
                        {isOwned ? (
                          <button
                            type="button"
                            className="lobby3d-mini-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextWheel = equipEmoteToSlot(equippedEmotes, activeEmoteSlot, em.id);
                              playerState.mobaEquippedEmotes = nextWheel;
                              persistMobaMeta();
                              triggerEmotePreview(em.id);
                              showNotice(`Equipped ${em.icon} ${em.name} to Slot ${activeEmoteSlot + 1} (${slotDirLabels[activeEmoteSlot]}).`);
                              bump();
                            }}
                          >
                            {isEquipped ? `SLOT ${equippedIdx + 1}` : `EQUIP S${activeEmoteSlot + 1}`}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="lobby3d-mini-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              let unlocked = false;
                              if (playerState.mobaTickets >= em.costTickets) {
                                playerState.mobaTickets -= em.costTickets;
                                unlocked = true;
                              } else if (onSpendCoins(em.costCoins)) {
                                unlocked = true;
                              }
                              if (!unlocked) {
                                showNotice(`Need ${em.costTickets}🎟️ Tickets or ${em.costCoins}🪙 Coins to unlock ${em.name}!`);
                                return;
                              }
                              const nextOwned = [...ownedEmotes, em.id];
                              playerState.mobaOwnedEmotes = nextOwned;
                              playerState.mobaEquippedEmotes = equipEmoteToSlot(
                                equippedEmotes,
                                activeEmoteSlot,
                                em.id
                              );
                              persistMobaMeta();
                              ArcadeAudio.play('levelup');
                              triggerEmotePreview(em.id);
                              showNotice(`Unlocked & equipped ${em.icon} ${em.name} in Slot ${activeEmoteSlot + 1}!`);
                              bump();
                            }}
                          >
                            {playerState.mobaTickets >= em.costTickets ? `🎟️${em.costTickets}` : `🪙${em.costCoins}`}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {prepSub === 'leaderboard' && (
            <>
              <div className="lobby3d-sec-title">
                <span>🏆 Top Land of Dawn Players</span>
                <span>{rankTitle}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {leaderboardRows.map((row, idx) => (
                  <div key={`${row.name}-${idx}`} className={`lobby3d-lb-row ${row.isPlayer ? 'you' : ''}`}>
                    <span>#{idx + 1}</span>
                    <span>{row.isPlayer ? `⭐ ${row.name}` : row.name}</span>
                    <span>{row.rankTitle}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.points}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {notice && <div className="lobby3d-notice">{notice}</div>}
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            {activeEmblemId} Lv{activeEmblemLv} · {activeSpellDef.icon} {activeSpellDef.name} · {equippedHero.name} Build
          </div>
        </div>

        <div className="lobby3d-panel">
          {prepSub === 'builds' ? (
            <>
              <div className="lobby3d-sec-title">
                <span>{equippedHero.name} Custom Build ({currentBuild.length}/6)</span>
                <button
                  type="button"
                  className="lobby3d-mini-btn"
                  onClick={() => {
                    const copy = { ...playerState.mobaCustomBuilds };
                    delete copy[equippedHero.id];
                    playerState.mobaCustomBuilds = copy;
                    persistMobaMeta();
                    ArcadeAudio.play('click');
                    showNotice(`Reset ${equippedHero.name} build to default.`);
                    bump();
                  }}
                >
                  RESET
                </button>
              </div>
              <div className="lobby3d-scroll-list">
                {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                  const id = currentBuild[slotIdx];
                  const item = id ? getMobaEquipmentById(id) : undefined;
                  return (
                    <div key={slotIdx} className={`lobby3d-item-card ${item ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">
                          Slot {slotIdx + 1}: {item ? `${item.icon} ${item.name}` : 'Empty Slot'}
                        </div>
                        <div className="lobby3d-item-sub">{item ? item.statsSummary : 'Tap an item on the left to fill'}</div>
                      </div>
                      {item && (
                        <button
                          type="button"
                          className="lobby3d-mini-btn"
                          onClick={() => {
                            const next = currentBuild.filter((_, i) => i !== slotIdx);
                            playerState.mobaCustomBuilds = { ...playerState.mobaCustomBuilds, [equippedHero.id]: next };
                            persistMobaMeta();
                            ArcadeAudio.play('click');
                            bump();
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : prepSub === 'emotes' ? (
            <>
              <div className="lobby3d-sec-title">
                <span>4-Slot Emote Wheel</span>
                <button
                  type="button"
                  className="lobby3d-mini-btn"
                  onClick={() => {
                    playerState.mobaEquippedEmotes = [...DEFAULT_STARTER_EMOTE_IDS];
                    persistMobaMeta();
                    ArcadeAudio.play('click');
                    showNotice('Reset 4-slot Emote Wheel to Starter Emotes.');
                    bump();
                  }}
                >
                  RESET
                </button>
              </div>
              <div className="moba-prep-emote-stage">
                {(() => {
                  const previewDef = getMobaEmoteById(previewEmoteId ?? equippedEmotes[activeEmoteSlot]);
                  return (
                    <div
                      key={previewEmoteId ? `live-${previewEmoteId}` : `idle-${activeEmoteSlot}`}
                      className={`moba-prep-emote-bubble ${previewEmoteId ? 'live' : ''}`}
                      style={{ '--emote-color': previewDef.colorHex } as React.CSSProperties}
                    >
                      <span className="moba-prep-emote-bubble-icon">{previewDef.icon}</span>
                      <span className="moba-prep-emote-bubble-text">{previewDef.callout}</span>
                    </div>
                  );
                })()}
                <div className="moba-prep-emote-wheel" role="group" aria-label="4-Slot Emote Wheel">
                  {([0, 1, 2, 3] as const).map((slotIdx) => {
                    const em = getMobaEmoteById(equippedEmotes[slotIdx]);
                    const isSelected = activeEmoteSlot === slotIdx;
                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        className={`moba-prep-wheel-slot slot-${slotIdx} ${isSelected ? 'selected' : ''}`}
                        style={{ '--emote-color': em.colorHex } as React.CSSProperties}
                        onClick={() => {
                          setActiveEmoteSlot(slotIdx);
                          triggerEmotePreview(em.id);
                        }}
                      >
                        <span className="moba-prep-wheel-dir">
                          {slotDirLabels[slotIdx]} · {slotIdx + 1}
                        </span>
                        <span className="moba-prep-wheel-icon">{em.icon}</span>
                        <span className="moba-prep-wheel-label">{em.callout}</span>
                      </button>
                    );
                  })}
                  <div className="moba-prep-wheel-hub">
                    <strong>S{activeEmoteSlot + 1}</strong>
                    <span>{slotDirLabels[activeEmoteSlot]}</span>
                  </div>
                </div>
                <div className="moba-prep-emote-hint">
                  Editing Slot {activeEmoteSlot + 1} ({slotDirLabels[activeEmoteSlot]}) · Tap any owned emote on the left to assign · Press [T] or tap EMOTE in-match
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="lobby3d-sec-title">
                <span>Talent Sockets ({activeEmblemId})</span>
                <span>3 Tiers</span>
              </div>
              <div className="lobby3d-scroll-list">
                <div className="lobby3d-kit-item"><strong>Tier 1 — Standard Talent:</strong></div>
                <div className="lobby3d-role-pills">
                  {MOBA_TALENTS_T1.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`lobby3d-role-pill ${activeTalents?.t1 === t.id ? 'active' : ''}`}
                      title={t.summary}
                      onClick={() => {
                        playerState.mobaEmblemTalents = {
                          ...playerState.mobaEmblemTalents,
                          [activeEmblemId]: { ...(activeTalents ?? { t1: t.id, t2: 'weapons_master', t3: 'killing_spree' }), t1: t.id }
                        };
                        persistMobaMeta();
                        ArcadeAudio.play('click');
                        bump();
                      }}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>

                <div className="lobby3d-kit-item"><strong>Tier 2 — Mastery Talent:</strong></div>
                <div className="lobby3d-role-pills">
                  {MOBA_TALENTS_T2.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`lobby3d-role-pill ${activeTalents?.t2 === t.id ? 'active' : ''}`}
                      title={t.summary}
                      onClick={() => {
                        playerState.mobaEmblemTalents = {
                          ...playerState.mobaEmblemTalents,
                          [activeEmblemId]: { ...(activeTalents ?? { t1: 'thrill', t2: t.id, t3: 'killing_spree' }), t2: t.id }
                        };
                        persistMobaMeta();
                        ArcadeAudio.play('click');
                        bump();
                      }}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>

                <div className="lobby3d-kit-item"><strong>Tier 3 — Core Keystone:</strong></div>
                <div className="lobby3d-role-pills">
                  {MOBA_TALENTS_T3.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`lobby3d-role-pill ${activeTalents?.t3 === t.id ? 'active' : ''}`}
                      title={t.summary}
                      onClick={() => {
                        playerState.mobaEmblemTalents = {
                          ...playerState.mobaEmblemTalents,
                          [activeEmblemId]: { ...(activeTalents ?? { t1: 'thrill', t2: 'weapons_master', t3: t.id }), t3: t.id }
                        };
                        persistMobaMeta();
                        ArcadeAudio.play('click');
                        bump();
                      }}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>

                <div className="lobby3d-kit-box">
                  {[
                    MOBA_TALENTS_T1.find((t) => t.id === activeTalents?.t1),
                    MOBA_TALENTS_T2.find((t) => t.id === activeTalents?.t2),
                    MOBA_TALENTS_T3.find((t) => t.id === activeTalents?.t3)
                  ]
                    .filter(Boolean)
                    .map((t) => (
                      <div key={t!.id} className="lobby3d-kit-item">
                        <strong>{t!.icon} {t!.name}:</strong> {t!.summary}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
          <button
            type="button"
            className="lobby3d-cta-btn"
            onClick={() => {
              ArcadeAudio.play('click');
              playerState.mobaTrialHeroId = null;
              setMobaStep('draft');
            }}
          >
            ⚔️ READY FOR DRAFT ROOM
          </button>
        </div>
      </>
    );
  }

  // ---------- TAB 6: PROFILE, ACHIEVEMENTS, SQUAD & BACKPACK ----------
  if (mobaTab === 'profile') {
    const winRate =
      playerState.mobaMatchesPlayed > 0
        ? Math.round((playerState.mobaWins / playerState.mobaMatchesPlayed) * 100)
        : 0;
    const masteryEntries = Object.entries(playerState.mobaHeroMastery)
      .map(([id, entry]) => ({ hero: MOBA_HEROES[Number(id)], entry }))
      .filter((x) => Boolean(x.hero))
      .sort((a, b) => b.entry.mmr - a.entry.mmr);

    const totalOwnedSkins = Object.values(playerState.mobaOwnedSkins).reduce((sum, list) => sum + list.length, 0);
    const achMetricVal = (stat: string): number => {
      if (stat === 'kills') return playerState.mobaKillsTotal;
      if (stat === 'wins') return playerState.mobaWins;
      if (stat === 'turrets') return playerState.mobaTurretsDestroyed;
      if (stat === 'heroes') return playerState.unlockedMobaHeroes.length;
      if (stat === 'skins') return totalOwnedSkins;
      return playerState.mobaMatchesPlayed;
    };

    return (
      <>
        <div className="lobby3d-panel">
          <div className="lobby3d-seg-row three">
            {([
              { id: 'overview', label: 'History' },
              { id: 'mastery', label: 'Achievements' },
              { id: 'squad', label: 'Squad & Bag' }
            ] as const).map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`lobby3d-seg-btn ${profileSub === sub.id ? 'active' : ''}`}
                onClick={() => {
                  ArcadeAudio.play('click');
                  setProfileSub(sub.id);
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {profileSub === 'overview' && (
            <>
              <div className="lobby3d-stat-mini-grid">
                <div className="lobby3d-stat-mini">WIN RATE<b>{winRate}%</b></div>
                <div className="lobby3d-stat-mini">MATCHES<b>{playerState.mobaMatchesPlayed}</b></div>
                <div className="lobby3d-stat-mini">CREDIT<b>{playerState.mobaCreditScore}/110</b></div>
                <div className="lobby3d-stat-mini">COLLECTOR<b>{collectorInfo.points}</b></div>
              </div>
              <div className="lobby3d-sec-title">
                <span>Recent Match History</span>
                <span>Last {playerState.mobaMatchHistory.length}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {playerState.mobaMatchHistory.length === 0 ? (
                  <div className="lobby3d-kit-box">
                    <div className="lobby3d-kit-item">Play a Legends Arena 3D match to record K/D, Hero Mastery MMR, and Win Rate here.</div>
                  </div>
                ) : (
                  playerState.mobaMatchHistory.map((m) => (
                    <div key={m.id} className={`lobby3d-item-card ${m.victory ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">
                          {m.victory ? '🏆 VICTORY' : '💀 DEFEAT'} · {m.heroName} ({m.mode.toUpperCase()})
                        </div>
                        <div className="lobby3d-item-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          K/D {m.kills}/{m.deaths} · {m.medal} · 💰{m.gold} · {Math.floor(m.durationSec / 60)}m {m.durationSec % 60}s
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {profileSub === 'mastery' && (
            <>
              <div className="lobby3d-sec-title">
                <span>🎖️ Achievements</span>
                <span>{playerState.mobaClaimedAchievements.length}/{MOBA_ACHIEVEMENTS.length}</span>
              </div>
              <div className="lobby3d-scroll-list">
                {MOBA_ACHIEVEMENTS.map((ach) => {
                  const cur = achMetricVal(ach.stat);
                  const claimed = playerState.mobaClaimedAchievements.includes(ach.id);
                  const ready = !claimed && cur >= ach.target;
                  const achIcon = ach.category === 'Arena' ? '⚔️' : ach.category === 'Mastery' ? '🏅' : '👑';
                  return (
                    <div key={ach.id} className={`lobby3d-item-card ${ready ? 'selected' : ''}`}>
                      <div className="lobby3d-item-main">
                        <div className="lobby3d-item-title">{achIcon} {ach.title} ({Math.min(cur, ach.target)}/{ach.target})</div>
                        <div className="lobby3d-item-sub">{ach.desc}</div>
                      </div>
                      <button
                        type="button"
                        className="lobby3d-mini-btn"
                        disabled={!ready}
                        onClick={() => {
                          if (!ready) return;
                          playerState.mobaClaimedAchievements = [...playerState.mobaClaimedAchievements, ach.id];
                          playerState.mobaBp += ach.rewardBp;
                          playerState.mobaTickets += ach.rewardTickets;
                          persistMobaMeta();
                          ArcadeAudio.play('levelup');
                          showNotice(`Achievement Unlocked! +${ach.rewardBp} BP & +${ach.rewardTickets}🎫`);
                          bump();
                        }}
                      >
                        {claimed ? 'DONE ✓' : ready ? 'CLAIM' : `💰${ach.rewardBp}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {profileSub === 'squad' && (
            <>
              <div className="lobby3d-sec-title">
                <span>🛡️ Squad Management</span>
                <span>[{playerState.mobaSquad.tag}]</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="lobby3d-search"
                  value={squadNameInput}
                  maxLength={20}
                  onChange={(e) => setSquadNameInput(e.target.value)}
                  placeholder="Squad Name"
                />
                <input
                  type="text"
                  className="lobby3d-search"
                  style={{ width: '72px' }}
                  value={squadTagInput}
                  maxLength={4}
                  onChange={(e) => setSquadTagInput(e.target.value.toUpperCase())}
                  placeholder="TAG"
                />
              </div>
              <button
                type="button"
                className="lobby3d-seg-btn active"
                onClick={() => {
                  playerState.mobaSquad = {
                    ...playerState.mobaSquad,
                    name: squadNameInput.trim() || 'Dawn Vanguards',
                    tag: squadTagInput.trim().slice(0, 4) || 'DAWN'
                  };
                  persistMobaMeta();
                  ArcadeAudio.play('coin');
                  showNotice(`Squad updated to [${playerState.mobaSquad.tag}] ${playerState.mobaSquad.name}!`);
                  bump();
                }}
              >
                SAVE SQUAD IDENTITY
              </button>

              <div className="lobby3d-sec-title"><span>🎒 Backpack Inventory</span></div>
              <div className="lobby3d-card-list">
                <div className="lobby3d-item-card">
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">🃏 Hero Trial Cards: {playerState.mobaBackpack.trialCards}</div>
                    <div className="lobby3d-item-sub">Convert 1 card into +400 BP</div>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={playerState.mobaBackpack.trialCards <= 0}
                    onClick={() => {
                      if (playerState.mobaBackpack.trialCards <= 0) return;
                      playerState.mobaBackpack.trialCards--;
                      playerState.mobaBp += 400;
                      persistMobaMeta();
                      ArcadeAudio.play('coin');
                      showNotice('Converted Trial Card into +400 BP!');
                      bump();
                    }}
                  >
                    USE
                  </button>
                </div>
                <div className="lobby3d-item-card">
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">⚡ Double BP Cards: {playerState.mobaBackpack.doubleBpCards}</div>
                    <div className="lobby3d-item-sub">
                      {playerState.mobaBackpack.activeDoubleBp ? 'Active for next match (2x BP)' : 'Activate for 2x BP next match + 300 BP'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={playerState.mobaBackpack.doubleBpCards <= 0}
                    onClick={() => {
                      if (playerState.mobaBackpack.doubleBpCards <= 0) return;
                      playerState.mobaBackpack.doubleBpCards--;
                      playerState.mobaBackpack.activeDoubleBp = true;
                      playerState.mobaBp += 300;
                      persistMobaMeta();
                      ArcadeAudio.play('coin');
                      showNotice('Activated Double BP Card (2x BP next match + 300 BP)!');
                      bump();
                    }}
                  >
                    ACTIVATE
                  </button>
                </div>
                <div className="lobby3d-item-card">
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">🛡️ Star Protection Cards: {playerState.mobaBackpack.starProtectionCards}</div>
                    <div className="lobby3d-item-sub">Exchange 1 card for +60 Tickets</div>
                  </div>
                  <button
                    type="button"
                    className="lobby3d-mini-btn"
                    disabled={playerState.mobaBackpack.starProtectionCards <= 0}
                    onClick={() => {
                      if (playerState.mobaBackpack.starProtectionCards <= 0) return;
                      playerState.mobaBackpack.starProtectionCards--;
                      playerState.mobaTickets += 60;
                      persistMobaMeta();
                      ArcadeAudio.play('coin');
                      showNotice('Exchanged Star Protection Card for +60 Tickets!');
                      bump();
                    }}
                  >
                    EXCHANGE
                  </button>
                </div>
              </div>
            </>
          )}
          {notice && <div className="lobby3d-notice">{notice}</div>}
        </div>

        <div className="lobby3d-center-spacer">
          <div className="lobby3d-center-caption">
            [{playerState.mobaSquad.tag}] {playerState.username} · {rankTitle} · {collectorInfo.tier.name}
          </div>
        </div>

        <div className="lobby3d-panel">
          <div className="lobby3d-sec-title">
            <span>Hero Mastery & MMR</span>
            <span>{masteryEntries.length} Played</span>
          </div>
          <div className="lobby3d-scroll-list">
            {masteryEntries.length === 0 ? (
              <div className="lobby3d-kit-box">
                <div className="lobby3d-kit-item">
                  Finish matches with any of the 129 heroes to earn Hero Power MMR and Mastery Titles (Novice → Supreme).
                </div>
              </div>
            ) : (
              masteryEntries.map(({ hero, entry }) => (
                <div key={hero.id} className="lobby3d-item-card">
                  <div className="lobby3d-item-main">
                    <div className="lobby3d-item-title">{hero.icon} {hero.name} · {getHeroMasteryTitle(entry.masteryPts)}</div>
                    <div className="lobby3d-item-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      MMR {entry.mmr} · {entry.wins}W / {entry.matches}M · Mastery {entry.masteryPts}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

  // ---------- TAB 7: SETTINGS (CAMERA HEIGHT, OUTLINE, TARGETING, HERO LOCK, DAMAGE TEXT) ----------
  const s = playerState.mobaSettings;
  const updateSetting = <K extends keyof typeof s>(key: K, value: (typeof s)[K]) => {
    playerState.mobaSettings = { ...playerState.mobaSettings, [key]: value };
    persistMobaMeta();
    ArcadeAudio.play('click');
    bump();
  };

  return (
    <>
      <div className="lobby3d-panel">
        <div className="lobby3d-sec-title">
          <span>⚙️ Graphics & Camera</span>
          <span>Live 3D Engine</span>
        </div>

        <div className="lobby3d-kit-item"><strong>Camera Height (Battlefield Zoom):</strong></div>
        <div className="lobby3d-seg-row three">
          {(['low', 'medium', 'high'] as const).map((h) => (
            <button
              key={h}
              type="button"
              className={`lobby3d-seg-btn ${s.cameraHeight === h ? 'active' : ''}`}
              onClick={() => updateSetting('cameraHeight', h)}
            >
              {h.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="lobby3d-item-card">
          <div className="lobby3d-item-main">
            <div className="lobby3d-item-title">🖋️ 3D Hero Ink Outlines</div>
            <div className="lobby3d-item-sub">Crisp dark cel-outline around 3D heroes</div>
          </div>
          <button
            type="button"
            className="lobby3d-mini-btn"
            onClick={() => updateSetting('outline', !s.outline)}
          >
            {s.outline ? 'ON ✓' : 'OFF'}
          </button>
        </div>

        <div className="lobby3d-item-card">
          <div className="lobby3d-item-main">
            <div className="lobby3d-item-title">💥 Floating Damage Numbers</div>
            <div className="lobby3d-item-sub">Color-coded Physical, Magic, True, Crit & Heal</div>
          </div>
          <button
            type="button"
            className="lobby3d-mini-btn"
            onClick={() => updateSetting('damageText', !s.damageText)}
          >
            {s.damageText ? 'ON ✓' : 'OFF'}
          </button>
        </div>

        <div className="lobby3d-sec-title" style={{ marginTop: '6px' }}>
          <span>🧩 Interface & Shop HUD</span>
          <span>{s.shopOpacity ?? 90}%</span>
        </div>
        <div className="lobby3d-kit-box">
          <div className="lobby3d-kit-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <strong>Shop & Quick-Buy Opacity:</strong>
            <input
              type="range"
              min={20}
              max={100}
              value={s.shopOpacity ?? 90}
              onChange={(e) => updateSetting('shopOpacity', Number(e.target.value))}
              style={{ flex: 1, maxWidth: '140px', accentColor: '#38bdf8' }}
            />
          </div>
        </div>
        <div className="lobby3d-seg-row">
          <button
            type="button"
            className={`lobby3d-seg-btn ${(s.shopSide ?? 'left') === 'left' ? 'active' : ''}`}
            onClick={() => updateSetting('shopSide', 'left')}
          >
            ◀ SHOP LEFT
          </button>
          <button
            type="button"
            className={`lobby3d-seg-btn ${s.shopSide === 'right' ? 'active' : ''}`}
            onClick={() => updateSetting('shopSide', 'right')}
          >
            SHOP RIGHT ▶
          </button>
        </div>
      </div>

      <div className="lobby3d-center-spacer">
        <div className="lobby3d-center-caption">
          Camera: {s.cameraHeight.toUpperCase()} · Shop: {(s.shopSide ?? 'left').toUpperCase()} ({s.shopOpacity ?? 90}%) · Hero Lock: {s.heroLockMode ? 'ON' : 'OFF'}
        </div>
      </div>

      <div className="lobby3d-panel">
        <div className="lobby3d-sec-title">
          <span>🎯 Controls & Targeting</span>
          <span>MLBB Pro</span>
        </div>

        <div className="lobby3d-kit-item"><strong>Auto-Target Priority:</strong></div>
        <div className="lobby3d-seg-row">
          <button
            type="button"
            className={`lobby3d-seg-btn ${s.targetPriority === 'lowest_hp' ? 'active' : ''}`}
            onClick={() => updateSetting('targetPriority', 'lowest_hp')}
          >
            ❤️ LOWEST HP
          </button>
          <button
            type="button"
            className={`lobby3d-seg-btn ${s.targetPriority === 'closest' ? 'active' : ''}`}
            onClick={() => updateSetting('targetPriority', 'closest')}
          >
            📍 CLOSEST TARGET
          </button>
        </div>

        <div className="lobby3d-item-card">
          <div className="lobby3d-item-main">
            <div className="lobby3d-item-title">🔒 Hero Lock Mode</div>
            <div className="lobby3d-item-sub">Shows clickable enemy hero portraits in battle to force-focus attacks & skills</div>
          </div>
          <button
            type="button"
            className="lobby3d-mini-btn"
            onClick={() => updateSetting('heroLockMode', !s.heroLockMode)}
          >
            {s.heroLockMode ? 'ON ✓' : 'OFF'}
          </button>
        </div>

        <div className="lobby3d-kit-item" style={{ marginTop: '4px' }}>
          <strong>🗺️ Annual Map Variant Default:</strong>
        </div>
        <div className="moba-variant-toggle-row">
          {(['random', 'revealing_wisps', 'healing_turtle', 'golden_turret', 'flying_cloud'] as MobaMapVariantSetting[]).map(
            (vid) => {
              const vDef = vid === 'random' ? null : getMapVariantDef(vid);
              return (
                <button
                  key={vid}
                  type="button"
                  className={`lobby3d-seg-btn ${(s.mapVariantOverride ?? 'random') === vid ? 'active' : ''}`}
                  onClick={() => updateSetting('mapVariantOverride', vid)}
                >
                  {vDef ? `${vDef.icon} ${vDef.shortName}` : '🎲 Random'}
                </button>
              );
            }
          )}
        </div>

        <button
          type="button"
          className="lobby3d-cta-btn"
          onClick={() => {
            ArcadeAudio.play('click');
            playerState.mobaTrialHeroId = null;
            setMobaStep('draft');
          }}
        >
          ⚔️ APPLY & ENTER DRAFT ROOM
        </button>
      </div>
    </>
  );
};
