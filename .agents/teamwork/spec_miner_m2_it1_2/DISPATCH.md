# Dispatch to Spec Miner (Milestone 2 Iteration 1)

## Identity
- Archetype: teamwork_spec_miner
- Working Directory: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\

## Mission & Objective
Extract precise technical specifications and implementation blueprints for Three.js WebGL canvas integration in `src/components/hero-3d-scene.tsx`:
1. Three.js GLTFLoader setup with MeshoptDecoder: exactly how MeshoptDecoder is imported, instantiated, and wired to GLTFLoader in Three.js v0.170+ / Next.js static export.
2. WebGLRenderer configuration: alpha channel (transparent background to reveal hero background), antialias, pixelRatio clamping (`Math.min(window.devicePixelRatio, 2)`), tone mapping, outputColorSpace.
3. Lighting specifications:
   - Tech: crystal/polyhedron on pedestal with cyan/tech directional and ambient lighting.
   - Medical: `model-jantung.glb` with red/cardiac ambient and directional lighting, rhythmic pulse animation.
   - Academic: `model-quill.glb` with purple/gold ambient and directional lighting, floating quill animation.
4. Auto-centering & normalization: calculate bounding box (`Box3`), compute scale factor to normalize model dimensions to fit viewport regardless of raw asset coordinate scales, center origin at (0, 0, 0).
5. Lifecycle & Disposal protocol: dispose geometries, materials, textures, cancel `requestAnimationFrame`, handle canvas resize (`ResizeObserver`), and clean up WebGL renderer on component unmount or mode switch to prevent memory leaks and WebGL context loss.

## Scope Boundaries
- Read-only specification and requirement extraction. DO NOT modify source files.
- Deliver specifications in `handoff.md` within your working directory.

## Inputs to Read (MANDATORY)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (MUST read verbatim)
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md`
- `w:\home\krisnanda\Code\Project\Personal - github\portofolio\TEST_READY.md`
- `tests/e2e/tier1-feature-coverage.test.mjs` (inspect R2 tests)

## Output Requirements
Write `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\handoff.md` with:
- Specification Matrix (exact technical parameters for renderer, camera, lights, materials, animation loops)
- GLTF & Meshopt Decoder Pipeline contract
- Lifecycle & Memory Disposal Blueprint
- Verification Criteria for Reviewers & Challengers


When complete, send a message to orchestrator with your summary and report path.

## 2026-11-06T00:31:11Z
You are spec_miner_m2_it1_2.
Your working directory is: w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\
Read your dispatch instructions in:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\DISPATCH.md
MANDATORY: Read w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md.
Also read PROJECT.md, TEST_READY.md, and tests/e2e/tier1-feature-coverage.test.mjs.
Extract precise technical specifications and implementation blueprints for Three.js WebGL canvas integration in src/components/hero-3d-scene.tsx.
Write your complete report to:
w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\spec_miner_m2_it1_2\handoff.md
When finished, send a message to the orchestrator with your findings summary and handoff path.

