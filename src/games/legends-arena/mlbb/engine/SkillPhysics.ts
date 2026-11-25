import {
  MlbbCcType,
  MlbbDamageType,
  MlbbDeathRecap,
  MlbbElementKind,
  MlbbEmblemId,
  MlbbHeroDef,
  MlbbLane,
  MlbbMapVariantId,
  MlbbRole,
  MlbbSkillDef,
  MlbbSpellId
} from '../types';
import { clampToBrawlBridge, getActiveMapWalls, WORLD_SIZE } from '../data/mapData';
import {
  applyCdrCap,
  clamp,
  computeEffectiveDefense,
  computeFinalDamage,
  computeRetributionThreshold,
  dist,
  getCcPriority,
  isDashBlockingCc,
  RawCcLogEvent,
  RawDamageLogHit
} from './CombatMath';
import { mlbbAudio } from './AudioEngine';
import { executePart4HeroSkill } from './HeroKitsPart1';
import { executePart5HeroSkill } from './HeroKitsPart2';
import { getHeroElement, spawnElementalTrailVfx } from './VfxSystem';
import {
  ensureEquipState,
  getSpellOrActiveCdMultiplier,
  onHeroSkillCastEquipHooks,
  SimItemTalentState
} from './EquipmentCombatEngine';

export interface SimBuff {
  id: string;
  label: string;
  icon: string;
  remaining: number;
  max: number;
  color: string;
}

export interface SimHero {
  id: string;
  name: string;
  team: 'blue' | 'red';
  heroDef: MlbbHeroDef;
  skinColor: string;
  skinAccent: string;
  lane: MlbbLane;
  role: MlbbRole;
  isPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  radius: number;
  level: number;
  xp: number;
  xpToNext: number;
  skillPoints: number;
  skillLevels: [number, number, number];
  skillCds: [number, number, number];
  spellId: MlbbSpellId;
  spellCd: number;
  emblemId: MlbbEmblemId;
  talents: { t1: string; t2: string; t3: string };
  hp: number;
  maxHp: number;
  hpTrail: number; // delayed catch-up white/red bar
  shield: number;
  mana: number;
  maxMana: number;
  gold: number;
  totalGold: number;
  kills: number;
  deaths: number;
  assists: number;
  streak: number;
  multiKill: number;
  multiKillTimer: number;
  alive: boolean;
  respawnTimer: number;
  atkCd: number;
  hitFlashTimer: number;
  inBush: boolean;
  revealedTimer: number;
  spottedByEnemy: boolean;
  recentlyAttackedTimer: number;
  recalling: boolean;
  recallTimer: number;
  recallCd: number;
  regenCd: number;
  regenTimer: number;
  activeItemCd: number;
  emoteCd: number;
  activeEmote: { icon: string; callout: string; color: string; ttl: number } | null;
  items: string[];
  blessingId: string | null;
  prioritizedItemId: string | null;
  activeBuildIdx: 0 | 1 | 2;
  buildPlan: string[];
  junglerStacks: number;
  roamGold: number;
  isJungler: boolean;
  isRoamer: boolean;
  // CC & status
  ccType: MlbbCcType | null;
  ccTimer: number;
  ccPriority: number;
  ccImmuneTimer: number;
  untargetableTimer: number;
  physImmuneTimer: number;
  stealthTimer: number;
  speedBoostPct: number;
  speedBoostTimer: number;
  slowPct: number;
  slowTimer: number;
  antiHealTimer: number;
  defShredFlat: number;
  defShredTimer: number;
  // Hero-specific passive & recast states
  passiveStacks: number;
  passiveTimer: number;
  passiveCd: number; // e.g., Nana Molina's Gift 150s, Immortality 210s
  immortalityCd: number;
  markedTimer: number; // Layla/Eudora/Lancelot mark
  markedBy: string | null;
  recastSlot: 1 | 2 | 3 | null;
  recastTimer: number;
  attachedAllyId: string | null; // Angela Heartguard
  attachedTimer: number;
  tetherTargetId: string | null; // Estes / Angela
  tetherTimer: number;
  tetherKind: 'heal' | 'root' | null;
  orbitBlades: number; // Saber S1
  orbitTimer: number;
  // Buffs
  orangeBuffTimer: number;
  purpleBuffTimer: number;
  turtleBuffTimer: number;
  turtleKillerBuffTimer: number;
  turtleShieldRefreshAccum: number;
  goldCrabBuffTimer: number;
  goldCrabTickAccum: number;
  evolvedLordAuraTimer: number;
  bushParticleAccum: number;
  justRespawnedCloudReady: boolean;
  windChantTimer: number;
  winterCrownTimer: number;
  vengeanceTimer: number;
  inspireTimer: number;
  outOfCombatTimer: number;
  // Casting / dash / parabolic leap state (3-phase Foreswing -> Active -> Cancellable Backswing)
  castWindup: number;
  castBackswing: number;
  castColor: string;
  dashVx: number;
  dashVy: number;
  dashTimer: number;
  dashWallCross: boolean;
  leapZ: number;
  leapTimer: number;
  leapDuration: number;
  modelScale: number;
  // Part 4 bespoke hero states (Argus, Diggie, Helcurt, Faramis/Hanzo, Johnson, Beatrix, Julian, Carmilla, Harley, Gloo, Kadita, Fredrinn, Hirara, Alice/Hylos)
  deathImmuneTimer: number;
  eggFormTimer: number;
  blindedTimer: number;
  wallPhaseTimer: number;
  carDriveTimer: number;
  beatrixGunIdx: 0 | 1 | 2 | 3;
  julianCastCount: number;
  carmillaLinkIds: string[];
  carmillaLinkTimer: number;
  harleyRingTimer: number;
  harleyRingDamage: number;
  harleyRingCasterId: string | null;
  glooAttachTargetId: string | null;
  glooAttachTimer: number;
  kaditaHealBank: number;
  kaditaHealTimer: number;
  fredrinnGreyHp: number;
  toggleAuraTimer: number;
  toggleAuraKind: 'alice' | 'hylos' | 'baxia' | null;
  snapbackAnchor: { x: number; y: number; ttl: number; slot: 1 | 2 | 3 } | null;
  hiraraPrisms: { x: number; y: number; ttl: number }[];
  tauntTargetId: string | null;
  // Part 5 bespoke K-Z hero states (Kagura, Ling, Lylia, Masha, Roger, Selena, Valentina, Wanwan, X.Borg, Yin, Yu Zhong, Yve, etc.)
  lyliaTrail?: { x: number; y: number; hp: number; mana: number }[];
  kaguraUmbrella?: { x: number; y: number; deployed: boolean } | null;
  mashaBars?: number;
  xborgArmorActive?: boolean;
  lingWallTimer?: number;
  yinDomainTimer?: number;
  yuZhongDragonTimer?: number;
  valentinaStolenHeroId?: string | null;
  wanwanFlyTimer?: number;
  yveGridTimer?: number;
  altFormActive?: boolean;
  altFormTimer?: number;
  // Computed stats
  physAtk: number;
  magicPow: number;
  physDef: number;
  magicDef: number;
  flatPhysPen: number;
  pctPhysPen: number;
  flatMagicPen: number;
  pctMagicPen: number;
  atkSpd: number;
  critChance: number;
  critDmgPct: number;
  cdrPct: number;
  moveSpd: number;
  lifestealPct: number;
  spellVampPct: number;
  ccResPct: number;
  hpRegen: number;
  // Damage tracking for scoreboard/assists
  damageDealt: number;
  damageTaken: number;
  turretDamage: number;
  recentDamagers: Record<string, number>;
  // AI state
  aiState: 'lane' | 'jungle' | 'objective' | 'fight' | 'retreat';
  aiTimer: number;
  aiTargetX: number;
  aiTargetY: number;
  // Turret aggro tracking
  turretHitsOnMe: number;
  turretHitResetTimer: number;
  // Death damage recap log & practice dummy / potion buffs
  damageLog: RawDamageLogHit[];
  ccLog: RawCcLogEvent[];
  lastDeathRecap: MlbbDeathRecap | null;
  isTrainingDummy?: boolean;
  potionBuffTimer: number;
  potionBuffKind: 'power' | 'magic' | 'rock' | null;
  equipState?: SimItemTalentState;
}

export interface SimTempWall {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  ttl: number;
  maxTtl: number;
  ownerId: string;
}

export interface SimMinion {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot';
  kind: 'melee' | 'ranged' | 'siege' | 'super' | 'lord_ally' | 'mini_turtle';
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  range: number;
  atkCd: number;
  speed: number;
  radius: number;
  waypointIdx: number;
  gold: number;
  exp: number;
  hitFlashTimer: number;
  alive: boolean;
  lordStage?: 1 | 2 | 3;
  chargeReady?: boolean;
  slamCd?: number;
}

export interface SimTurret {
  id: string;
  team: 'blue' | 'red';
  lane: 'top' | 'mid' | 'bot' | 'crystal';
  tier: 1 | 2 | 3 | 4;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  plateDamageAccum: number;
  lastDamagedSec: number;
  atk: number;
  range: number;
  atkCd: number;
  targetId: string | null;
  consecutiveHeroHits: number;
  hitFlashTimer: number;
  alive: boolean;
  golden: boolean;
}

export interface SimJungleMob {
  id: string;
  kind: string;
  teamSide: 'blue' | 'red' | 'river';
  name: string;
  icon: string;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  atkCd: number;
  gold: number;
  exp: number;
  leashRadius: number;
  color: string;
  alive: boolean;
  respawnTimer: number;
  firstSpawnSec: number;
  respawnSec: number;
  spawnedOnce: boolean;
  patience: number; // 0..100
  aggroTargetId: string | null;
  resetting: boolean;
  hitFlashTimer: number;
  lordStage: 1 | 2 | 3;
}

export interface SimProjectile {
  id: string;
  ownerId: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rangeLeft: number;
  damage: number;
  damageType: MlbbDamageType;
  color: string;
  kind:
    | 'basic'
    | 'skill_line'
    | 'hook'
    | 'boomerang'
    | 'beam'
    | 'orb_stun'
    | 'molina_zone'
    | 'turret_shot'
    | 'flameshot';
  homingTargetId?: string;
  pierce?: boolean;
  hitIds: Set<string>;
  ccType?: MlbbCcType;
  ccDuration?: number;
  returning?: boolean;
  life: number;
  maxLife: number;
  extraTag?: string;
}

export interface SimVfx {
  id: string;
  kind:
    | 'ring'
    | 'slash'
    | 'beam'
    | 'crater'
    | 'burst'
    | 'text'
    | 'coin'
    | 'tether'
    | 'warning'
    | 'leaf'
    | 'shard'
    | 'elemental'
    | 'prism'
    | 'cable'
    | 'wall';
  x: number;
  y: number;
  tx?: number;
  ty?: number;
  radius: number;
  color: string;
  text?: string;
  ttl: number;
  maxTtl: number;
  angle?: number;
  element?: MlbbElementKind;
  isCrit?: boolean;
}

export interface SimCallbacks {
  dealDamageToHero: (
    attacker: SimHero | null,
    target: SimHero,
    rawDmg: number,
    dmgType: MlbbDamageType,
    isBasic?: boolean,
    isCrit?: boolean,
    sourceName?: string,
    bypassShield?: boolean
  ) => void;
  dealDamageToMinion: (attacker: SimHero | null, minion: SimMinion, rawDmg: number, dmgType: MlbbDamageType) => void;
  dealDamageToJungle: (attacker: SimHero | null, mob: SimJungleMob, rawDmg: number, dmgType: MlbbDamageType) => void;
  dealDamageToTurret: (attacker: SimHero | null, turret: SimTurret, rawDmg: number) => void;
  applyCc: (target: SimHero, ccType: MlbbCcType, duration: number, caster?: SimHero) => void;
  spawnVfx: (vfx: Omit<SimVfx, 'id'>) => void;
  spawnProjectile: (proj: Omit<SimProjectile, 'id' | 'hitIds'>) => void;
  healHero: (target: SimHero, amount: number, source?: SimHero, bypassAntiHeal?: boolean) => void;
  grantShield: (target: SimHero, amount: number, bypassAntiHeal?: boolean) => void;
  announce: (text: string, sub: string, color: string) => void;
  triggerGlobalReveal?: (forTeam: 'blue' | 'red', durationSec: number) => void;
  triggerGlobalBlind?: (enemyTeam: 'blue' | 'red', durationSec: number) => void;
  spawnTempWall?: (wall: SimTempWall) => void;
}

export interface SkillCastContext {
  heroes: SimHero[];
  minions: SimMinion[];
  turrets: SimTurret[];
  jungleMobs: SimJungleMob[];
  tempWalls?: SimTempWall[];
  callbacks: SimCallbacks;
  matchTimeSec: number;
  noCooldown: boolean;
}

export function resolveWallCollision(
  x: number,
  y: number,
  radius: number,
  campSlainMap: Record<string, number>,
  mapVariant?: MlbbMapVariantId,
  isBrawl = false,
  tempWalls: readonly SimTempWall[] = []
): { x: number; y: number; hitWall: boolean } {
  if (isBrawl) {
    const c = clampToBrawlBridge(x, y, radius);
    return { x: c.x, y: c.y, hitWall: Math.hypot(c.x - x, c.y - y) > 2 };
  }
  let nx = clamp(x, radius + 30, WORLD_SIZE - radius - 30);
  let ny = clamp(y, radius + 30, WORLD_SIZE - radius - 30);
  let hitWall = Math.hypot(nx - x, ny - y) > 2;
  const walls = getActiveMapWalls(mapVariant);
  for (const w of walls) {
    if (w.shortcutCampId && (campSlainMap[w.shortcutCampId] ?? 0) > 0) {
      continue; // Purple buff shortcut wall is open
    }
    const closestX = clamp(nx, w.x, w.x + w.w);
    const closestY = clamp(ny, w.y, w.y + w.h);
    const dx = nx - closestX;
    const dy = ny - closestY;
    const d2 = dx * dx + dy * dy;
    if (d2 < radius * radius) {
      const d = Math.sqrt(d2) || 0.001;
      const push = radius - d;
      nx += (dx / d) * push;
      ny += (dy / d) * push;
      hitWall = true;
    }
  }
  for (const tw of tempWalls) {
    const closestX = clamp(nx, tw.x, tw.x + tw.w);
    const closestY = clamp(ny, tw.y, tw.y + tw.h);
    const dx = nx - closestX;
    const dy = ny - closestY;
    const d2 = dx * dx + dy * dy;
    if (d2 < radius * radius) {
      const d = Math.sqrt(d2) || 0.001;
      const push = radius - d;
      nx += (dx / d) * push;
      ny += (dy / d) * push;
      hitWall = true;
    }
  }
  return { x: nx, y: ny, hitWall };
}

export function applyCcToHero(
  target: SimHero,
  ccType: MlbbCcType,
  duration: number,
  matchTimeSec = 0
): boolean {
  if (!target.alive || target.untargetableTimer > 0) return false;
  const prio = getCcPriority(ccType);
  // Suppression (Tier 5 Ultimate CC) bypasses CC Immunity & CC Resilience!
  if (ccType !== 'suppression' && target.ccImmuneTimer > 0) {
    return false;
  }
  const reducedDur = ccType === 'suppression' ? duration : duration * (1 - Math.min(0.6, target.ccResPct));
  const recordCc = () => {
    if (!target.ccLog) target.ccLog = [];
    target.ccLog.push({ ccType, durationSec: reducedDur, timeSec: matchTimeSec });
    if (target.ccLog.length > 32) {
      target.ccLog.splice(0, target.ccLog.length - 32);
    }
  };
  if (ccType === 'slow') {
    target.slowPct = Math.max(target.slowPct, 0.38);
    target.slowTimer = Math.max(target.slowTimer, reducedDur);
    recordCc();
    return true;
  }
  if (!target.ccType || prio >= target.ccPriority || reducedDur > target.ccTimer) {
    target.ccType = ccType;
    target.ccPriority = prio;
    target.ccTimer = Math.max(target.ccTimer, reducedDur);
    target.recalling = false;
    recordCc();
    return true;
  }
  return false;
}

function getSkillDmg(hero: SimHero, skill: MlbbSkillDef, lvl: number): number {
  const idx = clamp(lvl - 1, 0, skill.baseDmg.length - 1);
  return skill.baseDmg[idx] + hero.physAtk * skill.physScale + hero.magicPow * skill.magicScale;
}

function findNearestEnemyHero(caster: SimHero, heroes: SimHero[], range: number, nearX = caster.x, nearY = caster.y): SimHero | null {
  let best: SimHero | null = null;
  let bestD = range;
  for (const h of heroes) {
    if (!h.alive || h.team === caster.team || h.untargetableTimer > 0 || h.stealthTimer > 0) continue;
    const d = dist(nearX, nearY, h.x, h.y);
    if (d <= bestD) {
      bestD = d;
      best = h;
    }
  }
  return best;
}

/**
 * Executes any of the 12 iconic hero skills with distinct physics, VFX, and passives.
 */
export function castHeroSkill(
  caster: SimHero,
  slot: 1 | 2 | 3,
  aimAngle: number,
  aimDist: number,
  ctx: SkillCastContext
): boolean {
  if (!caster.alive || (caster.eggFormTimer ?? 0) > 0) return false;
  if (caster.ccType && (caster.ccType === 'silence' || caster.ccType === 'taunt' || getCcPriority(caster.ccType) >= 3)) {
    return false;
  }

  const sIdx = slot - 1;
  const skill = caster.heroDef.skills[sIdx];
  const lvl = caster.skillLevels[sIdx];
  if (lvl <= 0) return false;

  // Tier 1 Grounded & Tier 2 Root block dash / blink / leap mobility skills!
  const isMobilitySkill = skill.physics === 'blink' || skill.physics === 'dash' || skill.physics === 'leap';
  if (isMobilitySkill && caster.ccType && isDashBlockingCc(caster.ccType)) {
    return false;
  }

  const isRecast = caster.recastSlot === slot && caster.recastTimer > 0;
  if (!isRecast && caster.skillCds[sIdx] > 0) return false;

  const resourceMult =
    caster.purpleBuffTimer > 0 ? (caster.heroDef.resource === 'energy' ? 0.8 : 0.6) : 1;
  const manaCost =
    caster.heroDef.resource === 'none' ? 0 : Math.round(skill.manaCost * resourceMult);
  // Hylos Thickened Blood: casts with HP when Mana is 0!
  const hylosHpCast = caster.heroDef.id === 'hylos' && manaCost > caster.mana && caster.hp > manaCost * 1.5;
  if (!isRecast && manaCost > caster.mana && !hylosHpCast) return false;

  if (!isRecast) {
    if (hylosHpCast) {
      const deficit = manaCost - caster.mana;
      caster.mana = 0;
      caster.hp = Math.max(1, caster.hp - deficit * 1.5);
    } else {
      caster.mana = Math.max(0, caster.mana - manaCost);
    }
    const cdIdx = clamp(lvl - 1, 0, skill.cooldown.length - 1);
    const hasTalisman = caster.items.includes('enchanted_talisman');
    const cdr = applyCdrCap(caster.cdrPct + (caster.purpleBuffTimer > 0 ? 0.1 : 0), hasTalisman);
    caster.skillCds[sIdx] = ctx.noCooldown ? 0.25 : Math.max(0.5, skill.cooldown[cdIdx] * (1 - cdr));
  } else {
    caster.recastSlot = null;
    caster.recastTimer = 0;
  }

  // 3-Phase Cast Cycle: Foreswing -> Active Hitbox -> Cancellable Backswing
  // Casting a mobility skill immediately cancels any lingering Backswing!
  if (isMobilitySkill) {
    caster.castBackswing = 0;
  } else {
    caster.castBackswing = skill.backswing || 0.16;
  }
  caster.facing = aimAngle;
  caster.castWindup = skill.foreswing || 0.14;
  caster.castColor = skill.color;
  caster.recalling = false;
  caster.outOfCombatTimer = 0;
  caster.recentlyAttackedTimer = Math.max(caster.recentlyAttackedTimer, 1.5);
  onHeroSkillCastEquipHooks(caster, slot);

  if (caster.isPlayer) {
    mlbbAudio.playSkill(slot, skill.damageType);
  }

  const dmg = getSkillDmg(caster, skill, lvl);
  const clampedDist = clamp(aimDist || skill.range * 0.65, 60, Math.max(80, skill.range));
  const tx = caster.x + Math.cos(aimAngle) * clampedDist;
  const ty = caster.y + Math.sin(aimAngle) * clampedDist;
  const { callbacks, heroes, minions, jungleMobs } = ctx;

  // Helper to hit enemies in circle
  const hitCircle = (
    cx: number,
    cy: number,
    rad: number,
    rawD: number,
    dType: MlbbDamageType,
    cc?: MlbbCcType,
    ccDur?: number,
    onHeroHit?: (h: SimHero) => void,
    bypassShield = false
  ): number => {
    let hitCount = 0;
    for (const h of heroes) {
      if (!h.alive || h.team === caster.team || h.untargetableTimer > 0) continue;
      if (dist(cx, cy, h.x, h.y) <= rad + h.radius) {
        callbacks.dealDamageToHero(caster, h, rawD, dType, false, false, skill.name, bypassShield);
        if (cc && ccDur) callbacks.applyCc(h, cc, ccDur, caster);
        onHeroHit?.(h);
        hitCount++;
      }
    }
    for (const m of minions) {
      if (!m.alive || m.team === caster.team) continue;
      if (dist(cx, cy, m.x, m.y) <= rad + m.radius) {
        callbacks.dealDamageToMinion(caster, m, rawD, dType);
        hitCount++;
      }
    }
    for (const j of jungleMobs) {
      if (!j.alive) continue;
      if (dist(cx, cy, j.x, j.y) <= rad + 36) {
        callbacks.dealDamageToJungle(caster, j, rawD, dType);
        hitCount++;
      }
    }
    return hitCount;
  };

  // Parabolic Leap primitive helper (sets Z-axis elevation curve alongside horizontal velocity)
  const startParabolicLeap = (angle: number, travelDist: number, durationSec: number, wallCross = true) => {
    const dur = clamp(durationSec, 0.22, 0.58);
    caster.dashVx = (Math.cos(angle) * travelDist) / dur;
    caster.dashVy = (Math.sin(angle) * travelDist) / dur;
    caster.dashTimer = dur;
    caster.dashWallCross = wallCross;
    caster.leapDuration = dur;
    caster.leapTimer = dur;
    caster.leapZ = 0.5;
  };

  // Displacement + Wall-Pin collision helper (checks map walls & temporary rock barriers!)
  const displaceWithWallPin = (
    target: SimHero,
    pushAngle: number,
    pushDist: number,
    sourceHero: SimHero,
    pinBonusDmg: number,
    pinStunSec: number
  ): boolean => {
    const desiredX = target.x + Math.cos(pushAngle) * pushDist;
    const desiredY = target.y + Math.sin(pushAngle) * pushDist;
    const res = resolveWallCollision(desiredX, desiredY, target.radius, {}, undefined, false, ctx.tempWalls ?? []);
    target.x = res.x;
    target.y = res.y;
    if (res.hitWall) {
      callbacks.dealDamageToHero(sourceHero, target, pinBonusDmg, 'physical', false, false, 'Wall Pin');
      callbacks.applyCc(target, 'stun', pinStunSec, sourceHero);
      callbacks.spawnVfx({ kind: 'burst', x: res.x, y: res.y, radius: 110, color: '#FACC15', ttl: 0.45, maxTtl: 0.45 });
      return true;
    }
    return false;
  };

  const hid = caster.heroDef.id;

  // Dispatch Part 4 Bespoke Hero Kits (Heroes 1-66 A-K including Hirara, Beatrix, Fanny, Johnson, Barats, Argus, etc.)
  const skillHelpers = {
    hitCircle,
    findNearestEnemy: (range: number, nearX?: number, nearY?: number) => findNearestEnemyHero(caster, heroes, range, nearX, nearY),
    startParabolicLeap,
    displaceWithWallPin
  };
  const handledByPart4 = executePart4HeroSkill(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, skillHelpers);
  if (handledByPart4) {
    return true;
  }

  // Dispatch Part 5 Bespoke Hero Kits (Heroes 67-133 K-Z: Kagura through Zilong)
  const handledByPart5 = executePart5HeroSkill(caster, slot, skill, lvl, aimAngle, aimDist, dmg, isRecast, ctx, skillHelpers);
  if (handledByPart5) {
    return true;
  }

  // ==================== 12 ICONIC HERO SKILL IMPLEMENTATIONS ====================
  if (hid === 'miya') {
    if (slot === 1) {
      // Moon Arrow: triple split arrows buff
      caster.passiveTimer = Math.max(caster.passiveTimer, 5);
      caster.passiveStacks = Math.min(5, caster.passiveStacks + 2);
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 72, color: skill.color, ttl: 0.45, maxTtl: 0.45 });
    } else if (slot === 2) {
      // Arrow of Eclipse: AoE root
      callbacks.spawnVfx({ kind: 'crater', x: tx, y: ty, radius: skill.radius, color: skill.color, ttl: 0.55, maxTtl: 0.55 });
      hitCircle(tx, ty, skill.radius, dmg, 'physical', 'root', 1.2);
    } else {
      // Hidden Moonlight: Purify + Stealth + 5 Turbo stacks + MS burst
      if (caster.ccType && caster.ccType !== 'suppression') {
        caster.ccType = null;
        caster.ccTimer = 0;
      }
      caster.stealthTimer = 2.0;
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.45);
      caster.speedBoostTimer = 2.5;
      caster.passiveStacks = 5;
      caster.passiveTimer = 5.0;
      callbacks.spawnVfx({ kind: 'burst', x: caster.x, y: caster.y, radius: 95, color: '#E0F2FE', ttl: 0.5, maxTtl: 0.5 });
    }
    return true;
  }

  if (hid === 'layla') {
    if (slot === 1) {
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 940,
        vy: Math.sin(aimAngle) * 940,
        radius: 26,
        rangeLeft: skill.range,
        damage: dmg,
        damageType: 'physical',
        color: skill.color,
        kind: 'skill_line',
        life: 1.0,
        maxLife: 1.0,
        extraTag: 'layla_s1'
      });
    } else if (slot === 2) {
      callbacks.spawnVfx({ kind: 'crater', x: tx, y: ty, radius: skill.radius, color: skill.color, ttl: 0.45, maxTtl: 0.45 });
      hitCircle(tx, ty, skill.radius, dmg, 'physical', 'slow', 1.4, (h) => {
        h.markedTimer = 3.5;
        h.markedBy = caster.id;
      });
    } else {
      // Destruction Rush: 1100-unit beam
      const ex = caster.x + Math.cos(aimAngle) * skill.range;
      const ey = caster.y + Math.sin(aimAngle) * skill.range;
      callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: ex, ty: ey, radius: 68, color: skill.color, ttl: 0.5, maxTtl: 0.5, angle: aimAngle });
      const steps = 11;
      const hitSet = new Set<string>();
      for (let i = 1; i <= steps; i++) {
        const px = caster.x + Math.cos(aimAngle) * ((skill.range / steps) * i);
        const py = caster.y + Math.sin(aimAngle) * ((skill.range / steps) * i);
        for (const h of heroes) {
          if (!h.alive || h.team === caster.team || h.untargetableTimer > 0 || hitSet.has(h.id)) continue;
          if (dist(px, py, h.x, h.y) <= 72 + h.radius) {
            hitSet.add(h.id);
            callbacks.dealDamageToHero(caster, h, dmg, 'physical');
          }
        }
        for (const m of minions) {
          if (!m.alive || m.team === caster.team || hitSet.has(m.id)) continue;
          if (dist(px, py, m.x, m.y) <= 72 + m.radius) {
            hitSet.add(m.id);
            callbacks.dealDamageToMinion(caster, m, dmg, 'physical');
          }
        }
      }
    }
    return true;
  }

  if (hid === 'tigreal') {
    if (slot === 1) {
      // Attack Wave: 3 sequential ground shockwaves along line
      for (let w = 1; w <= 3; w++) {
        const wx = caster.x + Math.cos(aimAngle) * (w * 145);
        const wy = caster.y + Math.sin(aimAngle) * (w * 145);
        callbacks.spawnVfx({ kind: 'crater', x: wx, y: wy, radius: 95, color: skill.color, ttl: 0.35 + w * 0.1, maxTtl: 0.65 });
        hitCircle(wx, wy, 95, dmg * (0.65 + w * 0.18), 'physical', 'slow', 1.5);
      }
    } else if (slot === 2) {
      if (isRecast) {
        // Stage 2: Hammer Uppercut Airborne
        const ux = caster.x + Math.cos(aimAngle) * 110;
        const uy = caster.y + Math.sin(aimAngle) * 110;
        callbacks.spawnVfx({ kind: 'burst', x: ux, y: uy, radius: 135, color: '#FACC15', ttl: 0.45, maxTtl: 0.45 });
        hitCircle(ux, uy, 135, dmg * 0.85, 'physical', 'airborne', 1.0);
      } else {
        // Stage 1: Sacred Hammer Charge pushing enemies
        caster.dashVx = Math.cos(aimAngle) * 900;
        caster.dashVy = Math.sin(aimAngle) * 900;
        caster.dashTimer = 0.34;
        caster.dashWallCross = false;
        caster.recastSlot = 2;
        caster.recastTimer = 3.5;
        callbacks.spawnVfx({ kind: 'slash', x: caster.x, y: caster.y, radius: 110, color: skill.color, ttl: 0.35, maxTtl: 0.35, angle: aimAngle });
        hitCircle(caster.x + Math.cos(aimAngle) * 150, caster.y + Math.sin(aimAngle) * 150, 120, dmg, 'physical', 'knockback', 0.45, (h) => {
          h.x = clamp(h.x + Math.cos(aimAngle) * 130, 80, WORLD_SIZE - 80);
          h.y = clamp(h.y + Math.sin(aimAngle) * 130, 80, WORLD_SIZE - 80);
        });
      }
    } else {
      // Implosion: Pull all nearby enemies inward + 1.8s Stun
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: skill.radius, color: '#FACC15', ttl: 0.65, maxTtl: 0.65 });
      hitCircle(caster.x, caster.y, skill.radius, dmg, 'physical', 'stun', 1.8, (h) => {
        const ang = Math.atan2(caster.y - h.y, caster.x - h.x);
        const pullD = Math.min(180, dist(caster.x, caster.y, h.x, h.y) * 0.65);
        h.x += Math.cos(ang) * pullD;
        h.y += Math.sin(ang) * pullD;
      });
    }
    return true;
  }

  if (hid === 'franco') {
    if (slot === 1) {
      // Iron Hook: 850-range displacement hook
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 1080,
        vy: Math.sin(aimAngle) * 1080,
        radius: 30,
        rangeLeft: skill.range,
        damage: dmg,
        damageType: 'physical',
        color: skill.color,
        kind: 'hook',
        life: 0.9,
        maxLife: 0.9
      });
    } else if (slot === 2) {
      // Fury Shock: 70% slow ring
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: skill.radius, color: skill.color, ttl: 0.45, maxTtl: 0.45 });
      hitCircle(caster.x, caster.y, skill.radius, dmg + caster.maxHp * 0.04, 'physical', 'slow', 1.5);
    } else {
      // Bloody Hunt: 1.8s Un-purifiable Suppression!
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      if (tgt) {
        callbacks.applyCc(tgt, 'suppression', 1.8, caster);
        callbacks.dealDamageToHero(caster, tgt, dmg, 'physical');
        callbacks.spawnVfx({ kind: 'burst', x: tgt.x, y: tgt.y, radius: 115, color: '#EF4444', ttl: 0.7, maxTtl: 0.7 });
      } else {
        callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 140, color: '#EF4444', ttl: 0.4, maxTtl: 0.4 });
      }
    }
    return true;
  }

  if (hid === 'zilong') {
    if (slot === 1) {
      // Spear Flip: flips enemy behind Zilong
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      if (tgt) {
        const behindAng = Math.atan2(caster.y - tgt.y, caster.x - tgt.x);
        tgt.x = clamp(caster.x + Math.cos(behindAng) * 95, 80, WORLD_SIZE - 80);
        tgt.y = clamp(caster.y + Math.sin(behindAng) * 95, 80, WORLD_SIZE - 80);
        callbacks.applyCc(tgt, 'airborne', 0.65, caster);
        callbacks.dealDamageToHero(caster, tgt, dmg, 'physical');
        callbacks.spawnVfx({ kind: 'burst', x: tgt.x, y: tgt.y, radius: 95, color: skill.color, ttl: 0.4, maxTtl: 0.4 });
      } else {
        hitCircle(tx, ty, 110, dmg * 0.7, 'physical', 'airborne', 0.5);
      }
    } else if (slot === 2) {
      // Spear Strike: gap-close dash + armor shred + CD reset on kill
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      const ang = tgt ? Math.atan2(tgt.y - caster.y, tgt.x - caster.x) : aimAngle;
      caster.dashVx = Math.cos(ang) * 1150;
      caster.dashVy = Math.sin(ang) * 1150;
      caster.dashTimer = 0.25;
      caster.dashWallCross = true;
      callbacks.spawnVfx({ kind: 'slash', x: caster.x, y: caster.y, radius: 110, color: skill.color, ttl: 0.35, maxTtl: 0.35, angle: ang });
      if (tgt) {
        tgt.defShredFlat = Math.max(tgt.defShredFlat, 20);
        tgt.defShredTimer = 2.5;
        const wasAlive = tgt.alive;
        callbacks.dealDamageToHero(caster, tgt, dmg, 'physical');
        if (wasAlive && !tgt.alive) caster.skillCds[1] = 0;
      } else {
        hitCircle(tx, ty, 120, dmg, 'physical');
      }
    } else {
      // Supreme Warrior: Slow immunity + +40% MS + +45% AtkSpd
      caster.slowTimer = 0;
      caster.slowPct = 0;
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.42);
      caster.speedBoostTimer = 7.0;
      caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.2);
      caster.inspireTimer = Math.max(caster.inspireTimer, 6.0);
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 120, color: '#FACC15', ttl: 0.6, maxTtl: 0.6 });
    }
    return true;
  }

  if (hid === 'alucard') {
    if (slot === 1) {
      // Groundsplitter: parabolic leap over walls with Z-elevation arc!
      startParabolicLeap(aimAngle, clampedDist, 0.34, true);
      callbacks.spawnVfx({ kind: 'crater', x: tx, y: ty, radius: skill.radius, color: skill.color, ttl: 0.5, maxTtl: 0.5 });
      hitCircle(tx, ty, skill.radius, dmg, 'physical', 'slow', 1.4);
    } else if (slot === 2) {
      // Whirling Smash: 360 slash
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: skill.radius, color: skill.color, ttl: 0.38, maxTtl: 0.38 });
      hitCircle(caster.x, caster.y, skill.radius, dmg, 'physical');
    } else {
      // Fission Wave: Lifesteal aura + Recast shockwave
      if (isRecast) {
        const ex = caster.x + Math.cos(aimAngle) * 580;
        const ey = caster.y + Math.sin(aimAngle) * 580;
        callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: ex, ty: ey, radius: 110, color: '#FACC15', ttl: 0.45, maxTtl: 0.45, angle: aimAngle });
        hitCircle(caster.x + Math.cos(aimAngle) * 280, caster.y + Math.sin(aimAngle) * 280, 220, dmg, 'physical', 'slow', 1.2);
      } else {
        caster.recastSlot = 3;
        caster.recastTimer = 6.0;
        caster.passiveTimer = 6.0;
        caster.shield = Math.max(caster.shield, 340);
        callbacks.spawnVfx({ kind: 'burst', x: caster.x, y: caster.y, radius: 130, color: '#FACC15', ttl: 0.5, maxTtl: 0.5 });
      }
    }
    return true;
  }

  if (hid === 'saber') {
    if (slot === 1) {
      // Orbiting Swords: 5 spinning cyan blades
      caster.orbitBlades = 5;
      caster.orbitTimer = 6.0;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 150, color: '#38BDF8', ttl: 0.45, maxTtl: 0.45 });
      hitCircle(caster.x, caster.y, 150, dmg, 'physical', undefined, undefined, (h) => {
        h.defShredFlat = Math.min(40, h.defShredFlat + 8);
        h.defShredTimer = 4.0;
      });
    } else if (slot === 2) {
      // Charge: wall-crossing dash
      caster.dashVx = Math.cos(aimAngle) * 1120;
      caster.dashVy = Math.sin(aimAngle) * 1120;
      caster.dashTimer = 0.28;
      caster.dashWallCross = true;
      callbacks.spawnVfx({ kind: 'slash', x: caster.x, y: caster.y, radius: 110, color: skill.color, ttl: 0.3, maxTtl: 0.3, angle: aimAngle });
      hitCircle(tx, ty, 105, dmg, 'physical', 'slow', 1.0);
    } else {
      // Triple Sweep: Dash to enemy + 1.2s Airborne + 3 heavy slashes
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      if (tgt) {
        caster.x = tgt.x - Math.cos(aimAngle) * 48;
        caster.y = tgt.y - Math.sin(aimAngle) * 48;
        callbacks.applyCc(tgt, 'airborne', 1.2, caster);
        tgt.defShredFlat = Math.min(45, tgt.defShredFlat + 18);
        tgt.defShredTimer = 5.0;
        callbacks.dealDamageToHero(caster, tgt, dmg, 'physical');
        callbacks.spawnVfx({ kind: 'burst', x: tgt.x, y: tgt.y, radius: 125, color: '#22D3EE', ttl: 0.6, maxTtl: 0.6 });
      } else {
        hitCircle(tx, ty, 130, dmg * 0.75, 'physical', 'airborne', 0.9);
      }
    }
    return true;
  }

  if (hid === 'lancelot') {
    if (slot === 1) {
      // Puncture: dash through targets; resets CD if hitting unmarked enemy!
      caster.dashVx = Math.cos(aimAngle) * 1200;
      caster.dashVy = Math.sin(aimAngle) * 1200;
      caster.dashTimer = 0.24;
      caster.dashWallCross = true;
      caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
      caster.passiveTimer = 4.0;
      let reset = false;
      callbacks.spawnVfx({ kind: 'slash', x: caster.x, y: caster.y, radius: 120, color: skill.color, ttl: 0.3, maxTtl: 0.3, angle: aimAngle });
      hitCircle(caster.x + Math.cos(aimAngle) * 160, caster.y + Math.sin(aimAngle) * 160, 120, dmg, 'physical', undefined, undefined, (h) => {
        if (h.markedTimer <= 0) {
          h.markedTimer = 5.0;
          h.markedBy = caster.id;
          reset = true;
        }
      });
      if (reset) caster.skillCds[0] = 0.15;
    } else if (slot === 2) {
      // Thorned Rose: 0.6s Untargetable I-frame + triangular 3-slash burst
      caster.untargetableTimer = 0.6;
      caster.passiveStacks = Math.min(4, caster.passiveStacks + 1);
      caster.passiveTimer = 4.0;
      callbacks.spawnVfx({ kind: 'burst', x: tx, y: ty, radius: skill.radius, color: '#E879F9', ttl: 0.55, maxTtl: 0.55 });
      callbacks.spawnVfx({ kind: 'ring', x: tx, y: ty, radius: skill.radius, color: '#FACC15', ttl: 0.45, maxTtl: 0.45 });
      hitCircle(tx, ty, skill.radius, dmg * (1 + caster.passiveStacks * 0.075), 'physical', 'slow', 0.8);
    } else {
      // Phantom Execution: brief CC-immune dash + lethal thrust
      caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.7);
      caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.35);
      caster.dashVx = Math.cos(aimAngle) * 1280;
      caster.dashVy = Math.sin(aimAngle) * 1280;
      caster.dashTimer = 0.32;
      caster.dashWallCross = true;
      const ex = caster.x + Math.cos(aimAngle) * skill.range;
      const ey = caster.y + Math.sin(aimAngle) * skill.range;
      callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: ex, ty: ey, radius: 90, color: '#FACC15', ttl: 0.45, maxTtl: 0.45, angle: aimAngle });
      hitCircle(caster.x + Math.cos(aimAngle) * 260, caster.y + Math.sin(aimAngle) * 260, 175, dmg * (1 + caster.passiveStacks * 0.075), 'physical');
    }
    return true;
  }

  if (hid === 'eudora') {
    if (slot === 1) {
      // Forked Lightning: cone + applies Superconductor mark
      callbacks.spawnVfx({ kind: 'slash', x: caster.x, y: caster.y, radius: skill.range, color: '#38BDF8', ttl: 0.4, maxTtl: 0.4, angle: aimAngle });
      hitCircle(caster.x + Math.cos(aimAngle) * 210, caster.y + Math.sin(aimAngle) * 210, 195, dmg, 'magic', undefined, undefined, (h) => {
        if (h.markedTimer > 0) callbacks.dealDamageToHero(caster, h, 180 + caster.magicPow * 0.35, 'magic');
        h.markedTimer = 4.0;
        h.markedBy = caster.id;
      });
    } else if (slot === 2) {
      // Ball Lightning: stun orb; chains to nearby marked enemies
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      if (tgt) {
        callbacks.spawnProjectile({
          ownerId: caster.id,
          team: caster.team,
          x: caster.x,
          y: caster.y,
          vx: 0,
          vy: 0,
          radius: 26,
          rangeLeft: skill.range + 120,
          damage: dmg,
          damageType: 'magic',
          color: '#60A5FA',
          kind: 'orb_stun',
          homingTargetId: tgt.id,
          ccType: 'stun',
          ccDuration: 1.25,
          life: 1.5,
          maxLife: 1.5
        });
      } else {
        callbacks.spawnVfx({ kind: 'crater', x: tx, y: ty, radius: 120, color: '#60A5FA', ttl: 0.4, maxTtl: 0.4 });
        hitCircle(tx, ty, 120, dmg, 'magic', 'stun', 1.1);
      }
    } else {
      // Thunder's Wrath: Massive lightning strike + secondary Superconductor storm
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      const bx = tgt ? tgt.x : tx;
      const by = tgt ? tgt.y : ty;
      callbacks.spawnVfx({ kind: 'burst', x: bx, y: by, radius: 175, color: '#38BDF8', ttl: 0.65, maxTtl: 0.65 });
      callbacks.spawnVfx({ kind: 'ring', x: bx, y: by, radius: 190, color: '#FACC15', ttl: 0.55, maxTtl: 0.55 });
      hitCircle(bx, by, 170, dmg, 'magic', undefined, undefined, (h) => {
        if (h.markedTimer > 0) {
          h.markedTimer = 0;
          callbacks.dealDamageToHero(caster, h, dmg * 0.55, 'magic');
        }
      });
    }
    return true;
  }

  if (hid === 'nana') {
    if (slot === 1) {
      // Magic Boomerang: Pierces out and back
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 780,
        vy: Math.sin(aimAngle) * 780,
        radius: 34,
        rangeLeft: skill.range,
        damage: dmg,
        damageType: 'magic',
        color: skill.color,
        kind: 'boomerang',
        pierce: true,
        returning: false,
        life: 1.8,
        maxLife: 1.8
      });
    } else if (slot === 2) {
      // Molina Smooch: Transforms enemies into Molina (1.5s transform + -25% Magic Def)
      callbacks.spawnVfx({ kind: 'ring', x: tx, y: ty, radius: skill.radius, color: '#FB7185', ttl: 0.8, maxTtl: 0.8 });
      hitCircle(tx, ty, skill.radius, dmg, 'magic', 'transform', 1.5, (h) => {
        h.defShredFlat = Math.max(h.defShredFlat, 22);
        h.defShredTimer = 2.5;
      });
    } else {
      // Molina Blitz: 3 sequential heavy blasts + Stun
      for (let i = 0; i < 3; i++) {
        const bx = tx + Math.cos(aimAngle) * (i * 90 - 70);
        const by = ty + Math.sin(aimAngle) * (i * 90 - 70);
        callbacks.spawnVfx({ kind: 'crater', x: bx, y: by, radius: skill.radius, color: '#F43F5E', ttl: 0.45 + i * 0.14, maxTtl: 0.8 });
        hitCircle(bx, by, skill.radius, dmg * 0.48, 'magic', i >= 1 ? 'stun' : 'slow', 1.0);
      }
    }
    return true;
  }

  if (hid === 'estes') {
    if (slot === 1) {
      // Moonlight Immersion: Heal lowest-HP nearby ally + tether
      let bestAlly: SimHero = caster;
      let lowestPct = caster.hp / caster.maxHp;
      for (const h of heroes) {
        if (!h.alive || h.team !== caster.team) continue;
        if (dist(caster.x, caster.y, h.x, h.y) <= skill.range && h.hp / h.maxHp < lowestPct) {
          lowestPct = h.hp / h.maxHp;
          bestAlly = h;
        }
      }
      const healAmt = 360 + lvl * 75 + caster.magicPow * 0.85;
      callbacks.healHero(bestAlly, healAmt, caster);
      caster.tetherTargetId = bestAlly.id;
      caster.tetherTimer = 3.0;
      caster.tetherKind = 'heal';
      callbacks.spawnVfx({ kind: 'ring', x: bestAlly.x, y: bestAlly.y, radius: 95, color: '#2CE58B', ttl: 0.55, maxTtl: 0.55 });
    } else if (slot === 2) {
      // Domain of Moon Goddess: heavy slow ring
      callbacks.spawnVfx({ kind: 'ring', x: tx, y: ty, radius: skill.radius, color: '#38BDF8', ttl: 0.8, maxTtl: 0.8 });
      hitCircle(tx, ty, skill.radius, dmg, 'magic', 'slow', 2.0);
    } else {
      // Blessing of Moon Goddess: Massive teamwide AoE heal!
      const healAmt = 680 + lvl * 180 + caster.magicPow * 1.15;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: skill.radius, color: '#FDE047', ttl: 0.9, maxTtl: 0.9 });
      for (const h of heroes) {
        if (!h.alive || h.team !== caster.team) continue;
        if (dist(caster.x, caster.y, h.x, h.y) <= skill.radius) {
          callbacks.healHero(h, healAmt, caster);
          callbacks.spawnVfx({ kind: 'tether', x: caster.x, y: caster.y, tx: h.x, ty: h.y, radius: 6, color: '#2CE58B', ttl: 0.75, maxTtl: 0.75 });
        }
      }
    }
    return true;
  }

  if (hid === 'angela') {
    if (slot === 1) {
      // Love Waves: damages enemies & heals allies in line
      const ex = caster.x + Math.cos(aimAngle) * skill.range;
      const ey = caster.y + Math.sin(aimAngle) * skill.range;
      callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: ex, ty: ey, radius: 75, color: '#F472B6', ttl: 0.4, maxTtl: 0.4, angle: aimAngle });
      hitCircle(caster.x + Math.cos(aimAngle) * 230, caster.y + Math.sin(aimAngle) * 230, 170, dmg, 'magic', 'slow', 1.0);
      for (const h of heroes) {
        if (!h.alive || h.team !== caster.team) continue;
        if (dist(caster.x + Math.cos(aimAngle) * 210, caster.y + Math.sin(aimAngle) * 210, h.x, h.y) <= 190) {
          callbacks.healHero(h, 210 + caster.magicPow * 0.45, caster);
        }
      }
    } else if (slot === 2) {
      // Puppet-on-a-String: Tether & Root enemy
      const tgt = findNearestEnemyHero(caster, heroes, skill.range);
      if (tgt) {
        caster.tetherTargetId = tgt.id;
        caster.tetherTimer = 2.0;
        caster.tetherKind = 'root';
        callbacks.dealDamageToHero(caster, tgt, dmg, 'magic');
        callbacks.applyCc(tgt, 'root', 1.4, caster);
        callbacks.spawnVfx({ kind: 'tether', x: caster.x, y: caster.y, tx: tgt.x, ty: tgt.y, radius: 5, color: '#E879F9', ttl: 0.8, maxTtl: 0.8 });
      }
    } else {
      // Heartguard: Global Shield + Attach to lowest-HP ally
      let targetAlly: SimHero | null = null;
      let lowestPct = 2;
      for (const h of heroes) {
        if (!h.alive || h.team !== caster.team || h.id === caster.id) continue;
        const pct = h.hp / h.maxHp;
        if (pct < lowestPct) {
          lowestPct = pct;
          targetAlly = h;
        }
      }
      if (targetAlly) {
        const sh = 1200 + lvl * 400 + caster.magicPow * 1.4;
        callbacks.grantShield(targetAlly, sh);
        caster.attachedAllyId = targetAlly.id;
        caster.attachedTimer = 8.0;
        caster.untargetableTimer = 8.0;
        callbacks.spawnVfx({ kind: 'ring', x: targetAlly.x, y: targetAlly.y, radius: 130, color: '#EC4899', ttl: 0.8, maxTtl: 0.8 });
      }
    }
    return true;
  }

  // ==================== UNIVERSAL 133-HERO PHYSICS DISPATCHER ====================
  // Global Vision Reveal Ultimates (Aldous, Yi Sun-shin, Zetian)
  if (slot === 3 && (hid === 'aldous' || hid === 'yi_sun_shin' || hid === 'zetian')) {
    callbacks.triggerGlobalReveal?.(caster.team, 5.0);
    callbacks.announce(
      `${caster.heroDef.name.toUpperCase()} — GLOBAL REVEAL!`,
      'All enemy positions exposed across the Land of Dawn for 5s!',
      skill.color
    );
    for (const h of heroes) {
      if (h.alive && h.team !== caster.team) {
        h.revealedTimer = Math.max(h.revealedTimer, 5.0);
        callbacks.spawnVfx({ kind: 'ring', x: h.x, y: h.y, radius: 70, color: skill.color, ttl: 0.75, maxTtl: 0.75 });
        if (hid === 'yi_sun_shin' || hid === 'zetian') {
          callbacks.dealDamageToHero(caster, h, dmg, skill.damageType, false, false, skill.name);
          if (skill.ccType && skill.ccDuration) callbacks.applyCc(h, skill.ccType, skill.ccDuration, caster);
        }
      }
    }
    if (hid === 'aldous') {
      const tgt = findNearestEnemyHero(caster, heroes, 4000);
      if (tgt) {
        caster.x = clamp(tgt.x - Math.cos(aimAngle) * 55, 80, WORLD_SIZE - 80);
        caster.y = clamp(tgt.y - Math.sin(aimAngle) * 55, 80, WORLD_SIZE - 80);
        callbacks.dealDamageToHero(caster, tgt, dmg, 'physical', false, false, skill.name);
        callbacks.applyCc(tgt, 'knockback', 0.9, caster);
        callbacks.spawnVfx({ kind: 'burst', x: tgt.x, y: tgt.y, radius: 135, color: skill.color, ttl: 0.65, maxTtl: 0.65 });
      }
    }
    return true;
  }

  switch (skill.physics) {
    case 'blink': {
      const nx = clamp(tx, 80, WORLD_SIZE - 80);
      const ny = clamp(ty, 80, WORLD_SIZE - 80);
      callbacks.spawnVfx({ kind: 'burst', x: caster.x, y: caster.y, radius: 68, color: skill.color, ttl: 0.35, maxTtl: 0.35 });
      caster.x = nx;
      caster.y = ny;
      callbacks.spawnVfx({ kind: 'burst', x: nx, y: ny, radius: Math.max(85, skill.radius), color: skill.color, ttl: 0.4, maxTtl: 0.4 });
      if (dmg > 0) hitCircle(nx, ny, Math.max(95, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
      break;
    }
    case 'dash':
    case 'leap': {
      if (skill.physics === 'leap') {
        startParabolicLeap(aimAngle, clampedDist, clamp(clampedDist / 960, 0.28, 0.44), true);
      } else {
        caster.dashVx = Math.cos(aimAngle) * 1140;
        caster.dashVy = Math.sin(aimAngle) * 1140;
        caster.dashTimer = clamp(clampedDist / 1080, 0.2, 0.38);
        caster.dashWallCross = Boolean(skill.wallCross);
      }
      spawnElementalTrailVfx(callbacks, getHeroElement(hid, caster.role), caster.x, caster.y, tx, ty, 4);
      callbacks.spawnVfx({
        kind: skill.physics === 'leap' ? 'crater' : 'slash',
        x: skill.physics === 'leap' ? tx : caster.x,
        y: skill.physics === 'leap' ? ty : caster.y,
        radius: Math.max(100, skill.radius),
        color: skill.color,
        ttl: 0.42,
        maxTtl: 0.42,
        angle: aimAngle
      });
      hitCircle(
        caster.x + Math.cos(aimAngle) * Math.min(200, clampedDist),
        caster.y + Math.sin(aimAngle) * Math.min(200, clampedDist),
        Math.max(115, skill.radius),
        dmg,
        skill.damageType,
        skill.ccType,
        skill.ccDuration
      );
      break;
    }
    case 'boomerang': {
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 840,
        vy: Math.sin(aimAngle) * 840,
        radius: Math.max(28, skill.radius * 0.4),
        rangeLeft: Math.max(420, skill.range),
        damage: dmg,
        damageType: skill.damageType,
        color: skill.color,
        kind: 'boomerang',
        pierce: true,
        returning: false,
        life: 1.8,
        maxLife: 1.8
      });
      break;
    }
    case 'projectile': {
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 960,
        vy: Math.sin(aimAngle) * 960,
        radius: Math.max(24, Math.min(48, skill.radius * 0.5)),
        rangeLeft: Math.max(440, skill.range),
        damage: dmg,
        damageType: skill.damageType,
        color: skill.color,
        kind: 'skill_line',
        ccType: skill.ccType,
        ccDuration: skill.ccDuration,
        life: 1.25,
        maxLife: 1.25
      });
      break;
    }
    case 'displacement': {
      callbacks.spawnVfx({ kind: 'ring', x: tx, y: ty, radius: Math.max(120, skill.radius), color: skill.color, ttl: 0.5, maxTtl: 0.5 });
      hitCircle(tx, ty, Math.max(120, skill.radius), dmg, skill.damageType, skill.ccType ?? 'knockback', skill.ccDuration ?? 0.9, (h) => {
        const pushDir = skill.ccType === 'pull' ? Math.atan2(caster.y - h.y, caster.x - h.x) : aimAngle;
        h.x = clamp(h.x + Math.cos(pushDir) * 125, 80, WORLD_SIZE - 80);
        h.y = clamp(h.y + Math.sin(pushDir) * 125, 80, WORLD_SIZE - 80);
      });
      break;
    }
    case 'iframe': {
      caster.untargetableTimer = Math.max(caster.untargetableTimer, 0.75);
      caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 0.9);
      callbacks.spawnVfx({ kind: 'burst', x: tx, y: ty, radius: Math.max(130, skill.radius), color: skill.color, ttl: 0.55, maxTtl: 0.55 });
      hitCircle(tx, ty, Math.max(130, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
      break;
    }
    case 'buff': {
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
      caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
      callbacks.grantShield(caster, Math.round(240 + caster.level * 35 + caster.magicPow * 0.45));
      if (caster.role === 'Marksman' || caster.role === 'Fighter') {
        caster.inspireTimer = Math.max(caster.inspireTimer, 4.0);
      }
      if (caster.role === 'Support') {
        for (const h of heroes) {
          if (h.alive && h.team === caster.team && dist(caster.x, caster.y, h.x, h.y) <= Math.max(320, skill.radius)) {
            callbacks.healHero(h, 280 + lvl * 75 + caster.magicPow * 0.65, caster);
          }
        }
      }
      spawnElementalTrailVfx(callbacks, getHeroElement(hid, caster.role), caster.x, caster.y, tx, ty, 3);
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: Math.max(110, skill.radius), color: skill.color, ttl: 0.55, maxTtl: 0.55 });
      if (dmg > 0) hitCircle(caster.x, caster.y, Math.max(120, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
      break;
    }
    case 'snapback': {
      if (isRecast && caster.snapbackAnchor) {
        const ax = caster.snapbackAnchor.x;
        const ay = caster.snapbackAnchor.y;
        caster.snapbackAnchor = null;
        caster.x = ax;
        caster.y = ay;
        callbacks.spawnVfx({ kind: 'burst', x: ax, y: ay, radius: 95, color: skill.color, ttl: 0.4, maxTtl: 0.4 });
      } else {
        caster.snapbackAnchor = { x: caster.x, y: caster.y, ttl: 4.0, slot };
        caster.recastSlot = slot;
        caster.recastTimer = 4.0;
        caster.x = clamp(tx, 80, WORLD_SIZE - 80);
        caster.y = clamp(ty, 80, WORLD_SIZE - 80);
        if (dmg > 0) hitCircle(caster.x, caster.y, Math.max(110, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
      }
      break;
    }
    case 'terrain': {
      callbacks.spawnTempWall?.({
        id: `wall_${hid}_${Math.round(ctx.matchTimeSec * 100)}`,
        x: tx - 70, y: ty - 28, w: 140, h: 56, color: skill.color, ttl: 4.5, maxTtl: 4.5, ownerId: caster.id
      });
      if (dmg > 0) hitCircle(tx, ty, Math.max(125, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
      break;
    }
    case 'tether':
    case 'attach': {
      if (caster.role === 'Support' && skill.telegraph === 'ally') {
        const ally = heroes
          .filter((h) => h.alive && h.team === caster.team && h.id !== caster.id)
          .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        if (ally) {
          callbacks.healHero(ally, 340 + lvl * 90 + caster.magicPow * 0.75, caster);
          callbacks.grantShield(ally, 320 + lvl * 80);
          caster.tetherTargetId = ally.id;
          caster.tetherTimer = 3.0;
          caster.tetherKind = 'heal';
          callbacks.spawnVfx({ kind: 'tether', x: caster.x, y: caster.y, tx: ally.x, ty: ally.y, radius: 6, color: skill.color, ttl: 0.7, maxTtl: 0.7 });
        }
      } else {
        const tgt = findNearestEnemyHero(caster, heroes, Math.max(360, skill.range));
        if (tgt) {
          caster.tetherTargetId = tgt.id;
          caster.tetherTimer = 2.2;
          caster.tetherKind = 'root';
          callbacks.dealDamageToHero(caster, tgt, dmg, skill.damageType, false, false, skill.name);
          callbacks.applyCc(tgt, skill.ccType ?? 'root', skill.ccDuration ?? 1.2, caster);
          callbacks.spawnVfx({ kind: 'tether', x: caster.x, y: caster.y, tx: tgt.x, ty: tgt.y, radius: 6, color: skill.color, ttl: 0.75, maxTtl: 0.75 });
        } else {
          hitCircle(tx, ty, Math.max(120, skill.radius), dmg, skill.damageType, skill.ccType, skill.ccDuration);
        }
      }
      break;
    }
    case 'channel': {
      const ex = caster.x + Math.cos(aimAngle) * Math.max(360, skill.range);
      const ey = caster.y + Math.sin(aimAngle) * Math.max(360, skill.range);
      callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: ex, ty: ey, radius: Math.max(60, skill.radius * 0.55), color: skill.color, ttl: 0.55, maxTtl: 0.55, angle: aimAngle });
      hitCircle(
        caster.x + Math.cos(aimAngle) * Math.min(280, skill.range * 0.5),
        caster.y + Math.sin(aimAngle) * Math.min(280, skill.range * 0.5),
        Math.max(160, skill.radius),
        dmg,
        skill.damageType,
        skill.ccType,
        skill.ccDuration
      );
      break;
    }
    case 'aoe':
    default: {
      const cx = skill.telegraph === 'ring' || skill.telegraph === 'self' ? caster.x : tx;
      const cy = skill.telegraph === 'ring' || skill.telegraph === 'self' ? caster.y : ty;
      const rad = Math.max(115, skill.radius);
      callbacks.spawnVfx({
        kind: slot === 3 ? 'burst' : 'crater',
        x: cx,
        y: cy,
        radius: rad,
        color: skill.color,
        ttl: slot === 3 ? 0.65 : 0.48,
        maxTtl: slot === 3 ? 0.65 : 0.48
      });
      hitCircle(cx, cy, rad, dmg, skill.damageType, skill.ccType, skill.ccDuration);
      break;
    }
  }

  return true;
}

/**
 * Executes any of the 12 Battle Spells.
 */
export function castBattleSpell(
  caster: SimHero,
  aimAngle: number,
  ctx: SkillCastContext
): boolean {
  if (!caster.alive || caster.spellCd > 0) return false;
  // Purify works during non-suppression CC; Flicker is blocked by Grounded/Root
  if (caster.spellId !== 'purify' && caster.ccType && getCcPriority(caster.ccType) >= 3) return false;
  if (caster.spellId === 'flicker' && caster.ccType && isDashBlockingCc(caster.ccType)) return false;
  if (caster.spellId === 'purify' && caster.ccType === 'suppression') return false;

  const { callbacks, heroes, jungleMobs, turrets, minions } = ctx;
  const cdMap: Record<MlbbSpellId, number> = {
    flicker: 120,
    retribution: 35,
    execute: 90,
    inspire: 75,
    sprint: 100,
    purify: 90,
    vengeance: 75,
    aegis: 75,
    revitalize: 75,
    petrify: 75,
    flameshot: 50,
    arrival: 75
  };
  const cdMult = getSpellOrActiveCdMultiplier(caster);
  caster.spellCd = ctx.noCooldown ? 1 : Math.round(cdMap[caster.spellId] * cdMult);
  if (caster.isPlayer) mlbbAudio.playSkill(2, 'true');

  const st = ensureEquipState(caster);

  switch (caster.spellId) {
    case 'flicker': {
      const nx = clamp(caster.x + Math.cos(aimAngle) * 320, 80, WORLD_SIZE - 80);
      const ny = clamp(caster.y + Math.sin(aimAngle) * 320, 80, WORLD_SIZE - 80);
      callbacks.spawnVfx({ kind: 'burst', x: caster.x, y: caster.y, radius: 70, color: '#FACC15', ttl: 0.35, maxTtl: 0.35 });
      caster.x = nx;
      caster.y = ny;
      st.flickerDefTimer = 1.5; // Brief Hybrid Defense surge after blinking
      callbacks.spawnVfx({ kind: 'burst', x: nx, y: ny, radius: 75, color: '#FACC15', ttl: 0.35, maxTtl: 0.35 });
      break;
    }
    case 'retribution': {
      const dmg = computeRetributionThreshold(caster.level, caster.junglerStacks >= 5);
      // Prioritize nearest jungle creep / Turtle / Lord
      let bestMob: SimJungleMob | null = null;
      let bestD = 430;
      for (const m of jungleMobs) {
        if (!m.alive) continue;
        const d = dist(caster.x, caster.y, m.x, m.y);
        if (d < bestD) {
          bestD = d;
          bestMob = m;
        }
      }
      if (bestMob) {
        callbacks.dealDamageToJungle(caster, bestMob, dmg, 'true');
        callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: bestMob.x, ty: bestMob.y, radius: 22, color: '#EF4444', ttl: 0.35, maxTtl: 0.35 });
      } else if (caster.junglerStacks >= 5 || caster.blessingId?.includes('retribution')) {
        const tgt = findNearestEnemyHero(caster, heroes, 440);
        if (tgt) {
          const tst = ensureEquipState(tgt);
          const heroRetriDmg = 100 + caster.level * 12;
          callbacks.dealDamageToHero(caster, tgt, heroRetriDmg, 'true', false, false, 'Retribution');
          if (caster.blessingId === 'flame_retribution') {
            const stealAtk = Math.round(58 + ((caster.level - 1) / 14) * 42);
            st.flameRetriBonusAtk = stealAtk;
            st.flameRetriTimer = 4.0;
            tst.flameRetriDebuffAtk = stealAtk;
            tst.flameRetriDebuffTimer = 4.0;
            callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: tgt.x, ty: tgt.y, radius: 18, color: '#F97316', ttl: 0.4, maxTtl: 0.4 });
          } else if (caster.blessingId === 'bloody_retribution') {
            tst.bloodyDrainTimer = 4.0;
            tst.bloodyDrainSourceId = caster.id;
            tst.bloodyDrainTickAccum = 0.5;
            callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: tgt.x, ty: tgt.y, radius: 18, color: '#DC2626', ttl: 0.4, maxTtl: 0.4 });
          } else {
            // Ice Retribution (default evolved): steals Movement Speed for 4s
            callbacks.applyCc(tgt, 'slow', 4.0, caster);
            tgt.slowPct = Math.max(tgt.slowPct, 0.35);
            caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.35);
            caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 4.0);
            callbacks.spawnVfx({ kind: 'beam', x: caster.x, y: caster.y, tx: tgt.x, ty: tgt.y, radius: 18, color: '#38BDF8', ttl: 0.4, maxTtl: 0.4 });
          }
        }
      }
      break;
    }
    case 'execute': {
      const tgt = findNearestEnemyHero(caster, heroes, 360);
      if (tgt) {
        const missingHp = tgt.maxHp - tgt.hp;
        const raw = 200 + caster.level * 24 + missingHp * 0.13;
        const wasAlive = tgt.alive;
        callbacks.dealDamageToHero(caster, tgt, raw, 'true', false, false, 'Execute', true);
        callbacks.spawnVfx({ kind: 'burst', x: tgt.x, y: tgt.y, radius: 90, color: '#F97316', ttl: 0.4, maxTtl: 0.4 });
        if (wasAlive && !tgt.alive) caster.spellCd = Math.round(caster.spellCd * 0.6);
      }
      break;
    }
    case 'inspire':
      caster.inspireTimer = 5.0;
      st.inspireAttacksLeft = 8;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 85, color: '#FB7185', ttl: 0.5, maxTtl: 0.5 });
      break;
    case 'sprint':
      caster.slowTimer = 0;
      caster.slowPct = 0;
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.5);
      caster.speedBoostTimer = 6.0;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 85, color: '#38BDF8', ttl: 0.45, maxTtl: 0.45 });
      break;
    case 'purify':
      caster.ccType = null;
      caster.ccTimer = 0;
      caster.ccPriority = 0;
      caster.slowTimer = 0;
      caster.slowPct = 0;
      caster.ccImmuneTimer = Math.max(caster.ccImmuneTimer, 1.2);
      caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.15);
      caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 1.2);
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 95, color: '#FDE047', ttl: 0.55, maxTtl: 0.55 });
      break;
    case 'vengeance':
      caster.vengeanceTimer = 3.0;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 95, color: '#A855F7', ttl: 0.6, maxTtl: 0.6 });
      break;
    case 'aegis': {
      const selfShield = 750 + caster.level * 90;
      callbacks.grantShield(caster, selfShield);
      // Automatically grants 50% shield to lowest-HP nearby ally
      const lowestAlly = heroes
        .filter((a) => a.alive && a.team === caster.team && a.id !== caster.id && dist(caster.x, caster.y, a.x, a.y) <= 440)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (lowestAlly) {
        callbacks.grantShield(lowestAlly, Math.round(selfShield * 0.5));
        callbacks.spawnVfx({ kind: 'ring', x: lowestAlly.x, y: lowestAlly.y, radius: 85, color: '#60A5FA', ttl: 0.5, maxTtl: 0.5 });
      }
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 95, color: '#60A5FA', ttl: 0.55, maxTtl: 0.55 });
      break;
    }
    case 'revitalize':
      st.revitalizeZoneTimer = 4.0;
      st.revitalizeZoneX = caster.x;
      st.revitalizeZoneY = caster.y;
      st.revitalizeTickAccum = 0;
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 220, color: '#2CE58B', ttl: 0.85, maxTtl: 0.85 });
      for (const h of heroes) {
        if (h.alive && h.team === caster.team && dist(caster.x, caster.y, h.x, h.y) <= 220) {
          ensureEquipState(h).revitalizeAmpTimer = 1.0;
          callbacks.healHero(h, h.maxHp * 0.05, caster);
        }
      }
      break;
    case 'petrify':
      callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 230, color: '#CBD5E1', ttl: 0.5, maxTtl: 0.5 });
      for (const h of heroes) {
        if (h.alive && h.team !== caster.team && dist(caster.x, caster.y, h.x, h.y) <= 230) {
          callbacks.dealDamageToHero(caster, h, 100 + caster.level * 15, 'magic', false, false, 'Petrify');
          callbacks.applyCc(h, 'petrify', 0.8, caster);
          h.slowPct = Math.max(h.slowPct, 0.5);
          h.slowTimer = Math.max(h.slowTimer, 1.6);
        }
      }
      break;
    case 'flameshot':
      // Immediate close-range knockback wave before launching long-range scaling fireball
      for (const h of heroes) {
        if (h.alive && h.team !== caster.team && dist(caster.x, caster.y, h.x, h.y) <= 165) {
          const pushAng = Math.atan2(h.y - caster.y, h.x - caster.x);
          h.x = clamp(h.x + Math.cos(pushAng) * 150, 80, WORLD_SIZE - 80);
          h.y = clamp(h.y + Math.sin(pushAng) * 150, 80, WORLD_SIZE - 80);
          callbacks.applyCc(h, 'knockback', 0.45, caster);
        }
      }
      callbacks.spawnProjectile({
        ownerId: caster.id,
        team: caster.team,
        x: caster.x,
        y: caster.y,
        vx: Math.cos(aimAngle) * 1120,
        vy: Math.sin(aimAngle) * 1120,
        radius: 32,
        rangeLeft: 1600,
        damage: 200 + caster.magicPow * 0.5,
        damageType: 'magic',
        color: '#FB923C',
        kind: 'flameshot',
        life: 1.5,
        maxLife: 1.5
      });
      break;
    case 'arrival': {
      // Teleport to furthest alive allied turret or frontline allied minion
      const allyTurrets = turrets
        .filter((t) => t.alive && t.team === caster.team && t.tier <= 3)
        .sort((a, b) => dist(caster.x, caster.y, b.x, b.y) - dist(caster.x, caster.y, a.x, a.y));
      const allyMinions = minions
        .filter((m) => m.alive && m.team === caster.team)
        .sort((a, b) => dist(caster.x, caster.y, b.x, b.y) - dist(caster.x, caster.y, a.x, a.y));
      const dest = allyMinions[0] ?? allyTurrets[0];
      if (dest) {
        callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 95, color: '#22D3EE', ttl: 0.5, maxTtl: 0.5 });
        caster.x = clamp(dest.x, 80, WORLD_SIZE - 80);
        caster.y = clamp(dest.y + (caster.team === 'blue' ? 55 : -55), 80, WORLD_SIZE - 80);
        caster.speedBoostPct = Math.max(caster.speedBoostPct, 0.6);
        caster.speedBoostTimer = Math.max(caster.speedBoostTimer, 3.0);
        callbacks.spawnVfx({ kind: 'ring', x: caster.x, y: caster.y, radius: 115, color: '#22D3EE', ttl: 0.65, maxTtl: 0.65 });
      }
      break;
    }
  }
  return true;
}

/**
 * Computes raw -> mitigated hit using exact CombatMath curves.
 */
export function computeMitigatedHeroDamage(
  attacker: SimHero | null,
  target: SimHero,
  rawDmg: number,
  dmgType: MlbbDamageType,
  extraPctPen = 0,
  ignoreFlatDef = 0
): number {
  if (dmgType === 'physical' && target.physImmuneTimer > 0) return 0;
  if (target.winterCrownTimer > 0) return 0;

  let baseDef = dmgType === 'physical' ? target.physDef : target.magicDef;
  if (target.defShredTimer > 0) baseDef -= target.defShredFlat;
  if (ignoreFlatDef > 0) baseDef -= ignoreFlatDef;

  const flatPen = attacker ? (dmgType === 'physical' ? attacker.flatPhysPen : attacker.flatMagicPen) : 0;
  const pctPen = attacker
    ? Math.min(0.6, (dmgType === 'physical' ? attacker.pctPhysPen : attacker.pctMagicPen) + extraPctPen)
    : 0;
  const effDef = computeEffectiveDefense(baseDef, flatPen, pctPen);
  let dmg = computeFinalDamage(rawDmg, effDef, dmgType);
  if (target.vengeanceTimer > 0) {
    dmg = Math.round(dmg * 0.65);
  }
  return dmg;
}
