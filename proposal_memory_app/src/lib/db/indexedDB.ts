/**
 * IndexedDB Wrapper
 * IndexedDB 래퍼 및 오프라인 데이터 관리
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

/**
 * IndexedDB 데이터베이스 이름 및 버전
 */
const DB_NAME = 'ProposalMemoryDB';
const DB_VERSION = 1;

/**
 * Object Store 이름
 */
export const STORES = {
  CACHED_MEDIA: 'cachedMedia',
  PENDING_UPLOADS: 'pendingUploads',
  DRAFTS: 'drafts',
  SETTINGS: 'settings',
} as const;

/**
 * 캐시된 미디어 아이템
 */
export interface CachedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number; // timestamp
  metadata?: Record<string, any>;
  cachedAt: number; // timestamp
}

/**
 * 보류 중인 업로드
 */
export interface PendingUpload {
  id: string;
  file: File;
  type: 'image' | 'video';
  status: 'pending' | 'uploading' | 'failed';
  progress: number; // 0-100
  retryCount: number;
  createdAt: number; // timestamp
  error?: string;
}

/**
 * 편지 초안
 */
export interface Draft {
  id: string;
  title: string;
  content: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  autoSaved: boolean;
}

/**
 * 설정
 */
export interface Settings {
  key: string;
  value: any;
  updatedAt: number; // timestamp
}

/**
 * IndexedDB 초기화
 * @returns Promise<IDBDatabase>
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // IndexedDB 지원 확인
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB를 지원하지 않는 브라우저입니다.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 데이터베이스 업그레이드 (최초 생성 또는 버전 변경)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // cachedMedia Object Store
      if (!db.objectStoreNames.contains(STORES.CACHED_MEDIA)) {
        const cachedMediaStore = db.createObjectStore(STORES.CACHED_MEDIA, {
          keyPath: 'id',
        });
        cachedMediaStore.createIndex('type', 'type', { unique: false });
        cachedMediaStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        cachedMediaStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // pendingUploads Object Store
      if (!db.objectStoreNames.contains(STORES.PENDING_UPLOADS)) {
        const pendingUploadsStore = db.createObjectStore(STORES.PENDING_UPLOADS, {
          keyPath: 'id',
        });
        pendingUploadsStore.createIndex('status', 'status', { unique: false });
        pendingUploadsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // drafts Object Store
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        const draftsStore = db.createObjectStore(STORES.DRAFTS, {
          keyPath: 'id',
        });
        draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        draftsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // settings Object Store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, {
          keyPath: 'key',
        });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(new Error(`IndexedDB 초기화 실패: ${(event.target as IDBOpenDBRequest).error}`));
    };
  });
}

/**
 * IndexedDB 래퍼 클래스
 */
export class IndexedDBWrapper {
  private db: IDBDatabase | null = null;

  /**
   * 데이터베이스 연결
   */
  async connect(): Promise<void> {
    if (this.db) {
      return;
    }
    this.db = await initDB();
  }

  /**
   * 데이터베이스 연결 확인
   */
  private ensureConnected(): void {
    if (!this.db) {
      throw new Error('데이터베이스가 연결되지 않았습니다. connect()를 먼저 호출하세요.');
    }
  }

  /**
   * 트랜잭션 가져오기
   */
  private getTransaction(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): IDBTransaction {
    this.ensureConnected();
    return this.db!.transaction([storeName], mode);
  }

  /**
   * Object Store 가져오기
   */
  private getStore(
    storeName: string,
    mode: IDBTransactionMode = 'readonly'
  ): IDBObjectStore {
    const transaction = this.getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 데이터 추가
   * @param storeName Object Store 이름
   * @param data 추가할 데이터
   * @returns Promise<string> 추가된 데이터의 키
   */
  async add<T>(storeName: string, data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.add(data);

        request.onsuccess = () => {
          resolve(request.result as string);
        };

        request.onerror = () => {
          reject(new Error(`데이터 추가 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 데이터 조회
   * @param storeName Object Store 이름
   * @param key 조회할 데이터의 키
   * @returns Promise<T | undefined> 조회된 데이터
   */
  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readonly');
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result as T | undefined);
        };

        request.onerror = () => {
          reject(new Error(`데이터 조회 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 데이터 업데이트 (put)
   * @param storeName Object Store 이름
   * @param data 업데이트할 데이터
   * @returns Promise<string> 업데이트된 데이터의 키
   */
  async update<T>(storeName: string, data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.put(data);

        request.onsuccess = () => {
          resolve(request.result as string);
        };

        request.onerror = () => {
          reject(new Error(`데이터 업데이트 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 데이터 삭제
   * @param storeName Object Store 이름
   * @param key 삭제할 데이터의 키
   * @returns Promise<void>
   */
  async delete(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`데이터 삭제 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 모든 데이터 조회
   * @param storeName Object Store 이름
   * @returns Promise<T[]> 모든 데이터 배열
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readonly');
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          reject(new Error(`전체 데이터 조회 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 인덱스로 데이터 조회
   * @param storeName Object Store 이름
   * @param indexName 인덱스 이름
   * @param value 인덱스 값
   * @returns Promise<T[]> 조회된 데이터 배열
   */
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readonly');
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => {
          resolve(request.result as T[]);
        };

        request.onerror = () => {
          reject(new Error(`인덱스 조회 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Object Store 전체 삭제 (clear)
   * @param storeName Object Store 이름
   * @returns Promise<void>
   */
  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error(`Store 초기화 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 데이터 개수 조회
   * @param storeName Object Store 이름
   * @returns Promise<number> 데이터 개수
   */
  async count(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readonly');
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error(`개수 조회 실패: ${request.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 데이터베이스 연결 종료
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * 기본 IndexedDB 인스턴스
 */
let defaultInstance: IndexedDBWrapper | null = null;

/**
 * 기본 IndexedDB 인스턴스 가져오기
 * @returns IndexedDBWrapper 인스턴스
 */
export async function getDB(): Promise<IndexedDBWrapper> {
  if (!defaultInstance) {
    defaultInstance = new IndexedDBWrapper();
    await defaultInstance.connect();
  }
  return defaultInstance;
}

/**
 * IndexedDB 데이터베이스 삭제
 * @returns Promise<void>
 */
export function deleteDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 기존 연결 종료
    if (defaultInstance) {
      defaultInstance.close();
      defaultInstance = null;
    }

    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`데이터베이스 삭제 실패: ${request.error}`));
    };

    request.onblocked = () => {
      reject(new Error('데이터베이스 삭제가 차단되었습니다. 모든 연결을 종료하세요.'));
    };
  });
}
