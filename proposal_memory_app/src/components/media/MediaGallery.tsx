/**
 * MediaGallery Component
 * 미디어 갤러리 (그리드 레이아웃)
 * Requirements: 2 (이미지 및 비디어 업로드), 4 (갤러리 뷰)
 */

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { MediaType } from '@/types/media';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './MediaGallery.module.css';

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

interface MediaGalleryProps {
  items: MediaItem[];
  loading?: boolean;
  onItemClick?: (item: MediaItem) => void;
  filterType?: MediaType | 'all';
}

export default function MediaGallery({
  items,
  loading = false,
  onItemClick,
  filterType = 'all'
}: MediaGalleryProps) {
  const [filter, setFilter] = useState<MediaType | 'all'>(filterType);

  /**
   * 필터링된 아이템
   */
  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }
    return items.filter(item => item.type === filter);
  }, [items, filter]);

  /**
   * 아이템 클릭 핸들러
   */
  const handleItemClick = (item: MediaItem) => {
    onItemClick?.(item);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <span className={styles.emptyIcon}>🖼️</span>
        <p className={styles.emptyText}>업로드된 미디어가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 필터 버튼 */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          전체 ({items.length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'image' ? styles.active : ''}`}
          onClick={() => setFilter('image')}
        >
          이미지 ({items.filter(i => i.type === 'image').length})
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'video' ? styles.active : ''}`}
          onClick={() => setFilter('video')}
        >
          비디오 ({items.filter(i => i.type === 'video').length})
        </button>
      </div>

      {/* 갤러리 그리드 */}
      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={styles.gridItem}
            onClick={() => handleItemClick(item)}
          >
            <div className={styles.mediaContainer}>
              {item.type === 'image' ? (
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt="Media thumbnail"
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className={styles.media}
                />
              ) : (
                <>
                  <video
                    src={item.url}
                    className={styles.media}
                    preload="metadata"
                  />
                  <div className={styles.videoOverlay}>
                    <span className={styles.playIcon}>▶️</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className={styles.emptyFilterContainer}>
          <p className={styles.emptyFilterText}>
            {filter === 'image' ? '이미지가' : '비디오가'} 없습니다
          </p>
        </div>
      )}
    </div>
  );
}
