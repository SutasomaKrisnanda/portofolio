# Handoff Report — Explorer Survey 2: 3D Models & Dynamic Project Icons (R2 & R3)

**Agent**: teamwork_explorer 2 (`explorer_survey_2`)  
**Mission**: Technical Survey for Requirement R2 (3D Model Integration for Medical & Academic Modes) & Requirement R3 (Dynamic Project Logo Icons per Active Mode)  
**Parent Orchestrator ID**: `514f318a-382e-4a4c-bf5e-58e0d0eff1f1`  
**Date**: 2026-11-05  

---

## 1. Observation

1. **Hero 3D Stage**:
   - `src/components/hero.tsx` (lines 165–179): The center 3D column instantiates `<IridescentCrystalCanvas>` with props `mode`, `activeSlideIndex`, `baseHue`, `secondaryHue`, and `onCrystalClick`.
   - `src/components/crystal-canvas.tsx`: A pure HTML5 2D canvas that renders an 8-ring mathematical polyhedron using trigonometric projection (`perspective = 3.6 / (3.6 - z2 * 0.65)`). **No Three.js or WebGL is currently present in the codebase**.
   - `package.json`: Does NOT contain `three`, `@types/three`, `@react-three/fiber`, or `@react-three/drei`.

2. **3D Model Assets**:
   - `src/assets/models/model-jantung.glb`:
     - File size: 18,141,244 bytes (~18.14 MB).
     - glTF 2.0 Binary created with `gltfpack 1.2`.
     - 1 mesh, 1 PBR material (`tripo_material_...`), 3 embedded textures.
     - Dimensions: `0.468 x 0.980 x 0.650` (centered at origin).
     - **Required Extension**: `EXT_meshopt_compression` and `KHR_mesh_quantization`. Standard `GLTFLoader` throws `Unsupported extension EXT_meshopt_compression` unless `MeshoptDecoder` is attached.
   - `src/assets/models/model-quill.glb`:
     - File size: 90,192,408 bytes (~90.19 MB).
     - glTF 2.0 Binary created with `pygltflib@v1.16.5`.
     - 1 mesh, 1 PBR material (`doubleSided: true`), 3 embedded textures.
     - Dimensions: `1.902 x 1.640 x 1.699` (centered at origin).
     - No compression extension required.

3. **Project Logo Icon Assets**:
   - `src/assets/icons/project-tech.svg` (1,907,450 bytes).
   - `src/assets/icons/project-medical.svg` (1,841,689 bytes).
   - `src/assets/icons/project-academic.svg` (1,817,737 bytes).
   - All three are standalone SVG graphics with color matrices, clip paths, and high-res artwork mapped 1:1 to `ModeId` (`tech`, `medical`, `academic`).

4. **Current Project Icon Rendering**:
   - `src/components/hero.tsx` (line 207) and `src/components/projects.tsx` (line 156) render `<DiamondArtifactGlyph visualType={...} index={idx} />`.
   - `src/components/geometric-glyphs.tsx` (lines 58–117): `DiamondArtifactGlyph` outputs procedural geometric SVG polygons based solely on `index % 3`. It ignores active mode and project mode tags entirely.

5. **Project Dataset & Multi-Mode Structure**:
   - `src/data/projects.json`: Projects specify `mode` (e.g. `'tech'`) and optional `secondaryModes` (e.g. `["medical", "academic"]`).
   - Project HMSSO (`proj-hmsso`) has `mode: "tech"` and `secondaryModes: ["medical", "academic"]`.

6. **Next.js Static Export & Build Checks**:
   - `next.config.ts`: Configured with `output: 'export'`.
   - Webpack build failed on `readlink` at `src/app/favicon.ico` due to a Windows Node.js `fs.readlinkSync` issue on regular files returning `EISDIR`. Moving/copying `favicon.ico` to `public/favicon.ico` resolves this.

---

## 2. Logic Chain

1. **R2 3D Model Strategy**:
   - Since `crystal-canvas.tsx` is Canvas2D, rendering GLB models requires a WebGL engine.
   - Three.js (`three` and `@types/three`) is the industry standard and lightest approach. `@react-three/fiber` introduces heavy React 18/19 peer dependency risks with Next 15.5.
   - `model-jantung.glb` requires `EXT_meshopt_compression`. Three.js bundles `MeshoptDecoder` at `three/addons/libs/meshopt_decoder.module.js`. Calling `loader.setMeshoptDecoder(MeshoptDecoder)` satisfies the extension.
   - Because `output: 'export'` is active, client-side Three.js fetch requests must resolve to public paths (`/models/model-jantung.glb`, `/models/model-quill.glb`).
   - By creating a unified client-side 3D stage (`Hero3DStage` or enhanced `CrystalCanvas`), we can keep the signature mathematical polyhedron for Tech mode, and dynamically load the Heart model for Medical mode and the Quill model for Academic mode, complete with pointer drag rotation, scale normalization, theme-aligned lighting, and click-to-case-study callbacks.

2. **R3 Dynamic Project Icon Strategy**:
   - The current `DiamondArtifactGlyph` uses procedural shapes based on array index rather than mode assets.
   - `src/assets/icons/` provides 3 distinct SVGs corresponding to the 3 modes: `tech`, `medical`, and `academic`.
   - Requirement R3 explicitly mandates that multi-mode projects (e.g. HMSSO, Bunda Bahagia, Sintesis Senyawa) dynamically change their icon to match the **active mode** currently selected by the user.
   - Therefore, creating `<ProjectModeIcon mode={activeMode} />` and replacing `DiamondArtifactGlyph` in both `hero.tsx` and `projects.tsx` ensures every project card and hero slide dynamically updates its logo when `activeMode` changes.

---

## 3. Caveats

- **File size of `model-quill.glb`**: At ~90 MB, downloading this model over low-bandwidth connections can take several seconds. A responsive loading indicator/placeholder (animated glowing ring/wireframe) and in-memory scene caching must be implemented so the UI remains smooth.
- **Local Source Code Unmodified**: In accordance with the Explorer read-only mandate, no source files or dependencies were modified during this investigation.
- **Windows `favicon.ico` Build Blocker**: Discovered during testing that `node ./node_modules/next/dist/bin/next build` fails on Windows when `src/app/favicon.ico` is present due to `readlink` returning `EISDIR`. The implementer must move it to `public/favicon.ico` to pass `npm run build`.

---

## 4. Conclusion

1. **R2 Feasibility**: 100% feasible with `three` (`^0.170.0`) and `@types/three`. `GLTFLoader` + `MeshoptDecoder` will reliably render `model-jantung.glb` (Medical) and `model-quill.glb` (Academic), while Tech mode maintains the 3D crystal polyhedron.
2. **R3 Feasibility**: 100% feasible by replacing `DiamondArtifactGlyph` with a dedicated `ProjectModeIcon` component backed by `project-tech.svg`, `project-medical.svg`, and `project-academic.svg`, driven by `activeMode`.
3. **Full Technical Survey**: Complete findings, exact code snippets, bounds, materials, lighting formulas, and step-by-step implementation roadmap are documented in `survey_report.md`.

---

## 5. Verification Method

To independently verify these findings:
1. **Inspect GLB Model Headers & Extensions**:
   ```bash
   node -e "const fs = require('fs'); const buf = Buffer.alloc(2048); const fd = fs.openSync('src/assets/models/model-jantung.glb', 'r'); fs.readSync(fd, buf, 0, 2048, 0); console.log(buf.toString('utf8').slice(20, 500));"
   ```
   *Expected result*: Shows `KHR_mesh_quantization` and `EXT_meshopt_compression`.
2. **Inspect SVG Files in `src/assets/icons/`**:
   ```bash
   node -e "['project-tech.svg', 'project-medical.svg', 'project-academic.svg'].forEach(f => console.log(f, fs.existsSync('src/assets/icons/' + f)));"
   ```
   *Expected result*: All 3 files return `true`.
3. **Inspect Current Polyhedron in `src/components/crystal-canvas.tsx`**:
   Verify lines 49–57, 131–295 confirm Canvas2D rendering without Three.js.
4. **Inspect Current Glyph in `src/components/geometric-glyphs.tsx`**:
   Verify lines 58–117 confirm `index % 3` hardcoded rendering.
