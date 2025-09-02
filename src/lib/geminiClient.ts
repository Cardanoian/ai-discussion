import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateArguments = async (
  subject: string,
  existingReasons: string[],
  isAgainst: boolean = false
): Promise<string[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const existingReasonsText = existingReasons
    .filter((r) => r.trim())
    .join('\n- ');
  const positionText = isAgainst ? '반대' : '찬성';
  const prompt = `
토론 주제: "${subject}"

이 주제에 대한 ${positionText} 입장에서 강력한 논리적 근거 3개를 제시해주세요.
${
  existingReasonsText
    ? `\n기존 근거:\n- ${existingReasonsText}\n\n기존 근거와 중복되지 않는 새로운 근거를 제시해주세요.`
    : ''
}

각 근거는 다음 형식으로 작성해주세요:
- 구체적이고 논리적인 설명
- 실제 사례나 데이터 포함하지 않음
- 상대방이 반박하기 어려운 강력한 논점
- ${positionText} 입장을 뒷받침하는 명확한 논리

응답 형식: 
- 각 근거를 별도의 줄로 구분하여 작성해주세요. 
- 마크다운 형식을 사용하지 말고, 단순 텍스트로 작성해주세요.
- 각 근거의 시작에 '.'과 같은 표시를 절대 달지 말아주세요.
- 근거는 반드시 짧고 간단히 한 문장으로 짧게 적어주세요.
`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });
    const text = response.text;

    if (!text) {
      throw new Error('AI 응답을 받을 수 없습니다.');
    }

    // 응답을 줄 단위로 분리하고 빈 줄 제거
    const generatedArguments = text
      .trim()
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.match(/^[\d\-*•]\s*$/))
      .map((line: string) => line.replace(/^[\d\-*•]\s*/, '').trim())
      .filter((line: string) => line.length > 10); // 너무 짧은 줄 제거

    return generatedArguments.slice(0, 3); // 최대 3개까지만 반환
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    throw new Error('AI 근거 생성에 실패했습니다. 다시 시도해주세요.');
  }
};

export const generateQuestionsAndAnswers = async (
  subject: string,
  reasons: string[],
  existingQuestions: { q: string; a: string }[]
): Promise<{ q: string; a: string }[]> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  const reasonsText = reasons.filter((r) => r.trim()).join('\n- ');
  const existingQuestionsText = existingQuestions
    .filter((qa) => qa.q.trim() || qa.a.trim())
    .map((qa) => `Q: ${qa.q}\nA: ${qa.a}`)
    .join('\n\n');

  const prompt = `
토론 주제: "${subject}"

내 주장 근거:
- ${reasonsText}

위 주장에 대해 상대방이 제기할 수 있는 예상 질문 3개와 각각에 대한 효과적인 답변을 작성해주세요. 
마크다운 형식을 사용하지 말고, 단순 텍스트로 작성해주세요.


${
  existingQuestionsText
    ? `\n기존 질문/답변:\n${existingQuestionsText}\n\n기존 질문과 중복되지 않는 새로운 질문을 제시해주세요.`
    : ''
}

각 질문은:
- 상대방이 실제로 제기할 가능성이 높은 반박이나 의문점
- 내 주장의 약점을 파고드는 날카로운 질문

각 답변은:
- 질문에 대한 논리적이고 설득력 있는 응답을 반드시 짧고 간단히 한 문장으로 작성
- 구체적인 근거나 사례는 포함하지 않음
- 상대방을 납득시킬 수 있는 내용

응답 형식:
Q1: [질문1]
A1: [답변1]

Q2: [질문2]
A2: [답변2]

Q3: [질문3]
A3: [답변3]
`;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } },
    });
    const text = response.text;

    if (!text) {
      throw new Error('AI 응답을 받을 수 없습니다.');
    }

    // Q1:, A1: 패턴으로 파싱
    const qaPairs: { q: string; a: string }[] = [];
    const lines = text
      .trim()
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line);

    let currentQ = '';
    let currentA = '';

    for (const line of lines) {
      if (line.match(/^Q\d*:?\s*/i)) {
        if (currentQ && currentA) {
          qaPairs.push({ q: currentQ, a: currentA });
        }
        currentQ = line.replace(/^Q\d*:?\s*/i, '').trim();
        currentA = '';
      } else if (line.match(/^A\d*:?\s*/i)) {
        currentA = line.replace(/^A\d*:?\s*/i, '').trim();
      } else if (currentA) {
        currentA += ' ' + line;
      } else if (currentQ) {
        currentQ += ' ' + line;
      }
    }

    if (currentQ && currentA) {
      qaPairs.push({ q: currentQ, a: currentA });
    }

    return qaPairs.slice(0, 3); // 최대 3개까지만 반환
  } catch (error) {
    console.error('Gemini API 호출 오류:', error);
    throw new Error('AI 질문/답변 생성에 실패했습니다. 다시 시도해주세요.');
  }
};
