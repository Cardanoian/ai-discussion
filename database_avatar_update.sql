-- ========================================
-- 프로필 사진 업로드 기능을 위한 데이터베이스 설정
-- ========================================

-- 1. user_profile 테이블에 avatar_url 컬럼 추가
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 컬럼에 대한 주석 추가
COMMENT ON COLUMN public.user_profile.avatar_url IS '사용자의 프로필 사진 URL';

-- ========================================
-- Supabase Storage 설정 가이드
-- ========================================

-- 다음 단계들을 Supabase 대시보드에서 수행해야 합니다:

-- STEP 1: Storage 버킷 생성
-- 1. Supabase 대시보드 → Storage 섹션으로 이동
-- 2. "New bucket" 클릭
-- 3. 버킷 이름: "avatars"
-- 4. Public bucket: ✅ 체크 (중요!)
-- 5. "Create bucket" 클릭

-- STEP 2: Storage Policies 설정
-- Storage → avatars 버킷 → Policies 탭에서 다음 정책들을 생성:

-- Policy 1: 업로드 허용
-- Name: "Users can upload avatars"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- Policy definition:
-- auth.uid()::text = (storage.foldername(name))[1]

-- Policy 2: 조회 허용 (공개)
-- Name: "Avatars are publicly accessible"
-- Allowed operation: SELECT
-- Target roles: public
-- Policy definition:
-- true

-- Policy 3: 업데이트 허용
-- Name: "Users can update their avatars"
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- Policy definition:
-- auth.uid()::text = (storage.foldername(name))[1]

-- Policy 4: 삭제 허용
-- Name: "Users can delete their avatars"
-- Allowed operation: DELETE
-- Target roles: authenticated
-- Policy definition:
-- auth.uid()::text = (storage.foldername(name))[1]

-- ========================================
-- 대안 방법 (RLS 정책 문제가 계속되는 경우)
-- ========================================

-- 만약 위의 정책으로도 문제가 해결되지 않는다면,
-- 임시로 모든 작업을 허용하는 정책을 사용할 수 있습니다:

-- 임시 정책 (모든 작업 허용):
-- Name: "Allow all operations for authenticated users"
-- Allowed operation: ALL
-- Target roles: authenticated
-- Policy definition:
-- true

-- 주의: 이 임시 정책은 보안상 권장되지 않으므로,
-- 나중에 더 구체적인 정책으로 교체해야 합니다.

-- ========================================
-- 문제 해결 체크리스트
-- ========================================

-- ✅ user_profile 테이블에 avatar_url 컬럼이 추가되었는지 확인
-- ✅ avatars 버킷이 생성되었는지 확인
-- ✅ avatars 버킷이 Public으로 설정되었는지 확인
-- ✅ Storage Policies가 올바르게 설정되었는지 확인
-- ✅ 브라우저 개발자 도구에서 정확한 에러 메시지 확인

-- 추가 디버깅을 위해 다음 쿼리로 현재 설정을 확인할 수 있습니다:
-- SELECT * FROM storage.buckets WHERE name = 'avatars';
-- SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
