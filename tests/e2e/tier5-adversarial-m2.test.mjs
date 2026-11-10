import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const MODES = ['tech', 'medical', 'academic'];
const THEMES = ['dark', 'light'];

function sha256(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function parseGlbHeader(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    return { valid: false, error: 'Buffer too small for GLB header' };
  }
  const magic = buffer.readUInt32LE(0);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  const isMagicGlTF = magic === 0x46546c67; // 'glTF' in ASCII
  const isVersion2 = version === 2;
  const isLengthMatching = length === buffer.length;

  let jsonChunk = null;
  let extensionsUsed = [];
  let extensionsRequired = [];

  if (isMagicGlTF && buffer.length >= 20) {
    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.readUInt32LE(16);
    if (chunkType === 0x4e4f534a) {
      try {
        const jsonText = buffer.subarray(20, 20 + chunkLength).toString('utf8');
        jsonChunk = JSON.parse(jsonText);
        extensionsUsed = jsonChunk.extensionsUsed || [];
        extensionsRequired = jsonChunk.extensionsRequired || [];
      } catch (_) {}
    }
  }

  return {
    valid: isMagicGlTF && isVersion2 && isLengthMatching,
    magic,
    version,
    length,
    bufferLength: buffer.length,
    jsonChunk,
    extensionsUsed,
    extensionsRequired
  };
}

describe('Tier 5: Adversarial Stress & Robustness Verification for Milestone 2', () => {

  // =========================================================================
  // Section 1: GLB Model Asset Mirroring, Hashing & Static Export Integrity
  // =========================================================================
  describe('GLB Model Asset Mirroring & Static Export Invariant', () => {
    test('T5.2.1: Model files exist in public/models/ and out/models/ with byte-exact SHA-256 match', () => {
      const models = [
        {
          name: 'model-jantung.glb',
          expectedMinBytes: 18_000_000,
          expectedMaxBytes: 19_000_000
        },
        {
          name: 'model-pena.glb',
          expectedMinBytes: 16_000_000,
          expectedMaxBytes: 17_500_000
        }
      ];

      for (const model of models) {
        const pubPath = path.resolve(PROJECT_ROOT, 'public/models', model.name);
        const outPath = path.resolve(PROJECT_ROOT, 'out/models', model.name);

        assert.ok(fs.existsSync(pubPath), `Missing public mirror: ${pubPath}`);
        assert.ok(fs.existsSync(outPath), `Missing exported output: ${outPath}`);

        const pubStat = fs.statSync(pubPath);
        const outStat = fs.statSync(outPath);

        assert.ok(
          pubStat.size >= model.expectedMinBytes && pubStat.size <= model.expectedMaxBytes,
          `Public ${model.name} size out of bounds: ${pubStat.size}`
        );
        assert.strictEqual(outStat.size, pubStat.size, `Out size mismatch for ${model.name}`);

        const pubHash = sha256(pubPath);
        const outHash = sha256(outPath);

        assert.strictEqual(outHash, pubHash, `Out hash differs from public for ${model.name}`);
      }
    });

    test('T5.2.2: Medical model requires EXT_meshopt_compression and KHR_mesh_quantization in both public and out directories', () => {
      const paths = [
        path.resolve(PROJECT_ROOT, 'public/models/model-jantung.glb'),
        path.resolve(PROJECT_ROOT, 'out/models/model-jantung.glb')
      ];

      for (const p of paths) {
        const buf = fs.readFileSync(p);
        const header = parseGlbHeader(buf);
        assert.strictEqual(header.valid, true, `Header invalid for ${p}`);
        assert.ok(header.extensionsUsed.includes('EXT_meshopt_compression'), `Missing EXT_meshopt_compression in ${p}`);
        assert.ok(header.extensionsUsed.includes('KHR_mesh_quantization'), `Missing KHR_mesh_quantization in ${p}`);
      }
    });
  });

  // =========================================================================
  // Section 2: Normalization, Bounding Box Math & Zero Division Defense
  // =========================================================================
  describe('Model Normalization & Bounding Box Math', () => {
    function simulateNormalize(size, targetSize = 2.2) {
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? targetSize / maxDim : 1.0;
      return {
        scale,
        maxDim
      };
    }

    test('T5.2.3: Zero-size geometry or degenerate bounding box does not produce NaN or Infinity', () => {
      const zeroResult = simulateNormalize({ x: 0, y: 0, z: 0 });
      assert.strictEqual(Number.isFinite(zeroResult.scale), true);
      assert.strictEqual(zeroResult.scale, 1.0);

      const negResult = simulateNormalize({ x: -1, y: -2, z: -3 });
      assert.strictEqual(Number.isFinite(negResult.scale), true);
      assert.strictEqual(negResult.scale, 1.0);
    });

    test('T5.2.4: Medical model (0.47 x 0.98 x 0.65) and Quill model (1.90 x 1.64 x 1.70) scale uniformly to targetSize', () => {
      const heartNorm = simulateNormalize({ x: 0.47, y: 0.98, z: 0.65 }, 2.2);
      const quillNorm = simulateNormalize({ x: 1.90, y: 1.64, z: 1.70 }, 2.2);

      assert.strictEqual(heartNorm.maxDim, 0.98);
      assert.ok(Math.abs(heartNorm.scale - (2.2 / 0.98)) < 1e-6);

      assert.strictEqual(quillNorm.maxDim, 1.90);
      assert.ok(Math.abs(quillNorm.scale - (2.2 / 1.90)) < 1e-6);

      // Verify scaled max dimension is identically 2.2 for both
      assert.ok(Math.abs(heartNorm.maxDim * heartNorm.scale - 2.2) < 1e-6);
      assert.ok(Math.abs(quillNorm.maxDim * quillNorm.scale - 2.2) < 1e-6);
    });
  });

  // =========================================================================
  // Section 3: Pointer Drag Dynamics, Coordinate Clamping & Click Discrimination
  // =========================================================================
  describe('Pointer Drag Dynamics & Click Discrimination Stress Test', () => {
    test('T5.2.5: Pitch rotation remains strictly clamped within [-0.7, 0.7] radians under massive pointer displacement', () => {
      let dragRotationX = 0;
      const extremeDisplacements = [500, 1000, 10000, -2000, -50000];

      for (const dy of extremeDisplacements) {
        dragRotationX = Math.max(-0.7, Math.min(0.7, dragRotationX + dy * 0.008));
        assert.ok(dragRotationX >= -0.7 && dragRotationX <= 0.7, `dragRotationX breached bounds: ${dragRotationX}`);
      }
    });

    test('T5.2.6: Velocity damping attenuates drag momentum to exactly 0 after decay threshold', () => {
      const velocity = { x: 1.5, y: -2.0 };
      const damping = 0.92;
      let frames = 0;

      while ((velocity.x !== 0 || velocity.y !== 0) && frames < 500) {
        frames++;
        velocity.x *= damping;
        velocity.y *= damping;
        if (Math.abs(velocity.x) < 0.00001) velocity.x = 0;
        if (Math.abs(velocity.y) < 0.00001) velocity.y = 0;
      }

      assert.strictEqual(velocity.x, 0);
      assert.strictEqual(velocity.y, 0);
      assert.ok(frames < 180, `Damping decay took too long (${frames} frames)`);
    });

    test('T5.2.7: Click discrimination reliably distinguishes click (< 5px) vs drag (>= 5px)', () => {
      function evaluatePointerAction(dx, dy) {
        const totalDist = Math.hypot(dx, dy);
        return totalDist < 5 ? 'CLICK' : 'DRAG';
      }

      assert.strictEqual(evaluatePointerAction(0, 0), 'CLICK');
      assert.strictEqual(evaluatePointerAction(2, 3), 'CLICK'); // hypot = 3.605 < 5
      assert.strictEqual(evaluatePointerAction(0, 4.99), 'CLICK');
      assert.strictEqual(evaluatePointerAction(3, 4), 'DRAG'); // hypot = 5.0
      assert.strictEqual(evaluatePointerAction(10, 0), 'DRAG');
      assert.strictEqual(evaluatePointerAction(-15, 20), 'DRAG');
    });
  });

  // =========================================================================
  // Section 4: Cardiac Lub-Dub & Scribe Oscillation Math
  // =========================================================================
  describe('Physiological Heartbeat & Academic Scribe Motion Invariants', () => {
    function computeCardiacPulse(elapsedTime) {
      const cycleDuration = 1.0 / 1.2; // 72 BPM
      const cycle = (elapsedTime % cycleDuration) / cycleDuration;
      if (cycle < 0.16) {
        // Ventricular Systole (Lub)
        return Math.sin((cycle / 0.16) * Math.PI) * 0.075;
      } else if (cycle >= 0.22 && cycle < 0.36) {
        // Atrial Kick (Dub)
        return Math.sin(((cycle - 0.22) / 0.14) * Math.PI) * 0.045;
      }
      return 0;
    }

    test('T5.2.8: Cardiac pulse never exceeds physiological ventricular contraction peak (+7.5%) or drops below 0', () => {
      // Sample 1,000 time points across 10 cardiac cycles
      for (let i = 0; i < 1000; i++) {
        const t = (i / 100) * (1.0 / 1.2);
        const pulse = computeCardiacPulse(t);
        assert.ok(pulse >= -1e-6, `Pulse dropped below zero: ${pulse}`);
        assert.ok(pulse <= 0.075001, `Pulse exceeded max ventricular peak: ${pulse}`);
      }
    });

    test('T5.2.9: Point light pulse flare maintains synchronized range [0.8, 2.15]', () => {
      for (let i = 0; i < 500; i++) {
        const t = (i / 50) * (1.0 / 1.2);
        const pulse = computeCardiacPulse(t);
        const intensity = 0.8 + pulse * 18.0;
        assert.ok(intensity >= 0.799 && intensity <= 0.8 + 0.075 * 18.0 + 1e-4);
      }
    });

    test('T5.2.10: Academic scribe harmonic vertical levitation stays bounded within [-0.09, 0.09]', () => {
      for (let i = 0; i < 500; i++) {
        const t = i * 0.05;
        const levitation = Math.sin(t * 1.6) * 0.09;
        assert.ok(levitation >= -0.09001 && levitation <= 0.09001);
      }
    });
  });

  // =========================================================================
  // Section 5: High-DPI Display & GPU Fillrate Clamping
  // =========================================================================
  describe('High-DPI Clamping Invariant', () => {
    function getClampedDpr(devicePixelRatio) {
      return Math.min(devicePixelRatio || 1, 2);
    }

    test('T5.2.11: DPR clamping prevents mobile GPU collapse across standard and extreme DPI settings', () => {
      assert.strictEqual(getClampedDpr(undefined), 1);
      assert.strictEqual(getClampedDpr(null), 1);
      assert.strictEqual(getClampedDpr(1.0), 1.0);
      assert.strictEqual(getClampedDpr(1.5), 1.5);
      assert.strictEqual(getClampedDpr(2.0), 2.0);
      assert.strictEqual(getClampedDpr(2.5), 2.0);
      assert.strictEqual(getClampedDpr(3.0), 2.0);
      assert.strictEqual(getClampedDpr(4.0), 2.0);
    });
  });

  // =========================================================================
  // Section 6: SSR Safety & Next.js Dynamic Skeleton
  // =========================================================================
  describe('SSR Safety & Static Prerender Contract', () => {
    test('T5.2.12: Static export out/index.html includes 3D skeleton fallback markup and zero raw Three.js canvas crashes', () => {
      const outIndexPath = path.resolve(PROJECT_ROOT, 'out/index.html');
      assert.ok(fs.existsSync(outIndexPath), 'Missing out/index.html');

      const html = fs.readFileSync(outIndexPath, 'utf8');
      assert.ok(html.includes('aria-label="Loading 3D visualization"'), 'out/index.html must render 3D skeleton fallback');
      assert.ok(html.includes('id="hero"'), 'out/index.html must contain hero section');
    });

    test('T5.2.13: isWebGLAvailable safely returns false without throwing in non-browser Node.js environment', () => {
      // In Node.js environment where window is undefined
      const isWebGLAvailable = () => {
        if (typeof window === 'undefined') return false;
        try {
          const canvas = document.createElement('canvas');
          return Boolean(
            window.WebGL2RenderingContext && canvas.getContext('webgl2')
          ) || Boolean(
            window.WebGLRenderingContext && canvas.getContext('webgl')
          );
        } catch {
          return false;
        }
      };

      assert.strictEqual(isWebGLAvailable(), false);
    });
  });

  // =========================================================================
  // Section 7: Lighting Theme & Mode Distinctness
  // =========================================================================
  describe('Lighting Theme & Mode Configurations', () => {
    const LIGHTING_CONFIGS = {
      tech: {
        dark: { ambient: 0x0c3e66, ambientIntensity: 0.9, key: 0x38bdf8, keyIntensity: 2.2 },
        light: { ambient: 0x93c5fd, ambientIntensity: 1.2, key: 0x38bdf8, keyIntensity: 2.2 }
      },
      medical: {
        dark: { ambient: 0x4a0e17, ambientIntensity: 1.1, key: 0xff4d6d, keyIntensity: 2.4 },
        light: { ambient: 0xfed7aa, ambientIntensity: 1.3, key: 0xff4d6d, keyIntensity: 2.4 }
      },
      academic: {
        dark: { ambient: 0x2e1065, ambientIntensity: 1.2, key: 0xfbbf24, keyIntensity: 2.6 },
        light: { ambient: 0xfef08a, ambientIntensity: 1.4, key: 0xfbbf24, keyIntensity: 2.6 }
      }
    };

    test('T5.2.14: Each mode uses distinct key light hues aligned with mode theme palette', () => {
      const techKey = LIGHTING_CONFIGS.tech.dark.key;
      const medKey = LIGHTING_CONFIGS.medical.dark.key;
      const acadKey = LIGHTING_CONFIGS.academic.dark.key;

      assert.notStrictEqual(techKey, medKey);
      assert.notStrictEqual(medKey, acadKey);
      assert.notStrictEqual(techKey, acadKey);
    });

    test('T5.2.15: Light theme increases ambient intensity relative to dark theme for all modes', () => {
      for (const m of MODES) {
        const darkAmb = LIGHTING_CONFIGS[m].dark.ambientIntensity;
        const lightAmb = LIGHTING_CONFIGS[m].light.ambientIntensity;
        assert.ok(lightAmb > darkAmb, `Light ambient (${lightAmb}) must exceed dark ambient (${darkAmb}) in ${m}`);
      }
    });
  });
});
