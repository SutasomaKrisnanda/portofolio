# Handoff Report — Survey & Audit for Requirements R4 & R5

**Agent**: Survey Explorer 3 (`teamwork_explorer`)  
**Folder**: `.agents/teamwork/explorer_survey_g4_3/`  
**Parent Agent**: orchestrator_gen4 (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Timestamp**: 2026-11-10T12:51:30Z  

---

## 1. Observation

Direct observations from examining the codebase, style tokens, and test suites:

1. **Model 3D Hero Visibility & Click Handler Violation**:
   - In `src/components/hero.tsx` lines 293–312:
     ```tsx
     {/* Center Column: 3D Scene (Enlarged on Desktop, Completely Hidden on Mobile) */}
     <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative z-20 my-1 lg:my-0">
       <Hero3DScene
         mode={activeMode}
         theme={currentTheme}
         activeSlideIndex={activeSlideIndex}
         baseHue={modeConfig.palette.crystalBaseHue}
         secondaryHue={modeConfig.palette.crystalSecondaryHue}
         onModelClick={() => {
           if (currentHeroProject) onOpenProject(currentHeroProject);
         }}
       />
     ```
     - Direct observation: Column has `hidden lg:flex`, making the 3D canvas disappear completely on mobile/tablet screens.
     - Direct observation: Line 301–303 binds `onModelClick` to trigger `onOpenProject(currentHeroProject)`, which violates follow-up R1 Acceptance Criteria: *"Mengklik model 3D tidak lagi membuka modal project."*

2. **Featured Project Presentation (Diamond Cards & Unreadable Font)**:
   - In `src/components/hero.tsx` lines 339–358:
     ```tsx
     className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl rotate-45 transition-all duration-300 ease-out ... ${
       isCardActive
         ? 'bg-white ring-4 ring-slate-900/20 dark:ring-white/60 scale-110 z-20 shadow-xl'
         : 'bg-white/80 dark:bg-white/70 hover:bg-white dark:hover:bg-white/85 opacity-90 hover:scale-105 z-10'
     } backdrop-blur-md border border-slate-900/10 dark:border-white/70`}
     >
       <div className="-rotate-45 flex flex-col items-center justify-center p-1 text-center">
         <ProjectModeIcon ... />
         <span className="mt-0.5 text-[7px] uppercase tracking-wider font-bold text-slate-900 truncate max-w-[55px]">
           {slideProj.title.split(' ')[0]}
         </span>
       </div>
     ```
     - Direct observation: Font size is `text-[7px]`, far below the 12px minimum accessible typography scale established in `.agents/skill/refactoring-ui/SKILL.md`.
     - Direct observation: Background is hardcoded `bg-white/80 dark:bg-white/70` and text is `text-slate-900`, producing an un-themed white glare block in dark mode.
     - Direct observation: Arc offset translate curves in lines 380–385 (`'-translate-x-6 sm:-translate-x-8', '-translate-x-2 sm:-translate-x-3'...`) skew alignment inconsistently.

3. **Color Contrast & Theme Variables**:
   - In `src/app/globals.css` lines 20–72:
     - Line 31 (Light mode): `--muted-foreground: 215 20.2% 65.1%`. Measured against background `210 29% 96%`, contrast ratio is ~2.8:1 (fails WCAG AA 4.5:1 for body copy).
     - Line 48–50 (Dark mode): `--background: 222.2 84% 4.9%` and `--card: 222.2 84% 4.9%`. Raised surfaces lack lightness elevation over background.
   - In `src/components/project-modal.tsx` line 90:
     - `rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px] rounded-tl-2xl rounded-br-2xl` — extreme asymmetric border radius.
     - Line 91: `style={{ background: modalGradient }}` paints high-saturation gradient under multi-paragraph text.

4. **Copy & Text Substansi Findings**:
   - In `src/components/header.tsx` line 25: `{ id: 'hero', label: 'Origins' }`, while `page.tsx` line 24 has `{ id: 'hero', label: 'Beranda' }` and all other nav links are Indonesian (`Projek`, `Tentang`, `Keahlian`, `Prestasi`, `Kontak`).
   - In `src/data/projects.json`:
     - Line 32: `proj-hmsso` uses informal slang `"evaluasi proker divisi"`.
     - Line 68: `proj-bunda-bahagia` title has typo `"Reduksi Stress Kecemasan"` (baku: `"Reduksi Stres dan Kecemasan"`).
   - In `src/data/achievements.json` line 58: `ach-pkm-pm-2026` title is `"PIMNAS PKM-PM 2026 — Bunda Bahagia"`, claiming PIMNAS prematurely before national funding/selection stage concludes.
   - In `src/data/portfolio-data.ts` line 616: Academic highlight detail says `"Otomasi Mendeley untuk menyesuaikan dengan styling PKM PM 2026"`.

5. **Existing Test Framework**:
   - Running `node tests/e2e/runner.mjs` synchronously executed 4 tiers of tests:
     `ℹ tests 61 | ℹ pass 61 | ℹ fail 0 | ℹ duration_ms 2524`
   - Running `node tests/e2e/tier5-adversarial-m1.test.mjs`:
     `ℹ tests 12 | ℹ pass 12 | ℹ fail 0 | ℹ duration_ms 1203`

---

## 2. Logic Chain

1. **From Observation 1 to Hero Model 3D Recommendations**:
   - Observation 1 shows `hidden lg:flex` in `hero.tsx:294` and `onModelClick` at `hero.tsx:301`.
   - The follow-up request explicitly states in R1 & R2: (a) remove project modal opening on 3D model click, and (b) ensure hero elements fit proportionally across mobile and desktop without pushing the bottom shelf below the viewport.
   - Therefore, removing `onModelClick`, providing a responsive height container (`h-[240px]` mobile to `h-[340px]` desktop), and unhiding the model across breakpoints directly fulfills the acceptance criteria.

2. **From Observation 2 to Highlighted Project Component Overhaul**:
   - Observation 2 shows 7px text (`text-[7px]`), hardcoded white dark mode background (`dark:bg-white/70`), and skewed rotated squares.
   - According to Refactoring UI (`SKILL.md` and `references/diagnose.md`), interface elements must adhere to strict type scales (min 11–12px), use cohesive surface elevations without clashing color glare, and avoid arbitrary geometric hacks that compromise legibility.
   - Therefore, replacing the diamond squares with an **Elevated Glass Project Carousel Card** with cohesive mode badges, 14px titles, mode-specific focus halos, and aligned indicators resolves all visual defects and eliminates amateur appearance.

3. **From Observation 3 to Systemic UI/UX Polishing**:
   - Observation 3 shows muted text failing 4.5:1 WCAG contrast and modal cards having discordant asymmetric corners (`rounded-tr-44px`).
   - According to Refactoring UI, border radius should be uniform across components, and raised surfaces in dark mode must stack upward in lightness with a 1px subtle hairline.
   - Therefore, adjusting `--muted-foreground`, setting dark raised surfaces to `bg-slate-900/80 border-white/10`, and normalizing modal corners to `rounded-3xl` restores professional aesthetic integrity.

4. **From Observation 4 to Content Substance Audit (R5)**:
   - Observation 4 documents informal university slang ("proker"), typos ("stress" -> "stres"), prematurely claimed milestones ("PIMNAS"), and English-Indonesian mixing in navigation ("Origins").
   - A professional portfolio for a medical student, software engineer, and academic author requires linguistic precision, standard Indonesian (PUEBI/KBBI), and strict academic integrity.
   - Therefore, applying the exact substitution tables developed in `report.md` will standardize all copy across the 7 JSON/TS data files.

5. **From Observation 5 to Verification Plan**:
   - Observation 5 confirms a clean passing baseline of 61 E2E tests and 12 Tier 5 tests.
   - Enhancing these tests with assertions for R4 (DOM checks, 3D click decoupling, minimum font size >= 11px) and R5 (spelling validation, link protocol sanity, academic integrity notice) guarantees verification without breaking existing contracts.

---

## 3. Caveats

- **Scope Boundary**: This survey was conducted in read-only investigation mode. No production source code in `src/` or tests in `tests/` were modified during this turn.
- **Git Binary**: The host Windows environment lacks `git` on standard PowerShell PATH; project operations rely on `node` (v26.7.0) and `npm`.
- **Three.js Asset Decoder**: The 3D assets for Tech, Medical, and Academic modes are generated procedurally in memory (`createTechPolyhedron`, `createMedicalDNA`, `createAcademicQuill`) or loaded via Three.js primitives; external glTF/binary dependencies in `public/` must remain lightweight (< 500 kB) to meet GitHub Pages deployment criteria.

---

## 4. Conclusion

Requirements R4 and R5 are thoroughly surveyed, decomposed into concrete visual and textual bugs, and mapped to precise technical solutions:
1. **R4 (UI/UX Refactoring)**:
   - Hero 3D model: Remove `onModelClick`, make canvas responsive on mobile/desktop, clamp height to prevent shelf displacement.
   - Highlighted project: Replace diamond 7px cards with sleek glass preview cards with proper hierarchy, mode-accent halos, and aligned segmented indicators.
   - Portfolio-wide: Elevate dark mode card surfaces (`bg-slate-900/80 border-white/10`), fix light mode text contrast, normalize modal border-radius to `rounded-3xl`, and refine input borders to 3:1 contrast.
2. **R5 (Text & Content Substance)**:
   - Apply exact text replacements in `projects.json`, `portfolio-data.ts`, `achievements.json`, `profile.json`, `skills.json`, `experience.json`, and `committees.json` (correcting "stres", "program kerja", "Beranda", and factual PKM milestones).
3. **Verification**:
   - Ready for automated test extension in `tests/e2e/runner.mjs`. Full technical survey findings are published in `.agents/teamwork/explorer_survey_g4_3/report.md`.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify Existing Test Suites**:
   ```powershell
   node tests/e2e/runner.mjs
   node tests/e2e/tier5-adversarial-m1.test.mjs
   ```
   *Expected outcome*: 61/61 and 12/12 tests pass cleanly with exit code 0.

2. **Inspect Specific Visual Defects in Source**:
   - Open `src/components/hero.tsx`:
     - Line 301–303: confirm `onModelClick` handler presence.
     - Line 294: confirm `hidden lg:flex` canvas wrapper.
     - Line 354: confirm `text-[7px]` typography.
   - Open `src/components/project-modal.tsx`:
     - Line 90: confirm asymmetric `rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px]`.
   - Open `src/app/globals.css`:
     - Line 31 & 48–51: confirm `--muted-foreground` and identical `--card` / `--background` values in dark mode.

3. **Verify Survey Deliverables**:
   - Inspect `.agents/teamwork/explorer_survey_g4_3/report.md` for complete technical recommendations and exact Before-After replacement tables.
