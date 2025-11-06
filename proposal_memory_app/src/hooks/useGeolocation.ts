/**
 * useGeolocation Hook
 * 위치 정보 접근 훅
 * Requirements: 8 (프로포즈 장소 표시)
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * 위치 정보
 */
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

/**
 * Geolocation 훅 반환 타입
 */
export interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  loading: boolean;
  error: string | null;
  getCurrentPosition: () => Promise<GeolocationPosition | null>;
  watchPosition: () => void;
  clearWatch: () => void;
}

/**
 * Geolocation 옵션
 */
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * 기본 Geolocation 옵션
 */
const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000, // 10초
  maximumAge: 0,
};

/**
 * GeolocationPosition을 우리 형식으로 변환
 */
function normalizePosition(pos: globalThis.GeolocationPosition): GeolocationPosition {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude,
    altitudeAccuracy: pos.coords.altitudeAccuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    timestamp: pos.timestamp,
  };
}

/**
 * Geolocation 오류 메시지 가져오기
 */
function getErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return '위치 정보 접근 권한이 거부되었습니다.';
    case error.POSITION_UNAVAILABLE:
      return '위치 정보를 사용할 수 없습니다.';
    case error.TIMEOUT:
      return '위치 정보 요청 시간이 초과되었습니다.';
    default:
      return '알 수 없는 오류가 발생했습니다.';
  }
}

/**
 * 위치 정보 접근 훅
 * @param options Geolocation 옵션
 * @returns 위치 정보 및 상태
 */
export function useGeolocation(
  options: GeolocationOptions = {}
): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const finalOptions: PositionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  /**
   * 현재 위치 가져오기 (일회성)
   */
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      // Geolocation API 지원 확인
      if (!navigator.geolocation) {
        const errorMsg = 'Geolocation을 지원하지 않는 브라우저입니다.';
        setError(errorMsg);
        resolve(null);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const normalizedPos = normalizePosition(pos);
          setPosition(normalizedPos);
          setLoading(false);
          resolve(normalizedPos);
        },
        (err) => {
          const errorMsg = getErrorMessage(err);
          setError(errorMsg);
          setLoading(false);
          resolve(null);
        },
        finalOptions
      );
    });
  }, [finalOptions]);

  /**
   * 위치 추적 시작
   */
  const watchPosition = useCallback(() => {
    // 이미 추적 중이면 무시
    if (watchId !== null) {
      return;
    }

    // Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setError('Geolocation을 지원하지 않는 브라우저입니다.');
      return;
    }

    setLoading(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const normalizedPos = normalizePosition(pos);
        setPosition(normalizedPos);
        setLoading(false);
      },
      (err) => {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        setLoading(false);
      },
      finalOptions
    );

    setWatchId(id);
  }, [finalOptions, watchId]);

  /**
   * 위치 추적 중지
   */
  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // 컴포넌트 언마운트 시 추적 중지
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    position,
    loading,
    error,
    getCurrentPosition,
    watchPosition,
    clearWatch,
  };
}

/**
 * 자동으로 현재 위치를 가져오는 훅
 * @param options Geolocation 옵션
 * @param autoFetch 자동으로 위치를 가져올지 여부
 * @returns 위치 정보 및 상태
 */
export function useCurrentPosition(
  options: GeolocationOptions = {},
  autoFetch = true
): UseGeolocationReturn {
  const geolocation = useGeolocation(options);

  useEffect(() => {
    if (autoFetch) {
      geolocation.getCurrentPosition();
    }
  }, [autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return geolocation;
}

/**
 * 권한 상태 확인 훅
 * @returns 권한 상태 및 요청 함수
 */
export function useGeolocationPermission(): {
  state: PermissionState | null;
  loading: boolean;
  requestPermission: () => Promise<PermissionState>;
} {
  const [state, setState] = useState<PermissionState | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * 권한 상태 확인
   */
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setState(result.state);

      // 권한 상태 변화 감지
      result.addEventListener('change', () => {
        setState(result.state);
      });
    } catch (error) {
      console.error('[useGeolocationPermission] 권한 확인 실패:', error);
    }
  }, []);

  /**
   * 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    setLoading(true);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLoading(false);
        resolve('denied');
        return;
      }

      // 위치 정보 요청을 통해 권한 요청
      navigator.geolocation.getCurrentPosition(
        () => {
          setState('granted');
          setLoading(false);
          resolve('granted');
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setState('denied');
            setLoading(false);
            resolve('denied');
          } else {
            setLoading(false);
            resolve('prompt');
          }
        }
      );
    });
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    state,
    loading,
    requestPermission,
  };
}
