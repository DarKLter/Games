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
