/**
 * Thumbnail Generator
 * 썸네일 생성 유틸리티
 * Requirements: 2 (비디오 썸네일 자동 생성)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { getThumbnailDir } from './multer-config';

/**
 * 이미지 썸네일 생성
 * @param filePath 원본 파일 경로
 * @param outputName 출력 파일명
 * @returns 썸네일 경로
 */
export async function generateImageThumbnail(
  filePath: string,
  outputName: string
): Promise<string> {
  const thumbnailDir = getThumbnailDir();
  const thumbnailPath = path.join(thumbnailDir, `${outputName}.jpg`);

  try {
    await sharp(filePath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailPath;
  } catch (error) {
    console.error('[Thumbnail] Failed to generate image thumbnail:', error);
    throw new Error('썸네일 생성에 실패했습니다.');
  }
}

/**
 * 비디오 썸네일 생성
 * Note: FFmpeg가 시스템에 설치되어 있어야 합니다.
 * 개발 환경에서는 더미 썸네일을 생성합니다.
 *
 * @param filePath 원본 파일 경로
 * @param outputName 출력 파일명
 * @returns 썸네일 경로
 */
export async function generateVideoThumbnail(
  filePath: string,
  outputName: string
): Promise<string> {
  const thumbnailDir = getThumbnailDir();
  const thumbnailPath = path.join(thumbnailDir, `${outputName}.jpg`);

  try {
    // TODO: FFmpeg를 사용한 실제 비디오 썸네일 생성
    // 현재는 더미 이미지 생성
    // ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 output.jpg

    // 더미 썸네일 생성 (개발용)
    await sharp({
      create: {
        width: 300,
        height: 300,
        channels: 3,
        background: { r: 100, g: 100, b: 100 },
      },
    })
      .jpeg()
      .toFile(thumbnailPath);

    console.log(
      '[Thumbnail] Video thumbnail created (dummy). Install FFmpeg for real thumbnails.'
    );

    return thumbnailPath;
  } catch (error) {
    console.error('[Thumbnail] Failed to generate video thumbnail:', error);
    throw new Error('썸네일 생성에 실패했습니다.');
  }
}

/**
 * 썸네일 생성 (타입 자동 감지)
 */
export async function generateThumbnail(
  filePath: string,
  fileName: string,
  type: 'image' | 'video'
): Promise<string> {
  const baseName = path.parse(fileName).name;

  if (type === 'image') {
    return generateImageThumbnail(filePath, baseName);
  } else {
    return generateVideoThumbnail(filePath, baseName);
  }
}

/**
 * 썸네일 삭제
 */
export function deleteThumbnail(thumbnailPath: string): void {
  try {
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log('[Thumbnail] Deleted:', thumbnailPath);
    }
  } catch (error) {
    console.error('[Thumbnail] Failed to delete:', error);
  }
}
