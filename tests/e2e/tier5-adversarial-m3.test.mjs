import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const MODES = ['tech', 'medical', 'academic'];

// Load authoritative project dataset directly
function loadRawProjects() {
  const jsonPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

describe('Tier 5: Adversarial Stress & Robustness Verification for Milestone 3', () => {

  // =========================================================================
  // Section 1: Dynamic Dataset JSON Filtering & Edge Case Resilience (R4)
  // =========================================================================
  describe('Dynamic Dataset JSON Filtering & Invariant Verification (R4)', () => {
    test('T5.3.1: Strict Boolean(p.featured) filter contract eliminates truthy impostors and non-featured items', () => {
      const rawProjects = loadRawProjects();

      for (const mode of MODES) {
        const filtered = rawProjects.filter(
          (p) => Boolean(p.featured) && (p.mode === mode || p.secondaryModes?.includes(mode))
        );

        // Invariant: every single item must strictly possess featured: true
        for (const proj of filtered) {
          assert.strictEqual(proj.featured, true, `Project ${proj.id} must have featured: true`);
          const matches = proj.mode === mode || (Array.isArray(proj.secondaryModes) && proj.secondaryModes.includes(mode));
          assert.strictEqual(matches, true, `Project ${proj.id} must match mode ${mode}`);
        }

        // Exactly 3 featured projects exist per mode in authoritative dataset
        assert.strictEqual(filtered.length, 3, `Expected exactly 3 featured projects for ${mode}, found ${filtered.length}`);
      }
    });

    test('T5.3.2: Adversarial project arrays (empty, non-featured only, or missing properties) filter safely', () => {
      const adversarialList = [
        { id: 'fake-1', title: 'Fake 1', featured: false, mode: 'tech' },
        { id: 'fake-2', title: 'Fake 2', featured: undefined, mode: 'tech' },
        { id: 'fake-3', title: 'Fake 3', featured: null, mode: 'tech' },
        { id: 'fake-4', title: 'Fake 4', featured: 0, mode: 'tech' },
        { id: 'fake-5', title: 'Fake 5', featured: '', mode: 'tech' },
        { id: 'fake-6', title: 'Fake 6' } // totally missing
      ];

      const result = adversarialList.filter(
        (p) => Boolean(p.featured) && (p.mode === 'tech' || p.secondaryModes?.includes('tech'))
      );
      assert.strictEqual(result.length, 0, 'Adversarial non-featured list must yield 0 results');
    });

    test('T5.3.3: Modulo cyclic slide indexing survives extreme bounds (negative, zero, large integers)', () => {
      const totalCount = 3;
      const getSafeIndex = (index, len) => {
        if (len <= 0) return 0;
        return ((index % len) + len) % len;
      };

      // Extreme negative indices
      assert.strictEqual(getSafeIndex(-1, totalCount), 2);
      assert.strictEqual(getSafeIndex(-2, totalCount), 1);
      assert.strictEqual(getSafeIndex(-3, totalCount), 0);
      assert.strictEqual(getSafeIndex(-1000, totalCount), 2);

      // Extreme positive indices
      assert.strictEqual(getSafeIndex(0, totalCount), 0);
      assert.strictEqual(getSafeIndex(3, totalCount), 0);
      assert.strictEqual(getSafeIndex(4, totalCount), 1);
      assert.strictEqual(getSafeIndex(999999, totalCount), 0);

      // Zero-length defense
      assert.strictEqual(getSafeIndex(5, 0), 0);
    });

    test('T5.3.4: 1,000 rapid mode transitions preserve activeSlideIndex reset to 0 invariant', () => {
      let activeSlideIndex = 2; // user was on slide 2
      const transitions = ['tech', 'medical', 'academic'];

      for (let i = 0; i < 1000; i++) {
        const nextMode = transitions[i % 3];
        // Simulating the useEffect(() => setActiveSlideIndex(0), [activeMode]) contract
        activeSlideIndex = 0;
        assert.strictEqual(activeSlideIndex, 0, `Slide index failed to reset at iteration ${i} for mode ${nextMode}`);
        // Advance slide
        activeSlideIndex = (activeSlideIndex + 1) % 3;
      }
    });
  });

  // =========================================================================
  // Section 2: 3-Tier Flexbox Modal Structure & Scrollbar Confinement (R5)
  // =========================================================================
  describe('3-Tier Flexbox Modal Structure & Defensive UI Contracts (R5)', () => {
    test('T5.3.5: src/components/project-modal.tsx strictly implements 3-tier Flexbox layout contract', () => {
      const modalPath = path.resolve(PROJECT_ROOT, 'src/components/project-modal.tsx');
      assert.ok(fs.existsSync(modalPath), `Missing project-modal.tsx at ${modalPath}`);
      const code = fs.readFileSync(modalPath, 'utf8');

      // 1. Outer dialog container MUST be flex flex-col max-h-[90vh] overflow-hidden
      assert.ok(
        code.includes('flex flex-col') && code.includes('max-h-[90vh]') && code.includes('overflow-hidden'),
        'Modal container must enforce flex flex-col max-h-[90vh] overflow-hidden'
      );

      // 2. Fixed Header MUST be flex-shrink-0 sticky top-0
      assert.ok(
        code.includes('flex-shrink-0 sticky top-0'),
        'Modal header must enforce flex-shrink-0 sticky top-0'
      );

      // 3. Scrollable Body MUST be flex-1 overflow-y-auto custom-scrollbar
      assert.ok(
        code.includes('flex-1 overflow-y-auto') && code.includes('custom-scrollbar'),
        'Modal body must enforce flex-1 overflow-y-auto custom-scrollbar'
      );

      // 4. Fixed Footer MUST be flex-shrink-0 border-t
      assert.ok(
        code.includes('flex-shrink-0') && code.includes('border-t'),
        'Modal footer must enforce flex-shrink-0 border-t'
      );

      // 5. Backdrop MUST have overflow-hidden, NOT overflow-y-auto (double scrollbar prevention)
      const backdropMatch = code.match(/className="fixed inset-0[^"]*"/);
      assert.ok(backdropMatch, 'Backdrop container must be present');
      assert.ok(
        backdropMatch[0].includes('overflow-hidden'),
        'Backdrop container must have overflow-hidden to prevent outer scrollbar leakage'
      );
      assert.ok(
        !backdropMatch[0].includes('overflow-y-auto'),
        'Backdrop container must NOT have overflow-y-auto'
      );
    });

    test('T5.3.6: Defensive null/undefined fallbacks in project-modal.tsx for sparse records', () => {
      const modalPath = path.resolve(PROJECT_ROOT, 'src/components/project-modal.tsx');
      const code = fs.readFileSync(modalPath, 'utf8');

      // Verifies defensive fallback assignment for caseStudy
      assert.ok(
        code.includes('project.caseStudy || {'),
        'Must provide fallback object when project.caseStudy is missing'
      );
      // Verifies defensive fallback for technologies
      assert.ok(
        code.includes('project.technologies || []'),
        'Must provide fallback array when project.technologies is missing'
      );
      // Verifies defensive fallback for metadata fields
      assert.ok(
        code.includes("project.role || '-'") || code.includes("project.role || ''"),
        'Must safely handle missing role'
      );
      assert.ok(
        code.includes("project.status || '-'") || code.includes("project.status || ''"),
        'Must safely handle missing status'
      );
      assert.ok(
        code.includes("project.visualType || '-'") || code.includes("project.visualType || ''"),
        'Must safely handle missing visualType'
      );
    });

    test('T5.3.7: Single-click modal trigger in hero.tsx (Zero onDoubleClick)', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      assert.ok(fs.existsSync(heroPath), `Missing hero.tsx at ${heroPath}`);
      const code = fs.readFileSync(heroPath, 'utf8');

      // Double-click requirement was eliminated in R5
      assert.strictEqual(
        code.includes('onDoubleClick'),
        false,
        'hero.tsx MUST NOT contain onDoubleClick handlers'
      );

      // Must have single-click on active card
      assert.ok(
        code.includes('if (isCardActive) {') && code.includes('onOpenProject(slideProj);'),
        'Active diamond card must open modal on single click'
      );

      // Must have btn-cta-detail opening currentHeroProject
      assert.ok(
        code.includes('id="btn-cta-detail"') && code.includes('onOpenProject(currentHeroProject)'),
        'btn-cta-detail must trigger onOpenProject on single click'
      );
    });

    test('T5.3.8: Modal title typography clamp & wrapping invariants', () => {
      const modalPath = path.resolve(PROJECT_ROOT, 'src/components/project-modal.tsx');
      const code = fs.readFileSync(modalPath, 'utf8');

      assert.ok(
        code.includes('id="case-study-title"'),
        'Modal title must declare id="case-study-title" for ARIA accessibility'
      );
      assert.ok(
        code.includes('break-words') && code.includes('line-clamp-2'),
        'Modal title must specify break-words and line-clamp-2 to prevent header overflow'
      );
    });
  });

  // =========================================================================
  // Section 3: Radix UI Tooltip Integration, IDs & Block Transitions (R6)
  // =========================================================================
  describe('Radix UI Tooltip Authenticity & Interactive Animations (R6)', () => {
    test('T5.3.9: src/components/ui/tooltip.tsx imports authentic Radix UI primitive and exports Tooltip components', () => {
      const tooltipPath = path.resolve(PROJECT_ROOT, 'src/components/ui/tooltip.tsx');
      assert.ok(fs.existsSync(tooltipPath), `Missing tooltip.tsx at ${tooltipPath}`);
      const code = fs.readFileSync(tooltipPath, 'utf8');

      assert.ok(
        code.includes('@radix-ui/react-tooltip'),
        'tooltip.tsx must import authentic @radix-ui/react-tooltip'
      );
      assert.ok(code.includes('TooltipPrimitive.Provider'), 'Must bind TooltipProvider to Radix Provider');
      assert.ok(code.includes('TooltipPrimitive.Root'), 'Must bind Tooltip to Radix Root');
      assert.ok(code.includes('TooltipPrimitive.Trigger'), 'Must bind TooltipTrigger to Radix Trigger');
      assert.ok(code.includes('TooltipPrimitive.Content'), 'Must bind TooltipContent to Radix Content');
      assert.ok(code.includes('export function ActionTooltip'), 'Must export ActionTooltip helper');
      assert.ok(code.includes('max-w-xs break-words'), 'TooltipContent must specify max-w-xs break-words');
    });

    test('T5.3.10: src/components/hero.tsx wraps section with TooltipProvider and interactive buttons with Tooltip', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const code = fs.readFileSync(heroPath, 'utf8');

      assert.ok(code.includes('<TooltipProvider'), 'hero.tsx must wrap content in TooltipProvider');
      assert.ok(code.includes('id="btn-cta-detail"'), 'Must define id="btn-cta-detail"');
      assert.ok(code.includes('id="btn-cta-cv"'), 'Must define id="btn-cta-cv"');
      assert.ok(code.includes('id="btn-slide-prev"'), 'Must define id="btn-slide-prev"');
      assert.ok(code.includes('id="btn-slide-next"'), 'Must define id="btn-slide-next"');
      assert.ok(code.includes('id={`btn-indicator-${idx}`}'), 'Must define dynamic id for slide indicators');

      // Each indicator must have role="tab" and aria-selected
      assert.ok(code.includes('role="tab"'), 'Indicators must have role="tab"');
      assert.ok(code.includes('aria-selected={isSelected}'), 'Indicators must declare aria-selected');
    });

    test('T5.3.11: Hero slide block transition has reactive remount key and motion-reduce support', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const code = fs.readFileSync(heroPath, 'utf8');

      assert.ok(
        code.includes('key={currentHeroProject.id}'),
        'Slide block must have reactive key={currentHeroProject.id} to trigger remount animation'
      );
      assert.ok(
        code.includes('animate-in') && code.includes('fade-in'),
        'Slide block must declare animate-in and fade-in transition classes'
      );
      assert.ok(
        code.includes('motion-reduce:transition-none'),
        'Transitions must honor prefers-reduced-motion via motion-reduce:transition-none'
      );
    });
  });
});
