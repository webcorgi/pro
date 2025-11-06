/**
 * Letter Routes Unit Tests
 * 편지 API 엔드포인트 단위 테스트
 */

import request from 'supertest';
import express, { Application } from 'express';
import letterRoutes from '../letters';
import * as db from '../../../src/lib/db/connection';
import { errorHandler } from '../../middleware/error-handler';

// Mock dependencies
jest.mock('../../../src/lib/db/connection');

describe('Letter Routes', () => {
  let app: Application;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use('/api/letters', letterRoutes);
    app.use(errorHandler);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('POST /api/letters', () => {
    it('should create a new letter', async () => {
      const newLetter = {
        title: 'My Letter',
        content: 'Dear love of my life...',
        isDraft: true,
      };

      const mockLetterRow = {
        id: '123',
        title: newLetter.title,
        content: newLetter.content,
        is_draft: newLetter.isDraft,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock).mockResolvedValue([mockLetterRow]);

      const response = await request(app)
        .post('/api/letters')
        .send(newLetter);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newLetter.title);
      expect(response.body.data.content).toBe(newLetter.content);
      expect(response.body.data.isDraft).toBe(newLetter.isDraft);
      expect(db.execute).toHaveBeenCalled();
    });

    it('should create letter with default isDraft=true', async () => {
      const newLetter = {
        title: 'My Letter',
        content: 'Content here',
      };

      const mockLetterRow = {
        id: '123',
        title: newLetter.title,
        content: newLetter.content,
        is_draft: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock).mockResolvedValue([mockLetterRow]);

      const response = await request(app)
        .post('/api/letters')
        .send(newLetter);

      expect(response.status).toBe(201);
      expect(response.body.data.isDraft).toBe(true);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/letters')
        .send({ content: 'Content only' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/api/letters')
        .send({ title: 'Title only' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if title is empty string', async () => {
      const response = await request(app)
        .post('/api/letters')
        .send({ title: '   ', content: 'Content' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);

      const response = await request(app)
        .post('/api/letters')
        .send({ title: longTitle, content: 'Content' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('255자');
    });
  });

  describe('GET /api/letters', () => {
    it('should return list of letters', async () => {
      const mockLetters = [
        {
          id: '1',
          title: 'Letter 1',
          content: 'Content 1',
          is_draft: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: '2',
          title: 'Letter 2',
          content: 'Content 2',
          is_draft: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      (db.query as jest.Mock)
        .mockResolvedValueOnce(mockLetters)
        .mockResolvedValueOnce([{ total: 2 }]);

      const response = await request(app).get('/api/letters');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.letters).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.hasMore).toBe(false);
    });

    it('should filter by isDraft', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      const response = await request(app)
        .get('/api/letters')
        .query({ isDraft: 'true' });

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE is_draft = ?'),
        expect.arrayContaining([true])
      );
    });

    it('should support sorting by title', async () => {
      (db.query as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }]);

      const response = await request(app)
        .get('/api/letters')
        .query({ sortBy: 'title', sortOrder: 'asc' });

      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY title ASC'),
        expect.any(Array)
      );
    });

    it('should support pagination', async () => {
      const mockLetters = Array(10).fill({
        id: '1',
        title: 'Letter',
        content: 'Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      (db.query as jest.Mock)
        .mockResolvedValueOnce(mockLetters)
        .mockResolvedValueOnce([{ total: 25 }]);

      const response = await request(app)
        .get('/api/letters')
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.data.hasMore).toBe(true);
    });
  });

  describe('GET /api/letters/:id', () => {
    it('should return letter by id', async () => {
      const mockLetter = {
        id: '123',
        title: 'My Letter',
        content: 'Content here',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.query as jest.Mock).mockResolvedValue([mockLetter]);

      const response = await request(app).get('/api/letters/123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('123');
      expect(response.body.data.title).toBe('My Letter');
    });

    it('should return 404 if letter not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/letters/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/letters/:id', () => {
    beforeEach(() => {
      // Mock letter exists check
      (db.query as jest.Mock).mockResolvedValue([{ id: '123' }]);
    });

    it('should update letter title', async () => {
      const mockUpdatedLetter = {
        id: '123',
        title: 'Updated Title',
        content: 'Original Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock)
        .mockResolvedValueOnce([{ id: '123' }]) // exists check
        .mockResolvedValueOnce([mockUpdatedLetter]); // fetch after update

      const response = await request(app)
        .put('/api/letters/123')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE letters'),
        expect.any(Array)
      );
    });

    it('should update letter content', async () => {
      const mockUpdatedLetter = {
        id: '123',
        title: 'Original Title',
        content: 'Updated Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock)
        .mockResolvedValueOnce([{ id: '123' }])
        .mockResolvedValueOnce([mockUpdatedLetter]);

      const response = await request(app)
        .put('/api/letters/123')
        .send({ content: 'Updated Content' });

      expect(response.status).toBe(200);
      expect(response.body.data.content).toBe('Updated Content');
    });

    it('should update isDraft status', async () => {
      const mockUpdatedLetter = {
        id: '123',
        title: 'Title',
        content: 'Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock)
        .mockResolvedValueOnce([{ id: '123' }])
        .mockResolvedValueOnce([mockUpdatedLetter]);

      const response = await request(app)
        .put('/api/letters/123')
        .send({ isDraft: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isDraft).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      const mockUpdatedLetter = {
        id: '123',
        title: 'New Title',
        content: 'New Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
      (db.query as jest.Mock)
        .mockResolvedValueOnce([{ id: '123' }])
        .mockResolvedValueOnce([mockUpdatedLetter]);

      const response = await request(app)
        .put('/api/letters/123')
        .send({
          title: 'New Title',
          content: 'New Content',
          isDraft: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('New Title');
      expect(response.body.data.content).toBe('New Content');
      expect(response.body.data.isDraft).toBe(false);
    });

    it('should return 404 if letter not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .put('/api/letters/999')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(db.execute).not.toHaveBeenCalled();
    });

    it('should return 400 if no update fields provided', async () => {
      const response = await request(app)
        .put('/api/letters/123')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('업데이트할 항목이 없습니다');
    });

    it('should return 400 if title is empty string', async () => {
      const response = await request(app)
        .put('/api/letters/123')
        .send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('비워둘 수 없습니다');
    });

    it('should return 400 if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);

      const response = await request(app)
        .put('/api/letters/123')
        .send({ title: longTitle });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('255자');
    });
  });

  describe('DELETE /api/letters/:id', () => {
    it('should delete letter successfully', async () => {
      const mockLetter = {
        id: '123',
        title: 'My Letter',
        content: 'Content',
        is_draft: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (db.query as jest.Mock).mockResolvedValue([mockLetter]);
      (db.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app).delete('/api/letters/123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('삭제');
      expect(db.execute).toHaveBeenCalledWith(
        'DELETE FROM letters WHERE id = ?',
        ['123']
      );
    });

    it('should return 404 if letter not found', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);

      const response = await request(app).delete('/api/letters/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(db.execute).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/letters/stats', () => {
    it('should return letter statistics', async () => {
      const mockStats = {
        total: 10,
        drafts: 3,
        published: 7,
        totalWords: 1500,
      };

      (db.query as jest.Mock).mockResolvedValue([mockStats]);

      const response = await request(app).get('/api/letters/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLetters).toBe(10);
      expect(response.body.data.draftLetters).toBe(3);
      expect(response.body.data.publishedLetters).toBe(7);
      expect(response.body.data.totalWords).toBe(1500);
    });

    it('should return zeros if no letters exist', async () => {
      const mockStats = {
        total: 0,
        drafts: null,
        published: null,
        totalWords: null,
      };

      (db.query as jest.Mock).mockResolvedValue([mockStats]);

      const response = await request(app).get('/api/letters/stats');

      expect(response.status).toBe(200);
      expect(response.body.data.totalLetters).toBe(0);
      expect(response.body.data.draftLetters).toBe(0);
      expect(response.body.data.publishedLetters).toBe(0);
      expect(response.body.data.totalWords).toBe(0);
    });
  });
});
