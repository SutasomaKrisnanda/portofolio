'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project, PORTFOLIO_PROJECTS } from '@/data/portfolio-data';
import { DiamondArtifactGlyph } from './geometric-glyphs';

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
  /**
   * Optional zero-based index of the item (e.g. in grid or carousel).
   * Used by tech mode geometric glyphs to deterministically pick 1 of 3 procedural shapes.
   * If omitted, attempts to resolve from PORTFOLIO_PROJECTS or defaults to 0.
   */
  index?: number;
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
  index,
  className = 'w-8 h-8 object-contain drop-shadow',
  style,
  alt,
  width = 48,
  height = 48,
  priority = false,
}) => {
  // 1. Dynamic multi-mode resolution with defensive fallback
  const resolvedMode: ModeId = !project
    ? (mode || 'tech')
    : project.mode !== mode && !project.secondaryModes?.includes(mode)
    ? (project.mode || 'tech')
    : (mode || 'tech');

  const accessibleAlt =
    alt ||
    (project && project.title
      ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`
      : `Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`);

  // 2. Resolve deterministic index for procedural geometric glyphs
  const resolvedIndex: number =
    typeof index === 'number'
      ? index
      : project
      ? Math.max(0, PORTFOLIO_PROJECTS.findIndex((p) => p.id === project.id))
      : 0;

  // 3. For Tech mode, render the authentic restored DiamondArtifactGlyph
  if (resolvedMode === 'tech') {
    return (
      <DiamondArtifactGlyph
        visualType={project?.visualType || 'artifact'}
        index={resolvedIndex}
        className={`transition-all duration-300 ${className}`}
        style={style}
        role="img"
        aria-label={accessibleAlt}
      />
    );
  }

  // 4. Select asset for Medical / Academic modes
  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;

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
