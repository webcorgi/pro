/**
 * Database Connection Utility
 * MySQL2 Connection Pool 설정 및 관리
 * Requirements: 기술 제약사항 (MySQL)
 */

import mysql from 'mysql2/promise';
import { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * 데이터베이스 설정 인터페이스
 */
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  waitForConnections?: boolean;
  queueLimit?: number;
}

/**
 * 환경 변수에서 데이터베이스 설정 로드
 */
function getDatabaseConfig(): DatabaseConfig {
  const host = process.env.DATABASE_HOST || 'localhost';
  const port = parseInt(process.env.DATABASE_PORT || '3306', 10);
  const user = process.env.DATABASE_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || '';
  const database = process.env.DATABASE_NAME || 'proposal_memory';

  return {
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  };
}

/**
 * Connection Pool 인스턴스
 */
let pool: Pool | null = null;

/**
 * Connection Pool 생성 또는 반환
 * @returns MySQL Connection Pool
 */
export function getPool(): Pool {
  if (!pool) {
    const config = getDatabaseConfig();

    console.log('[DB] Creating connection pool...', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    });

    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: config.connectionLimit,
      waitForConnections: config.waitForConnections,
      queueLimit: config.queueLimit,
      // 추가 설정
      charset: 'utf8mb4',
      timezone: '+00:00',
      supportBigNumbers: true,
      bigNumberStrings: false,
      dateStrings: false,
    });

    console.log('[DB] Connection pool created');
  }

  return pool;
}

/**
 * 데이터베이스 연결 테스트
 * @returns 연결 성공 여부
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    console.log('[DB] Testing connection...');

    // 간단한 쿼리로 연결 테스트
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    const result = (rows as RowDataPacket[])[0];

    console.log('[DB] Connection test successful:', result);

    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] Connection test failed:', error);
    return false;
  }
}

/**
 * 데이터베이스 연결 얻기
 * @returns PoolConnection
 */
export async function getConnection(): Promise<PoolConnection> {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('[DB] Failed to get connection:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * 쿼리 실행 (SELECT)
 * @param sql SQL 쿼리
 * @param params 파라미터
 * @returns 쿼리 결과
 */
export async function query<T extends RowDataPacket[] | RowDataPacket[][] | ResultSetHeader>(
  sql: string,
  params?: any[]
): Promise<T> {
  const connection = await getConnection();

  try {
    const [rows] = await connection.query<T>(sql, params);
    return rows;
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 쿼리 실행 (INSERT, UPDATE, DELETE)
 * @param sql SQL 쿼리
 * @param params 파라미터
 * @returns ResultSetHeader
 */
export async function execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
  const connection = await getConnection();

  try {
    const [result] = await connection.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (error) {
    console.error('[DB] Execute error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 트랜잭션 실행
 * @param callback 트랜잭션 콜백
 * @returns 콜백 결과
 */
export async function transaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    console.log('[DB] Transaction started');

    const result = await callback(connection);

    await connection.commit();
    console.log('[DB] Transaction committed');

    return result;
  } catch (error) {
    await connection.rollback();
    console.error('[DB] Transaction rolled back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Connection Pool 종료
 */
export async function closePool(): Promise<void> {
  if (pool) {
    console.log('[DB] Closing connection pool...');
    await pool.end();
    pool = null;
    console.log('[DB] Connection pool closed');
  }
}

/**
 * 데이터베이스 상태 확인
 * @returns 상태 정보
 */
export async function getStatus(): Promise<{
  connected: boolean;
  config: Partial<DatabaseConfig>;
}> {
  const config = getDatabaseConfig();
  const connected = await testConnection();

  return {
    connected,
    config: {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    },
  };
}

// 프로세스 종료 시 Connection Pool 정리
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

export default {
  getPool,
  getConnection,
  testConnection,
  query,
  execute,
  transaction,
  closePool,
  getStatus,
};
