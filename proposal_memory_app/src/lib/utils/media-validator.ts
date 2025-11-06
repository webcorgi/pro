/**
 * Media Validator Utility
 * 미디어 파일 검증 유틸리티
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import { FileValidationResult, MediaType } from '@/types/media';
import { ErrorCode } from '@/types/error';

/**
 * 지원하는 이미지 MIME 타입
 */
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * 지원하는 비디오 MIME 타입
 */
const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
];

/**
 * 파일 크기 제한 (bytes)
 */
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * 파일 타입 검증
 * @param file 검증할 파일
 * @param mediaType 미디어 타입 (image 또는 video)
 * @returns 검증 결과
 */
export function validateFileType(
  file: File,
  mediaType: MediaType
): FileValidationResult {
  const supportedTypes =
    mediaType === 'image' ? SUPPORTED_IMAGE_TYPES : SUPPORTED_VIDEO_TYPES;

  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 ${mediaType === 'image' ? '이미지' : '비디오'} 형식입니다. 지원 형식: ${supportedTypes.join(', ')}`,
      errorCode: ErrorCode.VAL_002,
    };
  }

  return { valid: true };
}

/**
 * 파일 크기 검증
 * @param file 검증할 파일
 * @param mediaType 미디어 타입 (image 또는 video)
 * @returns 검증 결과
 */
export function validateFileSize(
  file: File,
  mediaType: MediaType
): FileValidationResult {
  const maxSize = mediaType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  const maxSizeMB = maxSize / (1024 * 1024);

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 크기: ${maxSizeMB}MB (현재: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      errorCode: ErrorCode.VAL_001,
    };
  }

  return { valid: true };
}

/**
 * 미디어 타입 자동 감지
 * @param file 파일 객체
 * @returns 미디어 타입 또는 null
 */
export function detectMediaType(file: File): MediaType | null {
  if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return 'image';
  }
  if (SUPPORTED_VIDEO_TYPES.includes(file.type)) {
    return 'video';
  }
  return null;
}

/**
 * 통합 파일 검증
 * @param file 검증할 파일
 * @param mediaType 미디어 타입 (optional, 자동 감지 가능)
 * @returns 검증 결과
 */
export function validateFile(
  file: File,
  mediaType?: MediaType
): FileValidationResult {
  // 파일 존재 확인
  if (!file) {
    return {
      valid: false,
      error: '파일이 선택되지 않았습니다.',
      errorCode: ErrorCode.VAL_003,
    };
  }

  // 미디어 타입 자동 감지 또는 검증
  let detectedType = mediaType;
  if (!detectedType) {
    detectedType = detectMediaType(file);
    if (!detectedType) {
      return {
        valid: false,
        error: '지원하지 않는 파일 형식입니다.',
        errorCode: ErrorCode.VAL_002,
      };
    }
  }

  // 파일 타입 검증
  const typeValidation = validateFileType(file, detectedType);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // 파일 크기 검증
  const sizeValidation = validateFileSize(file, detectedType);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * 다중 파일 검증
 * @param files 검증할 파일 배열
 * @returns 검증 결과 배열
 */
export function validateFiles(files: File[]): FileValidationResult[] {
  return files.map((file) => validateFile(file));
}

/**
 * 파일 확장자 검증
 * @param fileName 파일 이름
 * @param mediaType 미디어 타입
 * @returns 검증 결과
 */
export function validateFileExtension(
  fileName: string,
  mediaType: MediaType
): FileValidationResult {
  const supportedExtensions =
    mediaType === 'image'
      ? ['.jpg', '.jpeg', '.png', '.webp']
      : ['.mp4', '.webm'];

  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

  if (!supportedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 확장자입니다. 지원 확장자: ${supportedExtensions.join(', ')}`,
      errorCode: ErrorCode.VAL_002,
    };
  }

  return { valid: true };
}
