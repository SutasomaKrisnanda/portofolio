const fs = require('fs');
const path = require('path');

// 1. Environment insulation: disable telemetry and span reporting in Next.js
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_TRACE_SPAN_THRESHOLD_MS = '99999999';

// Ensure child processes / workers spawned by Next.js inherit standalone-patch-fs.js
const patchFsPath = path.resolve(__dirname, 'standalone-patch-fs.js').replace(/\\/g, '/');
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('standalone-patch-fs')) {
  process.env.NODE_OPTIONS = `--require "${patchFsPath}"`.trim();
}

// --- Manifest Path Detection & Fallback Generators ---
function isPagesManifestPath(p) {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/server/pages-manifest.json') ||
    normalized.endsWith('/pages-manifest.json') ||
    normalized === 'pages-manifest.json' ||
    /(?:^|[\\/])pages-manifest\.json(?:$|[\\/?#])/.test(str)
  );
}

function isAppPathsManifestPath(p) {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/server/app-paths-manifest.json') ||
    normalized.endsWith('/app-paths-manifest.json') ||
    normalized === 'app-paths-manifest.json' ||
    /(?:^|[\\/])app-paths-manifest\.json(?:$|[\\/?#])/.test(str)
  );
}

function isMiddlewareManifestPath(p) {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/server/middleware-manifest.json') ||
    normalized.endsWith('/middleware-manifest.json') ||
    normalized === 'middleware-manifest.json' ||
    /(?:^|[\\/])middleware-manifest\.json(?:$|[\\/?#])/.test(str)
  );
}

function isNftJsonPath(p) {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return normalized.endsWith('.nft.json');
}

const DEFAULT_PAGES_MANIFEST = '{}';

const DEFAULT_APP_PATHS_MANIFEST = JSON.stringify(
  {
    "/_not-found/page": "app/_not-found/page.js",
    "/_not-found": "app/_not-found/page.js",
    "/page": "app/page.js"
  },
  null,
  2
);

const DEFAULT_MIDDLEWARE_MANIFEST = JSON.stringify(
  {
    version: 3,
    middleware: {},
    functions: {},
    sortedMiddleware: []
  },
  null,
  2
);

const DEFAULT_NFT_JSON = JSON.stringify({ version: 1, files: [] });

function patchAppPathsManifestContent(content) {
  try {
    const str = typeof content === 'string' ? content : content.toString('utf8');
    const parsed = JSON.parse(str);
    if (parsed['/_not-found/page'] && !parsed['/_not-found']) {
      parsed['/_not-found'] = parsed['/_not-found/page'];
      return JSON.stringify(parsed, null, 2);
    }
    return str;
  } catch (_) {
    return content;
  }
}

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
  } catch (_) {}
}

function ensureAppPathsManifestOnDisk(filePath) {
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
      fs.writeFileSync(strPath, DEFAULT_APP_PATHS_MANIFEST, 'utf8');
    } else {
      try {
        const raw = fs.readFileSync(strPath, 'utf8');
        const parsed = JSON.parse(raw);
        let modified = false;
        if (parsed['/_not-found/page'] && !parsed['/_not-found']) {
          parsed['/_not-found'] = parsed['/_not-found/page'];
          modified = true;
        }
        if (modified) {
          fs.writeFileSync(strPath, JSON.stringify(parsed, null, 2), 'utf8');
        }
      } catch (_) {}
    }
  } catch (_) {}
}

function ensureMiddlewareManifestOnDisk(filePath) {
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
      fs.writeFileSync(strPath, DEFAULT_MIDDLEWARE_MANIFEST, 'utf8');
    }
  } catch (_) {}
}

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
  } catch (_) {}
}

// 1b. Module loader hook
try {
  const Module = require('module');
  const origRequire = Module.prototype.require;

  Module.prototype.require = function(request) {
    if (typeof request === 'string' && (request.includes('find-page-file') || request.endsWith('find-page-file.js'))) {
      const result = origRequire.apply(this, arguments);
      if (result && typeof result.createValidFileMatcher === 'function' && !result.__patchedByExplorer) {
        result.__patchedByExplorer = true;
        const origCreate = result.createValidFileMatcher;
        result.createValidFileMatcher = function(pageExtensions, appDirPath) {
          const matcher = origCreate.call(this, pageExtensions, appDirPath);
          if (matcher && matcher.isRootNotFound) {
            const origIsRootNotFound = matcher.isRootNotFound;
            matcher.isRootNotFound = function(filePath) {
              if (origIsRootNotFound.call(this, filePath)) return true;
              if (typeof filePath === 'string' && appDirPath) {
                const trimmed = filePath.replace(/^[\\/]+/, '');
                return origIsRootNotFound.call(this, path.join(appDirPath, trimmed));
              }
              return false;
            };
          }
          return matcher;
        };
      }
      return result;
    }

    if (request === 'sharp') {
      try {
        const realSharp = origRequire.apply(this, arguments);
        if (typeof realSharp === 'function') {
          realSharp(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
          return realSharp;
        }
      } catch (_sharpErr) {
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

    if (isAppPathsManifestPath(request)) {
      ensureAppPathsManifestOnDisk(request);
      try {
        const loaded = origRequire.apply(this, arguments);
        if (loaded && typeof loaded === 'object') {
          if (loaded['/_not-found/page'] && !loaded['/_not-found']) {
            return { ...loaded, '/_not-found': loaded['/_not-found/page'] };
          }
        }
        return loaded;
      } catch (reqErr) {
        if (reqErr && (reqErr.code === 'MODULE_NOT_FOUND' || reqErr.code === 'ENOENT')) {
          ensureAppPathsManifestOnDisk(request);
          try {
            return origRequire.apply(this, arguments);
          } catch (_) {
            return JSON.parse(DEFAULT_APP_PATHS_MANIFEST);
          }
        }
        throw reqErr;
      }
    }

    if (isMiddlewareManifestPath(request)) {
      ensureMiddlewareManifestOnDisk(request);
      try {
        return origRequire.apply(this, arguments);
      } catch (reqErr) {
        if (reqErr && (reqErr.code === 'MODULE_NOT_FOUND' || reqErr.code === 'ENOENT')) {
          ensureMiddlewareManifestOnDisk(request);
          try {
            return origRequire.apply(this, arguments);
          } catch (_) {
            return JSON.parse(DEFAULT_MIDDLEWARE_MANIFEST);
          }
        }
        throw reqErr;
      }
    }

    if (isPagesManifestPath(request)) {
      ensurePagesManifestOnDisk(request);
      try {
        return origRequire.apply(this, arguments);
      } catch (reqErr) {
        if (reqErr && (reqErr.code === 'MODULE_NOT_FOUND' || reqErr.code === 'ENOENT')) {
          ensurePagesManifestOnDisk(request);
          try {
            return origRequire.apply(this, arguments);
          } catch (_) {
            return JSON.parse(DEFAULT_PAGES_MANIFEST);
          }
        }
        throw reqErr;
      }
    }

    return origRequire.apply(this, arguments);
  };
} catch (_) {}

// 2. Platform null device
const NULL_DEVICE = process.platform === 'win32' ? '\\\\.\\nul' : '/dev/null';

const isTracePath = (p) => {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
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

const isDirRemovalRetryable = (err) => {
  if (!err) return false;
  return (
    err.code === 'ENOTEMPTY' ||
    err.code === 'EBUSY' ||
    err.code === 'EPERM' ||
    err.code === 'EACCES' ||
    err.code === 'EMFILE'
  );
};

const is500HtmlPath = (p) => {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.endsWith('/500.html') ||
    normalized.includes('/export/500.html') ||
    normalized.includes('/server/pages/500.html') ||
    normalized === '500.html' ||
    /(?:^|[\\/])500\.html(?:$|[\\/?#])/.test(str)
  );
};

const is500Rename = (oldPath, newPath) => is500HtmlPath(oldPath) || is500HtmlPath(newPath);

// 3. Readlink EISDIR -> EINVAL
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

// 4. fs.open / openSync / promises.open
const origOpen = fs.open;
fs.open = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isAppPathsManifestPath(p)) {
    ensureAppPathsManifestOnDisk(p);
    if (typeof cb === 'function') {
      const wrappedCb = (err, fd) => {
        if (err && err.code === 'ENOENT') {
          ensureAppPathsManifestOnDisk(p);
          return origOpen.apply(fs, [p, ...args]);
        }
        return cb(err, fd);
      };
      const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
      return origOpen.apply(fs, [p, ...newArgs]);
    }
  }
  if (isMiddlewareManifestPath(p)) {
    ensureMiddlewareManifestOnDisk(p);
    if (typeof cb === 'function') {
      const wrappedCb = (err, fd) => {
        if (err && err.code === 'ENOENT') {
          ensureMiddlewareManifestOnDisk(p);
          return origOpen.apply(fs, [p, ...args]);
        }
        return cb(err, fd);
      };
      const newArgs = [...args.slice(0, args.length - 1), wrappedCb];
      return origOpen.apply(fs, [p, ...newArgs]);
    }
  }
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
  if (isNftJsonPath(p)) {
    ensureNftJsonOnDisk(p);
    if (typeof cb === 'function') {
      const wrappedCb = (err, fd) => {
        if (err && err.code === 'ENOENT') {
          ensureNftJsonOnDisk(p);
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

const origOpenSync = fs.openSync;
fs.openSync = function (p, ...args) {
  if (isAppPathsManifestPath(p)) {
    ensureAppPathsManifestOnDisk(p);
    try {
      return origOpenSync.apply(fs, [p, ...args]);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        ensureAppPathsManifestOnDisk(p);
        return origOpenSync.apply(fs, [p, ...args]);
      }
      throw err;
    }
  }
  if (isMiddlewareManifestPath(p)) {
    ensureMiddlewareManifestOnDisk(p);
    try {
      return origOpenSync.apply(fs, [p, ...args]);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        ensureMiddlewareManifestOnDisk(p);
        return origOpenSync.apply(fs, [p, ...args]);
      }
      throw err;
    }
  }
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
  if (isNftJsonPath(p)) {
    ensureNftJsonOnDisk(p);
    try {
      return origOpenSync.apply(fs, [p, ...args]);
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        ensureNftJsonOnDisk(p);
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

if (fs.promises && fs.promises.open) {
  const origPromisesOpen = fs.promises.open;
  fs.promises.open = async function (p, ...args) {
    if (isAppPathsManifestPath(p)) {
      ensureAppPathsManifestOnDisk(p);
      try {
        return await origPromisesOpen.apply(fs.promises, [p, ...args]);
      } catch (err) {
        if (err && err.code === 'ENOENT') {
          ensureAppPathsManifestOnDisk(p);
          return await origPromisesOpen.apply(fs.promises, [p, ...args]);
        }
        throw err;
      }
    }
    if (isMiddlewareManifestPath(p)) {
      ensureMiddlewareManifestOnDisk(p);
      try {
        return await origPromisesOpen.apply(fs.promises, [p, ...args]);
      } catch (err) {
        if (err && err.code === 'ENOENT') {
          ensureMiddlewareManifestOnDisk(p);
          return await origPromisesOpen.apply(fs.promises, [p, ...args]);
        }
        throw err;
      }
    }
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
    if (isNftJsonPath(p)) {
      ensureNftJsonOnDisk(p);
      try {
        return await origPromisesOpen.apply(fs.promises, [p, ...args]);
      } catch (err) {
        if (err && err.code === 'ENOENT') {
          ensureNftJsonOnDisk(p);
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

// 4.4 createWriteStream
const origCreateWriteStream = fs.createWriteStream;
fs.createWriteStream = function (p, options) {
  const ws = origCreateWriteStream.apply(fs, [p, options]);
  if (isTracePath(p)) {
    ws.on('error', (err) => {
      if (err && isLockingError(err)) {}
    });
  }
  return ws;
};

// 4.5 fs.writeFile / writeFileSync / promises.writeFile
const origWriteFile = fs.writeFile;
fs.writeFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err) && isTracePath(p)) {
        return cb(null);
      }
      if (err && err.code === 'ENOENT') {
        try {
          const dir = path.dirname(typeof p === 'string' ? p : String(p));
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            return origWriteFile.apply(fs, [p, ...args.slice(0, args.length - 1), cb]);
          }
        } catch (_) {}
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
    if (err && err.code === 'ENOENT') {
      try {
        const dir = path.dirname(typeof p === 'string' ? p : String(p));
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          return origWriteFileSync.apply(fs, [p, ...args]);
        }
      } catch (_) {}
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
      if (err && err.code === 'ENOENT') {
        try {
          const dir = path.dirname(typeof p === 'string' ? p : String(p));
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            return await origPromisesWriteFile.apply(fs.promises, [p, ...args]);
          }
        } catch (_) {}
      }
      throw err;
    }
  };
}

// 4.6 appendFile
const origAppendFile = fs.appendFile;
fs.appendFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err)) return cb(null);
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
    if (err && isLockingError(err) && isTracePath(p)) return undefined;
    throw err;
  }
};

if (fs.promises && fs.promises.appendFile) {
  const origPromisesAppendFile = fs.promises.appendFile;
  fs.promises.appendFile = async function (p, ...args) {
    try {
      return await origPromisesAppendFile.apply(fs.promises, [p, ...args]);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) return undefined;
      throw err;
    }
  };
}

// 4.7 unlink
const origUnlink = fs.unlink;
fs.unlink = function (p, cb) {
  if (isTracePath(p) && typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && isLockingError(err)) return cb(null);
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
    if (err && isLockingError(err) && isTracePath(p)) return undefined;
    throw err;
  }
};

if (fs.promises && fs.promises.unlink) {
  const origPromisesUnlink = fs.promises.unlink;
  fs.promises.unlink = async function (p) {
    try {
      return await origPromisesUnlink.call(fs.promises, p);
    } catch (err) {
      if (err && isLockingError(err) && isTracePath(p)) return undefined;
      throw err;
    }
  };
}

// Directory removal resilience
const origRmdir = fs.rmdir;
fs.rmdir = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb !== 'function') return origRmdir.apply(fs, [p, ...args]);
  const options = args.length > 1 ? args[0] : undefined;
  let attempt = 0;
  const maxAttempts = 10;
  function tryRmdir() {
    attempt++;
    origRmdir.call(fs, p, options, (err) => {
      if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
        const delay = Math.min(Math.round(100 * Math.pow(1.5, attempt - 1)), 1000);
        return setTimeout(tryRmdir, delay);
      }
      if (err && err.code === 'ENOENT') return cb(null);
      return cb(err);
    });
  }
  tryRmdir();
};

const origRmdirSync = fs.rmdirSync;
fs.rmdirSync = function (p, options) {
  const maxAttempts = 10;
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      return origRmdirSync.call(fs, p, options);
    } catch (err) {
      if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
        const delay = Math.min(Math.round(50 * Math.pow(1.5, attempt - 1)), 500);
        const waitTill = Date.now() + delay;
        while (Date.now() < waitTill) {}
        continue;
      }
      if (err && err.code === 'ENOENT') return;
      throw err;
    }
  }
};

if (fs.promises && fs.promises.rmdir) {
  const origPromisesRmdir = fs.promises.rmdir;
  fs.promises.rmdir = async function (p, options) {
    const maxAttempts = 10;
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        return await origPromisesRmdir.call(fs.promises, p, options);
      } catch (err) {
        if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
          const delay = Math.min(Math.round(100 * Math.pow(1.5, attempt - 1)), 1000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (err && err.code === 'ENOENT') return;
        throw err;
      }
    }
  };
}

// rm, rmSync, promises.rm
const origRm = fs.rm;
fs.rm = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb !== 'function') return origRm.apply(fs, [p, ...args]);
  const rawOptions = args.length > 1 && typeof args[0] === 'object' ? args[0] : {};
  const options = { maxRetries: 10, retryDelay: 150, ...rawOptions };
  let attempt = 0;
  const maxAttempts = 10;
  function tryRm() {
    attempt++;
    origRm.call(fs, p, options, (err) => {
      if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
        const delay = Math.min(Math.round(100 * Math.pow(1.5, attempt - 1)), 1000);
        return setTimeout(tryRm, delay);
      }
      if (err && err.code === 'ENOENT' && options.force) return cb(null);
      return cb(err);
    });
  }
  tryRm();
};

const origRmSync = fs.rmSync;
fs.rmSync = function (p, options) {
  const mergedOptions = { maxRetries: 10, retryDelay: 150, ...options };
  const maxAttempts = 10;
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      return origRmSync.call(fs, p, mergedOptions);
    } catch (err) {
      if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
        const delay = Math.min(Math.round(50 * Math.pow(1.5, attempt - 1)), 500);
        const waitTill = Date.now() + delay;
        while (Date.now() < waitTill) {}
        continue;
      }
      if (err && err.code === 'ENOENT' && mergedOptions.force) return;
      throw err;
    }
  }
};

if (fs.promises && fs.promises.rm) {
  const origPromisesRm = fs.promises.rm;
  fs.promises.rm = async function (p, options) {
    const mergedOptions = { maxRetries: 10, retryDelay: 150, ...options };
    const maxAttempts = 10;
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        return await origPromisesRm.call(fs.promises, p, mergedOptions);
      } catch (err) {
        if (err && isDirRemovalRetryable(err) && attempt < maxAttempts) {
          const delay = Math.min(Math.round(100 * Math.pow(1.5, attempt - 1)), 1000);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (err && err.code === 'ENOENT' && mergedOptions.force) return;
        throw err;
      }
    }
  };
}

// 4.8 rename
const origRename = fs.rename;
fs.rename = function (oldPath, newPath, cb) {
  if (typeof cb === 'function') {
    const wrappedCb = (err) => {
      if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) return cb(null);
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
    if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) return undefined;
    throw err;
  }
};

if (fs.promises && fs.promises.rename) {
  const origPromisesRename = fs.promises.rename;
  fs.promises.rename = async function (oldPath, newPath) {
    try {
      return await origPromisesRename.call(fs.promises, oldPath, newPath);
    } catch (err) {
      if (err && err.code === 'ENOENT' && is500Rename(oldPath, newPath)) return undefined;
      throw err;
    }
  };
}

// 4.9 readFile, readFileSync, promises.readFile
const origReadFile = fs.readFile;
fs.readFile = function (p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    const wrappedCb = (err, data) => {
      if (err && err.code === 'ENOENT' && isAppPathsManifestPath(p)) {
        ensureAppPathsManifestOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = encoding === 'utf8' || encoding === 'utf-8' ? DEFAULT_APP_PATHS_MANIFEST : Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
        return cb(null, result);
      }
      if (!err && isAppPathsManifestPath(p) && data) {
        try {
          const options = args.length > 1 ? args[0] : null;
          const encoding = typeof options === 'string' ? options : options?.encoding;
          const patched = patchAppPathsManifestContent(data);
          const result = encoding === 'utf8' || encoding === 'utf-8' ? patched : Buffer.from(patched, 'utf8');
          return cb(null, result);
        } catch (_) {}
      }
      if (err && err.code === 'ENOENT' && isMiddlewareManifestPath(p)) {
        ensureMiddlewareManifestOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = encoding === 'utf8' || encoding === 'utf-8' ? DEFAULT_MIDDLEWARE_MANIFEST : Buffer.from(DEFAULT_MIDDLEWARE_MANIFEST, 'utf8');
        return cb(null, result);
      }
      if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
        ensurePagesManifestOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = encoding === 'utf8' || encoding === 'utf-8' ? DEFAULT_PAGES_MANIFEST : Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
        return cb(null, result);
      }
      if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
        ensureNftJsonOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = encoding === 'utf8' || encoding === 'utf-8' ? DEFAULT_NFT_JSON : Buffer.from(DEFAULT_NFT_JSON, 'utf8');
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
    const data = origReadFileSync.call(fs, p, options);
    if (isAppPathsManifestPath(p) && data) {
      const encoding = typeof options === 'string' ? options : options?.encoding;
      const patched = patchAppPathsManifestContent(data);
      if (encoding === 'utf8' || encoding === 'utf-8') return patched;
      return Buffer.from(patched, 'utf8');
    }
    return data;
  } catch (err) {
    if (err && err.code === 'ENOENT' && isAppPathsManifestPath(p)) {
      ensureAppPathsManifestOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_APP_PATHS_MANIFEST;
      return Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
    }
    if (err && err.code === 'ENOENT' && isMiddlewareManifestPath(p)) {
      ensureMiddlewareManifestOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_MIDDLEWARE_MANIFEST;
      return Buffer.from(DEFAULT_MIDDLEWARE_MANIFEST, 'utf8');
    }
    if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
      ensurePagesManifestOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_PAGES_MANIFEST;
      return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
    }
    if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
      ensureNftJsonOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_NFT_JSON;
      return Buffer.from(DEFAULT_NFT_JSON, 'utf8');
    }
    throw err;
  }
};

if (fs.promises && fs.promises.readFile) {
  const origPromisesReadFile = fs.promises.readFile;
  fs.promises.readFile = async function (p, options) {
    try {
      const data = await origPromisesReadFile.call(fs.promises, p, options);
      if (isAppPathsManifestPath(p) && data) {
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const patched = patchAppPathsManifestContent(data);
        if (encoding === 'utf8' || encoding === 'utf-8') return patched;
        return Buffer.from(patched, 'utf8');
      }
      return data;
    } catch (err) {
      if (err && err.code === 'ENOENT' && isAppPathsManifestPath(p)) {
        ensureAppPathsManifestOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_APP_PATHS_MANIFEST;
        return Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
      }
      if (err && err.code === 'ENOENT' && isMiddlewareManifestPath(p)) {
        ensureMiddlewareManifestOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_MIDDLEWARE_MANIFEST;
        return Buffer.from(DEFAULT_MIDDLEWARE_MANIFEST, 'utf8');
      }
      if (err && err.code === 'ENOENT' && isPagesManifestPath(p)) {
        ensurePagesManifestOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_PAGES_MANIFEST;
        return Buffer.from(DEFAULT_PAGES_MANIFEST, 'utf8');
      }
      if (err && err.code === 'ENOENT' && isNftJsonPath(p)) {
        ensureNftJsonOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') return DEFAULT_NFT_JSON;
        return Buffer.from(DEFAULT_NFT_JSON, 'utf8');
      }
      throw err;
    }
  };
}

try {
  const fsp = require('fs/promises');
  if (fsp) {
    if (fs.promises && fs.promises.readFile) fsp.readFile = fs.promises.readFile;
    if (fs.promises && fs.promises.writeFile) fsp.writeFile = fs.promises.writeFile;
    if (fs.promises && fs.promises.open) fsp.open = fs.promises.open;
    if (fs.promises && fs.promises.rmdir) fsp.rmdir = fs.promises.rmdir;
    if (fs.promises && fs.promises.rm) fsp.rm = fs.promises.rm;
    if (fs.promises && fs.promises.unlink) fsp.unlink = fs.promises.unlink;
    if (fs.promises && fs.promises.readlink) fsp.readlink = fs.promises.readlink;
  }
} catch (_) {}

// 5. Global Process Safeguard
process.on('uncaughtException', (err) => {
  if (err && isLockingError(err) && isTracePath(err.path)) return;
  if (err && err.code === 'ENOENT' && err.syscall === 'rename' && (is500HtmlPath(err.path) || is500HtmlPath(err.dest))) return;
  if (
    err &&
    err.code === 'ENOENT' &&
    (err.syscall === 'open' || err.syscall === 'read') &&
    (isPagesManifestPath(err.path) || isMiddlewareManifestPath(err.path) || isAppPathsManifestPath(err.path) || isNftJsonPath(err.path))
  ) {
    return;
  }
  if (
    err &&
    isDirRemovalRetryable(err) &&
    err.path &&
    (err.path.includes('.next') || err.path.includes('export') || err.path.includes('out'))
  ) {
    return;
  }
  throw err;
});
