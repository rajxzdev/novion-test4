import type { Metadata, Viewport } from 'next';
import './globals.css';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { Toast } from '@/components/UI/Toast';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Novion Music Player',
  description: 'Your Music, Your Vibe',
  manifest: '/manifest.webmanifest',
  themeColor: '#7C3AED',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Novion',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <PlayerProvider>
              <ServiceWorkerRegister />
              {children}
              <Toast />
            </PlayerProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
