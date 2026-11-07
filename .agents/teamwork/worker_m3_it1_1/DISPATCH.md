# Dispatch to Worker M3 (Milestone 3 Iteration 1)

## Identity
- Archetype: teamwork_worker
- Working Directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m3_it1_1\

## Mission & Objective
Implement Milestone 3: Dynamic Project Navigation, Modal Refactor, Animations & Tooltips (Requirements R4, R5, R6).
Specifically:
1. **Requirement R4 (Dataset JSON Highlight Navigation)**:
   - In `src/components/hero.tsx`:
     - Filter projects using: `projects.filter(p => Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode)))`.
     - Remove static hardcoded `[3, 2, 1, 0]` buttons.
     - Render dynamic indicators matching `heroSlides.length` with `id={`btn-indicator-${idx}`}` and `data-testid={`btn-indicator-${idx}`}`.
     - Auto-reset slide index to 0 whenever `activeMode` changes: `useEffect(() => { setActiveSlideIndex(0); }, [activeMode]);`.
2. **Requirement R5 (3-Tier Flexbox Modal Refactor & Single-Click Trigger)**:
   - In `src/components/project-modal.tsx`:
     - Overhaul to 3-tier Flexbox layout:
       - Outer container: `flex flex-col max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl`.
       - Fixed Header: `flex-shrink-0 sticky top-0 z-20` (title clamping, mode badges, close button, zero layout jump).
       - Scrollable Body: `flex-1 overflow-y-auto px-6 py-6 custom-scrollbar` (scrollbar confined strictly within inner body, zero border-radius leakage).
       - Fixed Footer: `flex-shrink-0 border-t border-white/10 bg-slate-900/95 px-6 py-4 backdrop-blur-md` with action buttons.
       - Responsive typography and defensive fallbacks on sparse fields.
   - In `src/components/hero.tsx`:
     - Single-click on active diamond card opens modal. Remove `onDoubleClick`.
     - Add `id="btn-cta-detail"` to primary CTA button ("Lihat Detail") opening modal for `currentHeroProject`.
     - Add `id="btn-cta-cv"` to CV download button.
3. **Requirement R6 (Slide Block Animations & Accessible Radix Tooltips)**:
   - In `src/components/hero.tsx`:
     - Add `key={currentHeroProject?.id}` and Tailwind CSS `animate-in fade-in slide-in-from-left-3 duration-500 motion-safe:transition-all motion-reduce:transition-none` to slide content block.
     - Add `id="btn-slide-prev"` and `id="btn-slide-next"` to slide navigation buttons.
     - Equip interactive buttons with Radix `<Tooltip>` (`btn-cta-detail`, `btn-cta-cv`, `btn-slide-prev`, `btn-slide-next`, slide indicators, diamond cards, modal close button).
4. **Verifications**:
   - Run `node tests/e2e/runner.mjs` (must pass 78/78).
   - Run `npm.cmd run typecheck` (must pass with 0 errors).
   - Run `npm.cmd run build` (must export static site successfully).

## Write Ownership
You exclusively own:
- `src/components/hero.tsx`
- `src/components/project-modal.tsx`
- `src/components/ui/tooltip.tsx`

## Mandatory Inputs to Read
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\handoff.md` and `proposed_hero.tsx`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\handoff.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_3\handoff.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output Requirements
Document all changes, build outputs, and test results in:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m3_it1_1\handoff.md`
When complete, send a message to orchestrator with your summary and handoff path.

## 2026-11-06T01:55:20Z
Received dispatch message: Implement Milestone 3 (R4, R5, R6)

