# Comprehensive Architectural Analysis & Blueprint: Achievements Category Pills Redesign

**Author**: Explorer M1-2 (`explorer_m1_p2_2`)  
**Mission**: Milestone 1 (R2.2, R2.3) — Achievements Gallery Category Filter Row & Interaction Design  
**Date**: 2026-11-08  
**Target Files**:
- `src/components/achievements.tsx`
- `src/app/globals.css` (Supporting utility)

---

## 1. Executive Summary

In `src/components/achievements.tsx`, category filter pills are currently embedded directly inside the section Header Bar alongside the title (`sm:flex-row sm:items-end justify-between`). Because Indonesian achievement categories are lengthy strings (up to 32 characters, e.g., *"Milestone Projek Perangkat Lunak"*, *"Kontribusi Komunitas & Riset"*), this design creates severe layout degradation:
1. **Vertical Bloat on Mobile**: Category pills wrap into 4–6 lines on mobile viewports (`< 640px`), consuming >200px of vertical height before any achievement card is displayed.
2. **Horizontal Cramping on Desktop**: Title and pills compete within a single flex row. When wrapped on medium/desktop viewports, the header height jumps unpredictably and creates misaligned vertical rhythm.
3. **Ghost Categories & Dead Clicks**: Categories are hardcoded in an arbitrary array containing categories with **zero** achievements (e.g., *"Kepenulisan & Publikasi Ilmiah"* has 0 items across all modes, and *"Program Teknis & Akademik"* or *"Kontribusi Komunitas & Riset"* have 0 items in certain modes). Clicking these displays empty white space.
4. **State Desynchronization on Mode Switch**: When the user switches `activeMode` (Tech ↔ Medical ↔ Academic), `selectedCategory` is not reset to `'All'`. If the user selected a category present in Tech that does not exist in Medical, the gallery becomes empty upon mode switch.
5. **Missing Count Feedback**: Category buttons lack quantitative indicators (count badges), leaving users unaware of how many achievements exist per category.

This report establishes the complete architectural solution:
- Decouple category pills into a **dedicated filter row** below the header bar.
- On mobile (`< sm`), provide a **single-row horizontal scroll track** (`flex-nowrap overflow-x-auto no-scrollbar scroll-smooth`) with **left/right gradient fade masks**.
- On desktop (`sm:`), provide a **spacious wrapping layout** with **count badges**.
- Dynamically **prune empty categories** per `activeMode` while preserving canonical order.
- Synchronize `selectedCategory` to `'All'` and scroll to track origin via `useEffect` on `activeMode` change.
- Center tapped pills smoothly into viewport using `scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })`.

---

## 2. Empirical Codebase Observations

### 2.1 Current Header & Filter Layout in `src/components/achievements.tsx`
Lines 44–73 of `src/components/achievements.tsx`:
```tsx
{/* Header Bar */}
<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
  <div className="space-y-1.5">
    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
      <span>05</span>
      <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
      <span>Rekam Jejak, Prestasi & Kompetisi</span>
    </div>
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
      Prestasi & Penghargaan
    </h2>
  </div>

  {/* Category Filter Pills */}
  <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter prestasi">
    {categories.map((cat) => (
      <button
        key={cat}
        type="button"
        onClick={() => setSelectedCategory(cat)}
        className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
          selectedCategory === cat
            ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
            : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
</div>
```

**Observation Details**:
- Line 44 combines Title and Filter Pills within the same `flex-col sm:flex-row sm:items-end justify-between` wrapper above `border-b pb-5`.
- Line 57 uses `flex-wrap gap-2 overflow-x-auto pb-1`. On screens narrower than 640px, `flex-wrap` causes all 6 pill elements (each 180px–280px wide) to break into 4 to 6 rows.
- No count badge is rendered.
- No `useEffect` resets `selectedCategory` upon `activeMode` change.

### 2.2 Category Distribution in `src/data/achievements.json`
Analysis of all 7 records in `achievements.json`:
1. `ach-osn-informatika-2024`:
   - Category: `"Kompetisi & Penghargaan"`
   - Modes: `["tech"]`
2. `ach-storytelling-jepang-2023`:
   - Category: `"Kompetisi & Penghargaan"`
   - Modes: `["medical", "academic"]`
3. `ach-osn-matematika-2023`:
   - Category: `"Kompetisi & Penghargaan"`
   - Modes: `["tech", "academic"]`
4. `ach-coding-camp-2026`:
   - Category: `"Program Teknis & Akademik"`
   - Modes: `["tech"]`
5. `ach-pkm-pm-2026`:
   - Category: `"Kontribusi Komunitas & Riset"`
   - Modes: `["medical", "academic"]`
6. `ach-hmsso-lead`:
   - Category: `"Milestone Projek Perangkat Lunak"`
   - Modes: `["tech", "medical", "academic"]`
7. `ach-ncc-3`:
   - Category: `"Kompetisi & Penghargaan"`
   - Modes: `["academic", "tech"]`

**Distribution Matrix by Mode**:
| Category | Tech Mode | Medical Mode | Academic Mode | All Modes Combined |
|---|---|---|---|---|
| **Kompetisi & Penghargaan** | 3 (OSN Info, OSN Mat, NCC) | 1 (Storytelling) | 3 (Storytelling, OSN Mat, NCC) | 4 |
| **Program Teknis & Akademik** | 1 (Coding Camp) | 0 *(Empty!)* | 0 *(Empty!)* | 1 |
| **Kontribusi Komunitas & Riset** | 0 *(Empty!)* | 1 (PKM-PM) | 1 (PKM-PM) | 1 |
| **Milestone Projek Perangkat Lunak** | 1 (HMSSO) | 1 (HMSSO) | 1 (HMSSO) | 1 |
| **Kepenulisan & Publikasi Ilmiah** | 0 *(Empty!)* | 0 *(Empty!)* | 0 *(Empty!)* | 0 *(Dead category!)* |
| **Total per Mode ('All')** | **5** | **3** | **5** | **7** |

**Critical Finding**:
- `"Kepenulisan & Publikasi Ilmiah"` currently exists in `categories` array (line 25 of `achievements.tsx`), but has **0** items in the entire database.
- In `medical` mode, `"Program Teknis & Akademik"` is completely empty.
- In `tech` mode, `"Kontribusi Komunitas & Riset"` is completely empty.
- In `academic` mode, `"Program Teknis & Akademik"` is completely empty.
- Showing empty pills degrades user trust. **Pruning empty categories per activeMode** eliminates dead clicks completely while guaranteeing every pill yields actual content.

### 2.3 Status of `no-scrollbar` Utility in `src/app/globals.css`
Inspection of `src/app/globals.css` shows lines 84–123 contain `.custom-scrollbar` and scroll snap classes, but do **not** define `.no-scrollbar`:
```css
/* Custom Minimalist Scrollbar */
.custom-scrollbar::-webkit-scrollbar { ... }
```
To enable `no-scrollbar` across all browsers (Chrome, Safari, Firefox, Edge), `src/app/globals.css` must include:
```css
@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none; /* IE & Edge */
    scrollbar-width: none;    /* Firefox */
  }
}
```

---

## 3. Architectural Design & Specifications

### 3.1 Dedicated Filter Row Separated from Title
The header bar and category filters have different semantic roles:
- **Header Bar**: Displays section index (`05`), divider line, and section heading (`Prestasi & Penghargaan`). It terminates with a subtle bottom divider (`border-b border-slate-900/5 dark:border-white/10 pb-5`).
- **Dedicated Filter Row**: Positioned directly underneath the header bar as an independent block (`relative w-full`), allowing pills to stretch 100% of the container width without competing with the heading.

**Result**:
- Desktop: Filter pills have full horizontal breadth (1280px container) to display comfortably in 1 row (or wrap cleanly if expanded).
- Mobile: Header title remains compact (takes ~60px height instead of ~280px), immediately visible above the scroll track.

### 3.2 Mobile (< sm) Single-Row Horizontal Scroll Track with Fade Masks
On mobile devices (`< 640px`):
- Enforce single-row horizontal layout: `flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 sm:px-0`.
- Vertical padding (`py-1.5`) prevents clipping of `scale-105`, focus rings, or button shadows due to `overflow-x: auto` / `overflow-y: hidden`.
- Horizontal padding (`px-1 sm:px-0`) provides offset for edge scaling.
- **Fade Masks**:
  - Two pseudo-gradient overlays placed on the left and right edges:
    ```tsx
    {/* Left Gradient Fade Mask */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
    />
    {/* Right Gradient Fade Mask */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
    />
    ```
  - `pointer-events-none` prevents touch interception so users can swipe and tap through the mask.
  - `aria-hidden="true"` conceals cosmetic gradients from screen readers.
  - `sm:hidden` disables them on desktop where wrapping occurs.

### 3.3 Spacious Desktop Layout with Count Badges
On tablet and desktop (`sm:`):
- `sm:flex-wrap` allows pills to wrap naturally without scrolling.
- Button padding expands to `px-3.5 sm:px-4 py-1.5 sm:py-2` providing accessible 36px–40px click targets.
- **Count Badges**: Each pill displays category name and its count:
  ```tsx
  <button ...>
    <span>{cat.name}</span>
    <span
      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none transition-colors ${
        isSelected
          ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950 font-bold'
          : 'bg-slate-900/10 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-slate-900/15 dark:group-hover:bg-white/15'
      }`}
    >
      {cat.count}
    </span>
  </button>
  ```
- Contrast is carefully tuned:
  - Active: badge is semi-transparent inverted (`bg-white/20` / `bg-slate-950/20`), preserving high contrast against the solid pill background.
  - Inactive: badge is subtle pill chip (`bg-slate-900/10 dark:bg-white/10`) that brightens on hover (`group-hover`).

### 3.4 ActiveMode State Synchronization & Scroll Reset
Per `PROJECT.md` contract (line 73):
```tsx
useEffect(() => {
  setSelectedCategory('All');
  if (scrollTrackRef.current) {
    scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }
}, [activeMode]);
```
- Guarantees `selectedCategory` is never stranded on a pruned category when switching modes.
- Resets horizontal scroll position back to origin so the user sees the `'All'` pill first.

### 3.5 Dynamic Empty Category Pruning per ActiveMode
Algorithm:
```tsx
const categoriesWithCounts = useMemo(() => {
  const CANONICAL_CATEGORIES = [
    'Kompetisi & Penghargaan',
    'Program Teknis & Akademik',
    'Kontribusi Komunitas & Riset',
    'Milestone Projek Perangkat Lunak',
    'Kepenulisan & Publikasi Ilmiah'
  ];

  const counts: Record<string, number> = {
    All: modeAchievements.length
  };

  modeAchievements.forEach((item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  const activeList = ['All'];

  // Add canonical categories that have at least 1 achievement in this activeMode
  CANONICAL_CATEGORIES.forEach((cat) => {
    if ((counts[cat] || 0) > 0) {
      activeList.push(cat);
    }
  });

  // Guard against any category in dataset not in CANONICAL_CATEGORIES
  modeAchievements.forEach((item) => {
    if (!activeList.includes(item.category)) {
      activeList.push(item.category);
    }
  });

  return activeList.map((cat) => ({
    name: cat,
    count: counts[cat] || 0
  }));
}, [modeAchievements]);
```

**Output by Mode**:
- **Tech mode**:
  1. `All` (5)
  2. `Kompetisi & Penghargaan` (3)
  3. `Program Teknis & Akademik` (1)
  4. `Milestone Projek Perangkat Lunak` (1)
  *(Pruned: Kontribusi Komunitas & Riset, Kepenulisan & Publikasi Ilmiah)*
- **Medical mode**:
  1. `All` (3)
  2. `Kompetisi & Penghargaan` (1)
  3. `Kontribusi Komunitas & Riset` (1)
  4. `Milestone Projek Perangkat Lunak` (1)
  *(Pruned: Program Teknis & Akademik, Kepenulisan & Publikasi Ilmiah)*
- **Academic mode**:
  1. `All` (5)
  2. `Kompetisi & Penghargaan` (3)
  3. `Kontribusi Komunitas & Riset` (1)
  4. `Milestone Projek Perangkat Lunak` (1)
  *(Pruned: Program Teknis & Akademik, Kepenulisan & Publikasi Ilmiah)*

### 3.6 Auto-Scroll Active Pill into View on Tap
Using `e.currentTarget.scrollIntoView`:
```tsx
const handleSelectCategory = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
  setSelectedCategory(cat);
  e.currentTarget.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  });
};
```
- `inline: 'center'`: Centers the tapped pill in the horizontal track container.
- `block: 'nearest'`: Prevents vertical page scrolling jumps.
- Native, dependency-free, zero ref-tracking overhead.

---

## 4. Complete Drop-In Blueprint (`src/components/achievements.tsx`)

```tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  PortfolioModeConfig,
  ModeId,
  PORTFOLIO_ACHIEVEMENTS
} from '@/data/portfolio-data';
import { Trophy, CheckCircle } from 'lucide-react';

interface AchievementsProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
}

export default function Achievements({ activeMode }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // 1. Reset selectedCategory to 'All' and reset horizontal scroll when activeMode changes
  useEffect(() => {
    setSelectedCategory('All');
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeMode]);

  // 2. Filter achievements belonging to the active mode
  const modeAchievements = useMemo(() => {
    return PORTFOLIO_ACHIEVEMENTS.filter((item) =>
      item.modes.includes(activeMode)
    );
  }, [activeMode]);

  // 3. Compute active non-empty categories with count badges for the current activeMode
  const categoriesWithCounts = useMemo(() => {
    const CANONICAL_CATEGORIES = [
      'Kompetisi & Penghargaan',
      'Program Teknis & Akademik',
      'Kontribusi Komunitas & Riset',
      'Milestone Projek Perangkat Lunak',
      'Kepenulisan & Publikasi Ilmiah'
    ];

    const counts: Record<string, number> = {
      All: modeAchievements.length
    };

    modeAchievements.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    const activeList = ['All'];

    // Add canonical categories that have at least 1 achievement in this activeMode
    CANONICAL_CATEGORIES.forEach((cat) => {
      if ((counts[cat] || 0) > 0) {
        activeList.push(cat);
      }
    });

    // Guard against any category in dataset not present in CANONICAL_CATEGORIES
    modeAchievements.forEach((item) => {
      if (!activeList.includes(item.category)) {
        activeList.push(item.category);
      }
    });

    return activeList.map((cat) => ({
      name: cat,
      count: counts[cat] || 0
    }));
  }, [modeAchievements]);

  // 4. Filter achievements based on selectedCategory
  const filteredAchievements = useMemo(() => {
    return modeAchievements.filter((item) => {
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    });
  }, [modeAchievements, selectedCategory]);

  // 5. Auto-scroll active pill into view on tap
  const handleSelectCategory = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(cat);
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  return (
    <section
      id="achievements"
      className="relative w-full py-20 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12 text-slate-900 dark:text-white scroll-mt-16"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col space-y-8">
        {/* Dedicated Clean Header Bar (Separated from Filter Row) */}
        <div className="border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>05</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Rekam Jejak, Prestasi & Kompetisi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Prestasi & Penghargaan
            </h2>
          </div>
        </div>

        {/* Dedicated Filter Row with Mobile Horizontal Scroll & Desktop Spacious Wrap */}
        <div className="relative w-full">
          {/* Mobile Left & Right Fade Masks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
          />

          {/* Scroll Track: flex-nowrap on mobile (< sm), flex-wrap on desktop (sm:) */}
          <div
            ref={scrollTrackRef}
            role="group"
            aria-label="Filter kategori prestasi"
            className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 sm:px-0"
          >
            {categoriesWithCounts.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={(e) => handleSelectCategory(cat.name, e)}
                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950 font-bold'
                        : 'bg-slate-900/10 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-slate-900/15 dark:group-hover:bg-white/15'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Natural Cards Grid or Empty State */}
        {filteredAchievements.length === 0 ? (
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-12 text-center space-y-4 shadow-sm">
            <div className="text-sm font-normal text-slate-600 dark:text-slate-300">
              Tidak ada prestasi dalam kategori ini
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white/90 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{ach.category}</span>
                    </span>
                    <span className="font-mono text-[11px] opacity-75">{ach.year}</span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-950 dark:text-white leading-snug">
                    {ach.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-normal">
                    <span className="font-semibold text-slate-800 dark:text-white/90">{ach.organization}</span>
                    {ach.level && (
                      <>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {ach.level}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate text-[11px] font-normal">{ach.evidenceLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

---

## 5. Exact Unified Diff

### 5.1 Diff for `src/components/achievements.tsx`
```diff
--- a/src/components/achievements.tsx
+++ b/src/components/achievements.tsx
@@ -1,5 +1,5 @@
 'use client';
 
-import React, { useState, useMemo } from 'react';
+import React, { useState, useMemo, useEffect, useRef } from 'react';
 import {
   PortfolioModeConfig,
   ModeId,
@@ -15,25 +15,64 @@ interface AchievementsProps {
 
 export default function Achievements({ activeMode }: AchievementsProps) {
   const [selectedCategory, setSelectedCategory] = useState<string>('All');
+  const scrollTrackRef = useRef<HTMLDivElement>(null);
 
-  const categories = [
-    'All',
-    'Kompetisi & Penghargaan',
-    'Program Teknis & Akademik',
-    'Kontribusi Komunitas & Riset',
-    'Milestone Projek Perangkat Lunak',
-    'Kepenulisan & Publikasi Ilmiah'
-  ];
+  // 1. Reset selectedCategory to 'All' and reset horizontal scroll when activeMode changes
+  useEffect(() => {
+    setSelectedCategory('All');
+    if (scrollTrackRef.current) {
+      scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
+    }
+  }, [activeMode]);
 
-  const filteredAchievements = useMemo(() => {
+  // 2. Filter achievements belonging to the active mode
+  const modeAchievements = useMemo(() => {
     return PORTFOLIO_ACHIEVEMENTS.filter((item) =>
       item.modes.includes(activeMode)
-    ).filter((item) => {
+    );
+  }, [activeMode]);
+
+  // 3. Compute active non-empty categories with count badges for the current activeMode
+  const categoriesWithCounts = useMemo(() => {
+    const CANONICAL_CATEGORIES = [
+      'Kompetisi & Penghargaan',
+      'Program Teknis & Akademik',
+      'Kontribusi Komunitas & Riset',
+      'Milestone Projek Perangkat Lunak',
+      'Kepenulisan & Publikasi Ilmiah'
+    ];
+
+    const counts: Record<string, number> = {
+      All: modeAchievements.length
+    };
+
+    modeAchievements.forEach((item) => {
+      counts[item.category] = (counts[item.category] || 0) + 1;
+    });
+
+    const activeList = ['All'];
+
+    // Add canonical categories that have at least 1 achievement in this activeMode
+    CANONICAL_CATEGORIES.forEach((cat) => {
+      if ((counts[cat] || 0) > 0) {
+        activeList.push(cat);
+      }
+    });
+
+    // Guard against any category in dataset not present in CANONICAL_CATEGORIES
+    modeAchievements.forEach((item) => {
+      if (!activeList.includes(item.category)) {
+        activeList.push(item.category);
+      }
+    });
+
+    return activeList.map((cat) => ({
+      name: cat,
+      count: counts[cat] || 0
+    }));
+  }, [modeAchievements]);
+
+  // 4. Filter achievements based on selectedCategory
+  const filteredAchievements = useMemo(() => {
+    return modeAchievements.filter((item) => {
       if (selectedCategory === 'All') return true;
       return item.category === selectedCategory;
     });
-  }, [activeMode, selectedCategory]);
+  }, [modeAchievements, selectedCategory]);
+
+  // 5. Auto-scroll active pill into view on tap
+  const handleSelectCategory = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
+    setSelectedCategory(cat);
+    e.currentTarget.scrollIntoView({
+      behavior: 'smooth',
+      inline: 'center',
+      block: 'nearest'
+    });
+  };
 
   return (
     <section
@@ -42,35 +81,64 @@ export default function Achievements({ activeMode }: AchievementsProps) {
     >
       <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col space-y-8">
-        {/* Header Bar */}
-        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
+        {/* Dedicated Clean Header Bar (Separated from Filter Row) */}
+        <div className="border-b border-slate-900/5 dark:border-white/10 pb-5">
           <div className="space-y-1.5">
             <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
               <span>05</span>
               <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
               <span>Rekam Jejak, Prestasi & Kompetisi</span>
             </div>
             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
               Prestasi & Penghargaan
             </h2>
           </div>
+        </div>
 
-          {/* Category Filter Pills */}
-          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter prestasi">
-            {categories.map((cat) => (
-              <button
-                key={cat}
-                type="button"
-                onClick={() => setSelectedCategory(cat)}
-                className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap ${
-                  selectedCategory === cat
-                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
-                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
-                }`}
-              >
-                {cat}
-              </button>
-            ))}
-          </div>
+        {/* Dedicated Filter Row with Mobile Horizontal Scroll & Desktop Spacious Wrap */}
+        <div className="relative w-full">
+          {/* Mobile Left & Right Fade Masks */}
+          <div
+            aria-hidden="true"
+            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
+          />
+          <div
+            aria-hidden="true"
+            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 sm:hidden"
+          />
+
+          {/* Scroll Track: flex-nowrap on mobile (< sm), flex-wrap on desktop (sm:) */}
+          <div
+            ref={scrollTrackRef}
+            role="group"
+            aria-label="Filter kategori prestasi"
+            className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 sm:px-0"
+          >
+            {categoriesWithCounts.map((cat) => {
+              const isSelected = selectedCategory === cat.name;
+              return (
+                <button
+                  key={cat.name}
+                  type="button"
+                  aria-pressed={isSelected}
+                  onClick={(e) => handleSelectCategory(cat.name, e)}
+                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
+                    isSelected
+                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
+                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
+                  }`}
+                >
+                  <span>{cat.name}</span>
+                  <span
+                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none transition-colors ${
+                      isSelected
+                        ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950 font-bold'
+                        : 'bg-slate-900/10 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-slate-900/15 dark:group-hover:bg-white/15'
+                    }`}
+                  >
+                    {cat.count}
+                  </span>
+                </button>
+              );
+            })}
+          </div>
         </div>
 
-        {/* Natural Cards Grid */}
-        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
+        {/* Natural Cards Grid or Empty State */}
+        {filteredAchievements.length === 0 ? (
+          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-12 text-center space-y-4 shadow-sm">
+            <div className="text-sm font-normal text-slate-600 dark:text-slate-300">
+              Tidak ada prestasi dalam kategori ini
+            </div>
+            <button
+              type="button"
+              onClick={() => setSelectedCategory('All')}
+              className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-transform"
+            >
+              Reset Filter
+            </button>
+          </div>
+        ) : (
+          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
             {filteredAchievements.map((ach) => (
```

### 5.2 Diff for `src/app/globals.css`
```diff
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@ -81,6 +81,17 @@
   body {
     @apply bg-background text-foreground;
   }
 }
+
+/* Scrollbar Hiding Utility for Mobile Gallery Tracks */
+@layer utilities {
+  .no-scrollbar::-webkit-scrollbar {
+    display: none;
+  }
+  .no-scrollbar {
+    -ms-overflow-style: none; /* IE and Edge */
+    scrollbar-width: none;    /* Firefox */
+  }
+}
 
 /* Custom Minimalist Scrollbar */
```

---

## 6. Edge Cases & Boundary Handling

1. **Rapid Mode Switching**:
   - When switching modes rapidly (`tech -> medical -> academic -> tech`), `useEffect` synchronously queues `setSelectedCategory('All')` and scrolls track to origin. No stale category survives.
2. **Single-Item Categories**:
   - Categories like `"Milestone Projek Perangkat Lunak"` have 1 item. Filtering to it immediately displays the single card without layout collapse or grid tearing.
3. **Empty Filter State Guard**:
   - If an unexpected filter state occurs, the fallback banner ("Tidak ada prestasi dalam kategori ini") with a "Reset Filter" button prevents user abandonment.
4. **Touch Interactions & Overscroll**:
   - Native momentum scrolling on iOS and Android works smoothly with `overflow-x-auto`. The gradient masks inform the user of scrollable overflow without obstructing gestures (`pointer-events-none`).
5. **Screen Reader Accessibility**:
   - `role="group"` with `aria-label="Filter kategori prestasi"`.
   - `aria-pressed={isSelected}` correctly announces toggled state.
   - Masks have `aria-hidden="true"`.

---

## 7. Verification Method

1. **TypeScript Compilation & Build**:
   ```bash
   npm run build
   ```
   Must pass with zero TypeScript diagnostics or Next.js build errors.
2. **ESLint Linting**:
   ```bash
   npm run lint
   ```
   Must pass with zero linting warnings or errors.
3. **Functional Verification in Browser**:
   - Open mobile viewport (`width < 640px`):
     - Check that category pills form a single horizontal line that scrolls left/right.
     - Check that left and right fade masks appear.
     - Tap a partially hidden pill on the right: verify it automatically scrolls into center view.
   - Switch active mode from Tech to Medical:
     - Verify active pill automatically resets to `'All'`.
     - Verify track scroll resets to left origin.
     - Verify empty categories (`Program Teknis & Akademik`, `Kepenulisan & Publikasi Ilmiah`) are pruned.
   - Open desktop viewport (`width >= 640px`):
     - Verify pills wrap cleanly across a dedicated full-width row with count badges.
     - Verify fade masks are hidden.
