/**
 * Location Types
 * 위치 관련 타입 정의
 * Requirements: 8 (메인화면 지도에 프로포즈 장소 표시)
 */

/**
 * 위치 인터페이스
 */
export interface Location {
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
  setAt?: Date;
}

/**
 * 위치 설정 요청
 */
export interface SetLocationRequest {
  latitude: number;
  longitude: number;
  placeName?: string;
  memo?: string;
}

/**
 * 위치 업데이트 요청
 */
export interface UpdateLocationRequest {
  latitude?: number;
  longitude?: number;
  placeName?: string;
  memo?: string;
}

/**
 * 지도 설정
 */
export interface MapConfig {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  center: [number, number]; // [latitude, longitude]
  scrollWheelZoom?: boolean;
  dragging?: boolean;
}

/**
 * 마커 옵션
 */
export interface MarkerOptions {
  draggable?: boolean;
  icon?: any; // Leaflet icon
  popup?: string;
  tooltip?: string;
}

/**
 * 지오코딩 결과
 */
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  placeName: string;
  formattedAddress?: string;
  country?: string;
  city?: string;
}

/**
 * 위치 권한 상태
 */
export type LocationPermissionState = 'granted' | 'denied' | 'prompt';

/**
 * 지도 프로바이더
 */
export type MapProvider = 'leaflet' | 'google';

/**
 * 오프라인 지도 설정
 */
export interface OfflineMapConfig {
  enabled: boolean;
  cacheSize?: number;
  tileCacheExpiry?: number; // milliseconds
}
