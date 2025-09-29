# API 문서

## 📡 REST API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:3050/api`
- **인증**: Bearer Token (Supabase JWT)
- **Content-Type**: `application/json`

---

## 🤖 Gemini AI API

### 1. 토론 근거 생성

**POST** `/gemini/generate-arguments`

토론 주제에 대한 찬성/반대 근거 3개를 생성합니다.

#### 요청 헤더

```
Authorization: Bearer {supabase_jwt_token}
Content-Type: application/json
```

#### 요청 바디

```json
{
  "subject": "인공지능이 인간의 일자리를 대체할 것인가?",
  "existingReasons": ["기존 근거1", "기존 근거2"],
  "isAgainst": false
}
```

#### 응답

```json
{
  "arguments": ["새로운 근거 1", "새로운 근거 2", "새로운 근거 3"]
}
```

#### 에러 응답

```json
{
  "error": "토론 주제가 필요합니다."
}
```

---

### 2. 예상 질문/답변 생성

**POST** `/gemini/generate-questions`

사용자의 근거에 대해 상대방이 제기할 수 있는 질문과 답변을 생성합니다.

#### 요청 바디

```json
{
  "subject": "인공지능이 인간의 일자리를 대체할 것인가?",
  "reasons": ["근거1", "근거2", "근거3"],
  "existingQuestions": [{ "q": "기존 질문1", "a": "기존 답변1" }]
}
```

#### 응답

```json
{
  "questions": [
    { "q": "예상 질문 1", "a": "답변 1" },
    { "q": "예상 질문 2", "a": "답변 2" },
    { "q": "예상 질문 3", "a": "답변 3" }
  ]
}
```

---

### 3. 실시간 토론 도움

**POST** `/gemini/generate-discussion-help`

현재 토론 상황에 맞는 실시간 도움을 제공합니다.

#### 요청 바디

```json
{
  "subject": "토론 주제",
  "userPosition": "agree", // 또는 "disagree"
  "currentStage": 4,
  "stageDescription": "찬성측 답변 및 질문",
  "discussionLog": [
    { "sender": "agree", "text": "찬성측 발언" },
    { "sender": "disagree", "text": "반대측 발언" }
  ],
  "userReasons": ["사용자 근거1", "사용자 근거2"],
  "userQuestions": [{ "q": "질문1", "a": "답변1" }],
  "userRating": 1600
}
```

#### 응답

```json
{
  "suggestion": "현재 상황에 맞는 AI 제안 메시지"
}
```

---

## 📊 Socket.IO 이벤트 API

### 연결 설정

```javascript
const socket = io('http://localhost:3050', {
  path: '/socket.io',
});
```

### 방 관리 이벤트

#### get_subjects

토론 주제 목록을 요청합니다.

**Client → Server**

```javascript
socket.emit('get_subjects', (response) => {
  console.log(response.subjects);
});
```

**Response**

```json
{
  "subjects": [
    {
      "uuid": "1",
      "title": "토론 주제",
      "text": "토론 주제 설명"
    }
  ]
}
```

---

#### create_room

새 토론방을 생성합니다.

**Client → Server**

```javascript
socket.emit(
  'create_room',
  {
    userId: 'user_uuid',
    subjectId: 'subject_uuid',
  },
  (response) => {
    console.log(response.room);
  }
);
```

**Response**

```json
{
  "room": {
    "roomId": "room_123",
    "subject": { "uuid": "1", "title": "주제", "text": "설명" },
    "players": [
      {
        "socketId": "socket_id",
        "userId": "user_id",
        "displayname": "사용자명",
        "isReady": false,
        "role": "player",
        "position": "agree",
        "rating": 1500,
        "wins": 10,
        "loses": 5
      }
    ],
    "isFull": false,
    "battleStarted": false,
    "hasReferee": false
  }
}
```

---

#### join_room

기존 토론방에 참가합니다.

**Client → Server**

```javascript
socket.emit(
  'join_room',
  {
    roomId: 'room_123',
    userId: 'user_uuid',
  },
  (response) => {
    if (response.error) {
      console.error(response.error);
    } else {
      console.log(response.room);
    }
  }
);
```

---

### 토론 진행 이벤트

#### send_message

토론 중 메시지를 전송합니다.

**Client → Server**

```javascript
socket.emit('send_message', {
  roomId: 'room_123',
  userId: 'user_id',
  message: '토론 발언 내용',
});
```

---

#### messages_updated

서버에서 전체 메시지 목록을 업데이트합니다.

**Server → Client**

```javascript
socket.on('messages_updated', (messages) => {
  // messages: Array of Message objects
  console.log(messages);
});
```

**Message 객체 구조**

```json
{
  "sender": "agree", // "agree" | "disagree" | "system" | "judge"
  "text": "메시지 내용",
  "timestamp": 1234567890
}
```

---

#### turn_info

현재 턴 정보를 업데이트합니다.

**Server → Client**

```javascript
socket.on('turn_info', (data) => {
  console.log(data);
});
```

**Data 구조**

```json
{
  "currentPlayerId": "user_id",
  "stage": 4,
  "message": "찬성측 답변 및 질문 차례입니다.",
  "stageDescription": "찬성측 답변 및 질문"
}
```

---

#### timer_update

타이머 정보를 실시간으로 업데이트합니다.

**Server → Client**

```javascript
socket.on('timer_update', (data) => {
  console.log(data);
});
```

**Data 구조**

```json
{
  "currentPlayerId": "user_id",
  "roundTimeRemaining": 120, // 초
  "totalTimeRemaining": 300, // 초
  "isOvertime": false,
  "overtimeRemaining": 30, // 초
  "roundTimeLimit": 120, // 초
  "totalTimeLimit": 300 // 초
}
```

---

### 심판 기능 이벤트

#### referee_add_points

심판이 플레이어에게 가산점을 부여합니다.

**Client → Server**

```javascript
socket.emit('referee_add_points', {
  roomId: 'room_123',
  targetUserId: 'user_id',
  points: 3,
  refereeId: 'referee_id',
});
```

---

#### penalty_applied

감점이 적용되었을 때 알림을 받습니다.

**Server → Client**

```javascript
socket.on('penalty_applied', (data) => {
  console.log(data);
});
```

**Data 구조**

```json
{
  "userId": "user_id",
  "penaltyPoints": 6,
  "maxPenaltyPoints": 18,
  "message": "플레이어님이 시간을 초과하여 3점 감점되었습니다."
}
```

---

### 결과 처리 이벤트

#### battle_result

토론 결과를 받습니다.

**Server → Client**

```javascript
socket.on('battle_result', (result) => {
  console.log(result);
});
```

**Result 구조**

```json
{
  "agree": {
    "score": 85,
    "good": "논리적 구조가 뛰어남",
    "bad": "감정적 호소 부족"
  },
  "disagree": {
    "score": 78,
    "good": "실제 사례 활용 우수",
    "bad": "논리적 연결성 부족"
  },
  "winner": "user_id",
  "finalScore": { "agree": 85, "disagree": 78 },
  "humanScore": { "agree": 80, "disagree": 75 },
  "aiScore": { "agree": 90, "disagree": 81 }
}
```

---

## 🗄️ 데이터베이스 스키마

### user_profile 테이블

```sql
CREATE TABLE user_profile (
  user_uuid UUID PRIMARY KEY,
  display_name TEXT,
  rating INTEGER DEFAULT 1500,
  wins INTEGER DEFAULT 0,
  loses INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### subjects 테이블

```sql
CREATE TABLE subjects (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### docs 테이블

```sql
CREATE TABLE docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_uuid UUID REFERENCES user_profile(user_uuid),
  subject_id UUID REFERENCES subjects(uuid),
  against BOOLEAN NOT NULL,
  content JSONB, -- { reasons: string[], questions: {q: string, a: string}[] }
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### battles 테이블

```sql
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agree_user_id UUID REFERENCES user_profile(user_uuid),
  disagree_user_id UUID REFERENCES user_profile(user_uuid),
  winner_id UUID REFERENCES user_profile(user_uuid),
  subject_id UUID REFERENCES subjects(uuid),
  discussion_log JSONB,
  ai_result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 인증 및 권한

### 인증 토큰 획득

```javascript
import { supabase } from './supabaseClient';

const {
  data: { session },
} = await supabase.auth.getSession();
const token = session?.access_token;
```

### API 요청 시 인증 헤더 추가

```javascript
fetch('/api/gemini/generate-arguments', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestBody),
});
```

---

## 🚨 에러 코드

### HTTP 상태 코드

- **200**: 성공
- **400**: 잘못된 요청 (필수 파라미터 누락)
- **401**: 인증 실패
- **500**: 서버 내부 오류

### Socket.IO 에러 처리

```javascript
socket.on('battle_error', (error) => {
  console.error('토론 오류:', error);
});

socket.on('connect_error', (error) => {
  console.error('연결 오류:', error);
});
```

---

## 📝 사용 예시

### 완전한 토론방 생성 플로우

```javascript
// 1. 주제 목록 획득
socket.emit('get_subjects', (response) => {
  const subjects = response.subjects;

  // 2. 방 생성
  socket.emit(
    'create_room',
    {
      userId: currentUserId,
      subjectId: subjects[0].uuid,
    },
    (response) => {
      const room = response.room;

      // 3. 방 상태 업데이트 리스닝
      socket.on('room_update', (updatedRoom) => {
        console.log('방 상태 업데이트:', updatedRoom);
      });

      // 4. 준비 완료
      socket.emit('player_ready', {
        roomId: room.roomId,
        userId: currentUserId,
      });
    }
  );
});
```

### 토론 중 메시지 전송

```javascript
// 메시지 전송
socket.emit('send_message', {
  roomId: 'room_123',
  userId: 'user_id',
  message: '저는 이 주제에 대해 찬성합니다.',
});

// 메시지 업데이트 수신
socket.on('messages_updated', (messages) => {
  setMessages(messages);
});

// 턴 변경 수신
socket.on('turn_info', (turnInfo) => {
  setCurrentTurn(turnInfo.currentPlayerId);
  setIsMyTurn(turnInfo.currentPlayerId === myUserId);
});
```

이 API 문서를 통해 프론트엔드 개발자는 백엔드와의 통신 방법을 정확히 이해하고 구현할 수 있습니다.
