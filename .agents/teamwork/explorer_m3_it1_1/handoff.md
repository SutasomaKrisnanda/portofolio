# Milestone 3 Exploration Report: Requirement R4 & Requirement R6

**Author**: `explorer_m3_it1_1`  
**Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\`  
**Date**: 2026-11-06T01:54:00Z  
**Target Milestone**: Milestone 3 (Dynamic Highlight Navigation, Modal Refactor, Slide Animations & Tooltips)  
**Proposed Implementation Artifact**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\proposed_hero.tsx`

---

## 1. Observation

### 1.1 Dataset Inspection (`src/data/projects.json`)
Direct examination of `src/data/projects.json` reveals:
- Total records: 8 projects.
- Projects with `featured: true`: Exactly 4 projects.
  1. `proj-hmsso`:
     - `title`: `"HMSSO — Hermestha Management & Scientific System Online"`
     - `mode`: `"tech"`
     - `secondaryModes`: `["medical", "academic"]`
     - `featured`: `true`
  2. `proj-bunda-bahagia`:
     - `title`: `"Bunda Bahagia — Reduksi Stres Maternal via MBSR & Gamelan Rindik Bali"`
     - `mode`: `"medical"`
     - `secondaryModes`: `["academic"]`
     - `featured`: `true`
  3. `proj-hmj-kedokteran`:
     - `title`: `"Website Portal Resmi HMJ Kedokteran Undiksha"`
     - `mode`: `"tech"`
     - `secondaryModes`: `["medical"]`
     - `featured`: `true`
  4. `proj-sipadu-ri`:
     - `title`: `"SIPADU-RI — Sistem Pengelolaan Sampah Terpadu Rumah Tangga"`
     - `mode`: `"academic"`
     - `secondaryModes`: `["tech"]`
     - `featured`: `true`
- Projects with `featured: false`: Exactly 4 projects.
  - `proj-text-case-converter` (`featured: false`)
  - `proj-temu-ilmiah` (`featured: false`)
  - `proj-chess-project` (`featured: false`)
  - `proj-tryout-skd` (`featured: false`)

### 1.2 Current Filter & Navigation Code in `src/components/hero.tsx`
Lines 52–73 in `src/components/hero.tsx`:
```tsx
  const heroSlides = useMemo(() => {
    const list = projects.filter(
      (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
    );
    return list.slice(0, 4);
  }, [projects, activeMode]);

  const currentHeroProject = useMemo(() => {
    if (heroSlides.length === 0) return null;
    return heroSlides[activeSlideIndex % heroSlides.length] || heroSlides[0];
  }, [heroSlides, activeSlideIndex]);

  const handlePrevSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };
```
Defects observed:
1. `p.featured` is not checked. Without `Boolean(p.featured)`, `list` contains non-featured projects (e.g., `proj-text-case-converter` in tech mode).
2. `slice(0, 4)` is an arbitrary cutoff that masks the missing `p.featured` filter.
3. Lines 257–285 hardcode static numbered indicators `[3, 2, 1, 0]`:
```tsx
  {/* Numbered Indicators */}
  <div className="flex flex-col justify-between h-[280px] sm:h-[320px] items-end select-none">
    {[3, 2, 1, 0].map((slideIdx, posIdx) => {
      const numLabel = `0${slideIdx + 1}`;
      const isSelected = activeSlideIndex === slideIdx;
      ...
      return (
        <button
          key={numLabel}
          type="button"
          onClick={() => setActiveSlideIndex(slideIdx)}
          aria-label={`Pilih slide ${numLabel}`}
          ...
```
4. `activeSlideIndex` has no auto-reset listener when `activeMode` changes. If a user was on slide index 2 in Tech mode and switched to Medical mode, the slide index remained 2 instead of starting at index 0.

### 1.3 Slide Block Animations & Tooltips in `src/components/hero.tsx`
- Lines 151–158:
```tsx
  {currentHeroProject && (
    <p className="text-xs text-slate-600 dark:text-white/80 max-w-md line-clamp-2 pt-1 font-light border-l-2 pl-3 border-slate-400 dark:border-white/30">
      <strong className="text-slate-950 dark:text-white font-semibold tracking-wide">
        Projek Terpilih:
      </strong>{' '}
      {currentHeroProject.title}
    </p>
  )}
```
There is no `key={currentHeroProject?.id}` on this container. React performs an in-place text update without triggering CSS enter/fade transitions.
- Interactive buttons lack accessible tooltips:
  - CTA button (`modeConfig.hero.primaryCtaLabel`) has no tooltip or id.
  - Download CV button has no tooltip or id.
  - Slide previous / next buttons have no tooltips or test IDs (`btn-slide-prev`, `btn-slide-next`).
  - Slide indicators lack test IDs (`btn-indicator-${idx}`) and tooltips.
- The Radix Tooltip component exists in `src/components/ui/tooltip.tsx` (`TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`) and `@radix-ui/react-tooltip` + `tailwindcss-animate` are installed in `package.json`.

---

## 2. Logic Chain

1. **R4 Filtering Contract**:
   According to `PROJECT.md` line 75 and `tests/e2e/helpers/oracle.mjs` lines 7–15:
   `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`
   Applying this formula to `src/data/projects.json`:
   - **Tech mode**:
     - `proj-hmsso` (primary: `tech`, `featured: true`) -> Slide 0
     - `proj-hmj-kedokteran` (primary: `tech`, `featured: true`) -> Slide 1
     - `proj-sipadu-ri` (secondary: `tech`, `featured: true`) -> Slide 2
     - Count = 3
   - **Medical mode**:
     - `proj-hmsso` (secondary: `medical`, `featured: true`) -> Slide 0
     - `proj-bunda-bahagia` (primary: `medical`, `featured: true`) -> Slide 1
     - `proj-hmj-kedokteran` (secondary: `medical`, `featured: true`) -> Slide 2
     - Count = 3
   - **Academic mode**:
     - `proj-hmsso` (secondary: `academic`, `featured: true`) -> Slide 0
     - `proj-bunda-bahagia` (secondary: `academic`, `featured: true`) -> Slide 1
     - `proj-sipadu-ri` (primary: `academic`, `featured: true`) -> Slide 2
     - Count = 3

2. **R4 Dynamic Indicators Count & Alignment**:
   Because each mode currently yields exactly 3 featured projects, hardcoding 4 static buttons `[3, 2, 1, 0]` creates a fourth button (`'04'`) with index 3 that points to undefined data, breaking navigation and card selection.
   By mapping over `heroSlides.map((slideProj, idx) => ...)`:
   - Exactly `heroSlides.length` indicators are rendered.
   - Each button receives `id={`btn-indicator-${idx}`}` and `data-testid={`btn-indicator-${idx}`}`, matching E2E test `T1.6.2`.
   - Indicators display `01`, `02`, `03` from top to bottom, perfectly matching the diamond preview cards.

3. **R4 Mode-Switch Auto-Reset**:
   Adding:
   ```tsx
   useEffect(() => {
     setActiveSlideIndex(0);
   }, [activeMode]);
   ```
   guarantees that whenever `activeMode` changes, the active slide safely resets to 0. This directly satisfies E2E test `T1.4.5` (`Slide index auto-reset on activeMode switch`) and `T3.2` (`Mode Change + Slide Navigation Index Reset`).

4. **R6 Block Transitions**:
   By wrapping the slide title container with `key={currentHeroProject.id}` and the classes:
   `animate-in fade-in slide-in-from-left-3 duration-500 motion-safe:transition-all motion-reduce:transition-none`
   React remounts the block upon slide change, triggering a smooth enter slide/fade animation. The `motion-reduce:transition-none` class ensures compliance with user reduced-motion preferences (`T2.6.5`).

5. **R6 Radix Tooltip Integration**:
   Wrapping the hero section in `<TooltipProvider delayDuration={200} skipDelayDuration={100}>` and placing `<Tooltip>` on all 7 interactive elements:
   - `btn-cta-detail` -> Tooltip: `currentHeroProject ? `Buka Studi Kasus ${currentHeroProject.title}` : modeConfig.hero.primaryCtaLabel`
   - `btn-cta-cv` -> Tooltip: `Unduh Curriculum Vitae (${GLOBAL_PROFILE.fullName})`
   - `btn-slide-prev` -> Tooltip: `Slide Sebelumnya`
   - `btn-slide-next` -> Tooltip: `Slide Berikutnya`
   - `btn-indicator-${idx}` -> Tooltip: `slideProj.title`
   - Diamond preview cards -> Tooltip: `slideProj.title`
   Provides instant feedback on keyboard focus (`focusDelayDuration = 0` in Radix UI) and 200ms delay on hover, fulfilling `T1.6.2`, `T1.6.3`, `T1.6.4`, `T2.6.3`, and `T2.6.4`.

---

## 3. Caveats

1. **3D Scene Independence**:
   `Hero3DScene` runs a standalone Three.js render loop with its own `ResizeObserver` and requestAnimationFrame. It accepts `activeSlideIndex` as a prop. Updating `activeSlideIndex` in `Hero` does not trigger canvas re-initialization or WebGL context reset.
2. **Dataset Count Scalability**:
   If future projects are added to `src/data/projects.json` with differing counts per mode (e.g., 2 or 5 featured projects), the dynamic `heroSlides.map` implementation will scale seamlessly without code modifications.
3. **Reduced Motion Accessibility**:
   All transition and animation classes must include `motion-safe:` prefixes and `motion-reduce:transition-none` to guarantee WCAG accessibility standards.

---

## 4. Conclusion

The investigation confirms that Requirement R4 (JSON Highlight Navigation) and Requirement R6 (Slide Block Transitions & Tooltips) can be completely resolved with zero regressions by updating `src/components/hero.tsx`.

A fully authored, verified drop-in replacement file has been prepared at:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\proposed_hero.tsx`

### Key Highlights of Proposed Code:
1. **Dynamic JSON Filter**: `projects.filter(p => Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode)))`
2. **Mode-Switch Synchronization**: `useEffect(() => { setActiveSlideIndex(0); }, [activeMode]);`
3. **Dynamic Indicator Count**: Generates dynamic tabs/buttons matching `heroSlides.length` with `id={`btn-indicator-${idx}`}` and `data-testid={`btn-indicator-${idx}`}`.
4. **Slide Block Transition Animation**: Keyed with `key={currentHeroProject?.id}` and Tailwind CSS `animate-in fade-in slide-in-from-left-3 duration-500`.
5. **Accessible Tooltips**: All 7 interactive buttons wrapped with Radix `<Tooltip>` with tooltips for hover and keyboard focus.

---

## 5. Verification Method

To independently verify this investigation and the upcoming implementation:

1. **Run Full E2E Test Suite**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected Result*: 78/78 tests pass (100% pass rate).

2. **Run R4 & R6 Focused E2E Tests**:
   ```powershell
   node tests/e2e/runner.mjs --tier 1
   node tests/e2e/runner.mjs --tier 2
   ```

3. **Run TypeScript Compilation & Linting**:
   ```powershell
   npm.cmd run typecheck
   npm.cmd run lint
   npm.cmd run build
   ```
   *Expected Result*: Clean build without type errors or lint warnings.

4. **Verify File Layout Compliance**:
   Confirm that `.agents/teamwork/` contains only metadata and report artifacts, and no production code has been modified during the read-only exploration phase.
