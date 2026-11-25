// ============================================================================
// PART 5 — TEAMMATE GRADE, PICK & ROLL, LINEUP PRESETS, SPLASHES & REPLAY BUFFER
// ============================================================================

import type { PlayerProfile } from '../hybrid/rosterTypes';
import type { MatchRenderState, PlayerAnimState } from './courtTypes';

export type TeammateGradeLetter =
  | 'F'
  | 'D-'
  | 'D'
  | 'D+'
  | 'C-'
  | 'C'
  | 'C+'
  | 'B-'
  | 'B'
  | 'B+'
  | 'A-'
  | 'A'
  | 'A+';

export interface TeammateGradeEvent {
  id: number;
  label: string;
  delta: number;
  positive: boolean;
  ttlSec: number;
}

export interface TeammateGradeState {
  score: number; // 0..100 (starts at 50 = C)
  letter: TeammateGradeLetter;
  events: TeammateGradeEvent[];
  seq: number;
}

export type SplashBannerTone = 'GOLD' | 'GREEN' | 'CRIMSON' | 'CYAN' | 'FIRE';

export interface SplashBannerItem {
  id: number;
  title: string;
  subtitle: string;
  tone: SplashBannerTone;
  ttlSec: number;
}

export type LineupPresetId = 'STARTERS' | 'SHOOTERS' | 'TALL' | 'DEFENSIVE';

export interface PickAndRollState {
  active: boolean;
  screenerId: string | null;
  screenerName: string;
  handlerId: string | null;
  angleDeg: 45 | 180;
  action: 'ROLL' | 'FADE';
  screenX: number;
  screenZ: number;
  elapsedSec: number;
  screenSet: boolean;
  screenAssistWindowSec: number;
}

export interface ProjectedScreenPoint {
  x: number;
  y: number;
  visible: boolean;
}

export interface ProjectedPlayerAnchor {
  headX: number;
  headY: number;
  feetX: number;
  feetY: number;
  visible: boolean;
}

export interface ProjectedCourtAnchors {
  width: number;
  height: number;
  players: Record<string, ProjectedPlayerAnchor>;
  ball: ProjectedScreenPoint;
}

export function createEmptyProjectedAnchors(): ProjectedCourtAnchors {
  return {
    width: 960,
    height: 540,
    players: {},
    ball: { x: 480, y: 270, visible: false },
  };
}

// ============================================================================
// TEAMMATE GRADE ENGINE (F -> A+)
// ============================================================================

const GRADE_THRESHOLDS: Array<{ min: number; letter: TeammateGradeLetter }> = [
  { min: 95, letter: 'A+' },
  { min: 89, letter: 'A' },
  { min: 83, letter: 'A-' },
  { min: 76, letter: 'B+' },
  { min: 69, letter: 'B' },
  { min: 62, letter: 'B-' },
  { min: 55, letter: 'C+' },
  { min: 48, letter: 'C' },
  { min: 41, letter: 'C-' },
  { min: 34, letter: 'D+' },
  { min: 26, letter: 'D' },
  { min: 16, letter: 'D-' },
  { min: 0, letter: 'F' },
];

export function scoreToGradeLetter(score: number): TeammateGradeLetter {
  const clamped = Math.max(0, Math.min(100, score));
  for (let i = 0; i < GRADE_THRESHOLDS.length; i++) {
    if (clamped >= GRADE_THRESHOLDS[i].min) {
      return GRADE_THRESHOLDS[i].letter;
    }
  }
  return 'F';
}

export function getGradeColor(letter: TeammateGradeLetter): string {
  if (letter.startsWith('A')) return '#fbbf24';
  if (letter.startsWith('B')) return '#22c55e';
  if (letter.startsWith('C')) return '#38bdf8';
  if (letter.startsWith('D')) return '#f97316';
  return '#ef4444';
}

export function createInitialTeammateGrade(): TeammateGradeState {
  return {
    score: 50,
    letter: 'C',
    events: [],
    seq: 0,
  };
}

export function recordTeammateGradeEvent(
  grade: TeammateGradeState,
  label: string,
  delta: number
): void {
  grade.score = Math.max(0, Math.min(100, grade.score + delta));
  grade.letter = scoreToGradeLetter(grade.score);
  grade.seq += 1;
  const ev: TeammateGradeEvent = {
    id: grade.seq,
    label,
    delta,
    positive: delta >= 0,
    ttlSec: 3.8,
  };
  grade.events = [ev, ...grade.events].slice(0, 3);
}

export function tickTeammateGradeEvents(grade: TeammateGradeState, dt: number): void {
  for (let i = grade.events.length - 1; i >= 0; i--) {
    grade.events[i].ttlSec -= dt;
    if (grade.events[i].ttlSec <= 0) {
      grade.events.splice(i, 1);
    }
  }
}

// ============================================================================
// PICK & ROLL / PICK & FADE SCREEN GEOMETRY (2K26 45° / 180° ANGLES)
// ============================================================================

export function createIdlePickAndRoll(): PickAndRollState {
  return {
    active: false,
    screenerId: null,
    screenerName: '',
    handlerId: null,
    angleDeg: 45,
    action: 'ROLL',
    screenX: 0,
    screenZ: 0,
    elapsedSec: 0,
    screenSet: false,
    screenAssistWindowSec: 0,
  };
}

export function computeScreenPosition(
  handlerX: number,
  handlerZ: number,
  attackDirX: 1 | -1,
  angleDeg: 45 | 180
): { x: number; z: number } {
  // 45° sets a wing-side angled hip screen; 180° flips to the opposite shoulder!
  const sideSign = handlerZ >= 0 ? -1 : 1;
  const flippedSide = angleDeg === 180 ? -sideSign : sideSign;
  const xOffset = attackDirX * 1.15;
  const zOffset = flippedSide * 1.18;
  return {
    x: Math.max(-12.2, Math.min(12.2, handlerX + xOffset)),
    z: Math.max(-6.2, Math.min(6.2, handlerZ + zOffset)),
  };
}

// ============================================================================
// QUICK SUBSTITUTION LINEUP PRESETS
// ============================================================================

export function selectLineupProfiles(
  roster: PlayerProfile[],
  preset: LineupPresetId,
  count: number
): PlayerProfile[] {
  const safeCount = Math.max(1, Math.min(5, count));
  if (roster.length <= safeCount || preset === 'STARTERS') {
    return roster.slice(0, safeCount);
  }
  const scored = roster.map((p, idx) => {
    let score = p.ovr;
    if (preset === 'SHOOTERS') {
      score = p.attributes.threePt * 1.45 + p.attributes.midRange * 0.55 + p.ovr * 0.2;
    } else if (preset === 'TALL') {
      score = p.heightInches * 2.1 + p.attributes.defReb * 0.55 + p.attributes.block * 0.45;
    } else if (preset === 'DEFENSIVE') {
      score =
        p.attributes.perimeterDef * 0.7 +
        p.attributes.interiorDef * 0.7 +
        p.attributes.steal * 0.45 +
        p.attributes.block * 0.45;
    }
    return { p, score, idx };
  });
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  return scored.slice(0, safeCount).map((item) => item.p);
}

// ============================================================================
// 10-SECOND INSTANT REPLAY RING BUFFER (60 HZ SNAPSHOTS -> 600 FRAMES)
// + 360° FREE-ORBIT FREEZE CAM STATE
// ============================================================================

export interface ReplayOrbitState {
  active: boolean;
  azimuth: number; // radians
  polar: number; // radians (0.25..1.35)
  distance: number; // meters (3.5..24)
  focusMode: 'BALL' | 'COURT';
}

export function createDefaultReplayOrbit(): ReplayOrbitState {
  return {
    active: false,
    azimuth: 0.72,
    polar: 0.92,
    distance: 9.5,
    focusMode: 'BALL',
  };
}

export interface ReplayPlayerSnap {
  id: string;
  x: number;
  y: number;
  z: number;
  facingRad: number;
  animState: PlayerAnimState;
  animPhase: number;
  shotProgress: number;
  hasBall: boolean;
}

export interface ReplayFrame {
  simTimeSec: number;
  ballX: number;
  ballY: number;
  ballZ: number;
  ballInFlight: boolean;
  holderPlayerId: string | null;
  players: ReplayPlayerSnap[];
}

export class InstantReplayBuffer {
  private readonly maxFrames: number;
  private frames: ReplayFrame[] = [];
  private sampleAccum = 0;

  constructor(maxFrames = 600) {
    this.maxFrames = maxFrames;
  }

  public clear(): void {
    this.frames = [];
    this.sampleAccum = 0;
  }

  public record(state: MatchRenderState, simTimeSec: number, dt: number): void {
    this.sampleAccum += dt;
    if (this.sampleAccum < 1 / 60 && this.frames.length > 0) return;
    this.sampleAccum = 0;

    const frame: ReplayFrame = {
      simTimeSec,
      ballX: state.ball.x,
      ballY: state.ball.y,
      ballZ: state.ball.z,
      ballInFlight: state.ball.inFlight,
      holderPlayerId: state.ball.holderPlayerId,
      players: state.players.map((pl) => ({
        id: pl.id,
        x: pl.x,
        y: pl.y,
        z: pl.z,
        facingRad: pl.facingRad,
        animState: pl.animState,
        animPhase: pl.animPhase,
        shotProgress: pl.shotProgress,
        hasBall: pl.hasBall,
      })),
    };
    this.frames.push(frame);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  public getFrameCount(): number {
    return this.frames.length;
  }

  public getFrame(index: number): ReplayFrame | null {
    if (this.frames.length === 0) return null;
    const clamped = Math.max(0, Math.min(this.frames.length - 1, Math.floor(index)));
    return this.frames[clamped];
  }

  public applyFrame(index: number, target: MatchRenderState): boolean {
    const frame = this.getFrame(index);
    if (!frame) return false;
    target.ball.x = frame.ballX;
    target.ball.y = frame.ballY;
    target.ball.z = frame.ballZ;
    target.ball.inFlight = frame.ballInFlight;
    target.ball.holderPlayerId = frame.holderPlayerId;

    for (let i = 0; i < frame.players.length; i++) {
      const snap = frame.players[i];
      const pl = target.players.find((p) => p.id === snap.id);
      if (pl) {
        pl.x = snap.x;
        pl.y = snap.y;
        pl.z = snap.z;
        pl.facingRad = snap.facingRad;
        pl.animState = snap.animState;
        pl.animPhase = snap.animPhase;
        pl.shotProgress = snap.shotProgress;
        pl.hasBall = snap.hasBall;
      }
    }
    return true;
  }
}
