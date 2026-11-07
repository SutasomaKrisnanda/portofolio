# Comprehensive Technical Survey: Visual, Layout & Background Assets (Requirement R1)

**Agent**: teamwork_explorer 1: Visual & Layout Explorer (`explorer_survey_1`)  
**Mission**: Technical Investigation for Requirement R1 (Peningkatan Visual Hero-Section per Mode)  
**Parent Orchestrator ID**: `514f318a-382e-4a4c-bf5e-58e0d0eff1f1`  
**Date**: 2026-11-05  

---

## 1. Executive Summary

Requirement R1 mandates upgrading the hero section visuals for all three portfolio modes (**Tech & Engineering**, **Academic & Writing**, and **Medical & Health**) across both **dark** and **light** themes. The visual targets are defined by 6 high-fidelity reference mockups (`mode-tech-dark.png`, `mode-tech-light.png`, `mode-academic-dark.png`, `mode-academic-light.png`, `mode-medical-dark.png`, and `mode-medical-light.png`), powered by the ultra-optimized AVIF background assets found in `src/assets/image/*.avif`.

### Core Survey Findings:
1. **Reference Mockups Located & Analyzed**: The reference images were discovered in `C:\Users\ACER\Downloads\` and verified to correspond 1:1 with the 6 `.avif` background assets in `src/assets/image/`.
2. **Current Background Gap**: Currently, `src/components/hero.tsx` has **no background imagery whatsoever**. The global `src/components/fixed-background.tsx` only renders simple CSS linear gradients (`palette.pageGradient`), two blur glow orbs, and SVG geometric circles.
3. **Asset Alignment**: The 6 AVIF files in `src/assets/image/` range from 11.6 KB to 107.1 KB, providing pristine high-resolution photographic and 3D environment scenes that are already optimized for web performance.
4. **Layout Composition**: The hero section layout in the mockups is a sophisticated spatial arrangement consisting of:
   - A floating pill status bar / eyebrow.
   - A 5-column left typographic column with an embedded prism glyph in the headline, supporting narrative, and "Projek Terpilih" spotlight.
   - A 4-column center 3D stage sitting atop environmental pedestals.
   - A 3-column right vertical navigation column with rotated diamond cards and a numbered timeline.
   - A docked bottom shelf pill with "EXPLORE WORK", 4 navigational pillars, and carousel arrow switchers.
5. **Theme & Mode Architecture**: `activeMode` ('tech' | 'medical' | 'academic') is managed in `src/app/page.tsx` and synced with `localStorage` and URL parameters. Theme ('dark' | 'light') is managed via `useTheme()` in `src/components/theme-provider.tsx`.

---

## 2. Visual Reference Analysis (Mockup Decomposition)

Visual inspections were performed on all 6 reference images:

| Reference File | Mode | Theme | Primary Accent | Key Background Scene | Center 3D Subject |
|---|---|---|---|---|---|
| `mode-tech-dark.png` | Tech & Engineering | Dark | Electric Cyan (`#38bdf8`) | Night alpine mountain lake, starry nebula sky, blue water reflections | Floating iridescent crystal gem with orbital nodes |
| `mode-tech-light.png` | Tech & Engineering | Light | Vivid Sky Blue (`#0284c7`) | Sunlit snow-capped peaks, crystal blue sky, serene reflective lake | Floating blue crystal gem with orbital nodes |
| `mode-academic-dark.png` | Academic & Writing | Dark | Crimson / Rose (`#fb7185` / `#e11d48`) | Gothic scholar's library, dark mahogany, red maple foliage, golden circular pedestal | Glowing feather quill pen writing on an open book (`model-quill.glb`) |
| `mode-academic-light.png` | Academic & Writing | Light | Burgundy / Rose (`#e11d48` / `#be123c`) | Sun-drenched neoclassical marble library, golden arches, marble & brass pedestal | Glowing feather quill pen writing on an open book |
| `mode-medical-dark.png` | Medical & Health | Dark | Neon Purple / Violet (`#c084fc` / `#9333ea`) | Cybernetic biotech laboratory, glowing DNA helices, purple hologram pedestal | Holographic anatomical human heart (`model-jantung.glb`) with ECG & diagnostics |
| `mode-medical-light.png` | Medical & Health | Light | Deep Violet (`#9333ea` / `#7c3aed`) | Bright clinical hospital laboratory, stethoscope, journals, high-tech platform | Holographic anatomical human heart with diagnostics |

### Detailed Visual Elements per Mode:

### A. Tech & Engineering Mode (`tech`)
- **Headline**: `"SOFTWARE"` (top row, bold white/dark slate) + `"MATTER"` (bottom row, gradient cyan with `PrismTriangleGlyph` embedded as the 'A').
- **Eyebrow / Sub-badge**: `"I GEDE ARYA KRISNANDA SUTASOMA • FK UNDIKSHA"` inside a frosted pill badge.
- **Supporting Narrative**: *"Mengembangkan sistem manajemen organisasi (HMSSO & Portal HMJ Undiksha), platform belajar medis interaktif (VIVA-EDAN), prototipe aplikasi mobile kesehatan (Smart-KIA), serta utilitas teks berstandar PUEBI."*
- **Featured Project Spotlight**: Cyan left accent bar with text `"Projek Terpilih: HMSSO — Hermestha Management & Scientific System Online"` and an interactive circular chevron button.
- **Call-to-Action Buttons**:
  - Primary: `"Lihat Projek Teknis"` (high contrast white pill with dark text and circular arrow glyph in dark theme; vivid cyan pill with white text in light theme).
  - Secondary: `"Download CV"` (translucent pill with vector download arrow).
- **Center 3D Stage**: Iridescent polyhedron crystal hovering over the lake, annotated with 4 orbital labels: `"BUILD SYSTEMS"`, `"SOLVE PROBLEMS"`, `"LEARN CONSTANTLY"`, `"CREATE IMPACT"`.
- **Bottom Shelf Columns**:
  1. `"Sistem Organisasi"` / *"Laravel, Livewire, Filament & MySQL"*
  2. `"Antarmuka Interaktif"` / *"Next.js, React, Tailwind & Figma"*
  3. `"Inovasi Digital"` / *"VIVA-EDAN & Smart-KIA Architecture"*
  4. `"Production Systems"` / *"HMSSO & Portal HMJ"*

### B. Academic & Writing Mode (`academic`)
- **Headline**: `"SCHOLAR"` (top row, bold) + `"MATTER"` (bottom row, gradient crimson/rose with embedded prism glyph).
- **Eyebrow / Sub-badge**: Pill with red dot: `"Academic & Writing • Scholarly Writing, PKM & Innovation"` over `"I GEDE ARYA KRISNANDA SUTASOMA • FK UNDIKSHA"`.
- **Supporting Narrative**: *"Mengintegrasikan tradisi penalaran ilmiah di BSO Hermestha FK Undiksha dengan implementasi lapangan PKM-PM Bunda Bahagia, gagasan inovasi teknologi-lingkungan SIPADU-RI, artikel opini ilmiah populer di Kompasiana, serta rekayasa file gaya sitasi (CSL) otomatis untuk Mendeley Desktop."*
- **Featured Project Spotlight**: Rose/crimson left accent bar with text `"Projek Terpilih: PKM-PM 2026 — Bunda Bahagia"` and circular chevron button.
- **Call-to-Action Buttons**:
  - Primary: `"Lihat Naskah & PKM"` (white pill in dark theme; deep crimson in light theme).
  - Secondary: `"Download CV"`.
- **Center 3D Stage**: The 3D quill pen and open manuscript (`model-quill.glb`) resting on the circular pedestal with flying parchment pages, annotated with 4 orbital labels: `"RESEARCH & ANALYSIS"`, `"WRITE & COMMUNICATE"`, `"PUBLISH & IMPACT"`, `"IDEAS TO REAL SOLUTIONS"`.
- **Bottom Shelf Columns**:
  1. `"PKM-PM 2026"` / *"Naskah Inovasi Bunda Bahagia"*
  2. `"Otomasi Sitasi"` / *"Custom Mendeley CSL (dkk & petik)"*
  3. `"Publikasi Populer"` / *"Artikel Opini Ilmiah Kompasiana"*
  4. `"Inovasi Akademik"` / *"Penelitian, Esai, & Gagasan"*

### C. Medical & Health Mode (`medical`)
- **Headline**: `"CLINICAL"` (top row, bold) + `"MATTER"` (bottom row, gradient purple/violet with embedded prism glyph).
- **Eyebrow / Sub-badge**: Pill with purple dot: `"Medical & Health • Healthcare Education & Community Health"` over `"I GEDE ARYA KRISNANDA SUTASOMA • FK UNDIKSHA"`.
- **Supporting Narrative**: *"Memadukan dasar biomedis pra-klinis di FK Undiksha dengan aksi nyata kesehatan masyarakat, model edukasi interaktif (VIVA-EDAN), kerangka digital Buku KIA (Smart-KIA), serta pengabdian organisasi kemahasiswaan."*
- **Featured Project Spotlight**: Purple left accent bar with text `"Projek Terpilih: HMSSO — Hermestha Management & Scientific System Online"` and circular chevron button.
- **Call-to-Action Buttons**:
  - Primary: `"Lihat Karya Kesehatan"` (white pill in dark theme; vivid purple in light theme).
  - Secondary: `"Download CV"`.
- **Center 3D Stage**: Holographic human heart (`model-jantung.glb`) floating above the cybernetic platform with glowing diagnostics, annotated with 4 orbital labels: `"HEALTH EDUCATION"`, `"IMPROVE COMMUNITY HEALTH"`, `"FROM KNOWLEDGE TO IMPACT"`.
- **Bottom Shelf Columns**:
  1. `"S1 Kedokteran"` / *"FK Undiksha (Angkatan 2025, Kelas K)"*
  2. `"Kesehatan Komunitas"` / *"Pustu Panji Anom: MBSR & Musik Rindik"*
  3. `"Inovasi Digital"` / *"VIVA-EDAN & Smart-KIA"*
  4. `"Amanah Organisasi"` / *"BSO Hermestha & HMJ Kedokteran"*

---

## 3. Background Asset Inventory & Mapping

The assets in `src/assets/image/` were inspected and cataloged:

| Asset Path | Mode Mapping | Theme Mapping | Size on Disk | Format & Properties |
|---|---|---|---|---|
| `src/assets/image/bg-tech-dark.avif` | `tech` | `dark` | 50,328 bytes (~49.1 KB) | AVIF 1920x1080, dark night alpine landscape, cyan water reflection |
| `src/assets/image/bg-tech-light.avif` | `tech` | `light` | 107,156 bytes (~104.6 KB) | AVIF 1920x1080, daylight alpine mountains, crystal blue sky & lake |
| `src/assets/image/bg-academic-dark.avif` | `academic` | `dark` | 46,669 bytes (~45.5 KB) | AVIF 1920x1080, dark mahogany library, gothic window, gold pedestal |
| `src/assets/image/bg-academic-light.avif` | `academic` | `light` | 51,221 bytes (~50.0 KB) | AVIF 1920x1080, bright sunlit marble library, golden arches & pedestal |
| `src/assets/image/bg-medical-dark.avif` | `medical` | `dark` | 11,681 bytes (~11.4 KB) | AVIF 1920x1080, cyber biotech lab, purple glowing DNA helices & pedestal |
| `src/assets/image/bg-medical-light.avif` | `medical` | `light` | 45,369 bytes (~44.3 KB) | AVIF 1920x1080, modern clinical laboratory, bright panoramic window & platform |

### Next.js Image Integration Compatibility:
- In `next.config.ts`, `images: { unoptimized: true }` is enabled due to `output: 'export'`.
- Next.js supports importing `.avif` files directly via ES import statements (`import bgTechDark from '@/assets/image/bg-tech-dark.avif'`), which provides Next.js `StaticImageData` with `src`, `width`, `height`, and optional blur data.
- Testing verified that `node_modules/next/image-types/global.d.ts` contains native TypeScript declarations for `*.avif`.

---

## 4. Current Codebase Architecture & Investigation Points

### A. Existing Hero Component (`src/components/hero.tsx`)
- **Container Structure** (lines 54–65):
  ```tsx
  <section
    id="hero"
    ...
    className="relative w-full h-screen min-h-[640px] flex flex-col justify-between pt-20 sm:pt-24 pb-4 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
  >
  ```
- **Missing Background**: There is no `<img>`, `<Image>`, or CSS `backgroundImage` in `hero.tsx`.
- **Top Bar** (lines 66–89): Renders mode short label and 2 verified highlights from `modeConfig.hero.verifiedHighlights`.
- **Left Column** (lines 94–163): Renders `fullName`, `topWord`, `bottomWordBeforeA`, `PrismTriangleGlyph`, `bottomWordAfterA`, and CTA buttons.
- **Center Column** (lines 165–179): Embeds `<IridescentCrystalCanvas>` for all modes.
- **Right Column** (lines 181–251): Renders 3 diamond cards with `DiamondArtifactGlyph` and static 4-number timeline (`[3, 2, 1, 0]`).
- **Bottom Shelf** (lines 254–307): Renders "EXPLORE WORK", shelf column buttons from `modeConfig.fractalShowcase.bottomShelfColumns`, and slide switch arrows.

### B. Existing Fixed Background (`src/components/fixed-background.tsx`)
- Lines 40–45:
  ```tsx
  <div
    className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ease-out overflow-hidden"
    style={{
      background: palette.pageGradient
    }}
  >
  ```
- Uses `palette.pageGradient` from `PORTFOLIO_MODES[activeMode].palette[theme]`.
- Contains 2 animated blur orbs and an SVG circle mesh.
- When on the Hero section, this generic gradient does not show the rich environment assets seen in the reference mockups.

### C. Theme & Mode State Management
- **Mode State**:
  - `activeMode: ModeId` ('tech' | 'medical' | 'academic') lives in `src/app/page.tsx` line 33.
  - Persisted to `localStorage.getItem('arya_portfolio_mode')` and synchronized to URL search param `?mode=...` via `window.history.pushState`.
  - Mode switching is handled via `handleSwitchMode` in `src/app/page.tsx:89-97`.
- **Theme State**:
  - Stored in `src/components/theme-provider.tsx` using `ThemeProviderContext`.
  - Exposes `theme` ('dark' | 'light' | 'system') and `resolvedTheme` ('dark' | 'light').
  - Sets `.dark` class on `document.documentElement`.
  - Toggled via `ThemeToggle` in `src/components/theme-toggle.tsx`.

### D. CSS & Styling Hooks (`tailwind.config.ts` & `src/app/globals.css`)
- Tailwind is configured with `darkMode: ['class']`.
- Custom font families: `font-headline` and `font-body` using Inter / Plus Jakarta Sans / Outfit.
- Plugin `tailwindcss-animate` is available.
- Custom scrollbar styling in `globals.css` with `.custom-scrollbar`.

---

## 5. Architectural Blueprint for Requirement R1 Implementation

To achieve 100% fidelity with the reference images while preserving performance, accessibility, and clean component architecture:

### 1. Dedicated `HeroBackground` Layer in `hero.tsx`
Create a high-performance, cross-fading background component inside `<section id="hero">` positioned at `absolute inset-0 pointer-events-none z-0`:

```tsx
// Mapping of all 6 state combinations:
const HERO_BACKGROUND_ASSETS: Record<ModeId, { dark: StaticImageData; light: StaticImageData }> = {
  tech: { dark: bgTechDark, light: bgTechLight },
  academic: { dark: bgAcademicDark, light: bgAcademicLight },
  medical: { dark: bgMedicalDark, light: bgMedicalLight },
};
```

Render all 6 images with Next.js `<Image fill priority sizes="100vw" className="object-cover object-center transition-opacity duration-700 ease-out" />`:
- Set `opacity-100` on the active `(mode === activeMode && isLight === activeTheme)` image and `opacity-0` on the other 5 images.
- This technique preloads and caches the images in browser memory, enabling silky-smooth cross-fades without black/white flashes or layout shifts when switching modes or toggling dark/light themes.

### 2. High-Fidelity Contrast & Readability Overlays
Add subtle environmental overlay gradients over the background image:
- **Dark Theme Overlay**:
  - Top header vignette: `linear-gradient(to bottom, rgba(3, 7, 18, 0.6) 0%, transparent 25%)`
  - Bottom shelf vignette: `linear-gradient(to top, rgba(3, 7, 18, 0.8) 0%, transparent 40%)`
  - Left content contrast shade: `linear-gradient(to right, rgba(3, 7, 18, 0.7) 0%, rgba(3, 7, 18, 0.3) 40%, transparent 70%)`
- **Light Theme Overlay**:
  - Top header vignette: `linear-gradient(to bottom, rgba(255, 255, 255, 0.65) 0%, transparent 25%)`
  - Bottom shelf vignette: `linear-gradient(to top, rgba(255, 255, 255, 0.85) 0%, transparent 40%)`
  - Left content contrast shade: `linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 70%)`
This guarantees that all typography, buttons, and badges maintain WCAG AAA contrast ratios across all screen sizes.

### 3. Synchronized Pedestal Alignment with 3D Models (R2 Cross-Cut)
The reference images show that each background has a deliberate ground plane:
- `tech`: The mountain lake surface reflection is at the bottom 40% of the screen.
- `academic`: The circular brass/gold pedestal sits in the center-bottom of the frame.
- `medical`: The glowing circular cyber platform sits in the center-bottom of the frame.
By rendering the background behind the center column and ensuring the 3D canvas is transparent (`alpha: true`), the 3D models (`model-jantung.glb`, `model-quill.glb`, and the crystal polyhedron) appear physically seated on their real environmental pedestals.

### 4. Preservation of Lower Sections (`FixedBackground`)
`FixedBackground` in `src/components/fixed-background.tsx` remains active for sections 2 through 6 (`projects`, `about`, `skills`, `achievements`, `contact`). Because `hero.tsx` has its own local background layer with `scroll-snap-align-start`, scrolling down smoothly reveals the ambient card surfaces of the project showcase without visual collision.

---

## 6. Cross-Cutting Integration Matrix

| Requirement | Interface Point in Hero Section | Dependency on R1 Visual Survey |
|---|---|---|
| **R1 (Visuals & Background)** | `hero.tsx` (background layer, color palettes, button styles, typography) | Direct owner. Defines the 6 visual styles, contrast overlays, and responsive bounds. |
| **R2 (3D Models)** | `hero.tsx` center column (lines 165–179) | 3D canvas must have transparent background so models align with background pedestals. |
| **R3 (Dynamic Project Icons)** | `hero.tsx` right column diamond cards (line 207) | Diamond cards must render active mode SVGs (`project-tech.svg`, etc.) matching the active visual theme. |
| **R4 (Dynamic JSON Navigation)** | `hero.tsx` right column indicators (lines 222–250) | Replaces static `[3, 2, 1, 0]` with dynamic items matching featured projects count (3 items in current dataset). |
| **R5 (Modal Integration)** | `hero.tsx` card click & "Lihat Detail" CTA | Single-click on active card and "Projek Terpilih" chevron button triggers `onOpenProject(currentHeroProject)`. |
| **R6 (Animations & Tooltips)** | All interactive buttons in `hero.tsx` | Wrap action buttons, arrows, indicators, and shelf links with Radix `<Tooltip>` and Framer/Tailwind slide animations. |

---

## 7. Verification and Build Guidance

1. **Static Build Check Command**:
   To test the production build on this Windows environment:
   ```powershell
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
   *Expected outcome*: `✓ Generating static pages (5/5)`, `✓ Exporting (2/2) to out/`.

2. **TypeScript Compilation Check**:
   ```powershell
   node node_modules/typescript/bin/tsc --noEmit
   ```
   *Expected outcome*: Clean compilation with exit code 0.

3. **Runtime Visual Verification Checklist**:
   - [ ] Switch to **Tech Mode** (dark and light): verify `bg-tech-dark.avif` and `bg-tech-light.avif` display properly.
   - [ ] Switch to **Academic Mode** (dark and light): verify `bg-academic-dark.avif` and `bg-academic-light.avif` display properly.
   - [ ] Switch to **Medical Mode** (dark and light): verify `bg-medical-dark.avif` and `bg-medical-light.avif` display properly.
   - [ ] Verify background cross-fade is smooth with no flashes during mode switches.
   - [ ] Verify text and button contrast in both light and dark themes.
