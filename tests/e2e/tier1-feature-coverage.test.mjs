import { test, describe } from 'node:test';
import {
  assertValidSvg,
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
  PROCEDURAL_3D_MODELS,
  PROJECT_CATEGORIES,
  ACHIEVEMENT_CATEGORIES,
  BENTO_GRID_SPECS,
  ICON_ASSETS,
  loadProjects,
  loadAchievements,
  loadExperience,
  loadCommittees
} from './helpers/fixtures.mjs';
import {
  resolveExpected3DModelSpec,
  buildProcedural3DModel,
  filterProjects,
  filterAchievements,
  filterBentoHistory,
  sliceProgressiveDisclosure,
  resolveExpectedProjectMode,
  resolveExpectedProjectIconAsset,
  resolveExpectedProjectAltText
} from './helpers/oracle.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 1: Feature Coverage (R1 - R4)', () => {
  // ==========================================
  // R1: Model 3D Hero-Section Ringan per Mode
  // ==========================================
  describe('R1. Model 3D Hero-Section Ringan per Mode', () => {
    test('T1.1.1: Tech mode procedural Polyhedron geometry, wireframe cage, orbital nodes (0 kB download)', () => {
      const spec = resolveExpected3DModelSpec('tech');
      assertValidProceduralModel(spec, 'tech');
      assertEqual(spec.modelType, 'polyhedron');
      assertEqual(spec.geometry, 'IcosahedronGeometry');
      assertEqual(spec.hasWireframeCage, true);
      assertEqual(spec.orbitalNodeCount, 4);

      // Verify in-memory procedural generation
      const model = buildProcedural3DModel('tech');
      assert.ok(model.triangleCount > 0 && model.triangleCount < 200, `Triangles: ${model.triangleCount}`);
      assertEqual(model.networkBytes, 0, 'Procedural 3D model must require 0 network download bytes');
    });

    test('T1.1.2: Medical mode procedural Helix DNA dual curve tubes, base-pair rungs, terminal spheres (0 kB download)', () => {
      const spec = resolveExpected3DModelSpec('medical');
      assertValidProceduralModel(spec, 'medical');
      assertEqual(spec.modelType, 'helix-dna');
      assertEqual(spec.geometry, 'CatmullRomCurve3');
      assertEqual(spec.hasDualStrands, true);
      assertEqual(spec.hasBasePairs, true);
      assertEqual(spec.basePairCount, 16);

      const model = buildProcedural3DModel('medical');
      assert.ok(model.triangleCount > 500 && model.triangleCount < 5000, `Triangles: ${model.triangleCount}`);
      assertEqual(model.networkBytes, 0, 'Medical procedural DNA model must require 0 network bytes');
    });

    test('T1.1.3: Academic mode procedural Pena Bulu curved spine tube, ribbon vanes, brass nib (0 kB download)', () => {
      const spec = resolveExpected3DModelSpec('academic');
      assertValidProceduralModel(spec, 'academic');
      assertEqual(spec.modelType, 'pena-bulu');
      assertEqual(spec.hasArchedSpine, true);
      assertEqual(spec.hasRibbonVanes, true);
      assertEqual(spec.hasCalligraphyNib, true);

      const model = buildProcedural3DModel('academic');
      assert.ok(model.triangleCount > 100 && model.triangleCount < 2000, `Triangles: ${model.triangleCount}`);
      assertEqual(model.networkBytes, 0, 'Academic quill model must require 0 network bytes');
    });

    test('T1.1.4: Instantaneous synchronous 3D model transitions across all 3 modes', () => {
      const sim = new PortfolioSimulator({ mode: 'tech', viewport: VIEWPORTS.desktop });
      assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');

      // Switch to medical - synchronous state update without waiting for GLB network download
      sim.switchMode('medical');
      assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');

      // Switch to academic
      sim.switchMode('academic');
      assertEqual(sim.getActive3DModelSpec().modelType, 'pena-bulu');

      // Switch back to tech
      sim.switchMode('tech');
      assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');
    });

    test('T1.1.5: 60 FPS rendering loop & recursive GPU resource disposal on unmount', () => {
      const sim = new PortfolioSimulator({ mode: 'tech', viewport: VIEWPORTS.desktop });
      assertEqual(sim.fps, 60, 'Rendering loop target must be 60 FPS');

      const disposeStats = sim.unmount3DScene();
      assert.ok(disposeStats, 'Unmount must return resource disposal stats');
      assert.ok(disposeStats.disposedGeometries > 0, 'All geometries must be explicitly disposed');
      assert.ok(disposeStats.disposedMaterials > 0, 'All materials must be explicitly disposed');
      assertEqual(sim.active3DScene, null, 'Active 3D scene reference cleared after unmount');
    });

    test('T1.1.6: Hero 3D captions & skeleton loader text per mode', () => {
      for (const mode of MODES) {
        const spec = PROCEDURAL_3D_MODELS[mode];
        assert.ok(spec.caption.includes(mode === 'tech' ? 'Polyhedron' : mode === 'medical' ? 'Helix DNA' : 'Pena Bulu'));
        assert.ok(spec.skeletonText.length > 5, 'Skeleton loader text must be present');
      }
    });
  });

  // ==========================================
  // R2: Peringkasan Category Pill Galeri
  // ==========================================
  describe('R2. Peringkasan Category Pill Galeri', () => {
    test('T1.2.1: Projects gallery category pills single-row horizontal scroll on mobile (<640px) saving >80% vertical space', () => {
      const simMobile = new PortfolioSimulator({ viewport: VIEWPORTS.mobileStandard });
      assertEqual(simMobile.getPillLayoutMode(), 'mobile-horizontal-scroll');

      const simDesktop = new PortfolioSimulator({ viewport: VIEWPORTS.desktop });
      assertEqual(simDesktop.getPillLayoutMode(), 'desktop-wrap');
    });

    test('T1.2.2: Achievements gallery dedicated compact filter row with horizontal scroll on mobile', () => {
      const achievements = loadAchievements();
      assert.ok(ACHIEVEMENT_CATEGORIES.length >= 5, 'Achievement categories must include comprehensive tracks');
      assertEqual(ACHIEVEMENT_CATEGORIES[0], 'All', 'First category must be All');

      const sim = new PortfolioSimulator({ mode: 'tech' });
      assertEqual(sim.achievementsSelectedCategory, 'All');
      sim.selectAchievementsCategory('Kompetisi & Penghargaan');
      assertEqual(sim.achievementsSelectedCategory, 'Kompetisi & Penghargaan');
    });

    test('T1.2.3: Category filter mode synchronization: auto-reset selectedCategory to "All" on activeMode change across both galleries', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });

      // User selects custom category in projects and achievements
      sim.selectProjectsCategory('Web Development');
      sim.selectAchievementsCategory('Kompetisi & Penghargaan');
      assertEqual(sim.projectsSelectedCategory, 'Web Development');
      assertEqual(sim.achievementsSelectedCategory, 'Kompetisi & Penghargaan');

      // Mode switch to medical
      sim.switchMode('medical');

      // Invariant: both selected categories must automatically reset to 'All'
      assertEqual(sim.projectsSelectedCategory, 'All', 'Projects category must auto-reset to All on mode switch');
      assertEqual(sim.achievementsSelectedCategory, 'All', 'Achievements category must auto-reset to All on mode switch');

      // User selects medical category, then switch to academic
      sim.selectProjectsCategory('Kesehatan Komunitas');
      assertEqual(sim.projectsSelectedCategory, 'Kesehatan Komunitas');

      sim.switchMode('academic');
      assertEqual(sim.projectsSelectedCategory, 'All', 'Projects category must auto-reset to All on mode switch to academic');
      assertEqual(sim.achievementsSelectedCategory, 'All', 'Achievements category must auto-reset to All on mode switch to academic');
    });

    test('T1.2.4: Projects gallery filter execution by category matches expected items', () => {
      const allProjects = loadProjects();
      const techWebProjects = filterProjects(allProjects, 'tech', 'Web Development');
      assert.ok(techWebProjects.length > 0, 'Must have Web Development projects in tech mode');
      for (const p of techWebProjects) {
        assert.ok(
          p.category === 'Web Development' || p.secondaryCategory === 'Web Development',
          `Project ${p.id} must belong to Web Development`
        );
      }
    });

    test('T1.2.5: Achievements gallery filter execution by category matches expected items', () => {
      const allAchievements = loadAchievements();
      const techAchievements = filterAchievements(allAchievements, 'tech', 'Kompetisi & Penghargaan');
      for (const a of techAchievements) {
        assertIncludes(a.modes, 'tech', 'Achievement must support tech mode');
        assertEqual(a.category, 'Kompetisi & Penghargaan', 'Achievement category must match filter');
      }
    });

    test('T1.2.6: Search query and sorting controls work concurrently with category filtering', () => {
      const allProjects = loadProjects();
      const results = filterProjects(allProjects, 'tech', 'All', 'HMSSO', 'newest');
      assert.ok(results.length >= 1, 'Search for HMSSO must return matching project');
      assert.ok(results[0].title.includes('HMSSO') || results[0].summary.includes('HMSSO'));
    });
  });

  // ==========================================
  // R3: Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya
  // ==========================================
  describe('R3. Sistem Smart Bento Grid Adaptif pada Bagian Tentang Saya', () => {
    test('T1.3.1: 5-Tile 12-Column modular Bento Grid layout contracts eliminating vertical disparity', () => {
      assertValidBentoLayout(BENTO_GRID_SPECS.tiles);
      // Tiles 1 (8) + 2 (4) = 12 columns
      // Tiles 3 (4) + 4 (8) = 12 columns
      assertEqual(
        BENTO_GRID_SPECS.tiles.tile1_bio.spanColumns + BENTO_GRID_SPECS.tiles.tile2_contact.spanColumns,
        12,
        'Row 1 must sum to 12 columns'
      );
      assertEqual(
        BENTO_GRID_SPECS.tiles.tile3_principles.spanColumns + BENTO_GRID_SPECS.tiles.tile4_education.spanColumns,
        12,
        'Row 2 must sum to 12 columns'
      );
    });

    test('T1.3.2: Tile 5 full container width (lg:col-span-12) for adaptive history track', () => {
      const tile5 = BENTO_GRID_SPECS.tiles.tile5_history;
      assertEqual(tile5.desktopSpan, 'lg:col-span-12');
      assertEqual(tile5.isFullWidth, true);
    });

    test('T1.3.3: Interactive Segmented History Switcher (Semua, Organisasi, Kepanitiaan) in Tile 5', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      assertEqual(sim.bentoActiveTab, 'all');

      const allItems = sim.getAllBentoHistoryItems();
      sim.selectBentoTab('experience');
      assertEqual(sim.bentoActiveTab, 'experience');
      const expItems = sim.getAllBentoHistoryItems();
      for (const item of expItems) {
        assertEqual(item.trackType, 'experience');
      }

      sim.selectBentoTab('committees');
      assertEqual(sim.bentoActiveTab, 'committees');
      const comItems = sim.getAllBentoHistoryItems();
      for (const item of comItems) {
        assertEqual(item.trackType, 'committees');
      }

      assertEqual(expItems.length + comItems.length, allItems.length, 'Sum of tabs must equal all tab');
    });

    test('T1.3.4: Auto-flowing 3-column subgrid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)', () => {
      assertEqual(BENTO_GRID_SPECS.subgridCols, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    });

    test('T1.3.5: Progressive disclosure toggle ("Tampilkan N Lainnya / Ringkas") with threshold of 6 items', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.selectBentoTab('all');

      const totalItems = sim.getAllBentoHistoryItems();
      const visibleInitial = sim.getVisibleBentoHistoryItems();

      if (totalItems.length > 6) {
        assertEqual(visibleInitial.length, 6, 'Initial visible items count must be clamped to 6');
        assertEqual(sim.shouldShowBentoDisclosureButton(), true);

        // Toggle expand
        sim.toggleBentoExpansion();
        assertEqual(sim.bentoIsExpanded, true);
        assertEqual(sim.getVisibleBentoHistoryItems().length, totalItems.length, 'Expanded shows all items');

        // Toggle collapse
        sim.toggleBentoExpansion();
        assertEqual(sim.bentoIsExpanded, false);
        assertEqual(sim.getVisibleBentoHistoryItems().length, 6, 'Collapsed returns to 6 items');
      } else {
        assertEqual(visibleInitial.length, totalItems.length);
        assertEqual(sim.shouldShowBentoDisclosureButton(), false);
      }
    });

    test('T1.3.6: Balanced layout adaptation across mobile, tablet, and desktop viewports', () => {
      const simMobile = new PortfolioSimulator({ viewport: VIEWPORTS.mobileStandard });
      const simTablet = new PortfolioSimulator({ viewport: VIEWPORTS.tablet });
      const simDesktop = new PortfolioSimulator({ viewport: VIEWPORTS.desktop });

      assertEqual(simMobile.viewport.width, 375);
      assertEqual(simTablet.viewport.width, 768);
      assertEqual(simDesktop.viewport.width, 1440);
    });
  });

  // ==========================================
  // R4: Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif
  // ==========================================
  describe('R4. Penyesuaian Logo Icon Proyek Berdasarkan Mode Aktif', () => {
    test('T1.4.1: Project card mode icon SVG assets presence and validity (Tech, Medical, Academic)', () => {
      const techSvg = assertValidSvg(ICON_ASSETS.tech);
      const medSvg = assertValidSvg(ICON_ASSETS.medical);
      const acadSvg = assertValidSvg(ICON_ASSETS.academic);

      assertEqual(techSvg.valid, true);
      assertEqual(medSvg.valid, true);
      assertEqual(acadSvg.valid, true);
    });

    test('T1.4.2: Single-mode project displays icon matching its primary mode', () => {
      const singleTechProject = { id: 'p-tech', mode: 'tech', secondaryModes: [] };
      const resolved = resolveExpectedProjectMode('tech', singleTechProject);
      assertEqual(resolved, 'tech');

      const singleMedProject = { id: 'p-med', mode: 'medical', secondaryModes: [] };
      assertEqual(resolveExpectedProjectMode('medical', singleMedProject), 'medical');

      const singleAcadProject = { id: 'p-acad', mode: 'academic', secondaryModes: [] };
      assertEqual(resolveExpectedProjectMode('academic', singleAcadProject), 'academic');
    });

    test('T1.4.3: Multi-mode project dynamically matches activeMode when activeMode is in secondaryModes', () => {
      // HMSSO supports tech, medical, and academic
      const multiProject = {
        id: 'proj-hmsso',
        title: 'HMSSO BSO Hermestha FK Undiksha',
        mode: 'tech',
        secondaryModes: ['medical', 'academic']
      };

      // In Tech mode: shows Tech icon
      assertEqual(resolveExpectedProjectMode('tech', multiProject), 'tech');
      assertEqual(resolveExpectedProjectIconAsset('tech', multiProject), ICON_ASSETS.tech);

      // In Medical mode: dynamically switches to Medical icon
      assertEqual(resolveExpectedProjectMode('medical', multiProject), 'medical');
      assertEqual(resolveExpectedProjectIconAsset('medical', multiProject), ICON_ASSETS.medical);

      // In Academic mode: dynamically switches to Academic icon
      assertEqual(resolveExpectedProjectMode('academic', multiProject), 'academic');
      assertEqual(resolveExpectedProjectIconAsset('academic', multiProject), ICON_ASSETS.academic);
    });

    test('T1.4.4: Multi-mode project falls back to primary project.mode when activeMode is not supported', () => {
      const projectTwoModes = {
        id: 'p-dual',
        title: 'Smart-KIA',
        mode: 'medical',
        secondaryModes: ['tech']
      };

      // In Academic mode (not supported by p-dual): falls back to primary mode 'medical'
      const fallbackMode = resolveExpectedProjectMode('academic', projectTwoModes);
      assertEqual(fallbackMode, 'medical', 'Must fallback to project.mode when activeMode is unsupported');
      assertEqual(resolveExpectedProjectIconAsset('academic', projectTwoModes), ICON_ASSETS.medical);
    });

    test('T1.4.5: Fallback behavior for null/missing project reference defaults to activeMode / "tech"', () => {
      assertEqual(resolveExpectedProjectMode('tech', null), 'tech');
      assertEqual(resolveExpectedProjectMode('medical', null), 'medical');
      assertEqual(resolveExpectedProjectMode('academic', null), 'academic');
      assertEqual(resolveExpectedProjectMode(undefined, null), 'tech');
    });

    test('T1.4.6: Accessible alt text generation per project and active mode', () => {
      const project = {
        id: 'p-1',
        title: 'Portal HMJ Kedokteran',
        mode: 'tech',
        secondaryModes: ['medical']
      };

      const altTech = resolveExpectedProjectAltText('tech', project);
      assertIncludes(altTech, 'Portal HMJ Kedokteran');
      assertIncludes(altTech, 'Teknologi & Software Engineering');

      const altMed = resolveExpectedProjectAltText('medical', project);
      assertIncludes(altMed, 'Portal HMJ Kedokteran');
      assertIncludes(altMed, 'Kedokteran & Kesehatan Komunitas');
    });
  });
});
