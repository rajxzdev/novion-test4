import { NextRequest, NextResponse } from 'next/server';
import type { Song } from '@/types';
import { formatTime, parseISODuration } from '@/lib/utils';

const exhaustedKeys = new Map<number, number>();
const DAY_MS = 24 * 60 * 60 * 1000;

const getKeys = () => Array.from({ length: 10 }).map((_, index) => process.env[`YOUTUBE_API_KEY_${index + 1}`]).filter(Boolean) as string[];

const getActive = () => {
  const keys = getKeys();
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
  const ids = request.nextUrl.searchParams.get('ids');
  if (!ids) {
    return NextResponse.json({ error: 'ids is required' }, { status: 400 });
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const active = getActive();
    if (!active) {
      return NextResponse.json({ error: 'All API keys exhausted, please try again tomorrow' }, { status: 503 });
    }

    const params = new URLSearchParams({
      part: 'contentDetails,snippet',
      id: ids,
      key: active.key,
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();

    if (response.status === 403) {
      exhaustedKeys.set(active.index, Date.now());
      continue;
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Failed to fetch details' }, { status: response.status });
    }

    const songs: Song[] = (data.items || []).map((item: any) => {
      const durationSeconds = parseISODuration(item.contentDetails?.duration || 'PT0S');
      return {
        videoId: item.id,
        title: item.snippet?.title || 'Unknown Title',
        artist: item.snippet?.channelTitle || 'Unknown Artist',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
        duration: formatTime(durationSeconds),
        durationSeconds,
      };
    });

    return NextResponse.json(songs);
  }

  return NextResponse.json({ error: 'All API keys exhausted, please try again tomorrow' }, { status: 503 });
}
