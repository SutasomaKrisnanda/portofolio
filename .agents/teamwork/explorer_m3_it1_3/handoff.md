# Handoff Report — Explorer 3 (Milestone 3 Iteration 1)

**Task**: Investigation of Requirement R6 (Accessible Radix UI Tooltips on all interactive buttons) and Milestone 3 E2E Test Suite Assertions  
**Date**: 2026-11-06T01:55:00Z  
**Author**: `explorer_m3_it1_3`  
**Recipient**: `orchestrator` (`cf0729e3-f061-40d9-8bb8-ea4465cfe5a6`), `worker_m3`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

Direct observations and evidence collected from code inspection, dependency analysis, and test suite execution:

### 1.1 Tooltip Infrastructure & Package Status
- **`package.json` (line 40)**:
  ```json
  "@radix-ui/react-tooltip": "^1.1.8"
  ```
  The `@radix-ui/react-tooltip` package is installed and directly available.
- **`src/components/ui/tooltip.tsx` (lines 1–31)**:
  Exports `TooltipProvider`, `Tooltip`, `TooltipTrigger`, and `TooltipContent`.
  - Missing an ergonomic wrapper component (e.g. `ActionTooltip`), requiring repetitive 4-component boilerplate (`TooltipProvider` + `Tooltip` + `TooltipTrigger` + `TooltipContent`) at every call site.
  - `TooltipContent` currently uses `max-w` default styling without explicit text wrapping boundaries (`break-words`) or custom delay tuning for instant keyboard accessibility.
- **`src/app/layout.tsx` (lines 64–70)**:
  `ThemeProvider` and `Toaster` are mounted, but **no global `<TooltipProvider>` is configured**, which could cause unprovided Radix tooltips to warn or require duplicate local providers.

### 1.2 Interactive Button Inventory in Current Hero & Modal Components
- **`src/components/hero.tsx`**:
  1. **Primary CTA Button** (lines 163–175): `<button type="button" onClick=...>{modeConfig.hero.primaryCtaLabel}</button>`. Lacks `id="btn-cta-detail"`, `data-testid="btn-cta-detail"`, and has NO Radix `<Tooltip>` wrapper.
  2. **Download CV Link** (lines 177–185): `<a href={GLOBAL_PROFILE.cvPath} download=...>`. Lacks `id="btn-cta-cv"` and has NO Radix `<Tooltip>` wrapper.
  3. **Previous Slide Button** (lines 324–331): `<button type="button" onClick={handlePrevSlide} aria-label="Slide sebelumnya">`. Lacks `id="btn-slide-prev"` and has NO Radix `<Tooltip>` wrapper.
  4. **Next Slide Button** (lines 332–339): `<button type="button" onClick={handleNextSlide} aria-label="Slide berikutnya">`. Lacks `id="btn-slide-next"` and has NO Radix `<Tooltip>` wrapper.
  5. **Slide Indicators** (lines 258–285): Currently statically loops over `[3, 2, 1, 0]`. Lacks `id="btn-indicator-${idx}"`, does not adapt to dynamic featured project count, and has NO Radix `<Tooltip>` wrappers.
  6. **Diamond Preview Cards** (lines 220–252): Relies on native HTML `title` attribute (`title={`${slideProj.title} — Klik untuk fokus atau membuka Case Study`}`) which fails keyboard accessibility (`focus-visible` does not trigger HTML `title`). Still contains legacy `onDoubleClick`.
  7. **Bottom Shelf Navigation Buttons** (lines 293–320): "EXPLORE WORK" and shelf category buttons lack Radix tooltips.
  8. **Slide Blocks Reactive Transitions** (lines 147–159): Slide project block lacks reactive key (`key={currentHeroProject?.id}`) and animation transition classes (`transition-all duration-300 ease-out`).
  9. **Slide Filter & Reset** (lines 52–57): `heroSlides` filters without checking `p.featured: true`, slices static `(0, 4)`, and lacks an auto-reset `useEffect` setting `activeSlideIndex` to 0 on `activeMode` changes.

- **`src/components/project-modal.tsx`**:
  10. **Modal Close Button** (lines 77–84): `<button type="button" onClick={onClose} aria-label="Tutup detail studi kasus">`. Lacks Radix `<Tooltip>` wrapper.
  11. **Modal Layout Structure** (lines 62–65): The container uses `max-h-[92vh] overflow-y-auto` directly on the asymmetric rounded container (`rounded-tr-[44px] rounded-bl-[32px]`), causing scrollbar bleeding over curved corners. Lacks the required 3-tier Flexbox structure (`max-h-[90vh] overflow-hidden` outer, `flex-shrink-0` header, `flex-1 overflow-y-auto custom-scrollbar` inner body, and `flex-shrink-0 border-t` footer).
  12. **Modal Footer Buttons** (lines 218–234): "Kembali ke Galeri" and "Diskusikan Projek Ini" lack tooltips.

- **Contextual App Controls (`src/components/header.tsx` & `src/components/theme-toggle.tsx`)**:
  13. **Mode Switcher Pills** (`src/components/header.tsx` lines 112–135): Mode buttons lack accessible tooltips.
  14. **Theme Switcher** (`src/components/theme-toggle.tsx` lines 28–45): Uses HTML `title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}` rather than Radix Tooltip.
  15. **Sound Toggle**: An exhaustive grep for `sound` and `audio` across `src/` yielded no sound toggle or audio player component in the application.

### 1.3 E2E Test Suite Execution & Assertion Matrix
- Command executed: `node tests/e2e/runner.mjs`
- Result: **78 / 78 PASSED (100% pass rate, 0 failed, duration: ~1.71s, exit code 0)**.
- Distribution across tiers:
  - **Tier 1 (Feature Coverage R1–R6)**: 35 tests passed
  - **Tier 2 (Boundary & Corner Cases)**: 30 tests passed
  - **Tier 3 (Cross-Feature Combinations)**: 8 tests passed
  - **Tier 4 (Real-World Application Scenarios)**: 5 tests passed

---

## 2. Logic Chain

1. **Premise 1 (R6 Requirement)**:
   ORIGINAL_REQUEST.md § R6 specifies: *"Berikan animasi transisi dan interaktivitas visual yang halus pada setiap block di setiap slide hero-section, serta sertakan tooltip informatif pada setiap button interaktif."* Acceptance Criteria § Animasi & Tooltip states: *"Setiap tombol interaktif pada hero-section menampilkan tooltip saat di-hover maupun saat menerima fokus keyboard."*
2. **Premise 2 (Radix UI Accessibility Rules)**:
   Native HTML `title` attributes are inaccessible to keyboard users, touch devices, and screen readers. Radix UI `@radix-ui/react-tooltip` solves this by attaching WAI-ARIA compliant attributes (`aria-describedby` referencing unique content ID), emitting events on both mouse hover (`onMouseEnter`/`onMouseLeave`) and keyboard focus (`onFocus`/`onBlur`), and dismissing on Escape.
3. **Premise 3 (Ergonomics & Maintainability)**:
   Directly writing 4 Radix components (`<TooltipProvider><Tooltip><TooltipTrigger asChild><button.../></TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip></TooltipProvider>`) for 10+ buttons creates 60+ lines of repetitive JSX bloat. Creating an `ActionTooltip` helper in `src/components/ui/tooltip.tsx` encapsulates this pattern in a single tag: `<ActionTooltip label="..."> <button ... /> </ActionTooltip>`.
4. **Premise 4 (Timing and Overflow Contracts in E2E Tests)**:
   - Test **T2.6.4** mandates: `hoverDelayDuration: 200` (snappy hover feedback, not default 700ms) and `focusDelayDuration: 0` (instant display on keyboard navigation).
   - Test **T2.6.3** mandates: `max-w-xs break-words px-3 py-1.5 text-xs` preventing tooltip text from overflowing viewports on mobile/tablet.
   - Test **T2.6.5** mandates: `motion-safe:transition-all motion-reduce:transition-none` for WCAG accessibility compliance.
   - Test **T1.6.2** mandates button tracking for at least 7 interactive hero buttons: `btn-cta-detail`, `btn-cta-cv`, `btn-slide-prev`, `btn-slide-next`, `btn-indicator-0`, `btn-indicator-1`, `btn-indicator-2`.
5. **Premise 5 (Milestone 3 Cohesion — R4, R5, R6 Integration)**:
   - Tooltip labels for slide indicators and diamond cards depend directly on the dynamic JSON dataset filtered via `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))` (R4).
   - Tooltip text must dynamically update when slide index changes (T3.6: Slide Navigation + Tooltip Reactive Synchronization).
   - Slide project blocks must have reactive keys (`key={currentHeroProject?.id}`) and transition classes (`transition-all duration-300 ease-out`) so that slide changes animate smoothly (T1.6.1, T1.6.5).
   - The modal must implement the 3-tier Flexbox contract (`max-h-[90vh] overflow-hidden` outer, `flex-shrink-0` header, `flex-1 overflow-y-auto custom-scrollbar` inner, `flex-shrink-0 border-t` footer) to eliminate double scrollbars and boundary leakage (T1.5.3, T1.5.4).

---

## 3. Caveats

1. **Sound Toggle Presence**:
   The prompt mentioned checking for a "Sound toggle (if present)". Our codebase search confirmed that no audio engine, sound toggle, or audio assets currently exist in the repository. No mock or dead sound button should be added unless explicitly requested in a future user prompt.
2. **Touch Device Behavior**:
   On mobile touch devices without hovering cursors, Radix UI tooltips trigger on press/focus. Tooltips should have `pointer-events-none` on `TooltipContent` so they never intercept card taps or button clicks.
3. **SSR Hydration in Next.js App Router**:
   `TooltipProvider` and Radix tooltips require browser DOM APIs (client-side portal). Because `src/components/hero.tsx` and `src/components/project-modal.tsx` are already annotated with `'use client'`, tooltip components will hydrate without SSR mismatch.

---

## 4. Conclusion & Actionable Implementation Blueprints

### 4.1 Enhanced Tooltip Infrastructure: `src/components/ui/tooltip.tsx`
Add `ActionTooltip` to `src/components/ui/tooltip.tsx` with standard delay tuning, text boundary wrapping, and dark/light styling:

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-lg border px-3 py-1.5 text-xs shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-w-xs break-words pointer-events-none select-none",
      "bg-white/95 text-slate-900 border-slate-900/10 dark:bg-slate-900/95 dark:text-white dark:border-white/20 backdrop-blur-md",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export interface ActionTooltipProps {
  children: React.ReactNode;
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  asChild?: boolean;
}

export function ActionTooltip({
  children,
  label,
  side = "top",
  align = "center",
  sideOffset = 6,
  className,
  asChild = true
}: ActionTooltipProps) {
  if (!label) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={className}
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

### 4.2 Global / Local Tooltip Provider Setup
In `src/app/layout.tsx` (or locally wrapping `Hero` and `ProjectModal`):
```tsx
import { TooltipProvider } from '@/components/ui/tooltip';

// Wrap children with delayDuration={200} and skipDelayDuration={100}
<TooltipProvider delayDuration={200} skipDelayDuration={100}>
  {children}
</TooltipProvider>
```

### 4.3 Interactive Button Inventory & Tooltip Specification Table

| # | Button / Trigger | File & Target Selector / ID | Tooltip Text (Dynamic / Static) | Side / Placement | ARIA & Focus Specification |
|---|------------------|-----------------------------|---------------------------------|------------------|---------------------------|
| 1 | **Primary Hero CTA** | `src/components/hero.tsx`<br>`id="btn-cta-detail"` | `currentHeroProject ? `Buka Studi Kasus ${currentHeroProject.title}` : 'Jelajahi Semua Projek'` | `top` | `aria-label={...}`<br>`focus-visible:ring-2` |
| 2 | **Download CV** | `src/components/hero.tsx`<br>`id="btn-cta-cv"` | `"Unduh Curriculum Vitae (PDF)"` | `top` | `aria-label="Unduh Curriculum Vitae (PDF)"`<br>`focus-visible:ring-2` |
| 3 | **Prev Slide Button** | `src/components/hero.tsx`<br>`id="btn-slide-prev"` | `"Slide Sebelumnya"` | `top` | `aria-label="Slide sebelumnya"`<br>`focus-visible:ring-2` |
| 4 | **Next Slide Button** | `src/components/hero.tsx`<br>`id="btn-slide-next"` | `"Slide Berikutnya"` | `top` | `aria-label="Slide berikutnya"`<br>`focus-visible:ring-2` |
| 5 | **Slide Indicators** | `src/components/hero.tsx`<br>`id={`btn-indicator-${idx}`}` | `${slideProj.title} (0${idx + 1})` | `left` | `aria-label={`Pilih slide 0${idx + 1}: ${slideProj.title}`}`<br>`focus-visible:ring-2` |
| 6 | **Diamond Cards** | `src/components/hero.tsx`<br>`button.rotate-45` | `isCardActive ? `Buka Studi Kasus ${slideProj.title}` : `Tampilkan ${slideProj.title}`` | `left` | Single click opens modal when active<br>`aria-label={...}` |
| 7 | **Bottom Explore** | `src/components/hero.tsx`<br>`"EXPLORE WORK"` | `"Menuju Galeri Projek Lengkap"` | `top` | `aria-label="Jelajahi Semua Projek"` |
| 8 | **Modal Close Button** | `src/components/project-modal.tsx`<br>`button[aria-label="Tutup..."]` | `"Tutup Modal (Esc)"` | `left` | `aria-label="Tutup detail studi kasus"`<br>Escape key support |
| 9 | **Modal Kembali CTA** | `src/components/project-modal.tsx`<br>`button: "Kembali..."` | `"Tutup dan Kembali ke Galeri (Esc)"` | `top` | `aria-label="Kembali ke Galeri"` |
| 10 | **Modal Diskusikan CTA** | `src/components/project-modal.tsx`<br>`button: "Diskusikan..."` | `"Diskusikan implementasi atau kolaborasi projek ini"` | `top` | `aria-label="Diskusikan Projek Ini"` |
| 11 | **Mode Switcher Pills** | `src/components/header.tsx`<br>`role="tab"` | `"Beralih ke Mode " + tab.label` | `bottom` | `role="tab"` `aria-selected` |
| 12 | **Theme Toggle** | `src/components/theme-toggle.tsx`<br>`button` | `isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"` | `bottom` | `aria-label={...}` |

### 4.4 Slide Block Animations Specification (R6)
In `src/components/hero.tsx`, wrap project description and title blocks with a reactive key:
```tsx
<div
  key={currentHeroProject?.id || activeSlideIndex}
  className="space-y-2 lg:pl-4 text-slate-700 dark:text-white/90 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out motion-reduce:transition-none"
>
  <p className="text-xs sm:text-sm font-light leading-relaxed max-w-md">
    {modeConfig.hero.supportingDescription}
  </p>
  {currentHeroProject && (
    <p className="text-xs text-slate-600 dark:text-white/80 max-w-md line-clamp-2 pt-1 font-light border-l-2 pl-3 border-slate-400 dark:border-white/30">
      <strong className="text-slate-950 dark:text-white font-semibold tracking-wide">
        Projek Terpilih:
      </strong>{' '}
      {currentHeroProject.title}
    </p>
  )}
</div>
```

### 4.5 Exact Checklist of Milestone 3 E2E Test Suite Requirements

1. **R4 E2E Test Assertions**:
   - `featuredHeroProjects = projects.filter(p => p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode)))` (T1.4.1)
   - Dynamic indicators count equals `featuredHeroProjects.length` (T1.4.2)
   - Cyclic index math: Next wraps to 0 at end; Prev wraps to `length - 1` at 0 (T1.4.3, T1.4.4)
   - `useEffect(() => { setActiveSlideIndex(0); }, [activeMode]);` auto-resets on mode change (T1.4.5, T3.2)
   - Slide index clamps safely when dataset is empty or index is out of bounds (T2.4.1 - T2.4.5)

2. **R5 E2E Test Assertions**:
   - Single-click on active card opens modal (`onOpenProject(slideProj)`) (T1.5.1)
   - Single-click on CTA button opens modal (`onOpenProject(currentHeroProject)`) (T1.5.2)
   - 3-tier Flexbox structure:
     - Outer: `flex flex-col max-h-[90vh] overflow-hidden` (T1.5.3)
     - Header: `flex-shrink-0 sticky top-0` (T1.5.3)
     - Body: `flex-1 overflow-y-auto custom-scrollbar` (T1.5.3, T1.5.4)
     - Footer: `flex-shrink-0 border-t` (T1.5.3)
   - Escape key closes modal (T2.5.1)
   - Backdrop click closes modal, body click does not (T2.5.2)
   - Modal open blocks background keyboard navigation (T3.5)

3. **R6 E2E Test Assertions**:
   - Slide blocks carry reactive transition keys (`key={currentHeroProject?.id}`) (T1.6.1)
   - All 7 interactive buttons tracked: `btn-cta-detail`, `btn-cta-cv`, `btn-slide-prev`, `btn-slide-next`, `btn-indicator-0`, `btn-indicator-1`, `btn-indicator-2` (T1.6.2)
   - Tooltips show on hover and keyboard focus (`focus-visible`) (T1.6.3, T1.6.4)
   - Micro-interaction classes: `transition-all duration-300 ease-out` (T1.6.5)
   - Tooltip text boundary: `max-w-xs break-words px-3 py-1.5 text-xs` (T2.6.3)
   - Tooltip timing: `delayDuration: 200`, instant focus (T2.6.4)
   - Reduced motion compliance: `motion-reduce:transition-none` (T2.6.5)

---

## 5. Verification Method

To verify these findings and implementations:

1. **E2E Test Runner Verification**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected outcome*: 78/78 tests pass with exit code `0`.

2. **Targeted Tier 1 & Boundary Verification**:
   ```powershell
   node tests/e2e/runner.mjs --tier 1
   node tests/e2e/runner.mjs --tier 2
   node tests/e2e/runner.mjs --filter "Tooltip"
   ```

3. **TypeScript Typecheck**:
   ```powershell
   npm run typecheck
   ```
   *Expected outcome*: 0 TypeScript errors.

4. **Next.js Production Build**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Successful static export compilation to `out/`.
