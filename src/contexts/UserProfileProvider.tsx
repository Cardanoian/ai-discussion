import React, { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/models/Profile';
import { UserProfileContext } from './UserProfileContext';
import io from 'socket.io-client';

const serverUrl = import.meta.env.VITE_SERVER_URL;

export interface UserProfileContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', {
          event: _event,
          user: session?.user?.id,
        });
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Initial fetch - 새로고침 시 현재 사용자 상태 확인
    const initializeUser = async () => {
      try {
        console.log('Initializing user...');
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        console.log('Initial user:', user?.id);
        setUser(user);
        if (user) {
          await fetchUserProfile(user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeUser();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('백엔드에서 사용자 프로필 조회 시작:', userId);

      // 소켓 연결 생성
      const socket = io(serverUrl, {
        path: import.meta.env.DEV ? '/socket.io' : '/server/socket.io',
      });

      // 소켓 연결 완료 후 사용자 프로필 요청
      socket.on('connect', () => {
        console.log('소켓 연결 성공, 사용자 프로필 요청:', userId);
        socket.emit(
          'get_user_profile',
          { userId },
          (response: {
            userProfile: UserProfile | null;
            error: string | null;
          }) => {
            console.log('백엔드에서 사용자 프로필 응답:', response);

            if (response.error) {
              console.error('사용자 프로필 조회 오류:', response.error);
            } else if (response.userProfile) {
              console.log('사용자 프로필 설정 성공:', response.userProfile);
              setUserProfile(response.userProfile);
            } else {
              console.log('사용자 프로필이 없음');
              setUserProfile(null);
            }

            // 소켓 연결 해제
            socket.disconnect();
          }
        );
      });

      // 연결 오류 처리
      socket.on('connect_error', (error) => {
        console.error('소켓 연결 오류:', error);
        socket.disconnect();
      });

      // 연결 타임아웃 처리 (5초)
      setTimeout(() => {
        if (socket.connected) {
          console.warn('소켓 연결 타임아웃');
          socket.disconnect();
        }
      }, 5000);
    } catch (error) {
      console.error('사용자 프로필 조회 중 오류:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const { data: updatedProfile, error } = await supabase
        .from('user_profile')
        .update(updates)
        .eq('user_uuid', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      // 상태는 onAuthStateChange에서 자동으로 업데이트됨
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  return (
    <UserProfileContext.Provider
      value={{
        user,
        userProfile,
        loading,
        updateUserProfile,
        refreshUserProfile,
        handleLogout,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
