# Oracle Cloud 배포 가이드

## 프론트엔드 배포 준비

### 1. 빌드 및 배포 파일 생성

```bash
# 배포용 빌드 실행
npm run build:prod

# 빌드 결과 확인
ls -la dist/
```

### 2. Oracle Cloud Infrastructure (OCI) 설정

#### Object Storage를 이용한 정적 웹사이트 호스팅

1. **Bucket 생성**

   - OCI 콘솔에서 Object Storage > Buckets로 이동
   - 새 버킷 생성 (예: `ai-discussion-frontend`)
   - Visibility: Public으로 설정

2. **정적 웹사이트 설정**

   ```bash
   # OCI CLI를 사용한 버킷 설정
   oci os bucket update --bucket-name ai-discussion-frontend --public-access-type ObjectRead
   ```

3. **파일 업로드**
   ```bash
   # dist 폴더의 모든 파일을 버킷에 업로드
   oci os object bulk-upload --bucket-name ai-discussion-frontend --src-dir ./dist
   ```

#### Compute Instance를 이용한 배포 (대안)

1. **인스턴스 생성**

   - Ubuntu 22.04 LTS 이미지 사용
   - Shape: VM.Standard.E2.1.Micro (Always Free)

2. **웹 서버 설정**

   ```bash
   # Nginx 설치
   sudo apt update
   sudo apt install nginx -y

   # 빌드 파일 업로드 후 설정
   sudo cp -r dist/* /var/www/html/
   sudo systemctl enable nginx
   sudo systemctl start nginx
   ```

### 3. 환경 변수 확인

배포 전 `.env.production` 파일의 설정을 확인하세요:

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
VITE_GEMINI_API_KEY=""
VITE_SERVER_URL="http://129.154.48.207:3050/"
```

### 4. 도메인 및 SSL 설정

1. **도메인 연결**

   - OCI DNS 서비스 또는 외부 DNS 제공업체 사용
   - A 레코드로 인스턴스 IP 또는 Object Storage URL 연결

2. **SSL 인증서**
   ```bash
   # Let's Encrypt 사용 (Compute Instance 배포 시)
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

### 5. 성능 최적화

빌드 설정에서 다음 최적화가 적용되었습니다:

- **코드 분할**: vendor, ui, utils 청크로 분리
- **압축**: Terser를 사용한 코드 압축
- **Console 로그 제거**: 프로덕션에서 console.log 자동 제거
- **소스맵 비활성화**: 파일 크기 최적화

### 6. 배포 스크립트

프로젝트에 포함된 `deploy.sh` 스크립트를 사용하여 자동화된 배포를 수행할 수 있습니다:

```bash
# 배포 스크립트 실행
./deploy.sh
```

배포 스크립트는 다음 작업을 자동으로 수행합니다:

1. **환경 확인**: Node.js 및 npm 버전 확인
2. **의존성 설치**: `npm ci`로 정확한 의존성 설치
3. **빌드 도구 확인**: Terser가 없으면 자동 설치
4. **코드 품질 검사**: ESLint 실행 (경고 시에도 계속 진행)
5. **프로덕션 빌드**: 최적화된 빌드 실행
6. **결과 확인**: 빌드 파일 크기 및 구조 표시

**주요 특징:**

- Terser 자동 설치로 코드 압축 보장
- 린트 오류가 있어도 배포 계속 진행
- 상세한 빌드 결과 리포트 제공

### 7. 모니터링 및 로그

- **에러 추적**: 프로덕션에서 발생하는 에러 모니터링
- **성능 모니터링**: 로딩 시간 및 사용자 경험 추적
- **액세스 로그**: 웹 서버 로그 분석

### 8. 보안 고려사항

- **API 키 보안**: 환경 변수로 관리되는 API 키들의 보안
- **CORS 설정**: 백엔드 서버의 CORS 설정 확인
- **HTTPS 강제**: 모든 트래픽을 HTTPS로 리다이렉트

## 주의사항

1. **백엔드 서버 연결**: `VITE_SERVER_URL`이 올바른 백엔드 서버 주소를 가리키는지 확인
2. **Supabase 설정**: 데이터베이스 연결 및 인증 설정 확인
3. **Gemini API**: API 키 할당량 및 사용량 모니터링

## 트러블슈팅

### 빌드 오류

```bash
# 캐시 정리 후 재빌드
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

### 런타임 오류

- 브라우저 개발자 도구에서 네트워크 탭 확인
- 환경 변수 설정 재확인
- 백엔드 서버 상태 확인
