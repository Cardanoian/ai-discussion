# Oracle Cloud Nginx 배포 가이드

## 개요

이 가이드는 Oracle Cloud Compute Instance에서 Nginx를 사용하여 AI Discussion 프론트엔드를 배포하는 방법을 설명합니다. 80, 8080, 443 포트에서 모두 동일한 애플리케이션을 서비스하며, React Router를 사용하는 SPA(Single Page Application)에 최적화되어 있습니다.

## 사전 준비사항

### 1. Oracle Cloud Compute Instance 설정

- **OS**: Ubuntu 24.04 LTS
- **Shape**: VM.Standard.E2.1.Micro (Always Free) 또는 상위 사양
- **네트워크**: 공용 IP 할당 필요
- **보안 그룹**: 80, 8080, 443 포트 개방

### 2. 필수 소프트웨어 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Nginx 설치
sudo apt install nginx -y

# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 방화벽 설정
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 8080
sudo ufw allow 443
sudo ufw --force enable
```

## 배포 프로세스

### 1. 프로젝트 빌드 및 배포

프로젝트 루트 디렉토리에서 배포 스크립트를 실행합니다:

```bash
# 배포 스크립트 실행 권한 부여
chmod +x deploy.sh

# 배포 실행
./deploy.sh
```

배포 스크립트는 다음 작업을 자동으로 수행합니다:

1. **환경 확인**: Node.js 및 npm 버전 확인
2. **의존성 설치**: `npm ci`로 정확한 의존성 설치
3. **빌드 도구 확인**: Terser 자동 설치
4. **코드 품질 검사**: ESLint 실행
5. **프로덕션 빌드**: 최적화된 빌드 생성
6. **Nginx 설정 파일 생성**: SPA 라우팅 최적화된 설정
7. **파일 배포**: `/var/www/ai-discussion/`에 빌드 파일 복사
8. **권한 설정**: 적절한 파일 권한 설정

### 2. Nginx 설정 적용

배포 스크립트 실행 후 다음 명령어를 순서대로 실행합니다:

```bash
# 1. Nginx 설정 파일 복사
sudo cp nginx-ai-discussion.conf /etc/nginx/sites-available/

# 2. 심볼릭 링크 생성 (기존 default 설정 비활성화)
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/nginx-ai-discussion.conf /etc/nginx/sites-enabled/

# 3. Nginx 설정 테스트
sudo nginx -t

# 4. Nginx 재시작
sudo systemctl reload nginx
sudo systemctl enable nginx
```

### 3. 배포 확인

다음 주소로 접속하여 배포가 성공했는지 확인합니다:

- **HTTP 80 포트**: http://129.154.48.207:80
- **HTTP 8080 포트**: http://129.154.48.207:8080
- **HTTPS 443 포트**: https://129.154.48.207:443 (SSL 설정 후)

## Nginx 설정 상세 설명

### 생성된 Nginx 설정 파일 (`nginx-ai-discussion.conf`)

```nginx
server {
    listen 80;
    listen 8080;
    server_name _;
    root /var/www/ai-discussion;
    index index.html;

    # SPA 라우팅을 위한 설정
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}

# HTTPS 설정 (SSL 인증서가 있는 경우)
server {
    listen 443 ssl http2;
    server_name _;
    root /var/www/ai-discussion;
    index index.html;

    # SPA 라우팅을 위한 설정
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 압축
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### 주요 설정 설명

1. **멀티 포트 리스닝**: `listen 80;`과 `listen 8080;`으로 두 포트에서 동시 서비스
2. **SPA 라우팅**: `try_files $uri $uri/ /index.html;`로 모든 경로를 index.html로 폴백
3. **정적 파일 캐싱**: 1년간 캐싱으로 성능 최적화
4. **Gzip 압축**: 전송 데이터 크기 최소화

## SSL 인증서 설정 (HTTPS)

### Let's Encrypt를 사용한 무료 SSL 인증서

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# 도메인이 있는 경우
sudo certbot --nginx -d yourdomain.com

# IP만 사용하는 경우 (자체 서명 인증서)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/ai-discussion.key \
    -out /etc/ssl/certs/ai-discussion.crt \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=AI-Discussion/CN=129.154.48.207"
```

### SSL 설정 활성화

SSL 인증서 설치 후 Nginx 설정 파일에서 SSL 관련 주석을 해제합니다:

```bash
sudo nano /etc/nginx/sites-available/nginx-ai-discussion.conf
```

다음 라인들의 주석을 해제하고 경로를 수정합니다:

```nginx
# Let's Encrypt 사용 시
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# 자체 서명 인증서 사용 시
ssl_certificate /etc/ssl/certs/ai-discussion.crt;
ssl_certificate_key /etc/ssl/private/ai-discussion.key;
```

설정 후 Nginx 재시작:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 환경 변수 설정

### `.env.production` 파일 확인

배포 전에 프로덕션 환경 변수가 올바르게 설정되어 있는지 확인합니다:

```env
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_GEMINI_API_KEY="your-gemini-api-key"
VITE_SERVER_URL="http://129.154.48.207:3050/"
```

## 성능 최적화

### 1. Vite 빌드 최적화

현재 설정된 최적화 기능들:

- **코드 분할**: vendor, ui, utils 청크로 분리
- **Terser 압축**: 코드 크기 최소화
- **소스맵 비활성화**: 프로덕션 파일 크기 최적화

### 2. Nginx 최적화

- **Gzip 압축**: 텍스트 파일 압축으로 전송 속도 향상
- **정적 파일 캐싱**: 1년간 브라우저 캐싱
- **HTTP/2 지원**: HTTPS에서 HTTP/2 프로토콜 사용

## 모니터링 및 로그

### Nginx 로그 확인

```bash
# 액세스 로그
sudo tail -f /var/log/nginx/access.log

# 에러 로그
sudo tail -f /var/log/nginx/error.log

# 특정 IP의 요청만 확인
sudo grep "129.154.48.207" /var/log/nginx/access.log
```

### 시스템 상태 확인

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# 포트 사용 확인
sudo netstat -tlnp | grep -E ':(80|8080|443)'

# 디스크 사용량 확인
df -h /var/www/ai-discussion
```

## 업데이트 및 재배포

### 코드 업데이트 시

```bash
# Git에서 최신 코드 가져오기
git pull origin main

# 배포 스크립트 재실행
./deploy.sh

# Nginx 설정 재적용 (필요시)
sudo systemctl reload nginx
```

### 롤백 방법

배포 스크립트는 자동으로 이전 버전을 백업합니다:

```bash
# 백업 파일 확인
ls -la /var/www/ai-discussion.backup.*

# 롤백 실행
sudo rm -rf /var/www/ai-discussion
sudo mv /var/www/ai-discussion.backup.YYYYMMDD_HHMMSS /var/www/ai-discussion
sudo systemctl reload nginx
```

## 트러블슈팅

### 1. 404 에러 (페이지를 찾을 수 없음)

**증상**: `/room/123` 같은 경로에서 새로고침 시 404 에러

**해결방법**:

```bash
# Nginx 설정에 try_files가 있는지 확인
sudo nginx -t
grep -n "try_files" /etc/nginx/sites-available/nginx-ai-discussion.conf
```

### 2. 정적 파일 로딩 실패

**증상**: CSS, JS 파일이 로드되지 않음

**해결방법**:

```bash
# 파일 권한 확인
ls -la /var/www/ai-discussion/
sudo chown -R www-data:www-data /var/www/ai-discussion
sudo chmod -R 755 /var/www/ai-discussion
```

### 3. SSL 인증서 오류

**증상**: HTTPS 접속 시 인증서 오류

**해결방법**:

```bash
# 인증서 파일 확인
sudo ls -la /etc/letsencrypt/live/yourdomain.com/
sudo nginx -t
```

### 4. 포트 접근 불가

**증상**: 특정 포트로 접속이 안됨

**해결방법**:

```bash
# 방화벽 상태 확인
sudo ufw status

# Oracle Cloud 보안 그룹 확인 (웹 콘솔에서)
# Ingress Rules에 80, 8080, 443 포트가 0.0.0.0/0으로 열려있는지 확인
```

### 5. 빌드 실패

**증상**: `npm run build:prod` 실패

**해결방법**:

```bash
# 캐시 정리 후 재빌드
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

## 보안 고려사항

### 1. 방화벽 설정

```bash
# 필요한 포트만 개방
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 8080  # HTTP 대체 포트
sudo ufw allow 443   # HTTPS
```

### 2. Nginx 보안 헤더

추가 보안을 위해 Nginx 설정에 보안 헤더를 추가할 수 있습니다:

```nginx
# 보안 헤더 추가
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 3. 정기적인 업데이트

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# SSL 인증서 자동 갱신 확인
sudo certbot renew --dry-run
```

## 결론

이 가이드를 따라하면 Oracle Cloud에서 Nginx를 사용하여 AI Discussion 프론트엔드를 성공적으로 배포할 수 있습니다. 80, 8080, 443 포트에서 모두 접근 가능하며, React Router를 사용하는 SPA에 최적화된 설정으로 구성됩니다.

추가 질문이나 문제가 발생하면 로그 파일을 확인하고 트러블슈팅 섹션을 참조하세요.
