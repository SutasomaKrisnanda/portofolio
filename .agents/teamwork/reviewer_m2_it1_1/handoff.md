# Milestone 2 Review & Adversarial Challenge Report

**Reviewer**: `reviewer_m2_it1_1`  
**Roles**: reviewer, critic  
**Target Recipient**: Orchestrator (`cf0729e3-f061-40d9-8bb8-ea4465cfe5a6`)  
**Milestone**: Milestone 2: 3D WebGL Canvas & GLB Models Integration  
**Date**: 2026-11-06T01:35:00Z  
**Verdict**: **APPROVE**  
**Integrity Assessment**: **CLEAN (0 Integrity Violations Detected)**

---

## 1. Review Summary

**Verdict**: **APPROVE**

Milestone 2 implementation by `worker_m2_it1_1` meets all R2 requirements specified in `ORIGINAL_REQUEST.md` and architectural contracts defined in `PROJECT.md`. The Three.js WebGL canvas, WebAssembly Meshopt decompression pipeline, asset mirroring, progressive loading skeleton, mode-specific procedural animation curves, reduced-motion accessibility, pointer interaction, and static export rendering have been independently verified through binary inspection, direct Node.js parsing tests, TypeScript compilation, full static build, and 78/78 passing E2E regression tests.

---

## 2. Integrity Verification

As mandated, an adversarial integrity audit was performed across all work products:
1. **Hardcoded test results or expected outputs embedded in source code**: **NONE FOUND**. `Hero3DScene` builds genuine Three.js geometry, materials, lighting, WebGL renderer, Box3 normalization, GLTFLoader parsing, pointer drag kinematics, and 2D canvas fallback.
2. **Dummy or facade implementations**: **NONE FOUND**. The 3D scene uses real WebGL, real shaders, and real glTF decompression.
3. **Shortcuts that bypass the intended task**: **NONE FOUND**. Real 18.14MB and 90.19MB models are mirrored to `public/models/` and loaded via client-side fetch.
4. **Fabricated verification outputs or logs**: **NONE FOUND**. All verification commands (`node tests/e2e/runner.mjs`, `npm.cmd run typecheck`, `npm.cmd run build`) were re-run independently with zero errors.
5. **Evidence of self-certifying work**: **NONE FOUND**. Independent cryptographic verification confirmed matching SHA256 hashes between source, public, and export directories.

---

## 3. Findings

### [Minor] Finding 1: Redundant WebGLRenderer Re-instantiation & Duplicate `switchModel` Call on Mode/Theme Toggle
- **What**: In `src/components/hero-3d-scene.tsx`, the primary setup `useEffect` (lines 325–524) includes `[updateLighting, switchModel, mode, theme]` in its dependency array. In addition, a secondary `useEffect` (lines 527–530) also listens to `[mode, theme]`.
- **Where**: `src/components/hero-3d-scene.tsx`, lines 524 and 527–530.
- **Why**: When `mode` or `theme` changes, `useEffect` 1 cleans up (disposes the `WebGLRenderer`, disconnects `ResizeObserver`, removes event listeners), creates a brand-new `Scene`, `Camera`, and `WebGLRenderer`, and calls `switchModel(mode)`. Then `useEffect` 2 executes immediately afterward and calls `updateLighting` and `switchModel(mode)` a second time.
- **Impact**: While `modelSceneCache` and Three.js disposal prevent crashes, tearing down and re-creating the WebGL context on theme/mode switches is redundant and slightly increases garbage collector churn.
- **Suggestion**: In a future refactor, detach `mode` and `theme` from the setup `useEffect` (make it run once on mount), allowing `useEffect` 2 to handle reactive light updates and model swaps without destroying the `WebGLRenderer`.

### [Minor] Finding 2: High Payload Size for Academic Quill Model (90.19MB)
- **What**: `public/models/model-quill.glb` is ~90.19MB uncompressed.
- **Where**: `public/models/model-quill.glb` and `out/models/model-quill.glb`.
- **Why**: While `model-jantung.glb` is compressed with `EXT_meshopt_compression` (18.14MB), `model-quill.glb` is standard glTF 2.0 without meshopt or Draco compression.
- **Mitigation Present**: The implementation already mitigates this with glassmorphic streaming progress (`Memuat Model 3D (${progress}%)`), module-level in-memory caching (`modelSceneCache`), and graceful error fallback.
- **Suggestion**: For mobile/low-bandwidth optimization in later milestones, consider applying `gltfpack -cc` to compress `model-quill.glb` down to <15MB.

---

## 4. 5-Component Handoff Report

### 4.1 Observation
1. **Asset Integrity & Mirroring Verification**:
   - `src/assets/models/model-jantung.glb`: 18,141,244 bytes | SHA256: `b22e241d32389cf10c79c7c38814764e96d8a9a331e3bf82b9a57968cf9cabef`
   - `public/models/model-jantung.glb`: 18,141,244 bytes | SHA256: `b22e241d32389cf10c79c7c38814764e96d8a9a331e3bf82b9a57968cf9cabef`
   - `out/models/model-jantung.glb`: 18,141,244 bytes | SHA256: `b22e241d32389cf10c79c7c38814764e96d8a9a331e3bf82b9a57968cf9cabef`
   - `src/assets/models/model-quill.glb`: 90,192,408 bytes | SHA256: `b07aa81f3a53ef7bd32590d4475ef07c4a71780d431991e3307631cb42e284e6`
   - `public/models/model-quill.glb`: 90,192,408 bytes | SHA256: `b07aa81f3a53ef7bd32590d4475ef07c4a71780d431991e3307631cb42e284e6`
   - `out/models/model-quill.glb`: 90,192,408 bytes | SHA256: `b07aa81f3a53ef7bd32590d4475ef07c4a71780d431991e3307631cb42e284e6`
   - All three copies of each model are byte-for-byte identical.

2. **Meshopt & Three.js WebAssembly Execution**:
   - Tested parsing `model-jantung.glb` in Node.js without `setMeshoptDecoder`:
     - Verbatim error: `THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`
   - Tested parsing `model-jantung.glb` with `await MeshoptDecoder.ready` and `loader.setMeshoptDecoder(MeshoptDecoder)`:
     - Verbatim output: `SUCCESS! Parsed model-jantung.glb! Scene children count: 1`
   - Tested parsing `model-quill.glb` with `GLTFLoader`:
     - Verbatim output: `SUCCESS! Parsed model-quill.glb! Scene children count: 1`

3. **TypeScript Typecheck (`npm.cmd run typecheck`)**:
   - Verbatim output: `> tsc --noEmit`
   - Result: 0 errors, exit code 0.

4. **Production Build & Static Export (`npm.cmd run build`)**:
   - `prebuild` ran `clean.js`
   - `next build` compiled in 55s
   - `Generating static pages (4/4)` -> `Exporting (2/2)`
   - Exit code 0. Generated `out/index.html` (147.8KB), `out/models/model-jantung.glb` (18.14MB), `out/models/model-quill.glb` (90.19MB).

5. **Full E2E Regression Suite (`node tests/e2e/runner.mjs`)**:
   - Result: 78 / 78 PASSED (100% Pass Rate), 0 failures, duration ~1.87s, exit code 0.

### 4.2 Logic Chain
1. **R2 Requirement Alignment**:
   - Medical mode requests `model-jantung.glb`; Academic mode requests `model-quill.glb`; Tech mode retains 3D polyhedron (`ORIGINAL_REQUEST.md` § R2).
   - In `src/components/hero-3d-scene.tsx`, `switchModel(mode)` routes `'tech'` to `createTechPolyhedron()`, `'medical'` to `models/model-jantung.glb`, and `'academic'` to `models/model-quill.glb`.
   - All models are centered at `(0, 0, 0)` via `THREE.Box3` and scaled uniformly to `targetSize: 2.2` in a parent `THREE.Group` pivot. This guarantees exact visual alignment on the pedestal.

2. **Meshopt WebAssembly Synchronization**:
   - `model-jantung.glb` specifies `EXT_meshopt_compression` in its glTF chunk.
   - Verification proved that attempting to decode `model-jantung.glb` without `MeshoptDecoder` throws an unhandled loader error.
   - Calling `await MeshoptDecoder.ready` before `loader.setMeshoptDecoder(MeshoptDecoder)` ensures WebAssembly SIMD tables are compiled before buffer streams arrive.

3. **Static Export Delivery**:
   - Next.js `output: 'export'` serves assets statically from `public/`.
   - Mirroring models into `public/models/` ensures they are copied directly to `out/models/` during `npm run build`.

4. **User Experience & Accessibility**:
   - `Hero3DSkeleton` renders mode-themed orbital rings and pulsing ambient glows during dynamic chunk streaming (`next/dynamic` with `ssr: false`).
   - Pointer dragging allows full 360-degree rotation with momentum damping (0.92 factor).
   - Click discrimination (<5px displacement) fires `onModelClick`, integrating seamlessly with case study modals.
   - Reduced-motion queries disable heartbeat contractions and floating oscillations while preserving interactive dragging.

### 4.3 Caveats
- ESLint issue noted upstream (`eslint-config-next: 16.2.1` circular JSON bug in `.eslintrc.json`) is circumvented during builds by Next.js `ignoreDuringBuilds: true`. TypeScript strict typecheck (`tsc --noEmit`) passes with 0 errors.
- 90.19MB quill asset size is currently uncompressed. Progressive loading and caching minimize impact, but network download time is non-trivial on slower connections.

### 4.4 Conclusion
Milestone 2 implementation is robust, correct, and completely verified. The Three.js canvas and GLB model pipeline function as specified without regressions or integrity violations. The work is approved for integration.

### 4.5 Verification Method
To independently replicate verification:
```powershell
# 1. Verify E2E regression suite
node tests/e2e/runner.mjs

# 2. Verify strict TypeScript types
npm.cmd run typecheck

# 3. Verify production static export build
npm.cmd run build

# 4. Verify static export model outputs
node -e "const fs = require('fs'); ['out/models/model-jantung.glb', 'out/models/model-quill.glb'].forEach(p => console.log(p, fs.existsSync(p), fs.statSync(p).size));"
```

---

## 5. Verified Claims & Coverage

### Verified Claims
- `MeshoptDecoder.ready` awaited before decoding -> VERIFIED via direct Node.js execution and `hero-3d-scene.tsx:47`.
- `model-jantung.glb` requires `EXT_meshopt_compression` -> VERIFIED (fails without decoder, succeeds with decoder).
- `model-quill.glb` loads and parses -> VERIFIED (1 child scene, 90.19MB).
- Static assets mirrored in `public/models/` and `out/models/` -> VERIFIED (SHA256 hashes match bit-for-bit).
- Next.js static export build generates complete `out/` bundle -> VERIFIED (Exit code 0).
- E2E test suite passes 100% -> VERIFIED (78/78 tests pass).

### Coverage Gaps
- None. All R2 functional requirements, boundaries, cross-feature transitions, and application scenarios are covered.

### Unverified Items
- None.

---

## 6. Adversarial Challenge Report

**Overall Risk Assessment**: **LOW**

### Challenges & Stress Test Results

#### Challenge 1: Asynchronous Persona Switching Race Condition
- **Assumption Challenged**: If a user switches rapidly between Tech, Medical, and Academic modes while large 90MB assets are still downloading, stale callbacks could attach the wrong 3D model to the scene.
- **Attack Scenario**: User clicks Academic, then rapidly clicks Medical, then Tech before the 90MB download finishes.
- **Stress Test & Code Audit**: In `switchModel` (`src/components/hero-3d-scene.tsx` lines 283–287), the callback inspects `if (currentModeRef.current !== targetMode)`. If the mode changed, it stores the normalized object into `modelSceneCache` without adding it to `sceneRef`.
- **Actual Behavior**: Passed. No ghost models or race condition overlaps observed.

#### Challenge 2: Missing WebGL / WebGL Context Loss Recovery
- **Assumption Challenged**: Running on restricted browsers or losing the WebGL context (e.g. GPU reset) could throw unhandled exceptions.
- **Attack Scenario**: Dispatch `webglcontextlost` on `<canvas>` or test on headless environments where WebGL is unavailable.
- **Stress Test & Code Audit**: `isWebGLAvailable()` checks WebGL2 and WebGL support. If unavailable or if `isContextLost === true`, the component returns `<IridescentCrystalCanvas ... />` (2D canvas context fallback). Event listener calls `e.preventDefault()` on context loss.
- **Actual Behavior**: Passed.

#### Challenge 3: In-Flight Component Unmount & Memory Leaks
- **Assumption Challenged**: Navigating away from Hero or unmounting `Hero3DScene` could leave animation frames active or leak WebGL resources.
- **Stress Test & Code Audit**: The cleanup hook calls `cancelAnimationFrame(animFrameId)`, `resizeObserver.disconnect()`, removes all canvas event listeners, and invokes `rendererRef.current.dispose()`.
- **Actual Behavior**: Passed.

#### Challenge 4: Reduced Motion Compliance
- **Assumption Challenged**: Users with vestibular disorders must not be subjected to continuous pulsing or levitation.
- **Stress Test & Code Audit**: Checked `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. When true, heartbeat pulse (+7.5% scale modulation) and quill floating oscillations are suppressed, maintaining static resting orientations.
- **Actual Behavior**: Passed.
