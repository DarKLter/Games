import { ArcadeAudio, SoundKind } from './audio';
import { BaseGame } from './BaseGame';

export type FpsHitResult = 'crit' | 'hit' | 'bad' | false;

export class BaseFPSGame extends BaseGame {
  aimX = 0;
  aimY = 0;
  maxAmmo = 8;
  ammo = 8;
  reloadDuration = 0.85;
  isReloading = false;
  reloadTimer = 0;
  sfxType: SoundKind = 'shot';
  recoil = 0;
  muzzleFlash = 0;
  hitMarker = 0;
  hitMarkerColor = '#ffffff';
  damageFlash = 0;
  streak = 0;
  shotsFired = 0;
  shotsHit = 0;
  clockTime = 0;
  isScoped = false;

  initFPS(maxAmmo = 8, reloadDuration = 0.85, sfxType: SoundKind = 'shot'): void {
    this.maxLives = 3;
    this.lives = 3;
    this.aimX = this.width / 2;
    this.aimY = this.height / 2;
    this.maxAmmo = maxAmmo;
    this.ammo = maxAmmo;
    this.reloadDuration = reloadDuration;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.sfxType = sfxType;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.hitMarker = 0;
    this.hitMarkerColor = '#ffffff';
    this.damageFlash = 0;
    this.streak = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.clockTime = 0;
  }

  handlePointerMove(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    this.aimX = Math.max(0, Math.min(this.width, x));
    this.aimY = Math.max(0, Math.min(this.height, y));
  }

  reload(): void {
    if (this.gameOver || this.isPaused || this.isReloading || this.ammo >= this.maxAmmo) return;
    this.isReloading = true;
    this.reloadTimer = this.reloadDuration;
    ArcadeAudio.play('reload');
  }

  onFire(_sx: number, _sy: number, _pointerType = 'mouse', _prevAimX = 0, _prevAimY = 0): FpsHitResult {
    return false;
  }

  handleFire(x: number, y: number, pointerType = 'mouse'): void {
    if (this.gameOver || this.isPaused) return;
    const prevAimX = this.aimX;
    const prevAimY = this.aimY;
    if (!(this.isScoped && pointerType === 'touch')) {
      this.handlePointerMove(x, y);
    }
    if (this.isReloading) return;
    if (this.ammo <= 0) {
      this.reload();
      return;
    }
    this.ammo--;
    this.shotsFired++;
    this.recoil = 1;
    this.muzzleFlash = 0.08;
    ArcadeAudio.play(this.sfxType);
    const hitResult = this.onFire(x, y, pointerType, prevAimX, prevAimY);
    if (hitResult) {
      this.shotsHit++;
      this.hitMarker = 0.16;
      this.hitMarkerColor = hitResult === 'crit' ? '#ffd700' : hitResult === 'bad' ? '#ff4757' : '#84fab0';
    }
    if (this.ammo <= 0) this.reload();
  }

  updateFPSBase(dt: number): void {
    this.clockTime += dt;
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 7);
    if (this.muzzleFlash > 0) this.muzzleFlash = Math.max(0, this.muzzleFlash - dt);
    if (this.hitMarker > 0) this.hitMarker = Math.max(0, this.hitMarker - dt);
    if (this.damageFlash > 0) this.damageFlash = Math.max(0, this.damageFlash - dt * 2.2);
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
        ArcadeAudio.play('reload');
      }
    }
  }

  getCamOffset(strength = 18): { cx: number; cy: number } {
    const nx = this.aimX / Math.max(1, this.width) - 0.5;
    const ny = this.aimY / Math.max(1, this.height) - 0.5;
    return { cx: -nx * strength, cy: -ny * (strength * 0.65) };
  }

  drawWeaponViewmodel(bodyColor = '#2c3e50', accentColor = '#84fab0', gunType: 'carbine' | 'sniper' = 'carbine'): void {
    const ctx = this.ctx;
    const baseW = Math.min(this.width, this.height);
    const scale = Math.max(0.65, Math.min(1.15, baseW / 540));
    const swayX = (this.aimX / Math.max(1, this.width) - 0.5) * 32;
    const kick = this.recoil * 22 * scale;
    const gx = this.width * 0.78 + swayX;
    const gy = this.height - 6 + kick;

    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(scale, scale);
    ctx.rotate(-0.18 - this.recoil * 0.14);

    ctx.fillStyle = '#141820';
    ctx.fillRect(-18, -110, 36, 95);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-26, -65, 52, 80);
    if (gunType === 'sniper') {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(-9, -152, 18, 52);
      ctx.fillStyle = accentColor;
      ctx.fillRect(-12, -96, 24, 10);
    } else {
      ctx.fillStyle = accentColor;
      ctx.fillRect(-6, -102, 12, 24);
    }

    if (this.muzzleFlash > 0) {
      const tipY = gunType === 'sniper' ? -156 : -114;
      ctx.fillStyle = 'rgba(255, 225, 90, 0.92)';
      ctx.beginPath();
      ctx.arc(0, tipY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, tipY, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawCrosshair(x: number, y: number, color = '#84fab0', radius = 16): void {
    const ctx = this.ctx;
    const r = radius + this.recoil * 8;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r - 6, y);
    ctx.lineTo(x - r + 4, y);
    ctx.moveTo(x + r - 4, y);
    ctx.lineTo(x + r + 6, y);
    ctx.moveTo(x, y - r - 6);
    ctx.lineTo(x, y - r + 4);
    ctx.moveTo(x, y + r - 4);
    ctx.lineTo(x, y + r + 6);
    ctx.stroke();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    if (this.hitMarker > 0) {
      ctx.strokeStyle = this.hitMarkerColor;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 10);
      ctx.lineTo(x - 4, y - 4);
      ctx.moveTo(x + 10, y - 10);
      ctx.lineTo(x + 4, y - 4);
      ctx.moveTo(x - 10, y + 10);
      ctx.lineTo(x - 4, y + 4);
      ctx.moveTo(x + 10, y + 10);
      ctx.lineTo(x + 4, y + 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawFPSHudOverlay(extraText = ''): void {
    const ctx = this.ctx;
    if (this.damageFlash > 0) {
      ctx.fillStyle = `rgba(231, 76, 60, ${Math.min(0.45, this.damageFlash * 0.45)})`;
      ctx.fillRect(0, 0, this.width, this.height);
    }
    const isNarrow = this.width < 480;
    const boxW = isNarrow ? Math.max(88, Math.floor(this.width * 0.5 - 52)) : Math.min(185, Math.floor(this.width * 0.36));
    const boxH = isNarrow ? 40 : 44;
    const bx = isNarrow ? 8 : 12;
    const by = this.height - boxH - (isNarrow ? 10 : 12);
    ctx.fillStyle = 'rgba(12, 18, 14, 0.85)';
    ctx.strokeStyle = 'rgba(132, 250, 176, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = isNarrow ? '800 11px system-ui, sans-serif' : '800 12px system-ui, sans-serif';
    ctx.fillStyle = this.isReloading ? '#ffd700' : '#ffffff';
    ctx.textAlign = 'left';
    const ammoLabel = this.isReloading
      ? isNarrow ? 'RELOAD...' : 'RELOADING...'
      : `🔫 ${this.ammo}/${this.maxAmmo}${this.streak >= 2 ? ` 🔥${this.streak}` : ''}`;
    ctx.fillText(ammoLabel, bx + 8, by + (isNarrow ? 16 : 18));

    const barW = boxW - 16;
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(bx + 8, by + (isNarrow ? 24 : 26), barW, 7);
    const fillRatio = this.isReloading
      ? Math.max(0, 1 - this.reloadTimer / this.reloadDuration)
      : this.ammo / Math.max(1, this.maxAmmo);
    ctx.fillStyle = this.isReloading ? '#ffd700' : this.ammo <= 2 ? '#ff6b6b' : '#84fab0';
    ctx.fillRect(bx + 8, by + (isNarrow ? 24 : 26), barW * fillRatio, 7);

    if (extraText) {
      ctx.font = isNarrow ? '800 10.5px system-ui, sans-serif' : '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#84fab0';
      const extraY = isNarrow ? Math.max(70, this.height * 0.11 + 20) : Math.max(58, this.height * 0.08 + 20);
      ctx.fillText(extraText, this.width / 2, extraY);
      ctx.textAlign = 'left';
    }
  }
}
