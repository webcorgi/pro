/**
 * Database Type Definitions
 * 데이터베이스 관련 타입 정의
 */

import { RowDataPacket } from 'mysql2/promise';

/**
 * Media 테이블 타입
 */
export interface MediaRow extends RowDataPacket {
  id: string;
  type: 'image' | 'video';
  file_name: string;
  file_path: string;
  thumbnail_path: string | null;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
  metadata: string | null; // JSON string
}

/**
 * Letters 테이블 타입
 */
export interface LetterRow extends RowDataPacket {
  id: string;
  title: string;
  content: string;
  is_draft: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Location 테이블 타입
 */
export interface LocationRow extends RowDataPacket {
  id: string;
  latitude: number;
  longitude: number;
  place_name: string | null;
  memo: string | null;
  set_at: Date;
}

/**
 * Main Video 테이블 타입
 */
export interface MainVideoRow extends RowDataPacket {
  id: string;
  media_id: string;
  set_at: Date;
}

/**
 * Upload Queue 테이블 타입
 */
export interface UploadQueueRow extends RowDataPacket {
  id: string;
  file_name: string;
  file_data: Buffer;
  type: 'image' | 'video';
  status: 'pending' | 'processing' | 'failed';
  retry_count: number;
  created_at: Date;
  error_message: string | null;
}

/**
 * Schema Version 테이블 타입
 */
export interface SchemaVersionRow extends RowDataPacket {
  version: string;
  applied_at: Date;
  description: string | null;
}

/**
 * 데이터베이스 오류 타입
 */
export class DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;

  constructor(message: string, error?: any) {
    super(message);
    this.name = 'DatabaseError';

    if (error) {
      this.code = error.code;
      this.errno = error.errno;
      this.sqlState = error.sqlState;
      this.sqlMessage = error.sqlMessage;
    }
  }
}
