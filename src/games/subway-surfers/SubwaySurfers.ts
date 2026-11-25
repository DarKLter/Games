import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { BaseGame } from '../../core/BaseGame';

interface SubwayEntity {
  lane: number;
  z: number;
  kind: 'coin' | 'shield' | 'magnet' | 'jetpack' | 'train' | 'barrier' | 'sign';
  done: boolean;
  high?: boolean;
}

export class SubwaySurfersGame extends BaseGame {
  lane = 1;
  visualLane = 1;
  jumpY = 0;
  jumpVy = 0;
  slideTimer = 0;
  shield = 0;
  magnet = 0;
  jetpack = 0;
  entities: SubwayEntity[] = [];
  spawnTimer = 0.4;
  trackOffset = 0;
  swipeStart: { x: number; y: number } | null = null;

  init(): void {
    this.lane = 1;
    this.visualLane = 1;
    this.jumpY = 0;
    this.jumpVy = 0;
    this.slideTimer = 0;
    this.shield = 0;
    this.magnet = 0;
    this.jetpack = 0;
    this.entities = [];
    this.spawnTimer = 0.4;
    this.trackOffset = 0;
    this.swipeStart = null;
    this.maxLives = 3;
    this.lives = 3;
  }

  releaseInputs(): void {
    this.swipeStart = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  moveLeft(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.lane > 0) {
      this.lane--;
      ArcadeAudio.play('dash');
    }
  }

  moveRight(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.lane < 2) {
      this.lane++;
      ArcadeAudio.play('dash');
    }
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.jumpY <= 1 && this.jetpack <= 0) {
      this.jumpVy = 13.5;
      this.slideTimer = 0;
      ArcadeAudio.play('jump');
    }
  }

  slide(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.jetpack > 0) return;
    if (this.jumpY > 2) this.jumpVy = -14;
    this.slideTimer = 0.65;
    ArcadeAudio.play('slide');
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.swipeStart = { x, y };
  }

  onPointerMove(x: number, y: number): void {
    if (!this.swipeStart || this.gameOver || this.isPaused) return;
    const dx = x - this.swipeStart.x;
    const dy = y - this.swipeStart.y;
    if (Math.hypot(dx, dy) > 26) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) this.moveRight();
        else this.moveLeft();
      } else if (dy < 0) {
        this.jump();
      } else {
        this.slide();
      }
      this.swipeStart = null;
    }
  }

  onPointerUp(): void {
    this.swipeStart = null;
  }

  project(laneIdx: number, z: number): { x: number; y: number; scale: number } {
    const horizY = this.height * 0.28;
    const groundY = this.height * 0.88;
    const t = Math.max(0.05, 1 - z);
    const y = horizY + (groundY - horizY) * (t * t * 0.65 + t * 0.35);
    const spread = Math.min(this.width * 0.3, 140) * (0.16 + t * 0.84);
    const x = this.width / 2 + (laneIdx - 1) * spread;
    const scale = 0.22 + t * 0.88;
    return { x, y, scale };
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.visualLane += (this.lane - this.visualLane) * (1 - Math.exp(-16 * dt));
    if (this.slideTimer > 0) this.slideTimer = Math.max(0, this.slideTimer - dt);
    if (this.shield > 0) this.shield = Math.max(0, this.shield - dt);
    if (this.magnet > 0) this.magnet = Math.max(0, this.magnet - dt);

    if (this.jetpack > 0) {
      this.jetpack = Math.max(0, this.jetpack - dt);
      this.jumpY += (88 - this.jumpY) * (1 - Math.exp(-8 * dt));
      this.jumpVy = 0;
    } else if (this.jumpY > 0 || this.jumpVy !== 0) {
      this.jumpY += this.jumpVy * dt * 28;
      this.jumpVy -= 36 * dt;
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.jumpVy = 0;
      }
    }

    const spd = (0.42 + this.level * 0.03) * this.scaler.speedMult * (this.jetpack > 0 ? 1.45 : 1);
    this.trackOffset = (this.trackOffset + spd * dt * 12) % 1;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.38, (1.1 - this.level * 0.04) / this.scaler.spawnMult);
      const ln = Math.floor(Math.random() * 3);
      const roll = Math.random();
      let kind: SubwayEntity['kind'] = 'coin';
      if (this.jetpack > 0) {
        kind = 'coin';
      } else if (roll < 0.23) kind = 'train';
      else if (roll < 0.45) kind = 'barrier';
      else if (roll < 0.64) kind = 'sign';
      else if (roll < 0.70) kind = 'shield';
      else if (roll < 0.75) kind = 'magnet';
      else if (roll < 0.79) kind = 'jetpack';

      const isHighCoin = this.jetpack > 0 && kind === 'coin';
      this.entities.push({ lane: ln, z: 1.0, kind, done: false, high: isHighCoin });
      if (kind === 'coin') {
        this.entities.push({ lane: ln, z: 0.92, kind: 'coin', done: false, high: isHighCoin });
        this.entities.push({ lane: ln, z: 0.84, kind: 'coin', done: false, high: isHighCoin });
      }
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.z -= spd * dt;
      const magnetCatch = this.magnet > 0 && e.kind === 'coin' && e.z <= 0.24 && e.z >= 0.0;
      const laneMatch = Math.abs(e.lane - this.visualLane) < 0.45;
      const heightMatch = !e.high || this.jumpY > 32 || this.jetpack > 0;

      if (!e.done && e.z <= 0.14 && e.z >= 0.02 && (laneMatch || magnetCatch) && (heightMatch || magnetCatch)) {
        if (e.kind === 'coin') {
          e.done = true;
          this.score += 15;
          addCoins(1);
          ArcadeAudio.play('coin');
          addXp(3);
          updateInGameHud(this.score, this.level, 10);
          const p = this.project(e.lane, e.z);
          this.spawnParticles(p.x, p.y - (16 + (e.high ? 58 : 0)) * p.scale, '#ffd700', 6, 120);
        } else if (e.kind === 'shield') {
          e.done = true;
          this.shield = 7;
          ArcadeAudio.play('levelup');
          const p = this.project(e.lane, e.z);
          this.spawnPopup(p.x, p.y - 30, '🛡️ HOVERBOARD!', '#38bdf8');
        } else if (e.kind === 'magnet') {
          e.done = true;
          this.magnet = 8;
          ArcadeAudio.play('levelup');
          const p = this.project(e.lane, e.z);
          this.spawnPopup(p.x, p.y - 30, '🧲 COIN MAGNET!', '#f472b6');
        } else if (e.kind === 'jetpack') {
          e.done = true;
          this.jetpack = 5;
          ArcadeAudio.play('combo');
          const p = this.project(e.lane, e.z);
          this.spawnPopup(p.x, p.y - 30, '🚀 JETPACK FLY!', '#facc15');
        } else if (this.jetpack <= 0) {
          const dodged =
            (e.kind === 'barrier' && this.jumpY > 22) || (e.kind === 'sign' && this.slideTimer > 0);
          if (!dodged) {
            e.done = true;
            if (this.shield > 0) {
              this.shield = 0;
              ArcadeAudio.play('break');
              this.triggerShake(5, 0.12);
            } else {
              this.lives--;
              ArcadeAudio.play('hurt');
              this.triggerShake(9, 0.2);
              updateHealthDisplay(this.lives, this.maxLives);
              if (this.lives <= 0) {
                this.gameOverSequence();
                return;
              }
            }
          }
        }
      }
      if (!e.done && e.z < 0 && !['coin', 'shield', 'magnet', 'jetpack'].includes(e.kind)) {
        e.done = true;
        this.score += 10;
        updateInGameHud(this.score, this.level, 10);
      }
      if (e.z < -0.1 || e.done) this.entities.splice(i, 1);
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const horizY = this.height * 0.28;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, horizY);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, horizY, this.width, this.height - horizY);
    for (let ln = 0; ln < 3; ln++) {
      const topP = this.project(ln, 0.95);
      const botP = this.project(ln, 0);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(topP.x - 10, topP.y);
      ctx.lineTo(botP.x - 36, botP.y);
      ctx.moveTo(topP.x + 10, topP.y);
      ctx.lineTo(botP.x + 36, botP.y);
      ctx.stroke();
    }
    this.entities.sort((a, b) => b.z - a.z);
    for (const e of this.entities) {
      const p = this.project(e.lane, e.z);
      if (e.kind === 'coin') {
        EmojiCache.draw(ctx, '🪙', p.x, p.y - (16 + (e.high ? 58 : 0)) * p.scale, Math.round(28 * p.scale));
      } else if (e.kind === 'shield') {
        EmojiCache.draw(ctx, '🛡️', p.x, p.y - 20 * p.scale, Math.round(32 * p.scale));
      } else if (e.kind === 'magnet') {
        EmojiCache.draw(ctx, '🧲', p.x, p.y - 20 * p.scale, Math.round(32 * p.scale));
      } else if (e.kind === 'jetpack') {
        EmojiCache.draw(ctx, '🚀', p.x, p.y - 22 * p.scale, Math.round(34 * p.scale));
      } else if (e.kind === 'train') {
        const tw = 66 * p.scale;
        const th = 72 * p.scale;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.roundRect(p.x - tw / 2, p.y - th, tw, th, 8);
        ctx.fill();
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(p.x - tw * 0.36, p.y - th * 0.8, tw * 0.72, th * 0.34);
        EmojiCache.draw(ctx, '🚇', p.x, p.y - th * 0.3, Math.round(32 * p.scale));
      } else if (e.kind === 'barrier') {
        const bw = 62 * p.scale;
        const bh = 26 * p.scale;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p.x - bw / 2, p.y - bh, bw, bh);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - bw / 2, p.y - bh + 4, bw, 5);
      } else if (e.kind === 'sign') {
        const sw = 66 * p.scale;
        const sy = p.y - 52 * p.scale;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(p.x - sw / 2, sy - 24 * p.scale, sw, 24 * p.scale);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(p.x - sw / 2, sy, 4, 52 * p.scale);
        ctx.fillRect(p.x + sw / 2 - 4, sy, 4, 52 * p.scale);
      }
    }
    const pl = this.project(this.visualLane, 0.08);
    const squashY = this.slideTimer > 0 ? 0.55 : 1;
    if (this.shield > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pl.x, pl.y - 22 - this.jumpY, 30, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.jetpack > 0) {
      EmojiCache.draw(ctx, '🔥', pl.x, pl.y - 4 - this.jumpY, 26);
    }
    EmojiCache.draw(
      ctx,
      playerState.currentAvatar,
      pl.x,
      pl.y - 22 * squashY - this.jumpY,
      40,
      0,
      1,
      squashY
    );

    // Compact top-center badge
    const badgeY = this.width < 460 ? 52 : 12;
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 84, badgeY, 168, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const hearts = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, this.maxLives - this.lives));
    const buffs = `${this.jetpack > 0 ? ' 🚀' : ''}${this.magnet > 0 ? ' 🧲' : ''}${this.shield > 0 ? ' 🛡️' : ''}`;
    ctx.fillText(`${hearts}${buffs}`, this.width / 2, badgeY + 18);
    ctx.textAlign = 'left';
  }
}
