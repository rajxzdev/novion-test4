'use client';

import { useEffect, useState } from 'react';
import type { Song } from '@/types';
import { searchSongs } from '@/lib/api';
import { getRecentSearches } from '@/lib/storage';
import { SongCard } from '@/components/UI/SongCard';
import { SongCardSkeleton } from '@/components/UI/Skeleton';
import { SearchIcon } from '@/components/icons';
import styles from './HomeView.module.css';

interface HomeViewProps {
  onFocusSearch: () => void;
  onAddToPlaylist: (song: Song) => void;
}

export const HomeView = ({ onFocusSearch, onAddToPlaylist }: HomeViewProps) => {
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches().slice(0, 8));
  }, []);

  const runSearch = async (query: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await searchSongs(query);
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.view}>
      <div className={styles.header}>
        <div>
          <div className={styles.brand}>Novion</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Your Music, Your Vibe</div>
        </div>
        <div className={styles.greeting}>Halo, selamat datang kembali</div>
      </div>

      <button className={styles.searchBar} onClick={onFocusSearch}>
        <SearchIcon size={18} />
        <span>Cari lagu, artis...</span>
      </button>

      {recent.length > 0 ? (
        <>
          <div className={styles.sectionTitle}>Pencarian Terbaru</div>
          <div className={styles.chips}>
            {recent.map((item) => (
              <button key={item} className={styles.chip} onClick={() => void runSearch(item)}>{item}</button>
            ))}
          </div>
        </>
      ) : null}

      <div className={styles.sectionTitle}>{results.length > 0 ? 'Hasil Cepat' : 'Temukan lagu favoritmu'}</div>
      <div className={styles.results}>
        {loading ? Array.from({ length: 5 }).map((_, index) => <SongCardSkeleton key={index} />) : null}
        {!loading && error ? <div className={styles.error}>{error}</div> : null}
        {!loading && !error && results.length === 0 ? (
          <div className={styles.empty}>Cari judul lagu atau artis untuk mulai memutar musik favoritmu.</div>
        ) : null}
        {!loading && results.map((song, index) => (
          <SongCard key={song.videoId} song={song} queue={results} index={index} onAddToPlaylist={onAddToPlaylist} />
        ))}
      </div>
    </div>
  );
};
