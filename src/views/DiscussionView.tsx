import { cn } from '@/lib/utils';
import { User, Trophy, Sparkles, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiscussionViewModel } from '@/viewmodels/DiscussionViewModel';
import type { Message } from '@/models/Discussion';

const DiscussionView = () => {
  const { messages, scrollAreaRef } = useDiscussionViewModel();

  const renderMessage = (msg: Message, index: number) => {
    if (msg.sender === 'system') {
      return (
        <Card
          key={index}
          className='my-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-0 shadow-xl shadow-yellow-500/10'
        >
          <div className='absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-lg'></div>
          <CardHeader className='relative flex-row items-center gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full blur-lg opacity-30 animate-pulse'></div>
              <Trophy className='relative w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600' />
            </div>
            <CardTitle className='text-2xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-orange-600'>
              토론 결과
            </CardTitle>
          </CardHeader>
          <CardContent className='relative'>
            <p
              style={{ whiteSpace: 'pre-wrap' }}
              className='text-base md:text-lg leading-relaxed'
            >
              {msg.text}
            </p>
          </CardContent>
        </Card>
      );
    }

    const isPro = msg.sender === 'pro';
    return (
      <div
        key={index}
        className={cn(
          'flex items-end gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-500',
          {
            'justify-start': isPro,
            'justify-end': !isPro,
          }
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {isPro && (
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-sm opacity-30 animate-pulse'></div>
            <div className='relative p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25'>
              <User className='w-5 h-5 text-white' />
            </div>
          </div>
        )}
        <div
          className={cn(
            'relative p-4 rounded-2xl max-w-[85%] shadow-lg backdrop-blur-sm',
            {
              'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/25':
                isPro,
              'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25':
                !isPro,
            }
          )}
        >
          <div className='absolute inset-0 bg-white/10 rounded-2xl'></div>
          <div className='relative flex items-start gap-2'>
            <MessageCircle className='w-4 h-4 mt-1 opacity-70' />
            <p className='leading-relaxed'>{msg.text}</p>
          </div>
        </div>
        {!isPro && (
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-30 animate-pulse'></div>
            <div className='relative p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25'>
              <User className='w-5 h-5 text-white' />
            </div>
          </div>
        )}
      </div>
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
        <Card className='flex-grow bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-indigo-500/10 overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent'></div>
          <div
            ref={scrollAreaRef}
            className='relative h-full p-6 space-y-6 overflow-y-auto'
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
              messages.map(renderMessage)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DiscussionView;
