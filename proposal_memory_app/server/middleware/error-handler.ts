/**
 * Error Handler Middleware
 * 전역 오류 처리 미들웨어
 * Requirements: 6 (데이터 보안 및 프라이버시)
 */

import { Request, Response, NextFunction } from 'express';

/**
 * HTTP 오류 클래스
 */
export class HttpError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(statusCode: number, message: string, code?: string, details?: any) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * 오류 응답 인터페이스
 */
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
}

/**
 * 전역 오류 핸들러 미들웨어
 */
export function errorHandler(
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 이미 응답이 시작된 경우 기본 핸들러로 전달
  if (res.headersSent) {
    return next(err);
  }

  // HttpError인 경우
  if (err instanceof HttpError) {
    const response: ErrorResponse = {
      error: err.name,
      message: err.message,
      code: err.code,
      details: err.details,
      timestamp: Date.now(),
    };

    return res.status(err.statusCode).json(response);
  }

  // Multer 오류 처리
  if (err.name === 'MulterError') {
    const multerErr = err as any;

    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'ValidationError',
        message: '파일 크기가 너무 큽니다.',
        code: 'VAL_001',
        timestamp: Date.now(),
      });
    }

    if (multerErr.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'ValidationError',
        message: '파일 개수가 너무 많습니다.',
        code: 'VAL_001',
        timestamp: Date.now(),
      });
    }

    return res.status(400).json({
      error: 'ValidationError',
      message: multerErr.message,
      code: 'VAL_002',
      timestamp: Date.now(),
    });
  }

  // 검증 오류
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'ValidationError',
      message: err.message,
      code: 'VAL_003',
      timestamp: Date.now(),
    });
  }

  // 데이터베이스 오류
  if (err.message.includes('Database') || err.message.includes('SQL')) {
    console.error('[Database Error]', err);
    return res.status(500).json({
      error: 'DatabaseError',
      message: '데이터베이스 오류가 발생했습니다.',
      code: 'SRV_001',
      timestamp: Date.now(),
    });
  }

  // 기본 500 오류
  console.error('[Unhandled Error]', err);

  const response: ErrorResponse = {
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production'
      ? '서버 오류가 발생했습니다.'
      : err.message,
    code: 'SRV_001',
    timestamp: Date.now(),
  };

  // 프로덕션에서는 스택 추적 숨김
  if (process.env.NODE_ENV !== 'production') {
    response.details = {
      stack: err.stack,
    };
  }

  res.status(500).json(response);
}

/**
 * 404 핸들러
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.path}`,
    code: 'SRV_003',
    timestamp: Date.now(),
  });
}

/**
 * 비동기 핸들러 래퍼
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
