import { NextRequest, NextResponse } from 'next/server';
import { EXCLUDED_CHANNEL_KEYWORDS, EXCLUDED_TITLE_KEYWORDS, containsExcludedKeyword } from '@/lib/filters';
import { formatTime, parseISODuration } from '@/lib/utils';
import type { Song } from '@/types';

const exhaustedKeys = new Map<number, number>();
const DAY_MS = 24 * 60 * 60 * 1000;

const getApiKeys = () => Array.from({ length: 10 }).map((_, index) => process.env[`YOUTUBE_API_KEY_${index + 1}`]).filter(Boolean) as string[];

export const getActiveKey = (): string | null => {
  const keys = getApiKeys();
  const now = Date.now();
  for (let i = 0; i < keys.length; i += 1) {
    const exhaustedAt = exhaustedKeys.get(i);
    if (!exhaustedAt || now - exhaustedAt >= DAY_MS) {
      exhaustedKeys.delete(i);
      return keys[i];
    }
  }
  return null;
};

const getActiveKeyWithIndex = (): { key: string; index: number } | null => {
  const keys = getApiKeys();
  const now = Date.now();
  for (let i = 0; i < keys.length; i += 1) {
    const exhaustedAt = exhaustedKeys.get(i);
    if (!exhaustedAt || now - exhaustedAt >= DAY_MS) {
      exhaustedKeys.delete(i);
      return { key: keys[i], index: i };
    }
  }
  return null;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const pageToken = request.nextUrl.searchParams.get('pageToken');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const active = getActiveKeyWithIndex();
    if (!active) {
      return NextResponse.json({ error: 'All API keys exhausted, please try again tomorrow' }, { status: 503 });
    }

    const searchParams = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10',
      maxResults: '20',
      q: query,
      key: active.key,
    });
    if (pageToken) searchParams.set('pageToken', pageToken);

    const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`, { cache: 'no-store' });
    const searchData = await searchResponse.json();

    if (searchResponse.status === 403) {
      exhaustedKeys.set(active.index, Date.now());
      continue;
    }

    if (!searchResponse.ok) {
      return NextResponse.json({ error: searchData.error?.message || 'YouTube search failed' }, { status: searchResponse.status });
    }

    const videoIds = (searchData.items || []).map((item: any) => item.id.videoId).filter(Boolean);
    if (videoIds.length === 0) {
      return NextResponse.json({ results: [], nextPageToken: null, totalResults: 0 });
    }

    const detailsParams = new URLSearchParams({
      part: 'contentDetails,snippet',
      id: videoIds.join(','),
      key: active.key,
    });

    const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`, { cache: 'no-store' });
    const detailsData = await detailsResponse.json();

    if (detailsResponse.status === 403) {
      exhaustedKeys.set(active.index, Date.now());
      continue;
    }

    if (!detailsResponse.ok) {
      return NextResponse.json({ error: detailsData.error?.message || 'Video details failed' }, { status: detailsResponse.status });
    }

    const results: Song[] = (detailsData.items || [])
      .map((item: any) => {
        const durationSeconds = parseISODuration(item.contentDetails?.duration || 'PT0S');
        return {
          videoId: item.id,
          title: item.snippet?.title || 'Unknown Title',
          artist: item.snippet?.channelTitle || 'Unknown Artist',
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
          duration: formatTime(durationSeconds),
          durationSeconds,
        } as Song;
      })
      .filter((song) => !containsExcludedKeyword(song.title, EXCLUDED_TITLE_KEYWORDS))
      .filter((song) => !containsExcludedKeyword(song.artist, EXCLUDED_CHANNEL_KEYWORDS))
      .filter((song) => (song.durationSeconds || 0) >= 90 && (song.durationSeconds || 0) <= 600);

    return NextResponse.json({
      results,
      nextPageToken: searchData.nextPageToken || null,
      totalResults: searchData.pageInfo?.totalResults || results.length,
    });
  }

  return NextResponse.json({ error: 'All API keys exhausted, please try again tomorrow' }, { status: 503 });
          }
