import { cn } from '@/lib/utils';
import {
  User,
  Sparkles,
  MessageCircle,
  Send,
  Bot,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDiscussionViewModel } from '@/viewmodels/DiscussionViewModel';
import type { Message } from '@/models/Discussion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DiscussionView = () => {
  const navigate = useNavigate();
  const {
    messages,
    scrollAreaRef,
    isMyTurn,
    battleEnded,
    sendMessage,
    requestAiHelp,
    isRequestingAiHelp,
  } = useDiscussionViewModel();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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

  const renderMessage = (msg: Message, index: number) => {
    if (msg.sender === 'system') {
      return (
        <Card
          key={index}
          className='my-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl'
        >
          <CardContent className='p-4'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {msg.text}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (msg.sender === 'judge') {
      return (
        <Card
          key={index}
          className='my-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-yellow-400 shadow-xl shadow-yellow-500/20 rounded-2xl'
        >
          <CardHeader className='flex-row items-center gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse'></div>
              <Bot className='relative w-10 h-10 text-yellow-600' />
            </div>
            <CardTitle className='text-2xl text-yellow-600'>AI 심판</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{ whiteSpace: 'pre-wrap' }}
              className='text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-200'
            >
              {msg.text}
            </p>
          </CardContent>
        </Card>
      );
    }

    const isPro = msg.sender === 'pro';
    return (
      <Card
        key={index}
        className={cn(
          'my-4 max-w-[85%] backdrop-blur-xl shadow-lg rounded-2xl animate-in fade-in-50 slide-in-from-bottom-2 duration-500',
          {
            'ml-0 mr-auto bg-white/90 dark:bg-slate-900/90 border-2 border-blue-400 shadow-blue-500/20':
              isPro,
            'ml-auto mr-0 bg-white/90 dark:bg-slate-900/90 border-2 border-red-400 shadow-red-500/20':
              !isPro,
          }
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <CardHeader className='flex-row items-center gap-3 pb-2'>
          <div className='relative'>
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-sm opacity-30 animate-pulse',
                {
                  'bg-gradient-to-r from-blue-500 to-cyan-500': isPro,
                  'bg-gradient-to-r from-red-500 to-pink-500': !isPro,
                }
              )}
            ></div>
            <div
              className={cn('relative p-2 rounded-full shadow-lg', {
                'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/25':
                  isPro,
                'bg-gradient-to-r from-red-500 to-pink-500 shadow-red-500/25':
                  !isPro,
              })}
            >
              <User className='w-4 h-4 text-white' />
            </div>
          </div>
          <CardTitle
            className={cn('text-lg font-semibold', {
              'text-blue-600': isPro,
              'text-red-600': !isPro,
            })}
          >
            {isPro ? '찬성측' : '반대측'}
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='flex items-start gap-2'>
            <MessageCircle
              className={cn('w-4 h-4 mt-1 opacity-70', {
                'text-blue-500': isPro,
                'text-red-500': !isPro,
              })}
            />
            <p className='leading-relaxed text-gray-800 dark:text-gray-200'>
              {msg.text}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/50'>
      {/* Background decorative elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000'></div>
      </div>

      <div className='relative flex flex-col h-screen p-4 md:p-8'>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='relative inline-block'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-20 animate-pulse'></div>
            <h1 className='relative text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center gap-3'>
              <Sparkles className='w-8 h-8 text-yellow-500 animate-pulse' />
              AI 토론 배틀
              <Sparkles className='w-8 h-8 text-yellow-500 animate-pulse delay-500' />
            </h1>
          </div>
          <p className='text-muted-foreground mt-2 text-lg'>
            실시간 토론이 진행중입니다
          </p>
        </div>

        {/* Chat Area */}
        <div className='flex-grow flex flex-col'>
          <div
            ref={scrollAreaRef}
            className='flex-grow p-6 space-y-4 overflow-y-auto bg-transparent scroll-smooth'
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
                {messages.map(renderMessage)}
                {/* 스크롤 앵커 포인트 */}
                <div id='messages-end' className='h-1' />
              </>
            )}
          </div>

          {/* Message Input or Return Button */}
          {!battleEnded ? (
            <Card className='mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
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
                    disabled={!isMyTurn}
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
            <Card className='mt-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
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
                    onClick={() => navigate('/waiting-room')}
                    className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg font-medium'
                  >
                    메인으로 돌아가기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionView;
