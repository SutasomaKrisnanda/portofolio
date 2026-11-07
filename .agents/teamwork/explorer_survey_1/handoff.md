# Handoff Report — Explorer Survey 1: Visual, Layout & Background Assets (R1)

**Agent**: teamwork_explorer 1 (`explorer_survey_1`) — Visual & Layout Explorer  
**Mission**: Technical Investigation for Requirement R1 (Peningkatan Visual Hero-Section per Mode)  
**Parent Orchestrator ID**: `514f318a-382e-4a4c-bf5e-58e0d0eff1f1`  
**Date**: 2026-11-05  
**Type**: Hard Handoff (Investigation & Technical Survey Complete)

---

## 1. Observation

1. **Reference Mockups**:
   - Discovered in `C:\Users\ACER\Downloads\`:
     - `mode-tech-dark.png` (1,809,009 bytes)
     - `mode-tech-light.png` (2,024,464 bytes)
     - `mode-academic-dark.png` (2,033,432 bytes)
     - `mode-academic-light.png` (1,976,013 bytes)
     - `mode-medical-dark.png` (1,929,160 bytes)
     - `mode-medical-light.png` (1,889,766 bytes)
   - Visual inspection via `view_file` confirmed that each image depicts a full-bleed environmental scene with specific color accents, headline typography with embedded prism glyph, center 3D subject resting on an environmental pedestal, right vertical diamond cards + timeline, and a docked bottom shelf pill.

2. **Background Asset Availability in Workspace**:
   - Inspected `src/assets/image/`:
     - `bg-tech-dark.avif` (50,328 bytes)
     - `bg-tech-light.avif` (107,156 bytes)
     - `bg-academic-dark.avif` (46,669 bytes)
     - `bg-academic-light.avif` (51,221 bytes)
     - `bg-medical-dark.avif` (11,681 bytes)
     - `bg-medical-light.avif` (45,369 bytes)
   - Direct inspection verified that these 6 AVIF files match the background scenes of the 6 reference mockups exactly.

3. **Current Background Implementation in Code**:
   - `src/components/hero.tsx` (lines 54–65):
     ```tsx
     <section
       id="hero"
       ...
       className="relative w-full h-screen min-h-[640px] flex flex-col justify-between pt-20 sm:pt-24 pb-4 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
     >
     ```
     Observed: `hero.tsx` has **no background imagery** whatsoever; it renders as a transparent layer.
   - `src/components/fixed-background.tsx` (lines 40–45):
     ```tsx
     <div
       className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-out overflow-hidden"
       style={{
         background: palette.pageGradient
       }}
     >
     ```
     Observed: Only renders CSS linear gradients (`palette.pageGradient`), two blur glow orbs, and an SVG circle mesh.

4. **Theme and Mode State Management**:
   - `src/app/page.tsx` line 33: `const [activeMode, setActiveMode] = useState<ModeId>('tech');` manages current mode (`'tech'`, `'medical'`, `'academic'`), synced to URL search param `?mode=` and `localStorage.getItem('arya_portfolio_mode')`.
   - `src/components/theme-provider.tsx` lines 17–19: `useTheme()` provides `theme` and `resolvedTheme` (`'dark'` | `'light'`), managing the `.dark` class on `document.documentElement`.
   - `src/components/theme-toggle.tsx` lines 28–46: Provides interactive sun/moon button to switch between light and dark themes.

5. **Tailwind and CSS Configuration**:
   - `tailwind.config.ts` line 4: `darkMode: ['class']`.
   - `next.config.ts` lines 3–4: `output: 'export'`.
   - `next.config.ts` lines 12–13: `images: { unoptimized: true }`.
   - `node_modules/next/image-types/global.d.ts`: Contains native TypeScript declaration for `*.avif` static image imports.

---

## 2. Logic Chain

1. *From Observation 1 & 2*: The 6 reference mockups in `C:\Users\ACER\Downloads\` and the 6 AVIF files in `src/assets/image/` correspond 1:1 across all combinations of `ModeId` (`tech`, `academic`, `medical`) and theme (`dark`, `light`).
2. *From Observation 3*: Because `hero.tsx` currently has no background image and `fixed-background.tsx` only renders a CSS gradient and blur circles, the current live application fails Requirement R1.
3. *From Observation 3 & 4*: The hero section is the first snap-scroll section (`#hero`). Placing the 6 background images inside a dedicated `HeroBackground` layer within `hero.tsx` ensures the background image stays bound to the hero section, while the ambient glow orbs in `fixed-background.tsx` continue to illuminate the subsequent sections (`projects`, `about`, `skills`, `achievements`, `contact`).
4. *From Observation 5*: Because Next.js static export (`output: 'export'`) has `images: { unoptimized: true }` and `*.avif` is natively supported via ES imports, importing all 6 `.avif` assets and rendering them with Next.js `<Image fill priority sizes="100vw" />` and CSS opacity transitions (`opacity-100` for active combination, `opacity-0` for inactive) delivers instant, flicker-free cross-fading when switching modes and themes.
5. *From Observation 1*: To guarantee WCAG AAA text contrast across both light and dark themes while showcasing the rich environmental art, overlay gradient vignettes (top header shade, bottom shelf shade, and subtle side tint) must be applied on top of the background layer.

---

## 3. Caveats

1. **Read-Only Survey Mandate**: In accordance with the explorer role guidelines, no source code files were edited or committed during this survey. Full implementation will be performed by implementer agents based on this report.
2. **Pedestal Alignment with 3D Models**: The 3D models (polyhedron for Tech, `model-quill.glb` for Academic, and `model-jantung.glb` for Medical) must be rendered in a WebGL canvas with `alpha: true` (transparent background) so that each model appears physically positioned atop its background pedestal.
3. **Windows Build Environment**: Building the Next.js static site on Windows WSL mounts requires `node -r ./patch-fs.js node_modules/next/dist/bin/next build` to prevent `readlink` `EISDIR` errors on `favicon.ico`.

---

## 4. Conclusion

Requirement R1 is **100% feasible and fully mapped**:
1. All 6 required AVIF background images are already present in `src/assets/image/` with optimal file sizes (11 KB to 107 KB).
2. The visual elements, typography, color palettes, button styles, and spatial compositions of all 6 mode/theme states have been analyzed from the reference mockups.
3. Implementing a dedicated `<HeroBackground>` layer inside `hero.tsx` using pre-rendered, cross-fading `<Image>` components with contrast vignettes fulfills R1 completely without introducing external runtime dependencies.
4. Full architectural blueprints, line number references, and implementation instructions have been detailed in `survey_report.md`.

---

## 5. Verification Method

To independently verify these findings:

1. **Inspect AVIF Background Assets**:
   ```powershell
   node -e "const fs = require('fs'); ['bg-tech-dark.avif', 'bg-tech-light.avif', 'bg-academic-dark.avif', 'bg-academic-light.avif', 'bg-medical-dark.avif', 'bg-medical-light.avif'].forEach(f => console.log(f, fs.statSync('src/assets/image/' + f).size + ' bytes'));"
   ```
   *Expected result*: All 6 files exist with sizes matching ~11 KB to ~107 KB.

2. **Inspect Mockups**:
   ```powershell
   Get-ChildItem -Path "C:\Users\ACER\Downloads" -Filter "mode-*.png" | Select-Object Name, Length
   ```
   *Expected result*: Lists all 6 reference PNGs.

3. **Verify AVIF TypeScript Support in Next.js**:
   ```powershell
   node -e "const fs = require('fs'); console.log(fs.readFileSync('node_modules/next/image-types/global.d.ts', 'utf8').includes('avif'));"
   ```
   *Expected result*: Returns `true`.

4. **Verify TypeScript & Production Build with Patch**:
   ```powershell
   node node_modules/typescript/bin/tsc --noEmit
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
   *Expected result*: Exit code 0, 5/5 static pages generated.
