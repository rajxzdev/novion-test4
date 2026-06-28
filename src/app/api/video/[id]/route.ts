import { NextRequest, NextResponse } from 'next/server';

const instances = [
  'https://inv.nadeko.net',
  'https://invidious.fdn.fr',
  'https://invidious.privacyredirect.com',
  'https://invidious.lunar.icu',
  'https://iv.melmac.space',
];

const pickBestAudio = (formats: any[]) => {
  const audioOnly = formats.filter((format) => String(format.type || '').includes('audio'));
  const score = (type: string) => {
    if (type.includes('audio/webm; codecs="opus"') || type.includes('audio/webm;codecs=opus')) return 4;
    if (type.includes('audio/webm')) return 3;
    if (type.includes('audio/mp4')) return 2;
    if (type.includes('audio/')) return 1;
    return 0;
  };
  return audioOnly.sort((a, b) => score(String(b.type || '')) - score(String(a.type || '')))[0];
};

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const videoId = params.id;

  for (const instance of instances) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`, { cache: 'no-store' });
      if (!response.ok) continue;
      const data = await response.json();
      const selected = pickBestAudio(data.adaptiveFormats || []);
      if (!selected?.url) continue;
      return NextResponse.json({
        audioUrl: selected.url,
        title: data.title,
        author: data.author,
        thumbnail: data.videoThumbnails?.[0]?.url || '',
        duration: data.lengthSeconds || 0,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'All Invidious instances failed' }, { status: 503 });
}
