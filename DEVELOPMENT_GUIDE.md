# 개발 가이드

## 🚀 프로젝트 시작하기

### 환경 설정

#### 1. 프론트엔드 설정

```bash
# 프로젝트 클론
git clone https://github.com/Cardanoian/ai-discussion.git
cd ai-discussion

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.sample .env
```

**.env 파일 설정**

```env
VITE_SERVER_URL=http://localhost:3050
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 2. 백엔드 설정

```bash
# 백엔드 디렉토리로 이동
cd ../discussion-server

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

**.env 파일 설정**

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3050
NODE_ENV=development
```

#### 3. 개발 서버 실행

```bash
# 터미널 1: 백엔드 서버 (포트 3050)
cd discussion-server
npm run dev

# 터미널 2: 프론트엔드 서버 (포트 5173)
cd ai-discussion
npm run dev
```

---

## 🏗️ 새로운 기능 개발하기

### 1. 새로운 페이지 추가

#### 1.1 View 컴포넌트 생성

```typescript
// src/views/NewFeatureView.tsx
import React from 'react';
import { useNewFeatureViewModel } from '@/viewmodels/NewFeatureViewModel';

const NewFeatureView: React.FC = () => {
  const { data, loading, handleAction } = useNewFeatureViewModel();

  if (loading) return <div>로딩중...</div>;

  return (
    <div className='container mx-auto p-4'>
      <h1>새로운 기능</h1>
      <button onClick={handleAction}>액션 실행</button>
    </div>
  );
};

export default NewFeatureView;
```

#### 1.2 ViewModel 생성

```typescript
// src/viewmodels/NewFeatureViewModel.ts
import { useState, useEffect } from 'react';

export const useNewFeatureViewModel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 데이터 로드
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // API 호출 또는 데이터 로드 로직
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    // 액션 처리 로직
    console.log('액션 실행됨');
  };

  return {
    data,
    loading,
    handleAction,
  };
};

const fetchData = async () => {
  // 실제 API 호출 로직
  return new Promise((resolve) => {
    setTimeout(() => resolve('데이터'), 1000);
  });
};
```

#### 1.3 라우터에 추가

```typescript
// src/router/index.tsx
import NewFeatureView from '@/views/NewFeatureView';

// Routes에 추가
{
  path: '/new-feature',
  element: (
    <AuthGuard>
      <NewFeatureView />
    </AuthGuard>
  ),
}
```

### 2. 새로운 소켓 이벤트 추가

#### 2.1 백엔드에 이벤트 핸들러 추가

```typescript
// discussion-server/src/socket/roomHandlers.ts 또는 새 파일
socket.on('new_event', async (data, callback) => {
  try {
    // 이벤트 처리 로직
    const result = await processNewEvent(data);

    // 결과를 클라이언트로 전송
    callback({ success: true, result });

    // 필요시 다른 클라이언트들에게도 브로드캐스트
    io.to(data.roomId).emit('new_event_update', result);
  } catch (error) {
    console.error('New event 처리 오류:', error);
    callback({ success: false, error: error.message });
  }
});
```

#### 2.2 프론트엔드에서 이벤트 사용

```typescript
// ViewModel에서 소켓 이벤트 처리
useEffect(() => {
  if (!socket) return;

  // 이벤트 리스너 등록
  socket.on('new_event_update', (data) => {
    setData(data);
  });

  // 컴포넌트 언마운트 시 리스너 제거
  return () => {
    socket.off('new_event_update');
  };
}, [socket]);

// 이벤트 전송
const sendNewEvent = (eventData) => {
  if (socket) {
    socket.emit('new_event', eventData, (response) => {
      if (response.success) {
        console.log('이벤트 전송 성공:', response.result);
      } else {
        console.error('이벤트 전송 실패:', response.error);
      }
    });
  }
};
```

### 3. 새로운 모달 컴포넌트 추가

```typescript
// src/components/modals/NewModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  data?: any;
}

const NewModal: React.FC<NewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  data,
}) => {
  const handleConfirm = () => {
    // 데이터 처리 로직
    onConfirm(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>새 모달</DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {/* 모달 내용 */}
          <p>모달 내용이 여기에 표시됩니다.</p>
        </div>

        <div className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm}>확인</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewModal;
```

---

## 🎨 UI 컴포넌트 개발

### 스타일 가이드

#### 1. Tailwind CSS 클래스 사용

```typescript
// 좋은 예
<div className='flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow'>
  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>제목</h2>
  <Button variant='default' size='sm'>
    액션
  </Button>
</div>
```

#### 2. shadcn/ui 컴포넌트 활용

```bash
# 새 UI 컴포넌트 추가
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
```

#### 3. 반응형 디자인

```typescript
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열 */}
</div>
```

### 테마 시스템

#### 다크/라이트 모드 지원

```typescript
// useTheme 훅 사용
import { useTheme } from '@/contexts/useTheme';

const MyComponent = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className='bg-white dark:bg-gray-900'>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        테마 변경
      </button>
    </div>
  );
};
```

---

## 🔧 상태 관리

### Context API 패턴

#### 1. 새로운 Context 생성

```typescript
// src/contexts/NewFeatureProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NewFeatureContextType {
  data: any;
  setData: (data: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const NewFeatureContext = createContext<NewFeatureContextType | undefined>(
  undefined
);

interface Props {
  children: ReactNode;
}

export const NewFeatureProvider: React.FC<Props> = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <NewFeatureContext.Provider value={{ data, setData, loading, setLoading }}>
      {children}
    </NewFeatureContext.Provider>
  );
};

export const useNewFeature = () => {
  const context = useContext(NewFeatureContext);
  if (context === undefined) {
    throw new Error('useNewFeature must be used within a NewFeatureProvider');
  }
  return context;
};
```

#### 2. Provider 등록

```typescript
// src/App.tsx
import { NewFeatureProvider } from './contexts/NewFeatureProvider';

function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <NewFeatureProvider>
          <AppRouter />
        </NewFeatureProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}
```

---

## 📡 API 통신

### REST API 호출

#### 1. API 클라이언트 함수 작성

```typescript
// src/lib/apiClient.ts에 추가
export const callNewApi = async (data: any) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${serverUrl}/api/new-endpoint`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.statusText}`);
  }

  return response.json();
};
```

#### 2. ViewModel에서 API 사용

```typescript
// ViewModel에서 API 호출
const handleApiCall = async () => {
  try {
    setLoading(true);
    const result = await callNewApi({ param: 'value' });
    setData(result);
  } catch (error) {
    console.error('API 호출 오류:', error);
    // 에러 처리 로직
  } finally {
    setLoading(false);
  }
};
```

### 소켓 통신 패턴

```typescript
// 소켓 이벤트 처리 패턴
useEffect(() => {
  if (!socket) return;

  const handleEvent = (data: any) => {
    // 데이터 처리 로직
    console.log('이벤트 수신:', data);
    setState(data);
  };

  const handleError = (error: string) => {
    console.error('소켓 오류:', error);
    setError(error);
  };

  // 이벤트 리스너 등록
  socket.on('event_name', handleEvent);
  socket.on('error_event', handleError);

  // 정리 함수
  return () => {
    socket.off('event_name', handleEvent);
    socket.off('error_event', handleError);
  };
}, [socket]);
```

---

## 🗄️ 데이터베이스 작업

### Supabase 클라이언트 사용

#### 1. 데이터 조회

```typescript
// 단일 레코드 조회
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', 'value')
  .single();

// 여러 레코드 조회
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .order('created_at', { ascending: false });
```

#### 2. 데이터 삽입/업데이트

```typescript
// 데이터 삽입
const { data, error } = await supabase
  .from('table_name')
  .insert({ column1: 'value1', column2: 'value2' })
  .select();

// 데이터 업데이트
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', recordId)
  .select();
```

#### 3. 실시간 구독

```typescript
// 실시간 데이터 변경 구독
useEffect(() => {
  const subscription = supabase
    .channel('table_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'table_name' },
      (payload) => {
        console.log('DB 변경 감지:', payload);
        // 상태 업데이트 로직
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## 🧪 테스팅

### 컴포넌트 테스트 (Jest + React Testing Library)

```typescript
// src/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  test('버튼 클릭 시 텍스트가 변경된다', () => {
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: '클릭' });
    fireEvent.click(button);

    expect(screen.getByText('클릭됨')).toBeInTheDocument();
  });
});
```

### API 테스트

```typescript
// 백엔드 API 테스트
describe('Gemini API', () => {
  test('토론 근거 생성이 성공한다', async () => {
    const response = await request(app)
      .post('/api/gemini/generate-arguments')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        subject: '테스트 주제',
        isAgainst: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.arguments).toHaveLength(3);
  });
});
```

---

## 🚀 배포

### 프론트엔드 배포 (Netlify)

```bash
# 빌드
npm run build

# Netlify CLI로 배포
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### 백엔드 배포

#### PM2 설정 파일

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'discussion-server',
      script: './dist/index.js',
      instances: 'max',
      env: {
        NODE_ENV: 'production',
        PORT: 3050,
      },
    },
  ],
};
```

#### 배포 스크립트

```bash
#!/bin/bash
# deploy.sh

# 코드 업데이트
git pull origin main

# 의존성 설치
npm ci

# 빌드
npm run build

# PM2로 재시작
pm2 reload ecosystem.config.js
```

---

## 🔍 디버깅 팁

### 1. 개발자 도구 활용

#### 프론트엔드 디버깅

```typescript
// 개발 환경에서만 로그 출력
import printDev from '@/utils/printDev';

printDev.log('디버그 정보:', data);
printDev.error('오류 발생:', error);
```

#### Socket.IO 디버깅

```javascript
// 브라우저 콘솔에서 소켓 이벤트 모니터링
localStorage.debug = 'socket.io-client:socket';
```

### 2. 백엔드 로깅

```typescript
// 상세한 로그 출력
console.log(`[${new Date().toISOString()}] 이벤트 수신:`, {
  event: 'event_name',
  userId,
  data,
});
```

### 3. 네트워크 문제 해결

```typescript
// 연결 상태 체크
socket.on('connect', () => {
  console.log('소켓 연결됨:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('소켓 연결 해제:', reason);
});

socket.on('connect_error', (error) => {
  console.error('연결 오류:', error);
});
```

---

## 📝 코딩 컨벤션

### TypeScript 타입 정의

```typescript
// 인터페이스 명명: PascalCase
interface UserProfile {
  userId: string;
  displayName: string;
  rating: number;
}

// 타입 별칭: PascalCase
type MessageSender = 'agree' | 'disagree' | 'system' | 'judge';

// Enum: PascalCase
enum BattleStage {
  OPENING = 1,
  QUESTIONING = 2,
  CLOSING = 3,
}
```

### 파일 구조 규칙

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── ui/             # shadcn/ui 기본 컴포넌트
│   ├── modals/         # 모달 컴포넌트
│   └── discussion/     # 도메인별 컴포넌트
├── views/              # 페이지 컴포넌트
├── viewmodels/         # 비즈니스 로직 (MVVM 패턴)
├── contexts/           # React Context
├── lib/                # 외부 라이브러리 설정
├── models/             # 타입 정의
├── utils/              # 유틸리티 함수
└── types/              # 추가 타입 정의
```

### Git 커밋 메시지

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 스타일 변경 (포맷팅)
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스 또는 보조 도구 변경

예시:
feat: 토론 결과 모달 컴포넌트 추가
fix: 소켓 연결 해제 시 메모리 누수 수정
```

---

이 개발 가이드를 통해 새로운 프론트엔드 개발자가 프로젝트에 빠르게 적응하고 효율적으로 개발할 수 있을 것입니다. 추가적인 질문이나 상세한 설명이 필요한 부분이 있다면 언제든 문의하세요!
