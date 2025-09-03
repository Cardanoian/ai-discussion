import { supabase } from '@/lib/supabaseClient';

/**
 * 환영 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 환영 화면 관련 함수들을 포함한 객체
 */
export const useWelcomeViewModel = () => {
  /**
   * Google OAuth를 통한 로그인을 처리하는 함수
   */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      console.error('Error logging in:', error);
    }
  };

  return {
    handleLogin,
  };
};
