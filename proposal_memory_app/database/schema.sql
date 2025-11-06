-- ============================================
-- Proposal Memory App - Database Schema
-- ============================================
-- 프로포즈용 추억남기기 웹앱 데이터베이스 스키마
-- Requirements: 2, 3, 4, 5, 8
-- ============================================

-- 데이터베이스 생성 (존재하지 않는 경우)
CREATE DATABASE IF NOT EXISTS proposal_memory
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE proposal_memory;

-- ============================================
-- 1. MEDIA 테이블
-- ============================================
-- 이미지 및 비디오 파일 저장
-- Requirements: 2 (이미지 및 비디오 업로드 및 저장)
--               3 (미디어 갤러리 및 탐색)

CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(36) PRIMARY KEY,
    type ENUM('image', 'video') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    file_size INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,

    INDEX idx_type (type),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. LETTERS 테이블
-- ============================================
-- 프로포즈 편지 저장
-- Requirements: 4 (프로포즈 편지 작성 및 관리)

CREATE TABLE IF NOT EXISTS letters (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_draft BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_created_at (created_at),
    INDEX idx_is_draft (is_draft)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. LOCATION 테이블
-- ============================================
-- 프로포즈 장소 정보 저장
-- Requirements: 8 (메인화면 지도에 프로포즈 장소 표시)

CREATE TABLE IF NOT EXISTS location (
    id VARCHAR(36) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    place_name VARCHAR(255),
    memo TEXT,
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. MAIN_VIDEO 테이블
-- ============================================
-- 메인 영상 설정 저장
-- Requirements: 5 (메인 영상 재생)

CREATE TABLE IF NOT EXISTS main_video (
    id VARCHAR(36) PRIMARY KEY,
    media_id VARCHAR(36) NOT NULL,
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. UPLOAD_QUEUE 테이블 (오프라인 지원)
-- ============================================
-- 오프라인 시 업로드 대기열 관리 (서버 사이드)
-- Requirements: 1 (PWA 설치 및 오프라인 지원)

CREATE TABLE IF NOT EXISTS upload_queue (
    id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_data LONGBLOB NOT NULL,
    type ENUM('image', 'video') NOT NULL,
    status ENUM('pending', 'processing', 'failed') DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,

    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 인덱스 및 제약조건 추가 설명
-- ============================================

-- MEDIA 테이블 인덱스:
-- - idx_type: 타입별 필터링 성능 향상 (이미지만, 비디오만 조회)
-- - idx_uploaded_at: 시간순 정렬 성능 향상

-- LETTERS 테이블 인덱스:
-- - idx_created_at: 최신순 정렬 성능 향상
-- - idx_is_draft: 임시저장/완료된 편지 필터링 성능 향상

-- LOCATION 테이블 인덱스:
-- - idx_coordinates: 좌표 기반 검색 성능 향상

-- MAIN_VIDEO 테이블 외래키:
-- - ON DELETE CASCADE: media 삭제 시 main_video도 자동 삭제

-- UPLOAD_QUEUE 테이블 인덱스:
-- - idx_status: 대기 중인 작업 조회 성능 향상
-- - idx_created_at: 오래된 작업 정리 시 성능 향상

-- ============================================
-- 스키마 버전 정보
-- ============================================

CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO schema_version (version, description)
VALUES ('1.0.0', 'Initial schema creation')
ON DUPLICATE KEY UPDATE version=version;

-- ============================================
-- 완료
-- ============================================
