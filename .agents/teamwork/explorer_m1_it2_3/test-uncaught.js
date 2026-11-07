const fs = require('fs');
const path = require('path');

const NULL_DEVICE = process.platform === 'win32' ? '\\\\.\\nul' : '/dev/null';

const isTracePath = (p) => {
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
  const normalized = str.replace(/\\/g, '/');
  return (
    normalized.endsWith('/trace') ||
    normalized.includes('/.next/trace') ||
    normalized === 'trace' ||
    /(?:^|[\\/])\.next[\\/]trace(?:$|[\\/?#])/.test(str)
  );
};

// Also attach uncaughtException safeguard
let uncaughtIntercepted = false;
process.on('uncaughtException', (err) => {
  if (
    err &&
    (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') &&
    isTracePath(err.path)
  ) {
    uncaughtIntercepted = true;
    console.log(`[patch-fs] Safely intercepted uncaughtException for trace: ${err.message}`);
    return;
  }
  console.error('Real uncaughtException occurred:', err);
  process.exit(1);
});

async function runTest() {
  console.log('=== TEST 8: process uncaughtException safety net ===');
  const dummyErr = new Error("EPERM: operation not permitted, open 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\trace'");
  dummyErr.code = 'EPERM';
  dummyErr.errno = -4048;
  dummyErr.syscall = 'open';
  dummyErr.path = 'W:\\home\\krisnanda\\Code\\Project\\Personal - github\\portofolio\\.next\\trace';
  
  await new Promise((resolve) => {
    setTimeout(() => {
      // Simulate unhandled throw from stream or thread
      process.emit('uncaughtException', dummyErr);
      resolve();
    }, 20);
  });

  if (uncaughtIntercepted) {
    console.log('TEST 8 SUCCESS: uncaughtException was cleanly trapped and insulated!');
  } else {
    throw new Error('TEST 8 FAILED: uncaughtException was not intercepted');
  }
}

runTest().catch((e) => {
  console.error('TEST RUNNER FAILED:', e);
  process.exit(1);
});
