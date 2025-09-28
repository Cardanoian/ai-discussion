#!/bin/bash
# Oracle Cloud 배포 스크립트(네트워크 설정 제외)

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

# 배포 디렉토리 생성 및 파일 복사
echo "📁 배포 디렉토리 설정 중..."
if [ -d "/var/www/debate.gbeai.net" ]; then
    echo "🗑️  기존 배포 파일 백업 중..."
    sudo mv /var/www/debate.gbeai.net /var/www/debate.gbeai.net.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

echo "📂 새 배포 디렉토리 생성 중..."
sudo mkdir -p /var/www/debate.gbeai.net

echo "📋 빌드 파일 복사 중..."
sudo cp -r dist/* /var/www/debate.gbeai.net/

echo "🔐 파일 권한 설정 중..."
sudo chown -R www-data:www-data /var/www/debate.gbeai.net
sudo chmod -R 755 /var/www/debate.gbeai.net
