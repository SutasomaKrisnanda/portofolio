# Dispatch to Explorer 1 (Milestone 3 Iteration 1)

## Identity
- Archetype: teamwork_explorer
- Working Directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\

## Mission & Objective
Investigate Milestone 3: Requirement R4 (JSON Highlight Navigation) and Requirement R6 (Slide Block Transitions).
Specifically:
1. **Dataset Inspection**:
   - Inspect `src/data/projects.json` and `src/data/portfolio-data.ts`.
   - Determine how many featured projects exist per mode (`tech`, `academic`, `medical`), including multi-mode projects with `secondaryModes`.
   - Validate the filter logic: `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`.
2. **Hero Navigation Analysis**:
   - Inspect `src/components/hero.tsx` (specifically lines 220–250).
   - Identify the current static buttons `'1, 2, 3, 4'` / `[3, 2, 1, 0]` and how active slide index is managed.
   - Design dynamic indicators (or interactive tabs with project titles) that dynamically adapt in count to `featuredHeroProjects.length`.
   - Formulate slide index auto-reset to `0` whenever `activeMode` changes.
3. **Slide Block Transition Animations**:
   - Analyze how slide content blocks in `hero.tsx` enter and exit during slide transitions.
   - Design smooth animation transitions using reactive React keys (`key={currentHeroProject?.id}`) and Tailwind CSS transition classes (`transition-all duration-500`, fade/slide transforms).

## Mandatory Inputs to Read
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md`
- `src/data/projects.json`
- `src/data/portfolio-data.ts`
- `src/components/hero.tsx`

## Output Requirements
Write your handoff report to:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m3_it1_1\handoff.md`
When complete, send a message to orchestrator with your findings summary and handoff path.
