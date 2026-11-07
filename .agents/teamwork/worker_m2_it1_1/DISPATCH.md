# Dispatch to Worker M2 (Milestone 2 Iteration 1)

## Identity
- Archetype: teamwork_worker
- Working Directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m2_it1_1\

## Mission & Objective
Implement Milestone 2: 3D WebGL Canvas & GLB Models Integration per R2.
Specifically:
1. **Dependency Installation**: Install `three` and `meshoptimizer` as dependencies, and `@types/three` as devDependency.
2. **Public Asset Mirroring**: Create `public/models/` and copy `src/assets/models/model-jantung.glb` and `src/assets/models/model-quill.glb` into `public/models/` using file copy (no symlinks).
3. **Build `src/components/hero-3d-scene.tsx`**:
   - WebGL capability detection (`isWebGLAvailable()`) with graceful fallback to 2D canvas if unavailable.
   - Three.js WebGLRenderer (`alpha: true`, `antialias: true`, clearColor `(0x000000, 0)`, `pixelRatio` clamped to `Math.min(devicePixelRatio || 1, 2)`).
   - Three.js `GLTFLoader` configured with `MeshoptDecoder` (ensuring `await MeshoptDecoder.ready` before decoding).
   - Dynamic mode dispatch:
     - `tech`: Procedural 3D polyhedron crystal with cyan/blue lighting.
     - `medical`: Load `/models/model-jantung.glb` via MeshoptDecoder, cardiac rose key light, clinical violet rim light, pulsating crimson point light, and procedural Lub-Dub heartbeat pulse (72 BPM).
     - `academic`: Load `/models/model-quill.glb`, warm gold candlelight key, regal purple rim, and procedural floating scribe levitation/tilt motion.
   - Bounding box normalization (`THREE.Box3`): center at (0,0,0) and scale to uniform `targetSize: 2.2` in a parent pivot group for wobble-free rotation.
   - Interactive mouse/touch drag rotation with damping and click discrimination (<5px) triggering `onModelClick?.()`.
   - Progressive loading badge (`Memuat Model 3D (${progress}%)`) and in-memory scene caching across mode switches.
   - WebGL context loss recovery (`webglcontextlost`, `webglcontextrestored`).
   - Clean lifecycle disposal (`geometry.dispose()`, `material.dispose()`, `renderer.dispose()`).
4. **Build `src/components/hero-3d-skeleton.tsx`**:
   - Polished loading skeleton with glowing concentric orbital rings and mode-themed ambient glow for smooth Next.js dynamic chunk loading.
5. **Update `src/components/hero.tsx`**:
   - Dynamically import `Hero3DScene` using `next/dynamic` with `{ ssr: false }` and `loading: () => <Hero3DSkeleton mode={activeMode} />`.
   - Replace `<IridescentCrystalCanvas ... />` with `<Hero3DScene ... />`.
   - Update caption text dynamically based on `activeMode`:
     - Tech: `"Interactive 3D Polyhedron • Drag to Rotate"`
     - Medical: `"Interactive 3D Heart • Drag to Rotate"`
     - Academic: `"Interactive 3D Quill • Drag to Rotate"`
   - Ensure `onModelClick={() => { if (currentHeroProject) onOpenProject(currentHeroProject); }}` is wired.
6. **Build & Test Verification**:
   - Run `node tests/e2e/runner.mjs` (must pass 78/78).
   - Run `npm.cmd run typecheck` (must pass 0 errors).
   - Run `npm.cmd run build` (must export clean to `out/` with `out/models/` populated).

## Write Ownership
You exclusively own:
- `package.json`
- `package-lock.json`
- `public/models/model-jantung.glb`
- `public/models/model-quill.glb`
- `src/components/hero-3d-scene.tsx`
- `src/components/hero-3d-skeleton.tsx`
- `src/components/hero.tsx`

## Mandatory Inputs to Read
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\handoff.md` (authoritative Three.js specs & code blueprints)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m2_it1_3\handoff.md` (static export, SSR prevention & loading skeleton blueprints)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m2_it1_1\handoff.md` (asset & canvas findings)

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output Requirements
Document all changes, build outputs, and test results in:
`w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m2_it1_1\handoff.md`
When complete, send a message to orchestrator with your summary and handoff path.

## 2026-11-06T00:48:09Z
You are worker_m2_it1_1.
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m2_it1_1\

Read your dispatch instructions in:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m2_it1_1\DISPATCH.md
MANDATORY: Read w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md.
Also read PROJECT.md, TEST_READY.md, and the three explorer handoff reports:
- w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\handoff.md
- w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m2_it1_3\handoff.md
- w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m2_it1_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 2: 3D WebGL Canvas & GLB Models Integration according to the specifications. Run all verifications (E2E runner, typecheck, build).
Write your complete handoff report to:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m2_it1_1\handoff.md
When finished, send a message to the orchestrator with your results summary and handoff path.
