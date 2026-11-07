'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project } from '@/data/portfolio-data';

// Static Image Imports processed by Next.js bundler
import techIcon from '@/assets/icons/project-tech.svg';
import medicalIcon from '@/assets/icons/project-medical.svg';
import academicIcon from '@/assets/icons/project-academic.svg';

export const MODE_ICON_MAP: Record<ModeId, StaticImageData> = {
  tech: techIcon,
  medical: medicalIcon,
  academic: academicIcon,
};

// Fallback public static URLs if serving from public/icons
export const PUBLIC_ICON_MAP: Record<ModeId, string> = {
  tech: '/icons/project-tech.svg',
  medical: '/icons/project-medical.svg',
  academic: '/icons/project-academic.svg',
};

const MODE_LABELS: Record<ModeId, string> = {
  tech: 'Teknologi & Software Engineering',
  medical: 'Kedokteran & Kesehatan Komunitas',
  academic: 'Akademik & Karya Tulis Ilmiah',
};

export interface ProjectModeIconProps {
  /** Current active portfolio mode ('tech' | 'medical' | 'academic') */
  mode: ModeId;
  /**
   * Optional project reference.
   * If provided and project does not support `mode`, falls back to `project.mode`.
   */
  project?: Project | null;
  /** Custom CSS classes for sizing, drop-shadow, filter, transitions, etc. */
  className?: string;
  /** Inline CSS style overrides */
  style?: React.CSSProperties;
  /** Accessible alt description */
  alt?: string;
  /** Natural pixel width for layout reservation (default: 48) */
  width?: number;
  /** Natural pixel height for layout reservation (default: 48) */
  height?: number;
  /** Priority preload */
  priority?: boolean;
}

export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  project,
  className = 'w-8 h-8 object-contain drop-shadow',
  style,
  alt,
  width = 48,
  height = 48,
  priority = false,
}) => {
  // 1. Dynamic multi-mode resolution
  const resolvedMode: ModeId =
    project && project.mode !== mode && !project.secondaryModes?.includes(mode)
      ? project.mode
      : mode;

  // 2. Select asset
  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;
  const accessibleAlt =
    alt ||
    (project
      ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode]}`
      : `Logo Mode ${MODE_LABELS[resolvedMode]}`);

  return (
    <Image
      src={iconAsset}
      alt={accessibleAlt}
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      style={style}
      priority={priority}
      unoptimized
    />
  );
};

export default ProjectModeIcon;
