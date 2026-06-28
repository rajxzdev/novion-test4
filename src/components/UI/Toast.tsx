'use client';

import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { CheckIcon, MoreHorizontalIcon, TrashIcon, XIcon } from '@/components/icons';
import styles from './Toast.module.css';

const iconMap = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  info: <MoreHorizontalIcon size={16} />,
  warning: <TrashIcon size={16} />,
};

export const Toast = () => {
  const { toasts } = useToast();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={cn(styles.toast, styles[toast.type])}>
          <div className={styles.icon}>{iconMap[toast.type]}</div>
          <div className={styles.message}>{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
