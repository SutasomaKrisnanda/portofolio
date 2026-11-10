import { test, describe } from 'node:test';
import {
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertValidProceduralModel,
  assertValidBentoLayout,
  assert
} from './helpers/assertions.mjs';
import {
  MODES,
  THEMES,
  VIEWPORTS,
  BENTO_GRID_SPECS,
  ICON_ASSETS,
  loadProjects,
  loadAchievements,
  loadExperience,
  loadCommittees
} from './helpers/fixtures.mjs';
import {
  filterProjects,
  filterAchievements,
  filterBentoHistory,
  sliceProgressiveDisclosure,
  resolveExpectedProjectMode,
  resolveExpectedProjectIconAsset
} from './helpers/oracle.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 4: Real-World Application Scenarios (End-to-End User Walkthroughs)', () => {
  test('T4.1: Tech Portfolio End-to-End Walkthrough', () => {
    // Visitor lands on Tech portfolio
    const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark', viewport: VIEWPORTS.desktop });

    // 1. Hero-Section: Procedural Polyhedron renders at 60 FPS
    assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');
    const geo = sim.get3DGeometryStats();
    assert.ok(geo.triangleCount > 0);
    assertEqual(geo.networkBytes, 0);

    // 2. Projects Gallery: Category pills active, user filters by Web Development
    assertEqual(sim.projectsSelectedCategory, 'All');
    sim.selectProjectsCategory('Web Development');
    assertEqual(sim.projectsSelectedCategory, 'Web Development');
    const webProjects = sim.getFilteredProjects();
    assert.ok(webProjects.length > 0);

    // 3. Project Mode Icons: verified for Tech projects
    for (const p of webProjects) {
      const icon = sim.getProjectModeIconAsset(p);
      assert.ok(icon.includes('project-tech.svg') || icon.includes('project-'));
    }

    // 4. About Bento Grid: 5-Tile modular layout
    const tiles = sim.getBentoTileSpecs();
    assertEqual(tiles.tile5_history.desktopSpan, 'lg:col-span-12');
    assertEqual(tiles.tile1_bio.desktopSpan, 'lg:col-span-8');

    // History track tab switching
    sim.selectBentoTab('experience');
    const expItems = sim.getVisibleBentoHistoryItems();
    assert.ok(expItems.length > 0);
  });

  test('T4.2: Medical Portfolio Clinical Walkthrough', () => {
    // Visitor navigates to Medical mode
    const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark', viewport: VIEWPORTS.desktop });
    sim.switchMode('medical');

    // 1. Hero 3D model switches instantly to Helix DNA
    assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');
    assertEqual(sim.get3DGeometryStats().networkBytes, 0);

    // 2. Projects category resets to 'All'
    assertEqual(sim.projectsSelectedCategory, 'All');
    assertEqual(sim.achievementsSelectedCategory, 'All');

    // 3. User filters Medical projects
    sim.selectProjectsCategory('Kesehatan Komunitas');
    const clinicalProjects = sim.getFilteredProjects();
    assert.ok(clinicalProjects.length > 0);

    // Multi-mode HMSSO project in Medical mode displays Medical icon
    const allProjects = loadProjects();
    const hmsso = allProjects.find((p) => p.id === 'proj-hmsso');
    assertEqual(sim.getProjectModeIconAsset(hmsso), ICON_ASSETS.medical);

    // 4. Smart Bento Grid displays medical experience & committees
    sim.selectBentoTab('all');
    const medHistory = sim.getAllBentoHistoryItems();
    assert.ok(medHistory.length > 0);
    for (const h of medHistory) {
      assertIncludes(h.modes, 'medical');
    }
  });

  test('T4.3: Academic Portfolio Scholarly Walkthrough', () => {
    // Visitor opens Academic mode
    const sim = new PortfolioSimulator({ mode: 'academic', theme: 'light', viewport: VIEWPORTS.desktop });

    // 1. Hero 3D model is Calligraphy Feather Quill (Pena Bulu)
    assertEqual(sim.getActive3DModelSpec().modelType, 'pena-bulu');
    assertEqual(sim.get3DGeometryStats().networkBytes, 0);

    // 2. Category pills initialized
    assertEqual(sim.projectsSelectedCategory, 'All');

    // 3. User filters academic publications & PKM proposals
    const academicProjects = sim.getFilteredProjects();
    assert.ok(academicProjects.length > 0);
    for (const p of academicProjects) {
      const mode = sim.resolveProjectMode(p);
      assertEqual(mode, 'academic');
    }

    // 4. Achievements in academic mode
    const acadAchievements = sim.getFilteredAchievements();
    assert.ok(acadAchievements.length > 0);

    // 5. Smart Bento Grid: Academic history track
    sim.selectBentoTab('committees');
    const acadCommittees = sim.getVisibleBentoHistoryItems();
    assert.ok(acadCommittees.length > 0);
  });

  test('T4.4: Cross-Disciplinary Recruiter Walkthrough across All 3 Modes', () => {
    // Recruiter journeys through all 3 modes performing complex interactions
    const sim = new PortfolioSimulator({ mode: 'tech', viewport: VIEWPORTS.desktop });

    // Journey Step 1: Tech Exploration
    sim.selectProjectsCategory('Software Engineering');
    sim.setProjectsSearchQuery('Portal');
    assertEqual(sim.projectsSelectedCategory, 'Software Engineering');

    // Journey Step 2: Switch to Medical to check healthcare projects
    sim.switchMode('medical');
    assertEqual(sim.projectsSelectedCategory, 'All', 'Category pill auto-resets on mode switch');
    assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');

    // Check progressive disclosure in medical Bento grid
    sim.selectBentoTab('all');
    if (sim.shouldShowBentoDisclosureButton()) {
      sim.toggleBentoExpansion();
      assertEqual(sim.bentoIsExpanded, true);
    }

    // Journey Step 3: Switch to Academic to evaluate scientific papers
    sim.switchMode('academic');
    assertEqual(sim.projectsSelectedCategory, 'All');
    assertEqual(sim.getActive3DModelSpec().modelType, 'pena-bulu');
    const acadHistory = sim.getAllBentoHistoryItems();
    assert.ok(acadHistory.length > 0);
  });

  test('T4.5: Responsive Viewport & Multi-Theme Matrix Validation', () => {
    const viewports = [VIEWPORTS.mobileSmall, VIEWPORTS.tablet, VIEWPORTS.desktop, VIEWPORTS.ultrawide];

    for (const vp of viewports) {
      for (const mode of MODES) {
        for (const theme of THEMES) {
          const sim = new PortfolioSimulator({ mode, theme, viewport: vp });

          // Invariant 1: Active mode and theme match
          assertEqual(sim.activeMode, mode);
          assertEqual(sim.resolvedTheme, theme);

          // Invariant 2: Layout mode matches viewport width
          if (vp.width <= 640) {
            assertEqual(sim.getPillLayoutMode(), 'mobile-horizontal-scroll');
          } else {
            assertEqual(sim.getPillLayoutMode(), 'desktop-wrap');
          }

          // Invariant 3: Mobile skips WebGL, Desktop renders WebGL
          if (vp.width < 1024) {
            assertEqual(sim.get3DGeometryStats().isSkipped, true);
          } else {
            assertEqual(sim.get3DGeometryStats().isSkipped, false);
          }

          // Invariant 4: Bento grid tile 5 is always full-width
          assertEqual(sim.getBentoTileSpecs().tile5_history.desktopSpan, 'lg:col-span-12');
        }
      }
    }
  });
});
