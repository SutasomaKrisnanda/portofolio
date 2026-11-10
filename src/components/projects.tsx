'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ModeId, PortfolioModeConfig, Project } from '@/data/portfolio-data';
import { VectorArrowGlyph } from './geometric-glyphs';
import { ProjectModeIcon } from './project-mode-icon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectsProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  projects: Project[];
  onOpenProject: (project: Project) => void;
  scrollMode?: 'normal' | 'snap';
}

export default function Projects({
  modeConfig,
  activeMode,
  projects,
  onOpenProject,
  scrollMode = 'normal'
}: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (categoryTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryTrackRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryTrackRef.current) {
      const scrollAmount = 240;
      categoryTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Synchronize category selection and scroll position on mode transition
  useEffect(() => {
    setSelectedCategory('All');
    if (categoryTrackRef.current) {
      categoryTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setTimeout(checkScroll, 100);
  }, [activeMode]);

  useEffect(() => {
    checkScroll();
    const track = categoryTrackRef.current;
    if (track) {
      track.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        track.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [modeConfig.projectCategories]);

  // Compute category project counts per active mode
  const categoryCounts = useMemo(() => {
    const modeProjects = projects.filter(
      (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
    );
    const counts: Record<string, number> = {
      All: modeProjects.length
    };
    modeConfig.projectCategories.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = modeProjects.filter(
          (p) => p.category === cat || p.secondaryCategory === cat
        ).length;
      }
    });
    return counts;
  }, [projects, activeMode, modeConfig.projectCategories]);

  const handleCategoryClick = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(cat);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };


  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode))
      .filter((p) => {
        if (selectedCategory === 'All') return true;
        return p.category === selectedCategory || p.secondaryCategory === selectedCategory;
      })
      .filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'featured') {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        }
        if (sortBy === 'newest') {
          return b.year.localeCompare(a.year);
        }
        return a.title.localeCompare(b.title);
      });
  }, [projects, activeMode, selectedCategory, searchQuery, sortBy]);

  return (
    <section
      id="projects"
      className={`relative w-full ${
        scrollMode === 'snap'
          ? 'h-[100dvh] min-h-[100dvh] max-h-[100dvh] snap-start snap-always overflow-hidden pt-20 sm:pt-24 pb-4 px-4 sm:px-8 lg:px-12 flex flex-col'
          : 'py-20 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12'
      } text-slate-900 dark:text-white scroll-mt-0`}
    >
      <div
        data-section-scroll
        className={`relative z-10 max-w-7xl w-full mx-auto flex flex-col ${
          scrollMode === 'snap'
            ? 'flex-1 h-full min-h-0 overflow-y-auto overscroll-contain pr-1.5 custom-scrollbar space-y-6'
            : 'space-y-8'
        }`}
      >
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>02</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Karya & Rekayasa Terverifikasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Galeri Projek & Studi Kasus
            </h2>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teknologi, judul, peran..."
              aria-label="Cari projek"
              className="px-4 py-2 rounded-full text-xs bg-white/90 dark:bg-slate-900/80 ring-1 ring-slate-900/10 dark:ring-white/15 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white w-48 sm:w-60 shadow-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'newest' | 'alphabetical')}
              aria-label="Urutkan projek"
              className="px-3.5 py-2 rounded-full text-xs bg-white/90 dark:bg-slate-900/80 ring-1 ring-slate-900/10 dark:ring-white/15 text-slate-900 dark:text-white focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="featured">Unggulan</option>
              <option value="newest">Terbaru</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills Container - Compact Single Row with Dynamic Scroll Controls */}
        <div className="relative w-full flex items-center">
          {/* Left Arrow Button (Desktop) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollCategory('left')}
              aria-label="Scroll left category"
              className="hidden sm:flex absolute -left-3 z-20 w-7 h-7 rounded-full items-center justify-center bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/20 shadow-md text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Left Gradient Fade Mask */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent sm:hidden transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Single-Row Scroll Track for Mobile & Desktop */}
          <div
            ref={categoryTrackRef}
            role="group"
            aria-label="Filter kategori projek"
            className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth py-1.5 px-1 w-full"
          >
            {modeConfig.projectCategories.map((cat) => {
              const active = selectedCategory === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => handleCategoryClick(cat, e)}
                  className={`px-3 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm scale-102 ring-1 ring-slate-900/20 dark:ring-white/40'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.07] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      active
                        ? 'bg-white/25 text-white dark:bg-slate-950/25 dark:text-slate-950 font-bold'
                        : 'bg-slate-200/90 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade Mask */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent sm:hidden transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Right Arrow Button (Desktop) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollCategory('right')}
              aria-label="Scroll right category"
              className="hidden sm:flex absolute -right-3 z-20 w-7 h-7 rounded-full items-center justify-center bg-white dark:bg-slate-900 border border-slate-900/10 dark:border-white/20 shadow-md text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>


        {/* Natural Project Cards Grid */}
        <div>
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-12 text-center space-y-4 shadow-sm">
              <div className="text-sm font-normal text-slate-600 dark:text-slate-300">
                Tidak ada projek yang sesuai dengan kata kunci atau filter ini
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredProjects.map((project, idx) => (
                <article
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="group relative cursor-pointer rounded-2xl bg-white/85 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Row: Combined Clean Metadata */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white/90 uppercase tracking-wider text-[11px]">{project.category}</span>
                      <span className="font-mono text-[11px] opacity-75">0{idx + 1} • {project.year}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-950 dark:text-white leading-snug group-hover:underline">
                        {project.title}
                      </h3>
                      <div className="shrink-0 w-12 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                        <ProjectModeIcon
                          mode={activeMode}
                          project={project}
                          index={idx}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal line-clamp-3 leading-relaxed">
                      {project.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologies.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 font-normal"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400 dark:text-slate-500 font-mono">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-semibold group-hover:text-slate-950 dark:group-hover:text-white">Buka Studi Kasus</span>
                    <VectorArrowGlyph direction="diagonal" className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
