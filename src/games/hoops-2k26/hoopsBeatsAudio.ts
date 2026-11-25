import { HOOPS_2K_BEATS, HoopsBeatTrackDef } from './hoops2k26Catalog';

export interface HoopsBeatsState {
  isPlaying: boolean;
  trackIndex: number;
  currentTrack: HoopsBeatTrackDef;
  volume: number;
}

type TrackChangeListener = (state: HoopsBeatsState) => void;

class HoopsBeatsPlayer {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private step = 0;
  private playing = false;
  private trackIdx = 0;
  private mutedTrackIds = new Set<string>();
  private volume = 0.22;
  private listeners = new Set<TrackChangeListener>();

  getCurrentTrack(): HoopsBeatTrackDef {
    return HOOPS_2K_BEATS[this.trackIdx] ?? HOOPS_2K_BEATS[0];
  }

  getState(): HoopsBeatsState {
    return {
      isPlaying: this.playing,
      trackIndex: this.trackIdx,
      currentTrack: this.getCurrentTrack(),
      volume: this.volume
    };
  }

  isPlaying(): boolean {
    return this.playing;
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(0.5, v));
  }

  isTrackMuted(id: string): boolean {
    return this.mutedTrackIds.has(id);
  }

  toggleTrackEnabled(id: string): void {
    if (this.mutedTrackIds.has(id)) {
      this.mutedTrackIds.delete(id);
    } else if (this.mutedTrackIds.size < HOOPS_2K_BEATS.length - 1) {
      this.mutedTrackIds.add(id);
      if (this.getCurrentTrack().id === id) {
        this.nextTrack();
      }
    }
    this.emit();
  }

  subscribe(fn: TrackChangeListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    const st = this.getState();
    this.listeners.forEach((fn) => fn(st));
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        try {
          this.ctx = new Ctor();
        } catch {
          return null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  play(): void {
    if (this.playing) return;
    this.ensureContext();
    this.playing = true;
    this.startLoop();
    this.emit();
  }

  stop(): void {
    this.playing = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.emit();
  }

  toggle(): void {
    if (this.playing) this.stop();
    else this.play();
  }

  selectTrack(index: number): void {
    const len = HOOPS_2K_BEATS.length;
    this.trackIdx = ((index % len) + len) % len;
    this.step = 0;
    if (this.playing) {
      this.startLoop();
    }
    this.emit();
  }

  nextTrack(): void {
    const len = HOOPS_2K_BEATS.length;
    for (let i = 1; i <= len; i++) {
      const cand = (this.trackIdx + i) % len;
      if (!this.mutedTrackIds.has(HOOPS_2K_BEATS[cand].id)) {
        this.selectTrack(cand);
        return;
      }
    }
  }

  private startLoop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (typeof window === 'undefined') return;
    const track = this.getCurrentTrack();
    const stepMs = Math.max(90, Math.round((60 / track.bpm / 2) * 1000));
    this.timerId = window.setInterval(() => this.triggerStep(track), stepMs);
  }

  private midiToHz(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  private triggerStep(track: HoopsBeatTrackDef): void {
    if (!this.playing || this.volume <= 0.005) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const s = this.step % 16;
    this.step++;

    // Kick on 0, 6, 8, 14
    if (s === 0 || s === 6 || s === 8 || s === 14) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.11);
      gain.gain.setValueAtTime(this.volume * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    }

    // Crisp rim/snare on 4 and 12
    if (s === 4 || s === 12) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    // Melodic bass/chord stab
    const scale = [0, 3, 5, 7, 10, 12];
    if (s % 2 === 0) {
      const noteOffset = scale[(s / 2 + (track.rootMidi % 3)) % scale.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = s % 4 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(this.midiToHz(track.rootMidi + noteOffset), now);
      gain.gain.setValueAtTime(this.volume * 0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    }
  }
}

export const HoopsBeats = new HoopsBeatsPlayer();
