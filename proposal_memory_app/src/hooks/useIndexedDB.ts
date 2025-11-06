/**
 * useIndexedDB Hook
 * IndexedDB를 React에서 쉽게 사용하기 위한 훅
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

import { useState, useCallback, useEffect } from 'react';
import { getDB, IndexedDBWrapper, STORES } from '@/lib/db/indexedDB';

/**
 * IndexedDB 훅 상태
 */
export interface UseIndexedDBState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * IndexedDB 훅 반환 타입
 */
export interface UseIndexedDBReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  get: (key: string) => Promise<T | undefined>;
  add: (data: T) => Promise<string>;
  update: (data: T) => Promise<string>;
  remove: (key: string) => Promise<void>;
  getAll: () => Promise<T[]>;
  clear: () => Promise<void>;
}

/**
 * IndexedDB CRUD 훅
 * @param storeName Object Store 이름
 * @returns IndexedDB 작업 함수 및 상태
 */
export function useIndexedDB<T = any>(storeName: string): UseIndexedDBReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 데이터 조회
   */
  const get = useCallback(
    async (key: string): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const db = await getDB();
        const result = await db.get<T>(storeName, key);
        setData(result || null);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터 조회 실패';
        setError(errorMessage);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [storeName]
  );

  /**
   * 데이터 추가
   */
  const add = useCallback(
    async (newData: T): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const db = await getDB();
        const key = await db.add(storeName, newData);
        return key;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터 추가 실패';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeName]
  );

  /**
   * 데이터 업데이트
   */
  const update = useCallback(
    async (updatedData: T): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const db = await getDB();
        const key = await db.update(storeName, updatedData);
        return key;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터 업데이트 실패';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeName]
  );

  /**
   * 데이터 삭제
   */
  const remove = useCallback(
    async (key: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const db = await getDB();
        await db.delete(storeName, key);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '데이터 삭제 실패';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeName]
  );

  /**
   * 모든 데이터 조회
   */
  const getAll = useCallback(async (): Promise<T[]> => {
    setLoading(true);
    setError(null);

    try {
      const db = await getDB();
      const results = await db.getAll<T>(storeName);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '전체 데이터 조회 실패';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  /**
   * 스토어 전체 삭제
   */
  const clear = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const db = await getDB();
      await db.clear(storeName);
      setData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터 초기화 실패';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  return {
    data,
    loading,
    error,
    get,
    add,
    update,
    remove,
    getAll,
    clear,
  };
}

/**
 * 특정 키의 데이터를 자동으로 로드하는 훅
 * @param storeName Object Store 이름
 * @param key 조회할 키
 * @returns 데이터 및 상태
 */
export function useIndexedDBItem<T = any>(
  storeName: string,
  key: string | null
): UseIndexedDBState<T> & { reload: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!key) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = await getDB();
      const result = await db.get<T>(storeName, key);
      setData(result || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터 로드 실패';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [storeName, key]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
}

/**
 * 모든 데이터를 자동으로 로드하는 훅
 * @param storeName Object Store 이름
 * @returns 데이터 배열 및 상태
 */
export function useIndexedDBAll<T = any>(
  storeName: string
): UseIndexedDBState<T[]> & { reload: () => Promise<void> } {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const db = await getDB();
      const results = await db.getAll<T>(storeName);
      setData(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터 로드 실패';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
}
