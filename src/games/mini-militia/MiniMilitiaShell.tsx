import React, { useCallback, useEffect, useState } from 'react';
import {
  MiniMilitiaSave,
  MmMatchConfig,
  MmMatchSummary,
  MmRoomBotSlot
} from './types';
import {
  applyMatchSummaryToSave,
  loadMiniMilitiaSave,
  resetMiniMilitiaSave,
  saveMiniMilitiaProfile
} from './storage';
import { makeRandomAvatar, MM_BOT_NAMES, MmOnlineRoomListing } from './data/progression';
import { mmAudio } from './engine/AudioEngine';
import { LobbyModalId, MainLobby } from './components/MainLobby';
import { ArmoryModal, AvatarStudioModal, StoreModal } from './components/AvatarAndArmoryModals';
import {
  CustomRoomLobby,
  FriendsModal,
  HelpControlsModal,
  LeaderboardsModal,
  OnlineRoomBrowser,
  PostMatchSummaryView,
  ProfileAndMedalsModal
} from './components/ProfileSocialAndRooms';
import { SettingsModal } from './components/SettingsAndHudEditor';
import { BattleHUD } from './components/BattleHUD';

type MmScreen = 'lobby' | 'online_browser' | 'custom_room' | 'battle' | 'post_match';

interface MiniMilitiaShellProps {
  onExitToArcade: () => void;
}

function buildDefaultSlots(
  save: MiniMilitiaSave,
  totalCount: number,
  playerTeam: 'blue' | 'red'
): MmRoomBotSlot[] {
  const playerAvatar = save.avatarPresets[save.activeAvatarPreset] ?? save.avatarPresets[0];
  const slots: MmRoomBotSlot[] = [
    {
      id: 'player',
      name: save.callsign,
      team: playerTeam,
      isPlayer: true,
      ready: true,
      avatar: playerAvatar
    }
  ];
  for (let i = 1; i < totalCount; i++) {
    const name = MM_BOT_NAMES[i % MM_BOT_NAMES.length];
    const team: 'blue' | 'red' = i % 2 === 1 ? (playerTeam === 'blue' ? 'red' : 'blue') : playerTeam;
    slots.push({
      id: `bot_${i}`,
      name,
      team,
      isPlayer: false,
      ready: true,
      avatar: makeRandomAvatar(name)
    });
  }
  return slots;
}

export const MiniMilitiaShell: React.FC<MiniMilitiaShellProps> = ({ onExitToArcade }) => {
  const [save, setSave] = useState<MiniMilitiaSave>(() => {
    const loaded = loadMiniMilitiaSave();
    mmAudio.setVolumes(loaded.settings.audio);
    return loaded;
  });
  const [screen, setScreen] = useState<MmScreen>('lobby');
  const [activeModal, setActiveModal] = useState<LobbyModalId>(null);
  const [matchConfig, setMatchConfig] = useState<MmMatchConfig | null>(null);
  const [lastSummary, setLastSummary] = useState<MmMatchSummary | null>(null);

  const updateSave = useCallback((updater: (prev: MiniMilitiaSave) => MiniMilitiaSave) => {
    setSave((prev) => {
      const next = updater(prev);
      saveMiniMilitiaProfile(next);
      return next;
    });
  }, []);

  useEffect(() => {
    mmAudio.setVolumes(save.settings.audio);
  }, [save.settings.audio]);

  const startMatch = useCallback((cfg: MmMatchConfig) => {
    setMatchConfig(cfg);
    setLastSummary(null);
    setActiveModal(null);
    setScreen('battle');
  }, []);

  const handleQuickPlay = useCallback(() => {
    const pTeam = save.preferredTeam === 'red' ? 'red' : 'blue';
    startMatch({
      mode: 'tdm',
      mapId: 'outpost',
      timeLimitSec: 300,
      scoreLimit: 25,
      botDifficulty: 'normal',
      classicV4: save.settings.gameplay.classicV4Default,
      mapDrops: true,
      friendlyFire: false,
      gravityMode: 'normal',
      nitroMode: '1x',
      slots: buildDefaultSlots(save, 6, pTeam)
    });
  }, [save, startMatch]);

  const handleJoinOnlineRoom = useCallback(
    (room: MmOnlineRoomListing) => {
      const pTeam = save.preferredTeam === 'red' ? 'red' : 'blue';
      startMatch({
        mode: room.mode,
        mapId: room.mapId,
        timeLimitSec: 360,
        scoreLimit: room.mode === 'ctf' ? 5 : 25,
        botDifficulty: room.difficulty,
        classicV4: room.classicV4,
        mapDrops: true,
        friendlyFire: false,
        gravityMode: 'normal',
        nitroMode: '1x',
        roomName: room.name,
        slots: buildDefaultSlots(save, Math.max(6, room.maxPlayers), pTeam)
      });
    },
    [save, startMatch]
  );

  const handleStartBootCamp = useCallback(() => {
    startMatch({
      mode: 'bootcamp',
      mapId: 'outpost',
      timeLimitSec: 9999,
      scoreLimit: 7,
      botDifficulty: 'easy',
      classicV4: false,
      mapDrops: true,
      friendlyFire: false,
      gravityMode: 'normal',
      nitroMode: 'unlimited',
      slots: buildDefaultSlots(save, 1, 'blue')
    });
  }, [save, startMatch]);

  const handleStartSurvival = useCallback(
    (coopAllies: number) => {
      startMatch({
        mode: 'survival',
        mapId: 'outpost',
        timeLimitSec: 9999,
        scoreLimit: 999,
        botDifficulty: 'normal',
        classicV4: false,
        mapDrops: true,
        friendlyFire: false,
        gravityMode: 'normal',
        nitroMode: '1x',
        coopAllies,
        slots: buildDefaultSlots(save, 1, 'blue')
      });
    },
    [save, startMatch]
  );

  const handleMatchFinish = useCallback(
    (summary: MmMatchSummary) => {
      updateSave((prev) => applyMatchSummaryToSave(prev, summary));
      setLastSummary(summary);
      setScreen('post_match');
    },
    [updateSave]
  );

  const handlePlayNextMap = useCallback(
    (nextMapId: string) => {
      if (!matchConfig) {
        setScreen('lobby');
        return;
      }
      startMatch({
        ...matchConfig,
        mapId: nextMapId
      });
    },
    [matchConfig, startMatch]
  );

  const handleRematch = useCallback(() => {
    if (!matchConfig) {
      setScreen('lobby');
      return;
    }
    startMatch({ ...matchConfig });
  }, [matchConfig, startMatch]);

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#151B12] text-[#F4F4EC] overflow-hidden">
      {screen === 'lobby' && (
        <MainLobby
          save={save}
          onExitToArcade={onExitToArcade}
          onQuickPlay={handleQuickPlay}
          onOpenOnlineBrowser={() => setScreen('online_browser')}
          onOpenCustomRoom={() => setScreen('custom_room')}
          onStartBootCamp={handleStartBootCamp}
          onStartSurvival={handleStartSurvival}
          onOpenModal={(m) => setActiveModal(m)}
          onToggleMute={() => {
            updateSave((prev) => {
              const nextMuted = !prev.settings.audio.muted;
              const nextAudio = { ...prev.settings.audio, muted: nextMuted };
              mmAudio.setVolumes(nextAudio);
              return { ...prev, settings: { ...prev.settings, audio: nextAudio } };
            });
          }}
          onCycleTeamPref={() => {
            updateSave((prev) => ({
              ...prev,
              preferredTeam:
                prev.preferredTeam === 'auto' ? 'blue' : prev.preferredTeam === 'blue' ? 'red' : 'auto'
            }));
          }}
          onToggleClassicV4={() => {
            updateSave((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                gameplay: {
                  ...prev.settings.gameplay,
                  classicV4Default: !prev.settings.gameplay.classicV4Default
                }
              }
            }));
          }}
        />
      )}

      {screen === 'online_browser' && (
        <OnlineRoomBrowser
          save={save}
          onBack={() => setScreen('lobby')}
          onJoinRoom={handleJoinOnlineRoom}
          onCreateCustom={() => setScreen('custom_room')}
        />
      )}

      {screen === 'custom_room' && (
        <CustomRoomLobby
          save={save}
          initialConfig={matchConfig ?? undefined}
          onBack={() => setScreen('lobby')}
          onStartMatch={startMatch}
        />
      )}

      {screen === 'battle' && matchConfig && (
        <BattleHUD
          config={matchConfig}
          save={save}
          onMatchFinish={handleMatchFinish}
          onExitToLobby={() => setScreen('lobby')}
          onOpenSettings={() => setActiveModal('settings')}
        />
      )}

      {screen === 'post_match' && lastSummary && (
        <PostMatchSummaryView
          summary={lastSummary}
          save={save}
          onPlayNextMap={handlePlayNextMap}
          onRematch={handleRematch}
          onReturnLobby={() => setScreen('lobby')}
        />
      )}

      {/* ==================== MODAL LAYER ==================== */}
      {activeModal === 'avatar' && (
        <AvatarStudioModal save={save} onUpdateSave={updateSave} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'armory' && (
        <ArmoryModal save={save} onUpdateSave={updateSave} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'store' && (
        <StoreModal save={save} onUpdateSave={updateSave} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'friends' && (
        <FriendsModal save={save} onUpdateSave={updateSave} onClose={() => setActiveModal(null)} />
      )}
      {(activeModal === 'profile' || activeModal === 'achievements') && (
        <ProfileAndMedalsModal
          save={save}
          initialTab={activeModal === 'achievements' ? 'achievements' : 'identity'}
          onUpdateSave={updateSave}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'leaderboards' && (
        <LeaderboardsModal save={save} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'help' && (
        <HelpControlsModal onClose={() => setActiveModal(null)} onStartBootCamp={handleStartBootCamp} />
      )}
      {activeModal === 'settings' && (
        <SettingsModal
          save={save}
          onUpdateSave={updateSave}
          onResetAllData={() => setSave(resetMiniMilitiaSave())}
          onReplayBootCamp={handleStartBootCamp}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};
