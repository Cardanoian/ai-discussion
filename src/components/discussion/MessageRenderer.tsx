import { cn } from '@/lib/utils';
import { User, MessageCircle, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MessageRendererProps } from './types';

const MessageRenderer = ({
  message: msg,
  index,
  userRole,
  currentUserPosition,
}: MessageRendererProps) => {
  // 시스템 메시지 렌더링
  if (msg.sender === 'system') {
    return (
      <Card
        key={index}
        className='my-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-yellow-400 shadow-lg rounded-2xl'
      >
        <CardContent className='p-4'>
          <p className='text-sm text-yellow-700 dark:text-yellow-300'>
            {msg.text}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 심판 메시지 렌더링
  if (msg.sender === 'judge') {
    return (
      <Card
        key={index}
        className='my-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-gray-800 shadow-xl shadow-gray-500/20 rounded-2xl'
      >
        <CardHeader className='flex-row items-center gap-4'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full blur-lg opacity-30 animate-pulse'></div>
            <Bot className='relative w-10 h-10 text-gray-800 dark:text-gray-200' />
          </div>
          <CardTitle className='text-2xl text-gray-800 dark:text-gray-200'>
            AI 심판
          </CardTitle>
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

  // 플레이어 메시지 렌더링
  const isAgree = msg.sender === 'agree';

  // 플레이어 뷰에서는 내 메시지인지 확인
  const isMyMessage =
    userRole === 'player' && currentUserPosition === msg.sender;

  // 배치 결정: 플레이어 뷰에서는 내 메시지 기준, 심판/관전자 뷰에서는 찬성/반대 기준
  const shouldAlignRight = userRole === 'player' ? isMyMessage : !isAgree;

  // 색상 결정: 항상 찬성은 파란색, 반대는 빨간색
  const colorClasses = {
    border: isAgree ? 'border-blue-400' : 'border-red-400',
    shadow: isAgree ? 'shadow-blue-500/20' : 'shadow-red-500/20',
    gradientBg: isAgree
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-red-500 to-pink-500',
    gradientShadow: isAgree ? 'shadow-blue-500/25' : 'shadow-red-500/25',
    textColor: isAgree ? 'text-blue-600' : 'text-red-600',
    iconColor: isAgree ? 'text-blue-500' : 'text-red-500',
    glowColor: isAgree
      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
      : 'bg-gradient-to-r from-red-500 to-pink-500',
  };

  return (
    <Card
      key={index}
      className={cn(
        'my-4 max-w-[85%] backdrop-blur-xl shadow-lg rounded-2xl animate-in fade-in-50 slide-in-from-bottom-2 duration-500',
        'bg-white/90 dark:bg-slate-900/90 border-2',
        colorClasses.border,
        colorClasses.shadow,
        {
          'ml-0 mr-auto': !shouldAlignRight,
          'ml-auto mr-0': shouldAlignRight,
        }
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className='flex-row items-center gap-3 pb-2'>
        <div className='relative'>
          <div
            className={cn(
              'absolute inset-0 rounded-full blur-sm opacity-30 animate-pulse',
              colorClasses.glowColor
            )}
          ></div>
          <div
            className={cn(
              'relative p-2 rounded-full shadow-lg',
              colorClasses.gradientBg,
              colorClasses.gradientShadow
            )}
          >
            <User className='w-4 h-4 text-white' />
          </div>
        </div>
        <CardTitle
          className={cn('text-lg font-semibold', colorClasses.textColor)}
        >
          {isAgree ? '찬성측' : '반대측'}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='flex items-start gap-2'>
          <MessageCircle
            className={cn('w-4 h-4 mt-1 opacity-70', colorClasses.iconColor)}
          />
          <p className='leading-relaxed text-gray-800 dark:text-gray-200'>
            {msg.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageRenderer;
