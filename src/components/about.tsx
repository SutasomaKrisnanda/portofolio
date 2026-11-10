'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ModeId,
  PortfolioModeConfig,
  GLOBAL_PROFILE,
  PORTFOLIO_EDUCATION,
  PORTFOLIO_EXPERIENCE,
  PORTFOLIO_COMMITTEES
} from '@/data/portfolio-data';
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Github,
  Linkedin,
  GraduationCap,
  ExternalLink,
  Download,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';

interface AboutProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  scrollMode?: 'normal' | 'snap';
}

type TimelineCategory = 'all' | 'experience' | 'committees' | 'education';

export default function About({ modeConfig, activeMode, scrollMode = 'normal' }: AboutProps) {
  const [selectedTimelineCategory, setSelectedTimelineCategory] = useState<TimelineCategory>('all');
  const [isExperienceExpanded, setIsExperienceExpanded] = useState<boolean>(false);
  const [isCommitteesExpanded, setIsCommitteesExpanded] = useState<boolean>(false);

  const filteredExperience = useMemo(() => {
    return PORTFOLIO_EXPERIENCE.filter((entry) => entry.modes.includes(activeMode));
  }, [activeMode]);

  const filteredCommittees = useMemo(() => {
    return PORTFOLIO_COMMITTEES.filter((entry) => entry.modes.includes(activeMode));
  }, [activeMode]);

  const DEFAULT_VISIBLE_COUNT = 3;

  const visibleExperience = useMemo(() => {
    if (isExperienceExpanded || selectedTimelineCategory === 'experience') {
      return filteredExperience;
    }
    return filteredExperience.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [filteredExperience, isExperienceExpanded, selectedTimelineCategory]);

  const visibleCommittees = useMemo(() => {
    if (isCommitteesExpanded || selectedTimelineCategory === 'committees') {
      return filteredCommittees;
    }
    return filteredCommittees.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [filteredCommittees, isCommitteesExpanded, selectedTimelineCategory]);

  return (
    <section
      id="about"
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
              <span>03</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Identitas, Rekam Jejak & Sistem Bento Pintar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Tentang Saya & Rekam Jejak
            </h2>
          </div>

          {/* Quick CV Download Action */}
          <div className="flex items-center gap-2.5">
            <a
              href={GLOBAL_PROFILE.cvPath}
              download={GLOBAL_PROFILE.cvFileName}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </a>
            <a
              href={GLOBAL_PROFILE.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Tab</span>
            </a>
          </div>
        </div>

        {/* Bento Grid: Tier 1 — Core Identity & Personal Coordinates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Profile Bio & Problem-Solving Approach (8 Columns) */}
          <div className="lg:col-span-8 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-slate-900/10 dark:ring-white/20 shadow-md shrink-0">
                  <Image
                    src={GLOBAL_PROFILE.avatarUrl}
                    alt={GLOBAL_PROFILE.fullName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-950 dark:text-white tracking-wide">
                    {GLOBAL_PROFILE.fullName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal mt-0.5">
                    {GLOBAL_PROFILE.currentProgram} • {GLOBAL_PROFILE.university}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    NIM: {GLOBAL_PROFILE.nim} • Angkatan {GLOBAL_PROFILE.cohort}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.06] pt-4">
                {modeConfig.about.introParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Methodological Principles */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>Prinsip Kerja & Metodologi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {modeConfig.about.problemSolvingApproach.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-950 dark:text-white block mb-1 font-semibold">0{idx + 1}.</strong>
                    <span className="font-normal leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Personal Data Coordinates & Contact Directs (4 Columns) */}
          <div className="lg:col-span-4 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-100 dark:border-white/[0.06] pb-3">
                Data Pribadi & Sosial
              </div>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-normal">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Lahir: {GLOBAL_PROFILE.birthDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{GLOBAL_PROFILE.origin} ({GLOBAL_PROFILE.location})</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${GLOBAL_PROFILE.email}`} className="hover:underline text-slate-900 dark:text-white font-medium break-all">
                    {GLOBAL_PROFILE.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${GLOBAL_PROFILE.phone}`} className="hover:underline text-slate-900 dark:text-white font-medium">
                    {GLOBAL_PROFILE.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Tautan Cepat</div>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={GLOBAL_PROFILE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href={GLOBAL_PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Bento Grid Header & Interactive Adaptive Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
            <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>Sistem Bento Pintar — Rekam Jejak Adaptif</span>
          </div>

          {/* Adaptive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-slate-100/90 dark:bg-white/[0.06] border border-slate-900/5 dark:border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSelectedTimelineCategory('all')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                selectedTimelineCategory === 'all'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-normal'
              }`}
            >
              <span>Semua</span>
              <span className="text-[10px] font-mono opacity-70">
                {filteredExperience.length + filteredCommittees.length + PORTFOLIO_EDUCATION.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTimelineCategory('experience')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                selectedTimelineCategory === 'experience'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-normal'
              }`}
            >
              <span>Organisasi</span>
              <span className="text-[10px] font-mono opacity-70">{filteredExperience.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTimelineCategory('committees')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                selectedTimelineCategory === 'committees'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-normal'
              }`}
            >
              <span>Kepanitiaan</span>
              <span className="text-[10px] font-mono opacity-70">{filteredCommittees.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTimelineCategory('education')}
              className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                selectedTimelineCategory === 'education'
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-normal'
              }`}
            >
              <span>Pendidikan</span>
              <span className="text-[10px] font-mono opacity-70">{PORTFOLIO_EDUCATION.length}</span>
            </button>
          </div>
        </div>

        {/* Bento Grid: Tier 2 — Adaptive Dynamic Timeline Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Formal Education Banner (Full 12 cols when 'all' or 'education') */}
          {(selectedTimelineCategory === 'all' || selectedTimelineCategory === 'education') && (
            <div className="lg:col-span-12 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                  <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>Pendidikan Formal</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {PORTFOLIO_EDUCATION.length} Riwayat
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {PORTFOLIO_EDUCATION.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="font-semibold text-slate-950 dark:text-white">{edu.institution}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{edu.period}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-normal mt-1">{edu.degree}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizational Experience Block */}
          {(selectedTimelineCategory === 'all' || selectedTimelineCategory === 'experience') && (
            <div
              className={`${
                selectedTimelineCategory === 'experience' ? 'lg:col-span-12' : 'lg:col-span-6'
              } rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                    <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Pengalaman Organisasi</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {filteredExperience.length} Peran
                  </span>
                </div>

                <div className={`grid ${selectedTimelineCategory === 'experience' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3.5`}>
                  {visibleExperience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-xs font-semibold text-slate-950 dark:text-white">{exp.role}</div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono shrink-0">{exp.period}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">{exp.organization}</div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal pt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Expand/Collapse Toggle when in 'all' view and count exceeds limit */}
              {selectedTimelineCategory === 'all' && filteredExperience.length > DEFAULT_VISIBLE_COUNT && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExperienceExpanded(!isExperienceExpanded)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isExperienceExpanded ? (
                      <>
                        <span>Tampilkan Ringkas</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Lihat Semua (+{filteredExperience.length - DEFAULT_VISIBLE_COUNT} Organisasi)</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Committees & Event Roles Block */}
          {(selectedTimelineCategory === 'all' || selectedTimelineCategory === 'committees') && filteredCommittees.length > 0 && (
            <div
              className={`${
                selectedTimelineCategory === 'committees' ? 'lg:col-span-12' : 'lg:col-span-6'
              } rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                    <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Kepanitiaan & Tanggung Jawab Acara</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {filteredCommittees.length} Event
                  </span>
                </div>

                <div className={`grid ${selectedTimelineCategory === 'committees' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {visibleCommittees.map((com) => (
                    <div key={com.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-950 dark:text-white">{com.role} — {com.event}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 font-normal mt-0.5">{com.organization}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 shrink-0">{com.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Expand/Collapse Toggle when in 'all' view and count exceeds limit */}
              {selectedTimelineCategory === 'all' && filteredCommittees.length > DEFAULT_VISIBLE_COUNT && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCommitteesExpanded(!isCommitteesExpanded)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/10 text-xs text-slate-700 dark:text-slate-300 font-medium inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isCommitteesExpanded ? (
                      <>
                        <span>Tampilkan Ringkas</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Lihat Semua (+{filteredCommittees.length - DEFAULT_VISIBLE_COUNT} Kepanitiaan)</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
