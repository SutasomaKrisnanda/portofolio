# Handoff Report — Explorer Survey 3: Project Navigation, Modal, Animation & Tooltips
**From**: teamwork_explorer 3 (c60040e1-7bbd-4058-af8c-e831914001b6)  
**To**: parent orchestrator (514f318a-382e-4a4c-bf5e-58e0d0eff1f1)  
**Date**: 2026-11-05  
**Type**: Hard Handoff (Investigation & Technical Survey Complete)

---

## 1. Observation
1. **Project Dataset and Schema**:
   - `src/data/projects.json` (428 lines) contains 8 projects. Each project schema in `src/data/portfolio-data.ts` (lines 17–57) includes `id`, `slug`, `title`, `mode`, `secondaryModes?: ModeId[]`, and `featured: boolean`.
   - Projects with `featured: true`:
     - `proj-hmsso` (mode: `tech`, secondaryModes: `['medical', 'academic']`)
     - `proj-bunda-bahagia` (mode: `medical`, secondaryModes: `['academic']`)
     - `proj-hmj-kedokteran` (mode: `tech`, secondaryModes: `['medical']`)
     - `proj-sipadu-ri` (mode: `academic`, secondaryModes: `['tech']`)
   - Projects with `featured: false`:
     - `proj-text-case-converter`
     - `proj-temu-ilmiah`
     - `proj-chess-project`
     - `proj-tryout-skd`
2. **Hero Navigation Flaws (`src/components/hero.tsx`)**:
   - Line 32–37:
     ```typescript
     const heroSlides = useMemo(() => {
       const list = projects.filter(
         (p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode)
       );
       return list.slice(0, 4);
     }, [projects, activeMode]);
     ```
     Observed: `p.featured` is completely omitted from the filter. It slices arbitrarily at 4.
   - Line 184: Hardcoded preview cards `{heroSlides.slice(0, 3).map(...)}`.
   - Lines 222–250: Static 4 buttons `{[3, 2, 1, 0].map((slideIdx, posIdx) => ...)}` rendering `04`, `03`, `02`, `01` regardless of matching project count.
   - Line 29: `const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);` does not reset when `activeMode` changes.
3. **Modal Component Layout Bugs (`src/components/project-modal.tsx`)**:
   - Lines 57 & 63: Double scrollbars. Overlay wrapper has `overflow-y-auto` and inner container has `overflow-y-auto`.
   - Line 63: Container has `p-6 sm:px-10 sm:py-8` and asymmetric border radius `rounded-tr-[44px] rounded-bl-[32px]`. The browser scrollbar track spills out of the top-right corner.
   - Line 67: Sticky header has `-mx-6 sm:-mx-10` with `sticky top-0` but no negative top margin against parent `pt-6/pt-8`, causing a 24px/32px vertical offset jump on scroll and revealing an unpainted slit above.
   - Lines 195–197 in `src/components/hero.tsx`: Opening modal from hero cards requires `onDoubleClick={() => onOpenProject(slideProj)}`. Single-clicking active card does nothing.
4. **Animation and Tooltip Ecosystem**:
   - `package.json`: Contains `"tailwindcss-animate": "^1.0.7"` and `"@radix-ui/react-tooltip": "^1.1.8"`. Does not contain `framer-motion`.
   - `src/components/ui/tooltip.tsx`: Wraps `@radix-ui/react-tooltip` with `TooltipProvider`, `Tooltip`, `TooltipTrigger`, and `TooltipContent`.
   - `src/components/hero.tsx`: None of the interactive buttons (CTA, CV, navigation indicators, cards, arrows, shelf links) currently use tooltips.
5. **Build and Lint Environment**:
   - TypeScript: `node node_modules/typescript/bin/tsc --noEmit` exited with code `0`.
   - Lint: `node node_modules/next/dist/bin/next lint` failed with `Converting circular structure to JSON ... Referenced from: .eslintrc.json` due to ESLint 9 conflict with legacy Next.js config.
   - Build: `node node_modules/next/dist/bin/next build` fails on Windows WSL mount with `Error: EISDIR: illegal operation on a directory, readlink '...src\app\favicon.ico'`.
   - Build with patch: `node -r ./patch-fs.js node_modules/next/dist/bin/next build` succeeded with exit code `0`, prerendering 5/5 static pages and exporting 2/2 routes to `out/`.

---

## 2. Logic Chain
1. *From Observation 1 & 2*: In `src/data/projects.json`, filtering by `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))` yields exactly 3 projects for `tech`, 3 for `medical`, and 3 for `academic`. Because `hero.tsx` previously ignored `p.featured` and hardcoded 4 static buttons (`[3, 2, 1, 0]`), clicking `04` on a 3-project list causes index mismatch. Therefore, replacing `[3, 2, 1, 0]` with a dynamic map over `featuredProjects` (`length === 3`) eliminates dead buttons and guarantees 100% data fidelity.
2. *From Observation 3*: Double `overflow-y-auto` causes dual scrollbars. The container `pt-6/pt-8` without top margin compensation causes sticky header jump. The asymmetric corner `rounded-tr-[44px]` cuts the scrollbar track. Therefore, refactoring `project-modal.tsx` into a 3-tier Flexbox structure (fixed header `flex-shrink-0`, scrollable body `flex-1 overflow-y-auto custom-scrollbar`, fixed footer `flex-shrink-0`) resolves title positioning, locks the scrollbar inside rectangular bounds, and prevents double scrollbars.
3. *From Observation 3*: Because mobile devices do not support double-click predictably, and desktop users expect immediate response, changing diamond cards so that clicking the active card directly calls `onOpenProject(slideProj)` and providing an explicit "Lihat Detail" action button makes opening the modal intuitive and seamless.
4. *From Observation 4*: Since `tailwindcss-animate` and `@radix-ui/react-tooltip` are already present in the workspace, adding slide block transitions via React keys (`key={currentHeroProject?.id}`) and wrapping all 9 hero interactive buttons with `<Tooltip>` achieves R6 requirements without installing extra dependencies.
5. *From Observation 5*: Because Windows mounts of WSL paths trigger `readlink` EISDIR on regular files, all build commands in this environment must be executed with `-r ./patch-fs.js` or `NODE_OPTIONS="-r ./patch-fs.js"`.

---

## 3. Caveats
1. No source code modifications were performed during this survey turn (read-only investigation per instructions). Full implementation will be carried out by implementer agents according to this report.
2. While `next lint` currently errors due to ESLint 9 circular structure on legacy `.eslintrc.json`, `next.config.ts` has `eslint: { ignoreDuringBuilds: true }` and TypeScript compilation (`tsc --noEmit`) is 100% clean. Updating to flat config or passing `ESLINT_USE_FLAT_CONFIG=false` can be handled during lint normalization.
3. The count of featured items is currently 3 across all three modes in `projects.json`. The dynamic navigation must dynamically compute `featuredProjects.length` so any future additions/deletions in JSON automatically adjust without code changes.

---

## 4. Conclusion
- **Feasibility Assessment**: Requirements R4, R5, and R6 are completely feasible using native workspace packages (`tailwindcss-animate`, `@radix-ui/react-tooltip`, React 18, Next.js 15) without any external library installations.
- **Actionable Execution Blueprint**:
  1. **R4**: Update `hero.tsx` filter to `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`, reset `activeSlideIndex` to 0 on mode switch, and generate dynamic navigation indicators matching `featuredHeroProjects.length`.
  2. **R5**: Restructure `project-modal.tsx` into a Flexbox layout (fixed header, scrollable body, fixed footer) to eliminate double scrollbars, title jump, and corner leakage; update `hero.tsx` cards to open on single click when active and provide an explicit "Lihat Detail" button.
  3. **R6**: Add block enter animations with `key={currentHeroProject?.id}` and wrap all interactive buttons with Radix `Tooltip`.
  4. **Build**: Build via `node -r ./patch-fs.js node_modules/next/dist/bin/next build`.

---

## 5. Verification Method
1. **Typecheck Command**:
   ```bash
   node node_modules/typescript/bin/tsc --noEmit
   ```
   *Expected Output*: Exit code `0` with no type errors.
2. **Production Build Command**:
   ```bash
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
   *Expected Output*: Exit code `0`, `✓ Generating static pages (5/5)`, `✓ Exporting (2/2)`.
3. **Files to Inspect**:
   - Dataset & Types: `src/data/projects.json`, `src/data/portfolio-data.ts`.
   - Hero Navigation & Interaction: `src/components/hero.tsx`.
   - Modal Component: `src/components/project-modal.tsx`.
   - Tooltip Component: `src/components/ui/tooltip.tsx`.
   - Full Survey Report: `.agents/teamwork/explorer_survey_3/survey_report.md`.
4. **Invalidation Conditions**:
   - If `heroSlides` still uses `[3, 2, 1, 0]` or `.slice(0, 4)` without checking `featured`.
   - If double scrollbars or title jumps remain in `ProjectModal`.
   - If interactive buttons fail to show tooltips on hover or keyboard focus.
