import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface Block {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  mat: 'wood' | 'stone' | 'iron';
}

interface Pig {
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  isKing: boolean;
}

export function birdBudgetForStage(stage: number, pigCount: number): number {
  return Math.max(2, Math.min(4, pigCount + (stage <= 1 ? 1 : 0)));
}

export class AngrySlingshot extends BaseGame {
  stage = 1;
  groundY = 400;
  slingX = 90;
  slingY = 330;
  birdsLeft = 3;
  maxBirds = 3;
  bird = { x: 90, y: 330, vx: 0, vy: 0, r: 15, launched: false };
  aimDrag: { sx: number; sy: number; cx: number; cy: number } | null = null;
  blocks: Block[] = [];
  pigs: Pig[] = [];

  init(): void {
    this.stage = 1;
    this.maxLives = 1;
    this.lives = 1;
    this.setupStage();
  }

  setupStage(): void {
    this.groundY = Math.round(this.height * 0.84);
    this.slingX = Math.max(66, this.width * 0.17);
    this.slingY = this.groundY - Math.min(78, this.height * 0.13);
    this.bird = { x: this.slingX, y: this.slingY, vx: 0, vy: 0, r: 15, launched: false };
    this.aimDrag = null;
    this.blocks = [];
    this.pigs = [];

    const fortX = this.width * 0.56;
    const span = Math.min(200, this.width * 0.36);
    const cols = Math.min(5, 3 + (this.stage % 3));
    for (let c = 0; c < cols; c++) {
      const bx = fortX + (c / Math.max(1, cols - 1)) * span;
      const mat: Block['mat'] = this.stage >= 3 && c % 2 === 0 ? 'iron' : c === 0 ? 'stone' : 'wood';
      const hp = mat === 'iron' ? 4 : mat === 'stone' ? 3 : 2;
      this.blocks.push({ x: bx - 10, y: this.groundY - 64, w: 18, h: 64, hp, maxHp: hp, mat });
      if (c < cols - 1) {
        const nx = fortX + ((c + 1) / Math.max(1, cols - 1)) * span;
        this.blocks.push({ x: bx - 6, y: this.groundY - 80, w: nx - bx + 12, h: 16, hp: 2, maxHp: 2, mat: 'wood' });
        this.pigs.push({
          x: (bx + nx) / 2,
          y: this.groundY - 18,
          r: 15,
          hp: this.stage >= 3 ? 2 : 1,
          maxHp: this.stage >= 3 ? 2 : 1,
          isKing: false
        });
      }
    }

    if (this.stage >= 2) {
      const midX = fortX + span * 0.5;
      this.blocks.push({ x: midX - 28, y: this.groundY - 134, w: 14, h: 54, hp: 2, maxHp: 2, mat: 'stone' });
      this.blocks.push({ x: midX + 14, y: this.groundY - 134, w: 14, h: 54, hp: 2, maxHp: 2, mat: 'stone' });
      this.blocks.push({ x: midX - 32, y: this.groundY - 148, w: 64, h: 14, hp: 2, maxHp: 2, mat: 'wood' });
      const kingHp = Math.min(3, 1 + Math.floor(this.stage / 2));
      this.pigs.push({ x: midX, y: this.groundY - 96, r: 17, hp: kingHp, maxHp: kingHp, isKing: true });
    }

    this.maxBirds = birdBudgetForStage(this.stage, this.pigs.length);
    this.birdsLeft = this.maxBirds;
  }

  override resize(): void {
    const prevWidth = this.width || 1;
    const prevGroundY = this.groundY;
    const prevSlingX = this.slingX;
    const prevSlingY = this.slingY;
    super.resize();
    const scaleX = prevWidth > 0 ? this.width / prevWidth : 1;
    this.groundY = Math.round(this.height * 0.84);
    this.slingX = Math.max(66, this.width * 0.17);
    this.slingY = this.groundY - Math.min(78, this.height * 0.13);
    const dy = this.groundY - prevGroundY;
    for (const b of this.blocks) {
      b.x *= scaleX;
      b.w = Math.max(8, b.w * scaleX);
      b.y += dy;
    }
    for (const pg of this.pigs) {
      pg.x *= scaleX;
      pg.y += dy;
    }
    if (!this.bird.launched) {
      this.bird.x += this.slingX - prevSlingX;
      this.bird.y += this.slingY - prevSlingY;
    } else {
      this.bird.x *= scaleX;
      this.bird.y = Math.min(this.groundY - this.bird.r, this.bird.y + dy);
    }
    if (this.isPaused) this.draw();
  }

  releaseInputs(): void {
    this.aimDrag = null;
    if (!this.bird.launched) {
      this.bird.x = this.slingX;
      this.bird.y = this.slingY;
    }
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused || this.bird.launched) return;
    this.aimDrag = { sx: x, sy: y, cx: x, cy: y };
  }

  onPointerMove(x: number, y: number): void {
    if (!this.aimDrag || this.gameOver || this.isPaused || this.bird.launched) return;
    this.aimDrag.cx = x;
    this.aimDrag.cy = y;
    const dx = Math.max(-75, Math.min(35, x - this.aimDrag.sx));
    const dy = Math.max(-35, Math.min(75, y - this.aimDrag.sy));
    this.bird.x = this.slingX + dx;
    this.bird.y = this.slingY + dy;
  }

  onPointerUp(): void {
    if (!this.aimDrag || this.bird.launched) return;
    if (this.gameOver || this.isPaused) {
      this.releaseInputs();
      return;
    }
    const pullX = this.slingX - this.bird.x;
    const pullY = this.slingY - this.bird.y;
    if (Math.hypot(pullX, pullY) > 12) {
      this.bird.vx = pullX * 10.6;
      this.bird.vy = pullY * 10.6;
      this.bird.launched = true;
      ArcadeAudio.play('slingshot');
    } else {
      this.bird.x = this.slingX;
      this.bird.y = this.slingY;
    }
    this.aimDrag = null;
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;

    if (this.bird.launched) {
      this.bird.vy += 470 * dt;
      this.bird.x += this.bird.vx * dt;
      this.bird.y += this.bird.vy * dt;

      if (this.bird.y + this.bird.r > this.groundY) {
        this.bird.y = this.groundY - this.bird.r;
        if (Math.abs(this.bird.vy) < 42) {
          this.bird.vy = 0;
          this.bird.vx *= Math.exp(-6.5 * dt);
        } else {
          this.bird.vy *= -0.45;
          this.bird.vx *= 0.82;
        }
      }

      const speed = Math.hypot(this.bird.vx, this.bird.vy);
      for (let i = this.blocks.length - 1; i >= 0; i--) {
        const b = this.blocks[i];
        const cx = Math.max(b.x, Math.min(b.x + b.w, this.bird.x));
        const cy = Math.max(b.y, Math.min(b.y + b.h, this.bird.y));
        if (Math.hypot(this.bird.x - cx, this.bird.y - cy) <= this.bird.r) {
          b.hp -= speed > 420 ? 2 : 1;
          this.bird.vx *= 0.58;
          this.bird.vy *= 0.58;
          ArcadeAudio.play('break');
          this.triggerShake(6, 0.14);
          this.spawnParticles(cx, cy, b.mat === 'wood' ? '#d97706' : '#94a3b8', 8, 150);
          if (b.hp <= 0) {
            this.blocks.splice(i, 1);
            this.score += 30;
          }
        }
      }

      for (let i = this.pigs.length - 1; i >= 0; i--) {
        const pg = this.pigs[i];
        if (Math.hypot(this.bird.x - pg.x, this.bird.y - pg.y) <= this.bird.r + pg.r + 5) {
          pg.hp -= speed > 360 ? 2 : 1;
          this.bird.vx *= 0.72;
          this.bird.vy *= 0.72;
          if (pg.hp <= 0) {
            this.pigs.splice(i, 1);
            this.score += pg.isKing ? 160 : 100;
            addCoins(pg.isKing ? 5 : 3);
            ArcadeAudio.play('ko');
            addXp(10);
            this.spawnParticles(pg.x, pg.y, '#4ade80', 14, 190);
            this.spawnPopup(pg.x, pg.y - 16, pg.isKing ? '👑 KING POP! +160' : '🐷 POP! +100', '#ffd700');
          } else {
            ArcadeAudio.play('hit');
            this.spawnPopup(pg.x, pg.y - 14, 'ARMOR HIT!', '#facc15');
          }
        }
      }

      updateInGameHud(this.score, this.level, 13);

      if (this.pigs.length === 0) {
        this.stage++;
        this.level++;
        const bonus = Math.max(0, this.birdsLeft - 1) * 60;
        this.score += bonus;
        addCoins(5);
        ArcadeAudio.play('levelup');
        this.spawnPopup(this.width / 2, this.height * 0.35, `🏆 STAGE CLEAR! +${bonus}`, '#84fab0');
        this.setupStage();
        return;
      }

      if (
        this.bird.x > this.width + 60 ||
        this.bird.x < -60 ||
        (Math.hypot(this.bird.vx, this.bird.vy) < 18 && this.bird.y >= this.groundY - this.bird.r - 4)
      ) {
        this.birdsLeft--;
        if (this.birdsLeft <= 0) {
          this.spawnPopup(this.width / 2, this.height * 0.36, '💥 OUT OF BIRDS!', '#ef4444');
          this.gameOverSequence(false);
          return;
        }
        this.bird = { x: this.slingX, y: this.slingY, vx: 0, vy: 0, r: 15, launched: false };
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, this.width, this.groundY);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(this.slingX, this.groundY);
    ctx.lineTo(this.slingX, this.slingY + 6);
    ctx.stroke();

    if (!this.bird.launched) {
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.slingX - 6, this.slingY);
      ctx.lineTo(this.bird.x, this.bird.y);
      ctx.lineTo(this.slingX + 6, this.slingY);
      ctx.stroke();

      const vx = (this.slingX - this.bird.x) * 10.6;
      const vy = (this.slingY - this.bird.y) * 10.6;
      if (Math.hypot(vx, vy) > 100) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let s = 1; s <= 7; s++) {
          const t = s * 0.08;
          ctx.beginPath();
          ctx.arc(this.bird.x + vx * t, this.bird.y + vy * t + 235 * t * t, 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (const b of this.blocks) {
      ctx.fillStyle = b.mat === 'iron' ? '#334155' : b.mat === 'stone' ? '#64748b' : '#b45309';
      ctx.strokeStyle = b.hp < b.maxHp ? '#facc15' : '#1e293b';
      ctx.lineWidth = 2;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    }

    for (const pg of this.pigs) {
      EmojiCache.draw(ctx, pg.isKing ? '👑' : '🐷', pg.x, pg.isKing ? pg.y - 14 : pg.y, pg.r * 2);
      if (pg.isKing) EmojiCache.draw(ctx, '🐷', pg.x, pg.y + 4, pg.r * 2);
      if (pg.hp > 1) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(pg.x - 14, pg.y - pg.r - 8, 28, 4);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(pg.x - 14, pg.y - pg.r - 8, 28 * (pg.hp / pg.maxHp), 4);
      }
    }

    EmojiCache.draw(ctx, '🐦', this.bird.x, this.bird.y, this.bird.r * 2.1);

    ctx.font = '800 12px system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🐦 Birds: ${this.birdsLeft}/${this.maxBirds}  ·  🐷 Pigs: ${this.pigs.length}  ·  Stage ${this.stage}`,
      this.width / 2,
      Math.min(this.height - 10, this.groundY + 26)
    );
    ctx.textAlign = 'left';
  }
}
