/**
 * ImageViewer Component
 * 이미지 전체 화면 뷰어 (확대/축소 지원)
 * Requirements: 4 (갤러리 뷰)
 */

'use client';

import { useState, useEffect, TouchEvent } from 'react';
import Image from 'next/image';
import styles from './ImageViewer.module.css';

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageViewer({ src, alt = 'Image', onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  /**
   * ESC 키로 닫기
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * 확대
   */
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 3));
  };

  /**
   * 축소
   */
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  /**
   * 초기화
   */
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  /**
   * 터치 시작
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  /**
   * 터치 이동
   */
  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  /**
   * 터치 종료
   */
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        {/* 컨트롤 */}
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={handleZoomIn}
            aria-label="확대"
          >
            +
          </button>
          <button
            className={styles.controlButton}
            onClick={handleZoomOut}
            aria-label="축소"
          >
            −
          </button>
          <button
            className={styles.controlButton}
            onClick={handleReset}
            aria-label="초기화"
          >
            ↺
          </button>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {/* 이미지 */}
        <div
          className={styles.imageContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={styles.imageWrapper}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className={styles.image}
              priority
            />
          </div>
        </div>

        {/* 줌 레벨 표시 */}
        <div className={styles.zoomLevel}>
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}
