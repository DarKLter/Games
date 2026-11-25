import React, { useCallback, useEffect, useState } from 'react';
import {
  MlbbLane,
  MlbbMatchLaunchConfig,
  MlbbMatchRecord,
  MlbbModeId,
  MlbbProfileSave,
  MlbbScreen,
  MlbbSettingsState
} from '../types';
import { loadMlbbSave, saveMlbbProfile } from '../storage';
import { getMlbbHeroById } from '../data/heroes';
import { MLBB_RANK_TIERS } from '../data/emblems';
import { mlbbAudio } from '../engine/AudioEngine';
import { computePostMatchProgression } from '../engine/SmartAiBrain';
import { LobbyModalType, MainLobby } from './MainLobby';
import { ProfileAndHubModals } from './ProfileAndHubModals';
import { PrepAndHeroModals } from './PrepAndHeroModals';
import { HeroGalleryModal } from './HeroGalleryModal';
import { DraftPickScreen, MatchLoadingScreen, MlbbInvitedPartyMember, PreMatchRoom } from './PreMatchFlow';
import { SettingsAndCustomUiModal } from './SettingsAndCustomUi';
import { BattleHUD } from './BattleHUD';
import { PostMatchScreen } from './InMatchOverlays';
import { LiveStreamOverlay } from './LiveStreamOverlay';
import '../mlbb.css';

interface MlbbExperienceShellProps {
  onExitToArcade: () => void;
}

export const MlbbExperienceShell: React.FC<MlbbExperienceShellProps> = ({ onExitToArcade }) => {
  const [profile, setProfile] = useState<MlbbProfileSave>(() => loadMlbbSave());
  const [screen, setScreen] = useState<MlbbScreen>('lobby');
  const [lobbyModal, setLobbyModal] = useState<LobbyModalType>(null);
  const [activeMode, setActiveMode] = useState<MlbbModeId>('ranked');
  const [invitedParty, setInvitedParty] = useState<MlbbInvitedPartyMember[]>([]);
  const [launchConfig, setLaunchConfig] = useState<MlbbMatchLaunchConfig | null>(null);
  const [lastMatch, setLastMatch] = useState<{
    record: MlbbMatchRecord;
    starDelta: number;
    starProtected: boolean;
    starProtectionSource: 'points' | 'card' | null;
    starRaisedBonus: boolean;
    bpGain: number;
    expGain: number;
    doubleBpUsed: boolean;
    doubleExpUsed: boolean;
    mmrDelta: number;
    masteryGain: number;
  } | null>(null);

  useEffect(() => {
    saveMlbbProfile(profile);
    mlbbAudio.setVolumes(profile.settings.sound);
  }, [profile]);

  // Stop ambient Lobby Sanctuary BGM when entering Battle/LiveStream or leaving Legends Arena
  useEffect(() => {
    if (screen === 'battle' || screen === 'livestream' || screen === 'loading') {
      mlbbAudio.stopLobbyBgm();
    }
  }, [screen]);

  useEffect(() => {
    return () => {
      mlbbAudio.stopLobbyBgm();
    };
  }, []);

  const updateProfile = useCallback((fn: (prev: MlbbProfileSave) => MlbbProfileSave) => {
    setProfile((prev) => fn(prev));
  }, []);

  const updateSettings = useCallback((next: MlbbSettingsState) => {
    setProfile((prev) => ({ ...prev, settings: next }));
  }, []);

  const handleLaunchMode = (mode: MlbbModeId) => {
    setActiveMode(mode);
    setLobbyModal(null);
    setProfile((prev) => ({ ...prev, selectedMode: mode }));
    setScreen('prematch');
  };

  const handleQuickPracticeHero = useCallback(
    (heroId: string, skinId: string, lane: MlbbLane) => {
      const hero = getMlbbHeroById(heroId);
      const slotIdx = profile.activeBuildSlot[heroId] ?? 0;
      const savedBuildsForHero = profile.savedBuilds[heroId];
      const playerBuild =
        savedBuildsForHero && savedBuildsForHero[slotIdx] && savedBuildsForHero[slotIdx].length > 0
          ? savedBuildsForHero[slotIdx]
          : hero.recommendedBuild;
      const opponentId = heroId === 'zilong' ? 'layla' : 'zilong';
      const emblemId = profile.selectedEmblemId;
      const talents = profile.emblemTalents[emblemId] ?? { t1: 'thrill', t2: 'festival_blood', t3: 'lethal_ignition' };

      const resolvedVariant =
        profile.selectedMapVariant === 'random' ? 'dangerous_grass' : profile.selectedMapVariant;

      const cfg: MlbbMatchLaunchConfig = {
        mode: 'practice',
        customSubMode: 'practice',
        playerHeroId: heroId,
        playerSkinId: skinId,
        playerLane: lane,
        playerSpellId: profile.selectedSpellId,
        playerEmblemId: emblemId,
        playerTalents: talents,
        playerBuild,
        mapTheme: 'sanctum_island',
        mapVariant: resolvedVariant,
        blueTeam: [
          {
            heroId,
            lane,
            name: profile.name,
            isPlayer: true,
            spellId: profile.selectedSpellId,
            emblemId
          }
        ],
        redTeam: [
          {
            heroId: opponentId,
            lane,
            name: 'Training Bot',
            isPlayer: false,
            spellId: 'flicker',
            emblemId: 'fighter'
          }
        ]
      };

      setActiveMode('practice');
      setLobbyModal(null);
      setProfile((prev) => {
        const ownedList = prev.ownedSkins[heroId] ?? [];
        const canEquip = ownedList.includes(skinId) || hero.skins[0]?.id === skinId;
        return {
          ...prev,
          selectedHeroId: heroId,
          selectedLane: lane,
          selectedMode: 'practice',
          equippedSkins: canEquip ? { ...prev.equippedSkins, [heroId]: skinId } : prev.equippedSkins
        };
      });
      setLaunchConfig(cfg);
      setScreen('loading');
    },
    [profile]
  );

  const handleMatchEnd = useCallback((record: MlbbMatchRecord) => {
    setProfile((prev) => {
      const res = computePostMatchProgression(prev, record);
      setLastMatch({
        record,
        starDelta: res.starDelta,
        starProtected: res.starProtected,
        starProtectionSource: res.starProtectionSource,
        starRaisedBonus: res.starRaisedBonus,
        bpGain: res.bpGain,
        expGain: res.expGain,
        doubleBpUsed: res.doubleBpUsed,
        doubleExpUsed: res.doubleExpUsed,
        mmrDelta: res.mmrDelta,
        masteryGain: res.masteryGain
      });
      return res.nextProfile;
    });
    setScreen('postmatch');
  }, []);

  const cbClass =
    profile.settings.basics.colorblind === 'deuteranopia'
      ? 'mlbb-cb-deuteranopia'
      : profile.settings.basics.colorblind === 'protanopia'
        ? 'mlbb-cb-protanopia'
        : profile.settings.basics.colorblind === 'tritanopia'
          ? 'mlbb-cb-tritanopia'
          : '';

  return (
    <div className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#060B18] ${cbClass}`}>
      {screen === 'lobby' && (
        <>
          <MainLobby
            profile={profile}
            onOpenModal={setLobbyModal}
            onLaunchMode={handleLaunchMode}
            onOpenLiveStream={() => setScreen('livestream')}
            onExitToArcade={onExitToArcade}
            onUpdateProfile={updateProfile}
          />
          <ProfileAndHubModals
            modal={lobbyModal}
            profile={profile}
            onClose={() => setLobbyModal(null)}
            onUpdateProfile={updateProfile}
            onReplaceProfile={setProfile}
          />
          {lobbyModal === 'prep' && (
            <PrepAndHeroModals
              mode="prep"
              profile={profile}
              onClose={() => setLobbyModal(null)}
              onUpdateProfile={updateProfile}
            />
          )}
          {lobbyModal === 'heroes' && (
            <HeroGalleryModal
              profile={profile}
              onClose={() => setLobbyModal(null)}
              onUpdateProfile={updateProfile}
              onPracticeHero={handleQuickPracticeHero}
            />
          )}
          {lobbyModal === 'settings' && (
            <SettingsAndCustomUiModal
              settings={profile.settings}
              onUpdateSettings={updateSettings}
              onClose={() => setLobbyModal(null)}
            />
          )}
        </>
      )}

      {screen === 'prematch' && (
        <PreMatchRoom
          mode={activeMode}
          profile={profile}
          onUpdateProfile={updateProfile}
          onBack={() => setScreen('lobby')}
          onProceedToDraft={(party) => {
            setInvitedParty(party);
            setScreen('draft');
          }}
        />
      )}

      {screen === 'draft' && (
        <DraftPickScreen
          mode={activeMode}
          profile={profile}
          invitedParty={invitedParty}
          onUpdateProfile={updateProfile}
          onCancel={() => setScreen('prematch')}
          onConfirmMatch={(cfg) => {
            setLaunchConfig(cfg);
            setScreen('loading');
          }}
        />
      )}

      {screen === 'loading' && launchConfig && (
        <MatchLoadingScreen config={launchConfig} onReady={() => setScreen('battle')} />
      )}

      {screen === 'battle' && launchConfig && (
        <BattleHUD
          config={launchConfig}
          profile={profile}
          onUpdateSettings={updateSettings}
          onMatchEnd={handleMatchEnd}
          onExitToLobby={() => setScreen('lobby')}
        />
      )}

      {screen === 'livestream' && (
        <LiveStreamOverlay
          profile={profile}
          onExit={() => setScreen('lobby')}
        />
      )}

      {screen === 'postmatch' && lastMatch && (
        <PostMatchScreen
          record={lastMatch.record}
          profile={profile}
          starDelta={lastMatch.starDelta}
          starProtected={lastMatch.starProtected}
          starProtectionSource={lastMatch.starProtectionSource}
          starRaisedBonus={lastMatch.starRaisedBonus}
          bpGain={lastMatch.bpGain}
          expGain={lastMatch.expGain}
          doubleBpUsed={lastMatch.doubleBpUsed}
          doubleExpUsed={lastMatch.doubleExpUsed}
          mmrDelta={lastMatch.mmrDelta}
          masteryGain={lastMatch.masteryGain}
          onReturnLobby={() => setScreen('lobby')}
          onPlayAgain={() => setScreen('prematch')}
        />
      )}
    </div>
  );
};
