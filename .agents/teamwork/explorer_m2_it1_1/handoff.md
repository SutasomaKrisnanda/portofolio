# Milestone 2 Technical Investigation & Handoff Report
**Milestone**: M2 — 3D WebGL Canvas & GLB Models Integration  
**Investigator**: `explorer_m2_it1_1` (teamwork_explorer)  
**Date**: 2026-11-06  
**Status**: COMPLETE (Hard Handoff)  
**Target Recipient**: Worker M2 (`worker_m2_it1_1`) & Orchestrator  

---

## 1. Observation

Direct observations from source code inspection, asset analysis, filesystem audits, and command executions:

### 1.1 Dependency Audit (`package.json`)
- In `package.json` (lines 16–70):
  - `three`: **NOT INSTALLED**
  - `@types/three`: **NOT INSTALLED**
  - `meshoptimizer`: **NOT INSTALLED**
- Direct node check confirmed:
  ```powershell
  node -e "try { require.resolve('three') } catch(e) { console.log('three: NOT FOUND') }"
  # Output: three: NOT FOUND
  ```
- No other 3D graphics or WebGL libraries exist in `node_modules`.

### 1.2 Current 3D Canvas Implementation (`src/components/crystal-canvas.tsx`)
- Location: `src/components/crystal-canvas.tsx` (lines 1–341)
- Context type: HTML5 2D Canvas (`canvas.getContext('2d')`, line 46)
- Rendering mechanism: Pure CPU mathematical projection of 7 latitudinal rings, 2D perspective division (`perspective = 3.6 / (3.6 - z2 * 0.65)`), painter's sort, and 2D canvas linear gradients (`ctx.createLinearGradient`).
- Integration in `src/components/hero.tsx` (lines 180–193):
  ```tsx
  <IridescentCrystalCanvas
    mode={activeMode}
    activeSlideIndex={activeSlideIndex}
    baseHue={modeConfig.palette.crystalBaseHue}
    secondaryHue={modeConfig.palette.crystalSecondaryHue}
    onCrystalClick={() => {
      if (currentHeroProject) onOpenProject(currentHeroProject);
    }}
  />
  <span className="mt-1 text-[9px] uppercase tracking-widest text-slate-600 dark:text-white/70 ...">
    Interactive 3D Polyhedron • Drag to Rotate
  </span>
  ```
- **Defect Identified**: The canvas renders the exact same procedural crystal regardless of whether `activeMode` is `'tech'`, `'medical'`, or `'academic'`. It completely lacks WebGL context, GLTF loading capabilities, and decompression support for GLB models.

### 1.3 GLB Models Asset Inspection (`src/assets/models/`)
Direct binary header parsing via Node.js glTF 2.0 parser yielded:

| Asset Name | File Path | File Size | glTF Version | Extensions Used / Required | Geometry / Meshes | Accessor Bounding Box | Center |
|---|---|---|---|---|---|---|---|
| **Medical Heart** | `src/assets/models/model-jantung.glb` | 18,141,244 bytes (~18.14 MB) | 2.0 | `['KHR_mesh_quantization', 'EXT_meshopt_compression']` | 1 scene, 1 mesh, 1 PBR metallic-roughness material | `min: [-0.234, -0.490, -0.325]`<br>`max: [0.234, 0.490, 0.325]` | `(0, 0, 0)`<br>Span: ~0.47 x 0.98 x 0.65 |
| **Academic Quill** | `src/assets/models/model-quill.glb` | 90,192,408 bytes (~90.19 MB) | 2.0 | `[]` (standard uncompressed glTF binary) | 1 scene, 1 mesh, 1 PBR material (double-sided) | `min: [-0.952, -0.828, -0.850]`<br>`max: [0.950, 0.812, 0.849]` | `(0, 0, 0)`<br>Span: ~1.90 x 1.64 x 1.70 |

- **Critical Extension Requirement for Medical Heart**: `model-jantung.glb` requires `EXT_meshopt_compression` and `KHR_mesh_quantization`. Without `MeshoptDecoder` registered on `GLTFLoader`, loading fails with:
  `THREE.GLTFLoader: Extension EXT_meshopt_compression is not supported by this loader`.
- **Critical Scale & Performance Requirement for Academic Quill**: `model-quill.glb` is ~90.19 MB. Downloading and parsing this buffer repeatedly on mode switches causes severe UI freezes. A progress indicator and in-memory scene caching are mandatory.

### 1.4 Public Directory & Static Export Mirroring (`public/`)
- Audit of `public/`:
  - `public/CV I Gede Arya Krisnanda Sutasoma.pdf`
  - `public/favicon.ico`
  - `public/icons/`
  - `public/models/`: **DOES NOT EXIST YET**.
- Next.js Config (`next.config.ts`, line 4):
  `output: 'export'`
- Under static export, client-side fetches (`fetch('/models/model-jantung.glb')` or `gltfLoader.load('/models/...')`) resolve from the `public/` folder.
- `tests/e2e/helpers/fixtures.mjs` (lines 27–41) explicitly asserts:
  `MODEL_ASSETS.medical.public = 'public/models/model-jantung.glb'`  
  `MODEL_ASSETS.academic.public = 'public/models/model-quill.glb'`

### 1.5 Mode & Theme System in `hero.tsx`
- `activeMode`: `'tech' | 'medical' | 'academic'` passed to `Hero`.
- `currentTheme`: derived from `useTheme().resolvedTheme` (`'dark' | 'light'`).
- Active project: `currentHeroProject` available to open modal on click.

### 1.6 Baseline Verification Runs
- `node tests/e2e/runner.mjs`: **78/78 PASSED (100%)**
- `npm.cmd run build`: **PASSED (Exit Code 0)** — static pages generated and exported to `out/`.
- `npm.cmd run typecheck`: **PASSED (Exit Code 0)** — TypeScript strict mode clean.
- `npm.cmd run lint`: Exits with error code 1 due to upstream ESLint 9 flat-config circular dependency in `.eslintrc.json`. (Note: `next.config.ts` has `ignoreDuringBuilds: true`, so production builds succeed).

---

## 2. Logic Chain

From the direct observations, the following architectural inferences and design requirements are established:

### Step 1: Package Dependencies
- **Premise**: `model-jantung.glb` requires meshopt decompression and WebGL rendering.
- **Inference**: Worker M2 must install `three`, `@types/three`, and `meshoptimizer`:
  ```powershell
  npm.cmd install three meshoptimizer
  npm.cmd install -D @types/three
  ```
- **Decoder Wiring**: In Three.js:
  ```typescript
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
  // or import { MeshoptDecoder } from 'meshoptimizer';

  const loader = new GLTFLoader();
  if (MeshoptDecoder.ready) {
    await MeshoptDecoder.ready;
  }
  loader.setMeshoptDecoder(MeshoptDecoder);
  ```

### Step 2: Public Asset Mirroring for Next.js Static Export
- **Premise**: `output: 'export'` copies `public/*` to `out/*`. Browser runtime `fetch` cannot read from `src/assets/`.
- **Inference**: Worker M2 must create directory `public/models/` and copy:
  - `src/assets/models/model-jantung.glb` -> `public/models/model-jantung.glb`
  - `src/assets/models/model-quill.glb` -> `public/models/model-quill.glb`
- This directly satisfies E2E test `T1.2.6: Static export public model mirror path contract`.

### Step 3: Component Architecture (`src/components/hero-3d-scene.tsx`)
- **Premise**: `PROJECT.md` specifies `src/components/hero-3d-scene.tsx` with contract:
  ```typescript
  export interface Hero3DSceneProps {
    mode: ModeId;
    theme: 'dark' | 'light';
    activeSlideIndex?: number;
    baseHue?: number;
    secondaryHue?: number;
    onModelClick?: () => void;
    className?: string;
  }
  ```
- **Inference**:
  - `hero-3d-scene.tsx` should be client-side (`'use client'`).
  - It encapsulates:
    1. For `mode === 'tech'`: Render procedural crystal (can preserve the existing iridescent canvas or render Three.js polyhedron mesh).
    2. For `mode === 'medical'`: Render `model-jantung.glb`.
    3. For `mode === 'academic'`: Render `model-quill.glb`.
  - In `src/components/hero.tsx`, replace `<IridescentCrystalCanvas ... />` with `<Hero3DScene ... />`.
  - Update caption dynamically:
    - Tech: `"Interactive 3D Polyhedron • Drag to Rotate"`
    - Medical: `"Interactive 3D Heart • Drag to Rotate"`
    - Academic: `"Interactive 3D Quill • Drag to Rotate"`

### Step 4: 90MB Model Optimization & In-Memory Caching Strategy
- **Premise**: `model-quill.glb` is ~90.19 MB. If reloaded on every mode switch, users will experience 2–5 second freezes and excessive RAM consumption.
- **Inference**:
  - Maintain an in-memory scene cache module-level or useRef:
    ```typescript
    const modelCache = new Map<string, THREE.Group>();
    ```
  - When switching modes:
    - If model is cached, instantly swap scene root without network request or re-parsing.
    - If loading from network, report progress via `loader.load(url, onLoad, onProgress, onError)`:
      ```typescript
      const onProgress = (xhr: ProgressEvent) => {
        if (xhr.lengthComputable && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(percent);
        }
      };
      ```
    - Show an overlay spinner / progress text: `Loading 3D Model... ${loadingProgress}%`.
    - This satisfies E2E test `T2.2.2: Large model loading state boundary (model-quill.glb ~90MB)`.

### Step 5: Camera Framing & Spatial Alignment
- **Heart Model (`model-jantung.glb`)**:
  - Bounding height ~ 0.98. Camera distance ~ 2.2 to 2.5 with FOV 45°.
  - Position: center at `(0, 0, 0)`.
- **Quill Model (`model-quill.glb`)**:
  - Bounding span ~ 1.90 x 1.64 x 1.70.
  - Scale model uniformly by ~0.65 (or set camera distance to ~3.2 with FOV 45°).
  - Position: center at `(0, -0.2, 0)` so the inkwell and quill sit naturally above the hero background pedestal.

### Step 6: Dynamic Lighting & Palette Adaptation per Theme
- **Theme Reactivity**:
  - `dark` theme:
    - Ambient Light: intensity 0.5–0.7, tinted with mode palette (`#38bdf8` Tech, `#c084fc` Medical, `#fb7185` Academic).
    - Directional Key Light: position `(3, 4, 3)`, intensity 1.6–2.0, neutral white `#ffffff`.
    - Point / Rim Light: position `(-3, -2, -2)`, intensity 1.2, colored with mode glow accent.
  - `light` theme:
    - Ambient Light: intensity 0.9–1.1, neutral bright `#f8fafc`.
    - Directional Key Light: position `(2, 5, 3)`, intensity 1.3, warm sunlight `#fff7ed`.
    - Soft fill light: position `(-2, 1, 1)`, intensity 0.4.

### Step 7: Interaction, Damping, & Click Discrimination
- **Drag Rotation**:
  - Track `pointerdown`, `pointermove`, `pointerup`.
  - Update `rotation.y += dx * 0.01` and `rotation.x += dy * 0.01` (clamped to `[-0.7, 0.7]`).
  - In render loop, apply damping (`vx *= 0.95; vy *= 0.95;`) and gentle auto-rotation when idle.
- **Click vs Drag Discrimination**:
  - Record pointer down position `(startX, startY)`.
  - On pointer up, if `Math.hypot(endX - startX, endY - startY) < 5`, treat as a single click and call `onModelClick?.()`.
  - This satisfies E2E test `T1.2.5: 3D model rotation and interactive click callback contract`.

### Step 8: Memory Lifecycle & WebGL Context Loss Recovery
- **Context Loss Handling**:
  - Listen for `webglcontextlost`: call `event.preventDefault()`, set fallback state.
  - Listen for `webglcontextrestored`: reinitialize renderer, reload scene.
  - Satisfies E2E test `T2.2.1: WebGL context loss simulation recovers gracefully`.
- **Disposal on Unmount**:
  - Cancel `requestAnimationFrame`.
  - Remove all DOM listeners.
  - Recursively traverse scene:
    `if (node.geometry) node.geometry.dispose();`
    `if (node.material) (Array.isArray(node.material) ? node.material : [node.material]).forEach(m => { m.map?.dispose(); m.dispose(); });`
  - Call `renderer.dispose()`.

---

## 3. Caveats & Risks

1. **Large Binary Asset Size (90.19 MB)**:
   - `model-quill.glb` is 90.19 MB. In production, downloading 90MB over slower mobile networks takes several seconds.
   - *Mitigation*: Progressive loading percentage bar, non-blocking asynchronous load, caching in memory, and maintaining a lightweight loading placeholder.
2. **Next.js SSR Hydration Boundary**:
   - `three` and WebGL access `window`, `document`, and `WebGLRenderingContext`.
   - *Mitigation*: The component must be marked `'use client'` and must only instantiate Three.js in `useEffect` or after `mounted === true`.
3. **PowerShell Script Execution Policy on Windows**:
   - Running `npm` directly may encounter `PSSecurityException` (`npm.ps1 cannot be loaded`). Always use `npm.cmd` in Windows terminal environments.
4. **Upstream ESLint 9 Issue**:
   - `npm.cmd run lint` encounters a circular JSON structure error in `eslint-config-next: 16.2.1` with `.eslintrc.json`. Note that `npm.cmd run build` has `ignoreDuringBuilds: true` so the build is completely unblocked.

---

## 4. Conclusion & Concrete Recommendations for Worker M2

Worker M2 should implement Milestone 2 by executing the following precise plan:

### Step-by-Step Execution Plan for Worker M2

#### Phase 1: Dependencies Installation
Run in PowerShell:
```powershell
npm.cmd install three meshoptimizer
npm.cmd install -D @types/three
```

#### Phase 2: Public Models Mirroring
Create `public/models/` and copy both GLB files:
```powershell
if (!(Test-Path "public\models")) { New-Item -ItemType Directory -Path "public\models" -Force }
Copy-Item "src\assets\models\model-jantung.glb" "public\models\model-jantung.glb" -Force
Copy-Item "src\assets\models\model-quill.glb" "public\models\model-quill.glb" -Force
```

#### Phase 3: Implement `src/components/hero-3d-scene.tsx`
Create `src/components/hero-3d-scene.tsx` supporting:
1. `mode: 'tech' | 'medical' | 'academic'`
2. `theme: 'dark' | 'light'`
3. `onModelClick?: () => void`
4. Three.js `WebGLRenderer`, `PerspectiveCamera`, `Scene`.
5. `GLTFLoader` configured with `MeshoptDecoder` for `model-jantung.glb`.
6. `GLTFLoader` with progress tracking and in-memory cache for `model-quill.glb`.
7. Procedural 3D polyhedron for Tech mode (or embedding the crystal renderer).
8. Context loss event listeners (`webglcontextlost` and `webglcontextrestored`).
9. Clean unmount disposal loop.

#### Phase 4: Integrate in `src/components/hero.tsx`
1. Replace `IridescentCrystalCanvas` with `Hero3DScene`.
2. Update caption text dynamically based on `activeMode`:
   - `tech`: `"Interactive 3D Polyhedron • Drag to Rotate"`
   - `medical`: `"Interactive 3D Heart • Drag to Rotate"`
   - `academic`: `"Interactive 3D Quill • Drag to Rotate"`
3. Connect `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}`.

#### Phase 5: Verification & Tests
1. Run `node tests/e2e/runner.mjs` (must pass 78/78).
2. Run `npm.cmd run typecheck` (must pass with 0 errors).
3. Run `npm.cmd run build` (must export static site to `out/` with `out/models/*.glb` present).

---

## 5. Verification Method

To independently verify the implementation and findings:

1. **Verify Asset Headers & Extensions**:
   ```powershell
   node -e "const fs = require('fs'); const { parseGlbHeader } = require('./tests/e2e/helpers/oracle.mjs'); console.log('Jantung:', parseGlbHeader(fs.readFileSync('src/assets/models/model-jantung.glb')).extensionsUsed); console.log('Quill:', parseGlbHeader(fs.readFileSync('src/assets/models/model-quill.glb')).extensionsUsed);"
   ```
2. **Verify Public Mirroring**:
   ```powershell
   Test-Path "public\models\model-jantung.glb"
   Test-Path "public\models\model-quill.glb"
   ```
3. **Run Full Regression Test Suite**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
4. **TypeScript Strict Typecheck**:
   ```powershell
   npm.cmd run typecheck
   ```
5. **Static Export Production Build**:
   ```powershell
   npm.cmd run build
   ```
   Confirm `out/models/model-jantung.glb` and `out/models/model-quill.glb` exist after build.
