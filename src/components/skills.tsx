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
}

export default function Skills({ modeConfig, onSelectService }: SkillsProps) {
  return (
    <section
      id="skills"
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-20 text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col h-full max-h-[88vh] justify-between space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-900/10 dark:border-white/15 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/70">
              <span>04</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/40" />
              <span>Kompetensi & Ruang Lingkup Kolaborasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-slate-950 dark:text-white">
              Keahlian & Layanan Kolaboratif
            </h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-white/70 max-w-md font-light hidden sm:block">
            Kompetensi nyata yang dipasangkan dengan konteks implementasi praktis tanpa rating persentase artifisial.
          </p>
        </div>

        {/* Scrollable Interior */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
          {/* Integrity Notice Banner (If present in this mode) */}
          {modeConfig.integrityNotice && (
            <div className="rounded-xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-4 text-xs text-slate-800 dark:text-white/85 leading-relaxed shadow-sm">
              <strong className="text-slate-950 dark:text-white block mb-0.5 uppercase tracking-wider text-[10px]">
                Pemberitahuan Integritas & Status Akademik
              </strong>
              {modeConfig.integrityNotice}
            </div>
          )}

          {/* Part 1: Domain Skill Clusters */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:text-white/75 mb-3">
              Gugus Keahlian & Pengetahuan Terapan
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {modeConfig.skills.map((group, gIdx) => (
                <div
                  key={group.id}
                  className="rounded-2xl bg-white/75 dark:bg-black/35 backdrop-blur-xl border border-slate-900/10 dark:border-white/15 p-4 space-y-2.5 shadow-md dark:shadow-lg"
                >
                  <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/15 pb-2">
                    <h3 className="text-xs font-bold text-slate-950 dark:text-white tracking-wide">
                      {group.category}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-white/50">0{gIdx + 1}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-white/70 font-light leading-snug">{group.subtitle}</p>

                  <div className="space-y-1.5 pt-1">
                    {group.items.map((skill, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-xs">
                        <div className="font-medium text-slate-950 dark:text-white text-[11px]">{skill.name}</div>
                        <div className="text-[10px] font-light text-slate-600 dark:text-white/65 leading-tight mt-0.5">{skill.context}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Part 2: Collaboration Services */}
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-600 dark:text-white/75 mb-3">
              Ruang Lingkup Layanan Kolaborasi
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modeConfig.services.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl bg-white/75 dark:bg-black/35 backdrop-blur-xl border border-slate-900/10 dark:border-white/15 p-5 flex flex-col justify-between space-y-3 shadow-md dark:shadow-lg"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/60 block">
                      {srv.category}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-950 dark:text-white leading-snug">
                      {srv.title}
                    </h4>
                    <p className="text-xs font-light text-slate-600 dark:text-white/80 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-1 pt-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/60 font-semibold">
                        Luaran & Deliverables:
                      </div>
                      {srv.deliverables.map((del, i) => (
                        <div key={i} className="text-[11px] text-slate-700 dark:text-white/85 flex items-start gap-1.5 font-light">
                          <span className="text-slate-950 dark:text-white">•</span>
                          <span>{del}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900/10 dark:border-white/15 space-y-2">
                    <div className="text-[10px] text-slate-500 dark:text-white/60 font-light leading-snug">{srv.pricingNote}</div>
                    <button
                      type="button"
                      onClick={() => onSelectService(srv)}
                      className="w-full py-2.5 px-4 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
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
