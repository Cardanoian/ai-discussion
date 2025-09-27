import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getRankTitle } from '@/lib/constants';
import type { User } from '@supabase/supabase-js';
import type { UserStats, UserProfile } from '@/models/Profile';

/**
 * 프로필 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 프로필 관련 상태와 함수들을 포함한 객체
 */
export const useProfileViewModel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    rating: 1500,
    wins: 0,
    loses: 0,
    total_games: 0,
    win_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserStats(user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * 사용자 통계 정보를 가져오는 함수
   * @param userId - 사용자 ID
   */
  const fetchUserStats = async (userId: string) => {
    try {
      setLoading(true);

      // 사용자 통계 조회
      const { data: stats, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_uuid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user stats:', error);
        return;
      }

      if (stats) {
        setUserProfile(stats);
        const totalGames = stats.wins + stats.loses;
        const winRate = totalGames > 0 ? (stats.wins / totalGames) * 100 : 0;
        setUserStats({
          rating: stats.rating || 1500,
          wins: stats.wins || 0,
          loses: stats.loses || 0,
          total_games: totalGames,
          win_rate: winRate,
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 닉네임 업데이트를 처리하는 함수
   */
  const handleNicknameUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profile')
        .update({ display_name: newNickname.trim() || null })
        .eq('user_uuid', user.id);

      if (error) {
        console.error('Error updating display name:', error);
        alert(`표시명 업데이트 실패: ${error.message}`);
        return;
      }

      // Refresh user data
      await fetchUserStats(user.id);
      setIsEditNicknameOpen(false);
      setNewNickname('');
      alert('표시명이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('표시명 업데이트 중 오류가 발생했습니다.');
    }
  };

  /**
   * 사용자의 표시명을 가져오는 함수
   * @returns 사용자의 표시명 또는 기본값
   */
  const getDisplayName = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name;
    }
    return user?.user_metadata.full_name || user?.email || user?.id;
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
    user,
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
