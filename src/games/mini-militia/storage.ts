import { playerState, tryStorage } from '../../core/storage';
import {
  MiniMilitiaSave,
  MmAvatarConfig,
  MmHudControlLayout,
  MmMatchSummary
} from './types';
import { getMmRankForXp } from './data/progression';

const MM_SAVE_KEY = 'mini_militia_da2_v1';

export function createDefaultHudLayout(): Record<string, MmHudControlLayout> {
  return {
    leftStick: { id: 'leftStick', label: 'Move / Jetpack Stick', xPct: 12, yPct: 76, scale: 1.0, opacity: 0.85 },
    rightStick: { id: 'rightStick', label: 'Aim / Auto-Fire Stick', xPct: 88, yPct: 76, scale: 1.0, opacity: 0.85 },
    fireBtn: { id: 'fireBtn', label: 'Fire Button', xPct: 78, yPct: 60, scale: 1.0, opacity: 0.9 },
    crouchBtn: { id: 'crouchBtn', label: 'Crouch / Roll', xPct: 26, yPct: 87, scale: 0.95, opacity: 0.88 },
    meleeBtn: { id: 'meleeBtn', label: 'Melee / Machete', xPct: 74, yPct: 86, scale: 1.0, opacity: 0.92 },
    grenadeBtn: { id: 'grenadeBtn', label: 'Grenade', xPct: 86, yPct: 12, scale: 1.0, opacity: 0.94 },
    reloadBtn: { id: 'reloadBtn', label: 'Reload', xPct: 86, yPct: 24, scale: 0.95, opacity: 0.92 },
    zoomBtn: { id: 'zoomBtn', label: 'Zoom Scope', xPct: 10, yPct: 28, scale: 0.95, opacity: 0.92 },
    weaponBox: { id: 'weaponBox', label: 'Weapon Slot', xPct: 50, yPct: 8, scale: 1.0, opacity: 0.96 },
    quickChat: { id: 'quickChat', label: 'Quick Chat', xPct: 93, yPct: 36, scale: 0.95, opacity: 0.9 }
  };
}

function defaultAvatarPresets(): MmAvatarConfig[] {
  return [
    {
      name: 'Commando',
      skinTone: '#F7CBA4',
      eyeStyle: 'determined',
      headgear: 'army_helmet',
      eyewear: 'aviators',
      facial: 'stubble',
      outfit: 'olive_camo',
      boots: 'steel',
      accentColor: '#F5A623'
    },
    {
      name: 'Sarge Style',
      skinTone: '#E5B285',
      eyeStyle: 'sarge',
      headgear: 'red_beret',
      eyewear: 'none',
      facial: 'cigar',
      outfit: 'desert_camo',
      boots: 'desert_boots',
      accentColor: '#F59E0B'
    },
    {
      name: 'Shadow Ninja',
      skinTone: '#F7CBA4',
      eyeStyle: 'angry',
      headgear: 'ninja_hood',
      eyewear: 'none',
      facial: 'clean',
      outfit: 'ninja_gi',
      boots: 'stealth_boots',
      accentColor: '#EF4444'
    },
    {
      name: 'SWAT Breacher',
      skinTone: '#C68642',
      eyeStyle: 'cool',
      headgear: 'swat_helmet',
      eyewear: 'tactical_goggles',
      facial: 'respirator',
      outfit: 'black_swat',
      boots: 'plasma_blue',
      accentColor: '#38BDF8'
    },
    {
      name: 'Lunar Trooper',
      skinTone: '#9CA3AF',
      eyeStyle: 'cyber',
      headgear: 'space_visor',
      eyewear: 'cyber_visor',
      facial: 'clean',
      outfit: 'space_suit',
      boots: 'cyber_boots',
      accentColor: '#22D3EE'
    },
    {
      name: 'Commander Gold',
      skinTone: '#E5B285',
      eyeStyle: 'scarred',
      headgear: 'crown',
      eyewear: 'monocle',
      facial: 'full_beard',
      outfit: 'golden_commander',
      boots: 'gold',
      accentColor: '#FDE047'
    }
  ];
}

export function createDefaultMiniMilitiaSave(): MiniMilitiaSave {
  return {
    version: 1,
    callsign: playerState.username || 'Soldier',
    clanTag: 'DA2',
    playerId: 'DA2-481920',
    xp: 2650, // Starts at Corporal with room to rank up fast!
    coins: 950,
    cash: 320,
    proPackUnlocked: false,
    preferredTeam: 'auto',
    activeAvatarPreset: 0,
    avatarPresets: defaultAvatarPresets(),
    activeLoadoutId: 'classic_default',
    customLoadouts: [
      {
        id: 'custom_1',
        name: 'Custom Slot 1',
        primaryId: 'm4',
        secondaryId: 'deagle',
        grenadeId: 'frag',
        grenadeCount: 3,
        perkId: 'jet_booster',
        coinCost: 220,
        desc: 'Player custom tactical loadout #1.'
      },
      {
        id: 'custom_2',
        name: 'Custom Slot 2',
        primaryId: 'uzi',
        secondaryId: 'uzi',
        dualWieldStart: true,
        grenadeId: 'gas',
        grenadeCount: 3,
        perkId: 'quick_hands',
        coinCost: 260,
        desc: 'Dual Uzi CQC custom loadout #2.'
      },
      {
        id: 'custom_3',
        name: 'Custom Slot 3',
        primaryId: 'm93ba',
        secondaryId: 'machete',
        grenadeId: 'proxy',
        grenadeCount: 3,
        perkId: 'heavy_armor',
        coinCost: 420,
        desc: 'Sniper + Machete custom loadout #3.'
      }
    ],
    unlockedLoadoutIds: ['classic_default', 'pistol_specialist', 'custom_1', 'custom_2', 'custom_3'],
    unlockedCosmeticIds: [
      'army_helmet', 'bald', 'buzzcut', 'spiked_hair', 'red_beret', 'commando_bandana',
      'none', 'aviators', 'tactical_goggles',
      'clean', 'sarge_stache', 'stubble', 'full_beard',
      'olive_camo', 'desert_camo', 'black_swat',
      'steel', 'desert_boots'
    ],
    unlockedWeaponSkins: {},
    stats: {
      matches: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      headshots: 0,
      meleeKills: 0,
      grenadeKills: 0,
      dualWieldKills: 0,
      sniperHeadshots: 0,
      macheteKills: 0,
      smawKills: 0,
      flameKills: 0,
      sawKills: 0,
      flagCaptures: 0,
      bombActions: 0,
      suicides: 0,
      bestKillstreak: 0,
      bestMultiKill: 0,
      survivalBestWave: 0,
      survivalBestTimeSec: 0,
      bootcampCompleted: false
    },
    weaponMastery: {},
    matchHistory: [],
    claimedAchievements: [],
    friends: [
      { id: 'fr_sarge', callsign: 'Sarge', clanTag: 'DA2', rankIndex: 20, online: true, inSquad: true },
      { id: 'fr_wolf', callsign: 'SniperWolf', clanTag: 'PRO', rankIndex: 14, online: true, inSquad: false },
      { id: 'fr_jet', callsign: 'JetAce', clanTag: 'AIR', rankIndex: 11, online: true, inSquad: false },
      { id: 'fr_saw', callsign: 'SawBlade', clanTag: 'CAT', rankIndex: 9, online: false, inSquad: false }
    ],
    settings: {
      controls: {
        controlScheme: 'dual_stick',
        joystickAnchor: 'floating',
        moveSensitivity: 1.0,
        aimSensitivity: 1.0,
        fireRingThreshold: 72,
        aimAssist: 'low',
        crosshairStyle: 'laser_dot',
        weaponLookAhead: 65,
        autoReload: true,
        combatRollMode: 'double_down',
        leftHanded: false
      },
      video: {
        mmcEnhanced: true,
        hitEffects: 'red',
        screenShake: true,
        targetFps: 60,
        showFpsPing: true,
        showNametags: true
      },
      audio: {
        master: 80,
        sfx: 85,
        music: 45,
        voice: 80,
        muted: false
      },
      gameplay: {
        region: 'auto',
        classicV4Default: false,
        unarmedZoom: true,
        autoPickupItems: true,
        showOffscreenArrows: true
      }
    },
    customHud: createDefaultHudLayout()
  };
}

export function loadMiniMilitiaSave(): MiniMilitiaSave {
  const def = createDefaultMiniMilitiaSave();
  try {
    const raw = tryStorage.getItem(MM_SAVE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw) as Partial<MiniMilitiaSave>;
    return {
      ...def,
      ...parsed,
      avatarPresets:
        Array.isArray(parsed.avatarPresets) && parsed.avatarPresets.length === 6
          ? parsed.avatarPresets
          : def.avatarPresets,
      customLoadouts:
        Array.isArray(parsed.customLoadouts) && parsed.customLoadouts.length === 3
          ? parsed.customLoadouts
          : def.customLoadouts,
      stats: { ...def.stats, ...(parsed.stats ?? {}) },
      weaponMastery: { ...def.weaponMastery, ...(parsed.weaponMastery ?? {}) },
      settings: {
        controls: { ...def.settings.controls, ...(parsed.settings?.controls ?? {}) },
        video: { ...def.settings.video, ...(parsed.settings?.video ?? {}) },
        audio: { ...def.settings.audio, ...(parsed.settings?.audio ?? {}) },
        gameplay: { ...def.settings.gameplay, ...(parsed.settings?.gameplay ?? {}) }
      },
      customHud: { ...def.customHud, ...(parsed.customHud ?? {}) }
    };
  } catch {
    return def;
  }
}

export function saveMiniMilitiaProfile(save: MiniMilitiaSave): void {
  tryStorage.setItem(MM_SAVE_KEY, JSON.stringify(save));
}

export function resetMiniMilitiaSave(): MiniMilitiaSave {
  const fresh = createDefaultMiniMilitiaSave();
  saveMiniMilitiaProfile(fresh);
  return fresh;
}

export function applyMatchSummaryToSave(prev: MiniMilitiaSave, sum: MmMatchSummary): MiniMilitiaSave {
  const nextMastery = { ...prev.weaponMastery };
  for (const [wid, delta] of Object.entries(sum.weaponDeltas)) {
    const cur = nextMastery[wid] ?? { kills: 0, shotsFired: 0, shotsHit: 0, headshots: 0 };
    nextMastery[wid] = {
      kills: cur.kills + delta.kills,
      shotsFired: cur.shotsFired + delta.shotsFired,
      shotsHit: cur.shotsHit + delta.shotsHit,
      headshots: cur.headshots + delta.headshots
    };
  }

  const prevRank = getMmRankForXp(prev.xp).current.index;
  const nextXp = prev.xp + sum.xpEarned;
  const nextRank = getMmRankForXp(nextXp).current.index;
  const rankBonusCash = nextRank > prevRank ? (nextRank - prevRank) * 75 : 0;

  const historyEntry = {
    id: `m_${Date.now()}`,
    timestamp: Date.now(),
    mapId: sum.mapId,
    mapName: sum.mapName,
    mode: sum.mode,
    victory: sum.victory,
    kills: sum.playerKills,
    deaths: sum.playerDeaths,
    assists: sum.playerAssists,
    scoreBlue: sum.scoreBlue,
    scoreRed: sum.scoreRed,
    waveReached: sum.mode === 'survival' ? sum.waveReached : undefined,
    isMvp: sum.isMvp,
    xpEarned: sum.xpEarned,
    coinsEarned: sum.coinsEarned
  };

  return {
    ...prev,
    xp: nextXp,
    coins: prev.coins + sum.coinsEarned,
    cash: prev.cash + sum.cashEarned + rankBonusCash,
    stats: {
      matches: prev.stats.matches + 1,
      wins: prev.stats.wins + (sum.victory ? 1 : 0),
      kills: prev.stats.kills + sum.playerKills,
      deaths: prev.stats.deaths + sum.playerDeaths,
      assists: prev.stats.assists + sum.playerAssists,
      headshots: prev.stats.headshots + sum.headshots,
      meleeKills: prev.stats.meleeKills + sum.meleeKills,
      grenadeKills: prev.stats.grenadeKills + sum.grenadeKills,
      dualWieldKills: prev.stats.dualWieldKills + sum.dualWieldKills,
      sniperHeadshots: prev.stats.sniperHeadshots + sum.sniperHeadshots,
      macheteKills: prev.stats.macheteKills + sum.macheteKills,
      smawKills: prev.stats.smawKills + sum.smawKills,
      flameKills: prev.stats.flameKills + sum.flameKills,
      sawKills: prev.stats.sawKills + sum.sawKills,
      flagCaptures: prev.stats.flagCaptures + sum.flagCaptures,
      bombActions: prev.stats.bombActions + sum.bombActions,
      suicides: prev.stats.suicides + sum.suicides,
      bestKillstreak: Math.max(prev.stats.bestKillstreak, sum.bestStreak),
      bestMultiKill: Math.max(prev.stats.bestMultiKill, sum.bestMultiKill),
      survivalBestWave: Math.max(prev.stats.survivalBestWave, sum.waveReached),
      survivalBestTimeSec:
        sum.mode === 'survival'
          ? Math.max(prev.stats.survivalBestTimeSec, Math.round(sum.durationSec))
          : prev.stats.survivalBestTimeSec,
      bootcampCompleted: prev.stats.bootcampCompleted || (sum.mode === 'bootcamp' && sum.victory)
    },
    weaponMastery: nextMastery,
    matchHistory: [historyEntry, ...prev.matchHistory].slice(0, 20)
  };
}
