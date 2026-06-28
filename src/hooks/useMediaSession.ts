'use client';

import { useEffect } from 'react';
import type { Song } from '@/types';

interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeekTo: (time: number) => void;
  onSeekBy: (delta: number) => void;
}

export const useMediaSession = (
  song: Song | null,
  isPlaying: boolean,
  duration: number,
  currentTime: number,
  handlers: MediaSessionHandlers,
) => {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    if (!song) {
      navigator.mediaSession.metadata = null;
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: 'Novion',
      artwork: [
        { src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    navigator.mediaSession.setActionHandler('seekto', (details) => handlers.onSeekTo(details.seekTime || 0));
    navigator.mediaSession.setActionHandler('seekbackward', (details) => handlers.onSeekBy(-(details.seekOffset || 10)));
    navigator.mediaSession.setActionHandler('seekforward', (details) => handlers.onSeekBy(details.seekOffset || 10));
  }, [song, isPlaying, handlers]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    if ('setPositionState' in navigator.mediaSession && duration > 0) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    }
  }, [currentTime, duration]);
};
