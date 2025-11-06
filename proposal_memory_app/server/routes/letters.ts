/**
 * Letter Routes
 * 편지 관련 API 엔드포인트
 * Requirements: 4 (프로포즈 편지 작성 및 관리)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, HttpError } from '../middleware/error-handler';
import { execute, query } from '../../src/lib/db/connection';
import { RowDataPacket } from 'mysql2/promise';

const router = Router();

/**
 * Letter Row Interface
 */
interface LetterRow extends RowDataPacket {
  id: string;
  title: string;
  content: string;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * POST /api/letters
 * 편지 생성
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { title, content, isDraft = true } = req.body;

    // 필수 필드 검증
    if (!title || title.trim().length === 0) {
      throw new HttpError(400, '제목은 필수 입력 항목입니다.', 'VAL_003');
    }

    if (!content || content.trim().length === 0) {
      throw new HttpError(400, '내용은 필수 입력 항목입니다.', 'VAL_003');
    }

    // 제목 길이 제한 (255자)
    if (title.length > 255) {
      throw new HttpError(400, '제목은 255자를 초과할 수 없습니다.', 'VAL_003');
    }

    const letterId = uuidv4();

    const sql = `
      INSERT INTO letters (id, title, content, is_draft)
      VALUES (?, ?, ?, ?)
    `;

    await execute(sql, [letterId, title, content, isDraft]);

    console.log(`[Letters] Created: ${title} (${isDraft ? 'draft' : 'published'})`);

    // 생성된 편지 조회
    const [letter] = await query<LetterRow[]>(
      'SELECT * FROM letters WHERE id = ?',
      [letterId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: letter.id,
        title: letter.title,
        content: letter.content,
        isDraft: letter.is_draft,
        createdAt: letter.created_at,
        updatedAt: letter.updated_at,
      },
    });
  })
);

/**
 * GET /api/letters
 * 편지 목록 조회
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      isDraft,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = '20',
      offset = '0',
    } = req.query;

    // 쿼리 빌드
    let sql = 'SELECT * FROM letters';
    const params: any[] = [];

    // isDraft 필터
    if (isDraft !== undefined) {
      const isDraftValue = isDraft === 'true' || isDraft === '1';
      sql += ' WHERE is_draft = ?';
      params.push(isDraftValue);
    }

    // 정렬
    const allowedSortBy = ['created_at', 'updated_at', 'title'];
    const sortColumn = allowedSortBy.includes(sortBy as string)
      ? sortBy
      : 'created_at';
    const sortDir =
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc';

    sql += ` ORDER BY ${sortColumn} ${sortDir.toUpperCase()}`;

    // 페이지네이션
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string, 10));
    params.push(parseInt(offset as string, 10));

    // 쿼리 실행
    const letters = await query<LetterRow[]>(sql, params);

    // 총 개수 조회
    let countSql = 'SELECT COUNT(*) as total FROM letters';
    const countParams: any[] = [];

    if (isDraft !== undefined) {
      const isDraftValue = isDraft === 'true' || isDraft === '1';
      countSql += ' WHERE is_draft = ?';
      countParams.push(isDraftValue);
    }

    const [countResult] = await query<RowDataPacket[]>(countSql, countParams);
    const total = countResult.total;

    // 응답 데이터 변환
    const lettersData = letters.map((l) => ({
      id: l.id,
      title: l.title,
      content: l.content,
      isDraft: l.is_draft,
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));

    res.json({
      success: true,
      data: {
        letters: lettersData,
        total,
        hasMore: parseInt(offset as string, 10) + letters.length < total,
      },
    });
  })
);

/**
 * GET /api/letters/:id
 * 특정 편지 조회
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const sql = 'SELECT * FROM letters WHERE id = ?';
    const letters = await query<LetterRow[]>(sql, [id]);

    if (letters.length === 0) {
      throw new HttpError(404, '편지를 찾을 수 없습니다.', 'SRV_003');
    }

    const letter = letters[0];

    res.json({
      success: true,
      data: {
        id: letter.id,
        title: letter.title,
        content: letter.content,
        isDraft: letter.is_draft,
        createdAt: letter.created_at,
        updatedAt: letter.updated_at,
      },
    });
  })
);

/**
 * PUT /api/letters/:id
 * 편지 수정
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, isDraft } = req.body;

    // 편지 존재 여부 확인
    const checkSql = 'SELECT id FROM letters WHERE id = ?';
    const existing = await query<LetterRow[]>(checkSql, [id]);

    if (existing.length === 0) {
      throw new HttpError(404, '편지를 찾을 수 없습니다.', 'SRV_003');
    }

    // 업데이트할 필드 수집
    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) {
      if (title.trim().length === 0) {
        throw new HttpError(400, '제목은 비워둘 수 없습니다.', 'VAL_003');
      }
      if (title.length > 255) {
        throw new HttpError(400, '제목은 255자를 초과할 수 없습니다.', 'VAL_003');
      }
      updates.push('title = ?');
      params.push(title);
    }

    if (content !== undefined) {
      if (content.trim().length === 0) {
        throw new HttpError(400, '내용은 비워둘 수 없습니다.', 'VAL_003');
      }
      updates.push('content = ?');
      params.push(content);
    }

    if (isDraft !== undefined) {
      updates.push('is_draft = ?');
      params.push(isDraft);
    }

    // 업데이트할 항목이 없으면 오류
    if (updates.length === 0) {
      throw new HttpError(400, '업데이트할 항목이 없습니다.', 'VAL_003');
    }

    // updated_at은 자동 업데이트되므로 명시적으로 추가할 필요 없음
    const updateSql = `UPDATE letters SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    await execute(updateSql, params);

    console.log(`[Letters] Updated: ${id}`);

    // 수정된 편지 조회
    const [letter] = await query<LetterRow[]>(
      'SELECT * FROM letters WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        id: letter.id,
        title: letter.title,
        content: letter.content,
        isDraft: letter.is_draft,
        createdAt: letter.created_at,
        updatedAt: letter.updated_at,
      },
    });
  })
);

/**
 * DELETE /api/letters/:id
 * 편지 삭제
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // 편지 존재 여부 확인
    const checkSql = 'SELECT id, title FROM letters WHERE id = ?';
    const letters = await query<LetterRow[]>(checkSql, [id]);

    if (letters.length === 0) {
      throw new HttpError(404, '편지를 찾을 수 없습니다.', 'SRV_003');
    }

    const letter = letters[0];

    // 편지 삭제
    const deleteSql = 'DELETE FROM letters WHERE id = ?';
    await execute(deleteSql, [id]);

    console.log(`[Letters] Deleted: ${letter.title}`);

    res.json({
      success: true,
      message: '편지가 삭제되었습니다.',
    });
  })
);

/**
 * GET /api/letters/stats
 * 편지 통계 조회
 */
router.get(
  '/stats',
  asyncHandler(async (req: Request, res: Response) => {
    // 총 편지 수, 임시 저장 수, 발행된 편지 수
    const statsSql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_draft = TRUE THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN is_draft = FALSE THEN 1 ELSE 0 END) as published,
        SUM(LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) + 1) as totalWords
      FROM letters
    `;

    const [stats] = await query<RowDataPacket[]>(statsSql);

    res.json({
      success: true,
      data: {
        totalLetters: stats.total || 0,
        draftLetters: stats.drafts || 0,
        publishedLetters: stats.published || 0,
        totalWords: stats.totalWords || 0,
      },
    });
  })
);

export default router;
