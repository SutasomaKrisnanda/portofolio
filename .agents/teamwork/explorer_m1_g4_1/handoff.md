# Milestone 1 Handoff Report: 3D Asset Restoration & Loader Architecture

**Author**: Explorer M1-1 (`teamwork_explorer`)  
**Parent**: `orchestrator_gen4` (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Target Recipient**: Worker M1 / Orchestrator  
**Working Directory**: `.agents/teamwork/explorer_m1_g4_1`  
**Date**: 2026-11-10  
**Handoff Type**: Hard (Investigation complete, implementation-ready)

---

## 1. Observation

1. **Quill Asset Forensic Data**:
   - `public/models/model-quill.glb` was added in git commit `f894fdf29002f8639f82f083421eb39428b196bd` with size 90,192,408 bytes.
   - Running `git ls-tree 528ea59f4e272522a091d3abfebe92f1ff88b28f` revealed blob hash `7a4f4ed6c35c3ea36715e945571e7864a12abddb`.
   - Running `git status` revealed: `deleted: public/models/model-quill.glb`.
   - Running `git hash-object out/models/model-quill.glb` confirmed that `out/models/model-quill.glb` is identical to blob `7a4f4ed6c35c3ea36715e945571e7864a12abddb` (size: 90,192,408 bytes).
   - Binary header inspection via node confirmed: `magic: 'glTF'`, `version: 2`, `length: 90192408`, 1 mesh, 1 node, `animations: undefined`.
   - Accessor bounds: min `[-0.952, -0.828, -0.850]`, max `[0.950, 0.812, 0.849]`, maximum extent $\approx 1.902$.

2. **Heart Asset Forensic Data**:
   - `public/models/model-jantung.glb` is present in `public/models/` with size 18,141,244 bytes.
   - Git blob hash is `c6bbf0c256ba363fb93fd44d98019d57b34f6a42`.
   - Binary header inspection confirmed: `magic: 'glTF'`, `version: 2`, `length: 18141244`, `extensionsUsed: ['KHR_mesh_quantization', 'EXT_meshopt_compression']`, `extensionsRequired: ['KHR_mesh_quantization', 'EXT_meshopt_compression']`, `animations: undefined`.
   - Accessor bounds: min `[-0.2341, -0.4898, -0.3248]`, max `[0.2340, 0.4897, 0.3250]`, maximum extent $\approx 0.980$.

3. **Three.js & MeshoptDecoder Packages**:
   - `package.json` contains:
     - `"three": "^0.187.0"` (line 65)
     - `"meshoptimizer": "^1.3.0"` (line 54)
     - `"@types/three": "^0.187.0"` (line 72)
   - Running `node -e "const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js'); const { MeshoptDecoder } = require('meshoptimizer'); console.log(typeof GLTFLoader, MeshoptDecoder.supported);"` succeeded with output: `function true`.
   - Running `npm.cmd run typecheck` (`tsc --noEmit`) exited with code 0.

4. **Next.js Static Export & GitHub Pages Limits**:
   - `next.config.ts` line 4 specifies `output: 'export'`.
   - Inspection of `out/models/` showed `model-jantung.glb` (18.14 MB) and `model-quill.glb` (90.19 MB) residing directly in `out/models/`.
   - Both files are under GitHub's 100 MB hard file limit.
   - Neither model is bundled into JS chunks.

5. **Codebase Status for R1 & R2**:
   - `src/components/hero-3d-scene.tsx` currently contains procedural placeholders (`createTechPolyhedron`, `createMedicalDNA`, `createAcademicQuill`) and handles `onModelClick` (lines 340, 708-710, 721).
   - `src/components/hero.tsx` passes `onModelClick` to `Hero3DScene` (lines 301-303).
   - In `src/components/project-mode-icon.tsx`, `DiamondArtifactGlyph` shapes are already defined in `src/components/geometric-glyphs.tsx`.

---

## 2. Logic Chain

1. From Observation 1, `public/models/model-quill.glb` was merely deleted in the working directory while tracked in git at commit `f894fdf` (blob `7a4f4ed6c35c3ea36715e945571e7864a12abddb`), and an exact byte-for-byte copy exists in `out/models/model-quill.glb`. Therefore, restoring it via `git checkout f894fdf -- public/models/model-quill.glb` or copying from `out/models/` restores the authentic 86 MB asset instantly without downloading external files.
2. From Observation 2, `model-jantung.glb` strictly requires `EXT_meshopt_compression`. Without registering `MeshoptDecoder` on `GLTFLoader`, loading `model-jantung.glb` throws `THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`.
3. From Observation 3, both `three/examples/jsm/loaders/GLTFLoader.js` and `meshoptimizer` are installed and verified compatible. Awaiting `MeshoptDecoder.ready` before loading models guarantees that WebAssembly decoding is ready.
4. From Observation 1 and 2, neither GLB contains built-in animations (`animations: undefined`). Therefore, animations must be implemented procedurally in the Three.js render loop:
   - For Medical Heart: A 72 BPM ($f = 1.20\text{ Hz}$) dual-pulse Lub-Dub systole + late-diastolic atrial kick using superposed Gaussian impulse functions, combined with anatomical resting tilt ($\theta_z = -0.32\text{ rad}$, $\theta_x = 0.20\text{ rad}$) and hemodynamic point lighting.
   - For Academic Quill: Harmonic levitation ($Y = \sin(1.6t) \cdot 0.09$) combined with calligraphic resting stance ($\theta_{z, 0} = -0.28\text{ rad}$, $\theta_{x, 0} = 0.18\text{ rad}$) and Lissajous scribe wobble ($\Delta \theta_x = 0.035\cos(1.8t)$, $\Delta \theta_z = 0.040\sin(2.2t + 0.4)$).
5. From Observation 4, Next.js static export copies `public/models/` directly to `out/models/` during `npm run build`, and models are fetched via HTTP at runtime. Because both files are $< 100\text{ MB}$, this satisfies GitHub Pages constraints with zero impact on JS bundle chunks.
6. From Observation 5, removing `onModelClick` from `Hero3DSceneProps`, the pointer event handlers, and `hero.tsx` fully decouples the 3D scene from the project modal, satisfying R1.4.

---

## 3. Caveats

- **Network Speed on First Load**: While `model-jantung.glb` (18 MB) loads quickly, `model-quill.glb` is 86 MB. An in-memory cache (`modelSceneCache`) is necessary so each model is downloaded only once per browser session.
- **Procedural Fallback**: If network or browser memory issues interrupt downloading the 86 MB quill on low-end client devices, keeping the procedural quill as a fallback ensures the page never crashes or displays a blank canvas.
- **Mobile Viewport Optimization**: On mobile devices ($< 1024\text{ px}$), the desktop 3D scene is hidden in `hero.tsx` (`hidden lg:flex`). The canvas sizing is optimized for `lg` and `xl` viewports ($380\times 400$ to $400\times 420\text{ px}$) to keep the "Explore work" bar visible above the fold.

---

## 4. Conclusion

The technical strategy for Milestone 1 is completely validated and implementation-ready:
1. **Asset Restoration**: Restore `public/models/model-quill.glb` from git commit `f894fdf` (90,192,408 bytes). `model-jantung.glb` is validated and ready.
2. **Loader Configuration**: Use `GLTFLoader` with `MeshoptDecoder` registered after `MeshoptDecoder.ready` resolves, normalizing both models to `targetSize = 2.40`.
3. **Animations**: Apply physiological 72 BPM Lub-Dub formula for Heart and harmonic levitation + Lissajous scribe wobble for Quill.
4. **Modal Decoupling**: Completely purge `onModelClick` from the 3D scene and hero component.
5. **Detailed Plan**: Full step-by-step code instructions are provided in `.agents/teamwork/explorer_m1_g4_1/report.md`.

---

## 5. Verification Method

To independently verify the strategy and implementation:
1. **Asset Size & Hash Verification**:
   ```powershell
   node -e "const fs = require('fs'); const crypto = require('crypto');
   const check = (p, expectedSize) => {
     const buf = fs.readFileSync(p);
     console.log(p, 'Size:', buf.length, 'Expected:', expectedSize, 'Match:', buf.length === expectedSize);
   };
   check('public/models/model-jantung.glb', 18141244);
   check('public/models/model-quill.glb', 90192408);
   "
   ```
2. **Typecheck & Lint**:
   ```powershell
   npm.cmd run typecheck
   npm.cmd run lint
   ```
3. **Static Build & Output Check**:
   ```powershell
   npm.cmd run build
   node -e "const fs = require('fs');
   console.log('out/models/model-jantung.glb exists:', fs.existsSync('out/models/model-jantung.glb'));
   console.log('out/models/model-quill.glb exists:', fs.existsSync('out/models/model-quill.glb'));
   "
   ```
4. **Invalidation Conditions**:
   - If `model-quill.glb` does not equal 90,192,408 bytes or fails to parse in GLTFLoader.
   - If `MeshoptDecoder` is not attached to `GLTFLoader` before loading `model-jantung.glb`, causing an `EXT_meshopt_compression` decompression error.
   - If clicking the 3D model triggers `onModelClick` or opens the project modal.
