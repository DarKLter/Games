import { getRegisteredGameFactory, registerArcadeGame } from './arcadeGlobal';
import { playerState } from './storage';
import { Difficulty, GameInstance } from './types';
import { AngrySlingshot } from '../games/angry-slingshot/AngrySlingshot';
import { AsphaltNitro3D } from '../games/asphalt-nitro-3d/AsphaltNitro3D';
import { BattleRoyale3D } from '../games/battle-royale-3d/BattleRoyale3D';
import { BlockBlastGame } from '../games/block-blast/BlockBlast';
import { CandyClashGame } from '../games/candy-clash/CandyClash';
import { CatchButterflies } from '../games/catch-butterflies/CatchButterflies';
import { CodeHeroGame } from '../games/code-hero/CodeHero';
import { CookingFrenzy } from '../games/cooking-frenzy/CookingFrenzy';
import { Crossword } from '../games/crossword/Crossword';
import { EightBallPool } from '../games/eight-ball-pool/EightBallPool';
import { FlappyBird } from '../games/flappy-bird/FlappyBird';
import { FruitSlash } from '../games/fruit-slash/FruitSlash';
import { HighwayRacer } from '../games/highway-racer/HighwayRacer';
import { HillClimb } from '../games/hill-climb/HillClimb';
import { Hoops2K26_3D } from '../games/hoops-2k26/Hoops2K26_3D';
import { HungryShark } from '../games/hungry-shark/HungryShark';
import { LegendsArena3D } from '../games/legends-arena/LegendsArena3D';
import { MiniMilitia } from '../games/mini-militia/MiniMilitia';
import { NarutoSenkiStormGame } from '../games/naruto-senki-storm/NarutoSenkiStorm';
import { PlantVsZombie } from '../games/plant-vs-zombie/PlantVsZombie';
import { StickmanBrawl } from '../games/stickman-brawl/StickmanBrawl';
import { StickWarLegacy } from '../games/stick-war-legacy/StickWarLegacy';
import { StockfishChessGame } from '../games/stockfish-chess/StockfishChess';
import { SubwaySurfersGame } from '../games/subway-surfers/SubwaySurfers';
import { Sudoku } from '../games/sudoku/Sudoku';
import { SuperRunner } from '../games/super-runner/SuperRunner';
import { TacticalOpsFPS } from '../games/tactical-ops-fps/TacticalOpsFPS';
import { VectorParkour } from '../games/vector-parkour/VectorParkour';
import { WormIo } from '../games/worm-io/WormIo';

let builtInsRegistered = false;

export function registerBuiltInGames(): void {
  if (builtInsRegistered) return;
  builtInsRegistered = true;
  registerArcadeGame(0, (c, ctx, d, l) => new SuperRunner(c, ctx, d, l, 0));
  registerArcadeGame(1, (c, ctx, d, l) => new FlappyBird(c, ctx, d, l, 1));
  registerArcadeGame(2, (c, ctx, d, l) => new FruitSlash(c, ctx, d, l, 2));
  registerArcadeGame(3, (c, ctx, d, l) => new CatchButterflies(c, ctx, d, l, 3));
  registerArcadeGame(4, (_c, _ctx, d, l) => new CodeHeroGame(l, d));
  registerArcadeGame(5, (c, ctx, d, l) => new HighwayRacer(c, ctx, d, l, 5));
  registerArcadeGame(6, (_c, _ctx, d, l) => new StockfishChessGame(l, d));
  registerArcadeGame(7, (c, ctx, d, l) => new TacticalOpsFPS(c, ctx, d, l, 7));
  registerArcadeGame(8, (c, ctx, d, l) => new CandyClashGame(c, ctx, d, l, 8));
  registerArcadeGame(9, (c, ctx, d, l) => new BlockBlastGame(c, ctx, d, l, 9));
  registerArcadeGame(10, (c, ctx, d, l) => new SubwaySurfersGame(c, ctx, d, l, 10));
  registerArcadeGame(11, (c, ctx, d, l) => new HillClimb(c, ctx, d, l, 11));
  registerArcadeGame(12, (c, ctx, d, l) => new PlantVsZombie(c, ctx, d, l, 12));
  registerArcadeGame(13, (c, ctx, d, l) => new AngrySlingshot(c, ctx, d, l, 13));
  registerArcadeGame(14, (c, ctx, d, l) => new CookingFrenzy(c, ctx, d, l, 14));
  registerArcadeGame(15, (c, ctx, d, l) => new HungryShark(c, ctx, d, l, 15));
  registerArcadeGame(16, (c, ctx, d, l) => new WormIo(c, ctx, d, l, 16));
  registerArcadeGame(17, (c, ctx, d, l) => new StickmanBrawl(c, ctx, d, l, 17));
  registerArcadeGame(18, (c, ctx, d, l) => new EightBallPool(c, ctx, d, l, 18));
  registerArcadeGame(19, (c, ctx, d, l) => new VectorParkour(c, ctx, d, l, 19));
  registerArcadeGame(20, (_c, _ctx, d, l) => new Crossword(l, d));
  registerArcadeGame(21, (_c, _ctx, d, l) => new Sudoku(l, d));
  registerArcadeGame(22, (c, ctx, d, l) => new MiniMilitia(c, ctx, d, l, 22));
  registerArcadeGame(23, (c, ctx, d, l) => new StickWarLegacy(c, ctx, d, l, 23));
  registerArcadeGame(24, (_c, _ctx, d, l, t) => new BattleRoyale3D(t || document.body, d, l, 24));
  registerArcadeGame(
    25,
    (_c, _ctx, d, l, t) =>
      new LegendsArena3D(t || document.body, d, l, 25, playerState.mobaTrialHeroId ?? playerState.selectedMobaHero)
  );
  registerArcadeGame(
    26,
    (_c, _ctx, d, l, t) => new AsphaltNitro3D(t || document.body, d, l, 26, playerState.selectedAsphaltCar)
  );
  registerArcadeGame(
    27,
    (_c, _ctx, d, l, t) => new Hoops2K26_3D(t || document.body, d, l, 27, playerState.selectedBasketballTeam)
  );
  registerArcadeGame(
    28,
    (c, ctx, d, l, t) => new NarutoSenkiStormGame(c, ctx, t || document.body, d, l, 28)
  );
}

registerBuiltInGames();

export function createGameByIndex(
  index: number,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  diff: Difficulty,
  lvl: number,
  threeContainer?: HTMLElement | null
): GameInstance {
  registerBuiltInGames();
  const factory = getRegisteredGameFactory(index) || getRegisteredGameFactory(0)!;
  return factory(canvas, ctx, diff, lvl, threeContainer);
}
