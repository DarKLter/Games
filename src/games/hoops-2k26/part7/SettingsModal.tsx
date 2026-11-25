// ============================================================================
// PART 7 — COMPLETE 7-TAB SETTINGS & DUAL-FORMAT PROFILE SUITE
// Accessible from BOTH Main Menu (⚙️ / Profile) and In-Match Pause Menu (⚙️)
// Adapts live to 2K14_CLASSIC (Crimson/Gold) vs 2K26_NEXTGEN (Obsidian/Cyan)
// ============================================================================

import React, { useEffect, useMemo, useState } from 'react';
import {
  HYBRID_2K_BEATS_TRACKS,
  HybridAudioEngine,
  type HybridBeatsSnapshot,
} from '../hybrid/audioEngine';
import {
  ACHIEVEMENT_CATALOG,
  GAMEPLAY_SLIDER_META,
  UltimateHybridStore,
} from '../hybrid/store';
import { RosterStore } from '../hybrid/rosterStore';
import { useModesStore } from '../modes/modesStore';
import type { CameraAngleId } from '../engine/courtTypes';
import type {
  GameplaySliderKey,
  KeybindActionId,
  MatchDifficulty,
  QuarterLengthOption,
  SettingsState,
  SettingsTabId,
  ShotFeedbackModeId,
  ShotMeterColorId,
  ShotMeterStyleId,
  SliderPresetId,
  TouchControlsVisibility,
  UIEraMode,
  UltimateHybridSave,
} from '../hybrid/types';
import { ShotChartCanvas } from './ShotChartCanvas';
import './part7Hud.css';

export interface SettingsModalProps {
  save: UltimateHybridSave;
  beats: HybridBeatsSnapshot;
  initialTab?: SettingsTabId;
  inMatch?: boolean;
  onClose: () => void;
  onOpenCustomHudEditor: () => void;
  onNotify?: (msg: string) => void;
}

const TABS: Array<{ id: SettingsTabId; label: string }> = [
  { id: 'GAMEPLAY', label: '1. Gameplay' },
  { id: 'CONTROLLER', label: '2. Controller' },
  { id: 'CAMERA', label: '3. Camera' },
  { id: 'VISUAL', label: '4. Visuals' },
  { id: 'AUDIO', label: '5. Audio & Beats' },
  { id: 'COACH', label: '6. Sliders' },
  { id: 'DATA', label: '7. Profile & Data' },
];

const DIFFICULTIES: MatchDifficulty[] = [
  'Rookie',
  'Pro',
  'All-Star',
  'Superstar',
  'Hall of Fame',
];

const QUARTER_LENGTHS: QuarterLengthOption[] = [2, 3, 5, 6, 8, 10, 12];

const CAMERA_PRESETS: Array<{ id: CameraAngleId; label: string }> = [
  { id: '2K', label: '2K' },
  { id: '2K_LOW', label: '2K Low' },
  { id: 'BROADCAST', label: 'Broadcast' },
  { id: 'DRIVE', label: 'Drive' },
  { id: 'PLAYER_LOCK', label: 'Player Lock' },
  { id: 'HIGH', label: 'High' },
  { id: 'NOSEBLEEDS', label: 'Nosebleeds' },
];

const SHOT_METER_STYLES: Array<{ id: ShotMeterStyleId; label: string }> = [
  { id: '2K26_ARROW', label: '2K26 Arrow' },
  { id: '2K14_FLOOR_RING', label: '2K14 Floor Ring' },
  { id: 'COMET', label: 'Comet' },
  { id: 'VERTICAL_BAR', label: 'Vertical Bar' },
  { id: 'MINIMAL', label: 'Minimal' },
];

const SHOT_METER_COLORS: Array<{ id: ShotMeterColorId; label: string; swatch: string }> = [
  { id: 'GREEN', label: 'Green', swatch: '#22c55e' },
  { id: 'GOLD', label: 'Gold', swatch: '#f59e0b' },
  { id: 'CYAN', label: 'Cyan', swatch: '#38bdf8' },
  { id: 'CRIMSON', label: 'Crimson', swatch: '#ef4444' },
  { id: 'TEAM_COLOR', label: 'Team Color', swatch: '#a855f7' },
];

const KEYBIND_LABELS: Array<{ id: KeybindActionId; label: string }> = [
  { id: 'shoot', label: 'Shoot / Dunk' },
  { id: 'pass', label: 'Chest Pass' },
  { id: 'bouncePass', label: 'Bounce Pass' },
  { id: 'dribble', label: 'Dribble / Protect' },
  { id: 'screen', label: 'Call Screen (PnR)' },
  { id: 'alleyOop', label: 'Alley-Oop Lob' },
  { id: 'iconPass', label: 'Icon Passing' },
  { id: 'takeover', label: 'Ignite Takeover' },
  { id: 'sprint', label: 'Sprint / Turbo' },
  { id: 'steal', label: 'Steal / Reach' },
  { id: 'block', label: 'Block / Rebound' },
  { id: 'switchDef', label: 'Switch Defender' },
  { id: 'handsUp', label: 'Hands-Up Contest' },
  { id: 'camera', label: 'Cycle Camera' },
  { id: 'pause', label: 'Pause Menu' },
];

function formatKeyCode(code: string): string {
  if (!code) return '---';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code === 'ShiftLeft' || code === 'ShiftRight') return 'SHIFT';
  if (code === 'ControlLeft' || code === 'ControlRight') return 'CTRL';
  if (code === 'Space') return 'SPACE';
  if (code === 'Escape') return 'ESC';
  return code;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  save,
  beats,
  initialTab = 'GAMEPLAY',
  inMatch = false,
  onClose,
  onOpenCustomHudEditor,
  onNotify,
}) => {
  const [tab, setTab] = useState<SettingsTabId>(initialTab);
  const [rebindingAction, setRebindingAction] = useState<KeybindActionId | null>(null);
  const [gamepadName, setGamepadName] = useState<string | null>(null);
  const [gamertagDraft, setGamertagDraft] = useState(save.profile.gamertag);
  const [crewTagDraft, setCrewTagDraft] = useState(save.currencies.crewTag);
  const [jsonText, setJsonText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const modes = useModesStore();
  const allTeams = useMemo(() => RosterStore.getAllTeams(), []);
  const era: UIEraMode = save.uiEraMode;
  const s = save.settings;
  const p = save.profile;

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setGamertagDraft(save.profile.gamertag);
    setCrewTagDraft(save.currencies.crewTag);
  }, [save.profile.gamertag, save.currencies.crewTag]);

  // Live Keyboard Keybind Capture Listener
  useEffect(() => {
    if (!rebindingAction) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape' && rebindingAction !== 'pause') {
        setRebindingAction(null);
        return;
      }
      UltimateHybridStore.updateKeybind(rebindingAction, e.code);
      onNotify?.(`Rebound ${rebindingAction} to ${formatKeyCode(e.code)}`);
      setRebindingAction(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [rebindingAction, onNotify]);

  // Live Gamepad Connection Status Listener
  useEffect(() => {
    const readGamepad = () => {
      try {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < pads.length; i++) {
          const gp = pads[i];
          if (gp && gp.connected) {
            setGamepadName(gp.id);
            return;
          }
        }
        setGamepadName(null);
      } catch {
        setGamepadName(null);
      }
    };
    readGamepad();
    window.addEventListener('gamepadconnected', readGamepad);
    window.addEventListener('gamepaddisconnected', readGamepad);
    const id = window.setInterval(readGamepad, 1500);
    return () => {
      window.removeEventListener('gamepadconnected', readGamepad);
      window.removeEventListener('gamepaddisconnected', readGamepad);
      window.clearInterval(id);
    };
  }, []);

  const updateAudio = (patch: Partial<SettingsState['audio']>) => {
    const next = UltimateHybridStore.updateSettings('audio', patch);
    HybridAudioEngine.applySettings(next.settings.audio);
  };

  const toggleTrack = (trackId: string) => {
    const cur = s.audio.enabledTrackIds;
    const has = cur.includes(trackId);
    if (has && cur.length <= 1) {
      onNotify?.('Keep at least one 2K Beats track enabled.');
      return;
    }
    const nextIds = has ? cur.filter((id) => id !== trackId) : [...cur, trackId];
    updateAudio({ enabledTrackIds: nextIds });
  };

  // Career VIP Averages
  const gp = Math.max(1, p.gamesPlayed);
  const winPct = p.gamesPlayed > 0 ? Math.round((p.wins / p.gamesPlayed) * 100) : 0;
  const fgPct = p.careerFga > 0 ? ((p.careerFgm / p.careerFga) * 100).toFixed(1) : '0.0';
  const tpPct = p.careerTpa > 0 ? ((p.careerThreesMade / p.careerTpa) * 100).toFixed(1) : '0.0';
  const greenPct = p.careerFgm > 0 ? ((p.careerGreens / p.careerFgm) * 100).toFixed(1) : '0.0';

  const eraClass = era === '2K14_CLASSIC' ? 'p7-era-2k14' : 'p7-era-2k26';

  return (
    <div className={`p7-modal-overlay ${eraClass}`} onClick={onClose}>
      <div className="p7-modal-shell" onClick={(e) => e.stopPropagation()}>
        <header className="p7-modal-head">
          <div>
            <div className="p7-kicker">
              {inMatch ? 'In-Match Live Configuration' : 'Unified 2K14 + 2K26 System Suite'}
            </div>
            <h3>Settings, Sliders &amp; Career Profile</h3>
          </div>
          <button type="button" className="p7-btn" onClick={onClose}>
            Close
          </button>
        </header>

        <nav className="p7-tabs-bar" role="tablist" aria-label="Settings categories">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`p7-tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                HybridAudioEngine.playUi('click', era);
                setTab(t.id);
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p7-modal-body">
          {/* ============================================================== */}
          {/* TAB 1: GAMEPLAY & RULES                                        */}
          {/* ============================================================== */}
          {tab === 'GAMEPLAY' && (
            <div className="p7-section-stack">
              <div className="p7-grid-2">
                <label className="p7-field">
                  <span>Difficulty</span>
                  <select
                    className="p7-select"
                    value={s.gameplay.difficulty}
                    onChange={(e) => {
                      const d = e.target.value as MatchDifficulty;
                      UltimateHybridStore.updateSettings('gameplay', { difficulty: d });
                      UltimateHybridStore.updateMatchConfig({ difficulty: d });
                    }}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="p7-field">
                  <span>Quarter Length (Minutes)</span>
                  <select
                    className="p7-select"
                    value={s.gameplay.quarterLengthMin}
                    onChange={(e) => {
                      const q = Number(e.target.value) as QuarterLengthOption;
                      UltimateHybridStore.updateSettings('gameplay', { quarterLengthMin: q });
                      UltimateHybridStore.updateMatchConfig({ quarterLengthMin: q });
                    }}
                  >
                    {QUARTER_LENGTHS.map((q) => (
                      <option key={q} value={q}>
                        {q} Min Quarters
                      </option>
                    ))}
                  </select>
                </label>

                <label className="p7-field">
                  <span>Shot Timing Profile</span>
                  <select
                    className="p7-select"
                    value={s.gameplay.shotTimingProfile}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('gameplay', {
                        shotTimingProfile: e.target.value as SettingsState['gameplay']['shotTimingProfile'],
                      })
                    }
                  >
                    <option value="GREEN_OR_MISS">Green-or-Miss (2K26 Comp)</option>
                    <option value="HIGH_RISK">High Risk-Reward</option>
                    <option value="NORMAL">Normal (Hybrid Rhythm)</option>
                    <option value="LOW_RISK">Low Risk (Forgiving)</option>
                    <option value="REAL_PLAYER_PCT">Real Player % (2K14 Classic)</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>Free Throw Timing</span>
                  <select
                    className="p7-select"
                    value={s.gameplay.freeThrowTiming}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('gameplay', {
                        freeThrowTiming: e.target.value as SettingsState['gameplay']['freeThrowTiming'],
                      })
                    }
                  >
                    <option value="USER_TIMING">User Timing</option>
                    <option value="REAL_PLAYER_PCT">Real Player %</option>
                  </select>
                </label>

                <label className="p7-field p7-col-span-2">
                  <span className="p7-num">Game Speed: {s.gameplay.gameSpeed}</span>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={s.gameplay.gameSpeed}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      UltimateHybridStore.updateSettings('gameplay', { gameSpeed: val });
                      UltimateHybridStore.updateSlider('user', 'gameSpeed', val);
                      UltimateHybridStore.updateSlider('cpu', 'gameSpeed', val);
                    }}
                  />
                </label>
              </div>

              <div className="p7-card">
                <h4 className="p7-subhead">Official NBA Rules &amp; Simulation Toggles</h4>
                <div className="p7-check-grid">
                  {(
                    [
                      ['layupTiming', 'User Layup Timing'],
                      ['fatigue', 'Player Fatigue & Stamina Drain'],
                      ['injuries', 'Realistic Injuries'],
                      ['outOfBounds', 'Out of Bounds Calls'],
                      ['eightSecBackcourt', '8-Second Backcourt Violation'],
                      ['shotClock24', '24-Second Shot Clock'],
                      ['reachInFouls', 'Reach-In & Shooting Fouls'],
                      ['paintThreeSecViolation', '3-Second Paint Key Violation'],
                    ] as Array<[keyof SettingsState['gameplay'], string]>
                  ).map(([key, label]) => (
                    <label key={key} className="p7-check">
                      <input
                        type="checkbox"
                        checked={Boolean(s.gameplay[key])}
                        onChange={(e) =>
                          UltimateHybridStore.updateSettings('gameplay', {
                            [key]: e.target.checked,
                          })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CONTROLLER, SHOT METER & TOUCH HUD                      */}
          {/* ============================================================== */}
          {tab === 'CONTROLLER' && (
            <div className="p7-section-stack">
              <div className="p7-card p7-hud-cta-banner">
                <div>
                  <strong>Live Drag-and-Drop Custom Touch HUD Editor</strong>
                  <p className="p7-muted">
                    Move, scale (50%–150%), and fade all 14 touch pads directly over the 3D court or apply Classic 2K, Claw Pro, and One-Hand presets.
                  </p>
                </div>
                <button
                  type="button"
                  className="p7-btn primary"
                  onClick={() => {
                    HybridAudioEngine.playUi('confirm', era);
                    onOpenCustomHudEditor();
                  }}
                >
                  Open Custom Touch HUD Editor
                </button>
              </div>

              <div className="p7-grid-2">
                <label className="p7-check p7-field">
                  <input
                    type="checkbox"
                    checked={s.controller.shotMeterEnabled}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        shotMeterEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>
                    Shot Meter {s.controller.shotMeterEnabled ? 'ON' : 'OFF (+15% Green Boost Active)'}
                  </span>
                </label>

                <label className="p7-field">
                  <span>Shot Meter Style</span>
                  <select
                    className="p7-select"
                    value={s.controller.shotMeterStyle}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        shotMeterStyle: e.target.value as ShotMeterStyleId,
                      })
                    }
                  >
                    {SHOT_METER_STYLES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="p7-field">
                  <span>Shot Meter Color</span>
                  <div className="p7-swatch-row">
                    {SHOT_METER_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`p7-swatch-btn ${s.controller.shotMeterColor === c.id ? 'active' : ''}`}
                        onClick={() =>
                          UltimateHybridStore.updateSettings('controller', { shotMeterColor: c.id })
                        }
                      >
                        <span className="p7-swatch-dot" style={{ backgroundColor: c.swatch }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="p7-field">
                  <span>Jumpshot Visual Cue</span>
                  <select
                    className="p7-select"
                    value={s.gameplay.visualCue}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('gameplay', {
                        visualCue: e.target.value as SettingsState['gameplay']['visualCue'],
                      })
                    }
                  >
                    <option value="JUMP">Jump</option>
                    <option value="SET_POINT">Set Point</option>
                    <option value="PUSH">Push</option>
                    <option value="RELEASE">Release</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>Shot Feedback</span>
                  <select
                    className="p7-select"
                    value={s.controller.shotFeedbackMode}
                    onChange={(e) => {
                      const val = e.target.value as ShotFeedbackModeId;
                      UltimateHybridStore.updateSettings('controller', { shotFeedbackMode: val });
                      UltimateHybridStore.updateSettings('visual', { showShotFeedback: val !== 'OFF' });
                    }}
                  >
                    <option value="ALL">All Shots</option>
                    <option value="USER_ONLY">User Only</option>
                    <option value="OFF">Off</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>On-Screen Touch Controls</span>
                  <select
                    className="p7-select"
                    value={s.controller.showVirtualTouchControls}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        showVirtualTouchControls: e.target.value as TouchControlsVisibility,
                      })
                    }
                  >
                    <option value="AUTO">Auto (Touch Devices)</option>
                    <option value="ALWAYS">Always On (Desktop &amp; Mobile)</option>
                    <option value="OFF">Off</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span className="p7-num">Defensive Assist: {s.controller.defensiveAssist}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.controller.defensiveAssist}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        defensiveAssist: Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label className="p7-field">
                  <span className="p7-num">Boxout Assist: {s.controller.boxoutAssist}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.controller.boxoutAssist}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        boxoutAssist: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <div className="p7-check-grid">
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.controller.rhythmShootingEnabled}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        rhythmShootingEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>2K26 Rhythm Shooting Enabled</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.controller.whoToGuardArrow}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        whoToGuardArrow: e.target.checked,
                      })
                    }
                  />
                  <span>Who-To-Guard Floor Arrow</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.controller.iconPassingEnabled}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('controller', {
                        iconPassingEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>Icon Passing Enabled</span>
                </label>
              </div>

              {/* Gamepad Status + Interactive Keyboard Keybind Remapper */}
              <div className="p7-card">
                <div className="p7-card-head">
                  <div>
                    <h4 className="p7-subhead">Keyboard Keybind Remapper &amp; Gamepad Status</h4>
                    <span className="p7-muted">
                      Gamepad: {gamepadName ? `Connected (${gamepadName})` : 'No controller detected — press any button on USB/Bluetooth pad'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p7-btn"
                    onClick={() => {
                      UltimateHybridStore.resetKeybinds();
                      onNotify?.('Keyboard keybinds reset to defaults.');
                    }}
                  >
                    Reset Default Keys
                  </button>
                </div>

                <div className="p7-keybind-grid">
                  {KEYBIND_LABELS.map((item) => {
                    const listening = rebindingAction === item.id;
                    return (
                      <div key={item.id} className="p7-keybind-row">
                        <span>{item.label}</span>
                        <button
                          type="button"
                          className={`p7-key-btn ${listening ? 'listening' : ''}`}
                          onClick={() => setRebindingAction(listening ? null : item.id)}
                        >
                          {listening ? 'Press Key...' : formatKeyCode(s.controller.keybinds[item.id])}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CAMERA                                                  */}
          {/* ============================================================== */}
          {tab === 'CAMERA' && (
            <div className="p7-section-stack">
              <div className="p7-card">
                <h4 className="p7-subhead">Broadcast &amp; Gameplay Camera Angle</h4>
                <div className="p7-seg" style={{ flexWrap: 'wrap' }}>
                  {CAMERA_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`p7-seg-btn ${s.camera.angle === c.id ? 'active' : ''}`}
                      onClick={() => {
                        UltimateHybridStore.updateSettings('camera', { angle: c.id });
                        HybridAudioEngine.playUi('switch', era);
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p7-grid-2">
                <label className="p7-field">
                  <span className="p7-num">Camera Zoom: {s.camera.zoom} / 10</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={s.camera.zoom}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', { zoom: Number(e.target.value) })
                    }
                  />
                </label>

                <label className="p7-field">
                  <span className="p7-num">Camera Height: {s.camera.height} / 10</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={s.camera.height}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', { height: Number(e.target.value) })
                    }
                  />
                </label>
              </div>

              <div className="p7-check-grid">
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.camera.autoFlip}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', { autoFlip: e.target.checked })
                    }
                  />
                  <span>Auto-Flip Camera on Possession Change</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.camera.keyZoom}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', { keyZoom: e.target.checked })
                    }
                  />
                  <span>Key Zoom on Paint Drives</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.camera.reverseAngle}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', { reverseAngle: e.target.checked })
                    }
                  />
                  <span>Reverse Camera Angle</span>
                </label>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: VISUALS, UI ERA & PRESENTATION                          */}
          {/* ============================================================== */}
          {tab === 'VISUAL' && (
            <div className="p7-section-stack">
              <div className="p7-grid-2">
                <label className="p7-field">
                  <span>Master UI &amp; Era Skin</span>
                  <select
                    className="p7-select"
                    value={save.uiEraMode}
                    onChange={(e) => {
                      const next = e.target.value as UIEraMode;
                      UltimateHybridStore.setEraMode(next);
                      HybridAudioEngine.playUi('switch', next);
                      onNotify?.(`Master Era switched to ${next.replace('_', ' ')}`);
                    }}
                  >
                    <option value="2K14_CLASSIC">NBA 2K14 Classic (Crimson &amp; Gold)</option>
                    <option value="2K26_NEXTGEN">NBA 2K26 Next-Gen (Obsidian &amp; Cyan)</option>
                    <option value="HYBRID_PRO">Hybrid Pro (Dual-Era Adaptive)</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>Scorebug Position</span>
                  <select
                    className="p7-select"
                    value={s.visual.scorebugPosition2K26}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        scorebugPosition2K26: e.target.value as SettingsState['visual']['scorebugPosition2K26'],
                      })
                    }
                  >
                    <option value="BOTTOM_RIGHT">2K14 Bottom-Right</option>
                    <option value="BOTTOM_LEFT">2K26 Bottom-Left</option>
                    <option value="TOP_CENTER">Top Broadcast</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>PlayVision Floor Art</span>
                  <select
                    className="p7-select"
                    value={s.visual.playVisionDensity}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        playVisionDensity: e.target.value as SettingsState['visual']['playVisionDensity'],
                      })
                    }
                  >
                    <option value="FULL">Full PlayVision Art</option>
                    <option value="LITE">Lite Floor Arrows</option>
                    <option value="OFF">Off</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>On-Court Hot / Cold Zones</span>
                  <select
                    className="p7-select"
                    value={s.visual.hotColdZones}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        hotColdZones: e.target.value as SettingsState['visual']['hotColdZones'],
                      })
                    }
                  >
                    <option value="ALL">Always Visible</option>
                    <option value="BALL_HANDLER">On Catch (Ball Handler)</option>
                    <option value="OFF">Off</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>Graphics Quality</span>
                  <select
                    className="p7-select"
                    value={s.visual.graphicsQuality}
                    onChange={(e) => {
                      const q = e.target.value as SettingsState['visual']['graphicsQuality'];
                      UltimateHybridStore.updateSettings('visual', {
                        graphicsQuality: q,
                        cinema3DQuality: q === 'LOW' || q === 'MEDIUM' ? 'BALANCED' : 'HIGH',
                      });
                    }}
                  >
                    <option value="LOW">Low (Max Battery / Legacy Mobile)</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="ULTRA">Ultra (Maximum PBR Detail)</option>
                  </select>
                </label>

                <label className="p7-field">
                  <span>Crowd Density</span>
                  <select
                    className="p7-select"
                    value={s.visual.crowdDensity}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        crowdDensity: e.target.value as SettingsState['visual']['crowdDensity'],
                      })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>

              <div className="p7-check-grid">
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.visual.hardwoodReflections}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        hardwoodReflections: e.target.checked,
                      })
                    }
                  />
                  <span>2K14 Glossy Hardwood Reflections</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.camera.dunkCameraShake}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('camera', {
                        dunkCameraShake: e.target.checked,
                      })
                    }
                  />
                  <span>Contact Dunk Camera Shake</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.visual.showFpsTelemetry}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('visual', {
                        showFpsTelemetry: e.target.checked,
                      })
                    }
                  />
                  <span>FPS &amp; Frame-Time Telemetry</span>
                </label>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: AUDIO & 2K BEATS                                        */}
          {/* ============================================================== */}
          {tab === 'AUDIO' && (
            <div className="p7-section-stack">
              <div className="p7-grid-2">
                {(
                  [
                    ['masterVolume', 'Master Volume'],
                    ['crowdVolume', 'Arena Crowd Volume'],
                    ['sfxVolume', 'On-Court SFX Volume'],
                    ['commentaryVolume', 'PA Announcer / Commentary'],
                    ['musicVolume', '2K Beats Music Volume'],
                  ] as Array<[keyof SettingsState['audio'], string]>
                ).map(([key, label]) => (
                  <label key={key} className="p7-field">
                    <span className="p7-num">
                      {label}: {Number(s.audio[key])}%
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Number(s.audio[key])}
                      onChange={(e) => updateAudio({ [key]: Number(e.target.value) })}
                    />
                  </label>
                ))}
              </div>

              <div className="p7-card">
                <div className="p7-card-head">
                  <div>
                    <h4 className="p7-subhead">2K Beats Procedural Soundtrack</h4>
                    <span className="p7-muted">
                      Now Playing: {beats.currentTrack.title} · {beats.currentTrack.artist} ({beats.currentTrack.bpm} BPM)
                    </span>
                  </div>
                  <div className="p7-seg">
                    <button
                      type="button"
                      className="p7-seg-btn"
                      onClick={() => HybridAudioEngine.prevTrack()}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="p7-seg-btn active"
                      onClick={() => HybridAudioEngine.togglePlay()}
                    >
                      {beats.isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button
                      type="button"
                      className="p7-seg-btn"
                      onClick={() => HybridAudioEngine.nextTrack()}
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      className={`p7-seg-btn ${s.audio.beatsShuffle ? 'active' : ''}`}
                      onClick={() => updateAudio({ beatsShuffle: !s.audio.beatsShuffle })}
                    >
                      Shuffle: {s.audio.beatsShuffle ? 'On' : 'Off'}
                    </button>
                  </div>
                </div>

                <div className="p7-track-list">
                  {HYBRID_2K_BEATS_TRACKS.map((tr) => {
                    const enabled = s.audio.enabledTrackIds.includes(tr.id);
                    const isCurrent = beats.currentTrack.id === tr.id;
                    return (
                      <div key={tr.id} className={`p7-track-row ${isCurrent ? 'current' : ''}`}>
                        <label className="p7-check">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleTrack(tr.id)}
                          />
                          <span>
                            <strong>{tr.title}</strong> · {tr.artist} · {tr.eraTag} · {tr.durationLabel}
                          </span>
                        </label>
                        <button
                          type="button"
                          className="p7-btn"
                          onClick={() => HybridAudioEngine.selectTrack(tr.id)}
                        >
                          {isCurrent && beats.isPlaying ? 'Playing' : 'Play'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: GAMEPLAY SLIDERS (USER & CPU 0–100)                     */}
          {/* ============================================================== */}
          {tab === 'COACH' && (
            <div className="p7-section-stack">
              <div className="p7-card">
                <div className="p7-card-head">
                  <div>
                    <h4 className="p7-subhead">Dual User &amp; CPU Gameplay Sliders (0–100)</h4>
                    <span className="p7-muted">
                      Active Preset: {s.coach.sliders.activePreset.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="p7-preset-row">
                    {(
                      [
                        ['HYBRID_PRO_BALANCED', 'Hybrid Pro 50/50'],
                        ['2K14_CLASSIC_SIM', '2K14 Classic Sim'],
                        ['2K26_COMP', '2K26 Comp'],
                        ['ARCADE_HIGH_SCORING', 'Arcade High-Scoring'],
                      ] as Array<[Exclude<SliderPresetId, 'CUSTOM'>, string]>
                    ).map(([pid, label]) => (
                      <button
                        key={pid}
                        type="button"
                        className={`p7-btn ${s.coach.sliders.activePreset === pid ? 'primary' : ''}`}
                        onClick={() => {
                          UltimateHybridStore.applySliderPreset(pid);
                          onNotify?.(`Applied ${label} sliders!`);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="p7-btn"
                      onClick={() => {
                        UltimateHybridStore.saveCustomSliderPreset();
                        onNotify?.('Saved Custom Slider Preset!');
                      }}
                    >
                      Save Custom Preset
                    </button>
                    {s.coach.sliders.customPreset && (
                      <button
                        type="button"
                        className="p7-btn"
                        onClick={() => {
                          UltimateHybridStore.applySliderPreset('CUSTOM');
                          onNotify?.('Loaded Custom Slider Preset!');
                        }}
                      >
                        Load Custom
                      </button>
                    )}
                  </div>
                </div>

                <div className="p7-slider-matrix">
                  <div className="p7-slider-matrix-head">
                    <span>Gameplay Attribute</span>
                    <span>USER (0–100)</span>
                    <span>CPU (0–100)</span>
                  </div>
                  {GAMEPLAY_SLIDER_META.map((row) => {
                    const uVal = s.coach.sliders.user[row.key];
                    const cVal = s.coach.sliders.cpu[row.key];
                    return (
                      <div key={row.key} className="p7-slider-matrix-row">
                        <span className="p7-slider-name">{row.label}</span>
                        <div className="p7-slider-cell">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={uVal}
                            aria-label={`User ${row.label}`}
                            onChange={(e) =>
                              UltimateHybridStore.updateSlider('user', row.key as GameplaySliderKey, Number(e.target.value))
                            }
                          />
                          <strong className="p7-num">{uVal}</strong>
                        </div>
                        <div className="p7-slider-cell">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={cVal}
                            aria-label={`CPU ${row.label}`}
                            onChange={(e) =>
                              UltimateHybridStore.updateSlider('cpu', row.key as GameplaySliderKey, Number(e.target.value))
                            }
                          />
                          <strong className="p7-num">{cVal}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p7-check-grid">
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.coach.aceAdaptiveCoaching}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('coach', {
                        aceAdaptiveCoaching: e.target.checked,
                      })
                    }
                  />
                  <span>ACE Adaptive Coaching Engine</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.coach.autoTimeouts}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('coach', { autoTimeouts: e.target.checked })
                    }
                  />
                  <span>Auto Coach Timeouts</span>
                </label>
                <label className="p7-check">
                  <input
                    type="checkbox"
                    checked={s.coach.autoSubstitutions}
                    onChange={(e) =>
                      UltimateHybridStore.updateSettings('coach', {
                        autoSubstitutions: e.target.checked,
                      })
                    }
                  />
                  <span>Auto Bench Substitutions</span>
                </label>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: DUAL-FORMAT PROFILE + CAREER SHOT CHART + SAVE DATA     */}
          {/* ============================================================== */}
          {tab === 'DATA' && (
            <div className="p7-section-stack">
              {/* Identity Editor */}
              <div className="p7-card">
                <h4 className="p7-subhead">My Profile.USR &amp; 2K26 Player Identity</h4>
                <div className="p7-grid-3">
                  <label className="p7-field">
                    <span>Gamertag</span>
                    <div className="p7-inline-input">
                      <input
                        className="p7-input"
                        value={gamertagDraft}
                        maxLength={20}
                        onChange={(e) => setGamertagDraft(e.target.value)}
                      />
                      <button
                        type="button"
                        className="p7-btn primary"
                        onClick={() => {
                          UltimateHybridStore.updateProfile({
                            gamertag: gamertagDraft.trim() || 'KING_2K26',
                          });
                          onNotify?.('Gamertag saved!');
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </label>

                  <label className="p7-field">
                    <span>Favorite Team (72 Teams)</span>
                    <select
                      className="p7-select"
                      value={p.favoriteTeamId}
                      onChange={(e) => {
                        UltimateHybridStore.updateProfile({ favoriteTeamId: e.target.value });
                        onNotify?.('Favorite team updated!');
                      }}
                    >
                      {allTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.era}] {t.city} {t.name} ({t.ovr})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="p7-field">
                    <span>Crew Tag</span>
                    <div className="p7-inline-input">
                      <input
                        className="p7-input"
                        value={crewTagDraft}
                        maxLength={6}
                        onChange={(e) => setCrewTagDraft(e.target.value.toUpperCase())}
                      />
                      <button
                        type="button"
                        className="p7-btn primary"
                        onClick={() => {
                          UltimateHybridStore.updateCrewTag(crewTagDraft.trim() || '2KHYB');
                          onNotify?.('Crew tag saved!');
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dual-Format Profile Dashboards */}
              <div className="p7-grid-2">
                {/* Classic 2K14 VIP Stats Grid */}
                <div className="p7-card">
                  <h4 className="p7-subhead">NBA 2K14 Classic VIP Stats</h4>
                  <div className="p7-vip-grid p7-num">
                    <div><span>Games Played</span><strong>{p.gamesPlayed}</strong></div>
                    <div><span>Record (W-L)</span><strong>{p.wins}-{p.losses}</strong></div>
                    <div><span>Win %</span><strong>{winPct}%</strong></div>
                    <div><span>PPG</span><strong>{(p.careerPoints / gp).toFixed(1)}</strong></div>
                    <div><span>APG</span><strong>{(p.careerAssists / gp).toFixed(1)}</strong></div>
                    <div><span>RPG</span><strong>{(p.careerRebounds / gp).toFixed(1)}</strong></div>
                    <div><span>SPG</span><strong>{(p.careerSteals / gp).toFixed(1)}</strong></div>
                    <div><span>BPG</span><strong>{(p.careerBlocks / gp).toFixed(1)}</strong></div>
                    <div><span>FG%</span><strong>{fgPct}%</strong></div>
                    <div><span>3P%</span><strong>{tpPct}%</strong></div>
                    <div><span>Green Release %</span><strong>{greenPct}%</strong></div>
                    <div><span>Best Win Streak</span><strong>{p.bestWinStreak}W</strong></div>
                  </div>
                </div>

                {/* 2K26 Next-Gen Player Card */}
                <div className="p7-card">
                  <h4 className="p7-subhead">NBA 2K26 Next-Gen Player Card</h4>
                  <div className="p7-player-card-meta">
                    <span>Geo Rank: <strong>{p.geoRank}</strong></span>
                    <span>Crew: <strong>[{save.currencies.crewTag}] {save.currencies.crewName} (Lv. {save.currencies.crewLevel})</strong></span>
                  </div>

                  <div className="p7-xp-block">
                    <div className="p7-xp-head p7-num">
                      <span>Rep Tier · {save.currencies.repTier}</span>
                      <strong>{save.currencies.repXP.toLocaleString()} REP</strong>
                    </div>
                    <div className="p7-xp-bar">
                      <div
                        className="p7-xp-fill gold"
                        style={{ width: `${Math.min(100, (save.currencies.repXP % 1000) / 10)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p7-xp-block">
                    <div className="p7-xp-head p7-num">
                      <span>Season Level {save.currencies.seasonLevel} / 40</span>
                      <strong>{save.currencies.seasonXP.toLocaleString()} XP</strong>
                    </div>
                    <div className="p7-xp-bar">
                      <div
                        className="p7-xp-fill cyan"
                        style={{ width: `${Math.min(100, (save.currencies.seasonLevel / 40) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p7-builds-summary">
                    <span className="p7-muted">5 MyPLAYER Build Slots:</span>
                    <div className="p7-builds-list">
                      {modes.buildSlots.map((b) => (
                        <span key={b.id} className="p7-num">
                          #{b.slotIndex + 1} {b.name} ({b.position})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trophies & Achievements */}
              <div className="p7-card">
                <h4 className="p7-subhead">
                  Trophies &amp; Achievements ({p.unlockedAchievements.length}/{ACHIEVEMENT_CATALOG.length})
                </h4>
                <div className="p7-ach-grid">
                  {ACHIEVEMENT_CATALOG.map((ach) => {
                    const unlocked = p.unlockedAchievements.includes(ach.id);
                    return (
                      <div key={ach.id} className={`p7-ach-row ${unlocked ? 'unlocked' : ''}`}>
                        <div>
                          <strong>{ach.title}</strong> · <span className="p7-muted">{ach.eraTag}</span>
                          <div className="p7-muted">{ach.description}</div>
                        </div>
                        <strong style={{ color: unlocked ? '#4ade80' : '#64748b' }}>
                          {unlocked ? 'Unlocked' : 'Locked'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Half-Court Career Shot Chart */}
              <div className="p7-card">
                <ShotChartCanvas
                  shots={p.shotChartHistory}
                  title="Career Half-Court Shot Chart"
                />
              </div>

              {/* Save Data JSON Export / Import / Guarded Reset */}
              <div className="p7-card">
                <h4 className="p7-subhead">Save Data Management</h4>
                <div className="p7-preset-row" style={{ marginBottom: 10 }}>
                  <button
                    type="button"
                    className="p7-btn primary"
                    onClick={() => {
                      const exported = UltimateHybridStore.exportSaveJson();
                      setJsonText(exported);
                      try {
                        navigator.clipboard?.writeText(exported);
                      } catch {
                        // Clipboard optional
                      }
                      onNotify?.('Exported Save JSON below!');
                    }}
                  >
                    Export Save JSON
                  </button>
                  <button
                    type="button"
                    className="p7-btn"
                    onClick={() => {
                      const res = UltimateHybridStore.importSaveJson(jsonText);
                      onNotify?.(res.ok ? 'Save JSON imported successfully!' : res.error || 'Invalid JSON');
                    }}
                  >
                    Import Save JSON
                  </button>
                  {!confirmReset ? (
                    <button
                      type="button"
                      className="p7-btn danger"
                      onClick={() => setConfirmReset(true)}
                    >
                      Reset Career Data
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="p7-btn danger"
                        onClick={() => {
                          UltimateHybridStore.resetSave();
                          setConfirmReset(false);
                          onNotify?.('Career data reset to defaults.');
                        }}
                      >
                        Confirm Full Reset
                      </button>
                      <button
                        type="button"
                        className="p7-btn"
                        onClick={() => setConfirmReset(false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <textarea
                  className="p7-textarea"
                  rows={4}
                  placeholder="Click Export Save JSON to inspect backup, or paste a saved JSON string here and click Import Save JSON."
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
