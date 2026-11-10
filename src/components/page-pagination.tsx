'use client';

import React from 'react';
import { ModeId, PORTFOLIO_MODES } from '@/data/portfolio-data';

interface PagePaginationProps {
  sections: { id: string; label: string }[];
  activeSection: string;
  activeMode: ModeId;
  onNavigateSection: (sectionId: string) => void;
}

export const PagePagination: React.FC<PagePaginationProps> = ({
  sections,
  activeSection,
  activeMode,
  onNavigateSection
}) => {
  const currentMode = PORTFOLIO_MODES[activeMode];

  return (
    <nav
      aria-label="Navigasi Halaman"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 p-2.5 rounded-full bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl shadow-lg dark:shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10"
    >
      {sections.map((sec, idx) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onNavigateSection(sec.id)}
            aria-label={`Pindah ke section ${sec.label}`}
            className="group relative flex items-center justify-center cursor-pointer p-1.5 focus:outline-none"
          >
            {/* Dot Indicator */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-3 h-3 scale-110 shadow-md ring-2 ring-slate-900/10 dark:ring-white/40'
                  : 'w-2 h-2 bg-slate-400/50 dark:bg-white/35 group-hover:bg-slate-700 dark:group-hover:bg-white/80 group-hover:scale-125'
              }`}
              style={{
                backgroundColor: isActive ? currentMode.palette.accentHex : undefined
              }}
            />

            {/* Hover Tooltip Pill */}
            <span className="pointer-events-none absolute right-8 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-white/95 text-slate-900 ring-1 ring-slate-900/10 dark:bg-slate-900/95 dark:text-white dark:ring-white/15 whitespace-nowrap opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shadow-xl">
              0{idx + 1} • {sec.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
