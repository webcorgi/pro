/**
 * Media Validator Unit Tests
 * 미디어 검증 유틸리티 테스트
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import {
  validateFileType,
  validateFileSize,
  detectMediaType,
  validateFile,
  validateFiles,
  validateFileExtension,
} from '../media-validator';
import { ErrorCode } from '@/types/error';

/**
 * Mock File 생성 헬퍼 함수
 */
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  // 큰 파일의 경우 메모리 문제를 피하기 위해 작은 blob을 만들고 size 속성을 덮어씁니다
  const content = size > 1024 * 1024 ? 'x'.repeat(1024) : 'x'.repeat(size);
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });

  // size 속성을 강제로 설정 (테스트 목적)
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });

  return file;
}

describe('Media Validator', () => {
  describe('validateFileType', () => {
    it('should validate supported image types', () => {
      const jpegFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      const pngFile = createMockFile('test.png', 1000, 'image/png');
      const webpFile = createMockFile('test.webp', 1000, 'image/webp');

      expect(validateFileType(jpegFile, 'image').valid).toBe(true);
      expect(validateFileType(pngFile, 'image').valid).toBe(true);
      expect(validateFileType(webpFile, 'image').valid).toBe(true);
    });

    it('should validate supported video types', () => {
      const mp4File = createMockFile('test.mp4', 1000, 'video/mp4');
      const webmFile = createMockFile('test.webm', 1000, 'video/webm');

      expect(validateFileType(mp4File, 'video').valid).toBe(true);
      expect(validateFileType(webmFile, 'video').valid).toBe(true);
    });

    it('should reject unsupported image types', () => {
      const gifFile = createMockFile('test.gif', 1000, 'image/gif');
      const result = validateFileType(gifFile, 'image');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_002);
      expect(result.error).toContain('지원하지 않는');
    });

    it('should reject unsupported video types', () => {
      const aviFile = createMockFile('test.avi', 1000, 'video/avi');
      const result = validateFileType(aviFile, 'video');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_002);
    });
  });

  describe('validateFileSize', () => {
    it('should accept images within size limit (10MB)', () => {
      const smallImage = createMockFile('small.jpg', 5 * 1024 * 1024, 'image/jpeg'); // 5MB
      const result = validateFileSize(smallImage, 'image');

      expect(result.valid).toBe(true);
    });

    it('should reject images exceeding size limit (10MB)', () => {
      const largeImage = createMockFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg'); // 15MB
      const result = validateFileSize(largeImage, 'image');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_001);
      expect(result.error).toContain('파일 크기가 너무 큽니다');
    });

    it('should accept videos within size limit (100MB)', () => {
      const smallVideo = createMockFile('small.mp4', 50 * 1024 * 1024, 'video/mp4'); // 50MB
      const result = validateFileSize(smallVideo, 'video');

      expect(result.valid).toBe(true);
    });

    it('should reject videos exceeding size limit (100MB)', () => {
      const largeVideo = createMockFile('large.mp4', 150 * 1024 * 1024, 'video/mp4'); // 150MB
      const result = validateFileSize(largeVideo, 'video');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_001);
    });

    it('should accept image at exactly 10MB', () => {
      const exactSizeImage = createMockFile('exact.jpg', 10 * 1024 * 1024, 'image/jpeg'); // 10MB
      const result = validateFileSize(exactSizeImage, 'image');

      expect(result.valid).toBe(true);
    });
  });

  describe('detectMediaType', () => {
    it('should detect image type', () => {
      const imageFile = createMockFile('test.jpg', 1000, 'image/jpeg');
      expect(detectMediaType(imageFile)).toBe('image');
    });

    it('should detect video type', () => {
      const videoFile = createMockFile('test.mp4', 1000, 'video/mp4');
      expect(detectMediaType(videoFile)).toBe('video');
    });

    it('should return null for unsupported types', () => {
      const unsupportedFile = createMockFile('test.txt', 1000, 'text/plain');
      expect(detectMediaType(unsupportedFile)).toBeNull();
    });
  });

  describe('validateFile', () => {
    it('should validate valid image file', () => {
      const validImage = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');
      const result = validateFile(validImage);

      expect(result.valid).toBe(true);
    });

    it('should validate valid video file', () => {
      const validVideo = createMockFile('test.mp4', 50 * 1024 * 1024, 'video/mp4');
      const result = validateFile(validVideo);

      expect(result.valid).toBe(true);
    });

    it('should reject file with unsupported type', () => {
      const unsupportedFile = createMockFile('test.txt', 1000, 'text/plain');
      const result = validateFile(unsupportedFile);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_002);
    });

    it('should reject oversized image', () => {
      const oversizedImage = createMockFile('large.jpg', 15 * 1024 * 1024, 'image/jpeg');
      const result = validateFile(oversizedImage);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_001);
    });

    it('should reject oversized video', () => {
      const oversizedVideo = createMockFile('large.mp4', 150 * 1024 * 1024, 'video/mp4');
      const result = validateFile(oversizedVideo);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_001);
    });

    it('should work with explicit mediaType parameter', () => {
      const imageFile = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');
      const result = validateFile(imageFile, 'image');

      expect(result.valid).toBe(true);
    });
  });

  describe('validateFiles', () => {
    it('should validate multiple files', () => {
      const files = [
        createMockFile('test1.jpg', 5 * 1024 * 1024, 'image/jpeg'),
        createMockFile('test2.png', 3 * 1024 * 1024, 'image/png'),
        createMockFile('test3.mp4', 50 * 1024 * 1024, 'video/mp4'),
      ];

      const results = validateFiles(files);

      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(true);
      expect(results[2].valid).toBe(true);
    });

    it('should return validation results for mixed valid and invalid files', () => {
      const files = [
        createMockFile('valid.jpg', 5 * 1024 * 1024, 'image/jpeg'),
        createMockFile('invalid.gif', 1000, 'image/gif'),
        createMockFile('oversized.png', 15 * 1024 * 1024, 'image/png'),
      ];

      const results = validateFiles(files);

      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
      expect(results[2].valid).toBe(false);
    });
  });

  describe('validateFileExtension', () => {
    it('should validate supported image extensions', () => {
      expect(validateFileExtension('test.jpg', 'image').valid).toBe(true);
      expect(validateFileExtension('test.jpeg', 'image').valid).toBe(true);
      expect(validateFileExtension('test.png', 'image').valid).toBe(true);
      expect(validateFileExtension('test.webp', 'image').valid).toBe(true);
    });

    it('should validate supported video extensions', () => {
      expect(validateFileExtension('test.mp4', 'video').valid).toBe(true);
      expect(validateFileExtension('test.webm', 'video').valid).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(validateFileExtension('test.JPG', 'image').valid).toBe(true);
      expect(validateFileExtension('test.MP4', 'video').valid).toBe(true);
    });

    it('should reject unsupported image extensions', () => {
      const result = validateFileExtension('test.gif', 'image');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_002);
    });

    it('should reject unsupported video extensions', () => {
      const result = validateFileExtension('test.avi', 'video');

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe(ErrorCode.VAL_002);
    });
  });
});
