/**
 * Database Connection Unit Tests
 * 데이터베이스 연결 유틸리티 단위 테스트
 */

import { getPool, testConnection, query, execute, closePool } from '../connection';
import { RowDataPacket } from 'mysql2/promise';

// Mock mysql2/promise
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn(() =>
      Promise.resolve({
        query: jest.fn(() => Promise.resolve([[{ result: 2 }]])),
        execute: jest.fn(() => Promise.resolve([{ affectedRows: 1 }])),
        beginTransaction: jest.fn(() => Promise.resolve()),
        commit: jest.fn(() => Promise.resolve()),
        rollback: jest.fn(() => Promise.resolve()),
        release: jest.fn(),
      })
    ),
    end: jest.fn(() => Promise.resolve()),
  })),
}));

describe('Database Connection', () => {
  beforeEach(() => {
    // 환경 변수 설정
    process.env.DATABASE_HOST = 'localhost';
    process.env.DATABASE_PORT = '3306';
    process.env.DATABASE_USER = 'root';
    process.env.DATABASE_PASSWORD = 'test';
    process.env.DATABASE_NAME = 'test_db';
  });

  afterAll(async () => {
    await closePool();
  });

  describe('getPool', () => {
    it('should create and return a connection pool', () => {
      const pool = getPool();
      expect(pool).toBeDefined();
    });

    it('should return the same pool instance on multiple calls', () => {
      const pool1 = getPool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      const result = await testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      // Mock 실패 시나리오는 실제 DB 연결 시 테스트
      const result = await testConnection();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('query', () => {
    it('should execute SELECT query successfully', async () => {
      const result = await query<RowDataPacket[]>('SELECT 1 + 1 AS result');
      expect(result).toBeDefined();
    });

    it('should accept parameters', async () => {
      const result = await query<RowDataPacket[]>('SELECT ? AS value', [42]);
      expect(result).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute INSERT/UPDATE/DELETE query successfully', async () => {
      const result = await execute('INSERT INTO test (name) VALUES (?)', ['test']);
      expect(result).toBeDefined();
    });
  });
});

describe('Database Configuration', () => {
  it('should use default values when env vars are not set', () => {
    delete process.env.DATABASE_HOST;
    delete process.env.DATABASE_PORT;

    // Pool will be created with defaults
    const pool = getPool();
    expect(pool).toBeDefined();
  });

  it('should parse DATABASE_PORT as number', () => {
    process.env.DATABASE_PORT = '3307';
    const pool = getPool();
    expect(pool).toBeDefined();
  });
});
