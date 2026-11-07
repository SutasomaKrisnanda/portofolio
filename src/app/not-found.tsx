import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Compass } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { PinwheelGlyph } from '@/components/geometric-glyphs';
import { GLOBAL_PROFILE } from '@/data/portfolio-data';

export const metadata: Metadata = {
  title: '404 - Halaman Tidak Ditemukan | I Gede Arya Krisnanda Sutasoma',
  description:
    'Halaman yang Anda tuju tidak ditemukan atau telah dipindahkan. Kembali ke beranda portofolio multi-mode Arya Krisnanda.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/50 to-slate-200 dark:from-[#06182c] dark:via-[#092b4c] dark:to-[#040e1a] text-slate-900 dark:text-white selection:bg-sky-500 selection:text-white transition-colors duration-500">
      {/* Ambient Atmospheric Glow Orbs */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-sky-400/25 dark:bg-sky-500/15 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-[550px] sm:h-[550px] rounded-full bg-purple-500/20 dark:bg-purple-600/15 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[600px] sm:h-[600px] rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 blur-[160px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Horizon Mesh Background Geometry */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-10 dark:opacity-15 pointer-events-none"
        aria-hidden="true"
      >
        <circle cx="720" cy="450" r="500" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="720" cy="450" r="750" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <path d="M 0,450 Q 720,380 1440,450" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>

      {/* Top Floating Utility Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between py-2 px-2 sm:px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-full px-2 py-1 transition-all"
        >
          <div className="transition-transform duration-500 group-hover:rotate-90 text-slate-900 dark:text-white">
            <PinwheelGlyph className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="block font-bold text-xs sm:text-sm tracking-[0.18em] uppercase text-slate-950 dark:text-white leading-tight">
              {GLOBAL_PROFILE.shortName}
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-600 dark:text-white/70">
              Personal Portfolio
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle className="shadow-sm" />
        </div>
      </header>

      {/* Central Glassmorphic 404 Hero Card */}
      <section className="relative z-10 w-full max-w-xl mx-auto my-auto py-8 sm:py-12">
        <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 text-center bg-white/75 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-900/10 dark:border-white/15 shadow-2xl shadow-sky-950/10 dark:shadow-black/60 ring-1 ring-inset ring-white/60 dark:ring-white/10 transition-all duration-300">
          {/* Status Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 bg-sky-500/10 dark:bg-sky-400/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 dark:border-sky-400/20 backdrop-blur-md">
            <PinwheelGlyph className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Error 404 • Resource Not Found</span>
          </div>

          {/* Luminous Giant 404 Display */}
          <div className="relative mb-3 select-none">
            <span className="block text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-cyan-300 dark:to-indigo-300 drop-shadow-sm leading-none">
              404
            </span>
          </div>

          {/* Headline & Friendly Message */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 font-display">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
            Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda untuk
            menjelajahi profil, riset, dan proyek personal Arya Krisnanda.
          </p>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
            <Link
              href="/#projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-900/10 dark:border-white/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Lihat Projek</span>
            </Link>
          </div>

          {/* Direct Mode Discovery Shortcut Pills */}
          <div className="pt-6 border-t border-slate-900/10 dark:border-white/10 flex flex-col items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
              Atau eksplorasi berdasarkan mode:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/?mode=tech"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15 text-sky-700 dark:text-sky-300 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>01 Tech</span>
              </Link>
              <Link
                href="/?mode=medical"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 text-purple-700 dark:text-purple-300 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <span>02 Medical</span>
              </Link>
              <Link
                href="/?mode=academic"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-700 dark:text-rose-300 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>03 Academic</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto py-3 text-center text-xs text-slate-500 dark:text-white/50">
        <p>
          &copy; {currentYear} {GLOBAL_PROFILE.fullName}. Seluruh hak cipta dilindungi.
        </p>
      </footer>
    </main>
  );
}
