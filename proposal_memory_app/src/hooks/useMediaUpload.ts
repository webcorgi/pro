/**
 * useMediaUpload Hook
 * 미디어 업로드 훅
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import { useState, useCallback } from 'react';
import { validateFile } from '@/lib/utils/media-validator';
import { queueManager } from '@/lib/sw/queue-manager';
import { useOnlineStatus } from './useOnlineStatus';
import { MediaType, UploadProgress, UploadStatus } from '@/types/media';

/**
 * 업로드 결과
 */
export interface UploadResult {
  success: boolean;
  mediaId?: string;
  error?: string;
  queueId?: string; // 오프라인 큐에 추가된 경우
}

/**
 * 업로드 훅 반환 타입
 */
export interface UseMediaUploadReturn {
  upload: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

/**
 * 미디어 업로드 훅
 * 온라인 시 API 호출, 오프라인 시 큐에 추가
 * @returns 업로드 함수 및 상태
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const isOnline = useOnlineStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * 파일 업로드
   * @param file 업로드할 파일
   * @returns 업로드 결과
   */
  const upload = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // 파일 검증
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // 온라인 상태 확인
        if (isOnline) {
          // 온라인: 직접 업로드
          return await uploadOnline(file, setProgress);
        } else {
          // 오프라인: 큐에 추가
          return await uploadOffline(file);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '업로드 실패';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsUploading(false);
      }
    },
    [isOnline]
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}

/**
 * 온라인 업로드 (API 직접 호출)
 * @param file 업로드할 파일
 * @param onProgress 진행 상태 콜백
 * @returns 업로드 결과
 */
async function uploadOnline(
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 진행 상태 추적
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    });

    // 업로드 완료
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            mediaId: response.id,
          });
        } catch (error) {
          reject(new Error('응답 파싱 실패'));
        }
      } else {
        reject(new Error(`업로드 실패: ${xhr.status}`));
      }
    });

    // 오류 처리
    xhr.addEventListener('error', () => {
      reject(new Error('네트워크 오류'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('업로드 취소됨'));
    });

    // 요청 전송
    xhr.open('POST', '/api/media/upload');
    xhr.send(formData);
  });
}

/**
 * 오프라인 업로드 (큐에 추가)
 * @param file 업로드할 파일
 * @returns 업로드 결과
 */
async function uploadOffline(file: File): Promise<UploadResult> {
  // 미디어 타입 감지
  const type: MediaType = file.type.startsWith('image/') ? 'image' : 'video';

  // 큐에 추가
  const queueId = await queueManager.addToQueue(file, type);

  return {
    success: true,
    queueId,
  };
}

/**
 * 다중 파일 업로드 훅
 * @returns 업로드 함수 및 상태
 */
export interface UseMultipleMediaUploadReturn {
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number; // 전체 진행률
  uploadedCount: number;
  totalCount: number;
  errors: string[];
  reset: () => void;
}

export function useMultipleMediaUpload(): UseMultipleMediaUploadReturn {
  const isOnline = useOnlineStatus();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * 다중 파일 업로드
   * @param files 업로드할 파일 배열
   * @returns 업로드 결과 배열
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      setIsUploading(true);
      setProgress(0);
      setUploadedCount(0);
      setTotalCount(files.length);
      setErrors([]);

      const results: UploadResult[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          // 파일 검증
          const validation = validateFile(files[i]);
          if (!validation.valid) {
            throw new Error(validation.error);
          }

          // 업로드
          let result: UploadResult;
          if (isOnline) {
            result = await uploadOnline(files[i], () => {
              // 개별 파일 진행률은 무시하고 전체 진행률만 계산
            });
          } else {
            result = await uploadOffline(files[i]);
          }

          results.push(result);
          setUploadedCount(i + 1);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : '업로드 실패';
          setErrors((prev) => [...prev, `${files[i].name}: ${errorMessage}`]);
          results.push({
            success: false,
            error: errorMessage,
          });
        }
      }

      setIsUploading(false);
      return results;
    },
    [isOnline]
  );

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setUploadedCount(0);
    setTotalCount(0);
    setErrors([]);
  }, []);

  return {
    uploadMultiple,
    isUploading,
    progress,
    uploadedCount,
    totalCount,
    errors,
    reset,
  };
}
