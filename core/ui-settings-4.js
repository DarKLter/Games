(function(ArcadeMod){
// === MODULE: src/core/ui/arcadeUiConstants ===
ArcadeMod.define("src/core/ui/arcadeUiConstants", function(require, module, exports) {
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
    get ARCADE_CATEGORIES () {
        return ARCADE_CATEGORIES;
    },
    get THEME_PRESETS () {
        return THEME_PRESETS;
    },
    get TOTAL_2D_GAMES () {
        return TOTAL_2D_GAMES;
    },
    get TOTAL_3D_GAMES () {
        return TOTAL_3D_GAMES;
    }
});
var _instructions = require("../instructions");
var THEME_PRESETS = [
    {
        gradient: "linear-gradient(135deg, #141e14, #228b22)",
        accent: "#84fab0",
        bg: "rgba(20, 30, 20, 0.92)",
        text: "#ffffff",
        label: "Forest Theme"
    },
    {
        gradient: "linear-gradient(135deg, #1a0933, #7b2cbf)",
        accent: "#e0aaff",
        bg: "rgba(26, 9, 51, 0.92)",
        text: "#ffffff",
        label: "Royal Purple Theme"
    },
    {
        gradient: "linear-gradient(135deg, #03045e, #0077b6)",
        accent: "#90e0ef",
        bg: "rgba(3, 4, 94, 0.92)",
        text: "#ffffff",
        label: "Ocean Theme"
    },
    {
        gradient: "linear-gradient(135deg, #3d0000, #ff0000)",
        accent: "#ffb3b3",
        bg: "rgba(61, 0, 0, 0.92)",
        text: "#ffffff",
        label: "Crimson Theme"
    },
    {
        gradient: "linear-gradient(135deg, #1f1f1f, #434343)",
        accent: "#ffd700",
        bg: "rgba(31, 31, 31, 0.92)",
        text: "#ffffff",
        label: "Gold Noir Theme"
    }
];
var TOTAL_3D_GAMES = _instructions.GAME_LIST.filter(function(g) {
    return Boolean(g.is3DGame);
}).length;
var TOTAL_2D_GAMES = _instructions.GAME_LIST.length - TOTAL_3D_GAMES;
var ARCADE_CATEGORIES = [
    {
        key: "all",
        label: "All"
    },
    {
        key: "action",
        label: "Action"
    },
    {
        key: "racing",
        label: "Racing"
    },
    {
        key: "shooter",
        label: "Shooter"
    },
    {
        key: "puzzle",
        label: "Puzzle"
    },
    {
        key: "strategy",
        label: "Strategy"
    },
    {
        key: "sports",
        label: "Sports"
    },
    {
        key: "arcade",
        label: "Arcade"
    }
];

});

})(window.ArcadeMod);
