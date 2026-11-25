import React from "react";
import { ArcadeAudio } from "../audio";
import {
  ALL_MOBA_SHOP_ITEMS,
  computeEffectiveItemCost,
  computeSellRefund,
  formatMatchClock,
  getItemRecipe,
  getMobaBlessingById,
  getMobaEquipmentById,
  getQuickBuyPair,
  MOBA_BASIC_ITEMS,
  MOBA_BOOT_BLESSINGS,
  MOBA_EQUIPMENT_ITEMS,
  MOBA_INTERMEDIATE_ITEMS,
  MobaEquipmentCategory,
  SENKI_RAMEN_ITEMS,
  STORM_NINJA_TOOLS
} from "../arenaRoster";
import { HoopsHudSnapshot, MobaHudSnapshot, NarutoHudSnapshot } from "../runtimeBridge";
import { persistMobaMeta, playerState } from "../storage";
import { mapClientDeltaToStage } from "../viewport";

export interface ArcadeLegacyGameHudsCtx {
  hoopsHud: HoopsHudSnapshot | null;
  mobaHud: MobaHudSnapshot | null;
  narutoHud: NarutoHudSnapshot | null;
  setShowMobaShop: React.Dispatch<React.SetStateAction<boolean>>;
  setShowExpandedMinimap: React.Dispatch<React.SetStateAction<boolean>>;
  setMobaEmoteWheelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMobaEmoteHoverSlot: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3 | null>>;
  setHoopsPostTab: React.Dispatch<React.SetStateAction<'box' | 'vc' | 'badges' | 'rep'>>;
  [key: string]: any;
}

export function ArcadeLegacyGameHuds({ ctx }: { ctx: ArcadeLegacyGameHudsCtx }) {
  const {
    activeGameRef,
    difficultyRef,
    dragEditMode,
    healthCur,
    healthDmgFlash,
    healthMax,
    healthPct,
    healthTrailPct,
    hoopsHud,
    hoopsPostTab,
    isGameActive,
    mobaAimThumbRef,
    mobaCancelZoneRef,
    mobaEmoteDragRef,
    mobaEmoteHoverSlot,
    mobaEmoteWheelOpen,
    mobaHud,
    mobaShopCat,
    mobaShopOpacity,
    mobaShopSide,
    mobaSkillAimUi,
    narutoHud,
    selectedGameIdx,
    selectedMeta,
    selectedMobaBlessingId,
    selectedMobaShopItemId,
    setActiveLobbyGame,
    setHoopsPostTab,
    setMobaEmoteHoverSlot,
    setMobaEmoteWheelOpen,
    setMobaShopCat,
    setMobaShopOpacity,
    setMobaShopSide,
    setSelectedMobaBlessingId,
    setSelectedMobaShopItemId,
    setShowExpandedMinimap,
    setShowMobaShop,
    showExpandedMinimap,
    showMobaShop,
    startGame,
    stopGame
  } = ctx;

  return (
    <>
      {/* LEGENDS ARENA 3D DRAG-TO-AIM RADIAL WHEEL & DRAG-TO-CANCEL X ZONE */}
      {isGameActive && selectedGameIdx === 25 && mobaSkillAimUi?.active && (
        <>
          {mobaSkillAimUi.mode === 'drag' && (
            <div
              className={`moba-skill-aim-wheel ${mobaSkillAimUi.cancelled ? 'cancelled' : ''}`}
              id="mobaSkillAimWheel"
              style={
                {
                  left: `${mobaSkillAimUi.cx}px`,
                  top: `${mobaSkillAimUi.cy}px`,
                  '--aim-color': mobaSkillAimUi.cancelled ? '#ef4444' : mobaSkillAimUi.color
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="moba-skill-aim-cross" />
              <div ref={mobaAimThumbRef} className="moba-skill-aim-thumb">
                <span>{mobaSkillAimUi.icon}</span>
              </div>
            </div>
          )}
          {mobaSkillAimUi.mode === 'cursor' && (
            <div className={`moba-cursor-aim-banner ${mobaSkillAimUi.cancelled ? 'cancelled' : ''}`} id="mobaCursorAimBanner">
              {mobaSkillAimUi.cancelled
                ? '✕ RELEASE TO CANCEL SKILL'
                : `🎯 AIMING ${mobaSkillAimUi.label} · Move Mouse to Aim · Release / Click to Cast · Right-Click / Esc Cancel`}
            </div>
          )}
          <div
            ref={mobaCancelZoneRef}
            id="mobaSkillCancelZone"
            className={`moba-skill-cancel-zone ${mobaSkillAimUi.cancelled ? 'armed' : ''}`}
            aria-label="Drag here to cancel skill"
          >
            <span className="moba-cancel-x">✕</span>
            <span className="moba-cancel-lbl">{mobaSkillAimUi.cancelled ? 'RELEASE' : 'CANCEL'}</span>
          </div>
        </>
      )}

      {/* LEGENDS ARENA 3D IN-BATTLE SHOP BAR (LEFT/RIGHT DOCK), 2-SLOT QUICK-BUY, EXPAND MINIMAP, BUFF STRIP & HERO LOCK */}
      {isGameActive && selectedGameIdx === 25 && mobaHud && (() => {
        const qbPair = getQuickBuyPair(
          mobaHud.heroRole,
          mobaHud.equippedItemIds,
          mobaHud.blessingId,
          mobaHud.gold,
          mobaHud.customBuildIds,
          mobaHud.prioritizedItemId
        );
        const activeBlessing = getMobaBlessingById(mobaHud.blessingId);
        const effShopSide = mobaShopSide ?? playerState.mobaSettings.shopSide ?? 'left';
        const objBanner = mobaHud.objectiveBanner;
        return (
          <>
            <div
              className={`moba-battle-shop-strip ${effShopSide === 'right' ? 'dock-right' : ''}`}
              id="mobaBattleShopStrip"
            >
              <button
                type="button"
                id="btnOpenMobaShop"
                className="moba-shop-open-btn"
                onClick={() => {
                  ArcadeAudio.play('click');
                  setMobaShopOpacity(playerState.mobaSettings.shopOpacity ?? 90);
                  setMobaShopSide(playerState.mobaSettings.shopSide ?? 'left');
                  setShowMobaShop(true);
                }}
              >
                <span>🛒 SHOP</span>
                <span className="moba-gold-pill" id="mobaGoldVal">🪙 {mobaHud.gold}</span>
              </button>

              <div className="moba-mini-slots" aria-label="Equipped Items">
                {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                  const eqId = mobaHud.equippedItemIds[slotIdx];
                  const eqItem = eqId ? getMobaEquipmentById(eqId) : undefined;
                  return (
                    <button
                      key={slotIdx}
                      type="button"
                      className={`moba-mini-slot ${eqItem ? 'filled' : ''}`}
                      title={eqItem ? `${eqItem.name} (${eqItem.statsSummary})` : `Empty Slot ${slotIdx + 1}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        if (eqItem) {
                          setMobaShopCat(eqItem.category);
                          setSelectedMobaShopItemId(eqItem.id);
                        }
                        setShowMobaShop(true);
                      }}
                    >
                      {eqItem ? eqItem.icon : '·'}
                    </button>
                  );
                })}
                {activeBlessing && (
                  <span className="moba-mini-blessing" title={activeBlessing.name}>
                    {activeBlessing.icon}
                  </span>
                )}
              </div>

              {qbPair.map((rec, idx) => (
                <button
                  key={`${rec.id}-${idx}`}
                  type="button"
                  id={idx === 0 ? 'btnMobaQuickBuy' : 'btnMobaQuickBuy2'}
                  className={`moba-quick-buy-btn ${rec.canAfford ? 'affordable' : ''}`}
                  title={`Quick-Buy ${rec.name} (${rec.cost === 0 ? 'FREE' : `${rec.cost}g`}): ${rec.statsLabel}`}
                  onClick={() => {
                    activeGameRef.current?.quickBuy?.(rec.id);
                  }}
                >
                  <span>{rec.icon}</span>
                  <span className="moba-qb-meta">
                    <strong>{rec.shortName}</strong>
                    <em>{rec.cost === 0 ? 'FREE' : `🪙${rec.cost}`}</em>
                  </span>
                </button>
              ))}

              {objBanner && (
                <button
                  type="button"
                  id="btnMobaObjectiveBadge"
                  className="moba-obj-badge-btn"
                  title={`${mobaHud.mapVariantName || 'Land of Dawn'}: ${mobaHud.mapVariantSummary || ''} · Click to expand tactical map`}
                  onClick={() => {
                    ArcadeAudio.play('click');
                    setShowExpandedMinimap((v) => !v);
                  }}
                >
                  <span>{objBanner.kind === 'lord' ? '🐉' : '🐢'}</span>
                  <span className="moba-qb-meta">
                    <strong>{objBanner.alive ? (objBanner.kind === 'lord' ? `LORD S${objBanner.stage}` : 'TURTLE') : formatMatchClock(objBanner.countdownSec)}</strong>
                    <em>{mobaHud.mapVariantIcon || '🗺️'} {mobaHud.expLaneSide === 'top' ? 'EXP↑' : 'EXP↓'}</em>
                  </span>
                </button>
              )}

              {mobaHud.nearFlyingCloud && mobaHud.flyingCloudReady && (
                <button
                  type="button"
                  id="btnMobaFlyingCloud"
                  className="moba-quick-buy-btn affordable"
                  title="Launch over Base Walls on the Flying Cloud!"
                  onClick={() => {
                    activeGameRef.current?.activateFlyingCloud?.();
                  }}
                >
                  <span>☁️</span>
                  <span className="moba-qb-meta">
                    <strong>FLY</strong>
                    <em>LAUNCH</em>
                  </span>
                </button>
              )}
            </div>

            {/* Expand Minimap Button (🔍) pinned to top-right minimap corner */}
            <button
              type="button"
              id="btnExpandMobaMinimap"
              className="moba-minimap-expand-btn"
              title="Expand Tactical Ping Map"
              aria-label="Expand Tactical Ping Map"
              onClick={() => {
                ArcadeAudio.play('click');
                setShowExpandedMinimap((v) => !v);
              }}
            >
              🔍
            </button>

            {/* In-Match Hero Emote Trigger Button & 4-Slot Radial Emote Wheel */}
            {!dragEditMode && (mobaHud.equippedEmotes?.length ?? 0) > 0 && (() => {
              const emotes = mobaHud.equippedEmotes ?? [];
              const emoteOnCd = (mobaHud.emoteCd ?? 0) > 0;
              const resolveDragSlot = (dx: number, dy: number): 0 | 1 | 2 | 3 => {
                const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
                if (deg >= -135 && deg < -45) return 0; // Top
                if (deg >= -45 && deg < 45) return 1; // Right
                if (deg >= 45 && deg < 135) return 2; // Bottom
                return 3; // Left
              };
              const fireEmoteSlot = (slotIdx: 0 | 1 | 2 | 3) => {
                activeGameRef.current?.triggerEmote?.(slotIdx);
                setMobaEmoteWheelOpen(false);
                setMobaEmoteHoverSlot(null);
              };
              return (
                <>
                  {mobaEmoteWheelOpen && (
                    <div
                      className="moba-emote-backdrop"
                      aria-hidden="true"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setMobaEmoteWheelOpen(false);
                        setMobaEmoteHoverSlot(null);
                      }}
                    />
                  )}
                  <div className="moba-emote-dock" id="mobaEmoteDock">
                    <button
                      type="button"
                      id="mobaEmoteBtn"
                      className={`moba-emote-btn ${mobaEmoteWheelOpen ? 'open' : ''} ${emoteOnCd ? 'on-cd' : ''}`}
                      title="Emote Wheel [T] · Tap or Press & Drag to Emote"
                      aria-label="Open Emote Radial Menu"
                      aria-expanded={mobaEmoteWheelOpen}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        mobaEmoteDragRef.current = {
                          active: true,
                          pointerId: e.pointerId,
                          startX: e.clientX,
                          startY: e.clientY,
                          didDrag: false,
                          hoverSlot: null
                        };
                        e.currentTarget.setPointerCapture?.(e.pointerId);
                      }}
                      onPointerMove={(e) => {
                        const drag = mobaEmoteDragRef.current;
                        if (!drag.active || drag.pointerId !== e.pointerId) return;
                        const { dx, dy } = mapClientDeltaToStage(e.clientX - drag.startX, e.clientY - drag.startY);
                        const dist = Math.hypot(dx, dy);
                        if (dist >= 18) {
                          if (!drag.didDrag) {
                            drag.didDrag = true;
                            setMobaEmoteWheelOpen(true);
                          }
                          const slot = resolveDragSlot(dx, dy);
                          if (drag.hoverSlot !== slot) {
                            drag.hoverSlot = slot;
                            setMobaEmoteHoverSlot(slot);
                          }
                        } else if (drag.didDrag && drag.hoverSlot !== null) {
                          drag.hoverSlot = null;
                          setMobaEmoteHoverSlot(null);
                        }
                      }}
                      onPointerUp={(e) => {
                        const drag = mobaEmoteDragRef.current;
                        if (!drag.active || drag.pointerId !== e.pointerId) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const didDrag = drag.didDrag;
                        const hoverSlot = drag.hoverSlot;
                        drag.active = false;
                        drag.pointerId = null;
                        drag.didDrag = false;
                        drag.hoverSlot = null;
                        if (didDrag) {
                          if (hoverSlot !== null) {
                            fireEmoteSlot(hoverSlot);
                          } else {
                            setMobaEmoteWheelOpen(false);
                            setMobaEmoteHoverSlot(null);
                          }
                        } else {
                          ArcadeAudio.play('click');
                          setMobaEmoteWheelOpen((v) => !v);
                          setMobaEmoteHoverSlot(null);
                        }
                      }}
                      onPointerCancel={() => {
                        mobaEmoteDragRef.current.active = false;
                        mobaEmoteDragRef.current.pointerId = null;
                        setMobaEmoteHoverSlot(null);
                      }}
                    >
                      <span className="moba-emote-btn-icon">{mobaEmoteWheelOpen ? '✕' : '😊'}</span>
                      <span className="moba-emote-btn-lbl">
                        {emoteOnCd ? `${Math.ceil(mobaHud.emoteCd ?? 0)}s` : 'EMOTE'}
                      </span>
                    </button>

                    {mobaEmoteWheelOpen && (
                      <div
                        className="moba-emote-wheel"
                        id="mobaEmoteWheel"
                        role="menu"
                        aria-label="Equipped Hero Emotes"
                      >
                        <div className="moba-emote-wheel-ring" aria-hidden="true" />
                        {emotes.slice(0, 4).map((em) => (
                          <button
                            key={`${em.slot}-${em.id}`}
                            type="button"
                            role="menuitem"
                            id={`mobaEmoteSlot${em.slot}`}
                            className={`moba-emote-slice slot-${em.slot} ${mobaEmoteHoverSlot === em.slot ? 'hovered' : ''} ${emoteOnCd ? 'on-cd' : ''}`}
                            style={{ '--emote-color': em.colorHex } as React.CSSProperties}
                            title={`${em.name} [${em.slot + 1}]`}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              fireEmoteSlot(em.slot);
                            }}
                          >
                            <span className="moba-emote-slice-key">{em.slot + 1}</span>
                            <span className="moba-emote-slice-icon">{em.icon}</span>
                            <span className="moba-emote-slice-text">{em.callout}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          className="moba-emote-center-close"
                          aria-label="Close Emote Wheel"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            ArcadeAudio.play('click');
                            setMobaEmoteWheelOpen(false);
                            setMobaEmoteHoverSlot(null);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Bottom-Center Active Buffs & Jungler / Roam Stack Tracker Strip */}
            {((mobaHud.activeBuffs?.length ?? 0) > 0 || mobaHud.isJungler || mobaHud.hasRoamBlessing) && (
              <div className="moba-active-buff-strip" id="mobaActiveBuffStrip" aria-label="Active Buffs and Role Stacks">
                {mobaHud.isJungler && (
                  <div className="moba-stack-pill jungler" id="mobaJunglerStackBadge" title="Jungler Retribution Stacks (5/5 evolves Retribution)">
                    <span>🩸</span>
                    <span className="moba-stack-val">{mobaHud.junglerStacks ?? 0}/5</span>
                  </div>
                )}
                {mobaHud.hasRoamBlessing && (
                  <div className="moba-stack-pill roam" id="mobaRoamStackBadge" title="Roam Blessing Gold Progress (600/600 unlocks full blessing)">
                    <span>🛡️</span>
                    <span className="moba-stack-val">{mobaHud.roamGold ?? 0}/600</span>
                  </div>
                )}
                {(mobaHud.activeBuffs ?? []).map((bf) => {
                  const pct = Math.max(0, Math.min(100, Math.round((bf.remainingSec / Math.max(1, bf.maxSec)) * 100)));
                  return (
                    <div
                      key={bf.id}
                      className="moba-buff-clock-chip"
                      title={`${bf.label}: ${bf.remainingSec}s remaining`}
                      style={{
                        backgroundImage: `conic-gradient(${bf.color} ${pct}%, rgba(15,23,42,0.85) ${pct}%)`
                      }}
                    >
                      <div className="moba-buff-clock-inner">
                        <span>{bf.icon}</span>
                        <em>{bf.remainingSec}s</em>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {mobaHud.iconicUltLabel && (
              <div className="moba-iconic-ult-banner" id="mobaIconicUltBanner">
                {mobaHud.iconicUltLabel}
              </div>
            )}

            {playerState.mobaSettings.heroLockMode && (mobaHud.enemyHeroes?.length ?? 0) > 0 && (
              <div className="moba-hero-lock-bar" id="mobaHeroLockBar" aria-label="Hero Lock Targets">
                {(mobaHud.enemyHeroes ?? []).map((eh) => {
                  const locked = mobaHud.lockedEnemyId === eh.id;
                  return (
                    <button
                      key={eh.id}
                      type="button"
                      disabled={!eh.alive}
                      className={`moba-hero-lock-btn ${locked ? 'locked' : ''} ${!eh.alive ? 'dead' : ''}`}
                      title={locked ? `Unlock ${eh.name}` : `Lock Target: ${eh.name} (${eh.hpPct}% HP)`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        (activeGameRef.current as unknown as { setLockedEnemy?: (id: number | null) => void })?.setLockedEnemy?.(
                          locked ? null : eh.id
                        );
                      }}
                    >
                      <span className="moba-hl-icon">{eh.icon}</span>
                      <span className="moba-hl-name">{eh.name.slice(0, 6)}</span>
                      <span className="moba-hl-hp">
                        <span style={{ width: `${eh.hpPct}%` }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* EXPANDED TACTICAL PING MAP OVERLAY */}
            {showExpandedMinimap && mobaHud.minimapData && (
              <div
                className="moba-expanded-map-backdrop"
                id="mobaExpandedMapModal"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setShowExpandedMinimap(false);
                }}
              >
                <div className="moba-expanded-map-card">
                  <div className="moba-expanded-map-head">
                    <div>
                      <strong>🗺️ TACTICAL PING MAP · {formatMatchClock(mobaHud.matchElapsedSec ?? 0)}</strong>
                      <div className="moba-expanded-map-sub">
                        {mobaHud.mapVariantIcon} {mobaHud.mapVariantName} · EXP {mobaHud.expLaneSide?.toUpperCase()} / GOLD {mobaHud.goldLaneSide?.toUpperCase()} · Tap map to broadcast ping
                      </div>
                    </div>
                    <button
                      type="button"
                      id="btnCloseExpandedMinimap"
                      className="moba-shop-close-btn"
                      onClick={() => setShowExpandedMinimap(false)}
                    >
                      ✖
                    </button>
                  </div>

                  <div className="moba-expanded-map-body">
                    <div
                      className="moba-expanded-map-canvas"
                      id="mobaExpandedMapSurface"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const nx = (e.clientX - rect.left) / Math.max(1, rect.width);
                        const nz = (e.clientY - rect.top) / Math.max(1, rect.height);
                        const zone =
                          nx < 0.35 && nz < 0.35
                            ? 'Top Lane'
                            : nx > 0.65 && nz > 0.65
                              ? 'Bot Lane'
                              : Math.abs(nx - nz) < 0.22
                                ? 'River Objective'
                                : 'Mid Jungle';
                        activeGameRef.current?.sendMapPing?.('gather', nx, nz, `Gather at ${zone}!`);
                      }}
                    >
                      {/* Lanes & River SVG backdrop */}
                      <svg viewBox="0 0 100 100" className="moba-map-svg" aria-hidden="true">
                        <rect width="100" height="100" fill="#14532d" />
                        <path d="M 8 92 L 8 8 L 92 8" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M 8 92 L 92 8" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M 8 92 L 92 92 L 92 8" stroke="#64748b" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M 4 4 L 96 96" stroke="#0ea5e9" strokeWidth="5" fill="none" opacity="0.85" />
                      </svg>

                      {/* Dynamic EXP & Gold Lane badges */}
                      <span
                        className="moba-map-lane-tag exp"
                        style={{
                          left: mobaHud.expLaneSide === 'top' ? '12%' : '74%',
                          top: mobaHud.expLaneSide === 'top' ? '26%' : '88%'
                        }}
                      >
                        📜 EXP
                      </span>
                      <span
                        className="moba-map-lane-tag gold"
                        style={{
                          left: mobaHud.goldLaneSide === 'top' ? '12%' : '74%',
                          top: mobaHud.goldLaneSide === 'top' ? '26%' : '88%'
                        }}
                      >
                        🪙 GOLD
                      </span>

                      {/* Cyclone Eyes */}
                      {mobaHud.minimapData.cycloneEyes.map((ce) => (
                        <span
                          key={ce.id}
                          className={`moba-map-cyclone ${ce.ready ? 'ready' : ''}`}
                          style={{ left: `${ce.nx * 100}%`, top: `${ce.nz * 100}%` }}
                          title={ce.ready ? 'Cyclone Eye (Ready)' : `Cyclone Eye (${ce.cdSec}s)`}
                        >
                          ◆
                        </span>
                      ))}

                      {/* Turrets */}
                      {mobaHud.minimapData.turrets.map((t, i) => (
                        <span
                          key={`t-${i}`}
                          className={`moba-map-turret ${t.team} ${t.isNexus ? 'nexus' : ''} ${t.shield ? 'shielded' : ''}`}
                          style={{ left: `${t.nx * 100}%`, top: `${t.nz * 100}%` }}
                        />
                      ))}

                      {/* Camps & Timers */}
                      {mobaHud.minimapData.camps.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`moba-map-camp ${c.kind} ${c.alive ? 'alive' : 'dead'}`}
                          style={{ left: `${c.nx * 100}%`, top: `${c.nz * 100}%` }}
                          title={`${c.label} (${c.alive ? 'LIVE' : formatMatchClock(c.respawnSec)})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const pKind = c.kind === 'lord' ? 'lord' : c.kind === 'turtle' ? 'turtle' : 'gather';
                            const msg =
                              c.kind === 'lord'
                                ? 'Attack the Lord!'
                                : c.kind === 'turtle'
                                  ? 'Gather at the Turtle!'
                                  : `Secure ${c.label}!`;
                            activeGameRef.current?.sendMapPing?.(pKind, c.nx, c.nz, msg);
                          }}
                        >
                          {c.alive
                            ? c.icon
                            : c.kind === 'turtle' || c.kind === 'lord'
                              ? formatMatchClock(c.respawnSec)
                              : `:${String(c.respawnSec).padStart(2, '0')}`}
                        </button>
                      ))}

                      {/* Heroes & Player */}
                      {mobaHud.minimapData.heroes.map((h, i) => (
                        <span
                          key={`h-${i}`}
                          className={`moba-map-hero ${h.isLord ? 'lord' : h.team}`}
                          style={{ left: `${h.nx * 100}%`, top: `${h.nz * 100}%` }}
                        />
                      ))}
                      <span
                        className="moba-map-player"
                        style={{
                          left: `${mobaHud.minimapData.playerNx * 100}%`,
                          top: `${mobaHud.minimapData.playerNz * 100}%`
                        }}
                      />
                    </div>

                    <div className="moba-expanded-map-actions">
                      <button
                        type="button"
                        className="moba-ping-action-btn turtle"
                        onClick={() => {
                          const pitPos = objBanner?.pit === 'upper' ? [0.36, 0.36] : [0.64, 0.64];
                          activeGameRef.current?.sendMapPing?.('turtle', pitPos[0], pitPos[1], 'Gather at the Turtle!');
                        }}
                      >
                        🐢 Gather at Turtle!
                      </button>
                      <button
                        type="button"
                        className="moba-ping-action-btn lord"
                        onClick={() => {
                          const pitPos = objBanner?.pit === 'upper' ? [0.36, 0.36] : [0.64, 0.64];
                          activeGameRef.current?.sendMapPing?.('lord', pitPos[0], pitPos[1], 'Attack the Lord!');
                        }}
                      >
                        🐉 Attack the Lord!
                      </button>
                      <button
                        type="button"
                        className="moba-ping-action-btn gather"
                        onClick={() => {
                          activeGameRef.current?.sendMapPing?.('gather', 0.5, 0.5, 'Gather Mid for Teamfight!');
                        }}
                      >
                        ⚔️ Gather Mid!
                      </button>
                      <button
                        type="button"
                        className="moba-ping-action-btn retreat"
                        onClick={() => {
                          activeGameRef.current?.sendMapPing?.(
                            'retreat',
                            mobaHud.minimapData?.playerNx ?? 0.2,
                            mobaHud.minimapData?.playerNz ?? 0.8,
                            'Retreat & Defend Base!'
                          );
                        }}
                      >
                        🛡️ Retreat!
                      </button>
                      {mobaHud.tacticalPingText && (
                        <div className="moba-ping-live-note" id="mobaPingLiveNote">{mobaHud.tacticalPingText}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* LEGENDS ARENA 3D UPGRADED IN-MATCH EQUIPMENT STORE (7 CATEGORIES, CRAFTING TREE, PRIORITIZE, 3 PRESETS, OPACITY) */}
      {isGameActive && selectedGameIdx === 25 && mobaHud && showMobaShop && (() => {
        const isBlessingCat = mobaShopCat === 'jungling' || mobaShopCat === 'roaming';
        const recommendedItems = (mobaHud.customBuildIds ?? [])
          .map((id) => getMobaEquipmentById(id))
          .filter((x): x is NonNullable<typeof x> => Boolean(x));

        const tier3Items =
          mobaShopCat === 'recommended'
            ? recommendedItems
            : isBlessingCat
              ? []
              : MOBA_EQUIPMENT_ITEMS.filter((it) => it.category === mobaShopCat);
        const tier2Items =
          mobaShopCat === 'recommended' || isBlessingCat
            ? []
            : MOBA_INTERMEDIATE_ITEMS.filter((it) => it.category === mobaShopCat);
        const tier1Items =
          mobaShopCat === 'recommended' || isBlessingCat
            ? []
            : MOBA_BASIC_ITEMS.filter((it) => it.category === mobaShopCat);

        const blessingList =
          mobaShopCat === 'jungling'
            ? MOBA_BOOT_BLESSINGS.filter((b) => b.kind === 'jungling')
            : mobaShopCat === 'roaming'
              ? MOBA_BOOT_BLESSINGS.filter((b) => b.kind === 'roaming')
              : [];

        const selItem = getMobaEquipmentById(selectedMobaShopItemId) || tier3Items[0] || ALL_MOBA_SHOP_ITEMS[0];
        const selBlessing = getMobaBlessingById(selectedMobaBlessingId) || blessingList[0] || MOBA_BOOT_BLESSINGS[0];
        const hasBootsEquipped = mobaHud.equippedItemIds.some(
          (id) => getMobaEquipmentById(id)?.category === 'movement'
        );
        const selCostInfo = computeEffectiveItemCost(selItem.id, mobaHud.equippedItemIds);
        const selNetCost = selCostInfo?.netCost ?? selItem.cost;
        const selConsumedCount = selCostInfo?.consumedSlotIndices.length ?? 0;
        const selRecipeIds = getItemRecipe(selItem.id);
        const isUpgradingBoots =
          selItem.category === 'movement' &&
          selItem.tier === 3 &&
          mobaHud.equippedItemIds.includes('basic_boots');
        const bootsBlocked = selItem.category === 'movement' && hasBootsEquipped && !isUpgradingBoots;
        const slotsBlocked = mobaHud.equippedItemIds.length - selConsumedCount >= 6;
        const modalAlpha = Math.max(0.25, Math.min(1, mobaShopOpacity / 100));

        return (
          <div
            className="moba-shop-modal-backdrop"
            id="mobaShopModal"
            style={{ background: `rgba(5, 9, 18, ${(modalAlpha * 0.72).toFixed(2)})` }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowMobaShop(false);
            }}
          >
            <div
              className="moba-shop-modal-card moba-shop-3col"
              style={{
                background: `rgba(11, 19, 36, ${modalAlpha.toFixed(2)})`,
                opacity: Math.max(0.42, modalAlpha)
              }}
            >
              <div className="moba-shop-header">
                <div className="moba-shop-title-wrap">
                  <span className="moba-shop-title">🎒 BATTLEFIELD EQUIPMENT STORE</span>
                  <span className="moba-shop-sub">
                    {mobaHud.heroName} ({mobaHud.heroRole}) · ATK {mobaHud.combatStats.atk} · HP {mobaHud.combatStats.maxHp} · DEF {mobaHud.combatStats.physDef}/{mobaHud.combatStats.magicDef} · CDR {mobaHud.combatStats.cdrPct}%
                  </span>
                </div>
                <div className="moba-shop-header-right">
                  {mobaHud.presetNames && mobaHud.presetNames.length > 0 && (
                    <select
                      id="mobaShopPresetSelect"
                      className="moba-shop-preset-select"
                      aria-label="Build Preset"
                      value={mobaHud.activePresetIdx ?? 0}
                      onChange={(e) => {
                        activeGameRef.current?.setBuildPreset?.(Number(e.target.value));
                      }}
                    >
                      {mobaHud.presetNames.map((pname, pi) => (
                        <option key={pname} value={pi}>
                          📋 {pname}
                        </option>
                      ))}
                    </select>
                  )}

                  <label className="moba-shop-opacity-wrap" title="Battlefield Store Opacity (see 3D map behind shop)">
                    <span>👁️ {mobaShopOpacity}%</span>
                    <input
                      id="mobaShopOpacitySlider"
                      type="range"
                      min={25}
                      max={100}
                      value={mobaShopOpacity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMobaShopOpacity(val);
                        playerState.mobaSettings = { ...playerState.mobaSettings, shopOpacity: val };
                        persistMobaMeta();
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    id="btnToggleMobaShopSide"
                    className="moba-shop-dock-btn"
                    title="Toggle Quick-Buy HUD Left/Right Position"
                    onClick={() => {
                      const nextSide = mobaShopSide === 'left' ? 'right' : 'left';
                      setMobaShopSide(nextSide);
                      playerState.mobaSettings = { ...playerState.mobaSettings, shopSide: nextSide };
                      persistMobaMeta();
                      ArcadeAudio.play('click');
                    }}
                  >
                    {mobaShopSide === 'left' ? '◀ HUD L' : 'HUD R ▶'}
                  </button>

                  <span className="moba-shop-gold-badge" id="mobaShopModalGold">🪙 {mobaHud.gold}</span>
                  <button
                    type="button"
                    id="btnCloseMobaShop"
                    className="moba-shop-close-btn"
                    aria-label="Close Equipment Shop"
                    onClick={() => setShowMobaShop(false)}
                  >
                    ✖
                  </button>
                </div>
              </div>

              <div className="moba-shop-body-3col">
                {/* 7 Left Sidebar Categories */}
                <div className="moba-shop-sidebar" role="tablist">
                  {(
                    [
                      ['recommended', '⭐ Build'],
                      ['attack', '⚔️ Attack'],
                      ['magic', '🔮 Magic'],
                      ['defense', '🛡️ Defense'],
                      ['movement', '👢 Boots'],
                      ['jungling', '🌲 Jungle'],
                      ['roaming', '🛡️ Roam']
                    ] as ['recommended' | MobaEquipmentCategory | 'jungling' | 'roaming', string][]
                  ).map(([catKey, label]) => (
                    <button
                      key={catKey}
                      type="button"
                      data-shop-tab={catKey}
                      className={`moba-shop-side-btn ${mobaShopCat === catKey ? 'active' : ''}`}
                      onClick={() => {
                        ArcadeAudio.play('click');
                        setMobaShopCat(catKey);
                        if (catKey === 'jungling' || catKey === 'roaming') {
                          const firstB = MOBA_BOOT_BLESSINGS.find((b) => b.kind === catKey);
                          if (firstB) setSelectedMobaBlessingId(firstB.id);
                        } else if (catKey === 'recommended') {
                          const firstR = recommendedItems[0];
                          if (firstR) setSelectedMobaShopItemId(firstR.id);
                        } else {
                          const firstI = MOBA_EQUIPMENT_ITEMS.find((i) => i.category === catKey);
                          if (firstI) setSelectedMobaShopItemId(firstI.id);
                        }
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Center Grouped Tier Catalog */}
                <div className="moba-shop-catalog-scroll" id="mobaShopCatalogGrid">
                  {isBlessingCat ? (
                    <div className="moba-tier-grid">
                      {blessingList.map((b) => {
                        const active = selBlessing.id === b.id;
                        const equipped = mobaHud.blessingId === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            data-blessing-id={b.id}
                            className={`moba-shop-item-card ${active ? 'selected' : ''} ${equipped ? 'equipped' : ''}`}
                            onClick={() => {
                              ArcadeAudio.play('click');
                              setSelectedMobaBlessingId(b.id);
                            }}
                          >
                            <span className="moba-item-icon">{b.icon}</span>
                            <div className="moba-item-info">
                              <div className="moba-item-name">{b.name}</div>
                              <div className="moba-item-sub">FREE Boot Blessing</div>
                            </div>
                            {equipped && <span className="moba-item-tag">BLESSED</span>}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      {[
                        { title: mobaShopCat === 'recommended' ? '⭐ Recommended Core Build' : 'Tier 3 · Core Equipment', list: tier3Items },
                        { title: 'Tier 2 · Intermediate Components', list: tier2Items },
                        { title: 'Tier 1 · Basic Components', list: tier1Items }
                      ]
                        .filter((g) => g.list.length > 0)
                        .map((group) => (
                          <div key={group.title} className="moba-tier-section">
                            <div className="moba-tier-label">{group.title}</div>
                            <div className="moba-tier-grid">
                              {group.list.map((item) => {
                                const active = selItem.id === item.id;
                                const countOwned = mobaHud.equippedItemIds.filter((id) => id === item.id).length;
                                const effCost = computeEffectiveItemCost(item.id, mobaHud.equippedItemIds)?.netCost ?? item.cost;
                                const isPrio = mobaHud.prioritizedItemId === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    data-item-id={item.id}
                                    className={`moba-shop-item-card ${active ? 'selected' : ''} ${countOwned > 0 ? 'equipped' : ''} ${isPrio ? 'prioritized' : ''}`}
                                    onClick={() => {
                                      ArcadeAudio.play('click');
                                      setSelectedMobaShopItemId(item.id);
                                    }}
                                  >
                                    <span className="moba-item-icon">{item.icon}</span>
                                    <div className="moba-item-info">
                                      <div className="moba-item-name">{isPrio ? '📌 ' : ''}{item.name}</div>
                                      <div className="moba-item-sub">
                                        🪙 {effCost}
                                        {effCost < item.cost ? ` (-${item.cost - effCost}g)` : ''} · {item.passiveName}
                                      </div>
                                    </div>
                                    {countOwned > 0 && <span className="moba-item-tag">OWNED</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </>
                  )}
                </div>

                {/* Right Inspector + Interactive Crafting Tree + Prioritize */}
                <div className="moba-shop-inspector" id="mobaShopInspector">
                  {isBlessingCat ? (
                    <>
                      <div className="moba-inspector-head">
                        <span className="moba-inspector-icon">{selBlessing.icon}</span>
                        <div>
                          <div className="moba-inspector-title">{selBlessing.name}</div>
                          <div className="moba-inspector-cost">
                            {selBlessing.kind === 'jungling' ? '🌲 Free Jungling Blessing' : '🛡️ Free Roaming Blessing'} · 🪙 0 Gold
                          </div>
                        </div>
                      </div>
                      <div className="moba-inspector-passive">
                        <strong>Effect:</strong> {selBlessing.summary}
                      </div>
                      <button
                        type="button"
                        id="btnConfirmBuyMobaItem"
                        className="moba-buy-confirm-btn"
                        disabled={!hasBootsEquipped || mobaHud.blessingId === selBlessing.id}
                        onClick={() => {
                          activeGameRef.current?.buyBlessing?.(selBlessing.id);
                        }}
                      >
                        {!hasBootsEquipped
                          ? '👢 Buy Any Boots First'
                          : mobaHud.blessingId === selBlessing.id
                            ? '✅ Blessing Active'
                            : '✨ Attach Free Blessing (0g)'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="moba-inspector-head">
                        <span className="moba-inspector-icon">{selItem.icon}</span>
                        <div>
                          <div className="moba-inspector-title">{selItem.name}</div>
                          <div className="moba-inspector-cost">
                            🪙 {selNetCost} Gold
                            {selNetCost < selItem.cost ? ` (Base ${selItem.cost}g · Discounted)` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="moba-inspector-stats">{selItem.statsSummary}</div>

                      {/* Crafting Tree Sub-Components */}
                      {selRecipeIds.length > 0 && (
                        <div className="moba-craft-tree" id="mobaCraftingTree">
                          <div className="moba-craft-tree-label">🔨 Crafting Recipe (Click to inspect/buy component):</div>
                          <div className="moba-craft-nodes">
                            {selRecipeIds.map((compId, cIdx) => {
                              const comp = getMobaEquipmentById(compId);
                              if (!comp) return null;
                              const owned = mobaHud.equippedItemIds.includes(compId);
                              const compCost = computeEffectiveItemCost(compId, mobaHud.equippedItemIds)?.netCost ?? comp.cost;
                              return (
                                <button
                                  key={`${compId}-${cIdx}`}
                                  type="button"
                                  className={`moba-craft-node ${owned ? 'owned' : ''}`}
                                  onClick={() => {
                                    ArcadeAudio.play('click');
                                    setSelectedMobaShopItemId(comp.id);
                                  }}
                                >
                                  <span>{comp.icon}</span>
                                  <span>{comp.shortName}</span>
                                  <em>{owned ? 'OWNED ✓' : `🪙${compCost}`}</em>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="moba-inspector-passive">
                        <strong>{selItem.isActiveSkill ? '⚡ Active' : '✨ Passive'} ({selItem.passiveName}):</strong>{' '}
                        {selItem.passiveDesc}
                      </div>

                      <div className="moba-inspector-actions">
                        <button
                          type="button"
                          id="btnPrioritizeMobaItem"
                          className={`moba-prioritize-btn ${mobaHud.prioritizedItemId === selItem.id ? 'active' : ''}`}
                          onClick={() => {
                            ArcadeAudio.play('click');
                            activeGameRef.current?.setPrioritizedItem?.(selItem.id);
                          }}
                        >
                          {mobaHud.prioritizedItemId === selItem.id ? '📌 Prioritized' : '📌 Prioritize'}
                        </button>

                        <button
                          type="button"
                          id="btnConfirmBuyMobaItem"
                          className="moba-buy-confirm-btn"
                          disabled={slotsBlocked || mobaHud.gold < selNetCost || bootsBlocked}
                          onClick={() => {
                            activeGameRef.current?.buyEquipment?.(selItem.id);
                          }}
                        >
                          {slotsBlocked
                            ? '🎒 6/6 Full'
                            : bootsBlocked
                              ? '👢 Boots Equipped'
                              : mobaHud.gold < selNetCost
                                ? `Need 🪙 ${selNetCost - mobaHud.gold}`
                                : `🪙 Buy (${selNetCost}g)`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="moba-shop-footer">
                <div className="moba-shop-slots-label">
                  EQUIPPED BUILD ({mobaHud.equippedItemIds.length}/6 SLOTS · SELL REFUNDS 60% GOLD):
                </div>
                <div className="moba-shop-equipped-row">
                  {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                    const eqId = mobaHud.equippedItemIds[slotIdx];
                    const eqItem = eqId ? getMobaEquipmentById(eqId) : undefined;
                    const refund = eqItem ? computeSellRefund(eqItem.id) : 0;
                    return (
                      <div key={slotIdx} className={`moba-equipped-slot-card ${eqItem ? 'filled' : ''}`}>
                        {eqItem ? (
                          <>
                            <span className="moba-eq-icon">{eqItem.icon}</span>
                            <span className="moba-eq-name">{eqItem.shortName}</span>
                            <button
                              type="button"
                              className="moba-eq-sell-btn"
                              title={`Sell ${eqItem.name} for +${refund} Gold (60%)`}
                              onClick={() => {
                                activeGameRef.current?.sellEquipment?.(slotIdx);
                              }}
                            >
                              +{refund}g
                            </button>
                          </>
                        ) : (
                          <span className="moba-eq-empty">Slot {slotIdx + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* NARUTO SENKI 2D IN-BATTLE ICHIRAKU RAMEN SHOP & LEVEL BAR */}
      {isGameActive && selectedGameIdx === 28 && narutoHud && narutoHud.engine === 'senki_2d' && (
        <div className="moba-battle-shop-strip" id="narutoSenkiShopStrip">
          <div className="moba-shop-open-btn" style={{ cursor: 'default' }}>
            <span>{narutoHud.heroIcon} Lv.{narutoHud.level}/6</span>
            <span className="moba-gold-pill" id="senkiGoldVal">🪙 {narutoHud.gold}G</span>
          </div>

          <div className="moba-mini-slots" aria-label="Ichiraku Ramen Shop">
            {SENKI_RAMEN_ITEMS.map((item, idx) => {
              const cd = idx === 0 ? narutoHud.ramenCd : idx === 1 ? narutoHud.pillCd : narutoHud.speedTagCd;
              const canAfford = narutoHud.gold >= item.cost && cd <= 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`moba-quick-buy-btn ${canAfford ? 'affordable' : ''}`}
                  title={`${item.name} (${item.cost}G · [${item.shortcut}]): ${item.effectDesc}`}
                  onClick={() => {
                    activeGameRef.current?.buySenkiItem?.(item.id);
                  }}
                >
                  <span>{item.icon}</span>
                  <span className="moba-qb-meta">
                    <strong>{item.name.split(' ')[0]} [{item.shortcut}]</strong>
                    <em>{cd > 0 ? `${cd.toFixed(1)}s` : `${item.cost}G`}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* NARUTO ULTIMATE NINJA STORM 3D HUD (4 LOGS, CHAKRA LOCK, STORM GAUGE, 4 NINJA TOOLS & SUPPORTS) */}
      {isGameActive && selectedGameIdx === 28 && narutoHud && narutoHud.engine === 'storm_3d' && (
        <div className="moba-battle-shop-strip" id="narutoStormHudStrip">
          <div className="moba-shop-open-btn" style={{ cursor: 'default' }}>
            <span>🪵 Logs: {'🪵'.repeat(narutoHud.subLogs)}{'·'.repeat(Math.max(0, 4 - narutoHud.subLogs))}</span>
            <span className="moba-gold-pill" title="Chakra & Counterattack Lock">
              💙 {narutoHud.chakra}%{narutoHud.maxUsableChakra < 100 ? ` (🔒65% ${narutoHud.counterPenaltySec}s)` : ''}
            </span>
            <span className="moba-gold-pill" style={{ color: '#f97316' }}>
              🔥 Storm {narutoHud.stormGauge}%
            </span>
          </div>

          <div className="moba-mini-slots" aria-label="D-Pad Ninja Tools">
            {STORM_NINJA_TOOLS.map((tool, idx) => {
              const uses = narutoHud.toolCharges[idx] ?? 0;
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={`moba-quick-buy-btn ${uses > 0 ? 'affordable' : ''}`}
                  title={`${tool.name} ([${tool.shortcut}]): ${tool.desc}`}
                  onClick={() => {
                    activeGameRef.current?.useStormNinjaTool?.(idx as 0 | 1 | 2 | 3);
                  }}
                >
                  <span>{tool.icon}</span>
                  <span className="moba-qb-meta">
                    <strong>[{tool.shortcut}]</strong>
                    <em>x{uses}</em>
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className="moba-quick-buy-btn affordable"
              title="Leader Switch [Tab]"
              onClick={() => activeGameRef.current?.switchStormLeader?.()}
            >
              <span>🔄</span>
              <span className="moba-qb-meta">
                <strong>LEADER</strong>
                <em>[Tab]</em>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* HOOPS 2K26 3D ON-COURT PLAY FIELD HUD (GRADE, TAKEOVER, ADRENALINE, SCOREBUG, COACHING, ICON PASS) */}
      {isGameActive && selectedGameIdx === 27 && hoopsHud && !hoopsHud.postGameSummary && (() => {
        const qClockMin = Math.floor(Math.max(0, hoopsHud.quarterClock) / 60);
        const qClockSec = Math.floor(Math.max(0, hoopsHud.quarterClock) % 60);
        const clockStr = hoopsHud.targetScore
          ? `TO ${hoopsHud.targetScore}`
          : `${qClockMin}:${qClockSec.toString().padStart(2, '0')}`;
        const periodLabel = hoopsHud.targetScore
          ? 'PARK'
          : hoopsHud.quarter <= 4
            ? `Q${hoopsHud.quarter}`
            : `OT${hoopsHud.quarter - 4}`;
        const takeoverPct = Math.min(100, Math.round((hoopsHud.takeoverMeter / 500) * 100));
        const gradeColor = hoopsHud.teammateGrade.startsWith('A')
          ? '#22c55e'
          : hoopsHud.teammateGrade.startsWith('B')
            ? '#38bdf8'
            : hoopsHud.teammateGrade.startsWith('C')
              ? '#facc15'
              : '#f97316';
        return (
          <div className="hoops-playfield-hud" id="hoopsPlayfieldHud">
            {/* TOP-LEFT: Teammate Grade + Box Score + Takeover Lv.1-5 + 3 Adrenaline Bars */}
            <div className="hoops-hud-grade-card">
              <div className="hoops-hud-grade-row">
                <span className="hoops-grade-badge" style={{ borderColor: gradeColor, color: gradeColor }}>
                  {hoopsHud.teammateGrade}
                </span>
                <div className="hoops-hud-player-meta">
                  <strong>{hoopsHud.playerName} ({hoopsHud.playerPos})</strong>
                  <span>
                    {hoopsHud.stats.pts} PTS · {hoopsHud.stats.reb} REB · {hoopsHud.stats.ast} AST · {hoopsHud.stats.stl} STL · {hoopsHud.stats.blk} BLK
                  </span>
                </div>
              </div>
              <div className="hoops-hud-meters-row">
                <div className="hoops-takeover-wrap">
                  <div className="hoops-takeover-label">
                    <span>🔥 {hoopsHud.takeoverName} · Lv.{hoopsHud.takeoverLevel}/5</span>
                    {hoopsHud.takeoverLevel >= 5 && !hoopsHud.takeoverActive && (
                      <button
                        type="button"
                        className="hoops-ignite-btn"
                        onClick={() => activeGameRef.current?.activateHoopsTakeover?.()}
                      >
                        IGNITE [T]
                      </button>
                    )}
                    {hoopsHud.takeoverActive && <em className="hoops-ignited-tag">ACTIVE!</em>}
                  </div>
                  <div className="hoops-takeover-track">
                    <div
                      className={`hoops-takeover-fill ${hoopsHud.takeoverActive ? 'active' : ''}`}
                      style={{ width: `${takeoverPct}%` }}
                    />
                  </div>
                </div>
                <div className="hoops-adrenaline-wrap" title="3 Adrenaline Boost Bars (regenerates each possession)">
                  <span className="hoops-adr-label">⚡ ADR</span>
                  <div className="hoops-adr-pips">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`hoops-adr-pip ${i < hoopsHud.adrenalineBars ? 'filled' : ''}`} />
                    ))}
                  </div>
                  {hoopsHud.shotMeterOffBoost && <span className="hoops-no-meter-tag">🎯 NO-METER +20%</span>}
                </div>
              </div>
              {hoopsHud.gradeFlash && <div className="hoops-grade-flash">{hoopsHud.gradeFlash}</div>}
            </div>

            {/* SHOT FEEDBACK BANNER (Timing + Coverage) */}
            {hoopsHud.shotFeedback && (
              <div
                className={`hoops-shot-feedback ${hoopsHud.shotFeedback.isGreen ? 'green' : ''}`}
                id="hoopsShotFeedback"
              >
                <strong>{hoopsHud.shotFeedback.timing}</strong>
                <span>{hoopsHud.shotFeedback.coverage}</span>
              </div>
            )}

            {/* SCOREBUG (Bottom-Right for Indoor Arena/REC, Top-Center for Outdoor Park) */}
            <div className={`hoops-scorebug ${hoopsHud.isOutdoorPark ? 'outdoor' : 'indoor'}`} id="hoopsScorebug">
              <div className="hoops-sb-court">{hoopsHud.courtLabel}</div>
              <div className="hoops-sb-main">
                <div className="hoops-sb-team">
                  <span className="hoops-sb-swatch" style={{ background: hoopsHud.homeAccent }} />
                  <strong>{hoopsHud.homeAbbr}</strong>
                  <span className="hoops-sb-score" id="hoopsHomeScore">{hoopsHud.homeScore}</span>
                  {hoopsHud.homeFouls >= 5 && <em className="hoops-bonus-tag">BONUS</em>}
                </div>
                <div className="hoops-sb-clock">
                  <strong>{periodLabel} · {clockStr}</strong>
                  <span className={hoopsHud.shotClock <= 5 ? 'danger' : ''}>:{Math.ceil(hoopsHud.shotClock).toString().padStart(2, '0')}</span>
                </div>
                <div className="hoops-sb-team">
                  <span className="hoops-sb-score" id="hoopsAwayScore">{hoopsHud.awayScore}</span>
                  <strong>{hoopsHud.awayAbbr}</strong>
                  <span className="hoops-sb-swatch" style={{ background: hoopsHud.awayAccent }} />
                  {hoopsHud.awayFouls >= 5 && <em className="hoops-bonus-tag">BONUS</em>}
                </div>
              </div>
              {!hoopsHud.isOutdoorPark && (
                <div className="hoops-sb-sub">
                  <span>FLS {hoopsHud.homeFouls}-{hoopsHud.awayFouls}</span>
                  <span>TO {hoopsHud.homeTimeouts}-{hoopsHud.awayTimeouts}</span>
                </div>
              )}
            </div>

            {/* TACTICAL BAR (Icon Pass, Call Play, Coach Scheme, Camera Toggle, Sim to End) */}
            <div className="hoops-tactical-bar" id="hoopsTacticalBar">
              <button
                type="button"
                className={`hoops-tac-btn ${hoopsHud.iconPassingActive ? 'active' : ''}`}
                onClick={() => activeGameRef.current?.toggleIconPassing?.()}
              >
                🎯 Icon Pass [Tab]
              </button>
              <button
                type="button"
                className="hoops-tac-btn"
                onClick={() => activeGameRef.current?.callHoopsPlay?.()}
              >
                📋 Play: {hoopsHud.activePlayName} [Q]
              </button>
              <button
                type="button"
                className="hoops-tac-btn"
                onClick={() => {
                  const schemes = ['Motion', '5-Out', 'Zone 2-3', 'Full Press'];
                  const next = schemes[(schemes.indexOf(hoopsHud.coachScheme) + 1) % schemes.length];
                  activeGameRef.current?.setHoopsCoachScheme?.(next);
                }}
              >
                🧠 {hoopsHud.coachScheme}
              </button>
              <button
                type="button"
                className="hoops-tac-btn"
                id="hoopsBtnToggleCam"
                onClick={() => activeGameRef.current?.toggleHoopsCamera?.()}
              >
                🎥 Cam: {hoopsHud.cameraAngle === '2k' ? '2K N-S' : 'Broadcast'} [C]
              </button>
              <button
                type="button"
                className="hoops-tac-btn accent"
                id="hoopsBtnSimEnd"
                onClick={() => activeGameRef.current?.simHoopsToEnd?.()}
              >
                ⏭ Sim End
              </button>
            </div>

            {/* ACTIVE ICON PASSING TARGETS */}
            {hoopsHud.iconPassingActive && hoopsHud.iconPassTargets.length > 0 && (
              <div className="hoops-icon-pass-bar" id="hoopsIconPassBar">
                <span>PASS TO:</span>
                {hoopsHud.iconPassTargets.map((t) => (
                  <button
                    key={t.index}
                    type="button"
                    className="hoops-icon-target-btn"
                    onClick={() => activeGameRef.current?.triggerIconPass?.(t.index)}
                  >
                    <strong>[{t.keyLabel}]</strong> {t.name} <em>{t.role}</em>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* HOOPS 2K26 3D 4-TAB POST-GAME PROGRESSION SUMMARY MODAL */}
      {isGameActive && selectedGameIdx === 27 && hoopsHud?.postGameSummary && (() => {
        const pg = hoopsHud.postGameSummary;
        const fgPct = pg.stats.fga > 0 ? Math.round((pg.stats.fgm / pg.stats.fga) * 100) : 0;
        const tpPct = pg.stats.tpa > 0 ? Math.round((pg.stats.tpm / pg.stats.tpa) * 100) : 0;
        return (
          <div className="hoops-postgame-backdrop" id="hoopsPostGameModal" role="dialog" aria-label="Hoops 2K26 Post-Game Summary">
            <div className="hoops-postgame-card">
              <div className="hoops-postgame-head">
                <div>
                  <div className={`hoops-pg-result ${pg.won ? 'win' : 'loss'}`}>
                    {pg.won ? '🏆 VICTORY' : '🏀 FINAL BUZZER'} · {pg.courtLabel}
                  </div>
                  <div className="hoops-pg-scoreline">
                    <span>{pg.homeTeamName} ({pg.homeAbbr})</span>
                    <strong>{pg.homeScore} — {pg.awayScore}</strong>
                    <span>{pg.awayTeamName} ({pg.awayAbbr})</span>
                  </div>
                </div>
                <div className="hoops-pg-grade-pill">
                  <span>GRADE</span>
                  <strong>{pg.teammateGrade}</strong>
                </div>
              </div>

              <div className="hoops-pg-tabs">
                {([
                  { id: 'box', label: '1. Box Score & POTG' },
                  { id: 'vc', label: '2. VC Payout' },
                  { id: 'badges', label: '3. MyPOINTS & Badges' },
                  { id: 'rep', label: '4. REP, Crew & Plate' }
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`hoops-pg-tab-btn ${hoopsPostTab === t.id ? 'active' : ''}`}
                    onClick={() => {
                      ArcadeAudio.play('click');
                      setHoopsPostTab(t.id);
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="hoops-pg-body">
                {hoopsPostTab === 'box' && (
                  <div className="hoops-pg-section">
                    <div className="hoops-pg-potg">
                      ⭐ <strong>PLAYER OF THE GAME:</strong> {pg.potgName} — {pg.potgLine}
                    </div>
                    <div className="hoops-pg-stat-grid">
                      <div><span>PTS</span><strong>{pg.stats.pts}</strong></div>
                      <div><span>REB</span><strong>{pg.stats.reb}</strong></div>
                      <div><span>AST</span><strong>{pg.stats.ast}</strong></div>
                      <div><span>STL</span><strong>{pg.stats.stl}</strong></div>
                      <div><span>BLK</span><strong>{pg.stats.blk}</strong></div>
                      <div><span>TOV</span><strong>{pg.stats.tov}</strong></div>
                      <div><span>FG</span><strong>{pg.stats.fgm}/{pg.stats.fga} ({fgPct}%)</strong></div>
                      <div><span>3PT</span><strong>{pg.stats.tpm}/{pg.stats.tpa} ({tpPct}%)</strong></div>
                      <div><span>GREENS</span><strong style={{ color: '#22c55e' }}>{pg.stats.greens}</strong></div>
                    </div>
                  </div>
                )}

                {hoopsPostTab === 'vc' && (
                  <div className="hoops-pg-section">
                    <div className="hoops-pg-ledger">
                      <div><span>Base Match Salary</span><strong>+{pg.rewards.baseVc} VC</strong></div>
                      <div><span>Teammate Grade Bonus ({pg.teammateGrade})</span><strong>+{pg.rewards.gradeVc} VC</strong></div>
                      <div><span>Stat &amp; Highlight Bonuses</span><strong>+{pg.rewards.statVc} VC</strong></div>
                      <div><span>Crew Level {pg.crewLevel} Multiplier</span><strong>+{pg.rewards.crewBonusVc} VC</strong></div>
                      <div className="total"><span>TOTAL VC EARNED</span><strong>💰 +{pg.rewards.totalVc} VC</strong></div>
                      <div><span>MyTEAM Points (MTP)</span><strong style={{ color: '#38bdf8' }}>🃏 +{pg.rewards.mtpEarned} MTP</strong></div>
                    </div>
                  </div>
                )}

                {hoopsPostTab === 'badges' && (
                  <div className="hoops-pg-section">
                    <div className="hoops-pg-ledger">
                      <div><span>MyPOINTS Toward 99 OVR Cap</span><strong>📈 +{pg.rewards.myPointsEarned} MyPOINTS</strong></div>
                      <div><span>Badge Progression XP</span><strong>🏅 +{pg.rewards.badgeXpEarned} Badge XP</strong></div>
                      <div>
                        <span>Hot / Lethal Zone Status</span>
                        <strong style={{ color: pg.rewards.hotZoneUpgraded ? '#f97316' : '#94a3b8' }}>
                          {pg.rewards.hotZoneUpgraded ? '🔥 HOT ZONE UPGRADED!' : 'Shoot 3+ Greens to upgrade zone'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {hoopsPostTab === 'rep' && (
                  <div className="hoops-pg-section">
                    <div className="hoops-pg-ledger">
                      <div><span>Affiliation REP ({pg.repLabel})</span><strong>🏆 +{pg.rewards.repXpEarned} REP XP</strong></div>
                      <div><span>Crew Progression (Lv.{pg.crewLevel}/30)</span><strong>👥 +{pg.rewards.crewXpEarned} Crew XP</strong></div>
                      <div>
                        <span>Skill Plate</span>
                        <strong style={{ color: pg.plateColorHex }}>
                          {pg.plateLabel} ({pg.rewards.plateDelta >= 0 ? `+${pg.rewards.plateDelta}` : pg.rewards.plateDelta})
                        </strong>
                      </div>
                      <div><span>Season Pass (Lv.{pg.seasonLevel}/40)</span><strong>⭐ +{pg.rewards.seasonXpEarned} Season XP</strong></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hoops-pg-actions">
                <button
                  type="button"
                  className="hoops-pg-btn primary"
                  id="hoopsPostReturnHub"
                  onClick={() => {
                    stopGame();
                    setActiveLobbyGame(27);
                  }}
                >
                  🏙️ Return to Hoops 2K26 Hub
                </button>
                <button
                  type="button"
                  className="hoops-pg-btn secondary"
                  id="hoopsPostRematch"
                  onClick={() => {
                    setHoopsPostTab('box');
                    startGame(27, difficultyRef.current, 1);
                  }}
                >
                  🏀 Rematch
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div
        className={`health-bar-container ${isGameActive && Boolean(selectedMeta.showHealthBar) && healthMax > 1 ? 'show' : ''} ${healthDmgFlash ? 'damage-flash' : ''}`}
        id="healthBarContainer"
      >
        <span style={{ color: 'white', fontSize: '12px' }}>❤️</span>
        <div className="health-bar">
          <div
            className="health-trail"
            id="healthTrail"
            style={{ width: `${Math.max(healthPct, healthTrailPct)}%` }}
          />
          <div
            className="health-fill"
            id="healthFill"
            style={{
              width: `${healthPct}%`,
              background: healthPct > 50 ? '#2ecc71' : healthPct > 25 ? '#f1c40f' : '#e74c3c'
            }}
          />
        </div>
        <span className="health-text" id="healthText">{healthCur}/{healthMax}</span>
      </div>

    </>
  );
}
