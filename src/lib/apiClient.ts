import printDev from '@/utils/printDev';
import { supabase } from './supabaseClient';
import type { AvatarStyle } from '@/types/avatar';

const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_TEST_SERVER_URL
  : import.meta.env.VITE_SERVER_URL;

/**
 * 인증된 API 요청을 위한 헤더를 가져오는 함수
 */
const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
};

/**
 * AI를 사용하여 토론 근거를 생성하는 함수
 */
export const generateArgument = async (
  agreement: boolean,
  subject: string,
  existingReasons: string[]
): Promise<string> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/gemini/generate-argument`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject,
          existingReasons,
          agreement,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    return data.argument || '';
  } catch (error) {
    printDev.error('AI 근거 생성 오류:', error);
    throw error instanceof Error
      ? error
      : new Error('AI 근거 생성에 실패했습니다.');
  }
};

/**
 * AI를 사용하여 질문과 답변을 생성하는 함수
 */
export const generateQuestionAndAnswer = async (
  agreement: boolean,
  subject: string,
  reasons: string[],
  existingQuestions: { q: string; a: string }[]
): Promise<{ q: string; a: string }> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/gemini/generate-question`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          agreement,
          subject,
          reasons,
          existingQuestions,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    return data || { q: '', a: '' };
  } catch (error) {
    printDev.error('AI 질문/답변 생성 오류:', error);
    throw error instanceof Error
      ? error
      : new Error('AI 질문/답변 생성에 실패했습니다.');
  }
};

/**
 * AI를 사용하여 토론 도움말을 생성하는 함수
 */
export const generateDiscussionHelp = async (
  subject: string,
  userPosition: 'agree' | 'disagree',
  currentStage: number,
  stageDescription: string,
  discussionLog: Array<{
    sender: 'agree' | 'disagree' | 'system' | 'judge';
    text: string;
  }>,
  userReasons: string[],
  userQuestions: Array<{ q: string; a: string }>,
  userRating: number = 1500
): Promise<string> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(
      `${API_BASE_URL}/api/gemini/generate-discussion-help`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject,
          userPosition,
          currentStage,
          stageDescription,
          discussionLog,
          userReasons,
          userQuestions,
          userRating,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    return data.suggestion || '';
  } catch (error) {
    printDev.error('AI 토론 도움 요청 오류:', error);
    throw error instanceof Error
      ? error
      : new Error('AI 도움 요청 처리 중 오류가 발생했습니다.');
  }
};

/**
 * 아바타 생성 및 업로드 (백엔드 처리)
 */
export const generateAvatar = async (
  userId: string,
  style: AvatarStyle,
  customization: string
): Promise<string> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/gemini/generate-avatar`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        style,
        customization,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API 요청에 실패했습니다.');
    }

    const data = await response.json();
    return data.avatarUrl;
  } catch (error) {
    printDev.error('아바타 생성 오류:', error);
    throw error instanceof Error
      ? error
      : new Error('아바타 생성에 실패했습니다.');
  }
};
