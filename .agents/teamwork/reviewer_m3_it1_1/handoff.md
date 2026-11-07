# Handoff Report — Milestone 3 Review & Adversarial Challenge

**Author**: `reviewer_m3_it1_1` (Reviewer & Adversarial Critic)  
**Date**: 2026-11-06T02:27:00Z  
**Task**: Milestone 3 Review (R4: Dynamic JSON Navigation, R5: 3-Tier Flexbox Modal Refactor, R6: Slide Block Transitions & Accessible Radix Tooltips)  
**Target Recipient**: Orchestrator (`cf0729e3-f061-40d9-8bb8-ea4465cfe5a6`)  
**Verdict**: **APPROVE**  
**Handoff Type**: Hard (Review & Audit Complete)

---

## 1. Observation

Direct examination of implementation code, verification command executions, and integrity checks:

### 1.1 Source Code Inspection

1. **`src/components/hero.tsx` (R4, R5, R6)**:
   - **Dynamic Featured Filtering (Lines 63–68)**:
     ```tsx
     // R4: Filter projects dynamically using featured: true and active/secondary mode
     const heroSlides = useMemo(() => {
       return projects.filter(
         (p) => Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
       );
     }, [projects, activeMode]);
     ```
     Accurately excludes non-featured items and filters by active and secondary modes.
   - **Slide Index Auto-Reset on Mode Switch (Lines 56–59)**:
     ```tsx
     // R4: Auto-reset slide index to 0 whenever activeMode changes
     useEffect(() => {
       setActiveSlideIndex(0);
     }, [activeMode]);
     ```
   - **Safe Cyclic Modulo & Bounds Handling (Lines 70–84)**:
     ```tsx
     const currentHeroProject = useMemo(() => {
       if (heroSlides.length === 0) return null;
       const safeIndex = ((activeSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
       return heroSlides[safeIndex] || null;
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
   - **Dynamic Indicators Replacing Static `[3, 2, 1, 0]` (Lines 304–347)**:
     Indicators adapt strictly to `heroSlides.length` with `id={`btn-indicator-${idx}`}`, `data-testid={`btn-indicator-${idx}`}`, `role="tab"`, and `aria-selected={isSelected}`.
   - **Single-Click Modal Triggers (Lines 181–203, 233–235, 261–269)**:
     - Active diamond card click: `onOpenProject(slideProj)` via single `onClick`.
     - Primary CTA button: `id="btn-cta-detail"` calling `onOpenProject(currentHeroProject)`.
     - 3D model click: `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}`.
     - Confusing `onDoubleClick` completely eliminated.
   - **Reactive Key Transitions & Accessible Tooltips (Lines 165–177, 87, 182–222, 259–298, 319–345, 387–421)**:
     - Description block has `key={currentHeroProject.id}` with `animate-in fade-in slide-in-from-left-3 duration-500` and `motion-safe:transition-all motion-reduce:transition-none`.
     - Wrapped inside `<TooltipProvider delayDuration={200} skipDelayDuration={100}>`.
     - All interactive controls (`btn-cta-detail`, `btn-cta-cv`, `btn-slide-prev`, `btn-slide-next`, dynamic indicators, diamond cards) wrapped in Radix `<Tooltip>` and `<TooltipTrigger asChild>`.

2. **`src/components/project-modal.tsx` (R5)**:
   - **Tier 1 Outer Container (Lines 89–93)**:
     ```tsx
     <div
       className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white shadow-2xl overflow-hidden"
       style={{ background: modalGradient }}
       onClick={(e) => e.stopPropagation()}
     >
     ```
     `flex flex-col max-h-[90vh] overflow-hidden` strictly isolates scrolling. Outer backdrop (line 83) has `overflow-hidden` preventing double scrollbars.
   - **Tier 2 Fixed Header (Lines 95–130)**:
     `flex-shrink-0 sticky top-0 z-20 ... border-b`. Title has `break-words line-clamp-2`. Close button has Radix tooltip "Tutup Modal (Esc)". Header remains fixed without jumping.
   - **Tier 3 Scrollable Body (Lines 132–282)**:
     `flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 space-y-6 custom-scrollbar`. Scrollbar is strictly contained between fixed header and footer; zero scrollbar leakage across asymmetric rounded corners (`rounded-tr-[44px] rounded-bl-[32px]`).
   - **Tier 4 Fixed Footer (Lines 284–303)**:
     `flex-shrink-0 z-20 border-t ...`. Contains "Kembali ke Galeri" and optional "Diskusikan Projek Ini".
   - **Defensive Null/Undefined Handling (Lines 58–75)**:
     Safe fallback object for `caseStudy`, safe fallbacks for `technologies`, `objectives`, `roleAndContributions`, `processAndMethodology`, `linksAndReferences`.
   - **Escape Key & Scroll Lock (Lines 39–50)**:
     Escape listener closes modal. `document.body.style.overflow = 'hidden'` on mount and restored to `''` on unmount.

3. **`src/components/ui/tooltip.tsx` (R6)**:
   - `TooltipContent` specifies `max-w-xs break-words px-3 py-1.5 text-xs pointer-events-none select-none backdrop-blur-md`.
   - `ActionTooltip` helper exported for flexible wrapping.

4. **`src/app/globals.css` (R5)**:
   - Lines 84–103 define `.custom-scrollbar` with minimalist 5px width/height and rounded thumb tracks.

### 1.2 Direct Verification Execution Results

- **Command**: `node tests/e2e/runner.mjs`
  - Output: `78 / 78 PASSED (100% pass rate, 0 failed, 16 suites, duration: ~1.95s, exit code 0)`.
  - Full suite validated across all 4 tiers:
    - Tier 1: 35/35 passed
    - Tier 2: 30/30 passed
    - Tier 3: 8/8 passed
    - Tier 4: 5/5 passed
- **Command**: `npm.cmd run typecheck` (`tsc --noEmit`)
  - Output: Exit code 0, 0 compilation or type errors.
- **Command**: `npm.cmd run build` (`next build` with static export)
  - Output: Exit code 0.
  - Successfully generated static pages and exported to `out/` (`/` size 58.9 kB, static content generated).

### 1.3 Integrity Violation Audit

- **Hardcoded test results embedded in source code**: None detected. Logic in `hero.tsx` and `project-modal.tsx` uses real props, state, and array operations.
- **Dummy or facade implementations**: None detected. Real 3-tier Flexbox layout, real Radix UI components, real responsive styling.
- **Shortcuts bypassing intended tasks**: None detected. All requirements (R4, R5, R6) implemented as specified in `ORIGINAL_REQUEST.md`.
- **Fabricated verification outputs or logs**: None detected. All commands independently re-run and confirmed with exit code 0.
- **Self-certifying work without genuine independent verification**: None detected. Independent verification reproduced 100% of claims.

---

## 2. Logic Chain

1. **R4 Dynamic Navigation Verification**:
   - *Premise*: `src/data/projects.json` contains 8 projects, 4 of which have `featured: true` (`proj-hmsso`, `proj-bunda-bahagia`, `proj-hmj-kedokteran`, `proj-sipadu-ri`).
   - *Reasoning*: Evaluating `Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))` for `tech`, `medical`, and `academic` yields exactly 3 projects per mode.
   - *Observation Support*: `heroSlides.map` dynamically generates 3 indicators (`01`, `02`, `03`) with IDs `btn-indicator-0`, `btn-indicator-1`, `btn-indicator-2`. The static `[3, 2, 1, 0]` buttons are removed. Changing `activeMode` triggers `useEffect(() => { setActiveSlideIndex(0); }, [activeMode])`, ensuring no out-of-sync slide states.
   - *Conclusion*: Requirement R4 is completely satisfied.

2. **R5 3-Tier Flexbox Modal Refactor & Single-Click Trigger**:
   - *Premise*: Modal previously suffered from double scrollbars, sticky header jump, asymmetric corner scrollbar clipping, and required double-clicking.
   - *Reasoning*: Enclosing the modal inside a `flex flex-col max-h-[90vh] overflow-hidden` container and confining the scrollbar strictly to the middle body (`flex-1 overflow-y-auto custom-scrollbar`) ensures that the scrollbar never touches the top or bottom asymmetric corners (`rounded-tr-[44px] rounded-bl-[32px]`). The fixed header (`flex-shrink-0 sticky top-0`) prevents header repositioning/jumping during scroll. Setting `overflow-hidden` on the backdrop prevents double scrollbars.
   - *Observation Support*: Verified in `project-modal.tsx` (Lines 83–133) and confirmed by Tier 1 and Tier 2 tests (T1.5.3, T1.5.4, T2.5.2). Single click on active diamond card or `btn-cta-detail` opens the modal directly.
   - *Conclusion*: Requirement R5 is completely satisfied.

3. **R6 Slide Transitions & Accessible Tooltips**:
   - *Premise*: Slide descriptions required smooth transitions on change, and interactive buttons required accessible tooltips for hover and keyboard focus.
   - *Reasoning*: Adding `key={currentHeroProject.id}` forces React reconciliation on slide changes, triggering Tailwind's `animate-in fade-in slide-in-from-left-3 duration-500` transition. Wrapping all interactive controls in Radix UI `<Tooltip>` ensures both mouse hover and keyboard focus (`focus-visible`) triggers tooltips with proper ARIA attributes.
   - *Observation Support*: Verified in `hero.tsx` (Lines 165–177, 182–222, 259–298, 319–345, 387–421) and confirmed by Tier 1 and Tier 2 tests (T1.6.1, T1.6.2, T1.6.3, T1.6.4, T2.6.1).
   - *Conclusion*: Requirement R6 is completely satisfied.

---

## 3. Adversarial Stress-Testing & Challenges

### 3.1 Challenge Scenarios & Findings

| # | Challenge Dimension | Attack Scenario / Hypothesis | Stress Test Result | Risk Assessment |
|---|---------------------|------------------------------|--------------------|-----------------|
| 1 | **Empty Dataset Boundary** | What if `projects` or `heroSlides` is empty (`length === 0`)? | Handled safely: `currentHeroProject` returns `null`, `handlePrevSlide` / `handleNextSlide` guard with early return, primary CTA falls back to `onNavigateSection('projects')`, and indicator list renders empty without crash. (Tested in T2.4.2) | **LOW / PASS** |
| 2 | **Slide Index Cyclic Bounds** | Negative slide index (e.g. `prev` from 0) or large burst indices (e.g. index 99). | Safe cyclic modulo `((index % N) + N) % N` correctly wraps -1 to `N-1` and clamps out-of-bounds clicks safely to `0..N-1`. (Tested in T1.4.3, T1.4.4, T2.4.3, T2.4.4, T2.4.5) | **LOW / PASS** |
| 3 | **Sparse Project Modal Rendering** | Project record missing `caseStudy`, `technologies`, `summary`, or `objectives`. | Lines 58–75 in `project-modal.tsx` construct a complete default object fallback; all array iterations guard with `.length > 0`. Modal renders gracefully without runtime error. (Tested in T2.5.3) | **LOW / PASS** |
| 4 | **Modal Backdrop vs Content Click** | User clicks modal body to interact with text/links; does the modal accidentally close? | Outer backdrop has `onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}` and inner container has `onClick={(e) => e.stopPropagation()}`. Inner clicks never close modal; backdrop clicks close it reliably. (Tested in T2.5.2) | **LOW / PASS** |
| 5 | **Modal Keyboard Accessibility** | User presses `Escape` while modal is open. | Event listener on `window` captures `Escape` and invokes `onClose()`. Listener and `document.body.style.overflow` are cleanly cleaned up on unmount. (Tested in T2.5.1) | **LOW / PASS** |
| 6 | **Tooltip Text Overflow & Flickering** | Extremely long tooltip label or hover loop when cursor moves over tooltip content. | `TooltipContent` incorporates `max-w-xs break-words pointer-events-none select-none`, preventing pointer hijacking and viewport clipping. (Tested in T2.6.3) | **LOW / PASS** |
| 7 | **Reduced Motion Preference** | User has `prefers-reduced-motion` enabled in OS/browser. | `hero.tsx` includes `motion-safe:transition-all motion-reduce:transition-none` on slide description and diamond cards. (Tested in T2.6.5) | **LOW / PASS** |

### 3.2 Coverage Gaps

- No material coverage gaps identified for Milestone 3 scope.
- Integration between Milestone 3 and Milestone 2 (3D model click trigger `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}`) is fully wired and verified.

---

## 4. Caveats

1. **ESLint 9 Tooling Notice**:
   Running `npm.cmd run lint` triggers Next.js 15's known `Converting circular structure to JSON` error caused by `eslint-config-next: 16.2.1` and `eslint: 9.39.4` interacting with `.eslintrc.json`. This is an upstream configuration issue in ESLint flat-config migration, not an application code defect. TypeScript strict typechecking (`tsc --noEmit`) and production static export (`next build`) pass with 0 errors.
2. **Audio/Sound Toggle Absence**:
   Consistent with the prior audit, no audio assets or sound toggle requirements were added, preserving strict task integrity.

---

## 5. Conclusion & Verdict

**Verdict**: **APPROVE**

Milestone 3 (R4: Dynamic JSON Navigation, R5: 3-Tier Flexbox Modal Refactor, R6: Slide Block Transitions & Accessible Radix Tooltips) has been implemented to full specification with impeccable code quality, robust defensive error handling, accessible keyboard/screen-reader standards, and zero integrity violations.

---

## 6. Verification Method

To independently reproduce this verification:

```powershell
# 1. Run full automated E2E test suite (78 tests)
node tests/e2e/runner.mjs

# 2. Run TypeScript strict typecheck (0 errors)
npm.cmd run typecheck

# 3. Run production static export build (successful out/ population)
npm.cmd run build
```
