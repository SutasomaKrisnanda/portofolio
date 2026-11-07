const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== EMPIRICAL STATIC EXPORT VERIFICATION ===');

// 1. out/index.html
assert(fs.existsSync('out/index.html'), 'out/index.html must exist');
const indexStat = fs.statSync('out/index.html');
console.log('out/index.html size:', indexStat.size, 'bytes (threshold >= 100000)');
assert(indexStat.size >= 100000, 'out/index.html must be >= 100KB');

const indexHtml = fs.readFileSync('out/index.html', 'utf8');
const avifFiles = [
  'bg-tech-light.0c500666.avif',
  'bg-medical-dark.af11fac5.avif',
  'bg-tech-dark.5b5b103c.avif',
  'bg-medical-light.403dbd79.avif',
  'bg-academic-light.530643a2.avif',
  'bg-academic-dark.84ebdb39.avif'
];
avifFiles.forEach(f => {
  assert(indexHtml.includes(f), 'index.html must contain preloaded reference to ' + f);
  console.log('  Preloaded AVIF in index.html verified: ' + f);
});

assert(indexHtml.includes('project-tech'), 'index.html must contain default mode SVG icon project-tech');
console.log('  Default mode SVG icon project-tech verified in index.html');

// 2. out/404.html
assert(fs.existsSync('out/404.html'), 'out/404.html must exist');
const notFoundStat = fs.statSync('out/404.html');
console.log('out/404.html size:', notFoundStat.size, 'bytes (threshold >= 10000)');
assert(notFoundStat.size >= 10000, 'out/404.html must be >= 10KB');

const notFoundHtml = fs.readFileSync('out/404.html', 'utf8');
assert(notFoundHtml.includes('href="/"') || notFoundHtml.includes('href="./"'), '404.html must contain home link');
assert(notFoundHtml.includes('mode=tech'), '404.html must contain mode=tech pill');
assert(notFoundHtml.includes('mode=medical'), '404.html must contain mode=medical pill');
assert(notFoundHtml.includes('mode=academic'), '404.html must contain mode=academic pill');
console.log('  404.html home link & mode pills verified: PASS');

// 3. out/favicon.ico
assert(fs.existsSync('out/favicon.ico'), 'out/favicon.ico must exist');
const favStat = fs.statSync('out/favicon.ico');
console.log('out/favicon.ico size:', favStat.size, 'bytes');
assert(favStat.size === 4286, 'out/favicon.ico must be exactly 4286 bytes');
const favBuf = fs.readFileSync('out/favicon.ico');
const favMagic = favBuf.subarray(0, 4).toString('hex');
console.log('out/favicon.ico magic bytes:', favMagic);
assert(favMagic === '00000100', 'out/favicon.ico magic bytes must be 00000100');

// 4. Media in out/_next/static/media/
const mediaDir = 'out/_next/static/media';
assert(fs.existsSync(mediaDir), 'mediaDir must exist');

avifFiles.forEach(f => {
  const p = path.join(mediaDir, f);
  assert(fs.existsSync(p), 'AVIF file must exist: ' + f);
  const s = fs.statSync(p).size;
  console.log('  Media AVIF: ' + f + ' (' + s + ' bytes)');
  assert(s > 10000, 'AVIF size must be > 10KB');
  const buf = fs.readFileSync(p);
  const boxType = buf.subarray(4, 8).toString('ascii');
  const majorBrand = buf.subarray(8, 12).toString('ascii');
  assert(boxType === 'ftyp' && majorBrand === 'avif', 'AVIF ISOBMFF header invalid for ' + f);
});

const svgFiles = [
  'project-academic.4f827dbc.svg',
  'project-medical.32aa7951.svg',
  'project-tech.69f61e52.svg'
];
svgFiles.forEach(f => {
  const p = path.join(mediaDir, f);
  assert(fs.existsSync(p), 'SVG file must exist: ' + f);
  const s = fs.statSync(p).size;
  console.log('  Media SVG: ' + f + ' (' + s + ' bytes)');
  assert(s > 1000000, 'SVG size must be > 1MB');
  const content = fs.readFileSync(p, 'utf8');
  assert(content.includes('<svg') && content.includes('</svg>'), 'SVG content tags invalid for ' + f);
});

console.log('ALL STATIC EXPORT VERIFICATIONS PASSED 100%!');
