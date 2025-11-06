/**
 * Thumbnail Generator Unit Tests
 * 썸네일 생성 유틸리티 단위 테스트
 */

import { generateImageThumbnail, generateVideoThumbnail, generateThumbnail, deleteThumbnail } from '../thumbnail';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Mock sharp
jest.mock('sharp');
// Mock fs
jest.mock('fs');

describe('Thumbnail Generator', () => {
  const mockFilePath = '/test/uploads/test-file.jpg';
  const mockOutputName = 'test-file';
  const mockThumbnailPath = expect.stringContaining('thumbnails/test-file.jpg');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImageThumbnail', () => {
    it('should generate thumbnail with correct dimensions', async () => {
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      await generateImageThumbnail(mockFilePath, mockOutputName);

      expect(sharp).toHaveBeenCalledWith(mockFilePath);
      expect(mockSharp.resize).toHaveBeenCalledWith(300, 300, {
        fit: 'cover',
        position: 'center',
      });
      expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(mockSharp.toFile).toHaveBeenCalled();
    });

    it('should return thumbnail path', async () => {
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const result = await generateImageThumbnail(mockFilePath, mockOutputName);

      expect(result).toContain('thumbnails');
      expect(result).toContain('test-file.jpg');
    });

    it('should throw error if thumbnail generation fails', async () => {
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockRejectedValue(new Error('Sharp error')),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      await expect(generateImageThumbnail(mockFilePath, mockOutputName)).rejects.toThrow(
        '썸네일 생성에 실패했습니다.'
      );
    });
  });

  describe('generateVideoThumbnail', () => {
    it('should generate dummy thumbnail for videos', async () => {
      const mockSharp = {
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const result = await generateVideoThumbnail(mockFilePath, mockOutputName);

      expect(sharp).toHaveBeenCalledWith({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 100, g: 100, b: 100 },
        },
      });
      expect(mockSharp.jpeg).toHaveBeenCalled();
      expect(mockSharp.toFile).toHaveBeenCalled();
      expect(result).toContain('thumbnails');
    });

    it('should return thumbnail path', async () => {
      const mockSharp = {
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const result = await generateVideoThumbnail(mockFilePath, mockOutputName);

      expect(result).toContain('thumbnails');
      expect(result).toContain('test-file.jpg');
    });

    it('should throw error if thumbnail generation fails', async () => {
      const mockSharp = {
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockRejectedValue(new Error('Sharp error')),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      await expect(generateVideoThumbnail(mockFilePath, mockOutputName)).rejects.toThrow(
        '썸네일 생성에 실패했습니다.'
      );
    });
  });

  describe('generateThumbnail', () => {
    it('should call generateImageThumbnail for image type', async () => {
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const fileName = 'test-image.jpg';
      const result = await generateThumbnail(mockFilePath, fileName, 'image');

      expect(sharp).toHaveBeenCalledWith(mockFilePath);
      expect(mockSharp.resize).toHaveBeenCalled();
      expect(result).toContain('thumbnails');
    });

    it('should call generateVideoThumbnail for video type', async () => {
      const mockSharp = {
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const fileName = 'test-video.mp4';
      const result = await generateThumbnail(mockFilePath, fileName, 'video');

      expect(sharp).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.any(Object),
        })
      );
      expect(result).toContain('thumbnails');
    });

    it('should extract base name from file name', async () => {
      const mockSharp = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue({}),
      };

      (sharp as unknown as jest.Mock).mockReturnValue(mockSharp);

      const fileName = 'test-image-with-extension.jpg';
      const result = await generateThumbnail(mockFilePath, fileName, 'image');

      expect(result).toContain('test-image-with-extension.jpg');
    });
  });

  describe('deleteThumbnail', () => {
    const mockThumbnailPath = '/test/uploads/thumbnails/test-thumb.jpg';

    it('should delete thumbnail if it exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      deleteThumbnail(mockThumbnailPath);

      expect(fs.existsSync).toHaveBeenCalledWith(mockThumbnailPath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockThumbnailPath);
    });

    it('should not attempt to delete if thumbnail does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      deleteThumbnail(mockThumbnailPath);

      expect(fs.existsSync).toHaveBeenCalledWith(mockThumbnailPath);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Deletion error');
      });

      // Should not throw
      expect(() => deleteThumbnail(mockThumbnailPath)).not.toThrow();
    });
  });
});
