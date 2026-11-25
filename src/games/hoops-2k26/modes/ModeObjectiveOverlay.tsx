// ============================================================================
// PART 6 — LIVE 3D COURT MODE OBJECTIVE HUD & POST-MATCH REWARD SETTLEMENT
// Zero backdrop-filter (60 FPS WebGL Safe). Displays live Path to Greatness,
// Street Kings, Proving Grounds, Theater, MyTEAM & Training Camp objectives
// and settles VC/MTP/Rep/Stars/Medals cleanly upon game completion.
// ============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SimHudSnapshot } from '../engine/BasketballSimulation';
import { ModesStore } from './modesStore';
import { TRAINING_DRILLS, type ModeLaunchPayload } from './modesTypes';
import './modesHud.css';

export interface ModeObjectiveOverlayProps {
  payload: ModeLaunchPayload | null;
  hud: SimHudSnapshot;
  suppressPostMatchModal?: boolean;
  onModeSettled?: (summary: string) => void;
  onFinishAndReturn: (returnScreen: ModeLaunchPayload['returnScreen']) => void;
  onRematch: () => void;
}

export const ModeObjectiveOverlay: React.FC<ModeObjectiveOverlayProps> = ({
  payload,
  hud,
  suppressPostMatchModal = false,
  onModeSettled,
  onFinishAndReturn,
  onRematch,
}) => {
  const settledRef = useRef(false);
  const [settled, setSettled] = useState<{
    headline: string;
    vcEarned: number;
    mtpEarned: number;
    repEarned: number;
    details: string;
  } | null>(null);

  // Track live star stats & drill metric from SimHudSnapshot box scores
  const liveProgress = useMemo(() => {
    if (!payload) return { starPts: 0, starAst: 0, drillCount: 0, userWon: false, margin: 0 };
    const userSide = hud.userTeamSide ?? 'HOME';
    const userScore = userSide === 'HOME' ? hud.homeScore : hud.awayScore;
    const oppScore = userSide === 'HOME' ? hud.awayScore : hud.homeScore;
    const margin = userScore - oppScore;
    const userWon = margin > 0;

    const userRows = hud.boxScore.filter((b) => b.teamSide === userSide);
    const targetName = (payload.starPlayerTargetName ?? '').toLowerCase();
    const starRow =
      (targetName && userRows.find((r) => r.name.toLowerCase().includes(targetName.split(' ')[0]))) ||
      userRows[0];
    const starPts = starRow ? starRow.pts : 0;
    const starAst = starRow ? starRow.ast : 0;

    // Training Camp drill live metric computation from user team box score
    let drillCount = 0;
    if (payload.trainingDrillId) {
      const sumFgm = userRows.reduce((s, r) => s + r.fgm, 0);
      const sumTpm = userRows.reduce((s, r) => s + r.tpm, 0);
      const sumAst = userRows.reduce((s, r) => s + r.ast, 0);
      const sumDef = userRows.reduce((s, r) => s + r.reb + r.stl + r.blk, 0);
      if (payload.trainingDrillId === 'DRILL_RHYTHM_SHOOTING') {
        drillCount = sumFgm + sumTpm;
      } else if (payload.trainingDrillId === 'DRILL_EURO_FINISHING') {
        drillCount = sumFgm;
      } else if (payload.trainingDrillId === 'DRILL_QUICK_PROTECT') {
        drillCount = sumFgm + sumAst;
      } else if (payload.trainingDrillId === 'DRILL_PNR_PLAYVISION') {
        drillCount = sumAst + Math.floor(sumFgm / 2);
      } else if (payload.trainingDrillId === 'DRILL_ALLEY_OOP') {
        drillCount = sumFgm + sumAst;
      } else {
        drillCount = sumDef;
      }
    }

    return { starPts, starAst, drillCount, userWon, margin };
  }, [payload, hud]);

  // Reset settlement when a fresh match begins
  useEffect(() => {
    if (hud.phase !== 'GAME_OVER') {
      settledRef.current = false;
      setSettled(null);
    }
  }, [hud.phase]);

  // Settle rewards once upon reaching GAME_OVER
  useEffect(() => {
    if (!payload || hud.phase !== 'GAME_OVER' || settledRef.current) return;
    settledRef.current = true;
    const res = ModesStore.settleCompletedModeMatch({
      userWon: liveProgress.userWon,
      margin: liveProgress.margin,
      starPts: liveProgress.starPts,
      starAst: liveProgress.starAst,
      drillMetricCount: liveProgress.drillCount,
    });
    setSettled(res);
    if (res && onModeSettled) {
      onModeSettled(`${res.headline} · ${res.details}`);
    }
  }, [payload, hud.phase, liveProgress, onModeSettled]);

  if (!payload) return null;

  const activeDrill = payload.trainingDrillId
    ? TRAINING_DRILLS.find((d) => d.id === payload.trainingDrillId)
    : null;

  const handleManualFinishDrill = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    const res = ModesStore.settleCompletedModeMatch({
      userWon: true,
      margin: Math.max(1, liveProgress.margin),
      starPts: liveProgress.starPts,
      starAst: liveProgress.starAst,
      drillMetricCount: liveProgress.drillCount,
    });
    setSettled(res);
  };

  return (
    <>
      {/* Live Top-Center Objective / Drill Tracker Banner */}
      {hud.phase !== 'GAME_OVER' && !settled && payload.objectiveBanner && (
        <div className="h2k-live-obj-banner">
          <div style={{ minWidth: 0 }}>
            <strong style={{ color: '#fcd34d', marginRight: 8 }}>{payload.title}</strong>
            <span className="h2k-muted">{payload.objectiveBanner}</span>
            {payload.targetStarPts && (
              <div className="h2k-tabular" style={{ marginTop: 3, color: '#4ade80', fontWeight: 700 }}>
                {payload.starPlayerTargetName}: {liveProgress.starPts}/{payload.targetStarPts} PTS
                {payload.targetStarAst
                  ? ` · ${liveProgress.starAst}/${payload.targetStarAst} AST`
                  : ''}{' '}
                · Margin {liveProgress.margin >= 0 ? `+${liveProgress.margin}` : liveProgress.margin}
              </div>
            )}
            {activeDrill && (
              <div className="h2k-tabular" style={{ marginTop: 3, color: '#38bdf8', fontWeight: 700 }}>
                {activeDrill.metricLabel}: {liveProgress.drillCount} / {activeDrill.goldTarget} (Gold)
              </div>
            )}
          </div>
          {(payload.kind === 'TRAINING_DRILL' || payload.kind === 'TRAINING_FREESTYLE' || payload.kind === 'CITY_MYCOURT') && (
            <button
              type="button"
              className="h2k-mode-btn primary"
              style={{ minHeight: 30, padding: '0 10px' }}
              onClick={handleManualFinishDrill}
            >
              Finish &amp; Claim
            </button>
          )}
        </div>
      )}

      {/* Post-Match Reward Claim Modal (only when not unified into Part 7 PostMatchScreen) */}
      {settled && !suppressPostMatchModal && (
        <div className="h2k-live-reward-modal">
          <div className="h2k-live-reward-card">
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>
              POST-GAME REWARDS SETTLED
            </div>
            <h3 style={{ margin: 0, fontFamily: 'Oswald, sans-serif', fontSize: 26 }}>
              {settled.headline}
            </h3>
            <div className="h2k-tabular" style={{ fontSize: 14, color: '#cbd5e1' }}>
              Final Score: <strong>{hud.awayAbbr} {hud.awayScore}</strong> –{' '}
              <strong>{hud.homeAbbr} {hud.homeScore}</strong>
            </div>
            {settled.details && (
              <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
                {settled.details}
              </div>
            )}
            <div
              className="h2k-grid-3 h2k-tabular"
              style={{
                padding: 12,
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <div>
                <div className="h2k-muted">VC Earned</div>
                <strong style={{ fontSize: 18, color: '#fbbf24' }}>
                  +{settled.vcEarned.toLocaleString()}
                </strong>
              </div>
              <div>
                <div className="h2k-muted">MTP Earned</div>
                <strong style={{ fontSize: 18, color: '#38bdf8' }}>
                  +{settled.mtpEarned.toLocaleString()}
                </strong>
              </div>
              <div>
                <div className="h2k-muted">Rep / XP</div>
                <strong style={{ fontSize: 18, color: '#4ade80' }}>
                  +{settled.repEarned.toLocaleString()}
                </strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="h2k-mode-btn primary"
                style={{ flex: 1 }}
                onClick={() => onFinishAndReturn(payload.returnScreen)}
              >
                Continue &amp; Return
              </button>
              <button
                type="button"
                className="h2k-mode-btn"
                onClick={onRematch}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
