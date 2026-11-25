// ============================================================================
// NBA 2K14 — Procedural Web Audio Engine (20-Track 2K Beats + Arena SFX)
// Zero external audio URLs; works 100% offline/hermetic.
// ============================================================================

import { BEATS_2K14_TRACKLIST, type Track2kBeats } from '../data/modesData';
import type { Nba2k14Settings } from '../types';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class Nba2k14AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private beatsGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;

  private trackIndex = 0;
  private stepIndex = 0;
  private stepTimer: ReturnType<typeof setInterval> | null = null;
  private playingBeats = false;
  private disabledTrackIds = new Set<string>();
  private volumes: Nba2k14Settings['audio'] = {
    master: 80,
    beats: 62,
    crowd: 75,
    sfx: 85,
    commentary: 75,
    muted: false,
  };

  private eqBars: number[] = Array(12).fill(0.15);
  private listeners = new Set<() => void>();

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.beatsGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.crowdGain = this.ctx.createGain();

      this.beatsGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.crowdGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn());
  }

  public syncSettings(audio: Nba2k14Settings['audio'], disabledIds: string[]): void {
    this.volumes = { ...audio };
    this.disabledTrackIds = new Set(disabledIds);
    this.applyVolumes();
    this.emit();
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.masterGain || !this.beatsGain || !this.sfxGain || !this.crowdGain) return;
    const now = this.ctx.currentTime;
    const m = this.volumes.muted ? 0 : (this.volumes.master / 100) * 0.65;
    this.masterGain.gain.setTargetAtTime(m, now, 0.03);
    this.beatsGain.gain.setTargetAtTime((this.volumes.beats / 100) * 0.42, now, 0.03);
    this.sfxGain.gain.setTargetAtTime((this.volumes.sfx / 100) * 0.72, now, 0.03);
    this.crowdGain.gain.setTargetAtTime((this.volumes.crowd / 100) * 0.45, now, 0.03);
  }

  public getCurrentTrack(): Track2kBeats {
    return BEATS_2K14_TRACKLIST[this.trackIndex % BEATS_2K14_TRACKLIST.length];
  }

  public isBeatsPlaying(): boolean {
    return this.playingBeats;
  }

  public getEqBars(): number[] {
    return this.eqBars;
  }

  public startBeats(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (this.playingBeats) return;
    this.playingBeats = true;
    this.restartStepLoop();
    this.emit();
  }

  public stopBeats(): void {
    this.playingBeats = false;
    if (this.stepTimer) {
      clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.eqBars = Array(12).fill(0.1);
    this.emit();
  }

  public toggleBeats(): void {
    if (this.playingBeats) this.stopBeats();
    else this.startBeats();
  }

  public playTrackById(trackId: string): void {
    const idx = BEATS_2K14_TRACKLIST.findIndex((t) => t.id === trackId);
    if (idx >= 0) {
      this.trackIndex = idx;
      this.stepIndex = 0;
      this.playingBeats = true;
      this.ensureContext();
      this.restartStepLoop();
      this.emit();
    }
  }

  public nextTrack(): void {
    for (let i = 1; i <= BEATS_2K14_TRACKLIST.length; i++) {
      const candidate = (this.trackIndex + i) % BEATS_2K14_TRACKLIST.length;
      if (!this.disabledTrackIds.has(BEATS_2K14_TRACKLIST[candidate].id)) {
        this.trackIndex = candidate;
        break;
      }
    }
    this.stepIndex = 0;
    if (this.playingBeats) this.restartStepLoop();
    this.emit();
  }

  private restartStepLoop(): void {
    if (this.stepTimer) clearInterval(this.stepTimer);
    const track = this.getCurrentTrack();
    const stepMs = Math.max(95, Math.round((60 / track.bpm / 4) * 1000));
    this.stepTimer = setInterval(() => this.triggerBeatStep(), stepMs);
  }

  private triggerBeatStep(): void {
    if (!this.playingBeats || !this.ctx || !this.beatsGain || this.volumes.muted) return;
    const track = this.getCurrentTrack();
    const s = this.stepIndex % 16;
    const bar = Math.floor(this.stepIndex / 16) % 4;
    const now = this.ctx.currentTime;

    // 808 Kick on hip-hop pattern
    const kickHits = track.style === 'trap' ? [0, 6, 10] : track.style === 'rock_arena' ? [0, 4, 8, 12] : [0, 3, 8, 10];
    if (kickHits.includes(s)) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
      g.gain.setValueAtTime(0.45, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g);
      g.connect(this.beatsGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // Crisp Snare / Clap on 4 & 12
    if (s === 4 || s === 12) {
      this.playNoiseBurst(this.beatsGain, 0.09, 1400, 0.22);
    }

    // Hi-Hat ticks
    if (s % 2 === 0 || (track.style === 'trap' && (s === 7 || s === 15))) {
      this.playNoiseBurst(this.beatsGain, 0.03, 7200, 0.08);
    }

    // Sub-Bass & Arena Brass / Synth Stabs
    if (s === 0 || s === 6 || s === 10) {
      const deg = track.scale[(bar + (s === 10 ? 2 : 0)) % track.scale.length];
      const freq = midiToFreq(track.rootMidi - 12 + deg);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = track.style === 'anthem' ? 'sawtooth' : 'triangle';
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = track.style === 'anthem' ? 920 : 520;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(filt);
      filt.connect(g);
      g.connect(this.beatsGain);
      osc.start(now);
      osc.stop(now + 0.26);
    }

    // Top Melody / Brass Anthem Chord on bar downbeat
    if (s === 0 || s === 8) {
      const chordRoot = track.rootMidi + 12 + track.scale[bar % track.scale.length];
      [0, 3, 7].forEach((iv) => {
        if (!this.ctx || !this.beatsGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = track.style === 'synth_funk' ? 'sine' : 'sawtooth';
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass';
        filt.frequency.value = 1400;
        osc.frequency.setValueAtTime(midiToFreq(chordRoot + iv), now);
        g.gain.setValueAtTime(0.055, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(filt);
        filt.connect(g);
        g.connect(this.beatsGain);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    }

    // Update visualizer EQ bars
    this.eqBars = this.eqBars.map((_, idx) => {
      const pulse = kickHits.includes(s) && idx < 4 ? 0.92 : s === 4 || s === 12 ? 0.78 : 0.32;
      return Math.min(1, Math.max(0.12, pulse * (0.55 + Math.sin(this.stepIndex * 0.9 + idx * 1.1) * 0.45)));
    });

    this.stepIndex += 1;
    // Auto-advance track every 16 bars (~30s)
    if (this.stepIndex >= 256) {
      this.nextTrack();
    }
  }

  private playNoiseBurst(dest: AudioNode, duration: number, freq: number, gainAmt: number): void {
    if (!this.ctx) return;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = gainAmt;
    src.connect(filt);
    filt.connect(g);
    g.connect(dest);
    src.start();
  }

  // ==================== ON-COURT & UI SFX ====================

  public playUiClick(type: 'select' | 'back' | 'hover' = 'select'): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    const startF = type === 'select' ? 540 : type === 'back' ? 320 : 440;
    const endF = type === 'select' ? 780 : type === 'back' ? 210 : 500;
    osc.frequency.setValueAtTime(startF, now);
    osc.frequency.exponentialRampToValueAtTime(endF, now + 0.055);
    g.gain.setValueAtTime(type === 'hover' ? 0.07 : 0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playDribble(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const jitter = 0.92 + Math.random() * 0.16;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(52 * jitter, now + 0.075);
    g.gain.setValueAtTime(0.28, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSneakerSqueak(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const base = 2600 + Math.random() * 900;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(base * 1.18, now + 0.04);
    osc.frequency.linearRampToValueAtTime(base * 0.9, now + 0.085);
    g.gain.setValueAtTime(0.065, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playSwish(chainNet = false): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    if (chainNet) {
      // Metallic Blacktop chain-net rattle
      this.playNoiseBurst(this.sfxGain, 0.22, 4600, 0.28);
      const now = ctx.currentTime;
      [1840, 2320, 3110].forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + idx * 0.025);
        g.gain.setValueAtTime(0.07, now + idx * 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.14);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(now + idx * 0.025);
        osc.stop(now + idx * 0.025 + 0.15);
      });
    } else {
      this.playNoiseBurst(this.sfxGain, 0.19, 3200, 0.32);
    }
  }

  public playRimClank(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    [320, 485, 710].forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.88, now + 0.16);
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.19);
    });
  }

  public playDunkBoom(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.28);
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
    this.playRimClank();
    this.playCrowdCheer(1.0);
  }

  public playWhistle(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 2820;
    lfo.frequency.value = 34;
    lfoGain.gain.value = 110;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.4);
    lfo.stop(now + 0.4);
  }

  public playBuzzer(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    [138, 194, 276].forEach((f) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.18, now);
      g.gain.setValueAtTime(0.18, now + 0.65);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.88);
    });
  }

  public playCrowdCheer(intensity = 0.7): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.crowdGain || this.volumes.muted) return;
    const dur = 0.7 + intensity * 0.8;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 950 + intensity * 450;
    filt.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = 0.22 * intensity;
    src.connect(filt);
    filt.connect(g);
    g.connect(this.crowdGain);
    src.start();
  }

  public playArenaOrgan(kind: 'defense' | 'three' | 'andone'): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.crowdGain || this.volumes.muted) return;
    const now = ctx.currentTime;
    const notes =
      kind === 'defense' ? [60, 60, 55] : kind === 'three' ? [64, 67, 72] : [60, 64, 67, 72];
    notes.forEach((m, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 1800;
      osc.frequency.value = midiToFreq(m);
      const t = now + i * 0.14;
      g.gain.setValueAtTime(0.11, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(filt);
      filt.connect(g);
      g.connect(this.crowdGain!);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  }
}

export const Nba2k14Audio = new Nba2k14AudioEngine();
