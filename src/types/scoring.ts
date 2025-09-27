export interface HumanScore {
  agree: number;
  disagree: number;
}

export interface CombinedScore {
  agree: {
    aiScore: number;
    humanScore: number;
    finalScore: number;
    good: string;
    bad: string;
  };
  disagree: {
    aiScore: number;
    humanScore: number;
    finalScore: number;
    good: string;
    bad: string;
  };
  winner: string;
}

export interface ScoreValidation {
  isValid: boolean;
  error?: string;
}

// 점수 유효성 검사 함수
export const validateScore = (score: number): ScoreValidation => {
  if (!Number.isInteger(score)) {
    return { isValid: false, error: '점수는 정수여야 합니다.' };
  }
  if (score < 0 || score > 100) {
    return { isValid: false, error: '점수는 0점 이상 100점 이하여야 합니다.' };
  }
  return { isValid: true };
};

// 가중평균 계산 및 반올림 함수
export const calculateFinalScore = (
  aiScore: number,
  humanScore: number
): number => {
  const weightedScore = aiScore * 0.4 + humanScore * 0.6;
  const roundedScore = Math.round(weightedScore);
  return Math.max(0, Math.min(100, roundedScore)); // 0-100 범위 보장
};
