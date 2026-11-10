'use client';

import React from 'react';
import {
  ModeId,
  GLOBAL_PROFILE
} from '@/data/portfolio-data';
import { PinwheelGlyph } from './geometric-glyphs';
import { Github, Linkedin, Download, ArrowUp } from 'lucide-react';
import { getAssetPath } from '@/lib/utils';

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
    <footer className="w-full max-w-7xl mx-auto rounded-2xl ring-1 ring-slate-900/5 dark:ring-white/10 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl py-3 px-5 sm:px-7 text-slate-800 dark:text-white shrink-0 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          <PinwheelGlyph className="w-4 h-4 text-slate-900 dark:text-white" />
          <span>&copy; {currentYear} {GLOBAL_PROFILE.fullName}</span>
        </div>

        {/* Quick Mode Switchers */}
        <div className="flex flex-wrap items-center gap-1.5">
          {modeButtons.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSwitchMode(m.id)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                activeMode === m.id
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-slate-300 font-normal'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getAssetPath(GLOBAL_PROFILE.cvPath)}
            download={GLOBAL_PROFILE.cvFileName}
            className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
          >
            <Download className="w-3 h-3" />
            <span>CV</span>
          </a>
          <a
            href={GLOBAL_PROFILE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
          </a>
          <a
            href={GLOBAL_PROFILE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onScrollToTop}
            aria-label="Kembali ke atas"
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-transform hover:-translate-y-0.5 cursor-pointer ml-1"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
