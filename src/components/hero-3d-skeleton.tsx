'use client';

import React from 'react';
import { ModeId } from '@/data/portfolio-data';

interface Hero3DSkeletonProps {
  mode: ModeId;
  className?: string;
}

export function Hero3DSkeleton({ mode, className = '' }: Hero3DSkeletonProps) {
  const glowColors: Record<ModeId, { ring: string; glow: string; label: string }> = {
    tech: {
      ring: 'border-cyan-400/30 dark:border-cyan-400/40',
      glow: 'bg-cyan-500/10 dark:bg-cyan-500/20 shadow-[0_0_50px_rgba(56,189,248,0.25)]',
      label: 'Memuat Engine 3D...'
    },
    medical: {
      ring: 'border-rose-400/30 dark:border-rose-400/40',
      glow: 'bg-rose-500/10 dark:bg-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.25)]',
      label: 'Memuat Model Jantung 3D...'
    },
    academic: {
      ring: 'border-amber-400/30 dark:border-amber-400/40',
      glow: 'bg-amber-500/10 dark:bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      label: 'Memuat Model Pena & Manuskrip 3D...'
    }
  };

  const themeConfig = glowColors[mode] || glowColors.tech;

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-[260px] h-[280px] sm:w-[330px] sm:h-[350px] select-none ${className}`}
      aria-label="Loading 3D visualization"
    >
      {/* Outer Orbital Ring 1 */}
      <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-slate-900/10 dark:border-white/15 animate-[spin_24s_linear_infinite]" />

      {/* Outer Orbital Ring 2 */}
      <div
        className={`absolute w-[190px] h-[190px] sm:w-[240px] sm:h-[240px] rounded-full border border-dashed ${themeConfig.ring} animate-[spin_16s_linear_infinite_reverse]`}
      />

      {/* Core Glowing Orb */}
      <div
        className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full backdrop-blur-md ${themeConfig.glow} flex items-center justify-center animate-pulse`}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-t-transparent border-slate-900/40 dark:border-white/60 animate-spin" />
      </div>

      {/* Glassmorphic Status Pill */}
      <div className="absolute bottom-4 px-3 py-1 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-slate-900/10 dark:border-white/15 text-[10px] text-slate-700 dark:text-white/80 font-medium tracking-wide flex items-center gap-2 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
        <span>{themeConfig.label}</span>
      </div>
    </div>
  );
}
