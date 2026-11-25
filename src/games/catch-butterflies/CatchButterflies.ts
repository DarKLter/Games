import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface ButterflyTarget {
  x: number;
  y: number;
  baseY: number;
  phase: number;
  vx: number;
  r: number;
  caught: boolean;
  escaped: boolean;
  isGold: boolean;
}

interface BeeHazard {
  x: number;
  y: number;
  vx: number;
  r: number;
}

export class CatchButterflies extends BaseGame {
  butterflies: ButterflyTarget[] = [];
  bees: BeeHazard[] = [];
  animClock = 0;
  streak = 0;

  init(): void {
    this.butterflies = [];
    this.bees = [];
    this.maxLives = 3;
    this.lives = 3;
    this.animClock = 0;
    this.streak = 0;
  }

  update(dt: number): void {
    if (this.gameOver) return;
    const deltaMult = dt * 60;
    this.animClock += dt;
    const speedScale = Math.max(0.85, Math.min(1.4, this.width / 480));
    const flySpeed = (1.5 + this.level * 0.25) * this.scaler.speedMult * speedScale * deltaMult;
    const minY = this.width < 460 ? 86 : 64;
    const maxY = Math.max(minY + 40, this.height - 84);
    if (Math.random() < 0.03 * this.scaler.spawnMult * deltaMult) {
      const isGold = Math.random() < 0.16;
      const startY = minY + Math.random() * (maxY - minY);
      this.butterflies.push({
        x: -30,
        y: startY,
        baseY: startY,
        phase: Math.random() * Math.PI * 2,
        vx: flySpeed + Math.random(),
        r: 20,
        caught: false,
        escaped: false,
        isGold
      });
    }
    if (Math.random() < (0.01 + this.level * 0.002) * this.scaler.spawnMult * deltaMult) {
      this.bees.push({
        x: -30,
        y: minY + Math.random() * (maxY - minY),
        vx: flySpeed + 0.5,
        r: 16
      });
    }
    for (const b of this.butterflies) {
      b.x += b.vx;
      b.y = b.baseY + Math.sin(this.animClock * 4.5 + b.phase) * 14;
      if (!b.escaped && !b.caught && b.x > this.width + 20) {
        b.escaped = true;
        if (!b.isGold) {
          this.streak = 0;
          this.lives--;
          ArcadeAudio.play('hurt');
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) {
            this.gameOverSequence();
            return;
          }
        }
      }
    }
    for (const bee of this.bees) bee.x += bee.vx;
    this.butterflies = this.butterflies.filter((b) => b.x < this.width + 50 && !b.caught);
    this.bees = this.bees.filter((b) => b.x < this.width + 50);
  }

  draw(): void {
    if (this.level >= 50) this.ctx.fillStyle = '#000000';
    else if (this.level >= 30) this.ctx.fillStyle = '#0d0d2b';
    else if (this.level >= 20) this.ctx.fillStyle = '#2b1055';
    else if (this.level >= 10) this.ctx.fillStyle = '#6b2b3a';
    else this.ctx.fillStyle = '#a8e6cf';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const b of this.butterflies) {
      if (!b.caught) {
        const flap = 0.78 + Math.abs(Math.sin(this.animClock * 11 + b.phase)) * 0.25;
        EmojiCache.draw(this.ctx, b.isGold ? '🪙' : '🦋', b.x, b.y, 28, 0, flap, 1);
      }
    }
    for (const bee of this.bees) EmojiCache.draw(this.ctx, '🐝', bee.x, bee.y, 28);

    // Strike indicator & net streak badge
    const badgeY = this.width < 460 ? 52 : 12;
    this.ctx.fillStyle = 'rgba(0,0,0,0.52)';
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
    this.ctx.fill();
    const misses = Math.max(0, this.maxLives - this.lives);
    let badge = '';
    for (let i = 0; i < this.maxLives; i++) badge += i < misses ? '❌' : '🦋';
    if (this.streak >= 5) badge += ` 🔥${this.streak}`;
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 12px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(badge, this.width / 2, badgeY + 18);
    this.ctx.textAlign = 'left';
  }

  handleClick(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    let hitButterfly = false;
    for (const b of this.butterflies) {
      if (!b.caught && Math.hypot(x - b.x, y - b.y) < b.r + 26) {
        ArcadeAudio.play(b.isGold ? 'coin' : 'match');
        const bx = b.x;
        const by = b.y;
        b.caught = true;
        b.x = 9999;
        this.streak++;
        const bonus = this.streak >= 5 ? 3 : 0;
        const coinBonus = b.isGold ? 5 : 1;
        this.score += (b.isGold ? 15 : 5) + bonus;
        addCoins(coinBonus);
        addXp(4);
        updateInGameHud(this.score, this.level, 3);
        this.spawnParticles(bx, by, b.isGold ? '#ffd700' : '#8fd3f4', 9, 140);
        this.spawnPopup(bx, by - 14, b.isGold ? `+15` : `+${5 + bonus}`, b.isGold ? '#ffd700' : '#ffffff');
        hitButterfly = true;
        break;
      }
    }
    if (!hitButterfly) {
      for (const bee of this.bees) {
        if (Math.hypot(x - bee.x, y - bee.y) < bee.r + 14) {
          ArcadeAudio.play('hurt');
          this.triggerShake(7, 0.16);
          this.spawnParticles(bee.x, bee.y, '#ff6b6b', 10, 150);
          bee.x = 9999;
          this.streak = 0;
          this.lives--;
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) this.gameOverSequence();
          return;
        }
      }
    }
  }
}
