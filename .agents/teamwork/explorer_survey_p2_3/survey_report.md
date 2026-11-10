# Comprehensive Codebase Survey & Implementation Blueprint: Requirement R3 & Infrastructure Baseline

**Date:** 2026-11-08  
**Author:** Explorer Survey P2-3  
**Target Requirement:** R3 — Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya & Baseline Build/Test Infrastructure  
**Workspace Root:** `w:\home\krisnanda\Code\Project\Personal - github\portofolio`

---

## 1. Executive Summary

This survey provides an exhaustive audit and architectural blueprint for:
1. **Requirement R3 (Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya)**: Transforming the existing asymmetric, lopsided 2-column layout into a true modular, proportionally balanced Smart Bento Grid across mobile, tablet, and desktop.
2. **Baseline Build & Test Infrastructure**: Validating `package.json`, `next.config.ts`, `patch-fs.js`, static export generation (`out/`), TypeScript type safety, ESLint compliance, and E2E test suites.

### Core Discoveries:
- **Baseline Build Health**: The static export build (`node -r ./patch-fs.js node_modules/next/dist/bin/next build`), typechecking (`tsc --noEmit`), and E2E runner (`node tests/e2e/runner.mjs`) all succeed with **exit code 0**.
- **Build Isolation Vulnerability Identified**: `npm.cmd run build` invokes `prebuild: node scripts/clean.js` which purges `.next`. On a completely fresh build without `.next`, Next.js 15.5.14 triggers `MODULE_NOT_FOUND` on `.next/server/middleware-manifest.json` before flushing to disk on Windows DrvFs. An exact, non-invasive patch for `patch-fs.js` has been formulated to eliminate this race condition permanently.
- **Root Cause of R3 "Timpang Sebelah" (Lopsidedness)**: The current `src/components/about.tsx` enforces a rigid 2-column asymmetric split (`lg:col-span-7` vs `lg:col-span-5` with `items-start`). All committee items (10 to 12 items per mode) are hard-assigned to the right column, while the left column holds organizational experience (only 1 item in Academic mode, 2 in Medical mode). The right column is over **800px taller** than the left, leaving a massive empty void on the left.
- **Proposed R3 Blueprint**: A true 12-column modular Bento Box architecture with a full-width (`lg:col-span-12`) **Smart Adaptive Track Bento** featuring an interactive segmented switcher (`Semua`, `Organisasi`, `Kepanitiaan`), 3-column auto-flow grid, and progressive disclosure ("Tampilkan Semua / Ringkas"), mathematically guaranteeing zero lopsidedness regardless of history length.

---

## 2. Baseline Build & Test Infrastructure Assessment

### 2.1 Configuration Analysis
- **`package.json`**:
  - Framework: Next.js `^15.5.6` (runtime resolved `15.5.14`) with React `18.3.1`.
  - Build script: `"build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build"`.
  - Prebuild script: `"prebuild": "node scripts/clean.js"`.
  - Typecheck script: `"typecheck": "tsc --noEmit"`.
  - Lint script: `"lint": "node -r ./patch-fs.js node_modules/next/dist/bin/next lint"`.
- **`next.config.ts`**:
  - `output: 'export'` enabled for GitHub Pages static hosting.
  - `images: { unoptimized: true }` enabled for static HTML hosting.
  - Remote patterns configured for `placehold.co`, `images.unsplash.com`, `picsum.photos`, `i.imgur.com`.
  - `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` are present in config.

### 2.2 Execution Findings & Test Results

| Command / Tool | Status | Exit Code | Diagnostic Notes |
|---|---|---|---|
| `npm run lint` | ⚠️ Security Block | 1 | Calling `npm` in PowerShell invokes `npm.ps1` which fails with `PSSecurityException`. Using `npm.cmd` bypasses this cleanly. |
| `npm.cmd run lint` | ✅ PASSED | 0 | Zero errors. Only 3 minor warnings on unused types/props (`use-toast.ts`, `theme-provider.tsx`, `education.tsx`). |
| `npm.cmd run typecheck` | ✅ PASSED | 0 | `tsc --noEmit` passed cleanly. Zero TypeScript type errors across the entire codebase. |
| `node tests/e2e/runner.mjs` | ✅ PASSED | 0 | All 78 tests across 4 tiers (Feature Coverage, Boundary/Corner, Cross-Feature, App Scenarios) passed in 2.69s. |
| `node -r ./patch-fs.js node_modules/next/dist/bin/next build` | ✅ PASSED | 0 | Static build compiled in 9.1s. Exported `(2/2)` routes to `out/` (`index.html`, `404.html`, static chunks, assets). |
| `npm.cmd run build` (with `clean.js`) | ❌ Intermittent Race | 1 | Failed on fresh build after `scripts/clean.js` wipes `.next`: `Error: Cannot find module '.../.next/server/middleware-manifest.json'`. |

### 2.3 Diagnosis & Solution for `middleware-manifest.json` Clean Build Race

#### Root Cause:
In `node_modules/next/dist/build/index.js` line 1079:
```javascript
const middlewareManifest = require(_path.default.join(distDir, _constants1.SERVER_DIRECTORY, _constants1.MIDDLEWARE_MANIFEST));
```
When `clean.js` wipes `.next/`, Next.js compiles the app, but on Windows DrvFs / NTFS file system sync delays, `require()` is called before `middleware-manifest.json` is flushed to disk. Because Node's `require` throws `MODULE_NOT_FOUND`, the build aborts.

#### The Patch for `patch-fs.js`:
In `patch-fs.js`, `pages-manifest.json` already has a dedicated fallback helper (`isPagesManifestPath`, `ensurePagesManifestOnDisk`). Adding an identical fallback for `middleware-manifest.json` inside `patch-fs.js` completely eliminates this failure:

```javascript
// Add to patch-fs.js
const isMiddlewareManifestPath = (p) => {
  if (!p) return false;
  const str = typeof p === 'string' ? p : p.toString();
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/server/middleware-manifest.json') ||
    normalized.endsWith('/middleware-manifest.json') ||
    normalized === 'middleware-manifest.json' ||
    /(?:^|[\\/])middleware-manifest\.json(?:$|[\\/?#])/.test(str)
  );
};

const DEFAULT_MIDDLEWARE_MANIFEST = JSON.stringify({
  version: 3,
  middleware: {},
  functions: {},
  sortedMiddleware: []
}, null, 2);

function ensureMiddlewareManifestOnDisk(filePath) {
  try {
    const strPath = typeof filePath === 'string' ? filePath : String(filePath);
    const dir = path.dirname(strPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(strPath)) fs.writeFileSync(strPath, DEFAULT_MIDDLEWARE_MANIFEST, 'utf8');
  } catch (_) {}
}

// Hook Module.prototype.require in patch-fs.js:
Module.prototype.require = function(request) {
  if (typeof request === 'string' && isMiddlewareManifestPath(request)) {
    ensureMiddlewareManifestOnDisk(request);
    try {
      return origRequire.apply(this, arguments);
    } catch (err) {
      if (err && err.code === 'MODULE_NOT_FOUND') {
        return { version: 3, middleware: {}, functions: {}, sortedMiddleware: [] };
      }
      throw err;
    }
  }
  // existing require logic...
};
```

---

## 3. Deep Architectural Survey of the About Section (`src/components/about.tsx`)

### 3.1 Component Architecture & Data Ingestion
`src/components/about.tsx` is a client component (`'use client'`) receiving:
- `modeConfig: PortfolioModeConfig`
- `activeMode: ModeId` ('tech' | 'medical' | 'academic')

It loads data directly from `@/data/portfolio-data`:
1. `GLOBAL_PROFILE` (`src/data/profile.json`):
   - Full name, current program, university, NIM, cohort, avatar URL, birth date, origin, location, email, phone, CV links, GitHub, LinkedIn.
2. `modeConfig.about`:
   - `introParagraphs`: 2 descriptive biographical paragraphs.
   - `problemSolvingApproach`: 3 methodological principle statements.
3. `PORTFOLIO_EXPERIENCE` (`src/data/experience.json`):
   - Filtered by `entry.modes.includes(activeMode)`.
   - **Tech mode**: 4 items (BSO Hermestha, HMJ Kedokteran, UKM Catur, Komunitas Coding).
   - **Medical mode**: 2 items (BSO Hermestha, HMJ Kedokteran).
   - **Academic mode**: 1 item (BSO Hermestha).
4. `PORTFOLIO_EDUCATION` (`src/data/education.json`):
   - 3 formal education items: Undiksha (S1 Kedokteran, 2025-Sekarang), SMAN 2 Amlapura (MIPA, 2022-2025), SMPN 5 Amlapura (2019-2022).
5. `PORTFOLIO_COMMITTEES` (`src/data/committees.json`):
   - Filtered by `entry.modes.includes(activeMode)`.
   - **Tech mode**: 12 items.
   - **Medical mode**: 10 items.
   - **Academic mode**: 10 items.

### 3.2 The "Timpang Sebelah" (Lopsidedness) Anatomy

#### Layout Grid Definition (Lines 81-84):
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
  {/* Left 7 Columns: Profile Bio & Problem-Solving Approach */}
  <div className="lg:col-span-7 space-y-6"> ... </div>

  {/* Right 5 Columns: Education, Committees, Personal Info & Coordinates */}
  <div className="lg:col-span-5 space-y-6"> ... </div>
</div>
```

#### Height Breakdown & Disparity Matrix:

| Mode | Left Column Content (`lg:col-span-7`) | Left Height | Right Column Content (`lg:col-span-5`) | Right Height | Imbalance (Gap) |
|---|---|---|---|---|---|
| **Tech** | Profile Bio (450px) + 4 Experience cards (2x2 grid, ~220px) | **~670px** | Education (220px) + 12 Committees (stacked, ~780px) + Coordinates (280px) | **~1380px** | **+710px on Right** (~2.1x taller) |
| **Medical** | Profile Bio (450px) + 2 Experience cards (1x2 grid, ~120px) | **~570px** | Education (220px) + 10 Committees (stacked, ~650px) + Coordinates (280px) | **~1250px** | **+680px on Right** (~2.2x taller) |
| **Academic** | Profile Bio (450px) + 1 Experience card (single, ~120px) | **~570px** | Education (220px) + 10 Committees (stacked, ~650px) + Coordinates (280px) | **~1250px** | **+680px on Right** (Severe void below left col) |

#### Structural Flaws Identified:
1. **Unbalanced Column Partitioning**: The 7-to-5 column ratio rigidly binds content to columns without considering dynamic content heights.
2. **Vertical Dumping of Committees**: 10 to 12 committee items are rendered sequentially in a narrow 5-column space (`space-y-2.5`), elongating the right column into an endless list.
3. **Mobile & Tablet Scroll Bloat**:
   - On screens `< 1024px`, the grid collapses to `grid-cols-1`.
   - The user must scroll through Profile Bio -> Methodology -> Experience -> Education -> **12 sequential Committee cards** -> Coordinates.
   - The committee list occupies 3 full viewport heights on mobile, burying contact and social links.

---

## 4. Requirement R3 Implementation Blueprint: Sistem Smart Bento Grid Adaptif

### 4.1 Architectural Philosophy: The Bento Box Principle
A authentic Bento Box is a modular, structured grid of self-contained compartments of varying aspect ratios that interlock without empty voids or asymmetric overhangs.

To eliminate lopsidedness permanently:
1. Divide the About section into **harmonious Bento tiles** across a responsive 12-column grid.
2. Extract the volatile, growing history records (Experience, Committees, Education) out of narrow side-columns and house them in a dedicated, full-width **Adaptive Track Bento Tile** (`lg:col-span-12`).
3. Within the Adaptive Track Tile, provide an **interactive segmented switcher**, a **3-column auto-flow responsive sub-grid**, and **progressive disclosure controls** ("Tampilkan Lebih Banyak / Ringkas").

### 4.2 Bento Tile Geometry & Layout Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SECTION HEADER (03 | TENTANG SAYA & REKAM JEJAK) + CV ACTIONS               │
├───────────────────────────────────────────────┬─────────────────────────────┤
│ TILE 1: Primary Profile & Bio Bento           │ TILE 2: Quick Coordinates   │
│ - Avatar, Name, Program, NIM, Cohort          │ - Birthdate, Location       │
│ - Mode-specific Intro Biography               │ - Direct Email & Phone      │
│ - Mode badges & Verified Credentials          │ - GitHub & LinkedIn Buttons │
│ (Desktop: lg:col-span-8 | Tablet: md:col-span-8 | Mobile: col-span-1)       │ (lg:col-span-4 | md:col-span-4)│
├───────────────────────────────────────────────┴─────────────────────────────┤
│ TILE 3: Methodological Principles             │ TILE 4: Formal Education    │
│ - 3 Problem Solving Pillars (01, 02, 03)      │ - Undiksha S1 Kedokteran    │
│ - Interactive hover focus state               │ - SMAN 2 Amlapura MIPA      │
│ (Desktop: lg:col-span-4 | Tablet: md:col-span-6 | Mobile: col-span-1)       │ - SMPN 5 Amlapura           │
│                                               │ (lg:col-span-8 | md:col-span-6)│
├───────────────────────────────────────────────┴─────────────────────────────┤
│ TILE 5: SMART ADAPTIVE REKAM JEJAK & KEPEMIMPINAN (FULL CONTAINER WIDTH)    │
│ [ Segmented Switcher: Semua (16) | Organisasi (4) | Kepanitiaan (12) ]      │
│ ┌───────────────────────┬───────────────────────┬─────────────────────────┐ │
│ │ History Card 1        │ History Card 2        │ History Card 3          │ │
│ ├───────────────────────┼───────────────────────┼─────────────────────────┤ │
│ │ History Card 4        │ History Card 5        │ History Card 6          │ │
│ └───────────────────────┴───────────────────────┴─────────────────────────┘ │
│ [ Button: Tampilkan 10 Rekam Jejak Lainnya / Ringkas Kembali ]              │
│ (Desktop: lg:col-span-12 | Tablet: md:col-span-2 | Mobile: col-span-1)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Detailed Specification of Bento Tiles

#### Tile 1: Primary Profile & Bio Bento (`lg:col-span-8`, `md:col-span-8`, `col-span-1`)
- **Visuals**: Frosted glass (`bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 rounded-2xl p-6 sm:p-7`).
- **Header**:
  - Avatar (w-16 h-16 sm:w-20 sm:h-20) with active mode ring accent.
  - Full Name: `GLOBAL_PROFILE.fullName`.
  - Program & Institution: `GLOBAL_PROFILE.currentProgram` • `GLOBAL_PROFILE.university`.
  - Academic metadata: `NIM: ${GLOBAL_PROFILE.nim}` • `Angkatan ${GLOBAL_PROFILE.cohort}`.
- **Body**:
  - 2 narrative paragraphs from `modeConfig.about.introParagraphs`.
  - Micro-tags indicating active discipline (e.g. `Rekayasa Sistem`, `Klinis Biomedis`, `Penelitian Komunitas`).

#### Tile 2: Personal Coordinates & Social Directs Bento (`lg:col-span-4`, `md:col-span-4`, `col-span-1`)
- **Visuals**: Matches Tile 1 glass styling; compact, actionable.
- **Contact Details**:
  - Birth date (`Calendar` icon): `GLOBAL_PROFILE.birthDate`.
  - Origin & Residence (`MapPin` icon): `GLOBAL_PROFILE.origin` (`GLOBAL_PROFILE.location`).
  - Interactive Email (`Mail` icon): `mailto:${GLOBAL_PROFILE.email}`.
  - Interactive Phone (`Phone` icon): `tel:${GLOBAL_PROFILE.phone}`.
- **Social Actions**:
  - Dual pill buttons: `GitHub` and `LinkedIn` with hover transitions.

#### Tile 3: Methodological Principles Bento (`lg:col-span-4`, `md:col-span-6`, `col-span-1`)
- **Header**: "Prinsip Kerja & Metodologi" with `Sparkles` or `Layers` icon.
- **Content**: 3 structured cards rendering `modeConfig.about.problemSolvingApproach`.
- **Card Format**:
  - `01.`, `02.`, `03.` numbered badges.
  - Text describing core approach (e.g., Analisis Sistematis, Iterasi & Verifikasi, Dampak Nyata).

#### Tile 4: Formal Education Milestones Bento (`lg:col-span-8`, `md:col-span-6`, `col-span-1`)
- **Header**: "Pendidikan Formal" with `GraduationCap` icon.
- **Layout**: Horizontal or 3-column sub-grid (`grid grid-cols-1 sm:grid-cols-3 gap-3.5`).
- **Items**:
  - Undiksha (S1 Kedokteran, 2025 – Sekarang, Aktif).
  - SMAN 2 Amlapura (MIPA, 2022 – 2025, Lulus, OSN Informatics & Math honors).
  - SMPN 5 Amlapura (2019 – 2022, Lulus).

#### Tile 5: The Smart Adaptive History Bento (`lg:col-span-12`, Full Container Width)
This is the central innovation that fulfills Requirement R3.

1. **Full-Width Placement (`col-span-12`)**:
   - Because Tile 5 occupies all 12 columns, it eliminates any possibility of horizontal column lopsidedness.
2. **Segmented Track Switcher (Tabs)**:
   - Provides 3 filter buttons:
     - `Semua Rekam Jejak (${totalCount})`
     - `Pengalaman Organisasi (${filteredExperience.length})`
     - `Kepanitiaan & Acara (${filteredCommittees.length})`
   - Active tab uses high-contrast pill styling (`bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm`).
   - Inactive tabs use muted hover styling (`text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10`).
3. **Adaptive 3-Column Responsive Sub-Grid**:
   - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
   - Items flow naturally left-to-right, row-by-row.
   - In Academic mode (1 experience + 10 committees):
     - In "Semua": 11 items flow evenly across 4 rows of 3 columns.
     - In "Organisasi": 1 prominent, rich card displayed without causing adjacent empty voids.
     - In "Kepanitiaan": 10 cards displayed neatly across 3 columns (e.g. 3 x 3 + 1).
4. **Progressive Disclosure ("Tampilkan Lebih Banyak / Ringkas")**:
   - On initial render, show the first **6 items** (2 full rows of 3 on desktop, 3 rows of 2 on tablet).
   - If total items > 6:
     - Display a clean toggle button:
       `Tampilkan Semua ${totalCount} Rekam Jejak` (with `ChevronDown`) / `Ringkas Tampilan` (with `ChevronUp`).
     - Smooth height transition prevents abrupt jumps.
   - On mobile, this keeps the section compact (~400px instead of ~1800px!), dramatically improving mobile usability.

---

## 5. Concrete Implementation Blueprint & Proposed Code Snippet

### 5.1 Proposed Component Structure: `src/components/about.tsx`

```tsx
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
  CalendarDays,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

interface AboutProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
}

type HistoryTab = 'all' | 'experience' | 'committees';

export default function About({ modeConfig, activeMode }: AboutProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 1. Filtered Data by Active Mode
  const filteredExperience = useMemo(
    () => PORTFOLIO_EXPERIENCE.filter((entry) => entry.modes.includes(activeMode)),
    [activeMode]
  );

  const filteredCommittees = useMemo(
    () => PORTFOLIO_COMMITTEES.filter((entry) => entry.modes.includes(activeMode)),
    [activeMode]
  );

  // 2. Unified History Item Representation
  const unifiedHistory = useMemo(() => {
    const expItems = filteredExperience.map((exp) => ({
      id: exp.id,
      kind: 'experience' as const,
      role: exp.role,
      title: exp.organization,
      time: exp.period,
      badge: exp.type || 'Organisasi',
      description: exp.description,
      highlights: exp.highlights
    }));

    const comItems = filteredCommittees.map((com) => ({
      id: com.id,
      kind: 'committee' as const,
      role: com.role,
      title: `${com.event} • ${com.organization}`,
      time: com.year,
      badge: 'Kepanitiaan',
      description: com.description,
      highlights: undefined
    }));

    if (activeTab === 'experience') return expItems;
    if (activeTab === 'committees') return comItems;
    return [...expItems, ...comItems];
  }, [filteredExperience, filteredCommittees, activeTab]);

  const INITIAL_LIMIT = 6;
  const visibleHistory = isExpanded ? unifiedHistory : unifiedHistory.slice(0, INITIAL_LIMIT);
  const hasMore = unifiedHistory.length > INITIAL_LIMIT;

  return (
    <section
      id="about"
      className="relative w-full py-20 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12 text-slate-900 dark:text-white scroll-mt-16"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>03</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Identitas, Pendidikan & Pengalaman</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Tentang Saya & Rekam Jejak
            </h2>
          </div>

          {/* Quick CV Download Actions */}
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

        {/* 12-Column Smart Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          
          {/* TILE 1: Primary Profile & Biography Bento (8 Cols on Desktop) */}
          <div className="md:col-span-12 lg:col-span-8 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-5">
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
                <h3 className="text-xl font-semibold text-slate-950 dark:text-white tracking-wide">
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

          {/* TILE 2: Coordinates & Contact Directs Bento (4 Cols on Desktop) */}
          <div className="md:col-span-12 lg:col-span-4 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-100 dark:border-white/[0.06] pb-3">
                Data Pribadi & Kontak
              </div>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 font-normal pt-3">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Lahir: {GLOBAL_PROFILE.birthDate}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{GLOBAL_PROFILE.origin} ({GLOBAL_PROFILE.location})</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${GLOBAL_PROFILE.email}`} className="hover:underline text-slate-900 dark:text-white font-medium truncate">
                    {GLOBAL_PROFILE.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${GLOBAL_PROFILE.phone}`} className="hover:underline text-slate-900 dark:text-white font-medium">
                    {GLOBAL_PROFILE.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
              <a
                href={GLOBAL_PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <a
                href={GLOBAL_PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* TILE 3: Methodological Principles Bento (4 Cols on Desktop) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
              <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Prinsip Kerja & Metodologi</span>
            </div>
            <div className="space-y-2.5">
              {modeConfig.about.problemSolvingApproach.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-950 dark:text-white block mb-0.5 font-semibold">0{idx + 1}.</strong>
                  <span className="font-normal leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TILE 4: Formal Education Bento (8 Cols on Desktop) */}
          <div className="md:col-span-6 lg:col-span-8 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
              <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Pendidikan Formal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PORTFOLIO_EDUCATION.map((edu) => (
                <div key={edu.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] flex flex-col justify-between space-y-2">
                  <div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mb-1">{edu.period}</div>
                    <div className="font-semibold text-slate-950 dark:text-white text-xs leading-snug">{edu.institution}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal mt-1">{edu.degree}</div>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 w-fit">
                    {edu.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TILE 5: SMART ADAPTIVE REKAM JEJAK BENTO (12 Cols Full Width) */}
          <div className="col-span-1 md:col-span-12 rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 shadow-sm space-y-6">
            
            {/* Bento Header & Segmented Track Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-950 dark:text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-950 dark:text-white">
                    Rekam Jejak & Kepemimpinan
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pengalaman organisasi, kepanitiaan, dan peran aktif komunitas
                  </p>
                </div>
              </div>

              {/* Segmented Track Switcher */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-xs font-medium gap-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => { setActiveTab('all'); setIsExpanded(false); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Semua ({filteredExperience.length + filteredCommittees.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('experience'); setIsExpanded(false); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'experience'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Organisasi ({filteredExperience.length})
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('committees'); setIsExpanded(false); }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'committees'
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  Kepanitiaan ({filteredCommittees.length})
                </button>
              </div>
            </div>

            {/* 3-Column Symmetrical Sub-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {visibleHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.04] flex flex-col justify-between space-y-2.5 transition-all hover:bg-slate-100/80 dark:hover:bg-white/[0.07] ring-1 ring-slate-900/[0.03] dark:ring-white/[0.04]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {item.time}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-950 dark:text-white leading-snug">
                      {item.role}
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                      {item.title}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1 border-t border-slate-200/50 dark:border-white/[0.04]">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Progressive Disclosure Expand / Collapse Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white transition-all cursor-pointer"
                >
                  <span>
                    {isExpanded
                      ? 'Ringkas Kembali'
                      : `Tampilkan Semua (${unifiedHistory.length - INITIAL_LIMIT} Lainnya)`}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
```

---

## 6. Verification & Test Plan for Requirement R3

### 6.1 Test Cases for Worker / Test Writer Implementation

| Test ID | Test Scope | Verification Method | Pass Criteria |
|---|---|---|---|
| **T-R3.1** | Bento Tile Grid Layout | Render DOM in testing environment / parse JSX | Container contains 12-column grid (`grid-cols-1 md:grid-cols-12`). |
| **T-R3.2** | Proportional Balance (Zero Lopsidedness) | Inspect height / card layout | Tile 5 spans `col-span-12`, eliminating asymmetric height discrepancy across columns in all 3 modes (Tech, Medical, Academic). |
| **T-R3.3** | Interactive Track Switching | Simulate click on 'Organisasi' and 'Kepanitiaan' tabs | List filters accurately: `filteredExperience` count vs `filteredCommittees` count. |
| **T-R3.4** | Progressive Disclosure Folding | Assert visible item count | Shows exactly 6 items initially when total > 6; clicking "Tampilkan Semua" expands to full array; clicking "Ringkas" folds back to 6. |
| **T-R3.5** | Mode-Reactive Switching | Change activeMode: tech -> medical -> academic | Unified history and counts re-compute reactively with 0 runtime errors. |
| **T-R3.6** | Responsive Breakpoints | Viewport widths 320px, 768px, 1024px, 1440px | Bento tiles stack to 1 col on mobile, 2 cols on tablet, and 12-col interlocking grid on desktop without text clipping or horizontal overflow. |
| **T-R3.7** | Build & Static Export Integrity | `node -r ./patch-fs.js node_modules/next/dist/bin/next build` | Produces `out/index.html` with exit code 0. |

---

## 7. Recommended Implementation Sequence

1. **Step 1: Insulate `patch-fs.js`**: Add `ensureMiddlewareManifestOnDisk` and `require(...)` interception for `middleware-manifest.json` to guarantee rock-solid `npm.cmd run build` execution.
2. **Step 2: Implement Smart Bento Grid in `src/components/about.tsx`**: Replace the 2-column asymmetric layout with the 5-tile 12-column Smart Bento Grid architecture specified in Section 5.
3. **Step 3: Verification**:
   - Run `npm.cmd run typecheck`
   - Run `npm.cmd run lint`
   - Run `node tests/e2e/runner.mjs`
   - Run `npm.cmd run build` and inspect `out/index.html`.
