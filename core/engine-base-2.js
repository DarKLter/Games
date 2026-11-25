(function(ArcadeMod){
// === MODULE: src/core/instructions ===
ArcadeMod.define("src/core/instructions", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GAME_LIST", {
    enumerable: true,
    get: function() {
        return GAME_LIST;
    }
});
var CORE_GAMES = [
    {
        id: 0,
        icon: '🏃',
        title: 'Super Runner',
        instructTitle: '🏃 Super Runner',
        text: '• Tap JUMP (or press Space / Up Arrow / W) to leap over bricks, rocks, and flying bats.\n• Double-jump in mid-air to dodge tall stacks and snag high stars (⭐) & shield orbs (🛡️)!\n• Speed and level increase the longer you survive!',
        bgmTheme: 'arcade',
        category: 'action',
        actionBtn: 'JUMP',
        showActionCustomizer: true
    },
    {
        id: 1,
        icon: '🐦',
        title: 'Flappy',
        instructTitle: '🐦 Flappy Garden',
        text: '• Tap FLAP (or press Space / Up Arrow) to keep your avatar airborne.\n• Thread through the gaps between pipes and grab floating coins.\n• One crash ends the run—stay focused!',
        bgmTheme: 'arcade',
        category: 'arcade',
        actionBtn: 'FLAP',
        showActionCustomizer: true
    },
    {
        id: 2,
        icon: '🍉',
        title: 'Fruit Slash',
        instructTitle: '🍉 Fruit Slash',
        text: '• Swipe or drag your finger/mouse across flying fruits to slice combos!\n• Slice Frenzy Starfruit (🌟) & Coins (🪙) for bonus rewards.\n• Avoid black bombs (💣) and watch the 3 ❌ drop strikes in the corner!',
        bgmTheme: 'action',
        category: 'action'
    },
    {
        id: 3,
        icon: '🦋',
        title: 'Catch Butterflies',
        instructTitle: '🦋 Catch Butterflies',
        text: '• Tap fluttering butterflies (🦋) before they escape across the screen.\n• Chain rapid catches for combo multipliers and +5 bonus coins (🪙).\n• Avoid tapping buzzing bees (🐝)—3 stings end the round!',
        bgmTheme: 'garden',
        category: 'arcade'
    },
    {
        id: 4,
        icon: '💻',
        title: 'Code Hero',
        instructTitle: '💻 Code Hero',
        text: '• Read each quick coding mini-lesson and pick the right answer before the 30-second timer expires.\n• Every correct answer earns coins, score, and Developer XP!',
        bgmTheme: 'puzzle',
        category: 'puzzle',
        isDomGame: true
    },
    {
        id: 5,
        icon: '🏎️',
        title: 'Highway Racer',
        instructTitle: '🏎️ Highway Racer',
        text: '• Tap Left (◀) / Right (▶) buttons or use A/D / Left/Right Arrow keys to switch lanes.\n• Dodge oncoming vehicles, snatch Nitro Boosts & Shield Orbs, and grab coins (🪙)!',
        bgmTheme: 'action',
        category: 'racing',
        preferredOrientation: 'landscape',
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        showSteerCustomizer: true
    },
    {
        id: 6,
        icon: '♟️',
        title: 'Stockfish Chess',
        instructTitle: '♟️ Stockfish Chess',
        text: '• Select your preferred match clock above (1 Minute, 5 Minutes, or 10 Minutes), then click Start Chess Match.\n• Your side (White ♔ or Black ♚) is assigned randomly every match.\n• Play full Stockfish Chess across 2750–3750+ Elo ratings with live evaluation bar, move quality review, and accuracy stats.',
        bgmTheme: 'chill',
        category: 'strategy',
        isDomGame: true
    },
    {
        id: 7,
        icon: '🎯',
        title: 'Tactical Ops FPS',
        instructTitle: '🎯 Tactical Ops FPS',
        text: '• All 3 First-Person Shooter operations rotate dynamically & randomly during combat—plus Armored BOSS Helicopter / Juggernaut raids!\n• 🎯 Target Range, 🔭 Sniper Rescue (2.4x Zoom Scope), and 🧟 Zombie Siege auto-switch at random.\n• Aim for 💀 Headshots, shoot down incoming rockets, protect Civilians, and hit Supply Crates (🧰).',
        bgmTheme: 'tactical',
        category: 'shooter',
        preferredOrientation: 'landscape',
        showHealthBar: true,
        actionBtn: 'RELOAD',
        showActionCustomizer: true
    },
    {
        id: 8,
        icon: '🍬',
        title: 'Candy Clash',
        instructTitle: '🍬 Candy Clash',
        text: '• Swipe any fruit/candy in any direction OR tap two adjacent candies to swap and match 3+!\n• Beat the per-turn countdown timer—if the turn clock hits 0s, 1 Move is deducted and the clock resets!\n• Match 4+ for Striped & Color-Burst combos with cascading chain multipliers.',
        bgmTheme: 'puzzle',
        category: 'puzzle'
    },
    {
        id: 9,
        icon: '🧱',
        title: 'Block Blast',
        instructTitle: '🧱 Block Blast',
        text: '• Drag polyomino block shapes from the bottom tray onto the 8×8 board.\n• Complete full rows or columns to blast them clear for combo points & coins!\n• Plan carefully—if none of your 3 pieces fit, the match ends!',
        bgmTheme: 'puzzle',
        category: 'puzzle'
    },
    {
        id: 10,
        icon: '🚇',
        title: 'Subway Surfers',
        instructTitle: '🚇 Subway Surfers',
        text: '• Swipe or use A/D (Left/Right) to weave between 3 subway tracks, W/Up to Jump over barriers, and S/Down to Roll under signs.\n• Grab Coin Magnets (🧲) & Hoverboard Shields along the rails!',
        bgmTheme: 'arcade',
        category: 'action',
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        actionBtn: 'JUMP',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 11,
        icon: '🚙',
        title: 'Hill Climb',
        instructTitle: '🚙 Hill Climb Racing',
        text: '• Start smoothly on a flat launch pad before tackling progressive curvy hills & mega-jumps!\n• Hold GAS (▶ / D / Right) to accelerate and pitch nose UP in mid-air; hold BRAKE (◀ / A / Left) to pitch nose DOWN.\n• Land level on your wheels and grab Fuel cans (⛽) & Coin trails!',
        bgmTheme: 'action',
        category: 'racing',
        preferredOrientation: 'landscape',
        showSteer: true,
        steerLeftLabel: '◀ BRK',
        steerRightLabel: 'GAS ▶',
        showSteerCustomizer: true
    },
    {
        id: 12,
        icon: '🌻',
        title: 'Plant vs Zombie',
        instructTitle: '🌻 Plant vs Zombie',
        text: '• Tap/swipe falling Sun (☀️) to gather energy and plant an 8-plant arsenal: Sunflower 🌻, Peashooter 🌱, Snow Pea ❄️, Repeater 🫛, Wall-Nut 🌰, Potato Mine 💣, Jalapeno 🌶️, Cherry Bomb 🍒 + Shovel 🪓!\n• 5-lane Lawnmowers (🚜) defend each row—survive Conehead, Buckethead & Gargantuar Boss waves!',
        bgmTheme: 'garden',
        category: 'strategy',
        preferredOrientation: 'landscape'
    },
    {
        id: 13,
        icon: '🐦',
        title: 'Angry Slingshot',
        instructTitle: '🐦 Angry Slingshot',
        text: '• Drag back from the slingshot bird on the left to aim your trajectory arc and release to launch!\n• Birds are strictly limited per level—destroy every Piggy (🐷/👑) before running out of birds!',
        bgmTheme: 'arcade',
        category: 'arcade',
        preferredOrientation: 'landscape'
    },
    {
        id: 14,
        icon: '👨‍🍳',
        title: 'Cooking Frenzy',
        instructTitle: '👨‍🍳 Cooking Frenzy',
        text: '• Serve 20 gourmet dishes from 20 fresh ingredients before the Rush Hour clock runs out!\n• Tap matching ingredients to plate Orders, then tap the customer for speed tips, Rush combos, and +Time bonuses!',
        bgmTheme: 'arcade',
        category: 'arcade'
    },
    {
        id: 15,
        icon: '🦈',
        title: 'Hungry Shark',
        instructTitle: '🦈 Hungry Shark (Unlimited Ocean)',
        text: '• Swim freely across an UNLIMITED open ocean with scrolling depth zones (Sunlit Reef, Twilight Trench, Abyss)!\n• Eat fish, divers & crabs to trigger GOLD RUSH FEVER, replenish hunger & grow into a Megalodon!',
        bgmTheme: 'action',
        category: 'action',
        preferredOrientation: 'landscape',
        showHealthBar: true,
        actionBtn: 'BOOST',
        showActionCustomizer: true
    },
    {
        id: 16,
        icon: '🐍',
        title: 'Worm.io',
        instructTitle: '🐍 Worm.io',
        text: '• Steer your glowing worm with mouse/touch or Left/Right/WASD and hold BOOST to cut off rival AI worms!\n• Eat glowing energy orbs and dropped loot from defeated rivals—never crash your head into another worm body!',
        bgmTheme: 'arcade',
        category: 'arcade',
        actionBtn: 'BOOST',
        showActionCustomizer: true
    },
    {
        id: 17,
        icon: '🥷',
        title: 'Stickman Brawl',
        instructTitle: '🥷 Stickman Brawl (Expanded Tower & Bosses)',
        text: '• Battle through a massive scrolling multi-floor fortress (6–7 floors wide!) using Left/Right, JUMP (W/Up), Drop (S/Down), and 3-hit ATTACK combos (Space / J)!\n• Break Heal Crates (🧰) and defeat towering Cyber & Shadow BOSS Fighters!',
        bgmTheme: 'action',
        category: 'action',
        preferredOrientation: 'landscape',
        showHealthBar: true,
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        actionBtn: 'ATTACK',
        jumpBtn: 'JUMP',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 18,
        icon: '🎱',
        title: '8 Ball Pool',
        instructTitle: '🎱 8 Ball Pool',
        text: '• 🤖 VS ENEMY: Features an 18s Turn Shot Clock—if your timer hits 0s, your turn auto-switches to the AI Opponent! Highest score wins!\n• ⏱️ SOLO TIMED: Pocket all rack balls + 8-ball before the clock expires!',
        bgmTheme: 'chill',
        category: 'sports',
        preferredOrientation: 'landscape'
    },
    {
        id: 19,
        icon: '🏃‍♂️',
        title: 'Vector Parkour',
        instructTitle: '🏃‍♂️ Vector Parkour',
        text: '• Sprint across neon rooftops! Tap/Swipe UP (W/Up/Space) to JUMP over hazards, and hold SLIDE (S/Down/Action btn) to duck under drones & overhead beams.\n• Chain Vaults and collect Data Cubes (💠) for bonus coins!',
        bgmTheme: 'action',
        category: 'action',
        actionBtn: 'SLIDE',
        showActionCustomizer: true
    },
    {
        id: 20,
        icon: '📝',
        title: 'Crossword',
        instructTitle: '📝 Crossword Puzzle',
        text: '• Tap any square on the crossword grid and type letters on your keyboard or the on-screen keys!\n• Tap the direction button (↔ ACROSS / ↕ DOWN) to switch clues, or use 💡 Hint (5🪙) to reveal a letter.',
        bgmTheme: 'puzzle',
        category: 'puzzle',
        isDomGame: true
    },
    {
        id: 21,
        icon: '🔢',
        title: 'Sudoku',
        instructTitle: '🔢 Sudoku Puzzle',
        text: '• Fill every row, column, and 3×3 box with digits 1–9 without repeating!\n• Toggle ✏️ Notes mode to jot candidate digits, use 💡 Hint (5🪙) if stuck, and avoid 3 mistakes!',
        bgmTheme: 'puzzle',
        category: 'puzzle',
        isDomGame: true
    },
    {
        id: 22,
        icon: '🪖',
        title: 'Mini Militia',
        instructTitle: '🪖 Mini Militia (Mega Map & Bosses)',
        text: '• Soar across a sprawling 2800×1260 multi-tier warzone using your Jetpack (JETPACK / W / Up) and radar minimap!\n• Grab Shotgun, Laser, Rocket & Medkit crates, throw Grenades (G), and destroy Armored Gunship BOSSES!',
        bgmTheme: 'tactical',
        category: 'shooter',
        preferredOrientation: 'landscape',
        showHealthBar: true,
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        actionBtn: 'JETPACK',
        jumpBtn: 'GRENADE',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 23,
        icon: '⚔️',
        title: 'Stick War: Legacy',
        instructTitle: '⚔️ Stick War: Legacy (8 Units & Spells)',
        text: '• Train 8 iconic classes: Miner ⛏️, Sword 🗡️, Archidon 🏹, Spearton 🛡️, Magikill 🪄, Giant 👹, Albowtross 🦅, and Meric Healer 🩺!\n• Castle Archers guard your Statue in Defend/Retreat! Cast Rage Horn & Gold Rush Spells to crush the Enemy Statue!',
        bgmTheme: 'war',
        category: 'strategy',
        preferredOrientation: 'landscape'
    },
    {
        id: 24,
        icon: '🪖',
        title: 'Battle Royale 3D',
        instructTitle: '🪖 Battle Royale 3D (PUBG Mobile Edition)',
        text: '• Drop from the C-130 Cargo Plane via Parachute onto Erangel or Sanhok in Solo or Squad mode!\n• Switch 4 Weapons [1-4 / Q]: M416, UMP45, S1897 Shotgun, & 4x AWM Sniper! Aim & FIRE (Click / J), SCOPE [E/Shift], RELOAD [R], GRENADE [G], FLARE AIRDROP [C], MEDKIT [H]!\n• Hop into a drivable Military Buggy [F] & outlast the shrinking Safe Zone!',
        bgmTheme: 'tactical',
        category: 'shooter',
        preferredOrientation: 'landscape',
        is3DGame: true,
        showHealthBar: true,
        showSteer: true,
        steerLeftLabel: '◀ STRAFE',
        steerRightLabel: 'STRAFE ▶',
        actionBtn: 'FIRE',
        jumpBtn: 'JUMP',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 25,
        icon: '⚔️',
        title: 'Legends Arena 3D',
        instructTitle: '⚔️ Legends Arena 3D (129 Heroes · 3x Battlefield)',
        text: '• Complete Daily Missions & Lifetime Quests in the Main Lobby, draft from 129 unique heroes, and equip Emblems + Battle Spells!\n• Battle on a 3x larger 3-lane map with Purple/Orange Buffs, Jungle Creeps, River Turtle, and an allied-sieging Mid Lord!\n• Cast Skills [1/2/3] (+ Skill [4] on 4-skill heroes), Battle Spell [F], HP Regen [H], Recall [B], and Attack [Space/J]!',
        bgmTheme: 'war',
        category: 'strategy',
        preferredOrientation: 'landscape',
        is3DGame: true,
        showHealthBar: true,
        showSteer: true,
        steerLeftLabel: '◀ LEFT',
        steerRightLabel: 'RIGHT ▶',
        actionBtn: 'ATTACK',
        jumpBtn: 'SKILL 1',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 26,
        icon: '🏁',
        title: 'Asphalt Nitro 3D',
        instructTitle: '🏁 Asphalt Nitro 3D (8 Supercars · 4 Mission Maps)',
        text: '• Unlock 8 Supercars & upgrade Speed, Accel, Nitro, and Handling (Lv1-5) with Garden Coins!\n• Conquer 4 Mission Biomes: Neon Metropolis Race, Red Canyon Takedowns, Alpine Speed Gates & Volcanic Elimination!\n• Steer [A/D], Nitro [Space], Stunt Ramp [J], & Drift [Shift] to earn 3-Star mastery!',
        bgmTheme: 'action',
        category: 'racing',
        preferredOrientation: 'landscape',
        is3DGame: true,
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        actionBtn: 'NITRO',
        jumpBtn: 'RAMP',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 27,
        icon: '🏀',
        title: 'Hoops 2K26 3D',
        instructTitle: '🏀 Hoops 2K26 3D (2v2 · 3v3 · 5v5 · Playoffs)',
        text: '• Choose 2v2 Streetball, 3v3 Outdoor Blacktop, 5v5 NBA Arena, or the 3-Round NBA Playoff Tournament!\n• Move with Analog/WASD, SPRINT [Shift], hold SHOOT [Space] for Green Release / Slam Dunks, PASS [E/J], and STEAL [F/K]!',
        bgmTheme: 'action',
        category: 'sports',
        preferredOrientation: 'landscape',
        is3DGame: true,
        showSteer: true,
        steerLeftLabel: '◀',
        steerRightLabel: '▶',
        actionBtn: 'SHOOT',
        jumpBtn: 'PASS',
        showSteerCustomizer: true,
        showActionCustomizer: true
    },
    {
        id: 28,
        icon: '🍥',
        title: 'Naruto: Senki & Storm',
        instructTitle: '🍥 Naruto: Senki (2D MOBA) & Ultimate Ninja Storm (3D Arena)',
        text: '• Switch between 2D NARUTO SENKI (3v3 & 4v4 Single-Lane 3-Tower MOBA Brawler with Lv.1-6 Ougi 1/2 & Ichiraku Ramen Shop) and 3D ULTIMATE NINJA STORM (3D Arena Fighter with Dual HP Bars, 4-Log Kawarimi Substitution, Guard Break, Chakra Dash, Counterattack Parry, 4 D-Pad Ninja Tools, Support Drive & Awakenings)!\n• Unlock 64 canonical Shinobi across Konoha, Five Kage, Akatsuki, Taka, and Boruto/Otsutsuki eras!\n• Use Touch HUD buttons or Keyboard [WASD/Arrows], Combo [Space/J], Jutsu [1-5], Sub Log [E], Chakra [C], Guard/Counter [Q], Supports [R/T], Leader Switch [Tab], and Ramen/Tools [Z/X/V/B]!',
        bgmTheme: 'war',
        category: 'action',
        preferredOrientation: 'landscape',
        is3DGame: true,
        showHealthBar: true,
        showSteer: true,
        steerLeftLabel: '◀ LEFT',
        steerRightLabel: 'RIGHT ▶',
        actionBtn: 'COMBO',
        jumpBtn: 'JUTSU 1',
        showSteerCustomizer: true,
        showActionCustomizer: true
    }
];
var GAME_LIST = CORE_GAMES;

});
// === MODULE: src/core/runtimeBridge ===
ArcadeMod.define("src/core/runtimeBridge", function(require, module, exports) {
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
    get addCoins () {
        return addCoins;
    },
    get addXp () {
        return addXp;
    },
    get awardBonusCoins () {
        return awardBonusCoins;
    },
    get registerHudBridge () {
        return registerHudBridge;
    },
    get setActionButtonLabel () {
        return setActionButtonLabel;
    },
    get spendCoins () {
        return spendCoins;
    },
    get triggerGameOver () {
        return triggerGameOver;
    },
    get updateCoinsDisplay () {
        return updateCoinsDisplay;
    },
    get updateHealthDisplay () {
        return updateHealthDisplay;
    },
    get updateHoopsHud () {
        return updateHoopsHud;
    },
    get updateInGameHud () {
        return updateInGameHud;
    },
    get updateMobaHud () {
        return updateMobaHud;
    },
    get updateNarutoHud () {
        return updateNarutoHud;
    }
});
var _audio = require("./audio");
var _storage = require("./storage");
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
var defaultHandlers = {
    onCoinsChange: function onCoinsChange() {},
    onXpChange: function onXpChange() {},
    onHudUpdate: function onHudUpdate() {},
    onHealthUpdate: function onHealthUpdate() {},
    onGameOver: function onGameOver() {},
    onActionLabelChange: function onActionLabelChange() {},
    onMobaHudUpdate: function onMobaHudUpdate() {},
    onNarutoHudUpdate: function onNarutoHudUpdate() {},
    onHoopsHudUpdate: function onHoopsHudUpdate() {}
};
var handlers = _extends({}, defaultHandlers);
function registerHudBridge(next) {
    handlers = next;
}
function addCoins(amount) {
    _storage.playerState.totalCoins += amount;
    _storage.playerState.sessionCoins += amount;
    (0, _storage.persistCoinsAndUnlocks)();
    handlers.onCoinsChange();
}
function awardBonusCoins(amount) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    _storage.playerState.totalCoins += Math.round(amount);
    (0, _storage.persistCoinsAndUnlocks)();
    handlers.onCoinsChange();
}
function spendCoins(amount) {
    if (_storage.playerState.totalCoins < amount) return false;
    _storage.playerState.totalCoins -= amount;
    (0, _storage.persistCoinsAndUnlocks)();
    handlers.onCoinsChange();
    return true;
}
function addXp(amount) {
    _storage.playerState.playerXp += amount;
    while(_storage.playerState.playerXp >= _storage.playerState.playerLevel * 100){
        _storage.playerState.playerXp -= _storage.playerState.playerLevel * 100;
        _storage.playerState.playerLevel++;
    }
    (0, _storage.persistXpAndLevel)();
    handlers.onXpChange();
}
function updateCoinsDisplay() {
    (0, _storage.persistCoinsAndUnlocks)();
    handlers.onCoinsChange();
}
function updateInGameHud(score, lvl, gameIdx) {
    if (score > (_storage.playerState.highScores[gameIdx] || 0)) {
        _storage.playerState.highScores[gameIdx] = score;
        (0, _storage.persistHighScores)();
    }
    handlers.onHudUpdate(score, lvl, gameIdx);
}
function updateHealthDisplay(cur, max) {
    handlers.onHealthUpdate(cur, max);
}
function setActionButtonLabel(label) {
    handlers.onActionLabelChange(label);
}
function updateMobaHud(snap) {
    handlers.onMobaHudUpdate == null ? void 0 : handlers.onMobaHudUpdate.call(handlers, snap);
}
function updateNarutoHud(snap) {
    handlers.onNarutoHudUpdate == null ? void 0 : handlers.onNarutoHudUpdate.call(handlers, snap);
}
function updateHoopsHud(snap) {
    handlers.onHoopsHudUpdate == null ? void 0 : handlers.onHoopsHudUpdate.call(handlers, snap);
}
function triggerGameOver(score, coinsEarned, reachedLevel, gameIdx, isVictory) {
    if (isVictory === void 0) isVictory = false;
    _audio.ArcadeAudio.stopBgm();
    _audio.ArcadeAudio.play(isVictory ? 'win' : 'gameover');
    if (score > (_storage.playerState.highScores[gameIdx] || 0)) {
        _storage.playerState.highScores[gameIdx] = score;
        (0, _storage.persistHighScores)();
    }
    updateCoinsDisplay();
    handlers.onGameOver(score, coinsEarned, reachedLevel, gameIdx, isVictory);
}

});
// === MODULE: src/core/storage ===
ArcadeMod.define("src/core/storage", function(require, module, exports) {
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
    get TOTAL_GAMES () {
        return TOTAL_GAMES;
    },
    get ensureCurrentMobaDailyState () {
        return ensureCurrentMobaDailyState;
    },
    get loadUiPrefs () {
        return loadUiPrefs;
    },
    get persistArenaSelections () {
        return persistArenaSelections;
    },
    get persistAsphaltGarage () {
        return persistAsphaltGarage;
    },
    get persistBrStats () {
        return persistBrStats;
    },
    get persistChessTime () {
        return persistChessTime;
    },
    get persistCoinsAndUnlocks () {
        return persistCoinsAndUnlocks;
    },
    get persistHighScores () {
        return persistHighScores;
    },
    get persistHoops2K26 () {
        return persistHoops2K26;
    },
    get persistHoopsTournament () {
        return persistHoopsTournament;
    },
    get persistMobaDaily () {
        return persistMobaDaily;
    },
    get persistMobaMeta () {
        return persistMobaMeta;
    },
    get persistMobaProgression () {
        return persistMobaProgression;
    },
    get persistMobaStats () {
        return persistMobaStats;
    },
    get persistNarutoProgression () {
        return persistNarutoProgression;
    },
    get persistXpAndLevel () {
        return persistXpAndLevel;
    },
    get playerState () {
        return playerState;
    },
    get recordMobaDailyEvent () {
        return recordMobaDailyEvent;
    },
    get recordMobaMatchResult () {
        return recordMobaMatchResult;
    },
    get saveUiPrefs () {
        return saveUiPrefs;
    },
    get tryStorage () {
        return tryStorage;
    }
});
var _arenaRoster = require("./arenaRoster");
function _extends() {
    _extends = Object.assign || function assign(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source)if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var _mobaMetaInit_bp, _mobaMetaInit_tickets, _mobaMetaInit_diamonds, _mobaMetaInit_promoDiamonds, _mobaMetaInit_creditScore, _mobaMetaInit_starlightXp, _mobaMetaInit_checkInDay, _ref, _ref1, _ref2, _mobaMetaInit_settings;
var _mobaMetaInit_squad, _mobaMetaInit_squad1, _mobaMetaInit_squad2, _mobaMetaInit_backpack, _mobaMetaInit_backpack1, _mobaMetaInit_backpack2, _mobaMetaInit_backpack3;
var memoryStorage = {};
var TOTAL_GAMES = 29;
var tryStorage = {
    getItem: function getItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (unused) {
            var _memoryStorage_key;
            return (_memoryStorage_key = memoryStorage[key]) != null ? _memoryStorage_key : null;
        }
    },
    setItem: function setItem(key, val) {
        try {
            localStorage.setItem(key, val);
        } catch (unused) {
            memoryStorage[key] = val;
        }
    }
};
function loadHighScores() {
    var arr = new Array(TOTAL_GAMES).fill(0);
    try {
        var saved = JSON.parse(tryStorage.getItem('tsepang_high_scores') || '[]');
        if (Array.isArray(saved)) {
            saved.forEach(function(v, i) {
                if (i < arr.length) arr[i] = Number(v) || 0;
            });
        }
    } catch (unused) {
    // ignore corrupted cache
    }
    return arr;
}
function loadUnlockedAvatars() {
    var set = new Set([
        '😀'
    ]);
    try {
        var saved = JSON.parse(tryStorage.getItem('tsepang_unlocks') || '["😀"]');
        if (Array.isArray(saved)) {
            saved.forEach(function(a) {
                if (typeof a === 'string') set.add(a);
            });
        }
    } catch (unused) {
    // ignore
    }
    return set;
}
function loadUnlockedMobaHeroes() {
    var set = new Set([
        0,
        1,
        2
    ]);
    var maxId = Math.max(2, _arenaRoster.MOBA_HEROES.length - 1);
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_moba_unlocked') || '[0,1,2]');
        if (Array.isArray(raw)) {
            raw.forEach(function(id) {
                var n = Number(id);
                if (Number.isInteger(n) && n >= 0 && n <= maxId) set.add(n);
            });
        }
    } catch (unused) {
    // ignore
    }
    return Array.from(set).sort(function(a, b) {
        return a - b;
    });
}
function loadUnlockedNarutoHeroes() {
    var set = new Set([
        0,
        1,
        2,
        3
    ]);
    var maxId = Math.max(3, _arenaRoster.NARUTO_SHINOBI_ROSTER.length - 1);
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_naruto_unlocked') || '[0,1,2,3]');
        if (Array.isArray(raw)) {
            raw.forEach(function(id) {
                var n = Number(id);
                if (Number.isInteger(n) && n >= 0 && n <= maxId) set.add(n);
            });
        }
    } catch (unused) {
    // ignore
    }
    return Array.from(set).sort(function(a, b) {
        return a - b;
    });
}
function loadMobaEmblemLevels() {
    var out = {
        Common: 1,
        Marksman: 1,
        Tank: 1,
        Fighter: 1,
        Assassin: 1,
        Mage: 1,
        Support: 1
    };
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_moba_emblems') || '{}');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object') {
            Object.keys(out).forEach(function(role) {
                var v = Number(raw[role]);
                if (Number.isFinite(v)) out[role] = Math.max(1, Math.min(5, Math.round(v)));
            });
        }
    } catch (unused) {
    // ignore
    }
    return out;
}
function loadMobaMetaBlob() {
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_moba_meta_v2') || '{}');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object') return raw;
    } catch (unused) {
    // ignore corrupted cache
    }
    return {};
}
function mergeEmblemTalents(saved) {
    var out = {};
    Object.keys(_arenaRoster.DEFAULT_EMBLEM_TALENTS).forEach(function(key) {
        var base = _arenaRoster.DEFAULT_EMBLEM_TALENTS[key];
        var s = saved == null ? void 0 : saved[key];
        out[key] = {
            t1: typeof (s == null ? void 0 : s.t1) === 'string' ? s.t1 : base.t1,
            t2: typeof (s == null ? void 0 : s.t2) === 'string' ? s.t2 : base.t2,
            t3: typeof (s == null ? void 0 : s.t3) === 'string' ? s.t3 : base.t3
        };
    });
    return out;
}
function loadClaimedMobaQuests() {
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_moba_quests') || '[]');
        if (Array.isArray(raw)) {
            return raw.filter(function(q) {
                return typeof q === 'string';
            });
        }
    } catch (unused) {
    // ignore
    }
    return [];
}
function createFreshDailyState(dateKey) {
    if (dateKey === void 0) dateKey = (0, _arenaRoster.getLocalDateKey)();
    return {
        dateKey: dateKey,
        matchesPlayed: 0,
        rankedWins: 0,
        kills: 0,
        jungleSlain: 0,
        bossesSlain: 0,
        claimedIds: []
    };
}
function loadMobaDailyState() {
    var today = (0, _arenaRoster.getLocalDateKey)();
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_moba_daily') || 'null');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object' && raw.dateKey === today) {
            return {
                dateKey: today,
                matchesPlayed: Math.max(0, Number(raw.matchesPlayed) || 0),
                rankedWins: Math.max(0, Number(raw.rankedWins) || 0),
                kills: Math.max(0, Number(raw.kills) || 0),
                jungleSlain: Math.max(0, Number(raw.jungleSlain) || 0),
                bossesSlain: Math.max(0, Number(raw.bossesSlain) || 0),
                claimedIds: Array.isArray(raw.claimedIds) ? raw.claimedIds.filter(function(q) {
                    return typeof q === 'string';
                }) : []
            };
        }
    } catch (unused) {
    // ignore corrupted daily mission data
    }
    return createFreshDailyState(today);
}
function loadOwnedCars() {
    var set = new Set([
        0
    ]);
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_owned') || '[0]');
        if (Array.isArray(raw)) {
            raw.forEach(function(id) {
                var n = Number(id);
                if (Number.isInteger(n) && n >= 0 && n <= 7) set.add(n);
            });
        }
    } catch (unused) {
    // ignore
    }
    return Array.from(set).sort(function(a, b) {
        return a - b;
    });
}
function loadCarUpgrades() {
    var out = {};
    for(var i = 0; i < 8; i++)out[i] = (0, _arenaRoster.defaultCarUpgrades)();
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_upgrades') || '{}');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object') {
            for(var i1 = 0; i1 < 8; i1++){
                var u = raw[String(i1)];
                if (u && (typeof u === "undefined" ? "undefined" : _type_of(u)) === 'object') {
                    out[i1] = {
                        speed: Math.max(1, Math.min(5, Number(u.speed) || 1)),
                        accel: Math.max(1, Math.min(5, Number(u.accel) || 1)),
                        nitro: Math.max(1, Math.min(5, Number(u.nitro) || 1)),
                        handling: Math.max(1, Math.min(5, Number(u.handling) || 1))
                    };
                }
            }
        }
    } catch (unused) {
    // ignore
    }
    return out;
}
function loadMapStars() {
    var stars = [
        0,
        0,
        0,
        0
    ];
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_asphalt_stars') || '[0,0,0,0]');
        if (Array.isArray(raw)) {
            for(var i = 0; i < 4; i++){
                stars[i] = Math.max(0, Math.min(3, Number(raw[i]) || 0));
            }
        }
    } catch (unused) {
    // ignore
    }
    return stars;
}
function loadHoopsTournament(teamId) {
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_hoops_tourney') || 'null');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object' && Array.isArray(raw.opponents) && raw.opponents.length === 3) {
            return {
                teamId: Math.max(0, Math.min(3, Number(raw.teamId) || 0)),
                round: [
                    1,
                    2,
                    3
                ].includes(Number(raw.round)) ? Number(raw.round) : 1,
                opponents: [
                    Math.max(0, Math.min(3, Number(raw.opponents[0]) || 0)),
                    Math.max(0, Math.min(3, Number(raw.opponents[1]) || 1)),
                    Math.max(0, Math.min(3, Number(raw.opponents[2]) || 2))
                ],
                champion: Boolean(raw.champion)
            };
        }
    } catch (unused) {
    // ignore
    }
    return (0, _arenaRoster.createTournamentBracket)(teamId);
}
function loadHoops2K26Profile() {
    var today = (0, _arenaRoster.getLocalDateKey)();
    var base = (0, _arenaRoster.createDefaultHoops2K26Profile)(today);
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_hoops2k26_v1') || 'null');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object') {
            var _raw_settings, _raw_myCourt, _raw_timers, _raw_careerStats, _raw_gameChangers;
            var mergedSaves = Array.isArray(raw.saves) && raw.saves.length > 0 ? raw.saves.map(function(s, idx) {
                return _extends({}, (0, _arenaRoster.createDefaultMyPlayerSave)("mp_" + (idx + 1)), s);
            }) : base.saves;
            var daily = raw.dailyChallenges && raw.dailyChallenges.dateKey === today && Array.isArray(raw.dailyChallenges.tasks) ? raw.dailyChallenges : (0, _arenaRoster.createDailyChallengesForDate)(today);
            return _extends({}, base, raw, {
                settings: _extends({}, _arenaRoster.DEFAULT_HOOPS_2K26_SETTINGS, (_raw_settings = raw.settings) != null ? _raw_settings : {}),
                myCourt: _extends({}, _arenaRoster.DEFAULT_MYCOURT_DESIGN, (_raw_myCourt = raw.myCourt) != null ? _raw_myCourt : {}),
                timers: _extends({}, base.timers, (_raw_timers = raw.timers) != null ? _raw_timers : {}),
                careerStats: _extends({}, base.careerStats, (_raw_careerStats = raw.careerStats) != null ? _raw_careerStats : {}),
                gameChangers: _extends({}, base.gameChangers, (_raw_gameChangers = raw.gameChangers) != null ? _raw_gameChangers : {}),
                saves: mergedSaves,
                activeSaveId: typeof raw.activeSaveId === 'string' && mergedSaves.some(function(s) {
                    return s.id === raw.activeSaveId;
                }) ? raw.activeSaveId : mergedSaves[0].id,
                dailyChallenges: daily,
                activeMatchContext: null
            });
        }
    } catch (unused) {
    // ignore malformed storage
    }
    return base;
}
var parsedCoins = parseInt(tryStorage.getItem('tsepang_coins') || '100', 10);
var savedTeam = Math.max(0, Math.min(3, parseInt(tryStorage.getItem('tsepang_basketball_team') || '0', 10) || 0));
var savedBrMode = tryStorage.getItem('tsepang_br_mode');
var savedBrMap = tryStorage.getItem('tsepang_br_map');
var savedMobaMode = tryStorage.getItem('tsepang_moba_mode');
var savedMobaSpell = tryStorage.getItem('tsepang_moba_spell');
var savedMobaEmblem = tryStorage.getItem('tsepang_moba_emblem_sel');
var savedHoopsMode = tryStorage.getItem('tsepang_hoops_mode');
var maxHeroId = Math.max(2, _arenaRoster.MOBA_HEROES.length - 1);
var unlockedHeroesInit = loadUnlockedMobaHeroes();
var rawSelectedHero = Math.max(0, Math.min(maxHeroId, parseInt(tryStorage.getItem('tsepang_moba_hero') || '0', 10) || 0));
var maxNarutoId = Math.max(3, _arenaRoster.NARUTO_SHINOBI_ROSTER.length - 1);
var unlockedNarutoInit = loadUnlockedNarutoHeroes();
var rawSelectedNaruto = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_hero') || '0', 10) || 0));
var rawNarutoSup1 = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_sup1') || '1', 10) || 1));
var rawNarutoSup2 = Math.max(0, Math.min(maxNarutoId, parseInt(tryStorage.getItem('tsepang_naruto_sup2') || '2', 10) || 2));
var savedNarutoMode = tryStorage.getItem('tsepang_naruto_mode');
var savedNarutoStage = tryStorage.getItem('tsepang_naruto_stage');
var savedSup1Type = tryStorage.getItem('tsepang_naruto_sup1_type');
var savedSup2Type = tryStorage.getItem('tsepang_naruto_sup2_type');
var mobaMetaInit = loadMobaMetaBlob();
var validMobaModes = new Set(_arenaRoster.MOBA_MODES.map(function(m) {
    return m.id;
}));
var validMobaSpells = new Set(_arenaRoster.MOBA_SPELLS.map(function(s) {
    return s.id;
}));
var validMobaEmblems = new Set([
    'Common',
    'Tank',
    'Assassin',
    'Mage',
    'Fighter',
    'Support',
    'Marksman'
]);
var playerState = {
    totalCoins: Number.isNaN(parsedCoins) ? 100 : parsedCoins,
    sessionCoins: 0,
    sessionExp: 0,
    playerXp: parseInt(tryStorage.getItem('tsepang_xp') || '0', 10) || 0,
    playerLevel: parseInt(tryStorage.getItem('tsepang_lvl') || '1', 10) || 1,
    currentAvatar: tryStorage.getItem('tsepang_avatar') || '😀',
    unlockedAvatars: loadUnlockedAvatars(),
    highScores: loadHighScores(),
    username: tryStorage.getItem('tsepang_username') || 'TsepangPlayer',
    selectedChessTimeSec: function() {
        var t = parseInt(tryStorage.getItem('tsepang_chess_time') || '600', 10);
        return t === 60 || t === 300 || t === 600 || t === 900 ? t : 600;
    }(),
    selectedBrMode: savedBrMode === 'squad' ? 'squad' : 'solo',
    selectedBrMap: savedBrMap === 'sanhok' ? 'sanhok' : 'erangel',
    brSupplyCrateReady: tryStorage.getItem('tsepang_br_crate') === '1',
    brWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_br_wins') || '0', 10) || 0),
    brKills: Math.max(0, parseInt(tryStorage.getItem('tsepang_br_kills') || '0', 10) || 0),
    selectedMobaHero: unlockedHeroesInit.includes(rawSelectedHero) ? rawSelectedHero : 0,
    mobaTrialHeroId: null,
    unlockedMobaHeroes: unlockedHeroesInit,
    selectedMobaMode: savedMobaMode && validMobaModes.has(savedMobaMode) ? savedMobaMode : 'classic',
    selectedMobaSpell: savedMobaSpell && validMobaSpells.has(savedMobaSpell) ? savedMobaSpell : 'flicker',
    selectedMobaEmblem: savedMobaEmblem && validMobaEmblems.has(savedMobaEmblem) ? savedMobaEmblem : 'Fighter',
    mobaEmblemLevels: loadMobaEmblemLevels(),
    mobaEmblemTalents: mergeEmblemTalents(mobaMetaInit.emblemTalents),
    mobaCustomBuilds: mobaMetaInit.customBuilds && _type_of(mobaMetaInit.customBuilds) === 'object' ? mobaMetaInit.customBuilds : {},
    mobaBp: Math.max(0, Number((_mobaMetaInit_bp = mobaMetaInit.bp) != null ? _mobaMetaInit_bp : 12000)),
    mobaTickets: Math.max(0, Number((_mobaMetaInit_tickets = mobaMetaInit.tickets) != null ? _mobaMetaInit_tickets : 250)),
    mobaDiamonds: Math.max(0, Number((_mobaMetaInit_diamonds = mobaMetaInit.diamonds) != null ? _mobaMetaInit_diamonds : 120)),
    mobaPromoDiamonds: Math.max(0, Number((_mobaMetaInit_promoDiamonds = mobaMetaInit.promoDiamonds) != null ? _mobaMetaInit_promoDiamonds : 60)),
    mobaOwnedSkins: mobaMetaInit.ownedSkins && _type_of(mobaMetaInit.ownedSkins) === 'object' ? mobaMetaInit.ownedSkins : {},
    mobaEquippedSkins: mobaMetaInit.equippedSkins && _type_of(mobaMetaInit.equippedSkins) === 'object' ? mobaMetaInit.equippedSkins : {},
    mobaOwnedRecallEffects: Array.isArray(mobaMetaInit.ownedRecallEffects) ? Array.from(new Set([].concat([
        'recall_classic'
    ], mobaMetaInit.ownedRecallEffects))) : [
        'recall_classic'
    ],
    mobaRecallEffect: typeof mobaMetaInit.recallEffect === 'string' ? mobaMetaInit.recallEffect : 'recall_classic',
    mobaOwnedElimEffects: Array.isArray(mobaMetaInit.ownedElimEffects) ? Array.from(new Set([].concat([
        'elim_classic'
    ], mobaMetaInit.ownedElimEffects))) : [
        'elim_classic'
    ],
    mobaElimEffect: typeof mobaMetaInit.elimEffect === 'string' ? mobaMetaInit.elimEffect : 'elim_classic',
    mobaOwnedEmotes: Array.isArray(mobaMetaInit.ownedEmotes) ? Array.from(new Set([].concat(_arenaRoster.DEFAULT_STARTER_EMOTE_IDS, mobaMetaInit.ownedEmotes.filter(function(v) {
        return typeof v === 'string';
    })))) : [].concat(_arenaRoster.DEFAULT_STARTER_EMOTE_IDS),
    mobaEquippedEmotes: (0, _arenaRoster.normalizeEquippedEmotes)(mobaMetaInit.equippedEmotes, Array.isArray(mobaMetaInit.ownedEmotes) ? mobaMetaInit.ownedEmotes.filter(function(v) {
        return typeof v === 'string';
    }) : _arenaRoster.DEFAULT_STARTER_EMOTE_IDS),
    mobaCreditScore: Math.max(0, Math.min(110, Number((_mobaMetaInit_creditScore = mobaMetaInit.creditScore) != null ? _mobaMetaInit_creditScore : 110))),
    mobaMatchHistory: Array.isArray(mobaMetaInit.matchHistory) ? mobaMetaInit.matchHistory.slice(0, 20) : [],
    mobaHeroMastery: mobaMetaInit.heroMastery && _type_of(mobaMetaInit.heroMastery) === 'object' ? mobaMetaInit.heroMastery : {},
    mobaSquad: {
        name: typeof ((_mobaMetaInit_squad = mobaMetaInit.squad) == null ? void 0 : _mobaMetaInit_squad.name) === 'string' ? mobaMetaInit.squad.name : 'Dawn Guardians',
        tag: typeof ((_mobaMetaInit_squad1 = mobaMetaInit.squad) == null ? void 0 : _mobaMetaInit_squad1.tag) === 'string' ? mobaMetaInit.squad.tag : 'DAWN',
        slogan: typeof ((_mobaMetaInit_squad2 = mobaMetaInit.squad) == null ? void 0 : _mobaMetaInit_squad2.slogan) === 'string' ? mobaMetaInit.squad.slogan : 'Push turrets, secure Lord, claim Mythic!'
    },
    mobaClaimedAchievements: Array.isArray(mobaMetaInit.claimedAchievements) ? mobaMetaInit.claimedAchievements.filter(function(v) {
        return typeof v === 'string';
    }) : [],
    mobaStarlightXp: Math.max(0, Number((_mobaMetaInit_starlightXp = mobaMetaInit.starlightXp) != null ? _mobaMetaInit_starlightXp : 40)),
    mobaStarlightClaimed: Array.isArray(mobaMetaInit.starlightClaimed) ? mobaMetaInit.starlightClaimed.map(Number).filter(Number.isFinite) : [],
    mobaCheckInDay: Math.max(0, Math.min(7, Number((_mobaMetaInit_checkInDay = mobaMetaInit.checkInDay) != null ? _mobaMetaInit_checkInDay : 0))),
    mobaCheckInLastDate: typeof mobaMetaInit.checkInLastDate === 'string' ? mobaMetaInit.checkInLastDate : '',
    mobaBackpack: {
        trialCards: Math.max(0, Number((_ref = (_mobaMetaInit_backpack = mobaMetaInit.backpack) == null ? void 0 : _mobaMetaInit_backpack.trialCards) != null ? _ref : 3)),
        doubleBpCards: Math.max(0, Number((_ref1 = (_mobaMetaInit_backpack1 = mobaMetaInit.backpack) == null ? void 0 : _mobaMetaInit_backpack1.doubleBpCards) != null ? _ref1 : 2)),
        activeDoubleBp: Boolean((_mobaMetaInit_backpack2 = mobaMetaInit.backpack) == null ? void 0 : _mobaMetaInit_backpack2.activeDoubleBp),
        starProtectionCards: Math.max(0, Number((_ref2 = (_mobaMetaInit_backpack3 = mobaMetaInit.backpack) == null ? void 0 : _mobaMetaInit_backpack3.starProtectionCards) != null ? _ref2 : 1))
    },
    mobaDraftBans: Array.isArray(mobaMetaInit.draftBans) ? mobaMetaInit.draftBans.map(Number).filter(function(n) {
        return Number.isInteger(n) && n >= 0 && n <= maxHeroId;
    }).slice(0, 6) : [],
    mobaSettings: _extends({}, _arenaRoster.DEFAULT_MOBA_SETTINGS, (_mobaMetaInit_settings = mobaMetaInit.settings) != null ? _mobaMetaInit_settings : {}),
    mobaWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_wins') || '0', 10) || 0),
    mobaMatchesPlayed: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_matches') || '0', 10) || 0),
    mobaKillsTotal: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_kills') || '0', 10) || 0),
    mobaTurretsDestroyed: Math.max(0, parseInt(tryStorage.getItem('tsepang_moba_turrets') || '0', 10) || 0),
    claimedMobaQuests: loadClaimedMobaQuests(),
    mobaDaily: loadMobaDailyState(),
    selectedAsphaltCar: Math.max(0, Math.min(7, parseInt(tryStorage.getItem('tsepang_asphalt_car') || '0', 10) || 0)),
    ownedAsphaltCars: loadOwnedCars(),
    carUpgrades: loadCarUpgrades(),
    selectedAsphaltMap: Math.max(0, Math.min(3, parseInt(tryStorage.getItem('tsepang_asphalt_map') || '0', 10) || 0)),
    asphaltMapStars: loadMapStars(),
    selectedBasketballTeam: savedTeam,
    selectedHoopsMode: savedHoopsMode === '2v2' || savedHoopsMode === '3v3' || savedHoopsMode === 'tournament' ? savedHoopsMode : '5v5',
    hoopsChampionships: Math.max(0, parseInt(tryStorage.getItem('tsepang_hoops_champs') || '0', 10) || 0),
    hoopsTournament: loadHoopsTournament(savedTeam),
    hoops2k26: loadHoops2K26Profile(),
    selectedNarutoHero: unlockedNarutoInit.includes(rawSelectedNaruto) ? rawSelectedNaruto : 0,
    narutoTrialHeroId: null,
    unlockedNarutoHeroes: unlockedNarutoInit,
    selectedNarutoSupport1: rawNarutoSup1,
    selectedNarutoSupport2: rawNarutoSup2,
    narutoSupport1Type: savedSup1Type === 'guard' || savedSup1Type === 'charge' || savedSup1Type === 'cover_fire' ? savedSup1Type : 'attack',
    narutoSupport2Type: savedSup2Type === 'attack' || savedSup2Type === 'charge' || savedSup2Type === 'cover_fire' ? savedSup2Type : 'guard',
    selectedNarutoMode: savedNarutoMode === 'senki_4v4' || savedNarutoMode === 'storm_3v3' || savedNarutoMode === 'storm_1v1' ? savedNarutoMode : 'senki_3v3',
    selectedNarutoStage: savedNarutoStage === 'valley_of_end' || savedNarutoStage === 'chunin_arena' || savedNarutoStage === 'shinobi_war_crater' || savedNarutoStage === 'kaguya_dimension' ? savedNarutoStage : 'konoha_gates',
    narutoWins: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_wins') || '0', 10) || 0),
    narutoMatchesPlayed: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_matches') || '0', 10) || 0),
    narutoKillsTotal: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_kills') || '0', 10) || 0),
    narutoTowersDestroyed: Math.max(0, parseInt(tryStorage.getItem('tsepang_naruto_towers') || '0', 10) || 0)
};
function persistCoinsAndUnlocks() {
    tryStorage.setItem('tsepang_coins', String(playerState.totalCoins));
    tryStorage.setItem('tsepang_unlocks', JSON.stringify(Array.from(playerState.unlockedAvatars)));
}
function persistHighScores() {
    tryStorage.setItem('tsepang_high_scores', JSON.stringify(playerState.highScores));
}
function persistXpAndLevel() {
    tryStorage.setItem('tsepang_xp', String(playerState.playerXp));
    tryStorage.setItem('tsepang_lvl', String(playerState.playerLevel));
}
function persistArenaSelections() {
    tryStorage.setItem('tsepang_br_mode', playerState.selectedBrMode);
    tryStorage.setItem('tsepang_br_map', playerState.selectedBrMap);
    tryStorage.setItem('tsepang_br_crate', playerState.brSupplyCrateReady ? '1' : '0');
    tryStorage.setItem('tsepang_moba_hero', String(playerState.selectedMobaHero));
    tryStorage.setItem('tsepang_moba_mode', playerState.selectedMobaMode);
    tryStorage.setItem('tsepang_moba_spell', playerState.selectedMobaSpell);
    tryStorage.setItem('tsepang_moba_emblem_sel', playerState.selectedMobaEmblem);
    tryStorage.setItem('tsepang_asphalt_car', String(playerState.selectedAsphaltCar));
    tryStorage.setItem('tsepang_asphalt_map', String(playerState.selectedAsphaltMap));
    tryStorage.setItem('tsepang_basketball_team', String(playerState.selectedBasketballTeam));
    tryStorage.setItem('tsepang_hoops_mode', playerState.selectedHoopsMode);
}
function persistMobaProgression() {
    tryStorage.setItem('tsepang_moba_hero', String(playerState.selectedMobaHero));
    tryStorage.setItem('tsepang_moba_unlocked', JSON.stringify(playerState.unlockedMobaHeroes));
    tryStorage.setItem('tsepang_moba_emblem_sel', playerState.selectedMobaEmblem);
    tryStorage.setItem('tsepang_moba_emblems', JSON.stringify(playerState.mobaEmblemLevels));
    tryStorage.setItem('tsepang_moba_quests', JSON.stringify(playerState.claimedMobaQuests));
}
function persistAsphaltGarage() {
    tryStorage.setItem('tsepang_asphalt_car', String(playerState.selectedAsphaltCar));
    tryStorage.setItem('tsepang_asphalt_owned', JSON.stringify(playerState.ownedAsphaltCars));
    tryStorage.setItem('tsepang_asphalt_upgrades', JSON.stringify(playerState.carUpgrades));
    tryStorage.setItem('tsepang_asphalt_map', String(playerState.selectedAsphaltMap));
    tryStorage.setItem('tsepang_asphalt_stars', JSON.stringify(playerState.asphaltMapStars));
}
function persistHoopsTournament() {
    tryStorage.setItem('tsepang_hoops_mode', playerState.selectedHoopsMode);
    tryStorage.setItem('tsepang_hoops_champs', String(playerState.hoopsChampionships));
    tryStorage.setItem('tsepang_hoops_tourney', JSON.stringify(playerState.hoopsTournament));
}
function persistHoops2K26() {
    var safeCopy = _extends({}, playerState.hoops2k26, {
        activeMatchContext: null
    });
    tryStorage.setItem('tsepang_hoops2k26_v1', JSON.stringify(safeCopy));
}
function persistBrStats() {
    tryStorage.setItem('tsepang_br_crate', playerState.brSupplyCrateReady ? '1' : '0');
    tryStorage.setItem('tsepang_br_wins', String(playerState.brWins));
    tryStorage.setItem('tsepang_br_kills', String(playerState.brKills));
}
function persistMobaStats() {
    tryStorage.setItem('tsepang_moba_wins', String(playerState.mobaWins));
    tryStorage.setItem('tsepang_moba_matches', String(playerState.mobaMatchesPlayed));
    tryStorage.setItem('tsepang_moba_kills', String(playerState.mobaKillsTotal));
    tryStorage.setItem('tsepang_moba_turrets', String(playerState.mobaTurretsDestroyed));
    tryStorage.setItem('tsepang_moba_quests', JSON.stringify(playerState.claimedMobaQuests));
}
function persistMobaMeta() {
    var blob = {
        bp: playerState.mobaBp,
        tickets: playerState.mobaTickets,
        diamonds: playerState.mobaDiamonds,
        promoDiamonds: playerState.mobaPromoDiamonds,
        emblemTalents: playerState.mobaEmblemTalents,
        customBuilds: playerState.mobaCustomBuilds,
        ownedSkins: playerState.mobaOwnedSkins,
        equippedSkins: playerState.mobaEquippedSkins,
        ownedRecallEffects: playerState.mobaOwnedRecallEffects,
        recallEffect: playerState.mobaRecallEffect,
        ownedElimEffects: playerState.mobaOwnedElimEffects,
        elimEffect: playerState.mobaElimEffect,
        ownedEmotes: playerState.mobaOwnedEmotes,
        equippedEmotes: playerState.mobaEquippedEmotes,
        creditScore: playerState.mobaCreditScore,
        matchHistory: playerState.mobaMatchHistory.slice(0, 20),
        heroMastery: playerState.mobaHeroMastery,
        squad: playerState.mobaSquad,
        claimedAchievements: playerState.mobaClaimedAchievements,
        starlightXp: playerState.mobaStarlightXp,
        starlightClaimed: playerState.mobaStarlightClaimed,
        checkInDay: playerState.mobaCheckInDay,
        checkInLastDate: playerState.mobaCheckInLastDate,
        backpack: playerState.mobaBackpack,
        draftBans: playerState.mobaDraftBans,
        settings: playerState.mobaSettings
    };
    tryStorage.setItem('tsepang_moba_meta_v2', JSON.stringify(blob));
}
function recordMobaMatchResult(params) {
    var _playerState_mobaHeroMastery_params_heroId;
    var kdaRatio = (params.kills + 1) / Math.max(1, params.deaths + 1);
    var medal = params.victory && (params.kills >= 4 || kdaRatio >= 2.2) ? 'MVP' : kdaRatio >= 1.2 || params.victory ? 'Gold' : 'Silver';
    var rec = {
        id: "m_" + Date.now().toString(36),
        heroId: params.heroId,
        heroName: params.heroName,
        mode: params.mode,
        victory: params.victory,
        kills: params.kills,
        deaths: params.deaths,
        gold: Math.round(params.gold),
        score: Math.round(params.score),
        durationSec: Math.max(1, Math.round(params.durationSec)),
        medal: medal,
        items: params.items.slice(0, 6),
        timestamp: Date.now()
    };
    playerState.mobaMatchHistory = [].concat([
        rec
    ], playerState.mobaMatchHistory).slice(0, 20);
    // Update Hero Mastery & MMR
    var prev = (_playerState_mobaHeroMastery_params_heroId = playerState.mobaHeroMastery[params.heroId]) != null ? _playerState_mobaHeroMastery_params_heroId : {
        matches: 0,
        wins: 0,
        mmr: 1000,
        masteryPts: 0
    };
    playerState.mobaHeroMastery[params.heroId] = {
        matches: prev.matches + 1,
        wins: prev.wins + (params.victory ? 1 : 0),
        mmr: Math.max(800, prev.mmr + (params.victory ? 42 + params.kills * 4 : -18 + params.kills * 2)),
        masteryPts: prev.masteryPts + (params.victory ? 160 : 85) + params.kills * 15
    };
    // Award BP, Tickets, StarLight XP, Credit Score
    var bpBase = params.victory ? 420 : 210;
    var bpMult = playerState.mobaBackpack.activeDoubleBp ? 2 : 1;
    playerState.mobaBp += (bpBase + params.kills * 35) * bpMult;
    if (playerState.mobaBackpack.activeDoubleBp) {
        playerState.mobaBackpack.activeDoubleBp = false;
    }
    playerState.mobaTickets += params.victory ? 22 : 10;
    playerState.mobaStarlightXp += params.victory ? 65 : 35;
    playerState.mobaCreditScore = Math.min(110, playerState.mobaCreditScore + 1);
    persistMobaMeta();
}
function persistMobaDaily() {
    tryStorage.setItem('tsepang_moba_daily', JSON.stringify(playerState.mobaDaily));
}
function ensureCurrentMobaDailyState(date) {
    if (date === void 0) date = new Date();
    var today = (0, _arenaRoster.getLocalDateKey)(date);
    if (playerState.mobaDaily.dateKey !== today) {
        playerState.mobaDaily = createFreshDailyState(today);
        persistMobaDaily();
    }
    return playerState.mobaDaily;
}
function recordMobaDailyEvent(event, amount, date) {
    if (amount === void 0) amount = 1;
    if (date === void 0) date = new Date();
    var daily = ensureCurrentMobaDailyState(date);
    var delta = Math.max(1, Math.round(amount));
    if (event === 'match') daily.matchesPlayed += delta;
    else if (event === 'ranked_win') daily.rankedWins += delta;
    else if (event === 'kill') daily.kills += delta;
    else if (event === 'jungle') daily.jungleSlain += delta;
    else if (event === 'boss') daily.bossesSlain += delta;
    persistMobaDaily();
}
function persistNarutoProgression() {
    tryStorage.setItem('tsepang_naruto_hero', String(playerState.selectedNarutoHero));
    tryStorage.setItem('tsepang_naruto_unlocked', JSON.stringify(playerState.unlockedNarutoHeroes));
    tryStorage.setItem('tsepang_naruto_sup1', String(playerState.selectedNarutoSupport1));
    tryStorage.setItem('tsepang_naruto_sup2', String(playerState.selectedNarutoSupport2));
    tryStorage.setItem('tsepang_naruto_sup1_type', playerState.narutoSupport1Type);
    tryStorage.setItem('tsepang_naruto_sup2_type', playerState.narutoSupport2Type);
    tryStorage.setItem('tsepang_naruto_mode', playerState.selectedNarutoMode);
    tryStorage.setItem('tsepang_naruto_stage', playerState.selectedNarutoStage);
    tryStorage.setItem('tsepang_naruto_wins', String(playerState.narutoWins));
    tryStorage.setItem('tsepang_naruto_matches', String(playerState.narutoMatchesPlayed));
    tryStorage.setItem('tsepang_naruto_kills', String(playerState.narutoKillsTotal));
    tryStorage.setItem('tsepang_naruto_towers', String(playerState.narutoTowersDestroyed));
}
function persistChessTime(sec) {
    var valid = sec === 60 || sec === 300 || sec === 600 || sec === 900 ? sec : 600;
    playerState.selectedChessTimeSec = valid;
    tryStorage.setItem('tsepang_chess_time', String(valid));
}
function loadUiPrefs() {
    try {
        var raw = JSON.parse(tryStorage.getItem('tsepang_ui_prefs_v1') || 'null');
        if (raw && (typeof raw === "undefined" ? "undefined" : _type_of(raw)) === 'object') return raw;
    } catch (unused) {
    // ignore malformed storage
    }
    return {};
}
function saveUiPrefs(partial) {
    var merged = _extends({}, loadUiPrefs(), partial);
    tryStorage.setItem('tsepang_ui_prefs_v1', JSON.stringify(merged));
}

});
// === MODULE: src/core/types ===
ArcadeMod.define("src/core/types", function(require, module, exports) {
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "difficultyScalers", {
    enumerable: true,
    get: function() {
        return difficultyScalers;
    }
});
var difficultyScalers = {
    easy: {
        speedMult: 0.85,
        spawnMult: 0.85
    },
    medium: {
        speedMult: 1.0,
        spawnMult: 1.0
    },
    hard: {
        speedMult: 1.25,
        spawnMult: 1.2
    },
    extreme: {
        speedMult: 1.5,
        spawnMult: 1.4
    }
};

});
// === MODULE: src/core/viewport ===
ArcadeMod.define("src/core/viewport", function(require, module, exports) {
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
    get computeViewportSnapshot () {
        return computeViewportSnapshot;
    },
    get exitAppFullscreen () {
        return exitAppFullscreen;
    },
    get getAutoFullscreenEnabled () {
        return getAutoFullscreenEnabled;
    },
    get getOrientationMode () {
        return getOrientationMode;
    },
    get getViewportSize () {
        return getViewportSize;
    },
    get getViewportSnapshot () {
        return getViewportSnapshot;
    },
    get initViewportManager () {
        return initViewportManager;
    },
    get installBrowserPolyfills () {
        return installBrowserPolyfills;
    },
    get isNativeFullscreenSupported () {
        return isNativeFullscreenSupported;
    },
    get isSmartphoneFingerprint () {
        return isSmartphoneFingerprint;
    },
    get mapClientDeltaToStage () {
        return mapClientDeltaToStage;
    },
    get mapClientToStage () {
        return mapClientToStage;
    },
    get refreshViewportSnapshot () {
        return refreshViewportSnapshot;
    },
    get requestAppFullscreen () {
        return requestAppFullscreen;
    },
    get requestNativeLandscape () {
        return requestNativeLandscape;
    },
    get setActiveLandscapeGame () {
        return setActiveLandscapeGame;
    },
    get setAutoFullscreenEnabled () {
        return setAutoFullscreenEnabled;
    },
    get setOrientationMode () {
        return setOrientationMode;
    },
    get subscribeViewport () {
        return subscribeViewport;
    },
    get toggleAppFullscreen () {
        return toggleAppFullscreen;
    },
    get toggleAutoFullscreenEnabled () {
        return toggleAutoFullscreenEnabled;
    },
    get toggleOrientationMode () {
        return toggleOrientationMode;
    },
    get tryAutoFullscreenOnGesture () {
        return tryAutoFullscreenOnGesture;
    },
    get unlockNativeOrientation () {
        return unlockNativeOrientation;
    }
});
var _storage = require("./storage");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _create_for_of_iterator_helper_loose(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (Array.isArray(o) || (it = _unsupported_iterable_to_array(o)) || allowArrayLike && o && typeof o.length === "number") {
        if (it) o = it;
        var i = 0;
        return function() {
            if (i >= o.length) return {
                done: true
            };
            return {
                done: false,
                value: o[i++]
            };
        };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _instanceof(left, right) {
    "@swc/helpers - instanceof";
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else return left instanceof right;
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype), d = Object.defineProperty;
    return d(g, "next", {
        value: verb(0)
    }), d(g, "throw", {
        value: verb(1)
    }), d(g, "return", {
        value: verb(2)
    }), typeof Symbol === "function" && d(g, Symbol.iterator, {
        value: function() {
            return this;
        }
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var ORIENTATION_STORAGE_KEY = 'tsepang_orientation_mode';
var AUTO_FULLSCREEN_STORAGE_KEY = 'tsepang_auto_fullscreen';
function isSmartphoneFingerprint(input) {
    var _input_maxTouchPoints;
    var ua = input.userAgent || '';
    var hasPhoneUa = /Android.*Mobile|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile Safari/i.test(ua);
    var isTabletUa = /iPad|Tablet|PlayBook|Silk/i.test(ua) || /Android/i.test(ua) && !/Mobile/i.test(ua);
    var hasTouch = Boolean(input.hasCoarsePointer || input.hasTouchStart || ((_input_maxTouchPoints = input.maxTouchPoints) != null ? _input_maxTouchPoints : 0) > 0);
    var minScreen = Math.min(input.screenW || 0, input.screenH || 0);
    var maxScreen = Math.max(input.screenW || 0, input.screenH || 0);
    var minInner = Math.min(input.innerW || 0, input.innerH || 0);
    var maxInner = Math.max(input.innerW || 0, input.innerH || 0);
    if (hasPhoneUa) return true;
    if (!hasTouch) return false;
    if (isTabletUa) {
        return minInner > 0 && minInner <= 500;
    }
    if (input.hasCoarsePointer || input.hasTouchStart) {
        if (minScreen > 0 && minScreen <= 600 && maxScreen <= 1050) return true;
        if (minInner > 0 && minInner <= 560 && maxInner <= 1000) return true;
    }
    return false;
}
function computeViewportSnapshot(physW, physH, isSmartphone, orientationMode, nativeLandscapeLocked, nativeFullscreen, fullscreenSupported, immersiveFallback, autoFullscreenEnabled, forceLandscapeOnPortrait) {
    if (nativeFullscreen === void 0) nativeFullscreen = false;
    if (fullscreenSupported === void 0) fullscreenSupported = false;
    if (immersiveFallback === void 0) immersiveFallback = false;
    if (autoFullscreenEnabled === void 0) autoFullscreenEnabled = true;
    if (forceLandscapeOnPortrait === void 0) forceLandscapeOnPortrait = false;
    var w = Math.max(240, Math.round(physW || 800));
    var h = Math.max(240, Math.round(physH || 600));
    var physicalOrientation = w >= h ? 'landscape' : 'portrait';
    // If browser/WebView claims nativeLandscapeLocked while physical dimensions remain portrait,
    // do NOT suppress the 90-degree rotated stage fallback.
    var effectiveNativeLocked = Boolean(nativeLandscapeLocked && physicalOrientation === 'landscape');
    var shouldRotatePortrait = orientationMode === 'auto' && physicalOrientation === 'portrait' && !effectiveNativeLocked && (isSmartphone || forceLandscapeOnPortrait || w <= 900);
    var isRotatedFallback = Boolean(shouldRotatePortrait);
    return {
        isSmartphone: isSmartphone,
        physicalWidth: w,
        physicalHeight: h,
        physicalOrientation: physicalOrientation,
        logicalWidth: isRotatedFallback ? h : w,
        logicalHeight: isRotatedFallback ? w : h,
        isRotatedFallback: isRotatedFallback,
        nativeLandscapeLocked: effectiveNativeLocked,
        orientationMode: orientationMode,
        isFullscreen: Boolean(nativeFullscreen || immersiveFallback),
        nativeFullscreen: Boolean(nativeFullscreen),
        fullscreenSupported: Boolean(fullscreenSupported),
        immersiveFallback: Boolean(immersiveFallback),
        autoFullscreenEnabled: Boolean(autoFullscreenEnabled)
    };
}
function mapClientToStage(clientX, clientY, snap) {
    if (snap === void 0) snap = getViewportSnapshot();
    if (!snap.isRotatedFallback) {
        return {
            x: clientX,
            y: clientY
        };
    }
    return {
        x: clientY,
        y: snap.physicalWidth - clientX
    };
}
function mapClientDeltaToStage(dx, dy, snap) {
    if (snap === void 0) snap = getViewportSnapshot();
    if (!snap.isRotatedFallback) {
        return {
            dx: dx,
            dy: dy
        };
    }
    return {
        dx: dy,
        dy: -dx
    };
}
var cachedOrientationMode = _storage.tryStorage.getItem(ORIENTATION_STORAGE_KEY) === 'free' ? 'free' : 'auto';
var cachedAutoFullscreen = _storage.tryStorage.getItem(AUTO_FULLSCREEN_STORAGE_KEY) !== 'off';
var cachedNativeLocked = false;
var cachedImmersiveFallback = false;
var cachedForceLandscapeOnPortrait = false;
var manualExitSuppressed = false;
var lastAutoAttemptTs = 0;
var dispatchingSyntheticResize = false;
var initialized = false;
var currentSnapshot = computeViewportSnapshot(800, 600, false, cachedOrientationMode, false, false, false, false, cachedAutoFullscreen, false);
var listeners = new Set();
function readPhysicalDimensions() {
    if (typeof window === 'undefined') return {
        width: 800,
        height: 600,
        offsetTop: 0
    };
    var vv = window.visualViewport;
    var docEl = document.documentElement;
    var width = Math.round((vv == null ? void 0 : vv.width) || (docEl == null ? void 0 : docEl.clientWidth) || window.innerWidth || 800);
    var height = Math.round((vv == null ? void 0 : vv.height) || (docEl == null ? void 0 : docEl.clientHeight) || window.innerHeight || 600);
    var offsetTop = Math.max(0, Math.round((vv == null ? void 0 : vv.offsetTop) || 0));
    return {
        width: Math.max(240, width),
        height: Math.max(240, height),
        offsetTop: offsetTop
    };
}
function isStandaloneDisplayMode() {
    if (typeof window === 'undefined') return false;
    try {
        var nav = navigator;
        if (nav.standalone === true) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    } catch (unused) {
    // ignore unsupported media query
    }
    return false;
}
function detectCurrentSmartphone(physW, physH) {
    var _window_screen, _window_screen1;
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    var hasCoarse = false;
    try {
        hasCoarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    } catch (unused) {
        hasCoarse = false;
    }
    return isSmartphoneFingerprint({
        userAgent: navigator.userAgent || '',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        hasCoarsePointer: hasCoarse,
        hasTouchStart: 'ontouchstart' in window,
        screenW: ((_window_screen = window.screen) == null ? void 0 : _window_screen.width) || physW,
        screenH: ((_window_screen1 = window.screen) == null ? void 0 : _window_screen1.height) || physH,
        innerW: physW,
        innerH: physH
    });
}
function getFullscreenElement() {
    if (typeof document === 'undefined') return null;
    var doc = document;
    return doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement || null;
}
function getFullscreenCandidates() {
    if (typeof document === 'undefined') return [];
    var out = [];
    if (document.documentElement) out.push(document.documentElement);
    if (document.body) out.push(document.body);
    return out;
}
function isNativeFullscreenSupported() {
    if (typeof document === 'undefined') return false;
    var doc = document;
    var explicitlyDisabled = doc.fullscreenEnabled === false && doc.webkitFullscreenEnabled !== true && doc.mozFullScreenEnabled !== true && doc.msFullscreenEnabled !== true;
    if (explicitlyDisabled) return false;
    var candidates = getFullscreenCandidates();
    for(var i = 0; i < candidates.length; i++){
        var el = candidates[i];
        if (typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function' || typeof el.webkitRequestFullScreen === 'function' || typeof el.mozRequestFullScreen === 'function' || typeof el.msRequestFullscreen === 'function') {
            return true;
        }
    }
    return false;
}
function syncDocumentClassesAndVars(snap, offsetTop) {
    if (offsetTop === void 0) offsetTop = 0;
    if (typeof document === 'undefined') return;
    var rootStyle = document.documentElement.style;
    rootStyle.setProperty('--phys-w', "" + snap.physicalWidth + "px");
    rootStyle.setProperty('--phys-h', "" + snap.physicalHeight + "px");
    rootStyle.setProperty('--stage-w', "" + snap.logicalWidth + "px");
    rootStyle.setProperty('--stage-h', "" + snap.logicalHeight + "px");
    rootStyle.setProperty('--app-vw', "" + (snap.logicalWidth * 0.01).toFixed(3) + "px");
    rootStyle.setProperty('--app-vh', "" + (snap.logicalHeight * 0.01).toFixed(3) + "px");
    rootStyle.setProperty('--vv-offset-top', "" + offsetTop + "px");
    var body = document.body;
    if (!body) return;
    body.classList.toggle('smartphone-device', snap.isSmartphone);
    body.classList.toggle('rotated-landscape', snap.isRotatedFallback);
    body.classList.toggle('force-landscape-ui', snap.isRotatedFallback || snap.isSmartphone && snap.physicalOrientation === 'landscape');
    body.classList.toggle('portrait-viewport', !snap.isRotatedFallback && snap.logicalHeight > snap.logicalWidth && snap.logicalWidth < 860);
    body.classList.toggle('app-fullscreen', snap.isFullscreen);
    body.classList.toggle('viewport-fullscreen-fallback', snap.immersiveFallback && !snap.nativeFullscreen);
}
function engageImmersiveViewportFit() {
    cachedImmersiveFallback = true;
    if (typeof window !== 'undefined') {
        try {
            window.scrollTo(0, 1);
        } catch (unused) {
        // ignore scroll restrictions
        }
        window.setTimeout(function() {
            try {
                window.scrollTo(0, 0);
            } catch (unused) {
            // ignore
            }
            refreshViewportSnapshot();
        }, 80);
    }
    refreshViewportSnapshot();
}
function refreshViewportSnapshot() {
    var _readPhysicalDimensions = readPhysicalDimensions(), width = _readPhysicalDimensions.width, height = _readPhysicalDimensions.height, offsetTop = _readPhysicalDimensions.offsetTop;
    var isPhone = detectCurrentSmartphone(width, height);
    var nativeFs = Boolean(getFullscreenElement()) || isStandaloneDisplayMode();
    var fsSupported = isNativeFullscreenSupported();
    // If browser exited fullscreen externally (e.g. Android Back or swipe down), reset native orientation lock
    if (!nativeFs && cachedNativeLocked) {
        cachedNativeLocked = false;
    }
    // If physical screen is still portrait, never claim nativeLandscapeLocked is active
    if (width < height && cachedNativeLocked) {
        cachedNativeLocked = false;
    }
    if (width >= height && cachedNativeLocked && typeof screen !== 'undefined') {
        var _screen_orientation;
        var orientType = ((_screen_orientation = screen.orientation) == null ? void 0 : _screen_orientation.type) || '';
        if (orientType && !orientType.startsWith('landscape')) {
            cachedNativeLocked = false;
        }
    }
    // If native fullscreen succeeded, clear fallback flag cleanly
    if (nativeFs && cachedImmersiveFallback) {
        cachedImmersiveFallback = false;
    }
    var next = computeViewportSnapshot(width, height, isPhone, cachedOrientationMode, cachedNativeLocked, nativeFs, fsSupported, cachedImmersiveFallback, cachedAutoFullscreen, cachedForceLandscapeOnPortrait);
    var logicalChanged = next.logicalWidth !== currentSnapshot.logicalWidth || next.logicalHeight !== currentSnapshot.logicalHeight || next.isRotatedFallback !== currentSnapshot.isRotatedFallback;
    var changed = logicalChanged || next.isSmartphone !== currentSnapshot.isSmartphone || next.physicalWidth !== currentSnapshot.physicalWidth || next.physicalHeight !== currentSnapshot.physicalHeight || next.nativeLandscapeLocked !== currentSnapshot.nativeLandscapeLocked || next.orientationMode !== currentSnapshot.orientationMode || next.isFullscreen !== currentSnapshot.isFullscreen || next.nativeFullscreen !== currentSnapshot.nativeFullscreen || next.fullscreenSupported !== currentSnapshot.fullscreenSupported || next.immersiveFallback !== currentSnapshot.immersiveFallback || next.autoFullscreenEnabled !== currentSnapshot.autoFullscreenEnabled;
    currentSnapshot = next;
    syncDocumentClassesAndVars(next, offsetTop);
    if (changed) {
        listeners.forEach(function(cb) {
            return cb(next);
        });
    }
    if (logicalChanged && typeof window !== 'undefined' && !dispatchingSyntheticResize) {
        dispatchingSyntheticResize = true;
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (unused) {
        // ignore legacy Event construction errors
        } finally{
            dispatchingSyntheticResize = false;
        }
    }
    return next;
}
function initViewportManager() {
    if (typeof window === 'undefined') return currentSnapshot;
    var snap = refreshViewportSnapshot();
    if (initialized) return snap;
    initialized = true;
    var orientTimer = null;
    var fsTimer = null;
    var onViewportEvent = function onViewportEvent() {
        refreshViewportSnapshot();
    };
    var onFullscreenEvent = function onFullscreenEvent() {
        refreshViewportSnapshot();
        if (fsTimer) clearTimeout(fsTimer);
        fsTimer = setTimeout(function() {
            fsTimer = null;
            refreshViewportSnapshot();
        }, 180);
    };
    var onOrientationEvent = function onOrientationEvent() {
        refreshViewportSnapshot();
        if (orientTimer) clearTimeout(orientTimer);
        orientTimer = setTimeout(function() {
            orientTimer = null;
            refreshViewportSnapshot();
        }, 160);
    };
    window.addEventListener('resize', onViewportEvent, {
        passive: true
    });
    window.addEventListener('orientationchange', onOrientationEvent);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportEvent, {
            passive: true
        });
        window.visualViewport.addEventListener('scroll', onViewportEvent, {
            passive: true
        });
    }
    document.addEventListener('fullscreenchange', onFullscreenEvent);
    document.addEventListener('webkitfullscreenchange', onFullscreenEvent);
    document.addEventListener('mozfullscreenchange', onFullscreenEvent);
    document.addEventListener('MSFullscreenChange', onFullscreenEvent);
    return snap;
}
function getViewportSnapshot() {
    if (typeof window !== 'undefined' && !initialized) {
        return initViewportManager();
    }
    return currentSnapshot;
}
function getViewportSize() {
    var snap = getViewportSnapshot();
    return {
        width: snap.logicalWidth,
        height: snap.logicalHeight
    };
}
function subscribeViewport(cb) {
    listeners.add(cb);
    return function() {
        listeners.delete(cb);
    };
}
function getOrientationMode() {
    return cachedOrientationMode;
}
function setOrientationMode(mode) {
    cachedOrientationMode = mode;
    _storage.tryStorage.setItem(ORIENTATION_STORAGE_KEY, mode);
    if (mode === 'free') {
        // Unlock orientation ONLY — never kick the user out of Full Screen
        unlockNativeOrientationOnly();
    }
    return refreshViewportSnapshot();
}
function setActiveLandscapeGame(preferred) {
    cachedForceLandscapeOnPortrait = Boolean(preferred);
    return refreshViewportSnapshot();
}
function toggleOrientationMode() {
    var next = cachedOrientationMode === 'auto' ? 'free' : 'auto';
    setOrientationMode(next);
    return next;
}
function getAutoFullscreenEnabled() {
    return cachedAutoFullscreen;
}
function setAutoFullscreenEnabled(enabled) {
    cachedAutoFullscreen = Boolean(enabled);
    _storage.tryStorage.setItem(AUTO_FULLSCREEN_STORAGE_KEY, cachedAutoFullscreen ? 'on' : 'off');
    if (cachedAutoFullscreen) {
        manualExitSuppressed = false;
    }
    return refreshViewportSnapshot();
}
function toggleAutoFullscreenEnabled() {
    var next = !cachedAutoFullscreen;
    setAutoFullscreenEnabled(next);
    return next;
}
/**
 * Synchronously starts a cross-browser Fullscreen request on the current user-gesture call stack.
 * Keeping the initial invocation synchronous prevents mobile browsers (Chrome Android, Samsung Internet,
 * Firefox, Opera/UC, WebViews) from rejecting the request due to expired user activation.
 */ function invokeNativeFullscreenSync() {
    if (typeof document === 'undefined') return Promise.resolve(false);
    if (getFullscreenElement() || isStandaloneDisplayMode()) return Promise.resolve(true);
    if (!isNativeFullscreenSupported()) return Promise.resolve(false);
    var candidates = getFullscreenCandidates();
    for(var i = 0; i < candidates.length; i++){
        var el = candidates[i];
        try {
            var maybePromise = void 0;
            if (typeof el.requestFullscreen === 'function') {
                try {
                    maybePromise = el.requestFullscreen({
                        navigationUI: 'hide'
                    });
                } catch (unused) {
                    maybePromise = el.requestFullscreen();
                }
            } else if (typeof el.webkitRequestFullscreen === 'function') {
                maybePromise = el.webkitRequestFullscreen();
            } else if (typeof el.webkitRequestFullScreen === 'function') {
                maybePromise = el.webkitRequestFullScreen();
            } else if (typeof el.mozRequestFullScreen === 'function') {
                maybePromise = el.mozRequestFullScreen();
            } else if (typeof el.msRequestFullscreen === 'function') {
                maybePromise = el.msRequestFullscreen();
            } else {
                continue;
            }
            if (maybePromise && typeof maybePromise.then === 'function') {
                return maybePromise.then(function() {
                    refreshViewportSnapshot();
                    return true;
                }, function() {
                    return false;
                });
            }
            refreshViewportSnapshot();
            return Promise.resolve(Boolean(getFullscreenElement()));
        } catch (unused) {
        // try next candidate element (e.g. document.body)
        }
    }
    return Promise.resolve(false);
}
function exitCrossBrowserFullscreen() {
    return _async_to_generator(function() {
        var doc, unused;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (typeof document === 'undefined' || !getFullscreenElement()) return [
                        2
                    ];
                    doc = document;
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        12,
                        ,
                        13
                    ]);
                    if (!(typeof doc.exitFullscreen === 'function')) return [
                        3,
                        3
                    ];
                    return [
                        4,
                        doc.exitFullscreen()
                    ];
                case 2:
                    _state.sent();
                    return [
                        3,
                        11
                    ];
                case 3:
                    if (!(typeof doc.webkitExitFullscreen === 'function')) return [
                        3,
                        5
                    ];
                    return [
                        4,
                        Promise.resolve(doc.webkitExitFullscreen())
                    ];
                case 4:
                    _state.sent();
                    return [
                        3,
                        11
                    ];
                case 5:
                    if (!(typeof doc.webkitCancelFullScreen === 'function')) return [
                        3,
                        7
                    ];
                    return [
                        4,
                        Promise.resolve(doc.webkitCancelFullScreen())
                    ];
                case 6:
                    _state.sent();
                    return [
                        3,
                        11
                    ];
                case 7:
                    if (!(typeof doc.mozCancelFullScreen === 'function')) return [
                        3,
                        9
                    ];
                    return [
                        4,
                        Promise.resolve(doc.mozCancelFullScreen())
                    ];
                case 8:
                    _state.sent();
                    return [
                        3,
                        11
                    ];
                case 9:
                    if (!(typeof doc.msExitFullscreen === 'function')) return [
                        3,
                        11
                    ];
                    return [
                        4,
                        Promise.resolve(doc.msExitFullscreen())
                    ];
                case 10:
                    _state.sent();
                    _state.label = 11;
                case 11:
                    return [
                        3,
                        13
                    ];
                case 12:
                    unused = _state.sent();
                    return [
                        3,
                        13
                    ];
                case 13:
                    return [
                        2
                    ];
            }
        });
    })();
}
function requestAppFullscreen(opts) {
    var allowFallback = !opts || opts.allowFallback !== false;
    manualExitSuppressed = false;
    if (getFullscreenElement() || isStandaloneDisplayMode()) {
        refreshViewportSnapshot();
        return Promise.resolve({
            ok: true,
            mode: 'native'
        });
    }
    // Must invoke native fullscreen SYNCHRONOUSLY inside the caller's gesture stack
    var nativePromise = invokeNativeFullscreenSync();
    return nativePromise.then(function(enteredNative) {
        if (enteredNative || getFullscreenElement() || isStandaloneDisplayMode()) {
            cachedImmersiveFallback = false;
            refreshViewportSnapshot();
            return {
                ok: true,
                mode: 'native'
            };
        }
        if (allowFallback) {
            engageImmersiveViewportFit();
            return {
                ok: true,
                mode: 'fallback'
            };
        }
        refreshViewportSnapshot();
        return {
            ok: false,
            mode: 'blocked'
        };
    });
}
function exitAppFullscreen() {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    manualExitSuppressed = true;
                    cachedImmersiveFallback = false;
                    return [
                        4,
                        exitCrossBrowserFullscreen()
                    ];
                case 1:
                    _state.sent();
                    refreshViewportSnapshot();
                    return [
                        2
                    ];
            }
        });
    })();
}
function toggleAppFullscreen() {
    var snap = getViewportSnapshot();
    if (snap.nativeFullscreen || snap.immersiveFallback) {
        return exitAppFullscreen().then(function() {
            return {
                ok: true,
                mode: 'exited'
            };
        });
    }
    return requestAppFullscreen({
        allowFallback: true
    });
}
function tryAutoFullscreenOnGesture(opts) {
    var snap = getViewportSnapshot();
    if (!snap.isSmartphone) return false;
    if (!cachedAutoFullscreen) return false;
    var forceOnLaunch = Boolean(opts && opts.forceOnLaunch);
    if (manualExitSuppressed && !forceOnLaunch) return false;
    if (snap.nativeFullscreen) return false;
    if (!snap.fullscreenSupported && snap.immersiveFallback) return false;
    var now = Date.now();
    if (!forceOnLaunch && now - lastAutoAttemptTs < 350) return false;
    lastAutoAttemptTs = now;
    void requestAppFullscreen({
        allowFallback: true
    });
    return true;
}
function unlockNativeOrientationOnly() {
    cachedNativeLocked = false;
    if (typeof screen !== 'undefined') {
        var scr = screen;
        try {
            var _screen_orientation_unlock, _screen_orientation;
            (_screen_orientation = screen.orientation) == null ? void 0 : (_screen_orientation_unlock = _screen_orientation.unlock) == null ? void 0 : _screen_orientation_unlock.call(_screen_orientation);
            scr.unlockOrientation == null ? void 0 : scr.unlockOrientation.call(scr);
            scr.mozUnlockOrientation == null ? void 0 : scr.mozUnlockOrientation.call(scr);
            scr.msUnlockOrientation == null ? void 0 : scr.msUnlockOrientation.call(scr);
        } catch (unused) {
        // ignore if unsupported
        }
    }
}
function requestNativeLandscape() {
    return _async_to_generator(function() {
        var scr, orient, lockedAttempted, unused, legacyLock, dims, unused1;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    // Immediately engage Auto-Landscape CSS stage fallback if currently portrait so user sees instant rotation
                    cachedOrientationMode = 'auto';
                    _storage.tryStorage.setItem(ORIENTATION_STORAGE_KEY, 'auto');
                    cachedNativeLocked = false;
                    refreshViewportSnapshot();
                    if (!!getFullscreenElement()) return [
                        3,
                        2
                    ];
                    return [
                        4,
                        requestAppFullscreen({
                            allowFallback: cachedAutoFullscreen
                        })
                    ];
                case 1:
                    _state.sent();
                    _state.label = 2;
                case 2:
                    if (!(typeof screen !== 'undefined')) return [
                        3,
                        12
                    ];
                    scr = screen;
                    orient = screen.orientation;
                    _state.label = 3;
                case 3:
                    _state.trys.push([
                        3,
                        11,
                        ,
                        12
                    ]);
                    lockedAttempted = false;
                    if (!(orient && typeof orient.lock === 'function')) return [
                        3,
                        9
                    ];
                    _state.label = 4;
                case 4:
                    _state.trys.push([
                        4,
                        6,
                        ,
                        8
                    ]);
                    return [
                        4,
                        orient.lock('landscape')
                    ];
                case 5:
                    _state.sent();
                    return [
                        3,
                        8
                    ];
                case 6:
                    unused = _state.sent();
                    return [
                        4,
                        orient.lock('landscape-primary')
                    ];
                case 7:
                    _state.sent();
                    return [
                        3,
                        8
                    ];
                case 8:
                    lockedAttempted = true;
                    return [
                        3,
                        10
                    ];
                case 9:
                    legacyLock = scr.lockOrientation || scr.mozLockOrientation || scr.msLockOrientation;
                    if (typeof legacyLock === 'function' && legacyLock.call(scr, [
                        'landscape-primary',
                        'landscape-secondary'
                    ])) {
                        lockedAttempted = true;
                    }
                    _state.label = 10;
                case 10:
                    if (lockedAttempted) {
                        // Verify physical dimensions — WebViews/desktop browsers often resolve lock() without actually rotating
                        dims = readPhysicalDimensions();
                        cachedNativeLocked = dims.width >= dims.height;
                        refreshViewportSnapshot();
                        if (typeof window !== 'undefined') {
                            window.setTimeout(function() {
                                var later = readPhysicalDimensions();
                                cachedNativeLocked = later.width >= later.height;
                                refreshViewportSnapshot();
                            }, 240);
                        }
                        if (cachedNativeLocked) {
                            return [
                                2,
                                {
                                    ok: true,
                                    reason: 'locked'
                                }
                            ];
                        }
                    }
                    return [
                        3,
                        12
                    ];
                case 11:
                    unused1 = _state.sent();
                    return [
                        3,
                        12
                    ];
                case 12:
                    cachedNativeLocked = false;
                    refreshViewportSnapshot();
                    return [
                        2,
                        {
                            ok: false,
                            reason: 'fallback'
                        }
                    ];
            }
        });
    })();
}
function unlockNativeOrientation() {
    return _async_to_generator(function() {
        return _ts_generator(this, function(_state) {
            unlockNativeOrientationOnly();
            refreshViewportSnapshot();
            return [
                2
            ];
        });
    })();
}
function installBrowserPolyfills() {
    if (typeof window === 'undefined') return;
    var win = window;
    if (typeof win.globalThis === 'undefined') {
        win.globalThis = window;
    }
    if (typeof window.requestAnimationFrame !== 'function') {
        var raf = win.webkitRequestAnimationFrame || win.mozRequestAnimationFrame || function(cb) {
            return window.setTimeout(function() {
                return cb(Date.now());
            }, 16);
        };
        window.requestAnimationFrame = raf;
    }
    if (typeof window.cancelAnimationFrame !== 'function') {
        var caf = win.webkitCancelAnimationFrame || win.mozCancelAnimationFrame || function(id) {
            return window.clearTimeout(id);
        };
        window.cancelAnimationFrame = caf;
    }
    if (typeof window.performance === 'undefined' || typeof window.performance.now !== 'function') {
        var start = Date.now();
        win.performance = {
            now: function now() {
                return Date.now() - start;
            }
        };
    }
    var protoArr = Array.prototype;
    if (typeof protoArr.at !== 'function') {
        protoArr.at = function(idx) {
            var n = Math.trunc(idx) || 0;
            var k = n < 0 ? this.length + n : n;
            return k >= 0 && k < this.length ? this[k] : undefined;
        };
    }
    var protoStr = String.prototype;
    if (typeof protoStr.replaceAll !== 'function') {
        protoStr.replaceAll = function(search, rep) {
            if (_instanceof(search, RegExp)) {
                return this.replace(search.global ? search : new RegExp(search.source, "" + search.flags + "g"), rep);
            }
            return this.split(search).join(rep);
        };
    }
    if (typeof Object.hasOwn !== 'function') {
        Object.hasOwn = function(o, k) {
            return Object.prototype.hasOwnProperty.call(Object(o), k);
        };
    }
    if (typeof win.AudioContext === 'undefined' && typeof win.webkitAudioContext !== 'undefined') {
        win.AudioContext = win.webkitAudioContext;
    }
    if (typeof CanvasRenderingContext2D !== 'undefined' && typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
            var parseR = function parseR(v) {
                if (typeof v === 'number') return Math.max(0, v);
                if (v && (typeof v === "undefined" ? "undefined" : _type_of(v)) === 'object') {
                    var obj = v;
                    return Math.max(0, Number(obj.x || obj.y || 0));
                }
                return 0;
            };
            var r = [
                0,
                0,
                0,
                0
            ];
            if (typeof radii === 'number' || radii && (typeof radii === "undefined" ? "undefined" : _type_of(radii)) === 'object' && !Array.isArray(radii)) {
                var rv = parseR(radii);
                r = [
                    rv,
                    rv,
                    rv,
                    rv
                ];
            } else if (Array.isArray(radii) && radii.length > 0) {
                if (radii.length === 1) {
                    var a = parseR(radii[0]);
                    r = [
                        a,
                        a,
                        a,
                        a
                    ];
                } else if (radii.length === 2) {
                    var b0 = parseR(radii[0]);
                    var b1 = parseR(radii[1]);
                    r = [
                        b0,
                        b1,
                        b0,
                        b1
                    ];
                } else if (radii.length === 3) {
                    var c0 = parseR(radii[0]);
                    var c1 = parseR(radii[1]);
                    var c2 = parseR(radii[2]);
                    r = [
                        c0,
                        c1,
                        c2,
                        c1
                    ];
                } else {
                    r = [
                        parseR(radii[0]),
                        parseR(radii[1]),
                        parseR(radii[2]),
                        parseR(radii[3])
                    ];
                }
            }
            if (w < 0) {
                x += w;
                w = -w;
            }
            if (h < 0) {
                y += h;
                h = -h;
            }
            var maxR = Math.min(w * 0.5, h * 0.5);
            for(var i = 0; i < 4; i++){
                if (r[i] > maxR) r[i] = maxR;
            }
            this.moveTo(x + r[0], y);
            this.lineTo(x + w - r[1], y);
            if (r[1] > 0) this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
            this.lineTo(x + w, y + h - r[2]);
            if (r[2] > 0) this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
            this.lineTo(x + r[3], y + h);
            if (r[3] > 0) this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
            this.lineTo(x, y + r[0]);
            if (r[0] > 0) this.quadraticCurveTo(x, y, x + r[0], y);
            this.closePath();
        };
    }
    if (typeof win.ResizeObserver === 'undefined') {
        win.ResizeObserver = /*#__PURE__*/ function() {
            "use strict";
            function FallbackResizeObserver(cb) {
                var _this = this;
                this.targets = [];
                this.timer = null;
                this.check = function() {
                    var entries = [];
                    for(var _iterator = _create_for_of_iterator_helper_loose(_this.targets), _step; !(_step = _iterator()).done;){
                        var t = _step.value;
                        var rect = t.el.getBoundingClientRect();
                        if (rect.width !== t.w || rect.height !== t.h) {
                            t.w = rect.width;
                            t.h = rect.height;
                            entries.push({
                                target: t.el,
                                contentRect: rect
                            });
                        }
                    }
                    if (entries.length) {
                        try {
                            _this.cb(entries);
                        } catch (unused) {}
                    }
                };
                this.cb = cb;
            }
            var _proto = FallbackResizeObserver.prototype;
            _proto.observe = function observe(el) {
                this.targets.push({
                    el: el,
                    w: -1,
                    h: -1
                });
                if (this.targets.length === 1) {
                    window.addEventListener('resize', this.check);
                    this.timer = setInterval(this.check, 350);
                }
                setTimeout(this.check, 0);
            };
            _proto.unobserve = function unobserve(el) {
                this.targets = this.targets.filter(function(t) {
                    return t.el !== el;
                });
                if (!this.targets.length) this.disconnect();
            };
            _proto.disconnect = function disconnect() {
                this.targets = [];
                window.removeEventListener('resize', this.check);
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }
            };
            return FallbackResizeObserver;
        }();
    }
    if (typeof Element !== 'undefined') {
        if (!Element.prototype.setPointerCapture) {
            Element.prototype.setPointerCapture = function() {};
        }
        if (!Element.prototype.releasePointerCapture) {
            Element.prototype.releasePointerCapture = function() {};
        }
    }
    initViewportManager();
}

});

})(window.ArcadeMod);
