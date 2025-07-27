# Gemini 설정

## 시스템 프롬프트

당신은 웹앱 개발의 전문가입니다.
코드는 클린 코드 아키텍쳐를 적용하여 가독성 좋게 작성하고, 모든 함수에는 /\*\* \*/를 이용하여 JSdoc을 작성합니다.
답변은 한국어로 해주세요.

## 콘텐츠 필터링

BLOCK_UNSAFE_CONTENT: false

# 앱 설명

- 다크모드와 라이트모드를 지원.
- 세련되고 미래지향적인 색상과 UI를 만든다.

## 사용 기술 스택

Frontend:react v19, tailwindcss4, shadcn, vite, typescript, lucide_react
Backend: nodejs, express
Auth: Supabase(Google oAuth)
DB: Supabase PostgreSQL
Design Pattern: MVVM

## Views

1. WelcomeView

- 'AI 토론 배틀'이라는 타이틀이 상단에 있다
- 로그인 및 회원가입 기능(구글)이 제공된다.

2. MainView

- 로그인된 사용자는 우측 상단에 프로필이 나오고, 클릭하면 상세 프로필을 볼 수 있다.
- DocsView로 이동할 수 있는 '자료 만들기'하기 버튼, WaitingRoomView로 이동할 수 있는 '대전하기'버튼이 있다.

3. DocsView

- 상단에 subjects DB에 있는 title들을 선택할 수 있는 드랍다운 메뉴가 있다.
- 내 주장에 대한 근거를 적을 수 있는 Text 입력 창이 있는데, 처음에는 1개이고, + 버튼을 누르면 갯수가 늘어난다.
- 그 아래로 상대의 예상 질문과 그에 대한 답변을 적을 수 있는 Text 입력 창이 있는데, 처음에는 1개이고, + 버튼을 누르면 갯수가 늘어난다.
- supabase db를 조회해서 해당 subject에 대해 자료를 만든 적이 있다면 그 내용을 보여주고 없다면 빈 칸으로 보여준다.
- 하단에는 저장, 취소 2개의 버튼이 있다.
- 저장 버튼을 누르면 위 내용을 json형태로 저장해서 supabase의 docs table에 저장하고, 취소 버튼을 누르면 입력 내용이 저장되지 않고, MainView로 돌아간다.
- 저장되는 json 형태: {"reasons": ["근거1","근거2", "근거3"], "questions": [{"q":"질문1","a":"답변1"}, {"q":"질문2", "a":"답변2"}]}

4. DiscussionView

- 두 사람의 근거를 바탕으로 AI가 토론 배틀을 하는 뷰.
- 채팅창 모양으로 찬성측은 왼쪽 반대측은 오른쪽에 말풍선이 위치한다.
- 말풍선의 크기는 화면 전체 가로의 90%까지 가능.
- 마지막에 좌우가 꽉 찬 system message로 두 사람의 채점 결과 및 피드백이 나온다.

5. WaitingRoomView

- 대전할 상대를 찾는 페이지
- 스타크래프트 배틀넷의 일반 대전과 비슷한 레이아웃(색상 등은 앱 전체의 테마를 따른다.)

## Server 기능

1. 대전 방 만들기

- 스타크래프트 배틀넷에서 방을 만들어 대전하는 형식을 취한다.
- 스타크래프트의 맵 대신 subjects에서 하나를 정한다.
- 두 사람이 모두 준비완료를 누르면 대결이 시작된다.

2. 두 사람의 배틀

- supabase subjects table에서 해당 subject의 title과 text를 가져오고
- supabase docs table에서 사용자의 해당 subject에 대한 정보를 읽어온다
- 두 사람이 주사위를 굴려(0~1사이 랜덤 value를 만들고, 6을 곱한 후 floor한 값에 1을 더한다.) 높은 값이 나온 사람이 먼저 의견을 제시한다.
- 두 사람이 각자 의견을 제시한 후, 먼저 발표한 사람부터 상대방의 의견에 반론을 제시하고, 상대편도 반론을 제시하는 이 작업을 각각 3회씩 진행한다.
- 두 사람의 토의 내용을 Gemini API를 통해 AI에게 입력 후 찬성, 반대 각각의 점수를 채점하고 결과를 공개한다.
  (채점 근거도 제시한다.)
- supabase DB user_profile table에 해당 사용자의 승, 패를 기록한다.(이기면 현재 승 +1, 지면 현재 패 + 1)

## supabase DB Tables

1. user_profile

- user_uuid: uuid
- display_name: text
- rating: integer
- wins: integer
- loses: integer

2. docs

- user: uuid (cascade to user_profile table)
- subject: uuid (cascade to subjects table)
- against: boolean
- reason: text

3. battle_log

- user: uuid (cascade to user_profile table)
- subject: uuid (cascade to subjects table)
- log: text

4. subjects

- uuid: uid
- title: text
- text: text

5. 그 외 필요하다고 생각되는 테이블이 더 있다면 만들 것을 Scheme를 포함해서 추천해 줘.
