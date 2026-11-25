import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Briefcase,
  Dumbbell,
  Flame,
  Layers,
  Play,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { Nba2k14Audio } from '../audio/Nba2k14Audio';
import { TRAINING_DRILLS } from '../data/modesData';
import { NBA_TEAMS, getAllPlayers, getTeamById } from '../data/rosters';
import {
  createDefaultAssociation,
  createDefaultPlayoffs,
  createMyTeamCardFromPlayer,
  getResolvedTeams,
} from '../storage';
import type {
  MatchConfig,
  MyTeamCard,
  Nba2k14SaveData,
  PlayerData,
  PlayoffSeries,
} from '../types';

interface GameModesHubViewProps {
  save: Nba2k14SaveData;
  onUpdateSave: (updater: (prev: Nba2k14SaveData) => Nba2k14SaveData) => void;
  onStartMatch: (cfg: MatchConfig) => void;
}

type SubMode = 'association' | 'playoffs' | 'blacktop' | 'myteam' | 'training';

export const GameModesHubView: React.FC<GameModesHubViewProps> = ({
  save,
  onUpdateSave,
  onStartMatch,
}) => {
  const [subMode, setSubMode] = useState<SubMode>('association');

  // Association setup & trade state
  const [assocSetupTeam, setAssocSetupTeam] = useState(save.association.userTeamId || 'mia');
  const [assocLength, setAssocLength] = useState<14 | 29 | 82>(save.association.seasonLength);
  const [tradePartnerId, setTradePartnerId] = useState('lal');
  const [myTradePlayerId, setMyTradePlayerId] = useState('');
  const [partnerTradePlayerId, setPartnerTradePlayerId] = useState('');
  const [tradeMsg, setTradeMsg] = useState<string | null>(null);

  // Playoffs setup state
  const [playoffTeamId, setPlayoffTeamId] = useState(save.playoffs.userTeamId || 'mia');
  const [playoffBestOf, setPlayoffBestOf] = useState<1 | 3 | 5 | 7>(save.playoffs.bestOf);

  // Blacktop state
  const [btFormat, setBtFormat] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [btTarget, setBtTarget] = useState<7 | 11 | 15 | 21 | 50>(21);
  const [btHalfCourt, setBtHalfCourt] = useState(true);
  const allPlayers = useMemo(() => getAllPlayers().sort((a, b) => b.ovr - a.ovr), []);
  const [btTeamAIds, setBtTeamAIds] = useState<string[]>(() =>
    allPlayers.slice(0, 5).map((p) => p.id)
  );
  const [btTeamBIds, setBtTeamBIds] = useState<string[]>(() =>
    allPlayers.slice(5, 10).map((p) => p.id)
  );

  // MyTEAM pack reveal state
  const [packMessage, setPackMessage] = useState<string | null>(null);
  const [myTeamSubTab, setMyTeamSubTab] = useState<'lineup' | 'packs' | 'domination' | 'rttp'>('lineup');

  const resolvedTeams = useMemo(() => getResolvedTeams(save), [save]);
  const assocUserTeam = useMemo(
    () => resolvedTeams.find((t) => t.id === save.association.userTeamId) ?? resolvedTeams[0],
    [resolvedTeams, save.association.userTeamId]
  );
  const tradePartnerTeam = useMemo(
    () => resolvedTeams.find((t) => t.id === tradePartnerId) ?? resolvedTeams[1],
    [resolvedTeams, tradePartnerId]
  );

  // ---------------- ASSOCIATION / MyGM ACTIONS ----------------
  const startAssociation = () => {
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => ({
      ...prev,
      lastMode: 'association',
      association: {
        ...createDefaultAssociation(assocSetupTeam, assocLength),
        active: true,
      },
    }));
  };

  const simAssociationDay = () => {
    Nba2k14Audio.playUiClick('hover');
    onUpdateSave((prev) => {
      const nextStandings = { ...prev.association.standings };
      const ids = Object.keys(nextStandings);
      for (let i = 0; i < ids.length; i += 2) {
        const aId = ids[i];
        const bId = ids[(i + prev.association.currentDay) % ids.length];
        if (!aId || !bId || aId === bId) continue;
        const aTeam = getTeamById(aId);
        const bTeam = getTeamById(bId);
        const aWinProb = 0.5 + (aTeam.ovr - bTeam.ovr) * 0.025;
        const aWins = Math.random() < aWinProb;
        if (nextStandings[aId].wins + nextStandings[aId].losses < prev.association.seasonLength) {
          nextStandings[aId] = {
            ...nextStandings[aId],
            wins: nextStandings[aId].wins + (aWins ? 1 : 0),
            losses: nextStandings[aId].losses + (aWins ? 0 : 1),
          };
        }
        if (nextStandings[bId].wins + nextStandings[bId].losses < prev.association.seasonLength) {
          nextStandings[bId] = {
            ...nextStandings[bId],
            wins: nextStandings[bId].wins + (aWins ? 0 : 1),
            losses: nextStandings[bId].losses + (aWins ? 1 : 0),
          };
        }
      }
      const userSt = nextStandings[prev.association.userTeamId];
      const trustDelta = userSt && userSt.wins >= userSt.losses ? 1 : -1;
      return {
        ...prev,
        association: {
          ...prev.association,
          currentDay: prev.association.currentDay + 1,
          standings: nextStandings,
          ownerTrust: Math.max(20, Math.min(100, prev.association.ownerTrust + trustDelta)),
        },
      };
    });
  };

  const executeGmTrade = () => {
    const p1 = assocUserTeam.players.find((p) => p.id === myTradePlayerId) ?? assocUserTeam.players[0];
    const p2 = tradePartnerTeam.players.find((p) => p.id === partnerTradePlayerId) ?? tradePartnerTeam.players[0];
    if (!p1 || !p2) return;
    if (Math.abs(p1.ovr - p2.ovr) > 10) {
      setTradeMsg(`${tradePartnerTeam.name} GM declined: OVR gap (${p1.ovr} vs ${p2.ovr}) is too wide.`);
      return;
    }
    Nba2k14Audio.playUiClick('select');
    setTradeMsg(`TRADE OFFICIAL: ${p1.name} to ${tradePartnerTeam.code} for ${p2.name}!`);
    onUpdateSave((prev) => ({
      ...prev,
      vip: {
        ...prev.vip,
        unlockedAchievements: Array.from(new Set([...prev.vip.unlockedAchievements, 'gm_trade'])),
      },
      teamTransfers: {
        ...prev.teamTransfers,
        [p1.id]: tradePartnerTeam.id,
        [p2.id]: assocUserTeam.id,
      },
      association: {
        ...prev.association,
        ownerTrust: Math.min(100, prev.association.ownerTrust + 3),
        tradeHistory: [`${assocUserTeam.code} acquired ${p2.name} (${p2.ovr}) for ${p1.name} (${p1.ovr})`, ...prev.association.tradeHistory],
      },
    }));
  };

  const signFreeAgent = (fa: PlayerData) => {
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => ({
      ...prev,
      customPlayers: [...prev.customPlayers, { ...fa, teamId: prev.association.userTeamId }],
      association: {
        ...prev.association,
        freeAgents: prev.association.freeAgents.filter((p) => p.id !== fa.id),
        tradeHistory: [`Signed Free Agent ${fa.name} (${fa.ovr} OVR)`, ...prev.association.tradeHistory],
      },
    }));
  };

  const playAssociationGame = () => {
    Nba2k14Audio.playUiClick('select');
    const others = NBA_TEAMS.filter((t) => t.id !== assocUserTeam.id);
    const opp = others[save.association.currentDay % others.length];
    onStartMatch({
      mode: 'association',
      title: `THE ASSOCIATION · DAY ${save.association.currentDay}`,
      subtitle: `${assocUserTeam.fullName} vs ${opp.fullName}`,
      homeTeamId: assocUserTeam.id,
      awayTeamId: opp.id,
      homeCustomPlayers: assocUserTeam.players,
      userSide: 'home',
      courtEnv: 'nba',
      quarterLengthMin: save.settings.game.quarterLengthMin,
      playersPerSide: 5,
    });
  };

  // ---------------- PLAYOFFS ACTIONS ----------------
  const startPlayoffs = () => {
    Nba2k14Audio.playUiClick('select');
    onUpdateSave((prev) => ({
      ...prev,
      playoffs: {
        ...createDefaultPlayoffs(playoffTeamId, playoffBestOf),
        active: true,
      },
    }));
  };

  const advancePlayoffBrackets = (seriesList: PlayoffSeries[]): PlayoffSeries[] => {
    const out = [...seriesList];
    const tryMakeRound = (round: 1 | 2 | 3, conf: 'EAST' | 'WEST') => {
      const done = out.filter((s) => s.round === round && s.conference === conf);
      if (done.length === 0 || done.some((s) => !s.winnerId)) return;
      const nextRound = (round + 1) as 2 | 3;
      if (out.some((s) => s.round === nextRound && s.conference === conf)) return;
      for (let i = 0; i < done.length; i += 2) {
        if (done[i]?.winnerId && done[i + 1]?.winnerId) {
          out.push({
            id: `${conf.toLowerCase()}_r${nextRound}_${i}`,
            round: nextRound,
            conference: conf,
            higherSeedId: done[i].winnerId!,
            lowerSeedId: done[i + 1].winnerId!,
            higherWins: 0,
            lowerWins: 0,
            winnerId: null,
          });
        }
      }
    };
    tryMakeRound(1, 'EAST');
    tryMakeRound(1, 'WEST');
    tryMakeRound(2, 'EAST');
    tryMakeRound(2, 'WEST');
    const eastChamp = out.find((s) => s.round === 3 && s.conference === 'EAST')?.winnerId;
    const westChamp = out.find((s) => s.round === 3 && s.conference === 'WEST')?.winnerId;
    if (eastChamp && westChamp && !out.some((s) => s.round === 4)) {
      out.push({
        id: 'nba_finals_2014',
        round: 4,
        conference: 'FINALS',
        higherSeedId: eastChamp,
        lowerSeedId: westChamp,
        higherWins: 0,
        lowerWins: 0,
        winnerId: null,
      });
    }
    return out;
  };

  const simPlayoffGame = (seriesId: string) => {
    Nba2k14Audio.playUiClick('hover');
    const needed = Math.ceil(save.playoffs.bestOf / 2);
    onUpdateSave((prev) => {
      let wonSeries = false;
      const updated = prev.playoffs.series.map((s) => {
        if (s.id !== seriesId || s.winnerId) return s;
        const hi = getTeamById(s.higherSeedId);
        const lo = getTeamById(s.lowerSeedId);
        const hiWin = Math.random() < 0.52 + (hi.ovr - lo.ovr) * 0.025;
        const hw = s.higherWins + (hiWin ? 1 : 0);
        const lw = s.lowerWins + (hiWin ? 0 : 1);
        const winnerId = hw >= needed ? s.higherSeedId : lw >= needed ? s.lowerSeedId : null;
        if (winnerId && winnerId === prev.playoffs.userTeamId) wonSeries = true;
        return { ...s, higherWins: hw, lowerWins: lw, winnerId };
      });
      return {
        ...prev,
        vip: wonSeries
          ? {
              ...prev.vip,
              unlockedAchievements: Array.from(new Set([...prev.vip.unlockedAchievements, 'playoff_series'])),
            }
          : prev.vip,
        playoffs: {
          ...prev.playoffs,
          series: advancePlayoffBrackets(updated),
        },
      };
    });
  };

  // ---------------- MyTEAM ACTIONS ----------------
  const openStarterPack = () => {
    Nba2k14Audio.playUiClick('select');
    const startersPool = allPlayers.filter((p) => p.ovr >= 74 && p.ovr <= 85);
    const cards: MyTeamCard[] = [];
    for (let i = 0; i < 8; i++) {
      const p = startersPool[(i * 11 + 3) % startersPool.length];
      cards.push(createMyTeamCardFromPlayer(p, p.ovr >= 82 ? 'Silver' : 'Bronze'));
    }
    onUpdateSave((prev) => ({
      ...prev,
      myTeam: {
        ...prev.myTeam,
        starterOpened: true,
        collection: [...prev.myTeam.collection, ...cards],
        lineupCardIds: cards.slice(0, 5).map((c) => c.id),
      },
    }));
    setPackMessage('Starter Pack Opened! 8 Players added to your MyTEAM Collection.');
  };

  const buyMyTeamPack = (tier: 'Bronze' | 'Silver' | 'Gold' | 'Historic', vcCost: number) => {
    if (save.vip.vc < vcCost) {
      setPackMessage(`Need ${vcCost.toLocaleString()} VC to open a ${tier} Pack.`);
      return;
    }
    Nba2k14Audio.playUiClick('select');
    const pool =
      tier === 'Historic'
        ? allPlayers.filter((p) => p.teamId.startsWith('cls_') || p.ovr >= 91)
        : tier === 'Gold'
          ? allPlayers.filter((p) => p.ovr >= 85)
          : tier === 'Silver'
            ? allPlayers.filter((p) => p.ovr >= 77 && p.ovr < 86)
            : allPlayers.filter((p) => p.ovr < 79);
    const pulled: MyTeamCard[] = [];
    for (let i = 0; i < 3; i++) {
      const pick = pool[Math.floor(Math.random() * pool.length)] ?? allPlayers[0];
      pulled.push(createMyTeamCardFromPlayer(pick, tier));
    }
    onUpdateSave((prev) => ({
      ...prev,
      vip: {
        ...prev.vip,
        vc: prev.vip.vc - vcCost,
        unlockedAchievements: Array.from(new Set([...prev.vip.unlockedAchievements, 'myteam_pack'])),
      },
      myTeam: {
        ...prev.myTeam,
        collection: [...pulled, ...prev.myTeam.collection],
        lineupCardIds:
          prev.myTeam.lineupCardIds.length < 5
            ? [...prev.myTeam.lineupCardIds, ...pulled.map((c) => c.id)].slice(0, 5)
            : prev.myTeam.lineupCardIds,
      },
    }));
    setPackMessage(`Pulled ${tier} Pack: ${pulled.map((c) => `${c.player.name} (${c.player.ovr})`).join(' · ')}`);
  };

  const toggleLineupCard = (cardId: string) => {
    Nba2k14Audio.playUiClick('hover');
    onUpdateSave((prev) => {
      const cur = prev.myTeam.lineupCardIds;
      const next = cur.includes(cardId)
        ? cur.filter((id) => id !== cardId)
        : cur.length < 8
          ? [...cur, cardId]
          : cur;
      return { ...prev, myTeam: { ...prev.myTeam, lineupCardIds: next } };
    });
  };

  const launchMyTeamMatch = (oppTeamId: string, isDomination: boolean) => {
    const lineupPlayers = save.myTeam.lineupCardIds
      .map((id) => save.myTeam.collection.find((c) => c.id === id)?.player)
      .filter((p): p is PlayerData => Boolean(p));
    if (lineupPlayers.length < 5) {
      setPackMessage('Select at least 5 cards in your MyTEAM Lineup before tipping off.');
      return;
    }
    const opp = getTeamById(oppTeamId);
    Nba2k14Audio.playUiClick('select');
    onStartMatch({
      mode: 'myteam',
      title: isDomination ? `MyTEAM DOMINATION vs ${opp.code}` : `ROAD TO THE PLAYOFFS · SEED ${save.myTeam.rttpSeed}`,
      subtitle: `${save.vip.name} MyTEAM vs ${opp.fullName}`,
      homeTeamId: save.vip.favTeamId || 'mia',
      awayTeamId: opp.id,
      homeCustomPlayers: lineupPlayers,
      userSide: 'home',
      courtEnv: 'nba',
      quarterLengthMin: save.settings.game.quarterLengthMin,
      playersPerSide: 5,
      myTeamDominationTeamId: isDomination ? opp.id : undefined,
    });
  };

  const standingsSorted = useMemo(() => {
    return Object.values(save.association.standings)
      .map((st) => ({ ...st, team: getTeamById(st.teamId) }))
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.team.ovr - a.team.ovr);
  }, [save.association.standings]);

  return (
    <div className="h-full flex flex-col px-5 py-3 overflow-hidden">
      {/* Mode Switcher Bar */}
      <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#F9A01B]">
          NBA 2K14 · GAME MODES HUB
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'association', label: 'Association / MyGM', icon: Briefcase },
            { id: 'playoffs', label: 'Playoffs', icon: Trophy },
            { id: 'blacktop', label: 'NBA Blacktop & Contests', icon: Flame },
            { id: 'myteam', label: 'MyTEAM', icon: Layers },
            { id: 'training', label: 'Training Camp', icon: Dumbbell },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  Nba2k14Audio.playUiClick('hover');
                  setSubMode(item.id as SubMode);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border cursor-pointer transition ${
                  subMode === item.id
                    ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                    : 'bg-[#171a22] border-white/10 text-zinc-300 hover:border-white/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* 1. ASSOCIATION / MyGM */}
        {subMode === 'association' && (
          !save.association.active ? (
            <div className="max-w-3xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6">
              <h2 className="text-xl font-black text-white uppercase">LAUNCH THE ASSOCIATION / MyGM</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Control all 30 NBA franchises, negotiate trades, sign free agents, manage rotation minutes, and satisfy Ownership goals.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400">Select Franchise</label>
                  <select
                    value={assocSetupTeam}
                    onChange={(e) => setAssocSetupTeam(e.target.value)}
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    {NBA_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.ovr} OVR)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400">Season Length</label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    {([14, 29, 82] as const).map((len) => (
                      <button
                        key={len}
                        onClick={() => setAssocLength(len)}
                        className={`py-2 rounded-lg text-xs font-black border cursor-pointer ${
                          assocLength === len
                            ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                            : 'bg-[#171a22] border-white/10 text-zinc-300'
                        }`}
                      >
                        {len} Games
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={startAssociation}
                className="w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm tracking-wider cursor-pointer"
              >
                Begin Franchise Season
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Front Office & Sim */}
              <div className="space-y-4">
                <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#F9A01B]">FRONT OFFICE · DAY {save.association.currentDay}</span>
                    <span className="text-xs font-black text-emerald-400">Trust {save.association.ownerTrust}%</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">{assocUserTeam.fullName}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Record: <strong className="text-white">{save.association.standings[assocUserTeam.id]?.wins ?? 0}-{save.association.standings[assocUserTeam.id]?.losses ?? 0}</strong> ({save.association.seasonLength}G Season)
                  </div>
                  <div className="mt-3 p-2.5 rounded-lg bg-[#151820] border border-white/10 text-xs text-zinc-300">
                    <span className="text-[#F9A01B] font-bold">Owner Goal:</span> {save.association.ownerGoal}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={playAssociationGame}
                      className="flex-1 py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer"
                    >
                      Play Next Game
                    </button>
                    <button
                      onClick={simAssociationDay}
                      className="px-3 py-2.5 rounded-lg bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-white font-bold text-xs uppercase cursor-pointer"
                    >
                      Sim Day
                    </button>
                  </div>
                </div>

                {/* Free Agency */}
                <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
                  <div className="text-xs font-black uppercase text-[#F9A01B] mb-2">Free Agent Pool</div>
                  {save.association.freeAgents.length === 0 ? (
                    <div className="text-xs text-zinc-500">All headline free agents signed.</div>
                  ) : (
                    <div className="space-y-2">
                      {save.association.freeAgents.map((fa) => (
                        <div key={fa.id} className="bg-[#151820] border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-white">{fa.name}</div>
                            <div className="text-[10px] text-zinc-400">{fa.pos} · {fa.ovr} OVR</div>
                          </div>
                          <button
                            onClick={() => signFreeAgent(fa)}
                            className="px-2.5 py-1 rounded bg-emerald-600/30 border border-emerald-400/50 text-emerald-200 text-[10px] font-black uppercase cursor-pointer"
                          >
                            Sign
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Finder & Rotation */}
              <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 space-y-4">
                <div>
                  <div className="text-xs font-black uppercase text-[#F9A01B] mb-2 flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5" /> Trade Finder
                  </div>
                  <div className="space-y-2">
                    <select
                      value={myTradePlayerId || assocUserTeam.players[0]?.id}
                      onChange={(e) => setMyTradePlayerId(e.target.value)}
                      className="w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                    >
                      {assocUserTeam.players.map((p) => (
                        <option key={p.id} value={p.id}>SEND: {p.name} ({p.pos}, {p.ovr})</option>
                      ))}
                    </select>
                    <select
                      value={tradePartnerId}
                      onChange={(e) => {
                        setTradePartnerId(e.target.value);
                        setPartnerTradePlayerId('');
                      }}
                      className="w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-bold"
                    >
                      {NBA_TEAMS.filter((t) => t.id !== assocUserTeam.id).map((t) => (
                        <option key={t.id} value={t.id}>PARTNER: {t.fullName}</option>
                      ))}
                    </select>
                    <select
                      value={partnerTradePlayerId || tradePartnerTeam.players[0]?.id}
                      onChange={(e) => setPartnerTradePlayerId(e.target.value)}
                      className="w-full bg-[#171a22] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                    >
                      {tradePartnerTeam.players.map((p) => (
                        <option key={p.id} value={p.id}>RECEIVE: {p.name} ({p.pos}, {p.ovr})</option>
                      ))}
                    </select>
                    <button
                      onClick={executeGmTrade}
                      className="w-full py-2 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
                    >
                      Propose Trade
                    </button>
                    {tradeMsg && <div className="text-[11px] font-bold text-amber-300">{tradeMsg}</div>}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-xs font-black uppercase text-[#F9A01B] mb-2">Rotation Minutes</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {assocUserTeam.players.slice(0, 8).map((p) => {
                      const mins = save.association.rotationMinutes[p.id] ?? 24;
                      return (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <span className="w-28 truncate text-zinc-200 font-bold">{p.name}</span>
                          <input
                            type="range"
                            min={0}
                            max={42}
                            value={mins}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              onUpdateSave((prev) => ({
                                ...prev,
                                association: {
                                  ...prev.association,
                                  rotationMinutes: { ...prev.association.rotationMinutes, [p.id]: v },
                                },
                              }));
                            }}
                            className="flex-1 accent-[#CE1141]"
                          />
                          <span className="w-8 text-right font-black text-white">{mins}m</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Standings */}
              <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
                <div className="text-xs font-black uppercase text-[#F9A01B] mb-2">NBA League Standings</div>
                <div className="max-h-96 overflow-y-auto pr-1">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-zinc-400 border-b border-white/10 text-left">
                        <th className="py-1">Team</th>
                        <th className="py-1 text-right">W</th>
                        <th className="py-1 text-right">L</th>
                        <th className="py-1 text-right">OVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standingsSorted.map((row) => (
                        <tr
                          key={row.teamId}
                          className={`border-b border-white/5 ${
                            row.teamId === assocUserTeam.id ? 'text-[#F9A01B] font-black' : 'text-zinc-200'
                          }`}
                        >
                          <td className="py-1.5">{row.team.code} · {row.team.name}</td>
                          <td className="py-1.5 text-right">{row.wins}</td>
                          <td className="py-1.5 text-right">{row.losses}</td>
                          <td className="py-1.5 text-right text-zinc-400">{row.team.ovr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}

        {/* 2. PLAYOFFS */}
        {subMode === 'playoffs' && (
          !save.playoffs.active ? (
            <div className="max-w-2xl mx-auto bg-[#0f1116]/94 border border-white/15 rounded-xl p-6">
              <h2 className="text-xl font-black text-white uppercase">2014 NBA PLAYOFFS BRACKET</h2>
              <p className="text-xs text-zinc-400 mt-1">
                16-Team Championship Bracket. Play any matchup in 3D or simulate games round by round through the NBA Finals.
              </p>
              <div className="grid grid-cols-2 gap-4 my-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400">Your Team</label>
                  <select
                    value={playoffTeamId}
                    onChange={(e) => setPlayoffTeamId(e.target.value)}
                    className="mt-1 w-full bg-[#171a22] border border-white/15 rounded-lg px-3 py-2 text-sm font-bold text-white"
                  >
                    {NBA_TEAMS.map((t) => (
                      <option key={t.id} value={t.id}>{t.fullName} ({t.ovr})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-zinc-400">Series Format</label>
                  <div className="mt-1 grid grid-cols-4 gap-1.5">
                    {([1, 3, 5, 7] as const).map((bo) => (
                      <button
                        key={bo}
                        onClick={() => setPlayoffBestOf(bo)}
                        className={`py-2 rounded-lg text-xs font-black border cursor-pointer ${
                          playoffBestOf === bo
                            ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                            : 'bg-[#171a22] border-white/10 text-zinc-300'
                        }`}
                      >
                        Bo{bo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={startPlayoffs}
                className="w-full py-3 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-sm tracking-wider cursor-pointer"
              >
                Generate 16-Team Playoff Bracket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5">
                <div className="text-xs font-black text-white uppercase">
                  NBA Playoffs · Best of {save.playoffs.bestOf}
                </div>
                <button
                  onClick={startPlayoffs}
                  className="px-3 py-1 rounded bg-[#1c202a] border border-white/15 text-[11px] font-bold text-zinc-300 hover:text-white uppercase cursor-pointer"
                >
                  Reset Bracket
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {save.playoffs.series.map((s) => {
                  const hi = getTeamById(s.higherSeedId);
                  const lo = getTeamById(s.lowerSeedId);
                  return (
                    <div
                      key={s.id}
                      className={`rounded-xl p-3.5 border ${
                        s.conference === 'FINALS'
                          ? 'bg-[#211810] border-[#F9A01B]'
                          : 'bg-[#0f1116]/94 border-white/15'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] font-black uppercase text-[#F9A01B] mb-2">
                        <span>{s.conference === 'FINALS' ? 'NBA FINALS' : `${s.conference} R${s.round}`}</span>
                        {s.winnerId && <span className="text-emerald-400">WINNER: {getTeamById(s.winnerId).code}</span>}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between bg-[#151820] px-2.5 py-1.5 rounded">
                          <span className="font-bold text-white">{hi.code} · {hi.name}</span>
                          <span className="font-black text-[#F9A01B]">{s.higherWins}</span>
                        </div>
                        <div className="flex justify-between bg-[#151820] px-2.5 py-1.5 rounded">
                          <span className="font-bold text-white">{lo.code} · {lo.name}</span>
                          <span className="font-black text-[#F9A01B]">{s.lowerWins}</span>
                        </div>
                      </div>
                      {!s.winnerId && (
                        <div className="mt-2.5 flex gap-1.5">
                          <button
                            onClick={() => {
                              Nba2k14Audio.playUiClick('select');
                              onStartMatch({
                                mode: 'playoffs',
                                title: `PLAYOFFS ${s.conference} R${s.round}`,
                                subtitle: `${hi.code} (${s.higherWins}) vs ${lo.code} (${s.lowerWins})`,
                                homeTeamId: hi.id,
                                awayTeamId: lo.id,
                                userSide: lo.id === save.playoffs.userTeamId ? 'away' : 'home',
                                courtEnv: 'nba',
                                quarterLengthMin: save.settings.game.quarterLengthMin,
                                playersPerSide: 5,
                                playoffSeriesId: s.id,
                              });
                            }}
                            className="flex-1 py-1.5 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-[10px] uppercase cursor-pointer"
                          >
                            Play
                          </button>
                          <button
                            onClick={() => simPlayoffGame(s.id)}
                            className="flex-1 py-1.5 rounded bg-[#1c202a] hover:bg-[#262b38] border border-white/15 text-zinc-200 font-bold text-[10px] uppercase cursor-pointer"
                          >
                            Sim Game
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* 3. NBA BLACKTOP + 3PT SHOOTOUT + SPRITE SLAM DUNK CONTEST */}
        {subMode === 'blacktop' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[#0f1116]/94 border border-white/15 rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#F9A01B]">STREETBALL & ALL-STAR EVENTS</div>
                  <h2 className="text-lg font-black text-white uppercase">NBA BLACKTOP PICKUP</h2>
                </div>
                <div className="flex gap-1.5">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      onClick={() => setBtFormat(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black border cursor-pointer ${
                        btFormat === n
                          ? 'bg-[#CE1141] border-[#F9A01B] text-white'
                          : 'bg-[#171a22] border-white/10 text-zinc-300'
                      }`}
                    >
                      {n}v{n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-zinc-400 font-bold uppercase">Game To:</span>
                  {([7, 11, 15, 21, 50] as const).map((pts) => (
                    <button
                      key={pts}
                      onClick={() => setBtTarget(pts)}
                      className={`px-2.5 py-1 rounded font-black cursor-pointer ${
                        btTarget === pts ? 'bg-[#F9A01B] text-black' : 'bg-[#171a22] text-zinc-300'
                      }`}
                    >
                      {pts}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setBtHalfCourt(!btHalfCourt)}
                  className="px-3 py-1 rounded bg-[#171a22] border border-white/15 text-zinc-200 font-bold uppercase cursor-pointer"
                >
                  Court: {btHalfCourt ? 'Half-Court' : 'Full-Court'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { title: 'YOUR SQUAD (TEAM A)', ids: btTeamAIds, setIds: setBtTeamAIds },
                  { title: 'CPU SQUAD (TEAM B)', ids: btTeamBIds, setIds: setBtTeamBIds },
                ].map((side) => (
                  <div key={side.title} className="bg-[#151820] border border-white/10 rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-black text-[#F9A01B] uppercase">{side.title}</div>
                    {Array.from({ length: btFormat }).map((_, slotIdx) => (
                      <select
                        key={slotIdx}
                        value={side.ids[slotIdx] ?? allPlayers[slotIdx].id}
                        onChange={(e) => {
                          const next = [...side.ids];
                          next[slotIdx] = e.target.value;
                          side.setIds(next);
                        }}
                        className="w-full bg-[#1c202a] border border-white/10 rounded px-2.5 py-1.5 text-xs font-bold text-white"
                      >
                        {allPlayers.slice(0, 60).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.pos} · {p.ovr} OVR)
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  Nba2k14Audio.playUiClick('select');
                  const squadA = btTeamAIds
                    .slice(0, btFormat)
                    .map((id) => allPlayers.find((p) => p.id === id) ?? allPlayers[0]);
                  const squadB = btTeamBIds
                    .slice(0, btFormat)
                    .map((id) => allPlayers.find((p) => p.id === id) ?? allPlayers[1]);
                  onStartMatch({
                    mode: 'blacktop',
                    title: `NBA BLACKTOP ${btFormat}v${btFormat}`,
                    subtitle: `Game to ${btTarget} · Outdoor Concrete Blacktop`,
                    homeTeamId: 'mia',
                    awayTeamId: 'okc',
                    homeCustomPlayers: squadA,
                    awayCustomPlayers: squadB,
                    userSide: 'home',
                    courtEnv: 'blacktop',
                    quarterLengthMin: 12,
                    targetScore: btTarget,
                    halfCourt: btHalfCourt,
                    playersPerSide: btFormat,
                  });
                }}
                className="w-full py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> Tip Off Blacktop {btFormat}v{btFormat}
              </button>
            </div>

            {/* All-Star Mini-Modes */}
            <div className="space-y-4">
              <div className="bg-[#0f1116]/94 border border-[#F9A01B]/40 rounded-xl p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#F9A01B]">ALL-STAR SATURDAY</div>
                <h3 className="text-lg font-black text-white uppercase mt-1">3-POINT SHOOTOUT</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  5 racks (25 balls including 2-pt Money Balls) in 60 seconds. Nail green releases from all 5 perimeter stations!
                </p>
                <button
                  onClick={() => {
                    Nba2k14Audio.playUiClick('select');
                    const curry = allPlayers.find((p) => p.name.includes('Stephen Curry')) ?? allPlayers[0];
                    onStartMatch({
                      mode: 'shootout3pt',
                      title: '3-POINT SHOOTOUT',
                      subtitle: '5 Racks · 25 Balls · 60 Seconds',
                      homeTeamId: 'gsw',
                      awayTeamId: 'mia',
                      homeCustomPlayers: [curry],
                      userSide: 'home',
                      courtEnv: 'nba',
                      quarterLengthMin: 1,
                      playersPerSide: 1,
                      halfCourt: true,
                    });
                  }}
                  className="mt-4 w-full py-2.5 rounded-lg bg-[#F9A01B] hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
                >
                  Launch 3-Point Shootout
                </button>
              </div>

              <div className="bg-[#0f1116]/94 border border-[#CE1141]/50 rounded-xl p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#CE1141]">SPRITE SLAM DUNK</div>
                <h3 className="text-lg font-black text-white uppercase mt-1">SLAM DUNK CONTEST</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Choose signature aerial slams (Tomahawk, 360 Windmill, Eastbay, Free-Throw Line), hit the timing meter, and earn a 50 from the 5 judges.
                </p>
                <button
                  onClick={() => {
                    Nba2k14Audio.playUiClick('select');
                    const lbj = allPlayers.find((p) => p.name.includes('LeBron James')) ?? allPlayers[0];
                    onStartMatch({
                      mode: 'dunkcontest',
                      title: 'SPRITE SLAM DUNK CONTEST',
                      subtitle: '5-Judge Panel · Signature Aerial Slams',
                      homeTeamId: 'mia',
                      awayTeamId: 'lac',
                      homeCustomPlayers: [lbj],
                      userSide: 'home',
                      courtEnv: 'nba',
                      quarterLengthMin: 2,
                      playersPerSide: 1,
                      halfCourt: true,
                    });
                  }}
                  className="mt-4 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer"
                >
                  Launch Slam Dunk Contest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. MyTEAM */}
        {subMode === 'myteam' && (
          !save.myTeam.starterOpened ? (
            <div className="max-w-2xl mx-auto bg-[#0f1116]/94 border border-[#F9A01B]/40 rounded-xl p-7 text-center">
              <Sparkles className="w-10 h-10 text-[#F9A01B] mx-auto" />
              <h2 className="text-2xl font-black text-white uppercase mt-2">WELCOME TO NBA 2K14 MyTEAM</h2>
              <p className="text-xs text-zinc-300 mt-2">
                Open your free 8-Card Starter Pack to build your dream lineup, pull Gold & Historic packs, conquer 30-Team Domination, and climb Road to the Playoffs.
              </p>
              <button
                onClick={openStarterPack}
                className="mt-5 px-8 py-3 rounded-xl bg-[#F9A01B] hover:bg-amber-400 text-black font-black uppercase text-sm tracking-wider cursor-pointer"
              >
                Open Free Starter Pack (8 Cards)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {(
                    [
                      { id: 'lineup', label: `Lineup (${save.myTeam.lineupCardIds.length}/8)` },
                      { id: 'packs', label: 'Pack Market' },
                      { id: 'domination', label: '30-Team Domination' },
                      { id: 'rttp', label: `RTTP (Seed ${save.myTeam.rttpSeed})` },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setMyTeamSubTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase cursor-pointer ${
                        myTeamSubTab === t.id ? 'bg-[#CE1141] text-white' : 'bg-[#171a22] text-zinc-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-zinc-300">
                  VC: <strong className="text-[#F9A01B]">{save.vip.vc.toLocaleString()}</strong> · MT: <strong className="text-emerald-400">{save.vip.mt.toLocaleString()}</strong>
                </div>
              </div>

              {packMessage && (
                <div className="bg-amber-500/15 border border-[#F9A01B] rounded-lg px-4 py-2 text-xs font-bold text-[#F9A01B]">
                  {packMessage}
                </div>
              )}

              {myTeamSubTab === 'lineup' && (
                <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4">
                  <div className="text-xs text-zinc-400 mb-3">
                    Click cards to add/remove from your active lineup (minimum 5 starters required).
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {save.myTeam.collection.map((card) => {
                      const active = save.myTeam.lineupCardIds.includes(card.id);
                      const tierBorder =
                        card.tier === 'Historic'
                          ? 'border-purple-400 bg-[#22162e]'
                          : card.tier === 'Gold'
                            ? 'border-[#F9A01B] bg-[#251e10]'
                            : card.tier === 'Silver'
                              ? 'border-zinc-300 bg-[#1d2028]'
                              : 'border-amber-700 bg-[#1c1612]';
                      return (
                        <button
                          key={card.id}
                          onClick={() => toggleLineupCard(card.id)}
                          className={`rounded-xl p-3 border-2 text-left transition cursor-pointer ${tierBorder} ${
                            active ? 'ring-2 ring-emerald-400' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-black text-white">{card.player.ovr}</span>
                            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black/50 text-zinc-200">
                              {card.player.pos}
                            </span>
                          </div>
                          <div className="text-xs font-black text-white mt-2 truncate">{card.player.name}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-bold">{card.tier} · {card.teamCode}</div>
                          <div className="mt-2 text-[10px] font-black uppercase text-emerald-400">
                            {active ? 'IN LINEUP' : '+ ADD'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {myTeamSubTab === 'packs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(
                    [
                      { tier: 'Bronze', cost: 500, desc: '3 Bronze NBA Player Cards', col: 'border-amber-700' },
                      { tier: 'Silver', cost: 1200, desc: '3 Silver Rotation Stars (77-85 OVR)', col: 'border-zinc-300' },
                      { tier: 'Gold', cost: 2500, desc: '3 Gold Superstars (85+ OVR)', col: 'border-[#F9A01B]' },
                      { tier: 'Historic', cost: 4000, desc: '3 Classic Legends & 91+ Icons', col: 'border-purple-400' },
                    ] as const
                  ).map((pk) => (
                    <div key={pk.tier} className={`bg-[#0f1116]/94 border-2 ${pk.col} rounded-xl p-5 flex flex-col justify-between`}>
                      <div>
                        <div className="text-xs font-black uppercase text-[#F9A01B]">{pk.tier} PACK</div>
                        <div className="text-2xl font-black text-white mt-1">{pk.cost.toLocaleString()} VC</div>
                        <p className="text-xs text-zinc-400 mt-2">{pk.desc}</p>
                      </div>
                      <button
                        onClick={() => buyMyTeamPack(pk.tier, pk.cost)}
                        className="mt-4 w-full py-2.5 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer"
                      >
                        Open Pack
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {myTeamSubTab === 'domination' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  {NBA_TEAMS.map((team) => {
                    const stars = save.myTeam.dominationStars[team.id] ?? 0;
                    return (
                      <div key={team.id} className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-white text-sm">{team.code}</span>
                            <span className="text-[10px] font-bold text-zinc-400">{team.ovr} OVR</span>
                          </div>
                          <div className="text-[11px] text-zinc-300 truncate">{team.name}</div>
                          <div className="flex gap-0.5 mt-1.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${stars >= s ? 'text-[#F9A01B] fill-[#F9A01B]' : 'text-zinc-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => launchMyTeamMatch(team.id, true)}
                          className="mt-2.5 w-full py-1.5 rounded bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-[10px] uppercase cursor-pointer"
                        >
                          Challenge
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {myTeamSubTab === 'rttp' && (
                <div className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-6 max-w-2xl">
                  <div className="text-xs font-black uppercase text-[#F9A01B]">ROAD TO THE PLAYOFFS</div>
                  <h3 className="text-2xl font-black text-white mt-1">CURRENT SEED: #{save.myTeam.rttpSeed}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Win 2 games per tier to advance from Seed #8 all the way to Seed #1 Championship Division. Wins so far: <strong className="text-white">{save.myTeam.rttpWins}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      const opp = NBA_TEAMS[(save.myTeam.rttpSeed * 3 + save.myTeam.rttpWins) % NBA_TEAMS.length];
                      launchMyTeamMatch(opp.id, false);
                    }}
                    className="mt-5 px-6 py-3 rounded-xl bg-[#CE1141] hover:bg-[#e1194d] text-white font-black uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Play Seed #{save.myTeam.rttpSeed} Ladder Match
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* 5. TRAINING CAMP */}
        {subMode === 'training' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TRAINING_DRILLS.map((drill) => (
              <div key={drill.id} className="bg-[#0f1116]/94 border border-white/15 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-[#F9A01B]">{drill.category}</span>
                    <span className="text-[10px] font-bold text-cyan-300">+{drill.spReward} SP</span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1">{drill.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{drill.instruction}</p>
                </div>
                <button
                  onClick={() => {
                    Nba2k14Audio.playUiClick('select');
                    const lbj = allPlayers.find((p) => p.name.includes('LeBron James')) ?? allPlayers[0];
                    onStartMatch({
                      mode: 'training',
                      title: `TRAINING CAMP · ${drill.title}`,
                      subtitle: `${drill.targetReps} Target Reps · Practice Gym`,
                      homeTeamId: 'mia',
                      awayTeamId: 'sas',
                      homeCustomPlayers: [lbj],
                      userSide: 'home',
                      courtEnv: 'practice',
                      quarterLengthMin: 3,
                      playersPerSide: 1,
                      halfCourt: true,
                      trainingDrillId: drill.id,
                    });
                  }}
                  className="mt-4 w-full py-2 rounded-lg bg-[#CE1141] hover:bg-[#e1194d] text-white font-black text-xs uppercase cursor-pointer"
                >
                  Enter Practice Court
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
