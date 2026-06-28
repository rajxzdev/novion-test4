import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Novion Music Player',
    short_name: 'Novion',
    description: 'Your Music, Your Vibe',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#08080f',
    theme_color: '#7C3AED',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
    ],
    categories: ['music', 'entertainment'],
  };
}
