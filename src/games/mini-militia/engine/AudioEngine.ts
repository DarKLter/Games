import { MmSettingsState } from '../types';

/**
 * 100% Procedural Web Audio API Sound Engine for Mini Militia - Doodle Army 2.
 * Synthesizes unique gunfire per weapon, metallic reloads, jetpack thrust,
 * headshot dings, grenade bounces, explosions, gas hiss, EMP zaps, saw ricochets & chimes.
 */
class MiniMilitiaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterVol = 0.8;
  private sfxVol = 0.85;
  private voiceVol = 0.8;
  private muted = false;
  private noiseBuf: AudioBuffer | null = null;
  private lastJetSfxAt = 0;

  public setVolumes(audio: MmSettingsState['audio']): void {
    this.masterVol = Math.max(0, Math.min(1, audio.master / 100));
    this.sfxVol = Math.max(0, Math.min(1, audio.sfx / 100));
    this.voiceVol = Math.max(0, Math.min(1, audio.voice / 100));
    this.muted = audio.muted;
  }

  private ensureCtx(): AudioContext | null {
    if (this.muted || this.masterVol <= 0.01) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuf && this.ctx) {
      const len = Math.floor(this.ctx.sampleRate * 0.6);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    return this.ctx;
  }

  private gainVal(scale = 1, isVoice = false): number {
    return Math.min(0.65, this.masterVol * (isVoice ? this.voiceVol : this.sfxVol) * scale);
  }

  public playClick(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(640, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.045);
    g.gain.setValueAtTime(this.gainVal(0.14), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  public playWeaponFire(weaponId: string): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.noiseBuf) return;
    const t = ctx.currentTime;

    if (weaponId === 'phasr') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1180, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.08);
      g.gain.setValueAtTime(this.gainVal(0.16), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.095);
      return;
    }

    if (weaponId === 'flamethrower') {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const flt = ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.setValueAtTime(420, t);
      flt.Q.value = 0.8;
      const g = ctx.createGain();
      g.gain.setValueAtTime(this.gainVal(0.14), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      src.connect(flt).connect(g).connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.12);
      return;
    }

    if (weaponId === 'emp_gun') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(860, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.22);
      g.gain.setValueAtTime(this.gainVal(0.24), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
      return;
    }

    if (weaponId === 'saw_gun') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.linearRampToValueAtTime(1420, t + 0.11);
      g.gain.setValueAtTime(this.gainVal(0.2), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
      return;
    }

    if (weaponId === 'machete' || weaponId === 'riot_shield') {
      this.playMelee();
      return;
    }

    const isHeavy = weaponId === 'm93ba' || weaponId === 'smaw' || weaponId === 'spas12' || weaponId === 'sawed_off' || weaponId === 'hunting_rifle';
    const isSilenced = weaponId === 'golden_eagle';
    const isSmg = weaponId === 'uzi' || weaponId === 'tec9' || weaponId === 'mp5' || weaponId === 'minigun';

    // Noise burst
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = isHeavy ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(isHeavy ? 950 : isSilenced ? 1900 : isSmg ? 1600 : 1200, t);
    const ng = ctx.createGain();
    const dur = isHeavy ? 0.22 : isSilenced ? 0.065 : isSmg ? 0.055 : 0.1;
    ng.gain.setValueAtTime(this.gainVal(isHeavy ? 0.34 : isSilenced ? 0.11 : isSmg ? 0.14 : 0.22), t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(ng).connect(ctx.destination);
    src.start(t);
    src.stop(t + dur + 0.01);

    // Low punch thump
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = isHeavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isHeavy ? 185 : isSmg ? 280 : 230, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + dur);
    og.gain.setValueAtTime(this.gainVal(isHeavy ? 0.3 : 0.15), t);
    og.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(og).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  public playReload(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.13].forEach((off, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(idx === 0 ? 920 : 1340, t + off);
      osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 480 : 760, t + off + 0.04);
      g.gain.setValueAtTime(this.gainVal(0.14), t + off);
      g.gain.exponentialRampToValueAtTime(0.001, t + off + 0.045);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + off);
      osc.stop(t + off + 0.05);
    });
  }

  public playJetpackPulse(): void {
    const now = performance.now();
    if (now - this.lastJetSfxAt < 110) return;
    this.lastJetSfxAt = now;
    const ctx = this.ensureCtx();
    if (!ctx || !this.noiseBuf) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(340, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gainVal(0.08), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.13);
  }

  public playMelee(): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.noiseBuf) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(1400, t);
    flt.frequency.exponentialRampToValueAtTime(320, t + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gainVal(0.22), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.13);
  }

  public playHeadshotDing(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1880, t);
    osc.frequency.exponentialRampToValueAtTime(2460, t + 0.12);
    g.gain.setValueAtTime(this.gainVal(0.24), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playShieldBlock(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1420, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.06);
    g.gain.setValueAtTime(this.gainVal(0.2), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.075);
  }

  public playRicochet(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1950, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.11);
    g.gain.setValueAtTime(this.gainVal(0.18), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playGrenadeBounce(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);
    g.gain.setValueAtTime(this.gainVal(0.14), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playExplosion(): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.noiseBuf) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(620, t);
    flt.frequency.exponentialRampToValueAtTime(75, t + 0.45);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gainVal(0.45), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.5);

    const sub = ctx.createOscillator();
    const sg = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(28, t + 0.4);
    sg.gain.setValueAtTime(this.gainVal(0.36), t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    sub.connect(sg).connect(ctx.destination);
    sub.start(t);
    sub.stop(t + 0.44);
  }

  public playGasHiss(): void {
    const ctx = this.ensureCtx();
    if (!ctx || !this.noiseBuf) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'highpass';
    flt.frequency.setValueAtTime(2200, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(this.gainVal(0.18), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.46);
  }

  public playEmpZap(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1240, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.35);
    g.gain.setValueAtTime(this.gainVal(0.3), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.37);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playKillstreakChime(multiLevel = 1): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = multiLevel >= 3 ? [523, 659, 784, 1046] : multiLevel === 2 ? [523, 659, 784] : [587, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      g.gain.setValueAtTime(this.gainVal(0.22, true), t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.16);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.17);
    });
  }

  public playKillstreak(): void {
    this.playKillstreakChime(2);
  }

  public playPickup(): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.setValueAtTime(990, t + 0.06);
    g.gain.setValueAtTime(this.gainVal(0.18), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export const mmAudio = new MiniMilitiaAudioEngine();
