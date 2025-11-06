/**
 * Database Migration Script
 * 데이터베이스 스키마 마이그레이션 및 초기화
 *
 * Usage:
 *   npm run migrate          # 마이그레이션 실행
 *   npm run migrate:rollback # 롤백 (데이터베이스 삭제)
 *   npm run migrate:reset    # 리셋 (롤백 후 마이그레이션)
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * 데이터베이스 설정
 */
const config = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  multipleStatements: true, // 여러 SQL 문 실행 허용
};

const databaseName = process.env.DATABASE_NAME || 'proposal_memory';

/**
 * SQL 파일 경로
 */
const SCHEMA_FILE = path.resolve(__dirname, '../database/schema.sql');
const SEED_FILE = path.resolve(__dirname, '../database/seed.sql');

/**
 * 색상 출력 헬퍼
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * SQL 파일 읽기
 */
function readSQLFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    log(`❌ Failed to read SQL file: ${filePath}`, 'red');
    throw error;
  }
}

/**
 * 데이터베이스 존재 여부 확인
 */
async function databaseExists(connection: mysql.Connection): Promise<boolean> {
  const [rows] = await connection.query(
    'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
    [databaseName]
  );
  return (rows as any[]).length > 0;
}

/**
 * 마이그레이션 실행
 */
async function migrate(withSeed: boolean = false): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    log('='.repeat(60), 'blue');
    log('Database Migration', 'bright');
    log('='.repeat(60), 'blue');
    log('');

    // 1. MySQL 연결 (데이터베이스 지정 없이)
    log('1. Connecting to MySQL server...', 'yellow');
    connection = await mysql.createConnection(config);
    log('   ✅ Connected', 'green');
    log('');

    // 2. 데이터베이스 존재 확인
    log('2. Checking if database exists...', 'yellow');
    const exists = await databaseExists(connection);

    if (exists) {
      log(`   ⚠️  Database "${databaseName}" already exists`, 'yellow');
      log('   Skipping database creation', 'yellow');
    } else {
      log(`   Database "${databaseName}" does not exist`, 'blue');
    }
    log('');

    // 3. 스키마 파일 읽기
    log('3. Reading schema file...', 'yellow');
    const schemaSql = readSQLFile(SCHEMA_FILE);
    log(`   ✅ Loaded: ${SCHEMA_FILE}`, 'green');
    log('');

    // 4. 스키마 실행
    log('4. Executing schema...', 'yellow');
    await connection.query(schemaSql);
    log('   ✅ Schema applied successfully', 'green');
    log('');

    // 5. 테이블 확인
    log('5. Verifying tables...', 'yellow');
    await connection.changeUser({ database: databaseName });
    const [tables] = await connection.query('SHOW TABLES');
    const tableList = (tables as any[]).map((row) => Object.values(row)[0]);

    log(`   Found ${tableList.length} tables:`, 'blue');
    tableList.forEach((table) => {
      log(`   - ${table}`, 'blue');
    });
    log('');

    // 6. 스키마 버전 확인
    log('6. Checking schema version...', 'yellow');
    const [versionRows] = await connection.query('SELECT * FROM schema_version');
    const version = (versionRows as any[])[0];
    log(`   Version: ${version.version}`, 'green');
    log(`   Applied at: ${version.applied_at}`, 'green');
    log(`   Description: ${version.description}`, 'green');
    log('');

    // 7. 시드 데이터 삽입 (옵션)
    if (withSeed) {
      log('7. Loading seed data...', 'yellow');
      const seedSql = readSQLFile(SEED_FILE);
      await connection.query(seedSql);
      log('   ✅ Seed data inserted', 'green');
      log('');
    }

    log('='.repeat(60), 'blue');
    log('✅ Migration completed successfully!', 'green');
    log('='.repeat(60), 'blue');
  } catch (error) {
    log('');
    log('='.repeat(60), 'red');
    log('❌ Migration failed!', 'red');
    log('='.repeat(60), 'red');
    log('');
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 롤백 (데이터베이스 삭제)
 */
async function rollback(): Promise<void> {
  let connection: mysql.Connection | null = null;

  try {
    log('='.repeat(60), 'blue');
    log('Database Rollback', 'bright');
    log('='.repeat(60), 'blue');
    log('');

    // 1. MySQL 연결
    log('1. Connecting to MySQL server...', 'yellow');
    connection = await mysql.createConnection(config);
    log('   ✅ Connected', 'green');
    log('');

    // 2. 데이터베이스 존재 확인
    log('2. Checking if database exists...', 'yellow');
    const exists = await databaseExists(connection);

    if (!exists) {
      log(`   ⚠️  Database "${databaseName}" does not exist`, 'yellow');
      log('   Nothing to rollback', 'yellow');
      log('');
      return;
    }

    log(`   Database "${databaseName}" found`, 'blue');
    log('');

    // 3. 데이터베이스 삭제 확인
    log(`⚠️  WARNING: This will DELETE the database "${databaseName}"!`, 'red');
    log('   All data will be lost!', 'red');
    log('');

    // Node.js 환경에서는 자동 진행 (프로덕션에서는 주의 필요)
    log('3. Dropping database...', 'yellow');
    await connection.query(`DROP DATABASE IF EXISTS ${databaseName}`);
    log('   ✅ Database dropped', 'green');
    log('');

    log('='.repeat(60), 'blue');
    log('✅ Rollback completed successfully!', 'green');
    log('='.repeat(60), 'blue');
  } catch (error) {
    log('');
    log('='.repeat(60), 'red');
    log('❌ Rollback failed!', 'red');
    log('='.repeat(60), 'red');
    log('');
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * 리셋 (롤백 후 마이그레이션)
 */
async function reset(withSeed: boolean = false): Promise<void> {
  log('='.repeat(60), 'blue');
  log('Database Reset', 'bright');
  log('='.repeat(60), 'blue');
  log('');

  await rollback();
  log('');
  await migrate(withSeed);
}

/**
 * CLI 인터페이스
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';
  const withSeed = args.includes('--seed');

  try {
    switch (command) {
      case 'migrate':
        await migrate(withSeed);
        break;

      case 'rollback':
        await rollback();
        break;

      case 'reset':
        await reset(withSeed);
        break;

      default:
        log('Unknown command. Available commands:', 'red');
        log('  migrate [--seed]  - Run migration', 'blue');
        log('  rollback          - Drop database', 'blue');
        log('  reset [--seed]    - Rollback and migrate', 'blue');
        process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { migrate, rollback, reset };
