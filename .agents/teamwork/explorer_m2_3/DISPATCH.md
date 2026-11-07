# Dispatch: Explorer 3 for Milestone 2 (Canvas Integration & Lifecycle)

## Identity & Role
- **Agent Type**: `teamwork_explorer`
- **Role**: Canvas Component Architecture, SSR Lifecycle & E2E Test Alignment Explorer
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m2_3\`
- **Parent Conversation ID**: `f9cf2612-76b9-4d87-9390-7f9e3bb866f5`

## Mandatory Input Files
You MUST read these files completely before beginning your investigation:
1. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (Authoritative user requirements § R2)
2. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md` (Global Architecture & Milestones § M2)
3. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md` (E2E Test Specifications for R2)
4. Existing canvas component: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\src\components\crystal-canvas.tsx`
5. Hero section component: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\src\components\hero.tsx`

## Investigation Mission
1. Inspect the existing `crystal-canvas.tsx` and determine whether to refactor it or create `src/components/hero-3d-scene.tsx`:
   - Inspect how `hero.tsx` currently instantiates the 3D canvas (lines 142–156 or similar).
   - Check props: `mode: ModeId`, `theme: 'dark' | 'light'`, `onModelClick?: () => void`.
   - Ensure dynamic client-side loading with `next/dynamic` (`{ ssr: false }`) to prevent SSR canvas errors.
   - Implement graceful loading fallback / skeleton spinner while large GLB models (`model-quill.glb` is ~90MB) load asynchronously.
2. Review automated E2E tests for R2 in `tests/e2e/`:
   - Check `tier1-feature-coverage.test.mjs` (R2 assertions).
   - Check `tier2-boundary-corner.test.mjs`, `tier3-cross-feature.test.mjs`, `tier4-application-scenarios.test.mjs`.
   - Identify what specific properties, DOM attributes, or module exports the tests verify so the implementation satisfies all tests.
3. Formulate the concrete component interface, props, file layout, and integration steps.
4. Deliver your recommended architecture and implementation plan in `handoff.md` in your working directory.
5. Notify orchestrator via `send_message`.
