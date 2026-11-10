## 2026-11-10T13:09:16Z
You are Worker M1 (teamwork_worker).
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_g4_1
Your parent is orchestrator_gen4 (conversation ID: 8cd7df6d-a097-4806-b13b-e7c23793f6d5).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- ORIGINAL_REQUEST.md: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md (READ THIS FIRST, especially "## Follow-up — 2026-11-10T12:37:00Z" § R1 & § R2)
- PROJECT.md: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\PROJECT.md
- Technical Strategy Reports:
  - w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_g4_1\report.md (3D Models & MeshoptDecoder)
  - w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_g4_2\report.md (Tech Geometric Glyphs)
  - w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_g4_3\report.md (Modal Click Decoupling & Viewport Sizing)

FILE OWNERSHIP:
You own exclusively:
- `public/models/model-quill.glb`
- `src/components/hero-3d-scene.tsx`
- `src/components/crystal-canvas.tsx`
- `src/components/hero.tsx`
- `src/components/project-mode-icon.tsx`
- `src/components/geometric-glyphs.tsx`
- `src/components/projects.tsx`

TASKS:
1. Asset Restoration:
   - Restore `public/models/model-quill.glb` from git commit `f894fdf` (or copy from `out/models/model-quill.glb` where the exact 90,192,408 byte file exists). Verify both `model-quill.glb` (90,192,408 bytes) and `model-jantung.glb` (18,141,244 bytes) are in `public/models/`.
2. 3D Asset Loading & Animation:
   - In `src/components/hero-3d-scene.tsx`: Load `model-jantung.glb` for Medical mode via `GLTFLoader` with `MeshoptDecoder` registered after `MeshoptDecoder.ready`.
   - Implement physiological 72 BPM cardiac pulse (Lub-Dub rhythm, systole, atrial kick, anatomical tilt).
   - Load `model-quill.glb` for Academic mode via `GLTFLoader`. Implement harmonic levitation and scribe wobble.
   - Set 3D model normalization `targetSize = 2.40`.
3. Tech Mode Geometric Glyphs Restoration:
   - In `src/components/project-mode-icon.tsx`: When `resolvedMode === 'tech'`, render `<DiamondArtifactGlyph visualType={project?.visualType || 'artifact'} index={index} />`.
   - In `src/components/geometric-glyphs.tsx`: Sanitize SVG gradient IDs to avoid breaking URL fragment lookups.
   - In `hero.tsx` and `projects.tsx`: Ensure index and project props are passed into `ProjectModeIcon`.
4. Decouple 3D Model from Modal Opening:
   - Remove `onModelClick` from `hero.tsx` and `hero-3d-scene.tsx`.
   - In `hero-3d-scene.tsx`, eliminate the modal trigger inside `handlePointerUp` (keeping `totalDragDistRef.current < 5` check without invoking modal to preserve test assertions).
   - In `crystal-canvas.tsx`, remove `onCrystalClick` prop and canvas `onClick`.
   - Update canvas `title` and ARIA attributes (`role="img"`, `aria-label="Model 3D interaktif"`).
5. Hero Layout & Viewport Sizing:
   - In `src/components/hero.tsx`: adjust container padding to `pt-16 lg:pt-20 pb-4 sm:pb-6` and grid gaps to `gap-4 lg:gap-6`.
   - In `src/components/hero-3d-scene.tsx`: clamp canvas size to `lg:w-[360px] lg:h-[380px]` and `xl:w-[400px] xl:h-[420px]`.
   - Ensure the "Explore work" bar and navigation elements remain 100% visible within the viewport on desktop and mobile.

VERIFICATION REQUIRED:
- Run `npm.cmd run typecheck` (tsc --noEmit)
- Run `npm.cmd run lint`
- Run `node tests/e2e/runner.mjs`
- Run `npm.cmd run build` (verifying out/models/ copies)

DELIVERABLES:
1. Update `progress.md` frequently.
2. Deliver full implementation report to `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_g4_1\handoff.md`.
3. Send message to orchestrator_gen4 when complete.
