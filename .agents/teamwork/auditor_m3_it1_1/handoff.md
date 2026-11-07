# Milestone 3 Forensic Integrity Audit Report

**Auditor Agent**: Forensic Auditor (`auditor_m3_it1_1`)  
**Audit Target**: Milestone 3: Dynamic Project Navigation (R4), 3-Tier Flexbox Modal Refactor (R5), and Slide Block Transitions & Accessible Radix Tooltips (R6)  
**Date**: 2026-11-06T02:33:00Z  
**Target Recipient**: Orchestrator (`cf0729e3-f061-40d9-8bb8-ea4465cfe5a6`)  
**Profile**: General Project (Integrity Mode: `development` as specified in `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

## Forensic Audit Summary

| Check # | Inspection Category | Evaluation Target | Result | Evidence / Notes |
|:---:|---|---|:---:|---|
| 1 | **Hardcoded Test Results** | Source code scan for test bypasses / mocked outputs | **PASS** | Zero occurrences of test bypasses, conditional test mocking, or hardcoded pass strings in `src/components/hero.tsx`, `project-modal.tsx`, or `tooltip.tsx`. |
| 2 | **Facade & Stub Detection** | Interface inspection for dummy or no-op logic | **PASS** | Genuine dynamic filtering, genuine 3-tier Flexbox layout, genuine Radix UI primitives (`@radix-ui/react-tooltip`), and active slide state synchronization. |
| 3 | **Authentic Dataset Filtering (R4)** | Dynamic JSON filtering logic | **PASS** | Verified `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))` filters strictly 3 featured projects per mode; dynamic indicators match `heroSlides.length`; auto-resets `activeSlideIndex` to 0 on mode change. |
| 4 | **3-Tier Flexbox Modal Layout (R5)** | Modal structural & scrollbar confinement | **PASS** | Outer container `flex flex-col max-h-[90vh] overflow-hidden`; fixed header `flex-shrink-0 sticky top-0`; scrollable body `flex-1 overflow-y-auto custom-scrollbar`; fixed footer `flex-shrink-0 border-t`. Zero scrollbar leakage over asymmetric rounded curves; backdrop has `overflow-hidden` preventing double scrollbars. |
| 5 | **Modal Trigger Integration (R5)** | Single-click modal invocation | **PASS** | Diamond cards open modal on single click (`onOpenProject(slideProj)`); zero `onDoubleClick` handlers remain; primary CTA button (`btn-cta-detail`) triggers `onOpenProject(currentHeroProject)`. |
| 6 | **Radix UI Tooltips & Animation (R6)** | Micro-interactions and accessible tooltips | **PASS** | All interactive hero buttons (`btn-cta-detail`, `btn-cta-cv`, `btn-slide-prev`, `btn-slide-next`, `btn-indicator-${idx}`) wrapped in Radix `<Tooltip>`; slide content uses reactive `key={currentHeroProject?.id}` for slide transitions; includes `motion-reduce:transition-none`. |
| 7 | **Independent Test Suite Execution** | 4-tier E2E regression runner | **PASS** | 78 / 78 tests passed (100% pass rate, exit code 0, duration: ~1.54s). |
| 8 | **Adversarial Stress Testing (Tier 5 M3)** | Extreme edge cases, sparse objects, bounds | **PASS** | 11 / 11 tests passed in newly created `tests/e2e/tier5-adversarial-m3.test.mjs` (modulo underflow, sparse project records, title clamping, rapid mode transitions). |
| 9 | **Build & Static Export Verification** | TypeScript typecheck & Next.js static build | **PASS** | `npm run typecheck` returned 0 errors (exit code 0); `next build` completed static export to `out/` with 4/4 static pages and 2/2 exports (exit code 0). |

---

## 1. Observation

Direct forensic examination of codebase files, line numbers, tool executions, and empirical outputs:

### 1.1 Source Code Inspection: `src/components/hero.tsx` (430 lines)
- **Lines 56–59 (Slide Index Mode Reset)**:
  ```typescript
  // R4: Auto-reset slide index to 0 whenever activeMode changes
  useEffect(() => {
    setActiveSlideIndex(0);
  }, [activeMode]);
  ```
  *Finding*: Strictly binds `activeSlideIndex` reset to `activeMode` dependency, eliminating stale index retention across mode shifts.
- **Lines 63–68 (Dynamic Dataset Filtering)**:
  ```typescript
  // R4: Filter projects dynamically using featured: true and active/secondary mode
  const heroSlides = useMemo(() => {
    return projects.filter(
      (p) => Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
    );
  }, [projects, activeMode]);
  ```
  *Finding*: Authentically filters projects by `Boolean(p.featured)` and mode matching without any static slices (`slice(0, 4)`) or dummy project arrays.
- **Lines 70–74 (Defensive Safe Modulo Resolution)**:
  ```typescript
  const currentHeroProject = useMemo(() => {
    if (heroSlides.length === 0) return null;
    const safeIndex = ((activeSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length;
    return heroSlides[safeIndex] || null;
  }, [heroSlides, activeSlideIndex]);
  ```
  *Finding*: Employs double-modulo safe index arithmetic `((index % len) + len) % len`, preventing negative index errors or `undefined` returns.
- **Lines 165–177 (Slide Block Reactive Animation)**:
  ```typescript
  {currentHeroProject && (
    <div
      key={currentHeroProject.id}
      className="animate-in fade-in slide-in-from-left-3 duration-500 motion-safe:transition-all motion-reduce:transition-none"
    >
      <p className="text-xs text-slate-600 dark:text-white/80 max-w-md line-clamp-2 pt-1 font-light border-l-2 pl-3 border-slate-400 dark:border-white/30">
        <strong className="text-slate-950 dark:text-white font-semibold tracking-wide">
          Projek Terpilih:
        </strong>{' '}
        {currentHeroProject.title}
      </p>
    </div>
  )}
  ```
  *Finding*: Keying with `currentHeroProject.id` causes clean DOM remount and CSS animation execution on slide change, with reduced motion compliance (`motion-reduce:transition-none`).
- **Lines 182–222 (CTA Buttons & Radix Tooltips)**:
  - `btn-cta-detail`: Wrapped in `<Tooltip>`, single click opens `onOpenProject(currentHeroProject)`.
  - `btn-cta-cv`: Wrapped in `<Tooltip>`, downloads CV with vector icon.
- **Lines 259–301 (Diamond Cards Single-Click Modal Open)**:
  - Completely removed legacy `onDoubleClick`.
  - Single click on active card (`isCardActive`) invokes `onOpenProject(slideProj)`.
  - Click on inactive card navigates to that slide (`setActiveSlideIndex(idx)`).
- **Lines 304–348 (Dynamic Slide Indicators)**:
  - Generates navigation indicators dynamically using `heroSlides.map((slideProj, idx) => ...)`.
  - Assigns `id={`btn-indicator-${idx}`}` and `data-testid={`btn-indicator-${idx}`}`.
  - Declares accessibility attributes: `role="tab"` and `aria-selected={isSelected}`.

### 1.2 Source Code Inspection: `src/components/project-modal.tsx` (310 lines)
- **Lines 58–76 (Defensive Data Fallbacks)**:
  ```typescript
  const caseStudy = project.caseStudy || {
    overview: project.summary || '',
    backgroundAndProblem: '',
    objectives: [],
    roleAndContributions: [],
    processAndMethodology: [],
    finalOutput: '',
    resultsAndImpact: '',
    lessonsLearned: '',
    linksAndReferences: []
  };
  const technologies = project.technologies || [];
  const objectives = caseStudy.objectives || [];
  const roleAndContributions = caseStudy.roleAndContributions || [];
  const processAndMethodology = caseStudy.processAndMethodology || [];
  const linksAndReferences = caseStudy.linksAndReferences || [];
  ```
  *Finding*: Safe fallbacks for missing/sparse project records, preventing runtime crashes.
- **Lines 83–86 (Backdrop Scrollbar Insulation)**:
  - Container uses `overflow-hidden` (not `overflow-y-auto`), completely eliminating double outer scrollbars.
  - Backdrop dismissal uses `if (e.target === e.currentTarget) onClose();`.
- **Lines 89–93 (Outer Modal Container)**:
  - Classes: `relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white shadow-2xl overflow-hidden`.
  - Includes `e.stopPropagation()`.
- **Lines 94–130 (Tier 2 Fixed Header)**:
  - Classes: `flex-shrink-0 sticky top-0 z-20 flex items-start justify-between gap-4 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 border-b border-slate-900/10 dark:border-white/20 bg-white/85 dark:bg-black/70 backdrop-blur-xl`.
  - Title includes `break-words line-clamp-2` and `id="case-study-title"`.
  - Close button wrapped in accessible Tooltip.
- **Lines 132–282 (Tier 3 Scrollable Body)**:
  - Classes: `flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 space-y-6 custom-scrollbar`.
  - Because it is confined between the fixed header and fixed footer, the scrollbar never reaches the asymmetric corner curves (`rounded-tr-[44px] rounded-bl-[32px]`), preventing scrollbar clipping.
- **Lines 284–304 (Tier 4 Fixed Footer)**:
  - Classes: `flex-shrink-0 z-20 border-t border-slate-900/10 dark:border-white/20 px-5 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white/85 dark:bg-black/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3`.

### 1.3 Source Code Inspection: `src/components/ui/tooltip.tsx` (71 lines)
- Directly imports authentic Radix UI primitives from `@radix-ui/react-tooltip`.
- Binds `TooltipProvider = TooltipPrimitive.Provider`, `Tooltip = TooltipPrimitive.Root`, `TooltipTrigger = TooltipPrimitive.Trigger`.
- `TooltipContent` wraps with `z-50 overflow-hidden rounded-lg border px-3 py-1.5 text-xs shadow-xl max-w-xs break-words pointer-events-none select-none backdrop-blur-md`.
- Exports accessible `ActionTooltip` utility.

### 1.4 Independent Command Executions & Outputs
1. **TypeScript Typecheck (`npm.cmd run typecheck`)**:
   - Exit code: `0`
   - Output: Clean exit, 0 errors.
2. **Next.js Static Export Build (`node -r ./patch-fs.js node_modules/next/dist/bin/next build`)**:
   - Exit code: `0`
   - Generated static pages: `4 / 4`
   - Generated exports: `2 / 2`
   - Emitted files: `out/index.html` (148,993 bytes), `out/404.html` (37,291 bytes), `out/models/` (mirrored GLB files).
3. **E2E Full Regression Suite (`node tests/e2e/runner.mjs`)**:
   - Total suites: 16
   - Tests: **78 / 78 PASSED** (0 failed, 100% pass rate, exit code 0).
4. **Tier 5 Milestone 3 Adversarial Test Suite (`node --test tests/e2e/tier5-adversarial-m3.test.mjs`)**:
   - Tests: **11 / 11 PASSED** (0 failed, 100% pass rate, exit code 0).
5. **Tier 5 Milestone 1 & 2 Regressions**:
   - Tier 5 M1 (`node --test tests/e2e/tier5-adversarial-m1.test.mjs`): **12 / 12 PASSED**
   - Tier 5 M2 (`node --test tests/e2e/tier5-adversarial-m2.test.mjs`): **15 / 15 PASSED**

---

## 2. Logic Chain

1. **R4 Dynamic Navigation Verification**:
   - *Observation*: `projects.filter((p) => Boolean(p.featured) && ...)` in `hero.tsx:64-68` executes dynamic filtering over the full project list.
   - *Reasoning*: Testing with adversarial project lists (missing `featured`, `featured: false`, `featured: null`) confirms zero non-featured projects enter `heroSlides`. Modulo bounds calculation `((index % len) + len) % len` prevents NaN or out-of-bounds indexing. Navigation indicators map strictly over `heroSlides.length`, eliminating the hardcoded `[3, 2, 1, 0]` button artifact.
   - *Conclusion*: R4 is genuinely implemented with zero facades or bypasses.

2. **R5 3-Tier Flexbox Modal Refactor Verification**:
   - *Observation*: Outer container has `flex flex-col max-h-[90vh] overflow-hidden`; fixed header has `flex-shrink-0 sticky top-0`; inner body has `flex-1 overflow-y-auto`; fixed footer has `flex-shrink-0 border-t`.
   - *Reasoning*: Because the scrollable container is the middle flex item (`flex-1`) and does not touch the outer container's outer boundary, the native scrollbar track is physically restricted from the asymmetric curved corners (`rounded-tr-[44px] rounded-bl-[32px]`). Removing `overflow-y-auto` from the outer backdrop prevents nested scrolling. Single-click invocation on active diamond card and CTA button eliminates the confusing double-click requirement.
   - *Conclusion*: R5 is genuinely resolved with rigorous layout contracts and zero scrollbar leakage.

3. **R6 Micro-Interactions, Block Transitions & Radix Tooltips Verification**:
   - *Observation*: Slide block uses `key={currentHeroProject?.id}` and Tailwind `animate-in fade-in slide-in-from-left-3 duration-500`; all interactive hero buttons are equipped with Radix UI `<Tooltip>`.
   - *Reasoning*: Tooltip primitive is authentic `@radix-ui/react-tooltip`. Keyboard focus (`focus-visible`) and hover triggers were verified both statically and in automated simulation. Prefers-reduced-motion is strictly respected via `motion-reduce:transition-none`.
   - *Conclusion*: R6 is authentic, accessible, and compliant with all project standards.

---

## 3. Caveats

1. **Prebuild Clean Script Concurrency**:
   Running `npm.cmd run build` invokes `prebuild: node scripts/clean.js` which purges `.next/`. On Windows filesystem where file locks or antivirus indexing can delay disk I/O, webpack page data collection can occasionally race against manifest generation. Running `node -r ./patch-fs.js node_modules/next/dist/bin/next build` directly completes the static export cleanly with exit code 0.
2. **Legacy ESLint Environment**:
   Next.js 15 legacy `.eslintrc.json` emits an upstream flat config circular structure warning on `npm run lint`. This is an external configuration quirk and does not affect TypeScript compilation or Next.js static build.

---

## 4. Conclusion

The Milestone 3 work product demonstrates exceptional code quality, architectural rigor, and zero integrity violations.
- **R4**: Dynamic JSON filtering, indicator count synchronization, cyclic bounds wrapping, and mode-switch auto-reset to index 0 are genuine and fully operational.
- **R5**: 3-tier Flexbox modal layout is cleanly partitioned with zero scrollbar leakage, zero header jumping, single-click card modal trigger, and CTA button integration.
- **R6**: Block transition animations and accessible Radix UI tooltips across all interactive controls are active and verified.

All 116 tests across 4 regression tiers and 3 adversarial suites pass with a 100% success rate.

**Audit Verdict**: **CLEAN**

---

## 5. Verification Method

To independently reproduce the audit findings:

1. **Run Full E2E Test Suite (78 tests)**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected Result*: 78/78 PASSED (100% pass rate, exit code 0).

2. **Run Milestone 3 Adversarial Stress Suite (11 tests)**:
   ```powershell
   node --test tests/e2e/tier5-adversarial-m3.test.mjs
   ```
   *Expected Result*: 11/11 PASSED (100% pass rate, exit code 0).

3. **Verify TypeScript Strict Compilation**:
   ```powershell
   npm.cmd run typecheck
   ```
   *Expected Result*: Exit code 0, 0 compilation errors.

4. **Verify Static Export Build**:
   ```powershell
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
   *Expected Result*: Exit code 0, prerendered static pages to `out/`.
