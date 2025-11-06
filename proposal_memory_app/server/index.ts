/**
 * Express Server
 * Main server entry point
 * Requirements: 기술 스택 (Node.js, Express)
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { testConnection } from '../src/lib/db/connection';

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Express 앱 생성
const app: Application = express();
const PORT = process.env.PORT || 3001;

// ============================================
// 미들웨어 설정
// ============================================

// CORS 설정
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 요청 로깅 미들웨어
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ============================================
// 라우트 설정
// ============================================

// 헬스 체크 엔드포인트
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbConnected = await testConnection();
    const uptime = process.uptime();

    res.json({
      status: dbConnected ? 'ok' : 'error',
      timestamp: Date.now(),
      uptime: Math.floor(uptime),
      database: {
        connected: dbConnected,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: Date.now(),
      error: 'Health check failed',
    });
  }
});

// API 라우트 (추후 추가)
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Proposal Memory App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      media: '/api/media',
      letters: '/api/letters',
      location: '/api/location',
      mainVideo: '/api/main-video',
    },
  });
});

// 404 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// 전역 오류 핸들러
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// ============================================
// 서버 시작
// ============================================

async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    console.log('[Server] Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.warn('[Server] ⚠️  Database connection failed, but server will start anyway');
    } else {
      console.log('[Server] ✅ Database connected');
    }

    // 서버 시작
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`[Server] 🚀 Server is running`);
      console.log(`[Server] Port: ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] API: http://localhost:${PORT}/api`);
      console.log(`[Server] Health: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] Shutting down gracefully...');
  process.exit(0);
});

// 서버 시작
if (require.main === module) {
  startServer();
}

export default app;
