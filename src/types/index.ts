export interface Song {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
  durationSeconds?: number;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: string;
  username: string;
}

export interface NovionExport {
  app: 'Novion';
  version: '1.0';
  exportDate: string;
  type: 'playlist' | 'full-backup';
  data: {
    name?: string;
    songs?: Song[];
    playlists?: Playlist[];
    likedSongs?: Song[];
    settings?: AppSettings;
  };
}

export type RepeatMode = 'off' | 'one' | 'all';
export type TabName = 'home' | 'search' | 'library' | 'favorites' | 'settings';
export type ThemeName = 'default' | 'ocean' | 'rose' | 'emerald' | 'amber' | 'sunset' | 'crimson' | 'midnight';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  isExtendedOpen: boolean;
  isLoading: boolean;
  isBuffering: boolean;
}
