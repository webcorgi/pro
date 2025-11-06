/**
 * Jest Setup for Server Tests
 * 서버 테스트 설정
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '3306';
process.env.DATABASE_USER = 'test_user';
process.env.DATABASE_PASSWORD = 'test_password';
process.env.DATABASE_NAME = 'test_db';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Suppress console output during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };
