import React, { useMemo, useState } from 'react';
import { Disc3, KeyRound, Play, PlusCircle, SlidersHorizontal, Users, Volume2 } from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { BEATS_2K14_TRACKLIST, LOCKER_CODES } from '../data/modesData';
import { ALL_TEAMS } from '../data/rosters';
import { SIGNATURE_SKILLS } from '../data/signatureSkills';
import { buildMyPlayerFromSpec, getResolvedTeams, redeemLockerCode } from '../storage';
import type { MyPlayerPlayStyle, Nba2k14SaveData, Position, SignatureSkillId } from '../types';

interface FeaturesViewProps {
  save: Nba2k14SaveData;
  onUpdateSave: (updater: (prev: Nba2k14SaveData) => Nba2k14SaveData) => void;
}

type FeatureTab = 'rosters' | 'create' | 'beats' | 'locker' | 'credits';

export const FeaturesView: React.FC<FeaturesViewProps> = ({ save, onUpdateSave }) => {
  const [tab, setTab] = useState<FeatureTab>('rosters');
  const resolvedTeams = useMemo(() => getResolvedTeams(save), [save]);

  // Manage Rosters state
  const [selectedTeamId, setSelectedTeamId] = useState('mia');
  const selectedTeam = useMemo(
    () => resolvedTeams.find((t) => t.id === selectedTeamId) ?? resolvedTeams[0],
    [resolvedTeams, selectedTeamId]
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState(selectedTeam.players[0]?.id ?? '');
  const activePlayer = useMemo(
    () => selectedTeam.players.find((p) => p.id === selectedPlayerId) ?? selectedTeam.players[0],
    [selectedTeam, selectedPlayerId]
  );

  // Create-a-Player state
  const [capName, setCapName] = useState('Custom Legend');
  const [capPos, setCapPos] = useState<Position>('SF');
  const [capJersey, setCapJersey] = useState(23);
  const [capOvr, setCapOvr] = useState(86);
  const [capStyle, setCapStyle] = useState<MyPlayerPlayStyle>('All-Around');
  const [capTeamId, setCapTeamId] = useState('mia');
  const [capMsg, setCapMsg] = useState<string | null>(null);

  // Locker Code state
  const [codeInput, setCodeInput] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const handleUpdatePlayerField = (field: 'ovr' | 'jersey', value: number) => {
    if (!activePlayer) return;
    onUpdateSave((prev) => {
      const curOv = prev.rosterOverrides[activePlayer.id] ?? {};
      const nextOvr = field === 'ovr' ? Math.max(55, Math.min(99, value)) : activePlayer.ovr;
      const nextJersey = field === 'jersey' ? Math.max(0, Math.min(99, value)) : activePlayer.jersey;
      return {
        ...prev,
        rosterOverrides: {
          ...prev.rosterOverrides,
          [activePlayer.id]: {
            ...curOv,
            ovr: nextOvr,
            jersey: nextJersey,
          },
        },
      };
    });
  };

  const handleTransferPlayer = (newTeamId: string) => {
    if (!activePlayer) return;
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => ({
      ...prev,
      teamTransfers: {
        ...prev.teamTransfers,
        [activePlayer.id]: newTeamId,
      },
    }));
  };

  const handleTogglePlayerSkill = (skillId: SignatureSkillId) => {
    if (!activePlayer) return;
    Nba2k14Audio.playUiClick('hover');
    const has = activePlayer.signatureSkills.some((s) => s.id === skillId);
    const nextSkills = has
      ? activePlayer.signatureSkills.filter((s) => s.id !== skillId)
      : [...activePlayer.signatureSkills, { id: skillId, level: 2 as const }].slice(0, 5);
    onUpdateSave((prev) => ({
      ...prev,
      rosterOverrides: {
        ...prev.rosterOverrides,
        [activePlayer.id]: {
          ...(prev.rosterOverrides[activePlayer.id] ?? {}),
          signatureSkills: nextSkills,
        },
      },
    }));
  };

  const handleCreateCustomPlayer = () => {
    Nba2k14Audio.playUiClick('select');
    const built = buildMyPlayerFromSpec(
      capName,
      capJersey,
      capPos,
      capStyle,
      201,
      220,
      '#7b4d31',
      'fade',
      true,
      true,
      false,
      '#CE1141',
      capTeamId
    );
    const boosted = {
      ...built,
      id: `cap_${Date.now()}`,
      ovr: capOvr,
      attrs: Object.fromEntries(
        Object.entries(built.attrs).map(([k, v]) => [k, Math.min(99, Math.max(50, v + (capOvr - 68)))])
      ) as unknown as typeof built.attrs,
    };
    onUpdateSave((prev) => ({
      ...prev,
      customPlayers: [...prev.customPlayers, boosted],
    }));
    const team = ALL_TEAMS.find((t) => t.id === capTeamId);
    setCapMsg(`Added ${boosted.name} (${boosted.ovr} OVR ${boosted.pos}) to ${team?.fullName ?? capTeamId}!`);
  };

  const toggleTrackEnabled = (trackId: string) => {
    Nba2k14Audio.playUiClick('hover');
    onUpdateSave((prev) => {
      const cur = prev.settings.jukeboxDisabledTrackIds;
      const next = cur.includes(trackId) ? cur.filter((id) => id !== trackId) : [...cur, trackId];
      return {
        ...prev,
        settings: {
          ...prev.settings,
          jukeboxDisabledTrackIds: next,
        },
      };
    });
  };

  const handleRedeemCode = () => {
    const res = redeemLockerCode(save, codeInput);
    Nba2k14Audio.playUiClick(res.ok ? 'select' : 'back');
    setCodeFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      onUpdateSave(() => res.nextSave);
      setCodeInput('');
    }
  };

  return (
    <div className="h-full flex flex-col px-5 py-3 overflow-hidden">
      {/* Header Tabs */}
      <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F9A01B]">
          NBA 2K14 · FEATURES & EXTRAS
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'rosters', label: 'Manage Rosters', icon: Users },
              { id: 'create', label: 'Create-a-Player', icon: PlusCircle },
              { id: 'beats', label: '2K Beats (20 Tracks)', icon: Disc3 },
              { id: 'locker', label: 'Locker Codes', icon: KeyRound },
              { id: 'credits', label: 'Credits', icon: SlidersHorizontal },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  Nba2k14Audio.playUiClick('hover');
                  setTab(t.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 border cursor-pointer ${
                  tab === t.id
                    ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                    : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'rosters' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col">
              <label className="text-[10px] font-black uppercase text-[#F9A01B]">Select Any of 50 Teams</label>
              <select
                value={selectedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  const found = resolvedTeams.find((t) => t.id === e.target.value);
                  if (found?.players[0]) setSelectedPlayerId(found.players[0].id);
                }}
                className="mt-1.5 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-xs font-bold text-white"
              >
                {resolvedTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.league}] {t.fullName} ({t.ovr})
                  </option>
                ))}
              </select>

              <div className="mt-3 space-y-1.5 overflow-y-auto max-h-96 pr-1">
                {selectedTeam.players.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`w-full px-3 py-2 rounded-lg text-left border flex items-center justify-between text-xs cursor-pointer ${
                      activePlayer?.id === p.id
                        ? 'bg-[#CE1141]/25 border-[#F9A01B] text-white'
                        : 'bg-[#151820] border-white/10 text-zinc-300'
                    }`}
                  >
                    <span className="font-bold">
                      #{p.jersey} {p.name} <span className="text-zinc-400">({p.pos})</span>
                    </span>
                    <span className="font-black text-[#F9A01B]">{p.ovr}</span>
                  </button>
                ))}
              </div>
            </div>

            {activePlayer && (
              <div className="lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[10px] font-black uppercase text-[#F9A01B]">ROSTER EDITOR</div>
                    <h3 className="text-xl font-black text-white">
                      {activePlayer.name} #{activePlayer.jersey} · {activePlayer.pos}
                    </h3>
                  </div>
                  <div className="text-2xl font-black text-[#F9A01B]">{activePlayer.ovr} OVR</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Overall Rating ({activePlayer.ovr})</label>
                    <input
                      type="range"
                      min={55}
                      max={99}
                      value={activePlayer.ovr}
                      onChange={(e) => handleUpdatePlayerField('ovr', Number(e.target.value))}
                      className="w-full accent-[#CE1141] mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Jersey Number</label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={activePlayer.jersey}
                      onChange={(e) => handleUpdatePlayerField('jersey', Number(e.target.value))}
                      className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-1.5 text-sm font-black text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-zinc-400">Transfer Team</label>
                    <select
                      value={selectedTeam.id}
                      onChange={(e) => handleTransferPlayer(e.target.value)}
                      className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      {ALL_TEAMS.map((t) => (
                        <option key={t.id} value={t.id}>{t.code} · {t.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase text-[#F9A01B] mb-2">
                    Signature Skills ({activePlayer.signatureSkills.length}/5 Equipped)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {SIGNATURE_SKILLS.map((sk) => {
                      const eq = activePlayer.signatureSkills.some((s) => s.id === sk.id);
                      return (
                        <button
                          key={sk.id}
                          onClick={() => handleTogglePlayerSkill(sk.id)}
                          className={`px-2.5 py-1.5 rounded text-left text-[11px] font-bold border cursor-pointer ${
                            eq
                              ? 'bg-[#F9A01B]/20 border-[#F9A01B] text-[#F9A01B]'
                              : 'bg-[#151820] border-white/10 text-zinc-400 hover:text-white'
                          }`}
                        >
                          [{sk.code}] {sk.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'create' && (
          <div className="max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-black text-white uppercase">CREATE-A-PLAYER & ASSIGN TO ROSTER</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Full Name</label>
                <input
                  value={capName}
                  onChange={(e) => setCapName(e.target.value)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Assign to Team</label>
                <select
                  value={capTeamId}
                  onChange={(e) => setCapTeamId(e.target.value)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                >
                  {ALL_TEAMS.map((t) => (
                    <option key={t.id} value={t.id}>{t.code} · {t.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Position</label>
                <select
                  value={capPos}
                  onChange={(e) => setCapPos(e.target.value as Position)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                >
                  {(['PG', 'SG', 'SF', 'PF', 'C'] as const).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Archetype</label>
                <select
                  value={capStyle}
                  onChange={(e) => setCapStyle(e.target.value as MyPlayerPlayStyle)}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                >
                  {(['Athletic', 'Scoring', '3PT Specialist', 'All-Around', 'Pass First', 'Defensive', 'Post', 'Rebounding'] as const).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Jersey #</label>
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={capJersey}
                  onChange={(e) => setCapJersey(Number(e.target.value))}
                  className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-zinc-400">Overall Rating ({capOvr})</label>
                <input
                  type="range"
                  min={65}
                  max={99}
                  value={capOvr}
                  onChange={(e) => setCapOvr(Number(e.target.value))}
                  className="w-full accent-[#CE1141] mt-3"
                />
              </div>
            </div>
            <button
              onClick={handleCreateCustomPlayer}
              className="w-full py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm cursor-pointer"
            >
              Add Custom Player to Roster
            </button>
            {capMsg && <div className="text-xs font-bold text-emerald-400">{capMsg}</div>}
          </div>
        )}

        {tab === 'beats' && (
          <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#F9A01B]">CURATED BY LEBRON JAMES</div>
                <h2 className="text-lg font-black text-white uppercase">2K BEATS JUKEBOX (20 PROCEDURAL TRACKS)</h2>
              </div>
              <button
                onClick={() => Nba2k14Audio.toggleBeats()}
                className="px-4 py-2 rounded-lg bg-[#CE1141] text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Play / Pause Beats
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {BEATS_2K14_TRACKLIST.map((track, idx) => {
                const disabled = save.settings.jukeboxDisabledTrackIds.includes(track.id);
                const playing = Nba2k14Audio.getCurrentTrack().id === track.id && Nba2k14Audio.isBeatsPlaying();
                return (
                  <div
                    key={track.id}
                    className={`rounded-lg px-3.5 py-2.5 border flex items-center justify-between gap-3 ${
                      playing
                        ? 'bg-[#221519] border-[#F9A01B]'
                        : 'bg-[#151820] border-white/10'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">
                        {String(idx + 1).padStart(2, '0')}. {track.title}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {track.artist} · {track.bpm} BPM · {track.style.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => Nba2k14Audio.playTrackById(track.id)}
                        className="px-2.5 py-1 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" /> Play
                      </button>
                      <button
                        onClick={() => toggleTrackEnabled(track.id)}
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase border cursor-pointer ${
                          disabled
                            ? 'bg-zinc-900 border-white/10 text-zinc-500'
                            : 'bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {disabled ? 'OFF' : 'ON'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'locker' && (
          <div className="max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#F9A01B]">OFFICIAL 2K14 REWARDS</div>
              <h2 className="text-2xl font-black text-white uppercase mt-1">REDEEM LOCKER CODES</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter an NBA 2K14 Locker Code below to claim instant VC, SP, MyTEAM Points, Park REP, and Gold/Historic Player Cards.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
                placeholder="ENTER CODE (E.G. KINGJAMES)"
                className="flex-1 bg-[#171a22] border border-white/20 rounded-xl px-4 py-3 text-base font-black tracking-widest text-white uppercase focus:outline-none focus:border-[#F9A01B]"
              />
              <button
                onClick={handleRedeemCode}
                className="px-6 py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-xs tracking-wider cursor-pointer"
              >
                Redeem
              </button>
            </div>
            {codeFeedback && (
              <div
                className={`p-3 rounded-lg border text-xs font-bold ${
                  codeFeedback.ok
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-red-950/60 border-red-500 text-red-300'
                }`}
              >
                {codeFeedback.text}
              </div>
            )}
            <div className="border-t border-white/10 pt-4">
              <div className="text-[10px] font-black uppercase text-[#F9A01B] mb-2">Active 2K14 Vault Codes</div>
              <div className="space-y-2">
                {LOCKER_CODES.map((c) => {
                  const used = save.vip.redeemedCodes.includes(c.code);
                  return (
                    <div key={c.code} className="bg-[#151820] border border-white/10 rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-[#F9A01B] tracking-wider mr-2">{c.code}</span>
                        <span className="text-zinc-300">{c.label}</span>
                      </div>
                      <button
                        disabled={used}
                        onClick={() => setCodeInput(c.code)}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase shrink-0 cursor-pointer ${
                          used
                            ? 'bg-emerald-900/40 text-emerald-300 cursor-default'
                            : 'bg-[#1c202a] hover:bg-[#2c3345] text-white'
                        }`}
                      >
                        {used ? 'REDEEMED' : 'USE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'credits' && (
          <div className="max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 space-y-3 text-xs text-zinc-300">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#F9A01B]">2013–14 CHAMPIONSHIP EDITION</div>
            <h2 className="text-2xl font-black text-white uppercase">NBA 2K14 · WEBGL 3D ENGINE</h2>
            <p className="leading-relaxed">
              Built with real-time Three.js articulated 3D hardwood simulation, procedural 2048×1024 court arenas (NBA, Euroleague FIBA, Blacktop, The Park, Practice Gym), 50 authentic 2013–14 rosters, 38 active Signature Skills, Pro Stick IsoMotion & Shooting, 10-second 3D Instant Replay camera, and a 20-track procedural Web Audio 2K Beats synthesizer.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#151820] border border-white/10 rounded-lg p-3">
                <div className="text-[10px] text-[#F9A01B] font-black uppercase">Teams & Rosters</div>
                <div className="text-white font-bold mt-0.5">30 NBA · 14 Euroleague · 4 Classic · 2 All-Star</div>
              </div>
              <div className="bg-[#151820] border border-white/10 rounded-lg p-3">
                <div className="text-[10px] text-[#F9A01B] font-black uppercase">Gameplay Systems</div>
                <div className="text-white font-bold mt-0.5">Pro Stick · OTFC · 38 Signature Skills · 14 Hot Zones</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
