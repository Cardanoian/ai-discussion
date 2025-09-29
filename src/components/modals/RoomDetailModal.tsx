import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Check,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Clock,
  X,
  Loader2,
  UserCheck,
  Eye,
  Gavel,
} from 'lucide-react';
import { getRankTitle } from '@/lib/constants';
import type { Room, Subject, Player } from '@/models/Room';
import type { UserProfile } from '@/types/user';
import ChangeSubjectModal from './ChangeSubjectModal';

interface RoomDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoom: Room | null;
  userId: string;
  myPosition: 'agree' | 'disagree' | null;
  myRole: 'player' | 'spectator' | 'referee' | null;
  battleCountdown: number;
  subjects: Subject[];
  selectedSubject: string;
  isChangeSubjectOpen: boolean;
  onChangeSubjectOpenChange: (open: boolean) => void;
  onSubjectChange: (value: string) => void;
  onChangeSubject: () => void;
  onPositionSelect: (position: 'agree' | 'disagree') => void;
  onRoleSelect: (role: 'player' | 'spectator' | 'referee') => void;
  onReady: () => void;
  onLeaveRoom: () => void;
  getPlayerDisplayName: (player: Player) => string;
  isSelectingPosition?: boolean;
  isSelectingRole?: boolean;
  isGettingReady?: boolean;
  isChangingSubject?: boolean;
  user: UserProfile;
}

const RoomDetailModal = ({
  isOpen,
  onOpenChange,
  currentRoom,
  userId,
  myPosition,
  myRole,
  battleCountdown,
  subjects,
  selectedSubject,
  isChangeSubjectOpen,
  onChangeSubjectOpenChange,
  onSubjectChange,
  onChangeSubject,
  onPositionSelect,
  onRoleSelect,
  onReady,
  onLeaveRoom,
  getPlayerDisplayName,
  isSelectingPosition = false,
  isSelectingRole = false,
  isGettingReady = false,
  isChangingSubject = false,
  user,
}: RoomDetailModalProps) => {
  // 상대방이 선택한 포지션 확인
  const opponentPosition = currentRoom?.players
    .filter((player) => player.userId !== userId)
    .find((player) => player.position)?.position;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-[900px] max-h-[80vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20 overflow-hidden flex flex-col'
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className='relative'>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500'>
              토론방
            </DialogTitle>
            {battleCountdown > 0 && (
              <div className='flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-lg shadow-lg animate-pulse'>
                <Clock className='w-4 h-4 mr-2' />
                <span className='font-bold'>{battleCountdown}초 후 시작!</span>
              </div>
            )}
          </div>
          <DialogDescription className='text-muted-foreground/80'>
            찬성 또는 반대 입장을 선택하고 준비완료를 눌러주세요.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 flex-1 overflow-y-auto'>
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
                    <ChangeSubjectModal
                      isOpen={isChangeSubjectOpen}
                      onOpenChange={onChangeSubjectOpenChange}
                      subjects={subjects}
                      selectedSubject={selectedSubject}
                      onSubjectChange={onSubjectChange}
                      onChangeSubject={onChangeSubject}
                      isChangingSubject={isChangingSubject}
                    />
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
                {/* Role Selection */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground text-sm'>
                    역할 선택
                  </h4>
                  <div
                    className={`grid ${
                      user?.is_admin ? 'grid-cols-3' : 'grid-cols-2'
                    } gap-2`}
                  >
                    <Button
                      variant='outline'
                      disabled={isSelectingRole}
                      className={`p-3 h-auto transition-all duration-300 ${
                        myRole === 'player'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => onRoleSelect('player')}
                    >
                      <div className='flex flex-col items-center space-y-1'>
                        {isSelectingRole ? (
                          <Loader2 className='w-4 h-4 text-blue-600 animate-spin' />
                        ) : (
                          <UserCheck className='w-4 h-4 text-blue-600' />
                        )}
                        <span className='text-xs font-medium'>플레이어</span>
                      </div>
                    </Button>
                    <Button
                      variant='outline'
                      disabled={isSelectingRole}
                      className={`p-3 h-auto transition-all duration-300 ${
                        myRole === 'spectator'
                          ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-500 shadow-lg shadow-gray-500/20 text-gray-700 dark:text-gray-300'
                          : 'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-900/10 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => onRoleSelect('spectator')}
                    >
                      <div className='flex flex-col items-center space-y-1'>
                        {isSelectingRole ? (
                          <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
                        ) : (
                          <Eye className='w-4 h-4 text-gray-600' />
                        )}
                        <span className='text-xs font-medium'>관전자</span>
                      </div>
                    </Button>
                    {user?.is_admin && (
                      <Button
                        variant='outline'
                        disabled={isSelectingRole}
                        className={`p-3 h-auto transition-all duration-300 ${
                          myRole === 'referee'
                            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-500/20 text-purple-700 dark:text-purple-300'
                            : 'bg-transparent hover:bg-purple-50/50 dark:hover:bg-purple-900/10 border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => onRoleSelect('referee')}
                      >
                        <div className='flex flex-col items-center space-y-1'>
                          {isSelectingRole ? (
                            <Loader2 className='w-4 h-4 text-purple-600 animate-spin' />
                          ) : (
                            <Gavel className='w-4 h-4 text-purple-600' />
                          )}
                          <span className='text-xs font-medium'>심판</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Position Selection - Only show for players */}
                {myRole === 'player' && (
                  <div className='space-y-3'>
                    <h4 className='font-semibold text-muted-foreground text-sm'>
                      입장 선택
                    </h4>
                    <div className='grid grid-cols-2 gap-3'>
                      <Button
                        variant='outline'
                        disabled={
                          opponentPosition === 'agree' || isSelectingPosition
                        }
                        className={`p-4 h-auto transition-all duration-300 ${
                          opponentPosition === 'agree' || isSelectingPosition
                            ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                            : myPosition === 'agree'
                            ? 'cursor-pointer bg-green-50 dark:bg-green-900/20 border-green-500 shadow-lg shadow-green-500/20 text-green-700 dark:text-green-300'
                            : 'cursor-pointer bg-transparent hover:bg-green-50/50 dark:hover:bg-green-900/10 border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => onPositionSelect('agree')}
                      >
                        <div className='flex items-center justify-center space-x-2'>
                          {isSelectingPosition ? (
                            <Loader2 className='w-4 h-4 text-green-600 animate-spin' />
                          ) : (
                            <ThumbsUp className='w-4 h-4 text-green-600' />
                          )}
                          <span className='text-sm font-medium'>찬성</span>
                        </div>
                      </Button>
                      <Button
                        variant='outline'
                        disabled={
                          opponentPosition === 'disagree' || isSelectingPosition
                        }
                        className={`p-4 h-auto transition-all duration-300 ${
                          opponentPosition === 'disagree' || isSelectingPosition
                            ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                            : myPosition === 'disagree'
                            ? 'cursor-pointer bg-red-50 dark:bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20 text-red-700 dark:text-red-300'
                            : 'cursor-pointer bg-transparent hover:bg-red-50/50 dark:hover:bg-red-900/10 border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => onPositionSelect('disagree')}
                      >
                        <div className='flex items-center justify-center space-x-2'>
                          {isSelectingPosition ? (
                            <Loader2 className='w-4 h-4 text-red-600 animate-spin' />
                          ) : (
                            <ThumbsDown className='w-4 h-4 text-red-600' />
                          )}
                          <span className='text-sm font-medium'>반대</span>
                        </div>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Players Status */}
                <div className='space-y-3'>
                  <h4 className='font-semibold text-muted-foreground text-sm'>
                    참가자 현황
                  </h4>
                  {currentRoom?.players.map((player, index) => {
                    const winRate =
                      player.wins + player.loses > 0
                        ? Math.round(
                            (player.wins / (player.wins + player.loses)) * 100
                          )
                        : 0;

                    const rank = getRankTitle(player.rating);

                    return (
                      <div
                        key={player.socketId}
                        className='p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg border border-white/20 space-y-2'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <div
                              className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' : 'bg-purple-500'
                              } animate-pulse`}
                            ></div>
                            <span
                              className={`truncate font-medium text-sm ${rank.textColor}`}
                            >
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

                        {/* Player Stats */}
                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                          <div className='flex items-center space-x-3'>
                            <span className='bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-semibold'>
                              레이팅: {Math.floor(player.rating)}
                            </span>
                            <span className='text-green-600 dark:text-green-400'>
                              승: {player.wins}
                            </span>
                            <span className='text-red-600 dark:text-red-400'>
                              패: {player.loses}
                            </span>
                          </div>
                          <span className='font-medium text-blue-600 dark:text-blue-400'>
                            승률: {winRate}%
                          </span>
                        </div>
                      </div>
                    );
                  })}

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

        <DialogFooter className='flex flex-col sm:flex-row gap-3 flex-shrink-0'>
          <Button
            onClick={onLeaveRoom}
            className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 group'
          >
            <X className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300' />
            방 나가기
          </Button>
          <Button
            onClick={onReady}
            disabled={
              !myPosition ||
              currentRoom?.players.find((p) => p.userId === userId)?.isReady ||
              isGettingReady
            }
            className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'
          >
            {isGettingReady ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Check className='w-4 h-4 mr-2' />
            )}
            {isGettingReady
              ? '처리 중...'
              : currentRoom?.players.find((p) => p.userId === userId)?.isReady
              ? '준비 완료됨'
              : '준비 완료'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailModal;
