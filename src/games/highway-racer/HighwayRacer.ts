import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface TrafficCar {
  lane: number;
  y: number;
  car: string;
  hit: boolean;
  nearMissed?: boolean;
}

interface RoadCoin {
  lane: number;
  y: number;
  label: string;
  val: number;
  kind: 'coin' | 'bag' | 'nitro';
  collected: boolean;
}

export class HighwayRacer extends BaseGame {
  laneCount = 3;
  currentLane = 1;
  visualLane = 1;
  traffic: TrafficCar[] = [];
  coins: RoadCoin[] = [];
  spawnTimer = 0;
  roadOffset = 0;
  invulnerableTime = 0;
  nitroTimer = 0;

  init(): void {
    this.maxLives = 3;
    this.lives = 3;
    this.laneCount = 3;
    this.currentLane = 1;
    this.visualLane = 1;
    this.traffic = [];
    this.coins = [];
    this.spawnTimer = 0;
    this.roadOffset = 0;
    this.invulnerableTime = 0;
    this.nitroTimer = 0;
  }

  moveLeft(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.currentLane > 0) {
      this.currentLane--;
      this.invulnerableTime = Math.max(this.invulnerableTime, 0.22);
      ArcadeAudio.play('dash');
    }
  }

  moveRight(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.currentLane < this.laneCount - 1) {
      this.currentLane++;
      this.invulnerableTime = Math.max(this.invulnerableTime, 0.22);
      ArcadeAudio.play('dash');
    }
  }

  update(dt: number): void {
    if (this.gameOver) return;
    const deltaMult = dt * 60;
    this.visualLane += (this.currentLane - this.visualLane) * (1 - Math.exp(-20 * dt));
    if (Math.abs(this.currentLane - this.visualLane) < 0.005) this.visualLane = this.currentLane;
    if (this.invulnerableTime > 0) this.invulnerableTime = Math.max(0, this.invulnerableTime - dt);
    if (this.nitroTimer > 0) this.nitroTimer = Math.max(0, this.nitroTimer - dt);

    const hScale = Math.max(0.7, Math.min(1.25, this.height / 700));
    const nitroMult = this.nitroTimer > 0 ? 1.55 : 1;
    const scrollSpeed = (6.0 + this.level * 0.5) * this.scaler.speedMult * hScale * nitroMult * deltaMult;
    this.roadOffset = (this.roadOffset + scrollSpeed) % 40;
    this.spawnTimer += deltaMult;

    if (this.spawnTimer > 45 / (this.scaler.spawnMult * nitroMult)) {
      this.spawnTimer = 0;
      if (Math.random() < 0.68) {
        const cars = ['🚗', '🚘', '🛻', '🚚', '🚌'];
        this.traffic.push({
          lane: Math.floor(Math.random() * this.laneCount),
          y: -60,
          car: cars[Math.floor(Math.random() * cars.length)],
          hit: false
        });
      } else {
        const occupied = this.traffic.filter((t) => t.y < 120).map((t) => t.lane);
        const valid = [0, 1, 2].filter((l) => !occupied.includes(l));
        if (valid.length > 0) {
          const r = Math.random();
          const kind: RoadCoin['kind'] = r < 0.16 ? 'nitro' : r < 0.34 ? 'bag' : 'coin';
          this.coins.push({
            lane: valid[Math.floor(Math.random() * valid.length)],
            y: -40,
            label: kind === 'nitro' ? '⚡' : kind === 'bag' ? '💰' : '🪙',
            val: kind === 'bag' ? 5 : 1,
            kind,
            collected: false
          });
        }
      }
    }

    const roadWidth = Math.min(this.width * 0.88, Math.max(230, Math.min(420, this.width * 0.6)));
    const roadX = (this.width - roadWidth) / 2;
    const laneWidth = roadWidth / this.laneCount;
    const playerYCenter = this.height - Math.max(92, Math.min(138, this.height * 0.18));

    for (const c of this.coins) {
      c.y += scrollSpeed;
      if (!c.collected && c.lane === this.currentLane && Math.abs(c.y - 14 - playerYCenter) < 28) {
        c.collected = true;
        const cx = roadX + c.lane * laneWidth + laneWidth / 2;
        if (c.kind === 'nitro') {
          this.nitroTimer = 4.5;
          ArcadeAudio.play('levelup');
          this.spawnPopup(cx, c.y - 14, '⚡ NITRO SURGE!', '#38bdf8');
        } else {
          ArcadeAudio.play('coin');
          this.spawnPopup(cx, c.y - 14, `+${c.val}🪙`, '#ffd700');
        }
        this.score += c.kind === 'nitro' ? 35 : 15;
        addCoins(c.val);
        addXp(6);
        updateInGameHud(this.score, this.level, 5);
        this.spawnParticles(cx, c.y, c.kind === 'nitro' ? '#38bdf8' : '#ffd700', 8, 130);
      }
    }

    for (const t of this.traffic) {
      t.y += scrollSpeed;
      const laneDist = Math.abs(t.lane - this.currentLane);
      if (!t.hit && !t.nearMissed && laneDist === 1 && Math.abs(t.y - playerYCenter) < 18) {
        t.nearMissed = true;
        this.score += 20;
        addXp(3);
        updateInGameHud(this.score, this.level, 5);
        this.spawnPopup(
          roadX + this.visualLane * laneWidth + laneWidth / 2,
          playerYCenter - 26,
          '+20 NEAR MISS!',
          '#84fab0'
        );
      }
      if (!t.hit && t.lane === this.currentLane && Math.abs(t.y - 18 - playerYCenter) < 22) {
        t.hit = true;
        if (this.nitroTimer > 0) {
          ArcadeAudio.play('explosion');
          this.score += 30;
          updateInGameHud(this.score, this.level, 5);
          this.spawnParticles(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '#38bdf8', 12, 180);
          this.spawnPopup(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '💥 SMASH +30!', '#38bdf8');
          continue;
        }
        if (this.invulnerableTime <= 0) {
          this.lives--;
          this.invulnerableTime = 0.7;
          ArcadeAudio.play('hurt');
          this.triggerShake(8, 0.18);
          this.spawnParticles(roadX + t.lane * laneWidth + laneWidth / 2, t.y, '#ff6b6b', 12, 180);
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) {
            this.gameOverSequence();
            return;
          }
        }
      }
    }
    this.traffic = this.traffic.filter((t) => t.y < this.height + 60 && !t.hit);
    this.coins = this.coins.filter((c) => c.y < this.height + 60 && !c.collected);
  }

  draw(): void {
    const isNoir = this.level >= 50;
    this.ctx.fillStyle = isNoir
      ? '#000000'
      : this.level >= 30
        ? '#0d0d2b'
        : this.level >= 20
          ? '#2b1055'
          : this.level >= 10
            ? '#8b2626'
            : '#228B22';
    this.ctx.fillRect(0, 0, this.width, this.height);
    const roadWidth = Math.min(this.width * 0.88, Math.max(230, Math.min(420, this.width * 0.6)));
    const roadX = (this.width - roadWidth) / 2;
    const laneWidth = roadWidth / this.laneCount;
    const playerYCenter = this.height - Math.max(92, Math.min(138, this.height * 0.18));

    this.ctx.fillStyle = isNoir ? '#111111' : '#333333';
    this.ctx.fillRect(roadX, 0, roadWidth, this.height);
    this.ctx.strokeStyle = this.nitroTimer > 0 ? '#38bdf8' : isNoir ? '#ffffff' : '#f1c40f';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(roadX, 0, roadWidth, this.height);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 20]);
    this.ctx.lineDashOffset = -this.roadOffset;
    for (let i = 1; i < this.laneCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(roadX + i * laneWidth, 0);
      this.ctx.lineTo(roadX + i * laneWidth, this.height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
    for (const t of this.traffic) {
      if (!t.hit) EmojiCache.draw(this.ctx, t.car, roadX + t.lane * laneWidth + laneWidth / 2, t.y - 12, 36);
    }
    for (const c of this.coins) {
      if (!c.collected) EmojiCache.draw(this.ctx, c.label, roadX + c.lane * laneWidth + laneWidth / 2, c.y - 10, 28);
    }
    if (this.invulnerableTime <= 0 || Math.floor(this.invulnerableTime * 16) % 2 === 0) {
      const playerX = roadX + this.visualLane * laneWidth + laneWidth / 2;
      if (this.nitroTimer > 0) {
        this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerYCenter + 8, 28, 0, Math.PI * 2);
        this.ctx.fill();
      }
      EmojiCache.draw(this.ctx, '🏎️', playerX, playerYCenter, 38, (this.currentLane - this.visualLane) * 0.28);
    }

    // Top-center compact shield/lives badge
    const badgeY = this.width < 460 ? 52 : 12;
    this.ctx.fillStyle = 'rgba(12,18,28,0.72)';
    this.ctx.beginPath();
    this.ctx.roundRect(this.width / 2 - 74, badgeY, 148, 28, 14);
    this.ctx.fill();
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 12px system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    const hearts = '🚘'.repeat(Math.max(0, this.lives)) + '💥'.repeat(Math.max(0, this.maxLives - this.lives));
    const nitroTag = this.nitroTimer > 0 ? ` ⚡${this.nitroTimer.toFixed(1)}s` : '';
    this.ctx.fillText(`${hearts}${nitroTag}`, this.width / 2, badgeY + 18);
    this.ctx.textAlign = 'left';
  }
}
