/**
 * Header Component
 * 헤더 컴포넌트
 * Requirements: 7 (UI/UX 요구사항)
 */

'use client';

import React from 'react';
import styles from './Header.module.css';

export interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Header({
  title = '추억 남기기',
  showBackButton = false,
  onBack,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {showBackButton && (
          <button
            className={styles.backButton}
            onClick={onBack}
            aria-label="뒤로 가기"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.spacer} />
      </div>
    </header>
  );
}
