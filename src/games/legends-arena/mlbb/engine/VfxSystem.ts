import { MlbbCcType, MlbbDamageType, MlbbElementKind, MlbbRole } from '../types';
import type { SimCallbacks, SimHero } from './SkillPhysics';

/**
 * Part 4 — 5-Layer VFX Engine (`VfxSystem.ts`):
 * 1. Ground Aim Indicators & Team-Coded Warning Decals (Blue/Cyan allies, Red enemies)
 * 2. Hero Silhouette Shaders (Gold CC-Immune, White/Cyan Shielded, Translucent Camo/Untargetable,
 *    Red Hit Flash, Dynamic Model Scaling for Barats/Lukas/Yu Zhong, Parabolic Leap Z-arc)
 * 3. 9 Elemental Particle Trails (Fire, Ice, Lightning, Shadow, Holy, Water, Wind, Blood, Astral)
 * 4. Overhead Stack Rings & CC Status Badges (`STUNNED`, `SUPPRESSED`, `SILENCED`, `TAUNTED`, `FROZEN`, `GROUNDED`)
 * 5. Floating Damage / Crit / Heal / Shield Numbers
 */

export interface ElementalPalette {
  id: MlbbElementKind;
  primary: string;
  secondary: string;
  glow: string;
  label: string;
}

export const ELEMENT_PALETTES: Record<MlbbElementKind, ElementalPalette> = {
  fire: { id: 'fire', primary: '#F97316', secondary: '#FACC15', glow: '#EF4444', label: 'Fire' },
  ice: { id: 'ice', primary: '#38BDF8', secondary: '#E0F2FE', glow: '#7DD3FC', label: 'Ice' },
  lightning: { id: 'lightning', primary: '#FACC15', secondary: '#38BDF8', glow: '#FEF08A', label: 'Lightning' },
  shadow: { id: 'shadow', primary: '#7E22CE', secondary: '#C084FC', glow: '#3B0764', label: 'Shadow' },
  holy: { id: 'holy', primary: '#FDE047', secondary: '#FFFFFF', glow: '#F59E0B', label: 'Holy' },
  water: { id: 'water', primary: '#06B6D4', secondary: '#67E8F9', glow: '#0EA5E9', label: 'Water' },
  wind: { id: 'wind', primary: '#34D399', secondary: '#A7F3D0', glow: '#10B981', label: 'Wind' },
  blood: { id: 'blood', primary: '#E11D48', secondary: '#FB7185', glow: '#9F1239', label: 'Blood' },
  astral: { id: 'astral', primary: '#A855F7', secondary: '#38BDF8', glow: '#E879F9', label: 'Astral' }
};

/**
 * Explicit elemental VFX mapping for all 66 A-K heroes (+ signature L-Z heroes).
 */
export const HERO_ELEMENT_MAP: Record<string, MlbbElementKind> = {
  aamon: 'shadow',
  akai: 'wind',
  aldous: 'shadow',
  alice: 'blood',
  alpha: 'lightning',
  alucard: 'holy',
  angela: 'holy',
  argus: 'shadow',
  arlott: 'blood',
  atlas: 'ice',
  aulus: 'fire',
  aurora: 'ice',
  badang: 'wind',
  balmond: 'blood',
  bane: 'water',
  barats: 'fire',
  baxia: 'fire',
  beatrix: 'fire',
  belerick: 'wind',
  benedetta: 'shadow',
  brody: 'shadow',
  bruno: 'lightning',
  carmilla: 'blood',
  cecilion: 'blood',
  chang_e: 'astral',
  chip: 'lightning',
  chou: 'wind',
  cici: 'fire',
  claude: 'lightning',
  clint: 'fire',
  cyclops: 'astral',
  diggie: 'holy',
  dyrroth: 'blood',
  edith: 'lightning',
  esmeralda: 'astral',
  estes: 'holy',
  eudora: 'lightning',
  fanny: 'wind',
  faramis: 'shadow',
  floryn: 'holy',
  franco: 'ice',
  fredrinn: 'astral',
  freya: 'holy',
  gatotkaca: 'fire',
  gloo: 'shadow',
  gord: 'astral',
  granger: 'blood',
  grock: 'wind',
  guinevere: 'astral',
  gusion: 'shadow',
  hanabi: 'blood',
  hanzo: 'shadow',
  harith: 'astral',
  harley: 'fire',
  hayabusa: 'shadow',
  helcurt: 'shadow',
  hilda: 'wind',
  hirara: 'astral',
  hylos: 'holy',
  irithel: 'wind',
  ixia: 'lightning',
  jawhead: 'fire',
  johnson: 'lightning',
  joy: 'lightning',
  julian: 'blood',
  kadita: 'water',
  // Part 5: All 67 K-Z Heroes (#67 Kagura - #133 Zilong)
  kagura: 'water',
  kaja: 'lightning',
  kalea: 'water',
  karina: 'shadow',
  karrie: 'holy',
  khaleed: 'wind',
  khufra: 'shadow',
  kimmy: 'lightning',
  lancelot: 'holy',
  lapu_lapu: 'fire',
  layla: 'lightning',
  leomord: 'shadow',
  lesley: 'fire',
  ling: 'wind',
  lolita: 'holy',
  lukas: 'holy',
  lunox: 'astral',
  luo_yi: 'astral',
  lylia: 'shadow',
  marcel: 'holy',
  martis: 'blood',
  masha: 'fire',
  mathilda: 'wind',
  melissa: 'shadow',
  minotaur: 'fire',
  minsitthar: 'holy',
  miya: 'astral',
  moskov: 'shadow',
  nana: 'astral',
  natalia: 'shadow',
  natan: 'astral',
  nolan: 'astral',
  novaria: 'astral',
  obsidia: 'shadow',
  odette: 'water',
  paquito: 'fire',
  pharsa: 'shadow',
  phoveus: 'shadow',
  popol_and_kupa: 'ice',
  rafaela: 'holy',
  roger: 'blood',
  ruby: 'blood',
  saber: 'lightning',
  selena: 'shadow',
  silvanna: 'holy',
  sora: 'wind',
  sun: 'fire',
  suyou: 'shadow',
  terizla: 'blood',
  thamuz: 'fire',
  tigreal: 'holy',
  uranus: 'holy',
  vale: 'wind',
  valentina: 'shadow',
  valir: 'fire',
  vexana: 'shadow',
  wanwan: 'wind',
  x_borg: 'fire',
  xavier: 'astral',
  yi_sun_shin: 'water',
  yin: 'fire',
  yu_zhong: 'blood',
  yve: 'astral',
  zetian: 'fire',
  zhask: 'shadow',
  zhuxin: 'fire',
  zilong: 'wind'
};

export function getHeroElement(heroId: string, role?: MlbbRole): MlbbElementKind {
  const mapped = HERO_ELEMENT_MAP[heroId];
  if (mapped) return mapped;
  switch (role) {
    case 'Mage':
      return 'astral';
    case 'Assassin':
      return 'shadow';
    case 'Support':
      return 'holy';
    case 'Tank':
      return 'ice';
    case 'Marksman':
      return 'lightning';
    default:
      return 'fire';
  }
}

/**
 * Layer 3: Spawns an elemental particle trail from origin to target using the hero's 9-element palette.
 */
export function spawnElementalTrailVfx(
  callbacks: SimCallbacks,
  element: MlbbElementKind,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  count = 4
): void {
  const pal = ELEMENT_PALETTES[element];
  const steps = Math.max(2, Math.min(7, count));
  for (let i = 0; i < steps; i++) {
    const t = i / Math.max(1, steps - 1);
    const px = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 26;
    const py = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 26;
    callbacks.spawnVfx({
      kind: 'elemental',
      x: px,
      y: py,
      radius: 16 + (i % 2) * 8,
      color: i % 2 === 0 ? pal.primary : pal.secondary,
      ttl: 0.36 + i * 0.04,
      maxTtl: 0.48,
      angle: Math.atan2(toY - fromY, toX - fromX),
      element
    });
  }
}

/**
 * Layer 2: Unified Hero Silhouette Shader & Dynamic Scaling Resolver for both 3D Three.js & 2D Renderers.
 */
export interface HeroSilhouetteShaderState {
  goldCcImmune: boolean;
  cyanShielded: boolean;
  translucent: boolean;
  opacity: number;
  redHitFlash: boolean;
  frostFrozen: boolean;
  deathImmune: boolean;
  eggForm: boolean;
  carForm: boolean;
  modelScale: number;
  leapZ: number;
  element: MlbbElementKind;
}

export function resolveHeroSilhouetteState(h: SimHero): HeroSilhouetteShaderState {
  const eggForm = (h.eggFormTimer ?? 0) > 0;
  const deathImmune = (h.deathImmuneTimer ?? 0) > 0;
  const carForm = (h.carDriveTimer ?? 0) > 0;
  const translucent =
    h.stealthTimer > 0 ||
    (h.inBush && h.team === 'blue') ||
    h.untargetableTimer > 0 ||
    (h.wallPhaseTimer ?? 0) > 0 ||
    eggForm;
  const opacity = h.untargetableTimer > 0 || eggForm ? 0.48 : translucent ? 0.56 : 1.0;

  return {
    goldCcImmune: h.ccImmuneTimer > 0 || h.physImmuneTimer > 0 || deathImmune,
    cyanShielded: h.shield > 0,
    translucent,
    opacity,
    redHitFlash: h.hitFlashTimer > 0,
    frostFrozen: h.winterCrownTimer > 0 || h.ccType === 'freeze' || h.ccType === 'petrify',
    deathImmune,
    eggForm,
    carForm,
    modelScale: Math.max(0.75, Math.min(1.5, h.modelScale || 1.0)),
    leapZ: Math.max(0, h.leapZ || 0),
    element: getHeroElement(h.heroDef.id, h.role)
  };
}

/**
 * Layer 4: Overhead CC Status Badge Formatter.
 */
export interface HeroCcBadge {
  text: string;
  color: string;
  bg: string;
}

const CC_LABEL_MAP: Record<MlbbCcType, { text: string; color: string }> = {
  slow: { text: 'SLOWED', color: '#93C5FD' },
  grounded: { text: 'GROUNDED', color: '#F59E0B' },
  root: { text: 'ROOTED', color: '#34D399' },
  silence: { text: 'SILENCED', color: '#C084FC' },
  disarm: { text: 'DISARMED', color: '#FB923C' },
  taunt: { text: 'TAUNTED', color: '#F43F5E' },
  stun: { text: 'STUNNED', color: '#FACC15' },
  freeze: { text: 'FROZEN', color: '#38BDF8' },
  petrify: { text: 'PETRIFIED', color: '#CBD5E1' },
  transform: { text: 'MORPHED', color: '#F472B6' },
  airborne: { text: 'AIRBORNE', color: '#67E8F9' },
  knockback: { text: 'KNOCKED', color: '#FDBA74' },
  pull: { text: 'PULLED', color: '#F97316' },
  vortex: { text: 'VORTEX', color: '#A855F7' },
  suppression: { text: 'SUPPRESSED', color: '#EF4444' }
};

export function getHeroCcBadge(h: SimHero): HeroCcBadge | null {
  if ((h.eggFormTimer ?? 0) > 0) {
    return { text: 'EGG FORM', color: '#FDE047', bg: 'rgba(15,23,42,0.88)' };
  }
  if ((h.deathImmuneTimer ?? 0) > 0) {
    return { text: 'IMMORTAL', color: '#4ADE80', bg: 'rgba(6,78,59,0.9)' };
  }
  if ((h.carDriveTimer ?? 0) > 0) {
    return { text: 'TURBO CAR', color: '#38BDF8', bg: 'rgba(12,74,110,0.9)' };
  }
  if ((h.yuZhongDragonTimer ?? 0) > 0) {
    return { text: 'BLACK DRAGON', color: '#F43F5E', bg: 'rgba(76,5,25,0.92)' };
  }
  if ((h.yinDomainTimer ?? 0) > 0) {
    return { text: '1V1 DOMAIN', color: '#F97316', bg: 'rgba(67,20,7,0.92)' };
  }
  if ((h.lingWallTimer ?? 0) > 0) {
    return { text: 'WALL PERCH', color: '#67E8F9', bg: 'rgba(8,51,68,0.9)' };
  }
  if ((h.wanwanFlyTimer ?? 0) > 0) {
    return { text: 'TANG BARRAGE', color: '#FDE047', bg: 'rgba(66,32,6,0.9)' };
  }
  if ((h.yveGridTimer ?? 0) > 0) {
    return { text: '7×7 REALM', color: '#E879F9', bg: 'rgba(59,7,100,0.92)' };
  }
  if (!h.ccType) return null;
  const info = CC_LABEL_MAP[h.ccType];
  return {
    text: info.text,
    color: info.color,
    bg: h.ccType === 'suppression' ? 'rgba(127,29,29,0.94)' : 'rgba(15,23,42,0.88)'
  };
}

/**
 * Layer 4: Overhead Stack Ring / Counter Metadata for Stack-Driven Heroes.
 */
export interface HeroStackBadge {
  count: number;
  max: number;
  label: string;
  color: string;
}

const BEATRIX_GUN_LABELS = ['RENNER', 'BENNETT', 'WESKER', 'NIBIRU'];

export function getHeroStackBadge(h: SimHero): HeroStackBadge | null {
  const hid = h.heroDef.id;
  if (hid === 'beatrix') {
    const idx = h.beatrixGunIdx ?? 0;
    return { count: idx + 1, max: 4, label: BEATRIX_GUN_LABELS[idx] ?? 'GUN', color: '#F59E0B' };
  }
  if (hid === 'julian') {
    const c = h.julianCastCount ?? 0;
    return { count: c, max: 2, label: c >= 2 ? 'ENHANCED' : `CAST ${c}/2`, color: c >= 2 ? '#EF4444' : '#C084FC' };
  }
  if (hid === 'hirara' && (h.hiraraPrisms?.length ?? 0) > 0) {
    return { count: h.hiraraPrisms!.length, max: 3, label: `PRISM ×${h.hiraraPrisms!.length}`, color: '#38BDF8' };
  }
  if (hid === 'barats' && h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 10, label: `BIG GUY ${h.passiveStacks}`, color: '#F97316' };
  }
  if (hid === 'aldous' && h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 500, label: `SOUL ${h.passiveStacks}`, color: '#FACC15' };
  }
  if (hid === 'cecilion' && h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 999, label: `BAT ${h.passiveStacks}`, color: '#E11D48' };
  }
  if (hid === 'masha') {
    const bars = h.mashaBars ?? 3;
    return { count: bars, max: 3, label: `HP BARS ${bars}/3`, color: '#FB923C' };
  }
  if (hid === 'paquito' && h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 3, label: h.passiveStacks >= 3 ? 'CHAMP READY' : `CHAMPS ${h.passiveStacks}/3`, color: '#EF4444' };
  }
  if (hid === 'luo_yi') {
    const isYang = h.passiveStacks % 2 === 0;
    return { count: 1, max: 2, label: isYang ? 'YANG ☀' : 'YIN ☾', color: isYang ? '#FACC15' : '#A855F7' };
  }
  if (hid === 'uranus' && h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 20, label: `RADIANCE ${h.passiveStacks}`, color: '#FDE047' };
  }
  if (h.altFormActive && (hid === 'roger' || hid === 'selena' || hid === 'lapu_lapu' || hid === 'leomord' || hid === 'lukas' || hid === 'sora' || hid === 'suyou' || hid === 'zhask')) {
    const labelMap: Record<string, string> = {
      roger: 'WOLF FORM',
      selena: 'ABYSSAL',
      lapu_lapu: 'HEAVY SWORD',
      leomord: 'BARBIEL',
      lukas: 'SACRED BEAST',
      sora: 'STORM FORM',
      suyou: 'IMMORTAL',
      zhask: 'DOMINATOR'
    };
    return { count: 1, max: 1, label: labelMap[hid] ?? 'ENHANCED', color: '#F5C451' };
  }
  if (h.passiveStacks > 0) {
    return { count: h.passiveStacks, max: 5, label: `×${h.passiveStacks}`, color: h.skinAccent || '#FACC15' };
  }
  return null;
}

/**
 * Layer 5: Floating Combat Number Color & Font Sizing.
 */
export function getDamageNumberStyle(
  dmgType: MlbbDamageType,
  isCrit: boolean,
  kind: 'damage' | 'heal' | 'shield' = 'damage'
): { color: string; fontSize: number } {
  if (kind === 'heal') return { color: '#2CE58B', fontSize: 15 };
  if (kind === 'shield') return { color: '#38BDF8', fontSize: 14 };
  if (dmgType === 'true') return { color: '#F8FAFC', fontSize: isCrit ? 20 : 16 };
  if (isCrit) return { color: '#FACC15', fontSize: 21 };
  if (dmgType === 'magic') return { color: '#C084FC', fontSize: 15 };
  return { color: '#FB923C', fontSize: 15 };
}
