/**
 * BottomNav Component
 * 하단 네비게이션 바
 * Requirements: 3 (사용자 인터페이스)
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import styles from './BottomNav.module.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '홈', icon: '🏠' },
  { path: '/upload', label: '업로드', icon: '📤' },
  { path: '/gallery', label: '갤러리', icon: '🖼️' },
  { path: '/letter', label: '편지', icon: '💌' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * 네비게이션 아이템 클릭 핸들러
   */
  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
            onClick={() => handleNavClick(item.path)}
            aria-label={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
