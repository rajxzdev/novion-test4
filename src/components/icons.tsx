'use client';

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

const baseProps = (size: number, strokeWidth: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const HomeIcon = ({ size = 22, strokeWidth = 1.8, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
  </svg>
);

export const SearchIcon = ({ size = 22, strokeWidth = 1.8, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 5 5" />
  </svg>
);

export const LibraryIcon = ({ size = 22, strokeWidth = 1.8, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M6 4v12" />
    <path d="M10 3v14" />
    <path d="M14 6v12" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="14" cy="18" r="2" />
  </svg>
);

export const HeartIcon = ({ size = 22, strokeWidth = 1.8, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M12 20.5s-7-4.438-9.333-8.277C.772 9.105 2.084 5 6.086 4.094c2.055-.465 4.092.283 5.914 2.266 1.822-1.983 3.859-2.731 5.914-2.266 4.002.906 5.314 5.011 3.419 8.129C19 16.062 12 20.5 12 20.5Z"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      fill="currentColor"
    />
  </svg>
);

export const SettingsIcon = ({ size = 22, strokeWidth = 1.8, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5Z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.94a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1-1.57V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9c0 .69.41 1.31 1.04 1.58.17.07.35.1.52.1H21a2 2 0 1 1 0 4h-.09c-.69 0-1.31.41-1.57 1.04Z" />
  </svg>
);

export const PlayIcon = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </svg>
);

export const PauseIcon = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
  </svg>
);

export const NextIcon = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 6.5v11l8-5.5-8-5.5Z" />
    <path d="M16 6h2v12h-2z" />
  </svg>
);

export const PrevIcon = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18 6.5v11l-8-5.5 8-5.5Z" />
    <path d="M6 6h2v12H6z" />
  </svg>
);

export const ChevronDownIcon = ({ size = 22, strokeWidth = 2, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const MoreHorizontalIcon = ({ size = 22, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="5" cy="12" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="19" cy="12" r="1.8" />
  </svg>
);

export const ShuffleIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M16 3h5v5" />
    <path d="M4 20 21 3" />
    <path d="M21 16v5h-5" />
    <path d="m15 15 6 6" />
    <path d="m4 4 5 5" />
  </svg>
);

export const RepeatIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </svg>
);

export const RepeatOneIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    <path d="M12 8v8" />
    <path d="M10.5 10 12 8l1.5 2" />
  </svg>
);

export const PlusIcon = ({ size = 22, strokeWidth = 2, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const UploadIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 20h16" />
  </svg>
);

export const DownloadIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M12 4v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export const TrashIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M7 7l1 13h8l1-13" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const RefreshCcwIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const ClockIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const CheckIcon = ({ size = 22, strokeWidth = 2.2, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export const XIcon = ({ size = 22, strokeWidth = 2.2, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const MusicNoteIcon = ({ size = 22, strokeWidth = 1.9, ...props }: IconProps) => (
  <svg {...baseProps(size, strokeWidth)} {...props}>
    <path d="M9 18a2 2 0 1 1-4 0c0-1.1.9-2 2-2 .74 0 1.39.4 1.73 1V6l10-2v10" />
    <path d="M19 14a2 2 0 1 1-4 0c0-1.1.9-2 2-2 .74 0 1.39.4 1.73 1" />
  </svg>
);
