import { ArcadeAudio } from './audio';
import { persistCoinsAndUnlocks, persistHighScores, persistXpAndLevel, playerState } from './storage';

import { MobaRole, MobaSkillTargeting } from '../games/legends-arena/mobaHeroCatalog';

export interface MobaSkillButtonHud {
  label: string;
  icon: string;
  cd: number;
  maxCd: number;
  visible: boolean;
  activeBuff?: boolean;
  elementColor?: string;
  targeting?: MobaSkillTargeting;
}

export interface MobaEquippedEmoteHud {
  slot: 0 | 1 | 2 | 3;
  id: string;
  name: string;
  callout: string;
  icon: string;
  colorHex: string;
}

export interface MobaHudEnemyTarget {
  id: number;
  name: string;
  icon: string;
  hpPct: number;
  alive: boolean;
  dist: number;
}

export interface MobaActiveBuffHud {
  id: string;
  label: string;
  icon: string;
  remainingSec: number;
  maxSec: number;
  color: string;
}

export interface MobaMinimapCampHud {
  id: string;
  kind: 'purple' | 'orange' | 'small' | 'litho' | 'crab' | 'turtle' | 'lord';
  nx: number; // 0..1
  nz: number; // 0..1
  alive: boolean;
  respawnSec: number;
  label: string;
  icon: string;
}

export interface MobaMinimapPingHud {
  id: number;
  kind: 'turtle' | 'lord' | 'gather' | 'retreat' | 'lane';
  nx: number;
  nz: number;
  label: string;
  ttl: number;
}

export interface MobaHudSnapshot {
  heroName: string;
  heroRole: MobaRole;
  attackLabel: string;
  hasSkill4: boolean;
  hasActiveItem: boolean;
  passiveLabel: string;
  passiveStacks: number;
  maxStacks: number;
  buffsText: string;
  gold: number;
  equippedItemIds: string[];
  customBuildIds?: string[];
  activePresetIdx?: number;
  presetNames?: string[];
  prioritizedItemId?: string | null;
  blessingId: string | null;
  blueBuffSec: number;
  redBuffSec: number;
  matchElapsedSec?: number;
  mapVariantId?: 'revealing_wisps' | 'healing_turtle' | 'golden_turret' | 'flying_cloud';
  mapVariantName?: string;
  mapVariantIcon?: string;
  mapVariantSummary?: string;
  expLaneSide?: 'top' | 'bottom';
  goldLaneSide?: 'top' | 'bottom';
  outerShieldActive?: boolean;
  isJungler?: boolean;
  junglerStacks?: number; // 0..5
  hasRoamBlessing?: boolean;
  roamGold?: number; // 0..600
  flyingCloudReady?: boolean;
  nearFlyingCloud?: boolean;
  activeBuffs?: MobaActiveBuffHud[];
  objectiveBanner?: {
    kind: 'turtle' | 'lord';
    stage: 0 | 1 | 2 | 3;
    label: string;
    alive: boolean;
    countdownSec: number;
    pit: 'upper' | 'lower';
  };
  minimapData?: {
    playerNx: number;
    playerNz: number;
    camps: MobaMinimapCampHud[];
    cycloneEyes: Array<{ id: string; nx: number; nz: number; ready: boolean; cdSec: number }>;
    turrets: Array<{ nx: number; nz: number; team: 'blue' | 'red'; isNexus: boolean; shield: boolean }>;
    heroes: Array<{ nx: number; nz: number; team: 'blue' | 'red'; isLord: boolean }>;
    pings: MobaMinimapPingHud[];
  };
  tacticalPingText?: string;
  lockedEnemyId?: number | null;
  enemyHeroes?: MobaHudEnemyTarget[];
  effectiveSpeed?: number;
  isSprinting?: boolean;
  inBushStealth?: boolean;
  ccImmuneSec?: number;
  activeCcText?: string;
  recallProgress?: number; // 0..1 while channeling
  iconicUltLabel?: string;
  combatStats: {
    atk: number;
    maxHp: number;
    physDef: number;
    magicDef: number;
    cdrPct: number;
    moveSpd: number;
  };
  skill1: MobaSkillButtonHud;
  skill2: MobaSkillButtonHud;
  skill3: MobaSkillButtonHud;
  skill4: MobaSkillButtonHud;
  spell: MobaSkillButtonHud;
  regen: MobaSkillButtonHud;
  recall: MobaSkillButtonHud;
  itemActive: MobaSkillButtonHud;
  equippedEmotes?: MobaEquippedEmoteHud[];
  emoteCd?: number;
  emoteMaxCd?: number;
}

export interface NarutoHudSnapshot {
  engine: 'senki_2d' | 'storm_3d';
  modeName: string;
  heroName: string;
  heroIcon: string;
  traitName: string;
  level: number; // 1..6 in Senki
  xpPct: number;
  gold: number;
  awakenedSec: number;
  superArmor: boolean;
  iFrames: boolean;
  // Senki Ramen Shop Cooldowns
  ramenCd: number;
  pillCd: number;
  pillBuffSec: number;
  speedTagCd: number;
  speedTagBuffSec: number;
  // Storm 3D Mechanics
  teamHp: number;
  teamMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  subLogs: number; // 0..4
  subRechargeSec: number; // 0..14.0
  chakra: number; // 0..100
  maxUsableChakra: number; // 100 or 65 during counter penalty
  counterPenaltySec: number;
  guardHp: number; // 0..100
  guardBrokenSec: number;
  stormGauge: number; // 0..100
  comboHits: number;
  prorationPct: number;
  fatigueSec: number;
  toolCharges: [number, number, number, number]; // [ATK Pill, DEF Pill, Paper Bomb, Speed Tag]
  support1Name: string;
  support1Icon: string;
  support1Cd: number;
  support2Name: string;
  support2Icon: string;
  support2Cd: number;
  // On-screen button HUD states
  actionLabel: string;
  jumpSkill1: MobaSkillButtonHud;
  skill2: MobaSkillButtonHud;
  skill3: MobaSkillButtonHud;
  skill4: MobaSkillButtonHud;
  skill5: MobaSkillButtonHud;
  subBtn: MobaSkillButtonHud;
  supportBtn: MobaSkillButtonHud;
  chakraBtn: MobaSkillButtonHud;
  guardBtn: MobaSkillButtonHud;
}

export interface HoopsPostGameSummary {
  won: boolean;
  homeTeamName: string;
  homeAbbr: string;
  awayTeamName: string;
  awayAbbr: string;
  homeScore: number;
  awayScore: number;
  courtLabel: string;
  potgName: string;
  potgLine: string;
  playerName: string;
  teammateGrade: string;
  stats: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    fgm: number;
    fga: number;
    tpm: number;
    tpa: number;
    greens: number;
  };
  rewards: {
    baseVc: number;
    gradeVc: number;
    statVc: number;
    crewBonusVc: number;
    totalVc: number;
    mtpEarned: number;
    myPointsEarned: number;
    badgeXpEarned: number;
    repXpEarned: number;
    crewXpEarned: number;
    plateDelta: number;
    seasonXpEarned: number;
    hotZoneUpgraded: boolean;
  };
  repLabel: string;
  plateLabel: string;
  plateColorHex: string;
  crewLevel: number;
  seasonLevel: number;
}

export interface HoopsHudSnapshot {
  courtLabel: string;
  isOutdoorPark: boolean;
  homeName: string;
  homeAbbr: string;
  homeAccent: string;
  homeScore: number;
  awayName: string;
  awayAbbr: string;
  awayAccent: string;
  awayScore: number;
  quarter: number;
  quarterClock: number;
  targetScore: number | null;
  shotClock: number;
  homeFouls: number;
  awayFouls: number;
  homeTimeouts: number;
  awayTimeouts: number;
  teammateGrade: string;
  teammateGradeScore: number;
  gradeFlash: string;
  playerName: string;
  playerPos: string;
  stats: {
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    greens: number;
  };
  takeoverMeter: number; // 0..500
  takeoverLevel: number; // 0..5
  takeoverActive: boolean;
  takeoverName: string;
  adrenalineBars: number; // 0..3
  stamina: number; // 0..1
  shotMeterOffBoost: boolean;
  shotFeedback: {
    timing: string;
    coverage: string;
    isGreen: boolean;
    ttl: number;
  } | null;
  iconPassingActive: boolean;
  iconPassTargets: Array<{ index: number; keyLabel: string; name: string; role: string }>;
  activePlayName: string;
  coachScheme: string;
  cameraAngle: '2k' | 'broadcast';
  postGameSummary: HoopsPostGameSummary | null;
}

export interface HudBridgeHandlers {
  onCoinsChange: () => void;
  onXpChange: () => void;
  onHudUpdate: (score: number, lvl: number, gameIdx: number) => void;
  onHealthUpdate: (cur: number, max: number) => void;
  onGameOver: (score: number, coinsEarned: number, reachedLevel: number, gameIdx: number, isVictory: boolean) => void;
  onActionLabelChange: (label: string) => void;
  onMobaHudUpdate?: (snap: MobaHudSnapshot | null) => void;
  onNarutoHudUpdate?: (snap: NarutoHudSnapshot | null) => void;
  onHoopsHudUpdate?: (snap: HoopsHudSnapshot | null) => void;
}

const defaultHandlers: HudBridgeHandlers = {
  onCoinsChange: () => {},
  onXpChange: () => {},
  onHudUpdate: () => {},
  onHealthUpdate: () => {},
  onGameOver: () => {},
  onActionLabelChange: () => {},
  onMobaHudUpdate: () => {},
  onNarutoHudUpdate: () => {},
  onHoopsHudUpdate: () => {}
};

let handlers: HudBridgeHandlers = { ...defaultHandlers };

export function registerHudBridge(next: HudBridgeHandlers): void {
  handlers = next;
}

export function addCoins(amount: number): void {
  playerState.totalCoins += amount;
  playerState.sessionCoins += amount;
  persistCoinsAndUnlocks();
  handlers.onCoinsChange();
}

export function awardBonusCoins(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) return;
  playerState.totalCoins += Math.round(amount);
  persistCoinsAndUnlocks();
  handlers.onCoinsChange();
}

export function spendCoins(amount: number): boolean {
  if (playerState.totalCoins < amount) return false;
  playerState.totalCoins -= amount;
  persistCoinsAndUnlocks();
  handlers.onCoinsChange();
  return true;
}

export function addXp(amount: number): void {
  playerState.playerXp += amount;
  while (playerState.playerXp >= playerState.playerLevel * 100) {
    playerState.playerXp -= playerState.playerLevel * 100;
    playerState.playerLevel++;
  }
  persistXpAndLevel();
  handlers.onXpChange();
}

export function updateCoinsDisplay(): void {
  persistCoinsAndUnlocks();
  handlers.onCoinsChange();
}

export function updateInGameHud(score: number, lvl: number, gameIdx: number): void {
  if (score > (playerState.highScores[gameIdx] || 0)) {
    playerState.highScores[gameIdx] = score;
    persistHighScores();
  }
  handlers.onHudUpdate(score, lvl, gameIdx);
}

export function updateHealthDisplay(cur: number, max: number): void {
  handlers.onHealthUpdate(cur, max);
}

export function setActionButtonLabel(label: string): void {
  handlers.onActionLabelChange(label);
}

export function updateMobaHud(snap: MobaHudSnapshot | null): void {
  handlers.onMobaHudUpdate?.(snap);
}

export function updateNarutoHud(snap: NarutoHudSnapshot | null): void {
  handlers.onNarutoHudUpdate?.(snap);
}

export function updateHoopsHud(snap: HoopsHudSnapshot | null): void {
  handlers.onHoopsHudUpdate?.(snap);
}

export function triggerGameOver(
  score: number,
  coinsEarned: number,
  reachedLevel: number,
  gameIdx: number,
  isVictory = false
): void {
  ArcadeAudio.stopBgm();
  ArcadeAudio.play(isVictory ? 'win' : 'gameover');
  if (score > (playerState.highScores[gameIdx] || 0)) {
    playerState.highScores[gameIdx] = score;
    persistHighScores();
  }
  updateCoinsDisplay();
  handlers.onGameOver(score, coinsEarned, reachedLevel, gameIdx, isVictory);
}
