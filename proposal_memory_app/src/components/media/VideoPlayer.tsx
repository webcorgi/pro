/**
 * VideoPlayer Component
 * 비디오 플레이어 (커스텀 컨트롤)
 * Requirements: 2 (이미지 및 비디오 업로드), 4 (갤러리 뷰)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ src, poster, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  /**
   * 재생/일시정지 토글
   */
  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * 시간 업데이트
   */
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  /**
   * 메타데이터 로드
   */
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  /**
   * 시간 변경
   */
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  /**
   * 볼륨 변경
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  /**
   * 음소거 토글
   */
  const toggleMute = () => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);

    if (newMuted) {
      videoRef.current.volume = 0;
      setVolume(0);
    } else {
      videoRef.current.volume = volume || 1;
      setVolume(volume || 1);
    }
  };

  /**
   * 시간 포맷팅
   */
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * 전체화면 토글
   */
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  /**
   * ESC 키로 닫기
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.container}>
      <div
        className={styles.videoWrapper}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(isPlaying ? false : true)}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        />

        {/* 컨트롤 */}
        <div className={`${styles.controls} ${showControls ? styles.visible : ''}`}>
          {/* 진행 바 */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className={styles.progressBar}
          />

          <div className={styles.controlsBottom}>
            {/* 재생/일시정지 */}
            <button
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? '⏸' : '▶️'}
            </button>

            {/* 시간 */}
            <span className={styles.time}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className={styles.rightControls}>
              {/* 볼륨 */}
              <button
                className={styles.controlButton}
                onClick={toggleMute}
                aria-label={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeBar}
              />

              {/* 전체화면 */}
              <button
                className={styles.controlButton}
                onClick={toggleFullscreen}
                aria-label="전체화면"
              >
                ⛶
              </button>

              {/* 닫기 */}
              {onClose && (
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="닫기"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
