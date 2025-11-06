/**
 * Database Connection Test Script
 * 데이터베이스 연결 테스트 스크립트
 *
 * Usage: npm run test:db
 */

import dotenv from 'dotenv';
import path from 'path';
import { testConnection, getStatus, closePool } from '../src/lib/db/connection';

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  console.log('='.repeat(50));
  console.log('Database Connection Test');
  console.log('='.repeat(50));
  console.log();

  try {
    // 1. 데이터베이스 설정 정보 출력
    console.log('1. Database Configuration:');
    console.log('   Host:', process.env.DATABASE_HOST || 'localhost');
    console.log('   Port:', process.env.DATABASE_PORT || '3306');
    console.log('   Database:', process.env.DATABASE_NAME || 'proposal_memory');
    console.log('   User:', process.env.DATABASE_USER || 'root');
    console.log();

    // 2. 연결 테스트
    console.log('2. Testing connection...');
    const isConnected = await testConnection();

    if (isConnected) {
      console.log('   ✅ Connection successful!');
    } else {
      console.log('   ❌ Connection failed!');
      process.exit(1);
    }
    console.log();

    // 3. 상태 확인
    console.log('3. Database Status:');
    const status = await getStatus();
    console.log('   Connected:', status.connected ? '✅' : '❌');
    console.log('   Config:', JSON.stringify(status.config, null, 2));
    console.log();

    console.log('='.repeat(50));
    console.log('All tests passed! ✅');
    console.log('='.repeat(50));
  } catch (error) {
    console.error();
    console.error('❌ Error:', error);
    console.error();
    console.log('='.repeat(50));
    console.log('Tests failed! ❌');
    console.log('='.repeat(50));
    process.exit(1);
  } finally {
    await closePool();
  }
}

// 스크립트 실행
main();
