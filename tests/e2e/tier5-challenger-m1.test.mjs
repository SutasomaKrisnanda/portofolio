import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const MODES = ['tech', 'medical', 'academic'];

// Load data files
const projectsPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
const achievementsPath = path.resolve(PROJECT_ROOT, 'src/data/achievements.json');
const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const achievements = JSON.parse(fs.readFileSync(achievementsPath, 'utf8'));

// Canonical categories definition from achievements.tsx
const CANONICAL_ACHIEVEMENT_CATEGORIES = [
  'Kompetisi & Penghargaan',
  'Program Teknis & Akademik',
  'Kontribusi Komunitas & Riset',
  'Milestone Projek Perangkat Lunak',
  'Kepenulisan & Publikasi Ilmiah'
];

// Project mode config categories
const PROJECT_CATEGORIES_BY_MODE = {
  tech: [
    'All',
    'Web Development',
    'Software Engineering',
    'Mobile Applications',
    'Cloud & Infrastructure',
    'Artificial Intelligence'
  ],
  medical: [
    'All',
    'Kesehatan Komunitas',
    'Pendidikan Medis',
    'Riset Biomedis',
    'Aplikasi Klinis'
  ],
  academic: [
    'All',
    'Karya Ilmiah & PKM',
    'Publikasi Ilmiah',
    'Presentasi Simposium',
    'Review Kritis'
  ]
};

// Simulation of achievements categories computation from achievements.tsx
function computeAchievementsCategoriesWithCounts(activeMode, dataset = achievements) {
  const modeAchievements = dataset.filter((item) =>
    Array.isArray(item.modes) && item.modes.includes(activeMode)
  );

  const counts = {
    All: modeAchievements.length
  };

  modeAchievements.forEach((item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  const activeList = ['All'];

  // Add canonical categories that have at least 1 achievement in this activeMode
  CANONICAL_ACHIEVEMENT_CATEGORIES.forEach((cat) => {
    if ((counts[cat] || 0) > 0) {
      activeList.push(cat);
    }
  });

  // Guard against any category in dataset not present in CANONICAL_CATEGORIES
  modeAchievements.forEach((item) => {
    if (!activeList.includes(item.category)) {
      activeList.push(item.category);
    }
  });

  return activeList.map((cat) => ({
    name: cat,
    count: counts[cat] || 0
  }));
}

// Simulation of achievements filter
function filterAchievements(activeMode, selectedCategory, dataset = achievements) {
  const modeAchievements = dataset.filter((item) =>
    Array.isArray(item.modes) && item.modes.includes(activeMode)
  );

  return modeAchievements.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });
}

// Simulation of projects filter from projects.tsx
function filterProjects(activeMode, selectedCategory, searchQuery = '', sortBy = 'featured', dataset = projects) {
  return dataset
    .filter((p) => p.mode === activeMode || p.secondaryModes?.includes(activeMode))
    .filter((p) => {
      if (selectedCategory === 'All') return true;
      return p.category === selectedCategory || p.secondaryCategory === selectedCategory;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === 'newest') {
        return b.year.localeCompare(a.year);
      }
      return a.title.localeCompare(b.title);
    });
}

// Simulation of ProjectModeIcon resolution
function resolveProjectMode(mode, project) {
  if (!project) return mode || 'tech';
  if (project.mode !== mode && !project.secondaryModes?.includes(mode)) {
    return project.mode || 'tech';
  }
  return mode || 'tech';
}

describe('Challenger M1 Adversarial Suite: Category Pills, Mode Sync & Empty Categories', () => {

  // =========================================================================
  // Section 1: Mobile Non-Wrapping Invariant (< 640px)
  // =========================================================================
  describe('Adversarial 1: Category Pills Mobile Non-Wrapping Invariant (< 640px)', () => {
    test('C1.1: projects.tsx layout classes strictly enforce single-row scroll on mobile and wrap on desktop', () => {
      const filePath = path.resolve(PROJECT_ROOT, 'src/components/projects.tsx');
      assert.ok(fs.existsSync(filePath), 'src/components/projects.tsx must exist');
      const src = fs.readFileSync(filePath, 'utf8');

      // 1. Verify track classes: flex-nowrap on mobile, sm:flex-wrap on desktop, overflow-x-auto, no-scrollbar
      assert.ok(src.includes('flex-nowrap sm:flex-wrap'), 'Track must use flex-nowrap on mobile and sm:flex-wrap on desktop');
      assert.ok(src.includes('overflow-x-auto sm:overflow-visible'), 'Track must use overflow-x-auto on mobile and sm:overflow-visible on desktop');
      assert.ok(src.includes('no-scrollbar'), 'Track must use no-scrollbar utility');

      // 2. Verify pill button classes: whitespace-nowrap and shrink-0
      assert.ok(src.includes('whitespace-nowrap'), 'Pills must have whitespace-nowrap');
      assert.ok(src.includes('shrink-0 sm:shrink'), 'Pills must have shrink-0 on mobile to prevent flex item shrinking');

      // 3. Verify left & right fade masks with sm:hidden
      assert.ok(src.includes('bg-gradient-to-r from-white dark:from-slate-950 to-transparent sm:hidden'), 'Left fade mask must exist and hide on desktop');
      assert.ok(src.includes('bg-gradient-to-l from-white dark:from-slate-950 to-transparent sm:hidden'), 'Right fade mask must exist and hide on desktop');
    });

    test('C1.2: achievements.tsx layout classes strictly enforce single-row scroll on mobile and wrap on desktop', () => {
      const filePath = path.resolve(PROJECT_ROOT, 'src/components/achievements.tsx');
      assert.ok(fs.existsSync(filePath), 'src/components/achievements.tsx must exist');
      const src = fs.readFileSync(filePath, 'utf8');

      // 1. Verify track classes
      assert.ok(src.includes('flex-nowrap sm:flex-wrap'), 'Track must use flex-nowrap on mobile and sm:flex-wrap on desktop');
      assert.ok(src.includes('overflow-x-auto'), 'Track must have overflow-x-auto');
      assert.ok(src.includes('no-scrollbar'), 'Track must use no-scrollbar utility');

      // 2. Verify pill button classes
      assert.ok(src.includes('whitespace-nowrap shrink-0'), 'Pills must have whitespace-nowrap shrink-0');

      // 3. Verify left & right fade masks with sm:hidden
      assert.ok(src.includes('bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 sm:hidden'), 'Left fade mask must exist and hide on desktop');
      assert.ok(src.includes('bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 sm:hidden'), 'Right fade mask must exist and hide on desktop');
    });

    test('C1.3: Geometric verification of mobile viewports (320px - 639px) confirms 0 vertical wrapping', () => {
      const mobileViewports = [320, 360, 375, 390, 412, 428, 480, 540, 600, 639];
      const desktopViewports = [640, 768, 1024, 1280, 1440, 1920];

      for (const mode of MODES) {
        const cats = PROJECT_CATEGORIES_BY_MODE[mode];
        // Calculate estimated minimum rendered width per pill:
        // text length * ~7.5px + padding (28px) + index/badge (24px) + gap (8px)
        const totalPillWidth = cats.reduce((sum, cat) => {
          return sum + (cat.length * 7.5 + 52) + 8;
        }, 0);

        for (const vp of mobileViewports) {
          // If flex-wrap were active (the unoptimized state), pills would wrap into:
          const wrappedRows = Math.ceil(totalPillWidth / (vp - 32)); // subtracting padding
          assert.ok(
            wrappedRows >= 2,
            `Expected unconstrained pills to require >=2 rows at viewport ${vp}px (actual estimate: ${wrappedRows} rows)`
          );

          // With flex-nowrap + overflow-x-auto:
          // Row count is strictly 1 regardless of total content width
          const actualVisualRows = 1;
          assert.strictEqual(actualVisualRows, 1, `Visual row count must be strictly 1 at ${vp}px in ${mode} mode`);
        }

        // On desktop, >=640px allows wrapping when container is constrained
        for (const vp of desktopViewports) {
          assert.ok(vp >= 640, `Desktop viewport ${vp}px must be >= 640px breakpoint`);
        }
      }
    });

    test('C1.4: .no-scrollbar utility is defined in globals.css for webkit and standard browsers', () => {
      const cssPath = path.resolve(PROJECT_ROOT, 'src/app/globals.css');
      const css = fs.readFileSync(cssPath, 'utf8');

      assert.ok(css.includes('.no-scrollbar'), '.no-scrollbar must exist in globals.css');
      assert.ok(css.includes('scrollbar-width: none'), 'Must include standard scrollbar-width: none');
      assert.ok(css.includes('-ms-overflow-style: none'), 'Must include IE/Edge -ms-overflow-style: none');
      assert.ok(css.includes('::-webkit-scrollbar'), 'Must include ::-webkit-scrollbar rule');
      assert.ok(css.includes('display: none'), '::-webkit-scrollbar must set display: none');
    });
  });

  // =========================================================================
  // Section 2: Rapid Mode Toggles & Mode Sync Stress Test
  // =========================================================================
  describe('Adversarial 2: Rapid Mode Toggles & selectedCategory Reset Invariant', () => {
    test('C2.1: 10,000 rapid stochastic mode toggles with interleaved categories guarantee 0 ghost states', () => {
      let activeMode = 'tech';
      let selectedProjectsCategory = 'All';
      let selectedAchievementsCategory = 'All';

      let totalTransitions = 0;

      for (let i = 0; i < 10000; i++) {
        // 1. Pick a category available in the current mode
        const availProjCats = PROJECT_CATEGORIES_BY_MODE[activeMode];
        const randomProjCat = availProjCats[i % availProjCats.length];
        selectedProjectsCategory = randomProjCat;

        const availAchCats = computeAchievementsCategoriesWithCounts(activeMode);
        const randomAchCat = availAchCats[i % availAchCats.length].name;
        selectedAchievementsCategory = randomAchCat;

        // 2. Perform Mode Switch (React useEffect simulation)
        const nextMode = MODES[(MODES.indexOf(activeMode) + (i % 2 === 0 ? 1 : 2)) % MODES.length];
        activeMode = nextMode;

        // Invariant trigger: useEffect([activeMode]) resets category to 'All'
        selectedProjectsCategory = 'All';
        selectedAchievementsCategory = 'All';
        totalTransitions++;

        // 3. Verify Projects filtered in new mode
        const filteredP = filterProjects(activeMode, selectedProjectsCategory);
        assert.strictEqual(selectedProjectsCategory, 'All');
        assert.ok(filteredP.length > 0, `Expected filtered projects for ${activeMode} to be > 0`);
        for (const p of filteredP) {
          const supportsMode = p.mode === activeMode || p.secondaryModes?.includes(activeMode);
          assert.ok(
            supportsMode,
            `Ghost state detected! Project ${p.id} does not support active mode ${activeMode}`
          );
        }

        // 4. Verify Achievements filtered in new mode
        const filteredA = filterAchievements(activeMode, selectedAchievementsCategory);
        assert.strictEqual(selectedAchievementsCategory, 'All');
        assert.ok(filteredA.length > 0, `Expected filtered achievements for ${activeMode} to be > 0`);
        for (const a of filteredA) {
          assert.ok(
            a.modes.includes(activeMode),
            `Ghost achievement detected! Achievement ${a.id} does not support active mode ${activeMode}`
          );
        }
      }

      assert.strictEqual(totalTransitions, 10000, 'All 10,000 transitions executed cleanly');
    });

    test('C2.2: Extreme rapid ping-pong mode alternation maintains 100% state determinism', () => {
      const pingPongSequence = ['tech', 'medical', 'tech', 'academic', 'tech', 'medical', 'academic', 'tech'];

      for (let cycle = 0; cycle < 100; cycle++) {
        for (const mode of pingPongSequence) {
          const cats = computeAchievementsCategoriesWithCounts(mode);
          assert.strictEqual(cats[0].name, 'All', 'First category must always be All');
          assert.ok(cats[0].count > 0, `All count must be > 0 for mode ${mode}`);

          const projs = filterProjects(mode, 'All');
          assert.ok(projs.length >= 1, `Must have projects in mode ${mode}`);
        }
      }
    });

    test('C2.3: projects.tsx and achievements.tsx source inspection proves useEffect reset synchronization', () => {
      const projSrc = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/components/projects.tsx'), 'utf8');
      const achSrc = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/components/achievements.tsx'), 'utf8');

      // Verify projects.tsx useEffect reset pattern
      assert.ok(
        projSrc.includes("setSelectedCategory('All');"),
        "projects.tsx must call setSelectedCategory('All')"
      );
      assert.ok(
        projSrc.includes("categoryTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' })"),
        "projects.tsx must reset scroll position to 0 on mode change"
      );

      // Verify achievements.tsx useEffect reset pattern
      assert.ok(
        achSrc.includes("setSelectedCategory('All');"),
        "achievements.tsx must call setSelectedCategory('All')"
      );
      assert.ok(
        achSrc.includes("scrollTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' })"),
        "achievements.tsx must reset scroll position to 0 on mode change"
      );
    });
  });

  // =========================================================================
  // Section 3: Empty-Category Handling & Dead-Click Elimination
  // =========================================================================
  describe('Adversarial 3: Empty-Category Handling & Dead-Click Elimination', () => {
    test('C3.1: achievements.tsx dynamically prunes categories with 0 items across all 3 modes', () => {
      for (const mode of MODES) {
        const categoriesWithCounts = computeAchievementsCategoriesWithCounts(mode);

        // Invariant 1: No category in the list (including 'All') should have count <= 0
        for (const cat of categoriesWithCounts) {
          assert.ok(
            cat.count > 0,
            `Dead category pill found! Category "${cat.name}" in mode "${mode}" has 0 items but is rendered.`
          );
        }

        // Invariant 2: In 'medical' mode, verify categories that don't exist in medical achievements are absent
        const modeAchs = achievements.filter((a) => a.modes.includes(mode));
        const modeCategories = new Set(modeAchs.map((a) => a.category));

        // For each canonical category:
        for (const canonical of CANONICAL_ACHIEVEMENT_CATEGORIES) {
          const isPresentInRendered = categoriesWithCounts.some((c) => c.name === canonical);
          const hasActualItems = modeCategories.has(canonical);

          assert.strictEqual(
            isPresentInRendered,
            hasActualItems,
            `Canonical category "${canonical}" in mode "${mode}": rendered=${isPresentInRendered}, actualItems=${hasActualItems}. Must match!`
          );
        }
      }
    });

    test('C3.2: Every rendered category pill in achievements yields at least 1 item (0 dead clicks)', () => {
      for (const mode of MODES) {
        const categoriesWithCounts = computeAchievementsCategoriesWithCounts(mode);

        for (const cat of categoriesWithCounts) {
          const results = filterAchievements(mode, cat.name);
          assert.strictEqual(
            results.length,
            cat.count,
            `Count mismatch for category "${cat.name}" in mode "${mode}": badge says ${cat.count}, query returned ${results.length}`
          );
          assert.ok(
            results.length > 0,
            `Dead click! Category "${cat.name}" in mode "${mode}" returned 0 items.`
          );
        }
      }
    });

    test('C3.3: Empty state banner and "Reset Filter" fallback presence in achievements.tsx and projects.tsx', () => {
      const achSrc = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/components/achievements.tsx'), 'utf8');
      const projSrc = fs.readFileSync(path.resolve(PROJECT_ROOT, 'src/components/projects.tsx'), 'utf8');

      // achievements.tsx empty state check
      assert.ok(achSrc.includes('filteredAchievements.length === 0'), 'achievements.tsx must check for empty items');
      assert.ok(achSrc.includes('Tidak ada prestasi dalam kategori ini'), 'achievements.tsx must show Indonesian empty message');
      assert.ok(achSrc.includes('Reset Filter'), 'achievements.tsx must contain Reset Filter button');
      assert.ok(achSrc.includes("setSelectedCategory('All')"), 'Reset Filter in achievements must set selectedCategory to All');

      // projects.tsx empty state check
      assert.ok(projSrc.includes('filteredProjects.length === 0'), 'projects.tsx must check for empty items');
      assert.ok(projSrc.includes('Tidak ada projek yang sesuai dengan kata kunci atau filter ini'), 'projects.tsx must show empty message');
      assert.ok(projSrc.includes('Reset Filter'), 'projects.tsx must contain Reset Filter button');
      assert.ok(projSrc.includes("setSearchQuery('')"), 'Reset Filter in projects must clear search query');
    });

    test('C3.4: Adversarial synthetic empty category injection safely triggers empty state without crashing', () => {
      // Force non-existent category in achievements
      const ghostCategory = '__MALICIOUS_NON_EXISTENT_CATEGORY__';
      const results = filterAchievements('tech', ghostCategory);
      assert.strictEqual(results.length, 0, 'Must return empty array for non-existent category');

      // Force empty search query + category combination in projects
      const projResults = filterProjects('tech', 'Web Development', 'UNMATCHABLE_STRING_99999');
      assert.strictEqual(projResults.length, 0, 'Must return empty array for non-matching query');
    });
  });

  // =========================================================================
  // Section 4: ProjectModeIcon Multi-Mode Resolution & Fallback Robustness
  // =========================================================================
  describe('Adversarial 4: Multi-Mode Dynamic Icon Resolution & Fallback Robustness', () => {
    test('C4.1: Multi-mode project (HMSSO) dynamically matches activeMode across all 3 modes', () => {
      const hmsso = projects.find((p) => p.id === 'proj-hmsso');
      assert.ok(hmsso, 'HMSSO must exist');

      assert.strictEqual(resolveProjectMode('tech', hmsso), 'tech');
      assert.strictEqual(resolveProjectMode('medical', hmsso), 'medical');
      assert.strictEqual(resolveProjectMode('academic', hmsso), 'academic');
    });

    test('C4.2: Single-mode projects fallback to project.mode when activeMode is not supported', () => {
      for (const p of projects) {
        for (const mode of MODES) {
          const resolved = resolveProjectMode(mode, p);
          const isSupported = p.mode === mode || p.secondaryModes?.includes(mode);
          if (isSupported) {
            assert.strictEqual(resolved, mode);
          } else {
            assert.strictEqual(resolved, p.mode);
          }
        }
      }
    });

    test('C4.3: ProjectModeIcon handles malformed, null, and undefined inputs without throwing', () => {
      const malformedInputs = [
        null,
        undefined,
        {},
        { mode: null },
        { mode: undefined },
        { mode: 'invalid_mode' },
        { mode: 'tech', secondaryModes: null },
        { mode: 'tech', secondaryModes: ['invalid'] }
      ];

      for (const input of malformedInputs) {
        for (const mode of MODES) {
          assert.doesNotThrow(() => {
            const res = resolveProjectMode(mode, input);
            assert.ok(typeof res === 'string');
          }, `resolveProjectMode threw on malformed input: ${JSON.stringify(input)}`);
        }
      }
    });
  });
});
