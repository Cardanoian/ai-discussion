import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  LogIn,
  Plus,
  Users,
  Hourglass,
  Home,
  Check,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Clock,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRoomListViewModel } from '@/viewmodels/RoomListViewModel';

interface RoomListViewProps {
  onBattleStart: () => void;
}

const RoomListView = ({ onBattleStart }: RoomListViewProps) => {
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
  } = useRoomListViewModel({ onBattleStart });

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
                <Dialog
                  open={isCreateRoomOpen}
                  onOpenChange={setIsCreateRoomOpen}
                >
                  <DialogTrigger asChild>
                    <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group px-8 py-3'>
                      <Plus className='w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300' />
                      방 만들기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[600px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                    <DialogHeader>
                      <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
                        새 토론방 만들기
                      </DialogTitle>
                      <DialogDescription>
                        토론할 주제를 선택해주세요.
                      </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                      <div className='grid grid-cols-4 items-center gap-4'>
                        <Label
                          htmlFor='subject'
                          className='text-right font-medium'
                        >
                          주제
                        </Label>
                        <div className='col-span-3'>
                          <Select
                            value={selectedSubject}
                            onValueChange={setSelectedSubject}
                          >
                            <SelectTrigger className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
                              <SelectValue placeholder='주제를 선택하세요' />
                            </SelectTrigger>
                            <SelectContent className='bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                              {subjects.map((subject) => (
                                <SelectItem
                                  key={subject.uuid}
                                  value={subject.uuid}
                                >
                                  {subject.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type='submit'
                        onClick={handleCreateRoom}
                        disabled={!selectedSubject}
                        className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
                      >
                        방 만들기
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Modal */}
        <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
          <DialogContent className='sm:max-w-[900px] max-h-[80vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 overflow-hidden'>
            <DialogHeader className='relative'>
              <div className='flex items-center justify-between'>
                <DialogTitle className='text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500'>
                  토론방
                </DialogTitle>
                {battleCountdown > 0 && (
                  <div className='flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg shadow-lg animate-pulse'>
                    <Clock className='w-4 h-4 mr-2' />
                    <span className='font-bold'>
                      {battleCountdown}초 후 시작!
                    </span>
                  </div>
                )}
              </div>
              <DialogDescription className='text-muted-foreground/80'>
                찬성 또는 반대 입장을 선택하고 준비완료를 눌러주세요.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 max-h-[60vh] overflow-y-auto'>
              {/* Left Panel: Room Info & Subject */}
              <div className='space-y-4'>
                <Card className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
                  <CardHeader>
                    <CardTitle className='text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center'>
                      <Sparkles className='w-5 h-5 mr-2 text-yellow-500' />
                      토론 주제
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {currentRoom?.subject ? (
                      <div className='p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50'>
                        <h3 className='font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2 break-words'>
                          {currentRoom.subject.title}
                        </h3>
                        <p className='text-muted-foreground text-sm leading-relaxed'>
                          {currentRoom.subject.text}
                        </p>
                      </div>
                    ) : (
                      <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-center'>
                        <p className='text-muted-foreground text-sm'>
                          주제가 설정되지 않았습니다.
                        </p>
                      </div>
                    )}

                    {currentRoom?.createdBy === userId && (
                      <div className='flex justify-center'>
                        <Dialog
                          open={isChangeSubjectOpen}
                          onOpenChange={setIsChangeSubjectOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size='sm'
                              className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
                            >
                              <Settings className='w-4 h-4 mr-2' />
                              주제 변경
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='sm:max-w-[500px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                            <DialogHeader>
                              <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
                                토론 주제 변경
                              </DialogTitle>
                              <DialogDescription>
                                새로운 토론 주제를 선택해주세요.
                              </DialogDescription>
                            </DialogHeader>
                            <div className='grid gap-4 py-4'>
                              <div className='grid grid-cols-4 items-center gap-4'>
                                <Label
                                  htmlFor='subject'
                                  className='text-right font-medium'
                                >
                                  주제
                                </Label>
                                <div className='col-span-3'>
                                  <Select
                                    value={selectedSubject}
                                    onValueChange={setSelectedSubject}
                                  >
                                    <SelectTrigger className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
                                      <SelectValue placeholder='주제를 선택하세요' />
                                    </SelectTrigger>
                                    <SelectContent className='bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                                      {subjects.map((subject) => (
                                        <SelectItem
                                          key={subject.uuid}
                                          value={subject.uuid}
                                        >
                                          {subject.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type='submit'
                                onClick={handleChangeSubject}
                                disabled={!selectedSubject}
                                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
                              >
                                주제 변경
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel: Players & Position Selection */}
              <div className='space-y-4'>
                <Card className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
                  <CardHeader>
                    <CardTitle className='text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 flex items-center'>
                      <Users className='w-5 h-5 mr-2 text-purple-500' />
                      참가자 & 입장 선택
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {/* Position Selection */}
                    <div className='space-y-3'>
                      <h4 className='font-semibold text-muted-foreground text-sm'>
                        입장 선택
                      </h4>
                      <div className='grid grid-cols-2 gap-3'>
                        <Button
                          variant='outline'
                          className={`p-4 h-auto cursor-pointer transition-all duration-300 ${
                            myPosition === 'agree'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 shadow-lg shadow-green-500/20 text-green-700 dark:text-green-300'
                              : 'bg-transparent hover:bg-green-50/50 dark:hover:bg-green-900/10 border-gray-200 dark:border-gray-700'
                          } ${
                            currentRoom?.players.find(
                              (p) => p.userId !== userId
                            )?.position === 'agree'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={
                            currentRoom?.players.find(
                              (p) => p.userId !== userId
                            )?.position === 'agree'
                          }
                          onClick={() => handlePositionSelect('agree')}
                        >
                          <div className='flex items-center justify-center space-x-2'>
                            <ThumbsUp className='w-4 h-4 text-green-600' />
                            <span className='text-sm font-medium'>찬성</span>
                          </div>
                        </Button>
                        <Button
                          variant='outline'
                          className={`p-4 h-auto cursor-pointer transition-all duration-300 ${
                            myPosition === 'disagree'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20 text-red-700 dark:text-red-300'
                              : 'bg-transparent hover:bg-red-50/50 dark:hover:bg-red-900/10 border-gray-200 dark:border-gray-700'
                          } ${
                            currentRoom?.players.find(
                              (p) => p.userId !== userId
                            )?.position === 'disagree'
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          disabled={
                            currentRoom?.players.find(
                              (p) => p.userId !== userId
                            )?.position === 'disagree'
                          }
                          onClick={() => handlePositionSelect('disagree')}
                        >
                          <div className='flex items-center justify-center space-x-2'>
                            <ThumbsDown className='w-4 h-4 text-red-600' />
                            <span className='text-sm font-medium'>반대</span>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Players Status */}
                    <div className='space-y-3'>
                      <h4 className='font-semibold text-muted-foreground text-sm'>
                        참가자 현황
                      </h4>
                      {currentRoom?.players.map((player, index) => (
                        <div
                          key={player.socketId}
                          className='flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-white/20'
                        >
                          <div className='flex items-center space-x-2'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' : 'bg-purple-500'
                              } animate-pulse`}
                            ></div>
                            <span className='truncate font-medium text-sm'>
                              {getPlayerDisplayName(player)}
                              {player.userId === userId && ' (나)'}
                            </span>
                            {player.position && (
                              <Badge
                                variant='outline'
                                className={`text-xs ${
                                  player.position === 'agree'
                                    ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20'
                                }`}
                              >
                                {player.position === 'agree' ? '찬성' : '반대'}
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant={player.isReady ? 'default' : 'secondary'}
                            className={`text-xs ${
                              player.isReady
                                ? 'bg-green-500 hover:bg-green-600'
                                : ''
                            }`}
                          >
                            {player.isReady ? '준비 완료' : '대기중'}
                          </Badge>
                        </div>
                      ))}

                      {/* Empty slot */}
                      {currentRoom && currentRoom.players.length < 2 && (
                        <div className='flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50'>
                          <span className='text-muted-foreground text-sm'>
                            다른 플레이어를 기다리는 중...
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter className='flex flex-col sm:flex-row gap-3'>
              <Button
                onClick={handleLeaveRoom}
                variant='outline'
                className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'
              >
                <X className='w-4 h-4 mr-2' />방 나가기
              </Button>
              <Button
                onClick={handleReady}
                disabled={
                  !myPosition ||
                  currentRoom?.players.find((p) => p.userId === userId)?.isReady
                }
                className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'
              >
                <Check className='w-4 h-4 mr-2' />
                {currentRoom?.players.find((p) => p.userId === userId)?.isReady
                  ? '준비 완료됨'
                  : '준비 완료'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RoomListView;
