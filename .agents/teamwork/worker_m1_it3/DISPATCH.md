# Dispatch: Worker M1 Iteration 3

- **Assigned Agent**: `worker_m1_it3` (`teamwork_worker`)
- **Role**: Build Stabilization & Static Export Implementer
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_it3\`
- **Exclusive File Ownership**:
  - `w:\home\krisnanda\Code\Project\Personal - github\portofolio\patch-fs.js`
  - `w:\home\krisnanda\Code\Project\Personal - github\portofolio\package.json`

---

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## Context & Inputs
You MUST read the following files before taking any action:
1. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\ORIGINAL_REQUEST.md` (Verbatim User Requirements)
2. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\PROJECT.md` (Global Architecture & Milestones)
3. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_1\recommendations.md` (fs.rename 500.html Patch Architecture)
4. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_2\recommendations.md` (package.json Script Deduplication)
5. `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_3\recommendations.md` (Verification Protocol & Assertions)

---

## Concrete Tasks

### 1. Update `package.json`
Remove the redundant `node scripts/clean.js && ` from `"build"` script.
Ensure the scripts section is:
```json
    "clean": "node scripts/clean.js",
    "prebuild": "node scripts/clean.js",
    "build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build",
```
Validate JSON syntax after edit.

### 2. Update `patch-fs.js`
Apply the three enhancements designed by Explorer 1:
1. **Helper Functions**: Add `is500HtmlPath(p)` and `is500Rename(oldPath, newPath)` directly after `isLockingError` (around line 42).
2. **Rename Interceptors**: Add Section 4.8 intercepting `fs.rename`, `fs.renameSync`, and `fs.promises.rename` to catch `ENOENT` when `is500Rename(oldPath, newPath)` is true and safely return `undefined` (or invoke `cb(null)`) without throwing.
3. **Process Safeguard**: Update Section 5 `process.on('uncaughtException')` to add a secondary check for `err.code === 'ENOENT' && err.syscall === 'rename' && (is500HtmlPath(err.path) || is500HtmlPath(err.dest))`.

Maintain the single `--require` invariant in `process.env.NODE_OPTIONS`.

### 3. Verification Protocol (Run All in Sequence)
Execute the following verification sequence using your shell tools:
1. `npm.cmd run clean` (verify .next and out are deleted, exit code 0)
2. `npm.cmd run build` (first run: fresh clean build -> verify prebuild runs clean once, Next.js compiles, `Exporting (2/2)`, exit code 0)
3. `npm.cmd run build` (second run: idempotency test -> verify exit code 0)
4. Filesystem check:
   - `out/index.html` exists and size >= 100 KB
   - `out/404.html` exists and size >= 10 KB
   - `out/favicon.ico` exists
   - `out/_next/static/media` contains >= 6 AVIF files and >= 3 SVG files
5. Test runner execution:
   - `node tests/e2e/runner.mjs` -> MUST PASS 78 / 78 tests (exit code 0)
   - `node --test tests/e2e/tier5-adversarial-m1.test.mjs` -> MUST PASS 12 / 12 tests (exit code 0)
6. Static typecheck:
   - `npm.cmd run typecheck` (or `node node_modules/typescript/bin/tsc --noEmit`) -> MUST PASS with 0 errors (exit code 0)

---

## Deliverables
Write your completion report to `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\worker_m1_it3\handoff.md` with:
- Observation (what files you modified and verified)
- Logic Chain (how changes satisfy requirements without regressions)
- Caveats & Edge cases
- Conclusion
- Full verification command logs & outputs

Then send a message to orchestrator with your completion status and path to `handoff.md`.

## 2026-11-05T14:23:55Z
Received dispatch from orchestrator 514f318a-382e-4a4c-bf5e-58e0d0eff1f1: Assigned as Build Stabilization & Static Export Implementer for Milestone 1 Iteration 3. Tasks: deduplicate package.json build script, add 500.html rename interceptor to patch-fs.js, execute full verification sequence.

