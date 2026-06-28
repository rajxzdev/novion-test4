'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ThemeName } from '@/types';
import { clearHistory, exportFullBackup, getSettings, importFromFile, saveSettings, STORAGE_KEYS } from '@/lib/storage';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { CheckIcon, DownloadIcon, MusicNoteIcon, RefreshCcwIcon, TrashIcon, UploadIcon } from '@/components/icons';
import styles from './SettingsView.module.css';

const themes: Array<{ id: ThemeName; label: string; color: string }> = [
  { id: 'default', label: 'Default', color: '#7C3AED' },
  { id: 'ocean', label: 'Ocean', color: '#0EA5E9' },
  { id: 'rose', label: 'Rose', color: '#F43F5E' },
  { id: 'emerald', label: 'Emerald', color: '#10B981' },
  { id: 'amber', label: 'Amber', color: '#F59E0B' },
  { id: 'sunset', label: 'Sunset', color: '#F97316' },
  { id: 'crimson', label: 'Crimson', color: '#DC2626' },
  { id: 'midnight', label: 'Midnight', color: '#6366F1' },
];

export const SettingsView = () => {
  const { currentTheme, setTheme } = useTheme();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState('Novion User');

  useEffect(() => {
    setUsername(getSettings().username);
  }, []);

  const maskedKeys = useMemo(
    () => Array.from({ length: 10 }).map((_, index) => `AIzaSy****KEY${String(index + 1).padStart(2, '0')}`),
    [],
  );

  return (
    <div className={styles.view}>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>Profile</div>
        <div className={styles.profile}>
          <div className={styles.avatar}><MusicNoteIcon size={28} /></div>
          <div style={{ flex: 1 }}>
            <div className={styles.username}>{username}</div>
            <input
              className={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onBlur={() => saveSettings({ username })}
              placeholder="Nama pengguna"
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Pilih Tema</div>
        <div className={styles.themeGrid}>
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`${styles.themeCard} ${currentTheme === theme.id ? styles.themeActive : ''}`}
              onClick={() => setTheme(theme.id)}
            >
              <div className={styles.swatch} style={{ background: theme.color }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>{theme.label}</span>
                {currentTheme === theme.id ? <CheckIcon size={14} /> : null}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Kelola Data</div>
        <div className={styles.actionList}>
          <button className={styles.actionBtn} onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UploadIcon size={18} />
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
            }}
          />
          <button className={styles.actionBtn} onClick={() => exportFullBackup()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DownloadIcon size={18} />
            Export Semua Data
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => {
              if (window.confirm('Hapus semua riwayat?')) {
                clearHistory();
                showToast('Riwayat dihapus.', 'success');
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <TrashIcon size={18} />
            Hapus Riwayat
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => {
              if (window.confirm('Reset semua data Novion?')) {
                Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
                showToast('Semua data berhasil direset.', 'success');
                window.location.reload();
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <RefreshCcwIcon size={18} />
            Reset Semua Data
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Status API Keys</div>
        <div className={styles.apiList}>
          {maskedKeys.map((key, index) => (
            <div key={key} className={styles.apiRow}>
              <span>{key}</span>
              <span className={index % 3 === 0 ? styles.statusExhausted : styles.statusActive}>
                {index % 3 === 0 ? 'Exhausted' : 'Aktif'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 13 }}>
          Key exhausted akan reset otomatis dalam 24 jam
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Tentang</div>
        <div className={styles.about}>
          <div>Novion Music Player</div>
          <div>Version 1.0.0</div>
          <div>Dibuat menggunakan Next.js</div>
        </div>
      </section>
    </div>
  );
};
