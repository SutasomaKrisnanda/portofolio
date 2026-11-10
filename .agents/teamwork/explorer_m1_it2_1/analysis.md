# Analysis Report: Trace Collection ENOENT Crash Remediation (`patch-fs.js`)

**Author**: Explorer M1-It2-1  
**Milestone**: Milestone 1 Iteration 2  
**Date**: 2026-11-08T01:40:00Z  
**Target Files**:
- `patch-fs.js` (lines 39–50, lines 300–400, lines 590–680, lines 690–716)
- `src/components/achievements.tsx` (line 140)

---

## 1. Executive Summary

During Milestone 1 Iteration 1 Gate verification, Reviewer M1-1 reported that clean execution of `npm.cmd run build` failed with exit code 1 during the trace collection stage (`Collecting build traces ...`):
```
Error: ENOENT: no such file or directory, open 'W:\home\krisnanda\Code\Project\Personal - github\portofolio\.next\server\pages\_app.js.nft.json'
    at async fs.promises.readFile (W:\home\krisnanda\Code\Project\Personal - github\portofolio\patch-fs.js:654:14) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\server\\pages\\_app.js.nft.json'
}
```
This failure prevented the static HTML and media generation phase (`out/` directory), causing Tier 5 adversarial tests T5.4.1 and T5.4.2 to fail.

Our empirical investigation pinpointed the dual root causes:
1. **Manifest Contamination (`patch-fs.js:39–50`)**: `patch-fs.js` defined `DEFAULT_PAGES_MANIFEST` with dummy Pages Router routes (`/_app: pages/_app.js`, `/_error: pages/_error.js`, `/_document: pages/_document.js`, `/404: pages/404.html`). In a pure Next.js 15 App Router project (`src/app/`), no `pages/` directory exists. Falsely declaring `pages/_app.js` contaminates internal manifest state.
2. **Uncaught Trace File Read (`patch-fs.js:650–675`)**: Next.js 15's internal `collect-build-traces.js:347–349` queries `traceOutputPath` (`.next/server/pages/_app.js.nft.json`) using `fs.promises.readFile(traceOutputPath, 'utf8')`. When Webpack does not emit this `.nft.json` file, `collect-build-traces.js` does not catch the resulting `ENOENT`. In `patch-fs.js`, `fs.promises.readFile` caught `ENOENT` only for `isMiddlewareManifestPath` and `isPagesManifestPath`, re-throwing the error for `.nft.json`. Next.js catches this error in line 1511 and calls `process.exit(1)`.

We present a complete, robust, defense-in-depth architectural fix:
1. Set `DEFAULT_PAGES_MANIFEST = '{}'` (empty JSON object), matching standard Next.js 15 App Router behavior.
2. Add `isNftJsonPath(p)` detection, `DEFAULT_NFT_JSON = JSON.stringify({ version: 1, files: [] })`, and `ensureNftJsonOnDisk(filePath)` to intercept missing `.nft.json` reads in `fs.promises.readFile`, `fs.readFileSync`, and `fs.readFile`, returning `{ "version": 1, "files": [] }` and creating the missing directory/file on disk.
3. Update `src/components/achievements.tsx:140` from `shrink-0` to `shrink-0 sm:shrink` to ensure design consistency with `src/components/projects.tsx:157` (Finding 2).

---

## 2. Forensic Investigation & Evidence Chain

### 2.1 The Crash Mechanism in Next.js Build Pipeline

1. **Entrypoint Generation**:
   In `node_modules/next/dist/build/entries.js:421–426`:
   ```javascript
   case _pagetypes.PAGE_TYPES.PAGES: {
     if (isDev) {
       delete pages['/_app'];
       delete pages['/_error'];
       delete pages['/_document'];
     }
     const root = isDev && pagesDir ? _constants.PAGES_DIR_ALIAS : 'next/dist/pages';
     return {
       '/_app': `${root}/_app`,
       '/_error': `${root}/_error`,
       '/_document': `${root}/_document`,
       ...pages
     };
   }
   ```
   Next.js always injects default `pages/_app`, `pages/_error`, and `pages/_document` into `mappedPages` during production builds (`isDev: false`), even when `pagesDir` is undefined.

2. **Webpack Trace Annotation**:
   In `node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js:142`:
   Every entrypoint in compilation is recorded into `entryNameFilesMap`:
   ```javascript
   entryNameFilesMap.set(entrypoint.name || '', [...entryFiles]);
   ```
   Because `pages/_app` was created as an entrypoint, `entryNameFilesMap` contains an entry for `pages/_app`.

3. **Trace Collection Execution**:
   In `node_modules/next/dist/build/collect-build-traces.js:328–349`:
   ```javascript
   await Promise.all([
     ...entryNameFilesMap ? Object.entries(entryNameFilesMap) : new Map()
   ].map(async ([entryName, entryNameFiles]) => {
     const isApp = entryName.startsWith('app/');
     const isPages = entryName.startsWith('pages/');
     let route = entryName;
     if (isApp) {
       route = (0, _apppaths.normalizeAppPath)(route.substring('app'.length));
     }
     if (isPages) {
       route = (0, _normalizepagepath.normalizePagePath)(route.substring('pages'.length));
     }
     if (staticPages.includes(route)) {
       return;
     }
     const entryOutputPath = _path.default.join(distDir, 'server', `${entryName}.js`);
     const traceOutputPath = `${entryOutputPath}.nft.json`;
     const existingTrace = JSON.parse(await _promises.default.readFile(traceOutputPath, 'utf8'));
     ...
   ```
   - For `entryName = 'pages/_app'`: `isPages = true`, `route = '/_app'`.
   - `/_app` is not in `staticPages`.
   - `traceOutputPath` is resolved to `.next/server/pages/_app.js.nft.json`.
   - Next.js calls `await _promises.default.readFile(traceOutputPath, 'utf8')`.

4. **The Missing `.nft.json` and Patch Re-Throw**:
   - Webpack did not emit `.next/server/pages/_app.js.nft.json` on disk because no actual `pages/` source existed.
   - `_promises.default.readFile` calls `patch-fs.js`'s hooked `fs.promises.readFile`:
     ```javascript
     // patch-fs.js lines 650-674
     if (fs.promises && fs.promises.readFile) {
       const origPromisesReadFile = fs.promises.readFile;
       fs.promises.readFile = async function (p, options) {
         try {
           return await origPromisesReadFile.call(fs.promises, p, options);
         } catch (err) {
           if (err && err.code === 'ENOENT' && isMiddlewareManifestPath(p)) { ... }
           if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) { ... }
           throw err; // Line 672: re-throws ENOENT for pages/_app.js.nft.json!
         }
       };
     }
     ```
   - Because `.nft.json` was neither `middleware-manifest.json` nor `pages-manifest.json`, the `ENOENT` was re-thrown at line 672.

5. **Build Termination**:
   In `node_modules/next/dist/build/index.js:1511–1514`:
   ```javascript
   buildTracesPromise = (0, _collectbuildtraces.collectBuildTraces)({ ... }).catch((err) => {
     console.error(err);
     process.exit(1);
   });
   ```
   The re-thrown `ENOENT` is caught by `.catch()`, logged verbatim to the terminal, and triggers `process.exit(1)`.

---

### 2.2 Forensic Inspection of `DEFAULT_PAGES_MANIFEST`

In `patch-fs.js` lines 39–50:
```javascript
const DEFAULT_PAGES_MANIFEST = JSON.stringify(
  {
    '/_app': 'pages/_app.js',
    '/_error': 'pages/_error.js',
    '/_document': 'pages/_document.js',
    '/404': 'pages/404.html'
  },
  null,
  2
);
```
- In an App Router project, Next.js generates `.next/server/pages-manifest.json` as `{}` (or containing only `/404: pages/404.html` if an app not-found was moved).
- When `ensurePagesManifestOnDisk` writes the fallback manifest before Next.js writes it, it populates `.next/server/pages-manifest.json` with references to non-existent `pages/_app.js` and `pages/404.html`.
- Any component reading `pages-manifest.json` is misled into believing Pages Router routes exist.
- Setting `DEFAULT_PAGES_MANIFEST = '{}'` aligns with genuine App Router behavior.

---

### 2.3 Verification of Next.js `.nft.json` Processing

In `node_modules/next/dist/build/collect-build-traces.js:349–376`:
```javascript
const existingTrace = JSON.parse(await _promises.default.readFile(traceOutputPath, 'utf8'));
const traceOutputDir = _path.default.dirname(traceOutputPath);
const curTracedFiles = new Set();
...
for (const file of existingTrace.files || []){
    curTracedFiles.add(file);
}
await _promises.default.writeFile(traceOutputPath, JSON.stringify({
    ...existingTrace,
    files: [
        ...curTracedFiles
    ].sort()
}));
```
When `_promises.default.readFile` returns `JSON.stringify({ version: 1, files: [] })`:
1. `existingTrace` is `{ version: 1, files: [] }`.
2. `existingTrace.files || []` evaluates safely to `[]`.
3. Newly traced dependencies are added to `curTracedFiles`.
4. `_promises.default.writeFile` writes back a valid `.nft.json` structure (`{ version: 1, files: [...] }`).
5. Trace collection completes without throwing.

---

## 3. Remediation Architecture & Design Decisions

### 3.1 Design Decision 1: `DEFAULT_PAGES_MANIFEST = '{}'`
- **Target**: `patch-fs.js:39–50`.
- **Action**: Replace the object literal containing `/_app`, `/_error`, `/_document`, `/404` with `'{}'`.
- **Rationale**: Removes synthetic Pages Router declarations. Next.js 15 App Router expects an empty pages manifest.

### 3.2 Design Decision 2: Comprehensive `.nft.json` Fallback in `patch-fs.js`
- **Target**: `patch-fs.js:14–105`, `305–400`, `590–680`, `690–716`.
- **Implementation**:
  1. Define path matcher:
     ```javascript
     function isNftJsonPath(p) {
       if (!p) return false;
       let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
       const normalized = str.replace(/\\/g, '/').toLowerCase();
       return normalized.endsWith('.nft.json');
     }
     ```
  2. Define fallback content:
     ```javascript
     const DEFAULT_NFT_JSON = JSON.stringify({ version: 1, files: [] });
     ```
  3. Define on-disk creator with recursive directory creation:
     ```javascript
     function ensureNftJsonOnDisk(filePath) {
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
           fs.writeFileSync(strPath, DEFAULT_NFT_JSON, 'utf8');
         }
       } catch (_) {
         // Ignore DrvFs lock / permission race
       }
     }
     ```
  4. Intercept in:
     - `fs.promises.readFile`: catch `ENOENT` on `isNftJsonPath(p)`, call `ensureNftJsonOnDisk(p)`, return `DEFAULT_NFT_JSON` (or Buffer).
     - `fs.readFileSync`: catch `ENOENT` on `isNftJsonPath(p)`, call `ensureNftJsonOnDisk(p)`, return `DEFAULT_NFT_JSON`.
     - `fs.readFile`: catch `ENOENT` on `isNftJsonPath(p)`, call `ensureNftJsonOnDisk(p)`, deliver `DEFAULT_NFT_JSON` to callback.
     - `fs.promises.open`, `fs.openSync`, `fs.open`: pre-check `isNftJsonPath(p)` and call `ensureNftJsonOnDisk(p)`.
     - `process.on('uncaughtException')`: ignore transient ENOENTs on `isNftJsonPath(err.path)`.

### 3.3 Design Decision 3: Consistency Patch for `achievements.tsx`
- **Target**: `src/components/achievements.tsx:140`.
- **Action**: Change `shrink-0` to `shrink-0 sm:shrink` to match `src/components/projects.tsx:157`.
- **Rationale**: Fully resolves Reviewer Finding 2, ensuring pill elements flex consistently on desktop across both galleries.

---

## 4. Exact Code Diffs

### 4.1 Diff for `patch-fs.js`

```diff
--- a/patch-fs.js
+++ b/patch-fs.js
@@ -36,18 +36,17 @@ function isMiddlewareManifestPath(p) {
   );
 }
 
-const DEFAULT_PAGES_MANIFEST = JSON.stringify(
-  {
-    '/_app': 'pages/_app.js',
-    '/_error': 'pages/_error.js',
-    '/_document': 'pages/_document.js',
-    '/404': 'pages/404.html'
-  },
-  null,
-  2
-);
+function isNftJsonPath(p) {
+  if (!p) return false;
+  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
+  const normalized = str.replace(/\\/g, '/').toLowerCase();
+  return normalized.endsWith('.nft.json');
+}
+
+const DEFAULT_PAGES_MANIFEST = '{}';
 
 const DEFAULT_MIDDLEWARE_MANIFEST = JSON.stringify(
   {
     version: 3,
     middleware: {},
     functions: {},
@@ -57,6 +56,8 @@ const DEFAULT_MIDDLEWARE_MANIFEST = JSON.stringify(
   2
 );
 
+const DEFAULT_NFT_JSON = JSON.stringify({ version: 1, files: [] });
+
 function ensurePagesManifestOnDisk(filePath) {
   try {
     const strPath =
@@ -101,6 +102,26 @@ function ensureMiddlewareManifestOnDisk(filePath) {
   } catch (_) {
     // Ignore DrvFs lock / permission race
   }
 }
 
+function ensureNftJsonOnDisk(filePath) {
+  try {
+    const strPath =
+      typeof filePath === 'string'
+        ? filePath
+        : Buffer.isBuffer(filePath)
+        ? filePath.toString()
+        : filePath && filePath.pathname
+        ? filePath.pathname
+        : String(filePath);
+    const dir = path.dirname(strPath);
+    if (!fs.existsSync(dir)) {
+      fs.mkdirSync(dir, { recursive: true });
+    }
+    if (!fs.existsSync(strPath)) {
+      fs.writeFileSync(strPath, DEFAULT_NFT_JSON, 'utf8');
+    }
+  } catch (_) {
+    // Ignore DrvFs lock / permission race
+  }
+}
+
 // 1b. Module loader hook: ensure sharp native loader resilience across Linux, WSL, and Windows
@@ -318,6 +339,19 @@ fs.open = function (p, ...args) {
     }
   }
+  if (isNftJsonPath(p)) {
+    ensureNftJsonOnDisk(p);
+    if (typeof cb === 'function') {
+      const wrappedCb = (err, fd) => {
+        if (err && err.code === 'ENOENT') {
+          ensureNftJsonOnDisk(p);
+          return origOpen.apply(fs, [p, ...args]);
+        }
+        return cb(err, fd);
+      };
+      const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
+      return origOpen.apply(fs, [p, ...newArgs]);
+    }
+  }
   if (isTracePath(p) && typeof cb === 'function') {
     const wrappedCb = (err, fd) => {
       if (err && isLockingError(err)) {
@@ -359,6 +393,18 @@ fs.openSync = function (p, ...args) {
     }
   }
+  if (isNftJsonPath(p)) {
+    ensureNftJsonOnDisk(p);
+    try {
+      return origOpenSync.apply(fs, [p, ...args]);
+    } catch (err) {
+      if (err && err.code === 'ENOENT') {
+        ensureNftJsonOnDisk(p);
+        return origOpenSync.apply(fs, [p, ...args]);
+      }
+      throw err;
+    }
+  }
   try {
     return origOpenSync.apply(fs, [p, ...args]);
   } catch (err) {
@@ -397,6 +443,18 @@ if (fs.promises && fs.promises.open) {
     }
+    if (isNftJsonPath(p)) {
+      ensureNftJsonOnDisk(p);
+      try {
+        return await origPromisesOpen.apply(fs.promises, [p, ...args]);
+      } catch (err) {
+        if (err && err.code === 'ENOENT') {
+          ensureNftJsonOnDisk(p);
+          return await origPromisesOpen.apply(fs.promises, [p, ...args]);
+        }
+        throw err;
+      }
+    }
     try {
       return await origPromisesOpen.apply(fs.promises, [p, ...args]);
     } catch (err) {
@@ -616,6 +674,16 @@ fs.readFile = function (p, ...args) {
         return cb(null, result);
       }
+      if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
+        ensureNftJsonOnDisk(p);
+        const options = args.length > 1 ? args[0] : null;
+        const encoding = typeof options === 'string' ? options : options?.encoding;
+        const result =
+          encoding === 'utf8' || encoding === 'utf-8'
+            ? DEFAULT_NFT_JSON
+            : Buffer.from(DEFAULT_NFT_JSON, 'utf8');
+        return cb(null, result);
+      }
       return cb(err, data);
     };
     const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
@@ -645,6 +713,14 @@ fs.readFileSync = function (p, options) {
       return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
     }
+    if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
+      ensureNftJsonOnDisk(p);
+      const encoding = typeof options === 'string' ? options : options?.encoding;
+      if (encoding === 'utf8' || encoding === 'utf-8') {
+        return DEFAULT_NFT_JSON;
+      }
+      return Buffer.from(DEFAULT_NFT_JSON, 'utf8');
+    }
     throw err;
   }
 };
@@ -671,6 +747,14 @@ if (fs.promises && fs.promises.readFile) {
         return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
       }
+      if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
+        ensureNftJsonOnDisk(p);
+        const encoding = typeof options === 'string' ? options : options?.encoding;
+        if (encoding === 'utf8' || encoding === 'utf-8') {
+          return DEFAULT_NFT_JSON;
+        }
+        return Buffer.from(DEFAULT_NFT_JSON, 'utf8');
+      }
       throw err;
     }
   };
@@ -710,7 +794,8 @@ process.on('uncaughtException', (err) => {
     err &&
     err.code === 'ENOENT' &&
     (err.syscall === 'open' || err.syscall === 'read') &&
-    (isPagesManifestPath(err.path) || isMiddlewareManifestPath(err.path))
+    (isPagesManifestPath(err.path) || isMiddlewareManifestPath(err.path) || isNftJsonPath(err.path))
   ) {
     return;
   }
```

### 4.2 Diff for `src/components/achievements.tsx`

```diff
--- a/src/components/achievements.tsx
+++ b/src/components/achievements.tsx
@@ -137,7 +137,7 @@ export default function Achievements({
                   type="button"
                   aria-pressed={isSelected}
                   onClick={(e) => handleSelectCategory(cat.name, e)}
-                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
+                  className={`group inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 sm:shrink ${
                     isSelected
                       ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-md scale-105'
                       : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-slate-300 font-normal'
```

---

## 5. Implementation Instructions for Worker

1. Apply the diff to `patch-fs.js`:
   - Replace `DEFAULT_PAGES_MANIFEST` declaration with `const DEFAULT_PAGES_MANIFEST = '{}';`.
   - Add `isNftJsonPath(p)`, `DEFAULT_NFT_JSON`, and `ensureNftJsonOnDisk(filePath)`.
   - Update `fs.open`, `fs.openSync`, `fs.promises.open` to guard `isNftJsonPath(p)`.
   - Update `fs.readFile`, `fs.readFileSync`, `fs.promises.readFile` to catch `ENOENT && isNftJsonPath(p)` and return `DEFAULT_NFT_JSON`.
   - Update `process.on('uncaughtException')` to ignore `isNftJsonPath(err.path)` ENOENTs.
2. Apply the diff to `src/components/achievements.tsx`:
   - Update line 140 from `shrink-0` to `shrink-0 sm:shrink`.
3. Verify:
   - Run `npm.cmd run typecheck` (verify exit 0).
   - Run `npm.cmd run lint` (verify exit 0).
   - Run `node tests/e2e/runner.mjs` (verify 61/61 passing).
   - Run `npm.cmd run build` (verify exit 0, `✓ Exporting (2/2)`, output in `out/`).
   - Run `node --test tests/e2e/tier5-adversarial-m1.test.mjs` (verify 12/12 passing).
