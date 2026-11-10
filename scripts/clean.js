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

function removeTarget(targetName) {
  const targetPath = path.join(PROJECT_ROOT, targetName);

  if (!fs.existsSync(targetPath)) {
    return;
  }

  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      // fs.rmSync with maxRetries handles Windows DrvFs transient file locks natively
      fs.rmSync(targetPath, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 150,
      });

      // Verify removal
      if (!fs.existsSync(targetPath)) {
        const elapsed = Date.now() - startTime;
        console.log(`[clean] Successfully removed ${targetName} (${elapsed}ms)`);
        return;
      }
    } catch (err) {
      if (attempts >= maxAttempts) {
        console.error(`[clean] Error: Unable to remove ${targetName}: ${err.message}`);
        if (fs.existsSync(targetPath)) {
          throw err;
        }
        return;
      }
    }

    // Windows DrvFs Fallback: If directory remains stubbornly locked on attempt >= 3,
    // try renaming to a temporary trash folder to vacate the target path immediately.
    if (attempts >= 3 && fs.existsSync(targetPath)) {
      try {
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
          const trashPath = `${targetPath}.trash.${Date.now()}`;
          fs.renameSync(targetPath, trashPath);
          console.log(`[clean] Renamed locked directory ${targetName} -> ${path.basename(trashPath)}`);
          try {
            fs.rmSync(trashPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
          } catch (_) {
            // Background cleanup will handle any leftover trash folder
          }
          if (!fs.existsSync(targetPath)) {
            const elapsed = Date.now() - startTime;
            console.log(`[clean] Successfully vacated ${targetName} via rename fallback (${elapsed}ms)`);
            return;
          }
        }
      } catch (_) {
        // Ignore rename failure and proceed to exponential backoff wait
      }
    }

    // Synchronous exponential backoff before retry (200ms, 300ms, 450ms, 675ms, 1000ms)
    // Ensures Windows DrvFs / NTFS has sufficient time to release background file handles
    const delay = Math.min(Math.round(200 * Math.pow(1.5, attempts - 1)), 1000);
    const waitTill = Date.now() + delay;
    while (Date.now() < waitTill) {
      /* wait */
    }
  }

  if (fs.existsSync(targetPath)) {
    throw new Error(`[clean] Target "${targetName}" still exists after ${maxAttempts} attempts.`);
  }
}

const removeDirectory = removeTarget;

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
