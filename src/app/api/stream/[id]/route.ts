import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const headers = new Headers();
  const range = request.headers.get('range');
  if (range) headers.set('Range', range);

  const response = await fetch(url, { headers, cache: 'no-store' });
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: 'Failed to fetch audio stream' }, { status: response.status || 500 });
  }

  const nextHeaders = new Headers();
  ['Content-Type', 'Content-Length', 'Accept-Ranges', 'Content-Range'].forEach((header) => {
    const value = response.headers.get(header);
    if (value) nextHeaders.set(header, value);
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: nextHeaders,
  });
}
