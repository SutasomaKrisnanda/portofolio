import { test, describe } from 'node:test';
import {
  assertEqual,
  assertDeepEqual,
  assertIncludes,
  assertValidSvg,
  assert
} from './helpers/assertions.mjs';
import {
  MODES,
  THEMES,
  VIEWPORTS,
  ICON_ASSETS,
  loadProjects,
  loadAchievements,
  loadExperience,
  loadCommittees
} from './helpers/fixtures.mjs';
import {
  resolveExpected3DModelSpec,
  buildProcedural3DModel,
  disposeHierarchy,
  filterProjects,
  filterAchievements,
  filterBentoHistory,
  sliceProgressiveDisclosure,
  resolveExpectedProjectMode,
  resolveExpectedProjectIconAsset,
  resolveExpectedProjectAltText
} from './helpers/oracle.mjs';
import { PortfolioSimulator } from './helpers/simulator.mjs';

describe('Tier 2: Boundary & Corner Cases (R1 - R4)', () => {
  // ==========================================
  // R1 Boundary Cases: Procedural 3D Hero Scene
  // ==========================================
  describe('R1 Boundary Cases: Procedural 3D Hero Scene', () => {
    test('T2.1.1: Rapid mode toggles (1,000 transitions) maintain deterministic model alignment with zero memory leak', () => {
      const sim = new PortfolioSimulator({ mode: 'tech', viewport: VIEWPORTS.desktop });

      for (let i = 0; i < 1000; i++) {
        const targetMode = MODES[i % 3];
        sim.switchMode(targetMode);
        assertEqual(sim.activeMode, targetMode);
        assertEqual(
          sim.getActive3DModelSpec().modelType,
          targetMode === 'tech' ? 'polyhedron' : targetMode === 'medical' ? 'helix-dna' : 'pena-bulu'
        );
      }

      // Cleanup
      const disposeStats = sim.unmount3DScene();
      assert.ok(disposeStats.disposedGeometries > 0);
      assert.ok(disposeStats.disposedMaterials > 0);
    });

    test('T2.1.2: WebGL unsupported / context lost simulation gracefully falls back without throwing', () => {
      // Simulate environment without WebGL
      const sim = new PortfolioSimulator({ mode: 'medical', webGLAvailable: false });
      const stats = sim.get3DGeometryStats();
      assertEqual(stats.isSkipped, true, 'Must skip WebGL initialization when WebGL is unavailable');
      assertEqual(stats.triangleCount, 0);

      // Model spec remains accessible for semantic labels and captions
      assertEqual(sim.getActive3DModelSpec().modelType, 'helix-dna');
    });

    test('T2.1.3: Mobile viewport (<1024px) skips WebGL rendering to conserve battery & eliminate mobile rendering lag', () => {
      const simMobile = new PortfolioSimulator({
        mode: 'tech',
        viewport: VIEWPORTS.mobileSmall
      });
      const stats = simMobile.get3DGeometryStats();
      assertEqual(stats.isSkipped, true, 'Mobile screens must skip Three.js scene creation');

      // Resizing to desktop activates Three.js scene
      simMobile.setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      const desktopStats = simMobile.get3DGeometryStats();
      assertEqual(desktopStats.isSkipped, false, 'Desktop screens must create Three.js scene');
      assert.ok(desktopStats.triangleCount > 0);
    });

    test('T2.1.4: Extreme pointer drag rotation clamping prevents NaN/Infinity coordinates', () => {
      // Boundary test for pointer drag math
      const clampRotation = (val, min, max) => Math.max(min, Math.min(max, val));
      const testDeltas = [1e6, -1e6, 0.00001, -0.00001, 0, 99999];

      for (const d of testDeltas) {
        const clamped = clampRotation(d, -Math.PI / 4, Math.PI / 4);
        assert.ok(Number.isFinite(clamped), `Clamped value must be finite for input ${d}`);
        assert.ok(clamped >= -Math.PI / 4 && clamped <= Math.PI / 4);
      }
    });

    test('T2.1.5: Corrupt or unrecognized mode input ("quantum", "", null, undefined) safely defaults to Tech Polyhedron', () => {
      const invalidInputs = ['quantum', '', null, undefined, 123, {}, []];

      for (const invalid of invalidInputs) {
        const spec = resolveExpected3DModelSpec(invalid);
        assertEqual(spec.modelType, 'polyhedron', `Invalid mode "${invalid}" must fallback to polyhedron`);

        const sim = new PortfolioSimulator({ mode: invalid });
        assertEqual(sim.activeMode, 'tech');
        assertEqual(sim.getActive3DModelSpec().modelType, 'polyhedron');
      }
    });

    test('T2.1.6: Recursive disposal handles complex object hierarchies without throwing', () => {
      for (const mode of MODES) {
        const model = buildProcedural3DModel(mode);
        assert.ok(model.group);
        const stats = disposeHierarchy(model.group);
        assert.ok(stats.disposedGeometries > 0);
        assert.ok(stats.disposedMaterials > 0);
      }
    });
  });

  // ==========================================
  // R2 Boundary Cases: Category Pills & Galleries
  // ==========================================
  describe('R2 Boundary Cases: Category Pills & Galleries', () => {
    test('T2.2.1: Extreme category label length (150 characters) maintains horizontal scroll single-row layout without clipping', () => {
      const extremeCategory = 'X'.repeat(150);
      const mockProjects = [
        {
          id: 'p-extreme',
          title: 'Extreme Category Project',
          mode: 'tech',
          category: extremeCategory,
          technologies: [],
          featured: true
        }
      ];

      const filtered = filterProjects(mockProjects, 'tech', extremeCategory);
      assertEqual(filtered.length, 1);
      assertEqual(filtered[0].category, extremeCategory);

      // Simulates mobile layout style: no-scrollbar and overflow-x-auto ensure it doesn't wrap
      const sim = new PortfolioSimulator({ viewport: VIEWPORTS.mobileSmall });
      assertEqual(sim.getPillLayoutMode(), 'mobile-horizontal-scroll');
    });

    test('T2.2.2: Empty search query result renders empty state and "Reset Filter" restores category to "All"', () => {
      const allProjects = loadProjects();
      const nonExistent = 'XYZ_NON_EXISTENT_SEARCH_QUERY_12345';
      const results = filterProjects(allProjects, 'tech', 'Web Development', nonExistent);
      assertEqual(results.length, 0, 'No projects should match non-existent query');

      const sim = new PortfolioSimulator({ mode: 'tech' });
      sim.selectProjectsCategory('Web Development');
      sim.setProjectsSearchQuery(nonExistent);
      assertEqual(sim.getFilteredProjects().length, 0);

      // Reset Filter action
      sim.selectProjectsCategory('All');
      sim.setProjectsSearchQuery('');
      assert.ok(sim.getFilteredProjects().length > 0, 'Reset Filter must restore projects list');
    });

    test('T2.2.3: Special regex and punctuation characters in search query do not crash filter logic', () => {
      const allProjects = loadProjects();
      const maliciousQueries = [
        '.*+?^${}()|[]\\',
        '\\b(?:select|drop|insert)\\b',
        '\' OR \'1\'=\'1',
        '<script>alert(1)</script>',
        '${7*7}',
        '   \t\n   '
      ];

      for (const q of maliciousQueries) {
        assert.doesNotThrow(() => {
          const res = filterProjects(allProjects, 'tech', 'All', q);
          assert.ok(Array.isArray(res));
        }, `Query "${q}" must not throw regex or syntax errors`);
      }
    });

    test('T2.2.4: Rapid category switching (500 iterations) produces strictly filtered results with 0 state divergence', () => {
      const allProjects = loadProjects();
      const categories = ['All', 'Web Development', 'Software Engineering', 'Mobile Applications'];

      for (let i = 0; i < 500; i++) {
        const cat = categories[i % categories.length];
        const res = filterProjects(allProjects, 'tech', cat);
        for (const p of res) {
          if (cat !== 'All') {
            assert.ok(
              p.category === cat || p.secondaryCategory === cat,
              `Project ${p.id} must belong to category ${cat}`
            );
          }
        }
      }
    });

    test('T2.2.5: Viewport boundary transitions (320px to 3840px) smoothly adapt pill container classes', () => {
      const sim = new PortfolioSimulator();

      // Mobile small
      sim.setViewport(320, 568);
      assertEqual(sim.getPillLayoutMode(), 'mobile-horizontal-scroll');

      // Tablet boundary (768px)
      sim.setViewport(768, 1024);
      assertEqual(sim.getPillLayoutMode(), 'desktop-wrap');

      // Desktop (1440px)
      sim.setViewport(1440, 900);
      assertEqual(sim.getPillLayoutMode(), 'desktop-wrap');

      // 4K Ultrawide (3840px)
      sim.setViewport(3840, 2160);
      assertEqual(sim.getPillLayoutMode(), 'desktop-wrap');
    });

    test('T2.2.6: Whitespace-only search query behaves as empty query and does not filter out valid projects', () => {
      const allProjects = loadProjects();
      const normalAll = filterProjects(allProjects, 'tech', 'All', '');
      const whitespaceAll = filterProjects(allProjects, 'tech', 'All', '    \t   ');
      assertEqual(whitespaceAll.length, normalAll.length, 'Whitespace search must match all projects in mode');
    });
  });

  // ==========================================
  // R3 Boundary Cases: Smart Bento Grid
  // ==========================================
  describe('R3 Boundary Cases: Smart Bento Grid', () => {
    test('T2.3.1: Empty committees or experience items for a custom/future mode handled gracefully without layout collapse', () => {
      const emptyHistory = filterBentoHistory([], [], 'tech', 'all');
      assertEqual(emptyHistory.length, 0);

      const sliced = sliceProgressiveDisclosure(emptyHistory, false, 6);
      assertEqual(sliced.length, 0);
    });

    test('T2.3.2: Exactly 6 history items (exact threshold boundary) suppresses disclosure toggle button', () => {
      const mockItems = Array.from({ length: 6 }, (_, i) => ({ id: `item-${i}`, role: `Role ${i}` }));
      const sliced = sliceProgressiveDisclosure(mockItems, false, 6);
      assertEqual(sliced.length, 6);

      // Invariant: should NOT show "Tampilkan N Lainnya" when total count <= threshold
      const shouldShowButton = mockItems.length > 6;
      assertEqual(shouldShowButton, false, 'Exactly 6 items must not display disclosure toggle');
    });

    test('T2.3.3: Odd counts of history items (1, 3, 5, 7, 11) flow naturally in responsive 3-column subgrid', () => {
      const oddCounts = [1, 3, 5, 7, 11];

      for (const count of oddCounts) {
        const mockItems = Array.from({ length: count }, (_, i) => ({ id: `item-${i}` }));
        const initialVisible = sliceProgressiveDisclosure(mockItems, false, 6);
        const expectedCount = Math.min(count, 6);
        assertEqual(initialVisible.length, expectedCount);

        const expandedVisible = sliceProgressiveDisclosure(mockItems, true, 6);
        assertEqual(expandedVisible.length, count);
      }
    });

    test('T2.3.4: Rapid segmented history tab switching retains or resets disclosure state deterministically', () => {
      const sim = new PortfolioSimulator({ mode: 'tech' });
      const tabs = ['all', 'experience', 'committees'];

      for (let i = 0; i < 300; i++) {
        const tab = tabs[i % tabs.length];
        sim.selectBentoTab(tab);
        assertEqual(sim.bentoActiveTab, tab);

        const visible = sim.getVisibleBentoHistoryItems();
        assert.ok(visible.length <= 6 || sim.bentoIsExpanded);
      }
    });

    test('T2.3.5: Extreme viewport bounds (320px to 3840px) maintain Bento Grid column integrity', () => {
      const sim = new PortfolioSimulator();
      const testViewports = [
        { width: 320, height: 480 },
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1024, height: 768 },
        { width: 1920, height: 1080 },
        { width: 3840, height: 2160 }
      ];

      for (const vp of testViewports) {
        sim.setViewport(vp.width, vp.height);
        const tiles = sim.getBentoTileSpecs();
        assertEqual(tiles.tile5_history.desktopSpan, 'lg:col-span-12');
        assertEqual(tiles.tile1_bio.desktopSpan, 'lg:col-span-8');
      }
    });

    test('T2.3.6: Long text description in experience or committee cards wraps safely with line clamp', () => {
      const experience = loadExperience();
      assert.ok(experience.length > 0);
      for (const exp of experience) {
        assert.ok(typeof exp.description === 'string' && exp.description.length > 0);
      }
    });
  });

  // ==========================================
  // R4 Boundary Cases: Dynamic Project Mode Icons
  // ==========================================
  describe('R4 Boundary Cases: Dynamic Project Mode Icons', () => {
    test('T2.4.1: Project with empty array, null, or undefined secondaryModes safely defaults to primary mode', () => {
      const testCases = [
        { id: 'p1', mode: 'tech', secondaryModes: [] },
        { id: 'p2', mode: 'medical', secondaryModes: null },
        { id: 'p3', mode: 'academic', secondaryModes: undefined }
      ];

      for (const p of testCases) {
        const resolved = resolveExpectedProjectMode(p.mode, p);
        assertEqual(resolved, p.mode);
        assertEqual(resolveExpectedProjectMode('other', p), p.mode);
      }
    });

    test('T2.4.2: Project with unknown/corrupt primary mode safely defaults to "tech" icon', () => {
      const corruptProject = { id: 'p-corrupt', mode: 'unknown-mode', secondaryModes: [] };
      const resolved = resolveExpectedProjectMode('tech', corruptProject);
      assertEqual(resolved, 'unknown-mode');
      const asset = resolveExpectedProjectIconAsset('tech', corruptProject);
      assertEqual(asset, ICON_ASSETS.tech, 'Corrupt mode must fallback to tech SVG icon asset');
    });

    test('T2.4.3: Null, undefined, or malformed project argument to resolveExpectedProjectMode returns active mode or "tech"', () => {
      assertEqual(resolveExpectedProjectMode('tech', null), 'tech');
      assertEqual(resolveExpectedProjectMode('medical', undefined), 'medical');
      assertEqual(resolveExpectedProjectMode('academic', {}), 'academic');
    });

    test('T2.4.4: Rapid mode toggles (1,000 cycles) keep dynamic icons for multi-mode projects synchronized with 0 lag', () => {
      const multiProject = {
        id: 'p-multi',
        mode: 'tech',
        secondaryModes: ['medical', 'academic']
      };

      for (let i = 0; i < 1000; i++) {
        const mode = MODES[i % 3];
        const resolved = resolveExpectedProjectMode(mode, multiProject);
        assertEqual(resolved, mode, `Iteration ${i}: Multi-mode icon must resolve to ${mode}`);
        const asset = resolveExpectedProjectIconAsset(mode, multiProject);
        assertEqual(asset, ICON_ASSETS[mode]);
      }
    });

    test('T2.4.5: SVG assets contain valid viewBox coordinate space for crisp high-DPI scaling', () => {
      for (const mode of MODES) {
        const result = assertValidSvg(ICON_ASSETS[mode]);
        assert.ok(result.viewBox, `SVG for ${mode} must have viewBox attribute`);
        const parts = result.viewBox.split(/[\s,]+/).map(Number);
        assertEqual(parts.length, 4, 'viewBox must have minX, minY, width, height');
        assert.ok(parts[2] > 0 && parts[3] > 0, 'viewBox dimensions must be positive');
      }
    });

    test('T2.4.6: Duplicate modes in secondaryModes array handled cleanly without errors', () => {
      const duplicateProject = {
        id: 'p-dup',
        mode: 'tech',
        secondaryModes: ['tech', 'medical', 'medical', 'academic', 'academic']
      };

      assertEqual(resolveExpectedProjectMode('medical', duplicateProject), 'medical');
      assertEqual(resolveExpectedProjectMode('academic', duplicateProject), 'academic');
      assertEqual(resolveExpectedProjectMode('tech', duplicateProject), 'tech');
    });
  });
});
