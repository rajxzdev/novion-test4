'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatTime, cn } from '@/lib/utils';
import { isLiked, toggleLike } from '@/lib/storage';
import { usePlayer } from '@/contexts/PlayerContext';
import { useToast } from '@/contexts/ToastContext';
import {
  ChevronDownIcon,
  HeartIcon,
  MoreHorizontalIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
} from '@/components/icons';
import styles from './ExtendedPlayer.module.css';

export const ExtendedPlayer = () => {
  const {
    currentSong,
    queue,
    queueIndex,
    isPlaying,
    isExtendedOpen,
    currentTime,
    duration,
    shuffleMode,
    repeatMode,
    toggleExtended,
    togglePlayPause,
    nextSong,
    prevSong,
    toggleShuffle,
    toggleRepeat,
    playSong,
    seek,
  } = usePlayer();

  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentSong) {
      setLiked(isLiked(currentSong.videoId));
    }
  }, [currentSong]);

  const progress = useMemo(() => {
    if (dragProgress !== null) return dragProgress;
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, dragProgress, duration]);

  const updateSeek = (clientX: number, commit = false) => {
    const track = trackRef.current;
    if (!track || !duration) return;

    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nextProgress = ratio * 100;

    setDragProgress(nextProgress);

    if (commit) {
      seek(ratio * duration);
      setDragProgress(null);
    }
  };

  if (!currentSong) return null;

  return (
    <div
      className={cn(styles.overlay, isExtendedOpen && styles.open)}
      onTouchStart={(event) => setTouchStartY(event.touches[0].clientY)}
      onTouchMove={(event) => {
        if (touchStartY !== null && event.touches[0].clientY - touchStartY > 100) {
          event.preventDefault();
        }
      }}
      onTouchEnd={(event) => {
        if (touchStartY !== null && event.changedTouches[0].clientY - touchStartY > 100) {
          toggleExtended(false);
        }
        setTouchStartY(null);
      }}
    >
      <div className={styles.bgArt} style={{ backgroundImage: `url(${currentSong.thumbnail})` }} />

      <div className={styles.content}>
        <div className={styles.dragHandle} />

        <div className={styles.header}>
          <button className={styles.headerBtn} onClick={() => toggleExtended(false)} aria-label="Close player">
            <ChevronDownIcon size={18} />
          </button>
          <div className={styles.headerTitle}>Now Playing</div>
          <button
            className={styles.headerBtn}
            onClick={() => showToast('Novion siap menemani sesi mendengarkan kamu.', 'info')}
            aria-label="More options"
          >
            <MoreHorizontalIcon size={18} />
          </button>
        </div>

        <div className={styles.albumArtContainer}>
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className={cn(styles.albumArt, isPlaying ? styles.playing : styles.paused)}
          />
        </div>

        <div className={styles.songInfo}>
          <div className={styles.songTitle}>{currentSong.title}</div>
          <div className={styles.songArtist}>{currentSong.artist}</div>
          <button
            className={styles.likeInInfo}
            onClick={() => {
              const next = toggleLike(currentSong);
              setLiked(next);
            }}
            aria-label="Toggle favorite"
          >
            <HeartIcon size={18} />
          </button>
        </div>

        <div className={styles.seekContainer}>
          <div
            ref={trackRef}
            className={styles.seekTrack}
            onClick={(event) => updateSeek(event.clientX, true)}
            onMouseDown={(event) => updateSeek(event.clientX)}
            onMouseMove={(event) => dragProgress !== null && updateSeek(event.clientX)}
            onMouseUp={(event) => dragProgress !== null && updateSeek(event.clientX, true)}
            onMouseLeave={() => dragProgress !== null && setDragProgress(null)}
            onTouchStart={(event) => updateSeek(event.touches[0].clientX)}
            onTouchMove={(event) => updateSeek(event.touches[0].clientX)}
            onTouchEnd={(event) => updateSeek(event.changedTouches[0].clientX, true)}
          >
            <div className={styles.seekFill} style={{ width: `${progress}%` }}>
              <span className={styles.seekThumb} />
            </div>
          </div>

          <div className={styles.seekTimes}>
            <span>{formatTime(dragProgress !== null ? (dragProgress / 100) * duration : currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className={styles.mainControls}>
          <button className={cn(styles.shuffleBtn, shuffleMode && styles.controlActive)} onClick={toggleShuffle} aria-label="Shuffle">
            <ShuffleIcon size={18} />
          </button>
          <button className={styles.prevBtn} onClick={() => void prevSong()} aria-label="Previous song">
            <PrevIcon size={20} />
          </button>
          <button className={styles.playPauseBtn} onClick={() => void togglePlayPause()} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>
          <button className={styles.nextBtn} onClick={() => void nextSong()} aria-label="Next song">
            <NextIcon size={20} />
          </button>
          <button className={cn(styles.repeatBtn, repeatMode !== 'off' && styles.controlActive)} onClick={toggleRepeat} aria-label="Repeat mode">
            {repeatMode === 'one' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
          </button>
        </div>

        <div className={styles.extraControls}>
          <button className={styles.extraBtn} onClick={() => seek(Math.max(0, currentTime - 10))}>-10</button>
          <button className={styles.extraBtn} onClick={() => seek(Math.min(duration, currentTime + 10))}>+10</button>
        </div>

        <div className={styles.queueSection}>
          <div className={styles.queueTitle}>Up Next</div>
          {queue.map((song, index) => (
            <div
              key={`${song.videoId}_${index}`}
              className={cn(styles.queueItem, index === queueIndex && styles.queueItemActive)}
              onClick={() => void playSong(song, queue, index)}
            >
              <img src={song.thumbnail} alt={song.title} className={styles.queueThumb} />
              <div className={styles.queueMeta}>
                <div className={styles.queueName}>{song.title}</div>
                <div className={styles.queueArtist}>{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
