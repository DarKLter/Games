import React, { useState } from 'react';
import { Award, CheckCircle2, Download, Shield, Target, Upload, User, X } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { ACHIEVEMENTS_25, ALL_HOT_ZONE_IDS, HOT_ZONE_LABELS, getParkRepTier } from '../data/modesData';
import { NBA_TEAMS } from '../data/rosters';
import { createDefaultSaveData } from '../storage';
import type { HotZoneId, Nba2k14SaveData } from '../types';

interface VipNavDrawerProps {
  open: boolean;
  save: Nba2k14SaveData;
  onClose: () => void;
  onUpdateSave: (updater: (prev: Nba2k14SaveData) => Nba2k14SaveData) => void;
}

const HOT_ZONE_COORDS: Record<HotZoneId, { x: number; y: number; r: number }> = {
  restricted: { x: 160, y: 48, r: 16 },
  paint: { x: 160, y: 84, r: 16 },
  paint_l: { x: 122, y: 78, r: 14 },
  paint_r: { x: 198, y: 78, r: 14 },
  mid_l_base: { x: 74, y: 48, r: 15 },
  mid_r_base: { x: 246, y: 48, r: 15 },
  mid_l_wing: { x: 88, y: 112, r: 16 },
  mid_r_wing: { x: 232, y: 112, r: 16 },
  mid_top: { x: 160, y: 132, r: 16 },
  three_l_corner: { x: 28, y: 46, r: 15 },
  three_r_corner: { x: 292, y: 46, r: 15 },
  three_l_wing: { x: 52, y: 142, r: 17 },
  three_r_wing: { x: 268, y: 142, r: 17 },
  three_top: { x: 160, y: 178, r: 18 },
};

export const VipNavDrawer: React.FC<VipNavDrawerProps> = ({
  open,
  save,
  onClose,
  onUpdateSave,
}) => {
  const [tab, setTab] = useState<'overview' | 'radar' | 'hotzones' | 'trophies' | 'save'>('overview');
  const [selectedZone, setSelectedZone] = useState<HotZoneId>('three_top');
  const [importText, setImportText] = useState('');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  if (!open) return null;

  const { vip } = save;
  const winPct = vip.gamesPlayed > 0 ? Math.round((vip.wins / vip.gamesPlayed) * 100) : 0;
  const avgPts = vip.gamesPlayed > 0 ? (vip.totalPoints / vip.gamesPlayed).toFixed(1) : '0.0';
  const avgAst = vip.gamesPlayed > 0 ? (vip.totalAst / vip.gamesPlayed).toFixed(1) : '0.0';
  const avgReb = vip.gamesPlayed > 0 ? (vip.totalReb / vip.gamesPlayed).toFixed(1) : '0.0';
  const greenPct = vip.totalShots > 0 ? Math.round((vip.excellentReleases / vip.totalShots) * 100) : 0;

  // 6-axis radar stats (0..100)
  const insidePct = vip.insideAtt > 0 ? Math.round((vip.insideMade / vip.insideAtt) * 100) : 58;
  const midPct = vip.midAtt > 0 ? Math.round((vip.midMade / vip.midAtt) * 100) : 45;
  const threePct = vip.threeAtt > 0 ? Math.round((vip.threeMade / vip.threeAtt) * 100) : 39;
  const radarAxes = [
    { label: 'Inside', val: insidePct },
    { label: 'Mid-Range', val: midPct },
    { label: '3PT%', val: Math.min(100, threePct * 1.4) },
    { label: 'Green Rel', val: Math.max(25, greenPct) },
    { label: 'Fastbreak', val: Math.min(100, 35 + vip.fastbreakPts) },
    { label: 'Win %', val: Math.max(30, winPct) },
  ];

  const radarPoints = radarAxes
    .map((ax, i) => {
      const ang = (Math.PI * 2 * i) / radarAxes.length - Math.PI / 2;
      const r = (ax.val / 100) * 78;
      return `${110 + Math.cos(ang) * r},${110 + Math.sin(ang) * r}`;
    })
    .join(' ');

  const getZoneFill = (id: HotZoneId) => {
    const rec = vip.hotZones[id] ?? { made: 0, att: 0 };
    if (rec.att < 2) return '#3f4654';
    const pct = rec.made / rec.att;
    const isThree = id.startsWith('three');
    const hotThreshold = isThree ? 0.4 : 0.52;
    const coldThreshold = isThree ? 0.25 : 0.35;
    if (pct >= hotThreshold) return '#CE1141';
    if (pct <= coldThreshold) return '#2563EB';
    return '#6b7280';
  };

  const handleExportSave = () => {
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nba2k14_vip_${vip.name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveMsg('Exported VIP Save JSON file.');
  };

  const handleImportSave = () => {
    try {
      const parsed = JSON.parse(importText) as Nba2k14SaveData;
      if (!parsed.vip || !parsed.settings) throw new Error('Invalid');
      onUpdateSave(() => parsed);
      setSaveMsg('Successfully imported VIP Save JSON!');
      setImportText('');
    } catch {
      setSaveMsg('Invalid JSON format. Paste a valid exported NBA 2K14 save.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex justify-end">
      <div className="w-full max-w-2xl h-full bg-[#0d0f14] border-l border-white/15 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-white/15 flex items-center justify-between bg-[#13161e]">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F9A01B]">2K NAV · VIP SYSTEM</div>
            <h2 className="text-xl font-black text-white uppercase">{vip.name} · VIP PROFILE</h2>
          </div>
          <button
            onClick={() => {
              Nba2k14Audio.playUiClick('back');
              onClose();
            }}
            className="p-2 rounded-lg bg-[#1c202a] hover:bg-[#2a3040] text-zinc-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="px-5 py-2.5 border-b border-white/10 flex flex-wrap gap-1.5 bg-[#10131a]">
          {(
            [
              { id: 'overview', label: 'VIP Overview', icon: User },
              { id: 'radar', label: 'Tendencies', icon: Shield },
              { id: 'hotzones', label: '14-Zone Chart', icon: Target },
              { id: 'trophies', label: `Trophies (${vip.unlockedAchievements.length}/25)`, icon: Award },
              { id: 'save', label: 'Save Manager', icon: Download },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  Nba2k14Audio.playUiClick('back');
                  setTab(t.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer ${
                  tab === t.id ? 'bg-[#CE1141] text-white' : 'bg-[#171a22] text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400">VIP Display Name</label>
                  <input
                    value={vip.name}
                    onChange={(e) =>
                      onUpdateSave((prev) => ({
                        ...prev,
                        vip: { ...prev.vip, name: e.target.value.slice(0, 18) },
                      }))
                    }
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-black text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Favorite Franchise Crest</label>
                  <select
                    value={vip.favTeamId}
                    onChange={(e) => {
                      const team = NBA_TEAMS.find((t) => t.id === e.target.value);
                      onUpdateSave((prev) => ({
                        ...prev,
                        vip: {
                          ...prev.vip,
                          favTeamId: e.target.value,
                          avatarCrest: team?.code ?? 'MIA',
                        },
                      }));
                    }}
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    {NBA_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.code} · {t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Record', val: `${vip.wins}W - ${vip.losses}L` },
                  { label: 'Win %', val: `${winPct}%` },
                  { label: 'Best Streak', val: `${vip.bestWinStreak}W` },
                  { label: 'Virtual Currency', val: `${vip.vc.toLocaleString()} VC`, gold: true },
                  { label: 'Skill Points', val: `${vip.sp.toLocaleString()} SP` },
                  { label: 'MyTEAM Points', val: `${vip.mt.toLocaleString()} MT` },
                  { label: 'Avg PPG', val: avgPts },
                  { label: 'Avg RPG / APG', val: `${avgReb} / ${avgAst}` },
                  { label: 'Park REP Tier', val: getParkRepTier(vip.parkRep), gold: true },
                ].map((c) => (
                  <div key={c.label} className="bg-[#151820] border border-white/10 rounded-xl p-3">
                    <div className="text-[10px] uppercase text-zinc-400 font-bold">{c.label}</div>
                    <div className={`text-base font-black mt-0.5 ${c.gold ? 'text-[#F9A01B]' : 'text-white'}`}>{c.val}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'radar' && (
            <div className="bg-[#151820] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
              <svg viewBox="0 0 220 220" className="w-56 h-56 shrink-0">
                {[25, 50, 75, 100].map((ring) => (
                  <circle
                    key={ring}
                    cx={110}
                    cy={110}
                    r={(ring / 100) * 78}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={1}
                  />
                ))}
                {radarAxes.map((ax, i) => {
                  const ang = (Math.PI * 2 * i) / radarAxes.length - Math.PI / 2;
                  const lx = 110 + Math.cos(ang) * 95;
                  const ly = 110 + Math.sin(ang) * 95;
                  return (
                    <g key={ax.label}>
                      <line
                        x1={110}
                        y1={110}
                        x2={110 + Math.cos(ang) * 78}
                        y2={110 + Math.sin(ang) * 78}
                        stroke="rgba(255,255,255,0.12)"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#e4e4e7"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {ax.label}
                      </text>
                    </g>
                  );
                })}
                <polygon
                  points={radarPoints}
                  fill="rgba(206, 17, 65, 0.35)"
                  stroke="#F9A01B"
                  strokeWidth={2}
                />
              </svg>
              <div className="flex-1 space-y-2 w-full text-xs">
                <div className="text-xs font-black uppercase text-[#F9A01B] mb-2">User Shooting & Tendency Breakdown</div>
                {[
                  { label: 'Inside FG%', val: `${vip.insideMade}/${vip.insideAtt} (${insidePct}%)` },
                  { label: 'Mid-Range FG%', val: `${vip.midMade}/${vip.midAtt} (${midPct}%)` },
                  { label: '3PT FG%', val: `${vip.threeMade}/${vip.threeAtt} (${threePct}%)` },
                  { label: 'Excellent Green Release %', val: `${greenPct}% (${vip.excellentReleases}/${vip.totalShots})` },
                  { label: 'Total Fastbreak Pts', val: `${vip.fastbreakPts} PTS` },
                  { label: 'Total Paint Pts', val: `${vip.paintPts} PTS` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className="font-black text-white">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'hotzones' && (
            <div className="bg-[#151820] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black uppercase text-[#F9A01B]">Official 14-Zone NBA Hot Zone Shot Chart</div>
                <div className="flex gap-3 text-[10px] font-bold">
                  <span className="text-[#CE1141]">■ HOT</span>
                  <span className="text-zinc-400">■ NEUTRAL</span>
                  <span className="text-blue-400">■ COLD</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <svg viewBox="0 0 320 210" className="w-full max-w-[320px] bg-[#1a1612] border border-white/15 rounded-lg">
                  {/* Half-court lines */}
                  <rect x={8} y={8} width={304} height={194} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
                  <rect x={115} y={8} width={90} height={105} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
                  <path d="M 38 8 L 38 78 A 126 126 0 0 0 282 78 L 282 8" fill="none" stroke="#F9A01B" strokeWidth={1.5} />
                  <circle cx={160} cy={32} r={8} fill="none" stroke="#CE1141" strokeWidth={2} />
                  {ALL_HOT_ZONE_IDS.map((zid) => {
                    const pos = HOT_ZONE_COORDS[zid];
                    const rec = vip.hotZones[zid] ?? { made: 0, att: 0 };
                    const pct = rec.att > 0 ? Math.round((rec.made / rec.att) * 100) : 0;
                    const active = selectedZone === zid;
                    return (
                      <g
                        key={zid}
                        onClick={() => setSelectedZone(zid)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={pos.r}
                          fill={getZoneFill(zid)}
                          fillOpacity={0.82}
                          stroke={active ? '#F9A01B' : '#ffffff'}
                          strokeWidth={active ? 2.5 : 1}
                        />
                        <text
                          x={pos.x}
                          y={pos.y + 3}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8.5"
                          fontWeight="900"
                        >
                          {rec.att > 0 ? `${pct}%` : '--'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                <div className="flex-1 w-full bg-[#10131a] border border-white/10 rounded-lg p-3.5 text-xs space-y-2">
                  <div className="text-[10px] font-black uppercase text-[#F9A01B]">Zone Detail</div>
                  <div className="text-base font-black text-white">{HOT_ZONE_LABELS[selectedZone]}</div>
                  <div className="text-zinc-300">
                    Made / Attempts:{' '}
                    <strong className="text-white">
                      {vip.hotZones[selectedZone]?.made ?? 0} / {vip.hotZones[selectedZone]?.att ?? 0}
                    </strong>
                  </div>
                  <div className="text-zinc-300">
                    FG%:{' '}
                    <strong className="text-[#F9A01B]">
                      {(vip.hotZones[selectedZone]?.att ?? 0) > 0
                        ? `${Math.round(((vip.hotZones[selectedZone]?.made ?? 0) / vip.hotZones[selectedZone].att) * 100)}%`
                        : 'No attempts logged yet'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    Every user shot attempted in any 3D match automatically updates this live 14-zone chart.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'trophies' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACHIEVEMENTS_25.map((ach) => {
                const unlocked = vip.unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-3 border flex items-start gap-3 ${
                      unlocked
                        ? 'bg-[#1c1712] border-[#F9A01B]/60'
                        : 'bg-[#151820] border-white/10 opacity-70'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 shrink-0 mt-0.5 ${unlocked ? 'text-[#F9A01B]' : 'text-zinc-600'}`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white">{ach.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{ach.desc}</div>
                      <div className="text-[10px] font-black text-[#F9A01B] mt-1">+{ach.vcReward} VC</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'save' && (
            <div className="space-y-4">
              <div className="bg-[#151820] border border-white/10 rounded-xl p-4">
                <div className="text-xs font-black uppercase text-[#F9A01B] mb-2">Backup & Restore VIP Save</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportSave}
                    className="px-4 py-2 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Save JSON
                  </button>
                  <button
                    onClick={() => {
                      onUpdateSave(() => createDefaultSaveData());
                      setSaveMsg('VIP Profile reset to fresh defaults.');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#1c202a] hover:bg-red-900/50 border border-white/15 text-red-300 font-bold text-xs uppercase cursor-pointer"
                  >
                    Reset VIP Profile
                  </button>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste exported NBA 2K14 Save JSON here to restore..."
                  rows={4}
                  className="mt-3 w-full bg-[#0d0f14] border border-white/15 rounded-lg p-2.5 text-xs text-zinc-200 font-mono"
                />
                <button
                  onClick={handleImportSave}
                  className="mt-2 px-4 py-2 rounded-lg bg-[#F9A01B] text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Import JSON Save
                </button>
                {saveMsg && <div className="mt-2 text-xs font-bold text-emerald-400">{saveMsg}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
