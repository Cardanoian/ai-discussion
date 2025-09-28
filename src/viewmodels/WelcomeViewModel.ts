import { supabase } from '@/lib/supabaseClient';
import printDev from '@/utils/printDev';

/**
 * 환영 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 환영 화면 관련 함수들을 포함한 객체
 */
export const useWelcomeViewModel = () => {
  /**
   * Google OAuth를 통한 로그인을 처리하는 함수
   */
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      printDev.error('Error logging in with Google:', error);
    }
  };

  /**
   * Kakao OAuth를 통한 로그인을 처리하는 함수
   */
  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) {
      printDev.error('Error logging in with Kakao:', error);
    }
  };

  return {
    handleGoogleLogin,
    handleKakaoLogin,
  };
};
