// ============================================================================
// PART 3 — 60 FPS THREE.JS 3D BASKETBALL ENGINE TYPES, PROPORTIONS & 7 CAMERAS
// ============================================================================

import type { MatchVenueId, UIEraMode } from '../hybrid/types';
import type { HotZoneValue, HotZones, PlayerAppearance } from '../hybrid/rosterTypes';

/** Exact regulation NBA court dimensions in Three.js world meters */
export const COURT_DIMS = {
  LENGTH: 28.6,
  HALF_LENGTH: 14.3,
  WIDTH: 15.2,
  HALF_WIDTH: 7.6,
  RIM_Y: 3.05,
  RIM_X: 12.7,
  RIM_RADIUS: 0.23,
  BACKBOARD_X: 13.08,
  BACKBOARD_Y: 3.35,
  BACKBOARD_W: 1.83,
  BACKBOARD_H: 1.07,
  THREE_PT_RADIUS: 7.24,
  CORNER_THREE_Z: 6.71,
  KEY_LENGTH: 5.79,
  KEY_HALF_WIDTH: 2.44,
  FREE_THROW_X: 8.51,
  CENTER_CIRCLE_R: 1.83,
  BALL_RADIUS: 0.121,
} as const;

export type CameraAngleId =
  | '2K'
  | '2K_LOW'
  | 'BROADCAST'
  | 'DRIVE'
  | 'PLAYER_LOCK'
  | 'HIGH'
  | 'NOSEBLEEDS';

export interface CameraAngleMeta {
  id: CameraAngleId;
  label: string;
  shortLabel: string;
  description: string;
}

export const CAMERA_ANGLE_OPTIONS: CameraAngleMeta[] = [
  {
    id: '2K',
    label: '2K Camera',
    shortLabel: '2K',
    description: 'Behind-offense vertical broadcast angle with smooth Auto-Flip',
  },
  {
    id: '2K_LOW',
    label: '2K Low',
    shortLabel: '2K LOW',
    description: 'Lower court-level behind-the-back vertical perspective',
  },
  {
    id: 'BROADCAST',
    label: 'Broadcast TV',
    shortLabel: 'BROADCAST',
    description: 'Authentic TV sideline camera panning smoothly with the ball',
  },
  {
    id: 'DRIVE',
    label: 'Drive Cam',
    shortLabel: 'DRIVE',
    description: 'Tight action-cam close behind the active ball-handler',
  },
  {
    id: 'PLAYER_LOCK',
    label: 'Player Lock',
    shortLabel: 'LOCK',
    description: 'Follows your controlled MyPLAYER smoothly across the floor',
  },
  {
    id: 'HIGH',
    label: 'High Tactical',
    shortLabel: 'HIGH',
    description: 'Elevated wide coach view showing all 10 players & PlayVision',
  },
  {
    id: 'NOSEBLEEDS',
    label: 'Nosebleeds',
    shortLabel: 'NOSEBLEED',
    description: 'Full-court upper-bowl arena overview with Jumbotron & crowd',
  },
];

export const CAMERA_ORDER: CameraAngleId[] = CAMERA_ANGLE_OPTIONS.map((c) => c.id);

export type PlayerAnimState =
  | 'IDLE'
  | 'RUN'
  | 'SPRINT'
  | 'DRIBBLE_LEFT'
  | 'DRIBBLE_RIGHT'
  | 'CROSSOVER'
  | 'STEPBACK'
  | 'QUICK_PROTECT'
  | 'JUMPSHOT'
  | 'LAYUP'
  | 'EURO_STEP'
  | 'FLOATER'
  | 'DUNK'
  | 'RIM_HANG'
  | 'DEFENSIVE_SLIDE'
  | 'HANDS_UP_CONTEST'
  | 'JUMP_BLOCK'
  | 'REBOUND_SNAG'
  | 'ANKLE_BROKEN_STUMBLE'
  | 'CELEBRATE';

export type PlayVisionPlayId =
  | 'OFF'
  | 'FIVE_OUT'
  | 'MOTION_CUT'
  | 'HORNS'
  | 'PICK_AND_ROLL'
  | 'FLOPPY';

export type DefensiveSchemeId =
  | 'MAN_TO_MAN'
  | 'ZONE_2_3'
  | 'ZONE_3_2'
  | 'FULL_COURT_PRESS'
  | 'HALF_COURT_TRAP';

export type ShotTimingProfile =
  | 'GREEN_OR_MISS'
  | 'HIGH_RISK'
  | 'NORMAL'
  | 'LOW_RISK'
  | 'REAL_PLAYER_PCT';

export type VisualCueId = 'JUMP' | 'SET_POINT' | 'PUSH' | 'RELEASE';

export type HotColdZoneMode = 'OFF' | 'BALL_HANDLER' | 'ALL';

export type MarkCoverageTag = 'DOUBLE' | 'DENY' | 'OVER' | 'PACK';

export type ShotQuality2K14 = 'NONE' | 'RED' | 'YELLOW' | 'GREEN';

export interface PlayerRenderState {
  id: string;
  slotIndex: number; // 0..9
  teamSide: 'HOME' | 'AWAY';
  name: string;
  lastName: string;
  jerseyNumber: number;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  heightInches: number;
  weightLbs: number;
  wingspanInches: number;
  appearance: PlayerAppearance;
  hotZones: HotZones;
  x: number;
  y: number;
  z: number;
  facingRad: number; // 0 = +X, PI/2 = -Z
  speed: number;
  animState: PlayerAnimState;
  animPhase: number;
  shotProgress: number; // 0..1 synced to gather -> jump -> set -> follow-through
  hasBall: boolean;
  isUserControlled: boolean;
  stamina: number; // 0..1
  adrenalinePips: number; // 0..3
  takeoverLevel: number; // 0..1 (>= 0.75 ignites flame ring)
  shotQuality2K14: ShotQuality2K14;
  guardTargetId: string | null;
  visible: boolean;
}

export interface BallRenderState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  spinX: number;
  spinZ: number;
  holderPlayerId: string | null;
  dribbleHand: 'left' | 'right';
  inFlight: boolean;
  isGreenShot: boolean;
}

export interface HoopRenderState {
  leftRimFlex: number; // 0..1 downward rim bend on dunks
  rightRimFlex: number;
  leftNetRipple: number; // 0..1 swish impulse
  rightNetRipple: number;
  leftNetTime: number;
  rightNetTime: number;
  buzzerLit: boolean;
}

export interface MarkedStarState {
  playerId: string | null;
  tag: MarkCoverageTag;
}

export interface MatchRenderState {
  awayAbbr: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  quarter: number;
  quarterClockSec: number;
  shotClockSec: number;
  possession: 'HOME' | 'AWAY'; // HOME attacks +X, AWAY attacks -X
  attackDirX: 1 | -1; // +1 attacks right hoop (+12.7), -1 attacks left hoop (-12.7)
  players: PlayerRenderState[];
  ball: BallRenderState;
  hoops: HoopRenderState;
  activePlay: PlayVisionPlayId;
  markedStar: MarkedStarState;
  crowdExcitement: number; // 0..1
  cameraShake: number; // 0..1 decaying contact-dunk impulse
  jumbotronBanner: string;
  lastEventLabel: string;
}

export interface CourtCameraConfig {
  angle: CameraAngleId;
  zoom: number; // 1..10 (higher = closer)
  height: number; // 1..10 (higher = taller)
  autoFlip: boolean;
  keyZoom: boolean;
  reverseAngle: boolean;
  dunkCameraShake: boolean;
}

export interface CourtVisualConfig {
  hardwoodReflections: boolean;
  hotColdZones: HotColdZoneMode;
  playVision: PlayVisionPlayId;
  showPlayerIcons: boolean;
  cinema3DQuality: 'HIGH' | 'BALANCED';
}

export interface PlayerProportions {
  totalHeightM: number;
  heightScale: number;
  widthScale: number;
  armScale: number;
  shoulderWidth: number;
  torsoHeight: number;
  legLength: number;
}

/**
 * Computes true physical proportions directly from heightInches, weightLbs, wingspanInches.
 * Baseline 6'6" (78"), 215 lbs, 81" wingspan -> ~1.98m.
 * 7'4" Wembanyama (88") visibly dwarfs 6'0" Chris Paul / Allen Iverson (72").
 */
export function computePlayerProportions(
  heightInches: number,
  weightLbs: number,
  wingspanInches: number
): PlayerProportions {
  const safeH = Math.max(66, Math.min(92, Number(heightInches) || 78));
  const safeW = Math.max(140, Math.min(340, Number(weightLbs) || 215));
  const safeWing = Math.max(safeH - 2, Math.min(safeH + 12, Number(wingspanInches) || safeH + 3));

  const totalHeightM = safeH * 0.0254;
  const heightScale = totalHeightM / 1.9812; // 78" baseline
  const bmiRatio = safeW / Math.max(150, safeH * 2.75);
  const widthScale = Math.max(0.8, Math.min(1.36, 0.72 + bmiRatio * 0.3));
  const armScale = Math.max(0.86, Math.min(1.24, safeWing / 81));

  return {
    totalHeightM,
    heightScale,
    widthScale,
    armScale,
    shoulderWidth: 0.44 * widthScale,
    torsoHeight: 0.56 * heightScale,
    legLength: 0.92 * heightScale,
  };
}

export interface SolvedCameraPose {
  posX: number;
  posY: number;
  posZ: number;
  lookX: number;
  lookY: number;
  lookZ: number;
  fov: number;
}

/**
 * Pure deterministic solver for all 7 authentic 2K camera angles.
 * Honors zoom (1..10), height (1..10), autoFlip, keyZoom, and reverseAngle.
 */
export function solveCameraTarget(
  cfg: CourtCameraConfig,
  ballX: number,
  ballY: number,
  ballZ: number,
  focusPlayerX: number,
  focusPlayerZ: number,
  attackDirX: 1 | -1
): SolvedCameraPose {
  const zoomNorm = Math.max(1, Math.min(10, cfg.zoom || 5));
  const heightNorm = Math.max(1, Math.min(10, cfg.height || 6));

  // Zoom 1 (widest) -> 1.24x distance, Zoom 10 (tightest) -> 0.72x distance
  const distFactor = 1.28 - zoomNorm * 0.056;
  // Height 1 (low) -> -1.8m, Height 10 (tall) -> +2.8m
  const heightOffset = (heightNorm - 5) * 0.48;

  // Direction the behind-offense camera looks toward (+1 = right hoop, -1 = left hoop)
  let dir: 1 | -1 = cfg.autoFlip ? attackDirX : 1;
  if (cfg.reverseAngle) {
    dir = dir === 1 ? -1 : 1;
  }

  // Key Zoom subtly tightens FOV & pulls in when ball enters painted lane
  const distToHoop = Math.min(
    Math.hypot(ballX - COURT_DIMS.RIM_X, ballZ),
    Math.hypot(ballX + COURT_DIMS.RIM_X, ballZ)
  );
  const inKeyZone = cfg.keyZoom && distToHoop < 6.4;
  const keyZoomMul = inKeyZone ? 0.87 : 1.0;

  const clampedBallX = Math.max(-13.2, Math.min(13.2, ballX));
  const clampedBallZ = Math.max(-6.8, Math.min(6.8, ballZ));

  switch (cfg.angle) {
    case '2K': {
      const behind = 11.4 * distFactor * keyZoomMul;
      const camX = Math.max(-19.5, Math.min(19.5, clampedBallX - dir * behind));
      const camY = Math.max(3.8, (8.4 + heightOffset) * keyZoomMul);
      const camZ = clampedBallZ * 0.48;
      const lookX = clampedBallX + dir * 5.2;
      return {
        posX: camX,
        posY: camY,
        posZ: camZ,
        lookX: Math.max(-13.5, Math.min(13.5, lookX)),
        lookY: 1.35 + Math.min(1.1, ballY * 0.22),
        lookZ: clampedBallZ * 0.36,
        fov: inKeyZone ? 44 : 48,
      };
    }

    case '2K_LOW': {
      const behind = 9.4 * distFactor * keyZoomMul;
      const camX = Math.max(-18.5, Math.min(18.5, clampedBallX - dir * behind));
      const camY = Math.max(2.6, (5.2 + heightOffset * 0.72) * keyZoomMul);
      const camZ = clampedBallZ * 0.56;
      const lookX = clampedBallX + dir * 6.0;
      return {
        posX: camX,
        posY: camY,
        posZ: camZ,
        lookX: Math.max(-13.5, Math.min(13.5, lookX)),
        lookY: 1.65 + Math.min(1.0, ballY * 0.22),
        lookZ: clampedBallZ * 0.42,
        fov: inKeyZone ? 46 : 51,
      };
    }

    case 'BROADCAST': {
      const sideSign = cfg.reverseAngle ? -1 : 1;
      const zDist = 17.8 * distFactor * keyZoomMul;
      const camX = clampedBallX * 0.74;
      const camY = Math.max(4.6, 8.8 + heightOffset);
      return {
        posX: camX,
        posY: camY,
        posZ: sideSign * zDist,
        lookX: clampedBallX * 0.88,
        lookY: 1.5 + Math.min(0.9, ballY * 0.18),
        lookZ: clampedBallZ * 0.28,
        fov: inKeyZone ? 39 : 43,
      };
    }

    case 'DRIVE': {
      const behind = 6.2 * distFactor * keyZoomMul;
      const camX = Math.max(-17.2, Math.min(17.2, clampedBallX - dir * behind));
      const camY = Math.max(2.2, 3.6 + heightOffset * 0.55);
      const camZ = clampedBallZ * 0.76;
      return {
        posX: camX,
        posY: camY,
        posZ: camZ,
        lookX: Math.max(-13.4, Math.min(13.4, clampedBallX + dir * 7.2)),
        lookY: 1.9 + Math.min(0.9, ballY * 0.2),
        lookZ: clampedBallZ * 0.5,
        fov: 54,
      };
    }

    case 'PLAYER_LOCK': {
      const behind = 7.6 * distFactor;
      const camX = Math.max(-18.2, Math.min(18.2, focusPlayerX - dir * behind));
      const camY = Math.max(2.6, 4.4 + heightOffset * 0.6);
      const camZ = focusPlayerZ * 0.84;
      return {
        posX: camX,
        posY: camY,
        posZ: camZ,
        lookX: focusPlayerX * 0.5 + clampedBallX * 0.5 + dir * 2.8,
        lookY: 1.65,
        lookZ: focusPlayerZ * 0.55 + clampedBallZ * 0.45,
        fov: 50,
      };
    }

    case 'HIGH': {
      const behind = 15.8 * distFactor;
      const camX = Math.max(-22.0, Math.min(22.0, clampedBallX * 0.65 - dir * behind));
      const camY = Math.max(9.5, 14.2 + heightOffset * 1.15);
      const camZ = clampedBallZ * 0.25;
      return {
        posX: camX,
        posY: camY,
        posZ: camZ,
        lookX: clampedBallX * 0.55 + dir * 3.5,
        lookY: 0.9,
        lookZ: 0,
        fov: 46,
      };
    }

    case 'NOSEBLEEDS':
    default: {
      const sideSign = cfg.reverseAngle ? -1 : 1;
      const zDist = 25.5 * distFactor;
      return {
        posX: clampedBallX * 0.32,
        posY: Math.max(13.0, 18.8 + heightOffset * 1.25),
        posZ: sideSign * zDist,
        lookX: clampedBallX * 0.35,
        lookY: 1.2,
        lookZ: 0,
        fov: 44,
      };
    }
  }
}

export function isOutdoorVenue(venue: MatchVenueId): boolean {
  return (
    venue === 'SKYLINE_PARK' ||
    venue === 'RIVET_CITY' ||
    venue === 'SUNSET_BEACH' ||
    venue === 'OLD_TOWN' ||
    venue === 'BLACKTOP_CAGE' ||
    venue === 'STREET_KINGS'
  );
}

export function isStreetAsphaltVenue(venue: MatchVenueId): boolean {
  return (
    venue === 'SKYLINE_PARK' ||
    venue === 'RIVET_CITY' ||
    venue === 'SUNSET_BEACH' ||
    venue === 'OLD_TOWN' ||
    venue === 'BLACKTOP_CAGE'
  );
}

export function getVenueDisplayLabel(venue: MatchVenueId): string {
  switch (venue) {
    case 'ARENA_2K26':
      return '2K26 Next-Gen Arena';
    case 'ARENA_2K14':
      return '2K14 Classic Arena';
    case 'SKYLINE_PARK':
      return 'Skyline Park (City)';
    case 'RIVET_CITY':
      return 'Rivet City (2K16)';
    case 'SUNSET_BEACH':
      return 'Sunset Beach (2K16)';
    case 'OLD_TOWN':
      return 'Old Town (2K16)';
    case 'BLACKTOP_CAGE':
      return 'Blacktop Cage (2K14)';
    case 'STREET_KINGS':
      return 'Street Kings Coliseum';
    case 'EUROLEAGUE_PALACE':
      return 'EuroLeague Palace';
    case 'WNBA_ARENA':
      return 'The W Arena';
    default:
      return '2K26 Next-Gen Arena';
  }
}

export function hotZoneColorHex(state: HotZoneValue): number {
  if (state === 1) return 0xef4444;
  if (state === -1) return 0x38bdf8;
  return 0x94a3b8;
}

export function getActiveRingColorHex(era: UIEraMode): number {
  return era === '2K14_CLASSIC' ? 0xe11d48 : 0x22d3ee;
}
