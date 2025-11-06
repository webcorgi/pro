/**
 * Letter Types
 * 편지 관련 타입 정의
 * Requirements: 4 (프로포즈 편지 작성 및 관리)
 */

/**
 * 편지 인터페이스
 */
export interface Letter {
  id: string;
  title: string;
  content: string;
  isDraft: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 편지 생성 요청
 */
export interface CreateLetterRequest {
  title: string;
  content: string;
  isDraft?: boolean;
}

/**
 * 편지 수정 요청
 */
export interface UpdateLetterRequest {
  title?: string;
  content?: string;
  isDraft?: boolean;
}

/**
 * 편지 목록 필터 옵션
 */
export interface LetterFilterOptions {
  isDraft?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * 편지 자동 저장 상태
 */
export interface AutoSaveState {
  isSaving: boolean;
  lastSaved?: Date;
  error?: string;
}

/**
 * 편지 에디터 모드
 */
export type LetterEditorMode = 'create' | 'edit' | 'view';

/**
 * 편지 통계
 */
export interface LetterStats {
  totalLetters: number;
  draftLetters: number;
  publishedLetters: number;
  totalWords: number;
}
