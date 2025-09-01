import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !session) {
        // 인증이 필요한 페이지인데 로그인하지 않은 경우
        navigate('/', { replace: true });
      } else if (!requireAuth && session) {
        // 로그인 페이지인데 이미 로그인한 경우
        navigate('/main', { replace: true });
      }
    }
  }, [session, loading, requireAuth, navigate]);

  // 로딩 중일 때 표시할 컴포넌트
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  // 인증이 필요한 페이지인데 로그인하지 않은 경우 아무것도 렌더링하지 않음
  if (requireAuth && !session) {
    return null;
  }

  // 로그인 페이지인데 이미 로그인한 경우 아무것도 렌더링하지 않음
  if (!requireAuth && session) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
