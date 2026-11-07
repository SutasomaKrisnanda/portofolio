const cp = require('child_process');
require('../../../patch-fs.js');

console.log('Parent NODE_OPTIONS:', process.env.NODE_OPTIONS);

try {
  const out = cp.execSync('node -e "console.log(\'CHILD_OK\')"', { stdio: 'pipe' }).toString();
  console.log('Result from child:', out.trim());
} catch (err) {
  console.error('Child execution failed!');
  console.error('stderr:', err.stderr ? err.stderr.toString() : err.message);
  console.error('stdout:', err.stdout ? err.stdout.toString() : '');
}
