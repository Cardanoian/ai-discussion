# 프로필 사진 업로드 기능 설정 가이드

프로필 사진 업로드 기능이 작동하지 않는 경우 다음 단계를 따라 설정해주세요.

## 🚨 현재 발생하는 에러

```
StorageApiError: new row violates row-level security policy
```

이 에러는 Supabase Storage의 RLS(Row Level Security) 정책이 올바르게 설정되지 않았기 때문입니다.

## ✅ 해결 방법

### 1단계: 데이터베이스 스키마 업데이트

Supabase 대시보드의 SQL Editor에서 다음 명령을 실행하세요:

```sql
-- user_profile 테이블에 avatar_url 컬럼 추가
ALTER TABLE public.user_profile ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 컬럼에 대한 주석 추가
COMMENT ON COLUMN public.user_profile.avatar_url IS '사용자의 프로필 사진 URL';
```

### 2단계: Storage 버킷 생성

1. Supabase 대시보드 → **Storage** 섹션으로 이동
2. **"New bucket"** 클릭
3. 버킷 이름: `avatars`
4. **Public bucket: ✅ 체크** (매우 중요!)
5. **"Create bucket"** 클릭

### 3단계: Storage Policies 설정

Storage → avatars 버킷 → **Policies** 탭에서 다음 정책들을 생성:

#### Policy 1: 업로드 허용

- **Name**: `Users can upload avatars`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 2: 조회 허용 (공개)

- **Name**: `Avatars are publicly accessible`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:

```sql
true
```

#### Policy 3: 업데이트 허용

- **Name**: `Users can update their avatars`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

#### Policy 4: 삭제 허용

- **Name**: `Users can delete their avatars`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:

```sql
auth.uid()::text = (storage.foldername(name))[1]
```

## 🔧 문제가 계속되는 경우 (임시 해결책)

위의 정책으로도 문제가 해결되지 않는다면, 임시로 다음 정책을 사용하세요:

- **Name**: `Allow all operations for authenticated users`
- **Allowed operation**: `ALL`
- **Target roles**: `authenticated`
- **Policy definition**:

```sql
true
```

⚠️ **주의**: 이 임시 정책은 보안상 권장되지 않으므로, 나중에 더 구체적인 정책으로 교체해야 합니다.

## 📋 체크리스트

설정이 완료되었는지 확인하세요:

- [ ] `user_profile` 테이블에 `avatar_url` 컬럼이 추가되었는지 확인
- [ ] `avatars` 버킷이 생성되었는지 확인
- [ ] `avatars` 버킷이 **Public**으로 설정되었는지 확인
- [ ] Storage Policies가 올바르게 설정되었는지 확인
- [ ] 브라우저를 새로고침하고 다시 시도

## 🐛 디버깅

다음 쿼리로 현재 설정을 확인할 수 있습니다:

```sql
-- 버킷 확인
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- 업로드된 파일 확인
SELECT * FROM storage.objects WHERE bucket_id = 'avatars';
```

## 💡 추가 팁

1. **파일 크기 제한**: 현재 5MB로 설정되어 있습니다.
2. **지원 형식**: 모든 이미지 형식 (jpg, png, gif, webp 등)
3. **자동 삭제**: 새 프로필 사진을 업로드하면 이전 사진은 자동으로 삭제됩니다.

## 🆘 여전히 문제가 있다면

1. 브라우저 개발자 도구(F12)에서 정확한 에러 메시지를 확인하세요.
2. Supabase 대시보드의 Logs 섹션에서 에러 로그를 확인하세요.
3. 모든 설정이 올바른지 다시 한 번 확인하세요.

설정이 완료되면 프로필 페이지에서 프로필 사진 위에 마우스를 올리면 카메라 아이콘이 나타나고, 클릭하여 이미지를 업로드할 수 있습니다!
