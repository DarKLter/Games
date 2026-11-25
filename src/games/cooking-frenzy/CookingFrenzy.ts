import { ArcadeAudio } from '../../core/audio';
import { EmojiCache } from '../../core/emojiCache';
import { addCoins, addXp, updateInGameHud } from '../../core/runtimeBridge';
import { BaseGame } from '../../core/BaseGame';
import { computeIngredientButtons, INGREDIENTS, matchRecipe, RECIPE_BOOK, RecipeDef, RectButton } from './cookingLogic';

interface CustomerOrder {
  slot: number;
  avatar: string;
  rec: RecipeDef;
  patience: number;
  maxP: number;
}

export class CookingFrenzy extends BaseGame {
  recipes: RecipeDef[] = RECIPE_BOOK;
  ingredients: string[] = INGREDIENTS;
  plate: string[] = [];
  customers: CustomerOrder[] = [];
  spawnTimer = 0.4;
  servedCount = 0;
  rushTimeLeft = 90;
  serveCombo = 0;

  init(): void {
    this.recipes = RECIPE_BOOK;
    this.ingredients = INGREDIENTS;
    this.plate = [];
    this.customers = [];
    this.spawnTimer = 0.2;
    this.maxLives = 1;
    this.lives = 1;
    this.servedCount = 0;
    this.serveCombo = 0;
    this.rushTimeLeft = this.diff === 'extreme' ? 70 : this.diff === 'hard' ? 80 : 95;
  }

  spawnCustomer(): void {
    const openSlots = [0, 1, 2].filter((s) => !this.customers.some((c) => c.slot === s));
    if (!openSlots.length) return;
    const slot = openSlots[Math.floor(Math.random() * openSlots.length)];
    const poolCount = Math.min(this.recipes.length, 6 + this.level * 3);
    const pool = this.recipes.slice(0, poolCount);
    const rec = pool[Math.floor(Math.random() * pool.length)];
    const maxP = Math.max(10, 21 - this.level * 0.7) / this.scaler.speedMult;
    const avatars = ['👩', '🧑', '👨‍💼', '👧', '🧔', '👵', '👩‍🚀', '🧝'];
    this.customers.push({
      slot,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      rec,
      patience: maxP,
      maxP
    });
  }

  override resize(): void {
    super.resize();
    if (this.isPaused) this.draw();
  }

  getLayout() {
    const isCompactLand = this.width > this.height * 1.35 && this.height < 520;
    const topY = isCompactLand ? 44 : this.width < 460 ? 60 : 52;
    const slotW = Math.min(isCompactLand ? 164 : 138, (this.width - 20) / 3);
    const cStartX = (this.width - slotW * 3) / 2;
    const custH = isCompactLand ? 78 : Math.min(106, Math.max(84, this.height * 0.16));
    const plateY = topY + custH + (isCompactLand ? 10 : 16);
    const plateH = isCompactLand ? 42 : 46;
    const ingStartY = plateY + plateH + (isCompactLand ? 8 : 10);
    const ingButtons: RectButton[] = computeIngredientButtons(this.width, this.height, ingStartY, this.ingredients);
    const plateW = Math.min(200, Math.max(150, this.width - 84));
    const groupW = plateW + 54;
    const plateX = Math.max(12, (this.width - groupW) / 2);
    const trashX = Math.min(this.width - 26, plateX + plateW + 30);
    const trashY = plateY + plateH / 2;
    const plateRect = { x: plateX, y: plateY, w: plateW, h: plateH };
    return { topY, slotW, cStartX, custH, plateY, plateH, plateRect, trashX, trashY, ingButtons };
  }

  onPointerDown(x: number, y: number): void {
    if (this.gameOver || this.isPaused) return;
    const lay = this.getLayout();

    // 1. Check customer slots for serving
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      const cx = lay.cStartX + c.slot * lay.slotW + 4;
      if (x >= cx && x <= cx + lay.slotW - 8 && y >= lay.topY && y <= lay.topY + lay.custH + 6) {
        const ready = matchRecipe(this.plate, this.recipes);
        if (ready && ready.name === c.rec.name) {
          this.customers.splice(i, 1);
          this.plate = [];
          this.servedCount++;
          this.serveCombo++;
          const timeBonus = Math.min(8, 3 + Math.floor(this.serveCombo / 2));
          this.rushTimeLeft = Math.min(120, this.rushTimeLeft + timeBonus);
          const tip = (c.rec.need.length >= 4 ? 75 : 55) + Math.min(50, this.serveCombo * 8);
          this.score += tip;
          const coinBonus = this.serveCombo >= 3 ? 4 : 3;
          addCoins(coinBonus);
          addXp(10);
          if (this.servedCount % 5 === 0) {
            this.level++;
            ArcadeAudio.play('levelup');
            this.spawnPopup(this.width / 2, lay.topY + 12, `👨‍🍳 CHEF LVL ${this.level}!`, '#ffd700');
          } else {
            ArcadeAudio.play('serve');
          }
          updateInGameHud(this.score, this.level, 14);
          this.spawnPopup(cx + lay.slotW / 2, lay.topY + 40, `🍽️ +${tip} (+${timeBonus}s)`, '#84fab0');
        } else {
          this.serveCombo = 0;
          ArcadeAudio.play('hurt');
          this.spawnPopup(cx + lay.slotW / 2, lay.topY + 40, 'WRONG DISH!', '#ef4444');
        }
        return;
      }
    }

    // 2. Check Trash Bin
    if (Math.hypot(x - lay.trashX, y - lay.trashY) <= 28) {
      if (this.plate.length > 0) {
        this.plate = [];
        ArcadeAudio.play('slide');
      }
      return;
    }

    // 3. Check Plate tap (pop last ingredient)
    if (
      x >= lay.plateRect.x &&
      x <= lay.plateRect.x + lay.plateRect.w &&
      y >= lay.plateRect.y &&
      y <= lay.plateRect.y + lay.plateRect.h
    ) {
      if (this.plate.length > 0) {
        this.plate.pop();
        ArcadeAudio.play('click');
      }
      return;
    }

    // 4. Unified exact hit check on all 20 ingredient buttons
    for (const btn of lay.ingButtons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        if (this.plate.length < 4) {
          this.plate.push(btn.ing);
          ArcadeAudio.play('cook');
          this.spawnParticles(btn.x + btn.w / 2, btn.y + btn.h / 2, '#ffd700', 5, 80);
        } else {
          ArcadeAudio.play('hurt');
          this.spawnPopup(btn.x + btn.w / 2, btn.y, 'PLATE FULL!', '#ef4444');
        }
        return;
      }
    }
  }

  update(dt: number): void {
    if (this.gameOver) return;
    this.survivalElapsed = 0;
    this.rushTimeLeft -= dt;
    if (this.rushTimeLeft <= 0) {
      this.rushTimeLeft = 0;
      this.spawnPopup(this.width / 2, this.height * 0.35, '⏱️ SHIFT COMPLETE!', '#facc15');
      this.gameOverSequence(this.servedCount >= 6);
      return;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.customers.length < 3) {
      this.spawnCustomer();
      this.spawnTimer = Math.max(1.6, 3.3 - this.level * 0.22);
    }
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      c.patience -= dt;
      if (c.patience <= 0) {
        this.customers.splice(i, 1);
        this.serveCombo = 0;
        this.rushTimeLeft = Math.max(0, this.rushTimeLeft - 7);
        ArcadeAudio.play('hurt');
        this.triggerShake(7, 0.16);
        const lay = this.getLayout();
        this.spawnPopup(lay.cStartX + (c.slot + 0.5) * lay.slotW, lay.topY + 45, '😡 LEFT! -7s', '#ef4444');
      }
    }
  }

  draw(): void {
    const ctx = this.ctx;
    const lay = this.getLayout();
    ctx.fillStyle = '#2b1b17';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, lay.topY + lay.custH + 2, this.width, 10);

    // Shift timer badge centered near top
    ctx.font = '800 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.rushTimeLeft <= 15 ? '#ef4444' : '#fde047';
    ctx.fillText(
      `⏱️ ${Math.ceil(this.rushTimeLeft)}s   ·   🍽️ Served: ${this.servedCount}${this.serveCombo >= 2 ? `   ·   🔥 x${this.serveCombo}` : ''}`,
      this.width / 2,
      Math.max(24, lay.topY - 12)
    );

    const isCompactCard = lay.custH < 82;
    for (const c of this.customers) {
      const cx = lay.cStartX + c.slot * lay.slotW + 4;
      const w = lay.slotW - 8;
      ctx.fillStyle = 'rgba(255,255,255,0.11)';
      ctx.beginPath();
      ctx.roundRect(cx, lay.topY, w, lay.custH, 12);
      ctx.fill();
      EmojiCache.draw(ctx, c.avatar, cx + w * 0.28, lay.topY + (isCompactCard ? 22 : 30), isCompactCard ? 26 : 32);
      EmojiCache.draw(ctx, c.rec.dish, cx + w * 0.72, lay.topY + (isCompactCard ? 22 : 30), isCompactCard ? 24 : 30);
      ctx.font = '800 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText(c.rec.need.join(''), cx + w / 2, lay.topY + lay.custH - (isCompactCard ? 19 : 22));
      const pct = Math.max(0, c.patience / c.maxP);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(cx + 8, lay.topY + lay.custH - 11, w - 16, 7);
      ctx.fillStyle = pct > 0.4 ? '#4ade80' : '#ef4444';
      ctx.fillRect(cx + 8, lay.topY + lay.custH - 11, (w - 16) * pct, 7);
    }

    const ready = matchRecipe(this.plate, this.recipes);
    ctx.fillStyle = ready ? '#14532d' : '#1e293b';
    ctx.strokeStyle = ready ? '#4ade80' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(lay.plateRect.x, lay.plateRect.y, lay.plateRect.w, lay.plateRect.h, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      ready
        ? `${ready.dish} ${ready.name.split(' ')[0]}! Tap Client`
        : this.plate.length
          ? `${this.plate.join(' ')}  (↩)`
          : '🍽️ Tap Ingredients',
      lay.plateRect.x + lay.plateRect.w / 2,
      lay.plateRect.y + Math.round(lay.plateRect.h * 0.63)
    );

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(lay.trashX, lay.trashY, 22, 0, Math.PI * 2);
    ctx.fill();
    EmojiCache.draw(ctx, '🗑️', lay.trashX, lay.trashY, 22);

    for (const btn of lay.ingButtons) {
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 10);
      ctx.fill();
      ctx.stroke();
      EmojiCache.draw(ctx, btn.ing, btn.x + btn.w / 2, btn.y + btn.h / 2, Math.min(26, Math.round(btn.h * 0.6)));
    }
    ctx.textAlign = 'left';
  }
}
