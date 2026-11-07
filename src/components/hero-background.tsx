'use client';

import React, { useState, useEffect } from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId } from '@/data/portfolio-data';
import { useTheme } from '@/components/theme-provider';

// 6 AVIF Environmental Background Assets
import bgTechDark from '@/assets/image/bg-tech-dark.avif';
import bgTechLight from '@/assets/image/bg-tech-light.avif';
import bgAcademicDark from '@/assets/image/bg-academic-dark.avif';
import bgAcademicLight from '@/assets/image/bg-academic-light.avif';
import bgMedicalDark from '@/assets/image/bg-medical-dark.avif';
import bgMedicalLight from '@/assets/image/bg-medical-light.avif';

export interface HeroBackgroundProps {
  /** Active portfolio mode ('tech' | 'medical' | 'academic') */
  mode?: ModeId;
  /** Alias for mode */
  activeMode?: ModeId;
  /** Explicit theme override ('dark' | 'light'). If omitted, resolves via useTheme() */
  theme?: 'dark' | 'light';
  /** Additional CSS utility classes */
  className?: string;
}

interface BackgroundAsset {
  src: StaticImageData;
  alt: string;
}

const HERO_BACKGROUND_ASSETS: Record<ModeId, Record<'dark' | 'light', BackgroundAsset>> = {
  tech: {
    dark: {
      src: bgTechDark,
      alt: 'Tech & Engineering Environment (Dark) - Night alpine lake, mountain ridges, and cosmic night sky'
    },
    light: {
      src: bgTechLight,
      alt: 'Tech & Engineering Environment (Light) - Sunlit snow-capped peaks and serene reflective alpine lake'
    }
  },
  academic: {
    dark: {
      src: bgAcademicDark,
      alt: 'Academic & Writing Environment (Dark) - Gothic mahogany scholar library, autumn foliage, and pedestal'
    },
    light: {
      src: bgAcademicLight,
      alt: 'Academic & Writing Environment (Light) - Neoclassical sun-drenched marble library and golden arches'
    }
  },
  medical: {
    dark: {
      src: bgMedicalDark,
      alt: 'Medical & Health Environment (Dark) - Cybernetic biotech laboratory with glowing holographic DNA helices'
    },
    light: {
      src: bgMedicalLight,
      alt: 'Medical & Health Environment (Light) - Bright clinical hospital laboratory with medical monitors'
    }
  }
};

const MODES: ModeId[] = ['tech', 'academic', 'medical'];
const THEMES: ('dark' | 'light')[] = ['dark', 'light'];

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  mode,
  activeMode,
  theme: explicitTheme,
  className = ''
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve current active mode (accepts either activeMode or mode prop)
  const currentMode: ModeId = activeMode || mode || 'tech';

  // SSR hydration safety: default to 'dark' until client mounts unless explicitTheme is provided
  const activeTheme: 'dark' | 'light' = explicitTheme || (mounted ? resolvedTheme : 'dark');
  const isLight = activeTheme === 'light';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`}
    >
      {/* 1. Six Layered AVIF Environmental Background Images (Parallel Cross-Fade) */}
      {MODES.map((m) =>
        THEMES.map((t) => {
          const asset = HERO_BACKGROUND_ASSETS[m][t];
          const isActive = m === currentMode && t === activeTheme;

          return (
            <div
              key={`${m}-${t}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={asset.src}
                alt={asset.alt}
                fill
                priority
                sizes="100vw"
                quality={90}
                unoptimized
                className="object-cover object-center select-none pointer-events-none"
              />
            </div>
          );
        })
      )}

      {/* 2. Dark Theme Contrast & Vignette Overlays (WCAG AAA Text Protection) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-20 ${
          isLight ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Base dark environmental tint */}
        <div className="absolute inset-0 bg-slate-950/30" />

        {/* Left Column Typographic Scrim: Protects title, narrative, profile badge and CTAs */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-7/12 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />

        {/* Top Header Scrim: Protects fixed navbar and hero eyebrow status pills */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-transparent" />

        {/* Bottom Shelf Scrim: Protects bottom shelf pills and carousel controls */}
        <div className="absolute bottom-0 inset-x-0 h-44 sm:h-52 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />

        {/* Right Indicators Scrim: Soft shadow behind diamond cards and 01-04 numerals */}
        <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-slate-950/60 via-slate-950/20 to-transparent hidden lg:block" />

        {/* Subtle Radial Vignette: Deepens outer frame while keeping center stage radiant */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.5)_100%)]" />
      </div>

      {/* 3. Light Theme Contrast & Vignette Overlays (WCAG AAA Text Protection) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-20 ${
          isLight ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Base light environmental tint */}
        <div className="absolute inset-0 bg-white/25" />

        {/* Left Column Typographic Scrim: Protects dark text against bright highlights */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-7/12 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />

        {/* Top Header Scrim: Protects fixed navbar and hero eyebrow status pills */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/85 via-white/30 to-transparent" />

        {/* Bottom Shelf Scrim: Protects bottom shelf pills and carousel controls */}
        <div className="absolute bottom-0 inset-x-0 h-44 sm:h-52 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />

        {/* Right Indicators Scrim: Soft highlight behind diamond cards and numerals */}
        <div className="absolute inset-y-0 right-0 w-72 bg-gradient-to-l from-white/75 via-white/25 to-transparent hidden lg:block" />

        {/* Subtle Radial Vignette: Softens light edges while keeping center stage radiant */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(255,255,255,0.45)_100%)]" />
      </div>

      {/* 4. Mode-Specific Center Pedestal Aura (Stage Highlight for 3D Models) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-20 ${
          currentMode === 'tech' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[130px] bg-sky-500/15" />
      </div>

      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-20 ${
          currentMode === 'academic' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[130px] bg-rose-500/15" />
      </div>

      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-20 ${
          currentMode === 'medical' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[130px] bg-purple-500/15" />
      </div>
    </div>
  );
};

export default HeroBackground;
