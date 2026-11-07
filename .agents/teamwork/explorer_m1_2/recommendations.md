# Architectural Recommendations: Dynamic Project Logo Icons (Requirement R3 & Milestone 1)

**Author**: Teamwork Explorer 2 (`explorer_m1_2`)  
**Mission**: Milestone 1 — Dynamic Project Icons Architect  
**Target Files**:
- `src/components/project-mode-icon.tsx` (New Component)
- `src/components/hero.tsx` (Integration & Glyph Replacement)
- `src/components/projects.tsx` (Consistency Extension)
- `src/components/project-modal.tsx` (Consistency Extension)

---

## 1. Executive Summary & Problem Analysis

### 1.1 The Existing Problem
In `src/components/hero.tsx` (line 207) and `src/components/projects.tsx` (line 156), project cards currently render `DiamondArtifactGlyph` from `src/components/geometric-glyphs.tsx`.
`DiamondArtifactGlyph` computes `index % 3` to render one of three procedural SVG shapes (a metallic blob, a pink diamond, or a cyan prism).
**Issues with this approach**:
1. It is completely disconnected from the project's actual mode (`mode: 'tech' | 'medical' | 'academic'`).
2. It completely ignores the active portfolio mode (`activeMode: ModeId`).
3. It completely ignores the high-definition SVG icon assets provided in `src/assets/icons/`:
   - `project-tech.svg` (1.91 MB)
   - `project-medical.svg` (1.84 MB)
   - `project-academic.svg` (1.82 MB)
4. Multi-mode projects (e.g. `proj-hmsso`, which belongs to `tech`, `medical`, and `academic`) display static icons that do not react when the user toggles modes.

### 1.2 Target Objectives for Milestone 1 (R3)
1. Build a centralized, strongly typed, performance-optimized React component: `src/components/project-mode-icon.tsx`.
2. Connect `project-tech.svg`, `project-medical.svg`, and `project-academic.svg` to the active mode state.
3. Support multi-mode projects so that the icon dynamically updates to match `activeMode` whenever the user switches between Tech, Medical, and Academic modes.
4. Support flexible CSS `className` styling including width, height, drop-shadow filters, opacity, hover transitions, and responsive breakpoints.
5. Replace `DiamondArtifactGlyph` in `src/components/hero.tsx` cleanly without breaking diamond card rotation, layout hierarchy, or accessibility.

---

## 2. Technical Evaluation of SVG Assets & Bundling Architecture

### 2.1 Inspection of `src/assets/icons/*.svg`
| Icon Asset | File Size | ViewBox | Dimensions | Description & Features |
|---|---|---|---|---|
| `project-tech.svg` | 1,907,450 bytes (~1.91 MB) | `0 0 168.75 116.25` | `w: 225, h: 155` | Landscape emblem with cyan/blue circuitry and digital tech branding. Contains embedded high-res PNG artwork + SVG filter matrix. |
| `project-medical.svg` | 1,841,689 bytes (~1.84 MB) | `0 0 159 120` | `w: 212, h: 160` | Landscape emblem with emerald/teal cross, caduceus, and clinical health branding. Embedded high-res PNG + SVG mask. |
| `project-academic.svg` | 1,817,737 bytes (~1.82 MB) | `0 0 177 112.5` | `w: 236, h: 150` | Landscape emblem with purple/indigo quill, book, and scholarly research branding. Embedded high-res PNG + SVG mask. |

### 2.2 Why SVGs Must NOT Be Inlined into the React DOM Tree
- **Bundle Bloat Warning**: Each SVG is ~1.85 MB because it contains embedded base64 master artwork.
- Inlining the 3 SVGs directly into JSX (via `@svgr` or raw SVG JSX) would inject **~5.56 MB of base64 text into the JavaScript client bundle**.
- This would catastrophically slow down initial bundle download, parsing, and React hydration on mobile devices.
- **The Correct Architecture**: Use Next.js Static Image Imports (`import techIcon from '@/assets/icons/project-tech.svg'`) or Next.js `<Image unoptimized />` / HTML `<img>`.
  - Next.js Webpack/Turbopack emits each SVG as a separate static hashed asset (e.g., `/_next/static/media/project-tech.[hash].svg`).
  - The client downloads the SVG once and browser-caches it permanently via HTTP cache headers.
  - The React virtual DOM only renders a lightweight `<img>` element (`< 150 bytes`), preserving 60 FPS performance and zero hydration lag.
  - Furthermore, mirroring `src/assets/icons/*.svg` to `public/icons/` provides an immutable URL fallback for static HTML exports.

---

## 3. Component Specification: `src/components/project-mode-icon.tsx`

### 3.1 Interface Contract
```typescript
import { ModeId, Project } from '@/data/portfolio-data';

export interface ProjectModeIconProps {
  /** Current active portfolio mode ('tech' | 'medical' | 'academic') */
  mode: ModeId;
  /**
   * Optional project reference.
   * If provided and project does not support `mode`, falls back to `project.mode`.
   */
  project?: Project | null;
  /** Custom CSS classes for sizing, drop-shadow, filter, transitions, etc. */
  className?: string;
  /** Inline CSS style overrides */
  style?: React.CSSProperties;
  /** Accessible alt description (defaults to localized mode name) */
  alt?: string;
  /** Natural pixel width for layout reservation (default: 48) */
  width?: number;
  /** Natural pixel height for layout reservation (default: 48) */
  height?: number;
  /** High priority preload for above-the-fold hero cards */
  priority?: boolean;
}
```

### 3.2 Dynamic Mode Resolution Algorithm
To satisfy Requirement R3:
> *"Untuk project yang memiliki dua atau lebih label mode, icon yang ditampilkan harus tetap berubah secara dinamis mengikuti mode yang sedang aktif saat ini."*

The resolution rule is:
1. If no `project` is passed, display the icon for `mode`.
2. If `project` is passed:
   - Check if `project.mode === mode` or `project.secondaryModes?.includes(mode)`.
   - If `true`: the project is active under this mode -> **Use `mode`**.
   - If `false`: fallback to the project's primary `project.mode`.

```typescript
const resolvedMode: ModeId =
  project && project.mode !== mode && !project.secondaryModes?.includes(mode)
    ? project.mode
    : mode;
```

### 3.3 Complete Production Implementation
Create `src/components/project-mode-icon.tsx`:

```tsx
'use client';

import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { ModeId, Project } from '@/data/portfolio-data';

// Static Image Imports processed by Next.js bundler
import techIcon from '@/assets/icons/project-tech.svg';
import medicalIcon from '@/assets/icons/project-medical.svg';
import academicIcon from '@/assets/icons/project-academic.svg';

export const MODE_ICON_MAP: Record<ModeId, StaticImageData> = {
  tech: techIcon,
  medical: medicalIcon,
  academic: academicIcon,
};

// Fallback public static URLs if serving from public/icons
export const PUBLIC_ICON_MAP: Record<ModeId, string> = {
  tech: '/icons/project-tech.svg',
  medical: '/icons/project-medical.svg',
  academic: '/icons/project-academic.svg',
};

const MODE_LABELS: Record<ModeId, string> = {
  tech: 'Teknologi & Rekayasa Perangkat Lunak',
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
  // 1. Resolve dynamic mode based on active mode and project multi-mode tags
  const resolvedMode: ModeId =
    project && project.mode !== mode && !project.secondaryModes?.includes(mode)
      ? project.mode
      : mode;

  // 2. Select asset
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

## 4. Integration Blueprint for `src/components/hero.tsx`

### 4.1 Changes in Imports
In `src/components/hero.tsx`:
- Line 10 currently:
  ```tsx
  import { PrismTriangleGlyph, VectorArrowGlyph, DiamondArtifactGlyph } from './geometric-glyphs';
  ```
- Change to:
  ```tsx
  import { PrismTriangleGlyph, VectorArrowGlyph } from './geometric-glyphs';
  import { ProjectModeIcon } from './project-mode-icon';
  ```

### 4.2 Replacing Diamond Cards Icon
In `src/components/hero.tsx`, locate the right column diamond cards mapping (lines 184–218):

```tsx
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
          onClick={() => setActiveSlideIndex(idx)}
          onDoubleClick={() => onOpenProject(slideProj)}
          title={`${slideProj.title} — Klik untuk fokus, Double-klik untuk Case Study`}
          className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-45 transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer ${
            arcOffsets[idx] || ''
          } ${
            isCardActive
              ? 'bg-white ring-4 ring-slate-900/20 dark:ring-white/60 scale-110 z-20 shadow-xl'
              : 'bg-white/80 dark:bg-white/70 hover:bg-white dark:hover:bg-white/85 opacity-90 hover:scale-105 z-10'
          } backdrop-blur-md border border-slate-900/10 dark:border-white/70`}
        >
          <div className="-rotate-45 flex flex-col items-center justify-center p-1 text-center">
            {/* REPLACE DiamondArtifactGlyph WITH ProjectModeIcon */}
            <ProjectModeIcon
              mode={activeMode}
              project={slideProj}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
              priority={idx === 0}
            />
            <span className="mt-0.5 text-[7px] uppercase tracking-wider font-bold text-slate-900 truncate max-w-[55px]">
              {slideProj.title.split(' ')[0]}
            </span>
          </div>
        </button>
      );
    })}
  </div>
```

### 4.3 Why This Exact Geometry Works
1. **Geometric Confinement**:
   - The button has `w-16 h-16 sm:w-20 sm:h-20` rotated 45 degrees.
   - The maximum square that can fit inside a 45-degree rotated box without touching the corners is `length / sqrt(2)`:
     - For 64px (`w-16`): inner bound is ~45.2px.
     - For 80px (`w-20`): inner bound is ~56.5px.
   - An icon of `w-8 h-8` (32px) on mobile and `sm:w-10 sm:h-10` (40px) on desktop leaves 10–16px of vertical headroom for the project abbreviation label (`text-[7px]`) without clipping or text overflow.
2. **Silhouette Shadowing**:
   - Because the SVG files have transparent margins around the emblem geometry, `drop-shadow-md` casts a clean, natural drop shadow along the vector contours of the emblem rather than a square box shadow.
3. **Responsive Multi-Mode Dynamics**:
   - When the user changes `activeMode` (e.g. from `tech` to `medical` via header tabs or `?mode=medical`), `Hero` receives the updated `activeMode`.
   - `heroSlides` automatically updates to show Medical projects.
   - For multi-mode projects like `proj-hmsso`, the icon instantaneously switches from `project-tech.svg` to `project-medical.svg`.

---

## 5. Extension: Consistent Icon Replacement Across the Codebase

To ensure 100% design harmony across the entire portfolio (per Requirement R3: *"Ganti semua logo icon dari masing-masing project menggunakan aset icon SVG"*):

### 5.1 In `src/components/projects.tsx`
Replace lines 155–157:
```tsx
{/* Before */}
<div className="shrink-0 p-1 rounded-lg bg-slate-900/5 dark:bg-white/10">
  <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
</div>

{/* After */}
<div className="shrink-0 p-1 rounded-lg bg-slate-900/5 dark:bg-white/10">
  <ProjectModeIcon
    mode={activeMode}
    project={project}
    className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow"
  />
</div>
```

### 5.2 In `src/components/project-modal.tsx`
In the modal header banner (line 72):
```tsx
<div className="flex items-center gap-3">
  <ProjectModeIcon
    mode={project.mode}
    project={project}
    className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow shrink-0"
  />
  <h2 id="case-study-title" className="text-2xl sm:text-3xl font-light text-slate-950 dark:text-white tracking-wide">
    {project.title}
  </h2>
</div>
```

---

## 6. Build Stabilization & Static Export Mirroring

### 6.1 Public Asset Mirroring Step
Although Next.js static asset imports bundle `src/assets/icons/*.svg` automatically, to guarantee 100% runtime reliability under Next.js static export (`output: 'export'`) across all environments:
- Copy `src/assets/icons/project-tech.svg` -> `public/icons/project-tech.svg`
- Copy `src/assets/icons/project-medical.svg` -> `public/icons/project-medical.svg`
- Copy `src/assets/icons/project-academic.svg` -> `public/icons/project-academic.svg`

### 6.2 Pre-existing Build Blocker Resolution
As documented in Explorer Survey 2, `src/app/favicon.ico` triggers an EISDIR `readlink` failure during `next build` on Windows.
- Move `src/app/favicon.ico` -> `public/favicon.ico`.
- This ensures `npm run build` completes cleanly without metadata scanner crashes.

---

## 7. Verification Method

To verify the implementation independently:

1. **Static Typecheck**:
   ```powershell
   node ./node_modules/typescript/bin/tsc --noEmit
   ```
   Must exit with code 0.

2. **Compilation & Static Export**:
   ```powershell
   node ./node_modules/next/dist/bin/next build
   ```
   Must output static HTML pages with zero export or compilation errors.

3. **Behavioral & Visual Verification**:
   - Run dev server (`npm.cmd run dev` or `node ./node_modules/next/dist/bin/next dev -p 9002`).
   - Navigate to `http://localhost:9002/?mode=tech`:
     - Inspect hero diamond cards: cards display `project-tech.svg`.
   - Switch to `http://localhost:9002/?mode=medical`:
     - Inspect hero diamond cards: cards dynamically display `project-medical.svg`.
     - Check `proj-hmsso` (featured in tech and medical): its icon dynamically changes from tech to medical.
   - Switch to `http://localhost:9002/?mode=academic`:
     - Inspect hero diamond cards: cards dynamically display `project-academic.svg`.
     - Check `proj-hmsso`: its icon dynamically changes from medical to academic.
   - Verify hover transition: card icons scale smoothly with `group-hover:scale-110`.

---
*End of Recommendation Report for Milestone 1 Architect.*
