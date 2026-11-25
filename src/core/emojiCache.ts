interface EmojiEntry {
  canvas: HTMLCanvasElement;
  logicalSize: number;
}

class EmojiCacheStore {
  private cache = new Map<string, EmojiEntry>();

  get(emoji: string, size: number): EmojiEntry {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const key = `${emoji}_${size}_${dpr}`;
    let entry = this.cache.get(key);
    if (!entry) {
      const pad = Math.ceil(size * 0.35);
      const dim = Math.ceil((size + pad * 2) * dpr);
      const off = document.createElement('canvas');
      off.width = dim;
      off.height = dim;
      const octx = off.getContext('2d');
      if (octx) {
        octx.scale(dpr, dpr);
        octx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        octx.textAlign = 'center';
        octx.textBaseline = 'middle';
        octx.fillText(emoji, (size + pad * 2) / 2, (size + pad * 2) / 2 + size * 0.05);
      }
      entry = { canvas: off, logicalSize: size + pad * 2 };
      this.cache.set(key, entry);
    }
    return entry;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    emoji: string,
    centerX: number,
    centerY: number,
    size: number,
    rotation = 0,
    scaleX = 1,
    scaleY = 1
  ): void {
    const bucket = Math.max(24, Math.min(96, Math.ceil(size / 16) * 16));
    const item = this.get(emoji, bucket);
    const drawScale = size / bucket;
    const drawDim = item.logicalSize * drawScale;
    const half = drawDim / 2;
    if (rotation !== 0 || scaleX !== 1 || scaleY !== 1) {
      ctx.save();
      ctx.translate(centerX, centerY);
      if (rotation !== 0) ctx.rotate(rotation);
      if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
      ctx.drawImage(item.canvas, -half, -half, drawDim, drawDim);
      ctx.restore();
    } else {
      ctx.drawImage(item.canvas, centerX - half, centerY - half, drawDim, drawDim);
    }
  }
}

export const EmojiCache = new EmojiCacheStore();
