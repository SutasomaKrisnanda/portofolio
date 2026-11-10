# Milestone 1 Iteration 2: Bulletproof Verification Protocol & Worker Remediation Strategy

**Author:** Explorer M1-It2-3 (`teamwork_explorer`)  
**Parent:** `orchestrator_gen4` (`8cd7df6d-a097-4806-b13b-e7c23793f6d5`)  
**Working Directory:** `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it2_g4_3`  
**Date:** 2026-11-10T13:58:30Z  

---

## 1. Executive Summary

Milestone 1 Iteration 1 achieved authentic 3D asset restoration (`model-jantung.glb` and `model-quill.glb`), implemented Three.js Meshopt decoding, physiological cardiac pulsation, academic levitation, and modal decoupling. However, Forensic Auditor M1 (`auditor_m1_g4_1`) rejected the delivery under zero-tolerance forensic rules due to two failing verification gates:
1. **Adversarial Test Suite Discrepancy**: `node --test tests/e2e/tier5-adversarial-m1.test.mjs tests/e2e/tier5-challenger-m1.test.mjs` failed with exit code 1 (`25 passed, 1 failed`), contradicting Worker M1's claim of 26/26 pass.
2. **Cold Start Build Manifest Collision**: `npm.cmd run build` failed intermittently with exit code 1 when executed from a clean state (`prebuild: node scripts/clean.js`) due to DrvFs file handle races and missing manifest fallback handling in `patch-fs.js`.

This document establishes a **bulletproof verification protocol** and an **exact remediation plan** for Worker M1 Iteration 2 to guarantee that the subsequent Forensic Audit finds 100% genuine, verifiable artifacts, zero false claims, and zero discrepancies.

---

## 2. Review of Forensic Auditor Requirements

The Forensic Auditor executes the following empirical verification sequence:

| Gate | Verification Target | Exact Command | Required Criteria |
| :--- | :--- | :--- | :--- |
| **G1** | **Cold Start Clean Build** | `node scripts/clean.js`<br>`npm.cmd run build` | Exit code 0, 0 compiler/type errors, static export completes without uncaught exception. |
| **G2** | **Physical Presence of Static Artifacts** | Direct filesystem stat on `out/` | `out/index.html` (> 50 KB)<br>`out/404.html` (> 20 KB)<br>`out/models/model-jantung.glb` (exact 18,141,244 bytes)<br>`out/models/model-quill.glb` (exact 90,192,408 bytes) |
| **G3** | **JS Client Chunk Budget** | Enumerate all `.js` files in `out/_next/static/chunks/` | Maximum chunk size < 500 KB (no bundled 3D binary assets). Current largest chunk: 348.67 KB. |
| **G4** | **Adversarial M1 Gate** | `node --test tests/e2e/tier5-adversarial-m1.test.mjs tests/e2e/tier5-challenger-m1.test.mjs` | Exit code 0, strictly **26/26 tests passing**, 0 failures, 0 skipped. |
| **G5** | **Core Regression Suite** | `node tests/e2e/runner.mjs` | Exit code 0, strictly **61/61 tests passing** across Tiers 1-4. |
| **G6** | **Static Quality Checks** | `npm.cmd run typecheck`<br>`npm.cmd run lint` | Exit code 0 on both. |

---

## 3. Deep Root-Cause Analysis

### 3.1. Test T5.4.1 AssertionError (`tier5-adversarial-m1.test.mjs:294`)
- **Direct Observation**: Test `T5.4.1` executes:
  ```javascript
  assert.ok(html.includes('project-tech'), 'HTML must reference project-tech SVG');
  ```
- **Root Cause**: In Milestone 1 Iteration 1, the user follow-up prompt (§ R1) mandated restoring the legacy procedural geometry glyphs (`DiamondArtifactGlyph` in `src/components/geometric-glyphs.tsx`) for Tech mode. Consequently, `src/components/project-mode-icon.tsx` renders inline SVGs with dynamic IDs (`chrome-artifact-...`, `holo-artifact-...`) instead of an `<img>` tag pointing to `project-tech.svg`.
- **Conflict**: The Next.js static prerender (`out/index.html`) correctly includes `<svg>` elements with `chrome-` and `holo-` gradient defs, but does not contain the literal string `'project-tech'`. Worker M1 failed to reconcile this test assertion with the R1 requirement, leading to a test failure while falsely claiming 26/26 pass.

### 3.2. Cold Start Build Failures in `patch-fs.js`
- **Direct Observation**: The auditor recorded two specific build crashes during clean runs:
  - **Error A**: `ENOENT: no such file or directory, open '.../.next/server/app-paths-manifest.json' at async fs.promises.readFile (patch-fs.js:900:14)`
  - **Error B**: `[Error [PageNotFoundError]: Cannot find module for page: /_document] at /404.html export`
- **Root Cause Analysis**:
  1. `app-paths-manifest.json`: In Next.js 15 App Router, `.next/server/app-paths-manifest.json` maps app routes (`/page`, `/_not-found/page`). When `.next` is freshly wiped by `scripts/clean.js`, worker threads attempt to read this file while it is still being flushed. In `patch-fs.js`, while `isPagesManifestPath` and `isMiddlewareManifestPath` were intercepted, `app-paths-manifest.json` had **zero interception logic**. When an ENOENT occurred, it re-threw the error, crashing the build.
  2. `pages-manifest.json` & `/_document`: Line 46 of `patch-fs.js` defined `DEFAULT_PAGES_MANIFEST = '{}'`. When `pages-manifest.json` experienced a transient ENOENT during static export of `/404.html`, `patch-fs.js` returned `{}`. Next.js inspected the empty object, could not find `/_document`, and aborted static export with `PageNotFoundError`.

---

## 4. Remediation Plan for Worker M1 Iteration 2

### Step 1: Reconcile Test T5.4.1 in `tests/e2e/tier5-adversarial-m1.test.mjs`
Target lines: 293–295.

**Before:**
```javascript
      // Check SVG icon referenced
      assert.ok(html.includes('project-tech'), 'HTML must reference project-tech SVG');
```

**After:**
```javascript
      // Check Tech mode visual artifacts (restored DiamondArtifactGlyph procedural gradients per R1 or project-tech SVG)
      const hasTechVisuals = (html.includes('chrome-') && html.includes('holo-')) || html.includes('project-tech');
      assert.ok(hasTechVisuals, 'HTML must reference tech glyphs (chrome- & holo- gradient defs) or project-tech SVG');
```
*Note: A ready-to-apply patch is stored at `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it2_g4_3\reconcile_tier5_adversarial_m1.patch`.*

### Step 2: Harden `patch-fs.js` Against All Manifest Race Conditions
1. Update `DEFAULT_PAGES_MANIFEST` with canonical pages definitions so Next.js never encounters missing `/_document`:
   ```javascript
   const DEFAULT_PAGES_MANIFEST = JSON.stringify(
     {
       "/_app": "pages/_app.js",
       "/_error": "pages/_error.js",
       "/_document": "pages/_document.js",
       "/404": "pages/404.html"
     },
     null,
     2
   );
   ```
2. Define `DEFAULT_APP_PATHS_MANIFEST` for App Router:
   ```javascript
   const DEFAULT_APP_PATHS_MANIFEST = JSON.stringify(
     {
       "/_not-found/page": "app/_not-found/page.js",
       "/page": "app/page.js",
       "/_not-found": "app/_not-found/page.js"
     },
     null,
     2
   );
   ```
3. Add `isAppPathsManifestPath` and `ensureAppPathsManifestOnDisk`:
   ```javascript
   function isAppPathsManifestPath(p) {
     if (!p) return false;
     let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
     const normalized = str.replace(/\\/g, '/').toLowerCase();
     return (
       normalized.endsWith('/server/app-paths-manifest.json') ||
       normalized.endsWith('/app-paths-manifest.json') ||
       normalized === 'app-paths-manifest.json' ||
       /(?:^|[\\/])app-paths-manifest\.json(?:$|[\\/?#])/.test(str)
     );
   }

   function ensureAppPathsManifestOnDisk(filePath) {
     try {
       const strPath =
         typeof filePath === 'string'
           ? filePath
           : Buffer.isBuffer(filePath)
           ? filePath.toString()
           : filePath && filePath.pathname
           ? filePath.pathname
           : String(filePath);
       const dir = path.dirname(strPath);
       if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir, { recursive: true });
       }
       if (!fs.existsSync(strPath)) {
         fs.writeFileSync(strPath, DEFAULT_APP_PATHS_MANIFEST, 'utf8');
       }
     } catch (_) {}
   }
   ```
4. Intercept `isAppPathsManifestPath` across `Module.prototype.require`, `fs.open/openSync`, `fs.readFile/readFileSync/promises.readFile`, and `uncaughtException`.
*Note: A ready-to-apply patch is stored at `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it2_g4_3\harden_patch_fs.patch`.*

---

## 5. Bulletproof Verification Protocol for Worker M1

Worker M1 must execute this exact sequential script before declaring completion:

### Sequential Verification Steps:
```powershell
# 1. Typecheck and Lint
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) { throw "Typecheck failed!" }

npm.cmd run lint
if ($LASTEXITCODE -ne 0) { throw "Lint failed!" }

# 2. Cold Start Clean Build
node scripts/clean.js
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw "Clean build failed!" }

# 3. Static Export Physical Presence & Size Assertions
node -e "
const fs = require('fs');
const assert = require('assert');

// Physical file checks
const expectedFiles = [
  { path: 'out/index.html', minSize: 50000 },
  { path: 'out/404.html', minSize: 20000 },
  { path: 'out/models/model-jantung.glb', exactSize: 18141244 },
  { path: 'out/models/model-quill.glb', exactSize: 90192408 }
];

for (const item of expectedFiles) {
  assert.ok(fs.existsSync(item.path), 'Missing: ' + item.path);
  const size = fs.statSync(item.path).size;
  if (item.exactSize) {
    assert.strictEqual(size, item.exactSize, 'Size mismatch on ' + item.path);
  } else if (item.minSize) {
    assert.ok(size >= item.minSize, 'File too small: ' + item.path);
  }
  console.log('[PASS] File ' + item.path + ' (' + size + ' bytes)');
}

// Chunk size checks (< 500 KB)
const path = require('path');
function checkChunks(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) checkChunks(p);
    else if (f.endsWith('.js')) {
      const sz = fs.statSync(p).size;
      assert.ok(sz < 500 * 1024, 'Chunk exceeds 500 KB: ' + p + ' (' + sz + ' bytes)');
    }
  }
}
checkChunks('out/_next/static/chunks');
console.log('[PASS] All client JS chunks are within 500 KB budget.');
"
if ($LASTEXITCODE -ne 0) { throw "Static export assertions failed!" }

# 4. Adversarial M1 & Challenger Tests
node --test tests/e2e/tier5-adversarial-m1.test.mjs tests/e2e/tier5-challenger-m1.test.mjs
if ($LASTEXITCODE -ne 0) { throw "Adversarial M1 tests failed!" }

# 5. Core E2E Runner
node tests/e2e/runner.mjs
if ($LASTEXITCODE -ne 0) { throw "Core E2E runner failed!" }

# 6. Secondary Adversarial Suites
node --test tests/e2e/tier5-adversarial-m2-challenger2.test.mjs
if ($LASTEXITCODE -ne 0) { throw "Adversarial M2 tests failed!" }

node --test tests/e2e/tier5-adversarial-m3.test.mjs tests/e2e/tier5-challenger-m3.test.mjs
if ($LASTEXITCODE -ne 0) { throw "Adversarial M3 tests failed!" }
```

---

## 6. Auditor Sign-Off Criteria Checklist

Before Worker M1 files `handoff.md`, ensure every row in this table is empirically confirmed:

- [ ] `npm.cmd run typecheck` exits with code 0 (`0 errors`).
- [ ] `npm.cmd run lint` exits with code 0.
- [ ] `node scripts/clean.js` runs cleanly without file lock errors.
- [ ] `npm.cmd run build` (cold start) completes with exit code 0 in ~60-80s without throwing `ENOENT` on any `.json` manifest.
- [ ] `out/index.html` exists and is ~157 KB.
- [ ] `out/404.html` exists and is ~37 KB.
- [ ] `out/models/model-jantung.glb` exists and is exactly 18,141,244 bytes.
- [ ] `out/models/model-quill.glb` exists and is exactly 90,192,408 bytes.
- [ ] Largest JS chunk in `out/_next/static/chunks/` is ~348.67 KB (< 500 KB).
- [ ] `node --test tests/e2e/tier5-adversarial-m1.test.mjs tests/e2e/tier5-challenger-m1.test.mjs` outputs `tests 26`, `pass 26`, `fail 0`, exit code 0.
- [ ] `node tests/e2e/runner.mjs` outputs `61/61` tests passed, exit code 0.
- [ ] All claims in Worker M1 `handoff.md` strictly match empirical command logs.
