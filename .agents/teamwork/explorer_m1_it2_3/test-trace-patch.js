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

// Simulate real underlying fs that throws EPERM when opening '.next/trace'
let simulateEperm = true;
const realFsOpen = fs.open;
const underlyingOpen = function (p, ...args) {
  const cb = args[args.length - 1];
  if (simulateEperm && isTracePath(p) && typeof cb === 'function') {
    const err = new Error("EPERM: operation not permitted, open '" + p + "'");
    err.code = 'EPERM';
    err.errno = -4048;
    err.syscall = 'open';
    err.path = p;
    // invoke callback asynchronously like real Node fs.open
    setImmediate(() => cb(err));
    return;
  }
  return realFsOpen.apply(fs, [p, ...args]);
};

// Now install our patch on top of underlyingOpen:
fs.open = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err, fd) => {
      if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES')) {
        console.log(`[patch-fs] Caught ${err.code} on trace open (${p}), safely falling back to NULL_DEVICE (${NULL_DEVICE})`);
        const modeOrFlags = args.slice(0, args.length - 1);
        return realFsOpen.apply(fs, [NULL_DEVICE, ...modeOrFlags, cb]);
      }
      return cb(err, fd);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    return underlyingOpen.apply(fs, [p, ...newArgs]);
  }
  return underlyingOpen.apply(fs, [p, ...args]);
};

// Patch fs.openSync
const realFsOpenSync = fs.openSync;
fs.openSync = function (p, ...args) {
  try {
    if (simulateEperm && isTracePath(p)) {
      const err = new Error("EPERM: operation not permitted, openSync '" + p + "'");
      err.code = 'EPERM';
      throw err;
    }
    return realFsOpenSync.apply(fs, [p, ...args]);
  } catch (err) {
    if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && isTracePath(p)) {
      console.log(`[patch-fs] Caught ${err.code} on trace openSync (${p}), falling back to NULL_DEVICE`);
      return realFsOpenSync.apply(fs, [NULL_DEVICE, ...args]);
    }
    throw err;
  }
};

// Patch fs.promises.open
if (fs.promises && fs.promises.open) {
  const realPromisesOpen = fs.promises.open;
  fs.promises.open = async function (p, ...args) {
    try {
      if (simulateEperm && isTracePath(p)) {
        const err = new Error("EPERM: operation not permitted, promises.open '" + p + "'");
        err.code = 'EPERM';
        throw err;
      }
      return await realPromisesOpen.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && isTracePath(p)) {
        console.log(`[patch-fs] Caught ${err.code} on trace promises.open (${p}), falling back to NULL_DEVICE`);
        return await realPromisesOpen.apply(fs.promises, [NULL_DEVICE, ...args]);
      }
      throw err;
    }
  };
}

// Patch fs.writeFileSync
const realWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function (p, ...args) {
  try {
    if (simulateEperm && isTracePath(p)) {
      const err = new Error("EPERM: operation not permitted, writeFileSync '" + p + "'");
      err.code = 'EPERM';
      throw err;
    }
    return realWriteFileSync.apply(fs, [p, ...args]);
  } catch (err) {
    if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && isTracePath(p)) {
      console.log(`[patch-fs] Caught ${err.code} on trace writeFileSync (${p}), safely ignoring`);
      return undefined;
    }
    throw err;
  }
};

// Patch fs.writeFile
const realWriteFile = fs.writeFile;
fs.writeFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES')) {
        console.log(`[patch-fs] Caught ${err.code} on trace writeFile (${p}), safely ignoring`);
        return cb(null);
      }
      return cb(err);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    if (simulateEperm) {
      const err = new Error("EPERM: operation not permitted, writeFile '" + p + "'");
      err.code = 'EPERM';
      setImmediate(() => wrappedCb(err));
      return;
    }
    return realWriteFile.apply(fs, [p, ...newArgs]);
  }
  return realWriteFile.apply(fs, [p, ...args]);
};

// Patch fs.promises.writeFile
if (fs.promises && fs.promises.writeFile) {
  const realPromisesWriteFile = fs.promises.writeFile;
  fs.promises.writeFile = async function (p, ...args) {
    try {
      if (simulateEperm && isTracePath(p)) {
        const err = new Error("EPERM: operation not permitted, promises.writeFile '" + p + "'");
        err.code = 'EPERM';
        throw err;
      }
      return await realPromisesWriteFile.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && isTracePath(p)) {
        console.log(`[patch-fs] Caught ${err.code} on trace promises.writeFile (${p}), safely ignoring`);
        return undefined;
      }
      throw err;
    }
  };
}

// Patch fs.unlinkSync
const realUnlinkSync = fs.unlinkSync;
fs.unlinkSync = function (p) {
  try {
    if (simulateEperm && isTracePath(p)) {
      const err = new Error("EPERM: operation not permitted, unlinkSync '" + p + "'");
      err.code = 'EPERM';
      throw err;
    }
    return realUnlinkSync.call(fs, p);
  } catch (err) {
    if (err && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && isTracePath(p)) {
      console.log(`[patch-fs] Caught ${err.code} on trace unlinkSync (${p}), safely ignoring`);
      return undefined;
    }
    throw err;
  }
};

// Also attach uncaughtException safeguard
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'EPERM' || err.code === 'EBUSY') && isTracePath(err.path)) {
    console.log(`[patch-fs] Caught uncaughtException on trace path (${err.path}), swallowing`);
    return;
  }
  console.error('Real uncaughtException:', err);
  process.exit(1);
});

async function runTest() {
  console.log('=== TEST 1: createWriteStream with simulated DrvFs EPERM ===');
  const ws = fs.createWriteStream('.next/trace', { flags: 'a' });
  await new Promise((resolve, reject) => {
    ws.on('error', (err) => {
      console.error('TEST 1 FAILED: ws emitted error:', err);
      reject(err);
    });
    ws.write('{"name":"next-build","id":1,"duration":120}\n');
    ws.write('{"name":"webpack-compile","id":2,"duration":450}\n');
    ws.end(() => {
      console.log('TEST 1 SUCCESS: ws ended cleanly without error!');
      resolve();
    });
  });

  console.log('=== TEST 2: openSync with simulated DrvFs EPERM ===');
  const fd = fs.openSync('.next/trace', 'a');
  console.log('TEST 2 SUCCESS: openSync returned valid fd:', fd);
  fs.writeSync(fd, 'sync trace entry\n');
  fs.closeSync(fd);
  console.log('TEST 2 SUCCESS: writeSync and closeSync completed cleanly!');

  console.log('=== TEST 3: promises.open with simulated DrvFs EPERM ===');
  const fh = await fs.promises.open('.next/trace', 'a');
  console.log('TEST 3 SUCCESS: promises.open returned filehandle:', fh.fd);
  await fh.writeFile('promises trace entry\n');
  await fh.close();
  console.log('TEST 3 SUCCESS: async filehandle operations completed cleanly!');

  console.log('=== TEST 4: writeFileSync with simulated DrvFs EPERM ===');
  fs.writeFileSync('.next/trace', 'sync data');
  console.log('TEST 4 SUCCESS: writeFileSync handled smoothly!');

  console.log('=== TEST 5: promises.writeFile with simulated DrvFs EPERM ===');
  await fs.promises.writeFile('.next/trace', 'async data');
  console.log('TEST 5 SUCCESS: promises.writeFile handled smoothly!');

  console.log('=== TEST 6: writeFile with callback with simulated DrvFs EPERM ===');
  await new Promise((resolve, reject) => {
    fs.writeFile('.next/trace', 'callback data', (err) => {
      if (err) return reject(err);
      console.log('TEST 6 SUCCESS: writeFile callback completed cleanly with null error!');
      resolve();
    });
  });

  console.log('=== TEST 7: unlinkSync with simulated DrvFs EPERM ===');
  fs.unlinkSync('.next/trace');
  console.log('TEST 7 SUCCESS: unlinkSync handled smoothly without throwing!');

  console.log('\n===========================================');
  console.log('🏆 ALL 7 DRVFS EPERM TEST SUITES PASSED! 🏆');
  console.log('===========================================');
}

runTest().catch((e) => {
  console.error('TEST RUNNER FAILED:', e);
  process.exit(1);
});
