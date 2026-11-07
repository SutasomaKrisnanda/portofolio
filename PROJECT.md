# Project: Portfolio Hero-Section Enhancement & Cross-Mode UI/UX Refinement

## Architecture
- **Framework**: Next.js 15.5.6 (App Router, Static Export `output: 'export'`) with React 19, TypeScript (strict mode), Tailwind CSS v3, and `tailwindcss-animate`.
- **Mode & Theme System**:
  - `activeMode`: `'tech' | 'medical' | 'academic'` managed in `src/app/page.tsx` via URL param `?mode=` and `localStorage`.
  - `resolvedTheme`: `'dark' | 'light'` managed via `next-themes` (`ThemeProvider`, `useTheme()`).
- **Visual Presentation**:
  - `HeroBackground`: Dynamic multi-layer cross-fading background rendered in `src/components/hero.tsx` using 6 `.avif` assets from `src/assets/image/` with contrast vignettes for WCAG AAA accessibility.
- **3D Graphics Engine**:
  - Client-side Three.js canvas in `src/components/hero-3d-scene.tsx` (or updated `crystal-canvas.tsx`) supporting:
    - Tech: Procedural crystal/polyhedron.
    - Medical: `model-jantung.glb` (18.14MB) decoded via `MeshoptDecoder`.
    - Academic: `model-quill.glb` (90.19MB) with progressive loading.
    - Assets served from `public/models/` for Next.js static export compatibility.
- **Project Navigation & Data Flow**:
  - Dataset: `src/data/projects.json` typed via `src/data/portfolio-data.ts`.
  - Dynamic filter: `p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))`.
  - Dynamic indicators matching filtered count; slide index resets to 0 on mode change.
  - Dynamic icon: `<ProjectModeIcon mode={activeMode} />` using SVG assets from `src/assets/icons/`.
- **Modal Architecture**:
  - `src/components/project-modal.tsx`: 3-tier Flexbox layout (`flex flex-col max-h-[90vh] overflow-hidden`) with fixed header (zero jumping), scrollable inner body (confined scrollbar, zero leakage over asymmetric corners), and fixed footer.
  - Interactive integration: Single-click active card or "Lihat Detail" button opens modal.
- **Micro-Interactions & Tooltips**:
  - Slide block transitions driven by reactive React keys and Tailwind animations.
  - Radix UI tooltips (`src/components/ui/tooltip.tsx`) on all interactive hero buttons for hover and keyboard focus.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1 Background AVIF Mapping | Map and pre-render 6 `.avif` background images from `src/assets/image/` for Tech, Academic, Medical in Light and Dark themes | M1 | ORIGINAL_REQUEST § R1 |
| 2 | R1.2 Hero Background Cross-Fade | Implement smooth cross-fading opacity transitions between backgrounds when changing mode or theme | M1 | ORIGINAL_REQUEST § R1 |
| 3 | R1.3 Contrast & Vignette Overlays | Add contrast vignettes to ensure text readability on top of environmental backgrounds | M1 | ORIGINAL_REQUEST § R1 |
| 4 | R2.1 Three.js Infrastructure | Set up Three.js with GLTFLoader and MeshoptDecoder for Next.js static export compatibility | M2 | ORIGINAL_REQUEST § R2 |
| 5 | R2.2 Medical 3D Heart Model | Render `model-jantung.glb` in Medical mode with Meshopt decompression, scaling, and lighting | M2 | ORIGINAL_REQUEST § R2 |
| 6 | R2.3 Academic 3D Quill Model | Render `model-quill.glb` in Academic mode with proper lighting, scale, and loading state | M2 | ORIGINAL_REQUEST § R2 |
| 7 | R2.4 Tech Mode 3D Object | Maintain/render 3D polyhedron for Tech mode aligned on background pedestal | M2 | ORIGINAL_REQUEST § R2 |
| 8 | R3.1 SVG Icon Integration | Import and integrate SVG icons (`project-tech.svg`, `project-medical.svg`, `project-academic.svg`) from `src/assets/icons/` | M1 | ORIGINAL_REQUEST § R3 |
| 9 | R3.2 Dynamic Mode Icon Reaction | Dynamically render project icon based on current active mode, supporting multi-mode projects | M1 | ORIGINAL_REQUEST § R3 |
| 10 | R4.1 JSON Featured Filter | Dynamically filter projects from `src/data/projects.json` using `featured: true` and active/secondary mode | M3 | ORIGINAL_REQUEST § R4 |
| 11 | R4.2 Dynamic Slide Controls | Replace static '1, 2, 3, 4' buttons with dynamic navigation indicators/tabs matching filtered count | M3 | ORIGINAL_REQUEST § R4 |
| 12 | R4.3 Slide Index Synchronization | Auto-reset active slide index to 0 when `activeMode` changes | M3 | ORIGINAL_REQUEST § R4 |
| 13 | R5.1 3-Tier Modal Flexbox Layout | Refactor modal layout into fixed header, scrollable body, and fixed footer to eliminate title jumping | M3 | ORIGINAL_REQUEST § R5 |
| 14 | R5.2 Scrollbar Boundary Confinement | Confine scrollbar within modal body to eliminate double scrollbars and border-radius leakage | M3 | ORIGINAL_REQUEST § R5 |
| 15 | R5.3 Responsive Typography & Wrapping | Fix text wrapping, title clamp, metadata ribbon, and list margins across mobile/tablet/desktop | M3 | ORIGINAL_REQUEST § R5 |
| 16 | R5.4 Hero Modal Trigger Integration | Open modal on single-click of active project card or explicit "Lihat Detail" action button | M3 | ORIGINAL_REQUEST § R5 |
| 17 | R6.1 Hero Slide Block Animations | Add smooth slide enter/exit transition animations to hero blocks using reactive keys | M3 | ORIGINAL_REQUEST § R6 |
| 18 | R6.2 Radix UI Tooltips | Equip all interactive buttons in hero section with accessible tooltips for hover and focus | M3 | ORIGINAL_REQUEST § R6 |
| 19 | R0.1 Windows Build Patch Stability | Relocate `src/app/favicon.ico` to `public/favicon.ico` to permanently resolve Windows WSL `readlink` EISDIR error | M1 | Explorer Survey 2 & 3 |
| 20 | E2E.1 E2E Test Suite | Comprehensive opaque-box test suite covering Tiers 1-4 with automated test runner | E2E | ORIGINAL_REQUEST § Acceptance Criteria |
| 21 | E2E.2 100% E2E Verification & Hardening | Implementation track validation passing 100% of E2E tests and Tier 5 adversarial hardening | M4 | Dual Track Final Milestone |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Visual Backgrounds, Dynamic Project Icons & Build Stabilization | Features 1, 2, 3, 8, 9, 19 (R1, R3, Favicon fix) | none | IN_PROGRESS |
| M2 | 3D WebGL Canvas & GLB Models Integration | Features 4, 5, 6, 7 (R2: Medical Heart, Academic Quill, Tech Polyhedron) | M1 | PLANNED |
| M3 | Dynamic Project Navigation, Modal Refactor, Animations & Tooltips | Features 10, 11, 12, 13, 14, 15, 16, 17, 18 (R4, R5, R6) | M1 | PLANNED |
| M4 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Features 21 (Tiers 1-4 pass + Tier 5 coverage audit) | M2, M3, E2E | PLANNED |

## Interface Contracts
### Mode & Theme State Contract
- `activeMode: 'tech' | 'medical' | 'academic'` passed to `Hero`, `HeroBackground`, `ProjectModeIcon`, and `Hero3DScene`.
- `resolvedTheme: 'dark' | 'light'` passed to `HeroBackground` and `Hero3DScene`.

### Project Data Contract
- `Project` interface from `src/data/portfolio-data.ts`:
  - `id: string`
  - `title: string`
  - `featured: boolean`
  - `mode: ModeId`
  - `secondaryModes?: ModeId[]`
- Filter contract:
  ```typescript
  const featuredHeroProjects = projects.filter(
    (p) => p.featured && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
  );
  ```

### Modal Trigger Contract
- `onOpenProject: (project: Project) => void`
- Triggered by:
  - Single-click on currently active preview card in `Hero`.
  - Click on "Lihat Detail" / "Detail Studi Kasus" CTA button in `Hero`.
  - Click on 3D canvas object in `Hero`.

### 3D Scene Contract
- Props for `Hero3DScene`:
  ```typescript
  interface Hero3DSceneProps {
    mode: ModeId;
    theme: 'dark' | 'light';
    onModelClick?: () => void;
    className?: string;
  }
  ```

## Code Layout
- `src/components/hero.tsx`: Main hero section coordinator.
- `src/components/hero-background.tsx`: New component dedicated to 6 `.avif` background layers with cross-fading & contrast vignettes.
- `src/components/hero-3d-scene.tsx`: Three.js canvas supporting Tech polyhedron, Medical heart, Academic quill.
- `src/components/project-mode-icon.tsx`: Dynamic SVG icon renderer based on `activeMode`.
- `src/components/project-modal.tsx`: Refactored 3-tier Flexbox modal component.
- `src/components/ui/tooltip.tsx`: Radix UI tooltip wrapper.
- `public/models/`: Mirror directory for `model-jantung.glb` and `model-quill.glb` for static export.
- `public/favicon.ico`: Relocated from `src/app/favicon.ico`.
