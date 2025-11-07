/**
 * LetterViewer Component
 * 편지 읽기 전용 뷰어
 * Requirements: 4 (편지 작성 및 저장)
 */

'use client';

import { useState } from 'react';
import { Letter } from '@/types/letter';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './LetterViewer.module.css';

interface LetterViewerProps {
  letter: Letter;
  loading?: boolean;
  onEdit?: (letter: Letter) => void;
  onDelete?: (letterId: string) => void;
  onClose?: () => void;
}

export default function LetterViewer({
  letter,
  loading = false,
  onEdit,
  onDelete,
  onClose
}: LetterViewerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /**
   * 날짜 포맷팅
   */
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * 수정 버튼 핸들러
   */
  const handleEdit = () => {
    onEdit?.(letter);
  };

  /**
   * 삭제 버튼 핸들러
   */
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  /**
   * 삭제 확인 핸들러
   */
  const handleConfirmDelete = () => {
    onDelete?.(letter.id);
    setShowDeleteConfirm(false);
  };

  /**
   * 삭제 취소 핸들러
   */
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  /**
   * 닫기 버튼 핸들러
   */
  const handleClose = () => {
    onClose?.();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{letter.title || '제목 없음'}</h1>
          {onClose && (
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="닫기"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.metadata}>
          <span className={styles.date}>
            작성일: {formatDate(letter.createdAt)}
          </span>
          {letter.updatedAt && letter.updatedAt !== letter.createdAt && (
            <span className={styles.date}>
              수정일: {formatDate(letter.updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className={styles.content}>
        <div className={styles.contentText}>
          {letter.content || '내용이 없습니다.'}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        {onEdit && (
          <button
            className={styles.editButton}
            onClick={handleEdit}
          >
            ✏️ 수정
          </button>
        )}
        {onDelete && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
          >
            🗑️ 삭제
          </button>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className={styles.dialogOverlay} onClick={handleCancelDelete}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>편지 삭제</h3>
            <p className={styles.dialogMessage}>
              이 편지를 정말 삭제하시겠습니까?<br />
              삭제된 편지는 복구할 수 없습니다.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancelButton}
                onClick={handleCancelDelete}
              >
                취소
              </button>
              <button
                className={styles.dialogConfirmButton}
                onClick={handleConfirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
