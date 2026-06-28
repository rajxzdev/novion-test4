'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PlayerState, RepeatMode, Song } from '@/types';
import { STORAGE_KEYS, addToHistory } from '@/lib/storage';
import { useMediaSession } from '@/hooks/useMediaSession';

const initialState: PlayerState = {
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  shuffleMode: false,
  repeatMode: 'off',
  isExtendedOpen: false,
  isLoading: false,
  isBuffering: false,
};

type Action =
  | { type: 'SET_SONG'; payload: { song: Song; index?: number } }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_EXTENDED'; payload: boolean }
  | { type: 'NEXT_SONG'; payload?: { index?: number } }
  | { type: 'PREV_SONG'; payload?: { index?: number } }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'SET_VOLUME'; payload: number };

const shuffleQueueKeepCurrent = (queue: Song[], currentIndex: number) => {
  if (queue.length <= 1) return queue;
  const current = queue[currentIndex];
  const others = queue.filter((_, index) => index !== currentIndex);
  for (let i = others.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return [current, ...others];
};

const reducer = (state: PlayerState, action: Action): PlayerState => {
  switch (action.type) {
    case 'SET_SONG': {
      const queueIndex = typeof action.payload.index === 'number'
        ? action.payload.index
        : Math.max(state.queue.findIndex((song) => song.videoId === action.payload.song.videoId), 0);
      return {
        ...state,
        currentSong: action.payload.song,
        queueIndex,
        isLoading: true,
        isPlaying: false,
        currentTime: 0,
      };
    }
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'SET_EXTENDED':
      return { ...state, isExtendedOpen: action.payload };
    case 'NEXT_SONG': {
      const nextIndex = action.payload?.index ?? Math.min(state.queueIndex + 1, Math.max(state.queue.length - 1, 0));
      return {
        ...state,
        queueIndex: nextIndex,
        currentSong: state.queue[nextIndex] || state.currentSong,
        currentTime: 0,
        isLoading: true,
      };
    }
    case 'PREV_SONG': {
      const prevIndex = action.payload?.index ?? Math.max(state.queueIndex - 1, 0);
      return {
        ...state,
        queueIndex: prevIndex,
        currentSong: state.queue[prevIndex] || state.currentSong,
        currentTime: 0,
        isLoading: true,
      };
    }
    case 'TOGGLE_SHUFFLE': {
      const enabled = !state.shuffleMode;
      const queue = enabled && state.currentSong ? shuffleQueueKeepCurrent(state.queue, state.queueIndex) : state.queue;
      const queueIndex = enabled ? 0 : state.queue.findIndex((song) => song.videoId === state.currentSong?.videoId);
      return { ...state, shuffleMode: enabled, queue, queueIndex: Math.max(queueIndex, 0) };
    }
    case 'TOGGLE_REPEAT': {
      const nextMode: RepeatMode = state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off';
      return { ...state, repeatMode: nextMode };
    }
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    default:
      return state;
  }
};

export interface PlayerActions {
  playSong: (song: Song, queue?: Song[], index?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextSong: () => Promise<void>;
  prevSong: () => Promise<void>;
  setQueue: (songs: Song[]) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleExtended: (open: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<(PlayerState & PlayerActions) | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    const handleTimeUpdate = () => dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    const handleDurationChange = () => dispatch({ type: 'SET_DURATION', payload: Number.isFinite(audio.duration) ? audio.duration : 0 });
    const handleLoadStart = () => dispatch({ type: 'SET_LOADING', payload: true });
    const handleCanPlay = () => dispatch({ type: 'SET_LOADING', payload: false });
    const handleWaiting = () => dispatch({ type: 'SET_BUFFERING', payload: true });
    const handlePlaying = () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    const handlePause = () => dispatch({ type: 'SET_PLAYING', payload: false });
    const handleError = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_BUFFERING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    const handleEnded = async () => {
      if (state.repeatMode === 'one') {
        audio.currentTime = 0;
        await audio.play().catch(() => undefined);
        return;
      }

      const isLast = state.queueIndex >= state.queue.length - 1;
      if (isLast) {
        if (state.repeatMode === 'all' && state.queue.length > 0) {
          dispatch({ type: 'NEXT_SONG', payload: { index: 0 } });
        } else {
          dispatch({ type: 'SET_PLAYING', payload: false });
        }
        return;
      }

      dispatch({ type: 'NEXT_SONG' });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [state.queue.length, state.queueIndex, state.repeatMode]);

  useEffect(() => {
    const queueRaw = window.localStorage.getItem(STORAGE_KEYS.QUEUE);
    const indexRaw = window.localStorage.getItem(STORAGE_KEYS.QUEUE_INDEX);
    const lastRaw = window.localStorage.getItem(STORAGE_KEYS.LAST_PLAYING);

    if (queueRaw) {
      const queue = JSON.parse(queueRaw) as Song[];
      dispatch({ type: 'SET_QUEUE', payload: queue });
      const queueIndex = Number(indexRaw || 0);
      const currentSong = lastRaw ? (JSON.parse(lastRaw) as Song) : queue[queueIndex] || null;
      if (currentSong) {
        dispatch({ type: 'SET_SONG', payload: { song: currentSong, index: queueIndex } });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  const loadAudioForSong = useCallback(async (song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    const response = await fetch(`/api/video/${song.videoId}`);
    if (!response.ok) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Gagal memuat stream audio.');
    }
    const data = await response.json();
    audio.src = `/api/stream/${song.videoId}?url=${encodeURIComponent(data.audioUrl)}`;
    window.localStorage.setItem(STORAGE_KEYS.LAST_PLAYING, JSON.stringify(song));
  }, []);

  const playSong = useCallback(async (song: Song, queue?: Song[], index?: number) => {
    const nextQueue = queue || state.queue;
    const resolvedQueue = nextQueue.length > 0 ? nextQueue : [song];
    const resolvedIndex = typeof index === 'number' ? index : Math.max(resolvedQueue.findIndex((item) => item.videoId === song.videoId), 0);

    dispatch({ type: 'SET_QUEUE', payload: resolvedQueue });
    dispatch({ type: 'SET_SONG', payload: { song, index: resolvedIndex } });
    window.localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(resolvedQueue));
    window.localStorage.setItem(STORAGE_KEYS.QUEUE_INDEX, String(resolvedIndex));

    await loadAudioForSong(song);
    await audioRef.current?.play();
    addToHistory(song);
  }, [loadAudioForSong, state.queue]);

  useEffect(() => {
    const currentSong = state.currentSong;
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;
    if (!audio.src || audio.src.includes('/api/stream/') === false) return;
    audio.volume = state.volume;
  }, [state.currentSong, state.volume]);

  useEffect(() => {
    const currentSong = state.currentSong;
    if (!currentSong || !state.isLoading) return;

    loadAudioForSong(currentSong)
      .then(() => audioRef.current?.play())
      .catch(() => undefined);
  }, [loadAudioForSong, state.currentSong, state.isLoading]);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying) {
      audio.pause();
      return;
    }
    await audio.play().catch(() => undefined);
  }, [state.isPlaying]);

  const nextSong = useCallback(async () => {
    if (state.queue.length === 0) return;
    const nextIndex = state.queueIndex >= state.queue.length - 1 ? (state.repeatMode === 'all' ? 0 : state.queueIndex) : state.queueIndex + 1;
    const next = state.queue[nextIndex];
    if (!next) return;
    await playSong(next, state.queue, nextIndex);
  }, [playSong, state.queue, state.queueIndex, state.repeatMode]);

  const prevSong = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (state.queue.length === 0) return;
    const prevIndex = Math.max(state.queueIndex - 1, 0);
    const prev = state.queue[prevIndex];
    if (!prev) return;
    await playSong(prev, state.queue, prevIndex);
  }, [playSong, state.queue, state.queueIndex]);

  const setQueue = useCallback((songs: Song[]) => {
    dispatch({ type: 'SET_QUEUE', payload: songs });
    window.localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(songs));
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleExtended = useCallback((open: boolean) => {
    dispatch({ type: 'SET_EXTENDED', payload: open });
  }, []);

  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
  const toggleRepeat = useCallback(() => dispatch({ type: 'TOGGLE_REPEAT' }), []);

  useMediaSession(state.currentSong, state.isPlaying, state.duration, state.currentTime, {
    onPlay: () => { void togglePlayPause(); },
    onPause: () => { void togglePlayPause(); },
    onNext: () => { void nextSong(); },
    onPrevious: () => { void prevSong(); },
    onSeekTo: (time) => seek(time),
    onSeekBy: (delta) => seek(Math.max(0, Math.min(state.duration, state.currentTime + delta))),
  });

  const value = useMemo(() => ({
    ...state,
    playSong,
    togglePlayPause,
    nextSong,
    prevSong,
    setQueue,
    seek,
    setVolume,
    toggleExtended,
    toggleShuffle,
    toggleRepeat,
  }), [nextSong, playSong, prevSong, seek, setQueue, setVolume, state, toggleExtended, togglePlayPause, toggleRepeat, toggleShuffle]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
