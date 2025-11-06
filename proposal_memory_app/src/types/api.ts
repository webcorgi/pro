/**
 * API Types
 * API request/response 타입 정의
 * Requirements: 전체 (모든 API 엔드포인트)
 */

import { Media, MediaType, MediaMetadata } from './media';
import { Letter, CreateLetterRequest as LetterCreateRequest, UpdateLetterRequest as LetterUpdateRequest } from './letter';
import { Location, SetLocationRequest as LocationSetRequest, UpdateLocationRequest as LocationUpdateRequest } from './location';

// Re-export to avoid duplication
export type { LetterCreateRequest as CreateLetterRequest, LetterUpdateRequest as UpdateLetterRequest };
export type { LocationSetRequest as SetLocationRequest, LocationUpdateRequest as UpdateLocationRequest };

/**
 * 공통 API 응답
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// Media API
// ============================================

/**
 * 미디어 업로드 요청
 */
export interface UploadMediaRequest {
  file: File;
  type: MediaType;
}

/**
 * 미디어 업로드 응답
 */
export interface UploadMediaResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

/**
 * 미디어 조회 쿼리
 */
export interface GetMediaQuery {
  type?: MediaType;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'name' | 'size';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 미디어 목록 응답
 */
export interface GetMediaResponse {
  media: Media[];
  total: number;
  hasMore: boolean;
}

/**
 * 미디어 삭제 응답
 */
export interface DeleteMediaResponse {
  success: boolean;
  message: string;
}

// ============================================
// Letter API
// ============================================

// CreateLetterRequest와 UpdateLetterRequest는 letter.ts에서 재export

/**
 * 편지 응답
 */
export interface LetterResponse {
  id: string;
  title: string;
  content: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 편지 목록 응답
 */
export interface GetLettersResponse {
  letters: LetterResponse[];
  total: number;
}

/**
 * 편지 삭제 응답
 */
export interface DeleteLetterResponse {
  success: boolean;
}

// ============================================
// Location API
// ============================================

// SetLocationRequest와 UpdateLocationRequest는 location.ts에서 재export

/**
 * 위치 응답
 */
export interface LocationResponse {
  id: string;
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
  setAt: string;
}

/**
 * 위치 조회 응답
 */
export interface GetLocationResponse {
  location: LocationResponse | null;
}

// ============================================
// Main Video API
// ============================================

/**
 * 메인 영상 설정 요청
 */
export interface SetMainVideoRequest {
  mediaId: string;
}

/**
 * 메인 영상 응답
 */
export interface MainVideoResponse {
  id: string;
  mediaId: string;
  setAt: string;
  media?: Media; // populated
}

/**
 * 메인 영상 조회 응답
 */
export interface GetMainVideoResponse {
  mainVideo: MainVideoResponse | null;
}

// ============================================
// 헬스 체크 API
// ============================================

/**
 * 헬스 체크 응답
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
  database: {
    connected: boolean;
  };
}

// ============================================
// 통계 API
// ============================================

/**
 * 통계 응답
 */
export interface StatsResponse {
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
  totalLetters: number;
  totalStorageUsed: number; // bytes
}

// ============================================
// HTTP 메서드별 타입
// ============================================

/**
 * GET 요청 옵션
 */
export interface GetRequestOptions {
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * POST 요청 옵션
 */
export interface PostRequestOptions {
  body?: any;
  headers?: Record<string, string>;
}

/**
 * PUT 요청 옵션
 */
export interface PutRequestOptions {
  body?: any;
  headers?: Record<string, string>;
}

/**
 * DELETE 요청 옵션
 */
export interface DeleteRequestOptions {
  headers?: Record<string, string>;
}

// ============================================
// API 클라이언트 설정
// ============================================

/**
 * API 클라이언트 설정
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}
