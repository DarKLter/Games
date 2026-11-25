import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

interface PlatformRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  dmg: number;
  color: string;
  life: number;
  isRocket?: boolean;
}

interface Grenade {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuse: number;
  fromPlayer: boolean;
}

interface MilitiaEnemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shootCd: number;
  jetTimer: number;
  flash: number;
  isBoss?: boolean;
}

interface ArenaPickup {
  x: number;
  y: number;
  kind: 'shotgun' | 'laser' | 'rocket' | 'medkit' | 'grenade';
  ttl: number;
}

export class MiniMilitia extends BaseGame {
  worldW = 2800;
  worldH = 1260;
  platforms: PlatformRect[] = [];
  player = {
    x: 360,
    y: 1120,
    vx: 0,
    vy: 0,
    moveDir: 0,
    jetpack: false,
    fuel: 100,
    aimAngle: 0,
    firing: false,
    fireCd: 0,
    weapon: 'rifle' as 'rifle' | 'shotgun' | 'laser' | 'rocket',
    weaponAmmo: 0,
    grenades: 3,
    hitCd: 0
  };
  bullets: Bullet[] = [];
  grenades: Grenade[] = [];
  enemies: MilitiaEnemy[] = [];
  pickups: ArenaPickup[] = [];
  camX = 0;
  camY = 0;
  wave = 1;
  spawnTimer = 1.0;
  pickupTimer = 4.0;
  pointerScreen: { x: number; y: number } | null = null;

  init(): void {
    this.worldW = 2800;
    this.worldH = 1260;
    this.platforms = [
      { x: 0, y: 1200, w: this.worldW, h: 60 },
      { x: 140, y: 1020, w: 340, h: 18 },
      { x: 680, y: 940, w: 400, h: 18 },
      { x: 1280, y: 1000, w: 360, h: 18 },
      { x: 1840, y: 920, w: 380, h: 18 },
      { x: 2340, y: 1020, w: 320, h: 18 },
      { x: 320, y: 740, w: 340, h: 18 },
      { x: 960, y: 690, w: 460, h: 18 },
      { x: 1640, y: 720, w: 400, h: 18 },
      { x: 2220, y: 740, w: 340, h: 18 },
      { x: 600, y: 470, w: 360, h: 18 },
      { x: 1240, y: 420, w: 420, h: 18 },
      { x: 1900, y: 480, w: 360, h: 18 },
      { x: 1120, y: 220, w: 560, h: 18 }
    ];
    this.player = {
      x: 360,
      y: 1140,
      vx: 0,
      vy: 0,
      moveDir: 0,
      jetpack: false,
      fuel: 100,
      aimAngle: 0,
      firing: false,
      fireCd: 0,
      weapon: 'rifle',
      weaponAmmo: 0,
      grenades: 3,
      hitCd: 0
    };
    this.bullets = [];
    this.grenades = [];
    this.enemies = [];
    this.pickups = [];
    this.wave = 1;
    this.maxLives = 5;
    this.lives = 5;
    this.spawnTimer = 0.5;
    this.pickupTimer = 3.0;
    this.pointerScreen = null;
    this.camX = 0;
    this.camY = Math.max(0, this.worldH - this.height);
    for (let i = 0; i < 4; i++) this.spawnEnemy(false);
  }

  override releaseInputs(): void {
    this.player.firing = false;
    this.player.jetpack = false;
    this.player.moveDir = 0;
    this.pointerScreen = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  setMove(dir: number): void {
    if (this.gameOver || this.isPaused) {
      this.player.moveDir = 0;
      return;
    }
    this.player.moveDir = dir;
  }

  setJetpack(on: boolean): void {
    if (!on) {
      this.player.jetpack = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    this.player.jetpack = true;
  }

  throwGrenade(): void {
    if (this.gameOver || this.isPaused || this.player.grenades <= 0) return;
    this.player.grenades--;
    const ang = this.player.aimAngle;
    this.grenades.push({
      x: this.player.x + Math.cos(ang) * 18,
      y: this.player.y - 22 + Math.sin(ang) * 18,
      vx: Math.cos(ang) * 440 + this.player.vx * 0.4,
      vy: Math.sin(ang) * 440 - 160,
      fuse: 1.35,
      fromPlayer: true
    });
    ArcadeAudio.play('slingshot');
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (pressed && (this.gameOver || this.isPaused)) return;
    if (actionKey === 'fire' || actionKey === 'attack') this.player.firing = pressed;
    else if (actionKey === 'action' || actionKey === 'moveUp' || actionKey === 'jump') this.player.jetpack = pressed;
    else if (actionKey === 'grenade' && pressed) this.throwGrenade();
    else if (actionKey === 'left') this.player.moveDir = pressed ? -1 : 0;
    else if (actionKey === 'right') this.player.moveDir = pressed ? 1 : 0;
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.pointerScreen = { x, y };
    this.player.firing = true;
    this.updateAimFromPointer();
  }

  onPointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.pointerScreen = { x, y };
    this.updateAimFromPointer();
  }

  onPointerUp(): void {
    this.player.firing = false;
  }

  private updateAimFromPointer(): void {
    if (!this.pointerScreen) return;
    const wx = this.pointerScreen.x + this.camX;
    const wy = this.pointerScreen.y + this.camY;
    this.player.aimAngle = Math.atan2(wy - (this.player.y - 22), wx - this.player.x);
  }

  private spawnEnemy(isBoss = false): void {
    const x = isBoss
      ? this.player.x < this.worldW * 0.5 ? this.worldW - 240 : 240
      : 120 + Math.random() * (this.worldW - 240);
    const y = isBoss ? 360 : 260 + Math.random() * 820;
    const hp = isBoss ? 240 + this.wave * 95 : 55 + this.wave * 18;
    this.enemies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      hp,
      maxHp: hp,
      shootCd: 0.9 + Math.random() * 0.8,
      jetTimer: 0.4,
      flash: 0,
      isBoss
    });
    if (isBoss) {
      ArcadeAudio.play('warHorn');
      this.spawnPopup(this.width / 2, this.height * 0.3, '🚁 GUNSHIP BOSS INBOUND!', '#facc15');
    }
  }

  private firePlayerWeapon(): void {
    const px = this.player.x + Math.cos(this.player.aimAngle) * 20;
    const py = this.player.y - 22 + Math.sin(this.player.aimAngle) * 20;
    if (this.player.weapon === 'rocket') {
      this.player.fireCd = 0.55;
      const a = this.player.aimAngle;
      this.bullets.push({
        x: px,
        y: py,
        vx: Math.cos(a) * 620,
        vy: Math.sin(a) * 620,
        fromPlayer: true,
        dmg: 65,
        color: '#fb923c',
        life: 1.5,
        isRocket: true
      });
      ArcadeAudio.play('explosion');
      this.player.weaponAmmo--;
    } else if (this.player.weapon === 'shotgun') {
      this.player.fireCd = 0.36;
      for (let k = -2; k <= 2; k++) {
        const a = this.player.aimAngle + k * 0.08;
        this.bullets.push({
          x: px,
          y: py,
          vx: Math.cos(a) * 700,
          vy: Math.sin(a) * 700,
          fromPlayer: true,
          dmg: 18,
          color: '#facc15',
          life: 0.95
        });
      }
      ArcadeAudio.play('shot');
      this.player.weaponAmmo--;
    } else if (this.player.weapon === 'laser') {
      this.player.fireCd = 0.11;
      const a = this.player.aimAngle;
      this.bullets.push({
        x: px,
        y: py,
        vx: Math.cos(a) * 900,
        vy: Math.sin(a) * 900,
        fromPlayer: true,
        dmg: 24,
        color: '#38bdf8',
        life: 1.3
      });
      ArcadeAudio.play('shoot');
      this.player.weaponAmmo--;
    } else {
      this.player.fireCd = 0.16;
      const a = this.player.aimAngle + (Math.random() - 0.5) * 0.04;
      this.bullets.push({
        x: px,
        y: py,
        vx: Math.cos(a) * 740,
        vy: Math.sin(a) * 740,
        fromPlayer: true,
        dmg: 22,
        color: '#fde047',
        life: 1.25
      });
      ArcadeAudio.play('shot');
    }
    if (this.player.weapon !== 'rifle' && this.player.weaponAmmo <= 0) {
      this.player.weapon = 'rifle';
    }
  }

  private resolvePlatforms(ent: { x: number; y: number; vx: number; vy: number }, prevY: number): void {
    for (const p of this.platforms) {
      if (ent.x >= p.x - 10 && ent.x <= p.x + p.w + 10) {
        if (ent.vy >= 0 && prevY <= p.y + 6 && ent.y >= p.y && ent.y <= p.y + p.h + 24) {
          ent.y = p.y;
          ent.vy = 0;
        }
      }
    }
    ent.x = Math.max(20, Math.min(this.worldW - 20, ent.x));
    if (ent.y < 36) {
      ent.y = 36;
      ent.vy = Math.max(0, ent.vy);
    }
    if (ent.y > this.worldH - 60) {
      ent.y = this.worldH - 60;
      ent.vy = 0;
    }
  }

  private explodeSplash(gx: number, gy: number, dmg: number, radius: number): void {
    ArcadeAudio.play('explosion');
    this.triggerShake(10, 0.22);
    this.spawnParticles(gx - this.camX, gy - this.camY, '#fb923c', 22, 240);
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (Math.hypot(e.x - gx, e.y - 20 - gy) < radius) {
        e.hp -= dmg;
        e.flash = 0.2;
        if (e.hp <= 0) this.killEnemy(i);
      }
    }
  }

  private killEnemy(idx: number): void {
    const e = this.enemies[idx];
    this.enemies.splice(idx, 1);
    const pts = e.isBoss ? 260 : 65;
    this.score += pts;
    addCoins(e.isBoss ? 10 : 2);
    addXp(e.isBoss ? 30 : 9);
    ArcadeAudio.play(e.isBoss ? 'win' : 'ko');
    this.spawnParticles(e.x - this.camX, e.y - 20 - this.camY, '#ef4444', 12, 170);
    this.spawnPopup(e.x - this.camX, e.y - 50 - this.camY, e.isBoss ? `🏆 BOSS DOWN! +${pts}` : '💥 +65', '#ffd700');
    if (this.score >= this.wave * 340) {
      this.wave++;
      this.level++;
      this.player.grenades = Math.min(5, this.player.grenades + 1);
      ArcadeAudio.play('levelup');
      this.spawnEnemy(true);
    }
    updateInGameHud(this.score, this.level, 22);
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;
    this.updateAimFromPointer();

    this.player.vx = this.player.moveDir * 270;
    if (this.player.jetpack && this.player.fuel > 0) {
      this.player.vy = Math.max(-330, this.player.vy - 1280 * dt);
      this.player.fuel = Math.max(0, this.player.fuel - 32 * dt);
      if (Math.random() < dt * 12) ArcadeAudio.play('jetpack');
    } else {
      this.player.vy += 880 * dt;
      this.player.fuel = Math.min(100, this.player.fuel + 26 * dt);
    }

    const prevPy = this.player.y;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;
    this.resolvePlatforms(this.player, prevPy);

    if (this.player.hitCd > 0) this.player.hitCd -= dt;
    if (this.player.fireCd > 0) this.player.fireCd -= dt;
    if (this.player.firing && this.player.fireCd <= 0) {
      this.firePlayerWeapon();
    }

    const targetCamX = Math.max(0, Math.min(this.worldW - this.width, this.player.x - this.width / 2));
    const targetCamY = Math.max(0, Math.min(this.worldH - this.height, this.player.y - this.height * 0.58));
    const camAlpha = 1 - Math.exp(-8 * dt);
    this.camX += (targetCamX - this.camX) * camAlpha;
    this.camY += (targetCamY - this.camY) * camAlpha;

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.enemies.length < Math.min(10, 4 + this.wave)) {
      this.spawnEnemy(false);
      this.spawnTimer = Math.max(1.5, 3.2 - this.wave * 0.22) / this.scaler.spawnMult;
    }

    this.pickupTimer -= dt;
    if (this.pickupTimer <= 0 && this.pickups.length < 6) {
      this.pickupTimer = 5.5;
      const kinds: ArenaPickup['kind'][] = ['shotgun', 'laser', 'rocket', 'medkit', 'grenade'];
      this.pickups.push({
        x: 160 + Math.random() * (this.worldW - 320),
        y: 260 + Math.random() * 820,
        kind: kinds[Math.floor(Math.random() * kinds.length)],
        ttl: 18
      });
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.ttl -= dt;
      if (Math.hypot(pk.x - this.player.x, pk.y - (this.player.y - 22)) < 38) {
        if (pk.kind === 'medkit') {
          this.lives = Math.min(this.maxLives, this.lives + 1);
          updateHealthDisplay(this.lives, this.maxLives);
          ArcadeAudio.play('save');
        } else if (pk.kind === 'grenade') {
          this.player.grenades = Math.min(5, this.player.grenades + 2);
          ArcadeAudio.play('reload');
        } else {
          this.player.weapon = pk.kind;
          this.player.weaponAmmo = pk.kind === 'laser' ? 35 : pk.kind === 'rocket' ? 8 : 18;
          ArcadeAudio.play('reload');
        }
        this.spawnPopup(pk.x - this.camX, pk.y - this.camY, pk.kind.toUpperCase(), '#84fab0');
        this.pickups.splice(i, 1);
      } else if (pk.ttl <= 0) {
        this.pickups.splice(i, 1);
      }
    }

    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      const prevGy = g.y;
      g.vy += 680 * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      for (const p of this.platforms) {
        if (g.x >= p.x && g.x <= p.x + p.w && g.vy >= 0 && prevGy <= p.y + 4 && g.y >= p.y && g.y <= p.y + p.h + 12) {
          g.y = p.y;
          if (Math.abs(g.vy) < 42) {
            g.vy = 0;
            g.vx *= Math.exp(-12 * dt);
          } else {
            g.vy *= -0.48;
            g.vx *= 0.78;
          }
          break;
        }
      }
      g.fuse -= dt;
      if (g.fuse <= 0) {
        this.explodeSplash(g.x, g.y, 85, 125);
        this.grenades.splice(i, 1);
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      let hit = b.life <= 0 || b.x < 0 || b.x > this.worldW || b.y < 0 || b.y > this.worldH;
      if (!hit && this.platforms.some((p) => b.x >= p.x && b.x <= p.x + p.w && b.y >= p.y && b.y <= p.y + p.h)) {
        hit = true;
        if (b.isRocket) this.explodeSplash(b.x, b.y, 65, 110);
      }
      if (!hit && b.fromPlayer) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const hitR = e.isBoss ? 34 : 24;
          if (Math.hypot(b.x - e.x, b.y - (e.y - 22)) < hitR) {
            if (b.isRocket) {
              this.explodeSplash(b.x, b.y, 65, 110);
            } else {
              e.hp -= b.dmg;
              e.flash = 0.12;
              if (e.hp <= 0) this.killEnemy(j);
            }
            hit = true;
            break;
          }
        }
      } else if (!hit && !b.fromPlayer) {
        if (Math.hypot(b.x - this.player.x, b.y - (this.player.y - 22)) < 22) {
          hit = true;
          if (this.player.hitCd <= 0) {
            this.player.hitCd = 0.45;
            this.lives--;
            ArcadeAudio.play('hurt');
            this.triggerShake(7, 0.16);
            updateHealthDisplay(this.lives, this.maxLives);
            if (this.lives <= 0) {
              this.gameOverSequence(false);
              return;
            }
          }
        }
      }
      if (hit) this.bullets.splice(i, 1);
    }

    for (const e of this.enemies) {
      if (e.flash > 0) e.flash -= dt;
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      e.vx = Math.abs(dx) > 130 ? Math.sign(dx) * (e.isBoss ? 125 : 108 + this.wave * 8) * this.scaler.speedMult : 0;
      e.jetTimer -= dt;
      if (dy < -50 || e.isBoss || (e.jetTimer <= 0 && Math.random() < 0.35)) {
        if (dy < 60 || e.isBoss) {
          e.vy = Math.max(-240, e.vy - 960 * dt);
        } else {
          e.vy += 760 * dt;
        }
        if (e.jetTimer <= 0) e.jetTimer = 0.8 + Math.random() * 0.9;
      } else {
        e.vy += 820 * dt;
      }
      const prevEy = e.y;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      this.resolvePlatforms(e, prevEy);

      e.shootCd -= dt;
      if (e.shootCd <= 0 && Math.hypot(dx, dy) < 620) {
        e.shootCd = Math.max(0.75, ((e.isBoss ? 1.15 : 1.8) - this.wave * 0.1) / this.scaler.speedMult);
        const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x) + (Math.random() - 0.5) * 0.14;
        const shots = e.isBoss ? [-0.14, 0, 0.14] : [0];
        for (const off of shots) {
          this.bullets.push({
            x: e.x,
            y: e.y - 22,
            vx: Math.cos(ang + off) * 460,
            vy: Math.sin(ang + off) * 460,
            fromPlayer: false,
            dmg: 1,
            color: e.isBoss ? '#facc15' : '#f87171',
            life: 1.5
          });
        }
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0b1322';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(-this.camX, -this.camY);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.worldW; x += 140) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.worldH);
      ctx.stroke();
    }

    for (const p of this.platforms) {
      ctx.fillStyle = p.h > 25 ? '#1e293b' : '#334155';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#84fab0';
      ctx.fillRect(p.x, p.y, p.w, 3);
    }

    for (const pk of this.pickups) {
      const icon = pk.kind === 'medkit' ? '❤️' : pk.kind === 'grenade' ? '🧨' : pk.kind === 'rocket' ? '🚀' : '🔫';
      EmojiCache.draw(ctx, icon, pk.x, pk.y, 26);
    }

    for (const g of this.grenades) {
      EmojiCache.draw(ctx, '🧨', g.x, g.y, 20);
    }

    for (const b of this.bullets) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.isRocket ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const e of this.enemies) {
      const w = e.isBoss ? 34 : 20;
      const h = e.isBoss ? 48 : 32;
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.isBoss ? '#facc15' : '#ef4444';
      ctx.beginPath();
      ctx.roundRect(e.x - w / 2, e.y - h - 4, w, h, 8);
      ctx.fill();
      EmojiCache.draw(ctx, e.isBoss ? '🚁' : '🪖', e.x, e.y - h - 4, e.isBoss ? 34 : 22);
      const bw = e.isBoss ? 52 : 32;
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - bw / 2, e.y - h - 24, bw, 4);
      ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
      ctx.fillRect(e.x - bw / 2, e.y - h - 24, bw * Math.max(0, e.hp / e.maxHp), 4);
    }

    if (this.player.jetpack && this.player.fuel > 0) {
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(this.player.x - 8, this.player.y - 6 + Math.random() * 6, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(this.player.x - 10, this.player.y - 36, 20, 32, 6);
    ctx.fill();
    EmojiCache.draw(ctx, '🪖', this.player.x, this.player.y - 36, 24);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.player.x, this.player.y - 22);
    ctx.lineTo(this.player.x + Math.cos(this.player.aimAngle) * 24, this.player.y - 22 + Math.sin(this.player.aimAngle) * 24);
    ctx.stroke();

    ctx.restore();

    const isCompactLandscape = this.width > this.height * 1.3 && this.height < 460;
    const barW = Math.min(160, this.width * 0.38);
    const by = this.width < 460 ? 58 : isCompactLandscape ? 54 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect((this.width - barW) / 2, by, barW, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect((this.width - barW) / 2 + 2, by + 2, (barW - 4) * (this.player.fuel / 100), 10, 5);
    ctx.fill();
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🔥 ${Math.round(this.player.fuel)}% · ${this.player.weapon.toUpperCase()} · 🧨${this.player.grenades}`,
      this.width / 2,
      by + 26
    );

    // Compact Radar Minimap
    const mapW = isCompactLandscape ? 82 : 92;
    const mapH = isCompactLandscape ? 36 : 42;
    const mx = this.width - mapW - (isCompactLandscape ? 64 : 12);
    const my = isCompactLandscape ? 12 : 60;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(mx, my, mapW, mapH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(mx + (this.player.x / this.worldW) * (mapW - 4), my + (this.player.y / this.worldH) * (mapH - 4), 4, 4);
    for (const e of this.enemies) {
      ctx.fillStyle = e.isBoss ? '#facc15' : '#ef4444';
      ctx.fillRect(mx + (e.x / this.worldW) * (mapW - 4), my + (e.y / this.worldH) * (mapH - 4), e.isBoss ? 5 : 3, e.isBoss ? 5 : 3);
    }
    ctx.textAlign = 'left';
  }
}
