# Implementation Plan
# 프로포즈용 추억남기기 웹앱

---

## Phase 1: 프로젝트 초기 설정 및 인프라

- [ ] 1. Next.js 프로젝트 초기화 및 기본 구조 설정
  - Next.js 14+ 프로젝트 생성 (`create-next-app` with TypeScript)
  - 디렉토리 구조 생성: `src/app`, `src/components`, `src/lib`, `src/types`, `src/hooks`
  - ESLint, Prettier 설정 파일 작성
  - `tsconfig.json` 경로 별칭 설정 (`@/*`)
  - _Requirements: 기술 스택_

- [ ] 1.1 환경 변수 및 설정 파일 작성
  - `.env.example` 파일 생성 (DATABASE_URL, MAP_API_KEY 등)
  - `next.config.js` PWA 설정 추가 (`next-pwa` 플러그인)
  - _Requirements: 기술 제약사항_

- [ ] 1.2 패키지 의존성 설치
  - 프론트엔드 의존성: `leaflet`, `react-leaflet` 설치
  - 개발 의존성: `@types/node`, `@types/react`, `jest`, `@testing-library/react` 설치
  - PWA 의존성: `next-pwa`, `workbox-*` 설치
  - _Requirements: 기술 스택_

---

## Phase 2: 데이터베이스 및 백엔드 설정

- [ ] 2. MySQL 데이터베이스 스키마 생성
  - `database/schema.sql` 파일 작성
  - `media` 테이블 생성 SQL 작성
  - `letters` 테이블 생성 SQL 작성
  - `location` 테이블 생성 SQL 작성
  - `main_video` 테이블 생성 SQL 작성
  - 인덱스 및 외래키 제약조건 설정
  - _Requirements: 2, 3, 4, 5, 8_

- [ ] 2.1 데이터베이스 연결 유틸리티 작성
  - `src/lib/db/connection.ts` 파일 생성
  - MySQL2 connection pool 설정 코드 작성
  - 연결 오류 처리 로직 구현
  - 연결 테스트 함수 작성
  - _Requirements: 기술 제약사항_

- [ ] 2.2 데이터베이스 마이그레이션 스크립트 작성
  - `scripts/migrate.ts` 파일 생성
  - 스키마 초기화 및 마이그레이션 로직 구현
  - 롤백 기능 구현
  - _Requirements: 기술 제약사항_

---

## Phase 3: TypeScript 타입 정의

- [ ] 3. 공통 타입 및 인터페이스 정의
  - `src/types/media.ts` 파일 생성 (`Media`, `MediaMetadata`, `UploadProgress` 인터페이스)
  - `src/types/letter.ts` 파일 생성 (`Letter` 인터페이스)
  - `src/types/location.ts` 파일 생성 (`Location` 인터페이스)
  - `src/types/error.ts` 파일 생성 (`AppError`, `ErrorCategory` enum)
  - `src/types/api.ts` 파일 생성 (모든 API request/response 타입)
  - _Requirements: 전체_

---

## Phase 4: 백엔드 API 구현

- [ ] 4. Express 서버 초기화
  - `server/index.ts` 파일 생성
  - Express 앱 설정 (CORS, body-parser, multer)
  - 미들웨어 설정: 로깅, 오류 처리
  - 서버 시작 코드 작성 (포트 3001)
  - _Requirements: 기술 스택_

- [ ] 4.1 미디어 업로드 API 엔드포인트 구현
  - `server/routes/media.ts` 파일 생성
  - `POST /api/media/upload` 엔드포인트 구현
    - Multer를 사용한 파일 업로드 처리
    - 파일 크기 및 MIME 타입 검증
    - 파일 시스템에 저장
    - 썸네일 생성 (이미지: Sharp, 비디오: FFmpeg)
    - 데이터베이스에 메타데이터 저장
  - _Requirements: 2_

- [ ] 4.2 미디어 조회 API 엔드포인트 구현
  - `GET /api/media` 엔드포인트 구현
    - 쿼리 파라미터 처리 (type, limit, offset, sortBy)
    - 데이터베이스에서 미디어 목록 조회
    - 페이지네이션 로직 구현
  - `GET /api/media/:id` 엔드포인트 구현
  - _Requirements: 3_

- [ ] 4.3 미디어 삭제 API 엔드포인트 구현
  - `DELETE /api/media/:id` 엔드포인트 구현
    - 데이터베이스에서 레코드 삭제
    - 파일 시스템에서 파일 삭제
    - 오류 처리 (파일 없음, 권한 없음)
  - _Requirements: 3_

- [ ] 4.4 미디어 API 단위 테스트 작성
  - `server/__tests__/routes/media.test.ts` 파일 생성
  - 업로드 성공/실패 케이스 테스트
  - 파일 크기 초과 테스트
  - 지원하지 않는 형식 테스트
  - _Requirements: 2_

- [ ] 4.5 편지 CRUD API 엔드포인트 구현
  - `server/routes/letters.ts` 파일 생성
  - `POST /api/letters` 엔드포인트 구현 (편지 생성)
  - `GET /api/letters` 엔드포인트 구현 (편지 목록 조회)
  - `GET /api/letters/:id` 엔드포인트 구현 (편지 상세 조회)
  - `PUT /api/letters/:id` 엔드포인트 구현 (편지 수정)
  - `DELETE /api/letters/:id` 엔드포인트 구현 (편지 삭제)
  - _Requirements: 4_

- [ ] 4.6 편지 API 단위 테스트 작성
  - `server/__tests__/routes/letters.test.ts` 파일 생성
  - CRUD 연산 테스트
  - 자동 저장 시나리오 테스트
  - _Requirements: 4_

- [ ] 4.7 위치 API 엔드포인트 구현
  - `server/routes/location.ts` 파일 생성
  - `POST /api/location` 엔드포인트 구현 (위치 설정)
  - `GET /api/location` 엔드포인트 구현 (위치 조회)
  - `PUT /api/location/:id` 엔드포인트 구현 (위치 수정)
  - 좌표 유효성 검증 로직 구현
  - _Requirements: 8_

- [ ] 4.8 메인 영상 API 엔드포인트 구현
  - `server/routes/main-video.ts` 파일 생성
  - `POST /api/main-video` 엔드포인트 구현 (메인 영상 설정)
  - `GET /api/main-video` 엔드포인트 구현 (메인 영상 조회, media 정보 포함)
  - _Requirements: 5_

- [ ] 4.9 백엔드 오류 처리 미들웨어 구현
  - `server/middleware/error-handler.ts` 파일 생성
  - 오류 분류 및 표준화 로직 구현
  - HTTP 상태 코드 매핑
  - 오류 로깅 추가
  - _Requirements: 6_

---

## Phase 5: 유틸리티 및 헬퍼 함수

- [ ] 5. 미디어 검증 유틸리티 작성
  - `src/lib/utils/media-validator.ts` 파일 생성
  - `validateFileSize()` 함수 구현 (이미지 10MB, 비디오 100MB 제한)
  - `validateFileType()` 함수 구현 (JPEG, PNG, WebP, MP4, WebM)
  - `validateFile()` 통합 검증 함수 구현
  - _Requirements: 2_

- [ ] 5.1 미디어 검증 단위 테스트 작성
  - `src/lib/utils/__tests__/media-validator.test.ts` 파일 생성
  - 각 검증 함수에 대한 성공/실패 케이스 테스트
  - _Requirements: 2_

- [ ] 5.2 오류 처리 유틸리티 작성
  - `src/lib/error-handler.ts` 파일 생성
  - `ErrorHandler` 클래스 구현
  - `normalize()`, `log()`, `notify()`, `recover()` 메서드 작성
  - 오류 코드 상수 정의
  - _Requirements: 6_

- [ ] 5.3 재시도 로직 유틸리티 작성
  - `src/lib/retry.ts` 파일 생성
  - `retryWithBackoff()` 함수 구현 (exponential backoff)
  - 재시도 설정 인터페이스 정의
  - _Requirements: 2_

- [ ] 5.4 이미지 압축 유틸리티 작성
  - `src/lib/utils/compression.ts` 파일 생성
  - 클라이언트 사이드 이미지 압축 함수 구현 (Canvas API)
  - 품질 및 크기 조정 옵션 지원
  - _Requirements: 7_

- [ ] 5.5 썸네일 생성 유틸리티 작성
  - `server/lib/thumbnail.ts` 파일 생성
  - 이미지 썸네일 생성 함수 구현 (Sharp)
  - 비디오 썸네일 생성 함수 구현 (FFmpeg)
  - _Requirements: 2_

---

## Phase 6: IndexedDB 및 오프라인 지원

- [ ] 6. IndexedDB 래퍼 구현
  - `src/lib/db/indexedDB.ts` 파일 생성
  - 데이터베이스 초기화 함수 작성
  - Object Store 생성: `cachedMedia`, `pendingUploads`, `drafts`, `settings`
  - 인덱스 설정
  - _Requirements: 1_

- [ ] 6.1 IndexedDB CRUD 메서드 구현
  - `add()`, `get()`, `update()`, `delete()`, `getAll()` 메서드 작성
  - 트랜잭션 처리 로직 구현
  - 오류 처리 추가
  - _Requirements: 1_

- [ ] 6.2 IndexedDB 단위 테스트 작성
  - `src/lib/db/__tests__/indexedDB.test.ts` 파일 생성
  - CRUD 연산 테스트
  - fake-indexeddb 라이브러리 사용
  - _Requirements: 1_

- [ ] 6.3 오프라인 업로드 큐 매니저 구현
  - `src/lib/sw/queue-manager.ts` 파일 생성
  - `addToQueue()` 함수 구현 (pendingUploads에 추가)
  - `processQueue()` 함수 구현 (온라인 시 자동 업로드)
  - 재시도 로직 통합
  - _Requirements: 1_

---

## Phase 7: 커스텀 훅 구현

- [ ] 7. 온라인 상태 감지 훅 작성
  - `src/hooks/useOnlineStatus.ts` 파일 생성
  - `navigator.onLine` 및 이벤트 리스너 설정
  - 온라인/오프라인 상태 반환
  - _Requirements: 1_

- [ ] 7.1 미디어 업로드 훅 작성
  - `src/hooks/useMediaUpload.ts` 파일 생성
  - `upload()` 함수 구현
    - 파일 검증
    - 온라인: API 호출
    - 오프라인: IndexedDB 큐에 추가
  - 업로드 진행 상태 관리
  - _Requirements: 2_

- [ ] 7.2 미디어 업로드 훅 테스트 작성
  - `src/hooks/__tests__/useMediaUpload.test.ts` 파일 생성
  - 온라인/오프라인 시나리오 테스트
  - React Testing Library 사용
  - _Requirements: 2_

- [ ] 7.3 IndexedDB 훅 작성
  - `src/hooks/useIndexedDB.ts` 파일 생성
  - CRUD 연산을 위한 React 훅 래퍼
  - 상태 관리 (loading, error)
  - _Requirements: 1_

- [ ] 7.4 Geolocation 훅 작성
  - `src/hooks/useGeolocation.ts` 파일 생성
  - `navigator.geolocation.getCurrentPosition()` 래퍼
  - 권한 처리 로직
  - 오류 처리 (권한 거부, 타임아웃)
  - _Requirements: 8_

---

## Phase 8: 프론트엔드 컴포넌트 - 공통

- [ ] 8. 레이아웃 컴포넌트 구현
  - `src/app/layout.tsx` 파일 수정 (루트 레이아웃)
  - HTML 메타데이터 설정 (PWA manifest, theme-color)
  - 폰트 로딩 설정
  - _Requirements: 1_

- [ ] 8.1 헤더 컴포넌트 구현
  - `src/components/common/Header.tsx` 파일 생성
  - 앱 타이틀, 네비게이션 버튼 렌더링
  - CSS 스타일 작성
  - _Requirements: 7_

- [ ] 8.2 하단 네비게이션 컴포넌트 구현
  - `src/components/common/BottomNav.tsx` 파일 생성
  - 메인, 갤러리, 편지, 설정 탭 버튼
  - 활성 탭 표시
  - CSS 스타일 작성
  - _Requirements: 7_

- [ ] 8.3 로딩 스피너 컴포넌트 구현
  - `src/components/common/LoadingSpinner.tsx` 파일 생성
  - CSS 애니메이션 추가
  - _Requirements: 7_

- [ ] 8.4 오프라인 인디케이터 컴포넌트 구현
  - `src/components/common/OfflineIndicator.tsx` 파일 생성
  - `useOnlineStatus` 훅 사용
  - 오프라인 시 배너 표시
  - _Requirements: 1_

---

## Phase 9: 프론트엔드 컴포넌트 - 미디어

- [ ] 9. 미디어 업로더 컴포넌트 구현
  - `src/components/media/MediaUploader.tsx` 파일 생성
  - 파일 선택 input 렌더링
  - `useMediaUpload` 훅 통합
  - 업로드 진행 바 표시
  - 드래그 앤 드롭 지원
  - _Requirements: 2_

- [ ] 9.1 미디어 갤러리 컴포넌트 구현
  - `src/components/media/MediaGallery.tsx` 파일 생성
  - 그리드 레이아웃 렌더링
  - 이미지/비디오 썸네일 표시
  - 무한 스크롤 또는 페이지네이션 구현
  - 필터 및 정렬 옵션
  - _Requirements: 3_

- [ ] 9.2 이미지 뷰어 컴포넌트 구현
  - `src/components/media/ImageViewer.tsx` 파일 생성
  - 전체화면 모달 렌더링
  - 좌우 스와이프 네비게이션 (react-swipeable)
  - 확대/축소 기능 (pinch-zoom)
  - 닫기 버튼
  - _Requirements: 3_

- [ ] 9.3 비디오 플레이어 컴포넌트 구현
  - `src/components/media/VideoPlayer.tsx` 파일 생성
  - HTML5 video 태그 사용
  - 커스텀 컨트롤 UI (재생/일시정지, 진행 바, 볼륨, 전체화면)
  - 자동 재생 옵션
  - _Requirements: 3, 5_

---

## Phase 10: 프론트엔드 컴포넌트 - 편지

- [ ] 10. 편지 에디터 컴포넌트 구현
  - `src/components/letters/LetterEditor.tsx` 파일 생성
  - textarea 또는 contentEditable 사용
  - 실시간 자동 저장 (IndexedDB drafts)
  - 저장 버튼 및 취소 버튼
  - _Requirements: 4_

- [ ] 10.1 편지 목록 컴포넌트 구현
  - `src/components/letters/LetterList.tsx` 파일 생성
  - 저장된 편지 목록 렌더링
  - 제목, 작성일 표시
  - 편지 클릭 시 상세 페이지 이동
  - _Requirements: 4_

- [ ] 10.2 편지 뷰어 컴포넌트 구현
  - `src/components/letters/LetterViewer.tsx` 파일 생성
  - 읽기 전용 모드로 편지 내용 표시
  - 수정 버튼 (에디터 모드로 전환)
  - 삭제 버튼 (확인 다이얼로그)
  - _Requirements: 4_

---

## Phase 11: 프론트엔드 컴포넌트 - 지도

- [ ] 11. 지도 뷰 컴포넌트 구현
  - `src/components/map/MapView.tsx` 파일 생성
  - Leaflet.js 초기화 및 지도 렌더링
  - 위치 마커 표시
  - 오프라인 시 캐시된 타일 사용 또는 대체 UI
  - _Requirements: 8_

- [ ] 11.1 위치 마커 컴포넌트 구현
  - `src/components/map/LocationMarker.tsx` 파일 생성
  - 커스텀 마커 아이콘
  - 클릭 시 팝업 표시 (장소명, 날짜)
  - _Requirements: 8_

- [ ] 11.2 위치 선택 컴포넌트 구현
  - `src/components/map/LocationPicker.tsx` 파일 생성
  - 지도 클릭 또는 드래그로 위치 선택
  - 검색 기능 (Geocoding API)
  - 현재 위치 가져오기 버튼 (`useGeolocation` 훅 사용)
  - _Requirements: 8_

---

## Phase 12: 프론트엔드 컴포넌트 - PWA

- [ ] 12. PWA 설치 프롬프트 컴포넌트 구현
  - `src/components/pwa/InstallPrompt.tsx` 파일 생성
  - `beforeinstallprompt` 이벤트 리스너 등록
  - 설치 배너 UI 렌더링
  - 설치 버튼 클릭 핸들러
  - _Requirements: 1_

- [ ] 12.1 업데이트 알림 컴포넌트 구현
  - `src/components/pwa/UpdateNotification.tsx` 파일 생성
  - Service Worker `updatefound` 이벤트 리스너
  - 업데이트 알림 배너 표시
  - 새로고침 버튼 (업데이트 적용)
  - _Requirements: 1_

---

## Phase 13: 페이지 구현

- [ ] 13. 메인 페이지 구현
  - `src/app/(main)/page.tsx` 파일 생성
  - 지도 컴포넌트 (`MapView`) 렌더링
  - 메인 영상 섹션 렌더링
  - 프로포즈 장소 요약 정보 표시
  - _Requirements: 5, 8_

- [ ] 13.1 갤러리 페이지 구현
  - `src/app/(main)/gallery/page.tsx` 파일 생성
  - `MediaGallery` 컴포넌트 렌더링
  - `MediaUploader` 컴포넌트 추가
  - 필터 및 정렬 UI
  - _Requirements: 2, 3_

- [ ] 13.2 편지 목록 페이지 구현
  - `src/app/(main)/letters/page.tsx` 파일 생성
  - `LetterList` 컴포넌트 렌더링
  - "새 편지 작성" 버튼
  - _Requirements: 4_

- [ ] 13.3 편지 작성/수정 페이지 구현
  - `src/app/(main)/letters/[id]/page.tsx` 파일 생성
  - `LetterEditor` 컴포넌트 렌더링
  - 새 편지 또는 기존 편지 로드
  - _Requirements: 4_

- [ ] 13.4 편지 상세 페이지 구현
  - `src/app/(main)/letters/[id]/view/page.tsx` 파일 생성
  - `LetterViewer` 컴포넌트 렌더링
  - _Requirements: 4_

- [ ] 13.5 설정 페이지 구현
  - `src/app/(main)/settings/page.tsx` 파일 생성
  - 프로포즈 장소 변경 UI
  - 메인 영상 변경 UI
  - 데이터 삭제 버튼 (확인 다이얼로그)
  - 개인정보 처리방침 링크
  - _Requirements: 5, 6, 8_

---

## Phase 14: API 클라이언트 구현

- [ ] 14. 미디어 API 클라이언트 작성
  - `src/lib/api/media.ts` 파일 생성
  - `uploadMedia()` 함수 구현 (FormData POST)
  - `getMedia()` 함수 구현 (GET with query params)
  - `deleteMedia()` 함수 구현 (DELETE)
  - 오류 처리 및 타입 안전성 보장
  - _Requirements: 2, 3_

- [ ] 14.1 편지 API 클라이언트 작성
  - `src/lib/api/letters.ts` 파일 생성
  - `createLetter()`, `getLetters()`, `getLetter()`, `updateLetter()`, `deleteLetter()` 함수 구현
  - _Requirements: 4_

- [ ] 14.2 위치 API 클라이언트 작성
  - `src/lib/api/location.ts` 파일 생성
  - `setLocation()`, `getLocation()`, `updateLocation()` 함수 구현
  - _Requirements: 8_

- [ ] 14.3 메인 영상 API 클라이언트 작성
  - `src/lib/api/main-video.ts` 파일 생성
  - `setMainVideo()`, `getMainVideo()` 함수 구현
  - _Requirements: 5_

---

## Phase 15: Service Worker 구현

- [ ] 15. Service Worker 파일 작성
  - `public/sw.js` 파일 생성
  - Service Worker 설치 및 활성화 이벤트 핸들러
  - 캐시 네이밍 상수 정의
  - _Requirements: 1_

- [ ] 15.1 Service Worker 캐싱 전략 구현
  - `fetch` 이벤트 핸들러 작성
  - App Shell: Network First with Cache Fallback
  - 미디어 파일: Cache First
  - API 요청: Network First with Offline Queue
  - 정적 리소스: Cache First with Stale-While-Revalidate
  - _Requirements: 1_

- [ ] 15.2 Service Worker 등록 코드 작성
  - `src/lib/sw/registration.ts` 파일 생성
  - Service Worker 등록 로직 구현
  - 업데이트 감지 및 알림
  - `src/app/layout.tsx`에서 등록 호출
  - _Requirements: 1_

- [ ] 15.3 백그라운드 동기화 구현
  - `src/lib/sw/sync.ts` 파일 생성
  - Background Sync API 사용
  - `sync` 이벤트 핸들러 작성 (오프라인 큐 처리)
  - _Requirements: 1_

---

## Phase 16: PWA Manifest 작성

- [ ] 16. Web App Manifest 파일 작성
  - `public/manifest.json` 파일 생성
  - 앱 이름, 설명, 아이콘, 테마 색상 설정
  - `display: "standalone"` 설정
  - `start_url`, `scope` 설정
  - _Requirements: 1_

- [ ] 16.1 PWA 아이콘 생성
  - 다양한 크기의 아이콘 생성 (192x192, 512x512 등)
  - `public/icons/` 디렉토리에 저장
  - Manifest에 아이콘 경로 추가
  - _Requirements: 1_

---

## Phase 17: 통합 테스트

- [ ] 17. 미디어 업로드 플로우 통합 테스트
  - `server/__tests__/integration/media-upload.test.ts` 파일 생성
  - 이미지 업로드 전체 플로우 테스트 (API → DB → FS)
  - 비디오 업로드 및 썸네일 생성 테스트
  - 파일 크기 초과 오류 테스트
  - _Requirements: 2_

- [ ] 17.1 편지 CRUD 통합 테스트
  - `server/__tests__/integration/letters.test.ts` 파일 생성
  - 편지 생성, 조회, 수정, 삭제 플로우 테스트
  - _Requirements: 4_

- [ ] 17.2 오프라인 동기화 통합 테스트
  - `src/lib/__tests__/integration/offline-sync.test.ts` 파일 생성
  - 오프라인 시 업로드 큐 추가 테스트
  - 온라인 복귀 시 자동 업로드 테스트
  - _Requirements: 1_

---

## Phase 18: E2E 테스트

- [ ] 18. Playwright 설정
  - `playwright.config.ts` 파일 생성
  - 브라우저 설정 (Chromium, Firefox, WebKit)
  - 베이스 URL 설정
  - _Requirements: 테스트 전략_

- [ ] 18.1 미디어 업로드 E2E 테스트
  - `e2e/media-upload.spec.ts` 파일 생성
  - 사용자가 이미지를 업로드하고 갤러리에서 확인하는 시나리오
  - 오프라인 상태에서 업로드 시도 시나리오
  - _Requirements: 2, 3_

- [ ] 18.2 편지 작성 E2E 테스트
  - `e2e/letter-writing.spec.ts` 파일 생성
  - 사용자가 편지를 작성하고 저장하는 시나리오
  - 자동 저장 기능 테스트
  - _Requirements: 4_

- [ ] 18.3 PWA 설치 E2E 테스트
  - `e2e/pwa-install.spec.ts` 파일 생성
  - PWA 설치 프롬프트 표시 테스트
  - Service Worker 등록 확인
  - _Requirements: 1_

- [ ] 18.4 지도 및 위치 설정 E2E 테스트
  - `e2e/location-setting.spec.ts` 파일 생성
  - 사용자가 프로포즈 장소를 설정하는 시나리오
  - 지도에서 마커 확인 시나리오
  - _Requirements: 8_

---

## Phase 19: CI/CD 설정

- [ ] 19. GitHub Actions CI 워크플로우 작성
  - `.github/workflows/ci.yml` 파일 생성
  - Lint, TypeScript 체크, 단위 테스트, 통합 테스트 job 설정
  - MySQL 서비스 컨테이너 설정
  - 코드 커버리지 업로드 (Codecov)
  - _Requirements: CI/CD 전략_

- [ ] 19.1 GitHub Actions 배포 워크플로우 작성
  - `.github/workflows/deploy-production.yml` 파일 생성
  - 빌드 및 배포 job 설정
  - E2E 테스트 실행
  - Slack 알림 추가
  - _Requirements: CI/CD 전략_

- [ ] 19.2 환경 변수 시크릿 설정 문서 작성
  - `.github/SECRETS.md` 파일 생성
  - 필요한 GitHub Secrets 목록 작성
  - 설정 방법 설명
  - _Requirements: CI/CD 전략_

---

## Phase 20: 성능 최적화

- [ ] 20. 이미지 최적화 구현
  - Next.js Image 컴포넌트 사용
  - 이미지 Lazy Loading 적용
  - WebP 형식 지원
  - _Requirements: 7_

- [ ] 20.1 코드 스플리팅 최적화
  - Dynamic import로 컴포넌트 지연 로딩
  - Route-based code splitting 확인
  - _Requirements: 7_

- [ ] 20.2 Web Vitals 모니터링 구현
  - `src/lib/monitoring/web-vitals.ts` 파일 생성
  - CLS, FID, FCP, LCP, TTFB 측정
  - Google Analytics 전송
  - _Requirements: 7_

- [ ] 20.3 CSS 최적화
  - CSS Modules 사용 확인
  - 미사용 CSS 제거
  - Critical CSS 인라인
  - _Requirements: 7_

---

## Phase 21: 보안 강화

- [ ] 21. CORS 설정 검증
  - Express CORS 미들웨어 설정 검토
  - 허용된 origin만 접근 가능하도록 제한
  - _Requirements: 6_

- [ ] 21.1 파일 업로드 보안 강화
  - MIME 타입 검증 강화 (magic number 체크)
  - 파일 이름 sanitization
  - 파일 크기 제한 엄격히 적용
  - _Requirements: 6_

- [ ] 21.2 SQL Injection 방지 확인
  - Prepared Statements 사용 확인
  - 모든 DB 쿼리 검토
  - _Requirements: 6_

- [ ] 21.3 XSS 방지 설정
  - Content Security Policy 헤더 설정
  - 사용자 입력 sanitization (편지 내용)
  - _Requirements: 6_

- [ ] 21.4 HTTPS 강제 적용 설정
  - Next.js 미들웨어에서 HTTPS 리다이렉트
  - HSTS 헤더 설정
  - _Requirements: 6_

---

## Phase 22: 접근성 개선

- [ ] 22. 키보드 네비게이션 지원
  - 모든 인터랙티브 요소에 탭 순서 설정
  - 포커스 표시 스타일 추가
  - _Requirements: 7_

- [ ] 22.1 ARIA 속성 추가
  - 버튼, 링크에 적절한 `aria-label` 추가
  - 모달에 `role="dialog"` 추가
  - _Requirements: 7_

- [ ] 22.2 스크린 리더 테스트
  - 주요 기능을 스크린 리더로 테스트
  - 이미지에 `alt` 텍스트 추가
  - _Requirements: 7_

---

## Phase 23: 최종 검증 및 테스트

- [ ] 23. Lighthouse 감사 실행
  - Performance 점수 90+ 확인
  - PWA 점수 100 확인
  - Accessibility 점수 90+ 확인
  - Best Practices 점수 90+ 확인
  - _Requirements: 7_

- [ ] 23.1 모바일 기기 테스트
  - iOS Safari에서 PWA 설치 및 기능 테스트
  - Android Chrome에서 PWA 설치 및 기능 테스트
  - 다양한 화면 크기에서 반응형 테스트
  - _Requirements: 1, 7_

- [ ] 23.2 오프라인 기능 전체 테스트
  - 네트워크 끊고 앱 실행
  - 캐시된 콘텐츠 표시 확인
  - 오프라인 업로드 큐 동작 확인
  - 온라인 복귀 시 동기화 확인
  - _Requirements: 1_

- [ ] 23.3 전체 사용자 플로우 테스트
  - 처음 설치부터 모든 기능 사용까지 전체 플로우 테스트
  - 각 요구사항이 충족되는지 검증
  - 엣지 케이스 테스트 (저장 공간 부족, 권한 거부 등)
  - _Requirements: 전체_

- [ ] 23.4 코드 커버리지 확인
  - 전체 커버리지 80% 이상 확인
  - 중요 모듈은 90% 이상 확인
  - 커버리지 리포트 생성
  - _Requirements: 테스트 전략_

---

## Phase 24: 문서화 및 README 작성

- [ ] 24. 프로젝트 README 작성
  - 프로젝트 소개 및 기능 설명
  - 설치 및 실행 방법
  - 환경 변수 설정 가이드
  - 기술 스택 및 아키텍처 요약
  - _Requirements: 전체_

- [ ] 24.1 API 문서 작성
  - 모든 API 엔드포인트 명세
  - Request/Response 예시
  - 오류 코드 설명
  - _Requirements: API 설계_

- [ ] 24.2 배포 가이드 작성
  - 서버 설정 방법
  - 데이터베이스 마이그레이션 절차
  - 환경별 배포 체크리스트
  - _Requirements: CI/CD 전략_

---

**문서 버전:** 1.0
**작성일:** 2025-11-06
**총 작업 수:** 139개 (24개 Epic, 115개 Sub-task)
**예상 개발 기간:** 6-8주 (1인 개발 기준)

---

## 작업 순서 우선순위

### ⭐ P0 (최우선): 핵심 기능
- Phase 1-4: 프로젝트 설정 및 백엔드 기본
- Phase 5: 유틸리티
- Phase 6: IndexedDB
- Phase 9: 미디어 컴포넌트
- Phase 13: 페이지 기본 구현

### 🔥 P1 (높음): 필수 기능
- Phase 7: 커스텀 훅
- Phase 10-11: 편지 및 지도 컴포넌트
- Phase 14-15: API 클라이언트 및 Service Worker
- Phase 16: PWA Manifest

### 💡 P2 (중간): 품질 보증
- Phase 17-18: 통합 및 E2E 테스트
- Phase 19: CI/CD 설정
- Phase 20: 성능 최적화

### 🛡️ P3 (낮음): 개선 및 마무리
- Phase 21: 보안 강화
- Phase 22: 접근성 개선
- Phase 23: 최종 검증
- Phase 24: 문서화

---

**작업 목록이 괜찮아 보이나요?**
