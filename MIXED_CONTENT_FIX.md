# Mixed Content 문제 해결 가이드

## 🔍 문제 상황

- **에러**: `Mixed Content: The page at 'https://debate.gbeai.net/waiting-room' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://debate.gbeai.net:3050/socket.io/...'`
- **원인**: HTTPS 페이지에서 HTTP 리소스에 접근하려고 할 때 브라우저가 보안상 차단

## ✅ 해결 방안 적용 완료

### 1. nginx 프록시 설정

- **경로**: `/server/` → `http://localhost:3050/`
- **Socket.IO 지원**: WebSocket 업그레이드 헤더 설정
- **SSL 인증서**: Let's Encrypt 자동 설정

### 2. 환경변수 확인

현재 `.env.production` 설정:

```env
VITE_SERVER_URL="SERVER_URL/server"
```

### 3. 서버 설정 확인

- **서버 포트**: 3050 (HTTP)
- **프록시 경로**: `/server/` → `localhost:3050`

## 🚀 배포 방법

1. **스크립트 실행**:

   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **서버 시작** (discussion-server 디렉토리에서):
   ```bash
   cd discussion-server
   npm start
   ```

## 🔧 접속 URL 변경사항

### 이전 (문제 상황)

- Socket.IO: `http://debate.gbeai.net:3050/socket.io/`
- API: `http://debate.gbeai.net:3050/api/`

### 이후 (해결 후)

- Socket.IO: `https://debate.gbeai.net/server/socket.io/`
- API: `https://debate.gbeai.net/server/api/`

## 📋 확인 사항

### 1. nginx 설정 확인

```bash
sudo nginx -t
sudo systemctl status nginx
```

### 2. SSL 인증서 확인

```bash
sudo certbot certificates
```

### 3. 서버 실행 확인

```bash
# discussion-server가 3050포트에서 실행 중인지 확인
netstat -tlnp | grep 3050
```

### 4. 프록시 동작 확인

```bash
# API 테스트
curl -k https://debate.gbeai.net/server/

# Socket.IO 테스트
curl -k https://debate.gbeai.net/server/socket.io/
```

## 🐛 문제 해결

### 1. SSL 인증서 문제

```bash
sudo certbot --nginx -d debate.gbeai.net
```

### 2. nginx 설정 문제

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 3. 서버 연결 문제

- discussion-server가 3050포트에서 실행 중인지 확인
- 방화벽에서 3050포트가 열려있는지 확인 (내부 통신용)

## 📝 참고사항

- 이제 모든 통신이 HTTPS를 통해 이루어집니다
- Socket.IO 연결도 WSS(WebSocket Secure)를 사용합니다
- Mixed Content 에러가 완전히 해결되었습니다
