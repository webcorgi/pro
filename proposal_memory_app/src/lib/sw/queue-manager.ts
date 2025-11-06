/**
 * Offline Upload Queue Manager
 * 오프라인 업로드 큐 관리자
 * Requirements: 1 (PWA 및 오프라인 지원)
 */

import { getDB, STORES, PendingUpload } from '../db/indexedDB';
import { retryWithBackoff } from '../retry';
import { v4 as uuidv4 } from 'uuid';

/**
 * 업로드 진행 콜백 타입
 */
export type UploadProgressCallback = (upload: PendingUpload) => void;

/**
 * 큐 매니저 클래스
 */
export class QueueManager {
  private static instance: QueueManager;
  private isProcessing = false;
  private progressCallbacks: UploadProgressCallback[] = [];
  private onlineListener: (() => void) | null = null;

  /**
   * 싱글톤 인스턴스 가져오기
   */
  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  /**
   * 초기화 (온라인 이벤트 리스너 등록)
   */
  public init(): void {
    // 이미 초기화되어 있으면 무시
    if (this.onlineListener) {
      return;
    }

    // 온라인 복귀 시 큐 처리
    this.onlineListener = () => {
      console.log('[QueueManager] 온라인 복귀, 큐 처리 시작');
      this.processQueue();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineListener);
    }
  }

  /**
   * 정리 (이벤트 리스너 제거)
   */
  public cleanup(): void {
    if (this.onlineListener && typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = null;
    }
  }

  /**
   * 진행 상태 콜백 등록
   */
  public onProgress(callback: UploadProgressCallback): () => void {
    this.progressCallbacks.push(callback);

    // unsubscribe 함수 반환
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 큐에 업로드 추가
   * @param file 업로드할 파일
   * @param type 미디어 타입
   * @returns 업로드 ID
   */
  public async addToQueue(
    file: File,
    type: 'image' | 'video'
  ): Promise<string> {
    const db = await getDB();

    const upload: PendingUpload = {
      id: uuidv4(),
      file,
      type,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      createdAt: Date.now(),
    };

    await db.add(STORES.PENDING_UPLOADS, upload);
    console.log(`[QueueManager] 업로드 큐에 추가: ${upload.id}`);

    // 온라인 상태면 즉시 처리 시도
    if (navigator.onLine) {
      this.processQueue();
    }

    return upload.id;
  }

  /**
   * 큐 처리 (업로드 시도)
   */
  public async processQueue(): Promise<void> {
    // 이미 처리 중이면 무시
    if (this.isProcessing) {
      console.log('[QueueManager] 이미 큐를 처리 중입니다.');
      return;
    }

    // 오프라인이면 처리하지 않음
    if (!navigator.onLine) {
      console.log('[QueueManager] 오프라인 상태, 큐 처리 중단');
      return;
    }

    this.isProcessing = true;

    try {
      const db = await getDB();
      const pendingUploads = await db.getByIndex<PendingUpload>(
        STORES.PENDING_UPLOADS,
        'status',
        'pending'
      );

      console.log(`[QueueManager] 처리할 업로드 ${pendingUploads.length}개`);

      for (const upload of pendingUploads) {
        try {
          await this.processUpload(upload);
        } catch (error) {
          console.error(`[QueueManager] 업로드 실패: ${upload.id}`, error);
        }
      }
    } catch (error) {
      console.error('[QueueManager] 큐 처리 중 오류:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 개별 업로드 처리
   * @param upload 처리할 업로드
   */
  private async processUpload(upload: PendingUpload): Promise<void> {
    const db = await getDB();

    // 상태 업데이트: uploading
    upload.status = 'uploading';
    await db.update(STORES.PENDING_UPLOADS, upload);
    this.notifyProgress(upload);

    try {
      // 재시도 로직을 사용하여 업로드
      const response = await retryWithBackoff(
        async () => {
          return await this.uploadFile(upload);
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffFactor: 2,
        }
      );

      if (response.ok) {
        // 업로드 성공, 큐에서 제거
        await db.delete(STORES.PENDING_UPLOADS, upload.id);
        console.log(`[QueueManager] 업로드 성공: ${upload.id}`);

        // 성공 콜백
        upload.status = 'pending'; // 완료 상태로 표시
        upload.progress = 100;
        this.notifyProgress(upload);
      } else {
        throw new Error(`업로드 실패: ${response.status}`);
      }
    } catch (error) {
      // 업로드 실패
      upload.status = 'failed';
      upload.retryCount++;
      upload.error = error instanceof Error ? error.message : '알 수 없는 오류';

      await db.update(STORES.PENDING_UPLOADS, upload);
      this.notifyProgress(upload);

      console.error(`[QueueManager] 업로드 최종 실패: ${upload.id}`, error);

      // 재시도 횟수가 5회를 초과하면 큐에서 제거
      if (upload.retryCount >= 5) {
        await db.delete(STORES.PENDING_UPLOADS, upload.id);
        console.log(`[QueueManager] 재시도 횟수 초과로 큐에서 제거: ${upload.id}`);
      }
    }
  }

  /**
   * 파일 업로드 (실제 API 호출)
   * @param upload 업로드 데이터
   * @returns Response
   */
  private async uploadFile(upload: PendingUpload): Promise<Response> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('type', upload.type);

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    });

    return response;
  }

  /**
   * 진행 상태 알림
   * @param upload 업로드 데이터
   */
  private notifyProgress(upload: PendingUpload): void {
    for (const callback of this.progressCallbacks) {
      try {
        callback(upload);
      } catch (error) {
        console.error('[QueueManager] 진행 상태 콜백 오류:', error);
      }
    }
  }

  /**
   * 특정 업로드 재시도
   * @param uploadId 업로드 ID
   */
  public async retryUpload(uploadId: string): Promise<void> {
    const db = await getDB();
    const upload = await db.get<PendingUpload>(STORES.PENDING_UPLOADS, uploadId);

    if (!upload) {
      throw new Error(`업로드를 찾을 수 없습니다: ${uploadId}`);
    }

    // 상태를 pending으로 변경
    upload.status = 'pending';
    upload.error = undefined;
    await db.update(STORES.PENDING_UPLOADS, upload);

    // 큐 처리
    this.processQueue();
  }

  /**
   * 특정 업로드 취소 (큐에서 제거)
   * @param uploadId 업로드 ID
   */
  public async cancelUpload(uploadId: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORES.PENDING_UPLOADS, uploadId);
    console.log(`[QueueManager] 업로드 취소: ${uploadId}`);
  }

  /**
   * 모든 대기 중인 업로드 조회
   * @returns 대기 중인 업로드 배열
   */
  public async getPendingUploads(): Promise<PendingUpload[]> {
    const db = await getDB();
    return await db.getAll<PendingUpload>(STORES.PENDING_UPLOADS);
  }

  /**
   * 실패한 업로드만 조회
   * @returns 실패한 업로드 배열
   */
  public async getFailedUploads(): Promise<PendingUpload[]> {
    const db = await getDB();
    return await db.getByIndex<PendingUpload>(
      STORES.PENDING_UPLOADS,
      'status',
      'failed'
    );
  }

  /**
   * 모든 업로드 재시도
   */
  public async retryAllFailed(): Promise<void> {
    const failedUploads = await this.getFailedUploads();

    for (const upload of failedUploads) {
      upload.status = 'pending';
      upload.error = undefined;

      const db = await getDB();
      await db.update(STORES.PENDING_UPLOADS, upload);
    }

    this.processQueue();
  }

  /**
   * 큐 초기화 (모든 업로드 제거)
   */
  public async clearQueue(): Promise<void> {
    const db = await getDB();
    await db.clear(STORES.PENDING_UPLOADS);
    console.log('[QueueManager] 큐 초기화 완료');
  }

  /**
   * 큐 상태 확인
   * @returns 큐 상태 정보
   */
  public async getQueueStatus(): Promise<{
    total: number;
    pending: number;
    uploading: number;
    failed: number;
  }> {
    const db = await getDB();
    const allUploads = await db.getAll<PendingUpload>(STORES.PENDING_UPLOADS);

    return {
      total: allUploads.length,
      pending: allUploads.filter((u) => u.status === 'pending').length,
      uploading: allUploads.filter((u) => u.status === 'uploading').length,
      failed: allUploads.filter((u) => u.status === 'failed').length,
    };
  }
}

/**
 * 기본 인스턴스 export
 */
export const queueManager = QueueManager.getInstance();

/**
 * 초기화 헬퍼 함수
 */
export function initQueueManager(): void {
  queueManager.init();
}
