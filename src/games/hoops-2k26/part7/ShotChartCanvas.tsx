// ============================================================================
// PART 7 — INTERACTIVE HALF-COURT SHOT CHART SPRAY GRAPH (PROFILE & POST-MATCH)
// - Plots shots in real regulation half-court feet (x: -25..25 ft, y: 0..42 ft)
//   with Green Circle = Green Make, Gold Circle = Regular Make, Red X = Miss
// - Filter tabs: ALL · MAKES ONLY · 3PT ONLY · GREENS ONLY
// - Interactive 9-zone FG% breakdown with hover/tap tooltips
// ============================================================================

import React, { useMemo, useState } from 'react';
import type { ShotChartEntry } from '../hybrid/types';

export type ShotChartFilter = 'ALL' | 'MAKES' | 'THREE_PT' | 'GREENS';

export interface ShotZoneSummary {
  id: string;
  label: string;
  made: number;
  att: number;
  pct: number;
}

export function normalizeShotFeet(shot: Pick<ShotChartEntry, 'x' | 'y'>): { xFt: number; yFt: number } {
  // Support both regulation feet (-25..25, 0..42) and normalized [-1..1, 0..1]
  const isNormalized = Math.abs(shot.x) <= 1.05 && shot.y >= 0 && shot.y <= 1.05;
  const xFt = isNormalized ? shot.x * 24 : Math.max(-25, Math.min(25, shot.x));
  const yFt = isNormalized ? shot.y * 40 : Math.max(0, Math.min(42, shot.y));
  return { xFt, yFt };
}

export function classifyShotZone(shot: Pick<ShotChartEntry, 'x' | 'y' | 'isThree'>): string {
  const { xFt, yFt } = normalizeShotFeet(shot);
  const absX = Math.abs(xFt);
  if (shot.isThree) {
    if (yFt <= 11.5) return xFt < 0 ? 'LEFT_CORNER_3' : 'RIGHT_CORNER_3';
    if (absX >= 9.5) return xFt < 0 ? 'LEFT_WING_3' : 'RIGHT_WING_3';
    return 'TOP_KEY_3';
  }
  if (yFt <= 7.5 && absX <= 6.5) return 'RESTRICTED_PAINT';
  if (yFt <= 16.5 && absX <= 8.5) return 'IN_THE_PAINT';
  return xFt < 0 ? 'LEFT_MID' : 'RIGHT_MID';
}

const ZONE_LABELS: Array<{ id: string; label: string }> = [
  { id: 'RESTRICTED_PAINT', label: 'Rim / RA' },
  { id: 'IN_THE_PAINT', label: 'Paint (Non-RA)' },
  { id: 'LEFT_MID', label: 'Left Mid' },
  { id: 'RIGHT_MID', label: 'Right Mid' },
  { id: 'LEFT_CORNER_3', label: 'L Corner 3' },
  { id: 'RIGHT_CORNER_3', label: 'R Corner 3' },
  { id: 'LEFT_WING_3', label: 'L Wing 3' },
  { id: 'TOP_KEY_3', label: 'Top Key 3' },
  { id: 'RIGHT_WING_3', label: 'R Wing 3' },
];

export function filterShotEntries(
  shots: ShotChartEntry[],
  filter: ShotChartFilter
): ShotChartEntry[] {
  if (filter === 'ALL') return shots;
  if (filter === 'MAKES') return shots.filter((s) => s.made);
  if (filter === 'THREE_PT') return shots.filter((s) => s.isThree);
  return shots.filter((s) => Boolean(s.isGreen) && s.made);
}

export function computeShotChartZoneStats(shots: ShotChartEntry[]): ShotZoneSummary[] {
  const map: Record<string, { made: number; att: number }> = {};
  for (let i = 0; i < ZONE_LABELS.length; i++) {
    map[ZONE_LABELS[i].id] = { made: 0, att: 0 };
  }
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    const z = classifyShotZone(s);
    if (!map[z]) map[z] = { made: 0, att: 0 };
    map[z].att += 1;
    if (s.made) map[z].made += 1;
  }
  return ZONE_LABELS.map((item) => {
    const entry = map[item.id] ?? { made: 0, att: 0 };
    return {
      id: item.id,
      label: item.label,
      made: entry.made,
      att: entry.att,
      pct: entry.att > 0 ? Math.round((entry.made / entry.att) * 100) : 0,
    };
  });
}

export interface ShotChartCanvasProps {
  shots: ShotChartEntry[];
  title?: string;
  compact?: boolean;
}

export const ShotChartCanvas: React.FC<ShotChartCanvasProps> = ({
  shots,
  title = 'Half-Court Shot Chart',
  compact = false,
}) => {
  const [filter, setFilter] = useState<ShotChartFilter>('ALL');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

  const filteredShots = useMemo(() => filterShotEntries(shots, filter), [shots, filter]);
  const zones = useMemo(() => computeShotChartZoneStats(shots), [shots]);

  const totalMade = useMemo(() => filteredShots.filter((s) => s.made).length, [filteredShots]);
  const totalAtt = filteredShots.length;
  const fgPct = totalAtt > 0 ? ((totalMade / totalAtt) * 100).toFixed(1) : '0.0';
  const activeZone = zones.find((z) => z.id === activeZoneId) ?? null;

  return (
    <div className="p7-shotchart-wrap">
      <div className="p7-shotchart-bar">
        <div className="p7-shotchart-head">
          <strong className="p7-shotchart-title">{title}</strong>
          <span className="p7-num p7-muted">
            {totalMade}/{totalAtt} FG ({fgPct}%)
          </span>
        </div>
        <div className="p7-seg" role="tablist" aria-label="Shot chart filters">
          {(
            [
              ['ALL', 'All'],
              ['MAKES', 'Makes Only'],
              ['THREE_PT', '3PT Only'],
              ['GREENS', 'Greens Only'],
            ] as Array<[ShotChartFilter, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              className={`p7-seg-btn ${filter === id ? 'active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 400 280"
        className="p7-shotchart-svg"
        role="img"
        aria-label="Interactive basketball half-court shot chart"
      >
        <rect x="0" y="0" width="400" height="280" fill="#141c2c" />
        <rect x="10" y="10" width="380" height="260" fill="#1a253a" stroke="rgba(255,255,255,0.28)" strokeWidth="2" />

        {/* Key / Paint */}
        <rect
          x="140"
          y="10"
          width="120"
          height="122"
          fill="rgba(2, 132, 199, 0.16)"
          stroke="rgba(255,255,255,0.34)"
          strokeWidth="1.6"
        />
        {/* Free throw circle */}
        <circle cx="200" cy="132" r="40" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" />
        {/* Restricted area arc & hoop */}
        <path d="M 168 32 A 32 32 0 0 0 232 32" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="1.4" />
        <line x1="176" y1="22" x2="224" y2="22" stroke="#e2e8f0" strokeWidth="2.5" />
        <circle cx="200" cy="30" r="7" fill="none" stroke="#f97316" strokeWidth="2.2" />

        {/* 3-Point Arc */}
        <line x1="36" y1="10" x2="36" y2="86" stroke="rgba(255,255,255,0.38)" strokeWidth="1.8" />
        <line x1="364" y1="10" x2="364" y2="86" stroke="rgba(255,255,255,0.38)" strokeWidth="1.8" />
        <path
          d="M 36 86 A 174 174 0 0 0 364 86"
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="1.8"
        />

        {/* Half-court center circle */}
        <path d="M 160 270 A 40 40 0 0 1 240 270" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

        {/* Shot markers */}
        {filteredShots.map((s, idx) => {
          const { xFt, yFt } = normalizeShotFeet(s);
          const cx = 200 + (xFt / 25) * 184;
          const cy = 22 + (yFt / 42) * 238;
          const zoneId = classifyShotZone(s);
          const isHighlighted = activeZoneId === zoneId;
          if (s.made) {
            const color = s.isGreen ? '#22c55e' : '#fbbf24';
            return (
              <g
                key={`${s.id || s.timestamp}-${idx}`}
                onMouseEnter={() => setActiveZoneId(zoneId)}
                onClick={() => setActiveZoneId(zoneId)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHighlighted ? 6.5 : 4.8}
                  fill={color}
                  fillOpacity={0.85}
                  stroke="#ffffff"
                  strokeWidth={s.isGreen ? 1.5 : 1}
                />
              </g>
            );
          }
          return (
            <g
              key={`${s.id || s.timestamp}-${idx}`}
              onMouseEnter={() => setActiveZoneId(zoneId)}
              onClick={() => setActiveZoneId(zoneId)}
              style={{ cursor: 'pointer' }}
            >
              <line
                x1={cx - 4}
                y1={cy - 4}
                x2={cx + 4}
                y2={cy + 4}
                stroke="#f87171"
                strokeWidth={isHighlighted ? 2.4 : 1.7}
              />
              <line
                x1={cx + 4}
                y1={cy - 4}
                x2={cx - 4}
                y2={cy + 4}
                stroke="#f87171"
                strokeWidth={isHighlighted ? 2.4 : 1.7}
              />
            </g>
          );
        })}

        {filteredShots.length === 0 && (
          <text
            x="200"
            y="188"
            textAnchor="middle"
            fill="rgba(226,232,240,0.6)"
            fontSize="12"
            fontWeight="700"
          >
            No shots logged for this filter yet
          </text>
        )}
      </svg>

      <div className="p7-shotchart-legend">
        <span>
          <strong style={{ color: '#22c55e' }}>●</strong> Green Make ·{' '}
          <strong style={{ color: '#fbbf24' }}>●</strong> Regular Make ·{' '}
          <strong style={{ color: '#f87171' }}>✕</strong> Miss
        </span>
        {activeZone ? (
          <span className="p7-num" style={{ color: '#38bdf8', fontWeight: 700 }}>
            {activeZone.label}: {activeZone.made}/{activeZone.att} ({activeZone.pct}%)
          </span>
        ) : (
          <span className="p7-muted">Tap or hover any shot or zone for FG%</span>
        )}
      </div>

      {!compact && (
        <div className="p7-zone-grid">
          {zones.map((z) => (
            <button
              key={z.id}
              type="button"
              className={`p7-zone-cell ${activeZoneId === z.id ? 'active' : ''}`}
              onClick={() => setActiveZoneId(activeZoneId === z.id ? null : z.id)}
            >
              <span>{z.label}</span>
              <strong
                className="p7-num"
                style={{
                  color:
                    z.att === 0
                      ? '#94a3b8'
                      : z.pct >= 50
                        ? '#4ade80'
                        : z.pct >= 35
                          ? '#fbbf24'
                          : '#f87171',
                }}
              >
                {z.made}/{z.att} ({z.pct}%)
              </strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
