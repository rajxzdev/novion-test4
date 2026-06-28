'use client';

import { useState } from 'react';
import type { Song } from '@/types';
import { addSongToPlaylist, createPlaylist, getPlaylists } from '@/lib/storage';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from './UI/Modal';

interface AddToPlaylistModalProps {
  open: boolean;
  song: Song | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export const AddToPlaylistModal = ({ open, song, onClose, onUpdated }: AddToPlaylistModalProps) => {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState(getPlaylists());

  const refresh = () => {
    setPlaylists(getPlaylists());
    onUpdated?.();
  };

  return (
    <Modal open={open} onClose={onClose} variant="sheet">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ fontSize: 18 }}>Tambah ke Playlist</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '50vh', overflowY: 'auto' }}>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              style={{ textAlign: 'left', padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: 'white' }}
              onClick={() => {
                if (!song) return;
                if (playlist.songs.some((item) => item.videoId === song.videoId)) {
                  showToast('Sudah ada di playlist ini', 'warning');
                  return;
                }
                addSongToPlaylist(playlist.id, song);
                showToast('Lagu ditambahkan ke playlist', 'success');
                refresh();
                onClose();
              }}
            >
              <div>{playlist.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{playlist.songs.length} lagu</div>
            </button>
          ))}
          {playlists.length === 0 ? <div style={{ opacity: 0.7 }}>Belum ada playlist.</div> : null}
        </div>
        <button
          style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(var(--primary-rgb),0.18)', color: 'var(--primary)' }}
          onClick={() => {
            const name = window.prompt('Nama playlist baru');
            if (!name) return;
            createPlaylist(name);
            refresh();
            showToast('Playlist berhasil dibuat.', 'success');
          }}
        >
          Buat Playlist Baru
        </button>
      </div>
    </Modal>
  );
};
