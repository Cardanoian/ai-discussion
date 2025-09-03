import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { UserProfile } from '@/types/user';

/**
 * 메인 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 메인 화면 관련 상태와 함수들을 포함한 객체
 */
export const useMainViewModel = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setAvatarUrl(null);
        }
      }
    );

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchUserProfile(user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * 사용자 프로필 정보를 가져오는 함수
   * @param userId - 사용자 ID
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_uuid', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (profile) {
        setUser(profile);
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  /**
   * 로그아웃을 처리하는 함수
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return {
    user,
    avatarUrl,
    handleLogout,
  };
};
