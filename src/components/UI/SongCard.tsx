'use client';

import { useEffect, useState } from 'react';
import type { Song } from '@/types';
import { cn } from '@/lib/utils';
import { toggleLike, isLiked } from '@/lib/storage';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import { HeartIcon, MoreHorizontalIcon } from '@/components/icons';
import styles from './SongCard.module.css';

interface SongCardProps {
  song: Song;
  queue?: Song[];
  index?: number;
  onAddToPlaylist?: (song: Song) => void;
}

export const SongCard = ({ song, queue, index, onAddToPlaylist }: SongCardProps) => {
  const { currentSong, isPlaying, playSong, setQueue } = usePlayer();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const active = currentSong?.videoId === song.videoId;

  useEffect(() => {
    setLiked(isLiked(song.videoId));
  }, [song.videoId]);

  const handleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = toggleLike(song);
    setLiked(next);
    showToast(next ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.', next ? 'success' : 'info');
  };

  const handlePlay = async () => {
    await playSong(song, queue, index);
  };

  const handlePlayNext = () => {
    const baseQueue = queue && queue.length > 0 ? [...queue] : [song];
    const currentIndex = baseQueue.findIndex((item) => item.videoId === currentSong?.videoId);
    if (currentIndex >= 0) {
      baseQueue.splice(currentIndex + 1, 0, song);
    } else {
      baseQueue.unshift(song);
    }
    setQueue(baseQueue);
    setMenuOpen(false);
    showToast('Lagu ditambahkan ke antrean berikutnya.', 'success');
  };

  const handleAddQueue = () => {
    const nextQueue = [...(queue || []), song];
    setQueue(nextQueue);
    setMenuOpen(false);
    showToast('Lagu ditambahkan ke antrean.', 'success');
  };

  return (
    <div className={cn(styles.card, 'pressable', active && styles.active)} onClick={handlePlay}>
      <img src={song.thumbnail} alt={song.title} className={styles.thumbnail} />
      <div className={styles.info}>
        <div className={styles.title}>
          {song.title} {active && isPlaying ? <span className={styles.eq}><span /><span /><span /></span> : null}
        </div>
        <div className={styles.artist}>{song.artist}</div>
        <div className={styles.meta}>
          <span className={styles.duration}>{song.duration}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button className={cn(styles.iconBtn, liked && styles.liked)} onClick={handleLike} aria-label="Like song">
          <HeartIcon size={18} />
        </button>
        <div className={styles.menuWrap}>
          <button
            className={styles.iconBtn}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            aria-label="Song menu"
          >
            <MoreHorizontalIcon size={18} />
          </button>
          {menuOpen ? (
            <div className={styles.menu} onClick={(event) => event.stopPropagation()}>
              <button className={styles.menuItem} onClick={handlePlayNext}>Putar Berikutnya</button>
              <button className={styles.menuItem} onClick={handleAddQueue}>Tambah ke Queue</button>
              <button className={styles.menuItem} onClick={() => { onAddToPlaylist?.(song); setMenuOpen(false); }}>Tambah ke Playlist</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
