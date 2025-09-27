# Gemini 설정

## 시스템 프롬프트

당신은 웹앱 개발의 전문가입니다.
코드는 클린 코드 아키텍쳐를 적용하여 가독성 좋게 작성하고, 모든 함수에는 /\*\* \*/를 이용하여 JSdoc을 작성합니다.
답변은 한국어로 해주세요.

## 콘텐츠 필터링

BLOCK_UNSAFE_CONTENT: false

# AI 토론 배틀 앱 설명

실시간 AI 토론 배틀 플랫폼으로, 사용자들이 다양한 주제에 대해 토론하고 AI의 도움을 받아 논리력을 향상시킬 수 있는 웹 애플리케이션입니다.

- 다크모드와 라이트모드를 지원
- 세련되고 미래지향적인 그라데이션 UI 디자인
- 실시간 소켓 통신 기반 매칭 시스템
- ELO 레이팅 시스템으로 실력 평가
- AI 기반 논리 도움 및 자동 채점

## 사용 기술 스택

**Frontend:**

- React v19
- TypeScript
- TailwindCSS 4
- Shadcn/ui
- Vite
- Lucide React (아이콘)
- Socket.io-client (실시간 통신)
- React Router DOM v7

**Backend:**

- Node.js
- Express v5
- TypeScript
- Socket.io (실시간 통신)
- Google Gemini API

**Auth & Database:**

- Supabase (Google OAuth, 카카오 OAuth)
- Supabase PostgreSQL

**Design Pattern:**

- MVVM (Model-View-ViewModel)

## Views

### 1. WelcomeView (로그인 페이지)

- 'AI 토론 배틀'이라는 타이틀과 브랜딩 이미지
- Google OAuth 로그인 버튼
- 카카오 OAuth 로그인 버튼
- '경상북도교육청 G-AI Lab' 브랜딩
- 그라데이션 배경과 애니메이션 효과

### 2. MainView (메인 대시보드)

- 상단에 앱 타이틀과 프로필 버튼
- 두 개의 주요 카드:
  - **자료 만들기**: DocsView로 이동하는 버튼
  - **대전하기**: RoomListView로 이동하는 버튼
- 각 카드는 호버 효과와 그라데이션 애니메이션

### 3. DocsView (토론 자료 준비)

- 토론 주제 선택 드롭다운 (subjects 테이블에서 로드)
- 입장 선택 (찬성/반대) 라디오 버튼
- **내 근거** 섹션:
  - 여러 개의 근거 텍스트 영역
  - - 버튼으로 근거 추가/삭제 가능
  - **AI 도움** 버튼으로 자동 근거 생성
- **예상 질문 및 답변** 섹션:
  - 질문-답변 쌍의 입력 필드
  - - 버튼으로 질문 추가/삭제 가능
  - **AI 도움** 버튼으로 자동 질문/답변 생성
- 저장/뒤로 버튼
- 데이터는 docs 테이블에 JSON 형태로 저장

### 4. RoomListView (대전 방 목록)

- 현재 생성된 방들의 실시간 목록
- 각 방 정보:
  - 토론 주제
  - 참여자 수 (플레이어/관전자/심판)
  - 플레이어들의 레이팅과 승률 표시
  - 방 상태 (대기중/진행중)
- **방 만들기** 모달:
  - 주제 선택
  - 방 생성 기능
- **방 참여** 기능:
  - 역할 선택 (플레이어/관전자/심판)
  - 입장 선택 (찬성/반대) - 플레이어만
  - 준비 완료 시스템

### 5. DiscussionView (토론 진행)

역할별로 다른 인터페이스 제공:

**플레이어 뷰 (PlayerView):**

- 실시간 채팅 형태의 토론 인터페이스
- 찬성측은 왼쪽, 반대측은 오른쪽 말풍선
- 턴 기반 토론 시스템
- **AI 도움** 버튼으로 실시간 논리 지원
- 타이머 표시

**관전자 뷰 (SpectatorView):**

- 토론 내용 실시간 관람
- 채팅 참여 불가

**심판 뷰 (RefereeView):**

- 토론 내용 관람
- 토론 종료 후 점수 입력 기능
- 피드백 작성 기능

**공통 기능:**

- 실시간 메시지 렌더링
- 토론 단계별 진행 상황 표시
- 배틀 결과 모달 (BattleResultModal)

### 6. ProfileView (프로필 관리)

- 사용자 기본 정보 표시
- **ELO 레이팅 시스템**:
  - 현재 레이팅과 등급 (브론즈~다이아몬드)
  - 승급까지 필요한 점수
  - 강등까지 남은 점수
- **게임 통계**:
  - 총 게임 수
  - 승/패 기록
  - 승률 계산
- **닉네임 편집** 기능
- 로그아웃 기능

## Server 기능

### 1. 실시간 방 시스템 (Socket.io)

- **방 생성/참여/나가기**
- **역할 시스템**: 플레이어, 관전자, 심판
- **입장 선택**: 찬성/반대 (플레이어만)
- **준비 완료** 시스템
- **실시간 방 목록** 업데이트

### 2. 토론 배틀 시스템

- **주제 기반 토론**: subjects 테이블에서 주제 선택
- **사용자 자료 로드**: docs 테이블에서 준비된 자료 활용
- **턴 기반 토론**:
  - 초기 의견 제시 (각 1회)
  - 반박 라운드 (각 3회)
  - 타이머 기반 턴 관리
- **AI 도움**: 실시간 논리 지원 및 반박 제안
- **다중 채점 시스템**:
  - AI 자동 채점 (Gemini API)
  - 심판 수동 채점 (있는 경우)
  - 복합 점수 계산

### 3. ELO 레이팅 시스템

- **레이팅 계산**: 승부 결과에 따른 ELO 점수 변동
- **등급 시스템**: 브론즈(1600미만) ~ 다이아몬드(3000+)
- **통계 업데이트**: 승/패 기록, 승률 계산

### 4. AI 기능 (Gemini API)

- **자료 생성**: 주제별 근거 자동 생성
- **질문 생성**: 예상 질문/답변 자동 생성
- **실시간 도움**: 토론 중 논리 지원
- **자동 채점**: 토론 내용 분석 및 점수 부여

## Supabase DB Tables

### 1. user_profile

```sql
- user_uuid: uuid (Primary Key)
- display_name: text (사용자 표시명)
- rating: integer (ELO 레이팅, 기본값: 1500)
- wins: integer (승리 횟수, 기본값: 0)
- loses: integer (패배 횟수, 기본값: 0)
- is_admin: boolean (관리자 여부, 기본값: false)
```

### 2. docs

```sql
- id: integer (Primary Key, Auto Increment)
- user_uuid: uuid (Foreign Key → user_profile.user_uuid)
- subject_id: uuid (Foreign Key → subjects.uuid)
- against: boolean (입장: true=반대, false=찬성)
- reasons: text[] (근거 배열)
- questions: jsonb (질문-답변 객체 배열: [{"q":"질문","a":"답변"}])
```

### 3. battle_log

```sql
- id: integer (Primary Key, Auto Increment)
- user_uuid: uuid (Foreign Key → user_profile.user_uuid)
- subject_id: uuid (Foreign Key → subjects.uuid)
- log: text (토론 로그 JSON 형태)
- created_at: timestamp (생성 시간)
```

### 4. subjects

```sql
- uuid: uuid (Primary Key)
- title: text (주제 제목)
- text: text (주제 상세 설명)
- created_at: timestamp (생성 시간)
- is_active: boolean (활성화 여부, 기본값: true)
```

### 5. battle_results (추가 권장)

```sql
- id: integer (Primary Key, Auto Increment)
- room_id: text (방 ID)
- subject_id: uuid (Foreign Key → subjects.uuid)
- agree_player_id: uuid (찬성측 플레이어)
- disagree_player_id: uuid (반대측 플레이어)
- winner_id: uuid (승자 ID)
- agree_score: integer (찬성측 점수)
- disagree_score: integer (반대측 점수)
- ai_feedback: jsonb (AI 피드백)
- referee_feedback: jsonb (심판 피드백, nullable)
- battle_log: jsonb (전체 토론 로그)
- created_at: timestamp (배틀 완료 시간)
```

### 6. user_stats (추가 권장)

```sql
- user_uuid: uuid (Primary Key, Foreign Key → user_profile.user_uuid)
- total_games: integer (총 게임 수)
- win_rate: decimal (승률)
- avg_score: decimal (평균 점수)
- best_subject_id: uuid (가장 잘하는 주제)
- last_played: timestamp (마지막 플레이 시간)
- rating_history: jsonb (레이팅 변동 이력)
```

## 주요 특징

### 1. 실시간 시스템

- Socket.io 기반 실시간 방 관리
- 실시간 토론 진행
- 실시간 참여자 상태 업데이트

### 2. 다중 역할 시스템

- **플레이어**: 직접 토론 참여
- **관전자**: 토론 관람
- **심판**: 토론 채점 및 피드백

### 3. AI 통합

- 자료 준비 단계에서 AI 도움
- 토론 중 실시간 AI 지원
- AI 기반 자동 채점

### 4. 게임화 요소

- ELO 레이팅 시스템
- 등급 시스템 (브론즈~다이아몬드)
- 승률 및 통계 추적

### 5. 사용자 경험

- 반응형 디자인
- 다크/라이트 모드
- 애니메이션 및 그라데이션 효과
- 직관적인 UI/UX
