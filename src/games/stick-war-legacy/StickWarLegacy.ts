import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';
import { ArmyStance, canAffordUnit, computeStatueDamage, UNIT_CATALOG, UnitSpec, UnitType } from './stickWarLogic';

interface WarUnit {
  side: 'player' | 'enemy';
  spec: UnitSpec;
  x: number;
  hp: number;
  maxHp: number;
  atkCd: number;
  goldCarried: number;
  miningDir: 1 | -1;
}

interface WarProjectile {
  side: 'player' | 'enemy';
  kind: 'arrow' | 'magic' | 'heal';
  x: number;
  y: number;
  vx: number;
  dmg: number;
}

export class StickWarLegacy extends BaseGame {
  worldW = 1550;
  camX = 0;
  gold = 260;
  playerStatueHp = 900;
  playerStatueMax = 900;
  enemyStatueHp = 850;
  enemyStatueMax = 850;
  stance: ArmyStance = 'attack';
  units: WarUnit[] = [];
  projectiles: WarProjectile[] = [];
  enemySpawnTimer = 3.2;
  groundY = 400;
  dragCam: { startX: number; camStart: number } | null = null;
  rageTimer = 0;
  rageCd = 0;
  goldRushCd = 0;
  castleArcherCd = 1.2;

  init(): void {
    this.worldW = 1550;
    this.camX = 0;
    this.gold = 260;
    this.playerStatueMax = 900;
    this.playerStatueHp = 900;
    this.enemyStatueMax = Math.round(850 * this.scaler.speedMult);
    this.enemyStatueHp = this.enemyStatueMax;
    this.stance = 'attack';
    this.units = [];
    this.projectiles = [];
    this.enemySpawnTimer = 3.0;
    this.rageTimer = 0;
    this.rageCd = 0;
    this.goldRushCd = 0;
    this.castleArcherCd = 1.0;
    this.maxLives = 1;
    this.lives = 1;
    this.spawnUnit('player', 'miner');
    this.spawnUnit('player', 'sword');
    this.spawnUnit('enemy', 'sword');
  }

  override releaseInputs(): void {
    this.dragCam = null;
  }

  override pause(): void {
    super.pause();
    this.releaseInputs();
  }

  setStance(next: ArmyStance): void {
    if (this.gameOver || this.isPaused) return;
    this.stance = next;
    ArcadeAudio.play('warHorn');
    this.spawnPopup(this.width / 2, this.height * 0.35, `📢 ${next.toUpperCase()}!`, '#ffd700');
  }

  castRageHorn(): void {
    if (this.gameOver || this.isPaused || this.rageCd > 0) return;
    this.rageTimer = 8;
    this.rageCd = 20;
    ArcadeAudio.play('warHorn');
    this.spawnPopup(this.width / 2, this.height * 0.32, '🎺 RAGE HORN! 2× SPEED!', '#fb923c');
  }

  castGoldRush(): void {
    if (this.gameOver || this.isPaused || this.goldRushCd > 0) return;
    this.gold += 140;
    this.goldRushCd = 22;
    ArcadeAudio.play('coin');
    this.spawnPopup(this.width / 2, this.height * 0.32, '💰 GOLD RUSH +140g!', '#facc15');
  }

  triggerAction(actionKey: string, pressed: boolean): void {
    if (!pressed || this.gameOver || this.isPaused) return;
    if (actionKey === 'spell1') this.castRageHorn();
    else if (actionKey === 'spell2') this.castGoldRush();
  }

  trainUnit(unitIdx: number): void {
    if (this.gameOver || this.isPaused) return;
    const spec = UNIT_CATALOG[unitIdx];
    if (!spec) return;
    if (!canAffordUnit(this.gold, unitIdx)) {
      ArcadeAudio.play('hurt');
      this.spawnPopup(this.width / 2, this.height * 0.32, `NEED ${spec.cost}🪙 GOLD!`, '#ef4444');
      return;
    }
    this.gold -= spec.cost;
    this.spawnUnit('player', spec.id);
    ArcadeAudio.play('click');
  }

  private spawnUnit(side: 'player' | 'enemy', id: UnitType): void {
    const spec = UNIT_CATALOG.find((u) => u.id === id) || UNIT_CATALOG[1];
    this.units.push({
      side,
      spec,
      x: side === 'player' ? 110 + Math.random() * 20 : this.worldW - 110 - Math.random() * 20,
      hp: spec.hp,
      maxHp: spec.hp,
      atkCd: 0.4,
      goldCarried: 0,
      miningDir: 1
    });
  }

  private getTopButtons() {
    const isCompactLandscape = this.width > this.height * 1.3 && this.height < 520;
    const topY = this.width < 460 ? 58 : isCompactLandscape ? 12 : 52;
    const leftPad = topY < 56 ? 148 : 9;
    const rightPad = topY < 56 ? 64 : 9;
    const availW = Math.max(220, this.width - leftPad - rightPad);
    const cols = UNIT_CATALOG.length;
    const gap = 3;
    const uW = Math.min(54, Math.floor(availW / cols) - gap);
    const totalUW = cols * (uW + gap) - gap;
    const uStartX = leftPad + (availW - totalUW) / 2;
    const uH = isCompactLandscape ? 38 : 42;

    const unitBtns = UNIT_CATALOG.map((u, idx) => ({
      idx,
      spec: u,
      x: uStartX + idx * (uW + gap),
      y: topY,
      w: uW,
      h: uH
    }));

    const stances: Array<{ id: ArmyStance | 'rage' | 'goldrush'; label: string }> = [
      { id: 'garrison', label: '🏰 RETREAT' },
      { id: 'defend', label: '🛡️ DEFEND' },
      { id: 'attack', label: '⚔️ ATTACK' },
      { id: 'rage', label: this.rageCd > 0 ? `🎺 ${Math.ceil(this.rageCd)}s` : '🎺 RAGE' },
      { id: 'goldrush', label: this.goldRushCd > 0 ? `💰 ${Math.ceil(this.goldRushCd)}s` : '💰 +140g' }
    ];
    const sAvailW = Math.max(220, this.width - (topY + uH + 4 < 56 ? 148 + 64 : 20));
    const sLeft = topY + uH + 4 < 56 ? 148 : 10;
    const sW = Math.min(82, Math.floor(sAvailW / stances.length) - 3);
    const totalSW = stances.length * (sW + 3) - 3;
    const sStartX = sLeft + (sAvailW - totalSW) / 2;
    const stanceBtns = stances.map((s, idx) => ({
      ...s,
      x: sStartX + idx * (sW + 3),
      y: topY + uH + 4,
      w: sW,
      h: isCompactLandscape ? 23 : 25
    }));

    return { unitBtns, stanceBtns };
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    const { unitBtns, stanceBtns } = this.getTopButtons();
    for (const ub of unitBtns) {
      if (x >= ub.x && x <= ub.x + ub.w && y >= ub.y && y <= ub.y + ub.h) {
        this.trainUnit(ub.idx);
        return;
      }
    }
    for (const sb of stanceBtns) {
      if (x >= sb.x && x <= sb.x + sb.w && y >= sb.y && y <= sb.y + sb.h) {
        if (sb.id === 'rage') this.castRageHorn();
        else if (sb.id === 'goldrush') this.castGoldRush();
        else this.setStance(sb.id);
        return;
      }
    }
    this.dragCam = { startX: x, camStart: this.camX };
  }

  onPointerMove(x: number): void {
    if (!this.dragCam || this.gameOver || this.isPaused) return;
    const maxCam = Math.max(0, this.worldW - this.width);
    this.camX = Math.max(0, Math.min(maxCam, this.dragCam.camStart + (this.dragCam.startX - x)));
  }

  onPointerUp(): void {
    this.dragCam = null;
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;
    this.groundY = Math.round(this.height * 0.78);
    this.gold += 9 * dt;
    if (this.rageTimer > 0) this.rageTimer -= dt;
    if (this.rageCd > 0) this.rageCd = Math.max(0, this.rageCd - dt);
    if (this.goldRushCd > 0) this.goldRushCd = Math.max(0, this.goldRushCd - dt);

    if (!this.dragCam && this.width < this.worldW) {
      let frontPlayer = 180;
      for (let i = 0; i < this.units.length; i++) {
        const u = this.units[i];
        if (u.side === 'player' && u.spec.id !== 'miner' && u.x > frontPlayer) {
          frontPlayer = u.x;
        }
      }
      const targetCam = Math.max(0, Math.min(this.worldW - this.width, frontPlayer - this.width * 0.45));
      this.camX += (targetCam - this.camX) * (1 - Math.exp(-1.4 * dt));
    }

    // Automated Castle Archers fire when defending/garrisoned and enemies approach Statue
    this.castleArcherCd -= dt;
    if (this.castleArcherCd <= 0 && (this.stance === 'defend' || this.stance === 'garrison')) {
      const threatNear = this.units.some((u) => u.side === 'enemy' && u.x < 460);
      if (threatNear) {
        this.castleArcherCd = 0.85;
        this.projectiles.push({
          side: 'player',
          kind: 'arrow',
          x: 92,
          y: this.groundY - 76,
          vx: 460,
          dmg: 18
        });
        ArcadeAudio.play('arrow');
      }
    }

    // AI wave trainer
    this.enemySpawnTimer -= dt;
    if (this.enemySpawnTimer <= 0) {
      this.enemySpawnTimer = Math.max(2.4, (4.8 - this.level * 0.25) / this.scaler.spawnMult);
      const pool: UnitType[] = ['sword', 'archidon', 'sword', 'spearton', 'magikill', 'albowtross', 'giant'];
      const maxPool = Math.min(pool.length, 3 + this.level);
      const pick = pool[Math.floor(Math.random() * maxPool)];
      this.spawnUnit('enemy', pick);
    }

    const mineX = 280;
    const playerHomeX = 95;
    const enemyStatueX = this.worldW - 80;
    const playerStatueX = 80;
    const playerBuff = this.rageTimer > 0 ? 1.55 : 1.0;

    for (let i = 0; i < this.units.length; i++) {
      const u = this.units[i];
      if (u.atkCd > 0) u.atkCd -= dt * (u.side === 'player' ? playerBuff : 1);

      if (u.spec.id === 'miner' && u.side === 'player') {
        if (this.stance === 'garrison') {
          if (u.x > playerHomeX) u.x -= u.spec.speed * dt;
        } else if (u.miningDir === 1) {
          if (u.x < mineX) u.x += u.spec.speed * dt;
          else {
            u.goldCarried += 20 * dt;
            if (u.goldCarried >= 30) u.miningDir = -1;
          }
        } else {
          if (u.x > playerHomeX) u.x -= u.spec.speed * dt;
          else {
            this.gold += Math.round(u.goldCarried);
            u.goldCarried = 0;
            u.miningDir = 1;
            ArcadeAudio.play('coin');
          }
        }
        continue;
      }

      // Meric healer heals injured allies behind the frontline
      if (u.spec.id === 'meric' && u.side === 'player') {
        let hurtAlly: WarUnit | null = null;
        let lowestRatio = 1;
        for (let k = 0; k < this.units.length; k++) {
          const a = this.units[k];
          if (a.side === 'player' && a.hp < a.maxHp && a !== u) {
            const ratio = a.hp / a.maxHp;
            if (ratio < lowestRatio) {
              lowestRatio = ratio;
              hurtAlly = a;
            }
          }
        }
        if (hurtAlly) {
          if (Math.abs(hurtAlly.x - u.x) <= u.spec.range) {
            if (u.atkCd <= 0) {
              u.atkCd = 1.1;
              hurtAlly.hp = Math.min(hurtAlly.maxHp, hurtAlly.hp + u.spec.dmg);
              this.spawnParticles(hurtAlly.x - this.camX, this.groundY - 28, '#4ade80', 4, 90);
            }
          } else {
            u.x += Math.sign(hurtAlly.x - u.x) * u.spec.speed * dt;
          }
          continue;
        }
      }

      const dir = u.side === 'player' ? 1 : -1;
      const spdMult = u.side === 'player' ? playerBuff : 1;
      let nearestFoe: WarUnit | null = null;
      let nearestDist = Infinity;
      for (let k = 0; k < this.units.length; k++) {
        const f = this.units[k];
        if (f.side === u.side) continue;
        const d = Math.abs(f.x - u.x);
        if (d < nearestDist) {
          nearestDist = d;
          nearestFoe = f;
        }
      }

      const targetStatueX = u.side === 'player' ? enemyStatueX : playerStatueX;
      const statueDist = Math.abs(targetStatueX - u.x);

      if (u.side === 'player' && this.stance === 'garrison') {
        if (u.x > playerHomeX + 10) u.x -= u.spec.speed * 1.15 * dt;
        continue;
      }

      if (u.side === 'player' && this.stance === 'defend') {
        const rallyX = 380;
        if (nearestFoe && nearestDist <= u.spec.range) {
          this.performUnitAttack(u, nearestFoe, false);
        } else if (Math.abs(u.x - rallyX) > 20) {
          u.x += Math.sign(rallyX - u.x) * u.spec.speed * spdMult * dt;
        }
        continue;
      }

      if (nearestFoe && nearestDist <= u.spec.range) {
        this.performUnitAttack(u, nearestFoe, false);
      } else if (statueDist <= u.spec.range + 22) {
        this.performUnitAttack(u, null, true);
      } else {
        u.x += dir * u.spec.speed * spdMult * dt;
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.x += pr.vx * dt;
      let hit = pr.x < 40 || pr.x > this.worldW - 40;
      for (let k = 0; k < this.units.length; k++) {
        const f = this.units[k];
        if (f.side === pr.side) continue;
        if (Math.abs(f.x - pr.x) < 18) {
          f.hp -= pr.dmg;
          hit = true;
          this.spawnParticles(pr.x - this.camX, pr.y, pr.kind === 'magic' ? '#a855f7' : '#fde047', 6, 120);
          break;
        }
      }
      if (!hit) {
        if (pr.side === 'player' && Math.abs(pr.x - enemyStatueX) < 28) {
          this.enemyStatueHp -= computeStatueDamage(pr.dmg, false);
          this.score += 10;
          hit = true;
        } else if (pr.side === 'enemy' && Math.abs(pr.x - playerStatueX) < 28) {
          this.playerStatueHp -= computeStatueDamage(pr.dmg, true);
          hit = true;
        }
      }
      if (hit) this.projectiles.splice(i, 1);
    }

    for (let i = this.units.length - 1; i >= 0; i--) {
      const u = this.units[i];
      if (u.hp <= 0) {
        this.units.splice(i, 1);
        if (u.side === 'enemy') {
          this.score += u.spec.id === 'giant' ? 120 : 45;
          this.gold += u.spec.id === 'giant' ? 40 : 16;
          addCoins(u.spec.id === 'giant' ? 3 : 1);
          addXp(7);
          ArcadeAudio.play('ko');
          updateInGameHud(this.score, this.level, 23);
        }
      }
    }

    if (this.enemyStatueHp <= 0) {
      this.enemyStatueHp = 0;
      this.score += 500;
      addCoins(25);
      addXp(60);
      this.level++;
      updateInGameHud(this.score, this.level, 23);
      this.gameOverSequence(true);
      return;
    } else if (this.playerStatueHp <= 0) {
      this.playerStatueHp = 0;
      this.gameOverSequence(false);
      return;
    }
  }

  private performUnitAttack(u: WarUnit, target: WarUnit | null, hitStatue: boolean): void {
    if (u.atkCd > 0) return;
    u.atkCd = u.spec.id === 'giant' ? 1.45 : u.spec.id === 'magikill' ? 1.3 : u.spec.id === 'archidon' || u.spec.id === 'albowtross' ? 0.9 : 0.72;
    if (u.spec.id === 'archidon' || u.spec.id === 'magikill' || u.spec.id === 'albowtross') {
      const dir = u.side === 'player' ? 1 : -1;
      this.projectiles.push({
        side: u.side,
        kind: u.spec.id === 'magikill' ? 'magic' : 'arrow',
        x: u.x + dir * 14,
        y: u.spec.id === 'albowtross' ? this.groundY - 58 : this.groundY - 30,
        vx: dir * 440,
        dmg: u.spec.dmg
      });
      ArcadeAudio.play(u.spec.id === 'magikill' ? 'magic' : 'arrow');
      return;
    }

    ArcadeAudio.play(u.spec.id === 'giant' ? 'explosion' : 'sword');
    if (target) {
      target.hp -= u.spec.dmg;
      this.spawnParticles(target.x - this.camX, this.groundY - 28, '#ffd700', 5, 100);
    } else if (hitStatue) {
      if (u.side === 'player') {
        this.enemyStatueHp -= computeStatueDamage(u.spec.dmg, false);
        this.score += 12;
        updateInGameHud(this.score, this.level, 23);
      } else {
        this.playerStatueHp -= computeStatueDamage(u.spec.dmg, true);
      }
      this.triggerShake(4, 0.1);
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const gY = Math.round(this.height * 0.78);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, gY);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, gY, this.width, this.height - gY);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, gY, this.width, 5);

    ctx.save();
    ctx.translate(-this.camX, 0);

    EmojiCache.draw(ctx, '🪨', 280, gY - 18, 40);
    EmojiCache.draw(ctx, '🪙', 284, gY - 26, 22);

    const stH = this.height < 440 ? Math.max(66, Math.round(this.height * 0.21)) : 96;
    const drawStatue = (sx: number, hp: number, maxHp: number, color: string, label: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(sx - 24, gY - stH, 48, stH, 8);
      ctx.fill();
      EmojiCache.draw(ctx, '🗿', sx, gY - Math.round(stH * 0.6), Math.round(stH * 0.5));
      ctx.fillStyle = '#000';
      ctx.fillRect(sx - 34, gY - stH - 18, 68, 8);
      ctx.fillStyle = color;
      ctx.fillRect(sx - 34, gY - stH - 18, 68 * Math.max(0, hp / maxHp), 8);
      ctx.font = '800 10px system-ui, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(label, sx, gY - stH - 24);
    };
    drawStatue(80, this.playerStatueHp, this.playerStatueMax, '#38bdf8', `YOUR STATUE ${Math.ceil(this.playerStatueHp)}`);
    drawStatue(this.worldW - 80, this.enemyStatueHp, this.enemyStatueMax, '#ef4444', `ENEMY ${Math.ceil(this.enemyStatueHp)}`);

    for (const u of this.units) {
      const isFly = u.spec.id === 'albowtross';
      const isGiant = u.spec.id === 'giant';
      const uy = isFly ? gY - 36 : gY;
      const col = u.side === 'player' ? (this.rageTimer > 0 ? '#facc15' : '#84fab0') : '#f87171';
      ctx.strokeStyle = col;
      ctx.lineWidth = isGiant ? 5 : 3.5;
      const headH = isGiant ? 54 : 38;
      ctx.beginPath();
      ctx.arc(u.x, uy - headH, isGiant ? 10 : 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(u.x, uy - (headH - 7));
      ctx.lineTo(u.x, uy - 14);
      ctx.moveTo(u.x, uy - 14);
      ctx.lineTo(u.x - 6, uy);
      ctx.moveTo(u.x, uy - 14);
      ctx.lineTo(u.x + 6, uy);
      ctx.stroke();
      EmojiCache.draw(ctx, u.spec.icon, u.x + (u.side === 'player' ? 12 : -12), uy - 26, isGiant ? 28 : 20);
      ctx.fillStyle = '#000';
      ctx.fillRect(u.x - 14, uy - headH - 16, 28, 3);
      ctx.fillStyle = col;
      ctx.fillRect(u.x - 14, uy - headH - 16, 28 * Math.max(0, u.hp / u.maxHp), 3);
    }

    for (const pr of this.projectiles) {
      ctx.fillStyle = pr.kind === 'magic' ? '#c084fc' : '#fde047';
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.kind === 'magic' ? 6 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const { unitBtns, stanceBtns } = this.getTopButtons();
    for (const ub of unitBtns) {
      const ok = this.gold >= ub.spec.cost;
      ctx.fillStyle = ok ? 'rgba(30, 41, 59, 0.92)' : 'rgba(15, 23, 42, 0.7)';
      ctx.strokeStyle = ok ? '#84fab0' : '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(ub.x, ub.y, ub.w, ub.h, 8);
      ctx.fill();
      ctx.stroke();
      EmojiCache.draw(ctx, ub.spec.icon, ub.x + ub.w / 2, ub.y + 15, 16);
      ctx.font = '800 9px system-ui, sans-serif';
      ctx.fillStyle = ok ? '#facc15' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(`${ub.spec.cost}g`, ub.x + ub.w / 2, ub.y + 36);
    }

    for (const sb of stanceBtns) {
      const act = this.stance === sb.id;
      ctx.fillStyle = act ? '#facc15' : sb.id === 'rage' && this.rageCd <= 0 ? '#7c2d12' : sb.id === 'goldrush' && this.goldRushCd <= 0 ? '#713f12' : 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.roundRect(sb.x, sb.y, sb.w, sb.h, 6);
      ctx.fill();
      ctx.font = '800 9.5px system-ui, sans-serif';
      ctx.fillStyle = act ? '#0f172a' : '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(sb.label, sb.x + sb.w / 2, sb.y + 16);
    }

    let armyCount = 0;
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].side === 'player') armyCount++;
    }
    ctx.font = '800 13px system-ui, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText(
      `🪙 Gold: ${Math.floor(this.gold)}   ·   Army: ${armyCount}${this.rageTimer > 0 ? `   ·   🎺 RAGE ${Math.ceil(this.rageTimer)}s` : ''}`,
      this.width / 2,
      this.height - 14
    );
    ctx.textAlign = 'left';
  }
}
