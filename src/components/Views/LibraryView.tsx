'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Playlist, Song } from '@/types';
import { createPlaylist, deletePlaylist, exportPlaylist, getPlaylists, importFromFile, renamePlaylist } from '@/lib/storage';
import { Modal } from '@/components/UI/Modal';
import { PlaylistDetail } from './PlaylistDetail';
import styles from './LibraryView.module.css';
import { useToast } from '@/contexts/ToastContext';
import { DownloadIcon, MusicNoteIcon, PlusIcon, TrashIcon, UploadIcon } from '@/components/icons';

interface LibraryViewProps {
  onAddToPlaylist: (song: Song) => void;
}

export const LibraryView = ({ onAddToPlaylist }: LibraryViewProps) => {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Playlist | null>(null);

  const refresh = () => {
    const next = getPlaylists();
    setPlaylists(next);
    if (selected) {
      setSelected(next.find((item) => item.id === selected.id) || null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const content = useMemo(() => {
    if (selected) {
      return <PlaylistDetail playlist={selected} onBack={() => setSelected(null)} onRefresh={refresh} onAddToPlaylist={onAddToPlaylist} />;
    }

    return (
      <>
        <div className={styles.header}>
          <div className={styles.title}>Library</div>
          <button className={styles.importBtn} onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadIcon size={16} />
            Import Playlist
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const result = await importFromFile(file);
              showToast(result.message, result.success ? 'success' : 'error');
              refresh();
            }}
          />
        </div>
        <div className={styles.grid}>
          {playlists.map((playlist) => (
            <div key={playlist.id} className={styles.card}>
              <div className={styles.collage} onClick={() => setSelected(playlist)}>
                {playlist.songs.slice(0, 4).map((song) => <img key={song.videoId} src={song.thumbnail} alt={song.title} />)}
                {playlist.songs.length === 0 ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className={styles.placeholder}><MusicNoteIcon size={18} /></div>
                )) : null}
              </div>
              <div className={styles.row}>
                <div>
                  <div className={styles.name}>{playlist.name}</div>
                  <div className={styles.count}>{playlist.songs.length} lagu</div>
                </div>
              </div>
              <div className={styles.menu}>
                <button className={styles.smallBtn} onClick={() => {
                  const next = window.prompt('Rename playlist', playlist.name);
                  if (!next) return;
                  renamePlaylist(playlist.id, next);
                  refresh();
                }}>Rename</button>
                <button className={styles.smallBtn} onClick={() => exportPlaylist(playlist)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <DownloadIcon size={14} />
                  Export
                </button>
                <button className={styles.smallBtn} onClick={() => {
                  if (window.confirm('Hapus playlist ini?')) {
                    deletePlaylist(playlist.id);
                    refresh();
                  }
                }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <TrashIcon size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className={styles.fab} onClick={() => setCreateOpen(true)} aria-label="Create playlist">
          <PlusIcon size={24} />
        </button>
      </>
    );
  }, [onAddToPlaylist, playlists, selected, showToast]);

  return (
    <div className={styles.view}>
      {content}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3>Buat Playlist</h3>
          <input className="input-reset" style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.08)' }} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama playlist" />
          <button style={{ padding: '14px 16px', borderRadius: 16, background: 'var(--primary)', color: 'white' }} onClick={() => {
            createPlaylist(name || 'Playlist Baru');
            setName('');
            setCreateOpen(false);
            refresh();
            showToast('Playlist berhasil dibuat.', 'success');
          }}>Create</button>
        </div>
      </Modal>
    </div>
  );
};
