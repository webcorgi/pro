# 설계 문서 (Design Document)
# 프로포즈용 추억남기기 웹앱

## 1. Overview (개요)

### 1.1 목적
프로포즈 당일의 소중한 순간들을 기록하고 보존하기 위한 Progressive Web App(PWA)입니다. 사용자는 이미지, 비디오, 편지를 저장하고, 오프라인에서도 접근할 수 있으며, 프로포즈 장소를 지도에서 확인할 수 있습니다.

### 1.2 핵심 목표
- 오프라인 우선(Offline-First) 아키텍처로 네트워크 없이도 사용 가능
- 직관적인 미디어 관리 및 탐색
- 프라이버시 중심 설계로 민감한 추억 보호
- 모바일 최적화된 사용자 경험

### 1.3 기술 스택
- **Frontend:** Next.js 14+, TypeScript, CSS Modules
- **Backend:** Node.js (Express), REST API
- **Database:** MySQL 8.0+
- **PWA:** Service Worker, Web App Manifest
- **지도:** Leaflet.js (오픈소스) 또는 Google Maps API
- **미디어 처리:** Sharp (이미지), FFmpeg.js (비디오 썸네일)
- **저장소:** IndexedDB (클라이언트), File System (서버)

---

## 2. Architecture (아키텍처)

### 2.1 전체 시스템 구조

```mermaid
graph TB
    subgraph "Client Layer"
        UI[Next.js UI Components]
        SW[Service Worker]
        IDB[(IndexedDB)]
        Cache[Cache Storage]
    end

    subgraph "API Layer"
        API[Express REST API]
        Auth[Auth Middleware]
        Upload[Upload Handler]
        Media[Media Processor]
    end

    subgraph "Data Layer"
        MySQL[(MySQL Database)]
        FS[File System Storage]
    end

    subgraph "External Services"
        MapAPI[Map API]
        Geo[Geolocation Service]
    end

    UI --> SW
    UI --> API
    SW --> IDB
    SW --> Cache
    API --> Auth
    API --> Upload
    API --> Media
    Upload --> FS
    Media --> FS
    API --> MySQL
    UI --> MapAPI
    UI --> Geo
```

### 2.2 데이터 흐름

#### 2.2.1 미디어 업로드 흐름
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Next.js UI
    participant SW as Service Worker
    participant API as Express API
    participant FS as File Storage
    participant DB as MySQL

    U->>UI: 파일 선택
    UI->>UI: 파일 검증 (크기, 타입)
    UI->>SW: 업로드 요청

    alt Online
        SW->>API: POST /api/media/upload
        API->>FS: 파일 저장
        API->>DB: 메타데이터 저장
        DB-->>API: 저장 완료
        API-->>SW: 업로드 성공
        SW-->>UI: 업로드 완료
    else Offline
        SW->>SW: 큐에 추가
        SW-->>UI: 대기 중
        Note over SW: 온라인 복귀 시 자동 재시도
    end

    UI->>U: 업로드 결과 표시
```

#### 2.2.2 오프라인 데이터 동기화
```mermaid
sequenceDiagram
    participant SW as Service Worker
    participant IDB as IndexedDB
    participant API as Express API
    participant DB as MySQL

    Note over SW: 온라인 상태 감지
    SW->>IDB: 대기 중인 작업 조회
    IDB-->>SW: 작업 목록 반환

    loop 각 작업
        SW->>API: 작업 실행
        API->>DB: 데이터 저장
        DB-->>API: 저장 완료
        API-->>SW: 성공 응답
        SW->>IDB: 작업 제거
    end

    SW->>SW: 동기화 완료 이벤트
```

### 2.3 PWA 아키텍처

#### 2.3.1 Service Worker 전략
- **App Shell:** 네트워크 우선(Network First), 실패 시 캐시
- **미디어 파일:** 캐시 우선(Cache First), 영구 저장
- **API 요청:** 네트워크 우선(Network First), 오프라인 시 큐잉
- **정적 리소스:** 캐시 우선(Cache First), Stale-While-Revalidate

#### 2.3.2 캐싱 전략
```typescript
// 캐시 네이밍 규칙
const CACHE_NAMES = {
  APP_SHELL: 'app-shell-v1',
  MEDIA: 'media-v1',
  API: 'api-v1',
  STATIC: 'static-v1',
  MAP_TILES: 'map-tiles-v1'
};
```

---

## 3. Components and Interfaces (구성요소 및 인터페이스)

### 3.1 프론트엔드 컴포넌트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── page.tsx              # 메인 화면 (지도 + 요약)
│   │   ├── gallery/              # 갤러리 페이지
│   │   ├── letters/              # 편지 목록/작성
│   │   └── settings/             # 설정
│   ├── api/                      # API Routes (선택적)
│   └── layout.tsx                # 루트 레이아웃
├── components/
│   ├── media/
│   │   ├── MediaUploader.tsx     # 파일 업로드 UI
│   │   ├── MediaGallery.tsx      # 그리드 갤러리
│   │   ├── ImageViewer.tsx       # 전체화면 이미지 뷰어
│   │   └── VideoPlayer.tsx       # 커스텀 비디오 플레이어
│   ├── letters/
│   │   ├── LetterEditor.tsx      # 편지 에디터
│   │   ├── LetterList.tsx        # 편지 목록
│   │   └── LetterViewer.tsx      # 편지 읽기 모드
│   ├── map/
│   │   ├── MapView.tsx           # 지도 컴포넌트
│   │   ├── LocationMarker.tsx    # 위치 마커
│   │   └── LocationPicker.tsx    # 위치 선택 UI
│   ├── common/
│   │   ├── Header.tsx            # 앱 헤더
│   │   ├── BottomNav.tsx         # 하단 네비게이션
│   │   ├── LoadingSpinner.tsx    # 로딩 인디케이터
│   │   └── OfflineIndicator.tsx  # 오프라인 표시
│   └── pwa/
│       ├── InstallPrompt.tsx     # PWA 설치 프롬프트
│       └── UpdateNotification.tsx # 업데이트 알림
├── lib/
│   ├── api/
│   │   ├── media.ts              # 미디어 API 클라이언트
│   │   ├── letters.ts            # 편지 API 클라이언트
│   │   └── location.ts           # 위치 API 클라이언트
│   ├── db/
│   │   └── indexedDB.ts          # IndexedDB 래퍼
│   ├── sw/
│   │   ├── registration.ts       # SW 등록
│   │   └── sync.ts               # 백그라운드 동기화
│   └── utils/
│       ├── media-validator.ts    # 파일 검증
│       ├── compression.ts        # 이미지 압축
│       └── thumbnail.ts          # 썸네일 생성
├── hooks/
│   ├── useOnlineStatus.ts        # 온라인 상태 감지
│   ├── useMediaUpload.ts         # 미디어 업로드 로직
│   ├── useIndexedDB.ts           # IndexedDB 훅
│   └── useGeolocation.ts         # 위치 정보 훅
└── types/
    ├── media.ts                  # 미디어 타입
    ├── letter.ts                 # 편지 타입
    └── location.ts               # 위치 타입
```

### 3.2 주요 컴포넌트 인터페이스

#### 3.2.1 MediaUploader 컴포넌트
```typescript
interface MediaUploaderProps {
  acceptedTypes: 'image' | 'video' | 'both';
  maxSize?: number;
  onUploadStart?: (files: File[]) => void;
  onUploadComplete?: (mediaIds: string[]) => void;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
```

#### 3.2.2 MediaGallery 컴포넌트
```typescript
interface MediaGalleryProps {
  mediaType?: 'all' | 'image' | 'video';
  layout?: 'grid' | 'masonry';
  sortBy?: 'date' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  onMediaSelect?: (media: Media) => void;
  enableSelection?: boolean;
}

interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  metadata?: MediaMetadata;
}
```

#### 3.2.3 LetterEditor 컴포넌트
```typescript
interface LetterEditorProps {
  letterId?: string; // undefined이면 새 편지
  initialContent?: string;
  onSave?: (letter: Letter) => void;
  autoSaveInterval?: number; // ms, 기본 30000
}

interface Letter {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDraft: boolean;
}
```

#### 3.2.4 MapView 컴포넌트
```typescript
interface MapViewProps {
  location: Location;
  zoom?: number;
  editable?: boolean;
  onLocationChange?: (location: Location) => void;
  showOfflineWarning?: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
  setAt?: Date;
}
```

### 3.3 백엔드 API 엔드포인트

#### 3.3.1 미디어 API
```typescript
// POST /api/media/upload
interface UploadRequest {
  file: File; // multipart/form-data
  type: 'image' | 'video';
}

interface UploadResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

// GET /api/media
interface GetMediaQuery {
  type?: 'image' | 'video';
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'name';
}

interface GetMediaResponse {
  media: Media[];
  total: number;
  hasMore: boolean;
}

// DELETE /api/media/:id
interface DeleteMediaResponse {
  success: boolean;
  message: string;
}
```

#### 3.3.2 편지 API
```typescript
// POST /api/letters
interface CreateLetterRequest {
  title: string;
  content: string;
  isDraft: boolean;
}

interface LetterResponse {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
}

// PUT /api/letters/:id
interface UpdateLetterRequest {
  title?: string;
  content?: string;
  isDraft?: boolean;
}

// GET /api/letters
interface GetLettersResponse {
  letters: LetterResponse[];
  total: number;
}

// DELETE /api/letters/:id
interface DeleteLetterResponse {
  success: boolean;
}
```

#### 3.3.3 위치 API
```typescript
// POST /api/location
interface SetLocationRequest {
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
}

interface LocationResponse {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
  setAt: string;
}

// GET /api/location
interface GetLocationResponse {
  location: LocationResponse | null;
}

// PUT /api/location/:id
interface UpdateLocationRequest {
  latitude?: number;
  longitude?: number;
  placeName?: string;
  memo?: string;
}
```

#### 3.3.4 메인 영상 API
```typescript
// POST /api/main-video
interface SetMainVideoRequest {
  mediaId: string;
}

interface MainVideoResponse {
  id: string;
  mediaId: string;
  setAt: string;
}

// GET /api/main-video
interface GetMainVideoResponse {
  mainVideo: MainVideoResponse | null;
  media?: Media; // populated
}
```

---

## 4. Data Models (데이터 모델)

### 4.1 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    MEDIA {
        VARCHAR(36) id PK
        ENUM type
        VARCHAR(255) file_name
        VARCHAR(255) file_path
        VARCHAR(255) thumbnail_path
        INT file_size
        VARCHAR(50) mime_type
        TIMESTAMP uploaded_at
        JSON metadata
    }

    LETTER {
        VARCHAR(36) id PK
        VARCHAR(255) title
        TEXT content
        BOOLEAN is_draft
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    LOCATION {
        VARCHAR(36) id PK
        DECIMAL(10,8) latitude
        DECIMAL(11,8) longitude
        VARCHAR(255) place_name
        TEXT memo
        TIMESTAMP set_at
    }

    MAIN_VIDEO {
        VARCHAR(36) id PK
        VARCHAR(36) media_id FK
        TIMESTAMP set_at
    }

    UPLOAD_QUEUE {
        VARCHAR(36) id PK
        VARCHAR(255) file_name
        BLOB file_data
        ENUM type
        ENUM status
        INT retry_count
        TIMESTAMP created_at
        TEXT error_message
    }

    MAIN_VIDEO ||--|| MEDIA : references
```

### 4.2 MySQL 스키마

#### 4.2.1 media 테이블
```sql
CREATE TABLE media (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('image', 'video') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    file_size INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    INDEX idx_type (type),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.2.2 letters 테이블
```sql
CREATE TABLE letters (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_draft BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_is_draft (is_draft)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.2.3 location 테이블
```sql
CREATE TABLE location (
    id VARCHAR(36) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    place_name VARCHAR(255),
    memo TEXT,
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.2.4 main_video 테이블
```sql
CREATE TABLE main_video (
    id VARCHAR(36) PRIMARY KEY,
    media_id VARCHAR(36) NOT NULL,
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 4.2.5 upload_queue 테이블 (오프라인 지원)
```sql
CREATE TABLE upload_queue (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_data LONGBLOB NOT NULL,
    type ENUM('image', 'video') NOT NULL,
    status ENUM('pending', 'processing', 'failed') DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4.3 IndexedDB 스키마 (클라이언트)

```typescript
// IndexedDB 데이터베이스 이름: 'ProposalMemoryDB'
// 버전: 1

interface IDBSchema {
  // Object Store: cachedMedia
  cachedMedia: {
    key: string; // media.id
    value: {
      id: string;
      type: 'image' | 'video';
      blob: Blob;
      thumbnailBlob?: Blob;
      metadata: Media;
      cachedAt: number; // timestamp
    };
    indexes: {
      type: string;
      cachedAt: number;
    };
  };

  // Object Store: pendingUploads
  pendingUploads: {
    key: string; // unique id
    value: {
      id: string;
      file: File;
      type: 'image' | 'video';
      status: 'pending' | 'uploading' | 'failed';
      retryCount: number;
      createdAt: number;
      error?: string;
    };
    indexes: {
      status: string;
      createdAt: number;
    };
  };

  // Object Store: drafts
  drafts: {
    key: string; // letter.id or 'auto-save'
    value: {
      id: string;
      title: string;
      content: string;
      savedAt: number;
    };
  };

  // Object Store: settings
  settings: {
    key: string; // setting name
    value: any;
  };
}
```

---

## 5. Error Handling (오류 처리)

### 5.1 오류 분류 체계

```typescript
enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

interface AppError {
  code: string;
  category: ErrorCategory;
  message: string;
  userMessage: string; // 사용자에게 표시할 메시지
  details?: any;
  timestamp: number;
}
```

### 5.2 오류 코드 정의

#### 5.2.1 네트워크 오류
- `NET_001`: 네트워크 연결 없음
- `NET_002`: 요청 타임아웃
- `NET_003`: 서버 연결 실패

#### 5.2.2 검증 오류
- `VAL_001`: 파일 크기 초과 (이미지 > 10MB, 비디오 > 100MB)
- `VAL_002`: 지원하지 않는 파일 형식
- `VAL_003`: 필수 필드 누락
- `VAL_004`: 유효하지 않은 좌표 값

#### 5.2.3 저장소 오류
- `STO_001`: 저장 공간 부족
- `STO_002`: IndexedDB 접근 실패
- `STO_003`: 파일 시스템 오류

#### 5.2.4 권한 오류
- `PER_001`: 카메라 접근 권한 거부
- `PER_002`: 갤러리 접근 권한 거부
- `PER_003`: 위치 정보 접근 권한 거부

#### 5.2.5 서버 오류
- `SRV_001`: 내부 서버 오류 (500)
- `SRV_002`: 잘못된 요청 (400)
- `SRV_003`: 리소스 없음 (404)

### 5.3 오류 처리 전략

#### 5.3.1 프론트엔드 오류 처리
```typescript
// lib/error-handler.ts
class ErrorHandler {
  static handle(error: Error | AppError): void {
    const appError = this.normalize(error);

    // 로그 기록
    this.log(appError);

    // 사용자 알림
    this.notify(appError);

    // 복구 전략 실행
    this.recover(appError);
  }

  static normalize(error: Error | AppError): AppError {
    if (error instanceof AppError) return error;

    // Error를 AppError로 변환
    return {
      code: 'UNKNOWN',
      category: ErrorCategory.UNKNOWN,
      message: error.message,
      userMessage: '예기치 않은 오류가 발생했습니다.',
      timestamp: Date.now()
    };
  }

  static recover(error: AppError): void {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        // 오프라인 큐에 추가
        queueManager.add(error.details);
        break;
      case ErrorCategory.STORAGE:
        // 캐시 정리
        cacheManager.cleanup();
        break;
      // ... 기타 복구 전략
    }
  }
}
```

#### 5.3.2 백엔드 오류 처리
```typescript
// server/middleware/error-handler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      code: 'VAL_003',
      message: err.message,
      errors: err.errors
    });
  }

  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        code: 'VAL_001',
        message: '파일 크기가 너무 큽니다.'
      });
    }
  }

  // 기본 서버 오류
  res.status(500).json({
    code: 'SRV_001',
    message: '서버 오류가 발생했습니다.'
  });
};
```

### 5.4 재시도 로직

```typescript
// lib/retry.ts
interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // ms
  maxDelay: number; // ms
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelay;

  for (let i = 0; i <= config.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === config.maxRetries) break;

      await sleep(delay);
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);
    }
  }

  throw lastError!;
}
```

---

## 6. Testing Strategy (테스트 전략)

### 6.1 테스트 피라미드

```
        /\
       /  \
      / E2E \
     /--------\
    /          \
   / Integration \
  /----------------\
 /                  \
/   Unit Tests       \
----------------------
```

### 6.2 단위 테스트 (Unit Tests)

#### 6.2.1 테스트 도구
- **Framework:** Jest
- **React Testing:** React Testing Library
- **Mocking:** Jest mock functions
- **Coverage Target:** 80% 이상

#### 6.2.2 테스트 대상
```typescript
// __tests__/utils/media-validator.test.ts
describe('MediaValidator', () => {
  describe('validateFileSize', () => {
    it('이미지 파일이 10MB 이하면 통과', () => {
      const file = createMockFile('image.jpg', 10 * 1024 * 1024);
      expect(validateFileSize(file, 'image')).toBe(true);
    });

    it('이미지 파일이 10MB 초과면 실패', () => {
      const file = createMockFile('image.jpg', 11 * 1024 * 1024);
      expect(() => validateFileSize(file, 'image')).toThrow('VAL_001');
    });
  });

  describe('validateFileType', () => {
    it('JPEG, PNG, WebP 이미지는 허용', () => {
      expect(validateFileType('image/jpeg', 'image')).toBe(true);
      expect(validateFileType('image/png', 'image')).toBe(true);
      expect(validateFileType('image/webp', 'image')).toBe(true);
    });

    it('지원하지 않는 형식은 거부', () => {
      expect(() => validateFileType('image/gif', 'image')).toThrow('VAL_002');
    });
  });
});

// __tests__/hooks/useMediaUpload.test.ts
describe('useMediaUpload', () => {
  it('파일 업로드 성공 시 onUploadComplete 호출', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useMediaUpload({ onUploadComplete: onComplete }));

    const file = createMockFile('test.jpg', 1024);
    await act(async () => {
      await result.current.upload([file]);
    });

    expect(onComplete).toHaveBeenCalledWith(['mock-id']);
  });

  it('네트워크 오류 시 pendingUploads에 추가', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMediaUpload());
    const file = createMockFile('test.jpg', 1024);

    await act(async () => {
      await result.current.upload([file]);
    });

    const pending = await indexedDB.get('pendingUploads');
    expect(pending).toHaveLength(1);
  });
});
```

### 6.3 통합 테스트 (Integration Tests)

#### 6.3.1 테스트 도구
- **Framework:** Jest
- **API Testing:** Supertest
- **Database:** Test MySQL container (Docker)

#### 6.3.2 테스트 시나리오
```typescript
// __tests__/integration/media-upload.test.ts
describe('Media Upload Flow', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('이미지 업로드 전체 플로우', async () => {
    const file = fs.readFileSync('fixtures/test-image.jpg');

    const response = await request(app)
      .post('/api/media/upload')
      .attach('file', file, 'test-image.jpg')
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('url');
    expect(response.body).toHaveProperty('thumbnailUrl');

    // 데이터베이스 확인
    const media = await db.query('SELECT * FROM media WHERE id = ?', [response.body.id]);
    expect(media).toHaveLength(1);

    // 파일 시스템 확인
    const filePath = path.join(UPLOAD_DIR, response.body.id);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('비디오 업로드 시 썸네일 자동 생성', async () => {
    const file = fs.readFileSync('fixtures/test-video.mp4');

    const response = await request(app)
      .post('/api/media/upload')
      .attach('file', file, 'test-video.mp4')
      .expect(200);

    expect(response.body.thumbnailUrl).toBeDefined();

    const thumbnailPath = path.join(THUMBNAIL_DIR, `${response.body.id}.jpg`);
    expect(fs.existsSync(thumbnailPath)).toBe(true);
  });
});
```

### 6.4 E2E 테스트 (End-to-End Tests)

#### 6.4.1 테스트 도구
- **Framework:** Playwright
- **환경:** Chromium, Firefox, WebKit

#### 6.4.2 테스트 시나리오
```typescript
// e2e/media-upload.spec.ts
import { test, expect } from '@playwright/test';

test.describe('미디어 업로드 E2E', () => {
  test('사용자가 이미지를 업로드하고 갤러리에서 확인', async ({ page }) => {
    await page.goto('/');

    // 업로드 버튼 클릭
    await page.click('[data-testid="upload-button"]');

    // 파일 선택
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('fixtures/test-image.jpg');

    // 업로드 진행 확인
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

    // 업로드 완료 대기
    await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
      timeout: 10000
    });

    // 갤러리로 이동
    await page.click('[data-testid="nav-gallery"]');

    // 업로드된 이미지 확인
    const image = page.locator('[data-testid="gallery-item"]').first();
    await expect(image).toBeVisible();

    // 이미지 클릭하여 전체화면 뷰어 열기
    await image.click();
    await expect(page.locator('[data-testid="image-viewer"]')).toBeVisible();
  });

  test('오프라인 상태에서 업로드 시도 시 큐에 추가', async ({ page, context }) => {
    await page.goto('/');

    // 오프라인 모드 설정
    await context.setOffline(true);

    // 파일 업로드 시도
    await page.click('[data-testid="upload-button"]');
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('fixtures/test-image.jpg');

    // 대기 중 메시지 확인
    await expect(page.locator('[data-testid="offline-queue-message"]')).toBeVisible();

    // 온라인 복귀
    await context.setOffline(false);

    // 자동 업로드 완료 대기
    await expect(page.locator('[data-testid="upload-complete"]')).toBeVisible({
      timeout: 15000
    });
  });
});
```

### 6.5 PWA 테스트

#### 6.5.1 Service Worker 테스트
```typescript
// __tests__/sw/caching.test.ts
describe('Service Worker Caching', () => {
  it('정적 리소스를 캐시에 저장', async () => {
    const cache = await caches.open('static-v1');

    await cache.add('/styles/main.css');

    const response = await cache.match('/styles/main.css');
    expect(response).toBeDefined();
  });

  it('오프라인에서 캐시된 리소스 반환', async () => {
    // Service Worker 등록
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 리소스 캐싱
    const response1 = await fetch('/api/media');
    expect(response1.ok).toBe(true);

    // 오프라인 모드
    mockFetch.mockRejectedValue(new Error('Network error'));

    // 캐시된 응답 확인
    const response2 = await fetch('/api/media');
    expect(response2.ok).toBe(true);
  });
});
```

#### 6.5.2 설치 가능성 테스트
```typescript
// e2e/pwa-install.spec.ts
test('PWA 설치 프롬프트 표시', async ({ page }) => {
  await page.goto('/');

  // beforeinstallprompt 이벤트 트리거
  await page.evaluate(() => {
    window.dispatchEvent(new Event('beforeinstallprompt'));
  });

  // 설치 프롬프트 확인
  await expect(page.locator('[data-testid="install-prompt"]')).toBeVisible();

  // 설치 버튼 클릭
  await page.click('[data-testid="install-button"]');

  // 설치 다이얼로그 확인 (브라우저 네이티브)
  // 실제 설치는 수동 테스트 필요
});
```

### 6.6 테스트 커버리지 목표

| 레이어 | 커버리지 목표 |
|--------|--------------|
| 유틸리티 함수 | 90% |
| 커스텀 훅 | 85% |
| 컴포넌트 | 80% |
| API 엔드포인트 | 90% |
| Service Worker | 75% |
| **전체** | **80%** |

---

## 7. CI/CD Integration Strategy (CI/CD 통합 전략)

### 7.1 CI/CD 파이프라인 개요

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C{Branch?}
    C -->|main| D[Production Pipeline]
    C -->|develop| E[Staging Pipeline]
    C -->|feature/*| F[Dev Pipeline]

    D --> G[Lint & Test]
    G --> H[Build]
    H --> I[Security Scan]
    I --> J[Deploy to Production]
    J --> K[E2E Tests]

    E --> L[Lint & Test]
    L --> M[Build]
    M --> N[Deploy to Staging]
    N --> O[E2E Tests]

    F --> P[Lint & Test]
    P --> Q[Build]
```

### 7.2 GitHub Actions 워크플로우

#### 7.2.1 기본 CI 워크플로우
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop, 'feature/**']
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/test_db

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next
```

#### 7.2.2 Production 배포 워크플로우
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [lint, test, build]
    steps:
      - uses: actions/checkout@v3

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build
          path: .next

      - name: Deploy to Vercel (or other platform)
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          BASE_URL: ${{ secrets.PRODUCTION_URL }}

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.3 배포 전략

#### 7.3.1 환경 구성
- **Development:** 로컬 개발 환경
- **Staging:** 테스트 환경 (develop 브랜치)
- **Production:** 프로덕션 환경 (main 브랜치)

#### 7.3.2 배포 체크리스트
- [ ] 모든 테스트 통과 (Unit, Integration, E2E)
- [ ] 코드 커버리지 80% 이상
- [ ] Lighthouse 점수 (Performance 90+, PWA 100)
- [ ] 보안 스캔 통과
- [ ] Service Worker 캐시 버전 업데이트
- [ ] 데이터베이스 마이그레이션 완료

### 7.4 모니터링 및 롤백

#### 7.4.1 모니터링 도구
- **Application:** Sentry (에러 추적)
- **Performance:** Google Analytics, Web Vitals
- **Uptime:** UptimeRobot
- **Logs:** CloudWatch (AWS) 또는 Vercel Logs

#### 7.4.2 롤백 전략
```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      deployment_id:
        description: 'Deployment ID to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback deployment
        run: |
          vercel rollback ${{ github.event.inputs.deployment_id }} --token ${{ secrets.VERCEL_TOKEN }}

      - name: Notify rollback
        uses: 8398a7/action-slack@v3
        with:
          status: 'Rolled back to ${{ github.event.inputs.deployment_id }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 7.5 환경 변수 관리

```bash
# .env.example
# Database
DATABASE_URL=mysql://user:password@localhost:3306/proposal_memory

# File Storage
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE_IMAGE=10485760  # 10MB
MAX_FILE_SIZE_VIDEO=104857600 # 100MB

# Map API
MAP_API_KEY=your_api_key_here
MAP_PROVIDER=leaflet  # or google

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your_secret_key

# PWA
PUBLIC_URL=https://yourdomain.com
SERVICE_WORKER_VERSION=v1

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### 7.6 성능 모니터링

```typescript
// lib/monitoring/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: Metric) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_delta: metric.delta
    });
  }

  // Sentry Performance
  if (typeof Sentry !== 'undefined') {
    Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: 'info',
      extra: {
        value: metric.value,
        delta: metric.delta
      }
    });
  }
}
```

---

## 8. 보안 고려사항

### 8.1 데이터 보안
- HTTPS 강제 적용
- 파일 업로드 시 MIME 타입 검증
- SQL Injection 방지 (Prepared Statements)
- XSS 방지 (Content Security Policy)

### 8.2 프라이버시
- 사용자 동의 없이 위치 정보 수집 금지
- 개인정보 처리방침 제공
- 데이터 삭제 기능 제공

### 8.3 인증 (추후 확장)
현재 버전은 단일 사용자용이지만, 향후 다중 사용자 지원 시:
- JWT 기반 인증
- bcrypt 비밀번호 해싱
- Rate Limiting

---

## 9. 성능 최적화

### 9.1 프론트엔드 최적화
- 이미지 Lazy Loading
- 비디오 Streaming
- Code Splitting (Next.js 자동)
- CSS Modules로 스타일 격리

### 9.2 백엔드 최적화
- 데이터베이스 인덱싱
- 이미지 리사이징 (Sharp)
- CDN 활용 (선택적)
- 응답 캐싱 (Redis, 선택적)

### 9.3 PWA 최적화
- App Shell 캐싱
- 미디어 파일 점진적 로딩
- Service Worker 버전 관리

---

## 10. 향후 확장 가능성

### 10.1 Phase 2 기능 (추후)
- 다중 사용자 지원
- 소셜 공유 기능
- 클라우드 백업 (Google Drive, Dropbox)
- 다국어 지원

### 10.2 기술 부채 관리
- 정기적인 의존성 업데이트
- 코드 리팩토링 (기술 부채 20% 이하 유지)
- 성능 모니터링 및 개선

---

## 11. 설계 결정 사항 (Design Decisions)

### 11.1 왜 Leaflet.js를 선택했는가?
- **장점:** 오픈소스, 무료, 가벼움, 오프라인 타일 캐싱 용이
- **대안:** Google Maps (유료), Mapbox (일부 유료)
- **결정:** 개인용 앱이므로 무료 오픈소스 우선

### 11.2 왜 MySQL인가?
- **장점:** 관계형 데이터 적합, 성숙한 생태계, 호스팅 쉬움
- **대안:** PostgreSQL (더 고급 기능), MongoDB (문서 기반)
- **결정:** 단순한 스키마이므로 MySQL로 충분

### 11.3 왜 IndexedDB인가?
- **장점:** 대용량 Blob 저장 가능, 비동기, 오프라인 지원
- **대안:** LocalStorage (5MB 제한)
- **결정:** 미디어 파일 캐싱에 필수

---

**문서 버전:** 1.0
**작성일:** 2025-11-06
**검토자:** AI Assistant
**상태:** 초안 (검토 대기 중)

---

## 승인 절차

이 설계가 괜찮아 보이나요? 괜찮다면 구현 계획 단계로 넘어가겠습니다.
