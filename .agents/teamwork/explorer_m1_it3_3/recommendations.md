# Recommendation Report: Static Export & Test Suite Verification Architecture

- **Author**: `teamwork_explorer_3` (Milestone 1 Iteration 3: Static Export & Test Suite Verification Architect)
- **Target Subsystems**: Next.js Static Export Pipeline, npm Build Lifecycle, E2E Test Suite (`tests/e2e/runner.mjs`), Tier 5 Adversarial Test Suite (`tests/e2e/tier5-adversarial-m1.test.mjs`), Asset Emission Verification
- **Date**: 2026-11-05
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_3\`
- **Recipient**: Parent Orchestrator (`514f318a-382e-4a4c-bf5e-58e0d0eff1f1`), Worker M1 Iteration 3, Reviewers, and Challengers

---

## 1. Executive Summary

Milestone 1 Iteration 2 achieved 100% test pass rates on source unit/integration tests (78/78 in `tests/e2e/runner.mjs`), but the milestone was rejected by Reviewer 2 (`reviewer_m1_it2_2`) and Challenger 2 (`challenger_m1_it2_2`) due to a fatal static export build crash:

```text
[Error: ENOENT: no such file or directory, rename '.../.next/export/500.html' -> '.../.next/server/pages/500.html']
```

This error occurred because Next.js App Router with `output: 'export'` unconditionally executes `moveExportedPage('/_error', '/500', '/500', false, 'html')` at `node_modules/next/dist/build/index.js:2182`, attempting to rename a non-existent `500.html` export file. Because `patch-fs.js` did not intercept `fs.promises.rename`, the unhandled `ENOENT` terminated the process with Exit Code 1. Compounding this, `package.json` had a double-clean script (`"prebuild": "node scripts/clean.js"` and `"build": "node scripts/clean.js && ..."`), causing transient lock collisions on Windows DrvFs/NTFS. As a result, the `out/` directory was wiped by the clean script and never re-generated, leading to 2 test failures in the Tier 5 adversarial suite (`tier5-adversarial-m1.test.mjs`).

This report provides the **end-to-end verification architecture and protocol** for Milestone 1 Iteration 3. It details:
1. Exact criteria and filesystem assertions to verify that `out/index.html` (with all 6 AVIF backgrounds and 3 SVG icons) and `out/404.html` are correctly emitted on a fresh clean build.
2. Complete test execution steps ensuring `node tests/e2e/runner.mjs` (78/78) and `node --test tests/e2e/tier5-adversarial-m1.test.mjs` (12/12) pass without exception.
3. A systematic, step-by-step verification checklist and ready-to-run PowerShell / Node.js commands for the Worker, Reviewers, and Challengers.

---

## 2. Technical Context & Subsystem Interdependencies

### 2.1 The Static Export Pipeline Dynamics

```
npm run build
  │
  ├─► prebuild lifecycle hook
  │     └─► node scripts/clean.js
  │           ├─ Purges .next/
  │           └─ Purges out/
  │
  └─► build script
        └─► node -r ./patch-fs.js node_modules/next/dist/bin/next build
              ├─ Loads patch-fs.js into main process & worker threads
              ├─ Compiles TypeScript & React App Router pages
              ├─ Emits static pages:
              │    ├─ /           ──► out/index.html (with AVIF backgrounds & SVG icons)
              │    └─ /_not-found ──► out/404.html
              ├─ Next.js build:2182 attempts moveExportedPage('/_error', '/500', ...)
              │    └─ fs.promises.rename('.../.next/export/500.html', '...')
              │         └─► Trapped by patch-fs.js: ENOENT swallowed safely
              └─ Static export finalized into out/ directory
```

### 2.2 Critical Invariants to Verify

1. **Clean Slate Guarantee**: `npm run clean` must completely remove `.next/` and `out/` without lingering process locks or throwing EPERM.
2. **Single Clean Execution**: `npm run build` must run `scripts/clean.js` **exactly once** (via `prebuild`), never running back-to-back deletions.
3. **500 Rename Non-Fatal Trapping**: Any call to `fs.promises.rename`, `fs.renameSync`, or `fs.rename` targeting `500.html` that throws `ENOENT` must be safely swallowed as a no-op, while legitimate filesystem errors on other files must continue throwing normally.
4. **Static Export Completeness**:
   - `out/index.html` must be generated, size >= 100 KB, with all 6 AVIF images and 3 SVG icons referenced.
   - `out/404.html` must be generated, size >= 10 KB, with home (`/`), project (`/#projects`), and mode (`/?mode=tech|medical|academic`) navigation links.
   - `out/_next/static/media/` must contain all 6 `.avif` background files and 3 `.svg` icon files physically present with non-zero sizes.
   - `out/favicon.ico` must exist with valid ICO headers.
5. **Idempotent Build**: Consecutive executions of `npm run build` must both exit with code 0.
6. **100% Test Pass Guarantee**:
   - `node tests/e2e/runner.mjs` -> 78 / 78 passed across Tiers 1–4.
   - `node --test tests/e2e/tier5-adversarial-m1.test.mjs` -> 12 / 12 passed.
   - `npm run typecheck` (`tsc --noEmit`) -> Exit code 0, 0 compiler errors.

---

## 3. Comprehensive Verification Protocol

### Stage 1: Pre-Execution Code & Configuration Verification

Before running build commands, verify the code edits in `patch-fs.js` and `package.json`:

#### 1.1 Verify `package.json` Script Deduplication
- **File**: `package.json`
- **Verification Command**:
  ```powershell
  node -e "const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); console.assert(pkg.scripts.clean === 'node scripts/clean.js'); console.assert(pkg.scripts.prebuild === 'node scripts/clean.js'); console.assert(pkg.scripts.build === 'node -r ./patch-fs.js node_modules/next/dist/bin/next build'); console.log('package.json scripts verified OK');"
  ```
- **Success Criteria**:
  - `pkg.scripts.clean` === `"node scripts/clean.js"`
  - `pkg.scripts.prebuild` === `"node scripts/clean.js"`
  - `pkg.scripts.build` === `"node -r ./patch-fs.js node_modules/next/dist/bin/next build"` (No redundant `node scripts/clean.js &&`).

#### 1.2 Verify `patch-fs.js` Interceptor Implementation
- **File**: `patch-fs.js`
- **Verification Command**:
  ```powershell
  node -e "
  const fs = require('fs');
  require('./patch-fs.js');
  (async () => {
    // 1. Verify fs.promises.rename swallows missing 500.html
    try {
      await fs.promises.rename('nonexistent/.next/export/500.html', 'nonexistent/.next/server/pages/500.html');
      console.log('✓ fs.promises.rename 500.html swallow verified');
    } catch (e) {
      console.error('FAIL: fs.promises.rename threw', e);
      process.exit(1);
    }

    // 2. Verify fs.renameSync swallows missing 500.html
    try {
      fs.renameSync('nonexistent/.next/export/500.html', 'nonexistent/.next/server/pages/500.html');
      console.log('✓ fs.renameSync 500.html swallow verified');
    } catch (e) {
      console.error('FAIL: fs.renameSync threw', e);
      process.exit(1);
    }

    // 3. Verify fs.rename callback swallows missing 500.html
    await new Promise((resolve, reject) => {
      fs.rename('nonexistent/.next/export/500.html', 'nonexistent/.next/server/pages/500.html', (err) => {
        if (err) return reject(err);
        console.log('✓ fs.rename callback 500.html swallow verified');
        resolve();
      });
    });

    // 4. Verify legitimate ENOENT still throws for other files
    try {
      await fs.promises.rename('nonexistent/essential-manifest.json', 'nonexistent/dest.json');
      console.error('FAIL: non-500 file should have thrown ENOENT');
      process.exit(1);
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log('✓ Normal ENOENT propagation verified for other files');
      } else {
        console.error('FAIL: unexpected error code', e);
        process.exit(1);
      }
    }
  })();
  "
  ```
- **Success Criteria**:
  - All three rename flavors (`promises.rename`, `renameSync`, `rename`) safely resolve on missing `500.html`.
  - Legitimate `ENOENT` for other files continues to throw normally.

---

### Stage 2: Clean Build Execution & Process Lifecycle Verification

#### 2.1 Standalone Clean Execution
- **Command**:
  ```powershell
  npm.cmd run clean
  ```
- **Assertions**:
  - Exit code: 0
  - `Test-Path .next` -> `False`
  - `Test-Path out` -> `False`
  - Output shows clean confirmation: `[clean] Cleanup complete. Workspace ready for build.`

#### 2.2 Fresh Clean Production Build
- **Command**:
  ```powershell
  npm.cmd run build
  ```
- **Assertions**:
  - Exit code: 0
  - Lifecycle output contains `> nextn@0.1.0 prebuild` running `scripts/clean.js` **exactly once**.
  - No second clean execution message under `> nextn@0.1.0 build`.
  - Next.js compilation completes without error:
    ```text
    ✓ Compiled successfully
    Linting and checking validity of types ...
    Collecting page data ...
    Generating static pages (4/4)
    Finalizing page optimization ...
    Collecting build traces ...
    Exporting (2/2)
    ```
  - Zero unhandled `ENOENT` or `rename` errors.
  - Zero DrvFs `.next/trace` EPERM/EBUSY errors.

#### 2.3 Build Idempotency & Re-run Verification
- **Command**:
  ```powershell
  npm.cmd run build
  ```
- **Assertions**:
  - Exit code: 0
  - Cleanly executes without crashing on lingering cache entries or existing directories.

---

### Stage 3: Static Export Output Filesystem & Asset Audit

#### 3.1 Primary HTML Export Files Audit
- **Verification Script**:
  ```powershell
  node -e "
  const fs = require('fs');
  const path = require('path');

  // 1. out/index.html checks
  const indexPath = path.resolve('out/index.html');
  if (!fs.existsSync(indexPath)) throw new Error('Missing out/index.html');
  const indexStat = fs.statSync(indexPath);
  if (indexStat.size < 100000) throw new Error('out/index.html too small: ' + indexStat.size);
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  const requiredIndexSubstrings = [
    'href=\"/favicon.ico\"',
    'bg-tech-dark',
    'bg-tech-light',
    'bg-medical-dark',
    'bg-medical-light',
    'bg-academic-dark',
    'bg-academic-light',
    'project-tech'
  ];
  for (const s of requiredIndexSubstrings) {
    if (!indexHtml.includes(s)) throw new Error('out/index.html missing string: ' + s);
  }
  console.log('✓ out/index.html verified (' + indexStat.size + ' bytes, all backgrounds & icons referenced)');

  // 2. out/404.html checks
  const notFoundPath = path.resolve('out/404.html');
  if (!fs.existsSync(notFoundPath)) throw new Error('Missing out/404.html');
  const notFoundStat = fs.statSync(notFoundPath);
  if (notFoundStat.size < 10000) throw new Error('out/404.html too small: ' + notFoundStat.size);
  const notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');

  const required404Substrings = [
    'href=\"/\"',
    'href=\"/#projects\"',
    'href=\"/?mode=tech\"',
    'href=\"/?mode=medical\"',
    'href=\"/?mode=academic\"'
  ];
  for (const s of required404Substrings) {
    if (!notFoundHtml.includes(s)) throw new Error('out/404.html missing navigation link: ' + s);
  }
  console.log('✓ out/404.html verified (' + notFoundStat.size + ' bytes, all navigation & mode links present)');

  // 3. out/favicon.ico checks
  const favPath = path.resolve('out/favicon.ico');
  if (!fs.existsSync(favPath)) throw new Error('Missing out/favicon.ico');
  const favStat = fs.statSync(favPath);
  if (favStat.size < 100) throw new Error('out/favicon.ico abnormally small: ' + favStat.size);
  console.log('✓ out/favicon.ico verified (' + favStat.size + ' bytes)');
  "
  ```

#### 3.2 Static Media Assets Audit (`out/_next/static/media/`)
- **Verification Script**:
  ```powershell
  node -e "
  const fs = require('fs');
  const path = require('path');

  const mediaDir = path.resolve('out/_next/static/media');
  if (!fs.existsSync(mediaDir)) throw new Error('Missing out/_next/static/media directory');

  const files = fs.readdirSync(mediaDir);
  const avifFiles = files.filter(f => f.endsWith('.avif'));
  const svgFiles = files.filter(f => f.endsWith('.svg'));

  console.log('Found ' + avifFiles.length + ' AVIF assets, ' + svgFiles.length + ' SVG assets in out/_next/static/media');

  if (avifFiles.length < 6) throw new Error('Expected at least 6 AVIF files, found ' + avifFiles.length);
  for (const f of avifFiles) {
    const s = fs.statSync(path.join(mediaDir, f));
    if (s.size < 5000) throw new Error('AVIF file corrupted or too small (' + s.size + ' bytes): ' + f);
  }

  if (svgFiles.length < 3) throw new Error('Expected at least 3 SVG files, found ' + svgFiles.length);
  for (const f of svgFiles) {
    const s = fs.statSync(path.join(mediaDir, f));
    if (s.size < 500000) throw new Error('SVG file too small (' + s.size + ' bytes): ' + f);
  }

  console.log('✓ All 6 AVIF background media & 3 SVG icons physically present and non-zero in static export bundle');
  "
  ```

---

### Stage 4: Test Suite & Quality Gates Execution

#### 4.1 E2E Regression Test Suite (Tiers 1–4)
- **Command**:
  ```powershell
  node tests/e2e/runner.mjs
  ```
- **Success Criteria**:
  - Exit code: 0
  - Output shows `pass 78`, `fail 0`, `cancelled 0`, `skipped 0`.
  - All 4 tiers pass:
    - Tier 1: Feature Coverage (R1–R6) -> 35 passed
    - Tier 2: Boundary & Corner Cases (R1–R6) -> 30 passed
    - Tier 3: Cross-Feature Combinations -> 8 passed
    - Tier 4: Real-World Scenarios -> 5 passed
  - Requirements Coverage Table printed with R1–R6 marked `COVERED`.

#### 4.2 Tier 5 Adversarial Test Suite
- **Command**:
  ```powershell
  node --test tests/e2e/tier5-adversarial-m1.test.mjs
  ```
- **Success Criteria**:
  - Exit code: 0
  - Output shows `pass 12`, `fail 0`, `cancelled 0`, `skipped 0`.
  - Specifically validates:
    - `T5.4.1: out/index.html exists and contains preloaded AVIF images and SVG icons` -> PASS
    - `T5.4.2: All AVIF media emitted by Next.js static export physically exist in out/_next/static/media/` -> PASS

#### 4.3 TypeScript Static Typecheck
- **Command**:
  ```powershell
  npm.cmd run typecheck
  ```
  *(or `node node_modules/typescript/bin/tsc --noEmit`)*
- **Success Criteria**:
  - Exit code: 0
  - 0 compilation errors.

---

## 4. Actionable Verification Checklist for the Worker

The implementer/worker (`worker_m1_it3`) MUST follow this ordered execution checklist to verify Milestone 1 Iteration 3:

| Step | Action / Command | Expected Output / Exit Criteria | Status |
|:----:|:-----------------|:--------------------------------|:------:|
| **1** | Apply script deduplication edit to `package.json` line 11 | `"build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build"` | [ ] |
| **2** | Add `rename` interceptor to `patch-fs.js` (`promises.rename`, `renameSync`, `rename`) | Safely catches `ENOENT` when target/source includes `500.html` | [ ] |
| **3** | Validate JSON syntax of `package.json`:<br>`node -e "JSON.parse(fs.readFileSync('package.json', 'utf8')); console.log('JSON OK');"` | `JSON OK`, Exit code 0 | [ ] |
| **4** | Execute standalone clean:<br>`npm.cmd run clean` | `.next` and `out` deleted, Exit code 0 | [ ] |
| **5** | Execute fresh clean build:<br>`npm.cmd run build` | `prebuild` runs once, Next.js compiles, `Exporting (2/2)`, Exit code 0 | [ ] |
| **6** | Verify physical existence of static export files:<br>`Test-Path out/index.html`<br>`Test-Path out/404.html` | Both return `True` | [ ] |
| **7** | Execute second build (idempotency check):<br>`npm.cmd run build` | Builds cleanly with Exit code 0 | [ ] |
| **8** | Run primary 4-tier E2E test suite:<br>`node tests/e2e/runner.mjs` | **78 / 78 PASSED**, Exit code 0 | [ ] |
| **9** | Run Tier 5 adversarial test suite:<br>`node --test tests/e2e/tier5-adversarial-m1.test.mjs` | **12 / 12 PASSED**, Exit code 0 | [ ] |
| **10** | Run TypeScript typecheck:<br>`npm.cmd run typecheck` | 0 errors, Exit code 0 | [ ] |

---

## 5. Ready-to-Run Unified Verification Script

For convenience, the Worker and Reviewers can execute this single verification script in PowerShell:

```powershell
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  MILESTONE 1 ITERATION 3 COMPREHENSIVE VERIFICATION" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Clean build
Write-Host "`n[1/5] Running clean build..." -ForegroundColor Yellow
npm.cmd run clean
if ($LASTEXITCODE -ne 0) { Write-Error "Clean failed"; exit 1 }

npm.cmd run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

# Step 2: Second build (idempotency check)
Write-Host "`n[2/5] Running second build (idempotency test)..." -ForegroundColor Yellow
npm.cmd run build
if ($LASTEXITCODE -ne 0) { Write-Error "Idempotent build failed"; exit 1 }

# Step 3: Filesystem verification
Write-Host "`n[3/5] Verifying static export output files..." -ForegroundColor Yellow
if (-not (Test-Path out/index.html)) { Write-Error "Missing out/index.html"; exit 1 }
if (-not (Test-Path out/404.html)) { Write-Error "Missing out/404.html"; exit 1 }
if (-not (Test-Path out/favicon.ico)) { Write-Error "Missing out/favicon.ico"; exit 1 }
if (-not (Test-Path out/_next/static/media)) { Write-Error "Missing out/_next/static/media"; exit 1 }

$avifCount = (Get-ChildItem -Path out/_next/static/media -Filter *.avif).Count
$svgCount = (Get-ChildItem -Path out/_next/static/media -Filter *.svg).Count
Write-Host "Exported AVIF count: $avifCount (expected >= 6)" -ForegroundColor Green
Write-Host "Exported SVG count: $svgCount (expected >= 3)" -ForegroundColor Green
if ($avifCount -lt 6 -or $svgCount -lt 3) { Write-Error "Asset emission count deficient"; exit 1 }

# Step 4: Run primary 4-tier E2E suite
Write-Host "`n[4/5] Running E2E test runner (78 tests)..." -ForegroundColor Yellow
node tests/e2e/runner.mjs
if ($LASTEXITCODE -ne 0) { Write-Error "E2E runner failed"; exit 1 }

# Step 5: Run Tier 5 adversarial suite
Write-Host "`n[5/5] Running Tier 5 adversarial tests (12 tests)..." -ForegroundColor Yellow
node --test tests/e2e/tier5-adversarial-m1.test.mjs
if ($LASTEXITCODE -ne 0) { Write-Error "Tier 5 adversarial tests failed"; exit 1 }

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  ALL VERIFICATION GATES PASSED (100% GREEN)" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
```

---

## 6. Failure Modes & Invalidation Criteria

If any of the following occur during review or testing, the verification fails:

1. **Build Exit Code != 0**: Any unhandled error during `npm run build`, including `ENOENT: 500.html`, `EPERM: trace`, or compiler syntax/type errors.
2. **Missing `out/index.html` or `out/404.html`**: If either file does not exist on disk after `npm run build`.
3. **Missing Static Media**: If `out/_next/static/media/` contains fewer than 6 AVIF files or fewer than 3 SVG files.
4. **Any Failing Test**: If `node tests/e2e/runner.mjs` passes fewer than 78/78, or `tier5-adversarial-m1.test.mjs` passes fewer than 12/12.
5. **Double Clean Execution**: If the build log shows `clean.js` executing twice consecutively during a single `npm run build`.
