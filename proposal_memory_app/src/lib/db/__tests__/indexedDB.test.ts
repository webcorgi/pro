/**
 * IndexedDB Unit Tests
 * IndexedDB 래퍼 테스트
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

import 'fake-indexeddb/auto';
import {
  IndexedDBWrapper,
  initDB,
  getDB,
  deleteDB,
  STORES,
  CachedMedia,
  PendingUpload,
  Draft,
  Settings,
} from '../indexedDB';

describe('IndexedDB Wrapper', () => {
  let db: IndexedDBWrapper;

  beforeEach(async () => {
    // 각 테스트 전에 새로운 데이터베이스 생성
    db = new IndexedDBWrapper();
    await db.connect();
  });

  afterEach(async () => {
    // 각 테스트 후 데이터베이스 정리
    db.close();
    await deleteDB();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const database = await initDB();
      expect(database).toBeDefined();
      expect(database.name).toBe('ProposalMemoryDB');
      database.close();
    });

    it('should create all required object stores', async () => {
      const database = await initDB();
      expect(database.objectStoreNames.contains(STORES.CACHED_MEDIA)).toBe(true);
      expect(database.objectStoreNames.contains(STORES.PENDING_UPLOADS)).toBe(true);
      expect(database.objectStoreNames.contains(STORES.DRAFTS)).toBe(true);
      expect(database.objectStoreNames.contains(STORES.SETTINGS)).toBe(true);
      database.close();
    });
  });

  describe('CRUD Operations', () => {
    describe('add()', () => {
      it('should add data to store', async () => {
        const testMedia: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        const result = await db.add(STORES.CACHED_MEDIA, testMedia);
        expect(result).toBe('test-1');
      });

      it('should throw error when adding duplicate key', async () => {
        const testMedia: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, testMedia);

        await expect(db.add(STORES.CACHED_MEDIA, testMedia)).rejects.toThrow();
      });
    });

    describe('get()', () => {
      it('should retrieve data by key', async () => {
        const testMedia: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, testMedia);
        const result = await db.get<CachedMedia>(STORES.CACHED_MEDIA, 'test-1');

        expect(result).toBeDefined();
        expect(result?.id).toBe('test-1');
        expect(result?.fileName).toBe('test.jpg');
      });

      it('should return undefined for non-existent key', async () => {
        const result = await db.get<CachedMedia>(STORES.CACHED_MEDIA, 'non-existent');
        expect(result).toBeUndefined();
      });
    });

    describe('update()', () => {
      it('should update existing data', async () => {
        const testDraft: Draft = {
          id: 'draft-1',
          title: 'Original Title',
          content: 'Original Content',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          autoSaved: false,
        };

        await db.add(STORES.DRAFTS, testDraft);

        const updatedDraft: Draft = {
          ...testDraft,
          title: 'Updated Title',
          content: 'Updated Content',
          updatedAt: Date.now(),
        };

        await db.update(STORES.DRAFTS, updatedDraft);
        const result = await db.get<Draft>(STORES.DRAFTS, 'draft-1');

        expect(result?.title).toBe('Updated Title');
        expect(result?.content).toBe('Updated Content');
      });

      it('should insert data if key does not exist', async () => {
        const testDraft: Draft = {
          id: 'draft-1',
          title: 'New Draft',
          content: 'New Content',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          autoSaved: false,
        };

        await db.update(STORES.DRAFTS, testDraft);
        const result = await db.get<Draft>(STORES.DRAFTS, 'draft-1');

        expect(result).toBeDefined();
        expect(result?.title).toBe('New Draft');
      });
    });

    describe('delete()', () => {
      it('should delete data by key', async () => {
        const testMedia: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image.jpg',
          fileName: 'test.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, testMedia);
        await db.delete(STORES.CACHED_MEDIA, 'test-1');
        const result = await db.get<CachedMedia>(STORES.CACHED_MEDIA, 'test-1');

        expect(result).toBeUndefined();
      });

      it('should not throw error when deleting non-existent key', async () => {
        await expect(db.delete(STORES.CACHED_MEDIA, 'non-existent')).resolves.not.toThrow();
      });
    });

    describe('getAll()', () => {
      it('should retrieve all data from store', async () => {
        const media1: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image1.jpg',
          fileName: 'test1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        const media2: CachedMedia = {
          id: 'test-2',
          type: 'video',
          url: 'https://example.com/video1.mp4',
          fileName: 'test1.mp4',
          fileSize: 2048,
          mimeType: 'video/mp4',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, media1);
        await db.add(STORES.CACHED_MEDIA, media2);

        const results = await db.getAll<CachedMedia>(STORES.CACHED_MEDIA);

        expect(results).toHaveLength(2);
        expect(results.find((m) => m.id === 'test-1')).toBeDefined();
        expect(results.find((m) => m.id === 'test-2')).toBeDefined();
      });

      it('should return empty array for empty store', async () => {
        const results = await db.getAll<CachedMedia>(STORES.CACHED_MEDIA);
        expect(results).toEqual([]);
      });
    });

    describe('getByIndex()', () => {
      it('should retrieve data by index', async () => {
        const media1: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image1.jpg',
          fileName: 'test1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        const media2: CachedMedia = {
          id: 'test-2',
          type: 'video',
          url: 'https://example.com/video1.mp4',
          fileName: 'test1.mp4',
          fileSize: 2048,
          mimeType: 'video/mp4',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, media1);
        await db.add(STORES.CACHED_MEDIA, media2);

        const images = await db.getByIndex<CachedMedia>(STORES.CACHED_MEDIA, 'type', 'image');

        expect(images).toHaveLength(1);
        expect(images[0].type).toBe('image');
      });
    });

    describe('clear()', () => {
      it('should clear all data from store', async () => {
        const media1: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image1.jpg',
          fileName: 'test1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        const media2: CachedMedia = {
          id: 'test-2',
          type: 'video',
          url: 'https://example.com/video1.mp4',
          fileName: 'test1.mp4',
          fileSize: 2048,
          mimeType: 'video/mp4',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, media1);
        await db.add(STORES.CACHED_MEDIA, media2);

        await db.clear(STORES.CACHED_MEDIA);

        const results = await db.getAll<CachedMedia>(STORES.CACHED_MEDIA);
        expect(results).toHaveLength(0);
      });
    });

    describe('count()', () => {
      it('should return count of items in store', async () => {
        const media1: CachedMedia = {
          id: 'test-1',
          type: 'image',
          url: 'https://example.com/image1.jpg',
          fileName: 'test1.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        const media2: CachedMedia = {
          id: 'test-2',
          type: 'video',
          url: 'https://example.com/video1.mp4',
          fileName: 'test1.mp4',
          fileSize: 2048,
          mimeType: 'video/mp4',
          uploadedAt: Date.now(),
          cachedAt: Date.now(),
        };

        await db.add(STORES.CACHED_MEDIA, media1);
        await db.add(STORES.CACHED_MEDIA, media2);

        const count = await db.count(STORES.CACHED_MEDIA);
        expect(count).toBe(2);
      });

      it('should return 0 for empty store', async () => {
        const count = await db.count(STORES.CACHED_MEDIA);
        expect(count).toBe(0);
      });
    });
  });

  describe('Different Store Types', () => {
    it('should work with PendingUpload store', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const upload: PendingUpload = {
        id: 'upload-1',
        file: mockFile,
        type: 'image',
        status: 'pending',
        progress: 0,
        retryCount: 0,
        createdAt: Date.now(),
      };

      await db.add(STORES.PENDING_UPLOADS, upload);
      const result = await db.get<PendingUpload>(STORES.PENDING_UPLOADS, 'upload-1');

      expect(result).toBeDefined();
      expect(result?.status).toBe('pending');
    });

    it('should work with Settings store', async () => {
      const setting: Settings = {
        key: 'theme',
        value: 'dark',
        updatedAt: Date.now(),
      };

      await db.add(STORES.SETTINGS, setting);
      const result = await db.get<Settings>(STORES.SETTINGS, 'theme');

      expect(result).toBeDefined();
      expect(result?.value).toBe('dark');
    });
  });

  describe('getDB() helper', () => {
    it('should return singleton instance', async () => {
      const instance1 = await getDB();
      const instance2 = await getDB();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when operating on disconnected database', async () => {
      const disconnectedDB = new IndexedDBWrapper();

      await expect(disconnectedDB.add(STORES.CACHED_MEDIA, { id: 'test' })).rejects.toThrow(
        '데이터베이스가 연결되지 않았습니다'
      );
    });
  });
});
