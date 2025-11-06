/**
 * useOnlineStatus Hook
 * 온라인 상태 감지 훅
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

import { useEffect, useState } from 'react';

/**
 * 온라인/오프라인 상태를 추적하는 훅
 * @returns 현재 온라인 상태 (true: 온라인, false: 오프라인)
 */
export function useOnlineStatus(): boolean {
  // 초기 상태는 navigator.onLine으로 설정
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // 브라우저 환경이 아니면 리스너 등록 안함
    if (typeof window === 'undefined') {
      return;
    }

    /**
     * 온라인 이벤트 핸들러
     */
    const handleOnline = () => {
      console.log('[useOnlineStatus] 온라인 상태로 전환');
      setIsOnline(true);
    };

    /**
     * 오프라인 이벤트 핸들러
     */
    const handleOffline = () => {
      console.log('[useOnlineStatus] 오프라인 상태로 전환');
      setIsOnline(false);
    };

    // 이벤트 리스너 등록
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 정리 함수
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * 온라인 상태 변화 감지 훅 (콜백 버전)
 * @param onOnline 온라인 상태로 전환될 때 호출되는 콜백
 * @param onOffline 오프라인 상태로 전환될 때 호출되는 콜백
 */
export function useOnlineStatusEffect(
  onOnline?: () => void,
  onOffline?: () => void
): void {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline && onOnline) {
      onOnline();
    } else if (!isOnline && onOffline) {
      onOffline();
    }
  }, [isOnline, onOnline, onOffline]);
}
