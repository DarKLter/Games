(function(ArcadeMod){
// === MODULE: src/core/registry ===
ArcadeMod.define("src/core/registry", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get createGameByIndex () {
        return createGameByIndex;
    },
    get registerBuiltInGames () {
        return registerBuiltInGames;
    }
});
var _arcadeGlobal = require("./arcadeGlobal");
var _storage = require("./storage");
var _AngrySlingshot = require("../games/angry-slingshot/AngrySlingshot");
var _AsphaltNitro3D = require("../games/asphalt-nitro-3d/AsphaltNitro3D");
var _BattleRoyale3D = require("../games/battle-royale-3d/BattleRoyale3D");
var _BlockBlast = require("../games/block-blast/BlockBlast");
var _CandyClash = require("../games/candy-clash/CandyClash");
var _CatchButterflies = require("../games/catch-butterflies/CatchButterflies");
var _CodeHero = require("../games/code-hero/CodeHero");
var _CookingFrenzy = require("../games/cooking-frenzy/CookingFrenzy");
var _Crossword = require("../games/crossword/Crossword");
var _EightBallPool = require("../games/eight-ball-pool/EightBallPool");
var _FlappyBird = require("../games/flappy-bird/FlappyBird");
var _FruitSlash = require("../games/fruit-slash/FruitSlash");
var _HighwayRacer = require("../games/highway-racer/HighwayRacer");
var _HillClimb = require("../games/hill-climb/HillClimb");
var _Hoops2K26_3D = require("../games/hoops-2k26/Hoops2K26_3D");
var _HungryShark = require("../games/hungry-shark/HungryShark");
var _LegendsArena3D = require("../games/legends-arena/LegendsArena3D");
var _MiniMilitia = require("../games/mini-militia/MiniMilitia");
var _NarutoSenkiStorm = require("../games/naruto-senki-storm/NarutoSenkiStorm");
var _PlantVsZombie = require("../games/plant-vs-zombie/PlantVsZombie");
var _StickmanBrawl = require("../games/stickman-brawl/StickmanBrawl");
var _StickWarLegacy = require("../games/stick-war-legacy/StickWarLegacy");
var _StockfishChess = require("../games/stockfish-chess/StockfishChess");
var _SubwaySurfers = require("../games/subway-surfers/SubwaySurfers");
var _Sudoku = require("../games/sudoku/Sudoku");
var _SuperRunner = require("../games/super-runner/SuperRunner");
var _TacticalOpsFPS = require("../games/tactical-ops-fps/TacticalOpsFPS");
var _VectorParkour = require("../games/vector-parkour/VectorParkour");
var _WormIo = require("../games/worm-io/WormIo");
var builtInsRegistered = false;
function registerBuiltInGames() {
    if (builtInsRegistered) return;
    builtInsRegistered = true;
    (0, _arcadeGlobal.registerArcadeGame)(0, function(c, ctx, d, l) {
        return new _SuperRunner.SuperRunner(c, ctx, d, l, 0);
    });
    (0, _arcadeGlobal.registerArcadeGame)(1, function(c, ctx, d, l) {
        return new _FlappyBird.FlappyBird(c, ctx, d, l, 1);
    });
    (0, _arcadeGlobal.registerArcadeGame)(2, function(c, ctx, d, l) {
        return new _FruitSlash.FruitSlash(c, ctx, d, l, 2);
    });
    (0, _arcadeGlobal.registerArcadeGame)(3, function(c, ctx, d, l) {
        return new _CatchButterflies.CatchButterflies(c, ctx, d, l, 3);
    });
    (0, _arcadeGlobal.registerArcadeGame)(4, function(_c, _ctx, d, l) {
        return new _CodeHero.CodeHeroGame(l, d);
    });
    (0, _arcadeGlobal.registerArcadeGame)(5, function(c, ctx, d, l) {
        return new _HighwayRacer.HighwayRacer(c, ctx, d, l, 5);
    });
    (0, _arcadeGlobal.registerArcadeGame)(6, function(_c, _ctx, d, l) {
        return new _StockfishChess.StockfishChessGame(l, d);
    });
    (0, _arcadeGlobal.registerArcadeGame)(7, function(c, ctx, d, l) {
        return new _TacticalOpsFPS.TacticalOpsFPS(c, ctx, d, l, 7);
    });
    (0, _arcadeGlobal.registerArcadeGame)(8, function(c, ctx, d, l) {
        return new _CandyClash.CandyClashGame(c, ctx, d, l, 8);
    });
    (0, _arcadeGlobal.registerArcadeGame)(9, function(c, ctx, d, l) {
        return new _BlockBlast.BlockBlastGame(c, ctx, d, l, 9);
    });
    (0, _arcadeGlobal.registerArcadeGame)(10, function(c, ctx, d, l) {
        return new _SubwaySurfers.SubwaySurfersGame(c, ctx, d, l, 10);
    });
    (0, _arcadeGlobal.registerArcadeGame)(11, function(c, ctx, d, l) {
        return new _HillClimb.HillClimb(c, ctx, d, l, 11);
    });
    (0, _arcadeGlobal.registerArcadeGame)(12, function(c, ctx, d, l) {
        return new _PlantVsZombie.PlantVsZombie(c, ctx, d, l, 12);
    });
    (0, _arcadeGlobal.registerArcadeGame)(13, function(c, ctx, d, l) {
        return new _AngrySlingshot.AngrySlingshot(c, ctx, d, l, 13);
    });
    (0, _arcadeGlobal.registerArcadeGame)(14, function(c, ctx, d, l) {
        return new _CookingFrenzy.CookingFrenzy(c, ctx, d, l, 14);
    });
    (0, _arcadeGlobal.registerArcadeGame)(15, function(c, ctx, d, l) {
        return new _HungryShark.HungryShark(c, ctx, d, l, 15);
    });
    (0, _arcadeGlobal.registerArcadeGame)(16, function(c, ctx, d, l) {
        return new _WormIo.WormIo(c, ctx, d, l, 16);
    });
    (0, _arcadeGlobal.registerArcadeGame)(17, function(c, ctx, d, l) {
        return new _StickmanBrawl.StickmanBrawl(c, ctx, d, l, 17);
    });
    (0, _arcadeGlobal.registerArcadeGame)(18, function(c, ctx, d, l) {
        return new _EightBallPool.EightBallPool(c, ctx, d, l, 18);
    });
    (0, _arcadeGlobal.registerArcadeGame)(19, function(c, ctx, d, l) {
        return new _VectorParkour.VectorParkour(c, ctx, d, l, 19);
    });
    (0, _arcadeGlobal.registerArcadeGame)(20, function(_c, _ctx, d, l) {
        return new _Crossword.Crossword(l, d);
    });
    (0, _arcadeGlobal.registerArcadeGame)(21, function(_c, _ctx, d, l) {
        return new _Sudoku.Sudoku(l, d);
    });
    (0, _arcadeGlobal.registerArcadeGame)(22, function(c, ctx, d, l) {
        return new _MiniMilitia.MiniMilitia(c, ctx, d, l, 22);
    });
    (0, _arcadeGlobal.registerArcadeGame)(23, function(c, ctx, d, l) {
        return new _StickWarLegacy.StickWarLegacy(c, ctx, d, l, 23);
    });
    (0, _arcadeGlobal.registerArcadeGame)(24, function(_c, _ctx, d, l, t) {
        return new _BattleRoyale3D.BattleRoyale3D(t || document.body, d, l, 24);
    });
    (0, _arcadeGlobal.registerArcadeGame)(25, function(_c, _ctx, d, l, t) {
        var _playerState_mobaTrialHeroId;
        return new _LegendsArena3D.LegendsArena3D(t || document.body, d, l, 25, (_playerState_mobaTrialHeroId = _storage.playerState.mobaTrialHeroId) != null ? _playerState_mobaTrialHeroId : _storage.playerState.selectedMobaHero);
    });
    (0, _arcadeGlobal.registerArcadeGame)(26, function(_c, _ctx, d, l, t) {
        return new _AsphaltNitro3D.AsphaltNitro3D(t || document.body, d, l, 26, _storage.playerState.selectedAsphaltCar);
    });
    (0, _arcadeGlobal.registerArcadeGame)(27, function(_c, _ctx, d, l, t) {
        return new _Hoops2K26_3D.Hoops2K26_3D(t || document.body, d, l, 27, _storage.playerState.selectedBasketballTeam);
    });
    (0, _arcadeGlobal.registerArcadeGame)(28, function(c, ctx, d, l, t) {
        return new _NarutoSenkiStorm.NarutoSenkiStormGame(c, ctx, t || document.body, d, l, 28);
    });
}
registerBuiltInGames();
function createGameByIndex(index, canvas, ctx, diff, lvl, threeContainer) {
    registerBuiltInGames();
    var factory = (0, _arcadeGlobal.getRegisteredGameFactory)(index) || (0, _arcadeGlobal.getRegisteredGameFactory)(0);
    return factory(canvas, ctx, diff, lvl, threeContainer);
}

});

})(window.ArcadeMod);
