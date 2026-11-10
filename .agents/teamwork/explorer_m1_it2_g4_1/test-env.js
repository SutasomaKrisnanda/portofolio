const cp = require('child_process');
const path = require('path');
const patchFsPath = path.resolve('patch-fs.js').replace(/\\/g, '/');
console.log('patchFsPath:', patchFsPath);

const res = cp.spawnSync(process.execPath, ['-e', 'console.log(123)'], {
  env: {
    ...process.env,
    NODE_OPTIONS: `--require "${patchFsPath}"`
  },
  encoding: 'utf8'
});
console.log('stdout:', res.stdout);
console.log('stderr:', res.stderr);
console.log('status:', res.status);
