import { MlbbSettingsState } from '../types';

export type MlbbSkillSfxKind =
  | 'slash'
  | 'magic'
  | 'laser'
  | 'blink'
  | 'freeze'
  | 'heal'
  | 'explosion';

export type MlbbAnnouncerStreak =
  | 'first_blood'
  | 'double'
  | 'triple'
  | 'maniac'
  | 'savage'
  | 'unstoppable'
  | 'godlike'
  | 'legendary'
  | 'shutdown'
  | 'wiped_out'
  | 'victory'
  | 'defeat';

const ANNOUNCER_PHRASES: Record<MlbbAnnouncerStreak, string> = {
  first_blood: 'First Blood!',
  double: 'Double Kill!',
  triple: 'Triple Kill!',
  maniac: 'Maniac!',
  savage: 'Savage!',
  unstoppable: 'Unstoppable!',
  godlike: 'Godlike!',
  legendary: 'Legendary!',
  shutdown: 'Shut Down!',
  wiped_out: 'Wiped Out!',
  victory: 'Victory!',
  defeat: 'Defeat!'
};

export class MlbbAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain = 0.8;
  private sfxGain = 0.85;
  private bgmGain = 0.4;
  private voiceGain = 0.85;
  private killAnnouncer = true;
  private bgmBus: GainNode | null = null;
  private bgmOscs: OscillatorNode[] = [];
  private bgmTimer: number | null = null;
  private bgmActive = false;

  public setVolumes(sound: MlbbSettingsState['sound']): void {
    this.masterGain = Math.max(0, Math.min(1, sound.master / 100));
    this.sfxGain = Math.max(0, Math.min(1, sound.sfx / 100));
    this.bgmGain = Math.max(0, Math.min(1, sound.bgm / 100));
    this.voiceGain = Math.max(0, Math.min(1, sound.voice / 100));
    this.killAnnouncer = sound.killAnnouncer;
    if (this.bgmBus && this.ctx) {
      const target = Math.max(0.0001, this.masterGain * this.bgmGain * 0.065);
      try {
        this.bgmBus.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
      } catch {
        // Ignore timing errors on suspended context
      }
    }
  }

  public startLobbyBgm(): void {
    if (this.bgmActive) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state === 'suspended') return;
    const gainVal = this.masterGain * this.bgmGain * 0.065;
    if (gainVal <= 0.001) return;

    this.bgmActive = true;
    const bus = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, ctx.currentTime);
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + 1.4);
    filter.connect(bus);
    bus.connect(ctx.destination);
    this.bgmBus = bus;

    // Warm celestial royal D-minor / F-major sanctuary pad drone
    const freqs = [146.83, 220.0, 293.66];
    this.bgmOscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(idx === 0 ? 0.55 : idx === 1 ? 0.28 : 0.17, ctx.currentTime);
      osc.connect(subGain);
      subGain.connect(filter);
      osc.start();
      return osc;
    });

    // Gentle heroic arpeggio chime every 3.6s
    const arp = [293.66, 349.23, 440.0, 523.25, 440.0, 392.0];
    let step = 0;
    this.bgmTimer = window.setInterval(() => {
      if (!this.bgmActive || !this.ctx || this.ctx.state !== 'running') return;
      const note = arp[step % arp.length];
      step += 1;
      this.tone(note, note * 1.003, 1.3, 'sine', 0.045, 'bgm', 0);
    }, 3600);
  }

  public stopLobbyBgm(): void {
    this.bgmActive = false;
    if (this.bgmTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.bgmTimer);
    }
    this.bgmTimer = null;
    const bus = this.bgmBus;
    const oscs = this.bgmOscs;
    this.bgmBus = null;
    this.bgmOscs = [];
    if (bus && this.ctx) {
      try {
        bus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.08);
      } catch {
        // Ignore
      }
    }
    if (typeof window === 'undefined') return;
    window.setTimeout(() => {
      oscs.forEach((o) => {
        try {
          o.stop();
          o.disconnect();
        } catch {
          // Ignore
        }
      });
      try {
        bus?.disconnect();
      } catch {
        // Ignore
      }
    }, 260);
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    vol: number,
    channel: 'sfx' | 'voice' | 'bgm' = 'sfx',
    delay = 0
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const chanVol = channel === 'sfx' ? this.sfxGain : channel === 'voice' ? this.voiceGain : this.bgmGain;
    const gainVal = this.masterGain * chanVol * vol;
    if (gainVal <= 0.002) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, freq), now);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + Math.min(0.015, duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private noiseBurst(duration: number, vol: number, delay = 0, highpass = 600): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gainVal = this.masterGain * this.sfxGain * vol;
    if (gainVal <= 0.002) return;

    const sampleCount = Math.max(128, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleCount * 0.35));
    }

    const now = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(highpass, now);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // ==================== UI SFX ====================

  public playClick(): void {
    // Metallic gold button click
    this.tone(760, 1080, 0.048, 'triangle', 0.11);
    this.tone(1520, 1980, 0.032, 'sine', 0.05, 'sfx', 0.008);
  }

  public playSwoosh(): void {
    this.noiseBurst(0.11, 0.06, 0, 950);
    this.tone(360, 740, 0.1, 'sine', 0.07);
  }

  public playModalOpen(): void {
    this.tone(523.25, 783.99, 0.11, 'sine', 0.09, 'sfx', 0);
    this.tone(783.99, 1046.5, 0.15, 'triangle', 0.08, 'sfx', 0.05);
  }

  public playPurchase(): void {
    this.tone(1318.5, 1760, 0.07, 'sine', 0.13, 'sfx', 0);
    this.tone(1760, 2349.3, 0.11, 'triangle', 0.12, 'sfx', 0.055);
    this.tone(2637, 2637, 0.09, 'sine', 0.08, 'sfx', 0.11);
  }

  public playClaimFanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, n * 1.01, 0.16, 'triangle', 0.13, 'sfx', i * 0.065);
    });
  }

  // ==================== MATCHMAKING & DRAFT SFX ====================

  public playMatchFoundGong(): void {
    // Pulsing heartbeat low gong + golden shimmer
    this.tone(110, 68, 0.42, 'sawtooth', 0.18, 'sfx', 0);
    this.tone(220, 146.8, 0.36, 'triangle', 0.16, 'sfx', 0.03);
    this.tone(440, 659.25, 0.28, 'sine', 0.11, 'sfx', 0.12);
    this.tone(120, 76, 0.24, 'triangle', 0.14, 'sfx', 0.34);
  }

  public playPlayerReady(): void {
    this.tone(880, 1318.5, 0.08, 'sine', 0.11, 'sfx', 0);
    this.tone(1318.5, 1760, 0.1, 'triangle', 0.08, 'sfx', 0.045);
  }

  public playBanSlam(): void {
    // Heavy war drum + iron clang
    this.tone(150, 48, 0.26, 'sawtooth', 0.2, 'sfx', 0);
    this.tone(92, 42, 0.3, 'triangle', 0.2, 'sfx', 0.02);
    this.noiseBurst(0.14, 0.12, 0, 320);
  }

  public playHeroLockIn(): void {
    // Heroic brass chord (D major triad + octave)
    this.tone(293.66, 293.66, 0.34, 'sawtooth', 0.11, 'sfx', 0);
    this.tone(369.99, 369.99, 0.34, 'sawtooth', 0.09, 'sfx', 0.02);
    this.tone(440, 440, 0.36, 'triangle', 0.12, 'sfx', 0.03);
    this.tone(587.33, 620, 0.38, 'sine', 0.14, 'sfx', 0.06);
  }

  public playCountdownTick(urgent = false): void {
    if (urgent) {
      this.tone(980, 1240, 0.065, 'square', 0.11, 'sfx', 0);
    } else {
      this.tone(680, 740, 0.05, 'triangle', 0.08, 'sfx', 0);
    }
  }

  // ==================== BATTLEFIELD & SKILL CAST SFX ====================

  public playAttack(isRanged: boolean, isCrit: boolean): void {
    if (isCrit) {
      this.tone(540, 1280, 0.09, 'sawtooth', 0.16);
      this.tone(240, 110, 0.1, 'triangle', 0.14);
      return;
    }
    if (isRanged) {
      this.tone(860, 420, 0.065, 'sine', 0.1);
    } else {
      this.tone(260, 110, 0.075, 'sawtooth', 0.12);
    }
  }

  public playSkillKind(kind: MlbbSkillSfxKind): void {
    switch (kind) {
      case 'slash':
        this.noiseBurst(0.1, 0.1, 0, 1200);
        this.tone(420, 150, 0.11, 'sawtooth', 0.14);
        break;
      case 'magic':
        this.tone(540, 1040, 0.15, 'sine', 0.14);
        this.tone(810, 1380, 0.13, 'triangle', 0.1, 'sfx', 0.03);
        break;
      case 'laser':
        this.tone(1120, 480, 0.22, 'sawtooth', 0.14);
        this.tone(1680, 740, 0.18, 'square', 0.08, 'sfx', 0.02);
        break;
      case 'blink':
        this.tone(380, 1420, 0.09, 'sine', 0.13);
        this.noiseBurst(0.08, 0.08, 0.01, 1800);
        break;
      case 'freeze':
        this.tone(1560, 2240, 0.14, 'triangle', 0.12);
        this.tone(1180, 1980, 0.18, 'sine', 0.1, 'sfx', 0.04);
        break;
      case 'heal':
        this.tone(523.25, 659.25, 0.14, 'sine', 0.12, 'sfx', 0);
        this.tone(659.25, 987.77, 0.18, 'triangle', 0.11, 'sfx', 0.07);
        break;
      case 'explosion':
        this.tone(180, 45, 0.28, 'sawtooth', 0.18);
        this.noiseBurst(0.24, 0.15, 0, 240);
        break;
    }
  }

  public playSkill(slot: 1 | 2 | 3, damageType: 'physical' | 'magic' | 'true'): void {
    if (slot === 3) {
      this.tone(220, 680, 0.24, 'sawtooth', 0.18);
      this.tone(440, 880, 0.22, 'triangle', 0.14, 'sfx', 0.04);
      return;
    }
    if (damageType === 'magic') {
      this.playSkillKind('magic');
    } else if (damageType === 'true') {
      this.playSkillKind('laser');
    } else {
      this.playSkillKind('slash');
    }
  }

  public playGold(): void {
    this.tone(1180, 1560, 0.07, 'sine', 0.12);
    this.tone(1560, 2040, 0.09, 'triangle', 0.1, 'sfx', 0.05);
  }

  public playTurret(): void {
    this.tone(180, 82, 0.22, 'sawtooth', 0.16);
    this.tone(520, 240, 0.16, 'triangle', 0.11);
  }

  public playLevelUp(): void {
    this.tone(523, 659, 0.12, 'triangle', 0.14, 'sfx', 0);
    this.tone(659, 784, 0.12, 'triangle', 0.14, 'sfx', 0.08);
    this.tone(784, 1046, 0.2, 'sine', 0.16, 'sfx', 0.16);
  }

  public playEmote(sfx: 'chime' | 'horn' | 'spark' | 'laugh'): void {
    if (sfx === 'chime') {
      this.tone(880, 1320, 0.12, 'sine', 0.15, 'voice', 0);
      this.tone(1320, 1760, 0.16, 'triangle', 0.13, 'voice', 0.08);
    } else if (sfx === 'horn') {
      this.tone(240, 320, 0.18, 'sawtooth', 0.14, 'voice', 0);
      this.tone(320, 480, 0.24, 'sawtooth', 0.14, 'voice', 0.12);
    } else if (sfx === 'spark') {
      this.tone(660, 1480, 0.1, 'triangle', 0.15, 'voice', 0);
      this.tone(1040, 1920, 0.12, 'sine', 0.12, 'voice', 0.06);
    } else {
      this.tone(580, 460, 0.07, 'triangle', 0.13, 'voice', 0);
      this.tone(620, 490, 0.07, 'triangle', 0.13, 'voice', 0.09);
      this.tone(680, 520, 0.09, 'triangle', 0.13, 'voice', 0.18);
    }
  }

  // ==================== KILL STREAK ANNOUNCER & PINGS ====================

  public playAnnouncer(intensity: 'normal' | 'kill' | 'epic'): void {
    if (!this.killAnnouncer) return;
    if (intensity === 'epic') {
      this.tone(293.66, 440, 0.18, 'sawtooth', 0.15, 'voice', 0);
      this.tone(440, 587.33, 0.24, 'triangle', 0.16, 'voice', 0.12);
      this.tone(587.33, 880, 0.34, 'sine', 0.18, 'voice', 0.24);
    } else if (intensity === 'kill') {
      this.tone(330, 523.25, 0.16, 'triangle', 0.15, 'voice', 0);
      this.tone(523.25, 659.25, 0.22, 'sine', 0.15, 'voice', 0.1);
    } else {
      this.tone(440, 660, 0.14, 'triangle', 0.12, 'voice', 0);
    }
  }

  public playKillStreakAnnouncer(streak: MlbbAnnouncerStreak): void {
    if (!this.killAnnouncer) return;
    const isEpic =
      streak === 'maniac' ||
      streak === 'savage' ||
      streak === 'legendary' ||
      streak === 'godlike' ||
      streak === 'wiped_out';
    if (streak === 'victory' || streak === 'defeat') {
      this.playFanfare(streak === 'victory');
    } else {
      this.playAnnouncer(isEpic ? 'epic' : streak === 'shutdown' ? 'normal' : 'kill');
    }
    // Optional browser speech synthesis for crisp offline voice callouts
    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      this.masterGain * this.voiceGain > 0.05
    ) {
      try {
        const phrase = ANNOUNCER_PHRASES[streak];
        const utter = new SpeechSynthesisUtterance(phrase);
        utter.volume = Math.min(1, this.masterGain * this.voiceGain);
        utter.rate = streak === 'savage' || streak === 'legendary' ? 0.95 : 1.05;
        utter.pitch = streak === 'defeat' ? 0.78 : 0.92;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {
        // Ignore browser speech restrictions
      }
    }
  }

  public playPing(kind: 'attack' | 'retreat' | 'gather' | 'missing' | 'omw' | 'status'): void {
    if (kind === 'attack') {
      // Sword clash
      this.noiseBurst(0.08, 0.09, 0, 1800);
      this.tone(880, 660, 0.1, 'sawtooth', 0.14, 'voice', 0);
      this.tone(1100, 880, 0.12, 'triangle', 0.14, 'voice', 0.08);
    } else if (kind === 'retreat') {
      // Shield bell
      this.tone(620, 420, 0.11, 'square', 0.13, 'voice', 0);
      this.tone(520, 340, 0.13, 'square', 0.13, 'voice', 0.09);
    } else if (kind === 'gather') {
      // Rally horn
      this.tone(329.63, 440, 0.14, 'sawtooth', 0.13, 'voice', 0);
      this.tone(440, 659.25, 0.2, 'triangle', 0.14, 'voice', 0.09);
    } else if (kind === 'omw') {
      // Cyan ping
      this.tone(523.25, 783.99, 0.11, 'sine', 0.13, 'voice', 0);
      this.tone(783.99, 1046.5, 0.14, 'triangle', 0.14, 'voice', 0.07);
    } else if (kind === 'missing') {
      this.tone(740, 980, 0.09, 'triangle', 0.13, 'voice', 0);
      this.tone(740, 980, 0.09, 'triangle', 0.12, 'voice', 0.11);
    } else {
      this.tone(660, 990, 0.11, 'sine', 0.13, 'voice', 0);
      this.tone(990, 1320, 0.12, 'triangle', 0.11, 'voice', 0.07);
    }
  }

  public playTurretLockBeep(): void {
    this.tone(980, 1180, 0.075, 'square', 0.12, 'sfx', 0);
    this.tone(1180, 980, 0.075, 'square', 0.1, 'sfx', 0.085);
  }

  public playEyeSpot(): void {
    this.tone(680, 1020, 0.08, 'sine', 0.08, 'sfx', 0);
  }

  public playShieldShatter(): void {
    this.noiseBurst(0.24, 0.14, 0, 1600);
    this.tone(1320, 440, 0.28, 'triangle', 0.14, 'sfx', 0);
    this.tone(1760, 880, 0.24, 'sine', 0.11, 'sfx', 0.05);
  }

  public playCrystalShatter(): void {
    this.noiseBurst(0.55, 0.2, 0, 420);
    this.tone(220, 48, 0.72, 'sawtooth', 0.22, 'sfx', 0);
    this.tone(880, 260, 0.55, 'triangle', 0.16, 'sfx', 0.04);
    this.tone(1560, 520, 0.48, 'sine', 0.13, 'sfx', 0.12);
  }

  public playShrineHeal(): void {
    this.tone(523.25, 783.99, 0.15, 'sine', 0.12, 'sfx', 0);
    this.tone(783.99, 1046.5, 0.22, 'triangle', 0.11, 'sfx', 0.08);
  }

  public playFanfare(victory: boolean): void {
    const notes = victory ? [523.25, 659.25, 783.99, 1046.5] : [392, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      this.tone(n, n, 0.26, victory ? 'triangle' : 'sawtooth', 0.15, 'bgm', idx * 0.14);
    });
  }
}

export const mlbbAudio = new MlbbAudioEngine();
