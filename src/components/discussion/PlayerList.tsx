import React from 'react';
import { Crown, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Player } from './types';

interface PlayerListProps {
  players: Player[];
  currentUserId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentUserId }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.role === 'referee' && b.role !== 'referee') return -1;
    if (a.role !== 'referee' && b.role === 'referee') return 1;
    if (a.position === 'agree' && b.position !== 'agree') return -1;
    if (a.position !== 'agree' && b.position === 'agree') return 1;
    return 0;
  });

  return (
    <Card className='w-64 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-semibold'>참여자 목록</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {sortedPlayers.map((player) => (
          <div
            key={player.userId}
            className={cn(
              'flex items-center gap-2 p-2 rounded-md',
              player.userId === currentUserId
                ? 'bg-blue-100 dark:bg-blue-900/20'
                : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
            )}
          >
            {player.role === 'referee' ? (
              <Crown className='w-4 h-4 text-yellow-500' />
            ) : player.role === 'spectator' ? (
              <Eye className='w-4 h-4 text-gray-500' />
            ) : player.position === 'agree' ? (
              <ThumbsUp className='w-4 h-4 text-green-500' />
            ) : (
              <ThumbsDown className='w-4 h-4 text-red-500' />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                player.userId === currentUserId &&
                  'text-blue-700 dark:text-blue-300'
              )}
            >
              {player.displayName || `사용자 ${player.userId.substring(0, 4)}`}
            </span>
            <span
              className={cn(
                'ml-auto text-xs px-2 py-1 rounded-full',
                player.role === 'referee'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : player.role === 'spectator'
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  : player.position === 'agree'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              {player.role === 'referee'
                ? '심판'
                : player.role === 'spectator'
                ? '관전자'
                : player.position === 'agree'
                ? '찬성'
                : '반대'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayerList;
