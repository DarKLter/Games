import { tryStorage } from './storage';

export type OrientationMode = 'auto' | 'free';

export interface ViewportSnapshot {
  isSmartphone: boolean;
  physicalWidth: number;
  physicalHeight: number;
  physicalOrientation: 'portrait' | 'landscape';
  logicalWidth: number;
  logicalHeight: number;
  isRotatedFallback: boolean;
  nativeLandscapeLocked: boolean;
  orientationMode: OrientationMode;
  isFullscreen: boolean;
  nativeFullscreen: boolean;
  fullscreenSupported: boolean;
  immersiveFallback: boolean;
  autoFullscreenEnabled: boolean;
}

export interface SmartphoneFingerprintInput {
  userAgent?: string;
  maxTouchPoints?: number;
  hasCoarsePointer?: boolean;
  hasTouchStart?: boolean;
  screenW: number;
  screenH: number;
  innerW: number;
  innerH: number;
}

const ORIENTATION_STORAGE_KEY = 'tsepang_orientation_mode';
const AUTO_FULLSCREEN_STORAGE_KEY = 'tsepang_auto_fullscreen';

export function isSmartphoneFingerprint(input: SmartphoneFingerprintInput): boolean {
  const ua = input.userAgent || '';
  const hasPhoneUa = /Android.*Mobile|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile Safari/i.test(ua);
  const isTabletUa = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const hasTouch = Boolean(input.hasCoarsePointer || input.hasTouchStart || (input.maxTouchPoints ?? 0) > 0);
  const minScreen = Math.min(input.screenW || 0, input.screenH || 0);
  const maxScreen = Math.max(input.screenW || 0, input.screenH || 0);
  const minInner = Math.min(input.innerW || 0, input.innerH || 0);
  const maxInner = Math.max(input.innerW || 0, input.innerH || 0);

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

export function computeViewportSnapshot(
  physW: number,
  physH: number,
  isSmartphone: boolean,
  orientationMode: OrientationMode,
  nativeLandscapeLocked: boolean,
  nativeFullscreen = false,
  fullscreenSupported = false,
  immersiveFallback = false,
  autoFullscreenEnabled = true,
  forceLandscapeOnPortrait = false
): ViewportSnapshot {
  const w = Math.max(240, Math.round(physW || 800));
  const h = Math.max(240, Math.round(physH || 600));
  const physicalOrientation: 'portrait' | 'landscape' = w >= h ? 'landscape' : 'portrait';
  // If browser/WebView claims nativeLandscapeLocked while physical dimensions remain portrait,
  // do NOT suppress the 90-degree rotated stage fallback.
  const effectiveNativeLocked = Boolean(nativeLandscapeLocked && physicalOrientation === 'landscape');
  const shouldRotatePortrait =
    orientationMode === 'auto' &&
    physicalOrientation === 'portrait' &&
    !effectiveNativeLocked &&
    (isSmartphone || forceLandscapeOnPortrait || w <= 900);
  const isRotatedFallback = Boolean(shouldRotatePortrait);
  return {
    isSmartphone,
    physicalWidth: w,
    physicalHeight: h,
    physicalOrientation,
    logicalWidth: isRotatedFallback ? h : w,
    logicalHeight: isRotatedFallback ? w : h,
    isRotatedFallback,
    nativeLandscapeLocked: effectiveNativeLocked,
    orientationMode,
    isFullscreen: Boolean(nativeFullscreen || immersiveFallback),
    nativeFullscreen: Boolean(nativeFullscreen),
    fullscreenSupported: Boolean(fullscreenSupported),
    immersiveFallback: Boolean(immersiveFallback),
    autoFullscreenEnabled: Boolean(autoFullscreenEnabled)
  };
}

export function mapClientToStage(
  clientX: number,
  clientY: number,
  snap: ViewportSnapshot = getViewportSnapshot()
): { x: number; y: number } {
  if (!snap.isRotatedFallback) {
    return { x: clientX, y: clientY };
  }
  return {
    x: clientY,
    y: snap.physicalWidth - clientX
  };
}

export function mapClientDeltaToStage(
  dx: number,
  dy: number,
  snap: ViewportSnapshot = getViewportSnapshot()
): { dx: number; dy: number } {
  if (!snap.isRotatedFallback) {
    return { dx, dy };
  }
  return {
    dx: dy,
    dy: -dx
  };
}

let cachedOrientationMode: OrientationMode =
  tryStorage.getItem(ORIENTATION_STORAGE_KEY) === 'free' ? 'free' : 'auto';
let cachedAutoFullscreen: boolean =
  tryStorage.getItem(AUTO_FULLSCREEN_STORAGE_KEY) !== 'off';
let cachedNativeLocked = false;
let cachedImmersiveFallback = false;
let cachedForceLandscapeOnPortrait = false;
let manualExitSuppressed = false;
let lastAutoAttemptTs = 0;
let dispatchingSyntheticResize = false;
let initialized = false;
let currentSnapshot: ViewportSnapshot = computeViewportSnapshot(
  800,
  600,
  false,
  cachedOrientationMode,
  false,
  false,
  false,
  false,
  cachedAutoFullscreen,
  false
);
const listeners = new Set<(snap: ViewportSnapshot) => void>();

function readPhysicalDimensions(): { width: number; height: number; offsetTop: number } {
  if (typeof window === 'undefined') return { width: 800, height: 600, offsetTop: 0 };
  const vv = window.visualViewport;
  const docEl = document.documentElement;
  const width = Math.round(vv?.width || docEl?.clientWidth || window.innerWidth || 800);
  const height = Math.round(vv?.height || docEl?.clientHeight || window.innerHeight || 600);
  const offsetTop = Math.max(0, Math.round(vv?.offsetTop || 0));
  return {
    width: Math.max(240, width),
    height: Math.max(240, height),
    offsetTop
  };
}

function isStandaloneDisplayMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const nav = navigator as Navigator & { standalone?: boolean };
    if (nav.standalone === true) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  } catch {
    // ignore unsupported media query
  }
  return false;
}

function detectCurrentSmartphone(physW: number, physH: number): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  let hasCoarse = false;
  try {
    hasCoarse = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  } catch {
    hasCoarse = false;
  }
  return isSmartphoneFingerprint({
    userAgent: navigator.userAgent || '',
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hasCoarsePointer: hasCoarse,
    hasTouchStart: 'ontouchstart' in window,
    screenW: window.screen?.width || physW,
    screenH: window.screen?.height || physH,
    innerW: physW,
    innerH: physH
  });
}

function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null;
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return (
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  );
}

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: (options?: unknown) => Promise<void> | void;
  webkitRequestFullScreen?: (options?: unknown) => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

function getFullscreenCandidates(): FullscreenCapableElement[] {
  if (typeof document === 'undefined') return [];
  const out: FullscreenCapableElement[] = [];
  if (document.documentElement) out.push(document.documentElement as FullscreenCapableElement);
  if (document.body) out.push(document.body as FullscreenCapableElement);
  return out;
}

export function isNativeFullscreenSupported(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as Document & {
    webkitFullscreenEnabled?: boolean;
    mozFullScreenEnabled?: boolean;
    msFullscreenEnabled?: boolean;
  };
  const explicitlyDisabled =
    doc.fullscreenEnabled === false &&
    doc.webkitFullscreenEnabled !== true &&
    doc.mozFullScreenEnabled !== true &&
    doc.msFullscreenEnabled !== true;
  if (explicitlyDisabled) return false;

  const candidates = getFullscreenCandidates();
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (
      typeof el.requestFullscreen === 'function' ||
      typeof el.webkitRequestFullscreen === 'function' ||
      typeof el.webkitRequestFullScreen === 'function' ||
      typeof el.mozRequestFullScreen === 'function' ||
      typeof el.msRequestFullscreen === 'function'
    ) {
      return true;
    }
  }
  return false;
}

function syncDocumentClassesAndVars(snap: ViewportSnapshot, offsetTop = 0): void {
  if (typeof document === 'undefined') return;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty('--phys-w', `${snap.physicalWidth}px`);
  rootStyle.setProperty('--phys-h', `${snap.physicalHeight}px`);
  rootStyle.setProperty('--stage-w', `${snap.logicalWidth}px`);
  rootStyle.setProperty('--stage-h', `${snap.logicalHeight}px`);
  rootStyle.setProperty('--app-vw', `${(snap.logicalWidth * 0.01).toFixed(3)}px`);
  rootStyle.setProperty('--app-vh', `${(snap.logicalHeight * 0.01).toFixed(3)}px`);
  rootStyle.setProperty('--vv-offset-top', `${offsetTop}px`);

  const body = document.body;
  if (!body) return;
  body.classList.toggle('smartphone-device', snap.isSmartphone);
  body.classList.toggle('rotated-landscape', snap.isRotatedFallback);
  body.classList.toggle('force-landscape-ui', snap.isRotatedFallback || (snap.isSmartphone && snap.physicalOrientation === 'landscape'));
  body.classList.toggle('portrait-viewport', !snap.isRotatedFallback && snap.logicalHeight > snap.logicalWidth && snap.logicalWidth < 860);
  body.classList.toggle('app-fullscreen', snap.isFullscreen);
  body.classList.toggle('viewport-fullscreen-fallback', snap.immersiveFallback && !snap.nativeFullscreen);
}

function engageImmersiveViewportFit(): void {
  cachedImmersiveFallback = true;
  if (typeof window !== 'undefined') {
    try {
      window.scrollTo(0, 1);
    } catch {
      // ignore scroll restrictions
    }
    window.setTimeout(() => {
      try {
        window.scrollTo(0, 0);
      } catch {
        // ignore
      }
      refreshViewportSnapshot();
    }, 80);
  }
  refreshViewportSnapshot();
}

export function refreshViewportSnapshot(): ViewportSnapshot {
  const { width, height, offsetTop } = readPhysicalDimensions();
  const isPhone = detectCurrentSmartphone(width, height);
  const nativeFs = Boolean(getFullscreenElement()) || isStandaloneDisplayMode();
  const fsSupported = isNativeFullscreenSupported();

  // If browser exited fullscreen externally (e.g. Android Back or swipe down), reset native orientation lock
  if (!nativeFs && cachedNativeLocked) {
    cachedNativeLocked = false;
  }
  // If physical screen is still portrait, never claim nativeLandscapeLocked is active
  if (width < height && cachedNativeLocked) {
    cachedNativeLocked = false;
  }
  if (width >= height && cachedNativeLocked && typeof screen !== 'undefined') {
    const orientType = (screen.orientation as { type?: string } | undefined)?.type || '';
    if (orientType && !orientType.startsWith('landscape')) {
      cachedNativeLocked = false;
    }
  }
  // If native fullscreen succeeded, clear fallback flag cleanly
  if (nativeFs && cachedImmersiveFallback) {
    cachedImmersiveFallback = false;
  }

  const next = computeViewportSnapshot(
    width,
    height,
    isPhone,
    cachedOrientationMode,
    cachedNativeLocked,
    nativeFs,
    fsSupported,
    cachedImmersiveFallback,
    cachedAutoFullscreen,
    cachedForceLandscapeOnPortrait
  );
  const logicalChanged =
    next.logicalWidth !== currentSnapshot.logicalWidth ||
    next.logicalHeight !== currentSnapshot.logicalHeight ||
    next.isRotatedFallback !== currentSnapshot.isRotatedFallback;
  const changed =
    logicalChanged ||
    next.isSmartphone !== currentSnapshot.isSmartphone ||
    next.physicalWidth !== currentSnapshot.physicalWidth ||
    next.physicalHeight !== currentSnapshot.physicalHeight ||
    next.nativeLandscapeLocked !== currentSnapshot.nativeLandscapeLocked ||
    next.orientationMode !== currentSnapshot.orientationMode ||
    next.isFullscreen !== currentSnapshot.isFullscreen ||
    next.nativeFullscreen !== currentSnapshot.nativeFullscreen ||
    next.fullscreenSupported !== currentSnapshot.fullscreenSupported ||
    next.immersiveFallback !== currentSnapshot.immersiveFallback ||
    next.autoFullscreenEnabled !== currentSnapshot.autoFullscreenEnabled;
  currentSnapshot = next;
  syncDocumentClassesAndVars(next, offsetTop);
  if (changed) {
    listeners.forEach((cb) => cb(next));
  }
  if (logicalChanged && typeof window !== 'undefined' && !dispatchingSyntheticResize) {
    dispatchingSyntheticResize = true;
    try {
      window.dispatchEvent(new Event('resize'));
    } catch {
      // ignore legacy Event construction errors
    } finally {
      dispatchingSyntheticResize = false;
    }
  }
  return next;
}

export function initViewportManager(): ViewportSnapshot {
  if (typeof window === 'undefined') return currentSnapshot;
  const snap = refreshViewportSnapshot();
  if (initialized) return snap;
  initialized = true;

  let orientTimer: ReturnType<typeof setTimeout> | null = null;
  let fsTimer: ReturnType<typeof setTimeout> | null = null;
  const onViewportEvent = () => {
    refreshViewportSnapshot();
  };
  const onFullscreenEvent = () => {
    refreshViewportSnapshot();
    if (fsTimer) clearTimeout(fsTimer);
    fsTimer = setTimeout(() => {
      fsTimer = null;
      refreshViewportSnapshot();
    }, 180);
  };
  const onOrientationEvent = () => {
    refreshViewportSnapshot();
    if (orientTimer) clearTimeout(orientTimer);
    orientTimer = setTimeout(() => {
      orientTimer = null;
      refreshViewportSnapshot();
    }, 160);
  };

  window.addEventListener('resize', onViewportEvent, { passive: true });
  window.addEventListener('orientationchange', onOrientationEvent);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportEvent, { passive: true });
    window.visualViewport.addEventListener('scroll', onViewportEvent, { passive: true });
  }
  document.addEventListener('fullscreenchange', onFullscreenEvent);
  document.addEventListener('webkitfullscreenchange', onFullscreenEvent);
  document.addEventListener('mozfullscreenchange', onFullscreenEvent);
  document.addEventListener('MSFullscreenChange', onFullscreenEvent);
  return snap;
}

export function getViewportSnapshot(): ViewportSnapshot {
  if (typeof window !== 'undefined' && !initialized) {
    return initViewportManager();
  }
  return currentSnapshot;
}

export function getViewportSize(): { width: number; height: number } {
  const snap = getViewportSnapshot();
  return { width: snap.logicalWidth, height: snap.logicalHeight };
}

export function subscribeViewport(cb: (snap: ViewportSnapshot) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getOrientationMode(): OrientationMode {
  return cachedOrientationMode;
}

export function setOrientationMode(mode: OrientationMode): ViewportSnapshot {
  cachedOrientationMode = mode;
  tryStorage.setItem(ORIENTATION_STORAGE_KEY, mode);
  if (mode === 'free') {
    // Unlock orientation ONLY — never kick the user out of Full Screen
    unlockNativeOrientationOnly();
  }
  return refreshViewportSnapshot();
}

export function setActiveLandscapeGame(preferred: boolean): ViewportSnapshot {
  cachedForceLandscapeOnPortrait = Boolean(preferred);
  return refreshViewportSnapshot();
}

export function toggleOrientationMode(): OrientationMode {
  const next: OrientationMode = cachedOrientationMode === 'auto' ? 'free' : 'auto';
  setOrientationMode(next);
  return next;
}

export function getAutoFullscreenEnabled(): boolean {
  return cachedAutoFullscreen;
}

export function setAutoFullscreenEnabled(enabled: boolean): ViewportSnapshot {
  cachedAutoFullscreen = Boolean(enabled);
  tryStorage.setItem(AUTO_FULLSCREEN_STORAGE_KEY, cachedAutoFullscreen ? 'on' : 'off');
  if (cachedAutoFullscreen) {
    manualExitSuppressed = false;
  }
  return refreshViewportSnapshot();
}

export function toggleAutoFullscreenEnabled(): boolean {
  const next = !cachedAutoFullscreen;
  setAutoFullscreenEnabled(next);
  return next;
}

/**
 * Synchronously starts a cross-browser Fullscreen request on the current user-gesture call stack.
 * Keeping the initial invocation synchronous prevents mobile browsers (Chrome Android, Samsung Internet,
 * Firefox, Opera/UC, WebViews) from rejecting the request due to expired user activation.
 */
function invokeNativeFullscreenSync(): Promise<boolean> {
  if (typeof document === 'undefined') return Promise.resolve(false);
  if (getFullscreenElement() || isStandaloneDisplayMode()) return Promise.resolve(true);
  if (!isNativeFullscreenSupported()) return Promise.resolve(false);

  const candidates = getFullscreenCandidates();
  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    try {
      let maybePromise: Promise<void> | void;
      if (typeof el.requestFullscreen === 'function') {
        try {
          maybePromise = el.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
        } catch {
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

      if (maybePromise && typeof (maybePromise as Promise<void>).then === 'function') {
        return (maybePromise as Promise<void>).then(
          () => {
            refreshViewportSnapshot();
            return true;
          },
          () => false
        );
      }
      refreshViewportSnapshot();
      return Promise.resolve(Boolean(getFullscreenElement()));
    } catch {
      // try next candidate element (e.g. document.body)
    }
  }
  return Promise.resolve(false);
}

async function exitCrossBrowserFullscreen(): Promise<void> {
  if (typeof document === 'undefined' || !getFullscreenElement()) return;
  const doc = document as Document & {
    webkitExitFullscreen?: () => Promise<void> | void;
    webkitCancelFullScreen?: () => Promise<void> | void;
    mozCancelFullScreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };
  try {
    if (typeof doc.exitFullscreen === 'function') await doc.exitFullscreen();
    else if (typeof doc.webkitExitFullscreen === 'function') await Promise.resolve(doc.webkitExitFullscreen());
    else if (typeof doc.webkitCancelFullScreen === 'function') await Promise.resolve(doc.webkitCancelFullScreen());
    else if (typeof doc.mozCancelFullScreen === 'function') await Promise.resolve(doc.mozCancelFullScreen());
    else if (typeof doc.msExitFullscreen === 'function') await Promise.resolve(doc.msExitFullscreen());
  } catch {
    // ignore browser restriction
  }
}

export function requestAppFullscreen(opts?: {
  allowFallback?: boolean;
}): Promise<{ ok: boolean; mode: 'native' | 'fallback' | 'blocked' }> {
  const allowFallback = !opts || opts.allowFallback !== false;
  manualExitSuppressed = false;

  if (getFullscreenElement() || isStandaloneDisplayMode()) {
    refreshViewportSnapshot();
    return Promise.resolve({ ok: true, mode: 'native' });
  }

  // Must invoke native fullscreen SYNCHRONOUSLY inside the caller's gesture stack
  const nativePromise = invokeNativeFullscreenSync();
  return nativePromise.then((enteredNative) => {
    if (enteredNative || getFullscreenElement() || isStandaloneDisplayMode()) {
      cachedImmersiveFallback = false;
      refreshViewportSnapshot();
      return { ok: true, mode: 'native' as const };
    }
    if (allowFallback) {
      engageImmersiveViewportFit();
      return { ok: true, mode: 'fallback' as const };
    }
    refreshViewportSnapshot();
    return { ok: false, mode: 'blocked' as const };
  });
}

export async function exitAppFullscreen(): Promise<void> {
  manualExitSuppressed = true;
  cachedImmersiveFallback = false;
  await exitCrossBrowserFullscreen();
  refreshViewportSnapshot();
}

export function toggleAppFullscreen(): Promise<{ ok: boolean; mode: 'native' | 'fallback' | 'exited' | 'blocked' }> {
  const snap = getViewportSnapshot();
  if (snap.nativeFullscreen || snap.immersiveFallback) {
    return exitAppFullscreen().then(() => ({ ok: true, mode: 'exited' as const }));
  }
  return requestAppFullscreen({ allowFallback: true });
}

/**
 * Synchronous smartphone Auto Full Screen trigger called on first tap anywhere
 * and synchronously inside Play / Start / Launch tap handlers.
 * Keeps orientation completely independent from Full Screen.
 */
export function tryAutoFullscreenOnGesture(opts?: { forceOnLaunch?: boolean }): boolean {
  const snap = getViewportSnapshot();
  if (!snap.isSmartphone) return false;
  if (!cachedAutoFullscreen) return false;
  const forceOnLaunch = Boolean(opts && opts.forceOnLaunch);
  if (manualExitSuppressed && !forceOnLaunch) return false;
  if (snap.nativeFullscreen) return false;
  if (!snap.fullscreenSupported && snap.immersiveFallback) return false;

  const now = Date.now();
  if (!forceOnLaunch && now - lastAutoAttemptTs < 350) return false;
  lastAutoAttemptTs = now;

  void requestAppFullscreen({ allowFallback: true });
  return true;
}

function unlockNativeOrientationOnly(): void {
  cachedNativeLocked = false;
  if (typeof screen !== 'undefined') {
    const scr = screen as Screen & {
      unlockOrientation?: () => void;
      mozUnlockOrientation?: () => void;
      msUnlockOrientation?: () => void;
    };
    try {
      screen.orientation?.unlock?.();
      scr.unlockOrientation?.();
      scr.mozUnlockOrientation?.();
      scr.msUnlockOrientation?.();
    } catch {
      // ignore if unsupported
    }
  }
}

export async function requestNativeLandscape(): Promise<{ ok: boolean; reason: 'locked' | 'fallback' }> {
  // Immediately engage Auto-Landscape CSS stage fallback if currently portrait so user sees instant rotation
  cachedOrientationMode = 'auto';
  tryStorage.setItem(ORIENTATION_STORAGE_KEY, 'auto');
  cachedNativeLocked = false;
  refreshViewportSnapshot();

  // Synchronously request fullscreen first (required by Chrome/Android for screen.orientation.lock)
  if (!getFullscreenElement()) {
    await requestAppFullscreen({ allowFallback: cachedAutoFullscreen });
  }
  if (typeof screen !== 'undefined') {
    const scr = screen as Screen & {
      lockOrientation?: (o: string | string[]) => boolean;
      mozLockOrientation?: (o: string | string[]) => boolean;
      msLockOrientation?: (o: string | string[]) => boolean;
    };
    const orient = screen.orientation as { lock?: (mode: string) => Promise<void> } | undefined;
    try {
      let lockedAttempted = false;
      if (orient && typeof orient.lock === 'function') {
        try {
          await orient.lock('landscape');
        } catch {
          await orient.lock('landscape-primary');
        }
        lockedAttempted = true;
      } else {
        const legacyLock = scr.lockOrientation || scr.mozLockOrientation || scr.msLockOrientation;
        if (typeof legacyLock === 'function' && legacyLock.call(scr, ['landscape-primary', 'landscape-secondary'])) {
          lockedAttempted = true;
        }
      }
      if (lockedAttempted) {
        // Verify physical dimensions — WebViews/desktop browsers often resolve lock() without actually rotating
        const dims = readPhysicalDimensions();
        cachedNativeLocked = dims.width >= dims.height;
        refreshViewportSnapshot();
        if (typeof window !== 'undefined') {
          window.setTimeout(() => {
            const later = readPhysicalDimensions();
            cachedNativeLocked = later.width >= later.height;
            refreshViewportSnapshot();
          }, 240);
        }
        if (cachedNativeLocked) {
          return { ok: true, reason: 'locked' };
        }
      }
    } catch {
      // Safari iOS & many WebViews decline orientation.lock silently; fall back cleanly to rotated CSS stage
    }
  }
  cachedNativeLocked = false;
  refreshViewportSnapshot();
  return { ok: false, reason: 'fallback' };
}

export async function unlockNativeOrientation(): Promise<void> {
  unlockNativeOrientationOnly();
  refreshViewportSnapshot();
}

export function installBrowserPolyfills(): void {
  if (typeof window === 'undefined') return;
  const win = window as unknown as Record<string, unknown>;

  if (typeof win.globalThis === 'undefined') {
    win.globalThis = window;
  }

  if (typeof window.requestAnimationFrame !== 'function') {
    const raf =
      (win.webkitRequestAnimationFrame as typeof window.requestAnimationFrame | undefined) ||
      (win.mozRequestAnimationFrame as typeof window.requestAnimationFrame | undefined) ||
      ((cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 16));
    window.requestAnimationFrame = raf;
  }

  if (typeof window.cancelAnimationFrame !== 'function') {
    const caf =
      (win.webkitCancelAnimationFrame as typeof window.cancelAnimationFrame | undefined) ||
      (win.mozCancelAnimationFrame as typeof window.cancelAnimationFrame | undefined) ||
      ((id: number) => window.clearTimeout(id));
    window.cancelAnimationFrame = caf;
  }

  if (typeof window.performance === 'undefined' || typeof window.performance.now !== 'function') {
    const start = Date.now();
    (win as { performance?: { now: () => number } }).performance = {
      now: () => Date.now() - start
    };
  }

  const protoArr = Array.prototype as unknown as { at?: (idx: number) => unknown };
  if (typeof protoArr.at !== 'function') {
    protoArr.at = function (this: unknown[], idx: number) {
      const n = Math.trunc(idx) || 0;
      const k = n < 0 ? this.length + n : n;
      return k >= 0 && k < this.length ? this[k] : undefined;
    };
  }

  const protoStr = String.prototype as unknown as { replaceAll?: (search: string | RegExp, rep: string) => string };
  if (typeof protoStr.replaceAll !== 'function') {
    protoStr.replaceAll = function (this: string, search: string | RegExp, rep: string): string {
      if (search instanceof RegExp) {
        return this.replace(search.global ? search : new RegExp(search.source, `${search.flags}g`), rep);
      }
      return this.split(search).join(rep);
    };
  }

  if (typeof (Object as unknown as { hasOwn?: unknown }).hasOwn !== 'function') {
    (Object as unknown as { hasOwn: (o: object, k: PropertyKey) => boolean }).hasOwn = (o, k) =>
      Object.prototype.hasOwnProperty.call(Object(o), k);
  }

  if (typeof win.AudioContext === 'undefined' && typeof win.webkitAudioContext !== 'undefined') {
    win.AudioContext = win.webkitAudioContext;
  }

  if (
    typeof CanvasRenderingContext2D !== 'undefined' &&
    typeof (CanvasRenderingContext2D.prototype as unknown as { roundRect?: unknown }).roundRect !== 'function'
  ) {
    (CanvasRenderingContext2D.prototype as unknown as {
      roundRect: (x: number, y: number, w: number, h: number, radii?: number | number[] | { x?: number; y?: number }) => void;
    }).roundRect = function (this: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radii?: number | number[] | { x?: number; y?: number }) {
      const parseR = (v: unknown): number => {
        if (typeof v === 'number') return Math.max(0, v);
        if (v && typeof v === 'object') {
          const obj = v as { x?: number; y?: number };
          return Math.max(0, Number(obj.x || obj.y || 0));
        }
        return 0;
      };
      let r: [number, number, number, number] = [0, 0, 0, 0];
      if (typeof radii === 'number' || (radii && typeof radii === 'object' && !Array.isArray(radii))) {
        const rv = parseR(radii);
        r = [rv, rv, rv, rv];
      } else if (Array.isArray(radii) && radii.length > 0) {
        if (radii.length === 1) {
          const a = parseR(radii[0]);
          r = [a, a, a, a];
        } else if (radii.length === 2) {
          const b0 = parseR(radii[0]);
          const b1 = parseR(radii[1]);
          r = [b0, b1, b0, b1];
        } else if (radii.length === 3) {
          const c0 = parseR(radii[0]);
          const c1 = parseR(radii[1]);
          const c2 = parseR(radii[2]);
          r = [c0, c1, c2, c1];
        } else {
          r = [parseR(radii[0]), parseR(radii[1]), parseR(radii[2]), parseR(radii[3])];
        }
      }
      if (w < 0) { x += w; w = -w; }
      if (h < 0) { y += h; h = -h; }
      const maxR = Math.min(w * 0.5, h * 0.5);
      for (let i = 0; i < 4; i++) {
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
    win.ResizeObserver = class FallbackResizeObserver {
      private cb: (entries: Array<{ target: Element; contentRect: DOMRectReadOnly }>) => void;
      private targets: Array<{ el: Element; w: number; h: number }> = [];
      private timer: ReturnType<typeof setInterval> | null = null;
      constructor(cb: (entries: Array<{ target: Element; contentRect: DOMRectReadOnly }>) => void) {
        this.cb = cb;
      }
      private check = () => {
        const entries: Array<{ target: Element; contentRect: DOMRectReadOnly }> = [];
        for (const t of this.targets) {
          const rect = t.el.getBoundingClientRect();
          if (rect.width !== t.w || rect.height !== t.h) {
            t.w = rect.width;
            t.h = rect.height;
            entries.push({ target: t.el, contentRect: rect });
          }
        }
        if (entries.length) {
          try { this.cb(entries); } catch { /* ignore */ }
        }
      };
      observe(el: Element) {
        this.targets.push({ el, w: -1, h: -1 });
        if (this.targets.length === 1) {
          window.addEventListener('resize', this.check);
          this.timer = setInterval(this.check, 350);
        }
        setTimeout(this.check, 0);
      }
      unobserve(el: Element) {
        this.targets = this.targets.filter((t) => t.el !== el);
        if (!this.targets.length) this.disconnect();
      }
      disconnect() {
        this.targets = [];
        window.removeEventListener('resize', this.check);
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
      }
    };
  }

  if (typeof Element !== 'undefined') {
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => {};
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => {};
    }
  }

  initViewportManager();
}
