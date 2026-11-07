'use client';

import React, { useState, useMemo } from 'react';
import { ModeId, PortfolioModeConfig, Project } from '@/data/portfolio-data';
import { VectorArrowGlyph, DiamondArtifactGlyph } from './geometric-glyphs';

interface ProjectsProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  projects: Project[];
  onOpenProject: (project: Project) => void;
}

export default function Projects({
  modeConfig,
  activeMode,
  projects,
  onOpenProject
}: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');

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
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-20 text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col h-full max-h-[88vh] justify-between space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-900/10 dark:border-white/15 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/70">
              <span>02</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/40" />
              <span>Karya & Rekayasa Terverifikasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-slate-950 dark:text-white">
              Galeri Projek & Studi Kasus
            </h2>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari teknologi, judul, peran..."
              aria-label="Cari projek"
              className="px-3.5 py-1.5 rounded-full text-xs bg-white/80 dark:bg-black/40 border border-slate-900/15 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 focus:outline-none focus:border-slate-900 dark:focus:border-white w-48 sm:w-56 shadow-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'newest' | 'alphabetical')}
              aria-label="Urutkan projek"
              className="px-3 py-1.5 rounded-full text-xs bg-white/80 dark:bg-black/50 border border-slate-900/15 dark:border-white/20 text-slate-900 dark:text-white focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="featured">Unggulan</option>
              <option value="newest">Terbaru</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter kategori projek">
          {modeConfig.projectCategories.map((cat, idx) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-md scale-105'
                    : 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-700 border border-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/80 dark:border-white/15 font-light'
                }`}
              >
                <span className="opacity-50 mr-1">0{idx + 1}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Project Cards Container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-8 text-center space-y-3 shadow-md">
              <div className="text-sm font-light uppercase tracking-wider text-slate-800 dark:text-white">
                Tidak ada projek yang sesuai dengan kata kunci atau filter ini
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-5 py-2 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer shadow"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
              {filteredProjects.map((project, idx) => (
                <article
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  className="group relative cursor-pointer rounded-2xl bg-white/75 hover:bg-white/90 dark:bg-black/35 dark:hover:bg-black/50 backdrop-blur-xl border border-slate-900/10 hover:border-slate-900/25 dark:border-white/20 dark:hover:border-white/50 transition-all duration-300 shadow-md dark:shadow-xl hover:-translate-y-1 p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Header Row */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-white/70 uppercase tracking-wider">
                      <span className="font-semibold text-slate-800 dark:text-white/90">{project.category}</span>
                      <span className="font-mono">0{idx + 1} • {project.year}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-950 dark:text-white leading-snug group-hover:underline">
                        {project.title}
                      </h3>
                      <div className="shrink-0 p-1 rounded-lg bg-slate-900/5 dark:bg-white/10">
                        <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-white/80 font-light line-clamp-2 leading-relaxed">
                      {project.summary}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.technologies.slice(0, 4).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-700 dark:bg-white/10 dark:border-white/15 dark:text-white/85"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 text-slate-500 dark:text-white/60">
                          +{project.technologies.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-900/10 dark:border-white/15 flex items-center justify-between text-[11px] text-slate-700 dark:text-white/90">
                    <span className="font-medium group-hover:text-slate-950 dark:group-hover:text-white">Buka Studi Kasus</span>
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
