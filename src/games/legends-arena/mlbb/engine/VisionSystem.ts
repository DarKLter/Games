import { MlbbFogGhost, MlbbMapVariantId } from '../types';
import { isPointInBush } from '../data/mapData';
import { dist } from './CombatMath';

export interface VisionCircle {
  x: number;
  y: number;
  radius: number;
  revealsBush?: boolean;
}

export interface VisionHeroLike {
  id: string;
  heroId: string;
  name: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  alive: boolean;
  inBush: boolean;
  stealthTimer: number;
  revealedTimer: number;
  color: string;
  recentlyAttackedTimer?: number;
}

export interface VisionUnitLike {
  team: 'blue' | 'red';
  x: number;
  y: number;
  alive: boolean;
  radius?: number;
}

export interface VisionWispLike {
  x: number;
  y: number;
  radius: number;
  team?: 'blue' | 'red' | 'both';
}

export interface VisionUpdateResult {
  blueVisionCircles: VisionCircle[];
  redVisionCircles: VisionCircle[];
  /** Hero IDs of red enemies currently visible to blue team */
  visibleEnemyIds: Set<string>;
  /** Hero IDs of blue heroes currently spotted by red team (triggers overhead Eye icon) */
  spottedAllyIds: Set<string>;
  /** 2-second fading fog ghost outlines for enemies who just vanished into Fog/Bush */
  fogGhosts: MlbbFogGhost[];
}

export const HERO_VISION_RADIUS = 560;
export const MINION_VISION_RADIUS = 360;
export const TURRET_VISION_RADIUS = 540;
export const BUSH_FACECHECK_RADIUS = 135;
export const FOG_GHOST_DURATION_SEC = 2.0;

/**
 * Pure, testable Fog-of-War, Bush Stealth, Overhead Eye Indicator & 2s Fog Ghost engine.
 */
export class MlbbVisionSystem {
  private prevVisibleEnemies = new Map<string, { heroId: string; name: string; x: number; y: number; color: string }>();
  private ghosts: MlbbFogGhost[] = [];
  private globalRevealBlueTimer = 0; // Reveals all red heroes to blue (Aldous/YSS/Zetian Ult)
  private globalRevealRedTimer = 0;

  public triggerGlobalReveal(forTeam: 'blue' | 'red', durationSec = 5.0): void {
    if (forTeam === 'blue') {
      this.globalRevealBlueTimer = Math.max(this.globalRevealBlueTimer, durationSec);
    } else {
      this.globalRevealRedTimer = Math.max(this.globalRevealRedTimer, durationSec);
    }
  }

  public getGlobalRevealRemaining(forTeam: 'blue' | 'red'): number {
    return forTeam === 'blue' ? this.globalRevealBlueTimer : this.globalRevealRedTimer;
  }

  public isPointVisibleToTeam(
    px: number,
    py: number,
    inBush: boolean,
    stealthActive: boolean,
    revealedTimer: number,
    observerCircles: readonly VisionCircle[],
    globalRevealActive: boolean,
    mapVariant?: MlbbMapVariantId
  ): boolean {
    if (globalRevealActive || revealedTimer > 0) return true;
    const bush = inBush ? isPointInBush(px, py, mapVariant) : null;
    for (const c of observerCircles) {
      const d = dist(px, py, c.x, c.y);
      if (d > c.radius) continue;
      if (stealthActive && d > BUSH_FACECHECK_RADIUS && !c.revealsBush) continue;
      if (bush) {
        // Must either be inside the same bush, within facecheck range, or revealed by a Wisp/Walkie Grass ward
        if (c.revealsBush || d <= BUSH_FACECHECK_RADIUS) return true;
        const obsBush = isPointInBush(c.x, c.y, mapVariant);
        if (obsBush && obsBush.id === bush.id) return true;
        continue;
      }
      return true;
    }
    return false;
  }

  public step(
    dt: number,
    heroes: readonly VisionHeroLike[],
    minions: readonly VisionUnitLike[],
    turrets: readonly VisionUnitLike[],
    wisps: readonly VisionWispLike[],
    mapVariant?: MlbbMapVariantId
  ): VisionUpdateResult {
    this.globalRevealBlueTimer = Math.max(0, this.globalRevealBlueTimer - dt);
    this.globalRevealRedTimer = Math.max(0, this.globalRevealRedTimer - dt);

    const blueCircles: VisionCircle[] = [];
    const redCircles: VisionCircle[] = [];

    for (const h of heroes) {
      if (!h.alive) continue;
      const c: VisionCircle = { x: h.x, y: h.y, radius: HERO_VISION_RADIUS };
      if (h.team === 'blue') blueCircles.push(c);
      else redCircles.push(c);
    }
    for (const m of minions) {
      if (!m.alive) continue;
      const c: VisionCircle = { x: m.x, y: m.y, radius: MINION_VISION_RADIUS };
      if (m.team === 'blue') blueCircles.push(c);
      else redCircles.push(c);
    }
    for (const t of turrets) {
      if (!t.alive) continue;
      const c: VisionCircle = { x: t.x, y: t.y, radius: TURRET_VISION_RADIUS, revealsBush: true };
      if (t.team === 'blue') blueCircles.push(c);
      else redCircles.push(c);
    }
    for (const w of wisps) {
      const c: VisionCircle = { x: w.x, y: w.y, radius: w.radius, revealsBush: true };
      if (!w.team || w.team === 'both' || w.team === 'blue') blueCircles.push(c);
      if (!w.team || w.team === 'both' || w.team === 'red') redCircles.push(c);
    }

    const visibleEnemyIds = new Set<string>();
    const spottedAllyIds = new Set<string>();

    // Decay existing fog ghosts before processing new vanish events this tick
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].ttl -= dt;
      if (this.ghosts[i].ttl <= 0) {
        this.ghosts.splice(i, 1);
      }
    }

    for (const h of heroes) {
      if (!h.alive) continue;
      const isStealthed = h.stealthTimer > 0;
      const attackedRecently = (h.recentlyAttackedTimer ?? 0) > 0;
      const effRevealed = attackedRecently ? Math.max(h.revealedTimer, 1.0) : h.revealedTimer;

      if (h.team === 'red') {
        const visible = this.isPointVisibleToTeam(
          h.x,
          h.y,
          h.inBush,
          isStealthed,
          effRevealed,
          blueCircles,
          this.globalRevealBlueTimer > 0,
          mapVariant
        );
        if (visible) {
          visibleEnemyIds.add(h.id);
          this.prevVisibleEnemies.set(h.id, {
            heroId: h.heroId,
            name: h.name,
            x: h.x,
            y: h.y,
            color: h.color
          });
          // Clear any existing fog ghost for this enemy now that they are visible again
          this.ghosts = this.ghosts.filter((g) => g.heroId !== h.heroId || g.name !== h.name);
        } else if (this.prevVisibleEnemies.has(h.id)) {
          // Enemy just vanished into Fog of War or a bush -> spawn 2s fading ghost silhouette!
          const last = this.prevVisibleEnemies.get(h.id)!;
          this.prevVisibleEnemies.delete(h.id);
          this.ghosts = this.ghosts.filter((g) => g.name !== last.name);
          this.ghosts.push({
            heroId: last.heroId,
            name: last.name,
            team: 'red',
            x: last.x,
            y: last.y,
            color: last.color,
            ttl: FOG_GHOST_DURATION_SEC,
            maxTtl: FOG_GHOST_DURATION_SEC
          });
        }
      } else {
        // Check if blue hero is spotted by red team (triggers overhead Yellow/Red Eye icon!)
        const spotted = this.isPointVisibleToTeam(
          h.x,
          h.y,
          h.inBush,
          isStealthed,
          effRevealed,
          redCircles,
          this.globalRevealRedTimer > 0,
          mapVariant
        );
        if (spotted) {
          spottedAllyIds.add(h.id);
        }
      }
    }

    return {
      blueVisionCircles: blueCircles,
      redVisionCircles: redCircles,
      visibleEnemyIds,
      spottedAllyIds,
      fogGhosts: [...this.ghosts]
    };
  }
}
