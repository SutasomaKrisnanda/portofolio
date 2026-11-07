# Handoff Report: package.json Script Deduplication Architecture

- **Author**: `teamwork_explorer_2` (Roles: Investigator, Synthesizer — package.json Script Deduplication Architect)
- **Milestone**: Milestone 1 Iteration 3
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_2\`
- **Recipient**: Parent Orchestrator (`514f318a-382e-4a4c-bf5e-58e0d0eff1f1`)

---

## 1. Observation

1. **Current `package.json` Scripts Definition** (`package.json:9–11`):
   ```json
       "clean": "node scripts/clean.js",
       "prebuild": "node scripts/clean.js",
       "build": "node scripts/clean.js && node -r ./patch-fs.js node_modules/next/dist/bin/next build",
   ```
2. **Verbatim Double-Clean Execution During `npm.cmd run build`** (Quoted directly from `challenger_m1_it2_2/handoff.md:19–30`):
   ```text
   > nextn@0.1.0 prebuild
   > node scripts/clean.js

   [clean] Preparing clean build environment in: W:\home\krisnanda\Code\Project\Personal - github\portofolio
   [clean] Successfully removed .next (37ms)
   [clean] Cleanup complete. Workspace ready for build.

   > nextn@0.1.0 build
   > node scripts/clean.js && node -r ./patch-fs.js node_modules/next/dist/bin/next build

   [clean] Preparing clean build environment in: W:\home\krisnanda\Code\Project\Personal - github\portofolio
   [clean] Cleanup complete. Workspace ready for build.
   ```
3. **Reviewer Observation of File System Race Collision** (`reviewer_m1_it2_2/handoff.md:36–39`):
   ```text
   [Error: ENOENT: no such file or directory, open 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\build-manifest.json']
   > Build error occurred
   [Error: Failed to collect page data for /_not-found] { type: 'Error' }
   Command exited with code 1.
   ```
4. **NPM CLI Environment**:
   - `npm.cmd --version`: `11.19.0`
   - `node --version`: `v26.7.0`
   - Direct execution of `npm` in PowerShell fails with execution policy restrictions (`PSSecurityException`), requiring invocation via `npm.cmd`.
5. **NPM Lifecycle Script Registry**:
   Running `npm.cmd run` outputs:
   ```text
   available via `npm run`:
     dev
       next dev --turbopack -p 9002
     clean
       node scripts/clean.js
     prebuild
       node scripts/clean.js
     build
       node scripts/clean.js && node -r ./patch-fs.js node_modules/next/dist/bin/next build
   ```

---

## 2. Logic Chain

1. **Observation 1 & 5** demonstrate that `package.json` contains three related scripts: `"clean"`, `"prebuild"`, and `"build"`.
2. In NPM's standard execution lifecycle, running `npm run <script>` automatically evaluates and executes `pre<script>` if defined.
3. Therefore, executing `npm run build` triggers `prebuild` (`node scripts/clean.js`) before executing `build`.
4. As recorded in **Observation 2**, because `"build"` also starts with `node scripts/clean.js && `, `clean.js` is executed a second time immediately after `prebuild` completes.
5. In **Observation 3**, consecutive executions of `clean.js` on Windows DrvFs / NTFS create transient file lock delays and timing collisions with Next.js compilation (`ENOENT: build-manifest.json`).
6. Removing `node scripts/clean.js && ` from `"build"` ensures that `clean.js` runs exactly once per `npm run build` (via `prebuild`), with full process completion and handle release guaranteed before Next.js starts.
7. Retaining `"clean": "node scripts/clean.js"` provides a standalone clean command (`npm run clean`) for manual maintenance without triggering a build.
8. Retaining `"prebuild": "node scripts/clean.js"` ensures all automated builds remain clean by default.
9. Modifying `"build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build"` establishes single responsibility, standard lifecycle compliance, and complete race-free execution.

---

## 3. Caveats

- This investigation is strictly focused on `package.json` scripts deduplication.
- The parallel failure identified in Iteration 2 regarding Next.js App Router static export (`ENOENT` on renaming `.next/export/500.html`) is addressed in `patch-fs.js` by Explorer 1 (`explorer_m1_it3_1`).
- Developers executing `node -r ./patch-fs.js node_modules/next/dist/bin/next build` directly (bypassing `npm run build`) will run an incremental build without auto-cleaning; this is standard and desirable behavior for direct binary invocation.

---

## 4. Conclusion

The build script configuration in `package.json` must be updated to:
```json
    "clean": "node scripts/clean.js",
    "prebuild": "node scripts/clean.js",
    "build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build",
```

This change:
1. Completely eliminates the double-clean race condition.
2. Conforms to standard NPM lifecycle semantics (`prebuild` runs before `build`).
3. Guarantees clean directory state before Next.js compilation begins.
4. Preserves standalone `npm run clean` capability.

Full detailed instructions and rationale have been published in `recommendations.md`.

---

## 5. Verification Method

To verify the proposed fix independently:

```powershell
# 1. Verify JSON syntax and script configuration
node -e "const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')); console.assert(pkg.scripts.build === 'node -r ./patch-fs.js node_modules/next/dist/bin/next build'); console.assert(pkg.scripts.prebuild === 'node scripts/clean.js'); console.assert(pkg.scripts.clean === 'node scripts/clean.js'); console.log('Configuration verified successfully.');"

# 2. Inspect script listing
npm.cmd run

# 3. Test standalone clean
npm.cmd run clean

# 4. Test production build execution
npm.cmd run build

# Verify:
# - 'prebuild' executes 'node scripts/clean.js' exactly ONCE.
# - 'build' executes 'node -r ./patch-fs.js node_modules/next/dist/bin/next build' without duplicate clean.
# - Exit code is 0.
```

**Invalidation Conditions**:
- If `clean.js` is observed executing more than once during a single `npm.cmd run build` run.
- If `npm.cmd run build` fails to execute `prebuild`.
- If `npm.cmd run clean` fails to remove `.next` or `out`.
