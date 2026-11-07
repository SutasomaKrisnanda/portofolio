const fs = require('fs');

console.log('=== HTML CONTENT INSPECTION ===');
const indexHtml = fs.readFileSync('out/index.html', 'utf8');
const notFoundHtml = fs.readFileSync('out/404.html', 'utf8');

// Check out/index.html
console.log('index.html checks:');
console.log('  starts with <!DOCTYPE html>:', indexHtml.startsWith('<!DOCTYPE html>'));
console.log('  contains <title>:', /<title>.*<\/title>/.test(indexHtml));
console.log('  contains bg-tech-light avif:', indexHtml.includes('bg-tech-light.0c500666.avif'));
console.log('  contains bg-tech-dark avif:', indexHtml.includes('bg-tech-dark.5b5b103c.avif'));
console.log('  contains bg-medical-light avif:', indexHtml.includes('bg-medical-light.403dbd79.avif'));
console.log('  contains bg-medical-dark avif:', indexHtml.includes('bg-medical-dark.af11fac5.avif'));
console.log('  contains bg-academic-light avif:', indexHtml.includes('bg-academic-light.530643a2.avif'));
console.log('  contains bg-academic-dark avif:', indexHtml.includes('bg-academic-dark.84ebdb39.avif'));
console.log('  contains SVG icons referenced or preloaded:', 
  indexHtml.includes('project-tech') || 
  indexHtml.includes('project-medical') || 
  indexHtml.includes('project-academic')
);

// Check out/404.html
console.log('\n404.html checks:');
console.log('  contains home link (/):', notFoundHtml.includes('href="/"') || notFoundHtml.includes('href="./"'));
console.log('  contains tech mode link:', notFoundHtml.includes('mode=tech'));
console.log('  contains medical mode link:', notFoundHtml.includes('mode=medical'));
console.log('  contains academic mode link:', notFoundHtml.includes('mode=academic'));
console.log('  contains 404 heading/text:', notFoundHtml.includes('404') || notFoundHtml.includes('Halaman Tidak Ditemukan'));
