'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Song } from '@/types';
import { searchSongs } from '@/lib/api';
import { addRecentSearch, getRecentSearches } from '@/lib/storage';
import { SongCard } from '@/components/UI/SongCard';
import { SongCardSkeleton } from '@/components/UI/Skeleton';
import { SearchIcon } from '@/components/icons';
import styles from './SearchView.module.css';

interface SearchViewProps {
  onAddToPlaylist: (song: Song) => void;
}

export const SearchView = ({ onAddToPlaylist }: SearchViewProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const categories = useMemo(() => ['Semua', 'Populer', 'Terbaru'], []);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchSongs(query.trim());
        setResults(data.results);
        addRecentSearch(query.trim());
        setRecent(getRecentSearches());
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className={styles.view}>
      <div className={styles.searchWrap}>
        <SearchIcon size={18} />
        <input autoFocus className={styles.input} placeholder="Cari lagu, artis..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className={styles.categories}>
        {categories.map((item) => <div key={item} className={styles.category}>{item}</div>)}
      </div>
      {recent.length > 0 ? (
        <div className={styles.chips}>
          {recent.map((item) => (
            <div key={item} className={styles.chip}>
              <button onClick={() => setQuery(item)}>{item}</button>
            </div>
          ))}
        </div>
      ) : null}
      <div className={styles.results}>
        {loading ? Array.from({ length: 5 }).map((_, index) => <SongCardSkeleton key={index} />) : null}
        {!loading && results.map((song, index) => (
          <SongCard key={song.videoId} song={song} queue={results} index={index} onAddToPlaylist={onAddToPlaylist} />
        ))}
      </div>
    </div>
  );
};
