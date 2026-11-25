import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { playerState } from '../../core/storage';
import { BaseGame } from '../../core/BaseGame';
import { isCrashLanding, normalizeAngle, terrainSlope, terrainY } from './hillClimbPhysics';

interface Pickup {
  x: number;
  y: number;
  kind: 'fuel' | 'coin';
  taken: boolean;
}

export class HillClimb extends BaseGame {
  carX = 160;
  carY = 0;
  vx = 0;
  vy = 0;
  angle = 0;
  angVel = 0;
  gas = false;
  brake = false;
  fuel = 100;
  bestDist = 0;
  pickups: Pickup[] = [];
  nextSpawnX = 420;
  wasOnGround = true;

  init(): void {
    this.carX = 160;
    this.carY = this.getTerrainY(160) - 20;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.angVel = 0;
    this.gas = false;
    this.brake = false;
    this.fuel = 100;
    this.maxLives = 1;
    this.lives = 1;
    this.bestDist = 0;
    this.pickups = [];
    this.nextSpawnX = 420;
    this.wasOnGround = true;
  }

  override releaseInputs(): void {
    this.gas = false;
    this.brake = false;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  override resize(): void {
    super.resize();
    const gy = this.getTerrainY(this.carX);
    if (this.wasOnGround) this.carY = gy - 20;
    else this.carY = Math.min(this.carY, gy - 20);
    for (const p of this.pickups) {
      p.y = this.getTerrainY(p.x) - 28;
    }
    if (this.isPaused) this.draw();
  }

  setSteerLeft(down: boolean): void {
    if (!down) {
      this.brake = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    this.brake = true;
  }

  setSteerRight(down: boolean): void {
    if (!down) {
      this.gas = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    this.gas = true;
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (actionKey === 'boost' || actionKey === 'action') {
      if (!pressed) {
        this.gas = false;
        return;
      }
      if (this.gameOver || this.isPaused) return;
      if (this.fuel > 12) {
        this.gas = true;
        this.vx += 110;
        ArcadeAudio.play('boost');
      }
    }
  }

  getTerrainY(x: number): number {
    return terrainY(x, this.height);
  }

  getSlope(x: number): number {
    return terrainSlope(x, this.height);
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.fuel = Math.max(0, this.fuel - dt * (this.gas ? 5.2 : 2.1) * this.scaler.speedMult);
    if (this.fuel <= 0 && Math.abs(this.vx) < 12) {
      this.spawnPopup(this.width * 0.38, this.height * 0.35, '⛽ OUT OF FUEL!', '#ef4444');
      this.gameOverSequence(false);
      return;
    }

    const gx = this.carX;
    const gy = this.getTerrainY(gx);
    const slopeAngle = Math.atan(this.getSlope(gx));
    const onGround = this.carY >= gy - 23;

    if (onGround) {
      if (!this.wasOnGround) {
        if (isCrashLanding(this.angle, slopeAngle)) {
          ArcadeAudio.play('break');
          this.triggerShake(12, 0.3);
          this.spawnPopup(this.width * 0.35, this.height * 0.35, '💥 BAD LANDING!', '#ef4444');
          this.gameOverSequence(false);
          return;
        }
        if (this.vy > 215) {
          this.vy = -this.vy * 0.22;
          this.angVel += normalizeAngle(this.angle - slopeAngle) * 1.6;
          ArcadeAudio.play('break');
        } else {
          this.vy = 0;
        }
      }
      this.carY = gy - 20;
      const diff = normalizeAngle(slopeAngle - this.angle);
      // Responsive suspension alignment keeps car steady on the starting pad and smooth crests
      this.angle += diff * (1 - Math.exp(-8.5 * dt));
      this.angVel *= Math.exp(-8.5 * dt);

      if (this.gas && this.fuel > 0) {
        this.vx += 450 * dt;
        // Wheelie torque only on steep uphill hills beyond the launch pad
        if (gx > 460 && slopeAngle < -0.28) {
          this.angVel -= 0.75 * dt;
        }
        if (Math.random() < dt * 7) ArcadeAudio.play('gas');
      }
      if (this.brake) {
        this.vx -= 350 * dt;
      }
      this.vx -= Math.sin(slopeAngle) * 295 * dt;
      this.vx *= Math.exp(-0.9 * dt);

      const aheadSlope = this.getSlope(gx + 18) - this.getSlope(gx);
      if (this.vx > 225 && aheadSlope > 0.13) {
        this.vy = -Math.min(315, this.vx * 0.52);
        this.angVel -= aheadSlope * 2.8;
      }
    } else {
      this.vy += 600 * dt;
      if (this.gas) this.angVel -= 4.2 * dt; // pitch nose UP
      if (this.brake) this.angVel += 4.2 * dt; // pitch nose DOWN
      this.angle += this.angVel * dt;
      this.angVel *= Math.exp(-0.5 * dt);
    }

    this.wasOnGround = onGround;
    this.carX = Math.max(40, this.carX + this.vx * dt);
    this.carY += this.vy * dt;

    const normAng = Math.abs(normalizeAngle(this.angle));
    if (onGround && normAng > 1.38) {
      ArcadeAudio.play('hurt');
      this.triggerShake(10, 0.25);
      this.spawnPopup(this.width * 0.35, this.height * 0.35, '💥 FLIPPED!', '#ef4444');
      this.gameOverSequence(false);
      return;
    }

    while (this.nextSpawnX < this.carX + this.width + 220) {
      const isFuel = this.nextSpawnX % 1100 < 220;
      this.pickups.push({
        x: this.nextSpawnX,
        y: this.getTerrainY(this.nextSpawnX) - 28,
        kind: isFuel ? 'fuel' : 'coin',
        taken: false
      });
      this.nextSpawnX += isFuel ? 220 : 145;
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      if (!p.taken && Math.hypot(p.x - this.carX, p.y - this.carY) < 44) {
        p.taken = true;
        if (p.kind === 'fuel') {
          this.fuel = Math.min(100, this.fuel + 45);
          ArcadeAudio.play('save');
          this.spawnPopup(this.width * 0.35, this.height * 0.35, '⛽ +FUEL!', '#84fab0');
        } else {
          this.score += 20;
          addCoins(2);
          ArcadeAudio.play('coin');
          addXp(4);
        }
      }
      if (p.taken || p.x < this.carX - 240) this.pickups.splice(i, 1);
    }

    const distM = Math.max(0, Math.floor((this.carX - 160) / 15));
    if (distM > this.bestDist) {
      this.score += distM - this.bestDist;
      this.bestDist = distM;
      this.level = 1 + Math.floor(distM / 120);
      updateInGameHud(this.score, this.level, 11);
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const camX = this.carX - Math.min(160, this.width * 0.28);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, this.width, this.height * 0.55);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(0, this.height * 0.55, this.width, this.height * 0.45);

    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let sx = 0; sx <= this.width + 16; sx += 14) {
      ctx.lineTo(sx, this.getTerrainY(camX + sx));
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fillStyle = '#78350f';
    ctx.fill();

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    for (let sx = 0; sx <= this.width + 16; sx += 14) {
      const sy = this.getTerrainY(camX + sx);
      if (sx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Starting Flag on the flat launch pad
    const startFlagScreenX = 360 - camX;
    if (startFlagScreenX > -40 && startFlagScreenX < this.width + 40) {
      const fy = this.getTerrainY(360);
      EmojiCache.draw(ctx, '🏁', startFlagScreenX, fy - 22, 28);
    }

    for (const p of this.pickups) {
      const sx = p.x - camX;
      EmojiCache.draw(ctx, p.kind === 'fuel' ? '⛽' : '🪙', sx, p.y, 28);
    }

    const cx = this.carX - camX;
    const cy = this.carY;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.angle);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(-26, -18, 52, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-12, -28, 24, 12);
    EmojiCache.draw(ctx, playerState.currentAvatar, -2, -26, 20);
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(-16, 4, 9, 0, Math.PI * 2);
    ctx.arc(16, 4, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const barW = Math.min(180, this.width * 0.44);
    const bx = (this.width - barW) / 2;
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const by = this.width < 460 ? 58 : isCompactLand ? 14 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, 18, 9);
    ctx.fill();
    ctx.fillStyle = this.fuel < 25 ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 2, Math.max(0, (barW - 4) * (this.fuel / 100)), 14, 7);
    ctx.fill();
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`⛽ ${Math.ceil(this.fuel)}% · ${this.bestDist}m`, this.width / 2, by + 13);
    ctx.textAlign = 'left';
  }
}
