'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ModeId, PORTFOLIO_MODES, GLOBAL_PROFILE } from '@/data/portfolio-data';
import { PinwheelGlyph, CloseCrossGlyph } from './geometric-glyphs';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  SlidersHorizontal,
  HelpCircle,
  Check,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';

interface HeaderProps {
  activeMode: ModeId;
  onSwitchMode: (mode: ModeId) => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
  scrollMode?: 'normal' | 'snap';
  onToggleScrollMode?: (mode: 'normal' | 'snap') => void;
}

export default function Header({
  activeMode,
  onSwitchMode,
  activeSection,
  onNavigateSection,
  scrollMode = 'normal',
  onToggleScrollMode
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFaqPopover, setShowFaqPopover] = useState(false);
  const faqRef = useRef<HTMLDivElement>(null);
  const currentMode = PORTFOLIO_MODES[activeMode];

  // Dismiss FAQ popover on outside click (especially on touch devices)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (faqRef.current && !faqRef.current.contains(e.target as Node)) {
        setShowFaqPopover(false);
      }
    };
    if (showFaqPopover) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
      };
    }
  }, [showFaqPopover]);

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
      label: 'Tech',
      dotHex: '#0284c7'
    },
    {
      id: 'medical' as ModeId,
      code: '02',
      label: 'Medical',
      dotHex: '#9333ea'
    },
    {
      id: 'academic' as ModeId,
      code: '03',
      label: 'Academic',
      dotHex: '#e11d48'
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 flex flex-col gap-3">
        <div className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-950/60 backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/10 shadow-lg dark:shadow-2xl transition-all">
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
              <span className="block font-semibold text-xs sm:text-sm tracking-[0.16em] uppercase text-slate-950 dark:text-white leading-tight">
                {GLOBAL_PROFILE.shortName}
              </span>
              <span className="block text-[10px] tracking-wider uppercase text-slate-500 dark:text-white/60">
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
                  className={`relative py-1 transition-all cursor-pointer ${isActive
                      ? 'text-slate-950 dark:text-white font-semibold'
                      : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-normal'
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

          {/* Right Mode Switcher Pills + ThemeToggle + Preferences Drawer Trigger */}
          <div className="flex items-center gap-2">
            {/* 3 Clean Professional Mode Pills (Desktop) */}
            <div
              role="tablist"
              aria-label="Pemilih Mode Portfolio"
              className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-slate-100/80 dark:bg-white/[0.06] ring-1 ring-slate-900/5 dark:ring-white/10"
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
                    className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${isSelected
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                        : 'text-slate-600 dark:text-white/70 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 font-normal'
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

            {/* Hidden Navbar / Customization Drawer Trigger (Desktop & Mobile) */}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Buka menu navigasi dan kustomisasi preferensi"
                    className="p-2 sm:px-3 sm:py-2 rounded-full bg-slate-100/80 dark:bg-white/10 hover:bg-slate-200/80 dark:hover:bg-white/20 ring-1 ring-slate-900/5 dark:ring-white/10 transition-all cursor-pointer text-slate-950 dark:text-white flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-slate-800 dark:text-white" />
                    <span className="hidden md:inline text-xs font-semibold tracking-wider">
                      Preferensi
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden md:inline" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Kustomisasi Mode Gulir, Tampilan & Navigasi
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Hidden Navbar / Preference & Customization Drawer */}
        {menuOpen && (
          <div className="pointer-events-auto rounded-3xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl ring-1 ring-slate-900/10 dark:ring-white/15 p-4 sm:p-6 shadow-2xl space-y-3.5 sm:space-y-5 animate-in slide-in-from-top-4 duration-200 text-slate-900 dark:text-white max-w-4xl mx-auto w-full max-h-[85vh] sm:max-h-none overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-900/5 dark:border-white/10 pb-2.5 sm:pb-3.5">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-white/10">
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-950 dark:text-white">
                    <span className="sm:hidden">Preferensi & Mode</span>
                    <span className="hidden sm:inline">Pusat Preferensi & Navigasi Tersembunyi</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                    Sesuaikan pengalaman interaksi dan alur jelajah portofolio
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup panel preferensi"
                  className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-950 dark:text-white cursor-pointer transition-colors"
                >
                  <CloseCrossGlyph className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Section 1: Scroll Mode Preference (Normal vs Snap) with FAQ Tooltip */}
            <div className="rounded-2xl p-3 sm:p-4 bg-slate-50/80 dark:bg-white/[0.04] ring-1 ring-slate-900/5 dark:ring-white/10 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
                  <span className="text-xs font-semibold text-slate-950 dark:text-white">
                    <span className="sm:hidden">Mode Gulir</span>
                    <span className="hidden sm:inline">Mode Pengguliran Halaman (Scroll Experience)</span>
                  </span>

                  {/* FAQ Info Button with Hover & Touch Support */}
                  <div ref={faqRef} className="relative inline-flex items-center">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setShowFaqPopover(!showFaqPopover)}
                            onTouchStart={() => setShowFaqPopover(!showFaqPopover)}
                            aria-label="Informasi penjelasan mode pengguliran halaman"
                            className="w-5 h-5 rounded-full bg-slate-200/80 hover:bg-slate-300 dark:bg-white/15 dark:hover:bg-white/25 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          align="center"
                          className="max-w-xs text-xs p-3 leading-relaxed shadow-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <div className="space-y-1.5 text-left">
                            <strong className="block font-semibold text-slate-950 dark:text-white border-b border-slate-200 dark:border-white/10 pb-1">
                              Pilihan Mode Pengguliran:
                            </strong>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-900 dark:text-white">Mode Normal (Bebas):</span> Halaman mengalir bebas dan berkelanjutan. Navigasi tombol mengarahkan scroll secara presisi memenuhi layar. Cocok untuk membaca santai.
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-900 dark:text-white">Mode Snap (Per Section):</span> Tiap section mengunci tepat satu layar penuh setiap kali digulir, dilengkapi area gulir terpisah di dalam konten tiap section. Cocok untuk navigasi terfokus seperti presentasi slide.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Touch-Friendly Popover Fallback for Mobile/Tablet */}
                    {showFaqPopover && (
                      <div className="md:hidden absolute left-0 bottom-7 z-50 w-72 p-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/20 shadow-2xl text-xs space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-1.5">
                          <strong className="font-semibold text-[11px] uppercase tracking-wider text-slate-900 dark:text-white">
                            Panduan Mode Gulir
                          </strong>
                          <button
                            type="button"
                            onClick={() => setShowFaqPopover(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <CloseCrossGlyph className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Bebas:</strong> Pengguliran mengalir bebas alami tanpa kuncian snap.
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Snap:</strong> Bergulir 1 section penuh per guliran layar, dengan scroll mandiri di dalam tiap section.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold">
                  Aktif: {scrollMode === 'snap' ? 'Snap' : 'Bebas'}
                </span>
              </div>

              {/* Mobile View: Compact Segmented Pill Bar (Minimalist & streamlined) */}
              <div className="sm:hidden grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-white/10 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => onToggleScrollMode?.('normal')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    scrollMode === 'normal'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Bebas</span>
                  {scrollMode === 'normal' && <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleScrollMode?.('snap')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    scrollMode === 'snap'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Snap</span>
                  {scrollMode === 'snap' && <Check className="w-3 h-3" />}
                </button>
              </div>

              {/* Desktop View: Full descriptive cards */}
              <div className="hidden sm:grid sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onToggleScrollMode?.('normal')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${scrollMode === 'normal'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-white/[0.05] border-slate-900/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">Normal (Bebas)</span>
                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${scrollMode === 'normal' ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950' : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                      }`}>
                      Default
                    </span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-relaxed">
                    Pengguliran bebas kontinu dan mulus antar-section tanpa kuncian.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleScrollMode?.('snap')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${scrollMode === 'snap'
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-white/[0.05] border-slate-900/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold">Snap (Per Section)</span>
                    {scrollMode === 'snap' && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[10px] opacity-80 leading-relaxed">
                    Tiap guliran mengunci 1 section penuh layar + scroll mandiri di dalam section.
                  </p>
                </button>
              </div>
            </div>

            {/* Section 2: Mode Portofolio Switcher */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-950 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
                <span>Pilihan Mode Portofolio</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {modePills.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSwitchMode(m.id);
                    }}
                    className={`p-2 sm:p-3 rounded-xl text-left transition-all cursor-pointer border ${activeMode === m.id
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white font-semibold shadow-md scale-[1.01]'
                        : 'bg-slate-100/70 dark:bg-white/[0.06] border-slate-900/5 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 text-slate-800 dark:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                        style={{ backgroundColor: m.dotHex }}
                      />
                      <span className="text-[9px] sm:text-[10px] tracking-widest uppercase opacity-75 font-mono">
                        {m.code}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold mt-0.5 sm:mt-1 truncate">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Section Jump Grid */}
            <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-slate-900/5 dark:border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-950 dark:text-white">
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300" />
                <span>
                  <span className="sm:hidden">Lompat ke Section</span>
                  <span className="hidden sm:inline">Lompat Langsung ke Section Layar Penuh</span>
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {navLinks.map((sec, idx) => {
                  const isCurrent = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        onNavigateSection(sec.id);
                        setMenuOpen(false);
                      }}
                      className={`px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-xl text-left transition-all cursor-pointer border ${isCurrent
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm font-semibold'
                          : 'bg-slate-100/70 dark:bg-white/[0.06] border-slate-900/5 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/15 text-slate-800 dark:text-white'
                        }`}
                    >
                      <span className="block text-[8px] sm:text-[9px] font-mono opacity-75">0{idx + 1}</span>
                      <span className="block text-[10px] sm:text-xs font-semibold truncate">{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
