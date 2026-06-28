'use client';

import { useState } from 'react';
import type { Song, TabName } from '@/types';
import { BottomNav } from '@/components/Navigation/BottomNav';
import { MiniPlayer } from '@/components/Player/MiniPlayer';
import { ExtendedPlayer } from '@/components/Player/ExtendedPlayer';
import { HomeView } from '@/components/Views/HomeView';
import { SearchView } from '@/components/Views/SearchView';
import { LibraryView } from '@/components/Views/LibraryView';
import { FavoritesView } from '@/components/Views/FavoritesView';
import { SettingsView } from '@/components/Views/SettingsView';
import { AddToPlaylistModal } from '@/components/AddToPlaylistModal';
import { usePlayer } from '@/contexts/PlayerContext';

export default function Page() {
  const { currentSong } = usePlayer();
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [playlistModalSong, setPlaylistModalSong] = useState<Song | null>(null);

  return (
    <main className="app-shell">
      <div className="scroll-area">
        {activeTab === 'home' ? <HomeView onFocusSearch={() => setActiveTab('search')} onAddToPlaylist={setPlaylistModalSong} /> : null}
        {activeTab === 'search' ? <SearchView onAddToPlaylist={setPlaylistModalSong} /> : null}
        {activeTab === 'library' ? <LibraryView onAddToPlaylist={setPlaylistModalSong} /> : null}
        {activeTab === 'favorites' ? <FavoritesView onAddToPlaylist={setPlaylistModalSong} /> : null}
        {activeTab === 'settings' ? <SettingsView /> : null}
      </div>
      {currentSong ? <MiniPlayer /> : null}
      <ExtendedPlayer />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} withMiniplayer={Boolean(currentSong)} />
      <AddToPlaylistModal open={Boolean(playlistModalSong)} song={playlistModalSong} onClose={() => setPlaylistModalSong(null)} />
    </main>
  );
}
