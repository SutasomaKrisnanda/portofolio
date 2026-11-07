'use client';

import React from 'react';
import {
  ModeId,
  GLOBAL_PROFILE
} from '@/data/portfolio-data';
import { PinwheelGlyph } from './geometric-glyphs';
import { Github, Linkedin, Download, ArrowUp } from 'lucide-react';

interface FooterProps {
  activeMode: ModeId;
  onSwitchMode: (mode: ModeId) => void;
  onScrollToTop: () => void;
}

export default function Footer({
  activeMode,
  onSwitchMode,
  onScrollToTop
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const modeButtons = [
    { id: 'tech' as ModeId, label: '01 Tech' },
    { id: 'medical' as ModeId, label: '02 Medical' },
    { id: 'academic' as ModeId, label: '03 Academic' }
  ];

  return (
    <footer className="w-full max-w-7xl mx-auto rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/75 dark:bg-black/40 backdrop-blur-xl py-2.5 px-4 sm:px-6 text-slate-800 dark:text-white shrink-0 shadow-md dark:shadow-lg mt-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-white/70">
        <div className="flex items-center gap-2.5">
          <PinwheelGlyph className="w-4 h-4 text-slate-900 dark:text-white/80" />
          <span>&copy; {currentYear} {GLOBAL_PROFILE.fullName}</span>
        </div>

        {/* Quick Mode Switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {modeButtons.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSwitchMode(m.id)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border transition-all cursor-pointer ${
                activeMode === m.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold border-slate-950 dark:border-white shadow-sm'
                  : 'border-slate-900/10 dark:border-white/15 text-slate-600 dark:text-white/70 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={GLOBAL_PROFILE.cvPath}
            download={GLOBAL_PROFILE.cvFileName}
            className="text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white transition-colors flex items-center gap-1 text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span>CV</span>
          </a>
          <a
            href={GLOBAL_PROFILE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href={GLOBAL_PROFILE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onScrollToTop}
            aria-label="Kembali ke atas"
            className="p-1 rounded-full bg-slate-900/5 hover:bg-slate-900/15 border border-slate-900/10 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white transition-transform hover:-translate-y-0.5 cursor-pointer ml-1"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
