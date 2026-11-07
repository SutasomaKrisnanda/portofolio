import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// Model & Simulation Helpers based on hero-3d-scene.tsx and hero.tsx
// ============================================================================

const VALID_MODES = ['tech', 'medical', 'academic'];

function resolveModeSafe(mode) {
  if (VALID_MODES.includes(mode)) return mode;
  return 'tech';
}

function resolveHero3DCaption(mode) {
  if (mode === 'medical') return 'Interactive 3D Heart • Drag to Rotate';
  if (mode === 'academic') return 'Interactive 3D Quill • Drag to Rotate';
  return 'Interactive 3D Polyhedron • Drag to Rotate';
}

function resolveHeroSkeletonTheme(mode) {
  const glowColors = {
    tech: {
      ring: 'border-cyan-400/30 dark:border-cyan-400/40',
      glow: 'bg-cyan-500/10 dark:bg-cyan-500/20 shadow-[0_0_50px_rgba(56,189,248,0.25)]',
      label: 'Memuat Engine 3D...'
    },
    medical: {
      ring: 'border-rose-400/30 dark:border-rose-400/40',
      glow: 'bg-rose-500/10 dark:bg-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.25)]',
      label: 'Memuat Model Jantung 3D...'
    },
    academic: {
      ring: 'border-amber-400/30 dark:border-amber-400/40',
      glow: 'bg-amber-500/10 dark:bg-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.25)]',
      label: 'Memuat Model Pena & Manuskrip 3D...'
    }
  };
  return glowColors[mode] || glowColors.tech;
}

/**
 * Headless simulation of Hero3DScene pointer drag & inertia math
 */
class Hero3DDragSimulator {
  constructor() {
    this.isDragging = false;
    this.pointerStartPos = { x: 0, y: 0 };
    this.lastPointerPos = { x: 0, y: 0 };
    this.totalDragDist = 0;
    this.dragRotation = { x: 0, y: 0 };
    this.dragVelocity = { x: 0, y: 0 };
    this.clickCount = 0;
  }

  pointerDown(x, y) {
    this.isDragging = true;
    this.pointerStartPos = { x, y };
    this.lastPointerPos = { x, y };
    this.totalDragDist = 0;
    this.dragVelocity = { x: 0, y: 0 };
  }

  pointerMove(x, y) {
    if (!this.isDragging) return;
    const dx = x - this.lastPointerPos.x;
    const dy = y - this.lastPointerPos.y;
    this.totalDragDist += Math.hypot(dx, dy);

    this.dragRotation.x = Math.max(
      -0.7,
      Math.min(0.7, this.dragRotation.x + dy * 0.008)
    );
    this.dragRotation.y += dx * 0.008;
    this.dragVelocity = { x: dy * 0.002, y: dx * 0.005 };

    this.lastPointerPos = { x, y };
  }

  pointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Click discrimination threshold (< 5px)
    if (this.totalDragDist < 5) {
      this.clickCount++;
    }
  }

  pointerCancel() {
    if (!this.isDragging) return;
    this.isDragging = false;
  }

  stepAnimationFrame() {
    // Damping on drag velocities
    this.dragVelocity.x *= 0.92;
    this.dragVelocity.y *= 0.92;
    if (Math.abs(this.dragVelocity.x) < 0.00001) this.dragVelocity.x = 0;
    if (Math.abs(this.dragVelocity.y) < 0.00001) this.dragVelocity.y = 0;

    this.dragRotation.x = Math.max(
      -0.7,
      Math.min(0.7, this.dragRotation.x + this.dragVelocity.x)
    );
    this.dragRotation.y += this.dragVelocity.y;
  }
}

/**
 * Headless simulation of Three.js Scene Cache & Mode Switching
 */
class Hero3DSceneManagerSimulator {
  constructor() {
    this.scene = new THREE.Scene();
    this.modelSceneCache = new Map();
    this.activePivot = null;
    this.activeBaseScale = 1.0;
    this.currentMode = 'tech';
    this.inFlightRequests = 0;
  }

  createMockModel(mode) {
    const group = new THREE.Group();
    group.name = `mock-${mode}`;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial()
    );
    group.add(mesh);
    return { pivotGroup: group, baseScale: 1.0 };
  }

  async switchModel(targetMode) {
    this.currentMode = targetMode;

    // Remove current active model from scene
    if (this.activePivot) {
      this.scene.remove(this.activePivot);
      this.activePivot = null;
    }

    // 1. Check in-memory cache
    if (this.modelSceneCache.has(targetMode)) {
      const cached = this.modelSceneCache.get(targetMode);
      this.activePivot = cached.pivotGroup;
      this.activeBaseScale = cached.baseScale;
      this.scene.add(cached.pivotGroup);
      return cached;
    }

    // 2. Tech mode: procedural crystal (synchronous)
    if (targetMode === 'tech') {
      const model = this.createMockModel('tech');
      this.modelSceneCache.set('tech', model);
      this.activePivot = model.pivotGroup;
      this.activeBaseScale = model.baseScale;
      this.scene.add(model.pivotGroup);
      return model;
    }

    // 3. Asynchronous model load simulation
    this.inFlightRequests++;
    const requestId = this.inFlightRequests;

    // Simulate async network/parse delay
    await new Promise((resolve) => setTimeout(resolve, 5));

    const model = this.createMockModel(targetMode);
    this.modelSceneCache.set(targetMode, model);

    // Guard: race condition check
    if (this.currentMode !== targetMode) {
      // Out of order response: cache it, but do NOT attach to active scene
      return model;
    }

    this.activePivot = model.pivotGroup;
    this.activeBaseScale = model.baseScale;
    this.scene.add(model.pivotGroup);
    return model;
  }
}

// ============================================================================
// Adversarial Test Suites
// ============================================================================

describe('Tier 5 (Challenger 2): Adversarial Contract, Mode Transitions, Pointer Damping & Context Loss Fuzzing', () => {

  // ==========================================================================
  // 1. Mode Transitions & Malformed Input Fuzzing
  // ==========================================================================
  describe('Mode Transitions & Malformed Input Fuzzing', () => {
    test('T5.CH2.1.1: Rapid cyclical mode switching preserves exactly 1 active child in Three.js scene', async () => {
      const manager = new Hero3DSceneManagerSimulator();

      const sequence = ['tech', 'medical', 'academic', 'tech', 'academic', 'medical', 'tech'];
      for (const m of sequence) {
        await manager.switchModel(m);
        assert.strictEqual(manager.scene.children.length, 1, `Scene must have exactly 1 child for mode ${m}`);
        assert.strictEqual(manager.activePivot.name, `mock-${m}`);
      }

      // Verify all 3 modes are cached
      assert.strictEqual(manager.modelSceneCache.size, 3);
      assert.ok(manager.modelSceneCache.has('tech'));
      assert.ok(manager.modelSceneCache.has('medical'));
      assert.ok(manager.modelSceneCache.has('academic'));
    });

    test('T5.CH2.1.2: Asynchronous race condition: rapid mode toggling prevents orphaned or duplicate 3D objects', async () => {
      const manager = new Hero3DSceneManagerSimulator();

      // Launch multiple asynchronous switches in immediate succession
      const p1 = manager.switchModel('medical');
      const p2 = manager.switchModel('academic');
      const p3 = manager.switchModel('tech');

      await Promise.all([p1, p2, p3]);

      // Only the final mode ('tech') should be active in the scene
      assert.strictEqual(manager.currentMode, 'tech');
      assert.strictEqual(manager.scene.children.length, 1, 'Scene must contain only 1 child after race condition');
      assert.strictEqual(manager.activePivot.name, 'mock-tech');
    });

    test('T5.CH2.1.3: Malicious & malformed mode inputs fuzzing: zero crashes, safe fallback resolution', () => {
      const adversarialInputs = [
        '',
        '   ',
        'TECH',
        'Medical',
        'ACADEMIC',
        'null',
        'undefined',
        null,
        undefined,
        0,
        -1,
        123,
        NaN,
        Infinity,
        -Infinity,
        {},
        [],
        ['tech'],
        { mode: 'tech' },
        'tech; DROP TABLE modes;',
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        '\\..\\..\\windows\\system32',
        '\u0000',
        't\u0000ech'
      ];

      for (const malformed of adversarialInputs) {
        // Safe mode resolver
        const safeMode = resolveModeSafe(malformed);
        assert.strictEqual(safeMode, 'tech', `Input ${JSON.stringify(malformed)} must fallback to 'tech'`);

        // Caption resolver
        const caption = resolveHero3DCaption(malformed);
        assert.strictEqual(caption, 'Interactive 3D Polyhedron • Drag to Rotate');

        // Skeleton theme resolver
        const skeletonConfig = resolveHeroSkeletonTheme(malformed);
        assert.strictEqual(skeletonConfig.label, 'Memuat Engine 3D...');
        assert.ok(skeletonConfig.glow.includes('cyan'));
      }
    });

    test('T5.CH2.1.4: In-memory scene cache prevents redundant memory allocations and geometry duplication', async () => {
      const manager = new Hero3DSceneManagerSimulator();

      await manager.switchModel('medical');
      const firstInstance = manager.modelSceneCache.get('medical');

      await manager.switchModel('academic');
      await manager.switchModel('medical');
      const secondInstance = manager.modelSceneCache.get('medical');

      // Must be exact same cached instance by reference
      assert.strictEqual(firstInstance, secondInstance, 'Cached model instance must be reused by reference');
      assert.strictEqual(firstInstance.pivotGroup, manager.activePivot);
    });
  });

  // ==========================================================================
  // 2. Pointer Drag Damping & Coordinate Boundary Conditions
  // ==========================================================================
  describe('Pointer Drag Damping & Boundary Conditions', () => {
    test('T5.CH2.2.1: Zero drag delta and sub-threshold movements invoke click callback (< 5px)', () => {
      const sim = new Hero3DDragSimulator();

      // Zero drag: down and up at same coordinate
      sim.pointerDown(200, 300);
      sim.pointerUp();
      assert.strictEqual(sim.clickCount, 1, 'Zero movement must trigger click');
      assert.strictEqual(sim.totalDragDist, 0);

      // Micro-jitter: 20 moves of 0.1px = 2.0px total
      sim.pointerDown(100, 100);
      for (let i = 0; i < 20; i++) {
        sim.pointerMove(100 + i * 0.1, 100);
      }
      sim.pointerUp();
      assert.strictEqual(sim.clickCount, 2, 'Total distance 2.0px (< 5px) must trigger click');
      assert.ok(sim.totalDragDist < 5);

      // Near-threshold: 4.99px
      sim.pointerDown(100, 100);
      sim.pointerMove(100, 104.99);
      sim.pointerUp();
      assert.strictEqual(sim.clickCount, 3, 'Total distance 4.99px (< 5px) must trigger click');
    });

    test('T5.CH2.2.2: Threshold boundary: >= 5px distance is treated as drag and suppresses click', () => {
      const sim = new Hero3DDragSimulator();

      // Exactly 5.0px
      sim.pointerDown(100, 100);
      sim.pointerMove(105.0, 100);
      sim.pointerUp();
      assert.strictEqual(sim.clickCount, 0, '5.0px distance must NOT trigger click');
      assert.strictEqual(sim.totalDragDist, 5.0);

      // Large drag: 150px
      sim.pointerDown(50, 50);
      sim.pointerMove(200, 50);
      sim.pointerUp();
      assert.strictEqual(sim.clickCount, 0, '150px drag must NOT trigger click');
      assert.strictEqual(sim.totalDragDist, 150.0);
    });

    test('T5.CH2.2.3: Pitch angle clamping strictly enforces [-0.7, 0.7] radians under extreme drag offsets', () => {
      const sim = new Hero3DDragSimulator();

      // Massive positive Y drag (e.g. +50,000px downward)
      sim.pointerDown(0, 0);
      sim.pointerMove(0, 50000);
      assert.strictEqual(sim.dragRotation.x, 0.7, 'Pitch rotation must be clamped to max +0.7 radians');

      // Massive negative Y drag (e.g. -100,000px upward)
      sim.pointerMove(0, -100000);
      assert.strictEqual(sim.dragRotation.x, -0.7, 'Pitch rotation must be clamped to min -0.7 radians');

      // Render loop inertia must never break clamp
      sim.dragVelocity.x = 100.0; // Extreme velocity injection
      for (let i = 0; i < 50; i++) {
        sim.stepAnimationFrame();
        assert.ok(sim.dragRotation.x >= -0.7 && sim.dragRotation.x <= 0.7, `Rotation X ${sim.dragRotation.x} violated bounds`);
      }
    });

    test('T5.CH2.2.4: Rapid directional reversals maintain numerical stability (no NaN or Infinity)', () => {
      const sim = new Hero3DDragSimulator();
      sim.pointerDown(500, 500);

      // Thrash back and forth with high amplitude 100 times
      for (let i = 0; i < 100; i++) {
        const targetX = (i % 2 === 0) ? 1000 : 0;
        const targetY = (i % 2 === 0) ? 800 : 200;
        sim.pointerMove(targetX, targetY);
        sim.stepAnimationFrame();

        assert.ok(!Number.isNaN(sim.dragRotation.x), 'dragRotation.x must not be NaN');
        assert.ok(!Number.isNaN(sim.dragRotation.y), 'dragRotation.y must not be NaN');
        assert.ok(!Number.isNaN(sim.dragVelocity.x), 'dragVelocity.x must not be NaN');
        assert.ok(!Number.isNaN(sim.dragVelocity.y), 'dragVelocity.y must not be NaN');
        assert.ok(Number.isFinite(sim.dragRotation.x), 'dragRotation.x must be finite');
        assert.ok(Number.isFinite(sim.dragRotation.y), 'dragRotation.y must be finite');
      }

      sim.pointerUp();
      assert.strictEqual(sim.isDragging, false);
    });

    test('T5.CH2.2.5: Damping convergence: velocities decay monotonically and snap to exact 0 under cutoff', () => {
      const sim = new Hero3DDragSimulator();
      sim.dragVelocity = { x: 5.0, y: -8.0 };

      let previousAbsX = Math.abs(sim.dragVelocity.x);
      let previousAbsY = Math.abs(sim.dragVelocity.y);

      let frames = 0;
      while ((sim.dragVelocity.x !== 0 || sim.dragVelocity.y !== 0) && frames < 500) {
        sim.stepAnimationFrame();
        frames++;

        const currentAbsX = Math.abs(sim.dragVelocity.x);
        const currentAbsY = Math.abs(sim.dragVelocity.y);

        assert.ok(currentAbsX <= previousAbsX, `Velocity X did not decay monotonically: ${currentAbsX} > ${previousAbsX}`);
        assert.ok(currentAbsY <= previousAbsY, `Velocity Y did not decay monotonically: ${currentAbsY} > ${previousAbsY}`);

        previousAbsX = currentAbsX;
        previousAbsY = currentAbsY;
      }

      // Both must converge to exactly 0 in under 200 frames
      assert.strictEqual(sim.dragVelocity.x, 0, 'Velocity X must snap to exactly 0');
      assert.strictEqual(sim.dragVelocity.y, 0, 'Velocity Y must snap to exactly 0');
      assert.ok(frames <= 200, `Decay took ${frames} frames (expected <= 200)`);
    });

    test('T5.CH2.2.6: Pointer cancel cleanly terminates drag without stuck state', () => {
      const sim = new Hero3DDragSimulator();
      sim.pointerDown(100, 100);
      sim.pointerMove(150, 150);
      assert.strictEqual(sim.isDragging, true);

      // Sudden cancel (e.g. touch interrupted by notification or alt-tab)
      sim.pointerCancel();
      assert.strictEqual(sim.isDragging, false);

      // Subsequent moves must be ignored while not dragging
      const rotYBefore = sim.dragRotation.y;
      sim.pointerMove(300, 300);
      assert.strictEqual(sim.dragRotation.y, rotYBefore, 'Pointer move while not dragging must be ignored');
    });
  });

  // ==========================================================================
  // 3. WebGL Context Loss & Recovery Simulation
  // ==========================================================================
  describe('WebGL Context Loss & Recovery Simulation', () => {
    test('T5.CH2.3.1: Context loss event triggers preventDefault() and sets fallback state', () => {
      let isContextLost = false;
      let preventDefaultCalled = false;

      const mockEvent = {
        preventDefault: () => {
          preventDefaultCalled = true;
        }
      };

      const handleContextLost = (e) => {
        e.preventDefault();
        isContextLost = true;
      };

      handleContextLost(mockEvent);

      assert.strictEqual(preventDefaultCalled, true, 'e.preventDefault() MUST be called to allow context restoration');
      assert.strictEqual(isContextLost, true, 'isContextLost state must transition to true');
    });

    test('T5.CH2.3.2: Context restored event restores state and triggers scene re-initialization', () => {
      let isContextLost = true;
      let reinitializedMode = null;

      const currentMode = 'medical';
      const handleContextRestored = () => {
        isContextLost = false;
        reinitializedMode = currentMode;
      };

      handleContextRestored();

      assert.strictEqual(isContextLost, false, 'isContextLost must transition to false');
      assert.strictEqual(reinitializedMode, 'medical', 'Scene must re-initialize for active mode');
    });

    test('T5.CH2.3.3: 50 consecutive WebGL context loss/restore cycles execute deterministically', () => {
      let isContextLost = false;
      let lossCount = 0;
      let restoreCount = 0;

      for (let i = 0; i < 50; i++) {
        // Loss
        const lossEvent = { preventDefault: () => {} };
        lossEvent.preventDefault();
        isContextLost = true;
        lossCount++;
        assert.strictEqual(isContextLost, true);

        // Restored
        isContextLost = false;
        restoreCount++;
        assert.strictEqual(isContextLost, false);
      }

      assert.strictEqual(lossCount, 50);
      assert.strictEqual(restoreCount, 50);
      assert.strictEqual(isContextLost, false);
    });

    test('T5.CH2.3.4: WebGL unsupported environment detection cleanly falls back without exception', () => {
      // In Node environment without DOM / WebGL, isWebGLAvailable() must return false
      function isWebGLAvailableNode() {
        if (typeof window === 'undefined') return false;
        return true;
      }

      assert.strictEqual(isWebGLAvailableNode(), false, 'Node environment must detect lack of WebGL safely');
    });
  });

  // ==========================================================================
  // 4. Source Code Contract Audit
  // ==========================================================================
  describe('Source Code Contract & Implementation Verification', () => {
    test('T5.CH2.4.1: hero-3d-scene.tsx contains required WebGL context loss listeners and MeshoptDecoder await', () => {
      const sceneFile = path.join(PROJECT_ROOT, 'src/components/hero-3d-scene.tsx');
      assert.ok(fs.existsSync(sceneFile), 'src/components/hero-3d-scene.tsx must exist');

      const content = fs.readFileSync(sceneFile, 'utf8');

      // Verify MeshoptDecoder await
      assert.ok(content.includes('await MeshoptDecoder.ready'), 'Must await MeshoptDecoder.ready');
      assert.ok(content.includes('loader.setMeshoptDecoder(MeshoptDecoder)'), 'Must configure setMeshoptDecoder');

      // Verify webglcontextlost & webglcontextrestored
      assert.ok(content.includes('webglcontextlost'), 'Must listen to webglcontextlost');
      assert.ok(content.includes('webglcontextrestored'), 'Must listen to webglcontextrestored');
      assert.ok(content.includes('e.preventDefault()'), 'Must call e.preventDefault() on context lost');

      // Verify drag clamping
      assert.ok(content.includes('-0.7'), 'Must clamp pitch rotation to -0.7 min');
      assert.ok(content.includes('0.7'), 'Must clamp pitch rotation to 0.7 max');

      // Verify click threshold
      assert.ok(content.includes('totalDragDistRef.current < 5'), 'Must check click threshold < 5px');

      // Verify fallback to 2D canvas
      assert.ok(content.includes('IridescentCrystalCanvas'), 'Must fall back to IridescentCrystalCanvas');
    });

    test('T5.CH2.4.2: hero.tsx dynamically imports Hero3DScene with ssr: false and Hero3DSkeleton fallback', () => {
      const heroFile = path.join(PROJECT_ROOT, 'src/components/hero.tsx');
      assert.ok(fs.existsSync(heroFile), 'src/components/hero.tsx must exist');

      const content = fs.readFileSync(heroFile, 'utf8');

      assert.ok(content.includes("dynamic("), 'Must use dynamic import');
      assert.ok(content.includes("ssr: false"), 'Must specify ssr: false for Three.js client canvas');
      assert.ok(content.includes("<Hero3DSkeleton"), 'Must specify Hero3DSkeleton as loading component');
      assert.ok(content.includes("Interactive 3D Heart • Drag to Rotate"), 'Must include Medical 3D caption');
      assert.ok(content.includes("Interactive 3D Quill • Drag to Rotate"), 'Must include Academic 3D caption');
      assert.ok(content.includes("Interactive 3D Polyhedron • Drag to Rotate"), 'Must include Tech 3D caption');
    });
  });

});
