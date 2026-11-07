import fs from 'fs';
import path from 'path';

const indexHtml = fs.readFileSync('out/index.html', 'utf8');
const notFoundHtml = fs.readFileSync('out/404.html', 'utf8');
const faviconStat = fs.statSync('out/favicon.ico');

console.log('--- out/index.html ---');
console.log('Size:', indexHtml.length, 'bytes');
console.log('>= 100KB:', indexHtml.length >= 100 * 1024);

const avifNames = [
  'bg-tech-light', 'bg-tech-dark',
  'bg-medical-light', 'bg-medical-dark',
  'bg-academic-light', 'bg-academic-dark'
];
for (const name of avifNames) {
  console.log('index.html contains ' + name + ':', indexHtml.includes(name));
}

const svgNames = [
  'project-tech', 'project-medical', 'project-academic'
];
for (const name of svgNames) {
  console.log('index.html contains ' + name + ':', indexHtml.includes(name));
}

console.log('\n--- out/404.html ---');
console.log('Size:', notFoundHtml.length, 'bytes');
console.log('>= 10KB:', notFoundHtml.length >= 10 * 1024);
console.log('404.html contains home link (/):', notFoundHtml.includes('href="/"'));
console.log('404.html contains project link (/#projects):', notFoundHtml.includes('/#projects'));
console.log('404.html contains mode=tech:', notFoundHtml.includes('mode=tech'));
console.log('404.html contains mode=medical:', notFoundHtml.includes('mode=medical'));
console.log('404.html contains mode=academic:', notFoundHtml.includes('mode=academic'));

console.log('\n--- out/favicon.ico ---');
console.log('Size:', faviconStat.size, 'bytes');
const favBuf = fs.readFileSync('out/favicon.ico');
const isIco = favBuf[0] === 0 && favBuf[1] === 0 && favBuf[2] === 1 && favBuf[3] === 0;
console.log('Valid ICO magic header:', isIco);

console.log('\n--- out/_next/static/media/ ---');
const mediaDir = 'out/_next/static/media';
const mediaFiles = fs.readdirSync(mediaDir);
const avifFiles = mediaFiles.filter(f => f.endsWith('.avif'));
const svgFiles = mediaFiles.filter(f => f.endsWith('.svg'));
console.log('AVIF count:', avifFiles.length);
for (const f of avifFiles) {
  const stat = fs.statSync(path.join(mediaDir, f));
  console.log('  ' + f + ' (' + stat.size + ' bytes)');
}
console.log('SVG count:', svgFiles.length);
for (const f of svgFiles) {
  const stat = fs.statSync(path.join(mediaDir, f));
  console.log('  ' + f + ' (' + stat.size + ' bytes)');
}
