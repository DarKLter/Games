import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';

export interface WormPoint {
  x: number;
  y: number;
}

export function wrapAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function stepWormChain(
  pts: WormPoint[],
  angle: number,
  spd: number,
  dt: number,
  targetLen: number,
  spacing = 8
): void {
  if (pts.length === 0) return;
  pts[0].x += Math.cos(angle) * spd * dt;
  pts[0].y += Math.sin(angle) * spd * dt;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.0001) {
      curr.x = prev.x + (dx / dist) * spacing;
      curr.y = prev.y + (dy / dist) * spacing;
    }
  }
  const desiredCount = Math.max(2, Math.floor(targetLen));
  while (pts.length < desiredCount) {
    const tail = pts[pts.length - 1];
    pts.push({ x: tail.x, y: tail.y });
  }
  while (pts.length > desiredCount) pts.pop();
}

interface WormOrb {
  x: number;
  y: number;
  val: number;
  color: string;
}

interface BotWorm {
  angle: number;
  pts: WormPoint[];
  len: number;
  color: string;
  turnTimer: number;
}

export class WormIo extends BaseGame {
  arena = 1500;
  player = {
    angle: 0,
    targetAngle: null as number | null,
    steer: 0,
    boosting: false,
    pts: [] as WormPoint[],
    len: 18,
    color: '#4ade80'
  };
  orbs: WormOrb[] = [];
  bots: BotWorm[] = [];

  init(): void {
    this.arena = 1500;
    this.player = { angle: 0, targetAngle: null, steer: 0, boosting: false, pts: [], len: 18, color: '#4ade80' };
    for (let i = 0; i < 18; i++) {
      this.player.pts.push({ x: this.arena / 2 - i * 8, y: this.arena / 2 });
    }
    this.orbs = [];
    this.bots = [];
    this.maxLives = 1;
    this.lives = 1;
    for (let i = 0; i < 120; i++) this.spawnOrb();
    const colors = ['#f472b6', '#38bdf8', '#facc15', '#fb923c', '#a78bfa'];
    for (let i = 0; i < 5; i++) this.spawnBot(colors[i]);
  }

  spawnOrb(x?: number, y?: number, val = 1): void {
    const cols = ['#fde047', '#38bdf8', '#f472b6', '#4ade80', '#fb923c'];
    this.orbs.push({
      x: x ?? 60 + Math.random() * (this.arena - 120),
      y: y ?? 60 + Math.random() * (this.arena - 120),
      val,
      color: cols[Math.floor(Math.random() * cols.length)]
    });
  }

  spawnBot(color: string): void {
    const bx = 220 + Math.random() * (this.arena - 440);
    const by = 220 + Math.random() * (this.arena - 440);
    const pts: WormPoint[] = [];
    for (let i = 0; i < 16; i++) pts.push({ x: bx - i * 8, y: by });
    this.bots.push({ angle: Math.random() * Math.PI * 2, pts, len: 16, color, turnTimer: 0 });
  }

  releaseInputs(): void {
    this.player.boosting = false;
    this.player.steer = 0;
    this.player.targetAngle = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  setBoost(on: boolean): void {
    if (!on) {
      this.player.boosting = false;
      return;
    }
    if (this.gameOver || this.isPaused) return;
    if (!this.player.boosting) ArcadeAudio.play('boost');
    this.player.boosting = true;
  }

  setSteer(dir: number): void {
    if (this.gameOver || this.isPaused) {
      this.player.steer = 0;
      return;
    }
    this.player.steer = dir;
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.player.targetAngle = Math.atan2(y - this.height / 2, x - this.width / 2);
  }

  onPointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    if (this.player.targetAngle !== null) {
      this.player.targetAngle = Math.atan2(y - this.height / 2, x - this.width / 2);
    }
  }

  onPointerUp(): void {
    this.player.targetAngle = null;
  }

  stepWorm(w: { angle: number; pts: WormPoint[]; len: number }, spd: number, dt: number): void {
    stepWormChain(w.pts, w.angle, spd, dt, w.len, 8);
  }

  update(dt: number): void {
    if (this.gameOver) return;
    if (this.player.steer) {
      this.player.angle += this.player.steer * 3.8 * dt;
    } else if (this.player.targetAngle !== null) {
      const diff = wrapAngleDelta(this.player.angle, this.player.targetAngle);
      this.player.angle += diff * (1 - Math.exp(-8 * dt));
    }

    const boosting = this.player.boosting && this.player.len > 10;
    if (boosting) this.player.len -= dt * 2.5;
    this.stepWorm(this.player, boosting ? 275 : 165, dt);

    const ph = this.player.pts[0];
    if (ph.x < 16 || ph.x > this.arena - 16 || ph.y < 16 || ph.y > this.arena - 16) {
      ArcadeAudio.play('hurt');
      this.gameOverSequence(false);
      return;
    }

    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      if (Math.hypot(o.x - ph.x, o.y - ph.y) < 22) {
        this.player.len += o.val * 0.6;
        this.score += o.val * 10;
        if (o.val >= 2) addCoins(1);
        ArcadeAudio.play('coin');
        updateInGameHud(this.score, this.level, 16);
        this.orbs.splice(i, 1);
        this.spawnOrb();
      }
    }

    for (let b = 0; b < this.bots.length; b++) {
      const bot = this.bots[b];
      const bh = bot.pts[0];
      bot.turnTimer -= dt;
      if (bh.x < 130 || bh.x > this.arena - 130 || bh.y < 130 || bh.y > this.arena - 130) {
        const targetAng = Math.atan2(this.arena / 2 - bh.y, this.arena / 2 - bh.x);
        bot.angle += wrapAngleDelta(bot.angle, targetAng) * (1 - Math.exp(-4 * dt));
      } else if (bot.turnTimer <= 0) {
        bot.turnTimer = 0.7 + Math.random();
        bot.angle += (Math.random() - 0.5) * 1.4;
      }
      this.stepWorm(bot, 145 * this.scaler.speedMult, dt);

      const headCollision = Math.hypot(bh.x - ph.x, bh.y - ph.y) < 18;
      if (headCollision && this.player.len >= bot.len + 2) {
        for (let s = 0; s < bot.pts.length; s += 2) this.spawnOrb(bot.pts[s].x, bot.pts[s].y, 3);
        ArcadeAudio.play('ko');
        this.score += 120;
        addXp(15);
        updateInGameHud(this.score, this.level, 16);
        this.bots.splice(b, 1);
        this.spawnBot(bot.color);
        b--;
        continue;
      }

      if (this.player.pts.some((seg, idx) => idx > 2 && Math.hypot(seg.x - bh.x, seg.y - bh.y) < 16)) {
        for (let s = 0; s < bot.pts.length; s += 2) this.spawnOrb(bot.pts[s].x, bot.pts[s].y, 3);
        ArcadeAudio.play('ko');
        this.score += 120;
        addXp(15);
        updateInGameHud(this.score, this.level, 16);
        this.bots.splice(b, 1);
        this.spawnBot(bot.color);
        b--;
        continue;
      }
      if (bot.pts.some((seg, idx) => (idx > 0 || this.player.len < bot.len + 2) && Math.hypot(seg.x - ph.x, seg.y - ph.y) < 16)) {
        ArcadeAudio.play('hurt');
        this.gameOverSequence(false);
        return;
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const ph = this.player.pts[0];
    const camX = ph.x - this.width / 2;
    const camY = ph.y - this.height / 2;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(-camX, -camY);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let g = 0; g <= this.arena; g += 80) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, this.arena);
      ctx.moveTo(0, g);
      ctx.lineTo(this.arena, g);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, this.arena, this.arena);

    for (const o of this.orbs) {
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.val >= 2 ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawW = (w: { pts: WormPoint[]; color: string; angle: number }) => {
      ctx.fillStyle = w.color;
      for (let i = w.pts.length - 1; i >= 0; i--) {
        ctx.beginPath();
        ctx.arc(w.pts[i].x, w.pts[i].y, i === 0 ? 12 : 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(w.pts[0].x + Math.cos(w.angle) * 4, w.pts[0].y + Math.sin(w.angle) * 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
    };

    for (const bot of this.bots) drawW(bot);
    drawW(this.player);
    ctx.restore();

    const badgeY = this.width < 460 ? 52 : 12;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.beginPath();
    ctx.roundRect(this.width / 2 - 76, badgeY, 152, 26, 13);
    ctx.fill();
    ctx.font = '800 11px system-ui, sans-serif';
    ctx.fillStyle = '#84fab0';
    ctx.textAlign = 'center';
    ctx.fillText(`🐍 Mass: ${Math.floor(this.player.len)} · Rivals: ${this.bots.length}`, this.width / 2, badgeY + 17);
    ctx.textAlign = 'left';
  }
}
