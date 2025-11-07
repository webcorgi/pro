/**
 * LetterList Component
 * 저장된 편지 목록 표시
 * Requirements: 4 (편지 작성 및 저장)
 */

'use client';

import { useState, useEffect } from 'react';
import { Letter } from '@/types/letter';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './LetterList.module.css';

interface LetterListProps {
  letters: Letter[];
  loading?: boolean;
  onLetterClick?: (letter: Letter) => void;
  onNewLetter?: () => void;
}

export default function LetterList({
  letters,
  loading = false,
  onLetterClick,
  onNewLetter
}: LetterListProps) {
  const [sortedLetters, setSortedLetters] = useState<Letter[]>([]);

  /**
   * 편지를 최신순으로 정렬
   */
  useEffect(() => {
    const sorted = [...letters].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    setSortedLetters(sorted);
  }, [letters]);

  /**
   * 날짜 포맷팅
   */
  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

    // 1분 미만
    if (diff < 60) return '방금 전';

    // 1시간 미만
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;

    // 오늘
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // 이번 년도
    if (d.getFullYear() === now.getFullYear()) {
      return d.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      });
    }

    // 다른 년도
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * 편지 미리보기 텍스트 생성
   */
  const getPreview = (content: string): string => {
    if (!content) return '내용 없음';

    // 개행 제거 및 공백 정리
    const cleaned = content.replace(/\n/g, ' ').trim();

    // 최대 100자
    if (cleaned.length <= 100) return cleaned;
    return cleaned.substring(0, 100) + '...';
  };

  /**
   * 편지 클릭 핸들러
   */
  const handleLetterClick = (letter: Letter) => {
    onLetterClick?.(letter);
  };

  /**
   * 새 편지 작성 핸들러
   */
  const handleNewLetter = () => {
    onNewLetter?.();
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
        <h2 className={styles.title}>편지 목록</h2>
        <button
          className={styles.newButton}
          onClick={handleNewLetter}
          aria-label="새 편지 작성"
        >
          + 새 편지
        </button>
      </div>

      {/* 편지 목록 */}
      {sortedLetters.length === 0 ? (
        <div className={styles.emptyContainer}>
          <span className={styles.emptyIcon}>💌</span>
          <p className={styles.emptyText}>작성된 편지가 없습니다</p>
          <p className={styles.emptySubText}>첫 편지를 작성해보세요</p>
          <button
            className={styles.emptyButton}
            onClick={handleNewLetter}
          >
            편지 작성하기
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {sortedLetters.map((letter) => (
            <div
              key={letter.id}
              className={styles.letterItem}
              onClick={() => handleLetterClick(letter)}
            >
              <div className={styles.letterHeader}>
                <h3 className={styles.letterTitle}>
                  {letter.title || '제목 없음'}
                </h3>
                <span className={styles.letterDate}>
                  {formatDate(letter.updatedAt || letter.createdAt)}
                </span>
              </div>
              <p className={styles.letterPreview}>
                {getPreview(letter.content)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
