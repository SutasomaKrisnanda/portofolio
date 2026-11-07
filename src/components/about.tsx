'use client';

import React from 'react';
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
  Users
} from 'lucide-react';

interface AboutProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
}

export default function About({ modeConfig, activeMode }: AboutProps) {
  const filteredExperience = PORTFOLIO_EXPERIENCE.filter(
    (entry) => entry.modes.includes(activeMode)
  );

  const filteredCommittees = PORTFOLIO_COMMITTEES.filter(
    (entry) => entry.modes.includes(activeMode)
  );

  return (
    <section
      id="about"
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-20 text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col h-full max-h-[88vh] justify-between space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-900/10 dark:border-white/15 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/70">
              <span>03</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/40" />
              <span>Identitas, Pendidikan & Pengalaman</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-slate-950 dark:text-white">
              Tentang Saya & Rekam Jejak
            </h2>
          </div>

          {/* Quick CV Download Action */}
          <div className="flex items-center gap-2">
            <a
              href={GLOBAL_PROFILE.cvPath}
              download={GLOBAL_PROFILE.cvFileName}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </a>
            <a
              href={GLOBAL_PROFILE.cvPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/10 text-slate-800 dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/25 dark:text-white transition-all cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Tab</span>
            </a>
          </div>
        </div>

        {/* Scrollable Content Grid */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns: Profile Bio & Problem-Solving Approach */}
            <div className="lg:col-span-7 space-y-4">
              {/* Profile Card */}
              <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 sm:p-6 space-y-4 shadow-md dark:shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-slate-900/20 dark:border-white/30 shadow-md shrink-0">
                    <Image
                      src={GLOBAL_PROFILE.avatarUrl}
                      alt={GLOBAL_PROFILE.fullName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-wide">
                      {GLOBAL_PROFILE.fullName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-white/80 font-light mt-0.5">
                      {GLOBAL_PROFILE.currentProgram} • {GLOBAL_PROFILE.university}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-white/60 font-mono mt-0.5">
                      NIM: {GLOBAL_PROFILE.nim} • {GLOBAL_PROFILE.cohort}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm font-light text-slate-700 dark:text-white/85 leading-relaxed border-t border-slate-900/10 dark:border-white/15 pt-3">
                  {modeConfig.about.introParagraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Methodological Principles */}
                <div className="pt-2 border-t border-slate-900/10 dark:border-white/15 space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-white/70 font-semibold">
                    Prinsip Kerja & Metodologi
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {modeConfig.about.problemSolvingApproach.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-[11px] text-slate-700 dark:text-white/80">
                        <strong className="text-slate-950 dark:text-white block mb-0.5">0{idx + 1}.</strong>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Organizational Governance & Leadership */}
              <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                  <Users className="w-4 h-4 text-slate-700 dark:text-white/80" />
                  <span>Pengalaman Organisasi</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredExperience.map((exp) => (
                    <div key={exp.id} className="p-3 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 space-y-1">
                      <div className="text-xs font-semibold text-slate-950 dark:text-white">{exp.role}</div>
                      <div className="text-[11px] text-slate-700 dark:text-white/75">{exp.organization}</div>
                      <div className="text-[10px] text-slate-500 dark:text-white/50 font-mono">{exp.period}</div>
                      <p className="text-[11px] text-slate-600 dark:text-white/70 font-light pt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Education, Committees, Personal Info & Coordinates */}
            <div className="lg:col-span-5 space-y-4">
              {/* Formal Education */}
              <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3 shadow-md dark:shadow-xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                  <GraduationCap className="w-4 h-4 text-slate-700 dark:text-white/80" />
                  <span>Pendidikan Formal</span>
                </div>
                <div className="space-y-2.5">
                  {PORTFOLIO_EDUCATION.map((edu) => (
                    <div key={edu.id} className="p-3 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-950 dark:text-white">{edu.institution}</span>
                        <span className="text-[10px] text-slate-500 dark:text-white/50 font-mono">{edu.period}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 dark:text-white/80">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committees & Event Roles */}
              {filteredCommittees.length > 0 && (
                <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3 shadow-md dark:shadow-xl">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                    Kepanitiaan & Tanggung Jawab Acara
                  </div>
                  <div className="space-y-2">
                    {filteredCommittees.map((com) => (
                      <div key={com.id} className="p-2.5 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-xs flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-slate-950 dark:text-white">{com.role} — {com.event}</div>
                          <div className="text-[10px] text-slate-600 dark:text-white/60">{com.organization}</div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-white/50 shrink-0">{com.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Data Coordinates & Contact Directs */}
              <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3 text-xs shadow-md dark:shadow-xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-900/10 dark:border-white/15 pb-2">
                  Data Pribadi & Sosial
                </div>
                <div className="space-y-2 text-slate-700 dark:text-white/80">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
                    <span>Lahir: {GLOBAL_PROFILE.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
                    <span>{GLOBAL_PROFILE.origin} ({GLOBAL_PROFILE.location})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
                    <a href={`mailto:${GLOBAL_PROFILE.email}`} className="hover:underline text-slate-900 dark:text-white/90">
                      {GLOBAL_PROFILE.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
                    <a href={`tel:${GLOBAL_PROFILE.phone}`} className="hover:underline text-slate-900 dark:text-white/90">
                      {GLOBAL_PROFILE.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900/10 dark:border-white/15">
                  <a
                    href={GLOBAL_PROFILE.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-[11px] inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href={GLOBAL_PROFILE.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-[11px] inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
