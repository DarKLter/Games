import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

export type PlantCardId = 'sun' | 'pea' | 'snow' | 'repeater' | 'nut' | 'mine' | 'jalapeno' | 'cherry' | 'shovel';

export interface PlantCard {
  id: PlantCardId;
  name: string;
  icon: string;
  cost: number;
  hp: number;
}

export const PVZ_CARDS: PlantCard[] = [
  { id: 'sun', name: 'Sun', icon: '🌻', cost: 50, hp: 65 },
  { id: 'pea', name: 'Pea', icon: '🌱', cost: 100, hp: 75 },
  { id: 'snow', name: 'Snow', icon: '❄️', cost: 175, hp: 75 },
  { id: 'repeater', name: 'Dual', icon: '🫛', cost: 200, hp: 80 },
  { id: 'nut', name: 'Nut', icon: '🌰', cost: 50, hp: 320 },
  { id: 'mine', name: 'Mine', icon: '💣', cost: 25, hp: 60 },
  { id: 'jalapeno', name: 'Chili', icon: '🌶️', cost: 125, hp: 999 },
  { id: 'cherry', name: 'Bomb', icon: '🍒', cost: 150, hp: 999 },
  { id: 'shovel', name: 'Dig', icon: '🪓', cost: 0, hp: 999 }
];

interface PlantEntity {
  id: PlantCardId;
  hp: number;
  maxHp: number;
  timer: number;
  burstLeft?: number;
  armed?: boolean;
}

interface ZombieEntity {
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  speed: number;
  chillTimer: number;
  icon: string;
  isBoss?: boolean;
}

interface SunDrop {
  x: number;
  y: number;
  targetY: number;
  ttl: number;
}

interface PeaShot {
  row: number;
  col: number;
  isIce: boolean;
  dmg: number;
}

interface Lawnmower {
  row: number;
  col: number;
  active: boolean;
  used: boolean;
}

const SUN_HIT_RADIUS = 46;

export class PlantVsZombie extends BaseGame {
  rows = 5;
  cols = 8;
  sun = 175;
  selectedCard = 1;
  cards: PlantCard[] = PVZ_CARDS;
  plants: (PlantEntity | null)[][] = [];
  zombies: ZombieEntity[] = [];
  peas: PeaShot[] = [];
  suns: SunDrop[] = [];
  mowers: Lawnmower[] = [];
  spawnTimer = 2.0;
  skySunTimer = 1.8;
  zombiesSlain = 0;
  animClock = 0;

  init(): void {
    this.rows = 5;
    this.cols = 8;
    this.sun = 175;
    this.selectedCard = 1;
    this.cards = PVZ_CARDS;
    this.plants = Array.from({ length: this.rows }, () => new Array<PlantEntity | null>(this.cols).fill(null));
    this.zombies = [];
    this.peas = [];
    this.suns = [];
    this.mowers = Array.from({ length: this.rows }, (_, row) => ({ row, col: -0.45, active: false, used: false }));
    this.spawnTimer = 2.0;
    this.skySunTimer = 1.6;
    this.zombiesSlain = 0;
    this.animClock = 0;
    this.maxLives = 1;
    this.lives = 1;
  }

  override resize(): void {
    super.resize();
    if (this.isPaused) this.draw();
  }

  getGridRect() {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const isNarrowPortrait = this.width < 540;
    const topBarY = isCompactLand ? 44 : this.width < 460 ? 58 : 50;
    const barH = 44;
    const trayRows = isNarrowPortrait ? 2 : 1;
    const rowGap = 5;
    const availTop = topBarY + trayRows * barH + (trayRows - 1) * rowGap + (isCompactLand ? 6 : 10);
    const leftPad = 32;
    const cw = Math.min(58, (this.width - leftPad - 14) / this.cols);
    const ch = Math.min(62, (this.height - availTop - 12) / this.rows);
    const gw = cw * this.cols;
    const gh = ch * this.rows;
    return {
      topBarY,
      barH,
      rowGap,
      isNarrowPortrait,
      x: leftPad + Math.max(0, (this.width - leftPad - gw) / 2),
      y: availTop + Math.max(0, (this.height - availTop - gh) / 2),
      cw,
      ch,
      gw,
      gh
    };
  }

  getCardButtons(rect: ReturnType<PlantVsZombie['getGridRect']>) {
    if (rect.isNarrowPortrait) {
      // 2-row layout on narrow portrait screens so every touch target stays >= 44px wide & tall
      const gap = 5;
      const colsPerRow = 5;
      const maxRowW = Math.min(420, this.width - 16);
      const cellW = Math.max(44, Math.floor((maxRowW - gap * (colsPerRow - 1)) / colsPerRow));
      const rowTotalW = colsPerRow * cellW + (colsPerRow - 1) * gap;
      const startX = (this.width - rowTotalW) / 2;
      const btns: Array<{ type: 'sun' | 'card'; idx?: number; x: number; y: number; w: number; h: number }> = [
        { type: 'sun', x: startX, y: rect.topBarY, w: cellW, h: rect.barH }
      ];
      this.cards.forEach((_, idx) => {
        const slot = idx + 1; // slot 0 is sun indicator
        const r = Math.floor(slot / colsPerRow);
        const c = slot % colsPerRow;
        btns.push({
          type: 'card',
          idx,
          x: startX + c * (cellW + gap),
          y: rect.topBarY + r * (rect.barH + rect.rowGap),
          w: cellW,
          h: rect.barH
        });
      });
      return btns;
    }

    const gap = 5;
    const sunBoxW = 60;
    const availCardsW = Math.max(180, this.width - 18 - sunBoxW - gap);
    const cardW = Math.max(44, Math.min(58, Math.floor((availCardsW - gap * this.cards.length) / this.cards.length)));
    const totalW = sunBoxW + gap + this.cards.length * (cardW + gap) - gap;
    let sx = Math.max(6, (this.width - totalW) / 2);
    const btns: Array<{ type: 'sun' | 'card'; idx?: number; x: number; y: number; w: number; h: number }> = [
      { type: 'sun', x: sx, y: rect.topBarY, w: sunBoxW, h: rect.barH }
    ];
    sx += sunBoxW + gap;
    this.cards.forEach((_, idx) => {
      btns.push({ type: 'card', idx, x: sx + idx * (cardW + gap), y: rect.topBarY, w: cardW, h: rect.barH });
    });
    return btns;
  }

  private tryCollectSun(x: number, y: number): boolean {
    for (let i = this.suns.length - 1; i >= 0; i--) {
      const s = this.suns[i];
      if (Math.hypot(x - s.x, y - s.y) <= SUN_HIT_RADIUS) {
        this.sun += 25;
        this.suns.splice(i, 1);
        ArcadeAudio.play('coin');
        this.spawnParticles(s.x, s.y, '#facc15', 8, 120);
        this.spawnPopup(s.x, s.y - 12, '+25☀️', '#facc15');
        return true;
      }
    }
    return false;
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    if (this.tryCollectSun(x, y)) return;

    const rect = this.getGridRect();
    for (const b of this.getCardButtons(rect)) {
      if (b.type === 'card' && b.idx !== undefined && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.selectedCard = b.idx;
        ArcadeAudio.play('click');
        return;
      }
    }

    const c = Math.floor((x - rect.x) / rect.cw);
    const r = Math.floor((y - rect.y) / rect.ch);
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      const card = this.cards[this.selectedCard];

      if (card.id === 'shovel') {
        const existing = this.plants[r][c];
        if (existing) {
          const orig = this.cards.find((k) => k.id === existing.id);
          const refund = orig ? Math.floor(orig.cost * 0.5) : 0;
          this.sun += refund;
          this.plants[r][c] = null;
          ArcadeAudio.play('slide');
          this.spawnPopup(x, y - 10, `+${refund}☀️`, '#84fab0');
        }
        return;
      }

      if (this.sun < card.cost) {
        ArcadeAudio.play('hurt');
        this.spawnPopup(x, y - 10, 'Need ☀️!', '#ef4444');
        return;
      }

      if (card.id === 'cherry') {
        this.sun -= card.cost;
        const bx = rect.x + (c + 0.5) * rect.cw;
        const by = rect.y + (r + 0.5) * rect.ch;
        ArcadeAudio.play('explosion');
        this.triggerShake(9, 0.22);
        this.spawnParticles(bx, by, '#ef4444', 20, 230);
        for (let i = this.zombies.length - 1; i >= 0; i--) {
          const zb = this.zombies[i];
          if (Math.abs(zb.row - r) <= 1 && Math.abs(zb.col - c) <= 1.7) {
            zb.hp -= 190;
            if (zb.hp <= 0) this.defeatZombie(i);
          }
        }
        return;
      }

      if (card.id === 'jalapeno') {
        this.sun -= card.cost;
        const by = rect.y + (r + 0.5) * rect.ch;
        ArcadeAudio.play('explosion');
        this.triggerShake(8, 0.2);
        this.spawnParticles(rect.x + rect.gw / 2, by, '#fb923c', 24, 240);
        this.spawnPopup(rect.x + rect.gw / 2, by - 12, '🌶️ LANE FIRE!', '#fb923c');
        for (let i = this.zombies.length - 1; i >= 0; i--) {
          if (this.zombies[i].row === r) {
            this.zombies[i].hp -= 200;
            if (this.zombies[i].hp <= 0) this.defeatZombie(i);
          }
        }
        return;
      }

      if (!this.plants[r][c]) {
        this.sun -= card.cost;
        this.plants[r][c] = {
          id: card.id,
          hp: card.hp,
          maxHp: card.hp,
          timer: card.id === 'sun' ? 4.0 : card.id === 'mine' ? 3.5 : 1.0,
          armed: card.id !== 'mine'
        };
        ArcadeAudio.play('plant');
        this.spawnParticles(rect.x + (c + 0.5) * rect.cw, rect.y + (r + 0.5) * rect.ch, '#4ade80', 6, 90);
      }
    }
  }

  onPointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.tryCollectSun(x, y);
  }

  private defeatZombie(index: number): void {
    const zb = this.zombies[index];
    this.zombies.splice(index, 1);
    this.zombiesSlain++;
    this.score += zb.isBoss ? 180 : 35;
    addCoins(zb.isBoss ? 6 : 1);
    addXp(zb.isBoss ? 20 : 6);
    if (this.zombiesSlain % 10 === 0) {
      this.level++;
      ArcadeAudio.play('levelup');
      this.spawnPopup(this.width / 2, this.height * 0.3, `🌊 ZOMBIE WAVE ${this.level}!`, '#84fab0');
    }
    updateInGameHud(this.score, this.level, 12);
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.animClock += dt;
    const rect = this.getGridRect();
    this.skySunTimer -= dt;
    if (this.skySunTimer <= 0) {
      this.skySunTimer = 5.0;
      this.suns.push({
        x: rect.x + 24 + Math.random() * Math.max(20, rect.gw - 48),
        y: rect.y - 10,
        targetY: rect.y + 38 + Math.random() * Math.max(30, rect.gh - 56),
        ttl: 9
      });
    }

    for (let i = this.suns.length - 1; i >= 0; i--) {
      const s = this.suns[i];
      if (s.y < s.targetY) s.y = Math.min(s.targetY, s.y + 42 * dt);
      else {
        s.ttl -= dt;
        if (s.ttl <= 0) this.suns.splice(i, 1);
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const pl = this.plants[r][c];
        if (!pl) continue;
        pl.timer -= dt;
        if (pl.id === 'sun' && pl.timer <= 0) {
          pl.timer = 7.0;
          this.suns.push({
            x: rect.x + (c + 0.5) * rect.cw,
            y: rect.y + (r + 0.5) * rect.ch - 14,
            targetY: rect.y + (r + 0.65) * rect.ch,
            ttl: 9
          });
        } else if (pl.id === 'mine') {
          if (!pl.armed && pl.timer <= 0) {
            pl.armed = true;
            ArcadeAudio.play('click');
          }
          if (pl.armed) {
            const target = this.zombies.some((z) => z.row === r && Math.abs(z.col - c) < 0.72);
            if (target) {
              this.plants[r][c] = null;
              const bx = rect.x + (c + 0.5) * rect.cw;
              const by = rect.y + (r + 0.5) * rect.ch;
              ArcadeAudio.play('explosion');
              this.triggerShake(7, 0.18);
              this.spawnParticles(bx, by, '#facc15', 16, 180);
              this.spawnPopup(bx, by - 12, '💥 SPUDOW!', '#facc15');
              for (let zi = this.zombies.length - 1; zi >= 0; zi--) {
                if (this.zombies[zi].row === r && Math.abs(this.zombies[zi].col - c) < 1.1) {
                  this.zombies[zi].hp -= 240;
                  if (this.zombies[zi].hp <= 0) this.defeatZombie(zi);
                }
              }
            }
          }
        } else if ((pl.id === 'pea' || pl.id === 'snow' || pl.id === 'repeater') && pl.timer <= 0) {
          const hasTarget = this.zombies.some((z) => z.row === r && z.col >= c);
          if (hasTarget) {
            if (pl.id === 'repeater') {
              if (!pl.burstLeft) {
                pl.burstLeft = 1;
                pl.timer = 0.22;
              } else {
                pl.burstLeft = 0;
                pl.timer = 1.15;
              }
              this.peas.push({ row: r, col: c + 0.4, isIce: false, dmg: 22 });
            } else {
              pl.timer = 1.3;
              this.peas.push({ row: r, col: c + 0.4, isIce: pl.id === 'snow', dmg: 22 });
            }
            ArcadeAudio.play('shoot');
          } else {
            pl.timer = 0.25;
          }
        }
      }
    }

    for (let i = this.peas.length - 1; i >= 0; i--) {
      const p = this.peas[i];
      p.col += 4.8 * dt;
      let hit = false;
      for (let j = this.zombies.length - 1; j >= 0; j--) {
        const zb = this.zombies[j];
        if (zb.row === p.row && Math.abs(zb.col - p.col) < 0.44) {
          zb.hp -= p.dmg;
          if (p.isIce) zb.chillTimer = 3.2;
          hit = true;
          ArcadeAudio.play('zombieHit');
          if (zb.hp <= 0) this.defeatZombie(j);
          break;
        }
      }
      if (hit || p.col > this.cols + 0.5) this.peas.splice(i, 1);
    }

    // Active Lawnmowers mow entire row cleanly
    for (const mw of this.mowers) {
      if (mw.active) {
        mw.col += 6.2 * dt;
        for (let i = this.zombies.length - 1; i >= 0; i--) {
          if (this.zombies[i].row === mw.row && Math.abs(this.zombies[i].col - mw.col) < 0.65) {
            this.defeatZombie(i);
          }
        }
        if (mw.col > this.cols + 0.8) {
          mw.active = false;
          mw.used = true;
        }
      }
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(1.35, (4.0 - this.level * 0.24) / this.scaler.spawnMult);
      const roll = Math.random();
      const isBoss = this.level >= 2 && roll > 0.86;
      const hp = isBoss ? 280 + this.level * 40 : roll > 0.68 ? 160 : roll > 0.42 ? 105 : 65;
      const spd = isBoss ? 0.2 : roll > 0.68 ? 0.24 : 0.28 + this.level * 0.02;
      this.zombies.push({
        row: Math.floor(Math.random() * this.rows),
        col: this.cols + 0.2,
        hp,
        maxHp: hp,
        speed: spd,
        chillTimer: 0,
        icon: isBoss ? '👹' : roll > 0.68 ? '🪣' : roll > 0.42 ? '🧟‍♂️' : '🧟',
        isBoss
      });
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zb = this.zombies[i];
      if (zb.chillTimer > 0) zb.chillTimer -= dt;
      const chillFactor = zb.chillTimer > 0 ? 0.45 : 1;
      const cIdx = Math.floor(zb.col);
      const blocking = cIdx >= 0 && cIdx < this.cols ? this.plants[zb.row][cIdx] : null;
      if (blocking) {
        blocking.hp -= (zb.isBoss ? 36 : 22) * chillFactor * dt;
        if (blocking.hp <= 0) {
          this.plants[zb.row][cIdx] = null;
          ArcadeAudio.play('chomp');
        }
      } else {
        zb.col -= zb.speed * chillFactor * this.scaler.speedMult * dt;
      }

      if (zb.col < 0) {
        const mower = this.mowers[zb.row];
        if (mower && !mower.used && !mower.active) {
          mower.active = true;
          ArcadeAudio.play('boost');
          this.spawnPopup(rect.x, rect.y + (zb.row + 0.5) * rect.ch, '🚜 MOWER!', '#facc15');
        } else if (zb.col < -0.35 && (!mower || mower.used)) {
          ArcadeAudio.play('hurt');
          this.triggerShake(10, 0.25);
          this.spawnPopup(this.width / 2, this.height * 0.35, '🧟 THE ZOMBIES ATE YOUR BRAINS!', '#ef4444');
          this.gameOverSequence(false);
          return;
        }
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const rect = this.getGridRect();
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const b of this.getCardButtons(rect)) {
      if (b.type === 'sun') {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 8);
        ctx.fill();
        ctx.font = '800 11px system-ui, sans-serif';
        ctx.fillStyle = '#facc15';
        ctx.textAlign = 'center';
        ctx.fillText(`☀️${this.sun}`, b.x + b.w / 2, b.y + 27);
      } else if (b.idx !== undefined) {
        const card = this.cards[b.idx];
        const sel = this.selectedCard === b.idx;
        const ok = this.sun >= card.cost;
        ctx.fillStyle = sel ? '#84fab0' : ok ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.45)';
        ctx.strokeStyle = sel ? '#fff' : 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 8);
        ctx.fill();
        ctx.stroke();
        EmojiCache.draw(ctx, card.icon, b.x + b.w / 2, b.y + 16, 18);
        ctx.font = '800 9.5px system-ui, sans-serif';
        ctx.fillStyle = sel ? '#0f172a' : ok ? '#facc15' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(card.cost > 0 ? `${card.cost}` : 'DIG', b.x + b.w / 2, b.y + 39);
      }
    }
    ctx.textAlign = 'left';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tx = rect.x + c * rect.cw;
        const ty = rect.y + r * rect.ch;
        ctx.fillStyle = (r + c) % 2 === 0 ? '#22c55e' : '#16a34a';
        ctx.fillRect(tx + 1, ty + 1, rect.cw - 2, rect.ch - 2);
        const pl = this.plants[r][c];
        if (pl) {
          const card = this.cards.find((k) => k.id === pl.id);
          const sz = pl.id === 'mine' && !pl.armed ? Math.round(Math.min(rect.cw, rect.ch) * 0.45) : Math.round(Math.min(rect.cw, rect.ch) * 0.68);
          EmojiCache.draw(ctx, card ? card.icon : '🌱', tx + rect.cw / 2, ty + rect.ch / 2, sz);
        }
      }
      const mw = this.mowers[r];
      if (mw && !mw.used) {
        EmojiCache.draw(ctx, '🚜', rect.x + mw.col * rect.cw, rect.y + (r + 0.5) * rect.ch, Math.round(rect.ch * 0.62), 0, -1, 1);
      }
    }

    for (const p of this.peas) {
      ctx.fillStyle = p.isIce ? '#7dd3fc' : '#bef264';
      ctx.beginPath();
      ctx.arc(rect.x + p.col * rect.cw, rect.y + (p.row + 0.45) * rect.ch, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const zb of this.zombies) {
      const zx = rect.x + zb.col * rect.cw;
      const zy = rect.y + (zb.row + 0.5) * rect.ch;
      EmojiCache.draw(ctx, zb.icon, zx, zy, Math.round(Math.min(rect.cw, rect.ch) * (zb.isBoss ? 0.88 : 0.72)));
      if (zb.chillTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zx, zy, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (zb.hp < zb.maxHp) {
        ctx.fillStyle = '#000';
        ctx.fillRect(zx - 14, zy - 26, 28, 4);
        ctx.fillStyle = zb.isBoss ? '#facc15' : '#ef4444';
        ctx.fillRect(zx - 14, zy - 26, 28 * Math.max(0, zb.hp / zb.maxHp), 4);
      }
    }

    const pulse = 1 + Math.sin(this.animClock * 8) * 0.1;
    for (const s of this.suns) {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 24 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      EmojiCache.draw(ctx, '☀️', s.x, s.y, 34);
    }
  }
}
