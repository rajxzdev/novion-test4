import type { Song } from '@/types';

export interface SearchResponse {
  results: Song[];
  nextPageToken: string | null;
  totalResults: number;
}

export const searchSongs = async (query: string, pageToken?: string): Promise<SearchResponse> => {
  const params = new URLSearchParams({ q: query });
  if (pageToken) params.set('pageToken', pageToken);

  const response = await fetch(`/api/search?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Gagal mencari lagu.' }));
    throw new Error(error.error || 'Gagal mencari lagu.');
  }

  return response.json();
};

export const fetchVideoDetails = async (ids: string[]): Promise<Song[]> => {
  if (ids.length === 0) return [];
  const response = await fetch(`/api/video-details?ids=${encodeURIComponent(ids.join(','))}`);
  if (!response.ok) {
    throw new Error('Gagal memuat detail lagu.');
  }
  return response.json();
};
