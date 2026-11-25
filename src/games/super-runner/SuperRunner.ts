import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { BaseGame } from '../../core/BaseGame';

interface RunnerObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'standard' | 'flying' | 'small';
  label: string;
  passed: boolean;
}

interface RunnerCoin {
  x: number;
  y: number;
  r: number;
  label: string;
  val: number;
  kind: 'coin' | 'star' | 'magnet' | 'shield';
  collected: boolean;
}

export class SuperRunner extends BaseGame {
  groundY = 0;
  player = { x: 60, y: 0, w: 32, h: 42, vy: 0, jumping: false, jumpsUsed: 0 };
  gravity = 0.65;
  jumpForce = -13.5;
  obstacles: RunnerObstacle[] = [];
  coins: RunnerCoin[] = [];
  obstacleTimer = 0;
  coinTimer = 0;
  minObstacleGap = 200;
  groundScroll = 0;
  magnetTimer = 0;
  shieldActive = false;
  streak = 0;

  calcGroundY(): number {
    return Math.round(this.height - Math.min(180, Math.max(76, this.height * 0.24)));
  }

  init(): void {
    this.groundY = this.calcGroundY();
    const px = Math.round(Math.max(36, Math.min(100, this.width * 0.14)));
    this.player = { x: px, y: this.groundY - 42, w: 32, h: 42, vy: 0, jumping: false, jumpsUsed: 0 };
    const hScale = Math.max(0.76, Math.min(1.1, this.height / 700));
    this.gravity = 0.65 * hScale;
    this.jumpForce = -13.5 * Math.sqrt(hScale);
    this.obstacles = [];
    this.coins = [];
    this.obstacleTimer = 0;
    this.coinTimer = 0;
    this.minObstacleGap = Math.max(170, Math.min(260, this.width * 0.34));
    this.groundScroll = 0;
    this.magnetTimer = 0;
    this.shieldActive = false;
    this.streak = 0;
  }

  resize(): void {
    super.resize();
    this.groundY = this.calcGroundY();
    this.minObstacleGap = Math.max(170, Math.min(260, this.width * 0.34));
    if (this.player) {
      this.player.x = Math.round(Math.max(36, Math.min(100, this.width * 0.14)));
      if (!this.player.jumping) this.player.y = this.groundY - this.player.h;
    }
  }

  update(dt: number): void {
    if (this.gameOver) return;
    const deltaMult = dt * 60;
    if (this.magnetTimer > 0) this.magnetTimer = Math.max(0, this.magnetTimer - dt);

    this.player.y += (this.player.vy + 0.5 * this.gravity * deltaMult) * deltaMult;
    this.player.vy += this.gravity * deltaMult;
    if (this.player.y >= this.groundY - this.player.h) {
      if (this.player.jumping) {
        this.spawnParticles(this.player.x + 16, this.groundY - 2, 'rgba(255,255,255,0.65)', 5, 80);
      }
      this.player.y = this.groundY - this.player.h;
      this.player.vy = 0;
      this.player.jumping = false;
      this.player.jumpsUsed = 0;
    }

    const speedScale = Math.max(0.82, Math.min(1.25, this.width / 460));
    const currentSpeed = (6.4 + this.level * 0.45) * this.scaler.speedMult * speedScale * deltaMult;
    this.groundScroll = (this.groundScroll + currentSpeed) % 48;
    this.obstacleTimer += deltaMult;
    this.coinTimer += deltaMult;

    if (this.coinTimer > 95 && Math.random() < 0.03 * deltaMult) {
      this.coinTimer = 0;
      const roll = Math.random();
      let kind: RunnerCoin['kind'] = 'coin';
      let label = '🪙';
      let val = 1;
      if (roll < 0.12) {
        kind = 'magnet';
        label = '🧲';
        val = 3;
      } else if (roll < 0.22 && !this.shieldActive) {
        kind = 'shield';
        label = '🛡️';
        val = 3;
      } else if (roll < 0.38) {
        kind = 'star';
        label = '⭐';
        val = 5;
      }
      const floatH = Math.min(this.groundY - 36, kind === 'coin' ? 45 + Math.random() * 40 : Math.min(108, this.height * 0.18));
      this.coins.push({
        x: this.width + 30,
        y: this.groundY - floatH,
        r: 13,
        label,
        val,
        kind,
        collected: false
      });
    }

    const lastObs = this.obstacles[this.obstacles.length - 1];
    const distFromLast = lastObs ? this.width - lastObs.x : 999;
    if (
      this.obstacleTimer > 55 / this.scaler.spawnMult &&
      distFromLast >= this.minObstacleGap &&
      Math.random() < 0.09 * deltaMult
    ) {
      const randType = Math.random();
      let type: RunnerObstacle['type'] = 'standard';
      let obsW = 22;
      let obsH = 30;
      let obsY = this.groundY - 30;
      let label = '🧱';
      if (this.level >= 2 && randType < 0.35) {
        type = 'flying';
        obsW = 28;
        obsH = 22;
        obsY = this.groundY - Math.min(76, Math.round(this.height * 0.14));
        label = '🦇';
      } else if (randType > 0.7) {
        type = 'small';
        obsW = 16;
        obsH = 16;
        obsY = this.groundY - 16;
        label = '🪨';
      }
      this.obstacles.push({ x: this.width, y: obsY, w: obsW, h: obsH, type, label, passed: false });
      this.obstacleTimer = 0;
    }

    for (const o of this.obstacles) {
      o.x -= currentSpeed;
      if (!o.passed && o.x + o.w < this.player.x) {
        o.passed = true;
        this.streak++;
        const bonus = this.streak >= 5 ? 15 : 10;
        this.score += bonus;
        updateInGameHud(this.score, this.level, 0);
        this.spawnPopup(
          this.player.x + 16,
          this.player.y - 10,
          this.streak >= 5 ? `+${bonus} 🔥` : `+${bonus}`,
          this.streak >= 5 ? '#facc15' : '#84fab0'
        );
      }
    }

    const pcx = this.player.x + 16;
    const pcy = this.player.y + 21;
    for (const c of this.coins) {
      if (this.magnetTimer > 0 && c.kind === 'coin') {
        const dx = pcx - c.x;
        const dy = pcy - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 220 && d > 1) {
          c.x += (dx / d) * 340 * dt;
          c.y += (dy / d) * 340 * dt;
        } else {
          c.x -= currentSpeed;
        }
      } else {
        c.x -= currentSpeed;
      }

      if (!c.collected && Math.hypot(c.x - pcx, c.y - pcy) < 26) {
        c.collected = true;
        if (c.kind === 'magnet') {
          this.magnetTimer = 8;
          ArcadeAudio.play('levelup');
          this.spawnPopup(c.x, c.y - 14, '🧲 MAGNET 8s!', '#38bdf8');
        } else if (c.kind === 'shield') {
          this.shieldActive = true;
          ArcadeAudio.play('levelup');
          this.spawnPopup(c.x, c.y - 14, '🛡️ SHIELD!', '#84fab0');
        } else {
          ArcadeAudio.play('coin');
          this.spawnPopup(c.x, c.y - 12, `+${c.val}🪙`, '#ffd700');
        }
        addCoins(c.val);
        addXp(2 * c.val);
        this.score += c.val * 4;
        updateInGameHud(this.score, this.level, 0);
        this.spawnParticles(c.x, c.y, '#ffd700', 8, 130);
      }
    }

    for (const o of this.obstacles) {
      if (
        !o.passed &&
        this.player.x < o.x + o.w &&
        this.player.x + this.player.w > o.x &&
        this.player.y < o.y + o.h &&
        this.player.y + this.player.h > o.y
      ) {
        o.passed = true;
        o.x = -200;
        if (this.shieldActive) {
          this.shieldActive = false;
          ArcadeAudio.play('break');
          this.triggerShake(5, 0.12);
          this.spawnParticles(pcx, pcy, '#84fab0', 12, 160);
          this.spawnPopup(pcx, this.player.y - 16, '🛡️ SAVED!', '#84fab0');
          continue;
        }
        this.streak = 0;
        this.lives--;
        ArcadeAudio.play('hurt');
        this.triggerShake(7, 0.16);
        this.spawnParticles(pcx, pcy, '#ff6b6b', 10, 160);
        updateHealthDisplay(this.lives, this.maxLives);
        if (this.lives <= 0) {
          this.gameOverSequence();
          return;
        }
      }
    }
    this.obstacles = this.obstacles.filter((o) => o.x > -60);
    this.coins = this.coins.filter((c) => c.x > -40 && !c.collected);
  }

  draw(): void {
    this.ctx.fillStyle = this.level >= 50 ? '#000000' : this.getDynamicSkyColor();
    this.ctx.fillRect(0, 0, this.width, this.groundY);
    if (this.level >= 50) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    } else {
      this.ctx.fillStyle = '#228B22';
      this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
      this.ctx.fillStyle = 'rgba(255,255,255,0.22)';
      for (let gx = -this.groundScroll; gx < this.width; gx += 48) {
        this.ctx.fillRect(gx, this.groundY + 6, 22, 4);
      }
    }
    const jumpTilt = this.player.jumping ? Math.max(-0.22, Math.min(0.22, this.player.vy * 0.015)) : 0;
    if (this.shieldActive) {
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x + 16, this.player.y + 21, 24, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    EmojiCache.draw(this.ctx, playerState.currentAvatar, this.player.x + 16, this.player.y + 21, 32, jumpTilt);
    for (const c of this.coins) {
      if (!c.collected) EmojiCache.draw(this.ctx, c.label, c.x, c.y, 24);
    }
    for (const o of this.obstacles) {
      if (this.level >= 50) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(o.x, o.y, o.w, o.h);
        this.ctx.strokeStyle = '#000000';
        this.ctx.strokeRect(o.x, o.y, o.w, o.h);
      } else if (o.type === 'flying') {
        EmojiCache.draw(this.ctx, o.label, o.x + o.w / 2, o.y + o.h / 2, 24);
      } else if (o.type === 'small') {
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(o.x, o.y, o.w, o.h);
      } else {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(o.x, o.y, o.w, o.h);
      }
    }

    // Crisp on-canvas lives & active powerups badge
    const badgeY = this.width < 460 ? 52 : 12;
    this.ctx.fillStyle = 'rgba(10,16,24,0.72)';
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 12px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    const hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
    const buff = this.magnetTimer > 0 ? ` 🧲${Math.ceil(this.magnetTimer)}s` : this.shieldActive ? ' 🛡️' : '';
    this.ctx.fillText(`${hearts}${buff}`, this.width / 2, badgeY + 18);
    this.ctx.textAlign = 'left';
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.player.jumpsUsed < 2) {
      this.player.vy = this.jumpForce * (this.player.jumpsUsed === 1 ? 0.92 : 1);
      this.player.jumping = true;
      this.player.jumpsUsed++;
      ArcadeAudio.play('jump');
      this.spawnParticles(this.player.x + 16, this.player.y + this.player.h, 'rgba(255,255,255,0.7)', 6, 95);
    }
  }
}
