import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { User, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock message structure
interface Message {
  text: string;
  sender: 'pro' | 'con' | 'system';
}

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
    text: '모든 학교, 특히 자원이 부족한 학교에서 어떻게 \'적절한 관리\'를 보장할 수 있을까요?',
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

const DiscussionView = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const renderMessage = (msg: Message, index: number) => {
    if (msg.sender === 'system') {
      return (
        <Card key={index} className="my-4 bg-primary/10 border-primary/30">
          <CardHeader className="flex-row items-center gap-4">
            <Trophy className="w-8 h-8 text-primary" />
            <CardTitle>토론 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              style={{ whiteSpace: 'pre-wrap' }}
              className="text-sm md:text-base"
            >
              {msg.text}
            </p>
          </CardContent>
        </Card>
      );
    }

    const isPro = msg.sender === 'pro';
    return (
      <div
        key={index}
        className={cn('flex items-end gap-2', {
          'justify-start': isPro,
          'justify-end': !isPro,
        })}
      >
        {isPro && (
          <div className="p-2 rounded-full bg-muted">
            <User className="w-5 h-5" />
          </div>
        )}
        <div
          className={cn('p-3 rounded-lg max-w-[85%]', {
            'bg-primary text-primary-foreground': isPro,
            'bg-muted text-muted-foreground': !isPro,
          })}
        >
          <p>{msg.text}</p>
        </div>
        {!isPro && (
          <div className="p-2 rounded-full bg-muted">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen p-4 md:p-8">
      <h1 className="text-2xl font-bold text-center mb-4 text-primary">
        AI 토론 배틀
      </h1>
      <div
        ref={scrollAreaRef}
        className="flex-grow p-4 space-y-4 overflow-y-auto rounded-lg bg-background/50"
      >
        {messages.map(renderMessage)}
      </div>
    </div>
  );
};

export default DiscussionView;
