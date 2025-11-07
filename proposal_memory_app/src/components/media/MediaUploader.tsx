/**
 * MediaUploader Component
 * 미디어 업로드 컴포넌트 (드래그 앤 드롭 지원)
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './MediaUploader.module.css';

interface MediaUploaderProps {
  onUploadSuccess?: (mediaId: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
}

export default function MediaUploader({
  onUploadSuccess,
  onUploadError,
  maxFiles = 10
}: MediaUploaderProps) {
  const { upload, isUploading, progress, error, reset } = useMediaUpload();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 파일 선택 다이얼로그 열기
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 파일 입력 변경 핸들러
   */
  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(Array.from(files));
    }
  };

  /**
   * 드래그 오버 핸들러
   */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * 드래그 리브 핸들러
   */
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * 드롭 핸들러
   */
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  /**
   * 파일 업로드 처리
   */
  const handleFiles = async (files: File[]) => {
    // 파일 개수 제한 확인
    if (files.length > maxFiles) {
      const errorMsg = `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`;
      onUploadError?.(errorMsg);
      return;
    }

    // 각 파일 업로드
    for (const file of files) {
      const result = await upload(file);

      if (result.success && result.mediaId) {
        onUploadSuccess?.(result.mediaId);
      } else if (result.error) {
        onUploadError?.(result.error);
      } else if (result.queueId) {
        // 오프라인 큐에 추가됨
        console.log(`파일이 오프라인 큐에 추가되었습니다: ${result.queueId}`);
      }
    }

    // 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isUploading ? styles.uploading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
      >
        {isUploading ? (
          <div className={styles.uploadingState}>
            <LoadingSpinner size="large" />
            <p className={styles.uploadingText}>업로드 중... {progress}%</p>
          </div>
        ) : (
          <div className={styles.idleState}>
            <span className={styles.uploadIcon}>📤</span>
            <p className={styles.mainText}>
              {isDragging ? '파일을 놓아주세요' : '클릭하거나 파일을 드래그하세요'}
            </p>
            <p className={styles.subText}>
              이미지 (JPG, PNG, WebP) 또는 비디오 (MP4, WebM)
            </p>
            <p className={styles.subText}>
              최대 {maxFiles}개 파일
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <span className={styles.errorText}>{error}</span>
          <button
            className={styles.errorClose}
            onClick={reset}
            aria-label="오류 닫기"
          >
            ×
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        multiple
        onChange={handleFileInputChange}
        className={styles.fileInput}
      />
    </div>
  );
}
