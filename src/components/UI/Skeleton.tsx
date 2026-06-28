import styles from './Skeleton.module.css';

export const SongCardSkeleton = () => (
  <div className={styles.song}>
    <div className={styles.thumb} />
    <div className={styles.content}>
      <div className={`${styles.line} ${styles.lineLong}`} />
      <div className={`${styles.line} ${styles.lineShort}`} />
    </div>
  </div>
);

export const PlaylistCardSkeleton = () => (
  <div className={styles.playlist} style={{ flexDirection: 'column' }}>
    <div className={styles.square} />
    <div className={styles.content}>
      <div className={`${styles.line} ${styles.lineLong}`} />
      <div className={`${styles.line} ${styles.lineShort}`} />
    </div>
  </div>
);
