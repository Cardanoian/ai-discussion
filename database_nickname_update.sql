-- user_profile 테이블에 nickname 컬럼 추가
ALTER TABLE public.user_profile 
ADD COLUMN nickname TEXT;

-- nickname 컬럼에 대한 주석 추가
COMMENT ON COLUMN public.user_profile.nickname IS '사용자의 닉네임 (선택사항)';

-- 기존 사용자들을 위한 기본값 설정 (선택사항)
UPDATE public.user_profile SET nickname = display_name WHERE nickname IS NULL;
