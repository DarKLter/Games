import { playerState, tryStorage } from '../../../core/storage';
import { MLBB_STARTER_EMOTES } from './data/emblems';
import { MLBB_ICONIC_HEROES } from './data/heroes';
import { MlbbProfileSave, MlbbUiControlLayout } from './types';

const MLBB_SAVE_KEY = 'mlbb_legends_arena_v1';

export function createDefaultCustomUi(preset: '3skill' | '4skill'): Record<string, MlbbUiControlLayout> {
  const base: Record<string, MlbbUiControlLayout> = {
    minimap: { id: 'minimap', label: 'Minimap', xPct: 2, yPct: 3, scale: 1.0, opacity: 0.96 },
    shopBar: { id: 'shopBar', label: 'Shop & Quick-Buy', xPct: 2, yPct: 36, scale: 1.0, opacity: 0.95 },
    joystick: { id: 'joystick', label: 'Move Joystick', xPct: 8, yPct: 76, scale: 1.0, opacity: 0.92 },
    recall: { id: 'recall', label: 'Recall', xPct: 43, yPct: 89, scale: 1.0, opacity: 0.94 },
    regen: { id: 'regen', label: 'Regen', xPct: 50, yPct: 89, scale: 1.0, opacity: 0.94 },
    spell: { id: 'spell', label: 'Battle Spell', xPct: 57, yPct: 89, scale: 1.0, opacity: 0.96 },
    activeItem: { id: 'activeItem', label: 'Active Item', xPct: 64, yPct: 78, scale: 1.0, opacity: 0.95 },
    skill1: { id: 'skill1', label: 'Skill 1', xPct: 73, yPct: 87, scale: 1.0, opacity: 0.96 },
    skill2: { id: 'skill2', label: 'Skill 2', xPct: 79, yPct: 71, scale: 1.0, opacity: 0.96 },
    skill3: { id: 'skill3', label: 'Ultimate', xPct: 89, yPct: 62, scale: 1.0, opacity: 0.96 },
    basicAtk: { id: 'basicAtk', label: 'Basic Attack', xPct: 89, yPct: 84, scale: 1.0, opacity: 0.98 },
    minionBtn: { id: 'minionBtn', label: 'Minion Target', xPct: 81, yPct: 91, scale: 0.95, opacity: 0.94 },
    turretBtn: { id: 'turretBtn', label: 'Turret Target', xPct: 95, yPct: 73, scale: 0.95, opacity: 0.94 },
    cancelCast: { id: 'cancelCast', label: 'Cancel Cast (X)', xPct: 90, yPct: 24, scale: 1.0, opacity: 0.96 },
    pings: { id: 'pings', label: 'Tactical Pings', xPct: 95, yPct: 22, scale: 1.0, opacity: 0.94 },
    comms: { id: 'comms', label: 'Chat & Emotes', xPct: 95, yPct: 44, scale: 1.0, opacity: 0.94 }
  };
  if (preset === '4skill') {
    base.skill4 = { id: 'skill4', label: 'Skill 4', xPct: 72, yPct: 68, scale: 0.95, opacity: 0.96 };
  }
  return base;
}

export function createDefaultMlbbSave(): MlbbProfileSave {
  const starterHeroes = MLBB_ICONIC_HEROES.filter((h) => h.starter).map((h) => h.id);
  const savedBuilds: Record<string, [string[], string[], string[]]> = {};
  const activeBuildSlot: Record<string, 0 | 1 | 2> = {};
  const ownedSkins: Record<string, string[]> = {};
  const equippedSkins: Record<string, string> = {};
  const heroStats: Record<string, { matches: number; wins: number; mmr: number; mastery: number }> = {};

  for (const h of MLBB_ICONIC_HEROES) {
    savedBuilds[h.id] = [
      [...h.recommendedBuild],
      [...h.recommendedBuild.slice(0, 4), 'athenas_shield', 'immortality'],
      [...h.recommendedBuild.slice(0, 4), 'sea_halberd', 'blade_of_despair']
    ];
    activeBuildSlot[h.id] = 0;
    ownedSkins[h.id] = ['default'];
    equippedSkins[h.id] = 'default';
    heroStats[h.id] = { matches: h.starter ? 3 : 0, wins: h.starter ? 2 : 0, mmr: 1200 + (h.starter ? 240 : 0), mastery: h.starter ? 45 : 0 };
  }

  return {
    version: 1,
    accountId: '941827401',
    serverId: '3024',
    name: playerState.username || 'DawnCommander',
    avatar: '⚔️',
    border: 'Imperial Gold',
    countryFlag: '🇵🇭',
    gender: 'Unspecified',
    bio: 'Road to Mythical Glory — Fill any lane!',
    battleTitle: 'Supreme Mid Laner',
    level: 30,
    exp: 680,
    rankTierIdx: 6, // Mythic 25★
    rankStars: 25,
    starProtectionPts: 650,
    bp: 32500,
    tickets: 480,
    diamonds: 650,
    fragments: 145,
    charisma: 4820,
    creditScore: 110,
    dailyActivity: 420,
    claimedDailyMilestones: [200],
    dailyTasksDone: ['task_login'],
    weeklyActivity: 520,
    claimedActivityMilestones: [200],
    starlightLevel: 12,
    starlightXp: 640,
    claimedStarlightLevels: [1, 5, 10],
    claimedMailIds: [],
    claimedAchievementIds: [],
    claimedMasteryChapters: {},
    ownedHeroIds: starterHeroes,
    ownedSkins,
    equippedSkins,
    showcaseHeroId: 'miya',
    selectedHeroId: 'miya',
    selectedLane: 'Gold',
    selectedMode: 'ranked',
    selectedMapVariant: 'random',
    selectedSpellId: 'flicker',
    selectedEmblemId: 'marksman',
    emblemTalents: {
      common: { t1: 'vitality', t2: 'bargain_hunter', t3: 'quantum_charge' },
      tank: { t1: 'vitality', t2: 'pull_yourself_together', t3: 'concussive_blast' },
      assassin: { t1: 'rupture', t2: 'seasoned_hunter', t3: 'killing_spree' },
      mage: { t1: 'thrill', t2: 'weapon_master', t3: 'lethal_ignition' },
      fighter: { t1: 'thrill', t2: 'festival_of_blood', t3: 'brave_smite' },
      support: { t1: 'agility', t2: 'pull_yourself_together', t3: 'impure_rage' },
      marksman: { t1: 'swift', t2: 'weapon_master', t3: 'quantum_charge' }
    },
    savedBuilds,
    activeBuildSlot,
    quickChatIds: ['qc_attack', 'qc_retreat', 'qc_gather_turtle', 'qc_gather_lord', 'qc_push', 'qc_well_played'],
    ownedEmotes: [...MLBB_STARTER_EMOTES, 'emote_crown', 'emote_dragon'],
    equippedEmotes: [...MLBB_STARTER_EMOTES],
    ownedEffects: {
      recall: ['rec_dawn'],
      spawn: ['spn_classic'],
      elim: ['elm_default'],
      killNotif: ['kn_default']
    },
    equippedEffects: {
      recall: 'rec_dawn',
      spawn: 'spn_classic',
      elim: 'elm_default',
      killNotif: 'kn_default'
    },
    backpack: {
      trialCards: 3,
      doubleBpCards: 2,
      doubleExpCards: 2,
      starProtectionCards: 2,
      starRaisingCards: 1,
      chests: 2
    },
    squad: {
      name: 'Dawn Vanguard',
      tag: 'DVG',
      slogan: 'Objective first, Savage second.',
      activity: 8420,
      rank: 'Regional #14'
    },
    matchHistory: [
      {
        id: 'seed_match_1',
        timestamp: Date.now() - 3600 * 1000 * 5,
        mode: 'ranked',
        victory: true,
        durationSec: 942,
        blueKills: 29,
        redKills: 18,
        playerHeroId: 'miya',
        playerHeroName: 'Miya',
        kda: [11, 2, 9],
        rating: 11.4,
        medal: 'MVP',
        items: ['swift_boots', 'windtalker', 'berserkers_fury', 'haas_claws', 'malefic_roar', 'wind_of_nature'],
        players: [
          {
            id: 'b0',
            name: playerState.username || 'DawnCommander',
            team: 'blue',
            heroId: 'miya',
            heroName: 'Miya',
            role: 'Marksman',
            lane: 'Gold',
            isPlayer: true,
            level: 15,
            kills: 11,
            deaths: 2,
            assists: 9,
            gold: 13840,
            items: ['swift_boots', 'windtalker', 'berserkers_fury', 'haas_claws', 'malefic_roar', 'wind_of_nature'],
            spellId: 'inspire',
            emblemId: 'marksman',
            coreTalentId: 'quantum_charge',
            damageDealt: 112400,
            damageTaken: 41200,
            turretDamage: 18900,
            teamfightPct: 69,
            rating: 11.4,
            medal: 'MVP',
            isMvp: true
          },
          {
            id: 'b1',
            name: 'TigrealSet',
            team: 'blue',
            heroId: 'tigreal',
            heroName: 'Tigreal',
            role: 'Tank',
            lane: 'Roam',
            isPlayer: false,
            level: 13,
            kills: 2,
            deaths: 3,
            assists: 18,
            gold: 8420,
            items: ['tough_boots', 'dominance_ice', 'athenas_shield', 'antique_cuirass', 'immortality'],
            spellId: 'flicker',
            emblemId: 'tank',
            coreTalentId: 'concussive_blast',
            damageDealt: 28500,
            damageTaken: 128900,
            turretDamage: 2400,
            teamfightPct: 79,
            rating: 9.8,
            medal: 'Gold',
            isMvp: false
          },
          {
            id: 'b2',
            name: 'LanceDash',
            team: 'blue',
            heroId: 'lancelot',
            heroName: 'Lancelot',
            role: 'Assassin',
            lane: 'Jungle',
            isPlayer: false,
            level: 15,
            kills: 9,
            deaths: 4,
            assists: 7,
            gold: 12950,
            items: ['tough_boots', 'hunter_strike', 'endless_battle', 'blade_of_the_heptaseas', 'malefic_roar', 'immortality'],
            spellId: 'retribution',
            emblemId: 'assassin',
            coreTalentId: 'killing_spree',
            damageDealt: 89300,
            damageTaken: 52100,
            turretDamage: 6200,
            teamfightPct: 62,
            rating: 9.4,
            medal: 'Gold',
            isMvp: false
          },
          {
            id: 'b3',
            name: 'KaguraMain',
            team: 'blue',
            heroId: 'eudora',
            heroName: 'Eudora',
            role: 'Mage',
            lane: 'Mid',
            isPlayer: false,
            level: 14,
            kills: 5,
            deaths: 4,
            assists: 11,
            gold: 10820,
            items: ['arcane_boots', 'genius_wand', 'lightning_truncheon', 'holy_crystal', 'divine_glaive'],
            spellId: 'flicker',
            emblemId: 'mage',
            coreTalentId: 'lethal_ignition',
            damageDealt: 76200,
            damageTaken: 35600,
            turretDamage: 4100,
            teamfightPct: 58,
            rating: 8.6,
            medal: 'Gold',
            isMvp: false
          },
          {
            id: 'b4',
            name: 'ZilongBot',
            team: 'blue',
            heroId: 'zilong',
            heroName: 'Zilong',
            role: 'Fighter',
            lane: 'EXP',
            isPlayer: false,
            level: 14,
            kills: 2,
            deaths: 5,
            assists: 6,
            gold: 9940,
            items: ['swift_boots', 'windtalker', 'berserkers_fury', 'great_dragon_spear', 'blade_of_despair'],
            spellId: 'inspire',
            emblemId: 'fighter',
            coreTalentId: 'brave_smite',
            damageDealt: 51400,
            damageTaken: 64200,
            turretDamage: 14500,
            teamfightPct: 44,
            rating: 7.5,
            medal: 'Silver',
            isMvp: false
          },
          {
            id: 'r0',
            name: 'ShadowKain',
            team: 'red',
            heroId: 'layla',
            heroName: 'Layla',
            role: 'Marksman',
            lane: 'Gold',
            isPlayer: false,
            level: 14,
            kills: 7,
            deaths: 6,
            assists: 4,
            gold: 11200,
            items: ['swift_boots', 'windtalker', 'berserkers_fury', 'haas_claws', 'malefic_roar'],
            spellId: 'flicker',
            emblemId: 'marksman',
            coreTalentId: 'quantum_charge',
            damageDealt: 78400,
            damageTaken: 46100,
            turretDamage: 7400,
            teamfightPct: 61,
            rating: 8.2,
            medal: 'MVP',
            isMvp: true
          },
          {
            id: 'r1',
            name: 'VexanaPro',
            team: 'red',
            heroId: 'nana',
            heroName: 'Nana',
            role: 'Mage',
            lane: 'Mid',
            isPlayer: false,
            level: 13,
            kills: 4,
            deaths: 5,
            assists: 8,
            gold: 9600,
            items: ['arcane_boots', 'enchanted_talisman', 'lightning_truncheon', 'holy_crystal'],
            spellId: 'flameshot',
            emblemId: 'mage',
            coreTalentId: 'lethal_ignition',
            damageDealt: 62100,
            damageTaken: 38200,
            turretDamage: 2800,
            teamfightPct: 67,
            rating: 7.4,
            medal: 'Silver',
            isMvp: false
          },
          {
            id: 'r2',
            name: 'CrimsonFang',
            team: 'red',
            heroId: 'alucard',
            heroName: 'Alucard',
            role: 'Fighter',
            lane: 'Jungle',
            isPlayer: false,
            level: 13,
            kills: 4,
            deaths: 6,
            assists: 5,
            gold: 9850,
            items: ['tough_boots', 'endless_battle', 'hunter_strike', 'blade_of_despair'],
            spellId: 'retribution',
            emblemId: 'assassin',
            coreTalentId: 'killing_spree',
            damageDealt: 58300,
            damageTaken: 71400,
            turretDamage: 3200,
            teamfightPct: 50,
            rating: 6.8,
            medal: 'Silver',
            isMvp: false
          },
          {
            id: 'r3',
            name: 'Aetheris',
            team: 'red',
            heroId: 'franco',
            heroName: 'Franco',
            role: 'Tank',
            lane: 'Roam',
            isPlayer: false,
            level: 12,
            kills: 1,
            deaths: 6,
            assists: 9,
            gold: 7210,
            items: ['rapid_boots', 'dominance_ice', 'athenas_shield', 'immortality'],
            spellId: 'flicker',
            emblemId: 'tank',
            coreTalentId: 'concussive_blast',
            damageDealt: 22100,
            damageTaken: 98400,
            turretDamage: 900,
            teamfightPct: 55,
            rating: 6.4,
            medal: 'Silver',
            isMvp: false
          },
          {
            id: 'r4',
            name: 'GrimBlade',
            team: 'red',
            heroId: 'balmond',
            heroName: 'Balmond',
            role: 'Fighter',
            lane: 'EXP',
            isPlayer: false,
            level: 13,
            kills: 2,
            deaths: 6,
            assists: 4,
            gold: 8820,
            items: ['warrior_boots', 'war_axe', 'cursed_helmet', 'brute_force_breastplate'],
            spellId: 'vengeance',
            emblemId: 'fighter',
            coreTalentId: 'brave_smite',
            damageDealt: 44600,
            damageTaken: 86500,
            turretDamage: 4100,
            teamfightPct: 39,
            rating: 5.9,
            medal: 'Bronze',
            isMvp: false
          }
        ]
      }
    ],
    heroStats,
    likesReceived: [
      { id: 'lk1', from: 'KairiShadow', hero: 'Lancelot', likedBack: false },
      { id: 'lk2', from: 'OhMyV33', hero: 'Estes', likedBack: true },
      { id: 'lk3', from: 'WiseRetri', hero: 'Tigreal', likedBack: false }
    ],
    namecardLikes: 148,
    namecardSuperLikes: 36,
    activeIdCard: 'mythic_medal',
    selectedServerRegion: 'SEA-3024 (Original)',
    boundAccounts: { moonton: true, google: true, apple: false, facebook: false },
    affinityLinks: [
      { id: 'af1', name: 'KaguraMain', role: 'Partner', level: 6, pts: 4820, heroId: 'eudora' },
      { id: 'af2', name: 'TigrealSet', role: 'Bro', level: 4, pts: 2450, heroId: 'tigreal' },
      { id: 'af3', name: 'EstesHeal', role: 'Bestie', level: 5, pts: 3190, heroId: 'estes' },
      { id: 'af4', name: 'LanceDash', role: 'Confidant', level: 3, pts: 1620, heroId: 'lancelot' }
    ],
    photoAlbum: [
      { id: 'ph1', caption: 'Late-game Lord steal & Savage wipe!', heroId: 'miya', date: 'Season 36', likes: 42 },
      { id: 'ph2', caption: '5-man Conceal Tigreal set in Mid', heroId: 'tigreal', date: 'Season 36', likes: 31 },
      { id: 'ph3', caption: 'Reached Mythic 25★ with 72% WR', heroId: 'lancelot', date: 'Season 36', likes: 59 }
    ],
    esportsPredictions: {},
    arcadeSubMode: 'mayhem',
    customSubMode: '5v5',
    secondaryPasswordEnabled: false,
    settings: {
      basics: {
        outline: true,
        screenShake: true,
        cameraHeight: 'high',
        shadows: true,
        creepHpNumbers: true,
        damageText: true,
        colorblind: 'off',
        refreshRate: 60,
        graphicsQuality: 'high',
        hdMode: true,
        mapTheme: 'imperial_sanctuary'
      },
      controls: {
        targetingMethod: 'advanced',
        targetingPriority: 'lowest_hp',
        heroLockMode: true,
        skillSmartTargeting: true,
        basicSmartTargeting: true,
        attackAssist: true,
        aimPanning: true,
        joystickPosition: 'fixed',
        skillCancelMethod: 'drag_to_x',
        cameraPanSensitivity: 65,
        autoLevelUp: false,
        autoBuy: false,
        aiDifficulty: 'epic'
      },
      interface: {
        battlefieldUiOpacity: 88,
        activeSkillPreset: '3skill',
        editorSnapToGrid: true,
        customUi3Skill: createDefaultCustomUi('3skill'),
        customUi4Skill: createDefaultCustomUi('4skill')
      },
      sound: {
        master: 80,
        sfx: 85,
        bgm: 60,
        voice: 80,
        mic: 70,
        language: 'English',
        killAnnouncer: true
      },
      network: {
        speedMode: true,
        networkBoost: true,
        showPingFps: true
      },
      privacy: {
        hideMatchHistory: false,
        hideFavoriteHeroes: false,
        hideOnlineStatus: false,
        hideRegion: false,
        blockNonFriendInvites: false
      },
      resources: {
        hdVfxPack: true,
        hdAudioPack: true
      }
    }
  };
}

export function loadMlbbSave(): MlbbProfileSave {
  const def = createDefaultMlbbSave();
  try {
    const raw = tryStorage.getItem(MLBB_SAVE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw) as Partial<MlbbProfileSave>;
    return {
      ...def,
      ...parsed,
      ownedHeroIds: Array.isArray(parsed.ownedHeroIds) && parsed.ownedHeroIds.length > 0 ? parsed.ownedHeroIds : def.ownedHeroIds,
      savedBuilds: { ...def.savedBuilds, ...(parsed.savedBuilds ?? {}) },
      activeBuildSlot: { ...def.activeBuildSlot, ...(parsed.activeBuildSlot ?? {}) },
      ownedSkins: { ...def.ownedSkins, ...(parsed.ownedSkins ?? {}) },
      equippedSkins: { ...def.equippedSkins, ...(parsed.equippedSkins ?? {}) },
      heroStats: { ...def.heroStats, ...(parsed.heroStats ?? {}) },
      claimedMasteryChapters: { ...def.claimedMasteryChapters, ...(parsed.claimedMasteryChapters ?? {}) },
      emblemTalents: { ...def.emblemTalents, ...(parsed.emblemTalents ?? {}) },
      ownedEffects: { ...def.ownedEffects, ...(parsed.ownedEffects ?? {}) },
      equippedEffects: { ...def.equippedEffects, ...(parsed.equippedEffects ?? {}) },
      backpack: { ...def.backpack, ...(parsed.backpack ?? {}) },
      squad: { ...def.squad, ...(parsed.squad ?? {}) },
      boundAccounts: { ...def.boundAccounts, ...(parsed.boundAccounts ?? {}) },
      affinityLinks: Array.isArray(parsed.affinityLinks) && parsed.affinityLinks.length > 0 ? parsed.affinityLinks : def.affinityLinks,
      photoAlbum: Array.isArray(parsed.photoAlbum) && parsed.photoAlbum.length > 0 ? parsed.photoAlbum : def.photoAlbum,
      claimedDailyMilestones: Array.isArray(parsed.claimedDailyMilestones) ? parsed.claimedDailyMilestones : def.claimedDailyMilestones,
      dailyTasksDone: Array.isArray(parsed.dailyTasksDone) ? parsed.dailyTasksDone : def.dailyTasksDone,
      esportsPredictions: { ...def.esportsPredictions, ...(parsed.esportsPredictions ?? {}) },
      settings: {
        basics: { ...def.settings.basics, ...(parsed.settings?.basics ?? {}) },
        controls: { ...def.settings.controls, ...(parsed.settings?.controls ?? {}) },
        interface: {
          ...def.settings.interface,
          ...(parsed.settings?.interface ?? {}),
          customUi3Skill: { ...def.settings.interface.customUi3Skill, ...(parsed.settings?.interface?.customUi3Skill ?? {}) },
          customUi4Skill: { ...def.settings.interface.customUi4Skill, ...(parsed.settings?.interface?.customUi4Skill ?? {}) }
        },
        sound: { ...def.settings.sound, ...(parsed.settings?.sound ?? {}) },
        network: { ...def.settings.network, ...(parsed.settings?.network ?? {}) },
        privacy: { ...def.settings.privacy, ...(parsed.settings?.privacy ?? {}) },
        resources: { ...def.settings.resources, ...(parsed.settings?.resources ?? {}) }
      }
    };
  } catch {
    return def;
  }
}

export function saveMlbbProfile(save: MlbbProfileSave): void {
  tryStorage.setItem(MLBB_SAVE_KEY, JSON.stringify(save));
}

export function resetMlbbSave(): MlbbProfileSave {
  const fresh = createDefaultMlbbSave();
  saveMlbbProfile(fresh);
  return fresh;
}
