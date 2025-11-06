/**
 * Retry Logic Utility
 * 재시도 로직 유틸리티
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import { RetryConfig } from '@/types/error';

/**
 * 기본 재시도 설정
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1초
  maxDelay: 10000, // 10초
  backoffFactor: 2,
};

/**
 * 재시도 결과 타입
 */
export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * 지수 백오프를 사용하는 재시도 함수
 * @param operation 재시도할 비동기 작업
 * @param config 재시도 설정
 * @returns 작업 결과
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= finalConfig.maxRetries) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // 마지막 시도였으면 오류 던지기
      if (attempt > finalConfig.maxRetries) {
        break;
      }

      // 백오프 지연 계산
      const delay = calculateBackoffDelay(
        attempt,
        finalConfig.initialDelay,
        finalConfig.maxDelay,
        finalConfig.backoffFactor
      );

      // 재시도 전 지연
      await sleep(delay);
    }
  }

  // 모든 재시도 실패
  throw lastError || new Error('Operation failed after retries');
}

/**
 * 재시도 with 상세 결과
 * @param operation 재시도할 비동기 작업
 * @param config 재시도 설정
 * @returns 상세 재시도 결과
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= finalConfig.maxRetries) {
    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // 마지막 시도였으면 오류 반환
      if (attempt > finalConfig.maxRetries) {
        break;
      }

      // 백오프 지연 계산
      const delay = calculateBackoffDelay(
        attempt,
        finalConfig.initialDelay,
        finalConfig.maxDelay,
        finalConfig.backoffFactor
      );

      // 재시도 전 지연
      await sleep(delay);
    }
  }

  // 모든 재시도 실패
  return {
    success: false,
    error: lastError,
    attempts: attempt,
  };
}

/**
 * 조건부 재시도
 * @param operation 재시도할 비동기 작업
 * @param shouldRetry 재시도 여부를 판단하는 함수
 * @param config 재시도 설정
 * @returns 작업 결과
 */
export async function retryWithCondition<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= finalConfig.maxRetries) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // 재시도 여부 확인
      if (!shouldRetry(lastError, attempt) || attempt > finalConfig.maxRetries) {
        break;
      }

      // 백오프 지연 계산
      const delay = calculateBackoffDelay(
        attempt,
        finalConfig.initialDelay,
        finalConfig.maxDelay,
        finalConfig.backoffFactor
      );

      // 재시도 전 지연
      await sleep(delay);
    }
  }

  throw lastError || new Error('Operation failed after conditional retries');
}

/**
 * 백오프 지연 시간 계산
 * @param attempt 현재 시도 횟수
 * @param initialDelay 초기 지연 시간
 * @param maxDelay 최대 지연 시간
 * @param backoffFactor 백오프 배수
 * @returns 지연 시간 (ms)
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  // Exponential backoff: initialDelay * (backoffFactor ^ attempt)
  const delay = initialDelay * Math.pow(backoffFactor, attempt - 1);

  // jitter 추가 (랜덤성을 더해 동시 재시도 방지)
  const jitter = Math.random() * 0.3 * delay;

  // 최대 지연 시간 제한
  return Math.min(delay + jitter, maxDelay);
}

/**
 * 지연 함수
 * @param ms 대기 시간 (밀리초)
 * @returns Promise
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 네트워크 오류 재시도 헬퍼
 * @param operation 네트워크 작업
 * @param config 재시도 설정
 * @returns 작업 결과
 */
export async function retryNetworkRequest<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  return retryWithCondition(
    operation,
    (error, attempt) => {
      // 네트워크 오류만 재시도
      return (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.name === 'NetworkError' ||
        error.name === 'TimeoutError'
      );
    },
    config
  );
}

/**
 * Fetch API 래퍼 with 재시도
 * @param url 요청 URL
 * @param options Fetch 옵션
 * @param retryConfig 재시도 설정
 * @returns Response
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: Partial<RetryConfig>
): Promise<Response> {
  return retryNetworkRequest(async () => {
    const response = await fetch(url, options);

    // 5xx 오류는 재시도
    if (response.status >= 500) {
      throw new Error(`Server error: ${response.status}`);
    }

    return response;
  }, retryConfig);
}

/**
 * 재시도 가능한 Promise 래퍼
 * @param promiseFactory Promise를 생성하는 팩토리 함수
 * @param config 재시도 설정
 * @returns 작업 결과
 */
export function retryable<T>(
  promiseFactory: () => Promise<T>,
  config?: Partial<RetryConfig>
) {
  return {
    /**
     * 재시도 실행
     */
    execute: () => retryWithBackoff(promiseFactory, config),

    /**
     * 상세 결과와 함께 재시도 실행
     */
    executeWithResult: () => retryWithResult(promiseFactory, config),

    /**
     * 조건부 재시도 실행
     */
    executeWithCondition: (shouldRetry: (error: Error, attempt: number) => boolean) =>
      retryWithCondition(promiseFactory, shouldRetry, config),
  };
}
