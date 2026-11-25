import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { BaseGame } from '../../core/BaseGame';

interface PipePair {
  x: number;
  top: number;
  gap: number;
  scored: boolean;
}

interface FlappyCoin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
}

export class FlappyBird extends BaseGame {
  bird = { x: 80, y: 200, r: 16, vy: 0 };
  gravity = 0.45;
  flapForce = -7.5;
  pipes: PipePair[] = [];
  coins: FlappyCoin[] = [];
  spawnTimer = -60;

  init(): void {
    const bx = Math.round(Math.max(48, Math.min(110, this.width * 0.18)));
    const hScale = Math.max(0.75, Math.min(1.1, this.height / 700));
    this.bird = { x: bx, y: this.height / 2, r: 16, vy: 0 };
    this.gravity = 0.45 * hScale;
    this.flapForce = -7.5 * Math.sqrt(hScale);
    this.pipes = [];
    this.coins = [];
    this.maxLives = 1;
    this.lives = 1;
    this.spawnTimer = -60;
  }

  resize(): void {
    super.resize();
    const hScale = Math.max(0.75, Math.min(1.1, this.height / 700));
    this.gravity = 0.45 * hScale;
    this.flapForce = -7.5 * Math.sqrt(hScale);
    if (this.bird) {
      this.bird.x = Math.round(Math.max(48, Math.min(110, this.width * 0.18)));
      this.bird.y = Math.max(24, Math.min(this.height - 24, this.bird.y));
    }
  }

  update(dt: number): void {
    if (this.gameOver) return;
    const deltaMult = dt * 60;
    this.bird.y += (this.bird.vy + 0.5 * this.gravity * deltaMult) * deltaMult;
    this.bird.vy += this.gravity * deltaMult;
    const speedScale = Math.max(0.82, Math.min(1.25, this.width / 460));
    const pipeSpeed = (3.2 + this.level * 0.25) * this.scaler.speedMult * speedScale * deltaMult;
    this.spawnTimer += deltaMult;
    if (this.spawnTimer > 0 && Math.random() < 0.025 * this.scaler.spawnMult * deltaMult) {
      const gapSize = Math.max(
        105,
        Math.min(185, this.height * 0.28) - this.level * 2 - this.scaler.speedMult * 8
      );
      const minTop = Math.max(45, Math.round(this.height * 0.1));
      const maxTop = Math.max(
        minTop + 20,
        this.height - gapSize - Math.max(55, Math.round(this.height * 0.12))
      );
      const topHeight = minTop + Math.random() * (maxTop - minTop);
      this.pipes.push({ x: this.width + 50, top: topHeight, gap: gapSize, scored: false });
      if (Math.random() < 0.35) {
        this.coins.push({ x: this.width + 72, y: topHeight + gapSize / 2, r: 14, collected: false });
      }
      this.spawnTimer = -75;
    }
    for (const p of this.pipes) {
      p.x -= pipeSpeed;
      if (!p.scored && p.x < this.bird.x) {
        p.scored = true;
        this.score += 1;
        addXp(4);
        ArcadeAudio.play('hit');
        updateInGameHud(this.score, this.level, 1);
        this.spawnPopup(this.bird.x, this.bird.y - 22, '+1', '#84fab0');
      }
    }
    for (const c of this.coins) {
      c.x -= pipeSpeed;
      if (!c.collected && Math.hypot(c.x - this.bird.x, c.y - this.bird.y) < 24) {
        ArcadeAudio.play('coin');
        c.collected = true;
        addCoins(2);
        addXp(4);
        this.spawnParticles(c.x, c.y, '#ffd700', 8, 120);
        this.spawnPopup(c.x, c.y - 14, '+2🪙', '#ffd700');
      }
    }
    for (const p of this.pipes) {
      if (
        this.bird.x + 12 > p.x &&
        this.bird.x - 12 < p.x + 45 &&
        (this.bird.y - 12 < p.top || this.bird.y + 12 > p.top + p.gap)
      ) {
        ArcadeAudio.play('hurt');
        this.gameOverSequence();
        return;
      }
    }
    if (this.bird.y > this.height || this.bird.y < 0) {
      ArcadeAudio.play('hurt');
      this.gameOverSequence();
      return;
    }
    this.pipes = this.pipes.filter((p) => p.x > -60);
    this.coins = this.coins.filter((c) => c.x > -40 && !c.collected);
  }

  draw(): void {
    this.ctx.fillStyle = this.getDynamicSkyColor();
    this.ctx.fillRect(0, 0, this.width, this.height);
    const birdAngle = Math.max(-0.45, Math.min(0.65, this.bird.vy * 0.06));
    EmojiCache.draw(this.ctx, playerState.currentAvatar, this.bird.x, this.bird.y, 28, birdAngle);
    for (const c of this.coins) {
      if (!c.collected) EmojiCache.draw(this.ctx, '🪙', c.x, c.y, 22);
    }
    this.ctx.fillStyle = this.level >= 50 ? '#ffffff' : '#2ecc71';
    for (const p of this.pipes) {
      this.ctx.fillRect(p.x, 0, 45, p.top);
      this.ctx.fillRect(p.x - 3, Math.max(0, p.top - 14), 51, 14);
      this.ctx.fillRect(p.x, p.top + p.gap, 45, this.height - (p.top + p.gap));
      this.ctx.fillRect(p.x - 3, p.top + p.gap, 51, 14);
    }
  }

  flap(): void {
    if (this.gameOver || this.isPaused) return;
    this.bird.vy = this.flapForce;
    ArcadeAudio.play('flap');
    this.spawnParticles(this.bird.x - 10, this.bird.y + 8, 'rgba(255,255,255,0.75)', 4, 70);
  }
}
