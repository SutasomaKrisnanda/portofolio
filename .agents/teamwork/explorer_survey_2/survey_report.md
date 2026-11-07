# Technical Survey Report: 3D Models & Dynamic Project Icons (R2 & R3)

**Author**: Teamwork Explorer 2 (`explorer_survey_2`)  
**Mission**: Comprehensive Technical Survey for Requirement R2 (3D Models for Medical & Academic Modes) & Requirement R3 (Dynamic Project Logo Icons per Active Mode)  
**Date**: 2026-11-05  
**Workspace**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio`  

---

## 1. Executive Summary

This report delivers a thorough architectural and technical survey of the portfolio codebase specifically targeting:
1. **Requirement R2 (3D Model Integration for Medical & Academic Modes)**: Replacing the current default mathematical 2D/3D crystal polyhedron in Medical and Academic modes with dedicated 3D GLB models (`model-jantung.glb` for Medical, `model-quill.glb` for Academic) while preserving interactive drag-to-rotate functionality and theme-aligned visuals.
2. **Requirement R3 (Dynamic Project Logo Icons per Active Mode)**: Transitioning project cards and hero slides from static/procedural diamond glyphs to official SVG icon assets (`project-tech.svg`, `project-medical.svg`, `project-academic.svg`), ensuring that projects with single or multiple mode tags dynamically reflect the currently active mode.

### Key Discoveries:
- **Current 3D Implementation**: The hero section center column currently uses `<IridescentCrystalCanvas>` (`src/components/crystal-canvas.tsx`), which is a **pure HTML5 2D Canvas** calculating 3D vertex projections and polygon face rendering via trigonometric formulas. There is **no WebGL or Three.js** currently installed in `package.json`.
- **GLB Models Inspection**:
  - `src/assets/models/model-jantung.glb` (18.14 MB): GLTF 2.0 Binary with **`EXT_meshopt_compression`** and `KHR_mesh_quantization`. **CRITICAL**: Standard `GLTFLoader` will fail unless `MeshoptDecoder` is configured. Contains 1 mesh, 1 PBR material, and 3 embedded texture maps.
  - `src/assets/models/model-quill.glb` (90.19 MB): GLTF 2.0 Binary without compression extensions. Contains 1 mesh, 1 PBR material (`doubleSided: true`), and 3 embedded texture maps.
- **Next.js Static Export Constraint**: `next.config.ts` specifies `output: 'export'`. Client-side Three.js `fetch()` calls cannot load assets directly from `src/assets/models/` at runtime unless they are placed in `public/models/` or bundled via webpack asset modules. Mirroring models to `public/models/` ensures 100% reliable loading in static export builds.
- **Current Project Icon Implementation**: `hero.tsx` and `projects.tsx` currently render `DiamondArtifactGlyph` (`src/components/geometric-glyphs.tsx`), which procedurally outputs geometric SVGs based on `index % 3` with hardcoded gradients. It does not use the SVG icon assets in `src/assets/icons/`.
- **SVG Icon Assets**: `src/assets/icons/` contains `project-tech.svg` (1.91 MB), `project-medical.svg` (1.84 MB), and `project-academic.svg` (1.82 MB). They are fully formed standalone SVGs containing high-definition vector clip-paths, color matrices, and embedded raster artwork corresponding 1:1 with `ModeId = 'tech' | 'medical' | 'academic'`.
- **Multi-Mode Dynamic Switching**: `projects.json` defines primary `mode` and optional `secondaryModes: ModeId[]`. For multi-mode projects (such as HMSSO, which belongs to `tech`, `medical`, and `academic`), the displayed icon must react dynamically to `activeMode` passed down from `page.tsx`.

---

## 2. Codebase Architecture & File Mapping

### 2.1 File Map & Locations

| Component / File Path | Role / Content | Props / Exports |
|---|---|---|
| `src/app/page.tsx` | Main application shell, state manager for `activeMode`, `activeSection`, `activeProjectSlug`, snap scrolling. | Controls `activeMode: ModeId` ('tech' \| 'medical' \| 'academic') and distributes it to sections. |
| `src/components/hero.tsx` | Hero section containing typography, CTA buttons, 3D center stage, slide diamond cards, and navigation controls. | `modeConfig: PortfolioModeConfig`, `activeMode: ModeId`, `projects: Project[]`, `onOpenProject`, `onNavigateSection`, `onSwitchMode`. |
| `src/components/crystal-canvas.tsx` | Current 3D center stage component rendering mathematical polyhedron on 2D canvas. | `mode: ModeId`, `activeSlideIndex: number`, `baseHue: number`, `secondaryHue: number`, `onCrystalClick?: () => void`. |
| `src/components/projects.tsx` | Projects showcase gallery with category filters, search input, sorting, and project card grid. | `modeConfig: PortfolioModeConfig`, `activeMode: ModeId`, `projects: Project[]`, `onOpenProject`. |
| `src/components/project-modal.tsx` | Case study modal detail view displaying complete 9-point project breakdown. | `project: Project \| null`, `modeConfig: PortfolioModeConfig`, `onClose: () => void`, `onDiscussProject?: (p: Project) => void`. |
| `src/components/geometric-glyphs.tsx` | SVG helper glyphs including `DiamondArtifactGlyph`, `PrismTriangleGlyph`, `VectorArrowGlyph`, `CloseCrossGlyph`. | `visualType`, `index`, `isActive`. |
| `src/data/portfolio-data.ts` | TypeScript types (`ModeId`, `Project`, `PortfolioModeConfig`), mode palette configs, project lists. | Exports `PORTFOLIO_MODES`, `PORTFOLIO_PROJECTS`, `GLOBAL_PROFILE`. |
| `src/data/projects.json` | Master project database (13 verified projects) with `id`, `slug`, `title`, `mode`, `secondaryModes`, `technologies`, `featured`, `caseStudy`. | Raw JSON data. |
| `src/assets/models/model-jantung.glb` | 3D Heart model for Medical Mode (18.14 MB). | GLB Binary (Meshopt compressed). |
| `src/assets/models/model-quill.glb` | 3D Quill / Feather Pen model for Academic Mode (90.19 MB). | GLB Binary. |
| `src/assets/icons/project-tech.svg` | Tech Mode project icon asset (1.91 MB). | SVG graphic. |
| `src/assets/icons/project-medical.svg` | Medical Mode project icon asset (1.84 MB). | SVG graphic. |
| `src/assets/icons/project-academic.svg` | Academic Mode project icon asset (1.82 MB). | SVG graphic. |
| `next.config.ts` | Next.js configuration (`output: 'export'`). | Build settings. |

---

## 3. Requirement R2 Technical Deep-Dive: 3D Models for Medical & Academic

### 3.1 Current Polyhedron Implementation Analysis
In `src/components/hero.tsx` (lines 165–179):
```tsx
{/* Center Column: 3D Iridescent Polyhedron Crystal */}
<div className="lg:col-span-4 flex flex-col items-center justify-center relative z-20 my-1 lg:my-0">
  <IridescentCrystalCanvas
    mode={activeMode}
    activeSlideIndex={activeSlideIndex}
    baseHue={modeConfig.palette.crystalBaseHue}
    secondaryHue={modeConfig.palette.crystalSecondaryHue}
    onCrystalClick={() => {
      if (currentHeroProject) onOpenProject(currentHeroProject);
    }}
  />
  <span className="mt-1 text-[9px] uppercase tracking-widest text-slate-600 dark:text-white/70 bg-white/70 dark:bg-black/30 px-3.5 py-0.5 rounded-full backdrop-blur-md border border-slate-900/10 dark:border-white/15 shadow-sm">
    Interactive 3D Polyhedron • Drag to Rotate
  </span>
</div>
```
In `src/components/crystal-canvas.tsx`:
- Generates 7 rings of 3D vertices (58 vertices, 108 triangular faces).
- Computes 3D Euler rotation matrix with perspective projection: `perspective = 3.6 / (3.6 - z2 * 0.65)`.
- Calculates face normals, z-sorting, lighting dot products (`light1`, `light2`, `rim`), dynamic dispersion hue shifts, and linear gradients.
- Interactive controls: pointer drag updates rotation velocity (`rotationRef.current.rx`, `ry`), with friction damping when idle.
- Current limitation: Only renders a mathematical polyhedron for all three modes (changing only hue via `crystalBaseHue` / `crystalSecondaryHue`). Does NOT load any `.glb` model.

### 3.2 Deep Inspection of 3D Models in `src/assets/models/`

#### 1. `model-jantung.glb` (Medical Mode)
- **Path**: `src/assets/models/model-jantung.glb`
- **File Size**: 18,141,244 bytes (~18.14 MB)
- **Format**: glTF 2.0 Binary (GLB)
- **Generator**: `gltfpack 1.2`
- **Structure**: 1 Scene, 1 Node, 1 Mesh, 0 Cameras, 0 Animations.
- **Bounding Box**:
  - `min`: `[-0.2341, -0.4898, -0.3248]`
  - `max`: `[ 0.2340,  0.4897,  0.3250]`
  - `Dimensions (dx, dy, dz)`: `0.468 x 0.980 x 0.650` units (height ~1.0 unit, centered at origin).
- **Material**: 1 PBR material (`tripo_material_c88bc45e-d7f7-4070-a792-47b900fdf64a`).
- **Textures**: 3 embedded binary textures (`baseColorTexture`, `metallicRoughnessTexture`, `normalTexture`).
- **CRITICAL EXTENSIONS**:
  - `extensionsRequired`: `["KHR_mesh_quantization", "EXT_meshopt_compression"]`
  - `extensionsUsed`: `["KHR_mesh_quantization", "EXT_meshopt_compression"]`
  - **IMPLEMENTATION WARNING**: Attempting to load this file with default `THREE.GLTFLoader()` without `loader.setMeshoptDecoder(MeshoptDecoder)` will throw:
    `Error: THREE.GLTFLoader: Unsupported extension: EXT_meshopt_compression`!

#### 2. `model-quill.glb` (Academic Mode)
- **Path**: `src/assets/models/model-quill.glb`
- **File Size**: 90,192,408 bytes (~90.19 MB)
- **Format**: glTF 2.0 Binary (GLB)
- **Generator**: `pygltflib@v1.16.5`
- **Structure**: 1 Scene, 1 Node, 1 Mesh, 0 Cameras, 0 Animations.
- **Bounding Box**:
  - `min`: `[-0.9521, -0.8285, -0.8497]`
  - `max`: `[ 0.9496,  0.8117,  0.8489]`
  - `Dimensions (dx, dy, dz)`: `1.902 x 1.640 x 1.699` units (roughly 2.0 unit cube, centered at origin).
- **Material**: 1 PBR material with `doubleSided: true` and `alphaMode: "OPAQUE"`.
- **Textures**: 3 embedded binary textures (`baseColorTexture`, `metallicRoughnessTexture`, `normalTexture`).
- **Extensions**: None required.
- **PERFORMANCE CONSIDERATION**: At ~90 MB, asynchronous fetching will take 1–3 seconds depending on client connection. A dedicated loading placeholder (e.g. glowing pulsing orbital wireframe) and memory-level scene caching is mandatory to prevent UI stuttering.

### 3.3 3D Engine Architecture & Dependency Selection

We evaluated two potential approaches for Next.js 15:
1. **Approach A: Vanilla Three.js (`three` + `three/addons/...`)** — **RECOMMENDED**:
   - Packages required: `three` and `@types/three`.
   - `GLTFLoader` is already bundled at `three/addons/loaders/GLTFLoader.js`.
   - `MeshoptDecoder` is already bundled at `three/addons/libs/meshopt_decoder.module.js`.
   - Zero React 18/19 peer dependency issues.
   - Clean integration with Next.js App Router using dynamic import:
     `const Hero3DStage = dynamic(() => import('./hero-3d-stage'), { ssr: false });`
   - Direct pointer event control (mimicking the exact drag-to-rotate friction and momentum of `crystal-canvas.tsx`).
   - Clean memory disposal on unmount or mode switch (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`).
2. **Approach B: React Three Fiber (`@react-three/fiber` + `@react-three/drei`)**:
   - Heavy dependencies (~15+ transitive packages).
   - Known version pinning conflicts between React 18.3 / Next 15.5 and R3F canvas reconcilers.
   - Requires setting up worker URLs for MeshoptDecoder and handling Suspense boundaries during SSR hydration.
   - **Verdict**: Vanilla Three.js is substantially safer, leaner, and faster for this specific task.

### 3.4 Model Loading, Normalization & Scene Setup

#### Asset Serving Architecture
Because Next.js has `output: 'export'` in `next.config.ts`, `fetch()` calls executed in the browser can only reach files in `public/`.
- Authoritative source assets remain in `src/assets/models/model-jantung.glb` and `src/assets/models/model-quill.glb`.
- The models must be accessible from `public/models/model-jantung.glb` and `public/models/model-quill.glb` so the client loader can fetch `/models/model-jantung.glb` and `/models/model-quill.glb`.

#### Normalization Pipeline
Each loaded model has different natural bounds (Heart: height ~0.98, Quill: width ~1.90). To fit uniformly into the hero 3D viewport (canvas ~330px x 350px):
1. Compute bounding box: `const box = new THREE.Box3().setFromObject(gltf.scene);`
2. Center the object:
   ```ts
   const center = box.getCenter(new THREE.Vector3());
   gltf.scene.position.sub(center);
   ```
3. Compute scale factor to fit a normalized target radius (e.g. `targetSize = 1.6`):
   ```ts
   const size = box.getSize(new THREE.Vector3());
   const maxDim = Math.max(size.x, size.y, size.z);
   const scale = targetSize / maxDim;
   gltf.scene.scale.set(scale, scale, scale);
   ```
4. Place inside an outer rotation pivot group to handle user drag rotation and idle floating animation.

#### Lighting Rig Configuration
To ensure PBR materials look vibrant in both Dark and Light themes:
- **Ambient Light**: `new THREE.AmbientLight(0xffffff, isLight ? 0.9 : 0.7)`
- **Key Light**: `new THREE.DirectionalLight(0xffffff, 1.8)`, position: `[3, 4, 3]`
- **Fill Light**: `new THREE.DirectionalLight(accentHex, 1.0)`, position: `[-3, -1, -2]` (tinted to mode accent: `#06b6d4` Tech, `#0d9488` Medical, `#8b5cf6` Academic)
- **Rim Light**: `new THREE.PointLight(0xffffff, 1.2, 10)`, position: `[0, -2, 2]`
- **Floor Shadow**: Radial gradient or plane with blurred circular shadow matching theme background.

#### Dynamic Mode Switching Logic:
- If `mode === 'tech'`: Render the signature interactive 3D iridescent polyhedron (the existing canvas math logic or Three.js polyhedron geometry).
- If `mode === 'medical'`: Render `model-jantung.glb` with Medical theme lighting and teal/emerald subtle ambient glow.
- If `mode === 'academic'`: Render `model-quill.glb` with Academic theme lighting and purple/indigo ambient glow.
- Interactive label in hero column dynamically updates:
  - Tech: `"Interactive 3D Polyhedron • Drag to Rotate"`
  - Medical: `"Interactive 3D Anatomical Heart • Drag to Rotate"`
  - Academic: `"Interactive 3D Quill Pen • Drag to Rotate"`

---

## 4. Requirement R3 Technical Deep-Dive: Dynamic Project Logo Icons

### 4.1 Current Project Icon / Glyph Implementation
In `src/components/hero.tsx` (line 207):
```tsx
<DiamondArtifactGlyph
  visualType={slideProj.visualType}
  index={idx}
  isActive={isCardActive}
/>
```
In `src/components/projects.tsx` (line 156):
```tsx
<div className="shrink-0 p-1 rounded-lg bg-slate-900/5 dark:bg-white/10">
  <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
</div>
```
In `src/components/geometric-glyphs.tsx`:
- `DiamondArtifactGlyph` currently evaluates `index % 3`:
  - `0`: Renders a metallic circular blob with paths.
  - `1`: Renders pink/purple isometric diamonds.
  - `2`: Renders cyan/blue prism blocks.
- **Problem**: This is completely detached from the project's actual mode, the active portfolio mode, and does not use the official icon assets in `src/assets/icons/`.

### 4.2 Deep Inspection of SVG Icon Assets in `src/assets/icons/`

| Asset File | Size | ViewBox | Native Dimensions | Format & Features |
|---|---|---|---|---|
| `project-tech.svg` | 1,907,450 bytes (~1.91 MB) | `0 0 168.75 116.25` | `w: 225, h: 155` | Standalone SVG 1.0, colorMatrix filter, clipping path, embedded high-res PNG artwork representing Tech Mode. |
| `project-medical.svg` | 1,841,689 bytes (~1.84 MB) | `0 0 159 120` | `w: 212, h: 160` | Standalone SVG 1.0, colorMatrix filter, clipping path, embedded high-res PNG artwork representing Medical Mode. |
| `project-academic.svg` | 1,817,737 bytes (~1.82 MB) | `0 0 177 112.5` | `w: 236, h: 150` | Standalone SVG 1.0, colorMatrix filter, clipping path, embedded high-res PNG artwork representing Academic Mode. |

All three SVG files are valid vector graphics with embedded high-resolution master art tailored for each mode.

### 4.3 Project Mode Tagging & Dynamic Multi-Mode Analysis
In `src/data/projects.json`, projects are tagged with `mode` and optional `secondaryModes`:

| Project ID | Project Title | Primary `mode` | `secondaryModes` | Expected Icon in Tech Mode | Expected Icon in Medical Mode | Expected Icon in Academic Mode |
|---|---|---|---|---|---|---|
| `proj-hmsso` | HMSSO — Hermestha Management | `tech` | `["medical", "academic"]` | `project-tech.svg` | `project-medical.svg` | `project-academic.svg` |
| `proj-bunda-bahagia` | Bunda Bahagia | `medical` | `["academic"]` | *(Not shown in Tech filter)* | `project-medical.svg` | `project-academic.svg` |
| `proj-sintesis-senyawa` | Sintesis & Komputasi Senyawa | `academic` | `["medical", "tech"]` | `project-tech.svg` | `project-medical.svg` | `project-academic.svg` |
| `proj-radiology-ai` | RadX — AI Pneumonia Classifier | `tech` | `["medical"]` | `project-tech.svg` | `project-medical.svg` | *(Not shown in Academic)* |
| `proj-telemedisin-desa` | DesaSehat — Telemedisin Primer | `medical` | `["tech"]` | `project-tech.svg` | `project-medical.svg` | *(Not shown in Academic)* |
| `proj-sistematik-review` | Systematic Review Onkologi | `academic` | `["medical"]` | *(Not shown in Tech)* | `project-medical.svg` | `project-academic.svg` |

#### The Dynamic Rule (Requirement R3):
> *"Untuk project yang memiliki dua atau lebih label mode, icon yang ditampilkan harus tetap berubah secara dinamis mengikuti mode yang sedang aktif saat ini."*

**Architectural Principle**:
The icon rendered for any project MUST correspond to the **currently active mode** (`activeMode`) under which the project is being viewed.
- If `activeMode === 'tech'` -> Render `project-tech.svg`.
- If `activeMode === 'medical'` -> Render `project-medical.svg`.
- If `activeMode === 'academic'` -> Render `project-academic.svg`.
- Fallback: If for any reason `activeMode` is not supported by the project, fall back to the project's primary `project.mode`.

### 4.4 Proposed Component: `ProjectModeIcon`
Create a centralized, reusable icon component, e.g. `src/components/project-mode-icon.tsx`:
```tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { ModeId } from '@/data/portfolio-data';

import techIcon from '@/assets/icons/project-tech.svg';
import medicalIcon from '@/assets/icons/project-medical.svg';
import academicIcon from '@/assets/icons/project-academic.svg';

const ICON_MAP: Record<ModeId, any> = {
  tech: techIcon,
  medical: medicalIcon,
  academic: academicIcon,
};

interface ProjectModeIconProps {
  mode: ModeId;
  className?: string;
  alt?: string;
}

export const ProjectModeIcon: React.FC<ProjectModeIconProps> = ({
  mode,
  className = 'w-10 h-10',
  alt = 'Logo Projek'
}) => {
  const iconAsset = ICON_MAP[mode] || ICON_MAP.tech;

  return (
    <Image
      src={iconAsset}
      alt={alt}
      className={`object-contain transition-transform duration-300 ${className}`}
      width={64}
      height={64}
      priority
    />
  );
};
```

### 4.5 Component Integration Points
1. **Hero Section (`src/components/hero.tsx`)**:
   - Right-column diamond project cards (lines 198–218):
     Replace `DiamondArtifactGlyph` with `<ProjectModeIcon mode={activeMode} className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow" />`.
2. **Projects Gallery (`src/components/projects.tsx`)**:
   - Project cards header row (lines 155–157):
     Replace `DiamondArtifactGlyph` with `<ProjectModeIcon mode={activeMode} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />`.
3. **Project Modal Detail (`src/components/project-modal.tsx`)**:
   - Modal sticky header & metadata ribbon:
     Display `<ProjectModeIcon mode={activeMode} className="w-9 h-9 sm:w-11 sm:h-11 object-contain" />` next to the project title and category badge.

---

## 5. Verification & Build Diagnostics

### 5.1 Static Export & Build Checks
- **Build Command**: `node ./node_modules/next/dist/bin/next build` (or `npm run build`).
- **Detected Windows Issue**:
  During verification, `next build` encountered `Error: EISDIR: illegal operation on a directory, readlink ... src/app/favicon.ico`.
  - Cause: Next.js 15 metadata-routes calls `fs.readlink` on files in `src/app/`. On Windows filesystem mappings, calling `readlink` on a regular file throws `EISDIR`.
  - Solution: Move or mirror `favicon.ico` into `public/favicon.ico`, which prevents App Router's metadata scanner from calling `readlink`.

### 5.2 Dependencies Needed
To implement R2 with full WebGL & GLB support:
```bash
npm.cmd install three @types/three
```
- No other packages are necessary because `GLTFLoader` and `MeshoptDecoder` are already bundled within `three`.

---

## 6. Implementation Recommendations for Planner & Implementer

1. **Step 1: Install `three` & `@types/three`**
   - Add `three` (`^0.170.0`) and `@types/three` to `package.json`.
2. **Step 2: Mirror 3D Models & Icons for Static Export**
   - Copy `src/assets/models/*.glb` to `public/models/` (`public/models/model-jantung.glb`, `public/models/model-quill.glb`).
   - Copy `src/assets/icons/*.svg` to `public/icons/` if direct public URL references are preferred, while keeping `src/assets/icons/*.svg` for static imports.
3. **Step 3: Implement `src/components/hero-3d-stage.tsx`**
   - Create multi-mode 3D stage component.
   - For `tech`: render interactive 3D iridescent crystal.
   - For `medical`: load `/models/model-jantung.glb` using `GLTFLoader` + `MeshoptDecoder`. Center, normalize scale, apply Medical teal lighting.
   - For `academic`: load `/models/model-quill.glb` using `GLTFLoader`. Center, normalize scale, apply Academic violet lighting.
   - Integrate pointer drag rotation with damping and `onModelClick` callback.
   - Add loading spinner/pulse placeholder during GLB downloads.
4. **Step 4: Implement `src/components/project-mode-icon.tsx`**
   - Import `project-tech.svg`, `project-medical.svg`, `project-academic.svg`.
   - Map dynamically to `activeMode`.
5. **Step 5: Integrate `ProjectModeIcon` in `hero.tsx`, `projects.tsx`, and `project-modal.tsx`**
   - Replace procedural `DiamondArtifactGlyph` with `ProjectModeIcon`.
   - Verify dynamic icon updates when switching between Tech, Medical, and Academic modes.
6. **Step 6: Address Build Blocker (`favicon.ico`) & Run `npm run build`**
   - Verify zero compilation errors, zero TypeScript errors, and successful static HTML generation.

---
*Report concluded by teamwork_explorer 2.*
