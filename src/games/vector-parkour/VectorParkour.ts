import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface ParkourObstacle {
  x: number;
  high: boolean;
  w: number;
  y: number;
  h: number;
  passed: boolean;
}

interface DataCube {
  x: number;
  y: number;
}

export class VectorParkour extends BaseGame {
  groundY = 400;
  runner = { x: 80, y: 400, vy: 0, sliding: false, anim: 0, jumpsUsed: 0 };
  obstacles: ParkourObstacle[] = [];
  cubes: DataCube[] = [];
  spawnTimer = 0.7;
  swipeY: number | null = null;
  skylineOffset = 0;

  init(): void {
    this.groundY = Math.round(this.height * 0.78);
    this.runner = {
      x: Math.round(Math.max(44, this.width * 0.16)),
      y: this.groundY,
      vy: 0,
      sliding: false,
      anim: 0,
      jumpsUsed: 0
    };
    this.obstacles = [];
    this.cubes = [];
    this.spawnTimer = 0.7;
    this.swipeY = null;
    this.maxLives = 3;
    this.lives = 3;
  }

  override releaseInputs(): void {
    this.swipeY = null;
    this.runner.sliding = false;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  override resize(): void {
    super.resize();
    const prevGroundY = this.groundY;
    this.groundY = Math.round(this.height * 0.78);
    this.runner.x = Math.round(Math.max(44, this.width * 0.16));
    if (this.runner.y >= prevGroundY - 2) this.runner.y = this.groundY;
    for (const o of this.obstacles) {
      o.y = o.high ? this.groundY - 46 : this.groundY - 38;
    }
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.runner.jumpsUsed < 2) {
      this.runner.vy = this.runner.jumpsUsed === 0 ? -490 : -430;
      this.runner.sliding = false;
      this.runner.jumpsUsed++;
      ArcadeAudio.play('jump');
    }
  }

  setSlide(on: boolean): void {
    if (!on) {
      this.runner.sliding = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    this.runner.sliding = true;
    if (this.runner.y >= this.groundY - 2) ArcadeAudio.play('slide');
  }

  onPointerDown(_x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.swipeY = y;
  }

  onPointerMove(_x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    if (this.swipeY !== null && y - this.swipeY > 30) {
      this.setSlide(true);
      this.swipeY = null;
    }
  }

  onPointerUp(): void {
    if (this.gameOver || this.isPaused) {
      this.swipeY = null;
      this.runner.sliding = false;
      return;
    }
    if (this.swipeY !== null) {
      this.jump();
      this.swipeY = null;
    } else {
      this.setSlide(false);
    }
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.runner.anim += dt * 13;
    this.runner.vy += 1280 * dt;
    this.runner.y += this.runner.vy * dt;
    if (this.runner.y > this.groundY) {
      this.runner.y = this.groundY;
      this.runner.vy = 0;
      this.runner.jumpsUsed = 0;
    }

    const spd = (260 + this.level * 22) * this.scaler.speedMult;
    this.skylineOffset = (this.skylineOffset + spd * 0.25 * dt) % 140;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.75, (1.55 - this.level * 0.05) / this.scaler.spawnMult);
      const high = Math.random() < 0.45;
      this.obstacles.push({
        x: this.width + 40,
        high,
        w: high ? 56 : 24,
        y: high ? this.groundY - 46 : this.groundY - 38,
        h: high ? 20 : 38,
        passed: false
      });
      if (Math.random() < 0.65) {
        this.cubes.push({ x: this.width + 70, y: this.groundY - (high ? 18 : 74) });
      }
    }

    const boxH = this.runner.sliding ? 22 : 48;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.x -= spd * dt;
      if (
        !o.passed &&
        Math.abs(o.x + o.w / 2 - this.runner.x) < o.w / 2 + 12 &&
        this.runner.y > o.y &&
        this.runner.y - boxH < o.y + o.h
      ) {
        o.passed = true;
        this.lives--;
        ArcadeAudio.play('hurt');
        this.triggerShake(8, 0.16);
        updateHealthDisplay(this.lives, this.maxLives);
        if (this.lives <= 0) {
          this.gameOverSequence(false);
          return;
        }
      }
      if (!o.passed && o.x + o.w < this.runner.x) {
        o.passed = true;
        this.score += 15;
        updateInGameHud(this.score, this.level, 19);
      }
      if (o.x < -80) this.obstacles.splice(i, 1);
    }

    for (let i = this.cubes.length - 1; i >= 0; i--) {
      const c = this.cubes[i];
      c.x -= spd * dt;
      if (Math.hypot(c.x - this.runner.x, c.y - (this.runner.y - boxH / 2)) < 26) {
        this.cubes.splice(i, 1);
        this.score += 25;
        addCoins(2);
        ArcadeAudio.play('coin');
        addXp(5);
        this.spawnPopup(c.x, c.y - 12, '+25 💠', '#38bdf8');
        updateInGameHud(this.score, this.level, 19);
      } else if (c.x < -30) {
        this.cubes.splice(i, 1);
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.groundY * 0.55);
    ctx.fillStyle = '#be185d';
    ctx.fillRect(0, this.groundY * 0.55, this.width, this.groundY * 0.45);

    // Parallax silhouette skyline buildings
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    for (let sx = -this.skylineOffset; sx < this.width + 140; sx += 140) {
      ctx.fillRect(sx + 8, this.groundY - 120, 48, 120);
      ctx.fillRect(sx + 66, this.groundY - 82, 58, 82);
    }

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, this.groundY, this.width, 3);

    for (const o of this.obstacles) {
      ctx.fillStyle = o.high ? '#facc15' : '#ef4444';
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
    for (const c of this.cubes) EmojiCache.draw(ctx, '💠', c.x, c.y, 24);

    const rx = this.runner.x;
    const ry = this.runner.y;
    ctx.strokeStyle = '#050507';
    ctx.fillStyle = '#050507';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    if (this.runner.sliding) {
      ctx.beginPath();
      ctx.arc(rx - 14, ry - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx - 10, ry - 10);
      ctx.lineTo(rx + 18, ry - 6);
      ctx.stroke();
    } else {
      const stride = Math.sin(this.runner.anim) * 12;
      ctx.beginPath();
      ctx.arc(rx + 4, ry - 44, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx + 3, ry - 38);
      ctx.lineTo(rx - 2, ry - 18);
      ctx.moveTo(rx - 2, ry - 18);
      ctx.lineTo(rx - 4 + stride, ry);
      ctx.moveTo(rx - 2, ry - 18);
      ctx.lineTo(rx + 4 - stride, ry);
      ctx.moveTo(rx + 1, ry - 32);
      ctx.lineTo(rx + 14 - stride * 0.5, ry - 26);
      ctx.stroke();
    }

    const badgeY = this.width < 460 ? 52 : 12;
    ctx.fillStyle = 'rgba(0,0,0,0.58)';
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 58, badgeY, 116, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏃'.repeat(Math.max(0, this.lives)) + '✖'.repeat(Math.max(0, this.maxLives - this.lives)), this.width / 2, badgeY + 17);
    ctx.textAlign = 'left';
  }
}
