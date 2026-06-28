'use client';

import type { TabName } from '@/types';
import { cn } from '@/lib/utils';
import { HeartIcon, HomeIcon, LibraryIcon, SearchIcon, SettingsIcon } from '@/components/icons';
import styles from './BottomNav.module.css';

const items = [
  { id: 'home', label: 'Beranda', icon: HomeIcon },
  { id: 'search', label: 'Cari', icon: SearchIcon },
  { id: 'library', label: 'Library', icon: LibraryIcon },
  { id: 'favorites', label: 'Favorit', icon: HeartIcon },
  { id: 'settings', label: 'Setelan', icon: SettingsIcon },
] as const;

interface BottomNavProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  withMiniplayer?: boolean;
}

export const BottomNav = ({ activeTab, onTabChange, withMiniplayer }: BottomNavProps) => (
  <nav className={cn(styles.navbar, withMiniplayer && styles.withMiniplayer)}>
    {items.map((item) => {
      const active = activeTab === item.id;
      const Icon = item.icon;
      return (
        <button key={item.id} className={cn(styles.navItem, active && styles.active)} onClick={() => onTabChange(item.id)}>
          <Icon />
          <span className={styles.navLabel}>{item.label}</span>
          {active ? <span className={styles.activeDot} /> : null}
        </button>
      );
    })}
  </nav>
);
