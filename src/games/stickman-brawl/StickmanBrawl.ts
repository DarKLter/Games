import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface FloorPlatform {
  floor: number;
  x: number;
  y: number;
  w: number;
}

interface BrawlEnemy {
  x: number;
  y: number;
  vy: number;
  hp: number;
  maxHp: number;
  cd: number;
  jumpCd: number;
  chargeCd: number;
  flash: number;
  color: string;
  isBoss?: boolean;
  name?: string;
}

interface BrawlCrate {
  x: number;
  y: number;
  kind: 'heal' | 'coin';
}

export class StickmanBrawl extends BaseGame {
  worldW = 2200;
  groundY = 560;
  floorCount = 6;
  platforms: FloorPlatform[] = [];
  crates: BrawlCrate[] = [];
  camX = 0;
  camY = 0;
  hero = {
    x: 420,
    y: 560,
    vy: 0,
    facing: 1,
    moveDir: 0,
    atkTimer: 0,
    combo: 0,
    hitCd: 0,
    jumpsLeft: 2,
    dropTimer: 0
  };
  enemies: BrawlEnemy[] = [];
  wave = 1;
  animClock = 0;

  init(): void {
    this.wave = 1;
    this.animClock = 0;
    this.maxLives = 5;
    this.lives = 5;
    this.buildArena();
    this.hero = {
      x: this.worldW * 0.5,
      y: this.groundY,
      vy: 0,
      facing: 1,
      moveDir: 0,
      atkTimer: 0,
      combo: 0,
      hitCd: 1.1,
      jumpsLeft: 2,
      dropTimer: 0
    };
    this.camX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
    this.camY = 0;
    this.enemies = [];
    this.spawnWave();
  }

  buildArena(): void {
    this.worldW = Math.max(2200, this.width * 2);
    this.groundY = Math.round(this.height * (this.height > this.width ? 0.78 : 0.83));
    this.floorCount = Math.min(7, 5 + Math.floor((this.wave + 1) / 2));
    this.platforms = [{ floor: 1, x: 0, y: this.groundY, w: this.worldW }];
    const step = 104;
    for (let f = 2; f <= this.floorCount; f++) {
      const fy = this.groundY - (f - 1) * step;
      const segs = f % 2 === 0 ? 4 : 3;
      const segW = Math.round(this.worldW / (segs + 1.1));
      for (let s = 0; s < segs; s++) {
        const sx = Math.round(((s + 0.5) / segs) * (this.worldW - segW));
        this.platforms.push({ floor: f, x: sx, y: fy, w: segW });
      }
    }
  }

  override resize(): void {
    const prevGroundY = this.groundY;
    const prevWorldW = this.worldW || 1;
    super.resize();
    if (this.platforms.length > 0) {
      this.buildArena();
      const dy = this.groundY - prevGroundY;
      const sx = this.worldW / prevWorldW;
      this.hero.x = Math.max(24, Math.min(this.worldW - 24, this.hero.x * sx));
      this.hero.y = Math.min(this.groundY, this.hero.y + dy);
      for (const e of this.enemies) {
        e.x = Math.max(20, Math.min(this.worldW - 20, e.x * sx));
        e.y = Math.min(this.groundY, e.y + dy);
      }
      for (const cr of this.crates) {
        cr.x = Math.max(20, Math.min(this.worldW - 20, cr.x * sx));
        cr.y = Math.min(this.groundY - 16, cr.y + dy);
      }
      this.camX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
    }
    if (this.isPaused) this.draw();
  }

  spawnWave(): void {
    this.buildArena();
    this.hero.hitCd = Math.max(this.hero.hitCd, 1.0);
    const count = 3 + this.wave;
    for (let i = 0; i < count; i++) {
      const plat = this.platforms[Math.floor(Math.random() * this.platforms.length)];
      let sx = plat.x + Math.random() * Math.max(40, plat.w - 40);
      if (Math.abs(sx - this.hero.x) < 200) {
        sx = this.hero.x < this.worldW * 0.5 ? this.hero.x + 320 : this.hero.x - 320;
      }
      const hp = 50 + this.wave * 18;
      this.enemies.push({
        x: Math.max(40, Math.min(this.worldW - 40, sx)),
        y: plat.y,
        vy: 0,
        hp,
        maxHp: hp,
        cd: 0.85,
        jumpCd: 1.0 + Math.random() * 1.4,
        chargeCd: 4,
        flash: 0,
        color: i % 3 === 0 ? '#f97316' : '#ef4444'
      });
    }

    // Spawn Boss Fighter every wave >= 2 (plus mini-boss on wave 1 final or wave >= 2)
    if (this.wave >= 2) {
      const bossHp = 220 + this.wave * 95;
      const bossX = this.hero.x < this.worldW * 0.5 ? this.worldW - 220 : 220;
      this.enemies.push({
        x: bossX,
        y: this.groundY,
        vy: 0,
        hp: bossHp,
        maxHp: bossHp,
        cd: 1.1,
        jumpCd: 1.8,
        chargeCd: 3.5,
        flash: 0,
        color: '#facc15',
        isBoss: true,
        name: this.wave % 2 === 0 ? '👑 SHADOW TITAN BOSS' : '🤖 CYBER SHOGUN BOSS'
      });
      ArcadeAudio.play('warHorn');
      this.spawnPopup(this.width / 2, this.height * 0.28, '⚠️ BOSS ENTERED THE ARENA!', '#facc15');
    }

    // Spawn 2 Heal/Coin Crates
    this.crates = [];
    for (let k = 0; k < 2; k++) {
      const p = this.platforms[Math.floor(Math.random() * this.platforms.length)];
      this.crates.push({
        x: p.x + p.w * (0.25 + Math.random() * 0.5),
        y: p.y - 16,
        kind: k === 0 ? 'heal' : 'coin'
      });
    }
  }

  override releaseInputs(): void {
    this.hero.moveDir = 0;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  setMove(dir: number): void {
    if (this.gameOver || this.isPaused) {
      this.hero.moveDir = 0;
      return;
    }
    this.hero.moveDir = dir;
    if (dir) this.hero.facing = dir;
  }

  jump(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.hero.jumpsLeft > 0) {
      this.hero.vy = -530;
      this.hero.jumpsLeft--;
      this.hero.dropTimer = 0;
      ArcadeAudio.play('jump');
    }
  }

  dropDown(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.hero.y < this.groundY - 10) {
      this.hero.dropTimer = 0.24;
      this.hero.vy = Math.max(this.hero.vy, 115);
      ArcadeAudio.play('slide');
    }
  }

  attack(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.hero.atkTimer > 0.05) return;
    this.hero.atkTimer = 0.24;
    this.hero.combo = (this.hero.combo + 1) % 3;
    ArcadeAudio.play('punch');
    let hitAny = false;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const dx = e.x - this.hero.x;
      const dy = Math.abs(e.y - this.hero.y);
      const reach = e.isBoss ? 96 : 84;
      if (Math.abs(dx) < reach && dy < 66 && dx * this.hero.facing >= -24) {
        const dmg = this.hero.combo === 2 ? 40 : 25;
        e.hp -= dmg;
        e.flash = 0.14;
        e.x += this.hero.facing * (e.isBoss ? 12 : 28);
        hitAny = true;
        this.spawnParticles(e.x - this.camX, e.y - 38 - this.camY, '#ffd700', 8, 160);
        if (e.hp <= 0) {
          this.enemies.splice(i, 1);
          const pts = e.isBoss ? 250 : 60;
          const coinAdd = e.isBoss ? 10 : 2;
          this.score += pts;
          addCoins(coinAdd);
          ArcadeAudio.play(e.isBoss ? 'win' : 'ko');
          addXp(e.isBoss ? 28 : 8);
          this.spawnPopup(
            e.x - this.camX,
            e.y - 70 - this.camY,
            e.isBoss ? `🏆 BOSS KO! +${pts}` : '💥 KO! +60',
            '#ffd700'
          );
        }
      }
    }

    if (hitAny) {
      this.triggerShake(5, 0.12);
      updateInGameHud(this.score, this.level, 17);
    }
    if (this.enemies.length === 0) {
      this.wave++;
      this.level++;
      ArcadeAudio.play('levelup');
      this.spawnPopup(this.width / 2, this.height * 0.35, `🏢 WAVE ${this.wave} (${this.floorCount} FLOORS)`, '#84fab0');
      this.spawnWave();
    }
  }

  onPointerDown(x: number): void {
    if (this.gameOver || this.isPaused) return;
    if (x < this.width * 0.3) this.setMove(-1);
    else if (x > this.width * 0.7) this.setMove(1);
    else this.attack();
  }

  onPointerUp(): void {
    this.setMove(0);
  }

  private resolveLanding(ent: { x: number; y: number; vy: number }, prevY: number, allowDrop: boolean): boolean {
    if (ent.vy >= 0) {
      for (const p of this.platforms) {
        if (allowDrop && p.floor > 1) continue;
        if (ent.x >= p.x - 10 && ent.x <= p.x + p.w + 10 && prevY <= p.y + 6 && ent.y >= p.y) {
          ent.y = p.y;
          ent.vy = 0;
          return true;
        }
      }
    }
    if (ent.y > this.groundY) {
      ent.y = this.groundY;
      ent.vy = 0;
      return true;
    }
    return false;
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;
    this.animClock += dt;

    if (this.hero.dropTimer > 0) this.hero.dropTimer -= dt;
    const prevHeroY = this.hero.y;
    this.hero.x = Math.max(24, Math.min(this.worldW - 24, this.hero.x + this.hero.moveDir * 275 * dt));
    this.hero.vy += 1100 * dt;
    this.hero.y += this.hero.vy * dt;

    if (this.resolveLanding(this.hero, prevHeroY, this.hero.dropTimer > 0)) {
      this.hero.jumpsLeft = 2;
    }

    if (this.hero.atkTimer > 0) this.hero.atkTimer -= dt;
    if (this.hero.hitCd > 0) this.hero.hitCd -= dt;

    // Pick up crates
    for (let i = this.crates.length - 1; i >= 0; i--) {
      const cr = this.crates[i];
      if (Math.hypot(cr.x - this.hero.x, cr.y - (this.hero.y - 26)) < 38) {
        this.crates.splice(i, 1);
        if (cr.kind === 'heal') {
          this.lives = Math.min(this.maxLives, this.lives + 1);
          updateHealthDisplay(this.lives, this.maxLives);
          ArcadeAudio.play('save');
          this.spawnPopup(this.hero.x - this.camX, this.hero.y - 60 - this.camY, '❤️ +1 HP!', '#84fab0');
        } else {
          addCoins(5);
          this.score += 50;
          ArcadeAudio.play('coin');
          updateInGameHud(this.score, this.level, 17);
          this.spawnPopup(this.hero.x - this.camX, this.hero.y - 60 - this.camY, '+5🪙 CRATE!', '#facc15');
        }
      }
    }

    // Smooth 2D camera across expanded 2200px x 6-7 floor arena
    const targetCamX = Math.max(0, Math.min(this.worldW - this.width, this.hero.x - this.width / 2));
    const targetCamY = Math.min(0, this.hero.y - this.height * 0.65);
    this.camX += (targetCamX - this.camX) * (1 - Math.exp(-8 * dt));
    this.camY += (targetCamY - this.camY) * (1 - Math.exp(-7 * dt));

    for (const e of this.enemies) {
      if (e.flash > 0) e.flash -= dt;
      const prevEy = e.y;
      e.vy += 1100 * dt;
      e.y += e.vy * dt;
      const landed = this.resolveLanding(e, prevEy, false);

      e.jumpCd -= dt;
      if (landed && e.jumpCd <= 0 && this.hero.y < e.y - 60) {
        e.vy = -500;
        e.jumpCd = e.isBoss ? 1.1 : 1.5 + Math.random();
      }

      const dx = this.hero.x - e.x;
      if (e.isBoss) {
        e.chargeCd -= dt;
        if (e.chargeCd <= 0 && Math.abs(dx) < 340 && Math.abs(this.hero.y - e.y) < 75) {
          e.chargeCd = 3.6;
          e.x += Math.sign(dx) * 95;
          ArcadeAudio.play('punch');
        }
      }

      if (Math.abs(dx) > (e.isBoss ? 52 : 42)) {
        const moveSpd = (e.isBoss ? 115 : 98 + this.wave * 9) * this.scaler.speedMult;
        e.x += Math.sign(dx) * moveSpd * dt;
        e.x = Math.max(20, Math.min(this.worldW - 20, e.x));
      } else if (Math.abs(this.hero.y - e.y) < 52) {
        e.cd -= dt;
        if (e.cd <= 0) {
          e.cd = Math.max(0.65, (e.isBoss ? 1.1 : 1.3) - this.wave * 0.07);
          if (this.hero.hitCd <= 0) {
            this.hero.hitCd = 0.95;
            this.lives--;
            ArcadeAudio.play('hurt');
            this.triggerShake(e.isBoss ? 10 : 7, 0.18);
            updateHealthDisplay(this.lives, this.maxLives);
            if (this.lives <= 0) {
              this.gameOverSequence(false);
              return;
            }
          }
        }
      }
    }
  }

  getCurrentFloor(): number {
    return Math.min(this.floorCount, Math.max(1, Math.round((this.groundY - this.hero.y) / 104) + 1));
  }

  drawStickman(x: number, y: number, color: string, facing: number, punching: boolean, walkPhase: number, scale = 1): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -58, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, -22);
    ctx.moveTo(0, -22);
    ctx.lineTo(-10 + walkPhase, 0);
    ctx.moveTo(0, -22);
    ctx.lineTo(10 - walkPhase, 0);
    ctx.moveTo(0, -42);
    ctx.lineTo(facing * (punching ? 34 : 14), -40);
    ctx.stroke();
    ctx.restore();
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    // Arena pillar grid lines so camera scrolling is immediately readable
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 2;
    for (let x = 200; x < this.worldW; x += 200) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY - this.floorCount * 104);
      ctx.lineTo(x, this.groundY);
      ctx.stroke();
    }

    for (const p of this.platforms) {
      if (p.floor === 1) {
        ctx.fillStyle = '#312e81';
        ctx.fillRect(0, p.y, this.worldW, this.height + 240);
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(0, p.y, this.worldW, 4);
      } else {
        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, 12, 6);
        ctx.fill();
        ctx.fillStyle = '#84fab0';
        ctx.fillRect(p.x + 6, p.y, p.w - 12, 3);
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText(`F${p.floor}`, p.x + 6, p.y - 4);
      }
    }

    for (const cr of this.crates) {
      EmojiCache.draw(ctx, cr.kind === 'heal' ? '🧰' : '💰', cr.x, cr.y, 26);
    }

    for (const e of this.enemies) {
      const sc = e.isBoss ? 1.45 : 1;
      this.drawStickman(
        e.x,
        e.y,
        e.flash > 0 ? '#ffffff' : e.color,
        Math.sign(this.hero.x - e.x) || 1,
        false,
        Math.sin(this.animClock * 10) * 5,
        sc
      );
      if (e.isBoss) {
        EmojiCache.draw(ctx, '👑', e.x, e.y - 98, 22);
      }
      const bw = e.isBoss ? 54 : 36;
      const barY = e.y - (e.isBoss ? 114 : 78);
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - bw / 2, barY, bw, 5);
      ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
      ctx.fillRect(e.x - bw / 2, barY, bw * Math.max(0, e.hp / e.maxHp), 5);
    }

    const wp = this.hero.moveDir ? Math.sin(this.animClock * 20) * 8 : 0;
    this.drawStickman(this.hero.x, this.hero.y, '#84fab0', this.hero.facing, this.hero.atkTimer > 0.05, wp);
    if (this.hero.atkTimer > 0.08) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.hero.x + this.hero.facing * 24, this.hero.y - 38, 18, -0.7, 0.7);
      ctx.stroke();
    }
    ctx.restore();

    // Boss HP banner if active boss exists
    const activeBoss = this.enemies.find((e) => e.isBoss);
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const topY = isCompactLand ? 24 : this.width < 460 ? 60 : 50;
    ctx.font = '800 11.5px system-ui, sans-serif';
    ctx.fillStyle = '#84fab0';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🏢 Floor ${this.getCurrentFloor()}/${this.floorCount} · Wave ${this.wave} · Foes: ${this.enemies.length}`,
      this.width / 2,
      topY
    );
    if (activeBoss) {
      const mw = Math.min(200, this.width * 0.5);
      const bx = (this.width - mw) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(bx, topY + 8, mw, 10);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bx, topY + 8, mw * Math.max(0, activeBoss.hp / activeBoss.maxHp), 10);
    }

    // Compact Arena Radar Minimap (below top-right settings gear)
    const mapW = 86;
    const mapH = 26;
    const mx = this.width - mapW - 12;
    const my = 62;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = 'rgba(132, 250, 176, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(mx, my, mapW, mapH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#84fab0';
    ctx.fillRect(mx + (this.hero.x / this.worldW) * (mapW - 4), my + mapH - 7, 4, 4);
    for (const e of this.enemies) {
      ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
      ctx.fillRect(mx + (e.x / this.worldW) * (mapW - 4), my + 6, e.isBoss ? 5 : 3, e.isBoss ? 5 : 3);
    }
    ctx.textAlign = 'left';
  }
}
