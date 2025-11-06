/**
 * Image Compression Utility
 * 이미지 압축 유틸리티
 * Requirements: 7 (성능 최적화)
 */

/**
 * 이미지 압축 옵션
 */
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 범위 (0.1 = 10%, 1.0 = 100%)
  mimeType?: string; // 'image/jpeg', 'image/png', 'image/webp'
}

/**
 * 압축 결과
 */
export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // 압축률 (0-1)
  width: number;
  height: number;
}

/**
 * 기본 압축 옵션
 */
const DEFAULT_COMPRESSION_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  mimeType: 'image/jpeg',
};

/**
 * 이미지 파일 압축
 * @param file 압축할 이미지 파일
 * @param options 압축 옵션
 * @returns 압축된 이미지 파일과 메타데이터
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const finalOptions = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...options,
  };

  // 이미지 파일인지 확인
  if (!file.type.startsWith('image/')) {
    throw new Error('파일이 이미지가 아닙니다.');
  }

  // 이미지 로드
  const image = await loadImage(file);

  // 새로운 크기 계산
  const { width, height } = calculateNewDimensions(
    image.width,
    image.height,
    finalOptions.maxWidth,
    finalOptions.maxHeight
  );

  // Canvas를 사용하여 리사이즈 및 압축
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context를 생성할 수 없습니다.');
  }

  // 이미지 품질 설정
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 이미지 그리기
  ctx.drawImage(image, 0, 0, width, height);

  // Blob으로 변환
  const blob = await canvasToBlob(canvas, finalOptions.mimeType, finalOptions.quality);

  // File로 변환
  const compressedFile = new File(
    [blob],
    getCompressedFileName(file.name, finalOptions.mimeType),
    {
      type: finalOptions.mimeType,
      lastModified: Date.now(),
    }
  );

  // 결과 반환
  return {
    file: compressedFile,
    originalSize: file.size,
    compressedSize: compressedFile.size,
    compressionRatio: 1 - compressedFile.size / file.size,
    width,
    height,
  };
}

/**
 * 이미지 파일을 HTMLImageElement로 로드
 * @param file 이미지 파일
 * @returns HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    img.src = url;
  });
}

/**
 * 새로운 이미지 크기 계산 (비율 유지)
 * @param originalWidth 원본 너비
 * @param originalHeight 원본 높이
 * @param maxWidth 최대 너비
 * @param maxHeight 최대 높이
 * @returns 새로운 크기
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // 원본이 최대 크기보다 작으면 그대로 반환
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // 비율 계산
  const aspectRatio = width / height;

  // 너비 기준 리사이즈
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 높이 기준 리사이즈
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Canvas를 Blob으로 변환
 * @param canvas Canvas 엘리먼트
 * @param mimeType MIME 타입
 * @param quality 품질 (0-1)
 * @returns Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Blob 생성에 실패했습니다.'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * 압축된 파일 이름 생성
 * @param originalName 원본 파일 이름
 * @param mimeType MIME 타입
 * @returns 새로운 파일 이름
 */
function getCompressedFileName(originalName: string, mimeType: string): string {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
  const extension = mimeTypeToExtension(mimeType);
  return `${nameWithoutExt}${extension}`;
}

/**
 * MIME 타입을 파일 확장자로 변환
 * @param mimeType MIME 타입
 * @returns 파일 확장자
 */
function mimeTypeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] || '.jpg';
}

/**
 * 다중 이미지 압축
 * @param files 이미지 파일 배열
 * @param options 압축 옵션
 * @returns 압축 결과 배열
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (const file of files) {
    try {
      const result = await compressImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // 압축 실패 시 원본 파일 사용
      results.push({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 0,
        width: 0,
        height: 0,
      });
    }
  }

  return results;
}

/**
 * 자동 품질 조정 압축
 * @param file 이미지 파일
 * @param targetSize 목표 파일 크기 (bytes)
 * @param options 압축 옵션
 * @returns 압축 결과
 */
export async function compressToTargetSize(
  file: File,
  targetSize: number,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  let quality = options.quality || 0.85;
  let result: CompressionResult;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    result = await compressImage(file, { ...options, quality });

    if (result.compressedSize <= targetSize || attempts >= maxAttempts) {
      break;
    }

    // 품질 감소
    quality -= 0.1;
    attempts++;
  } while (quality > 0.1);

  return result;
}

/**
 * 이미지 리사이즈만 (압축 없이)
 * @param file 이미지 파일
 * @param maxWidth 최대 너비
 * @param maxHeight 최대 높이
 * @returns 리사이즈된 이미지 파일
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  const result = await compressImage(file, {
    maxWidth,
    maxHeight,
    quality: 1.0, // 최고 품질
    mimeType: file.type,
  });

  return result.file;
}

/**
 * 이미지 정보 가져오기
 * @param file 이미지 파일
 * @returns 이미지 메타데이터
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
}> {
  const image = await loadImage(file);

  return {
    width: image.width,
    height: image.height,
    size: file.size,
    type: file.type,
  };
}
