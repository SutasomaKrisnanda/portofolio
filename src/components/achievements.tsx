'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  PortfolioModeConfig,
  ModeId,
  PORTFOLIO_ACHIEVEMENTS
} from '@/data/portfolio-data';
import { Trophy, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AchievementsProps {
  modeConfig?: PortfolioModeConfig;
  activeMode: ModeId;
  scrollMode?: 'normal' | 'snap';
}

export default function Achievements({ activeMode, scrollMode = 'normal' }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollTrackRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollTrackRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (scrollTrackRef.current) {
      const scrollAmount = 240;
      scrollTrackRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // 1. Reset selectedCategory to 'All' and reset horizontal scroll when activeMode changes
  useEffect(() => {
    setSelectedCategory('All');
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setTimeout(checkScroll, 100);
  }, [activeMode]);

  // 2. Filter achievements belonging to the active mode
  const modeAchievements = useMemo(() => {
    return PORTFOLIO_ACHIEVEMENTS.filter((item) =>
      item.modes.includes(activeMode)
    );
  }, [activeMode]);

  // 3. Compute active non-empty categories with count badges for the current activeMode
  const categoriesWithCounts = useMemo(() => {
    const CANONICAL_CATEGORIES = [
      'Kompetisi & Penghargaan',
      'Program Teknis & Akademik',
      'Kontribusi Komunitas & Riset',
      'Milestone Projek Perangkat Lunak',
      'Kepenulisan & Publikasi Ilmiah'
    ];

    const counts: Record<string, number> = {
      All: modeAchievements.length
    };

    modeAchievements.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    const activeList = ['All'];

    // Add canonical categories that have at least 1 achievement in this activeMode
    CANONICAL_CATEGORIES.forEach((cat) => {
      if ((counts[cat] || 0) > 0) {
        activeList.push(cat);
      }
    });

    // Guard against any category in dataset not present in CANONICAL_CATEGORIES
    modeAchievements.forEach((item) => {
      if (!activeList.includes(item.category)) {
        activeList.push(item.category);
      }
    });

    return activeList.map((cat) => ({
      name: cat,
      count: counts[cat] || 0
    }));
  }, [modeAchievements]);

  // 4. Filter achievements based on selectedCategory
  const filteredAchievements = useMemo(() => {
    return modeAchievements.filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    });
  }, [modeAchievements, selectedCategory]);

  // 5. Auto-scroll active pill into view on tap
  const handleSelectCategory = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(cat);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  return (
    <section
      id="achievements"
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
        {/* Dedicated Clean Header Bar (Separated from Filter Row) */}
        <div className="border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>05</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Rekam Jejak, Prestasi & Kompetisi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Prestasi & Penghargaan
            </h2>
          </div>
        </div>

        {/* Dedicated Filter Row - Compact Single Row with Dynamic Scroll Controls */}
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
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 sm:hidden transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Single-Row Scroll Track */}
          <div
            ref={scrollTrackRef}
            role="group"
            aria-label="Filter kategori prestasi"
            className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth py-1.5 px-1 w-full"
          >
            {categoriesWithCounts.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={(e) => handleSelectCategory(cat.name, e)}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                    isSelected
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm scale-102 ring-1 ring-slate-900/20 dark:ring-white/40'
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.07] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none transition-colors ${
                      isSelected
                        ? 'bg-white/25 text-white dark:bg-slate-950/25 dark:text-slate-950 font-bold'
                        : 'bg-slate-200/90 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-slate-200'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade Mask */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 sm:hidden transition-opacity duration-300 ${
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

        {/* Natural Cards Grid or Empty State */}
        {filteredAchievements.length === 0 ? (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-12 text-center space-y-4 shadow-sm">
            <div className="text-sm font-normal text-slate-600 dark:text-slate-300">
              Tidak ada prestasi dalam kategori ini
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white/90 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{ach.category}</span>
                  </span>
                  <span className="font-mono text-[11px] opacity-75">{ach.year}</span>
                </div>

                <h3 className="text-base font-semibold text-slate-950 dark:text-white leading-snug">
                  {ach.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-normal">
                  <span className="font-semibold text-slate-800 dark:text-white/90">{ach.organization}</span>
                  {ach.level && (
                    <>
                      <span>•</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {ach.level}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate text-[11px] font-normal">{ach.evidenceLabel}</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
