'use client';

import React, { useEffect, useState } from 'react';
import { Project, PortfolioModeConfig } from '@/data/portfolio-data';
import { CloseCrossGlyph, VectorArrowGlyph } from './geometric-glyphs';
import { useTheme } from '@/components/theme-provider';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

interface ProjectModalProps {
  project: Project | null;
  modeConfig: PortfolioModeConfig;
  onClose: () => void;
  onDiscussProject?: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  modeConfig,
  onClose,
  onDiscussProject
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const modalGradient = isLight
    ? modeConfig.palette.light.pageGradient
    : modeConfig.palette.dark.pageGradient;

  // Defensive field fallbacks (T2.5.3)
  const caseStudy = project.caseStudy || {
    overview: project.summary || '',
    backgroundAndProblem: '',
    objectives: [],
    roleAndContributions: [],
    processAndMethodology: [],
    finalOutput: '',
    resultsAndImpact: '',
    lessonsLearned: '',
    linksAndReferences: []
  };

  const technologies = project.technologies || [];
  const objectives = caseStudy.objectives || [];
  const roleAndContributions = caseStudy.roleAndContributions || [];
  const processAndMethodology = caseStudy.processAndMethodology || [];
  const linksAndReferences = caseStudy.linksAndReferences || [];

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xl overflow-hidden animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Tier 1 Outer Container: flex flex-col max-h-[90vh] overflow-hidden (Contract T1.5.3) */}
        <div
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white shadow-2xl overflow-hidden"
          style={{ background: modalGradient }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tier 2 Fixed Header: flex-shrink-0 sticky top-0 (Contract T1.5.3) */}
          <div className="flex-shrink-0 sticky top-0 z-20 flex items-start justify-between gap-4 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 border-b border-slate-900/10 dark:border-white/20 bg-white/85 dark:bg-black/70 backdrop-blur-xl">
            <div className="space-y-1 min-w-0 pr-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-white/75 font-semibold">
                <span>{project.category || 'Projek'}</span>
                {project.year && <span>• {project.year}</span>}
                {project.organization && <span>• {project.organization}</span>}
                <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] bg-slate-900/5 dark:bg-white/15 border border-slate-900/10 dark:border-white/20 font-bold">
                  {modeConfig.shortLabel}
                </span>
              </div>
              {/* Responsive Typography & Clamping (T1.5.6, T2.5.4) */}
              <h2
                id="case-study-title"
                className="text-lg sm:text-2xl lg:text-3xl font-light text-slate-950 dark:text-white tracking-wide break-words line-clamp-2"
                title={project.title}
              >
                {project.title}
              </h2>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup detail studi kasus"
                  className="p-2 sm:p-2.5 rounded-full bg-slate-900/5 hover:bg-slate-900/15 border border-slate-900/10 text-slate-900 dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/25 dark:text-white transition-colors cursor-pointer shrink-0"
                >
                  <CloseCrossGlyph className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs break-words text-xs">
                Tutup Modal (Esc)
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Tier 3 Scrollable Body: flex-1 overflow-y-auto custom-scrollbar (Contract T1.5.3, T1.5.4) */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 space-y-6 custom-scrollbar">
            {/* Metadata Pill Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 text-xs shadow-sm">
              <div className="min-w-0">
                <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Peran</span>
                <span className="font-semibold text-slate-950 dark:text-white break-words">{project.role || '-'}</span>
              </div>
              <div className="min-w-0">
                <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Status Kerja</span>
                <span className="font-semibold text-slate-950 dark:text-white break-words">{project.status || '-'}</span>
              </div>
              <div className="min-w-0">
                <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Visual Type</span>
                <span className="font-semibold text-slate-950 dark:text-white break-words">{project.visualType || '-'}</span>
              </div>
            </div>

            {/* 9-Point Structured Case Study */}
            <div className="space-y-6 text-xs sm:text-sm font-light leading-relaxed text-slate-700 dark:text-white/90">
              {/* 1. Ringkasan */}
              {caseStudy.overview && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    1. Ringkasan Projek
                  </h3>
                  <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.overview}</p>
                </div>
              )}

              {/* 2. Latar Belakang & Masalah */}
              {caseStudy.backgroundAndProblem && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    2. Latar Belakang & Masalah Nyata
                  </h3>
                  <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.backgroundAndProblem}</p>
                </div>
              )}

              {/* 3. Tujuan */}
              {objectives.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    3. Tujuan & Parameter Keberhasilan
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                    {objectives.map((obj, i) => (
                      <li key={i} className="break-words">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Peran & Kontribusi */}
              {roleAndContributions.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    4. Peran & Kontribusi Nyata
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                    {roleAndContributions.map((c, i) => (
                      <li key={i} className="break-words">{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 5. Alur Proses & Metodologi */}
              {processAndMethodology.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    5. Alur Proses & Metodologi
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                    {processAndMethodology.map((m, i) => (
                      <li key={i} className="break-words">{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 6. Luaran Akhir */}
              {caseStudy.finalOutput && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    6. Luaran Akhir
                  </h3>
                  <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.finalOutput}</p>
                </div>
              )}

              {/* 7. Hasil & Dampak */}
              {caseStudy.resultsAndImpact && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    7. Hasil & Dampak Nyata
                  </h3>
                  <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.resultsAndImpact}</p>
                </div>
              )}

              {/* 8. Refleksi & Pembelajaran */}
              {caseStudy.lessonsLearned && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                    8. Refleksi & Pelajaran
                  </h3>
                  <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.lessonsLearned}</p>
                </div>
              )}

              {/* 9. Tumpukan Teknologi & Tautan Bukti */}
              {(technologies.length > 0 || linksAndReferences.length > 0) && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-2">
                    9. Tumpukan Teknologi & Tautan Terverifikasi
                  </h3>
                  {technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {technologies.map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-900/5 dark:bg-white/15 border border-slate-900/10 dark:border-white/25 text-slate-800 dark:text-white/90 break-words"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {linksAndReferences.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {linksAndReferences.map((lnk, i) => (
                        <a
                          key={i}
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-sm break-words"
                        >
                          <span>{lnk.label}</span>
                          <VectorArrowGlyph direction="diagonal" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tier 4 Fixed Footer: flex-shrink-0 border-t (Contract T1.5.3) */}
          <div className="flex-shrink-0 z-20 border-t border-slate-900/10 dark:border-white/20 px-5 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white/85 dark:bg-black/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs uppercase tracking-widest border border-slate-900/20 hover:bg-slate-900/5 text-slate-800 dark:border-white/30 dark:hover:bg-white/10 dark:text-white transition-colors cursor-pointer"
            >
              ← Kembali ke Galeri
            </button>

            {onDiscussProject && (
              <button
                type="button"
                onClick={() => onDiscussProject(project)}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Diskusikan Projek Ini →
              </button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

