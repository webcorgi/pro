/**
 * LoadingSpinner Component
 * 로딩 스피너
 * Requirements: 3 (사용자 인터페이스)
 */

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'medium',
  fullScreen = false
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={`${styles.spinner} ${styles[size]}`} />
      </div>
    );
  }

  return <div className={`${styles.spinner} ${styles[size]}`} />;
}
