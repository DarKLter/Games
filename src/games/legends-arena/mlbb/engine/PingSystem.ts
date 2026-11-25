import { MlbbMapVariantId, MlbbPingKind, MlbbTacticalPing } from '../types';
import { formatClock, isPointInBush, WORLD_SIZE } from '../data/mapData';
import { clamp, dist } from './CombatMath';

export interface PingHeroTarget {
  id: string;
  heroId: string;
  name: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  alive: boolean;
  visible: boolean;
}

export interface PingTurretTarget {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot' | 'crystal';
  tier: number;
  x: number;
  y: number;
  alive: boolean;
}

export interface PingObjectiveTarget {
  id: string;
  kind: string;
  name: string;
  x: number;
  y: number;
  alive: boolean;
  respawnTimer: number;
}

export interface PingContextEntities {
  heroes: readonly PingHeroTarget[];
  turrets: readonly PingTurretTarget[];
  objectives: readonly PingObjectiveTarget[];
  matchTimeSec: number;
  expLane: 'top' | 'bot';
  goldLane: 'top' | 'bot';
  mapVariant?: MlbbMapVariantId;
}

export interface PingPreviewResult {
  snappedX: number;
  snappedY: number;
  snapped: boolean;
  icon: string;
  color: string;
  label: string;
  targetType: 'hero' | 'turret' | 'turtle' | 'lord' | 'bush' | 'lane';
}

export interface BotPingOrder {
  pingId: number;
  kind: MlbbPingKind;
  x: number;
  y: number;
  targetHeroId?: string;
  label: string;
}

export function describeMapZone(x: number, y: number, expLane: 'top' | 'bot', goldLane: 'top' | 'bot'): string {
  if (x < 950 && y > 3050) return 'Blue Base';
  if (x > 3050 && y < 950) return 'Red Base';
  const topDist = Math.min(x, y);
  const botDist = Math.min(WORLD_SIZE - x, WORLD_SIZE - y);
  const midDist = Math.abs(x + y - WORLD_SIZE) / Math.SQRT2;
  if (topDist < 720) return expLane === 'top' ? 'EXP Lane (Top)' : 'Gold Lane (Top)';
  if (botDist < 720) return goldLane === 'bot' ? 'Gold Lane (Bot)' : 'EXP Lane (Bot)';
  if (midDist < 420) return 'Mid Lane';
  if (Math.abs(x - y) < 420) return 'Central River';
  return x + y > WORLD_SIZE ? 'Allied Jungle' : 'Enemy Jungle';
}

/**
 * Tactical Drag-to-Mark, Expanded Minimap Context Ping, Route Drawing & Bot Command Engine.
 */
export class MlbbPingSystem {
  private seq = 1;
  private pings: MlbbTacticalPing[] = [];
  private feed: { id: number; kind: MlbbPingKind; icon: string; color: string; text: string }[] = [];

  public getActivePings(): readonly MlbbTacticalPing[] {
    return this.pings;
  }

  public getFeed(): { id: number; kind: MlbbPingKind; icon: string; color: string; text: string }[] {
    return this.feed.slice(-5);
  }

  public step(dt: number): void {
    for (let i = this.pings.length - 1; i >= 0; i--) {
      this.pings[i].ttl -= dt;
      if (this.pings[i].ttl <= 0) {
        this.pings.splice(i, 1);
      }
    }
  }

  /**
   * Non-mutating entity-snapping preview for live Press-and-Drag Pop-Out Tactical Map reticle!
   */
  public previewPingTarget(
    kind: MlbbPingKind,
    worldX: number,
    worldY: number,
    team: 'blue' | 'red',
    ctx: PingContextEntities
  ): PingPreviewResult {
    const wx = clamp(worldX, 80, WORLD_SIZE - 80);
    const wy = clamp(worldY, 80, WORLD_SIZE - 80);

    const enemyHit = ctx.heroes
      .filter((h) => h.alive && h.team !== team && h.visible)
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((h) => dist(wx, wy, h.x, h.y) <= 250);
    if (enemyHit) {
      return {
        snappedX: enemyHit.x,
        snappedY: enemyHit.y,
        snapped: true,
        icon: kind === 'retreat' ? '🛡️' : '⚔️',
        color: kind === 'retreat' ? '#FACC15' : '#FF3B4E',
        label: kind === 'retreat' ? `Watch out for ${enemyHit.name}!` : `Attack ${enemyHit.name}!`,
        targetType: 'hero'
      };
    }

    const objHit = ctx.objectives
      .filter((o) => o.kind === 'turtle' || o.kind === 'lord')
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((o) => dist(wx, wy, o.x, o.y) <= 290);
    if (objHit) {
      const isLord = objHit.kind === 'lord';
      const label = !objHit.alive && objHit.respawnTimer > 0
        ? `${isLord ? 'Lord' : 'Turtle'} spawns in ${formatClock(objHit.respawnTimer)}!`
        : kind === 'retreat'
          ? `Back off from ${isLord ? 'Lord' : 'Turtle'}!`
          : kind === 'gather'
            ? `Gather at ${isLord ? 'Lord' : 'Turtle'}!`
            : `Attack ${isLord ? 'Lord' : 'Turtle'}!`;
      return {
        snappedX: objHit.x,
        snappedY: objHit.y,
        snapped: true,
        icon: isLord ? '🐉' : '🐢',
        color: isLord ? '#F59E0B' : '#2CE58B',
        label,
        targetType: isLord ? 'lord' : 'turtle'
      };
    }

    const turretHit = ctx.turrets
      .filter((t) => t.alive)
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((t) => dist(wx, wy, t.x, t.y) <= 240);
    if (turretHit) {
      const isAlly = turretHit.team === team;
      const laneName = turretHit.lane === 'crystal' ? 'Base Crystal' : `${turretHit.lane.toUpperCase()} Turret`;
      return {
        snappedX: turretHit.x,
        snappedY: turretHit.y,
        snapped: true,
        icon: isAlly ? '🛡️' : '🏰',
        color: isAlly ? '#38A3FF' : '#FF3B4E',
        label: isAlly ? `Defend ${laneName}!` : `Destroy ${laneName}!`,
        targetType: 'turret'
      };
    }

    const bush = isPointInBush(wx, wy, ctx.mapVariant);
    if (bush) {
      return {
        snappedX: bush.cx,
        snappedY: bush.cy,
        snapped: true,
        icon: '👁️',
        color: '#FACC15',
        label: kind === 'gather' ? 'Set ambush in bush!' : 'Watch out for ambush!',
        targetType: 'bush'
      };
    }

    const zone = describeMapZone(wx, wy, ctx.expLane, ctx.goldLane);
    return {
      snappedX: wx,
      snappedY: wy,
      snapped: false,
      icon: kind === 'attack' ? '⚔️' : kind === 'retreat' ? '🛡️' : '🎯',
      color: kind === 'attack' ? '#FF3B4E' : kind === 'retreat' ? '#FACC15' : '#38A3FF',
      label: kind === 'attack' ? `Attack ${zone}!` : kind === 'retreat' ? `Retreat from ${zone}!` : `Gather at ${zone}!`,
      targetType: 'lane'
    };
  }

  /**
   * Resolves a drag-to-mark ping (`attack` / `retreat` / `gather`) or Expanded Map tap
   * against live enemies, turrets, Turtle/Lord pits, bushes, or lanes.
   */
  public resolveAndEmitPing(
    kind: MlbbPingKind,
    worldX: number,
    worldY: number,
    sender: string,
    team: 'blue' | 'red',
    ctx: PingContextEntities,
    routePoints?: { x: number; y: number }[]
  ): MlbbTacticalPing {
    const wx = clamp(worldX, 80, WORLD_SIZE - 80);
    const wy = clamp(worldY, 80, WORLD_SIZE - 80);

    // 1. Drawn "On My Way" Route Trail
    if (kind === 'omw' && routePoints && routePoints.length >= 2) {
      const end = routePoints[routePoints.length - 1];
      const zone = describeMapZone(end.x, end.y, ctx.expLane, ctx.goldLane);
      return this.pushPing({
        x: end.x,
        y: end.y,
        kind: 'omw',
        color: '#22D3EE',
        icon: '🧭',
        label: `On My Way to ${zone}!`,
        sender,
        team,
        targetType: 'route',
        routePoints,
        ttl: 5.5
      });
    }

    // 2. Check nearby visible Enemy Hero (within 240 units)
    const enemyHit = ctx.heroes
      .filter((h) => h.alive && h.team !== team && h.visible)
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((h) => dist(wx, wy, h.x, h.y) <= 250);

    if (enemyHit) {
      const verb =
        kind === 'retreat'
          ? `Watch out for ${enemyHit.name}!`
          : kind === 'missing'
            ? `Enemy ${enemyHit.name} Missing!`
            : `Launch Attack on ${enemyHit.name}!`;
      return this.pushPing({
        x: enemyHit.x,
        y: enemyHit.y,
        kind: kind === 'retreat' ? 'retreat' : 'attack',
        color: kind === 'retreat' ? '#FACC15' : '#FF3B4E',
        icon: kind === 'retreat' ? '🛡️' : '⚔️',
        label: verb,
        sender,
        team,
        targetHeroId: enemyHit.id,
        targetType: 'hero',
        ttl: 5.0
      });
    }

    // 3. Check Turtle / Lord pit (within 280 units)
    const objHit = ctx.objectives
      .filter((o) => o.kind === 'turtle' || o.kind === 'lord')
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((o) => dist(wx, wy, o.x, o.y) <= 290);

    if (objHit) {
      const isLord = objHit.kind === 'lord';
      let label: string;
      if (!objHit.alive && objHit.respawnTimer > 0) {
        label = `${isLord ? 'Lord' : 'Turtle'} spawns in ${formatClock(objHit.respawnTimer)}!`;
      } else if (kind === 'retreat') {
        label = `Back off from ${isLord ? 'the Lord' : 'the Turtle'}!`;
      } else if (kind === 'gather') {
        label = `Gather at ${isLord ? 'the Lord' : 'the Turtle'}!`;
      } else {
        label = `Attack ${isLord ? 'the Lord' : 'the Turtle'}!`;
      }
      return this.pushPing({
        x: objHit.x,
        y: objHit.y,
        kind: kind === 'retreat' ? 'retreat' : kind === 'gather' ? 'gather' : 'attack',
        color: isLord ? '#F59E0B' : '#2CE58B',
        icon: isLord ? '🐉' : '🐢',
        label,
        sender,
        team,
        targetType: isLord ? 'lord' : 'turtle',
        ttl: 5.2
      });
    }

    // 4. Check Turret / Crystal (within 230 units)
    const turretHit = ctx.turrets
      .filter((t) => t.alive)
      .sort((a, b) => dist(wx, wy, a.x, a.y) - dist(wx, wy, b.x, b.y))
      .find((t) => dist(wx, wy, t.x, t.y) <= 240);

    if (turretHit) {
      const isAlly = turretHit.team === team;
      const laneName = turretHit.lane === 'crystal' ? 'Base Crystal' : `${turretHit.lane.toUpperCase()} Turret`;
      const label = isAlly
        ? `Defend the ${laneName}!`
        : kind === 'retreat'
          ? `Retreat from ${laneName}!`
          : `Attack the ${laneName}!`;
      return this.pushPing({
        x: turretHit.x,
        y: turretHit.y,
        kind: isAlly ? 'gather' : kind === 'retreat' ? 'retreat' : 'attack',
        color: isAlly ? '#38A3FF' : '#FF3B4E',
        icon: isAlly ? '🛡️' : '🏰',
        label,
        sender,
        team,
        targetType: 'turret',
        ttl: 4.8
      });
    }

    // 5. Check Tall Bush (Ambush Warning!)
    const bush = isPointInBush(wx, wy, ctx.mapVariant);
    if (bush) {
      const label =
        kind === 'gather'
          ? 'Set an ambush in this bush!'
          : 'Watch out for ambush here!';
      return this.pushPing({
        x: bush.cx,
        y: bush.cy,
        kind: kind === 'gather' ? 'gather' : 'retreat',
        color: '#FACC15',
        icon: '👁️',
        label,
        sender,
        team,
        targetType: 'bush',
        ttl: 4.8
      });
    }

    // 6. Fallback: Lane / Zone ping (or Enemy Missing when kind === 'missing')
    const zone = describeMapZone(wx, wy, ctx.expLane, ctx.goldLane);
    if (kind === 'missing') {
      const hiddenEnemy = ctx.heroes.find((h) => h.alive && h.team !== team && !h.visible);
      const label = hiddenEnemy
        ? `Enemy ${hiddenEnemy.name} Missing!`
        : `Enemy Missing near ${zone}!`;
      return this.pushPing({
        x: wx,
        y: wy,
        kind: 'missing',
        color: '#FACC15',
        icon: '❓',
        label,
        sender,
        team,
        targetType: 'lane',
        ttl: 4.5
      });
    }

    const color = kind === 'attack' ? '#FF3B4E' : kind === 'retreat' ? '#FACC15' : '#38A3FF';
    const icon = kind === 'attack' ? '⚔️' : kind === 'retreat' ? '🛡️' : '🎯';
    const label =
      kind === 'attack'
        ? `Launch Attack at ${zone}!`
        : kind === 'retreat'
          ? `Retreat from ${zone}!`
          : `Gather at ${zone}!`;

    return this.pushPing({
      x: wx,
      y: wy,
      kind,
      color,
      icon,
      label,
      sender,
      team,
      targetType: 'lane',
      ttl: 4.5
    });
  }

  /**
   * Broadcasts Cooldown, Gold, Status, or Scoreboard enemy spell alerts.
   */
  public emitStatusSignal(sender: string, text: string, icon = '📡', color = '#38BDF8'): void {
    const id = this.seq++;
    this.feed.push({ id, kind: 'status', icon, color, text: `${sender}: ${text}` });
    if (this.feed.length > 10) this.feed.shift();
  }

  /**
   * Returns the highest-priority active player ping so allied AI bots dynamically rotate,
   * focus marked targets, contest objectives, or fall back.
   */
  public getActiveBotPingOrder(team: 'blue' | 'red', botX: number, botY: number): BotPingOrder | null {
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const p = this.pings[i];
      if (p.team !== team) continue;
      if (p.kind !== 'attack' && p.kind !== 'gather' && p.kind !== 'retreat' && p.kind !== 'omw') continue;
      // Bots within 1850 units respond to tactical beacons (global for Turtle/Lord!)
      const maxRange = p.targetType === 'turtle' || p.targetType === 'lord' ? 3200 : 1850;
      if (dist(botX, botY, p.x, p.y) <= maxRange) {
        return {
          pingId: p.id,
          kind: p.kind,
          x: p.x,
          y: p.y,
          targetHeroId: p.targetHeroId,
          label: p.label
        };
      }
    }
    return null;
  }

  private pushPing(opts: Omit<MlbbTacticalPing, 'id' | 'maxTtl'>): MlbbTacticalPing {
    const ping: MlbbTacticalPing = {
      ...opts,
      id: this.seq++,
      maxTtl: opts.ttl
    };
    this.pings.push(ping);
    if (this.pings.length > 12) this.pings.shift();

    this.feed.push({
      id: ping.id,
      kind: ping.kind,
      icon: ping.icon,
      color: ping.color,
      text: `${ping.sender}: ${ping.label}`
    });
    if (this.feed.length > 10) this.feed.shift();
    return ping;
  }
}
