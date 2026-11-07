# BRIEFING — 2026-11-05T12:14:30Z

## Mission
Plan the exact implementation for `src/components/project-mode-icon.tsx` and integration into `src/components/hero.tsx` (Milestone 1).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, architect
- Working directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_2\
- Original parent: 514f318a-382e-4a4c-bf5e-58e0d0eff1f1
- Milestone: Milestone 1: Dynamic Project Icons Architect

## 🔒 Key Constraints
- Read-only investigation — do NOT implement source code
- Load and render SVG icons from `src/assets/icons/`: `project-tech.svg`, `project-medical.svg`, `project-academic.svg`
- Support `mode: ModeId` prop dynamically updating based on `activeMode`
- Support custom `className` (sizing, stroke, fill, drop-shadow)
- Detail replacement of `DiamondArtifactGlyph` in `src/components/hero.tsx`
- Write only to `.agents/teamwork/explorer_m1_2/`

## Current Parent
- Conversation ID: 514f318a-382e-4a4c-bf5e-58e0d0eff1f1
- Updated: not yet

## Investigation State
- **Explored paths**: ORIGINAL_REQUEST.md, PROJECT.md, survey_report.md, src/components/hero.tsx, src/components/geometric-glyphs.tsx, src/components/projects.tsx, src/components/project-modal.tsx, src/assets/icons/*.svg, src/app/page.tsx, next.config.ts, package.json
- **Key findings**:
  - `DiamondArtifactGlyph` renders procedural shapes using `index % 3`, ignoring mode and SVG assets.
  - SVG icon assets are ~1.85 MB each (total ~5.56 MB) containing high-res master artwork. Must be loaded as static external assets (Next `<Image unoptimized />` or `<img>`), NEVER inlined as JSX, to prevent 5.5 MB JS bundle bloat.
  - Multi-mode projects like HMSSO require dynamic reaction to `activeMode`, with fallback to `project.mode`.
  - In `hero.tsx`, replacing `DiamondArtifactGlyph` with `<ProjectModeIcon className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />` fits the 45°-rotated diamond card inner geometry perfectly.
- **Unexplored areas**: None for Milestone 1 scope.

## Key Decisions Made
- Architected `src/components/project-mode-icon.tsx` with `MODE_ICON_MAP` using Next.js static imports and public URL fallbacks.
- Provided complete code implementation blueprint for `project-mode-icon.tsx`.
- Detailed exact line replacements for `src/components/hero.tsx` (lines 10, 207–211) and extensions to `projects.tsx` and `project-modal.tsx`.
- Wrote comprehensive `recommendations.md` and 5-component `handoff.md`.

## Artifact Index
- DISPATCH.md — Initial dispatch instructions
- BRIEFING.md — Situational awareness and state
- progress.md — Liveness heartbeat and task tracker
- recommendations.md — Full technical implementation blueprint for Milestone 1 R3
- handoff.md — 5-component self-contained handoff report
