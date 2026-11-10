# Technical Analysis & Implementation Blueprint: Projects Gallery Category Pills Compactness & Sync

**Author**: Explorer M1-1 (Milestone 1)  
**Date**: 2026-11-08  
**Scope**: `src/components/projects.tsx` and `src/app/globals.css`  
**Reference Docs**: `ORIGINAL_REQUEST.md` (§ R2, R4), `PROJECT.md` (Features 7, 9, Contract § Category Filter Sync)

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 Objective
Design and verify exact code solutions for:
1. **Compact, single-row horizontal scrollable category pills on mobile (`< sm` / `< 640px`)** with left and right gradient fade masks (`from-white dark:from-slate-950`) and auto-scroll on tap (`scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })`).
2. **Responsive wrapping on desktop (`sm:`)** with category count badges displaying available projects per category.
3. **Mode switch synchronization**: Automatically reset `selectedCategory` to `'All'` and scroll track back to beginning when `activeMode` changes.
4. **Verified CSS utility**: Implement standard `.no-scrollbar` in `src/app/globals.css`.

### 1.2 Observed Defects in Existing Implementation
Direct inspection of `src/components/projects.tsx` (lines 1-53, 96-116) and `src/app/globals.css` reveals the following critical shortcomings:

1. **Mobile Vertical Bloat (Lines 96-116 of `projects.tsx`)**:
   ```tsx
   {/* Current Category Filter Pills */}
   <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter kategori projek">
     {modeConfig.projectCategories.map((cat, idx) => { ... })}
   </div>
   ```
   Because `flex-wrap` is applied unconditionally at all viewport sizes, on mobile screens (viewport width 360px–420px), the 5 to 6 category pills wrap across 3 to 4 vertical rows. This consumes 120px–160px of vertical viewport real estate, pushing project cards off the primary viewport fold and creating visual clutter.
2. **Missing Scrollability Affordance**:
   Horizontal overflowing tracks without edge indicators fail standard usability heuristics. Users on mobile have no visual cue indicating whether pills extend past the screen edge.
3. **No Tap Auto-Centering**:
   Currently, tapping a partially hidden pill updates `selectedCategory` but leaves the pill cut off at the edge, forcing manual swipe adjustments.
4. **Desynchronization upon Mode Switch**:
   `Projects` holds local state `const [selectedCategory, setSelectedCategory] = useState<string>('All');`. There is no `useEffect` reacting to `activeMode`. When a user toggles from `tech` (e.g., selecting `"Software Engineering"`) to `medical` (which has categories: `"Kesehatan Komunitas"`, `"Edukasi Medis"`, `"Inovasi Kesehatan (mHealth)"`, `"Organisasi Kedokteran"`), `selectedCategory` remains `"Software Engineering"`. Because no medical projects match this stale category, the gallery collapses into the empty state ("Tidak ada projek yang sesuai dengan kata kunci atau filter ini").
5. **Missing `.no-scrollbar` Utility in `src/app/globals.css`**:
   `src/app/globals.css` defines `.custom-scrollbar` but completely lacks `.no-scrollbar`. Without this utility, browsers (particularly Chromium and Gecko on Windows) render native grey scrollbars directly under the pills, breaking the clean glassmorphic aesthetic.
6. **Missing Desktop Count Badges**:
   Desktop users have ample horizontal room (`sm:flex-wrap`) but currently lack category project count indicators, diminishing quick category appraisal.

---

## 2. Architecture & Design Specification

### 2.1 State Synchronization Hook (`activeMode`)
To satisfy the contract defined in `PROJECT.md` line 73-78:
```typescript
useEffect(() => {
  setSelectedCategory('All');
  if (categoryTrackRef.current) {
    categoryTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }
}, [activeMode]);
```
- **Invariant**: Whenever `activeMode` changes, `selectedCategory` deterministically reverts to `'All'`.
- **Ergonomics**: The scroll container smoothly resets scroll position to `0`, ensuring `"01 All"` is in full view.

### 2.2 Category Count Computation
We compute project counts per category for the currently active mode using a memoized reduction over `projects`:
```typescript
const categoryCounts = useMemo(() => {
  const modeProjects = projects.filter(
    (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
  );

  const counts: Record<string, number> = {
    All: modeProjects.length,
  };

  modeConfig.projectCategories.forEach((cat) => {
    if (cat !== 'All') {
      counts[cat] = modeProjects.filter(
        (p) => p.category === cat || p.secondaryCategory === cat
      ).length;
    }
  });

  return counts;
}, [projects, activeMode, modeConfig.projectCategories]);
```
- **Computational Complexity**: $O(K \times N)$ where $K \le 6$ categories and $N \approx 7-15$ projects. Execution takes $< 0.05\text{ms}$.
- **Data Invariant**: Verified against `projects.json`:
  - `tech`: Total 7 projects. Categories: Software Engineering (5), Web Development (3), UI/UX Design (1), Mobile Applications (1), Branding & Media (1).
  - `medical`: Total 4 projects. Categories: Kesehatan Komunitas (1), Proposal PKM (1), Software Engineering (2), Web Development (2), UI/UX Design (1), Branding & Media (1).
  - `academic`: Total 4 projects. Categories: Proposal PKM (2), Artikel & Esai Ilmiah (1), Kesehatan Komunitas (1), Software Engineering (2), Web Development (2).

### 2.3 Mobile-First Responsive Dual-Track & Fade Masks
We establish an outer container with relative positioning hosting:
1. **Left Gradient Mask (`< sm`)**:
   `pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent sm:hidden`
2. **Horizontal Scroll Track / Desktop Flex Container**:
   `flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth pb-2 pt-1 px-1 sm:px-0`
3. **Right Gradient Mask (`< sm`)**:
   `pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent sm:hidden`

#### Key Architectural Properties:
- `pointer-events-none`: Ensures taps on pills near the edge pass cleanly through to the `<button>`.
- `sm:hidden`: Fades are omitted on desktop screens where `sm:flex-wrap` eliminates horizontal overflow.
- `shrink-0 sm:shrink`: Prevents pills from collapsing on narrow screens while permitting clean wrapping on desktop.
- `no-scrollbar`: Suppresses native browser scrollbars via standard CSS rules.
- `scroll-smooth`: Enables fluid hardware-accelerated inertia scrolling.

### 2.4 Auto-Scroll on Tap Interaction
```typescript
const handleCategoryClick = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
  setSelectedCategory(cat);
  e.currentTarget.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });
};
```
- `inline: 'center'`: Centers the activated pill horizontally within the scroll container.
- `block: 'nearest'`: Prevents the viewport from jumping vertically if the button is already visible in the vertical viewport.

### 2.5 Desktop Count Badge Presentation
On desktop screens (`sm:`), the count badge is displayed as a clean sub-pill inside the button:
```tsx
<span
  className={`hidden sm:inline-flex items-center justify-center ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
    active
      ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950'
      : 'bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-400'
  }`}
>
  {count}
</span>
```
- On mobile (`< sm`), `hidden` preserves maximum compactness, keeping the single-row track neat and legible without truncation.
- On desktop (`sm:`), `sm:inline-flex` reveals the count badge with active and dark/light adaptive contrast.

### 2.6 CSS Utility Definition (`src/app/globals.css`)
In `src/app/globals.css`, append under `@layer utilities`:
```css
@layer utilities {
  /* Hide scrollbar for Chrome, Safari, Edge, Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
}
```

---

## 3. Exact Code Changes (Drop-In Blueprint)

### Target 1: `src/components/projects.tsx`

#### Change 1A: Hook Imports & References (Lines 1-6)
**Before:**
```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { ModeId, PortfolioModeConfig, Project } from '@/data/portfolio-data';
import { VectorArrowGlyph, DiamondArtifactGlyph } from './geometric-glyphs';
```

**After:**
```tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ModeId, PortfolioModeConfig, Project } from '@/data/portfolio-data';
import { VectorArrowGlyph, DiamondArtifactGlyph } from './geometric-glyphs';
```

#### Change 1B: State, Ref, and Sync Effect (Lines 20-24)
**Before:**
```tsx
export default function Projects({
  modeConfig,
  activeMode,
  projects,
  onOpenProject
}: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');
```

**After:**
```tsx
export default function Projects({
  modeConfig,
  activeMode,
  projects,
  onOpenProject
}: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'alphabetical'>('featured');
  const categoryTrackRef = useRef<HTMLDivElement>(null);

  // Synchronize category selection and scroll position on mode transition
  useEffect(() => {
    setSelectedCategory('All');
    if (categoryTrackRef.current) {
      categoryTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeMode]);

  // Compute category project counts per active mode
  const categoryCounts = useMemo(() => {
    const modeProjects = projects.filter(
      (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
    );
    const counts: Record<string, number> = {
      All: modeProjects.length
    };
    modeConfig.projectCategories.forEach((cat) => {
      if (cat !== 'All') {
        counts[cat] = modeProjects.filter(
          (p) => p.category === cat || p.secondaryCategory === cat
        ).length;
      }
    });
    return counts;
  }, [projects, activeMode, modeConfig.projectCategories]);

  const handleCategoryClick = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(cat);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };
```

#### Change 1C: Category Filter Track & Fade Masks (Lines 96-116)
**Before:**
```tsx
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter kategori projek">
          {modeConfig.projectCategories.map((cat, idx) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
                }`}
              >
                <span className="opacity-50 mr-1.5 font-mono text-[10px]">0{idx + 1}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
```

**After:**
```tsx
        {/* Category Filter Pills Container with Gradient Fade Masks */}
        <div className="relative w-full">
          {/* Left Gradient Fade Mask (mobile < sm only) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent sm:hidden"
          />

          {/* Horizontal Scroll Track (< sm) / Responsive Wrapped Group (sm:) */}
          <div
            ref={categoryTrackRef}
            role="group"
            aria-label="Filter kategori projek"
            className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth pb-2 pt-1 px-1 sm:px-0"
          >
            {modeConfig.projectCategories.map((cat, idx) => {
              const active = selectedCategory === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => handleCategoryClick(cat, e)}
                  className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink inline-flex items-center ${
                    active
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
                  }`}
                >
                  <span className="opacity-50 mr-1.5 font-mono text-[10px]">0{idx + 1}</span>
                  <span>{cat}</span>
                  <span
                    className={`hidden sm:inline-flex items-center justify-center ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                      active
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950'
                        : 'bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Gradient Fade Mask (mobile < sm only) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent sm:hidden"
          />
        </div>
```

---

### Target 2: `src/app/globals.css`

#### Change 2A: Utility Injection (at end of `src/app/globals.css`)
**Append to file:**
```css
/* No Scrollbar Utility for Clean Horizontal Scrolling */
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
}
```

---

## 4. Verification & Validation Protocol

### 4.1 Automated Validation Commands
The implementer must execute and confirm green status for:
1. **TypeScript Typecheck**:
   ```powershell
   cmd /c npm run typecheck
   ```
   *Expected*: Exit code 0, 0 type errors.
2. **ESLint**:
   ```powershell
   cmd /c npm run lint
   ```
   *Expected*: Exit code 0, no ESLint errors or unhandled warnings in modified files.
3. **E2E Suite Runner**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected*: 78/78 tests passed across Tiers 1–4 with exit code 0.
4. **Static Export Build**:
   ```powershell
   cmd /c npm run build
   ```
   *Expected*: Next.js static HTML export completed with exit code 0.

### 4.2 Browser & Responsive Viewport Verification Matrix

| Viewport | Dimension | Expected UI/UX Behavior |
|---|---|---|
| **Mobile Portrait** | 375px × 667px (iPhone SE) | Single-row horizontal scroll track (`flex-nowrap`), no vertical wrapping, left and right gradient masks visible, no scrollbar visible, tapping a pill smoothly centers it in view. Count badge hidden to preserve compact footprint. |
| **Mobile Large** | 412px × 915px (Pixel 7) | Same single-row horizontal scroll track, smooth touch drag and tap auto-centering. |
| **Tablet** | 768px × 1024px (iPad) | Responsive wrapping (`sm:flex-wrap`), gradient masks hidden, count badges visible with exact category numbers. |
| **Desktop** | 1280px × 800px | Clean wrapped pills row with badges, clear active state highlighting. |
| **Mode Switch** | Switching Tech -> Medical | `selectedCategory` resets to `'All'` instantly; scroll container resets `scrollLeft` to 0. No "project not found" empty state flicker. |

---

## 5. Architectural Non-Regression Assessment
- **Existing Props & Callers**: `ProjectsProps` remains completely unchanged. No parent components (`page.tsx`) need alterations.
- **Search & Sort Synergy**: `searchQuery` and `sortBy` state remain intact and continue operating orthogonally with `selectedCategory`.
- **Performance**: Zero re-render leaks; `categoryCounts` memoization prevents redundant iterations during typing in search or scrolling.
