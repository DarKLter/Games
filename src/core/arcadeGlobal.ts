import { ArcadeAudio } from './audio';
import { BaseFPSGame } from './BaseFPSGame';
import { BaseGame } from './BaseGame';
import { EmojiCache } from './emojiCache';
import { GAME_LIST } from './instructions';
import { addXp, awardBonusCoins, spendCoins, updateCoinsDisplay } from './runtimeBridge';
import { playerState, tryStorage } from './storage';
import { Difficulty, GameInstance, GameMeta } from './types';

export type ArcadeGameFactory = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  diff: Difficulty,
  lvl: number,
  threeContainer?: HTMLElement | null
) => GameInstance;

export interface ArcadeGlobalNamespace {
  version: string;
  BaseGame: typeof BaseGame;
  BaseFPSGame: typeof BaseFPSGame;
  EmojiCache: typeof EmojiCache;
  Audio: typeof ArcadeAudio;
  GAME_LIST: GameMeta[];
  registerGame: (id: number, factory: ArcadeGameFactory, meta?: GameMeta) => void;
  getRegisteredGameFactory: (id: number) => ArcadeGameFactory | undefined;
  getRegisteredGames: () => number[];
  getState: () => typeof playerState;
  getCoins: () => number;
  setCoins: (coins: number) => void;
  awardBonusCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXp: (amount: number) => void;
  storage: typeof tryStorage;
}

declare global {
  interface Window {
    Arcade?: ArcadeGlobalNamespace;
  }
}

const registeredFactories = new Map<number, ArcadeGameFactory>();

export function registerArcadeGame(id: number, factory: ArcadeGameFactory, meta?: GameMeta): void {
  registeredFactories.set(id, factory);
  if (meta && !GAME_LIST.some((g) => g.id === meta.id)) {
    GAME_LIST.push(meta);
  }
}

export function getRegisteredGameFactory(id: number): ArcadeGameFactory | undefined {
  return registeredFactories.get(id);
}

export function installArcadeGlobal(): ArcadeGlobalNamespace {
  const api: ArcadeGlobalNamespace = {
    version: '2.0-modular',
    BaseGame,
    BaseFPSGame,
    EmojiCache,
    Audio: ArcadeAudio,
    GAME_LIST,
    registerGame: registerArcadeGame,
    getRegisteredGameFactory,
    getRegisteredGames: () => Array.from(registeredFactories.keys()).sort((a, b) => a - b),
    getState: () => playerState,
    getCoins: () => playerState.totalCoins,
    setCoins: (coins: number) => {
      playerState.totalCoins = Math.max(0, Math.floor(coins));
      tryStorage.setItem('tsepang_coins', String(playerState.totalCoins));
      updateCoinsDisplay();
    },
    awardBonusCoins,
    spendCoins,
    addXp,
    storage: tryStorage,
  };

  if (typeof window !== 'undefined') {
    window.Arcade = api;
    const w = window as Window & { ARCADE_BUILD_VERSION?: string };
    if (!w.ARCADE_BUILD_VERSION) {
      w.ARCADE_BUILD_VERSION = 'Tsepang Arcade · Live Modular v1.0 (rev ?v=1 · Offline Ready)';
    }
  }
  return api;
}
