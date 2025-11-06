/**
 * Media Types
 * 미디어 관련 타입 정의
 * Requirements: 2 (이미지 및 비디오 업로드), 3 (미디어 갤러리)
 */

/**
 * 미디어 타입
 */
export type MediaType = 'image' | 'video';

/**
 * 미디어 메타데이터
 */
export interface MediaMetadata {
  // 이미지 메타데이터
  width?: number;
  height?: number;

  // 비디오 메타데이터
  duration?: number;
  codec?: string;

  // 공통 메타데이터
  location?: string;
  takenAt?: string;
  device?: string;
  [key: string]: any;
}

/**
 * 미디어 인터페이스
 */
export interface Media {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  metadata?: MediaMetadata;
}

/**
 * 업로드 진행 상태
 */
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

/**
 * 업로드 진행 정보
 */
export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: UploadStatus;
  error?: string;
}

/**
 * 미디어 필터 옵션
 */
export interface MediaFilterOptions {
  type?: MediaType | 'all';
  sortBy?: 'date' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * 미디어 갤러리 레이아웃
 */
export type MediaGalleryLayout = 'grid' | 'masonry' | 'list';

/**
 * 미디어 선택 모드
 */
export interface MediaSelectionMode {
  enabled: boolean;
  selectedIds: string[];
  maxSelection?: number;
}

/**
 * 파일 검증 결과
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * 미디어 업로드 옵션
 */
export interface MediaUploadOptions {
  compress?: boolean;
  quality?: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  generateThumbnail?: boolean;
}
