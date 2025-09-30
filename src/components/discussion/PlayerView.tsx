import { useState } from 'react';
import { MessageCircle, Send, Bot, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MessageRenderer from './MessageRenderer';
import type { PlayerViewProps } from './types';

const PlayerView = ({
  messages,
  scrollAreaRef,
  battleEnded,
  isMyTurn,
  sendMessage,
  requestAiHelp,
  isRequestingAiHelp,
  userRole,
  userPosition,
  leaveRoomAndNavigate,
}: PlayerViewProps) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (e.key === 'Enter' && !e.shiftKey && isMyTurn && !battleEnded) {
      handleSendMessage();
    }
  };

  const handleAiHelp = async () => {
    if (requestAiHelp && isMyTurn && !battleEnded) {
      const suggestion = await requestAiHelp();
      if (suggestion) {
        setInputMessage(suggestion);
      }
    }
  };

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
            <p className='text-sm opacity-75'>
              AI가 최고의 토론 경험을 준비하고 있습니다
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageRenderer
                key={index}
                message={message}
                index={index}
                userRole={userRole}
                currentUserPosition={userPosition || undefined}
              />
            ))}
            <div id='messages-end' className='h-1' />
          </>
        )}
      </div>

      {/* 플레이어용 입력 영역 */}
      {!battleEnded ? (
        <Card className='flex-shrink-0 mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
          <CardContent className='p-4'>
            <div className='flex gap-3 items-end'>
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  isMyTurn
                    ? '당신의 차례입니다. 메시지를 입력하세요... (Shift+Enter로 줄바꿈)'
                    : '상대방의 차례를 기다리는 중...'
                }
                // disabled={!isMyTurn}
                className='flex-grow bg-white/50 dark:bg-slate-800/50 border-white/20 min-h-12 max-h-32 resize-none'
                rows={1}
              />
              <Button
                onClick={handleAiHelp}
                disabled={!isMyTurn || isRequestingAiHelp}
                variant='outline'
                className='bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0'
              >
                {isRequestingAiHelp ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Bot className='w-4 h-4' />
                )}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!isMyTurn || !inputMessage.trim()}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
            {isMyTurn && (
              <p className='text-xs text-muted-foreground mt-2'>
                Enter를 눌러 메시지를 전송하세요 (Shift+Enter로 줄바꿈)
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className='flex-shrink-0 mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
          <CardContent className='p-6 text-center'>
            <div className='space-y-4'>
              <div className='relative inline-block'>
                <div className='absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg blur-lg opacity-20 animate-pulse'></div>
                <h3 className='relative text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600'>
                  토론이 종료되었습니다
                </h3>
              </div>
              <p className='text-muted-foreground'>
                수고하셨습니다! 결과를 확인하신 후 메인으로 돌아가세요.
              </p>
              <Button
                onClick={leaveRoomAndNavigate}
                className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg font-medium'
              >
                메인으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayerView;
