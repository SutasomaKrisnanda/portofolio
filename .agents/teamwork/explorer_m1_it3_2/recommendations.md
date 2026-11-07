# Recommendation Report: package.json Script Deduplication Architecture

- **Author**: `teamwork_explorer_2` (Milestone 1 Iteration 3: package.json Script Deduplication Architect)
- **Target File**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\package.json`
- **Date**: 2026-11-05
- **Working Directory**: `w:\home\krisnanda\Code\Project\Personal - github\portofolio\.agents\teamwork\explorer_m1_it3_2\`
- **Recipient**: Parent Orchestrator (`514f318a-382e-4a4c-bf5e-58e0d0eff1f1`) & Worker M1 Iteration 3

---

## 1. Executive Summary

During Milestone 1 Iteration 2, both the Quality Reviewer (`reviewer_m1_it2_2`) and the Adversarial Challenger (`challenger_m1_it2_2`) identified a fatal double-clean race condition in `package.json`.

In the current `package.json`:
- Line 10 defines `"prebuild": "node scripts/clean.js"`
- Line 11 defines `"build": "node scripts/clean.js && node -r ./patch-fs.js node_modules/next/dist/bin/next build"`

Whenever `npm run build` is invoked, NPM's lifecycle engine triggers `prebuild`, which runs `node scripts/clean.js`. Immediately upon completion, NPM triggers `build`, which unnecessarily executes `node scripts/clean.js` a second time before spawning Next.js.

On Windows DrvFs / 9P / NTFS filesystems, rapidly spawning back-to-back directory deletion processes creates file handle locks, delays in OS directory release, and intermittent `ENOENT` / file collision errors (such as `ENOENT: build-manifest.json` or Webpack cache rename conflicts observed in Iteration 2).

This report specifies the clean, standard, deduplicated configuration for `package.json`, provides technical proof of npm lifecycle guarantees, and delivers exact, copy-pasteable instructions for the Worker.

---

## 2. Root Cause & Empirical Evidence

### 2.1 The Double-Clean Execution Trace
In Challenger's test run (`challenger_m1_it2_2/handoff.md:18–30`), the verbatim output of `npm.cmd run build` was:

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

### 2.2 Why Double-Clean Causes Catastrophic Race Conditions
1. **Windows DrvFs / NTFS Transient Locks**:
   `scripts/clean.js` uses `fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })`. While `fs.rmSync` removes directory entries, Windows kernel handles (e.g. from Antivirus, search indexers, or parent shell polling) may linger for several tens or hundreds of milliseconds.
2. **Consecutive Process Collisions**:
   Launching a second Node process to delete `.next` within milliseconds of the first process exiting means the second process either attempts to inspect directories still in torn-down states or wastes CPU and I/O cycles.
3. **Cache Manifest Collision**:
   When Next.js compiler workers initialize immediately after the second clean, background file operations can race with Next.js generating `build-manifest.json` and page outputs, resulting in unhandled `ENOENT` errors as observed in Reviewer's Task 44.

---

## 3. Recommended `package.json` Configuration

The standard, idiomatic NPM lifecycle architecture separates concerns cleanly:

```json
    "clean": "node scripts/clean.js",
    "prebuild": "node scripts/clean.js",
    "build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build",
```

### 3.1 Script Responsibilities & Boundary Definition

| Script Name | Command | Purpose & Lifecycle Role |
|-------------|---------|--------------------------|
| `"clean"` | `node scripts/clean.js` | **Manual / Standalone utility**. Allows developers and CI workflows to purge build artifacts (`.next` and `out`) on demand via `npm run clean` without triggering a build. |
| `"prebuild"` | `node scripts/clean.js` | **Automated Lifecycle Hook**. Automatically executed by NPM whenever `npm run build` is called. Guarantees the build environment is 100% clean before Next.js starts. |
| `"build"` | `node -r ./patch-fs.js node_modules/next/dist/bin/next build` | **Core Build Command**. Executes the Next.js static production build with `patch-fs.js` preloaded. Free of cleanup logic, ensuring clean separation of concerns and eliminating duplicate execution. |

---

## 4. Technical Analysis: NPM Lifecycle Execution Mechanics

### 4.1 NPM Lifecycle Specification
According to the official NPM documentation on `scripts`:
- For any arbitrary script `<name>`, NPM recognizes `pre<name>` and `post<name>` hooks.
- When `npm run <name>` (or `npm.cmd run <name>`) is called:
  1. NPM searches `package.json` for `pre<name>`.
  2. If found, NPM spawns a child shell and synchronously executes `pre<name>`.
  3. **Strict Sequencing**: NPM blocks until `pre<name>` exits.
     - If `pre<name>` exits with a **non-zero code**, NPM halts immediately. `<name>` is **never** executed.
     - If `pre<name>` exits with **code 0**, NPM proceeds to execute `<name>`.
  4. NPM executes `<name>`.
  5. If `<name>` exits with **code 0**, NPM executes `post<name>` (if present).

### 4.2 Elimination of Race Conditions
By stripping `node scripts/clean.js && ` from `"build"`:
1. **Single Invocation**: `node scripts/clean.js` executes **exactly once** during `npm run build`.
2. **Full Completion Guarantee**: NPM does not start `build` until `prebuild` has completely exited and all its process handles and filesystem locks have been released back to the OS.
3. **Clean Slate for Next.js**: When `build` starts, `.next` and `out` have already been purged and verified by `clean.js`, and no other cleaning process is running or scheduled.
4. **Developer Flexibility**: If a developer or CI job ever wants to run an incremental build without wiping `.next`, they can invoke `node -r ./patch-fs.js node_modules/next/dist/bin/next build` directly. However, standard execution via `npm run build` will always perform a clean build via `prebuild`.

---

## 5. Exact Instructions for the Worker

### 5.1 Target File & Exact Edit
- **File**: `package.json`
- **Location**: Lines 9–11

#### Before (Existing Content):
```json
    "clean": "node scripts/clean.js",
    "prebuild": "node scripts/clean.js",
    "build": "node scripts/clean.js && node -r ./patch-fs.js node_modules/next/dist/bin/next build",
```

#### After (Target Content):
```json
    "clean": "node scripts/clean.js",
    "prebuild": "node scripts/clean.js",
    "build": "node -r ./patch-fs.js node_modules/next/dist/bin/next build",
```

### 5.2 Verification Commands for Worker
The Worker should execute the following sequence to verify the change:

```powershell
# 1. Validate JSON syntax
node -e "JSON.parse(fs.readFileSync('package.json', 'utf8')); console.log('package.json syntax OK');"

# 2. Inspect registered scripts via npm
npm.cmd run

# 3. Test standalone clean
npm.cmd run clean

# 4. Test production build (must show clean.js running EXACTLY ONCE under 'prebuild', NOT under 'build')
npm.cmd run build

# Expected Output Pattern:
# > nextn@0.1.0 prebuild
# > node scripts/clean.js
# [clean] Preparing clean build environment in: ...
# [clean] Successfully removed ...
# [clean] Cleanup complete. Workspace ready for build.
#
# > nextn@0.1.0 build
# > node -r ./patch-fs.js node_modules/next/dist/bin/next build
#    ▲ Next.js 15.5.6
#    Creating an optimized production build ...
```

---

## 6. Summary Checklist for Worker

- [ ] Modify `package.json` line 11: change `"build"` to `"node -r ./patch-fs.js node_modules/next/dist/bin/next build"`.
- [ ] Ensure `"clean": "node scripts/clean.js"` and `"prebuild": "node scripts/clean.js"` remain intact.
- [ ] Ensure JSON syntax remains valid with no trailing commas or syntax errors.
- [ ] Run `npm.cmd run clean` and confirm exit code 0.
- [ ] Run `npm.cmd run build` and confirm `clean.js` executes only once during `prebuild`.
