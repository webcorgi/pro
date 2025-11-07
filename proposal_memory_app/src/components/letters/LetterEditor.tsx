/**
 * LetterEditor Component
 * 편지 작성 및 수정 에디터
 * Requirements: 4 (편지 작성 및 저장)
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { Letter } from '@/types/letter';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './LetterEditor.module.css';

interface LetterEditorProps {
  letterId?: string;
  onSave?: (letter: Letter) => void;
  onCancel?: () => void;
}

const AUTO_SAVE_DELAY = 2000; // 2초

export default function LetterEditor({
  letterId,
  onSave,
  onCancel
}: LetterEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(!!letterId);

  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const { add, update, get } = useIndexedDB('drafts');

  /**
   * 기존 편지 로드
   */
  useEffect(() => {
    if (letterId) {
      loadLetter();
    }
  }, [letterId]);

  const loadLetter = async () => {
    if (!letterId) return;

    try {
      setIsLoading(true);
      const letter = await get(letterId);
      if (letter) {
        setTitle(letter.title || '');
        setContent(letter.content || '');
      }
    } catch (error) {
      console.error('Failed to load letter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 자동 저장 (IndexedDB drafts)
   */
  const autoSave = useCallback(async () => {
    if (!title && !content) return;

    try {
      setIsSaving(true);

      const draft: Partial<Letter> = {
        id: letterId || `draft-${Date.now()}`,
        title: title || '제목 없음',
        content,
        updatedAt: new Date(),
        createdAt: letterId ? undefined : new Date(),
      };

      if (letterId) {
        await update(letterId, draft);
      } else {
        await add(draft);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, letterId, add, update]);

  /**
   * 자동 저장 타이머 설정
   */
  useEffect(() => {
    // 타이머 초기화
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 새 타이머 설정
    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, autoSave]);

  /**
   * 제목 변경 핸들러
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  /**
   * 내용 변경 핸들러
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  /**
   * 저장 버튼 핸들러
   */
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      alert('제목 또는 내용을 입력해주세요.');
      return;
    }

    const letter: Letter = {
      id: letterId || `letter-${Date.now()}`,
      title: title || '제목 없음',
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onSave?.(letter);
  };

  /**
   * 취소 버튼 핸들러
   */
  const handleCancel = () => {
    if (title || content) {
      const confirmed = window.confirm('작성 중인 내용이 있습니다. 나가시겠습니까?');
      if (!confirmed) return;
    }
    onCancel?.();
  };

  /**
   * 마지막 저장 시간 포맷팅
   */
  const formatLastSaved = () => {
    if (!lastSaved) return '';

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return '방금 저장됨';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
    return lastSaved.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
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
        <input
          type="text"
          className={styles.titleInput}
          placeholder="제목을 입력하세요"
          value={title}
          onChange={handleTitleChange}
          maxLength={100}
        />

        <div className={styles.statusBar}>
          {isSaving && (
            <span className={styles.savingIndicator}>
              <LoadingSpinner size="small" />
              <span>저장 중...</span>
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className={styles.savedIndicator}>
              ✓ {formatLastSaved()}
            </span>
          )}
        </div>
      </div>

      {/* 에디터 */}
      <textarea
        className={styles.contentTextarea}
        placeholder="편지 내용을 작성하세요..."
        value={content}
        onChange={handleContentChange}
      />

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button
          className={styles.cancelButton}
          onClick={handleCancel}
        >
          취소
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving || (!title.trim() && !content.trim())}
        >
          저장
        </button>
      </div>
    </div>
  );
}
