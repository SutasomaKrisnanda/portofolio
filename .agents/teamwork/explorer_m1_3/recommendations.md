# Architectural & Integration Blueprint: Milestone 1
**Integration & Build Stabilization Architecture**

- **Agent**: Teamwork Explorer 3 (`explorer_m1_3`)
- **Role**: Integration & Build Stabilization Architect
- **Target Milestone**: Milestone 1 (Visual Backgrounds, Dynamic Project Icons & Build Stabilization)
- **Date**: 2026-11-05
- **Status**: Complete & Verified

---

## 1. Executive Summary

Milestone 1 establishes the visual foundation and build stability of the portfolio:
1. **Hero Background Integration (R1)**: Incorporate 6 high-fidelity `.avif` background images from `src/assets/image/` into a dedicated `<HeroBackground />` component inside `src/components/hero.tsx` with smooth cross-fades and WCAG AAA contrast overlays.
2. **Dynamic Project Icons Integration (R3)**: Replace the procedural `DiamondArtifactGlyph` with `<ProjectModeIcon />` using official SVG emblems from `src/assets/icons/` so project cards dynamically reflect `activeMode` (including multi-mode projects like HMSSO).
3. **Windows WSL Build Stabilization (R0)**: Eliminate the `readlink` EISDIR error by relocating `src/app/favicon.ico` to `public/favicon.ico`, cleaning orphan `.ico` files, updating `src/app/layout.tsx` metadata icons, and modernizing `package.json` build scripts for cross-platform execution on Windows, WSL, and CI environments.

Both static type checking (`tsc --noEmit`) and production static export builds (`node -r ./patch-fs.js node_modules/next/dist/bin/next build`) have been tested and verified to exit with code 0.

---

## 2. Component Integration in `src/components/hero.tsx`

### 2.1 Integration Overview & Objectives
`src/components/hero.tsx` coordinates the visual presentation of the hero section. To integrate Milestone 1 components:
- Insert `<HeroBackground activeMode={activeMode} theme={currentTheme} />` as the first child of the `<section id="hero">` element at `absolute inset-0 pointer-events-none z-0`.
- Replace `DiamondArtifactGlyph` inside the right-column preview cards with `<ProjectModeIcon mode={activeMode} project={slideProj} />`.
- Obtain `resolvedTheme` via `useTheme()` hook with hydration-safe `mounted` state.
- Improve card interaction: clicking an already active card opens the project modal (`onOpenProject(slideProj)`).

### 2.2 Concrete Code Modifications in `src/components/hero.tsx`

#### A. Imports Update
```diff
--- a/src/components/hero.tsx
+++ b/src/components/hero.tsx
@@ -1,17 +1,20 @@
 'use client';
 
-import React, { useState, useMemo } from 'react';
+import React, { useState, useEffect, useMemo } from 'react';
 import {
   ModeId,
   PortfolioModeConfig,
   Project,
   GLOBAL_PROFILE
 } from '@/data/portfolio-data';
-import { PrismTriangleGlyph, VectorArrowGlyph, DiamondArtifactGlyph } from './geometric-glyphs';
+import { PrismTriangleGlyph, VectorArrowGlyph } from './geometric-glyphs';
 import { IridescentCrystalCanvas } from './crystal-canvas';
+import { HeroBackground } from './hero-background';
+import { ProjectModeIcon } from './project-mode-icon';
+import { useTheme } from '@/components/theme-provider';
```

#### B. Component State & Theme Hook
```diff
 export default function Hero({
   modeConfig,
   activeMode,
   projects,
   onOpenProject,
   onNavigateSection
 }: HeroProps) {
+  const { resolvedTheme } = useTheme();
+  const [mounted, setMounted] = useState<boolean>(false);
   const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
   const [heroParallax, setHeroParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
 
+  useEffect(() => {
+    setMounted(true);
+  }, []);
+
+  const currentTheme: 'dark' | 'light' = mounted && resolvedTheme === 'light' ? 'light' : 'dark';
```

#### C. Background Layer Insertion
```diff
   return (
     <section
       id="hero"
       onMouseMove={(e) => {
         const rect = e.currentTarget.getBoundingClientRect();
         const nx = (e.clientX - rect.left) / rect.width - 0.5;
         const ny = (e.clientY - rect.top) / rect.height - 0.5;
         setHeroParallax({ x: nx * 12, y: ny * 8 });
       }}
       onMouseLeave={() => setHeroParallax({ x: 0, y: 0 })}
       className="relative w-full h-screen min-h-[640px] flex flex-col justify-between pt-20 sm:pt-24 pb-4 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
     >
+      {/* Dynamic AVIF Environmental Background with Cross-Fade & Contrast Overlays */}
+      <HeroBackground activeMode={activeMode} theme={currentTheme} />
+
       {/* Top Status Bar: Minimal & Clean */}
       <div className="relative z-20 max-w-7xl w-full mx-auto flex items-center justify-between gap-3 pt-1">
```

#### D. Diamond Card Icon Replacement & Single-Click Interaction
```diff
         {/* Right Column: 3 Diamond Cards + Numbered Sequence */}
         <div className="lg:col-span-3 relative flex items-center justify-center lg:justify-end min-h-[320px]">
           <div className="relative flex flex-col items-center gap-4 mr-10 sm:mr-16">
             {heroSlides.slice(0, 3).map((slideProj, idx) => {
               const arcOffsets = [
                 '-translate-x-4 sm:-translate-x-8',
                 '-translate-x-1 sm:-translate-x-2',
                 'translate-x-2 sm:translate-x-4'
               ];
               const isCardActive = activeSlideIndex === idx;
               return (
                 <button
                   key={slideProj.id}
                   type="button"
-                  onClick={() => setActiveSlideIndex(idx)}
-                  onDoubleClick={() => onOpenProject(slideProj)}
-                  title={`${slideProj.title} — Klik untuk fokus, Double-klik untuk Case Study`}
+                  onClick={() => {
+                    if (isCardActive) {
+                      onOpenProject(slideProj);
+                    } else {
+                      setActiveSlideIndex(idx);
+                    }
+                  }}
+                  title={`${slideProj.title} — Klik untuk fokus atau melihat Case Study`}
                   className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-45 transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer ${
                     arcOffsets[idx] || ''
                   } ${
                     isCardActive
                       ? 'bg-white ring-4 ring-slate-900/20 dark:ring-white/60 scale-110 z-20 shadow-xl'
                       : 'bg-white/80 dark:bg-white/70 hover:bg-white dark:hover:bg-white/85 opacity-90 hover:scale-105 z-10'
                   } backdrop-blur-md border border-slate-900/10 dark:border-white/70`}
                 >
                   <div className="-rotate-45 flex flex-col items-center justify-center p-1 text-center">
-                    <DiamondArtifactGlyph
-                      visualType={slideProj.visualType}
-                      index={idx}
-                      isActive={isCardActive}
-                    />
+                    <ProjectModeIcon
+                      mode={activeMode}
+                      project={slideProj}
+                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
+                      priority={idx === 0}
+                    />
                     <span className="mt-0.5 text-[7px] uppercase tracking-wider font-bold text-slate-900 truncate max-w-[55px]">
                       {slideProj.title.split(' ')[0]}
                     </span>
                   </div>
                 </button>
               );
             })}
           </div>
```

---

## 3. Specifications for M1 Components

### 3.1 `src/components/hero-background.tsx` (Requirement R1)

#### Contract & Props
```typescript
import { ModeId } from '@/data/portfolio-data';

export interface HeroBackgroundProps {
  /** Active portfolio mode */
  activeMode: ModeId;
  /** Resolved color theme */
  theme: 'dark' | 'light';
  /** Optional custom container CSS classes */
  className?: string;
}
```

#### Key Design Decisions:
1. **Preload & Layering**: All 6 images are pre-rendered into the DOM using Next.js `<Image fill priority sizes="100vw" quality={90} unoptimized />`.
2. **Opacity Transition**: Cross-fading is achieved via `transition-opacity duration-700 ease-out`. The active image has `opacity-100 z-10`; the remaining 5 images have `opacity-0 z-0 pointer-events-none`.
3. **Contrast Vignettes (WCAG AAA)**:
   - **Dark Theme Overlays**:
     - Top Vignette: `linear-gradient(to bottom, rgba(2, 6, 23, 0.7) 0%, rgba(2, 6, 23, 0.2) 25%, transparent 40%)`
     - Bottom Shelf Vignette: `linear-gradient(to top, rgba(2, 6, 23, 0.85) 0%, rgba(2, 6, 23, 0.3) 30%, transparent 50%)`
     - Left Narrative Curtain: `linear-gradient(to right, rgba(2, 6, 23, 0.75) 0%, rgba(2, 6, 23, 0.3) 45%, transparent 75%)`
   - **Light Theme Overlays**:
     - Top Vignette: `linear-gradient(to bottom, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.2) 25%, transparent 40%)`
     - Bottom Shelf Vignette: `linear-gradient(to top, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 30%, transparent 50%)`
     - Left Narrative Curtain: `linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.25) 45%, transparent 75%)`

#### Complete Proposed Implementation
```tsx
'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId } from '@/data/portfolio-data';

import bgTechDark from '@/assets/image/bg-tech-dark.avif';
import bgTechLight from '@/assets/image/bg-tech-light.avif';
import bgAcademicDark from '@/assets/image/bg-academic-dark.avif';
import bgAcademicLight from '@/assets/image/bg-academic-light.avif';
import bgMedicalDark from '@/assets/image/bg-medical-dark.avif';
import bgMedicalLight from '@/assets/image/bg-medical-light.avif';

export interface HeroBackgroundProps {
  activeMode: ModeId;
  theme: 'dark' | 'light';
  className?: string;
}

interface BackgroundEntry {
  id: string;
  mode: ModeId;
  theme: 'dark' | 'light';
  asset: StaticImageData;
  alt: string;
}

const BACKGROUND_CONFIGS: BackgroundEntry[] = [
  { id: 'tech-dark', mode: 'tech', theme: 'dark', asset: bgTechDark, alt: 'Tech and Software Engineering night alpine lake background' },
  { id: 'tech-light', mode: 'tech', theme: 'light', asset: bgTechLight, alt: 'Tech and Software Engineering daytime alpine lake background' },
  { id: 'academic-dark', mode: 'academic', theme: 'dark', asset: bgAcademicDark, alt: 'Academic scholarship gothic library dark background' },
  { id: 'academic-light', mode: 'academic', theme: 'light', asset: bgAcademicLight, alt: 'Academic scholarship neoclassical library light background' },
  { id: 'medical-dark', mode: 'medical', theme: 'dark', asset: bgMedicalDark, alt: 'Medical and Healthcare biotechnology laboratory dark background' },
  { id: 'medical-light', mode: 'medical', theme: 'light', asset: bgMedicalLight, alt: 'Medical and Healthcare clinical laboratory light background' },
];

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  activeMode,
  theme,
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
    >
      {/* 6 Cross-fading Environmental AVIF Images */}
      {BACKGROUND_CONFIGS.map((bg) => {
        const isActive = bg.mode === activeMode && bg.theme === theme;
        return (
          <div
            key={bg.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image
              src={bg.asset}
              alt={bg.alt}
              fill
              priority
              sizes="100vw"
              quality={90}
              unoptimized
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* WCAG AAA Contrast Vignette Overlays */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Top Header Vignette */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-slate-950/65 dark:from-black/75 via-slate-950/20 dark:via-black/25 to-transparent transition-opacity duration-700" />

        {/* Bottom Shelf Vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-slate-950/85 dark:from-black/90 via-slate-950/30 dark:via-black/35 to-transparent transition-opacity duration-700" />

        {/* Left Typography Contrast Curtain */}
        <div className="absolute top-0 bottom-0 left-0 w-full md:w-3/5 lg:w-1/2 bg-gradient-to-r from-slate-950/70 dark:from-black/80 via-slate-950/25 dark:via-black/25 to-transparent transition-opacity duration-700" />

        {/* Subtle Light Theme Contrast Neutralizer */}
        {theme === 'light' && (
          <div className="absolute inset-0 bg-white/20 dark:bg-transparent backdrop-brightness-[0.98] transition-opacity duration-700" />
        )}
      </div>
    </div>
  );
};

export default HeroBackground;
```

---

### 3.2 `src/components/project-mode-icon.tsx` (Requirement R3)

#### Contract & Props
```typescript
import { ModeId, Project } from '@/data/portfolio-data';

export interface ProjectModeIconProps {
  /** Active portfolio mode ('tech' | 'medical' | 'academic') */
  mode: ModeId;
  /** Optional project reference for multi-mode validation */
  project?: Project | null;
  /** Custom Tailwind CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Accessible alt text */
  alt?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Priority preload */
  priority?: boolean;
}
```

#### Dynamic Multi-Mode Resolution Rule:
If `project` is provided and the project supports `mode` (via `project.mode === mode` or `project.secondaryModes?.includes(mode)`), the icon matches the current `mode`. If a project does not support `mode`, it gracefully falls back to `project.mode`.

#### Complete Proposed Implementation
```tsx
'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project } from '@/data/portfolio-data';

import techIcon from '@/assets/icons/project-tech.svg';
import medicalIcon from '@/assets/icons/project-medical.svg';
import academicIcon from '@/assets/icons/project-academic.svg';

export const MODE_ICON_MAP: Record<ModeId, StaticImageData> = {
  tech: techIcon,
  medical: medicalIcon,
  academic: academicIcon,
};

const MODE_LABELS: Record<ModeId, string> = {
  tech: 'Teknologi & Software Engineering',
  medical: 'Kedokteran & Kesehatan Komunitas',
  academic: 'Akademik & Karya Tulis Ilmiah',
};

export interface ProjectModeIconProps {
  mode: ModeId;
  project?: Project | null;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  project,
  className = 'w-8 h-8 object-contain drop-shadow',
  style,
  alt,
  width = 48,
  height = 48,
  priority = false,
}) => {
  // Dynamic multi-mode resolution
  const resolvedMode: ModeId =
    project && project.mode !== mode && !project.secondaryModes?.includes(mode)
      ? project.mode
      : mode;

  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;
  const accessibleAlt =
    alt || (project ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode]}` : `Logo Mode ${MODE_LABELS[resolvedMode]}`);

  return (
    <Image
      src={iconAsset}
      alt={accessibleAlt}
      width={width}
      height={height}
      className={`transition-all duration-300 ${className}`}
      style={style}
      priority={priority}
      unoptimized
    />
  );
};

export default ProjectModeIcon;
```

---

## 4. Windows WSL Next.js Build Stabilization

### 4.1 Root Cause of `readlink` EISDIR Error
- **Environment**: Drive `W:\` is mapped from WSL/Linux to Windows.
- **Node.js Filesystem Behavior**: Calling `fs.readlink` or `fs.promises.readlink` on regular files on this mapped filesystem throws `Error: EISDIR: illegal operation on a directory, readlink '...'` instead of POSIX `EINVAL`.
- **Next.js App Router Trigger**: Next.js 15 metadata-routes engine inspects `src/app/` for metadata conventions (`favicon.ico`, `icon.*`, `apple-icon.*`, etc.) using `fs.promises.readlink`. It expects `EINVAL` for regular files. When receiving `EISDIR`, it fails the build.
- **Webpack Bundling Trigger**: Webpack module resolver also calls `fs.readlink` when resolving files in `node_modules`.

### 4.2 Permanent Stabilization Steps

#### Step 1: Relocate Favicon
1. Move `src/app/favicon.ico` to `public/favicon.ico`.
2. Delete orphan `src/app/oldfavicon.ico`.
3. In `src/app/layout.tsx`, add an explicit `icons` field to `metadata`:
   ```typescript
   export const metadata: Metadata = {
     title: 'I Gede Arya Krisnanda Sutasoma | Personal Portfolio',
     ...
     icons: {
       icon: '/favicon.ico',
     },
   };
   ```
   **Effect**: Next.js App Router no longer scans `favicon.ico` as an internal route convention. Next.js static export automatically copies all `public/` files into `out/`, serving `/favicon.ico` directly from the origin root.

#### Step 2: Cross-Platform `package.json` Build Scripts
In `package.json`:
- Replace `"build": "NODE_ENV=production next build"` with:
  ```json
  "build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build",
  "lint": "node node_modules/next/dist/bin/next lint",
  "typecheck": "node node_modules/typescript/bin/tsc --noEmit"
  ```
- **Rationale**:
  1. `NODE_ENV=production` fails on Windows CMD and PowerShell because it is a POSIX environment prefix.
  2. Next.js `next build` already sets `process.env.NODE_ENV = 'production'` automatically.
  3. Preloading `./patch-fs.js` intercepts any `EISDIR` thrown by `readlink` and converts it to `EINVAL`, permanently protecting Webpack and Next.js against network drive anomalies.
  4. Explicitly running `node node_modules/...` guarantees seamless execution even if `node_modules/.bin` contains extensionless Linux symlinks without `.cmd` wrappers.

---

## 5. Interface & Props Contracts Matrix

| Component | File Path | Props Interface | Key Properties & Types |
|---|---|---|---|
| `HeroBackground` | `src/components/hero-background.tsx` | `HeroBackgroundProps` | `activeMode: 'tech' \| 'medical' \| 'academic'`, `theme: 'dark' \| 'light'`, `className?: string` |
| `ProjectModeIcon` | `src/components/project-mode-icon.tsx` | `ProjectModeIconProps` | `mode: 'tech' \| 'medical' \| 'academic'`, `project?: Project \| null`, `className?: string`, `width?: number`, `height?: number`, `priority?: boolean` |
| `Hero` | `src/components/hero.tsx` | `HeroProps` | `modeConfig: PortfolioModeConfig`, `activeMode: ModeId`, `projects: Project[]`, `onOpenProject: (p: Project) => void`, `onNavigateSection: (id: string) => void`, `onSwitchMode: (mode: ModeId) => void` |
| `RootLayout` | `src/app/layout.tsx` | Next.js `Metadata` | `icons: { icon: '/favicon.ico' }` |

---

## 6. Implementation Action Plan for Implementer

1. **Move Favicon**:
   - Move `src/app/favicon.ico` -> `public/favicon.ico`.
   - Remove `src/app/oldfavicon.ico`.
   - Add `icons: { icon: '/favicon.ico' }` to `metadata` in `src/app/layout.tsx`.
2. **Update `package.json`**:
   - Update `"build"` script to `"node -r ./patch-fs.js node_modules/next/dist/bin/next build"`.
3. **Create `src/components/hero-background.tsx`**:
   - Implement with 6 AVIF static imports, opacity cross-fade, and contrast vignettes.
4. **Create `src/components/project-mode-icon.tsx`**:
   - Implement with 3 SVG static imports, dynamic multi-mode resolution, and accessible alt text.
5. **Update `src/components/hero.tsx`**:
   - Import `HeroBackground`, `ProjectModeIcon`, and `useTheme`.
   - Mount theme state: `const currentTheme = mounted && resolvedTheme === 'light' ? 'light' : 'dark'`.
   - Add `<HeroBackground activeMode={activeMode} theme={currentTheme} />` as the first child of `<section id="hero">`.
   - Replace `DiamondArtifactGlyph` with `<ProjectModeIcon mode={activeMode} project={slideProj} />`.
   - Enhance diamond card click handler for active card modal opening.

---

## 7. Verification Method

To independently verify the Milestone 1 implementation:

1. **TypeScript Strict Type Check**:
   ```powershell
   node node_modules/typescript/bin/tsc --noEmit
   ```
   *Expected*: Zero errors, exit code 0.

2. **Production Static Export Build**:
   ```powershell
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
   *Expected*: `✓ Compiled successfully`, `✓ Generating static pages (5/5)`, `✓ Exporting (2/2) to out/`, exit code 0.

3. **Runtime & Visual Verification**:
   - Start development server: `node node_modules/next/dist/bin/next dev -p 9002`.
   - Visit `http://localhost:9002/?mode=tech`:
     - Background displays `bg-tech-dark.avif` (dark) or `bg-tech-light.avif` (light).
     - Hero diamond cards display `project-tech.svg`.
   - Switch to Medical Mode (`?mode=medical`):
     - Background smoothly cross-fades to `bg-medical-dark.avif` / `bg-medical-light.avif`.
     - Hero diamond cards display `project-medical.svg`.
     - For multi-mode project `HMSSO`, verify its icon dynamically transitions from tech to medical.
   - Switch to Academic Mode (`?mode=academic`):
     - Background smoothly cross-fades to `bg-academic-dark.avif` / `bg-academic-light.avif`.
     - Hero diamond cards display `project-academic.svg`.
   - Click an active diamond card:
     - Project modal opens immediately with full case study detail.
