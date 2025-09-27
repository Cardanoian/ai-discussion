import { cn } from '@/lib/utils';
import { Sparkles, Clock, Timer, AlertTriangle } from 'lucide-react';
import type { HeaderProps } from './types';

const DiscussionHeader = ({
  isMyTurn,
  battleEnded,
  timerInfo,
  timerState,
  formatTime,
}: HeaderProps) => {
  return (
    <div className='flex-shrink-0 mb-6'>
      <div className='flex items-center justify-between'>
        {/* 왼쪽: 타이틀 */}
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-20 animate-pulse'></div>
            <h1 className='relative text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 flex items-center gap-2'>
              <Sparkles className='w-6 h-6 text-yellow-500 animate-pulse' />
              AI 토론 배틀
            </h1>
          </div>
          {!battleEnded && (
            <div className='text-sm text-muted-foreground'>
              {isMyTurn ? '당신의 차례' : '상대방의 차례'}
            </div>
          )}
        </div>

        {/* 오른쪽: 타이머와 감점 정보 */}
        <div className='flex items-center gap-4'>
          {/* 타이머 표시 (내 턴일 때만) */}
          {isMyTurn && timerState.isRunning && (
            <div className='flex items-center gap-3'>
              {/* 라운드 타이머 */}
              <div
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold',
                  timerState.isOvertime
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 animate-pulse'
                    : timerState.roundTimeRemaining <= 30
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 animate-pulse'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                )}
              >
                <Clock className='w-4 h-4' />
                {timerState.isOvertime ? (
                  <>연장: {formatTime(timerState.overtimeRemaining)}</>
                ) : (
                  <>라운드: {formatTime(timerState.roundTimeRemaining)}</>
                )}
              </div>

              {/* 전체 타이머 */}
              <div
                className={cn(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold',
                  timerState.totalTimeRemaining <= 60
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 animate-pulse'
                    : timerState.totalTimeRemaining <= 120
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                )}
              >
                <Timer className='w-4 h-4' />
                전체: {formatTime(timerState.totalTimeRemaining)}
              </div>
            </div>
          )}

          {/* 감점 표시 (항상 표시) */}
          <div className='flex items-center gap-3'>
            {/* 내 감점 */}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                timerInfo.myPenaltyPoints >= 15
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : timerInfo.myPenaltyPoints >= 12
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : timerInfo.myPenaltyPoints > 0
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              )}
            >
              <AlertTriangle className='w-3 h-3' />
              내: {timerInfo.myPenaltyPoints}/{timerInfo.maxPenaltyPoints}
            </div>

            {/* 상대방 감점 */}
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                timerInfo.opponentPenaltyPoints >= 15
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  : timerInfo.opponentPenaltyPoints >= 12
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : timerInfo.opponentPenaltyPoints > 0
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              )}
            >
              <AlertTriangle className='w-3 h-3' />
              상대: {timerInfo.opponentPenaltyPoints}/
              {timerInfo.maxPenaltyPoints}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionHeader;
