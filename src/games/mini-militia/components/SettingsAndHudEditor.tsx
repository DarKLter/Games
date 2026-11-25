import React, { useRef, useState } from 'react';
import { MiniMilitiaSave, MmHudControlLayout, MmSettingsState } from '../types';
import { createDefaultHudLayout } from '../storage';
import { mmAudio } from '../engine/AudioEngine';

/* ============================================================================
 * INTERACTIVE DRAG-AND-DROP CUSTOM HUD EDITOR (X/Y, Scale 50-180%, Opacity 0-100%)
 * ============================================================================ */
export const CustomHudEditorModal: React.FC<{
  hud: Record<string, MmHudControlLayout>;
  onSaveHud: (next: Record<string, MmHudControlLayout>) => void;
  onClose: () => void;
}> = ({ hud, onSaveHud, onClose }) => {
  const [draft, setDraft] = useState<Record<string, MmHudControlLayout>>(() => ({ ...hud }));
  const [selectedId, setSelectedId] = useState<string>('rightStick');
  const stageRef = useRef<HTMLDivElement | null>(null);
  const draggingId = useRef<string | null>(null);

  const selected = draft[selectedId] ?? Object.values(draft)[0];

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xPct = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(6, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100));
    const id = draggingId.current;
    setDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], xPct: Math.round(xPct), yPct: Math.round(yPct) }
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#141913] text-[#F4F4EC] flex flex-col select-none">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#23272A] border-b-2 border-[#F5A623]">
        <div>
          <h2 className="text-sm font-black uppercase text-[#F5A623]">🎛️ CUSTOM HUD LAYOUT EDITOR</h2>
          <p className="text-[11px] font-mono text-[#C2B280]">
            Drag any control on the battlefield · Adjust Scale (50%–180%) & Opacity (0%–100%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              mmAudio.playClick();
              setDraft(createDefaultHudLayout());
            }}
            className="px-3 py-1 rounded bg-[#2A3320] border border-[#5D7045] text-xs font-mono"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#374151] text-xs font-black uppercase"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              mmAudio.playPickup();
              onSaveHud(draft);
              onClose();
            }}
            className="px-4 py-1 rounded bg-[#F5A623] text-[#181C1F] text-xs font-black uppercase"
          >
            Save HUD Layout
          </button>
        </div>
      </div>

      {/* Live Draggable Battlefield Preview */}
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          draggingId.current = null;
        }}
        className="relative flex-1 bg-gradient-to-b from-[#233229] via-[#1C271B] to-[#131912] overflow-hidden touch-none"
      >
        {/* Grid Guides */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #9CA3AF 1px, transparent 1px), linear-gradient(to bottom, #9CA3AF 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

        {Object.values(draft).map((ctrl) => {
          const isSel = ctrl.id === selectedId;
          const isStick = ctrl.id.includes('Stick');
          return (
            <div
              key={ctrl.id}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                draggingId.current = ctrl.id;
                setSelectedId(ctrl.id);
              }}
              style={{
                left: `${ctrl.xPct}%`,
                top: `${ctrl.yPct}%`,
                opacity: Math.max(0.18, ctrl.opacity),
                transform: `translate(-50%, -50%) scale(${ctrl.scale})`
              }}
              className={`absolute cursor-grab active:cursor-grabbing flex items-center justify-center text-center font-mono text-[10px] font-bold uppercase border-2 shadow-lg transition-colors ${
                isStick ? 'w-24 h-24 rounded-full' : 'px-3 py-2 rounded'
              } ${
                isSel
                  ? 'border-[#F5A623] bg-[#F5A623]/25 text-[#FEF08A] z-20'
                  : 'border-[#C2B280]/70 bg-[#23272A]/80 text-[#F4F4EC] z-10'
              }`}
            >
              {ctrl.label}
            </div>
          );
        })}
      </div>

      {/* Bottom Selected Control Inspector */}
      {selected && (
        <div className="px-4 py-2.5 bg-[#23272A] border-t-2 border-[#4F5D3B] flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="min-w-[170px]">
            <div className="text-[10px] text-[#C2B280] uppercase">Selected Widget</div>
            <div className="font-bold text-[#F5A623]">{selected.label}</div>
          </div>

          <label className="flex items-center gap-2">
            <span className="text-[#C2B280]">Scale ({Math.round(selected.scale * 100)}%)</span>
            <input
              type="range"
              min={50}
              max={180}
              value={Math.round(selected.scale * 100)}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  [selected.id]: { ...prev[selected.id], scale: Number(e.target.value) / 100 }
                }))
              }
              className="w-32 accent-[#F5A623]"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="text-[#C2B280]">Opacity ({Math.round(selected.opacity * 100)}%)</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(selected.opacity * 100)}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  [selected.id]: { ...prev[selected.id], opacity: Number(e.target.value) / 100 }
                }))
              }
              className="w-32 accent-[#F5A623]"
            />
          </label>

          <div className="ml-auto text-[11px] text-[#9CA3AF] tabular-nums">
            X: {selected.xPct}% · Y: {selected.yPct}%
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 5-TAB SETTINGS MODAL (Controls, Video, Audio, Gameplay, Account & Data)
 * ============================================================================ */
export const SettingsModal: React.FC<{
  save: MiniMilitiaSave;
  onUpdateSave: (updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => void;
  onResetAllData: () => void;
  onReplayBootCamp: () => void;
  onClose: () => void;
}> = ({ save, onUpdateSave, onResetAllData, onReplayBootCamp, onClose }) => {
  const [tab, setTab] = useState<'controls' | 'video' | 'audio' | 'gameplay' | 'account'>('controls');
  const [showHudEditor, setShowHudEditor] = useState(false);
  const [exportJson, setExportJson] = useState('');
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const s = save.settings;

  const patchSettings = <K extends keyof MmSettingsState>(section: K, patch: Partial<MmSettingsState[K]>) => {
    onUpdateSave((prev) => {
      const nextSettings = {
        ...prev.settings,
        [section]: { ...prev.settings[section], ...patch }
      };
      if (section === 'audio') mmAudio.setVolumes(nextSettings.audio);
      return { ...prev, settings: nextSettings };
    });
  };

  if (showHudEditor) {
    return (
      <CustomHudEditorModal
        hud={save.customHud}
        onSaveHud={(nextHud) => onUpdateSave((prev) => ({ ...prev, customHud: nextHud }))}
        onClose={() => setShowHudEditor(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded border-2 border-[#5D7045] bg-[#1E2420] text-[#F4F4EC] shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#23272A] border-b border-[#4F5D3B]">
          <h2 className="text-base font-black uppercase text-[#F5A623]">⚙️ TACTICAL SETTINGS</h2>
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'controls' as const, label: 'Controls' },
              { id: 'video' as const, label: 'Video' },
              { id: 'audio' as const, label: 'Audio' },
              { id: 'gameplay' as const, label: 'Gameplay' },
              { id: 'account' as const, label: 'Account' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  mmAudio.playClick();
                  setTab(t.id);
                }}
                className={`px-2.5 py-1 rounded text-xs font-black uppercase border ${
                  tab === t.id
                    ? 'bg-[#F5A623] text-[#181C1F] border-[#FEF08A]'
                    : 'bg-[#2A3320] text-[#C2B280] border-[#4F5D3B]'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-[#D93829] text-xs font-black uppercase ml-1"
            >
              Done
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {/* TAB 1: CONTROLS & SENSITIVITY */}
          {tab === 'controls' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Touch Control Scheme
                  </label>
                  <select
                    value={s.controls.controlScheme}
                    onChange={(e) =>
                      patchSettings('controls', {
                        controlScheme: e.target.value as 'dual_stick' | 'separate_fire'
                      })
                    }
                    className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                  >
                    <option value="dual_stick">Classic Dual-Stick Auto-Fire</option>
                    <option value="separate_fire">Separate Fire Button</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">
                    Joystick Anchor
                  </label>
                  <select
                    value={s.controls.joystickAnchor}
                    onChange={(e) =>
                      patchSettings('controls', { joystickAnchor: e.target.value as 'floating' | 'fixed' })
                    }
                    className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                  >
                    <option value="floating">Floating (Follows Touch)</option>
                    <option value="fixed">Fixed Position</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#C2B280]">Move Sensitivity</span>
                    <span>{s.controls.moveSensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={Math.round(s.controls.moveSensitivity * 100)}
                    onChange={(e) => patchSettings('controls', { moveSensitivity: Number(e.target.value) / 100 })}
                    className="w-full accent-[#F5A623]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#C2B280]">Aim Sensitivity</span>
                    <span>{s.controls.aimSensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={Math.round(s.controls.aimSensitivity * 100)}
                    onChange={(e) => patchSettings('controls', { aimSensitivity: Number(e.target.value) / 100 })}
                    className="w-full accent-[#F5A623]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#C2B280]">Auto-Fire Ring Threshold</span>
                    <span>{s.controls.fireRingThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min={55}
                    max={90}
                    value={s.controls.fireRingThreshold}
                    onChange={(e) => patchSettings('controls', { fireRingThreshold: Number(e.target.value) })}
                    className="w-full accent-[#F5A623]"
                  />
                </div>
              </div>

              <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-2.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Aim Assist</label>
                  <select
                    value={s.controls.aimAssist}
                    onChange={(e) =>
                      patchSettings('controls', { aimAssist: e.target.value as 'off' | 'low' | 'high' })
                    }
                    className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                  >
                    <option value="off">Off</option>
                    <option value="low">Low (Tactical)</option>
                    <option value="high">High (Casual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Crosshair Style</label>
                  <select
                    value={s.controls.crosshairStyle}
                    onChange={(e) =>
                      patchSettings('controls', {
                        crosshairStyle: e.target.value as 'laser_dot' | 'dynamic' | 'minimal'
                      })
                    }
                    className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                  >
                    <option value="laser_dot">Red Laser + Dot</option>
                    <option value="dynamic">Dynamic Spread Crosshair</option>
                    <option value="minimal">Minimal Tactical Reticle</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#C2B280]">Weapon Look-Ahead Camera</span>
                    <span>{s.controls.weaponLookAhead}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.controls.weaponLookAhead}
                    onChange={(e) => patchSettings('controls', { weaponLookAhead: Number(e.target.value) })}
                    className="w-full accent-[#F5A623]"
                  />
                </div>

                <label className="flex items-center justify-between py-1">
                  <span>Auto-Reload Empty Magazine</span>
                  <input
                    type="checkbox"
                    checked={s.controls.autoReload}
                    onChange={(e) => patchSettings('controls', { autoReload: e.target.checked })}
                    className="w-4 h-4 accent-[#F5A623]"
                  />
                </label>

                <label className="flex items-center justify-between py-1">
                  <span>Left-Handed Flip Mode</span>
                  <input
                    type="checkbox"
                    checked={s.controls.leftHanded}
                    onChange={(e) => patchSettings('controls', { leftHanded: e.target.checked })}
                    className="w-4 h-4 accent-[#F5A623]"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    mmAudio.playClick();
                    setShowHudEditor(true);
                  }}
                  className="w-full py-2 rounded bg-[#F5A623] hover:bg-[#FBBF24] text-[#181C1F] font-black uppercase"
                >
                  🎛️ Launch Drag-and-Drop Custom HUD Editor
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO & VISUALS */}
          {tab === 'video' && (
            <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <div>
                  <div className="font-bold">MMC Enhanced Lighting</div>
                  <div className="text-[10px] text-[#C2B280]">Dynamic glows, tracers & shadows</div>
                </div>
                <input
                  type="checkbox"
                  checked={s.video.mmcEnhanced}
                  onChange={(e) => patchSettings('video', { mmcEnhanced: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <div>
                  <div className="font-bold">Screen Shake</div>
                  <div className="text-[10px] text-[#C2B280]">Explosion & heavy weapon recoil camera shake</div>
                </div>
                <input
                  type="checkbox"
                  checked={s.video.screenShake}
                  onChange={(e) => patchSettings('video', { screenShake: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <span>Show FPS & Ping Counter</span>
                <input
                  type="checkbox"
                  checked={s.video.showFpsPing}
                  onChange={(e) => patchSettings('video', { showFpsPing: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <span>Show Floating Soldier Nametags</span>
                <input
                  type="checkbox"
                  checked={s.video.showNametags}
                  onChange={(e) => patchSettings('video', { showNametags: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Hit Effects</label>
                <select
                  value={s.video.hitEffects}
                  onChange={(e) =>
                    patchSettings('video', { hitEffects: e.target.value as 'red' | 'confetti' | 'off' })
                  }
                  className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                >
                  <option value="red">Classic Cartoon Splash</option>
                  <option value="confetti">Party Confetti</option>
                  <option value="off">Minimal Sparks Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Target Frame Rate</label>
                <select
                  value={s.video.targetFps}
                  onChange={(e) => patchSettings('video', { targetFps: Number(e.target.value) as 30 | 60 | 120 })}
                  className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                >
                  <option value={30}>30 FPS (Battery Saver)</option>
                  <option value={60}>60 FPS (Standard)</option>
                  <option value={120}>120 FPS (Unlocked)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIO */}
          {tab === 'audio' && (
            <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3">
              {[
                { key: 'master' as const, label: 'Master Volume' },
                { key: 'sfx' as const, label: 'Gunfire, Explosions & Jetpack SFX' },
                { key: 'music' as const, label: 'Menu & Ambient Track' },
                { key: 'voice' as const, label: 'Sarge Voice & Killstreak Chimes' }
              ].map((sl) => (
                <div key={sl.key}>
                  <div className="flex justify-between font-mono text-[11px] mb-0.5">
                    <span className="text-[#C2B280]">{sl.label}</span>
                    <span className="tabular-nums">{s.audio[sl.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={s.audio[sl.key]}
                    onChange={(e) => patchSettings('audio', { [sl.key]: Number(e.target.value) })}
                    className="w-full accent-[#F5A623]"
                  />
                </div>
              ))}
              <label className="flex items-center justify-between pt-2 border-t border-[#3E4A2E]">
                <span className="font-bold">Mute All Audio</span>
                <input
                  type="checkbox"
                  checked={s.audio.muted}
                  onChange={(e) => patchSettings('audio', { muted: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>
            </div>
          )}

          {/* TAB 4: GAMEPLAY & NETWORK */}
          {tab === 'gameplay' && (
            <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#C2B280] mb-1">Preferred Region</label>
                <select
                  value={s.gameplay.region}
                  onChange={(e) =>
                    patchSettings('gameplay', {
                      region: e.target.value as 'auto' | 'asia' | 'europe' | 'na' | 'sa'
                    })
                  }
                  className="w-full px-2 py-1.5 rounded bg-[#181C1F] border border-[#5D7045] font-mono"
                >
                  <option value="auto">Auto (Lowest Ping)</option>
                  <option value="asia">Asia</option>
                  <option value="europe">Europe</option>
                  <option value="na">North America</option>
                  <option value="sa">South America</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <div>
                  <div className="font-bold">Classic V4 Mode Default</div>
                  <div className="text-[10px] text-[#C2B280]">Start Pistol + Machete & scavenge arena pads</div>
                </div>
                <input
                  type="checkbox"
                  checked={s.gameplay.classicV4Default}
                  onChange={(e) => patchSettings('gameplay', { classicV4Default: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <span>Auto-Pickup Health & Ammo Crates</span>
                <input
                  type="checkbox"
                  checked={s.gameplay.autoPickupItems}
                  onChange={(e) => patchSettings('gameplay', { autoPickupItems: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-[#181C1F] border border-[#3E4A2E]">
                <span>Off-Screen Enemy Directional Arrows</span>
                <input
                  type="checkbox"
                  checked={s.gameplay.showOffscreenArrows}
                  onChange={(e) => patchSettings('gameplay', { showOffscreenArrows: e.target.checked })}
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>
            </div>
          )}

          {/* TAB 5: ACCOUNT & DATA */}
          {tab === 'account' && (
            <div className="p-3 rounded bg-[#23272A] border border-[#4F5D3B] space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    mmAudio.playKillstreak();
                    onUpdateSave((prev) => ({ ...prev, proPackUnlocked: !prev.proPackUnlocked }));
                  }}
                  className="px-3 py-1.5 rounded bg-[#2A3320] border border-[#F5A623] text-[#F5A623] font-black uppercase"
                >
                  {save.proPackUnlocked ? '✓ Pro Pack Active (Toggle)' : '⭐ Activate Pro Pack Free'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplayBootCamp();
                  }}
                  className="px-3 py-1.5 rounded bg-[#2A3320] border border-[#5D7045] font-black uppercase"
                >
                  🎖️ Replay Boot Camp
                </button>
                <button
                  type="button"
                  onClick={() => setExportJson(JSON.stringify(save))}
                  className="px-3 py-1.5 rounded bg-[#181C1F] border border-[#525D64] font-mono"
                >
                  Export Save JSON
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#C2B280] mb-1">
                  Export / Import Profile JSON
                </label>
                <textarea
                  rows={3}
                  value={exportJson}
                  onChange={(e) => setExportJson(e.target.value)}
                  placeholder="Click Export Save JSON or paste backup JSON here to import..."
                  className="w-full p-2 rounded bg-[#141719] border border-[#3E4A2E] font-mono text-[10px]"
                />
                <div className="flex items-center justify-between mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(exportJson) as MiniMilitiaSave;
                        if (!parsed.callsign || !parsed.stats) throw new Error('Invalid');
                        onUpdateSave(() => parsed);
                        setImportMsg('✓ Profile restored successfully!');
                      } catch {
                        setImportMsg('Invalid Mini Militia save JSON.');
                      }
                    }}
                    className="px-3 py-1 rounded bg-[#22C55E] text-[#0F172A] font-black uppercase"
                  >
                    Import JSON
                  </button>
                  {importMsg && <span className="font-mono text-[#F5A623]">{importMsg}</span>}
                </div>
              </div>

              <div className="pt-2 border-t border-[#3E4A2E] flex items-center justify-between">
                <span className="text-[#F87171] font-mono">Danger Zone: Reset career stats & unlocks</span>
                {confirmReset ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onResetAllData();
                        setConfirmReset(false);
                      }}
                      className="px-3 py-1 rounded bg-[#D93829] font-black uppercase"
                    >
                      Confirm Wipe
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-1 rounded bg-[#374151] font-mono"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="px-3 py-1 rounded bg-[#7F1D1D] hover:bg-[#B91C1C] font-black uppercase"
                  >
                    Reset All Data
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
