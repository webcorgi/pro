/**
 * Multer Configuration Unit Tests
 * 파일 업로드 설정 단위 테스트
 */

// Mock uuid module
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

import { validateFileType, validateFileSize, getUploadDir, getThumbnailDir } from '../multer-config';
import path from 'path';

describe('Multer Configuration', () => {
  describe('validateFileType', () => {
    it('should return "image" for JPEG mimetype', () => {
      expect(validateFileType('image/jpeg')).toBe('image');
    });

    it('should return "image" for PNG mimetype', () => {
      expect(validateFileType('image/png')).toBe('image');
    });

    it('should return "image" for WebP mimetype', () => {
      expect(validateFileType('image/webp')).toBe('image');
    });

    it('should return "video" for MP4 mimetype', () => {
      expect(validateFileType('video/mp4')).toBe('video');
    });

    it('should return "video" for WebM mimetype', () => {
      expect(validateFileType('video/webm')).toBe('video');
    });

    it('should return null for unsupported mimetype', () => {
      expect(validateFileType('application/pdf')).toBeNull();
    });

    it('should return null for invalid mimetype', () => {
      expect(validateFileType('invalid/type')).toBeNull();
    });
  });

  describe('validateFileSize', () => {
    const MB = 1024 * 1024;

    describe('Image files', () => {
      it('should accept images under 10MB', () => {
        expect(validateFileSize(5 * MB, 'image')).toBe(true);
      });

      it('should accept images exactly 10MB', () => {
        expect(validateFileSize(10 * MB, 'image')).toBe(true);
      });

      it('should reject images over 10MB', () => {
        expect(validateFileSize(11 * MB, 'image')).toBe(false);
      });

      it('should accept very small images', () => {
        expect(validateFileSize(1024, 'image')).toBe(true);
      });
    });

    describe('Video files', () => {
      it('should accept videos under 100MB', () => {
        expect(validateFileSize(50 * MB, 'video')).toBe(true);
      });

      it('should accept videos exactly 100MB', () => {
        expect(validateFileSize(100 * MB, 'video')).toBe(true);
      });

      it('should reject videos over 100MB', () => {
        expect(validateFileSize(101 * MB, 'video')).toBe(false);
      });

      it('should accept very small videos', () => {
        expect(validateFileSize(1024, 'video')).toBe(true);
      });
    });
  });

  describe('getUploadDir', () => {
    it('should return uploads directory path', () => {
      const uploadDir = getUploadDir();
      expect(uploadDir).toContain('uploads');
    });

    it('should return consistent path on multiple calls', () => {
      const dir1 = getUploadDir();
      const dir2 = getUploadDir();
      expect(dir1).toBe(dir2);
    });
  });

  describe('getThumbnailDir', () => {
    it('should return thumbnails directory path', () => {
      const thumbnailDir = getThumbnailDir();
      expect(thumbnailDir).toContain('thumbnails');
    });

    it('should be subdirectory of uploads', () => {
      const uploadDir = getUploadDir();
      const thumbnailDir = getThumbnailDir();
      expect(thumbnailDir).toContain('uploads');
    });

    it('should return consistent path on multiple calls', () => {
      const dir1 = getThumbnailDir();
      const dir2 = getThumbnailDir();
      expect(dir1).toBe(dir2);
    });
  });
});
