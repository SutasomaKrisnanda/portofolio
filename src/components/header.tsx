'use client';

import React, { useState } from 'react';
import { ModeId, PORTFOLIO_MODES, GLOBAL_PROFILE } from '@/data/portfolio-data';
import { PinwheelGlyph, CloseCrossGlyph } from './geometric-glyphs';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  activeMode: ModeId;
  onSwitchMode: (mode: ModeId) => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
}

export default function Header({
  activeMode,
  onSwitchMode,
  activeSection,
  onNavigateSection
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentMode = PORTFOLIO_MODES[activeMode];

  const navLinks = [
    { id: 'hero', label: 'Origins' },
    { id: 'projects', label: 'Projek' },
    { id: 'about', label: 'Tentang' },
    { id: 'skills', label: 'Keahlian' },
    { id: 'achievements', label: 'Prestasi' },
    { id: 'contact', label: 'Kontak' }
  ];

  const modePills = [
    {
      id: 'tech' as ModeId,
      code: '01',
      label: 'Tech & Engineering',
      dotHex: '#0284c7'
    },
    {
      id: 'medical' as ModeId,
      code: '02',
      label: 'Medical & Health',
      dotHex: '#9333ea'
    },
    {
      id: 'academic' as ModeId,
      code: '03',
      label: 'Academic & Writing',
      dotHex: '#e11d48'
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 flex flex-col gap-3">
        <div className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-2.5 rounded-full bg-white/80 dark:bg-black/45 backdrop-blur-2xl border border-slate-900/10 dark:border-white/20 shadow-lg dark:shadow-2xl transition-all">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigateSection('hero')}
            className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="transition-transform duration-500 group-hover:rotate-90 text-slate-950 dark:text-white">
              <PinwheelGlyph className="w-7 h-7" />
            </div>
            <div>
              <span className="block font-bold text-xs sm:text-sm tracking-[0.18em] uppercase text-slate-950 dark:text-white leading-tight">
                {GLOBAL_PROFILE.shortName}
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-slate-600 dark:text-white/70">
                {currentMode.shortLabel}
              </span>
            </div>
          </button>

          {/* Desktop Section Links */}
          <nav aria-label="Navigasi Utama" className="hidden lg:flex items-center gap-6 text-xs tracking-wider uppercase">
            {navLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigateSection(item.id)}
                  className={`relative py-1 transition-all cursor-pointer ${
                    isActive
                      ? 'text-slate-950 dark:text-white font-bold'
                      : 'text-slate-600 dark:text-white/70 hover:text-slate-950 dark:hover:text-white font-light'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full transition-all"
                      style={{ backgroundColor: currentMode.palette.accentHex }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Mode Switcher Pills + ThemeToggle + Mobile Trigger */}
          <div className="flex items-center gap-2">
            {/* 3 Clean Professional Mode Pills */}
            <div
              role="tablist"
              aria-label="Pemilih Mode Portfolio"
              className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/20"
            >
              {modePills.map((tab) => {
                const isSelected = activeMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => onSwitchMode(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-md scale-105'
                        : 'text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/10 font-light'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isSelected ? undefined : tab.dotHex }}
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Mobile / Tablet Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigasi dan mode"
              className="p-2.5 rounded-full bg-slate-900/10 dark:bg-white/15 hover:bg-slate-900/15 dark:hover:bg-white/25 border border-slate-900/10 dark:border-white/25 transition-colors cursor-pointer text-slate-950 dark:text-white"
            >
              <div className="w-5 flex flex-col items-end gap-1.5">
                <span className="w-5 h-[2px] bg-slate-950 dark:bg-white rounded-full" />
                <span className="w-3.5 h-[2px] bg-slate-950/80 dark:bg-white/85 rounded-full" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto rounded-3xl bg-white/95 dark:bg-black/85 backdrop-blur-2xl border border-slate-900/10 dark:border-white/25 p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/15 pb-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/60">
                  Mode Aktif
                </div>
                <div className="text-xs font-semibold text-slate-950 dark:text-white">
                  {currentMode.fullLabel}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-slate-900/10 dark:bg-white/15 border border-slate-900/10 dark:border-white/25 text-slate-950 dark:text-white"
                >
                  <CloseCrossGlyph className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 Mode Cards for Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {modePills.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSwitchMode(m.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    activeMode === m.id
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white font-bold shadow-xl scale-[1.01]'
                      : 'bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 text-slate-800 dark:text-white border-slate-900/10 dark:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: m.dotHex }}
                    />
                    <span className="text-[10px] tracking-widest uppercase opacity-75">
                      MODE {m.code}
                    </span>
                  </div>
                  <div className="text-xs font-semibold mt-0.5">{m.label}</div>
                </button>
              ))}
            </div>

            {/* Section Jump Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-900/10 dark:border-white/15">
              {navLinks.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    onNavigateSection(sec.id);
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 border border-slate-900/10 dark:border-white/15 text-left text-slate-800 dark:text-white"
                >
                  <span className="block text-[9px] text-slate-500 dark:text-white/60">0{idx + 1}</span>
                  <span className="block text-xs font-semibold">{sec.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
