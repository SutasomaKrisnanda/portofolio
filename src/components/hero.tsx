'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ModeId,
  PortfolioModeConfig,
  Project,
  GLOBAL_PROFILE
} from '@/data/portfolio-data';
import dynamic from 'next/dynamic';
import { PrismTriangleGlyph, VectorArrowGlyph } from './geometric-glyphs';
import { HeroBackground } from './hero-background';
import { ProjectModeIcon } from './project-mode-icon';
import { useTheme } from '@/components/theme-provider';
import { Hero3DSkeleton } from './hero-3d-skeleton';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

const Hero3DScene = dynamic(
  () => import('./hero-3d-scene').then((mod) => mod.Hero3DScene),
  {
    ssr: false,
    loading: () => <Hero3DSkeleton mode="tech" />
  }
);

interface HeroProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onNavigateSection: (sectionId: string) => void;
  onSwitchMode: (mode: ModeId) => void;
}

export default function Hero({
  modeConfig,
  activeMode,
  projects,
  onOpenProject,
  onNavigateSection
}: HeroProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [heroParallax, setHeroParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // R4: Auto-reset slide index to 0 whenever activeMode changes
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [activeMode]);

  const currentTheme: 'dark' | 'light' = mounted && resolvedTheme === 'light' ? 'light' : 'dark';

  // R4: Filter projects dynamically using featured: true and active/secondary mode
  const heroSlides = useMemo(() => {
    return projects.filter(
      (p) => Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
    );
  }, [projects, activeMode]);

  const currentHeroProject = useMemo(() => {
    if (heroSlides.length === 0) return null;
    const safeIndex = ((activeSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
    return heroSlides[safeIndex] || null;
  }, [heroSlides, activeSlideIndex]);

  const handlePrevSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <section
        id="hero"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          setHeroParallax({ x: nx * 12, y: ny * 8 });
        }}
        onMouseLeave={() => setHeroParallax({ x: 0, y: 0 })}
        className="relative w-full min-h-[100dvh] lg:h-screen flex flex-col justify-between pt-16 sm:pt-20 lg:pt-24 pb-4 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
      >
        {/* R1: Dynamic Environmental Background with Smooth Cross-Fade & Contrast Vignettes */}
        <HeroBackground activeMode={activeMode} theme={currentTheme} />

        {/* Top Status Bar: Minimal & Clean */}
        <div className="relative z-20 max-w-7xl w-full mx-auto flex items-center justify-between gap-3 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/75 dark:bg-black/35 backdrop-blur-md border border-slate-900/10 dark:border-white/20 text-xs shadow-sm">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: modeConfig.palette.accentHex }}
            />
            <span className="font-semibold text-slate-950 dark:text-white tracking-wide">
              {modeConfig.shortLabel}
            </span>
            <span className="text-slate-600 dark:text-white/60 text-[11px] hidden sm:inline">• {modeConfig.tagline}</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {modeConfig.hero.verifiedHighlights.slice(0, 2).map((item, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded-full text-[11px] bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-900/10 dark:border-white/15 text-slate-700 dark:text-white/85 shadow-sm"
              >
                <strong className="text-slate-950 dark:text-white">{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>
        </div>

        {/* Main 3-Column Spatial Stage */}
        <div className="relative z-20 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center flex-1 my-auto">
          {/* Left Column: Identity, Kinetic Typography & Actions */}
          <div
            className="lg:col-span-5 space-y-4 text-left z-20"
            style={{
              transform: `translate(${heroParallax.x * 0.25}px, ${heroParallax.y * 0.25}px)`,
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-900/10 dark:border-white/20 text-[11px] uppercase tracking-wider text-slate-800 dark:text-white/90 shadow-sm">
              <span>{GLOBAL_PROFILE.fullName}</span>
              <span>•</span>
              <span>FK Undiksha</span>
            </div>

            {/* Balanced Display Typography */}
            <div className="select-none font-bold">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-slate-950 dark:text-white leading-tight">
                {modeConfig.fractalShowcase.topWord}
              </div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-wide text-slate-950 dark:text-white flex items-center mt-1 lg:ml-4">
                <span>{modeConfig.fractalShowcase.bottomWordBeforeA}</span>
                <PrismTriangleGlyph
                  leftColor={modeConfig.palette.prismLeftHex}
                  rightColor={modeConfig.palette.prismRightHex}
                  cutoutColor={modeConfig.palette.prismCutoutHex}
                  className="w-8 h-8 sm:w-10 sm:h-10 -mx-1 inline-block drop-shadow-lg transition-transform duration-500 hover:scale-110"
                />
                <span>{modeConfig.fractalShowcase.bottomWordAfterA}</span>
              </div>
            </div>

            {/* R6: Content Block Transition Animations with Reactive Key */}
            <div className="space-y-2 lg:pl-4 text-slate-700 dark:text-white/90">
              <p className="text-xs sm:text-sm font-light leading-relaxed max-w-md">
                {modeConfig.hero.supportingDescription}
              </p>
              {currentHeroProject && (
                <div
                  key={currentHeroProject.id}
                  className="animate-in fade-in slide-in-from-left-3 duration-500 motion-safe:transition-all motion-reduce:transition-none"
                >
                  <p className="text-xs text-slate-600 dark:text-white/80 max-w-md line-clamp-2 pt-1 font-light border-l-2 pl-3 border-slate-400 dark:border-white/30 hidden lg:block">
                    <strong className="text-slate-950 dark:text-white font-semibold tracking-wide">
                      Projek Terpilih:
                    </strong>{' '}
                    {currentHeroProject.title}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Only: Focused & Clean Featured Project Card */}
            {currentHeroProject && (
              <div
                key={`mobile-card-${currentHeroProject.id}`}
                onClick={() => onOpenProject(currentHeroProject)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenProject(currentHeroProject);
                  }
                }}
                aria-label={`Buka studi kasus projek terpilih: ${currentHeroProject.title}`}
                className="lg:hidden w-full max-w-md p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-900/10 dark:border-white/20 shadow-md flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-slate-900/10 dark:border-white/15">
                    <ProjectModeIcon
                      mode={activeMode}
                      project={currentHeroProject}
                      className="w-6 h-6 object-contain"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
                        Projek Terpilih 0{((activeSlideIndex % heroSlides.length) + 1)}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white truncate">
                      {currentHeroProject.title}
                    </h4>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-slate-600 dark:text-white/70 flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-full border border-slate-900/5 dark:border-white/10">
                  Detail <VectorArrowGlyph direction="right" className="w-2.5 h-2.5" />
                </span>
              </div>
            )}

            {/* Mobile Only: Clean Horizontal Slide Switcher */}
            <div className="lg:hidden flex items-center gap-2 pt-1 pb-1 select-none">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-white/60 mr-1">
                Pilih:
              </span>
              {heroSlides.map((slideProj, idx) => {
                const isSelected = (activeSlideIndex % heroSlides.length) === idx;
                return (
                  <button
                    key={`mobile-pill-${slideProj.id}`}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    aria-label={`Pilih slide 0${idx + 1}: ${slideProj.title}`}
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md scale-105'
                        : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white/70 hover:bg-white/80 dark:hover:bg-white/20'
                    } border border-slate-900/10 dark:border-white/15`}
                  >
                    0{idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons with R6 Accessible Tooltips */}
            <div className="pt-2 lg:pl-4 flex flex-wrap items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="btn-cta-detail"
                    data-testid="btn-cta-detail"
                    type="button"
                    onClick={() => {
                      if (currentHeroProject) {
                        onOpenProject(currentHeroProject);
                      } else {
                        onNavigateSection('projects');
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {modeConfig.hero.primaryCtaLabel}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-words text-xs">
                  {currentHeroProject ? `Buka Studi Kasus ${currentHeroProject.title}` : modeConfig.hero.primaryCtaLabel}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    id="btn-cta-cv"
                    data-testid="btn-cta-cv"
                    href={GLOBAL_PROFILE.cvPath}
                    download={GLOBAL_PROFILE.cvFileName}
                    className="px-5 py-3 rounded-full bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white font-medium text-xs tracking-wider transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                  >
                    <VectorArrowGlyph direction="down" className="w-3 h-3" />
                    <span>Download CV</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-words text-xs">
                  Unduh Curriculum Vitae ({GLOBAL_PROFILE.fullName})
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Center Column: 3D Scene (Enlarged on Desktop, Completely Hidden on Mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative z-20 my-1 lg:my-0">
            <Hero3DScene
              mode={activeMode}
              theme={currentTheme}
              activeSlideIndex={activeSlideIndex}
              baseHue={modeConfig.palette.crystalBaseHue}
              secondaryHue={modeConfig.palette.crystalSecondaryHue}
              onModelClick={() => {
                if (currentHeroProject) onOpenProject(currentHeroProject);
              }}
            />
            <span className="mt-2 text-[10px] uppercase tracking-widest text-slate-600 dark:text-white/70 bg-white/70 dark:bg-black/30 px-3.5 py-1 rounded-full backdrop-blur-md border border-slate-900/10 dark:border-white/15 shadow-sm">
              {activeMode === 'medical'
                ? 'Interactive 3D Heart • Drag to Rotate'
                : activeMode === 'academic'
                ? 'Interactive 3D Quill • Drag to Rotate'
                : 'Interactive 3D Polyhedron • Drag to Rotate'}
            </span>
          </div>

          {/* Right Column: Diamond Cards + R4 Dynamic Indicators (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-2 relative items-center justify-end min-h-[320px]">
            {/* Diamond Project Cards */}
            <div className="relative flex flex-col items-center gap-4 mr-10 sm:mr-16">
              {heroSlides.map((slideProj, idx) => {
                const arcOffsets = [
                  '-translate-x-4 sm:-translate-x-8',
                  '-translate-x-1 sm:-translate-x-2',
                  'translate-x-2 sm:translate-x-4',
                  'translate-x-0'
                ];
                const isCardActive = (activeSlideIndex % heroSlides.length) === idx;
                return (
                  <Tooltip key={slideProj.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (isCardActive) {
                            onOpenProject(slideProj);
                          } else {
                            setActiveSlideIndex(idx);
                          }
                        }}
                        aria-label={`${slideProj.title} — ${isCardActive ? 'Buka detail studi kasus' : 'Pilih slide'}`}
                        className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-45 transition-all duration-300 ease-out motion-safe:transition-all motion-reduce:transition-none flex items-center justify-center shadow-lg cursor-pointer ${
                          arcOffsets[idx % arcOffsets.length] || ''
                        } ${
                          isCardActive
                            ? 'bg-white ring-4 ring-slate-900/20 dark:ring-white/60 scale-110 z-20 shadow-xl'
                            : 'bg-white/80 dark:bg-white/70 hover:bg-white dark:hover:bg-white/85 opacity-90 hover:scale-105 z-10'
                        } backdrop-blur-md border border-slate-900/10 dark:border-white/70`}
                      >
                        <div className="-rotate-45 flex flex-col items-center justify-center p-1 text-center">
                          <ProjectModeIcon
                            mode={activeMode}
                            project={slideProj}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                            priority={idx === 0}
                          />
                          <span className="mt-0.5 text-[7px] uppercase tracking-wider font-bold text-slate-900 truncate max-w-[55px]">
                            {slideProj.title.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs break-words text-xs">
                      <span className="font-semibold block">{slideProj.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {isCardActive ? 'Klik untuk buka detail studi kasus' : 'Klik untuk fokus slide'}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* R4: Numbered Indicators Dynamically Adapting to heroSlides.length */}
            <div
              className="flex flex-col justify-between h-[280px] sm:h-[320px] items-end select-none"
              role="tablist"
              aria-label="Highlight projects navigation"
            >
              {heroSlides.map((slideProj, idx) => {
                const numLabel = `0${idx + 1}`;
                const isSelected = (activeSlideIndex % heroSlides.length) === idx;
                const curveIndent = [
                  '-translate-x-6 sm:-translate-x-8',
                  '-translate-x-2 sm:-translate-x-3',
                  'translate-x-1 sm:translate-x-2',
                  '-translate-x-1 sm:-translate-x-2'
                ];
                return (
                  <Tooltip key={slideProj.id}>
                    <TooltipTrigger asChild>
                      <button
                        id={`btn-indicator-${idx}`}
                        data-testid={`btn-indicator-${idx}`}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveSlideIndex(idx)}
                        aria-label={`Pilih slide ${numLabel}: ${slideProj.title}`}
                        className={`transition-all duration-300 tracking-tighter leading-none focus:outline-none cursor-pointer ${
                          curveIndent[idx % curveIndent.length]
                        } ${
                          isSelected
                            ? 'text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white drop-shadow scale-110'
                            : 'text-sm sm:text-base font-light text-slate-400 dark:text-white/50 hover:text-slate-950 dark:hover:text-white/85'
                        }`}
                      >
                        {numLabel}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs break-words text-xs">
                      <span className="font-semibold block">{slideProj.title}</span>
                      <span className="text-[10px] text-muted-foreground">{slideProj.category}</span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Minimal Shelf: "EXPLORE" & Arrow Switchers */}
        <div className="relative z-30 max-w-7xl w-full mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl bg-white/75 dark:bg-black/35 backdrop-blur-xl border border-slate-900/10 dark:border-white/15 px-5 py-3 shadow-lg dark:shadow-xl">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8">
              <button
                type="button"
                onClick={() => onNavigateSection('projects')}
                className="text-left group focus:outline-none cursor-pointer flex items-center gap-2"
              >
                <span className="text-[11px] font-bold tracking-widest uppercase text-slate-950 dark:text-white">
                  EXPLORE WORK
                </span>
                <VectorArrowGlyph direction="right" className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="hidden md:flex items-center gap-6">
                {modeConfig.fractalShowcase.bottomShelfColumns.map((col, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigateSection(col.targetSection)}
                    className="text-left group hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-white/90 group-hover:underline">
                      {col.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-white/60 ml-2 font-light">
                      {col.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Arrows with R6 Tooltips and IDs */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="btn-slide-prev"
                    data-testid="btn-slide-prev"
                    type="button"
                    onClick={handlePrevSlide}
                    aria-label="Slide sebelumnya"
                    className="w-8 h-8 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <VectorArrowGlyph direction="left" className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-words text-xs">
                  Slide Sebelumnya
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    id="btn-slide-next"
                    data-testid="btn-slide-next"
                    type="button"
                    onClick={handleNextSlide}
                    aria-label="Slide berikutnya"
                    className="w-8 h-8 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <VectorArrowGlyph direction="right" className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-words text-xs">
                  Slide Berikutnya
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}

