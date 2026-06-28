'use client';

import { useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import { isLiked, toggleLike } from '@/lib/storage';
import { HeartIcon, MusicNoteIcon, NextIcon, PauseIcon, PlayIcon } from '@/components/icons';
import styles from './MiniPlayer.module.css';

export const MiniPlayer = () => {
  const {
    currentSong,
    currentTime,
    duration,
    isPlaying,
    isLoading,
    isBuffering,
    togglePlayPause,
    nextSong,
    toggleExtended,
  } = usePlayer();

  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentSong) {
      setLiked(isLiked(currentSong.videoId));
    }
  }, [currentSong]);

  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const longTitle = currentSong.title.length > 30;

  return (
    <div className={styles.miniplayer} onClick={() => toggleExtended(true)}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {isLoading ? (
        <div className={styles.thumbnailPlaceholder}>
          <div className={styles.spinner} />
        </div>
      ) : currentSong.thumbnail ? (
        <img src={currentSong.thumbnail} alt={currentSong.title} className={styles.thumbnail} />
      ) : (
        <div className={styles.thumbnailPlaceholder}>
          <MusicNoteIcon size={18} />
        </div>
      )}

      <div className={styles.info}>
        <div className={styles.titleText}>
          {longTitle ? (
            <div className={styles.marquee}>
              <span>{currentSong.title}</span>
              <span>{currentSong.title}</span>
            </div>
          ) : (
            currentSong.title
          )}
        </div>
        <div className={styles.artistText}>{currentSong.artist}</div>
      </div>

      {isBuffering ? <div className={styles.buffering}>Buffering...</div> : null}

      <div className={styles.controls} onClick={(event) => event.stopPropagation()}>
        <button
          className={`${styles.iconBtn} ${styles.likeBtn} ${liked ? styles.liked : ''}`}
          onClick={() => {
            const next = toggleLike(currentSong);
            setLiked(next);
            showToast(next ? 'Ditambahkan ke favorit.' : 'Dihapus dari favorit.', next ? 'success' : 'info');
          }}
          aria-label="Toggle favorite"
        >
          <HeartIcon size={18} />
        </button>

        <button
          className={`${styles.iconBtn} ${styles.playBtn}`}
          onClick={() => void togglePlayPause()}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>

        <button className={styles.iconBtn} onClick={() => void nextSong()} aria-label="Next song">
          <NextIcon size={18} />
        </button>
      </div>
    </div>
  );
};
