import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeViewportSnapshot,
  exitAppFullscreen,
  getAutoFullscreenEnabled,
  getOrientationMode,
  getViewportSnapshot,
  requestAppFullscreen,
  setAutoFullscreenEnabled,
  setOrientationMode,
  toggleAppFullscreen,
  toggleAutoFullscreenEnabled
} from './viewport';
import { tryStorage } from './storage';

test('Smartphone Auto Full Screen: snapshot fields, independent Portrait/Landscape, and iOS fallback', async () => {
  // 1. Snapshot exposes independent fullscreen & orientation states
  const portraitFull = computeViewportSnapshot(390, 844, true, 'free', false, true, true, false, true);
  assert.equal(portraitFull.isSmartphone, true);
  assert.equal(portraitFull.orientationMode, 'free');
  assert.equal(portraitFull.isRotatedFallback, false);
  assert.equal(portraitFull.isFullscreen, true);
  assert.equal(portraitFull.nativeFullscreen, true);
  assert.equal(portraitFull.fullscreenSupported, true);
  assert.equal(portraitFull.immersiveFallback, false);
  assert.equal(portraitFull.autoFullscreenEnabled, true);

  // 2. iOS Safari / restricted WebView fallback marks isFullscreen=true via immersiveFallback
  const iosFallback = computeViewportSnapshot(390, 844, true, 'auto', false, false, false, true, true);
  assert.equal(iosFallback.isFullscreen, true);
  assert.equal(iosFallback.nativeFullscreen, false);
  assert.equal(iosFallback.fullscreenSupported, false);
  assert.equal(iosFallback.immersiveFallback, true);

  // 3. Auto Full Screen toggle persists to tsepang_auto_fullscreen independently of orientation
  setAutoFullscreenEnabled(true);
  assert.equal(getAutoFullscreenEnabled(), true);
  assert.equal(tryStorage.getItem('tsepang_auto_fullscreen'), 'on');

  assert.equal(toggleAutoFullscreenEnabled(), false);
  assert.equal(getAutoFullscreenEnabled(), false);
  assert.equal(tryStorage.getItem('tsepang_auto_fullscreen'), 'off');

  assert.equal(toggleAutoFullscreenEnabled(), true);
  assert.equal(getAutoFullscreenEnabled(), true);
  assert.equal(tryStorage.getItem('tsepang_auto_fullscreen'), 'on');

  // 4. Requesting fullscreen without native DOM API cleanly engages dynamic viewport fallback
  const entered = await requestAppFullscreen({ allowFallback: true });
  assert.equal(entered.ok, true);
  assert.equal(entered.mode, 'fallback');
  assert.equal(getViewportSnapshot().isFullscreen, true);
  assert.equal(getViewportSnapshot().immersiveFallback, true);

  // 5. Switching orientation to Free / Portrait MUST NOT exit Full Screen
  setOrientationMode('free');
  assert.equal(getOrientationMode(), 'free');
  assert.equal(getViewportSnapshot().isFullscreen, true);
  assert.equal(getViewportSnapshot().immersiveFallback, true);

  // 6. Toggle / Exit Full Screen cleanly exits fallback mode
  const toggledOff = await toggleAppFullscreen();
  assert.equal(toggledOff.ok, true);
  assert.equal(toggledOff.mode, 'exited');
  assert.equal(getViewportSnapshot().isFullscreen, false);
  assert.equal(getViewportSnapshot().immersiveFallback, false);

  await exitAppFullscreen();
  assert.equal(getViewportSnapshot().isFullscreen, false);

  // Restore default orientation
  setOrientationMode('auto');
});

test('Auto-Landscape fallback: portrait smartphones, narrow screens, landscape games, and stale nativeLocked guard', () => {
  // 1. Stale nativeLandscapeLocked=true while still physically portrait MUST NOT suppress 90-degree fallback
  const staleLock = computeViewportSnapshot(390, 844, true, 'auto', true);
  assert.equal(staleLock.physicalOrientation, 'portrait');
  assert.equal(staleLock.nativeLandscapeLocked, false);
  assert.equal(staleLock.isRotatedFallback, true);
  assert.equal(staleLock.logicalWidth, 844);
  assert.equal(staleLock.logicalHeight, 390);

  // 2. Narrow portrait browser / WebView (<= 900px) rotates cleanly in Auto Landscape mode even if isSmartphone=false
  const narrowWebView = computeViewportSnapshot(412, 915, false, 'auto', false);
  assert.equal(narrowWebView.isRotatedFallback, true);
  assert.equal(narrowWebView.logicalWidth, 915);
  assert.equal(narrowWebView.logicalHeight, 412);

  // 3. Large tablet in portrait rotates when a landscape game is active (forceLandscapeOnPortrait=true)
  const tabletPortrait = computeViewportSnapshot(1024, 1366, false, 'auto', false, false, false, false, true, true);
  assert.equal(tabletPortrait.isRotatedFallback, true);
  assert.equal(tabletPortrait.logicalWidth, 1366);
  assert.equal(tabletPortrait.logicalHeight, 1024);

  // 4. Free / Portrait mode disables 90-degree rotation everywhere
  const freeMode = computeViewportSnapshot(412, 915, false, 'free', false, false, false, false, true, true);
  assert.equal(freeMode.isRotatedFallback, false);
  assert.equal(freeMode.logicalWidth, 412);
  assert.equal(freeMode.logicalHeight, 915);
});

test('Global Default Analog Stick across all 29 games, Global toggle, and Per-Game overrides', async () => {
  const {
    getDefaultGameLayout,
    getGlobalControlMode,
    loadGameLayout,
    resetGameLayout,
    saveGameLayout,
    setGlobalControlMode
  } = await import('./controlLayouts');

  // Ensure default starts at analog
  setGlobalControlMode('analog', true);
  assert.equal(getGlobalControlMode(), 'analog');
  for (let gameId = 0; gameId < 29; gameId++) {
    resetGameLayout(gameId);
    const def = getDefaultGameLayout(gameId);
    assert.equal(def.controlMode, 'analog', `Game ${gameId} should default to analog`);
    assert.equal(loadGameLayout(gameId).controlMode, 'analog', `Loaded game ${gameId} should default to analog`);
  }

  // Per-game override to buttons on game 25 (Legends Arena) must persist while other games stay analog
  const laLayout = loadGameLayout(25);
  saveGameLayout(25, { ...laLayout, controlMode: 'buttons', controlModeExplicit: true });
  assert.equal(loadGameLayout(25).controlMode, 'buttons');
  assert.equal(loadGameLayout(27).controlMode, 'analog');

  // Global switch with applyToAllGames=true updates all 29 games including previously overridden ones
  setGlobalControlMode('buttons', true);
  assert.equal(getGlobalControlMode(), 'buttons');
  assert.equal(loadGameLayout(0).controlMode, 'buttons');
  assert.equal(loadGameLayout(25).controlMode, 'buttons');
  assert.equal(loadGameLayout(27).controlMode, 'buttons');

  // Switch back to analog globally and verify restoration
  setGlobalControlMode('analog', true);
  assert.equal(getGlobalControlMode(), 'analog');
  assert.equal(loadGameLayout(25).controlMode, 'analog');
  assert.equal(loadGameLayout(27).controlMode, 'analog');
});

test('Legacy CSS downgrade preserves Tailwind v4 gradient stops, converts oklch(), and strips broken color-mix @supports', async () => {
  const mod = await import('../../scripts/legacy-css-downgrade.mjs');
  const sampleCss = [
    ':root { --color-rose-600: oklch(58.6% .253 17.585); --color-slate-950: oklch(12.9% .042 264.695); }',
    '.bg-rose-600 { background-color: var(--color-rose-600); }',
    '.bg-slate-950\\/80 { background-color: #020618cc; }',
    '@supports (color: color-mix(in lab, red, red)) { .bg-slate-950\\/80 { background-color: color-mix(in oklab, var(--color-slate-950) 80%, transparent); } }',
    '.bg-gradient-to-r { --tw-gradient-position: to right in oklab; background-image: linear-gradient(var(--tw-gradient-stops)); }',
    '@property --tw-gradient-from-position { syntax: "*"; inherits: false; initial-value: 0%; }',
    '@property --tw-gradient-to-position { syntax: "*"; inherits: false; initial-value: 100%; }',
    '@supports (((-webkit-hyphens:none)) and (not (margin-trim:inline))) { *, :before, :after { --tw-gradient-from-position: 0%; --tw-gradient-to-position: 100%; } }'
  ].join('');

  const out = mod.downgradeCssForLegacyBrowsers(sampleCss);
  assert.ok(!out.includes('oklch('), 'No oklch() should remain in downgraded CSS');
  assert.ok(!out.includes('in oklab'), 'No "in oklab" gradient interpolation should remain');
  assert.ok(!out.includes('@property'), 'No @property should remain');
  assert.ok(!out.includes('color-mix('), 'No color-mix() should remain');
  assert.ok(!out.includes('-webkit-hyphens'), 'Safari-only @supports wrapper must be unwrapped');
  assert.ok(out.includes('--tw-gradient-from-position:0%') || out.includes('--tw-gradient-from-position: 0%'), 'Gradient from-position default must be preserved unconditionally');
  assert.ok(out.includes('--tw-gradient-to-position:100%') || out.includes('--tw-gradient-to-position: 100%'), 'Gradient to-position default must be preserved unconditionally');
  assert.ok(out.split('\n').length >= 5, 'Output CSS should be multi-line formatted for Acode/VS Code');
});

test('Landscape full-screen fit: unrotated #root uses physical --phys-w/--phys-h and never clips rotated stage to half height', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync('src/styles/base.css', 'utf8');
  const rootFallbackMatch = css.match(/body\.viewport-fullscreen-fallback\s+#root\s*\{([^}]+)\}/);
  assert.ok(rootFallbackMatch, 'base.css must define a dedicated body.viewport-fullscreen-fallback #root rule');
  assert.ok(rootFallbackMatch[1].includes('--phys-w'), '#root must use physical width --phys-w');
  assert.ok(rootFallbackMatch[1].includes('--phys-h'), '#root must use physical height --phys-h');
  assert.ok(!rootFallbackMatch[1].includes('--stage-h'), '#root must NEVER use swapped --stage-h (would clip half the screen in rotated landscape)');
});


