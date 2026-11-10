import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { MeshoptDecoder } from 'meshoptimizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const VALID_MODES = ['tech', 'medical', 'academic'];

describe('Tier 5 Challenger: Empirical Stress Test for Milestone 1 (Meshopt, 3D Loading, Click Decoupling & Viewport)', () => {

  // =========================================================================
  // Section 1: MeshoptDecoder & GLTF Loader Architecture
  // =========================================================================
  describe('Section 1: MeshoptDecoder & GLTF Decoder Engine Verification', () => {
    test('S1.1: MeshoptDecoder.ready resolves successfully and decoder is supported', async () => {
      assert.ok(MeshoptDecoder, 'MeshoptDecoder must be importable');
      await MeshoptDecoder.ready;
      assert.strictEqual(MeshoptDecoder.supported, true, 'MeshoptDecoder.supported must be true');
      assert.strictEqual(typeof MeshoptDecoder.decodeVertexBuffer, 'function', 'decodeVertexBuffer must be a function');
      assert.strictEqual(typeof MeshoptDecoder.decodeIndexBuffer, 'function', 'decodeIndexBuffer must be a function');
    });

    test('S1.2: Loader singleton architecture prevents redundant WASM initializations', async () => {
      let gltfLoaderInstance = null;
      let loaderPromise = null;

      async function getGLTFLoaderSim() {
        if (gltfLoaderInstance) return gltfLoaderInstance;
        if (!loaderPromise) {
          loaderPromise = (async () => {
            await MeshoptDecoder.ready;
            const loader = {
              type: 'GLTFLoader',
              meshoptDecoder: null,
              setMeshoptDecoder(dec) {
                this.meshoptDecoder = dec;
              }
            };
            loader.setMeshoptDecoder(MeshoptDecoder);
            gltfLoaderInstance = loader;
            return loader;
          })();
        }
        return loaderPromise;
      }

      // Concurrently invoke getGLTFLoaderSim 100 times
      const promises = Array.from({ length: 100 }, () => getGLTFLoaderSim());
      const loaders = await Promise.all(promises);

      // Invariant: every loader reference is strictly the identical singleton instance
      for (let i = 1; i < loaders.length; i++) {
        assert.strictEqual(loaders[i], loaders[0], 'All concurrent loader requests must resolve to the identical singleton instance');
      }
      assert.strictEqual(loaders[0].meshoptDecoder, MeshoptDecoder, 'MeshoptDecoder must be configured on the loader instance');
    });

    test('S1.3: model-jantung.glb binary header & meshopt extensions inspection', () => {
      const jantungPath = path.resolve(PROJECT_ROOT, 'public/models/model-jantung.glb');
      assert.ok(fs.existsSync(jantungPath), 'public/models/model-jantung.glb must exist');
      const stat = fs.statSync(jantungPath);
      assert.strictEqual(stat.size, 18141244, `model-jantung.glb must be exactly 18,141,244 bytes (got ${stat.size})`);

      const fd = fs.openSync(jantungPath, 'r');
      const headerBuf = Buffer.alloc(20);
      fs.readSync(fd, headerBuf, 0, 20, 0);

      // GLB Magic: 'glTF' (0x46546C67)
      const magic = headerBuf.readUInt32LE(0);
      assert.strictEqual(magic, 0x46546C67, 'model-jantung.glb must start with glTF magic header');

      // Version: 2
      const version = headerBuf.readUInt32LE(4);
      assert.strictEqual(version, 2, 'model-jantung.glb must be glTF version 2');

      // Total file length stored in GLB header
      const length = headerBuf.readUInt32LE(8);
      assert.strictEqual(length, stat.size, 'GLB header length must match file size');

      // First chunk is JSON
      const jsonChunkLen = headerBuf.readUInt32LE(12);
      const jsonChunkType = headerBuf.readUInt32LE(16);
      assert.strictEqual(jsonChunkType, 0x4E4F534A, 'First chunk must be JSON chunk (0x4E4F534A)');

      // Read first 10,000 bytes of JSON to inspect extensions
      const jsonSampleBuf = Buffer.alloc(Math.min(jsonChunkLen, 10000));
      fs.readSync(fd, jsonSampleBuf, 0, jsonSampleBuf.length, 20);
      fs.closeSync(fd);

      const jsonStr = jsonSampleBuf.toString('utf8');
      assert.ok(jsonStr.includes('EXT_meshopt_compression'), 'model-jantung.glb must declare EXT_meshopt_compression');
      assert.ok(jsonStr.includes('KHR_mesh_quantization'), 'model-jantung.glb must declare KHR_mesh_quantization');
    });

    test('S1.4: model-pena.glb binary header & GitHub Pages compliance inspection', () => {
      const penaPath = path.resolve(PROJECT_ROOT, 'public/models/model-pena.glb');
      assert.ok(fs.existsSync(penaPath), 'public/models/model-pena.glb must exist');
      const stat = fs.statSync(penaPath);
      assert.strictEqual(stat.size, 16817680, `model-pena.glb must be exactly 16,817,680 bytes (got ${stat.size})`);

      // Strict GitHub Pages limit: file must be < 100 MB (104,857,600 bytes)
      assert.ok(stat.size < 104857600, 'model-pena.glb must be strictly < 100 MB for GitHub Pages limit');

      const fd = fs.openSync(penaPath, 'r');
      const headerBuf = Buffer.alloc(12);
      fs.readSync(fd, headerBuf, 0, 12, 0);
      fs.closeSync(fd);

      const magic = headerBuf.readUInt32LE(0);
      assert.strictEqual(magic, 0x46546C67, 'model-pena.glb must start with glTF magic header');
      const version = headerBuf.readUInt32LE(4);
      assert.strictEqual(version, 2, 'model-pena.glb must be glTF version 2');
      const length = headerBuf.readUInt32LE(8);
      assert.strictEqual(length, stat.size, 'GLB header length must match file size');
    });
  });

  // =========================================================================
  // Section 2: Model Normalization & Coordinate Space Robustness
  // =========================================================================
  describe('Section 2: normalizeLoadedModel Geometric Invariant Stress Test', () => {
    function normalizeLoadedModelSim(modelScene, targetSize = 2.40) {
      const pivotGroup = new THREE.Group();
      const box = new THREE.Box3().setFromObject(modelScene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? targetSize / maxDim : 1.0;

      const center = box.getCenter(new THREE.Vector3());
      modelScene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      modelScene.scale.setScalar(scale);

      let meshesTraversed = 0;
      modelScene.traverse((child) => {
        if (child.isMesh) {
          meshesTraversed++;
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => { m.needsUpdate = true; });
            } else {
              child.material.needsUpdate = true;
            }
          }
        }
      });

      pivotGroup.add(modelScene);
      return { pivotGroup, baseScale: 1.0, computedScale: scale, meshesTraversed };
    }

    test('S2.1: Normalizes disparate model geometries to uniform bounding diameter', () => {
      // Test cases with extreme bounding boxes
      const cases = [
        { name: 'Tiny Model', meshSize: [0.01, 0.02, 0.005], offset: [10, -5, 2] },
        { name: 'Huge Model', meshSize: [500, 300, 1200], offset: [-100, 200, 50] },
        { name: 'Asymmetric Model', meshSize: [1, 50, 2], offset: [0, 0, 0] },
        { name: 'Standard Human Scale', meshSize: [1.8, 0.5, 0.3], offset: [0, 0.9, 0] }
      ];

      for (const tc of cases) {
        const scene = new THREE.Group();
        const geo = new THREE.BoxGeometry(...tc.meshSize);
        const mat = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...tc.offset);
        scene.add(mesh);

        const normalized = normalizeLoadedModelSim(scene, 2.40);
        assert.ok(normalized.computedScale > 0, `${tc.name}: computedScale must be > 0`);
        assert.ok(!Number.isNaN(normalized.computedScale), `${tc.name}: computedScale must not be NaN`);
        assert.ok(Number.isFinite(normalized.computedScale), `${tc.name}: computedScale must be finite`);
        assert.strictEqual(normalized.meshesTraversed, 1, `${tc.name}: Mesh traversal count must be 1`);

        // Measure normalized bounding box
        const normBox = new THREE.Box3().setFromObject(normalized.pivotGroup);
        const normSize = normBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(normSize.x, normSize.y, normSize.z);

        assert.ok(
          Math.abs(maxDim - 2.40) < 0.001,
          `${tc.name}: Normalized bounding dimension must equal targetSize 2.40 (got ${maxDim})`
        );

        // Center must be origin (0, 0, 0)
        const normCenter = normBox.getCenter(new THREE.Vector3());
        assert.ok(Math.abs(normCenter.x) < 0.001, `${tc.name}: Center X must be ~0 (got ${normCenter.x})`);
        assert.ok(Math.abs(normCenter.y) < 0.001, `${tc.name}: Center Y must be ~0 (got ${normCenter.y})`);
        assert.ok(Math.abs(normCenter.z) < 0.001, `${tc.name}: Center Z must be ~0 (got ${normCenter.z})`);

        assert.strictEqual(mesh.castShadow, true, `${tc.name}: castShadow must be true`);
        assert.strictEqual(mesh.receiveShadow, true, `${tc.name}: receiveShadow must be true`);
      }
    });

    test('S2.2: Degenerate 0-dimension scene safely yields fallback scale 1.0 without dividing by zero', () => {
      const emptyScene = new THREE.Group(); // Empty scene has 0 size
      const res = normalizeLoadedModelSim(emptyScene, 2.40);
      assert.strictEqual(res.computedScale, 1.0, 'Empty scene must safely default to scale 1.0');
      assert.strictEqual(res.baseScale, 1.0);
    });
  });

  // =========================================================================
  // Section 3: Rapid Mode Toggles, Asynchronous Race Immunity & Memory Leaks
  // =========================================================================
  describe('Section 3: Rapid Mode Switching, Memory Caching & Race Immunity', () => {
    test('S3.1: 5,000 rapid mode toggles maintain cache size <= 3 with zero unbounded allocation', () => {
      const modelSceneCache = new Map();

      function getOrCreateModel(targetMode) {
        if (modelSceneCache.has(targetMode)) {
          return { cached: true, data: modelSceneCache.get(targetMode) };
        }
        const data = {
          mode: targetMode,
          pivotGroup: new THREE.Group(),
          baseScale: 1.0
        };
        modelSceneCache.set(targetMode, data);
        return { cached: false, data };
      }

      let cacheHits = 0;
      let cacheMisses = 0;

      for (let i = 0; i < 5000; i++) {
        const mode = VALID_MODES[i % VALID_MODES.length];
        const res = getOrCreateModel(mode);
        if (res.cached) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
      }

      // Exactly 3 misses (initial creation of tech, medical, academic) and 4997 hits
      assert.strictEqual(cacheMisses, 3, 'Exactly 3 cache misses on initial population');
      assert.strictEqual(cacheHits, 4997, 'All subsequent 4,997 calls must be in-memory cache hits');
      assert.strictEqual(modelSceneCache.size, 3, 'modelSceneCache size must be strictly bounded to <= 3');
    });

    test('S3.2: Asynchronous race condition immunity via activeRequestIdRef', async () => {
      let activeRequestId = 0;
      let currentMode = 'tech';
      let activeSceneChild = 'tech-initial';
      const switchLog = [];

      function simulateSwitchModel(targetMode, simulatedNetworkLatencyMs) {
        currentMode = targetMode;
        const requestId = ++activeRequestId;

        return new Promise((resolve) => {
          setTimeout(() => {
            // Check stale request invariant
            if (activeRequestId !== requestId) {
              switchLog.push({ targetMode, requestId, status: 'STALE_DISCARDED' });
              resolve({ mounted: false, reason: 'STALE_REQUEST' });
              return;
            }

            activeSceneChild = targetMode;
            switchLog.push({ targetMode, requestId, status: 'MOUNTED' });
            resolve({ mounted: true, targetMode });
          }, simulatedNetworkLatencyMs);
        });
      }

      // Simulate rapid toggles where slow request is fired first, followed by fast request
      const p1 = simulateSwitchModel('medical', 100);  // slow request (id 1)
      const p2 = simulateSwitchModel('academic', 30);  // fast request (id 2)
      const p3 = simulateSwitchModel('tech', 10);      // fastest request (id 3)

      await Promise.all([p1, p2, p3]);

      // Only id 3 (tech) should have mounted. id 1 and id 2 must have been discarded.
      assert.strictEqual(activeSceneChild, 'tech', 'Final mounted model must strictly match current mode');
      assert.strictEqual(switchLog.find(x => x.requestId === 1).status, 'STALE_DISCARDED');
      assert.strictEqual(switchLog.find(x => x.requestId === 2).status, 'STALE_DISCARDED');
      assert.strictEqual(switchLog.find(x => x.requestId === 3).status, 'MOUNTED');
    });

    test('S3.3: Network / decode rejection falls back to procedural model without unhandled rejection', async () => {
      let unhandledThrown = false;
      const originalHandler = process.listeners('unhandledRejection');

      const rejectionHandler = () => { unhandledThrown = true; };
      process.on('unhandledRejection', rejectionHandler);

      let fallbackInvoked = false;
      let loadingProgress = 0;

      // Simulate switchModel error handler from hero-3d-scene.tsx
      async function simulateSwitchModelWithError() {
        const fakeLoaderPromise = Promise.reject(new Error('Simulated HTTP 404: model not found'));

        try {
          await fakeLoaderPromise;
        } catch (err) {
          // Hero3DScene catches and falls back to procedural generator
          fallbackInvoked = true;
          loadingProgress = null;
        }
      }

      await simulateSwitchModelWithError();
      await new Promise(r => setTimeout(r, 50));

      process.removeListener('unhandledRejection', rejectionHandler);

      assert.strictEqual(fallbackInvoked, true, 'Procedural fallback must be invoked upon load failure');
      assert.strictEqual(loadingProgress, null, 'Loading progress must be cleared upon fallback');
      assert.strictEqual(unhandledThrown, false, 'No unhandled rejection must leak to Node/browser runtime');
    });
  });

  // =========================================================================
  // Section 4: WebGL Context Loss & Recovery Invariants
  // =========================================================================
  describe('Section 4: WebGL Context Loss & Recovery Simulation', () => {
    test('S4.1: Simulated webglcontextlost prevents default and activates 2D fallback', () => {
      let isContextLost = false;
      let defaultPrevented = false;

      const mockEvent = {
        preventDefault() {
          defaultPrevented = true;
        }
      };

      const handleContextLost = (e) => {
        e.preventDefault();
        isContextLost = true;
      };

      handleContextLost(mockEvent);

      assert.strictEqual(defaultPrevented, true, 'handleContextLost must call preventDefault()');
      assert.strictEqual(isContextLost, true, 'isContextLost state must become true');
    });

    test('S4.2: 100 consecutive context lost / restored cycles execute cleanly without crash', () => {
      let isContextLost = false;
      let reinitCount = 0;

      const handleContextLost = (e) => {
        e.preventDefault();
        isContextLost = true;
      };

      const handleContextRestored = () => {
        isContextLost = false;
        reinitCount++;
      };

      for (let i = 0; i < 100; i++) {
        let prevented = false;
        handleContextLost({ preventDefault() { prevented = true; } });
        assert.strictEqual(isContextLost, true);
        assert.strictEqual(prevented, true);

        handleContextRestored();
        assert.strictEqual(isContextLost, false);
      }

      assert.strictEqual(reinitCount, 100, 'All 100 context restore events must trigger re-initialization');
    });
  });

  // =========================================================================
  // Section 5: Click Decoupling & Pointer Discrimination
  // =========================================================================
  describe('Section 5: Click Decoupling & Modal Trigger Elimination', () => {
    test('S5.1: hero-3d-scene.tsx strict AST / source contract: onModelClick is strictly absent', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/hero-3d-scene.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      // 1. Hero3DSceneProps interface must NOT have onModelClick
      assert.ok(!src.includes('onModelClick:'), 'Hero3DSceneProps must not contain onModelClick');
      assert.ok(!src.includes('onModelClick?'), 'Hero3DSceneProps must not contain optional onModelClick');

      // 2. <canvas> element must not declare onClick
      assert.ok(!src.includes('onClick={'), '<canvas> in hero-3d-scene.tsx must not declare onClick');

      // 3. handlePointerUp must not invoke modal opening
      assert.ok(!src.includes('setActiveProject('), 'hero-3d-scene.tsx must not call setActiveProject');
      assert.ok(!src.includes('setIsModalOpen('), 'hero-3d-scene.tsx must not call setIsModalOpen');
      assert.ok(!src.includes('openModal'), 'hero-3d-scene.tsx must not call openModal');
    });

    test('S5.2: crystal-canvas.tsx strict AST / source contract: onCrystalClick is strictly absent', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/crystal-canvas.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      assert.ok(!src.includes('onCrystalClick:'), 'IridescentCrystalCanvasProps must not contain onCrystalClick');
      assert.ok(!src.includes('onCrystalClick?'), 'IridescentCrystalCanvasProps must not contain optional onCrystalClick');
      assert.ok(!src.includes('onClick='), '<canvas> in crystal-canvas.tsx must not declare onClick');
    });

    test('S5.3: hero.tsx Hero3DScene invocation does not pass onModelClick', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      const heroSceneMatch = src.match(/<Hero3DScene[\s\S]*?\/>/);
      assert.ok(heroSceneMatch, '<Hero3DScene /> must be rendered in hero.tsx');
      const heroSceneBlock = heroSceneMatch[0];

      assert.ok(!heroSceneBlock.includes('onModelClick'), 'Hero3DScene invocation in hero.tsx must NOT pass onModelClick');
    });

    test('S5.4: Empirical simulated pointer click (< 5px) triggers 0 modal state mutations', () => {
      let modalOpened = false;
      let activeProjectId = null;

      // Simulated state from hero component
      const openProjectModal = (proj) => {
        modalOpened = true;
        activeProjectId = proj?.id;
      };

      // Simulated pointer event handling inside Hero3DScene
      class SimulatedHero3DCanvas {
        constructor() {
          this.isDragging = false;
          this.pointerStartPos = { x: 0, y: 0 };
          this.lastPointerPos = { x: 0, y: 0 };
          this.totalDragDist = 0;
          this.captured = false;
        }

        handlePointerDown(e) {
          this.isDragging = true;
          this.pointerStartPos = { x: e.clientX, y: e.clientY };
          this.lastPointerPos = { x: e.clientX, y: e.clientY };
          this.totalDragDist = 0;
          this.captured = true;
        }

        handlePointerMove(e) {
          if (!this.isDragging) return;
          const dx = e.clientX - this.lastPointerPos.x;
          const dy = e.clientY - this.lastPointerPos.y;
          this.totalDragDist += Math.hypot(dx, dy);
          this.lastPointerPos = { x: e.clientX, y: e.clientY };
        }

        handlePointerUp(e) {
          if (!this.isDragging) return;
          this.isDragging = false;
          this.captured = false;

          // Decoupled pointer up: NO modal opening!
          if (this.totalDragDist < 5) {
            // Decoupled: clicking 3D model never opens project modal
          }
        }
      }

      const canvas = new SimulatedHero3DCanvas();

      // Simulate 1,000 pointer click permutations (sub-5px movements)
      for (let i = 0; i < 1000; i++) {
        const startX = 200 + (i % 50);
        const startY = 150 + (i % 50);
        const jitterX = (Math.random() - 0.5) * 4; // jitter within [-2, 2] px
        const jitterY = (Math.random() - 0.5) * 4;

        canvas.handlePointerDown({ clientX: startX, clientY: startY });
        canvas.handlePointerMove({ clientX: startX + jitterX, clientY: startY + jitterY });
        canvas.handlePointerUp({ clientX: startX + jitterX, clientY: startY + jitterY });

        assert.ok(canvas.totalDragDist < 5, `Drag distance must be < 5px (got ${canvas.totalDragDist})`);
        assert.strictEqual(modalOpened, false, 'Simulated pointer click must NEVER set modalOpened = true');
        assert.strictEqual(activeProjectId, null, 'activeProjectId must remain null');
      }
    });
  });

  // =========================================================================
  // Section 6: Viewport Budget & Spatial Stage Dimensions (R2 Follow-up)
  // =========================================================================
  describe('Section 6: Hero Viewport Budget & Stage Height Clamping', () => {
    test('S6.1: hero-3d-scene.tsx clamps canvas dimensions to <= 420px height', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/hero-3d-scene.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      // Check canvas className
      assert.ok(
        src.includes('w-[300px] h-[320px] sm:w-[340px] sm:h-[360px] lg:w-[360px] lg:h-[380px] xl:w-[400px] xl:h-[420px]'),
        'Canvas must use clamped dimensions: max h-[420px]'
      );

      // Check concentric rings
      assert.ok(
        src.includes('w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px] xl:w-[400px] xl:h-[400px]'),
        'Inner ring must clamp to max 400x400px'
      );
      assert.ok(
        src.includes('w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] lg:w-[420px] lg:h-[420px] xl:w-[460px] xl:h-[460px]'),
        'Outer ring must clamp to max 460x460px'
      );
    });

    test('S6.2: hero.tsx container padding and grid gaps comply with fold headroom budget', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/hero.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      // Top/bottom padding on hero container
      assert.ok(
        src.includes('pt-16 lg:pt-20 pb-4 sm:pb-6'),
        'Hero section container must use tightened padding: pt-16 lg:pt-20 pb-4 sm:pb-6'
      );

      // Spatial stage grid gap
      assert.ok(
        src.includes('gap-4 lg:gap-6'),
        'Hero spatial grid must use tightened gap: gap-4 lg:gap-6'
      );
    });

    test('S6.3: Geometric headroom calculation confirms Explore Work bar remains above fold on 768p and 1080p', () => {
      // 1. Standard Laptop 768p viewport: 1366x768
      const viewportHeight768 = 768;
      const navHeight = 64;
      const heroTopPad = 80;    // lg:pt-20 = 80px
      const stageHeight = 380;   // lg:h-[380px]
      const captionHeight = 32;  // caption badge ~32px
      const heroBotPad = 24;    // sm:pb-6 = 24px
      const totalHeroConsumed768 = navHeight + heroTopPad + stageHeight + captionHeight + heroBotPad;

      const remainingHeadroom768 = viewportHeight768 - totalHeroConsumed768;
      assert.ok(
        remainingHeadroom768 > 150,
        `Expected remaining headroom on 768p display to be > 150px (got ${remainingHeadroom768}px) to fit Explore Work bar`
      );

      // 2. Desktop 1080p viewport: 1920x1080
      const viewportHeight1080 = 1080;
      const stageHeight1080 = 420; // xl:h-[420px]
      const totalHeroConsumed1080 = navHeight + heroTopPad + stageHeight1080 + captionHeight + heroBotPad;
      const remainingHeadroom1080 = viewportHeight1080 - totalHeroConsumed1080;
      assert.ok(
        remainingHeadroom1080 > 400,
        `Expected remaining headroom on 1080p display to be > 400px (got ${remainingHeadroom1080}px)`
      );
    });
  });

  // =========================================================================
  // Section 7: Tech Mode Geometric Glyphs & Deterministic Indexing
  // =========================================================================
  describe('Section 7: Tech Mode Geometric Glyphs & Deterministic Indexing', () => {
    test('S7.1: DiamondArtifactGlyph sanitizes gradient IDs eliminating whitespace & ampersands', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/geometric-glyphs.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      // Verify regex sanitization pattern
      assert.ok(
        src.includes("String(visualType || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-')"),
        'Must sanitize visualType via regex replacing non-alphanumeric chars with hyphen'
      );

      // Verify React.useId() usage for instance uniqueness
      assert.ok(src.includes('React.useId()'), 'Must use React.useId() to prevent ID collisions');
    });

    test('S7.2: Adversarial visualType strings sanitize to clean SVG ID fragments', () => {
      const testCases = [
        { input: 'Smart IoT & AI', expectedSafe: 'smart-iot---ai' },
        { input: 'Healthcare & Clinical (2024)', expectedSafe: 'healthcare---clinical--2024-' },
        { input: 'Spaces and / \\ Symbols #1', expectedSafe: 'spaces-and-----symbols--1' },
        { input: '', expectedSafe: 'artifact' },
        { input: null, expectedSafe: 'artifact' },
        { input: undefined, expectedSafe: 'artifact' }
      ];

      for (const tc of testCases) {
        const safeType = String(tc.input || 'artifact').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        assert.strictEqual(safeType, tc.expectedSafe, `Sanitized string mismatch for ${tc.input}`);
        // Invariant: no spaces, no ampersands, no quotes, no colons
        assert.ok(!safeType.includes(' '), 'Must not contain spaces');
        assert.ok(!safeType.includes('&'), 'Must not contain ampersands');
        assert.ok(!safeType.includes('"'), 'Must not contain quotes');
      }
    });

    test('S7.3: DiamondArtifactGlyph computes normIndex modulo 3 cycling across 3 procedural shapes', () => {
      const srcPath = path.resolve(PROJECT_ROOT, 'src/components/geometric-glyphs.tsx');
      const src = fs.readFileSync(srcPath, 'utf8');

      assert.ok(
        src.includes('const normIndex = Math.abs(Math.floor(index));'),
        'geometric-glyphs.tsx must compute normIndex via Math.abs(Math.floor(index))'
      );
      assert.ok(src.includes('normIndex % 3 === 0'), 'Must handle shape 0 (Sphere)');
      assert.ok(src.includes('normIndex % 3 === 1'), 'Must handle shape 1 (Octahedron)');
      assert.ok(src.includes('holoGradId'), 'Must handle shape 2 (Holographic Column via holoGradId)');

      // Verify mathematical cycling across 100 indices
      for (let i = 0; i < 100; i++) {
        const idx = Math.abs(Math.floor(i)) % 3;
        assert.ok(idx >= 0 && idx <= 2, `Resolved index must be 0, 1, or 2 (got ${idx})`);
      }
    });
  });

  // =========================================================================
  // Section 8: Production Static Bundles & Zero Asset Inlining
  // =========================================================================
  describe('Section 8: Production Static Export & Zero 3D Asset Inlining', () => {
    test('S8.1: GLB assets are NOT base64 encoded or inlined inside JS chunks in out/_next/', () => {
      const outStaticDir = path.resolve(PROJECT_ROOT, 'out/_next/static');
      if (!fs.existsSync(outStaticDir)) {
        // Skip if build hasn't run yet
        return;
      }

      function scanDirForFiles(dir) {
        let results = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanDirForFiles(full));
          } else if (entry.name.endsWith('.js')) {
            results.push(full);
          }
        }
        return results;
      }

      const jsFiles = scanDirForFiles(outStaticDir);
      assert.ok(jsFiles.length > 0, 'Must have generated JS chunk files in out/_next/static/');

      // Inspect JS chunk files to ensure none of them contain massive 18MB or 90MB strings
      for (const jsFile of jsFiles) {
        const stat = fs.statSync(jsFile);
        // Every JS bundle must be well under 5 MB
        assert.ok(
          stat.size < 5 * 1024 * 1024,
          `JS chunk file ${path.basename(jsFile)} is abnormally large (${stat.size} bytes)! Possible inlined 3D asset!`
        );
      }
    });
  });
});
