import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { UserStats, UserProfile, RankInfo } from '@/models/Profile';

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
  const [uploading, setUploading] = useState(false);
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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (userProfile?.avatar_url) {
        const oldFileName = userProfile.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        alert(`업로드 실패: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({ avatar_url: publicUrl })
        .eq('user_uuid', user?.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        alert(`프로필 업데이트 실패: ${updateError.message}`);
        return;
      }

      // Refresh user data
      if (user) {
        await fetchUserStats(user.id);
      }

      alert('프로필 사진이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleNicknameUpdate = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profile')
        .update({ nickname: newNickname.trim() || null })
        .eq('user_uuid', user.id);

      if (error) {
        console.error('Error updating nickname:', error);
        alert(`닉네임 업데이트 실패: ${error.message}`);
        return;
      }

      // Refresh user data
      await fetchUserStats(user.id);
      setIsEditNicknameOpen(false);
      setNewNickname('');
      alert('닉네임이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('Error updating nickname:', error);
      alert('닉네임 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getDisplayName = () => {
    if (userProfile?.nickname) {
      return userProfile.nickname;
    }
    return user?.user_metadata.full_name || user?.email || user?.id;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getRankTitle = (rating: number): RankInfo => {
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

  const rank = getRankTitle(userStats.rating);

  return {
    // State
    user,
    userProfile,
    userStats,
    loading,
    uploading,
    isEditNicknameOpen,
    newNickname,
    rank,

    // Setters
    setIsEditNicknameOpen,
    setNewNickname,

    // Handlers
    handleAvatarUpload,
    handleNicknameUpdate,
    handleLogout,
    getDisplayName,
  };
};
