/**
 * Loading Spinner Component
 * 로딩 스피너 컴포넌트
 * Requirements: 7 (UI/UX 요구사항)
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  fullScreen = false,
  message,
}: LoadingSpinnerProps) {
  const spinnerElement = (
    <div className={`${styles.spinner} ${styles[size]}`}>
      <div className={styles.circle}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
