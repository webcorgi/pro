/**
 * OfflineIndicator Component
 * 오프라인 상태 표시기
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import styles from './OfflineIndicator.module.css';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.indicator}>
        <span className={styles.icon}>📡</span>
        <span className={styles.text}>오프라인 모드</span>
      </div>
    </div>
  );
}
