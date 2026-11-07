# Architectural Recommendation: `src/app/not-found.tsx` & Next.js 15.5 Static Export Prerender

- **Author**: `teamwork_explorer_2` (Role: 404 & Prerender Architect)
- **Target Role**: `teamwork_worker` (Worker M1 Iteration 2)
- **Target Path**: `src/app/not-found.tsx`
- **Milestone**: Milestone 1 Iteration 2 (Visual Backgrounds, Build Stabilization & 404 Prerender)
- **Status**: READY FOR IMPLEMENTATION

---

## 1. Executive Summary & Root-Cause Analysis

### 1.1 The Prerender Failure Context
During Milestone 1 Iteration 1 review, `reviewer_m1_2` discovered that Next.js production build (`output: 'export'`) crashed during the static export phase:
```text
Exporting (0/2) ...
Error occurred prerendering page "/404.html". Read more: https://nextjs.org/docs/messages/prerender-error
[Error: Cannot find module 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\server\pages\_app.js']
Export encountered an error on /404: /404.html, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
```

### 1.2 Root-Cause Identification
1. **Missing App Router 404 Route**:
   In Next.js 15 App Router with `output: 'export'`, the build engine automatically prerenders a dedicated `/404.html` static export file into `out/404.html`.
2. **Legacy Pages Router Fallback**:
   When `src/app/not-found.tsx` is missing from an App-Router-only project, Next.js falls back to its legacy Pages Router default error handler, searching for `.next/server/pages/_app.js` and `_document.js`. In an App-Router-only codebase, those pages do not exist, triggering an unhandled `MODULE_NOT_FOUND` / `PageNotFoundError` and aborting the build with Exit Code 1.
3. **The Solution**:
   Providing a clean, native `src/app/not-found.tsx` component registers the App Router 404 route handler (`○ /_not-found`). Next.js compiles and prerenders it directly into `out/404.html` without falling back to Pages Router handlers.

---

## 2. Component Design & Visual System Specification

The `src/app/not-found.tsx` component is designed to fully harmonize with the portfolio's glassmorphic design system, multi-mode architecture, and dark/light themes.

### 2.1 Aesthetic & Visual Tokens
| Element | Dark Mode Token / Style | Light Mode Token / Style |
|---------|-------------------------|--------------------------|
| **Atmospheric Canvas** | `bg-gradient-to-br from-[#06182c] via-[#092b4c] to-[#040e1a]` | `bg-gradient-to-br from-slate-100 via-sky-50/50 to-slate-200` |
| **Ambient Glow Orbs** | Cyan/sky (`bg-sky-500/15 blur-[120px]`), Purple (`bg-purple-600/15 blur-[140px]`), Indigo (`bg-cyan-500/10 blur-[160px]`) | Sky (`bg-sky-400/25 blur-[120px]`), Purple (`bg-purple-500/20 blur-[140px]`), Indigo (`bg-indigo-500/10 blur-[160px]`) |
| **Glass Card Container** | `bg-slate-900/60 backdrop-blur-2xl border-white/15 ring-1 ring-inset ring-white/10 shadow-black/60` | `bg-white/75 backdrop-blur-2xl border-slate-900/10 ring-1 ring-inset ring-white/60 shadow-sky-950/10` |
| **Status Badge** | `bg-sky-400/10 text-sky-300 border-sky-400/20` | `bg-sky-500/10 text-sky-700 border-sky-500/20` |
| **Giant 404 Numerals** | `bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent font-display` | `bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-display` |
| **Primary CTA Button** | `bg-white text-slate-950 hover:bg-slate-100 shadow-md hover:scale-[1.02]` | `bg-slate-950 text-white hover:bg-slate-800 shadow-md hover:scale-[1.02]` |
| **Secondary CTA Button** | `bg-white/10 hover:bg-white/15 text-white border-white/15 hover:scale-[1.02]` | `bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border-slate-900/10 hover:scale-[1.02]` |
| **Mode Shortcut Pills** | Subtle tinted border and background with color indicator dots | Subtle tinted border and background with color indicator dots |

### 2.2 Functional & UX Features
1. **Status Eyebrow**: Displays `Error 404 • Resource Not Found` with the portfolio's signature geometric `PinwheelGlyph`.
2. **Indonesian Headline & Friendly Copy**:
   - Headline: `Halaman Tidak Ditemukan` (Outfit display font).
   - Reassuring message: Informs user that the requested URL is unavailable or moved, guiding them smoothly back to the portfolio.
3. **Dual Action Buttons**:
   - Primary: `Kembali ke Beranda` (`/`) with Lucide `Home` icon.
   - Secondary: `Lihat Projek` (`/#projects`) with Lucide `Compass` icon.
4. **Tri-Mode Quick Links**:
   Provides direct one-click exploration links into the portfolio's 3 personas:
   - `01 Tech` (`/?mode=tech`)
   - `02 Medical` (`/?mode=medical`)
   - `03 Academic` (`/?mode=academic`)
5. **Interactive Header Bar**:
   - Brand mark (`Arya Krisnanda`) linking back to root (`/`).
   - Integrated `<ThemeToggle />` component, allowing users to toggle between Light and Dark mode directly on the 404 page.
6. **Next.js 15 Static Prerender Compliance**:
   - Pure Server Component that safely imports Client Components (`ThemeToggle`, `Link`).
   - Static metadata export (`Metadata`) defining SEO title and description.
   - Zero dynamic server calls (`headers()`, `cookies()`, uncached `searchParams`) to guarantee 100% build-time prerendering into `out/404.html`.

---

## 3. Production Source Code: `src/app/not-found.tsx`

The worker should create `src/app/not-found.tsx` with the exact following code:

```tsx
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
            Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
            Silakan kembali ke beranda untuk menjelajahi profil, riset, dan proyek personal Arya Krisnanda.
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
        <p>&copy; {currentYear} {GLOBAL_PROFILE.fullName}. Seluruh hak cipta dilindungi.</p>
      </footer>
    </main>
  );
}
```

---

## 4. Synergistic Build Script Optimization (`NEXT_TELEMETRY_DISABLED`)

As verified during our investigation:
- On Windows DrvFs / WSL mounted drives, Next.js telemetry attempts file operations on `.next/trace` that can trigger `EPERM` locks (`errno: -4048`).
- Setting `NEXT_TELEMETRY_DISABLED=1` at the script level prevents Next.js telemetry initialization and completely avoids `.next/trace` lock contention.
- In `package.json`, the worker should configure the build script as:
  ```json
  "build": "node -e \"process.env.NEXT_TELEMETRY_DISABLED='1'\" && node -r ./patch-fs.js node_modules/next/dist/bin/next build"
  ```
  or set `process.env.NEXT_TELEMETRY_DISABLED = '1';` at the top of `patch-fs.js`.
  This guarantees cross-platform deterministic builds on both Windows PowerShell and Linux/WSL.

---

## 5. Worker Step-by-Step Implementation Instructions

1. **Step 1: Write `src/app/not-found.tsx`**
   - Create `src/app/not-found.tsx` with the exact code given in Section 3.
2. **Step 2: Add `process.env.NEXT_TELEMETRY_DISABLED = '1'` to `patch-fs.js`**
   - At line 1 of `patch-fs.js`, ensure `process.env.NEXT_TELEMETRY_DISABLED = '1';` is executed before Next.js loads.
3. **Step 3: Verify TypeScript Types**
   - Run: `node node_modules/typescript/bin/tsc --noEmit`
   - Expectation: Exit code 0, 0 compiler errors.
4. **Step 4: Execute Production Build & Static Export**
   - Run: `npm run build`
   - Expectation: Exit code 0, `✓ Exporting (2/2)`.
5. **Step 5: Verify Generated `out/404.html`**
   - Verify `out/404.html` exists.
   - Verify `out/404.html` contains:
     - `404`
     - `Halaman Tidak Ditemukan`
     - `Kembali ke Beranda`
     - `/?mode=tech`
6. **Step 6: Run E2E Test Suite**
   - Run: `node tests/e2e/runner.mjs`
   - Expectation: 78 / 78 tests pass (100%).
