import React, { useMemo, useState } from 'react';
import {
  ATTRIBUTE_META,
  BADGE_CATALOG,
  BADGE_TIERS,
  computePlayerOvr,
  deriveArchetype,
  formatHeightFeetInches,
  makePlayer,
  type ArmSleeveOption,
  type AttributeKey,
  type BadgeCategory,
  type BadgeId,
  type BadgeTier,
  type HairStyle,
  type HotZoneKey,
  type HotZoneValue,
  type PlayerPosition,
  type PlayerProfile,
  type PlayerStylePreset,
} from './rosterTypes';
import { RosterStore, useRosterStore } from './rosterStore';
import { HotZoneCourtSVG } from './TeamLogo';
import { HybridAudioEngine } from './audioEngine';
import type { UIEraMode } from './types';

// ============================================================================
// PART 2 CREATE-A-PLAYER STUDIO — FULL 4-TAB CREATOR + LIVE CARD PREVIEW
// ============================================================================

export interface CreateAPlayerProps {
  eraMode: UIEraMode;
  initialTeamId?: string;
  onBack: () => void;
  onSavedOpenRoster: (teamId: string) => void;
  onSavedLaunchPlayNow: (teamId: string) => void;
  onNotify: (msg: string) => void;
}

type CapTab = 'VITALS' | 'ATTRIBUTES' | 'BADGES' | 'HOT_ZONES';

const POSITIONS: PlayerPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const HAIR_STYLES: HairStyle[] = [
  'FADE',
  'BUZZ',
  'SHORT',
  'BRAIDS',
  'DREADS',
  'AFRO',
  'PONYTAIL',
  'BALD',
];
const SLEEVE_OPTS: ArmSleeveOption[] = ['NONE', 'LEFT', 'RIGHT', 'BOTH'];
const SKIN_TONES = ['#f2cbb6', '#dfa883', '#c68657', '#9c623d', '#734529', '#522f1c'];
const HAIR_COLORS = ['#171717', '#451a03', '#a16207', '#dc2626', '#f8fafc', '#38bdf8'];
const SHOE_COLORS = ['#e11d48', '#f59e0b', '#38bdf8', '#f8fafc', '#22c55e', '#a855f7'];
const BADGE_CATS: BadgeCategory[] = ['SHOOTING', 'PLAYMAKING', 'FINISHING', 'DEFENSE'];

const ARCHETYPE_PRESETS: Array<{
  label: string;
  pos: PlayerPosition;
  style: PlayerStylePreset;
  height: number;
  weight: number;
  ovr: number;
}> = [
  { label: '3-Level Superstar', pos: 'SF', style: 'SUPERSTAR_WING', height: 80, weight: 225, ovr: 92 },
  { label: 'Floor General PG', pos: 'PG', style: 'ELITE_PG', height: 75, weight: 192, ovr: 90 },
  { label: 'Pure Sharpshooter', pos: 'SG', style: 'SHARPSHOOTER', height: 77, weight: 204, ovr: 89 },
  { label: 'Lockdown 3 & D', pos: 'SF', style: 'TWO_WAY_WING', height: 79, weight: 218, ovr: 88 },
  { label: 'Stretch Glass Big', pos: 'PF', style: 'STRETCH_BIG', height: 83, weight: 242, ovr: 89 },
  { label: 'Point Center', pos: 'C', style: 'POINT_CENTER', height: 84, weight: 262, ovr: 91 },
];

function cycleTier(cur?: BadgeTier): BadgeTier | undefined {
  if (!cur) return 'BRONZE';
  const idx = BADGE_TIERS.indexOf(cur);
  if (idx === -1 || idx === BADGE_TIERS.length - 1) return undefined;
  return BADGE_TIERS[idx + 1];
}

function buildInitialDraft(): PlayerProfile {
  return makePlayer({
    id: `cap_${Date.now()}`,
    name: 'MP Prodigy',
    jerseyNumber: 26,
    position: 'SG',
    ovr: 90,
    era: '2K26',
    style: 'SUPERSTAR_WING',
    heightInches: 78,
    weightLbs: 214,
    wingspanInches: 83,
  });
}

export const CreateAPlayer: React.FC<CreateAPlayerProps> = ({
  eraMode,
  initialTeamId,
  onBack,
  onSavedOpenRoster,
  onSavedLaunchPlayNow,
  onNotify,
}) => {
  const snap = useRosterStore();
  const [draft, setDraft] = useState<PlayerProfile>(() => buildInitialDraft());
  const [tab, setTab] = useState<CapTab>('VITALS');
  const [badgeCat, setBadgeCat] = useState<BadgeCategory>('SHOOTING');
  const [assignTeamId, setAssignTeamId] = useState<string>(initialTeamId || '2k26_okc');
  const [insertAsStarter, setInsertAsStarter] = useState(true);

  const assignedTeam = useMemo(
    () =>
      assignTeamId === 'FREE_AGENTS'
        ? null
        : snap.teams.find((t) => t.id === assignTeamId) ?? snap.teams[0],
    [snap.teams, assignTeamId]
  );

  const liveOvr = useMemo(
    () => computePlayerOvr(draft.attributes, draft.position),
    [draft.attributes, draft.position]
  );
  const liveArchetype = useMemo(
    () => deriveArchetype(draft.attributes, draft.position),
    [draft.attributes, draft.position]
  );

  const applyPreset = (preset: (typeof ARCHETYPE_PRESETS)[number]) => {
    HybridAudioEngine.playUi('switch', eraMode);
    const next = makePlayer({
      id: draft.id,
      name: draft.name,
      jerseyNumber: draft.jerseyNumber,
      position: preset.pos,
      ovr: preset.ovr,
      era: assignedTeam?.era ?? '2K26',
      style: preset.style,
      heightInches: preset.height,
      weightLbs: preset.weight,
      wingspanInches: preset.height + 4,
      appearance: draft.appearance,
    });
    setDraft(next);
  };

  const setAttr = (key: AttributeKey, val: number) => {
    setDraft((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [key]: val },
    }));
  };

  const setHotZone = (key: HotZoneKey, val: HotZoneValue) => {
    HybridAudioEngine.playUi('click', eraMode);
    setDraft((prev) => ({
      ...prev,
      hotZones: { ...prev.hotZones, [key]: val },
    }));
  };

  const toggleBadge = (id: BadgeId) => {
    HybridAudioEngine.playUi('click', eraMode);
    setDraft((prev) => {
      const next = { ...prev.badges };
      const nt = cycleTier(next[id]);
      if (nt) next[id] = nt;
      else delete next[id];
      return { ...prev, badges: next };
    });
  };

  const handleSave = (goToPlayNow: boolean) => {
    const cleanName = draft.name.trim() || 'MP Prodigy';
    const finalPlayer: PlayerProfile = {
      ...draft,
      id: `cap_${Date.now()}_${Math.floor(Math.random() * 999)}`,
      name: cleanName,
      era: assignedTeam?.era ?? '2K26',
      ovr: liveOvr,
      archetype: liveArchetype,
      isCreated: true,
    };
    RosterStore.addCreatedPlayer(finalPlayer, assignTeamId, insertAsStarter);
    HybridAudioEngine.playGreenRelease();
    const targetLabel = assignedTeam
      ? `${assignedTeam.city} ${assignedTeam.name}`
      : 'Free Agents Pool';
    onNotify(`${cleanName} (${liveOvr} OVR) created and added to ${targetLabel}!`);

    if (goToPlayNow && assignedTeam) {
      onSavedLaunchPlayNow(assignedTeam.id);
    } else {
      onSavedOpenRoster(assignedTeam ? assignedTeam.id : '2k26_okc');
    }
  };

  const jerseyPrimary = assignedTeam?.colors.primary ?? '#e11d48';
  const jerseyAccent = assignedTeam?.colors.accent ?? '#f59e0b';
  const badgeEntries = Object.entries(draft.badges) as Array<[BadgeId, BadgeTier]>;

  return (
    <div className="h2k-cap-screen">
      {/* Header */}
      <header className="h2k-subscreen-header">
        <div className="h2k-subscreen-left">
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => {
              HybridAudioEngine.playUi('back', eraMode);
              onBack();
            }}
          >
            ◀ BACK
          </button>
          <div>
            <div className="h2k-kicker">STANDALONE 2K14 + 2K26 PLAYER BUILDER</div>
            <h2>CREATE-A-PLAYER STUDIO</h2>
          </div>
        </div>

        <div className="h2k-subscreen-right h2k-roster-head-actions">
          <button
            type="button"
            className="h2k-btn-ghost"
            onClick={() => handleSave(false)}
          >
            💾 SAVE TO ROSTER
          </button>
          <button
            type="button"
            className="h2k-btn-accent"
            onClick={() => handleSave(true)}
          >
            🏀 SAVE & LAUNCH IN PLAY NOW
          </button>
        </div>
      </header>

      {/* Main Split: Left Live Player Card Preview | Right 4-Tab Editor */}
      <div className="h2k-cap-workspace">
        {/* LEFT PREVIEW COLUMN */}
        <aside className="h2k-cap-preview-col">
          <div
            className="h2k-cap-card"
            style={{
              borderColor: jerseyAccent,
              background: `linear-gradient(155deg, ${jerseyPrimary}55 0%, rgba(10,14,24,0.96) 65%)`,
            }}
          >
            <div className="h2k-cap-card-top">
              <div>
                <span className="h2k-pos-pill starter">{draft.position}</span>
                <span className="h2k-cap-jersey-tag">#{draft.jerseyNumber}</span>
              </div>
              <div className="h2k-ovr-badge-lg">
                <span>OVR</span>
                <strong>{liveOvr}</strong>
              </div>
            </div>

            {/* Procedural SVG Player Bust & Jersey */}
            <svg
              viewBox="0 0 180 175"
              className="h2k-cap-avatar-svg"
              role="img"
              aria-label="Created player visual preview"
            >
              {/* Background Spotlight */}
              <circle cx="90" cy="78" r="68" fill={jerseyPrimary} fillOpacity="0.22" />
              {/* Arms & Optional Arm Sleeves */}
              <rect
                x="32"
                y="98"
                width="20"
                height="62"
                rx="9"
                fill={
                  draft.appearance.armSleeve === 'LEFT' || draft.appearance.armSleeve === 'BOTH'
                    ? jerseyAccent
                    : draft.appearance.skinTone
                }
              />
              <rect
                x="128"
                y="98"
                width="20"
                height="62"
                rx="9"
                fill={
                  draft.appearance.armSleeve === 'RIGHT' || draft.appearance.armSleeve === 'BOTH'
                    ? jerseyAccent
                    : draft.appearance.skinTone
                }
              />
              {/* Jersey Torso */}
              <path
                d="M52 94 L68 86 H112 L128 94 L124 170 H56 Z"
                fill={jerseyPrimary}
                stroke={jerseyAccent}
                strokeWidth="3"
              />
              {/* Jersey Number */}
              <text
                x="90"
                y="142"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="36"
                fontWeight="900"
                fontFamily="Impact, Arial Black, sans-serif"
              >
                {draft.jerseyNumber}
              </text>
              {/* Neck */}
              <rect x="78" y="70" width="24" height="20" rx="6" fill={draft.appearance.skinTone} />
              {/* Head */}
              <circle cx="90" cy="52" r="24" fill={draft.appearance.skinTone} />
              {/* Hair styles */}
              {draft.appearance.hairStyle !== 'BALD' && (
                <path
                  d={
                    draft.appearance.hairStyle === 'AFRO'
                      ? 'M60 48 C58 14 122 14 120 48 C110 38 70 38 60 48 Z'
                      : draft.appearance.hairStyle === 'DREADS' ||
                          draft.appearance.hairStyle === 'BRAIDS'
                        ? 'M64 46 C64 20 116 20 116 46 L120 66 H110 L108 44 H72 L70 66 H60 Z'
                        : 'M66 46 C68 22 112 22 114 46 C104 38 76 38 66 46 Z'
                  }
                  fill={draft.appearance.hairColor}
                />
              )}
              {/* Optional Headband */}
              {draft.appearance.headband && (
                <rect x="65" y="38" width="50" height="7" rx="3" fill={jerseyAccent} />
              )}
              {/* Shoe color accent bar */}
              <rect x="64" y="164" width="52" height="6" rx="3" fill={draft.appearance.shoeColor} />
            </svg>

            <h3 className="h2k-cap-card-name">{draft.name || 'Unnamed Player'}</h3>
            <div className="h2k-archetype-line">{liveArchetype}</div>

            <div className="h2k-cap-vitals-strip">
              <span>{formatHeightFeetInches(draft.heightInches)}</span>
              <span>{draft.weightLbs} lbs</span>
              <span>WS {formatHeightFeetInches(draft.wingspanInches)}</span>
            </div>

            <div className="h2k-cap-key-ratings">
              <div>
                <span>3PT</span>
                <strong>{draft.attributes.threePt}</strong>
              </div>
              <div>
                <span>DNK</span>
                <strong>{draft.attributes.drivingDunk}</strong>
              </div>
              <div>
                <span>HDL</span>
                <strong>{draft.attributes.ballHandle}</strong>
              </div>
              <div>
                <span>SPD</span>
                <strong>{draft.attributes.speed}</strong>
              </div>
              <div>
                <span>DEF</span>
                <strong>{draft.attributes.perimeterDef}</strong>
              </div>
            </div>

            {badgeEntries.length > 0 && (
              <div className="h2k-cap-badge-preview">
                {badgeEntries.slice(0, 6).map(([bid, tier]) => {
                  const meta = BADGE_CATALOG.find((b) => b.id === bid);
                  return (
                    <span key={bid} className={`h2k-badge-mini tier-${tier.toLowerCase()}`}>
                      {meta?.name ?? bid} · {tier}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Destination Team Assignment Box */}
          <div className="h2k-cap-assign-box">
            <div className="h2k-kicker">ROSTER ASSIGNMENT (ALL 72 TEAMS + FREE AGENTS)</div>
            <select
              className="h2k-select"
              value={assignTeamId}
              onChange={(e) => setAssignTeamId(e.target.value)}
              aria-label="Assign created player to team"
            >
              <option value="FREE_AGENTS">Free Agents Pool (Unassigned)</option>
              {snap.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.city} {t.name} ({t.era} · OVR {t.ovr})
                </option>
              ))}
            </select>
            {assignTeamId !== 'FREE_AGENTS' && (
              <label className="h2k-check-row">
                <input
                  type="checkbox"
                  checked={insertAsStarter}
                  onChange={(e) => setInsertAsStarter(e.target.checked)}
                />
                <span>Insert directly into Starting 5 ({draft.position} slot)</span>
              </label>
            )}
          </div>
        </aside>

        {/* RIGHT 4-TAB BUILDER COLUMN */}
        <section className="h2k-cap-editor-col">
          {/* Quick Archetype Presets */}
          <div className="h2k-cap-presets-row">
            <span className="h2k-kicker">PRESETS:</span>
            {ARCHETYPE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className="h2k-mini-pill"
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="h2k-inspector-tabs">
            {(
              [
                ['VITALS', '1. VITALS & GEAR'],
                ['ATTRIBUTES', '2. 18 ATTRIBUTES'],
                ['BADGES', `3. 25 BADGES (${badgeEntries.length})`],
                ['HOT_ZONES', '4. 9 HOT ZONES'],
              ] as Array<[CapTab, string]>
            ).map(([tId, label]) => (
              <button
                key={tId}
                type="button"
                className={`h2k-modal-tab ${tab === tId ? 'active' : ''}`}
                onClick={() => {
                  HybridAudioEngine.playUi('click', eraMode);
                  setTab(tId);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h2k-cap-tab-body">
            {tab === 'VITALS' && (
              <div className="h2k-form-grid">
                <div className="h2k-two-col-mini">
                  <label className="h2k-form-row">
                    <span>Player Full Name</span>
                    <input
                      className="h2k-input"
                      value={draft.name}
                      maxLength={28}
                      onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>Jersey Number (0-99)</span>
                    <input
                      type="number"
                      className="h2k-input"
                      min={0}
                      max={99}
                      value={draft.jerseyNumber}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          jerseyNumber: Math.max(0, Math.min(99, Number(e.target.value) || 0)),
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="h2k-form-row">
                  <span>Position</span>
                  <div className="h2k-seg-group">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        className={`h2k-seg-btn ${draft.position === pos ? 'active' : ''}`}
                        onClick={() => setDraft((p) => ({ ...p, position: pos }))}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h2k-three-col-mini">
                  <label className="h2k-form-row">
                    <span>Height ({formatHeightFeetInches(draft.heightInches)})</span>
                    <input
                      type="range"
                      min={69}
                      max={88}
                      value={draft.heightInches}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, heightInches: Number(e.target.value) }))
                      }
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>Weight ({draft.weightLbs} lbs)</span>
                    <input
                      type="range"
                      min={155}
                      max={315}
                      value={draft.weightLbs}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, weightLbs: Number(e.target.value) }))
                      }
                    />
                  </label>
                  <label className="h2k-form-row">
                    <span>Wingspan ({formatHeightFeetInches(draft.wingspanInches)})</span>
                    <input
                      type="range"
                      min={70}
                      max={96}
                      value={draft.wingspanInches}
                      onChange={(e) =>
                        setDraft((p) => ({ ...p, wingspanInches: Number(e.target.value) }))
                      }
                    />
                  </label>
                </div>

                <div className="h2k-two-col-mini">
                  <label className="h2k-form-row">
                    <span>Hairstyle</span>
                    <select
                      className="h2k-select"
                      value={draft.appearance.hairStyle}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          appearance: { ...p.appearance, hairStyle: e.target.value as HairStyle },
                        }))
                      }
                    >
                      {HAIR_STYLES.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="h2k-form-row">
                    <span>Arm Sleeve</span>
                    <select
                      className="h2k-select"
                      value={draft.appearance.armSleeve}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          appearance: {
                            ...p.appearance,
                            armSleeve: e.target.value as ArmSleeveOption,
                          },
                        }))
                      }
                    >
                      {SLEEVE_OPTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="h2k-swatch-row">
                  <span>Skin Tone</span>
                  <div className="h2k-swatches">
                    {SKIN_TONES.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`h2k-swatch ${draft.appearance.skinTone === hex ? 'active' : ''}`}
                        style={{ backgroundColor: hex }}
                        onClick={() =>
                          setDraft((p) => ({ ...p, appearance: { ...p.appearance, skinTone: hex } }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="h2k-swatch-row">
                  <span>Hair Color</span>
                  <div className="h2k-swatches">
                    {HAIR_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`h2k-swatch ${draft.appearance.hairColor === hex ? 'active' : ''}`}
                        style={{ backgroundColor: hex }}
                        onClick={() =>
                          setDraft((p) => ({ ...p, appearance: { ...p.appearance, hairColor: hex } }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="h2k-swatch-row">
                  <span>Sneaker Colorway</span>
                  <div className="h2k-swatches">
                    {SHOE_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        className={`h2k-swatch ${draft.appearance.shoeColor === hex ? 'active' : ''}`}
                        style={{ backgroundColor: hex }}
                        onClick={() =>
                          setDraft((p) => ({ ...p, appearance: { ...p.appearance, shoeColor: hex } }))
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="h2k-two-col-mini">
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={draft.appearance.headband}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          appearance: { ...p.appearance, headband: e.target.checked },
                        }))
                      }
                    />
                    <span>Headband</span>
                  </label>
                  <label className="h2k-check-row">
                    <input
                      type="checkbox"
                      checked={draft.appearance.legCompression}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          appearance: { ...p.appearance, legCompression: e.target.checked },
                        }))
                      }
                    />
                    <span>Leg Compression Tights</span>
                  </label>
                </div>

                <label className="h2k-form-row">
                  <span>Jumpshot Release Speed ({draft.jumpshotSpeed.toFixed(2)}s — Lower is Faster)</span>
                  <input
                    type="range"
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    value={draft.jumpshotSpeed}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, jumpshotSpeed: Number(e.target.value) }))
                    }
                  />
                </label>
              </div>
            )}

            {tab === 'ATTRIBUTES' && (
              <div className="h2k-attr-editor-grid">
                {ATTRIBUTE_META.map((meta) => {
                  const val = draft.attributes[meta.key];
                  const barColor =
                    val >= 90 ? '#22c55e' : val >= 80 ? '#f59e0b' : val >= 70 ? '#38bdf8' : '#94a3b8';
                  return (
                    <label key={meta.key} className="h2k-attr-slider-row">
                      <div className="h2k-attr-slider-top">
                        <span>{meta.label}</span>
                        <strong style={{ color: barColor }}>{val}</strong>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={99}
                        value={val}
                        onChange={(e) => setAttr(meta.key, Number(e.target.value))}
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {tab === 'BADGES' && (
              <div className="h2k-badges-panel">
                <div className="h2k-badge-cat-tabs">
                  {BADGE_CATS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`h2k-mini-pill ${badgeCat === cat ? 'active' : ''}`}
                      onClick={() => setBadgeCat(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <p className="h2k-hint-text">
                  Click any badge to cycle tier: OFF → Bronze → Silver → Gold → HOF → Legend.
                </p>
                <div className="h2k-badge-grid">
                  {BADGE_CATALOG.filter((b) => b.category === badgeCat).map((badge) => {
                    const tier = draft.badges[badge.id];
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        className={`h2k-badge-card ${tier ? `tier-${tier.toLowerCase()}` : 'tier-none'}`}
                        onClick={() => toggleBadge(badge.id)}
                      >
                        <div className="h2k-badge-card-top">
                          <strong>{badge.name}</strong>
                          <span className="h2k-badge-tier-tag">{tier ?? 'OFF'}</span>
                        </div>
                        <p>{badge.shortDesc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === 'HOT_ZONES' && (
              <div className="h2k-hz-panel">
                <HotZoneCourtSVG
                  zones={draft.hotZones}
                  interactive
                  onToggleZone={setHotZone}
                />
                <div className="h2k-hz-quick-row">
                  <button
                    type="button"
                    className="h2k-mini-pill"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        hotZones: {
                          leftCorner3: 1,
                          leftWing3: 1,
                          topKey3: 1,
                          rightWing3: 1,
                          rightCorner3: 1,
                          leftMid: 1,
                          topMid: 1,
                          rightMid: 1,
                          paint: 1,
                        },
                      }))
                    }
                  >
                    SET ALL HOT 🔥
                  </button>
                  <button
                    type="button"
                    className="h2k-mini-pill"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        hotZones: {
                          leftCorner3: 0,
                          leftWing3: 0,
                          topKey3: 0,
                          rightWing3: 0,
                          rightCorner3: 0,
                          leftMid: 0,
                          topMid: 0,
                          rightMid: 0,
                          paint: 0,
                        },
                      }))
                    }
                  >
                    RESET NEUTRAL
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
