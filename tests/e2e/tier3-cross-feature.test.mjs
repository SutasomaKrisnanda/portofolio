import { test, describe } from 'node:test';
import {
  assertEqual,
  assertDeepEqual,
  assertIncludes,
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

describe('Tier 3: Cross-Feature Interactions (Pairwise & Systemic Interactions)', () => {
  test('T3.1: Mode Switch + Category Pill Auto-Reset + Dynamic Project Icon Synchronous Update', () => {
    const allProjects = loadProjects();
    const hmsso = allProjects.find((p) => p.id === 'proj-hmsso');
    assert.ok(hmsso, 'HMSSO must exist in dataset');

    const sim = new PortfolioSimulator({ mode: 'tech' });

    // Step 1: User filters projects in Tech mode
    sim.selectProjectsCategory('Web Development');
    sim.selectAchievementsCategory('Kompetisi & Penghargaan');
    assertEqual(sim.projectsSelectedCategory, 'Web Development');
    assertEqual(sim.achievementsSelectedCategory, 'Kompetisi & Penghargaan');
    assertEqual(sim.getProjectModeIconAsset(hmsso), ICON_ASSETS.tech);
    assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');

    // Step 2: User switches mode to Medical
    sim.switchMode('medical');

    // Cross-feature invariants check:
    assertEqual(sim.activeMode, 'medical');
    assertEqual(sim.projectsSelectedCategory, 'All', 'Category pill MUST reset to All');
    assertEqual(sim.achievementsSelectedCategory, 'All', 'Achievements category MUST reset to All');
    assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna', '3D model MUST update to Helix DNA');
    assertEqual(sim.getProjectModeIconAsset(hmsso), ICON_ASSETS.medical, 'HMSSO icon MUST morph to Medical SVG');

    // Step 3: User switches mode to Academic
    sim.switchMode('academic');
    assertEqual(sim.projectsSelectedCategory, 'All');
    assertEqual(sim.getActive3DModelSpec().modelType, 'pena-bulu', '3D model MUST update to Pena Bulu');
    assertEqual(sim.getProjectModeIconAsset(hmsso), ICON_ASSETS.academic, 'HMSSO icon MUST morph to Academic SVG');
  });

  test('T3.2: Mode Switch + 3D Model Geometry Change + Bento History Track Refresh', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');

    const techHistory = sim.getAllBentoHistoryItems();
    assert.ok(techHistory.length > 0, 'Tech history items must be non-empty');
    for (const item of techHistory) {
      assertIncludes(item.modes, 'tech');
    }

    // Switch to medical
    sim.switchMode('medical');
    assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');
    const medicalHistory = sim.getAllBentoHistoryItems();
    assert.ok(medicalHistory.length > 0, 'Medical history items must be non-empty');
    for (const item of medicalHistory) {
      assertIncludes(item.modes, 'medical');
    }

    // Switch to academic
    sim.switchMode('academic');
    assertEqual(sim.getActive3DModelSpec().modelType, 'pena-bulu');
    const academicHistory = sim.getAllBentoHistoryItems();
    assert.ok(academicHistory.length > 0, 'Academic history items must be non-empty');
    for (const item of academicHistory) {
      assertIncludes(item.modes, 'academic');
    }
  });

  test('T3.3: Multi-Mode Project Filtering by Category + Dynamic Icon Morphing across Tech, Medical, Academic', () => {
    const allProjects = loadProjects();
    const hmsso = allProjects.find((p) => p.id === 'proj-hmsso');
    assert.ok(hmsso);

    for (const mode of MODES) {
      // In each mode, filtered projects containing HMSSO display that mode's icon
      const filtered = filterProjects(allProjects, mode, 'All');
      const found = filtered.find((p) => p.id === 'proj-hmsso');
      assert.ok(found, `HMSSO must appear in mode ${mode}`);
      const expectedIcon = resolveExpectedProjectIconAsset(mode, found);
      assertEqual(expectedIcon, ICON_ASSETS[mode]);
    }
  });

  test('T3.4: Mobile Viewport + Horizontal Scroll Category Pills + 3-Column Bento Grid Responsive Stacking', () => {
    const sim = new PortfolioSimulator({
      viewport: VIEWPORTS.mobileStandard
    });

    // Mobile layout invariants
    assertEqual(sim.getPillLayoutMode(), 'mobile-horizontal-scroll');
    const tiles = sim.getBentoTileSpecs();
    assertEqual(tiles.tile5_history.desktopSpan, 'lg:col-span-12');
    assertEqual(tiles.tile1_bio.desktopSpan, 'lg:col-span-8');

    // On mobile screens (<1024px), 3D scene creation is skipped
    const geometryStats = sim.get3DGeometryStats();
    assertEqual(geometryStats.isSkipped, true);

    // Expand to desktop viewport (1440px)
    sim.setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
    assertEqual(sim.getPillLayoutMode(), 'desktop-wrap');
    const desktopStats = sim.get3DGeometryStats();
    assertEqual(desktopStats.isSkipped, false);
    assert.ok(desktopStats.triangleCount > 0);
  });

  test('T3.5: Search Filter + Category Filter + Dynamic Project Mode Icon Alignment', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    sim.selectProjectsCategory('Web Development');
    sim.setProjectsSearchQuery('HMSSO');

    const results = sim.getFilteredProjects();
    assertEqual(results.length, 1);
    assertEqual(results[0].id, 'proj-hmsso');

    // Dynamic icon correctly matches active mode
    assertEqual(sim.getProjectModeIconAsset(results[0]), ICON_ASSETS.tech);

    // Switch to medical: query preserved, category reset to 'All'
    sim.switchMode('medical');
    assertEqual(sim.projectsSelectedCategory, 'All');
    const medResults = sim.getFilteredProjects();
    const medHmsso = medResults.find((p) => p.id === 'proj-hmsso');
    assert.ok(medHmsso);
    assertEqual(sim.getProjectModeIconAsset(medHmsso), ICON_ASSETS.medical);
  });

  test('T3.6: Bento Segmented Tab Switch + Progressive Disclosure + Mode Change Interaction', () => {
    const sim = new PortfolioSimulator({ mode: 'tech' });
    sim.selectBentoTab('all');

    if (sim.shouldShowBentoDisclosureButton()) {
      sim.toggleBentoExpansion();
      assertEqual(sim.bentoIsExpanded, true);

      // Switching mode preserves or resets expansion predictably
      sim.switchMode('medical');
      const medItems = sim.getVisibleBentoHistoryItems();
      assert.ok(medItems.length > 0);
      for (const item of medItems) {
        assertIncludes(item.modes, 'medical');
      }
    }
  });

  test('T3.7: Theme Switch (Dark <-> Light) across all 3 modes preserves 3D scene & icon contracts', () => {
    const sim = new PortfolioSimulator({ mode: 'tech', theme: 'dark' });

    for (const mode of MODES) {
      sim.switchMode(mode);
      for (const theme of THEMES) {
        sim.switchTheme(theme);
        assertEqual(sim.resolvedTheme, theme);
        assertEqual(sim.activeMode, mode);

        // 3D model spec and icons remain consistent across light and dark themes
        assert.ok(sim.getActive3DModelSpec().modelType);
        assert.ok(ICON_ASSETS[mode]);
      }
    }
  });

  test('T3.8: Direct URL Parameter Initialization (?mode=medical) hydrates all 4 features synchronously', () => {
    // Simulates opening page with ?mode=medical in URL query params
    const initialModeFromUrl = 'medical';
    const sim = new PortfolioSimulator({ mode: initialModeFromUrl });

    // 1. R1: 3D scene starts as Helix DNA
    assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');

    // 2. R2: Category pills start as 'All'
    assertEqual(sim.projectsSelectedCategory, 'All');
    assertEqual(sim.achievementsSelectedCategory, 'All');

    // 3. R3: Bento Grid initialized with medical history
    const bentoItems = sim.getAllBentoHistoryItems();
    assert.ok(bentoItems.length > 0);
    for (const item of bentoItems) {
      assertIncludes(item.modes, 'medical');
    }

    // 4. R4: Multi-mode projects initialized with medical mode icon
    const allProjects = loadProjects();
    const hmsso = allProjects.find((p) => p.id === 'proj-hmsso');
    assertEqual(sim.getProjectModeIconAsset(hmsso), ICON_ASSETS.medical);
  });
});
