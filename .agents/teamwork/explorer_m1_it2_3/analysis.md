# Analysis — Milestone 1 Iteration 2: Achievements Pill Styling & Verification Protocol

**Agent**: `teamwork_explorer_m1_it2_3`  
**Date**: 2026-11-08  
**Scope**:  
1. Deep investigation of `src/components/achievements.tsx:140` pill styling (`shrink-0` vs `shrink-0 sm:shrink` consistency with `projects.tsx:157`).
2. Formulation of the comprehensive 5-stage Verification Protocol for Milestone 1 Iteration 2 (Typecheck, Lint, E2E Runner, Clean Static Build, Tier 5 Adversarial Tests).

---

## 1. Executive Summary

- **Achievements Pill Inconsistency**: `src/components/achievements.tsx:140` unconditionally applies `shrink-0` to category filter pills, whereas `src/components/projects.tsx:157` applies `shrink-0 sm:shrink`.
  - On mobile (`< sm`), `shrink-0` prevents pill buttons from squishing inside the horizontal scrolling track (`flex-nowrap overflow-x-auto`).
  - On desktop (`sm:`), the container switches to `sm:flex-wrap`. Unconditional `shrink-0` restricts flex items from normal row flexing, whereas `sm:shrink` allows standard elasticity in wrapped rows while `whitespace-nowrap` prevents awkward line breaks.
  - Adding `sm:shrink` to `achievements.tsx:140` (and `sm:overflow-visible` to `achievements.tsx:130`) achieves 100% architectural and visual consistency across both galleries.
- **Verification Protocol for Iteration 2**: A strict 5-stage gating protocol has been formulated:
  1. `npm.cmd run typecheck` — TypeScript strict type validation (0 TS errors).
  2. `npm.cmd run lint` — ESLint static analysis (0 errors, exit code 0).
  3. `node tests/e2e/runner.mjs` — 4-tier opaque-box E2E suite covering R1–R4 (61/61 pass, exit code 0).
  4. `npm.cmd run build` — Clean production static export to `out/` with zero DrvFs crashes (exit code 0).
  5. `node --test tests/e2e/tier5-adversarial-m1.test.mjs` — 12/12 adversarial tests passing (verifies binary health, rapid switching, dynamic icons, and `out/` export artifacts).
- **Current Baseline Status**:
  - Stage 1 (Typecheck): **PASSED** (0 errors, Exit code 0).
  - Stage 2 (Lint): **PASSED** (0 errors, Exit code 0).
  - Stage 3 (E2E Runner): **PASSED** (61/61 tests pass, Exit code 0).
  - Stage 4 (Clean Build): **BLOCKED** by Next.js manifest trace handling in `patch-fs.js` (under remediation by Explorer M1-It2-1 / Worker M1-It2).
  - Stage 5 (Tier 5 Adversarial): **11/12 PASSED**; the single failing test (`T5.4.1`) strictly requires Stage 4 to produce `out/index.html`. Once Stage 4 passes, Stage 5 will pass 12/12.

---

## 2. Investigation Focus 1: `achievements.tsx:140` vs `projects.tsx:157`

### 2.1 Side-by-Side Code Inspection

#### `src/components/achievements.tsx` (lines 125–158)
```tsx
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
```

#### `src/components/projects.tsx` (lines 143–165)
```tsx
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
              ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
              : 'bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-400'
          }`}
        >
          {count}
        </span>
      </button>
    );
  })}
</div>
```

### 2.2 CSS Behavioral Analysis

| Viewport Dimension | Container Flex Mode | Button Shrink Style in Projects | Button Shrink Style in Achievements (Current) | Difference & Impact |
|--------------------|---------------------|---------------------------------|------------------------------------------------|---------------------|
| Mobile (`< sm`, <640px) | `flex-nowrap overflow-x-auto` | `shrink-0` (`flex-shrink: 0`) | `shrink-0` (`flex-shrink: 0`) | **Identical**: Buttons do not compress; single-row horizontal scroll works seamlessly with gradient masks. |
| Desktop (`sm:`, >=640px) | `sm:flex-wrap` | `sm:shrink` (`flex-shrink: 1`) | `shrink-0` (`flex-shrink: 0`) | **Inconsistent**: In `projects.tsx`, pills behave as normal flex items in a wrapped flexbox line. In `achievements.tsx`, pills are rigidly non-shrinkable. Combined with `whitespace-nowrap`, `sm:shrink` preserves the exact button text without line breaks, but allows row flex balance. |
| Desktop Container Overflow | `overflow-x-auto` | `sm:overflow-visible` | `overflow-x-auto` (unconditional) | In `projects.tsx`, `sm:overflow-visible` disables horizontal overflow clipping on desktop, preventing clipping of `scale-105` active pills and drop shadows. In `achievements.tsx`, `overflow-x-auto` remains active on desktop. |

### 2.3 Proposed Code Diff for `src/components/achievements.tsx`

```diff
--- a/src/components/achievements.tsx
+++ b/src/components/achievements.tsx
@@ -127,7 +127,7 @@ export function Achievements({ activeMode }: AchievementsProps) {
           <div
             ref={scrollTrackRef}
             role="group"
             aria-label="Filter kategori prestasi"
-            className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1.5 px-1 sm:px-0"
+            className="flex flex-nowrap sm:flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto sm:overflow-visible no-scrollbar scroll-smooth py-1.5 px-1 sm:px-0"
           >
             {categoriesWithCounts.map((cat) => {
               const isSelected = selectedCategory === cat.name;
@@ -137,7 +137,7 @@ export function Achievements({ activeMode }: AchievementsProps) {
                   key={cat.name}
                   type="button"
                   aria-pressed={isSelected}
                   onClick={(e) => handleSelectCategory(cat.name, e)}
-                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
+                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                     isSelected
                       ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                       : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
```

---

## 3. Investigation Focus 2: Iteration 2 Verification Protocol

### 3.1 Gating Hierarchy & Pipeline Order

The verification protocol must be executed in the following strict order:

```
[Stage 1: typecheck] ──► [Stage 2: lint] ──► [Stage 3: runner.mjs (Tiers 1-4)] ──► [Stage 4: build (out/)] ──► [Stage 5: tier 5 adversarial]
```

#### Pipeline Invalidation Rationale:
1. **Static Analysis Precondition**: `npm run build` deliberately configures Next.js to skip typecheck and linting (`Skipping validation of types`, `Skipping linting`) to optimize build turnaround on Windows DrvFs. Thus, Stages 1 and 2 are indispensable front-line guards.
2. **Opaque-Box E2E Suite Precondition**: `runner.mjs` verifies runtime logic, mode switching, UI invariants, and contracts across R1 to R4 in ~1.5s, preventing long build cycle waste if functional regressions occur.
3. **Artifact Dependency between Stage 4 and Stage 5**:
   - Stage 5 (`tier5-adversarial-m1.test.mjs`) contains Section 4 (`Static Export Verification`), which explicitly tests:
     - `out/index.html` exists and contains preloaded AVIFs and SVGs (`T5.4.1`)
     - `out/_next/static/media/` physically contains the 6 AVIF files and 3 SVGs (`T5.4.2`)
   - If Stage 5 is run before Stage 4, `T5.4.1` will always fail with `AssertionError: out/index.html must exist (run build first)`.
   - Therefore, Stage 4 is a strict prerequisite for Stage 5.

---

### 3.2 Protocol Specification & Acceptance Gates

#### Stage 1: TypeScript Static Typecheck
- **Command**: `npm.cmd run typecheck`
- **Underlying Call**: `tsc --noEmit`
- **Timeout**: 120s
- **Pass Criteria**: Exit Code 0, 0 TS diagnostics.
- **Empirical Measurement**: Passed in 1m10s with zero errors.

#### Stage 2: ESLint Static Analysis
- **Command**: `npm.cmd run lint`
- **Underlying Call**: `node -r ./patch-fs.js node_modules/next/dist/bin/next lint`
- **Timeout**: 120s
- **Pass Criteria**: Exit Code 0, 0 errors. (Pre-existing warnings in `use-toast.ts`, `theme-provider.tsx`, and `education.tsx` are non-fatal).
- **Empirical Measurement**: Passed in 55s with zero errors.

#### Stage 3: E2E Test Suite (Tiers 1–4)
- **Command**: `node tests/e2e/runner.mjs`
- **Coverage**:
  - Tier 1: Feature Coverage (R1–R4) — 24 tests
  - Tier 2: Boundary & Corner Cases (R1–R4) — 24 tests
  - Tier 3: Cross-Feature Interactions — 8 tests
  - Tier 4: Real-World Scenarios — 5 tests
- **Pass Criteria**:
  - Exit Code 0.
  - Exactly 61/61 tests pass.
  - Summary table reports `COVERED` for R1, R2, R3, and R4.
- **Empirical Measurement**: Passed in 1.49s (61 passed, 0 failed).

#### Stage 4: Production Static Build & Clean Export
- **Command**: `npm.cmd run build`
- **Prebuild Hook**: `node scripts/clean.js` (removes `.next`, `out`, `tsconfig.tsbuildinfo` in <300ms).
- **Build Hook**: `node -r ./patch-fs.js node_modules/next/dist/bin/next build`
- **Pass Criteria**:
  - Exit Code 0.
  - Static compilation succeeds: `✓ Generating static pages (4/4)` (or 2/2).
  - Production static export written to `out/`:
    - `out/index.html` (valid HTML containing AVIF and SVG preloads)
    - `out/404.html`
    - `out/_next/static/media/` (containing at least 6 `.avif` background images and 3 `.svg` project mode icons).
  - No DrvFs locking exceptions (`EPERM`, `EBUSY`, `ENOENT`).

#### Stage 5: Tier 5 Adversarial Stress & Empirical Verification
- **Command**: `node --test tests/e2e/tier5-adversarial-m1.test.mjs`
- **Test Inventory (12 Tests)**:
  1. `T5.1.1`: All 6 AVIF background files exist and possess valid ISOBMFF headers (`ftyp`, `avif`/`avis`/`mif1`).
  2. `T5.1.2`: All SVG icons exist, non-truncated, valid XML closing `</svg>` tag, valid `viewBox`.
  3. `T5.1.3`: `public/favicon.ico` exists and contains valid ICO magic bytes `0x00, 0x00, 0x01, 0x00`.
  4. `T5.1.4`: Zero `.ico` files in `src/app/` (ensures zero Windows WSL readlink EISDIR crashes).
  5. `T5.2.1`: Deterministic single-active layer invariant holds across 3,000 rapid transitions.
  6. `T5.2.2`: Extreme rapid ping-pong mode switching maintains visual continuity.
  7. `T5.2.3`: Resilience against invalid or empty mode/theme values.
  8. `T5.3.1`: HMSSO project icon dynamically switches across all 3 active modes (`tech`, `medical`, `academic`).
  9. `T5.3.2`: Full dataset project icon resolution verification for all entries in `src/data/projects.json`.
  10. `T5.3.3`: `ProjectModeIcon` handles null or missing project reference safely.
  11. `T5.4.1`: `out/index.html` exists and contains preloaded AVIF images and SVG icons.
  12. `T5.4.2`: All AVIF media emitted by Next.js static export physically exist in `out/_next/static/media/`.
- **Pass Criteria**: Exit Code 0, 12 passed, 0 failed.

---

### 3.3 One-Line Verification Command Suite

For automated CI/CD and terminal execution:

```powershell
npm.cmd run typecheck && npm.cmd run lint && node tests/e2e/runner.mjs && npm.cmd run build && node --test tests/e2e/tier5-adversarial-m1.test.mjs
```

---

## 4. Empirical Test Matrix

| Stage | Command | Target / Scope | Expected Exit Code | Current Measured Status | Notes |
|-------|---------|----------------|--------------------|-------------------------|-------|
| 1 | `npm.cmd run typecheck` | TypeScript Compiler | 0 | **PASSED (0)** | Zero TS errors across all source files |
| 2 | `npm.cmd run lint` | ESLint CLI / Next Lint | 0 | **PASSED (0)** | Zero errors; 3 legacy warnings |
| 3 | `node tests/e2e/runner.mjs` | Tiers 1–4 E2E Suite | 0 | **PASSED (0)** | 61/61 tests pass in 1.49s |
| 4 | `npm.cmd run build` | Next.js Static Export | 0 | **BLOCKED (1)** | Blocked by `patch-fs.js` manifest trace handler (under fix by Explorer M1-It2-1) |
| 5 | `node --test tests/e2e/tier5-adversarial-m1.test.mjs` | Tier 5 Adversarial | 0 | **11/12 PASSED (1)** | Only `T5.4.1` failed due to missing `out/index.html` from Stage 4 |

---

## 5. Downstream Worker Implementation Checklist

For Worker M1-It2:
1. Apply the diff in `src/components/achievements.tsx:140` (`shrink-0 sm:shrink`) and `achievements.tsx:130` (`sm:overflow-visible`).
2. Integrate Explorer M1-It2-1's `patch-fs.js` manifest fix (`DEFAULT_PAGES_MANIFEST = '{}'` and `.nft.json` / `app-paths-manifest.json` safe fallback).
3. Execute the 5-stage verification suite:
   ```powershell
   npm.cmd run typecheck
   npm.cmd run lint
   node tests/e2e/runner.mjs
   npm.cmd run build
   node --test tests/e2e/tier5-adversarial-m1.test.mjs
   ```
4. Verify all 5 stages return Exit Code 0 and Tier 5 passes 12/12.
