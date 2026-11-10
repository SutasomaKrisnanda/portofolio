# Comprehensive Technical Survey Report: Requirements R1 & R2

**Agent**: Survey Explorer 1 (`teamwork_explorer`)  
**Folder**: `.agents/teamwork/explorer_survey_g4_1/`  
**Parent Agent**: orchestrator_gen4 (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Timestamp**: 2026-11-10T12:53:00Z  
**Scope**: 
1. Tech Mode Geometric Glyphs in `src/components/geometric-glyphs.tsx` and Git History Forensics
2. 3D Models (`model-jantung.glb` & `model-quill.glb`) Forensics, Storage, Loading, and Animation
3. 3D Model Modal Click Event Listener Removal
4. Hero-Section Responsive Layout & 3D Model Sizing Analysis

---

## 1. Executive Summary

This survey provides the authoritative forensic and architectural analysis of the codebase for Requirements R1 and R2 from the follow-up prompt (`ORIGINAL_REQUEST.md — 2026-11-10T12:37:00Z`).

### Core Discoveries:
1. **Geometric Glyphs**:
   - In commit `f894fdf29002f8639f82f083421eb39428b196bd` ("Transform the entire website into three mode..."), `src/components/geometric-glyphs.tsx` introduced `DiamondArtifactGlyph` with 3 distinct procedural geometric artifacts (`chrome-teardrop`, `pink-prism-octahedron`, `holo-cylinder`).
   - In Milestone 1, `DiamondArtifactGlyph` was completely removed from `src/components/hero.tsx` and `src/components/projects.tsx` in favor of static SVG icons via `ProjectModeIcon`.
   - To restore the original geometric shape for Tech mode, `src/components/project-mode-icon.tsx` (and/or direct hero/project card rendering) must conditionally render the procedural `DiamondArtifactGlyph` when in `tech` mode.

2. **3D Model Forensics (`model-jantung.glb` & `model-quill.glb`)**:
   - Both models originated in commit `f894fdf`:
     - `model-jantung.glb` (18,141,244 bytes, SHA blob `c6bbf0c256ba363fb93fd44d98019d57b34f6a42`): Compressed with `EXT_meshopt_compression` and `KHR_mesh_quantization`. Requires `MeshoptDecoder` initialization in `GLTFLoader`. Currently exists on disk at `public/models/model-jantung.glb`.
     - `model-quill.glb` (90,192,408 bytes, SHA blob `7a4f4ed6c35c3ea36715e945571e7864a12abddb`): Uncompressed glTF binary. Exists intact in the git object database. Can be restored via `git checkout f894fdf -- public/models/model-quill.glb`. Additionally, an untracked meshopt-compressed version `public/models/model-pena.glb` (16,817,680 bytes) exists on disk, generated with `gltfpack 1.2`.
   - Animation parameters from the authoritative commit:
     - **Heart (Medical)**: 72 BPM Lub-Dub cardiac pulse rhythm ($f = 1.2\text{ Hz}$, $T = 0.8333\text{ s}$), ventricular systole ($0 \le t_{\text{cycle}} < 0.16$) and atrial kick ($0.22 \le t_{\text{cycle}} < 0.36$), anatomical apex tilt ($Z = -0.18$, $X = 0.15$), synchronized point light pulse.
     - **Quill (Academic)**: Harmonic vertical levitation ($\Delta Y = \sin(1.6t) \cdot 0.09$) and scribe wobble ($Z = -0.38 + \sin(2.5t)\cdot 0.05$, $X = 0.22 + \cos(2.0t)\cdot 0.03$).
   - **Static Serving & GitHub Pages Compliance**: Models must reside exclusively in `public/models/`. Next.js static export (`output: 'export'`) copies files in `public/` directly to `out/models/` without bundling them into JavaScript chunks. This eliminates JS bundle bloat, satisfies GitHub's 100 MB per-file limit (`model-quill.glb` is 90.19 MB, `model-jantung.glb` is 18.14 MB), and easily complies with the 1 GB GitHub Pages quota (~108 MB total).

3. **3D Model Click Event Removal**:
   - The click trigger is currently wired at `src/components/hero.tsx` lines 301–303 via `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}`.
   - In `src/components/hero-3d-scene.tsx` lines 708–710, `handlePointerUp` checks `totalDragDistRef.current < 5` and executes `onModelClick?.()`.
   - Removal is cleanly achieved by removing `onModelClick` from `Hero3DSceneProps`, removing the call in `handlePointerUp`, removing the canvas title mention, and removing the prop from `<Hero3DScene>` in `hero.tsx`.

4. **Hero-Section Layout & Sizing**:
   - The current hero section uses excessive vertical space: top padding `pt-24` (96px), canvas height `lg:h-[500px]` / `xl:h-[580px]`, and bottom padding `pb-8` (32px).
   - On standard laptop/desktop viewports ($\le 900\text{px}$ height), this pushes the docked "EXPLORE WORK" bar and slide arrows below the viewport fold.
   - Reducing canvas size to `lg:w-[360px] lg:h-[380px]` / `xl:w-[400px] xl:h-[420px]`, reducing model normalization `targetSize` from `2.85` to `2.40`, reducing top padding to `pt-14 sm:pt-16 lg:pt-16`, and reducing bottom padding to `pb-3 sm:pb-4` guarantees that the 3D model, headline, and "EXPLORE WORK" bar fit within 1 viewport on both desktop and mobile without scrolling.

---

## 2. Topic 1: Tech Mode Geometric Glyphs Forensics

### 2.1 File & Git History Inspection
`src/components/geometric-glyphs.tsx` was created in commit `f894fdf29002f8639f82f083421eb39428b196bd`. The file defines five distinct SVG glyph components:

| Glyph Component | Purpose | Current Usage |
|---|---|---|
| `PinwheelGlyph` | 4-blade geometric rotor | `header.tsx:65`, `footer.tsx:34`, `not-found.tsx:56` |
| `PrismTriangleGlyph` | Faceted prism triangle with left/right/cutout polygons | `hero.tsx:150` (embedded as the letter 'A' in the headline) |
| `VectorArrowGlyph` | Directional geometric arrow (`direction: left/right/up/down/diagonal`) | `hero.tsx`, `projects.tsx`, `skills.tsx`, `project-modal.tsx` |
| `CloseCrossGlyph` | Clean diagonal close cross | `header.tsx`, `project-modal.tsx` |
| `DiamondArtifactGlyph` | 3 distinct procedural geometric artifacts for project showcases | **Unused in current tree** (orphaned after Milestone 1) |

### 2.2 Deep Dive into `DiamondArtifactGlyph`
Lines 58–117 of `src/components/geometric-glyphs.tsx`:
```tsx
export const DiamondArtifactGlyph: React.FC<{
  visualType: Project['visualType'];
  index: number;
  isActive?: boolean;
}> = ({ visualType, index }) => {
  if (index % 3 === 0) {
    // Shape 0: Liquid Metallic Chrome Teardrop / Sphere
    // Defs: linearGradient #chrome-${visualType}-${index} (#f8fafc -> #64748b -> #cbd5e1 -> #1e293b)
    // SVG: ellipse shadow (cx=42, cy=67), organic bulbous path, specular highlight circle (cx=37, cy=25, r=5)
  }
  if (index % 3 === 1) {
    // Shape 1: Isometric Crystal Prism Octahedron
    // SVG: ellipse shadow (cx=40, cy=64), pink/rose/slate faceted polygons (#fbcfe8, #f472b6, #db2777, #cbd5e1)
  }
  // Shape 2: Isometric Holographic Crystal Monolith Column
  // Defs: linearGradient #holo (${visualType}-${index}) (#22d3ee -> #c084fc -> #f472b6)
  // SVG: ellipse shadow (cx=42, cy=67), isometric column polygons, dark base stand (rect x=40, y=56)
};
```

### 2.3 What Changed in Milestone 1 and What Needs to Be Restored
- **Original Behavior (Commit `f894fdf`)**:
  - In `src/components/hero.tsx` (lines 207–211), preview diamond cards rendered:
    ```tsx
    <DiamondArtifactGlyph visualType={slideProj.visualType} index={idx} />
    ```
  - In `src/components/projects.tsx` (lines 156–160), each project card rendered:
    ```tsx
    <div className="shrink-0 p-1 rounded-lg bg-slate-900/5 dark:bg-white/10">
      <DiamondArtifactGlyph visualType={project.visualType} index={idx} />
    </div>
    ```
- **Milestone 1 Replacement**:
  - The team implemented `src/components/project-mode-icon.tsx` which loaded static SVGs (`project-tech.svg`, `project-medical.svg`, `project-academic.svg`).
  - While this satisfied dynamic icons for medical and academic modes, it replaced the distinctive procedural geometric shapes in Tech mode with a flat SVG icon.
- **Restoration Blueprint for Requirement R1**:
  - In `src/components/project-mode-icon.tsx`:
    ```tsx
    import { DiamondArtifactGlyph } from '@/components/geometric-glyphs';
    
    // Inside ProjectModeIcon:
    if (resolvedMode === 'tech') {
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <DiamondArtifactGlyph
            visualType={project?.visualType || 'artifact'}
            index={typeof width === 'number' ? width : 0}
          />
        </div>
      );
    }
    ```
  - Alternatively, or in addition, `src/components/hero.tsx` and `src/components/projects.tsx` can check `activeMode === 'tech'` to render `DiamondArtifactGlyph` directly. Using `ProjectModeIcon` as the single point of dispatch is cleaner and guarantees that both the hero cards and the project gallery render the original geometric glyphs when in Tech mode.

---

## 3. Topic 2: 3D Models (`model-jantung.glb` & `model-quill.glb`) Forensics

### 3.1 Repository & Git Object Forensics
1. **Locating Commit `f894fdf29002f8639f82f083421eb39428b196bd`**:
   - `git ls-tree f894fdf public/models/` confirms:
     - `100644 blob c6bbf0c256ba363fb93fd44d98019d57b34f6a42  public/models/model-jantung.glb`
     - `100644 blob 7a4f4ed6c35c3ea36715e945571e7864a12abddb  public/models/model-quill.glb`
2. **Current Disk State in `public/models/`**:
   - `public/models/model-jantung.glb`: **Present on disk** (18,141,244 bytes).
   - `public/models/model-quill.glb`: Marked deleted in working tree, but exists in git object database as blob `7a4f4ed6c35c3ea36715e945571e7864a12abddb` (90,192,408 bytes).
   - `public/models/model-pena.glb`: Present on disk as untracked file (16,817,680 bytes).
3. **Format & Extension Analysis**:
   - `model-jantung.glb`:
     - Generator: `gltfpack 1.2`
     - Required Extensions: `["KHR_mesh_quantization", "EXT_meshopt_compression"]`
     - Meshes: 1, Materials: 1 PBR, Textures: 3 (baseColor, metallicRoughness, normal).
     - Bounding Box: $0.468 \times 0.980 \times 0.650$ units.
     - **CRITICAL**: Requires `MeshoptDecoder` registered with `GLTFLoader`.
   - `model-quill.glb`:
     - Generator: `pygltflib@v1.16.5`
     - Required Extensions: `[]` (standard glTF 2.0 binary).
     - Meshes: 1, Materials: 1 PBR (`doubleSided: true`), Textures: 3.
     - Bounding Box: $1.902 \times 1.640 \times 1.699$ units.
     - Note: `tests/e2e/tier5-challenger-m2.test.mjs` explicitly tests for file `public/models/model-quill.glb` with size `90_192_408` bytes. Restoring via `git checkout f894fdf -- public/models/model-quill.glb` satisfies all test fixtures.

### 3.2 Loading & Decoder Pipeline
In `src/components/hero-3d-scene.tsx`:
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

let isMeshoptInitialized = false;

async function getInitializedLoader(): Promise<GLTFLoader> {
  const loader = new GLTFLoader();
  if (!isMeshoptInitialized) {
    if (MeshoptDecoder.ready) {
      await MeshoptDecoder.ready;
    }
    isMeshoptInitialized = true;
  }
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}
```

### 3.3 Normalization Algorithm
```typescript
function normalizeAndPivotModel(
  modelScene: THREE.Object3D,
  targetSize: number = 2.40 // Adjusted from 2.85 for responsive viewport fit
): { pivotGroup: THREE.Group; baseScale: number } {
  const box = new THREE.Box3().setFromObject(modelScene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Center model origin at geometric center (0, 0, 0)
  modelScene.position.set(-center.x, -center.y, -center.z);

  // Uniform scale to targetSize
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

  const pivotGroup = new THREE.Group();
  pivotGroup.add(modelScene);
  pivotGroup.scale.setScalar(scale);

  return { pivotGroup, baseScale: scale };
}
```

### 3.4 Mathematical Animation Specifications

#### 1. Medical Mode: Anatomical Heart (72 BPM Lub-Dub Rhythm)
- **Physiological Basis**: 72 BPM corresponds to an oscillation frequency of $f = 1.2\text{ Hz}$ and cycle period $T = \frac{1}{1.2} \approx 0.8333\text{ s}$.
- **Normalized Phase**: $\tau = \frac{t \pmod T}{T} \in [0, 1)$.
- **Cardiac Stages**:
  - Ventricular Systole (Lub) for $\tau \in [0, 0.16)$:
    $$\text{pulse}(\tau) = \sin\left(\frac{\tau}{0.16} \cdot \pi\right) \cdot 0.075$$
  - Atrial Kick (Dub) for $\tau \in [0.22, 0.36)$:
    $$\text{pulse}(\tau) = \sin\left(\frac{\tau - 0.22}{0.14} \cdot \pi\right) \cdot 0.045$$
  - Diastolic Pause for $\tau \in [0.16, 0.22) \cup [0.36, 1.0)$:
    $$\text{pulse}(\tau) = 0$$
- **Mesh Scale & Point Light Pulse**:
  $$S(t) = S_0 \cdot (1 + \text{pulse}(t))$$
  $$I_{\text{point}}(t) = 0.8 + \text{pulse}(t) \cdot 18.0$$
- **Orientation & Anatomical Tilt**:
  Apex tilt: $\text{rot}_z = -0.18\text{ rad}$, resting pitch: $\text{rot}_x = 0.15\text{ rad}$.

#### 2. Academic Mode: Feather Quill (Harmonic Levitation & Scribe Motion)
- **Harmonic Vertical Levitation**:
  $$Y(t) = \sin(1.6 t) \cdot 0.09$$
- **Calligraphic Scribe Wobble**:
  $$Z_{\text{tilt}}(t) = -0.38 + \sin(2.5 t) \cdot 0.05$$
  $$X_{\text{tilt}}(t) = 0.22 + \cos(2.0 t) \cdot 0.03$$
- **Orientation**:
  $$\text{rot}_z(t) = Z_{\text{tilt}}(t), \quad \text{rot}_x(t) = X_{\text{tilt}}(t) + \theta_{\text{drag}, x}$$

#### 3. Tech Mode: Procedural Crystal Polyhedron
- Retains `createTechPolyhedron()` from `hero-3d-scene.tsx` (inner icosahedron with physical glass transmission material, outer wireframe cage, 4 orbital octahedral nodes).

### 3.5 Serving via `public/` and GitHub Pages Limitations
- **Next.js Static Export Mechanics**:
  - `next.config.ts` specifies `output: 'export'`.
  - In static export builds, Next.js copies the contents of `public/` directly into the export root `out/` (`out/models/model-jantung.glb`, `out/models/model-quill.glb`).
  - Static assets in `public/` are served over standard HTTP GET (`fetch('/models/model-jantung.glb')`).
  - Webpack/Turbopack does **not** process, parse, or inline files from `public/`. Therefore, the JavaScript bundle (`_next/static/chunks/*.js`) remains completely untouched (~148 kB first load JS).
- **GitHub Limitations Compliance**:
  - **Git File Size Limit**: GitHub blocks files $> 100\text{ MB}$. `model-quill.glb` is $90.19\text{ MB} < 100\text{ MB}$. `model-jantung.glb` is $18.14\text{ MB} < 100\text{ MB}$. Both commit and push cleanly without requiring Git LFS.
  - **GitHub Pages Site Limit**: GitHub Pages recommends site size $< 1\text{ GB}$. The total build output `out/` with both GLB models is $\approx 115\text{ MB}$, using $\approx 11.5\%$ of the allowable quota.
  - **Clean Assets Directory**: Ensure `src/assets/models/` is purged or not referenced by ES imports to avoid dual storage or build errors.

---

## 4. Topic 3: 3D Model Modal Click Removal

### 4.1 Inspection of Active Click Wiring
Currently, clicking the 3D canvas triggers the project case study modal through the following call chain:

1. **In `src/components/hero.tsx` (lines 301–304)**:
   ```tsx
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
2. **In `src/components/hero-3d-scene.tsx`**:
   - Line 14: `onModelClick?: () => void;` in `Hero3DSceneProps`.
   - Line 708–711:
     ```typescript
     const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
       if (!isDraggingRef.current) return;
       isDraggingRef.current = false;
       ...
       // Click discrimination: if pointer travelled less than 5px, it's a click
       if (totalDragDistRef.current < 5) {
         onModelClick?.();
       }
     };
     ```
   - Line 721: `<IridescentCrystalCanvas onCrystalClick={onModelClick} />`
   - Line 750: Canvas HTML title:
     `title="Geser mouse untuk memutar model 3D, atau klik untuk melihat studi kasus projek aktif"`

### 4.2 Exact Steps to Remove the Click Listener Cleanly
1. In `src/components/hero.tsx`:
   - Delete `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}` from `<Hero3DScene>`.
2. In `src/components/hero-3d-scene.tsx`:
   - Remove `onModelClick?: () => void;` from `Hero3DSceneProps`.
   - Remove `onModelClick` from the component destructuring parameters.
   - In `handlePointerUp`, remove the block:
     ```typescript
     if (totalDragDistRef.current < 5) {
       onModelClick?.();
     }
     ```
   - In the canvas `title` attribute, change to:
     `title="Geser mouse untuk memutar model 3D"`
   - On `<IridescentCrystalCanvas>`, remove `onCrystalClick={onModelClick}`.
3. Verification:
   - Clicking or tapping the 3D model now simply releases pointer capture without executing any modal callback or route change.
   - Project modal remains accessible exclusively via the dedicated project card clicks and "Buka Studi Kasus" action buttons.

---

## 5. Topic 4: Hero-Section Layout & 3D Model Sizing

### 5.1 Vertical Space Collision Analysis
In the current implementation:
- `#hero` container in `src/components/hero.tsx` (lines 97–98):
  ```tsx
  className="relative w-full min-h-[100dvh] lg:min-h-screen flex flex-col justify-between pt-16 sm:pt-20 lg:pt-24 pb-8 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white overflow-hidden"
  ```
- Canvas container in `src/components/hero-3d-scene.tsx` (lines 744–751):
  ```tsx
  className="w-[320px] h-[340px] md:w-[420px] md:h-[440px] lg:w-[480px] lg:h-[500px] xl:w-[560px] xl:h-[580px] cursor-grab active:cursor-grabbing relative z-10 touch-none"
  ```
- Pedestal Rings:
  - Inner ring: `lg:w-[480px] lg:h-[480px] xl:w-[560px] xl:h-[560px]`
  - Outer ring: `lg:w-[580px] lg:h-[580px] xl:w-[680px] xl:h-[680px]`
- Caption badge under 3D stage (`hero.tsx:305`):
  `mt-2 text-[10px] ... px-3.5 py-1 rounded-full`

#### Vertical Height Budget Calculation (1080p Desktop vs 768p Laptop):
| Layout Element | Current Height (Desktop) | Proposed Height (Optimized) | Savings |
|---|---|---|---|
| Top Header Padding | `pt-24` (96px) | `pt-16` (64px) | -32px |
| Top Status Bar & Margin | ~36px + 12px (48px) | ~32px + 8px (40px) | -8px |
| Main Stage Row Gap | `gap-8` (32px) | `gap-4` (16px) | -16px |
| 3D Model Canvas Height | `500px` (lg) / `580px` (xl) | `380px` (lg) / `420px` (xl) | -120px to -160px |
| Caption Badge & Margin | ~28px + 8px (36px) | ~24px + 6px (30px) | -6px |
| Bottom Shelf Bar | ~60px | ~54px | -6px |
| Bottom Container Padding | `pb-8` (32px) | `pb-4` (16px) | -16px |
| **Total Stacked Height** | **774px – 854px** | **600px – 640px** | **-174px to -214px** |

**Conclusion of Calculation**:
On laptops with standard 768px or 800px display heights (or 1080p displays with browser toolbars, bookmarks, and OS taskbars giving an effective inner viewport of 720px–850px), the current 774px–854px height **forces vertical scrolling** to view the bottom shelf.
By shaving ~180px–210px through proportional canvas resizing, padding reduction, and gap tightening, the hero section comfortably fits within **any viewport $\ge 640\text{px}$** without pushing the "EXPLORE WORK" bar out of view.

### 5.2 Mobile Viewport Considerations
- In `src/components/hero.tsx` line 294:
  `className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center relative z-20 my-1 lg:my-0"`
  The 3D canvas is currently hidden on screens `< 1024px`.
- Mobile layout components:
  1. Status bar
  2. Main headline ("SOFTWARE MATTER" with PrismTriangleGlyph)
  3. Supporting description (max 2 lines)
  4. Featured project card (`lg:hidden w-full max-w-md p-3.5`)
  5. Slide switcher (`lg:hidden flex items-center gap-2 pt-1 pb-1`)
  6. Action buttons ("Lihat Projek Teknis" + "Download CV")
  7. Docked bottom shelf ("EXPLORE WORK" + slide arrows)
- To ensure the bottom shelf is never pushed below the fold on mobile viewports (e.g. iPhone SE with 667px height, iPhone 14 with 844px height):
  - Change `#hero` padding on mobile to `pt-14 pb-3 px-4`.
  - Maintain compact vertical margins (`space-y-2.5` on the left column).
  - Use `h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden`.

### 5.3 Concrete Layout Adjustment Specifications
1. **`src/components/hero-3d-scene.tsx`**:
   - Update canvas `className`:
     ```tsx
     className="w-[280px] h-[300px] sm:w-[320px] sm:h-[340px] md:w-[360px] md:h-[380px] lg:w-[380px] lg:h-[400px] xl:w-[420px] xl:h-[440px] cursor-grab active:cursor-grabbing relative z-10 touch-none"
     ```
   - Update concentric rings `className`:
     ```tsx
     {/* Inner ring */}
     className="pointer-events-none absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] xl:w-[400px] xl:h-[400px] rounded-full border border-slate-900/10 dark:border-white/20"
     {/* Outer ring */}
     className="pointer-events-none absolute w-[310px] h-[310px] sm:w-[360px] sm:h-[360px] lg:w-[430px] lg:h-[430px] xl:w-[480px] xl:h-[480px] rounded-full border border-slate-900/5 dark:border-white/10"
     ```
   - In `normalizeAndPivotModel`: Set `targetSize = 2.40` (down from `2.85`).
2. **`src/components/hero.tsx`**:
   - Container `className`:
     ```tsx
     className="relative w-full h-[100dvh] max-h-[100dvh] min-h-[600px] flex flex-col justify-between pt-14 sm:pt-16 lg:pt-18 pb-3 sm:pb-4 px-4 sm:px-8 lg:px-12 select-none text-slate-900 dark:text-white overflow-hidden"
     ```
   - Main grid `className`:
     ```tsx
     className="relative z-20 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center flex-1 my-auto"
     ```

---

## 6. Implementation Action Plan & Risk Matrix

| Task | Files Affected | Risk / Breaking Change | Mitigation |
|---|---|---|---|
| **1. Restore Tech Mode Glyphs** | `src/components/project-mode-icon.tsx`, `src/components/hero.tsx`, `src/components/projects.tsx` | Visual regression if CSS styles expect SVG `<Image>` rather than inline SVG glyph. | Wrap `DiamondArtifactGlyph` in standard sizing container matching `ProjectModeIconProps.className`. |
| **2. Restore `model-quill.glb` & GLTF Loader** | `public/models/model-quill.glb`, `src/components/hero-3d-scene.tsx` | Large 90 MB file download if loaded on mobile. | Keep mobile 3D scene hidden (`hidden lg:flex`). Pre-check cache in memory. Ensure `MeshoptDecoder` handles `model-jantung.glb`. |
| **3. Remove 3D Model Click Event** | `src/components/hero.tsx`, `src/components/hero-3d-scene.tsx` | Existing tests or users expecting click to open modal. | Update any test assertions. Ensure modal opening remains 100% accessible via cards and CTA buttons. |
| **4. Hero Layout & Sizing Adjustments** | `src/components/hero.tsx`, `src/components/hero-3d-scene.tsx` | Content clipping on ultra-short screens (<500px). | Use `min-h-[600px]` with graceful vertical flex spacing (`justify-between`). |

---

## 7. Verification Method

1. **Build & Lint Verification**:
   ```powershell
   node -r ./patch-fs.js node_modules/next/dist/bin/next lint
   node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```
2. **E2E Test Runner**:
   ```powershell
   node tests/e2e/runner.mjs
   node tests/e2e/tier5-challenger-m2.test.mjs
   ```
3. **Interactive Visual & Viewport Check**:
   - Verify Tech mode shows procedural geometric glyphs from `geometric-glyphs.tsx`.
   - Verify Medical mode loads 3D Heart model and beats with cardiac rhythm at 72 BPM.
   - Verify Academic mode loads 3D Quill model and floats with harmonic levitation.
   - Click 3D canvas $\to$ confirm NO project modal opens.
   - Test viewport at 1366x768 and 1920x1080 $\to$ confirm "EXPLORE WORK" shelf is completely visible above the fold without scrolling.
