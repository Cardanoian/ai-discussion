import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/models/Discussion';

const mockMessages: Message[] = [
  { sender: 'pro', text: 'AI 교육은 개인 맞춤형 학습을 강화합니다.' },
  {
    sender: 'con',
    text: '하지만 데이터 프라이버시와 교사의 역할 축소에 대한 우려를 낳습니다.',
  },
  {
    sender: 'pro',
    text: '타당한 지적입니다. 하지만 적절히 관리된다면, 적응형 평가의 이점이 위험을 상회합니다.',
  },
  {
    sender: 'con',
    text: "모든 학교, 특히 자원이 부족한 학교에서 어떻게 '적절한 관리'를 보장할 수 있을까요?",
  },
  {
    sender: 'pro',
    text: '국가적 차원의 프레임워크를 개발하고 연방 자금을 지원하는 것부터 시작할 수 있습니다.',
  },
  {
    sender: 'con',
    text: '그것은 이상적으로 들립니다. 실제 구현은 관료주의적 악몽이 될 것입니다.',
  },
  {
    sender: 'system',
    text: '토론이 종료되었습니다.\n\n**채점 결과:**\n- 찬성측: 85/100\n- 반대측: 78/100\n\n**피드백:**\n- 찬성측은 더 강력한 증거 기반 주장을 제시했습니다.\n- 반대측은 중요한 윤리적 질문을 제기했지만 구체적인 대안이 부족했습니다.',
  },
];

export const useDiscussionViewModel = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 메시지 자동 추가 로직
  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length < mockMessages.length) {
        setMessages((prev) => [...prev, mockMessages[messages.length]]);
      } else {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [messages]);

  // 자동 스크롤 로직
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messages,
    scrollAreaRef,
  };
};
