import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogIn, Users, Hourglass, Home } from 'lucide-react';
import { useRoomListViewModel } from '@/viewmodels/RoomListViewModel';
import CreateRoomModal from '@/components/modals/CreateRoomModal';
import RoomDetailModal from '@/components/modals/RoomDetailModal';

const RoomListView = () => {
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
          <Button
            onClick={handleGoToMain}
            variant='outline'
            className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 hover:bg-white/90 dark:hover:bg-slate-800/90'
          >
            <Home className='w-4 h-4 mr-2' />
            메인으로
          </Button>
        </div>

        {/* Main content */}
        <div className='flex-grow flex flex-col'>
          <Card className='flex-grow animate-in fade-in-50 duration-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg'></div>

            {/* <CardHeader className='relative'>
              <CardTitle className='text-3xl flex items-center'>
                <div className='relative mr-3'>
                  <div className='absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-30 animate-pulse'></div>
                </div>
                <span className='bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500'>
                  대전 목록
                </span>
              </CardTitle>
              <CardDescription className='text-muted-foreground/80 text-lg leading-relaxed'>
                참여할 방을 선택하거나 새로운 방을 만드세요.
                <br />
                <span className='text-sm opacity-75'>
                  실시간 토론 배틀이 기다립니다
                </span>
              </CardDescription>
            </CardHeader> */}

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
                            <div className='text-sm text-muted-foreground flex items-center'>
                              <Users className='w-4 h-4 mr-2 text-purple-500' />
                              <span>{room.players.length}/2 Players</span>
                              <div className='ml-4 flex space-x-1'>
                                {[...Array(2)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < room.players.length
                                        ? 'bg-green-500 animate-pulse'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleJoinRoom(room.roomId)}
                            disabled={room.isFull}
                            className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 group'
                          >
                            <LogIn className='w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300' />
                            참여하기
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

              {/* Create Room Button */}
              <div className='flex justify-center'>
                <CreateRoomModal
                  isOpen={isCreateRoomOpen}
                  onOpenChange={setIsCreateRoomOpen}
                  subjects={subjects}
                  selectedSubject={selectedSubject}
                  onSubjectChange={setSelectedSubject}
                  onCreateRoom={handleCreateRoom}
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
        />
      </div>
    </div>
  );
};

export default RoomListView;
