# Milestone 2 Iteration 1 — Technical Investigation Report

**Author**: Explorer 3 (`explorer_m2_it1_3`)  
**Mission**: Next.js Static Export Asset Delivery, Dynamic Import Architecture, Progressive Loading & WebGL Fallback for 3D GLB Models  
**Timestamp**: 2026-11-06T00:45:00Z  

---

## 1. Observation

### Obs 1.1: Next.js Static Export Configuration & Current Build Behavior
- In `next.config.ts` (lines 3–5):
  ```typescript
  const nextConfig: NextConfig = {
    output: 'export',
    // basePath: '/portofolio',
  ```
- The production build command executed via `node -r ./patch-fs.js node_modules/next/dist/bin/next build` exited with Code `0`:
  ```
  ✓ Compiled successfully in 51s
  ✓ Generating static pages (4/4)
  ✓ Exporting (2/2)
  Route (app)                                 Size  First Load JS
  ┌ ○ /                                    46.4 kB         149 kB
  └ ○ /_not-found                            123 B         102 kB
  + First Load JS shared by all             102 kB
  ```
- Inspection of the generated `out/` directory shows:
  - `out/icons/` was generated because `public/icons/` exists on disk (containing 3 SVG icons of ~1.8MB each).
  - `out/models/` was **NOT** generated because `public/models/` does not currently exist.

### Obs 1.2: Source 3D Model Assets vs Public Model Directory
- Source files directly verified in `src/assets/models/`:
  - `model-jantung.glb`: `18,141,244` bytes (~18.14MB), containing extensions `EXT_meshopt_compression` and `KHR_mesh_quantization`.
  - `model-quill.glb`: `90,192,408` bytes (~90.19MB), standard glTF 2.0 binary.
- Directory listing of `public/`:
  - `public/favicon.ico` (4,286 bytes)
  - `public/CV I Gede Arya Krisnanda Sutasoma.pdf` (199,876 bytes)
  - `public/icons/` (3 SVG files)
  - `public/models/`: **Missing** (not present on disk).

### Obs 1.3: Current 3D Canvas Implementation in `src/components/hero.tsx` & `src/components/crystal-canvas.tsx`
- In `src/components/hero.tsx` (lines 11, 180–194):
  ```tsx
  import { IridescentCrystalCanvas } from './crystal-canvas';
  ...
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
- In `src/components/crystal-canvas.tsx` (lines 43–48):
  - Uses HTML5 2D canvas context: `const ctx = canvas.getContext('2d');`.
  - Performs 3D wireframe vertex projection onto 2D canvas with manual trigonometric rotation and linear gradients.
  - Does NOT import Three.js, WebGL, or GLTFLoader.

### Obs 1.4: Dependencies in `package.json`
- In `package.json`:
  - `three`, `@types/three`, and `meshoptimizer` are **NOT** installed in `dependencies` or `devDependencies`.
  - Node resolution test:
    ```
    three not found
    meshoptimizer not found
    ```

### Obs 1.5: Automated E2E Test Suite R2 Assertions
- Central test runner execution (`node tests/e2e/runner.mjs`) ran 78 tests across 4 tiers with 100% pass (Exit Code 0, Duration: 1.58s).
- In `tests/e2e/helpers/fixtures.mjs` (lines 27–41):
  ```javascript
  export const MODEL_ASSETS = {
    medical: {
      source: 'src/assets/models/model-jantung.glb',
      public: 'public/models/model-jantung.glb',
      requiredExtensions: ['EXT_meshopt_compression', 'KHR_mesh_quantization']
    },
    academic: {
      source: 'src/assets/models/model-quill.glb',
      public: 'public/models/model-quill.glb',
      requiredExtensions: []
    },
    tech: {
      type: 'procedural-polyhedron'
    }
  };
  ```
- In `tests/e2e/tier1-feature-coverage.test.mjs` (lines 135–139):
  ```javascript
  test('T1.2.6: Static export public model mirror path contract', () => {
    assertEqual(MODEL_ASSETS.medical.public, 'public/models/model-jantung.glb');
    assertEqual(MODEL_ASSETS.academic.public, 'public/models/model-quill.glb');
  });
  ```
- In `tests/e2e/tier2-boundary-corner.test.mjs` (lines 84–110):
  - `T2.2.1`: WebGL context loss and fallback trigger simulation.
  - `T2.2.2`: Large model loading progress calculation boundary (`model-quill.glb` ~90MB, simulating `Math.round((loaded / total) * 100)`).
  - `T2.2.3`: Meshopt corrupted buffer header rejection.

---

## 2. Logic Chain

### Step 2.1: Static Export Model Serving Architecture
1. In Next.js with `output: 'export'` (Obs 1.1), assets fetched at runtime by client-side Three.js `GLTFLoader.load(url, ...)` cannot be imported directly from `src/assets/` because Next.js does not serve arbitrary non-JS source directory files over HTTP.
2. In Next.js, static files placed in `public/` are served at root `/` during development (`next dev`), and during `next build`, Next.js static export automatically copies the entire `public/` directory to `out/` (Obs 1.1).
3. Therefore, `model-jantung.glb` and `model-quill.glb` from `src/assets/models/` must be mirrored to `public/models/` (Obs 1.2, Obs 1.5).
4. Symlinks on Windows NTFS / DrvFs are prone to `readlink` EISDIR/EPERM errors (as documented in `PROJECT.md` line 49 and `patch-fs.js`). Therefore, mirroring should be done via actual file copy (or committed to `public/models/`).
5. **Base Path Portability**: Because `next.config.ts` includes `// basePath: '/portofolio'`, model URL construction in client components must support optional basePath:
   ```typescript
   const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
   const modelUrl = `${basePath}/models/${modelFileName}`;
   ```
   This ensures zero 404 errors regardless of root hosting or subpath hosting (e.g. GitHub Pages).

### Step 2.2: Next.js Dynamic Import & SSR Prevention
1. Three.js requires browser APIs (`window`, `document`, `HTMLCanvasElement`, `WebGLRenderingContext`). In Next.js SSR / static export page pre-rendering (Obs 1.1), Node.js executes client components during static compilation.
2. If Three.js is imported directly at the top level of `hero.tsx` or rendered during SSR without protection, it throws `ReferenceError: window is not defined` or fails during canvas context acquisition.
3. Next.js `next/dynamic` with `{ ssr: false }` eliminates this failure mode:
   ```typescript
   import dynamic from 'next/dynamic';

   const Hero3DScene = dynamic(
     () => import('./hero-3d-scene').then((m) => m.Hero3DScene),
     {
       ssr: false,
       loading: () => <Hero3DLoadingSkeleton mode={activeMode} />
     }
   );
   ```
4. **Bundle Splitting Benefit**: Three.js minified bundle is ~600KB. By isolating it behind `next/dynamic`, First Load JS for `hero.tsx` remains ~149KB (Obs 1.1), preventing First Contentful Paint (FCP) and Largest Contentful Paint (LCP) regression.

### Step 2.3: Progressive Loading Skeleton Architecture (Dual-Stage)
1. **Asset Size Reality**: `model-jantung.glb` is 18.14MB and `model-quill.glb` is 90.19MB (Obs 1.2). On a 25 Mbps connection, downloading `model-quill.glb` takes ~30 seconds.
2. **Dual-Stage Loading Lifecycle**:
   - **Stage 1 (Module Loading)**: Next.js asynchronously loads the `Hero3DScene` JS bundle chunk. Handled by `next/dynamic`'s `loading` fallback (`<Hero3DSkeleton />`).
   - **Stage 2 (Asset Streaming & Meshopt Decoding)**: Handled within `Hero3DScene` using `GLTFLoader.load(url, onLoad, onProgress, onError)`.
3. **Progress Calculation with Known Byte Fallback**:
   In static file servers or chunked HTTP responses, `xhr.lengthComputable` can occasionally be false. The progress handler must incorporate known file sizes (Obs 1.2, Obs 1.5):
   ```typescript
   const KNOWN_SIZES = {
     medical: 18_141_244,
     academic: 90_192_408,
     tech: 0
   };

   function onProgress(xhr: ProgressEvent) {
     const total = xhr.total || KNOWN_SIZES[mode] || 1;
     const percent = Math.min(100, Math.round((xhr.loaded / total) * 100));
     setProgress(percent);
   }
   ```
4. **Visual Presentation**:
   - Concentric pulse rings matching current hero aesthetics (`rounded-full border border-slate-900/10 dark:border-white/20`).
   - Mode-specific ambient glow:
     - Medical: Rose/Crimson pulse with cardiac heartbeat rhythm (`#f43f5e`).
     - Academic: Violet/Gold luminous shimmer (`#8b5cf6`, `#d97706`).
     - Tech: Instant render (procedural polyhedron, 0 network bytes).
   - Numeric percentage badge: `Memuat Model 3D (${progress}%)` with a sleek 2px gradient progress bar.
   - Smooth cross-fade transition (`opacity-0` -> `opacity-100` over 400ms) upon load completion to prevent jarring geometric pop-in.
5. **In-Memory Cache**:
   - Cache parsed `GLTF.scene` instances in a module-level Map keyed by mode (`'medical'`, `'academic'`).
   - Switching from Medical -> Academic -> Medical returns the cached cloned scene instantly with 0ms network latency and 0 bytes re-downloaded.

### Step 2.4: Error Boundary & WebGL Degradation Fallback
1. **Failure Modes**:
   - WebGL disabled in browser settings or blocked by enterprise/privacy policy.
   - Headless CI / test environments lacking GPU acceleration.
   - Mobile GPU running out of memory (VRAM) allocating the 90MB Quill mesh.
   - `webglcontextlost` triggered when switching tabs or backgrounding the browser.
2. **Pre-flight Capability Check**:
   Before initializing `new THREE.WebGLRenderer()`, test canvas context:
   ```typescript
   export function isWebGLAvailable(): boolean {
     if (typeof window === 'undefined') return false;
     try {
       const canvas = document.createElement('canvas');
       return Boolean(
         window.WebGL2RenderingContext && canvas.getContext('webgl2')
       ) || Boolean(
         window.WebGLRenderingContext && canvas.getContext('webgl')
       );
     } catch {
       return false;
     }
   }
   ```
3. **Fallback Component (Graceful Degradation)**:
   - If WebGL is unavailable or fails, fallback to `IridescentCrystalCanvas` (Obs 1.3).
   - Because `IridescentCrystalCanvas` uses HTML5 2D canvas (`canvas.getContext('2d')`), it is 100% crash-proof across all devices, mobile platforms, and headless engines.
   - Tint the 2D crystal colors to match active mode (e.g. Crimson/Rose for Medical, Purple/Amber for Academic).
4. **WebGL Context Loss Protocol**:
   ```typescript
   canvas.addEventListener('webglcontextlost', (e) => {
     e.preventDefault();
     cancelAnimationFrame(animFrameId);
     setIsContextLost(true);
   });
   canvas.addEventListener('webglcontextrestored', () => {
     setIsContextLost(false);
     initScene();
   });
   ```
   Directly satisfies E2E test `T2.2.1` (Obs 1.5).

### Step 2.5: Test Suite Compatibility
1. The test runner `tests/e2e/runner.mjs` executes in pure Node.js (Obs 1.5).
2. It uses `PortfolioSimulator` to test state transitions and oracle assertions.
3. As long as `Hero3DScene` satisfies the props contract (`mode`, `theme`, `onModelClick`) and models are placed in `public/models/`, all 78 tests will remain 100% passing.

---

## 3. Caveats

1. **Model Quill File Size (90.19MB)**:
   - While `model-jantung.glb` is compressed with `EXT_meshopt_compression` (18.1MB), `model-quill.glb` is completely uncompressed (90.2MB).
   - In git repository hosting and HTTP static serving, a 90MB file is large. On mobile networks with limited data, this may cause slow downloads.
   - *Mitigation*: Progressive loading indicator with byte percentage, in-memory caching after first load, and WebGL error fallback prevent application hangs. (Future post-M2 optimization: run `gltf-transform optimize` on `model-quill.glb` to reduce size by ~70%).
2. **MeshoptDecoder WASM Loading**:
   - `MeshoptDecoder` requires its WebAssembly module to compile before decoding `model-jantung.glb`.
   - `await MeshoptDecoder.ready` MUST be resolved before passing `MeshoptDecoder` to `loader.setMeshoptDecoder(MeshoptDecoder)`.
3. **Windows File Locks During Build**:
   - Windows DrvFs / WSL can hold transient locks on large files.
   - Copying files to `public/models/` should be done once or conditionally (`if (!fs.existsSync(dest))`) to avoid file collision during build.

---

## 4. Conclusion & Concrete Recommendations for Worker M2

### Summary Assessment
Next.js static export requires models to reside in `public/models/*.glb`. Three.js canvas integration must be isolated behind `next/dynamic` (`{ ssr: false }`) with a dual-stage loading skeleton and an HTML5 2D canvas fallback on WebGL failure.

### Implementation Blueprint for Worker M2

#### Phase 1: Dependency Installation & Public Asset Mirroring
1. Install dependencies:
   ```powershell
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install three meshoptimizer
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install -D @types/three
   ```
2. Mirror models from `src/assets/models/` to `public/models/`:
   - Create `public/models/` directory.
   - Copy `src/assets/models/model-jantung.glb` -> `public/models/model-jantung.glb`.
   - Copy `src/assets/models/model-quill.glb` -> `public/models/model-quill.glb`.
   - Add a sync check in `scripts/sync-models.js` or `package.json` to guarantee presence before build.

#### Phase 2: Create `src/components/hero-3d-scene.tsx`
Create client component with:
- WebGL detection (`isWebGLAvailable()`).
- Three.js Scene, PerspectiveCamera, WebGLRenderer (`alpha: true`, `antialias: true`).
- `GLTFLoader` with `loader.setMeshoptDecoder(MeshoptDecoder)`.
- Mode-specific dispatch:
  - `tech`: Procedural polyhedron crystal (Three.js Icosahedron/Polyhedron with dispersion shaders).
  - `medical`: `/models/model-jantung.glb` with cardiac pulse animation & ambient red glow.
  - `academic`: `/models/model-quill.glb` with gentle floating animation & violet/gold ambient light.
- Normalization: Auto-center and fit model into view using `THREE.Box3`.
- Interactive rotation (pointer drag with damping) and click handler calling `onModelClick()`.
- Full disposal in `useEffect` cleanup (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, `renderer.forceContextLoss()`).

#### Phase 3: Create `src/components/hero-3d-skeleton.tsx`
Create sleek loading indicator:
- Concentric glowing orbital rings.
- Mode-themed pulse animations (ECG rhythm for medical, shimmer for academic).
- Numeric progress display: `Memuat Model 3D (${progress}%)`.
- Graceful 2D canvas fallback if WebGL is unavailable or crashes.

#### Phase 4: Wire into `src/components/hero.tsx`
- Dynamically import `Hero3DScene`:
  ```tsx
  const Hero3DScene = dynamic(
    () => import('./hero-3d-scene').then((mod) => mod.Hero3DScene),
    {
      ssr: false,
      loading: () => <Hero3DSkeleton mode={activeMode} />
    }
  );
  ```
- Replace `<IridescentCrystalCanvas ... />` in `hero.tsx` with `<Hero3DScene ... />`.
- Update caption label dynamically based on `activeMode`:
  - Tech: `Interactive 3D Polyhedron • Drag to Rotate`
  - Medical: `Anatomical 3D Heart • Interactive Model`
  - Academic: `Academic 3D Quill • Interactive Model`

---

## 5. Verification Method

### Independent Verification Commands
1. **E2E Test Regression**:
   ```powershell
   node tests/e2e/runner.mjs
   ```
   *Expected*: All 78 tests pass (100% Pass Rate).
2. **R2 Specific Test Verification**:
   ```powershell
   node tests/e2e/runner.mjs --filter "Medical"
   node tests/e2e/runner.mjs --filter "Academic"
   ```
   *Expected*: All R2 asset integrity and dispatch tests pass.
3. **Public Models Presence Check**:
   ```powershell
   node -e "const fs = require('fs'); ['public/models/model-jantung.glb', 'public/models/model-quill.glb'].forEach(p => console.log(p, fs.existsSync(p), fs.statSync(p).size));"
   ```
   *Expected*: Both files exist, `model-jantung.glb` ~18.1MB, `model-quill.glb` ~90.2MB.
4. **Next.js Static Export Verification**:
   ```powershell
   node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
   ```
   *Expected*: Build succeeds with exit code 0; `out/models/model-jantung.glb` and `out/models/model-quill.glb` are generated in static export.

### Invalidation Conditions
- Any test failure in `node tests/e2e/runner.mjs`.
- `out/models/` missing after static export.
- `window is not defined` or `document is not defined` build error due to missing `{ ssr: false }`.
- Blank screen or uncaught exception when WebGL is disabled in client browser.
