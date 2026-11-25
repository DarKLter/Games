// ============================================================================
// PART 5 — FULL PAUSE MENU MODAL & 4-SECOND INSTANT REPLAY (PauseMenuModal.tsx)
// Tabs: Resume, Instant Replay (4s scrub + play/pause + slow-mo + 7 cams),
// Live Box Score, Coach Gameplan, Camera Settings, 7-Tab Settings, Quit to Menu
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  CAMERA_ANGLE_OPTIONS,
  type CameraAngleId,
  type DefensiveSchemeId,
  type PlayVisionPlayId,
} from '../engine/courtTypes';
import type { SimHudSnapshot } from '../engine/BasketballSimulation';
import type { LineupPresetId } from '../engine/SimTacticsAndReplay';
import type { SettingsState, SettingsTabId } from '../hybrid/types';
import type { TeamData } from '../hybrid/rosterTypes';

export interface PauseMenuModalProps {
  open: boolean;
  hud: SimHudSnapshot;
  homeTeam: TeamData;
  awayTeam: TeamData;
  cameraSettings: SettingsState['camera'];
  onResume: () => void;
  onPreviewReplayFrame: (frameIndex: number) => void;
  onRestoreLiveFrame: () => void;
  onSetOffensivePlay: (play: PlayVisionPlayId) => void;
  onSetDefensiveScheme: (scheme: DefensiveSchemeId) => void;
  onApplyLineupPreset: (preset: LineupPresetId) => void;
  onCallTimeout: () => void;
  onUpdateCamera: (patch: Partial<SettingsState['camera']>) => void;
  onOpenFullSettings: (tab?: SettingsTabId) => void;
  onOpenInstantReplay?: () => void;
  onRematch: () => void;
  onLaunchLegacyCourt: () => void;
  onQuitToMenu: () => void;
}

type PauseTab = 'MENU' | 'REPLAY' | 'BOX_SCORE' | 'GAMEPLAN' | 'CAMERA';

const OFFENSE_OPTIONS: Array<{ id: PlayVisionPlayId; label: string }> = [
  { id: 'PICK_AND_ROLL', label: 'Smart Play (PnR)' },
  { id: 'FIVE_OUT', label: '5-Out Iso' },
  { id: 'MOTION_CUT', label: 'Motion Cut' },
  { id: 'HORNS', label: 'Horns Pick & Pop' },
  { id: 'FLOPPY', label: 'Floppy 3PT' },
  { id: 'OFF', label: 'Freelance (Off)' },
];

const DEFENSE_OPTIONS: Array<{ id: DefensiveSchemeId; label: string }> = [
  { id: 'MAN_TO_MAN', label: 'Man-to-Man' },
  { id: 'ZONE_2_3', label: '2-3 Zone' },
  { id: 'ZONE_3_2', label: '3-2 Zone' },
  { id: 'FULL_COURT_PRESS', label: 'Full-Court Press' },
  { id: 'HALF_COURT_TRAP', label: 'Half-Court Trap' },
];

const LINEUP_OPTIONS: Array<{ id: LineupPresetId; label: string }> = [
  { id: 'STARTERS', label: 'Starters' },
  { id: 'SHOOTERS', label: '3PT Shooters' },
  { id: 'TALL', label: 'Tall Lineup' },
  { id: 'DEFENSIVE', label: 'Defensive' },
];

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  open,
  hud,
  homeTeam,
  awayTeam,
  cameraSettings,
  onResume,
  onPreviewReplayFrame,
  onRestoreLiveFrame,
  onSetOffensivePlay,
  onSetDefensiveScheme,
  onApplyLineupPreset,
  onCallTimeout,
  onUpdateCamera,
  onOpenFullSettings,
  onOpenInstantReplay,
  onRematch,
  onLaunchLegacyCourt,
  onQuitToMenu,
}) => {
  const [tab, setTab] = useState<PauseTab>('MENU');
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<0.25 | 0.5 | 1>(0.5);
  const [replayIndex, setReplayIndex] = useState(0);

  const maxReplayIdx = Math.max(0, hud.replayFrameCount - 1);

  useEffect(() => {
    if (!open) {
      setReplayPlaying(false);
      setTab('MENU');
      return;
    }
    setReplayIndex(Math.max(0, hud.replayFrameCount - 1));
  }, [open, hud.replayFrameCount]);

  // Replay playback ticker (30 Hz base scaled by 0.25x / 0.5x / 1x)
  useEffect(() => {
    if (!open || tab !== 'REPLAY' || !replayPlaying || maxReplayIdx <= 0) return;
    const stepMs = Math.max(16, Math.round((1000 / 30) / replaySpeed));
    const timer = window.setInterval(() => {
      setReplayIndex((prev) => {
        const next = prev >= maxReplayIdx ? 0 : prev + 1;
        onPreviewReplayFrame(next);
        return next;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [open, tab, replayPlaying, replaySpeed, maxReplayIdx, onPreviewReplayFrame]);

  if (!open) return null;

  const enterReplay = () => {
    if (onOpenInstantReplay) {
      onOpenInstantReplay();
      return;
    }
    setTab('REPLAY');
    const startIdx = Math.max(0, Math.min(maxReplayIdx, Math.floor(maxReplayIdx * 0.2)));
    setReplayIndex(startIdx);
    if (hud.replayFrameCount > 0) {
      onPreviewReplayFrame(startIdx);
      setReplayPlaying(true);
    }
  };

  const leaveReplayTo = (nextTab: PauseTab) => {
    setReplayPlaying(false);
    onRestoreLiveFrame();
    setTab(nextTab);
  };

  const userSide = hud.userTeamSide ?? 'HOME';
  const userTimeouts = userSide === 'HOME' ? hud.homeTimeouts : hud.awayTimeouts;

  // Compact floating bottom bar during Instant Replay so the 3D court stays 100% visible!
  if (tab === 'REPLAY') {
    return (
      <div className="p5-replay-bar" role="dialog" aria-label="Instant Replay Controls">
        <div className="p5-replay-head">
          <div>
            <span className="p5-replay-kicker">INSTANT REPLAY · 4-SEC PROPLAY BUFFER</span>
            <strong>
              FRAME {replayIndex + 1} / {Math.max(1, hud.replayFrameCount)}
            </strong>
          </div>
          <div className="p5-replay-cam-pills">
            {CAMERA_ANGLE_OPTIONS.slice(0, 5).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`p5-rep-pill ${cameraSettings.angle === c.id ? 'active' : ''}`}
                onClick={() => onUpdateCamera({ angle: c.id as CameraAngleId })}
              >
                {c.shortLabel}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p5-rep-exit"
            onClick={() => leaveReplayTo('MENU')}
          >
            ◀ BACK TO PAUSE
          </button>
        </div>

        <div className="p5-replay-controls">
          <button
            type="button"
            className="p5-rep-btn primary"
            disabled={hud.replayFrameCount === 0}
            onClick={() => setReplayPlaying((v) => !v)}
          >
            {replayPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <input
            type="range"
            className="p5-rep-scrubber"
            min={0}
            max={maxReplayIdx}
            value={Math.min(replayIndex, maxReplayIdx)}
            disabled={hud.replayFrameCount === 0}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setReplayPlaying(false);
              setReplayIndex(idx);
              onPreviewReplayFrame(idx);
            }}
          />
          <div className="p5-rep-speeds">
            {([0.25, 0.5, 1] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                className={`p5-rep-pill ${replaySpeed === sp ? 'active' : ''}`}
                onClick={() => setReplaySpeed(sp)}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p5-pause-backdrop" role="dialog" aria-modal="true" aria-label="Match Pause Menu">
      <div className="p5-pause-modal" onClick={(e) => e.stopPropagation()}>
        <header className="p5-pause-header">
          <div>
            <div className="p5-pause-kicker">MATCH PAUSED · {hud.quarterLabel}</div>
            <h2>
              {awayTeam.abbr} {hud.awayScore} — {hud.homeScore} {homeTeam.abbr}
            </h2>
          </div>
          <button type="button" className="p5-pause-resume-top" onClick={onResume}>
            ▶ RESUME [ESC]
          </button>
        </header>

        <nav className="p5-pause-tabs">
          <button
            type="button"
            className={`p5-ptab ${tab === 'MENU' ? 'active' : ''}`}
            onClick={() => setTab('MENU')}
          >
            Pause Menu
          </button>
          <button
            type="button"
            className="p5-ptab"
            onClick={enterReplay}
          >
            🎬 Instant Replay ({hud.replayFrameCount})
          </button>
          <button
            type="button"
            className={`p5-ptab ${tab === 'BOX_SCORE' ? 'active' : ''}`}
            onClick={() => setTab('BOX_SCORE')}
          >
            📊 Box Score
          </button>
          <button
            type="button"
            className={`p5-ptab ${tab === 'GAMEPLAN' ? 'active' : ''}`}
            onClick={() => setTab('GAMEPLAN')}
          >
            📋 Gameplan
          </button>
          <button
            type="button"
            className={`p5-ptab ${tab === 'CAMERA' ? 'active' : ''}`}
            onClick={() => setTab('CAMERA')}
          >
            📷 Camera
          </button>
        </nav>

        <div className="p5-pause-body">
          {tab === 'MENU' && (
            <div className="p5-pause-menu-grid">
              <button type="button" className="p5-pm-card primary" onClick={onResume}>
                <strong>▶ RESUME MATCH</strong>
                <span>Return directly to live 3D hardwood action</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={enterReplay}>
                <strong>🎬 INSTANT REPLAY</strong>
                <span>Scrub the last 4 seconds from any of the 7 cameras</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={() => setTab('BOX_SCORE')}>
                <strong>📊 LIVE BOX SCORE</strong>
                <span>Points, Rebounds, Assists, Steals, Blocks & FG%</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={() => setTab('GAMEPLAN')}>
                <strong>📋 COACH GAMEPLAN</strong>
                <span>Offensive Sets, Defensive Schemes, Subs & Timeouts</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={() => setTab('CAMERA')}>
                <strong>📷 CAMERA SETTINGS</strong>
                <span>Switch 7 authentic 2K angles, Zoom, Height & Auto-Flip</span>
              </button>
              <button
                type="button"
                className="p5-pm-card"
                onClick={() => onOpenFullSettings('CONTROLLER')}
              >
                <strong>⚙ 7-TAB SETTINGS</strong>
                <span>5 Shot Meter styles, Rhythm Profiles, Audio & Sliders</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={onRematch}>
                <strong>🔁 RESTART TIP-OFF</strong>
                <span>Reset score & clocks for a fresh opening jump ball</span>
              </button>
              <button type="button" className="p5-pm-card" onClick={onLaunchLegacyCourt}>
                <strong>🕹️ CLASSIC ARCADE 3D</strong>
                <span>Switch to the classic 3D arcade basketball arena</span>
              </button>
              <button type="button" className="p5-pm-card danger" onClick={onQuitToMenu}>
                <strong>✖ QUIT TO MAIN MENU</strong>
                <span>Leave current match and return to Hybrid Main Menu</span>
              </button>
            </div>
          )}

          {tab === 'BOX_SCORE' && (
            <div className="p5-pause-box-wrap">
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
                    <th>3PT</th>
                    <th>PF</th>
                  </tr>
                </thead>
                <tbody>
                  {hud.boxScore.map((row) => (
                    <tr key={row.playerId}>
                      <td>
                        #{row.jersey} {row.name} <small>({row.position})</small>
                      </td>
                      <td>{row.teamSide === 'HOME' ? homeTeam.abbr : awayTeam.abbr}</td>
                      <td><strong>{row.pts}</strong></td>
                      <td>{row.reb}</td>
                      <td>{row.ast}</td>
                      <td>{row.stl}</td>
                      <td>{row.blk}</td>
                      <td>{row.fgm}/{row.fga}</td>
                      <td>{row.tpm}/{row.tpa}</td>
                      <td>{row.fouls}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'GAMEPLAN' && (
            <div className="p5-pause-gp">
              <div className="p5-gp-group">
                <h4>OFFENSIVE SET (PLAYVISION)</h4>
                <div className="p5-gp-chips">
                  {OFFENSE_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className={`p5-gp-chip ${hud.activePlay === o.id ? 'active' : ''}`}
                      onClick={() => onSetOffensivePlay(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p5-gp-group">
                <h4>DEFENSIVE SCHEME</h4>
                <div className="p5-gp-chips">
                  {DEFENSE_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`p5-gp-chip ${hud.defensiveScheme === d.id ? 'active' : ''}`}
                      onClick={() => onSetDefensiveScheme(d.id)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p5-gp-group">
                <h4>QUICK LINEUP PRESETS &amp; TIMEOUT</h4>
                <div className="p5-gp-chips">
                  {LINEUP_OPTIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`p5-gp-chip ${hud.activeLineupPreset === l.id ? 'active' : ''}`}
                      onClick={() => onApplyLineupPreset(l.id)}
                    >
                      {l.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="p5-gp-chip accent"
                    disabled={userTimeouts <= 0}
                    onClick={() => {
                      onCallTimeout();
                      onResume();
                    }}
                  >
                    ⏱ CALL TIMEOUT ({userTimeouts} LEFT)
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'CAMERA' && (
            <div className="p5-pause-gp">
              <div className="p5-gp-group">
                <h4>ALL 7 AUTHENTIC 2K CAMERAS</h4>
                <div className="p5-gp-chips">
                  {CAMERA_ANGLE_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`p5-gp-chip ${cameraSettings.angle === c.id ? 'active' : ''}`}
                      onClick={() => onUpdateCamera({ angle: c.id })}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p5-cam-sliders">
                <label>
                  <span>Zoom ({cameraSettings.zoom}/10)</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={cameraSettings.zoom}
                    onChange={(e) => onUpdateCamera({ zoom: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span>Height ({cameraSettings.height}/10)</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={cameraSettings.height}
                    onChange={(e) => onUpdateCamera({ height: Number(e.target.value) })}
                  />
                </label>
              </div>
              <div className="p5-cam-checks">
                <label>
                  <input
                    type="checkbox"
                    checked={cameraSettings.autoFlip}
                    onChange={(e) => onUpdateCamera({ autoFlip: e.target.checked })}
                  />
                  <span>Auto-Flip 180°</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={cameraSettings.keyZoom}
                    onChange={(e) => onUpdateCamera({ keyZoom: e.target.checked })}
                  />
                  <span>Key Zoom</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={cameraSettings.reverseAngle}
                    onChange={(e) => onUpdateCamera({ reverseAngle: e.target.checked })}
                  />
                  <span>Reverse Angle</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={cameraSettings.dunkCameraShake}
                    onChange={(e) => onUpdateCamera({ dunkCameraShake: e.target.checked })}
                  />
                  <span>Contact Dunk Shake</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
