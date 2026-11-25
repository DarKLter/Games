import { MlbbFogGhost, MlbbMapThemeId, MlbbMapVariantId, MlbbSettingsState, MlbbTacticalPing } from '../types';
import {
  BLUE_CRYSTAL,
  BLUE_FOUNTAIN,
  CYCLONE_EYES,
  FLYING_CLOUD_BLUE,
  getActiveMapBushes,
  getActiveMapWalls,
  getLaneDecalPosition,
  MAP_THEMES,
  RED_CRYSTAL,
  RED_FOUNTAIN,
  WORLD_SIZE
} from '../data/mapData';
import { computeTurretRingState, SimBrawlShrine, SimWalkieGrass } from './BattlefieldSystems';
import { computeRetributionThreshold, dist } from './CombatMath';
import { SimHero, SimJungleMob, SimMinion, SimProjectile, SimTempWall, SimTurret, SimVfx } from './SkillPhysics';
import { VisionCircle } from './VisionSystem';
import { getHeroCcBadge, getHeroStackBadge, resolveHeroSilhouetteState } from './VfxSystem';

export interface RenderAimPreview {
  active: boolean;
  slot: 1 | 2 | 3 | 'spell';
  angle: number;
  dist: number;
  range: number;
  radius: number;
  shape: 'line' | 'circle' | 'cone' | 'ring' | 'self' | 'ally';
  cancelHover: boolean;
}

export interface RenderWisp {
  x: number;
  y: number;
  radius: number;
}

export interface RenderPing {
  x: number;
  y: number;
  kind: 'attack' | 'retreat' | 'gather';
  color: string;
  ttl: number;
  maxTtl: number;
}

export interface RenderSceneState {
  matchTimeSec: number;
  mapTheme: MlbbMapThemeId;
  mapVariant: MlbbMapVariantId;
  isBrawl: boolean;
  isSpectator?: boolean;
  expLane: 'top' | 'bot';
  goldLane: 'top' | 'bot';
  camX: number;
  camY: number;
  camViewW: number;
  camViewH: number;
  zoom: number;
  shakeTimer: number;
  heroes: SimHero[];
  minions: SimMinion[];
  turrets: SimTurret[];
  jungleMobs: SimJungleMob[];
  projectiles: SimProjectile[];
  vfxs: SimVfx[];
  tempWalls?: SimTempWall[];
  playerBlinded?: boolean;
  wisps: RenderWisp[];
  walkieGrasses: SimWalkieGrass[];
  brawlShrines: SimBrawlShrine[];
  pings: RenderPing[];
  tacticalPings: readonly MlbbTacticalPing[];
  visibleEnemyIds: Set<string>;
  fogGhosts: readonly MlbbFogGhost[];
  blueVisionCircles: readonly VisionCircle[];
  cycloneCds: Record<string, number>;
  campSlainShortcut: Record<string, number>;
  flyingCloudCd: number;
  lockedTargetId: string | null;
  aimPreview: RenderAimPreview;
  settings: MlbbSettingsState;
}

export function renderBattlefield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderSceneState
): void {
  const theme = MAP_THEMES[state.mapTheme] ?? MAP_THEMES.imperial_sanctuary;
  const player = state.heroes.find((h) => h.isPlayer);

  ctx.save();
  ctx.fillStyle = theme.grassA;
  ctx.fillRect(0, 0, width, height);

  // Screen shake offset
  let shakeX = 0;
  let shakeY = 0;
  if (state.settings.basics.screenShake && state.shakeTimer > 0) {
    const mag = Math.min(7, state.shakeTimer * 28);
    shakeX = (Math.random() - 0.5) * mag;
    shakeY = (Math.random() - 0.5) * mag;
  }

  ctx.translate(width / 2 + shakeX, height / 2 + shakeY);
  ctx.scale(state.zoom, state.zoom);
  ctx.translate(-state.camX, -state.camY);

  const halfW = width / (2 * state.zoom) + 280;
  const halfH = height / (2 * state.zoom) + 280;
  const minX = Math.max(0, state.camX - halfW);
  const maxX = Math.min(WORLD_SIZE, state.camX + halfW);
  const minY = Math.max(0, state.camY - halfH);
  const maxY = Math.min(WORLD_SIZE, state.camY + halfH);

  // 1. Tiled grass texture
  const tile = 200;
  const sx = Math.floor(minX / tile) * tile;
  const sy = Math.floor(minY / tile) * tile;
  for (let gx = sx; gx < maxX; gx += tile) {
    for (let gy = sy; gy < maxY; gy += tile) {
      if (((gx / tile + gy / tile) & 1) === 0) {
        ctx.fillStyle = theme.grassB;
        ctx.fillRect(gx, gy, tile, tile);
      }
    }
  }

  // 2. Stone Lanes (3-lane Land of Dawn or 1-lane Brawl Mid)
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawLanePath = (pts: [number, number][], laneW: number) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = theme.laneBorder;
    ctx.lineWidth = laneW + 22;
    ctx.stroke();
    ctx.strokeStyle = theme.laneStone;
    ctx.lineWidth = laneW;
    ctx.stroke();
  };

  if (!state.isBrawl) {
    drawLanePath(
      [
        [420, 3480],
        [420, 420],
        [3480, 420]
      ],
      210
    );
    drawLanePath(
      [
        [520, 3580],
        [3580, 3580],
        [3580, 520]
      ],
      210
    );
  }
  drawLanePath(
    [
      [520, 3480],
      [3480, 520]
    ],
    state.isBrawl ? 300 : 210
  );

  // 3. Diagonal Flowing River (Top-Left to Bottom-Right, widened for Expanding Rivers!)
  if (!state.isBrawl) {
    const expanding = state.mapVariant === 'expanding_rivers';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(280, 280);
    ctx.lineTo(3720, 3720);
    ctx.strokeStyle = theme.riverA;
    ctx.lineWidth = expanding ? 360 : 230;
    ctx.stroke();
    ctx.strokeStyle = theme.riverB;
    ctx.lineWidth = expanding ? 260 : 155;
    ctx.stroke();

    if (expanding) {
      ctx.fillStyle = theme.riverB + '66';
      ctx.beginPath();
      ctx.arc(1420, 1650, 210, 0, Math.PI * 2);
      ctx.arc(2580, 2350, 210, 0, Math.PI * 2);
      ctx.fill();
    }

    // Animated water ripples
    ctx.strokeStyle = expanding ? 'rgba(186,230,253,0.34)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = expanding ? 7 : 5;
    const waveOff = (state.matchTimeSec * (expanding ? 72 : 45)) % 140;
    for (let t = 400 + waveOff; t < 3600; t += 140) {
      ctx.beginPath();
      ctx.moveTo(t - 24, t + 24);
      ctx.lineTo(t + 24, t - 24);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Blue & Red Base Plazas & Fountains
  const drawBasePlaza = (cx: number, cy: number, color: string, ringColor: string) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 460, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15,23,42,0.28)';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = ringColor;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };
  drawBasePlaza(BLUE_FOUNTAIN.x, BLUE_FOUNTAIN.y, 'rgba(34,211,238,0.22)', 'rgba(56,189,248,0.65)');
  drawBasePlaza(RED_FOUNTAIN.x, RED_FOUNTAIN.y, 'rgba(244,63,94,0.22)', 'rgba(244,63,94,0.65)');

  // 5. Flying Cloud Launch Pad (2026 Variant)
  if (state.mapVariant === 'flying_cloud' && !state.isBrawl) {
    ctx.save();
    const ready = state.flyingCloudCd <= 0;
    ctx.beginPath();
    ctx.arc(FLYING_CLOUD_BLUE.x, FLYING_CLOUD_BLUE.y, FLYING_CLOUD_BLUE.radius, 0, Math.PI * 2);
    ctx.fillStyle = ready ? 'rgba(192,132,252,0.34)' : 'rgba(148,163,184,0.18)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = ready ? '#E879F9' : '#64748B';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☁️', FLYING_CLOUD_BLUE.x, FLYING_CLOUD_BLUE.y);
    ctx.restore();
  }

  // 6. Cyclone Eyes (River Wind Vortices)
  if (!state.isBrawl) {
    for (const ce of CYCLONE_EYES) {
      if (ce.x < minX || ce.x > maxX || ce.y < minY || ce.y > maxY) continue;
      const cd = state.cycloneCds[ce.id] ?? 0;
      ctx.save();
      ctx.translate(ce.x, ce.y);
      ctx.rotate(state.matchTimeSec * (cd <= 0 ? 3.2 : 0.4));
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 1.5);
      ctx.strokeStyle = cd <= 0 ? '#38BDF8' : 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 7. Jungle Walls & Purple Buff Shortcut Passages (or Broken Walls variant)
  if (!state.isBrawl) {
    for (const w of getActiveMapWalls(state.mapVariant)) {
      if (w.x + w.w < minX || w.x > maxX || w.y + w.h < minY || w.y > maxY) continue;
      const shortcutOpen = w.shortcutCampId && (state.campSlainShortcut[w.shortcutCampId] ?? 0) > 0;
      ctx.save();
      if (shortcutOpen) {
        ctx.strokeStyle = 'rgba(44,229,139,0.55)';
        ctx.setLineDash([10, 8]);
        ctx.lineWidth = 4;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      } else {
        if (state.settings.basics.shadows) {
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(w.x + 8, w.y + 12, w.w, w.h);
        }
        ctx.fillStyle = theme.wall;
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = theme.laneBorder;
        ctx.lineWidth = 3;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      }
      ctx.restore();
    }
  }

  // 7B. Temporary Terrain Barriers (Badang Rock Wall, Grock Guardian's Barrier)
  if (state.tempWalls && state.tempWalls.length > 0) {
    for (const tw of state.tempWalls) {
      ctx.save();
      ctx.fillStyle = tw.color;
      ctx.globalAlpha = Math.min(0.92, (tw.ttl / Math.max(0.1, tw.maxTtl)) * 1.4);
      ctx.fillRect(tw.x, tw.y, tw.w, tw.h);
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 3;
      ctx.strokeRect(tw.x, tw.y, tw.w, tw.h);
      ctx.restore();
    }
  }

  // 8. Revealing Wisps (2026 Variant)
  for (const wisp of state.wisps) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(wisp.x, wisp.y, wisp.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56,189,248,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56,189,248,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(wisp.x, wisp.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#E0F2FE';
    ctx.fill();
    ctx.restore();
  }

  // 9. Turrets & Crystals with 3-State Range Ring
  for (const t of state.turrets) {
    if (!t.alive) continue;
    if (t.x < minX - 420 || t.x > maxX + 420 || t.y < minY - 420 || t.y > maxY + 420) continue;

    // 3-State Turret Range Ring (Green safe, Yellow caution, Red locked + Laser Tether)
    if (t.team === 'red' && player && player.alive && dist(player.x, player.y, t.x, t.y) < t.range + 280) {
      const ringState = computeTurretRingState(t, player.id, player.team, state.minions);
      const playerTargeted = ringState === 'locked';
      const pulse = playerTargeted ? 0.65 + Math.sin(state.matchTimeSec * 16) * 0.35 : 1;
      ctx.save();
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.lineWidth = playerTargeted ? 5 : 2.5;
      ctx.strokeStyle = playerTargeted
        ? `rgba(239,68,68,${pulse.toFixed(2)})`
        : ringState === 'safe'
          ? '#2CE58B'
          : '#FACC15';
      ctx.fillStyle = playerTargeted
        ? `rgba(239,68,68,${(0.11 * pulse).toFixed(2)})`
        : ringState === 'safe'
          ? 'rgba(44,229,139,0.06)'
          : 'rgba(250,204,21,0.08)';
      ctx.fill();
      ctx.stroke();

      if (playerTargeted) {
        ctx.beginPath();
        ctx.moveTo(t.x, t.y - 18);
        ctx.lineTo(player.x, player.y);
        ctx.strokeStyle = `rgba(255,59,78,${pulse.toFixed(2)})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // Turret / Crystal Body
    const r = t.tier === 4 ? 72 : 46;
    ctx.save();
    if (state.settings.basics.shadows) {
      ctx.beginPath();
      ctx.ellipse(t.x + 8, t.y + 18, r * 0.95, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
    ctx.fillStyle = t.hitFlashTimer > 0 ? '#FFFFFF' : t.team === 'blue' ? '#1E3A8A' : '#7F1D1D';
    ctx.fill();
    ctx.lineWidth = t.golden ? 6 : 4;
    ctx.strokeStyle = t.golden ? '#FACC15' : t.team === 'blue' ? '#38BDF8' : '#FB7185';
    ctx.stroke();

    // Inner Crystal Gem
    ctx.beginPath();
    ctx.arc(t.x, t.y - 6, r * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#F43F5E';
    ctx.fill();

    // Pre-5:00 Cyan Energy Shield visual
    if (t.shieldHp > 0) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, r + 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
    }

    // Turret HP Bar
    const bw = t.tier === 4 ? 130 : 88;
    const bh = 10;
    const bx = t.x - bw / 2;
    const by = t.y - r - 24;
    ctx.fillStyle = 'rgba(10,14,24,0.85)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
    ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#EF4444';
    ctx.fillRect(bx, by, bw * Math.max(0, t.hp / t.maxHp), bh);
    ctx.restore();
  }

  // 10. Jungle Mobs + Leash Circle + Patience Bar + Retribution Threshold Tick
  for (const mob of state.jungleMobs) {
    if (mob.x < minX - 240 || mob.x > maxX + 240 || mob.y < minY - 240 || mob.y > maxY + 240) continue;
    if (!mob.alive) {
      // Respawn timer ring on ground
      if (mob.respawnTimer > 0 && mob.respawnTimer < 120) {
        ctx.save();
        ctx.fillStyle = 'rgba(15,23,42,0.72)';
        ctx.beginPath();
        ctx.arc(mob.homeX, mob.homeY, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(mob.respawnTimer)}s`, mob.homeX, mob.homeY);
        ctx.restore();
      }
      continue;
    }

    // Leash circle when aggro'd
    if (mob.aggroTargetId) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(mob.homeX, mob.homeY, mob.leashRadius, 0, Math.PI * 2);
      ctx.strokeStyle = mob.resetting ? 'rgba(239,68,68,0.65)' : 'rgba(250,204,21,0.38)';
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    const r = mob.kind === 'lord' ? 54 : mob.kind === 'turtle' ? 46 : mob.kind.includes('buff') ? 38 : 28;
    ctx.save();
    ctx.beginPath();
    ctx.arc(mob.x, mob.y, r, 0, Math.PI * 2);
    ctx.fillStyle = mob.hitFlashTimer > 0 ? '#FFFFFF' : '#1E293B';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = mob.color;
    ctx.stroke();
    ctx.font = `${Math.round(r * 0.95)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mob.icon, mob.x, mob.y + 2);

    // HP Bar + Retribution Execute Line
    const bw = r * 2.2;
    const bx = mob.x - bw / 2;
    const by = mob.y - r - 22;
    ctx.fillStyle = 'rgba(10,14,24,0.88)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, 11);
    ctx.fillStyle = mob.color;
    ctx.fillRect(bx, by, bw * Math.max(0, mob.hp / mob.maxHp), 9);

    if (player && player.spellId === 'retribution') {
      const thresh = computeRetributionThreshold(player.level, player.junglerStacks >= 5);
      const frac = Math.min(1, thresh / mob.maxHp);
      ctx.fillStyle = mob.hp <= thresh ? '#FFFFFF' : '#EF4444';
      ctx.fillRect(bx + bw * frac - 1.5, by - 2, 3, 13);
    }

    // Patience bar underneath when aggro'd
    if (mob.aggroTargetId) {
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(bx, by + 11, bw * Math.max(0, mob.patience / 100), 3);
    }

    if (state.settings.basics.creepHpNumbers) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${Math.ceil(mob.hp)}`, mob.x, by - 8);
    }
    ctx.restore();
  }

  // 11. Aiming Telegraphs (Layer 1 VFX — Blue/Cyan under player)
  if (state.aimPreview.active && player && player.alive) {
    const ap = state.aimPreview;
    ctx.save();
    const col = ap.cancelHover ? 'rgba(239,68,68,0.35)' : 'rgba(56,189,248,0.22)';
    const strokeCol = ap.cancelHover ? '#EF4444' : '#38BDF8';
    ctx.beginPath();
    ctx.arc(player.x, player.y, ap.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56,189,248,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (ap.shape === 'line' || ap.shape === 'cone') {
      ctx.translate(player.x, player.y);
      ctx.rotate(ap.angle);
      ctx.fillStyle = col;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      if (ap.shape === 'cone') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, ap.range, -0.45, 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(0, -ap.radius * 0.55, ap.range, ap.radius * 1.1);
        ctx.strokeRect(0, -ap.radius * 0.55, ap.range, ap.radius * 1.1);
      }
    } else if (ap.shape === 'circle') {
      const cx = player.x + Math.cos(ap.angle) * Math.min(ap.range, ap.dist);
      const cy = player.y + Math.sin(ap.angle) * Math.min(ap.range, ap.dist);
      ctx.beginPath();
      ctx.arc(cx, cy, ap.radius, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeCol;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(player.x, player.y, ap.radius || ap.range, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 12. Minions
  for (const m of state.minions) {
    if (!m.alive) continue;
    if (m.x < minX || m.x > maxX || m.y < minY || m.y > maxY) continue;
    ctx.save();
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fillStyle =
      m.hitFlashTimer > 0
        ? '#FFFFFF'
        : m.kind === 'lord_ally'
          ? '#F59E0B'
          : m.kind === 'mini_turtle'
            ? '#2CE58B'
            : m.team === 'blue'
              ? '#2563EB'
              : '#DC2626';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = m.kind === 'siege' || m.kind === 'lord_ally' ? '#FACC15' : '#E2E8F0';
    ctx.stroke();
    // Minion HP Bar
    const bw = m.radius * 2.1;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(m.x - bw / 2, m.y - m.radius - 10, bw, 5);
    ctx.fillStyle = m.team === 'blue' ? '#38BDF8' : '#FB7185';
    ctx.fillRect(m.x - bw / 2, m.y - m.radius - 10, bw * Math.max(0, m.hp / m.maxHp), 5);
    ctx.restore();
  }

  // 12B. 2-Second Fading Fog Ghost Silhouettes (last known enemy location entering Fog/Bush)
  for (const ghost of state.fogGhosts) {
    if (ghost.x < minX - 80 || ghost.x > maxX + 80 || ghost.y < minY - 80 || ghost.y > maxY + 80) continue;
    const alpha = Math.max(0, (ghost.ttl / Math.max(0.01, ghost.maxTtl)) * 0.65);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(ghost.x, ghost.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15,23,42,0.72)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = '#FB7185';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', ghost.x, ghost.y);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#FCA5A5';
    ctx.fillText(ghost.name, ghost.x, ghost.y - 36);
    ctx.restore();
  }

  // 12C. Smart Targeting Magnetic Tether to Locked Target
  if (player && player.alive && state.lockedTargetId) {
    const lockedHero = state.heroes.find(
      (x) => x.id === state.lockedTargetId && x.alive && state.visibleEnemyIds.has(x.id)
    );
    if (lockedHero && dist(player.x, player.y, lockedHero.x, lockedHero.y) <= 950) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(lockedHero.x, lockedHero.y);
      ctx.strokeStyle = 'rgba(255,59,78,0.58)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // 13. Heroes (All 10) — Layer 2 Silhouette Shaders, Parabolic Leap Z-Arc, Dynamic Scaling, Layer 4 Stack Rings & CC Badges
  for (const h of state.heroes) {
    const isEgg = !h.alive && (h.eggFormTimer ?? 0) > 0;
    if (!h.alive && !isEgg) continue;
    // True VisionSystem Fog of War / Bush Stealth check for red enemies
    if (h.team === 'red' && !state.visibleEnemyIds.has(h.id)) {
      continue;
    }
    if (h.x < minX - 160 || h.x > maxX + 160 || h.y < minY - 160 || h.y > maxY + 160) continue;

    const sil = resolveHeroSilhouetteState(h);
    const drawRadius = h.radius * sil.modelScale;
    const leapOffsetPx = sil.leapZ * 18;
    const drawY = h.y - leapOffsetPx;

    // Render Hirara's Active Astral Prisms on the battlefield
    if (h.hiraraPrisms && h.hiraraPrisms.length > 0) {
      for (const pr of h.hiraraPrisms) {
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(state.matchTimeSec * 2.4);
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56,189,248,0.45)';
        ctx.fill();
        ctx.strokeStyle = '#E879F9';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // Render Snapback Anchor beacon (Alice S1, Harley S2, Claude S2, Hayabusa S2)
    if (h.snapbackAnchor && h.snapbackAnchor.ttl > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(h.snapbackAnchor.x, h.snapbackAnchor.y, 24, 0, Math.PI * 2);
      ctx.strokeStyle = '#FACC15';
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    if (sil.translucent) {
      ctx.globalAlpha = sil.opacity;
    }

    // Locked target indicator ring
    if (state.lockedTargetId === h.id) {
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Separated Ground Shadow (shrinks dynamically during Parabolic Leap Z-arc!)
    if (state.settings.basics.shadows) {
      const shadowShrink = Math.max(0.5, 1 - sil.leapZ * 0.09);
      ctx.beginPath();
      ctx.ellipse(h.x + 5, h.y + 16, drawRadius * 0.92 * shadowShrink, drawRadius * 0.56 * shadowShrink, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fill();
    }

    // Layer 2 Silhouette Shader: Gold CC-Immune Outline, White/Cyan Shield Dome, Frost Cage, Car Turbo Aura
    if (sil.goldCcImmune) {
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = sil.deathImmune ? '#4ADE80' : '#FACC15';
      ctx.lineWidth = 4.5;
      ctx.stroke();
    }
    if (sil.cyanShielded) {
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56,189,248,0.16)';
      ctx.fill();
      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    if (sil.frostFrozen) {
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56,189,248,0.35)';
      ctx.fill();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    if (sil.carForm) {
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 13, 0, Math.PI * 2);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (h.recalling) {
      const prog = 1 - h.recallTimer / 4.0;
      ctx.beginPath();
      ctx.arc(h.x, drawY, drawRadius + 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Orbiting Blades / Flowers (Saber, Carmilla, Cyclops)
    if (h.orbitBlades > 0 && h.orbitTimer > 0) {
      for (let i = 0; i < h.orbitBlades; i++) {
        const ba = state.matchTimeSec * 4.2 + (i * Math.PI * 2) / h.orbitBlades;
        const bx = h.x + Math.cos(ba) * 86;
        const by = drawY + Math.sin(ba) * 86;
        ctx.beginPath();
        ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fillStyle = h.heroDef.id === 'carmilla' ? '#FB7185' : '#22D3EE';
        ctx.fill();
      }
    }

    // Hero Circle + Directional Weapon Notch (Red Hit-Flash & Dynamic Scale!)
    ctx.beginPath();
    ctx.arc(h.x, drawY, drawRadius, 0, Math.PI * 2);
    ctx.fillStyle = sil.redHitFlash ? '#FCA5A5' : sil.eggForm ? '#FEF08A' : h.skinColor;
    ctx.fill();
    ctx.lineWidth = h.isPlayer ? 4.5 : 3;
    ctx.strokeStyle = sil.redHitFlash ? '#EF4444' : h.isPlayer ? '#FACC15' : h.team === 'blue' ? '#38BDF8' : '#FB7185';
    ctx.stroke();

    // Facing pointer
    const fx = h.x + Math.cos(h.facing) * (drawRadius + 7);
    const fy = drawY + Math.sin(h.facing) * (drawRadius + 7);
    ctx.beginPath();
    ctx.arc(fx, fy, 6, 0, Math.PI * 2);
    ctx.fillStyle = h.skinAccent;
    ctx.fill();

    // Hero Icon/Monogram
    ctx.font = `bold ${Math.round(21 * sil.modelScale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(sil.eggForm ? '🥚' : sil.carForm ? '🏎️' : h.heroDef.weaponIcon, h.x, drawY + 1);

    // Tether line (Estes heal / Angela root)
    if (h.tetherTargetId && h.tetherTimer > 0) {
      const tHero = state.heroes.find((x) => x.id === h.tetherTargetId && x.alive);
      if (tHero) {
        ctx.beginPath();
        ctx.moveTo(h.x, drawY);
        ctx.lineTo(tHero.x, tHero.y);
        ctx.strokeStyle = h.tetherKind === 'heal' ? '#2CE58B' : '#E879F9';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }

    // Overhead MLBB Health Bar + Delayed Catch-Up Trail + Shield + Mana + Level Badge
    ctx.globalAlpha = 1;
    const bw = 90;
    const bh = 10;
    const bx = h.x - bw / 2;
    const by = drawY - drawRadius - 30;

    // Name label
    ctx.fillStyle = h.isPlayer ? '#FDE047' : '#E2E8F0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(h.heroDef.name, h.x, by - 8);

    // Bar Frame
    ctx.fillStyle = 'rgba(8,12,24,0.9)';
    ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 6);

    // Delayed Catch-up Trail Bar (White/Amber)
    const trailW = bw * Math.max(0, Math.min(1, h.hpTrail / h.maxHp));
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(bx, by, trailW, bh);

    // Live HP Bar
    const hpW = bw * Math.max(0, Math.min(1, h.hp / h.maxHp));
    ctx.fillStyle = h.isPlayer ? '#2CE58B' : h.team === 'blue' ? '#38BDF8' : '#EF4444';
    ctx.fillRect(bx, by, hpW, bh);

    // Shield Overlay (White/Cyan bar over HP)
    if (h.shield > 0) {
      const shW = bw * Math.min(1, h.shield / h.maxHp);
      ctx.fillStyle = 'rgba(224,242,254,0.92)';
      ctx.fillRect(bx + Math.max(0, hpW - shW), by, shW, 5);
    }

    // 1000-HP Segment Ticks
    const segs = Math.floor(h.maxHp / 1000);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    for (let s = 1; s <= segs; s++) {
      const sxTick = bx + (s * 1000 * bw) / h.maxHp;
      ctx.fillRect(sxTick, by, 1.5, bh);
    }

    // Mana/Energy thin strip
    if (h.heroDef.resource !== 'none') {
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(bx, by + bh + 1, bw * Math.max(0, h.mana / Math.max(1, h.maxMana)), 3);
    }

    // Level Badge left of bar
    ctx.beginPath();
    ctx.arc(bx - 11, by + 6, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#F5C451';
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${h.level}`, bx - 11, by + 7);

    // Layer 4: Overhead Stack Badge & Active CC Status Pill
    const stackBadge = getHeroStackBadge(h);
    if (stackBadge) {
      ctx.fillStyle = 'rgba(11,19,43,0.86)';
      ctx.fillRect(h.x - 32, by + bh + 6, 64, 13);
      ctx.fillStyle = stackBadge.color;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(stackBadge.label, h.x, by + bh + 15);
    }
    const ccBadge = getHeroCcBadge(h);
    if (ccBadge) {
      ctx.fillStyle = ccBadge.bg;
      ctx.fillRect(h.x - 38, by - 32, 76, 15);
      ctx.fillStyle = ccBadge.color;
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(ccBadge.text, h.x, by - 21);
    }

    // Overhead Eye Icon (👁️) when spotted by enemy vision (especially inside a bush!)
    if (h.team === 'blue' && h.spottedByEnemy && (h.inBush || h.isPlayer)) {
      const eyeY = by - (h.ccType ? 38 : 25);
      ctx.save();
      ctx.beginPath();
      ctx.arc(h.x, eyeY, 12, 0, Math.PI * 2);
      ctx.fillStyle = h.inBush ? 'rgba(239,68,68,0.92)' : 'rgba(250,204,21,0.88)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👁', h.x, eyeY + 1);
      ctx.restore();
    }

    // Floating Hero Emote Bubble
    if (h.activeEmote && h.activeEmote.ttl > 0) {
      const ey = by - 54;
      ctx.save();
      ctx.fillStyle = 'rgba(11,19,43,0.92)';
      ctx.strokeStyle = h.activeEmote.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(h.x - 42, ey - 18, 84, 34, 14);
      ctx.fill();
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.fillText(h.activeEmote.icon, h.x - 22, ey);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(h.activeEmote.callout, h.x + 12, ey);
      ctx.restore();
    }

    ctx.restore();
  }

  // 14. Swaying Bushes (drawn slightly translucent when player is inside)
  if (!state.isBrawl) {
    const sway = Math.sin(state.matchTimeSec * 2.2) * 3;
    for (const b of getActiveMapBushes(state.mapVariant)) {
      if (b.cx + b.rx < minX || b.cx - b.rx > maxX || b.cy + b.ry < minY || b.cy - b.ry > maxY) continue;
      const playerInside = player && player.alive && dist(player.x, player.y, b.cx, b.cy) < Math.max(b.rx, b.ry);
      ctx.save();
      ctx.translate(b.cx + sway, b.cy);
      ctx.rotate(b.angle);
      ctx.globalAlpha = playerInside ? 0.42 : 0.86;
      ctx.beginPath();
      ctx.ellipse(0, 0, b.rx, b.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme.bush;
      ctx.fill();
      ctx.strokeStyle = '#3D7A4E';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  // 15. Projectiles
  for (const p of state.projectiles) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.restore();
  }

  // 16. VFX Layers (Slashes, Beams, Craters, Rings, Tethers, Arcing Coins, Floating Numbers)
  for (const v of state.vfxs) {
    const alpha = Math.max(0, Math.min(1, v.ttl / Math.max(0.01, v.maxTtl)));
    ctx.save();
    ctx.globalAlpha = alpha;
    if (v.kind === 'ring' || v.kind === 'crater' || v.kind === 'burst') {
      const expand = v.kind === 'burst' ? 1.25 - alpha * 0.35 : 1;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.radius * expand, 0, Math.PI * 2);
      ctx.fillStyle = v.color + '33';
      ctx.fill();
      ctx.lineWidth = v.kind === 'burst' ? 5 : 3.5;
      ctx.strokeStyle = v.color;
      ctx.stroke();
    } else if (v.kind === 'beam' && v.tx !== undefined && v.ty !== undefined) {
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.lineTo(v.tx, v.ty);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = v.radius * alpha;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(4, v.radius * 0.3 * alpha);
      ctx.stroke();
    } else if (v.kind === 'slash') {
      ctx.translate(v.x, v.y);
      ctx.rotate(v.angle ?? 0);
      ctx.beginPath();
      ctx.arc(0, 0, v.radius, -0.75, 0.75);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 14 * alpha;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else if (v.kind === 'tether' && v.tx !== undefined && v.ty !== undefined) {
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.lineTo(v.tx, v.ty);
      ctx.strokeStyle = v.color;
      ctx.lineWidth = 5;
      ctx.stroke();
    } else if (v.kind === 'coin') {
      ctx.beginPath();
      ctx.arc(v.x, v.y - (1 - alpha) * 42, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (v.kind === 'cable' && v.tx !== undefined && v.ty !== undefined) {
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.lineTo(v.tx, v.ty);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (v.kind === 'elemental' || v.kind === 'prism') {
      ctx.beginPath();
      ctx.arc(v.x, v.y - (1 - alpha) * 26, Math.max(6, v.radius * alpha * 0.7), 0, Math.PI * 2);
      ctx.fillStyle = v.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (v.kind === 'text' && v.text && state.settings.basics.damageText) {
      ctx.font = `bold ${v.isCrit ? 22 : 17}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(v.text, v.x + 1.5, v.y - (1 - alpha) * 44 + 1.5);
      ctx.fillStyle = v.color;
      ctx.fillText(v.text, v.x, v.y - (1 - alpha) * 44);
    }
    ctx.restore();
  }

  // 17. Tactical Map Pings & Glowing Cyan "On My Way" Route Trails on Battlefield
  for (const ping of state.tacticalPings) {
    const pAlpha = Math.max(0, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
    ctx.save();
    ctx.globalAlpha = Math.min(1, pAlpha * 1.4);

    // Glowing Cyan Dotted "On My Way" Route Path
    if (ping.routePoints && ping.routePoints.length >= 2) {
      ctx.beginPath();
      ping.routePoints.forEach((pt, idx) => (idx === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.strokeStyle = 'rgba(34,211,238,0.35)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 5;
      ctx.setLineDash([14, 10]);
      ctx.lineDashOffset = -(state.matchTimeSec * 48);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Expanding Ping Beacon Ripple
    const pulsePhase = (state.matchTimeSec * 2.2) % 1;
    const rad = 28 + pulsePhase * 86;
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, rad, 0, Math.PI * 2);
    ctx.strokeStyle = ping.color;
    ctx.lineWidth = 4.5 * (1 - pulsePhase * 0.6);
    ctx.stroke();

    // Inner Beacon Badge
    ctx.beginPath();
    ctx.arc(ping.x, ping.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(11,19,43,0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = ping.color;
    ctx.stroke();
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ping.icon, ping.x, ping.y + 1);

    // Floating Tactical Label Banner
    ctx.font = 'bold 12px sans-serif';
    const textW = Math.min(240, ctx.measureText(ping.label).width + 18);
    ctx.fillStyle = 'rgba(8,14,28,0.88)';
    ctx.beginPath();
    ctx.roundRect(ping.x - textW / 2, ping.y - 50, textW, 22, 8);
    ctx.fill();
    ctx.strokeStyle = ping.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ping.label, ping.x, ping.y - 38);
    ctx.restore();
  }

  ctx.restore();

  // Helcurt Dark Night Falls Global Blind Veil (2D fallback screen-space overlay)
  if (state.playerBlinded) {
    ctx.save();
    const grad = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.14, width / 2, height / 2, Math.max(width, height) * 0.55);
    grad.addColorStop(0, 'rgba(15,6,32,0.18)');
    grad.addColorStop(1, 'rgba(5,2,18,0.88)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

/**
 * Renders the crisp 120% Top-Left Minimap, Drag-to-Mark Pop-Out Map, and Expanded ~45% Tactical Map
 * with Real-Time Fog of War masking, circular objective respawn countdown rings, EXP/Gold lane markers,
 * Walkie Grass patrolling ward, and Brawl Healing Shrines.
 */
export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: RenderSceneState
): void {
  const sx = w / WORLD_SIZE;
  const sy = h / WORLD_SIZE;
  const theme = MAP_THEMES[state.mapTheme] ?? MAP_THEMES.imperial_sanctuary;
  const isLarge = w >= 220;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = state.isBrawl ? '#071324' : '#122434';
  ctx.fillRect(0, 0, w, h);

  // Lanes
  ctx.strokeStyle = state.isBrawl ? 'rgba(240,198,91,0.72)' : 'rgba(212,185,123,0.48)';
  ctx.lineWidth = state.isBrawl ? Math.max(9, w * 0.11) : Math.max(5, w * 0.055);
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (!state.isBrawl) {
    ctx.moveTo(420 * sx, 3480 * sy);
    ctx.lineTo(420 * sx, 420 * sy);
    ctx.lineTo(3480 * sx, 420 * sy);
    ctx.moveTo(520 * sx, 3580 * sy);
    ctx.lineTo(3580 * sx, 3580 * sy);
    ctx.lineTo(3580 * sx, 520 * sy);
  }
  ctx.moveTo(520 * sx, 3480 * sy);
  ctx.lineTo(3480 * sx, 520 * sy);
  ctx.stroke();

  // River
  if (!state.isBrawl) {
    ctx.strokeStyle = theme.riverB + '88';
    ctx.lineWidth = state.mapVariant === 'expanding_rivers' ? Math.max(7, w * 0.075) : Math.max(4, w * 0.05);
    ctx.beginPath();
    ctx.moveTo(300 * sx, 300 * sy);
    ctx.lineTo(3700 * sx, 3700 * sy);
    ctx.stroke();

    // EXP & Gold Lane corner badges on minimap
    const expPos = getLaneDecalPosition(state.expLane);
    const goldPos = getLaneDecalPosition(state.goldLane);
    ctx.font = `bold ${isLarge ? 11 : 8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#22D3EE';
    ctx.fillText('⚔', expPos.x * sx, expPos.y * sy);
    ctx.fillStyle = '#FACC15';
    ctx.fillText('🪙', goldPos.x * sx, goldPos.y * sy);
  }

  // Bushes on large tactical map for ambush pinging
  if (!state.isBrawl && isLarge) {
    ctx.fillStyle = state.mapVariant === 'dangerous_grass' ? 'rgba(34,197,94,0.58)' : 'rgba(46,125,65,0.42)';
    for (const b of getActiveMapBushes(state.mapVariant)) {
      ctx.beginPath();
      ctx.ellipse(b.cx * sx, b.cy * sy, Math.max(3, b.rx * sx), Math.max(2.5, b.ry * sy), b.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Real-Time Fog of War Dimming Shroud (dims all map zones outside allied Hero/Minion/Turret/Walkie Grass vision!)
  if (!state.isSpectator) {
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 16, 0.56)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const c of state.blueVisionCircles) {
      const cx = c.x * sx;
      const cy = c.y * sy;
      const rad = Math.max(6, c.radius * sx);
      const grad = ctx.createRadialGradient(cx, cy, rad * 0.25, cx, cy, rad);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Brawl Healing Shrines on Minimap
  if (state.isBrawl) {
    for (const sh of state.brawlShrines) {
      const mx = sh.x * sx;
      const my = sh.y * sy;
      ctx.beginPath();
      ctx.arc(mx, my, isLarge ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = sh.active ? '#2CE58B' : 'rgba(148,163,184,0.35)';
      ctx.fill();
      if (!sh.active && sh.respawnTimer > 0) {
        const frac = 1 - sh.respawnTimer / Math.max(1, sh.maxRespawn);
        ctx.beginPath();
        ctx.arc(mx, my, isLarge ? 8 : 5.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
        ctx.strokeStyle = '#2CE58B';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    }
  }

  // Patrolling Walkie Grass Wards on Minimap
  for (const wg of state.walkieGrasses) {
    const wx = wg.x * sx;
    const wy = wg.y * sy;
    ctx.save();
    ctx.beginPath();
    ctx.arc(wx, wy, isLarge ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = wg.team === 'blue' ? '#2DD4BF' : '#FB7185';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // Alive Turrets & Crystals
  for (const t of state.turrets) {
    if (!t.alive) continue;
    ctx.fillStyle = t.team === 'blue' ? '#38BDF8' : '#EF4444';
    const r = t.tier === 4 ? (isLarge ? 7 : 5) : isLarge ? 4.5 : 3;
    ctx.fillRect(t.x * sx - r, t.y * sy - r, r * 2, r * 2);
    if (t.tier === 1 && t.shieldHp > 0) {
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(t.x * sx - r - 1, t.y * sy - r - 1, r * 2 + 2, r * 2 + 2);
    }
  }

  // Jungle Mobs & Circular Radial Respawn Countdowns for Buffs, Turtle & Lord
  for (const m of state.jungleMobs) {
    const isMajor = m.kind === 'lord' || m.kind === 'turtle';
    const isBuff = m.kind === 'orange_buff' || m.kind === 'purple_buff';
    if (m.alive) {
      ctx.beginPath();
      ctx.arc(m.x * sx, m.y * sy, isMajor ? (isLarge ? 8 : 5.5) : isLarge ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = m.color;
      ctx.fill();
      if (isMajor && isLarge) {
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.icon, m.x * sx, m.y * sy);
      }
    } else if ((isMajor || isBuff) && m.respawnTimer > 0 && m.respawnTimer < 240) {
      const mx = m.homeX * sx;
      const my = m.homeY * sy;
      const maxSec = m.spawnedOnce ? m.respawnSec : m.firstSpawnSec;
      const frac = Math.max(0, Math.min(1, 1 - m.respawnTimer / Math.max(1, maxSec)));
      const rad = isMajor ? (isLarge ? 10 : 7) : isLarge ? 8 : 5.5;
      ctx.save();
      ctx.beginPath();
      ctx.arc(mx, my, rad, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(7,12,26,0.85)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, rad, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
      ctx.strokeStyle = isMajor ? '#FACC15' : m.color;
      ctx.lineWidth = isLarge ? 2.2 : 1.6;
      ctx.stroke();
      ctx.fillStyle = isMajor ? '#FDE047' : '#E2E8F0';
      ctx.font = `bold ${isLarge ? 9 : 7}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.ceil(m.respawnTimer)}`, mx, my + 0.5);
      ctx.restore();
    }
  }

  // Minions
  for (const m of state.minions) {
    if (!m.alive) continue;
    ctx.fillStyle =
      m.kind === 'lord_ally'
        ? '#F59E0B'
        : m.kind === 'super'
          ? '#FACC15'
          : m.team === 'blue'
            ? 'rgba(56,189,248,0.78)'
            : 'rgba(251,113,133,0.78)';
    const sz = m.kind === 'lord_ally' ? 5 : m.kind === 'super' ? 3.5 : 2.5;
    ctx.fillRect(m.x * sx - sz / 2, m.y * sy - sz / 2, sz, sz);
  }

  // Fog Ghosts on Minimap (last known position for 2s!)
  for (const ghost of state.fogGhosts) {
    const alpha = Math.max(0.2, ghost.ttl / Math.max(0.1, ghost.maxTtl));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(ghost.x * sx, ghost.y * sy, isLarge ? 7 : 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#FB7185';
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#FDE047';
    ctx.font = `bold ${isLarge ? 9 : 7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', ghost.x * sx, ghost.y * sy);
    ctx.restore();
  }

  // Heroes (strictly respecting Fog of War & Bush Stealth for red team!)
  for (const hero of state.heroes) {
    if (!hero.alive) continue;
    if (hero.team === 'red' && !state.visibleEnemyIds.has(hero.id)) continue;
    const rad = hero.isPlayer ? (isLarge ? 9 : 6) : isLarge ? 7.5 : 4.5;
    ctx.beginPath();
    ctx.arc(hero.x * sx, hero.y * sy, rad, 0, Math.PI * 2);
    ctx.fillStyle = hero.isPlayer ? '#FACC15' : hero.team === 'blue' ? '#38BDF8' : '#EF4444';
    ctx.fill();
    ctx.lineWidth = hero.isPlayer ? 2 : 1.4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    if (isLarge) {
      ctx.fillStyle = '#0A1020';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hero.heroDef.name.slice(0, 2).toUpperCase(), hero.x * sx, hero.y * sy + 0.5);
    }
  }

  // Tactical Pings & Glowing Cyan "On My Way" Route Trails on Minimap
  for (const ping of state.tacticalPings) {
    const pAlpha = Math.max(0.2, Math.min(1, ping.ttl / Math.max(0.1, ping.maxTtl)));
    ctx.save();
    ctx.globalAlpha = pAlpha;
    if (ping.routePoints && ping.routePoints.length >= 2) {
      ctx.beginPath();
      ping.routePoints.forEach((pt, idx) =>
        idx === 0 ? ctx.moveTo(pt.x * sx, pt.y * sy) : ctx.lineTo(pt.x * sx, pt.y * sy)
      );
      ctx.strokeStyle = '#22D3EE';
      ctx.lineWidth = isLarge ? 3 : 2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const pulse = ((state.matchTimeSec * 2.2) % 1) * (isLarge ? 14 : 9);
    ctx.beginPath();
    ctx.arc(ping.x * sx, ping.y * sy, (isLarge ? 6 : 4) + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = ping.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ping.x * sx, ping.y * sy, isLarge ? 5 : 3, 0, Math.PI * 2);
    ctx.fillStyle = ping.color;
    ctx.fill();
    ctx.restore();
  }

  // Live Camera Viewport Box
  const vw = state.camViewW * sx;
  const vh = state.camViewH * sy;
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth = isLarge ? 1.8 : 1.3;
  ctx.strokeRect(state.camX * sx - vw / 2, state.camY * sy - vh / 2, vw, vh);

  // Crystals quick anchor
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(BLUE_CRYSTAL.x * sx, BLUE_CRYSTAL.y * sy, isLarge ? 5.5 : 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(RED_CRYSTAL.x * sx, RED_CRYSTAL.y * sy, isLarge ? 5.5 : 4, 0, Math.PI * 2);
  ctx.fill();
}
