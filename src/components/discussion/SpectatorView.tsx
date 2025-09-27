import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import MessageRenderer from './MessageRenderer';
import type { BaseDiscussionProps } from './types';

const SpectatorView = ({
  messages,
  scrollAreaRef,
  userRole,
}: BaseDiscussionProps) => {
  const navigate = useNavigate();

  return (
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
            <p className='text-sm opacity-75'>관전자로 토론을 지켜보세요</p>
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

      {/* 관전자용 하단 버튼 */}
      <Card className='flex-shrink-0 mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
        <CardContent className='p-6 text-center'>
          <p className='text-muted-foreground mb-4'>
            관전자 모드로 토론을 시청 중입니다
          </p>
          <Button
            onClick={() => navigate('/waiting-room')}
            className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0'
          >
            메인으로 돌아가기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpectatorView;
