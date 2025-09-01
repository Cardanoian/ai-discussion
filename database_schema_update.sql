-- docs 테이블의 UNIQUE 제약조건을 수정하여 찬성/반대를 각각 저장할 수 있도록 변경

-- 1. 기존 UNIQUE 제약조건 삭제
ALTER TABLE public.docs DROP CONSTRAINT IF EXISTS docs_user_uuid_subject_id_key;

-- 2. 새로운 UNIQUE 제약조건 추가 (user_uuid, subject_id, against 조합으로)
ALTER TABLE public.docs ADD CONSTRAINT docs_user_uuid_subject_id_against_key 
    UNIQUE(user_uuid, subject_id, against);

-- 이제 한 사용자가 같은 주제에 대해 찬성(against=false)과 반대(against=true) 문서를 각각 하나씩 저장할 수 있습니다.

-- 테이블 주석 업데이트
COMMENT ON TABLE public.docs IS '사용자가 주제에 대해 준비한 자료 (찬성/반대 각각 저장 가능)';
COMMENT ON COLUMN public.docs.against IS '주제에 대한 반대 입장 여부 (false: 찬성, true: 반대)';
