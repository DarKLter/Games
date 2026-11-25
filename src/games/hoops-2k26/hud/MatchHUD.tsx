// ============================================================================
// PART 5 — DUAL-ERA BROADCAST IN-MATCH BATTLEFIELD HUD (MatchHUD.tsx)
// - 2K14_CLASSIC (Bottom-Right metallic crimson-chrome scorebug)
// - 2K26_NEXTGEN (Bottom-Left or Top-Center obsidian neon scorebug + flip ticker)
// - BLACKTOP Streetball compact scoreboard (Score vs Target + Win Streak)
// - Top-Left Cluster: Pause, Cam, Tactics/Mark, 2K14/2K26 Toggle, Touch Toggle, Telemetry
// - Top-Right Cluster: Circular Teammate Grade (F..A+) + 3-Event Feed, Shot Feedback,
//   and 5-Tier Animated Badge Pop-Up Stack
// - Center Splash Banners, 3D-Projected Alley-Oop Prompt, 3D-Projected Icon Passing [1-5]
// - Compact Controlled Player Stamina / 3-Bar Adrenaline / Takeover Bar
// ============================================================================

import React, { useEffect, useRef, useState } from 'react';
import type { TeamData } from '../hybrid/rosterTypes';
import type { HudControlLayoutRect, MatchVenueId, UIEraMode } from '../hybrid/types';
import { TeamLogo } from '../hybrid/TeamLogo';
import { getVenueDisplayLabel } from '../engine/courtTypes';
import { BADGE_TIER_COLOR, BADGE_TIER_LABEL } from '../engine/BadgeEngine';
import { getGradeColor, type ProjectedCourtAnchors } from '../engine/SimTacticsAndReplay';
import type { AlleyOopPromptKey, SimHudSnapshot } from '../engine/BasketballSimulation';

export interface MatchHUDProps {
  hud: SimHudSnapshot;
  homeTeam: TeamData;
  awayTeam: TeamData;
  venue: MatchVenueId;
  uiEraMode: UIEraMode;
  scoreboardEra: 'AUTO' | '2K14_METALLIC' | '2K26_OBSIDIAN';
  scorebugPosition2K26: 'BOTTOM_LEFT' | 'TOP_CENTER' | 'BOTTOM_RIGHT';
  activeCameraShortLabel: string;
  showFpsTelemetry: boolean;
  showShotFeedback: boolean;
  fps: number;
  frameMs: number;
  winStreak: number;
  tacticsOpen: boolean;
  touchControlsVisible: boolean;
  tacticsLayout?: HudControlLayoutRect;
  suppressDefaultGameOver?: boolean;
  projectedAnchorsRef: React.MutableRefObject<ProjectedCourtAnchors>;
  onOpenPause: () => void;
  onCycleCamera: () => void;
  onToggleTactics: () => void;
  onToggleEra: () => void;
  onToggleTouchControls: () => void;
  onIgniteTakeover: () => void;
  onTriggerIconPass: (slot: number) => void;
  onAlleyOopPress: (key: AlleyOopPromptKey | 'ANY') => void;
  onRematch: () => void;
  onExitToMenu: () => void;
}

function formatClock(sec: number): string {
  const clamped = Math.max(0, sec);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function formatQuarterOrdinal(q: number): string {
  if (q === 1) return '1ST';
  if (q === 2) return '2ND';
  if (q === 3) return '3RD';
  if (q === 4) return '4TH';
  return `OT${q - 4}`;
}

function renderTimeoutPips(count: number): React.ReactNode {
  const total = 7;
  const pips: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    pips.push(
      <span
        key={i}
        className={`p5-to-pip ${i < count ? 'on' : ''}`}
      />
    );
  }
  return <span className="p5-to-row" title={`${count} Timeouts Remaining`}>{pips}</span>;
}

export const MatchHUD: React.FC<MatchHUDProps> = ({
  hud,
  homeTeam,
  awayTeam,
  venue,
  uiEraMode,
  scoreboardEra,
  scorebugPosition2K26,
  activeCameraShortLabel,
  showFpsTelemetry,
  showShotFeedback,
  fps,
  frameMs,
  winStreak,
  tacticsOpen,
  touchControlsVisible,
  tacticsLayout,
  suppressDefaultGameOver = false,
  projectedAnchorsRef,
  onOpenPause,
  onCycleCamera,
  onToggleTactics,
  onToggleEra,
  onToggleTouchControls,
  onIgniteTakeover,
  onTriggerIconPass,
  onAlleyOopPress,
  onRematch,
  onExitToMenu,
}) => {
  // Animated score flip bump detector
  const prevScoresRef = useRef({ away: hud.awayScore, home: hud.homeScore });
  const [flipSide, setFlipSide] = useState<'AWAY' | 'HOME' | null>(null);

  useEffect(() => {
    if (hud.awayScore !== prevScoresRef.current.away) {
      prevScoresRef.current.away = hud.awayScore;
      setFlipSide('AWAY');
      const t = window.setTimeout(() => setFlipSide(null), 460);
      return () => window.clearTimeout(t);
    }
    if (hud.homeScore !== prevScoresRef.current.home) {
      prevScoresRef.current.home = hud.homeScore;
      setFlipSide('HOME');
      const t = window.setTimeout(() => setFlipSide(null), 460);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [hud.awayScore, hud.homeScore]);

  const effectiveEra: '2K14_CLASSIC' | '2K26_NEXTGEN' =
    scoreboardEra === '2K14_METALLIC'
      ? '2K14_CLASSIC'
      : scoreboardEra === '2K26_OBSIDIAN'
        ? '2K26_NEXTGEN'
        : uiEraMode === '2K14_CLASSIC'
          ? '2K14_CLASSIC'
          : '2K26_NEXTGEN';

  const gradeColor = getGradeColor(hud.teammateGrade.letter);
  const gradeCirc = 2 * Math.PI * 20;
  const gradeFill = gradeCirc * Math.max(0.06, hud.teammateGrade.score / 100);
  const anchors = projectedAnchorsRef.current;

  // Projected Alley-Oop finisher screen position
  const oopAnchor = hud.activeAlleyOopReceiverId
    ? anchors.players[hud.activeAlleyOopReceiverId]
    : undefined;
  const oopStyle: React.CSSProperties | undefined =
    oopAnchor && oopAnchor.visible
      ? {
          left: `${Math.max(120, Math.min((anchors.width || 960) - 120, oopAnchor.headX))}px`,
          top: `${Math.max(100, Math.min((anchors.height || 540) - 120, oopAnchor.headY - 46))}px`,
          transform: 'translate(-50%, -50%)',
        }
      : undefined;

  return (
    <div className={`p5-hud-root era-${effectiveEra.toLowerCase()}`}>
      {/* =================================================================== */}
      {/* TOP-LEFT ACTION CLUSTER (PAUSE, CAM, TACTICS/MARK, ERA, TOUCH, FPS) */}
      {/* =================================================================== */}
      <div className="p5-top-left-cluster">
        <button
          type="button"
          className="p5-hud-pill pause"
          onClick={onOpenPause}
          title="Pause Match & Instant Replay [Esc]"
        >
          ⏸ PAUSE
        </button>
        <button
          type="button"
          className="p5-hud-pill"
          onClick={onCycleCamera}
          title="Cycle 7 Cameras [V]"
        >
          📷 {activeCameraShortLabel}
        </button>
        <button
          type="button"
          className={`p5-hud-pill ${tacticsOpen ? 'active' : ''}`}
          style={
            tacticsLayout
              ? {
                  transform: `translate(${tacticsLayout.x}px, ${tacticsLayout.y}px) scale(${Math.max(
                    0.5,
                    Math.min(1.5, tacticsLayout.scale)
                  )})`,
                  opacity: Math.max(0.2, Math.min(1, tacticsLayout.opacity)),
                }
              : undefined
          }
          onClick={onToggleTactics}
          title="Coach Tactics & Enemy Star Marking [1-4]"
        >
          📋 TACTICS / 🎯 MARK
        </button>
        <button
          type="button"
          className="p5-hud-pill era-btn"
          onClick={onToggleEra}
          title="Instant Live HUD Era Switch (2K14 Classic / 2K26 Next-Gen)"
        >
          🔄 {effectiveEra === '2K14_CLASSIC' ? '2K14' : '2K26'}
        </button>
        <button
          type="button"
          className={`p5-hud-pill ${touchControlsVisible ? 'active' : ''}`}
          onClick={onToggleTouchControls}
          title="Toggle Virtual Dual-Stick Touch Controls"
        >
          🎮 {touchControlsVisible ? 'PAD ON' : 'PAD'}
        </button>
        {showFpsTelemetry && (
          <span className="p5-telemetry-chip">
            {fps} FPS | {frameMs}ms
          </span>
        )}
      </div>

      {/* =================================================================== */}
      {/* TOP-RIGHT CLUSTER: TEAMMATE GRADE + FEED, SHOT FEEDBACK, 5-TIER BADGES */}
      {/* =================================================================== */}
      <div className="p5-top-right-cluster">
        {/* Circular Teammate Grade Meter */}
        <div className="p5-grade-card">
          <div className="p5-grade-ring-wrap">
            <svg width="50" height="50" viewBox="0 0 50 50">
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="rgba(9,12,20,0.88)"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="4"
              />
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke={gradeColor}
                strokeWidth="4"
                strokeDasharray={`${gradeFill} ${gradeCirc}`}
                strokeLinecap="round"
                transform="rotate(-90 25 25)"
              />
            </svg>
            <strong className="p5-grade-letter" style={{ color: gradeColor }}>
              {hud.teammateGrade.letter}
            </strong>
          </div>
          <div className="p5-grade-meta">
            <span className="p5-grade-kicker">TEAMMATE GRADE</span>
            {hud.teammateGrade.events.length > 0 ? (
              <div className="p5-grade-feed">
                {hud.teammateGrade.events.slice(0, 3).map((ev) => (
                  <span
                    key={ev.id}
                    className={`p5-grade-ev ${ev.positive ? 'pos' : 'neg'}`}
                  >
                    {ev.label}
                  </span>
                ))}
              </div>
            ) : (
              <span className="p5-grade-sub">{getVenueDisplayLabel(venue)}</span>
            )}
          </div>
        </div>

        {/* Live Shot Feedback & Coverage % Banner */}
        {showShotFeedback && hud.shotFeedback && (
          <div
            className={`p5-shot-fb-banner ${hud.shotFeedback.isGreen ? 'is-green' : ''}`}
            aria-live="polite"
          >
            <div className="p5-shot-fb-row">
              <strong>{hud.shotFeedback.timingLabel}</strong>
              {hud.shotFeedback.rhythmLabel && (
                <span className="p5-fb-rhythm">{hud.shotFeedback.rhythmLabel}</span>
              )}
            </div>
            <span className="p5-fb-contest">{hud.shotFeedback.contestLabel}</span>
          </div>
        )}

        {/* Animated 5-Tier Badge Activation Pop-Up Stack */}
        {hud.badgeFeed.length > 0 && (
          <div className="p5-badge-stack" aria-live="polite">
            {hud.badgeFeed.slice(0, 4).map((ev) => (
              <div
                key={ev.id}
                className="p5-badge-card"
                style={{ borderLeftColor: BADGE_TIER_COLOR[ev.tier] }}
              >
                <span
                  className="p5-badge-tier"
                  style={{ color: BADGE_TIER_COLOR[ev.tier] }}
                >
                  {BADGE_TIER_LABEL[ev.tier].toUpperCase()} +{ev.boostPct}%
                </span>
                <strong>{ev.badgeName}</strong>
                <span className="p5-badge-player">{ev.playerName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* CENTER SPLASH BANNERS & TIMEOUT HUDDLE / PLAY-BY-PLAY TICKER        */}
      {/* =================================================================== */}
      {hud.splashBanner && (
        <div
          key={hud.splashBanner.id}
          className={`p5-splash-banner tone-${hud.splashBanner.tone.toLowerCase()}`}
          role="status"
        >
          <div className="p5-splash-title">{hud.splashBanner.title}</div>
          {hud.splashBanner.subtitle && (
            <div className="p5-splash-sub">{hud.splashBanner.subtitle}</div>
          )}
        </div>
      )}

      {hud.timeoutHuddleSec > 0 && (
        <div className="p5-huddle-bar">
          <span>COACH HUDDLE · STAMINA BOOSTING</span>
          <strong>{hud.timeoutHuddleSec.toFixed(1)}s</strong>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3D-PROJECTED MID-AIR ALLEY-OOP FINISH PROMPT                        */}
      {/* =================================================================== */}
      {hud.alleyOopPrompt.active && (
        <div
          className={`p5-alleyoop-floating ${oopStyle ? 'projected' : ''}`}
          style={oopStyle}
        >
          <div className="p5-oop-ring-lbl">ALLEY-OOP · {hud.alleyOopPrompt.receiverName}</div>
          <button
            type="button"
            className="p5-oop-cta"
            onClick={() => onAlleyOopPress('ANY')}
          >
            PRESS [{hud.alleyOopPrompt.promptKey}] / TAP SLAM!
          </button>
          <div className="p5-oop-timer-track">
            <div
              className="p5-oop-timer-fill"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(
                    100,
                    (hud.alleyOopPrompt.remainingSec /
                      Math.max(0.1, hud.alleyOopPrompt.durationSec)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3D-PROJECTED ICON PASSING OVERLAYS ([1] PG .. [5] C)                */}
      {/* =================================================================== */}
      {hud.iconPassingActive && hud.iconTargets.length > 0 && (
        <>
          {hud.iconTargets.map((t) => {
            const pt = anchors.players[t.playerId];
            if (!pt || !pt.visible) return null;
            return (
              <button
                key={t.playerId}
                type="button"
                className="p5-icon-pass-float"
                style={{
                  left: `${Math.max(48, Math.min((anchors.width || 960) - 48, pt.headX))}px`,
                  top: `${Math.max(58, Math.min((anchors.height || 540) - 68, pt.headY - 22))}px`,
                }}
                onClick={() => onTriggerIconPass(t.slotNum)}
              >
                <strong>[{t.slotNum}]</strong>
                <span>{t.position}</span>
              </button>
            );
          })}
          <div className="p5-icon-pass-strip">
            <span>ICON PASS:</span>
            {hud.iconTargets.map((t) => (
              <button
                key={t.playerId}
                type="button"
                className="p5-icon-strip-btn"
                onClick={() => onTriggerIconPass(t.slotNum)}
              >
                <strong>[{t.slotNum}]</strong> {t.position} {t.lastName}
              </button>
            ))}
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* CONTROLLED PLAYER STAMINA + 3-BAR ADRENALINE + TAKEOVER STRIP       */}
      {/* =================================================================== */}
      <div
        className={`p5-player-bar ${
          effectiveEra === '2K26_NEXTGEN' && scorebugPosition2K26 === 'BOTTOM_LEFT'
            ? 'above-2k26-bug'
            : ''
        } ${touchControlsVisible ? 'touch-shifted' : ''}`}
      >
        <div className="p5-pb-top">
          <span className="p5-pb-pos">{hud.controlledPosition}</span>
          <strong className="p5-pb-name">{hud.controlledPlayerName}</strong>
          <div className="p5-adren-row" title="2K26 3-Bar Adrenaline Boosts">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`p5-adren-pip ${i < hud.controlledAdrenaline ? 'full' : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="p5-pb-bars">
          <div className="p5-stamina-track">
            <div
              className="p5-stamina-fill"
              style={{ width: `${Math.round(hud.controlledStamina * 100)}%` }}
            />
          </div>
          {hud.controlledTakeover && (
            <div className="p5-tk-row">
              <div className="p5-tk-track" title={hud.controlledTakeover.perkLabel}>
                <div
                  className={`p5-tk-fill ${hud.controlledTakeover.ignited ? 'ignited' : ''}`}
                  style={{ width: `${Math.round(hud.controlledTakeover.meter)}%` }}
                />
              </div>
              <span className="p5-tk-lvl">
                {hud.controlledTakeover.ignited
                  ? `🔥 ${Math.ceil(hud.controlledTakeover.igniteRemainingSec)}s`
                  : `LV.${hud.controlledTakeover.level}`}
              </span>
              {hud.controlledTakeover.readyToIgnite && (
                <button
                  type="button"
                  className="p5-tk-ignite"
                  onClick={onIgniteTakeover}
                >
                  🔥 IGNITE [T]
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* AUTHENTIC SCOREBUGS: BLACKTOP vs 2K14 CLASSIC vs 2K26 NEXT-GEN      */}
      {/* =================================================================== */}
      {hud.isBlacktop ? (
        <aside className="p5-scorebug-blacktop" aria-label="Streetball Scoreboard">
          <div className="p5-bt-side" style={{ borderLeftColor: awayTeam.colors.primary }}>
            <span>{awayTeam.abbr}</span>
            <strong className={flipSide === 'AWAY' ? 'flip' : ''}>{hud.awayScore}</strong>
          </div>
          <div className="p5-bt-mid">
            <span className="p5-bt-target">TO {hud.targetScore ?? 21}</span>
            <span className="p5-bt-streak">STREAK {winStreak}🔥</span>
            {hud.phase === 'CHECK_BALL' && <span className="p5-bt-check">CHECK BALL</span>}
          </div>
          <div className="p5-bt-side" style={{ borderRightColor: homeTeam.colors.primary }}>
            <strong className={flipSide === 'HOME' ? 'flip' : ''}>{hud.homeScore}</strong>
            <span>{homeTeam.abbr}</span>
          </div>
        </aside>
      ) : effectiveEra === '2K14_CLASSIC' ? (
        /* NBA 2K14 CLASSIC BOTTOM-RIGHT METALLIC CRIMSON BROADCAST SCOREBUG */
        <aside
          className={`p5-scorebug-2k14 ${touchControlsVisible ? 'touch-lifted' : ''}`}
          aria-label="2K14 Classic Broadcast Scorebug"
        >
          <div className="p5-2k14-teams">
            <div className={`p5-2k14-row ${hud.possession === 'AWAY' ? 'poss' : ''}`}>
              <TeamLogo
                id={awayTeam.id}
                abbr={awayTeam.abbr}
                name={awayTeam.name}
                era={awayTeam.era}
                primaryColor={awayTeam.colors.primary}
                secondaryColor={awayTeam.colors.secondary}
                accentColor={awayTeam.colors.accent}
                size={22}
              />
              <div className="p5-2k14-team-col">
                <span className="p5-2k14-abbr">
                  {awayTeam.abbr}
                  {hud.possession === 'AWAY' && <em className="p5-poss-dot">▸</em>}
                </span>
                <div className="p5-2k14-sub">
                  {renderTimeoutPips(hud.awayTimeouts)}
                  <span className={`p5-foul-tag ${hud.awayInBonus ? 'bonus' : ''}`}>
                    {hud.awayInBonus ? 'BONUS' : `F:${hud.awayFouls}`}
                  </span>
                </div>
              </div>
              <strong className={`p5-2k14-score ${flipSide === 'AWAY' ? 'flip' : ''}`}>
                {hud.awayScore}
              </strong>
            </div>

            <div className={`p5-2k14-row ${hud.possession === 'HOME' ? 'poss' : ''}`}>
              <TeamLogo
                id={homeTeam.id}
                abbr={homeTeam.abbr}
                name={homeTeam.name}
                era={homeTeam.era}
                primaryColor={homeTeam.colors.primary}
                secondaryColor={homeTeam.colors.secondary}
                accentColor={homeTeam.colors.accent}
                size={22}
              />
              <div className="p5-2k14-team-col">
                <span className="p5-2k14-abbr">
                  {homeTeam.abbr}
                  {hud.possession === 'HOME' && <em className="p5-poss-dot">▸</em>}
                </span>
                <div className="p5-2k14-sub">
                  {renderTimeoutPips(hud.homeTimeouts)}
                  <span className={`p5-foul-tag ${hud.homeInBonus ? 'bonus' : ''}`}>
                    {hud.homeInBonus ? 'BONUS' : `F:${hud.homeFouls}`}
                  </span>
                </div>
              </div>
              <strong className={`p5-2k14-score ${flipSide === 'HOME' ? 'flip' : ''}`}>
                {hud.homeScore}
              </strong>
            </div>
          </div>

          <div className="p5-2k14-clock">
            <span className="p5-2k14-qtr">{formatQuarterOrdinal(hud.quarter)}</span>
            <strong className="p5-2k14-time">{formatClock(hud.quarterClockSec)}</strong>
            <span className={`p5-2k14-sc ${hud.shotClockSec < 5 ? 'danger' : ''}`}>
              {hud.shotClockSec < 5
                ? hud.shotClockSec.toFixed(1)
                : Math.ceil(hud.shotClockSec)}
            </span>
          </div>
        </aside>
      ) : (
        /* NBA 2K26 NEXT-GEN OBSIDIAN NEON SCOREBUG (BOTTOM-LEFT OR TOP-CENTER) */
        <aside
          className={`p5-scorebug-2k26 pos-${scorebugPosition2K26.toLowerCase()} ${
            touchControlsVisible && scorebugPosition2K26 === 'BOTTOM_LEFT' ? 'touch-lifted' : ''
          }`}
          style={
            scorebugPosition2K26 === 'BOTTOM_RIGHT'
              ? { left: 'auto', right: 16, bottom: touchControlsVisible ? 156 : 16 }
              : undefined
          }
          aria-label="2K26 Next-Gen Scorebug"
        >
          <div
            className={`p5-2k26-team ${hud.possession === 'AWAY' ? 'poss' : ''}`}
            style={{ borderLeftColor: awayTeam.colors.primary }}
          >
            <TeamLogo
              id={awayTeam.id}
              abbr={awayTeam.abbr}
              name={awayTeam.name}
              era={awayTeam.era}
              primaryColor={awayTeam.colors.primary}
              secondaryColor={awayTeam.colors.secondary}
              accentColor={awayTeam.colors.accent}
              size={22}
            />
            <div className="p5-2k26-meta">
              <span className="p5-2k26-abbr">
                {awayTeam.abbr}
                {hud.possession === 'AWAY' && <em className="p5-poss-arrow">◀</em>}
              </span>
              <div className="p5-2k26-sub">
                {renderTimeoutPips(hud.awayTimeouts)}
                {hud.awayInBonus && <span className="p5-bonus-pill">BONUS</span>}
              </div>
            </div>
            <strong className={`p5-2k26-pts ${flipSide === 'AWAY' ? 'flip' : ''}`}>
              {hud.awayScore}
            </strong>
          </div>

          <div className="p5-2k26-clock">
            <span className="p5-2k26-qtr">{formatQuarterOrdinal(hud.quarter)}</span>
            <strong className="p5-2k26-time">{formatClock(hud.quarterClockSec)}</strong>
            <span className={`p5-2k26-sc ${hud.shotClockSec < 5 ? 'danger' : ''}`}>
              {hud.shotClockSec < 5
                ? hud.shotClockSec.toFixed(1)
                : Math.ceil(hud.shotClockSec)}
            </span>
          </div>

          <div
            className={`p5-2k26-team right ${hud.possession === 'HOME' ? 'poss' : ''}`}
            style={{ borderRightColor: homeTeam.colors.primary }}
          >
            <strong className={`p5-2k26-pts ${flipSide === 'HOME' ? 'flip' : ''}`}>
              {hud.homeScore}
            </strong>
            <div className="p5-2k26-meta right">
              <span className="p5-2k26-abbr">
                {hud.possession === 'HOME' && <em className="p5-poss-arrow">▶</em>}
                {homeTeam.abbr}
              </span>
              <div className="p5-2k26-sub">
                {hud.homeInBonus && <span className="p5-bonus-pill">BONUS</span>}
                {renderTimeoutPips(hud.homeTimeouts)}
              </div>
            </div>
            <TeamLogo
              id={homeTeam.id}
              abbr={homeTeam.abbr}
              name={homeTeam.name}
              era={homeTeam.era}
              primaryColor={homeTeam.colors.primary}
              secondaryColor={homeTeam.colors.secondary}
              accentColor={homeTeam.colors.accent}
              size={22}
            />
          </div>
        </aside>
      )}

      {/* =================================================================== */}
      {/* FINAL BUZZER POST-GAME BOX SCORE OVERLAY                            */}
      {/* =================================================================== */}
      {hud.phase === 'GAME_OVER' && !suppressDefaultGameOver && (
        <div className="p5-gameover-overlay">
          <div className="p5-gameover-card">
            <div className="p5-go-kicker">FINAL BUZZER · PROPLAY BOX SCORE</div>
            <h2>
              {hud.winnerSide === 'HOME'
                ? `${homeTeam.city} ${homeTeam.name}`
                : `${awayTeam.city} ${awayTeam.name}`}{' '}
              WIN!
            </h2>
            <div className="p5-go-scoreline">
              <span>
                {awayTeam.abbr} <strong>{hud.awayScore}</strong>
              </span>
              <span>—</span>
              <span>
                <strong>{hud.homeScore}</strong> {homeTeam.abbr}
              </span>
            </div>
            <div className="p5-go-table-wrap">
              <table className="p5-box-table">
                <thead>
                  <tr>
                    <th>PLAYER</th>
                    <th>TEAM</th>
                    <th>PTS</th>
                    <th>REB</th>
                    <th>AST</th>
                    <th>STL</th>
                    <th>BLK</th>
                    <th>FG</th>
                  </tr>
                </thead>
                <tbody>
                  {hud.boxScore.map((row) => (
                    <tr key={row.playerId}>
                      <td>
                        #{row.jersey} {row.name}
                      </td>
                      <td>{row.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr}</td>
                      <td><strong>{row.pts}</strong></td>
                      <td>{row.reb}</td>
                      <td>{row.ast}</td>
                      <td>{row.stl}</td>
                      <td>{row.blk}</td>
                      <td>{row.fgm}/{row.fga}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p5-go-actions">
              <button type="button" className="p5-go-btn primary" onClick={onRematch}>
                PLAY REMATCH
              </button>
              <button type="button" className="p5-go-btn" onClick={onExitToMenu}>
                EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
