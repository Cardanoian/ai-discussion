# Supabase 데이터베이스 스키마

`gemini.md`의 요구사항과 서버 구현을 바탕으로 작성된 Supabase 데이터베이스 테이블 스키마입니다.

`gemini.md`에서 제안된 `battle_log` 테이블 대신, 대전의 모든 정보를 한곳에서 관리할 수 있는 `battles` 테이블을 새로 설계하는 것이 더 효율적이라고 판단했습니다. 이 테이블은 두 명의 참가자, 승자, 토론 기록, 그리고 AI의 채점 결과까지 모두 저장합니다.

아래 SQL 스키마를 Supabase 대시보드의 `SQL Editor`에 붙여넣고 실행하시면 필요한 모든 테이블과 정책이 생성됩니다.

---

### Supabase 테이블 SQL 스키마

```sql
-- 1. user_profile 테이블 생성
-- Supabase Auth에 새로운 사용자가 등록될 때마다 이 테이블에 자동으로 프로필이 생성되도록 함수와 트리거를 설정합니다.
CREATE TABLE public.user_profile (
    user_uuid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    rating INTEGER DEFAULT 1500 NOT NULL,
    wins INTEGER DEFAULT 0 NOT NULL,
    loses INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블에 대한 주석 추가
COMMENT ON TABLE public.user_profile IS '사용자의 프로필 정보를 저장합니다.';
COMMENT ON COLUMN public.user_profile.user_uuid IS 'auth.users 테이블의 id를 참조하는 외래 키';
COMMENT ON COLUMN public.user_profile.display_name IS '사용자의 표시 이름';
COMMENT ON COLUMN public.user_profile.rating IS '사용자의 ELO 레이팅 점수';
COMMENT ON COLUMN public.user_profile.wins IS '사용자의 총 승리 횟수';
COMMENT ON COLUMN public.user_profile.loses IS '사용자의 총 패배 횟수';


-- 새로운 사용자 생성을 처리하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profile (user_uuid, display_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자 생성 시 함수를 실행하는 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. subjects 테이블 생성
-- 토론 주제를 관리합니다.
CREATE TABLE public.subjects (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블에 대한 주석 추가
COMMENT ON TABLE public.subjects IS '토론 주제 목록';
COMMENT ON COLUMN public.subjects.uuid IS '주제의 고유 ID';
COMMENT ON COLUMN public.subjects.title IS '주제의 제목';
COMMENT ON COLUMN public.subjects.text IS '주제에 대한 설명 또는 내용';


-- 3. docs 테이블 생성
-- 사용자가 특정 주제에 대해 준비한 자료(주장, 예상 질문/답변)를 저장합니다.
CREATE TABLE public.docs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_uuid UUID NOT NULL REFERENCES public.user_profile(user_uuid) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(uuid) ON DELETE CASCADE,
    against BOOLEAN NOT NULL DEFAULT false,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_uuid, subject_id)
);

-- 테이블에 대한 주석 추가
COMMENT ON TABLE public.docs IS '사용자가 주제에 대해 준비한 자료';
COMMENT ON COLUMN public.docs.content IS '{"reasons": ["..."], "questions": [{"q": "...", "a": "..."}]} 형태의 JSON 데이터';
COMMENT ON COLUMN public.docs.against IS '주제에 대한 반대 입장 여부';


-- 4. battles 테이블 생성 (battle_log 대체)
-- 완료된 대전의 기록을 저장합니다.
CREATE TABLE public.battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(uuid) ON DELETE CASCADE,
    player1_uuid UUID NOT NULL REFERENCES public.user_profile(user_uuid) ON DELETE SET NULL,
    player2_uuid UUID NOT NULL REFERENCES public.user_profile(user_uuid) ON DELETE SET NULL,
    winner_uuid UUID REFERENCES public.user_profile(user_uuid) ON DELETE SET NULL,
    log JSONB,
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블에 대한 주석 추가
COMMENT ON TABLE public.battles IS '완료된 대전 기록';
COMMENT ON COLUMN public.battles.log IS '대전 중 오고 간 대화 기록(채팅 로그)';
COMMENT ON COLUMN public.battles.result IS 'AI가 채점한 결과';


-- 5. RLS (Row Level Security) 활성화 및 정책 설정
-- 보안을 위해 각 테이블에 RLS를 활성화하고, 기본 정책을 설정합니다.

-- user_profile
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read any profile" ON public.user_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user to update their own profile" ON public.user_profile FOR UPDATE TO authenticated USING (auth.uid() = user_uuid);

-- subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read all subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin to insert/update/delete subjects" ON public.subjects FOR ALL TO service_role USING (true); -- 관리자/서버만 주제를 관리할 수 있도록 정책 추가

-- docs
ALTER TABLE public.docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow user to see their own docs" ON public.docs FOR SELECT TO authenticated USING (auth.uid() = user_uuid);
CREATE POLICY "Allow user to insert their own docs" ON public.docs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_uuid);
CREATE POLICY "Allow user to update their own docs" ON public.docs FOR UPDATE TO authenticated USING (auth.uid() = user_uuid);
CREATE POLICY "Allow user to delete their own docs" ON public.docs FOR DELETE TO authenticated USING (auth.uid() = user_uuid); -- 사용자가 자신의 문서를 삭제할 수 있도록 정책 추가

-- battles
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow participants to read their battles" ON public.battles FOR SELECT TO authenticated USING (auth.uid() = player1_uuid OR auth.uid() = player2_uuid);
CREATE POLICY "Allow service_role to manage battles" ON public.battles FOR ALL TO service_role USING (true); -- 서버에서만 battle을 생성, 수정, 삭제할 수 있도록 정책 추가


```

### 스키마 설명

1.  **`user_profile`**:

    - Supabase의 `auth.users` 테이블과 `user_uuid`로 연결됩니다.
    - 사용자가 회원가입하면 `handle_new_user` 함수와 트리거가 자동으로 이 테이블에 해당 유저의 프로필을 생성해 줍니다.

2.  **`subjects`**:

    - 토론 주제를 저장하는 간단한 테이블입니다.

3.  **`docs`**:

    - 사용자가 특정 주제(`subject_id`)에 대해 준비한 자료를 저장합니다.
    - `content` 컬럼은 `JSONB` 타입으로, `gemini.md`에 명시된 대로 `reasons`와 `questions`를 포함하는 유연한 구조의 데이터를 저장할 수 있습니다.
    - `UNIQUE(user_uuid, subject_id)` 제약 조건으로 사용자가 한 주제에 대해 하나의 문서만 갖도록 보장합니다.

4.  **`battles`**:

    - 대전이 끝난 후, 해당 대전의 모든 정보를 기록합니다.
    - `player1_uuid`, `player2_uuid`, `winner_uuid`로 참가자와 승자를 명확히 기록합니다.
    - `log`에는 전체 대화 내용이, `result`에는 Gemini AI의 채점 결과가 `JSONB` 형태로 저장됩니다.

5.  **RLS (Row Level Security) 정책**:
    - 각 테이블에 RLS를 활성화하여 데이터 보안을 강화했습니다.
    - 사용자는 자신의 정보와 문서만 수정할 수 있고, 모든 주제와 자신의 프로필 정보는 읽을 수 있습니다.
    - 대전 기록은 참가자들만 조회할 수 있도록 설정했습니다.
    - 대전 생성 및 결과 저장은 서버의 `service_role` 키를 통해서만 이루어져야 안전합니다.
