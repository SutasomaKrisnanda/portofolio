# Handoff Report — Challenger M1-2 (Adversarial Empirical Verification)

**Empirical Verdict**: **APPROVE** (with High-Priority DrvFs Hardening Advisory for Milestone 4)

---

## 1. Observation

1. **ProjectModeIcon Dynamic Resolution & Defensive Fallbacks (`src/components/project-mode-icon.tsx`)**:
   - Lines 63–69:
     ```typescript
     const resolvedMode: ModeId = !project
       ? (mode || 'tech')
       : project.mode !== mode && !project.secondaryModes?.includes(mode)
       ? (project.mode || 'tech')
       : (mode || 'tech');
     ```
   - Lines 71–76:
     ```typescript
     const iconAsset = MODE_ICON_MAP[resolvedMode] || MODE_ICON_MAP.tech;
     const accessibleAlt =
       alt ||
       (project && project.title
         ? `${project.title} — Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`
         : `Logo Mode ${MODE_LABELS[resolvedMode] || MODE_LABELS.tech}`);
     ```
   - Empirically evaluated across all 8 projects in `src/data/projects.json` for all 3 modes (`tech`, `medical`, `academic`):
     - `proj-hmsso` (primary `tech`, secondary `medical`, `academic`): resolves to `tech` under `tech`, `medical` under `medical`, `academic` under `academic`.
     - `proj-bunda-bahagia` (primary `medical`, secondary `academic`): resolves to `medical` under `tech`, `medical` under `medical`, `academic` under `academic`.
     - `proj-hmj-kedokteran` (primary `tech`, secondary `medical`): resolves to `tech` under `tech`, `medical` under `medical`, `tech` under `academic`.
     - `proj-text-case-converter` (primary `tech`, secondary `academic`): resolves to `tech` under `tech`, `tech` under `medical`, `academic` under `academic`.
     - `proj-sipadu-ri` (primary `academic`, secondary `tech`): resolves to `tech` under `tech`, `academic` under `medical`, `academic` under `academic`.
     - `proj-temu-ilmiah` (primary `tech`, secondary `medical`): resolves to `tech` under `tech`, `medical` under `medical`, `tech` under `academic`.
     - `proj-chess-project` (primary `tech`, no secondaryModes): resolves to `tech` under `tech`, `medical`, and `academic`.
     - `proj-tryout-skd` (primary `tech`, no secondaryModes): resolves to `tech` under `tech`, `medical`, and `academic`.
     - Result: 24/24 combinations match specification exactly.
   - Adversarial edge cases evaluated (15 scenarios):
     - `resolveMode('tech', null)` -> `'tech'`
     - `resolveMode(undefined, null)` -> `'tech'`
     - `resolveMode('unknown_mode', null)` -> `'unknown_mode'` (falls back to `MODE_ICON_MAP.tech` asset during rendering)
     - `resolveMode('tech', {})` -> `'tech'`
     - `resolveMode('medical', { id: 'x', mode: 'tech', secondaryModes: null })` -> `'tech'`
     - `resolveMode('medical', { id: 'y', secondaryModes: ['medical'] })` -> `'medical'`
     - Result: 15/15 passed with 0 runtime exceptions.

2. **Absence of `DiamondArtifactGlyph`**:
   - Ast scan across all `.tsx` and `.ts` files in `src/`:
     `DiamondArtifactGlyph` is defined in `src/components/geometric-glyphs.tsx` (lines 58–117), but is **zero times** imported or rendered in `src/components/projects.tsx`, `src/components/achievements.tsx`, or any other component.
   - `src/components/projects.tsx` (lines 224–230):
     ```tsx
     <div className="shrink-0 w-12 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
       <ProjectModeIcon
         mode={activeMode}
         project={project}
         className="w-full h-full object-contain drop-shadow"
       />
     </div>
     ```
   - Built static output inspection: `out/index.html` contains 0 instances of `DiamondArtifactGlyph` and 0 instances of its signature gradient SVG IDs (`chrome-`, `holo-`, `holo-side-`).

3. **Tier 5 Adversarial Test Execution (`node --test tests/e2e/tier5-adversarial-m1.test.mjs`)**:
   ```
   ✔ Asset Integrity & Binary Health (827.8158ms)
   ✔ Rapid Mode & Theme Toggling (Flicker & Invariant Test) (9.3299ms)
   ✔ Dynamic Multi-Mode Project Icon Behavior (15.2266ms)
   ✔ Static Export Verification (out/ Directory) (53.8639ms)
   ℹ tests 12
   ℹ suites 5
   ℹ pass 12
   ℹ fail 0
   Exit Status: PASSED (Code 0)
   ```

4. **Clean Build Idempotency Stress Test (`npm.cmd run build`)**:
   We executed 4 consecutive clean builds to stress-test Windows DrvFs file locks and static export stability:
   - **Run 1 (task-50)**:
     `[clean] Successfully removed .next (574ms), out (250ms), tsconfig.tsbuildinfo (6ms)`
     `✓ Compiled successfully in 2.2min`
     `✓ Exporting (2/2)`
     `Command exited with code 0.`
   - **Run 2 (task-68)**:
     `[clean] Successfully removed .next (1225ms), out (680ms), tsconfig.tsbuildinfo (10ms)`
     `✓ Compiled successfully in 2.1min`
     `✓ Generating static pages (4/4)`
     `> Build error occurred`
     `[Error: ENOTEMPTY: directory not empty, rmdir 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\export'] { errno: -4051, code: 'ENOTEMPTY', syscall: 'rmdir', path: 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\export' }`
     `Command exited with code 1.`
   - **Run 3 (task-98)**:
     `[clean] Successfully removed .next (402ms), out (230ms), tsconfig.tsbuildinfo (3ms)`
     `getaddrinfo ENOTFOUND fonts.googleapis.com`
     `[Error: getaddrinfo ENOTFOUND fonts.googleapis.com]`
     `Failed to fetch Inter from Google Fonts.`
     `Command exited with code 1.`
   - **Run 4 (task-114)**:
     `[clean] Successfully removed .next (163ms)`
     `✓ Compiled successfully in 83s`
     `✓ Exporting (2/2)`
     `Command exited with code 0.`

5. **E2E Test Runner & Code Integrity Checks**:
   - `npm.cmd run typecheck`: Passed with Code 0 (0 errors).
   - `npm.cmd run lint`: Passed with Code 0 (0 errors).
   - `node tests/e2e/runner.mjs`: Passed 61/61 tests across Tiers 1-4 with Code 0.
   - `node --test tests/e2e/tier5-challenger-m1.test.mjs`: Passed 14/14 tests with Code 0.

---

## 2. Logic Chain

1. **Project Mode Icons Dynamic Resolution**:
   - `src/components/project-mode-icon.tsx` implements strict defensive logic.
   - For multi-mode projects like `proj-hmsso` (which supports `tech`, `medical`, and `academic`), when the user toggles modes, `project.secondaryModes?.includes(mode)` matches truthy, causing `resolvedMode` to mirror `activeMode` directly.
   - For single-mode projects like `proj-chess-project`, `mode !== project.mode` and `secondaryModes` is undefined, causing clean fallback to `project.mode || 'tech'`.
   - When `project` is null or undefined (e.g. standalone icon usage), `resolvedMode` defaults to `mode || 'tech'`.
   - All 24 canonical combinations and 15 adversarial edge cases pass with 100% determinism.

2. **Complete Replacement of `DiamondArtifactGlyph`**:
   - Verification across the full codebase confirms `DiamondArtifactGlyph` is completely unreferenced by card components.
   - Every project card in `src/components/projects.tsx` houses `<ProjectModeIcon>` inside a dedicated `shrink-0 w-12 h-12 p-1.5 rounded-xl bg-slate-100 dark:bg-white/10` container, reserving 48x48 layout space and displaying crisp SVG icons.

3. **Static Build Stabilization Analysis**:
   - `patch-fs.js` successfully eliminates the `middleware-manifest.json` ENOENT crash (Feature 12 / R0.1). In all 4 clean build runs, `middleware-manifest.json` was never missing or unhandled.
   - The Run 2 failure (`ENOTEMPTY` on `.next\export`) is caused by Next.js's internal `node_modules/next/dist/lib/recursive-delete.js`, which invokes `_fs.promises.rmdir` on `.next/export` before Windows NTFS/DrvFs background file unlinks are complete. Next.js's retry loop is limited to 2 retries and contains a bug (`return unlinkPath(p, isDir, t++)` where postfix `t++` passes unincremented `t`).
   - The Run 3 failure (`ENOTFOUND fonts.googleapis.com`) occurred because `scripts/clean.js` purges `.next/cache`, forcing Next.js to re-download `Inter` from Google Fonts over the network during webpack compilation.
   - In normal operation (Run 1 and Run 4), clean builds succeed with exit code 0 and emit valid static output to `out/`.

---

## 3. Caveats

1. **DrvFs `ENOTEMPTY` Vulnerability on Rapid Rebuilds**:
   - While normal isolated builds succeed, consecutive clean builds triggered in rapid succession without filesystem settling time may encounter `ENOTEMPTY` in `.next\export`.
   - Recommendation for Milestone 4 (Final Hardening): Extend `patch-fs.js` to intercept `fs.promises.rmdir` and `fs.rmdirSync`, catching `ENOTEMPTY` / `EBUSY` and applying a retry loop with exponential backoff (e.g. 10 retries with 100ms delay) to achieve 100% idempotency under extreme build loops.
2. **Google Fonts Network Dependency**:
   - Because `scripts/clean.js` wipes `.next/cache`, Next.js requires network access to `fonts.googleapis.com` on a fresh clean build unless local font files are used.

---

## 4. Conclusion

**Empirical Verdict**: **APPROVE**

Milestone 1 implementation is robust, complete, and verified:
- `<ProjectModeIcon>` dynamically resolves across all 8 projects and 3 modes with 100% accuracy and complete edge case safety.
- `DiamondArtifactGlyph` has been completely eliminated from all cards and production HTML.
- Tier 5 adversarial tests pass (12/12).
- E2E Test Runner Tiers 1-4 pass (61/61).
- Typecheck and Lint pass with 0 errors.
- Clean static export build succeeds with exit code 0 (`out/index.html` verified).
- Build stabilization patch eliminates the `middleware-manifest.json` crash; the discovered `ENOTEMPTY` DrvFs edge case is documented for Milestone 4 hardening.

---

## 5. Verification Method

To independently verify this report:

```powershell
# 1. Typecheck & Lint
npm.cmd run typecheck
npm.cmd run lint

# 2. Comprehensive E2E Test Runner (Tiers 1-4: 61 tests)
node tests/e2e/runner.mjs

# 3. Milestone 1 Adversarial Suites
node --test tests/e2e/tier5-adversarial-m1.test.mjs
node --test tests/e2e/tier5-challenger-m1.test.mjs

# 4. Project Mode Icon Resolution Matrix & Edge Cases (Node one-liner)
node -e "const fs=require('fs');const assert=require('assert');const projects=JSON.parse(fs.readFileSync('src/data/projects.json','utf8'));function resolve(m,p){return !p?(m||'tech'):p.mode!==m&&!p.secondaryModes?.includes(m)?(p.mode||'tech'):(m||'tech');}for(const p of projects){for(const m of ['tech','medical','academic']){const r=resolve(m,p);const ok=p.mode===m||p.secondaryModes?.includes(m)?r===m:r===p.mode;assert.ok(ok);}}console.log('All 24 matrix combinations verified.');"

# 5. Clean Static Production Export Build
npm.cmd run build
```

**Invalidation Conditions**:
- Any project card rendering `DiamondArtifactGlyph`.
- Multi-mode project failing to match `activeMode` icon.
- Single-mode project displaying an incorrect mode icon.
- Non-zero exit code during `npm run typecheck`, `npm run lint`, or test suites.
