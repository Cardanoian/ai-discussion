import type { RankInfo } from '@/models/Profile';

export const getRankTitle = (rating: number): RankInfo => {
  if (rating >= 3000)
    return {
      title: '그랜드마스터',
      color: 'from-red-300 to-red-500',
      textColor: 'text-red-500 dark:text-red-300',
    };
  if (rating >= 2800)
    return {
      title: '마스터',
      color: 'from-purple-300 to-purple-500',
      textColor: 'text-purple-500 dark:text-purple-300',
    };
  if (rating >= 2500)
    return {
      title: '다이아몬드',
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-400 dark:text-cyan-500',
    };
  if (rating >= 2200)
    return {
      title: '플래티넘',
      color: 'from-cyan-300 to-cyan-500',
      textColor: 'text-cyan-500 dark:text-cyan-300',
    };
  if (rating >= 1800)
    return {
      title: '골드',
      color: 'from-yellow-300 to-yellow-500',
      textColor: 'text-yellow-500 dark:text-yellow-300',
    };
  if (rating >= 1600)
    return {
      title: '실버',
      color: 'from-gray-300 to-gray-500',
      textColor: 'text-gray-500 dark:text-gray-300',
    };
  return {
    title: '브론즈',
    color: 'from-orange-600 to-orange-800',
    textColor: 'text-orange-800 dark:text-orange-600',
  };
};
