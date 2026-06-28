'use client';

import { useEffect, useState } from 'react';
import type { Song } from '@/types';
import { clearHistory, getHistory, getLikedSongs } from '@/lib/storage';
import { SongCard } from '@/components/UI/SongCard';
import styles from './FavoritesView.module.css';
import { useToast } from '@/contexts/ToastContext';

interface FavoritesViewProps {
  onAddToPlaylist: (song: Song) => void;
}

export const FavoritesView = ({ onAddToPlaylist }: FavoritesViewProps) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'liked' | 'history'>('liked');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [history, setHistory] = useState<Song[]>([]);

  const refresh = () => {
    setLikedSongs(getLikedSongs());
    setHistory(getHistory());
  };

  useEffect(() => {
    refresh();
  }, []);

  const list = tab === 'liked' ? likedSongs : history;

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div className={styles.segment}>
          <button className={`${styles.segmentBtn} ${tab === 'liked' ? styles.active : ''}`} onClick={() => setTab('liked')}>Disukai</button>
          <button className={`${styles.segmentBtn} ${tab === 'history' ? styles.active : ''}`} onClick={() => setTab('history')}>Riwayat</button>
        </div>
        {tab === 'history' ? (
          <button className={styles.clearBtn} onClick={() => {
            if (window.confirm('Hapus semua riwayat?')) {
              clearHistory();
              refresh();
              showToast('Riwayat dihapus.', 'success');
            }
          }}>Clear</button>
        ) : null}
      </div>
      <div className={styles.list}>
        {list.length === 0 ? <div className={styles.empty}>{tab === 'liked' ? 'Belum ada lagu favorit.' : 'Riwayat masih kosong.'}</div> : null}
        {list.map((song, index) => <SongCard key={`${song.videoId}_${index}`} song={song} queue={list} index={index} onAddToPlaylist={onAddToPlaylist} />)}
      </div>
    </div>
  );
};
