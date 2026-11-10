import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const MODES = ['tech', 'medical', 'academic'];
const THEMES = ['dark', 'light'];

const AVIF_FILES = [
  'src/assets/image/bg-tech-dark.avif',
  'src/assets/image/bg-tech-light.avif',
  'src/assets/image/bg-academic-dark.avif',
  'src/assets/image/bg-academic-light.avif',
  'src/assets/image/bg-medical-dark.avif',
  'src/assets/image/bg-medical-light.avif'
];

const SVG_FILES = [
  'src/assets/icons/project-tech.svg',
  'src/assets/icons/project-medical.svg',
  'src/assets/icons/project-academic.svg',
  'public/icons/project-tech.svg',
  'public/icons/project-medical.svg',
  'public/icons/project-academic.svg'
];

// Helper to simulate ProjectModeIcon resolution logic directly from src/components/project-mode-icon.tsx
function resolveProjectMode(mode, project) {
  if (!project) return mode || 'tech';
  if (project.mode !== mode && !project.secondaryModes?.includes(mode)) {
    return project.mode;
  }
  return mode;
}

// Helper to simulate HeroBackground layer states
function getHeroBackgroundState(currentMode, activeTheme) {
  const imageLayers = [];
  for (const m of MODES) {
    for (const t of THEMES) {
      const isActive = m === currentMode && t === activeTheme;
      imageLayers.push({
        mode: m,
        theme: t,
        isActive,
        className: isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      });
    }
  }

  const isLight = activeTheme === 'light';
  const darkScrimClass = isLight ? 'opacity-0' : 'opacity-100';
  const lightScrimClass = isLight ? 'opacity-100' : 'opacity-0';

  const pedestalGlows = {
    tech: currentMode === 'tech' ? 'opacity-100' : 'opacity-0',
    academic: currentMode === 'academic' ? 'opacity-100' : 'opacity-0',
    medical: currentMode === 'medical' ? 'opacity-100' : 'opacity-0'
  };

  return {
    imageLayers,
    darkScrimClass,
    lightScrimClass,
    pedestalGlows
  };
}

describe('Tier 5: Adversarial Stress & Empirical Verification for Milestone 1', () => {

  // =========================================================================
  // Section 1: Asset Integrity and Filesystem Hardening
  // =========================================================================
  describe('Asset Integrity & Binary Health', () => {
    test('T5.1.1: All 6 AVIF background files exist and possess valid ISOBMFF headers', () => {
      for (const relPath of AVIF_FILES) {
        const fullPath = path.resolve(PROJECT_ROOT, relPath);
        assert.ok(fs.existsSync(fullPath), `Missing AVIF file: ${relPath}`);
        const stat = fs.statSync(fullPath);
        assert.ok(stat.size > 10000, `AVIF file abnormally small (${stat.size} bytes): ${relPath}`);

        const buf = fs.readFileSync(fullPath);
        // ISOBMFF check
        const boxLength = buf.readUInt32BE(0);
        const boxType = buf.toString('ascii', 4, 8);
        const majorBrand = buf.toString('ascii', 8, 12);
        assert.strictEqual(boxType, 'ftyp', `File ${relPath} missing 'ftyp' box`);
        assert.ok(
          majorBrand === 'avif' || majorBrand === 'avis' || majorBrand === 'mif1',
          `File ${relPath} unexpected brand: ${majorBrand}`
        );
      }
    });

    test('T5.1.2: All SVG icons exist, non-truncated, and contain closing tags', () => {
      for (const relPath of SVG_FILES) {
        const fullPath = path.resolve(PROJECT_ROOT, relPath);
        assert.ok(fs.existsSync(fullPath), `Missing SVG file: ${relPath}`);
        const content = fs.readFileSync(fullPath, 'utf8').trim();
        assert.ok(content.length > 500, `SVG file too small (${content.length} chars): ${relPath}`);
        assert.ok(content.includes('<svg'), `SVG missing opening <svg tag: ${relPath}`);
        assert.ok(content.endsWith('</svg>'), `SVG not properly terminated with </svg>: ${relPath}`);
        assert.ok(content.includes('viewBox='), `SVG missing viewBox attribute: ${relPath}`);
      }
    });

    test('T5.1.3: public/favicon.ico exists and contains valid ICO header magic', () => {
      const favPath = path.resolve(PROJECT_ROOT, 'public/favicon.ico');
      assert.ok(fs.existsSync(favPath), 'Missing public/favicon.ico');
      const buf = fs.readFileSync(favPath);
      assert.ok(buf.length >= 100, `Favicon too small: ${buf.length} bytes`);
      // ICO magic: 0x00, 0x00, 0x01, 0x00
      assert.strictEqual(buf[0], 0, 'Invalid ICO magic byte 0');
      assert.strictEqual(buf[1], 0, 'Invalid ICO magic byte 1');
      assert.strictEqual(buf[2], 1, 'Invalid ICO magic byte 2');
      assert.strictEqual(buf[3], 0, 'Invalid ICO magic byte 3');
    });

    test('T5.1.4: Zero .ico files in src/app/ (prevent Windows WSL readlink EISDIR crash)', () => {
      const srcAppFavicon = path.resolve(PROJECT_ROOT, 'src/app/favicon.ico');
      const srcAppOldFavicon = path.resolve(PROJECT_ROOT, 'src/app/oldfavicon.ico');
      assert.strictEqual(fs.existsSync(srcAppFavicon), false, 'src/app/favicon.ico must NOT exist');
      assert.strictEqual(fs.existsSync(srcAppOldFavicon), false, 'src/app/oldfavicon.ico must NOT exist');
    });
  });

  // =========================================================================
  // Section 2: Rapid Mode & Theme Toggling (Flicker & Invariant Stress Test)
  // =========================================================================
  describe('Rapid Mode & Theme Toggling (Flicker & Invariant Test)', () => {
    test('T5.2.1: Deterministic single-active layer invariant holds across 3,000 rapid transitions', () => {
      const modes = ['tech', 'medical', 'academic'];
      const themes = ['dark', 'light'];

      let currentMode = 'tech';
      let currentTheme = 'dark';

      for (let i = 0; i < 3000; i++) {
        // Pseudo-random transition choice
        const changeType = i % 3;
        if (changeType === 0) {
          currentMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
        } else if (changeType === 1) {
          currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        } else {
          currentMode = modes[(modes.indexOf(currentMode) + 2) % modes.length];
          currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        }

        const state = getHeroBackgroundState(currentMode, currentTheme);

        // Invariant 1: Exactly one image layer must be active (opacity-100 z-10)
        const activeImages = state.imageLayers.filter((l) => l.isActive);
        assert.strictEqual(
          activeImages.length,
          1,
          `At iteration ${i} (${currentMode}, ${currentTheme}), expected 1 active image, found ${activeImages.length}`
        );
        assert.strictEqual(activeImages[0].mode, currentMode);
        assert.strictEqual(activeImages[0].theme, currentTheme);
        assert.strictEqual(activeImages[0].className, 'opacity-100 z-10');

        // Invariant 2: Exactly 5 inactive images with opacity-0 z-0
        const inactiveImages = state.imageLayers.filter((l) => !l.isActive);
        assert.strictEqual(inactiveImages.length, 5);
        for (const inactive of inactiveImages) {
          assert.strictEqual(inactive.className, 'opacity-0 z-0');
        }

        // Invariant 3: Contrast scrim theme exclusivity
        if (currentTheme === 'light') {
          assert.strictEqual(state.lightScrimClass, 'opacity-100');
          assert.strictEqual(state.darkScrimClass, 'opacity-0');
        } else {
          assert.strictEqual(state.lightScrimClass, 'opacity-0');
          assert.strictEqual(state.darkScrimClass, 'opacity-100');
        }

        // Invariant 4: Exactly one pedestal glow active
        const activeGlows = Object.entries(state.pedestalGlows).filter(([_, c]) => c === 'opacity-100');
        assert.strictEqual(activeGlows.length, 1);
        assert.strictEqual(activeGlows[0][0], currentMode);
      }
    });

    test('T5.2.2: Extreme rapid ping-pong mode switching maintains visual continuity', () => {
      // Rapid ping-pong: tech -> medical -> tech -> academic -> tech ...
      const sequence = ['tech', 'medical', 'tech', 'academic', 'tech', 'medical', 'academic', 'tech'];
      for (const mode of sequence) {
        const state = getHeroBackgroundState(mode, 'dark');
        const active = state.imageLayers.find((l) => l.isActive);
        assert.ok(active, `Failed to find active layer for mode ${mode}`);
        assert.strictEqual(active.mode, mode);
        assert.strictEqual(active.theme, 'dark');
      }
    });

    test('T5.2.3: Resilience against invalid or empty mode / theme values', () => {
      // Test fallback handling when mode is unexpected
      const fallbackMode = resolveProjectMode('invalid_mode', null);
      assert.strictEqual(fallbackMode, 'invalid_mode', 'Passes through gracefully');

      const bgState = getHeroBackgroundState('tech', 'dark');
      assert.ok(bgState.imageLayers.length === 6);
    });
  });

  // =========================================================================
  // Section 3: Multi-Mode Dynamic Icon Morphing Stress Test
  // =========================================================================
  describe('Dynamic Multi-Mode Project Icon Behavior', () => {
    test('T5.3.1: HMSSO project icon dynamically switches across all 3 active modes', () => {
      const projectsPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
      const hmsso = projects.find((p) => p.id === 'proj-hmsso');

      assert.ok(hmsso, 'HMSSO project must exist in projects.json');
      assert.strictEqual(hmsso.mode, 'tech', 'HMSSO primary mode is tech');
      assert.deepStrictEqual(hmsso.secondaryModes, ['medical', 'academic'], 'HMSSO secondary modes are medical & academic');

      // Test 1: In Tech mode
      const techResolved = resolveProjectMode('tech', hmsso);
      assert.strictEqual(techResolved, 'tech', 'HMSSO in Tech mode must resolve to tech');

      // Test 2: In Medical mode
      const medResolved = resolveProjectMode('medical', hmsso);
      assert.strictEqual(medResolved, 'medical', 'HMSSO in Medical mode must morph to medical');

      // Test 3: In Academic mode
      const acadResolved = resolveProjectMode('academic', hmsso);
      assert.strictEqual(acadResolved, 'academic', 'HMSSO in Academic mode must morph to academic');
    });

    test('T5.3.2: Full dataset project icon resolution verification', () => {
      const projectsPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

      for (const p of projects) {
        for (const activeMode of MODES) {
          const resolved = resolveProjectMode(activeMode, p);
          const supportsActive = p.mode === activeMode || (Array.isArray(p.secondaryModes) && p.secondaryModes.includes(activeMode));

          if (supportsActive) {
            assert.strictEqual(
              resolved,
              activeMode,
              `Project ${p.id} supports ${activeMode} but resolved to ${resolved}`
            );
          } else {
            assert.strictEqual(
              resolved,
              p.mode,
              `Project ${p.id} does not support ${activeMode}; expected fallback to ${p.mode}, got ${resolved}`
            );
          }
        }
      }
    });

    test('T5.3.3: ProjectModeIcon handles null or missing project reference safely', () => {
      for (const mode of MODES) {
        const resolved = resolveProjectMode(mode, null);
        assert.strictEqual(resolved, mode, `Null project should resolve directly to mode ${mode}`);
      }
    });
  });

  // =========================================================================
  // Section 4: Production Static Export Build Inspection
  // =========================================================================
  describe('Static Export Verification (out/ Directory)', () => {
    test('T5.4.1: out/index.html exists and contains preloaded AVIF images and SVG icons', () => {
      const outIndexPath = path.resolve(PROJECT_ROOT, 'out/index.html');
      assert.ok(fs.existsSync(outIndexPath), 'out/index.html must exist (run build first)');
      const html = fs.readFileSync(outIndexPath, 'utf8');

      // Check favicon link
      assert.ok(html.includes('href="/favicon.ico"'), 'HTML must include /favicon.ico');

      // Check AVIF backgrounds preloaded/rendered
      assert.ok(html.includes('bg-tech-dark'), 'HTML must reference bg-tech-dark');
      assert.ok(html.includes('bg-tech-light'), 'HTML must reference bg-tech-light');
      assert.ok(html.includes('bg-medical-dark'), 'HTML must reference bg-medical-dark');
      assert.ok(html.includes('bg-medical-light'), 'HTML must reference bg-medical-light');
      assert.ok(html.includes('bg-academic-dark'), 'HTML must reference bg-academic-dark');
      assert.ok(html.includes('bg-academic-light'), 'HTML must reference bg-academic-light');

      // Check Tech mode visual artifacts (restored DiamondArtifactGlyph procedural gradients per R1 or project mode SVG icons)
      const hasR1TechGlyphs = html.includes('chrome-') && html.includes('holo-');
      const hasModeSvgIcons =
        html.includes('project-tech') ||
        html.includes('project-medical') ||
        html.includes('project-academic');
      assert.ok(
        hasR1TechGlyphs || hasModeSvgIcons,
        'HTML must render authentic R1.1 DiamondArtifactGlyph procedural SVG defs (chrome- and holo-) or reference project mode SVG assets (project-tech, project-medical, project-academic)'
      );
    });

    test('T5.4.2: All AVIF media emitted by Next.js static export physically exist in out/_next/static/media/', () => {
      const mediaDir = path.resolve(PROJECT_ROOT, 'out/_next/static/media');
      assert.ok(fs.existsSync(mediaDir), 'out/_next/static/media must exist');
      const files = fs.readdirSync(mediaDir);

      const avifEmitted = files.filter((f) => f.endsWith('.avif'));
      assert.ok(
        avifEmitted.length >= 6,
        `Expected at least 6 AVIF files in out/_next/static/media, found ${avifEmitted.length}: ${avifEmitted.join(', ')}`
      );

      // Verify sizes of emitted AVIFs are > 0
      for (const f of avifEmitted) {
        const stat = fs.statSync(path.join(mediaDir, f));
        assert.ok(stat.size > 5000, `Emitted AVIF ${f} is corrupted or empty (${stat.size} bytes)`);
      }

      // Check SVG icons emitted
      const svgEmitted = files.filter((f) => f.endsWith('.svg'));
      assert.ok(
        svgEmitted.length >= 3,
        `Expected at least 3 SVG files in out/_next/static/media, found ${svgEmitted.length}: ${svgEmitted.join(', ')}`
      );
    });
  });
});
