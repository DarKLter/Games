// ============================================================================
// PART 5 — INTERACTIVE MINI-COURT TACTICAL RADAR, ENEMY STAR MARKING & COACH HUB
// - Starts compact in Top-Left corner; expands on tap or [1-4] Tactics hotkey
// - Click/Tap any enemy player on the radar or roster drawer to apply
//   DOUBLE / DENY / OVER / PACK / CLEAR tactical marks directly to AISystem
// - On-the-fly Pick & Roll 45°/180° Angle & Roll/Fade control, Offensive Sets,
//   Defensive Schemes, Quick Lineup Presets with live stamina bars & Timeouts
// ============================================================================

import React, { useState } from 'react';
import {
  COURT_DIMS,
  type DefensiveSchemeId,
  type MarkCoverageTag,
  type PlayVisionPlayId,
} from '../engine/courtTypes';
import type { RadarPlayerDot, SimHudSnapshot } from '../engine/BasketballSimulation';
import type { LineupPresetId } from '../engine/SimTacticsAndReplay';
import type { HudControlLayoutRect } from '../hybrid/types';

export interface TacticalRadarAndMarkingProps {
  hud: SimHudSnapshot;
  homePrimaryColor: string;
  awayPrimaryColor: string;
  expanded: boolean;
  radarLayout?: HudControlLayoutRect;
  onToggleExpanded: () => void;
  onMarkEnemy: (playerId: string | null, tag: MarkCoverageTag) => void;
  onSetOffensivePlay: (play: PlayVisionPlayId) => void;
  onSetDefensiveScheme: (scheme: DefensiveSchemeId) => void;
  onCallPickAndRoll: () => void;
  onFlipScreenAngle: () => void;
  onToggleScreenAction: () => void;
  onApplyLineupPreset: (preset: LineupPresetId) => void;
  onCallTimeout: () => void;
}

type TacticsSubTab = 'MARKING' | 'OFFENSE' | 'DEFENSE' | 'SUBS';

const OFFENSIVE_SETS: Array<{ id: PlayVisionPlayId; label: string; desc: string }> = [
  { id: 'PICK_AND_ROLL', label: 'Smart Play (PnR)', desc: 'PlayVision high screen & dive' },
  { id: 'FIVE_OUT', label: '5-Out Iso', desc: 'Max perimeter spacing' },
  { id: 'MOTION_CUT', label: 'Motion Cut', desc: 'Backdoor & weakside slashes' },
  { id: 'HORNS', label: 'Horns Pick & Pop', desc: 'Dual elbows & pop shooters' },
  { id: 'FLOPPY', label: 'Floppy 3PT', desc: 'Baseline curls for catch-and-shoot' },
];

const DEFENSIVE_SCHEMES: Array<{ id: DefensiveSchemeId; label: string }> = [
  { id: 'MAN_TO_MAN', label: 'Man-to-Man' },
  { id: 'ZONE_2_3', label: '2-3 Zone' },
  { id: 'ZONE_3_2', label: '3-2 Zone' },
  { id: 'FULL_COURT_PRESS', label: 'Full-Court Press' },
  { id: 'HALF_COURT_TRAP', label: 'Half-Court Trap' },
];

const MARK_ACTIONS: Array<{ tag: MarkCoverageTag; icon: string; label: string }> = [
  { tag: 'DOUBLE', icon: '🎯', label: 'DOUBLE TEAM ON CATCH' },
  { tag: 'DENY', icon: '🔒', label: 'DENY BALL / FACE GUARD' },
  { tag: 'OVER', icon: '🛡️', label: 'GO OVER SCREENS' },
  { tag: 'PACK', icon: '🧱', label: 'PACK PAINT / SAG OFF' },
];

const LINEUP_PRESETS: Array<{ id: LineupPresetId; label: string }> = [
  { id: 'STARTERS', label: 'Starters' },
  { id: 'SHOOTERS', label: '3PT Shooters' },
  { id: 'TALL', label: 'Tall Lineup' },
  { id: 'DEFENSIVE', label: 'Defensive' },
];

function courtToRadarPct(x: number, z: number): { leftPct: number; topPct: number } {
  const leftPct = Math.max(4, Math.min(96, ((x + COURT_DIMS.HALF_LENGTH) / COURT_DIMS.LENGTH) * 100));
  const topPct = Math.max(6, Math.min(94, ((z + COURT_DIMS.HALF_WIDTH) / COURT_DIMS.WIDTH) * 100));
  return { leftPct, topPct };
}

export const TacticalRadarAndMarking: React.FC<TacticalRadarAndMarkingProps> = ({
  hud,
  homePrimaryColor,
  awayPrimaryColor,
  expanded,
  radarLayout,
  onToggleExpanded,
  onMarkEnemy,
  onSetOffensivePlay,
  onSetDefensiveScheme,
  onCallPickAndRoll,
  onFlipScreenAngle,
  onToggleScreenAction,
  onApplyLineupPreset,
  onCallTimeout,
}) => {
  const [subTab, setSubTab] = useState<TacticsSubTab>('MARKING');
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);

  const userSide: 'HOME' | 'AWAY' = hud.userTeamSide ?? 'HOME';
  const enemySide: 'HOME' | 'AWAY' = userSide === 'HOME' ? 'AWAY' : 'HOME';

  const allies = hud.radarPlayers.filter((p) => p.teamSide === userSide);
  const enemies = hud.radarPlayers.filter((p) => p.teamSide === enemySide);

  const activeSelectedEnemy: RadarPlayerDot | null =
    enemies.find((e) => e.id === selectedEnemyId) ||
    enemies.find((e) => e.id === hud.markedStar.playerId) ||
    enemies[0] ||
    null;

  const ballPos = courtToRadarPct(hud.radarBall.x, hud.radarBall.z);
  const userTimeouts = userSide === 'HOME' ? hud.homeTimeouts : hud.awayTimeouts;

  const handleEnemyDotClick = (enemy: RadarPlayerDot, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEnemyId(enemy.id);
    setSubTab('MARKING');
    if (!expanded) {
      onToggleExpanded();
    }
  };

  const radarStyle: React.CSSProperties | undefined =
    !expanded && radarLayout
      ? {
          transform: `translate(${radarLayout.x}px, ${radarLayout.y}px) scale(${Math.max(
            0.5,
            Math.min(1.5, radarLayout.scale)
          )})`,
          opacity: Math.max(0.2, Math.min(1, radarLayout.opacity)),
        }
      : undefined;

  return (
    <div
      className={`p5-radar-shell ${expanded ? 'expanded' : 'compact'}`}
      style={radarStyle}
    >
      {/* LIVE 2D MINI-COURT RADAR CANVAS */}
      <div
        className="p5-radar-court"
        onClick={onToggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpanded();
          }
        }}
        title={expanded ? 'Click court to collapse radar' : 'Tap to expand Tactical Radar & Enemy Marking'}
      >
        <svg viewBox="0 0 286 152" className="p5-radar-svg" aria-hidden="true">
          {/* Court lines */}
          <rect x="4" y="4" width="278" height="144" rx="4" fill="rgba(12,18,30,0.88)" stroke="rgba(148,163,184,0.45)" strokeWidth="2" />
          <line x1="143" y1="4" x2="143" y2="148" stroke="rgba(148,163,184,0.38)" strokeWidth="1.5" />
          <circle cx="143" cy="76" r="18" fill="none" stroke="rgba(148,163,184,0.38)" strokeWidth="1.5" />
          {/* Left & Right keys */}
          <rect x="4" y="51" width="54" height="50" fill="rgba(56,189,248,0.12)" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />
          <rect x="228" y="51" width="54" height="50" fill="rgba(239,68,68,0.12)" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5" />
          {/* Three-point arcs */}
          <path d="M 4 14 L 46 14 A 66 66 0 0 1 46 138 L 4 138" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
          <path d="M 282 14 L 240 14 A 66 66 0 0 0 240 138 L 282 138" fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />

          {/* Active PlayVision Tactical Line */}
          {hud.activePlay !== 'OFF' && (
            <path
              d={
                hud.activePlay === 'PICK_AND_ROLL'
                  ? 'M 186 76 Q 214 54 244 74'
                  : hud.activePlay === 'FIVE_OUT'
                    ? 'M 178 24 L 242 24 M 178 128 L 242 128'
                    : hud.activePlay === 'HORNS'
                      ? 'M 186 48 L 236 76 M 186 104 L 236 76'
                      : 'M 180 34 Q 212 76 180 118'
              }
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
            />
          )}
        </svg>

        {/* Live Allied & Enemy Player Dots */}
        {hud.radarPlayers.map((pl) => {
          const pos = courtToRadarPct(pl.x, pl.z);
          const isAlly = pl.teamSide === userSide;
          const isMarked = hud.markedStar.playerId === pl.id;
          const bg = pl.teamSide === 'HOME' ? homePrimaryColor : awayPrimaryColor;
          return (
            <button
              key={pl.id}
              type="button"
              className={`p5-radar-dot ${isAlly ? 'ally' : 'enemy'} ${
                pl.isUserControlled ? 'controlled' : ''
              } ${isMarked ? 'marked' : ''}`}
              style={{
                left: `${pos.leftPct}%`,
                top: `${pos.topPct}%`,
                backgroundColor: bg,
              }}
              onClick={(e) => {
                if (!isAlly) {
                  handleEnemyDotClick(pl, e);
                } else {
                  e.stopPropagation();
                  onToggleExpanded();
                }
              }}
              title={`${pl.name} (#${pl.jerseyNumber} ${pl.position})${
                !isAlly ? ' — Tap to Mark Star' : ''
              }`}
            >
              <span>{pl.jerseyNumber}</span>
              {isMarked && <em className="p5-radar-crosshair">🎯</em>}
            </button>
          );
        })}

        {/* Moving Basketball Dot */}
        <span
          className="p5-radar-ball"
          style={{ left: `${ballPos.leftPct}%`, top: `${ballPos.topPct}%` }}
        />

        {/* Compact Corner Caption */}
        <div className="p5-radar-cap">
          <span>{hud.activePlay === 'OFF' ? hud.defensiveScheme.replace(/_/g, ' ') : hud.activePlay.replace(/_/g, ' ')}</span>
          <strong>{expanded ? '▾ HIDE' : '▴ TAP MARK'}</strong>
        </div>
      </div>

      {/* LIVE PICK & ROLL STATUS CHIP (SHOWN WHENEVER SCREEN IS ACTIVE) */}
      {hud.pickAndRoll.active && (
        <div className="p5-pnr-live-chip">
          <span>
            PnR: <strong>{hud.pickAndRoll.screenerName}</strong> ({hud.pickAndRoll.angleDeg}°{' '}
            {hud.pickAndRoll.action})
          </span>
          <div className="p5-pnr-chip-btns">
            <button type="button" onClick={onFlipScreenAngle} title="Flip Screen Angle 45° / 180° [Q]">
              {hud.pickAndRoll.angleDeg === 45 ? '180°' : '45°'}
            </button>
            <button type="button" onClick={onToggleScreenAction} title="Toggle Roll vs Fade [E]">
              {hud.pickAndRoll.action === 'ROLL' ? 'FADE' : 'ROLL'}
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED COACH PLAYVISION & ENEMY STAR MARKING DRAWER */}
      {expanded && (
        <div className="p5-tactics-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="p5-td-tabs">
            {(
              [
                ['MARKING', '🎯 Mark'],
                ['OFFENSE', '🏀 Sets'],
                ['DEFENSE', '🛡️ Def'],
                ['SUBS', '⚡ Subs/TO'],
              ] as Array<[TacticsSubTab, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`p5-td-tab ${subTab === id ? 'active' : ''}`}
                onClick={() => setSubTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {subTab === 'MARKING' && (
            <div className="p5-td-section">
              <div className="p5-td-label">TAP ENEMY STAR TO MARK:</div>
              <div className="p5-enemy-row">
                {enemies.map((en) => {
                  const isSelected = activeSelectedEnemy?.id === en.id;
                  const isMarked = hud.markedStar.playerId === en.id;
                  return (
                    <button
                      key={en.id}
                      type="button"
                      className={`p5-enemy-pill ${isSelected ? 'selected' : ''} ${isMarked ? 'marked' : ''}`}
                      onClick={() => setSelectedEnemyId(en.id)}
                    >
                      <span>#{en.jerseyNumber} {en.lastName}</span>
                      <small>{en.position} · {en.ovr}</small>
                    </button>
                  );
                })}
              </div>

              {activeSelectedEnemy && (
                <div className="p5-mark-actions">
                  {MARK_ACTIONS.map((act) => {
                    const isActive =
                      hud.markedStar.playerId === activeSelectedEnemy.id &&
                      hud.markedStar.tag === act.tag;
                    return (
                      <button
                        key={act.tag}
                        type="button"
                        className={`p5-mark-btn ${isActive ? 'active' : ''}`}
                        onClick={() => onMarkEnemy(activeSelectedEnemy.id, act.tag)}
                      >
                        <span>{act.icon}</span>
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="p5-mark-btn clear"
                    onClick={() => onMarkEnemy(null, 'DOUBLE')}
                  >
                    ✖️ CLEAR MARK
                  </button>
                </div>
              )}
            </div>
          )}

          {subTab === 'OFFENSE' && (
            <div className="p5-td-section">
              <div className="p5-pnr-row">
                <button type="button" className="p5-td-action accent" onClick={onCallPickAndRoll}>
                  🧱 CALL SCREEN [C]
                </button>
                <button type="button" className="p5-td-action" onClick={onFlipScreenAngle}>
                  ANGLE: {hud.pickAndRoll.angleDeg}°
                </button>
                <button type="button" className="p5-td-action" onClick={onToggleScreenAction}>
                  {hud.pickAndRoll.action}
                </button>
              </div>
              <div className="p5-td-grid">
                {OFFENSIVE_SETS.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    className={`p5-td-chip ${hud.activePlay === set.id ? 'active' : ''}`}
                    onClick={() => onSetOffensivePlay(set.id)}
                    title={set.desc}
                  >
                    {set.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'DEFENSE' && (
            <div className="p5-td-section">
              <div className="p5-td-label">ON-THE-FLY DEFENSIVE SCHEME:</div>
              <div className="p5-td-grid">
                {DEFENSIVE_SCHEMES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`p5-td-chip ${hud.defensiveScheme === sc.id ? 'active' : ''}`}
                    onClick={() => onSetDefensiveScheme(sc.id)}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {subTab === 'SUBS' && (
            <div className="p5-td-section">
              <div className="p5-td-label">INSTANT LINEUP PRESETS:</div>
              <div className="p5-td-grid">
                {LINEUP_PRESETS.map((lp) => (
                  <button
                    key={lp.id}
                    type="button"
                    className={`p5-td-chip ${hud.activeLineupPreset === lp.id ? 'active' : ''}`}
                    onClick={() => onApplyLineupPreset(lp.id)}
                  >
                    {lp.label}
                  </button>
                ))}
              </div>

              <div className="p5-stamina-list">
                {allies.map((al) => (
                  <div key={al.id} className="p5-stam-row">
                    <span>
                      {al.position} {al.lastName}
                    </span>
                    <div className="p5-stam-mini-bar">
                      <div
                        className="p5-stam-mini-fill"
                        style={{
                          width: `${Math.round(al.stamina * 100)}%`,
                          backgroundColor:
                            al.stamina > 0.55 ? '#22c55e' : al.stamina > 0.3 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                    <small>{Math.round(al.stamina * 100)}%</small>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="p5-timeout-cta"
                disabled={userTimeouts <= 0}
                onClick={onCallTimeout}
              >
                ⏱ CALL TIMEOUT ({userTimeouts} LEFT · RESTORE STAMINA)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
