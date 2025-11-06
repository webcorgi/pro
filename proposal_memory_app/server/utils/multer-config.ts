/**
 * Multer Configuration
 * 파일 업로드 설정
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 업로드 디렉토리
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const THUMBNAIL_DIR = process.env.THUMBNAIL_DIR || './uploads/thumbnails';

// 디렉토리 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}

// 파일 크기 제한
const MAX_FILE_SIZE_IMAGE = parseInt(
  process.env.MAX_FILE_SIZE_IMAGE || '10485760',
  10
); // 10MB
const MAX_FILE_SIZE_VIDEO = parseInt(
  process.env.MAX_FILE_SIZE_VIDEO || '104857600',
  10
); // 100MB

// 허용된 MIME 타입
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

/**
 * 파일 필터
 */
function fileFilter(
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);

  if (isImage || isVideo) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `지원하지 않는 파일 형식입니다. 허용: ${[
          ...ALLOWED_IMAGE_TYPES,
          ...ALLOWED_VIDEO_TYPES,
        ].join(', ')}`
      )
    );
  }
}

/**
 * 스토리지 설정
 */
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    callback(null, uniqueName);
  },
});

/**
 * Multer 인스턴스
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_VIDEO, // 최대 크기 (비디오 기준)
    files: 1, // 한 번에 하나의 파일만
  },
});

/**
 * 파일 타입 검증
 */
export function validateFileType(mimetype: string): 'image' | 'video' | null {
  if (ALLOWED_IMAGE_TYPES.includes(mimetype)) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimetype)) {
    return 'video';
  }
  return null;
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(size: number, type: 'image' | 'video'): boolean {
  const maxSize = type === 'image' ? MAX_FILE_SIZE_IMAGE : MAX_FILE_SIZE_VIDEO;
  return size <= maxSize;
}

/**
 * 업로드 디렉토리 경로 반환
 */
export function getUploadDir(): string {
  return UPLOAD_DIR;
}

/**
 * 썸네일 디렉토리 경로 반환
 */
export function getThumbnailDir(): string {
  return THUMBNAIL_DIR;
}

export { UPLOAD_DIR, THUMBNAIL_DIR };
