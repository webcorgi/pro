# Database Setup Guide

## 개요

이 디렉토리에는 Proposal Memory App의 MySQL 데이터베이스 스키마와 관련 파일들이 포함되어 있습니다.

## 파일 구조

```
database/
├── schema.sql          # 데이터베이스 스키마 정의
├── seed.sql            # 개발/테스트용 샘플 데이터
└── README.md           # 이 파일
```

## 데이터베이스 테이블

### 1. media
- 이미지 및 비디오 파일 메타데이터 저장
- 컬럼: id, type, file_name, file_path, thumbnail_path, file_size, mime_type, uploaded_at, metadata
- 인덱스: type, uploaded_at

### 2. letters
- 프로포즈 편지 내용 저장
- 컬럼: id, title, content, is_draft, created_at, updated_at
- 인덱스: created_at, is_draft

### 3. location
- 프로포즈 장소 정보 저장
- 컬럼: id, latitude, longitude, place_name, memo, set_at
- 인덱스: coordinates

### 4. main_video
- 메인 영상 설정 저장
- 컬럼: id, media_id, set_at
- 외래키: media_id → media(id)

### 5. upload_queue
- 오프라인 업로드 대기열 (서버 사이드)
- 컬럼: id, file_name, file_data, type, status, retry_count, created_at, error_message
- 인덱스: status, created_at

### 6. schema_version
- 스키마 버전 관리
- 컬럼: version, applied_at, description

## 설정 방법

### 1. MySQL 설치 확인

```bash
mysql --version
```

### 2. MySQL 서버 시작

**macOS (Homebrew):**
```bash
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo systemctl start mysql
```

**Windows:**
MySQL Workbench 또는 서비스 관리자에서 시작

### 3. 데이터베이스 생성 및 스키마 적용

```bash
# MySQL 접속
mysql -u root -p

# 또는 스키마 파일 직접 실행
mysql -u root -p < database/schema.sql
```

### 4. 샘플 데이터 삽입 (선택사항)

```bash
mysql -u root -p proposal_memory < database/seed.sql
```

### 5. 환경 변수 설정

`.env.local` 파일에 데이터베이스 연결 정보를 설정:

```env
DATABASE_URL=mysql://root:your_password@localhost:3306/proposal_memory
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=proposal_memory
```

## 데이터베이스 관리

### 스키마 확인

```sql
USE proposal_memory;
SHOW TABLES;
DESCRIBE media;
```

### 데이터 확인

```sql
SELECT * FROM media LIMIT 10;
SELECT * FROM letters;
SELECT * FROM location;
```

### 데이터베이스 리셋

```sql
DROP DATABASE IF EXISTS proposal_memory;
```

그 후 `schema.sql`을 다시 실행

### 백업

```bash
# 전체 데이터베이스 백업
mysqldump -u root -p proposal_memory > backup.sql

# 스키마만 백업
mysqldump -u root -p --no-data proposal_memory > schema_backup.sql
```

### 복원

```bash
mysql -u root -p proposal_memory < backup.sql
```

## 마이그레이션

마이그레이션 스크립트는 `scripts/migrate.ts`에서 관리됩니다.

```bash
npm run migrate
```

## 주의사항

1. **프로덕션 환경**에서는 강력한 비밀번호를 사용하세요
2. **LONGBLOB** 타입 (upload_queue.file_data)은 대용량 데이터를 저장하므로 주의가 필요합니다
3. 정기적으로 **백업**을 수행하세요
4. 인덱스는 성능을 위해 추가되었으며, 데이터가 많아질수록 중요합니다

## 문제 해결

### 연결 오류

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

→ MySQL 서버가 실행 중인지 확인

### 권한 오류

```sql
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON proposal_memory.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 문자 인코딩 오류

데이터베이스와 테이블이 `utf8mb4`로 설정되어 있는지 확인:

```sql
SHOW CREATE DATABASE proposal_memory;
SHOW CREATE TABLE media;
```

## 참고 문서

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [설계 문서](../../specs/proposal_memory_app/design.md)
- [요구사항 문서](../../specs/proposal_memory_app/requirements.md)
