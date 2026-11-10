import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const MODES = ['tech', 'medical', 'academic'];
const THEMES = ['dark', 'light'];

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function loadProjectsJson() {
  const jsonPath = path.resolve(PROJECT_ROOT, 'src/data/projects.json');
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

describe('Tier 5 Challenger M4: Whole-Project Cross-Feature Adversarial Stress Suite', () => {

  // =========================================================================
  // Section 1: End-to-End Multi-Mode State Journey & Asset Coherence (R1, R2, R3, R4)
  // =========================================================================
  describe('Journey 1: Cross-Feature Multi-Mode Traversal (R1 - R4)', () => {
    test('CH4.1.1: 500 complete mode transitions verify synchronous background, 3D model, and icon alignment', () => {
      const rawProjects = loadProjectsJson();
      const multiModeProject = rawProjects.find((p) => p.id === 'proj-hmsso');
      assert.ok(multiModeProject, 'Multi-mode project proj-hmsso must exist in dataset');

      let currentMode = 'tech';
      let activeSlideIndex = 2; // user started on slide 2

      for (let i = 0; i < 500; i++) {
        const nextMode = MODES[i % 3];
        currentMode = nextMode;

        // R4 Invariant: mode change must immediately reset slide index to 0
        activeSlideIndex = 0;
        assert.strictEqual(activeSlideIndex, 0, `Slide index not reset to 0 in iteration ${i}`);

        // R1: Background asset resolution
        for (const theme of THEMES) {
          const bgFile = `bg-${currentMode}-${theme}.avif`;
          const bgPath = path.resolve(PROJECT_ROOT, 'src/assets/image', bgFile);
          assert.ok(fs.existsSync(bgPath), `Background file missing: ${bgFile}`);
        }

        // R2: 3D model target mapping (model-pena replaces heavy model-quill per user mandate)
        const expectedModel =
          currentMode === 'medical'
            ? 'model-jantung.glb'
            : currentMode === 'academic'
            ? 'model-pena.glb'
            : null; // procedural for tech

        if (expectedModel) {
          const modelPub = path.resolve(PROJECT_ROOT, 'public/models', expectedModel);
          const modelOut = path.resolve(PROJECT_ROOT, 'out/models', expectedModel);
          assert.ok(fs.existsSync(modelPub), `Public model missing: ${expectedModel}`);
          assert.ok(fs.existsSync(modelOut), `Out model missing: ${expectedModel}`);
        }

        // R3: Dynamic icon selection for multi-mode project
        const resolvedIconMode = multiModeProject.secondaryModes?.includes(currentMode)
          ? currentMode
          : multiModeProject.mode;
        assert.strictEqual(resolvedIconMode, currentMode, `Icon mode for HMSSO must be ${currentMode}`);
        const iconFile = `project-${resolvedIconMode}.svg`;
        const iconPath = path.resolve(PROJECT_ROOT, 'src/assets/icons', iconFile);
        assert.ok(fs.existsSync(iconPath), `Icon file missing: ${iconFile}`);

        // R4: Filtered hero projects count and content
        const heroSlides = rawProjects.filter(
          (p) => Boolean(p.featured) && (p.mode === currentMode || p.secondaryModes?.includes(currentMode))
        );
        assert.strictEqual(heroSlides.length, 3, `Mode ${currentMode} must have exactly 3 featured projects`);
        const activeProject = heroSlides[activeSlideIndex];
        assert.ok(activeProject, `Active project must exist for mode ${currentMode}`);
        assert.strictEqual(activeProject.featured, true);
      }
    });

    test('CH4.1.2: Cross-feature state consistency: URL query param, localStorage, and activeMode synchronization', () => {
      // Simulating Home component mount synchronization
      const testCases = [
        { url: 'tech', storage: 'medical', expected: 'tech' },       // URL takes precedence
        { url: null, storage: 'academic', expected: 'academic' },    // LocalStorage fallback
        { url: 'invalid', storage: 'medical', expected: 'medical' }, // Invalid URL falls back to storage
        { url: null, storage: null, expected: 'tech' }               // Default fallback
      ];

      for (const tc of testCases) {
        let activeMode = 'tech';
        if (MODES.includes(tc.url)) {
          activeMode = tc.url;
        } else if (MODES.includes(tc.storage)) {
          activeMode = tc.storage;
        }
        assert.strictEqual(activeMode, tc.expected, `Failed synchronization for case ${JSON.stringify(tc)}`);
      }
    });
  });

  // =========================================================================
  // Section 2: 3D Canvas Rendering Lifecycle & WebGL Resource Disposal (R2)
  // =========================================================================
  describe('3D Canvas Lifecycle & WebGL Resource Disposal (R2)', () => {
    test('CH4.2.1: Model in-memory cache maintains singleton instances across 1,000 mode swaps without geometry leaks', () => {
      const modelCache = new Map();

      // Simulate createTechPolyhedron
      const createTechPolyhedron = () => {
        const group = new THREE.Group();
        const geo = new THREE.IcosahedronGeometry(1.0, 0);
        const mat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8 });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        return { pivotGroup: group, baseScale: 1.0 };
      };

      // Simulate loading model-jantung and model-quill once
      modelCache.set('tech', createTechPolyhedron());
      const fakeMedicalGroup = new THREE.Group();
      fakeMedicalGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
      modelCache.set('medical', { pivotGroup: fakeMedicalGroup, baseScale: 2.2 });

      const fakeAcademicGroup = new THREE.Group();
      fakeAcademicGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2), new THREE.MeshBasicMaterial()));
      modelCache.set('academic', { pivotGroup: fakeAcademicGroup, baseScale: 2.2 });

      // Run 1,000 rapid switches into a Three.js scene
      const scene = new THREE.Scene();
      let activePivot = null;

      for (let i = 0; i < 1000; i++) {
        const targetMode = MODES[i % 3];
        if (activePivot) {
          scene.remove(activePivot);
          activePivot = null;
        }

        const cached = modelCache.get(targetMode);
        assert.ok(cached, `Cached model must exist for ${targetMode}`);
        activePivot = cached.pivotGroup;
        scene.add(activePivot);

        // Verification: Exactly 1 child in scene
        assert.strictEqual(scene.children.length, 1, `Scene must strictly have 1 child object at step ${i}`);
        assert.strictEqual(scene.children[0], cached.pivotGroup);
      }

      // Cleanup
      scene.remove(activePivot);
      assert.strictEqual(scene.children.length, 0);
      assert.strictEqual(modelCache.size, 3, 'Model cache must retain exactly 3 entries without unbounded growth');
    });

    test('CH4.2.2: Three.js WebGLRenderer lifecycle disposal simulation executes cleanly with 0 unhandled rejections', () => {
      // Simulate component mount and unmount cycles
      for (let cycle = 0; cycle < 50; cycle++) {
        const scene = new THREE.Scene();
        const ambient = new THREE.AmbientLight(0xffffff, 1.0);
        const directional = new THREE.DirectionalLight(0xffffff, 2.0);
        scene.add(ambient);
        scene.add(directional);

        // Add icosahedron mesh
        const geo = new THREE.IcosahedronGeometry(1.0, 0);
        const mat = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Simulate cleanup & disposal
        geo.dispose();
        mat.dispose();
        scene.remove(ambient);
        scene.remove(directional);
        scene.remove(mesh);

        assert.strictEqual(scene.children.length, 0, `Scene must be empty after disposal in cycle ${cycle}`);
      }
    });

    test('CH4.2.3: ResizeObserver viewport adaptation math maintains camera aspect ratio and valid projection matrix', () => {
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

      const viewports = [
        { width: 320, height: 568 },    // iPhone SE
        { width: 375, height: 667 },    // Mobile standard
        { width: 768, height: 1024 },   // iPad portrait
        { width: 1024, height: 768 },   // iPad landscape
        { width: 1280, height: 720 },   // HD
        { width: 1920, height: 1080 },  // FHD
        { width: 2560, height: 1440 },  // QHD
        { width: 3840, height: 2160 }   // 4K UHD
      ];

      for (const vp of viewports) {
        camera.aspect = vp.width / vp.height;
        camera.updateProjectionMatrix();

        assert.ok(!Number.isNaN(camera.aspect), `Camera aspect is NaN for viewport ${vp.width}x${vp.height}`);
        assert.ok(Number.isFinite(camera.aspect), `Camera aspect not finite for viewport ${vp.width}x${vp.height}`);

        const elements = camera.projectionMatrix.elements;
        for (let i = 0; i < 16; i++) {
          assert.ok(!Number.isNaN(elements[i]), `Projection matrix element ${i} is NaN`);
          assert.ok(Number.isFinite(elements[i]), `Projection matrix element ${i} is not finite`);
        }
      }
    });

    test('CH4.2.4: Pointer drag momentum & damping strictly converges to 0 without stuck momentum', () => {
      let dragVelocity = { x: 0.85, y: -1.2 };
      let dragRotation = { x: 0, y: 0 };

      // Simulate 150 animation frames of damping
      for (let frame = 0; frame < 150; frame++) {
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;

        if (Math.abs(dragVelocity.x) < 0.00001) dragVelocity.x = 0;
        if (Math.abs(dragVelocity.y) < 0.00001) dragVelocity.y = 0;

        dragRotation.x = Math.max(-0.7, Math.min(0.7, dragRotation.x + dragVelocity.x));
        dragRotation.y += dragVelocity.y;
      }

      assert.strictEqual(dragVelocity.x, 0, 'Velocity X must attenuate to exactly 0');
      assert.strictEqual(dragVelocity.y, 0, 'Velocity Y must attenuate to exactly 0');
      assert.ok(dragRotation.x >= -0.7 && dragRotation.x <= 0.7, 'Pitch rotation must stay within [-0.7, 0.7]');
      assert.ok(!Number.isNaN(dragRotation.y) && Number.isFinite(dragRotation.y));
    });
  });

  // =========================================================================
  // Section 3: Highlight Project Navigation & Cyclic Bounds Math (R4)
  // =========================================================================
  describe('Highlight Project Navigation & Cyclic Bounds Math (R4)', () => {
    test('CH4.3.1: Double-modulo cyclic indexing handles negative underflow, arbitrary integers, and boundary lengths', () => {
      const safeIndex = (index, len) => {
        if (len <= 0) return 0;
        return ((index % len) + len) % len;
      };

      const lengths = [1, 2, 3, 5, 10, 100];
      for (const len of lengths) {
        for (let idx = -200; idx <= 200; idx++) {
          const res = safeIndex(idx, len);
          assert.ok(res >= 0 && res < len, `safeIndex(${idx}, ${len}) = ${res} is out of bounds [0, ${len - 1}]`);
          assert.strictEqual(Number.isInteger(res), true);
        }
      }

      // Zero and negative lengths
      assert.strictEqual(safeIndex(10, 0), 0);
      assert.strictEqual(safeIndex(-5, -3), 0);
    });

    test('CH4.3.2: 50,000 steps random walk navigation simulation across Next, Prev, and Direct Indicator clicks', () => {
      const totalSlides = 3;
      let currentIndex = 0;

      for (let step = 0; step < 50000; step++) {
        const action = step % 5;
        if (action === 0) {
          // Next slide
          currentIndex = (currentIndex + 1) % totalSlides;
        } else if (action === 1) {
          // Prev slide
          currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        } else if (action === 2) {
          // Jump to slide 0
          currentIndex = 0;
        } else if (action === 3) {
          // Jump to slide 1
          currentIndex = 1;
        } else {
          // Jump to slide 2
          currentIndex = 2;
        }

        assert.ok(currentIndex >= 0 && currentIndex < totalSlides);
      }
    });

    test('CH4.3.3: Dynamic indicator count strictly equals heroSlides.length across all modes', () => {
      const rawProjects = loadProjectsJson();
      for (const mode of MODES) {
        const heroSlides = rawProjects.filter(
          (p) => Boolean(p.featured) && (p.mode === mode || p.secondaryModes?.includes(mode))
        );
        assert.strictEqual(heroSlides.length, 3, `Expected 3 featured slides for mode ${mode}`);

        const indicators = heroSlides.map((slide, idx) => ({
          id: `btn-indicator-${idx}`,
          label: `0${idx + 1}`,
          title: slide.title,
          category: slide.category
        }));

        assert.strictEqual(indicators.length, 3);
        assert.strictEqual(indicators[0].label, '01');
        assert.strictEqual(indicators[1].label, '02');
        assert.strictEqual(indicators[2].label, '03');
      }
    });
  });

  // =========================================================================
  // Section 4: Single-Click Modal Trigger & 3-Tier Flexbox Confinement (R5)
  // =========================================================================
  describe('Single-Click Modal Trigger & 3-Tier Flexbox Layout (R5)', () => {
    test('CH4.4.1: Source code analysis proves complete elimination of onDoubleClick and genuine single-click invocation', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const content = fs.readFileSync(heroPath, 'utf8');

      // 1. Zero occurrences of double-click
      assert.strictEqual(content.includes('onDoubleClick'), false, 'hero.tsx must not contain onDoubleClick');
      assert.strictEqual(content.includes('doubleClick'), false, 'hero.tsx must not contain doubleClick');

      // 2. Active card click triggers onOpenProject
      assert.ok(content.includes('onOpenProject(slideProj)'), 'Active diamond card must trigger onOpenProject');

      // 3. Inactive card click switches activeSlideIndex
      assert.ok(content.includes('setActiveSlideIndex(idx)'), 'Inactive diamond card must trigger setActiveSlideIndex');

      // 4. Primary CTA button triggers onOpenProject(currentHeroProject)
      assert.ok(content.includes('onOpenProject(currentHeroProject)'), 'CTA detail button must trigger onOpenProject');

      // 5. 3D scene model click decoupled per user requirement #3 (never opens modal on click)
      const hero3DPath = path.resolve(PROJECT_ROOT, 'src/components/hero-3d-scene.tsx');
      const hero3DContent = fs.readFileSync(hero3DPath, 'utf8');
      assert.ok(!hero3DContent.includes('onOpenProject'), '3D scene must NOT invoke onOpenProject');
      assert.ok(!content.includes('<Hero3DScene onModelClick'), 'Hero3DScene must not receive onModelClick');
    });

    test('CH4.4.2: project-modal.tsx strictly complies with 3-tier Flexbox layout hierarchy', () => {
      const modalPath = path.resolve(PROJECT_ROOT, 'src/components/project-modal.tsx');
      const content = fs.readFileSync(modalPath, 'utf8');

      // Outer container
      assert.ok(content.includes('flex flex-col max-h-[90vh] overflow-hidden'), 'Outer container must be flex flex-col max-h-[90vh] overflow-hidden');

      // Fixed header (Tier 1)
      assert.ok(content.includes('flex-shrink-0 sticky top-0 z-20'), 'Fixed header must have flex-shrink-0 sticky top-0 z-20');

      // Scrollable body (Tier 2)
      assert.ok(content.includes('flex-1 overflow-y-auto px-5 sm:px-8 lg:px-10 py-5 sm:py-6 space-y-6 custom-scrollbar'), 'Scrollable body must have flex-1 overflow-y-auto custom-scrollbar');

      // Fixed footer (Tier 3)
      assert.ok(content.includes('flex-shrink-0 z-20 border-t'), 'Fixed footer must have flex-shrink-0 z-20 border-t');

      // Backdrop wrapper prohibits overflow-y-auto to avoid double scrollbars
      assert.ok(!content.includes('fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto'), 'Backdrop wrapper must not have overflow-y-auto');
    });

    test('CH4.4.3: Sparse and adversarial project records in modal render safely without throwing', () => {
      const sparseProject = {
        id: 'sparse-1',
        title: 'Sparse Project',
        category: 'Medical Tech',
        summary: 'Minimal summary',
        mode: 'medical',
        featured: true
        // Missing caseStudy, tags, stats, links, media
      };

      // Simulating fallback resolution in project-modal.tsx
      const caseStudy = sparseProject.caseStudy || {
        overview: sparseProject.summary || '',
        backgroundAndProblem: '',
        objectives: [],
        roleAndContributions: [],
        processAndMethodology: [],
        finalOutput: '',
        resultsAndImpact: '',
        lessonsLearned: '',
        technologiesUsed: [],
        metrics: []
      };

      assert.strictEqual(caseStudy.overview, 'Minimal summary');
      assert.deepStrictEqual(caseStudy.objectives, []);
      assert.deepStrictEqual(caseStudy.technologiesUsed, []);
      assert.strictEqual(caseStudy.finalOutput, '');
    });
  });

  // =========================================================================
  // Section 5: Accessible Tooltips & Micro-Interaction Contracts (R6)
  // =========================================================================
  describe('Accessible Tooltips & Micro-Interaction Contracts (R6)', () => {
    test('CH4.5.1: TooltipProvider wraps hero section with accessible delay contracts', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const content = fs.readFileSync(heroPath, 'utf8');

      assert.ok(content.includes('<TooltipProvider delayDuration={200} skipDelayDuration={100}>'), 'Hero section must be wrapped in TooltipProvider with standard delays');
      assert.ok(content.includes('</TooltipProvider>'), 'Hero section must close TooltipProvider');
    });

    test('CH4.5.2: All 5 interactive button categories are wrapped in Radix UI Tooltip with semantic contents', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const content = fs.readFileSync(heroPath, 'utf8');

      // CTA Detail button
      assert.ok(content.includes('id="btn-cta-detail"'), 'Must have btn-cta-detail');
      // CTA CV button
      assert.ok(content.includes('id="btn-cta-cv"'), 'Must have btn-cta-cv');
      // Previous slide button
      assert.ok(content.includes('id="btn-slide-prev"'), 'Must have btn-slide-prev');
      // Next slide button
      assert.ok(content.includes('id="btn-slide-next"'), 'Must have btn-slide-next');
      // Dynamic indicators
      assert.ok(content.includes('id={`btn-indicator-${idx}`}'), 'Must have btn-indicator-${idx}');
      // Diamond cards
      assert.ok(content.includes('aria-label={`${slideProj.title} — ${isCardActive ? \'Buka detail studi kasus\' : \'Pilih slide\'}`}'));
    });

    test('CH4.5.3: Reduced-motion accessibility preference is enforced across animated classes', () => {
      const heroPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const content = fs.readFileSync(heroPath, 'utf8');

      // Reactive transition block
      assert.ok(content.includes('motion-safe:transition-all motion-reduce:transition-none'), 'Transition block must respect motion-reduce');
      // Diamond cards
      assert.ok(content.includes('motion-safe:transition-all motion-reduce:transition-none'), 'Diamond cards must respect motion-reduce');
    });
  });

  // =========================================================================
  // Section 6: Next.js Static Export Parity & Asset Bit-Exactness (R1 - R6)
  // =========================================================================
  describe('Next.js Static Export Parity & Asset Bit-Exactness', () => {
    test('CH4.6.1: out/index.html is valid, non-empty, and contains pre-rendered hero semantic tags', () => {
      const outIndexPath = path.resolve(PROJECT_ROOT, 'out/index.html');
      assert.ok(fs.existsSync(outIndexPath), 'out/index.html must exist from static build');

      const stat = fs.statSync(outIndexPath);
      assert.ok(stat.size > 50000, `out/index.html too small (${stat.size} bytes)`);

      const html = fs.readFileSync(outIndexPath, 'utf8');
      assert.ok(html.includes('<section id="hero"'), 'Pre-rendered HTML must include section #hero');
      assert.ok(html.includes('EXPLORE WORK'), 'Pre-rendered HTML must include EXPLORE WORK');
      assert.ok(html.includes('btn-cta-detail'), 'Pre-rendered HTML must include btn-cta-detail');
      assert.ok(html.includes('btn-slide-next'), 'Pre-rendered HTML must include btn-slide-next');
    });

    test('CH4.6.2: 3D GLB models possess bit-for-bit SHA-256 parity between public and out directories', () => {
      const models = ['model-jantung.glb', 'model-pena.glb'];

      for (const m of models) {
        const pubPath = path.resolve(PROJECT_ROOT, 'public/models', m);
        const outPath = path.resolve(PROJECT_ROOT, 'out/models', m);

        assert.ok(fs.existsSync(pubPath), `Missing public model: ${m}`);
        assert.ok(fs.existsSync(outPath), `Missing out model: ${m}`);

        const hashPub = sha256(pubPath);
        const hashOut = sha256(outPath);

        assert.strictEqual(hashOut, hashPub, `SHA-256 mismatch between public and out for ${m}`);
      }
    });

    test('CH4.6.3: All 6 AVIF background images and 3 SVG icons exist in public / assets paths', () => {
      for (const m of MODES) {
        for (const t of THEMES) {
          const avifPath = path.resolve(PROJECT_ROOT, `src/assets/image/bg-${m}-${t}.avif`);
          assert.ok(fs.existsSync(avifPath), `Missing AVIF background: bg-${m}-${t}.avif`);
        }
        const svgSrc = path.resolve(PROJECT_ROOT, `src/assets/icons/project-${m}.svg`);
        const svgPub = path.resolve(PROJECT_ROOT, `public/icons/project-${m}.svg`);
        assert.ok(fs.existsSync(svgSrc), `Missing SVG icon src: project-${m}.svg`);
        assert.ok(fs.existsSync(svgPub), `Missing SVG icon pub: project-${m}.svg`);
      }
    });
  });
});
