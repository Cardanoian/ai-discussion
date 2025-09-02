import { supabase } from '@/lib/supabaseClient';

export const useWelcomeViewModel = () => {
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
