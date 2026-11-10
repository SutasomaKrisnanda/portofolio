import React from 'react';
import { Project } from '@/data/portfolio-data';

export const PinwheelGlyph: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
    <path d="M22 3 L28 13 L23 13 L23 19 L19 19 L19 10 Z" fill="currentColor" />
    <path d="M41 22 L31 28 L31 23 L25 23 L25 19 L34 19 Z" fill="currentColor" />
    <path d="M22 41 L16 31 L21 31 L21 25 L25 25 L25 34 Z" fill="currentColor" />
    <path d="M3 22 L13 16 L13 21 L19 21 L19 25 L10 25 Z" fill="currentColor" />
  </svg>
);

export const PrismTriangleGlyph: React.FC<{
  leftColor: string;
  rightColor: string;
  cutoutColor: string;
  className?: string;
}> = ({ leftColor, rightColor, cutoutColor, className = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" aria-label="A" className={className}>
    <polygon points="36,6 56,56 8,44" fill={leftColor} />
    <polygon points="36,6 56,56 38,48" fill={rightColor} />
    <polygon points="34,22 43,45 21,39" fill={cutoutColor} />
  </svg>
);

export const VectorArrowGlyph: React.FC<{
  direction?: 'left' | 'right' | 'up' | 'down' | 'diagonal';
  className?: string;
}> = ({ direction = 'right', className = 'w-4 h-4' }) => {
  const rotation =
    direction === 'left'
      ? 'rotate-180'
      : direction === 'up'
      ? '-rotate-90'
      : direction === 'down'
      ? 'rotate-90'
      : direction === 'diagonal'
      ? '-rotate-45'
      : '';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`${className} ${rotation}`} aria-hidden="true">
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
      />
    </svg>
  );
};

export const CloseCrossGlyph: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
  </svg>
);

export const DiamondArtifactGlyph: React.FC<{
  visualType?: Project['visualType'] | string;
  index?: number;
  isActive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  role?: string;
}> = ({
  visualType = 'artifact',
  index = 0,
  className = 'w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md',
  style,
  'aria-label': ariaLabel,
  role,
}) => {
  const reactId = React.useId().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeType = String(visualType || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const chromeGradId = `chrome-${safeType}-${index}-${reactId}`;
  const holoGradId = `holo-${safeType}-${index}-${reactId}`;
  const holoSideGradId = `holo-side-${safeType}-${index}-${reactId}`;

  const normIndex = Math.abs(Math.floor(index));

  if (normIndex % 3 === 0) {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        style={style}
        role={role}
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={chromeGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="45%" stopColor="#64748b" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <ellipse cx="42" cy="67" rx="16" ry="4" fill="rgba(15,23,42,0.28)" />
        <path
          d="M38 12 C52 14, 56 28, 46 38 C58 46, 54 62, 38 64 C24 62, 24 46, 34 36 C24 26, 28 14, 38 12 Z"
          fill={`url(#${chromeGradId})`}
          stroke="#e2e8f0"
          strokeWidth="1.2"
        />
        <circle cx="37" cy="25" r="5" fill="#ffffff" fillOpacity="0.65" />
        <path d="M32 48 Q40 56 47 46" stroke="#94a3b8" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (normIndex % 3 === 1) {
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        style={style}
        role={role}
        aria-label={ariaLabel}
      >
        <ellipse cx="40" cy="64" rx="22" ry="5" fill="rgba(15,23,42,0.25)" />
        <polygon points="40,20 66,34 40,48 14,34" fill="#fbcfe8" stroke="#f9a8d4" strokeWidth="1" />
        <polygon points="14,34 40,48 40,60 14,46" fill="#f472b6" />
        <polygon points="66,34 40,48 40,60 66,46" fill="#db2777" />
        <polygon points="40,25 55,33 40,41 25,33" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      style={style}
      role={role}
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id={holoGradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id={holoSideGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <ellipse cx="42" cy="67" rx="14" ry="4" fill="rgba(15,23,42,0.28)" />
      <polygon points="38,14 58,22 44,30 24,22" fill="#e0f2fe" />
      <polygon points="24,22 44,30 44,58 24,50" fill={`url(#${holoGradId})`} />
      <polygon points="44,30 58,22 58,50 44,58" fill={`url(#${holoSideGradId})`} />
      <rect x="40" y="56" width="4" height="8" rx="1.5" fill="#334155" />
    </svg>
  );
};
