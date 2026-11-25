import { EmojiCache } from './emojiCache';
import { playerState } from './storage';
import { Difficulty, DifficultyScaler, difficultyScalers, GameInstance } from './types';
import { ArcadeAudio } from './audio';
import { triggerGameOver, updateInGameHud } from './runtimeBridge';
import { getViewportSize } from './viewport';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface PopupText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export class BaseGame implements GameInstance {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  diff: Difficulty;
  level: number;
  gameIdx: number;
  width: number;
  height: number;
  isRunning = false;
  isPaused = false;
  score = 0;
  lives = 3;
  maxLives = 3;
  gameOver = false;
  survivalElapsed = 0;
  scaler: DifficultyScaler;
  animId: number | null = null;
  lastTime = 0;
  smoothDt = 1 / 60;
  particles: Particle[] = [];
  popups: PopupText[] = [];
  shakeTime = 0;
  shakeMag = 0;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    diff: Difficulty,
    lvl: number,
    gameIdx: number
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.diff = diff;
    this.level = lvl;
    this.gameIdx = gameIdx;
    const vp = typeof window !== 'undefined' ? getViewportSize() : { width: 800, height: 600 };
    this.width = vp.width;
    this.height = vp.height;
    this.scaler = difficultyScalers[diff] || difficultyScalers.easy;
    this.lastTime = performance.now();
    playerState.sessionCoins = 0;
    playerState.sessionExp = 0;
  }

  triggerShake(mag = 6, dur = 0.16): void {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeTime = Math.max(this.shakeTime, dur);
  }

  start(): void {
    this.resize();
    this.isRunning = true;
    this.lastTime = performance.now();
    const preload = [
      '🪙', '⭐', '🦋', '🐝', '🏎️', '🚗', '🚘', '🛻', '🚚', '🚌',
      '🎯', '🙋', '💀', '🧟', '🧟‍♂️', '🧟‍♀️', '👹', '🏃‍♀️', '🧰',
      '👩', '🧑', '🧑‍⚕️', '🦹', '🥷', '🤖', '☀️', '🌱', '🌰', '🍒',
      '🐷', '🍔', '🍕', '🌮', '🍣', '🐟', '🐠', '💣', '⛽', '🥗',
      '🍳', '🌯', '🍰', '🥪', '🪖', '🧨', '🏥', '🔫', '⚔️', '⛏️',
      '🗡️', '🏹', '🛡️', '🪄', '👑',
      playerState.currentAvatar
    ];
    preload.forEach((em) => EmojiCache.get(em, 28));
    this.init();
    this.loop(this.lastTime);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.shakeTime = 0;
    this.shakeMag = 0;
    this.particles = [];
    this.popups = [];
    this.releaseInputs();
  }

  releaseInputs(): void {}

  pause(): void {
    this.isPaused = true;
    this.releaseInputs();
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.smoothDt = 1 / 60;
    if (this.isRunning && !this.gameOver && this.animId === null) {
      this.animId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vp = getViewportSize();
    this.width = Math.max(240, vp.width);
    this.height = Math.max(240, vp.height);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.isPaused) this.draw();
  }

  spawnParticles(x: number, y: number, color: string, count = 8, speed = 160): void {
    const cap = Math.min(count, Math.max(0, 72 - this.particles.length));
    for (let i = 0; i < cap; i++) {
      const ang = (Math.PI * 2 * i) / Math.max(1, count) + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.45 + Math.random() * 0.75);
      const life = 0.45 + Math.random() * 0.25;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        r: 3 + Math.random() * 3.5,
        color,
        life,
        maxLife: life
      });
    }
  }

  spawnPopup(x: number, y: number, text: string, color = '#ffd700'): void {
    if (this.popups.length < 24) {
      this.popups.push({ x, y, text, color, life: 0.75, maxLife: 0.75 });
    }
  }

  updateEffects(dt: number): void {
    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
      }
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= 48 * dt;
      pop.life -= dt;
      if (pop.life <= 0) {
        this.popups[i] = this.popups[this.popups.length - 1];
        this.popups.pop();
      }
    }
  }

  drawEffects(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
    if (this.popups.length > 0) {
      this.ctx.font = '800 15px system-ui, sans-serif';
      this.ctx.textAlign = 'center';
      for (let i = 0; i < this.popups.length; i++) {
        const pop = this.popups[i];
        this.ctx.globalAlpha = Math.max(0, Math.min(1, (pop.life / pop.maxLife) * 1.4));
        this.ctx.fillStyle = pop.color;
        this.ctx.fillText(pop.text, pop.x, pop.y);
      }
      this.ctx.globalAlpha = 1;
      this.ctx.textAlign = 'left';
    }
  }

  loop(time: number): void {
    if (!this.isRunning || this.isPaused || this.gameOver) {
      this.animId = null;
      return;
    }
    const elapsedMs = time - this.lastTime;
    if (elapsedMs > 250) {
      this.smoothDt = 1 / 60;
    }
    const rawDt = Math.min(Math.max(elapsedMs / 1000, 0.001), 0.05);
    this.lastTime = time;
    this.smoothDt = this.smoothDt * 0.75 + rawDt * 0.25;
    this.survivalElapsed += this.smoothDt;
    if (this.survivalElapsed >= 10) {
      this.survivalElapsed -= 10;
      this.level++;
      ArcadeAudio.play('levelup');
      updateInGameHud(this.score, this.level, this.gameIdx);
    }
    this.update(this.smoothDt);
    if (!this.isRunning || this.gameOver || this.isPaused) {
      this.animId = null;
      return;
    }
    this.updateEffects(this.smoothDt);
    const shaking = this.shakeTime > 0;
    if (shaking) {
      const s = this.shakeMag * (this.shakeTime / 0.18);
      this.ctx.save();
      this.ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }
    this.draw();
    this.drawEffects();
    if (shaking) this.ctx.restore();
    if (this.isRunning && !this.gameOver && !this.isPaused) {
      this.animId = requestAnimationFrame((t) => this.loop(t));
    } else {
      this.animId = null;
    }
  }

  init(): void {}
  update(_dt: number): void {}
  draw(): void {}

  gameOverSequence(isVictory = false): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.stop();
    triggerGameOver(this.score, playerState.sessionCoins, this.level, this.gameIdx, isVictory);
  }

  getDynamicSkyColor(): string {
    if (this.level >= 50) return '#000000';
    if (this.level >= 30) return '#0d0d2b';
    if (this.level >= 20) return '#2b1055';
    if (this.level >= 10) return '#b33939';
    return '#87ceeb';
  }
}
