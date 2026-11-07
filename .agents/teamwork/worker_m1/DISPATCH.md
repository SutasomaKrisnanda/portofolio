## 2026-11-05T12:16:47Z
You are teamwork_worker: M1 Implementation Worker.
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1\
Parent orchestrator conversation ID: 514f318a-382e-4a4c-bf5e-58e0d0eff1f1

MANDATORY FIRST STEP:
Read the user request at:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the master architecture at:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md

EXPLORER BLUEPRINTS TO FOLLOW:
- Explorer M1-1 (HeroBackground): w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_1\recommendations.md
- Explorer M1-2 (ProjectModeIcon): w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_2\recommendations.md
- Explorer M1-3 (Integration & Build): w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_3\recommendations.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit:
- `src/components/hero-background.tsx` (create)
- `src/components/project-mode-icon.tsx` (create)
- `src/components/hero.tsx` (integrate HeroBackground and ProjectModeIcon)
- `src/app/layout.tsx` (metadata icon link to `/favicon.ico`)
- `package.json` (update build command to cross-platform patch-fs)
- `public/favicon.ico` (relocate from `src/app/favicon.ico`, remove `src/app/favicon.ico` and `src/app/oldfavicon.ico`)

TASK SPECIFICATIONS:
1. Implement `src/components/hero-background.tsx` with all 6 `.avif` background images from `src/assets/image/`, smooth opacity cross-fading based on `mode` ('tech' | 'medical' | 'academic') and `theme` ('dark' | 'light'), WCAG AAA multi-directional contrast vignettes, and pedestal ambient glow.
2. Implement `src/components/project-mode-icon.tsx` using `src/assets/icons/project-tech.svg`, `project-medical.svg`, `project-academic.svg`, dynamically rendering based on `activeMode` with fallback to project mode.
3. Integrate both into `src/components/hero.tsx`:
   - Mount `<HeroBackground activeMode={activeMode} theme={resolvedTheme} />` as background.
   - Replace `DiamondArtifactGlyph` with `<ProjectModeIcon mode={activeMode} project={slideProj} />` in preview cards.
4. Move `src/app/favicon.ico` to `public/favicon.ico` and update `package.json` build script.
5. Verify your changes by running:
   - `node node_modules/typescript/bin/tsc --noEmit`
   - `node -r ./patch-fs.js node_modules/next/dist/bin/next build`
   Document the exact build and verification outputs in your handoff.

OUTPUT:
Write your full implementation and verification report to:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1\handoff.md`
Update your `progress.md` and notify orchestrator via send_message.
