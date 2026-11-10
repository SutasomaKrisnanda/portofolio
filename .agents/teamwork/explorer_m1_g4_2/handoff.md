# Handoff Report: Tech Mode Geometric Glyphs Restoration (Milestone 1)

**Agent ID:** Explorer M1-2 (`teamwork_explorer`)  
**Parent:** orchestrator_gen4 (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Task:** Milestone 1 Technical Strategy — Tech Mode Geometric Glyphs Restoration  
**Date:** 2026-11-10T13:08:30Z  

---

## 1. Observation

1. **`DiamondArtifactGlyph` Component in `src/components/geometric-glyphs.tsx` (Lines 58–117)**:
   - The component is defined at line 58 with props `{ visualType: Project['visualType']; index: number; isActive?: boolean }`.
   - It computes `index % 3` to render 3 procedural SVG shapes:
     - Shape 0 (`index % 3 === 0`): Liquid Chrome Sphere with linearGradient `chrome-${visualType}-${index}` (stops: `#f8fafc`, `#64748b`, `#cbd5e1`, `#1e293b`), base shadow ellipse (`cx="42" cy="67" rx="16" ry="4"`), specular highlight circle (`r="5"`), and light-bounce arc.
     - Shape 1 (`index % 3 === 1`): Crystal Octahedron with base shadow ellipse (`cx="40" cy="64"`), top facet polygon (`#fbcfe8`), lower facets (`#f472b6`, `#db2777`), and inner diamond facet (`#cbd5e1`).
     - Shape 2 (`index % 3 === 2`): Holographic Crystal Column with dual linearGradients `holo-${visualType}-${index}` (`#22d3ee` -> `#c084fc` -> `#f472b6`) and `holo-side-${visualType}-${index}` (`#38bdf8` -> `#0f766e`), ice blue top-cap polygon, and base plinth rect (`#334155`).
   - Line 65, 88, 98: Hardcodes `className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-md"`.
   - Lines 67, 77, 100, 105, 112, 113: Linearly interpolates `visualType` directly into SVG `id` attributes and `url(#...)` selectors.
2. **Dataset `visualType` Strings in `src/data/projects.json`**:
   - `visualType` fields include strings with whitespace, ampersands, and slashes: `"Smart IoT & AI"` (line 239), `"Brand & Media"` (line 291), `"System Architecture"` (line 18), `"UI/UX Platform"` (line 390).
   - In standard XML/SVG and CSS fragment identifier rules, an unquoted URL like `url(#chrome-Smart IoT & AI-0)` contains spaces and unencoded characters, which causes browsers to fail resolving the linearGradient fill, resulting in transparent or black silhouettes.
   - When the same project is rendered in multiple DOM branches (e.g. Hero mobile card and desktop carousel simultaneously), identical SVG IDs collide in document scope.
3. **Current Implementation in `src/components/project-mode-icon.tsx` (Lines 31–91)**:
   - `ProjectModeIconProps` (lines 31–51) does not include `index?: number`.
   - In lines 79–90, `ProjectModeIcon` unconditionally returns an `<Image>` component loading `MODE_ICON_MAP[resolvedMode]` (`/icons/project-tech.svg` for tech mode), completely bypassing `DiamondArtifactGlyph`.
4. **Consumers in `src/components/hero.tsx` and `src/components/projects.tsx`**:
   - `hero.tsx` line 198 (mobile card): `<ProjectModeIcon mode={activeMode} project={currentHeroProject} className="w-6 h-6 object-contain" priority />` does not pass `index`.
   - `hero.tsx` lines 348–353 (desktop carousel): `<ProjectModeIcon mode={activeMode} project={slideProj} ... />` does not pass `index`.
   - `projects.tsx` lines 287–291 (gallery grid): `<ProjectModeIcon mode={activeMode} project={project} className="w-full h-full object-contain drop-shadow" />` inside `filteredProjects.map((project, idx) => ...)` does not pass `index`.
   - `project-modal.tsx`: Displays text metadata `{project.visualType || '-'}` in its metadata pill ribbon (line 146).
5. **Tool Diagnostics**:
   - `cmd /c npm run typecheck`: Passed with exit code 0 (`tsc --noEmit`).
   - `cmd /c npm run lint`: Passed with exit code 0.
   - `node tests/e2e/runner.mjs`: Passed with 61/61 tests passing across Tiers 1–4.
   - `node tests/e2e/tier5-adversarial-m1.test.mjs`: Passed 12/12 tests.

---

## 2. Logic Chain

1. **Requirement Trace**:
   - ORIGINAL_REQUEST § R1 explicitly demands: *"Kembalikan bentuk geometri lama yang pertama kali digunakan di `src/components/geometric-glyphs.tsx` untuk mode tech."*
   - PROJECT.md line 31 & lines 73–77 define the contract: When `mode === 'tech'`, `project-mode-icon.tsx` must dynamically render `<DiamondArtifactGlyph visualType={project?.visualType || 'artifact'} index={index} />`.
2. **Defensive Component Evolution**:
   - If `project-mode-icon.tsx` branches on `resolvedMode === 'tech'` and renders `DiamondArtifactGlyph`, `DiamondArtifactGlyph` must handle:
     a) `visualType?: Project['visualType'] | string` defaulting to `'artifact'` (because `'artifact'` is not in the `Project['visualType']` union type).
     b) `className?: string` to accept parent container sizing (`w-full h-full`, `w-6 h-6`, etc.) instead of forcing `w-12 h-12 sm:w-16 sm:h-16`.
     c) Sanitized gradient IDs (`replace(/[^a-z0-9_-]/g, '-')`) and `React.useId()` suffix to eliminate XML ID space/character syntax errors and DOM multi-instance collisions.
3. **Deterministic Index Resolution**:
   - By adding `index?: number` to `ProjectModeIconProps` and providing a defensive fallback `const resolvedIndex = typeof index === 'number' ? index : (project ? Math.max(0, PORTFOLIO_PROJECTS.findIndex(p => p.id === project.id)) : 0);`, every component automatically renders the correct geometric shape even if a caller forgets to pass `index`.
   - By explicitly passing `index={idx}` in `projects.tsx` and `hero.tsx`, we guarantee deterministic cycling: Card 0 = Liquid Chrome Sphere, Card 1 = Crystal Octahedron, Card 2 = Holographic Crystal Column.

---

## 3. Caveats

- `project-modal.tsx`: Currently does not render a mode icon next to the title. We verified that embedding `ProjectModeIcon` in the modal header is optional and clean, but not strictly required by E2E test suites which focus on `hero.tsx` and `projects.tsx`.
- The Next.js static export bundle (`output: 'export'`) in Next.js 15 uses server-side rendering during build; using `React.useId()` inside `DiamondArtifactGlyph` produces identical deterministic IDs during SSR and hydration.

---

## 4. Conclusion

The strategy for Worker M1 is complete, verified, and ready for immediate execution:
1. Update `src/components/geometric-glyphs.tsx` to sanitize IDs with `React.useId()`, accept `className`, and type `visualType` permissively.
2. Update `src/components/project-mode-icon.tsx` to support `index?: number` and dynamically render `<DiamondArtifactGlyph>` when `resolvedMode === 'tech'`.
3. Update `src/components/hero.tsx` (mobile and carousel) and `src/components/projects.tsx` (gallery grid) to pass `index`.
All line-by-line replacement specifications are documented in `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_g4_2\report.md`.

---

## 5. Verification Method

Independent verification can be executed via:
1. **Static Typing & Compilation**:
   ```powershell
   cmd /c npm run typecheck
   ```
   Must pass with exit code 0.
2. **Linting Check**:
   ```powershell
   cmd /c npm run lint
   ```
   Must pass with exit code 0.
3. **E2E Test Suites**:
   ```powershell
   node tests/e2e/runner.mjs
   node tests/e2e/tier5-adversarial-m1.test.mjs
   ```
   All test suites must pass 100%.
4. **Visual & DOM Verification**:
   - Open browser at `?mode=tech`.
   - Verify that projects in the grid and carousel render the 3 distinct geometric shapes.
   - Inspect SVG elements to ensure `<linearGradient>` IDs contain no spaces or ampersands and reference valid fragment URLs (`url(#...)`).
