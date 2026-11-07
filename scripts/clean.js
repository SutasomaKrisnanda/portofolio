/**
 * scripts/clean.js
 *
 * Cross-platform, zero-dependency build artifact cleaner.
 * Reliably removes `.next` and `out` directories across Windows PowerShell,
 * Windows CMD, and WSL/Linux before Next.js builds.
 *
 * Prevents Windows WSL 9P incremental cache corruption, stale manifest
 * collisions, and leftover export artifacts without external dependencies.
 */

const fs = require('fs');
const path = require('path');

function findProjectRoot(startDir) {
  let curr = startDir;
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'package.json'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot(__dirname);
const TARGETS = ['.next', 'out', 'tsconfig.tsbuildinfo'];

function removeDirectory(dirName) {
  const dirPath = path.join(PROJECT_ROOT, dirName);

  if (!fs.existsSync(dirPath)) {
    return;
  }

  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      // fs.rmSync with maxRetries handles Windows DrvFs transient file locks
      fs.rmSync(dirPath, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 100,
      });

      // Verify removal
      if (!fs.existsSync(dirPath)) {
        const elapsed = Date.now() - startTime;
        console.log(`[clean] Successfully removed ${dirName} (${elapsed}ms)`);
        return;
      }
    } catch (err) {
      if (attempts >= maxAttempts) {
        console.error(`[clean] Error: Unable to remove ${dirName}: ${err.message}`);
        if (fs.existsSync(dirPath)) {
          throw err;
        }
      }
      // Synchronous backoff before retry to allow background lock release
      const waitTill = Date.now() + 200;
      while (Date.now() < waitTill) {
        /* wait */
      }
    }
  }
}

function ensureBinPermissions() {
  if (process.platform === 'win32') {
    return;
  }
  const binDir = path.join(PROJECT_ROOT, 'node_modules', '.bin');
  if (fs.existsSync(binDir)) {
    try {
      const files = fs.readdirSync(binDir);
      for (const file of files) {
        try {
          fs.chmodSync(path.join(binDir, file), 0o755);
        } catch (_) {}
      }
    } catch (_) {}
  }
}

function clean() {
  console.log('[clean] Preparing clean build environment in: ' + PROJECT_ROOT);
  ensureBinPermissions();
  for (const target of TARGETS) {
    try {
      removeDirectory(target);
    } catch (err) {
      console.error(`[clean] Fatal: Failed to clean target "${target}":`, err.message);
      process.exit(1);
    }
  }
  console.log('[clean] Cleanup complete. Workspace ready for build.');
}

if (require.main === module) {
  clean();
}

module.exports = { clean };
