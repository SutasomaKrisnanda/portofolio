# Milestone 1 Technical Strategy & Investigation Report: 3D Asset Restoration & Loader Architecture

**Author**: Explorer M1-1 (`teamwork_explorer`)  
**Parent**: `orchestrator_gen4`  
**Working Directory**: `.agents/teamwork/explorer_m1_g4_1`  
**Date**: 2026-11-10  
**Target Milestone**: Milestone 1 (Features 1, 2, 3, 4, 5 — R1, R2)

---

## 1. Executive Summary

This report delivers an implementation-ready technical strategy for Milestone 1. Our forensic and experimental investigation confirms:
1. **Quill Asset Restoration**: `public/models/model-quill.glb` is directly recoverable from git commit `f894fdf` (or blob `7a4f4ed6c35c3ea36715e945571e7864a12abddb`) at exactly 90,192,408 bytes (~86 MB). An identical intact copy currently exists in `out/models/model-quill.glb` (sha1 verified: `7a4f4ed6c35c3ea36715e945571e7864a12abddb`).
2. **Heart Asset Validation**: `public/models/model-jantung.glb` is intact at 18,141,244 bytes (~18.14 MB). Binary parsing confirmed it requires `EXT_meshopt_compression` and `KHR_mesh_quantization`. It is centered at the origin $[0, 0, 0]$ with bounding box $[-0.234, -0.490, -0.325]$ to $[0.234, 0.490, 0.325]$.
3. **Build & GitHub Pages Compliance**: Both files are under the 100 MB GitHub file limit. In Next.js static export (`output: 'export'`), files in `public/models/` are copied verbatim to `out/models/` during `next build` and fetched via runtime HTTP requests; zero 3D geometry bytes are bundled into client JavaScript chunks.
4. **Loader Architecture**: Three.js `v0.187.0` and `meshoptimizer v1.3.0` are installed. `GLTFLoader` with `MeshoptDecoder` (initialized via `await MeshoptDecoder.ready; loader.setMeshoptDecoder(MeshoptDecoder)`) reliably decodes both assets.
5. **Animation Physics**:
   - **Heart (Medical)**: 72 BPM ($f = 1.2\text{ Hz}$, period $T = 0.8333\text{ s}$) authentic dual-pulse Lub-Dub systole + atrial kick with anatomical resting tilt (apical slant $\theta_z \approx -0.35\text{ rad}$, pitch $\theta_x \approx 0.20\text{ rad}$) and synchronized hemodynamic lighting.
   - **Quill (Academic)**: Harmonic levitation ($Y = \sin(1.6t) \cdot 0.09$) with calligraphic scribe stance and incommensurate Lissajous micro-wobble.
6. **Modal Decoupling**: Removing `onModelClick` from `Hero3DSceneProps`, canvas pointer handlers, and `hero.tsx` fully satisfies R1.4.

---

## 2. 3D Model Asset Forensic Analysis & Restoration

### 2.1 Git Forensic Evidence
- **Target File**: `public/models/model-quill.glb`
- **Origin Commit**: `f894fdf29002f8639f82f083421eb39428b196bd` ("Transform the entire website into three mode: Tech, Medical, and Academic...")
- **Git Object Tree**: `528ea59f4e272522a091d3abfebe92f1ff88b28f`
- **Git Blob SHA-1**: `7a4f4ed6c35c3ea36715e945571e7864a12abddb`
- **Exact File Size**: 90,192,408 bytes (~86.01 MiB / 90.19 MB)
- **Status in Git**: Tracked in repository HEAD, currently listed as `deleted: public/models/model-quill.glb` in working tree.
- **Pre-existing Output Cache**: `out/models/model-quill.glb` has identical SHA-1 hash `7a4f4ed6c35c3ea36715e945571e7864a12abddb`.

### 2.2 Validation of `public/models/model-jantung.glb`
- **File Path**: `public/models/model-jantung.glb`
- **Git Blob SHA-1**: `c6bbf0c256ba363fb93fd44d98019d57b34f6a42`
- **Exact File Size**: 18,141,244 bytes (~17.30 MiB / 18.14 MB)
- **GLB Header Inspection**:
  - `magic`: `glTF`, version: `2`, total length: `18141244`
  - `extensionsUsed`: `['KHR_mesh_quantization', 'EXT_meshopt_compression']`
  - `extensionsRequired`: `['KHR_mesh_quantization', 'EXT_meshopt_compression']`
  - Meshes: 1, Nodes: 1, Built-in animations: 0 (procedural code required)
  - Bounding Box: Min `[-0.2341, -0.4898, -0.3248]`, Max `[0.2340, 0.4897, 0.3250]`
  - Maximum Dimension: $\approx 0.980\text{ units}$. Centered at $[0, 0, 0]$.

### 2.3 Static Asset Build & GitHub Pages Constraint Verification
1. **GitHub Hard Limits**: GitHub rejects commits containing files $\ge 100\text{ MB}$.
   - `model-quill.glb` is $90.19\text{ MB} < 100\text{ MB}$ (compliant).
   - `model-jantung.glb` is $18.14\text{ MB} \ll 100\text{ MB}$ (compliant).
2. **Next.js Static Export (`output: 'export'`)**:
   - In Next.js App Router, static files in `public/` are mapped 1:1 into the static distribution directory `out/`.
   - Inspection of `out/models/` confirmed:
     ```
     out/models/model-jantung.glb (18,141,244 bytes)
     out/models/model-quill.glb   (90,192,408 bytes)
     ```
   - Build scripts (`scripts/clean.js` and `npm run build`) execute `next build`, which copies `public/models/` to `out/models/`.
   - Neither model is bundled into JS chunks. The client loads models via HTTP `fetch` in Three.js runtime.

### 2.4 Worker Action for Asset Restoration
The Worker should execute the following restoration sequence:
```bash
# Option A: Restore from git HEAD / commit f894fdf
git checkout f894fdf -- public/models/model-quill.glb

# Option B: Restore from local out/models if git is not in current PATH
cp "out/models/model-quill.glb" "public/models/model-quill.glb"

# Option C: In WSL Ubuntu
wsl -d Ubuntu -e bash -c "cd '/home/krisnanda/Code/Project/Personal - github/portofolio' && git checkout f894fdf -- public/models/model-quill.glb"
```
**Verification Command**:
```powershell
node -e "const fs = require('fs'); const s = fs.statSync('public/models/model-quill.glb').size; if (s === 90192408) console.log('RESTORE_VERIFIED_OK'); else throw new Error('Size mismatch: ' + s);"
```

---

## 3. Three.js GLTFLoader & MeshoptDecoder Setup Architecture

### 3.1 Dependencies & Module Imports
Verified in `package.json`:
- `"three": "^0.187.0"`
- `"meshoptimizer": "^1.3.0"`
- `"@types/three": "^0.187.0"`

In `src/components/hero-3d-scene.tsx`, import:
```typescript
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
```

### 3.2 Decoder Initialization & Asynchronous Loading
`MeshoptDecoder` requires WebAssembly initialization. `MeshoptDecoder.ready` is a Promise that resolves when the decoder is compiled:
```typescript
// Shared singleton loader configuration
let gltfLoaderInstance: GLTFLoader | null = null;

async function getGLTFLoader(): Promise<GLTFLoader> {
  if (!gltfLoaderInstance) {
    await MeshoptDecoder.ready;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    gltfLoaderInstance = loader;
  }
  return gltfLoaderInstance;
}
```

### 3.3 Normalization & Centering Pipeline
Because `model-jantung.glb` ($D_{\text{max}} \approx 0.98$) and `model-quill.glb` ($D_{\text{max}} \approx 1.90$) have different native extents, both must be normalized to `targetSize = 2.40` so they occupy an identical visual volume in the canvas:
```typescript
function normalizeLoadedModel(modelScene: THREE.Group, targetSize = 2.40): { pivotGroup: THREE.Group; baseScale: number } {
  const pivotGroup = new THREE.Group();

  // Compute tight bounding box
  const box = new THREE.Box3().setFromObject(modelScene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

  // Center model origin
  const center = box.getCenter(new THREE.Vector3());
  modelScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  modelScene.scale.setScalar(scale);

  // Enable shadow casting / receiving and sRGB material encoding
  modelScene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => { m.needsUpdate = true; });
        } else {
          mesh.material.needsUpdate = true;
        }
      }
    }
  });

  pivotGroup.add(modelScene);
  return { pivotGroup, baseScale: 1.0 };
}
```

### 3.4 In-Memory Scene Cache & Progress Tracking
To prevent re-downloading or re-parsing when the user switches between Tech, Medical, and Academic modes:
```typescript
interface CachedModel {
  pivotGroup: THREE.Group;
  baseScale: number;
}
const modelSceneCache = new Map<ModeId, CachedModel>();
```
When `switchModel(targetMode)` is called:
1. If `modelSceneCache.has(targetMode)`, immediately remove the old pivot and add the cached pivot to `scene`. Zero network delay, zero re-parsing.
2. If `targetMode === 'tech'`, generate procedural `createTechPolyhedron()` instantly.
3. If `targetMode === 'medical'` or `'academic'`:
   - Set `loadingProgress(0)`.
   - Call `loader.load('/models/' + assetFile, onLoad, onProgress, onError)`.
   - In `onProgress`: compute `Math.round((event.loaded / event.total) * 100)` and update `loadingProgress`.
   - In `onLoad`: normalize model, store in `modelSceneCache`, mount to scene, set `loadingProgress(null)`.
   - In `onError`: log descriptive warning, fall back gracefully to procedural backup (`createMedicalDNA()` or `createAcademicQuill()`), set `loadingProgress(null)`.

### 3.5 SSR Safety & Skeleton Loading
- `src/components/hero.tsx` dynamically imports `Hero3DScene` with `ssr: false`:
  ```typescript
  const Hero3DScene = dynamic(
    () => import('./hero-3d-scene').then((mod) => mod.Hero3DScene),
    {
      ssr: false,
      loading: () => <Hero3DSkeleton mode="tech" />
    }
  );
  ```
- In `hero-3d-scene.tsx`, `isWebGLAvailable()` verifies WebGL1/WebGL2 availability before creating the renderer. If WebGL is unsupported or the context is lost, it degrades gracefully to `IridescentCrystalCanvas` or `Hero3DSkeleton`.

---

## 4. Authentic Animations Formulation

### 4.1 Medical Mode: 72 BPM Cardiac Cycle (Lub-Dub & Systole/Diastole)
#### Physiological Parameters:
- Heart Rate: $HR = 72 \text{ beats per minute}$.
- Frequency: $f = \frac{72}{60} = 1.20\text{ Hz}$.
- Cardiac Period: $T = \frac{1}{f} = \frac{5}{6} \approx 0.8333\text{ seconds}$.
- Instantaneous Phase: $\phi(t) = \frac{t \pmod T}{T} \in [0, 1)$.

#### Hemodynamic Pulse Function $P(\phi)$:
The human heartbeat consists of ventricular systole ("Lub" / S1), followed by semilunar valve closure / early diastolic rebound ("Dub" / S2), and an end-diastolic atrial kick (P wave):
$$P(\phi) = A_1 \exp\left(-\frac{(\phi - \phi_1)^2}{2\sigma_1^2}\right) + A_2 \exp\left(-\frac{(\phi - \phi_2)^2}{2\sigma_2^2}\right) + A_3 \exp\left(-\frac{(\phi - \phi_3)^2}{2\sigma_3^2}\right)$$
Constants:
- **S1 (Ventricular Systole - Lub)**: $\phi_1 = 0.12$, $\sigma_1 = 0.050$, $A_1 = 1.00$
- **S2 (Semilunar Rebound - Dub)**: $\phi_2 = 0.32$, $\sigma_2 = 0.045$, $A_2 = 0.42$
- **Atrial Kick (Late Diastolic Pre-systole)**: $\phi_3 = 0.92$, $\sigma_3 = 0.040$, $A_3 = 0.22$

#### Transform Dynamics:
1. **Cardiac Volumetric Scaling**:
   $$S(t) = S_{\text{base}} \cdot (1.0 + 0.075 \cdot P(\phi))$$
2. **Anatomical Resting Orientation**:
   Human anatomical apex points anteroinferiorly and to the left:
   $$\theta_{z, \text{rest}} = -0.32\text{ rad} \approx -18.3^\circ \quad (\text{left apical slant})$$
   $$\theta_{x, \text{rest}} = 0.20\text{ rad} \approx +11.5^\circ \quad (\text{anterior apex inclination})$$
   $$\theta_{y, \text{rest}} = 0.15\text{ rad} \quad (\text{interventricular sulcus presentation})$$
3. **Systolic Ventricular Torsion (Wringing Motion)**:
   During peak systole, the apex undergoes physiological counter-clockwise twist:
   $$\Delta \theta_y(t) = 0.045 \cdot P(\phi)$$
   $$\Delta \theta_z(t) = 0.025 \cdot P(\phi)$$
4. **Synchronized Hemodynamic Luminescence**:
   $$I_{\text{point}}(t) = 0.80 + 1.20 \cdot P(\phi)$$

---

### 4.2 Academic Mode: Quill Harmonic Levitation & Scribe Wobble
#### Transform Dynamics:
1. **Harmonic Levitation**:
   $$Y(t) = \sin(1.60 \cdot t) \cdot 0.090$$
   - Frequency $\omega_1 = 1.60\text{ rad/s}$ ($f \approx 0.255\text{ Hz}$, $T \approx 3.93\text{ s}$).
   - Amplitude $A_y = 0.090\text{ units}$.
2. **Resting Scribe Calligraphic Stance**:
   $$\theta_{z, 0} = -0.28\text{ rad} \approx -16.0^\circ \quad (\text{cursive writing tilt})$$
   $$\theta_{x, 0} = 0.18\text{ rad} \approx +10.3^\circ \quad (\text{forward pitch toward desk})$$
3. **Incommensurate Scribe Micro-Wobble (Lissajous Motion)**:
   Micro-strokes executed as an organic figure-eight cursive trail:
   $$\Delta \theta_x(t) = 0.035 \cdot \cos(1.80 \cdot t)$$
   $$\Delta \theta_z(t) = 0.040 \cdot \sin(2.20 \cdot t + 0.40)$$
   $$\Delta \theta_y(t) = 0.020 \cdot \sin(0.90 \cdot t)$$
   Because frequencies $\{1.60, 1.80, 2.20, 0.90\}$ are mutually irrational, motion never appears mechanically repeating.

---

## 5. Modal Decoupling & Hero Layout Sizing

### 5.1 Modal Decoupling (R1.4)
1. **Interface Clean-up**: Remove `onModelClick?: () => void` from `Hero3DSceneProps`.
2. **Event Handling**: In `hero-3d-scene.tsx`:
   - Delete click discrimination in `handlePointerUp`:
     ```typescript
     // REMOVED:
     // if (totalDragDistRef.current < 5) { onModelClick?.(); }
     ```
   - Delete `title` tooltip suggesting clicks open project case studies:
     ```typescript
     // Changed from:
     // title="Geser mouse untuk memutar model 3D, atau klik untuk melihat studi kasus projek aktif"
     // Changed to:
     title="Interaktif 3D: Geser mouse untuk memutar model"
     ```
3. **In `src/components/hero.tsx`**:
   - Remove `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}` from `<Hero3DScene />` invocation.

### 5.2 Hero Layout & Canvas Sizing (R2.1)
- Canvas dimensions:
  `className="w-[300px] h-[320px] sm:w-[340px] sm:h-[360px] lg:w-[380px] lg:h-[400px] xl:w-[400px] xl:h-[420px] cursor-grab active:cursor-grabbing relative z-10 touch-none"`
- Pedestal ambient rings scaled to match:
  - Ring 1: `w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px]`
  - Ring 2: `w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]`
- Preserves viewport budget so "Explore work" status bar and navigation stay fully visible above the fold on 768p, 1080p, and mobile.

---

## 6. Implementation Code Plan for Worker M1

### Step 1: Restore Asset
Run restoration in `public/models/`:
```bash
git checkout f894fdf -- public/models/model-quill.glb
```
Validate with:
```bash
ls -lh public/models/
# Expect:
# model-jantung.glb: ~18MB
# model-quill.glb:   ~86MB (90,192,408 bytes)
```

### Step 2: Update `src/components/hero-3d-scene.tsx`
1. Add imports:
   ```typescript
   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
   import { MeshoptDecoder } from 'meshoptimizer';
   ```
2. Remove `onModelClick` from `Hero3DSceneProps`.
3. Add singleton `getGLTFLoader()` and model normalizer `normalizeLoadedModel()`.
4. Update `switchModel()` to load `/models/model-jantung.glb` for `medical` and `/models/model-quill.glb` for `academic`, using `modelSceneCache`.
5. Update animation loop in `animate()` with:
   - 72 BPM cardiac Lub-Dub Gaussian pulse for `medical`.
   - Harmonic levitation and Lissajous scribe wobble for `academic`.
6. Remove click callback invocation from `handlePointerUp`.

### Step 3: Update `src/components/hero.tsx`
1. Remove `onModelClick` prop passed to `<Hero3DScene />`.

### Step 4: Verification
1. Run `npm.cmd run typecheck` (`tsc --noEmit`).
2. Run `npm.cmd run lint`.
3. Run `npm.cmd run build` and verify `out/models/model-jantung.glb` and `out/models/model-quill.glb` are created and identical to `public/models/`.

---

## 7. Risk Analysis & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `MeshoptDecoder` WASM takes time to compile | Initial load delay or flicker | Await `MeshoptDecoder.ready` inside async loader factory; display `<Hero3DSkeleton>` during loading |
| User rapidly switches modes before GLB finishes downloading | Race condition / stale model attached | Maintain `activeRequestId` counter in `switchModel`; only attach loaded scene if request ID matches current active mode |
| Asset load failure on network glitch | Blank canvas | Retain procedural fallbacks (`createMedicalDNA()`, `createAcademicQuill()`) as catch handler |
| File size of `model-quill.glb` (86 MB) | Network transfer time | Enable in-memory `modelSceneCache`; once downloaded, switching modes is instant from RAM |
