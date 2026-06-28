'use client';

import type { Playlist, Song } from '@/types';
import { formatTime } from '@/lib/utils';
import { exportPlaylist, removeSongFromPlaylist, renamePlaylist } from '@/lib/storage';
import { SongCard } from '@/components/UI/SongCard';
import { ChevronDownIcon, DownloadIcon, MusicNoteIcon, PlayIcon, ShuffleIcon, TrashIcon } from '@/components/icons';
import styles from './PlaylistDetail.module.css';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onRefresh: () => void;
  onAddToPlaylist: (song: Song) => void;
}

export const PlaylistDetail = ({ playlist, onBack, onRefresh, onAddToPlaylist }: PlaylistDetailProps) => {
  const totalDuration = playlist.songs.reduce((sum, song) => sum + (song.durationSeconds || 0), 0);

  return (
    <div className={styles.wrap}>
      <button
        onClick={onBack}
        style={{ width: 'fit-content', padding: '10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <ChevronDownIcon size={16} style={{ transform: 'rotate(90deg)' }} />
        Kembali
      </button>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {playlist.songs[0] ? (
          <img src={playlist.songs[0].thumbnail} alt={playlist.name} style={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 24 }} />
        ) : (
          <div style={{ width: 130, height: 130, borderRadius: 24, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
            <MusicNoteIcon size={32} />
          </div>
        )}
        <div>
          <div
            style={{ fontSize: 28, fontWeight: 800 }}
            onClick={() => {
              const name = window.prompt('Rename playlist', playlist.name);
              if (!name) return;
              renamePlaylist(playlist.id, name);
              onRefresh();
            }}
          >
            {playlist.name}
          </div>
          <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{playlist.songs.length} lagu | {formatTime(totalDuration)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, padding: 12, borderRadius: 16, background: 'rgba(var(--primary-rgb),0.18)', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <PlayIcon size={18} />
          Play All
        </button>
        <button style={{ flex: 1, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.06)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <ShuffleIcon size={18} />
          Shuffle
        </button>
        <button style={{ flex: 1, padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.06)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={() => exportPlaylist(playlist)}>
          <DownloadIcon size={18} />
          Export
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {playlist.songs.map((song, index) => (
          <div key={song.videoId} style={{ position: 'relative' }}>
            <SongCard song={song} queue={playlist.songs} index={index} onAddToPlaylist={onAddToPlaylist} />
            <button
              style={{ position: 'absolute', right: 12, top: 12, padding: '8px 10px', borderRadius: 999, background: 'rgba(220,38,38,0.16)', color: '#fecaca', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                removeSongFromPlaylist(playlist.id, song.videoId);
                onRefresh();
              }}
            >
              <TrashIcon size={14} />
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
