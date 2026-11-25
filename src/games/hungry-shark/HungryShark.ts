import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface OceanEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: 'prey' | 'mine' | 'pred' | 'gem';
  icon: string;
  r: number;
  pts: number;
}

export class HungryShark extends BaseGame {
  shark = { x: 0, y: 240, angle: 0, size: 1, hunger: 100 };
  camX = 0;
  camY = 0;
  targetScreenPos: { x: number; y: number } | null = null;
  moveDx = 0;
  moveDy = 0;
  boosting = false;
  goldRush = 0;
  rushCharge = 0;
  entities: OceanEntity[] = [];

  init(): void {
    this.shark = { x: 0, y: 240, angle: 0, size: 1, hunger: 100 };
    this.camX = this.shark.x - this.width / 2;
    this.camY = this.shark.y - this.height / 2;
    this.targetScreenPos = null;
    this.moveDx = 0;
    this.moveDy = 0;
    this.boosting = false;
    this.goldRush = 0;
    this.rushCharge = 0;
    this.entities = [];
    this.maxLives = 3;
    this.lives = 3;
    for (let i = 0; i < 24; i++) this.spawnOceanEntity(true);
  }

  override releaseInputs(): void {
    this.targetScreenPos = null;
    this.boosting = false;
    this.moveDx = 0;
    this.moveDy = 0;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  setBoost(on: boolean): void {
    if (!on) {
      this.boosting = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    if (!this.boosting) ArcadeAudio.play('boost');
    this.boosting = true;
  }

  setMoveDir(dx: number, dy: number): void {
    if (this.gameOver || this.isPaused) {
      this.moveDx = 0;
      this.moveDy = 0;
      return;
    }
    this.moveDx = dx;
    this.moveDy = dy;
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (actionKey === 'boost' || actionKey === 'action') this.setBoost(pressed);
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.targetScreenPos = { x, y };
  }

  onPointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    if (this.targetScreenPos) this.targetScreenPos = { x, y };
  }

  onPointerUp(): void {
    this.targetScreenPos = null;
  }

  spawnOceanEntity(anywhereInView = false): void {
    const viewL = this.camX;
    const viewT = this.camY;
    const edgeRoll = Math.floor(Math.random() * 4);
    let ex = viewL + Math.random() * this.width;
    let ey = viewT + Math.random() * this.height;
    if (!anywhereInView) {
      const margin = 70;
      if (edgeRoll === 0) {
        ex = viewL - margin;
      } else if (edgeRoll === 1) {
        ex = viewL + this.width + margin;
      } else if (edgeRoll === 2) {
        ey = Math.max(0, viewT - margin);
      } else {
        ey = viewT + this.height + margin;
      }
    }
    // Unlimited horizontal ocean; keep minimum surface ceiling at y = 20
    ey = Math.max(24, ey);

    const roll = Math.random();
    let kind: OceanEntity['kind'] = 'prey';
    let icon = '🐟';
    let r = 14;
    let pts = 18;
    let spd = 62;
    if (roll < 0.14) {
      kind = 'mine';
      icon = '💣';
      r = 16;
      spd = 18;
    } else if (roll < 0.22) {
      kind = 'pred';
      icon = ey > 750 ? '🐙' : '🐋';
      r = 30;
      pts = 110;
      spd = 82;
    } else if (roll < 0.30) {
      kind = 'gem';
      icon = '💎';
      r = 16;
      pts = 55;
      spd = 25;
    } else if (roll < 0.50) {
      kind = 'prey';
      icon = ey > 550 ? '🦑' : '🐠';
      r = 16;
      pts = 26;
      spd = 72;
    } else if (roll < 0.65) {
      kind = 'prey';
      icon = ey < 260 ? '🤿' : '🦀';
      r = 18;
      pts = 42;
      spd = 48;
    }

    const dirX = ex < this.shark.x ? 1 : -1;
    this.entities.push({
      x: ex,
      y: ey,
      vx: dirX * spd * this.scaler.speedMult,
      vy: (Math.random() - 0.5) * 18,
      kind,
      icon,
      r,
      pts
    });
  }

  update(dt: number): void {
    if (this.gameOver) return;
    if (this.goldRush > 0) this.goldRush = Math.max(0, this.goldRush - dt);

    const boostMult = (this.boosting && this.shark.hunger > 15) || this.goldRush > 0 ? 1.85 : 1;
    const hungerDrain = this.goldRush > 0 ? 0.5 : this.boosting ? 7.2 : 3.2;
    this.shark.hunger -= dt * hungerDrain * this.scaler.speedMult;
    if (this.shark.hunger <= 0) {
      this.gameOverSequence(false);
      return;
    }

    let vx = this.moveDx;
    let vy = this.moveDy;
    if (this.targetScreenPos) {
      const worldTx = this.camX + this.targetScreenPos.x;
      const worldTy = this.camY + this.targetScreenPos.y;
      const dx = worldTx - this.shark.x;
      const dy = worldTy - this.shark.y;
      const d = Math.hypot(dx, dy);
      if (d > 8) {
        vx = dx / d;
        vy = dy / d;
      }
    }
    const spd = 235 * boostMult;
    // Unlimited horizontal & deep diving world (bounded only by sea surface at y = 18)
    this.shark.x += vx * spd * dt;
    this.shark.y = Math.max(18, this.shark.y + vy * spd * dt);
    if (Math.hypot(vx, vy) > 0.1) this.shark.angle = Math.atan2(vy, vx);

    // Smooth camera tracking
    const targetCamX = this.shark.x - this.width / 2;
    const targetCamY = Math.max(-40, this.shark.y - this.height / 2);
    const camAlpha = 1 - Math.exp(-8 * dt);
    this.camX += (targetCamX - this.camX) * camAlpha;
    this.camY += (targetCamY - this.camY) * camAlpha;

    const desiredCount = 24 + Math.min(18, this.level * 2);
    while (this.entities.length < desiredCount) this.spawnOceanEntity(false);
    const sharkR = 22 + Math.min(20, (this.shark.size - 1) * 9);

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      e.x += e.vx * dt;
      e.y = Math.max(24, e.y + e.vy * dt);

      const sx = e.x - this.camX;
      const sy = e.y - this.camY;
      if (Math.hypot(e.x - this.shark.x, e.y - this.shark.y) < sharkR + e.r) {
        const canEat =
          this.goldRush > 0 ||
          e.kind === 'prey' ||
          e.kind === 'gem' ||
          (e.kind === 'pred' && this.shark.size >= 1.7);
        if (canEat) {
          this.entities.splice(i, 1);
          this.shark.hunger = Math.min(100, this.shark.hunger + (e.kind === 'gem' ? 12 : 18));
          this.shark.size = Math.min(2.6, this.shark.size + 0.03);
          const pts = e.pts * (this.goldRush > 0 ? 2 : 1);
          this.score += pts;
          this.rushCharge += e.kind === 'gem' ? 22 : 12;
          if (this.rushCharge >= 100 && this.goldRush <= 0) {
            this.rushCharge = 0;
            this.goldRush = 7.5;
            ArcadeAudio.play('levelup');
            this.spawnPopup(this.width / 2, this.height * 0.34, '⚡ GOLD RUSH FEVER!', '#facc15');
          }
          addCoins(e.kind === 'gem' || this.goldRush > 0 ? 3 : 1);
          ArcadeAudio.play('chomp');
          addXp(5);
          if (this.score >= this.level * 400) this.level++;
          updateInGameHud(this.score, this.level, 15);
          this.spawnParticles(sx, sy, this.goldRush > 0 ? '#facc15' : '#ef4444', 7, 130);
          continue;
        } else {
          this.entities.splice(i, 1);
          this.lives--;
          ArcadeAudio.play('hurt');
          this.triggerShake(8, 0.2);
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) {
            this.gameOverSequence(false);
            return;
          }
          continue;
        }
      }

      const maxRange = Math.max(this.width, this.height) * 0.95 + 180;
      if (Math.abs(e.x - this.shark.x) > maxRange || Math.abs(e.y - this.shark.y) > maxRange) {
        this.entities.splice(i, 1);
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    // Dynamic depth color based on vertical position
    const depth = Math.max(0, Math.floor(this.shark.y / 12));
    const deepFactor = Math.min(1, Math.max(0, this.camY / 900));
    const topR = Math.round(3 + (2 - 3) * deepFactor);
    const topG = Math.round(105 * (1 - deepFactor * 0.72));
    const topB = Math.round(161 * (1 - deepFactor * 0.52));
    ctx.fillStyle = `rgb(${topR}, ${topG}, ${topB})`;
    ctx.fillRect(0, 0, this.width, this.height);

    // Infinite sky / water surface when camera nears top
    const surfaceScreenY = 0 - this.camY;
    if (surfaceScreenY > 0) {
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(0, 0, this.width, Math.min(this.height, surfaceScreenY));
    }

    // Parallax bubbles & sea columns keyed cleanly off modulo world grid
    const gridStep = 220;
    const startGx = Math.floor(this.camX / gridStep) * gridStep;
    const startGy = Math.max(80, Math.floor(this.camY / gridStep) * gridStep);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let gx = startGx; gx < this.camX + this.width + gridStep; gx += gridStep) {
      for (let gy = startGy; gy < this.camY + this.height + gridStep; gy += gridStep) {
        const hash = Math.abs(Math.sin(gx * 0.17 + gy * 0.31));
        const sx = gx + hash * 120 - this.camX;
        const sy = gy + ((hash * 97) % 1) * 120 - this.camY;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + (hash * 8), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.save();
    ctx.translate(-this.camX, -this.camY);
    for (const e of this.entities) {
      const icon = this.goldRush > 0 && (e.kind === 'prey' || e.kind === 'pred') ? '🪙' : e.icon;
      EmojiCache.draw(ctx, icon, e.x, e.y, e.r * 1.9, 0, e.vx < 0 ? 1 : -1, 1);
    }
    const flipX = Math.cos(this.shark.angle) >= 0 ? -1 : 1;
    if (this.goldRush > 0) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.shark.x, this.shark.y, 30 * Math.min(1.8, this.shark.size), 0, Math.PI * 2);
      ctx.stroke();
    }
    EmojiCache.draw(ctx, '🦈', this.shark.x, this.shark.y, Math.round(44 * Math.min(1.9, this.shark.size)), 0, flipX, 1);
    ctx.restore();

    const bw = Math.min(180, this.width * 0.44);
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const by = this.width < 460 ? 58 : isCompactLand ? 14 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.roundRect((this.width - bw) / 2, by, bw, 14, 7);
    ctx.fill();
    ctx.fillStyle = this.goldRush > 0 ? '#facc15' : this.shark.hunger < 25 ? '#ef4444' : '#38bdf8';
    ctx.beginPath();
    ctx.roundRect((this.width - bw) / 2 + 2, by + 2, (bw - 4) * (this.shark.hunger / 100), 10, 5);
    ctx.fill();
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    const distKm = Math.floor(Math.hypot(this.shark.x, this.shark.y - 240) / 100);
    ctx.fillText(
      this.goldRush > 0
        ? `⚡ GOLD RUSH ${Math.ceil(this.goldRush)}s · Depth ${depth}m`
        : `🦈 Size ${this.shark.size.toFixed(1)}x · ${distKm}m · Depth ${depth}m`,
      this.width / 2,
      by + 26
    );
    ctx.textAlign = 'left';
  }
}
