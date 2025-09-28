import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useUserProfile } from '@/contexts/useUserProfile';

/**
 * 메인 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 메인 화면 관련 상태와 함수들을 포함한 객체
 */
export const useMainViewModel = () => {
  const { userProfile, loading } = useUserProfile();
  const navigate = useNavigate();

  /**
   * 로그아웃을 처리하는 함수
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return {
    userProfile,
    loading,
    handleLogout,
  };
};
