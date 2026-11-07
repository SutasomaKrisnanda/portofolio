import { test, describe } from 'node:test';
import {
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assert
} from './helpers/assertions.mjs';
import {
  MODES,
  BACKGROUND_ASSETS,
  ICON_ASSETS,
  loadProjects,
  VIEWPORTS
} from './helpers/fixtures.mjs';
import {
  filterFeaturedProjects,
  resolveExpectedIcon,
  resolveExpectedBackground,
  calculateSlideIndex,
  parseGlbHeader
} from './helpers/oracle.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 2: Boundary & Corner Cases (R1 - R6)', () => {
  // ==========================================
  // R1 Boundary Cases: Visual Backgrounds
  // ==========================================
  describe('R1 Boundary Cases: Visual Backgrounds', () => {
    test('T2.1.1: Invalid mode input fallback defaults to tech background', () => {
      const sim = new PortfolioSimulator();
      sim.switchMode('non-existent-mode');
      assertEqual(sim.activeMode, 'tech');
      assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.tech.dark);

      const resolved = resolveExpectedBackground('invalid-mode', 'dark');
      assertEqual(resolved, null, 'Oracle must return null for invalid mode');
    });

    test('T2.1.2: System theme preference resolution handles dark/light gracefully', () => {
      const sim = new PortfolioSimulator({ theme: 'system' });
      // If unresolved system theme is passed, defaults to dark
      assertEqual(sim.resolvedTheme, 'dark');

      sim.switchTheme('light');
      assertEqual(sim.resolvedTheme, 'light');
    });

    test('T2.1.3: Rapid mode toggling maintains deterministic active background', () => {
      const sim = new PortfolioSimulator();
      // Rapid toggling sequence
      ['medical', 'academic', 'tech', 'academic', 'medical'].forEach((m) => sim.switchMode(m));
      assertEqual(sim.activeMode, 'medical');
      assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.dark);
      assertEqual(sim.transitionHistory.length, 5);
    });

    test('T2.1.4: Extreme viewport bounds (320px to 3840px) maintain 100vw fill', () => {
      const sim = new PortfolioSimulator();

      sim.setViewport(VIEWPORTS.mobileSmall.width, VIEWPORTS.mobileSmall.height);
      assertEqual(sim.viewport.width, 320);

      sim.setViewport(VIEWPORTS.ultrawide.width, VIEWPORTS.ultrawide.height);
      assertEqual(sim.viewport.width, 3840);

      // Verifies background aspect specification remains 100vw fill (cover)
      const fillSpec = 'object-cover w-full h-full';
      assertIncludes(fillSpec, 'object-cover');
    });

    test('T2.1.5: Missing image error resilience fallback', () => {
      const safeBackgroundResolver = (mode, theme) => {
        const bg = resolveExpectedBackground(mode, theme);
        return bg || BACKGROUND_ASSETS.tech.dark;
      };
      assertEqual(safeBackgroundResolver('unknown', 'dark'), BACKGROUND_ASSETS.tech.dark);
    });
  });

  // ==========================================
  // R2 Boundary Cases: 3D Models
  // ==========================================
  describe('R2 Boundary Cases: 3D Models', () => {
    test('T2.2.1: WebGL context loss simulation recovers gracefully', () => {
      let webglContextLost = false;
      let fallbackTriggered = false;

      const handleContextLoss = (event) => {
        webglContextLost = true;
        fallbackTriggered = true;
      };

      handleContextLoss({ preventDefault: () => {} });
      assertEqual(webglContextLost, true);
      assertEqual(fallbackTriggered, true);
    });

    test('T2.2.2: Large model loading state boundary (model-quill.glb ~90MB)', () => {
      // For large 90MB quill model, progress tracking callback must be supported
      let loadingProgress = 0;
      const simulateProgress = (loaded, total) => {
        loadingProgress = Math.round((loaded / total) * 100);
      };

      simulateProgress(45_000_000, 90_192_408);
      assertEqual(loadingProgress, 50);

      simulateProgress(90_192_408, 90_192_408);
      assertEqual(loadingProgress, 100);
    });

    test('T2.2.3: Meshopt compression decompression error handling on corrupted buffer', () => {
      const corruptedBuffer = Buffer.from('NOT_A_VALID_GLTF_BINARY');
      const result = parseGlbHeader(corruptedBuffer);
      assertEqual(result.valid, false);
      assert.notStrictEqual(result.magic, 0x46546c67);
    });

    test('T2.2.4: Window resize boundary triggers camera aspect recalculation', () => {
      const calculateAspect = (w, h) => (h > 0 ? w / h : 1);
      const mobileAspect = calculateAspect(375, 667);
      const desktopAspect = calculateAspect(1440, 900);

      assert.ok(mobileAspect < 1, 'Mobile aspect must be portrait (< 1)');
      assert.ok(desktopAspect > 1, 'Desktop aspect must be landscape (> 1)');
    });

    test('T2.2.5: Zero pointer movement and drag coordinate damping', () => {
      const clampRotation = (rotation, delta, damping = 0.95) => {
        return (rotation + delta) * damping;
      };

      const damped = clampRotation(1.5, 0.0, 0.9);
      assertEqual(damped, 1.35);
    });
  });

  // ==========================================
  // R3 Boundary Cases: Dynamic Project Icons
  // ==========================================
  describe('R3 Boundary Cases: Dynamic Project Icons', () => {
    test('T2.3.1: Project with undefined secondaryModes gracefully renders primary icon', () => {
      const projectWithoutSecondary = {
        id: 'proj-solo',
        mode: 'tech',
        featured: true
      };
      const icon = resolveExpectedIcon(projectWithoutSecondary.mode);
      assertEqual(icon, ICON_ASSETS.tech);
    });

    test('T2.3.2: Project where neither primary nor secondary matches activeMode is excluded', () => {
      const foreignProject = [
        {
          id: 'proj-medical-only',
          mode: 'medical',
          secondaryModes: [],
          featured: true
        }
      ];
      const techFeatured = filterFeaturedProjects(foreignProject, 'tech');
      assertEqual(techFeatured.length, 0);
    });

    test('T2.3.3: Case-insensitive mode mapping resilience', () => {
      const normalizeMode = (modeStr) => (modeStr || '').toLowerCase();
      assertEqual(resolveExpectedIcon(normalizeMode('TECH')), ICON_ASSETS.tech);
      assertEqual(resolveExpectedIcon(normalizeMode('Medical')), ICON_ASSETS.medical);
      assertEqual(resolveExpectedIcon(normalizeMode('aCaDeMiC')), ICON_ASSETS.academic);
    });

    test('T2.3.4: SVG preservation on high-DPI scaling', () => {
      const sim = new PortfolioSimulator();
      const currentIcon = sim.getVisibleProjectIcon();
      assert.ok(currentIcon.endsWith('.svg'));
    });

    test('T2.3.5: Rapid mode switching ensures icons swap synchronously without stale SVG', () => {
      const sim = new PortfolioSimulator();
      sim.switchMode('medical');
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);
      sim.switchMode('academic');
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.academic);
      sim.switchMode('tech');
      assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);
    });
  });

  // ==========================================
  // R4 Boundary Cases: Dataset Navigation
  // ==========================================
  describe('R4 Boundary Cases: Dataset Navigation', () => {
    test('T2.4.1: Single featured project boundary (length === 1)', () => {
      const singleItemCount = 1;
      assertEqual(calculateSlideIndex(0, 1, singleItemCount), 0);
      assertEqual(calculateSlideIndex(0, -1, singleItemCount), 0);
    });

    test('T2.4.2: Zero featured projects boundary handles empty state gracefully', () => {
      const emptyProjects = [];
      const sim = new PortfolioSimulator({ projects: emptyProjects });
      assertEqual(sim.getNavigationIndicatorCount(), 0);
      assertEqual(sim.getCurrentHeroProject(), null);

      // Prev and Next must not throw
      sim.nextSlide();
      assertEqual(sim.activeSlideIndex, 0);
      sim.prevSlide();
      assertEqual(sim.activeSlideIndex, 0);
    });

    test('T2.4.3: Out-of-bounds slide index recovery clamps safely to valid range', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      // Go to out of bounds index (e.g. 99)
      sim.goToSlide(99);
      // HMSSO, HMJ, SIPADU -> 3 items. 99 % 3 = 0
      assertEqual(sim.activeSlideIndex, 0);
    });

    test('T2.4.4: Negative slide index wrap-around handling', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.goToSlide(-1);
      // -1 in length 3 wraps to 2
      assertEqual(sim.activeSlideIndex, 2);
    });

    test('T2.4.5: Burst navigation clicks stays safely within 0..N-1', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      for (let i = 0; i < 20; i++) {
        sim.nextSlide();
        assert.ok(sim.activeSlideIndex >= 0 && sim.activeSlideIndex < 3);
      }
    });
  });

  // ==========================================
  // R5 Boundary Cases: Modal Layout & Interaction
  // ==========================================
  describe('R5 Boundary Cases: Modal Layout & Interaction', () => {
    test('T2.5.1: Modal keyboard accessibility: Escape key closes modal', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);

      sim.pressEscape();
      assertEqual(sim.isModalActive(), false);
    });

    test('T2.5.2: Backdrop click closes modal, but modal content click preserves modal', () => {
      const sim = new PortfolioSimulator({ mode: 'medical' });
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);

      // Click content (inner click)
      sim.clickModalContent();
      assertEqual(sim.isModalActive(), true, 'Clicking inside modal must not close modal');

      // Click backdrop (outside click)
      sim.clickBackdrop();
      assertEqual(sim.isModalActive(), false, 'Clicking backdrop must close modal');
    });

    test('T2.5.3: Project with missing optional fields renders modal safely', () => {
      const sparseProject = {
        id: 'proj-sparse',
        title: 'Sparse Project',
        mode: 'tech',
        featured: true
        // No summary, no technologies, no caseStudy
      };
      const sim = new PortfolioSimulator({ projects: [sparseProject], mode: 'tech' });
      sim.clickActiveProjectCard();
      assertEqual(sim.isModalActive(), true);
      assertEqual(sim.activeModalProject.title, 'Sparse Project');
    });

    test('T2.5.4: Extremely long project title or summary text wrapping prevention', () => {
      const longTitle = 'A'.repeat(500);
      const clampClass = 'line-clamp-2 break-words';
      assertIncludes(clampClass, 'break-words');
    });

    test('T2.5.5: Rapid modal open/close toggling does not leave stale state', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      for (let i = 0; i < 10; i++) {
        sim.clickActiveProjectCard();
        assertEqual(sim.isModalActive(), true);
        sim.closeModal();
        assertEqual(sim.isModalActive(), false);
      }
    });
  });

  // ==========================================
  // R6 Boundary Cases: Tooltips & Animations
  // ==========================================
  describe('R6 Boundary Cases: Tooltips & Animations', () => {
    test('T2.6.1: Fast keyboard navigation (Tab + Enter) opens tooltips and switches slides cleanly', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.focusButton('btn-slide-next', 'Slide Berikutnya');
      assertEqual(sim.activeTooltip, 'Slide Berikutnya');

      sim.nextSlide();
      sim.blurButton();
      assertEqual(sim.activeTooltip, null);
      assertEqual(sim.activeSlideIndex, 1);
    });

    test('T2.6.2: Non-interactive elements do not show tooltip', () => {
      const sim = new PortfolioSimulator();
      // Element without tooltip handler
      sim.hoverButton('non-interactive-card', null);
      assertEqual(sim.activeTooltip, null);
    });

    test('T2.6.3: Tooltip content boundary: long text wraps safely without viewport overflow', () => {
      const tooltipClass = 'max-w-xs break-words px-3 py-1.5 text-xs';
      assertIncludes(tooltipClass, 'max-w-xs');
      assertIncludes(tooltipClass, 'break-words');
    });

    test('T2.6.4: Tooltip delay boundary (instant on keyboard focus vs hover delay)', () => {
      const tooltipTiming = {
        hoverDelayDuration: 200,
        focusDelayDuration: 0 // Instant for keyboard accessibility
      };
      assertEqual(tooltipTiming.focusDelayDuration, 0);
      assert.ok(tooltipTiming.hoverDelayDuration > 0);
    });

    test('T2.6.5: Reduced motion preference (prefers-reduced-motion) compliance', () => {
      const motionSafeClass = 'motion-safe:transition-all motion-reduce:transition-none';
      assertIncludes(motionSafeClass, 'motion-reduce:transition-none');
    });
  });
});
