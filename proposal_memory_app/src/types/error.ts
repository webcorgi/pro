/**
 * Error Types
 * 오류 관련 타입 정의
 * Requirements: 6 (데이터 보안 및 프라이버시)
 */

/**
 * 오류 카테고리
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 오류 코드
 */
export enum ErrorCode {
  // 네트워크 오류
  NET_001 = 'NET_001', // 네트워크 연결 없음
  NET_002 = 'NET_002', // 요청 타임아웃
  NET_003 = 'NET_003', // 서버 연결 실패

  // 검증 오류
  VAL_001 = 'VAL_001', // 파일 크기 초과
  VAL_002 = 'VAL_002', // 지원하지 않는 파일 형식
  VAL_003 = 'VAL_003', // 필수 필드 누락
  VAL_004 = 'VAL_004', // 유효하지 않은 좌표 값

  // 저장소 오류
  STO_001 = 'STO_001', // 저장 공간 부족
  STO_002 = 'STO_002', // IndexedDB 접근 실패
  STO_003 = 'STO_003', // 파일 시스템 오류

  // 권한 오류
  PER_001 = 'PER_001', // 카메라 접근 권한 거부
  PER_002 = 'PER_002', // 갤러리 접근 권한 거부
  PER_003 = 'PER_003', // 위치 정보 접근 권한 거부

  // 서버 오류
  SRV_001 = 'SRV_001', // 내부 서버 오류 (500)
  SRV_002 = 'SRV_002', // 잘못된 요청 (400)
  SRV_003 = 'SRV_003', // 리소스 없음 (404)
}

/**
 * 앱 오류 인터페이스
 */
export interface AppError {
  code: ErrorCode;
  category: ErrorCategory;
  message: string;
  userMessage: string; // 사용자에게 표시할 메시지
  details?: any;
  timestamp: number;
  stack?: string;
}

/**
 * 오류 생성 옵션
 */
export interface CreateErrorOptions {
  code: ErrorCode;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  details?: any;
}

/**
 * 오류 핸들러 옵션
 */
export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  reportToServer?: boolean;
}

/**
 * 오류 알림 설정
 */
export interface ErrorNotification {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * 재시도 설정
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffFactor: number;
}

/**
 * 사용자 친화적 오류 메시지 맵
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 네트워크
  [ErrorCode.NET_001]: '인터넷 연결이 없습니다. 네트워크를 확인해주세요.',
  [ErrorCode.NET_002]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ErrorCode.NET_003]: '서버에 연결할 수 없습니다.',

  // 검증
  [ErrorCode.VAL_001]: '파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.',
  [ErrorCode.VAL_002]: '지원하지 않는 파일 형식입니다.',
  [ErrorCode.VAL_003]: '필수 입력 항목이 누락되었습니다.',
  [ErrorCode.VAL_004]: '유효하지 않은 위치 정보입니다.',

  // 저장소
  [ErrorCode.STO_001]: '저장 공간이 부족합니다. 일부 파일을 삭제해주세요.',
  [ErrorCode.STO_002]: '데이터를 저장할 수 없습니다.',
  [ErrorCode.STO_003]: '파일을 저장하는 중 오류가 발생했습니다.',

  // 권한
  [ErrorCode.PER_001]: '카메라 접근 권한이 필요합니다.',
  [ErrorCode.PER_002]: '갤러리 접근 권한이 필요합니다.',
  [ErrorCode.PER_003]: '위치 정보 접근 권한이 필요합니다.',

  // 서버
  [ErrorCode.SRV_001]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorCode.SRV_002]: '잘못된 요청입니다.',
  [ErrorCode.SRV_003]: '요청한 리소스를 찾을 수 없습니다.',
};
