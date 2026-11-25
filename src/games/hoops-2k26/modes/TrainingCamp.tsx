// ============================================================================
// PART 6 — TRAINING CAMP & FREESTYLE SHOOTAROUND
// Features:
// - Open Court Freestyle Shootaround (pick team or MyPLAYER)
// - 6 Interactive Guided Skill Drills with real-time live objectives in 3D,
//   Bronze / Silver / Gold medals, and VC rewards!
// ============================================================================

import React, { useMemo, useState } from 'react';
import { RosterStore } from '../hybrid/rosterStore';
import { useUltimateHybridStore } from '../hybrid/store';
import { HybridAudioEngine } from '../hybrid/audioEngine';
import type { UIEraMode } from '../hybrid/types';
import {
  buildToPlayerProfile,
  ModesStore,
  useModesStore,
} from './modesStore';
import {
  TRAINING_DRILLS,
  type DrillMedal,
  type SkillDrillDef,
} from './modesTypes';
import './modesHud.css';

export interface TrainingCampProps {
  eraMode: UIEraMode;
  onBack: () => void;
  onNotify: (msg: string) => void;
}

const MEDAL_COLOR: Record<DrillMedal, string> = {
  NONE: '#64748b',
  BRONZE: '#d97706',
  SILVER: '#cbd5e1',
  GOLD: '#fbbf24',
};

export const TrainingCamp: React.FC<TrainingCampProps> = ({
  eraMode,
  onBack,
  onNotify,
}) => {
  const hybridSave = useUltimateHybridStore();
  const modes = useModesStore();
  const activeBuild = modes.buildSlots[modes.activeBuildSlotIndex] ?? modes.buildSlots[0];
  const [useMyPlayer, setUseMyPlayer] = useState(true);
  const [freestyleTeamId, setFreestyleTeamId] = useState('2k26_okc');

  const teams = useMemo(
    () => RosterStore.getAllTeams().filter((t) => t.era === '2K26' || t.era === '2K14'),
    []
  );

  const goldCount = useMemo(
    () => TRAINING_DRILLS.filter((d) => modes.drillMedals[d.id] === 'GOLD').length,
    [modes.drillMedals]
  );

  const getPracticeRoster = () => {
    const base = RosterStore.getTeamById(freestyleTeamId).roster;
    if (!useMyPlayer) return undefined;
    return [buildToPlayerProfile(activeBuild), ...base.slice(1, 6)];
  };

  const launchFreestyle = () => {
    HybridAudioEngine.playUi('confirm', eraMode);
    ModesStore.launchModeMatch({
      kind: 'TRAINING_FREESTYLE',
      title: 'Training Camp · Open Court Freestyle',
      subtitle: useMyPlayer
        ? `Practicing with ${activeBuild.name} (${activeBuild.ovr} OVR)`
        : `Team Shootaround`,
      returnScreen: 'LEARN_2K',
      matchPatch: {
        homeTeamId: freestyleTeamId,
        awayTeamId: '2k14_mia',
        venue: 'ARENA_2K26',
        playersPerSide: 1,
        targetScore: null,
        quarterLengthMin: 12,
        difficulty: 'Rookie',
        sideControl: 'HOME',
        modeLabel: 'Open Court Freestyle',
      },
      customHomeRoster: getPracticeRoster(),
      objectiveBanner: 'Freestyle Shootaround · Practice Rhythm Shooting, Euro-Steps & Dribble Chains!',
      baseVcReward: 250,
    });
  };

  const launchSkillDrill = (drill: SkillDrillDef) => {
    HybridAudioEngine.playUi('confirm', eraMode);
    const pCount =
      drill.id === 'DRILL_PNR_PLAYVISION' || drill.id === 'DRILL_ALLEY_OOP' ? 3 : 1;
    onNotify(`Starting ${drill.title} — Gold Target: ${drill.goldTarget} ${drill.metricLabel}`);
    ModesStore.launchModeMatch({
      kind: 'TRAINING_DRILL',
      title: drill.title,
      subtitle: drill.description,
      returnScreen: 'LEARN_2K',
      matchPatch: {
        homeTeamId: freestyleTeamId,
        awayTeamId: '2k26_bos',
        venue: 'ARENA_2K26',
        playersPerSide: pCount,
        targetScore: null,
        quarterLengthMin: 2,
        difficulty: drill.id === 'DRILL_LOCKDOWN_REBOUND' ? 'All-Star' : 'Pro',
        sideControl: 'HOME',
        modeLabel: drill.title,
      },
      startQuarter: 4,
      startClockSec: drill.durationSec,
      startHomeScore: 0,
      startAwayScore: 0,
      customHomeRoster: getPracticeRoster(),
      trainingDrillId: drill.id,
      objectiveBanner: `${drill.title} · ${drill.controlHint} · Gold: ${drill.goldTarget} ${drill.metricLabel}`,
      baseVcReward: drill.vcGoldReward,
    });
  };

  return (
    <div className="h2k-mode-root">
      <header className="h2k-mode-topbar">
        <div className="h2k-mode-top-left">
          <button type="button" className="h2k-mode-btn" onClick={onBack}>
            ← Main Menu
          </button>
          <div>
            <h2 className="h2k-mode-title">TRAINING CAMP &amp; ProPLAY™ LAB</h2>
            <div className="h2k-mode-submeta">
              Open Freestyle Shootaround · 6 Guided Skill Drills · Gold Medals {goldCount}/6 🥇
            </div>
          </div>
        </div>
        <div className="h2k-mode-top-right">
          <span className="h2k-wallet-vc h2k-tabular" style={{ fontWeight: 700, fontSize: 13 }}>
            VC {hybridSave.currencies.vc.toLocaleString()}
          </span>
        </div>
      </header>

      <div className="h2k-mode-scroll">
        {/* Open Court Freestyle Banner */}
        <div
          className="h2k-card"
          style={{
            marginBottom: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 14,
            borderColor: 'rgba(6, 182, 212, 0.45)',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px', fontFamily: 'Oswald, sans-serif', fontSize: 22 }}>
              Open Court Freestyle Shootaround
            </h3>
            <p className="h2k-muted" style={{ margin: 0 }}>
              Master your jumpshot visual cue, Rhythm Shooting flicks, Slow-Mo Euro-Steps, and PlayVision sets with zero pressure.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`h2k-mode-btn ${useMyPlayer ? 'emerald' : ''}`}
              onClick={() => setUseMyPlayer((v) => !v)}
            >
              {useMyPlayer ? `Using MyPLAYER: ${activeBuild.name}` : 'Using NBA Roster Star'}
            </button>
            <select
              className="h2k-select"
              value={freestyleTeamId}
              onChange={(e) => setFreestyleTeamId(e.target.value)}
              style={{ minHeight: 38 }}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.abbr} · {t.city} {t.name}
                </option>
              ))}
            </select>
            <button type="button" className="h2k-mode-btn cyan" onClick={launchFreestyle}>
              🏀 Enter Freestyle Gym
            </button>
          </div>
        </div>

        {/* 6 Interactive Guided Skill Drills */}
        <div className="h2k-section-head">
          <h3>6 Interactive Guided Skill Drills (Bronze / Silver / Gold Medals)</h3>
        </div>
        <div className="h2k-grid-3">
          {TRAINING_DRILLS.map((drill) => {
            const medal = modes.drillMedals[drill.id] ?? 'NONE';
            const best = modes.drillBestScores[drill.id] ?? 0;
            return (
              <article
                key={drill.id}
                className="h2k-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>
                      {drill.category}
                    </span>
                    <strong style={{ fontSize: 12, color: MEDAL_COLOR[medal] }}>
                      {medal === 'NONE' ? 'NO MEDAL' : `🏅 ${medal}`}
                    </strong>
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontFamily: 'Oswald, sans-serif', fontSize: 19 }}>
                    {drill.title}
                  </h3>
                  <p className="h2k-muted" style={{ margin: '0 0 10px' }}>
                    {drill.description}
                  </p>
                  <div
                    style={{
                      padding: 9,
                      borderRadius: 8,
                      background: 'rgba(11, 17, 30, 0.85)',
                      fontSize: 11,
                      color: '#cbd5e1',
                      marginBottom: 8,
                    }}
                  >
                    <strong>Controls:</strong> {drill.controlHint}
                  </div>
                  <div className="h2k-muted h2k-tabular">
                    Bronze {drill.bronzeTarget} · Silver {drill.silverTarget} · Gold{' '}
                    <strong style={{ color: '#fbbf24' }}>{drill.goldTarget}</strong> ({drill.metricLabel}) · Best: {best} · Gold Reward{' '}
                    <strong style={{ color: '#fbbf24' }}>+{drill.vcGoldReward} VC</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="h2k-mode-btn primary"
                  style={{ width: '100%' }}
                  onClick={() => launchSkillDrill(drill)}
                >
                  Launch 3D Drill ({drill.durationSec}s)
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
