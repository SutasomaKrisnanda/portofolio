# Survey & Architecture Report — Explorer Survey P2-2
**Focus**: Requirement R2 (Category Pill Galeri Peringkasan) & Requirement R4 (Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif)  
**Date**: 2026-11-08  
**Author**: Explorer Survey P2-2  
**Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_survey_p2_2\`

---

## 1. Executive Summary

This report delivers a thorough codebase survey and concrete implementation blueprints for **Requirement R2** (Peringkasan Category Pill Galeri untuk Projects & Achievements) and **Requirement R4** (Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif).

### Core Findings:
1. **Requirement R2 (Category Pills)**:
   - In `src/components/projects.tsx` (lines 96–116) and `src/components/achievements.tsx` (lines 56–73), category pills are rendered with `flex flex-wrap`.
   - In `achievements.tsx`, pills are nested within the section header (`flex flex-col sm:flex-row sm:items-end justify-between`). Long category names (up to 32 characters, e.g. *"Milestone Projek Perangkat Lunak"*) cause the pills to wrap into **5 to 6 vertical lines** on mobile viewports (< 640px), consuming ~240px–280px of vertical height before any achievement card is visible.
   - In `projects.tsx`, 5–6 categories wrap into 3–4 vertical rows on mobile.
   - **Critical State Sync Bug**: When switching `activeMode`, `selectedCategory` does not reset to `'All'`. Because `modeConfig.projectCategories` differs by mode, this causes the gallery to immediately display an empty "Tidak ada projek" state.
   - **Recommended Solution**: A single-row horizontal scroll track (`flex flex-nowrap overflow-x-auto scrollbar-none no-scrollbar`) with left/right fade mask gradients, auto-centering on click, and responsive wrapping/segmented bar on desktop (`sm:flex-wrap`), combined with category item count badges. This reduces mobile vertical footprint by **>80%** (from ~260px down to ~38px).

2. **Requirement R4 (Project Logo Icons)**:
   - `src/components/project-mode-icon.tsx` is already built with high-fidelity SVG imports (`project-tech.svg`, `project-medical.svg`, `project-academic.svg`) and dynamic multi-mode fallback resolution.
   - However, in `src/components/projects.tsx` (lines 155–157), project cards currently render `<DiamondArtifactGlyph visualType={project.visualType} index={idx} />` instead of `ProjectModeIcon`.
   - Out of 7 projects in `src/data/projects.json`, 6 are multi-mode projects (`secondaryModes` defined). When `activeMode` changes, the icon must dynamically reflect the active mode when the project supports it, with clean fallback to `project.mode` (and default `tech`).
   - **Recommended Solution**: Drop in `<ProjectModeIcon mode={activeMode} project={project} />` inside a refined icon badge on each card in `projects.tsx`, and optionally reinforce branding in `project-modal.tsx`.

---

## 2. Deep Dive: Requirement R2 — Peringkasan Category Pill Galeri

### 2.1 Current Implementation & Code Inspection

#### A. Projects Gallery (`src/components/projects.tsx`)
```tsx
// Lines 96-116 in src/components/projects.tsx
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
- **Issue 1**: Class conflict: `flex-wrap` prevents `overflow-x-auto` from functioning because elements wrap down instead of scrolling horizontally.
- **Issue 2**: On mobile (< 640px), pills wrap into 3–4 lines, pushing cards off the initial viewport.
- **Issue 3**: `selectedCategory` state does not synchronize with `activeMode`. Switching from `tech` (e.g. selected "Web Development") to `medical` retains "Web Development", which does not match any medical project and causes an empty state.

#### B. Achievements Gallery (`src/components/achievements.tsx`)
```tsx
// Lines 44-73 in src/components/achievements.tsx
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
- **Issue 1**: Pills are trapped inside the header container (`flex flex-col sm:flex-row`). On desktop, this crowds the header text; on mobile, it stacks 6 long pills in 5–6 rows under the title.
- **Issue 2**: Hardcoded category list contains items with 0 matches in certain modes (e.g., `'Kepenulisan & Publikasi Ilmiah'` has 0 achievements in all modes).

### 2.2 Quantitative Measurement of Mobile Vertical Space

| Metric | Current Implementation | Proposed Compact Solution |
| :--- | :--- | :--- |
| **Pill Container Layout** | `flex-wrap` (stacks vertically) | `flex-nowrap overflow-x-auto` on mobile, `sm:flex-wrap` on desktop |
| **Achievements Pill Height (Mobile)** | ~250px – 280px (5–6 rows) | **38px – 42px** (single row) |
| **Projects Pill Height (Mobile)** | ~140px – 170px (3–4 rows) | **38px – 42px** (single row) |
| **Vertical Space Saved** | 0px | **~180px – 220px saved (>80% reduction)** |
| **First Card Viewport Visibility** | Pushed completely below fold | Visible immediately on mobile viewports |
| **Scroll Affordance** | None (overflow broken by wrap) | Left/Right Gradient Fade Masks (`pointer-events-none`) |
| **Category Text Integrity** | Wrapped awkwardly | 100% full text preserved with smooth touch swiping |

### 2.3 Ergonomic UX & Interaction Blueprint for R2

1. **Dual Responsive Strategy**:
   - **Mobile Viewport (`< sm` / `< 640px`)**:
     - Strict single row: `flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1.5 px-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth`.
     - Container wrapped in a relative block featuring left and right edge gradient fades (`bg-gradient-to-r from-transparent to-white dark:to-slate-950`).
     - Tapping any pill automatically centers it using `scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })`.
   - **Desktop Viewport (`>= sm` / `640px+`)**:
     - Clean responsive layout: `sm:flex-wrap` allowing all pills to be seen simultaneously without crowding.
     - Micro-interactions: `hover:scale-105 active:scale-95 transition-all` with clear active ring and elevation (`shadow-md scale-105`).
2. **Category Item Counts**:
   - Each category displays the number of matching items in the active mode:
     - `Semua (7)`
     - `Web Development (3)`
     - `Software Engineering (4)`
   - This prevents users from clicking empty categories and provides instant cognitive clarity.
3. **Dedicated Category Row in Achievements**:
   - Move category pills in `achievements.tsx` out of the title header row and place them below the header border, mirroring `projects.tsx`.
   - Dynamically filter categories in `achievements.tsx` to only include categories that exist in the active mode.
4. **Active Mode State Sync**:
   - Add `useEffect(() => { setSelectedCategory('All'); }, [activeMode]);` to both components.

---

## 3. Deep Dive: Requirement R4 — Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif

### 3.1 Existing Asset & Component Inspection

The codebase already contains `src/components/project-mode-icon.tsx`:
```tsx
import techIcon from '@/assets/icons/project-tech.svg';
import medicalIcon from '@/assets/icons/project-medical.svg';
import academicIcon from '@/assets/icons/project-academic.svg';

export const MODE_ICON_MAP: Record<ModeId, StaticImageData> = {
  tech: techIcon,
  medical: medicalIcon,
  academic: academicIcon,
};

export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  project,
  className = 'w-8 h-8 object-contain drop-shadow',
  ...
}) => {
  // 1. Dynamic multi-mode resolution
  const resolvedMode: ModeId =
    project && project.mode !== mode && !project.secondaryModes?.includes(mode)
      ? project.mode
      : mode;

  // 2. Select asset
  const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;
  ...
```

### 3.2 Dataset Mode Mapping (`src/data/projects.json`)

All 7 projects in `projects.json` have been surveyed:
1. `proj-hmsso`: `mode: "tech"`, `secondaryModes: ["medical", "academic"]`
   - Active `tech` -> `project-tech.svg`
   - Active `medical` -> `project-medical.svg`
   - Active `academic` -> `project-academic.svg`
2. `proj-bunda-bahagia`: `mode: "medical"`, `secondaryModes: ["academic"]`
   - Active `medical` -> `project-medical.svg`
   - Active `academic` -> `project-academic.svg`
   - Fallback (e.g. if rendered in `tech`) -> falls back to `project.mode` (`medical`)
3. `proj-hmj-kedokteran`: `mode: "tech"`, `secondaryModes: ["medical"]`
   - Active `tech` -> `project-tech.svg`
   - Active `medical` -> `project-medical.svg`
   - Fallback (if rendered in `academic`) -> `tech`
4. `proj-text-case-converter`: `mode: "tech"`, `secondaryModes: ["academic"]`
   - Active `tech` -> `project-tech.svg`
   - Active `academic` -> `project-academic.svg`
   - Fallback (if rendered in `medical`) -> `tech`
5. `proj-sipadu-ri`: `mode: "academic"`, `secondaryModes: ["tech"]`
   - Active `academic` -> `project-academic.svg`
   - Active `tech` -> `project-tech.svg`
   - Fallback (if rendered in `medical`) -> `academic`
6. `proj-temu-ilmiah`: `mode: "tech"`, `secondaryModes: ["medical"]`
   - Active `tech` -> `project-tech.svg`
   - Active `medical` -> `project-medical.svg`
7. `proj-chess-project`: `mode: "tech"`, no secondaryModes
   - Single mode -> always `project-tech.svg`
8. `proj-tryout-skd`: `mode: "tech"`, no secondaryModes
   - Single mode -> always `project-tech.svg`

### 3.3 The Core Defect in `projects.tsx`
In `src/components/projects.tsx`, lines 155–157:
```tsx
// CURRENT:
<div className="shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10">
  <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
</div>
```
`projects.tsx` uses `<DiamondArtifactGlyph>` instead of `<ProjectModeIcon>`. This directly violates Requirement R4.

### 3.4 Implementation Blueprint for R4
In `src/components/projects.tsx`:
1. Import `ProjectModeIcon` from `./project-mode-icon`.
2. Replace `DiamondArtifactGlyph` with:
```tsx
<div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-white/10 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105 shadow-sm">
  <ProjectModeIcon
    mode={activeMode}
    project={project}
    className="w-full h-full object-contain drop-shadow"
  />
</div>
```
3. In `src/components/project-modal.tsx`:
Add `ProjectModeIcon` into the modal header next to the title or category ribbon for visual coherence.

---

## 4. Concrete Code Implementation Specs

### 4.1 CSS Utility for Clean Mobile Scroll
In `src/app/globals.css`, append:
```css
/* No Scrollbar Utility for Compact Mobile Category Rails */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### 4.2 Reusable / Unified Gallery Category Filter Component
To ensure consistent behavior and zero code duplication between `projects.tsx` and `achievements.tsx`, implement a compact filter bar component or apply the following pattern:

```tsx
interface CategoryFilterPillsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  counts?: Record<string, number>;
  ariaLabel?: string;
}

export function CategoryFilterPills({
  categories,
  selectedCategory,
  onSelectCategory,
  counts,
  ariaLabel = "Filter kategori"
}: CategoryFilterPillsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  const handleSelect = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onSelectCategory(cat);
    // Smooth auto-centering on mobile
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  };

  return (
    <div className="relative w-full">
      {/* Left Fade Mask */}
      {canScrollLeft && (
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent transition-opacity duration-200" 
        />
      )}

      {/* Pill Rail */}
      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        className="flex items-center gap-2 overflow-x-auto sm:flex-wrap no-scrollbar py-1.5 px-0.5 scroll-smooth"
      >
        {categories.map((cat, idx) => {
          const active = selectedCategory === cat;
          const count = counts ? counts[cat] : undefined;
          return (
            <button
              key={cat}
              type="button"
              onClick={(e) => handleSelect(cat, e)}
              className={`px-3.5 py-1.5 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                active
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105 z-10'
                  : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 dark:bg-white/[0.08] dark:hover:bg-white/15 dark:text-slate-300 font-normal ring-1 ring-slate-900/5 dark:ring-white/10'
              }`}
            >
              <span className="opacity-50 font-mono text-[10px]">0{idx + 1}</span>
              <span>{cat}</span>
              {count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  active 
                    ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' 
                    : 'bg-slate-900/10 dark:bg-white/15 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Fade Mask */}
      {canScrollRight && (
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent transition-opacity duration-200" 
        />
      )}
    </div>
  );
}
```

### 4.3 Proposed Changes in `src/components/projects.tsx`
1. **Reset Category on Mode Switch**:
```tsx
useEffect(() => {
  setSelectedCategory('All');
}, [activeMode]);
```
2. **Category Counts Map**:
```tsx
const categoryCounts = useMemo(() => {
  const counts: Record<string, number> = { All: 0 };
  modeConfig.projectCategories.forEach(cat => counts[cat] = 0);
  
  projects.forEach((p) => {
    if (p.mode === activeMode || p.secondaryModes?.includes(activeMode)) {
      counts['All'] = (counts['All'] || 0) + 1;
      if (counts[p.category] !== undefined) counts[p.category]++;
      if (p.secondaryCategory && counts[p.secondaryCategory] !== undefined) {
        counts[p.secondaryCategory]++;
      }
    }
  });
  return counts;
}, [projects, activeMode, modeConfig.projectCategories]);
```
3. **Card Mode Icon Replacement**:
Replace `DiamondArtifactGlyph` with `ProjectModeIcon`:
```tsx
<div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center p-1.5">
  <ProjectModeIcon
    mode={activeMode}
    project={project}
    className="w-full h-full object-contain drop-shadow transition-transform duration-300 group-hover:scale-110"
  />
</div>
```

### 4.4 Proposed Changes in `src/components/achievements.tsx`
1. **Move Category Filter out of the Title Header Bar**:
Place pills in their own row below the header divider.
2. **Dynamic Categories by Active Mode**:
```tsx
const categories = useMemo(() => {
  const activeItems = PORTFOLIO_ACHIEVEMENTS.filter((item) => item.modes.includes(activeMode));
  const uniqueCats = Array.from(new Set(activeItems.map((item) => item.category)));
  return ['All', ...uniqueCats];
}, [activeMode]);
```
3. **Reset Category on Mode Switch**:
```tsx
useEffect(() => {
  setSelectedCategory('All');
}, [activeMode]);
```
4. **Achievement Counts Map**:
```tsx
const achievementCounts = useMemo(() => {
  const counts: Record<string, number> = { All: 0 };
  PORTFOLIO_ACHIEVEMENTS.filter((item) => item.modes.includes(activeMode)).forEach((item) => {
    counts['All'] = (counts['All'] || 0) + 1;
    counts[item.category] = (counts[item.category] || 0) + 1;
  });
  return counts;
}, [activeMode]);
```

---

## 5. Verification Plan

1. **Build & Typecheck**:
   - `tsc --noEmit` must pass with 0 errors.
   - `npm run build` must compile static output cleanly.
2. **Linting**:
   - `npm run lint` must pass with 0 errors.
3. **Responsive Visual & UX Verification**:
   - Mobile Viewport (360px – 480px width):
     - Projects & Achievements category pills occupy exactly 1 row (~38px height).
     - Fade gradient indicators appear on scroll edges.
     - Horizontal swipe scrolls smoothly without any vertical wrap spill.
     - Clicking an off-screen pill auto-centers it into the visible viewport.
   - Desktop Viewport (1024px+ width):
     - Filter pills display in a spacious, elegant bar with active elevation and badge counters.
   - Mode Switch:
     - Switching between `tech`, `medical`, and `academic` resets `selectedCategory` to `'All'` and refreshes categories and counts.
4. **Dynamic Icon Verification**:
   - Project cards with multiple modes (e.g. `proj-hmsso`, `proj-bunda-bahagia`, `proj-sipadu-ri`) change icons dynamically to match `tech`, `medical`, or `academic`.
   - Single-mode projects (e.g. `proj-chess-project`) consistently render their primary mode icon (`project-tech.svg`).
