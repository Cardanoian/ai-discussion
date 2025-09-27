import React, { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/models/Profile';
import { UserProfileContext } from './UserProfileContext';

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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Initial fetch
    const initializeUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await fetchUserProfile(user.id);
      }
      setLoading(false);
    };

    initializeUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
        setUserProfile(profile);
      } else {
        // 프로필이 없으면 기본 프로필 생성
        const { data: newProfile, error: createError } = await supabase
          .from('user_profile')
          .insert({
            user_uuid: userId,
            display_name: null,
            rating: 1500,
            wins: 0,
            loses: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
