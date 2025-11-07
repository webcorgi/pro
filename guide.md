# 📖 Proposal Memory App - 프로젝트 가이드

> 프로포즈를 위한 특별한 추억 관리 웹 애플리케이션

---

## 📌 프로젝트 소개

**Proposal Memory App**은 프로포즈를 준비하는 사람들을 위한 PWA(Progressive Web App)입니다.
소중한 순간들의 사진과 영상을 업로드하고, 진심을 담은 편지를 작성하며, 특별한 장소를 지도에 표시할 수 있습니다.
오프라인에서도 동작하며, 모바일 기기에 설치하여 앱처럼 사용할 수 있습니다.

### 🎯 주요 기능

- 📸 **미디어 업로드**: 사진(JPEG, PNG, WebP)과 영상(MP4, WebM) 업로드 및 관리
- 💌 **편지 작성**: 진심이 담긴 편지를 작성하고 자동 저장
- 🗺️ **지도 표시**: 프로포즈 장소를 지도에 마커로 표시
- 🎬 **메인 영상**: 특별한 영상을 메인 화면에 설정
- 📱 **PWA 지원**: 오프라인 동작 및 홈 화면 설치 가능
- 🔄 **자동 동기화**: 오프라인에서 작업한 내용을 온라인 시 자동 업로드

---

## 🛠 기술 스택

### Frontend
- **Next.js 14+** (App Router) - React 프레임워크
- **TypeScript** - 타입 안정성
- **CSS Modules** - 컴포넌트 스타일링
- **IndexedDB** - 클라이언트 데이터 저장
- **Service Worker** - 오프라인 지원

### Backend
- **Express.js** - REST API 서버
- **MySQL** - 데이터베이스
- **Multer** - 파일 업로드
- **Sharp** - 이미지 처리 (썸네일 생성)
- **FFmpeg** - 비디오 썸네일 생성

### Libraries
- **Leaflet.js** - 지도 표시
- **React Hooks** - 상태 관리
- **Jest** - 단위 테스트
- **Playwright** - E2E 테스트

---

## 📁 프로젝트 구조

```
proposal_memory_app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   └── globals.css         # 전역 스타일
│   │
│   ├── components/             # React 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── OfflineIndicator.tsx
│   │   ├── media/              # 미디어 관련 컴포넌트
│   │   │   ├── MediaUploader.tsx
│   │   │   ├── MediaGallery.tsx
│   │   │   ├── ImageViewer.tsx
│   │   │   └── VideoPlayer.tsx
│   │   └── letters/            # 편지 관련 컴포넌트
│   │       ├── LetterEditor.tsx
│   │       ├── LetterList.tsx
│   │       └── LetterViewer.tsx
│   │
│   ├── hooks/                  # 커스텀 React Hooks
│   │   ├── useOnlineStatus.ts
│   │   ├── useMediaUpload.ts
│   │   ├── useIndexedDB.ts
│   │   └── useGeolocation.ts
│   │
│   ├── lib/                    # 유틸리티 및 라이브러리
│   │   ├── db/
│   │   │   ├── connection.ts   # MySQL 연결
│   │   │   └── indexedDB.ts    # IndexedDB 래퍼
│   │   ├── sw/
│   │   │   └── queue-manager.ts # 오프라인 큐
│   │   ├── utils/
│   │   │   ├── media-validator.ts
│   │   │   └── compression.ts
│   │   ├── error-handler.ts
│   │   └── retry.ts
│   │
│   └── types/                  # TypeScript 타입 정의
│       ├── index.ts
│       ├── media.ts
│       ├── letter.ts
│       ├── location.ts
│       ├── error.ts
│       └── api.ts
│
├── server/                     # Express 백엔드
│   ├── index.ts                # 서버 진입점
│   ├── routes/                 # API 라우트
│   │   ├── media.ts
│   │   ├── letters.ts
│   │   ├── location.ts
│   │   └── main-video.ts
│   ├── utils/                  # 서버 유틸리티
│   │   ├── multer-config.ts
│   │   └── thumbnail.ts
│   └── middleware/
│       └── error-handler.ts
│
├── database/                   # 데이터베이스 스키마
│   └── schema.sql
│
├── public/                     # 정적 파일
│   ├── manifest.json           # PWA 매니페스트
│   └── sw.js                   # Service Worker
│
└── __mocks__/                  # 테스트 모킹
    └── uuid.js
```

---

## 🚀 시작하기

### 1. 사전 요구사항

다음 프로그램들이 설치되어 있어야 합니다:

- **Node.js** 18.0.0 이상
- **npm** 또는 **yarn**
- **MySQL** 8.0 이상
- **FFmpeg** (비디오 썸네일 생성용)

### 2. 설치

```bash
# 저장소 클론
git clone <repository-url>
cd pro/proposal_memory_app

# 의존성 설치
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 데이터베이스 설정
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=proposal_memory

# 서버 설정
PORT=3001
NODE_ENV=development

# 지도 API (선택사항)
MAP_API_KEY=your_map_api_key

# 파일 업로드 설정
MAX_IMAGE_SIZE=10485760    # 10MB
MAX_VIDEO_SIZE=104857600   # 100MB
UPLOAD_DIR=./uploads
```

### 4. 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE proposal_memory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 스키마 적용
mysql -u root -p proposal_memory < database/schema.sql
```

### 5. 실행

#### 개발 모드

```bash
# 프론트엔드 (Next.js)
npm run dev

# 백엔드 (Express) - 별도 터미널
npm run server

# 또는 동시 실행
npm run dev:all
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

#### 프로덕션 모드

```bash
# 빌드
npm run build

# 실행
npm start
```

---

## 🧪 테스트

### 단위 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 리포트
npm run test:coverage
```

### E2E 테스트 실행

```bash
# Playwright 설치 (최초 1회)
npx playwright install

# E2E 테스트 실행
npm run test:e2e
```

### 현재 테스트 현황

- ✅ 미디어 검증 유틸리티 (25 tests)
- ✅ IndexedDB 래퍼 (20 tests)
- ✅ 데이터베이스 연결 (8 tests)
- ✅ useMediaUpload 훅 (9 tests)
- ✅ Multer 설정 (17 tests)
- ✅ 썸네일 생성 (15 tests)

---

## 🎨 주요 컴포넌트 설명

### 공통 컴포넌트 (src/components/common/)

#### Header.tsx
- 앱 상단 헤더
- 현재 페이지 제목 동적 표시
- 고정 위치 (fixed position)

#### BottomNav.tsx
- 하단 네비게이션 바
- 4개 탭: 홈, 업로드, 갤러리, 편지
- 활성 탭 시각적 표시

#### LoadingSpinner.tsx
- 로딩 스피너 컴포넌트
- 크기 옵션: small, medium, large
- 전체 화면 모드 지원

#### OfflineIndicator.tsx
- 오프라인 상태 표시 배너
- useOnlineStatus 훅 사용
- 자동 표시/숨김

### 미디어 컴포넌트 (src/components/media/)

#### MediaUploader.tsx
- 드래그 앤 드롭 파일 업로드
- 진행률 표시
- 파일 타입/크기 검증
- 오프라인 큐 지원

#### MediaGallery.tsx
- 그리드 레이아웃 갤러리
- 이미지/비디오 필터링
- 썸네일 표시
- 무한 스크롤/페이지네이션

#### ImageViewer.tsx
- 전체 화면 이미지 뷰어
- 확대/축소 기능
- 터치 제스처 지원
- 좌우 스와이프 네비게이션

#### VideoPlayer.tsx
- 커스텀 비디오 플레이어
- 재생/일시정지 컨트롤
- 진행 바, 볼륨 조절
- 전체 화면 모드

### 편지 컴포넌트 (src/components/letters/)

#### LetterEditor.tsx
- 편지 작성/수정 에디터
- 2초마다 자동 저장 (IndexedDB)
- 저장 상태 표시
- 제목 100자 제한

#### LetterList.tsx
- 저장된 편지 목록
- 최신순 정렬
- 제목 + 미리보기 (100자)
- 스마트 날짜 표시

#### LetterViewer.tsx
- 편지 읽기 전용 뷰
- 수정/삭제 버튼
- 삭제 확인 다이얼로그
- 작성/수정일 표시

---

## 🔌 API 엔드포인트

### 미디어 API

```
POST   /api/media/upload     # 미디어 업로드
GET    /api/media            # 미디어 목록 조회
GET    /api/media/:id        # 미디어 상세 조회
DELETE /api/media/:id        # 미디어 삭제
```

### 편지 API

```
POST   /api/letters          # 편지 생성
GET    /api/letters          # 편지 목록 조회
GET    /api/letters/:id      # 편지 상세 조회
PUT    /api/letters/:id      # 편지 수정
DELETE /api/letters/:id      # 편지 삭제
```

### 위치 API

```
POST   /api/location         # 위치 설정
GET    /api/location         # 위치 조회
PUT    /api/location/:id     # 위치 수정
```

### 메인 영상 API

```
POST   /api/main-video       # 메인 영상 설정
GET    /api/main-video       # 메인 영상 조회
```

---

## 🎯 커스텀 훅 사용법

### useOnlineStatus

네트워크 온라인/오프라인 상태 감지

```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();

  return <div>{isOnline ? '온라인' : '오프라인'}</div>;
}
```

### useMediaUpload

미디어 파일 업로드 (온라인/오프라인 지원)

```typescript
import { useMediaUpload } from '@/hooks/useMediaUpload';

function UploadComponent() {
  const { upload, isUploading, progress, error } = useMediaUpload();

  const handleUpload = async (file: File) => {
    const result = await upload(file);
    if (result.success) {
      console.log('업로드 완료:', result.mediaId);
    }
  };

  return (
    <div>
      {isUploading && <p>업로드 중... {progress}%</p>}
      {error && <p>오류: {error}</p>}
    </div>
  );
}
```

### useIndexedDB

IndexedDB CRUD 작업

```typescript
import { useIndexedDB } from '@/hooks/useIndexedDB';

function DataComponent() {
  const { add, get, update, remove, getAll } = useIndexedDB('drafts');

  const saveDraft = async (draft) => {
    await add(draft);
  };

  const loadDraft = async (id) => {
    const draft = await get(id);
    return draft;
  };
}
```

### useGeolocation

위치 정보 가져오기

```typescript
import { useGeolocation } from '@/hooks/useGeolocation';

function LocationComponent() {
  const { location, error, loading, getLocation } = useGeolocation();

  return (
    <button onClick={getLocation}>
      현재 위치 가져오기
    </button>
  );
}
```

---

## 📊 데이터베이스 스키마

### media 테이블
```sql
- id: INT (Primary Key)
- type: ENUM('image', 'video')
- original_url: VARCHAR(500)
- thumbnail_url: VARCHAR(500)
- file_size: INT
- mime_type: VARCHAR(50)
- created_at: TIMESTAMP
```

### letters 테이블
```sql
- id: INT (Primary Key)
- title: VARCHAR(100)
- content: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### location 테이블
```sql
- id: INT (Primary Key)
- name: VARCHAR(100)
- latitude: DECIMAL(10,8)
- longitude: DECIMAL(11,8)
- description: TEXT
- created_at: TIMESTAMP
```

### main_video 테이블
```sql
- id: INT (Primary Key)
- media_id: INT (Foreign Key)
- set_at: TIMESTAMP
```

---

## 🔧 개발 가이드

### 코드 스타일

프로젝트는 ESLint와 Prettier를 사용합니다:

```bash
# 린트 검사
npm run lint

# 자동 수정
npm run lint:fix

# 포맷팅
npm run format
```

### 새 컴포넌트 추가

1. 적절한 디렉토리에 컴포넌트 파일 생성
2. CSS Module 파일 함께 생성 (`.module.css`)
3. TypeScript 인터페이스 정의
4. JSDoc 주석 추가

예시:
```typescript
/**
 * MyComponent
 * 컴포넌트 설명
 * Requirements: [요구사항 번호]
 */

'use client';

import styles from './MyComponent.module.css';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  return <div className={styles.container}>{title}</div>;
}
```

### 새 API 엔드포인트 추가

1. `server/routes/`에 라우트 파일 생성
2. 컨트롤러 로직 구현
3. 타입 정의 (`src/types/api.ts`)
4. 오류 처리 추가
5. 단위 테스트 작성

---

## 🐛 트러블슈팅

### 일반적인 문제

#### 1. 데이터베이스 연결 실패
```
Error: ER_ACCESS_DENIED_ERROR
```
**해결방법**: `.env` 파일의 데이터베이스 인증 정보를 확인하세요.

#### 2. 포트 충돌
```
Error: Port 3000 is already in use
```
**해결방법**:
```bash
# 포트를 사용 중인 프로세스 종료
npx kill-port 3000

# 또는 다른 포트 사용
PORT=3002 npm run dev
```

#### 3. FFmpeg 관련 오류
```
Error: FFmpeg not found
```
**해결방법**:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# https://ffmpeg.org/download.html 에서 다운로드
```

#### 4. IndexedDB 테스트 오류
```
ReferenceError: structuredClone is not defined
```
**해결방법**: `jest.setup.js`에 polyfill이 추가되어 있는지 확인하세요.

#### 5. uuid 모듈 오류
```
SyntaxError: Unexpected token 'export'
```
**해결방법**: `__mocks__/uuid.js` 파일이 존재하고 `jest.setup.js`에서 모킹되어 있는지 확인하세요.

---

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
# Next.js 빌드
npm run build

# 빌드 결과 확인
npm run start

# 서버 빌드 (TypeScript 컴파일)
npm run build:server
```

### 환경별 설정

#### 개발 환경
- Hot reload 활성화
- Source maps 생성
- 상세한 오류 메시지

#### 프로덕션 환경
- 코드 최소화 (minification)
- 번들 최적화
- 캐싱 전략 적용
- HTTPS 강제

---

## 🔐 보안 고려사항

### 구현된 보안 기능

1. **파일 업로드 검증**
   - MIME 타입 확인
   - 파일 크기 제한
   - 파일 이름 sanitization

2. **SQL Injection 방지**
   - Prepared Statements 사용
   - 모든 쿼리 파라미터 검증

3. **CORS 설정**
   - 허용된 origin만 접근 가능
   - Credentials 포함 요청 제어

4. **오류 처리**
   - 상세 오류 정보 숨김
   - 표준화된 오류 응답
   - 오류 로깅

---

## 📚 참고 문서

### 프로젝트 문서

- `spec.md` - 상세 요구사항 명세
- `design.md` - 설계 문서
- `tasks.md` - 구현 계획 및 작업 목록
- `implement.md` - 구현 가이드라인

### 외부 문서

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [PWA 가이드](https://web.dev/progressive-web-apps/)
- [Leaflet.js 문서](https://leafletjs.com/reference.html)

---

## 🤝 기여하기

### 개발 워크플로우

1. 기능 브랜치 생성: `git checkout -b feature/my-feature`
2. 변경사항 커밋: `git commit -m "feat: add new feature"`
3. 테스트 실행: `npm test`
4. 푸시: `git push origin feature/my-feature`
5. Pull Request 생성

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 프로세스, 도구 설정 변경
```

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**마지막 업데이트**: 2025-11-07
**버전**: 1.0.0
**현재 진행률**: Phase 10 완료 (편지 컴포넌트)
