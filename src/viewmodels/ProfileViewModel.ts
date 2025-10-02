import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getRankTitle } from '@/lib/constants';
import { useUserProfile } from '@/contexts/useUserProfile';
import type { UserStats } from '@/models/Profile';
import printDev from '@/utils/printDev';
import { generateAvatar } from '@/lib/apiClient';
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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [newNickname, setNewNickname] = useState(
    userProfile?.display_name ?? ''
  );
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] =
    useState<AvatarStyle>('cartoon');
  const [selectedCustomization, setSelectedCustomization] =
    useState<AvatarCustomization>('cat');
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [isCustomizationDropdownOpen, setIsCustomizationDropdownOpen] =
    useState(false);
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
   * 통합된 프로필 설정 저장 함수 (닉네임만 업데이트, 아바타는 이미 백엔드에서 처리됨)
   */
  const handleProfileSave = async () => {
    if (!userProfile) return;

    try {
      setIsGeneratingAvatar(true);

      // 닉네임 업데이트 (아바타는 미리보기 생성 시 이미 백엔드에서 DB 업데이트 완료)
      const trimmedNickname = newNickname.trim();
      if (trimmedNickname) {
        await updateUserProfile({
          display_name: trimmedNickname,
        });
      }

      // 모달 닫기 및 상태 초기화
      setIsEditProfileOpen(false);
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
    setIsEditProfileOpen(false);
    setNewNickname(userProfile?.display_name || '');
    setPreviewAvatarUrl(null);
  };

  /**
   * 아바타 미리보기 생성 (백엔드 API 호출)
   */
  const generateAvatarPreview = async () => {
    if (!userProfile) return;

    try {
      setIsGeneratingPreview(true);

      const customization =
        avatarCustomizations.find((c) => c.id === selectedCustomization)
          ?.value || 'person';

      // 백엔드에서 아바타 생성 및 업로드 (DB도 자동 업데이트됨)
      const avatarUrl = await generateAvatar(
        userProfile.user_uuid,
        selectedAvatarStyle,
        customization
      );

      setPreviewAvatarUrl(avatarUrl);
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
   * 스타일 드랍다운 열림/닫힘 핸들러
   */
  const handleStyleDropdownOpenChange = (open: boolean) => {
    setIsStyleDropdownOpen(open);
    if (open) {
      setIsCustomizationDropdownOpen(false);
    }
  };

  /**
   * 커스터마이징 드랍다운 열림/닫힘 핸들러
   */
  const handleCustomizationDropdownOpenChange = (open: boolean) => {
    setIsCustomizationDropdownOpen(open);
    if (open) {
      setIsStyleDropdownOpen(false);
    }
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

  // 승급까지 필요한 점수 계산
  const getPointsToPromotion = (rating: number): number => {
    let points: number;
    if (rating >= 3000) points = 0; // 이미 최고 등급
    else if (rating >= 2800) points = 3000 - rating;
    else if (rating >= 2500) points = 2800 - rating;
    else if (rating >= 2200) points = 2500 - rating;
    else if (rating >= 1800) points = 2200 - rating;
    else if (rating >= 1600) points = 1800 - rating;
    else points = 1600 - rating; // 브론즈에서 실버로
    return Math.ceil(points);
  };

  // 강등까지 남은 점수 계산
  const getPointsToDemotion = (rating: number): number => {
    let points: number;
    if (rating >= 3000) points = rating - 3000;
    else if (rating >= 2800) points = rating - 2800;
    else if (rating >= 2500) points = rating - 2500;
    else if (rating >= 2200) points = rating - 2200;
    else if (rating >= 1800) points = rating - 1800;
    else if (rating >= 1600) points = rating - 1600;
    else points = 0; // 브론즈는 0까지
    return Math.ceil(points);
  };

  return {
    // State
    userProfile,
    userStats,
    loading,
    isEditProfileOpen,
    newNickname,
    rank,
    isGeneratingAvatar,
    isGeneratingPreview,
    selectedAvatarStyle,
    selectedCustomization,
    previewAvatarUrl,
    avatarCustomizations,
    isStyleDropdownOpen,
    isCustomizationDropdownOpen,

    // Getters
    getPointsToPromotion,
    getPointsToDemotion,

    // Setters
    setIsEditProfileOpen,
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
    handleStyleDropdownOpenChange,
    handleCustomizationDropdownOpenChange,
  };
};
