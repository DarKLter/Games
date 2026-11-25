import { tryStorage } from './storage';
import { PresetButtonDef } from './types';

export type ControlMode = 'buttons' | 'analog';

export interface ControlPosition {
  xPct: number; // percentage from left edge (5..95)
  yPx: number; // px from bottom edge (10..360)
  scale: number; // 0.5..1.8
  visible: boolean;
}

export interface CustomExtraButton extends ControlPosition {
  id: string;
  actionKey: string;
  label: string;
  icon: string;
  holdable?: boolean;
}

export interface GameControlLayout {
  controlMode: ControlMode;
  analog: ControlPosition;
  action: ControlPosition;
  jump: ControlPosition;
  steerLeft: ControlPosition;
  steerRight: ControlPosition;
  extras: CustomExtraButton[];
}

const STORAGE_KEY = 'tsepang_ctrl_layouts_v1';

export const GLOBAL_PRESET_BUTTONS: PresetButtonDef[] = [
  { actionKey: 'action', label: 'ACTION', icon: '⚡', defaultX: 84, defaultY: 112 },
  { actionKey: 'jump', label: 'JUMP', icon: '⬆️', defaultX: 88, defaultY: 190 },
  { actionKey: 'left', label: 'LEFT', icon: '◀️', defaultX: 12, defaultY: 105, holdable: true },
  { actionKey: 'right', label: 'RIGHT', icon: '▶️', defaultX: 28, defaultY: 105, holdable: true },
  { actionKey: 'moveUp', label: 'UP/RUN', icon: '🔼', defaultX: 20, defaultY: 165, holdable: true },
  { actionKey: 'down', label: 'DOWN', icon: '🔽', defaultX: 20, defaultY: 42, holdable: true },
  { actionKey: 'attack', label: 'ATTACK', icon: '⚔️', defaultX: 84, defaultY: 105 },
  { actionKey: 'fire', label: 'FIRE', icon: '🔫', defaultX: 85, defaultY: 115, holdable: true },
  { actionKey: 'scope', label: 'SCOPE', icon: '🔭', defaultX: 70, defaultY: 185 },
  { actionKey: 'reload', label: 'RELOAD', icon: '🔄', defaultX: 70, defaultY: 96 },
  { actionKey: 'grenade', label: 'BOMB', icon: '💣', defaultX: 88, defaultY: 196 },
  { actionKey: 'boost', label: 'NITRO', icon: '🔥', defaultX: 86, defaultY: 118, holdable: true },
  { actionKey: 'drift', label: 'DRIFT', icon: '💨', defaultX: 72, defaultY: 42, holdable: true },
  { actionKey: 'skill1', label: 'SKILL 1', icon: '🗡️', defaultX: 78, defaultY: 38 },
  { actionKey: 'skill2', label: 'SKILL 2', icon: '☄️', defaultX: 80, defaultY: 118 },
  { actionKey: 'skill3', label: 'ULTI', icon: '🌟', defaultX: 90, defaultY: 186 },
  { actionKey: 'skill4', label: 'SKILL 4', icon: '🌀', defaultX: 71, defaultY: 196 },
  { actionKey: 'regen', label: 'REGEN', icon: '💚', defaultX: 66, defaultY: 28 },
  { actionKey: 'recall', label: 'RECALL', icon: '🌀', defaultX: 56, defaultY: 28 },
  { actionKey: 'heal', label: 'MEDKIT', icon: '🩹', defaultX: 72, defaultY: 46 },
  { actionKey: 'spell1', label: 'RAGE', icon: '🎺', defaultX: 86, defaultY: 130 },
  { actionKey: 'spell2', label: 'GOLD!', icon: '💰', defaultX: 86, defaultY: 196 },
  { actionKey: 'hint', label: 'HINT', icon: '💡', defaultX: 86, defaultY: 112 },
  { actionKey: 'pass', label: 'PASS', icon: '🏀', defaultX: 74, defaultY: 184 },
  { actionKey: 'steal', label: 'STEAL', icon: '🖐️', defaultX: 72, defaultY: 102 },
  { actionKey: 'sprint', label: 'SPRINT', icon: '⚡', defaultX: 88, defaultY: 202, holdable: true },
  { actionKey: 'vehicle', label: 'CAR', icon: '🚗', defaultX: 60, defaultY: 112 },
  { actionKey: 'swapWeapon', label: 'GUN', icon: '🔁', defaultX: 60, defaultY: 180 },
  { actionKey: 'flare', label: 'FLARE', icon: '🚨', defaultX: 60, defaultY: 46 },
  { actionKey: 'spell', label: 'SPELL', icon: '✨', defaultX: 68, defaultY: 108 },
  { actionKey: 'itemActive', label: 'ITEM', icon: '👑', defaultX: 60, defaultY: 162 },
  { actionKey: 'skill5', label: 'OUGI 2', icon: '🔥', defaultX: 82, defaultY: 248 },
  { actionKey: 'sub', label: 'SUB LOG', icon: '🪵', defaultX: 68, defaultY: 108 },
  { actionKey: 'chakra', label: 'CHAKRA', icon: '💙', defaultX: 66, defaultY: 28, holdable: true },
  { actionKey: 'guard', label: 'GUARD', icon: '🛡️', defaultX: 56, defaultY: 28, holdable: true },
  { actionKey: 'support', label: 'ASSIST', icon: '🤝', defaultX: 60, defaultY: 162 }
];

export function getDefaultGameLayout(gameId: number): GameControlLayout {
  const defaultAnalog: ControlPosition = { xPct: 16, yPx: 32, scale: 1.0, visible: true };
  if (gameId === 7) {
    // Tactical Ops FPS: scope/reload plus tap-to-shoot on canvas
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 86, yPx: 44, scale: 1.0, visible: true },
      jump: { xPct: 86, yPx: 112, scale: 0.9, visible: false },
      steerLeft: { xPct: 8, yPx: 30, scale: 1.0, visible: false },
      steerRight: { xPct: 92, yPx: 30, scale: 1.0, visible: false },
      extras: [
        { id: 'fps_reload', actionKey: 'reload', label: 'RELOAD', icon: '🔄', xPct: 86, yPx: 132, scale: 0.92, visible: true }
      ]
    };
  }
  if (gameId === 22) {
    // Mini Militia: dedicated left/right, fire, jetpack & grenade controls
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 88, yPx: 118, scale: 0.98, visible: true },
      jump: { xPct: 73, yPx: 146, scale: 0.9, visible: true },
      steerLeft: { xPct: 10, yPx: 32, scale: 0.95, visible: true },
      steerRight: { xPct: 29, yPx: 32, scale: 0.95, visible: true },
      extras: [
        { id: 'mm_fire', actionKey: 'fire', label: 'FIRE', icon: '🔫', xPct: 86, yPx: 34, scale: 1.04, visible: true, holdable: true }
      ]
    };
  }
  if (gameId === 24) {
    // Battle Royale 3D
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 86, yPx: 112, scale: 1.05, visible: true },
      jump: { xPct: 88, yPx: 196, scale: 0.95, visible: true },
      steerLeft: { xPct: 11, yPx: 34, scale: 0.9, visible: true },
      steerRight: { xPct: 32, yPx: 34, scale: 0.9, visible: true },
      extras: [
        { id: 'br_fwd', actionKey: 'moveUp', label: 'RUN', icon: '⬆️', xPct: 21, yPx: 114, scale: 0.95, visible: true, holdable: true },
        { id: 'br_scope', actionKey: 'scope', label: 'SCOPE', icon: '🔭', xPct: 72, yPx: 162, scale: 0.9, visible: true },
        { id: 'br_reload', actionKey: 'reload', label: 'RELOAD', icon: '🔄', xPct: 72, yPx: 76, scale: 0.9, visible: true },
        { id: 'br_veh', actionKey: 'vehicle', label: 'BUGGY', icon: '🚗', xPct: 60, yPx: 120, scale: 0.86, visible: true },
        { id: 'br_swap', actionKey: 'swapWeapon', label: 'GUN', icon: '🔁', xPct: 60, yPx: 194, scale: 0.86, visible: true }
      ]
    };
  }
  if (gameId === 25) {
    // Legends Arena 3D — Classic Mobile Legends Radial Arc
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 89, yPx: 30, scale: 1.12, visible: true },
      jump: { xPct: 78, yPx: 38, scale: 0.94, visible: true },
      steerLeft: { xPct: 11, yPx: 34, scale: 0.92, visible: true },
      steerRight: { xPct: 32, yPx: 34, scale: 0.92, visible: true },
      extras: [
        { id: 'ml_s2', actionKey: 'skill2', label: 'SKILL 2', icon: '☄️', xPct: 80, yPx: 118, scale: 0.94, visible: true },
        { id: 'ml_ult', actionKey: 'skill3', label: 'ULTI', icon: '🌟', xPct: 90, yPx: 186, scale: 1.0, visible: true },
        { id: 'ml_s4', actionKey: 'skill4', label: 'SKILL 4', icon: '🌀', xPct: 71, yPx: 196, scale: 0.9, visible: true },
        { id: 'ml_spell', actionKey: 'spell', label: 'SPELL', icon: '✨', xPct: 68, yPx: 108, scale: 0.86, visible: true },
        { id: 'ml_item', actionKey: 'itemActive', label: 'ITEM', icon: '👑', xPct: 60, yPx: 162, scale: 0.86, visible: true },
        { id: 'ml_regen', actionKey: 'regen', label: 'REGEN', icon: '💚', xPct: 66, yPx: 28, scale: 0.82, visible: true },
        { id: 'ml_rec', actionKey: 'recall', label: 'RECALL', icon: '🌀', xPct: 56, yPx: 28, scale: 0.82, visible: true }
      ]
    };
  }
  if (gameId === 26) {
    // Asphalt Nitro 3D
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 84, yPx: 120, scale: 1.0, visible: true },
      jump: { xPct: 86, yPx: 200, scale: 0.95, visible: true },
      steerLeft: { xPct: 11, yPx: 34, scale: 1.0, visible: true },
      steerRight: { xPct: 89, yPx: 34, scale: 1.0, visible: true },
      extras: [
        { id: 'an_drift', actionKey: 'drift', label: 'DRIFT', icon: '💨', xPct: 62, yPx: 108, scale: 0.92, visible: true, holdable: true }
      ]
    };
  }
  if (gameId === 27) {
    // Hoops 2K26 3D
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 87, yPx: 102, scale: 1.02, visible: true },
      jump: { xPct: 73, yPx: 176, scale: 0.94, visible: true },
      steerLeft: { xPct: 9, yPx: 66, scale: 0.88, visible: true },
      steerRight: { xPct: 31, yPx: 66, scale: 0.88, visible: true },
      extras: [
        { id: 'bk_up', actionKey: 'moveUp', label: 'UP', icon: '🔼', xPct: 20, yPx: 132, scale: 0.86, visible: true, holdable: true },
        { id: 'bk_dn', actionKey: 'down', label: 'DOWN', icon: '🔽', xPct: 20, yPx: 14, scale: 0.86, visible: true, holdable: true },
        { id: 'bk_steal', actionKey: 'steal', label: 'STEAL', icon: '🖐️', xPct: 68, yPx: 88, scale: 0.9, visible: true },
        { id: 'bk_sprint', actionKey: 'sprint', label: 'SPRINT', icon: '⚡', xPct: 88, yPx: 196, scale: 0.92, visible: true, holdable: true }
      ]
    };
  }
  if (gameId === 28) {
    // Naruto: Senki & Ultimate Ninja Storm — Shinobi Jutsu & Storm Arc
    return {
      controlMode: 'buttons',
      analog: defaultAnalog,
      action: { xPct: 89, yPx: 30, scale: 1.12, visible: true },
      jump: { xPct: 78, yPx: 38, scale: 0.94, visible: true },
      steerLeft: { xPct: 11, yPx: 34, scale: 0.92, visible: true },
      steerRight: { xPct: 32, yPx: 34, scale: 0.92, visible: true },
      extras: [
        { id: 'ns_s2', actionKey: 'skill2', label: 'JUTSU 2', icon: '🌀', xPct: 80, yPx: 108, scale: 0.92, visible: true },
        { id: 'ns_s3', actionKey: 'skill3', label: 'JUTSU 3', icon: '⚡', xPct: 90, yPx: 158, scale: 0.92, visible: true },
        { id: 'ns_ougi1', actionKey: 'skill4', label: 'OUGI 1', icon: '🌟', xPct: 70, yPx: 166, scale: 0.9, visible: true },
        { id: 'ns_ougi2', actionKey: 'skill5', label: 'OUGI 2', icon: '🔥', xPct: 80, yPx: 210, scale: 0.9, visible: true },
        { id: 'ns_sub', actionKey: 'sub', label: 'SUB LOG', icon: '🪵', xPct: 68, yPx: 98, scale: 0.86, visible: true },
        { id: 'ns_sup', actionKey: 'support', label: 'ASSIST', icon: '🤝', xPct: 58, yPx: 148, scale: 0.84, visible: true },
        { id: 'ns_chk', actionKey: 'chakra', label: 'CHAKRA', icon: '💙', xPct: 66, yPx: 26, scale: 0.84, visible: true, holdable: true },
        { id: 'ns_grd', actionKey: 'guard', label: 'GUARD', icon: '🛡️', xPct: 56, yPx: 26, scale: 0.84, visible: true, holdable: true }
      ]
    };
  }

  return {
    controlMode: 'buttons',
    analog: defaultAnalog,
    action: { xPct: 50, yPx: 30, scale: 1.0, visible: true },
    jump: { xPct: 86, yPx: 112, scale: 1.0, visible: true },
    steerLeft: { xPct: 8, yPx: 30, scale: 1.0, visible: true },
    steerRight: { xPct: 92, yPx: 30, scale: 1.0, visible: true },
    extras: []
  };
}

let cachedLayouts: Record<number, GameControlLayout> | null = null;

function readAllLayouts(): Record<number, GameControlLayout> {
  if (cachedLayouts) return cachedLayouts;
  try {
    const raw = tryStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        cachedLayouts = parsed;
        return cachedLayouts!;
      }
    }
  } catch {
    // ignore storage read error
  }
  cachedLayouts = {};
  return cachedLayouts;
}

function writeAllLayouts(map: Record<number, GameControlLayout>): void {
  cachedLayouts = map;
  tryStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadGameLayout(gameId: number): GameControlLayout {
  const all = readAllLayouts();
  const saved = all[gameId];
  const def = getDefaultGameLayout(gameId);
  if (!saved) return cloneLayout(def);
  const extras = Array.isArray(saved.extras) ? saved.extras.map((e) => ({ ...e })) : def.extras.map((e) => ({ ...e }));
  if (
    gameId === 25 &&
    (!extras.some((b) => b.actionKey === 'regen') ||
      !extras.some((b) => b.actionKey === 'skill4') ||
      !extras.some((b) => b.actionKey === 'itemActive'))
  ) {
    // Migrate legacy MOBA layout cleanly to the Mobile Legends radial arc (S1-S4, Regen, Recall, Spell, ItemActive)
    return cloneLayout(def);
  }
  if (gameId === 28 && extras.some((b) => b.id === 'ns_ougi2' && b.yPx >= 245)) {
    // Keep Naruto Storm/Senki default cluster clear of top-right settings button on compact landscape viewports
    return cloneLayout(def);
  }
  if (gameId === 22 && !extras.some((b) => b.actionKey === 'fire')) {
    return cloneLayout(def);
  }
  if (gameId === 7 && !extras.some((b) => b.actionKey === 'reload')) {
    return cloneLayout(def);
  }
  return {
    controlMode: saved.controlMode === 'analog' ? 'analog' : 'buttons',
    analog: { ...def.analog, ...saved.analog },
    action: { ...def.action, ...saved.action },
    jump: { ...def.jump, ...saved.jump },
    steerLeft: { ...def.steerLeft, ...saved.steerLeft },
    steerRight: { ...def.steerRight, ...saved.steerRight },
    extras
  };
}

export function saveGameLayout(gameId: number, layout: GameControlLayout): void {
  const all = readAllLayouts();
  all[gameId] = cloneLayout(layout);
  writeAllLayouts(all);
}

export function resetGameLayout(gameId: number): GameControlLayout {
  const all = readAllLayouts();
  delete all[gameId];
  writeAllLayouts(all);
  return getDefaultGameLayout(gameId);
}

export function addPresetButtonToLayout(layout: GameControlLayout, preset: PresetButtonDef): GameControlLayout {
  const idxOffset = (layout.extras.length % 4) * 6;
  const next: CustomExtraButton = {
    id: `btn_${preset.actionKey}_${Date.now().toString(36)}_${Math.floor(Math.random() * 99)}`,
    actionKey: preset.actionKey,
    label: preset.label,
    icon: preset.icon,
    xPct: Math.min(92, Math.max(10, (preset.defaultX ?? 75) - idxOffset)),
    yPx: Math.min(300, Math.max(24, (preset.defaultY ?? 125) + idxOffset)),
    scale: 0.95,
    visible: true,
    holdable: preset.holdable
  };
  return {
    ...layout,
    extras: [...layout.extras, next]
  };
}

export function removeExtraButtonFromLayout(layout: GameControlLayout, buttonId: string): GameControlLayout {
  return {
    ...layout,
    extras: layout.extras.filter((b) => b.id !== buttonId)
  };
}

export function clampControlPos(xPct: number, yPx: number, scale: number): Pick<ControlPosition, 'xPct' | 'yPx' | 'scale'> {
  return {
    xPct: Math.round(Math.max(6, Math.min(94, xPct))),
    yPx: Math.round(Math.max(12, Math.min(280, yPx))),
    scale: Math.round(Math.max(0.5, Math.min(1.8, scale)) * 10) / 10
  };
}

function cloneLayout(l: GameControlLayout): GameControlLayout {
  return {
    controlMode: l.controlMode,
    analog: { ...l.analog },
    action: { ...l.action },
    jump: { ...l.jump },
    steerLeft: { ...l.steerLeft },
    steerRight: { ...l.steerRight },
    extras: l.extras.map((e) => ({ ...e }))
  };
}
