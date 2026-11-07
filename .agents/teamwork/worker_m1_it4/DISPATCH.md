# Dispatch: Worker for Milestone 1 Iteration 4 (Audit Remediation)

## Identity & Role
- **Agent Type**: `teamwork_worker`
- **Role**: Build Stabilization & Static Export Remediation Implementer
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_it4\`
- **Parent Conversation ID**: `f9cf2612-76b9-4d87-9390-7f9e3bb866f5`
- **Owned Target Files**:
  - `w:\home\krisnanda\Code\Project\Personal - github\portofolio\patch-fs.js`
  - `w:\home\krisnanda\Code\Project\Personal - github\portofolio\scripts\clean.js`

## MANDATORY INTEGRITY WARNING
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Mandatory Input Files
You MUST read these files completely before beginning your implementation:
1. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (Authoritative user requirements)
2. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md` (Global Architecture & Milestones)
3. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\auditor_m1_gen2_1\handoff.md` (FULL FORENSIC AUDITOR EVIDENCE REPORT - MANDATORY)
4. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it4_2\handoff.md` (Static Export & Tier 5 Explorer Report)
5. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it4_3\handoff.md` (Typecheck & Pipeline Explorer Report)
6. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it4_3\remediation.patch` (Pre-formulated verified patch)

## Remediation Tasks & Technical Instructions
1. **Apply Remediation to `patch-fs.js`**:
   - Add path detection helper `isPagesManifestPath(p)` for `.next/server/pages-manifest.json`.
   - Add `DEFAULT_PAGES_MANIFEST = JSON.stringify({ "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" }, null, 2)`.
   - Add `ensurePagesManifestOnDisk(filePath)` helper.
   - Wrap `fs.open`, `fs.openSync`, and `fs.promises.open` to call `ensurePagesManifestOnDisk(p)` when path matches.
   - Wrap `fs.readFile`, `fs.readFileSync`, and `fs.promises.readFile` (and sync to `fs/promises`) so that if `ENOENT` occurs on `pages-manifest.json`, it calls `ensurePagesManifestOnDisk` and resolves/returns `DEFAULT_PAGES_MANIFEST` cleanly without throwing.
   - Add global `process.on('uncaughtException')` safeguard for `ENOENT` on `pages-manifest.json`.
2. **Apply Remediation to `scripts/clean.js`**:
   - Add `'tsconfig.tsbuildinfo'` to `TARGETS` array (`const TARGETS = ['.next', 'out', 'tsconfig.tsbuildinfo'];`).
3. **Execute Strict Verification Protocol**:
   - Step 1: `npm.cmd run clean` (Check exit code 0)
   - Step 2: `npm.cmd run build` (Must succeed with code 0 from clean state, generate `out/index.html` >100KB, `out/404.html` >10KB, `out/favicon.ico`, and 6 AVIF + 3 SVG media assets)
   - Step 3: `npm.cmd run typecheck` (Must succeed with 0 compilation errors)
   - Step 4: `node tests/e2e/runner.mjs` (All 78 tests must pass)
   - Step 5: `node --test tests/e2e/tier5-adversarial-m1.test.mjs` (All 12 tests must pass)
4. Deliver comprehensive handoff report to `handoff.md` in your working directory.
5. Notify orchestrator via `send_message`.

## 2026-11-05T16:48:12Z
[Message] timestamp=2026-11-05T16:48:12Z sender=f9cf2612-76b9-4d87-9390-7f9e3bb866f5 priority=MESSAGE_PRIORITY_HIGH content=You are worker_m1_it4, a teamwork_worker.
Your working directory is w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_it4\
Your parent conversation ID is f9cf2612-76b9-4d87-9390-7f9e3bb866f5
...

