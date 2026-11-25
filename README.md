# 🌿 Tsepang Garden & Game Arcade — Complete Developer & Beginner Handbook

> **Live Modular Edition (`?v=11`)** · **29 Playable Games** · **100% Offline (`file://`) & Online Ready** · **Legacy Mobile ES5 Safe** · **VS Code & Acode Compatible (`<= 150 KB` per file)**

This handbook explains **every single part** of Tsepang Garden & Game Arcade: how the codebase is structured, how all **29 games (`0`–`28`)** work internally, how to **edit buttons, colors, UI, HUD, and controls**, how to **add a brand-new game**, how to **find and fix bugs**, and how to work smoothly in **both** development workflows:

- **Workflow A (Full Source + Build Sync — Recommended on PC/VS Code/Node.js):** Edit clean TypeScript/React/CSS in `src/`, then run `npm run sync:live` to regenerate strict ES5 `vendor/`, `core/`, `games/`, and root `index.html`.
- **Workflow B (Direct Live Offline Editing — Acode on Android / No Node.js):** Edit multi-line formatted ES5 `.js` and downgraded `.css` directly inside `core/`, `games/<slug>/`, and root `index.html`, then refresh the browser immediately.

---

## Table of Contents

1. [Architecture & Boot Flow](#1-architecture--boot-flow)
2. [Complete Project Map & Code Tree](#2-complete-project-map--code-tree)
3. [All 29 Games — Master Catalog & Engine Logic](#3-all-29-games--master-catalog--engine-logic)
4. [Flagship Games Deep Dive](#4-flagship-games-deep-dive)
5. [Core Systems Explained](#5-core-systems-explained)
6. [How to Edit Buttons & Fix Missing Colors](#6-how-to-edit-buttons--fix-missing-colors)
7. [How to Edit UI, HUD, Controls & Settings](#7-how-to-edit-ui-hud-controls--settings)
8. [How to Create & Add a New Game (Game #29+)](#8-how-to-create--add-a-new-game-game-29)
9. [How to Find & Fix Bugs (Troubleshooting Playbook)](#9-how-to-find--fix-bugs-troubleshooting-playbook)
10. [Storage Keys Reference (`localStorage`)](#10-storage-keys-reference-localstorage)
11. [Commands, Automated Tests & Editor Setup (VS Code & Acode)](#11-commands-automated-tests--editor-setup-vs-code--acode)

---

## 1. Architecture & Boot Flow

Tsepang Arcade is engineered to run **100% offline from a ZIP (`file://index.html`)** on **old and new smartphones** (legacy Android WebView, older iOS Safari, Samsung Internet, Opera/UC) AND online via Vite (`http://localhost:3000`) with **zero external CDNs** and **zero `fetch()` calls**.

### How `index.html` Boots (Strict Load Order)

Root `index.html` (~13.4 KB) loads standard browser-native `<link rel="stylesheet">` and classic `<script src="./...?v=11">` tags (never `<script type="module">`) in this exact order:

```text
index.html (?v=11)
 │
 ├── 1. CSS Stylesheets (downgraded for old browsers: oklch/color-mix -> hex/rgba)
 │     ├── ./core/styles-tailwind-1.css?v=11
 │     ├── ./core/styles-tailwind-2.css?v=11
 │     ├── ./core/styles-base.css?v=11
 │     ├── ./core/styles-games.css?v=11
 │     ├── ./games/hoops-2k26/styles.css?v=11
 │     ├── ./games/legends-arena/styles.css?v=11
 │     └── ./games/stockfish-chess/styles.css?v=11
 │
 ├── 2. Polyfills & Classic Module Runtime
 │     ├── ./vendor/polyfills.js?v=11       (Promise, Object.assign, roundRect, rAF, etc.)
 │     └── ./core/module-runtime.js?v=11    (Installs window.ArcadeMod: define, defineChunk, require)
 │
 ├── 3. Vendor Libraries (Split <= 150 KB each, strict ES5)
 │     ├── ./vendor/react-core.js?v=11      (react + react/jsx-runtime + scheduler)
 │     ├── ./vendor/react-dom-1..3.js?v=11  (react-dom + react-dom/client via defineChunk)
 │     └── ./vendor/three-1..9.js?v=11      (Three.js 3D engine via defineChunk)
 │
 ├── 4. Core Engine, Shared 3D & Arcade Shell UI
 │     ├── ./core/engine-base-1..2.js?v=11  (BaseGame, BaseFPSGame, storage, audio, viewport, controls)
 │     ├── ./core/three-shared.js?v=11      (Shared Three.js materials/geometries/lights)
 │     ├── ./core/ui-shell-1..5.js?v=11     (ArcadeShell, Garden background, HUD, Analog/D-Pad)
 │     ├── ./core/ui-settings-1..4.js?v=11  (Garden Settings, Pause Studio, Profile/Avatar Store)
 │     └── ./core/ui-lobbies-1..4.js?v=11   (Lobby3DOverlay, Legacy HUDs, Showcase3D)
 │
 ├── 5. All 29 Isolated Game Folders
 │     └── ./games/<game-slug>/*.js?v=11    (Each game registers its module in window.ArcadeMod)
 │
 └── 6. Final Registry & React Mount
       ├── ./core/registry.js?v=11          (Maps data-game 0..28 -> Game class constructors)
       └── ./core/app-main.js?v=11          (Installs window.Arcade & mounts <ArcadeShell /> in #root)
```

### Why `window.ArcadeMod` Exists

Classic browsers opening `file://index.html` block ES Modules (`import`/`export`) due to CORS restrictions and crash on modern JS syntax. `core/module-runtime.js` implements a tiny, zero-dependency CommonJS-style module loader (`window.ArcadeMod`):

- `ArcadeMod.define(id, function(require, module, exports) { ... })` registers a module.
- `ArcadeMod.defineChunk(id, partIdx, totalParts, partStr)` splits large modules (> 140 KB) across multiple `<= 150 KB` files and safely reassembles them with `new Function(...)` once all parts load.
- `ArcadeMod.require(id)` resolves relative paths (`./`, `../`), strips `.ts`/`.tsx`/`.js` extensions, caches exports, and executes the module.

### Hard Constraints Enforced Automatically by `npm run sync:live`

1. **150 KB Hard Cap:** No single live `.js` or `.css` file may exceed `150 KB` (verified automatically by `scripts/emit-live-folders.mjs`).
2. **Strict ES5 Validation:** Every emitted `.js` file in `vendor/`, `core/`, and `games/` is parsed by **Acorn (`ecmaVersion: 5`)** to guarantee zero `const`, `let`, `=>`, `?.`, `??`, template literals, or class syntax leaks.
3. **Module Graph Verification:** `verifyEmittedModuleGraph()` simulates loading every script in `index.html` and asserts that `react`, `react/jsx-runtime`, `react-dom/client`, `three`, `src/core/registry`, and `src/main` compile and resolve without errors.
4. **Legacy CSS Downgrade:** `scripts/legacy-css-downgrade.mjs` converts Tailwind v4 `oklch()` / `color-mix()` / `@property --tw-*` rules into universal sRGB hex/rgba colors so buttons never turn invisible on older phones.

---

## 2. Complete Project Map & Code Tree

```text
/                                   # Workspace Root
├── index.html                      # Single live launcher (<15 KB, ?v=11)
├── README.md                       # This complete handbook
├── PROJECT_MAP.txt                 # Quick 2 KB summary map
├── .editorconfig                   # UTF-8, LF, 2-space indent (VS Code + Acode)
├── .vscode/
│   ├── settings.json               # Pre-tuned VS Code settings (excludes heavy scans)
│   └── extensions.json             # Recommended VS Code extensions
├── package.json                    # Scripts: dev, build, sync:live, lint
├── vite.config.ts                  # Vite dev server (port 3000) + React optimizeDeps
│
├── vendor/                         # Strict ES5 third-party runtimes (<= 150 KB each)
│   ├── polyfills.js                # Browser polyfills (Promise, Object.assign, roundRect, etc.)
│   ├── react-core.js               # React 19 + jsx-runtime
│   ├── react-dom-1.js .. 3.js      # ReactDOM + react-dom/client chunks
│   └── three-1.js .. 9.js          # Three.js 3D library chunks
│
├── core/                           # Live ES5 shared engine, CSS, and UI (<= 150 KB each)
│   ├── module-runtime.js           # window.ArcadeMod loader
│   ├── styles-tailwind-1..2.css    # Downgraded Tailwind v4 utilities (sRGB safe)
│   ├── styles-base.css             # Garden layout, themes, auto-landscape & fullscreen CSS
│   ├── styles-games.css            # Shared game & modal CSS
│   ├── engine-base-1..2.js         # BaseGame, BaseFPSGame, storage, audio, viewport, controls
│   ├── three-shared.js             # Shared Three.js helpers
│   ├── ui-shell-1..5.js            # Main ArcadeShell, Garden, Virtual Controls, HUD
│   ├── ui-settings-1..4.js         # Garden Settings, Pause Studio, Profile/Avatar Store
│   ├── ui-lobbies-1..4.js          # 3D Lobby overlays & legacy DOM game HUDs
│   ├── registry.js                 # Registers games 0..28
│   └── app-main.js                 # Bootstraps window.Arcade and mounts React root
│
├── games/                          # 29 Plug-and-Play Live ES5 Game Folders (<= 150 KB/file)
│   ├── super-runner/               # [00] game.js
│   ├── flappy-bird/                # [01] game.js
│   ├── fruit-slash/                # [02] game.js
│   ├── catch-butterflies/          # [03] game.js
│   ├── code-hero/                  # [04] game.js
│   ├── highway-racer/              # [05] game.js
│   ├── stockfish-chess/            # [06] game.js, engine.js, styles.css
│   ├── tactical-ops-fps/           # [07] game.js
│   ├── candy-clash/                # [08] game.js
│   ├── block-blast/                # [09] game.js
│   ├── subway-surfers/             # [10] game.js
│   ├── hill-climb/                 # [11] game.js
│   ├── plant-vs-zombie/            # [12] game.js
│   ├── angry-slingshot/            # [13] game.js
│   ├── cooking-frenzy/             # [14] game.js
│   ├── hungry-shark/               # [15] game.js
│   ├── worm-io/                    # [16] game.js
│   ├── stickman-brawl/             # [17] game.js
│   ├── eight-ball-pool/            # [18] game.js
│   ├── vector-parkour/             # [19] game.js
│   ├── crossword/                  # [20] game.js
│   ├── sudoku/                     # [21] game.js
│   ├── mini-militia/               # [22] data.js, engine-1..3.js, ui-1..4.js
│   ├── stick-war-legacy/           # [23] game.js
│   ├── battle-royale-3d/           # [24] game.js
│   ├── legends-arena/              # [25] data-1..19.js, engine-1..11.js, ui-1..17.js, styles.css
│   ├── asphalt-nitro-3d/           # [26] game.js
│   ├── hoops-2k26/                 # [27] data-1..7.js, engine-1..8.js, ui-1..29.js, styles.css
│   └── naruto-senki-storm/         # [28] data.js, engine-1..3.js
│
├── scripts/                        # Build & Compatibility Pipeline
│   ├── emit-live-folders.mjs       # Compiles src/ -> vendor/, core/, games/, index.html
│   ├── legacy-css-downgrade.mjs    # Converts Tailwind v4 CSS to legacy-browser sRGB CSS
│   └── legacy-polyfills.mjs        # Source for vendor/polyfills.js
│
└── src/                            # Authoritative TypeScript / React / CSS Source
    ├── main.tsx                    # React entry point (mounts ArcadeShell)
    ├── styles/
    │   ├── base.css                # Core layout, Garden, Auto-Landscape & Fullscreen CSS
    │   ├── games.css               # Shared in-game UI styles
    │   └── modals.css              # Modal dialogs, settings panels, stores
    ├── core/
    │   ├── arcadeGlobal.ts         # window.Arcade namespace & registerArcadeGame()
    │   ├── arenaRoster.ts          # Shared rosters, ranks, defaults for 3D/Arena games
    │   ├── audio.ts                # Web Audio API synth SFX + BGM themes + custom audio
    │   ├── BaseGame.ts             # 2D Canvas base class (loop, dt, particles, shake)
    │   ├── BaseFPSGame.ts          # First-Person Shooter base class (crosshair, recoil, zoom)
    │   ├── catalog.ts              # Avatars, shop catalog, themes
    │   ├── controlLayouts.ts       # Analog/Buttons layouts, Global Default, Custom Buttons
    │   ├── dailyReward.ts          # Daily login streak & coin rewards
    │   ├── emojiCache.ts           # Offscreen sprite cache for fast 60 FPS emoji rendering
    │   ├── instructions.ts         # GAME_LIST metadata for all 29 games
    │   ├── LobbyShowcase3D.ts      # 3D turntable hero/car/team preview renderer
    │   ├── registry.ts             # Maps data-game index 0..28 -> Game constructors
    │   ├── runtimeBridge.ts        # Bridge between game engines & React HUD/Coins/GameOver
    │   ├── storage.ts              # Safe tryStorage wrapper & all playerState persistence
    │   ├── threeShared.ts          # Shared Three.js helpers
    │   ├── types.ts                # Difficulty, GameInstance, GameMeta interfaces
    │   ├── viewport.ts             # Smartphone detection, Auto-Landscape 90° & Fullscreen
    │   ├── viewportFullscreen.test.ts  # Unit tests for viewport & landscape rotation
    │   └── ui/
    │       ├── ArcadeShell.tsx             # Main app container, Garden, Canvas/3D mount, HUD
    │       ├── ArcadeSettingsAndModals.tsx # Garden Settings, Pause Studio, Store, Game Over
    │       ├── ArcadeLegacyGameHuds.tsx    # HUD overlays for Chess, Sudoku, Crossword, etc.
    │       ├── Lobby3DOverlay.tsx          # Pre-match 3D lobbies (BR3D, Asphalt, Naruto)
    │       └── arcadeUiConstants.ts        # UI constants, themes, preset configs
    └── games/                      # TypeScript source for all 29 games + unit tests
        ├── <slug>/...              # 29 matching folders (same slugs as live /games/)
        ├── gamesLogic.test.ts      # Unit tests for arcade game logic
        ├── legendsArenaPart7.test.ts       # Unit tests for Legends Arena MLBB
        └── hoopsHybridPart1..7.test.ts     # Unit tests for Hoops 2K26 + NBA 2K14 Hybrid
```

---

## 3. All 29 Games — Master Catalog & Engine Logic

Every game has a **permanent `data-game` index (`0` to `28`)** locked in `src/core/registry.ts` and `src/core/instructions.ts`. **Never reorder existing indices**, or player high scores (`tsepang_high_scores`) will shift to the wrong game.

| ID | Slug (`games/<slug>/`) | Title | Class Name | Engine Type | Orientation | Core Gameplay Logic & Controls |
|---:|---|---|---|---|---|---|
| `0` | `super-runner` | 🏃 Super Runner | `SuperRunner` | 2D Canvas (`BaseGame`) | Any | Endless platform runner with double-jump, bricks, rocks, bats, star/shield pickups; `JUMP` / Space / W. |
| `1` | `flappy-bird` | 🐦 Flappy | `FlappyBird` | 2D Canvas (`BaseGame`) | Any | Gravity-impulse flapper threading dynamic pipe gaps with floating coin trails; `FLAP` / Space. |
| `2` | `fruit-slash` | 🍉 Fruit Slash | `FruitSlash` | 2D Canvas (`BaseGame`) | Any | Touch/mouse blade trail slicing parabolic fruit arcs, frenzy starfruit combos, bomb avoidance, 3 drop strikes. |
| `3` | `catch-butterflies` | 🦋 Catch Butterflies | `CatchButterflies` | 2D Canvas (`BaseGame`) | Any | Tap-to-catch moving butterflies with sinusoidal flight paths, combo multipliers, and bee hazard stings. |
| `4` | `code-hero` | 💻 Code Hero | `CodeHeroGame` | DOM Interactive | Any | Timed 30s programming quiz cards with live mini-lessons, streak bonuses, and Developer XP. |
| `5` | `highway-racer` | 🏎️ Highway Racer | `HighwayRacer` | 2D Canvas (`BaseGame`) | Landscape | Multi-lane top-down highway dodger with oncoming traffic AI, Nitro Boosts, Shield Orbs, and steering (`A`/`D` or Analog). |
| `6` | `stockfish-chess` | ♟️ Stockfish Chess | `StockfishChessGame` | DOM + AI Engine | Any | Full Chess rules (castling, en passant, promotion, checkmate/stalemate), 2750–3750+ Elo search engine, eval bar, move accuracy, 1/5/10/15-min clocks. |
| `7` | `tactical-ops-fps` | 🎯 Tactical Ops FPS | `TacticalOpsFPS` | 2D Canvas (`BaseFPSGame`) | Landscape | Rotating 3-mode FPS (Target Range, 2.4x Sniper Rescue, Zombie Siege) + Armored Helicopter/Juggernaut Boss raids, headshots, reload (`R`). |
| `8` | `candy-clash` | 🍬 Candy Clash | `CandyClashGame` | 2D Canvas (`BaseGame`) | Any | Match-3/4/5 swipe grid with Striped & Color-Burst specials, gravity cascades, and per-turn countdown timer. |
| `9` | `block-blast` | 🧱 Block Blast | `BlockBlastGame` | 2D Canvas (`BaseGame`) | Any | 8×8 drag-and-drop polyomino puzzle; clearing full rows/columns triggers combo multipliers; ends when 3 tray pieces cannot fit. |
| `10` | `subway-surfers` | 🚇 Subway Surfers | `SubwaySurfersGame` | 2D Canvas (`BaseGame`) | Any | Pseudo-3D 3-lane rail runner with lane swipes (`A`/`D`), jump (`W`), roll (`S`), Coin Magnets, and Hoverboard Shields. |
| `11` | `hill-climb` | 🚙 Hill Climb | `HillClimb` | 2D Canvas (`BaseGame`) | Landscape | Procedural spline terrain + spring-suspension vehicle physics; Gas (`▶`) pitches nose up, Brake (`◀`) pitches down; fuel cans & flip bonuses. |
| `12` | `plant-vs-zombie` | 🌻 Plant vs Zombie | `PlantVsZombie` | 2D Canvas (`BaseGame`) | Landscape | 5-lane tower defense with Sun economy, 8 plants (Sunflower, Peashooter, Snow Pea, Repeater, Wall-Nut, Potato Mine, Jalapeno, Cherry Bomb), Shovel, Lawnmowers, & Gargantuar Bosses. |
| `13` | `angry-slingshot` | 🐦 Angry Slingshot | `AngrySlingshot` | 2D Canvas (`BaseGame`) | Landscape | Elastic pull-back trajectory physics launching limited birds into destructible wood/stone towers to pop Piggies & King Pigs. |
| `14` | `cooking-frenzy` | 👨‍🍳 Cooking Frenzy | `CookingFrenzy` | 2D Canvas (`BaseGame`) | Any | Time-management kitchen with 20 gourmet dishes, 20 ingredients, customer patience bars, rush combos, and speed tips. |
| `15` | `hungry-shark` | 🦈 Hungry Shark | `HungryShark` | 2D Canvas (`BaseGame`) | Landscape | Infinite scrolling ocean with depth biomes (Reef, Twilight Trench, Abyss), hunger decay, Gold Rush Fever, and Megalodon growth tiers. |
| `16` | `worm-io` | 🐍 Worm.io | `WormIo` | 2D Canvas (`BaseGame`) | Any | Arena snake battler with smooth segment following, AI rival worms, length-draining Turbo Boost, and loot orb trails. |
| `17` | `stickman-brawl` | 🥷 Stickman Brawl | `StickmanBrawl` | 2D Canvas (`BaseGame`) | Landscape | Multi-floor scrolling side-scroller fighter (6–7 floors) with 3-hit attack combos, jump/drop-through platforms, Heal Crates, and Cyber/Shadow Bosses. |
| `18` | `eight-ball-pool` | 🎱 8 Ball Pool | `EightBallPool` | 2D Canvas (`BaseGame`) | Landscape | 2D elastic ball-collision billiards with cue-aiming trajectory guide, 18s turn shot clock vs AI Opponent, and Solo Timed rack mode. |
| `19` | `vector-parkour` | 🏃‍♂️ Vector Parkour | `VectorParkour` | 2D Canvas (`BaseGame`) | Any | High-speed neon rooftop runner with vaults, jumps (`W`/Up), slides (`S`/Down) under drones/beams, and Data Cube pickups. |
| `20` | `crossword` | 📝 Crossword | `Crossword` | DOM Interactive | Any | Interactive Across/Down grid puzzle with on-screen keyboard, clue selector, auto-advance, and 5-coin Letter Hints. |
| `21` | `sudoku` | 🔢 Sudoku | `Sudoku` | DOM Interactive | Any | 9×9 generator/solver with Pencil Notes mode, conflict highlighting, 3-mistake limit, and 5-coin Hints. |
| `22` | `mini-militia` | 🪖 Mini Militia | `MiniMilitia` + `MiniMilitiaShell` | 2D Canvas + Full React Lobby | Landscape | DA2-inspired warzone: 20 maps, 25 weapons, jetpack physics, radar minimap, grenades, gunship bosses, loadouts & custom rooms. |
| `23` | `stick-war-legacy` | ⚔️ Stick War: Legacy | `StickWarLegacy` | 2D Canvas (`BaseGame`) | Landscape | Side-scrolling RTS: train 8 unit classes (Miner, Sword, Archidon, Spearton, Magikill, Giant, Albowtross, Meric), stances (Attack/Defend/Retreat), Castle Archers, Rage Horn & Gold Rush spells. |
| `24` | `battle-royale-3d` | 🪖 Battle Royale 3D | `BattleRoyale3D` | 3D Three.js + `Lobby3DOverlay` | Landscape | PUBG-inspired 3D survival: C-130 parachute drop on Erangel/Sanhok (Solo/Squad), 4 guns (M416, UMP45, S1897, 4x AWM), drivable Military Buggy, grenades, flare airdrop, shrinking Safe Zone. |
| `25` | `legends-arena` | ⚔️ Legends Arena 3D | `LegendsArena3D` + `MlbbExperienceShell` | 2.5D/3D Canvas + Full React MLBB OS | Landscape | Complete MLBB ecosystem: 133 heroes, 103 items, 7 emblems, 12 spells, Draft Pick/Ban, 3-lane map with Buffs/Turtle/Lord, Squads, StarLight, Live Stream. |
| `26` | `asphalt-nitro-3d` | 🏁 Asphalt Nitro 3D | `AsphaltNitro3D` | 3D Three.js + `Lobby3DOverlay` | Landscape | 8 unlockable supercars (4 upgrade stats Lv1–5), 4 mission biomes (Neon Metropolis, Red Canyon, Alpine, Volcanic), Nitro, Drift, Stunt Ramps, 3-Star mastery. |
| `27` | `hoops-2k26` | 🏀 Hoops 2K26 3D | `Hoops2K26_3D` + `HoopsLobbyView` | 3D Three.js + Full NBA 2K14/2K26 Shell | Landscape | 72 NBA/Classic/All-Time teams, 576 players, MyPLAYER/The City/MyTEAM/MyNBA/PTG/Playoffs/2v2/3v3/5v5, Shot Meter, Pro Stick, Icon Passing, 7-Tab Settings. |
| `28` | `naruto-senki-storm` | 🍥 Naruto: Senki & Storm | `NarutoSenkiStormGame` | Dual 2D MOBA + 3D Three.js Fighter | Landscape | 64 shinobi across 5 eras; switch between 2D Senki (3v3/4v4 3-Tower MOBA + Ramen Shop) and 3D Storm (Dual HP, 4-Log Substitution, Guard Break, Chakra Dash, Supports & Awakenings). |

---

## 4. Flagship Games Deep Dive

### A. Legends Arena 3D (`games/legends-arena/` · `data-game="25"`)

Legends Arena runs a full React experience (`MlbbExperienceShell`) on top of an interactive battle engine and 3D hero sanctuary:

- **Source folder:** `src/games/legends-arena/`
  - `LegendsArena3D.ts` — Arcade adapter class registered at index `25`.
  - `mlbb/MlbbExperienceShell.tsx` — Top-level state machine: `lobby` → `matchmaking` → `draft` → `loading` → `battle` → `postmatch`.
  - `mlbb/components/MainLobby.tsx` — Home lobby, Ranked/Classic cards, Daily Quests, Squad, StarLight, Events, Shop, Preparation.
  - `mlbb/components/PreMatchFlow.tsx` — Matchmaking ready check (`ENTER`), Draft Ban (`BAN HERO`), Hero Pick (`LOCK IN`), Loadout, and `START GAME`.
  - `mlbb/components/LobbySanctuary3D.tsx` — Interactive Three.js hero pedestal behind the lobby (`Switch Hero`, drag-to-rotate).
  - `mlbb/components/BattleHUD.tsx` — In-match joystick, Basic Attack, 3–4 Hero Skills with drag-to-aim reticles, Battle Spell, Regen, Recall, Quick-Buy Item slots, Minimap pings, KDA & Gold scoreboard.
  - `mlbb/components/InMatchOverlays.tsx` — Full In-Match Item Shop (103 items), Scoreboard modal, Settings, Victory/Defeat (`Play Again`).
  - `mlbb/engine/GameEngine.ts` — Real-time 3-lane MOBA simulation: lane minions, turrets, Purple/Orange jungle buffs, River Turtle, Allied Mid Lord, AI hero brains, projectile/AoE hitboxes, cooldowns, and damage math.
  - `mlbb/data/` — 133 hero definitions, 103 items with build recipes, 7 emblems + talent trees, 12 battle spells, skins, and achievement/quest tables.
- **Live folder:** `games/legends-arena/` (`data-1..19.js`, `engine-1..11.js`, `ui-1..17.js`, `styles.css`).

### B. Hoops 2K26 + NBA 2K14 Hybrid 3D (`games/hoops-2k26/` · `data-game="27"`)

Combines authentic NBA 2K14 arcade/sim responsiveness with a full NBA 2K26 multi-mode ecosystem:

- **Source folder:** `src/games/hoops-2k26/`
  - `Hoops2K26_3D.ts` — Three.js 3D court engine (hardwood & blacktop courts, 10-player 5v5 AI, ball arc physics, Green Release shot meter, Pro Stick dribble/layup/dunk branches, Icon Passing, defensive contest & steal logic, camera angles).
  - `nba2k14/HoopsLobbyView.tsx` — Full hub shell for Quick Game (`Tip Off`), MyCAREER / MyPLAYER Builder, The City, MyTEAM packs & lineups, MyNBA franchise, Playoff Tournament, Path to Greatness, and 7-Tab Settings.
  - `nba2k14/data/` — 72 teams & 576 players with ratings, badges, tendencies, and jerseys.
- **Live folder:** `games/hoops-2k26/` (`data-1..7.js`, `engine-1..8.js`, `ui-1..29.js`, `styles.css`).

### C. Mini Militia DA2 (`games/mini-militia/` · `data-game="22"`)

- **Source folder:** `src/games/mini-militia/`
  - `MiniMilitia.ts` — 2D Canvas warzone engine (2800×1260 multi-tier platforms, jetpack thrust & recharge, dual-stick aiming, bullet/rocket/laser physics, grenades, weapon crates, radar minimap, and armored Gunship Boss waves).
  - `components/MainLobby.tsx`, `ProfileSocialAndRooms.tsx` — Full DA2-style menu, 20 maps, 25 weapons, avatar customization, Quick Play, and Custom Rooms.
- **Live folder:** `games/mini-militia/` (`data.js`, `engine-1..3.js`, `ui-1..4.js`).

### D. Naruto: Senki & Ultimate Ninja Storm (`games/naruto-senki-storm/` · `data-game="28"`)

- **Source folder:** `src/games/naruto-senki-storm/`
  - `NarutoSenkiStorm.ts` — Dual-engine hybrid switching seamlessly between **2D Senki** (3v3 / 4v4 single-lane 3-tower MOBA with Lv.1–6 Ougi 1/2 & Ichiraku Ramen Shop) and **3D Ultimate Ninja Storm** (Three.js 3D arena fighter with Dual HP bars, 4-Log Kawarimi Substitution, Guard Break, Chakra Dash, Counter Parry, 4 D-Pad Ninja Tools, Support Drive, and Awakenings) across 64 shinobi.
- **Live folder:** `games/naruto-senki-storm/` (`data.js`, `engine-1..3.js`).

---

## 5. Core Systems Explained

### 1. `BaseGame` (`src/core/BaseGame.ts`)
Every 2D Canvas game extends `BaseGame`. It handles:
- **High-DPI Canvas Resizing (`resize()`):** Uses `getViewportSize()` (logical landscape/portrait size) and scales canvas backing store by `Math.min(devicePixelRatio, 2)`.
- **Smooth Frame Loop (`loop(time)`):** Clamps `dt` (`0.001..0.05s`) with exponential smoothing so physics never explode after tab switching, auto-increments `level` every 10s of survival, updates particles/popups, applies screen shake (`triggerShake()`), and calls your `update(dt)` + `draw()`.
- **Built-in Juice:** `spawnParticles(x, y, color, count, speed)`, `spawnPopup(x, y, text, color)`, `triggerShake(mag, dur)`, and `EmojiCache.get(emoji, size)` for zero-lag emoji rendering.
- **Lifecycle Hooks:** Override `init()`, `update(dt)`, `draw()`, `releaseInputs()`, and call `this.gameOverSequence(isVictory)` when the match ends.

### 2. `ArcadeAudio` (`src/core/audio.ts`)
100% offline Web Audio API synthesizer with **zero external MP3 dependencies**:
- Sound effects: `ArcadeAudio.play('coin' | 'jump' | 'hit' | 'levelup' | 'click' | 'win' | 'gameover' | ...)`
- 7 procedural BGM themes (`arcade`, `action`, `puzzle`, `chill`, `garden`, `war`, `tactical`) + user-uploaded custom BGM support via FileReader.

### 3. Virtual Controls & Global Analog Default (`src/core/controlLayouts.ts`)
- **Global Default:** `tsepang_global_control_mode` defaults to `'analog'` (360° virtual analog joystick) across all 29 games.
- **Per-Game Override (`controlModeExplicit`):** When a player toggles **Analog vs D-Pad** inside a single game's Pause menu, that game saves `controlModeExplicit: true`. Clicking **"Set as Default for All 29 Games"** (or toggling Global Default in Garden Settings) calls `setGlobalControlMode(mode, true)` which updates all 29 games cleanly.
- **Custom Button Studio:** Players can drag, scale (`0.5×..1.8×`), hide, or add any of the 36 preset action buttons (`GLOBAL_PRESET_BUTTONS`) per game, stored in `tsepang_ctrl_layouts_v1`.

### 4. Auto-Landscape & Fullscreen Engine (`src/core/viewport.ts` + `src/styles/base.css`)
Phones and mobile WebViews often ignore `screen.orientation.lock('landscape')`. `viewport.ts` solves this reliably in two layers:
1. **Native Fullscreen + Orientation Lock (`requestNativeLandscape()`):** Synchronously requests fullscreen inside the user's tap gesture, then calls `screen.orientation.lock('landscape')`, and **verifies physical width >= height** before trusting `nativeLandscapeLocked`.
2. **Instant 90° CSS Stage Rotation Fallback:** Whenever a landscape game opens on a portrait screen (or narrow viewport `<= 900px`) and native lock did not physically rotate the screen, `viewport.ts` sets `isRotatedFallback: true`, adds `body.rotated-landscape`, and writes two pairs of CSS variables:
   - **Physical viewport:** `--phys-w`, `--phys-h` (e.g., `390px × 844px`) — used by the unrotated `#root` wrapper.
   - **Logical landscape stage:** `--stage-w`, `--stage-h` (e.g., `844px × 390px`) — used by `.app-stage.rotated-landscape-stage` (which rotates `90deg` around the physical center) and all fullscreen overlays/canvases inside it.
3. **Touch Coordinate Mapping:** `mapClientToStage(clientX, clientY)` and `mapClientDeltaToStage(dx, dy)` automatically transform portrait touch coordinates into rotated landscape coordinates for canvases and joysticks.

### 5. `window.Arcade` Global Namespace (`src/core/arcadeGlobal.ts`)
Available in every script and browser DevTools console:
```js
window.Arcade.version              // "2.0-modular"
window.Arcade.GAME_LIST            // Array of all 29 GameMeta objects
window.Arcade.getRegisteredGames() // [0, 1, 2, ..., 28]
window.Arcade.getState()           // Live playerState object
window.Arcade.getCoins()           // Current Garden Coins
window.Arcade.setCoins(5000)       // Set coins & save to localStorage
window.Arcade.awardBonusCoins(100) // Add coins + update HUD
window.Arcade.registerGame(id, factory, meta) // Plug in a new game
```

---

## 6. How to Edit Buttons & Fix Missing Colors

### Why Button Colors Disappeared on Older Browsers (And How to Prevent It)

Tailwind CSS v4 uses modern `oklch(...)` colors, `color-mix(in oklab, ...)`, and `@property --tw-gradient-from-position`. Older Android WebViews, iOS < 16.4, and embedded browsers ignore those declarations, turning gradient buttons **transparent**!

**The Permanent Rule for EVERY Button in This Project:**
Always include a **solid Tailwind background fallback class** alongside any `bg-gradient-to-*` class (and `scripts/legacy-css-downgrade.mjs` automatically converts all Tailwind colors to sRGB hex/rgba):

```tsx
// ❌ BAD — can turn invisible on old mobile browsers if gradient variables fail:
<button className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black">
  LOCK IN
</button>

// ✅ GOOD — solid bg-amber-500 fallback + gradient + high-contrast text & border:
<button className="bg-amber-500 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 border border-amber-200/80 text-slate-950 font-black shadow-lg">
  LOCK IN
</button>
```

### Workflow A: Editing a Button in TypeScript (`src/`)

Example: Changing the **LOCK IN** button color in Legends Arena (`src/games/legends-arena/mlbb/components/PreMatchFlow.tsx`):

1. Open `src/games/legends-arena/mlbb/components/PreMatchFlow.tsx`.
2. Search for `LOCK IN` (or `ENTER`, `BAN HERO`, `START GAME`).
3. Update its classes (e.g., change emerald/amber to cyan/blue):
   ```tsx
   <button
     type="button"
     onClick={handleLockIn}
     className="bg-cyan-500 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-black px-5 py-2 rounded-lg border border-cyan-200 shadow-lg"
   >
     LOCK IN
   </button>
   ```
4. Rebuild the live offline folders and bump the cache version if needed:
   ```bash
   npm run sync:live
   ```

### Workflow B: Editing a Button Directly in Live ES5 / CSS (Acode on Android — No Node.js!)

You can edit live files directly without running any build step:

- **To recolor shared Arcade / HUD / Settings buttons:** Edit `core/styles-base.css` or `core/styles-games.css`.
  ```css
  /* Example in core/styles-base.css */
  .play-btn,
  .primary-action-btn {
    background-color: #f59e0b; /* Solid fallback for old browsers */
    background-image: linear-gradient(135deg, #fbbf24, #ea580c);
    color: #0f172a;
    border: 1px solid #fde68a;
  }
  ```
- **To edit a specific game's button text or inline color in Acode:**
  1. Search inside `games/<slug>/` for the button label (for example, search `"LOCK IN"` inside `games/legends-arena/ui-*.js`).
  2. Each file is multi-line formatted ES5 (`<= 150 KB`) so Acode opens it smoothly without freezing.
  3. Change the `className` or add a `style: { backgroundColor: "#10b981", color: "#ffffff" }` property inside the `React.createElement("button", { ... }, "LOCK IN")` call.
  4. Save the file, open `index.html`, and bump `?v=11` → `?v=12` (or hard-refresh your browser) so cached JS is bypassed.

### Where Key Buttons Live (Quick Finder)

| Screen / Game | Buttons | Source File (`src/`) | Live File(s) |
|---|---|---|---|
| Garden & Game Picker | Play, Settings, Profile, Daily Reward, Category Tabs | `src/core/ui/ArcadeShell.tsx` | `core/ui-shell-1..5.js` |
| Garden Settings & Pause Modal | Sound, BGM, Themes, Global Analog/D-Pad, Auto-Landscape, Reset | `src/core/ui/ArcadeSettingsAndModals.tsx` | `core/ui-settings-1..4.js` |
| Virtual On-Screen Controls | Analog Stick, Action, Jump, Steer, Extra Buttons | `src/core/ui/ArcadeShell.tsx` + `src/core/controlLayouts.ts` | `core/ui-shell-*.js` + `core/engine-base-*.js` |
| Legends Arena Pre-Match | `START GAME`, `ENTER`, `BAN HERO`, `LOCK IN` | `src/games/legends-arena/mlbb/components/PreMatchFlow.tsx` | `games/legends-arena/ui-*.js` |
| Legends Arena Lobby & Battle | `RANKED`, `CLASSIC`, `ATTACK`, Skills 1–4, `Play Again` | `src/games/legends-arena/mlbb/components/MainLobby.tsx`, `BattleHUD.tsx`, `InMatchOverlays.tsx` | `games/legends-arena/ui-*.js` |
| Hoops 2K26 Lobby | `Tip Off`, Mode Cards, 7-Tab Settings | `src/games/hoops-2k26/nba2k14/components/QuickGameView.tsx` | `games/hoops-2k26/ui-*.js` |
| Mini Militia Lobby | `QUICK PLAY`, `START BATTLE`, Loadout | `src/games/mini-militia/components/MainLobby.tsx`, `ProfileSocialAndRooms.tsx` | `games/mini-militia/ui-*.js` |

---

## 7. How to Edit UI, HUD, Controls & Settings

### Changing Global Default Control Mode (Analog vs D-Pad)

- **In the App UI:** Open **Settings (⚙️)** from the Garden → **Default Controls — All 29 Games** → pick **🕹️ Analog Stick** or **🎮 D-Pad / Buttons**. Inside any game, open **Pause (⚙️)** → **Virtual Button Studio** to override just that game, or click **"Set as Default for All 29 Games"**.
- **In Code (`src/core/controlLayouts.ts`):**
  ```ts
  // Line 40 in src/core/controlLayouts.ts
  cachedGlobalControlMode = saved === 'buttons' ? 'buttons' : 'analog';
  ```
- **Customizing Default Button Coordinates for a Game (`src/core/controlLayouts.ts`):**
  Edit `getDefaultGameLayout(gameId)` — `xPct` is `5..95` (% from left), `yPx` is `10..300` (px from bottom), `scale` is `0.5..1.8`.

### Editing Garden Themes, Colors & Background

- **CSS Variables & Layout:** `src/styles/base.css` (live: `core/styles-base.css`).
- **Theme Presets & Shop Avatars:** `src/core/ui/arcadeUiConstants.ts` & `src/core/catalog.ts`.
- **Modals (Profile, Store, Instructions, Game Over):** `src/core/ui/ArcadeSettingsAndModals.tsx` + `src/styles/modals.css`.

### Keeping Auto-Landscape & Fullscreen Intact When Styling

Never force `width: 100vw; height: 100vh;` on fullscreen game containers or overlays — on a rotated portrait phone, `100vw` is the **narrow** portrait width! Always use the logical stage CSS variables instead:

```css
/* ✅ Works cleanly in portrait, native landscape, AND 90° rotated Auto-Landscape */
.my-game-overlay {
  width: var(--stage-w, 100%);
  height: var(--stage-h, 100%);
}
```

---

## 8. How to Create & Add a New Game (Game #29+)

You can add a new game using **Workflow A (TypeScript + `npm run sync:live`)** or **Workflow B (Direct ES5 plugin in Acode/offline)**.

### Workflow A: Adding Game #29 in TypeScript (`src/`)

#### Step 1 — Create the Game Class (`src/games/space-dodger/SpaceDodger.ts`)
```ts
import { ArcadeAudio } from '../../core/audio';
import { BaseGame } from '../../core/BaseGame';
import { EmojiCache } from '../../core/emojiCache';
import { triggerCoinGain, updateInGameHud } from '../../core/runtimeBridge';
import { Difficulty } from '../../core/types';

export class SpaceDodger extends BaseGame {
  playerX = 0;
  moveDir = 0;
  meteors: Array<{ x: number; y: number; vy: number; r: number }> = [];
  spawnTimer = 0;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    diff: Difficulty,
    lvl: number,
    gameIdx: number
  ) {
    super(canvas, ctx, diff, lvl, gameIdx);
  }

  init(): void {
    this.playerX = this.width * 0.5;
    this.meteors = [];
    this.spawnTimer = 0;
    this.score = 0;
    this.lives = 3;
    updateInGameHud(this.score, this.level, this.gameIdx);
  }

  // Called by Analog Stick, D-Pad, or Keyboard (A/D / Left/Right)
  setMoveDir(dx: number, _dy: number): void {
    this.moveDir = dx;
  }

  setSteerLeft(down: boolean): void {
    this.moveDir = down ? -1 : this.moveDir < 0 ? 0 : this.moveDir;
  }

  setSteerRight(down: boolean): void {
    this.moveDir = down ? 1 : this.moveDir > 0 ? 0 : this.moveDir;
  }

  releaseInputs(): void {
    this.moveDir = 0;
  }

  update(dt: number): void {
    const speed = 360 * this.scaler.speedMult;
    this.playerX = Math.max(28, Math.min(this.width - 28, this.playerX + this.moveDir * speed * dt));

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.25, 0.85 / this.scaler.spawnMult - this.level * 0.02);
      this.meteors.push({
        x: 24 + Math.random() * (this.width - 48),
        y: -24,
        vy: (180 + Math.random() * 140) * this.scaler.speedMult,
        r: 18
      });
    }

    const py = this.height - 84;
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.y += m.vy * dt;
      const dist = Math.hypot(m.x - this.playerX, m.y - py);
      if (dist < m.r + 22) {
        this.meteors.splice(i, 1);
        this.lives--;
        this.triggerShake(10, 0.2);
        this.spawnParticles(this.playerX, py, '#ef4444', 14, 220);
        ArcadeAudio.play('hit');
        if (this.lives <= 0) {
          this.gameOverSequence(false);
          return;
        }
      } else if (m.y > this.height + 30) {
        this.meteors.splice(i, 1);
        this.score += 10;
        triggerCoinGain(1);
        updateInGameHud(this.score, this.level, this.gameIdx);
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#090d1f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw meteors
    for (let i = 0; i < this.meteors.length; i++) {
      const m = this.meteors[i];
      const sprite = EmojiCache.get('☄️', 34);
      ctx.drawImage(sprite, m.x - 17, m.y - 17);
    }

    // Draw player rocket
    const ship = EmojiCache.get('🚀', 40);
    ctx.drawImage(ship, this.playerX - 20, this.height - 104);
  }
}
```

#### Step 2 — Add Metadata to `GAME_LIST` (`src/core/instructions.ts`)
Append entry `id: 29` to `CORE_GAMES`:
```ts
{
  id: 29,
  icon: '🚀',
  title: 'Space Dodger',
  instructTitle: '🚀 Space Dodger',
  text: '• Move left and right with the Analog Stick or A/D keys to dodge falling meteors!\n• Survive as long as possible to earn coins and climb levels.',
  bgmTheme: 'arcade',
  category: 'arcade',
  preferredOrientation: 'landscape',
  showHealthBar: true,
  showSteer: true,
  steerLeftLabel: '◀',
  steerRightLabel: '▶',
  showSteerCustomizer: true
}
```

#### Step 3 — Register the Game (`src/core/registry.ts`) & Update `TOTAL_GAMES` (`src/core/storage.ts`)
- In `src/core/registry.ts`:
  ```ts
  import { SpaceDodger } from '../games/space-dodger/SpaceDodger';
  // Inside registerBuiltInGames():
  registerArcadeGame(29, (c, ctx, d, l) => new SpaceDodger(c, ctx, d, l, 29));
  ```
- In `src/core/storage.ts`: Change `export const TOTAL_GAMES = 29;` → `30`.

#### Step 4 — Sync Live Offline Folders & Verify
```bash
npm run sync:live
npm run lint
```
`emit-live-folders.mjs` automatically creates `games/space-dodger/game.js`, adds its `<script>` tag to root `index.html`, validates ES5 + `<= 150 KB`, and checks the module graph!

---

### Workflow B: Adding a Plug-and-Play ES5 Game Directly (Acode / Zero Node.js)

If you are editing offline on a phone with Acode and no Node.js:

1. Create `games/my-new-game/game.js` using strict ES5 and `window.Arcade.registerGame`:
   ```javascript
   (function (Arcade) {
     "use strict";
     if (!Arcade || !Arcade.BaseGame) return;

     function MyNewGame(canvas, ctx, diff, lvl, gameIdx) {
       Arcade.BaseGame.call(this, canvas, ctx, diff, lvl, gameIdx);
       this.ballX = 120;
     }
     MyNewGame.prototype = Object.create(Arcade.BaseGame.prototype);
     MyNewGame.prototype.constructor = MyNewGame;

     MyNewGame.prototype.init = function () {
       this.score = 0;
       this.ballX = this.width * 0.5;
     };

     MyNewGame.prototype.update = function (dt) {
       this.ballX = (this.ballX + 120 * dt) % Math.max(240, this.width);
     };

     MyNewGame.prototype.draw = function () {
       this.ctx.fillStyle = "#0f172a";
       this.ctx.fillRect(0, 0, this.width, this.height);
       this.ctx.fillStyle = "#38bdf8";
       this.ctx.beginPath();
       this.ctx.arc(this.ballX, this.height * 0.5, 22, 0, Math.PI * 2);
       this.ctx.fill();
     };

     Arcade.registerGame(
       29,
       function (c, ctx, d, l) {
         return new MyNewGame(c, ctx, d, l, 29);
       },
       {
         id: 29,
         icon: "🌟",
         title: "My New Game",
         instructTitle: "🌟 My New Game",
         text: "• Custom ES5 plug-and-play game!",
         bgmTheme: "arcade",
         category: "arcade"
       }
     );
   })(window.Arcade);
   ```
2. In root `index.html`, add ONE line **right after** `<script src="./core/app-main.js?v=11"></script>` (so `window.Arcade` is already installed):
   ```html
   <script src="./games/my-new-game/game.js?v=11"></script>
   ```
   *(Note: If you later run `npm run sync:live`, `index.html` is regenerated from `src/`, so for permanent games keep the source in `src/games/` as well.)*

---

## 9. How to Find & Fix Bugs (Troubleshooting Playbook)

### Bug 1: `Uncaught Error: ArcadeMod: module not found -> react-dom/client` (or another module)
- **What it means:** One of the chunked JS files (e.g., `vendor/react-dom-1..3.js`) failed to load, threw a syntax error during `defineChunk(...)` reassembly, or was missing a `<script>` tag in `index.html`.
- **How to diagnose:**
  1. Open Browser DevTools → **Console** and look for the **first** error before `ArcadeMod: module not found` (such as a `SyntaxError` or `404 Not Found`).
  2. Run `ArcadeMod.has("react-dom/client")` in the Console.
  3. Run `npm run sync:live` — it runs `verifyEmittedModuleGraph()` which compiles every single chunked file in Node.js and immediately reports any broken chunk or missing export.

### Bug 2: Game Only Shows Half-Screen or Stretched When Rotated to Landscape
- **Root Causes (Both Fixed in `?v=11` — Watch Out When Adding New Games!):**
  1. **Swapped `#root` dimensions:** On a portrait phone (`390×844`), the unrotated `#root` container MUST use physical `--phys-w × --phys-h` (`390×844`), while the rotated `.app-stage.rotated-landscape-stage` uses logical `--stage-w × --stage-h` (`844×390`) centered at `physH/2, physW/2`.
  2. **`getBoundingClientRect()` inside a 90° rotated stage:** Inside `transform: rotate(90deg)`, `el.getBoundingClientRect()` returns the **axis-aligned portrait box** (`width: 390, height: 844`), which shrinks or clips Three.js / Canvas renderers to half the screen!
- **The Permanent Fix for Every Canvas / Three.js Resizer:**
  Always read **`el.clientWidth` and `el.clientHeight`** (with `getViewportSize()` fallback), **never** `getBoundingClientRect()` for renderer dimensions:
  ```ts
  // ✅ Correct — returns true unrotated logical dimensions (844 × 390)
  const w = Math.max(1, container.clientWidth || getViewportSize().width);
  const h = Math.max(1, container.clientHeight || getViewportSize().height);
  renderer.setSize(w, h, false);
  ```

### Bug 3: Button Looks Invisible, Transparent, or White-on-White on Mobile
- **Cause:** Using Tailwind v4 gradient utilities without a solid background fallback or using raw `oklch()` / `color-mix()` in a custom stylesheet.
- **Fix:** Add a solid fallback class (`bg-amber-500`, `bg-emerald-600`, `bg-blue-600`) plus explicit text color (`text-white` or `text-slate-950`), then run `npm run sync:live` so `scripts/legacy-css-downgrade.mjs` strips `oklch()`/`color-mix()` and emits safe sRGB hex/rgba rules.

### Bug 4: Blank Screen or Syntax Error on an Old Smartphone Browser
- **Cause:** Modern JS syntax leaked into a live file in `core/` or `games/`.
- **Strict ES5 Checklist (When Editing Live `.js` Files Manually in Acode):**

| ❌ Forbidden in Live `.js` (Crashes Old Phones) | ✅ Universally Safe Classic ES5 Equivalent |
|---|---|
| `const x = 1; let y = 2;` | `var x = 1; var y = 2;` |
| `(a, b) => a + b` | `function(a, b) { return a + b; }` |
| `obj?.prop?.sub` | `obj && obj.prop && obj.prop.sub` |
| `val ?? fallback` | `val !== undefined && val !== null ? val : fallback` |
| `` `Score: ${s}` `` | `"Score: " + s` |
| `str.replaceAll("a", "b")` | `str.replace(/a/g, "b")` or `str.split("a").join("b")` |
| `arr.at(-1)` | `arr[arr.length - 1]` |
| `Object.hasOwn(o, k)` | `Object.prototype.hasOwnProperty.call(o, k)` |
| `import / export` | `ArcadeMod.define(...)` or IIFE `(function(Arcade){ ... })(window.Arcade);` |

### Bug 5: My Edits Don't Show Up After Refreshing
- **If you edited `src/`:** You forgot to run `npm run sync:live` (the dev server and offline `index.html` load the live ES5 folders `./core/` and `./games/`).
- **If you edited `core/` or `games/` directly:** Your browser cached the previous `?v=11` script. Hard-refresh (`Ctrl+Shift+R`) or bump `?v=11` → `?v=12` in `index.html` (or update `CACHE_VER` in `scripts/emit-live-folders.mjs`).

### Useful Console Debugging Snippets
Paste any of these in Browser DevTools Console while running the app:
```js
// 1. Check current build version & registered games
console.log(window.ARCADE_BUILD_VERSION, window.Arcade.getRegisteredGames());

// 2. Give yourself test coins for unlocking heroes/cars/avatars
window.Arcade.setCoins(50000);

// 3. Inspect current viewport & Auto-Landscape state
console.log(getComputedStyle(document.documentElement).getPropertyValue('--phys-w'),
            getComputedStyle(document.documentElement).getPropertyValue('--stage-w'),
            document.body.className);

// 4. Reset broken control layouts only (keeps all game progress)
localStorage.removeItem('tsepang_ctrl_layouts_v1');
localStorage.removeItem('tsepang_global_control_mode');
location.reload();
```

---

## 10. Storage Keys Reference (`localStorage`)

All reads and writes go through `tryStorage` (`src/core/storage.ts`), which safely falls back to an in-memory map if a browser blocks `localStorage` in private mode or `file://`. **Never rename existing keys** so players keep their progress.

| Key | Purpose |
|---|---|
| `tsepang_coins` | Total Garden Coins balance |
| `tsepang_xp`, `tsepang_lvl` | Player XP & overall Arcade level |
| `tsepang_avatar`, `tsepang_unlocks`, `tsepang_username` | Equipped avatar, unlocked avatar store items, display name |
| `tsepang_high_scores` | JSON array of 29 high scores indexed by `data-game` (`0`–`28`) |
| `tsepang_ui_prefs_v1` | Garden title, Day/Night mode, clouds/mountains/sun sliders, theme index, D-Pad scale/position |
| `tsepang_global_control_mode` | Global default control mode (`"analog"` default or `"buttons"`) |
| `tsepang_ctrl_layouts_v1` | Per-game virtual button coordinates, scale, extras, and `controlModeExplicit` flag |
| `tsepang_orientation_mode`, `tsepang_auto_fullscreen` | Auto-Landscape (`"auto"` / `"free"`) and Auto-Fullscreen (`"on"` / `"off"`) |
| `tsepang_chess_time` | Stockfish Chess selected clock (`60`, `300`, `600`, or `900` seconds) |
| `tsepang_br_mode`, `tsepang_br_map`, `tsepang_br_crate`, `tsepang_br_wins`, `tsepang_br_kills` | Battle Royale 3D selections & stats |
| `tsepang_moba_hero`, `tsepang_moba_unlocked`, `tsepang_moba_mode`, `tsepang_moba_spell`, `tsepang_moba_emblem_sel`, `tsepang_moba_emblems`, `tsepang_moba_meta_v2`, `tsepang_moba_quests`, `tsepang_moba_daily`, `tsepang_moba_wins`, `tsepang_moba_matches`, `tsepang_moba_kills`, `tsepang_moba_turrets` | Legends Arena (MLBB) heroes, BP/Tickets/Diamonds, skins, builds, match history, mastery, squad, daily missions, and settings |
| `tsepang_asphalt_car`, `tsepang_asphalt_owned`, `tsepang_asphalt_upgrades`, `tsepang_asphalt_map`, `tsepang_asphalt_stars` | Asphalt Nitro 3D garage, 4-stat upgrades, and map stars |
| `tsepang_basketball_team`, `tsepang_hoops_mode`, `tsepang_hoops_champs`, `tsepang_hoops_tourney`, `tsepang_hoops2k26_v1` | Hoops 2K26 + NBA 2K14 Hybrid saves, MyPLAYER, MyTEAM, tournament, and 7-tab settings |
| `tsepang_naruto_hero`, `tsepang_naruto_unlocked`, `tsepang_naruto_sup1`, `tsepang_naruto_sup2`, `tsepang_naruto_sup1_type`, `tsepang_naruto_sup2_type`, `tsepang_naruto_mode`, `tsepang_naruto_stage`, `tsepang_naruto_wins`, `tsepang_naruto_matches`, `tsepang_naruto_kills`, `tsepang_naruto_towers` | Naruto: Senki & Storm 64-shinobi roster, supports, mode/stage, and career stats |

---

## 11. Commands, Automated Tests & Editor Setup (VS Code & Acode)

### Essential Commands (Node.js / PC)

```bash
# Start local development server on http://localhost:3000
npm run dev

# Rebuild ALL live ES5 folders (vendor/, core/, games/) + root index.html
# Enforces <= 150 KB/file, strict Acorn ES5, legacy CSS downgrade & module graph verification
npm run sync:live

# TypeScript type-check (must report 0 errors)
npm run lint

# Vite production verification build
npm run build

# Run automated unit tests (Viewport/Landscape, Games Logic, Legends Arena, Hoops Hybrid 1–7)
npx tsx --test \
  src/core/viewportFullscreen.test.ts \
  src/games/gamesLogic.test.ts \
  src/games/legendsArenaPart7.test.ts \
  src/games/hoopsHybridPart1.test.ts \
  src/games/hoopsHybridPart2.test.ts \
  src/games/hoopsHybridPart3.test.ts \
  src/games/hoopsHybridPart4.test.ts \
  src/games/hoopsHybridPart5.test.ts \
  src/games/hoopsHybridPart6.test.ts \
  src/games/hoopsHybridPart7.test.ts
```

### Opening in VS Code (Desktop)
1. Open the root folder in VS Code.
2. `.editorconfig` and `.vscode/settings.json` automatically enforce **UTF-8 (no BOM)**, **LF line endings**, **2-space indentation**, and exclude generated folders from noisy search/watch overhead.
3. For quick offline preview without Vite, install **Live Server** (recommended in `.vscode/extensions.json`) and click **Go Live** on root `index.html` — or open `index.html` directly in Chrome/Edge/Firefox via `file://`.

### Opening in Acode (Android Phone / Tablet)
1. Extract the project ZIP into internal storage (e.g., `/Download/TsepangArcade/`).
2. Open the folder in **Acode** — every live file in `core/`, `games/`, and `vendor/` is multi-line formatted and strictly **`<= 150 KB`**, so syntax highlighting, search, and scrolling stay fast even on budget phones.
3. Tap `index.html` → **Play (▶)** inside Acode to launch the full 29-game Arcade offline immediately!

### Offline ZIP Distribution Checklist
To share or run completely offline on any phone or PC, you only need:
- `index.html`
- `vendor/`
- `core/`
- `games/`
- `README.md` & `PROJECT_MAP.txt` (optional reference docs)

Zero internet connection, zero servers, and zero external CDNs required.
