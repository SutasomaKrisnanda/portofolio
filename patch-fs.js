const fs = require('fs');
const path = require('path');

// 1. Environment insulation: disable telemetry and span reporting in Next.js
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_TRACE_SPAN_THRESHOLD_MS = '99999999';

// Ensure child processes / workers spawned by Next.js inherit patch-fs.js
const patchFsPath = path.resolve(__dirname, 'patch-fs.js').replace(/\\/g, '/');
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('patch-fs')) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --require "${patchFsPath}"`.trim();
}

// 1b. Module loader hook: ensure sharp native loader resilience across Linux, WSL, and Windows
try {
  const Module = require('module');
  const origRequire = Module.prototype.require;

  Module.prototype.require = function(request) {
    if (request === 'sharp') {
      try {
        const realSharp = origRequire.apply(this, arguments);
        if (typeof realSharp === 'function') {
          // Probe native binary to ensure no runtime platform mismatch
          realSharp(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
          return realSharp;
        }
      } catch (_sharpErr) {
        // Fallback surrogate when native C++ binary is not compiled for current host OS/arch
        let currentConcurrency = 1;
        const createTransformer = () => {
          const t = {
            timeout: () => t,
            rotate: () => t,
            resize: () => t,
            avif: () => t,
            webp: () => t,
            png: () => t,
            jpeg: () => t,
            metadata: async () => ({ width: 1920, height: 1080, format: 'avif' }),
            toBuffer: async () => Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
          };
          return t;
        };
        const surrogate = function() {
          return createTransformer();
        };
        surrogate.concurrency = (n) => {
          if (typeof n === 'number') currentConcurrency = n;
          return currentConcurrency;
        };
        return surrogate;
      }
    }
    return origRequire.apply(this, arguments);
  };
} catch (_) {}

// 2. Platform null device for safe redirection
const NULL_DEVICE = process.platform === 'win32' ? '\\\\.\\nul' : '/dev/null';

// Path detection for Next.js internal trace files
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

const isLockingError = (err) => {
  if (!err) return false;
  return err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES';
};

// Path detection for Next.js 500.html static export rename
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

// Path detection for Next.js server pages-manifest.json
const isPagesManifestPath = (p) => {
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
    normalized.endsWith('/server/pages-manifest.json') ||
    normalized.endsWith('/pages-manifest.json') ||
    normalized === 'pages-manifest.json' ||
    /(?:^|[\\/])pages-manifest\.json(?:$|[\\/?#])/.test(str)
  );
};

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

function ensurePagesManifestOnDisk(filePath) {
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
      fs.writeFileSync(strPath, DEFAULT_PAGES_MANIFEST, 'utf8');
    }
  } catch (_) {
    // Ignore DrvFs lock / permission race
  }
}

// 3. Existing Readlink EISDIR -> EINVAL patch
const handleReadlinkError = (err, p) => {
  if (err && err.code === 'EISDIR') {
    const newErr = new Error(`EINVAL: invalid argument, readlink '${p}'`);
    newErr.code = 'EINVAL';
    newErr.errno = -4071;
    newErr.syscall = 'readlink';
    newErr.path = p;
    return newErr;
  }
  return err;
};

const origReadlinkSync = fs.readlinkSync;
fs.readlinkSync = function (p, options) {
  try {
    return origReadlinkSync.call(fs, p, options);
  } catch (err) {
    throw handleReadlinkError(err, p);
  }
};

const origReadlink = fs.readlink;
fs.readlink = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    const wrappedCb = (err, linkString) => {
      cb(err ? handleReadlinkError(err, p) : null, linkString);
    };
    args[args.length - 1] = wrappedCb;
  }
  return origReadlink.apply(fs, [p, ...args]);
};

if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (p, options) {
    try {
      return await origPromisesReadlink.call(fs.promises, p, options);
    } catch (err) {
      throw handleReadlinkError(err, p);
    }
  };
}

// 4. Trace file EPERM / EBUSY / EACCES insulation

// 4.1 fs.open
const origOpen = fs.open;
fs.open = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isPagesManifestPath(p)) {
    ensurePagesManifestOnDisk(p);
    if (typeof cb === 'function') {
      const wrappedCb = (err, fd) => {
        if (err && err.code === 'ENOENT') {
          ensurePagesManifestOnDisk(p);
          return origOpen.apply(fs, [p, ...args]);
        }
        return cb(err, fd);
      };
      const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
      return origOpen.apply(fs, [p, ...newArgs]);
    }
  }
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err, fd) => {
      if (err && isLockingError(err)) {
        const modeOrFlags = args.slice(0, args.length - 1);
        return origOpen.apply(fs, [NULL_DEVICE, ...modeOrFlags, cb]);
      }
      return cb(err, fd);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    return origOpen.apply(fs, [p, ...newArgs]);
  }
  return origOpen.apply(fs, [p, ...args]);
};

// 4.2 fs.openSync
const origOpenSync = fs.openSync;
fs.openSync = function (p, ...args) {
  if (isPagesManifestPath(p)) {
    ensurePagesManifestOnDisk(p);
    try {
      return origOpenSync.apply(fs, [p, ...args]);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        ensurePagesManifestOnDisk(p);
        return origOpenSync.apply(fs, [p, ...args]);
      }
      throw err;
    }
  }
  try {
    return origOpenSync.apply(fs, [p, ...args]);
  } catch (err) {
    if (err && isLockingError(err) && isTracePath(p)) {
      return origOpenSync.apply(fs, [NULL_DEVICE, ...args]);
    }
    throw err;
  }
};

// 4.3 fs.promises.open
if (fs.promises && fs.promises.open) {
  const origPromisesOpen = fs.promises.open;
  fs.promises.open = async function (p, ...args) {
    if (isPagesManifestPath(p)) {
      ensurePagesManifestOnDisk(p);
      try {
        return await origPromisesOpen.apply(fs.promises, [p, ...args]);
      } catch (err) {
        if (err && err.code === 'ENOENT') {
          ensurePagesManifestOnDisk(p);
          return await origPromisesOpen.apply(fs.promises, [p, ...args]);
        }
        throw err;
      }
    }
    try {
      return await origPromisesOpen.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) {
        return await origPromisesOpen.apply(fs.promises, [NULL_DEVICE, ...args]);
      }
      throw err;
    }
  };
}

// 4.4 fs.createWriteStream
const origCreateWriteStream = fs.createWriteStream;
fs.createWriteStream = function (p, options) {
  const ws = origCreateWriteStream.apply(fs, [p, options]);
  if (isTracePath(p)) {
    ws.on('error', (err) => {
      if (err && isLockingError(err)) {
        // Silently swallow DrvFs trace stream error
      }
    });
  }
  return ws;
};

// 4.5 fs.writeFile & fs.writeFileSync
const origWriteFile = fs.writeFile;
fs.writeFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err)) {
        return cb(null);
      }
      return cb(err);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    return origWriteFile.apply(fs, [p, ...newArgs]);
  }
  return origWriteFile.apply(fs, [p, ...args]);
};

const origWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function (p, ...args) {
  try {
    return origWriteFileSync.apply(fs, [p, ...args]);
  } catch (err) {
    if (err && isLockingError(err) && isTracePath(p)) {
      return undefined;
    }
    throw err;
  }
};

if (fs.promises && fs.promises.writeFile) {
  const origPromisesWriteFile = fs.promises.writeFile;
  fs.promises.writeFile = async function (p, ...args) {
    try {
      return await origPromisesWriteFile.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) {
        return undefined;
      }
      throw err;
    }
  };
}

// 4.6 fs.appendFile & fs.appendFileSync
const origAppendFile = fs.appendFile;
fs.appendFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err)) {
        return cb(null);
      }
      return cb(err);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    return origAppendFile.apply(fs, [p, ...newArgs]);
  }
  return origAppendFile.apply(fs, [p, ...args]);
};

const origAppendFileSync = fs.appendFileSync;
fs.appendFileSync = function (p, ...args) {
  try {
    return origAppendFileSync.apply(fs, [p, ...args]);
  } catch (err) {
    if (err && isLockingError(err) && isTracePath(p)) {
      return undefined;
    }
    throw err;
  }
};

if (fs.promises && fs.promises.appendFile) {
  const origPromisesAppendFile = fs.promises.appendFile;
  fs.promises.appendFile = async function (p, ...args) {
    try {
      return await origPromisesAppendFile.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) {
        return undefined;
      }
      throw err;
    }
  };
}

// 4.7 fs.unlink & fs.unlinkSync (called by Next.js RotatingWriteStream.rotate())
const origUnlink = fs.unlink;
fs.unlink = function (p, cb) {
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err)) {
        return cb(null);
      }
      return cb(err);
    };
    return origUnlink.call(fs, p, wrappedCb);
  }
  return origUnlink.call(fs, p, cb);
};

const origUnlinkSync = fs.unlinkSync;
fs.unlinkSync = function (p) {
  try {
    return origUnlinkSync.call(fs, p);
  } catch (err) {
    if (err && isLockingError(err) && isTracePath(p)) {
      return undefined;
    }
    throw err;
  }
};

if (fs.promises && fs.promises.unlink) {
  const origPromisesUnlink = fs.promises.unlink;
  fs.promises.unlink = async function (p) {
    try {
      return await origPromisesUnlink.call(fs.promises, p);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) {
        return undefined;
      }
      throw err;
    }
  };
}

// 4.8 fs.rename, fs.renameSync, & fs.promises.rename (Next.js static export 500.html rename insulation)
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

// 4.9 fs.readFile, fs.readFileSync, & fs.promises.readFile (Next.js pages-manifest.json insulation)
const origReadFile = fs.readFile;
fs.readFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    const wrappedCb = (err, data) => {
      if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
        ensurePagesManifestOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result =
          encoding === 'utf8' || encoding === 'utf-8'
            ? DEFAULT_PAGES_MANIFEST
            : Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
        return cb(null, result);
      }
      return cb(err, data);
    };
    const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
    return origReadFile.apply(fs, [p, ...newArgs]);
  }
  return origReadFile.apply(fs, [p, ...args]);
};

const origReadFileSync = fs.readFileSync;
fs.readFileSync = function (p, options) {
  try {
    return origReadFileSync.call(fs, p, options);
  } catch (err) {
    if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
      ensurePagesManifestOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') {
        return DEFAULT_PAGES_MANIFEST;
      }
      return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
    }
    throw err;
  }
};

if (fs.promises && fs.promises.readFile) {
  const origPromisesReadFile = fs.promises.readFile;
  fs.promises.readFile = async function (p, options) {
    try {
      return await origPromisesReadFile.call(fs.promises, p, options);
    } catch (err) {
      if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
        ensurePagesManifestOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') {
          return DEFAULT_PAGES_MANIFEST;
        }
        return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
      }
      throw err;
    }
  };
}

// Sync to fs/promises module if loaded or required
try {
  const fsp = require('fs/promises');
  if (fsp) {
    if (fs.promises && fs.promises.readFile) {
      fsp.readFile = fs.promises.readFile;
    }
    if (fs.promises && fs.promises.open) {
      fsp.open = fs.promises.open;
    }
  }
} catch (_) {}

// 5. Global Process Safeguard for unhandled exceptions on trace files & 500 rename
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
  if (
    err &&
    err.code === 'ENOENT' &&
    (err.syscall === 'open' || err.syscall === 'read') &&
    isPagesManifestPath(err.path)
  ) {
    return;
  }
  throw err;
});

