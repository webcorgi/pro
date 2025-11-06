/**
 * useMediaUpload Hook Tests
 * 미디어 업로드 훅 테스트
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import { renderHook, act } from '@testing-library/react';
import { useMediaUpload, useMultipleMediaUpload } from '../useMediaUpload';
import { queueManager } from '@/lib/sw/queue-manager';

// Mock dependencies
jest.mock('../useOnlineStatus');
jest.mock('@/lib/sw/queue-manager');
jest.mock('@/lib/utils/media-validator');
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

import { useOnlineStatus } from '../useOnlineStatus';
import { validateFile } from '@/lib/utils/media-validator';

/**
 * Mock File 생성 헬퍼
 */
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(Math.min(size, 1024))], { type });
  const file = new File([blob], name, { type });

  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });

  return file;
}

describe('useMediaUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOnlineStatus as jest.Mock).mockReturnValue(true);
    (validateFile as jest.Mock).mockReturnValue({ valid: true });
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMediaUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should validate file before upload', async () => {
    const { result } = renderHook(() => useMediaUpload());
    const testFile = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');

    (validateFile as jest.Mock).mockReturnValue({
      valid: false,
      error: '파일 크기 초과',
    });

    let uploadResult;
    await act(async () => {
      uploadResult = await result.current.upload(testFile);
    });

    expect(validateFile).toHaveBeenCalledWith(testFile);
    expect(uploadResult).toEqual({
      success: false,
      error: '파일 크기 초과',
    });
  });

  it('should add file to queue when offline', async () => {
    (useOnlineStatus as jest.Mock).mockReturnValue(false);
    (queueManager.addToQueue as jest.Mock).mockResolvedValue('queue-id-123');

    const { result } = renderHook(() => useMediaUpload());
    const testFile = createMockFile('test.jpg', 5 * 1024 * 1024, 'image/jpeg');

    let uploadResult;
    await act(async () => {
      uploadResult = await result.current.upload(testFile);
    });

    expect(queueManager.addToQueue).toHaveBeenCalledWith(testFile, 'image');
    expect(uploadResult).toEqual({
      success: true,
      queueId: 'queue-id-123',
    });
  });

  it('should detect video type correctly when offline', async () => {
    (useOnlineStatus as jest.Mock).mockReturnValue(false);
    (queueManager.addToQueue as jest.Mock).mockResolvedValue('queue-id-123');

    const { result } = renderHook(() => useMediaUpload());
    const testFile = createMockFile('test.mp4', 50 * 1024 * 1024, 'video/mp4');

    await act(async () => {
      await result.current.upload(testFile);
    });

    expect(queueManager.addToQueue).toHaveBeenCalledWith(testFile, 'video');
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useMediaUpload());

    act(() => {
      result.current.reset();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
  });
});

describe('useMultipleMediaUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOnlineStatus as jest.Mock).mockReturnValue(false);
    (validateFile as jest.Mock).mockReturnValue({ valid: true });
    (queueManager.addToQueue as jest.Mock).mockResolvedValue('queue-id');
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMultipleMediaUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.uploadedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.errors).toEqual([]);
  });

  it('should upload multiple files', async () => {
    const { result } = renderHook(() => useMultipleMediaUpload());

    const files = [
      createMockFile('test1.jpg', 5 * 1024 * 1024, 'image/jpeg'),
      createMockFile('test2.jpg', 3 * 1024 * 1024, 'image/jpeg'),
      createMockFile('test3.mp4', 50 * 1024 * 1024, 'video/mp4'),
    ];

    let results;
    await act(async () => {
      results = await result.current.uploadMultiple(files);
    });

    expect(results).toHaveLength(3);
    expect(result.current.uploadedCount).toBe(3);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.progress).toBe(100);
  });

  it('should track errors for failed uploads', async () => {
    (validateFile as jest.Mock)
      .mockReturnValueOnce({ valid: true })
      .mockReturnValueOnce({ valid: false, error: '파일 크기 초과' })
      .mockReturnValueOnce({ valid: true });

    const { result } = renderHook(() => useMultipleMediaUpload());

    const files = [
      createMockFile('test1.jpg', 5 * 1024 * 1024, 'image/jpeg'),
      createMockFile('large.jpg', 20 * 1024 * 1024, 'image/jpeg'),
      createMockFile('test3.jpg', 3 * 1024 * 1024, 'image/jpeg'),
    ];

    await act(async () => {
      await result.current.uploadMultiple(files);
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.errors[0]).toContain('파일 크기 초과');
  });

  it('should reset state correctly', () => {
    const { result } = renderHook(() => useMultipleMediaUpload());

    act(() => {
      result.current.reset();
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.uploadedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.errors).toEqual([]);
  });
});
