import React, { useEffect, useState } from 'react';
import {
  HYBRID_2K_BEATS_TRACKS,
  HybridAudioEngine,
  type HybridBeatsSnapshot,
} from './audioEngine';
import { UltimateHybridStore } from './store';
import type {
  ActiveScreen,
  SettingsTabId,
  UIEraMode,
  UltimateHybridSave,
} from './types';
import {
  computeOverallFromAttributes,
  getActiveMyPlayer,
} from '../hoops2k26Catalog';
import { persistHoops2K26, playerState } from '../../../core/storage';
import { ModesStore, useModesStore } from '../modes/modesStore';

export type QuickDrawerKind =
  | null
  | 'SETTINGS'
  | 'PROFILE_VIP'
  | 'BEATS_JUKEBOX'
  | 'SWAP_BUILD'
  | 'CREW';

export interface HybridModalsProps {
  save: UltimateHybridSave;
  drawer: QuickDrawerKind;
  beats: HybridBeatsSnapshot;
  initialSettingsTab?: SettingsTabId;
  onClose: () => void;
  onNotify: (msg: string) => void;
  onOpenCity3D: () => void;
  onOpenClassicStudio: () => void;
}

const SETTINGS_TABS: Array<{ id: SettingsTabId; label: string }> = [
  { id: 'GAMEPLAY', label: 'Gameplay' },
  { id: 'CONTROLLER', label: 'Controller / ProPLAY' },
  { id: 'CAMERA', label: 'Camera' },
  { id: 'AUDIO', label: 'Audio / 2K Beats' },
  { id: 'VISUAL', label: 'Visual / HUD' },
  { id: 'COACH', label: 'Coach / Sliders' },
  { id: 'DATA', label: 'Data / Save JSON' },
];

export const HybridModals: React.FC<HybridModalsProps> = ({
  save,
  drawer,
  beats,
  initialSettingsTab,
  onClose,
  onNotify,
  onOpenCity3D,
  onOpenClassicStudio,
}) => {
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>(initialSettingsTab ?? 'GAMEPLAY');
  const [jsonBox, setJsonBox] = useState('');
  const [tagDraft, setTagDraft] = useState(save.profile.gamertag);
  const modes = useModesStore();

  useEffect(() => {
    if (drawer === 'SETTINGS' && initialSettingsTab) {
      setSettingsTab(initialSettingsTab);
    }
  }, [drawer, initialSettingsTab]);

  if (!drawer) return null;

  const era = save.uiEraMode;

  const syncAudioToEngine = (nextAudio: UltimateHybridSave['settings']['audio']) => {
    UltimateHybridStore.updateSettings('audio', nextAudio);
    HybridAudioEngine.applySettings(nextAudio);
  };

  return (
    <div className="h2k-modal-overlay" onClick={onClose}>
      <div className="h2k-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* ============================================================ */}
        {/* 7-TAB SETTINGS MODAL                                         */}
        {/* ============================================================ */}
        {drawer === 'SETTINGS' && (
          <>
            <header className="h2k-modal-head">
              <div>
                <div className="h2k-kicker">UNIFIED 2K14 + 2K26 CONFIGURATION</div>
                <h3>7-TAB SETTINGS & SYSTEM</h3>
              </div>
              <button type="button" className="h2k-close-btn" onClick={onClose}>
                ✕
              </button>
            </header>

            <div className="h2k-modal-tabs">
              {SETTINGS_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`h2k-modal-tab ${settingsTab === t.id ? 'active' : ''}`}
                  onClick={() => {
                    HybridAudioEngine.playUi('click', era);
                    setSettingsTab(t.id);
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="h2k-modal-body">
              {settingsTab === 'GAMEPLAY' && (
                <div className="h2k-form-grid">
                  <label className="h2k-form-row">
                    <span>Difficulty Preset</span>
                    <select
                      className="h2k-select"
                      value={save.settings.gameplay.difficulty}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          difficulty: e.target.value as UltimateHybridSave['settings']['gameplay']['difficulty'],
                        })
                      }
                    >
                      {['Rookie', 'Pro', 'All-Star', 'Superstar', 'Hall of Fame'].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Shooting Model</span>
                    <select
                      className="h2k-select"
                      value={save.settings.gameplay.shootingModel}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          shootingModel: e.target.value as UltimateHybridSave['settings']['gameplay']['shootingModel'],
                        })
                      }
                    >
                      <option value="HYBRID_RHYTHM">Hybrid Pro Rhythm + Timing</option>
                      <option value="TIMING_2K26">2K26 Green-or-Miss Timing</option>
                      <option value="REAL_FG_2K14">2K14 Real Player FG%</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Shot Timing Profile (2K26 ProPLAY)</span>
                    <select
                      className="h2k-select"
                      value={save.settings.gameplay.shotTimingProfile}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          shotTimingProfile: e.target.value as UltimateHybridSave['settings']['gameplay']['shotTimingProfile'],
                        })
                      }
                    >
                      <option value="NORMAL">Normal / Hybrid Rhythm (Balanced)</option>
                      <option value="HIGH_RISK">High-Risk Reward (Wide Green, Tight Miss)</option>
                      <option value="GREEN_OR_MISS">Green-or-Miss (Pure Skill Timing)</option>
                      <option value="LOW_RISK">Low-Risk Forgiving (Rating-Assisted)</option>
                      <option value="REAL_PLAYER_PCT">Real Player % (2K14 Ratings Only)</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Jumpshot Visual Cue</span>
                    <select
                      className="h2k-select"
                      value={save.settings.gameplay.visualCue}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          visualCue: e.target.value as UltimateHybridSave['settings']['gameplay']['visualCue'],
                        })
                      }
                    >
                      <option value="JUMP">Jump (Early Lift-Off Cue)</option>
                      <option value="SET_POINT">Set Point (Forehead Set · Default)</option>
                      <option value="PUSH">Push (Forward Arm Extension)</option>
                      <option value="RELEASE">Release (Wrist Flick Peak)</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Blacktop Scoring Mode</span>
                    <select
                      className="h2k-select"
                      value={save.settings.gameplay.blacktopScoring}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          blacktopScoring: e.target.value as UltimateHybridSave['settings']['gameplay']['blacktopScoring'],
                        })
                      }
                    >
                      <option value="1S_2S">1s &amp; 2s (Authentic Streetball)</option>
                      <option value="2S_3S">2s &amp; 3s (Pro Regulation Scoring)</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Game Speed ({save.settings.gameplay.gameSpeed})</span>
                    <input
                      type="range"
                      min={40}
                      max={70}
                      value={save.settings.gameplay.gameSpeed}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          gameSpeed: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.gameplay.fatigue}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', { fatigue: e.target.checked })
                      }
                    />
                    <span>Enable Player Fatigue &amp; Gatorade Stamina Drain</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.gameplay.paintThreeSecViolation}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          paintThreeSecViolation: e.target.checked,
                        })
                      }
                    />
                    <span>Enforce 3-Second Offensive Paint Violation</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.gameplay.blacktopWinByTwo}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          blacktopWinByTwo: e.target.checked,
                        })
                      }
                    />
                    <span>Blacktop Win-By-2 Rule</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.gameplay.blacktopMakeItTakeIt}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('gameplay', {
                          blacktopMakeItTakeIt: e.target.checked,
                        })
                      }
                    />
                    <span>Blacktop Make-It-Take-It Possession</span>
                  </label>
                </div>
              )}

              {settingsTab === 'CONTROLLER' && (
                <div className="h2k-form-grid">
                  <label className="h2k-form-row">
                    <span>Pro Stick Function</span>
                    <select
                      className="h2k-select"
                      value={save.settings.controller.proStickMode}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('controller', {
                          proStickMode: e.target.value as UltimateHybridSave['settings']['controller']['proStickMode'],
                        })
                      }
                    >
                      <option value="RHYTHM_2K26">2K26 ProPLAY Rhythm Shooting</option>
                      <option value="ISOMOTION_2K14">2K14 Pro Stick IsoMotion</option>
                      <option value="DEFAULT">Balanced Default</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Shot Meter Style (All 5 Authentic Styles)</span>
                    <select
                      className="h2k-select"
                      value={save.settings.controller.shotMeterStyle}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('controller', {
                          shotMeterStyle: e.target.value as UltimateHybridSave['settings']['controller']['shotMeterStyle'],
                        })
                      }
                    >
                      <option value="2K26_ARROW">2K26 Curved Arrow (Beside Shooter · Default)</option>
                      <option value="2K14_FLOOR_RING">2K14 Classic Floor Ring (Under Feet)</option>
                      <option value="COMET">Comet Sweeping Arc</option>
                      <option value="VERTICAL_BAR">Vertical Side Bar</option>
                      <option value="MINIMAL">Minimal Competitive Micro-Bar</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Virtual Dual-Stick Touch Controls</span>
                    <select
                      className="h2k-select"
                      value={save.settings.controller.showVirtualTouchControls}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('controller', {
                          showVirtualTouchControls: e.target.value as UltimateHybridSave['settings']['controller']['showVirtualTouchControls'],
                        })
                      }
                    >
                      <option value="AUTO">Auto on Touchscreens + HUD Toggle</option>
                      <option value="ALWAYS">Always Show (Desktop + Mobile)</option>
                      <option value="OFF">Hidden (Keyboard / Gamepad Only)</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Defensive Assist ({save.settings.controller.defensiveAssist}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={save.settings.controller.defensiveAssist}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('controller', {
                          defensiveAssist: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.controller.shotMeterEnabled}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('controller', {
                          shotMeterEnabled: e.target.checked,
                        })
                      }
                    />
                    <span>Show On-Court Shot Meter (+15% Green Window Boost when OFF)</span>
                  </label>
                </div>
              )}

              {settingsTab === 'CAMERA' && (
                <div className="h2k-form-grid">
                  <label className="h2k-form-row">
                    <span>Camera Angle (All 7 Authentic 2K Angles)</span>
                    <select
                      className="h2k-select"
                      value={save.settings.camera.angle}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', {
                          angle: e.target.value as UltimateHybridSave['settings']['camera']['angle'],
                        })
                      }
                    >
                      <option value="2K">2K Camera (Behind Offense · Vertical)</option>
                      <option value="2K_LOW">2K Low (Court-Level Behind Ball)</option>
                      <option value="BROADCAST">Broadcast TV (Sideline Pan)</option>
                      <option value="DRIVE">Drive Cam (Tight Action Behind Handler)</option>
                      <option value="PLAYER_LOCK">Player Lock (Follows Controlled Star)</option>
                      <option value="HIGH">High Tactical (Wide Coach PlayVision)</option>
                      <option value="NOSEBLEEDS">Nosebleeds (Full Arena &amp; Jumbotron)</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Camera Zoom ({save.settings.camera.zoom}/10)</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={save.settings.camera.zoom}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { zoom: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>Camera Height ({save.settings.camera.height}/10)</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={save.settings.camera.height}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { height: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.camera.autoFlip}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { autoFlip: e.target.checked })
                      }
                    />
                    <span>Auto-Flip 180° Camera on Possession Change</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.camera.keyZoom}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { keyZoom: e.target.checked })
                      }
                    />
                    <span>Key Zoom (Tighten FOV Inside the Painted Lane)</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.camera.reverseAngle}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { reverseAngle: e.target.checked })
                      }
                    />
                    <span>Reverse Camera Angle</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.camera.dunkCameraShake}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('camera', { dunkCameraShake: e.target.checked })
                      }
                    />
                    <span>Contact Dunk Camera Shake Impulse</span>
                  </label>
                </div>
              )}

              {settingsTab === 'AUDIO' && (
                <div className="h2k-form-grid">
                  {(
                    [
                      ['masterVolume', 'Master Volume'],
                      ['musicVolume', '2K Beats Music'],
                      ['sfxVolume', 'On-Court & UI SFX'],
                      ['crowdVolume', 'Arena Crowd'],
                      ['commentaryVolume', 'PA Announcer Voice'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="h2k-form-row">
                      <span>
                        {label} ({save.settings.audio[key]}%)
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={save.settings.audio[key]}
                        onChange={(e) =>
                          syncAudioToEngine({
                            ...save.settings.audio,
                            [key]: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  ))}

                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.audio.paAnnouncerEnabled}
                      onChange={(e) =>
                        syncAudioToEngine({
                          ...save.settings.audio,
                          paAnnouncerEnabled: e.target.checked,
                        })
                      }
                    />
                    <span>Enable Procedural Web Speech PA Announcer</span>
                  </label>

                  <div className="h2k-sfx-pad">
                    <span>LIVE PROCEDURAL SFX TEST PAD:</span>
                    <div className="h2k-sfx-btn-row">
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playDribble()}>
                        Dribble
                      </button>
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playSneakerSqueak()}>
                        Squeak
                      </button>
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playSwish(false)}>
                        Swish
                      </button>
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playGreenRelease()}>
                        Green Light
                      </button>
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playDunkSlam()}>
                        Dunk Slam
                      </button>
                      <button type="button" className="h2k-mini-pill" onClick={() => HybridAudioEngine.playBuzzer()}>
                        Buzzer
                      </button>
                      <button
                        type="button"
                        className="h2k-mini-pill accent"
                        onClick={() => {
                          HybridAudioEngine.playCrowdRoar(0.95);
                          HybridAudioEngine.announce('From downtown! Green light!');
                        }}
                      >
                        PA Call + Crowd
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'VISUAL' && (
                <div className="h2k-form-grid">
                  <label className="h2k-form-row">
                    <span>Active UI Era Theme</span>
                    <select
                      className="h2k-select"
                      value={save.uiEraMode}
                      onChange={(e) => {
                        const next = e.target.value as UIEraMode;
                        UltimateHybridStore.setEraMode(next);
                        HybridAudioEngine.playUi('switch', next);
                      }}
                    >
                      <option value="HYBRID_PRO">Hybrid Pro (2K14 + 2K26 Blend)</option>
                      <option value="2K14_CLASSIC">NBA 2K14 Classic Metallic</option>
                      <option value="2K26_NEXTGEN">NBA 2K26 Next-Gen Obsidian</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>In-Game Scoreboard Style</span>
                    <select
                      className="h2k-select"
                      value={save.settings.visual.scoreboardEra}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          scoreboardEra: e.target.value as UltimateHybridSave['settings']['visual']['scoreboardEra'],
                        })
                      }
                    >
                      <option value="AUTO">Auto Match Active Era</option>
                      <option value="2K14_METALLIC">2K14 Broadcast Metallic (Bottom-Right)</option>
                      <option value="2K26_OBSIDIAN">2K26 Next-Gen Obsidian Bar</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>2K26 Scorebug Anchor Position</span>
                    <select
                      className="h2k-select"
                      value={save.settings.visual.scorebugPosition2K26}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          scorebugPosition2K26: e.target.value as UltimateHybridSave['settings']['visual']['scorebugPosition2K26'],
                        })
                      }
                    >
                      <option value="BOTTOM_LEFT">Bottom-Left (Classic Next-Gen)</option>
                      <option value="TOP_CENTER">Top-Center Broadcast Pill</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>PlayVision 3D Floor Art Default</span>
                    <select
                      className="h2k-select"
                      value={save.settings.visual.playVision}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          playVision: e.target.value as UltimateHybridSave['settings']['visual']['playVision'],
                        })
                      }
                    >
                      <option value="OFF">Off</option>
                      <option value="PICK_AND_ROLL">Pick &amp; Roll (Screen &amp; Dive)</option>
                      <option value="FIVE_OUT">5-Out Spacing</option>
                      <option value="MOTION_CUT">Motion Cut (Backdoor &amp; Wing Cuts)</option>
                      <option value="HORNS">Horns High Post</option>
                      <option value="FLOPPY">Floppy Shooter Curl</option>
                    </select>
                  </label>
                  <label className="h2k-form-row">
                    <span>Hot / Cold Floor Heatmap Overlay</span>
                    <select
                      className="h2k-select"
                      value={save.settings.visual.hotColdZones}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          hotColdZones: e.target.value as UltimateHybridSave['settings']['visual']['hotColdZones'],
                        })
                      }
                    >
                      <option value="OFF">Off</option>
                      <option value="BALL_HANDLER">Active Ball-Handler</option>
                      <option value="ALL">All On-Court Players</option>
                    </select>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.visual.hardwoodReflections}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          hardwoodReflections: e.target.checked,
                        })
                      }
                    />
                    <span>2K14 Glossy Hardwood Specular Reflections</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.visual.showFpsTelemetry}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          showFpsTelemetry: e.target.checked,
                        })
                      }
                    />
                    <span>Display Live FPS Telemetry Bar</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.visual.showShotFeedback}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('visual', {
                          showShotFeedback: e.target.checked,
                        })
                      }
                    />
                    <span>Show Shot Timing &amp; Contest Feedback</span>
                  </label>
                </div>
              )}

              {settingsTab === 'COACH' && (
                <div className="h2k-form-grid">
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={save.settings.coach.aceAdaptiveCoaching}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('coach', {
                          aceAdaptiveCoaching: e.target.checked,
                        })
                      }
                    />
                    <span>ACE Adaptive Coaching Engine</span>
                  </label>
                  <label className="h2k-form-row">
                    <span>User Shot Success Slider ({save.settings.coach.userShotSlider})</span>
                    <input
                      type="range"
                      min={20}
                      max={90}
                      value={save.settings.coach.userShotSlider}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('coach', {
                          userShotSlider: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>CPU Defense Intensity ({save.settings.coach.cpuDefenseSlider})</span>
                    <input
                      type="range"
                      min={20}
                      max={90}
                      value={save.settings.coach.cpuDefenseSlider}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('coach', {
                          cpuDefenseSlider: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>Dunk & Contact Frequency ({save.settings.coach.dunkFrequencySlider})</span>
                    <input
                      type="range"
                      min={20}
                      max={95}
                      value={save.settings.coach.dunkFrequencySlider}
                      onChange={(e) =>
                        UltimateHybridStore.updateSettings('coach', {
                          dunkFrequencySlider: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              )}

              {settingsTab === 'DATA' && (
                <div className="h2k-form-grid">
                  <div className="h2k-data-actions">
                    <button
                      type="button"
                      className="h2k-btn-accent"
                      onClick={() => {
                        const out = UltimateHybridStore.exportSaveJson();
                        setJsonBox(out);
                        if (navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(out).catch(() => {});
                        }
                        onNotify('Save JSON exported to box & clipboard!');
                      }}
                    >
                      EXPORT SAVE JSON
                    </button>
                    <button
                      type="button"
                      className="h2k-btn-ghost"
                      onClick={() => {
                        const res = UltimateHybridStore.importSaveJson(jsonBox);
                        if (res.ok) {
                          onNotify('Save JSON imported successfully!');
                        } else {
                          onNotify(res.error ?? 'Import failed.');
                        }
                      }}
                    >
                      IMPORT JSON FROM BOX
                    </button>
                    <button
                      type="button"
                      className="h2k-btn-danger"
                      onClick={() => {
                        UltimateHybridStore.resetSave();
                        setJsonBox('');
                        onNotify('Ultimate Hybrid profile reset to factory defaults.');
                      }}
                    >
                      RESET SAVE
                    </button>
                  </div>
                  <textarea
                    className="h2k-json-textarea"
                    rows={8}
                    placeholder="Click EXPORT SAVE JSON to inspect your backup, or paste a saved JSON string and click IMPORT..."
                    value={jsonBox}
                    onChange={(e) => setJsonBox(e.target.value)}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* VIP PROFILE & INTERACTIVE SVG SHOT CHART                     */}
        {/* ============================================================ */}
        {drawer === 'PROFILE_VIP' && (
          <>
            <header className="h2k-modal-head">
              <div>
                <div className="h2k-kicker">2K14 VIP + 2K26 PLAYER CARD</div>
                <h3>{save.profile.gamertag} · CAREER PROFILE & SHOT CHART</h3>
              </div>
              <button type="button" className="h2k-close-btn" onClick={onClose}>
                ✕
              </button>
            </header>

            <div className="h2k-modal-body h2k-vip-grid">
              <div className="h2k-vip-col">
                <div className="h2k-tag-edit-row">
                  <input
                    className="h2k-input"
                    value={tagDraft}
                    maxLength={18}
                    onChange={(e) => setTagDraft(e.target.value)}
                    aria-label="Gamertag"
                  />
                  <button
                    type="button"
                    className="h2k-btn-accent"
                    onClick={() => {
                      UltimateHybridStore.updateProfile({
                        gamertag: tagDraft.trim() || 'KING_2K26',
                      });
                      onNotify('VIP Gamertag saved!');
                    }}
                  >
                    SAVE TAG
                  </button>
                </div>

                <div className="h2k-stat-tiles">
                  <div className="h2k-stat-tile">
                    <span>RECORD</span>
                    <strong>
                      {save.profile.wins}W - {save.profile.losses}L
                    </strong>
                  </div>
                  <div className="h2k-stat-tile">
                    <span>GEO RANK</span>
                    <strong>{save.profile.geoRank || '#14 Local · Top 2%'}</strong>
                  </div>
                  <div className="h2k-stat-tile">
                    <span>WIN STREAK</span>
                    <strong>
                      🔥 {save.profile.winStreak ?? 5} (Best {save.profile.bestWinStreak ?? 11})
                    </strong>
                  </div>
                  <div className="h2k-stat-tile">
                    <span>CAREER PTS</span>
                    <strong>{save.profile.careerPoints}</strong>
                  </div>
                  <div className="h2k-stat-tile">
                    <span>GREENS</span>
                    <strong>{save.profile.careerGreens}</strong>
                  </div>
                  <div className="h2k-stat-tile">
                    <span>3PM</span>
                    <strong>{save.profile.careerThreesMade}</strong>
                  </div>
                </div>

                <div className="h2k-mastery-box">
                  <div className="h2k-mastery-row">
                    <span>NBA 2K14 Classic Mastery</span>
                    <strong>{save.profile.eraMastery2K14}%</strong>
                  </div>
                  <div className="h2k-rating-track">
                    <div
                      className="h2k-rating-fill"
                      style={{ width: `${save.profile.eraMastery2K14}%`, backgroundColor: '#e11d48' }}
                    />
                  </div>
                  <div className="h2k-mastery-row">
                    <span>NBA 2K26 Next-Gen Mastery</span>
                    <strong>{save.profile.eraMastery2K26}%</strong>
                  </div>
                  <div className="h2k-rating-track">
                    <div
                      className="h2k-rating-fill"
                      style={{ width: `${save.profile.eraMastery2K26}%`, backgroundColor: '#f59e0b' }}
                    />
                  </div>
                </div>
              </div>

              {/* Procedural Half-Court SVG Shot Chart */}
              <div className="h2k-vip-col">
                <div className="h2k-kicker">CAREER SHOT CHART ({save.profile.shotChartHistory.length} SHOTS)</div>
                <svg viewBox="0 0 260 220" className="h2k-shotchart-svg" role="img" aria-label="Career Shot Chart">
                  <rect x="4" y="4" width="252" height="212" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="2" />
                  {/* Paint & 3PT Arc */}
                  <rect x="86" y="4" width="88" height="92" fill="rgba(225,29,72,0.18)" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="130" cy="96" r="28" fill="none" stroke="#64748b" strokeWidth="1.5" />
                  <path d="M 24 4 V 66 A 106 106 0 0 0 236 66 V 4" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="130" cy="24" r="6" fill="none" stroke="#f97316" strokeWidth="2.5" />

                  {save.profile.shotChartHistory.map((s) => {
                    const cx = 130 + s.x * 4.4;
                    const cy = 22 + s.y * 4.4;
                    return s.made ? (
                      <circle
                        key={s.id}
                        cx={cx}
                        cy={cy}
                        r="5.5"
                        fill="#22c55e"
                        fillOpacity="0.88"
                        stroke="#052e16"
                        strokeWidth="1.2"
                      />
                    ) : (
                      <g key={s.id} stroke="#f43f5e" strokeWidth="2">
                        <line x1={cx - 4} y1={cy - 4} x2={cx + 4} y2={cy + 4} />
                        <line x1={cx + 4} y1={cy - 4} x2={cx - 4} y2={cy + 4} />
                      </g>
                    );
                  })}
                </svg>
                <div className="h2k-shotchart-legend">
                  <span>● Green = Made</span>
                  <span>✕ Red = Missed</span>
                  <button
                    type="button"
                    className="h2k-mini-pill"
                    onClick={() => {
                      const made = Math.random() > 0.3;
                      UltimateHybridStore.recordShotChart({
                        x: Math.round((Math.random() - 0.5) * 42),
                        y: Math.round(4 + Math.random() * 24),
                        made,
                        isThree: Math.random() > 0.45,
                        era,
                      });
                      if (made) HybridAudioEngine.playGreenRelease();
                      else HybridAudioEngine.playRimClank();
                    }}
                  >
                    + SIM PRACTICE SHOT
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* 2K BEATS 6-TRACK PROCEDURAL JUKEBOX                          */}
        {/* ============================================================ */}
        {drawer === 'BEATS_JUKEBOX' && (
          <>
            <header className="h2k-modal-head">
              <div>
                <div className="h2k-kicker">100% PROCEDURAL WEB AUDIO SYNTH SOUNDTRACK</div>
                <h3>2K BEATS JUKEBOX (2K14 + 2K26)</h3>
              </div>
              <button type="button" className="h2k-close-btn" onClick={onClose}>
                ✕
              </button>
            </header>

            <div className="h2k-modal-body">
              <div className="h2k-beats-now">
                <div>
                  <div className="h2k-kicker">NOW {beats.isPlaying ? 'SPINNING' : 'PAUSED'}</div>
                  <h4>{beats.currentTrack.title}</h4>
                  <span>
                    {beats.currentTrack.artist} · {beats.currentTrack.bpm} BPM · {beats.currentTrack.eraTag}
                  </span>
                </div>
                <div className="h2k-beats-controls">
                  <button type="button" className="h2k-btn-ghost" onClick={() => HybridAudioEngine.prevTrack()}>
                    ⏮
                  </button>
                  <button
                    type="button"
                    className="h2k-btn-accent"
                    onClick={() => HybridAudioEngine.togglePlay()}
                  >
                    {beats.isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
                  </button>
                  <button type="button" className="h2k-btn-ghost" onClick={() => HybridAudioEngine.nextTrack()}>
                    ⏭
                  </button>
                  <button
                    type="button"
                    className={`h2k-btn-ghost ${beats.shuffle ? 'active' : ''}`}
                    onClick={() => {
                      const sh = HybridAudioEngine.toggleShuffle();
                      UltimateHybridStore.updateSettings('audio', { beatsShuffle: sh });
                    }}
                  >
                    🔀 {beats.shuffle ? 'SHUFFLE ON' : 'SHUFFLE'}
                  </button>
                </div>
              </div>

              <div className="h2k-track-list">
                {HYBRID_2K_BEATS_TRACKS.map((tr) => {
                  const isCurrent = beats.currentTrack.id === tr.id;
                  const enabled = beats.enabledTrackIds.includes(tr.id);
                  return (
                    <div key={tr.id} className={`h2k-track-row ${isCurrent ? 'active' : ''}`}>
                      <button
                        type="button"
                        className="h2k-track-play"
                        onClick={() => HybridAudioEngine.selectTrack(tr.id, true)}
                      >
                        {isCurrent && beats.isPlaying ? '❚❚' : '▶'}
                      </button>
                      <div className="h2k-track-meta">
                        <strong>{tr.title}</strong>
                        <span>
                          {tr.artist} · {tr.bpm} BPM · {tr.durationLabel}
                        </span>
                      </div>
                      <span className="h2k-era-chip">{tr.eraTag}</span>
                      <label className="h2k-track-toggle">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => {
                            const nextIds = HybridAudioEngine.toggleTrackEnabled(tr.id);
                            UltimateHybridStore.updateSettings('audio', { enabledTrackIds: nextIds });
                          }}
                        />
                        <span>In Mix</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* SWAP BUILD / MyPLAYER 5-SLOT DRAWER (PART 6 SYNCED)          */}
        {/* ============================================================ */}
        {drawer === 'SWAP_BUILD' && (
          <>
            <header className="h2k-modal-head">
              <div>
                <div className="h2k-kicker">MyPLAYER 5 PERSISTENT BUILD SLOTS</div>
                <h3>⚡ SWAP ACTIVE BUILD</h3>
              </div>
              <button type="button" className="h2k-close-btn" onClick={onClose}>
                ✕
              </button>
            </header>
            <div className="h2k-modal-body">
              <div className="h2k-track-list">
                {modes.buildSlots.map((slot, idx) => {
                  const isActive = idx === modes.activeBuildSlotIndex;
                  return (
                    <div key={slot.id} className={`h2k-track-row ${isActive ? 'active' : ''}`}>
                      <div className="h2k-track-meta">
                        <strong>
                          Slot #{idx + 1}: {slot.name} ({slot.position})
                        </strong>
                        <span>
                          {slot.ovr} OVR · {slot.archetypeName} · {slot.primaryTakeover.replace('_', ' ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={isActive ? 'h2k-btn-ghost' : 'h2k-btn-accent'}
                        onClick={() => {
                          ModesStore.setActiveBuildSlot(idx);
                          HybridAudioEngine.playUi('confirm', era);
                          onNotify(`Active MyPLAYER switched to ${slot.name} (${slot.ovr} OVR)!`);
                        }}
                      >
                        {isActive ? 'ACTIVE ✓' : 'EQUIP BUILD'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="h2k-modal-foot-actions">
                <button
                  type="button"
                  className="h2k-btn-accent"
                  onClick={() => {
                    onClose();
                    UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                  }}
                >
                  🏙️ ENTER THE CITY (2.5D MAP + 3D PLAZA)
                </button>
                <button
                  type="button"
                  className="h2k-btn-ghost"
                  onClick={() => {
                    onClose();
                    UltimateHybridStore.setActiveScreen('MYPLAYER_BUILDER');
                  }}
                >
                  🧬 OPEN MyPLAYER BUILDER (5 SLOTS)
                </button>
              </div>
            </div>
          </>
        )}

        {/* ============================================================ */}
        {/* CREW HUB DRAWER (PART 6 SYNCED)                              */}
        {/* ============================================================ */}
        {drawer === 'CREW' && (
          <>
            <header className="h2k-modal-head">
              <div>
                <div className="h2k-kicker">2K26 NEXT-GEN SQUAD AFFILIATION</div>
                <h3>
                  [{modes.crew.tag}] {modes.crew.name} · LV.{modes.crew.level} / 30
                </h3>
              </div>
              <button type="button" className="h2k-close-btn" onClick={onClose}>
                ✕
              </button>
            </header>
            <div className="h2k-modal-body">
              <div className="h2k-stat-tiles">
                <div className="h2k-stat-tile">
                  <span>ACTIVE REP TIER</span>
                  <strong>{save.currencies.repTier}</strong>
                </div>
                <div className="h2k-stat-tile">
                  <span>CREW ROSTER</span>
                  <strong>{modes.crew.members.length} MEMBERS</strong>
                </div>
                <div className="h2k-stat-tile">
                  <span>PRO-AM RECORD</span>
                  <strong>
                    {modes.crew.proAmRecord.wins}W - {modes.crew.proAmRecord.losses}L
                  </strong>
                </div>
                <div className="h2k-stat-tile">
                  <span>ACTIVE BUILD</span>
                  <strong>
                    {(modes.buildSlots[modes.activeBuildSlotIndex] ?? modes.buildSlots[0]).name}
                  </strong>
                </div>
              </div>
              <div className="h2k-modal-foot-actions">
                <button
                  type="button"
                  className="h2k-btn-accent"
                  onClick={() => {
                    onClose();
                    UltimateHybridStore.setActiveScreen('CITY_EXPLORE');
                  }}
                >
                  🏙️ DEPLOY TO THE CITY &amp; CREWS HQ
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export interface ModeHubPlaceholderProps {
  screen: ActiveScreen;
  eraMode: UIEraMode;
  onBack: () => void;
  onQuickPlaySetup: () => void;
  onOpenCity3D: () => void;
  onOpenClassicStudio: () => void;
}

const MODE_META: Partial<
  Record<
    ActiveScreen,
    {
      kicker: string;
      title: string;
      subtitle: string;
      highlights: string[];
      ctaLabel: string;
      action: 'city' | 'playnow' | 'studio';
    }
  >
> = {
  MYCAREER_HUB: {
    kicker: '2K26 NEXT-GEN + 2K14 ROOKIE STORY',
    title: 'MyCAREER & THE CITY HUB',
    subtitle:
      'Step into the walkable 3D City, hit Sunset Park & The REC, upgrade attributes, or enter the MyPLAYER Builder.',
    highlights: [
      'Walkable 3D City with Skateboard, Fast-Travel Map & Live Arena Rings',
      '40 Canonical Badges + Build-By-Badges Solver & Custom Jump Shot Studio',
      '6-Ladder Progression: OVR, REP, Crew Lv.30, Skill Plate, Specialization & Season',
    ],
    ctaLabel: 'ENTER WALKABLE 3D CITY',
    action: 'city',
  },
  PATH_TO_GREATNESS: {
    kicker: 'NBA 2K14 SIGNATURE CAMPAIGN',
    title: 'LeBRON: PATH TO GREATNESS',
    subtitle:
      'Relive the iconic 2013-14 branching dynasty — Heat Dynasty vs Fantastic Journey — straight onto the 3D hardwood.',
    highlights: [
      'Miami Heat (#6 LeBron, Wade, Bosh, Ray Allen) ready in 2013-14 Pool',
      'Authentic 2K14 Finals Arena Spotlight presentation & Signature Skills',
      'Part 5 expands full branching narrative chapters & clutch moments',
    ],
    ctaLabel: 'LAUNCH 2K14 HEAT SHOWCASE MATCHUP',
    action: 'playnow',
  },
  MYTEAM_HUB: {
    kicker: 'CARD COLLECTING & TRIPLE THREAT',
    title: 'MyTEAM ULTIMATE HYBRID',
    subtitle:
      'Build cross-era lineups blending 2013-14 Legends, 2025-26 Superstars, and WNBA Icons with MTP rewards.',
    highlights: [
      'Shared MTP Wallet synced across Main Menu challenges and matches',
      'Cross-Era Fantasy Matchups playable immediately in Play Now Setup',
      'Classic 2K26 Pack Market & Lineup Locker available via Creator Studio',
    ],
    ctaLabel: 'OPEN MyTEAM LOCKER & STUDIO',
    action: 'studio',
  },
  MYNBA_HUB: {
    kicker: 'THE ASSOCIATION (2K14) + MyNBA ERAS (2K26)',
    title: 'MyNBA ERAS & FRANCHISE',
    subtitle:
      'Command franchises across Magic/Bird, Jordan, Kobe, LeBron 2K14, Steph, and Modern 2026 Eras.',
    highlights: [
      'All 30 authentic 2013-14 NBA squads + Modern 2025-26 contenders',
      'ACE Adaptive Coaching & customizable Simulation Sliders in Settings',
      'Jump straight into a Franchise Tip-Off or Classic Era Hub',
    ],
    ctaLabel: 'OPEN MyNBA ERAS HUB',
    action: 'studio',
  },
  BLACKTOP_SETUP: {
    kicker: 'STREETBALL 1v1 · 2v2 · 3v3 · 5v5',
    title: 'BLACKTOP & SKYLINE ROOFTOP',
    subtitle:
      'Take 2K14 Legends, EuroLeague stars, or 2K26 superstars to Sunset Park and Skyline Rooftop to 21.',
    highlights: [
      'Instant Blacktop 1v1, 2v2, 3v3, and 5v5 court rules',
      'Chain-net swish audio & Skyline Park golden-hour atmosphere',
      'Configure squads right in Pre-Game Matchup or Classic Blacktop',
    ],
    ctaLabel: 'CONFIGURE ROOFTOP MATCHUP',
    action: 'playnow',
  },
  THE_W_HUB: {
    kicker: 'THE W · WNBA BROADCAST EXPERIENCE',
    title: 'THE W / WNBA ARENA',
    subtitle:
      'Compete with Las Vegas Aces, New York Liberty, Indiana Fever, and Minnesota Lynx in dedicated WNBA venues.',
    highlights: [
      "Full WNBA rosters starring A'ja Wilson, Breanna Stewart, Caitlin Clark & Napheesa Collier",
      'Playable standalone or in Cross-Era Exhibition matchups',
      'Dedicated WNBA Arena floor & broadcast presentation',
    ],
    ctaLabel: 'LAUNCH THE W MATCHUP',
    action: 'playnow',
  },
  LEARN_2K: {
    kicker: '2K14 TRAINING CAMP + 2K26 PROPLAY TUTORIALS',
    title: 'LEARN 2K & SHOT LAB',
    subtitle:
      'Master ProPLAY Rhythm Shooting, 2K14 IsoMotion dribble chains, on-ball clamps, and pick-and-roll reads.',
    highlights: [
      'Controls: WASD/Arrows Move · Space/Hold Shoot (Release on Green!) · E Pass · Shift Sprint · Q/F Steal/Block',
      'Customize Shot Meter style & Shooting Model in 7-Tab Settings',
      'Jump straight onto MyCOURT or Quick Tip-Off to test your timing',
    ],
    ctaLabel: 'OPEN PRACTICE & CREATOR STUDIO',
    action: 'studio',
  },
};

export const ModeHubView: React.FC<ModeHubPlaceholderProps> = ({
  screen,
  eraMode,
  onBack,
  onQuickPlaySetup,
  onOpenCity3D,
  onOpenClassicStudio,
}) => {
  const meta = MODE_META[screen];
  if (!meta) return null;

  return (
    <div className="h2k-mode-hub">
      <header className="h2k-subscreen-header">
        <div className="h2k-subscreen-left">
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('back', eraMode);
              onBack();
            }}
          >
            ◀ MAIN MENU
          </button>
          <div>
            <div className="h2k-kicker">{meta.kicker}</div>
            <h2>{meta.title}</h2>
          </div>
        </div>
      </header>

      <div className="h2k-mode-hub-card">
        <p className="h2k-mode-hub-sub">{meta.subtitle}</p>
        <ul className="h2k-mode-hub-list">
          {meta.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
        <div className="h2k-mode-hub-actions">
          <button
            type="button"
            className="h2k-tipoff-cta compact"
            onClick={() => {
              HybridAudioEngine.playUi('confirm', eraMode);
              if (meta.action === 'city') onOpenCity3D();
              else if (meta.action === 'studio') onOpenClassicStudio();
              else onQuickPlaySetup();
            }}
          >
            <span className="h2k-tipoff-title">{meta.ctaLabel}</span>
          </button>
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('click', eraMode);
              onQuickPlaySetup();
            }}
          >
            PRE-GAME TEAM SELECT
          </button>
        </div>
      </div>
    </div>
  );
};
