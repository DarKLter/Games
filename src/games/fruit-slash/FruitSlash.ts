import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

const FRUIT_ICONS = ['🍎', '🍉', '🍊', '🍓', '🍍', '🥝', '🍑'];

interface FruitItem {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  icon: string;
  sliced: boolean;
  missed: boolean;
  kind: 'fruit' | 'coin' | 'freeze' | 'frenzy';
}

interface BombItem {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
}

interface SlashPoint {
  x: number;
  y: number;
  life: number;
}

export class FruitSlash extends BaseGame {
  fruits: FruitItem[] = [];
  bombs: BombItem[] = [];
  slashTrail: SlashPoint[] = [];
  freezeTimer = 0;
  frenzyTimer = 0;
  comboCount = 0;
  comboTimer = 0;

  init(): void {
    this.fruits = [];
    this.bombs = [];
    this.slashTrail = [];
    this.maxLives = 3;
    this.lives = 3;
    this.freezeTimer = 0;
    this.frenzyTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
  }

  override releaseInputs(): void {
    this.slashTrail = [];
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  update(dt: number): void {
    if (this.gameOver) return;
    if (this.freezeTimer > 0) this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    if (this.frenzyTimer > 0) this.frenzyTimer = Math.max(0, this.frenzyTimer - dt);
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }

    const timeSlow = this.freezeTimer > 0 ? 0.55 : 1;
    const deltaMult = dt * 60 * timeSlow;
    const hRatio = Math.max(0.45, this.height / 720);
    const gStep = 0.14 * hRatio;
    const gravityPull = gStep * deltaMult;
    const targetPeak = this.height * (0.68 + Math.random() * 0.18);
    const launchVy =
      -Math.sqrt(2 * gStep * targetPeak) * Math.max(0.92, Math.min(1.22, this.scaler.speedMult));
    const spawnMargin = Math.min(60, this.width * 0.14);
    const spawnSpan = Math.max(40, this.width - spawnMargin * 2);
    const baseRate = (0.025 + this.level * 0.003) * this.scaler.spawnMult * (this.frenzyTimer > 0 ? 2.4 : 1);
    const spawnRate = Math.max(0.018, baseRate) * dt * 60;

    if (Math.random() < spawnRate) {
      const r = Math.random();
      let kind: FruitItem['kind'] = 'fruit';
      let icon = FRUIT_ICONS[Math.floor(Math.random() * FRUIT_ICONS.length)];
      if (r < 0.06) {
        kind = 'freeze';
        icon = '❄️';
      } else if (r < 0.11) {
        kind = 'frenzy';
        icon = '🌟';
      } else if (r < 0.22) {
        kind = 'coin';
        icon = '🪙';
      }
      this.fruits.push({
        x: spawnMargin + Math.random() * spawnSpan,
        y: this.height + 10,
        vy: launchVy,
        vx: (Math.random() - 0.5) * 3.4 * (this.width / 480),
        r: Math.max(20, Math.min(28, this.width * 0.055)),
        icon,
        sliced: false,
        missed: false,
        kind
      });
    }
    if (this.frenzyTimer <= 0 && Math.random() < 0.0065 * this.scaler.spawnMult * dt * 60) {
      this.bombs.push({
        x: spawnMargin + Math.random() * spawnSpan,
        y: this.height + 10,
        vy: launchVy,
        vx: (Math.random() - 0.5) * 2.4 * (this.width / 480),
        r: 20
      });
    }

    for (const f of this.fruits) {
      f.x += f.vx * deltaMult;
      f.y += (f.vy + 0.5 * gravityPull) * deltaMult;
      f.vy += gravityPull;
      if (!f.missed && !f.sliced && f.y > this.height + 24 && f.vy > 0) {
        f.missed = true;
        if (f.kind === 'fruit' && this.frenzyTimer <= 0) {
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
    for (const b of this.bombs) {
      b.x += b.vx * deltaMult;
      b.y += (b.vy + 0.5 * gravityPull) * deltaMult;
      b.vy += gravityPull;
    }
    for (let i = this.slashTrail.length - 1; i >= 0; i--) {
      this.slashTrail[i].life -= dt;
      if (this.slashTrail[i].life <= 0) this.slashTrail.splice(i, 1);
    }
    this.fruits = this.fruits.filter((f) => f.y < this.height + 50 && !f.sliced);
    this.bombs = this.bombs.filter((b) => b.y < this.height + 50);
  }

  draw(): void {
    if (this.level >= 50) this.ctx.fillStyle = '#000000';
    else if (this.freezeTimer > 0) this.ctx.fillStyle = '#0e344f';
    else if (this.frenzyTimer > 0) this.ctx.fillStyle = '#4c1d95';
    else if (this.level >= 30) this.ctx.fillStyle = '#0d0d2b';
    else if (this.level >= 20) this.ctx.fillStyle = '#2b1055';
    else if (this.level >= 10) this.ctx.fillStyle = '#5c1d1d';
    else this.ctx.fillStyle = '#2c3e50';
    this.ctx.fillRect(0, 0, this.width, this.height);

    for (const f of this.fruits) {
      if (f.sliced) continue;
      EmojiCache.draw(this.ctx, f.icon, f.x, f.y, Math.round(f.r * 1.45));
    }
    for (const b of this.bombs) {
      this.ctx.fillStyle = '#111';
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.ctx.fill();
      EmojiCache.draw(this.ctx, '💣', b.x, b.y, 28);
    }
    if (this.slashTrail.length > 1) {
      this.ctx.lineCap = 'round';
      for (let i = 1; i < this.slashTrail.length; i++) {
        const p0 = this.slashTrail[i - 1];
        const p1 = this.slashTrail[i];
        const alpha = Math.max(0, p1.life / 0.18);
        this.ctx.strokeStyle = this.freezeTimer > 0 ? `rgba(56, 189, 248, ${alpha})` : `rgba(132, 250, 176, ${alpha})`;
        this.ctx.lineWidth = Math.max(2, alpha * 9);
        this.ctx.beginPath();
        this.ctx.moveTo(p0.x, p0.y);
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.stroke();
      }
    }

    // Native strike/status banner at top-center
    const badgeY = this.width < 460 ? 52 : 12;
    this.ctx.fillStyle = 'rgba(0,0,0,0.55)';
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 78, badgeY, 156, 28, 14);
    this.ctx.fill();
    const misses = Math.max(0, this.maxLives - this.lives);
    let badge = '';
    for (let i = 0; i < this.maxLives; i++) badge += i < misses ? '❌' : '🍉';
    if (this.freezeTimer > 0) badge += ' ❄️';
    else if (this.frenzyTimer > 0) badge += ' 🌟';
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 13px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(badge, this.width / 2, badgeY + 19);
    this.ctx.textAlign = 'left';
  }

  handleSlice(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.slashTrail.push({ x, y, life: 0.18 });
    if (this.slashTrail.length > 18) this.slashTrail.shift();

    let hitFruit = false;
    for (const f of this.fruits) {
      if (!f.sliced && Math.hypot(x - f.x, y - f.y) < f.r + 24) {
        f.sliced = true;
        this.comboCount++;
        this.comboTimer = 0.45;
        const mult = this.comboCount >= 3 ? 2 : 1;

        if (f.kind === 'freeze') {
          this.freezeTimer = 5;
          ArcadeAudio.play('levelup');
          this.spawnPopup(f.x, f.y - 14, '❄️ FREEZE!', '#38bdf8');
        } else if (f.kind === 'frenzy') {
          this.frenzyTimer = 5;
          ArcadeAudio.play('combo');
          this.spawnPopup(f.x, f.y - 14, '🌟 FRENZY!', '#facc15');
        } else {
          ArcadeAudio.play(f.kind === 'coin' ? 'coin' : 'slash');
          const pts = (f.kind === 'coin' ? 15 : 6) * mult;
          this.score += pts;
          addCoins(f.kind === 'coin' ? 5 : mult);
          addXp(4);
          this.spawnPopup(f.x, f.y - 12, this.comboCount >= 3 ? `+${pts} x${this.comboCount}!` : `+${pts}`, '#84fab0');
        }
        updateInGameHud(this.score, this.level, 2);
        this.spawnParticles(f.x, f.y, f.kind === 'coin' ? '#ffd700' : '#ff6b6b', 10, 170);
        hitFruit = true;
      }
    }
    if (!hitFruit) {
      for (const b of this.bombs) {
        if (Math.hypot(x - b.x, y - b.y) < b.r + 14) {
          ArcadeAudio.play('explosion');
          this.triggerShake(10, 0.25);
          this.lives = 0;
          updateHealthDisplay(this.lives, this.maxLives);
          this.gameOverSequence();
          return;
        }
      }
    }
  }
}
