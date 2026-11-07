'use client';

import React, { useState, useMemo } from 'react';
import {
  PortfolioModeConfig,
  ModeId,
  PORTFOLIO_ACHIEVEMENTS
} from '@/data/portfolio-data';
import { Trophy, CheckCircle } from 'lucide-react';

interface AchievementsProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
}

export default function Achievements({ activeMode }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Kompetisi & Penghargaan',
    'Program Teknis & Akademik',
    'Kontribusi Komunitas & Riset',
    'Milestone Projek Perangkat Lunak',
    'Kepenulisan & Publikasi Ilmiah'
  ];

  const filteredAchievements = useMemo(() => {
    return PORTFOLIO_ACHIEVEMENTS.filter((item) =>
      item.modes.includes(activeMode)
    ).filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    });
  }, [activeMode, selectedCategory]);

  return (
    <section
      id="achievements"
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-20 text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col h-full max-h-[88vh] justify-between space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-900/10 dark:border-white/15 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/70">
              <span>05</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/40" />
              <span>Rekam Jejak, Prestasi & Kompetisi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-slate-950 dark:text-white">
              Prestasi & Penghargaan
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter prestasi">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-md scale-105'
                    : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 border border-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/80 dark:border-white/15 font-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Interior */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-2">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="rounded-2xl bg-white/75 dark:bg-black/35 backdrop-blur-xl border border-slate-900/10 hover:border-slate-900/25 dark:border-white/15 dark:hover:border-white/35 p-4 flex flex-col justify-between space-y-3 shadow-md dark:shadow-lg transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/60">
                    <span className="font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-slate-600 dark:text-white/80" />
                      <span>{ach.category}</span>
                    </span>
                    <span className="font-mono text-slate-400 dark:text-white/50">{ach.year}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white leading-snug">
                    {ach.title}
                  </h3>

                  <div className="text-xs text-slate-800 dark:text-white/85 font-medium">{ach.organization}</div>

                  {ach.level && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider bg-slate-900/5 border border-slate-900/10 text-slate-700 dark:bg-white/10 dark:border-white/15 dark:text-white/90">
                      {ach.level}
                    </span>
                  )}

                  <p className="text-xs font-light text-slate-600 dark:text-white/75 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900/10 dark:border-white/10 text-[10px] text-slate-500 dark:text-white/65 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-slate-400 dark:text-white/50 shrink-0" />
                  <span className="truncate">{ach.evidenceLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
