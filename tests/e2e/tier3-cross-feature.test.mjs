import { test, describe } from 'node:test';
import {
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assert
} from './helpers/assertions.mjs';
import {
  BACKGROUND_ASSETS,
  MODEL_ASSETS,
  ICON_ASSETS,
  loadProjects
} from './helpers/fixtures.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 3: Cross-Feature Combinations (Pairwise Interactions)', () => {
  test('T3.1: Mode Change + Modal Lifecycle Interaction', () => {
    const projects = loadProjects();
    const sim = new PortfolioSimulator({ projects, mode: 'tech' });

    // 1. Open modal in Tech mode
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.activeModalProject.id, 'proj-hmsso');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);

    // 2. Close modal
    sim.closeModal();
    assertEqual(sim.isModalActive(), false);

    // 3. Switch to Medical mode
    sim.switchMode('medical');
    assertEqual(sim.activeMode, 'medical');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);

    // 4. Navigate to next project and open modal
    sim.nextSlide(); // Bunda Bahagia
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.activeModalProject.id, 'proj-bunda-bahagia');
    assertEqual(sim.activeModalProject.mode, 'medical');
  });

  test('T3.2: Mode Change + Slide Navigation Index Reset', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    assertEqual(sim.activeSlideIndex, 0);

    // Navigate to slide index 2 (SIPADU RI in tech mode)
    sim.nextSlide();
    sim.nextSlide();
    assertEqual(sim.activeSlideIndex, 2);
    assertEqual(sim.getCurrentHeroProject().id, 'proj-sipadu-ri');

    // Switch mode to Academic -> index must reset to 0
    sim.switchMode('academic');
    assertEqual(sim.activeSlideIndex, 0, 'Slide index must reset to 0 when mode changes');
    assertEqual(sim.getCurrentHeroProject().id, 'proj-hmsso');
  });

  test('T3.3: Multi-Mode Project Icon Dynamic Morphing (proj-hmsso across 3 modes)', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    // In Tech mode: slide 0 is HMSSO
    assertEqual(sim.getCurrentHeroProject().id, 'proj-hmsso');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);

    // Switch to Medical: slide 0 is still HMSSO, but icon must morph to medical
    sim.switchMode('medical');
    assertEqual(sim.getCurrentHeroProject().id, 'proj-hmsso');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);

    // Switch to Academic: slide 0 is still HMSSO, icon must morph to academic
    sim.switchMode('academic');
    assertEqual(sim.getCurrentHeroProject().id, 'proj-hmsso');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.academic);
  });

  test('T3.4: Mode Switch + 3D Model Swap + Background Image Synchronous State Update', () => {
    const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark' });

    // Initial Tech state
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.tech.dark);
    assertEqual(sim.getVisible3DModelSpec().type, 'procedural-polyhedron');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);

    // Concurrently updates all presentation facets on mode switch to Medical
    sim.switchMode('medical');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.dark);
    assertEqual(sim.getVisible3DModelSpec().source, MODEL_ASSETS.medical.source);
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);
    assertEqual(sim.getFeaturedProjects().length, 3);

    // Concurrently updates all presentation facets on mode switch to Academic
    sim.switchMode('academic');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.academic.dark);
    assertEqual(sim.getVisible3DModelSpec().source, MODEL_ASSETS.academic.source);
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.academic);
  });

  test('T3.5: Modal Open Blocks Background Keyboard Slide Navigation', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    assertEqual(sim.activeSlideIndex, 0);

    // Open modal
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);

    // Simulated trapped keyboard handler:
    const handleKeyDown = (e) => {
      if (sim.isModalActive()) {
        if (e.key === 'Escape') {
          sim.pressEscape();
        }
        // Suppress background navigation arrows when modal is open
        return;
      }
      if (e.key === 'ArrowRight') sim.nextSlide();
      if (e.key === 'ArrowLeft') sim.prevSlide();
    };

    // Press right arrow while modal is open
    handleKeyDown({ key: 'ArrowRight' });
    assertEqual(sim.activeSlideIndex, 0, 'Slide index must NOT change while modal is open');

    // Press escape to close modal
    handleKeyDown({ key: 'Escape' });
    assertEqual(sim.isModalActive(), false);

    // Press right arrow now that modal is closed
    handleKeyDown({ key: 'ArrowRight' });
    assertEqual(sim.activeSlideIndex, 1, 'Slide index can change once modal is closed');
  });

  test('T3.6: Slide Navigation + Tooltip Reactive Synchronization', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    const featured = sim.getFeaturedProjects();

    // Hover over indicator for slide 1
    sim.hoverButton('btn-indicator-1', featured[1].title);
    assertEqual(sim.activeTooltip, featured[1].title);

    // Click indicator 1
    sim.goToSlide(1);
    assertEqual(sim.activeSlideIndex, 1);
    assertEqual(sim.getCurrentHeroProject().id, featured[1].id);

    // Blur button
    sim.blurButton();
    assertEqual(sim.activeTooltip, null);
  });

  test('T3.7: Theme Switch (Dark <-> Light) across all 3 modes preserves contrast & 3D theme lighting', () => {
    const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark' });

    const stateTransitions = [
      { mode: 'tech', theme: 'dark', expectedBg: BACKGROUND_ASSETS.tech.dark },
      { mode: 'tech', theme: 'light', expectedBg: BACKGROUND_ASSETS.tech.light },
      { mode: 'medical', theme: 'light', expectedBg: BACKGROUND_ASSETS.medical.light },
      { mode: 'medical', theme: 'dark', expectedBg: BACKGROUND_ASSETS.medical.dark },
      { mode: 'academic', theme: 'dark', expectedBg: BACKGROUND_ASSETS.academic.dark },
      { mode: 'academic', theme: 'light', expectedBg: BACKGROUND_ASSETS.academic.light }
    ];

    for (const step of stateTransitions) {
      sim.switchMode(step.mode);
      sim.switchTheme(step.theme);
      assertEqual(sim.getVisibleBackgroundAsset(), step.expectedBg);
    }
  });

  test('T3.8: Direct URL / LocalStorage Mode Initialization (?mode=medical)', () => {
    // Simulates URL search param initialization ?mode=medical
    const urlParams = new URLSearchParams('?mode=medical');
    const initialMode = urlParams.get('mode') || 'tech';

    const sim = new PortfolioSimulator({ mode: initialMode, theme: 'dark' });
    assertEqual(sim.activeMode, 'medical');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.dark);
    assertEqual(sim.getVisible3DModelSpec().source, MODEL_ASSETS.medical.source);
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);
    assertEqual(sim.activeSlideIndex, 0);
  });
});
