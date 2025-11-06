/**
 * Media Routes
 * 미디어 관련 API 엔드포인트
 * Requirements: 2 (업로드), 3 (조회, 삭제)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import {
  upload,
  validateFileType,
  validateFileSize,
  getUploadDir,
} from '../utils/multer-config';
import { generateThumbnail } from '../utils/thumbnail';
import { asyncHandler, HttpError } from '../middleware/error-handler';
import { execute, query } from '../../src/lib/db/connection';
import { MediaRow } from '../../src/lib/db/types';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

const router = Router();

/**
 * POST /api/media/upload
 * 미디어 파일 업로드
 */
router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    // 파일 검증
    if (!req.file) {
      throw new HttpError(400, '파일이 제공되지 않았습니다.', 'VAL_003');
    }

    const file = req.file;

    // 파일 타입 검증
    const fileType = validateFileType(file.mimetype);
    if (!fileType) {
      // 업로드된 파일 삭제
      fs.unlinkSync(file.path);
      throw new HttpError(
        400,
        '지원하지 않는 파일 형식입니다.',
        'VAL_002'
      );
    }

    // 파일 크기 검증
    if (!validateFileSize(file.size, fileType)) {
      // 업로드된 파일 삭제
      fs.unlinkSync(file.path);
      const maxSize = fileType === 'image' ? '10MB' : '100MB';
      throw new HttpError(
        400,
        `파일 크기가 너무 큽니다. 최대 크기: ${maxSize}`,
        'VAL_001'
      );
    }

    try {
      // 썸네일 생성
      const thumbnailPath = await generateThumbnail(
        file.path,
        file.filename,
        fileType
      );

      // 데이터베이스에 저장
      const mediaId = uuidv4();
      const uploadDir = getUploadDir();

      // 상대 경로로 변환
      const relativePath = path.relative(process.cwd(), file.path);
      const relativeThumbnailPath = path.relative(
        process.cwd(),
        thumbnailPath
      );

      const sql = `
        INSERT INTO media (id, type, file_name, file_path, thumbnail_path, file_size, mime_type, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const metadata = JSON.stringify({
        originalName: file.originalname,
      });

      await execute(sql, [
        mediaId,
        fileType,
        file.filename,
        relativePath,
        relativeThumbnailPath,
        file.size,
        file.mimetype,
        metadata,
      ]);

      console.log(`[Media] Uploaded: ${file.filename} (${fileType})`);

      // 응답
      res.status(200).json({
        success: true,
        data: {
          id: mediaId,
          url: `/uploads/${file.filename}`,
          thumbnailUrl: `/uploads/thumbnails/${path.basename(thumbnailPath)}`,
          uploadedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      // 오류 발생 시 업로드된 파일 삭제
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  })
);

/**
 * GET /api/media
 * 미디어 목록 조회
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      type,
      limit = '20',
      offset = '0',
      sortBy = 'uploaded_at',
      sortOrder = 'desc',
    } = req.query;

    // 쿼리 빌드
    let sql = 'SELECT * FROM media';
    const params: any[] = [];

    // 타입 필터
    if (type && (type === 'image' || type === 'video')) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    // 정렬
    const allowedSortBy = ['uploaded_at', 'file_name', 'file_size'];
    const sortColumn = allowedSortBy.includes(sortBy as string)
      ? sortBy
      : 'uploaded_at';
    const sortDir =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';

    sql += ` ORDER BY ${sortColumn} ${sortDir.toUpperCase()}`;

    // 페이지네이션
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string, 10));
    params.push(parseInt(offset as string, 10));

    // 쿼리 실행
    const media = await query<MediaRow[]>(sql, params);

    // 총 개수 조회
    let countSql = 'SELECT COUNT(*) as total FROM media';
    const countParams: any[] = [];

    if (type && (type === 'image' || type === 'video')) {
      countSql += ' WHERE type = ?';
      countParams.push(type);
    }

    const [countResult] = await query<RowDataPacket[]>(countSql, countParams);
    const total = countResult.total;

    // 응답 데이터 변환
    const mediaData = media.map((m) => ({
      id: m.id,
      type: m.type,
      url: `/${m.file_path}`,
      thumbnailUrl: m.thumbnail_path ? `/${m.thumbnail_path}` : undefined,
      fileName: m.file_name,
      fileSize: m.file_size,
      mimeType: m.mime_type,
      uploadedAt: m.uploaded_at,
      metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
    }));

    res.json({
      success: true,
      data: {
        media: mediaData,
        total,
        hasMore: parseInt(offset as string, 10) + media.length < total,
      },
    });
  })
);

/**
 * GET /api/media/:id
 * 특정 미디어 조회
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM media WHERE id = ?';
    const media = await query<MediaRow[]>(sql, [id]);

    if (media.length === 0) {
      throw new HttpError(404, '미디어를 찾을 수 없습니다.', 'SRV_003');
    }

    const m = media[0];

    res.json({
      success: true,
      data: {
        id: m.id,
        type: m.type,
        url: `/${m.file_path}`,
        thumbnailUrl: m.thumbnail_path ? `/${m.thumbnail_path}` : undefined,
        fileName: m.file_name,
        fileSize: m.file_size,
        mimeType: m.mime_type,
        uploadedAt: m.uploaded_at,
        metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
      },
    });
  })
);

/**
 * DELETE /api/media/:id
 * 미디어 삭제
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // 미디어 정보 조회
    const selectSql = 'SELECT * FROM media WHERE id = ?';
    const media = await query<MediaRow[]>(selectSql, [id]);

    if (media.length === 0) {
      throw new HttpError(404, '미디어를 찾을 수 없습니다.', 'SRV_003');
    }

    const m = media[0];

    // 데이터베이스에서 삭제
    const deleteSql = 'DELETE FROM media WHERE id = ?';
    await execute(deleteSql, [id]);

    // 파일 삭제
    try {
      const filePath = path.resolve(process.cwd(), m.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      if (m.thumbnail_path) {
        const thumbnailPath = path.resolve(process.cwd(), m.thumbnail_path);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }
    } catch (error) {
      console.error('[Media] Failed to delete files:', error);
    }

    console.log(`[Media] Deleted: ${m.file_name}`);

    res.json({
      success: true,
      message: '미디어가 삭제되었습니다.',
    });
  })
);

export default router;
