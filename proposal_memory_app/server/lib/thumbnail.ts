/**
 * Thumbnail Generation Utility
 * 썸네일 생성 유틸리티
 * Requirements: 2 (이미지 및 비디오 업로드)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 썸네일 생성 옵션
 */
export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * 기본 썸네일 옵션
 */
const DEFAULT_THUMBNAIL_OPTIONS: Required<ThumbnailOptions> = {
  width: 300,
  height: 300,
  quality: 80,
  format: 'jpeg',
};

/**
 * 썸네일 생성 결과
 */
export interface ThumbnailResult {
  path: string;
  width: number;
  height: number;
  size: number;
}

/**
 * 이미지 썸네일 생성 (Sharp 사용)
 * @param inputPath 입력 이미지 경로
 * @param outputPath 출력 썸네일 경로 (optional)
 * @param options 썸네일 옵션
 * @returns 썸네일 결과
 */
export async function generateImageThumbnail(
  inputPath: string,
  outputPath?: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const finalOptions = {
    ...DEFAULT_THUMBNAIL_OPTIONS,
    ...options,
  };

  // 출력 경로가 없으면 자동 생성
  if (!outputPath) {
    outputPath = generateThumbnailPath(inputPath, 'thumb');
  }

  // Sharp를 사용하여 썸네일 생성
  const sharpInstance = sharp(inputPath).resize(finalOptions.width, finalOptions.height, {
    fit: 'cover',
    position: 'center',
  });

  // 포맷 설정
  switch (finalOptions.format) {
    case 'jpeg':
      sharpInstance.jpeg({ quality: finalOptions.quality });
      break;
    case 'png':
      sharpInstance.png({ quality: finalOptions.quality });
      break;
    case 'webp':
      sharpInstance.webp({ quality: finalOptions.quality });
      break;
  }

  // 썸네일 저장
  await sharpInstance.toFile(outputPath);

  // 메타데이터 가져오기
  const metadata = await sharp(outputPath).metadata();
  const stats = await fs.stat(outputPath);

  return {
    path: outputPath,
    width: metadata.width || finalOptions.width,
    height: metadata.height || finalOptions.height,
    size: stats.size,
  };
}

/**
 * 비디오 썸네일 생성 (FFmpeg 사용)
 * @param inputPath 입력 비디오 경로
 * @param outputPath 출력 썸네일 경로 (optional)
 * @param options 썸네일 옵션
 * @returns 썸네일 결과
 */
export async function generateVideoThumbnail(
  inputPath: string,
  outputPath?: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const finalOptions = {
    ...DEFAULT_THUMBNAIL_OPTIONS,
    ...options,
  };

  // 출력 경로가 없으면 자동 생성
  if (!outputPath) {
    outputPath = generateThumbnailPath(inputPath, 'thumb', 'jpg');
  }

  // FFmpeg를 사용하여 비디오의 첫 프레임 추출
  // -ss: 시작 시간 (1초)
  // -i: 입력 파일
  // -vframes: 프레임 수 (1개만)
  // -vf: 비디오 필터 (스케일)
  const ffmpegCommand = `ffmpeg -ss 00:00:01 -i "${inputPath}" -vframes 1 -vf "scale=${finalOptions.width}:${finalOptions.height}:force_original_aspect_ratio=decrease,pad=${finalOptions.width}:${finalOptions.height}:(ow-iw)/2:(oh-ih)/2" -q:v ${Math.ceil((100 - finalOptions.quality) / 10)} "${outputPath}" -y`;

  try {
    await execAsync(ffmpegCommand);
  } catch (error) {
    throw new Error(`FFmpeg 실행 실패: ${error}`);
  }

  // 메타데이터 가져오기
  const stats = await fs.stat(outputPath);

  return {
    path: outputPath,
    width: finalOptions.width,
    height: finalOptions.height,
    size: stats.size,
  };
}

/**
 * 비디오 썸네일 생성 (특정 시간)
 * @param inputPath 입력 비디오 경로
 * @param timestamp 타임스탬프 (초)
 * @param outputPath 출력 썸네일 경로 (optional)
 * @param options 썸네일 옵션
 * @returns 썸네일 결과
 */
export async function generateVideoThumbnailAtTime(
  inputPath: string,
  timestamp: number,
  outputPath?: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const finalOptions = {
    ...DEFAULT_THUMBNAIL_OPTIONS,
    ...options,
  };

  if (!outputPath) {
    outputPath = generateThumbnailPath(inputPath, `thumb-${timestamp}`, 'jpg');
  }

  // 시간을 HH:MM:SS 형식으로 변환
  const time = formatTimestamp(timestamp);

  const ffmpegCommand = `ffmpeg -ss ${time} -i "${inputPath}" -vframes 1 -vf "scale=${finalOptions.width}:${finalOptions.height}:force_original_aspect_ratio=decrease,pad=${finalOptions.width}:${finalOptions.height}:(ow-iw)/2:(oh-ih)/2" -q:v ${Math.ceil((100 - finalOptions.quality) / 10)} "${outputPath}" -y`;

  try {
    await execAsync(ffmpegCommand);
  } catch (error) {
    throw new Error(`FFmpeg 실행 실패: ${error}`);
  }

  const stats = await fs.stat(outputPath);

  return {
    path: outputPath,
    width: finalOptions.width,
    height: finalOptions.height,
    size: stats.size,
  };
}

/**
 * 미디어 타입에 따라 자동으로 썸네일 생성
 * @param inputPath 입력 파일 경로
 * @param outputPath 출력 썸네일 경로 (optional)
 * @param options 썸네일 옵션
 * @returns 썸네일 결과
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath?: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult> {
  const ext = path.extname(inputPath).toLowerCase();

  // 이미지 확장자
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
  // 비디오 확장자
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];

  if (imageExtensions.includes(ext)) {
    return generateImageThumbnail(inputPath, outputPath, options);
  } else if (videoExtensions.includes(ext)) {
    return generateVideoThumbnail(inputPath, outputPath, options);
  } else {
    throw new Error(`지원하지 않는 파일 형식입니다: ${ext}`);
  }
}

/**
 * 썸네일 경로 생성
 * @param originalPath 원본 파일 경로
 * @param suffix 접미사 (예: 'thumb')
 * @param extension 파일 확장자 (optional)
 * @returns 썸네일 경로
 */
function generateThumbnailPath(
  originalPath: string,
  suffix: string,
  extension?: string
): string {
  const dir = path.dirname(originalPath);
  const ext = extension || path.extname(originalPath);
  const basename = path.basename(originalPath, path.extname(originalPath));

  return path.join(dir, `${basename}_${suffix}${ext}`);
}

/**
 * 타임스탬프를 HH:MM:SS 형식으로 변환
 * @param seconds 초
 * @returns HH:MM:SS 형식 문자열
 */
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 다중 썸네일 생성 (비디오)
 * @param inputPath 입력 비디오 경로
 * @param count 생성할 썸네일 개수
 * @param outputDir 출력 디렉토리
 * @param options 썸네일 옵션
 * @returns 썸네일 결과 배열
 */
export async function generateMultipleVideoThumbnails(
  inputPath: string,
  count: number,
  outputDir: string,
  options: ThumbnailOptions = {}
): Promise<ThumbnailResult[]> {
  // 비디오 길이 가져오기
  const duration = await getVideoDuration(inputPath);

  // 균등한 간격으로 타임스탬프 계산
  const interval = duration / (count + 1);
  const timestamps = Array.from({ length: count }, (_, i) => (i + 1) * interval);

  // 각 타임스탬프에서 썸네일 생성
  const results: ThumbnailResult[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const outputPath = path.join(
      outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}_thumb_${i + 1}.jpg`
    );

    const result = await generateVideoThumbnailAtTime(
      inputPath,
      timestamps[i],
      outputPath,
      options
    );

    results.push(result);
  }

  return results;
}

/**
 * 비디오 길이 가져오기 (초)
 * @param inputPath 비디오 경로
 * @returns 비디오 길이 (초)
 */
async function getVideoDuration(inputPath: string): Promise<number> {
  const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;

  try {
    const { stdout } = await execAsync(command);
    return parseFloat(stdout.trim());
  } catch (error) {
    throw new Error(`비디오 길이를 가져올 수 없습니다: ${error}`);
  }
}

/**
 * 썸네일 삭제
 * @param thumbnailPath 썸네일 경로
 */
export async function deleteThumbnail(thumbnailPath: string): Promise<void> {
  try {
    await fs.unlink(thumbnailPath);
  } catch (error) {
    // 파일이 없으면 무시
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * 이미지 메타데이터 가져오기
 * @param imagePath 이미지 경로
 * @returns 메타데이터
 */
export async function getImageMetadata(imagePath: string): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(imagePath).metadata();
  const stats = await fs.stat(imagePath);

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: stats.size,
  };
}
