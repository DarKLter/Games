export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type BgmTheme = 'arcade' | 'action' | 'puzzle' | 'chill' | 'garden' | 'war' | 'tactical';

export interface DifficultyScaler {
  speedMult: number;
  spawnMult: number;
}

export const difficultyScalers: Record<Difficulty, DifficultyScaler> = {
  easy: { speedMult: 0.85, spawnMult: 0.85 },
  medium: { speedMult: 1.0, spawnMult: 1.0 },
  hard: { speedMult: 1.25, spawnMult: 1.2 },
  extreme: { speedMult: 1.5, spawnMult: 1.4 }
};

export interface PresetButtonDef {
  actionKey: string;
  label: string;
  icon: string;
  defaultX?: number;
  defaultY?: number;
  holdable?: boolean;
}

export interface GameInstance {
  level: number;
  diff: Difficulty;
  score: number;
  lives: number;
  maxLives: number;
  isPaused: boolean;
  gameOver: boolean;
  isRunning?: boolean;
  animId?: number | null;
  lastTime?: number;
  lastClockTick?: number;
  mode?: string;
  start(): void;
  stop(): void;
  pause?(): void;
  resume?(): void;
  releaseInputs?(): void;
  resize?(): void;
  draw?(): void;
  loop?(time: number): void;
  onPointerDown?(x: number, y: number, pointerType?: string): void;
  onPointerMove?(x: number, y: number, pointerType?: string): void;
  onPointerUp?(x?: number, y?: number, pointerType?: string): void;
  handlePointerMove?(x: number, y: number): void;
  handleFire?(x: number, y: number, pointerType?: string): void;
  handleSlice?(x: number, y: number): void;
  handleClick?(x: number, y: number): void;
  handleKey?(key: string): void;
  jump?(): void;
  flap?(): void;
  slide?(): void;
  attack?(): void;
  setSlide?(on: boolean): void;
  moveLeft?(): void;
  moveRight?(): void;
  setSteerLeft?(down: boolean): void;
  setSteerRight?(down: boolean): void;
  setMoveDir?(dx: number, dy: number): void;
  setMove?(dir: number): void;
  setJetpack?(on: boolean): void;
  throwGrenade?(): void;
  setBoost?(on: boolean): void;
  setSteer?(dir: number): void;
  reload?(): void;
  toggleScope?(): void;
  stepHistory?(delta: number): void;
  setStance?(stance: string): void;
  trainUnit?(unitIdx: number): void;
  useHint?(): void;
  triggerAction?(actionKey: string, pressed: boolean): void;
  beginSkillAim?(actionKey: string, mode?: 'drag' | 'cursor'): boolean;
  updateSkillAimDrag?(normX: number, normY: number, cancelled?: boolean): void;
  updateSkillAimScreen?(clientX: number, clientY: number, cancelled?: boolean): void;
  commitSkillAim?(quickTap?: boolean): void;
  cancelSkillAim?(): void;
  isSkillAiming?(): boolean;
  triggerEmote?(slotIndex: number): boolean;
  buyEquipment?(itemId: string): boolean;
  sellEquipment?(slotIdx: number): boolean;
  buyBlessing?(blessingId: string): boolean;
  quickBuy?(itemId?: string): boolean;
  setPrioritizedItem?(itemId: string | null): void;
  setBuildPreset?(presetIdx: number): void;
  sendMapPing?(kind: 'turtle' | 'lord' | 'gather' | 'retreat' | 'lane', nx: number, nz: number, customLabel?: string): void;
  activateFlyingCloud?(): void;
  buySenkiItem?(itemId: 'ramen' | 'pill' | 'speed_tag'): boolean;
  useStormNinjaTool?(slotIdx: 0 | 1 | 2 | 3): boolean;
  switchStormLeader?(): void;
  toggleIconPassing?(): void;
  triggerIconPass?(mateIndex: number): void;
  callHoopsPlay?(playId?: string): void;
  setHoopsCoachScheme?(scheme: string): void;
  activateHoopsTakeover?(): void;
  toggleHoopsCamera?(): void;
  simHoopsToEnd?(): void;
  uses3DViewport?: boolean;
}

export type GameCategory = 'action' | 'racing' | 'shooter' | 'puzzle' | 'strategy' | 'sports' | 'arcade';

export interface GameMeta {
  id: number;
  icon: string;
  title: string;
  instructTitle: string;
  text: string;
  bgmTheme: BgmTheme;
  category?: GameCategory;
  preferredOrientation?: 'landscape' | 'portrait' | 'any';
  isDomGame?: boolean;
  is3DGame?: boolean;
  showHealthBar?: boolean;
  actionBtn?: string;
  jumpBtn?: string;
  steerLeftLabel?: string;
  steerRightLabel?: string;
  showSteer?: boolean;
  showActionCustomizer?: boolean;
  showSteerCustomizer?: boolean;
  presetButtons?: PresetButtonDef[];
}
