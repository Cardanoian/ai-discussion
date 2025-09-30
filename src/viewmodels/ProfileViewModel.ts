import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getRankTitle } from '@/lib/constants';
import { useUserProfile } from '@/contexts/useUserProfile';
import type { UserStats } from '@/models/Profile';
import printDev from '@/utils/printDev';
import {
  createAndUploadAvatar,
  generateAvatarWithGemini,
  createPreviewUrl,
} from '@/utils/avatarGenerator';
import {
  avatarCustomizations,
  type AvatarStyle,
  type AvatarCustomization,
} from '@/types/avatar';

/**
 * 프로필 화면의 상태와 로직을 관리하는 ViewModel 훅
 * @returns 프로필 관련 상태와 함수들을 포함한 객체
 */
export const useProfileViewModel = () => {
  const { userProfile, loading, updateUserProfile } = useUserProfile();
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] =
    useState<AvatarStyle>('cartoon');
  const [selectedCustomization, setSelectedCustomization] =
    useState<AvatarCustomization>('cat');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const navigate = useNavigate();

  // 사용자 통계 계산
  const userStats = useMemo<UserStats>(() => {
    if (!userProfile) {
      return {
        rating: 1500,
        wins: 0,
        loses: 0,
        total_games: 0,
        win_rate: 0,
      };
    }

    const totalGames = userProfile.wins + userProfile.loses;
    const winRate = totalGames > 0 ? (userProfile.wins / totalGames) * 100 : 0;

    return {
      rating: userProfile.rating || 1500,
      wins: userProfile.wins || 0,
      loses: userProfile.loses || 0,
      total_games: totalGames,
      win_rate: winRate,
    };
  }, [userProfile]);

  /**
   * 통합된 프로필 설정 저장 함수 (닉네임 + 아바타)
   */
  const handleProfileSave = async () => {
    if (!userProfile) return;

    try {
      setIsGeneratingAvatar(true);

      // 1. 닉네임 업데이트 준비
      const trimmedNickname = newNickname.trim();
      const updates: {
        display_name: string | undefined;
        avatar_url: string | undefined;
      } = {
        display_name: trimmedNickname || undefined,
        avatar_url: undefined,
      };

      // 2. 미리보기 아바타가 생성되어 있으면 업로드
      if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
        // 선택한 커스터마이징 가져오기
        const customization =
          avatarCustomizations.find((c) => c.id === selectedCustomization)
            ?.value || 'person';

        // 아바타 생성 및 업로드
        const avatarUrl = await createAndUploadAvatar(
          userProfile.user_uuid,
          selectedAvatarStyle,
          customization
        );

        updates.avatar_url = avatarUrl;
      }

      // 3. 프로필 업데이트
      await updateUserProfile(updates);

      // 4. 모달 닫기 및 상태 초기화
      setIsEditNicknameOpen(false);
      setNewNickname('');
      setPreviewAvatarUrl(null);

      alert('설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      printDev.error('Error saving profile:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  /**
   * 모달 취소 함수
   */
  const handleModalCancel = () => {
    setIsEditNicknameOpen(false);
    setNewNickname(userProfile?.display_name || '');
    setPreviewAvatarUrl(null);
  };

  /**
   * 아바타 미리보기 생성
   */
  const generateAvatarPreview = async () => {
    try {
      setIsGeneratingPreview(true);

      const customization =
        avatarCustomizations.find((c) => c.id === selectedCustomization)
          ?.value || 'person';

      const blob = await generateAvatarWithGemini({
        style: selectedAvatarStyle,
        customization,
      });

      const url = createPreviewUrl(blob);
      setPreviewAvatarUrl(url);
    } catch (error) {
      printDev.error('Error generating preview:', error);
      alert('미리보기 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  /**
   * 새로운 아바타 생성 (다른 커스터마이징으로)
   */
  const regenerateAvatar = async () => {
    await generateAvatarPreview();
  };

  /**
   * 사용자의 표시명을 가져오는 함수
   * @returns 사용자의 표시명 또는 기본값
   */
  const getDisplayName = () => {
    return userProfile?.display_name || '사용자';
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
    userProfile,
    userStats,
    loading,
    isEditNicknameOpen,
    newNickname,
    rank,
    isGeneratingAvatar,
    isGeneratingPreview,
    selectedAvatarStyle,
    selectedCustomization,
    previewAvatarUrl,
    avatarCustomizations,

    // Setters
    setIsEditNicknameOpen,
    setNewNickname,
    setSelectedAvatarStyle,
    setSelectedCustomization,

    // Handlers
    handleProfileSave,
    handleModalCancel,
    handleLogout,
    getDisplayName,
    generateAvatarPreview,
    regenerateAvatar,
  };
};
