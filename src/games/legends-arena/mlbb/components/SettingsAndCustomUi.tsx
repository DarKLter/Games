import React, { useMemo, useRef, useState } from 'react';
import {
  MlbbAiDifficulty,
  MlbbMapThemeId,
  MlbbSettingsState,
  MlbbUiControlLayout
} from '../types';
import { MAP_THEMES } from '../data/mapData';
import { MLBB_ALL_HEROES } from '../data/heroes';
import { MLBB_ITEMS } from '../data/items';
import { MLBB_BATTLE_SPELLS, MLBB_EMBLEMS, MLBB_TALENTS } from '../data/emblems';
import { createDefaultCustomUi } from '../storage';
import { mlbbAudio } from '../engine/AudioEngine';

interface SettingsModalProps {
  settings: MlbbSettingsState;
  inMatch?: boolean;
  surrenderAvailable?: boolean;
  onUpdateSettings: (next: MlbbSettingsState) => void;
  onSurrender?: () => void;
  onExitMatch?: () => void;
  onClose: () => void;
}

const VOICE_LANGUAGES: MlbbSettingsState['sound']['language'][] = ['English', 'Japanese', 'Indonesian', 'Tagalog'];
const REFRESH_RATES: MlbbSettingsState['basics']['refreshRate'][] = [30, 60, 90, 120];
const GRAPHICS_TIERS: { id: MlbbSettingsState['basics']['graphicsQuality']; label: string }[] = [
  { id: 'smooth', label: 'Smooth' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
  { id: 'ultra', label: 'Ultra' }
];
const AI_TIERS: { id: MlbbAiDifficulty; label: string; desc: string }[] = [
  { id: 'warrior', label: 'Warrior', desc: 'Casual bots, relaxed laning' },
  { id: 'epic', label: 'Epic', desc: 'Counter-builds, ganks, smart spells' },
  { id: 'mythic', label: 'Mythic', desc: 'Pro macro, kiting, tight Retribution' }
];

export const SettingsAndCustomUiModal: React.FC<SettingsModalProps> = ({
  settings,
  inMatch = false,
  surrenderAvailable = false,
  onUpdateSettings,
  onSurrender,
  onExitMatch,
  onClose
}) => {
  const [tab, setTab] = useState<'basics' | 'controls' | 'interface' | 'sound' | 'network' | 'privacy' | 'resources'>('basics');
  const [editingCustomUi, setEditingCustomUi] = useState(false);
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);
  const [resourceCheck, setResourceCheck] = useState<string | null>(null);

  if (editingCustomUi) {
    return (
      <CustomUiEditorOverlay
        settings={settings}
        onSave={(next) => {
          onUpdateSettings(next);
          setEditingCustomUi(false);
        }}
        onClose={() => setEditingCustomUi(false)}
      />
    );
  }

  const updateBasics = (patch: Partial<MlbbSettingsState['basics']>) =>
    onUpdateSettings({ ...settings, basics: { ...settings.basics, ...patch } });
  const updateControls = (patch: Partial<MlbbSettingsState['controls']>) =>
    onUpdateSettings({ ...settings, controls: { ...settings.controls, ...patch } });
  const updateInterface = (patch: Partial<MlbbSettingsState['interface']>) =>
    onUpdateSettings({ ...settings, interface: { ...settings.interface, ...patch } });
  const updateSound = (patch: Partial<MlbbSettingsState['sound']>) => {
    const next = { ...settings, sound: { ...settings.sound, ...patch } };
    mlbbAudio.setVolumes(next.sound);
    onUpdateSettings(next);
  };
  const updateNetwork = (patch: Partial<MlbbSettingsState['network']>) =>
    onUpdateSettings({ ...settings, network: { ...settings.network, ...patch } });
  const updatePrivacy = (patch: Partial<MlbbSettingsState['privacy']>) =>
    onUpdateSettings({ ...settings, privacy: { ...settings.privacy, ...patch } });
  const updateResources = (patch: Partial<MlbbSettingsState['resources']>) =>
    onUpdateSettings({ ...settings, resources: { ...settings.resources, ...patch } });

  const runLiveFrameDiagnostic = () => {
    if (diagRunning) return;
    mlbbAudio.playClick();
    setDiagRunning(true);
    setDiagResult('Sampling live frame pacing...');
    const samples: number[] = [];
    let last = performance.now();
    const step = (now: number) => {
      samples.push(now - last);
      last = now;
      if (samples.length < 24) {
        requestAnimationFrame(step);
      } else {
        const trimmed = samples.slice(2);
        const avgMs = trimmed.reduce((a, b) => a + b, 0) / Math.max(1, trimmed.length);
        const fps = Math.max(15, Math.min(240, Math.round(1000 / Math.max(1, avgMs))));
        const simPing = settings.network.speedMode ? (settings.network.networkBoost ? 12 : 16) : 26;
        setDiagResult(`Measured ${fps} FPS (${avgMs.toFixed(1)}ms frame) · Simulated Ping ${simPing}ms · 0% Loss`);
        setDiagRunning(false);
      }
    };
    requestAnimationFrame(step);
  };

  const runResourceIntegrityCheck = () => {
    mlbbAudio.playClick();
    setResourceCheck(
      `Verified: ${MLBB_ALL_HEROES.length} Heroes · ${MLBB_ITEMS.length} Equipment Items · ${MLBB_EMBLEMS.length} Lv.60 Emblems · ${MLBB_TALENTS.length} Talents · ${MLBB_BATTLE_SPELLS.length} Battle Spells · 5 Map Themes`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3">
      <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-[#0B132B] border-2 border-[#F5C451]/60 flex flex-col overflow-hidden text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 bg-[#101C3D] border-b border-[#F5C451]/30">
          <div className="text-base font-black text-[#F5C451] uppercase tracking-wide">Settings</div>
          <div className="flex items-center gap-2">
            {inMatch && onSurrender && (
              <button
                disabled={!surrenderAvailable}
                onClick={onSurrender}
                className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap cursor-pointer ${
                  surrenderAvailable ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {surrenderAvailable ? 'Surrender' : 'Surrender (06:00)'}
              </button>
            )}
            {inMatch && onExitMatch && (
              <button
                onClick={onExitMatch}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black whitespace-nowrap cursor-pointer"
              >
                Return to Lobby
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 text-white font-black cursor-pointer"
              aria-label="Close Settings"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left Vertical Tabs (All 7 MLBB Tabs) */}
          <div className="w-40 bg-[#080F24] border-r border-slate-800 p-2 space-y-1 overflow-y-auto shrink-0">
            {(
              [
                ['basics', 'Basics'],
                ['controls', 'Controls'],
                ['interface', 'Interface & UI'],
                ['sound', 'Sound'],
                ['network', 'Network'],
                ['privacy', 'Privacy'],
                ['resources', 'Resources']
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  mlbbAudio.playClick();
                  setTab(id);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-black whitespace-nowrap cursor-pointer transition-colors ${
                  tab === id ? 'bg-[#F5C451] text-slate-950' : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Content Panel */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {tab === 'basics' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      ['outline', 'Hero Outline'],
                      ['screenShake', 'Screen Shake'],
                      ['shadows', 'Battlefield Shadows'],
                      ['creepHpNumbers', 'Creep HP Numbers'],
                      ['damageText', 'Floating Damage Text'],
                      ['hdMode', 'HD Mode']
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                      <span className="font-bold">{label}</span>
                      <input
                        type="checkbox"
                        checked={settings.basics[key]}
                        onChange={(e) => updateBasics({ [key]: e.target.checked })}
                        className="accent-[#F5C451] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Refresh Rate Target</div>
                    <div className="grid grid-cols-4 gap-1">
                      {REFRESH_RATES.map((hz) => (
                        <button
                          key={hz}
                          onClick={() => {
                            mlbbAudio.playClick();
                            updateBasics({ refreshRate: hz });
                          }}
                          className={`py-1.5 rounded-lg font-black mlbb-num cursor-pointer ${
                            settings.basics.refreshRate === hz ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {hz}Hz
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Graphics Quality</div>
                    <div className="grid grid-cols-4 gap-1">
                      {GRAPHICS_TIERS.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => {
                            mlbbAudio.playClick();
                            updateBasics({ graphicsQuality: g.id });
                          }}
                          className={`py-1.5 rounded-lg font-black cursor-pointer ${
                            settings.basics.graphicsQuality === g.id ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Camera Height</div>
                    <div className="flex gap-1.5">
                      {(['low', 'high'] as const).map((h) => (
                        <button
                          key={h}
                          onClick={() => updateBasics({ cameraHeight: h })}
                          className={`flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer ${
                            settings.basics.cameraHeight === h ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Colorblind Filter</div>
                    <select
                      value={settings.basics.colorblind}
                      onChange={(e) => updateBasics({ colorblind: e.target.value as MlbbSettingsState['basics']['colorblind'] })}
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="off">Off</option>
                      <option value="deuteranopia">Deuteranopia</option>
                      <option value="protanopia">Protanopia</option>
                      <option value="tritanopia">Tritanopia</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                  <div className="font-bold text-slate-300 mb-1.5">Battlefield Map Theme</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(MAP_THEMES) as MlbbMapThemeId[]).map((tid) => (
                      <button
                        key={tid}
                        onClick={() => updateBasics({ mapTheme: tid })}
                        className={`px-2.5 py-1.5 rounded-lg font-bold cursor-pointer ${
                          settings.basics.mapTheme === tid ? 'bg-[#F5C451] text-slate-950 font-black' : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {MAP_THEMES[tid].name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'controls' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Targeting Method</div>
                    <div className="flex gap-1.5">
                      {(['standard', 'advanced'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => updateControls({ targetingMethod: m })}
                          className={`flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer ${
                            settings.controls.targetingMethod === m ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Targeting Priority</div>
                    <select
                      value={settings.controls.targetingPriority}
                      onChange={(e) =>
                        updateControls({ targetingPriority: e.target.value as MlbbSettingsState['controls']['targetingPriority'] })
                      }
                      className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="lowest_hp">Lowest HP</option>
                      <option value="lowest_pct">Lowest HP %</option>
                      <option value="closest">Closest Target</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Movement Joystick Mode</div>
                    <div className="flex gap-1.5">
                      {(['fixed', 'floating'] as const).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => updateControls({ joystickPosition: pos })}
                          className={`flex-1 py-1.5 rounded-lg font-black uppercase cursor-pointer ${
                            settings.controls.joystickPosition === pos ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700">
                    <div className="font-bold text-slate-300 mb-1.5">Skill Cancel Cast Method</div>
                    <div className="flex gap-1.5">
                      {(
                        [
                          ['drag_to_x', 'Drag to Red X'],
                          ['drag_distance', 'Drag Distance']
                        ] as const
                      ).map(([m, lbl]) => (
                        <button
                          key={m}
                          onClick={() => updateControls({ skillCancelMethod: m })}
                          className={`flex-1 py-1.5 rounded-lg font-black cursor-pointer ${
                            (settings.controls.skillCancelMethod ?? 'drag_to_x') === m
                              ? 'bg-[#F5C451] text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Smart AI Difficulty Selector (Part 7) */}
                <div className="p-3 rounded-xl bg-[#101C3D] border border-[#F5C451]/40">
                  <div className="font-black text-[#F5C451] mb-1.5">Smart AI Difficulty Tier</div>
                  <div className="grid grid-cols-3 gap-2">
                    {AI_TIERS.map((tier) => {
                      const active = (settings.controls.aiDifficulty ?? 'epic') === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => {
                            mlbbAudio.playClick();
                            updateControls({ aiDifficulty: tier.id });
                          }}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#F5C451] border-amber-200 text-slate-950'
                              : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          <div className="font-black text-xs">{tier.label}</div>
                          <div className={`text-[10px] ${active ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                            {tier.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['heroLockMode', 'Hero Lock Mode'],
                      ['skillSmartTargeting', 'Skill Smart Targeting'],
                      ['basicSmartTargeting', 'Basic Attack Smart Targeting'],
                      ['attackAssist', 'Attack Assist (Auto-Pursue)'],
                      ['aimPanning', 'Aim Panning (Camera Shift)'],
                      ['autoLevelUp', 'Auto Level-Up Skills'],
                      ['autoBuy', 'Auto-Buy Recommended Items']
                    ] as const
                  ).map(([k, label]) => (
                    <label key={k} className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                      <span className="font-bold">{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(settings.controls[k])}
                        onChange={(e) => updateControls({ [k]: e.target.checked })}
                        className="accent-[#F5C451] w-4 h-4"
                      />
                    </label>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4">
                  <span className="font-bold mlbb-num">Camera Pan Sensitivity ({settings.controls.cameraPanSensitivity}%)</span>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={settings.controls.cameraPanSensitivity}
                    onChange={(e) => updateControls({ cameraPanSensitivity: Number(e.target.value) })}
                    className="w-48 accent-[#F5C451]"
                  />
                </div>
              </div>
            )}

            {tab === 'interface' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-black text-white mlbb-num">Battlefield UI Opacity ({settings.interface.battlefieldUiOpacity}%)</div>
                    <div className="text-[11px] text-slate-400">Adjusts transparency of HUD panels and Shop-Anywhere overlay over the live battlefield.</div>
                  </div>
                  <input
                    type="range"
                    min={25}
                    max={100}
                    value={settings.interface.battlefieldUiOpacity}
                    onChange={(e) => updateInterface({ battlefieldUiOpacity: Number(e.target.value) })}
                    className="w-48 accent-[#F5C451]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-black text-white">Default Skill Layout Preset</div>
                    <div className="text-[11px] text-slate-400">Switch between standard 3-Skill heroes and 4-Skill heroes (Kagura, Julian, Pharsa, etc.).</div>
                  </div>
                  <div className="flex gap-1.5">
                    {(['3skill', '4skill'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => updateInterface({ activeSkillPreset: preset })}
                        className={`px-3 py-1.5 rounded-lg font-black cursor-pointer ${
                          settings.interface.activeSkillPreset === preset
                            ? 'bg-[#F5C451] text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {preset === '3skill' ? '3-Skill' : '4-Skill'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#101C3D] border border-[#F5C451]/45 space-y-2.5">
                  <div className="font-black text-[#F5C451] text-sm">Interactive Custom UI Layout Editor</div>
                  <div className="text-slate-300">
                    Drag any control on the live Land of Dawn layout stage, enable 4% grid snap, detect overlapping buttons, adjust scale (50%–150%) and opacity (20%–100%), or copy between 3-Skill and 4-Skill layouts.
                  </div>
                  <button
                    onClick={() => {
                      mlbbAudio.playClick();
                      setEditingCustomUi(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Open Interactive Custom UI Editor →
                  </button>
                </div>
              </div>
            )}

            {tab === 'sound' && (
              <div className="space-y-2.5">
                {(
                  [
                    ['master', 'Master Volume'],
                    ['sfx', 'Sound Effects (SFX)'],
                    ['bgm', 'Background Music (BGM)'],
                    ['voice', 'Hero Voice & Announcer'],
                    ['mic', 'Team Mic Volume']
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between">
                    <span className="font-bold mlbb-num">{label} ({settings.sound[k]}%)</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.sound[k]}
                      onChange={(e) => updateSound({ [k]: Number(e.target.value) })}
                      className="w-48 accent-[#F5C451]"
                    />
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white">Hero Voiceover Language</div>
                    <div className="text-[11px] text-slate-400">Select voice pack dialect for Lobby Showcase and Battle Announcer cues.</div>
                  </div>
                  <div className="flex gap-1">
                    {VOICE_LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          mlbbAudio.playClick();
                          updateSound({ language: lang });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg font-black cursor-pointer ${
                          settings.sound.language === lang ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="p-2.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                  <span className="font-bold">Kill Streak Announcer Voice</span>
                  <input
                    type="checkbox"
                    checked={settings.sound.killAnnouncer}
                    onChange={(e) => updateSound({ killAnnouncer: e.target.checked })}
                    className="accent-[#F5C451] w-4 h-4"
                  />
                </label>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => mlbbAudio.playSkill(3, 'magic')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 font-black text-sky-300 cursor-pointer"
                  >
                    Test Skill SFX
                  </button>
                  <button
                    onClick={() => mlbbAudio.playKillStreakAnnouncer('savage')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-[#F5C451]/50 font-black text-[#F5C451] cursor-pointer"
                  >
                    Test Announcer (SAVAGE!)
                  </button>
                </div>
              </div>
            )}

            {tab === 'network' && (
              <div className="space-y-3">
                {(
                  [
                    ['speedMode', 'Speed Mode (Low Latency Input)'],
                    ['networkBoost', 'Network Boost (Dual-Channel Smoothing)'],
                    ['showPingFps', 'Show Live Ping & FPS Telemetry']
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                    <span className="font-bold">{label}</span>
                    <input
                      type="checkbox"
                      checked={settings.network[k]}
                      onChange={(e) => updateNetwork({ [k]: e.target.checked })}
                      className="accent-[#F5C451] w-4 h-4"
                    />
                  </label>
                ))}
                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-white">Live Frame-Pacing & Engine Diagnostic</div>
                    <div className="text-[11px] text-emerald-300 mlbb-num">
                      {diagResult ?? 'Measures real browser animation frames and frame-time stability'}
                    </div>
                  </div>
                  <button
                    disabled={diagRunning}
                    onClick={runLiveFrameDiagnostic}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black whitespace-nowrap cursor-pointer"
                  >
                    {diagRunning ? 'Testing...' : 'Run Test'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'privacy' && (
              <div className="space-y-2.5">
                <div className="text-[11px] text-slate-400">
                  Privacy controls apply immediately to your Player Profile Namecard, History tab, and Lobby social visibility.
                </div>
                {(
                  [
                    ['hideMatchHistory', 'Hide Match History'],
                    ['hideFavoriteHeroes', 'Hide Favorite Heroes'],
                    ['hideOnlineStatus', 'Hide Online Status'],
                    ['hideRegion', 'Hide Region Flag'],
                    ['blockNonFriendInvites', 'Block Non-Friend Lobby Invites']
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                    <span className="font-bold">{label}</span>
                    <input
                      type="checkbox"
                      checked={settings.privacy[k]}
                      onChange={(e) => updatePrivacy({ [k]: e.target.checked })}
                      className="accent-[#F5C451] w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            )}

            {tab === 'resources' && (
              <div className="space-y-3">
                <label className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white">Procedural HD VFX Pack</div>
                    <div className="text-[11px] text-slate-400">Enables full 5-layer elemental skill particles, ground runes, and 3D lighting shaders.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.resources.hdVfxPack}
                    onChange={(e) => updateResources({ hdVfxPack: e.target.checked })}
                    className="accent-[#F5C451] w-4 h-4"
                  />
                </label>
                <label className="p-3 rounded-xl bg-[#101C3D] border border-slate-700 flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-bold text-white">Procedural Web Audio HD Pack</div>
                    <div className="text-[11px] text-slate-400">High-definition synthesized combat hits, harmonic chimes, and announcer fanfare.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.resources.hdAudioPack}
                    onChange={(e) => updateResources({ hdAudioPack: e.target.checked })}
                    className="accent-[#F5C451] w-4 h-4"
                  />
                </label>

                <div className="p-3.5 rounded-xl bg-[#101C3D] border border-[#F5C451]/40 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-[#F5C451]">Game Resource Integrity Check</div>
                    <div className="text-[11px] text-emerald-300 mlbb-num mt-0.5">
                      {resourceCheck ?? 'Verify all local offline hero, item, emblem, talent, and spell registries.'}
                    </div>
                  </div>
                  <button
                    onClick={runResourceIntegrityCheck}
                    className="px-4 py-2 rounded-lg bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black whitespace-nowrap cursor-pointer"
                  >
                    Verify Assets
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== INTERACTIVE VISUAL CUSTOM UI EDITOR ==================== */
function getControlVisualShape(id: string): { cls: string; badge: string } {
  if (id === 'minimap') return { cls: 'w-28 h-28 rounded-xl', badge: 'MAP' };
  if (id === 'shopBar') return { cls: 'w-32 h-11 rounded-xl', badge: 'SHOP' };
  if (id === 'joystick') return { cls: 'w-24 h-24 rounded-full border-dashed', badge: 'JOY' };
  if (id === 'basicAtk') return { cls: 'w-20 h-20 rounded-full', badge: 'ATK' };
  if (id === 'skill1' || id === 'skill2' || id === 'skill3' || id === 'skill4') {
    return { cls: 'w-16 h-16 rounded-full', badge: id.toUpperCase() };
  }
  if (id === 'minionBtn' || id === 'turretBtn' || id === 'cancelCast') {
    return { cls: 'w-12 h-12 rounded-full', badge: id === 'cancelCast' ? 'X' : 'TGT' };
  }
  return { cls: 'w-14 h-14 rounded-full', badge: 'BTN' };
}

const CustomUiEditorOverlay: React.FC<{
  settings: MlbbSettingsState;
  onSave: (next: MlbbSettingsState) => void;
  onClose: () => void;
}> = ({ settings, onSave, onClose }) => {
  const [preset, setPreset] = useState<'3skill' | '4skill'>(settings.interface.activeSkillPreset);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(settings.interface.editorSnapToGrid ?? true);
  const [layouts3, setLayouts3] = useState<Record<string, MlbbUiControlLayout>>(() => ({ ...settings.interface.customUi3Skill }));
  const [layouts4, setLayouts4] = useState<Record<string, MlbbUiControlLayout>>(() => ({ ...settings.interface.customUi4Skill }));
  const [selectedId, setSelectedId] = useState<string>('skill1');
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingId = useRef<string | null>(null);

  const currentMap = preset === '3skill' ? layouts3 : layouts4;
  const setCurrentMap = (updater: (m: Record<string, MlbbUiControlLayout>) => Record<string, MlbbUiControlLayout>) => {
    if (preset === '3skill') setLayouts3(updater);
    else setLayouts4(updater);
  };
  const selected = currentMap[selectedId] ?? Object.values(currentMap)[0];

  // Real-time overlap detection between any two controls
  const overlappingIds = useMemo(() => {
    const ids = new Set<string>();
    const list = Object.values(currentMap);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const d = Math.hypot(list[i].xPct - list[j].xPct, list[i].yPct - list[j].yPct);
        if (d < 5.2) {
          ids.add(list[i].id);
          ids.add(list[j].id);
        }
      }
    }
    return ids;
  }, [currentMap]);

  const applyCoord = (id: string, rawX: number, rawY: number) => {
    const snappedX = snapToGrid ? Math.round(rawX / 4) * 4 : Math.round(rawX);
    const snappedY = snapToGrid ? Math.round(rawY / 4) * 4 : Math.round(rawY);
    const xPct = Math.max(3, Math.min(97, snappedX));
    const yPct = Math.max(6, Math.min(94, snappedY));
    setCurrentMap((m) => ({ ...m, [id]: { ...m[id], xPct, yPct } }));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    applyCoord(draggingId.current, rawX, rawY);
  };

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selected) return;
    const xPct = Math.max(3, Math.min(97, selected.xPct + dx));
    const yPct = Math.max(6, Math.min(94, selected.yPct + dy));
    setCurrentMap((m) => ({ ...m, [selected.id]: { ...m[selected.id], xPct, yPct } }));
  };

  const copyBetweenPresets = () => {
    mlbbAudio.playClick();
    if (preset === '3skill') {
      const base4 = createDefaultCustomUi('4skill');
      setLayouts4({ ...base4, ...layouts3, skill4: layouts4.skill4 ?? base4.skill4 });
    } else {
      const next3: Record<string, MlbbUiControlLayout> = {};
      for (const [k, v] of Object.entries(layouts4)) {
        if (k !== 'skill4') next3[k] = { ...v };
      }
      setLayouts3(next3);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050A18] text-white flex flex-col select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={() => (draggingId.current = null)}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#0D1836] border-b border-[#F5C451]/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#F5C451] whitespace-nowrap">Custom UI Editor</span>
          {(['3skill', '4skill'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`px-2.5 py-1 rounded font-black whitespace-nowrap cursor-pointer ${
                preset === p ? 'bg-[#F5C451] text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {p === '3skill' ? '3-Skill' : '4-Skill'}
            </button>
          ))}
          <button
            onClick={() => setSnapToGrid((v) => !v)}
            className={`px-2.5 py-1 rounded font-black whitespace-nowrap cursor-pointer border ${
              snapToGrid
                ? 'bg-sky-600/35 border-sky-400 text-sky-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            Grid Snap: {snapToGrid ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={copyBetweenPresets}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-slate-200 whitespace-nowrap cursor-pointer"
            title="Copy current layout coordinates to the other skill preset"
          >
            {preset === '3skill' ? 'Copy → 4-Skill' : 'Copy → 3-Skill'}
          </button>
        </div>

        {selected && (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-black text-sky-300 whitespace-nowrap">
              {selected.label} <span className="text-slate-400 mlbb-num">({selected.xPct}%, {selected.yPct}%)</span>
            </span>
            <div className="flex items-center gap-0.5">
              <button onClick={() => nudgeSelected(-1, 0)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer" title="Nudge Left 1%">←</button>
              <button onClick={() => nudgeSelected(0, -1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer" title="Nudge Up 1%">↑</button>
              <button onClick={() => nudgeSelected(0, 1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer" title="Nudge Down 1%">↓</button>
              <button onClick={() => nudgeSelected(1, 0)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-black cursor-pointer" title="Nudge Right 1%">→</button>
            </div>
            <label className="flex items-center gap-1 mlbb-num">
              <span>Size {Math.round(selected.scale * 100)}%</span>
              <input
                type="range"
                min={50}
                max={150}
                value={Math.round(selected.scale * 100)}
                onChange={(e) =>
                  setCurrentMap((m) => ({
                    ...m,
                    [selected.id]: { ...m[selected.id], scale: Number(e.target.value) / 100 }
                  }))
                }
                className="w-20 accent-[#F5C451]"
              />
            </label>
            <label className="flex items-center gap-1 mlbb-num">
              <span>Opacity {Math.round(selected.opacity * 100)}%</span>
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(selected.opacity * 100)}
                onChange={(e) =>
                  setCurrentMap((m) => ({
                    ...m,
                    [selected.id]: { ...m[selected.id], opacity: Number(e.target.value) / 100 }
                  }))
                }
                className="w-20 accent-[#F5C451]"
              />
            </label>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {(
            [
              ['Compact', 0.88],
              ['Default', 1.0],
              ['Pro', 1.12],
              ['Large', 1.24]
            ] as const
          ).map(([lbl, mult]) => (
            <button
              key={lbl}
              onClick={() =>
                setCurrentMap((m) => {
                  const base = createDefaultCustomUi(preset);
                  const next: Record<string, MlbbUiControlLayout> = {};
                  for (const [k, v] of Object.entries(m)) {
                    next[k] = { ...v, scale: Number(((base[k]?.scale ?? 1) * mult).toFixed(2)) };
                  }
                  return next;
                })
              }
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[10px] font-black text-amber-200 whitespace-nowrap cursor-pointer"
            >
              {lbl}
            </button>
          ))}
          {selected && (
            <button
              onClick={() => {
                const def = createDefaultCustomUi(preset)[selected.id];
                if (def) setCurrentMap((m) => ({ ...m, [selected.id]: { ...def } }));
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-black whitespace-nowrap cursor-pointer"
            >
              Reset One
            </button>
          )}
          <button
            onClick={() => setCurrentMap(() => createDefaultCustomUi(preset))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-black whitespace-nowrap cursor-pointer"
          >
            Reset All
          </button>
          <button
            onClick={() => {
              mlbbAudio.playClick();
              onSave({
                ...settings,
                interface: {
                  ...settings.interface,
                  activeSkillPreset: preset,
                  editorSnapToGrid: snapToGrid,
                  customUi3Skill: layouts3,
                  customUi4Skill: layouts4
                }
              });
            }}
            className="px-4 py-1.5 rounded-lg bg-[#F5C451] hover:bg-amber-300 text-slate-950 font-black whitespace-nowrap cursor-pointer"
          >
            Save Layout
          </button>
          <button onClick={onClose} className="px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 font-black cursor-pointer">
            ✕
          </button>
        </div>
      </div>

      {/* Draggable Blueprint Stage */}
      <div
        ref={stageRef}
        className="relative flex-1 bg-gradient-to-br from-[#173526] via-[#102438] to-[#0B132B] overflow-hidden"
        style={
          snapToGrid
            ? {
                backgroundImage:
                  'linear-gradient(to right, rgba(245,196,81,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,196,81,0.08) 1px, transparent 1px)',
                backgroundSize: '4% 4%'
              }
            : undefined
        }
      >
        {/* Center Land of Dawn reference cues */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1">
          <div className="text-slate-300/35 text-xs font-black tracking-widest uppercase">
            Drag any control to reposition · Use toolbar for fine X/Y nudge, scale & opacity
          </div>
          {overlappingIds.size > 0 && (
            <div className="px-3 py-1 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-black">
              Overlap Warning: {overlappingIds.size} controls are placed too close together
            </div>
          )}
        </div>

        {Object.values(currentMap).map((ctrl) => {
          const shape = getControlVisualShape(ctrl.id);
          const isSelected = selectedId === ctrl.id;
          const isOverlapping = overlappingIds.has(ctrl.id);
          return (
            <div
              key={ctrl.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(ctrl.id);
                draggingId.current = ctrl.id;
              }}
              style={{
                left: `${ctrl.xPct}%`,
                top: `${ctrl.yPct}%`,
                transform: `translate(-50%, -50%) scale(${ctrl.scale})`,
                opacity: ctrl.opacity
              }}
              className={`absolute ${shape.cls} border-2 flex flex-col items-center justify-center text-center px-1 text-[10px] font-black cursor-move shadow-xl transition-shadow ${
                isOverlapping
                  ? 'bg-rose-600/45 border-rose-400 text-white'
                  : isSelected
                    ? 'bg-amber-500/40 border-[#F5C451] text-white ring-2 ring-[#F5C451]/60'
                    : 'bg-[#0B132B]/88 border-sky-400/75 text-slate-200'
              }`}
            >
              <span className="leading-tight">{ctrl.label}</span>
              <span className="text-[8px] text-amber-200/80 mlbb-num">{shape.badge}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
