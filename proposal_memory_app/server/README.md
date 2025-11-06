# Server Directory

Express 백엔드 서버 코드

## 구조

```
server/
├── index.ts              # 메인 서버 엔트리 포인트
├── middleware/           # 미들웨어
│   ├── logger.ts         # 요청 로깅
│   └── error-handler.ts  # 전역 오류 처리
├── routes/               # API 라우트 (추후 추가)
└── utils/                # 유틸리티 함수 (추후 추가)
```

## 실행 방법

### 개발 모드

```bash
npm run dev:server
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 프로덕션 빌드

```bash
# TypeScript 컴파일
tsc --project tsconfig.server.json

# 빌드된 파일 실행
node dist/index.js
```

## API 엔드포인트

### 헬스 체크

```
GET /health
```

**응답:**
```json
{
  "status": "ok",
  "timestamp": 1699999999999,
  "uptime": 123,
  "database": {
    "connected": true
  }
}
```

### API 정보

```
GET /api
```

**응답:**
```json
{
  "message": "Proposal Memory App API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "media": "/api/media",
    "letters": "/api/letters",
    "location": "/api/location",
    "mainVideo": "/api/main-video"
  }
}
```

## 미들웨어

### 요청 로거

모든 HTTP 요청을 색상으로 구분하여 로깅합니다.

```
[2025-11-06T14:00:00.000Z] GET /api - 200 (15ms)
```

### 오류 핸들러

전역 오류를 캐치하고 표준화된 오류 응답을 반환합니다.

**오류 응답 형식:**
```json
{
  "error": "ValidationError",
  "message": "파일 크기가 너무 큽니다.",
  "code": "VAL_001",
  "timestamp": 1699999999999
}
```

### CORS

`CORS_ORIGIN` 환경 변수에 설정된 origin만 허용합니다.

## 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
# 서버 포트
PORT=3001

# CORS 허용 origin
CORS_ORIGIN=http://localhost:3000

# 데이터베이스 (connection.ts에서 사용)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=proposal_memory

# Node 환경
NODE_ENV=development
```

## 개발 팁

### 자동 재시작

Nodemon을 사용하여 파일 변경 시 자동으로 재시작:

```bash
npm run dev:server
```

### 로그 확인

서버 로그는 색상으로 구분됩니다:
- 🟢 GET 요청: 녹색
- 🔵 POST 요청: 청록색
- 🟡 PUT 요청: 노란색
- 🔴 DELETE 요청: 빨간색

### 데이터베이스 연결

서버 시작 시 자동으로 데이터베이스 연결을 테스트합니다.
연결 실패 시 경고를 표시하지만 서버는 계속 실행됩니다.

## 오류 코드

| 코드 | 설명 |
|------|------|
| VAL_001 | 파일 크기 초과 |
| VAL_002 | 지원하지 않는 파일 형식 |
| VAL_003 | 필수 필드 누락 |
| SRV_001 | 내부 서버 오류 |
| SRV_003 | 리소스 없음 (404) |

## 추가 예정

- [ ] 미디어 업로드 API (`/api/media/upload`)
- [ ] 미디어 조회 API (`/api/media`)
- [ ] 편지 CRUD API (`/api/letters`)
- [ ] 위치 API (`/api/location`)
- [ ] 메인 영상 API (`/api/main-video`)
