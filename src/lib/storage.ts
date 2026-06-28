import type { AppSettings, NovionExport, Playlist, Song } from '@/types';
import { downloadJson, generateId, safeJsonParse } from './utils';

export const STORAGE_KEYS = {
  PLAYLISTS: 'novion_playlists',
  LIKED_SONGS: 'novion_liked_songs',
  HISTORY: 'novion_history',
  SETTINGS: 'novion_settings',
  RECENT_SEARCHES: 'novion_recent_searches',
  LAST_PLAYING: 'novion_last_playing',
  QUEUE: 'novion_queue',
  QUEUE_INDEX: 'novion_queue_index',
} as const;

const defaultSettings: AppSettings = {
  theme: 'default',
  username: 'Novion User',
};

const isBrowser = () => typeof window !== 'undefined';

const getItem = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  return safeJsonParse<T>(window.localStorage.getItem(key), fallback);
};

const setItem = (key: string, value: unknown) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getPlaylists = (): Playlist[] => getItem<Playlist[]>(STORAGE_KEYS.PLAYLISTS, []);
export const savePlaylists = (playlists: Playlist[]): void => setItem(STORAGE_KEYS.PLAYLISTS, playlists);

export const createPlaylist = (name: string): Playlist => {
  const playlist: Playlist = {
    id: generateId(),
    name: name.trim() || 'Playlist Baru',
    songs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const playlists = getPlaylists();
  savePlaylists([playlist, ...playlists]);
  return playlist;
};

export const addSongToPlaylist = (playlistId: string, song: Song): void => {
  const playlists = getPlaylists().map((playlist) => {
    if (playlist.id !== playlistId) return playlist;
    if (playlist.songs.some((item) => item.videoId === song.videoId)) return playlist;
    return {
      ...playlist,
      songs: [...playlist.songs, song],
      updatedAt: new Date().toISOString(),
    };
  });
  savePlaylists(playlists);
};

export const removeSongFromPlaylist = (playlistId: string, videoId: string): void => {
  const playlists = getPlaylists().map((playlist) =>
    playlist.id === playlistId
      ? {
          ...playlist,
          songs: playlist.songs.filter((song) => song.videoId !== videoId),
          updatedAt: new Date().toISOString(),
        }
      : playlist,
  );
  savePlaylists(playlists);
};

export const deletePlaylist = (playlistId: string): void => {
  savePlaylists(getPlaylists().filter((playlist) => playlist.id !== playlistId));
};

export const renamePlaylist = (playlistId: string, newName: string): void => {
  const playlists = getPlaylists().map((playlist) =>
    playlist.id === playlistId
      ? { ...playlist, name: newName.trim() || playlist.name, updatedAt: new Date().toISOString() }
      : playlist,
  );
  savePlaylists(playlists);
};

export const getLikedSongs = (): Song[] => getItem<Song[]>(STORAGE_KEYS.LIKED_SONGS, []);

export const toggleLike = (song: Song): boolean => {
  const likedSongs = getLikedSongs();
  const exists = likedSongs.some((item) => item.videoId === song.videoId);
  const next = exists ? likedSongs.filter((item) => item.videoId !== song.videoId) : [song, ...likedSongs];
  setItem(STORAGE_KEYS.LIKED_SONGS, next);
  return !exists;
};

export const isLiked = (videoId: string): boolean => getLikedSongs().some((song) => song.videoId === videoId);

export const getHistory = (): Song[] => getItem<Song[]>(STORAGE_KEYS.HISTORY, []);

export const addToHistory = (song: Song): void => {
  const history = getHistory().filter((item) => item.videoId !== song.videoId);
  setItem(STORAGE_KEYS.HISTORY, [song, ...history].slice(0, 100));
};

export const clearHistory = (): void => setItem(STORAGE_KEYS.HISTORY, []);

export const getSettings = (): AppSettings => ({ ...defaultSettings, ...getItem<AppSettings>(STORAGE_KEYS.SETTINGS, defaultSettings) });

export const saveSettings = (settings: Partial<AppSettings>): void => {
  setItem(STORAGE_KEYS.SETTINGS, { ...getSettings(), ...settings });
};

export const getRecentSearches = (): string[] => getItem<string[]>(STORAGE_KEYS.RECENT_SEARCHES, []);

export const addRecentSearch = (query: string): void => {
  const cleaned = query.trim();
  if (!cleaned) return;
  const searches = getRecentSearches().filter((item) => item.toLowerCase() !== cleaned.toLowerCase());
  setItem(STORAGE_KEYS.RECENT_SEARCHES, [cleaned, ...searches].slice(0, 10));
};

export const clearRecentSearches = (): void => setItem(STORAGE_KEYS.RECENT_SEARCHES, []);

export const exportPlaylist = (playlist: Playlist): void => {
  const data: NovionExport = {
    app: 'Novion',
    version: '1.0',
    exportDate: new Date().toISOString(),
    type: 'playlist',
    data: {
      name: playlist.name,
      songs: playlist.songs,
    },
  };
  downloadJson(`${playlist.name.replace(/\s+/g, '-').toLowerCase() || 'playlist'}-novion.json`, data);
};

export const exportFullBackup = (): void => {
  const data: NovionExport = {
    app: 'Novion',
    version: '1.0',
    exportDate: new Date().toISOString(),
    type: 'full-backup',
    data: {
      playlists: getPlaylists(),
      likedSongs: getLikedSongs(),
      settings: getSettings(),
    },
  };
  downloadJson(`novion-backup-${new Date().toISOString().slice(0, 10)}.json`, data);
};

export const importFromFile = async (file: File): Promise<{ success: boolean; message: string; playlist?: Playlist }> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text) as NovionExport;

    if (parsed.app !== 'Novion' || parsed.version !== '1.0') {
      return { success: false, message: 'File tidak valid untuk Novion.' };
    }

    if (parsed.type === 'playlist' && parsed.data.songs) {
      const playlist = createPlaylist(parsed.data.name || 'Imported Playlist');
      const playlists = getPlaylists().map((item) =>
        item.id === playlist.id
          ? { ...item, songs: parsed.data.songs || [], updatedAt: new Date().toISOString() }
          : item,
      );
      savePlaylists(playlists);
      return { success: true, message: 'Playlist berhasil diimport.', playlist: playlists.find((item) => item.id === playlist.id) };
    }

    if (parsed.type === 'full-backup') {
      if (parsed.data.playlists) savePlaylists(parsed.data.playlists);
      if (parsed.data.likedSongs) setItem(STORAGE_KEYS.LIKED_SONGS, parsed.data.likedSongs);
      if (parsed.data.settings) setItem(STORAGE_KEYS.SETTINGS, { ...defaultSettings, ...parsed.data.settings });
      return { success: true, message: 'Backup berhasil diimport.' };
    }

    return { success: false, message: 'Format file tidak dikenali.' };
  } catch {
    return { success: false, message: 'Gagal membaca file JSON.' };
  }
};
