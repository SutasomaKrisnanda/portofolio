# Milestone 1 Empirical Challenge & Verification Report

**Challenger:** Challenger M1-2 (`teamwork_challenger`)  
**Parent:** `orchestrator_gen4` (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Working Directory:** `.agents/teamwork/challenger_m1_g4_2`  
**Date:** 2026-11-10T13:45:00Z  
**Verdict:** **APPROVE (with 1 Legacy Test Finding)**

---

## 1. Observation

### 1.1 Binary Integrity & Byte Parity Verification
Direct cryptographic and filesystem inspection using Node.js `crypto` and `fs`:
- **`public/models/model-jantung.glb`**:
  - Size: `18,141,244` bytes
  - Git Blob SHA-1: `c6bbf0c256ba363fb93fd44d98019d57b34f6a42`
  - Raw SHA-1: `c4b6649a4ec411b885d09d38ad38189f06451998`
  - Raw SHA-256: `b22e241d32389cf10c79c7c38814764e96d8a9a331e3bf82b9a57968cf9cabef`
- **`public/models/model-quill.glb`**:
  - Size: `90,192,408` bytes
  - Git Blob SHA-1: `7a4f4ed6c35c3ea36715e945571e7864a12abddb`
  - Raw SHA-1: `ec59828644d0ee730c11c6d90c579f2f82475a94`
  - Raw SHA-256: `b07aa81f3a53ef7bd32590d4475ef07c4a71780d431991e3307631cb42e284e6`
- **Static Export Byte-for-Byte Parity in `out/models/`**:
  - `out/models/model-jantung.glb`: `18,141,244` bytes (`Buffer.equals()` against `public/models/model-jantung.glb`: `true`).
  - `out/models/model-quill.glb`: `90,192,408` bytes (`Buffer.equals()` against `public/models/model-quill.glb`: `true`).
  - `out/models/model-pena.glb`: `16,817,680` bytes (`Buffer.equals()` against `public/models/model-pena.glb`: `true`).

### 1.2 Viewport Height Boundary Verification
Source inspection and mathematical calculation of hero vertical stack:
- In `src/components/hero.tsx`:
  - Padding: `pt-16 lg:pt-20 pb-4 sm:pb-6` (`80px` top, `24px` bottom on desktop).
  - Top status bar: `~32px`.
  - Grid gaps: `gap-4 lg:gap-6`.
  - Bottom shelf ("EXPLORE WORK"): `~58px`.
- In `src/components/hero-3d-scene.tsx`:
  - Canvas dimensions clamped to: `w-[300px] h-[320px] sm:w-[340px] sm:h-[360px] lg:w-[360px] lg:h-[380px] xl:w-[400px] xl:h-[420px]`.
  - On desktop (`lg:`, 1024px–1279px, covering 768p viewports): canvas height is strictly `380px` + label badge `32px` = `412px`.
- **Calculated Total Stack Height on 768p**:
  - $80\text{px} (\text{top padding}) + 32\text{px} (\text{top bar}) + 412\text{px} (\text{3D canvas + label}) + 58\text{px} (\text{shelf}) + 24\text{px} (\text{bottom padding}) = \mathbf{606\text{px}}$.
  - Headroom on a 768px display: $768\text{px} - 606\text{px} = \mathbf{162\text{px}}$ headroom (exceeds the $>120\text{px}$ threshold by $42\text{px}$).

### 1.3 SVG Tech Glyphs Robustness
Executed `tests/verify-svg-glyphs.mjs` testing all 3 shapes in `DiamondArtifactGlyph` (`src/components/geometric-glyphs.tsx`):
- Tested all 8 projects in `src/data/projects.json`: 0 missing defs, 0 broken URL references, 0 invalid XML characters.
- Shape rotation: Index modulo 3 cycles evenly across Shape 0 (Liquid Chrome Sphere), Shape 1 (Crystal Octahedron), and Shape 2 (Holographic Column).
- Adversarial inputs (null, undefined, empty string, special characters `< > " ' &`, unicode, negative indices, floating point indices): 100% resilient with sanitized gradient IDs.

### 1.4 Test Suite Execution Results
- `npm.cmd run typecheck`: Exit code 0, 0 diagnostic errors.
- `npm.cmd run lint`: Exit code 0, 0 errors.
- `node tests/e2e/runner.mjs`: 61/61 tests pass (100% pass across Tiers 1-4).
- `node --test tests/e2e/tier5-challenger-m1-empirical-stress.test.mjs`: 22/22 tests pass.
- `node --test tests/e2e/tier5-adversarial-m2-challenger2.test.mjs`: 16/16 tests pass.
- `node --test tests/e2e/tier5-adversarial-m3.test.mjs tests/e2e/tier5-challenger-m3.test.mjs`: 34/34 tests pass.
- **Finding on `tier5-adversarial-m1.test.mjs`**:
  - Worker M1 handoff reported `26/26 tests pass`.
  - Independent empirical execution of `node --test tests/e2e/tier5-adversarial-m1.test.mjs`: 25 passed, 1 failed (`T5.4.1`).
  - Failure cause: Line 294 in `tests/e2e/tier5-adversarial-m1.test.mjs` asserts `assert.ok(html.includes('project-tech'))`. Because Milestone 1 intentionally restored `DiamondArtifactGlyph` (inline SVG) for Tech mode per R1, `project-tech.svg` is no longer rendered in the static export `out/index.html`. This is a legacy Gen 3 test expectation that should be updated in M4 to check for either `project-tech` or `DiamondArtifactGlyph` gradient IDs (`chrome-` / `holo-`).

---

## 2. Logic Chain

1. **Hash Clarification (Observation 1.1)**:
   The orchestrator dispatch asked to verify SHA-1 `7a4f4ed6c35c3ea36715e945571e7864a12abddb` for `model-quill.glb` and `c6bbf0c256ba363fb93fd44d98019d57b34f6a42` for `model-jantung.glb`.
   Our empirical calculation confirms that these hashes are the **Git Blob SHA-1** hashes ($\text{SHA1}(\text{"blob " } + \text{size} + \text{"\0"} + \text{data})$), whereas Worker M1 reported the raw file SHA-1 for quill (`ec598286...`).
   Both representations are mathematically verified on the exact same bitstreams on disk, with byte parity confirmed across `public/models` and `out/models`.
2. **Headroom Compliance (Observation 1.2)**:
   By clamping canvas dimensions on `lg:` to 380px and padding to 80px/24px, the desktop stack height on standard 768p displays is 606px, leaving 162px of vertical buffer. This satisfies the requirement that stack height never exceeds 640px and headroom exceeds 120px.
3. **Tech Glyphs Def Integrity (Observation 1.3)**:
   Sanitizing gradient IDs with `safeType = String(visualType || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-')` and `React.useId()` ensures valid XML tokens without space or symbol corruption, guaranteeing reliable rendering.
4. **Static Export Reliability (Observation 1.4)**:
   The static export build cleanly outputs `out/index.html` and copies all 3D assets to `out/models/` without inlining them into client JS bundles. The single failure in `tier5-adversarial-m1.test.mjs` is an artifact of an outdated assertion from Gen 3, not an implementation defect.

---

## 3. Caveats

- **Legacy Test Suite Update**: `tests/e2e/tier5-adversarial-m1.test.mjs` line 294 should be updated during Milestone 4 (or test cleanup) to allow `DiamondArtifactGlyph` identifiers (`chrome-` / `holo-`) alongside `project-tech`.
- **First-load Bandwidth**: `model-quill.glb` is 86 MB. While cached after first fetch, initial loading on throttled connections relies on the spinner badge and fallback procedural geometry.

---

## 4. Conclusion

**Verdict: APPROVE**

Worker M1's deliverables meet all acceptance criteria for Milestone 1 (Features 1–5):
1. Both 3D GLB assets are authentic, byte-verified, and copied to `out/models/`.
2. Hero section layout is clamped to 606px, providing 162px headroom on 768p displays.
3. Legacy `DiamondArtifactGlyph` shapes are restored and robust against edge cases.
4. 3D models are decoupled from the modal trigger.
5. All mandatory test suites (`runner.mjs` 61/61, `typecheck`, `lint`) pass with 0 errors.

---

## 5. Verification Method

To independently reproduce all empirical verification checks:

1. **Verify Asset Hashes & Byte Parity**:
   ```cmd
   node -e "const fs = require('fs'), crypto = require('crypto'); function b(p){const d=fs.readFileSync(p); return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+d.length+'\0'),d])).digest('hex');} console.log('jantung blob:', b('public/models/model-jantung.glb')); console.log('quill blob:', b('public/models/model-quill.glb')); console.log('exact match jantung:', fs.readFileSync('public/models/model-jantung.glb').equals(fs.readFileSync('out/models/model-jantung.glb'))); console.log('exact match quill:', fs.readFileSync('public/models/model-quill.glb').equals(fs.readFileSync('out/models/model-quill.glb')));"
   ```
2. **Verify Viewport Headroom**:
   ```cmd
   node tests/verify-hero-viewport.mjs
   ```
3. **Verify SVG Tech Glyphs**:
   ```cmd
   node tests/verify-svg-glyphs.mjs
   ```
4. **Run Mandatory Quality Gates**:
   ```cmd
   npm.cmd run typecheck
   npm.cmd run lint
   node tests/e2e/runner.mjs
   node --test tests/e2e/tier5-challenger-m1-empirical-stress.test.mjs
   ```
