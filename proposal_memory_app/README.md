# Proposal Memory App

프로포즈 당일의 소중한 순간들을 기록하고 보존하기 위한 Progressive Web App (PWA)

## 기술 스택

- **Frontend:** Next.js 14+ (App Router), TypeScript, CSS Modules
- **Backend:** Node.js (Express), REST API
- **Database:** MySQL 8.0+
- **PWA:** Service Worker, Web App Manifest
- **지도:** Leaflet.js (오픈소스)

## 주요 기능

- 📸 이미지 및 비디오 업로드 및 저장
- 🖼️ 미디어 갤러리 및 탐색
- ✉️ 프로포즈 편지 작성 및 관리
- 🎬 메인 영상 재생
- 🗺️ 프로포즈 장소 지도 표시
- 📱 PWA 설치 및 오프라인 지원

## 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- MySQL 8.0 이상
- npm 또는 yarn

### 설치

1. 저장소 클론

```bash
git clone <repository-url>
cd proposal_memory_app
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 값을 입력하세요:

- `DATABASE_URL`: MySQL 데이터베이스 연결 문자열
- `MAP_API_KEY`: 지도 API 키 (선택사항)
- 기타 설정 값

4. 데이터베이스 마이그레이션

```bash
npm run migrate
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

프로덕션 빌드:

```bash
npm run build
npm start
```

## 프로젝트 구조

```
proposal_memory_app/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 및 라이브러리
│   ├── hooks/            # 커스텀 React 훅
│   └── types/            # TypeScript 타입 정의
├── public/               # 정적 파일
├── server/               # Express 백엔드 (구현 예정)
└── database/             # 데이터베이스 스키마 (구현 예정)
```

## 개발 가이드

### 코드 스타일

- ESLint와 Prettier를 사용하여 코드 스타일을 통일합니다
- 커밋 전에 `npm run lint`를 실행하세요

### 테스트

```bash
npm test              # 단위 테스트
npm run test:e2e      # E2E 테스트
```

## 라이선스

GNU GENERAL PUBLIC LICENSE

## 문서

- [요구사항 문서](../specs/proposal_memory_app/requirements.md)
- [설계 문서](../specs/proposal_memory_app/design.md)
- [작업 계획](../specs/proposal_memory_app/tasks.md)
