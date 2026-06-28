'use client';

import { useCallback } from 'react';

export const useAudioPlayer = (audio: HTMLAudioElement | null) => {
  const play = useCallback(async () => {
    if (!audio) return;
    await audio.play();
  }, [audio]);

  const pause = useCallback(() => {
    audio?.pause();
  }, [audio]);

  const seek = useCallback((time: number) => {
    if (!audio) return;
    audio.currentTime = time;
  }, [audio]);

  const setVolume = useCallback((volume: number) => {
    if (!audio) return;
    audio.volume = volume;
  }, [audio]);

  return { play, pause, seek, setVolume };
};
