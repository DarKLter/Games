import { ArcadeAudio } from '../../core/audio';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';
import { pickBestPoolShot, PoolMode, resolvePoolWinner } from './poolRules';

interface PoolBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  num: number;
  isCue?: boolean;
  is8?: boolean;
}

const VS_TURN_TIME = 18;

export class EightBallPool extends BaseGame {
  poolMode: PoolMode = 'vs';
  turn: 'player' | 'enemy' = 'player';
  enemyScore = 0;
  shots = 0;
  shotActive = false;
  shotPocketedAny = false;
  shotScratched = false;
  enemyThinkTimer = 0;
  turnTimer = VS_TURN_TIME;
  soloTimeLeft = 75;
  aiming: { sx: number; sy: number; cx: number; cy: number } | null = null;
  balls: PoolBall[] = [];
  private lastTableRect: { x: number; y: number; w: number; h: number; r: number } | null = null;

  init(): void {
    this.poolMode = 'vs';
    this.turn = 'player';
    this.enemyScore = 0;
    this.shots = 0;
    this.shotActive = false;
    this.shotPocketedAny = false;
    this.shotScratched = false;
    this.enemyThinkTimer = 0;
    this.turnTimer = VS_TURN_TIME;
    this.soloTimeLeft = this.diff === 'extreme' || this.diff === 'hard' ? 60 : 75;
    this.maxLives = 1;
    this.lives = 1;
    this.aiming = null;
    this.setupRack();
  }

  getModeButtons() {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const bw = Math.min(138, (this.width - 30) / 2);
    const by = isCompactLand ? 10 : this.width < 460 ? 54 : 48;
    const bh = isCompactLand ? 32 : 34;
    const startX = this.width / 2 - bw - 5;
    return [
      { id: 'vs' as PoolMode, label: '🤖 VS ENEMY', x: startX, y: by, w: bw, h: bh },
      { id: 'solo' as PoolMode, label: '⏱️ SOLO TIMED', x: startX + bw + 10, y: by, w: bw, h: bh }
    ];
  }

  getTableRect() {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 480;
    const topSafe = isCompactLand ? 52 : this.width < 460 ? 96 : 90;
    const availW = this.width - 28;
    const availH = Math.max(120, this.height - topSafe - 34);
    let w = Math.min(availW, 640);
    let h = Math.min(availH, 360);
    if (w > h * 1.9) w = h * 1.9;
    if (h > w * 0.72 && this.width > this.height) h = w * 0.56;
    return {
      x: (this.width - w) / 2,
      y: topSafe + (availH - h) / 2,
      w,
      h,
      r: Math.max(8, Math.min(13, Math.min(w, h) * 0.036))
    };
  }

  setupRack(): void {
    const tb = this.getTableRect();
    this.lastTableRect = tb;
    const r = tb.r;
    this.balls = [
      { x: tb.x + tb.w * 0.25, y: tb.y + tb.h * 0.5, vx: 0, vy: 0, color: '#ffffff', num: 0, isCue: true }
    ];
    const colors = ['#eab308', '#2563eb', '#dc2626', '#7c3aed', '#ea580c', '#16a34a', '#111827', '#06b6d4', '#ec4899', '#84cc16'];
    let idx = 0;
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row <= col; row++) {
        const bx = tb.x + tb.w * 0.7 + col * (r * 1.85);
        const by = tb.y + tb.h * 0.5 + (row - col / 2) * (r * 2.08);
        const is8 = col === 2 && row === 1;
        this.balls.push({
          x: bx,
          y: by,
          vx: 0,
          vy: 0,
          color: is8 ? '#111111' : colors[idx % colors.length],
          num: is8 ? 8 : ++idx,
          is8
        });
      }
    }
  }

  pockets(tb: ReturnType<EightBallPool['getTableRect']>) {
    return [
      { x: tb.x + 4, y: tb.y + 4 },
      { x: tb.x + tb.w / 2, y: tb.y + 2 },
      { x: tb.x + tb.w - 4, y: tb.y + 4 },
      { x: tb.x + 4, y: tb.y + tb.h - 4 },
      { x: tb.x + tb.w / 2, y: tb.y + tb.h - 2 },
      { x: tb.x + tb.w - 4, y: tb.y + tb.h - 4 }
    ];
  }

  ballsMoving(): boolean {
    return this.balls.some((b) => Math.hypot(b.vx, b.vy) > 6);
  }

  override resize(): void {
    const prev = this.lastTableRect;
    super.resize();
    const next = this.getTableRect();
    if (prev && prev.w > 0 && prev.h > 0) {
      const sx = next.w / prev.w;
      const sy = next.h / prev.h;
      for (const b of this.balls) {
        b.x = next.x + (b.x - prev.x) * sx;
        b.y = next.y + (b.y - prev.y) * sy;
        b.vx *= sx;
        b.vy *= sy;
      }
    }
    this.lastTableRect = next;
    if (this.isPaused) this.draw();
  }

  releaseInputs(): void {
    this.aiming = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    for (const mb of this.getModeButtons()) {
      if (x >= mb.x && x <= mb.x + mb.w && y >= mb.y && y <= mb.y + mb.h) {
        if (this.poolMode !== mb.id) {
          this.poolMode = mb.id;
          this.score = 0;
          this.enemyScore = 0;
          this.turn = 'player';
          this.turnTimer = VS_TURN_TIME;
          this.shotActive = false;
          this.soloTimeLeft = this.diff === 'extreme' || this.diff === 'hard' ? 60 : 75;
          this.setupRack();
          ArcadeAudio.play('click');
          updateInGameHud(0, this.level, 18);
        }
        return;
      }
    }
    if (this.ballsMoving() || (this.poolMode === 'vs' && this.turn !== 'player')) return;
    this.aiming = { sx: x, sy: y, cx: x, cy: y };
  }

  onPointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    if (this.aiming) {
      this.aiming.cx = x;
      this.aiming.cy = y;
    }
  }

  onPointerUp(): void {
    if (!this.aiming) return;
    if (this.gameOver || this.isPaused) {
      this.aiming = null;
      return;
    }
    const cue = this.balls[0];
    const dx = this.aiming.sx - this.aiming.cx;
    const dy = this.aiming.sy - this.aiming.cy;
    const pull = Math.min(160, Math.hypot(dx, dy));
    if (pull > 10 && cue) {
      const ang = Math.atan2(dy, dx);
      const power = pull * 6.5;
      cue.vx = Math.cos(ang) * power;
      cue.vy = Math.sin(ang) * power;
      this.shots++;
      this.shotActive = true;
      this.shotPocketedAny = false;
      this.shotScratched = false;
      ArcadeAudio.play('cueHit');
    }
    this.aiming = null;
  }

  private performEnemyShot(): void {
    const cue = this.balls[0];
    if (!cue) return;
    const tb = this.getTableRect();
    const { angle, power } = pickBestPoolShot(cue, this.balls, this.pockets(tb));
    const jitter = (Math.random() - 0.5) * 0.08;
    cue.vx = Math.cos(angle + jitter) * power;
    cue.vy = Math.sin(angle + jitter) * power;
    this.shotActive = true;
    this.shotPocketedAny = false;
    this.shotScratched = false;
    ArcadeAudio.play('cueHit');
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;

    if (this.poolMode === 'solo') {
      this.soloTimeLeft -= dt;
      if (this.soloTimeLeft <= 0) {
        this.soloTimeLeft = 0;
        this.spawnPopup(this.width / 2, this.height * 0.35, "⏱️ TIME'S UP!", '#ef4444');
        this.gameOverSequence(false);
        return;
      }
    } else if (this.turn === 'player' && !this.shotActive && !this.ballsMoving()) {
      // Turn Shot Clock in VS ENEMY mode
      this.turnTimer -= dt;
      if (this.turnTimer <= 0) {
        this.aiming = null;
        this.turn = 'enemy';
        this.turnTimer = VS_TURN_TIME;
        this.enemyThinkTimer = 0.75;
        ArcadeAudio.play('hurt');
        this.spawnPopup(this.width / 2, this.height * 0.35, '⏱️ TIME UP — ENEMY TURN!', '#fca5a5');
      }
    }

    const tb = this.getTableRect();
    this.lastTableRect = tb;
    const r = tb.r;
    const pkts = this.pockets(tb);

    for (const b of this.balls) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const damp = Math.pow(0.28, dt);
      b.vx *= damp;
      b.vy *= damp;
      if (Math.hypot(b.vx, b.vy) < 4) {
        b.vx = 0;
        b.vy = 0;
      }
      if (b.x - r < tb.x) {
        b.x = tb.x + r;
        b.vx = Math.abs(b.vx) * 0.85;
      }
      if (b.x + r > tb.x + tb.w) {
        b.x = tb.x + tb.w - r;
        b.vx = -Math.abs(b.vx) * 0.85;
      }
      if (b.y - r < tb.y) {
        b.y = tb.y + r;
        b.vy = Math.abs(b.vy) * 0.85;
      }
      if (b.y + r > tb.y + tb.h) {
        b.y = tb.y + tb.h - r;
        b.vy = -Math.abs(b.vy) * 0.85;
      }
    }

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const a = this.balls[i];
        const b = this.balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < r * 2) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = r * 2 - dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            a.vx -= dot * nx * 0.94;
            a.vy -= dot * ny * 0.94;
            b.vx += dot * nx * 0.94;
            b.vy += dot * ny * 0.94;
            if (dot > 35) ArcadeAudio.play('cueHit');
          }
        }
      }
    }

    let eightBallPocketed = false;
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      if (pkts.some((pk) => Math.hypot(b.x - pk.x, b.y - pk.y) < r * 1.45)) {
        if (b.isCue) {
          b.x = tb.x + tb.w * 0.25;
          b.y = tb.y + tb.h * 0.5;
          b.vx = 0;
          b.vy = 0;
          this.shotScratched = true;
          ArcadeAudio.play('hurt');
          this.spawnPopup(b.x, b.y - 16, 'SCRATCH!', '#ef4444');
        } else if (b.is8) {
          this.balls.splice(i, 1);
          eightBallPocketed = true;
        } else {
          this.balls.splice(i, 1);
          this.shotPocketedAny = true;
          if (this.poolMode === 'vs' && this.turn === 'enemy') {
            this.enemyScore += 50;
            ArcadeAudio.play('pocket');
            this.spawnPopup(b.x, b.y - 12, '🤖 ENEMY +50', '#f87171');
          } else {
            this.score += 50;
            addCoins(2);
            ArcadeAudio.play('pocket');
            addXp(8);
            updateInGameHud(this.score, this.level, 18);
            this.spawnPopup(b.x, b.y - 12, '🎱 +50 (+2🪙)', '#84fab0');
          }
        }
      }
    }

    if (eightBallPocketed) {
      const remainingColors = this.balls.filter((o) => !o.isCue).length;
      if (this.poolMode === 'solo') {
        if (remainingColors === 0 && !this.shotScratched) {
          this.score += 250;
          addCoins(12);
          ArcadeAudio.play('win');
          addXp(25);
          this.level++;
          this.soloTimeLeft += 35;
          updateInGameHud(this.score, this.level, 18);
          this.spawnPopup(this.width / 2, this.height * 0.35, '🎱 RACK CLEAR! +35s', '#84fab0');
          this.setupRack();
        } else {
          ArcadeAudio.play('hurt');
          this.gameOverSequence(false);
          return;
        }
      } else {
        if (remainingColors === 0 && !this.shotScratched) {
          if (this.turn === 'player') {
            this.score += 150;
            addCoins(8);
          } else {
            this.enemyScore += 150;
          }
        } else {
          if (this.turn === 'player') this.enemyScore += 150;
          else this.score += 150;
        }
        updateInGameHud(this.score, this.level, 18);
        const winner = resolvePoolWinner(this.score, this.enemyScore);
        this.gameOverSequence(winner === 'player');
        return;
      }
    }

    // Turn management in VS ENEMY mode
    if (this.poolMode === 'vs' && this.shotActive && !this.ballsMoving()) {
      this.shotActive = false;
      if (!this.shotPocketedAny || this.shotScratched) {
        this.turn = this.turn === 'player' ? 'enemy' : 'player';
      }
      if (this.turn === 'enemy') {
        this.enemyThinkTimer = 0.75;
      } else {
        this.turnTimer = VS_TURN_TIME;
      }
    }

    if (this.poolMode === 'vs' && this.turn === 'enemy' && !this.shotActive && !this.ballsMoving()) {
      this.enemyThinkTimer -= dt;
      if (this.enemyThinkTimer <= 0) {
        this.performEnemyShot();
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const tb = this.getTableRect();
    const r = tb.r;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, this.height);

    for (const mb of this.getModeButtons()) {
      const sel = this.poolMode === mb.id;
      ctx.fillStyle = sel ? '#84fab0' : 'rgba(255,255,255,0.12)';
      ctx.strokeStyle = sel ? '#ffffff' : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(mb.x, mb.y, mb.w, mb.h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.font = '800 11px system-ui, sans-serif';
      ctx.fillStyle = sel ? '#0f172a' : '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(mb.label, mb.x + mb.w / 2, mb.y + Math.round(mb.h * 0.63));
    }

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(tb.x - 14, tb.y - 14, tb.w + 28, tb.h + 28, 16);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.fillRect(tb.x, tb.y, tb.w, tb.h);

    ctx.fillStyle = '#090d14';
    for (const pk of this.pockets(tb)) {
      ctx.beginPath();
      ctx.arc(pk.x, pk.y, r * 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const b of this.balls) {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(b.x - r * 0.3, b.y - r * 0.3, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

    const cue = this.balls[0];
    if (this.aiming && cue) {
      const dx = this.aiming.sx - this.aiming.cx;
      const dy = this.aiming.sy - this.aiming.cy;
      const pull = Math.min(160, Math.hypot(dx, dy));
      if (pull > 6) {
        const ang = Math.atan2(dy, dx);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(cue.x, cue.y);
        ctx.lineTo(cue.x + Math.cos(ang) * 160, cue.y + Math.sin(ang) * 160);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cue.x - Math.cos(ang) * (r + 8 + pull * 0.25), cue.y - Math.sin(ang) * (r + 8 + pull * 0.25));
        ctx.lineTo(cue.x - Math.cos(ang) * (r + 75 + pull * 0.25), cue.y - Math.sin(ang) * (r + 75 + pull * 0.25));
        ctx.stroke();
      }
    }

    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    if (this.poolMode === 'vs') {
      const clockText = this.turn === 'player' ? `⏱️ ${Math.ceil(this.turnTimer)}s` : '🤖 ENEMY SHOT';
      ctx.fillStyle = this.turn === 'player' && this.turnTimer <= 5 ? '#ef4444' : this.turn === 'player' ? '#84fab0' : '#fca5a5';
      ctx.fillText(
        `👤 You: ${this.score}  vs  🤖 Enemy: ${this.enemyScore}   ·   ${clockText}`,
        this.width / 2,
        Math.min(this.height - 10, tb.y + tb.h + 26)
      );
    } else {
      ctx.fillStyle = this.soloTimeLeft <= 12 ? '#ef4444' : '#facc15';
      ctx.fillText(
        `⏱️ Time Left: ${Math.ceil(this.soloTimeLeft)}s   ·   Balls Left: ${this.balls.filter((b) => !b.isCue).length}`,
        this.width / 2,
        Math.min(this.height - 10, tb.y + tb.h + 26)
      );
    }
    ctx.textAlign = 'left';
  }
}
