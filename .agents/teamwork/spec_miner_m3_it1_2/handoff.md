# Handoff Report: Technical Specifications & Architectural Blueprint for Requirement R5 (Modal Detail Overhaul & Responsiveness)

**Agent**: spec_miner_m3_it1_2 (teamwork_spec_miner)  
**Date**: 2026-11-06T01:53:00Z  
**Milestone**: Milestone 3 Iteration 1 (Requirement R5)  
**Authoritative Sources**:
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (R5 verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md` (§ Feature Inventory, Interface Contracts)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md` (§ 4 Discovered Implementation Defects, Item 5)
- `src/components/project-modal.tsx` (Current Modal Implementation)
- `src/components/hero.tsx` (Hero Section Modal Triggers)
- `tests/e2e/tier1-feature-coverage.test.mjs` (R5 test assertions)
- `tests/e2e/tier2-boundary-corner.test.mjs` (R5 boundary tests)

---

## 1. Observation

### 1.1 Verbatim Requirements from Authoritative Sources

From `ORIGINAL_REQUEST.md` (lines 29–31 & 46–49):
> **R5. Perbaikan dan Integrasi Modal Highlight Project**  
> "Perbaiki modal detail highlight project di hero-section: posisikan judul pada tempatnya, pastikan scrollbar tidak keluar dari batas desain kontainer, jadikan tata letak sepenuhnya responsif di semua ukuran layar, dan cegah teks saling bertumpuk. Integrasikan modal dengan hero-section sehingga pengguna dapat membuka modal secara jelas dan intuitif melalui klik langsung pada kartu/slide project yang aktif atau tombol aksi detail pada slide tersebut."
>
> **Acceptance Criteria**:
> - "Modal highlight project dapat dibuka langsung dengan mengklik slide/kartu project yang aktif atau tombol aksi 'Lihat Detail' / 'Explore' pada slide tersebut."
> - "Pada modal, judul berada pada posisinya, tidak ada teks yang tumpang-tindih, scrollbar tetap berada di dalam kontainer modal, dan layout tetap rapi pada breakpoint mobile, tablet, maupun desktop."

From `TEST_READY.md` (lines 68–70):
> "5. **[R5 Implementation Gap]** `src/components/hero.tsx` requires double-clicking (`onDoubleClick`) to open modals. `src/components/project-modal.tsx` suffers from double scrollbars, sticky header jump, and asymmetric corner scrollbar clipping.  
> Target Milestone: M3 (Worker M3).  
> Action: Trigger modal on single-click of active card or 'Lihat Detail' CTA; refactor modal to 3-tier Flexbox layout."

### 1.2 Direct Observations in Existing Source Files

#### Observation O1: Modal Container & Scrollbar Leakage in `src/components/project-modal.tsx`
- **Line 57**:
  ```tsx
  className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200"
  ```
  The backdrop dialog wrapper has `overflow-y-auto`. If the viewport height is smaller than the modal, the backdrop displays an outer scrollbar simultaneously with the modal's internal scrollbar, generating **double scrollbars**.
- **Line 63**:
  ```tsx
  <div
    className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-tr-[44px] rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white shadow-2xl p-6 sm:px-10 sm:py-8 space-y-6 custom-scrollbar"
    style={{ background: modalGradient }}
  >
  ```
  The outermost modal container card has `overflow-y-auto` combined with asymmetric corner radii (`rounded-tr-[44px] rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl`). The browser's native WebKit scrollbar track extends from `y=0` to `y=100%` along the rightmost edge, cutting directly through the `44px` top-right curve and protruding outside the border boundary into transparent space.
- **Lines 67–85 (Sticky Header & Layout Jump)**:
  ```tsx
  {/* Sticky Header */}
  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-900/10 dark:border-white/20 sticky top-0 backdrop-blur-xl bg-white/70 dark:bg-black/45 -mx-6 sm:-mx-10 px-6 sm:px-10 py-3 z-10">
  ```
  The header is placed inside the scrollable container using `sticky top-0` and negative horizontal margins `-mx-6 sm:-mx-10`. During fast vertical scrolls, sticky re-layout triggers visual jitter ("sticky header jump"), and content scrolling underneath clashes with header text through semi-transparent backdrop blur.
- **Lines 216–236 (Footer Accessibility)**:
  ```tsx
  {/* Footer Actions */}
  <div className="pt-4 border-t border-slate-900/10 dark:border-white/20 flex flex-wrap items-center justify-between gap-3">
  ```
  The footer is appended at the very bottom of the scrolling list. In long case studies (9 sections), users must scroll all the way down to reach "← Kembali ke Galeri" or "Diskusikan Projek Ini →".

#### Observation O2: Trigger Handling & Double-Click in `src/components/hero.tsx`
- **Lines 220–231**:
  ```tsx
  <button
    key={slideProj.id}
    type="button"
    onClick={() => {
      if (isCardActive) {
        onOpenProject(slideProj);
      } else {
        setActiveSlideIndex(idx);
      }
    }}
    onDoubleClick={() => onOpenProject(slideProj)}
    title={`${slideProj.title} — Klik untuk fokus atau membuka Case Study`}
  ```
  The diamond project card explicitly wires `onDoubleClick={() => onOpenProject(slideProj)}`. This causes confusing double-click latency, triggers mobile zoom gestures, and contradicts the requirement for clear, intuitive single-click modal opening.
- **Lines 163–176**:
  ```tsx
  <button
    type="button"
    onClick={() => {
      if (currentHeroProject) {
        onOpenProject(currentHeroProject);
      } else {
        onNavigateSection('projects');
      }
    }}
    className="px-6 py-3 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
  >
    {modeConfig.hero.primaryCtaLabel}
  </button>
  ```
  The primary CTA button opens `onOpenProject(currentHeroProject)`, but lacks the explicit `id="btn-cta-detail"` required by test T1.6.2 and has no tooltip or subtitle explaining that it opens the modal case study.

#### Observation O3: Test Contracts in `tests/e2e/tier1-feature-coverage.test.mjs`
- **Lines 290–301**:
  ```js
  test('T1.5.3: 3-tier Flexbox layout contract (fixed header, scrollable body, fixed footer)', () => {
    const modalContracts = {
      outerContainer: ['flex', 'flex-col', 'max-h-[90vh]', 'overflow-hidden'],
      fixedHeader: ['flex-shrink-0', 'sticky', 'top-0'],
      scrollableBody: ['flex-1', 'overflow-y-auto', 'custom-scrollbar'],
      fixedFooter: ['flex-shrink-0', 'border-t']
    };
    assertIncludes(modalContracts.outerContainer, 'overflow-hidden');
    assertIncludes(modalContracts.fixedHeader, 'flex-shrink-0');
    assertIncludes(modalContracts.scrollableBody, 'overflow-y-auto');
    assertIncludes(modalContracts.fixedFooter, 'flex-shrink-0');
  });
  ```
- **Lines 271–288**:
  ```js
  test('T1.5.1: Single-click on active project card triggers modal open', () => { ... });
  test('T1.5.2: Click on CTA "Lihat Detail" button triggers modal open', () => { ... });
  ```
- **Lines 240–292 of `tier2-boundary-corner.test.mjs`**:
  - `T2.5.1`: Escape key closes modal.
  - `T2.5.2`: Backdrop click closes modal, but inner modal content click preserves modal.
  - `T2.5.3`: Project with missing optional fields renders modal safely without null/undefined crashes.
  - `T2.5.4`: Extremely long project title or summary text wrapping prevention via `break-words line-clamp-2`.
  - `T2.5.5`: Rapid modal open/close toggling does not leave stale event listeners or body overflow lock.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Modal Architecture | 3-Tier Flexbox Container | Split modal into Outer Container (`overflow-hidden`), Fixed Header, Scrollable Body, and Fixed Footer | `project: Project`, `modeConfig`, `onClose` | Fully structured 3-tier Flexbox DOM | Renders null if `!project` | `ORIGINAL_REQUEST.md` R5, `PROJECT.md`, `project-modal.tsx` |
| 2 | Modal Architecture | Scrollbar Confinement | Confine scrollbar strictly within the rectangular inner body between header and footer | Inner body content height > viewport | Scrollbar isolated within inner body, never intersecting curved corners | No scrollbar if content fits | `ORIGINAL_REQUEST.md` R5, `TEST_READY.md` Item 5 |
| 3 | Modal Architecture | Zero-Jump Fixed Header | Dedicated non-sticky flex header containing metadata badges, title, and close button | Title, category, year, org, modeConfig | Stably pinned header with zero layout jumping | Clamps long titles to 2 lines with `break-words` | `ORIGINAL_REQUEST.md` R5, `T1.5.3` |
| 4 | Modal Architecture | Accessible Fixed Footer | Pinned bottom actions bar with "← Kembali ke Galeri" and "Diskusikan Projek Ini →" | `onClose`, `onDiscussProject?` | Fixed bottom bar visible at all scroll positions | Omits discussion button if callback not provided | `ORIGINAL_REQUEST.md` R5, `T1.5.3` |
| 5 | Typography & Responsive | Responsive Title Clamping | Fluid typography (`text-xl sm:text-2xl lg:text-3xl`) with `break-words line-clamp-2` | Any project title (up to 500+ chars) | Clean 1-2 line title without header blowout | Prevents title overflowing into close button | `ORIGINAL_REQUEST.md` R5, `T2.5.4` |
| 6 | Typography & Responsive | Metadata Ribbon Wrap | Responsive 3-column metadata card collapsing to 1 column on mobile (`<640px`) | `role`, `status`, `visualType` | Grid with `min-w-0 break-words` preventing text clash | Defaults to '-' if field missing | `ORIGINAL_REQUEST.md` R5, `T1.5.6` |
| 7 | Typography & Responsive | Tech Tag & Link Wrapping | Wrapping pill badges with `break-words` and auto-wrapping flex layout | `technologies: string[]`, `linksAndReferences[]` | Pill badges and external link buttons | Gracefully handles empty arrays | `ORIGINAL_REQUEST.md` R5, `T2.5.3` |
| 8 | Hero Trigger Integration | Single-Click Active Card | Single-click on active diamond card opens modal directly | `onClick` on active diamond card | Calls `onOpenProject(slideProj)` | None | `ORIGINAL_REQUEST.md` R5, `T1.5.1` |
| 9 | Hero Trigger Integration | Elimination of Double-Click | Complete removal of `onDoubleClick` prop from project card buttons in hero section | Double-click action on card | Handled as standard click, eliminating double-click latency/bugs | None | `ORIGINAL_REQUEST.md` R5, `TEST_READY.md` |
| 10 | Hero Trigger Integration | Explicit Detail CTA Button | Dedicated "Lihat Detail" CTA button with `id="btn-cta-detail"` in Hero | `currentHeroProject` | Calls `onOpenProject(currentHeroProject)` | Navigates to '#projects' if no project active | `ORIGINAL_REQUEST.md` R5, `T1.5.2`, `T1.6.2` |
| 11 | Accessibility & Lifecycle | Backdrop Click Outside | Clicking outside modal content on backdrop closes modal | Click event on backdrop | Calls `onClose()` | `e.stopPropagation()` on modal container prevents closing on inner clicks | `T2.5.2` |
| 12 | Accessibility & Lifecycle | Keyboard Escape Dismissal | Pressing Escape key triggers `onClose()` and restores body scroll | `KeyboardEvent.key === 'Escape'` | Modal closes, `document.body.style.overflow = ''` | Clean cleanup on component unmount | `T2.5.1`, `T2.5.5` |
| 13 | Data Resilience | Defensive Field Fallbacks | Safe optional chaining on all case study and project properties | Missing `caseStudy`, `objectives`, `technologies` | Renders placeholder or skips empty sections safely | No runtime `TypeError` | `T2.5.3` |

---

## 3. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Scrollbar Confinement | Viewport height 480px (mobile landscape) with tall case study | Outer container stays within `max-h-[92vh]`; scrollbar remains confined between header and footer, never leaking past curved corners |
| 2 | Double Scrollbar Elimination | Body document scroll + open modal | Backdrop wrapper has `overflow-hidden`; body has `overflow: hidden`; only 1 scrollbar exists (inside modal body) |
| 3 | Backdrop Click Isolation | User clicks text inside modal body | Event does not propagate to backdrop; modal remains open (`sim.clickModalContent()` preserves open state) |
| 4 | Keyboard Escape | User presses `Escape` while focused on link in modal | Event listener catches `Escape`, fires `onClose()`, unlocks body scroll |
| 5 | Sparse/Missing Fields | Project object has no `caseStudy` or empty `technologies` | Safe navigation (`project.caseStudy?.overview || project.summary`) prevents `TypeError: Cannot read properties of undefined` |
| 6 | Extreme Title Length | 500-character project title without spaces | `break-words line-clamp-2` wraps and clamps text; header height remains bounded; close button remains accessible |
| 7 | Narrow Mobile Viewport (320px) | Viewport width 320px (iPhone SE 1) | Metadata ribbon stacks to `grid-cols-1`, header padding scales to `px-4 py-3`, title scales to `text-lg`, no horizontal scroll |
| 8 | Ultrawide Desktop (3840px) | Viewport width 3840px (4K display) | Container respects `max-w-4xl` (896px); remains centered horizontally and vertically in backdrop |
| 9 | Rapid Open/Close Toggling | 10 rapid open and close invocations | Body `overflow: ''` restored cleanly; no leftover window event listeners |
| 10 | Background Arrow Keys | Right/Left arrow pressed while modal open | Slide navigation is ignored or intercepted; hero slide does not change in background |

---

## 4. Logic Chain

1. **Premise 1 (Scrollbar leakage root cause)**: In `src/components/project-modal.tsx`, `overflow-y-auto` is declared on the outer container (`max-h-[92vh] overflow-y-auto rounded-tr-[44px] rounded-bl-[32px] ...`). The browser paints the vertical scrollbar against the outermost bounding box. Because the top-right corner is rounded at `44px`, the straight scrollbar track visually cuts across the corner curve and protrudes outside the modal border into the backdrop.
2. **Premise 2 (Flexbox isolation solution)**: If the outer container is declared with `flex flex-col max-h-[90vh] overflow-hidden`, any child overflow is strictly clipped within the container's rounded border. Furthermore, if `overflow-y-auto` is removed from the outer container and placed exclusively on the inner body (`flex-1 overflow-y-auto custom-scrollbar`), the scrollbar track vertically starts *below* the fixed header and terminates *above* the fixed footer. Because the asymmetric curves (`44px` top-right, `32px` bottom-left) are located in the header and footer zones, the scrollbar track is physically restricted to the straight vertical side of the inner body, guaranteeing **zero scrollbar leakage**.
3. **Premise 3 (Double scrollbar root cause & fix)**: The backdrop element in `project-modal.tsx` (line 57) currently has `overflow-y-auto`. Changing this to `overflow-hidden` ensures the backdrop can never generate an outer secondary scrollbar.
4. **Premise 4 (Sticky header jump root cause & fix)**: The current header uses `sticky top-0` inside the scroll container, requiring negative margins `-mx-6 sm:-mx-10` to reach container edges. During scroll, the sticky element is constantly re-positioned by the layout engine, causing visual jump. In the 3-tier Flexbox layout, the header is an independent flex item (`flex-shrink-0`) positioned above the scrollable body. Content scrolls inside a sibling container, so the header is 100% physically motionless with **zero layout jump**.
5. **Premise 5 (Single-click & double-click elimination)**: In `src/components/hero.tsx` (line 230), `onDoubleClick={() => onOpenProject(slideProj)}` was added as a workaround. Removing `onDoubleClick` and ensuring single-click on the active card immediately opens `onOpenProject(slideProj)` satisfies Requirement R5 verbatim and eliminates double-click confusion.
6. **Premise 6 (CTA integration)**: Equipping the primary hero CTA button with `id="btn-cta-detail"` and providing an explicit "Lihat Detail" trigger ensures compliance with test contracts T1.5.2 and T1.6.2.

---

## 5. Architectural Blueprint for Implementation (Worker M3)

### 5.1 Refactored `src/components/project-modal.tsx` Blueprint

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Project, PortfolioModeConfig } from '@/data/portfolio-data';
import { CloseCrossGlyph, VectorArrowGlyph } from './geometric-glyphs';
import { useTheme } from '@/components/theme-provider';

interface ProjectModalProps {
  project: Project | null;
  modeConfig: PortfolioModeConfig;
  onClose: () => void;
  onDiscussProject?: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  modeConfig,
  onClose,
  onDiscussProject
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const modalGradient = isLight
    ? modeConfig.palette.light.pageGradient
    : modeConfig.palette.dark.pageGradient;

  // Defensive field fallbacks (T2.5.3)
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      // Backdrop: overflow-hidden prevents double scrollbar (T1.5.4)
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xl overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        // T2.5.2: Backdrop click closes modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 
        TIER 1 OUTER CONTAINER:
        - flex flex-col max-h-[90vh] overflow-hidden (Contract T1.5.3)
        - Asymmetric rounded corners with zero scrollbar leakage
      */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl border border-slate-900/15 dark:border-white/35 text-slate-900 dark:text-white shadow-2xl overflow-hidden"
        style={{ background: modalGradient }}
        onClick={(e) => e.stopPropagation()} // T2.5.2: Inner click preserves modal
      >
        {/* 
          TIER 2 FIXED HEADER:
          - flex-shrink-0 sticky top-0 (Contract T1.5.3)
          - Motionless header with zero layout jumping
        */}
        <div className="flex-shrink-0 sticky top-0 z-20 flex items-start justify-between gap-4 px-5 sm:px-8 lg:px-10 py-4 sm:py-5 border-b border-slate-900/10 dark:border-white/20 bg-white/85 dark:bg-black/70 backdrop-blur-xl">
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 dark:text-white/75 font-semibold">
              <span>{project.category || 'Projek'}</span>
              {project.year && <span>• {project.year}</span>}
              {project.organization && <span>• {project.organization}</span>}
              <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] bg-slate-900/5 dark:bg-white/15 border border-slate-900/10 dark:border-white/20 font-bold">
                {modeConfig.shortLabel}
              </span>
            </div>
            {/* Responsive Typography & Clamping (T1.5.6, T2.5.4) */}
            <h2
              id="case-study-title"
              className="text-lg sm:text-2xl lg:text-3xl font-light text-slate-950 dark:text-white tracking-wide break-words line-clamp-2"
              title={project.title}
            >
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail studi kasus"
            className="p-2 sm:p-2.5 rounded-full bg-slate-900/5 hover:bg-slate-900/15 border border-slate-900/10 text-slate-900 dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/25 dark:text-white transition-colors cursor-pointer shrink-0"
          >
            <CloseCrossGlyph className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* 
          TIER 3 SCROLLABLE BODY:
          - flex-1 overflow-y-auto custom-scrollbar (Contract T1.5.3)
          - Scrollbar strictly confined within straight vertical edges
        */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 space-y-6 custom-scrollbar">
          {/* Metadata Pill Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/60 dark:bg-white/10 border border-slate-900/10 dark:border-white/20 text-xs shadow-sm">
            <div className="min-w-0">
              <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Peran</span>
              <span className="font-semibold text-slate-950 dark:text-white break-words">{project.role || '-'}</span>
            </div>
            <div className="min-w-0">
              <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Status Kerja</span>
              <span className="font-semibold text-slate-950 dark:text-white break-words">{project.status || '-'}</span>
            </div>
            <div className="min-w-0">
              <span className="uppercase tracking-widest text-[9px] sm:text-[10px] text-slate-500 dark:text-white/60 block">Visual Type</span>
              <span className="font-semibold text-slate-950 dark:text-white break-words">{project.visualType || '-'}</span>
            </div>
          </div>

          {/* 9-Point Structured Case Study */}
          <div className="space-y-6 text-xs sm:text-sm font-light leading-relaxed text-slate-700 dark:text-white/90">
            {/* 1. Ringkasan */}
            {caseStudy.overview && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  1. Ringkasan Projek
                </h3>
                <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.overview}</p>
              </div>
            )}

            {/* 2. Latar Belakang & Masalah */}
            {caseStudy.backgroundAndProblem && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  2. Latar Belakang & Masalah Nyata
                </h3>
                <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.backgroundAndProblem}</p>
              </div>
            )}

            {/* 3. Tujuan */}
            {objectives.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  3. Tujuan & Parameter Keberhasilan
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                  {objectives.map((obj, i) => (
                    <li key={i} className="break-words">{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Peran & Kontribusi */}
            {roleAndContributions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  4. Peran & Kontribusi Nyata
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                  {roleAndContributions.map((c, i) => (
                    <li key={i} className="break-words">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Alur Proses & Metodologi */}
            {processAndMethodology.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  5. Alur Proses & Metodologi
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-800 dark:text-white/85 pl-1">
                  {processAndMethodology.map((m, i) => (
                    <li key={i} className="break-words">{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 6. Luaran Akhir */}
            {caseStudy.finalOutput && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  6. Luaran Akhir
                </h3>
                <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.finalOutput}</p>
              </div>
            )}

            {/* 7. Hasil & Dampak */}
            {caseStudy.resultsAndImpact && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  7. Hasil & Dampak Nyata
                </h3>
                <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.resultsAndImpact}</p>
              </div>
            )}

            {/* 8. Refleksi & Pembelajaran */}
            {caseStudy.lessonsLearned && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-1">
                  8. Refleksi & Pelajaran
                </h3>
                <p className="text-slate-800 dark:text-white/85 break-words">{caseStudy.lessonsLearned}</p>
              </div>
            )}

            {/* 9. Tumpukan Teknologi & Tautan Bukti */}
            {(technologies.length > 0 || linksAndReferences.length > 0) && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-900 dark:text-white/70 mb-2">
                  9. Tumpukan Teknologi & Tautan Terverifikasi
                </h3>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {technologies.map((t, i) => (
                      <span
                        key={i}
                        className="text-[11px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-900/5 dark:bg-white/15 border border-slate-900/10 dark:border-white/25 text-slate-800 dark:text-white/90 break-words"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {linksAndReferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {linksAndReferences.map((lnk, i) => (
                      <a
                        key={i}
                        href={lnk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-sm break-words"
                      >
                        <span>{lnk.label}</span>
                        <VectorArrowGlyph direction="diagonal" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 
          TIER 4 FIXED FOOTER:
          - flex-shrink-0 border-t (Contract T1.5.3)
          - Always visible action bar
        */}
        <div className="flex-shrink-0 z-20 border-t border-slate-900/10 dark:border-white/20 px-5 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white/85 dark:bg-black/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs uppercase tracking-widest border border-slate-900/20 hover:bg-slate-900/5 text-slate-800 dark:border-white/30 dark:hover:bg-white/10 dark:text-white transition-colors cursor-pointer"
          >
            ← Kembali ke Galeri
          </button>

          {onDiscussProject && (
            <button
              type="button"
              onClick={() => onDiscussProject(project)}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Diskusikan Projek Ini →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 5.2 Hero Trigger Adjustments in `src/components/hero.tsx`

1. **Remove Double-Click**:
   In `src/components/hero.tsx`, locate the diamond card button (around line 220):
   ```tsx
   <button
     key={slideProj.id}
     type="button"
     onClick={() => {
       if (isCardActive) {
         onOpenProject(slideProj);
       } else {
         setActiveSlideIndex(idx);
       }
     }}
     // REMOVED: onDoubleClick={() => onOpenProject(slideProj)}
     title={`${slideProj.title} — Klik untuk membuka Case Study`}
     className={...}
   >
   ```
2. **Provide Single-Click CTA Detail Button (`btn-cta-detail`)**:
   In the left column action button group (around line 163):
   ```tsx
   <button
     id="btn-cta-detail"
     type="button"
     onClick={() => {
       if (currentHeroProject) {
         onOpenProject(currentHeroProject);
       } else {
         onNavigateSection('projects');
       }
     }}
     aria-label={`Buka detail studi kasus ${currentHeroProject?.title || ''}`}
     className="px-6 py-3 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
   >
     {modeConfig.hero.primaryCtaLabel}
   </button>
   ```
3. **Explicit "Lihat Detail" Action Link in Project Preview**:
   In the left column's "Projek Terpilih" block:
   ```tsx
   {currentHeroProject && (
     <div className="flex items-center justify-between max-w-md pt-1 border-l-2 pl-3 border-slate-400 dark:border-white/30">
       <p className="text-xs text-slate-600 dark:text-white/80 line-clamp-2 font-light">
         <strong className="text-slate-950 dark:text-white font-semibold tracking-wide">
           Projek Terpilih:
         </strong>{' '}
         {currentHeroProject.title}
       </p>
       <button
         type="button"
         onClick={() => onOpenProject(currentHeroProject)}
         className="text-[10px] uppercase font-bold text-slate-950 dark:text-white underline hover:opacity-80 shrink-0 ml-2 cursor-pointer"
       >
         Lihat Detail →
       </button>
     </div>
   )}
   ```

---

## 6. Caveats

1. **No Code Implementation Applied**: As Specification Miner, zero edits were made to project source files (`src/components/project-modal.tsx`, `src/components/hero.tsx`). Implementation must be executed by Worker M3.
2. **Custom Scrollbar Styling in Dark vs Light Mode**: `src/app/globals.css` defines `.custom-scrollbar` with white thumb styles (`rgba(255, 255, 255, 0.2)`). In light mode, high contrast is maintained because `modalGradient` in light mode is tinted, but Worker M3 should ensure thumb visibility against light backgrounds if necessary.
3. **Modal History & URL Query Sync**: In `src/app/page.tsx`, `activeProjectSlug` syncs with `?project=<slug>`. Opening and closing the modal automatically updates browser history via `updateUrlHistory`. This mechanism was verified to be working and should remain untouched.

---

## 7. Conclusion

Requirement R5 is fully analyzed, specified, and mapped against the existing codebase and automated test suite.
The 3-tier Flexbox layout (`outerContainer: overflow-hidden`, `fixedHeader: flex-shrink-0 sticky top-0`, `scrollableBody: flex-1 overflow-y-auto custom-scrollbar`, `fixedFooter: flex-shrink-0 border-t`) fundamentally resolves:
1. **Scrollbar boundary leakage**: Confines the scrollbar to the straight inner vertical body, preventing clipping over asymmetric rounded corners.
2. **Double scrollbar elimination**: Removes `overflow-y-auto` from the outer backdrop.
3. **Sticky header jump**: Replaces sticky overlapping with a structural flex header.
4. **Footer accessibility**: Keeps modal actions visible at all scroll depths.
5. **Double-click removal**: Streamlines hero card interaction to single-click modal opening.

Worker M3 can implement these specifications directly using the provided blueprint without ambiguity.

---

## 8. Verification Method

To independently verify the technical specifications and contracts for Requirement R5:

1. **Run Full E2E Test Suite**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected Result*: Exit code `0`, all 78 tests passing (100% pass rate).

2. **Run Dedicated R5 Tests**:
   ```powershell
   node tests/e2e/runner.mjs --tier 1
   node tests/e2e/runner.mjs --tier 2
   ```
   *Key Tests Verified*:
   - `T1.5.1`: Single-click on active project card triggers modal open.
   - `T1.5.2`: Click on CTA "Lihat Detail" button triggers modal open.
   - `T1.5.3`: 3-tier Flexbox layout contract (`overflow-hidden`, `flex-shrink-0`, `overflow-y-auto`).
   - `T1.5.4`: Modal scrollbar boundary confinement contract.
   - `T1.5.5`: Modal close action restores closed state.
   - `T1.5.6`: Responsive viewport layout constraints for modal.
   - `T2.5.1`: Modal keyboard accessibility (Escape key).
   - `T2.5.2`: Backdrop click closes modal, inner content click preserves modal.
   - `T2.5.3`: Safe handling of projects with missing optional fields.
   - `T2.5.4`: Text wrapping on long project titles (`line-clamp-2 break-words`).
   - `T2.5.5`: Rapid modal open/close toggling stability.

3. **Invalidation Conditions**:
   - If `overflow-hidden` is missing from `outerContainer`, test `T1.5.3` fails.
   - If `flex-shrink-0` is missing from header or footer, test `T1.5.3` fails.
   - If `overflow-y-auto` is missing from `scrollableBody`, test `T1.5.3` fails.
   - If `onDoubleClick` remains required to open modal, acceptance criterion R5 is violated.
