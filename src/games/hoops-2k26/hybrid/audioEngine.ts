import type { BeatsTrackDef, SettingsState, UIEraMode } from './types';

export const HYBRID_2K_BEATS_TRACKS: BeatsTrackDef[] = [
  {
    id: 'crown_2014',
    title: 'Crown of 2014',
    artist: '2K14 Hardwood Collective',
    eraTag: '2K14',
    bpm: 92,
    keyNote: 45, // A2
    style: 'boombap',
    durationLabel: '3:14',
  },
  {
    id: 'kings_hardwood',
    title: "King's Hardwood",
    artist: 'Miami Spotlight Brass',
    eraTag: '2K14',
    bpm: 96,
    keyNote: 48, // C3
    style: 'anthem',
    durationLabel: '3:28',
  },
  {
    id: 'skyline_2k26',
    title: 'Skyline 2K26',
    artist: 'The City Synth Lab',
    eraTag: '2K26',
    bpm: 128,
    keyNote: 50, // D3
    style: 'trap',
    durationLabel: '2:56',
  },
  {
    id: 'neon_crossover',
    title: 'Neon Crossover',
    artist: 'Sunset Park Electro',
    eraTag: '2K26',
    bpm: 118,
    keyNote: 52, // E3
    style: 'electrofunk',
    durationLabel: '3:08',
  },
  {
    id: 'chinatown_bounce',
    title: 'Chinatown Bounce',
    artist: 'Blacktop Percussion',
    eraTag: 'HYBRID',
    bpm: 104,
    keyNote: 47, // B2
    style: 'streetball',
    durationLabel: '2:49',
  },
  {
    id: 'clutch_symphony',
    title: 'Clutch Time Symphony',
    artist: '4th Quarter Orchestra',
    eraTag: 'HYBRID',
    bpm: 112,
    keyNote: 43, // G2
    style: 'clutch',
    durationLabel: '3:36',
  },
];

export interface HybridBeatsSnapshot {
  isPlaying: boolean;
  currentTrack: BeatsTrackDef;
  trackIndex: number;
  shuffle: boolean;
  stepPulse: number;
  enabledTrackIds: string[];
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

class HybridAudioEngineImpl {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private masterVol = 0.82;
  private musicVol = 0.65;
  private sfxVol = 0.88;
  private crowdVol = 0.76;
  private commentaryVol = 0.8;
  private paEnabled = true;

  private isPlaying = false;
  private trackIndex = 0;
  private shuffle = false;
  private step = 0;
  private timerId: number | null = null;
  private enabledTrackIds: string[] = HYBRID_2K_BEATS_TRACKS.map((t) => t.id);
  private listeners = new Set<(snap: HybridBeatsSnapshot) => void>();

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuffer && this.ctx) {
      const len = Math.floor(this.ctx.sampleRate * 1.2);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  public applySettings(audio: SettingsState['audio']): void {
    this.masterVol = Math.max(0, Math.min(1, audio.masterVolume / 100));
    this.musicVol = Math.max(0, Math.min(1, audio.musicVolume / 100));
    this.sfxVol = Math.max(0, Math.min(1, audio.sfxVolume / 100));
    this.crowdVol = Math.max(0, Math.min(1, audio.crowdVolume / 100));
    this.commentaryVol = Math.max(0, Math.min(1, audio.commentaryVolume / 100));
    this.paEnabled = audio.paAnnouncerEnabled;
    this.shuffle = audio.beatsShuffle;
    if (audio.enabledTrackIds.length > 0) {
      this.enabledTrackIds = [...audio.enabledTrackIds];
    }
    this.emit();
  }

  private sfxGain(scale = 1): number {
    return this.masterVol * this.sfxVol * scale;
  }

  private musicGain(scale = 1): number {
    return this.masterVol * this.musicVol * scale;
  }

  // ---------------- UI SFX (2K14 Metallic vs 2K26 Glass) ----------------

  public playUi(action: 'hover' | 'click' | 'confirm' | 'back' | 'switch', era: UIEraMode): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.18);
    if (!ctx || vol <= 0.001) return;

    const now = ctx.currentTime;
    const is2K14 = era === '2K14_CLASSIC';

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (is2K14) {
      // Bold metallic clack / click
      osc.type = action === 'confirm' ? 'sawtooth' : 'triangle';
      const baseFreq =
        action === 'hover'
          ? 240
          : action === 'click'
            ? 380
            : action === 'confirm'
              ? 520
              : action === 'back'
                ? 210
                : 440;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(
        action === 'back' ? 120 : baseFreq * 1.45,
        now + (action === 'confirm' ? 0.11 : 0.055)
      );
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + (action === 'confirm' ? 0.13 : 0.065));
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      // Crisp 2K26 glass chime / whoosh
      osc.type = action === 'switch' ? 'sine' : 'triangle';
      const f1 =
        action === 'hover'
          ? 640
          : action === 'click'
            ? 860
            : action === 'confirm'
              ? 980
              : action === 'back'
                ? 460
                : 720;
      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.exponentialRampToValueAtTime(
        action === 'back' ? 310 : f1 * 1.25,
        now + (action === 'confirm' ? 0.14 : 0.07)
      );
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + (action === 'confirm' ? 0.16 : 0.08));
      osc.start(now);
      osc.stop(now + 0.17);
    }
  }

  // ---------------- ON-COURT BASKETBALL SFX ----------------

  public playDribble(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.32);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.09);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playSneakerSqueak(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.14);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2450, now);
    osc.frequency.exponentialRampToValueAtTime(3400, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(2100, now + 0.09);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.0008, now + 0.1);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playSwish(chainNet = false): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.28);
    if (!ctx || !this.noiseBuffer || vol <= 0.001) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(chainNet ? 3800 : 2100, now);
    filter.frequency.exponentialRampToValueAtTime(chainNet ? 1600 : 850, now + 0.24);
    filter.Q.value = chainNet ? 4.2 : 1.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    src.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.28);
  }

  public playRimClank(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.28);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    [310, 485, 790].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + 0.18);
      g.gain.setValueAtTime(vol / (idx + 1.5), now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    });
  }

  public playBackboardThud(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.3);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(115, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playGreenRelease(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.26);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    [587.33, 880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.045);
      g.gain.setValueAtTime(vol, now + i * 0.045);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.24);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.26);
    });
  }

  public playDunkSlam(): void {
    this.playRimClank();
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.42);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(128, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.25);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playWhistle(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.2);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2850, now);
    lfo.frequency.setValueAtTime(32, now);
    lfoGain.gain.setValueAtTime(95, now);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(g);
    g.connect(ctx.destination);
    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.38);
    osc.stop(now + 0.38);
  }

  public playBuzzer(): void {
    const ctx = this.ensureContext();
    const vol = this.sfxGain(0.28);
    if (!ctx || vol <= 0.001) return;
    const now = ctx.currentTime;
    [138, 184].forEach((freq) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(vol * 0.65, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    });
  }

  public playCrowdRoar(intensity = 0.8): void {
    const ctx = this.ensureContext();
    const vol = this.masterVol * this.crowdVol * 0.22 * Math.max(0.2, Math.min(1, intensity));
    if (!ctx || !this.noiseBuffer || vol <= 0.001) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.setValueAtTime(740, now);
    lp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.16);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.05);
    src.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    src.start(now);
    src.stop(now + 1.1);
  }

  public announce(line: string): void {
    if (!this.paEnabled || this.masterVol * this.commentaryVol <= 0.02) return;
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(line);
      utter.rate = 1.08;
      utter.pitch = 0.92;
      utter.volume = Math.min(1, this.masterVol * this.commentaryVol);
      synth.speak(utter);
    } catch {
      // Safe fallback when speech synthesis is unavailable
    }
  }

  // ---------------- 2K BEATS 6-TRACK PROCEDURAL JUKEBOX ----------------

  public getBeatsSnapshot(): HybridBeatsSnapshot {
    return {
      isPlaying: this.isPlaying,
      currentTrack: HYBRID_2K_BEATS_TRACKS[this.trackIndex] ?? HYBRID_2K_BEATS_TRACKS[0],
      trackIndex: this.trackIndex,
      shuffle: this.shuffle,
      stepPulse: this.step % 16,
      enabledTrackIds: [...this.enabledTrackIds],
    };
  }

  public subscribe(fn: (snap: HybridBeatsSnapshot) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    const snap = this.getBeatsSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  private scheduleBeatStep(): void {
    if (!this.isPlaying) return;
    const track = HYBRID_2K_BEATS_TRACKS[this.trackIndex] ?? HYBRID_2K_BEATS_TRACKS[0];
    const ctx = this.ensureContext();
    const vol = this.musicGain(0.16);
    const s = this.step % 16;

    if (ctx && vol > 0.002) {
      const now = ctx.currentTime;
      const root = track.keyNote;

      // Kick drum pattern
      const kickPattern =
        track.style === 'trap'
          ? [0, 3, 6, 10, 14]
          : track.style === 'boombap' || track.style === 'anthem'
            ? [0, 7, 8, 14]
            : [0, 4, 8, 12];
      if (kickPattern.includes(s)) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(track.style === 'trap' ? 115 : 135, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.14);
        g.gain.setValueAtTime(vol * 1.45, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      // Snare / Clap on 4 & 12
      if ((s === 4 || s === 12) && this.noiseBuffer) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(1100, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.72, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        src.connect(hp);
        hp.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.13);
      }

      // Hi-hat groove
      if (s % 2 === 0 && this.noiseBuffer) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(6500, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * 0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        src.connect(hp);
        hp.connect(g);
        g.connect(ctx.destination);
        src.start(now);
        src.stop(now + 0.05);
      }

      // Melodic synth / brass motif
      const scaleOffsets =
        track.style === 'anthem' || track.style === 'clutch'
          ? [0, 3, 7, 10, 12, 7, 5, 3]
          : track.style === 'electrofunk'
            ? [0, 5, 7, 10, 12, 10, 7, 5]
            : [0, 0, 3, 5, 7, 5, 3, -2];
      if (s % 2 === 0) {
        const note = root + 12 + scaleOffsets[(s / 2) % scaleOffsets.length];
        const osc = ctx.createOscillator();
        const lp = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type =
          track.style === 'anthem' || track.style === 'boombap'
            ? 'sawtooth'
            : track.style === 'clutch'
              ? 'triangle'
              : 'square';
        osc.frequency.setValueAtTime(midiToFreq(note), now);
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(track.style === 'trap' ? 1600 : 1250, now);
        g.gain.setValueAtTime(vol * 0.42, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(lp);
        lp.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      }
    }

    this.step = (this.step + 1) % 64;
    this.emit();

    const stepMs = Math.max(95, Math.round((60 / track.bpm / 4) * 1000));
    this.timerId = window.setTimeout(() => this.scheduleBeatStep(), stepMs);
  }

  public play(): void {
    if (this.isPlaying) return;
    this.ensureContext();
    this.isPlaying = true;
    this.emit();
    this.scheduleBeatStep();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.emit();
  }

  public togglePlay(): boolean {
    if (this.isPlaying) this.pause();
    else this.play();
    return this.isPlaying;
  }

  public selectTrack(trackId: string, autoPlay = true): BeatsTrackDef {
    const idx = HYBRID_2K_BEATS_TRACKS.findIndex((t) => t.id === trackId);
    if (idx >= 0) {
      this.trackIndex = idx;
      this.step = 0;
    }
    if (autoPlay && !this.isPlaying) {
      this.play();
    } else {
      this.emit();
    }
    return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
  }

  public nextTrack(): BeatsTrackDef {
    const enabled = HYBRID_2K_BEATS_TRACKS.map((t, i) => ({ t, i })).filter(({ t }) =>
      this.enabledTrackIds.includes(t.id)
    );
    if (enabled.length === 0) return HYBRID_2K_BEATS_TRACKS[this.trackIndex];

    if (this.shuffle && enabled.length > 1) {
      const choices = enabled.filter((e) => e.i !== this.trackIndex);
      const pick = choices[Math.floor(Math.random() * choices.length)] ?? enabled[0];
      this.trackIndex = pick.i;
    } else {
      const curPos = enabled.findIndex((e) => e.i === this.trackIndex);
      this.trackIndex = enabled[(curPos + 1) % enabled.length].i;
    }
    this.step = 0;
    this.emit();
    return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
  }

  public prevTrack(): BeatsTrackDef {
    const enabled = HYBRID_2K_BEATS_TRACKS.map((t, i) => ({ t, i })).filter(({ t }) =>
      this.enabledTrackIds.includes(t.id)
    );
    if (enabled.length === 0) return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
    const curPos = enabled.findIndex((e) => e.i === this.trackIndex);
    const nextPos = (curPos - 1 + enabled.length) % enabled.length;
    this.trackIndex = enabled[nextPos].i;
    this.step = 0;
    this.emit();
    return HYBRID_2K_BEATS_TRACKS[this.trackIndex];
  }

  public toggleShuffle(): boolean {
    this.shuffle = !this.shuffle;
    this.emit();
    return this.shuffle;
  }

  public toggleTrackEnabled(trackId: string): string[] {
    const exists = this.enabledTrackIds.includes(trackId);
    if (exists && this.enabledTrackIds.length <= 1) {
      return [...this.enabledTrackIds]; // Keep at least 1 track active
    }
    this.enabledTrackIds = exists
      ? this.enabledTrackIds.filter((id) => id !== trackId)
      : [...this.enabledTrackIds, trackId];
    this.emit();
    return [...this.enabledTrackIds];
  }
}

export const HybridAudioEngine = new HybridAudioEngineImpl();
