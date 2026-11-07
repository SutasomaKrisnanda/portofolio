# Handoff Report: fs.rename 500.html Patch Architecture

- **Author**: `teamwork_explorer_1` (Roles: Investigator, Patch Architect)
- **Milestone**: Milestone 1 Iteration 3
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_1\`
- **Recipient**: Parent Orchestrator (`514f318a-382e-4a4c-bf5e-58e0d0eff1f1`) & Worker M1 Iteration 3
- **Type**: Hard Handoff (Investigation & Architecture Complete)

---

## 1. Observation

1. **Next.js Static Export Crash**:
   - Location: `node_modules/next/dist/build/index.js:2123`
   - Verbatim Error:
     ```text
     ✓ Generating static pages (4/4)
     > Build error occurred
     [Error: ENOENT: no such file or directory, rename 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\export\500.html' -> 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\server\pages\500.html'] {
       errno: -4058,
       code: 'ENOENT',
       syscall: 'rename',
       path: 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\export\\500.html',
       dest: 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\server\\pages\\500.html'
     }
     Command exited with code 1.
     ```
2. **Next.js Internal Code Path**:
   - `node_modules/next/dist/build/index.js` lines 1613–1614:
     `const useDefaultStatic500 = !hasPages500 && !hasNonStaticErrorPage && !customAppGetInitialProps;`
     Because there are no Pages Router files, this evaluates to `true`.
   - `node_modules/next/dist/build/index.js` lines 2181–2183:
     `if (useDefaultStatic500) { await moveExportedPage('/_error', '/500', '/500', false, 'html'); }`
   - `node_modules/next/dist/build/index.js` line 2123:
     `await _fs.promises.rename(orig, dest);` where `orig` is `.next/export/500.html` and `dest` is `.next/server/pages/500.html`.
   - In Next.js App Router static export mode, `500.html` is not emitted to `.next/export/500.html`, causing `fs.promises.rename` to throw unhandled `ENOENT`.
3. **Current State of `patch-fs.js`**:
   - Path: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\patch-fs.js`
   - Currently intercepts `readlink`, `open`, `writeFile`, `appendFile`, and `unlink`.
   - Does NOT intercept `fs.promises.rename`, `fs.renameSync`, or `fs.rename`.
4. **Node.js `NODE_OPTIONS` Architecture Limitation**:
   - In Node.js on Windows with paths containing whitespace (`Personal - github`), attempting to chain multiple `--require` flags inside `NODE_OPTIONS` fails during worker process startup with `Error: Cannot find module ...`.
   - Therefore, all patch logic must be housed within `patch-fs.js` directly, maintaining a single `--require` in `NODE_OPTIONS`.
5. **Empirical Prototype Validation**:
   - We implemented the candidate interceptor for `fs.promises.rename`, `fs.renameSync`, and `fs.rename` and ran Next.js production build from a clean state.
   - Result:
     - `node_modules/next/dist/bin/next build` exited with Code 0.
     - `✓ Exporting (2/2)` completed successfully.
     - `out/index.html` was emitted (147,168 bytes).
     - `out/404.html` was emitted (37,114 bytes).
     - `out/_next/static/media/` contains all 6 AVIF files and 3 SVG icons.
     - `node --test tests/e2e/tier5-adversarial-m1.test.mjs` passed 12 / 12 (0 failures).
     - `node tests/e2e/runner.mjs` passed 78 / 78 (0 failures).

---

## 2. Logic Chain

1. **Premise**: Next.js App Router with `output: 'export'` unconditionally executes `moveExportedPage('/_error', '/500', '/500', false, 'html')` because `useDefaultStatic500` is true when no Pages Router 500 error page exists (Observation 1, 2).
2. **Failure Point**: Inside `moveExportedPage`, Next.js calls `await _fs.promises.rename(orig, dest)` where `orig` (`.next/export/500.html`) does not exist on disk because App Router does not emit static 500 pages into `.next/export/` (Observation 1, 2).
3. **Mechanism of Resolution**: Intercepting `fs.promises.rename`, `fs.renameSync`, and `fs.rename` in `patch-fs.js` to catch `ENOENT` when `oldPath` or `newPath` contains `500.html`, and returning cleanly without throwing (`return undefined;`), allows `moveExportedPage` to finish gracefully without aborting the build (Observation 3, 5).
4. **Zero Side-Effects**: Next.js does not reference `.next/server/pages/500.html` after this step because `/500` is intentionally omitted from `pagesManifest` when using App Router (Observation 2). Returning cleanly without creating a dummy file prevents unstyled or extraneous status files from leaking into static export artifacts.
5. **Architectural Constraint**: Because of Node's option parser behavior on Windows with spaces in path names (Observation 4), all hooks must be merged directly into `patch-fs.js`.
6. **Integration with Explorer 2 & 3**: Explorer 2 (`explorer_m1_it3_2`) identified the double-clean script in `package.json` line 11 (`node scripts/clean.js && ...`), which must be removed to avoid filesystem lock collisions. Explorer 3 (`explorer_m1_it3_3`) provided the multi-tier verification assertions. Together, these form the complete, airtight solution for Worker M1 Iteration 3.

---

## 3. Caveats

1. **Scope of Interceptor**: The `ENOENT` swallow is strictly restricted to operations where `oldPath` or `newPath` matches `500.html` (via `is500Rename`). Legitimate `ENOENT` errors for any other files (e.g., missing chunks, config files, manifests) continue to throw normally so errors are never masked.
2. **No UI Code Modifications Required**: The bug is purely a build-tooling interaction between Next.js 15.5.6 static export and Node's filesystem module on Windows. No React components, CSS, or JSON datasets require alteration.
3. **Double-Clean Prerequisite**: The Worker must also apply Explorer 2's fix to `package.json` (removing `node scripts/clean.js && ` from `"build"` script) to avoid transient file locking on clean builds.

---

## 4. Conclusion

The build failure on `fs.promises.rename .../.next/export/500.html` is completely solved by adding an `ENOENT` interceptor to `patch-fs.js` covering `fs.promises.rename`, `fs.renameSync`, and `fs.rename`, along with process `uncaughtException` hardening.

### Exact Code for Worker (`patch-fs.js`):

```javascript
// 1. Path detection helper (insert after line 42)
const is500HtmlPath = (p) => {
  if (!p) return false;
  let str;
  if (typeof p === 'string') {
    str = p;
  } else if (Buffer.isBuffer(p)) {
    str = p.toString();
  } else if (typeof p === 'object' && p.pathname) {
    str = p.pathname;
  } else {
    str = String(p);
  }
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/500.html') ||
    normalized.includes('/export/500.html') ||
    normalized.includes('/server/pages/500.html') ||
    normalized === '500.html' ||
    /(?:^|[\\/])500\.html(?:$|[\\/?#])/.test(str)
  );
};

const is500Rename = (oldPath, newPath) => {
  return is500HtmlPath(oldPath) || is500HtmlPath(newPath);
};

// 2. Section 4.8 (insert before Section 5)
const origRename = fs.rename;
fs.rename = function (oldPath, newPath, cb) {
  if (typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) {
        return cb(null);
      }
      return cb(err);
    };
    return origRename.call(fs, oldPath, newPath, wrappedCb);
  }
  return origRename.call(fs, oldPath, newPath, cb);
};

const origRenameSync = fs.renameSync;
fs.renameSync = function (oldPath, newPath) {
  try {
    return origRenameSync.call(fs, oldPath, newPath);
  } catch (err) {
    if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) {
      return undefined;
    }
    throw err;
  }
};

if (fs.promises && fs.promises.rename) {
  const origPromisesRename = fs.promises.rename;
  fs.promises.rename = async function (oldPath, newPath) {
    try {
      return await origPromisesRename.call(fs.promises, oldPath, newPath);
    } catch (err) {
      if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) {
        return undefined;
      }
      throw err;
    }
  };
}

// 3. Update Section 5 process.on('uncaughtException')
process.on('uncaughtException', (err) => {
  if (
    err &&
    isLockingError(err) &&
    isTracePath(err.path)
  ) {
    return;
  }
  if (
    err &&
    err.code === 'ENOENT' &&
    err.syscall === 'rename' &&
    (is500HtmlPath(err.path) || is500HtmlPath(err.dest))
  ) {
    return;
  }
  throw err;
});
```

---

## 5. Verification Method

To independently verify the implementation:

```powershell
# 1. Clean workspace
npm.cmd run clean

# 2. Run clean production build
npm.cmd run build

# Expected Output:
# ✓ Generating static pages (4/4)
# ✓ Exporting (2/2)
# Exit code: 0

# 3. Verify emitted static files
Test-Path out/index.html
Test-Path out/404.html
Test-Path out/favicon.ico
Test-Path out/_next/static/media

# 4. Run test suites
node tests/e2e/runner.mjs
# Expected: 78 / 78 PASSED (Code 0)

node --test tests/e2e/tier5-adversarial-m1.test.mjs
# Expected: 12 / 12 PASSED (Code 0)

# 5. Typecheck
npm.cmd run typecheck
# Expected: 0 errors (Code 0)
```

**Invalidation Conditions**:
- If `npm.cmd run build` crashes with `ENOENT` on `500.html`.
- If `out/index.html` or `out/404.html` is not generated.
- If any test in `runner.mjs` or `tier5-adversarial-m1.test.mjs` fails.
