import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, setActionButtonLabel, updateHealthDisplay, updateInGameHud } from '../../core/runtimeBridge';
import { BaseFPSGame, FpsHitResult } from '../../core/BaseFPSGame';

export type TacticalMode = 'range' | 'sniper' | 'zombie';

export function pickRandomNextModeIndex(currentIdx: number | null, rng: () => number = Math.random): number {
  if (currentIdx === null || currentIdx < 0 || currentIdx > 2) {
    return Math.min(2, Math.floor(rng() * 3));
  }
  const choices = [0, 1, 2].filter((idx) => idx !== currentIdx);
  return choices[Math.min(choices.length - 1, Math.floor(rng() * choices.length))];
}

interface RangeTarget {
  x: number;
  y: number;
  r: number;
  laneIdx: number;
  kind: 'target' | 'moving' | 'coin' | 'friendly';
  vx: number;
  ttl: number;
  maxTtl: number;
  pop: number;
}

interface SniperIncident {
  civX: number;
  civY: number;
  threatX: number;
  threatY: number;
  vx: number;
  r: number;
  civIcon: string;
  badIcon: string;
  ttl: number;
  maxTtl: number;
}

interface ZombieUnit {
  laneX: number;
  z: number;
  hp: number;
  maxHp: number;
  icon: string;
  speed: number;
  pts: number;
  wobble: number;
}

interface RescueRunner {
  xFrac: number;
  dir: number;
  z: number;
  ttl: number;
}

interface SupplyCrate {
  laneX: number;
  z: number;
  ttl: number;
}

interface CityBuilding {
  xFrac: number;
  wFrac: number;
  hFrac: number;
  shade: string;
}

interface OpsBoss {
  active: boolean;
  name: string;
  icon: string;
  xFrac: number;
  yFrac: number;
  vx: number;
  hp: number;
  maxHp: number;
  missileCd: number;
  phaseShiftCount: number;
}

interface IncomingMissile {
  xFrac: number;
  yFrac: number;
  size: number;
  ttl: number;
}

export class TacticalOpsFPS extends BaseFPSGame {
  readonly modes: TacticalMode[] = ['range', 'sniper', 'zombie'];
  modeIdx = 0;
  mode: TacticalMode = 'range';
  zoomFactor = 2.4;
  waveKills = 0;
  waveTarget = 6;
  phaseTimer = 20;
  readonly phaseDuration = 20;
  phaseShifts = 0;

  bullseyeHits = 0;
  livesSaved = 0;
  zombiesSlain = 0;
  survivorsSaved = 0;

  targets: RangeTarget[] = [];
  incidents: SniperIncident[] = [];
  buildings: CityBuilding[] = [];
  zombies: ZombieUnit[] = [];
  rescues: RescueRunner[] = [];
  crates: SupplyCrate[] = [];
  boss: OpsBoss | null = null;
  missiles: IncomingMissile[] = [];

  spawnTimer = 0.25;
  crateTimer = 5.5;
  rescueTimer = 6.0;

  init(): void {
    this.initFPS(10, 0.85, 'shot');
    this.isScoped = false;
    this.zoomFactor = 2.4;
    this.waveKills = 0;
    this.waveTarget = 6;
    this.phaseTimer = this.phaseDuration;
    this.phaseShifts = 0;

    this.bullseyeHits = 0;
    this.livesSaved = 0;
    this.zombiesSlain = 0;
    this.survivorsSaved = 0;
    this.boss = null;
    this.missiles = [];

    this.buildings = this.makeCitySkyline();
    const initialIdx = pickRandomNextModeIndex(null);
    this.setMode(initialIdx, true);
  }

  private makeCitySkyline(): CityBuilding[] {
    const list: CityBuilding[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      list.push({
        xFrac: i / count,
        wFrac: 1 / count + 0.015,
        hFrac: 0.28 + ((i * 37) % 19) / 55,
        shade: i % 2 === 0 ? '#1e293b' : '#263348'
      });
    }
    return list;
  }

  syncActionButton(): void {
    if (this.mode === 'sniper') {
      setActionButtonLabel(this.isScoped ? 'ZOOM×1' : 'SCOPE');
    } else {
      setActionButtonLabel('RELOAD');
    }
  }

  private spawnBossEncounter(): void {
    const isHeli = Math.random() < 0.5;
    const hp = 14 + this.level * 4;
    this.boss = {
      active: true,
      name: isHeli ? '🚁 GUNSHIP APEX BOSS' : '🤖 TITAN JUGGERNAUT BOSS',
      icon: isHeli ? '🚁' : '🤖',
      xFrac: 0.5,
      yFrac: isHeli ? 0.28 : 0.48,
      vx: 0.24 * this.scaler.speedMult,
      hp,
      maxHp: hp,
      missileCd: 3.4,
      phaseShiftCount: this.phaseShifts
    };
    this.missiles = [];
    ArcadeAudio.play('warHorn');
    this.spawnPopup(this.width / 2, this.height * 0.26, `⚠️ ${this.boss.name}!`, '#facc15');
  }

  setMode(idx: number, announce = true): void {
    this.modeIdx = ((idx % 3) + 3) % 3;
    this.mode = this.modes[this.modeIdx];
    this.waveKills = 0;
    this.phaseTimer = this.phaseDuration;
    this.isScoped = false;
    this.isReloading = false;
    if (this.mode === 'range') {
      this.maxAmmo = 10;
      this.ammo = 10;
      this.reloadDuration = 0.85;
      this.sfxType = 'shot';
    } else if (this.mode === 'sniper') {
      this.maxAmmo = 6;
      this.ammo = 6;
      this.reloadDuration = 1.05;
      this.sfxType = 'sniper';
    } else {
      this.maxAmmo = 12;
      this.ammo = 12;
      this.reloadDuration = 0.9;
      this.sfxType = 'shot';
    }
    this.targets = [];
    this.incidents = [];
    this.zombies = [];
    this.rescues = [];
    this.crates = [];
    this.missiles = [];
    this.boss = null;
    this.spawnTimer = 0.2;
    this.crateTimer = 5.5;
    this.rescueTimer = 6.0;
    this.syncActionButton();

    if (this.phaseShifts > 0 && this.phaseShifts % 2 === 0) {
      this.spawnBossEncounter();
    } else if (announce) {
      ArcadeAudio.play('levelup');
      const labels: Record<TacticalMode, string> = {
        range: '🎯 OPS SHIFT: TARGET RANGE!',
        sniper: '🔭 OPS SHIFT: SNIPER RESCUE!',
        zombie: '🧟 OPS SHIFT: ZOMBIE SIEGE!'
      };
      this.spawnPopup(this.width / 2, this.height * 0.34, labels[this.mode], '#ffd700');
    }
  }

  toggleScope(): void {
    if (this.gameOver || this.isPaused) return;
    if (this.mode !== 'sniper') return;
    this.isScoped = !this.isScoped;
    this.syncActionButton();
    ArcadeAudio.play('reload');
  }

  private switchToRandomNextMode(): void {
    this.level++;
    this.phaseShifts++;
    updateInGameHud(this.score, this.level, 7);
    const nextIdx = pickRandomNextModeIndex(this.modeIdx);
    this.setMode(nextIdx, true);
  }

  private advanceWaveCheck(): void {
    this.waveKills++;
    if (this.waveKills >= this.waveTarget && !this.boss) {
      this.switchToRandomNextMode();
    }
  }

  private spawnTarget(): void {
    const lanes = [0.38, 0.54, 0.7];
    const laneIdx = Math.floor(Math.random() * 3);
    const railY = this.height * lanes[laneIdx];
    const scaleFactor = 0.74 + laneIdx * 0.22;
    const r = Math.max(20, Math.min(40, Math.min(this.width, this.height) * 0.068)) * scaleFactor;
    const margin = r + 26;
    const x = margin + Math.random() * Math.max(20, this.width - margin * 2);
    const roll = Math.random();
    let kind: RangeTarget['kind'] = 'target';
    if (roll < 0.14) kind = 'coin';
    else if (roll < 0.28) kind = 'friendly';
    else if (roll < 0.54) kind = 'moving';
    const maxTtl = Math.max(2.1, (4.3 - this.level * 0.12) / this.scaler.speedMult);
    const vx =
      (kind === 'moving' ? (Math.random() < 0.5 ? -1 : 1) * (95 + this.level * 12) : 0) *
      this.scaler.speedMult;
    this.targets.push({ x, y: railY, r, laneIdx, kind, vx, ttl: maxTtl, maxTtl, pop: 0 });
  }

  private spawnIncident(): void {
    const side = Math.random() < 0.5 ? -1 : 1;
    const margin = Math.max(58, this.width * 0.14);
    const civX = margin + Math.random() * Math.max(40, this.width - margin * 2);
    const baseY = this.height * (0.43 + Math.random() * 0.34);
    const gap = Math.max(44, Math.min(72, this.width * 0.12));
    const threatX = Math.max(36, Math.min(this.width - 36, civX + side * gap));
    const civIcons = ['🧑‍⚕️', '👩', '🧑'];
    const badIcons = ['🦹', '🥷', '🤖'];
    const maxTtl = Math.max(2.7, (5.4 - this.level * 0.15) / this.scaler.speedMult);
    this.incidents.push({
      civX,
      civY: baseY,
      threatX,
      threatY: baseY - (Math.random() * 14 - 7),
      vx: this.level >= 2 && Math.random() < 0.45 ? (Math.random() < 0.5 ? -28 : 28) : 0,
      r: Math.max(20, Math.min(30, Math.min(this.width, this.height) * 0.048)),
      civIcon: civIcons[Math.floor(Math.random() * civIcons.length)],
      badIcon: badIcons[Math.floor(Math.random() * badIcons.length)],
      ttl: maxTtl,
      maxTtl
    });
  }

  private spawnZombie(): void {
    const laneX = (Math.random() - 0.5) * 1.45;
    const roll = Math.random();
    let icon = '🧟';
    let hp = 1;
    let speed = 0.145;
    let pts = 25;
    if (this.level >= 2 && roll < 0.28) {
      icon = '🧟‍♂️';
      hp = 1;
      speed = 0.205;
      pts = 35;
    } else if (this.level >= 3 && roll > 0.8) {
      icon = '👹';
      hp = 3;
      speed = 0.105;
      pts = 75;
    }
    speed *= this.scaler.speedMult * (1 + this.level * 0.045);
    this.zombies.push({ laneX, z: 1.0, hp, maxHp: hp, icon, speed, pts, wobble: Math.random() * 6 });
  }

  private projectZ(laneX: number, z: number): { x: number; y: number; size: number } {
    const { cx, cy } = this.getCamOffset(24);
    const horizY = this.height * 0.35 + cy * 0.4;
    const groundBottom = this.height * 0.84 + cy * 0.8;
    const depthT = Math.max(0.08, 1 - z);
    const screenY = horizY + (groundBottom - horizY) * depthT;
    const spread = this.width * 0.46 * depthT;
    const screenX = this.width / 2 + cx * depthT + laneX * spread;
    const size = Math.max(
      18,
      Math.min(96, Math.min(this.width, this.height) * (0.045 + 0.145 * depthT))
    );
    return { x: screenX, y: screenY - size * 0.45, size };
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.updateFPSBase(dt);

    // Boss Movement & Shootable Incoming Missiles
    if (this.boss && this.boss.active) {
      this.boss.xFrac += this.boss.vx * dt;
      if (this.boss.xFrac < 0.16 || this.boss.xFrac > 0.84) {
        this.boss.vx *= -1;
        this.boss.xFrac = Math.max(0.16, Math.min(0.84, this.boss.xFrac));
      }
      this.boss.missileCd -= dt;
      if (this.boss.missileCd <= 0) {
        this.boss.missileCd = Math.max(1.8, 3.6 - this.level * 0.2);
        this.missiles.push({
          xFrac: this.boss.xFrac,
          yFrac: this.boss.yFrac + 0.06,
          size: 18,
          ttl: 2.8
        });
      }
      for (let i = this.missiles.length - 1; i >= 0; i--) {
        const m = this.missiles[i];
        m.ttl -= dt;
        m.size += dt * 15;
        m.yFrac += dt * 0.08;
        if (m.ttl <= 0) {
          this.missiles.splice(i, 1);
          this.lives--;
          this.damageFlash = 1;
          ArcadeAudio.play('explosion');
          this.triggerShake(9, 0.2);
          this.spawnPopup(this.width / 2, this.height * 0.42, '💥 BOSS MISSILE HIT!', '#ef4444');
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) {
            this.gameOverSequence();
            return;
          }
        }
      }
    } else {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.switchToRandomNextMode();
        return;
      }
    }

    this.spawnTimer -= dt;

    if (this.mode === 'range') {
      const maxActive = Math.min(6, 2 + Math.floor(this.level / 2));
      if (this.spawnTimer <= 0 && this.targets.length < maxActive) {
        this.spawnTarget();
        this.spawnTimer = Math.max(0.45, (1.12 - this.level * 0.05) / this.scaler.spawnMult);
      }
      const { cx, cy } = this.getCamOffset(22);
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        t.pop = Math.min(1, t.pop + dt * 8);
        t.y = this.height * [0.38, 0.54, 0.7][t.laneIdx] + cy * (0.5 + t.laneIdx * 0.25);
        if (t.vx) {
          t.x += t.vx * dt;
          if (t.x < t.r + 22 || t.x > this.width - t.r - 22) t.vx *= -1;
        }
        t.ttl -= dt;
        if (t.ttl <= 0) {
          if (t.kind === 'target' || t.kind === 'moving') {
            this.lives--;
            this.streak = 0;
            this.damageFlash = 0.7;
            ArcadeAudio.play('hurt');
            this.triggerShake(6, 0.15);
            this.spawnPopup(t.x + cx, t.y - t.r, 'MISSED!', '#ff6b6b');
            updateHealthDisplay(this.lives, this.maxLives);
            if (this.lives <= 0) {
              this.gameOverSequence();
              return;
            }
          }
          this.targets.splice(i, 1);
        }
      }
    } else if (this.mode === 'sniper') {
      const maxInc = Math.min(4, 1 + Math.floor(this.level / 2));
      if (this.spawnTimer <= 0 && this.incidents.length < maxInc) {
        this.spawnIncident();
        this.spawnTimer = Math.max(0.75, (1.8 - this.level * 0.07) / this.scaler.spawnMult);
      }
      for (let i = this.incidents.length - 1; i >= 0; i--) {
        const inc = this.incidents[i];
        if (inc.vx) {
          inc.threatX += inc.vx * dt;
          inc.civX += inc.vx * dt * 0.5;
          if (inc.threatX < 40 || inc.threatX > this.width - 40) inc.vx *= -1;
        }
        inc.ttl -= dt;
        if (inc.ttl <= 0) {
          this.incidents.splice(i, 1);
          this.lives--;
          this.streak = 0;
          this.damageFlash = 1;
          ArcadeAudio.play('hurt');
          this.triggerShake(7, 0.16);
          this.spawnPopup(inc.civX, inc.civY - 22, '💔 LIFE LOST!', '#ff4757');
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) {
            this.gameOverSequence();
            return;
          }
        }
      }
    } else {
      this.crateTimer -= dt;
      this.rescueTimer -= dt;
      const maxZ = Math.min(9, 3 + this.level);
      if (this.spawnTimer <= 0 && this.zombies.length < maxZ) {
        this.spawnZombie();
        this.spawnTimer = Math.max(0.45, (1.42 - this.level * 0.07) / this.scaler.spawnMult);
      }
      if (this.crateTimer <= 0) {
        this.crateTimer = 8 + Math.random() * 5;
        this.crates.push({ laneX: (Math.random() - 0.5) * 1.1, z: 0.72, ttl: 4.5 });
      }
      if (this.rescueTimer <= 0) {
        this.rescueTimer = 8.5 + Math.random() * 5;
        const side = Math.random() < 0.5 ? -1 : 1;
        this.rescues.push({ xFrac: side < 0 ? 0.08 : 0.92, dir: -side, z: 0.52, ttl: 5.0 });
      }
      for (let i = this.zombies.length - 1; i >= 0; i--) {
        const zb = this.zombies[i];
        zb.z -= zb.speed * dt;
        zb.wobble += dt * 7;
        if (zb.z <= 0.1) {
          this.lives--;
          this.streak = 0;
          this.damageFlash = 1;
          ArcadeAudio.play('hurt');
          this.triggerShake(8, 0.18);
          zb.z = 0.44;
          updateHealthDisplay(this.lives, this.maxLives);
          const p = this.projectZ(zb.laneX, zb.z);
          this.spawnPopup(p.x, p.y - 20, 'BREACHED! -1❤️', '#ff4757');
          if (this.lives <= 0) {
            this.gameOverSequence();
            return;
          }
        }
      }
      for (let i = this.crates.length - 1; i >= 0; i--) {
        this.crates[i].ttl -= dt;
        if (this.crates[i].ttl <= 0) this.crates.splice(i, 1);
      }
      for (let i = this.rescues.length - 1; i >= 0; i--) {
        const r = this.rescues[i];
        r.xFrac += r.dir * 0.16 * dt;
        r.ttl -= dt;
        if (r.xFrac < 0 || r.xFrac > 1 || r.ttl <= 0) this.rescues.splice(i, 1);
      }
    }
  }

  private screenToWorld(sx: number, sy: number, pointerType = 'mouse', prevAimX = sx, prevAimY = sy): { wx: number; wy: number } {
    const { cx, cy } = this.getCamOffset(26);
    if (this.isScoped && pointerType === 'touch') {
      const swayX = Math.sin(this.clockTime * 2.4) * 5;
      const swayY = Math.cos(this.clockTime * 3.1) * 4;
      const lensCx = prevAimX + swayX;
      const lensCy = prevAimY + swayY;
      const lensR = Math.max(85, Math.min(this.width, this.height) * 0.36);
      if (Math.hypot(sx - lensCx, sy - lensCy) <= lensR) {
        const unzoomedX = lensCx + (sx - lensCx) / this.zoomFactor;
        const unzoomedY = lensCy + (sy - lensCy) / this.zoomFactor;
        return { wx: unzoomedX - cx, wy: unzoomedY - cy };
      }
    }
    return { wx: sx - cx, wy: sy - cy };
  }

  override onFire(
    sx: number,
    sy: number,
    pointerType = 'mouse',
    prevAimX = sx,
    prevAimY = sy
  ): FpsHitResult {
    // Shootable Boss Missiles take top priority
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      const mx = m.xFrac * this.width;
      const my = m.yFrac * this.height;
      if (Math.hypot(sx - mx, sy - my) <= m.size + 14) {
        this.missiles.splice(i, 1);
        this.score += 60;
        addCoins(2);
        ArcadeAudio.play('hit');
        this.spawnParticles(mx, my, '#facc15', 10, 170);
        this.spawnPopup(mx, my - 12, '🚀 INTERCEPT +60', '#84fab0');
        updateInGameHud(this.score, this.level, 7);
        return 'crit';
      }
    }

    // Armored Boss Target Check
    if (this.boss && this.boss.active) {
      const bx = this.boss.xFrac * this.width;
      const by = this.boss.yFrac * this.height;
      if (Math.hypot(sx - bx, sy - by) <= 52) {
        const isWeakspot = Math.abs(sx - bx) < 18 && sy <= by;
        const dmg = isWeakspot ? 3 : 1;
        this.boss.hp -= dmg;
        this.score += isWeakspot ? 45 : 20;
        ArcadeAudio.play(isWeakspot ? 'headshot' : 'hit');
        this.spawnParticles(sx, sy, isWeakspot ? '#facc15' : '#fb923c', 10, 160);
        if (this.boss.hp <= 0) {
          this.boss = null;
          this.missiles = [];
          this.score += 350;
          addCoins(15);
          addXp(35);
          ArcadeAudio.play('win');
          this.spawnPopup(bx, by, '🏆 BOSS DESTROYED! +350 (+15🪙)', '#facc15');
          updateInGameHud(this.score, this.level, 7);
          this.switchToRandomNextMode();
          return 'crit';
        }
        updateInGameHud(this.score, this.level, 7);
        this.spawnPopup(sx, sy - 14, isWeakspot ? 'CRIT ×3!' : 'HIT', '#facc15');
        return isWeakspot ? 'crit' : 'hit';
      }
    }

    if (this.mode === 'range') {
      const { cx } = this.getCamOffset(22);
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const t = this.targets[i];
        const tx = t.x + cx * (0.5 + t.laneIdx * 0.25);
        const dist = Math.hypot(sx - tx, sy - t.y);
        if (dist <= t.r + 12) {
          if (t.kind === 'friendly') {
            this.targets.splice(i, 1);
            this.lives--;
            this.streak = 0;
            this.damageFlash = 1;
            ArcadeAudio.play('hurt');
            this.triggerShake(7, 0.16);
            this.spawnParticles(tx, t.y, '#ff4757', 12, 180);
            this.spawnPopup(tx, t.y - 16, 'FRIENDLY! -1❤️', '#ff4757');
            updateHealthDisplay(this.lives, this.maxLives);
            if (this.lives <= 0) this.gameOverSequence();
            return 'bad';
          }
          if (t.kind === 'coin') {
            this.targets.splice(i, 1);
            this.streak++;
            addCoins(3);
            this.score += 30;
            addXp(8);
            ArcadeAudio.play('save');
            updateInGameHud(this.score, this.level, 7);
            this.spawnParticles(tx, t.y, '#ffd700', 12, 190);
            this.spawnPopup(tx, t.y - 16, '+3🪙 GOLD!', '#ffd700');
            return 'crit';
          }
          const isBullseye = dist <= t.r * 0.44;
          this.targets.splice(i, 1);
          this.streak++;
          const basePts = (t.kind === 'moving' ? 30 : 20) + (2 - t.laneIdx) * 10;
          const mult = Math.min(4, 1 + Math.floor(this.streak / 3)) * (isBullseye ? 2 : 1);
          const pts = basePts * mult;
          this.score += pts;
          if (isBullseye) {
            this.bullseyeHits++;
            addCoins(1);
            addXp(6);
            ArcadeAudio.play('headshot');
          } else {
            addXp(3);
            ArcadeAudio.play('hit');
          }
          updateInGameHud(this.score, this.level, 7);
          this.spawnParticles(tx, t.y, isBullseye ? '#ffd700' : '#ff6b6b', 10, 175);
          this.spawnPopup(
            tx,
            t.y - 16,
            isBullseye ? `🎯 BULLSEYE +${pts}` : `+${pts}`,
            isBullseye ? '#ffd700' : '#84fab0'
          );
          this.advanceWaveCheck();
          return isBullseye ? 'crit' : 'hit';
        }
      }
      this.streak = 0;
      return false;
    }

    if (this.mode === 'sniper') {
      const { wx, wy } = this.screenToWorld(sx, sy, pointerType, prevAimX, prevAimY);
      for (let i = this.incidents.length - 1; i >= 0; i--) {
        const inc = this.incidents[i];
        const hitDist = Math.hypot(wx - inc.threatX, wy - inc.threatY);
        if (hitDist <= inc.r + 12) {
          const isHeadshot = wy < inc.threatY - inc.r * 0.15 || hitDist <= inc.r * 0.45;
          this.incidents.splice(i, 1);
          this.livesSaved++;
          this.streak++;
          const rounded = Math.round((isHeadshot ? 80 : 45) * (this.isScoped ? 1.5 : 1));
          this.score += rounded;
          const coins = isHeadshot || this.isScoped ? 3 : 2;
          addCoins(coins);
          addXp(isHeadshot ? 12 : 8);
          updateInGameHud(this.score, this.level, 7);
          ArcadeAudio.play(isHeadshot ? 'headshot' : 'save');
          this.spawnParticles(sx, sy, '#2ecc71', 12, 180);
          this.spawnPopup(
            sx,
            sy - 18,
            `💚 SAVED! +${rounded} (+${coins}🪙)`,
            isHeadshot ? '#ffd700' : '#84fab0'
          );
          this.advanceWaveCheck();
          return isHeadshot ? 'crit' : 'hit';
        }
        if (Math.hypot(wx - inc.civX, wy - inc.civY) <= inc.r + 4) {
          this.incidents.splice(i, 1);
          this.lives--;
          this.streak = 0;
          this.damageFlash = 1;
          ArcadeAudio.play('hurt');
          this.triggerShake(8, 0.18);
          this.spawnParticles(sx, sy, '#ff4757', 14, 190);
          this.spawnPopup(sx, sy - 18, '⚠️ CIVILIAN HIT! -1❤️', '#ff4757');
          updateHealthDisplay(this.lives, this.maxLives);
          if (this.lives <= 0) this.gameOverSequence();
          return 'bad';
        }
      }
      this.streak = 0;
      return false;
    }

    for (let i = this.crates.length - 1; i >= 0; i--) {
      const c = this.crates[i];
      const p = this.projectZ(c.laneX, c.z);
      if (Math.hypot(sx - p.x, sy - p.y) <= p.size * 0.75 + 12) {
        this.crates.splice(i, 1);
        this.ammo = this.maxAmmo;
        this.isReloading = false;
        if (this.lives < this.maxLives) {
          this.lives++;
          updateHealthDisplay(this.lives, this.maxLives);
        }
        addCoins(4);
        this.score += 40;
        updateInGameHud(this.score, this.level, 7);
        ArcadeAudio.play('save');
        this.spawnParticles(p.x, p.y, '#2ecc71', 12, 170);
        this.spawnPopup(p.x, p.y - 14, '🧰 HEAL +4🪙', '#84fab0');
        return 'crit';
      }
    }
    let bestIdx = -1;
    let bestZ = Infinity;
    let bestHitP: { x: number; y: number; size: number } | null = null;
    for (let idx = 0; idx < this.zombies.length; idx++) {
      const zb = this.zombies[idx];
      if (zb.z >= bestZ) continue;
      const p = this.projectZ(zb.laneX, zb.z);
      const hitR = p.size * 0.62 + 12;
      if (Math.hypot(sx - p.x, sy - p.y) <= hitR) {
        bestZ = zb.z;
        bestIdx = idx;
        bestHitP = p;
      }
    }
    if (bestIdx >= 0 && bestHitP) {
      const zb = this.zombies[bestIdx];
      const p = bestHitP;
      const isHead = sy - p.y < -p.size * 0.12;
      zb.hp -= isHead ? 2 : 1;
      zb.z = Math.min(0.95, zb.z + 0.12);
      if (zb.hp <= 0) {
        this.zombies.splice(bestIdx, 1);
        this.zombiesSlain++;
        this.streak++;
        let rescueBonus = 0;
        if (this.rescues.length > 0) {
          this.rescues.pop();
          this.survivorsSaved++;
          rescueBonus = 40;
          addCoins(2);
        }
        const pts = zb.pts * (isHead ? 2 : 1) + rescueBonus;
        this.score += pts;
        addCoins(isHead ? 2 : 1);
        addXp(isHead ? 10 : 5);
        updateInGameHud(this.score, this.level, 7);
        ArcadeAudio.play(isHead ? 'headshot' : 'hit');
        this.spawnParticles(p.x, p.y, isHead ? '#ffd700' : '#2ecc71', 11, 185);
        this.spawnPopup(
          p.x,
          p.y - 18,
          rescueBonus ? `💚 SAVED +${pts}` : isHead ? `💀 HEADSHOT +${pts}` : `+${pts}`,
          isHead ? '#ffd700' : '#84fab0'
        );
        this.advanceWaveCheck();
        return isHead ? 'crit' : 'hit';
      }
      ArcadeAudio.play('zombieHit');
      this.spawnParticles(p.x, p.y, '#ff9f43', 7, 130);
      this.spawnPopup(p.x, p.y - 16, isHead ? 'CRIT!' : 'HIT', '#ffd700');
      return isHead ? 'crit' : 'hit';
    }
    this.streak = 0;
    return false;
  }

  private drawSniperWorld(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number): void {
    const ox = Math.round(offsetX);
    const oy = Math.round(offsetY);
    const horizY = Math.round(this.height * 0.48 + oy * 0.4);
    ctx.fillStyle = '#0b1026';
    ctx.fillRect(0, 0, this.width, Math.round(horizY * 0.55));
    ctx.fillStyle = '#1e2547';
    ctx.fillRect(0, Math.round(horizY * 0.55), this.width, Math.max(0, horizY - Math.round(horizY * 0.55)));
    for (const b of this.buildings) {
      const bx = Math.round(b.xFrac * this.width + ox * 0.45);
      const bw = Math.round(b.wFrac * this.width);
      const bh = Math.round(b.hFrac * this.height);
      const by = Math.round(this.height * 0.5 - bh + oy * 0.4);
      ctx.fillStyle = b.shade;
      ctx.fillRect(bx, by, bw, bh + 30);
    }
    ctx.fillStyle = 'rgba(255, 215, 100, 0.25)';
    for (const b of this.buildings) {
      const bx = Math.round(b.xFrac * this.width + ox * 0.45);
      const bw = Math.round(b.wFrac * this.width);
      const bh = Math.round(b.hFrac * this.height);
      const by = Math.round(this.height * 0.5 - bh + oy * 0.4);
      const ww = Math.max(6, Math.round(bw * 0.18));
      for (let wy = by + 14; wy < by + bh - 14; wy += 34) {
        ctx.fillRect(bx + 8, wy, ww, 9);
        ctx.fillRect(bx + Math.round(bw * 0.55), wy, ww, 9);
      }
    }
    const floorY = Math.round(this.height * 0.46 + oy * 0.5);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, floorY, this.width, this.height - floorY);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, floorY, this.width, 6);
    for (const inc of this.incidents) {
      const cx = inc.civX + offsetX;
      const cy = inc.civY + offsetY;
      const tx = inc.threatX + offsetX;
      const ty = inc.threatY + offsetY;
      const ratio = Math.max(0, inc.ttl / inc.maxTtl);
      ctx.strokeStyle = ratio > 0.35 ? 'rgba(231, 76, 60, 0.7)' : '#ff4757';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(46, 204, 113, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, inc.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.stroke();
      EmojiCache.draw(ctx, inc.civIcon, cx, cy, Math.round(inc.r * 1.4));
      ctx.font = '800 10px system-ui, sans-serif';
      ctx.fillStyle = '#84fab0';
      ctx.textAlign = 'center';
      ctx.fillText('🆘 SAVE', cx, cy - inc.r - 5);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.26)';
      ctx.beginPath();
      ctx.arc(tx, ty, inc.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tx, ty, inc.r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
      ctx.stroke();
      EmojiCache.draw(ctx, inc.badIcon, tx, ty, Math.round(inc.r * 1.45));
    }
  }

  private drawBossLayer(ctx: CanvasRenderingContext2D): void {
    if (!this.boss || !this.boss.active) return;
    const bx = this.boss.xFrac * this.width;
    const by = this.boss.yFrac * this.height;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(bx, by, 44, 0, Math.PI * 2);
    ctx.stroke();
    EmojiCache.draw(ctx, this.boss.icon, bx, by, 68);

    const bw = Math.min(200, this.width * 0.45);
    const bBarY = this.width < 460 ? 58 : 48;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath();
    ctx.roundRect((this.width - bw) / 2, bBarY, bw, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect((this.width - bw) / 2 + 2, bBarY + 2, (bw - 4) * Math.max(0, this.boss.hp / this.boss.maxHp), 10, 5);
    ctx.fill();
    ctx.font = '800 9.5px system-ui, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText(this.boss.name, this.width / 2, bBarY + 25);
    ctx.textAlign = 'left';

    for (const m of this.missiles) {
      const mx = m.xFrac * this.width;
      const my = m.yFrac * this.height;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, m.size, 0, Math.PI * 2);
      ctx.stroke();
      EmojiCache.draw(ctx, '🚀', mx, my, Math.round(m.size * 1.3));
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const phaseLeft = Math.max(1, Math.ceil(this.phaseTimer));
    if (this.mode === 'range') {
      const { cx, cy } = this.getCamOffset(22);
      const horizY = Math.round(this.height * 0.3 + cy * 0.35);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, this.width, Math.round(horizY * 0.55));
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, Math.round(horizY * 0.55), this.width, Math.max(0, horizY - Math.round(horizY * 0.55)));
      ctx.fillStyle = '#27303f';
      ctx.fillRect(0, horizY, this.width, Math.round((this.height - horizY) * 0.45));
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, Math.round(horizY + (this.height - horizY) * 0.45), this.width, this.height - Math.round(horizY + (this.height - horizY) * 0.45));

      const vpX = this.width / 2 + cx * 0.4;
      ctx.strokeStyle = 'rgba(132, 250, 176, 0.14)';
      ctx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) {
        ctx.beginPath();
        ctx.moveTo(vpX + k * (this.width * 0.06), horizY);
        ctx.lineTo(vpX + k * (this.width * 0.28), this.height);
        ctx.stroke();
      }
      [0.38, 0.54, 0.7].forEach((frac, idx) => {
        const ry = this.height * frac + cy * (0.5 + idx * 0.25) + 12;
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(0, ry, this.width, 4);
      });
      const sortedTargets = [...this.targets].sort((a, b) => a.laneIdx - b.laneIdx);
      for (const t of sortedTargets) {
        const tx = t.x + cx * (0.5 + t.laneIdx * 0.25);
        ctx.save();
        ctx.translate(tx, t.y);
        ctx.scale(t.pop, t.pop);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-3, t.r * 0.6, 6, 22);
        if (t.kind === 'coin') {
          EmojiCache.draw(ctx, '🪙', 0, 0, Math.round(t.r * 1.4));
        } else if (t.kind === 'friendly') {
          ctx.fillStyle = '#27ae60';
          ctx.beginPath();
          ctx.arc(0, 0, t.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          EmojiCache.draw(ctx, '🙋', 0, -2, Math.round(t.r * 1.15));
        } else {
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(0, 0, t.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, t.r * 0.68, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e74c3c';
          ctx.beginPath();
          ctx.arc(0, 0, t.r * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(0, 0, t.r * 0.16, 0, Math.PI * 2);
          ctx.fill();
          const ratio = Math.max(0, t.ttl / t.maxTtl);
          ctx.strokeStyle = ratio > 0.4 ? '#84fab0' : '#ff4757';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, t.r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          ctx.stroke();
        }
        ctx.restore();
      }
      this.drawBossLayer(ctx);
      this.drawWeaponViewmodel('#334155', '#38bdf8', 'carbine');
      this.drawCrosshair(this.aimX, this.aimY, '#84fab0', 17);
      this.drawFPSHudOverlay(
        this.boss ? `🎯 BOSS RAID · Shoot Weakspot & Rockets!` : `🎯 Range ${this.waveKills}/${this.waveTarget} · Next Shift ${phaseLeft}s · Bullseyes: ${this.bullseyeHits}`
      );
    } else if (this.mode === 'sniper') {
      const { cx, cy } = this.getCamOffset(26);
      this.drawSniperWorld(ctx, cx, cy);
      if (this.isScoped) {
        const lensR = Math.max(85, Math.min(this.width, this.height) * 0.36);
        const swayX = Math.sin(this.clockTime * 2.4) * 5;
        const swayY = Math.cos(this.clockTime * 3.1) * 4;
        const sx = this.aimX + swayX;
        const sy = this.aimY + swayY;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, lensR, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(sx, sy);
        ctx.scale(this.zoomFactor, this.zoomFactor);
        ctx.translate(-sx, -sy);
        this.drawSniperWorld(ctx, cx, cy);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#84fab0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sx, sy, lensR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx - lensR, sy);
        ctx.lineTo(sx + lensR, sy);
        ctx.moveTo(sx, sy - lensR);
        ctx.lineTo(sx, sy + lensR);
        ctx.stroke();
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        this.drawWeaponViewmodel('#1e293b', '#84fab0', 'sniper');
        this.drawCrosshair(this.aimX, this.aimY, '#84fab0', 18);
      }
      this.drawBossLayer(ctx);
      this.drawFPSHudOverlay(
        this.boss ? `🔭 BOSS RAID · Shoot Boss & Rockets!` : `🔭 Sniper ${this.waveKills}/${this.waveTarget} · Next Shift ${phaseLeft}s · Saved ${this.livesSaved}`
      );
    } else {
      const { cx, cy } = this.getCamOffset(24);
      const horizY = Math.round(this.height * 0.35 + cy * 0.4);
      const midSky = Math.round(horizY * 0.52);
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, this.width, midSky);
      ctx.fillStyle = '#131d2b';
      ctx.fillRect(0, midSky, this.width, Math.max(0, horizY - midSky));
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.beginPath();
      ctx.arc(this.width * 0.78 + cx * 0.3, horizY * 0.42, Math.min(28, this.height * 0.055), 0, Math.PI * 2);
      ctx.fill();
      const midGround = Math.round(horizY + (this.height - horizY) * 0.45);
      ctx.fillStyle = '#14261c';
      ctx.fillRect(0, horizY, this.width, Math.max(0, midGround - horizY));
      ctx.fillStyle = '#0b140f';
      ctx.fillRect(0, midGround, this.width, Math.max(0, this.height - midGround));
      const vpX = this.width / 2 + cx * 0.4;
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.14)';
      ctx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) {
        ctx.beginPath();
        ctx.moveTo(vpX + k * 24, horizY);
        ctx.lineTo(vpX + k * (this.width * 0.25), this.height);
        ctx.stroke();
      }
      for (const r of this.rescues) {
        const p = this.projectZ((r.xFrac - 0.5) * 1.4, r.z);
        EmojiCache.draw(ctx, '🏃‍♀️', p.x, p.y, Math.round(p.size), 0, r.dir > 0 ? -1 : 1, 1);
        ctx.font = '800 10px system-ui, sans-serif';
        ctx.fillStyle = '#84fab0';
        ctx.textAlign = 'center';
        ctx.fillText('🆘 COVER ME!', p.x, p.y - p.size * 0.65);
      }
      for (const c of this.crates) {
        const p = this.projectZ(c.laneX, c.z);
        EmojiCache.draw(ctx, '🧰', p.x, p.y + Math.sin(this.clockTime * 5) * 4, Math.round(p.size * 0.9));
      }
      const sortedZombies = [...this.zombies].sort((a, b) => b.z - a.z);
      for (const zb of sortedZombies) {
        const p = this.projectZ(zb.laneX, zb.z);
        const sway = Math.sin(zb.wobble) * 0.08;
        EmojiCache.draw(ctx, zb.icon, p.x, p.y, Math.round(p.size), sway);
        if (zb.maxHp > 1) {
          const bw = p.size * 0.8;
          ctx.fillStyle = 'rgba(0,0,0,0.65)';
          ctx.fillRect(p.x - bw / 2, p.y - p.size * 0.72, bw, 5);
          ctx.fillStyle = '#ff4757';
          ctx.fillRect(p.x - bw / 2, p.y - p.size * 0.72, bw * (zb.hp / zb.maxHp), 5);
        }
      }
      const barY = this.height - 26;
      ctx.fillStyle = '#2d241b';
      for (let sx = -20; sx < this.width + 40; sx += 58) {
        ctx.beginPath();
        ctx.ellipse(sx, barY + 14, 34, 18, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      this.drawBossLayer(ctx);
      this.drawWeaponViewmodel('#2c3e50', '#ff6b6b', 'carbine');
      this.drawCrosshair(this.aimX, this.aimY, '#ff6b6b', 18);
      this.drawFPSHudOverlay(
        this.boss ? `🧟 BOSS RAID · Shoot Weakspot & Rockets!` : `🧟 Siege ${this.waveKills}/${this.waveTarget} · Next Shift ${phaseLeft}s · Slain ${this.zombiesSlain}`
      );
    }
  }
}
