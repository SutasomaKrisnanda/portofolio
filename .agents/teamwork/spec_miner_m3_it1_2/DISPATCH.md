# Dispatch to Spec Miner (Milestone 3 Iteration 1)

## Identity
- Archetype: teamwork_spec_miner
- Working Directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\

## Mission & Objective
Extract precise technical specifications and architectural blueprints for Requirement R5 (Modal Detail Overhaul & Responsiveness):
1. **Modal Architecture in `src/components/project-modal.tsx`**:
   - Inspect current modal layout, styling, and scroll behavior.
   - Design a robust 3-tier Flexbox layout:
     - Outer container: `max-h-[90vh] flex flex-col rounded-2xl overflow-hidden`
     - Fixed Header: fixed position at top of modal, holding title, category badges, mode tags, and close button (zero layout jump during scroll).
     - Scrollable Body: `flex-1 overflow-y-auto px-6 py-4` with scrollbar confined strictly within the inner body so it does not leak over asymmetric rounded corners or outside container borders.
     - Fixed Footer: action buttons (e.g. GitHub link, live demo, close).
2. **Typography & Responsive Layout**:
   - Fix title clamping, responsive typography across mobile (`<640px`), tablet (`640-1024px`), and desktop (`>1024px`).
   - Prevent text overlapping in metadata ribbons, stat cards, and tech tags.
3. **Hero Trigger Integration**:
   - Ensure the modal can be opened by single-click on the active project card/slide, or explicit "Lihat Detail" / "Explore" CTA button in `src/components/hero.tsx`.
   - Eliminate double-click (`onDoubleClick`) requirement.

## Mandatory Inputs to Read
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md`
- `src/components/project-modal.tsx`
- `src/components/hero.tsx`

## Output Requirements
Write your report to:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\handoff.md`
When complete, send a message to orchestrator with your findings summary and handoff path.


## 2026-11-06T01:47:13Z
[Message] timestamp=2026-11-06T01:47:13Z sender=cf0729e3-f061-40d9-8bb8-ea4465cfe5a6 priority=MESSAGE_PRIORITY_HIGH content=You are spec_miner_m3_it1_2.
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\

Read your dispatch instructions in:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\DISPATCH.md
MANDATORY: Read w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md.
Also read PROJECT.md, TEST_READY.md, src/components/project-modal.tsx, and src/components/hero.tsx.

Extract precise technical specifications and blueprints for Requirement R5 (Modal Detail Overhaul & Responsiveness): 3-tier Flexbox layout, scrollbar confinement, responsive typography, and single-click card trigger.
Write your complete report to:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m3_it1_2\handoff.md
When finished, send a message to the orchestrator with your findings summary and handoff path.
