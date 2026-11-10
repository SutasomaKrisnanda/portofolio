'use client';

import React from 'react';
import {
  PortfolioModeConfig,
  ModeId,
  ServiceItem
} from '@/data/portfolio-data';
import { VectorArrowGlyph } from './geometric-glyphs';

interface SkillsProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  onSelectService: (service: ServiceItem) => void;
  scrollMode?: 'normal' | 'snap';
}

export default function Skills({ modeConfig, onSelectService, scrollMode = 'normal' }: SkillsProps) {
  return (
    <section
      id="skills"
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>04</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Kompetensi & Ruang Lingkup Kolaborasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Keahlian & Layanan Kolaboratif
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md font-normal hidden sm:block leading-relaxed">
            Kompetensi nyata yang dipasangkan dengan konteks implementasi praktis tanpa rating persentase artifisial.
          </p>
        </div>

        {/* Natural Content Stream */}
        <div className="space-y-8">
          {/* Integrity Notice Banner (If present in this mode) */}
          {modeConfig.integrityNotice && (
            <div className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
              <strong className="text-slate-950 dark:text-white block mb-1 uppercase tracking-wider text-[11px] font-semibold">
                Pemberitahuan Integritas & Status Akademik
              </strong>
              {modeConfig.integrityNotice}
            </div>
          )}

          {/* Part 1: Domain Skill Clusters */}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-4">
              Gugus Keahlian & Pengetahuan Terapan
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {modeConfig.skills.map((group, gIdx) => (
                <div
                  key={group.id}
                  className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
                    <h3 className="text-xs font-semibold text-slate-950 dark:text-white tracking-wide">
                      {group.category}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400">0{gIdx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">{group.subtitle}</p>

                  <div className="space-y-2 pt-1">
                    {group.items.map((skill, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs">
                        <div className="font-semibold text-slate-950 dark:text-white text-xs">{skill.name}</div>
                        <div className="text-[11px] font-normal text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{skill.context}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Part 2: Collaboration Services */}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-4">
              Ruang Lingkup Layanan Kolaborasi
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modeConfig.services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-2.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">
                      {srv.category}
                    </span>
                    <h4 className="text-base font-semibold text-slate-950 dark:text-white leading-snug">
                      {srv.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        Luaran & Deliverables:
                      </div>
                      {srv.deliverables.map((del, i) => (
                        <div key={i} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 font-normal">
                          <span className="text-slate-400 dark:text-slate-500">•</span>
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{srv.pricingNote}</div>
                    <button
                      type="button"
                      onClick={() => onSelectService(srv)}
                      className="w-full py-2.5 px-4 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold tracking-wider hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <span>Ajukan Diskusi</span>
                      <VectorArrowGlyph direction="right" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
