# Button Color Restoration, Global Analog Controls, Auto-Landscape Fix & Universal Editor Compatibility

This upgrade restores every missing and invisible button color in Legends Arena (Ranked, Draft Lock In, Match Found Enter, Start Game, and Lobby) and across all 29 games, sets the Analog Joystick as the default control mode with Global and Per-Game Settings toggles, repairs Auto-Landscape rotation and fullscreen lock on portrait phones and narrow viewports, and ensures every live modular file is cleanly formatted and immediately editable in VS Code and Acode.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan below incorporates all three preferences confirmed during clarification. Review and click **Proceed** to apply these changes across the live workspace and test suite.

- **Confirmed Decision 1 — Auto-Landscape Behavior**: Automatically rotate the stage 90° in portrait viewports **and** attempt native hardware fullscreen landscape lock, with automatic fallback whenever a browser, WebView, or narrow viewport ignores native orientation lock.
- **Confirmed Decision 2 — Default Analog Joystick Controls**: Set **Analog Joystick** as the default control mode across **all 29 games**, controllable via both a **Global Default Control Mode** switcher (apply to all games at once) and a **Per-Game Control Mode** override in Settings and the in-game toolbar.
- **Confirmed Decision 3 — Code Editor Compatibility (VS Code & Acode)**: Emit cleanly formatted, multi-line, 2-space indented, strict ES5 `.js` and readable `.css` modules strictly `<= 150 KB` each (no single-line minification that freezes Acode), paired with `.editorconfig` and VS Code workspace settings.

---

## 1. Overview & Core Concept

- **What It Does**: Solves four platform-wide usability and compatibility issues in one coordinated pass:
  1. **Universal Button Color Restoration**: Fixes the root CSS downgrade pipeline defect that caused Tailwind v4 gradient buttons (`from-* to-*`) and translucent alpha backgrounds to lose their fills and become invisible in Legends Arena (`LOCK IN`, `ENTER`, `START GAME`, `BAN HERO`, `RANKED`) and across all other games, plus audits every button state for guaranteed fallback fills and WCAG AA contrast.
  2. **Global Default Analog Controls**: Switches every game's out-of-the-box mobile/touch control layout from discrete arrow buttons to the responsive Analog Joystick while letting players switch globally (all games) or per individual game inside Settings or the live HUD.
  3. **Reliable Auto-Landscape Engine**: Repairs smartphone/WebView detection, stale native orientation-lock flags, rotated CSS stage sizing (`100vw`/`100vh` inside rotated modals), and canvas/touch coordinate projection so landscape games actually render in landscape on portrait phones, tablets, Acode preview, and narrow browser windows.
  4. **Universal Editor Compatibility**: Ensures every live code file is human-formatted multi-line UTF-8 (no BOM, LF line endings, 2-space indentation, `<= 150 KB`, relative `./` paths) and adds standard editor configuration for VS Code and Acode.
- **Target Audience**: Mobile gamers (Android/iOS, Acode preview, WebViews) and desktop players/developers editing and running the project directly from its live folders in VS Code or Acode.
- **Key Value**: Every button is instantly visible and high-contrast, every game launches immediately with smooth analog stick controls and working landscape orientation, and any file can be opened, read, edited, and saved in Acode or VS Code without lag or build tooling.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Legends Arena Ranked / Classic / Draft Flow**:
   - Opening Legends Arena displays high-contrast metallic gold (`#E6B84C` → `#C68618`) and royal crimson/navy buttons across the Main Lobby, Mode Selector, Pre-Match Room (`START GAME`), Match Found modal (`ENTER`), and Draft Pick (`BAN HERO`, `LOCK IN`, `SWAP`, `READY`).
   - Clicking `LOCK IN`, `ENTER`, or switching Ranked/Classic/Brawl states preserves vivid, solid background colors and legible text in normal, hover, active, selected, and disabled states—never collapsing to transparent or dark-on-dark.
2. **Global & Per-Game Analog Control Switching**:
   - Launching any of the 29 games automatically enables the floating **Analog Joystick** on the lower-left thumb zone (minimum `44×44px` touch targets for all action buttons, thumb-ergonomic reach in the lower 40% of the screen).
   - Opening **Settings → Controls** presents:
     - **Global Default Controls**: Segmented toggle (`Analog Stick` | `Buttons`) plus an **"Apply to All Games"** action that immediately updates every game's control preference.
     - **Current Game Override**: Existing per-game toggle (`Analog Stick` | `Buttons`) and live drag-and-drop position/scale editor so players can still customize individual titles (such as racing or puzzle games).
3. **Auto-Landscape Activation**:
   - When **Auto-Landscape** is enabled (default) and a player opens the arcade or launches a landscape game on a portrait phone, tablet, Acode preview, or narrow portrait viewport:
     - The viewport manager attempts native fullscreen + hardware landscape lock synchronously on user gesture.
     - If the browser or WebView remains physically portrait (`width < height`), the stage seamlessly engages the 90°-rotated landscape viewport with matched logical dimensions, aligned touch/pointer coordinates, and full-width/full-height modals (no clipped `100vw`/`100vh` overlays).
   - Toggling **Orientation: Auto-Landscape / Free Portrait** in Settings or the top bar updates orientation immediately without exiting fullscreen or losing game state.

### Visual Identity & Theme
- **Aesthetic Direction**: Preserves each game's authentic visual language (Legends Arena royal obsidian `#070E21` & burnished gold `#E6B84C`, Hoops 2K26 dual-era crimson/cyan, Garden & Arcade soft glassmorphic shell) while strictly enforcing WCAG AA contrast (`>= 4.5:1` for text, `>= 3:1` for large labels and controls).
- **Color & Contrast Hardening**:
  - Every gradient CTA (`bg-gradient-to-*`) receives explicit solid fallback colors beneath the gradient plus valid CSS custom property initial values (`--tw-gradient-from-position: 0%`, `--tw-gradient-to-position: 100%`, `--tw-gradient-via-position: 50%`) and standard sRGB `linear-gradient(...)` syntax (stripping unsupported `in oklab` interpolation and converting `oklch(...)` tokens to exact sRGB hex/rgba values).
  - Translucent utility backgrounds (`/50`, `/75`, `/80`, `/90`) preserve their true alpha transparency instead of collapsing to opaque black/white or breaking inside `@supports`.
  - Hover, focus-visible, active, and disabled button states pair explicit color shifts with clear labels or icons (never relying on color alone).
- **Touch Ergonomics & Motion**:
  - Interactive buttons maintain `>= 44px` touch targets on mobile with snappy `<= 180ms` compositor-only (`transform`, `opacity`) press feedback.
  - Top bar and sticky controls stay compact (`<= 15%` viewport height) in both physical landscape and 90°-rotated portrait-to-landscape mode.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Fix Root Tailwind v4 Legacy CSS Downgrade Pipeline + Per-Component Button Fallbacks**
  - *Chosen Approach*: Repair the CSS legacy post-processor so it preserves `@property` defaults via `:root, *, ::before, ::after` initializers, converts `oklch(...)` to exact sRGB `rgb()`/`rgba()`, strips unsupported `in oklab` gradient color-space clauses, preserves `color-mix()` alpha channels cleanly without broken `@supports` overrides, AND adds solid fallback `background-color` + contrast-verified text classes on Legends Arena and global arcade buttons.
  - *Why*: Fixing the CSS downgrade pipeline repairs **every** Tailwind v4 button across all 29 games simultaneously (including Legends Arena `LOCK IN`, `ENTER`, `START GAME`, `BAN`, Hoops 2K26, Naruto, Asphalt, and shell modals), while explicit button fallbacks guarantee zero invisible buttons even in ultra-old Android WebViews.
  - *Alternatives Considered*: Manually rewriting hundreds of button classes with inline styles alone—rejected because it would leave gradient cards, badges, hover states, and translucent overlays broken across the rest of the app.

- **Decision 2 — Global Control Preference Layer + Backward-Compatible Migration**
  - *Chosen Approach*: Store a global default control mode (`'analog'` by default) alongside per-game overrides. Games without an explicit user override inherit the global default (`'analog'`), and users can switch either the global default (affecting all games) or a single game's mode inside Settings or the live HUD.
  - *Why*: Meets the requirement that Analog is the default across every game while preserving full player customization and existing saved layouts.
  - *Alternatives Considered*: Hardcoding `'analog'` and discarding per-game overrides—rejected because players want the ability to switch individual games back to buttons in Settings.

- **Decision 3 — Physical-Dimension-Verified Auto-Landscape with Fullscreen + 90° Stage Fallback**
  - *Chosen Approach*: Verify actual physical viewport orientation (`width >= height`) after requesting native orientation lock. Whenever `orientationMode === 'auto'` and the viewport remains physically portrait (`height > width`) on a phone, touch device, or narrow landscape-game viewport, activate the 90°-rotated stage automatically and constrain inner fixed modals to `--stage-w` × `--stage-h`.
  - *Why*: Browsers like iOS Safari, Acode WebView, iframes, and desktop-mode mobile browsers often ignore or silently resolve `screen.orientation.lock('landscape')` without rotating the screen. Verifying physical dimensions guarantees Auto-Landscape works 100% of the time.
  - *Alternatives Considered*: Relying solely on `screen.orientation.lock()`—rejected because it fails silently in WebViews and iOS browsers.

- **Decision 4 — Human-Readable Multi-Line ES5 Output (`<= 150 KB`) + Editor Config**
  - *Chosen Approach*: Configure the live emitter to output formatted, multi-line, 2-space indented ES5 `.js` and formatted `.css` modules with LF line endings and UTF-8 (no BOM), keeping every file strictly under the 150 KB cap via automatic chunk splitting, and include `.editorconfig` and VS Code workspace configuration (while keeping third-party vendor libraries clean and compact within the cap).
  - *Why*: Single-line minified bundles freeze mobile editors like Acode and make manual edits painful in VS Code. Formatted chunks stay fast to open on phones and immediately readable in any editor.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    LIVE MODULAR BROWSER RUNTIME (?v=9)                    │
│  UTF-8 (no BOM) · LF · 2-space indent · Strict ES5 · Every File <= 150 KB │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┬───────────────────┐
        ▼                       ▼                       ▼                   ▼
┌───────────────────┐  ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Legacy-Safe CSS   │  │ Unified Control     │  │ Auto-Landscape   │  │ Universal Editor │
│ & Button Contrast │  │ Mode Store          │  │ Viewport Engine  │  │ Config & Emitter │
├───────────────────┤  ├─────────────────────┤  ├──────────────────┤  ├──────────────────┤
│ • @property vars  │  │ • Global Default:   │  │ • Native FS +    │  │ • .editorconfig  │
│   initialized     │  │   'analog'          │  │   orient.lock()  │  │ • VS Code config │
│ • oklch() -> sRGB │  │ • Per-game override │  │ • Physical W < H │  │ • Beautified ES5 │
│ • Strip in oklab  │  │   map in storage    │  │   verification   │  │   JS & CSS emit  │
│ • Safe color-mix  │  │ • Global & Per-Game │  │ • 90° Stage CSS  │  │ • Auto-split     │
│ • Legends Arena & │  │   Settings UI       │  │   (--stage-w/h)  │  │   <= 150 KB cap  │
│   all CTA audit   │  │ • Analog Loop + HUD │  │ • Touch XY map   │  │ • Relative ./    │
└───────────────────┘  └─────────────────────┘  └──────────────────┘  └──────────────────┘
```

### Data Model & State
- **Global Control Mode Preference**: Persisted in `localStorage` (`'analog' | 'buttons'`, defaulting to `'analog'`). Each game's control layout records whether the user explicitly overrode `controlMode` for that game; otherwise it dynamically follows the global default.
- **Viewport & Orientation State**: Tracks `physicalWidth`, `physicalHeight`, `logicalWidth`, `logicalHeight`, `orientationMode ('auto' | 'free')`, `nativeLandscapeLocked` (verified against physical dimensions), `isRotatedFallback`, and `isFullscreen`.
- **Editor & Emitter Output**: All live CSS and JS modules emitted with readable formatting, strict Acorn ES5 syntax verification, relative `./` asset paths, and bumped `?v=9` cache-busting query strings + visible Settings version stamp.

### Interactive Component & State Mapping
- **Legends Arena Lobby, Match Found (`ENTER`), Draft (`BAN`/`LOCK IN`), Ranked & All Game Buttons**:
  - Button styles carry solid fallback backgrounds + repaired Tailwind v4 gradients + high-contrast text tokens across default, hover, active, selected, and disabled states; clicking `ENTER`, `LOCK IN`, `START GAME`, or mode tabs transitions state cleanly with preserved button visibility.
- **Arcade Settings Modal & In-Game Control Toolbar**:
  - Global Default Control Mode segmented buttons mutate global storage preference and optionally apply across all 29 saved layouts; Per-Game toggle mutates the active game's layout and immediately shows/hides the floating Analog Joystick vs. directional buttons without restarting the match.
- **Orientation Toggle & Game Launch**:
  - Launching any landscape-preferred game or clicking the Orientation toggle triggers synchronous native fullscreen/orientation lock, verifies physical dimensions after settle, engages or disengages the 90°-rotated stage class + `--stage-w`/`--stage-h` variables, and dispatches a resize event so 2D and Three.js canvases re-fit immediately.
- **Automated Verification**:
  - Add unit tests verifying (a) Tailwind v4 CSS downgrade preserves gradient stops, converts `oklch()` to sRGB, keeps translucent `color-mix()` alpha, and injects `--tw-gradient-*` defaults, (b) default control mode is `'analog'` for all 29 games and honors both global and per-game switching, and (c) Auto-Landscape engages 90° fallback whenever portrait viewports remain unrotated even if native lock resolves without rotating.
  - Run full unit test suite, live ES5 emitter (`0` files `> 150 KB`, strict ES5 pass, readable multi-line formatting), `compile_applet`, and `lint_applet`.
