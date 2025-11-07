/**
 * Header Component
 * 앱 상단 헤더
 * Requirements: 3 (사용자 인터페이스)
 */

'use client';

import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();

  /**
   * 현재 경로에 따른 페이지 제목 반환
   */
  const getTitle = () => {
    if (pathname === '/') return '홈';
    if (pathname === '/upload') return '업로드';
    if (pathname === '/gallery') return '갤러리';
    if (pathname === '/letter') return '편지';
    if (pathname === '/settings') return '설정';
    return 'Proposal Memory';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>{getTitle()}</h1>
      </div>
    </header>
  );
}
