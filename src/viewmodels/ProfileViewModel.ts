import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getRankTitle } from '@/lib/constants';
import { useUserProfile } from '@/contexts/useUserProfile';
import type { UserStats } from '@/models/Profile';
import printDev from '@/utils/printDev';

/**
 * 프로필 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 프로필 관련 상태와 함수들을 포함한 객체
 */
export const useProfileViewModel = () => {
  const { userProfile, loading, updateUserProfile } = useUserProfile();
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const navigate = useNavigate();

  // 사용자 통계 계산
  const userStats = useMemo<UserStats>(() => {
    if (!userProfile) {
      return {
        rating: 1500,
        wins: 0,
        loses: 0,
        total_games: 0,
        win_rate: 0,
      };
    }

    const totalGames = userProfile.wins + userProfile.loses;
    const winRate = totalGames > 0 ? (userProfile.wins / totalGames) * 100 : 0;

    return {
      rating: userProfile.rating || 1500,
      wins: userProfile.wins || 0,
      loses: userProfile.loses || 0,
      total_games: totalGames,
      win_rate: winRate,
    };
  }, [userProfile]);

  /**
   * 닉네임 업데이트를 처리하는 함수
   */
  const handleNicknameUpdate = async () => {
    if (!userProfile) return;

    try {
      const trimmedNickname = newNickname.trim();
      await updateUserProfile({
        display_name: trimmedNickname || undefined,
      });
      setIsEditNicknameOpen(false);
      setNewNickname('');
      alert('표시명이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      printDev.error('Error updating display name:', error);
      alert('표시명 업데이트 중 오류가 발생했습니다.');
    }
  };

  /**
   * 사용자의 표시명을 가져오는 함수
   * @returns 사용자의 표시명 또는 기본값
   */
  const getDisplayName = () => {
    return userProfile?.display_name || '사용자';
  };

  /**
   * 로그아웃을 처리하는 함수
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const rank = getRankTitle(userStats.rating);

  return {
    // State
    userProfile,
    userStats,
    loading,
    isEditNicknameOpen,
    newNickname,
    rank,

    // Setters
    setIsEditNicknameOpen,
    setNewNickname,

    // Handlers
    handleNicknameUpdate,
    handleLogout,
    getDisplayName,
  };
};
