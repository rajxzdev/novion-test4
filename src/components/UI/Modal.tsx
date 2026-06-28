'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import styles from './Modal.module.css';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: 'center' | 'sheet';
}

export const Modal = ({ open, onClose, children, variant = 'center' }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={cn(variant === 'sheet' ? styles.sheet : styles.center)} onClick={(event) => event.stopPropagation()}>
        {variant === 'sheet' ? <div className={styles.handle} /> : null}
        {children}
      </div>
    </div>
  );
};
