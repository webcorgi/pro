/**
 * Logger Middleware
 * HTTP 요청 로깅
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 색상 코드
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * HTTP 메서드 색상
 */
function getMethodColor(method: string): string {
  switch (method) {
    case 'GET':
      return colors.green;
    case 'POST':
      return colors.cyan;
    case 'PUT':
      return colors.yellow;
    case 'DELETE':
      return colors.red;
    default:
      return colors.reset;
  }
}

/**
 * 상태 코드 색상
 */
function getStatusColor(status: number): string {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.reset;
}

/**
 * HTTP 요청 로거 미들웨어
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // 응답 완료 시 로그
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    const methodColor = getMethodColor(method);
    const statusColor = getStatusColor(status);

    console.log(
      `${colors.gray}[${timestamp}]${colors.reset} ` +
        `${methodColor}${method}${colors.reset} ` +
        `${url} ` +
        `${statusColor}${status}${colors.reset} ` +
        `${colors.gray}${duration}ms${colors.reset}`
    );
  });

  next();
}

/**
 * 에러 로거 미들웨어
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;

  console.error(
    `${colors.red}[${timestamp}] ERROR${colors.reset} ` +
      `${method} ${url}\n` +
      `${colors.red}${err.stack}${colors.reset}`
  );

  next(err);
}
