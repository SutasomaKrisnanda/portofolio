import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const heroSource = fs.readFileSync(path.join(root, 'src/components/hero.tsx'), 'utf8');
const sceneSource = fs.readFileSync(path.join(root, 'src/components/hero-3d-scene.tsx'), 'utf8');

console.log('[VIEWPORT TEST 1] Verifying Tailwind classes in hero.tsx...');

// 1. Container padding
if (!heroSource.includes('pt-16 lg:pt-20 pb-4 sm:pb-6')) {
  console.error('FAIL: Container padding not tightened to pt-16 lg:pt-20 pb-4 sm:pb-6');
  process.exit(1);
}
console.log('PASS: Container padding pt-16 lg:pt-20 pb-4 sm:pb-6 verified.');

// 2. Spatial stage grid gap
if (!heroSource.includes('gap-4 lg:gap-6')) {
  console.error('FAIL: Spatial stage grid gap not tightened to gap-4 lg:gap-6');
  process.exit(1);
}
console.log('PASS: Spatial stage grid gap-4 lg:gap-6 verified.');

// 3. Canvas dimensions in hero-3d-scene.tsx
const expectedCanvasClass = 'w-[300px] h-[320px] sm:w-[340px] sm:h-[360px] lg:w-[360px] lg:h-[380px] xl:w-[400px] xl:h-[420px]';
if (!sceneSource.includes(expectedCanvasClass)) {
  console.error('FAIL: Canvas classes do not match expected clamped dimensions:', expectedCanvasClass);
  process.exit(1);
}
console.log('PASS: Canvas dimensions clamped to 380px on desktop (lg) and 420px on xl.');

// 4. Mathematical headroom calculation on 768px desktop viewport
const topPadding = 80; // lg:pt-20 = 5rem = 80px
const topBarHeight = 32; // max-w-7xl top status bar
const centerCanvasHeight = 380; // lg:h-[380px]
const centerLabelHeight = 32; // mt-2 (8px) + label (24px)
const bottomShelfHeight = 58; // bottom bar px-5 py-3
const bottomPadding = 24; // sm:pb-6 = 1.5rem = 24px

const totalDesktopStackHeight = topPadding + topBarHeight + centerCanvasHeight + centerLabelHeight + bottomShelfHeight + bottomPadding;
console.log(`Computed total desktop stack height at 768p: ${totalDesktopStackHeight}px`);

if (totalDesktopStackHeight > 640) {
  console.error(`FAIL: Stack height ${totalDesktopStackHeight}px exceeds 640px limit!`);
  process.exit(1);
}

const viewport768p = 768;
const headroom = viewport768p - totalDesktopStackHeight;
console.log(`Headroom on 768px display: ${headroom}px (required > 120px)`);

if (headroom < 120) {
  console.error(`FAIL: Headroom ${headroom}px is less than 120px!`);
  process.exit(1);
}

console.log('ALL HERO VIEWPORT BUDGET TESTS PASSED SUCCESSFULLY!');
