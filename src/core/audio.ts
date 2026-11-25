import { tryStorage } from './storage';
import { BgmTheme } from './types';

export type SfxPackId = 'classic' | 'realistic' | 'retro';

export interface SfxPackDef {
  id: SfxPackId;
  name: string;
  icon: string;
  desc: string;
}

export const SFX_PACKS: SfxPackDef[] = [
  { id: 'classic', name: 'Arcade Classic', icon: '🕹️', desc: 'Balanced arcade synth' },
  { id: 'realistic', name: 'Realistic', icon: '🔊', desc: 'Punchy acoustic & noise bursts' },
  { id: 'retro', name: 'Retro Synth', icon: '👾', desc: '8-bit chiptune square waves' }
];

export function isValidSfxPack(val: unknown): val is SfxPackId {
  return val === 'classic' || val === 'realistic' || val === 'retro';
}

export type SoundKind =
  | 'click'
  | 'coin'
  | 'jump'
  | 'flap'
  | 'slide'
  | 'dash'
  | 'slash'
  | 'match'
  | 'combo'
  | 'place'
  | 'clear'
  | 'plant'
  | 'shoot'
  | 'zombieHit'
  | 'slingshot'
  | 'break'
  | 'cook'
  | 'serve'
  | 'chomp'
  | 'boost'
  | 'punch'
  | 'ko'
  | 'cueHit'
  | 'pocket'
  | 'chessMove'
  | 'chessCapture'
  | 'chessCheck'
  | 'key'
  | 'wordSolved'
  | 'gas'
  | 'hit'
  | 'hurt'
  | 'levelup'
  | 'win'
  | 'gameover'
  | 'shot'
  | 'sniper'
  | 'headshot'
  | 'save'
  | 'reload'
  | 'jetpack'
  | 'explosion'
  | 'sword'
  | 'arrow'
  | 'magic'
  | 'warHorn'
  | 'sudokuOk'
  | 'swish'
  | 'rimClank'
  | 'buzzer'
  | 'whistle'
  | 'dribble';

interface ThemePattern {
  ms: number;
  melody: number[];
  bass: number[];
  wave: OscillatorType;
}

const THEME_PATTERNS: Record<BgmTheme, ThemePattern> = {
  arcade: {
    ms: 175,
    wave: 'triangle',
    melody: [523, 0, 659, 784, 659, 0, 587, 523, 440, 0, 523, 659, 587, 0, 494, 440],
    bass: [131, 131, 165, 165, 147, 147, 131, 131, 110, 110, 131, 131, 147, 147, 123, 110]
  },
  action: {
    ms: 150,
    wave: 'square',
    melody: [330, 0, 392, 440, 392, 330, 494, 0, 440, 0, 392, 330, 294, 330, 392, 0],
    bass: [110, 110, 110, 165, 110, 110, 131, 147, 110, 110, 110, 165, 98, 98, 123, 131]
  },
  tactical: {
    ms: 145,
    wave: 'sawtooth',
    melody: [220, 0, 262, 330, 294, 0, 262, 247, 220, 0, 330, 392, 349, 0, 330, 294],
    bass: [82, 82, 98, 110, 82, 82, 110, 98, 82, 82, 98, 110, 73, 82, 98, 82]
  },
  war: {
    ms: 165,
    wave: 'sawtooth',
    melody: [294, 294, 349, 440, 0, 392, 349, 330, 294, 0, 440, 523, 494, 440, 392, 0],
    bass: [98, 98, 110, 147, 98, 98, 131, 147, 98, 98, 110, 147, 110, 131, 147, 110]
  },
  puzzle: {
    ms: 210,
    wave: 'sine',
    melody: [523, 659, 784, 0, 698, 659, 587, 0, 523, 587, 659, 784, 880, 0, 784, 0],
    bass: [131, 0, 196, 0, 175, 0, 147, 0, 131, 0, 165, 0, 175, 0, 196, 0]
  },
  chill: {
    ms: 260,
    wave: 'sine',
    melody: [440, 0, 523, 0, 659, 0, 587, 0, 392, 0, 494, 0, 587, 0, 523, 0],
    bass: [110, 0, 0, 165, 147, 0, 0, 110, 98, 0, 0, 147, 131, 0, 0, 110]
  },
  garden: {
    ms: 225,
    wave: 'sine',
    melody: [392, 494, 587, 0, 659, 587, 494, 0, 440, 523, 587, 0, 494, 440, 392, 0],
    bass: [98, 0, 147, 0, 131, 0, 147, 0, 110, 0, 147, 0, 123, 0, 98, 0]
  }
};

function loadInitialSfxPack(): SfxPackId {
  const saved = tryStorage.getItem('tsepang_sfx_pack');
  return isValidSfxPack(saved) ? saved : 'classic';
}

class ArcadeAudioEngine {
  ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  sfxEnabled = tryStorage.getItem('tsepang_sfx') !== '0';
  bgmEnabled = tryStorage.getItem('tsepang_bgm') !== '0';
  sfxPack: SfxPackId = loadInitialSfxPack();
  bgmTimer: ReturnType<typeof setInterval> | null = null;
  bgmStep = 0;
  currentTheme: BgmTheme | null = null;
  paused = false;
  masterVolume = (() => {
    const raw = parseFloat(tryStorage.getItem('tsepang_master_vol') || '0.8');
    return Number.isFinite(raw) ? Math.max(0, Math.min(1, raw)) : 0.8;
  })();

  bgmAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  coinAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  clickAudio = typeof Audio !== 'undefined' ? new Audio() : null;
  private onToggleSync: (() => void) | null = null;
  private lastPlayedAt = new Map<SoundKind, number>();

  constructor() {
    if (this.bgmAudio) this.bgmAudio.volume = this.masterVolume;
    if (this.coinAudio) this.coinAudio.volume = this.masterVolume;
    if (this.clickAudio) this.clickAudio.volume = this.masterVolume;
  }

  setToggleSync(cb: () => void): void {
    this.onToggleSync = cb;
  }

  getSfxPack(): SfxPackId {
    return this.sfxPack;
  }

  setSfxPack(pack: SfxPackId, preview = true): void {
    if (!isValidSfxPack(pack)) return;
    this.sfxPack = pack;
    tryStorage.setItem('tsepang_sfx_pack', pack);
    if (preview && this.sfxEnabled) {
      this.play('coin');
    }
    this.onToggleSync?.();
  }

  setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    tryStorage.setItem('tsepang_master_vol', String(this.masterVolume));
    if (this.bgmAudio) this.bgmAudio.volume = this.masterVolume;
    if (this.coinAudio) this.coinAudio.volume = this.masterVolume;
    if (this.clickAudio) this.clickAudio.volume = this.masterVolume;
  }

  ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) this.ctx = new Ctor();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private ensureNoiseBuffer(ac: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ac.sampleRate) {
      return this.noiseBuffer;
    }
    const len = Math.floor(ac.sampleRate * 0.6);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buf;
    return buf;
  }

  noiseBurst(
    dur = 0.08,
    filterFreq = 1400,
    filterType: BiquadFilterType = 'bandpass',
    q = 1.4,
    gainPeak = 0.14,
    delay = 0
  ): void {
    if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
    try {
      const ac = this.ensureCtx();
      if (!ac) return;
      const t0 = ac.currentTime + delay;
      const src = ac.createBufferSource();
      src.buffer = this.ensureNoiseBuffer(ac);
      const filter = ac.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(Math.max(40, filterFreq), t0);
      filter.Q.setValueAtTime(Math.max(0.2, q), t0);
      const g = ac.createGain();
      const amp = Math.max(0.001, gainPeak * this.masterVolume);
      g.gain.setValueAtTime(amp, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(ac.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    } catch {
      // ignore WebAudio lock before gesture
    }
  }

  note(freq: number, dur = 0.1, type: OscillatorType = 'triangle', gainPeak = 0.14, delay = 0, slideTo: number | null = null): void {
    if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
    try {
      const ac = this.ensureCtx();
      if (!ac) return;

      let effType = type;
      let effFreq = freq;
      let effDur = dur;
      let effGain = gainPeak;
      let effSlide = slideTo;

      if (this.sfxPack === 'retro') {
        effType = type === 'sawtooth' ? 'sawtooth' : 'square';
        effFreq = freq * 1.06;
        effDur = Math.max(0.032, dur * 0.85);
        effGain = Math.min(0.14, gainPeak * 0.78);
        effSlide = slideTo ? slideTo * 1.08 : null;
      } else if (this.sfxPack === 'realistic') {
        effType = type === 'square' ? 'triangle' : type;
        effFreq = freq * 0.92;
        effDur = Math.max(0.04, dur * 1.08);
        effGain = gainPeak * 0.92;
        effSlide = slideTo ? slideTo * 0.92 : null;
      }

      const t0 = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = effType;
      osc.frequency.setValueAtTime(Math.max(30, effFreq), t0);
      if (effSlide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, effSlide), t0 + effDur);
      const amp = Math.max(0.001, effGain * this.masterVolume);
      g.gain.setValueAtTime(amp, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + effDur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + effDur + 0.02);
    } catch {
      // ignore WebAudio lock before gesture
    }
  }

  bgmNote(freq: number, dur = 0.18, type: OscillatorType = 'triangle', vol = 0.055): void {
    if (!this.bgmEnabled || this.paused || this.masterVolume <= 0.01 || !freq) return;
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const ac = this.ensureCtx();
      if (!ac) return;
      const t0 = ac.currentTime;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(vol * this.masterVolume, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      // ignore
    }
  }

  play(kind: SoundKind): void {
    if (!this.sfxEnabled || this.masterVolume <= 0.01) return;
    if (
      kind === 'coin' ||
      kind === 'hit' ||
      kind === 'shoot' ||
      kind === 'shot' ||
      kind === 'cueHit' ||
      kind === 'zombieHit' ||
      kind === 'gas' ||
      kind === 'jetpack' ||
      kind === 'dribble'
    ) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const prev = this.lastPlayedAt.get(kind) ?? -Infinity;
      if (now - prev < 38) return;
      this.lastPlayedAt.set(kind, now);
    }
    if (kind === 'click' && this.clickAudio?.src) {
      this.clickAudio.currentTime = 0;
      this.clickAudio.play().catch(() => {});
      return;
    }
    if (kind === 'coin' && this.coinAudio?.src) {
      this.coinAudio.currentTime = 0;
      this.coinAudio.play().catch(() => {});
      return;
    }

    if (this.sfxPack === 'realistic') {
      switch (kind) {
        case 'click': this.noiseBurst(0.025, 2200, 'highpass', 1.2, 0.09); this.note(420, 0.03, 'sine', 0.06, 0, 220); return;
        case 'coin': this.note(1174, 0.09, 'sine', 0.13, 0); this.note(1760, 0.22, 'sine', 0.11, 0.045); this.note(3520, 0.16, 'sine', 0.04, 0.05); return;
        case 'shot': this.noiseBurst(0.09, 1650, 'bandpass', 0.9, 0.22); this.note(140, 0.08, 'sine', 0.18, 0, 42); return;
        case 'sniper': this.noiseBurst(0.18, 1200, 'lowpass', 0.7, 0.26); this.note(165, 0.16, 'triangle', 0.22, 0, 38); return;
        case 'explosion': this.noiseBurst(0.36, 460, 'lowpass', 0.8, 0.28); this.note(92, 0.3, 'sine', 0.24, 0, 30); return;
        case 'sword':
        case 'slash': this.noiseBurst(0.095, 3100, 'bandpass', 1.8, 0.16); this.note(520, 0.06, 'triangle', 0.09, 0, 210); return;
        case 'punch':
        case 'ko': this.noiseBurst(0.08, 550, 'lowpass', 1.0, 0.18); this.note(115, 0.12, 'sine', 0.22, 0, 42); return;
        case 'arrow':
        case 'slingshot': this.noiseBurst(0.06, 2600, 'bandpass', 2.2, 0.11); this.note(360, 0.07, 'triangle', 0.09, 0, 190); return;
        case 'swish': this.noiseBurst(0.12, 3400, 'bandpass', 1.1, 0.14); this.note(880, 0.09, 'sine', 0.09, 0.03, 1320); return;
        case 'rimClank': this.noiseBurst(0.05, 1900, 'bandpass', 2.5, 0.12); this.note(260, 0.12, 'triangle', 0.13, 0, 160); return;
        case 'dribble': this.noiseBurst(0.03, 420, 'lowpass', 1.2, 0.08); this.note(110, 0.065, 'sine', 0.13, 0, 58); return;
        case 'cueHit': this.noiseBurst(0.028, 3800, 'highpass', 1.6, 0.12); this.note(680, 0.04, 'sine', 0.12, 0, 310); return;
        case 'break': this.noiseBurst(0.14, 1500, 'highpass', 1.0, 0.18); this.note(150, 0.1, 'triangle', 0.12, 0, 65); return;
        case 'gas':
        case 'jetpack': this.noiseBurst(0.075, 420, 'lowpass', 0.9, 0.08); this.note(88, 0.06, 'triangle', 0.06, 0, 105); return;
        case 'reload': this.noiseBurst(0.035, 2400, 'bandpass', 2.0, 0.1); this.note(320, 0.05, 'triangle', 0.08, 0.06, 480); return;
        default: break;
      }
    }

    switch (kind) {
      case 'click': this.note(520, 0.045, 'triangle', 0.09, 0, 380); break;
      case 'coin':
        this.note(987.77, 0.065, 'sine', 0.13, 0);
        this.note(1318.51, 0.14, 'sine', 0.13, 0.055);
        if (this.sfxPack === 'retro') this.note(1975.5, 0.12, 'square', 0.08, 0.11);
        break;
      case 'jump': this.note(220, 0.12, 'triangle', 0.14, 0, 520); break;
      case 'flap': this.note(300, 0.075, 'sine', 0.12, 0, 490); break;
      case 'slide': this.note(360, 0.09, 'triangle', 0.1, 0, 150); break;
      case 'dash': this.note(420, 0.06, 'sine', 0.09, 0, 620); break;
      case 'slash': this.note(680, 0.08, 'sawtooth', 0.09, 0, 210); break;
      case 'match': this.note(587, 0.08, 'sine', 0.13, 0); this.note(880, 0.11, 'sine', 0.12, 0.05); break;
      case 'combo': this.note(523, 0.07, 'triangle', 0.12, 0); this.note(659, 0.07, 'triangle', 0.12, 0.05); this.note(1046, 0.14, 'sine', 0.14, 0.1); break;
      case 'place': this.note(260, 0.07, 'triangle', 0.14, 0, 180); break;
      case 'clear': this.note(523, 0.08, 'square', 0.08, 0); this.note(784, 0.16, 'triangle', 0.14, 0.07); break;
      case 'plant': this.note(392, 0.08, 'sine', 0.12, 0, 523); break;
      case 'shoot': this.note(540, 0.06, 'square', 0.07, 0, 260); break;
      case 'zombieHit': this.note(190, 0.08, 'sawtooth', 0.1, 0, 110); break;
      case 'slingshot': this.note(190, 0.14, 'triangle', 0.15, 0, 480); break;
      case 'break': this.note(180, 0.11, 'square', 0.11, 0, 75); break;
      case 'cook': this.note(720, 0.06, 'sine', 0.1, 0, 960); break;
      case 'serve': this.note(659, 0.07, 'sine', 0.13, 0); this.note(988, 0.13, 'sine', 0.14, 0.06); break;
      case 'chomp': this.note(240, 0.08, 'sawtooth', 0.13, 0, 120); break;
      case 'boost': this.note(320, 0.09, 'sawtooth', 0.08, 0, 640); break;
      case 'punch': this.note(165, 0.08, 'sawtooth', 0.15, 0, 62); break;
      case 'ko': this.note(220, 0.14, 'sawtooth', 0.16, 0, 55); this.note(440, 0.16, 'square', 0.1, 0.08, 880); break;
      case 'cueHit': this.note(780, 0.045, 'triangle', 0.14, 0, 320); break;
      case 'pocket': this.note(330, 0.08, 'sine', 0.14, 0); this.note(660, 0.12, 'sine', 0.12, 0.05); break;
      case 'chessMove': this.note(280, 0.055, 'triangle', 0.12, 0, 190); break;
      case 'chessCapture': this.note(360, 0.08, 'sawtooth', 0.11, 0, 140); break;
      case 'chessCheck': this.note(740, 0.09, 'sine', 0.14, 0); this.note(988, 0.12, 'sine', 0.12, 0.06); break;
      case 'key': this.note(600, 0.04, 'sine', 0.09, 0, 520); break;
      case 'sudokuOk': this.note(660, 0.055, 'sine', 0.11, 0, 880); break;
      case 'wordSolved': this.note(523, 0.07, 'sine', 0.12, 0); this.note(659, 0.07, 'sine', 0.12, 0.06); this.note(784, 0.14, 'sine', 0.13, 0.12); break;
      case 'gas': this.note(95, 0.06, 'sawtooth', 0.055, 0, 118); break;
      case 'hit': this.note(660, 0.07, 'sine', 0.13, 0, 880); break;
      case 'hurt': this.note(155, 0.18, 'sawtooth', 0.16, 0, 58); break;
      case 'shot': this.note(340, 0.09, 'triangle', 0.16, 0, 48); break;
      case 'sniper': this.note(240, 0.16, 'sawtooth', 0.18, 0, 45); break;
      case 'headshot': this.note(1120, 0.07, 'sine', 0.14, 0, 1680); break;
      case 'save': this.note(523, 0.08, 'sine', 0.12, 0); this.note(784, 0.12, 'sine', 0.12, 0.06); break;
      case 'reload': this.note(220, 0.055, 'square', 0.08, 0); this.note(420, 0.06, 'square', 0.08, 0.06); break;
      case 'jetpack': this.note(140, 0.06, 'sawtooth', 0.05, 0, 175); break;
      case 'explosion': this.note(135, 0.22, 'sawtooth', 0.18, 0, 38); this.note(90, 0.24, 'square', 0.12, 0.02, 32); break;
      case 'sword': this.note(620, 0.06, 'triangle', 0.11, 0, 260); break;
      case 'arrow': this.note(840, 0.05, 'sine', 0.08, 0, 420); break;
      case 'magic': this.note(480, 0.09, 'sine', 0.12, 0, 960); this.note(720, 0.12, 'triangle', 0.1, 0.05, 1180); break;
      case 'warHorn': this.note(196, 0.18, 'sawtooth', 0.13, 0, 262); this.note(294, 0.24, 'triangle', 0.13, 0.12, 392); break;
      case 'swish':
        this.note(880, 0.06, 'sine', 0.12, 0, 1320);
        this.note(1174, 0.12, 'triangle', 0.14, 0.05, 1760);
        break;
      case 'rimClank':
        this.note(210, 0.08, 'square', 0.11, 0, 125);
        this.note(145, 0.1, 'triangle', 0.12, 0.04, 92);
        break;
      case 'buzzer':
        this.note(110, 0.42, 'sawtooth', 0.16, 0, 102);
        this.note(138, 0.42, 'square', 0.1, 0, 130);
        break;
      case 'whistle':
        this.note(2450, 0.14, 'sine', 0.09, 0, 2680);
        this.note(2580, 0.12, 'sine', 0.08, 0.09, 2320);
        break;
      case 'dribble':
        this.note(135, 0.055, 'sine', 0.08, 0, 72);
        break;
      case 'levelup':
        this.note(523, 0.08, 'triangle', 0.13, 0);
        this.note(659, 0.08, 'triangle', 0.13, 0.07);
        this.note(784, 0.08, 'triangle', 0.13, 0.14);
        this.note(1046, 0.18, 'sine', 0.14, 0.21);
        break;
      case 'win':
        this.note(523, 0.09, 'triangle', 0.14, 0);
        this.note(659, 0.09, 'triangle', 0.14, 0.08);
        this.note(784, 0.09, 'triangle', 0.14, 0.16);
        this.note(1046, 0.28, 'sine', 0.16, 0.24);
        break;
      case 'gameover':
        this.note(330, 0.14, 'sawtooth', 0.13, 0, 260);
        this.note(260, 0.14, 'sawtooth', 0.13, 0.13, 196);
        this.note(196, 0.28, 'sawtooth', 0.13, 0.26, 110);
        break;
    }
  }

  startBgm(theme: BgmTheme = 'arcade'): void {
    this.currentTheme = theme;
    this.paused = false;
    if (this.bgmAudio?.src) {
      if (this.bgmEnabled) {
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.masterVolume;
        this.bgmAudio.play().catch(() => {});
      } else {
        this.bgmAudio.pause();
      }
      return;
    }
    this.stopTimer();
    if (!this.bgmEnabled) return;
    const cfg = THEME_PATTERNS[theme] || THEME_PATTERNS.arcade;
    this.bgmStep = 0;
    this.bgmTimer = setInterval(() => {
      if (!this.bgmEnabled || this.paused) return;
      const idx = this.bgmStep % cfg.melody.length;
      const m = cfg.melody[idx];
      const b = cfg.bass[idx];
      if (m) this.bgmNote(m, cfg.ms * 0.0011, cfg.wave, cfg.wave === 'square' || cfg.wave === 'sawtooth' ? 0.028 : 0.048);
      if (b) this.bgmNote(b, cfg.ms * 0.0013, 'triangle', 0.052);
      this.bgmStep++;
    }, cfg.ms);
  }

  stopTimer(): void {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  stopBgm(): void {
    this.stopTimer();
    this.currentTheme = null;
    this.lastPlayedAt.clear();
    try {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      }
    } catch {
      // ignore
    }
  }

  syncPause(isPaused: boolean): void {
    this.paused = !!isPaused;
    if (this.bgmAudio?.src) {
      if (this.paused || !this.bgmEnabled) this.bgmAudio.pause();
      else this.bgmAudio.play().catch(() => {});
    }
  }

  toggleBgm(): void {
    this.bgmEnabled = !this.bgmEnabled;
    tryStorage.setItem('tsepang_bgm', this.bgmEnabled ? '1' : '0');
    if (this.bgmEnabled) {
      this.ensureCtx();
      if (this.currentTheme) this.startBgm(this.currentTheme);
    } else {
      this.stopTimer();
      try {
        this.bgmAudio?.pause();
      } catch {
        // ignore
      }
    }
    this.onToggleSync?.();
  }

  toggleSfx(): void {
    this.sfxEnabled = !this.sfxEnabled;
    tryStorage.setItem('tsepang_sfx', this.sfxEnabled ? '1' : '0');
    if (this.sfxEnabled) this.play('click');
    this.onToggleSync?.();
  }
}

export const ArcadeAudio = new ArcadeAudioEngine();
