import type { RankInfo } from '@/models/Profile';

export const getRankTitle = (rating: number): RankInfo => {
  if (rating >= 3000)
    return {
      title: '그랜드마스터',
      color: 'from-fuchsia-400 via-purple-500 to-indigo-600',
      textColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    };
  if (rating >= 2800)
    return {
      title: '마스터',
      color: 'from-purple-300 to-purple-500',
      textColor: 'text-purple-500 dark:text-purple-300',
    };
  if (rating >= 2500)
    return {
      title: '다이아몬드',
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-400 dark:text-cyan-500',
    };
  if (rating >= 2200)
    return {
      title: '플래티넘',
      color: 'from-cyan-300 to-cyan-500',
      textColor: 'text-cyan-500 dark:text-cyan-300',
    };
  if (rating >= 1800)
    return {
      title: '골드',
      color: 'from-yellow-300 to-yellow-500',
      textColor: 'text-yellow-500 dark:text-yellow-300',
    };
  if (rating >= 1600)
    return {
      title: '실버',
      color: 'from-gray-300 to-gray-500',
      textColor: 'text-gray-500 dark:text-gray-300',
    };
  return {
    title: '브론즈',
    color: 'from-orange-600 to-orange-800',
    textColor: 'text-orange-800 dark:text-orange-600',
  };
};

/**
 * 사용자 등급에 따른 AI 답변 수준을 결정하는 함수
 * @param rating 사용자의 레이팅 점수
 * @returns AI가 사용할 언어 수준과 논리적 복잡성 가이드라인
 */
export const getLanguageLevelPrompt = (rating: number): string => {
  const rank = getRankTitle(rating);

  switch (rank.title) {
    case '브론즈':
      return `초등학교 1,2학년 수준으로 답변해주세요:
- 매우 쉬운 단어와 짧은 문장 사용
- 단순하고 직관적인 이유 제시 ("좋아요/나빠요" 수준)
- 복잡한 논리 연결 없이 한 가지 이유만 제시
- "왜냐하면 ~이기 때문이에요" 같은 단순한 인과관계만 사용`;

    case '실버':
      return `초등학교 3,4학년 수준으로 답변해주세요:
- 기본적인 어휘와 문장 사용
- 간단한 원인과 결과 관계 설명
- "만약 ~라면 ~할 거예요" 같은 기초적인 가정 사용
- 한두 가지 이유를 연결해서 설명`;

    case '골드':
      return `초등학교 5,6학년 수준으로 답변해주세요:
- 학년에 맞는 어휘와 문장 구조 사용
- 비교와 대조를 통한 설명 ("A는 ~하지만 B는 ~해요")
- 간단한 예시를 들어 설명
- 여러 이유를 순서대로 나열해서 논리 전개`;

    case '플래티넘':
      return `중학생 수준으로 답변해주세요:
- 중학생 수준의 어휘와 복합문 사용
- 원인과 결과의 연쇄 관계 설명
- 반대 의견을 고려한 반박 ("~라고 할 수 있지만, 실제로는 ~")
- 구체적인 사례나 경험을 바탕으로 한 논증`;

    case '다이아몬드':
      return `고등학생 수준으로 답변해주세요:
- 고등학생 수준의 분석적 어휘 사용
- 다각도에서 문제를 분석하고 종합적 판단 제시
- 가정과 추론을 통한 논리 전개
- 상대방 논리의 허점을 찾아 체계적으로 반박
- 장단점을 비교 분석한 후 결론 도출`;

    case '마스터':
      return `대학생 수준으로 답변해주세요:
- 학술적 어휘와 복잡한 문장 구조 사용
- 추상적 개념과 이론적 틀을 활용한 분석
- 다층적이고 체계적인 논증 구조 구성
- 전제와 결론 사이의 논리적 연결고리 명확히 제시
- 상대방 주장의 근본적 가정을 문제 삼는 메타 수준의 비판`;

    case '그랜드마스터':
      return `해당 분야 전문가/교수 수준으로 답변해주세요:
- 전문 용어와 학술적 표현을 자연스럽게 사용
- 복합적이고 다차원적인 논증 구조 구성
- 철학적, 윤리적, 사회적 함의까지 고려한 심층 분석
- 패러다임 수준에서의 비판적 사고와 대안 제시
- 학제간 접근을 통한 통합적 관점 제시
- 논리적 오류를 정확히 지적하고 정교한 반박 논리 구성`;

    default:
      return '적절한 수준의 어휘와 논리로 답변해주세요';
  }
};
