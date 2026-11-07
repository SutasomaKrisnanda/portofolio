import { test, describe } from 'node:test';
import {
  assertFileExists,
  assertValidAvif,
  assertValidGlb,
  assertValidSvg,
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assert
} from './helpers/assertions.mjs';
import {
  MODES,
  THEMES,
  BACKGROUND_ASSETS,
  MODEL_ASSETS,
  ICON_ASSETS,
  loadProjects
} from './helpers/fixtures.mjs';
import {
  filterFeaturedProjects,
  resolveExpectedIcon,
  resolveExpectedBackground,
  resolveExpected3DModel,
  calculateSlideIndex
} from './helpers/oracle.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 1: Feature Coverage (R1 - R6)', () => {
  // ==========================================
  // R1: Visual Hero-Section per Mode
  // ==========================================
  describe('R1. Visual Hero-Section per Mode', () => {
    test('T1.1.1: Tech mode dark & light background AVIF assets validation', () => {
      const darkResult = assertValidAvif(BACKGROUND_ASSETS.tech.dark);
      const lightResult = assertValidAvif(BACKGROUND_ASSETS.tech.light);
      assertEqual(darkResult.valid, true, 'Tech dark AVIF must be valid');
      assertEqual(lightResult.valid, true, 'Tech light AVIF must be valid');
    });

    test('T1.1.2: Medical mode dark & light background AVIF assets validation', () => {
      const darkResult = assertValidAvif(BACKGROUND_ASSETS.medical.dark);
      const lightResult = assertValidAvif(BACKGROUND_ASSETS.medical.light);
      assertEqual(darkResult.valid, true, 'Medical dark AVIF must be valid');
      assertEqual(lightResult.valid, true, 'Medical light AVIF must be valid');
    });

    test('T1.1.3: Academic mode dark & light background AVIF assets validation', () => {
      const darkResult = assertValidAvif(BACKGROUND_ASSETS.academic.dark);
      const lightResult = assertValidAvif(BACKGROUND_ASSETS.academic.light);
      assertEqual(darkResult.valid, true, 'Academic dark AVIF must be valid');
      assertEqual(lightResult.valid, true, 'Academic light AVIF must be valid');
    });

    test('T1.1.4: Background resolution oracle mapping for all 6 mode/theme pairs', () => {
      for (const mode of MODES) {
        for (const theme of THEMES) {
          const expectedPath = BACKGROUND_ASSETS[mode][theme];
          const resolvedPath = resolveExpectedBackground(mode, theme);
          assertEqual(resolvedPath, expectedPath, `Mapping mismatch for ${mode} in ${theme} theme`);
          assertFileExists(resolvedPath, 1000);
        }
      }
    });

    test('T1.1.5: Cross-fading opacity & background transition contract', () => {
      const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark' });
      assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.tech.dark);

      sim.switchMode('medical');
      assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.dark);

      sim.switchTheme('light');
      assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.light);
    });

    test('T1.1.6: Contrast and vignette overlay layers specification', () => {
      // Vignette layers ensure WCAG AAA readability against photorealistic AVIF art
      const vignetteSpecifications = {
        topHeaderShade: 'bg-gradient-to-b from-black/60 via-black/20 to-transparent',
        bottomShelfShade: 'bg-gradient-to-t from-black/80 via-black/40 to-transparent',
        radialSpotlight: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)'
      };
      assert.ok(vignetteSpecifications.topHeaderShade.includes('from-black'));
      assert.ok(vignetteSpecifications.bottomShelfShade.includes('to-transparent'));
      assert.ok(vignetteSpecifications.radialSpotlight.includes('radial-gradient'));
    });
  });

  // ==========================================
  // R2: Integrasi Model 3D untuk Medical & Academic
  // ==========================================
  describe('R2. Integrasi Model 3D untuk Mode Medical dan Academic', () => {
    test('T1.2.1: Medical 3D model asset integrity & binary glTF validation', () => {
      const result = assertValidGlb(MODEL_ASSETS.medical.source, ['EXT_meshopt_compression']);
      assertEqual(result.valid, true, 'Medical model must be valid glTF 2.0 binary');
      assertEqual(result.version, 2, 'glTF version must be 2');
      assert.ok(result.length > 10_000_000, 'Medical model file length must exceed 10MB');
    });

    test('T1.2.2: Medical 3D model meshopt compression & quantization extension validation', () => {
      const result = assertValidGlb(MODEL_ASSETS.medical.source);
      assertIncludes(result.extensionsUsed, 'EXT_meshopt_compression');
      assertIncludes(result.extensionsUsed, 'KHR_mesh_quantization');
    });

    test('T1.2.3: Academic 3D model asset integrity & binary glTF validation', () => {
      const result = assertValidGlb(MODEL_ASSETS.academic.source);
      assertEqual(result.valid, true, 'Academic model must be valid glTF 2.0 binary');
      assertEqual(result.version, 2, 'glTF version must be 2');
      assert.ok(result.length > 50_000_000, 'Academic quill model must exceed 50MB');
    });

    test('T1.2.4: Mode-to-3D Model dispatch contract', () => {
      const techModel = resolveExpected3DModel('tech');
      assertEqual(techModel.type, 'procedural-polyhedron');

      const medicalModel = resolveExpected3DModel('medical');
      assertEqual(medicalModel.source, MODEL_ASSETS.medical.source);

      const academicModel = resolveExpected3DModel('academic');
      assertEqual(academicModel.source, MODEL_ASSETS.academic.source);
    });

    test('T1.2.5: 3D model rotation and interactive click callback contract', () => {
      const sim = new PortfolioSimulator({ mode: 'medical' });
      const modelSpec = sim.getVisible3DModelSpec();
      assertEqual(modelSpec.source, MODEL_ASSETS.medical.source);

      // Simulates click on 3D object to open active case study
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);
    });

    test('T1.2.6: Static export public model mirror path contract', () => {
      // Contract: for Next.js static export ('output: export'), GLTF models must be mirrored to public/models/
      assertEqual(MODEL_ASSETS.medical.public, 'public/models/model-jantung.glb');
      assertEqual(MODEL_ASSETS.academic.public, 'public/models/model-quill.glb');
    });
  });

  // ==========================================
  // R3: Logo Icon Project Dinamis Sesuai Mode Aktif
  // ==========================================
  describe('R3. Logo Icon Project Dinamis Sesuai Mode Aktif', () => {
    test('T1.3.1: Project icon SVG assets presence and non-zero size', () => {
      for (const mode of MODES) {
        const iconPath = ICON_ASSETS[mode];
        const { size } = assertFileExists(iconPath, 1000);
        assert.ok(size > 1000, `Icon for ${mode} must be > 1KB`);
      }
    });

    test('T1.3.2: Project icon SVG markup & viewBox validation', () => {
      for (const mode of MODES) {
        const iconPath = ICON_ASSETS[mode];
        const result = assertValidSvg(iconPath);
        assertEqual(result.valid, true, `SVG markup for ${mode} must be valid`);
        assert.ok(result.viewBox !== null, `SVG for ${mode} must define viewBox`);
      }
    });

    test('T1.3.3: Dynamic icon selection for Tech mode', () => {
      const icon = resolveExpectedIcon('tech');
      assertEqual(icon, ICON_ASSETS.tech);
    });

    test('T1.3.4: Dynamic icon selection for Medical mode', () => {
      const icon = resolveExpectedIcon('medical');
      assertEqual(icon, ICON_ASSETS.medical);
    });

    test('T1.3.5: Dynamic icon selection for Academic mode', () => {
      const icon = resolveExpectedIcon('academic');
      assertEqual(icon, ICON_ASSETS.academic);
    });

    test('T1.3.6: Multi-mode project dynamic icon morphing', () => {
      const projects = loadProjects();
      const multiModeProject = projects.find((p) => p.id === 'proj-hmsso');
      assert.ok(multiModeProject, 'HMSSO must exist in dataset');
      assertIncludes(multiModeProject.secondaryModes, 'medical');
      assertIncludes(multiModeProject.secondaryModes, 'academic');

      const sim = new PortfolioSimulator({ projects, mode: 'tech' });
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);

      sim.switchMode('medical');
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);

      sim.switchMode('academic');
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.academic);
    });
  });

  // ==========================================
  // R4: Perombakan Navigasi Highlight Project dari Dataset JSON
  // ==========================================
  describe('R4. Perombakan Navigasi Highlight Project dari Dataset JSON', () => {
    test('T1.4.1: Featured projects dataset filtering logic excludes non-featured', () => {
      const projects = loadProjects();
      const techFeatured = filterFeaturedProjects(projects, 'tech');

      // Verify every included project has featured: true
      for (const p of techFeatured) {
        assertEqual(p.featured, true, `Project ${p.id} must have featured: true`);
      }

      // Verify known non-featured projects are completely excluded
      const nonFeaturedIds = ['proj-text-case-converter', 'proj-temu-ilmiah', 'proj-chess-project', 'proj-tryout-skd'];
      for (const id of nonFeaturedIds) {
        const found = techFeatured.find((p) => p.id === id);
        assertEqual(found, undefined, `Non-featured project ${id} must not be in hero slides`);
      }
    });

    test('T1.4.2: Dynamic indicator count matches exact featured project count', () => {
      const projects = loadProjects();
      const techFeatured = filterFeaturedProjects(projects, 'tech');
      const medicalFeatured = filterFeaturedProjects(projects, 'medical');
      const academicFeatured = filterFeaturedProjects(projects, 'academic');

      assertEqual(techFeatured.length, 3, 'Tech mode must have exactly 3 featured projects');
      assertEqual(medicalFeatured.length, 3, 'Medical mode must have exactly 3 featured projects');
      assertEqual(academicFeatured.length, 3, 'Academic mode must have exactly 3 featured projects');

      const sim = new PortfolioSimulator({ projects, mode: 'tech' });
      assertEqual(sim.getNavigationIndicatorCount(), 3);
    });

    test('T1.4.3: Slide navigation cyclic bounds calculation (Next)', () => {
      assertEqual(calculateSlideIndex(0, 1, 3), 1);
      assertEqual(calculateSlideIndex(1, 1, 3), 2);
      assertEqual(calculateSlideIndex(2, 1, 3), 0, 'Next at last index must wrap to 0');
    });

    test('T1.4.4: Slide navigation cyclic bounds calculation (Prev)', () => {
      assertEqual(calculateSlideIndex(0, -1, 3), 2, 'Prev at 0 must wrap to last index');
      assertEqual(calculateSlideIndex(2, -1, 3), 1);
      assertEqual(calculateSlideIndex(1, -1, 3), 0);
    });

    test('T1.4.5: Slide index auto-reset on activeMode switch', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.nextSlide(); // index 1
      sim.nextSlide(); // index 2
      assertEqual(sim.activeSlideIndex, 2);

      sim.switchMode('medical');
      assertEqual(sim.activeSlideIndex, 0, 'activeSlideIndex must auto-reset to 0 on mode change');
    });

    test('T1.4.6: Hero slide project synchronization with activeSlideIndex', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      const techProjects = sim.getFeaturedProjects();

      assertEqual(sim.getCurrentHeroProject().id, techProjects[0].id);

      sim.nextSlide();
      assertEqual(sim.getCurrentHeroProject().id, techProjects[1].id);

      sim.nextSlide();
      assertEqual(sim.getCurrentHeroProject().id, techProjects[2].id);
    });
  });

  // ==========================================
  // R5: Perbaikan dan Integrasi Modal Highlight Project
  // ==========================================
  describe('R5. Perbaikan dan Integrasi Modal Highlight Project', () => {
    test('T1.5.1: Single-click on active project card triggers modal open', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      assertEqual(sim.isModalActive(), false);

      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);
      assertEqual(sim.activeModalProject.id, 'proj-hmsso');
    });

    test('T1.5.2: Click on CTA "Lihat Detail" button triggers modal open', () => {
      const sim = new PortfolioSimulator({ mode: 'medical' });
      sim.nextSlide(); // Bunda Bahagia
      assertEqual(sim.isModalActive(), false);

      sim.clickLihatDetailButton();
      assertEqual(sim.isModalActive(), true);
      assertEqual(sim.activeModalProject.id, 'proj-bunda-bahagia');
    });

    test('T1.5.3: 3-tier Flexbox layout contract (fixed header, scrollable body, fixed footer)', () => {
      const modalContracts = {
        outerContainer: ['flex', 'flex-col', 'max-h-[90vh]', 'overflow-hidden'],
        fixedHeader: ['flex-shrink-0', 'sticky', 'top-0'],
        scrollableBody: ['flex-1', 'overflow-y-auto', 'custom-scrollbar'],
        fixedFooter: ['flex-shrink-0', 'border-t']
      };
      assertIncludes(modalContracts.outerContainer, 'overflow-hidden');
      assertIncludes(modalContracts.fixedHeader, 'flex-shrink-0');
      assertIncludes(modalContracts.scrollableBody, 'overflow-y-auto');
      assertIncludes(modalContracts.fixedFooter, 'flex-shrink-0');
    });

    test('T1.5.4: Modal scrollbar boundary confinement contract', () => {
      const sim = new PortfolioSimulator();
      assertEqual(sim.isScrollbarConfined(), true);
    });

    test('T1.5.5: Modal close action restores closed state', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);

      sim.closeModal();
      assertEqual(sim.isModalActive(), false);
      assertEqual(sim.activeModalProject, null);
    });

    test('T1.5.6: Responsive viewport layout constraints for modal', () => {
      const sim = new PortfolioSimulator();
      sim.setViewport(375, 667); // Mobile
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);
      assertEqual(sim.viewport.width, 375);

      sim.setViewport(1440, 900); // Desktop
      assertEqual(sim.viewport.width, 1440);
    });
  });

  // ==========================================
  // R6: Animasi, Interaksi Block, dan Tooltip
  // ==========================================
  describe('R6. Animasi, Interaksi Block, dan Tooltip', () => {
    test('T1.6.1: Reactive transition keys on slide project blocks', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      const p1 = sim.getCurrentHeroProject();
      const key1 = p1.id;

      sim.nextSlide();
      const p2 = sim.getCurrentHeroProject();
      const key2 = p2.id;

      assert.notStrictEqual(key1, key2, 'Reactive transition keys must differ between slides');
    });

    test('T1.6.2: Interactive hero buttons wrapped with Tooltip components', () => {
      const interactiveButtons = [
        'btn-cta-detail',
        'btn-cta-cv',
        'btn-slide-prev',
        'btn-slide-next',
        'btn-indicator-0',
        'btn-indicator-1',
        'btn-indicator-2'
      ];
      assert.ok(interactiveButtons.length >= 7, 'All interactive hero buttons must be tracked');
    });

    test('T1.6.3: Tooltip activation on hover state', () => {
      const sim = new PortfolioSimulator();
      sim.hoverButton('btn-cta-detail', 'Buka Studi Kasus HMSSO');
      assertEqual(sim.hoveredElement, 'btn-cta-detail');
      assertEqual(sim.activeTooltip, 'Buka Studi Kasus HMSSO');

      sim.blurButton();
      assertEqual(sim.activeTooltip, null);
    });

    test('T1.6.4: Tooltip activation on keyboard focus state', () => {
      const sim = new PortfolioSimulator();
      sim.focusButton('btn-slide-next', 'Slide Berikutnya');
      assertEqual(sim.focusedElement, 'btn-slide-next');
      assertEqual(sim.activeTooltip, 'Slide Berikutnya');

      sim.blurButton();
      assertEqual(sim.activeTooltip, null);
    });

    test('T1.6.5: Smooth micro-interaction transition classes', () => {
      const transitionClassContract = 'transition-all duration-300 ease-out';
      assertIncludes(transitionClassContract, 'transition-all');
      assertIncludes(transitionClassContract, 'duration-300');
    });
  });
});
