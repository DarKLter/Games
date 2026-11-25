# Hoops 2K26 Ultimate Hybrid — Part 7 (Final): 7-Tab Settings Suite, Custom Touch HUD Editor, Post-Match MVP, 3D Freeze Cam & Final QA

Part 7 completes the NBA 2K14 + NBA 2K26 Ultimate Hybrid experience by unifying all 7 Settings & Profile tabs (including live User/CPU gameplay sliders and a career spray-graph shot chart), a full-screen live drag-and-drop Custom Touch HUD Editor, a broadcast-grade Post-Match Jordan/Gatorade MVP Celebration with 3-tab progression, and a 10-second (600-frame) 360° 3D Instant Replay Freeze Cam with PNG snapshot capture, followed by a complete end-to-end QA pass across Parts 1–7.

## User Review & Critical Decisions

> [!IMPORTANT]
> All core Part 7 design preferences were confirmed during clarification and govern this final build.

- **Default Gameplay Sliders Preset**: **Hybrid Pro Balanced (50/50)** across all 15 User and CPU attributes, with instant one-click switching to **2K14 Classic Sim**, **2K26 Comp**, **Arcade High-Scoring**, and a persistent **Custom Preset**.
- **Instant Replay Freeze Cam**: Full **10-second (600-frame at 60 Hz)** ring buffer with `0.25x / 0.5x / 1.0x / Pause` timeline scrubbing, smooth 360° touch/mouse 3D camera orbit (Ball or Court focus + zoom), and **one-tap PNG Screenshot Capture** accessible from both Pause and Post-Match.
- **Post-Match & Custom Touch HUD Presentation**: Full animated **Jordan / Gatorade Player of the Game (MVP) Spotlight** with buzzer horn & arena confetti celebration upon match completion, plus a **Live 3D Court Preview** behind the full-screen Drag-and-Drop Custom Touch HUD Editor.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers the complete configuration, customization, highlight-replay, and career-progression layer for the entire 3D basketball game—accessible seamlessly from both the Main Menu (`⚙️` / Profile) and live 3D gameplay (Pause Menu & Final Buzzer).
- **Target Audience**: Players switching fluidly between desktop keyboard/gamepad and mobile touch controls who want authentic NBA 2K14 simulation depth alongside NBA 2K26 competitive customization, live gameplay tuning, highlight freeze-cam photography, and persistent career analytics.
- **Key Value**: Every gameplay rule, keybind, touch button coordinate, camera angle, visual quality setting, 2K Beats track, User/CPU slider, and match stat writes immediately to persistent local storage and takes effect live on the 3D court without restarting a match.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Unified 7-Tab Settings & Profile Flow (Main Menu & In-Match Pause)**:
   - Opening Settings from the Main Menu or Pause Menu launches a single, responsive 7-tab command deck dynamically themed to the active era (`2K14 Classic` crimson/gold or `2K26 Next-Gen` obsidian/cyan):
     - **Tab 1 — Gameplay & Rules**: Difficulty (`Rookie` → `Hall of Fame`), Quarter Length (`2–12 min`), Game Speed (`30–100`), all 5 Shot Timing Profiles (`Green-or-Miss` → `Real Player %`), Layup & Free Throw timing, and all 7 rule toggles (`Fatigue`, `Injuries`, `Out of Bounds`, `8s Backcourt`, `24s Shot Clock`, `Reach-In Fouls`, `3-Second Paint Key`).
     - **Tab 2 — Controller, Shot Meter & Touch HUD**: Shot Meter On/Off (`+15% Green Boost` callout), all 5 meter styles & 5 meter colors, Visual Cue (`Jump / Set Point / Push / Release`), Rhythm Shooting & Shot Feedback modes, Defensive/Boxout Assist (`0–100`), Who-To-Guard & Icon Passing toggles, Touch Controls visibility (`Auto / Always / Off`), an interactive **Click-to-Rebind Keyboard Remapper**, live **Connected Gamepad Status**, and the primary **`Open Custom Touch HUD Editor`** launcher.
     - **Tab 3 — Camera**: All 7 authentic camera presets (`2K`, `2K Low`, `Broadcast`, `Drive`, `Player Lock`, `High`, `Nosebleeds`), Zoom (`1–10`), Height (`1–10`), plus `Auto-Flip`, `Key Zoom`, and `Reverse Angle`.
     - **Tab 4 — Visuals, UI Era & Presentation**: Live Master UI & Era switcher (`2K14 Classic / 2K26 Next-Gen / Hybrid Pro`), Scorebug Position (`2K14 Bottom-Right / 2K26 Bottom-Left / Top Broadcast`), PlayVision Density (`Full / Lite / Off`), Hot/Cold Zones (`Always / On Catch / Off`), Graphics Quality (`Low → Ultra`), Hardwood Reflections, Crowd Density, Contact Dunk Camera Shake, and FPS/Latency Telemetry.
     - **Tab 5 — Audio & 2K Beats**: 5 independent volume sliders (`Master`, `Arena Crowd`, `On-Court SFX`, `PA Announcer`, `2K Beats Music`) and an interactive 6-track procedural 2K Beats player with Play/Pause, Next/Prev, Shuffle, and per-track playlist checkboxes.
     - **Tab 6 — Gameplay Sliders (User & CPU 0–100)**: Side-by-side dual-column `USER | CPU` matrix for all 15 sliders (`Inside Shot`, `Close Shot`, `Mid-Range`, `3PT`, `Layup`, `Dunk in Traffic`, `Shot Contest Impact`, `Block Frequency`, `Steal Success`, `Offensive Rebound`, `Defensive Rebound`, `Ball Security`, `Help Defense Strength`, `Game Speed`, `Foul Frequency`), plus one-click presets (`Hybrid Pro Balanced`, `2K14 Classic Sim`, `2K26 Comp`, `Arcade High-Scoring`, `Save Custom Preset`).
     - **Tab 7 — Profile (`My Profile.USR` + 2K26 Player Card) & Save Data**: Editable Gamertag, Favorite Team, and Crew Tag; Classic 2K14 VIP 12-stat career grid; 2K26 Player Card with Rep Tier bar, Season Level `1–40`, Geo Rank, Crew Level, MyPLAYER 5-slot summary, and 8 unlockable trophies/achievements; **Interactive Half-Court Career Shot Chart Spray Graph** with `ALL / MAKES ONLY / 3PT ONLY / GREENS ONLY` filters and zone-by-zone FG% hover/tap tooltips; plus `Export Save JSON`, `Import Save JSON`, and guarded `Reset Career Data`.

2. **Live Drag-and-Drop Custom Touch HUD Editor**:
   - Launches full-screen directly over the live 3D court (in-match) or a clean live-rendered half-court 3D preview (from Main Menu).
   - Displays all **14 movable touch controls** (`Left Joystick`, `Shoot/Pro-Stick`, `Pass`, `Dribble/Protect`, `Screen`, `Icon Pass`, `Alley-Oop`, `Takeover`, `Block/Reb`, `Steal`, `Switch`, `Intense-D`, `Tactics`, `Mini Radar`).
   - Users drag any control freely with mouse or touch, tap to select, and tune **Scale (`50%–150%`)** and **Opacity (`20%–100%`)** in a compact floating dock with 3 one-tap presets (`Classic 2K`, `Claw Pro`, `Compact One-Hand`), `Reset Default`, and `Save & Exit`, immediately updating the live touch overlay.

3. **Post-Match Jordan/Gatorade MVP & 3-Tab Progression Flow**:
   - Final buzzer or Park target score triggers buzzer horn, celebratory confetti burst, and a cinematic **Jordan / Gatorade Player of the Game (MVP) Spotlight Card** with full stat line (`PTS / REB / AST / STL / BLK / FG%`).
   - Three interactive tabs underneath:
     1. **Box Score**: Away/Home switcher with full 12-column tabular grid (`MIN`, `PTS`, `REB`, `AST`, `STL`, `BLK`, `TO`, `FGM-A`, `3PM-A`, `FTM-A`, `+/-`, `Grade`).
     2. **Team Comparison & Shot Chart**: Side-by-side stat comparison bars (`FG%`, `3P%`, `FT%`, `Points in Paint`, `Fast Break Pts`, `2nd Chance Pts`, `Bench Pts`, `Rebounds`, `Turnovers`) paired with the **Match Half-Court Shot Chart**.
     3. **Rewards & Progression**: Animated VC payout breakdown (`Base Game + Win Bonus + Teammate Grade + Green Releases + Streak Breaker`), animated XP bars for **Season Level**, **Rep Tier**, **MyPLAYER Badges**, and **Crew Progress**, plus any settled **Path to Greatness / Street Kings / MyTEAM / Training Camp** unlocks.
   - Four primary actions: **`Rematch`**, **`Instant Replay / Freeze Cam`**, **`Return to The City`**, and **`Main Menu`**.

4. **Instant Replay Freeze Cam (Pause & Post-Match)**:
   - Scrubs smoothly across the rolling 10-second (600-frame) 3D transform buffer with `Pause / 0.25x / 0.5x / 1.0x` speed toggles, camera preset selector, Ball vs. Court focus lock, zoom slider, free 360° touch/mouse orbit over the live Three.js viewport, and a one-tap **`Capture PNG Snapshot`** button that triggers a clean browser download (with an inline preview confirmation toast).

### Visual Identity & Theme

- **Aesthetic Direction**: Authentic Dual-Era Sports Broadcast Console—sharp metallic crimson/gold (`2K14 Classic`) or dark obsidian/electric cyan (`2K26 Next-Gen`), disciplined around a 60-30-10 surface hierarchy with single-level card elevation and hairline borders (`1px solid rgba(255,255,255,0.12)`).
- **Zero-Pill & Anti-Slop Discipline**: Static metadata (era labels, game counts, timestamps, zone totals) renders as clean unboxed typography with `·` separators rather than decorative pill clusters; interactive tabs and filter controls use crisp segmented buttons.
- **Typography & Tabular Precision**: Athletic condensed display headers paired with crisp geometric UI copy and strict `font-variant-numeric: tabular-nums` across every Box Score row, Slider readout, Career VIP stat, and Shot Chart percentage.
- **WebGL Performance & Mobile Ergonomics**: Zero `backdrop-filter` over live WebGL viewports (opaque/translucent dark scrims instead so mobile GPUs sustain 60 FPS), touch targets $\ge 44\text{px}$, and collapsible bottom docks keeping mobile fixed chrome within compact screen budgets.

---

## 3. Key Product Decisions & Trade-Offs

- **Zero-Overhead On-Demand PNG Capture for Freeze Cam**:
  - *Chosen Approach*: Trigger a single synchronous `renderer.render(scene, camera)` immediately followed by `canvas.toDataURL('image/png')` only when the player clicks **Capture PNG**, rather than enabling `preserveDrawingBuffer: true` globally.
  - *Why*: Preserves full 60 FPS hardware swap-chain efficiency during live gameplay while guaranteeing crisp, non-blank PNG screenshots on every browser and mobile GPU.
  - *Alternatives Considered*: Enabling `preserveDrawingBuffer: true` permanently (rejected because it adds unnecessary framebuffer copies every frame on mobile WebGL).

- **Unified Settings Modal Across Main Menu & In-Match Pause**:
  - *Chosen Approach*: Replace the older split Settings/Profile drawer with one unified 7-tab `SettingsModal` component rendered identically from both the Main Menu (`⚙️` and Profile click) and In-Match Pause Menu (`⚙️`), plus a shared `CustomHudEditor` launcher.
  - *Why*: Guarantees zero drift between Menu and In-Match settings, keeps every live toggle (Camera, Shot Meter, Sliders, 2K Beats, UI Era, Custom HUD) applying instantaneously to the active 3D match, and eliminates redundant UI code to stay comfortably below the 150 KB per-file cap.
  - *Alternatives Considered*: Maintaining separate Menu vs. Pause settings dialogs (rejected due to duplicated state wiring and bundle bloat).

- **Unified Post-Match Settlement Bridge (Career + Active Mode Rewards)**:
  - *Chosen Approach*: When a match finishes (`FINAL`), settle BOTH the core career progression (VC breakdown, Season XP, Rep XP, VIP Career Stats, Career Shot Chart, 8 Achievements) AND any active Part 6 mode contract (Path to Greatness Stars/Trophies, Street Kings Bounties, MyTEAM Domination Stars / Triple Threat Wins, MyNBA Playoff Series Wins, Training Camp Medals) atomically once per match, then display everything inside the single 3-tab `PostMatchScreen`.
  - *Why*: Prevents double-awarding rewards or competing overlay modals when finishing a Path to Greatness, MyTEAM, Street Kings, or Training Camp game, while keeping the live mid-game objective tracker banner crisp during active play.
  - *Alternatives Considered*: Showing two stacked Game Over modals (rejected as confusing and redundant).

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Component Hierarchy

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                     Persistent Local Storage Layer                         │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │ UltimateHybridStore          │    │ ModesStore (Part 6 Modes State)  │  │
│  │ • 7-Tab Settings & Sliders   │◄──►│ • 5 MyPLAYER Slots & Cosmetics   │  │
│  │ • Keybinds & Custom HUD Map  │    │ • City Landmarks, Crew, Streaks  │  │
│  │ • VIP Stats, Achievements    │    │ • PTG, MyTEAM, MyNBA, Drills     │  │
│  │ • Career Shot Chart History  │    │ • Active Mode Launch Contract    │  │
│  └──────────────┬───────────────┘    └────────────────┬─────────────────┘  │
└─────────────────┼─────────────────────────────────────┼────────────────────┘
                  │                                     │
      ┌───────────▼──────────────┐          ┌───────────▼────────────────────┐
      │ MainMenuShell            │          │ LiveCourtStage (60 FPS 3D)     │
      │ • Dual-Era Menu & Audio  │          │ • BasketballSimulation + AI    │
      │ • Unified SettingsModal  │          │   (15 User/CPU Sliders +       │
      │   (Tabs 1–7 + ShotChart) │          │    600-Frame Replay Buffer +   │
      │ • Live 3D Preview        │          │    Live Keybinds + MatchShots) │
      │   CustomHudEditor        │          │ • Court3D (360° Orbit Ref +    │
      │ • Mode Hubs (Parts 1–6)  │          │   On-Demand PNG Capture Ref)   │
      └──────────────────────────┘          │ • MatchHUD + ShotMeterOverlay  │
                                            │ • TouchControlsOverlay         │
                                            │   (Live CustomHudLayout Map)   │
                                            │ • PauseMenuModal ──► Settings  │
                                            │                  ──► FreezeCam │
                                            │ • PostMatchScreen (MVP + 3-Tab │
                                            │   Box / Compare+Shot / Rewards │
                                            │   + FreezeCam Launch)          │
                                            └────────────────────────────────┘
```

### Data Model & State Synchronization

- **Gameplay Sliders (15 User + 15 CPU, 0–100)**: Stored inside `settings.coach.sliders` with default preset `HYBRID_PRO_BALANCED` (50/50 across all 15 sliders), alongside `2K14_CLASSIC_SIM`, `2K26_COMP`, `ARCADE_HIGH_SCORING`, and `CUSTOM`. Wired live into both `BasketballSimulation` (shot success curves, dunk traffic, contest impact, steals, blocks, rebounds, ball security, game speed, fouls) and `AISystem` (CPU help defense rotation speed, contest tightness, steal aggression, shot selection).
- **Custom Keybinds & Gamepad Telemetry**: `settings.controller.keybinds` drives `LiveCourtStage` keyboard dispatch directly (re-binding any action immediately updates on-court controls without reload), while `navigator.getGamepads()` powers live gamepad connection status in Tab 2 alongside live stick/button gameplay polling.
- **Custom Touch HUD Coordinates**: `settings.controller.customHudLayout` stores `{ x, y, scale, opacity }` for all 14 movable controls; both `TouchControlsOverlay` and `TacticalRadarAndMarking` consume these offsets live, and `CustomHudEditor` supports mouse/touch dragging, scale/opacity sliders, 3 presets (`Classic 2K`, `Claw Pro`, `Compact One-Hand`), and live 3D court preview.
- **Match & Career Analytics**: Every field-goal attempt records court `(x, y)`, `made`, `isThree`, and `isGreen` into `matchShots`; on match completion, `recordCompletedMatch` appends them to `profile.shotChartHistory`, updates all 12 VIP career averages, unlocks eligible achievements from the 8-trophy catalog, awards the itemized VC/XP breakdown, and settles any active Part 6 mode reward.
- **600-Frame Freeze Cam Ring Buffer**: `InstantReplayBuffer(600)` captures 60 Hz 3D positions, facing angles, animation states, and ball transforms for the trailing 10 seconds. Opening `InstantReplayModal` freezes simulation ticks, hands camera control to `Court3D`'s `replayOrbitRef` (azimuth, polar, distance, Ball/Court focus), and exposes `captureFramePng()` for instant PNG snapshots.

### Interactive Component & Final QA Verification Strategy

- **Interactive Handler Coverage**: Every control across all 7 Settings tabs (toggles, dropdowns, sliders, keybind capture listeners, 2K Beats play/skip/checkboxes, JSON export/import with schema validation, two-step Career Reset confirmation), all 14 draggable HUD editor controls, all 4 Shot Chart filters + zone tooltips, all 3 Post-Match tabs, and all Replay Freeze Cam orbit/speed/PNG controls will be wired with complete state transitions and zero dead clicks.
- **Final End-to-End QA Pass**:
  1. Write comprehensive Part 7 unit tests verifying all 7 Settings tabs & Hybrid Pro Balanced 50/50 slider defaults, live User/CPU slider math in `BasketballSimulation` & `AISystem`, Custom Touch HUD preset/layout clamping, Career Shot Chart zone aggregation & achievement unlocking, 600-frame Instant Replay buffer scrubbing, and Post-Match MVP & dual career+mode reward settlement.
  2. Run the entire unit test suite across Parts 1–7 and all arcade suites (`100% pass`).
  3. Bump cache-busting revision (`?v=8`) and sync all live classic-ES5 folders (`npm run sync:live`), confirming strict Acorn ES5 compliance, root launcher `< 30 KB`, and **0 files exceeding the 150 KB hard cap**.
  4. Co-execute production compilation and strict TypeScript linting (`tsc --noEmit`) with zero errors.
