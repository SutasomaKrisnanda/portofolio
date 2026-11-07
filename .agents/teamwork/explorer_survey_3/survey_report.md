# Technical Survey Report — Project Navigation, Modal, Animation & Tooltips
**Agent**: Teamwork Explorer 3 (Survey & Feasibility Analysis)  
**Date**: 2026-11-05  
**Scope**: Requirement R4 (Project Navigation from JSON), Requirement R5 (Highlight Modal Bugs & Integration), Requirement R6 (Slide Animation, Interactivity & Tooltips), and Project Build/Lint Diagnostics.

---

## 1. Executive Summary
- **Requirement R4**: The project dataset resides in `src/data/projects.json` (8 projects) typed via `src/data/portfolio-data.ts`. The hero section currently neglects the `featured: boolean` attribute and hardcodes both slide slicing (`slice(0, 4)` and `slice(0, 3)`) and navigation indicators (`[3, 2, 1, 0]` rendering static numbers `04, 03, 02, 01`). When filtered dynamically by `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`, each mode (Tech, Medical, Academic) yields exactly 3 featured highlight projects. Replacing the static 4 buttons with dynamic navigation indicators/tabs matching the filtered count is completely feasible.
- **Requirement R5**: The highlight modal (`src/components/project-modal.tsx`) suffers from 4 distinct layout bugs: (1) title jumping/gap due to an uncoordinated container `pt-6/pt-8` with a negative-margin sticky header, (2) double scrollbars caused by nested `overflow-y-auto` on both backdrop and modal container, (3) scrollbar leakage over asymmetric rounded corners (`rounded-tr-[44px]`), and (4) mobile text crowding with cramped headers and lists. Furthermore, opening the modal from hero cards currently requires an obscure `onDoubleClick`. Restructuring the modal into a 3-tier Flexbox layout (fixed header, scrollable body, fixed footer) and binding single-click on active cards/CTA buttons cleanly solves all issues.
- **Requirement R6**: `tailwindcss-animate` is already installed and loaded in Tailwind configuration. Block transitions can be achieved smoothly using React keys (`key={currentHeroProject?.id}`) and Tailwind animation utilities without bloated external dependencies. Interactive buttons across `hero.tsx` can be fully wrapped using the existing `@radix-ui/react-tooltip` primitive in `src/components/ui/tooltip.tsx`, satisfying both mouse hover and keyboard `focus-visible` requirements.
- **Build & Lint Diagnostics**: TypeScript (`tsc --noEmit`) passes with zero errors (Exit 0). `next lint` fails due to ESLint 9 circular structure serialization on legacy `.eslintrc.json`. Windows builds need `node -r ./patch-fs.js` to circumvent WSL filesystem `readlink` EISDIR issues.

---

## 2. Requirement R4: Perombakan Navigasi Highlight Project dari Dataset JSON

### 2.1. Dataset Location, Schema & Fields
- **Primary Data Source**: `src/data/projects.json` (428 lines, 8 project objects).
- **TypeScript Interface**: `src/data/portfolio-data.ts` (lines 17–57):
  ```typescript
  export interface Project {
    id: string;
    slug: string;
    title: string;
    mode: ModeId; // 'tech' | 'medical' | 'academic'
    secondaryModes?: ModeId[];
    category: string;
    secondaryCategory?: string;
    summary: string;
    year: string;
    status: 'Verified Work' | 'Active Development' | 'Completed';
    role: string;
    organization: string;
    visualType: string;
    technologies: string[];
    featured: boolean; // Flag penanda highlight/featured
    caseStudy: {
      overview: string;
      backgroundAndProblem: string;
      objectives: string[];
      roleAndContributions: string[];
      processAndMethodology: string[];
      finalOutput: string;
      resultsAndImpact: string;
      lessonsLearned: string;
      linksAndReferences: CaseStudyLink[];
    };
  }
  ```

### 2.2. Dataset Audit: Modes & Featured Flags
Audit of all 8 items in `src/data/projects.json`:
| Project ID | Title | Primary Mode | Secondary Modes | `featured` | Matches Tech | Matches Medical | Matches Academic |
|---|---|---|---|:---:|:---:|:---:|:---:|
| `proj-hmsso` | HMSSO — Hermestha Management System | `tech` | `medical`, `academic` | **`true`** | **YES** | **YES** | **YES** |
| `proj-bunda-bahagia` | Bunda Bahagia — MBSR & Gamelan Rindik | `medical` | `academic` | **`true`** | NO | **YES** | **YES** |
| `proj-hmj-kedokteran` | Website Portal Resmi HMJ Kedokteran | `tech` | `medical` | **`true`** | **YES** | **YES** | NO |
| `proj-text-case-converter` | Text Case Converter App (PUEBI/APA) | `tech` | `academic` | `false` | NO | NO | NO |
| `proj-sipadu-ri` | SIPADU-RI — Pengelolaan Sampah | `academic` | `tech` | **`true`** | **YES** | NO | **YES** |
| `proj-temu-ilmiah` | Temu Ilmiah Kolaborasi FK Undiksha | `tech` | `medical` | `false` | NO | NO | NO |
| `proj-chess-project` | ChessProject — C++ Engine Stockfish | `tech` | — | `false` | NO | NO | NO |
| `proj-tryout-skd` | Aplikasi Try Out SKD Kedinasan | `tech` | — | `false` | NO | NO | NO |

**Featured Count per Mode**:
- **Tech Mode**: 3 featured projects (`proj-hmsso`, `proj-hmj-kedokteran`, `proj-sipadu-ri`).
- **Medical Mode**: 3 featured projects (`proj-bunda-bahagia`, `proj-hmsso`, `proj-hmj-kedokteran`).
- **Academic Mode**: 3 featured projects (`proj-sipadu-ri`, `proj-hmsso`, `proj-bunda-bahagia`).

### 2.3. Current Static Flaws in `src/components/hero.tsx`
1. **Flawed Filter Logic (Lines 32–37)**:
   ```typescript
   const heroSlides = useMemo(() => {
     const list = projects.filter(
       (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
     );
     return list.slice(0, 4);
   }, [projects, activeMode]);
   ```
   *Flaw*: Does **not** check `p.featured`. For `tech`, it picked unfeatured projects like `proj-text-case-converter` simply because it sliced at index 4.
2. **Hardcoded Preview Cards (Line 184)**:
   ```typescript
   {heroSlides.slice(0, 3).map((slideProj, idx) => { ... })}
   ```
   *Flaw*: Hardcoded to 3 cards regardless of how many slides actually exist.
3. **Hardcoded Static '1, 2, 3, 4' Buttons (Lines 222–250)**:
   ```typescript
   {[3, 2, 1, 0].map((slideIdx, posIdx) => {
     const numLabel = `0${slideIdx + 1}`;
     ...
   })}
   ```
   *Flaw*: Always renders 4 numbers in reverse order (`04`, `03`, `02`, `01`). If a mode has 3 items, clicking `04` (index 3) causes `heroSlides[3 % 3]` fallback or index out-of-bounds mismatch.
4. **Active State Desynchronization**:
   When switching `activeMode` in the header, `activeSlideIndex` is not reset to 0, which risks selecting a non-existent index or desynchronizing visual indicator state.

### 2.4. Proposed Dynamic Navigation Architecture
1. **Dynamic Filter Hook**:
   ```typescript
   const featuredHeroProjects = useMemo(() => {
     return projects.filter(
       (p) => p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
     );
   }, [projects, activeMode]);
   ```
2. **Index Reset on Mode Switch**:
   ```typescript
   useEffect(() => {
     setActiveSlideIndex(0);
   }, [activeMode]);
   ```
3. **Dynamic Controls Generator**:
   Generate navigation items directly from `featuredHeroProjects`:
   - Replace the static `[3, 2, 1, 0]` with a dynamic map over `featuredHeroProjects` (e.g. `featuredHeroProjects.map((proj, idx) => ...)`).
   - Render dynamic sequence labels (`01`, `02`, `03`... up to `N`), active slide indicators, and informative title/category badges.
   - Synchronize right-side diamond preview cards to dynamically match `featuredHeroProjects.length`.

---

## 3. Requirement R5: Perbaikan dan Integrasi Modal Highlight Project

### 3.1. Modal Component Location & Integration Flow
- **Component File**: `src/components/project-modal.tsx` (240 lines).
- **Page Container**: `src/app/page.tsx` (lines 35, 100–114, 335–342).
  - State: `activeProjectSlug: string | null`.
  - Looked up via `PORTFOLIO_PROJECTS.find(p => p.slug === activeProjectSlug)`.
  - Passed to `<ProjectModal project={activeProjectDetail} modeConfig={currentModeConfig} onClose={...} />`.

### 3.2. Detailed Layout Bug Analysis in `src/components/project-modal.tsx`
1. **Bug 1: Title Positioning & Sticky Header Gap**:
   - In `project-modal.tsx`, the parent container has `p-6 sm:px-10 sm:py-8` (which includes `pt-6 sm:pt-8`).
   - The sticky header has `-mx-6 sm:-mx-10` but **no** negative top margin (`-mt-6 sm:-mt-8`).
   - *Result*: At scroll position 0, the header sits 24px/32px below the top rim. Upon scrolling down, `sticky top-0` snaps to the absolute top of the scroll viewport, causing an abrupt jump and revealing an awkward translucent slit above the header where body text scrolls underneath.
2. **Bug 2: Double Scrollbar Leakage**:
   - The overlay wrapper (Line 57) specifies `overflow-y-auto`.
   - The modal card (Line 63) also specifies `overflow-y-auto`.
   - *Result*: Nested scroll containers create double vertical scrollbars on Windows/Chromium/Firefox desktop viewports, causing scroll fighting and mousewheel trapping.
3. **Bug 3: Scrollbar Boundary Leakage over Asymmetric Rounded Corners**:
   - The modal container has `rounded-tr-[44px] rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl`.
   - When the scroll container itself has asymmetric rounded corners and `overflow-y-auto`, the browser's scrollbar track renders along the right edge and clips through the `44px` top-right rounded corner, appearing detached outside the border stroke.
4. **Bug 4: Mobile & Tablet Responsiveness Constraints**:
   - Modal title is sized `text-2xl sm:text-3xl`. When long titles (e.g., *“HMSSO — Hermestha Management & Scientific System Online”*) wrap on mobile devices (< 640px), the title pushes the close button or dominates the visible screen height.
   - The metadata ribbon uses `grid grid-cols-1 sm:grid-cols-3` with bulky padding (`p-4`), consuming excessive vertical real estate on small screens.
   - Case study lists use `list-inside`, causing multiline list items to wrap directly beneath the bullet points rather than maintaining a clean indented hanging margin (`list-outside ml-4`).
5. **Bug 5: Text Overlapping on Small Screens**:
   - Long links, emails, and technical strings lack `break-words` or `break-all`, threatening horizontal overflow on narrow mobile screens (320px–375px).

### 3.3. Refactored Modal Structural Architecture
A clean Flexbox container completely resolves all 5 bugs:
```tsx
<div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 dark:bg-black/85 backdrop-blur-xl overflow-hidden animate-in fade-in duration-200">
  <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl sm:rounded-[32px] border border-slate-900/15 dark:border-white/25 shadow-2xl overflow-hidden" style={{ background: modalGradient }}>
    
    {/* 1. Fixed Header (Non-scrolling, flex-shrink-0) */}
    <div className="flex-shrink-0 px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-900/10 dark:border-white/15 bg-white/70 dark:bg-black/40 backdrop-blur-md flex items-center justify-between gap-4 z-10">
      <div className="min-w-0 space-y-1">
        <div className="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-500 dark:text-white/70 font-semibold truncate">
          {project.category} • {project.year} • {project.organization}
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-950 dark:text-white tracking-wide truncate">
          {project.title}
        </h2>
      </div>
      <button onClick={onClose} aria-label="Tutup detail studi kasus" className="p-2 sm:p-2.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors shrink-0">
        <CloseCrossGlyph className="w-5 h-5" />
      </button>
    </div>

    {/* 2. Scrollable Body (Contained custom scrollbar, flex-1) */}
    <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5 sm:py-6 space-y-6 custom-scrollbar text-slate-800 dark:text-white/90">
      {/* Metadata Ribbon & 9-point Case Study Sections with list-outside pl-4 */}
    </div>

    {/* 3. Fixed Footer (Non-scrolling, flex-shrink-0) */}
    <div className="flex-shrink-0 px-6 sm:px-8 py-3.5 sm:py-4 border-t border-slate-900/10 dark:border-white/15 bg-white/50 dark:bg-black/30 backdrop-blur-md flex items-center justify-between gap-3 z-10">
      <button onClick={onClose} className="px-5 py-2 rounded-full text-xs ...">← Kembali</button>
      {onDiscussProject && <button onClick={() => onDiscussProject(project)} className="px-5 py-2 rounded-full text-xs font-semibold ...">Diskusikan Projek Ini →</button>}
    </div>
  </div>
</div>
```
**Benefits**:
- Zero title jumping: Header is anchored at the top of the modal frame.
- Zero scrollbar boundary leakage: The scrollbar is confined within the rectangular inner body between header and footer.
- Zero double scrollbars: Outer overlay has `overflow-hidden`.
- Always-visible Close button and Action CTA without needing to scroll 600px of text.

### 3.4. Seamless Modal Integration in `Hero`
In `src/components/hero.tsx`:
- **Current Behavior**:
  - Diamond card `onClick={() => setActiveSlideIndex(idx)}` (selection only).
  - Diamond card `onDoubleClick={() => onOpenProject(slideProj)}` (hidden, non-discoverable, non-functional on mobile).
  - Primary CTA button opens project, but does not clearly indicate "Lihat Detail" for the active slide.
- **Improved Integration**:
  1. **Single-Click Card Behavior**: If a diamond card is already active (`isCardActive`), clicking it immediately triggers `onOpenProject(slideProj)`. If inactive, the first click selects the slide.
  2. **Dedicated "Lihat Detail" / "Explore Case Study" Button**: Add a clear, accessible action button on the active slide's identity block or card that invokes `onOpenProject(currentHeroProject)`.
  3. **3D Model Click**: Clicking the center 3D model invokes `onOpenProject(currentHeroProject)`.

---

## 4. Requirement R6: Animasi, Interaksi Block, dan Tooltip

### 4.1. Animation Stack & Hero Block Transitions
- **Installed Packages**: `tailwindcss-animate` (v1.0.7) is present in `package.json` and loaded in `tailwind.config.ts`.
- **Framer Motion**: Not currently installed. While it could be added, `tailwindcss-animate` and CSS transitions are already integrated, highly performant, and add zero bundle weight overhead.
- **Block-Level Transition Design**:
  When `activeSlideIndex` changes:
  - **Left Column Project Info Block**: Apply a reactive key `key={currentHeroProject?.id || activeSlideIndex}` with `animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out`. This smoothly animates title and description updates.
  - **Right Column Cards**: Smooth scaling and transition classes (`transition-all duration-300 ease-out`, `hover:scale-110 active:scale-95`). Active card transitions with ring highlight and subtle elevation.
  - **Bottom Shelf Controls**: Interactive hover micro-interactions (`group-hover:translate-x-1 transition-transform`).

### 4.2. Tooltip Implementation with `@radix-ui/react-tooltip`
- **Existing Component**: `src/components/ui/tooltip.tsx` already exports `TooltipProvider`, `Tooltip`, `TooltipTrigger`, and `TooltipContent`.
- **Keyboard & Touch Accessibility**: Radix UI automatically binds `onFocus`, `onBlur`, `onPointerEnter`, and `onPointerLeave` with proper WAI-ARIA `role="tooltip"` and `aria-describedby`.
- **Hero Section Tooltip Audit**:
  Every interactive element in `Hero` must be equipped with a tooltip:
  | Interactive Element | Location | Tooltip Text |
  |---|---|---|
  | Primary Action Button (`Lihat Projek...`) | Left Hero Column | *"Buka studi kasus lengkap untuk [Nama Projek]"* |
  | Download CV Button | Left Hero Column | *"Unduh Curriculum Vitae (PDF)"* |
  | Dynamic Slide Indicators (`01`, `02`, `03`) | Right Navigation Bar | *"Lihat slide projek [Index]: [Judul Singkat]"* |
  | Diamond Highlight Cards | Right Preview Column | *"[Judul Projek] — Klik untuk melihat detail studi kasus"* |
  | 3D Polyhedron / Canvas | Center Stage | *"Model 3D Interaktif • Klik untuk membuka studi kasus"* |
  | "EXPLORE WORK" Button | Bottom Shelf | *"Jelajahi seluruh galeri projek"* |
  | Shelf Target Section Links | Bottom Shelf | *"Navigasi ke bagian [Nama Bagian]"* |
  | Previous Slide Button (`<`) | Bottom Shelf Right | *"Slide sebelumnya (Keyboard: Arrow Left)"* |
  | Next Slide Button (`>`) | Bottom Shelf Right | *"Slide berikutnya (Keyboard: Arrow Right)"* |

---

## 5. Build, Lint & Environment Diagnostics

### 5.1. TypeScript Verification
- Executed `tsc --noEmit` via `node node_modules/typescript/bin/tsc --noEmit`.
- **Result**: Exit code `0` (clean, zero compiler errors, strict mode compliant).

### 5.2. Next.js Linting Issue
- Running `node node_modules/next/dist/bin/next lint` produces:
  `Converting circular structure to JSON ... Referenced from: W:\...\.eslintrc.json`
- **Root Cause**: Next.js 15.5.6 combined with ESLint 9.39.4 triggers a known issue where `next/core-web-vitals` contains circular object references when parsed by legacy `.eslintrc.json`.
- **Remediation**:
  - In `next.config.ts`, `eslint: { ignoreDuringBuilds: true }` is already set, preventing build obstruction.
  - For clean standalone linting, migrate to flat config `eslint.config.mjs` or set `ESLINT_USE_FLAT_CONFIG=false`.

### 5.3. Production Build & Windows WSL Filesystem Patch
- Executing `node node_modules/next/dist/bin/next build` directly on Windows over WSL filesystem fails with:
  `Error: EISDIR: illegal operation on a directory, readlink '...src\app\favicon.ico'`
- **Fix**: The repository includes `patch-fs.js` which monkeypatches `fs.readlink` and `fs.promises.readlink` to convert `EISDIR` into `EINVAL`.
- **Command Required**:
  ```bash
  node -r ./patch-fs.js node_modules/next/dist/bin/next build
  ```
  Or setting `NODE_OPTIONS="-r ./patch-fs.js"`.
- Furthermore, in `package.json`, `"build": "NODE_ENV=production next build"` fails on native Windows cmd/powershell because `NODE_ENV=production` is a POSIX environment prefix. Updating the script or running with `cross-env` or direct node invocation is recommended.

---

## 6. Synthesized Implementation Roadmap

### Phase 1: Requirement R4 (Dynamic Project Navigation)
1. In `src/components/hero.tsx`, update `useMemo` to filter by `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`.
2. Add an effect to reset `activeSlideIndex` to 0 when `activeMode` changes.
3. Replace the static `[3, 2, 1, 0]` array with a dynamic sequence generator matching `featuredHeroProjects.length`.
4. Render responsive dynamic navigation indicators (numbered pills, slide tabs, or project titles) with active state highlights.

### Phase 2: Requirement R5 (Modal Layout Fixes & Hero Integration)
1. Refactor `src/components/project-modal.tsx` into a Flexbox layout (`flex flex-col max-h-[90vh] overflow-hidden`) with fixed header, scrollable body (`overflow-y-auto custom-scrollbar`), and fixed footer.
2. Remove nested `overflow-y-auto` from the outer backdrop overlay.
3. Adjust responsive typography (`truncate` and clamp on title, `p-3 sm:p-4` on metadata ribbon, `list-outside pl-4` on lists).
4. In `src/components/hero.tsx`, update diamond cards: clicking an active card opens the modal (`onOpenProject(slideProj)`), and provide an explicit "Lihat Detail" button.

### Phase 3: Requirement R6 (Animations & Radix Tooltips)
1. Wrap `Hero` with `<TooltipProvider delayDuration={150}>`.
2. Wrap all 9 interactive button groups in `Hero` with `<Tooltip>`, `<TooltipTrigger asChild>`, and `<TooltipContent>`.
3. Add `animate-in fade-in-50 slide-in-from-bottom-2 duration-300` using reactive keys for slide content changes.
4. Verify keyboard focus rings (`focus-visible:ring-2 focus-visible:outline-none`) across all controls.

### Phase 4: Final Validation
1. Verify with `tsc --noEmit`.
2. Verify production build with `node -r ./patch-fs.js node_modules/next/dist/bin/next build`.
3. Test UI responsiveness across mobile (<640px), tablet (768px), and desktop (1024px+).
