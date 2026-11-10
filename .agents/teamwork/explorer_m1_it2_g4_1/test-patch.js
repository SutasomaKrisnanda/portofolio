const fs = require('fs');
const path = require('path');

// First load existing patch-fs.js
require(path.resolve(process.cwd(), 'patch-fs.js'));

const testPatchPath = path.resolve(__dirname, 'test-patch.js').replace(/\\/g, '/');
if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes('test-patch')) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --require "${testPatchPath}"`.trim();
}

// Now add our enhancements:
const Module = require('module');
const origRequire = Module.prototype.require;

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

function isExportDetailPath(p) {
  if (!p) return false;
  let str = typeof p === 'string' ? p : Buffer.isBuffer(p) ? p.toString() : p && p.pathname ? p.pathname : String(p);
  const normalized = str.replace(/\\/g, '/').toLowerCase();
  return normalized.endsWith('/export-detail.json') || normalized === 'export-detail.json' || /(?:^|[\\/])export-detail\.json(?:$|[\\/?#])/.test(str);
}

const DEFAULT_APP_PATHS_MANIFEST = JSON.stringify(
  {
    "/_not-found/page": "app/_not-found/page.js",
    "/_not-found": "app/_not-found/page.js",
    "/page": "app/page.js"
  },
  null,
  2
);

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

function patchManifestContent(content) {
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

// Hook Module.prototype.require
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

  return origRequire.apply(this, arguments);
};

// Hook fs.readFile, fs.readFileSync, fs.promises.readFile for app-paths-manifest.json
const origReadFile = fs.readFile;
fs.readFile = function(p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function' && isAppPathsManifestPath(p)) {
    const wrappedCb = (err, data) => {
      if (err && err.code === 'ENOENT') {
        ensureAppPathsManifestOnDisk(p);
        const options = args.length > 1 ? args[0] : null;
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = encoding === 'utf8' || encoding === 'utf-8' ? DEFAULT_APP_PATHS_MANIFEST : Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
        return cb(null, result);
      }
      if (!err && data) {
        try {
          const options = args.length > 1 ? args[0] : null;
          const encoding = typeof options === 'string' ? options : options?.encoding;
          const patched = patchManifestContent(data);
          const result = encoding === 'utf8' || encoding === 'utf-8' ? patched : Buffer.from(patched, 'utf8');
          return cb(null, result);
        } catch (_) {}
      }
      return cb(err, data);
    };
    return origReadFile.apply(fs, [p, ...args.slice(0, args.length - 1), wrappedCb]);
  }
  return origReadFile.apply(fs, [p, ...args]);
};

const origReadFileSync = fs.readFileSync;
fs.readFileSync = function(p, options) {
  try {
    const data = origReadFileSync.call(fs, p, options);
    if (isAppPathsManifestPath(p) && data) {
      const encoding = typeof options === 'string' ? options : options?.encoding;
      const patched = patchManifestContent(data);
      if (encoding === 'utf8' || encoding === 'utf-8') return patched;
      return Buffer.from(patched, 'utf8');
    }
    return data;
  } catch (err) {
    if (err && err.code === 'ENOENT' && isAppPathsManifestPath(p)) {
      ensureAppPathsManifestOnDisk(p);
      const encoding = typeof options === 'string' ? options : options?.encoding;
      if (encoding === 'utf8' || encoding === 'utf-8') {
        return DEFAULT_APP_PATHS_MANIFEST;
      }
      return Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
    }
    throw err;
  }
};

if (fs.promises && fs.promises.readFile) {
  const origPromisesReadFile = fs.promises.readFile;
  fs.promises.readFile = async function(p, options) {
    try {
      const data = await origPromisesReadFile.call(fs.promises, p, options);
      if (isAppPathsManifestPath(p) && data) {
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const patched = patchManifestContent(data);
        if (encoding === 'utf8' || encoding === 'utf-8') return patched;
        return Buffer.from(patched, 'utf8');
      }
      return data;
    } catch (err) {
      if (err && err.code === 'ENOENT' && isAppPathsManifestPath(p)) {
        ensureAppPathsManifestOnDisk(p);
        const encoding = typeof options === 'string' ? options : options?.encoding;
        if (encoding === 'utf8' || encoding === 'utf-8') {
          return DEFAULT_APP_PATHS_MANIFEST;
        }
        return Buffer.from(DEFAULT_APP_PATHS_MANIFEST, 'utf8');
      }
      throw err;
    }
  };
}

// Hook writeFile & fs.promises.writeFile to auto-create missing directories on ENOENT
const origWriteFile = fs.writeFile;
fs.writeFile = function(p, ...args) {
  const cb = args[args.length - 1];
  if (typeof cb === 'function') {
    const wrappedCb = (err) => {
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
    return origWriteFile.apply(fs, [p, ...args.slice(0, args.length - 1), wrappedCb]);
  }
  return origWriteFile.apply(fs, [p, ...args]);
};

const origWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function(p, ...args) {
  try {
    return origWriteFileSync.apply(fs, [p, ...args]);
  } catch (err) {
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
  fs.promises.writeFile = async function(p, ...args) {
    try {
      return await origPromisesWriteFile.apply(fs.promises, [p, ...args]);
    } catch (err) {
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

// Sync fsp if loaded
try {
  const fsp = require('fs/promises');
  if (fsp) {
    if (fs.promises && fs.promises.readFile) fsp.readFile = fs.promises.readFile;
    if (fs.promises && fs.promises.writeFile) fsp.writeFile = fs.promises.writeFile;
  }
} catch (_) {}
