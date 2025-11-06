/**
 * Error Handler Utility
 * 오류 처리 유틸리티
 * Requirements: 6 (데이터 보안 및 프라이버시)
 */

import {
  AppError,
  ErrorCode,
  ErrorCategory,
  CreateErrorOptions,
  ErrorHandlerOptions,
  ErrorNotification,
  ERROR_MESSAGES,
} from '@/types/error';

/**
 * 오류 핸들러 클래스
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * AppError 생성
   */
  public createError(options: CreateErrorOptions): AppError {
    return {
      code: options.code,
      category: options.category,
      message: options.message,
      userMessage: options.userMessage,
      details: options.details,
      timestamp: Date.now(),
      stack: new Error().stack,
    };
  }

  /**
   * 일반 오류를 AppError로 정규화
   */
  public normalize(error: unknown): AppError {
    // 이미 AppError인 경우
    if (this.isAppError(error)) {
      return error;
    }

    // Error 객체인 경우
    if (error instanceof Error) {
      return this.normalizeError(error);
    }

    // 문자열 오류인 경우
    if (typeof error === 'string') {
      return this.createError({
        code: ErrorCode.SRV_001,
        category: ErrorCategory.UNKNOWN,
        message: error,
        userMessage: '오류가 발생했습니다.',
      });
    }

    // 알 수 없는 오류
    return this.createError({
      code: ErrorCode.SRV_001,
      category: ErrorCategory.UNKNOWN,
      message: 'Unknown error occurred',
      userMessage: '알 수 없는 오류가 발생했습니다.',
      details: error,
    });
  }

  /**
   * Error 객체를 AppError로 변환
   */
  private normalizeError(error: Error): AppError {
    const message = error.message.toLowerCase();

    // 네트워크 오류
    if (message.includes('network') || message.includes('fetch')) {
      return this.createError({
        code: ErrorCode.NET_003,
        category: ErrorCategory.NETWORK,
        message: error.message,
        userMessage: ERROR_MESSAGES[ErrorCode.NET_003],
        details: { originalError: error.name },
      });
    }

    // 권한 오류
    if (message.includes('permission') || message.includes('denied')) {
      return this.createError({
        code: ErrorCode.PER_001,
        category: ErrorCategory.PERMISSION,
        message: error.message,
        userMessage: ERROR_MESSAGES[ErrorCode.PER_001],
      });
    }

    // 저장소 오류
    if (message.includes('storage') || message.includes('quota')) {
      return this.createError({
        code: ErrorCode.STO_001,
        category: ErrorCategory.STORAGE,
        message: error.message,
        userMessage: ERROR_MESSAGES[ErrorCode.STO_001],
      });
    }

    // 기본 서버 오류
    return this.createError({
      code: ErrorCode.SRV_001,
      category: ErrorCategory.SERVER,
      message: error.message,
      userMessage: ERROR_MESSAGES[ErrorCode.SRV_001],
    });
  }

  /**
   * AppError 타입 가드
   */
  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'category' in error &&
      'message' in error &&
      'userMessage' in error
    );
  }

  /**
   * 오류 로깅
   */
  public log(error: AppError, context?: string): void {
    const logMessage = [
      `[${error.category}] ${error.code}: ${error.message}`,
      context ? `Context: ${context}` : '',
      error.details ? `Details: ${JSON.stringify(error.details)}` : '',
      error.stack ? `Stack: ${error.stack}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // 개발 환경에서만 상세 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(logMessage);
    } else {
      // 프로덕션에서는 간단한 로그만
      console.error(`[${error.category}] ${error.code}: ${error.userMessage}`);
    }
  }

  /**
   * 사용자에게 오류 알림
   */
  public notify(
    error: AppError,
    options?: ErrorHandlerOptions
  ): ErrorNotification {
    const notification: ErrorNotification = {
      title: this.getErrorTitle(error.category),
      message: error.userMessage,
      type: 'error',
      duration: 5000,
    };

    // 옵션에 따라 알림 표시
    if (options?.showNotification !== false) {
      // 실제 알림은 UI 레이어에서 처리
      // 여기서는 알림 객체만 반환
    }

    return notification;
  }

  /**
   * 오류 카테고리에 따른 제목 반환
   */
  private getErrorTitle(category: ErrorCategory): string {
    const titles: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: '네트워크 오류',
      [ErrorCategory.VALIDATION]: '입력 오류',
      [ErrorCategory.STORAGE]: '저장소 오류',
      [ErrorCategory.PERMISSION]: '권한 오류',
      [ErrorCategory.SERVER]: '서버 오류',
      [ErrorCategory.UNKNOWN]: '오류',
    };

    return titles[category];
  }

  /**
   * 오류 복구 시도
   */
  public async recover<T>(
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const appError = this.normalize(error);
      this.log(appError, 'Recovery attempt');

      // fallback이 제공된 경우 반환
      if (fallback !== undefined) {
        return fallback;
      }

      return null;
    }
  }

  /**
   * 오류 처리 (통합 메서드)
   */
  public handle(
    error: unknown,
    options?: ErrorHandlerOptions & { context?: string }
  ): AppError {
    const appError = this.normalize(error);

    // 로깅
    if (options?.logToConsole !== false) {
      this.log(appError, options?.context);
    }

    // 알림
    if (options?.showNotification) {
      this.notify(appError, options);
    }

    // 서버 리포팅 (옵션)
    if (options?.reportToServer && process.env.NODE_ENV === 'production') {
      this.reportToServer(appError).catch((reportError) => {
        console.error('Failed to report error to server:', reportError);
      });
    }

    return appError;
  }

  /**
   * 서버에 오류 리포팅 (선택적)
   */
  private async reportToServer(error: AppError): Promise<void> {
    // 실제 구현은 프로젝트의 에러 리포팅 서비스에 따라 다름
    // 예: Sentry, LogRocket, 커스텀 API 등
    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: error.code,
          category: error.category,
          message: error.message,
          timestamp: error.timestamp,
          details: error.details,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report error');
      }
    } catch (reportError) {
      // 리포팅 실패는 조용히 처리
      console.warn('Error reporting failed:', reportError);
    }
  }
}

/**
 * 기본 인스턴스 export
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * HTTP 상태 코드를 ErrorCode로 매핑
 */
export function httpStatusToErrorCode(status: number): ErrorCode {
  if (status >= 500) {
    return ErrorCode.SRV_001;
  }
  if (status === 404) {
    return ErrorCode.SRV_003;
  }
  if (status === 400) {
    return ErrorCode.SRV_002;
  }
  return ErrorCode.SRV_001;
}

/**
 * ErrorCode에서 사용자 메시지 가져오기
 */
export function getUserMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
}
