# Project: Portfolio Performance Optimization & UI/UX Refresh (GitHub Pages)

## Architecture
- **Framework**: Next.js 15.5.6 (App Router, Static Export `output: 'export'`) with React 19, TypeScript (strict mode), Tailwind CSS v3, and `tailwindcss-animate`.
- **Mode & Theme System**:
  - `activeMode`: `'tech' | 'medical' | 'academic'` managed in `src/app/page.tsx` via URL param `?mode=` and `localStorage`.
  - `resolvedTheme`: `'dark' | 'light'` managed via `next-themes` (`ThemeProvider`, `useTheme()`).
- **3D Graphics Engine (Lightweight Procedural Architecture)**:
  - Client-side Three.js canvas in `src/components/hero-3d-scene.tsx` (or `crystal-canvas.tsx`):
    - **Tech**: Procedural crystalline IcosahedronGeometry + outer wireframe cage + orbital quantum nodes (~72 triangles, 0 kB download).
    - **Medical**: Procedural B-DNA Double Helix using dual `CatmullRomCurve3` tubes, paired nucleotide cylinders, and terminal phosphate beads (~3,500 triangles, 0 kB download).
    - **Academic**: Procedural Calligraphy Feather Quill (Pena Bulu) with curved spine tube, custom parametric ribbon BufferGeometry vanes with asymmetric barbs, and polished brass calligraphy nib (~730 triangles, 0 kB download).
    - Instantaneous synchronous transitions; 60 FPS rendering; complete recursive GPU resource disposal (`disposeHierarchy`) on unmount.
- **Gallery UI/UX & Dynamic Icon Architecture**:
  - `src/components/projects.tsx`: Responsive dual-track category pills: single-row horizontal scroll (`no-scrollbar`) with left/right fade masks on mobile (< 640px) saving >80% vertical space; spacious wrapping on desktop.
  - `src/components/achievements.tsx`: Single-row horizontal scroll with dedicated filter row and fade masks on mobile; spacious wrapping on desktop.
  - Category State Synchronization: Reset `selectedCategory` to `'All'` upon `activeMode` change across both galleries.
  - Dynamic Mode Icon Resolution: `<ProjectModeIcon mode={activeMode} project={project} />` in `src/components/projects.tsx` replacing `DiamondArtifactGlyph`, dynamically displaying active mode icon for multi-mode projects with fallback to `project.mode` / `'tech'`.
- **Smart Bento Grid Architecture ("Tentang Saya")**:
  - `src/components/about.tsx`: 5-Tile 12-Column modular Bento Box:
    - Tile 1 (Bio & Identity): `lg:col-span-8`
    - Tile 2 (Coordinates & Contact): `lg:col-span-4`
    - Tile 3 (Methodology Principles): `lg:col-span-4`
    - Tile 4 (Formal Education): `lg:col-span-8`
    - Tile 5 (Smart Adaptive History Bento): `lg:col-span-12` (Full Container Width)
  - Tile 5 Houses Experience & Committees behind an interactive Segmented Switcher (`Semua`, `Organisasi`, `Kepanitiaan`), rendered in an auto-flowing 3-column subgrid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) with progressive disclosure toggle ("Tampilkan N Lainnya / Ringkas"). Eliminates vertical imbalance ("timpang sebelah") permanently.
- **Build & System Stabilization**:
  - `patch-fs.js`: Includes DrvFs fallback for `middleware-manifest.json` ensuring clean static builds (`npm run build`) execute reliably with exit code 0.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1 Procedural Tech Polyhedron | High-performance crystalline polyhedron with wireframe cage and orbital nodes | M3 | ORIGINAL_REQUEST § R1 |
| 2 | R1.2 Procedural Medical Helix DNA | Double-helix B-DNA with dual curve tubes, base-pair rungs, and terminal spheres | M3 | ORIGINAL_REQUEST § R1 |
| 3 | R1.3 Procedural Academic Pena Bulu | Feather quill with arched spine tube, custom ribbon vanes, and brass nib | M3 | ORIGINAL_REQUEST § R1 |
| 4 | R1.4 Instant 3D Model Transitions | Eliminate GLTFLoader/MeshoptDecoder network latency; instantaneous model switches | M3 | ORIGINAL_REQUEST § R1 |
| 5 | R1.5 60 FPS Loop & GPU Cleanup | Interactive pointer rotation, smooth animations, and recursive disposal on unmount | M3 | ORIGINAL_REQUEST § R1 |
| 6 | R1.6 Hero 3D Labels & Captions | Update hero 3D model captions and skeleton loader text per active mode | M3 | ORIGINAL_REQUEST § R1 |
| 7 | R2.1 Projects Gallery Category Pills | Single-row horizontal scroll with fade masks on mobile; responsive wrap on desktop | M1 | ORIGINAL_REQUEST § R2 |
| 8 | R2.2 Achievements Category Pills | Dedicated filter row, horizontal scroll with fade masks on mobile; wrap on desktop | M1 | ORIGINAL_REQUEST § R2 |
| 9 | R2.3 Category Filter Mode Sync | Auto-reset selectedCategory to 'All' when activeMode changes in both galleries | M1 | ORIGINAL_REQUEST § R2 |
| 10 | R4.1 Project Card Mode Icon | Replace DiamondArtifactGlyph with ProjectModeIcon in projects gallery cards | M1 | ORIGINAL_REQUEST § R4 |
| 11 | R4.2 Multi-Mode Dynamic Icon Resolution | Dynamically match activeMode on multi-mode projects with reliable fallback | M1 | ORIGINAL_REQUEST § R4 |
| 12 | R0.1 Build Stabilization Patch | Add middleware-manifest fallback to patch-fs.js for reliable clean static builds | M1 | Survey P2-3 |
| 13 | R3.1 5-Tile 12-Column Bento Layout | Modular Bento Grid in About section eliminating 7-to-5 column vertical disparity | M2 | ORIGINAL_REQUEST § R3 |
| 14 | R3.2 Segmented History Track Switcher | Interactive tabs ('Semua', 'Organisasi', 'Kepanitiaan') in Tile 5 | M2 | ORIGINAL_REQUEST § R3 |
| 15 | R3.3 Auto-Flow Subgrid & Disclosure | 3-column auto-flow grid with progressive disclosure toggle ("Tampilkan N Lainnya") | M2 | ORIGINAL_REQUEST § R3 |
| 16 | R3.4 Responsive Viewport Balance | Balanced, proportional layout across mobile (<640px), tablet, and desktop | M2 | ORIGINAL_REQUEST § R3 |
| 17 | E2E.1 Comprehensive E2E Test Suite | Opaque-box test suite for R1-R4 covering Tiers 1-4 with automated test runner | E2E | ORIGINAL_REQUEST § Acceptance Criteria |
| 18 | E2E.2 100% E2E Pass & Hardening | Pass 100% of E2E test suite + Tier 5 adversarial coverage hardening | M4 | Dual Track Final Milestone |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Gallery Category Pills, Dynamic Mode Icons & Build Stabilization | Features 7, 8, 9, 10, 11, 12 (R2, R4, R0.1) | none | IN_PROGRESS |
| M2 | Smart Bento Grid Adaptif pada Bagian Tentang Saya | Features 13, 14, 15, 16 (R3) | none | PLANNED |
| M3 | Model 3D Hero-Section Ringan per Mode | Features 1, 2, 3, 4, 5, 6 (R1) | none | PLANNED |
| E2E | E2E Testing Track: Opaque-Box Suite | Feature 17 (Tiers 1-4 test runner & test suites) | none | IN_PROGRESS |
| M4 | Final Milestone: 100% E2E Test Pass & Adversarial Hardening | Feature 18 (Tiers 1-4 pass + Tier 5 hardening + Forensic Audit) | M1, M2, M3, E2E | PLANNED |

## Interface Contracts
### Mode & Theme State Contract
- `activeMode: 'tech' | 'medical' | 'academic'` passed to `Hero`, `Projects`, `Achievements`, `About`, `ProjectModeIcon`, and `Hero3DScene`.
- `resolvedTheme: 'dark' | 'light'` passed to `Hero3DScene` and environmental containers.

### Project Mode Icon Contract
- `<ProjectModeIcon mode={activeMode} project={project} className="..." />`
- Multi-mode resolution logic:
  - If `project.mode === activeMode || project.secondaryModes?.includes(activeMode)` -> display `activeMode` icon.
  - Else -> fallback to `project.mode` (or `'tech'`).

### Category Filter Synchronization Contract
- When `activeMode` changes:
  ```typescript
  useEffect(() => {
    setSelectedCategory('All');
  }, [activeMode]);
  ```

### Smart Bento Grid Tile 5 Contract
- Container: `lg:col-span-12`
- Segmented control options: `'all' | 'experience' | 'committees'`
- Initial display: up to 6 cards; expand toggle reveals remainder with smooth animation.

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
- Instant synchronous transition: `createTechPolyhedron(theme)`, `createMedicalHelixDNA(theme)`, `createAcademicPenaBulu(theme)`.

## Code Layout
- `src/components/hero.tsx`: Main hero section coordinator and 3D caption labels.
- `src/components/hero-3d-scene.tsx`: Procedural Three.js models (Polyhedron, Helix DNA, Pena Bulu) with recursive disposal.
- `src/components/hero-3d-skeleton.tsx`: Skeleton loader labels per mode.
- `src/components/projects.tsx`: Projects gallery with compact mobile category pills and dynamic project mode icons.
- `src/components/achievements.tsx`: Achievements gallery with dedicated compact mobile category pills.
- `src/components/project-mode-icon.tsx`: Dynamic SVG mode icon resolver.
- `src/components/about.tsx`: 5-Tile 12-Column Smart Bento Grid with full-width Adaptive History Track.
- `src/app/globals.css`: `no-scrollbar` utility support.
- `patch-fs.js`: Static build DrvFs manifest fallback patch.
- `tests/e2e/`: Opaque-box test suites (Tiers 1-4, Tier 5).
