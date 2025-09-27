import { MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MessageRenderer from './MessageRenderer';
import RefereeScoreModal from '@/components/modals/RefereeScoreModal';
import type { RefereeViewProps } from './types';

const RefereeView = ({
  messages,
  scrollAreaRef,
  userRole,
  socket,
  roomId,
  userId,
  isRefereeScoreModalOpen,
  setIsRefereeScoreModalOpen,
  refereeScoreData,
  handleRefereeScoreSubmit,
}: RefereeViewProps) => {
  return (
    <>
      <div className='flex-1 flex gap-4 overflow-hidden'>
        {/* 왼쪽: 대화 내용 */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          <div
            ref={scrollAreaRef}
            className='flex-1 p-6 space-y-4 overflow-y-auto bg-transparent scroll-smooth pb-4'
          >
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
                <div className='relative mb-6'>
                  <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse'></div>
                  <MessageCircle className='relative w-16 h-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600' />
                </div>
                <p className='text-xl font-medium mb-2'>토론이 곧 시작됩니다</p>
                <p className='text-sm opacity-75'>심판으로 토론을 관리하세요</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageRenderer
                    key={index}
                    message={message}
                    index={index}
                    userRole={userRole}
                    currentUserPosition={undefined}
                  />
                ))}
                <div id='messages-end' className='h-1' />
              </>
            )}
          </div>
        </div>

        {/* 오른쪽: 심판 조작 패널 */}
        <div className='w-80 flex flex-col gap-4'>
          {/* 찬성측 조작 패널 */}
          <Card className='flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
            <CardHeader>
              <CardTitle className='text-blue-600'>찬성측 조작</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  size='sm'
                  className='bg-green-500 hover:bg-green-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_add_points', {
                        roomId,
                        targetUserId: 'AGREE_PLAYER_ID', // 실제 구현시 찬성측 플레이어 ID
                        points: 3,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  가산점
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_deduct_points', {
                        roomId,
                        targetUserId: 'AGREE_PLAYER_ID',
                        points: 3,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  감점
                </Button>
                <Button
                  size='sm'
                  className='bg-blue-500 hover:bg-blue-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_extend_time', {
                        roomId,
                        targetUserId: 'AGREE_PLAYER_ID',
                        seconds: 30,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  시간+30초
                </Button>
                <Button
                  size='sm'
                  className='bg-orange-500 hover:bg-orange-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_reduce_time', {
                        roomId,
                        targetUserId: 'AGREE_PLAYER_ID',
                        seconds: 30,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  시간-30초
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 반대측 조작 패널 */}
          <Card className='flex-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
            <CardHeader>
              <CardTitle className='text-red-600'>반대측 조작</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-2'>
                <Button
                  size='sm'
                  className='bg-green-500 hover:bg-green-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_add_points', {
                        roomId,
                        targetUserId: 'DISAGREE_PLAYER_ID', // 실제 구현시 반대측 플레이어 ID
                        points: 3,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  가산점
                </Button>
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_deduct_points', {
                        roomId,
                        targetUserId: 'DISAGREE_PLAYER_ID',
                        points: 3,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  감점
                </Button>
                <Button
                  size='sm'
                  className='bg-blue-500 hover:bg-blue-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_extend_time', {
                        roomId,
                        targetUserId: 'DISAGREE_PLAYER_ID',
                        seconds: 30,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  시간+30초
                </Button>
                <Button
                  size='sm'
                  className='bg-orange-500 hover:bg-orange-600 text-white'
                  onClick={() => {
                    if (socket && roomId && userId) {
                      socket.emit('referee_reduce_time', {
                        roomId,
                        targetUserId: 'DISAGREE_PLAYER_ID',
                        seconds: 30,
                        refereeId: userId,
                      });
                    }
                  }}
                >
                  시간-30초
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 심판 채점 모달 */}
      {refereeScoreData && (
        <RefereeScoreModal
          isOpen={isRefereeScoreModalOpen}
          onOpenChange={setIsRefereeScoreModalOpen}
          onSubmitScores={handleRefereeScoreSubmit}
          agreePlayerName={refereeScoreData.agreePlayerName}
          disagreePlayerName={refereeScoreData.disagreePlayerName}
        />
      )}
    </>
  );
};

export default RefereeView;
