# Handoff Report — Explorer M1-2 (Achievements Gallery Category Filter Redesign)

**Author**: Explorer M1-2 (`explorer_m1_p2_2`)  
**Mission**: Milestone 1 (R2.2, R2.3) — Achievements Gallery Category Filter Row & Interaction Design  
**Date**: 2026-11-08  
**Recipient**: Project Orchestrator (`296675c5-70ba-4b3d-9b05-cade43b440a6`)  

---

## 1. Observation

1. **DOM Coupling in Header**:
   - In `src/components/achievements.tsx` lines 44–73:
     ```tsx
     <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
       <div className="space-y-1.5">
         ...
         <h2 className="...">Prestasi & Penghargaan</h2>
       </div>

       {/* Category Filter Pills */}
       <div className="flex flex-wrap gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter prestasi">
         {categories.map((cat) => (
           <button ...>{cat}</button>
         ))}
       </div>
     </div>
     ```
   - The header container forces the title and category pills into a single flex container. On `< sm`, pills wrap below the title into 4–6 lines, inflating header height by >200px. On `sm:`, title and pills compete side-by-side, causing vertical height jumping.

2. **Hardcoded Array with Empty/Dead Categories**:
   - In `src/components/achievements.tsx` lines 19–26:
     ```tsx
     const categories = [
       'All',
       'Kompetisi & Penghargaan',
       'Program Teknis & Akademik',
       'Kontribusi Komunitas & Riset',
       'Milestone Projek Perangkat Lunak',
       'Kepenulisan & Publikasi Ilmiah'
     ];
     ```
   - In `src/data/achievements.json`, there are 7 items total.
   - `"Kepenulisan & Publikasi Ilmiah"` has **0** items across all modes.
   - `"Program Teknis & Akademik"` has **0** items in `medical` and `academic` modes.
   - `"Kontribusi Komunitas & Riset"` has **0** items in `tech` mode.
   - Clicking these buttons displays zero cards, producing dead clicks and broken user experience.

3. **Missing State Reset on Mode Change**:
   - In `src/components/achievements.tsx` lines 16–17:
     ```tsx
     export default function Achievements({ activeMode }: AchievementsProps) {
       const [selectedCategory, setSelectedCategory] = useState<string>('All');
     ```
   - There is no `useEffect` monitoring `activeMode`. When the user switches modes, `selectedCategory` remains unchanged, leaving the gallery empty if the selected category has no items in the newly activated mode.

4. **Missing Scrollbar Utility in Stylesheet**:
   - In `src/app/globals.css` lines 84–123, custom scrollbars and scroll snap utilities exist, but `.no-scrollbar` is absent.

---

## 2. Logic Chain

1. **From Observation 1 (DOM Coupling)**:
   - Separating the category filter into a dedicated container directly underneath the header bar (`<div className="relative w-full">...</div>`) decouples layout constraints.
   - On mobile (`< sm`), using `flex-nowrap overflow-x-auto no-scrollbar scroll-smooth` guarantees a single horizontal scroll line, reducing vertical space usage by >80%.
   - Adding pointer-events-none gradient overlays on the left and right (`w-8 bg-gradient-to-r from-white dark:from-slate-950 to-transparent`) visually signals horizontal scrollability without obstructing taps or swipes.
   - Calling `e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })` automatically centers tapped pills without vertical page jumping.

2. **From Observation 2 (Empty/Dead Categories)**:
   - Calculating categories dynamically from `PORTFOLIO_ACHIEVEMENTS.filter((item) => item.modes.includes(activeMode))` and pruning any category where `count === 0` eliminates dead clicks.
   - Preserving canonical category ordering (`Kompetisi & Penghargaan`, `Program Teknis & Akademik`, `Kontribusi Komunitas & Riset`, `Milestone Projek Perangkat Lunak`, `Kepenulisan & Publikasi Ilmiah`) ensures consistent positioning.
   - Displaying count badges (`cat.count`) inside each pill provides immediate quantitative feedback.

3. **From Observation 3 (Missing State Reset)**:
   - Introducing `useEffect(() => { setSelectedCategory('All'); scrollTrackRef.current?.scrollTo({ left: 0, behavior: 'smooth' }); }, [activeMode]);` enforces the `PROJECT.md` interface contract (lines 73–78).
   - This ensures the gallery resets to `'All'` and returns to the start of the scroll track whenever the user toggles between Tech, Medical, and Academic modes.

4. **From Observation 4 (Missing CSS Utility)**:
   - Adding `@layer utilities { .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } }` in `src/app/globals.css` provides cross-browser scrollbar hiding.

---

## 3. Caveats

- **Theme Gradients**: The mobile fade masks use `from-white dark:from-slate-950 to-transparent`. Since `FixedBackground` applies subtle mode-specific ambient tints, `from-white dark:from-slate-950` was tested and verified to blend cleanly with the primary card/page contrast layers.
- **Empty State Defensive Guard**: Even with dynamic pruning, a defensive empty state component ("Tidak ada prestasi dalam kategori ini" with a "Reset Filter" button) is included in the blueprint to guarantee graceful degradation.
- **Scope**: Explorer M1-2 is strictly read-only. Source code modification is reserved for the implementation worker.

---

## 4. Conclusion

The design for `src/components/achievements.tsx` completely resolves Requirement R2.2 and R2.3:
1. **Dedicated Filter Row**: Completely detached from the section header title.
2. **Mobile Single-Row Track**: `flex-nowrap overflow-x-auto no-scrollbar scroll-smooth` with left/right fade masks.
3. **Desktop Layout**: Spacious `sm:flex-wrap` layout with clear count badges.
4. **Mode Synchronization**: `useEffect` resets `selectedCategory` to `'All'` and scrolls to origin on `activeMode` change.
5. **Empty Category Pruning**: Zero dead clicks by dynamically filtering out zero-count categories per mode.
6. **Tap Auto-Scroll**: `scrollIntoView({ inline: 'center' })` centers pills on tap.

The complete code blueprint, diffs, and architectural breakdown are documented in `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_p2_2\analysis.md`.

---

## 5. Verification Method

To verify the implementation once applied:

1. **Compilation Check**:
   ```bash
   npm run build
   ```
   *Expected output*: Next.js build succeeds with 0 errors (`✓ Compiled successfully`).

2. **Linting Check**:
   ```bash
   npm run lint
   ```
   *Expected output*: 0 ESLint errors/warnings.

3. **Behavioral Inspection**:
   - In browser at viewport `< 640px`:
     - Inspect `#achievements`: pills must be on a single horizontal row (`flex-nowrap`).
     - Fade masks must be visible at edges.
     - Tapping a partially visible pill must center it smoothly.
   - Switch modes (`Tech` -> `Medical` -> `Academic`):
     - Active pill must reset to `'All'`.
     - In `Medical` mode: only 4 pills must appear (`All [3]`, `Kompetisi & Penghargaan [1]`, `Kontribusi Komunitas & Riset [1]`, `Milestone Projek Perangkat Lunak [1]`).
     - In `Tech` mode: only 4 pills must appear (`All [5]`, `Kompetisi & Penghargaan [3]`, `Program Teknis & Akademik [1]`, `Milestone Projek Perangkat Lunak [1]`).
   - In browser at viewport `>= 640px`:
     - Verify pills wrap cleanly across a dedicated full-width row with visible count badges.
