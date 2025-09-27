import { useDiscussionViewModel } from '@/viewmodels/DiscussionViewModel';
import DiscussionHeader from '@/components/discussion/DiscussionHeader';
import SpectatorView from '@/components/discussion/SpectatorView';
import RefereeView from '@/components/discussion/RefereeView';
import PlayerView from '@/components/discussion/PlayerView';
import BattleResultModal from '@/components/modals/BattleResultModal';

const DiscussionView = () => {
  const {
    messages,
    scrollAreaRef,
    isMyTurn,
    battleEnded,
    sendMessage,
    requestAiHelp,
    isRequestingAiHelp,
    timerInfo,
    timerState,
    formatTime,
    userRole,
    userPosition,
    socket,
    roomId,
    userId,
    isRefereeScoreModalOpen,
    setIsRefereeScoreModalOpen,
    refereeScoreData,
    handleRefereeScoreSubmit,
    battleResult,
    isBattleResultModalOpen,
    setIsBattleResultModalOpen,
    userProfile,
  } = useDiscussionViewModel();

  // 메시지에서 플레이어 이름 추출
  const getPlayerNames = () => {
    const judgeMessages = messages.filter((msg) => msg.sender === 'judge');
    if (judgeMessages.length > 0) {
      const firstMessage = judgeMessages[0].text;
      const agreeMatch = firstMessage.match(/찬성측인 ([^님]+)님/);
      const disagreeMatch = firstMessage.match(/반대측인 ([^님]+)님/);

      if (agreeMatch && disagreeMatch) {
        return {
          agree: agreeMatch[1],
          disagree: disagreeMatch[1],
        };
      }
    }

    // 기본값
    return {
      agree: userProfile?.display_name || '찬성측',
      disagree: '반대측',
    };
  };

  const renderRoleBasedContent = () => {
    const baseProps = {
      messages,
      scrollAreaRef,
      battleEnded,
      userRole,
    };

    switch (userRole) {
      case 'spectator':
        return <SpectatorView {...baseProps} />;

      case 'referee':
        return (
          <RefereeView
            {...baseProps}
            socket={socket}
            roomId={roomId}
            userId={userId}
            isRefereeScoreModalOpen={isRefereeScoreModalOpen}
            setIsRefereeScoreModalOpen={setIsRefereeScoreModalOpen}
            refereeScoreData={refereeScoreData}
            handleRefereeScoreSubmit={handleRefereeScoreSubmit}
          />
        );

      default: // player
        return (
          <PlayerView
            {...baseProps}
            isMyTurn={isMyTurn}
            sendMessage={sendMessage}
            requestAiHelp={requestAiHelp}
            isRequestingAiHelp={isRequestingAiHelp}
            userPosition={userPosition}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative h-screen flex flex-col p-4 md:p-8'>
        {/* Header */}
        <DiscussionHeader
          isMyTurn={isMyTurn}
          battleEnded={battleEnded}
          timerInfo={timerInfo}
          timerState={timerState}
          formatTime={formatTime}
        />

        {/* Main Content Area - 역할별 분기 */}
        {renderRoleBasedContent()}
      </div>

      {/* 토론 결과 모달 */}
      {battleResult &&
        (() => {
          const playerNames = getPlayerNames();
          return (
            <BattleResultModal
              isOpen={isBattleResultModalOpen}
              onOpenChange={setIsBattleResultModalOpen}
              result={battleResult}
              agreePlayerName={playerNames.agree}
              disagreePlayerName={playerNames.disagree}
              currentUserId={userId}
            />
          );
        })()}
    </div>
  );
};

export default DiscussionView;
