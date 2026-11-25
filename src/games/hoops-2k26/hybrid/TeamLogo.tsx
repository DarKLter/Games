import React from 'react';
import type {
  HotZoneKey,
  HotZones,
  HotZoneValue,
  TeamData,
  TeamEra,
} from './rosterTypes';

// ============================================================================
// PROCEDURAL SVG TEAM EMBLEM & INTERACTIVE 9-ZONE HOT ZONE HALF-COURT
// Zero external image URLs — 100% crisp vector rendering offline & online
// ============================================================================

export type EmblemShape = 'SHIELD' | 'CREST' | 'CROWN' | 'STAR' | 'DIAMOND';

export interface TeamLogoProps {
  id: string;
  abbr: string;
  name?: string;
  era: TeamEra;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  ovr?: number;
  shape?: EmblemShape;
  size?: number;
}

export function eraShortBadge(era: TeamEra): string {
  if (era === '2K14') return "'14";
  if (era === '2K26') return "'26";
  if (era === 'LEGENDS') return 'LEGEND';
  if (era === 'EUROLEAGUE') return 'EURO';
  return 'WNBA';
}

export function pickShapeForTeam(id: string, era: TeamEra): EmblemShape {
  if (era === 'LEGENDS') return 'CROWN';
  if (era === 'EUROLEAGUE') return 'CREST';
  if (era === 'WNBA') return 'STAR';
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  const shapes: EmblemShape[] = ['SHIELD', 'DIAMOND', 'CREST', 'STAR'];
  return shapes[Math.abs(hash) % shapes.length];
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  id,
  abbr,
  name,
  era,
  primaryColor,
  secondaryColor,
  accentColor,
  ovr,
  shape,
  size = 64,
}) => {
  const uid = `tl_${id.replace(/[^a-zA-Z0-9]/g, '_')}_${size}`;
  const resolvedShape = shape ?? pickShapeForTeam(id, era);
  const badge = eraShortBadge(era);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={`${name ?? abbr} ${badge} emblem`}
      className="h2k-emblem-svg"
    >
      <defs>
        <linearGradient id={`${uid}_bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#090C14" />
        </linearGradient>
        <linearGradient id={`${uid}_rim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
      </defs>

      {resolvedShape === 'CROWN' ? (
        <path
          d="M12 28 L27 40 L48 14 L69 40 L84 28 L77 75 L48 88 L19 75 Z"
          fill={`url(#${uid}_bg)`}
          stroke={`url(#${uid}_rim)`}
          strokeWidth="3.6"
        />
      ) : resolvedShape === 'DIAMOND' ? (
        <polygon
          points="48,6 88,48 48,90 8,48"
          fill={`url(#${uid}_bg)`}
          stroke={`url(#${uid}_rim)`}
          strokeWidth="3.6"
        />
      ) : resolvedShape === 'STAR' ? (
        <circle
          cx="48"
          cy="48"
          r="41"
          fill={`url(#${uid}_bg)`}
          stroke={`url(#${uid}_rim)`}
          strokeWidth="3.8"
        />
      ) : resolvedShape === 'CREST' ? (
        <path
          d="M16 14 H80 L84 44 C84 68 65 81 48 88 C31 81 12 68 12 44 Z"
          fill={`url(#${uid}_bg)`}
          stroke={`url(#${uid}_rim)`}
          strokeWidth="3.6"
        />
      ) : (
        <path
          d="M16 14 H80 V52 C80 71 64 82 48 88 C32 82 16 71 16 52 Z"
          fill={`url(#${uid}_bg)`}
          stroke={`url(#${uid}_rim)`}
          strokeWidth="3.6"
        />
      )}

      {/* Subtle basketball seam geometry */}
      <circle
        cx="48"
        cy="48"
        r="28"
        fill="none"
        stroke={secondaryColor}
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M23 39 Q48 51 73 39 M23 57 Q48 45 73 57"
        fill="none"
        stroke={accentColor}
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />

      {/* Era pill ribbon at top */}
      <rect
        x="26"
        y="17"
        width="44"
        height="12"
        rx="4"
        fill="#090C14"
        fillOpacity="0.88"
        stroke={accentColor}
        strokeWidth="1"
      />
      <text
        x="48"
        y="25.5"
        textAnchor="middle"
        fill={accentColor}
        fontSize="7.4"
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.8"
      >
        {badge}
      </text>

      {/* Bold team abbreviation */}
      <text
        x="48"
        y="55"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize={abbr.length > 3 ? '17' : '22'}
        fontWeight="900"
        fontFamily="Impact, 'Arial Black', sans-serif"
        letterSpacing="1.1"
      >
        {abbr}
      </text>

      {/* Bottom OVR badge when provided */}
      {typeof ovr === 'number' && (
        <>
          <rect
            x="28"
            y="64"
            width="40"
            height="12"
            rx="3"
            fill="#090C14"
            fillOpacity="0.86"
            stroke={secondaryColor}
            strokeWidth="1"
          />
          <text
            x="48"
            y="72.5"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="7.5"
            fontWeight="800"
            fontFamily="system-ui, sans-serif"
          >
            OVR {ovr}
          </text>
        </>
      )}
    </svg>
  );
};

export const TeamLogoFromData: React.FC<{ team: TeamData; size?: number }> = ({
  team,
  size = 56,
}) => (
  <TeamLogo
    id={team.id}
    abbr={team.abbr}
    name={`${team.city} ${team.name}`}
    era={team.era}
    primaryColor={team.colors.primary}
    secondaryColor={team.colors.secondary}
    accentColor={team.colors.accent}
    ovr={team.ovr}
    size={size}
  />
);

// ============================================================================
// INTERACTIVE 9-ZONE HALF-COURT HOT ZONES MAP (SVG)
// ============================================================================

export interface HotZoneCourtSVGProps {
  zones: HotZones;
  interactive?: boolean;
  onToggleZone?: (key: HotZoneKey, nextValue: HotZoneValue) => void;
}

const ZONE_LABELS: Record<HotZoneKey, { label: string; lx: number; ly: number }> = {
  leftCorner3: { label: 'L3', lx: 22, ly: 34 },
  rightCorner3: { label: 'R3', lx: 278, ly: 34 },
  leftWing3: { label: 'LW3', lx: 50, ly: 148 },
  topKey3: { label: 'TOP3', lx: 150, ly: 194 },
  rightWing3: { label: 'RW3', lx: 250, ly: 148 },
  leftMid: { label: 'LMID', lx: 64, ly: 86 },
  topMid: { label: 'TMID', lx: 150, ly: 138 },
  rightMid: { label: 'RMID', lx: 236, ly: 86 },
  paint: { label: 'PAINT', lx: 150, ly: 66 },
};

function zoneFill(val: HotZoneValue): string {
  if (val === 1) return 'rgba(225, 29, 72, 0.72)'; // Hot crimson
  if (val === -1) return 'rgba(56, 189, 248, 0.56)'; // Cold icy blue
  return 'rgba(100, 116, 139, 0.32)'; // Neutral slate
}

function zoneStroke(val: HotZoneValue): string {
  if (val === 1) return '#fbbf24';
  if (val === -1) return '#7dd3fc';
  return '#64748b';
}

function nextHotZoneVal(v: HotZoneValue): HotZoneValue {
  if (v === -1) return 0;
  if (v === 0) return 1;
  return -1;
}

export const HotZoneCourtSVG: React.FC<HotZoneCourtSVGProps> = ({
  zones,
  interactive = false,
  onToggleZone,
}) => {
  const handleClick = (key: HotZoneKey) => {
    if (!interactive || !onToggleZone) return;
    onToggleZone(key, nextHotZoneVal(zones[key]));
  };

  const zoneCls = interactive ? 'h2k-hz-shape is-interactive' : 'h2k-hz-shape';

  return (
    <div className="h2k-hotzone-wrap">
      <svg
        viewBox="0 0 300 225"
        className="h2k-hotzone-svg"
        role="img"
        aria-label="9-Zone Half-Court Hot Zones Map"
      >
        <rect
          x="4"
          y="4"
          width="292"
          height="217"
          rx="10"
          fill="#0b1120"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* 1. Left Corner 3 */}
        <rect
          x="8"
          y="8"
          width="30"
          height="78"
          rx="4"
          className={zoneCls}
          fill={zoneFill(zones.leftCorner3)}
          stroke={zoneStroke(zones.leftCorner3)}
          strokeWidth="1.5"
          onClick={() => handleClick('leftCorner3')}
        />

        {/* 2. Right Corner 3 */}
        <rect
          x="262"
          y="8"
          width="30"
          height="78"
          rx="4"
          className={zoneCls}
          fill={zoneFill(zones.rightCorner3)}
          stroke={zoneStroke(zones.rightCorner3)}
          strokeWidth="1.5"
          onClick={() => handleClick('rightCorner3')}
        />

        {/* 3. Left Wing 3 */}
        <path
          d="M 8 90 H 56 L 98 164 L 68 214 H 8 Z"
          className={zoneCls}
          fill={zoneFill(zones.leftWing3)}
          stroke={zoneStroke(zones.leftWing3)}
          strokeWidth="1.5"
          onClick={() => handleClick('leftWing3')}
        />

        {/* 4. Top of Key 3 */}
        <path
          d="M 102 164 H 198 L 228 214 H 72 Z"
          className={zoneCls}
          fill={zoneFill(zones.topKey3)}
          stroke={zoneStroke(zones.topKey3)}
          strokeWidth="1.5"
          onClick={() => handleClick('topKey3')}
        />

        {/* 5. Right Wing 3 */}
        <path
          d="M 244 90 H 292 V 214 H 232 L 202 164 Z"
          className={zoneCls}
          fill={zoneFill(zones.rightWing3)}
          stroke={zoneStroke(zones.rightWing3)}
          strokeWidth="1.5"
          onClick={() => handleClick('rightWing3')}
        />

        {/* 6. Left Mid-Range */}
        <path
          d="M 42 8 H 104 V 114 L 78 158 L 42 86 Z"
          className={zoneCls}
          fill={zoneFill(zones.leftMid)}
          stroke={zoneStroke(zones.leftMid)}
          strokeWidth="1.5"
          onClick={() => handleClick('leftMid')}
        />

        {/* 7. Right Mid-Range */}
        <path
          d="M 196 8 H 258 V 86 L 222 158 L 196 114 Z"
          className={zoneCls}
          fill={zoneFill(zones.rightMid)}
          stroke={zoneStroke(zones.rightMid)}
          strokeWidth="1.5"
          onClick={() => handleClick('rightMid')}
        />

        {/* 8. Top Mid-Range (Elbow / Free Throw) */}
        <path
          d="M 106 114 H 194 L 218 160 H 82 Z"
          className={zoneCls}
          fill={zoneFill(zones.topMid)}
          stroke={zoneStroke(zones.topMid)}
          strokeWidth="1.5"
          onClick={() => handleClick('topMid')}
        />

        {/* 9. Paint / Restricted Area */}
        <rect
          x="108"
          y="8"
          width="84"
          height="102"
          rx="4"
          className={zoneCls}
          fill={zoneFill(zones.paint)}
          stroke={zoneStroke(zones.paint)}
          strokeWidth="1.8"
          onClick={() => handleClick('paint')}
        />

        {/* Crisp court markings overlay */}
        <path
          d="M 40 8 V 86 A 114 114 0 0 0 260 86 V 8"
          fill="none"
          stroke="#f8fafc"
          strokeOpacity="0.6"
          strokeWidth="2"
          pointerEvents="none"
        />
        <circle
          cx="150"
          cy="110"
          r="26"
          fill="none"
          stroke="#cbd5e1"
          strokeOpacity="0.48"
          strokeWidth="1.4"
          pointerEvents="none"
        />
        <line x1="132" y1="18" x2="168" y2="18" stroke="#f8fafc" strokeWidth="2.4" pointerEvents="none" />
        <circle cx="150" cy="26" r="6.5" fill="none" stroke="#f97316" strokeWidth="2.5" pointerEvents="none" />

        {/* Zone short labels */}
        {(Object.keys(ZONE_LABELS) as HotZoneKey[]).map((key) => {
          const item = ZONE_LABELS[key];
          const val = zones[key];
          return (
            <text
              key={key}
              x={item.lx}
              y={item.ly}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8.5"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              pointerEvents="none"
            >
              {item.label} {val === 1 ? '🔥' : val === -1 ? '❄' : '•'}
            </text>
          );
        })}
      </svg>

      <div className="h2k-hotzone-legend">
        <span className="hz-hot">● HOT (+1)</span>
        <span className="hz-mid">● NEUTRAL (0)</span>
        <span className="hz-cold">● COLD (-1)</span>
        {interactive && <span className="hz-hint">Click any zone to toggle</span>}
      </div>
    </div>
  );
};
