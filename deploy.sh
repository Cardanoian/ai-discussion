#!/bin/bash
# Oracle Cloud 배포 스크립트

set -e  # 에러 발생 시 스크립트 중단

echo "🚀 AI Discussion 프론트엔드 배포 시작..."

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ package.json을 찾을 수 없습니다. 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# Node.js 버전 확인
echo "📋 Node.js 버전 확인..."
node --version
npm --version

# 의존성 설치
echo "📦 의존성 설치 중..."
npm i

# Terser 설치 확인 및 설치
echo "🔧 빌드 도구 확인 중..."
if ! npm list terser --depth=0 > /dev/null 2>&1; then
    echo "📥 Terser 설치 중 (코드 압축을 위해 필요)..."
    npm install --save-dev terser
else
    echo "✅ Terser가 이미 설치되어 있습니다."
fi

# 린트 검사 (경고만 표시, 오류 무시)
echo "🔍 코드 품질 검사 중..."
npm run lint || echo "⚠️  린트 경고가 있지만 배포를 계속합니다."

# 프로덕션 빌드
echo "🏗️  프로덕션 빌드 실행 중..."
npm run build:prod

# 빌드 결과 확인
if [ -d "dist" ]; then
    echo "✅ 빌드 성공!"
    echo "📁 빌드 결과:"
    ls -la dist/
    
    # 빌드 파일 크기 확인
    echo "📊 빌드 파일 크기:"
    du -sh dist/*
    
    # 총 빌드 크기
    echo "📈 총 빌드 크기: $(du -sh dist | cut -f1)"
else
    echo "❌ 빌드 실패!"
    exit 1
fi

# 환경 변수 파일 확인
if [ -f ".env.production" ]; then
    echo "✅ 프로덕션 환경 변수 파일 확인됨"
else
    echo "⚠️  .env.production 파일이 없습니다. 환경 변수를 확인해주세요."
fi

# Nginx 설정 파일 생성
echo "🔧 Nginx 설정 파일 생성 중..."
cat > ai-debate.conf << 'EOF'
server {
    listen 80;
    listen 8080;
    server_name debate.gbeai.net;
    root /var/www/ai-debate;
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
    server_name debate.gbeai.net;
    root /var/www/ai-debate;
    index index.html;

    # SSL 인증서 경로 (실제 경로로 수정 필요)
    # ssl_certificate /etc/letsencrypt/live/debate.gbeai.net/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/debate.gbeai.net/privkey.pem;

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
EOF

echo "✅ Nginx 설정 파일 생성 완료: ai-debate.conf"

# 배포 디렉토리 생성 및 파일 복사
echo "📁 배포 디렉토리 설정 중..."
if [ -d "/var/www/ai-debate" ]; then
    echo "🗑️  기존 배포 파일 백업 중..."
    sudo mv /var/www/ai-debate /var/www/ai-debate.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

echo "📂 새 배포 디렉토리 생성 중..."
sudo mkdir -p /var/www/ai-debate

echo "📋 빌드 파일 복사 중..."
sudo cp -r dist/* /var/www/ai-debate/

echo "🔐 파일 권한 설정 중..."
sudo chown -R www-data:www-data /var/www/ai-debate
sudo chmod -R 755 /var/www/ai-debate

echo ""
echo "🎉 배포 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. Nginx 설정 파일 적용:"
echo "   sudo cp ai-debate.conf /etc/nginx/sites-available/"
echo "   sudo ln -sf /etc/nginx/sites-available/ai-debate.conf /etc/nginx/sites-enabled/"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "2. SSL 인증서 설정 (선택사항):"
echo "   sudo certbot --nginx -d debate.gbeai.net"
echo ""
echo "3. 방화벽 설정 확인:"
echo "   sudo ufw allow 80"
echo "   sudo ufw allow 8080" 
echo "   sudo ufw allow 443"
echo ""
echo "🌐 접속 가능한 주소:"
echo "   http://129.154.48.207:80"
echo "   http://129.154.48.207:8080"
echo "   https://129.154.48.207:443 (SSL 설정 후)"
