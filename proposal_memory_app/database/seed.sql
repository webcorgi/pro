-- ============================================
-- Proposal Memory App - Sample Data (Seed)
-- ============================================
-- 개발 및 테스트용 샘플 데이터
-- ============================================

USE proposal_memory;

-- ============================================
-- 1. 샘플 미디어 데이터
-- ============================================

-- 샘플 이미지
INSERT INTO media (id, type, file_name, file_path, thumbnail_path, file_size, mime_type, uploaded_at, metadata)
VALUES
    (
        'sample-img-001',
        'image',
        'proposal_moment.jpg',
        '/uploads/sample-img-001.jpg',
        '/uploads/thumbnails/sample-img-001.jpg',
        2048576,
        'image/jpeg',
        '2025-01-01 18:30:00',
        JSON_OBJECT('width', 1920, 'height', 1080, 'location', 'Seoul')
    ),
    (
        'sample-img-002',
        'image',
        'ring_photo.jpg',
        '/uploads/sample-img-002.jpg',
        '/uploads/thumbnails/sample-img-002.jpg',
        1524288,
        'image/jpeg',
        '2025-01-01 18:45:00',
        JSON_OBJECT('width', 1920, 'height', 1080)
    );

-- 샘플 비디오
INSERT INTO media (id, type, file_name, file_path, thumbnail_path, file_size, mime_type, uploaded_at, metadata)
VALUES
    (
        'sample-vid-001',
        'video',
        'proposal_video.mp4',
        '/uploads/sample-vid-001.mp4',
        '/uploads/thumbnails/sample-vid-001.jpg',
        52428800,
        'video/mp4',
        '2025-01-01 19:00:00',
        JSON_OBJECT('duration', 120, 'width', 1920, 'height', 1080, 'codec', 'h264')
    );

-- ============================================
-- 2. 샘플 편지 데이터
-- ============================================

INSERT INTO letters (id, title, content, is_draft, created_at, updated_at)
VALUES
    (
        'sample-letter-001',
        '너에게',
        '사랑하는 당신에게...\n\n오늘 이 순간을 영원히 기억하고 싶어요.\n함께한 모든 순간이 소중했고, 앞으로도 영원히 함께하고 싶습니다.\n\n사랑해요.',
        FALSE,
        '2025-01-01 20:00:00',
        '2025-01-01 20:00:00'
    ),
    (
        'sample-letter-002',
        '미완성 편지',
        '작성 중인 편지입니다...',
        TRUE,
        '2025-01-02 10:00:00',
        '2025-01-02 10:00:00'
    );

-- ============================================
-- 3. 샘플 위치 데이터
-- ============================================

-- 서울 남산타워 (예시)
INSERT INTO location (id, latitude, longitude, place_name, memo, set_at)
VALUES
    (
        'sample-location-001',
        37.55134896,
        126.98821449,
        '남산타워',
        '우리가 처음 만난 곳',
        '2025-01-01 17:00:00'
    );

-- ============================================
-- 4. 메인 영상 설정
-- ============================================

INSERT INTO main_video (id, media_id, set_at)
VALUES
    (
        'main-video-001',
        'sample-vid-001',
        '2025-01-01 19:30:00'
    );

-- ============================================
-- 완료
-- ============================================

-- 데이터 확인
SELECT 'Media Count:' as info, COUNT(*) as count FROM media
UNION ALL
SELECT 'Letters Count:', COUNT(*) FROM letters
UNION ALL
SELECT 'Location Count:', COUNT(*) FROM location
UNION ALL
SELECT 'Main Video Count:', COUNT(*) FROM main_video;
