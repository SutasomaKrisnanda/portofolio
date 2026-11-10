# Handoff Report — Explorer Survey P2-2

**Task**: Codebase Survey & Implementation Blueprints for Requirement R2 (Category Pill Galeri) and Requirement R4 (Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif)  
**Agent**: Explorer Survey P2-2  
**Recipient**: Project Orchestrator (`296675c5-70ba-4b3d-9b05-cade43b440a6`)  
**Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_survey_p2_2\`  
**Reference Report**: `survey_report.md` in this directory  
**Handoff Type**: Hard Handoff (Investigation & Architecture Complete)

---

## 1. Observation

1. **Category Pills in Projects Gallery (`src/components/projects.tsx:96-116`)**:
   - Class declaration: `<div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter kategori projek">`.
   - On viewports < 640px, `flex-wrap` causes 5 to 6 categories (in Tech mode: `All`, `Web Development`, `Software Engineering`, `Mobile Applications`, `UI/UX Design`, `Branding & Media`) to wrap into 3–4 vertical rows.
   - `selectedCategory` state initialized at line 20: `const [selectedCategory, setSelectedCategory] = useState<string>('All');`. No `useEffect` resets `selectedCategory` on `activeMode` change. Switching modes with an active non-generic category produces an empty project list ("Tidak ada projek yang sesuai dengan kata kunci atau filter ini").

2. **Category Pills in Achievements Gallery (`src/components/achievements.tsx:44-73`)**:
   - Nested inside header flex container: `<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">`.
   - Pills rendered with: `<div className="flex flex-wrap gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter prestasi">`.
   - Fixed array (lines 19–26): `['All', 'Kompetisi & Penghargaan', 'Program Teknis & Akademik', 'Kontribusi Komunitas & Riset', 'Milestone Projek Perangkat Lunak', 'Kepenulisan & Publikasi Ilmiah']`.
   - Character counts of category labels reach 32 chars (`'Milestone Projek Perangkat Lunak'`). On mobile (< 640px), pills wrap into 5–6 rows, consuming ~250px–280px of vertical height in the header alone.

3. **Project Logo Icon in Project Gallery Cards (`src/components/projects.tsx:155-157`)**:
   - Direct observation:
     ```tsx
     <div className="shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10">
       <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
     </div>
     ```
   - Cards currently render `DiamondArtifactGlyph` rather than `ProjectModeIcon`.

4. **Existing Icon Component & Asset Infrastructure (`src/components/project-mode-icon.tsx:1-92`)**:
   - `project-mode-icon.tsx` imports:
     - `techIcon` from `@/assets/icons/project-tech.svg`
     - `medicalIcon` from `@/assets/icons/project-medical.svg`
     - `academicIcon` from `@/assets/icons/project-academic.svg`
   - Multi-mode resolution logic at lines 64–67:
     ```tsx
     const resolvedMode: ModeId =
       project && project.mode !== mode && !project.secondaryModes?.includes(mode)
         ? project.mode
         : mode;
     ```
   - All three SVG asset files exist in `src/assets/icons/` and are fully validated.

5. **Tool Commands & Verification Results**:
   - `tsc --noEmit`: Exited code 0 (0 type errors).
   - `npm run lint`: Exited code 0 (0 lint errors).

---

## 2. Logic Chain

1. **In R2 (Category Pill Compactness)**:
   - *Observation*: `flex-wrap` causes pills to wrap vertically into 3–6 rows on mobile, taking ~250px+ vertical height, while `overflow-x-auto` is neutralized by `flex-wrap`.
   - *Deduction*: By separating the mobile behavior to a single-row scrollable rail (`flex-nowrap overflow-x-auto`) and desktop behavior to responsive wrapping or segmented bar (`sm:flex-wrap`), mobile vertical height drops from ~260px to ~38px (>80% space savings).
   - *Deduction*: Adding left/right edge fade mask gradients gives visual affordance that content is scrollable horizontally on mobile, while auto-scrolling the active pill on tap guarantees immediate visibility.
   - *Observation*: Mode switching leaves `selectedCategory` unchanged, breaking filtering because categories differ across modes.
   - *Deduction*: Adding `useEffect(() => { setSelectedCategory('All'); }, [activeMode])` in both `projects.tsx` and `achievements.tsx` eliminates this bug.

2. **In R4 (Project Logo Icons)**:
   - *Observation*: `src/components/project-mode-icon.tsx` implements the exact resolution required by R4 (matches `activeMode` if supported by `project.mode` or `project.secondaryModes`, with fallback to `project.mode` or default `tech`).
   - *Observation*: `src/components/projects.tsx` is not using `ProjectModeIcon` on its article cards; it uses `DiamondArtifactGlyph`.
   - *Deduction*: Replacing `DiamondArtifactGlyph` with `<ProjectModeIcon mode={activeMode} project={project} />` directly fulfills Requirement R4 and all acceptance criteria.

---

## 3. Caveats

1. **Browser Scrollbars on Mobile**:
   - Default Android Chrome and iOS Safari scrollbars can appear briefly during fast swipes unless styled with `no-scrollbar` (which hides scrollbar tracks across Webkit, Firefox, and Edge). This utility must be included in `src/app/globals.css`.
2. **Category Names in Achievements**:
   - The category `'Kepenulisan & Publikasi Ilmiah'` has 0 achievements in the current dataset. Dynamically deriving categories from `PORTFOLIO_ACHIEVEMENTS` for `activeMode` prevents empty filters.
3. **No Direct Code Modifications**:
   - In accordance with the Explorer subagent role, no source code in `src/` was modified during this survey. All proposed changes are documented as blueprints in `survey_report.md`.

---

## 4. Conclusion

1. **R2 Solution**:
   - Refactor `projects.tsx` and `achievements.tsx` category pill containers to use a dual-responsive pattern: single-row horizontal scroll (`no-scrollbar`) with left/right fade masks on mobile, and spacious wrapping with count badges on desktop.
   - Separate achievements category pills from the header title row into a dedicated row.
   - Add `useEffect` to reset `selectedCategory` to `'All'` upon mode changes.
2. **R4 Solution**:
   - Replace `<DiamondArtifactGlyph>` in `src/components/projects.tsx:156` with `<ProjectModeIcon mode={activeMode} project={project} className="w-full h-full object-contain drop-shadow" />`.
   - Optionally include `ProjectModeIcon` in `project-modal.tsx` header for continuous visual identity.

---

## 5. Verification Method

To verify the implementation once applied:
1. **Typecheck & Linter**:
   - `cmd.exe /c "npm run typecheck"` -> must exit with code 0.
   - `cmd.exe /c "npm run lint"` -> must exit with code 0.
2. **Build Check**:
   - `cmd.exe /c "npm run build"` -> must compile static pages to `out/` without errors.
3. **UI / Responsiveness Verification**:
   - Open browser at viewport <= 480px: Verify Projects & Achievements category pills take only 1 single row (~38px height) and swipe smoothly horizontally.
   - Verify tapping an off-center pill auto-centers it.
   - Verify project cards display the mode icon (Tech polyhedron icon in Tech mode, Medical cross icon in Medical mode for multi-mode projects like HMSSO and Bunda Bahagia).
   - Invalidate condition: Any wrapping of pills into multiple rows on mobile screens (< 640px) or project cards displaying diamond glyphs instead of mode icons.
