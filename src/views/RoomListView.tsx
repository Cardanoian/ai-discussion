import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogIn,
  Users,
  Hourglass,
  Home,
  Loader2,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useRoomListViewModel } from '@/viewmodels/RoomListViewModel';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import RoomDetailModal from '@/components/modals/RoomDetailModal';
import { getRankTitle } from '@/lib/constants';

const RoomListView = () => {
  // 승률 계산 함수
  const calculateWinRate = (wins: number, loses: number): number => {
    const totalGames = wins + loses;
    return totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  };

  // 승률에 따른 색상 결정 함수
  const getWinRateColor = (winRate: number): string => {
    if (winRate >= 55) return 'text-green-500';
    if (winRate >= 45) return 'text-yellow-500';
    return 'text-red-500';
  };

  const {
    // State
    rooms,
    subjects,
    selectedSubject,
    isCreateRoomOpen,
    userId,
    isRoomModalOpen,
    currentRoom,
    myPosition,
    isChangeSubjectOpen,
    battleCountdown,

    // Loading states
    isCreatingRoom,
    isJoiningRoom,
    isSelectingPosition,
    isGettingReady,
    isChangingSubject,

    // Setters
    setSelectedSubject,
    setIsCreateRoomOpen,
    setIsRoomModalOpen,
    setIsChangeSubjectOpen,

    // Handlers
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleChangeSubject,
    handlePositionSelect,
    handleReady,
    handleGoToMain,
    getPlayerDisplayName,

    // 사용자 정보 (MainView와 동일한 기능을 위해 추가 필요)
    user,
    handleLogout,
  } = useRoomListViewModel();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative flex flex-col h-screen p-4 md:p-8'>
        {/* Header with navigation */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500'>
            토론 배틀 대전 목록
          </h1>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center space-x-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-0 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all duration-300 px-4 py-2'
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user?.rating
                        ? getRankTitle(user.rating).color
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                  >
                    <UserIcon className='w-4 h-4 text-white' />
                  </div>
                  <span className='font-medium'>{user.display_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 p-2'
              >
                <DropdownMenuLabel className='px-2 py-1.5'>
                  내 계정
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to='/profile'>
                  <DropdownMenuItem className='px-2 py-2'>
                    <UserIcon className='w-4 h-4 mr-2' />
                    프로필
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='text-red-600 dark:text-red-400 px-2 py-2'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main content */}
        <div className='flex-grow flex flex-col'>
          <Card className='flex-grow animate-in fade-in-50 duration-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg'></div>

            <CardContent className='relative flex-grow flex flex-col'>
              <ScrollArea className='flex-grow pr-4 mb-6'>
                <div className='space-y-4'>
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <Card
                        key={room.roomId}
                        className='group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-0 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:scale-[1.02]'
                      >
                        <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

                        <div className='relative flex justify-between items-center p-6'>
                          <div className='flex-grow'>
                            <p className='font-bold text-xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 break-words line-clamp-2'>
                              {room.subject?.title || 'Unknown Subject'}
                            </p>
                            <div className='space-y-3'>
                              <div className='text-sm text-muted-foreground flex items-center'>
                                <Users className='w-4 h-4 mr-2 text-purple-500' />
                                <span>{room.players.length}/2 Players</span>
                              </div>

                              {/* 플레이어 정보 표시 */}
                              <div className='space-y-2'>
                                {[...Array(2)].map((_, i) => {
                                  const player = room.players[i];
                                  if (player) {
                                    const rankInfo = getRankTitle(
                                      player.rating
                                    );
                                    const winRate = calculateWinRate(
                                      player.wins,
                                      player.loses
                                    );
                                    const winRateColor =
                                      getWinRateColor(winRate);

                                    return (
                                      <div
                                        key={i}
                                        className='flex items-center text-xs'
                                      >
                                        <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2'></div>
                                        <div className='flex-grow'>
                                          <span className='font-medium text-foreground truncate max-w-[120px] inline-block'>
                                            {getPlayerDisplayName(player)}
                                          </span>
                                          <div className='flex items-center space-x-2 mt-1'>
                                            <span
                                              className={`font-semibold ${rankInfo.textColor}`}
                                            >
                                              {rankInfo.title}
                                            </span>
                                            <span
                                              className={`${rankInfo.textColor}`}
                                            >
                                              {Math.floor(player.rating)}⭐
                                            </span>
                                            <span className='text-muted-foreground'>
                                              |
                                            </span>
                                            <span
                                              className={`font-medium ${winRateColor}`}
                                            >
                                              {winRate}% 승률
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div
                                        key={i}
                                        className='flex items-center text-xs'
                                      >
                                        <div className='w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2'></div>
                                        <span className='text-muted-foreground'>
                                          대기 중...
                                        </span>
                                      </div>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinRoom(room.roomId)}
                            disabled={room.isFull || isJoiningRoom}
                            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group'
                          >
                            {isJoiningRoom ? (
                              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                            ) : (
                              <LogIn className='w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300' />
                            )}
                            {isJoiningRoom ? '참가 중...' : '참여하기'}
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className='text-center text-muted-foreground py-20'>
                      <div className='relative mb-6'>
                        <Hourglass className='relative w-12 h-12 mx-auto text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600' />
                      </div>
                      <p className='text-lg font-medium mb-2'>
                        현재 참여 가능한 방이 없습니다.
                      </p>
                      <p className='text-sm opacity-75'>
                        새로운 방을 만들어 토론을 시작해보세요!
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Create Room Button with Main Button */}
              <div className='flex justify-center items-center gap-4'>
                <Button
                  onClick={handleGoToMain}
                  variant='outline'
                  className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90'
                >
                  <Home className='w-4 h-4 mr-2' />
                  메인으로
                </Button>
                <CreateRoomModal
                  isOpen={isCreateRoomOpen}
                  onOpenChange={setIsCreateRoomOpen}
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  onSubjectChange={setSelectedSubject}
                  onCreateRoom={handleCreateRoom}
                  isCreatingRoom={isCreatingRoom}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Modal */}
        <RoomDetailModal
          isOpen={isRoomModalOpen}
          onOpenChange={setIsRoomModalOpen}
          currentRoom={currentRoom}
          userId={userId}
          myPosition={myPosition}
          battleCountdown={battleCountdown}
          subjects={subjects}
          selectedSubject={selectedSubject}
          isChangeSubjectOpen={isChangeSubjectOpen}
          onChangeSubjectOpenChange={setIsChangeSubjectOpen}
          onSubjectChange={setSelectedSubject}
          onChangeSubject={handleChangeSubject}
          onPositionSelect={handlePositionSelect}
          onReady={handleReady}
          onLeaveRoom={handleLeaveRoom}
          getPlayerDisplayName={getPlayerDisplayName}
          isSelectingPosition={isSelectingPosition}
          isGettingReady={isGettingReady}
          isChangingSubject={isChangingSubject}
        />
      </div>
    </div>
  );
};

export default RoomListView;
