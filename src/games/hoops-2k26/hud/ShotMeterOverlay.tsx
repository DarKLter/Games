// ============================================================================
// PART 5 — ALL 5 AUTHENTIC 3D-PROJECTED SHOT METER STYLES (ShotMeterOverlay.tsx)
// 1. 2K26_ARROW (Default — Curved gold/green precision arrow beside shooter)
// 2. 2K14_FLOOR_RING (Under-feet circular timing bar + shot quality glow)
// 3. COMET (Sweeping arc comet converging into green peak)
// 4. VERTICAL_BAR (Clean vertical side bar with glowing green window)
// 5. MINIMAL (Ultra-compact horizontal competitive micro-bar)
// + 2K26 Skill Dunk curved ring, Free Throw bar, Jump Ball CTA, & No-Meter +15%
// ============================================================================

import React from 'react';
import type { ShotMeterColorId, ShotMeterStyleId } from '../hybrid/types';
import type { ActiveMeterHud } from '../engine/BasketballSimulation';
import type { ProjectedCourtAnchors } from '../engine/SimTacticsAndReplay';

export interface ShotMeterOverlayProps {
  meter: ActiveMeterHud;
  shotMeterStyle: ShotMeterStyleId;
  shotMeterColor?: ShotMeterColorId;
  teamPrimaryColor?: string;
  shotMeterEnabled: boolean;
  activeShooterId: string | null;
  projectedAnchorsRef: React.MutableRefObject<ProjectedCourtAnchors>;
  isUserFreeThrow: boolean;
  onJumpBallTap: () => void;
  onFreeThrowRelease: () => void;
}

function resolveMeterColor(colorId?: ShotMeterColorId, teamPrimary?: string): string {
  if (colorId === 'GOLD') return '#f59e0b';
  if (colorId === 'CYAN') return '#38bdf8';
  if (colorId === 'CRIMSON') return '#ef4444';
  if (colorId === 'TEAM_COLOR' && teamPrimary) return teamPrimary;
  return '#22c55e';
}

function clampCoord(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function computeMeterArcAngle(progress: number): number {
  // Maps 0..1 progress across a -125 deg to +45 deg precision curve
  return -125 + Math.max(0, Math.min(1, progress)) * 170;
}

export const ShotMeterOverlay: React.FC<ShotMeterOverlayProps> = ({
  meter,
  shotMeterStyle,
  shotMeterColor,
  teamPrimaryColor,
  shotMeterEnabled,
  activeShooterId,
  projectedAnchorsRef,
  isUserFreeThrow,
  onJumpBallTap,
  onFreeThrowRelease,
}) => {
  if (meter.kind === 'NONE') return null;
  const accentColor = resolveMeterColor(shotMeterColor, teamPrimaryColor);

  const isJumpShot = meter.kind === 'JUMPSHOT' || meter.kind === 'RHYTHM_SHOT';
  const isSkillDunk = meter.kind === 'SKILL_DUNK';
  const isJumpBall = meter.kind === 'JUMP_BALL';
  const isFreeThrow = meter.kind === 'FREE_THROW';

  // No-Meter Competitive Boost (+15% Green Window) hides jumpshot visual bar
  if (isJumpShot && !shotMeterEnabled) {
    return (
      <div className="p5-nometer-pill" aria-live="polite">
        <span className="p5-nometer-dot" />
        <strong>NO-METER BOOST (+15% GREEN)</strong>
        <span>WATCH VISUAL CUE</span>
      </div>
    );
  }

  const anchors = projectedAnchorsRef.current;
  const vw = anchors.width || 960;
  const vh = anchors.height || 540;
  const playerAnchor = activeShooterId ? anchors.players[activeShooterId] : undefined;

  const inGreen =
    Math.abs(meter.progress - meter.targetCenter) <= meter.greenHalfWidth;

  // 1. Opening Jump Ball & Free Throw centered precision bars
  if (isJumpBall || isFreeThrow) {
    const greenLeft = Math.max(0, (meter.targetCenter - meter.greenHalfWidth) * 100);
    const greenWidth = Math.min(100, meter.greenHalfWidth * 200);
    const pct = Math.min(100, Math.max(0, meter.progress * 100));

    return (
      <div className={`p5-center-meter ${isJumpBall ? 'is-jumpball' : 'is-ft'}`}>
        <div className="p5-center-meter-head">
          <span>{meter.label}</span>
          {inGreen && <strong className="p5-green-tag">GREEN WINDOW</strong>}
        </div>
        <div className="p5-linear-track">
          <div
            className="p5-linear-green"
            style={{ left: `${greenLeft}%`, width: `${greenWidth}%` }}
          />
          <div className="p5-linear-fill" style={{ width: `${pct}%` }} />
          <div className="p5-linear-needle" style={{ left: `${pct}%` }} />
        </div>
        {isJumpBall && (
          <button type="button" className="p5-meter-cta" onClick={onJumpBallTap}>
            TAP TO JUMP FOR TIP-OFF [SPACE]
          </button>
        )}
        {isFreeThrow && isUserFreeThrow && (
          <button type="button" className="p5-meter-cta" onClick={onFreeThrowRelease}>
            RELEASE FREE THROW [SPACE]
          </button>
        )}
      </div>
    );
  }

  // Resolve 3D-projected anchor beside shooter hands or under feet (with clean screen clamping)
  const useFeet = shotMeterStyle === '2K14_FLOOR_RING' && !isSkillDunk;
  const rawX = playerAnchor && playerAnchor.visible
    ? useFeet
      ? playerAnchor.feetX
      : playerAnchor.headX + 54
    : vw * 0.54;
  const rawY = playerAnchor && playerAnchor.visible
    ? useFeet
      ? playerAnchor.feetY + 8
      : playerAnchor.headY - 8
    : vh * 0.44;

  const anchorX = clampCoord(rawX, 74, vw - 74);
  const anchorY = clampCoord(rawY, 76, vh - 96);

  const prog = Math.max(0, Math.min(1, meter.progress));
  const greenStart = Math.max(0, meter.targetCenter - meter.greenHalfWidth);
  const greenEnd = Math.min(1, meter.targetCenter + meter.greenHalfWidth);

  // 2. 2K26 Skill Dunk High-Contrast Curved Ring
  if (isSkillDunk) {
    const r = 34;
    const circ = 2 * Math.PI * r;
    const arcLen = circ * 0.65;
    const fillLen = arcLen * prog;
    const greenOffset = arcLen * greenStart;
    const greenLen = Math.max(8, arcLen * (greenEnd - greenStart));

    return (
      <div
        className="p5-projected-meter style-skill-dunk"
        style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
      >
        <svg width="88" height="88" viewBox="0 0 88 88" className="p5-meter-svg">
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="rgba(15,23,42,0.88)"
            strokeWidth="10"
            strokeDasharray={`${arcLen} ${circ}`}
            transform="rotate(152 44 44)"
            strokeLinecap="round"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeDasharray={`${greenLen} ${circ}`}
            strokeDashoffset={-greenOffset}
            transform="rotate(152 44 44)"
            strokeLinecap="round"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={inGreen ? '#4ade80' : '#f97316'}
            strokeWidth="5"
            strokeDasharray={`${fillLen} ${circ}`}
            transform="rotate(152 44 44)"
            strokeLinecap="round"
          />
        </svg>
        <span className="p5-meter-badge dunk">SKILL DUNK</span>
      </div>
    );
  }

  // 3. All 5 Authentic Jumpshot / Rhythm Shot Meter Styles
  if (shotMeterStyle === '2K26_ARROW') {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const arcLen = circ * 0.44;
    const fillLen = arcLen * prog;
    const greenOffset = arcLen * greenStart;
    const greenLen = Math.max(7, arcLen * (greenEnd - greenStart));
    const needleDeg = computeMeterArcAngle(prog);

    return (
      <div
        className={`p5-projected-meter style-2k26-arrow ${inGreen ? 'in-green' : ''}`}
        style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
        data-meter-style="2K26_ARROW"
      >
        <svg width="92" height="92" viewBox="0 0 92 92" className="p5-meter-svg">
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="none"
            stroke="rgba(10,14,24,0.86)"
            strokeWidth="11"
            strokeDasharray={`${arcLen} ${circ}`}
            transform="rotate(-125 46 46)"
            strokeLinecap="round"
          />
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="none"
            stroke={accentColor}
            strokeWidth="11"
            strokeDasharray={`${greenLen} ${circ}`}
            strokeDashoffset={-greenOffset}
            transform="rotate(-125 46 46)"
          />
          <circle
            cx="46"
            cy="46"
            r={r}
            fill="none"
            stroke={inGreen ? '#86efac' : accentColor}
            strokeWidth="6"
            strokeDasharray={`${fillLen} ${circ}`}
            transform="rotate(-125 46 46)"
            strokeLinecap="round"
          />
          <g transform={`rotate(${needleDeg} 46 46)`}>
            <polygon points="82,46 73,41 73,51" fill="#ffffff" />
          </g>
        </svg>
        {meter.isRhythmArmed && (
          <span className="p5-meter-badge rhythm">FLICK UP · TEMPO</span>
        )}
      </div>
    );
  }

  if (shotMeterStyle === '2K14_FLOOR_RING') {
    const r = 30;
    const circ = 2 * Math.PI * r;
    const fillLen = circ * prog;
    const greenOffset = circ * greenStart;
    const greenLen = Math.max(8, circ * (greenEnd - greenStart));

    return (
      <div
        className={`p5-projected-meter style-2k14-ring ${inGreen ? 'in-green' : ''}`}
        style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
        data-meter-style="2K14_FLOOR_RING"
      >
        <svg width="84" height="50" viewBox="0 0 84 84" className="p5-meter-svg floor-squash">
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke="rgba(12,16,24,0.85)"
            strokeWidth="10"
          />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke="#22c55e"
            strokeWidth="10"
            strokeDasharray={`${greenLen} ${circ}`}
            strokeDashoffset={-greenOffset}
            transform="rotate(-90 42 42)"
          />
          <circle
            cx="42"
            cy="42"
            r={r}
            fill="none"
            stroke={inGreen ? '#4ade80' : '#ef4444'}
            strokeWidth="6"
            strokeDasharray={`${fillLen} ${circ}`}
            transform="rotate(-90 42 42)"
          />
        </svg>
      </div>
    );
  }

  if (shotMeterStyle === 'COMET') {
    const tailW = Math.max(4, prog * 78);
    const greenL = greenStart * 100;
    const greenW = (greenEnd - greenStart) * 100;
    return (
      <div
        className={`p5-projected-meter style-comet ${inGreen ? 'in-green' : ''}`}
        style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
        data-meter-style="COMET"
      >
        <div className="p5-comet-arc">
          <div
            className="p5-comet-green"
            style={{ left: `${greenL}%`, width: `${greenW}%` }}
          />
          <div className="p5-comet-tail" style={{ width: `${tailW}px` }} />
          <div className="p5-comet-head" style={{ left: `${prog * 100}%` }} />
        </div>
        {meter.isRhythmArmed && <span className="p5-meter-badge rhythm">RHYTHM</span>}
      </div>
    );
  }

  if (shotMeterStyle === 'VERTICAL_BAR') {
    const greenBottom = greenStart * 100;
    const greenH = (greenEnd - greenStart) * 100;
    return (
      <div
        className={`p5-projected-meter style-vertical ${inGreen ? 'in-green' : ''}`}
        style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
        data-meter-style="VERTICAL_BAR"
      >
        <div className="p5-vbar-track">
          <div
            className="p5-vbar-green"
            style={{ bottom: `${greenBottom}%`, height: `${greenH}%` }}
          />
          <div className="p5-vbar-fill" style={{ height: `${prog * 100}%` }} />
          <div className="p5-vbar-tick" style={{ bottom: `${prog * 100}%` }} />
        </div>
        {meter.isRhythmArmed && <span className="p5-meter-badge rhythm">UP</span>}
      </div>
    );
  }

  // 5. MINIMAL (Ultra-compact horizontal competitive bar)
  return (
    <div
      className={`p5-projected-meter style-minimal ${inGreen ? 'in-green' : ''}`}
      style={{ left: `${anchorX}px`, top: `${anchorY}px` }}
      data-meter-style="MINIMAL"
    >
      <div className="p5-min-track">
        <div
          className="p5-min-green"
          style={{
            left: `${greenStart * 100}%`,
            width: `${(greenEnd - greenStart) * 100}%`,
          }}
        />
        <div className="p5-min-needle" style={{ left: `${prog * 100}%` }} />
      </div>
    </div>
  );
};
