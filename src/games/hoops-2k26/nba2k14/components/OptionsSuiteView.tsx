// ============================================================================
// NBA 2K14 — Complete 7-Category Options & Gameplay Sliders Suite
// ============================================================================

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { createDefaultSettings, createDefaultSliders } from '../storage';
import type {
  CameraAngleMode,
  DifficultyTier,
  GameStyleMode,
  GameplaySliders,
  KeybindConfig,
  Nba2k14Settings,
} from '../types';

interface OptionsSuiteViewProps {
  settings: Nba2k14Settings;
  onChange: (next: Nba2k14Settings) => void;
  onBack?: () => void;
  compact?: boolean;
}

type OptTab = 'game' | 'controller' | 'camera' | 'presentation' | 'coach' | 'sliders' | 'graphics';

const TABS: { id: OptTab; label: string }[] = [
  { id: 'game', label: 'Game Settings' },
  { id: 'controller', label: 'Controller' },
  { id: 'camera', label: 'Camera' },
  { id: 'presentation', label: 'Presentation & Audio' },
  { id: 'coach', label: 'Coach Settings' },
  { id: 'sliders', label: 'Gameplay Sliders' },
  { id: 'graphics', label: 'Graphics' },
];

const SLIDER_LABELS: { key: keyof GameplaySliders; label: string }[] = [
  { key: 'insideShot', label: 'Inside Shot Success' },
  { key: 'closeShot', label: 'Close Shot Success' },
  { key: 'midRange', label: 'Mid-Range Success' },
  { key: 'threePt', label: '3PT Success' },
  { key: 'layup', label: 'Layup Success' },
  { key: 'dunkInTraffic', label: 'Dunk in Traffic' },
  { key: 'passAccuracy', label: 'Pass Accuracy' },
  { key: 'alleyOop', label: 'Alley-Oop Success' },
  { key: 'contactShot', label: 'Contact Shot Success' },
  { key: 'drivingContactFreq', label: 'Driving Contact Freq' },
  { key: 'insideContactFreq', label: 'Inside Contact Freq' },
  { key: 'stealSuccess', label: 'Steal Success' },
  { key: 'blockSuccess', label: 'Block Success' },
  { key: 'defAwareness', label: 'Defensive Awareness' },
  { key: 'onBallDefense', label: 'On-Ball Defense' },
  { key: 'acceleration', label: 'Acceleration' },
  { key: 'vertical', label: 'Vertical' },
  { key: 'strength', label: 'Strength' },
  { key: 'stamina', label: 'Stamina' },
  { key: 'speed', label: 'Speed' },
  { key: 'hustle', label: 'Hustle' },
  { key: 'ballHandling', label: 'Ball Handling' },
  { key: 'hands', label: 'Hands' },
  { key: 'offRebounding', label: 'Offensive Rebounding' },
  { key: 'defRebounding', label: 'Defensive Rebounding' },
];

export const OptionsSuiteView: React.FC<OptionsSuiteViewProps> = ({ settings, onChange, onBack, compact }) => {
  const [tab, setTab] = useState<OptTab>('game');
  const [sliderSide, setSliderSide] = useState<'user' | 'cpu'>('user');
  const [rebindingKey, setRebindingKey] = useState<keyof KeybindConfig | null>(null);

  const patch = (next: Nba2k14Settings) => {
    onChange(next);
  };

  const activeSliders = sliderSide === 'user' ? settings.slidersUser : settings.slidersCpu;

  const updateSlider = (key: keyof GameplaySliders, val: number) => {
    if (sliderSide === 'user') {
      patch({ ...settings, slidersUser: { ...settings.slidersUser, [key]: val } });
    } else {
      patch({ ...settings, slidersCpu: { ...settings.slidersCpu, [key]: val } });
    }
  };

  const handleKeyCapture = (e: React.KeyboardEvent, k: keyof KeybindConfig) => {
    e.preventDefault();
    patch({ ...settings, keybinds: { ...settings.keybinds, [k]: e.code } });
    setRebindingKey(null);
    Nba2k14Audio.playUiClick('select');
  };

  return (
    <div className={`w-full ${compact ? '' : 'max-w-6xl mx-auto px-4 py-3'} flex flex-col gap-3`}>
      <div className="bg-[#0f1116]/94 border border-white/15 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                Nba2k14Audio.playUiClick('hover');
                setTab(t.id);
              }}
              className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border cursor-pointer ${
                tab === t.id
                  ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                  : 'bg-[#171a23] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              Nba2k14Audio.playUiClick('select');
              patch(createDefaultSettings());
            }}
            className="px-2.5 py-1.5 bg-[#171a23] hover:bg-[#252a38] border border-white/15 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 bg-[#171a23] hover:bg-[#252a38] border border-white/15 text-[11px] font-bold uppercase cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </div>

      <div className={`bg-[#0f1116]/94 border border-white/15 p-4 ${compact ? 'max-h-[54vh]' : 'max-h-[58vh]'} overflow-y-auto`}>
        {/* 1. GAME SETTINGS + NBA RULES */}
        {tab === 'game' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Core Gameplay</div>
              <div className="flex items-center justify-between">
                <span>Difficulty</span>
                <select
                  value={settings.game.difficulty}
                  onChange={(e) => patch({ ...settings, game: { ...settings.game, difficulty: e.target.value as DifficultyTier } })}
                  className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
                >
                  {(['Rookie', 'Pro', 'All-Star', 'Superstar', 'Hall of Fame'] as DifficultyTier[]).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Quarter Length</span>
                <select
                  value={settings.game.quarterLengthMin}
                  onChange={(e) =>
                    patch({ ...settings, game: { ...settings.game, quarterLengthMin: Number(e.target.value) as Nba2k14Settings['game']['quarterLengthMin'] } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-mono font-bold"
                >
                  {[1, 2, 3, 5, 6, 8, 10, 12].map((m) => (
                    <option key={m} value={m}>{m} Minutes</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Game Style</span>
                <select
                  value={settings.game.gameStyle}
                  onChange={(e) => patch({ ...settings, game: { ...settings.game, gameStyle: e.target.value as GameStyleMode } })}
                  className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
                >
                  <option value="Default">Default</option>
                  <option value="Simulation">Simulation</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Game Speed</span>
                  <span className="font-mono tabular-nums text-[#F9A01B]">{settings.game.gameSpeed}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={settings.game.gameSpeed}
                  onChange={(e) => patch({ ...settings, game: { ...settings.game, gameSpeed: Number(e.target.value) } })}
                  className="w-full accent-[#CE1141]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Shot Timing</span>
                <select
                  value={settings.game.shotTiming}
                  onChange={(e) =>
                    patch({ ...settings, game: { ...settings.game, shotTiming: e.target.value as 'User Timing' | 'Real Player FG%' } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
                >
                  <option value="User Timing">User Timing</option>
                  <option value="Real Player FG%">Real Player FG%</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Free Throw Timing</span>
                <select
                  value={settings.game.freeThrowTiming}
                  onChange={(e) =>
                    patch({ ...settings, game: { ...settings.game, freeThrowTiming: e.target.value as 'User Timing' | 'Real Player FT%' } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
                >
                  <option value="User Timing">User Timing</option>
                  <option value="Real Player FT%">Real Player FT%</option>
                </select>
              </div>
              {(
                [
                  ['fatigue', 'Fatigue'],
                  ['injuries', 'Injuries'],
                  ['clutchFactor', 'Clutch Factor'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between cursor-pointer">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={settings.game[k]}
                    onChange={(e) => patch({ ...settings, game: { ...settings.game, [k]: e.target.checked } })}
                    className="accent-[#CE1141] w-4 h-4"
                  />
                </label>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">NBA Rules Enforcement</div>
              {(
                [
                  ['outOfBounds', 'Out of Bounds'],
                  ['backcourtViolation', 'Backcourt Violation'],
                  ['eightSecondViolation', '8-Second Violation'],
                  ['shotClock24', '24-Second Shot Clock'],
                  ['threeSecondKey', '3-Second Key'],
                  ['goaltending', 'Goaltending'],
                  ['shootingFouls', 'Shooting Fouls'],
                  ['reachInFouls', 'Reach-In Fouls'],
                  ['chargingFouls', 'Charging Fouls'],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex items-center justify-between py-1 border-b border-white/5 cursor-pointer">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={settings.rules[k]}
                    onChange={(e) => patch({ ...settings, rules: { ...settings.rules, [k]: e.target.checked } })}
                    className="accent-[#CE1141] w-4 h-4"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 2. CONTROLLER & KEYBIND REMAPPER */}
        {tab === 'controller' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Pro Stick & Assists</div>
              <div className="flex items-center justify-between">
                <span>Pro Stick Function</span>
                <select
                  value={settings.controller.proStickFunction}
                  onChange={(e) =>
                    patch({ ...settings, controller: { ...settings.controller, proStickFunction: e.target.value as Nba2k14Settings['controller']['proStickFunction'] } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="Default">Default</option>
                  <option value="Dribble Moves">Dribble Moves</option>
                  <option value="Shots">Shots</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Pro Stick Orientation</span>
                <select
                  value={settings.controller.proStickOrientation}
                  onChange={(e) =>
                    patch({ ...settings, controller: { ...settings.controller, proStickOrientation: e.target.value as 'Camera Relative' | 'Absolute' } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="Camera Relative">Camera Relative</option>
                  <option value="Absolute">Absolute</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Shot Meter Display</span>
                <select
                  value={settings.controller.shotMeterDisplay}
                  onChange={(e) =>
                    patch({ ...settings, controller: { ...settings.controller, shotMeterDisplay: e.target.value as Nba2k14Settings['controller']['shotMeterDisplay'] } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="On (Floor Ring)">On (Floor Ring)</option>
                  <option value="On (Hands)">On (Hands)</option>
                  <option value="Off (No-Meter Green Boost)">Off (No-Meter Green Boost)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Virtual Gamepad Overlay</span>
                <select
                  value={settings.controller.virtualGamepad}
                  onChange={(e) =>
                    patch({ ...settings, controller: { ...settings.controller, virtualGamepad: e.target.value as 'Auto' | 'Always On' | 'Off' } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="Auto">Auto</option>
                  <option value="Always On">Always On</option>
                  <option value="Off">Off</option>
                </select>
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Shot Feedback Banner</span>
                <input
                  type="checkbox"
                  checked={settings.controller.shotFeedback}
                  onChange={(e) => patch({ ...settings, controller: { ...settings.controller, shotFeedback: e.target.checked } })}
                  className="accent-[#CE1141] w-4 h-4"
                />
              </label>
              <div>
                <div className="flex justify-between"><span>Defensive Assist</span><span className="font-mono">{settings.controller.defensiveAssist}</span></div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.controller.defensiveAssist}
                  onChange={(e) => patch({ ...settings, controller: { ...settings.controller, defensiveAssist: Number(e.target.value) } })}
                  className="w-full accent-[#CE1141]"
                />
              </div>
              <div>
                <div className="flex justify-between"><span>Boxout Assist</span><span className="font-mono">{settings.controller.boxoutAssist}</span></div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.controller.boxoutAssist}
                  onChange={(e) => patch({ ...settings, controller: { ...settings.controller, boxoutAssist: Number(e.target.value) } })}
                  className="w-full accent-[#CE1141]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Keybind Remapper</span>
                <button
                  type="button"
                  onClick={() => patch({ ...settings, keybinds: createDefaultSettings().keybinds })}
                  className="text-[10px] uppercase text-slate-300 hover:text-white underline cursor-pointer"
                >
                  Reset Keys
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(settings.keybinds) as (keyof KeybindConfig)[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setRebindingKey(k)}
                    onKeyDown={(e) => rebindingKey === k && handleKeyCapture(e, k)}
                    className={`flex items-center justify-between px-2 py-1.5 border text-[11px] cursor-pointer ${
                      rebindingKey === k ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="capitalize text-slate-300">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono font-bold text-white">
                      {rebindingKey === k ? 'Press Key...' : settings.keybinds[k].replace('Key', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. CAMERA SETTINGS */}
        {tab === 'camera' && (
          <div className="max-w-xl space-y-4 text-xs">
            <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">3D Court Camera Angles</div>
            <div className="grid grid-cols-3 gap-2">
              {(['2K', 'Broadcast', 'Turbo', 'Drive', 'Nosebleeds', 'Player Lock'] as CameraAngleMode[]).map((ang) => (
                <button
                  key={ang}
                  type="button"
                  onClick={() => patch({ ...settings, camera: { ...settings.camera, angle: ang } })}
                  className={`py-2 border text-xs font-black uppercase cursor-pointer ${
                    settings.camera.angle === ang ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/15'
                  }`}
                >
                  {ang}
                </button>
              ))}
            </div>
            <div>
              <div className="flex justify-between"><span>Zoom (1–10)</span><span className="font-mono">{settings.camera.zoom}</span></div>
              <input type="range" min={1} max={10} value={settings.camera.zoom} onChange={(e) => patch({ ...settings, camera: { ...settings.camera, zoom: Number(e.target.value) } })} className="w-full accent-[#CE1141]" />
            </div>
            <div>
              <div className="flex justify-between"><span>Height (1–10)</span><span className="font-mono">{settings.camera.height}</span></div>
              <input type="range" min={1} max={10} value={settings.camera.height} onChange={(e) => patch({ ...settings, camera: { ...settings.camera, height: Number(e.target.value) } })} className="w-full accent-[#CE1141]" />
            </div>
            {(
              [
                ['keyZoom', 'Key Zoom'],
                ['autoFlip', 'Auto-Flip Camera on Possession'],
                ['dunkShake', 'Camera Shake on Dunks'],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between cursor-pointer">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={settings.camera[k]}
                  onChange={(e) => patch({ ...settings, camera: { ...settings.camera, [k]: e.target.checked } })}
                  className="accent-[#CE1141] w-4 h-4"
                />
              </label>
            ))}
          </div>
        )}

        {/* 4. PRESENTATION & AUDIO */}
        {tab === 'presentation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Broadcast Presentation</div>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Scoreboard Display</span>
                <input
                  type="checkbox"
                  checked={settings.presentation.scoreboardDisplay}
                  onChange={(e) => patch({ ...settings, presentation: { ...settings.presentation, scoreboardDisplay: e.target.checked } })}
                  className="accent-[#CE1141] w-4 h-4"
                />
              </label>
              <div className="flex items-center justify-between">
                <span>Player Indicator Style</span>
                <select
                  value={settings.presentation.playerIndicatorStyle}
                  onChange={(e) =>
                    patch({ ...settings, presentation: { ...settings.presentation, playerIndicatorStyle: e.target.value as Nba2k14Settings['presentation']['playerIndicatorStyle'] } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="Full 2K14 Ring">Full 2K14 Ring</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Name + Number">Name + Number</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Action Replays / Dunk Cuts</span>
                <select
                  value={settings.presentation.actionReplays}
                  onChange={(e) =>
                    patch({ ...settings, presentation: { ...settings.presentation, actionReplays: e.target.value as 'Often' | 'Occasionally' | 'Never' } })
                  }
                  className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
                >
                  <option value="Often">Often</option>
                  <option value="Occasionally">Occasionally</option>
                  <option value="Never">Never</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Audio Mixer (0–100)</div>
              {(
                [
                  ['master', 'Master Volume'],
                  ['beats', '2K Beats Soundtrack'],
                  ['crowd', 'Arena Crowd'],
                  ['sfx', 'On-Court SFX'],
                  ['commentary', 'PA Announcer & Commentary'],
                ] as const
              ).map(([k, label]) => (
                <div key={k}>
                  <div className="flex justify-between">
                    <span>{label}</span>
                    <span className="font-mono tabular-nums">{settings.audio[k]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.audio[k]}
                    onChange={(e) => patch({ ...settings, audio: { ...settings.audio, [k]: Number(e.target.value) } })}
                    className="w-full accent-[#CE1141]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. COACH SETTINGS */}
        {tab === 'coach' && (
          <div className="max-w-lg space-y-3 text-xs">
            <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">Coach & PlayVision</div>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Adaptive Coaching Engine</span>
              <input
                type="checkbox"
                checked={settings.coach.adaptiveEngine}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, adaptiveEngine: e.target.checked } })}
                className="accent-[#CE1141] w-4 h-4"
              />
            </label>
            <div className="flex items-center justify-between">
              <span>Substitutions</span>
              <select
                value={settings.coach.substitutions}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, substitutions: e.target.value as Nba2k14Settings['coach']['substitutions'] } })}
                className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
              >
                <option value="Auto (Rotation)">Auto (Rotation)</option>
                <option value="Auto (Fatigue)">Auto (Fatigue)</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Timeouts</span>
              <select
                value={settings.coach.timeouts}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, timeouts: e.target.value as 'Auto' | 'Manual' } })}
                className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
              >
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Offensive Playcalling</span>
              <select
                value={settings.coach.offensivePlaycalling}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, offensivePlaycalling: e.target.value as 'Auto' | 'Manual' } })}
                className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
              >
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>PlayVision Display (3D Floor Art)</span>
              <select
                value={settings.coach.playVision}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, playVision: e.target.value as 'Off' | 'Lite' | 'Full' } })}
                className="bg-[#171a23] border border-white/20 px-2 py-1 font-bold"
              >
                <option value="Off">Off</option>
                <option value="Lite">Lite</option>
                <option value="Full">Full</option>
              </select>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span>PlayArt Messages</span>
              <input
                type="checkbox"
                checked={settings.coach.playArtMessages}
                onChange={(e) => patch({ ...settings, coach: { ...settings.coach, playArtMessages: e.target.checked } })}
                className="accent-[#CE1141] w-4 h-4"
              />
            </label>
          </div>
        )}

        {/* 6. GAMEPLAY SLIDERS (USER / CPU + PRESETS) */}
        {tab === 'sliders' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {(['user', 'cpu'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSliderSide(s)}
                    className={`px-3.5 py-1.5 font-black uppercase border cursor-pointer ${
                      sliderSide === s ? 'bg-[#CE1141] border-[#F9A01B]' : 'bg-[#171a23] border-white/15'
                    }`}
                  >
                    {s === 'user' ? 'USER Sliders' : 'CPU Sliders'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(['Default', 'Simulation', 'Arcade'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const nextS = createDefaultSliders(preset);
                      patch(sliderSide === 'user' ? { ...settings, slidersUser: nextS } : { ...settings, slidersCpu: nextS });
                    }}
                    className="px-2.5 py-1 bg-[#171a23] hover:bg-[#252a38] border border-white/15 font-bold uppercase cursor-pointer"
                  >
                    {preset === 'Arcade' ? 'Arcade / Blacktop' : preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SLIDER_LABELS.map((item) => (
                <div key={item.key} className="bg-[#161923] border border-white/10 p-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-200">{item.label}</span>
                    <span className="font-mono font-bold tabular-nums text-[#F9A01B]">{activeSliders[item.key]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeSliders[item.key]}
                    onChange={(e) => updateSlider(item.key, Number(e.target.value))}
                    className="w-full accent-[#CE1141]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. GRAPHICS & PERFORMANCE */}
        {tab === 'graphics' && (
          <div className="max-w-lg space-y-3 text-xs">
            <div className="text-xs font-black uppercase tracking-widest text-[#F9A01B]">WebGL 3D Render Pipeline</div>
            <div className="flex items-center justify-between">
              <span>Render Quality</span>
              <select
                value={settings.graphics.renderQuality}
                onChange={(e) =>
                  patch({ ...settings, graphics: { ...settings.graphics, renderQuality: e.target.value as Nba2k14Settings['graphics']['renderQuality'] } })
                }
                className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Ultra">Ultra</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span>Crowd Detail</span>
              <select
                value={settings.graphics.crowdDetail}
                onChange={(e) => patch({ ...settings, graphics: { ...settings.graphics, crowdDetail: e.target.value as 'Low' | 'High' } })}
                className="bg-[#171a23] border border-white/20 px-2.5 py-1 font-bold"
              >
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Court Hardwood Reflections</span>
              <input
                type="checkbox"
                checked={settings.graphics.courtReflections}
                onChange={(e) => patch({ ...settings, graphics: { ...settings.graphics, courtReflections: e.target.checked } })}
                className="accent-[#CE1141] w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>FPS Counter Overlay</span>
              <input
                type="checkbox"
                checked={settings.graphics.fpsCounter}
                onChange={(e) => patch({ ...settings, graphics: { ...settings.graphics, fpsCounter: e.target.checked } })}
                className="accent-[#CE1141] w-4 h-4"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
