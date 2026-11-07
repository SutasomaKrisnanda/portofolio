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
  loadProjects,
  VIEWPORTS
} from './helpers/fixtures.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 4: Real-World Application Scenarios (User Walkthroughs)', () => {
  test('T4.1: Tech Portfolio Exploration Walkthrough', () => {
    const projects = loadProjects();
    const sim = new PortfolioSimulator({ projects, mode: 'tech', theme: 'dark' });

    // Step 1: Initial load in Tech mode
    assertEqual(sim.activeMode, 'tech');
    assertEqual(sim.resolvedTheme, 'dark');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.tech.dark);
    assertEqual(sim.getVisible3DModelSpec().type, 'procedural-polyhedron');

    // Step 2: Verify featured projects list
    const featured = sim.getFeaturedProjects();
    assertEqual(featured.length, 3);
    assertEqual(featured[0].id, 'proj-hmsso');
    assertEqual(featured[1].id, 'proj-hmj-kedokteran');
    assertEqual(featured[2].id, 'proj-sipadu-ri');

    // Step 3: Inspect active slide 0 (HMSSO)
    const current = sim.getCurrentHeroProject();
    assertEqual(current.id, 'proj-hmsso');
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.tech);

    // Step 4: Hover over next slide button (tooltip appears)
    sim.hoverButton('btn-slide-next', 'Slide Berikutnya');
    assertEqual(sim.activeTooltip, 'Slide Berikutnya');

    // Step 5: Click next slide -> moves to HMJ Kedokteran (slide 1)
    sim.nextSlide();
    assertEqual(sim.activeSlideIndex, 1);
    assertEqual(sim.getCurrentHeroProject().id, 'proj-hmj-kedokteran');

    // Step 6: Click "Lihat Detail" button -> opens modal
    sim.clickLihatDetailButton();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.activeModalProject.id, 'proj-hmj-kedokteran');
    assertEqual(sim.isTitlePinned(), true);
    assertEqual(sim.isScrollbarConfined(), true);

    // Step 7: Press Escape key -> modal closes
    sim.pressEscape();
    assertEqual(sim.isModalActive(), false);
    assertEqual(sim.activeModalProject, null);
  });

  test('T4.2: Medical Portfolio Clinical Walkthrough', () => {
    const projects = loadProjects();
    const sim = new PortfolioSimulator({ projects, mode: 'tech', theme: 'dark' });

    // Step 1: User switches mode from Tech to Medical
    sim.switchMode('medical');
    assertEqual(sim.activeMode, 'medical');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.medical.dark);
    assertEqual(sim.getVisible3DModelSpec().source, MODEL_ASSETS.medical.source);
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.medical);
    assertEqual(sim.activeSlideIndex, 0);

    // Step 2: Verify Medical featured project list
    const medicalFeatured = sim.getFeaturedProjects();
    assertEqual(medicalFeatured.length, 3);
    assertEqual(medicalFeatured[0].id, 'proj-hmsso');
    assertEqual(medicalFeatured[1].id, 'proj-bunda-bahagia');
    assertEqual(medicalFeatured[2].id, 'proj-hmj-kedokteran');

    // Step 3: Navigate to slide 1 (Bunda Bahagia)
    sim.nextSlide();
    assertEqual(sim.activeSlideIndex, 1);
    const bundaBahagia = sim.getCurrentHeroProject();
    assertEqual(bundaBahagia.id, 'proj-bunda-bahagia');
    assertEqual(bundaBahagia.mode, 'medical');

    // Step 4: Click active project card -> opens modal
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.activeModalProject.id, 'proj-bunda-bahagia');
    assertIncludes(sim.activeModalProject.technologies, 'Protokol MBSR');

    // Step 5: Click modal backdrop -> closes modal
    sim.clickBackdrop();
    assertEqual(sim.isModalActive(), false);
  });

  test('T4.3: Academic Portfolio Research Walkthrough', () => {
    const projects = loadProjects();
    const sim = new PortfolioSimulator({ projects, mode: 'tech', theme: 'dark' });

    // Step 1: User switches mode to Academic
    sim.switchMode('academic');
    assertEqual(sim.activeMode, 'academic');
    assertEqual(sim.getVisibleBackgroundAsset(), BACKGROUND_ASSETS.academic.dark);
    assertEqual(sim.getVisible3DModelSpec().source, MODEL_ASSETS.academic.source);
    assertEqual(sim.getVisibleProjectIcon(), ICON_ASSETS.academic);

    // Step 2: Verify Academic featured list
    const academicFeatured = sim.getFeaturedProjects();
    assertEqual(academicFeatured.length, 3);
    assertEqual(academicFeatured[0].id, 'proj-hmsso');
    assertEqual(academicFeatured[1].id, 'proj-bunda-bahagia');
    assertEqual(academicFeatured[2].id, 'proj-sipadu-ri');

    // Step 3: Navigate to slide 2 (SIPADU RI)
    sim.goToSlide(2);
    assertEqual(sim.activeSlideIndex, 2);
    assertEqual(sim.getCurrentHeroProject().id, 'proj-sipadu-ri');

    // Step 4: Click active card -> opens modal
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.activeModalProject.id, 'proj-sipadu-ri');

    // Step 5: Close modal via close button
    sim.closeModal();
    assertEqual(sim.isModalActive(), false);
  });

  test('T4.4: Complete Theme Inversion Matrix (All 3 Modes in Light & Dark)', () => {
    const sim = new PortfolioSimulator();

    const walkThroughMatrix = [
      { mode: 'tech', theme: 'dark', expectedBg: BACKGROUND_ASSETS.tech.dark, expectedIcon: ICON_ASSETS.tech },
      { mode: 'tech', theme: 'light', expectedBg: BACKGROUND_ASSETS.tech.light, expectedIcon: ICON_ASSETS.tech },
      { mode: 'medical', theme: 'dark', expectedBg: BACKGROUND_ASSETS.medical.dark, expectedIcon: ICON_ASSETS.medical },
      { mode: 'medical', theme: 'light', expectedBg: BACKGROUND_ASSETS.medical.light, expectedIcon: ICON_ASSETS.medical },
      { mode: 'academic', theme: 'dark', expectedBg: BACKGROUND_ASSETS.academic.dark, expectedIcon: ICON_ASSETS.academic },
      { mode: 'academic', theme: 'light', expectedBg: BACKGROUND_ASSETS.academic.light, expectedIcon: ICON_ASSETS.academic }
    ];

    for (const step of walkThroughMatrix) {
      sim.switchMode(step.mode);
      sim.switchTheme(step.theme);
      assertEqual(sim.activeMode, step.mode);
      assertEqual(sim.resolvedTheme, step.theme);
      assertEqual(sim.getVisibleBackgroundAsset(), step.expectedBg);
      assertEqual(sim.getVisibleProjectIcon(), step.expectedIcon);
    }
  });

  test('T4.5: Responsive Viewport Adaptation Walkthrough', () => {
    const sim = new PortfolioSimulator();

    // 1. Mobile Small (320x568)
    sim.setViewport(VIEWPORTS.mobileSmall.width, VIEWPORTS.mobileSmall.height);
    assertEqual(sim.viewport.width, 320);
    sim.clickActiveProjectCard();
    assertEqual(sim.isModalActive(), true);
    assertEqual(sim.isScrollbarConfined(), true);
    sim.closeModal();

    // 2. Mobile Standard (375x667)
    sim.setViewport(VIEWPORTS.mobileStandard.width, VIEWPORTS.mobileStandard.height);
    assertEqual(sim.viewport.width, 375);

    // 3. Tablet (768x1024)
    sim.setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
    assertEqual(sim.viewport.width, 768);

    // 4. Desktop (1440x900)
    sim.setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
    assertEqual(sim.viewport.width, 1440);

    // 5. Ultrawide 4K (3840x2160)
    sim.setViewport(VIEWPORTS.ultrawide.width, VIEWPORTS.ultrawide.height);
    assertEqual(sim.viewport.width, 3840);
  });
});
