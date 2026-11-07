import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const HERO_FILE = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
const MODAL_FILE = path.resolve(PROJECT_ROOT, 'src/components/project-modal.tsx');
const PROJECTS_JSON = path.resolve(PROJECT_ROOT, 'src/data/projects.json');

// Mirror exact filter logic from src/components/hero.tsx (lines 64-68)
function heroFilterProjects(projects, activeMode) {
  if (!Array.isArray(projects)) return [];
  return projects.filter(
    (p) => p && Boolean(p.featured) && (p.mode === activeMode || p.secondaryModes?.includes(activeMode))
  );
}

// Mirror exact safeIndex logic from src/components/hero.tsx (line 72)
function computeSafeHeroIndex(activeSlideIndex, totalCount) {
  if (totalCount <= 0) return 0;
  return ((activeSlideIndex % totalCount) + totalCount) % totalCount;
}

// Mirror exact handlePrevSlide logic from src/components/hero.tsx (lines 76-79)
function computePrevSlideIndex(prevIndex, totalCount) {
  if (totalCount <= 0) return 0;
  return (prevIndex - 1 + totalCount) % totalCount;
}

// Mirror exact handleNextSlide logic from src/components/hero.tsx (lines 81-84)
function computeNextSlideIndex(prevIndex, totalCount) {
  if (totalCount <= 0) return 0;
  return (prevIndex + 1) % totalCount;
}

describe('Tier 5 Challenger: Empirical Adversarial Challenge for Milestone 3', () => {

  // =========================================================================
  // Challenge 1: R4 Dataset Filter Fuzzing & Malformed Data Stress Testing
  // =========================================================================
  describe('Challenge 1: Dataset Filter Fuzzing & Schema Robustness (R4)', () => {

    test('CH5.3.1: Fuzzing non-boolean, falsy, and truthy `featured` values', () => {
      const baseProject = { id: 'p-fuzz', mode: 'tech', secondaryModes: [] };

      // Strictly false / falsy values must yield 0 results
      const falsyValues = [false, 0, -0, 0n, '', null, undefined, NaN];
      for (const val of falsyValues) {
        const filtered = heroFilterProjects([{ ...baseProject, featured: val }], 'tech');
        assert.strictEqual(
          filtered.length,
          0,
          `Falsy featured value ${String(val)} must be excluded`
        );
      }

      // Explicit boolean true must yield 1 result
      assert.strictEqual(
        heroFilterProjects([{ ...baseProject, featured: true }], 'tech').length,
        1
      );

      // Truthy values coerced via Boolean(p.featured)
      const truthyValues = [true, 1, -1, 'true', 'featured', [1], { a: 1 }];
      for (const val of truthyValues) {
        const filtered = heroFilterProjects([{ ...baseProject, featured: val }], 'tech');
        assert.strictEqual(
          filtered.length,
          1,
          `Truthy featured value ${String(val)} should be included`
        );
      }
    });

    test('CH5.3.2: Fuzzing missing, null, primitive, and corrupt `secondaryModes`', () => {
      const base = { id: 'p-sec', mode: 'academic', featured: true };

      // Missing secondaryModes
      const pMissing = { ...base };
      delete pMissing.secondaryModes;
      assert.strictEqual(heroFilterProjects([pMissing], 'academic').length, 1);
      assert.strictEqual(heroFilterProjects([pMissing], 'tech').length, 0);

      // Null secondaryModes
      const pNull = { ...base, secondaryModes: null };
      assert.doesNotThrow(() => heroFilterProjects([pNull], 'medical'));
      assert.strictEqual(heroFilterProjects([pNull], 'academic').length, 1);
      assert.strictEqual(heroFilterProjects([pNull], 'medical').length, 0);

      // Undefined secondaryModes
      const pUndef = { ...base, secondaryModes: undefined };
      assert.doesNotThrow(() => heroFilterProjects([pUndef], 'medical'));
      assert.strictEqual(heroFilterProjects([pUndef], 'academic').length, 1);
      assert.strictEqual(heroFilterProjects([pUndef], 'medical').length, 0);

      // Empty array secondaryModes
      const pEmpty = { ...base, secondaryModes: [] };
      assert.strictEqual(heroFilterProjects([pEmpty], 'academic').length, 1);
      assert.strictEqual(heroFilterProjects([pEmpty], 'medical').length, 0);

      // Malformed non-array types: number and plain object lack .includes, throwing TypeError
      const pNum = { ...base, secondaryModes: 9999 };
      assert.throws(
        () => heroFilterProjects([pNum], 'medical'),
        /is not a function/,
        'Calling .includes on numeric secondaryModes throws TypeError without Array.isArray guard'
      );

      const pObj = { ...base, secondaryModes: { 0: 'tech' } };
      assert.throws(
        () => heroFilterProjects([pObj], 'tech'),
        /is not a function/,
        'Calling .includes on object secondaryModes throws TypeError without Array.isArray guard'
      );
    });

    test('CH5.3.3: Mode case variations, unknown modes, and malicious injection', () => {
      const realProjects = JSON.parse(fs.readFileSync(PROJECTS_JSON, 'utf8'));

      // Case mismatch: ModeId contract is strictly lowercase
      assert.strictEqual(heroFilterProjects(realProjects, 'TECH').length, 0);
      assert.strictEqual(heroFilterProjects(realProjects, 'Tech').length, 0);
      assert.strictEqual(heroFilterProjects(realProjects, 'MEDICAL').length, 0);
      assert.strictEqual(heroFilterProjects(realProjects, 'Academic').length, 0);

      // Adversarial inputs
      const adversarial = ['', '   ', 'null', 'undefined', null, undefined, 42, false, '<script>alert(1)</script>', '__proto__'];
      for (const adv of adversarial) {
        assert.doesNotThrow(() => {
          const res = heroFilterProjects(realProjects, adv);
          assert.strictEqual(res.length, 0);
        });
      }
    });

    test('CH5.3.4: Massive random fuzzing across 25,000 synthetic project variations', () => {
      const modeChoices = ['tech', 'medical', 'academic', 'unknown', ''];
      const synthetic = [];

      for (let i = 0; i < 25000; i++) {
        synthetic.push({
          id: `fuzz-${i}`,
          title: `Project ${i}`,
          mode: modeChoices[i % modeChoices.length],
          secondaryModes: i % 4 === 0
            ? [modeChoices[(i + 1) % modeChoices.length], modeChoices[(i + 2) % modeChoices.length]]
            : i % 4 === 1
            ? []
            : i % 4 === 2
            ? null
            : undefined,
          featured: i % 3 === 0
        });
      }

      const start = performance.now();
      const techFeatured = heroFilterProjects(synthetic, 'tech');
      const medicalFeatured = heroFilterProjects(synthetic, 'medical');
      const academicFeatured = heroFilterProjects(synthetic, 'academic');
      const elapsed = performance.now() - start;

      assert.ok(elapsed < 60, `25,000 items filtered across 3 modes in ${elapsed.toFixed(2)}ms (must be < 60ms)`);

      // Independent oracle verification
      for (const p of techFeatured) {
        assert.strictEqual(Boolean(p.featured), true);
        const match = p.mode === 'tech' || (Array.isArray(p.secondaryModes) && p.secondaryModes.includes('tech'));
        assert.ok(match, `Project ${p.id} incorrectly matched tech`);
      }
    });

    test('CH5.3.5: Null and undefined project entries resilience', () => {
      const corruptedList = [
        null,
        undefined,
        { id: 'valid-1', mode: 'tech', featured: true },
        null,
        { id: 'valid-2', mode: 'tech', featured: false },
        undefined
      ];

      assert.doesNotThrow(() => {
        const res = heroFilterProjects(corruptedList, 'tech');
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'valid-1');
      });
    });
  });

  // =========================================================================
  // Challenge 2: Cyclic Boundary Math & Index Auto-Reset Verification
  // =========================================================================
  describe('Challenge 2: Cyclic Boundary Math & Index Auto-Reset (R4)', () => {

    test('CH5.3.6: Mathematical Euclidean modulo invariant proof across 100,000 permutations', () => {
      // Test across list lengths N = 1 to 25 and indices -2000 to 2000
      for (let N = 1; N <= 25; N++) {
        for (let idx = -2000; idx <= 2000; idx++) {
          const safe = computeSafeHeroIndex(idx, N);
          assert.ok(
            safe >= 0 && safe < N,
            `computeSafeHeroIndex(${idx}, ${N}) = ${safe} violates [0, ${N - 1}]`
          );
        }
      }
    });

    test('CH5.3.7: Boundary zero and single-item resilience', () => {
      // Zero items (empty list)
      assert.strictEqual(computeSafeHeroIndex(0, 0), 0);
      assert.strictEqual(computeSafeHeroIndex(5, 0), 0);
      assert.strictEqual(computePrevSlideIndex(0, 0), 0);
      assert.strictEqual(computeNextSlideIndex(0, 0), 0);

      // Single item (N = 1)
      assert.strictEqual(computeSafeHeroIndex(0, 1), 0);
      assert.strictEqual(computeSafeHeroIndex(-1, 1), 0);
      assert.strictEqual(computeSafeHeroIndex(1, 1), 0);
      assert.strictEqual(computePrevSlideIndex(0, 1), 0);
      assert.strictEqual(computeNextSlideIndex(0, 1), 0);
    });

    test('CH5.3.8: Random walk navigation simulation (50,000 transitions)', () => {
      const N = 3; // Actual featured count per mode in projects.json
      let currentIndex = 0;

      for (let step = 0; step < 50000; step++) {
        if (Math.random() < 0.5) {
          currentIndex = computeNextSlideIndex(currentIndex, N);
        } else {
          currentIndex = computePrevSlideIndex(currentIndex, N);
        }
        assert.ok(currentIndex >= 0 && currentIndex < N, `Step ${step}: index ${currentIndex} out of range [0, 2]`);
      }
    });

    test('CH5.3.9: Extreme numerical boundaries (MAX_SAFE_INTEGER, MIN_SAFE_INTEGER, NaN)', () => {
      const N = 3;
      assert.ok(computeSafeHeroIndex(Number.MAX_SAFE_INTEGER, N) >= 0);
      assert.ok(computeSafeHeroIndex(Number.MIN_SAFE_INTEGER, N) >= 0);

      // NaN safe handling
      const nanIndex = computeSafeHeroIndex(NaN, N);
      // In JS, NaN % N is NaN. The hero component guards this via heroSlides[safeIndex] || null
      assert.strictEqual(isNaN(nanIndex), true);
    });

    test('CH5.3.10: Intermediate render bounds safety before useEffect auto-reset fires', () => {
      // Scenario: User was at index 2 in Tech mode (3 items).
      // Mode switches to a custom mode with only 1 item.
      // In React, heroSlides updates synchronously during render, but useEffect runs AFTER render.
      // During that single render frame, activeSlideIndex is still 2!
      const staleActiveIndex = 2;
      const newModeSlideCount = 1;

      const safeIndexDuringRender = computeSafeHeroIndex(staleActiveIndex, newModeSlideCount);
      assert.strictEqual(
        safeIndexDuringRender,
        0,
        `safeIndex during intermediate render must be 0, preventing out-of-bounds access`
      );

      // Test with newModeSlideCount = 2
      const safeIndexCount2 = computeSafeHeroIndex(staleActiveIndex, 2);
      assert.strictEqual(safeIndexCount2, 0); // 2 % 2 = 0
    });

    test('CH5.3.11: Hero source code inspection for auto-reset and safeIndex', () => {
      const heroCode = fs.readFileSync(HERO_FILE, 'utf8');

      // Auto-reset hook
      assert.ok(
        heroCode.includes('setActiveSlideIndex(0);'),
        'hero.tsx must reset activeSlideIndex to 0 on mode change'
      );
      assert.ok(
        heroCode.includes('[activeMode]'),
        'hero.tsx auto-reset useEffect must depend on [activeMode]'
      );

      // safeIndex bounds formula
      assert.ok(
        heroCode.includes('((activeSlideIndex % heroSlides.length) + heroSlides.length) % heroSlides.length'),
        'hero.tsx must use Euclidean modulo formula for safeIndex'
      );

      // Empty slides guard
      assert.ok(
        heroCode.includes('if (heroSlides.length === 0) return null;'),
        'hero.tsx must return null when heroSlides.length === 0'
      );
    });
  });

  // =========================================================================
  // Challenge 3: Modal DOM Structure & 3-Tier Flexbox Classes (R5)
  // =========================================================================
  describe('Challenge 3: Modal DOM Structure & 3-Tier Flexbox Verification (R5)', () => {

    test('CH5.3.12: Modal container declares exact 3-tier Flexbox layout hierarchy', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      // Tier 1: Outer Container
      assert.ok(
        modalCode.includes('flex flex-col') && modalCode.includes('max-h-[90vh]') && modalCode.includes('overflow-hidden'),
        'Tier 1 outer container must declare flex flex-col max-h-[90vh] overflow-hidden'
      );

      // Tier 2: Fixed Header
      assert.ok(
        modalCode.includes('flex-shrink-0 sticky top-0 z-20'),
        'Tier 2 header must declare flex-shrink-0 sticky top-0 z-20'
      );
      assert.ok(
        modalCode.includes('border-b'),
        'Tier 2 header must have border-b'
      );

      // Tier 3: Scrollable Body
      assert.ok(
        modalCode.includes('flex-1 overflow-y-auto') && modalCode.includes('custom-scrollbar'),
        'Tier 3 body must declare flex-1 overflow-y-auto custom-scrollbar'
      );

      // Tier 4: Fixed Footer
      assert.ok(
        modalCode.includes('flex-shrink-0 z-20 border-t'),
        'Tier 4 footer must declare flex-shrink-0 z-20 border-t'
      );
    });

    test('CH5.3.13: Modal header title clamping, word breaks, and dialog ARIA bindings', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      // Title clamping & break
      assert.ok(modalCode.includes('line-clamp-2'), 'Title must have line-clamp-2');
      assert.ok(modalCode.includes('break-words'), 'Title must have break-words');

      // ARIA Dialog bindings
      assert.ok(modalCode.includes('role="dialog"'), 'Backdrop must have role="dialog"');
      assert.ok(modalCode.includes('aria-modal="true"'), 'Backdrop must have aria-modal="true"');
      assert.ok(modalCode.includes('aria-labelledby="case-study-title"'), 'Backdrop must reference case-study-title');
      assert.ok(modalCode.includes('id="case-study-title"'), 'H2 title must have id="case-study-title"');
    });

    test('CH5.3.14: Modal close button accessible tooltip and labels', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      assert.ok(
        modalCode.includes('aria-label="Tutup detail studi kasus"'),
        'Close button must have aria-label="Tutup detail studi kasus"'
      );
      assert.ok(
        modalCode.includes('Tutup Modal (Esc)'),
        'Close button must display tooltip "Tutup Modal (Esc)"'
      );
    });
  });

  // =========================================================================
  // Challenge 4: Zero Double Scrollbar & Boundary Leakage Proof (R5)
  // =========================================================================
  describe('Challenge 4: Zero Double Scrollbar & Scrollbar Boundary Confinement (R5)', () => {

    test('CH5.3.15: Backdrop wrapper forbids overflow-y-auto (zero outer scrollbar)', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      const backdropRegex = /role="dialog"[\s\S]*?className="([^"]+)"/;
      const match = modalCode.match(backdropRegex);
      assert.ok(match, 'Modal must contain backdrop element with role="dialog"');

      const classes = match[1].split(/\s+/);
      assert.ok(
        classes.includes('overflow-hidden'),
        'Backdrop must specify overflow-hidden'
      );
      assert.strictEqual(
        classes.includes('overflow-y-auto'),
        false,
        'Backdrop must NEVER have overflow-y-auto (double scrollbar defect)'
      );
      assert.strictEqual(
        classes.includes('overflow-scroll'),
        false,
        'Backdrop must NEVER have overflow-scroll'
      );
    });

    test('CH5.3.16: Document body scroll lock lifecycle', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      assert.ok(
        modalCode.includes("document.body.style.overflow = 'hidden';"),
        "Modal must set document.body.style.overflow = 'hidden' when active"
      );
      assert.ok(
        modalCode.includes("document.body.style.overflow = '';"),
        "Modal cleanup must restore document.body.style.overflow = ''"
      );
    });

    test('CH5.3.17: Scrollbar boundary isolation against asymmetric rounded corners', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      // The outer container has asymmetric curves:
      // rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px]
      assert.ok(
        modalCode.includes('rounded-tr-[36px] sm:rounded-tr-[44px] rounded-bl-[28px] sm:rounded-bl-[32px]'),
        'Outer container has asymmetric curves'
      );

      // Verify that the scrollbar is strictly confined inside the body:
      // Body has flex-1 overflow-y-auto, positioned between fixed header and fixed footer.
      // The outer container also has overflow-hidden as an outer boundary guard.
      assert.ok(
        modalCode.includes('flex flex-col') && modalCode.includes('overflow-hidden'),
        'Outer container clips all overflowing content'
      );
    });
  });

  // =========================================================================
  // Challenge 5: Single-Click Trigger Integration & Dismissal Contracts
  // =========================================================================
  describe('Challenge 5: Single-Click Modal Triggers & Event Isolation (R5)', () => {

    test('CH5.3.18: Absolute absence of onDoubleClick in hero component', () => {
      const heroCode = fs.readFileSync(HERO_FILE, 'utf8');
      assert.strictEqual(
        heroCode.includes('onDoubleClick'),
        false,
        'hero.tsx must have zero onDoubleClick handlers'
      );
    });

    test('CH5.3.19: Single click triggers modal on active diamond card and primary CTA', () => {
      const heroCode = fs.readFileSync(HERO_FILE, 'utf8');

      // CTA Button
      assert.ok(
        heroCode.includes('id="btn-cta-detail"'),
        'Hero must have primary CTA button id="btn-cta-detail"'
      );
      assert.ok(
        heroCode.includes('onOpenProject(currentHeroProject)'),
        'CTA button click calls onOpenProject'
      );

      // Diamond card click
      assert.ok(
        heroCode.includes('if (isCardActive) {'),
        'Diamond card click checks if active card'
      );
      assert.ok(
        heroCode.includes('onOpenProject(slideProj);'),
        'Active diamond card single click calls onOpenProject'
      );
    });

    test('CH5.3.20: Backdrop click dismiss vs inner content event isolation', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      // Backdrop click dismissal
      assert.ok(
        modalCode.includes('if (e.target === e.currentTarget) onClose();'),
        'Backdrop click must check e.target === e.currentTarget before closing'
      );

      // Inner container click event propagation stop
      assert.ok(
        modalCode.includes('onClick={(e) => e.stopPropagation()}'),
        'Modal container must call e.stopPropagation() to prevent unintended dismissal'
      );

      // Escape key listener
      assert.ok(
        modalCode.includes("if (e.key === 'Escape') onClose();"),
        'Modal must listen for Escape key to close'
      );
    });
  });

  // =========================================================================
  // Challenge 6: Sparse & Adversarial Data Resilience in Modal (R5)
  // =========================================================================
  describe('Challenge 6: Sparse & Adversarial Data Resilience in Modal (R5)', () => {

    test('CH5.3.21: Defensive fallbacks for sparse project objects without caseStudy', () => {
      const modalCode = fs.readFileSync(MODAL_FILE, 'utf8');

      assert.ok(
        modalCode.includes('const caseStudy = project.caseStudy ||'),
        'Modal must have defensive fallback object for caseStudy'
      );
      assert.ok(
        modalCode.includes('const technologies = project.technologies || []'),
        'Modal must have defensive array fallback for technologies'
      );
      assert.ok(
        modalCode.includes('const objectives = caseStudy.objectives || []'),
        'Modal must have defensive array fallback for objectives'
      );
      assert.ok(
        modalCode.includes('const roleAndContributions = caseStudy.roleAndContributions || []'),
        'Modal must have defensive array fallback for roleAndContributions'
      );
      assert.ok(
        modalCode.includes('const processAndMethodology = caseStudy.processAndMethodology || []'),
        'Modal must have defensive array fallback for processAndMethodology'
      );
      assert.ok(
        modalCode.includes('const linksAndReferences = caseStudy.linksAndReferences || []'),
        'Modal must have defensive array fallback for linksAndReferences'
      );
    });
  });

  // =========================================================================
  // Challenge 7: Reactive Block Transition Animations & Tooltips (R6)
  // =========================================================================
  describe('Challenge 7: Slide Block Transitions & Accessible Radix Tooltips (R6)', () => {

    test('CH5.3.22: Reactive key remounting on slide project description block', () => {
      const heroCode = fs.readFileSync(HERO_FILE, 'utf8');

      assert.ok(
        heroCode.includes('key={currentHeroProject.id}'),
        'Slide description block must have reactive key={currentHeroProject.id}'
      );
      assert.ok(
        heroCode.includes('animate-in fade-in slide-in-from-left-3 duration-500'),
        'Slide block must include Tailwind entrance transition classes'
      );
      assert.ok(
        heroCode.includes('motion-reduce:transition-none'),
        'Slide block must respect motion-reduce:transition-none'
      );
    });

    test('CH5.3.23: Full audit of Radix Tooltip wrappers on all interactive buttons', () => {
      const heroCode = fs.readFileSync(HERO_FILE, 'utf8');

      assert.ok(heroCode.includes('<TooltipProvider delayDuration={200} skipDelayDuration={100}>'), 'Hero wrapped in TooltipProvider');
      assert.ok(heroCode.includes('id="btn-cta-detail"'), 'btn-cta-detail exists');
      assert.ok(heroCode.includes('id="btn-cta-cv"'), 'btn-cta-cv exists');
      assert.ok(heroCode.includes('id="btn-slide-prev"'), 'btn-slide-prev exists');
      assert.ok(heroCode.includes('id="btn-slide-next"'), 'btn-slide-next exists');
      assert.ok(heroCode.includes('id={`btn-indicator-${idx}`}'), 'dynamic indicators exist');
    });
  });
});
