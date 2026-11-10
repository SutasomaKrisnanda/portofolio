# Project: Production Portfolio UI/UX, 3D Asset Restoration & Physics Engine (Gen 4)

## Architecture
- **Framework**: Next.js 15.5.6 (App Router, Static Export `output: 'export'`) with React 19, TypeScript (strict mode), Tailwind CSS v3, and `tailwindcss-animate`.
- **Mode & Theme System**:
  - `activeMode`: `'tech' | 'medical' | 'academic'` managed in `src/app/page.tsx` via URL param `?mode=` and `localStorage`.
  - `resolvedTheme`: `'dark' | 'light'` managed via `next-themes` (`ThemeProvider`, `useTheme()`).
- **3D Graphics Engine & Physics Hierarchy**:
  - Located in `src/components/hero-3d-scene.tsx`:
    - **Medical**: Authentic `model-jantung.glb` loaded from `public/models/` via Three.js `GLTFLoader` with `MeshoptDecoder`, featuring 72 BPM cardiac Lub-Dub pulse animation ($f = 1.2\text{ Hz}$, dual systole/atrial kick pulse).
    - **Academic**: Authentic `model-pena.glb` loaded from `public/models/` (16.8MB, replacing legacy 90MB quill) via Three.js `GLTFLoader` with harmonic levitation ($Y = \sin(1.6t)\cdot 0.09$) and scribe wobble.
    - **Tech**: Procedural crystalline geometric glyphs via `DiamondArtifactGlyph` (`src/components/geometric-glyphs.tsx`) restored for tech mode project cards in `project-mode-icon.tsx`.
    - **Physics & Transform Hierarchy**:
      $$\text{Scene} \longrightarrow \text{cursorTrackingGroup} \longrightarrow \text{dragPivotGroup} \longrightarrow \text{modelMesh/group}$$
      - `cursorTrackingGroup`: Smoothly tracks normalized cursor coordinates $(u, v) \in [-1, 1]$ via critically damped exponential smoothing ($\alpha = 1 - e^{-k \Delta t}$). Zero rotation when cursor is idle/stationary.
      - `dragPivotGroup`: Free manual drag rotation with exponential viscous friction damping ($\vec{\omega}(t+\Delta t) = \vec{\omega}(t) \cdot e^{-\mu \Delta t}$). Halts smoothly without position reset or snapping.
      - Decoupled from project modal: Zero `onModelClick` triggers.
- **Hero-Section Layout & Sizing**:
  - Reduced canvas dimensions (`lg:w-[360px] lg:h-[380px]` / `xl:w-[400px] xl:h-[420px]`), model normalization `targetSize: 2.40`, reduced top/bottom padding (`pt-16 lg:pt-20 pb-4 sm:pb-6`), and tightened grid gaps (`gap-4 lg:gap-6`).
  - Guarantees headline, 3D model, and "Explore work" bar fit comfortably above the fold on all desktop (768p, 1080p) and mobile viewports.
- **Refactoring UI Overhaul & Design System Polish**:
  - Highlighted project card in Hero: Replace 7px diamond cards with elevated glass preview carousel cards with accessible typography (>= 12px), mode-specific focus halos, and aligned segmented indicators.
  - Contrast & Theme Tokens in `src/app/globals.css`: Fix `--muted-foreground` to achieve WCAG AA (>= 4.5:1), establish layered surface lightness stacking for dark mode cards (`bg-slate-900/80 border-white/10`).
  - Modal & Component Refinement: Normalize asymmetric corners in `src/components/project-modal.tsx` to `rounded-3xl`, clean up card borders, and polish spacing/typography.
- **Content & Text Substance Alignment**:
  - Standardize Indonesian and English copy across `src/data/*.json` and components: fix informal slang ("program kerja"), fix typos ("stres"), ensure navigation consistency ("Beranda"), and ensure accurate academic/PKM representation.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1 Tech Mode Geometric Glyphs | Restore legacy DiamondArtifactGlyph shapes (chrome sphere, crystal octahedron, monolith) for tech mode in project-mode-icon.tsx | M1 | ORIGINAL_REQUEST § R1 |
| 2 | R1.2 Medical Heart 3D Model | Serve authentic model-jantung.glb from public/models/ with 72 BPM cardiac pulse animation via MeshoptDecoder | M1 | ORIGINAL_REQUEST § R1 |
| 3 | R1.3 Academic Pena 3D Model | Serve authentic model-pena.glb from public/models/ (16.8MB) with harmonic levitation and scribe wobble animation | M1 | ORIGINAL_REQUEST § Follow-up |
| 4 | R1.4 Decouple 3D Model from Modal | Eliminate onModelClick listener from 3D scene and canvas; clicking 3D model never opens project modal | M1 | ORIGINAL_REQUEST § R1 |
| 5 | R2.1 Hero Viewport Layout & Sizing | Optimize canvas dimensions (360x380 to 400x420) and padding to keep 'Explore work' bar within viewport on desktop and mobile | M1 | ORIGINAL_REQUEST § R2 |
| 6 | R3.1 Smooth Cursor Tracking | Smoothly rotate and orient 3D model toward cursor coordinates without translating; zero rotation when idle | M2 | ORIGINAL_REQUEST § R3 |
| 7 | R3.2 Manual Drag Rotation | Enable free manual drag rotation with authentic velocity integration | M2 | ORIGINAL_REQUEST § R3 |
| 8 | R3.3 Physical Inertia & Damping | Exponential viscous friction damping upon drag release; deceleration to rest without position snapping | M2 | ORIGINAL_REQUEST § R3 |
| 9 | R3.4 Two-Tier Scene Hierarchy | cursorTrackingGroup -> dragPivotGroup -> modelMesh hierarchy preventing transform conflicts | M2 | ORIGINAL_REQUEST § R3 |
| 10 | R4.1 Elevated Hero Project Carousel | Replace 7px diamond cards with elevated glass preview cards adhering to Refactoring UI type scale (>= 12px) | M3 | ORIGINAL_REQUEST § R4 |
| 11 | R4.2 Systemic UI/UX Contrast & Tokens | Fix globals.css muted-foreground contrast (>= 4.5:1), dark mode card elevation, and normalize modal border radius | M3 | ORIGINAL_REQUEST § R4 |
| 12 | R4.3 Component Polish Across Portfolio | Spacing, border, typography, and visual hierarchy polish across About, Projects, Achievements, Contact, and Footer | M3 | ORIGINAL_REQUEST § R4 |
| 13 | R5.1 Content Typos & PUEBI Polish | Correct typos ("stres"), formalize slang ("program kerja"), and standardize copy in data JSON files | M3 | ORIGINAL_REQUEST § R5 |
| 14 | R5.2 Navigation & Milestone Consistency | Standardize nav label ("Beranda") and ensure factual accuracy of academic/PKM milestones | M3 | ORIGINAL_REQUEST § R5 |
| 15 | E2E.1 Automated Regression & Feature Tests | Comprehensive E2E test suites covering R1-R5 features across Tiers 1-4 | M4 | ORIGINAL_REQUEST § Verification |
| 16 | E2E.2 Adversarial Hardening (Tier 5) | Adversarial stress testing for physics damping, boundary viewports, and mode shifts | M4 | Project Pattern Dual Track |
| 17 | E2E.3 Forensic Integrity Audit | Whole-codebase forensic audit verifying authentic implementations, zero cheating, and clean build/lint | M4 | Project Pattern Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 3D Asset Restoration, Tech Glyphs, Click Removal & Hero Layout | Features 1, 2, 3, 4, 5 (R1, R2) | none | IN_PROGRESS |
| M2 | 3D Cursor Physics, Manual Drag & Inertia Engine | Features 6, 7, 8, 9 (R3) | M1 | PLANNED |
| M3 | Refactoring UI Overhaul & Content/Text Substance Audit | Features 10, 11, 12, 13, 14 (R4, R5) | M1 | PLANNED |
| M4 | Final Milestone: E2E Test Suite, Adversarial Hardening & Forensic Audit | Features 15, 16, 17 (Tiers 1-5 + Build/Lint + Audit) | M1, M2, M3 | PLANNED |

## Interface Contracts
### 3D Scene (`src/components/hero-3d-scene.tsx`)
- Props:
  ```typescript
  interface Hero3DSceneProps {
    mode: 'tech' | 'medical' | 'academic';
    theme: 'dark' | 'light';
    activeSlideIndex?: number;
    baseHue?: number;
    secondaryHue?: number;
    // NOTE: onModelClick is strictly REMOVED
  }
  ```
- Canvas Dimensions: `w-full max-w-[360px] h-[360px] sm:max-w-[380px] sm:h-[380px] lg:max-w-[400px] lg:h-[420px]`
- Asset paths: `/models/model-jantung.glb`, `/models/model-quill.glb`

### Project Mode Icon (`src/components/project-mode-icon.tsx`)
- When `mode === 'tech'`, renders `<DiamondArtifactGlyph visualType={project?.visualType || 'artifact'} index={index} />`.
- When `mode === 'medical'`, renders medical SVG / icon.
- When `mode === 'academic'`, renders academic SVG / icon.

### Physics Engine State & Transforms
- Hierarchy: `cursorTrackingGroup` (handles pitch/yaw cursor orientation) -> `dragPivotGroup` (handles user drag rotation + inertia coasting) -> `modelMesh`.
- Exponential smoothing: $\alpha = 1 - e^{-k \Delta t}$ with $k \approx 4.0$.
- Viscous damping: $\vec{\omega}(t+\Delta t) = \vec{\omega}(t) \cdot e^{-\mu \Delta t}$ with $\mu \approx 3.5$.
