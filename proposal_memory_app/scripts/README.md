# Scripts Directory

이 디렉토리에는 데이터베이스 마이그레이션, 테스트, 유틸리티 스크립트가 포함되어 있습니다.

## 사용 가능한 스크립트

### 데이터베이스 마이그레이션

#### `migrate.ts`
데이터베이스 스키마 생성 및 관리

**사용법:**

```bash
# 기본 마이그레이션 (스키마만)
npm run migrate

# 마이그레이션 + 시드 데이터
npm run migrate:seed

# 롤백 (데이터베이스 삭제)
npm run migrate:rollback

# 리셋 (롤백 후 마이그레이션)
npm run migrate:reset

# 리셋 + 시드 데이터
npm run migrate:reset:seed
```

**기능:**
- ✅ 데이터베이스 존재 여부 확인
- ✅ 스키마 파일 실행
- ✅ 테이블 생성 확인
- ✅ 스키마 버전 추적
- ✅ 시드 데이터 삽입 (선택적)
- ✅ 롤백 기능 (데이터베이스 삭제)
- ✅ 리셋 기능 (롤백 후 재생성)

**출력 예시:**
```
============================================================
Database Migration
============================================================

1. Connecting to MySQL server...
   ✅ Connected

2. Checking if database exists...
   Database "proposal_memory" does not exist

3. Reading schema file...
   ✅ Loaded: /path/to/database/schema.sql

4. Executing schema...
   ✅ Schema applied successfully

5. Verifying tables...
   Found 6 tables:
   - media
   - letters
   - location
   - main_video
   - upload_queue
   - schema_version

6. Checking schema version...
   Version: 1.0.0
   Applied at: 2025-11-06T14:00:00.000Z
   Description: Initial schema creation

============================================================
✅ Migration completed successfully!
============================================================
```

### 데이터베이스 연결 테스트

#### `test-db-connection.ts`
데이터베이스 연결 및 상태 확인

**사용법:**

```bash
npm run test:db
```

**기능:**
- ✅ 데이터베이스 설정 확인
- ✅ 연결 테스트
- ✅ 상태 정보 출력

**출력 예시:**
```
==================================================
Database Connection Test
==================================================

1. Database Configuration:
   Host: localhost
   Port: 3306
   Database: proposal_memory
   User: root

2. Testing connection...
   ✅ Connection successful!

3. Database Status:
   Connected: ✅
   Config: {
     "host": "localhost",
     "port": 3306,
     "database": "proposal_memory",
     "user": "root"
   }

==================================================
All tests passed! ✅
==================================================
```

## 환경 변수

마이그레이션 스크립트는 `.env.local` 파일에서 다음 환경 변수를 읽습니다:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=proposal_memory
```

## 주의사항

### 프로덕션 환경

⚠️ **프로덕션 환경에서 롤백/리셋 명령을 실행할 때는 매우 주의하세요!**

- `migrate:rollback` 명령은 **전체 데이터베이스를 삭제**합니다
- `migrate:reset` 명령은 **모든 데이터를 손실**시킵니다
- 프로덕션에서는 백업 후 실행하는 것을 권장합니다

### 개발 환경

개발 중에는 자유롭게 리셋할 수 있습니다:

```bash
# 데이터베이스 리셋 후 샘플 데이터 삽입
npm run migrate:reset:seed
```

## 트러블슈팅

### MySQL 연결 실패

**문제:**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**해결:**
1. MySQL 서버가 실행 중인지 확인
   ```bash
   # macOS
   brew services start mysql

   # Ubuntu/Debian
   sudo systemctl start mysql
   ```

2. 환경 변수 확인
   - `.env.local` 파일이 존재하는지 확인
   - 호스트, 포트, 사용자명, 비밀번호가 올바른지 확인

### 권한 오류

**문제:**
```
Error: Access denied for user 'root'@'localhost'
```

**해결:**
```sql
-- MySQL에 접속
mysql -u root -p

-- 권한 부여
GRANT ALL PRIVILEGES ON proposal_memory.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 파일 찾기 오류

**문제:**
```
Failed to read SQL file: /path/to/schema.sql
```

**해결:**
- `database/schema.sql` 파일이 존재하는지 확인
- 파일 경로가 올바른지 확인
- 파일 권한 확인

## 추가 스크립트 작성

새 스크립트를 추가할 때는 다음 템플릿을 사용하세요:

```typescript
/**
 * Script Name
 * Brief description
 *
 * Usage: npm run script-name
 */

import dotenv from 'dotenv';
import path from 'path';

// 환경 변수 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  try {
    console.log('Script started...');

    // Your code here

    console.log('Script completed!');
    process.exit(0);
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { main };
```

그리고 `package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "script-name": "ts-node scripts/script-name.ts"
  }
}
```

## 참고 자료

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js mysql2 Package](https://www.npmjs.com/package/mysql2)
